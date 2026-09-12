import { RequirePermission } from "@qadi/http/RequirePermission"
import { HttpApi } from "effect/unstable/httpapi"
import { ImportsApiGroup } from "./Imports.ts"

/**
 * The root `HttpApi` (issue #38, ADR-ZS-082) — the one definition shared by
 * the server (`apps/api`) and the generated client (`packages/clients`), so
 * neither can drift from the actual wire contract. Lives in
 * `packages/domain` rather than `apps/api` for exactly that reason: a
 * client must never depend on server implementation code to get its types.
 *
 * `@qadi/http`'s `RequirePermission` middleware is attached here, at the
 * `Api` level, not per-group — matching `@qadi/http`'s own test suite
 * (`test/http.test.ts`), which wires it the same way. Every endpoint added
 * to any group under this `Api` is guarded by it, and must declare either a
 * `RequiredPermission` annotation or `publicEndpoint(...)` (see
 * `Imports.ts`'s doc comment).
 */
export class Api extends HttpApi.make("zschool-api").add(ImportsApiGroup).middleware(RequirePermission) {}
