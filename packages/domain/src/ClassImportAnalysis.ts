import type { EvaluationServices } from "@qadi/core/Evaluate"
import type { EnforcementError } from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
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

export type ClassImportRowResult =
  | { readonly row: ClassImportRow; readonly status: "creatable" }
  | { readonly row: ClassImportRow; readonly status: "duplicate"; readonly reason: string }
  | { readonly row: ClassImportRow; readonly status: "error"; readonly reason: string }

export const analyzeClassImport = Effect.fn("ClassImportAnalysis.analyzeClassImport")(function*(
  schoolId: string,
  rows: ReadonlyArray<ClassImportRow>
): Effect.fn.Return<ReadonlyArray<ClassImportRowResult>, EnforcementError | SqlError, SqlClient | EvaluationServices> {
  return yield* authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const results: Array<ClassImportRowResult> = []

        for (const row of rows) {
          if (row.capacity <= 0) {
            results.push({ row, status: "error", reason: "Capacity must be greater than zero" })
            continue
          }

          const [level] = yield* sql<{ id: string }>`
            SELECT id FROM levels WHERE school_id = ${schoolId} AND code = ${row.levelCode}
          `
          if (level === undefined) {
            results.push({ row, status: "error", reason: `Unknown level code: ${row.levelCode}` })
            continue
          }

          if (row.trackCode !== undefined) {
            const [track] = yield* sql<{ id: string }>`
              SELECT id FROM tracks WHERE school_id = ${schoolId} AND level_id = ${level.id} AND code = ${row.trackCode}
            `
            if (track === undefined) {
              results.push({
                row,
                status: "error",
                reason: `Track "${row.trackCode}" does not belong to level ${row.levelCode}`
              })
              continue
            }
          }

          const existing = yield* sql`
            SELECT id FROM classes WHERE school_id = ${schoolId} AND level_id = ${level.id} AND label = ${row.label}
          `
          if (existing.length > 0) {
            results.push({
              row,
              status: "duplicate",
              reason: `A class labeled "${row.label}" already exists under ${row.levelCode}`
            })
            continue
          }

          results.push({ row, status: "creatable" })
        }

        return results
      })
    )
  )
})
