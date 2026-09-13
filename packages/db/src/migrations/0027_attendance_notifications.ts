import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #97 (notification outbox and sender infrastructure, wayfinder
 * ticket #82, vendor recommendation #80): the durable outbox
 * `RollCall.ts#writeRollCall` (ticket #96) writes into transactionally,
 * `push_subscriptions` for the push channel, and `delivery_logs` for
 * per-channel delivery confirmation (webhook-driven, ticket #97's own
 * acceptance criteria).
 *
 * `attendance_notification_outbox.corrects_outbox_id` is the "correction
 * notices reference... the original notification" link: a correction row
 * points back at the outbox row whose already-sent notification it's
 * amending, rather than a fresh, unrelated notification.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE attendance_notification_outbox (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      key text NOT NULL,
      student_enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      date date NOT NULL,
      event_type text NOT NULL CHECK (event_type IN ('first_absence_of_day', 'subsequent_absence', 'correction')),
      payload jsonb NOT NULL,
      status text NOT NULL CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'canceled')) DEFAULT 'pending',
      attempt_count integer NOT NULL DEFAULT 0,
      corrects_outbox_id uuid REFERENCES attendance_notification_outbox (id),
      created_at timestamptz NOT NULL DEFAULT now(),
      process_after timestamptz NOT NULL DEFAULT (now() + interval '3 minutes')
    )
  `
  yield* sql`
    CREATE INDEX attendance_notification_outbox_pending_idx
      ON attendance_notification_outbox (process_after) WHERE status = 'pending'
  `
  yield* sql`
    CREATE INDEX attendance_notification_outbox_key_student_idx
      ON attendance_notification_outbox (school_id, key, student_enrollment_id)
  `
  yield* applyTenantIsolation(sql, "attendance_notification_outbox")

  yield* sql`
    CREATE TABLE delivery_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      outbox_id uuid NOT NULL REFERENCES attendance_notification_outbox (id),
      channel text NOT NULL CHECK (channel IN ('in_app', 'sms', 'whatsapp', 'push')),
      status text NOT NULL CHECK (status IN ('sent', 'delivered', 'failed')) DEFAULT 'sent',
      provider_message_id text,
      sent_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
  yield* applyTenantIsolation(sql, "delivery_logs")

  yield* sql`
    CREATE TABLE push_subscriptions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      person_id uuid NOT NULL REFERENCES persons (id),
      expo_push_token text NOT NULL,
      device_info text,
      registered_at timestamptz NOT NULL DEFAULT now(),
      revoked_at timestamptz
    )
  `
  yield* sql`
    CREATE UNIQUE INDEX push_subscriptions_active_token_key
      ON push_subscriptions (person_id, expo_push_token) WHERE revoked_at IS NULL
  `
  yield* applyTenantIsolation(sql, "push_subscriptions")
})
