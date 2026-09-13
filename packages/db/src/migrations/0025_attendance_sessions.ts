import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #95 (Attendance Session/Slot domain, wayfinder ticket #81,
 * ADR-ZS-045/046): `slots` is a plain per-school (optionally per-cycle)
 * catalog — no timetable, no conflict-checking, per ADR-ZS-045's own MVP
 * scope. `sessions` is `(course, date, slot)` per ADR-ZS-045, with `status`
 * covering the plain/uncovered/substituted split ADR-ZS-046 adds.
 *
 * `slots`' ordering uniqueness splits into two partial indexes, the same
 * "NULL isn't equal to NULL for a plain UNIQUE" fix `subject_level_configs`
 * (migration 0001) and `courses` (migration 0006) already apply to their own
 * nullable scoping column.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE slots (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      cycle_id uuid REFERENCES cycles (id),
      label text NOT NULL,
      ordinal integer NOT NULL,
      applicable_half_day text NOT NULL CHECK (applicable_half_day IN ('morning', 'afternoon'))
    )
  `
  yield* sql`
    CREATE UNIQUE INDEX slots_cycle_ordinal_key ON slots (school_id, cycle_id, ordinal) WHERE cycle_id IS NOT NULL
  `
  yield* sql`
    CREATE UNIQUE INDEX slots_whole_school_ordinal_key ON slots (school_id, ordinal) WHERE cycle_id IS NULL
  `
  yield* applyTenantIsolation(sql, "slots")

  yield* sql`
    CREATE TABLE sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      course_id uuid NOT NULL REFERENCES courses (id),
      date date NOT NULL,
      slot_id uuid NOT NULL REFERENCES slots (id),
      status text NOT NULL CHECK (status IN ('expected', 'held', 'not_held', 'substituted')) DEFAULT 'expected',
      substitute_teacher_person_id uuid REFERENCES persons (id),
      CHECK (substitute_teacher_person_id IS NULL OR status = 'substituted'),
      UNIQUE (course_id, date, slot_id)
    )
  `
  yield* applyTenantIsolation(sql, "sessions")
})
