import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #59 (Finance capability #54): payment collection, allocation and
 * receipts (`BEH-ZS-157/160/163/167/180`).
 *
 * `payments` carries the fields BEH-ZS-160 requires (method, amount, value
 * date, reference, collector) plus its own confirmation sub-state, DEFAULT
 * `'pending_confirmation'` (same `Model.GeneratedByDb`-at-insert,
 * raw-`UPDATE`-to-transition shape `installments.status` already
 * established): `Payment.ts`'s `recordPayment` immediately transitions
 * `cash`/`cheque` to `'confirmed'` in the same transaction as the insert
 * (their balance effect is immediate), while a `bank_transfer` stays
 * `pending_confirmation` — no `payment_allocations`/`receipts`/credit rows
 * exist for it — until a human reconciles it (`confirmPayment`), `BEH-ZS-163`'s
 * "affects no balance until a human validates it". `'voided'` is reserved in
 * the CHECK now for ticket #60 (void/reversing entries) even though nothing
 * in this ticket ever writes it, the same "leave the column extensible"
 * reasoning `installments.status` already applied to `'overdue'` before any
 * command transitioned to it.
 *
 * `payment_allocations` is CURRENT STATE, not a log — one row per
 * (payment, installment) — `UNIQUE (payment_id, installment_id)` so a single
 * payment can never double-allocate against the same installment.
 *
 * `receipt_counters` is the single continuous, gapless, per-school sequence
 * BEH-ZS-157 requires: one row per school, advanced by
 * `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` in the SAME transaction
 * that inserts the `receipts` row `Payment.ts`'s `issueReceipt` does — a
 * rolled-back confirmation rolls the counter increment back with it, so no
 * number is ever burned by a failed confirmation. No `serial`/`bigserial`
 * column (no `ALTER DEFAULT PRIVILEGES ... ON SEQUENCES` grant exists in
 * this schema, `financial_guardian_designations`'s migration 0015 already
 * ran into this) — a plain counter row, locked by the `UPDATE`'s own
 * row-level lock, serializes concurrent confirmations for the SAME school
 * without contending with any other school's counter row.
 *
 * `receipts` is insert-only, `UNIQUE (school_id, receipt_number)` and
 * `UNIQUE (payment_id)` (one receipt per confirmed payment) — ticket #60's
 * void receipt is expected to be a SECOND row referencing this one, never an
 * edit to it (`BEH-ZS-167`: "an erroneous receipt MUST be voided ..., never
 * edited").
 *
 * `financial_account_credits` is the append-only trace of a payment surplus
 * becoming a credit (BEH-ZS-160) — summed by `Payment.ts`'s
 * `findAccountCreditBalance` rather than maintained as a mutable balance
 * column, the same "query directly, no separate materialized reporting
 * entity" reasoning `Enrollment.ts`'s `hasEnrollments` already uses.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE payments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      method text NOT NULL CHECK (method IN ('cash', 'cheque', 'bank_transfer')),
      amount_mad numeric NOT NULL CHECK (amount_mad > 0),
      value_date date NOT NULL,
      reference text,
      collector_subject_id text NOT NULL,
      status text NOT NULL DEFAULT 'pending_confirmation'
        CHECK (status IN ('pending_confirmation', 'confirmed', 'voided')),
      confirmed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
  `
  yield* applyTenantIsolation(sql, "payments")

  yield* sql`
    CREATE TABLE payment_allocations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      payment_id uuid NOT NULL REFERENCES payments (id),
      installment_id uuid NOT NULL REFERENCES installments (id),
      amount_mad numeric NOT NULL CHECK (amount_mad > 0),
      created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      UNIQUE (payment_id, installment_id)
    )
  `
  yield* sql`CREATE INDEX payment_allocations_installment_idx ON payment_allocations (installment_id)`
  yield* applyTenantIsolation(sql, "payment_allocations")

  yield* sql`
    CREATE TABLE receipt_counters (
      school_id uuid PRIMARY KEY REFERENCES schools (id),
      next_number int NOT NULL DEFAULT 1
    )
  `
  yield* applyTenantIsolation(sql, "receipt_counters")

  yield* sql`
    CREATE TABLE receipts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      payment_id uuid NOT NULL UNIQUE REFERENCES payments (id),
      receipt_number text NOT NULL,
      issued_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      UNIQUE (school_id, receipt_number)
    )
  `
  yield* applyTenantIsolation(sql, "receipts")
  // BEH-ZS-157: "no numbered receipt can be deleted [or edited]" — a genuine
  // DB-level control, not just an omission of a delete/update path from this
  // ticket's own domain module. Migration 0007's blanket
  // `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES` otherwise leaves
  // `zschool_service` able to mutate/delete any row; `receipts` is the first
  // table in this schema narrow enough (genuinely insert-only, forever) to
  // need its own tighter grant.
  yield* sql`REVOKE UPDATE, DELETE ON receipts FROM zschool_service`

  yield* sql`
    CREATE TABLE financial_account_credits (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      financial_account_id uuid NOT NULL REFERENCES financial_accounts (id),
      amount_mad numeric NOT NULL CHECK (amount_mad > 0),
      source_payment_id uuid NOT NULL REFERENCES payments (id),
      created_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
  `
  yield* sql`CREATE INDEX financial_account_credits_account_idx ON financial_account_credits (financial_account_id)`
  yield* applyTenantIsolation(sql, "financial_account_credits")
})
