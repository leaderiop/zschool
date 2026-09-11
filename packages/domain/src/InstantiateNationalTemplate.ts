import * as Qadi from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { canManageAcademicStructure } from "./authorization/Policies.ts"
import { seedCalendarEvents } from "./Calendar.ts"
import { GradingScales } from "./GradingScales.ts"
import {
  type CycleCode,
  defaultEvaluationPeriods,
  defaultGradingScale,
  type LevelDefinition,
  nationalTemplate,
  subjectsForLevel
} from "./NationalTemplate.ts"

export class UnauthorizedCycleError extends Data.TaggedError("UnauthorizedCycleError")<{
  readonly requestedCycles: ReadonlyArray<CycleCode>
  readonly authorizedCycles: ReadonlyArray<CycleCode>
}> {}

export interface InstantiateNationalTemplateCommand {
  readonly schoolId: string
  readonly academicYearLabel: string
  readonly authorizedCycles: ReadonlyArray<CycleCode>
  readonly requestedCycles?: ReadonlyArray<CycleCode>
}

export interface InstantiateNationalTemplateResult {
  readonly academicYearId: string
  readonly sectionId: string
  readonly cycleIds: ReadonlyArray<string>
  readonly levelIds: ReadonlyArray<string>
}

/**
 * Batches a multi-row `INSERT`, no-oping on an empty `rows` array instead of
 * letting `sql.insert([])` throw while compiling the statement — every call
 * site here is a tier of the template tree that can legitimately be empty
 * (e.g. no upper-secondary levels requested means no tracks at all).
 */
const insertBatch = <A extends Record<string, unknown>>(
  sql: SqlClient,
  table: string,
  rows: ReadonlyArray<Record<string, unknown>>,
  returning = "id"
): Effect.Effect<ReadonlyArray<A>, SqlError> =>
  rows.length === 0 ? Effect.succeed([]) : sql<A>`INSERT INTO ${sql(table)} ${sql.insert(rows).returning(returning)}`

/**
 * BEH-ZS-051 / REQ-ZS-053: instantiates the Moroccan national structure
 * template for a school's first (or a new) `AcademicYear` — sections,
 * cycles, levels, tracks, subjects with default ministry coefficients
 * (`SubjectLevelConfig`, per INV-ZS-014/078 — never on `Subject` itself),
 * two default semesters, and grading out of 20 (ADR-ZS-057).
 *
 * Every academic-structure entity is a per-year snapshot (ADR-ZS-105): rows
 * are linked by id, never by name, so a later rename never breaks a link
 * already created from it. Gated by `@qadi` (ADR-ZS-096) ahead of Postgres
 * RLS (ADR-ZS-092) — the application check runs first, RLS is the backstop.
 *
 * Every table beneath a level is written as one batched multi-row `INSERT`
 * per tier (cycles, then levels, then tracks, then subjects, then
 * subject-level configs) rather than one round trip per row: the full
 * template is ~300 rows, and Neon's `eu-central-1` round trip (STACK §3
 * risk 6) makes a row-at-a-time loop the difference between low hundreds
 * of milliseconds and tens of seconds.
 */
export const instantiateNationalTemplate = Effect.fn("InstantiateNationalTemplate.instantiateNationalTemplate")(
  function*(command: InstantiateNationalTemplateCommand) {
    yield* Qadi.assert(canManageAcademicStructure, {
      resource: { school_id: command.schoolId },
      action: "instantiate-template"
    })

    const requestedCycles = command.requestedCycles ?? command.authorizedCycles
    const isAuthorized = requestedCycles.every((code) => command.authorizedCycles.includes(code))

    if (!isAuthorized) {
      return yield* Effect.fail(
        new UnauthorizedCycleError({
          requestedCycles,
          authorizedCycles: command.authorizedCycles
        })
      )
    }

    const cycles = nationalTemplate.filter((c) => requestedCycles.includes(c.code))
    const schoolId = command.schoolId

    return yield* withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient

        const [year] = yield* sql<{ id: string }>`
          INSERT INTO academic_years (school_id, label)
          VALUES (${schoolId}, ${command.academicYearLabel})
          RETURNING id
        `
        const academicYearId = year.id

        const [section] = yield* sql<{ id: string }>`
          INSERT INTO sections (school_id, academic_year_id, template, name)
          VALUES (${schoolId}, ${academicYearId}, 'national', 'National')
          RETURNING id
        `
        const sectionId = section.id

        const cycleRows = yield* insertBatch<{ id: string; code: string }>(
          sql,
          "cycles",
          cycles.map((cycle, index) => ({
            school_id: schoolId,
            academic_year_id: academicYearId,
            section_id: sectionId,
            code: cycle.code,
            name: cycle.name,
            sort_order: index
          })),
          "id, code"
        )
        const cycleIdByCode = new Map(cycleRows.map((r) => [r.code, r.id]))

        const levelInputs: Array<{ cycleCode: CycleCode; level: LevelDefinition; sortOrder: number }> = []
        for (const cycle of cycles) {
          cycle.levels.forEach((level, index) => levelInputs.push({ cycleCode: cycle.code, level, sortOrder: index }))
        }

        const levelRows = yield* insertBatch<{ id: string; code: string }>(
          sql,
          "levels",
          levelInputs.map(({ cycleCode, level, sortOrder }) => ({
            school_id: schoolId,
            academic_year_id: academicYearId,
            cycle_id: cycleIdByCode.get(cycleCode)!,
            code: level.code,
            name: level.name,
            sort_order: sortOrder
          })),
          "id, code"
        )
        const levelIdByCode = new Map(levelRows.map((r) => [r.code, r.id]))

        const trackInputs: Array<{ levelCode: string; code: string; name: string }> = []
        for (const { level } of levelInputs) {
          for (const track of level.tracks) {
            trackInputs.push({ levelCode: level.code, code: track.code, name: track.name })
          }
        }

        const trackRows = yield* insertBatch<{ id: string; level_id: string; code: string }>(
          sql,
          "tracks",
          trackInputs.map((t) => ({
            school_id: schoolId,
            academic_year_id: academicYearId,
            level_id: levelIdByCode.get(t.levelCode)!,
            code: t.code,
            name: t.name
          })),
          "id, level_id, code"
        )
        const trackIdByLevelAndCode = new Map(trackRows.map((r) => [`${r.level_id}:${r.code}`, r.id]))

        // One pass over every (level, track) pair collects both the
        // section-wide subject catalog (deduped by code — a subject's name
        // is a catalog property, never track-specific, INV-ZS-014) and the
        // per-(subject, level, track) config rows that will need each
        // subject's id — rather than re-deriving `subjectsForLevel` in two
        // separate loops.
        const subjectByCode = new Map<string, { code: string; name: string }>()
        const pendingConfigs: Array<
          {
            levelCode: string
            trackCode: string | undefined
            subjectCode: string
            coefficient: number
            teachingLanguage: string
            isMandatory: boolean
          }
        > = []
        for (const { level } of levelInputs) {
          const trackCodes = level.tracks.length > 0 ? level.tracks.map((t) => t.code) : [undefined]
          for (const trackCode of trackCodes) {
            for (const subject of subjectsForLevel(level, trackCode)) {
              if (!subjectByCode.has(subject.code)) {
                subjectByCode.set(subject.code, { code: subject.code, name: subject.name })
              }
              pendingConfigs.push({
                levelCode: level.code,
                trackCode,
                subjectCode: subject.code,
                coefficient: subject.coefficient,
                teachingLanguage: subject.teachingLanguage,
                isMandatory: subject.isMandatory
              })
            }
          }
        }

        const subjectRows = yield* insertBatch<{ id: string; code: string }>(
          sql,
          "subjects",
          [...subjectByCode.values()].map((s) => ({
            school_id: schoolId,
            academic_year_id: academicYearId,
            section_id: sectionId,
            code: s.code,
            name: s.name
          })),
          "id, code"
        )
        const subjectIdByCode = new Map(subjectRows.map((r) => [r.code, r.id]))

        yield* insertBatch(
          sql,
          "subject_level_configs",
          pendingConfigs.map((c) => ({
            school_id: schoolId,
            academic_year_id: academicYearId,
            subject_id: subjectIdByCode.get(c.subjectCode)!,
            level_id: levelIdByCode.get(c.levelCode)!,
            track_id: c.trackCode === undefined
              ? null
              : trackIdByLevelAndCode.get(`${levelIdByCode.get(c.levelCode)}:${c.trackCode}`)!,
            coefficient: c.coefficient,
            teaching_language: c.teachingLanguage,
            is_mandatory: c.isMandatory
          }))
        )

        // Four independent, read-nothing-back seed steps — none depends on
        // another's output, so they run concurrently instead of paying one
        // sequential round trip each.
        const gradingScales = yield* GradingScales
        yield* Effect.all(
          [
            sql`
              INSERT INTO grading_scales (school_id, academic_year_id, section_id, max_score, decimals, rounding)
              VALUES (
                ${schoolId}, ${academicYearId}, ${sectionId},
                ${defaultGradingScale.maxScore}, ${defaultGradingScale.decimals}, ${defaultGradingScale.rounding}
              )
            `,
            insertBatch(
              sql,
              "evaluation_periods",
              defaultEvaluationPeriods.map((period) => ({
                school_id: schoolId,
                academic_year_id: academicYearId,
                section_id: sectionId,
                code: period.code,
                name: period.name,
                sequence: period.sequence
              }))
            ),
            // BEH-ZS-066: the ministry calendar is preloaded at year creation.
            seedCalendarEvents(schoolId, academicYearId, command.academicYearLabel),
            // BEH-ZS-055: default certifying-exam weightings for 6AP/3AC/2BAC.
            gradingScales.seedDefaultComputationRules(schoolId, academicYearId, levelIdByCode)
          ],
          { concurrency: "unbounded", discard: true }
        )

        return {
          academicYearId,
          sectionId,
          cycleIds: [...cycleIdByCode.values()],
          levelIds: [...levelIdByCode.values()]
        }
      })
    )
  }
)
