import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { canRecordCommendation } from "./authorization/Policies.ts"
import { CommendationId, SchoolId } from "./Ids.ts"
import { authorizeWith } from "./Ownership.ts"

/**
 * `Model.Class` for `commendations` (migration 0030, ticket #106) —
 * `student_person_id` directly, not `student_enrollment_id`: no
 * non-portability restriction applies (ticket #106's own acceptance
 * criterion), so there's no reason to scope it to one enrollment period the
 * way `Incident`/`Sanction` (`Discipline.ts`) are.
 */
export class Commendation extends Model.Class<Commendation>("Commendation")({
  id: Model.Field({
    select: CommendationId,
    update: CommendationId,
    json: CommendationId,
    jsonUpdate: CommendationId
  }),
  school_id: SchoolId,
  student_person_id: Schema.String,
  category: Schema.String,
  description: Schema.String,
  date: Schema.String,
  author_person_id: Schema.String,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

const commendationRepo = SqlModel.makeRepository(Commendation, {
  tableName: "commendations",
  spanPrefix: "Commendation",
  idColumn: "id"
})

/** No investigation step (ticket #106's own acceptance criterion) — a teacher, student-life member, or director records a `Commendation` directly, the exact `canReportIncident` shape (`canRecordCommendation` is a distinct export for the same reason `canArbitrateAttendanceDiscrepancy` is). */
export const recordCommendation = Effect.fn("Commendation.recordCommendation")(function*(
  rawSchoolId: string,
  studentPersonId: string,
  category: string,
  description: string,
  date: string,
  authorPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canRecordCommendation,
    "record-commendation",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const repo = yield* commendationRepo
        return yield* repo.insert({
          school_id: schoolId,
          student_person_id: studentPersonId,
          category,
          description,
          date,
          author_person_id: authorPersonId
        })
      })
    )
  )
})

/**
 * Visible to the student's parent/guardian per their existing rights
 * (ticket #106's own acceptance criterion) — no guardian-portal auth flow
 * exists yet to gate this by (same documented gap as
 * `financialGuardianViewingOwnData`/`Attachment.ts#requestUploadUrl`), so
 * this is the read path such a flow will call once it exists, scoped only
 * by `school_id`/`studentPersonId`, not yet by "is this caller actually that
 * student's guardian."
 */
export const findCommendationsForStudent = Effect.fn("Commendation.findCommendationsForStudent")(function*(
  rawSchoolId: string,
  studentPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String, studentPersonId: Schema.String }),
        Result: Commendation,
        execute: (req) =>
          sql`
            SELECT * FROM commendations
            WHERE school_id = ${req.schoolId} AND student_person_id = ${req.studentPersonId}
            ORDER BY date DESC
          `
      })({ schoolId, studentPersonId })
    })
  )
})
