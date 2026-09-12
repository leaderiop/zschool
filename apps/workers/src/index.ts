import { NodeRuntime } from "@effect/platform-node"
import { runImportCommitWorker } from "./Imports.ts"

/**
 * Ticket #8 / ADR-ZS-099: a long-polling consumer of the import-commit SQS
 * queue, runnable locally exactly like `apps/api/src/index.ts`'s dev
 * server. Wiring the actual production deployment target (ECS task vs. a
 * Lambda subscribed to the queue via an event source mapping) is separate
 * infrastructure work, same scope line `apps/api/src/lambda.ts` draws for
 * the API's own production entrypoint.
 */
NodeRuntime.runMain(runImportCommitWorker())
