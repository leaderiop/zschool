import { CurrentSubject } from "@qadi/core/CurrentSubject"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import { CreateClassCommand, insertClassRow } from "./AcademicTree.ts"
import { analyzeClassImportRows, analyzeRow, type ClassImportRow, decodeClassImportRow } from "./ClassImportAnalysis.ts"
import { ImportBatchId, ImportBatchRowId, SchoolId } from "./Ids.ts"
import { ImportQueue } from "./ImportQueue.ts"
import { authorized, EntityNotFoundError } from "./Ownership.ts"

/**
 * `Model.Class` for `import_batches`/`import_batch_rows` (issue #8,
 * ADR-ZS-106), matching migration 0010's DDL. `import_domain` is a plain
 * `Schema.Literals` of just `"classes"` today (the migration's own CHECK is
 * equally narrow) — widen both together when a later ticket adds a second
 * import domain.
 */
export class ImportBatch extends Model.Class<ImportBatch>("ImportBatch")({
  id: Model.Field({ select: ImportBatchId, update: ImportBatchId, json: ImportBatchId, jsonUpdate: ImportBatchId }),
  school_id: SchoolId,
  import_domain: Schema.Literals(["classes"]),
  status: Schema.Literals(["report_ready", "committing", "complete", "partially_committed"]),
  created_by_subject_id: Schema.String,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  committed_at: Schema.NullOr(Schema.DateTimeUtcFromMillis)
}) {}

export class ImportBatchRow extends Model.Class<ImportBatchRow>("ImportBatchRow")({
  id: Model.Field({
    select: ImportBatchRowId,
    update: ImportBatchRowId,
    json: ImportBatchRowId,
    jsonUpdate: ImportBatchRowId
  }),
  school_id: SchoolId,
  batch_id: Schema.String,
  row_index: Schema.Int,
  // `Schema.Unknown` (not the concrete `ClassImportRow` shape), same
  // reasoning as `AcademicTree.ts`'s `StructureAuditLog.old_value`/
  // `new_value`: `import_domain` (on the parent batch) picks which concrete
  // row shape this decodes as, and this model doesn't branch on that column.
  //
  // Plain `Unknown`, not `Schema.fromJsonString`: `@effect/sql-pg` hands
  // back a `jsonb` column already parsed into a JS value on SELECT (a
  // `fromJsonString` schema's decode side expects a raw string, which fails
  // against an already-parsed object). `insertBatchRow` below writes this
  // column with an explicit `::jsonb` cast over a `JSON.stringify`'d
  // parameter instead of `rowRepo.insert()`, for the same reason in
  // reverse: `SqlModel.makeRepository`'s generated insert hands
  // `@effect/sql-pg` the raw object parameter directly, which it can't
  // infer a Postgres type for.
  payload: Schema.Unknown,
  analysis_status: Schema.Literals(["creatable", "duplicate", "error"]),
  analysis_reason: Schema.NullOr(Schema.String),
  commit_status: Schema.NullOr(Schema.Literals(["pending", "committed", "failed"])),
  commit_reason: Schema.NullOr(Schema.String),
  committed_entity_id: Schema.NullOr(Schema.String)
}) {}

const batchRepo = SqlModel.makeRepository(ImportBatch, {
  tableName: "import_batches",
  spanPrefix: "ImportBatch",
  idColumn: "id"
})

/** See `ImportBatchRow.payload`'s own doc comment for why this table gets a hand-built insert instead of `SqlModel.makeRepository`. */
const insertBatchRow = Effect.fn("ImportBatch.insertBatchRow")(function*(
  request: (typeof ImportBatchRow.insert)["Type"]
) {
  const sql = yield* SqlClient
  yield* sql`
    INSERT INTO import_batch_rows
      (school_id, batch_id, row_index, payload, analysis_status, analysis_reason, commit_status, commit_reason, committed_entity_id)
    VALUES (
      ${request.school_id}, ${request.batch_id}, ${request.row_index}, ${JSON.stringify(request.payload)}::jsonb,
      ${request.analysis_status}, ${request.analysis_reason}, ${request.commit_status}, ${request.commit_reason},
      ${request.committed_entity_id}
    )
  `
})

export interface ImportBatchReportRow {
  readonly rowIndex: number
  readonly payload: unknown
  readonly analysisStatus: "creatable" | "duplicate" | "error"
  readonly analysisReason: string | null
  readonly commitStatus: "pending" | "committed" | "failed" | null
  readonly commitReason: string | null
}

export interface ImportBatchReport {
  readonly batchId: string
  readonly status: ImportBatch["status"]
  readonly rows: ReadonlyArray<ImportBatchReportRow>
}

/** The `imports` `HttpApi` group's wire contract for a report (`api/Imports.ts`) — structurally identical to `ImportBatchReport`/`ImportBatchReportRow` above, kept as separate `Schema`s (rather than making those two `Schema.Struct`s directly) so a domain-internal shape change doesn't silently change the wire contract too. */
export const ImportBatchReportRowHttpSchema = Schema.Struct({
  rowIndex: Schema.Int,
  payload: Schema.Unknown,
  analysisStatus: Schema.Literals(["creatable", "duplicate", "error"]),
  analysisReason: Schema.NullOr(Schema.String),
  commitStatus: Schema.NullOr(Schema.Literals(["pending", "committed", "failed"])),
  commitReason: Schema.NullOr(Schema.String)
})

export const ImportBatchReportHttpSchema = Schema.Struct({
  batchId: Schema.String,
  status: Schema.Literals(["report_ready", "committing", "complete", "partially_committed"]),
  rows: Schema.Array(ImportBatchReportRowHttpSchema)
})

const toReport = (batch: ImportBatch, rows: ReadonlyArray<ImportBatchRow>): ImportBatchReport => ({
  batchId: batch.id,
  status: batch.status,
  rows: rows.map((row) => ({
    rowIndex: row.row_index,
    payload: row.payload,
    analysisStatus: row.analysis_status,
    analysisReason: row.analysis_reason,
    commitStatus: row.commit_status,
    commitReason: row.commit_reason
  }))
})

const loadReport = Effect.fn("ImportBatch.loadReport")(function*(schoolId: string, batchId: string) {
  const sql = yield* SqlClient
  const rows = yield* sql`SELECT * FROM import_batches WHERE id = ${batchId} AND school_id = ${schoolId}`
  const [batchRow] = rows
  if (batchRow === undefined) {
    return yield* Effect.fail(new EntityNotFoundError({ entityType: "import_batch", entityId: batchId }))
  }
  const batch = yield* Schema.decodeUnknownEffect(ImportBatch)(batchRow)
  const batchRowRows = yield* sql`
    SELECT * FROM import_batch_rows WHERE batch_id = ${batchId} AND school_id = ${schoolId} ORDER BY row_index
  `
  const importRows = yield* Effect.forEach(batchRowRows, (row) => Schema.decodeUnknownEffect(ImportBatchRow)(row))
  return toReport(batch, importRows)
})

/**
 * The synchronous "analyze" half (ADR-ZS-106) for the classes domain: runs
 * every row through `ClassImportAnalysis.ts`'s shared `analyzeRow`, then
 * persists the batch and its per-row outcomes as `import_batches`/
 * `import_batch_rows` rows in the same transaction — nothing here creates a
 * `Class` yet, only the report.
 */
export const startClassImportBatch = Effect.fn("ImportBatch.startClassImportBatch")(function*(
  schoolId: string,
  rows: ReadonlyArray<ClassImportRow>
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const subject = yield* CurrentSubject
        const results = yield* analyzeClassImportRows(schoolId, rows)

        const batches = yield* batchRepo
        const batch = yield* batches.insert({
          school_id: validSchoolId,
          import_domain: "classes",
          status: "report_ready",
          created_by_subject_id: subject.id,
          committed_at: null
        })

        yield* Effect.forEach(results, (result, rowIndex) =>
          insertBatchRow({
            school_id: validSchoolId,
            batch_id: batch.id,
            row_index: rowIndex,
            payload: result.row,
            analysis_status: result.status,
            analysis_reason: result.status === "duplicate"
              ? result.reason
              : result.status === "error"
              ? result.error.reason
              : null,
            commit_status: result.status === "creatable" ? "pending" : null,
            commit_reason: null,
            committed_entity_id: null
          }))

        return yield* loadReport(schoolId, batch.id)
      })
    )
  )
})

export const getClassImportBatchReport = Effect.fn("ImportBatch.getClassImportBatchReport")(function*(
  schoolId: string,
  batchId: string
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(validSchoolId, withSchool(schoolId, loadReport(schoolId, batchId)))
})

/**
 * The director-facing half of commit (ADR-ZS-106): marks the batch
 * `committing` and hands it to the queue — the actual re-validation and
 * writes happen in `commitClassImportBatch` below, run by `apps/workers`,
 * never inline in this request.
 *
 * Also how a `partially_committed` batch is retried (ADR-ZS-106:
 * "retrying only reprocesses the still-failed rows") — safe to call
 * again on a batch that's already `complete` too, since
 * `commitClassImportBatch` finds nothing left `pending` and is a no-op.
 */
export const requestClassImportCommit = Effect.fn("ImportBatch.requestClassImportCommit")(function*(
  schoolId: string,
  batchId: string
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows = yield* sql`
          UPDATE import_batches SET status = 'committing'
          WHERE id = ${batchId} AND school_id = ${schoolId}
          RETURNING id
        `
        if (rows.length === 0) {
          return yield* Effect.fail(new EntityNotFoundError({ entityType: "import_batch", entityId: batchId }))
        }
        const queue = yield* ImportQueue
        yield* queue.enqueueCommit({ batchId }).pipe(Effect.orDie)
      })
    )
  )
})

/** Same request either way — see `requestClassImportCommit`'s own doc comment. */
export const retryClassImportBatch = requestClassImportCommit

/**
 * The worker-side half of commit (`apps/workers`, ADR-ZS-106/ADR-ZS-099): no
 * live director subject exists here (an SQS message carries only
 * `batchId`), so this uses `withSchool` for RLS scoping but not
 * `authorized` — the commit was already `@qadi`-checked once, in
 * `requestClassImportCommit`, at the moment the director asked for it (same
 * "authorize once at the request boundary, not again per row in a trusted
 * background job" reasoning as `Enrollment.ts`'s `insertEnrollment`).
 *
 * At-least-once SQS delivery means this must tolerate being called more
 * than once for the same `batchId`: only rows still `commit_status =
 * 'pending'` are selected, so a row already `committed`/`failed` from an
 * earlier delivery is never reprocessed or double-created — the
 * "replayable without duplicates" invariant (INV-ZS-054/055/021/090).
 *
 * Re-validates each pending row against current state (via the same
 * `analyzeRow` the analyze step used) rather than trusting the stored
 * `analysis_status` snapshot, per ADR-ZS-106 — a row that looked creatable
 * at analysis time can have become a duplicate in the interim (another
 * admin created a matching class in the gap between analyze and commit).
 *
 * Selects `pending` OR `failed` rows, not just `pending`: a `committed` row
 * is permanently excluded (that's the duplicate-proof guarantee), but a
 * `failed` one gets re-validated again on every delivery — harmless when
 * nothing changed (it just fails the same way again), and exactly what
 * "retrying reprocesses the still-failed rows" (ADR-ZS-106) means when
 * `retryClassImportBatch` re-enqueues a `partially_committed` batch.
 */
export const commitClassImportBatch = Effect.fn("ImportBatch.commitClassImportBatch")(function*(
  batchId: string
) {
  const sql = yield* SqlClient
  const [batchRow] = yield* sql`SELECT * FROM import_batches WHERE id = ${batchId}`
  if (batchRow === undefined) {
    return yield* Effect.fail(new EntityNotFoundError({ entityType: "import_batch", entityId: batchId }))
  }
  const batch = yield* Schema.decodeUnknownEffect(ImportBatch)(batchRow)

  yield* withSchool(
    batch.school_id,
    Effect.gen(function*() {
      const pendingRows = yield* sql`
        SELECT * FROM import_batch_rows
        WHERE batch_id = ${batchId} AND school_id = ${batch.school_id} AND commit_status IN ('pending', 'failed')
        ORDER BY row_index
      `
      const rows = yield* Effect.forEach(pendingRows, (row) => Schema.decodeUnknownEffect(ImportBatchRow)(row))

      yield* Effect.forEach(rows, (row) =>
        Effect.gen(function*() {
          const payload = row.payload as ClassImportRow
          const decoded = decodeClassImportRow(payload)
          if (Result.isFailure(decoded)) {
            yield* sql`
              UPDATE import_batch_rows SET commit_status = 'failed', commit_reason = ${decoded.failure.message}
              WHERE id = ${row.id}
            `
            return
          }

          const revalidated = yield* analyzeRow(batch.school_id, decoded.success)
          if (revalidated.status !== "creatable") {
            const reason = revalidated.status === "duplicate" ? revalidated.reason : revalidated.error.reason
            yield* sql`
              UPDATE import_batch_rows SET commit_status = 'failed', commit_reason = ${reason}
              WHERE id = ${row.id}
            `
            return
          }

          const command = yield* Schema.decodeEffect(CreateClassCommand)({
            schoolId: batch.school_id,
            academicYearId: revalidated.level.academic_year_id,
            levelId: revalidated.level.id,
            trackId: revalidated.trackId,
            label: revalidated.row.label,
            capacity: revalidated.row.capacity
          })
          const outcome = yield* Effect.result(insertClassRow(command))
          if (Result.isFailure(outcome)) {
            yield* sql`
              UPDATE import_batch_rows SET commit_status = 'failed', commit_reason = ${String(outcome.failure)}
              WHERE id = ${row.id}
            `
            return
          }

          yield* sql`
            UPDATE import_batch_rows
            SET commit_status = 'committed', committed_entity_id = ${outcome.success}
            WHERE id = ${row.id}
          `
        }))

      const [{ failed_count, pending_count }] = yield* sql<{ failed_count: string; pending_count: string }>`
        SELECT
          count(*) FILTER (WHERE commit_status = 'failed')::bigint AS failed_count,
          count(*) FILTER (WHERE commit_status = 'pending')::bigint AS pending_count
        FROM import_batch_rows WHERE batch_id = ${batchId} AND school_id = ${batch.school_id}
      `
      const finalStatus = Number(pending_count) > 0
        ? "committing"
        : Number(failed_count) > 0
        ? "partially_committed"
        : "complete"
      yield* sql`
        UPDATE import_batches SET status = ${finalStatus}, committed_at = now()
        WHERE id = ${batchId}
      `
    })
  )
})
