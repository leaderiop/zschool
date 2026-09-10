import type { EvaluationServices } from "@qadi/core/Evaluate"
import type { EnforcementError } from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { SchoolId } from "./Ids.ts"
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
  | { readonly row: ClassImportRow; readonly status: "error"; readonly reason: string }

export const analyzeClassImport = Effect.fn("ClassImportAnalysis.analyzeClassImport")(function*(
  schoolId: string,
  rows: ReadonlyArray<ClassImportRow>
): Effect.fn.Return<ReadonlyArray<ClassImportRowResult>, EnforcementError | SqlError, SqlClient | EvaluationServices> {
  return yield* authorized(
    SchoolId(schoolId),
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient

        const analyzeRow = (row: ClassImportRow): Effect.Effect<ClassImportRowResult, SqlError> =>
          Effect.gen(function*() {
            const decoded = decodeClassImportRow(row)
            if (Result.isFailure(decoded)) {
              return { row, status: "error", reason: decoded.failure.message } as const
            }

            const [level] = yield* sql<{ id: string }>`
              SELECT id FROM levels WHERE school_id = ${schoolId} AND code = ${row.levelCode}
            `
            if (level === undefined) {
              return { row, status: "error", reason: `Unknown level code: ${row.levelCode}` } as const
            }

            if (row.trackCode !== undefined) {
              const [track] = yield* sql<{ id: string }>`
                SELECT id FROM tracks WHERE school_id = ${schoolId} AND level_id = ${level.id} AND code = ${row.trackCode}
              `
              if (track === undefined) {
                return {
                  row,
                  status: "error",
                  reason: `Track "${row.trackCode}" does not belong to level ${row.levelCode}`
                } as const
              }
            }

            const existing = yield* sql`
              SELECT id FROM classes WHERE school_id = ${schoolId} AND level_id = ${level.id} AND label = ${row.label}
            `
            if (existing.length > 0) {
              return {
                row,
                status: "duplicate",
                reason: `A class labeled "${row.label}" already exists under ${row.levelCode}`
              } as const
            }

            return { row, status: "creatable" } as const
          })

        // Each row's lookups are independent and read-only — bounded
        // concurrency (rather than unbounded) caps how many connections a
        // single large import batch can hold from the pool at once.
        // `Effect.forEach` preserves input order in the returned array
        // regardless of concurrency.
        return yield* Effect.forEach(rows, analyzeRow, { concurrency: 5 })
      })
    )
  )
})
