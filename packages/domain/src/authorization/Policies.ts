import * as M from "@qadi/core/Matcher"
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
