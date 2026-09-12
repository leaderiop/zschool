import * as M from "@qadi/core/Matcher"
import { permission } from "@qadi/core/Permission"
import * as P from "@qadi/core/Policy"

/**
 * ADR-ZS-096: `@qadi` is the application-level authorization layer, checked
 * before Postgres RLS (ADR-ZS-092) ever sees a query — RLS is the backstop,
 * not the primary gate.
 *
 * A director may manage their own school's academic structure only: the
 * subject must hold the `director` role, and the resource's `school_id`
 * (the school the caller is acting on) must equal the subject's own
 * `school_id` attribute (set from the authenticated session at login,
 * never taken from caller input).
 */
export const canManageAcademicStructure = P.allOf([
  P.hasRole("director"),
  // `M.subject(path)` already scopes into the subject's own `attributes` —
  // it is not a path into the whole `AuthSubject`, so this reads
  // `subject.attributes.school_id`, not `subject.attributes.attributes.school_id`.
  P.hasResourceAttribute("school_id", M.eq(M.subject("school_id")))
])

/**
 * Issue #38: the `imports` `HttpApi`'s `RequirePermission` middleware
 * (`@qadi/http`) evaluates against an empty resource (no `:schoolId` path
 * param is known yet at endpoint-definition time — see `@qadi/http`'s own
 * `RequirePermission.ts`, `NO_RESOURCE`'s doc comment) — a policy that reads
 * a resource attribute here would deny every request outright, so this is
 * role-only, unlike `canManageAcademicStructure` above. The actual
 * per-school scoping still happens: each handler re-checks the real
 * `:schoolId` against the caller's `school_id` attribute via `Ownership.ts`'s
 * `authorized` (which resolves `canManageAcademicStructure` against the real
 * resource), the same "resource-scoped re-check in the handler" pattern
 * `RequirePermission.ts` documents as the correct way to do this.
 */
export const canAnalyzeImports = P.hasRole("director")

/** The `Permission` witness `requiresPermission` (`@qadi/http`) attaches to the `imports` group's endpoints — a typed tag, not itself checked against the subject (see `Qadi.guard`'s own doc comment: the decision is made entirely by the `Policy` argument). */
export const analyzeImportsPermission = permission("imports", "analyze")
