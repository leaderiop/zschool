import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE schools (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `

  yield* sql`
    CREATE TABLE academic_years (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      label text NOT NULL,
      status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (school_id, label)
    )
  `
  yield* applyTenantIsolation(sql, "academic_years")

  yield* sql`
    CREATE TABLE sections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      template text NOT NULL CHECK (template IN ('national', 'french', 'international')),
      name text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* applyTenantIsolation(sql, "sections")

  yield* sql`
    CREATE TABLE cycles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      section_id uuid NOT NULL REFERENCES sections (id),
      code text NOT NULL,
      name text NOT NULL,
      sort_order integer NOT NULL,
      UNIQUE (section_id, code)
    )
  `
  yield* applyTenantIsolation(sql, "cycles")

  yield* sql`
    CREATE TABLE levels (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      cycle_id uuid NOT NULL REFERENCES cycles (id),
      code text NOT NULL,
      name text NOT NULL,
      sort_order integer NOT NULL,
      UNIQUE (cycle_id, code)
    )
  `
  yield* applyTenantIsolation(sql, "levels")

  yield* sql`
    CREATE TABLE tracks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      level_id uuid NOT NULL REFERENCES levels (id),
      code text NOT NULL,
      name text NOT NULL,
      UNIQUE (level_id, code)
    )
  `
  yield* applyTenantIsolation(sql, "tracks")

  yield* sql`
    CREATE TABLE subjects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      section_id uuid NOT NULL REFERENCES sections (id),
      code text NOT NULL,
      name text NOT NULL,
      UNIQUE (section_id, code)
    )
  `
  yield* applyTenantIsolation(sql, "subjects")

  yield* sql`
    CREATE TABLE subject_level_configs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      subject_id uuid NOT NULL REFERENCES subjects (id),
      level_id uuid NOT NULL REFERENCES levels (id),
      track_id uuid REFERENCES tracks (id),
      coefficient numeric NOT NULL,
      teaching_language text NOT NULL,
      is_mandatory boolean NOT NULL DEFAULT true
    )
  `
  // A plain `UNIQUE (subject_id, level_id, track_id)` never fires for an
  // untracked level: Postgres treats every NULL track_id as distinct from
  // every other, so a second configuration for the same (subject, level)
  // would silently insert instead of being refused. Two partial indexes
  // instead, split on whether track_id is present (same fix as `classes`,
  // migration 0003).
  yield* sql`
    CREATE UNIQUE INDEX subject_level_configs_untracked_key
      ON subject_level_configs (subject_id, level_id) WHERE track_id IS NULL
  `
  yield* sql`
    CREATE UNIQUE INDEX subject_level_configs_tracked_key
      ON subject_level_configs (subject_id, level_id, track_id) WHERE track_id IS NOT NULL
  `
  yield* applyTenantIsolation(sql, "subject_level_configs")

  yield* sql`
    CREATE TABLE grading_scales (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      section_id uuid NOT NULL REFERENCES sections (id),
      max_score numeric NOT NULL DEFAULT 20,
      decimals integer NOT NULL DEFAULT 2,
      rounding text NOT NULL DEFAULT 'half_up',
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (section_id)
    )
  `
  yield* applyTenantIsolation(sql, "grading_scales")

  yield* sql`
    CREATE TABLE evaluation_periods (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      section_id uuid NOT NULL REFERENCES sections (id),
      code text NOT NULL,
      name text NOT NULL,
      sequence integer NOT NULL,
      status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'closed')),
      start_date date,
      end_date date,
      UNIQUE (section_id, code)
    )
  `
  yield* applyTenantIsolation(sql, "evaluation_periods")
})
