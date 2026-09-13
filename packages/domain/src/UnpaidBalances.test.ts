import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { closeEnrollment, insertEnrollment } from "./Enrollment.ts"
import { addFeeItem, createFeeSchedule } from "./FeeSchedule.ts"
import { designateFinancialGuardian } from "./FinancialAccount.ts"
import { attachGuardianProfile, createPerson, GuardianQualitiesSchema, recordGuardianRelationship } from "./Identity.ts"
import { GuardianPersonId, StudentPersonId } from "./Ids.ts"
import { recordBankTransfer, recordPayment, requestVoid } from "./Payment.ts"
import { findUnpaidBalances, findUnpaidBalancesByGuardian } from "./UnpaidBalances.ts"

const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

/**
 * Seeds school -> year -> section -> cycle -> level -> class -> a
 * monthly-tuition (1200 MAD) fee schedule, exposing `enrollStudent` so each
 * test enrolls exactly the students it needs (one, or several sharing a
 * guardian for the multi-child grouping scenarios).
 */
const withSeededSchool = Effect.fn(function*<A, E, R>(
  use: (ctx: { schoolId: string; academicYearId: string; classId: string; levelId: string }) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('UnpaidBalances test school') RETURNING id
  `
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

      return yield* use({ schoolId: school.id, academicYearId: year.id, classId: cls.id, levelId: level.id })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

const enrollStudent = Effect.fn(function*(
  schoolId: string,
  academicYearId: string,
  classId: string,
  firstName: string,
  lastName: string,
  effectiveDate = "2026-09-01"
) {
  const sql = yield* SqlClient
  const studentPersonId = yield* randomUUID
  yield* sql`
    INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${studentPersonId}, ${firstName}, ${lastName}, '2015-01-01')
  `
  const enrollment = yield* insertEnrollment({
    schoolId,
    academicYearId,
    studentPersonId,
    classId,
    effectiveDate,
    // Active (not `pre_enrolled`), matching a normally-onboarded student —
    // installments generate either way (`insertEnrollment`'s payment-schedule
    // call is unconditional), but `closeEnrollment` requires `'active'`, and
    // several of this file's tests close an enrollment mid-test.
    hasLegalGuardian: true,
    hasFinancialGuardian: true
  })
  const [account] = yield* sql<{ id: string }>`SELECT id FROM financial_accounts WHERE enrollment_id = ${enrollment.id}`
  return { enrollmentId: enrollment.id, studentPersonId, financialAccountId: account.id }
})

const createGuardianFor = Effect.fn(function*(
  studentPersonId: string,
  mobileNumber: string,
  firstName = "Ahmed",
  lastName = "Guardian"
) {
  const guardianPersonId = yield* createPerson({ firstName, lastName, dateOfBirth: "1985-01-01" })
  yield* attachGuardianProfile(guardianPersonId, mobileNumber)
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
  return guardianPersonId
})

describe("UnpaidBalances (ticket #62 / BEH-ZS-170/178)", () => {
  it.effect("a student with no payments owes the full first installment, listed as overdue once past due", () =>
    withSeededSchool(({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const { enrollmentId } = yield* enrollStudent(schoolId, academicYearId, classId, "Youssef", "Student", "2026-09-01")

        const balances = yield* findUnpaidBalances(schoolId)
        const row = balances.find((b) => b.enrollmentId === enrollmentId)
        expect(row).toBeDefined()
        expect(row!.totalOwedMad).toBe(12000) // 10 monthly installments x 1200
        expect(row!.closedFile).toBe(false)
        // Every installment is due in the past relative to "today" in these
        // fixed 2026-09 fixtures being run well after that date.
        expect(row!.overdueInstallments.length).toBeGreaterThan(0)
      })
    ))

  it.effect("a partial payment leaves the installment's remainder, not its full amount, owed", () =>
    withSeededSchool(({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const { enrollmentId, financialAccountId } = yield* enrollStudent(
          schoolId,
          academicYearId,
          classId,
          "Sara",
          "Student"
        )
        yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 700,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds: [financialAccountId]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const balances = yield* findUnpaidBalances(schoolId)
        const row = balances.find((b) => b.enrollmentId === enrollmentId)!
        expect(row.totalOwedMad).toBe(12000 - 700)
      })
    ))

  it.effect("a fully settled account does not appear in the view", () =>
    withSeededSchool(({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const { enrollmentId, financialAccountId } = yield* enrollStudent(
          schoolId,
          academicYearId,
          classId,
          "Fully",
          "Paid"
        )
        // `valueDate` after the whole 10-month school year (June) so
        // auto-allocation (restricted to installments actually due by then,
        // `Payment.ts`'s `autoAllocateOldestFirst`) can settle all 10, not
        // just September's — paying in September only ever settles the one
        // installment due so far, with the rest becoming a credit rather
        // than prepaying future months.
        yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 12000,
          valueDate: "2027-07-01",
          reference: null,
          financialAccountIds: [financialAccountId]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const balances = yield* findUnpaidBalances(schoolId)
        expect(balances.some((b) => b.enrollmentId === enrollmentId)).toBe(false)
      })
    ))

  it.effect("a bank transfer pending confirmation does not reduce the owed amount yet", () =>
    withSeededSchool(({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const { enrollmentId } = yield* enrollStudent(
          schoolId,
          academicYearId,
          classId,
          "Pending",
          "Transfer"
        )
        // Recording a bank transfer only inserts the payment itself
        // (`pending_confirmation`) — allocation and any balance effect only
        // happen once `confirmPayment` reconciles it (BEH-ZS-163), so this
        // view must show the installment as fully owed regardless.
        yield* recordBankTransfer({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: "TRF-1"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const balances = yield* findUnpaidBalances(schoolId)
        const row = balances.find((b) => b.enrollmentId === enrollmentId)!
        expect(row.totalOwedMad).toBe(12000)
      })
    ))

  it.effect("filters by class and level, and by financial guardian", () =>
    withSeededSchool(({ academicYearId, classId, levelId, schoolId }) =>
      Effect.gen(function*() {
        const a = yield* enrollStudent(schoolId, academicYearId, classId, "Amine", "A")
        const b = yield* enrollStudent(schoolId, academicYearId, classId, "Bilal", "B")
        const guardianPersonId = yield* createGuardianFor(a.studentPersonId, "+212700000005")
        yield* designateFinancialGuardian(schoolId, a.enrollmentId, guardianPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const byClass = yield* findUnpaidBalances(schoolId, { classId })
        expect(byClass.map((r) => r.enrollmentId).sort()).toEqual([a.enrollmentId, b.enrollmentId].sort())

        const byLevel = yield* findUnpaidBalances(schoolId, { levelId })
        expect(byLevel.map((r) => r.enrollmentId).sort()).toEqual([a.enrollmentId, b.enrollmentId].sort())

        const byGuardian = yield* findUnpaidBalances(schoolId, { guardianPersonId })
        expect(byGuardian.map((r) => r.enrollmentId)).toEqual([a.enrollmentId])

        const byOtherClass = yield* findUnpaidBalances(schoolId, { classId: b.enrollmentId })
        expect(byOtherClass).toHaveLength(0)
      })
    ))

  it.effect("a closed enrollment with an unsettled balance is tagged 'closed file' and stays in the totals", () =>
    withSeededSchool(({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const { enrollmentId } = yield* enrollStudent(schoolId, academicYearId, classId, "Left", "Midyear")
        yield* closeEnrollment(schoolId, enrollmentId, "Transferred to another school").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const balances = yield* findUnpaidBalances(schoolId)
        const row = balances.find((b) => b.enrollmentId === enrollmentId)
        expect(row).toBeDefined()
        expect(row!.closedFile).toBe(true)
        expect(row!.totalOwedMad).toBe(12000)
      })
    ))

  it.effect("groups a multi-child financial guardian into one row with a per-child breakdown and combined total", () =>
    withSeededSchool(({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const youssef = yield* enrollStudent(schoolId, academicYearId, classId, "Youssef", "Sibling")
        const sara = yield* enrollStudent(schoolId, academicYearId, classId, "Sara", "Sibling")
        const guardianPersonId = yield* createGuardianFor(youssef.studentPersonId, "+212700000006")
        yield* designateFinancialGuardian(schoolId, youssef.enrollmentId, guardianPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        yield* recordGuardianRelationship(
          GuardianPersonId.make(guardianPersonId),
          StudentPersonId.make(sara.studentPersonId),
          yield* Schema.decodeEffect(GuardianQualitiesSchema)({
            relationshipType: "father",
            isLegalGuardian: true,
            isFinancialGuardian: true,
            isCustodialGuardian: true,
            isEmergencyContact: true,
            isAuthorizedForPickup: true
          }).pipe(Effect.orDie)
        )
        yield* designateFinancialGuardian(schoolId, sara.enrollmentId, guardianPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const byGuardian = yield* findUnpaidBalancesByGuardian(schoolId)
        const row = byGuardian.find((g) => g.guardianPersonId === guardianPersonId)
        expect(row).toBeDefined()
        expect(row!.totalOwedMad).toBe(24000)
        expect(row!.children.map((c) => c.enrollmentId).sort()).toEqual(
          [youssef.enrollmentId, sara.enrollmentId].sort()
        )
      })
    ))

  it.effect("a voided payment's installment reverts to fully owed, excluded from the paid total", () =>
    withSeededSchool(({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const { enrollmentId, financialAccountId } = yield* enrollStudent(
          schoolId,
          academicYearId,
          classId,
          "Reverted",
          "Void"
        )
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds: [financialAccountId]
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const afterPayment = yield* findUnpaidBalances(schoolId)
        expect(afterPayment.find((b) => b.enrollmentId === enrollmentId)!.totalOwedMad).toBe(12000 - 1200)

        const today = new Date().toISOString().slice(0, 10)
        yield* requestVoid({ schoolId, paymentId, reason: "Recorded by mistake", voidDate: today }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const afterVoid = yield* findUnpaidBalances(schoolId)
        expect(afterVoid.find((b) => b.enrollmentId === enrollmentId)!.totalOwedMad).toBe(12000)
      })
    ))
})
