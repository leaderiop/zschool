import { withSchool } from "@zschool/db"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import { ComputationRuleId, GradingScaleId, SchoolId } from "./Ids.ts"
import { optionalOnUpdate } from "./ModelVariants.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

/**
 * `Model.Class` instead of hand-written queries + manual row typing (issue
 * #36) — `grading_scales`' columns are declared once, here, so a migration
 * changing the table surfaces as a type error at this definition instead of
 * at whichever hand-written query happens to touch the changed column.
 *
 * Field names are the literal Postgres column names, not camelCase: `Model`
 * has no per-field DB-column-name mapping (unlike the ai-docs `Group`
 * example, whose SQLite columns already happen to be camelCase). The
 * client-level `transformResultNames`/`transformQueryNames` option
 * (`@effect/sql-pg`) could bridge that, but enabling it is a repo-wide
 * change affecting every existing raw query in every domain file — squarely
 * out of this ticket's scope ("touch only GradingScales.ts's own query
 * code"). `updateGradingScale`/`setComputationRule` below still take and
 * return camelCase commands; the snake_case mapping happens only at the
 * point each command builds a repository payload.
 *
 * `section_id` (not the surrogate `id`) is the repository's `idColumn`: it's
 * the column `updateGradingScale` has always looked rows up by (`UNIQUE
 * (section_id)`, migration 0001). `school_id`/`academic_year_id` are
 * excluded from `update`/`jsonUpdate` (identity, fixed at creation, never
 * touched by any existing update path) the same way `section_id` would be if
 * it weren't also this repository's key — `SqlModel.makeRepository`'s
 * `update` already excludes `idColumn` from its own `SET` clause, so
 * `section_id` doesn't need its own exclusion to stay non-mutable.
 */
export class GradingScale extends Model.Class<GradingScale>("GradingScale")({
  id: Model.GeneratedByDb(GradingScaleId),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  academic_year_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  section_id: Schema.String,
  // Postgres `numeric` columns round-trip through @effect/sql-pg as decimal
  // strings, not JS numbers (avoiding float precision loss) — `decimals`
  // stays a plain number since it's an `integer` column, decoded natively.
  max_score: optionalOnUpdate(Schema.NumberFromString),
  decimals: optionalOnUpdate(Schema.Int),
  rounding: optionalOnUpdate(Schema.String),
  // @effect/sql-pg decodes `timestamptz` as epoch milliseconds (a number),
  // not a string — `DateTimeUtcFromMillis` decodes that into a real
  // `DateTime.Utc` instead of trusting an assumed shape.
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/** `{label, min_average}` — BEH-ZS-119's honors levels, ordered highest threshold first. The label set itself varies by cycle (only the baccalaureate's is spec-given), so this stays a flexible `jsonb` array rather than a fixed column set. Snake-case keys even though this is JSON content, not real columns — matches this file's existing convention everywhere else. */
export interface HonorsThreshold {
  readonly label: string
  readonly min_average: number
}

/** BEH-ZS-119's baccalaureate defaults: highest distinction from 16, distinction from 14, merit from 12, pass from 10, resit between 8 and 9.99. */
export const defaultHonorsThresholds: ReadonlyArray<HonorsThreshold> = [
  { label: "highest_distinction", min_average: 16 },
  { label: "distinction", min_average: 14 },
  { label: "merit", min_average: 12 },
  { label: "pass", min_average: 10 },
  { label: "resit", min_average: 8 }
]

/**
 * Matches migration 0005's `computation_rules` table (widened by migration
 * 0036, ticket #110). `is_current`/`effective_from` are `GeneratedByDb`:
 * every insert site (`setComputationRule`, `seedDefaultComputationRules`)
 * already relies on their DB defaults (`true`/`now()`) rather than setting
 * them explicitly.
 */
export class ComputationRule extends Model.Class<ComputationRule>("ComputationRule")({
  // A custom variant set (not `GeneratedByDb`): `computation_rules` has no
  // natural single-column unique key to use as this repository's `idColumn`
  // instead, so `id` needs to stay part of `update`'s Type even though it's
  // still DB-generated and omitted from `insert`/`jsonCreate` — nothing
  // calls `.update` on this repository today, but `makeRepository` requires
  // `idColumn` to be part of `update`'s Type regardless.
  id: Model.Field({
    select: ComputationRuleId,
    update: ComputationRuleId,
    json: ComputationRuleId,
    jsonUpdate: ComputationRuleId
  }),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  level_id: Schema.String,
  // Same `numeric`-round-trips-as-string reasoning as `GradingScale.max_score`.
  weight_continuous: Schema.NumberFromString,
  weight_exam_1: Schema.NumberFromString,
  weight_exam_2: Schema.NumberFromString,
  reference_text: Schema.String,
  // Ticket #110: BEH-ZS-117's "optional exclusion of the lowest grade beyond
  // a given number of grades" — null disables it.
  lowest_grade_exclusion_min_count: Schema.NullOr(Schema.Int),
  // `honors_thresholds` is a `jsonb` column — @effect/sql-pg decodes it into
  // a plain JS array already, not a string, so a bare `Schema.Array` decodes
  // it directly with no `Schema.parseJson` step needed.
  honors_thresholds: Schema.Array(Schema.Struct({ label: Schema.String, min_average: Schema.Number })),
  // BEH-ZS-117(a): "an unjustified absence... counts as 0 by default (configurable: 0 or exclusion)".
  unjustified_absence_counts_as_zero: Schema.Boolean,
  is_current: Model.GeneratedByDb(Schema.Boolean),
  effective_from: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

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

export class InvalidWeightingError extends Schema.TaggedError<InvalidWeightingError>()("InvalidWeightingError", {
  levelId: Schema.String,
  total: Schema.Finite
}) {}

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
  /** Ticket #110's additions to this command. Omitted fields carry forward the level's current rule (or the seed defaults, if there is none), so a caller that only wants to update the exam weighting doesn't also have to respecify them. */
  readonly lowestGradeExclusionMinCount?: number | null
  readonly honorsThresholds?: ReadonlyArray<HonorsThreshold>
  readonly unjustifiedAbsenceCountsAsZero?: boolean
}

/**
 * Repositories are built fresh on every call rather than once at layer
 * construction: `SqlModel.makeRepository` itself needs `SqlClient` (it only
 * sets up closures — no query runs until a returned method is actually
 * called), and building it eagerly via `Layer.effect` would make
 * `SqlClient` a requirement of `GradingScales.layer` itself instead of (as
 * before this ticket) of each method's own returned `Effect` — the exact
 * distinction `features/support/layers/db.ts`'s `Layer.merge` (explicitly
 * unchanged, issue #34) depends on: a `Layer.merge` doesn't let one merged
 * layer's output satisfy another's input the way `Layer.provide` does, so a
 * `GradingScales.layer` that itself required `SqlClient` would leave that
 * requirement unfulfilled on `DatabaseTestLive` as a whole. Rebuilding the
 * repositories' closures per call is cheap — plain object/closure setup, no
 * I/O — so this trades a negligible allocation for keeping the same Layer
 * shape the rest of the codebase already depends on.
 */
const gradingScaleRepo = SqlModel.makeRepository(GradingScale, {
  tableName: "grading_scales",
  spanPrefix: "GradingScales",
  idColumn: "section_id"
})

/**
 * Ticket #110: BEH-ZS-117 configures calculation rules "per level and per
 * track" broadly, not just the three levels the ministry publishes exam
 * weightings for — so every level gets a seeded `ComputationRule` row now,
 * not only 6AP/3AC/2BAC. A level absent from `defaultComputationRules` gets
 * `100/0/0` (100% continuous assessment, no external exam), which still
 * satisfies migration 0005's `weight_continuous + weight_exam_1 +
 * weight_exam_2 = 100` CHECK. Every level also gets the BEH-ZS-119
 * baccalaureate-default `honors_thresholds` (editable per level afterward)
 * and lowest-grade exclusion disabled (`null`) until a school configures it.
 *
 * Called from `InstantiateNationalTemplate.ts` at year creation, same
 * pattern as `seedCalendarEvents`. No longer a single batched `sql.insert` —
 * `honors_thresholds` is `jsonb`, and this codebase's established idiom for
 * any `jsonb` column is a hand-built `INSERT` with an explicit `::jsonb`
 * cast (`AuditLog.ts`, `Discipline.ts`, `Council.ts`, `ImportBatch.ts`),
 * since `sql.insert`'s generic column binding sends the JSON string as
 * `text`, which Postgres does not implicitly cast to `jsonb`. One `INSERT`
 * per level at year-creation time is a handful of round trips, not a
 * hot path.
 */
const seedDefaultComputationRules = Effect.fn("GradingScales.seedDefaultComputationRules")(function*(
  schoolId: string,
  academicYearId: string,
  levelIdByCode: ReadonlyMap<string, string>
) {
  const sql = yield* SqlClient
  const defaultsByCode = new Map(defaultComputationRules.map((rule) => [rule.levelCode, rule]))

  for (const [levelCode, levelId] of levelIdByCode) {
    const ministryDefault = defaultsByCode.get(levelCode)
    yield* sql`
      INSERT INTO computation_rules (
        school_id, academic_year_id, level_id, weight_continuous, weight_exam_1, weight_exam_2,
        reference_text, lowest_grade_exclusion_min_count, honors_thresholds, unjustified_absence_counts_as_zero
      )
      VALUES (
        ${schoolId}, ${academicYearId}, ${levelId},
        ${ministryDefault?.weightContinuous ?? 100}, ${ministryDefault?.weightExam1 ?? 0},
        ${ministryDefault?.weightExam2 ?? 0},
        ${ministryDefault?.referenceText ?? "No external exam — 100% continuous assessment"},
        NULL, ${JSON.stringify(defaultHonorsThresholds)}::jsonb, true
      )
    `
  }
})

/**
 * BEH-ZS-055: edits a section's grading scale — scoped to this year's own
 * snapshot (ADR-ZS-105), never a prior closed year's. The not-found check
 * starts from the repository's own `findById` (`section_id`) instead of a
 * hand-written pre-check `SELECT`, but `findById`'s `idColumn` is
 * `section_id` alone — it can't also filter by `academic_year_id` the way
 * the old hand-written `SELECT ... WHERE section_id = ... AND
 * academic_year_id = ...` did, so that year-scoping is re-checked explicitly
 * against the found row below (same guarantee as
 * `SubjectLevelConfigs.updateSubjectLevelConfig`'s `AND academic_year_id =
 * ...`, just expressed post-fetch instead of in the `WHERE` clause).
 *
 * `repo.update(...)` only runs when at least one field actually changed:
 * `SqlModel.makeRepository`'s single-row update compiles a bare `SET`
 * clause from whatever keys remain after excluding `idColumn`, and the pg
 * dialect has no `onRecordUpdateSingle` override to special-case an empty
 * one — calling it with nothing but `section_id` set would compile to
 * `UPDATE grading_scales SET  WHERE section_id = $1`, a syntax error. The
 * old code had the same effect (zero conditional `UPDATE`s ran) by
 * construction; this preserves it explicitly.
 */
const updateGradingScale = Effect.fn("GradingScales.updateGradingScale")(function*(
  command: UpdateGradingScaleCommand
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(command.schoolId)
  return yield* authorized(
    schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const repo = yield* gradingScaleRepo

        const notFound = () =>
          Effect.fail(new EntityNotFoundError({ entityType: "grading_scale", entityId: command.sectionId }))

        const scale = yield* repo.findById(command.sectionId).pipe(
          Effect.catchTag("NoSuchElementError", notFound)
        )
        if (scale.academic_year_id !== command.academicYearId) {
          return yield* notFound()
        }

        const fields = {
          ...(command.maxScore !== undefined ? { max_score: command.maxScore } : {}),
          ...(command.decimals !== undefined ? { decimals: command.decimals } : {}),
          ...(command.rounding !== undefined ? { rounding: command.rounding } : {})
        }
        if (Object.keys(fields).length > 0) {
          yield* repo.update({ section_id: command.sectionId, ...fields })
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
 * The "expire the old current row" step stays raw SQL — it's a
 * conditional, non-unique-keyed update (0 or 1 rows, matched by
 * `level_id`/`school_id`/`is_current`, not by a primary key), which the
 * single-row-by-id repository abstraction isn't a good fit for.
 *
 * Ticket #110: the insert itself is now a hand-built `INSERT` with an
 * explicit `::jsonb` cast for `honors_thresholds`, not a `SqlModel`
 * repository's generated `insert()` — its generated insert would hand
 * `@effect/sql-pg` the raw array parameter directly, which it can't infer a
 * Postgres type for (same reasoning as `ImportBatch.ts`'s own
 * `ImportBatchRow.payload` doc comment). Omitted optional fields on the
 * command carry forward the level's previous current rule, so an existing
 * caller that only ever set the exam weighting (`fr-ped-05`'s own BDD steps)
 * doesn't also have to respecify them.
 */
const setComputationRule = Effect.fn("GradingScales.setComputationRule")(function*(
  command: SetComputationRuleCommand
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(command.schoolId)
  return yield* authorized(
    schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const total = command.weightContinuous + command.weightExam1 + command.weightExam2
        if (total !== 100) {
          return yield* Effect.fail(new InvalidWeightingError({ levelId: command.levelId, total }))
        }

        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "levels", "level", command.levelId, schoolId, RowWithId)

        const [previous] = yield* sql<
          { lowest_grade_exclusion_min_count: number | null; honors_thresholds: unknown; unjustified_absence_counts_as_zero: boolean }
        >`
          SELECT lowest_grade_exclusion_min_count, honors_thresholds, unjustified_absence_counts_as_zero
          FROM computation_rules
          WHERE level_id = ${command.levelId} AND school_id = ${command.schoolId} AND is_current
        `

        yield* sql`
          UPDATE computation_rules SET is_current = false
          WHERE level_id = ${command.levelId} AND school_id = ${command.schoolId} AND is_current
        `

        const lowestGradeExclusionMinCount = command.lowestGradeExclusionMinCount ??
          previous?.lowest_grade_exclusion_min_count ?? null
        const honorsThresholds = command.honorsThresholds ??
          (previous?.honors_thresholds as ReadonlyArray<HonorsThreshold> | undefined) ??
          defaultHonorsThresholds
        const unjustifiedAbsenceCountsAsZero = command.unjustifiedAbsenceCountsAsZero ??
          previous?.unjustified_absence_counts_as_zero ?? true

        const [rule] = yield* sql<{ id: string }>`
          INSERT INTO computation_rules (
            school_id, academic_year_id, level_id, weight_continuous, weight_exam_1, weight_exam_2,
            reference_text, lowest_grade_exclusion_min_count, honors_thresholds, unjustified_absence_counts_as_zero
          )
          VALUES (
            ${schoolId}, ${command.academicYearId}, ${command.levelId}, ${command.weightContinuous},
            ${command.weightExam1}, ${command.weightExam2}, ${command.referenceText},
            ${lowestGradeExclusionMinCount}, ${JSON.stringify(honorsThresholds)}::jsonb,
            ${unjustifiedAbsenceCountsAsZero}
          )
          RETURNING id
        `
        return rule.id
      })
    )
  )
})

/**
 * Pilot (ticket #23), now the first-landed full `Model.Class` migration
 * (issue #36): the grading-scales area restructured as a single injectable
 * service instead of loose exported functions. Every caller goes through
 * `yield* GradingScales` rather than importing
 * `seedDefaultComputationRules`/`updateGradingScale`/`setComputationRule`
 * directly — those three stay as private implementations the service
 * methods delegate to, so the tracing-span names from ticket #19 aren't
 * duplicated.
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
