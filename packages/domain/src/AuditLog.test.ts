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
import { StubNotificationSenderLive } from "./AttendanceNotification.ts"
import { exportAuditLogCsv, exportAuditLogJson, withDisciplinaryAccessLog, writeAuditLog } from "./AuditLog.ts"
import {
  createDisciplineSeverityLevel,
  findDisciplineStats,
  findIncidentsForStudentAudited,
  reportIncident
} from "./Discipline.ts"
import { insertEnrollment } from "./Enrollment.ts"

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

const withAuditFixture = Effect.fn(function*<A, E, R>(
  use: (seed: { schoolId: string; classId: string; studentEnrollmentId: string; teacherPersonId: string }) => Effect.Effect<
    A,
    E,
    R
  >
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #105 test school') RETURNING id
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

      const teacherPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${teacherPersonId}, 'Samira', 'Teacher', '1985-01-01')
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

      return yield* use({
        schoolId: school.id,
        classId: cls.id,
        studentEnrollmentId: enrollment.id,
        teacherPersonId
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer, StubNotificationSenderLive)))

describe("discipline statistics rollup (ticket #105)", () => {
  it.effect("reportIncident keeps discipline_stats_by_class_period in sync transactionally", () =>
    withAuditFixture(({ classId, schoolId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        const severity = yield* createDisciplineSeverityLevel(schoolId, "Minor", 1).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        yield* reportIncident(schoolId, studentEnrollmentId, "2020-09-10", "Classroom", severity.id, "Talking", [], teacherPersonId)
          .pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))
        yield* reportIncident(schoolId, studentEnrollmentId, "2020-09-15", "Classroom", severity.id, "Talking again", [], teacherPersonId)
          .pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const stats = yield* findDisciplineStats(schoolId).pipe(Effect.provide(asDirectorOf(schoolId)))
        const septemberRow = stats.find((s) => s.class_id === classId && s.period_label === "2020-09")
        expect(septemberRow?.incident_count).toBe(2)
      })
    ))
})

describe("audit log (ticket #105)", () => {
  it.effect("writeAuditLog records a row with before/after values", () =>
    withAuditFixture(({ schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* writeAuditLog(schoolId, teacherPersonId, "test_action", "test_entity", "entity-1", { a: 1 }, { a: 2 })
        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ action: string; before_value: { a: number }; after_value: { a: number } }>`
            SELECT action, before_value, after_value FROM audit_log WHERE entity_id = 'entity-1'
          `
        )
        expect(rows[0].action).toBe("test_action")
        expect(rows[0].before_value).toEqual({ a: 1 })
        expect(rows[0].after_value).toEqual({ a: 2 })
      })
    ))

  it.effect("reportIncident itself writes an audit_log row", () =>
    withAuditFixture(({ schoolId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        const severity = yield* createDisciplineSeverityLevel(schoolId, "Minor", 1).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const incident = yield* reportIncident(
          schoolId,
          studentEnrollmentId,
          "2020-09-10",
          "Classroom",
          severity.id,
          "Talking",
          [],
          teacherPersonId
        ).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ action: string }>`
            SELECT action FROM audit_log WHERE entity_type = 'incident' AND entity_id = ${incident.id}
          `
        )
        expect(rows.map((r) => r.action)).toContain("report_incident")
      })
    ))

  it.effect("withDisciplinaryAccessLog logs an 'access' row only when the wrapped read succeeds", () =>
    withAuditFixture(({ schoolId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        const severity = yield* createDisciplineSeverityLevel(schoolId, "Minor", 1).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        yield* reportIncident(schoolId, studentEnrollmentId, "2020-09-10", "Classroom", severity.id, "Talking", [], teacherPersonId)
          .pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        yield* findIncidentsForStudentAudited(schoolId, studentEnrollmentId, teacherPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ action: string }>`
            SELECT action FROM audit_log
            WHERE entity_type = 'incident' AND entity_id = ${studentEnrollmentId} AND actor_person_id = ${teacherPersonId}
          `
        )
        expect(rows.map((r) => r.action)).toContain("access")
      })
    ))

  it.effect("exportAuditLogCsv and exportAuditLogJson return the same rows in different shapes", () =>
    withAuditFixture(({ schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* writeAuditLog(schoolId, teacherPersonId, "test_action", "test_entity", "entity-1", null, null)

        const csv = yield* exportAuditLogCsv(schoolId).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(csv).toContain("test_action")
        expect(csv.split("\n")[0]).toBe("id,actor_person_id,action,entity_type,entity_id,created_at")

        const json = yield* exportAuditLogJson(schoolId).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(json.some((e) => e.action === "test_action")).toBe(true)
      })
    ))
})
