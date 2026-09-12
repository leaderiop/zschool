import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs"
import { ImportQueue, QueueError } from "@zschool/domain"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

/**
 * `IMPORT_QUEUE_ENDPOINT` is unset in production (the real AWS SQS endpoint
 * the SDK resolves from `AWS_REGION`) and set to a local AWS emulator's
 * endpoint (Floci, `features/support/testcontainers/TestQueue.ts`) in
 * dev/test — the exact same `@aws-sdk/client-sqs` client works against
 * either, so nothing here or in its callers branches on which one is live.
 * Shared by `SqsImportQueueLive` below (enqueue-only, from `apps/api`) and
 * `apps/workers` (receive/delete) so the connection settings can't drift
 * between producer and consumer.
 */
export const makeSqsClient = Effect.gen(function*() {
  const region = yield* Config.String("AWS_REGION").pipe(Config.withDefault("eu-central-1"))
  const endpoint = yield* Config.option(Config.String("IMPORT_QUEUE_ENDPOINT"))

  return new SQSClient({
    region,
    endpoint: Option.getOrUndefined(endpoint),
    // A local emulator (Floci) doesn't check credentials, but the SDK
    // still refuses to build a client with none configured at all.
    ...(Option.isSome(endpoint)
      ? { credentials: { accessKeyId: "local", secretAccessKey: "local" } }
      : {})
  })
})

export const importCommitQueueUrl = Config.String("IMPORT_COMMIT_QUEUE_URL")

/**
 * The real `ImportQueue` (`packages/domain/src/ImportQueue.ts`) backing for
 * ticket #8/ADR-ZS-106/ADR-ZS-099 — `packages/domain` stays platform-agnostic
 * (no AWS SDK import there), so the concrete SQS client lives here, same
 * "port in domain, adapter in its own package" split as `SqlClient`/
 * `@zschool/db`'s `AppSqlLive`.
 */
export const SqsImportQueueLive = Layer.effect(
  ImportQueue,
  Effect.gen(function*() {
    const queueUrl = yield* importCommitQueueUrl
    const client = yield* makeSqsClient

    return {
      enqueueCommit: (message) =>
        Effect.tryPromise({
          try: () =>
            client.send(
              new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify(message) })
            ),
          catch: (cause) => new QueueError({ message: `Failed to enqueue import commit: ${String(cause)}` })
        }).pipe(Effect.asVoid)
    }
  })
)
