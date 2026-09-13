import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #104 (disciplinary council and summons workflow, wayfinder ticket
 * #89). `council_minutes_counters` reuses the exact "single continuous,
 * gapless per-school counter, drawn atomically inside the same transaction
 * as the row it numbers" idiom `Payment.ts`'s `receipt_counters`/
 * `drawNextReceiptNumber` already establishes (BEH-ZS-157) — the number is
 * assigned at LOCK time, not creation, since a draft may still be
 * discarded or heavily rewritten before it represents an official record.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE summonses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      student_enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      summons_type text NOT NULL,
      date date NOT NULL,
      time text NOT NULL,
      purpose text NOT NULL,
      recipients jsonb NOT NULL,
      delivered_channel text CHECK (delivered_channel IN ('in_app', 'sms', 'whatsapp', 'push')),
      read_at timestamptz,
      escalated_at timestamptz,
      issued_by_person_id uuid NOT NULL REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* sql`
    CREATE INDEX summonses_unread_idx ON summonses (school_id, created_at) WHERE read_at IS NULL AND escalated_at IS NULL
  `
  yield* applyTenantIsolation(sql, "summonses")

  yield* sql`
    CREATE TABLE council_minutes_counters (
      school_id uuid PRIMARY KEY REFERENCES schools (id),
      next_number integer NOT NULL DEFAULT 1
    )
  `
  yield* applyTenantIsolation(sql, "council_minutes_counters")

  yield* sql`
    CREATE TABLE disciplinary_councils (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      incident_id uuid REFERENCES incidents (id),
      minutes_number text,
      status text NOT NULL CHECK (status IN ('draft', 'locked')) DEFAULT 'draft',
      members jsonb NOT NULL,
      summoned_guardians jsonb NOT NULL,
      session_file text,
      deliberation text,
      decision text,
      created_by_person_id uuid NOT NULL REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now(),
      locked_at timestamptz
    )
  `
  yield* sql`
    CREATE UNIQUE INDEX disciplinary_councils_school_minutes_number_key
      ON disciplinary_councils (school_id, minutes_number) WHERE minutes_number IS NOT NULL
  `
  yield* applyTenantIsolation(sql, "disciplinary_councils")

  yield* sql`
    CREATE TABLE council_minutes_revisions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      council_id uuid NOT NULL REFERENCES disciplinary_councils (id),
      snapshot jsonb NOT NULL,
      is_post_lock_reopening boolean NOT NULL DEFAULT false,
      revised_by_person_id uuid NOT NULL REFERENCES persons (id),
      revised_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* applyTenantIsolation(sql, "council_minutes_revisions")
})
