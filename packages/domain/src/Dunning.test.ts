import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Result from "effect/Result"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  configureDunningTiers,
  evaluateDunningForOverdueInstallments,
  findDunningHistory,
  InvalidDunningTiersError,
  triggerManualReminder
} from "./Dunning.ts"
import { insertEnrollment } from "./Enrollment.ts"
import { addFeeItem, createFeeSchedule } from "./FeeSchedule.ts"
import { findInstallments } from "./PaymentSchedule.ts"
import { recordPayment, requestVoid } from "./Payment.ts"

/** Same `authorized`-gating context as `PaymentSchedule.test.ts`'s own `asDirectorOf`. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

/**
 * Seeds school -> year -> section -> cycle -> level -> class -> a monthly
 * tuition fee schedule -> one enrolled student, then forces the resulting
 * FIRST installment's `due_date` to exactly `daysOverdue` days before
 * `CURRENT_DATE` — a direct `UPDATE`, not a chosen `effectiveDate`, so every
 * test's notion of "overdue by N days" stays correct regardless of the real
 * wall-clock date the suite happens to run on (the same reasoning
 * `PaymentSchedule.test.ts`'s own quarterly-period regression tests apply to
 * date arithmetic, here applied to keep a BDD-style scenario deterministic).
 */
const withOverdueInstallment = (daysOverdue: number) =>
  Effect.fn(function*<A, E, R>(
    use: (seed: { schoolId: string; installmentId: string }) => Effect.Effect<A, E, R>
  ) {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Dunning test school') RETURNING id`
    return yield* withSchool(
      school.id,
      Effect.gen(function*() {
        const [year] = yield* sql<{ id: string }>`
          INSERT INTO academic_years (school_id, label) VALUES (${school.id}, '2020-2021') RETURNING id
        `
        const [section] = yield* sql<{ id: string }>`
          INSERT INTO sections (school_id, academic_year_id, template, name)
          VALUES (${school.id}, ${year.id}, 'national', 'National') RETURNING id
        `
        const [cycle] = yield* sql<{ id: string }>`
          INSERT INTO cycles (school_id, academic_year_id, section_id, code, name, sort_order)
          VALUES (${school.id}, ${year.id}, ${section.id}, 'PRIM', 'Primary', 1) RETURNING id
        `
        const [level] = yield* sql<{ id: string }>`
          INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
          VALUES (${school.id}, ${year.id}, ${cycle.id}, '6AP', '6ème Année Primaire', 1) RETURNING id
        `
        const [cls] = yield* sql<{ id: string }>`
          INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
          VALUES (${school.id}, ${year.id}, ${level.id}, '6AP-1', 30) RETURNING id
        `

        const feeScheduleId = yield* createFeeSchedule({
          schoolId: school.id,
          academicYearId: year.id,
          levelId: level.id
        }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

        // `one_time`, not `monthly` — this seed wants EXACTLY one installment
        // whose `due_date` it fully controls below; a monthly fee item would
        // generate a full year's worth (`fr-fin-03`'s "10 monthly
        // installments"), and every one of those, generated against a
        // 2020-2021 academic year, would ALSO already be overdue by the time
        // this suite runs — inflating every `evaluateDunningForOverdueInstallments`
        // count far past what a test actually asserts.
        yield* addFeeItem({
          schoolId: school.id,
          feeScheduleId,
          nature: "tuition",
          labelFr: "Scolarité",
          labelAr: "الرسوم الدراسية",
          frequency: "one_time",
          amountMad: 1000,
          isMandatory: true
        }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

        const studentPersonId = yield* randomUUID
        yield* sql`
          INSERT INTO persons (id, first_name, last_name, date_of_birth)
          VALUES (${studentPersonId}, 'Nadia', 'Student', '2015-01-01')
        `

        const enrollment = yield* insertEnrollment({
          schoolId: school.id,
          academicYearId: year.id,
          studentPersonId,
          classId: cls.id,
          effectiveDate: "2020-09-01",
          hasLegalGuardian: true,
          hasFinancialGuardian: true
        })

        const installments = yield* findInstallments(school.id, enrollment.id)
        const installment = installments[0]
        yield* sql`
          UPDATE installments SET due_date = CURRENT_DATE - ${daysOverdue}::int WHERE id = ${installment.id}
        `

        return yield* use({ schoolId: school.id, installmentId: installment.id })
      })
    )
  }, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("configureDunningTiers (ticket #64 / BEH-ZS-168)", () => {
  it.effect("no tiers is refused", () =>
    withOverdueInstallment(0)(({ schoolId }) =>
      Effect.gen(function*() {
        const result = yield* Effect.result(
          configureDunningTiers({ schoolId, tiers: [] }).pipe(Effect.provide(asDirectorOf(schoolId)))
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) expect(result.failure).toBeInstanceOf(InvalidDunningTiersError)
      })
    ))

  it.effect("duplicate tier orders are refused", () =>
    withOverdueInstallment(0)(({ schoolId }) =>
      Effect.gen(function*() {
        const result = yield* Effect.result(
          configureDunningTiers({
            schoolId,
            tiers: [
              { order: 1, dayOffsetDays: 3, severityLabel: "reminder" },
              { order: 1, dayOffsetDays: 7, severityLabel: "notice" }
            ]
          }).pipe(Effect.provide(asDirectorOf(schoolId)))
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) expect(result.failure).toBeInstanceOf(InvalidDunningTiersError)
      })
    ))

  it.effect("day offsets that don't strictly increase with tier order are refused", () =>
    withOverdueInstallment(0)(({ schoolId }) =>
      Effect.gen(function*() {
        const result = yield* Effect.result(
          configureDunningTiers({
            schoolId,
            tiers: [
              { order: 1, dayOffsetDays: 7, severityLabel: "reminder" },
              { order: 2, dayOffsetDays: 3, severityLabel: "notice" }
            ]
          }).pipe(Effect.provide(asDirectorOf(schoolId)))
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) expect(result.failure).toBeInstanceOf(InvalidDunningTiersError)
      })
    ))

  it.effect("reconfiguring overwrites the tier set in place, not duplicates it", () =>
    withOverdueInstallment(0)(({ schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* configureDunningTiers({
          schoolId,
          tiers: [{ order: 1, dayOffsetDays: 3, severityLabel: "reminder" }]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* configureDunningTiers({
          schoolId,
          tiers: [
            { order: 1, dayOffsetDays: 3, severityLabel: "reminder" },
            { order: 2, dayOffsetDays: 7, severityLabel: "notice" }
          ]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const rows = yield* withSchool(
          schoolId,
          sql<{ count: string }>`SELECT count(*)::int AS count FROM dunning_tiers WHERE school_id = ${schoolId}`
        )
        expect(Number(rows[0].count)).toBe(2)
      })
    ))
})

describe("evaluateDunningForOverdueInstallments (ticket #64 / fr-fin-18-graduated-reminder.feature)", () => {
  it.effect("an installment crossing tier offsets gets one Dunning record per tier crossed", () =>
    withOverdueInstallment(10)(({ installmentId, schoolId }) =>
      Effect.gen(function*() {
        yield* configureDunningTiers({
          schoolId,
          tiers: [
            { order: 1, dayOffsetDays: 3, severityLabel: "reminder" },
            { order: 2, dayOffsetDays: 7, severityLabel: "notice" },
            { order: 3, dayOffsetDays: 15, severityLabel: "final_notice" }
          ]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* evaluateDunningForOverdueInstallments(schoolId)
        expect(result.created).toBe(2) // day 3 and day 7 crossed at 10 days overdue; day 15 not yet

        const history = yield* findDunningHistory(schoolId, installmentId)
        expect(history).toHaveLength(2)
        expect(history.every((d) => d.is_manual === false)).toBe(true)
      })
    ))

  it.effect("re-evaluating never double-creates a record for a tier already crossed", () =>
    withOverdueInstallment(10)(({ installmentId, schoolId }) =>
      Effect.gen(function*() {
        yield* configureDunningTiers({
          schoolId,
          tiers: [
            { order: 1, dayOffsetDays: 3, severityLabel: "reminder" },
            { order: 2, dayOffsetDays: 7, severityLabel: "notice" }
          ]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* evaluateDunningForOverdueInstallments(schoolId)
        const second = yield* evaluateDunningForOverdueInstallments(schoolId)
        expect(second.created).toBe(0)

        const history = yield* findDunningHistory(schoolId, installmentId)
        expect(history).toHaveLength(2)
      })
    ))

  it.effect("settling the installment stops new dunning creation but keeps the full history", () =>
    withOverdueInstallment(10)(({ installmentId, schoolId }) =>
      Effect.gen(function*() {
        const [installment] = yield* withSchool(
          schoolId,
          Effect.gen(function*() {
            const sql = yield* SqlClient
            return yield* sql<{ financial_account_id: string; amount_mad: string }>`
              SELECT financial_account_id, amount_mad FROM installments WHERE id = ${installmentId}
            `
          })
        )

        yield* configureDunningTiers({
          schoolId,
          tiers: [
            { order: 1, dayOffsetDays: 3, severityLabel: "reminder" },
            { order: 2, dayOffsetDays: 7, severityLabel: "notice" }
          ]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* evaluateDunningForOverdueInstallments(schoolId)
        expect(yield* findDunningHistory(schoolId, installmentId)).toHaveLength(2)

        yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: Number(installment.amount_mad),
          valueDate: new Date().toISOString().slice(0, 10),
          reference: null,
          financialAccountIds: [installment.financial_account_id]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const afterSettlement = yield* evaluateDunningForOverdueInstallments(schoolId)
        expect(afterSettlement.created).toBe(0)

        // History is kept in full even though the installment is now settled.
        expect(yield* findDunningHistory(schoolId, installmentId)).toHaveLength(2)
      })
    ))

  it.effect("a voided payment doesn't count as settled — dunning still fires", () =>
    withOverdueInstallment(10)(({ installmentId, schoolId }) =>
      Effect.gen(function*() {
        const [installment] = yield* withSchool(
          schoolId,
          Effect.gen(function*() {
            const sql = yield* SqlClient
            return yield* sql<{ financial_account_id: string; amount_mad: string; day: string }>`
              SELECT financial_account_id, amount_mad, CURRENT_DATE::text AS day FROM installments WHERE id = ${installmentId}
            `
          })
        )

        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: Number(installment.amount_mad),
          valueDate: installment.day,
          reference: null,
          financialAccountIds: [installment.financial_account_id]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* requestVoid({ schoolId, paymentId, reason: "test reversal", voidDate: installment.day }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        yield* configureDunningTiers({
          schoolId,
          tiers: [{ order: 1, dayOffsetDays: 3, severityLabel: "reminder" }]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* evaluateDunningForOverdueInstallments(schoolId)
        expect(result.created).toBe(1)
      })
    ))
})

describe("triggerManualReminder (ticket #64 / BEH-ZS-168)", () => {
  it.effect("creates an ad hoc reminder outside the automatic tiers", () =>
    withOverdueInstallment(0)(({ installmentId, schoolId }) =>
      Effect.gen(function*() {
        const dunning = yield* triggerManualReminder({ schoolId, installmentId }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(dunning.is_manual).toBe(true)
        expect(dunning.dunning_tier_id).toBeNull()
        expect(dunning.triggered_by_subject_id).toBe("director-1")

        const history = yield* findDunningHistory(schoolId, installmentId)
        expect(history).toHaveLength(1)
      })
    ))

  it.effect("more than one manual reminder can be triggered on the same installment", () =>
    withOverdueInstallment(0)(({ installmentId, schoolId }) =>
      Effect.gen(function*() {
        yield* triggerManualReminder({ schoolId, installmentId }).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* triggerManualReminder({ schoolId, installmentId }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const history = yield* findDunningHistory(schoolId, installmentId)
        expect(history).toHaveLength(2)
      })
    ))
})
