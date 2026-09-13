import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #64 (Finance capability #54): dunning / graduated reminders
 * (`BEH-ZS-168`, `REQ-ZS-144`, `features/fin/fr-fin-18-graduated-reminder.feature`).
 *
 * `dunning_tiers` is the per-school configurable policy (count, day-offset,
 * severity) — school-level only, not an `ADR-ZS-105` per-`AcademicYear`
 * snapshot like `fee_schedules`/`sibling_discount_policies`: a collections
 * cadence is an operational finance-ops setting the school tunes over time,
 * not an academic-structure entity that must freeze per year. One row per
 * `(school, tier_order)`; `Dunning.ts#configureDunningTiers` reconfigures by
 * deleting and re-inserting the whole set atomically, the same
 * "current-state, not a log" treatment `sibling_discount_lines` already gets.
 *
 * `dunnings` is the append-only record `Dunning.ts#evaluateDunningForOverdueInstallments`/
 * `triggerManualReminder` creates — never updated or deleted, so "a full
 * per-tier history kept" holds even after the installment settles.
 * `dunning_tier_id` is NULL exactly for an ad hoc manual reminder
 * (`is_manual = true`); an automatic one always names the tier that fired it.
 * The partial unique index makes evaluation idempotent per `(installment,
 * tier)` — re-running it never double-creates a record for a tier already
 * crossed — while still allowing any number of manual reminders on the same
 * installment.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE dunning_tiers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      tier_order int NOT NULL CHECK (tier_order > 0),
      day_offset_days int NOT NULL CHECK (day_offset_days >= 0),
      severity_label text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (school_id, tier_order)
    )
  `
  yield* applyTenantIsolation(sql, "dunning_tiers")

  yield* sql`
    CREATE TABLE dunnings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      installment_id uuid NOT NULL REFERENCES installments (id),
      dunning_tier_id uuid REFERENCES dunning_tiers (id),
      is_manual boolean NOT NULL DEFAULT false,
      triggered_by_subject_id text,
      created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      CONSTRAINT dunnings_manual_xor_tier CHECK (
        (is_manual AND dunning_tier_id IS NULL AND triggered_by_subject_id IS NOT NULL)
        OR (NOT is_manual AND dunning_tier_id IS NOT NULL)
      )
    )
  `
  yield* sql`CREATE INDEX dunnings_installment_idx ON dunnings (installment_id)`
  yield* sql`
    CREATE UNIQUE INDEX dunnings_installment_tier_unique ON dunnings (installment_id, dunning_tier_id)
    WHERE NOT is_manual
  `
  yield* applyTenantIsolation(sql, "dunnings")
})
