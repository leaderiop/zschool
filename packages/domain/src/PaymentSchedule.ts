import { CurrentSubject } from "@qadi/core/CurrentSubject"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { findFeeItems, findFeeScheduleForLevel } from "./FeeSchedule.ts"
import { ensureFinancialAccount } from "./FinancialAccount.ts"
import { InstallmentAdjustmentId, InstallmentId, SchoolId } from "./Ids.ts"
import { optionalOnUpdate } from "./ModelVariants.ts"
import { authorizedFinance, EntityNotFoundError, requireOwnedRow } from "./Ownership.ts"

export { EntityNotFoundError }

export const INSTALLMENT_STATUSES = ["due", "partially_paid", "paid", "overdue"] as const

export type InstallmentStatus = (typeof INSTALLMENT_STATUSES)[number]

export class NoFeeScheduleError extends Schema.TaggedError<NoFeeScheduleError>()("NoFeeScheduleError", {
  schoolId: Schema.String,
  academicYearId: Schema.String,
  levelId: Schema.String,
  trackId: Schema.NullOr(Schema.String)
}) {}

export class NoAdjustmentSpecifiedError
  extends Schema.TaggedError<NoAdjustmentSpecifiedError>()("NoAdjustmentSpecifiedError", {
    installmentId: Schema.String
  })
{}

/**
 * `Model.Class` for `installments` (ticket #57, migration 0016). Unlike
 * `FinancialGuardianDesignation` (migration 0015), this row genuinely
 * mutates in place — `amount_mad`/`due_date`/`status` all go through
 * `optionalOnUpdate` for `adjustInstallment`'s partial-update shape, the same
 * reasoning as `SubjectLevelConfig`'s own mutable columns.
 */
export class Installment extends Model.Class<Installment>("Installment")({
  id: Model.Field({ select: InstallmentId, update: InstallmentId, json: InstallmentId, jsonUpdate: InstallmentId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  financial_account_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  fee_item_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  amount_mad: optionalOnUpdate(Schema.FiniteFromString),
  due_date: optionalOnUpdate(Schema.String),
  // No command in this ticket transitions status (that's payment collection,
  // ticket #59) — `GeneratedByDb`, matching `Class.is_active`'s reasoning:
  // read-only through this Model, defaulting to `'due'` at the DB level,
  // updatable later via a raw `UPDATE` the same way `deactivateClass` flips
  // `is_active`.
  status: Model.GeneratedByDb(Schema.Literals(INSTALLMENT_STATUSES)),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/** Insert-only trace of a manual adjustment (migration 0016) — `previous_*`/`new_*` are nullable only because a caller may adjust just the amount or just the due date, never both, from this file's perspective (`adjustInstallment` always fills both `new_*` regardless, but `previous_*` mirrors whatever the row held before). */
export class InstallmentAdjustment extends Model.Class<InstallmentAdjustment>("InstallmentAdjustment")({
  id: Model.Field({
    select: InstallmentAdjustmentId,
    update: InstallmentAdjustmentId,
    json: InstallmentAdjustmentId,
    jsonUpdate: InstallmentAdjustmentId
  }),
  school_id: SchoolId,
  installment_id: Schema.String,
  previous_amount_mad: Schema.NullOr(Schema.FiniteFromString),
  new_amount_mad: Schema.NullOr(Schema.FiniteFromString),
  previous_due_date: Schema.NullOr(Schema.String),
  new_due_date: Schema.NullOr(Schema.String),
  reason: Schema.String,
  actor_subject_id: Schema.String,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

const installmentRepo = SqlModel.makeRepository(Installment, {
  tableName: "installments",
  spanPrefix: "PaymentSchedule",
  idColumn: "id"
})

const installmentAdjustmentRepo = SqlModel.makeRepository(InstallmentAdjustment, {
  tableName: "installment_adjustments",
  spanPrefix: "PaymentSchedule",
  idColumn: "id"
})

interface Occurrence {
  readonly dueDate: string
  readonly amountMad: number
}

/** A period an occurrence covers, as an absolute (year*12 + (month-1)) month index range — arithmetic on plain month numbers can't express a period spanning a year boundary (e.g. the Dec-Feb quarter) correctly, so every date computation below goes through this and `fromAbsoluteMonth`. */
const toAbsoluteMonth = (year: number, month: number): number => year * 12 + (month - 1)

const fromAbsoluteMonth = (absolute: number): { readonly year: number; readonly month: number } => ({
  year: Math.floor(absolute / 12),
  month: (absolute % 12) + 1
})

const daysInMonth = (year: number, month: number): number => new Date(Date.UTC(year, month, 0)).getUTCDate()

const isoDate = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`

const daysBetween = (fromIso: string, toIso: string): number =>
  Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000)

interface Period {
  /** Absolute month index (`toAbsoluteMonth`) of the period's first month. */
  readonly startAbsoluteMonth: number
  /** How many consecutive months this one occurrence covers. */
  readonly lengthInMonths: number
}

/**
 * The occurrence periods a cadence produces across the 10-month (September
 * through June) school year — `monthly` is 10 one-month periods; `quarterly`
 * is 3 three-month periods (Sept-Nov, Dec-Feb, Mar-May) plus a final
 * one-month period (June), since a 10-month year doesn't divide evenly into
 * four equal calendar quarters.
 */
const schedulePeriods = (frequency: "monthly" | "quarterly", startYear: number): ReadonlyArray<Period> => {
  const septAbsoluteMonth = toAbsoluteMonth(startYear, 9)
  if (frequency === "monthly") {
    return Array.from({ length: 10 }, (_, i) => ({ startAbsoluteMonth: septAbsoluteMonth + i, lengthInMonths: 1 }))
  }
  return [
    { startAbsoluteMonth: septAbsoluteMonth, lengthInMonths: 3 },
    { startAbsoluteMonth: septAbsoluteMonth + 3, lengthInMonths: 3 },
    { startAbsoluteMonth: septAbsoluteMonth + 6, lengthInMonths: 3 },
    { startAbsoluteMonth: septAbsoluteMonth + 9, lengthInMonths: 1 }
  ]
}

/**
 * BEH-ZS-153: the occurrence dates and amounts one fee line produces —
 * `frequency` (ticket #55) IS the cadence ("monthly over 10 months,
 * quarterly, or annual") this ticket's own acceptance criteria describe,
 * rather than a second, possibly-conflicting cadence field on `FeeSchedule`.
 * Only the first included occurrence can ever be prorated (`prorate`):
 * a mid-year arrival only ever starts partway through ONE period, never a
 * later one. A `quarterly` occurrence's own period spans every month it
 * actually covers (BEH-153's "started month due in full" — or, when
 * prorated, the fraction of the WHOLE covered period remaining — not just
 * its first calendar month): both the past-period skip check and the
 * proration fraction are computed against the period's full span.
 */
export const computeOccurrences = (input: {
  readonly frequency: "one_time" | "monthly" | "quarterly" | "annual"
  readonly amountMad: number
  readonly startYear: number
  readonly effectiveDate: string
  readonly prorate: boolean
}): ReadonlyArray<Occurrence> => {
  if (input.frequency === "one_time" || input.frequency === "annual") {
    return [{ dueDate: input.effectiveDate, amountMad: input.amountMad }]
  }

  const occurrences: Array<Occurrence> = []
  let proratedYet = false
  for (const period of schedulePeriods(input.frequency, input.startYear)) {
    const { month: startMonth, year: startMonthYear } = fromAbsoluteMonth(period.startAbsoluteMonth)
    const periodStart = isoDate(startMonthYear, startMonth, 1)

    const endAbsoluteMonth = period.startAbsoluteMonth + period.lengthInMonths - 1
    const { month: endMonth, year: endMonthYear } = fromAbsoluteMonth(endAbsoluteMonth)
    const periodEnd = isoDate(endMonthYear, endMonth, daysInMonth(endMonthYear, endMonth))
    if (periodEnd < input.effectiveDate) continue // this occurrence's whole period is already in the past

    if (!proratedYet && input.prorate && input.effectiveDate > periodStart) {
      let totalDays = 0
      for (let abs = period.startAbsoluteMonth; abs <= endAbsoluteMonth; abs++) {
        const { month, year } = fromAbsoluteMonth(abs)
        totalDays += daysInMonth(year, month)
      }
      const remainingDays = totalDays - daysBetween(periodStart, input.effectiveDate)
      occurrences.push({
        dueDate: input.effectiveDate,
        amountMad: Math.round((input.amountMad * remainingDays / totalDays) * 100) / 100
      })
    } else {
      occurrences.push({ dueDate: periodStart, amountMad: input.amountMad })
    }
    proratedYet = true
  }
  return occurrences
}

/**
 * The core of `generatePaymentSchedule` below, taking an already-resolved
 * `financialAccountId` — split out so `Enrollment.ts`'s `insertEnrollment`,
 * which has already called `ensureFinancialAccount` itself moments earlier,
 * doesn't pay for a second redundant insert-attempt-then-reselect round
 * trip for the exact same account on every single enrollment.
 */
const generateOccurrencesForAccount = Effect.fn("PaymentSchedule.generateOccurrencesForAccount")(function*(
  schoolId: string,
  enrollmentId: string,
  financialAccountId: string
) {
  const sql = yield* SqlClient
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)

  const enrollment = yield* requireOwnedRow(
    sql,
    "enrollments",
    "enrollment",
    enrollmentId,
    validSchoolId,
    Schema.Struct({
      class_id: Schema.String,
      academic_year_id: Schema.String,
      academic_year_label: Schema.String,
      effective_date: Schema.String
    }),
    "class_id, academic_year_id, academic_year_label, effective_date"
  )
  const cls = yield* requireOwnedRow(
    sql,
    "classes",
    "class",
    enrollment.class_id,
    validSchoolId,
    Schema.Struct({ level_id: Schema.String, track_id: Schema.NullOr(Schema.String) }),
    "level_id, track_id"
  )

  const feeScheduleOption = yield* findFeeScheduleForLevel(
    schoolId,
    enrollment.academic_year_id,
    cls.level_id,
    cls.track_id
  )
  if (Option.isNone(feeScheduleOption)) {
    return yield* Effect.fail(
      new NoFeeScheduleError({
        schoolId,
        academicYearId: enrollment.academic_year_id,
        levelId: cls.level_id,
        trackId: cls.track_id
      })
    )
  }
  const feeSchedule = feeScheduleOption.value

  const feeItems = yield* findFeeItems(schoolId, feeSchedule.id)
  const startYear = Number(enrollment.academic_year_label.slice(0, 4))

  const repo = yield* installmentRepo
  const created: Array<Installment> = []
  for (const item of feeItems) {
    const occurrences = computeOccurrences({
      frequency: item.frequency,
      amountMad: item.amount_mad,
      startYear,
      effectiveDate: enrollment.effective_date,
      prorate: feeSchedule.prorate_partial_month
    })
    for (const occurrence of occurrences) {
      const result = yield* Effect.result(sql.withTransaction(repo.insert({
        school_id: validSchoolId,
        financial_account_id: financialAccountId,
        fee_item_id: item.id,
        amount_mad: occurrence.amountMad,
        due_date: occurrence.dueDate
      })))
      if (Result.isSuccess(result)) {
        created.push(result.success)
        continue
      }
      // Same "insert-catch-unique-then-reselect, re-fail if reselect finds
      // nothing" idiom as `FinancialAccount.ts`'s `ensureFinancialAccount`:
      // a unique-violation on retry is expected and silently skipped, but
      // any OTHER failure (a dropped connection, a stale `fee_item_id`) must
      // still surface rather than being absorbed as if generation succeeded.
      const existing = yield* SqlSchema.findOneOption({
        Request: Schema.Struct({ financialAccountId: Schema.String, feeItemId: Schema.String, dueDate: Schema.String }),
        Result: Installment,
        execute: (req) =>
          sql`
            SELECT * FROM installments
            WHERE financial_account_id = ${req.financialAccountId} AND fee_item_id = ${req.feeItemId}
              AND due_date = ${req.dueDate}
          `
      })({ financialAccountId, feeItemId: item.id, dueDate: occurrence.dueDate })
      if (Option.isNone(existing)) {
        return yield* Effect.fail(result.failure)
      }
    }
  }
  return created
})

/**
 * BEH-ZS-153: generates the enrollment's payment schedule from the fee
 * schedule applicable to its (level, track) — a no-op, not a failure, when
 * none has been defined yet (`Enrollment.ts`'s `insertEnrollment` calls this
 * best-effort, and financial setup routinely lags behind admissions at a
 * newly-onboarding school). Deliberately without its own `authorized`/
 * `withSchool` wrapping — same reasoning as `ensureFinancialAccount`, which
 * this function itself calls.
 */
export const generatePaymentSchedule = Effect.fn("PaymentSchedule.generatePaymentSchedule")(function*(
  schoolId: string,
  enrollmentId: string
) {
  const financialAccountId = yield* ensureFinancialAccount(schoolId, enrollmentId)
  return yield* generateOccurrencesForAccount(schoolId, enrollmentId, financialAccountId)
})

/**
 * `Enrollment.ts`'s own best-effort call — reuses the `financialAccountId`
 * `insertEnrollment` already resolved via its own `ensureFinancialAccount`
 * call moments earlier, instead of `generatePaymentSchedule` resolving it
 * again from scratch.
 */
export const generatePaymentScheduleForAccount = generateOccurrencesForAccount

/** Public, explicitly-authorized entry point for (re-)triggering generation — `Enrollment.ts`'s own call is best-effort and unauthorized (already inside an authorized enrollment-creation flow); this one is for a director invoking it directly, e.g. after defining a fee schedule that didn't exist yet at enrollment time. */
export const triggerPaymentScheduleGeneration = Effect.fn("PaymentSchedule.triggerPaymentScheduleGeneration")(
  function*(schoolId: string, enrollmentId: string) {
    const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
    return yield* authorizedFinance(validSchoolId, withSchool(schoolId, generatePaymentSchedule(schoolId, enrollmentId)))
  }
)

export interface AdjustInstallmentInput {
  readonly amountMad?: number
  readonly dueDate?: string
  readonly reason: string
}

/** BEH-ZS-153: "manual adjustment MUST be possible with author and reason traced." At least one of `amountMad`/`dueDate` must actually change something — the reason alone doesn't justify a no-op adjustment row. */
export const adjustInstallment = Effect.fn("PaymentSchedule.adjustInstallment")(function*(
  rawSchoolId: string,
  installmentId: string,
  input: AdjustInstallmentInput
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizedFinance(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        // Validated inside the `authorizedFinance` gate, not before it —
        // matching `FinancialAccount.ts`'s `splitFinancialResponsibility`.
        if (input.amountMad === undefined && input.dueDate === undefined) {
          return yield* Effect.fail(new NoAdjustmentSpecifiedError({ installmentId }))
        }

        const sql = yield* SqlClient
        const before = yield* requireOwnedRow(
          sql,
          "installments",
          "installment",
          installmentId,
          schoolId,
          Schema.Struct({ amount_mad: Schema.FiniteFromString, due_date: Schema.String }),
          "amount_mad, due_date"
        )

        const validInstallmentId = yield* Schema.decodeEffect(InstallmentId)(installmentId)
        const newAmountMad = input.amountMad ?? before.amount_mad
        const newDueDate = input.dueDate ?? before.due_date

        const repo = yield* installmentRepo
        yield* repo.update({
          id: validInstallmentId,
          amount_mad: newAmountMad,
          due_date: newDueDate
        })

        const subject = yield* CurrentSubject
        const adjustmentRepo = yield* installmentAdjustmentRepo
        yield* adjustmentRepo.insert({
          school_id: schoolId,
          installment_id: installmentId,
          previous_amount_mad: before.amount_mad,
          new_amount_mad: newAmountMad,
          previous_due_date: before.due_date,
          new_due_date: newDueDate,
          reason: input.reason,
          actor_subject_id: subject.id
        })
      })
    )
  )
})

/** The installments generated for one enrollment, joined through its `FinancialAccount`. */
export const findInstallments = Effect.fn("PaymentSchedule.findInstallments")(function*(
  schoolId: string,
  enrollmentId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String, enrollmentId: Schema.String }),
        Result: Installment,
        execute: (req) =>
          sql`
            SELECT i.* FROM installments i
            JOIN financial_accounts a ON a.id = i.financial_account_id
            WHERE a.school_id = ${req.schoolId} AND a.enrollment_id = ${req.enrollmentId}
            ORDER BY i.due_date ASC
          `
      })({ schoolId, enrollmentId })
    })
  )
})
