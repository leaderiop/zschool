import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { requireTrackBelongsToLevel } from "./AcademicTree.ts"
import { LevelId, SchoolId, SubjectId, SubjectLevelConfigId, TrackId } from "./Ids.ts"
import { optionalOnUpdate } from "./ModelVariants.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

export { EntityNotFoundError }

/** Available by default (BEH-ZS-053) — not an exhaustive/closed set: `teaching_language` is free text, so a school may configure another language beyond these four. */
export const DEFAULT_TEACHING_LANGUAGES = ["Arabic", "French", "English", "Spanish"] as const

export class DuplicateConfigError extends Schema.TaggedError<DuplicateConfigError>()("DuplicateConfigError", {
  subjectId: Schema.String,
  levelId: Schema.String,
  trackId: Schema.UndefinedOr(Schema.String)
}) {}

/**
 * `Model.Class` for `subjects`/`subject_level_configs` (issue #40) — matches
 * migration 0001's DDL. `Subject` is insert-only from this file's
 * perspective (no update path exists for it, unchanged by this ticket), but
 * its repository's `idColumn` is still `"id"` (no other natural unique key),
 * so `id` needs the same custom `Model.Field` variant as `ComputationRule.id`
 * (issue #36) / `Class.id` (issue #39) rather than `Model.GeneratedByDb`:
 * `makeRepository` requires `idColumn` to be part of `update`'s Type
 * regardless of whether `.update` is ever actually called.
 */
export class Subject extends Model.Class<Subject>("Subject")({
  id: Model.Field({ select: SubjectId, update: SubjectId, json: SubjectId, jsonUpdate: SubjectId }),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  section_id: Schema.String,
  code: Schema.String,
  name: Schema.String
}) {}

/**
 * `school_id`/`academic_year_id`/`subject_id`/`level_id`/`track_id` are
 * identity, fixed at creation — excluded from `update`/`jsonUpdate` the same
 * way `GradingScale.school_id` is, so a payload built from
 * `updateSubjectLevelConfig`'s partial-update fields can never accidentally
 * carry one of them. `coefficient`/`teaching_language`/`is_mandatory` go
 * through `optionalOnUpdate` for the same partial-update reason.
 * `coefficient` is `numeric` (migration 0001) — round-trips through
 * `@effect/sql-pg` as a decimal string, not a JS number, same reasoning as
 * `GradingScale.max_score`.
 */
export class SubjectLevelConfig extends Model.Class<SubjectLevelConfig>("SubjectLevelConfig")({
  // Same reasoning as `Subject.id` above — `updateSubjectLevelConfig` does
  // call `.update`/`.findById` on this one, but the constraint holds either way.
  id: Model.Field({
    select: SubjectLevelConfigId,
    update: SubjectLevelConfigId,
    json: SubjectLevelConfigId,
    jsonUpdate: SubjectLevelConfigId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  academic_year_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  subject_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  level_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  track_id: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  coefficient: optionalOnUpdate(Schema.NumberFromString),
  teaching_language: optionalOnUpdate(Schema.String),
  is_mandatory: optionalOnUpdate(Schema.Boolean)
}) {}

/** `Schema.Class` instead of a plain interface (issue #34) — decoded once, at the start of the handler below. */
export class CreateSubjectCommand extends Schema.Class<CreateSubjectCommand>("CreateSubjectCommand")({
  schoolId: SchoolId,
  academicYearId: Schema.String,
  sectionId: Schema.String,
  code: Schema.NonEmptyString,
  name: Schema.NonEmptyString
}) {}

export class ConfigureSubjectLevelCommand
  extends Schema.Class<ConfigureSubjectLevelCommand>("ConfigureSubjectLevelCommand")({
    schoolId: SchoolId,
    academicYearId: Schema.String,
    subjectId: Schema.String,
    levelId: Schema.String,
    trackId: Schema.optional(Schema.String),
    coefficient: Schema.Number,
    teachingLanguage: Schema.NonEmptyString,
    isMandatory: Schema.Boolean
  })
{}

export class UpdateSubjectLevelConfigCommand
  extends Schema.Class<UpdateSubjectLevelConfigCommand>("UpdateSubjectLevelConfigCommand")({
    schoolId: SchoolId,
    academicYearId: Schema.String,
    configId: Schema.String,
    coefficient: Schema.optional(Schema.Number),
    teachingLanguage: Schema.optional(Schema.NonEmptyString),
    isMandatory: Schema.optional(Schema.Boolean)
  })
{}

const subjectRepo = SqlModel.makeRepository(Subject, {
  tableName: "subjects",
  spanPrefix: "SubjectLevelConfigs",
  idColumn: "id"
})
const subjectLevelConfigRepo = SqlModel.makeRepository(SubjectLevelConfig, {
  tableName: "subject_level_configs",
  spanPrefix: "SubjectLevelConfigs",
  idColumn: "id"
})

/**
 * `Courses.ts`'s read-only reuse point (issue #40, user story 3/5): the
 * mandatory configurations for a (level, track) pair, decoded through this
 * file's own `SubjectLevelConfig` model instead of `Courses.ts` maintaining
 * its own independently-typed `sql<{id: string}>` row shape for the same
 * table. `Courses.ts` never writes to `subject_level_configs` — this is the
 * only surface it reads through.
 */
export const findMandatorySubjectLevelConfigs = Effect.fn("SubjectLevelConfigs.findMandatorySubjectLevelConfigs")(
  function*(schoolId: string, levelId: string, trackId: string | null) {
    const sql = yield* SqlClient
    return yield* SqlSchema.findAll({
      Request: Schema.Struct({
        schoolId: Schema.String,
        levelId: Schema.String,
        trackId: Schema.NullOr(Schema.String)
      }),
      Result: SubjectLevelConfig,
      execute: (req) =>
        sql`
          SELECT * FROM subject_level_configs
          WHERE school_id = ${req.schoolId} AND level_id = ${req.levelId}
            AND track_id IS NOT DISTINCT FROM ${req.trackId} AND is_mandatory
        `
    })({ schoolId, levelId, trackId })
  }
)

/** Adds a subject to the school's catalog for the year — no coefficient/language here (INV-ZS-014/078): those only ever exist on a `SubjectLevelConfig`. */
export const createSubject = Effect.fn("SubjectLevelConfigs.createSubject")(function*(
  rawCommand: (typeof CreateSubjectCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(CreateSubjectCommand)(rawCommand)
  return yield* authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "sections", "section", command.sectionId, command.schoolId, RowWithId)

        const repo = yield* subjectRepo
        const subject = yield* repo.insert({
          school_id: command.schoolId,
          academic_year_id: command.academicYearId,
          section_id: command.sectionId,
          code: command.code,
          name: command.name
        })
        return subject.id
      })
    )
  )
})

/**
 * BEH-ZS-053 / REQ-ZS-055: configures one subject for one (level, track)
 * pair — the same subject carries an independent configuration for every
 * other (level, track) pair, and a second configuration for the same triple
 * is refused rather than silently overwriting the first (that's what
 * `updateSubjectLevelConfig` is for).
 */
export const configureSubjectLevel = Effect.fn("SubjectLevelConfigs.configureSubjectLevel")(function*(
  rawCommand: (typeof ConfigureSubjectLevelCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(ConfigureSubjectLevelCommand)(rawCommand)
  return yield* authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "subjects", "subject", command.subjectId, command.schoolId, RowWithId)
        yield* requireOwnedRow(sql, "levels", "level", command.levelId, command.schoolId, RowWithId)
        if (command.trackId !== undefined) {
          const trackId = yield* Schema.decodeEffect(TrackId)(command.trackId)
          const levelId = yield* Schema.decodeEffect(LevelId)(command.levelId)
          yield* requireTrackBelongsToLevel(trackId, levelId, command.schoolId)
        }

        const repo = yield* subjectLevelConfigRepo
        const config = yield* repo.insert({
          school_id: command.schoolId,
          academic_year_id: command.academicYearId,
          subject_id: command.subjectId,
          level_id: command.levelId,
          track_id: command.trackId ?? null,
          coefficient: command.coefficient,
          teaching_language: command.teachingLanguage,
          is_mandatory: command.isMandatory
        }).pipe(
          Effect.catchReason("SqlError", "UniqueViolation", () =>
            Effect.fail(
              new DuplicateConfigError({
                subjectId: command.subjectId,
                levelId: command.levelId,
                trackId: command.trackId
              })
            ))
        )
        return config.id
      })
    )
  )
})

/** Edits an existing (level, track) configuration — scoped to this year's own snapshot (ADR-ZS-105): the `academic_year_id` match means a prior year's closed configuration is never reachable through this call. */
export const updateSubjectLevelConfig = Effect.fn("SubjectLevelConfigs.updateSubjectLevelConfig")(function*(
  rawCommand: (typeof UpdateSubjectLevelConfigCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(UpdateSubjectLevelConfigCommand)(rawCommand)
  return yield* authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const repo = yield* subjectLevelConfigRepo

        const notFound = () =>
          Effect.fail(new EntityNotFoundError({ entityType: "subject_level_config", entityId: command.configId }))

        const validConfigId = yield* Schema.decodeEffect(SubjectLevelConfigId)(command.configId)
        const config = yield* repo.findById(validConfigId).pipe(
          Effect.catchTag("NoSuchElementError", notFound)
        )
        // `findById` only filters by `id` (RLS is the sole backstop otherwise)
        // — `school_id` is re-checked explicitly here, same as
        // `academic_year_id` below, per `Ownership.ts`'s own stated invariant
        // that every domain module scopes its lookups by `school_id`
        // explicitly rather than relying solely on RLS.
        if (config.school_id !== command.schoolId || config.academic_year_id !== command.academicYearId) {
          return yield* notFound()
        }

        const fields = {
          ...(command.coefficient !== undefined ? { coefficient: command.coefficient } : {}),
          ...(command.teachingLanguage !== undefined ? { teaching_language: command.teachingLanguage } : {}),
          ...(command.isMandatory !== undefined ? { is_mandatory: command.isMandatory } : {})
        }
        if (Object.keys(fields).length > 0) {
          yield* repo.update({ id: validConfigId, ...fields })
        }
      })
    )
  )
})
