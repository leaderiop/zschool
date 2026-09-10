import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * BEH-ZS-058 (course generation): a `Course` is one (subject, class) or
 * (subject, group) pairing. `groups` gains `subject_level_config_id` since
 * a language/option/lab group must say which subject it's for before a
 * course can be generated for it — migration 0003 didn't need that link.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`ALTER TABLE groups ADD COLUMN subject_level_config_id uuid REFERENCES subject_level_configs (id)`

  yield* sql`
    CREATE TABLE courses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      class_id uuid REFERENCES classes (id),
      group_id uuid REFERENCES groups (id),
      subject_level_config_id uuid NOT NULL REFERENCES subject_level_configs (id),
      is_active boolean NOT NULL DEFAULT true,
      deactivation_reason text,
      created_at timestamptz NOT NULL DEFAULT now(),
      CHECK ((class_id IS NULL) != (group_id IS NULL)),
      CHECK (is_active OR deactivation_reason IS NOT NULL)
    )
  `
  yield* sql`
    CREATE UNIQUE INDEX courses_class_key ON courses (class_id, subject_level_config_id) WHERE class_id IS NOT NULL
  `
  yield* sql`
    CREATE UNIQUE INDEX courses_group_key ON courses (group_id, subject_level_config_id) WHERE group_id IS NOT NULL
  `
  yield* applyTenantIsolation(sql, "courses")
})
