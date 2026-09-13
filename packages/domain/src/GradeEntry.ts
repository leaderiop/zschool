import { withSchool } from "@zschool/db"
import * as Qadi from "@qadi/core/Qadi"
import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { canEnterGrades } from "./authorization/Policies.ts"
import { failureReason } from "./ImportRowError.ts"
import { AssessmentId, SchoolId } from "./Ids.ts"
import { findActiveAssignedTeacherPersonIds } from "./TeacherAssignment.ts"

/**
 * Ticket #120 (EVA: batch grade entry with offline conflict resolution —
 * resolves wayfinder ticket #108, spec #119). Live, teacher-driven grade
 * entry against the existing `Assessment`/`Mark` shape (`GradeImport.ts`) —
 * deliberately not an `analyze`/`commit` import pair like every
 * `<Domain>Import.ts` module: there's no file to review before commit here,
 * just a teacher's own batch of entries for one assessment they're actively
 * teaching, applied directly.
 *
 * Out of scope, by design (left to later tickets on the EVA map, #107):
 * which assessment types exist and how a live `Assessment` gets created
 * (#109); any average/rank/`PeriodResult` computation (#110); anything
 * about period closing (#112); the actual client that would call this
 * (#117, on hold).
 */

export const GradeMarkerSchema = Schema.Literals(["absent_unjustified", "absent_justified", "exempted"])
export type GradeMarker = typeof GradeMarkerSchema.Type

export interface GradeEntry {
  readonly enrollmentId: string
  /** Normalized to /20 (ADR-ZS-058) — the caller's job, same as `GradeImport.ts#normalizeToTwenty`. */
  readonly value?: number
  readonly marker?: GradeMarker
  readonly remark?: string
  /** Client-side "when the teacher actually entered this" — BEH-ZS-114's own last-write-wins comparison key, never `updated_at` (server write time). */
  readonly enteredAt: string
}

export const GradeEntrySchema = Schema.Struct({
  enrollmentId: Schema.NonEmptyString,
  value: Schema.optional(Schema.Number.check(Schema.isGreaterThanOrEqualTo(0), Schema.isLessThanOrEqualTo(20))),
  marker: Schema.optional(GradeMarkerSchema),
  remark: Schema.optional(Schema.String),
  enteredAt: Schema.NonEmptyString
})

export class InvalidGradeEntryError extends Schema.TaggedError<InvalidGradeEntryError>()("InvalidGradeEntryError", {
  reason: Schema.String
}) {}

export class NoCourseForAssessmentError
  extends Schema.TaggedError<NoCourseForAssessmentError>()("NoCourseForAssessmentError", {
    assessmentId: Schema.String
  })
{}

class NoSuchEnrollmentError extends Schema.TaggedError<NoSuchEnrollmentError>()("NoSuchEnrollmentError", {
  enrollmentId: Schema.String
}) {}

/** The `ON CONFLICT ... WHERE` clause skipped the update — either a newer write already won (`"stale"`), or the Mark is no longer `draft` (`"published"`, guarding against the not-yet-built period-closing/publish flow silently being undone by a later live entry). */
class MarkNotWritableError extends Schema.TaggedError<MarkNotWritableError>()("MarkNotWritableError", {
  reason: Schema.Literals(["stale", "published"])
}) {}

/** Exactly one of `value`/`marker` — the schema alone can't express this, same "decode then refine" split every multi-field row check in this codebase uses (e.g. `AttendanceHistoryImport.ts`'s own `refineAttendanceHistoryImportRow`). */
const refineGradeEntry = (entry: GradeEntry): Result.Result<GradeEntry, InvalidGradeEntryError> => {
  const hasValue = entry.value !== undefined
  const hasMarker = entry.marker !== undefined
  if (hasValue === hasMarker) {
    return Result.fail(new InvalidGradeEntryError({ reason: "Exactly one of value or marker must be set" }))
  }
  return Result.succeed(entry)
}

export const decodeGradeEntry = (
  entry: GradeEntry
): Result.Result<GradeEntry, InvalidGradeEntryError | Schema.SchemaError> =>
  Result.flatMap(
    Schema.decodeResult(GradeEntrySchema)(entry) as Result.Result<GradeEntry, Schema.SchemaError>,
    refineGradeEntry
  )

export type GradeEntryResult =
  | { readonly enrollmentId: string; readonly status: "committed" }
  | { readonly enrollmentId: string; readonly status: "rejected_stale" }
  | { readonly enrollmentId: string; readonly status: "rejected_published" }
  | { readonly enrollmentId: string; readonly status: "invalid"; readonly reason: string }
  | { readonly enrollmentId: string; readonly status: "no_such_enrollment" }
  | { readonly enrollmentId: string; readonly status: "error"; readonly reason: string }

/**
 * `Assessment` carries `(subject_id, class_id)`, not a `course_id` directly
 * (`GradeImport.ts`'s own shape, ticket #11/#15) — resolved here by joining
 * through `SubjectLevelConfigs.ts`'s `subject_level_configs` (a class has at
 * most one course per subject at its own level/track, so narrowing by both
 * the assessment's `class_id` and its subject's `subject_id` picks exactly
 * one `Course`). Not memoized on `Assessment` itself: that's #109's own
 * decision to make when it defines how a live `Assessment` gets created.
 */
const resolveCourseForAssessment = Effect.fn("GradeEntry.resolveCourseForAssessment")(function*(
  schoolId: SchoolId,
  assessmentId: AssessmentId
) {
  const sql = yield* SqlClient
  const rows = yield* sql<{ course_id: string; class_id: string }>`
    SELECT c.id AS course_id, a.class_id AS class_id
    FROM assessments a
    JOIN subject_level_configs slc ON slc.subject_id = a.subject_id
    JOIN courses c ON c.subject_level_config_id = slc.id AND c.class_id = a.class_id
    WHERE a.id = ${assessmentId} AND a.school_id = ${schoolId}
  `
  const row = rows[0]
  if (row === undefined) {
    return yield* Effect.fail(new NoCourseForAssessmentError({ assessmentId }))
  }
  return { courseId: row.course_id, classId: row.class_id }
})

/**
 * Shared by every grade-write function below — resolves the assessment's
 * owning course, its actively-assigned teacher(s), and asserts
 * `canEnterGrades` against them, so a change to the resource shape or the
 * `substitute_teacher_person_id: null` fail-closed convention
 * (`Session.ts#rollCallResourceFor`'s own precedent) only needs updating in
 * one place — the same "factor out the resource-resolution block" precedent
 * `Session.ts` itself already set. Returns the assessment's `classId` since
 * `enterGrades` (not `publishAssessment`) needs it for its own
 * enrollment-class check.
 */
const authorizeGradeWrite = Effect.fn("GradeEntry.authorizeGradeWrite")(function*(
  schoolId: SchoolId,
  assessmentId: AssessmentId,
  action: string
) {
  const { classId, courseId } = yield* resolveCourseForAssessment(schoolId, assessmentId)
  const assignedTeacherPersonIds = yield* findActiveAssignedTeacherPersonIds(courseId)
  yield* Qadi.assert(canEnterGrades, {
    // `substitute_teacher_person_id` has no meaning for grade entry (a
    // `Session`-only, ADR-ZS-046 concept) — set to `null` explicitly,
    // matching `Session.ts#rollCallResourceFor`'s own convention, so the
    // shared policy's second `anyOf` branch fails closed rather than
    // relying on the attribute being merely absent.
    resource: {
      school_id: schoolId,
      assigned_teacher_person_ids: assignedTeacherPersonIds,
      substitute_teacher_person_id: null
    },
    action
  })
  return { classId }
})

/**
 * Batch grade entry for one `Assessment`, gated by `canEnterGrades` (the
 * assessment's actively-assigned teacher only — no director override,
 * `Policies.ts`'s own doc comment on why). Each entry is fully independent —
 * applied in its own transaction, via `Effect.result`, so one invalid,
 * stale, or unexpectedly-erroring entry never aborts or rolls back any
 * other entry already committed earlier in the same batch call (the same
 * "one transaction per row" idiom `AttendanceHistoryImport.ts`'s commit path
 * already uses).
 *
 * Conflict resolution is a single-round-trip compare-and-swap —
 * `INSERT ... ON CONFLICT (assessment_id, enrollment_id) DO UPDATE ...
 * WHERE marks.status = 'draft' AND marks.entered_at < EXCLUDED.entered_at
 * RETURNING id`: when the `WHERE` doesn't hold, Postgres leaves the
 * conflicting row untouched and returns no row, which a follow-up read of
 * that row's own `status` disambiguates into `rejected_stale` (BEH-ZS-114's
 * "alert on overwrite") or `rejected_published` (a live entry may never
 * silently undo a Mark the — not-yet-built — closing/publish flow already
 * finalized). An enrollment id that doesn't resolve to a real, in-school
 * `Enrollment` **belonging to the assessment's own class** is reported
 * `no_such_enrollment` rather than surfacing the underlying foreign-key
 * violation, the same "check first" idiom every other import/write domain
 * in this codebase already follows.
 */
export const enterGrades = Effect.fn("GradeEntry.enterGrades")(function*(
  rawSchoolId: string,
  rawAssessmentId: string,
  entries: ReadonlyArray<GradeEntry>
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const assessmentId = yield* Schema.decodeEffect(AssessmentId)(rawAssessmentId)

  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const { classId } = yield* authorizeGradeWrite(schoolId, assessmentId, "enter-grades")

      const results: Array<GradeEntryResult> = []

      for (const entry of entries) {
        const decoded = decodeGradeEntry(entry)
        if (Result.isFailure(decoded)) {
          const failure = decoded.failure
          const reason = failure._tag === "InvalidGradeEntryError" ? failure.reason : failure.message
          results.push({ enrollmentId: entry.enrollmentId, status: "invalid", reason })
          continue
        }
        const { enrollmentId, enteredAt, marker, remark, value } = decoded.success

        const unit = yield* Effect.result(sql.withTransaction(Effect.gen(function*() {
          const enrollmentRows = yield* sql<{ id: string }>`
            SELECT id FROM enrollments WHERE id = ${enrollmentId} AND school_id = ${schoolId} AND class_id = ${classId}
          `
          if (enrollmentRows.length === 0) {
            return yield* new NoSuchEnrollmentError({ enrollmentId })
          }

          const written = yield* sql<{ id: string }>`
            INSERT INTO marks (school_id, assessment_id, enrollment_id, value, marker, remark, status, entered_at)
            VALUES (
              ${schoolId}, ${assessmentId}, ${enrollmentId}, ${value ?? null}, ${marker ?? null},
              ${remark ?? null}, 'draft', ${enteredAt}::timestamptz
            )
            ON CONFLICT (assessment_id, enrollment_id) DO UPDATE SET
              value = EXCLUDED.value,
              marker = EXCLUDED.marker,
              remark = EXCLUDED.remark,
              entered_at = EXCLUDED.entered_at,
              updated_at = now()
            WHERE marks.status = 'draft' AND marks.entered_at < EXCLUDED.entered_at
            RETURNING id
          `
          if (written.length > 0) return "committed" as const

          const [existing] = yield* sql<{ status: string }>`
            SELECT status FROM marks WHERE assessment_id = ${assessmentId} AND enrollment_id = ${enrollmentId}
          `
          return yield* new MarkNotWritableError({ reason: existing.status === "draft" ? "stale" : "published" })
        })))

        results.push(Result.match(unit, {
          onSuccess: (): GradeEntryResult => ({ enrollmentId, status: "committed" }),
          onFailure: (failure): GradeEntryResult => {
            if (failure._tag === "NoSuchEnrollmentError") return { enrollmentId, status: "no_such_enrollment" }
            if (failure._tag === "MarkNotWritableError") {
              return { enrollmentId, status: failure.reason === "stale" ? "rejected_stale" : "rejected_published" }
            }
            return { enrollmentId, status: "error", reason: failureReason(failure) }
          }
        }))
      }

      return results
    })
  )
})

/**
 * Ticket #121: flips every `Mark` under one `Assessment` from `draft` to
 * `published` in a single statement — the same unit BEH-ZS-129's
 * progressive-publication ticket (#116) and a teacher's "finish entry"
 * action both need. Gated by the exact same `canEnterGrades` policy
 * `enterGrades` uses (no director override — school leadership is
 * read-only on grades). Scoped by `assessment_id` alone, so it never
 * touches a Mark under any other Assessment; scoped by `status = 'draft'`
 * alone, so a second call (or an assessment with zero Marks at all) is a
 * safe no-op rather than an error — there is nothing here for it to fail
 * on. A `published` Mark is never reverted to `draft` by this function.
 */
export const publishAssessment = Effect.fn("GradeEntry.publishAssessment")(function*(
  rawSchoolId: string,
  rawAssessmentId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const assessmentId = yield* Schema.decodeEffect(AssessmentId)(rawAssessmentId)

  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      yield* authorizeGradeWrite(schoolId, assessmentId, "publish-assessment")

      yield* sql`
        UPDATE marks SET status = 'published', updated_at = now()
        WHERE assessment_id = ${assessmentId} AND status = 'draft'
      `
    })
  )
})
