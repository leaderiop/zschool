import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #96 (roll-call core, wayfinder ticket #81): the append-only
 * `roll_call_submissions` ledger, the materialized `attendance_records`
 * projection, and `roll_call_discrepancies` for the "second submission for
 * an already-confirmed key" conflict case.
 *
 * A submission's key is either `session_id` (per-course mode, ADR-ZS-045) or
 * `(class_id, date, half_day)` (half-day mode) — never both, enforced by the
 * `CHECK` below. `key` is a plain application-supplied column (not
 * `GENERATED`: Postgres's built-in `date`-to-`text` cast is `STABLE`, not
 * `IMMUTABLE` — it depends on the session's `DateStyle` — so a `GENERATED
 * ALWAYS` expression referencing `date::text` is rejected outright,
 * "generation expression is not immutable") on both `roll_call_submissions`
 * and `attendance_records`, computed identically by `RollCall.ts`'s
 * `sessionKey`/`halfDayKey` (`'session:' || id` or
 * `'halfday:' || class_id || ':' || date || ':' || half_day`) so every query
 * reads and writes one indexed value instead of branching on which mode a
 * row is in.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE roll_call_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      session_id uuid REFERENCES sessions (id),
      class_id uuid REFERENCES classes (id),
      date date,
      half_day text CHECK (half_day IN ('morning', 'afternoon')),
      key text NOT NULL,
      student_enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      status text NOT NULL CHECK (status IN ('present', 'absent', 'tardy', 'exclusion')),
      author_person_id uuid NOT NULL REFERENCES persons (id),
      submitted_at timestamptz NOT NULL DEFAULT now(),
      superseded_by_id uuid REFERENCES roll_call_submissions (id),
      CHECK (
        (session_id IS NOT NULL AND class_id IS NULL AND date IS NULL AND half_day IS NULL)
        OR (session_id IS NULL AND class_id IS NOT NULL AND date IS NOT NULL AND half_day IS NOT NULL)
      )
    )
  `
  yield* sql`CREATE INDEX roll_call_submissions_key_student_idx ON roll_call_submissions (key, student_enrollment_id)`
  yield* applyTenantIsolation(sql, "roll_call_submissions")

  yield* sql`
    CREATE TABLE attendance_records (
      key text NOT NULL,
      student_enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      school_id uuid NOT NULL REFERENCES schools (id),
      status text NOT NULL CHECK (status IN ('present', 'absent', 'tardy', 'exclusion')),
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (key, student_enrollment_id)
    )
  `
  yield* applyTenantIsolation(sql, "attendance_records")

  yield* sql`
    CREATE TABLE roll_call_discrepancies (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      key text NOT NULL,
      student_enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      opened_at timestamptz NOT NULL DEFAULT now(),
      resolved_at timestamptz
    )
  `
  yield* sql`
    CREATE UNIQUE INDEX roll_call_discrepancies_open_key
      ON roll_call_discrepancies (key, student_enrollment_id) WHERE resolved_at IS NULL
  `
  yield* applyTenantIsolation(sql, "roll_call_discrepancies")
})
