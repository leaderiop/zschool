import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #61 (Finance capability #54): cheque lifecycle
 * (`REQ-ZS-140`, `BEH-ZS-162`).
 *
 * A cheque payment now ALWAYS defers confirmation until it actually
 * clears — `Payment.ts`'s `IMMEDIATE_PAYMENT_METHODS` narrows to `'cash'`
 * only; `recordCheque` inserts its `payments` row `'pending_confirmation'`,
 * exactly like `recordBankTransfer` already does, rather than branching on
 * whether the cheque happens to be post-dated. This is simpler than a
 * date-based branch and strictly satisfies (indeed exceeds) `BEH-ZS-162`'s
 * "a post-dated cheque's covered installments are never marked paid before
 * it actually clears" — no cheque, post-dated or not, is ever marked paid
 * before `clearCheque` runs. A consequence: a cheque that bounces (only
 * reachable from `'deposited'`, never from `'cleared'`) never had any
 * `payment_allocations` to revert in the first place — its installments were
 * never marked paid, so "reverts to unpaid" already holds trivially; nothing
 * here attempts a due-date-based transition into `'overdue'`, the same scope
 * boundary `Payment.ts`'s `refreshInstallmentStatus` already draws for
 * ticket #64 (dunning).
 *
 * `cheques` carries the state machine BEH-ZS-162 requires
 * (`handed_over → deposited → cleared|bounced → regularized|litigation`) plus
 * the cheque-specific fields (number, bank, cheque date, intended
 * `financial_account_ids`) that don't belong on the generic `payments` table.
 * `financial_account_ids` is captured once at `recordCheque` time (staff know
 * upfront which installments a physical cheque is meant to settle) so
 * `clearCheque` needs no separate allocation input — a plain `uuid[]` column,
 * not a join table, since it is read back only as a whole array (the same
 * input shape `Payment.ts`'s own `autoAllocateOldestFirst` already takes) and
 * never queried by individual element.
 *
 * `regularizing_payment_id` traces "both attempts" (`BEH-ZS-162`'s
 * regularization scenario) — the original bounced cheque's `payment_id` stays
 * forever `'pending_confirmation'` (never allocated, never a receipt), while
 * a SEPARATE, ordinary `recordPayment` (cash) is what actually settles the
 * installment and issues a receipt; `regularizeCheque` just links the two.
 *
 * No `CHECK` enforcing "bounce_reason/bounce_notice_reference set iff
 * status = 'bounced'" — the domain layer (`bounceCheque`) is the single
 * writer of those columns and always sets both together, the same
 * "validate in the domain layer, keep migration CHECKs structural" split
 * this schema already follows elsewhere.
 *
 * `bounced_by_subject_id`/`regularized_by_subject_id`/`litigation_by_subject_id`
 * trace the author of each human-initiated transition (`BEH-ZS-162`: "the
 * incident is logged with the author of the entry"), the same
 * `CurrentSubject`-captured-at-write shape `recorded_by_subject_id`/
 * `payment_voids.requested_by_subject_id` already establish.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE cheques (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      payment_id uuid NOT NULL UNIQUE REFERENCES payments (id),
      cheque_number text NOT NULL,
      bank text NOT NULL,
      cheque_date date NOT NULL,
      -- text[], not uuid[]: the Model.Class repository's typed insert
      -- (chequeRepo.insert) sends this array as text[] with no per-column
      -- cast opportunity (unlike a raw sql tagged query, which can write
      -- ::uuid[] inline) -- these ids are never joined against at the SQL
      -- level anyway, only round-tripped, so text[] avoids the mismatch
      -- with no loss of validation (each element is still schema-validated
      -- as a FinancialAccountId before it ever reaches this column).
      financial_account_ids text[] NOT NULL,
      deposit_batch_reference text,
      status text NOT NULL DEFAULT 'handed_over'
        CHECK (status IN ('handed_over', 'deposited', 'cleared', 'bounced', 'regularized', 'litigation')),
      deposited_at timestamptz,
      cleared_at timestamptz,
      bounce_reason text,
      bounce_notice_reference text,
      bounced_at timestamptz,
      bounced_by_subject_id text,
      regularizing_payment_id uuid REFERENCES payments (id),
      regularized_at timestamptz,
      regularized_by_subject_id text,
      litigation_at timestamptz,
      litigation_by_subject_id text,
      recorded_by_subject_id text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
  `
  yield* applyTenantIsolation(sql, "cheques")
})
