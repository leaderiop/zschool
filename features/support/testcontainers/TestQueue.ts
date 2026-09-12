import { CreateQueueCommand, SQSClient } from "@aws-sdk/client-sqs"
import { GenericContainer, type StartedTestContainer } from "testcontainers"

/**
 * Ticket #8 / ADR-ZS-099: a disposable local AWS emulator standing in for
 * real SQS in dev/test, same "real infra behind a testcontainer, not a
 * mock" reasoning as `TestPostgres.ts` (issue #35). LocalStack itself was
 * archived in March 2026 (community edition sunset) — Floci is this
 * project's chosen replacement: a single-port (4566), GraalVM-native
 * emulator with an official Docker image and no account/API key/telemetry,
 * covering SQS out of the box behind the same `@aws-sdk/client-sqs` calls
 * this project's own `Sqs.ts`/`apps/workers` already make against real AWS
 * — nothing in application code branches on which one is live.
 *
 * A plain `GenericContainer` (from the `testcontainers` package
 * `@testcontainers/postgresql` itself already depends on), not the
 * community `@floci/testcontainers` Node module — that module pins
 * `testcontainers@^10`, one major behind the `testcontainers@12.1.0` this
 * project already runs, and its own GitHub issue tracker flags it as still
 * unreviewed. A hand-rolled container, same as `TestPostgres.ts` never
 * reached for a wrapper either, avoids that dependency risk entirely.
 *
 * Pinned to a specific release (`2.0.1`), not `:latest` — same reasoning as
 * `TestPostgres.ts`'s Postgres image pin: a version-specific behavior
 * difference here shouldn't cause a false pass/fail against production SQS.
 */
const FLOCI_IMAGE = "floci/floci:2.0.1"
const FLOCI_PORT = 4566

export interface TestQueue {
  readonly queueUrl: string
  readonly endpoint: string
  readonly stop: () => Promise<void>
}

/**
 * Starts Floci, creates the one queue this project needs (`import-commit`),
 * and returns everything `Sqs.ts`/`apps/workers` need to point at it —
 * mirrors `startTestPostgres`'s shape (a plain data object plus `stop`),
 * not a `Layer`, so callers decide when/whether to also set the
 * `IMPORT_QUEUE_ENDPOINT`/`IMPORT_COMMIT_QUEUE_URL` env vars `Config` reads
 * (`globalSetup.ts` does, for the `unit`/`bdd` vitest projects).
 */
export const startTestQueue = async (): Promise<TestQueue> => {
  const container: StartedTestContainer = await new GenericContainer(FLOCI_IMAGE)
    .withExposedPorts(FLOCI_PORT)
    .start()

  const endpoint = `http://${container.getHost()}:${container.getMappedPort(FLOCI_PORT)}`
  const client = new SQSClient({
    region: "eu-central-1",
    endpoint,
    credentials: { accessKeyId: "local", secretAccessKey: "local" }
  })
  const { QueueUrl } = await client.send(new CreateQueueCommand({ QueueName: "import-commit" }))
  if (QueueUrl === undefined) {
    throw new Error("Floci did not return a QueueUrl for the import-commit queue")
  }

  return {
    queueUrl: QueueUrl,
    endpoint,
    stop: () => container.stop().then(() => undefined)
  }
}
