import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { AccessDenied } from "@qadi/core/Errors"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { insertEnrollment } from "./Enrollment.ts"
import { addFeeItem, createFeeSchedule } from "./FeeSchedule.ts"
import { designateFinancialGuardian } from "./FinancialAccount.ts"
import { findMyChildrenFinancialStatus } from "./GuardianSelfService.ts"
import { createPerson, GuardianQualitiesSchema, recordGuardianRelationship } from "./Identity.ts"
import { GuardianPersonId, StudentPersonId } from "./Ids.ts"
import { recordPayment } from "./Payment.ts"

/** Same `authorized`-gating context as `SiblingDiscount.test.ts`'s own `asDirectorOf`. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/** Ticket #65's self-service subject — a financial guardian viewing their OWN data, keyed by `person_id` (`Policies.ts`'s `canViewOwnFinancialStatus`). */
const asFinancialGuardian = (personId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({ id: `guardian-${personId}`, roles: ["financial_guardian"], attributes: { person_id: personId } })
    )
  )

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

/**
 * Seeds one school -> year -> section -> cycle -> level -> class -> a
 * monthly-tuition fee schedule, enrolls one student under the given
 * (already-created) guardian person, and designates them the financial
 * guardian — same chain as `SiblingDiscount.test.ts`'s own
 * `withSeededSiblings`, parameterized by an EXISTING `guardianPersonId` so a
 * caller can seed the SAME guardian across multiple, independently-created
 * schools (this ticket's own "multi-school aggregation" requirement).
 */
const seedChildForGuardian = Effect.fn(function*(
  schoolName: string,
  guardianPersonId: string,
  studentName: string,
  tuitionAmountMad: number,
  effectiveDate = "2026-09-01"
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES (${schoolName}) RETURNING id`
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

      const studentPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${studentPersonId}, ${studentName}, 'Student', '2015-01-01')
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

      yield* designateFinancialGuardian(school.id, enrollment.id, guardianPersonId).pipe(
        Effect.provide(asDirectorOf(school.id))
      )

      const [financialAccount] = yield* sql<{ id: string }>`
        SELECT id FROM financial_accounts WHERE enrollment_id = ${enrollment.id}
      `
      const [installment] = yield* sql<{ id: string }>`
        SELECT id FROM installments WHERE financial_account_id = ${financialAccount.id} ORDER BY due_date ASC LIMIT 1
      `

      return {
        schoolId: school.id,
        enrollmentId: enrollment.id,
        studentPersonId,
        financialAccountId: financialAccount.id,
        firstInstallmentId: installment.id
      }
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

const withGuardianPerson = Effect.fn(function*<A, E, R>(
  use: (guardianPersonId: string) => Effect.Effect<A, E, R>
) {
  const guardianPersonId = yield* createPerson({
    firstName: "Ahmed",
    lastName: "Guardian",
    dateOfBirth: "1980-01-01"
  })
  return yield* use(guardianPersonId)
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("findMyChildrenFinancialStatus (ticket #65 / fr-fin-26-self-service-financial-status.feature)", () => {
  it.effect("a single-school guardian sees their child's schedule, balance and payment history", () =>
    withGuardianPerson((guardianPersonId) =>
      Effect.gen(function*() {
        const child = yield* seedChildForGuardian(
          "Self-service single-school test school",
          guardianPersonId,
          "Youssef",
          1200
        )

        yield* recordPayment({
          schoolId: child.schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-01",
          reference: null,
          financialAccountIds: [child.financialAccountId]
        }).pipe(Effect.provide(asDirectorOf(child.schoolId)))

        const status = yield* findMyChildrenFinancialStatus(guardianPersonId).pipe(
          Effect.provide(Layer.merge(EvaluationServicesNone, asFinancialGuardian(guardianPersonId)))
        )

        expect(status).toHaveLength(1)
        const [entry] = status
        expect(entry.schoolId).toBe(child.schoolId)
        expect(entry.studentFirstName).toBe("Youssef")
        expect(entry.installments.length).toBeGreaterThan(0)
        expect(entry.paymentHistory).toHaveLength(1)
        expect(entry.paymentHistory[0].receiptNumber).not.toBeNull()
        // The first (paid) installment no longer contributes to the balance —
        // only the still-unpaid ones do.
        expect(entry.balanceOwedMad).toBeLessThan(
          entry.installments.reduce((sum, i) => sum + i.amountMad, 0)
        )
      })
    ))

  it.effect("a multi-school guardian's view aggregates every child across schools into one result", () =>
    withGuardianPerson((guardianPersonId) =>
      Effect.gen(function*() {
        const childA = yield* seedChildForGuardian(
          "Self-service multi-school test school A",
          guardianPersonId,
          "Youssef",
          1200
        )
        const childB = yield* seedChildForGuardian(
          "Self-service multi-school test school B",
          guardianPersonId,
          "Adam",
          1000
        )

        const status = yield* findMyChildrenFinancialStatus(guardianPersonId).pipe(
          Effect.provide(Layer.merge(EvaluationServicesNone, asFinancialGuardian(guardianPersonId)))
        )

        expect(status).toHaveLength(2)
        const schoolIds = status.map((entry) => entry.schoolId).sort()
        expect(schoolIds).toEqual([childA.schoolId, childB.schoolId].sort())
      })
    ))

  it.effect("a guardian cannot see another guardian's children", () =>
    withGuardianPerson((guardianAPersonId) =>
      Effect.gen(function*() {
        yield* seedChildForGuardian("Self-service authorization test school", guardianAPersonId, "Youssef", 1200)

        const guardianBPersonId = yield* createPerson({
          firstName: "Karim",
          lastName: "OtherGuardian",
          dateOfBirth: "1980-01-01"
        }).pipe(Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

        // Guardian B's own subject, attempting to read Guardian A's id.
        const result = yield* Effect.result(
          findMyChildrenFinancialStatus(guardianAPersonId).pipe(
            Effect.provide(Layer.merge(EvaluationServicesNone, asFinancialGuardian(guardianBPersonId)))
          )
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) expect(result.failure).toBeInstanceOf(AccessDenied)
      })
    ))
})
