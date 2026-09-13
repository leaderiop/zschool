import * as M from "@qadi/core/Matcher"
import { permission } from "@qadi/core/Permission"
import * as P from "@qadi/core/Policy"

/**
 * ADR-ZS-096: `@qadi` is the application-level authorization layer, checked
 * before Postgres RLS (ADR-ZS-092) ever sees a query — RLS is the backstop,
 * not the primary gate.
 *
 * A director may manage their own school only: the subject must hold the
 * `director` role, and the resource's `school_id` (the school the caller is
 * acting on) must equal the subject's own `school_id` attribute (set from
 * the authenticated session at login, never taken from caller input). Every
 * MVP capability gated by `Ownership.ts`'s `authorizeWith` resolves to this
 * same check — `canManageAcademicStructure`/`canManageFinance` below are
 * distinct exports for readability at each call site (and so a capability
 * that later needs its own rule has a name to diverge from), not distinct
 * policies today.
 */
const directorScopedToOwnSchool = P.allOf([
  P.hasRole("director"),
  // `M.subject(path)` already scopes into the subject's own `attributes` —
  // it is not a path into the whole `AuthSubject`, so this reads
  // `subject.attributes.school_id`, not `subject.attributes.attributes.school_id`.
  P.hasResourceAttribute("school_id", M.eq(M.subject("school_id")))
])

export const canManageAcademicStructure = directorScopedToOwnSchool

/** Finance writes (ticket #56 onward) are a distinct capability from academic-structure writes, even though both resolve to the same director-scoped-to-own-school check at MVP. */
export const canManageFinance = directorScopedToOwnSchool

/**
 * Ticket #65: the first SELF-service policy in this codebase — every other
 * export here gates a STAFF capability (a director acting within their own
 * school). A financial guardian views their OWN children's financial data,
 * never a caller-supplied guardian's — so this checks that the RESOURCE's
 * `guardian_person_id` (the person the caller claims to be looking up) equals
 * the SUBJECT's own `person_id` attribute, the same "compare a resource
 * attribute to the caller's own subject attribute" shape
 * `directorScopedToOwnSchool` already uses for `school_id`, just keyed by
 * person instead of school. No login flow mints a `financial_guardian`-roled
 * subject with a `person_id` attribute yet (this codebase has no
 * guardian-portal auth at all) — this policy is the enforcement boundary
 * that flow will need to satisfy once it exists, the same "policy exists
 * ahead of its own UI" precedent `canAnalyzeImports` already set.
 */
const financialGuardianViewingOwnData = P.allOf([
  P.hasRole("financial_guardian"),
  P.hasResourceAttribute("guardian_person_id", M.eq(M.subject("person_id")))
])

export const canViewOwnFinancialStatus = financialGuardianViewingOwnData

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
