import * as Qadi from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { writeAuditLog } from "./AuditLog.ts"
import { canProposeConductGrade, canValidateConductGrade } from "./authorization/Policies.ts"
import { ConductGradeId, SchoolId } from "./Ids.ts"
import { authorizeWith, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"
import { findActiveAssignedTeacherPersonIdsForClass } from "./TeacherAssignment.ts"

/**
 * `Model.Class` for `conduct_grades` (migration 0036, ticket #110 —
 * BEH-ZS-098, resolving Attendance's #90). Mirrors `Discipline.ts`'s
 * `SuspensionProposal` propose/decide shape (migration 0029):
 * `proposed_by_person_id` always set, `validated_by_person_id` set only
 * once approved. On the class's own section `GradingScale`, not a separate
 * conduct scale — no new grading-scale concept the spec doesn't clearly
 * call for.
 */
export class ConductGrade extends Model.Class<ConductGrade>("ConductGrade")({
  id: Model.Field({ select: ConductGradeId, update: ConductGradeId, json: ConductGradeId, jsonUpdate: ConductGradeId }),
  school_id: SchoolId,
  enrollment_id: Schema.String,
  evaluation_period_id: Schema.String,
  value: Schema.NumberFromString,
  status: Schema.Literals(["proposed", "validated"]),
  proposed_by_person_id: Schema.String,
  validated_by_person_id: Schema.NullOr(Schema.String),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  validated_at: Schema.NullOr(Schema.DateTimeUtcFromMillis)
}) {}

class NoClassForEnrollmentError extends Schema.TaggedError<NoClassForEnrollmentError>()("NoClassForEnrollmentError", {
  enrollmentId: Schema.String
}) {}

/** Checked before ever reaching SQL, same "check first" idiom as everywhere else in this codebase — `conduct_grades.value`'s DB `CHECK (value >= 0 AND value <= 20)` (migration 0036) is a backstop, not the primary guard. */
export class InvalidConductGradeValueError
  extends Schema.TaggedError<InvalidConductGradeValueError>()("InvalidConductGradeValueError", { value: Schema.Number })
{}

const assertValidConductGradeValue = Effect.fn("ConductGrade.assertValidConductGradeValue")(function*(value: number) {
  if (value < 0 || value > 20) {
    return yield* new InvalidConductGradeValueError({ value })
  }
})

/**
 * BEH-ZS-098: proposed by any teacher actively assigned to the enrollment's
 * class (no "homeroom teacher" concept exists in this codebase yet — see
 * `TeacherAssignment.ts#findActiveAssignedTeacherPersonIdsForClass`'s own
 * doc comment). Idempotent on `UNIQUE (enrollment_id, evaluation_period_id)`
 * the same "insert, catch the unique violation" idiom
 * `TeacherAssignment.ts#assignTeacherToCourse` already uses — a second
 * proposal for an already-proposed-or-validated period is refused rather
 * than silently overwriting one a validator may already be reviewing.
 */
export class ConductGradeAlreadyExistsError
  extends Schema.TaggedError<ConductGradeAlreadyExistsError>()("ConductGradeAlreadyExistsError", {
    enrollmentId: Schema.String,
    evaluationPeriodId: Schema.String
  })
{}

export const proposeConductGrade = Effect.fn("ConductGrade.proposeConductGrade")(function*(
  rawSchoolId: string,
  enrollmentId: string,
  evaluationPeriodId: string,
  value: number,
  proposedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  yield* assertValidConductGradeValue(value)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient

      const enrollmentRows = yield* sql<{ class_id: string }>`
        SELECT class_id FROM enrollments WHERE id = ${enrollmentId} AND school_id = ${schoolId}
      `
      const enrollment = enrollmentRows[0]
      if (enrollment === undefined) {
        return yield* new NoClassForEnrollmentError({ enrollmentId })
      }

      yield* requireOwnedRow(
        sql,
        "evaluation_periods",
        "evaluation_period",
        evaluationPeriodId,
        schoolId,
        RowWithId
      )

      const assignedTeacherPersonIds = yield* findActiveAssignedTeacherPersonIdsForClass(enrollment.class_id)
      yield* Qadi.assert(canProposeConductGrade, {
        resource: {
          school_id: schoolId,
          assigned_teacher_person_ids: assignedTeacherPersonIds,
          substitute_teacher_person_id: null
        },
        action: "propose-conduct-grade"
      })

      const [conductGrade] = yield* sql<{ id: string }>`
        INSERT INTO conduct_grades (school_id, enrollment_id, evaluation_period_id, value, proposed_by_person_id)
        VALUES (${schoolId}, ${enrollmentId}, ${evaluationPeriodId}, ${value}, ${proposedByPersonId})
        ON CONFLICT (enrollment_id, evaluation_period_id) DO NOTHING
        RETURNING id
      `
      if (conductGrade === undefined) {
        return yield* new ConductGradeAlreadyExistsError({ enrollmentId, evaluationPeriodId })
      }
      // BEH-ZS-098: "MUST be logged per period" — every entry, not just the validated decision.
      yield* writeAuditLog(
        schoolId,
        proposedByPersonId,
        "propose_conduct_grade",
        "conduct_grade",
        conductGrade.id,
        null,
        { value }
      )
      return conductGrade.id
    })
  )
})

/**
 * BEH-ZS-098: validated by student-life or the director (`canValidateConductGrade`
 * — the same `canManageDiscipline` check, per configuration). The validator
 * may adjust `value` before locking it in; omitting it keeps the proposed
 * value.
 */
export const validateConductGrade = Effect.fn("ConductGrade.validateConductGrade")(function*(
  rawSchoolId: string,
  conductGradeId: string,
  // `null` and `undefined` are treated identically ("keep the proposed
  // value") — a future JSON-decoded caller may send either for "omitted",
  // and `Schema.NullOr` is this codebase's own convention for that
  // elsewhere in this same file (`validated_by_person_id`).
  value: number | null | undefined,
  validatedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  if (value !== null && value !== undefined) {
    yield* assertValidConductGradeValue(value)
  }
  return yield* authorizeWith(
    canValidateConductGrade,
    "validate-conduct-grade",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient

        const rows = yield* sql<{ id: string; value: string }>`
          SELECT id, value::text AS value FROM conduct_grades
          WHERE id = ${conductGradeId} AND school_id = ${schoolId} AND status = 'proposed'
        `
        const before = rows[0]
        if (before === undefined) {
          return yield* new EntityNotFoundError({ entityType: "conduct_grade", entityId: conductGradeId })
        }

        if (value !== null && value !== undefined) {
          yield* sql`
            UPDATE conduct_grades
            SET status = 'validated', validated_by_person_id = ${validatedByPersonId}, validated_at = now(), value = ${value}
            WHERE id = ${conductGradeId}
          `
        } else {
          yield* sql`
            UPDATE conduct_grades
            SET status = 'validated', validated_by_person_id = ${validatedByPersonId}, validated_at = now()
            WHERE id = ${conductGradeId}
          `
        }

        yield* writeAuditLog(
          schoolId,
          validatedByPersonId,
          "validate_conduct_grade",
          "conduct_grade",
          conductGradeId,
          { value: Number(before.value) },
          { value: value ?? Number(before.value) }
        )
      })
    )
  )
})
