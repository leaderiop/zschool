import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Match from "effect/Match"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { attachTeacherProfile, createPerson, findPersonMatches } from "./Identity.ts"
import { SchoolId } from "./Ids.ts"
import { failureReason, ImportRowError, ImportRowErrorPublicSchema } from "./ImportRowError.ts"
import { authorized } from "./Ownership.ts"
import { inviteTeacherMembership } from "./SchoolMembership.ts"

/**
 * Ticket #14 (ADR-ZS-111): extends the onboarding-import pipeline to the
 * teachers domain. Reuses the exact same platform-wide Massar/weak-match
 * rules as `StudentGuardianImport.ts`'s student pipeline (ADR-ZS-108) — no
 * new matching mechanism — but never resolves a class (a teacher row
 * references none) and never creates a `TeacherAssignment`: commit only ever
 * produces a `SchoolMembership` in `'invited'` status. Per ADR-ZS-111,
 * teacher rows carry no ordering dependency on the classes/guardians/students
 * phasing (ADR-ZS-110) — this pipeline commits entirely on its own.
 */

export interface TeacherImportRow {
  readonly rowId: string
  readonly firstName: string
  readonly lastName: string
  readonly dateOfBirth: string
  readonly massarCode?: string
  /** A prior analyze pass's proposed Massar-code match, explicitly confirmed by the caller — never inferred (same rule as `StudentImportRow`). */
  readonly confirmedMatchPersonId?: string
}

/** Same reasoning as `StudentImportRowSchema` — a standalone, DB-free shape check reused by both the HTTP endpoint and the commit path's re-validation. */
export const TeacherImportRowSchema = Schema.Struct({
  rowId: Schema.NonEmptyString,
  firstName: Schema.NonEmptyString,
  lastName: Schema.NonEmptyString,
  dateOfBirth: Schema.NonEmptyString,
  massarCode: Schema.optional(Schema.String),
  confirmedMatchPersonId: Schema.optional(Schema.String)
})

export const decodeTeacherImportRow = (row: TeacherImportRow): Result.Result<TeacherImportRow, Schema.SchemaError> =>
  Schema.decodeResult(TeacherImportRowSchema)(row)

const teacherRowCreatable = Schema.Struct({ rowId: Schema.String, status: Schema.Literal("creatable") })
const teacherRowStrongMatchAwaitingConfirmation = Schema.Struct({
  rowId: Schema.String,
  status: Schema.Literal("strong_match_awaiting_confirmation"),
  personId: Schema.String
})
const teacherRowWeakMatchAlert = Schema.Struct({
  rowId: Schema.String,
  status: Schema.Literal("weak_match_alert"),
  personId: Schema.String
})

export const TeacherAnalysisResultSchema = Schema.Union([
  teacherRowCreatable,
  teacherRowStrongMatchAwaitingConfirmation,
  teacherRowWeakMatchAlert,
  Schema.Struct({ rowId: Schema.String, status: Schema.Literal("error"), error: ImportRowError })
])
export type TeacherAnalysisResult = typeof TeacherAnalysisResultSchema.Type

/** The `analyzeTeachers` endpoint's wire contract — see `StudentAnalysisResultHttpSchema`'s doc comment for why the `error` branch differs. */
export const TeacherAnalysisResultHttpSchema = Schema.Union([
  teacherRowCreatable,
  teacherRowStrongMatchAwaitingConfirmation,
  teacherRowWeakMatchAlert,
  Schema.Struct({ rowId: Schema.String, status: Schema.Literal("error"), error: ImportRowErrorPublicSchema })
])

export type TeacherRowResult =
  | { readonly rowId: string; readonly status: "invited"; readonly personId: string }
  | { readonly rowId: string; readonly status: "awaiting_confirmation"; readonly proposedPersonId: string }
  | { readonly rowId: string; readonly status: "error"; readonly error: ImportRowError }

/** Same "one place a per-row outcome becomes a row result" reasoning as `StudentGuardianImport.ts`'s own private `mapRowOutcome`. */
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
 * Analyze-only, read-only, platform-wide (no `schoolId` needed — matching
 * doesn't scope to one school, same as `analyzeGuardianRows`).
 */
const analyzeTeacherRow = Effect.fn("TeacherImport.analyzeTeacherRow")(function*(
  row: TeacherImportRow
) {
  const decoded = decodeTeacherImportRow(row)
  if (Result.isFailure(decoded)) {
    return {
      rowId: row.rowId,
      status: "error",
      error: new ImportRowError({ reason: decoded.failure.message })
    } as const
  }

  const matched = yield* Effect.result(Effect.gen(function*() {
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
    (outcome): TeacherAnalysisResult =>
      Match.valueTags(outcome, {
        strongMatch: (m: { readonly personId: string }): TeacherAnalysisResult => ({
          rowId: row.rowId,
          status: "strong_match_awaiting_confirmation",
          personId: m.personId
        }),
        weakMatch: (m: { readonly personId: string }): TeacherAnalysisResult => ({
          rowId: row.rowId,
          status: "weak_match_alert",
          personId: m.personId
        }),
        creatable: (): TeacherAnalysisResult => ({ rowId: row.rowId, status: "creatable" })
      }),
    (error): TeacherAnalysisResult => ({ rowId: row.rowId, status: "error", error })
  )
})

export const analyzeTeacherRows = Effect.fn("TeacherImport.analyzeTeacherRows")(function*(
  rows: ReadonlyArray<TeacherImportRow>
) {
  return yield* Effect.forEach(rows, analyzeTeacherRow)
})

/**
 * Re-validates every row against current DB state at commit time (ADR-ZS-106
 * — a match found at analyze time can go stale by commit time), matching
 * or creating the teacher's `Person`/`TeacherProfile`, then inviting them
 * to `schoolId` via `SchoolMembership`. No dependency on any other import
 * domain's commit (ADR-ZS-111) — each row is its own retry unit, same
 * per-row-savepoint reasoning as `StudentGuardianImport.ts`'s
 * `commitImportBatch`.
 */
export const commitTeacherImportBatch = Effect.fn("TeacherImport.commitTeacherImportBatch")(function*(
  schoolId: string,
  rows: ReadonlyArray<TeacherImportRow>
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const results: Array<TeacherRowResult> = []

        for (const row of rows) {
          const decoded = decodeTeacherImportRow(row)
          if (Result.isFailure(decoded)) {
            results.push({
              rowId: row.rowId,
              status: "error",
              error: new ImportRowError({ reason: decoded.failure.message })
            })
            continue
          }

          const unit = yield* Effect.result(sql.withTransaction(Effect.gen(function*() {
            const matches = yield* findPersonMatches(row.massarCode, row.firstName, row.lastName, row.dateOfBirth)
            const strong = matches.find((m) => m.matchKind === "strong")
            if (strong !== undefined && row.confirmedMatchPersonId === undefined) {
              return { _tag: "awaitingConfirmation" as const, proposedPersonId: strong.personId }
            }

            const personId = row.confirmedMatchPersonId ?? strong?.personId ?? (yield* createPerson({
              firstName: row.firstName,
              lastName: row.lastName,
              dateOfBirth: row.dateOfBirth,
              massarCode: row.massarCode
            }))
            yield* attachTeacherProfile(personId)
            yield* inviteTeacherMembership(schoolId, personId)
            return { _tag: "invited" as const, personId }
          })))

          results.push(
            mapRowOutcome(
              unit,
              (outcome): TeacherRowResult =>
                Match.valueTags(outcome, {
                  awaitingConfirmation: (o: { readonly proposedPersonId: string }): TeacherRowResult => ({
                    rowId: row.rowId,
                    status: "awaiting_confirmation",
                    proposedPersonId: o.proposedPersonId
                  }),
                  invited: (o: { readonly personId: string }): TeacherRowResult => ({
                    rowId: row.rowId,
                    status: "invited",
                    personId: o.personId
                  })
                }),
              (error): TeacherRowResult => ({ rowId: row.rowId, status: "error", error })
            )
          )
        }

        return results
      })
    )
  )
})
