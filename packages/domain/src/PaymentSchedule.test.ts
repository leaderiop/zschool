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
import { insertEnrollment } from "./Enrollment.ts"
import { addFeeItem, createFeeSchedule } from "./FeeSchedule.ts"
import {
  adjustInstallment,
  computeOccurrences,
  findInstallments,
  generatePaymentSchedule,
  NoAdjustmentSpecifiedError
} from "./PaymentSchedule.ts"

/** Same `authorized`-gating context as `TeacherImport.test.ts`'s own `asDirectorOf`. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

/** Seeds school -> year -> section -> cycle -> level -> class -> a fee schedule (tuition monthly + registration one-time), then enrolls one student at `effectiveDate`. */
const withSeededEnrollment = (effectiveDate: string) =>
  Effect.fn(function*<A, E, R>(
    use: (seed: { schoolId: string; enrollmentId: string; feeScheduleId: string }) => Effect.Effect<A, E, R>
  ) {
    const sql = yield* SqlClient
    const [school] = yield* sql<
      { id: string }
    >`INSERT INTO schools (name) VALUES ('PaymentSchedule test school') RETURNING id`
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
          amountMad: 1200,
          isMandatory: true
        }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

        yield* addFeeItem({
          schoolId: school.id,
          feeScheduleId,
          nature: "registration",
          labelFr: "Inscription",
          labelAr: "التسجيل",
          frequency: "one_time",
          amountMad: 500,
          isMandatory: true
        }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

        const studentPersonId = yield* randomUUID
        yield* sql`
          INSERT INTO persons (id, first_name, last_name, date_of_birth)
          VALUES (${studentPersonId}, 'Yasmine', 'Student', '2015-01-01')
        `

        const enrollment = yield* insertEnrollment({
          schoolId: school.id,
          academicYearId: year.id,
          studentPersonId,
          classId: cls.id,
          effectiveDate,
          hasLegalGuardian: false,
          hasFinancialGuardian: false
        })

        return yield* use({ schoolId: school.id, enrollmentId: enrollment.id, feeScheduleId })
      })
    )
  }, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("computeOccurrences (ticket #57 / BEH-ZS-153)", () => {
  it("a one_time fee produces a single occurrence due at the effective date", () => {
    const occurrences = computeOccurrences({
      frequency: "one_time",
      amountMad: 500,
      startYear: 2026,
      effectiveDate: "2026-11-15",
      prorate: false
    })
    expect(occurrences).toEqual([{ dueDate: "2026-11-15", amountMad: 500 }])
  })

  it("a monthly fee starting on the school year's first day produces 10 full-amount occurrences", () => {
    const occurrences = computeOccurrences({
      frequency: "monthly",
      amountMad: 1200,
      startYear: 2026,
      effectiveDate: "2026-09-01",
      prorate: false
    })
    expect(occurrences).toHaveLength(10)
    expect(occurrences[0]).toEqual({ dueDate: "2026-09-01", amountMad: 1200 })
    expect(occurrences.at(-1)).toEqual({ dueDate: "2027-06-01", amountMad: 1200 })
  })

  it("a monthly fee starting mid-year skips past months and charges the started month in full by default", () => {
    const occurrences = computeOccurrences({
      frequency: "monthly",
      amountMad: 1200,
      startYear: 2026,
      effectiveDate: "2026-11-15",
      prorate: false
    })
    expect(occurrences).toHaveLength(8) // November through June
    expect(occurrences[0]).toEqual({ dueDate: "2026-11-01", amountMad: 1200 })
  })

  it("a monthly fee starting mid-year is prorated for its first month when the school opts in", () => {
    const occurrences = computeOccurrences({
      frequency: "monthly",
      amountMad: 1200,
      startYear: 2026,
      effectiveDate: "2026-11-15",
      prorate: true
    })
    expect(occurrences).toHaveLength(8)
    // November has 30 days; 16 remaining (15th through 30th inclusive).
    expect(occurrences[0]).toEqual({ dueDate: "2026-11-15", amountMad: 640 })
    expect(occurrences[1]).toEqual({ dueDate: "2026-12-01", amountMad: 1200 })
  })

  it("a quarterly fee produces 4 occurrences", () => {
    const occurrences = computeOccurrences({
      frequency: "quarterly",
      amountMad: 300,
      startYear: 2026,
      effectiveDate: "2026-09-01",
      prorate: false
    })
    expect(occurrences.map((o) => o.dueDate)).toEqual(["2026-09-01", "2026-12-01", "2027-03-01", "2027-06-01"])
  })

  it("a quarterly fee starting mid-quarter still charges that whole quarter, not just its first month", () => {
    // Oct 15 falls inside the Sept-Nov quarter — the quarter must still be
    // billed (a bug once dropped it because only Sept's own 30 days were
    // checked against the effective date, not the full 3-month period).
    const occurrences = computeOccurrences({
      frequency: "quarterly",
      amountMad: 300,
      startYear: 2026,
      effectiveDate: "2026-10-15",
      prorate: false
    })
    expect(occurrences.map((o) => o.dueDate)).toEqual(["2026-09-01", "2026-12-01", "2027-03-01", "2027-06-01"])
    expect(occurrences.every((o) => o.amountMad === 300)).toBe(true)
  })

  it("a prorated quarterly fee starting mid-quarter is prorated against the full quarter's days, not one month", () => {
    const occurrences = computeOccurrences({
      frequency: "quarterly",
      amountMad: 300,
      startYear: 2026,
      effectiveDate: "2026-09-15",
      prorate: true
    })
    // Sept+Oct+Nov = 30+31+30 = 91 days; 77 remaining from Sept 15 inclusive.
    expect(occurrences[0]).toEqual({ dueDate: "2026-09-15", amountMad: Math.round((300 * 77 / 91) * 100) / 100 })
  })
})

describe("generatePaymentSchedule (ticket #57 / BEH-ZS-153)", () => {
  it.effect("activating an enrollment generates its payment schedule from the applicable fee schedule", () =>
    withSeededEnrollment("2026-09-01")(({ enrollmentId, schoolId }) =>
      Effect.gen(function*() {
        const installments = yield* findInstallments(schoolId, enrollmentId)
        // 10 monthly tuition installments + 1 one-time registration installment.
        expect(installments).toHaveLength(11)
        const tuitionCount = installments.filter((i) => i.amount_mad === 1200).length
        const registrationCount = installments.filter((i) => i.amount_mad === 500).length
        expect(tuitionCount).toBe(10)
        expect(registrationCount).toBe(1)
        expect(installments.every((i) => i.status === "due")).toBe(true)
      })
    ))

  it.effect("regenerating the schedule is idempotent — no duplicate installments", () =>
    withSeededEnrollment("2026-09-01")(({ enrollmentId, schoolId }) =>
      Effect.gen(function*() {
        yield* withSchool(schoolId, generatePaymentSchedule(schoolId, enrollmentId))
        const installments = yield* findInstallments(schoolId, enrollmentId)
        expect(installments).toHaveLength(11)
      })
    ))

  it.effect("an enrollment with no applicable fee schedule yet gets no installments, and enrollment still succeeds", () =>
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const [school] = yield* sql<{ id: string }>`
        INSERT INTO schools (name) VALUES ('No fee schedule school') RETURNING id
      `
      yield* withSchool(
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
          const studentPersonId = yield* randomUUID
          yield* sql`
            INSERT INTO persons (id, first_name, last_name, date_of_birth)
            VALUES (${studentPersonId}, 'Yasmine', 'Student', '2015-01-01')
          `
          const enrollment = yield* insertEnrollment({
            schoolId: school.id,
            academicYearId: year.id,
            studentPersonId,
            classId: cls.id,
            effectiveDate: "2026-09-01",
            hasLegalGuardian: false,
            hasFinancialGuardian: false
          })

          const installments = yield* findInstallments(school.id, enrollment.id)
          expect(installments).toHaveLength(0)
        })
      )
    }).pipe(Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer))))
})

describe("adjustInstallment (ticket #57 / BEH-ZS-153)", () => {
  it.effect("a manual adjustment updates the installment and records a traced adjustment", () =>
    withSeededEnrollment("2026-09-01")(({ enrollmentId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const installments = yield* findInstallments(schoolId, enrollmentId)
        const target = installments.find((i) => i.amount_mad === 1200)!

        yield* adjustInstallment(schoolId, target.id, {
          amountMad: 900,
          reason: "Director-approved discount"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const [updated] = yield* withSchool(
          schoolId,
          sql<{ amount_mad: string }>`SELECT amount_mad FROM installments WHERE id = ${target.id}`
        )
        expect(Number(updated.amount_mad)).toBe(900)

        const [adjustment] = yield* withSchool(
          schoolId,
          sql<{ previous_amount_mad: string; new_amount_mad: string; reason: string }>`
            SELECT previous_amount_mad, new_amount_mad, reason FROM installment_adjustments
            WHERE installment_id = ${target.id}
          `
        )
        expect(Number(adjustment.previous_amount_mad)).toBe(1200)
        expect(Number(adjustment.new_amount_mad)).toBe(900)
        expect(adjustment.reason).toBe("Director-approved discount")
      })
    ))

  it.effect("an adjustment specifying neither a new amount nor a new due date is refused", () =>
    withSeededEnrollment("2026-09-01")(({ enrollmentId, schoolId }) =>
      Effect.gen(function*() {
        const installments = yield* findInstallments(schoolId, enrollmentId)
        const target = installments.find((i) => i.amount_mad === 1200)!

        const result = yield* Effect.result(
          adjustInstallment(schoolId, target.id, { reason: "no actual change" }).pipe(
            Effect.provide(asDirectorOf(schoolId))
          )
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) {
          expect(result.failure).toBeInstanceOf(NoAdjustmentSpecifiedError)
        }
      })
    ))
})
