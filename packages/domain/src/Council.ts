import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { NotificationChannel, NotificationSender } from "./AttendanceNotification.ts"
import { writeAuditLog } from "./AuditLog.ts"
import { canManageCouncil } from "./authorization/Policies.ts"
import { DisciplinaryCouncilId, SchoolId, SummonsId } from "./Ids.ts"
import { authorizeWith, EntityNotFoundError, requireOwnedRow } from "./Ownership.ts"

export { EntityNotFoundError }

export class CouncilMinutesLockedError
  extends Schema.TaggedError<CouncilMinutesLockedError>()("CouncilMinutesLockedError", { councilId: Schema.String })
{}

export class CouncilMinutesNotLockedError
  extends Schema.TaggedError<CouncilMinutesNotLockedError>()("CouncilMinutesNotLockedError", {
    councilId: Schema.String
  })
{}

/** The channel order every sequential-fallback send in this module walks — first-absence-of-day's parallel dispatch (`AttendanceNotification.ts`) is deliberately NOT reused here (ticket #104's own "sequential fallback, not the parallel-urgent path"). */
const SEQUENTIAL_CHANNELS: ReadonlyArray<NotificationChannel> = ["push", "whatsapp", "sms"]

const sendSequential = Effect.fn("Council.sendSequential")(function*(
  recipientPersonIds: ReadonlyArray<string>,
  payload: Record<string, unknown>,
  startAfterChannel: NotificationChannel | null
) {
  const sender = yield* NotificationSender
  const channels = startAfterChannel === null
    ? SEQUENTIAL_CHANNELS
    : SEQUENTIAL_CHANNELS.slice(SEQUENTIAL_CHANNELS.indexOf(startAfterChannel) + 1)

  let deliveredChannel: NotificationChannel | null = null
  for (const recipientPersonId of recipientPersonIds) {
    for (const channel of channels) {
      const result = yield* sender.send(channel, recipientPersonId, payload)
      if (result.delivered) {
        deliveredChannel = channel
        break
      }
    }
  }
  return deliveredChannel
})

/** `Model.Class` for `summonses` (migration 0032, ticket #104). `recipients` is a `jsonb` array of person ids — read as an already-parsed JS array, written via a hand-built `INSERT`, same idiom as `Discipline.ts`'s `Incident.witnesses`. */
export class Summons extends Model.Class<Summons>("Summons")({
  id: Model.Field({ select: SummonsId, update: SummonsId, json: SummonsId, jsonUpdate: SummonsId }),
  school_id: SchoolId,
  student_enrollment_id: Schema.String,
  summons_type: Schema.String,
  date: Schema.String,
  time: Schema.String,
  purpose: Schema.String,
  recipients: Schema.Array(Schema.String),
  delivered_channel: Schema.NullOr(NotificationChannel),
  read_at: Schema.NullOr(Schema.DateTimeUtcFromMillis),
  escalated_at: Schema.NullOr(Schema.DateTimeUtcFromMillis),
  issued_by_person_id: Schema.String,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/** Delivered sequentially (push→WhatsApp→SMS), stopping at the first recipient/channel pair that succeeds — ticket #104's own "not the parallel-urgent path" (that's `AttendanceNotification.ts`'s first-absence case, a different urgency profile). */
export const issueSummons = Effect.fn("Council.issueSummons")(function*(
  rawSchoolId: string,
  studentEnrollmentId: string,
  summonsType: string,
  date: string,
  time: string,
  purpose: string,
  recipientPersonIds: ReadonlyArray<string>,
  issuedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageCouncil,
    "manage-council",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const deliveredChannel = yield* sendSequential(
          recipientPersonIds,
          { type: "summons", studentEnrollmentId, summonsType, date, time, purpose },
          null
        )
        const [row] = yield* sql`
          INSERT INTO summonses
            (school_id, student_enrollment_id, summons_type, date, time, purpose, recipients, delivered_channel, issued_by_person_id)
          VALUES (
            ${schoolId}, ${studentEnrollmentId}, ${summonsType}, ${date}::date, ${time}, ${purpose},
            ${JSON.stringify(recipientPersonIds)}::jsonb, ${deliveredChannel}, ${issuedByPersonId}
          )
          RETURNING *
        `
        const summons = yield* Schema.decodeUnknownEffect(Summons)(row)
        yield* writeAuditLog(schoolId, issuedByPersonId, "issue_summons", "summons", summons.id, null, summons)
        return summons
      })
    )
  )
})

export const markSummonsRead = Effect.fn("Council.markSummonsRead")(function*(
  rawSchoolId: string,
  summonsId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageCouncil,
    "manage-council",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "summonses", "summons", summonsId, schoolId, Schema.Struct({ id: Schema.String }))
        yield* sql`UPDATE summonses SET read_at = now() WHERE id = ${summonsId} AND read_at IS NULL`
      })
    )
  )
})

/**
 * Ticket #104's own "automatic escalation... if unread past 24h": resends
 * via the next channel after whichever one (if any) delivered originally.
 * "Notify director" (the ticket's other half of escalation) has no real
 * mechanism to hang off — no director-person lookup exists anywhere in this
 * codebase (a director is a subject role resolved at login, never a stored
 * `schools`→`persons` reference) — so this function does NOT fabricate one;
 * a future ticket introducing that lookup should extend this rather than
 * this ticket inventing a placeholder mapping. Same "meant to be invoked by
 * a scheduling harness, none exists yet, wiring one up is out of scope"
 * precedent as `Dunning.ts`'s `evaluateDunningForOverdueInstallments`.
 */
export const escalateUnreadSummonses = Effect.fn("Council.escalateUnreadSummonses")(function*(rawSchoolId: string) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const overdue = yield* sql<{
        id: string
        recipients: ReadonlyArray<string>
        delivered_channel: NotificationChannel | null
        summons_type: string
        student_enrollment_id: string
      }>`
        SELECT id, recipients, delivered_channel, summons_type, student_enrollment_id FROM summonses
        WHERE school_id = ${schoolId} AND read_at IS NULL AND escalated_at IS NULL
          AND created_at < now() - interval '24 hours'
      `

      let escalated = 0
      for (const summons of overdue) {
        yield* sendSequential(
          summons.recipients,
          { type: "summons_escalation", studentEnrollmentId: summons.student_enrollment_id, summonsType: summons.summons_type },
          summons.delivered_channel
        )
        yield* sql`UPDATE summonses SET escalated_at = now() WHERE id = ${summons.id}`
        escalated++
      }
      return { escalated }
    })
  )
})

/** Draws the next council-minutes number from the school's own gapless counter — same "atomic INSERT...ON CONFLICT DO UPDATE, run inside the same transaction as the row it numbers" idiom `Payment.ts`'s `drawNextReceiptNumber` establishes for Finance receipts. */
const drawNextCouncilMinutesNumber = Effect.fn("Council.drawNextCouncilMinutesNumber")(function*(
  sql: SqlClient,
  schoolId: SchoolId
) {
  const [counter] = yield* sql<{ assigned: number; year: number }>`
    INSERT INTO council_minutes_counters (school_id, next_number) VALUES (${schoolId}, 2)
    ON CONFLICT (school_id) DO UPDATE SET next_number = council_minutes_counters.next_number + 1
    RETURNING next_number - 1 AS assigned, EXTRACT(YEAR FROM CURRENT_DATE)::int AS year
  `
  return `CD-${counter.year}-${String(counter.assigned).padStart(4, "0")}`
})

/** `Model.Class` for `disciplinary_councils` (migration 0032). `minutes_number` is `NULL` while `status = 'draft'` — assigned exactly once, at first lock, from the school's own gapless counter. */
export class DisciplinaryCouncil extends Model.Class<DisciplinaryCouncil>("DisciplinaryCouncil")({
  id: Model.Field({
    select: DisciplinaryCouncilId,
    update: DisciplinaryCouncilId,
    json: DisciplinaryCouncilId,
    jsonUpdate: DisciplinaryCouncilId
  }),
  school_id: SchoolId,
  incident_id: Schema.NullOr(Schema.String),
  minutes_number: Schema.NullOr(Schema.String),
  status: Schema.Literals(["draft", "locked"]),
  members: Schema.Array(Schema.String),
  summoned_guardians: Schema.Array(Schema.String),
  session_file: Schema.NullOr(Schema.String),
  deliberation: Schema.NullOr(Schema.String),
  decision: Schema.NullOr(Schema.String),
  created_by_person_id: Schema.String,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  locked_at: Schema.NullOr(Schema.DateTimeUtcFromMillis)
}) {}

const snapshotOf = (council: DisciplinaryCouncil) => ({
  members: council.members,
  summoned_guardians: council.summoned_guardians,
  session_file: council.session_file,
  deliberation: council.deliberation,
  decision: council.decision,
  status: council.status
})

const writeRevision = Effect.fn("Council.writeRevision")(function*(
  sql: SqlClient,
  schoolId: SchoolId,
  councilId: string,
  council: DisciplinaryCouncil,
  revisedByPersonId: string,
  isPostLockReopening: boolean
) {
  yield* sql`
    INSERT INTO council_minutes_revisions
      (school_id, council_id, snapshot, is_post_lock_reopening, revised_by_person_id)
    VALUES (${schoolId}, ${councilId}, ${JSON.stringify(snapshotOf(council))}::jsonb, ${isPostLockReopening}, ${revisedByPersonId})
  `
})

export const createDisciplinaryCouncil = Effect.fn("Council.createDisciplinaryCouncil")(function*(
  rawSchoolId: string,
  incidentId: string | null,
  members: ReadonlyArray<string>,
  summonedGuardians: ReadonlyArray<string>,
  createdByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageCouncil,
    "manage-council",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const [row] = yield* sql`
          INSERT INTO disciplinary_councils (school_id, incident_id, members, summoned_guardians, created_by_person_id)
          VALUES (${schoolId}, ${incidentId}, ${JSON.stringify(members)}::jsonb, ${JSON.stringify(summonedGuardians)}::jsonb, ${createdByPersonId})
          RETURNING *
        `
        return yield* Schema.decodeUnknownEffect(DisciplinaryCouncil)(row)
      })
    )
  )
})

const requireCouncil = Effect.fn("Council.requireCouncil")(function*(sql: SqlClient, schoolId: SchoolId, councilId: string) {
  const rows = yield* sql`SELECT * FROM disciplinary_councils WHERE id = ${councilId} AND school_id = ${schoolId}`
  const [row] = rows
  if (row === undefined) {
    return yield* Effect.fail(new EntityNotFoundError({ entityType: "disciplinary_council", entityId: councilId }))
  }
  return yield* Schema.decodeUnknownEffect(DisciplinaryCouncil)(row)
})

/** Editable pre-lock, refused post-lock (ticket #104's own acceptance criterion) — every successful edit records a full snapshot, not a diff. */
export const updateCouncilMinutes = Effect.fn("Council.updateCouncilMinutes")(function*(
  rawSchoolId: string,
  councilId: string,
  fields: { sessionFile?: string; deliberation?: string; decision?: string },
  revisedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageCouncil,
    "manage-council",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const council = yield* requireCouncil(sql, schoolId, councilId)
        if (council.status === "locked") {
          return yield* Effect.fail(new CouncilMinutesLockedError({ councilId }))
        }

        yield* sql.withTransaction(Effect.gen(function*() {
          yield* sql`
            UPDATE disciplinary_councils
            SET
              session_file = ${fields.sessionFile ?? council.session_file},
              deliberation = ${fields.deliberation ?? council.deliberation},
              decision = ${fields.decision ?? council.decision}
            WHERE id = ${councilId}
          `
          const updated = yield* requireCouncil(sql, schoolId, councilId)
          yield* writeRevision(sql, schoolId, councilId, updated, revisedByPersonId, false)
        }))
      })
    )
  )
})

/** Assigns a `minutes_number` from the gapless counter ONLY the first time a council is locked — reopening and re-locking (below) never draws a second number for the same council. */
export const lockCouncilMinutes = Effect.fn("Council.lockCouncilMinutes")(function*(
  rawSchoolId: string,
  councilId: string,
  lockedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageCouncil,
    "manage-council",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const council = yield* requireCouncil(sql, schoolId, councilId)

        return yield* sql.withTransaction(Effect.gen(function*() {
          const minutesNumber = council.minutes_number ?? (yield* drawNextCouncilMinutesNumber(sql, schoolId))
          yield* sql`
            UPDATE disciplinary_councils
            SET status = 'locked', minutes_number = ${minutesNumber}, locked_at = now()
            WHERE id = ${councilId}
          `
          const locked = yield* requireCouncil(sql, schoolId, councilId)
          yield* writeRevision(sql, schoolId, councilId, locked, lockedByPersonId, false)
          yield* writeAuditLog(schoolId, lockedByPersonId, "lock_council_minutes", "disciplinary_council", councilId, null, locked)
          return locked
        }))
      })
    )
  )
})

/** The one escape hatch out of "immutable post-lock" — every reopening is itself recorded as a full snapshot (`is_post_lock_reopening: true`), so the audit trail shows exactly when and by whom locked minutes were reopened, never a silent mutation. */
export const reopenCouncilMinutes = Effect.fn("Council.reopenCouncilMinutes")(function*(
  rawSchoolId: string,
  councilId: string,
  reopenedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageCouncil,
    "manage-council",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const council = yield* requireCouncil(sql, schoolId, councilId)
        if (council.status !== "locked") {
          return yield* Effect.fail(new CouncilMinutesNotLockedError({ councilId }))
        }

        yield* sql.withTransaction(Effect.gen(function*() {
          yield* writeRevision(sql, schoolId, councilId, council, reopenedByPersonId, true)
          yield* sql`UPDATE disciplinary_councils SET status = 'draft' WHERE id = ${councilId}`
          yield* writeAuditLog(schoolId, reopenedByPersonId, "reopen_council_minutes", "disciplinary_council", councilId, council, null)
        }))
      })
    )
  )
})

/**
 * A locked council's decision is a record a director can act on — this
 * function never calls `Enrollment.ts#closeEnrollment` (or anything else)
 * itself (ticket #104's own acceptance criterion: "a council decision never
 * calls closeEnrollment itself"). A director reading this queue decides
 * separately, through `closeEnrollment`'s own director-gated call, exactly
 * like `Discipline.ts#findPendingSuspensionProposals` hands off to
 * `approveSuspension` rather than acting automatically.
 */
export const findLockedCouncilDecisions = Effect.fn("Council.findLockedCouncilDecisions")(function*(
  rawSchoolId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageCouncil,
    "manage-council",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows = yield* sql`
          SELECT * FROM disciplinary_councils WHERE school_id = ${schoolId} AND status = 'locked' ORDER BY locked_at DESC
        `
        return yield* Schema.decodeUnknownEffect(Schema.Array(DisciplinaryCouncil))(rows)
      })
    )
  )
})
