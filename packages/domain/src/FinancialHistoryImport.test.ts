import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { addFeeItem, createFeeSchedule } from "./FeeSchedule.ts"
import { insertEnrollment } from "./Enrollment.ts"
import {
  analyzeFinancialHistoryRows,
  commitFinancialHistoryImportBatch,
  type FinancialHistoryImportRow
} from "./FinancialHistoryImport.ts"
import { attachStudentProfile, createPerson } from "./Identity.ts"

/** Same `authorized`-gating context as every other import domain's test in this package. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/**
 * Seeds school -> year -> section -> cycle -> level -> class -> a
 * monthly-1200-DH-tuition fee schedule, then enrolls one student effective
 * 2026-09-01 with a known Massar code — the same shape
 * `Payment.test.ts`'s own `withSeededAccounts` and `GradeImport.test.ts`'s
 * own `withSeededEnrollment` each already establish, combined: a real
 * Massar-code-matchable enrollment whose payment schedule has already
 * generated.
 */
const withSeededStudent = Effect.fn(function*<A, E, R>(
  use: (
    seed: {
      readonly schoolId: string
      readonly academicYearId: string
      readonly massarCode: string
      readonly enrollmentId: string
      readonly tuitionAmountMad: number
    }
  ) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<
    { id: string }
  >`INSERT INTO schools (name) VALUES ('FinancialHistoryImport test school') RETURNING id`
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

      const tuitionAmountMad = 1200
      const feeScheduleId = yield* createFeeSchedule({
        schoolId: school.id,
        academicYearId: year.id,
        levelId: level.id
      }).pipe(Effect.provide(asDirectorOf(school.id)))
      yield* addFeeItem({
        schoolId: school.id,
        feeScheduleId,
        nature: "tuition",
        labelFr: "Scolarité",
        labelAr: "الرسوم الدراسية",
        frequency: "monthly",
        amountMad: tuitionAmountMad,
        isMandatory: true
      }).pipe(Effect.provide(asDirectorOf(school.id)))

      // Derived from the already-unique school id, same reasoning
      // `GradeImport.test.ts`'s own `withSeededEnrollment` gives.
      const massarCode = "M" + school.id.replace(/-/g, "").slice(0, 12)
      const personId = yield* createPerson({
        firstName: "Zineb",
        lastName: "Fassi",
        dateOfBirth: "2013-01-01",
        massarCode
      })
      yield* attachStudentProfile(personId)
      const enrollment = yield* insertEnrollment({
        schoolId: school.id,
        academicYearId: year.id,
        studentPersonId: personId,
        classId: cls.id,
        effectiveDate: "2026-09-01",
        hasLegalGuardian: true,
        hasFinancialGuardian: true
      })

      return yield* use({
        schoolId: school.id,
        academicYearId: year.id,
        massarCode,
        enrollmentId: enrollment.id,
        tuitionAmountMad
      })
    })
  )
}, Effect.provide(AppSqlLive))

const installmentsFor = (schoolId: string, enrollmentId: string) =>
  withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* sql<{ id: string; amount_mad: string; status: string; due_date: string }>`
        SELECT i.id, i.amount_mad, i.status, i.due_date::text FROM installments i
        JOIN financial_accounts a ON a.id = i.financial_account_id
        WHERE a.enrollment_id = ${enrollmentId}
        ORDER BY i.due_date ASC
      `
    })
  )

describe("FinancialHistoryImport", () => {
  it.effect("an aggregate already-paid amount settles the oldest installments up to the as-of date", () =>
    withSeededStudent(({ academicYearId, enrollmentId, massarCode, schoolId, tuitionAmountMad }) =>
      Effect.gen(function*() {
        const row: FinancialHistoryImportRow = {
          rowId: "r1",
          massarCode,
          amountAlreadyPaidMad: tuitionAmountMad * 3,
          asOfDate: "2026-12-01"
        }
        const results = yield* commitFinancialHistoryImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results[0].status).toBe("committed")

        const installments = yield* installmentsFor(schoolId, enrollmentId)
        expect(installments.filter((i) => i.status === "paid")).toHaveLength(3)
        expect(installments.filter((i) => i.status === "due").length).toBeGreaterThan(0)
      })
    ))

  it.effect("a cheque imported already deposited does not mark anything paid", () =>
    withSeededStudent(({ academicYearId, enrollmentId, massarCode, schoolId, tuitionAmountMad }) =>
      Effect.gen(function*() {
        const row: FinancialHistoryImportRow = {
          rowId: "r1",
          massarCode,
          cheques: [{
            chequeNumber: "CHQ-001",
            bank: "Attijariwafa Bank",
            chequeDate: "2027-01-15",
            amountMad: tuitionAmountMad,
            initialStatus: "deposited"
          }]
        }
        const results = yield* commitFinancialHistoryImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results[0].status).toBe("committed")

        const installments = yield* installmentsFor(schoolId, enrollmentId)
        expect(installments.every((i) => i.status === "due")).toBe(true)

        const sql = yield* SqlClient
        const [cheque] = yield* withSchool(
          schoolId,
          sql<{ status: string }>`SELECT status FROM cheques WHERE cheque_number = 'CHQ-001'`
        )
        expect(cheque.status).toBe("deposited")
      })
    ))

  it.effect("a cheque imported already cleared marks its covered installment paid", () =>
    withSeededStudent(({ academicYearId, enrollmentId, massarCode, schoolId, tuitionAmountMad }) =>
      Effect.gen(function*() {
        const row: FinancialHistoryImportRow = {
          rowId: "r1",
          massarCode,
          cheques: [{
            chequeNumber: "CHQ-002",
            bank: "Attijariwafa Bank",
            chequeDate: "2026-09-01",
            amountMad: tuitionAmountMad,
            initialStatus: "cleared"
          }]
        }
        const results = yield* commitFinancialHistoryImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results[0].status).toBe("committed")

        const installments = yield* installmentsFor(schoolId, enrollmentId)
        expect(installments.filter((i) => i.status === "paid")).toHaveLength(1)
      })
    ))

  it.effect("a discount reduces the earliest unsettled installment and is traced", () =>
    withSeededStudent(({ academicYearId, enrollmentId, massarCode, schoolId, tuitionAmountMad }) =>
      Effect.gen(function*() {
        const row: FinancialHistoryImportRow = {
          rowId: "r1",
          massarCode,
          discountAlreadyGrantedMad: 500,
          discountReason: "Sibling discount granted by the school before onboarding"
        }
        const results = yield* commitFinancialHistoryImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results[0].status).toBe("committed")

        const installments = yield* installmentsFor(schoolId, enrollmentId)
        expect(Number(installments[0].amount_mad)).toBe(tuitionAmountMad - 500)

        const sql = yield* SqlClient
        const [adjustment] = yield* withSchool(
          schoolId,
          sql<{ reason: string; new_amount_mad: string }>`
            SELECT reason, new_amount_mad FROM installment_adjustments WHERE installment_id = ${installments[0].id}
          `
        )
        expect(adjustment.reason).toBe("Sibling discount granted by the school before onboarding")
        expect(Number(adjustment.new_amount_mad)).toBe(tuitionAmountMad - 500)
      })
    ))

  it.effect("a row naming an enrollment with no generated payment schedule yet fails clearly", () =>
    withSeededStudent(({ academicYearId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        // A second level with no fee schedule configured, and a second
        // student enrolled there — mirrors the first seed's own shape
        // without a `createFeeSchedule` call.
        const [cycle] = yield* withSchool(
          schoolId,
          sql<{ id: string }>`SELECT id FROM cycles WHERE school_id = ${schoolId} LIMIT 1`
        )
        const [level] = yield* withSchool(
          schoolId,
          sql<{ id: string }>`
            INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
            VALUES (${schoolId}, ${academicYearId}, ${cycle.id}, '5AP', '5ème Année Primaire', 2) RETURNING id
          `
        )
        const [cls] = yield* withSchool(
          schoolId,
          sql<{ id: string }>`
            INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
            VALUES (${schoolId}, ${academicYearId}, ${level.id}, '5AP-1', 30) RETURNING id
          `
        )
        const massarCode = "N" + schoolId.replace(/-/g, "").slice(0, 12)
        const personId = yield* createPerson({
          firstName: "Omar",
          lastName: "Tazi",
          dateOfBirth: "2014-01-01",
          massarCode
        })
        yield* attachStudentProfile(personId)
        yield* insertEnrollment({
          schoolId,
          academicYearId,
          studentPersonId: personId,
          classId: cls.id,
          effectiveDate: "2026-09-01",
          hasLegalGuardian: true,
          hasFinancialGuardian: true
        })

        const row: FinancialHistoryImportRow = { rowId: "r1", massarCode, amountAlreadyPaidMad: 1200, asOfDate: "2026-10-01" }
        const analysis = yield* analyzeFinancialHistoryRows(schoolId, academicYearId, [row])
        expect(analysis[0].status).toBe("error")

        const results = yield* commitFinancialHistoryImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results[0].status).toBe("error")
        if (results[0].status !== "error") throw new Error("unreachable")
        expect(results[0].error.reason).toContain("payment schedule")
      })
    ))

  it.effect("committing the same row twice does not double-apply any of its effects", () =>
    withSeededStudent(({ academicYearId, enrollmentId, massarCode, schoolId, tuitionAmountMad }) =>
      Effect.gen(function*() {
        const row: FinancialHistoryImportRow = {
          rowId: "r1",
          massarCode,
          amountAlreadyPaidMad: tuitionAmountMad,
          asOfDate: "2026-09-01",
          cheques: [{
            chequeNumber: "CHQ-003",
            bank: "Attijariwafa Bank",
            chequeDate: "2026-10-01",
            amountMad: tuitionAmountMad,
            initialStatus: "handed_over"
          }],
          discountAlreadyGrantedMad: 200,
          discountReason: "Already granted"
        }
        const first = yield* commitFinancialHistoryImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(first[0].status).toBe("committed")

        const second = yield* commitFinancialHistoryImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(second[0].status).toBe("skipped_already_applied")

        const sql = yield* SqlClient
        const [{ paymentCount }] = yield* withSchool(
          schoolId,
          sql<{ paymentCount: string }>`SELECT count(*)::int AS "paymentCount" FROM payments`
        )
        const [{ chequeCount }] = yield* withSchool(
          schoolId,
          sql<{ chequeCount: string }>`SELECT count(*)::int AS "chequeCount" FROM cheques`
        )
        const [{ adjustmentCount }] = yield* withSchool(
          schoolId,
          sql<{ adjustmentCount: string }>`
            SELECT count(*)::int AS "adjustmentCount" FROM installment_adjustments ia
            JOIN installments i ON i.id = ia.installment_id
            JOIN financial_accounts a ON a.id = i.financial_account_id
            WHERE a.enrollment_id = ${enrollmentId}
          `
        )
        expect(Number(paymentCount)).toBe(2) // one recordPayment, one recordChequeAtStatus (a cheque is its own payment row)
        expect(Number(chequeCount)).toBe(1)
        expect(Number(adjustmentCount)).toBe(1) // discount lands on the earliest still-unsettled installment (Sept already fully paid by the aggregate amount)
      })
    ))

  it.effect("a row's Massar code not matching any enrollment is an error, never silently skipped", () =>
    withSeededStudent(({ academicYearId, schoolId }) =>
      Effect.gen(function*() {
        const row: FinancialHistoryImportRow = { rowId: "r1", massarCode: "DOES-NOT-EXIST" }
        const analysis = yield* analyzeFinancialHistoryRows(schoolId, academicYearId, [row])
        expect(analysis[0].status).toBe("error")

        const results = yield* commitFinancialHistoryImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results[0].status).toBe("error")
        if (results[0].status !== "error") throw new Error("unreachable")
        expect(results[0].error.reason).toContain("DOES-NOT-EXIST")
      })
    ))

  it.effect("a row with nothing already paid, no cheques, and no discount still commits cleanly", () =>
    withSeededStudent(({ academicYearId, massarCode, schoolId }) =>
      Effect.gen(function*() {
        const row: FinancialHistoryImportRow = { rowId: "r1", massarCode }
        const results = yield* commitFinancialHistoryImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results[0].status).toBe("committed")
      })
    ))

  it.effect("a discount without a reason is rejected at analyze time", () =>
    withSeededStudent(({ academicYearId, massarCode, schoolId }) =>
      Effect.gen(function*() {
        const row = { rowId: "r1", massarCode, discountAlreadyGrantedMad: 100 } as FinancialHistoryImportRow
        const analysis = yield* analyzeFinancialHistoryRows(schoolId, academicYearId, [row])
        expect(analysis[0].status).toBe("error")
        if (analysis[0].status !== "error") throw new Error("unreachable")
        expect(analysis[0].error.reason).toContain("discountReason")
      })
    ))
})
