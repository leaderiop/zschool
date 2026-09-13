import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #60 (Finance capability #54): void / reversing entries
 * (`BEH-ZS-179`, `REQ-ZS-151`, `INV-ZS-017`).
 *
 * `payments.status` already reserved `'voided'` in migration 0018's CHECK —
 * voiding transitions a `payments` row to it via the same raw-`UPDATE`
 * shape `confirmPayment` already uses, never an edit of the confirmed row's
 * own business fields (BEH-ZS-179: "MUST NOT ever be edited or deleted").
 *
 * `payment_voids` is the reversing entry itself: `UNIQUE (payment_id)` means
 * a payment can be voided at most once, ever — including while a request is
 * still `'pending_approval'`, a second concurrent void attempt is rejected
 * by this same constraint rather than racing to double-reverse the same
 * payment. `status` starts `'pending_approval'` and moves to `'finalized'`
 * either immediately (same transaction, when no approval is required) or
 * later via a separate `approveVoid` action — `approved_by_subject_id`/
 * `approved_at`/`finalized_at` stay NULL until then.
 *
 * `void_approval_policies` is the per-school configurable threshold
 * (`BEH-ZS-179`: "beyond a configurable amount threshold ... requires an
 * authorized approval") — `amount_threshold_mad` NULL means the school
 * hasn't opted into an amount-based gate at all (only the "outside the
 * entry's own day" rule from the requirement's other clause still applies
 * unconditionally). One row per school, not per academic year — unlike
 * `sibling_discount_policies` (migration 0017), this is an operational
 * finance-ops setting, not a per-year academic snapshot (`ADR-ZS-105`
 * doesn't apply here).
 *
 * `receipts` (migration 0018) gains `kind`/`void_id`: a void receipt is a
 * genuinely SEPARATE row referencing the original payment and its own
 * `payment_voids` row, in the SAME gapless per-school sequence
 * (`Payment.ts`'s `issueReceipt`/`drawNextReceiptNumber`) — never a mutation
 * of the original receipt, which keeps its own number
 * (`receipts_payment_id_key`'s old plain `UNIQUE (payment_id)` is replaced
 * by a partial index scoped to `kind = 'payment'`, since a void receipt
 * legitimately shares its `payment_id` with the original it reverses). The
 * original's "now flagged voided" status (BEH-ZS-179) is read by joining to
 * `payments.status`, not a column mutated here — `receipts` still has
 * `UPDATE` revoked from `zschool_service` (migration 0018), so there is no
 * column on `receipts` itself this migration could flip even if it wanted
 * to.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE payment_voids (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      payment_id uuid NOT NULL UNIQUE REFERENCES payments (id),
      reason text NOT NULL,
      void_date date NOT NULL,
      requested_by_subject_id text NOT NULL,
      status text NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'finalized')),
      approved_by_subject_id text,
      approved_at timestamptz,
      finalized_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
  `
  yield* applyTenantIsolation(sql, "payment_voids")

  yield* sql`
    CREATE TABLE void_approval_policies (
      school_id uuid PRIMARY KEY REFERENCES schools (id),
      amount_threshold_mad numeric CHECK (amount_threshold_mad IS NULL OR amount_threshold_mad >= 0),
      created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
  `
  yield* applyTenantIsolation(sql, "void_approval_policies")

  yield* sql`ALTER TABLE receipts ADD COLUMN kind text NOT NULL DEFAULT 'payment' CHECK (kind IN ('payment', 'void'))`
  yield* sql`ALTER TABLE receipts ADD COLUMN void_id uuid REFERENCES payment_voids (id)`
  yield* sql`
    ALTER TABLE receipts ADD CONSTRAINT receipts_kind_void_id_check CHECK (
      (kind = 'payment' AND void_id IS NULL) OR (kind = 'void' AND void_id IS NOT NULL)
    )
  `
  yield* sql`ALTER TABLE receipts DROP CONSTRAINT receipts_payment_id_key`
  yield* sql`CREATE UNIQUE INDEX receipts_payment_id_payment_kind_idx ON receipts (payment_id) WHERE kind = 'payment'`
  yield* sql`CREATE UNIQUE INDEX receipts_void_id_idx ON receipts (void_id) WHERE kind = 'void'`
})
