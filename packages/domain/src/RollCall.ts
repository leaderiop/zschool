import * as Qadi from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import { cancelPendingOutboxForKey, recordAbsenceForNotification, recordCorrectionIfAlreadySent } from "./AttendanceNotification.ts"
import { canArbitrateAttendanceDiscrepancy, canManageAttendanceSchedule, canTakeRollCall } from "./authorization/Policies.ts"
import { isStudentTemporarilyExcluded } from "./Discipline.ts"
import { RollCallDiscrepancyId, RollCallSubmissionId, SchoolId, SessionId } from "./Ids.ts"
import { authorizeWith, EntityNotFoundError, requireOwnedRow } from "./Ownership.ts"
import { findActiveAssignedTeacherPersonIds } from "./TeacherAssignment.ts"

export { EntityNotFoundError }

export class DiscrepancyNotOpenError extends Schema.TaggedError<DiscrepancyNotOpenError>()(
  "DiscrepancyNotOpenError",
  { discrepancyId: Schema.String }
) {}

export const AttendanceStatus = Schema.Literals(["present", "absent", "tardy", "exclusion"])
export type AttendanceStatus = typeof AttendanceStatus.Type

export class RollCallEntry extends Schema.Class<RollCallEntry>("RollCallEntry")({
  studentEnrollmentId: Schema.String,
  status: AttendanceStatus
}) {}

/**
 * `Model.Class` for `roll_call_submissions` (migration 0026, ticket #96) —
 * append-only: nothing here ever updates a row except stamping
 * `superseded_by_id` once an arbitration resolves the discrepancy it was
 * part of. `key` is a plain application-supplied column (see the migration's
 * own comment on why it isn't `GENERATED`), always `sessionKey`/`halfDayKey`
 * below, never hand-built at a call site.
 */
export class RollCallSubmission extends Model.Class<RollCallSubmission>("RollCallSubmission")({
  id: Model.Field({
    select: RollCallSubmissionId,
    update: RollCallSubmissionId,
    json: RollCallSubmissionId,
    jsonUpdate: RollCallSubmissionId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  session_id: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  class_id: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  date: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  half_day: Schema.NullOr(Schema.Literals(["morning", "afternoon"])).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  key: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  student_enrollment_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  status: AttendanceStatus.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  author_person_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  submitted_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  superseded_by_id: Schema.NullOr(Schema.String)
}) {}

const rollCallSubmissionRepo = SqlModel.makeRepository(RollCallSubmission, {
  tableName: "roll_call_submissions",
  spanPrefix: "RollCall",
  idColumn: "id"
})

/** `Model.Class` for `roll_call_discrepancies` (migration 0026, ticket #96). */
export class RollCallDiscrepancy extends Model.Class<RollCallDiscrepancy>("RollCallDiscrepancy")({
  id: Model.Field({
    select: RollCallDiscrepancyId,
    update: RollCallDiscrepancyId,
    json: RollCallDiscrepancyId,
    jsonUpdate: RollCallDiscrepancyId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  key: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  student_enrollment_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  opened_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  resolved_at: Schema.NullOr(Schema.DateTimeUtcFromMillis)
}) {}

/** Must match the `key` `GENERATED ALWAYS` expression on `roll_call_submissions`/`attendance_records` (migration 0026) exactly — application code and the DB's own generated column compute the same string independently, never one derived from the other. */
export const sessionKey = (sessionId: string) => `session:${sessionId}`
export const halfDayKey = (classId: string, date: string, halfDay: "morning" | "afternoon") =>
  `halfday:${classId}:${date}:${halfDay}`

/**
 * The shared write path both `confirmRollCallForSession` and
 * `confirmRollCallForHalfDay` funnel through, once each has resolved its own
 * authorization and computed `key` — ticket #96's core: append a submission,
 * then either materialize `attendance_records` (first confirmation for this
 * key/student) or open a `RollCallDiscrepancy` (a second one) instead of
 * silently overwriting. One transaction per whole `entries` batch, so a
 * caller never observes a partially-confirmed roll call.
 */
const writeRollCall = Effect.fn("RollCall.writeRollCall")(function*(
  schoolId: SchoolId,
  keyColumns: {
    sessionId: string | null
    classId: string | null
    date: string | null
    halfDay: "morning" | "afternoon" | null
  },
  key: string,
  notificationDate: string,
  authorPersonId: string,
  entries: ReadonlyArray<RollCallEntry>
) {
  const sql = yield* SqlClient
  const repo = yield* rollCallSubmissionRepo

  yield* sql.withTransaction(Effect.gen(function*() {
    for (const entry of entries) {
      // Ticket #103's own wiring for ticket #96's stub: a student inside an
      // active temporary-exclusion window always gets `exclusion`, never
      // whatever status a teacher (unaware of the sanction) submitted —
      // non-editable, and never a notification.
      const excluded = yield* isStudentTemporarilyExcluded(entry.studentEnrollmentId, notificationDate)
      const effectiveStatus = excluded ? "exclusion" : entry.status

      yield* repo.insertVoid({
        school_id: schoolId,
        session_id: keyColumns.sessionId,
        class_id: keyColumns.classId,
        date: keyColumns.date,
        half_day: keyColumns.halfDay,
        key,
        student_enrollment_id: entry.studentEnrollmentId,
        status: effectiveStatus,
        author_person_id: authorPersonId,
        superseded_by_id: null
      })

      const existing = yield* sql<{ status: string }>`
        SELECT status FROM attendance_records WHERE key = ${key} AND student_enrollment_id = ${entry.studentEnrollmentId}
      `

      if (existing.length === 0) {
        yield* sql`
          INSERT INTO attendance_records (key, student_enrollment_id, school_id, status)
          VALUES (${key}, ${entry.studentEnrollmentId}, ${schoolId}, ${effectiveStatus})
        `
        // Ticket #97: a clean (no-conflict) first confirmation of an
        // absence is what schedules the guardian notification — never a
        // second, conflicting submission (that path opens a discrepancy
        // below instead, and #97's own rule is "no notification while a
        // discrepancy is open for that key/student") — and never an
        // exclusion (ticket #103's own "no notification" requirement).
        if (effectiveStatus === "absent") {
          yield* recordAbsenceForNotification(schoolId, key, entry.studentEnrollmentId, notificationDate)
        }
        continue
      }

      const openDiscrepancy = yield* sql<{ id: string }>`
        SELECT id FROM roll_call_discrepancies
        WHERE key = ${key} AND student_enrollment_id = ${entry.studentEnrollmentId} AND resolved_at IS NULL
      `
      if (openDiscrepancy.length === 0) {
        yield* sql`
          INSERT INTO roll_call_discrepancies (school_id, key, student_enrollment_id)
          VALUES (${schoolId}, ${key}, ${entry.studentEnrollmentId})
        `
        // Ticket #97: "a correction cancels the still-pending row with no
        // send" — a conflicting second submission means the first
        // confirmation's own notification (if still within its 3-minute
        // retention window) must not go out unreviewed.
        yield* cancelPendingOutboxForKey(schoolId, key, entry.studentEnrollmentId)
      }
      // An already-open discrepancy just gets another recorded submission
      // (above) — no second `RollCallDiscrepancy` row (the partial unique
      // index would refuse it anyway); arbitration is the only way out.
    }
  }))
})

/**
 * Confirms roll call for a course `Session` (ADR-ZS-045's per-course mode).
 * Gated by the exact `canTakeRollCall` policy `Session.ts#findOrCreateSessionForRollCall`
 * already uses, re-resolved fresh here rather than trusted from an earlier
 * call — the same "never cache an authorization decision" discipline
 * `Ownership.ts` documents.
 */
export const confirmRollCallForSession = Effect.fn("RollCall.confirmRollCallForSession")(function*(
  rawSchoolId: string,
  rawSessionId: string,
  authorPersonId: string,
  entries: ReadonlyArray<RollCallEntry>
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const sessionId = yield* Schema.decodeEffect(SessionId)(rawSessionId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const session = yield* requireOwnedRow(
        sql,
        "sessions",
        "session",
        sessionId,
        schoolId,
        Schema.Struct({
          course_id: Schema.String,
          substitute_teacher_person_id: Schema.NullOr(Schema.String),
          date: Schema.String
        }),
        "course_id, substitute_teacher_person_id, date"
      )
      const assignedTeacherPersonIds = yield* findActiveAssignedTeacherPersonIds(session.course_id)
      yield* Qadi.assert(canTakeRollCall, {
        resource: {
          school_id: schoolId,
          assigned_teacher_person_ids: assignedTeacherPersonIds,
          substitute_teacher_person_id: session.substitute_teacher_person_id
        },
        action: "take-roll-call"
      })

      yield* writeRollCall(
        schoolId,
        { sessionId, classId: null, date: null, halfDay: null },
        sessionKey(sessionId),
        session.date,
        authorPersonId,
        entries
      )
    })
  )
})

/**
 * Confirms roll call for a whole class over a half-day — the mode this
 * ticket's schema supports alongside per-course `Session`s, per its own
 * "a row's key is either session_id... or (class_id, date, half_day)"
 * requirement. No homeroom-teacher assignment concept exists in this
 * codebase yet (`TeacherAssignment` is course-scoped only), so this mode is
 * gated by `canManageAttendanceSchedule` (director/student-life) rather than
 * a teacher check — a real gap, not silently ignored: a future ticket
 * introducing homeroom assignments would extend this the same way
 * `Session.substitute_teacher_person_id` extended `canTakeRollCall`.
 */
export const confirmRollCallForHalfDay = Effect.fn("RollCall.confirmRollCallForHalfDay")(function*(
  rawSchoolId: string,
  classId: string,
  date: string,
  halfDay: "morning" | "afternoon",
  authorPersonId: string,
  entries: ReadonlyArray<RollCallEntry>
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageAttendanceSchedule,
    "take-roll-call-half-day",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "classes", "class", classId, schoolId, Schema.Struct({ id: Schema.String }))
        yield* writeRollCall(
          schoolId,
          { sessionId: null, classId, date, halfDay },
          halfDayKey(classId, date, halfDay),
          date,
          authorPersonId,
          entries
        )
      })
    )
  )
})

/** The current materialized status for a key/student — ticket #96's stub read path for ticket #103's future `exclusion` pre-fill: today nothing ever writes `exclusion`, but a roll-call screen reading this already renders it correctly once something does. */
export const findAttendanceRecordStatus = Effect.fn("RollCall.findAttendanceRecordStatus")(function*(
  schoolId: string,
  key: string,
  studentEnrollmentId: string
) {
  const sql = yield* SqlClient
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const rows = yield* sql<{ status: string }>`
        SELECT status FROM attendance_records WHERE key = ${key} AND student_enrollment_id = ${studentEnrollmentId}
      `
      return rows[0]?.status ?? null
    })
  )
})

/**
 * Resolves an open `RollCallDiscrepancy`: writes one arbitration submission
 * (authored by student-life), stamps every prior unsuperseded submission for
 * that key/student with `superseded_by_id`, upserts `attendance_records` to
 * the arbitrated status, and closes the discrepancy — all inside one
 * transaction, per ticket #96's "closed by student life writing an
 * arbitration submission that supersedes both."
 */
export const arbitrateRollCallDiscrepancy = Effect.fn("RollCall.arbitrateRollCallDiscrepancy")(function*(
  rawSchoolId: string,
  discrepancyId: string,
  resolvingStatus: AttendanceStatus,
  studentLifePersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canArbitrateAttendanceDiscrepancy,
    "arbitrate-attendance-discrepancy",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const discrepancy = yield* requireOwnedRow(
          sql,
          "roll_call_discrepancies",
          "discrepancy",
          discrepancyId,
          schoolId,
          Schema.Struct({
            key: Schema.String,
            student_enrollment_id: Schema.String,
            resolved_at: Schema.NullOr(Schema.String)
          }),
          "key, student_enrollment_id, resolved_at"
        )
        if (discrepancy.resolved_at !== null) {
          return yield* Effect.fail(new DiscrepancyNotOpenError({ discrepancyId }))
        }

        yield* sql.withTransaction(Effect.gen(function*() {
          const [arbitration] = yield* sql<{ id: string }>`
            INSERT INTO roll_call_submissions (school_id, session_id, class_id, date, half_day, key, student_enrollment_id, status, author_person_id)
            SELECT school_id, session_id, class_id, date, half_day, key, ${discrepancy.student_enrollment_id}, ${resolvingStatus}, ${studentLifePersonId}
            FROM roll_call_submissions
            WHERE key = ${discrepancy.key} AND student_enrollment_id = ${discrepancy.student_enrollment_id}
            LIMIT 1
            RETURNING id
          `

          yield* sql`
            UPDATE roll_call_submissions
            SET superseded_by_id = ${arbitration.id}
            WHERE key = ${discrepancy.key}
              AND student_enrollment_id = ${discrepancy.student_enrollment_id}
              AND superseded_by_id IS NULL
              AND id != ${arbitration.id}
          `

          yield* sql`
            UPDATE attendance_records
            SET status = ${resolvingStatus}, updated_at = now()
            WHERE key = ${discrepancy.key} AND student_enrollment_id = ${discrepancy.student_enrollment_id}
          `

          yield* sql`UPDATE roll_call_discrepancies SET resolved_at = now() WHERE id = ${discrepancyId}`

          yield* recordCorrectionIfAlreadySent(schoolId, discrepancy.key, discrepancy.student_enrollment_id, resolvingStatus)
        }))
      })
    )
  )
})
