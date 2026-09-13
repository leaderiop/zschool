import { withSchool } from "@zschool/db"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { SchoolId } from "./Ids.ts"

export const NotificationChannel = Schema.Literals(["in_app", "sms", "whatsapp", "push"])
export type NotificationChannel = typeof NotificationChannel.Type

export interface ChannelSendResult {
  readonly delivered: boolean
  readonly providerMessageId: string | null
}

/**
 * Ticket #97: the abstraction real vendor calls (360dialog for WhatsApp,
 * Vonage/Infobip for SMS — #80's recommendation) are wired behind, so this
 * ticket's own dispatch/retention/fallback logic can be built and tested
 * now against a stub, before #86 (vendor account provisioning — a real
 * external dependency, not an engineering blocker) completes. Same
 * "domain declares the port, an adapter package provides the concrete
 * implementation" split as `ImportQueue.ts`.
 */
export interface NotificationSender {
  readonly send: (
    channel: NotificationChannel,
    recipientPersonId: string,
    payload: Record<string, unknown>
  ) => Effect.Effect<ChannelSendResult>
}

export const NotificationSender = Context.Service<NotificationSender>("@zschool/domain/NotificationSender")

/** Always "delivers" — proves the dispatch logic below never has to change to swap this for a real vendor-backed layer later (ticket #97's own "sender implementations are swappable" acceptance criterion). */
export const StubNotificationSenderLive = Layer.succeed(NotificationSender, {
  send: () => Effect.succeed({ delivered: true, providerMessageId: null })
})

/**
 * Called from `RollCall.ts#writeRollCall`'s own transaction (via the ambient
 * `SqlClient`, not a fresh connection — same "nested effect shares the open
 * transaction" pattern `Dunning.ts`'s `remainingOwed` uses) whenever a clean
 * (non-conflicting) confirmation records an `absent` status. `first_absence_of_day`
 * vs `subsequent_absence` is decided by whether this student already has an
 * (uncanceled) outbox row for `date` — BEH-ZS-084/105's "first absence of the
 * day" distinction, which decides parallel-vs-sequential dispatch below.
 */
export const recordAbsenceForNotification = Effect.fn("AttendanceNotification.recordAbsenceForNotification")(
  function*(schoolId: string, key: string, studentEnrollmentId: string, date: string) {
    const sql = yield* SqlClient
    const [{ count }] = yield* sql<{ count: string }>`
      SELECT count(*)::int AS count FROM attendance_notification_outbox
      WHERE school_id = ${schoolId} AND student_enrollment_id = ${studentEnrollmentId} AND date = ${date}::date
        AND event_type IN ('first_absence_of_day', 'subsequent_absence') AND status != 'canceled'
    `
    const eventType = Number(count) === 0 ? "first_absence_of_day" : "subsequent_absence"
    yield* sql`
      INSERT INTO attendance_notification_outbox (school_id, key, student_enrollment_id, date, event_type, payload)
      VALUES (${schoolId}, ${key}, ${studentEnrollmentId}, ${date}::date, ${eventType}, ${
      JSON.stringify({ status: "absent" })
    }::jsonb)
    `
  }
)

/**
 * Called from `RollCall.ts#writeRollCall` when a second submission opens a
 * `RollCallDiscrepancy` for a key/student that already has a still-`pending`
 * (not yet processed) outbox row — ticket #97's "a correction cancels the
 * still-pending row with no send." A row already `sending`/`sent` is left
 * alone: it already went out, or is actively going out, and needs a
 * `correction` notice (`recordCorrectionIfAlreadySent` below) instead.
 */
export const cancelPendingOutboxForKey = Effect.fn("AttendanceNotification.cancelPendingOutboxForKey")(function*(
  schoolId: string,
  key: string,
  studentEnrollmentId: string
) {
  const sql = yield* SqlClient
  yield* sql`
    UPDATE attendance_notification_outbox
    SET status = 'canceled'
    WHERE school_id = ${schoolId} AND key = ${key} AND student_enrollment_id = ${studentEnrollmentId} AND status = 'pending'
  `
})

/**
 * Called from `RollCall.ts#arbitrateRollCallDiscrepancy` once a discrepancy
 * resolves: if the original notification for this key/student already went
 * out (`sent`) with a different status than the arbitrated one, queues an
 * immediate (`process_after = now()`) `correction` notice referencing it via
 * `corrects_outbox_id` — ticket #97's "correction notices reference... the
 * original notification's delivery log" (the reference is the FK; a reader
 * follows it to the original's own `delivery_logs` rows rather than this
 * table duplicating them).
 */
export const recordCorrectionIfAlreadySent = Effect.fn("AttendanceNotification.recordCorrectionIfAlreadySent")(
  function*(schoolId: string, key: string, studentEnrollmentId: string, resolvingStatus: string) {
    const sql = yield* SqlClient
    const [original] = yield* sql<{ id: string; payload: { status: string } }>`
      SELECT id, payload FROM attendance_notification_outbox
      WHERE school_id = ${schoolId} AND key = ${key} AND student_enrollment_id = ${studentEnrollmentId}
        AND status = 'sent' AND event_type != 'correction'
      ORDER BY created_at DESC
      LIMIT 1
    `
    if (original === undefined || original.payload.status === resolvingStatus) return

    yield* sql`
      INSERT INTO attendance_notification_outbox
        (school_id, key, student_enrollment_id, date, event_type, payload, corrects_outbox_id, process_after)
      SELECT school_id, key, student_enrollment_id, date, 'correction', ${
      JSON.stringify({ status: resolvingStatus })
    }::jsonb, ${original.id}, now()
      FROM attendance_notification_outbox WHERE id = ${original.id}
    `
  }
)

/**
 * The dispatch loop a scheduling harness (none exists yet — same "wiring one
 * up is out of this ticket's scope" precedent `Dunning.ts`'s
 * `evaluateDunningForOverdueInstallments` already sets) invokes on a
 * recurring basis, once per school. `first_absence_of_day` fans out to every
 * channel in parallel (ticket #97's own "send push+WhatsApp+SMS in
 * parallel"); `subsequent_absence`/`correction` fall back sequentially,
 * stopping at the first channel that delivers. A `RollCallDiscrepancy` still
 * open for the row's key/student at dispatch time (opened *after* the
 * outbox row was written, not just at write time) defers it — left
 * `pending`, retried next pass — rather than sending into an unresolved
 * conflict.
 */
export const processOutboxOnce = Effect.fn("AttendanceNotification.processOutboxOnce")(function*(
  rawSchoolId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const sender = yield* NotificationSender

      const rows = yield* sql<{
        id: string
        key: string
        student_enrollment_id: string
        event_type: "first_absence_of_day" | "subsequent_absence" | "correction"
        payload: Record<string, unknown>
      }>`
        SELECT id, key, student_enrollment_id, event_type, payload FROM attendance_notification_outbox
        WHERE school_id = ${schoolId} AND status = 'pending' AND process_after <= now()
      `

      let processed = 0
      for (const row of rows) {
        const openDiscrepancy = yield* sql<{ id: string }>`
          SELECT id FROM roll_call_discrepancies
          WHERE key = ${row.key} AND student_enrollment_id = ${row.student_enrollment_id} AND resolved_at IS NULL
        `
        if (openDiscrepancy.length > 0) continue

        yield* sql`UPDATE attendance_notification_outbox SET status = 'sending' WHERE id = ${row.id}`

        const guardians = yield* sql<{ guardian_person_id: string }>`
          SELECT psr.guardian_person_id FROM parent_student_relationships psr
          JOIN enrollments e ON e.student_person_id = psr.student_person_id
          WHERE e.id = ${row.student_enrollment_id}
        `

        const logDelivery = (channel: NotificationChannel, result: ChannelSendResult) =>
          sql`
            INSERT INTO delivery_logs (school_id, outbox_id, channel, status, provider_message_id)
            VALUES (${schoolId}, ${row.id}, ${channel}, ${result.delivered ? "sent" : "failed"}, ${result.providerMessageId})
          `

        const sendToChannel = Effect.fn(function*(guardianPersonId: string, channel: NotificationChannel) {
          if (channel === "push") {
            const activeSubscriptions = yield* sql<{ id: string }>`
              SELECT id FROM push_subscriptions WHERE person_id = ${guardianPersonId} AND revoked_at IS NULL
            `
            if (activeSubscriptions.length === 0) {
              const result: ChannelSendResult = { delivered: false, providerMessageId: null }
              yield* logDelivery(channel, result)
              return result
            }
          }
          const result = yield* sender.send(channel, guardianPersonId, row.payload)
          yield* logDelivery(channel, result)
          return result
        })

        let anyDelivered = false
        if (row.event_type === "first_absence_of_day") {
          for (const guardian of guardians) {
            const results = yield* Effect.all(
              (["push", "whatsapp", "sms"] as const).map((channel) =>
                sendToChannel(guardian.guardian_person_id, channel)
              ),
              { concurrency: "unbounded" }
            )
            if (results.some((r) => r.delivered)) anyDelivered = true
          }
        } else {
          for (const guardian of guardians) {
            for (const channel of ["push", "whatsapp", "sms"] as const) {
              const result = yield* sendToChannel(guardian.guardian_person_id, channel)
              if (result.delivered) {
                anyDelivered = true
                break
              }
            }
          }
        }

        yield* sql`
          UPDATE attendance_notification_outbox
          SET status = ${anyDelivered ? "sent" : "failed"}, attempt_count = attempt_count + 1
          WHERE id = ${row.id}
        `
        processed++
      }
      return { processed }
    })
  )
})

/** A vendor webhook (signature verification happens at the HTTP layer, out of domain scope) confirming or failing a channel delivery. */
export const recordDeliveryWebhook = Effect.fn("AttendanceNotification.recordDeliveryWebhook")(function*(
  rawSchoolId: string,
  deliveryLogId: string,
  status: "delivered" | "failed"
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const sql = yield* SqlClient
  yield* withSchool(
    schoolId,
    sql`UPDATE delivery_logs SET status = ${status}, updated_at = now() WHERE id = ${deliveryLogId}`
  )
})

/** `delivery_logs` rows still `sent` (never confirmed `delivered`/`failed` by a webhook) past `olderThanMinutes` — a reconciliation job (not built: it needs a real vendor status-query API, itself gated on #86) polls the vendor for these. */
export const findStuckDeliveries = Effect.fn("AttendanceNotification.findStuckDeliveries")(function*(
  rawSchoolId: string,
  olderThanMinutes: number
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const sql = yield* SqlClient
  return yield* withSchool(
    schoolId,
    sql<{ id: string; outbox_id: string; channel: string; provider_message_id: string | null }>`
      SELECT id, outbox_id, channel, provider_message_id FROM delivery_logs
      WHERE school_id = ${schoolId} AND status = 'sent' AND sent_at < now() - (${olderThanMinutes} || ' minutes')::interval
    `
  )
})

/** A guardian's mobile device registering for push — self-service, no guardian-portal auth flow exists yet (same "policy ahead of its own login flow" gap `financialGuardianViewingOwnData` documents), so this is deliberately unauthorized/internal like `Dunning.ts`'s `evaluateDunningForOverdueInstallments`. */
export const registerPushSubscription = Effect.fn("AttendanceNotification.registerPushSubscription")(function*(
  rawSchoolId: string,
  personId: string,
  expoPushToken: string,
  deviceInfo: string | null
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const sql = yield* SqlClient
  yield* withSchool(
    schoolId,
    sql`
      INSERT INTO push_subscriptions (school_id, person_id, expo_push_token, device_info)
      VALUES (${schoolId}, ${personId}, ${expoPushToken}, ${deviceInfo})
      ON CONFLICT (person_id, expo_push_token) WHERE revoked_at IS NULL DO NOTHING
    `
  )
})

export const revokePushSubscription = Effect.fn("AttendanceNotification.revokePushSubscription")(function*(
  rawSchoolId: string,
  personId: string,
  expoPushToken: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const sql = yield* SqlClient
  yield* withSchool(
    schoolId,
    sql`
      UPDATE push_subscriptions SET revoked_at = now()
      WHERE person_id = ${personId} AND expo_push_token = ${expoPushToken} AND revoked_at IS NULL
    `
  )
})
