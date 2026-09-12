import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { RequirePermissionLive } from "@qadi/http/RequirePermission"
import { AppSqlLive } from "@zschool/db"
import { Api } from "@zschool/domain"
import { SqsImportQueueLive } from "@zschool/infra"
import * as Layer from "effect/Layer"
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi"
import { AuthorizationLive } from "./Authorization.ts"
import { ImportsApiHandlers } from "./Imports/http.ts"

/**
 * Issue #38 / ADR-ZS-082: `.middleware(RequirePermission)` lives on `Api`
 * itself (`Api.ts`). `RequirePermissionLive` declares `requires: never` and
 * `provides: CurrentSubject` (fixed upstream in `@qadi/http` — see its own
 * `RequirePermission.ts` doc comment), resolving its six evaluation services
 * as an ordinary build-time layer dependency and re-providing the decoded
 * subject to every request it guards. So this whole composition is plain
 * `Layer.provide` — Effect's own inference computes every type end to end,
 * with no manual annotation or cast anywhere in this file.
 *
 * `AppSqlLive` is the same least-privilege, RLS-enforced role
 * `packages/domain`'s own tests already use, never a higher-privileged one.
 * `EvaluationServicesNone` (`@qadi/core`) is the correct standing
 * environment for every `@qadi` policy this API evaluates
 * (`hasRole`/`hasResourceAttribute` only).
 */
const RequirePermissionFullyLive = RequirePermissionLive.pipe(
  Layer.provide(AuthorizationLive),
  Layer.provide(EvaluationServicesNone)
)

/**
 * `HttpApiBuilder.group`'s own return type tracks each endpoint handler's
 * requirement through an internal `HandleAllRequirements` computation that
 * wraps any leftover per-request service in `effect`'s own
 * `HttpRouter.Request<"Requires", T>` marker (its doc comment: "needs to be
 * provided by middleware") — a marker only `.middleware()`'s own declared
 * `provides`, or resolving the requirement before the handler's returned
 * effect leaves its generator, can ever discharge; an ordinary
 * `Layer.provide` downstream only matches plain, unwrapped service tags, so
 * it can never strip one. `SqlClient` and the six evaluation services
 * `authorized()` needs are resolved that second way, once, inside
 * `Imports/http.ts`'s own generator (see its doc comment) — so
 * `ImportsApiHandlers`'s only remaining requirement is the ordinary,
 * unwrapped `EvaluationServicesNone`/`AppSqlLive` tags needed to do that
 * resolving, which sequential `Layer.provide` steps discharge normally, same
 * as `RequirePermissionFullyLive` above.
 */
const ApiHandlersLive = ImportsApiHandlers.pipe(
  Layer.provide(EvaluationServicesNone),
  Layer.provide(AppSqlLive),
  Layer.provide(SqsImportQueueLive)
)

export const ApiLive = HttpApiBuilder.layer(Api, { openapiPath: "/openapi.json" }).pipe(
  Layer.provide(ApiHandlersLive),
  Layer.provide(RequirePermissionFullyLive)
)

/** Scalar-rendered API docs, generated from the same `Api` definition the server actually runs — see `Api.ts`'s own doc comment on why that matters. */
const DocsRoute = HttpApiScalar.layer(Api, { path: "/docs" }).pipe(Layer.provide(EvaluationServicesNone))

export const AllRoutes = Layer.mergeAll(ApiLive, DocsRoute)
