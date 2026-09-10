import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * BEH-ZS-052 (REQ-ZS-054): `Class` under a `Level`/`Track`, `Group` under a
 * `Class`, and a small structure-change audit log (rename logging, ticket
 * #3's own acceptance criteria — not `@qadi/audit`, which audits
 * authorization decisions, a different concern). `entity_type` also allows
 * `subject`/`subject_level_config` ahead of any code actually writing those
 * rows (ticket #4 doesn't audit subject-level-config changes) so a later
 * ticket can without a migration to widen this constraint first.
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
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (level_id, label)
    )
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
      entity_type text NOT NULL CHECK (entity_type IN ('cycle', 'level', 'track', 'class', 'subject', 'subject_level_config')),
      entity_id uuid NOT NULL,
      action text NOT NULL CHECK (action IN ('renamed', 'deactivated', 'reactivated', 'deleted')),
      old_value jsonb,
      new_value jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* applyTenantIsolation(sql, "structure_audit_log")
})
