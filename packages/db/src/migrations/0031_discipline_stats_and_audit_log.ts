import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #105 (discipline statistics and audit log, wayfinder ticket #91).
 *
 * `audit_log` is generic across entity types (roll call, justification,
 * incident, sanction, council decision, conduct grade, disciplinary-record
 * access) rather than one table per type — a single shared shape, the same
 * "one generic table, `entity_type` picks the concrete meaning" idiom
 * `AcademicTree.ts`'s `structure_audit_log` already uses for a narrower
 * case.
 *
 * `discipline_stats_by_class_period` is a precomputed rollup (`class_id`,
 * a `YYYY-MM` `period_label`) kept in sync transactionally by
 * `Discipline.ts#reportIncident` — never recomputed by a slow aggregate scan
 * at read time (ticket #105's own acceptance criterion).
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE audit_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      actor_person_id uuid NOT NULL REFERENCES persons (id),
      action text NOT NULL,
      entity_type text NOT NULL,
      entity_id text NOT NULL,
      before_value jsonb,
      after_value jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* sql`CREATE INDEX audit_log_entity_idx ON audit_log (school_id, entity_type, entity_id)`
  yield* applyTenantIsolation(sql, "audit_log")

  yield* sql`
    CREATE TABLE discipline_stats_by_class_period (
      school_id uuid NOT NULL REFERENCES schools (id),
      class_id uuid NOT NULL REFERENCES classes (id),
      period_label text NOT NULL,
      incident_count integer NOT NULL DEFAULT 0,
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (school_id, class_id, period_label)
    )
  `
  yield* applyTenantIsolation(sql, "discipline_stats_by_class_period")
})
