import * as Layer from "effect/Layer"
import { HttpRouter, HttpServer } from "effect/unstable/http"
import { AllRoutes } from "./server.ts"

/**
 * The portable web handler ADR-ZS-082's Lambda-function-URL deployment
 * target needs (`HttpRouter.toWebHandler`, not a listening socket) — wiring
 * the actual Function Alchemy resource around this export is separate
 * infrastructure work, out of this ticket's scope.
 */
export const { dispose, handler } = HttpRouter.toWebHandler(
  AllRoutes.pipe(Layer.provide(HttpServer.layerServices))
)
