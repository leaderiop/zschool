import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { canRecordJustification, canValidateJustification } from "./authorization/Policies.ts"
import { JustificationId, JustificationReasonCodeId, SchoolId } from "./Ids.ts"
import { authorizeWith, EntityNotFoundError, requireOwnedRow } from "./Ownership.ts"

export { EntityNotFoundError }

export class JustificationNotSubmittedError
  extends Schema.TaggedError<JustificationNotSubmittedError>()("JustificationNotSubmittedError", {
    justificationId: Schema.String
  })
{}

/**
 * Ticket #103's own front-desk/parent justification validation queue
 * (SCR-ZS-054) needs somewhere to read from — no earlier ticket in this map
 * claims `Justification` storage (tickets #100/#101 build the mobile
 * screens that will eventually submit one; ticket #98's own migration
 * comment already flagged this gap), so it's introduced here, minimally:
 * only what #103's own acceptance criteria need (submit, validate, refuse,
 * a pending queue) — richer submission UX (multi-child selector, etc.) is
 * tickets #100/#101's own concern.
 */
export class JustificationReasonCode extends Model.Class<JustificationReasonCode>("JustificationReasonCode")({
  id: Model.Field({
    select: JustificationReasonCodeId,
    update: JustificationReasonCodeId,
    json: JustificationReasonCodeId,
    jsonUpdate: JustificationReasonCodeId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  label: Schema.String
}) {}

const justificationReasonCodeRepo = SqlModel.makeRepository(JustificationReasonCode, {
  tableName: "justification_reason_codes",
  spanPrefix: "Justification",
  idColumn: "id"
})

export const createJustificationReasonCode = Effect.fn("Justification.createJustificationReasonCode")(function*(
  rawSchoolId: string,
  label: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canRecordJustification,
    "manage-justification-reasons",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const repo = yield* justificationReasonCodeRepo
        return yield* repo.insert({ school_id: schoolId, label })
      })
    )
  )
})

export const findJustificationReasonCodes = Effect.fn("Justification.findJustificationReasonCodes")(function*(
  rawSchoolId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String }),
        Result: JustificationReasonCode,
        execute: (req) => sql`SELECT * FROM justification_reason_codes WHERE school_id = ${req.schoolId} ORDER BY label ASC`
      })({ schoolId })
    })
  )
})

/** `Model.Class` for `justifications` (migration 0029). `key` is a `RollCall.ts` key (`sessionKey`/`halfDayKey`) — a justification always justifies a specific roll-call key/student, the same pairing `attendance_records`/`roll_call_discrepancies` use. */
export class Justification extends Model.Class<Justification>("Justification")({
  id: Model.Field({
    select: JustificationId,
    update: JustificationId,
    json: JustificationId,
    jsonUpdate: JustificationId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  student_enrollment_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  key: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  reason_code_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  comment: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  attachment_id: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  status: Schema.Literals(["submitted", "validated", "refused"]),
  refusal_reason: Schema.NullOr(Schema.String),
  submitted_by_person_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  decided_by_person_id: Schema.NullOr(Schema.String),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  decided_at: Schema.NullOr(Schema.DateTimeUtcFromMillis)
}) {}

/** Gated by `canRecordJustification` (front-office/student-life/director) — a guardian's own self-submission (ticket #101's mobile screen) needs a guardian-portal auth flow that doesn't exist yet, same documented gap as `Attachment.ts#requestUploadUrl`. */
export const submitJustification = Effect.fn("Justification.submitJustification")(function*(
  rawSchoolId: string,
  studentEnrollmentId: string,
  key: string,
  reasonCodeId: string,
  comment: string | null,
  attachmentId: string | null,
  submittedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canRecordJustification,
    "submit-justification",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const [row] = yield* sql`
          INSERT INTO justifications
            (school_id, student_enrollment_id, key, reason_code_id, comment, attachment_id, submitted_by_person_id)
          VALUES (
            ${schoolId}, ${studentEnrollmentId}, ${key}, ${reasonCodeId}, ${comment}, ${attachmentId}, ${submittedByPersonId}
          )
          RETURNING *
        `
        return yield* Schema.decodeUnknownEffect(Justification)(row)
      })
    )
  )
})

/** The front-desk/parent justification validation queue (SCR-ZS-054, ticket #103's own acceptance criterion) — every `submitted`, undecided `Justification`, oldest first. */
export const findPendingJustifications = Effect.fn("Justification.findPendingJustifications")(function*(
  rawSchoolId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canValidateJustification,
    "validate-justification",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        return yield* SqlSchema.findAll({
          Request: Schema.Struct({ schoolId: Schema.String }),
          Result: Justification,
          execute: (req) =>
            sql`SELECT * FROM justifications WHERE school_id = ${req.schoolId} AND status = 'submitted' ORDER BY created_at ASC`
        })({ schoolId })
      })
    )
  )
})

const decideJustification = Effect.fn("Justification.decideJustification")(function*(
  schoolId: SchoolId,
  justificationId: string,
  decidedByPersonId: string,
  outcome: "validated" | "refused",
  refusalReason: string | null
) {
  const sql = yield* SqlClient
  const justification = yield* requireOwnedRow(
    sql,
    "justifications",
    "justification",
    justificationId,
    schoolId,
    Schema.Struct({ status: Schema.String }),
    "status"
  )
  if (justification.status !== "submitted") {
    return yield* Effect.fail(new JustificationNotSubmittedError({ justificationId }))
  }
  yield* sql`
    UPDATE justifications
    SET status = ${outcome}, refusal_reason = ${refusalReason}, decided_by_person_id = ${decidedByPersonId}, decided_at = now()
    WHERE id = ${justificationId}
  `
})

/** Student-life only (`canValidateJustification` — ticket #94's own policy: front-office may record intake but never validate). */
export const validateJustification = Effect.fn("Justification.validateJustification")(function*(
  rawSchoolId: string,
  justificationId: string,
  decidedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canValidateJustification,
    "validate-justification",
    schoolId,
    withSchool(schoolId, decideJustification(schoolId, justificationId, decidedByPersonId, "validated", null))
  )
})

export const refuseJustification = Effect.fn("Justification.refuseJustification")(function*(
  rawSchoolId: string,
  justificationId: string,
  refusalReason: string,
  decidedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canValidateJustification,
    "validate-justification",
    schoolId,
    withSchool(schoolId, decideJustification(schoolId, justificationId, decidedByPersonId, "refused", refusalReason))
  )
})
