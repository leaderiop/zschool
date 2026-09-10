import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/** Enables RLS on `table` and installs the standard `tenant_isolation` policy every school-scoped table in this schema carries (ADR-ZS-092). Shared here so a future migration copying this block can't drop `FORCE` or typo the GUC name without the type system/reuse making that obvious — migration 0001 predates this helper and keeps its original hand-written form since it's already applied. */
const applyTenantIsolation = (sql: SqlClient, table: string) =>
  Effect.gen(function*() {
    yield* sql`ALTER TABLE ${sql(table)} ENABLE ROW LEVEL SECURITY`
    yield* sql`ALTER TABLE ${sql(table)} FORCE ROW LEVEL SECURITY`
    yield* sql`
      CREATE POLICY tenant_isolation ON ${sql(table)}
        USING (school_id = current_setting('app.current_school_id', true)::uuid)
    `
  })

/**
 * BEH-ZS-052 (REQ-ZS-054): `Class` under a `Level`/`Track`, `Group` under a
 * `Class`, and a small structure-change audit log (rename logging, ticket
 * #3's own acceptance criteria — not `@qadi/audit`, which audits
 * authorization decisions, a different concern).
 *
 * `migration 0002`'s `ALTER DEFAULT PRIVILEGES` already covers these new
 * tables for `zschool_app` — no additional GRANT needed here.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE classes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      level_id uuid NOT NULL REFERENCES levels (id),
      track_id uuid REFERENCES tracks (id),
      label text NOT NULL,
      capacity integer NOT NULL CHECK (capacity > 0),
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  // A plain `UNIQUE (level_id, track_id, label)` never fires for an
  // untracked level: Postgres treats every NULL track_id as distinct from
  // every other, so two classes named "2AC-1" under the same trackless
  // level would silently both insert. Two partial indexes instead, split on
  // whether track_id is present.
  yield* sql`
    CREATE UNIQUE INDEX classes_level_label_untracked_key ON classes (level_id, label) WHERE track_id IS NULL
  `
  yield* sql`
    CREATE UNIQUE INDEX classes_level_track_label_key ON classes (level_id, track_id, label) WHERE track_id IS NOT NULL
  `
  yield* applyTenantIsolation(sql, "classes")

  yield* sql`
    CREATE TABLE groups (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      class_id uuid NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
      code text NOT NULL,
      name text NOT NULL,
      group_type text NOT NULL CHECK (group_type IN ('language', 'option', 'lab')),
      UNIQUE (class_id, code)
    )
  `
  yield* applyTenantIsolation(sql, "groups")

  yield* sql`
    CREATE TABLE structure_audit_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      actor_subject_id text NOT NULL,
      entity_type text NOT NULL CHECK (entity_type IN ('cycle', 'level', 'track', 'class')),
      entity_id uuid NOT NULL,
      action text NOT NULL CHECK (action IN ('renamed', 'deactivated', 'reactivated', 'deleted')),
      old_value jsonb,
      new_value jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* applyTenantIsolation(sql, "structure_audit_log")
})
