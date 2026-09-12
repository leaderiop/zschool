import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #57 (Finance capability #54): `installments` and
 * `installment_adjustments` (BEH-ZS-153). `fee_schedules` gains
 * `prorate_partial_month` — the "per-school option" BEH-ZS-153 names
 * ("a started month is due in full by default; daily proration is an
 * option") — kept on `fee_schedules` rather than a new settings table since
 * that's already the per-(school, year, level, track) scope this decision
 * needs to vary at.
 *
 * `UNIQUE (financial_account_id, fee_item_id, due_date)` makes payment
 * schedule generation retry-safe: `PaymentSchedule.ts`'s
 * `generatePaymentSchedule` catches a unique-violation per occurrence and
 * skips it, the same "insert-catch-unique, no duplicate on retry" shape
 * every import commit in this codebase already uses.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`ALTER TABLE fee_schedules ADD COLUMN prorate_partial_month boolean NOT NULL DEFAULT false`

  yield* sql`
    CREATE TABLE installments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      financial_account_id uuid NOT NULL REFERENCES financial_accounts (id),
      fee_item_id uuid NOT NULL REFERENCES fee_items (id),
      amount_mad numeric NOT NULL CHECK (amount_mad >= 0),
      due_date date NOT NULL,
      status text NOT NULL DEFAULT 'due' CHECK (status IN ('due', 'partially_paid', 'paid', 'overdue')),
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (financial_account_id, fee_item_id, due_date)
    )
  `
  yield* sql`CREATE INDEX installments_financial_account_idx ON installments (financial_account_id)`
  yield* applyTenantIsolation(sql, "installments")

  // Insert-only trace of manual adjustments (BEH-ZS-153: "manual adjustment
  // MUST be possible with author and reason traced") — the installment row
  // itself carries only the CURRENT amount/due-date; this table is the
  // permanent record of what it used to be and why it changed, the same
  // "current state table plus a dedicated append-only trace" split
  // `financial_guardian_designations`/`FinancialAccount` (migration 0015)
  // already established, here applied to a genuinely mutable row instead of
  // a "latest wins" one.
  yield* sql`
    CREATE TABLE installment_adjustments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      installment_id uuid NOT NULL REFERENCES installments (id),
      previous_amount_mad numeric,
      new_amount_mad numeric,
      previous_due_date date,
      new_due_date date,
      reason text NOT NULL,
      actor_subject_id text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
  `
  yield* applyTenantIsolation(sql, "installment_adjustments")
})
