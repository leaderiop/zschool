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
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { closeEnrollment, insertEnrollment } from "./Enrollment.ts"
import { addFeeItem, createFeeSchedule } from "./FeeSchedule.ts"
import { GuardianQualitiesSchema, createPerson, recordGuardianRelationship } from "./Identity.ts"
import { GuardianPersonId, StudentPersonId } from "./Ids.ts"
import { findInstallments } from "./PaymentSchedule.ts"
import {
  computeSiblingDiscountAmount,
  configureSiblingDiscountPolicy,
  findSiblingDiscountLines,
  InvalidDiscountPolicyError,
  triggerSiblingDiscountRecomputation
} from "./SiblingDiscount.ts"

/** Same `authorized`-gating context as `TeacherImport.test.ts`'s own `asDirectorOf`. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

/**
 * Seeds school -> year -> section -> cycle -> level -> class -> a fee
 * schedule (monthly tuition), one guardian, and enrolls TWO students under
 * that same guardian at the given effective dates (`firstDate` always
 * activates before `secondDate`, matching `fr-fin-04`'s own Youssef-then-Sara
 * ordering) — same chain as `PaymentSchedule.test.ts`'s own
 * `withSeededEnrollment`, extended with a second sibling.
 */
const withSeededSiblings = (firstDate: string, secondDate: string) =>
  Effect.fn(function*<A, E, R>(
    use: (seed: {
      schoolId: string
      academicYearId: string
      firstEnrollmentId: string
      secondEnrollmentId: string
      firstStudentPersonId: string
      secondStudentPersonId: string
    }) => Effect.Effect<A, E, R>
  ) {
    const sql = yield* SqlClient
    const [school] = yield* sql<
      { id: string }
    >`INSERT INTO schools (name) VALUES ('SiblingDiscount test school') RETURNING id`
    return yield* withSchool(
      school.id,
      Effect.gen(function*() {
        const [year] = yield* sql<{ id: string }>`
          INSERT INTO academic_years (school_id, label) VALUES (${school.id}, '2026-2027') RETURNING id
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

        yield* addFeeItem({
          schoolId: school.id,
          feeScheduleId,
          nature: "tuition",
          labelFr: "Scolarité",
          labelAr: "الرسوم الدراسية",
          frequency: "monthly",
          amountMad: 1000,
          isMandatory: true
        }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

        const guardianPersonId = yield* createPerson({
          firstName: "Ahmed",
          lastName: "Guardian",
          dateOfBirth: "1980-01-01"
        })

        const enrollStudent = Effect.fn(function*(firstName: string, effectiveDate: string) {
          const studentPersonId = yield* randomUUID
          yield* sql`
            INSERT INTO persons (id, first_name, last_name, date_of_birth)
            VALUES (${studentPersonId}, ${firstName}, 'Student', '2015-01-01')
          `
          const qualities = yield* Schema.decodeEffect(GuardianQualitiesSchema)({
            relationshipType: "father",
            isLegalGuardian: true,
            isFinancialGuardian: true,
            isCustodialGuardian: true,
            isEmergencyContact: true,
            isAuthorizedForPickup: true
          }).pipe(Effect.orDie)
          yield* recordGuardianRelationship(
            GuardianPersonId.make(guardianPersonId),
            StudentPersonId.make(studentPersonId),
            qualities
          )
          const enrollment = yield* insertEnrollment({
            schoolId: school.id,
            academicYearId: year.id,
            studentPersonId,
            classId: cls.id,
            effectiveDate,
            hasLegalGuardian: true,
            hasFinancialGuardian: true
          })
          return { enrollmentId: enrollment.id, studentPersonId }
        })

        const first = yield* enrollStudent("Youssef", firstDate)
        const second = yield* enrollStudent("Sara", secondDate)

        return yield* use({
          schoolId: school.id,
          academicYearId: year.id,
          firstEnrollmentId: first.enrollmentId,
          secondEnrollmentId: second.enrollmentId,
          firstStudentPersonId: first.studentPersonId,
          secondStudentPersonId: second.studentPersonId
        })
      })
    )
  }, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("computeSiblingDiscountAmount (ticket #58 / BEH-ZS-154)", () => {
  it("a percentage discount is a fraction of the installment's own amount", () => {
    expect(
      computeSiblingDiscountAmount({ discountType: "percentage", discountValue: 10, installmentAmountMad: 1000 })
    ).toBe(100)
  })

  it("a flat-amount discount larger than the installment is capped at the installment's own amount", () => {
    expect(
      computeSiblingDiscountAmount({ discountType: "flat_amount", discountValue: 500, installmentAmountMad: 200 })
    ).toBe(200)
  })

  it("a flat-amount discount smaller than the installment is applied as-is", () => {
    expect(
      computeSiblingDiscountAmount({ discountType: "flat_amount", discountValue: 150, installmentAmountMad: 1000 })
    ).toBe(150)
  })
})

describe("configureSiblingDiscountPolicy (ticket #58 / BEH-ZS-154)", () => {
  it.effect("a percentage over 100 is refused", () =>
    withSeededSiblings("2024-09-01", "2024-09-01")(({ academicYearId, schoolId }) =>
      Effect.gen(function*() {
        const result = yield* Effect.result(
          configureSiblingDiscountPolicy({
            schoolId,
            academicYearId,
            discountType: "percentage",
            discountValue: 150,
            appliesToNatures: ["tuition"]
          }).pipe(Effect.provide(asDirectorOf(schoolId)))
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) expect(result.failure).toBeInstanceOf(InvalidDiscountPolicyError)
      })
    ))

  it.effect("no fee-line nature selected is refused", () =>
    withSeededSiblings("2024-09-01", "2024-09-01")(({ academicYearId, schoolId }) =>
      Effect.gen(function*() {
        const result = yield* Effect.result(
          configureSiblingDiscountPolicy({
            schoolId,
            academicYearId,
            discountType: "percentage",
            discountValue: 10,
            appliesToNatures: []
          }).pipe(Effect.provide(asDirectorOf(schoolId)))
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) expect(result.failure).toBeInstanceOf(InvalidDiscountPolicyError)
      })
    ))

  it.effect("reconfiguring the same year's policy overwrites it in place, not duplicates it", () =>
    withSeededSiblings("2024-09-01", "2024-09-01")(({ academicYearId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* configureSiblingDiscountPolicy({
          schoolId,
          academicYearId,
          discountType: "percentage",
          discountValue: 10,
          appliesToNatures: ["tuition"]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* configureSiblingDiscountPolicy({
          schoolId,
          academicYearId,
          discountType: "flat_amount",
          discountValue: 200,
          appliesToNatures: ["tuition"]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const rows = yield* withSchool(
          schoolId,
          sql<{ count: string; discount_type: string }>`
            SELECT count(*)::int AS count, min(discount_type) AS discount_type FROM sibling_discount_policies
            WHERE school_id = ${schoolId} AND academic_year_id = ${academicYearId}
            GROUP BY discount_type
          `
        )
        expect(rows).toHaveLength(1)
        expect(Number(rows[0].count)).toBe(1)
        expect(rows[0].discount_type).toBe("flat_amount")
      })
    ))
})

describe("recomputeSiblingDiscounts (ticket #58 / fr-fin-04-sibling-discount.feature)", () => {
  it.effect("a lone child gets no discount lines", () =>
    withSeededSiblings("2024-09-01", "2024-09-01")(({ firstEnrollmentId, schoolId }) =>
      Effect.gen(function*() {
        const lines = yield* findSiblingDiscountLines(schoolId, firstEnrollmentId)
        expect(lines).toHaveLength(0)
      })
    ))

  it.effect("a second child's activation gets the discount, applied to the second child only", () =>
    withSeededSiblings("2024-09-01", "2024-09-01")(
      ({ academicYearId, firstEnrollmentId, schoolId, secondEnrollmentId, secondStudentPersonId }) =>
      Effect.gen(function*() {
        yield* configureSiblingDiscountPolicy({
          schoolId,
          academicYearId,
          discountType: "percentage",
          discountValue: 10,
          appliesToNatures: ["tuition"]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        // Re-enrolling isn't how the second child's discount actually gets
        // triggered in production (activation itself does) — the seed
        // already enrolled both before the policy existed, so re-run the
        // recompute the same way `closeEnrollment` below re-runs it, via the
        // public trigger.
        yield* triggerSiblingDiscountRecomputation(schoolId, academicYearId, secondStudentPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId)),
          Effect.orDie
        )

        const firstLines = yield* findSiblingDiscountLines(schoolId, firstEnrollmentId)
        expect(firstLines).toHaveLength(0)

        const secondLines = yield* findSiblingDiscountLines(schoolId, secondEnrollmentId)
        expect(secondLines).toHaveLength(10) // 10 monthly tuition installments
        expect(secondLines.every((l) => l.amount_mad === 100)).toBe(true) // 10% of 1000

        const secondInstallments = yield* findInstallments(schoolId, secondEnrollmentId)
        expect(secondInstallments.every((i) => i.amount_mad === 1000)).toBe(true) // never folded into the installment itself
      })
    ))

  it.effect("closing the first sibling's enrollment removes the discount from the remaining sibling's unsettled installments, traced", () =>
    withSeededSiblings("2024-09-01", "2024-09-15")(
      ({ academicYearId, firstEnrollmentId, schoolId, secondEnrollmentId, secondStudentPersonId }) =>
        Effect.gen(function*() {
          const sql = yield* SqlClient
          yield* configureSiblingDiscountPolicy({
            schoolId,
            academicYearId,
            discountType: "percentage",
            discountValue: 10,
            appliesToNatures: ["tuition"]
          }).pipe(Effect.provide(asDirectorOf(schoolId)))

          yield* triggerSiblingDiscountRecomputation(schoolId, academicYearId, secondStudentPersonId).pipe(
            Effect.provide(asDirectorOf(schoolId)),
            Effect.orDie
          )
          expect(yield* findSiblingDiscountLines(schoolId, secondEnrollmentId)).toHaveLength(10)
          expect(yield* findSiblingDiscountLines(schoolId, firstEnrollmentId)).toHaveLength(0)

          yield* closeEnrollment(schoolId, firstEnrollmentId, "Withdrawn mid-year").pipe(
            Effect.provide(asDirectorOf(schoolId))
          )

          const secondLines = yield* findSiblingDiscountLines(schoolId, secondEnrollmentId)
          expect(secondLines).toHaveLength(0)

          const [recomputation] = yield* withSchool(
            schoolId,
            sql<{ trigger_reason: string; installments_removed: number }>`
              SELECT r.trigger_reason, r.installments_removed FROM sibling_discount_recomputations r
              JOIN financial_accounts a ON a.id = r.financial_account_id
              WHERE a.enrollment_id = ${secondEnrollmentId} AND r.trigger_reason = 'sibling_closed'
            `
          )
          expect(recomputation.trigger_reason).toBe("sibling_closed")
          expect(Number(recomputation.installments_removed)).toBe(10)
        })
    ))

  it.effect("an already-paid installment never receives a discount line", () =>
    withSeededSiblings("2024-09-01", "2024-09-01")(
      ({ academicYearId, schoolId, secondEnrollmentId, secondStudentPersonId }) =>
        Effect.gen(function*() {
          const sql = yield* SqlClient
          yield* configureSiblingDiscountPolicy({
            schoolId,
            academicYearId,
            discountType: "percentage",
            discountValue: 10,
            appliesToNatures: ["tuition"]
          }).pipe(Effect.provide(asDirectorOf(schoolId)))

          const secondInstallments = yield* findInstallments(schoolId, secondEnrollmentId)
          const paid = secondInstallments[0]
          yield* withSchool(schoolId, sql`UPDATE installments SET status = 'paid' WHERE id = ${paid.id}`)

          yield* triggerSiblingDiscountRecomputation(schoolId, academicYearId, secondStudentPersonId).pipe(
            Effect.provide(asDirectorOf(schoolId)),
            Effect.orDie
          )

          const lines = yield* findSiblingDiscountLines(schoolId, secondEnrollmentId)
          expect(lines.some((l) => l.installment_id === paid.id)).toBe(false)
          expect(lines).toHaveLength(9)
        })
    ))
})
