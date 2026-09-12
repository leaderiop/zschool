import { DeleteMessageCommand, ReceiveMessageCommand, type SQSClient } from "@aws-sdk/client-sqs"
import { AppSqlLive } from "@zschool/db"
import { commitClassImportBatch } from "@zschool/domain"
import { importCommitQueueUrl, makeSqsClient } from "@zschool/infra"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const ImportCommitMessageSchema = Schema.Struct({ batchId: Schema.String })

/**
 * One receive/process/delete cycle (ADR-ZS-106/ADR-ZS-099). Deleting only
 * AFTER `commitClassImportBatch` succeeds is what gives SQS's own
 * at-least-once redelivery its meaning here: a crash between commit and
 * delete redelivers the same message, and `commitClassImportBatch`'s own
 * idempotency (only touching `pending`/`failed` rows) is what makes that
 * safe rather than a source of duplicate `Class` rows.
 *
 * A message this worker can't even parse (not a decodable
 * `{batchId: string}`) is logged and left alone rather than deleted —
 * SQS's own redrive-policy/DLQ (infra, out of this ticket's scope) is
 * where a poison message eventually goes, not a silent drop here.
 */
export const processOneMessage = Effect.fn("Workers.Imports.processOneMessage")(function*(
  client: SQSClient,
  queueUrl: string
) {
  const response = yield* Effect.tryPromise(() =>
    client.send(
      new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 1, WaitTimeSeconds: 20 })
    )
  )
  const message = response.Messages?.[0]
  if (message?.Body === undefined || message.ReceiptHandle === undefined) {
    return
  }

  const outcome = yield* Schema.decodeEffect(Schema.fromJsonString(ImportCommitMessageSchema))(message.Body).pipe(
    Effect.flatMap((parsed) => commitClassImportBatch(parsed.batchId)),
    Effect.provide(AppSqlLive),
    Effect.result
  )
  if (outcome._tag === "Failure") {
    yield* Effect.logError("Import commit worker failed to process a message", outcome.failure)
    return
  }

  yield* Effect.tryPromise(() =>
    client.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle }))
  )
})

/** The long-poll loop `apps/workers/src/index.ts` runs — one iteration is one `ReceiveMessageCommand` call, blocking up to 20s server-side when the queue is empty. */
export const runImportCommitWorker = Effect.fn("Workers.Imports.runImportCommitWorker")(function*() {
  const queueUrl = yield* importCommitQueueUrl
  const client = yield* makeSqsClient
  return yield* Effect.forever(processOneMessage(client, queueUrl))
})
