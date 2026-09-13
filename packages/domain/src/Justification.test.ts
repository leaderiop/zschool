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
import {
  createJustificationReasonCode,
  findPendingJustifications,
  refuseJustification,
  submitJustification,
  validateJustification
} from "./Justification.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asFrontOfficeOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({ id: "fo-1", roles: ["front_office"], attributes: { school_id: schoolId, cycle_ids: [] } })
    )
  )

const asStudentLifeOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({ id: "sl-1", roles: ["student_life"], attributes: { school_id: schoolId, cycle_ids: [] } })
    )
  )

/** Seeds a school, a class, and one enrolled student. */
const withJustificationFixture = Effect.fn(function*<A, E, R>(
  use: (
    seed: {
      schoolId: string
      studentEnrollmentId: string
      frontOfficePersonId: string
      studentLifePersonId: string
    }
  ) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #103 justification test school') RETURNING id
  `
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

      const studentPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${studentPersonId}, 'Nadia', 'Student', '2010-01-01')
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

      const frontOfficePersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${frontOfficePersonId}, 'Fatima', 'FrontOffice', '1990-01-01')
      `
      const studentLifePersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${studentLifePersonId}, 'Amina', 'StudentLife', '1980-01-01')
      `

      return yield* use({
        schoolId: school.id,
        studentEnrollmentId: enrollment.id,
        frontOfficePersonId,
        studentLifePersonId
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("Justification validation queue (ticket #103, SCR-ZS-054)", () => {
  it.effect("front-office can submit a justification, which appears in student-life's pending queue", () =>
    withJustificationFixture(({ frontOfficePersonId, schoolId, studentEnrollmentId }) =>
      Effect.gen(function*() {
        const reason = yield* createJustificationReasonCode(schoolId, "Medical appointment").pipe(
          Effect.provide(asFrontOfficeOf(schoolId))
        )
        const justification = yield* submitJustification(
          schoolId,
          studentEnrollmentId,
          "session:fake-session-id",
          reason.id,
          "Doctor's note provided",
          null,
          frontOfficePersonId
        ).pipe(Effect.provide(asFrontOfficeOf(schoolId)))
        expect(justification.status).toBe("submitted")

        const pending = yield* findPendingJustifications(schoolId).pipe(Effect.provide(asStudentLifeOf(schoolId)))
        expect(pending.map((j) => j.id)).toContain(justification.id)
      })
    ))

  it.effect("front-office cannot validate a justification (only student-life can)", () =>
    withJustificationFixture(({ frontOfficePersonId, schoolId, studentEnrollmentId }) =>
      Effect.gen(function*() {
        const reason = yield* createJustificationReasonCode(schoolId, "Family emergency").pipe(
          Effect.provide(asFrontOfficeOf(schoolId))
        )
        const justification = yield* submitJustification(
          schoolId,
          studentEnrollmentId,
          "session:fake-session-id",
          reason.id,
          null,
          null,
          frontOfficePersonId
        ).pipe(Effect.provide(asFrontOfficeOf(schoolId)))

        const result = yield* Effect.result(
          validateJustification(schoolId, justification.id, frontOfficePersonId).pipe(
            Effect.provide(asFrontOfficeOf(schoolId))
          )
        )
        expect(Result.isFailure(result)).toBe(true)
      })
    ))

  it.effect("student-life can validate a justification, removing it from the pending queue", () =>
    withJustificationFixture(({ frontOfficePersonId, schoolId, studentEnrollmentId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const reason = yield* createJustificationReasonCode(schoolId, "Transport strike").pipe(
          Effect.provide(asFrontOfficeOf(schoolId))
        )
        const justification = yield* submitJustification(
          schoolId,
          studentEnrollmentId,
          "session:fake-session-id",
          reason.id,
          null,
          null,
          frontOfficePersonId
        ).pipe(Effect.provide(asFrontOfficeOf(schoolId)))

        yield* validateJustification(schoolId, justification.id, studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )

        const pending = yield* findPendingJustifications(schoolId).pipe(Effect.provide(asStudentLifeOf(schoolId)))
        expect(pending.map((j) => j.id)).not.toContain(justification.id)
      })
    ))

  it.effect("student-life can refuse a justification with a reason", () =>
    withJustificationFixture(({ frontOfficePersonId, schoolId, studentEnrollmentId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const reason = yield* createJustificationReasonCode(schoolId, "Overslept").pipe(
          Effect.provide(asFrontOfficeOf(schoolId))
        )
        const justification = yield* submitJustification(
          schoolId,
          studentEnrollmentId,
          "session:fake-session-id",
          reason.id,
          null,
          null,
          frontOfficePersonId
        ).pipe(Effect.provide(asFrontOfficeOf(schoolId)))

        yield* refuseJustification(schoolId, justification.id, "Not a valid reason", studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )

        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ status: string; refusal_reason: string }>`
            SELECT status, refusal_reason FROM justifications WHERE id = ${justification.id}
          `
        )
        expect(rows[0].status).toBe("refused")
        expect(rows[0].refusal_reason).toBe("Not a valid reason")
      })
    ))
})
