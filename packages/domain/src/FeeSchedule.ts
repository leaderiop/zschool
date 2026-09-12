import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { requireTrackBelongsToLevel } from "./AcademicTree.ts"
import { FeeItemId, FeeScheduleId, LevelId, SchoolId, TrackId } from "./Ids.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

export { EntityNotFoundError }

/** BEH-ZS-151's typed fee-line natures — not an exhaustive closed catalog forever, but the only ones a fee line may carry at MVP. */
export const FEE_NATURES = [
  "registration",
  "re_enrollment",
  "tuition",
  "insurance",
  "transport",
  "canteen",
  "activities",
  "supplies",
  "textbooks",
  "uniform"
] as const

export type FeeNature = (typeof FEE_NATURES)[number]

export const FEE_FREQUENCIES = ["one_time", "monthly", "quarterly", "annual"] as const

export type FeeFrequency = (typeof FEE_FREQUENCIES)[number]

/** BEH-ZS-151: marking one of these mandatory is a Law 59.21 forced-sale alert — a traced justification is required, never silently accepted. */
const NATURES_REQUIRING_JUSTIFICATION_WHEN_MANDATORY: ReadonlySet<FeeNature> = new Set(["supplies", "textbooks", "uniform"])

export class DuplicateFeeScheduleError
  extends Schema.TaggedError<DuplicateFeeScheduleError>()("DuplicateFeeScheduleError", {
    schoolId: Schema.String,
    academicYearId: Schema.String,
    levelId: Schema.String,
    trackId: Schema.UndefinedOr(Schema.String)
  })
{}

export class MandatoryJustificationRequiredError
  extends Schema.TaggedError<MandatoryJustificationRequiredError>()("MandatoryJustificationRequiredError", {
    nature: Schema.String
  })
{}

/**
 * `Model.Class` for `fee_schedules` (ticket #55, migration 0014). Insert-only
 * from this file's perspective — cloning to year N+1 and in-place editing are
 * both out of scope here (this ticket's own spec, `ADR-ZS-105`'s per-year
 * snapshot deferral) — but `id` still needs this custom `Model.Field` variant
 * rather than `Model.GeneratedByDb`, purely to satisfy
 * `SqlModel.makeRepository`'s `idColumn` constraint, the same reasoning as
 * `Enrollment.id`/`Class.id`.
 */
export class FeeSchedule extends Model.Class<FeeSchedule>("FeeSchedule")({
  id: Model.Field({
    select: FeeScheduleId,
    update: FeeScheduleId,
    json: FeeScheduleId,
    jsonUpdate: FeeScheduleId
  }),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  level_id: Schema.String,
  track_id: Schema.NullOr(Schema.String),
  // Ticket #57 / BEH-ZS-153 (migration 0016): "a started month is due in
  // full by default; a per-school option switches to daily proration" — no
  // command sets this explicitly yet (out of this ticket's own scope), so
  // `GeneratedByDb`, matching `Class.is_active`'s reasoning: read-only
  // through this Model, defaulting to `false` at the DB level.
  prorate_partial_month: Model.GeneratedByDb(Schema.Boolean),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/** `amount_mad` is `numeric` (migration 0014) — round-trips through `@effect/sql-pg` as a decimal string, same reasoning as `GradingScale.max_score`. */
export class FeeItem extends Model.Class<FeeItem>("FeeItem")({
  id: Model.Field({ select: FeeItemId, update: FeeItemId, json: FeeItemId, jsonUpdate: FeeItemId }),
  school_id: SchoolId,
  fee_schedule_id: Schema.String,
  nature: Schema.Literals(FEE_NATURES),
  label_fr: Schema.String,
  label_ar: Schema.String,
  frequency: Schema.Literals(FEE_FREQUENCIES),
  // Finite, not plain `NumberFromString` (a money field must never decode
  // NaN/Infinity from a corrupt row).
  amount_mad: Schema.FiniteFromString,
  is_mandatory: Schema.Boolean,
  mandatory_justification: Schema.NullOr(Schema.String),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

export class CreateFeeScheduleCommand extends Schema.Class<CreateFeeScheduleCommand>("CreateFeeScheduleCommand")({
  schoolId: SchoolId,
  academicYearId: Schema.String,
  levelId: Schema.String,
  trackId: Schema.optional(Schema.NonEmptyString)
}) {}

export class AddFeeItemCommand extends Schema.Class<AddFeeItemCommand>("AddFeeItemCommand")({
  schoolId: SchoolId,
  feeScheduleId: Schema.String,
  nature: Schema.Literals(FEE_NATURES),
  labelFr: Schema.NonEmptyString,
  labelAr: Schema.NonEmptyString,
  frequency: Schema.Literals(FEE_FREQUENCIES),
  // A money field must never accept NaN/Infinity — `Schema.Finite`, not plain `Schema.Number`.
  amountMad: Schema.Finite.check(Schema.isGreaterThanOrEqualTo(0)),
  isMandatory: Schema.Boolean,
  mandatoryJustification: Schema.optional(Schema.NonEmptyString)
}) {}

const feeScheduleRepo = SqlModel.makeRepository(FeeSchedule, {
  tableName: "fee_schedules",
  spanPrefix: "FeeSchedule",
  idColumn: "id"
})

const feeItemRepo = SqlModel.makeRepository(FeeItem, {
  tableName: "fee_items",
  spanPrefix: "FeeSchedule",
  idColumn: "id"
})

/**
 * BEH-ZS-151: one fee schedule per (school, year, level, track) — a second
 * attempt at the same tuple is refused rather than silently duplicating
 * pricing for the same students, mirroring
 * `SubjectLevelConfigs.ts`'s `configureSubjectLevel` refusal shape.
 */
export const createFeeSchedule = Effect.fn("FeeSchedule.createFeeSchedule")(function*(
  rawCommand: (typeof CreateFeeScheduleCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(CreateFeeScheduleCommand)(rawCommand)
  return yield* authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "academic_years", "academic_year", command.academicYearId, command.schoolId, RowWithId)
        // Not just "this level belongs to this school" (`requireOwnedRow`
        // alone would pass a level from a *different* academic year at the
        // same school) — a level's own `academic_year_id` must match the
        // command's, or the schedule would be keyed to a (year, level) pair
        // that doesn't actually exist together.
        const level = yield* requireOwnedRow(
          sql,
          "levels",
          "level",
          command.levelId,
          command.schoolId,
          Schema.Struct({ academic_year_id: Schema.String }),
          "academic_year_id"
        )
        if (level.academic_year_id !== command.academicYearId) {
          return yield* Effect.fail(new EntityNotFoundError({ entityType: "level", entityId: command.levelId }))
        }
        if (command.trackId !== undefined) {
          const trackId = yield* Schema.decodeEffect(TrackId)(command.trackId)
          const levelId = yield* Schema.decodeEffect(LevelId)(command.levelId)
          yield* requireTrackBelongsToLevel(trackId, levelId, command.schoolId)
        }

        const repo = yield* feeScheduleRepo
        const schedule = yield* repo.insert({
          school_id: command.schoolId,
          academic_year_id: command.academicYearId,
          level_id: command.levelId,
          track_id: command.trackId ?? null
        }).pipe(
          Effect.catchReason("SqlError", "UniqueViolation", () =>
            Effect.fail(
              new DuplicateFeeScheduleError({
                schoolId: command.schoolId,
                academicYearId: command.academicYearId,
                levelId: command.levelId,
                trackId: command.trackId
              })
            ))
        )
        return schedule.id
      })
    )
  )
})

/**
 * BEH-ZS-151: adds one typed fee line to an existing schedule. Marking a
 * books/supplies/uniform line mandatory without a justification is refused
 * here at the domain layer — migration 0014's `mandatory_line_requires_justification`
 * CHECK is the defense-in-depth backstop, not the primary gate (`ADR-ZS-092`).
 */
export const addFeeItem = Effect.fn("FeeSchedule.addFeeItem")(function*(
  rawCommand: (typeof AddFeeItemCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(AddFeeItemCommand)(rawCommand)
  return yield* authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "fee_schedules", "fee_schedule", command.feeScheduleId, command.schoolId, RowWithId)

        if (
          command.isMandatory &&
          NATURES_REQUIRING_JUSTIFICATION_WHEN_MANDATORY.has(command.nature) &&
          command.mandatoryJustification === undefined
        ) {
          return yield* Effect.fail(new MandatoryJustificationRequiredError({ nature: command.nature }))
        }

        const repo = yield* feeItemRepo
        const item = yield* repo.insert({
          school_id: command.schoolId,
          fee_schedule_id: command.feeScheduleId,
          nature: command.nature,
          label_fr: command.labelFr,
          label_ar: command.labelAr,
          frequency: command.frequency,
          amount_mad: command.amountMad,
          is_mandatory: command.isMandatory,
          mandatory_justification: command.mandatoryJustification ?? null
        })
        return item.id
      })
    )
  )
})

/** The fee lines attached to one schedule — read-only reuse point for `PaymentSchedule.ts` (ticket #57), which never writes to `fee_items`. */
export const findFeeItems = Effect.fn("FeeSchedule.findFeeItems")(function*(
  schoolId: string,
  feeScheduleId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String, feeScheduleId: Schema.String }),
        Result: FeeItem,
        execute: (req) =>
          sql`SELECT * FROM fee_items WHERE school_id = ${req.schoolId} AND fee_schedule_id = ${req.feeScheduleId}`
      })({ schoolId, feeScheduleId })
    })
  )
})

/**
 * The fee schedule applicable to a (level, track) pair for a year, if one
 * has been defined yet — `findClassByLevelLabelAndTrack`'s `IS NOT DISTINCT
 * FROM` null-safe-equality shape, for the identical reason (an untracked
 * lookup must match an untracked schedule). Read-only reuse point for
 * `PaymentSchedule.ts` (ticket #57).
 */
export const findFeeScheduleForLevel = Effect.fn("FeeSchedule.findFeeScheduleForLevel")(function*(
  schoolId: string,
  academicYearId: string,
  levelId: string,
  trackId: string | null
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findOneOption({
        Request: Schema.Struct({
          schoolId: Schema.String,
          academicYearId: Schema.String,
          levelId: Schema.String,
          trackId: Schema.NullOr(Schema.String)
        }),
        Result: FeeSchedule,
        execute: (req) =>
          sql`
            SELECT * FROM fee_schedules
            WHERE school_id = ${req.schoolId} AND academic_year_id = ${req.academicYearId}
              AND level_id = ${req.levelId} AND track_id IS NOT DISTINCT FROM ${req.trackId}
          `
      })({ schoolId, academicYearId, levelId, trackId })
    })
  )
})
