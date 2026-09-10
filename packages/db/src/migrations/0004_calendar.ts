import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * BEH-ZS-054 (REQ-ZS-056, dated sub-periods) and BEH-ZS-066 (REQ-ZS-064,
 * the annual calendar) — ticket #5. `evaluation_periods` itself already
 * exists (migration 0001); this adds what it doesn't have yet: dated
 * sub-periods within a period, and the preloaded ministry calendar.
 *
 * Every date column here is a plain `date` (no time-of-day, no UTC offset)
 * — the "fixed Africa/Casablanca, permanent UTC+0" requirement has nothing
 * to interpret for a bare calendar date, only for a timestamp, and this
 * schema has none.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE evaluation_sub_periods (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      evaluation_period_id uuid NOT NULL REFERENCES evaluation_periods (id),
      code text NOT NULL,
      name text NOT NULL,
      sub_period_type text NOT NULL CHECK (sub_period_type IN ('exam', 'mock_exam', 'standardized_test')),
      start_date date NOT NULL,
      end_date date NOT NULL,
      UNIQUE (evaluation_period_id, code),
      CHECK (end_date >= start_date)
    )
  `
  yield* applyTenantIsolation(sql, "evaluation_sub_periods")

  yield* sql`
    CREATE TABLE calendar_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      code text NOT NULL,
      name text NOT NULL,
      event_type text NOT NULL CHECK (event_type IN ('holiday', 'break')),
      is_movable boolean NOT NULL DEFAULT false,
      confirmation_status text NOT NULL DEFAULT 'confirmed' CHECK (confirmation_status IN ('confirmed', 'to_confirm')),
      start_date date,
      end_date date,
      UNIQUE (academic_year_id, code),
      CHECK (confirmation_status = 'to_confirm' OR (start_date IS NOT NULL AND end_date IS NOT NULL)),
      CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
    )
  `
  yield* applyTenantIsolation(sql, "calendar_events")
})
