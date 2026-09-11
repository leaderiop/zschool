import { withSchool } from "@zschool/db"
import * as Context from "effect/Context"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { SchoolId } from "./Ids.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

/**
 * BEH-ZS-055: default ministry certifying-exam weightings, by level code —
 * continuous assessment / first exam / second exam, summing to 100
 * (migration 0005's own CHECK constraint), each with the ministry's
 * tracked textual reference.
 */
export const defaultComputationRules: ReadonlyArray<
  { levelCode: string; weightContinuous: number; weightExam1: number; weightExam2: number; referenceText: string }
> = [
  {
    levelCode: "6AP",
    weightContinuous: 50,
    weightExam1: 25,
    weightExam2: 25,
    referenceText: "Ministry circular — 6AP certifying exam weighting 50/25/25"
  },
  {
    levelCode: "3AC",
    weightContinuous: 30,
    weightExam1: 30,
    weightExam2: 40,
    referenceText: "Ministry circular — 3AC certifying exam (Brevet) weighting 30/30/40"
  },
  {
    levelCode: "2BAC",
    weightContinuous: 25,
    weightExam1: 25,
    weightExam2: 50,
    referenceText: "Ministry circular — Baccalaureate certifying exam weighting 25/25/50"
  }
]

export class InvalidWeightingError extends Data.TaggedError("InvalidWeightingError")<{
  readonly levelId: string
  readonly total: number
}> {}

export interface UpdateGradingScaleCommand {
  readonly schoolId: string
  readonly academicYearId: string
  readonly sectionId: string
  readonly maxScore?: number
  readonly decimals?: number
  readonly rounding?: string
}

export interface SetComputationRuleCommand {
  readonly schoolId: string
  readonly academicYearId: string
  readonly levelId: string
  readonly weightContinuous: number
  readonly weightExam1: number
  readonly weightExam2: number
  readonly referenceText: string
}

/** Seeds the default computation rules for the levels the ministry publishes them for (6AP, 3AC, 2BAC) — called from `InstantiateNationalTemplate.ts` at year creation, same pattern as `seedCalendarEvents`. */
const seedDefaultComputationRules = Effect.fn("GradingScales.seedDefaultComputationRules")(function*(
  schoolId: string,
  academicYearId: string,
  levelIdByCode: ReadonlyMap<string, string>
) {
  const sql = yield* SqlClient
  const rows = defaultComputationRules
    .filter((rule) => levelIdByCode.has(rule.levelCode))
    .map((rule) => ({
      school_id: schoolId,
      academic_year_id: academicYearId,
      level_id: levelIdByCode.get(rule.levelCode)!,
      weight_continuous: rule.weightContinuous,
      weight_exam_1: rule.weightExam1,
      weight_exam_2: rule.weightExam2,
      reference_text: rule.referenceText
    }))

  if (rows.length > 0) {
    yield* sql`INSERT INTO computation_rules ${sql.insert(rows)}`
  }
})

/** BEH-ZS-055: edits a section's grading scale — scoped to this year's own snapshot (ADR-ZS-105), never a prior closed year's. */
const updateGradingScale = Effect.fn("GradingScales.updateGradingScale")(function*(
  command: UpdateGradingScaleCommand
) {
  return yield* authorized(
    SchoolId(command.schoolId),
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows = yield* sql`
          SELECT id FROM grading_scales
          WHERE section_id = ${command.sectionId} AND school_id = ${command.schoolId}
            AND academic_year_id = ${command.academicYearId}
        `
        if (rows.length === 0) {
          return yield* Effect.fail(
            new EntityNotFoundError({ entityType: "grading_scale", entityId: command.sectionId })
          )
        }

        if (command.maxScore !== undefined) {
          yield* sql`
            UPDATE grading_scales SET max_score = ${command.maxScore}
            WHERE section_id = ${command.sectionId} AND school_id = ${command.schoolId} AND academic_year_id = ${command.academicYearId}
          `
        }
        if (command.decimals !== undefined) {
          yield* sql`
            UPDATE grading_scales SET decimals = ${command.decimals}
            WHERE section_id = ${command.sectionId} AND school_id = ${command.schoolId} AND academic_year_id = ${command.academicYearId}
          `
        }
        if (command.rounding !== undefined) {
          yield* sql`
            UPDATE grading_scales SET rounding = ${command.rounding}
            WHERE section_id = ${command.sectionId} AND school_id = ${command.schoolId} AND academic_year_id = ${command.academicYearId}
          `
        }
      })
    )
  )
})

/**
 * BEH-ZS-055 / REQ-ZS-057: sets a level's computation-rule weighting,
 * versioned — the previous rule (if any) is marked `is_current = false`
 * and kept, a new row is inserted as current, so "a change creates a dated
 * version for the year, with the previous one still viewable" (fr-ped-05).
 */
const setComputationRule = Effect.fn("GradingScales.setComputationRule")(function*(
  command: SetComputationRuleCommand
) {
  return yield* authorized(
    SchoolId(command.schoolId),
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const total = command.weightContinuous + command.weightExam1 + command.weightExam2
        if (total !== 100) {
          return yield* Effect.fail(new InvalidWeightingError({ levelId: command.levelId, total }))
        }

        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "levels", "level", command.levelId, SchoolId(command.schoolId), RowWithId)

        yield* sql`
          UPDATE computation_rules SET is_current = false
          WHERE level_id = ${command.levelId} AND school_id = ${command.schoolId} AND is_current
        `

        const [row] = yield* sql<{ id: string }>`
          INSERT INTO computation_rules
            (school_id, academic_year_id, level_id, weight_continuous, weight_exam_1, weight_exam_2, reference_text)
          VALUES (
            ${command.schoolId}, ${command.academicYearId}, ${command.levelId},
            ${command.weightContinuous}, ${command.weightExam1}, ${command.weightExam2}, ${command.referenceText}
          )
          RETURNING id
        `
        return row.id
      })
    )
  )
})

/**
 * Pilot (ticket #23): the grading-scales area restructured as a single
 * injectable service instead of loose exported functions, to validate the
 * pattern before deciding whether to roll it out to the rest of
 * `packages/domain`. Every caller now goes through `yield* GradingScales`
 * rather than importing `seedDefaultComputationRules`/`updateGradingScale`/
 * `setComputationRule` directly — those three stay as private
 * implementations the service methods delegate to, so the tracing-span
 * names from ticket #19 aren't duplicated.
 */
export class GradingScales extends Context.Service<GradingScales, {
  readonly seedDefaultComputationRules: typeof seedDefaultComputationRules
  readonly updateGradingScale: typeof updateGradingScale
  readonly setComputationRule: typeof setComputationRule
}>()("@zschool/domain/GradingScales") {
  static readonly layer = Layer.succeed(
    this,
    GradingScales.of({
      seedDefaultComputationRules,
      updateGradingScale,
      setComputationRule
    })
  )
}
