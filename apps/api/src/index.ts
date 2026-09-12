import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import * as Layer from "effect/Layer"
import { HttpRouter } from "effect/unstable/http"
import { createServer } from "node:http"
import { AllRoutes } from "./server.ts"

/**
 * Local development entrypoint (issue #38, user story 12) — production runs
 * as a Function Alchemy Lambda function URL via `lambda.ts`'s web handler
 * instead (ADR-ZS-082), so a developer never needs real AWS infrastructure
 * just to hit this API on their machine.
 */
const HttpServerLayer = HttpRouter.serve(AllRoutes).pipe(
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
)

Layer.launch(HttpServerLayer).pipe(NodeRuntime.runMain)
