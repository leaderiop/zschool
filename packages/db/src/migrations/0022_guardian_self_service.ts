import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * Ticket #65 (Finance capability #54): a financial guardian's self-service
 * view spans every school they have a financial relationship in, unlike
 * every other Finance module (all staff-facing, scoped to one `schoolId` via
 * `withSchool`). `find_financial_accounts_for_guardian` is the narrow,
 * `SECURITY DEFINER` cross-tenant lookup that makes that possible — same
 * precedent as `find_guardian_by_mobile`/`find_person_matches` (migration
 * 0008, ADR-ZS-050/108): it bypasses `financial_accounts`'/
 * `financial_guardian_designations`'/`financial_account_payers`' own RLS
 * (which would otherwise hide every account outside the caller's current
 * school) but returns ONLY the (school_id, financial_account_id,
 * enrollment_id) triples a guardian has a real financial relationship to —
 * never a full row, never another table. `GuardianSelfService.ts` uses this
 * solely to discover WHICH schools to then query normally (each under its
 * own `withSchool`, respecting RLS as usual for the actual data).
 *
 * A guardian counts as having a financial relationship to an account either
 * as its CURRENT designated financial guardian (the most recent
 * `financial_guardian_designations` row, mirroring
 * `FinancialAccount.ts#findCurrentFinancialGuardian`'s own "latest row wins"
 * read) or as a payer in its multi-payer split
 * (`financial_account_payers`) — the same two-way "who owes this" check
 * `UnpaidBalances.ts`'s own guardian filter already applies.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE FUNCTION find_financial_accounts_for_guardian(p_guardian_person_id uuid)
    RETURNS TABLE (school_id uuid, financial_account_id uuid, enrollment_id uuid)
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT DISTINCT fa.school_id, fa.id AS financial_account_id, fa.enrollment_id
      FROM financial_accounts fa
      WHERE EXISTS (
        SELECT 1 FROM (
          SELECT DISTINCT ON (financial_account_id) financial_account_id, guardian_person_id
          FROM financial_guardian_designations
          ORDER BY financial_account_id, created_at DESC
        ) current_guardian
        WHERE current_guardian.financial_account_id = fa.id
          AND current_guardian.guardian_person_id = p_guardian_person_id
      )
      OR EXISTS (
        SELECT 1 FROM financial_account_payers fap
        WHERE fap.financial_account_id = fa.id AND fap.guardian_person_id = p_guardian_person_id
      )
    $$
  `
  yield* sql`REVOKE ALL ON FUNCTION find_financial_accounts_for_guardian FROM PUBLIC`
  yield* sql`GRANT EXECUTE ON FUNCTION find_financial_accounts_for_guardian TO zschool_service`
})
