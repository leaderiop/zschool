import { APP_POOL_MAX_CONNECTIONS, withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Match from "effect/Match"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { isSqlError } from "effect/unstable/sql/SqlError"
import { insertEnrollment } from "./Enrollment.ts"
import {
  attachGuardianProfile,
  attachStudentProfile,
  createPerson,
  findGuardianMatch,
  findPersonMatches,
  type GuardianQualities,
  GuardianQualitiesSchema,
  MobileNumber,
  recordGuardianRelationship
} from "./Identity.ts"
import { GuardianPersonId, SchoolId, StudentPersonId } from "./Ids.ts"
import { ImportRowError } from "./ImportRowError.ts"
import { authorized } from "./Ownership.ts"

/**
 * Ticket #9 / issue #13: extends the onboarding-import pipeline (#8's
 * `ClassImportAnalysis.ts`) to the guardians and students domains. Assumes
 * classes already exist in this school (user story 11) — creating them is
 * #8's job, on the same workbook but a separate sheet/step; this pipeline
 * only resolves a student row's target class by (level, track, label), it
 * never creates one.
 */

/**
 * Two different meanings used to share the bare literal `5` (issue #34):
 * pipelining depth on ONE connection (`withSchool` scopes the student
 * matching path to a single connection, not the pool) versus real pool
 * connections held (`analyzeGuardianRows` is platform-wide, unscoped to one
 * connection). Naming them separately keeps the two rationales from
 * silently drifting back into each other the way a past comment already did
 * once.
 */
const IMPORT_ROW_PIPELINE_DEPTH = 5
const GUARDIAN_ANALYZE_POOL_CONCURRENCY = Math.floor(APP_POOL_MAX_CONNECTIONS / 2)

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
  | { readonly rowId: string; readonly status: "error"; readonly error: ImportRowError }

/**
 * Validates the shape of a guardian row before any matching runs — non-empty
 * name/DOB, a mobile number in the same E.164 shape `Identity.ts`'s
 * `MobileNumber` schema enforces everywhere else (issue #34: one shared
 * schema, not two that can drift). Kept as a standalone, DB-free function
 * (same pattern as `ClassImportAnalysis.ts`'s `decodeClassImportRow`) so
 * this boundary is unit-testable without a `SqlClient`.
 */
const GuardianImportRowSchema = Schema.Struct({
  rowId: Schema.NonEmptyString,
  firstName: Schema.NonEmptyString,
  lastName: Schema.NonEmptyString,
  dateOfBirth: Schema.NonEmptyString,
  mobileNumber: MobileNumber,
  confirmedMatchPersonId: Schema.optional(Schema.String)
})

export const decodeGuardianImportRow = (row: GuardianImportRow): Result.Result<GuardianImportRow, Schema.SchemaError> =>
  Schema.decodeResult(GuardianImportRowSchema)(row)

/** A `SqlError`'s own reason tag is more specific than the generic "SqlError" tag; every other tagged failure just uses its own `_tag`. */
const failureReason = (failure: { readonly _tag: string }): string =>
  isSqlError(failure) ? failure.reason._tag : failure._tag

/**
 * The one place a per-row outcome (a matching lookup, a committed
 * transaction) becomes a row result, for every analyze/commit path below —
 * so the failure-to-reason mapping can't drift out of sync between them the
 * way independently hand-walked `unit._tag === "Failure"` branches could.
 */
const mapRowOutcome = <A, B>(
  unit: Result.Result<A, { readonly _tag: string }>,
  onSuccess: (success: A) => B,
  onFailure: (error: ImportRowError) => B
): B =>
  Result.match(unit, {
    onFailure: (failure) => onFailure(new ImportRowError({ reason: failureReason(failure), cause: failure })),
    onSuccess
  })

/**
 * Each row's matching lookups are independent and read-only — bounded
 * concurrency (matching `ClassImportAnalysis.ts`'s precedent) caps how many
 * connections one large import batch can hold from the pool at once.
 * `Effect.forEach` preserves input order regardless of concurrency.
 *
 * The lookups run inside `Effect.result` so a `Schema.SchemaError` (a
 * malformed `find_guardian_by_mobile`/`find_person_matches` row — see
 * Identity.ts) or a transient `SqlError` on one row surfaces as that row's
 * own "error" result instead of failing `Effect.forEach`'s whole batch.
 */
const analyzeGuardianRow = Effect.fn("StudentGuardianImport.analyzeGuardianRow")(function*(
  row: GuardianImportRow
) {
  const decoded = decodeGuardianImportRow(row)
  if (Result.isFailure(decoded)) {
    return {
      rowId: row.rowId,
      status: "error",
      error: new ImportRowError({ reason: decoded.failure.message })
    } as const
  }

  const matched = yield* Effect.result(Effect.gen(function*() {
    const phoneMatch = yield* findGuardianMatch(row.mobileNumber)
    if (Option.isSome(phoneMatch)) {
      return { _tag: "phoneMatch" as const, personId: phoneMatch.value.personId }
    }
    const nameMatches = yield* findPersonMatches(undefined, row.firstName, row.lastName, row.dateOfBirth)
    const weak = nameMatches.find((m) => m.matchKind === "weak")
    return weak === undefined
      ? { _tag: "creatable" as const }
      : { _tag: "weakMatch" as const, personId: weak.personId }
  }))

  return mapRowOutcome(
    matched,
    (outcome): GuardianRowResult =>
      Match.valueTags(outcome, {
        phoneMatch: (m: { readonly personId: string }): GuardianRowResult => ({
          rowId: row.rowId,
          status: "phone_match_proposed",
          personId: m.personId
        }),
        weakMatch: (m: { readonly personId: string }): GuardianRowResult => ({
          rowId: row.rowId,
          status: "weak_match_alert",
          personId: m.personId
        }),
        creatable: (): GuardianRowResult => ({ rowId: row.rowId, status: "creatable" })
      }),
    (error): GuardianRowResult => ({ rowId: row.rowId, status: "error", error })
  )
})

/** Analyze-only, read-only — no DB writes, same contract as #8's `analyzeClassImport`. */
export const analyzeGuardianRows = Effect.fn("StudentGuardianImport.analyzeGuardianRows")(function*(
  rows: ReadonlyArray<GuardianImportRow>
) {
  return yield* Effect.forEach(rows, analyzeGuardianRow, { concurrency: GUARDIAN_ANALYZE_POOL_CONCURRENCY })
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
      mobileNumber: MobileNumber,
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
  | { readonly rowId: string; readonly status: "error"; readonly error: ImportRowError }

/**
 * Requests `SqlClient` from context instead of receiving it as a parameter
 * (issue #34's DI correction) — this and `analyzeStudentRow` below were the
 * codebase's own anti-pattern example: `Identity.ts`'s functions three lines
 * away in the same import already did this correctly. `schoolId` stays a
 * plain parameter — it's data, not a service.
 */
const resolveClass = Effect.fn("StudentGuardianImport.resolveClass")(function*(
  schoolId: string,
  levelCode: string,
  trackCode: string | undefined,
  classLabel: string
) {
  const sql = yield* SqlClient
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
  | { readonly rowId: string; readonly status: "error"; readonly error: ImportRowError }

/**
 * Same DI correction as `resolveClass` above, and the same decode-isolation
 * reasoning as `analyzeGuardianRow`. Unlike that one, every row here shares
 * the single connection `withSchool` opens in `analyzeStudentRows` below
 * (school-scoped matching, not platform-wide) — `IMPORT_ROW_PIPELINE_DEPTH`
 * caps how many queries are in flight on that one connection at once, not
 * how many pool connections are held.
 */
const analyzeStudentRow = Effect.fn("StudentGuardianImport.analyzeStudentRow")(function*(
  schoolId: string,
  row: StudentImportRow
) {
  const decoded = decodeStudentImportRow(row)
  if (Result.isFailure(decoded)) {
    return {
      rowId: row.rowId,
      status: "error",
      error: new ImportRowError({ reason: decoded.failure.message })
    } as const
  }

  const matched = yield* Effect.result(Effect.gen(function*() {
    const resolved = yield* resolveClass(schoolId, row.levelCode, row.trackCode, row.classLabel)
    if (resolved === undefined) {
      return { _tag: "noClass" as const }
    }
    const matches = yield* findPersonMatches(row.massarCode, row.firstName, row.lastName, row.dateOfBirth)
    const strong = matches.find((m) => m.matchKind === "strong")
    if (strong !== undefined) {
      return { _tag: "strongMatch" as const, personId: strong.personId }
    }
    const weak = matches.find((m) => m.matchKind === "weak")
    return weak === undefined
      ? { _tag: "creatable" as const }
      : { _tag: "weakMatch" as const, personId: weak.personId }
  }))

  return mapRowOutcome(
    matched,
    (outcome): StudentAnalysisResult =>
      Match.valueTags(outcome, {
        noClass: (): StudentAnalysisResult => ({
          rowId: row.rowId,
          status: "error",
          error: new ImportRowError({ reason: `No class "${row.classLabel}" under level ${row.levelCode}` })
        }),
        strongMatch: (m: { readonly personId: string }): StudentAnalysisResult => ({
          rowId: row.rowId,
          status: "strong_match_awaiting_confirmation",
          personId: m.personId
        }),
        weakMatch: (m: { readonly personId: string }): StudentAnalysisResult => ({
          rowId: row.rowId,
          status: "weak_match_alert",
          personId: m.personId
        }),
        creatable: (): StudentAnalysisResult => ({ rowId: row.rowId, status: "creatable" })
      }),
    (error): StudentAnalysisResult => ({ rowId: row.rowId, status: "error", error })
  )
})

/** Analyze-only, read-only. `schoolId` is only used to resolve the target class — `persons` matching is platform-wide by design (ADR-ZS-108). */
export const analyzeStudentRows = Effect.fn("StudentGuardianImport.analyzeStudentRows")(function*(
  schoolId: string,
  rows: ReadonlyArray<StudentImportRow>
) {
  return yield* withSchool(
    schoolId,
    Effect.forEach(rows, (row) => analyzeStudentRow(schoolId, row), { concurrency: IMPORT_ROW_PIPELINE_DEPTH })
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
  | { readonly status: "error"; readonly error: ImportRowError }

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
 * Both the row-shape decode and the matching functions are re-run here even
 * though the caller likely already ran
 * `analyzeGuardianRows`/`analyzeStudentRows` — ADR-ZS-106 re-validation: a
 * row shape can be malformed, or a match found at analyze time can go stale,
 * by commit time (e.g. a caller skips straight to commit, or another import
 * ran in between).
 */
export const commitImportBatch = Effect.fn("StudentGuardianImport.commitImportBatch")(function*(
  input: CommitImportBatchInput
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(input.schoolId)
  return yield* authorized(
    schoolId,
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
          const decodedGuardian = decodeGuardianImportRow(g)
          if (Result.isFailure(decodedGuardian)) {
            guardianResults.set(g.mobileNumber, {
              status: "error",
              error: new ImportRowError({ reason: decodedGuardian.failure.message })
            })
            continue
          }

          const unit = yield* Effect.result(sql.withTransaction(Effect.gen(function*() {
            const phoneMatch = yield* findGuardianMatch(g.mobileNumber)
            const personId = g.confirmedMatchPersonId ?? Option.getOrUndefined(phoneMatch)?.personId
              ?? (yield* createPerson({
                firstName: g.firstName,
                lastName: g.lastName,
                dateOfBirth: g.dateOfBirth
              }))
            yield* attachGuardianProfile(personId, g.mobileNumber)
            return personId
          })))

          guardianResults.set(
            g.mobileNumber,
            mapRowOutcome(
              unit,
              (personId): GuardianCommitResult => ({ status: "committed", personId }),
              (error): GuardianCommitResult => ({ status: "error", error })
            )
          )
        }

        // `resolveClass`/`findPersonMatches` run inside the same savepoint as
        // the write below (not before it, the way the analyze-only functions
        // above can afford to) — a `Schema.SchemaError` from a malformed
        // `find_person_matches` row, or any other failure from these reads,
        // must roll back to this row's own savepoint rather than escape the
        // `for` loop and abort `withSchool`'s outer transaction, which would
        // undo every guardian/student already committed for earlier rows.
        const studentResults: Array<StudentRowResult> = []
        for (const s of input.studentRows) {
          const decodedStudent = decodeStudentImportRow(s)
          if (Result.isFailure(decodedStudent)) {
            studentResults.push({
              rowId: s.rowId,
              status: "error",
              error: new ImportRowError({ reason: decodedStudent.failure.message })
            })
            continue
          }

          const unit = yield* Effect.result(sql.withTransaction(Effect.gen(function*() {
            const resolved = yield* resolveClass(input.schoolId, s.levelCode, s.trackCode, s.classLabel)
            if (resolved === undefined) {
              return { _tag: "noClass" as const }
            }

            const matches = yield* findPersonMatches(s.massarCode, s.firstName, s.lastName, s.dateOfBirth)
            const strong = matches.find((m) => m.matchKind === "strong")
            if (strong !== undefined && s.confirmedMatchPersonId === undefined) {
              return { _tag: "awaitingConfirmation" as const, proposedPersonId: strong.personId }
            }

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
                GuardianPersonId.make(guardian.personId),
                StudentPersonId.make(studentPersonId),
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
            return { _tag: "written" as const, studentPersonId, enrollment }
          })))

          studentResults.push(
            mapRowOutcome(
              unit,
              (outcome): StudentRowResult =>
                Match.valueTags(outcome, {
                  noClass: (): StudentRowResult => ({
                    rowId: s.rowId,
                    status: "error",
                    error: new ImportRowError({ reason: `No class "${s.classLabel}" under level ${s.levelCode}` })
                  }),
                  awaitingConfirmation: (o: { readonly proposedPersonId: string }): StudentRowResult => ({
                    rowId: s.rowId,
                    status: "awaiting_confirmation",
                    proposedPersonId: o.proposedPersonId
                  }),
                  written: (
                    o: {
                      readonly studentPersonId: string
                      readonly enrollment: { readonly status: "pre_enrolled" | "active"; readonly id: string }
                    }
                  ): StudentRowResult => ({
                    rowId: s.rowId,
                    status: o.enrollment.status,
                    studentPersonId: o.studentPersonId,
                    enrollmentId: o.enrollment.id
                  })
                }),
              (error): StudentRowResult => ({ rowId: s.rowId, status: "error", error })
            )
          )
        }

        return { guardianResults, studentResults }
      })
    )
  )
})
