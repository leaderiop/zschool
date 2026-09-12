import type { CurrentSubject } from "@qadi/core/CurrentSubject"
import type { EvaluationServices } from "@qadi/core/Evaluate"
import {
  analyzeGuardianRows,
  analyzeStudentRows,
  Api,
  authorized,
  generateClassImportTemplate,
  getClassImportBatchReport,
  ImportQueue,
  requestClassImportCommit,
  retryClassImportBatch,
  startClassImportBatch
} from "@zschool/domain"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * Issue #38: thin handlers — each calls straight into the existing
 * `packages/domain` analyze function, no adaptation beyond `authorized`'s
 * resource-scoped re-check of the real `:schoolId` path param against the
 * caller's own `school_id` attribute (see `Policies.ts`'s
 * `canAnalyzeImports` doc comment for why this can't happen in the group's
 * own `RequirePermission` middleware instead — that runs before any
 * per-request resource is known).
 *
 * `SqlClient` and the six `@qadi/core` evaluation services (needed by
 * `authorized`'s own `Qadi.assert` call, independently of whatever
 * `RequirePermission` itself evaluates) are captured once here, at this
 * layer's own build time, and threaded into each handler's returned effect
 * via `Effect.provideService`/`Effect.provide` — the same "capture once,
 * hand to every handler" shape `effect`'s own `Users.ts` worked example uses
 * for a service it reads once up front (`const users = yield* Users`).
 *
 * This isn't optional plumbing: `effect`'s own `HttpRouter.Request<"Requires",
 * T>` marker (see its doc comment — "needs to be provided by middleware") is
 * how `HttpApiBuilder.group` tracks a handler's own leftover requirement, and
 * it can only ever be discharged by a declared `.middleware()` `provides`, or
 * by resolving it before the handler's returned effect leaves this generator
 * — never by an ordinary `Layer.provide` applied afterwards (that only
 * matches plain, unwrapped service tags). `RequirePermission` (`@qadi/http`)
 * doesn't declare `provides` for either of these, so they're resolved right
 * here instead of at the `server.ts`/test-composition level.
 *
 * `analyzeStudentRows` can also fail with a bare `SqlError` (from
 * `withSchool`'s own transaction/GUC setup, outside any per-row
 * `Effect.result` — unlike `analyzeGuardianRows`, whose every fallible step
 * is already captured per-row) — not part of either endpoint's declared
 * error union (only the `RequirePermission` middleware's `EnforcementError`
 * family is). A database failure here is unexpected infrastructure trouble,
 * not a typed domain outcome the client should branch on, so it's converted
 * to a defect (matching `effect`'s own `Users.ts` worked example:
 * "database and encoding failures are unexpected, so treat them as
 * defects").
 */
export const ImportsApiHandlers = HttpApiBuilder.group(
  Api,
  "imports",
  Effect.fn(function*(handlers) {
    const sql = yield* SqlClient
    const evaluationServices = yield* Effect.context<Exclude<EvaluationServices, CurrentSubject>>()
    const queue = yield* ImportQueue

    const provideHandlerServices = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      effect.pipe(
        Effect.provideService(SqlClient, sql),
        Effect.provideService(ImportQueue, queue),
        Effect.provide(evaluationServices)
      )

    return handlers.handleAll({
      analyzeGuardians: ({ params, payload }) =>
        provideHandlerServices(authorized(params.schoolId, analyzeGuardianRows(payload))),
      analyzeStudents: ({ params, payload }) =>
        provideHandlerServices(authorized(params.schoolId, analyzeStudentRows(params.schoolId, payload))).pipe(
          Effect.catchTag("SqlError", Effect.die)
        ),
      // No `authorized`/`params` use here — the template's content (headers,
      // instructions, example row) is the same for every school, so nothing
      // school-specific is read; `:schoolId` stays in the path only for URL
      // consistency with every other `imports` endpoint.
      classImportTemplate: () => Effect.succeed(Stream.fromEffect(generateClassImportTemplate())),
      analyzeClasses: ({ params, payload }) =>
        provideHandlerServices(startClassImportBatch(params.schoolId, payload)).pipe(Effect.orDie),
      classImportBatchReport: ({ params }) =>
        provideHandlerServices(getClassImportBatchReport(params.schoolId, params.batchId)).pipe(Effect.orDie),
      commitClassImportBatch: ({ params }) =>
        provideHandlerServices(requestClassImportCommit(params.schoolId, params.batchId)).pipe(Effect.orDie),
      retryClassImportBatch: ({ params }) =>
        provideHandlerServices(retryClassImportBatch(params.schoolId, params.batchId)).pipe(Effect.orDie)
    })
  })
)
