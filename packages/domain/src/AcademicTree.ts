import { CurrentSubject } from "@qadi/core/CurrentSubject"
import type { EvaluationServices } from "@qadi/core/Evaluate"
import type { EnforcementError } from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { hasEnrollments } from "./Enrollment.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, requireTrackBelongsToLevel } from "./Ownership.ts"

export { EntityNotFoundError }

export class EnrollmentsExistError extends Data.TaggedError("EnrollmentsExistError")<{
  readonly classId: string
}> {}

export interface CreateClassCommand {
  readonly schoolId: string
  readonly academicYearId: string
  readonly levelId: string
  readonly trackId?: string
  readonly label: string
  readonly capacity: number
}

export interface CreateGroupCommand {
  readonly schoolId: string
  readonly academicYearId: string
  readonly classId: string
  readonly code: string
  readonly name: string
  readonly groupType: "language" | "option" | "lab"
  /** Which subject this group is for — required before `Courses.ts`'s `generateCourseForGroup` can generate its course (migration 0006). */
  readonly subjectLevelConfigId?: string
}

/**
 * BEH-ZS-052 / REQ-ZS-054: `Class` under a `Level`/`Track`. Every write goes
 * through `@qadi` (a director may only manage their own school's tree) and
 * is scoped by `withSchool`'s RLS session GUC, same pattern as
 * `InstantiateNationalTemplate.ts`.
 */
export const createClass = (
  command: CreateClassCommand
): Effect.Effect<string, EnforcementError | EntityNotFoundError | SqlError, SqlClient | EvaluationServices> =>
  authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "levels", "level", command.levelId, command.schoolId)
        if (command.trackId !== undefined) {
          yield* requireTrackBelongsToLevel(sql, command.trackId, command.levelId, command.schoolId)
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
      }).pipe(Effect.withSpan("AcademicTree.createClass"))
    )
  )

export const createGroup = (
  command: CreateGroupCommand
): Effect.Effect<string, EnforcementError | EntityNotFoundError | SqlError, SqlClient | EvaluationServices> =>
  authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "classes", "class", command.classId, command.schoolId)

        const [row] = yield* sql<{ id: string }>`
          INSERT INTO groups (school_id, academic_year_id, class_id, code, name, group_type, subject_level_config_id)
          VALUES (
            ${command.schoolId}, ${command.academicYearId}, ${command.classId},
            ${command.code}, ${command.name}, ${command.groupType}, ${command.subjectLevelConfigId ?? null}
          )
          RETURNING id
        `
        return row.id
      }).pipe(Effect.withSpan("AcademicTree.createGroup"))
    )
  )

/** A level's capacity is the sum of its classes' capacities (BEH-ZS-052) — never stored, always computed. */
export const levelCapacity = (
  schoolId: string,
  levelId: string
): Effect.Effect<number, SqlError, SqlClient> =>
  withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{ total: string | null }>`
        SELECT sum(capacity)::bigint AS total
        FROM classes
        WHERE level_id = ${levelId} AND school_id = ${schoolId} AND is_active
      `
      return row.total === null ? 0 : Number(row.total)
    }).pipe(Effect.withSpan("AcademicTree.levelCapacity"))
  )

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
(
  schoolId: string,
  entityId: string,
  newName: string
): Effect.Effect<void, EnforcementError | EntityNotFoundError | SqlError, SqlClient | EvaluationServices> =>
  authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const before = yield* requireOwnedRow<{ name: string }>(sql, table, entityType, entityId, schoolId, "name")
        yield* sql`UPDATE ${sql(table)} SET name = ${newName} WHERE id = ${entityId} AND school_id = ${schoolId}`
        yield* auditLog(schoolId, entityType, entityId, "renamed", { name: before.name }, { name: newName })
      }).pipe(
        Effect.withSpan(`AcademicTree.rename${entityType[0].toUpperCase()}${entityType.slice(1)}`)
      )
    )
  )

/** Renaming never breaks a link created from the renamed entity — every downstream row references it by id, never by name (same guarantee as ADR-ZS-105's per-year snapshots). */
export const renameCycle = renameEntity("cycles", "cycle")
export const renameLevel = renameEntity("levels", "level")
export const renameTrack = renameEntity("tracks", "track")

export const renameClass = (
  schoolId: string,
  classId: string,
  newLabel: string
): Effect.Effect<void, EnforcementError | EntityNotFoundError | SqlError, SqlClient | EvaluationServices> =>
  authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const before = yield* requireOwnedRow<{ label: string }>(sql, "classes", "class", classId, schoolId, "label")
        yield* sql`UPDATE classes SET label = ${newLabel} WHERE id = ${classId} AND school_id = ${schoolId}`
        yield* auditLog(schoolId, "class", classId, "renamed", { label: before.label }, { label: newLabel })
      }).pipe(Effect.withSpan("AcademicTree.renameClass"))
    )
  )

export const deactivateClass = (
  schoolId: string,
  classId: string
): Effect.Effect<void, EnforcementError | EntityNotFoundError | SqlError, SqlClient | EvaluationServices> =>
  authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "classes", "class", classId, schoolId)
        yield* sql`UPDATE classes SET is_active = false WHERE id = ${classId} AND school_id = ${schoolId}`
        yield* auditLog(schoolId, "class", classId, "deactivated", { is_active: true }, { is_active: false })
      }).pipe(Effect.withSpan("AcademicTree.deactivateClass"))
    )
  )

/**
 * Deleting a class with enrollments must be refused, offering deactivation
 * instead (BEH-ZS-052, ticket #3 acceptance criterion 5) — `hasEnrollments`
 * (`Enrollment.ts`, ticket #9) is the real query this stub used to await.
 * A class's own `Group`s are not a blocker — `groups.class_id` cascades on
 * delete (migration 0003).
 */
export const deleteClass = (
  schoolId: string,
  classId: string
): Effect.Effect<
  void,
  EnforcementError | EntityNotFoundError | EnrollmentsExistError | SqlError,
  SqlClient | EvaluationServices
> =>
  authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "classes", "class", classId, schoolId)

        const occupied = yield* hasEnrollments(schoolId, classId)
        if (occupied) {
          return yield* Effect.fail(new EnrollmentsExistError({ classId }))
        }
        yield* sql`DELETE FROM classes WHERE id = ${classId} AND school_id = ${schoolId}`
        yield* auditLog(schoolId, "class", classId, "deleted", null, null)
      }).pipe(Effect.withSpan("AcademicTree.deleteClass"))
    )
  )
