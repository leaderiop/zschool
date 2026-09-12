import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #14 (ADR-ZS-016/111): the minimal `SchoolMembership` slice needed to
 * unblock teacher import — invited-only, `role` restricted to `'teacher'`
 * since import is the only writer that exists yet (other roles/contract
 * types, permissions, and the accept flow itself are BEH-ZS-007's own future
 * scope, not this ticket's).
 *
 * `school_memberships` carries its own `school_id` (unlike `teacher_profiles`,
 * a global facet), so it uses the standard `applyTenantIsolation`, not
 * `applyPersonScopedIsolation`.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE school_memberships (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      person_id uuid NOT NULL REFERENCES persons (id),
      role text NOT NULL CHECK (role IN ('teacher')),
      status text NOT NULL CHECK (status IN ('invited', 'active', 'suspended', 'ended')) DEFAULT 'invited',
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (school_id, person_id, role)
    )
  `
  yield* applyTenantIsolation(sql, "school_memberships")

  // `persons`' own SELECT policy (migration 0008) only had an
  // enrollment/guardian-relationship branch — deliberately, per that
  // migration's own comment, since `school_memberships` didn't exist yet.
  // Adding the missing branch here (ADR-ZS-107, extended per ticket #14) is
  // what actually makes a bulk-imported teacher's `Person`/`TeacherProfile`
  // visible to the school that imported them; `teacher_profiles`' own
  // `person_scoped_select` policy (migration 0008) already delegates to this
  // one via its `EXISTS (SELECT 1 FROM persons ...)` check, so it needs no
  // change of its own.
  yield* sql`DROP POLICY person_select ON persons`
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
        OR EXISTS (
          SELECT 1 FROM school_memberships sm
          WHERE sm.person_id = persons.id
            AND sm.school_id = current_setting('app.current_school_id', true)::uuid
        )
      )
  `
})
