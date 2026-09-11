import { withSchool } from "@zschool/db"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { SchoolId } from "./Ids.ts"
import { authorized, requireOwnedRow, RowWithId } from "./Ownership.ts"

export class NoSubjectLinkedError extends Data.TaggedError("NoSubjectLinkedError")<{
  readonly groupId: string
}> {}

/**
 * BEH-ZS-058: generates one `Course` per mandatory `SubjectLevelConfig` at
 * the class's (level, track) that doesn't already have one — additive and
 * idempotent, so calling it again after a class/config change (before any
 * teacher is assigned; `TeacherAssignment` doesn't exist yet, ticket #10)
 * only ever adds courses for newly-mandatory subjects, never touches or
 * removes an existing one.
 */
export const generateCoursesForClass = Effect.fn("Courses.generateCoursesForClass")(function*(
  schoolId: string,
  academicYearId: string,
  classId: string
) {
  return yield* authorized(
    SchoolId(schoolId),
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const cls = yield* requireOwnedRow(
          sql,
          "classes",
          "class",
          classId,
          SchoolId(schoolId),
          Schema.Struct({ level_id: Schema.String, track_id: Schema.NullOr(Schema.String) }),
          "level_id, track_id"
        )

        const configs = yield* sql<{ id: string }>`
          SELECT slc.id FROM subject_level_configs slc
          WHERE slc.school_id = ${schoolId} AND slc.level_id = ${cls.level_id}
            AND slc.track_id IS NOT DISTINCT FROM ${cls.track_id} AND slc.is_mandatory
        `

        const existing = yield* sql<{ subject_level_config_id: string }>`
          SELECT subject_level_config_id FROM courses WHERE class_id = ${classId} AND school_id = ${schoolId}
        `
        const existingIds = new Set(existing.map((r) => r.subject_level_config_id))
        const missing = configs.filter((c) => !existingIds.has(c.id))

        if (missing.length === 0) return []

        const rows = yield* sql<{ id: string }>`
          INSERT INTO courses ${
          sql.insert(
            missing.map((c) => ({
              school_id: schoolId,
              academic_year_id: academicYearId,
              class_id: classId,
              subject_level_config_id: c.id
            }))
          ).returning("id")
        }
        `
        return rows.map((r) => r.id)
      })
    )
  )
})

/** BEH-ZS-058: a language/option/lab group's course, once the group is linked to a subject configuration (`groups.subject_level_config_id`, migration 0006). */
export const generateCourseForGroup = Effect.fn("Courses.generateCourseForGroup")(function*(
  schoolId: string,
  academicYearId: string,
  groupId: string
) {
  return yield* authorized(
    SchoolId(schoolId),
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const group = yield* requireOwnedRow(
          sql,
          "groups",
          "group",
          groupId,
          SchoolId(schoolId),
          Schema.Struct({ subject_level_config_id: Schema.NullOr(Schema.String) }),
          "subject_level_config_id"
        )
        if (group.subject_level_config_id === null) {
          return yield* Effect.fail(new NoSubjectLinkedError({ groupId }))
        }

        const existing = yield* sql<{ id: string }>`
          SELECT id FROM courses WHERE group_id = ${groupId} AND subject_level_config_id = ${group.subject_level_config_id}
        `
        if (existing.length > 0) return existing[0].id

        const [row] = yield* sql<{ id: string }>`
          INSERT INTO courses (school_id, academic_year_id, group_id, subject_level_config_id)
          VALUES (${schoolId}, ${academicYearId}, ${groupId}, ${group.subject_level_config_id})
          RETURNING id
        `
        return row.id
      })
    )
  )
})

/** A director deactivates a generated course when a configured subject isn't actually taught in that class/group. */
export const deactivateCourse = Effect.fn("Courses.deactivateCourse")(function*(
  schoolId: string,
  courseId: string,
  reason: string
) {
  return yield* authorized(
    SchoolId(schoolId),
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "courses", "course", courseId, SchoolId(schoolId), RowWithId)
        yield* sql`
          UPDATE courses SET is_active = false, deactivation_reason = ${reason}
          WHERE id = ${courseId} AND school_id = ${schoolId}
        `
      })
    )
  )
})
