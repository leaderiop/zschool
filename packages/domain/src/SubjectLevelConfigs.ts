import { withSchool } from "@zschool/db"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { LevelId, SchoolId, TrackId } from "./Ids.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, requireTrackBelongsToLevel, RowWithId } from "./Ownership.ts"

export { EntityNotFoundError }

/** Available by default (BEH-ZS-053) — not an exhaustive/closed set: `teaching_language` is free text, so a school may configure another language beyond these four. */
export const DEFAULT_TEACHING_LANGUAGES = ["Arabic", "French", "English", "Spanish"] as const

export class DuplicateConfigError extends Data.TaggedError("DuplicateConfigError")<{
  readonly subjectId: string
  readonly levelId: string
  readonly trackId: string | undefined
}> {}

export interface CreateSubjectCommand {
  readonly schoolId: string
  readonly academicYearId: string
  readonly sectionId: string
  readonly code: string
  readonly name: string
}

export interface ConfigureSubjectLevelCommand {
  readonly schoolId: string
  readonly academicYearId: string
  readonly subjectId: string
  readonly levelId: string
  readonly trackId?: string
  readonly coefficient: number
  readonly teachingLanguage: string
  readonly isMandatory: boolean
}

export interface UpdateSubjectLevelConfigCommand {
  readonly schoolId: string
  readonly academicYearId: string
  readonly configId: string
  readonly coefficient?: number
  readonly teachingLanguage?: string
  readonly isMandatory?: boolean
}

/** Adds a subject to the school's catalog for the year — no coefficient/language here (INV-ZS-014/078): those only ever exist on a `SubjectLevelConfig`. */
export const createSubject = Effect.fn("SubjectLevelConfigs.createSubject")(function*(
  command: CreateSubjectCommand
) {
  return yield* authorized(
    SchoolId(command.schoolId),
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "sections", "section", command.sectionId, SchoolId(command.schoolId), RowWithId)

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
  command: ConfigureSubjectLevelCommand
) {
  return yield* authorized(
    SchoolId(command.schoolId),
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "subjects", "subject", command.subjectId, SchoolId(command.schoolId), RowWithId)
        yield* requireOwnedRow(sql, "levels", "level", command.levelId, SchoolId(command.schoolId), RowWithId)
        if (command.trackId !== undefined) {
          yield* requireTrackBelongsToLevel(
            sql,
            TrackId(command.trackId),
            LevelId(command.levelId),
            SchoolId(command.schoolId)
          )
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
  command: UpdateSubjectLevelConfigCommand
) {
  return yield* authorized(
    SchoolId(command.schoolId),
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
