import { CurrentSubject } from "@qadi/core/CurrentSubject"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { hasEnrollments } from "./Enrollment.ts"
import { ClassId, GroupId, LevelId, SchoolId, TrackId } from "./Ids.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

export { EntityNotFoundError }

export class EnrollmentsExistError extends Schema.TaggedError<EnrollmentsExistError>()("EnrollmentsExistError", {
  classId: Schema.String
}) {}

/**
 * `Model.Class` for `levels`/`tracks`/`classes`/`groups`/`structure_audit_log`
 * (issue #39) — declared once, here, so a migration changing any of these
 * five tables surfaces as a type error at this definition instead of at
 * whichever of the (previously four) files hand-writing a query against it.
 * `Level`/`Track` are read-only from this ticket's perspective (nothing
 * here creates a level or track — that's `InstantiateNationalTemplate.ts`,
 * unchanged, out of scope): only their `select` shape is exercised, via the
 * lookup functions below, not a repository.
 */
export class Level extends Model.Class<Level>("Level")({
  id: Model.GeneratedByDb(LevelId),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  cycle_id: Schema.String,
  code: Schema.String,
  name: Schema.String,
  sort_order: Schema.Int
}) {}

export class Track extends Model.Class<Track>("Track")({
  id: Model.GeneratedByDb(TrackId),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  level_id: Schema.String,
  code: Schema.String,
  name: Schema.String
}) {}

/**
 * `track_id`/`is_active`/`created_at` are `NULL`able or DB-defaulted
 * (migration 0003): a class can be untracked (`track_id`), `is_active`
 * defaults to `true` and is flipped by `deactivateClass`'s own raw `UPDATE`
 * (unchanged — this ticket only migrates the *insert* path), and
 * `created_at` is DB-generated (`timestamptz`, decodes as epoch millis —
 * same reasoning as `GradingScale.created_at`, issue #36).
 */
export class Class extends Model.Class<Class>("Class")({
  // Not `Model.GeneratedByDb`: that excludes a field from `update`'s Type
  // too, but `classRepo`'s `idColumn` below is `"id"` (no other natural
  // unique key, unlike `GradingScale`'s `section_id`) and `makeRepository`
  // requires `idColumn` to be part of `update`'s Type — same reasoning as
  // `ComputationRule.id`, issue #36. Still DB-generated: omitted from
  // `insert`/`jsonCreate`.
  id: Model.Field({ select: ClassId, update: ClassId, json: ClassId, jsonUpdate: ClassId }),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  level_id: Schema.String,
  track_id: Schema.NullOr(Schema.String),
  label: Schema.String,
  capacity: Schema.Int,
  is_active: Model.GeneratedByDb(Schema.Boolean),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/** `subject_level_config_id` (migration 0006) is nullable — a group need not be linked to a subject yet at creation. */
export class Group extends Model.Class<Group>("Group")({
  // Same reasoning as `Class.id` above.
  id: Model.Field({ select: GroupId, update: GroupId, json: GroupId, jsonUpdate: GroupId }),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  class_id: Schema.String,
  code: Schema.String,
  name: Schema.String,
  group_type: Schema.Literals(["language", "option", "lab"]),
  subject_level_config_id: Schema.NullOr(Schema.String)
}) {}

/**
 * Insert-only (user story 6): no repository is derived for this model — only
 * the standalone `insertStructureAuditLog` below, built directly with
 * `SqlSchema.void`. There is deliberately no `update`/`delete` binding to
 * accidentally call, enforcing the append-only-audit-trail invariant
 * structurally rather than by convention. `old_value`/`new_value` are
 * nullable `jsonb` (`deleteClass`'s audit entry passes `null` for both) —
 * `Schema.fromJsonString(Schema.Unknown)` JSON-serializes the caller's plain value
 * the same way the old code's manual `JSON.stringify(...)` did, so the
 * repository's own request-encoding step produces the same wire text.
 */
export class StructureAuditLog extends Model.Class<StructureAuditLog>("StructureAuditLog")({
  id: Model.GeneratedByDb(Schema.String),
  school_id: SchoolId,
  actor_subject_id: Schema.String,
  entity_type: Schema.Literals(["cycle", "level", "track", "class", "subject", "subject_level_config"]),
  entity_id: Schema.String,
  action: Schema.Literals(["renamed", "deactivated", "reactivated", "deleted"]),
  old_value: Schema.NullOr(Schema.fromJsonString(Schema.Unknown)),
  new_value: Schema.NullOr(Schema.fromJsonString(Schema.Unknown)),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
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

const classRepo = SqlModel.makeRepository(Class, { tableName: "classes", spanPrefix: "AcademicTree", idColumn: "id" })
const groupRepo = SqlModel.makeRepository(Group, { tableName: "groups", spanPrefix: "AcademicTree", idColumn: "id" })

/**
 * A track belongs to a specific level, not just to the school — checked
 * separately since a track and a level can each independently belong to the
 * right school while the track still belongs to a *different* level (e.g. a
 * 1BAC track passed alongside a 2BAC levelId).
 *
 * Moved here from `Ownership.ts` (issue #39): decoding the found row
 * through the shared `Track` model — the same one `findTrackByCode` below
 * and `createClass` use — means the ownership-check code and the
 * class-creation code can never disagree about what a track row looks
 * like. Keeping it in `Ownership.ts` would have made that module import
 * `Track` from here while this module already imports from `Ownership.ts`
 * (`authorized`, `EntityNotFoundError`, `requireOwnedRow`) — a real import
 * cycle, not just a style preference. `SubjectLevelConfigs.ts`, the other
 * caller, now imports this from here instead.
 */
export const requireTrackBelongsToLevel = Effect.fn("AcademicTree.requireTrackBelongsToLevel")(function*(
  trackId: TrackId,
  levelId: LevelId,
  schoolId: SchoolId
) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findOne({
    Request: Schema.Struct({ trackId: Schema.String, levelId: Schema.String, schoolId: Schema.String }),
    Result: Track,
    execute: (req) =>
      sql`SELECT * FROM tracks WHERE id = ${req.trackId} AND level_id = ${req.levelId} AND school_id = ${req.schoolId}`
  })({ trackId, levelId, schoolId }).pipe(
    Effect.catchTag(
      "NoSuchElementError",
      () => Effect.fail(new EntityNotFoundError({ entityType: "track", entityId: trackId }))
    )
  )
})

/**
 * Resolves a level by its school-scoped code, decoding the row against the
 * shared `Level` model instead of trusting an untyped `sql<{id: string}>`
 * cast — a column rename in the owning migration now surfaces as a decode
 * failure here, not silently inside an import-matching function three files
 * away (issue #39). Shared by `ClassImportAnalysis.ts` and
 * `StudentGuardianImport.ts`, which both resolve a row's target class the
 * same way.
 */
export const findLevelByCode = Effect.fn("AcademicTree.findLevelByCode")(function*(
  schoolId: string,
  code: string
) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findOneOption({
    Request: Schema.Struct({ schoolId: Schema.String, code: Schema.String }),
    Result: Level,
    execute: (req) => sql`SELECT * FROM levels WHERE school_id = ${req.schoolId} AND code = ${req.code}`
  })({ schoolId, code })
})

/** Same reasoning as `findLevelByCode`, for a level's own tracks. */
export const findTrackByCode = Effect.fn("AcademicTree.findTrackByCode")(function*(
  schoolId: string,
  levelId: string,
  code: string
) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findOneOption({
    Request: Schema.Struct({ schoolId: Schema.String, levelId: Schema.String, code: Schema.String }),
    Result: Track,
    execute: (req) =>
      sql`SELECT * FROM tracks WHERE school_id = ${req.schoolId} AND level_id = ${req.levelId} AND code = ${req.code}`
  })({ schoolId, levelId, code })
})

/**
 * Whether a class already exists under (level, label) — ignores track, same
 * as `classes`' own `UNIQUE (level_id, label)` constraint (migration 0003),
 * which doesn't include `track_id`. Used by `ClassImportAnalysis.ts`'s
 * duplicate check; unlike `findClassByLevelLabelAndTrack` below, this one
 * never needs to distinguish a tracked class from an untracked one.
 */
export const findClassByLevelAndLabel = Effect.fn("AcademicTree.findClassByLevelAndLabel")(function*(
  schoolId: string,
  levelId: string,
  label: string
) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findOneOption({
    Request: Schema.Struct({ schoolId: Schema.String, levelId: Schema.String, label: Schema.String }),
    Result: Class,
    execute: (req) =>
      sql`SELECT * FROM classes WHERE school_id = ${req.schoolId} AND level_id = ${req.levelId} AND label = ${req.label}`
  })({ schoolId, levelId, label })
})

/**
 * A class's exact (level, label, track) identity — `track_id IS NOT
 * DISTINCT FROM` so an untracked class (`track_id` `null`) matches an
 * untracked lookup (`trackId` `null`) correctly, the same NULL-safe
 * equality `StudentGuardianImport.ts`'s `resolveClass` has always used.
 * Distinct from `findClassByLevelAndLabel` above: that one is a
 * label-uniqueness check that intentionally ignores track.
 */
export const findClassByLevelLabelAndTrack = Effect.fn("AcademicTree.findClassByLevelLabelAndTrack")(function*(
  schoolId: string,
  levelId: string,
  label: string,
  trackId: string | null
) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findOneOption({
    Request: Schema.Struct({
      schoolId: Schema.String,
      levelId: Schema.String,
      label: Schema.String,
      trackId: Schema.NullOr(Schema.String)
    }),
    Result: Class,
    execute: (req) =>
      sql`
        SELECT * FROM classes
        WHERE school_id = ${req.schoolId} AND level_id = ${req.levelId} AND label = ${req.label}
          AND track_id IS NOT DISTINCT FROM ${req.trackId}
      `
  })({ schoolId, levelId, label, trackId })
})

/**
 * The core of `createClass`, without its own `authorized`/`withSchool`
 * wrapping — callable from `ImportBatch.ts`'s commit worker, which
 * re-validates and inserts a batch's rows without a live director
 * subject to re-`@qadi`-check per row (the batch's commit was already
 * authorized once, when the director requested it — same reasoning as
 * `Enrollment.ts`'s `insertEnrollment` being callable from
 * `StudentGuardianImport.ts`'s already-authorized bulk-commit flow).
 */
export const insertClassRow = Effect.fn("AcademicTree.insertClassRow")(function*(
  command: CreateClassCommand
) {
  const sql = yield* SqlClient
  yield* requireOwnedRow(sql, "levels", "level", command.levelId, command.schoolId, RowWithId)
  if (command.trackId !== undefined) {
    const trackId = yield* Schema.decodeEffect(TrackId)(command.trackId)
    const levelId = yield* Schema.decodeEffect(LevelId)(command.levelId)
    yield* requireTrackBelongsToLevel(trackId, levelId, command.schoolId)
  }

  const repo = yield* classRepo
  const cls = yield* repo.insert({
    school_id: command.schoolId,
    academic_year_id: command.academicYearId,
    level_id: command.levelId,
    track_id: command.trackId ?? null,
    label: command.label,
    capacity: command.capacity
  })
  return cls.id
})

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
    withSchool(command.schoolId, insertClassRow(command))
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

        const repo = yield* groupRepo
        const group = yield* repo.insert({
          school_id: command.schoolId,
          academic_year_id: command.academicYearId,
          class_id: command.classId,
          code: command.code,
          name: command.name,
          group_type: command.groupType,
          subject_level_config_id: command.subjectLevelConfigId ?? null
        })
        return group.id
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
  schoolId: SchoolId,
  entityType: "cycle" | "level" | "track" | "class",
  entityId: string,
  action: "renamed" | "deactivated" | "reactivated" | "deleted",
  oldValue: unknown,
  newValue: unknown
) {
  const sql = yield* SqlClient
  const subject = yield* CurrentSubject
  const insertAuditLog = SqlSchema.void({
    Request: StructureAuditLog.insert,
    execute: (request) => sql`INSERT INTO structure_audit_log ${sql.insert(request)}`
  })
  yield* insertAuditLog({
    school_id: schoolId,
    actor_subject_id: subject.id,
    entity_type: entityType,
    entity_id: entityId,
    action,
    old_value: oldValue,
    new_value: newValue
  })
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
          yield* auditLog(validSchoolId, entityType, entityId, "renamed", { name: before.name }, { name: newName })
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
        yield* auditLog(validSchoolId, "class", classId, "renamed", { label: before.label }, { label: newLabel })
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
        yield* auditLog(validSchoolId, "class", classId, "deactivated", { is_active: true }, { is_active: false })
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
        yield* auditLog(validSchoolId, "class", classId, "deleted", null, null)
      })
    )
  )
})
