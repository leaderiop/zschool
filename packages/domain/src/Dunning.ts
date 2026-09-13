import { CurrentSubject } from "@qadi/core/CurrentSubject"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { DunningId, DunningTierId, SchoolId } from "./Ids.ts"
import { authorizedFinance, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

export { EntityNotFoundError }

export class InvalidDunningTiersError extends Schema.TaggedError<InvalidDunningTiersError>()(
  "InvalidDunningTiersError",
  { reason: Schema.String }
) {}

export class InvalidManualReminderError extends Schema.TaggedError<InvalidManualReminderError>()(
  "InvalidManualReminderError",
  { reason: Schema.String }
) {}

/**
 * `Model.Class` for `dunning_tiers` (migration 0021) — configured policy,
 * current state only (`Ownership.ts`'s `authorizedFinance` gates every
 * write, `configureDunningTiers` reconfigures the whole set atomically).
 */
export class DunningTier extends Model.Class<DunningTier>("DunningTier")({
  id: Model.Field({ select: DunningTierId, update: DunningTierId, json: DunningTierId, jsonUpdate: DunningTierId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  tier_order: Schema.Int.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  day_offset_days: Schema.Int.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  severity_label: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/**
 * `Model.Class` for `dunnings` (migration 0021) — an append-only record,
 * never updated: "a full per-tier history kept" (BEH-ZS-168) holds simply
 * because nothing here ever mutates or deletes a row, the installment's own
 * settled state is computed separately (`remainingOwed` below), and history
 * is read by querying every row for the installment regardless of that
 * state.
 */
export class Dunning extends Model.Class<Dunning>("Dunning")({
  id: Model.Field({ select: DunningId, update: DunningId, json: DunningId, jsonUpdate: DunningId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  installment_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  dunning_tier_id: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  is_manual: Schema.Boolean.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  triggered_by_subject_id: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

export interface DunningTierInput {
  readonly order: number
  readonly dayOffsetDays: number
  readonly severityLabel: string
}

export class ConfigureDunningTiersCommand extends Schema.Class<ConfigureDunningTiersCommand>(
  "ConfigureDunningTiersCommand"
)({
  schoolId: SchoolId,
  tiers: Schema.Array(Schema.Struct({
    order: Schema.Int,
    dayOffsetDays: Schema.Int,
    severityLabel: Schema.NonEmptyString
  }))
}) {}

export class TriggerManualReminderCommand extends Schema.Class<TriggerManualReminderCommand>(
  "TriggerManualReminderCommand"
)({
  schoolId: SchoolId,
  installmentId: Schema.NonEmptyString
}) {}

const dunningTierRepo = SqlModel.makeRepository(DunningTier, {
  tableName: "dunning_tiers",
  spanPrefix: "Dunning",
  idColumn: "id"
})

const dunningRepo = SqlModel.makeRepository(Dunning, {
  tableName: "dunnings",
  spanPrefix: "Dunning",
  idColumn: "id"
})

/**
 * An installment's remaining owed amount — the same computation
 * `Payment.ts#remainingOwed` makes (kept as an independent copy rather than
 * an import: `Dunning.ts` must never drift from Payment.ts's own definition
 * of "settled", but importing an unexported internal from another module
 * would couple the two files' internals rather than their public contract;
 * both read the identical `payment_allocations`/`payments.status`
 * shape, so the two copies can only diverge if that shared shape itself
 * changes, at which point both call sites need updating anyway). Excludes
 * `'voided'` payments (BEH-ZS-179) and, by construction, a not-yet-`cleared`
 * cheque or a still-`pending_confirmation` bank transfer — neither has any
 * `payment_allocations` row yet (`Payment.ts`'s `applyConfirmation` only
 * ever runs at confirmation time), so nothing extra is needed here to
 * exclude them.
 */
const remainingOwed = Effect.fn("Dunning.remainingOwed")(function*(
  sql: SqlClient,
  installmentId: string,
  amountMad: number
) {
  const [row] = yield* sql<{ paid: string }>`
    SELECT COALESCE(SUM(pa.amount_mad) FILTER (WHERE p.status != 'voided'), 0) AS paid
    FROM payment_allocations pa
    JOIN payments p ON p.id = pa.payment_id
    WHERE pa.installment_id = ${installmentId}
  `
  return amountMad - Number(row.paid)
})

/** Every configured tier for a school, oldest (lowest `day_offset_days`) first. */
export const findDunningTiers = Effect.fn("Dunning.findDunningTiers")(function*(rawSchoolId: string) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String }),
        Result: DunningTier,
        execute: (req) => sql`SELECT * FROM dunning_tiers WHERE school_id = ${req.schoolId} ORDER BY tier_order ASC`
      })({ schoolId })
    })
  )
})

/**
 * BEH-ZS-168/`REQ-ZS-144`: replaces a school's whole dunning-tier policy —
 * delete-and-reinsert, the same "reconfigured in place, not versioned"
 * treatment `configureVoidApprovalPolicy`/`splitFinancialResponsibility`
 * already give a small, fully-owned configuration set, atomically inside one
 * transaction so a caller never observes a partially-replaced tier list.
 * Validated inside the `authorizedFinance` gate, not before it — matching
 * every other finance command in this capability.
 */
export const configureDunningTiers = Effect.fn("Dunning.configureDunningTiers")(function*(
  rawCommand: (typeof ConfigureDunningTiersCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(ConfigureDunningTiersCommand)(rawCommand)
  return yield* authorizedFinance(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        if (command.tiers.length === 0) {
          return yield* Effect.fail(new InvalidDunningTiersError({ reason: "at least one tier is required" }))
        }
        const orders = command.tiers.map((tier) => tier.order)
        if (new Set(orders).size !== orders.length) {
          return yield* Effect.fail(new InvalidDunningTiersError({ reason: "tier orders must be unique" }))
        }
        const sorted = [...command.tiers].sort((a, b) => a.order - b.order)
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i].dayOffsetDays <= sorted[i - 1].dayOffsetDays) {
            return yield* Effect.fail(
              new InvalidDunningTiersError({
                reason: "day offsets must strictly increase with tier order (increasing severity)"
              })
            )
          }
        }

        const sql = yield* SqlClient
        const repo = yield* dunningTierRepo
        yield* sql.withTransaction(Effect.gen(function*() {
          yield* sql`DELETE FROM dunning_tiers WHERE school_id = ${command.schoolId}`
          for (const tier of command.tiers) {
            yield* repo.insert({
              school_id: command.schoolId,
              tier_order: tier.order,
              day_offset_days: tier.dayOffsetDays,
              severity_label: tier.severityLabel
            })
          }
        }))
      })
    )
  )
})

/**
 * BEH-ZS-168: for every unsettled, overdue installment in `schoolId`, finds
 * every configured tier whose `day_offset_days` it has now crossed and
 * creates a `Dunning` record for each one not already recorded (idempotent —
 * re-running never double-creates a record for a tier already crossed).
 * Deliberately unauthorized/internal, the same "best-effort, not a director
 * action" treatment `PaymentSchedule.ts`'s `generateOccurrencesForAccount`
 * gets — this is meant to be invoked by a scheduling harness on a recurring
 * basis (none exists yet in this codebase; wiring one up is out of this
 * ticket's "record creation only" scope, per the finance spec's own
 * BEH-ZS-168 note), not by a human command. `triggerDunningEvaluation` below
 * is the explicitly-authorized manual entry point for a director invoking
 * the same evaluation on demand.
 */
export const evaluateDunningForOverdueInstallments = Effect.fn(
  "Dunning.evaluateDunningForOverdueInstallments"
)(function*(rawSchoolId: string) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const tiers = yield* findDunningTiers(schoolId)
      if (tiers.length === 0) return { created: 0 }

      const overdue = yield* sql<{ id: string; amount_mad: string; days_overdue: number }>`
        SELECT id, amount_mad, (CURRENT_DATE - due_date)::int AS days_overdue
        FROM installments
        WHERE school_id = ${schoolId} AND due_date < CURRENT_DATE
      `

      const repo = yield* dunningRepo
      let created = 0
      for (const installment of overdue) {
        const remaining = yield* remainingOwed(sql, installment.id, Number(installment.amount_mad))
        if (remaining <= 0.01) continue

        const crossedTiers = tiers.filter((tier) => installment.days_overdue >= tier.day_offset_days)
        for (const tier of crossedTiers) {
          const result = yield* Effect.result(sql.withTransaction(repo.insert({
            school_id: schoolId,
            installment_id: installment.id,
            dunning_tier_id: tier.id,
            is_manual: false,
            triggered_by_subject_id: null
          })))
          if (Result.isSuccess(result)) {
            created++
            continue
          }
          // Same "insert-catch-unique-then-reselect, re-fail if reselect
          // finds nothing" idiom as `PaymentSchedule.ts`'s generation loop —
          // a unique-violation on `(installment_id, dunning_tier_id)` means
          // this tier was already recorded by a previous evaluation run,
          // which is expected and silently skipped; any OTHER failure must
          // still surface.
          const existing = yield* sql<{ id: string }>`
            SELECT id FROM dunnings WHERE installment_id = ${installment.id} AND dunning_tier_id = ${tier.id}
          `
          if (existing[0] === undefined) {
            return yield* Effect.fail(result.failure)
          }
        }
      }
      return { created }
    })
  )
})

/** The authorized, explicit manual trigger for a director re-running dunning evaluation on demand (e.g. after reconfiguring tiers), rather than waiting for the next scheduled pass. */
export const triggerDunningEvaluation = Effect.fn("Dunning.triggerDunningEvaluation")(function*(
  rawSchoolId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizedFinance(schoolId, evaluateDunningForOverdueInstallments(schoolId))
})

/**
 * BEH-ZS-168's ad hoc case: accounting triggering a reminder outside the
 * automatic tiers — `dunning_tier_id` stays NULL (`is_manual = true`), so it
 * never collides with, or counts against, the tier-based unique index.
 */
export const triggerManualReminder = Effect.fn("Dunning.triggerManualReminder")(function*(
  rawCommand: (typeof TriggerManualReminderCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(TriggerManualReminderCommand)(rawCommand)
  return yield* authorizedFinance(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const subject = yield* CurrentSubject
        yield* requireOwnedRow(sql, "installments", "installment", command.installmentId, command.schoolId, RowWithId)
        const repo = yield* dunningRepo
        return yield* repo.insert({
          school_id: command.schoolId,
          installment_id: command.installmentId,
          dunning_tier_id: null,
          is_manual: true,
          triggered_by_subject_id: subject.id
        })
      })
    )
  )
})

/** BEH-ZS-168: the full per-tier (and manual) history for one installment, oldest first — kept and readable even after the installment is fully settled, since nothing here is ever deleted. */
export const findDunningHistory = Effect.fn("Dunning.findDunningHistory")(function*(
  rawSchoolId: string,
  installmentId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      yield* requireOwnedRow(sql, "installments", "installment", installmentId, schoolId, RowWithId)
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ installmentId: Schema.String }),
        Result: Dunning,
        execute: (req) => sql`SELECT * FROM dunnings WHERE installment_id = ${req.installmentId} ORDER BY created_at ASC`
      })({ installmentId })
    })
  )
})
