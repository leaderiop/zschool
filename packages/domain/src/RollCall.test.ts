import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { insertEnrollment } from "./Enrollment.ts"
import {
  arbitrateRollCallDiscrepancy,
  confirmRollCallForSession,
  findAttendanceRecordStatus,
  RollCallEntry,
  sessionKey
} from "./RollCall.ts"
import { createSlot, findOrCreateSessionForRollCall } from "./Session.ts"
import { assignTeacherToCourse } from "./TeacherAssignment.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

const asTeacher = (schoolId: string, teacherPersonId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({
        id: teacherPersonId,
        roles: ["teacher"],
        attributes: { school_id: schoolId, person_id: teacherPersonId }
      })
    )
  )

const asStudentLifeOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({ id: "sl-1", roles: ["student_life"], attributes: { school_id: schoolId, cycle_ids: [] } })
    )
  )

/** Seeds a school, cycle, class, course, an assigned teacher, a Slot, and one enrolled student. */
const withRollCallFixture = Effect.fn(function*<A, E, R>(
  use: (
    seed: { schoolId: string; sessionId: string; teacherPersonId: string; studentEnrollmentId: string }
  ) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #96 test school') RETURNING id
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
      const [subject] = yield* sql<{ id: string }>`
        INSERT INTO subjects (school_id, academic_year_id, section_id, code, name)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'MATH', 'Mathématiques') RETURNING id
      `
      const [subjectLevelConfig] = yield* sql<{ id: string }>`
        INSERT INTO subject_level_configs (school_id, academic_year_id, subject_id, level_id, coefficient, teaching_language)
        VALUES (${school.id}, ${year.id}, ${subject.id}, ${level.id}, 1, 'fr') RETURNING id
      `
      const [course] = yield* sql<{ id: string }>`
        INSERT INTO courses (school_id, academic_year_id, class_id, subject_level_config_id)
        VALUES (${school.id}, ${year.id}, ${cls.id}, ${subjectLevelConfig.id}) RETURNING id
      `

      const teacherPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${teacherPersonId}, 'Samira', 'Teacher', '1985-01-01')
      `
      yield* assignTeacherToCourse(school.id, course.id, teacherPersonId).pipe(
        Effect.provide(asDirectorOf(school.id))
      )

      const slot = yield* createSlot(school.id, cycle.id, "Period 1", 1, "morning").pipe(
        Effect.provide(asDirectorOf(school.id))
      )

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

      const session = yield* findOrCreateSessionForRollCall(school.id, course.id, "2020-09-07", slot.id).pipe(
        Effect.provide(asTeacher(school.id, teacherPersonId))
      )

      return yield* use({
        schoolId: school.id,
        sessionId: session.id,
        teacherPersonId,
        studentEnrollmentId: enrollment.id
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("confirmRollCallForSession (ticket #96)", () => {
  it.effect("first-absence: confirming inserts a submission and upserts attendance_records", () =>
    withRollCallFixture(({ schoolId, sessionId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "absent" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const status = yield* findAttendanceRecordStatus(schoolId, sessionKey(sessionId), studentEnrollmentId)
        expect(status).toBe("absent")

        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ count: string }>`
            SELECT count(*)::int AS count FROM roll_call_submissions
            WHERE key = ${sessionKey(sessionId)} AND student_enrollment_id = ${studentEnrollmentId}
          `
        )
        expect(Number(rows[0].count)).toBe(1)
      })
    ))

  it.effect(
    "offline-arrival-conflict: a second confirmation for an already-confirmed key opens a discrepancy instead of overwriting",
    () =>
      withRollCallFixture(({ schoolId, sessionId, studentEnrollmentId, teacherPersonId }) =>
        Effect.gen(function*() {
          yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
            new RollCallEntry({ studentEnrollmentId, status: "absent" })
          ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

          yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
            new RollCallEntry({ studentEnrollmentId, status: "present" })
          ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

          // attendance_records keeps the FIRST confirmed value — arbitration
          // is the only thing allowed to change it.
          const status = yield* findAttendanceRecordStatus(schoolId, sessionKey(sessionId), studentEnrollmentId)
          expect(status).toBe("absent")

          const sql = yield* SqlClient
          const discrepancies = yield* withSchool(
            schoolId,
            sql<{ id: string }>`
              SELECT id FROM roll_call_discrepancies
              WHERE key = ${sessionKey(sessionId)} AND student_enrollment_id = ${studentEnrollmentId} AND resolved_at IS NULL
            `
          )
          expect(discrepancies).toHaveLength(1)
        })
      )
  )

  it.effect("correction: student-life arbitration supersedes both submissions and resolves the discrepancy", () =>
    withRollCallFixture(({ schoolId, sessionId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "absent" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "present" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const sql = yield* SqlClient
        const [discrepancy] = yield* withSchool(
          schoolId,
          sql<{ id: string }>`
            SELECT id FROM roll_call_discrepancies
            WHERE key = ${sessionKey(sessionId)} AND student_enrollment_id = ${studentEnrollmentId} AND resolved_at IS NULL
          `
        )

        const studentLifePersonId = yield* randomUUID
        yield* sql`
          INSERT INTO persons (id, first_name, last_name, date_of_birth)
          VALUES (${studentLifePersonId}, 'Amina', 'StudentLife', '1980-01-01')
        `
        yield* arbitrateRollCallDiscrepancy(schoolId, discrepancy.id, "tardy", studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )

        const status = yield* findAttendanceRecordStatus(schoolId, sessionKey(sessionId), studentEnrollmentId)
        expect(status).toBe("tardy")

        const stillOpen = yield* withSchool(
          schoolId,
          sql<{ id: string }>`
            SELECT id FROM roll_call_discrepancies WHERE id = ${discrepancy.id} AND resolved_at IS NULL
          `
        )
        expect(stillOpen).toHaveLength(0)

        const unsuperseded = yield* withSchool(
          schoolId,
          sql<{ id: string }>`
            SELECT id FROM roll_call_submissions
            WHERE key = ${sessionKey(sessionId)} AND student_enrollment_id = ${studentEnrollmentId} AND superseded_by_id IS NULL
          `
        )
        expect(unsuperseded).toHaveLength(1)
      })
    ))
})
