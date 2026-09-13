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
  approveSuspension,
  createDisciplineSeverityLevel,
  createSanctionType,
  decideSanction,
  executeTemporaryExpulsion,
  findPendingSuspensionProposals,
  isStudentTemporarilyExcluded,
  proposeSuspension,
  reportIncident
} from "./Discipline.ts"
import { StubNotificationSenderLive } from "./AttendanceNotification.ts"
import { insertEnrollment } from "./Enrollment.ts"
import { confirmRollCallForSession, findAttendanceRecordStatus, RollCallEntry, sessionKey } from "./RollCall.ts"
import { createSlot, findOrCreateSessionForRollCall } from "./Session.ts"
import { assignTeacherToCourse } from "./TeacherAssignment.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asDirectorOf = (schoolId: string, directorPersonId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({ id: directorPersonId, roles: ["director"], attributes: { school_id: schoolId } })
    )
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

const asStudentLifeOf = (schoolId: string, studentLifePersonId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({
        id: studentLifePersonId,
        roles: ["student_life"],
        attributes: { school_id: schoolId, cycle_ids: [] }
      })
    )
  )

/** Seeds a school, cycle, class, course, an assigned teacher, a director, a student-life member, a Slot, and one enrolled student. */
const withDisciplineFixture = Effect.fn(function*<A, E, R>(
  use: (
    seed: {
      schoolId: string
      courseId: string
      sessionId: string
      teacherPersonId: string
      directorPersonId: string
      studentLifePersonId: string
      studentEnrollmentId: string
    }
  ) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #103 test school') RETURNING id
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
      const directorPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${directorPersonId}, 'Director', 'One', '1975-01-01')
      `
      const studentLifePersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${studentLifePersonId}, 'Amina', 'StudentLife', '1980-01-01')
      `

      yield* assignTeacherToCourse(school.id, course.id, teacherPersonId).pipe(
        Effect.provide(asDirectorOf(school.id, directorPersonId))
      )

      const slot = yield* createSlot(school.id, cycle.id, "Period 1", 1, "morning").pipe(
        Effect.provide(asDirectorOf(school.id, directorPersonId))
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
        courseId: course.id,
        sessionId: session.id,
        teacherPersonId,
        directorPersonId,
        studentLifePersonId,
        studentEnrollmentId: enrollment.id
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer, StubNotificationSenderLive)))

describe("Incident/Sanction (ticket #103)", () => {
  it.effect("a teacher can report an incident in their own school", () =>
    withDisciplineFixture(({ directorPersonId, schoolId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        const severity = yield* createDisciplineSeverityLevel(schoolId, "Minor", 1).pipe(
          Effect.provide(asDirectorOf(schoolId, directorPersonId))
        )
        const incident = yield* reportIncident(
          schoolId,
          studentEnrollmentId,
          "2020-09-10",
          "Classroom",
          severity.id,
          "Disrupted class",
          ["witness-1"],
          teacherPersonId
        ).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))
        expect(incident.description).toBe("Disrupted class")
        expect(incident.witnesses).toEqual(["witness-1"])
      })
    ))

  it.effect("student-life (not a teacher) decides a sanction for a reported incident", () =>
    withDisciplineFixture(({ directorPersonId, schoolId, studentEnrollmentId, studentLifePersonId, teacherPersonId }) =>
      Effect.gen(function*() {
        const severity = yield* createDisciplineSeverityLevel(schoolId, "Major", 1).pipe(
          Effect.provide(asDirectorOf(schoolId, directorPersonId))
        )
        const incident = yield* reportIncident(
          schoolId,
          studentEnrollmentId,
          "2020-09-10",
          "Playground",
          severity.id,
          "Fight",
          [],
          teacherPersonId
        ).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const sanctionType = yield* createSanctionType(schoolId, "Temporary expulsion", true).pipe(
          Effect.provide(asDirectorOf(schoolId, directorPersonId))
        )

        const teacherAttempt = yield* Effect.result(
          decideSanction(schoolId, incident.id, sanctionType.id, 1, "Detention", teacherPersonId).pipe(
            Effect.provide(asTeacher(schoolId, teacherPersonId))
          )
        )
        expect(Result.isFailure(teacherAttempt)).toBe(true)

        const sanction = yield* decideSanction(
          schoolId,
          incident.id,
          sanctionType.id,
          3,
          "3-day exclusion",
          studentLifePersonId
        ).pipe(Effect.provide(asStudentLifeOf(schoolId, studentLifePersonId)))
        expect(sanction.execution_status).toBe("in_progress")
      })
    ))

  it.effect(
    "executing a temporary expulsion produces exclusion-status attendance_records and suppresses future notification/discrepancy",
    () =>
      withDisciplineFixture(
        ({ courseId, directorPersonId, schoolId, sessionId, studentEnrollmentId, studentLifePersonId, teacherPersonId }) =>
        Effect.gen(function*() {
          const severity = yield* createDisciplineSeverityLevel(schoolId, "Severe", 1).pipe(
            Effect.provide(asDirectorOf(schoolId, directorPersonId))
          )
          const incident = yield* reportIncident(
            schoolId,
            studentEnrollmentId,
            "2020-09-07",
            "Hallway",
            severity.id,
            "Serious misconduct",
            [],
            teacherPersonId
          ).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))
          const sanctionType = yield* createSanctionType(schoolId, "Temporary expulsion", true).pipe(
            Effect.provide(asDirectorOf(schoolId, directorPersonId))
          )
          const sanction = yield* decideSanction(
            schoolId,
            incident.id,
            sanctionType.id,
            3,
            "3-day exclusion",
            studentLifePersonId
          ).pipe(Effect.provide(asStudentLifeOf(schoolId, studentLifePersonId)))

          // A roll call already happened for this session BEFORE the
          // sanction is decided — this exercises the backfill half of
          // executeTemporaryExpulsion (existing attendance_records rows get
          // overwritten to "exclusion", not just future ones).
          yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
            new RollCallEntry({ studentEnrollmentId, status: "present" })
          ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

          yield* executeTemporaryExpulsion(
            schoolId,
            sanction.id,
            studentEnrollmentId,
            "2020-09-07",
            "2020-09-09",
            studentLifePersonId
          ).pipe(Effect.provide(asStudentLifeOf(schoolId, studentLifePersonId)))

          const status = yield* findAttendanceRecordStatus(schoolId, sessionKey(sessionId), studentEnrollmentId)
          expect(status).toBe("exclusion")

          const excluded = yield* isStudentTemporarilyExcluded(studentEnrollmentId, "2020-09-08")
          expect(excluded).toBe(true)

          // A NEW confirmation on a later date inside the window (a
          // different session for the same course/day) is forced to
          // "exclusion" regardless of what's submitted, non-editable.
          const slotId = yield* Effect.gen(function*() {
            const sql = yield* SqlClient
            const [row] = yield* sql<{ slot_id: string }>`SELECT slot_id FROM sessions WHERE id = ${sessionId}`
            return row.slot_id
          })
          const laterSession = yield* findOrCreateSessionForRollCall(schoolId, courseId, "2020-09-08", slotId).pipe(
            Effect.provide(asTeacher(schoolId, teacherPersonId))
          )
          yield* confirmRollCallForSession(schoolId, laterSession.id, teacherPersonId, [
            new RollCallEntry({ studentEnrollmentId, status: "present" })
          ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

          const laterStatus = yield* findAttendanceRecordStatus(
            schoolId,
            sessionKey(laterSession.id),
            studentEnrollmentId
          )
          expect(laterStatus).toBe("exclusion")
        })
      )
  )
})

describe("suspension proposal (ticket #103 / ADR-ZS-057)", () => {
  it.effect("proposing a suspension never sets Enrollment.status directly; only director approval does", () =>
    withDisciplineFixture(({ directorPersonId, schoolId, studentEnrollmentId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const proposal = yield* proposeSuspension(
          schoolId,
          studentEnrollmentId,
          null,
          "Repeated incidents",
          studentLifePersonId
        ).pipe(Effect.provide(asStudentLifeOf(schoolId, studentLifePersonId)))

        const beforeApproval = yield* withSchool(
          schoolId,
          sql<{ status: string }>`SELECT status FROM enrollments WHERE id = ${studentEnrollmentId}`
        )
        expect(beforeApproval[0].status).toBe("active")

        const pending = yield* findPendingSuspensionProposals(schoolId).pipe(
          Effect.provide(asDirectorOf(schoolId, directorPersonId))
        )
        expect(pending.map((p) => p.id)).toContain(proposal.id)

        yield* approveSuspension(schoolId, proposal.id, directorPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId, directorPersonId))
        )

        const afterApproval = yield* withSchool(
          schoolId,
          sql<{ status: string }>`SELECT status FROM enrollments WHERE id = ${studentEnrollmentId}`
        )
        expect(afterApproval[0].status).toBe("suspended")
      })
    ))

  it.effect("student-life cannot approve a suspension themselves", () =>
    withDisciplineFixture(({ schoolId, studentEnrollmentId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const proposal = yield* proposeSuspension(
          schoolId,
          studentEnrollmentId,
          null,
          "Repeated incidents",
          studentLifePersonId
        ).pipe(Effect.provide(asStudentLifeOf(schoolId, studentLifePersonId)))
        const result = yield* Effect.result(
          approveSuspension(schoolId, proposal.id, studentLifePersonId).pipe(
            Effect.provide(asStudentLifeOf(schoolId, studentLifePersonId))
          )
        )
        expect(Result.isFailure(result)).toBe(true)
      })
    ))
})
