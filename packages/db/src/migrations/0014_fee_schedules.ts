import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #55 (Finance capability #54): `fee_schedules` and `fee_items`
 * (`BEH-ZS-151`). Scoped to one `(school, academic_year, level, track)`
 * tuple, matching every other academic-structure entity's per-year-snapshot
 * treatment (`ADR-ZS-105`) — cloning a schedule to year N+1 is a later
 * ticket (same deferral `ADR-ZS-105`/ticket #1 already made for
 * `BEH-ZS-057`).
 *
 * `track_id` is nullable (a level with no tracks still needs a schedule), so
 * a plain `UNIQUE` never fires for an untracked level (every NULL is
 * distinct from every other NULL) — split into two partial unique indexes,
 * the same fix migration 0001 already used for `subject_level_configs`.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE fee_schedules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      level_id uuid NOT NULL REFERENCES levels (id),
      track_id uuid REFERENCES tracks (id),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* sql`
    CREATE UNIQUE INDEX fee_schedules_untracked_key
      ON fee_schedules (school_id, academic_year_id, level_id) WHERE track_id IS NULL
  `
  yield* sql`
    CREATE UNIQUE INDEX fee_schedules_tracked_key
      ON fee_schedules (school_id, academic_year_id, level_id, track_id) WHERE track_id IS NOT NULL
  `
  yield* applyTenantIsolation(sql, "fee_schedules")

  // `school_id` is denormalized onto `fee_items` (rather than joined through
  // `fee_schedule_id` every time) purely so `applyTenantIsolation`'s standard
  // `tenant_isolation` policy — which always reads `school_id` directly off
  // the table it's applied to — works unchanged here too, the same
  // denormalization `marks`/`assessments` (migration 0012) already use for
  // the identical reason.
  yield* sql`
    CREATE TABLE fee_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      fee_schedule_id uuid NOT NULL REFERENCES fee_schedules (id),
      nature text NOT NULL CHECK (
        nature IN (
          'registration', 're_enrollment', 'tuition', 'insurance', 'transport',
          'canteen', 'activities', 'supplies', 'textbooks', 'uniform'
        )
      ),
      label_fr text NOT NULL,
      label_ar text NOT NULL,
      frequency text NOT NULL CHECK (frequency IN ('one_time', 'monthly', 'quarterly', 'annual')),
      amount_mad numeric NOT NULL CHECK (amount_mad >= 0),
      is_mandatory boolean NOT NULL DEFAULT false,
      -- BEH-ZS-151: marking a books/supplies/uniform line mandatory triggers
      -- a Law 59.21 forced-sale alert and requires a traced justification --
      -- enforced at the domain layer (FeeSchedule.ts's addFeeItem) with
      -- this CHECK as the defense-in-depth backstop (ADR-ZS-092's pattern),
      -- not the primary gate.
      mandatory_justification text,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT mandatory_line_requires_justification CHECK (
        NOT (is_mandatory AND nature IN ('supplies', 'textbooks', 'uniform'))
        OR mandatory_justification IS NOT NULL
      )
    )
  `
  yield* applyTenantIsolation(sql, "fee_items")
})
