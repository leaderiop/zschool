import { CurrentSubject } from "@qadi/core/CurrentSubject"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { hasEnrollments } from "./Enrollment.ts"
import { LevelId, SchoolId, TrackId } from "./Ids.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, requireTrackBelongsToLevel, RowWithId } from "./Ownership.ts"

export { EntityNotFoundError }

export class EnrollmentsExistError extends Schema.TaggedError<EnrollmentsExistError>()("EnrollmentsExistError", {
  classId: Schema.String
}) {}

/**
 * `Schema.Class` instead of a plain interface (issue #34) — command payloads
 * get the same untrusted-input validation the import-row schemas already
 * get (a non-positive `capacity`, an empty `label`, now rejected here
 * instead of reaching Postgres unchecked), rather than being trusted by
 * shape alone. Decoded once, at the start of the handler below.
 */
export class CreateClassCommand extends Schema.Class<CreateClassCommand>("CreateClassCommand")({
  schoolId: SchoolId,
  academicYearId: Schema.String,
  levelId: Schema.String,
  trackId: Schema.optional(Schema.String),
  label: Schema.NonEmptyString,
  capacity: Schema.Int.check(Schema.isGreaterThan(0))
}) {}

export class CreateGroupCommand extends Schema.Class<CreateGroupCommand>("CreateGroupCommand")({
  schoolId: SchoolId,
  academicYearId: Schema.String,
  classId: Schema.String,
  code: Schema.NonEmptyString,
  name: Schema.NonEmptyString,
  groupType: Schema.Literals(["language", "option", "lab"]),
  /** Which subject this group is for — required before `Courses.ts`'s `generateCourseForGroup` can generate its course (migration 0006). */
  subjectLevelConfigId: Schema.optional(Schema.String)
}) {}

/**
 * BEH-ZS-052 / REQ-ZS-054: `Class` under a `Level`/`Track`. Every write goes
 * through `@qadi` (a director may only manage their own school's tree) and
 * is scoped by `withSchool`'s RLS session GUC, same pattern as
 * `InstantiateNationalTemplate.ts`.
 */
export const createClass = Effect.fn("AcademicTree.createClass")(function*(
  rawCommand: (typeof CreateClassCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(CreateClassCommand)(rawCommand)
  return yield* authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "levels", "level", command.levelId, command.schoolId, RowWithId)
        if (command.trackId !== undefined) {
          const trackId = yield* Schema.decodeEffect(TrackId)(command.trackId)
          const levelId = yield* Schema.decodeEffect(LevelId)(command.levelId)
          yield* requireTrackBelongsToLevel(sql, trackId, levelId, command.schoolId)
        }

        const [row] = yield* sql<{ id: string }>`
          INSERT INTO classes (school_id, academic_year_id, level_id, track_id, label, capacity)
          VALUES (
            ${command.schoolId}, ${command.academicYearId}, ${command.levelId},
            ${command.trackId ?? null}, ${command.label}, ${command.capacity}
          )
          RETURNING id
        `
        return row.id
      })
    )
  )
})

export const createGroup = Effect.fn("AcademicTree.createGroup")(function*(
  rawCommand: (typeof CreateGroupCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(CreateGroupCommand)(rawCommand)
  return yield* authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "classes", "class", command.classId, command.schoolId, RowWithId)

        const [row] = yield* sql<{ id: string }>`
          INSERT INTO groups (school_id, academic_year_id, class_id, code, name, group_type, subject_level_config_id)
          VALUES (
            ${command.schoolId}, ${command.academicYearId}, ${command.classId},
            ${command.code}, ${command.name}, ${command.groupType}, ${command.subjectLevelConfigId ?? null}
          )
          RETURNING id
        `
        return row.id
      })
    )
  )
})

/** A level's capacity is the sum of its classes' capacities (BEH-ZS-052) — never stored, always computed. */
export const levelCapacity = Effect.fn("AcademicTree.levelCapacity")(function*(
  schoolId: string,
  levelId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{ total: string | null }>`
        SELECT sum(capacity)::bigint AS total
        FROM classes
        WHERE level_id = ${levelId} AND school_id = ${schoolId} AND is_active
      `
      return row.total === null ? 0 : Number(row.total)
    })
  )
})

const auditLog = Effect.fn("AcademicTree.auditLog")(function*(
  schoolId: string,
  entityType: "cycle" | "level" | "track" | "class",
  entityId: string,
  action: "renamed" | "deactivated" | "reactivated" | "deleted",
  oldValue: unknown,
  newValue: unknown
) {
  const sql = yield* SqlClient
  const subject = yield* CurrentSubject
  yield* sql`
    INSERT INTO structure_audit_log (school_id, actor_subject_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (
      ${schoolId}, ${subject.id}, ${entityType}, ${entityId}, ${action},
      ${JSON.stringify(oldValue)}::jsonb, ${JSON.stringify(newValue)}::jsonb
    )
  `
})

const renameEntity = (
  table: "cycles" | "levels" | "tracks",
  entityType: "cycle" | "level" | "track"
) =>
  Effect.fn(`AcademicTree.rename${entityType[0].toUpperCase()}${entityType.slice(1)}`)(function*(
    schoolId: string,
    entityId: string,
    newName: string
  ) {
    const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
    return yield* authorized(
      validSchoolId,
      withSchool(
        schoolId,
        Effect.gen(function*() {
          const sql = yield* SqlClient
          const before = yield* requireOwnedRow(
            sql,
            table,
            entityType,
            entityId,
            validSchoolId,
            Schema.Struct({ name: Schema.String }),
            "name"
          )
          yield* sql`UPDATE ${sql(table)} SET name = ${newName} WHERE id = ${entityId} AND school_id = ${schoolId}`
          yield* auditLog(schoolId, entityType, entityId, "renamed", { name: before.name }, { name: newName })
        })
      )
    )
  })

/** Renaming never breaks a link created from the renamed entity — every downstream row references it by id, never by name (same guarantee as ADR-ZS-105's per-year snapshots). */
export const renameCycle = renameEntity("cycles", "cycle")
export const renameLevel = renameEntity("levels", "level")
export const renameTrack = renameEntity("tracks", "track")

export const renameClass = Effect.fn("AcademicTree.renameClass")(function*(
  schoolId: string,
  classId: string,
  newLabel: string
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const before = yield* requireOwnedRow(
          sql,
          "classes",
          "class",
          classId,
          validSchoolId,
          Schema.Struct({ label: Schema.String }),
          "label"
        )
        yield* sql`UPDATE classes SET label = ${newLabel} WHERE id = ${classId} AND school_id = ${schoolId}`
        yield* auditLog(schoolId, "class", classId, "renamed", { label: before.label }, { label: newLabel })
      })
    )
  )
})

export const deactivateClass = Effect.fn("AcademicTree.deactivateClass")(function*(
  schoolId: string,
  classId: string
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "classes", "class", classId, validSchoolId, RowWithId)
        yield* sql`UPDATE classes SET is_active = false WHERE id = ${classId} AND school_id = ${schoolId}`
        yield* auditLog(schoolId, "class", classId, "deactivated", { is_active: true }, { is_active: false })
      })
    )
  )
})

/**
 * Deleting a class with enrollments must be refused, offering deactivation
 * instead (BEH-ZS-052, ticket #3 acceptance criterion 5) — `hasEnrollments`
 * (`Enrollment.ts`, ticket #9) is the real query this stub used to await.
 * A class's own `Group`s are not a blocker — `groups.class_id` cascades on
 * delete (migration 0003).
 */
export const deleteClass = Effect.fn("AcademicTree.deleteClass")(function*(
  schoolId: string,
  classId: string
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "classes", "class", classId, validSchoolId, RowWithId)

        const occupied = yield* hasEnrollments(schoolId, classId)
        if (occupied) {
          return yield* Effect.fail(new EnrollmentsExistError({ classId }))
        }
        yield* sql`DELETE FROM classes WHERE id = ${classId} AND school_id = ${schoolId}`
        yield* auditLog(schoolId, "class", classId, "deleted", null, null)
      })
    )
  )
})
