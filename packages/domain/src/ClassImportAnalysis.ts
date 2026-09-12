import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { findClassByLevelAndLabel, findLevelByCode, findTrackByCode, type Level } from "./AcademicTree.ts"
import { SchoolId } from "./Ids.ts"
import { failureReason, ImportRowError } from "./ImportRowError.ts"
import { authorized } from "./Ownership.ts"

/**
 * The synchronous "analyze" half of ticket #8/ADR-ZS-106, for the classes
 * import domain — proven to need no external capability per the ticket's
 * own framing. `ImportBatch.ts` builds the rest of the mechanics
 * (persisting the analysis as an `ImportBatch`, the async SQS-consumed
 * idempotent commit worker with re-validation, partial-commit/
 * retry-only-failed semantics) on top of `analyzeRow` below. This module
 * itself still makes NO database writes; it only classifies rows.
 */

export interface ClassImportRow {
  readonly levelCode: string
  readonly trackCode?: string
  readonly label: string
  readonly capacity: number
}

/**
 * Validates the shape of a row before any DB lookup runs — a positive
 * integer `capacity`, non-empty `levelCode`/`label`. Kept as a standalone,
 * DB-free function (rather than inlined in `analyzeClassImport`'s loop) so
 * this boundary is unit-testable without a `SqlClient`.
 */
export const ClassImportRowSchema = Schema.Struct({
  levelCode: Schema.NonEmptyString,
  trackCode: Schema.optional(Schema.NonEmptyString),
  label: Schema.NonEmptyString,
  capacity: Schema.Int.check(Schema.isGreaterThan(0))
})

export const decodeClassImportRow = (row: ClassImportRow): Result.Result<ClassImportRow, Schema.SchemaError> =>
  Schema.decodeResult(ClassImportRowSchema)(row)

export type ClassImportRowResult =
  // `level` is the freshly re-resolved target level (id + its owning
  // `academic_year_id`) — `ImportBatch.ts`'s commit step needs both to
  // actually create the `Class` row, and re-resolving it a second time
  // there (instead of reusing the lookup this analysis already did) would
  // just be the same query run twice.
  | {
    readonly row: ClassImportRow
    readonly status: "creatable"
    readonly level: Level
    readonly trackId: string | undefined
  }
  | { readonly row: ClassImportRow; readonly status: "duplicate"; readonly reason: string }
  | { readonly row: ClassImportRow; readonly status: "error"; readonly error: ImportRowError }

/**
 * The three lookups go through `AcademicTree.ts`'s shared `Level`/`Track`/
 * `Class`-decoding functions (issue #39) instead of ad hoc `sql<{id:
 * string}>` casts — each pulls `SqlClient` from context itself, so this
 * function no longer needs to (issue #34's DI correction). Hoisted to
 * module scope rather than redeclared inside `analyzeClassImport`'s body on
 * every call; `schoolId` stays a plain parameter throughout — it's ordinary
 * data, not a service.
 *
 * The three sequential lookups run inside `Effect.result` (matching
 * `StudentGuardianImport.ts`'s row analyzers) so a transient `SqlError` or
 * `Schema.SchemaError` on one row surfaces as that row's own error instead
 * of aborting the whole `Effect.forEach` batch.
 *
 * Exported (not just used via `analyzeClassImportRows` above) so
 * `ImportBatch.ts`'s commit-time worker can re-run the exact same check
 * against a single staged row (ADR-ZS-106's re-validation requirement) —
 * one shared definition of "is this row creatable," never a second
 * hand-written copy that could drift from the analyze-time one.
 */
export const analyzeRow = Effect.fn("ClassImportAnalysis.analyzeRow")(function*(
  schoolId: string,
  row: ClassImportRow
) {
  const decoded = decodeClassImportRow(row)
  if (Result.isFailure(decoded)) {
    return { row, status: "error", error: new ImportRowError({ reason: decoded.failure.message }) } as const
  }

  const outcome = yield* Effect.result(Effect.gen(function*() {
    const levelOpt = yield* findLevelByCode(schoolId, row.levelCode)
    if (Option.isNone(levelOpt)) {
      return { _tag: "error" as const, reason: `Unknown level code: ${row.levelCode}` }
    }
    const level = levelOpt.value

    let trackId: string | undefined
    if (row.trackCode !== undefined) {
      const trackOpt = yield* findTrackByCode(schoolId, level.id, row.trackCode)
      if (Option.isNone(trackOpt)) {
        return {
          _tag: "error" as const,
          reason: `Track "${row.trackCode}" does not belong to level ${row.levelCode}`
        }
      }
      trackId = trackOpt.value.id
    }

    const existingOpt = yield* findClassByLevelAndLabel(schoolId, level.id, row.label)
    if (Option.isSome(existingOpt)) {
      return {
        _tag: "duplicate" as const,
        reason: `A class labeled "${row.label}" already exists under ${row.levelCode}`
      }
    }

    return { _tag: "creatable" as const, level, trackId }
  }))

  if (Result.isFailure(outcome)) {
    return {
      row,
      status: "error",
      error: new ImportRowError({ reason: failureReason(outcome.failure), cause: outcome.failure })
    } as const
  }

  switch (outcome.success._tag) {
    case "error":
      return { row, status: "error", error: new ImportRowError({ reason: outcome.success.reason }) } as const
    case "duplicate":
      return { row, status: "duplicate", reason: outcome.success.reason } as const
    case "creatable":
      return { row, status: "creatable", level: outcome.success.level, trackId: outcome.success.trackId } as const
  }
})

/**
 * The core of `analyzeClassImport`, without its own `authorized`/`withSchool`
 * wrapping — callable from `ImportBatch.ts`'s `startClassImportBatch`, which
 * needs the same per-row analysis run inside the transaction it also
 * persists the resulting `ImportBatch` rows in (same
 * core/wrapped-entry-point split as `Enrollment.ts`'s
 * `insertEnrollment`/`createEnrollment`).
 *
 * Each row's lookups are independent and read-only — bounded concurrency
 * (rather than unbounded) caps how many queries are in flight at once on
 * this transaction's single connection (every row here shares the one
 * connection the caller's `withSchool` opened, pipelined rather than spread
 * across the pool). `Effect.forEach` preserves input order in the returned
 * array regardless of concurrency.
 */
export const analyzeClassImportRows = Effect.fn("ClassImportAnalysis.analyzeClassImportRows")(function*(
  schoolId: string,
  rows: ReadonlyArray<ClassImportRow>
) {
  return yield* Effect.forEach(rows, (row) => analyzeRow(schoolId, row), { concurrency: 5 })
})

export const analyzeClassImport = Effect.fn("ClassImportAnalysis.analyzeClassImport")(function*(
  schoolId: string,
  rows: ReadonlyArray<ClassImportRow>
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(schoolId, analyzeClassImportRows(schoolId, rows))
  )
})
