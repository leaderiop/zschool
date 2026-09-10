import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyPersonScopedIsolation, applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #9 / issue #13: the minimal Global Identity + Enrollment slice for
 * student and guardian import. `Person` and `ParentStudentRelationship`
 * carry no `school_id` (ADR-ZS-107) — a person belongs to the platform, not
 * a school; a school's visibility into one is derived from an `Enrollment`
 * or relationship, enforced by RLS instead of `applyTenantIsolation`.
 *
 * `TeacherProfile`/`StaffProfile` (ADR-ZS-109) are created here but stay
 * unpopulated — ticket #10's `SchoolMembership` question is still open.
 *
 * Every table is created first, RLS applied second: `persons`' policy reads
 * `enrollments`, and `enrollments.student_person_id` references `persons` —
 * a genuine circular dependency between the two tables' definitions that
 * only resolves by having both exist before either's policy is installed.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE persons (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name text NOT NULL,
      last_name text NOT NULL,
      date_of_birth date NOT NULL,
      massar_code text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  // Platform-wide, when present (INV-ZS-005/006/054) — partial unique index
  // since a plain UNIQUE constraint never fires when massar_code is NULL for
  // two different rows (same NULL-uniqueness pitfall as migration 0001).
  yield* sql`
    CREATE UNIQUE INDEX persons_massar_code_key ON persons (massar_code) WHERE massar_code IS NOT NULL
  `
  yield* sql`CREATE INDEX persons_name_dob_idx ON persons (last_name, first_name, date_of_birth)`

  yield* sql`
    CREATE TABLE student_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      person_id uuid NOT NULL UNIQUE REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `

  yield* sql`
    CREATE TABLE guardian_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      person_id uuid NOT NULL UNIQUE REFERENCES persons (id),
      mobile_number text NOT NULL CHECK (mobile_number ~ '^\\+[1-9]\\d{7,14}$'),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  // ADR-ZS-050: a lookup key for intra-file dedup and existing-account
  // matching, NOT a uniqueness constraint — two guardians could
  // legitimately share a landline.
  yield* sql`CREATE INDEX guardian_profiles_mobile_idx ON guardian_profiles (mobile_number)`

  // ADR-ZS-109: exist for schema completeness; unpopulated until ticket #10.
  yield* sql`
    CREATE TABLE teacher_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      person_id uuid NOT NULL UNIQUE REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `

  yield* sql`
    CREATE TABLE staff_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      person_id uuid NOT NULL UNIQUE REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `

  yield* sql`
    CREATE TABLE parent_student_relationships (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      guardian_person_id uuid NOT NULL REFERENCES persons (id),
      student_person_id uuid NOT NULL REFERENCES persons (id),
      relationship_type text NOT NULL CHECK (relationship_type IN ('mother', 'father', 'guardian', 'other')),
      is_legal_guardian boolean NOT NULL DEFAULT false,
      is_financial_guardian boolean NOT NULL DEFAULT false,
      is_custodial_guardian boolean NOT NULL DEFAULT false,
      is_emergency_contact boolean NOT NULL DEFAULT false,
      is_authorized_for_pickup boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (guardian_person_id, student_person_id)
    )
  `
  yield* sql`CREATE INDEX psr_student_idx ON parent_student_relationships (student_person_id)`
  yield* sql`CREATE INDEX psr_guardian_idx ON parent_student_relationships (guardian_person_id)`

  yield* sql`
    CREATE TABLE enrollments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      -- Denormalized from academic_years.label at insert time. A unique
      -- index can only be an expression on this table's own columns, and
      -- INV-ZS-007/058's "per year" is a calendar year (e.g. "2026-2027"),
      -- not a specific school's academic_years row — two schools each have
      -- their OWN academic_year_id for "the same" year, so keying the
      -- uniqueness check on academic_year_id would only ever catch a
      -- same-school conflict, never the cross-school one the invariant is
      -- actually about.
      academic_year_label text NOT NULL,
      student_person_id uuid NOT NULL REFERENCES persons (id),
      class_id uuid NOT NULL REFERENCES classes (id),
      status text NOT NULL CHECK (status IN ('pre_enrolled', 'active')),
      effective_date date NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  // INV-ZS-007/058: at most one ACTIVE enrollment per (student, year)
  // PLATFORM-WIDE — deliberately no school_id in this key, unlike every
  // other unique index in this schema.
  yield* sql`
    CREATE UNIQUE INDEX enrollments_one_active_per_year
      ON enrollments (student_person_id, academic_year_label) WHERE status = 'active'
  `
  yield* sql`CREATE INDEX enrollments_class_idx ON enrollments (class_id)`
  yield* applyTenantIsolation(sql, "enrollments")

  yield* sql`ALTER TABLE persons ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE persons FORCE ROW LEVEL SECURITY`
  // A person is visible to a school if they're a student enrolled there, or
  // a guardian of a student enrolled there. Deliberately does NOT reference
  // a `SchoolMembership` branch (staff/teacher visibility) — that table
  // doesn't exist yet (ticket #10).
  yield* sql`
    CREATE POLICY person_select ON persons
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM enrollments e
          WHERE e.student_person_id = persons.id
            AND e.school_id = current_setting('app.current_school_id', true)::uuid
        )
        OR EXISTS (
          SELECT 1 FROM parent_student_relationships psr
          JOIN enrollments e ON e.student_person_id = psr.student_person_id
          WHERE psr.guardian_person_id = persons.id
            AND e.school_id = current_setting('app.current_school_id', true)::uuid
        )
      )
  `
  // See applyPersonScopedIsolation's doc comment for why INSERT is
  // unconditional — the same chicken-and-egg reasoning applies here, since
  // `person_select`'s predicate above depends on enrollments/relationships
  // that don't exist yet for a person being created for the first time.
  yield* sql`CREATE POLICY person_insert ON persons FOR INSERT WITH CHECK (true)`

  yield* applyPersonScopedIsolation(sql, "student_profiles")
  yield* applyPersonScopedIsolation(sql, "guardian_profiles")
  yield* applyPersonScopedIsolation(sql, "teacher_profiles")
  yield* applyPersonScopedIsolation(sql, "staff_profiles")

  yield* sql`ALTER TABLE parent_student_relationships ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE parent_student_relationships FORCE ROW LEVEL SECURITY`
  // References `enrollments` only (never `persons`) so this and
  // `person_select` above form a DAG, not a cycle — `persons`' policy
  // queries this table, so this table's policy must not query `persons`
  // back, or every row-visibility check would recurse without end.
  yield* sql`
    CREATE POLICY relationship_select ON parent_student_relationships
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM enrollments e
          WHERE e.student_person_id = parent_student_relationships.student_person_id
            AND e.school_id = current_setting('app.current_school_id', true)::uuid
        )
      )
  `
  yield* sql`
    CREATE POLICY relationship_insert ON parent_student_relationships FOR INSERT WITH CHECK (true)
  `

  // ADR-ZS-108: the only path to a cross-tenant identity match. SECURITY
  // DEFINER runs as the migration owner (neondb_owner), which — unlike
  // zschool_service — is exempt from persons' RLS, so it can see candidates
  // across every school. It can't become a general search tool: the only
  // surface it exposes is the columns in RETURNS TABLE, never a full row and
  // never another table (no enrollment, no school affiliation).
  yield* sql`
    CREATE FUNCTION find_person_matches(
      p_massar_code text,
      p_first_name text,
      p_last_name text,
      p_date_of_birth date
    ) RETURNS TABLE (
      person_id uuid,
      first_name text,
      last_name text,
      date_of_birth date,
      massar_code text,
      match_kind text
    )
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT id, first_name, last_name, date_of_birth, massar_code, 'strong'::text
      FROM persons
      WHERE p_massar_code IS NOT NULL AND massar_code = p_massar_code
      UNION ALL
      SELECT id, first_name, last_name, date_of_birth, massar_code, 'weak'::text
      FROM persons
      -- Excludes only rows already returned by the strong branch above
      -- (massar_code = p_massar_code when a massar code was given). Plain
      -- massar_code IS DISTINCT FROM p_massar_code gets this wrong when
      -- both are NULL: NULL IS DISTINCT FROM NULL is false, which would
      -- silently drop every weak-match candidate that (like most search
      -- inputs) also has no massar code -- exactly the population this
      -- branch exists for.
      WHERE (p_massar_code IS NULL OR massar_code IS DISTINCT FROM p_massar_code)
        AND lower(first_name) = lower(p_first_name)
        AND lower(last_name) = lower(p_last_name)
        AND date_of_birth = p_date_of_birth
    $$
  `
  yield* sql`REVOKE ALL ON FUNCTION find_person_matches FROM PUBLIC`
  yield* sql`GRANT EXECUTE ON FUNCTION find_person_matches TO zschool_service`

  yield* sql`
    CREATE FUNCTION find_guardian_by_mobile(p_mobile_number text)
    RETURNS TABLE (person_id uuid, mobile_number text)
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT gp.person_id, gp.mobile_number
      FROM guardian_profiles gp
      WHERE gp.mobile_number = p_mobile_number
    $$
  `
  yield* sql`REVOKE ALL ON FUNCTION find_guardian_by_mobile FROM PUBLIC`
  yield* sql`GRANT EXECUTE ON FUNCTION find_guardian_by_mobile TO zschool_service`
})
