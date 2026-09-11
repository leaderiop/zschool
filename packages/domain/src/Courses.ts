import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import { CourseId, SchoolId } from "./Ids.ts"
import { authorized, requireOwnedRow, RowWithId } from "./Ownership.ts"
import { findMandatorySubjectLevelConfigs } from "./SubjectLevelConfigs.ts"

export class NoSubjectLinkedError extends Schema.TaggedError<NoSubjectLinkedError>()("NoSubjectLinkedError", {
  groupId: Schema.String
}) {}

/**
 * `Model.Class` for `courses` (issue #40), matching migration 0006's DDL —
 * owned here, not by `SubjectLevelConfigs.ts` (that file only ever reads a
 * `Course`'s target configuration through its own `SubjectLevelConfig`
 * model, never the reverse).
 *
 * `is_active`/`deactivation_reason` are excluded from `insert`/`jsonCreate`
 * (a new course always relies on the column defaults — `true`/`NULL` — the
 * same way `AcademicTree.ts`'s `Class.is_active` does) but, unlike
 * `Class.is_active`, stay part of `update`/`jsonUpdate`: `deactivateCourse`
 * below sets both together through `courseRepo.update`, whereas
 * `AcademicTree.ts`'s class deactivation intentionally stayed a raw `UPDATE`
 * (out of that ticket's scope). Every other field is identity, fixed at
 * creation and never touched by `deactivateCourse` — excluded from
 * `update`/`jsonUpdate` the same way `SubjectLevelConfig`'s identity columns
 * are, so a `courseRepo.update(...)` payload can never carry one of them
 * (`SqlModel`'s single-row update requires every non-excluded field's Type
 * to be supplied, confirmed by `tsc -b`, not just by convention).
 */
export class Course extends Model.Class<Course>("Course")({
  // idColumn "id" — same `Model.Field` reasoning as `SubjectLevelConfigs.ts`'s
  // `Subject`/`SubjectLevelConfig` (issue #36/#39's precedent): `makeRepository`
  // requires `idColumn` to be part of `update`'s Type, and `deactivateCourse`
  // does call `.update` here.
  id: Model.Field({ select: CourseId, update: CourseId, json: CourseId, jsonUpdate: CourseId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  academic_year_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  class_id: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  group_id: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  subject_level_config_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  is_active: Schema.Boolean.pipe(Model.FieldExcept(["insert", "jsonCreate"])),
  deactivation_reason: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["insert", "jsonCreate"])),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

const courseRepo = SqlModel.makeRepository(Course, { tableName: "courses", spanPrefix: "Courses", idColumn: "id" })

/**
 * BEH-ZS-058: generates one `Course` per mandatory `SubjectLevelConfig` at
 * the class's (level, track) that doesn't already have one — additive and
 * idempotent, so calling it again after a class/config change (before any
 * teacher is assigned; `TeacherAssignment` doesn't exist yet, ticket #10)
 * only ever adds courses for newly-mandatory subjects, never touches or
 * removes an existing one.
 *
 * The mandatory-configs read goes through `SubjectLevelConfigs.ts`'s shared
 * `findMandatorySubjectLevelConfigs` (issue #40) instead of this file's own
 * independently-typed `sql<{id: string}>` query — the two files can no
 * longer disagree about what a valid configuration row looks like. The
 * actual insert stays a single batched `sql.insert` (not N
 * `courseRepo.insert` calls) for the same round-trip reason
 * `GradingScales.ts`'s `seedDefaultComputationRules` does, typed against
 * `Course.insert`'s Encoded shape so the row shape is still checked against
 * the model.
 */
export const generateCoursesForClass = Effect.fn("Courses.generateCoursesForClass")(function*(
  schoolId: string,
  academicYearId: string,
  classId: string
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const cls = yield* requireOwnedRow(
          sql,
          "classes",
          "class",
          classId,
          validSchoolId,
          Schema.Struct({ level_id: Schema.String, track_id: Schema.NullOr(Schema.String) }),
          "level_id, track_id"
        )

        const configs = yield* findMandatorySubjectLevelConfigs(schoolId, cls.level_id, cls.track_id)

        const existing = yield* sql<{ subject_level_config_id: string }>`
          SELECT subject_level_config_id FROM courses WHERE class_id = ${classId} AND school_id = ${schoolId}
        `
        const existingIds = new Set(existing.map((r) => r.subject_level_config_id))
        const missing = configs.filter((c) => !existingIds.has(c.id))

        if (missing.length === 0) return []

        const rows: Array<(typeof Course)["insert"]["Encoded"]> = missing.map((c) => ({
          school_id: schoolId,
          academic_year_id: academicYearId,
          class_id: classId,
          group_id: null,
          subject_level_config_id: c.id
        }))
        const inserted = yield* sql<{ id: string }>`INSERT INTO courses ${sql.insert(rows).returning("id")}`
        return inserted.map((r) => r.id)
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
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const group = yield* requireOwnedRow(
          sql,
          "groups",
          "group",
          groupId,
          validSchoolId,
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

        const repo = yield* courseRepo
        const course = yield* repo.insert({
          school_id: validSchoolId,
          academic_year_id: academicYearId,
          class_id: null,
          group_id: groupId,
          subject_level_config_id: group.subject_level_config_id
        })
        return course.id
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
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "courses", "course", courseId, validSchoolId, RowWithId)
        const validCourseId = yield* Schema.decodeEffect(CourseId)(courseId)
        const repo = yield* courseRepo
        yield* repo.update({ id: validCourseId, is_active: false, deactivation_reason: reason })
      })
    )
  )
})
