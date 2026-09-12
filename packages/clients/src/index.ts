import { Api } from "@zschool/domain"
import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schedule from "effect/Schedule"
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"

/**
 * Issue #38: the base URL and bearer token are read from the environment
 * for now — `apps/web`'s actual UI (which would supply a real per-session
 * token instead of a static config value) is explicitly out of this
 * ticket's scope. `API_BASE_URL` defaults to the local dev server
 * (`apps/api/src/index.ts`) so a caller in this monorepo needs no
 * configuration to talk to it locally.
 */
const ClientConfig = Config.all({
  baseUrl: Config.String("API_BASE_URL").pipe(Config.withDefault("http://localhost:3000")),
  bearerToken: Config.Redacted("API_BEARER_TOKEN")
})

/**
 * The generated, typed client for `packages/domain`'s `Api` definition — no
 * caller ever hand-writes a `fetch`/axios call against these endpoints.
 * `HttpClient.retryTransient` covers a transient network blip so every
 * future caller doesn't have to handle that ad hoc.
 *
 * `@qadi/http`'s `RequirePermission` middleware (the `Api`'s own
 * authorization middleware, see `packages/domain/src/api/Api.ts`) reads the
 * bearer token straight off the request's `Authorization` header via its
 * own `SubjectExtractor`, rather than through `HttpApiSecurity` — it
 * declares no client-side security scheme, so nothing here needs to
 * implement an `HttpApiMiddleware.layerClient`. Attaching the token is
 * simply part of `transformClient` below.
 */
export class ApiClient extends Context.Service<ApiClient, HttpApiClient.ForApi<typeof Api>>()(
  "@zschool/clients/ApiClient"
) {
  static readonly layer = Layer.unwrap(
    Effect.gen(function*() {
      const config = yield* ClientConfig
      return Layer.effect(
        ApiClient,
        HttpApiClient.make(Api, {
          transformClient: (client) =>
            client.pipe(
              HttpClient.mapRequest((request) =>
                HttpClientRequest.bearerToken(
                  HttpClientRequest.prependUrl(request, config.baseUrl),
                  config.bearerToken
                )
              ),
              HttpClient.retryTransient({
                schedule: Schedule.exponential(100),
                times: 3
              })
            )
        })
      )
    })
  ).pipe(Layer.provide(FetchHttpClient.layer))
}
