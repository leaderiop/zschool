import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  attachGuardianProfile,
  createPerson,
  GuardianQualitiesSchema,
  recordGuardianRelationship
} from "./Identity.ts"
import { insertEnrollment } from "./Enrollment.ts"
import {
  createThirdPartyPayer,
  designateFinancialGuardian,
  findCurrentFinancialGuardian,
  findFinancialAccountPayers,
  GuardianRelationshipNotFoundError,
  InvalidSplitError,
  splitFinancialResponsibility
} from "./FinancialAccount.ts"
import { GuardianPersonId, StudentPersonId } from "./Ids.ts"

/** Same `authorized`-gating context as `TeacherImport.test.ts`'s own `asDirectorOf`. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

/**
 * Seeds school -> year -> section -> cycle -> level -> class -> a student
 * with one guardian relationship on file, then an active `Enrollment` — the
 * same chain as `Enrollment.test.ts`'s `withSeededClassAt`, extended with a
 * guardian relationship (which `designateFinancialGuardian`'s own
 * precondition requires).
 */
const withSeededEnrollment = Effect.fn(function*<A, E, R>(
  use: (
    seed: {
      schoolId: string
      academicYearId: string
      enrollmentId: string
      studentPersonId: string
      guardianPersonId: string
    }
  ) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<
    { id: string }
  >`INSERT INTO schools (name) VALUES ('FinancialAccount test school') RETURNING id`
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

      // No `RETURNING` — a brand-new student has no enrollment/relationship
      // yet for `person_select`'s RLS policy to make the row visible, same
      // reasoning as `Enrollment.test.ts`'s own `insertNewStudent`.
      const studentPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${studentPersonId}, 'Yasmine', 'Student', '2015-01-01')
      `

      const guardianPersonId = yield* createPerson({
        firstName: "Karim",
        lastName: "Guardian",
        dateOfBirth: "1985-01-01"
      })
      yield* attachGuardianProfile(guardianPersonId, "+212700000001")
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
        effectiveDate: "2026-09-01",
        hasLegalGuardian: true,
        hasFinancialGuardian: true
      })

      return yield* use({
        schoolId: school.id,
        academicYearId: year.id,
        enrollmentId: enrollment.id,
        studentPersonId,
        guardianPersonId
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("FinancialAccount (ticket #56 / BEH-ZS-172/173)", () => {
  it.effect("every enrollment gets exactly one FinancialAccount", () =>
    withSeededEnrollment(({ enrollmentId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ count: string }>`
            SELECT count(*)::int AS count FROM financial_accounts WHERE enrollment_id = ${enrollmentId}
          `
        )
        expect(Number(rows[0].count)).toBe(1)
      })
    ))

  it.effect("a financial guardian is designated and the designation is traced", () =>
    withSeededEnrollment(({ enrollmentId, guardianPersonId, schoolId }) =>
      Effect.gen(function*() {
        yield* designateFinancialGuardian(schoolId, enrollmentId, guardianPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const current = yield* findCurrentFinancialGuardian(schoolId, enrollmentId)
        expect(Option.isSome(current)).toBe(true)
        if (Option.isSome(current)) expect(current.value.guardian_person_id).toBe(guardianPersonId)
      })
    ))

  it.effect("designating a guardian with no relationship to the student is refused", () =>
    withSeededEnrollment(({ enrollmentId, schoolId }) =>
      Effect.gen(function*() {
        const strangerId = yield* createPerson({
          firstName: "Nadia",
          lastName: "Stranger",
          dateOfBirth: "1980-01-01"
        })

        const result = yield* Effect.result(
          designateFinancialGuardian(schoolId, enrollmentId, strangerId).pipe(
            Effect.provide(asDirectorOf(schoolId))
          )
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) {
          expect(result.failure).toBeInstanceOf(GuardianRelationshipNotFoundError)
        }
      })
    ))

  it.effect("re-designating a financial guardian appends a new designation rather than overwriting the old one", () =>
    withSeededEnrollment(({ enrollmentId, guardianPersonId, schoolId, studentPersonId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient

        yield* designateFinancialGuardian(schoolId, enrollmentId, guardianPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const secondGuardianId = yield* createPerson({
          firstName: "Salma",
          lastName: "SecondGuardian",
          dateOfBirth: "1982-01-01"
        })
        yield* attachGuardianProfile(secondGuardianId, "+212700000002")
        const qualities = yield* Schema.decodeEffect(GuardianQualitiesSchema)({
          relationshipType: "mother",
          isLegalGuardian: true,
          isFinancialGuardian: false,
          isCustodialGuardian: false,
          isEmergencyContact: true,
          isAuthorizedForPickup: true
        }).pipe(Effect.orDie)
        yield* recordGuardianRelationship(
          GuardianPersonId.make(secondGuardianId),
          StudentPersonId.make(studentPersonId),
          qualities
        )

        yield* designateFinancialGuardian(schoolId, enrollmentId, secondGuardianId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const current = yield* findCurrentFinancialGuardian(schoolId, enrollmentId)
        expect(Option.isSome(current) && current.value.guardian_person_id).toBe(secondGuardianId)

        const [{ count }] = yield* withSchool(
          schoolId,
          sql<{ count: string }>`SELECT count(*)::int AS count FROM financial_guardian_designations`
        )
        expect(Number(count)).toBe(2)
      })
    ))

  it.effect("a third-party payer is created carrying only the financial-guardian quality", () =>
    withSeededEnrollment(({ enrollmentId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient

        const thirdPartyId = yield* createThirdPartyPayer(schoolId, enrollmentId, {
          firstName: "Ahmed",
          lastName: "Sponsor",
          dateOfBirth: "1970-01-01",
          mobileNumber: "+212700000099"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const current = yield* findCurrentFinancialGuardian(schoolId, enrollmentId)
        expect(Option.isSome(current) && current.value.guardian_person_id).toBe(thirdPartyId)

        const [relationship] = yield* withSchool(
          schoolId,
          sql<{
            relationship_type: string
            is_financial_guardian: boolean
            is_legal_guardian: boolean
            is_custodial_guardian: boolean
            is_emergency_contact: boolean
            is_authorized_for_pickup: boolean
          }>`
            SELECT relationship_type, is_financial_guardian, is_legal_guardian, is_custodial_guardian,
                   is_emergency_contact, is_authorized_for_pickup
            FROM parent_student_relationships WHERE guardian_person_id = ${thirdPartyId}
          `
        )
        expect(relationship).toEqual({
          relationship_type: "third_party_payer",
          is_financial_guardian: true,
          is_legal_guardian: false,
          is_custodial_guardian: false,
          is_emergency_contact: false,
          is_authorized_for_pickup: false
        })
      })
    ))

  it.effect("financial responsibility can be split by percentage across multiple payers", () =>
    withSeededEnrollment(({ enrollmentId, guardianPersonId, schoolId, studentPersonId }) =>
      Effect.gen(function*() {
        const secondGuardianId = yield* createPerson({
          firstName: "Salma",
          lastName: "CoPayer",
          dateOfBirth: "1982-01-01"
        })
        const qualities = yield* Schema.decodeEffect(GuardianQualitiesSchema)({
          relationshipType: "mother",
          isLegalGuardian: true,
          isFinancialGuardian: true,
          isCustodialGuardian: false,
          isEmergencyContact: true,
          isAuthorizedForPickup: true
        }).pipe(Effect.orDie)
        yield* recordGuardianRelationship(
          GuardianPersonId.make(secondGuardianId),
          StudentPersonId.make(studentPersonId),
          qualities
        )

        const rows = yield* splitFinancialResponsibility(schoolId, enrollmentId, [
          { guardianPersonId, splitType: "percentage", splitValue: 60 },
          { guardianPersonId: secondGuardianId, splitType: "percentage", splitValue: 40 }
        ]).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(rows).toHaveLength(2)

        const payers = yield* findFinancialAccountPayers(schoolId, enrollmentId)
        expect(payers).toHaveLength(2)
        const total = payers.reduce((sum, payer) => sum + payer.split_value, 0)
        expect(total).toBe(100)
      })
    ))

  it.effect("a payer listed twice in the same split is refused", () =>
    withSeededEnrollment(({ enrollmentId, guardianPersonId, schoolId }) =>
      Effect.gen(function*() {
        const result = yield* Effect.result(
          splitFinancialResponsibility(schoolId, enrollmentId, [
            { guardianPersonId, splitType: "percentage", splitValue: 60 },
            { guardianPersonId, splitType: "percentage", splitValue: 40 }
          ]).pipe(Effect.provide(asDirectorOf(schoolId)))
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) {
          expect(result.failure).toBeInstanceOf(InvalidSplitError)
        }
      })
    ))

  it.effect("a percentage split that doesn't total 100 is refused", () =>
    withSeededEnrollment(({ enrollmentId, guardianPersonId, schoolId }) =>
      Effect.gen(function*() {
        const result = yield* Effect.result(
          splitFinancialResponsibility(schoolId, enrollmentId, [
            { guardianPersonId, splitType: "percentage", splitValue: 60 }
          ]).pipe(Effect.provide(asDirectorOf(schoolId)))
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) {
          expect(result.failure).toBeInstanceOf(InvalidSplitError)
        }
      })
    ))

  it.effect("mixing a percentage payer with a fixed-amount payer is refused", () =>
    withSeededEnrollment(({ enrollmentId, guardianPersonId, schoolId, studentPersonId }) =>
      Effect.gen(function*() {
        const secondGuardianId = yield* createPerson({
          firstName: "Salma",
          lastName: "FixedPayer",
          dateOfBirth: "1982-01-01"
        })
        const qualities = yield* Schema.decodeEffect(GuardianQualitiesSchema)({
          relationshipType: "mother",
          isLegalGuardian: true,
          isFinancialGuardian: true,
          isCustodialGuardian: false,
          isEmergencyContact: true,
          isAuthorizedForPickup: true
        }).pipe(Effect.orDie)
        yield* recordGuardianRelationship(
          GuardianPersonId.make(secondGuardianId),
          StudentPersonId.make(studentPersonId),
          qualities
        )

        const result = yield* Effect.result(
          splitFinancialResponsibility(schoolId, enrollmentId, [
            { guardianPersonId, splitType: "percentage", splitValue: 60 },
            { guardianPersonId: secondGuardianId, splitType: "fixed_amount", splitValue: 200 }
          ]).pipe(Effect.provide(asDirectorOf(schoolId)))
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) {
          expect(result.failure).toBeInstanceOf(InvalidSplitError)
        }
      })
    ))
})
