import { startTestPostgres } from "./TestPostgres.ts"
import { startTestQueue } from "./TestQueue.ts"

/**
 * Same reasoning as `globalSetup.ts` (issue #35), plus a disposable Floci
 * queue (ticket #8/ADR-ZS-099) — only the packages that actually touch
 * `ImportQueue`/SQS (`apps/workers`, `packages/infra`) load this instead of
 * the plain `globalSetup.ts`, so every other suite's run stays exactly as
 * fast as before this ticket.
 */
export default async function setup() {
  const testPostgres = await startTestPostgres()
  const testQueue = await startTestQueue()
  process.env.IMPORT_QUEUE_ENDPOINT = testQueue.endpoint
  process.env.IMPORT_COMMIT_QUEUE_URL = testQueue.queueUrl
  process.env.AWS_REGION = "eu-central-1"

  return async function teardown() {
    await testPostgres.stop()
    await testQueue.stop()
  }
}
