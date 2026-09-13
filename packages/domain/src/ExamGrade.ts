import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { CERTIFYING_LEVEL_CODES } from "./AssessmentType.ts"
import { writeAuditLog } from "./AuditLog.ts"
import { canManageExamGrades } from "./authorization/Policies.ts"
import {
  EnrollmentTarget,
  findEnrollmentByMassarCode,
  findEvaluationPeriodByCode,
  findSubjectByCode,
  normalizeToTwenty
} from "./GradeImport.ts"
import { ExamGradeId, SchoolId } from "./Ids.ts"
import { failureReason, ImportRowError } from "./ImportRowError.ts"
import { authorizeWith, requireOwnedRow, RowWithId } from "./Ownership.ts"

/**
 * Ticket #111 (EVA: certifying-exam grades — resolving wayfinder ticket
 * #111). `Model.Class` matching migration 0037's `exam_grades` — a new
 * dedicated entity, not a widened `Assessment`/`Mark`, since BEH-ZS-120's
 * required `session`/`source`/entry-author fields have no home on `Mark`'s
 * shape and an external exam doesn't belong to one class the way a `Mark`
 * does. See the migration's own doc comment for `exam_slot`'s meaning.
 */
export class ExamGrade extends Model.Class<ExamGrade>("ExamGrade")({
  id: Model.Field({ select: ExamGradeId, update: ExamGradeId, json: ExamGradeId, jsonUpdate: ExamGradeId }),
  school_id: SchoolId,
  enrollment_id: Schema.String,
  subject_id: Schema.String,
  evaluation_period_id: Schema.String,
  exam_slot: Schema.Int,
  session: Schema.String,
  value: Schema.NumberFromString,
  source: Schema.Literals(["manual", "import"]),
  entered_by_person_id: Schema.String,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  updated_at: Schema.NullOr(Schema.DateTimeUtcFromMillis)
}) {}

/**
 * Which of `ComputationRule.weight_exam_1`/`weight_exam_2` are true EXTERNAL
 * ministry exams for each certifying level, per BEH-ZS-118's own weighting
 * text: 6AP/3AC's slot 1 is the internal "local unified exam" (an ordinary
 * `counts_as_unified_test` Assessment — `PeriodResult.ts#recomputePeriodResult`
 * falls back to those marks for slot 1 on these two levels); the
 * baccalaureate's slot 1 (regional, end of year 1) is external same as its
 * slot 2 (national, end of year 2). Keyed off `AssessmentType.ts`'s own
 * `CERTIFYING_LEVEL_CODES` rather than a fourth independent level-code list.
 */
export const EXTERNAL_EXAM_SLOTS_BY_LEVEL_CODE: ReadonlyMap<string, ReadonlySet<number>> = new Map([
  ["6AP", new Set([2])],
  ["3AC", new Set([2])],
  ["2BAC", new Set([1, 2])]
])

export class InvalidExamSlotForLevelError
  extends Schema.TaggedError<InvalidExamSlotForLevelError>()("InvalidExamSlotForLevelError", {
    levelCode: Schema.String,
    examSlot: Schema.Int
  })
{}

/** Checked before ever reaching SQL — an external-exam entry for a slot that isn't external for the enrollment's level (e.g. slot 1 on 6AP/3AC, which is the internal unified exam) would otherwise silently miscompute `PeriodResult`. */
const resolveLevelCodeForEnrollment = Effect.fn("ExamGrade.resolveLevelCodeForEnrollment")(function*(
  schoolId: string,
  enrollmentId: string
) {
  const sql = yield* SqlClient
  const rows = yield* sql<{ code: string }>`
    SELECT lv.code FROM enrollments e
    JOIN classes c ON c.id = e.class_id
    JOIN levels lv ON lv.id = c.level_id
    WHERE e.id = ${enrollmentId} AND e.school_id = ${schoolId}
  `
  return rows[0]?.code
})

const assertValidExamSlotForLevel = Effect.fn("ExamGrade.assertValidExamSlotForLevel")(function*(
  schoolId: string,
  enrollmentId: string,
  examSlot: number
) {
  const levelCode = yield* resolveLevelCodeForEnrollment(schoolId, enrollmentId)
  const isExternal = levelCode !== undefined && (EXTERNAL_EXAM_SLOTS_BY_LEVEL_CODE.get(levelCode)?.has(examSlot) ?? false)
  if (!isExternal) {
    return yield* new InvalidExamSlotForLevelError({ levelCode: levelCode ?? "unknown", examSlot })
  }
})

export class InvalidExamGradeValueError
  extends Schema.TaggedError<InvalidExamGradeValueError>()("InvalidExamGradeValueError", { value: Schema.Number })
{}

/**
 * Same "check first" idiom as `ConductGrade.ts#assertValidConductGradeValue`
 * — `exam_grades.value`'s DB `CHECK (value >= 0 AND value <= 20)` (migration
 * 0037) is a backstop, not the primary guard. Checked AFTER
 * `normalizeToTwenty`, matching ADR-ZS-058(b): any scale other than /20 is
 * normalized before it's ever compared or stored. `Number.isFinite` also
 * rejects a degenerate `scale` (e.g. `0`, producing `NaN`/`Infinity`) that
 * `value < 0 || value > 20` alone would silently let through.
 */
const assertValidExamGradeValue = Effect.fn("ExamGrade.assertValidExamGradeValue")(function*(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 20) {
    return yield* new InvalidExamGradeValueError({ value })
  }
})

export class ExamGradeAlreadyExistsError
  extends Schema.TaggedError<ExamGradeAlreadyExistsError>()("ExamGradeAlreadyExistsError", {
    enrollmentId: Schema.String,
    subjectId: Schema.String,
    evaluationPeriodId: Schema.String,
    examSlot: Schema.Int
  })
{}

/**
 * BEH-ZS-120: manual entry, director-gated (`canManageExamGrades`). A second
 * call for the same `(enrollment, subject, period, slot)` is refused unless
 * `allowOverwrite` is set — BEH-ZS-120's "nor overwritten... without
 * validation," the same explicit-confirmation shape
 * `commitExamGradeBatch`'s own `would_overwrite` outcome gives the import
 * path. The insert itself also catches the table's own unique-violation
 * (migration 0037) as a fallback for the race between the existence check
 * above and this write — same "select then insert, catch the violation"
 * idiom `TeacherAssignment.ts#assignTeacherToCourse` already uses.
 */
export const recordExamGrade = Effect.fn("ExamGrade.recordExamGrade")(function*(
  rawSchoolId: string,
  enrollmentId: string,
  subjectId: string,
  evaluationPeriodId: string,
  examSlot: number,
  session: string,
  rawValue: number,
  scale: number | undefined,
  actorPersonId: string,
  allowOverwrite: boolean
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const value = normalizeToTwenty(rawValue, scale ?? 20)
  yield* assertValidExamGradeValue(value)

  return yield* authorizeWith(
    canManageExamGrades,
    "manage-exam-grades",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient

        yield* requireOwnedRow(sql, "enrollments", "enrollment", enrollmentId, schoolId, RowWithId)
        yield* requireOwnedRow(sql, "subjects", "subject", subjectId, schoolId, RowWithId)
        yield* requireOwnedRow(sql, "evaluation_periods", "evaluation_period", evaluationPeriodId, schoolId, RowWithId)
        yield* assertValidExamSlotForLevel(schoolId, enrollmentId, examSlot)

        const existingRows = yield* sql<{ id: string; value: string }>`
          SELECT id, value::text AS value FROM exam_grades
          WHERE enrollment_id = ${enrollmentId} AND subject_id = ${subjectId}
            AND evaluation_period_id = ${evaluationPeriodId} AND exam_slot = ${examSlot}
        `
        const existing = existingRows[0]
        if (existing !== undefined && !allowOverwrite) {
          return yield* new ExamGradeAlreadyExistsError({ enrollmentId, subjectId, evaluationPeriodId, examSlot })
        }

        if (existing !== undefined) {
          yield* sql`
            UPDATE exam_grades
            SET value = ${value}, session = ${session}, source = 'manual',
              entered_by_person_id = ${actorPersonId}, updated_at = now()
            WHERE id = ${existing.id}
          `
          yield* writeAuditLog(
            schoolId,
            actorPersonId,
            "record_exam_grade",
            "exam_grade",
            existing.id,
            { value: Number(existing.value) },
            { value }
          )
          return existing.id
        }

        const [created] = yield* sql<{ id: string }>`
          INSERT INTO exam_grades
            (school_id, enrollment_id, subject_id, evaluation_period_id, exam_slot, session, value, source, entered_by_person_id)
          VALUES (
            ${schoolId}, ${enrollmentId}, ${subjectId}, ${evaluationPeriodId}, ${examSlot}, ${session}, ${value},
            'manual', ${actorPersonId}
          )
          RETURNING id
        `.pipe(
          Effect.catchReason(
            "SqlError",
            "UniqueViolation",
            () => Effect.fail(new ExamGradeAlreadyExistsError({ enrollmentId, subjectId, evaluationPeriodId, examSlot }))
          )
        )
        yield* writeAuditLog(schoolId, actorPersonId, "record_exam_grade", "exam_grade", created.id, null, { value })
        return created.id
      })
    )
  )
})

/** BEH-ZS-121 (ADR-ZS-015): Massar code preferred, falling back to last name, first name and date of birth. */
export const findEnrollmentByNameAndDob = Effect.fn("ExamGrade.findEnrollmentByNameAndDob")(function*(
  schoolId: string,
  academicYearId: string,
  lastName: string,
  firstName: string,
  dateOfBirth: string
) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findOneOption({
    Request: Schema.Struct({
      schoolId: Schema.String,
      academicYearId: Schema.String,
      lastName: Schema.String,
      firstName: Schema.String,
      dateOfBirth: Schema.String
    }),
    Result: EnrollmentTarget,
    execute: (req) =>
      sql`
        SELECT e.id AS enrollment_id, e.class_id FROM enrollments e
        JOIN persons p ON p.id = e.student_person_id
        WHERE e.school_id = ${req.schoolId} AND e.academic_year_id = ${req.academicYearId}
          AND p.last_name = ${req.lastName} AND p.first_name = ${req.firstName} AND p.date_of_birth = ${req.dateOfBirth}
      `
  })({ schoolId, academicYearId, lastName, firstName, dateOfBirth })
})

export interface ExamGradeImportRow {
  readonly rowId: string
  readonly massarCode?: string
  readonly lastName?: string
  readonly firstName?: string
  readonly dateOfBirth?: string
  readonly subjectCode: string
  readonly periodCode: string
  readonly examSlot: number
  readonly session: string
  readonly value: number
  /** The scale the raw `value` was recorded on — defaults to 20 (already normalized). */
  readonly scale?: number
  /** Echoed back from a prior analyze report's `would_overwrite` outcome — commit only replaces an existing grade when this is explicitly set. */
  readonly confirmOverwrite?: boolean
}

/** Massar code first (ADR-ZS-015's preferred key); last name + first name + date of birth otherwise. A row with neither resolves to `Option.none()`, reported as an unmatched-student error by the caller. */
const resolveEnrollment = Effect.fn("ExamGrade.resolveEnrollment")(function*(
  schoolId: string,
  academicYearId: string,
  row: ExamGradeImportRow
) {
  if (row.massarCode !== undefined && row.massarCode !== "") {
    return yield* findEnrollmentByMassarCode(schoolId, academicYearId, row.massarCode)
  }
  if (row.lastName !== undefined && row.firstName !== undefined && row.dateOfBirth !== undefined) {
    return yield* findEnrollmentByNameAndDob(schoolId, academicYearId, row.lastName, row.firstName, row.dateOfBirth)
  }
  return Option.none()
})

export type ExamGradeAnalysisResult =
  | { readonly rowId: string; readonly status: "resolvable" }
  | { readonly rowId: string; readonly status: "would_overwrite"; readonly existingValue: number }
  | { readonly rowId: string; readonly status: "error"; readonly error: ImportRowError }

/** Same shape as `GradeImport.ts`'s own private `mapRowOutcome` — a failure already shaped as an `ImportRowError` (this file's own resolution failures) passes through as-is instead of losing its specific `.reason` to a generic re-wrap. */
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

const resolveExamGradeRow = Effect.fn("ExamGrade.resolveExamGradeRow")(function*(
  schoolId: string,
  academicYearId: string,
  row: ExamGradeImportRow
) {
  const sql = yield* SqlClient

  if (row.examSlot !== 1 && row.examSlot !== 2) {
    return yield* Effect.fail(new ImportRowError({ reason: `Invalid exam_slot "${row.examSlot}" (must be 1 or 2)` }))
  }
  if (!(row.value >= 0)) {
    return yield* Effect.fail(new ImportRowError({ reason: `Invalid value "${row.value}"` }))
  }

  const enrollment = yield* resolveEnrollment(schoolId, academicYearId, row)
  if (Option.isNone(enrollment)) {
    return yield* Effect.fail(
      new ImportRowError({ reason: "No matching student (Massar code, or last name + first name + date of birth)" })
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

  const slotResult = yield* Effect.result(assertValidExamSlotForLevel(schoolId, enrollment.value.enrollmentId, row.examSlot))
  if (Result.isFailure(slotResult)) {
    const slotError = slotResult.failure
    return yield* Effect.fail(
      slotError._tag === "InvalidExamSlotForLevelError"
        ? new ImportRowError({ reason: `Exam slot ${row.examSlot} is not external for level "${slotError.levelCode}"` })
        : new ImportRowError({ reason: failureReason(slotError), cause: slotError })
    )
  }

  const normalizedValue = normalizeToTwenty(row.value, row.scale ?? 20)
  if (!Number.isFinite(normalizedValue) || normalizedValue < 0 || normalizedValue > 20) {
    return yield* Effect.fail(new ImportRowError({ reason: `Normalized value ${normalizedValue} out of range 0-20` }))
  }

  const existingRows = yield* sql<{ id: string; value: string }>`
    SELECT id, value::text AS value FROM exam_grades
    WHERE enrollment_id = ${enrollment.value.enrollmentId} AND subject_id = ${subject.value.id}
      AND evaluation_period_id = ${period.value.id} AND exam_slot = ${row.examSlot}
  `
  const existing = existingRows[0]

  return {
    enrollmentId: enrollment.value.enrollmentId,
    subjectId: subject.value.id,
    evaluationPeriodId: period.value.id,
    normalizedValue,
    existingId: existing?.id ?? null,
    existingValue: existing === undefined ? null : Number(existing.value)
  }
})

/** Analyze-only, read-only: resolves and validates each row (including the overwrite check) without writing anything, mirroring `GradeImport.ts`'s own non-committal analyze pattern. Unlike `commitExamGradeBatch`, this does NOT check for a duplicate target within the batch itself — it reports each row independently so a caller can see every row's own resolution; the batch-level duplicate guard only matters at commit time, when two rows would actually race to write the same row. */
const analyzeExamGradeRow = Effect.fn("ExamGrade.analyzeExamGradeRow")(function*(
  schoolId: string,
  academicYearId: string,
  row: ExamGradeImportRow
) {
  const resolved = yield* Effect.result(resolveExamGradeRow(schoolId, academicYearId, row))
  return mapRowOutcome(
    resolved,
    (r): ExamGradeAnalysisResult =>
      r.existingId !== null
        ? { rowId: row.rowId, status: "would_overwrite", existingValue: r.existingValue ?? 0 }
        : { rowId: row.rowId, status: "resolvable" },
    (error): ExamGradeAnalysisResult => ({ rowId: row.rowId, status: "error", error })
  )
})

export const analyzeExamGradeRows = Effect.fn("ExamGrade.analyzeExamGradeRows")(function*(
  rawSchoolId: string,
  academicYearId: string,
  rows: ReadonlyArray<ExamGradeImportRow>
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageExamGrades,
    "manage-exam-grades",
    schoolId,
    withSchool(schoolId, Effect.forEach(rows, (row) => analyzeExamGradeRow(schoolId, academicYearId, row)))
  )
})

export type ExamGradeRowResult =
  | { readonly rowId: string; readonly status: "committed"; readonly examGradeId: string }
  | { readonly rowId: string; readonly status: "error"; readonly error: ImportRowError }

/**
 * BEH-ZS-121: "all-or-nothing per batch,... no silent partial import."
 * Unlike `GradeImport.ts#commitGradeImportBatch` (each row its own
 * transaction), this runs in two passes: pass 1 re-resolves and validates
 * EVERY row with no writes at all (an unconfirmed `would_overwrite`, or a
 * second row in this same batch targeting the same `(enrollment, subject,
 * period, slot)` as an earlier one, both count as blocking errors here);
 * only if every row comes back clean does pass 2 write them all. The whole
 * function already runs inside one transaction via `withSchool`'s own
 * `sql.withTransaction` wrapping — pass 1 performing no writes at all is
 * what actually makes this all-or-nothing, not the nested
 * `sql.withTransaction` around pass 2 below (that nested one is a harmless
 * savepoint, the same "insert inside an already-open transaction" idiom
 * `GradeImport.ts#findOrCreateImportedAssessment` already uses, not the
 * source of the atomicity guarantee). A unique-violation race during pass 2
 * (e.g. a concurrent write for the same row) fails the whole write
 * transaction; every row is then reported as an error rather than letting
 * the raw `SqlError` escape.
 */
export const commitExamGradeBatch = Effect.fn("ExamGrade.commitExamGradeBatch")(function*(
  rawSchoolId: string,
  academicYearId: string,
  rows: ReadonlyArray<ExamGradeImportRow>,
  actorPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageExamGrades,
    "manage-exam-grades",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient

        type Resolution =
          | {
            readonly row: ExamGradeImportRow
            readonly outcome: "ok"
            readonly enrollmentId: string
            readonly subjectId: string
            readonly evaluationPeriodId: string
            readonly normalizedValue: number
            readonly existingId: string | null
          }
          | { readonly row: ExamGradeImportRow; readonly outcome: "error"; readonly error: ImportRowError }

        const resolutions: Array<Resolution> = []
        const claimedKeys = new Set<string>()
        for (const row of rows) {
          const unit = yield* Effect.result(Effect.gen(function*() {
            const resolved = yield* resolveExamGradeRow(schoolId, academicYearId, row)
            if (resolved.existingId !== null && !row.confirmOverwrite) {
              return yield* Effect.fail(
                new ImportRowError({ reason: "Existing exam grade would be overwritten; confirmOverwrite not set" })
              )
            }
            const key =
              `${resolved.enrollmentId}:${resolved.subjectId}:${resolved.evaluationPeriodId}:${row.examSlot}`
            if (claimedKeys.has(key)) {
              return yield* Effect.fail(
                new ImportRowError({
                  reason: "Duplicate target within this batch (another row already targets the same student/subject/period/slot)"
                })
              )
            }
            claimedKeys.add(key)
            return resolved
          }))

          resolutions.push(
            mapRowOutcome(
              unit,
              (r): Resolution => ({ row, outcome: "ok", ...r }),
              (error): Resolution => ({ row, outcome: "error", error })
            )
          )
        }

        if (resolutions.some((r) => r.outcome === "error")) {
          return resolutions.map((r): ExamGradeRowResult =>
            r.outcome === "error"
              ? { rowId: r.row.rowId, status: "error", error: r.error }
              : {
                rowId: r.row.rowId,
                status: "error",
                error: new ImportRowError({ reason: "Batch aborted: another row in this batch failed validation" })
              }
          )
        }

        const writeResult = yield* Effect.result(sql.withTransaction(Effect.gen(function*() {
          const written: Array<ExamGradeRowResult> = []
          for (const r of resolutions) {
            if (r.outcome !== "ok") continue

            if (r.existingId !== null) {
              yield* sql`
                UPDATE exam_grades
                SET value = ${r.normalizedValue}, session = ${r.row.session}, source = 'import',
                  entered_by_person_id = ${actorPersonId}, updated_at = now()
                WHERE id = ${r.existingId}
              `
              yield* writeAuditLog(
                schoolId,
                actorPersonId,
                "import_exam_grade",
                "exam_grade",
                r.existingId,
                null,
                { value: r.normalizedValue }
              )
              written.push({ rowId: r.row.rowId, status: "committed", examGradeId: r.existingId })
              continue
            }

            const [created] = yield* sql<{ id: string }>`
              INSERT INTO exam_grades
                (school_id, enrollment_id, subject_id, evaluation_period_id, exam_slot, session, value, source, entered_by_person_id)
              VALUES (
                ${schoolId}, ${r.enrollmentId}, ${r.subjectId}, ${r.evaluationPeriodId}, ${r.row.examSlot}, ${r.row.session},
                ${r.normalizedValue}, 'import', ${actorPersonId}
              )
              RETURNING id
            `.pipe(
              Effect.catchReason(
                "SqlError",
                "UniqueViolation",
                () => Effect.fail(new ImportRowError({ reason: "Concurrent write conflict for this row" }))
              )
            )
            yield* writeAuditLog(
              schoolId,
              actorPersonId,
              "import_exam_grade",
              "exam_grade",
              created.id,
              null,
              { value: r.normalizedValue }
            )
            written.push({ rowId: r.row.rowId, status: "committed", examGradeId: created.id })
          }
          return written
        })))

        if (Result.isFailure(writeResult)) {
          return resolutions.map((r): ExamGradeRowResult => ({
            rowId: r.row.rowId,
            status: "error",
            error: new ImportRowError({
              reason: "Batch aborted: a concurrent write conflicted with another row in this batch"
            })
          }))
        }
        return writeResult.success
      })
    )
  )
})
