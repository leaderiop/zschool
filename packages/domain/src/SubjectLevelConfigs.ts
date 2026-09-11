import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { LevelId, SchoolId, TrackId } from "./Ids.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, requireTrackBelongsToLevel, RowWithId } from "./Ownership.ts"

export { EntityNotFoundError }

/** Available by default (BEH-ZS-053) — not an exhaustive/closed set: `teaching_language` is free text, so a school may configure another language beyond these four. */
export const DEFAULT_TEACHING_LANGUAGES = ["Arabic", "French", "English", "Spanish"] as const

export class DuplicateConfigError extends Schema.TaggedError<DuplicateConfigError>()("DuplicateConfigError", {
  subjectId: Schema.String,
  levelId: Schema.String,
  trackId: Schema.UndefinedOr(Schema.String)
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

        const [row] = yield* sql<{ id: string }>`
          INSERT INTO subjects (school_id, academic_year_id, section_id, code, name)
          VALUES (${command.schoolId}, ${command.academicYearId}, ${command.sectionId}, ${command.code}, ${command.name})
          RETURNING id
        `
        return row.id
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
          yield* requireTrackBelongsToLevel(sql, trackId, levelId, command.schoolId)
        }

        const insert = sql<{ id: string }>`
          INSERT INTO subject_level_configs
            (school_id, academic_year_id, subject_id, level_id, track_id, coefficient, teaching_language, is_mandatory)
          VALUES (
            ${command.schoolId}, ${command.academicYearId}, ${command.subjectId}, ${command.levelId},
            ${command.trackId ?? null}, ${command.coefficient}, ${command.teachingLanguage}, ${command.isMandatory}
          )
          RETURNING id
        `

        const [row] = yield* insert.pipe(
          Effect.catchReason("SqlError", "UniqueViolation", () =>
            Effect.fail(
              new DuplicateConfigError({
                subjectId: command.subjectId,
                levelId: command.levelId,
                trackId: command.trackId
              })
            ))
        )
        return row.id
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
        const sql = yield* SqlClient
        const rows = yield* sql`
          SELECT id FROM subject_level_configs
          WHERE id = ${command.configId} AND school_id = ${command.schoolId} AND academic_year_id = ${command.academicYearId}
        `
        if (rows.length === 0) {
          return yield* Effect.fail(
            new EntityNotFoundError({ entityType: "subject_level_config", entityId: command.configId })
          )
        }

        if (command.coefficient !== undefined) {
          yield* sql`
            UPDATE subject_level_configs SET coefficient = ${command.coefficient}
            WHERE id = ${command.configId} AND school_id = ${command.schoolId} AND academic_year_id = ${command.academicYearId}
          `
        }
        if (command.teachingLanguage !== undefined) {
          yield* sql`
            UPDATE subject_level_configs SET teaching_language = ${command.teachingLanguage}
            WHERE id = ${command.configId} AND school_id = ${command.schoolId} AND academic_year_id = ${command.academicYearId}
          `
        }
        if (command.isMandatory !== undefined) {
          yield* sql`
            UPDATE subject_level_configs SET is_mandatory = ${command.isMandatory}
            WHERE id = ${command.configId} AND school_id = ${command.schoolId} AND academic_year_id = ${command.academicYearId}
          `
        }
      })
    )
  )
})
