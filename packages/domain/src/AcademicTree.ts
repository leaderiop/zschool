import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { CurrentSubject } from "@qadi/core/CurrentSubject"
import type { EnforcementError } from "@qadi/core/Qadi"
import type { EvaluationServices } from "@qadi/core/Evaluate"
import { withSchool } from "@zschool/db"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { authorized, EntityNotFoundError, requireOwnedRow, requireTrackBelongsToLevel } from "./Ownership.ts"

export { EntityNotFoundError }

export class ActiveEnrollmentsExistError extends Data.TaggedError("ActiveEnrollmentsExistError")<{
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
      })
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
          INSERT INTO groups (school_id, academic_year_id, class_id, code, name, group_type)
          VALUES (
            ${command.schoolId}, ${command.academicYearId}, ${command.classId},
            ${command.code}, ${command.name}, ${command.groupType}
          )
          RETURNING id
        `
        return row.id
      })
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
    })
  )

const auditLog = (
  schoolId: string,
  entityType: "cycle" | "level" | "track" | "class",
  entityId: string,
  action: "renamed" | "deactivated" | "reactivated" | "deleted",
  oldValue: unknown,
  newValue: unknown
) =>
  Effect.gen(function*() {
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
      })
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
      })
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
      })
    )
  )

/**
 * Deleting a class with active enrollments must be refused, offering
 * deactivation instead (BEH-ZS-052, ticket #3 acceptance criterion 5). The
 * `Enrollment` entity itself doesn't exist yet (built by ticket #9, spec
 * #13) — nothing can have an active enrollment today, so this check is
 * currently a structural no-op returning `false` rather than a query
 * against a table that isn't there. Replace `hasActiveEnrollments` with a
 * real query the moment `Enrollment` lands; nothing else in `deleteClass`
 * needs to change. A class's own `Group`s are not a blocker — `groups.class_id`
 * cascades on delete (migration 0003).
 */
const hasActiveEnrollments = (_classId: string): Effect.Effect<boolean> => Effect.succeed(false)

export const deleteClass = (
  schoolId: string,
  classId: string
): Effect.Effect<
  void,
  EnforcementError | EntityNotFoundError | ActiveEnrollmentsExistError | SqlError,
  SqlClient | EvaluationServices
> =>
  authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "classes", "class", classId, schoolId)

        const occupied = yield* hasActiveEnrollments(classId)
        if (occupied) {
          return yield* Effect.fail(new ActiveEnrollmentsExistError({ classId }))
        }
        yield* sql`DELETE FROM classes WHERE id = ${classId} AND school_id = ${schoolId}`
        yield* auditLog(schoolId, "class", classId, "deleted", null, null)
      })
    )
  )
