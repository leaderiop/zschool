import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * BEH-ZS-055 (REQ-ZS-057): certifying-exam weightings per level, versioned —
 * "a change creates a dated version for the year, with the previous one
 * still viewable" (fr-ped-05). `is_current` plus a partial unique index is
 * the "current version" pointer; every prior version stays in the table,
 * `is_current = false`, queryable by `effective_from`.
 *
 * `grading_scales` itself already exists (migration 0001) — this ticket
 * only adds an update path for it (`GradingScales.ts`), no schema change.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE computation_rules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      level_id uuid NOT NULL REFERENCES levels (id),
      weight_continuous numeric NOT NULL,
      weight_exam_1 numeric NOT NULL,
      weight_exam_2 numeric NOT NULL,
      reference_text text NOT NULL,
      is_current boolean NOT NULL DEFAULT true,
      effective_from timestamptz NOT NULL DEFAULT now(),
      CHECK (weight_continuous + weight_exam_1 + weight_exam_2 = 100)
    )
  `
  yield* sql`
    CREATE UNIQUE INDEX computation_rules_current_key ON computation_rules (level_id) WHERE is_current
  `
  yield* applyTenantIsolation(sql, "computation_rules")
})
