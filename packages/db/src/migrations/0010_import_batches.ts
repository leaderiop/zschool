import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #8 / ADR-ZS-106: `ImportBatch` mechanics, proven on the classes
 * import domain (the only value `domain` accepts today — widen the CHECK,
 * not this migration's shape, when a later ticket like #10/#11 adds a
 * second import domain).
 *
 * `import_batches` is itself the durable record of who ran the import and
 * when (INV-ZS-090) — `created_by_subject_id`/`created_at`/`committed_at`
 * are sufficient audit context on their own, same reasoning as migration
 * 0009's `capacity_override_reason` living directly on `enrollments` rather
 * than in `structure_audit_log`: an import doesn't rename/deactivate/delete
 * an existing structure row (the only actions that table's CHECK
 * constraint models), it creates new ones, which `structure_audit_log`
 * never covered even for a direct (non-import) `createClass` call.
 *
 * `status` mirrors the screen states `spec/behaviors/01-administration-
 * onboarding-subscription.md` lists (ADR-ZS-106) minus "analysis in
 * progress": analysis is synchronous (ADR-ZS-106), so a batch row is only
 * ever inserted once analysis has already finished.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE import_batches (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      import_domain text NOT NULL CHECK (import_domain IN ('classes')),
      status text NOT NULL CHECK (status IN ('report_ready', 'committing', 'complete', 'partially_committed'))
        DEFAULT 'report_ready',
      created_by_subject_id text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      committed_at timestamptz
    )
  `
  yield* applyTenantIsolation(sql, "import_batches")

  // `analysis_status`/`analysis_reason` are the synchronous analyze report,
  // frozen at upload time (ADR-ZS-106: "persisted... rather than being
  // recomputed on every read"). `commit_status`/`commit_reason` are
  // NULL for a row that was never creatable (a `duplicate`/`error` row is
  // never a commit candidate) and 'pending' otherwise until the worker
  // re-validates it — see `import_batch_rows_commit_status_matches_analysis`
  // below for why a `creatable` row can't skip straight to NULL.
  yield* sql`
    CREATE TABLE import_batch_rows (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      batch_id uuid NOT NULL REFERENCES import_batches (id) ON DELETE CASCADE,
      row_index integer NOT NULL CHECK (row_index >= 0),
      payload jsonb NOT NULL,
      analysis_status text NOT NULL CHECK (analysis_status IN ('creatable', 'duplicate', 'error')),
      analysis_reason text,
      commit_status text CHECK (commit_status IN ('pending', 'committed', 'failed')),
      commit_reason text,
      committed_entity_id uuid,
      UNIQUE (batch_id, row_index),
      CONSTRAINT import_batch_rows_commit_status_matches_analysis CHECK (
        (analysis_status = 'creatable' AND commit_status IS NOT NULL)
        OR (analysis_status != 'creatable' AND commit_status IS NULL)
      )
    )
  `
  yield* applyTenantIsolation(sql, "import_batch_rows")
})
