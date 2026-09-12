import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { FEE_NATURES, type FeeNature } from "./FeeNatures.ts"
import { ensureFinancialAccount } from "./FinancialAccount.ts"
import { SchoolId, SiblingDiscountLineId, SiblingDiscountPolicyId, SiblingDiscountRecomputationId } from "./Ids.ts"
import { authorizedFinance, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

export { EntityNotFoundError }

export const SIBLING_DISCOUNT_TRIGGERS = ["sibling_activated", "sibling_closed"] as const

export type SiblingDiscountTrigger = (typeof SIBLING_DISCOUNT_TRIGGERS)[number]

export class InvalidDiscountPolicyError
  extends Schema.TaggedError<InvalidDiscountPolicyError>()("InvalidDiscountPolicyError", {
    reason: Schema.String
  })
{}

/**
 * `Model.Class` for `sibling_discount_policies` (ticket #58, migration 0017)
 * — at most one row per (school, year), reconfigured in place rather than
 * versioned (`ADR-ZS-105`'s per-year snapshot still applies to the SCOPE the
 * policy is keyed to, not to how corrections are recorded).
 */
export class SiblingDiscountPolicy extends Model.Class<SiblingDiscountPolicy>("SiblingDiscountPolicy")({
  id: Model.Field({
    select: SiblingDiscountPolicyId,
    update: SiblingDiscountPolicyId,
    json: SiblingDiscountPolicyId,
    jsonUpdate: SiblingDiscountPolicyId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  academic_year_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  discount_type: Schema.Literals(["percentage", "flat_amount"]),
  discount_value: Schema.FiniteFromString,
  applies_to_natures: Schema.Array(Schema.Literals(FEE_NATURES)),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/**
 * `Model.Class` for `sibling_discount_lines` (migration 0017) — CURRENT
 * STATE, one row per currently-discounted installment, fully reconciled
 * (deleted and re-inserted) on every `recomputeSiblingDiscounts` call rather
 * than mutated in place. Never folded into `Installment.amount_mad` itself —
 * `fr-fin-04`'s "as a distinct line ... referenced" acceptance criterion is
 * satisfied by this row's own existence, joined against `installments` by a
 * caller.
 */
export class SiblingDiscountLine extends Model.Class<SiblingDiscountLine>("SiblingDiscountLine")({
  id: Model.Field({
    select: SiblingDiscountLineId,
    update: SiblingDiscountLineId,
    json: SiblingDiscountLineId,
    jsonUpdate: SiblingDiscountLineId
  }),
  school_id: SchoolId,
  financial_account_id: Schema.String,
  installment_id: Schema.String,
  sibling_discount_policy_id: Schema.String,
  amount_mad: Schema.FiniteFromString,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/** Insert-only trace of a recompute pass that actually changed something — `fr-fin-04`'s "with the recomputation traced." Same current-state-table-plus-dedicated-trace split as `FinancialGuardianDesignation`/`InstallmentAdjustment`. */
export class SiblingDiscountRecomputation
  extends Model.Class<SiblingDiscountRecomputation>("SiblingDiscountRecomputation")({
    id: Model.Field({
      select: SiblingDiscountRecomputationId,
      update: SiblingDiscountRecomputationId,
      json: SiblingDiscountRecomputationId,
      jsonUpdate: SiblingDiscountRecomputationId
    }),
    school_id: SchoolId,
    financial_account_id: Schema.String,
    trigger_reason: Schema.Literals(SIBLING_DISCOUNT_TRIGGERS),
    installments_added: Schema.Int,
    installments_removed: Schema.Int,
    created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
  })
{}

export class ConfigureSiblingDiscountPolicyCommand
  extends Schema.Class<ConfigureSiblingDiscountPolicyCommand>("ConfigureSiblingDiscountPolicyCommand")({
    schoolId: SchoolId,
    academicYearId: Schema.String,
    discountType: Schema.Literals(["percentage", "flat_amount"]),
    // A money/rate field must never decode NaN/Infinity — `Schema.Finite`.
    discountValue: Schema.Finite,
    appliesToNatures: Schema.Array(Schema.Literals(FEE_NATURES))
  })
{}

const siblingDiscountPolicyRepo = SqlModel.makeRepository(SiblingDiscountPolicy, {
  tableName: "sibling_discount_policies",
  spanPrefix: "SiblingDiscount",
  idColumn: "id"
})

const siblingDiscountLineRepo = SqlModel.makeRepository(SiblingDiscountLine, {
  tableName: "sibling_discount_lines",
  spanPrefix: "SiblingDiscount",
  idColumn: "id"
})

const siblingDiscountRecomputationRepo = SqlModel.makeRepository(SiblingDiscountRecomputation, {
  tableName: "sibling_discount_recomputations",
  spanPrefix: "SiblingDiscount",
  idColumn: "id"
})

/**
 * BEH-ZS-154: the discount amount ONE installment earns under a policy —
 * pure and DB-free (`ADR-ZS-088`'s "compute in an `Effect`/plain function,
 * unit-test directly" precedent, `computeOccurrences`'s own reasoning).
 * Capped at the installment's own amount so a flat-amount discount larger
 * than a small (e.g. prorated) installment can never flip the net amount
 * owed negative.
 */
export const computeSiblingDiscountAmount = (input: {
  readonly discountType: "percentage" | "flat_amount"
  readonly discountValue: number
  readonly installmentAmountMad: number
}): number => {
  const raw = input.discountType === "percentage"
    ? (input.installmentAmountMad * input.discountValue) / 100
    : input.discountValue
  return Math.round(Math.min(raw, input.installmentAmountMad) * 100) / 100
}

/**
 * BEH-ZS-154: configures (or reconfigures — a later call overwrites the
 * existing row rather than duplicating it) the school's sibling-discount
 * policy for one academic year.
 */
export const configureSiblingDiscountPolicy = Effect.fn("SiblingDiscount.configureSiblingDiscountPolicy")(
  function*(rawCommand: (typeof ConfigureSiblingDiscountPolicyCommand)["Encoded"]) {
    const command = yield* Schema.decodeEffect(ConfigureSiblingDiscountPolicyCommand)(rawCommand)
    return yield* authorizedFinance(
      command.schoolId,
      withSchool(
        command.schoolId,
        Effect.gen(function*() {
          // Validated inside the `authorizedFinance` gate, not before it —
          // matching `FinancialAccount.ts`/`PaymentSchedule.ts`'s own
          // business-rule validations in this same capability.
          if (command.discountType === "percentage" && (command.discountValue <= 0 || command.discountValue > 100)) {
            return yield* Effect.fail(
              new InvalidDiscountPolicyError({ reason: "a percentage discount must be greater than 0 and at most 100" })
            )
          }
          if (command.discountType === "flat_amount" && command.discountValue <= 0) {
            return yield* Effect.fail(
              new InvalidDiscountPolicyError({ reason: "a flat-amount discount must be greater than 0" })
            )
          }
          if (command.appliesToNatures.length === 0) {
            return yield* Effect.fail(
              new InvalidDiscountPolicyError({ reason: "at least one fee-line nature must be selected" })
            )
          }

          const sql = yield* SqlClient
          yield* requireOwnedRow(sql, "academic_years", "academic_year", command.academicYearId, command.schoolId, RowWithId)

          const repo = yield* siblingDiscountPolicyRepo
          // A savepoint (via `withTransaction`, nested inside the caller's
          // own transaction) — same reasoning as `FinancialAccount.ts`'s
          // `ensureFinancialAccount`: catching the unique-violation below
          // doesn't itself undo Postgres's "transaction is aborted" state on
          // a plain caught error, which would otherwise poison the reselect
          // just below it.
          const inserted = yield* Effect.result(sql.withTransaction(repo.insert({
            school_id: command.schoolId,
            academic_year_id: command.academicYearId,
            discount_type: command.discountType,
            discount_value: command.discountValue,
            applies_to_natures: command.appliesToNatures
          })))
          if (Result.isSuccess(inserted)) return inserted.success.id

          // Unique-violation on (school_id, academic_year_id): a policy
          // already exists for this year — reconfigure it in place rather
          // than duplicating, matching migration 0017's own "at most one row
          // per year" comment. Same insert-catch-unique-then-reselect idiom
          // as `FinancialAccount.ts`'s `ensureFinancialAccount`, except the
          // reselect result is UPDATED rather than reused as-is.
          const existing = yield* SqlSchema.findOneOption({
            Request: Schema.Struct({ schoolId: Schema.String, academicYearId: Schema.String }),
            Result: SiblingDiscountPolicy,
            execute: (req) =>
              sql`
                SELECT * FROM sibling_discount_policies
                WHERE school_id = ${req.schoolId} AND academic_year_id = ${req.academicYearId}
              `
          })({ schoolId: command.schoolId, academicYearId: command.academicYearId })
          if (Option.isNone(existing)) {
            return yield* Effect.fail(inserted.failure)
          }
          const validId = yield* Schema.decodeEffect(SiblingDiscountPolicyId)(existing.value.id)
          const updated = yield* repo.update({
            id: validId,
            discount_type: command.discountType,
            discount_value: command.discountValue,
            applies_to_natures: command.appliesToNatures
          })
          return updated.id
        })
      )
    )
  }
)

/** The policy configured for one (school, year), if any. */
export const findSiblingDiscountPolicy = Effect.fn("SiblingDiscount.findSiblingDiscountPolicy")(function*(
  schoolId: string,
  academicYearId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findOneOption({
        Request: Schema.Struct({ schoolId: Schema.String, academicYearId: Schema.String }),
        Result: SiblingDiscountPolicy,
        execute: (req) =>
          sql`SELECT * FROM sibling_discount_policies WHERE school_id = ${req.schoolId} AND academic_year_id = ${req.academicYearId}`
      })({ schoolId, academicYearId })
    })
  )
})

/**
 * Reconciles ONE financial account's discount lines against the installments
 * it should currently hold a line for — a full diff-and-reconcile (delete
 * whatever no longer belongs, insert whatever's missing) rather than an
 * append-only or insert-catch-unique shape, since this function's whole
 * purpose is to recompute a account's discount lines FROM SCRATCH on every
 * call, not to retry a single idempotent write.
 */
const reconcileDiscountLines = Effect.fn("SiblingDiscount.reconcileDiscountLines")(function*(
  schoolId: SchoolId,
  financialAccountId: string,
  eligiblePolicy: SiblingDiscountPolicy | undefined
) {
  const sql = yield* SqlClient

  const currentLines = yield* sql<{ id: string; installment_id: string; amount_mad: string }>`
    SELECT id, installment_id, amount_mad::text AS amount_mad
    FROM sibling_discount_lines WHERE financial_account_id = ${financialAccountId}
  `
  const currentByInstallment = new Map(currentLines.map((line) => [line.installment_id, line]))

  const desiredByInstallment = new Map<string, number>()
  if (eligiblePolicy !== undefined) {
    // Only installments not yet settled (`due`/`overdue`) are ever
    // discounted — a `paid`/`partially_paid` installment's collected amount
    // is never retroactively altered by a later sibling-count change.
    const eligibleRows = yield* sql<{ id: string; amount_mad: string }>`
      SELECT i.id, i.amount_mad::text AS amount_mad FROM installments i
      JOIN fee_items f ON f.id = i.fee_item_id
      WHERE i.financial_account_id = ${financialAccountId}
        AND i.status IN ('due', 'overdue')
        AND f.nature = ANY(${eligiblePolicy.applies_to_natures as Array<FeeNature>})
    `
    for (const row of eligibleRows) {
      desiredByInstallment.set(
        row.id,
        computeSiblingDiscountAmount({
          discountType: eligiblePolicy.discount_type,
          discountValue: eligiblePolicy.discount_value,
          installmentAmountMad: Number(row.amount_mad)
        })
      )
    }
  }

  const toDeleteLineIds: Array<string> = []
  for (const [installmentId, line] of currentByInstallment) {
    const desired = desiredByInstallment.get(installmentId)
    if (desired === undefined || Math.abs(desired - Number(line.amount_mad)) > 0.005) {
      toDeleteLineIds.push(line.id)
    }
  }
  const toInsert: Array<{ readonly installmentId: string; readonly amountMad: number }> = []
  for (const [installmentId, amountMad] of desiredByInstallment) {
    const current = currentByInstallment.get(installmentId)
    if (current === undefined || Math.abs(amountMad - Number(current.amount_mad)) > 0.005) {
      toInsert.push({ installmentId, amountMad })
    }
  }

  if (toDeleteLineIds.length === 0 && toInsert.length === 0) {
    return { added: 0, removed: 0 }
  }

  const repo = yield* siblingDiscountLineRepo
  yield* sql.withTransaction(
    Effect.gen(function*() {
      if (toDeleteLineIds.length > 0) {
        yield* sql`DELETE FROM sibling_discount_lines WHERE id = ANY(${toDeleteLineIds}::uuid[])`
      }
      for (const entry of toInsert) {
        yield* repo.insert({
          school_id: schoolId,
          financial_account_id: financialAccountId,
          installment_id: entry.installmentId,
          // `toInsert` is only ever populated from `desiredByInstallment`,
          // which is only ever populated when `eligiblePolicy` is defined.
          sibling_discount_policy_id: eligiblePolicy!.id,
          amount_mad: entry.amountMad
        })
      }
    })
  )

  return { added: toInsert.length, removed: toDeleteLineIds.length }
})

/**
 * BEH-ZS-154 (`fr-fin-04-sibling-discount.feature`): recomputes the sibling
 * discount for every member of `studentPersonId`'s sibling group (anyone
 * sharing at least one guardian, per `parent_student_relationships`) who
 * holds an ACTIVE enrollment at THIS school in THIS year — the earliest to
 * have become active keeps the full rate; every other active sibling is
 * discounted, per policy. A full reconciliation pass on every call, so it's
 * safe to call redundantly (e.g. once per sibling in a group, from either
 * side of an activation/closure) without double-applying anything.
 *
 * Deliberately without its own `authorized`/`withSchool` wrapping —
 * `Enrollment.ts`'s `insertEnrollment`/`closeEnrollment` call this directly,
 * inside their own already-open, already-authorized scope, the same
 * reasoning `ensureFinancialAccount`/`generatePaymentScheduleForAccount`
 * give for their own lack of wrapping.
 */
export const recomputeSiblingDiscounts = Effect.fn("SiblingDiscount.recomputeSiblingDiscounts")(function*(
  schoolId: string,
  academicYearId: string,
  studentPersonId: string,
  triggerReason: SiblingDiscountTrigger
) {
  const sql = yield* SqlClient
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)

  // "Sibling" means "shares a guardian" — any relationship type, not
  // specifically a financial or legal one (`fr-fin-04`'s own scenario uses a
  // plain shared guardian).
  const guardianRows = yield* sql<{ guardian_person_id: string }>`
    SELECT DISTINCT guardian_person_id FROM parent_student_relationships WHERE student_person_id = ${studentPersonId}
  `
  const guardianIds = guardianRows.map((row) => row.guardian_person_id)
  const groupStudentIds = [studentPersonId]
  if (guardianIds.length > 0) {
    const siblingRows = yield* sql<{ student_person_id: string }>`
      SELECT DISTINCT student_person_id FROM parent_student_relationships
      WHERE guardian_person_id = ANY(${guardianIds}::uuid[]) AND student_person_id != ${studentPersonId}
    `
    groupStudentIds.push(...siblingRows.map((row) => row.student_person_id))
  }

  // Only the group's members with an ACTIVE enrollment at THIS school, THIS
  // year (`INV-ZS-058`: at most one per student per year) — ordered by
  // whoever became active first, since that's who keeps the full rate.
  const activeMembers = yield* sql<{ enrollment_id: string; effective_date: string; created_at: string }>`
    SELECT id AS enrollment_id, effective_date, created_at::text AS created_at
    FROM enrollments
    WHERE school_id = ${validSchoolId} AND academic_year_id = ${academicYearId}
      AND status = 'active' AND student_person_id = ANY(${groupStudentIds}::uuid[])
    ORDER BY effective_date ASC, created_at ASC
  `

  const policyOption = yield* findSiblingDiscountPolicy(schoolId, academicYearId)

  let installmentsAdded = 0
  let installmentsRemoved = 0
  for (let rank = 0; rank < activeMembers.length; rank++) {
    const member = activeMembers[rank]
    const financialAccountId = yield* ensureFinancialAccount(validSchoolId, member.enrollment_id)
    const eligiblePolicy = rank > 0 && Option.isSome(policyOption) ? policyOption.value : undefined
    const { added, removed } = yield* reconcileDiscountLines(validSchoolId, financialAccountId, eligiblePolicy)
    installmentsAdded += added
    installmentsRemoved += removed
    if (added > 0 || removed > 0) {
      const recomputationRepo = yield* siblingDiscountRecomputationRepo
      yield* recomputationRepo.insert({
        school_id: validSchoolId,
        financial_account_id: financialAccountId,
        trigger_reason: triggerReason,
        installments_added: added,
        installments_removed: removed
      })
    }
  }

  return { installmentsAdded, installmentsRemoved }
})

/** Public, explicitly-authorized entry point for a director to force a recompute — e.g. after configuring a policy that didn't exist yet when existing siblings enrolled. `Enrollment.ts`'s own calls are best-effort and unauthorized (already inside an authorized flow), same distinction as `PaymentSchedule.ts`'s `triggerPaymentScheduleGeneration`. */
export const triggerSiblingDiscountRecomputation = Effect.fn("SiblingDiscount.triggerSiblingDiscountRecomputation")(
  function*(schoolId: string, academicYearId: string, studentPersonId: string) {
    const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
    return yield* authorizedFinance(
      validSchoolId,
      withSchool(schoolId, recomputeSiblingDiscounts(schoolId, academicYearId, studentPersonId, "sibling_activated"))
    )
  }
)

/** The discount lines currently applied to one enrollment's installments, for display alongside `PaymentSchedule.ts`'s `findInstallments`. */
export const findSiblingDiscountLines = Effect.fn("SiblingDiscount.findSiblingDiscountLines")(function*(
  schoolId: string,
  enrollmentId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String, enrollmentId: Schema.String }),
        Result: SiblingDiscountLine,
        execute: (req) =>
          sql`
            SELECT l.* FROM sibling_discount_lines l
            JOIN financial_accounts a ON a.id = l.financial_account_id
            WHERE a.school_id = ${req.schoolId} AND a.enrollment_id = ${req.enrollmentId}
          `
      })({ schoolId, enrollmentId })
    })
  )
})
