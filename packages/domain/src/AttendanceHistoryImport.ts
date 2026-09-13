import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { findEnrollmentByMassarCode } from "./GradeImport.ts"
import { SchoolId } from "./Ids.ts"
import { failureReason, ImportRowError, ImportRowErrorPublicSchema } from "./ImportRowError.ts"
import { authorized } from "./Ownership.ts"

/**
 * Ticket #77 (ADR-ZS-043, split off from #12 once Attendance's domain
 * models existed): the attendance half of mid-year catch-up import —
 * "optionally import aggregated absences by student and period." Same
 * stateless synchronous analyze/commit pair every non-`ImportBatch.ts`
 * import domain uses (`GradeImport.ts`, `FinancialHistoryImport.ts`,
 * `TeacherImport.ts`, `StudentGuardianImport.ts`).
 *
 * A row targets an enrollment already made ACTIVE by the student+guardian
 * import (#9, BEH-ZS-047) the same way `FinancialHistoryImport.ts` does —
 * this module never creates an enrollment, only attaches a historical
 * absence count to one that already exists. "Only offered for a mid-year
 * onboarding flow, not a start-of-year one" (this ticket's own acceptance
 * criterion) is enforced procedurally by whichever flow calls this module,
 * exactly like `FinancialHistoryImport.ts`'s own sibling requirement — this
 * file doesn't re-derive "is this mid-year" from `Enrollment.effective_date`
 * any more than that one does.
 */

export interface AttendanceHistoryImportRow {
  readonly rowId: string
  readonly massarCode: string
  /** A free label identifying the period this count covers (e.g. "September 2020", "Term 1") — this school's own pre-ZSchool records rarely align to a clean calendar month, so no fixed format is imposed. */
  readonly periodLabel: string
  readonly startDate: string
  readonly endDate: string
  readonly absenceCount: number
  readonly tardyCount?: number
}

export const AttendanceHistoryImportRowSchema = Schema.Struct({
  rowId: Schema.NonEmptyString,
  massarCode: Schema.NonEmptyString,
  periodLabel: Schema.NonEmptyString,
  startDate: Schema.NonEmptyString,
  endDate: Schema.NonEmptyString,
  absenceCount: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  tardyCount: Schema.optional(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)))
})

/** Cross-field check the schema alone can't express — same "decode then refine" split `FinancialHistoryImport.ts`'s own row decode keeps free of `Schema.filter` combinators for a multi-field rule. */
const refineAttendanceHistoryImportRow = (
  row: AttendanceHistoryImportRow
): Result.Result<AttendanceHistoryImportRow, ImportRowError> => {
  if (row.endDate < row.startDate) {
    return Result.fail(new ImportRowError({ reason: "endDate must be on or after startDate" }))
  }
  return Result.succeed(row)
}

export const decodeAttendanceHistoryImportRow = (
  row: AttendanceHistoryImportRow
): Result.Result<AttendanceHistoryImportRow, ImportRowError | Schema.SchemaError> =>
  Result.flatMap(
    Schema.decodeResult(AttendanceHistoryImportRowSchema)(row) as Result.Result<
      AttendanceHistoryImportRow,
      Schema.SchemaError
    >,
    refineAttendanceHistoryImportRow
  )

const rowResolvable = Schema.Struct({ rowId: Schema.String, status: Schema.Literal("resolvable") })
export const AttendanceHistoryAnalysisResultSchema = Schema.Union([
  rowResolvable,
  Schema.Struct({ rowId: Schema.String, status: Schema.Literal("error"), error: ImportRowError })
])
export type AttendanceHistoryAnalysisResult = typeof AttendanceHistoryAnalysisResultSchema.Type

/** The `analyzeAttendanceHistoryRows` endpoint's wire contract — see `FinancialHistoryAnalysisResultHttpSchema`'s own doc comment for why the `error` branch differs. */
export const AttendanceHistoryAnalysisResultHttpSchema = Schema.Union([
  rowResolvable,
  Schema.Struct({ rowId: Schema.String, status: Schema.Literal("error"), error: ImportRowErrorPublicSchema })
])

export type AttendanceHistoryRowResult =
  | { readonly rowId: string; readonly status: "committed" }
  | { readonly rowId: string; readonly status: "skipped_already_applied" }
  | { readonly rowId: string; readonly status: "error"; readonly error: ImportRowError }

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

/** Read-only resolution of a row's target enrollment, without writing anything — same non-committal preview every import domain gives before commit. No authorization gate, matching `FinancialHistoryImport.ts`'s own `analyzeFinancialHistoryRow`. */
const analyzeAttendanceHistoryRow = Effect.fn("AttendanceHistoryImport.analyzeAttendanceHistoryRow")(function*(
  schoolId: string,
  academicYearId: string,
  row: AttendanceHistoryImportRow
) {
  const decoded = decodeAttendanceHistoryImportRow(row)
  if (Result.isFailure(decoded)) {
    const failure = decoded.failure
    return {
      rowId: row.rowId,
      status: "error",
      error: failure._tag === "ImportRowError" ? failure : new ImportRowError({ reason: failure.message })
    } as const
  }

  const resolved = yield* Effect.result(Effect.gen(function*() {
    const enrollment = yield* findEnrollmentByMassarCode(schoolId, academicYearId, row.massarCode)
    if (Option.isNone(enrollment)) {
      return yield* Effect.fail(new ImportRowError({ reason: `No enrollment for Massar code "${row.massarCode}"` }))
    }
  }))

  return mapRowOutcome(
    resolved,
    (): AttendanceHistoryAnalysisResult => ({ rowId: row.rowId, status: "resolvable" }),
    (error): AttendanceHistoryAnalysisResult => ({ rowId: row.rowId, status: "error", error })
  )
})

export const analyzeAttendanceHistoryRows = Effect.fn("AttendanceHistoryImport.analyzeAttendanceHistoryRows")(
  function*(
    schoolId: string,
    academicYearId: string,
    rows: ReadonlyArray<AttendanceHistoryImportRow>
  ) {
    return yield* withSchool(
      schoolId,
      Effect.forEach(rows, (row) => analyzeAttendanceHistoryRow(schoolId, academicYearId, row))
    )
  }
)

/**
 * Re-validates each row against current DB state at commit time and inserts
 * its `imported_absence_history` row inside one transaction per row —
 * `(student_enrollment_id, period_label)`'s own unique constraint (migration
 * 0033) makes a retried row a no-op rather than a double-count, the same
 * "insert, catch the unique violation" idempotency idiom used throughout
 * this codebase's import domains.
 */
export const commitAttendanceHistoryImportBatch = Effect.fn(
  "AttendanceHistoryImport.commitAttendanceHistoryImportBatch"
)(function*(
  rawSchoolId: string,
  academicYearId: string,
  rows: ReadonlyArray<AttendanceHistoryImportRow>
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const results: Array<AttendanceHistoryRowResult> = []

        for (const row of rows) {
          const decoded = decodeAttendanceHistoryImportRow(row)
          if (Result.isFailure(decoded)) {
            const failure = decoded.failure
            results.push({
              rowId: row.rowId,
              status: "error",
              error: failure._tag === "ImportRowError" ? failure : new ImportRowError({ reason: failure.message })
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

            return yield* sql`
              INSERT INTO imported_absence_history
                (school_id, student_enrollment_id, period_label, start_date, end_date, absence_count, tardy_count)
              VALUES (
                ${schoolId}, ${enrollment.value.enrollmentId}, ${row.periodLabel}, ${row.startDate}::date,
                ${row.endDate}::date, ${row.absenceCount}, ${row.tardyCount ?? 0}
              )
            `.pipe(
              Effect.as("committed" as const),
              Effect.catchReason("SqlError", "UniqueViolation", () => Effect.succeed("already_applied" as const))
            )
          })))

          results.push(
            mapRowOutcome(
              unit,
              (outcome): AttendanceHistoryRowResult =>
                outcome === "already_applied"
                  ? { rowId: row.rowId, status: "skipped_already_applied" }
                  : { rowId: row.rowId, status: "committed" },
              (error): AttendanceHistoryRowResult => ({ rowId: row.rowId, status: "error", error })
            )
          )
        }

        return results
      })
    )
  )
})

/** The imported history for one enrollment, oldest period first — read-only, no separate authorization gate (same "a school's own director can always read its own data" treatment other historical-import reads get). */
export const findImportedAbsenceHistory = Effect.fn("AttendanceHistoryImport.findImportedAbsenceHistory")(function*(
  schoolId: string,
  studentEnrollmentId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* sql<{
        period_label: string
        start_date: string
        end_date: string
        absence_count: number
        tardy_count: number
      }>`
        SELECT period_label, start_date, end_date, absence_count, tardy_count FROM imported_absence_history
        WHERE student_enrollment_id = ${studentEnrollmentId}
        ORDER BY start_date ASC
      `
    })
  )
})
