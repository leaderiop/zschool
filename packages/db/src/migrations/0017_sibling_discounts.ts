import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #58 (Finance capability #54): the automatic sibling discount
 * (`BEH-ZS-154`/`REQ-ZS-136`, `features/fin/fr-fin-04-sibling-discount.feature`).
 *
 * `sibling_discount_policies` is the per-school, per-year configurable rate
 * (`ADR-ZS-105`'s per-`AcademicYear` snapshot, same as `fee_schedules`) — at
 * most one row per (school, year), reconfigured in place rather than
 * versioned, since a policy correction should apply the moment it's saved,
 * not create a second competing row.
 *
 * `sibling_discount_lines` is CURRENT STATE, not a log: one row per
 * currently-discounted installment, fully reconciled (deleted and
 * re-inserted) on every recompute by `SiblingDiscount.ts`'s
 * `recomputeSiblingDiscounts` — the acceptance criterion "appears on the
 * payment schedule as its own distinct, referenced line, never folded
 * silently into tuition" is satisfied by this row's own existence, joined
 * against `installments` by a caller, rather than mutating
 * `installments.amount_mad` in place.
 *
 * `sibling_discount_recomputations` is the append-only trace the feature
 * file's "with the recomputation traced" line requires — same
 * current-state-table-plus-dedicated-trace split as
 * `financial_guardian_designations`/`installment_adjustments`.
 *
 * `enrollments.closure_reason` (nullable, mirroring `capacity_override_reason`'s
 * shape): this ticket is the first consumer that needs an enrollment to ever
 * leave `'active'` mid-year (`fr-fin-04`'s "Youssef's enrollment closes
 * mid-year"), so it adds the minimal column `Enrollment.ts`'s new
 * `closeEnrollment` needs; ticket #63 (`BEH-ZS-172`/`173` account survival)
 * is expected to build on this same `'completed'` transition rather than
 * introduce a competing one.
 *
 * `enrollments.created_at` switches from `now()` to `clock_timestamp()` —
 * `SiblingDiscount.ts`'s `recomputeSiblingDiscounts` orders a sibling
 * group's enrollments by `(effective_date, created_at)` to decide who keeps
 * the full rate, and two siblings enrolled in the SAME transaction (e.g. a
 * single `StudentGuardianImport.ts` batch commit) would otherwise get the
 * IDENTICAL `now()` timestamp, making that tiebreak arbitrary — the same
 * `now()`-is-constant-per-transaction pitfall migration 0015's
 * `financial_guardian_designations` already worked around.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`ALTER TABLE enrollments ADD COLUMN closure_reason text`
  yield* sql`ALTER TABLE enrollments ALTER COLUMN created_at SET DEFAULT clock_timestamp()`

  yield* sql`
    CREATE TABLE sibling_discount_policies (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'flat_amount')),
      discount_value numeric NOT NULL CHECK (discount_value > 0),
      applies_to_natures text[] NOT NULL CHECK (array_length(applies_to_natures, 1) > 0),
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (school_id, academic_year_id)
    )
  `
  yield* applyTenantIsolation(sql, "sibling_discount_policies")

  yield* sql`
    CREATE TABLE sibling_discount_lines (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      financial_account_id uuid NOT NULL REFERENCES financial_accounts (id),
      installment_id uuid NOT NULL UNIQUE REFERENCES installments (id),
      sibling_discount_policy_id uuid NOT NULL REFERENCES sibling_discount_policies (id),
      amount_mad numeric NOT NULL CHECK (amount_mad > 0),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* sql`CREATE INDEX sibling_discount_lines_account_idx ON sibling_discount_lines (financial_account_id)`
  yield* applyTenantIsolation(sql, "sibling_discount_lines")

  yield* sql`
    CREATE TABLE sibling_discount_recomputations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      financial_account_id uuid NOT NULL REFERENCES financial_accounts (id),
      trigger_reason text NOT NULL CHECK (trigger_reason IN ('sibling_activated', 'sibling_closed')),
      installments_added int NOT NULL DEFAULT 0,
      installments_removed int NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
  `
  yield* applyTenantIsolation(sql, "sibling_discount_recomputations")
})
