import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import { ensureFinancialAccount } from "./FinancialAccount.ts"
import { AcademicYearId, EnrollmentId, SchoolId, StudentPersonId } from "./Ids.ts"
import { academicYearRepo } from "./InstantiateNationalTemplate.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"
import { generatePaymentScheduleForAccount } from "./PaymentSchedule.ts"
import { recomputeSiblingDiscounts } from "./SiblingDiscount.ts"

/**
 * `Model.Class` for `enrollments` (issue #42), matching migration 0008's
 * DDL. Insert-only from this file's perspective (nothing ever updates an
 * `Enrollment` row) — same `FieldExcept`-free reasoning as
 * `SubjectLevelConfigs.ts`'s `Subject`. `id` still needs the custom
 * `Model.Field` variant, not `Model.GeneratedByDb`, purely to satisfy
 * `SqlModel.makeRepository`'s `idColumn` constraint (`ComputationRule.id`'s
 * precedent). `academic_year_id`/`class_id` stay plain `Schema.String`,
 * matching `Course.ts`'s convention of only branding a model's OWN id, not
 * its references into other tables — but `student_person_id` uses the
 * role-specific `StudentPersonId` (predating this ticket), matching
 * `Identity.ts`'s `StudentProfile.person_id` for the identical column shape
 * (a reference to a person acting as a student), not a fresh plain string.
 */
export class Enrollment extends Model.Class<Enrollment>("Enrollment")({
  id: Model.Field({
    select: EnrollmentId,
    update: EnrollmentId,
    json: EnrollmentId,
    jsonUpdate: EnrollmentId
  }),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  academic_year_label: Schema.String,
  student_person_id: StudentPersonId,
  class_id: Schema.String,
  // "completed" (migration 0013) is only ever written by
  // `HistoricalGradeImport.ts`'s synthesized enrollment (ADR-ZS-113); every
  // path in this file still only ever produces "pre_enrolled"/"active".
  // "suspended" (migration 0029, ticket #103, ADR-ZS-057) is only ever
  // written by `Discipline.ts#approveSuspension` — never automatically by a
  // `Sanction` proposing one.
  status: Schema.Literals(["pre_enrolled", "active", "completed", "suspended"]),
  effective_date: Schema.String,
  /** ADR-ZS-065 / ticket #3 acceptance criterion 6 — see migration 0009. */
  capacity_override_reason: Schema.NullOr(Schema.String),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/** Exported so `HistoricalGradeImport.ts` can insert a synthesized `'completed'` enrollment directly, the same way `Enrollment.ts` imports `academicYearRepo` from `InstantiateNationalTemplate.ts` for the identical cross-file reuse reason. */
export const enrollmentRepo = SqlModel.makeRepository(Enrollment, {
  tableName: "enrollments",
  spanPrefix: "Enrollment",
  idColumn: "id"
})

export class DuplicateActiveEnrollmentError
  extends Schema.TaggedError<DuplicateActiveEnrollmentError>()("DuplicateActiveEnrollmentError", {
    studentPersonId: Schema.String,
    academicYearLabel: Schema.String
  })
{}

/**
 * ADR-ZS-065 / ticket #3 acceptance criterion 6: "leadership approval
 * required to exceed" a class's capacity. Raised when `classId` already has
 * `capacity` enrollments (any status — a `pre_enrolled` student still holds
 * a seat) and the caller didn't supply `capacityOverrideReason`; the caller
 * is a director (`authorized` already enforced that to reach this point),
 * so resubmitting with a reason IS the documented approval.
 */
export class CapacityApprovalRequiredError
  extends Schema.TaggedError<CapacityApprovalRequiredError>()("CapacityApprovalRequiredError", {
    classId: Schema.String,
    capacity: Schema.Int,
    currentEnrollmentCount: Schema.Int
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
  /** Required only when the class is already at or over capacity — see `CapacityApprovalRequiredError`. */
  readonly capacityOverrideReason?: string
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

  // ADR-ZS-065 / ticket #3 acceptance criterion 6: every enrollment (any
  // status — a `pre_enrolled` student still occupies a seat) counts against
  // the class's capacity. The caller already verified `classId` belongs to
  // `schoolId` (this function's own doc comment), so `capacity` is only
  // absent here if `classId` itself doesn't exist — a programmer error, not
  // a condition this function needs to report specially.
  const [classRow] = yield* sql<{ capacity: number }>`
    SELECT capacity FROM classes WHERE id = ${command.classId} AND school_id = ${command.schoolId}
  `
  const [{ count }] = yield* sql<{ count: string }>`
    SELECT count(*)::bigint AS count FROM enrollments WHERE class_id = ${command.classId} AND school_id = ${command.schoolId}
  `
  const currentEnrollmentCount = Number(count)
  if (currentEnrollmentCount >= classRow.capacity && command.capacityOverrideReason === undefined) {
    return yield* Effect.fail(
      new CapacityApprovalRequiredError({
        classId: command.classId,
        capacity: classRow.capacity,
        currentEnrollmentCount
      })
    )
  }

  const [{ today }] = yield* sql<{ today: string }>`SELECT CURRENT_DATE::text AS today`
  const status = computeEnrollmentStatus({
    effectiveDate: command.effectiveDate,
    today,
    hasLegalGuardian: command.hasLegalGuardian,
    hasFinancialGuardian: command.hasFinancialGuardian
  })

  // academic_year_label is denormalized onto enrollments — see migration
  // 0008's comment on why the uniqueness check can't key on
  // academic_year_id (a per-school row) and still be platform-wide. Reading
  // it through `InstantiateNationalTemplate.ts`'s own `AcademicYear` model
  // (issue #42) also doubles as the only check that academicYearId actually
  // belongs to schoolId — neither this function nor its callers otherwise
  // verify that. `findById` only filters by `id` (RLS is the sole backstop
  // otherwise) — `school_id` is re-checked explicitly below, per
  // `Ownership.ts`'s own stated invariant that every domain module scopes
  // its lookups by `school_id` explicitly rather than relying solely on RLS.
  const yearRepo = yield* academicYearRepo
  const notFoundYear = () =>
    Effect.fail(new EntityNotFoundError({ entityType: "academic_year", entityId: command.academicYearId }))
  const validAcademicYearId = yield* Schema.decodeEffect(AcademicYearId)(command.academicYearId)
  const academicYear = yield* yearRepo.findById(validAcademicYearId).pipe(
    Effect.catchTag("NoSuchElementError", notFoundYear)
  )
  if (academicYear.school_id !== command.schoolId) {
    return yield* notFoundYear()
  }
  const { label } = academicYear

  const repo = yield* enrollmentRepo
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(command.schoolId)
  const validStudentPersonId = yield* Schema.decodeEffect(StudentPersonId)(command.studentPersonId)
  // A savepoint (via withTransaction, nested inside the caller's own
  // transaction): catching the unique-violation below doesn't undo
  // Postgres's own "transaction is aborted" state on a plain caught
  // error — this keeps the surrounding transaction usable for whatever
  // the caller (e.g. the next student row in an import batch) does next.
  const enrollment = yield* sql.withTransaction(
    repo.insert({
      school_id: validSchoolId,
      academic_year_id: command.academicYearId,
      academic_year_label: label,
      student_person_id: validStudentPersonId,
      class_id: command.classId,
      status,
      effective_date: command.effectiveDate,
      capacity_override_reason: command.capacityOverrideReason ?? null
    })
  ).pipe(
    Effect.catchReason("SqlError", "UniqueViolation", () =>
      Effect.fail(
        new DuplicateActiveEnrollmentError({
          studentPersonId: command.studentPersonId,
          academicYearLabel: label
        })
      ))
  )
  // ticket #56 (BEH-ZS-172/173): every LIVE enrollment created through this
  // path (direct `createEnrollment`, or `StudentGuardianImport.ts`'s
  // per-student commit, which calls this function directly) gets a
  // `FinancialAccount` immediately — never a lazily-created one a caller
  // might forget to trigger. `HistoricalGradeImport.ts`'s synthesized
  // `'completed'` enrollments deliberately go through `enrollmentRepo`
  // directly, not this function, and don't get one: an already-closed
  // archival year has no live financial relationship to track.
  const financialAccountId = yield* ensureFinancialAccount(validSchoolId, enrollment.id)

  // ticket #57 (BEH-ZS-153): best-effort — a school onboarding mid-setup
  // routinely has students enrolling before its director has finished
  // defining fee schedules for every level/track. Missing one is a normal,
  // temporary state, not a reason to refuse the enrollment itself; a
  // director can trigger generation explicitly later via
  // `PaymentSchedule.ts`'s `triggerPaymentScheduleGeneration` once the
  // schedule exists. Reuses the `financialAccountId` just resolved above
  // rather than `generatePaymentSchedule` re-resolving the same account.
  yield* generatePaymentScheduleForAccount(validSchoolId, enrollment.id, financialAccountId).pipe(
    Effect.catchTag("NoFeeScheduleError", () => Effect.void)
  )

  // Ticket #58 (BEH-ZS-154): a newly-ACTIVE enrollment may be the second (or
  // later) sibling to become active at this school this year — best-effort,
  // like the payment-schedule generation just above: a school with no
  // sibling-discount policy configured yet is a normal, temporary state, not
  // a reason to refuse the enrollment. A `pre_enrolled` student never
  // triggers this — nobody's bill changes until they actually activate.
  if (status === "active") {
    yield* recomputeSiblingDiscounts(validSchoolId, command.academicYearId, validStudentPersonId, "sibling_activated")
  }

  // `status` (computed above via `computeEnrollmentStatus`), not
  // `enrollment.status` — the latter now decodes against the Model's own
  // widened `"pre_enrolled" | "active" | "completed"` literal (migration
  // 0013, for `HistoricalGradeImport.ts`'s synthesized enrollments), but
  // this function itself only ever produces the first two; reusing the
  // already-narrower local keeps `EnrollmentResult.status` honest without a
  // cast.
  return { id: enrollment.id, status }
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

export class EnrollmentNotActiveError
  extends Schema.TaggedError<EnrollmentNotActiveError>()("EnrollmentNotActiveError", {
    enrollmentId: Schema.String
  })
{}

/**
 * Ticket #58 (`fr-fin-04-sibling-discount.feature`'s "Youssef's enrollment
 * closes mid-year"): the first mutation in this codebase that ever moves an
 * enrollment out of `'active'` mid-year rather than at year-end archival
 * (`HistoricalGradeImport.ts`'s synthesized `'completed'` rows). Reuses the
 * existing `'completed'` status rather than adding new literals for
 * withdrawn/transferred/expelled — ticket #63 (`BEH-ZS-172`/`173` balance
 * survival) is expected to build on this same transition; distinguishing
 * WHY an enrollment closed, if ever needed beyond the free-text
 * `closure_reason` (migration 0017, mirroring `capacity_override_reason`'s
 * shape), is that ticket's own concern.
 *
 * A raw `UPDATE`, not a typed `repo.update` — `Enrollment` carries no
 * updatable fields at all (every column is `Model.FieldExcept`-free but the
 * class itself is documented insert-only), the same reasoning
 * `Class.ts`'s `deactivateClass` gives for mutating `is_active` directly.
 */
export const closeEnrollment = Effect.fn("Enrollment.closeEnrollment")(function*(
  rawSchoolId: string,
  enrollmentId: string,
  reason: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const enrollment = yield* requireOwnedRow(
          sql,
          "enrollments",
          "enrollment",
          enrollmentId,
          schoolId,
          Schema.Struct({
            status: Schema.String,
            academic_year_id: Schema.String,
            student_person_id: Schema.String
          }),
          "status, academic_year_id, student_person_id"
        )
        if (enrollment.status !== "active") {
          return yield* Effect.fail(new EnrollmentNotActiveError({ enrollmentId }))
        }

        yield* sql`
          UPDATE enrollments SET status = 'completed', closure_reason = ${reason}
          WHERE id = ${enrollmentId} AND school_id = ${schoolId}
        `

        // Best-effort, same reasoning as `insertEnrollment`'s own call: a
        // sibling remaining active loses the discount this closure was
        // funding, or a lone remaining child simply has nothing left to
        // recompute — either way, not a reason to fail the closure itself.
        yield* recomputeSiblingDiscounts(
          schoolId,
          enrollment.academic_year_id,
          enrollment.student_person_id,
          "sibling_closed"
        )
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
