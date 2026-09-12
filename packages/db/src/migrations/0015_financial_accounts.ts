import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #56 (Finance capability #54): `financial_accounts` (BEH-ZS-172/173),
 * `financial_guardian_designations` (the append-only trace of who has been
 * designated an enrollment's financial guardian, per ticket #56's own
 * acceptance criteria), and `financial_account_payers` (a multi-payer split).
 *
 * `parent_student_relationships.relationship_type` widens to add
 * 'third_party_payer' (ADR-ZS-055) — a relationship carrying ONLY the
 * financial-guardian quality, enforced by the new
 * `third_party_payer_financial_only` CHECK below, the same "widen a CHECK,
 * enforce the new variant's shape with a second CHECK" technique migration
 * 0013 used for `enrollments.status`/`'completed'`.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`ALTER TABLE parent_student_relationships DROP CONSTRAINT parent_student_relationships_relationship_type_check`
  yield* sql`
    ALTER TABLE parent_student_relationships ADD CONSTRAINT parent_student_relationships_relationship_type_check
      CHECK (relationship_type IN ('mother', 'father', 'guardian', 'other', 'third_party_payer'))
  `
  yield* sql`
    ALTER TABLE parent_student_relationships ADD CONSTRAINT third_party_payer_financial_only CHECK (
      relationship_type != 'third_party_payer'
      OR (
        is_financial_guardian
        AND NOT is_legal_guardian AND NOT is_custodial_guardian
        AND NOT is_emergency_contact AND NOT is_authorized_for_pickup
      )
    )
  `

  yield* sql`
    CREATE TABLE financial_accounts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      enrollment_id uuid NOT NULL UNIQUE REFERENCES enrollments (id),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* applyTenantIsolation(sql, "financial_accounts")

  // Insert-only: "the current financial guardian" is the most recent row for
  // an account, never an updated pointer field — the same append-only-log
  // shape as `structure_audit_log` (migration 0003), chosen here so
  // "designated and later changed, with the change traced" (ticket #56) is
  // satisfied by the table's own shape rather than a separate audit log
  // alongside a mutable "current" column.
  // `clock_timestamp()`, not `now()`: two designations inserted in the same
  // transaction (as a re-designation often is) would otherwise get the
  // SAME `created_at` — Postgres evaluates `now()` once per transaction, not
  // per statement — making "most recent" ambiguous. `clock_timestamp()`
  // reads the actual wall clock at each call, advancing between statements
  // even inside one transaction, with no new sequence (and matching GRANT,
  // which nothing in this schema has set up — every other table's default
  // uses a plain function call, `gen_random_uuid()`, for the same reason).
  yield* sql`
    CREATE TABLE financial_guardian_designations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      financial_account_id uuid NOT NULL REFERENCES financial_accounts (id),
      guardian_person_id uuid NOT NULL REFERENCES persons (id),
      actor_subject_id text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
  `
  yield* sql`
    CREATE INDEX financial_guardian_designations_account_idx
      ON financial_guardian_designations (financial_account_id, created_at DESC)
  `
  yield* applyTenantIsolation(sql, "financial_guardian_designations")

  // The account's current payer split (BEH-ZS-172) — replaced wholesale on
  // each change (`FinancialAccount.ts`'s `splitFinancialResponsibility`),
  // not itself an append-only history: each row's own `created_at` already
  // dates "the current arrangement," and `financial_guardian_designations`
  // above is the dedicated trace for the single-financial-guardian case.
  yield* sql`
    CREATE TABLE financial_account_payers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      financial_account_id uuid NOT NULL REFERENCES financial_accounts (id),
      guardian_person_id uuid NOT NULL REFERENCES persons (id),
      split_type text NOT NULL CHECK (split_type IN ('percentage', 'fixed_amount')),
      split_value numeric NOT NULL CHECK (split_value > 0),
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (financial_account_id, guardian_person_id)
    )
  `
  yield* applyTenantIsolation(sql, "financial_account_payers")
})
