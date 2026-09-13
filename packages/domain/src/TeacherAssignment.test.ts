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
import {
  assignTeacherToCourse,
  deactivateTeacherAssignment,
  findActiveAssignedTeacherPersonIds
} from "./TeacherAssignment.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/** Seeds a school, one class, one course, and one teacher `Person` (no `TeacherAssignment` row yet). */
const withCourseAndTeacher = Effect.fn(function*<A, E, R>(
  use: (seed: { schoolId: string; courseId: string; teacherPersonId: string }) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #94 course test school') RETURNING id
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

      return yield* use({ schoolId: school.id, courseId: course.id, teacherPersonId })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("TeacherAssignment (ticket #94)", () => {
  it.effect("a course with no assignment has no assigned teachers", () =>
    withCourseAndTeacher(({ courseId }) =>
      Effect.gen(function*() {
        const assigned = yield* findActiveAssignedTeacherPersonIds(courseId)
        expect(assigned).toEqual([])
      })
    ))

  it.effect("assigning a teacher to a course makes them appear as actively assigned", () =>
    withCourseAndTeacher(({ courseId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* assignTeacherToCourse(schoolId, courseId, teacherPersonId).pipe(Effect.provide(asDirectorOf(schoolId)))
        const assigned = yield* findActiveAssignedTeacherPersonIds(courseId)
        expect(assigned).toEqual([teacherPersonId])
      })
    ))

  it.effect("assigning the same (course, teacher) pair twice is idempotent", () =>
    withCourseAndTeacher(({ courseId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* assignTeacherToCourse(schoolId, courseId, teacherPersonId).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* assignTeacherToCourse(schoolId, courseId, teacherPersonId).pipe(Effect.provide(asDirectorOf(schoolId)))
        const assigned = yield* findActiveAssignedTeacherPersonIds(courseId)
        expect(assigned).toEqual([teacherPersonId])
      })
    ))

  it.effect("deactivating an assignment removes the teacher from the active list", () =>
    withCourseAndTeacher(({ courseId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* assignTeacherToCourse(schoolId, courseId, teacherPersonId).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* deactivateTeacherAssignment(schoolId, courseId, teacherPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const assigned = yield* findActiveAssignedTeacherPersonIds(courseId)
        expect(assigned).toEqual([])
      })
    ))
})
