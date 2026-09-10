import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

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
  yield* sql`ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE academic_years FORCE ROW LEVEL SECURITY`
  yield* sql`
    CREATE POLICY tenant_isolation ON academic_years
      USING (school_id = current_setting('app.current_school_id', true)::uuid)
  `

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
  yield* sql`ALTER TABLE sections ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE sections FORCE ROW LEVEL SECURITY`
  yield* sql`
    CREATE POLICY tenant_isolation ON sections
      USING (school_id = current_setting('app.current_school_id', true)::uuid)
  `

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
  yield* sql`ALTER TABLE cycles ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE cycles FORCE ROW LEVEL SECURITY`
  yield* sql`
    CREATE POLICY tenant_isolation ON cycles
      USING (school_id = current_setting('app.current_school_id', true)::uuid)
  `

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
  yield* sql`ALTER TABLE levels ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE levels FORCE ROW LEVEL SECURITY`
  yield* sql`
    CREATE POLICY tenant_isolation ON levels
      USING (school_id = current_setting('app.current_school_id', true)::uuid)
  `

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
  yield* sql`ALTER TABLE tracks ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE tracks FORCE ROW LEVEL SECURITY`
  yield* sql`
    CREATE POLICY tenant_isolation ON tracks
      USING (school_id = current_setting('app.current_school_id', true)::uuid)
  `

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
  yield* sql`ALTER TABLE subjects ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE subjects FORCE ROW LEVEL SECURITY`
  yield* sql`
    CREATE POLICY tenant_isolation ON subjects
      USING (school_id = current_setting('app.current_school_id', true)::uuid)
  `

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
      is_mandatory boolean NOT NULL DEFAULT true,
      UNIQUE (subject_id, level_id, track_id)
    )
  `
  yield* sql`ALTER TABLE subject_level_configs ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE subject_level_configs FORCE ROW LEVEL SECURITY`
  yield* sql`
    CREATE POLICY tenant_isolation ON subject_level_configs
      USING (school_id = current_setting('app.current_school_id', true)::uuid)
  `

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
  yield* sql`ALTER TABLE grading_scales ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE grading_scales FORCE ROW LEVEL SECURITY`
  yield* sql`
    CREATE POLICY tenant_isolation ON grading_scales
      USING (school_id = current_setting('app.current_school_id', true)::uuid)
  `

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
  yield* sql`ALTER TABLE evaluation_periods ENABLE ROW LEVEL SECURITY`
  yield* sql`ALTER TABLE evaluation_periods FORCE ROW LEVEL SECURITY`
  yield* sql`
    CREATE POLICY tenant_isolation ON evaluation_periods
      USING (school_id = current_setting('app.current_school_id', true)::uuid)
  `
})
