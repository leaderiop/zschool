import * as Context from "effect/Context"
import type * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

/**
 * The abstract capability `requestClassImportCommit` needs to hand a batch
 * off for async processing (ADR-ZS-106/ADR-ZS-099) — same "domain declares
 * the port, an adapter package provides the concrete implementation" split
 * as `SqlClient`/`@zschool/db`'s `AppSqlLive`: `packages/domain` stays
 * platform-agnostic (no AWS SDK import here), `@zschool/infra`'s `Sqs.ts`
 * is the real SQS-backed `Layer`, and tests can provide a trivial in-memory
 * one instead.
 */
export class QueueError extends Schema.TaggedError<QueueError>()("QueueError", {
  message: Schema.String
}) {}

export interface ImportCommitMessage {
  readonly batchId: string
}

export interface ImportQueue {
  /**
   * At-least-once delivery (SQS's own guarantee) is why
   * `commitClassImportBatch` (`ImportBatch.ts`) must be safe to run more
   * than once for the same `batchId` — it only ever reprocesses rows still
   * `pending`, never a row already `committed`/`failed`.
   */
  readonly enqueueCommit: (message: ImportCommitMessage) => Effect.Effect<void, QueueError>
}

export const ImportQueue = Context.Service<ImportQueue>("@zschool/domain/ImportQueue")
