import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #103 (Incident/Sanction domain, wayfinder ticket #88; ADR-ZS-019
 * non-portability, ADR-ZS-057 suspension-vs-sanction authority split): adds
 * `'suspended'` to `enrollments.status` (same drop-and-recreate idiom
 * migration 0013 already used to add `'completed'`), the discipline schema
 * itself, `temporary_exclusions` (the real trigger `RollCall.ts`'s
 * `writeRollCall` — ticket #96's own "stub this read path now, wire the
 * real trigger in ticket 10" — now consults), and `justifications` (no
 * earlier ticket in this map owns Justification storage; ticket #98's own
 * migration comment already flagged this).
 *
 * `incidents`/`sanctions` carry no extra non-portability mechanism beyond
 * ordinary `school_id` RLS scoping (ADR-ZS-019): no cross-school read path
 * exists anywhere in this codebase today, so the constraint holds by there
 * being nothing to violate it — a future student-transfer feature must
 * explicitly exclude these two tables rather than assume it's already safe.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`ALTER TABLE enrollments DROP CONSTRAINT enrollments_status_check`
  yield* sql`
    ALTER TABLE enrollments ADD CONSTRAINT enrollments_status_check
      CHECK (status IN ('pre_enrolled', 'active', 'completed', 'suspended'))
  `

  yield* sql`
    CREATE TABLE discipline_severity_levels (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      label text NOT NULL,
      ordinal integer NOT NULL
    )
  `
  yield* applyTenantIsolation(sql, "discipline_severity_levels")

  yield* sql`
    CREATE TABLE incidents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      student_enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      date date NOT NULL,
      context text NOT NULL,
      severity_level_id uuid NOT NULL REFERENCES discipline_severity_levels (id),
      description text NOT NULL,
      witnesses jsonb NOT NULL DEFAULT '[]',
      author_person_id uuid NOT NULL REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* applyTenantIsolation(sql, "incidents")

  yield* sql`
    CREATE TABLE sanction_types (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      label text NOT NULL,
      is_temporary_expulsion boolean NOT NULL DEFAULT false
    )
  `
  yield* applyTenantIsolation(sql, "sanction_types")

  yield* sql`
    CREATE TABLE sanctions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      incident_id uuid NOT NULL REFERENCES incidents (id),
      sanction_type_id uuid NOT NULL REFERENCES sanction_types (id),
      duration_days integer,
      decision text NOT NULL,
      execution_status text NOT NULL CHECK (execution_status IN ('in_progress', 'carried_out', 'lifted')) DEFAULT 'in_progress',
      decided_by_person_id uuid NOT NULL REFERENCES persons (id),
      decided_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* applyTenantIsolation(sql, "sanctions")

  yield* sql`
    CREATE TABLE temporary_exclusions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      sanction_id uuid NOT NULL REFERENCES sanctions (id),
      student_enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      start_date date NOT NULL,
      end_date date NOT NULL,
      CHECK (end_date >= start_date)
    )
  `
  yield* sql`
    CREATE INDEX temporary_exclusions_student_range_idx
      ON temporary_exclusions (student_enrollment_id, start_date, end_date)
  `
  yield* applyTenantIsolation(sql, "temporary_exclusions")

  yield* sql`
    CREATE TABLE suspension_proposals (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      student_enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      sanction_id uuid REFERENCES sanctions (id),
      reason text NOT NULL,
      status text NOT NULL CHECK (status IN ('pending', 'approved', 'dismissed')) DEFAULT 'pending',
      proposed_by_person_id uuid NOT NULL REFERENCES persons (id),
      decided_by_person_id uuid REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now(),
      decided_at timestamptz
    )
  `
  yield* applyTenantIsolation(sql, "suspension_proposals")

  yield* sql`
    CREATE TABLE justification_reason_codes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      label text NOT NULL
    )
  `
  yield* applyTenantIsolation(sql, "justification_reason_codes")

  yield* sql`
    CREATE TABLE justifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      student_enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      key text NOT NULL,
      reason_code_id uuid NOT NULL REFERENCES justification_reason_codes (id),
      comment text,
      attachment_id uuid REFERENCES attachments (id),
      status text NOT NULL CHECK (status IN ('submitted', 'validated', 'refused')) DEFAULT 'submitted',
      refusal_reason text,
      submitted_by_person_id uuid NOT NULL REFERENCES persons (id),
      decided_by_person_id uuid REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now(),
      decided_at timestamptz
    )
  `
  yield* sql`CREATE INDEX justifications_pending_idx ON justifications (school_id) WHERE status = 'submitted'`
  yield* applyTenantIsolation(sql, "justifications")
})
