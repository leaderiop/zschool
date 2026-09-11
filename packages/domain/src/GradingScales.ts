import { withSchool } from "@zschool/db"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import { ComputationRuleId, GradingScaleId, SchoolId } from "./Ids.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

/** A field required on insert/select but optional (a partial-update PATCH field) on update — `max_score`/`decimals`/`rounding` below, none of which `updateGradingScale` requires touching together. */
const optionalOnUpdate = <S extends Schema.Top>(schema: S) =>
  Model.Field({
    select: schema,
    insert: schema,
    update: Schema.optional(schema),
    json: schema,
    jsonCreate: schema,
    jsonUpdate: Schema.optional(schema)
  })

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

/**
 * Matches migration 0005's `computation_rules` table. `is_current`/
 * `effective_from` are `GeneratedByDb`: every insert site (`setComputationRule`,
 * `seedDefaultComputationRules`) already relies on their DB defaults
 * (`true`/`now()`) rather than setting them explicitly.
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
const computationRuleRepo = SqlModel.makeRepository(ComputationRule, {
  tableName: "computation_rules",
  spanPrefix: "GradingScales",
  idColumn: "id"
})

/** Seeds the default computation rules for the levels the ministry publishes them for (6AP, 3AC, 2BAC) — called from `InstantiateNationalTemplate.ts` at year creation, same pattern as `seedCalendarEvents`. Still one batched insert for the whole seed set, not N repository inserts — the row shape is now checked against `ComputationRule.insert` instead of an untyped object literal. */
const seedDefaultComputationRules = Effect.fn("GradingScales.seedDefaultComputationRules")(function*(
  schoolId: string,
  academicYearId: string,
  levelIdByCode: ReadonlyMap<string, string>
) {
  const sql = yield* SqlClient
  const rows: Array<(typeof ComputationRule)["insert"]["Encoded"]> = defaultComputationRules
    .filter((rule) => levelIdByCode.has(rule.levelCode))
    .map((rule) => ({
      school_id: schoolId,
      academic_year_id: academicYearId,
      level_id: levelIdByCode.get(rule.levelCode)!,
      // Raw sql.insert bypasses Schema encoding, so these are stringified by
      // hand — ComputationRule's weight_* fields are NumberFromString
      // (numeric columns round-trip as decimal strings, see the model).
      weight_continuous: String(rule.weightContinuous),
      weight_exam_1: String(rule.weightExam1),
      weight_exam_2: String(rule.weightExam2),
      reference_text: rule.referenceText
    }))

  if (rows.length > 0) {
    yield* sql`INSERT INTO computation_rules ${sql.insert(rows)}`
  }
})

/**
 * BEH-ZS-055: edits a section's grading scale — scoped to this year's own
 * snapshot (ADR-ZS-105), never a prior closed year's. The not-found check
 * comes from the repository's own `findById` (`section_id`) instead of a
 * hand-written pre-check `SELECT`; the update itself is one
 * `repo.update(...)` built from whichever optional fields were supplied,
 * instead of up to three near-identical conditional `UPDATE` statements.
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

        yield* repo.findById(command.sectionId).pipe(
          Effect.catchTag(
            "NoSuchElementError",
            () => Effect.fail(new EntityNotFoundError({ entityType: "grading_scale", entityId: command.sectionId }))
          )
        )

        yield* repo.update({
          section_id: command.sectionId,
          ...(command.maxScore !== undefined ? { max_score: command.maxScore } : {}),
          ...(command.decimals !== undefined ? { decimals: command.decimals } : {}),
          ...(command.rounding !== undefined ? { rounding: command.rounding } : {})
        })
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
 * single-row-by-id repository abstraction isn't a good fit for; the insert
 * of the new current row goes through the repository.
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

        yield* sql`
          UPDATE computation_rules SET is_current = false
          WHERE level_id = ${command.levelId} AND school_id = ${command.schoolId} AND is_current
        `

        const repo = yield* computationRuleRepo
        const rule = yield* repo.insert({
          school_id: schoolId,
          academic_year_id: command.academicYearId,
          level_id: command.levelId,
          weight_continuous: command.weightContinuous,
          weight_exam_1: command.weightExam1,
          weight_exam_2: command.weightExam2,
          reference_text: command.referenceText
        })
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
