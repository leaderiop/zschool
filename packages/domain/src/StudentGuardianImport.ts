import type { EvaluationServices } from "@qadi/core/Evaluate"
import type { EnforcementError } from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { insertEnrollment } from "./Enrollment.ts"
import {
  attachGuardianProfile,
  attachStudentProfile,
  createPerson,
  E164_PATTERN,
  findGuardianMatch,
  findPersonMatches,
  type GuardianQualities,
  isValidE164,
  recordGuardianRelationship
} from "./Identity.ts"
import { GuardianPersonId, SchoolId, StudentPersonId } from "./Ids.ts"
import { authorized } from "./Ownership.ts"

/**
 * Ticket #9 / issue #13: extends the onboarding-import pipeline (#8's
 * `ClassImportAnalysis.ts`) to the guardians and students domains. Assumes
 * classes already exist in this school (user story 11) — creating them is
 * #8's job, on the same workbook but a separate sheet/step; this pipeline
 * only resolves a student row's target class by (level, track, label), it
 * never creates one.
 */

export interface GuardianImportRow {
  readonly rowId: string
  readonly firstName: string
  readonly lastName: string
  readonly dateOfBirth: string
  readonly mobileNumber: string
  /** A prior analyze pass's proposed phone-number match, explicitly confirmed by the caller — never inferred (ADR-ZS-050: "offered, never auto-attached"). */
  readonly confirmedMatchPersonId?: string
}

export type GuardianRowResult =
  | { readonly rowId: string; readonly status: "creatable" }
  | { readonly rowId: string; readonly status: "phone_match_proposed"; readonly personId: string }
  | { readonly rowId: string; readonly status: "weak_match_alert"; readonly personId: string }
  | { readonly rowId: string; readonly status: "error"; readonly reason: string }

/**
 * Validates the shape of a guardian row before any matching runs — non-empty
 * name/DOB, a mobile number in the same E.164 shape `isValidE164` enforces
 * elsewhere. Kept as a standalone, DB-free function (same pattern as
 * `ClassImportAnalysis.ts`'s `decodeClassImportRow`) so this boundary is
 * unit-testable without a `SqlClient`.
 */
const GuardianImportRowSchema = Schema.Struct({
  rowId: Schema.NonEmptyString,
  firstName: Schema.NonEmptyString,
  lastName: Schema.NonEmptyString,
  dateOfBirth: Schema.NonEmptyString,
  mobileNumber: Schema.String.check(Schema.isPattern(E164_PATTERN, { expected: "an E.164 mobile number" })),
  confirmedMatchPersonId: Schema.optional(Schema.String)
})

export const decodeGuardianImportRow = (row: GuardianImportRow): Result.Result<GuardianImportRow, Schema.SchemaError> =>
  Schema.decodeResult(GuardianImportRowSchema)(row)

/** Analyze-only, read-only — no DB writes, same contract as #8's `analyzeClassImport`. */
export const analyzeGuardianRows = Effect.fn("StudentGuardianImport.analyzeGuardianRows")(function*(
  rows: ReadonlyArray<GuardianImportRow>
): Effect.fn.Return<ReadonlyArray<GuardianRowResult>, Schema.SchemaError | SqlError, SqlClient> {
  const results: Array<GuardianRowResult> = []
  for (const row of rows) {
    const decoded = decodeGuardianImportRow(row)
    if (Result.isFailure(decoded)) {
      results.push({ rowId: row.rowId, status: "error", reason: decoded.failure.message })
      continue
    }
    const phoneMatch = yield* findGuardianMatch(row.mobileNumber)
    if (phoneMatch !== undefined) {
      results.push({ rowId: row.rowId, status: "phone_match_proposed", personId: phoneMatch.personId })
      continue
    }
    const nameMatches = yield* findPersonMatches(undefined, row.firstName, row.lastName, row.dateOfBirth)
    const weak = nameMatches.find((m) => m.matchKind === "weak")
    results.push(
      weak === undefined
        ? { rowId: row.rowId, status: "creatable" }
        : { rowId: row.rowId, status: "weak_match_alert", personId: weak.personId }
    )
  }
  return results
})

export interface StudentImportRow {
  readonly rowId: string
  readonly firstName: string
  readonly lastName: string
  readonly dateOfBirth: string
  readonly massarCode?: string
  readonly levelCode: string
  readonly trackCode?: string
  readonly classLabel: string
  readonly effectiveDate: string
  readonly guardians: ReadonlyArray<{ readonly mobileNumber: string; readonly qualities: GuardianQualities }>
  /** A prior analyze pass's proposed Massar-code match, explicitly confirmed by the caller — never inferred (acceptance criterion 1: "proposed, never auto-linked"). */
  readonly confirmedMatchPersonId?: string
}

const GuardianQualitiesSchema = Schema.Struct({
  relationshipType: Schema.Literals(["mother", "father", "guardian", "other"]),
  isLegalGuardian: Schema.Boolean,
  isFinancialGuardian: Schema.Boolean,
  isCustodialGuardian: Schema.Boolean,
  isEmergencyContact: Schema.Boolean,
  isAuthorizedForPickup: Schema.Boolean
})

/** Same reasoning as `GuardianImportRowSchema` above, for a student row's own required fields plus its embedded guardian entries. */
const StudentImportRowSchema = Schema.Struct({
  rowId: Schema.NonEmptyString,
  firstName: Schema.NonEmptyString,
  lastName: Schema.NonEmptyString,
  dateOfBirth: Schema.NonEmptyString,
  massarCode: Schema.optional(Schema.String),
  levelCode: Schema.NonEmptyString,
  trackCode: Schema.optional(Schema.String),
  classLabel: Schema.NonEmptyString,
  effectiveDate: Schema.NonEmptyString,
  guardians: Schema.Array(
    Schema.Struct({
      mobileNumber: Schema.String.check(Schema.isPattern(E164_PATTERN, { expected: "an E.164 mobile number" })),
      qualities: GuardianQualitiesSchema
    })
  ),
  confirmedMatchPersonId: Schema.optional(Schema.String)
})

export const decodeStudentImportRow = (row: StudentImportRow): Result.Result<StudentImportRow, Schema.SchemaError> =>
  Schema.decodeResult(StudentImportRowSchema)(row)

export type StudentRowResult =
  | {
    readonly rowId: string
    readonly status: "active" | "pre_enrolled"
    readonly studentPersonId: string
    readonly enrollmentId: string
  }
  | { readonly rowId: string; readonly status: "awaiting_confirmation"; readonly proposedPersonId: string }
  | { readonly rowId: string; readonly status: "error"; readonly reason: string }

interface ResolvedClass {
  readonly id: string
}

const resolveClass = Effect.fn("StudentGuardianImport.resolveClass")(function*(
  sql: SqlClient,
  schoolId: string,
  levelCode: string,
  trackCode: string | undefined,
  classLabel: string
): Effect.fn.Return<ResolvedClass | undefined, SqlError> {
  const [level] = yield* sql<
    { id: string }
  >`SELECT id FROM levels WHERE school_id = ${schoolId} AND code = ${levelCode}`
  if (level === undefined) return undefined

  let trackId: string | null = null
  if (trackCode !== undefined) {
    const [track] = yield* sql<{ id: string }>`
      SELECT id FROM tracks WHERE school_id = ${schoolId} AND level_id = ${level.id} AND code = ${trackCode}
    `
    if (track === undefined) return undefined
    trackId = track.id
  }

  const [cls] = yield* sql<{ id: string }>`
    SELECT id FROM classes
    WHERE school_id = ${schoolId} AND level_id = ${level.id} AND label = ${classLabel}
      AND track_id IS NOT DISTINCT FROM ${trackId}
  `
  return cls === undefined ? undefined : { id: cls.id }
})

export type StudentAnalysisResult =
  | { readonly rowId: string; readonly status: "creatable" }
  | { readonly rowId: string; readonly status: "strong_match_awaiting_confirmation"; readonly personId: string }
  | { readonly rowId: string; readonly status: "weak_match_alert"; readonly personId: string }
  | { readonly rowId: string; readonly status: "error"; readonly reason: string }

/** Analyze-only, read-only. `schoolId` is only used to resolve the target class — `persons` matching is platform-wide by design (ADR-ZS-108). */
export const analyzeStudentRows = Effect.fn("StudentGuardianImport.analyzeStudentRows")(function*(
  schoolId: string,
  rows: ReadonlyArray<StudentImportRow>
): Effect.fn.Return<ReadonlyArray<StudentAnalysisResult>, Schema.SchemaError | SqlError, SqlClient> {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const results: Array<StudentAnalysisResult> = []
      for (const row of rows) {
        const decoded = decodeStudentImportRow(row)
        if (Result.isFailure(decoded)) {
          results.push({ rowId: row.rowId, status: "error", reason: decoded.failure.message })
          continue
        }
        const resolved = yield* resolveClass(sql, schoolId, row.levelCode, row.trackCode, row.classLabel)
        if (resolved === undefined) {
          results.push({
            rowId: row.rowId,
            status: "error",
            reason: `No class "${row.classLabel}" under level ${row.levelCode}`
          })
          continue
        }
        const matches = yield* findPersonMatches(row.massarCode, row.firstName, row.lastName, row.dateOfBirth)
        const strong = matches.find((m) => m.matchKind === "strong")
        if (strong !== undefined) {
          results.push({ rowId: row.rowId, status: "strong_match_awaiting_confirmation", personId: strong.personId })
          continue
        }
        const weak = matches.find((m) => m.matchKind === "weak")
        results.push(
          weak === undefined
            ? { rowId: row.rowId, status: "creatable" }
            : { rowId: row.rowId, status: "weak_match_alert", personId: weak.personId }
        )
      }
      return results
    })
  )
})

export interface CommitImportBatchInput {
  readonly schoolId: string
  readonly academicYearId: string
  readonly guardianRows: ReadonlyArray<GuardianImportRow>
  readonly studentRows: ReadonlyArray<StudentImportRow>
}

export type GuardianCommitResult =
  | { readonly status: "committed"; readonly personId: string }
  | { readonly status: "error"; readonly reason: string }

export interface ImportBatchResult {
  readonly guardianResults: ReadonlyMap<string, GuardianCommitResult>
  readonly studentResults: ReadonlyArray<StudentRowResult>
}

/**
 * The dependency-ordered commit (user stories 12-14, 19): guardians first
 * (deduplicated by mobile number within this call, each committed once even
 * when several student rows share one), then students, each as its own
 * per-student unit — one student row's error never rolls back another's
 * already-committed work, so a retry can resend only the rows that failed
 * (`studentRows` narrowed to those) without re-processing guardians or
 * classes that already succeeded.
 *
 * Both matching functions are re-called here even though the caller likely
 * already ran `analyzeGuardianRows`/`analyzeStudentRows` — ADR-ZS-106
 * re-validation: a match found at analyze time can go stale by commit time
 * (e.g. another import ran in between).
 */
export const commitImportBatch = Effect.fn("StudentGuardianImport.commitImportBatch")(function*(
  input: CommitImportBatchInput
): Effect.fn.Return<
  ImportBatchResult,
  EnforcementError | Schema.SchemaError | SqlError,
  SqlClient | EvaluationServices
> {
  return yield* authorized(
    SchoolId(input.schoolId),
    withSchool(
      input.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient

        const uniqueGuardianRows = new Map<string, GuardianImportRow>()
        for (const g of input.guardianRows) {
          if (!uniqueGuardianRows.has(g.mobileNumber)) uniqueGuardianRows.set(g.mobileNumber, g)
        }

        // Each row's entire write unit runs inside its own `withTransaction`
        // (a savepoint, nested inside the batch's own transaction from
        // `withSchool` above) before `Effect.result` catches whatever it
        // fails with. Catching in JS alone doesn't help here: Postgres marks
        // the whole underlying transaction aborted after ANY statement
        // error, savepoint or not — without one, a failure in row N (e.g.
        // `createPerson` racing a unique massar_code, or `insertEnrollment`
        // hitting `DuplicateActiveEnrollmentError`) would leave the
        // connection unable to run row N+1 at all, contradicting this
        // function's own "one row's error never rolls back another's
        // already-committed work" guarantee.
        const guardianResults = new Map<string, GuardianCommitResult>()
        for (const g of uniqueGuardianRows.values()) {
          if (!isValidE164(g.mobileNumber)) {
            guardianResults.set(g.mobileNumber, { status: "error", reason: "InvalidMobileNumberError" })
            continue
          }

          const unit = yield* Effect.result(sql.withTransaction(Effect.gen(function*() {
            const phoneMatch = yield* findGuardianMatch(g.mobileNumber)
            const personId = g.confirmedMatchPersonId ?? phoneMatch?.personId ?? (yield* createPerson({
              firstName: g.firstName,
              lastName: g.lastName,
              dateOfBirth: g.dateOfBirth
            }))
            yield* attachGuardianProfile(personId, g.mobileNumber)
            return personId
          })))

          guardianResults.set(
            g.mobileNumber,
            unit._tag === "Failure"
              ? {
                status: "error",
                reason: unit.failure._tag === "SqlError" ? unit.failure.reason._tag : unit.failure._tag
              }
              : { status: "committed", personId: unit.success }
          )
        }

        const studentResults: Array<StudentRowResult> = []
        for (const s of input.studentRows) {
          const resolved = yield* resolveClass(sql, input.schoolId, s.levelCode, s.trackCode, s.classLabel)
          if (resolved === undefined) {
            studentResults.push({
              rowId: s.rowId,
              status: "error",
              reason: `No class "${s.classLabel}" under level ${s.levelCode}`
            })
            continue
          }

          const matches = yield* findPersonMatches(s.massarCode, s.firstName, s.lastName, s.dateOfBirth)
          const strong = matches.find((m) => m.matchKind === "strong")
          if (strong !== undefined && s.confirmedMatchPersonId === undefined) {
            studentResults.push({ rowId: s.rowId, status: "awaiting_confirmation", proposedPersonId: strong.personId })
            continue
          }

          const unit = yield* Effect.result(sql.withTransaction(Effect.gen(function*() {
            const studentPersonId = s.confirmedMatchPersonId ?? strong?.personId ?? (yield* createPerson({
              firstName: s.firstName,
              lastName: s.lastName,
              dateOfBirth: s.dateOfBirth,
              massarCode: s.massarCode
            }))
            yield* attachStudentProfile(studentPersonId)

            let hasLegalGuardian = false
            let hasFinancialGuardian = false
            for (const g of s.guardians) {
              const guardian = guardianResults.get(g.mobileNumber)
              if (guardian === undefined || guardian.status === "error") continue
              yield* recordGuardianRelationship(
                GuardianPersonId(guardian.personId),
                StudentPersonId(studentPersonId),
                g.qualities
              )
              hasLegalGuardian ||= g.qualities.isLegalGuardian
              hasFinancialGuardian ||= g.qualities.isFinancialGuardian
            }

            const enrollment = yield* insertEnrollment({
              schoolId: input.schoolId,
              academicYearId: input.academicYearId,
              studentPersonId,
              classId: resolved.id,
              effectiveDate: s.effectiveDate,
              hasLegalGuardian,
              hasFinancialGuardian
            })
            return { studentPersonId, enrollment }
          })))

          if (unit._tag === "Failure") {
            studentResults.push({
              rowId: s.rowId,
              status: "error",
              reason: unit.failure._tag === "SqlError" ? unit.failure.reason._tag : unit.failure._tag
            })
          } else {
            studentResults.push({
              rowId: s.rowId,
              status: unit.success.enrollment.status,
              studentPersonId: unit.success.studentPersonId,
              enrollmentId: unit.success.enrollment.id
            })
          }
        }

        return { guardianResults, studentResults }
      })
    )
  )
})
