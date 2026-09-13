import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * Ticket #12 (ADR-ZS-043): a nullable marker on `financial_accounts`,
 * written once a mid-year financial-history catch-up import row has been
 * successfully applied to that account. `recordPayment`/`recordChequeAtStatus`/
 * `adjustInstallment` have no natural uniqueness that would make calling them
 * twice for the same row harmless (unlike, say, `installments`' own
 * `(financial_account_id, fee_item_id, due_date)` unique index) — without
 * this marker, retrying a partially-failed import batch would double-pay,
 * double-record a cheque, or double-apply a discount. A real school only
 * ever runs this catch-up once per student, so a single per-account marker
 * (rather than per-row tracking in a persisted batch table) is enough.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`ALTER TABLE financial_accounts ADD COLUMN mid_year_catchup_applied_at timestamptz NULL`
})
