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
  bulkDeclareSessions,
  createSlot,
  findOrCreateSessionForRollCall,
  findSlots,
  markSessionNotHeld,
  markSessionSubstituted
} from "./Session.ts"
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

/** Seeds a school, cycle, class, course, and one teacher `Person` (no `TeacherAssignment` yet). */
const withCourse = Effect.fn(function*<A, E, R>(
  use: (seed: { schoolId: string; cycleId: string; courseId: string; teacherPersonId: string }) => Effect.Effect<
    A,
    E,
    R
  >
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Ticket #95 test school') RETURNING id`
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

      return yield* use({ schoolId: school.id, cycleId: cycle.id, courseId: course.id, teacherPersonId })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("Slot (ticket #95)", () => {
  it.effect("slots are created and orderable per school/cycle", () =>
    withCourse(({ cycleId, schoolId }) =>
      Effect.gen(function*() {
        yield* createSlot(schoolId, cycleId, "Period 2", 2, "morning").pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* createSlot(schoolId, cycleId, "Period 1", 1, "morning").pipe(Effect.provide(asDirectorOf(schoolId)))
        const slots = yield* findSlots(schoolId, cycleId)
        expect(slots.map((s) => s.label)).toEqual(["Period 1", "Period 2"])
      })
    ))
})

describe("bulkDeclareSessions (ticket #95)", () => {
  it.effect("student-life can bulk-declare sessions for a course over a date range", () =>
    withCourse(({ courseId, cycleId, schoolId }) =>
      Effect.gen(function*() {
        const slot = yield* createSlot(schoolId, cycleId, "Period 1", 1, "morning").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const created = yield* bulkDeclareSessions(schoolId, courseId, slot.id, "2020-09-07", "2020-09-09").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(created).toHaveLength(3)

        // Re-running over an overlapping range is additive, not duplicating.
        const createdAgain = yield* bulkDeclareSessions(schoolId, courseId, slot.id, "2020-09-09", "2020-09-10").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(createdAgain).toHaveLength(1)
      })
    ))
})

describe("findOrCreateSessionForRollCall (ticket #95)", () => {
  it.effect("a teacher with no TeacherAssignment cannot create an ad hoc session", () =>
    withCourse(({ courseId, cycleId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const slot = yield* createSlot(schoolId, cycleId, "Period 1", 1, "morning").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const result = yield* Effect.result(
          findOrCreateSessionForRollCall(schoolId, courseId, "2020-09-07", slot.id).pipe(
            Effect.provide(asTeacher(schoolId, teacherPersonId))
          )
        )
        expect(Result.isFailure(result)).toBe(true)
      })
    ))

  it.effect("an assigned teacher creates an ad hoc session pre-filled 'held' when none exists", () =>
    withCourse(({ courseId, cycleId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const slot = yield* createSlot(schoolId, cycleId, "Period 1", 1, "morning").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        yield* assignTeacherToCourse(schoolId, courseId, teacherPersonId).pipe(Effect.provide(asDirectorOf(schoolId)))

        const session = yield* findOrCreateSessionForRollCall(schoolId, courseId, "2020-09-07", slot.id).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        expect(session.status).toBe("held")

        const again = yield* findOrCreateSessionForRollCall(schoolId, courseId, "2020-09-07", slot.id).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        expect(again.id).toBe(session.id)
      })
    ))
})

describe("marking a Session uncovered/substituted (ticket #95 / ADR-ZS-046)", () => {
  it.effect("a Session can be marked not_held", () =>
    withCourse(({ courseId, cycleId, schoolId }) =>
      Effect.gen(function*() {
        const slot = yield* createSlot(schoolId, cycleId, "Period 1", 1, "morning").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const [sessionId] = yield* bulkDeclareSessions(schoolId, courseId, slot.id, "2020-09-07", "2020-09-07").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        yield* markSessionNotHeld(schoolId, sessionId).pipe(Effect.provide(asDirectorOf(schoolId)))

        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ status: string }>`SELECT status FROM sessions WHERE id = ${sessionId}`
        )
        expect(rows[0].status).toBe("not_held")
      })
    ))

  it.effect("a Session can be marked substituted, carrying the substitute teacher", () =>
    withCourse(({ courseId, cycleId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const slot = yield* createSlot(schoolId, cycleId, "Period 1", 1, "morning").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const [sessionId] = yield* bulkDeclareSessions(schoolId, courseId, slot.id, "2020-09-07", "2020-09-07").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        yield* markSessionSubstituted(schoolId, sessionId, teacherPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        // The substitute teacher — who has no `TeacherAssignment` for this
        // course — can now take roll call for this exact session's slot/date.
        const session = yield* findOrCreateSessionForRollCall(schoolId, courseId, "2020-09-07", slot.id).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        expect(session.status).toBe("substituted")
        expect(session.substitute_teacher_person_id).toBe(teacherPersonId)
      })
    ))
})
