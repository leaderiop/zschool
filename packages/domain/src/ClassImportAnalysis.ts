import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { SchoolId } from "./Ids.ts"
import { ImportRowError } from "./ImportRowError.ts"
import { authorized } from "./Ownership.ts"

/**
 * PARTIAL ticket #8 slice: the synchronous "analyze" half only, for the
 * classes domain, proven to need no external capability per the ticket's
 * own framing.
 *
 * NOT implemented here (tracked, not silently dropped): the bilingual
 * Excel template download/parse, persisting the analysis as an
 * `ImportBatch` row, the async SQS-consumed idempotent commit worker with
 * re-validation (ADR-ZS-106), partial-commit/retry-only-failed semantics,
 * and import operation logging (INV-ZS-090). Those need real queue
 * infrastructure (ADR-ZS-099) that doesn't exist anywhere in this repo yet
 * (`apps/workers` is still an empty stub) — building a synchronous stand-in
 * for them would misrepresent the ticket's actual acceptance criteria as
 * met. This function makes NO database writes; it only classifies rows.
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
const ClassImportRowSchema = Schema.Struct({
  levelCode: Schema.NonEmptyString,
  trackCode: Schema.optional(Schema.NonEmptyString),
  label: Schema.NonEmptyString,
  capacity: Schema.Int.check(Schema.isGreaterThan(0))
})

export const decodeClassImportRow = (row: ClassImportRow): Result.Result<ClassImportRow, Schema.SchemaError> =>
  Schema.decodeResult(ClassImportRowSchema)(row)

export type ClassImportRowResult =
  | { readonly row: ClassImportRow; readonly status: "creatable" }
  | { readonly row: ClassImportRow; readonly status: "duplicate"; readonly reason: string }
  | { readonly row: ClassImportRow; readonly status: "error"; readonly error: ImportRowError }

/**
 * Requests `SqlClient` from context instead of receiving it as a parameter
 * (issue #34's DI correction — see the same fix in
 * `StudentGuardianImport.ts`'s `resolveClass`/`analyzeStudentRow`), and is
 * hoisted to module scope rather than redeclared inside
 * `analyzeClassImport`'s body on every call. `schoolId` stays a plain
 * parameter throughout — it's ordinary data, not a service.
 *
 * The three sequential lookups run inside `Effect.result` (matching
 * `StudentGuardianImport.ts`'s row analyzers) so a transient `SqlError` on
 * one row surfaces as that row's own error instead of aborting the whole
 * `Effect.forEach` batch.
 */
const analyzeRow = Effect.fn("ClassImportAnalysis.analyzeRow")(function*(
  schoolId: string,
  row: ClassImportRow
) {
  const decoded = decodeClassImportRow(row)
  if (Result.isFailure(decoded)) {
    return { row, status: "error", error: new ImportRowError({ reason: decoded.failure.message }) } as const
  }

  const sql = yield* SqlClient
  const outcome = yield* Effect.result(Effect.gen(function*() {
    const [level] = yield* sql<{ id: string }>`
      SELECT id FROM levels WHERE school_id = ${schoolId} AND code = ${row.levelCode}
    `
    if (level === undefined) {
      return { _tag: "error" as const, reason: `Unknown level code: ${row.levelCode}` }
    }

    if (row.trackCode !== undefined) {
      const [track] = yield* sql<{ id: string }>`
        SELECT id FROM tracks WHERE school_id = ${schoolId} AND level_id = ${level.id} AND code = ${row.trackCode}
      `
      if (track === undefined) {
        return {
          _tag: "error" as const,
          reason: `Track "${row.trackCode}" does not belong to level ${row.levelCode}`
        }
      }
    }

    const existing = yield* sql`
      SELECT id FROM classes WHERE school_id = ${schoolId} AND level_id = ${level.id} AND label = ${row.label}
    `
    if (existing.length > 0) {
      return {
        _tag: "duplicate" as const,
        reason: `A class labeled "${row.label}" already exists under ${row.levelCode}`
      }
    }

    return { _tag: "creatable" as const }
  }))

  if (Result.isFailure(outcome)) {
    return { row, status: "error", error: new ImportRowError({ reason: "SqlError", cause: outcome.failure }) } as const
  }

  switch (outcome.success._tag) {
    case "error":
      return { row, status: "error", error: new ImportRowError({ reason: outcome.success.reason }) } as const
    case "duplicate":
      return { row, status: "duplicate", reason: outcome.success.reason } as const
    case "creatable":
      return { row, status: "creatable" } as const
  }
})

export const analyzeClassImport = Effect.fn("ClassImportAnalysis.analyzeClassImport")(function*(
  schoolId: string,
  rows: ReadonlyArray<ClassImportRow>
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      // Each row's lookups are independent and read-only — bounded
      // concurrency (rather than unbounded) caps how many queries are in
      // flight at once on this transaction's single connection (every row
      // here shares the one connection `withSchool` opened above, pipelined
      // rather than spread across the pool). `Effect.forEach` preserves
      // input order in the returned array regardless of concurrency.
      Effect.forEach(rows, (row) => analyzeRow(schoolId, row), { concurrency: 5 })
    )
  )
})
