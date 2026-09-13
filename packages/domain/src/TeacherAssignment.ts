import * as Qadi from "@qadi/core/Qadi"
import type { Policy } from "@qadi/core/Policy"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { CourseId, SchoolId, TeacherAssignmentId, TeacherPersonId } from "./Ids.ts"
import { authorized } from "./Ownership.ts"

/**
 * `Model.Class` for `teacher_assignments` (migration 0024, ticket #94) — the
 * `(course, teacher)` link `Courses.ts`'s own comment names as missing since
 * ticket #10. `canTakeRollCall` (`authorization/Policies.ts`) denies a
 * teacher with no *active* (`unassigned_at IS NULL`) row here for the
 * session's course.
 */
export class TeacherAssignment extends Model.Class<TeacherAssignment>("TeacherAssignment")({
  id: Model.Field({
    select: TeacherAssignmentId,
    update: TeacherAssignmentId,
    json: TeacherAssignmentId,
    jsonUpdate: TeacherAssignmentId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  course_id: CourseId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  teacher_person_id: TeacherPersonId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  assigned_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  unassigned_at: Schema.NullOr(Schema.DateTimeUtcFromMillis)
}) {}

const teacherAssignmentRepo = SqlModel.makeRepository(TeacherAssignment, {
  tableName: "teacher_assignments",
  spanPrefix: "TeacherAssignment",
  idColumn: "id"
})

/**
 * Assigns a teacher to a course — idempotent on the partial unique index
 * `(course_id, teacher_person_id) WHERE unassigned_at IS NULL`, same
 * caught-unique-violation idiom as `SchoolMembership.ts`'s
 * `inviteTeacherMembership`. Gated by `canManageAcademicStructure`, the same
 * director-scoped-to-own-school policy every other course-structure write
 * in `Courses.ts` already uses.
 */
export const assignTeacherToCourse = Effect.fn("TeacherAssignment.assignTeacherToCourse")(function*(
  rawSchoolId: string,
  rawCourseId: string,
  rawTeacherPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const courseId = yield* Schema.decodeEffect(CourseId)(rawCourseId)
  const teacherPersonId = yield* Schema.decodeEffect(TeacherPersonId)(rawTeacherPersonId)
  return yield* authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const repo = yield* teacherAssignmentRepo
        yield* sql.withTransaction(
          repo.insertVoid({
            school_id: schoolId,
            course_id: courseId,
            teacher_person_id: teacherPersonId,
            unassigned_at: null
          })
        ).pipe(Effect.catchReason("SqlError", "UniqueViolation", () => Effect.void))
      })
    )
  )
})

/** Closes the active assignment row rather than deleting it — same "close, don't delete" idiom as `Enrollment.ts`'s `closeEnrollment` and `SchoolMembership.ts`'s `unassignMembershipFromCycle`. */
export const deactivateTeacherAssignment = Effect.fn("TeacherAssignment.deactivateTeacherAssignment")(function*(
  rawSchoolId: string,
  rawCourseId: string,
  rawTeacherPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const courseId = yield* Schema.decodeEffect(CourseId)(rawCourseId)
  const teacherPersonId = yield* Schema.decodeEffect(TeacherPersonId)(rawTeacherPersonId)
  return yield* authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`
          UPDATE teacher_assignments
          SET unassigned_at = now()
          WHERE course_id = ${courseId} AND teacher_person_id = ${teacherPersonId} AND unassigned_at IS NULL
        `
      })
    )
  )
})

/**
 * The `person_id`s actively assigned to `courseId` — the resource attribute
 * `canTakeRollCall` checks (`assigned_teacher_person_ids`) is populated from
 * this at the call site, the same "resolve real facts, then re-check the
 * resource-scoped policy" pattern `Ownership.ts`'s own doc comments describe.
 */
export const findActiveAssignedTeacherPersonIds = Effect.fn(
  "TeacherAssignment.findActiveAssignedTeacherPersonIds"
)(function*(courseId: string) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findAll({
    Request: Schema.Struct({ courseId: Schema.String }),
    Result: Schema.Struct({ teacher_person_id: Schema.String }),
    execute: (req) =>
      sql`
        SELECT teacher_person_id FROM teacher_assignments
        WHERE course_id = ${req.courseId} AND unassigned_at IS NULL
      `
  })({ courseId }).pipe(Effect.map((rows) => rows.map((row) => row.teacher_person_id)))
})

/**
 * Ticket #109: the resource-resolution-then-assert shape `GradeEntry.ts`'s
 * `authorizeGradeWrite` and `AssessmentType.ts`'s `createAssessment` both
 * need — resolves `courseId`'s actively-assigned teachers and asserts
 * `policy` against them in one place, so a change to the resource shape or
 * the `substitute_teacher_person_id: null` fail-closed convention
 * (`Session.ts#rollCallResourceFor`'s own precedent) only needs updating
 * here, not in every grade-write call site.
 */
export const assertTeacherAssignedToCourse = Effect.fn("TeacherAssignment.assertTeacherAssignedToCourse")(function*(
  policy: Policy,
  schoolId: SchoolId,
  courseId: string,
  action: string
) {
  const assignedTeacherPersonIds = yield* findActiveAssignedTeacherPersonIds(courseId)
  yield* Qadi.assert(policy, {
    resource: {
      school_id: schoolId,
      assigned_teacher_person_ids: assignedTeacherPersonIds,
      substitute_teacher_person_id: null
    },
    action
  })
})
