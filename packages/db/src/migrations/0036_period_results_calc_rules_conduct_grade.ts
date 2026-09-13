import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #110 (EVA: calculation rules, PeriodResult, rank/honors, and
 * rank-exclusion — resolving wayfinder ticket #110, also closing
 * Attendance's own #90).
 *
 * `computation_rules` (migration 0005) widens in place rather than gaining a
 * sibling entity: BEH-ZS-117's lowest-grade exclusion and honors thresholds
 * are per-level configuration exactly like the existing exam weightings, and
 * ride the same `is_current`/`effective_from` versioning `setComputationRule`
 * already implements. `honors_thresholds` is `jsonb` (an ordered array of
 * `{label, min_average}`) since the label set itself varies by cycle
 * (BEH-ZS-119's baccalaureate defaults don't apply verbatim elsewhere) —
 * a fixed column set would force a shape only one cycle actually needs.
 * `unjustified_absence_counts_as_zero` implements BEH-ZS-117(a)'s explicit
 * "counts as 0 by default (configurable: 0 or exclusion)".
 *
 * `evaluation_periods.weight` (nullable, BEH-ZS-119's "period weighting
 * configurable") lives on the period row itself, not a level-keyed map, so
 * it always stays in sync with the period list it weights; null means equal
 * weighting, normalized at computation time.
 *
 * `rank_exclusion_enabled`/`conduct_grade_counts_toward_average` land on
 * `schools` directly — the first per-school policy toggles this codebase has
 * needed (BEH-ZS-102's "configurable... whether to enable the option per
 * school", BEH-ZS-098/OQ-ZS-074's "school parameter").
 *
 * `period_results`/`subject_results`/`year_results` are computed,
 * overwritable projections (`PeriodResult.ts#recomputePeriodResult`), not an
 * append-only log — BEH-ZS-119's "frozen at closing" is #112's job to
 * enforce, not this ticket's. `subject_results.average IS NULL` marks a
 * subject "NG" (BEH-ZS-117(c): no grade at all at closing).
 *
 * `conduct_grades` mirrors `suspension_proposals`' own propose/decide shape
 * (migration 0029) — `proposed`/`validated` status, `proposed_by_person_id`
 * always set, `validated_by_person_id` set only once approved. Its `value`
 * carries the same 0-20 `CHECK` as `marks.value` (migration 0012) as a
 * backstop — `ConductGrade.ts` also checks this before ever reaching SQL, to
 * surface a clean domain error rather than a raw constraint violation.
 *
 * `year_results.excluded_from_rank` (code review finding, not part of the
 * original design) carries a student's rank exclusion forward from any
 * `PeriodResult` averaged into the year — BEH-ZS-102's exclusion is a
 * serious, documented decision, not scoped to a single period only.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`ALTER TABLE computation_rules ADD COLUMN lowest_grade_exclusion_min_count integer`
  yield* sql`ALTER TABLE computation_rules ADD COLUMN honors_thresholds jsonb NOT NULL DEFAULT '[]'::jsonb`
  yield* sql`
    ALTER TABLE computation_rules ADD COLUMN unjustified_absence_counts_as_zero boolean NOT NULL DEFAULT true
  `

  yield* sql`ALTER TABLE evaluation_periods ADD COLUMN weight numeric`

  yield* sql`ALTER TABLE schools ADD COLUMN rank_exclusion_enabled boolean NOT NULL DEFAULT false`
  yield* sql`ALTER TABLE schools ADD COLUMN conduct_grade_counts_toward_average boolean NOT NULL DEFAULT false`

  yield* sql`
    CREATE TABLE period_results (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      evaluation_period_id uuid NOT NULL REFERENCES evaluation_periods (id),
      enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      class_id uuid NOT NULL REFERENCES classes (id),
      overall_average numeric,
      rank integer,
      honors_label text,
      excluded_from_rank boolean NOT NULL DEFAULT false,
      excluded_from_rank_reason text,
      computed_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (evaluation_period_id, enrollment_id)
    )
  `
  yield* applyTenantIsolation(sql, "period_results")

  yield* sql`
    CREATE TABLE subject_results (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      period_result_id uuid NOT NULL REFERENCES period_results (id),
      subject_id uuid NOT NULL REFERENCES subjects (id),
      -- NULL = "NG" (BEH-ZS-117(c): no grade at all at closing).
      average numeric,
      UNIQUE (period_result_id, subject_id)
    )
  `
  yield* applyTenantIsolation(sql, "subject_results")

  yield* sql`
    CREATE TABLE year_results (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      class_id uuid NOT NULL REFERENCES classes (id),
      year_average numeric,
      rank integer,
      honors_label text,
      -- True when excluded_from_rank on ANY PeriodResult averaged into this
      -- year — an exclusion decision stays in force for the annual ranking.
      excluded_from_rank boolean NOT NULL DEFAULT false,
      computed_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (academic_year_id, enrollment_id)
    )
  `
  yield* applyTenantIsolation(sql, "year_results")

  yield* sql`
    CREATE TABLE conduct_grades (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      evaluation_period_id uuid NOT NULL REFERENCES evaluation_periods (id),
      -- Same 0-20 bound as marks.value (migration 0012) — the conduct grade
      -- rides the class's own /20 GradingScale, not a separate scale.
      value numeric NOT NULL CHECK (value >= 0 AND value <= 20),
      status text NOT NULL CHECK (status IN ('proposed', 'validated')) DEFAULT 'proposed',
      proposed_by_person_id uuid NOT NULL REFERENCES persons (id),
      validated_by_person_id uuid REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now(),
      validated_at timestamptz,
      UNIQUE (enrollment_id, evaluation_period_id)
    )
  `
  yield* applyTenantIsolation(sql, "conduct_grades")
})
