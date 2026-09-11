import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { SchoolId } from "./Ids.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

export class DuplicateActiveEnrollmentError
  extends Schema.TaggedError<DuplicateActiveEnrollmentError>()("DuplicateActiveEnrollmentError", {
    studentPersonId: Schema.String,
    academicYearLabel: Schema.String
  })
{}

export interface CreateEnrollmentCommand {
  readonly schoolId: string
  readonly academicYearId: string
  readonly studentPersonId: string
  readonly classId: string
  readonly effectiveDate: string
  readonly hasLegalGuardian: boolean
  readonly hasFinancialGuardian: boolean
}

export interface EnrollmentResult {
  readonly id: string
  readonly status: "pre_enrolled" | "active"
}

/**
 * BEH-ZS-047 / ADR-ZS-043: a student whose effective date has passed and who
 * has both guardian types on file is enrolled ACTIVE; otherwise PRE-ENROLLED
 * — never blocks the row, just defers activation.
 *
 * Pure and DB-free by design: computing this from a fresh query against
 * `parent_student_relationships` would hit a real chicken-and-egg problem —
 * that table's RLS only shows rows for a student who already has an
 * `Enrollment` at this school (migration 0008), which for a student's FIRST
 * enrollment doesn't exist yet at the moment this decision needs making. The
 * caller (the import pipeline, which just wrote those relationships itself)
 * already knows the guardian coverage from the rows it processed — passing
 * it in sidesteps the ordering problem entirely rather than working around
 * it with a special-case query.
 */
export const computeEnrollmentStatus = (input: {
  readonly effectiveDate: string
  readonly today: string
  readonly hasLegalGuardian: boolean
  readonly hasFinancialGuardian: boolean
}): "pre_enrolled" | "active" =>
  input.effectiveDate <= input.today && input.hasLegalGuardian && input.hasFinancialGuardian
    ? "active"
    : "pre_enrolled"

/**
 * The core of `createEnrollment`, without its own `authorized`/`withSchool`
 * wrapping — callable from another flow (`StudentGuardianImport.ts`'s
 * per-student commit) that's already inside one, so committing a batch of
 * students doesn't nest a transaction and a `@qadi` check per row. Requires
 * the caller to have already verified `classId` belongs to `schoolId`.
 *
 * INV-ZS-007/058 is enforced by `enrollments_one_active_per_year` (migration
 * 0008) — a unique-violation on that index surfaces here as
 * `DuplicateActiveEnrollmentError`, not a raw `SqlError`.
 */
export const insertEnrollment = Effect.fn("Enrollment.insertEnrollment")(function*(
  command: CreateEnrollmentCommand
) {
  const sql = yield* SqlClient
  const [{ today }] = yield* sql<{ today: string }>`SELECT CURRENT_DATE::text AS today`
  const status = computeEnrollmentStatus({
    effectiveDate: command.effectiveDate,
    today,
    hasLegalGuardian: command.hasLegalGuardian,
    hasFinancialGuardian: command.hasFinancialGuardian
  })

  // academic_year_label is denormalized onto enrollments — see migration
  // 0008's comment on why the uniqueness check can't key on
  // academic_year_id (a per-school row) and still be platform-wide. Also
  // doubles as the only check that academicYearId actually belongs to
  // schoolId — neither this function nor its callers otherwise verify
  // that, and a bare `const [{ label }] = rows` on an empty result would
  // crash with a raw destructuring TypeError instead of a typed error.
  const [academicYear] = yield* sql<{ label: string }>`
      SELECT label FROM academic_years WHERE id = ${command.academicYearId} AND school_id = ${command.schoolId}
    `
  if (academicYear === undefined) {
    return yield* Effect.fail(
      new EntityNotFoundError({ entityType: "academic_year", entityId: command.academicYearId })
    )
  }
  const { label } = academicYear

  // A savepoint (via withTransaction, nested inside the caller's own
  // transaction): catching the unique-violation below doesn't undo
  // Postgres's own "transaction is aborted" state on a plain caught
  // error — this keeps the surrounding transaction usable for whatever
  // the caller (e.g. the next student row in an import batch) does next.
  const [row] = yield* sql.withTransaction(sql<{ id: string }>`
      INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
      VALUES (${command.schoolId}, ${command.academicYearId}, ${label}, ${command.studentPersonId}, ${command.classId}, ${status}, ${command.effectiveDate})
      RETURNING id
    `).pipe(
    Effect.catchReason("SqlError", "UniqueViolation", () =>
      Effect.fail(
        new DuplicateActiveEnrollmentError({
          studentPersonId: command.studentPersonId,
          academicYearLabel: label
        })
      ))
  )
  return { id: row.id, status }
})

export const createEnrollment = Effect.fn("Enrollment.createEnrollment")(function*(
  command: CreateEnrollmentCommand
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(command.schoolId)
  return yield* authorized(
    schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "classes", "class", command.classId, schoolId, RowWithId)
        return yield* insertEnrollment(command)
      })
    )
  )
})

/** Whether `classId` has any enrollment at all — replaces `AcademicTree.ts`'s `hasActiveEnrollments` stub now that `Enrollment` exists (that function's own doc comment named this as the moment to do so). */
export const hasEnrollments = Effect.fn("Enrollment.hasEnrollments")(function*(
  schoolId: string,
  classId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const rows = yield* sql`SELECT 1 FROM enrollments WHERE class_id = ${classId} AND school_id = ${schoolId} LIMIT 1`
      return rows.length > 0
    })
  )
})
