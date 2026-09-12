import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { EvaluationPeriod } from "./Calendar.ts"
import { AssessmentId, MarkId, SchoolId } from "./Ids.ts"
import { failureReason, ImportRowError, ImportRowErrorPublicSchema } from "./ImportRowError.ts"
import { authorized } from "./Ownership.ts"
import { Subject } from "./SubjectLevelConfigs.ts"

/**
 * Ticket #15 (ADR-ZS-113): current-term slice of the grades import domain.
 * Historical (prior-year archive) import is deliberately out of scope here —
 * a separate follow-up ticket, since it needs a new archival-`AcademicYear`
 * creation path (ADR-ZS-112) this ticket doesn't build.
 *
 * A grade row references a student already enrolled at this school for the
 * importing year (acceptance criterion: "no matching Enrollment → error, not
 * silently skipped") — unlike students/guardians/teachers import, this
 * introduces no new cross-tenant identity matching: the student is looked up
 * by Massar code against `persons`/`enrollments` already scoped to the
 * current school under ordinary RLS, the same way any other in-school lookup
 * works.
 */

export class Assessment extends Model.Class<Assessment>("Assessment")({
  id: Model.Field({ select: AssessmentId, update: AssessmentId, json: AssessmentId, jsonUpdate: AssessmentId }),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  evaluation_period_id: Schema.String,
  subject_id: Schema.String,
  class_id: Schema.String,
  type: Schema.Literals(["imported"]),
  // Postgres `numeric` round-trips as a decimal string (avoiding float
  // precision loss) — same reasoning as `GradingScale.max_score`.
  coefficient: Schema.NumberFromString,
  is_import_synthesized: Schema.Boolean,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

export class Mark extends Model.Class<Mark>("Mark")({
  id: Model.Field({ select: MarkId, update: MarkId, json: MarkId, jsonUpdate: MarkId }),
  school_id: SchoolId,
  assessment_id: Schema.String,
  enrollment_id: Schema.String,
  value: Schema.NumberFromString,
  status: Schema.Literals(["draft", "published"]),
  remark: Schema.NullOr(Schema.String),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

const assessmentRepo = SqlModel.makeRepository(Assessment, {
  tableName: "assessments",
  spanPrefix: "GradeImport",
  idColumn: "id"
})
const markRepo = SqlModel.makeRepository(Mark, { tableName: "marks", spanPrefix: "GradeImport", idColumn: "id" })

/** ADR-ZS-058: any scale other than /20 is normalized to /20 before weighting. Only the normalized value is ever persisted — a row's own `scale` is a commit-time input, never stored. */
export const normalizeToTwenty = (value: number, scale: number): number => (value * 20) / scale

const EnrollmentTarget = Schema.Struct({
  enrollmentId: Schema.String,
  classId: Schema.String
}).pipe(Schema.encodeKeys({ enrollmentId: "enrollment_id", classId: "class_id" }))

/**
 * The student must already hold a real `Enrollment` at this school for the
 * importing year — no new matching mechanism (Implementation Decisions):
 * a plain in-school lookup, not `Identity.ts`'s cross-tenant
 * `find_person_matches`. Returns `Option` for the same "may not exist"
 * composability reason as `Identity.ts`'s `findGuardianMatch`.
 */
export const findEnrollmentByMassarCode = Effect.fn("GradeImport.findEnrollmentByMassarCode")(function*(
  schoolId: string,
  academicYearId: string,
  massarCode: string
) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findOneOption({
    Request: Schema.Struct({ schoolId: Schema.String, academicYearId: Schema.String, massarCode: Schema.String }),
    Result: EnrollmentTarget,
    execute: (req) =>
      sql`
        SELECT e.id AS enrollment_id, e.class_id FROM enrollments e
        JOIN persons p ON p.id = e.student_person_id
        WHERE e.school_id = ${req.schoolId} AND e.academic_year_id = ${req.academicYearId}
          AND p.massar_code = ${req.massarCode}
      `
  })({ schoolId, academicYearId, massarCode })
})

/** Same reasoning as `AcademicTree.ts`'s `findLevelByCode` — a plain, decoded lookup, standalone for unit-testability. */
export const findSubjectByCode = Effect.fn("GradeImport.findSubjectByCode")(function*(
  schoolId: string,
  academicYearId: string,
  code: string
) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findOneOption({
    Request: Schema.Struct({ schoolId: Schema.String, academicYearId: Schema.String, code: Schema.String }),
    Result: Subject,
    execute: (req) =>
      sql`
        SELECT * FROM subjects
        WHERE school_id = ${req.schoolId} AND academic_year_id = ${req.academicYearId} AND code = ${req.code}
      `
  })({ schoolId, academicYearId, code })
})

export const findEvaluationPeriodByCode = Effect.fn("GradeImport.findEvaluationPeriodByCode")(function*(
  schoolId: string,
  academicYearId: string,
  code: string
) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findOneOption({
    Request: Schema.Struct({ schoolId: Schema.String, academicYearId: Schema.String, code: Schema.String }),
    Result: EvaluationPeriod,
    execute: (req) =>
      sql`
        SELECT * FROM evaluation_periods
        WHERE school_id = ${req.schoolId} AND academic_year_id = ${req.academicYearId} AND code = ${req.code}
      `
  })({ schoolId, academicYearId, code })
})

/**
 * ADR-ZS-113: one placeholder `Assessment` per (period, subject, class),
 * shared by every student's grade for that same triple — never one per row.
 * Idempotent via the table's own unique index (migration 0012): insert,
 * catch the unique violation, then re-select — same "insert, catch,
 * treat as already-exists" shape as `Identity.ts`'s
 * `attachStudentProfile`/`attachGuardianProfile`, except this needs the
 * winning row's id back (a Mark can't attach to nothing), not just a void
 * success.
 */
export const findOrCreateImportedAssessment = Effect.fn("GradeImport.findOrCreateImportedAssessment")(function*(
  schoolId: string,
  academicYearId: string,
  evaluationPeriodId: string,
  subjectId: string,
  classId: string
) {
  const sql = yield* SqlClient
  const repo = yield* assessmentRepo
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)

  const created = yield* Effect.result(sql.withTransaction(repo.insert({
    school_id: validSchoolId,
    academic_year_id: academicYearId,
    evaluation_period_id: evaluationPeriodId,
    subject_id: subjectId,
    class_id: classId,
    type: "imported",
    coefficient: 1,
    is_import_synthesized: true
  })))

  if (Result.isSuccess(created)) return created.success.id

  const existing = yield* SqlSchema.findOneOption({
    Request: Schema.Struct({
      evaluationPeriodId: Schema.String,
      subjectId: Schema.String,
      classId: Schema.String
    }),
    Result: Assessment,
    execute: (req) =>
      sql`
        SELECT * FROM assessments
        WHERE evaluation_period_id = ${req.evaluationPeriodId} AND subject_id = ${req.subjectId}
          AND class_id = ${req.classId} AND type = 'imported'
      `
  })({ evaluationPeriodId, subjectId, classId })

  return yield* Option.match(existing, {
    onNone: () => Effect.fail(created.failure),
    onSome: (assessment) => Effect.succeed(assessment.id)
  })
})

export interface GradeImportRow {
  readonly rowId: string
  readonly massarCode: string
  readonly subjectCode: string
  readonly periodCode: string
  readonly value: number
  /** The scale the raw `value` was recorded on — defaults to 20 (already normalized, no conversion needed). */
  readonly scale?: number
  readonly remark?: string
}

export const GradeImportRowSchema = Schema.Struct({
  rowId: Schema.NonEmptyString,
  massarCode: Schema.NonEmptyString,
  subjectCode: Schema.NonEmptyString,
  periodCode: Schema.NonEmptyString,
  value: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  scale: Schema.optional(Schema.Number.check(Schema.isGreaterThan(0))),
  remark: Schema.optional(Schema.String)
})

export const decodeGradeImportRow = (row: GradeImportRow): Result.Result<GradeImportRow, Schema.SchemaError> =>
  Schema.decodeResult(GradeImportRowSchema)(row)

const gradeRowResolvable = Schema.Struct({ rowId: Schema.String, status: Schema.Literal("resolvable") })
export const GradeAnalysisResultSchema = Schema.Union([
  gradeRowResolvable,
  Schema.Struct({ rowId: Schema.String, status: Schema.Literal("error"), error: ImportRowError })
])
export type GradeAnalysisResult = typeof GradeAnalysisResultSchema.Type

/** The `analyzeGrades` endpoint's wire contract — see `StudentAnalysisResultHttpSchema`'s doc comment for why the `error` branch differs. */
export const GradeAnalysisResultHttpSchema = Schema.Union([
  gradeRowResolvable,
  Schema.Struct({ rowId: Schema.String, status: Schema.Literal("error"), error: ImportRowErrorPublicSchema })
])

export type GradeRowResult =
  | { readonly rowId: string; readonly status: "committed"; readonly markId: string }
  | { readonly rowId: string; readonly status: "error"; readonly error: ImportRowError }

/**
 * Same shape as `StudentGuardianImport.ts`'s own private `mapRowOutcome`,
 * with one addition: a failure already shaped as an `ImportRowError` (this
 * file's own enrollment/subject/period resolution failures, raised directly
 * rather than through an intermediate custom tag) is passed through as-is
 * instead of being re-wrapped — re-wrapping would collapse its specific
 * `.reason` (e.g. "No subject \"X\"") down to the generic tag name
 * "ImportRowError", losing exactly the detail a caller needs.
 */
const mapRowOutcome = <A, B>(
  unit: Result.Result<A, { readonly _tag: string }>,
  onSuccess: (success: A) => B,
  onFailure: (error: ImportRowError) => B
): B =>
  Result.match(unit, {
    onFailure: (failure) =>
      onFailure(
        failure._tag === "ImportRowError"
          ? failure as ImportRowError
          : new ImportRowError({ reason: failureReason(failure), cause: failure })
      ),
    onSuccess
  })

/**
 * Idempotent on `(assessment_id, enrollment_id)` (the table's own unique
 * index, migration 0012) — same "try insert, catch, re-select" shape as
 * `findOrCreateImportedAssessment` above, extracted so
 * `HistoricalGradeImport.ts`'s commit path shares it rather than
 * reimplementing the same insert-then-fallback-select logic.
 */
export const upsertMark = Effect.fn("GradeImport.upsertMark")(function*(
  schoolId: string,
  assessmentId: string,
  enrollmentId: string,
  value: number,
  remark: string | undefined
) {
  const sql = yield* SqlClient
  const repo = yield* markRepo
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)

  const insertedOrExisting = yield* Effect.result(sql.withTransaction(repo.insert({
    school_id: validSchoolId,
    assessment_id: assessmentId,
    enrollment_id: enrollmentId,
    value,
    status: "draft",
    remark: remark ?? null
  })))

  if (Result.isSuccess(insertedOrExisting)) return insertedOrExisting.success.id

  const existingMark = yield* SqlSchema.findOneOption({
    Request: Schema.Struct({ assessmentId: Schema.String, enrollmentId: Schema.String }),
    Result: Mark,
    execute: (req) =>
      sql`SELECT * FROM marks WHERE assessment_id = ${req.assessmentId} AND enrollment_id = ${req.enrollmentId}`
  })({ assessmentId, enrollmentId })

  return yield* Option.match(existingMark, {
    onNone: () => Effect.fail(insertedOrExisting.failure),
    onSome: (mark) => Effect.succeed(mark.id)
  })
})

/**
 * Analyze-only, read-only: resolves each row's enrollment/subject/period
 * without writing anything, so a director can review before committing
 * (same non-committal-analyze pattern as every other import domain).
 */
const analyzeGradeRow = Effect.fn("GradeImport.analyzeGradeRow")(function*(
  schoolId: string,
  academicYearId: string,
  row: GradeImportRow
) {
  const decoded = decodeGradeImportRow(row)
  if (Result.isFailure(decoded)) {
    return {
      rowId: row.rowId,
      status: "error",
      error: new ImportRowError({ reason: decoded.failure.message })
    } as const
  }

  const resolved = yield* Effect.result(Effect.gen(function*() {
    const enrollment = yield* findEnrollmentByMassarCode(schoolId, academicYearId, row.massarCode)
    if (Option.isNone(enrollment)) {
      return yield* Effect.fail(new ImportRowError({ reason: `No enrollment for Massar code "${row.massarCode}"` }))
    }
    const subject = yield* findSubjectByCode(schoolId, academicYearId, row.subjectCode)
    if (Option.isNone(subject)) {
      return yield* Effect.fail(new ImportRowError({ reason: `No subject "${row.subjectCode}"` }))
    }
    const period = yield* findEvaluationPeriodByCode(schoolId, academicYearId, row.periodCode)
    if (Option.isNone(period)) {
      return yield* Effect.fail(new ImportRowError({ reason: `No evaluation period "${row.periodCode}"` }))
    }
  }))

  return mapRowOutcome(
    resolved,
    (): GradeAnalysisResult => ({ rowId: row.rowId, status: "resolvable" }),
    (error): GradeAnalysisResult => ({ rowId: row.rowId, status: "error", error })
  )
})

export const analyzeGradeRows = Effect.fn("GradeImport.analyzeGradeRows")(function*(
  schoolId: string,
  academicYearId: string,
  rows: ReadonlyArray<GradeImportRow>
) {
  return yield* withSchool(
    schoolId,
    Effect.forEach(rows, (row) => analyzeGradeRow(schoolId, academicYearId, row))
  )
})

/**
 * Re-validates every row against current DB state at commit time (ADR-ZS-106
 * spirit), synthesizes the shared `Assessment` for each (period, subject,
 * class) triple encountered, then upserts each student's `Mark` — a row
 * whose `Mark` already exists (retry, or the same batch committed twice) is
 * left untouched rather than duplicated, per `marks`' own unique index.
 */
export const commitGradeImportBatch = Effect.fn("GradeImport.commitGradeImportBatch")(function*(
  schoolId: string,
  academicYearId: string,
  rows: ReadonlyArray<GradeImportRow>
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const results: Array<GradeRowResult> = []

        for (const row of rows) {
          const decoded = decodeGradeImportRow(row)
          if (Result.isFailure(decoded)) {
            results.push({
              rowId: row.rowId,
              status: "error",
              error: new ImportRowError({ reason: decoded.failure.message })
            })
            continue
          }

          const unit = yield* Effect.result(sql.withTransaction(Effect.gen(function*() {
            const enrollment = yield* findEnrollmentByMassarCode(schoolId, academicYearId, row.massarCode)
            if (Option.isNone(enrollment)) {
              return yield* Effect.fail(
                new ImportRowError({ reason: `No enrollment for Massar code "${row.massarCode}"` })
              )
            }
            const subject = yield* findSubjectByCode(schoolId, academicYearId, row.subjectCode)
            if (Option.isNone(subject)) {
              return yield* Effect.fail(new ImportRowError({ reason: `No subject "${row.subjectCode}"` }))
            }
            const period = yield* findEvaluationPeriodByCode(schoolId, academicYearId, row.periodCode)
            if (Option.isNone(period)) {
              return yield* Effect.fail(new ImportRowError({ reason: `No evaluation period "${row.periodCode}"` }))
            }

            const assessmentId = yield* findOrCreateImportedAssessment(
              schoolId,
              academicYearId,
              period.value.id,
              subject.value.id,
              enrollment.value.classId
            )

            const normalizedValue = normalizeToTwenty(row.value, row.scale ?? 20)
            return yield* upsertMark(schoolId, assessmentId, enrollment.value.enrollmentId, normalizedValue, row.remark)
          })))

          results.push(
            mapRowOutcome(
              unit,
              (markId): GradeRowResult => ({ rowId: row.rowId, status: "committed", markId }),
              (error): GradeRowResult => ({ rowId: row.rowId, status: "error", error })
            )
          )
        }

        return results
      })
    )
  )
})
