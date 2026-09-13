import * as Qadi from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { canManageAttendanceSchedule, canTakeRollCall } from "./authorization/Policies.ts"
import { CourseId, SchoolId, SessionId, SlotId } from "./Ids.ts"
import { authorizeWith, EntityNotFoundError, requireOwnedRow } from "./Ownership.ts"
import { findActiveAssignedTeacherPersonIds } from "./TeacherAssignment.ts"

export { EntityNotFoundError }

export class SessionNotSubstitutedError extends Schema.TaggedError<SessionNotSubstitutedError>()(
  "SessionNotSubstitutedError",
  { sessionId: Schema.String }
) {}

/**
 * `Model.Class` for `slots` (migration 0025, ticket #95, ADR-ZS-045) — a
 * plain per-school (optionally per-cycle) catalog, no timetable/
 * conflict-checking: ADR-ZS-045's own MVP scope for the "declared time slot"
 * half of `Session`'s `(course, date, slot)` triplet.
 */
export class Slot extends Model.Class<Slot>("Slot")({
  id: Model.Field({ select: SlotId, update: SlotId, json: SlotId, jsonUpdate: SlotId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  cycle_id: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  label: Schema.String,
  ordinal: Schema.Int,
  applicable_half_day: Schema.Literals(["morning", "afternoon"])
}) {}

const slotRepo = SqlModel.makeRepository(Slot, { tableName: "slots", spanPrefix: "Session", idColumn: "id" })

/**
 * `Model.Class` for `sessions` (migration 0025, ticket #95, ADR-ZS-045/046).
 * `status: expected` is the bulk-declared default; `held`/`not_held`/
 * `substituted` are the outcomes ADR-ZS-046 adds on top of plain roll call.
 */
export class Session extends Model.Class<Session>("Session")({
  id: Model.Field({ select: SessionId, update: SessionId, json: SessionId, jsonUpdate: SessionId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  course_id: CourseId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  date: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  slot_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  status: Schema.Literals(["expected", "held", "not_held", "substituted"]),
  substitute_teacher_person_id: Schema.NullOr(Schema.String)
}) {}

/**
 * Gated by `canManageAttendanceSchedule` (director or student-life,
 * cycle-or-whole-school) — the slot catalog is a scheduling configuration,
 * not a roll-call action.
 */
export const createSlot = Effect.fn("Session.createSlot")(function*(
  rawSchoolId: string,
  cycleId: string | null,
  label: string,
  ordinal: number,
  applicableHalfDay: "morning" | "afternoon"
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageAttendanceSchedule,
    "manage-attendance-schedule",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const repo = yield* slotRepo
        return yield* repo.insert({ school_id: schoolId, cycle_id: cycleId, label, ordinal, applicable_half_day: applicableHalfDay })
      })
    )
  )
})

/** Every slot applicable to `cycleId` — the cycle's own rows plus whole-school (`cycle_id IS NULL`) ones — ordered for display. */
export const findSlots = Effect.fn("Session.findSlots")(function*(rawSchoolId: string, cycleId: string | null) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String, cycleId: Schema.NullOr(Schema.String) }),
        Result: Slot,
        execute: (req) =>
          sql`
            SELECT * FROM slots
            WHERE school_id = ${req.schoolId} AND (cycle_id = ${req.cycleId} OR cycle_id IS NULL)
            ORDER BY ordinal ASC
          `
      })({ schoolId, cycleId })
    })
  )
})

/**
 * Bulk-declares `expected` `Session` rows for `courseId`/`slotId` over
 * `[startDate, endDate]` inclusive, one action (ticket #95's own acceptance
 * criterion) rather than N calls. `ON CONFLICT DO NOTHING` against the
 * table's own `(course_id, date, slot_id)` unique index makes re-running
 * this over an overlapping range additive, never a duplicate/error.
 */
export const bulkDeclareSessions = Effect.fn("Session.bulkDeclareSessions")(function*(
  rawSchoolId: string,
  rawCourseId: string,
  rawSlotId: string,
  startDate: string,
  endDate: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const courseId = yield* Schema.decodeEffect(CourseId)(rawCourseId)
  const slotId = yield* Schema.decodeEffect(SlotId)(rawSlotId)
  return yield* authorizeWith(
    canManageAttendanceSchedule,
    "manage-attendance-schedule",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows = yield* sql<{ id: string }>`
          INSERT INTO sessions (school_id, course_id, date, slot_id, status)
          SELECT ${schoolId}, ${courseId}, d::date, ${slotId}, 'expected'
          FROM generate_series(${startDate}::date, ${endDate}::date, '1 day'::interval) AS d
          ON CONFLICT (course_id, date, slot_id) DO NOTHING
          RETURNING id
        `
        return rows.map((row) => row.id)
      })
    )
  )
})

/**
 * The resource attributes `canTakeRollCall` needs to decide a teacher's
 * access to `courseId` — resolved fresh from `TeacherAssignment` (and, when
 * an existing `Session` carries one, its `substitute_teacher_person_id`) at
 * every call, never cached, the same "resolve real facts, then re-check the
 * resource-scoped policy" pattern `Ownership.ts` documents.
 */
const rollCallResourceFor = Effect.fn("Session.rollCallResourceFor")(function*(
  schoolId: string,
  courseId: string,
  substituteTeacherPersonId: string | null
) {
  const assignedTeacherPersonIds = yield* findActiveAssignedTeacherPersonIds(courseId)
  return {
    school_id: schoolId,
    assigned_teacher_person_ids: assignedTeacherPersonIds,
    substitute_teacher_person_id: substituteTeacherPersonId
  }
})

/**
 * Ticket #95's ad hoc case: a teacher taking roll call for a course/date
 * with no existing `Session` creates one inline, pre-filled `status: "held"`
 * (ADR-ZS-045). An existing `Session` is returned as-is — roll call itself
 * (ticket #96) decides what a non-`expected` status means, not this
 * function. Gated by the exact `canTakeRollCall` policy roll call itself
 * uses, so a teacher who cannot take roll call for the course cannot create
 * its `Session` either.
 */
export const findOrCreateSessionForRollCall = Effect.fn("Session.findOrCreateSessionForRollCall")(function*(
  rawSchoolId: string,
  rawCourseId: string,
  date: string,
  rawSlotId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const courseId = yield* Schema.decodeEffect(CourseId)(rawCourseId)
  const slotId = yield* Schema.decodeEffect(SlotId)(rawSlotId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const existingRows = yield* sql<{
        id: string
        substitute_teacher_person_id: string | null
      }>`
        SELECT id, substitute_teacher_person_id FROM sessions
        WHERE course_id = ${courseId} AND date = ${date}::date AND slot_id = ${slotId}
      `
      const existing = existingRows[0]

      const resource = yield* rollCallResourceFor(schoolId, courseId, existing?.substitute_teacher_person_id ?? null)
      yield* Qadi.assert(canTakeRollCall, { resource, action: "take-roll-call" })

      if (existing !== undefined) {
        const [session] = yield* sql`SELECT * FROM sessions WHERE id = ${existing.id}`
        return yield* Schema.decodeUnknownEffect(Session)(session)
      }

      const [inserted] = yield* sql`
        INSERT INTO sessions (school_id, course_id, date, slot_id, status)
        VALUES (${schoolId}, ${courseId}, ${date}::date, ${slotId}, 'held')
        RETURNING *
      `
      return yield* Schema.decodeUnknownEffect(Session)(inserted)
    })
  )
})

/** Marks a `Session` uncovered (ADR-ZS-046): the teacher didn't come, no substitute — removed from expected attendance, no roll call taken. */
export const markSessionNotHeld = Effect.fn("Session.markSessionNotHeld")(function*(
  rawSchoolId: string,
  sessionId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageAttendanceSchedule,
    "manage-attendance-schedule",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "sessions", "session", sessionId, schoolId, Schema.Struct({ id: Schema.String }))
        yield* sql`UPDATE sessions SET status = 'not_held', substitute_teacher_person_id = NULL WHERE id = ${sessionId}`
      })
    )
  )
})

/** Marks a `Session` substituted (ADR-ZS-046): a different teacher covers it, so the substitute — not the originally-assigned teacher — gets `canTakeRollCall` access via `Session.substitute_teacher_person_id`. */
export const markSessionSubstituted = Effect.fn("Session.markSessionSubstituted")(function*(
  rawSchoolId: string,
  sessionId: string,
  substituteTeacherPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageAttendanceSchedule,
    "manage-attendance-schedule",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "sessions", "session", sessionId, schoolId, Schema.Struct({ id: Schema.String }))
        yield* sql`
          UPDATE sessions
          SET status = 'substituted', substitute_teacher_person_id = ${substituteTeacherPersonId}
          WHERE id = ${sessionId}
        `
      })
    )
  )
})
