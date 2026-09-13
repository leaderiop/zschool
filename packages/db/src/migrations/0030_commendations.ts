import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #106 (reward/commendation record, wayfinder ticket #92) —
 * deliberately NOT keyed to `student_enrollment_id` the way `incidents`/
 * `sanctions` are: `student_person_id` directly, since a commendation
 * carries no non-portability restriction (ticket #106's own acceptance
 * criterion) and so has no reason to be scoped to one enrollment period the
 * way disciplinary records are.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE commendations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      student_person_id uuid NOT NULL REFERENCES persons (id),
      category text NOT NULL,
      description text NOT NULL,
      date date NOT NULL,
      author_person_id uuid NOT NULL REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* applyTenantIsolation(sql, "commendations")
})
