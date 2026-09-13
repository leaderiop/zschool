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

/**
 * Ticket #94 (Attendance role/scoping foundation, wayfinder ticket #83):
 * generalized cycle-or-whole-school scoping, usable by any role — not
 * hardcoded to `student_life`. A subject's `cycle_ids` attribute is the
 * active `school_membership_cycles` rows for their membership
 * (`SchoolMembership.ts#findActiveCycleIds`): empty means whole-school scope,
 * one or more means scoped to exactly those cycles.
 *
 * `M.size(M.eq(M.literal(0)))` denies an *absent* `cycle_ids` the same way
 * every other attribute check here fails closed (`Eq`'s own doc comment,
 * `@qadi/core/Matcher`) — the auth-subject minting flow for `student_life`/
 * `front_office` (not built yet, no login flow mints either role — same
 * "policy exists ahead of its own login flow" precedent
 * `financialGuardianViewingOwnData` already set) must always populate
 * `cycle_ids`, defaulting to `[]`, never omit it.
 */
const wholeSchoolOrAssignedCycle = P.anyOf([
  P.hasAttribute("cycle_ids", M.size(M.eq(M.literal(0)))),
  P.hasAttribute("cycle_ids", M.someMatch(M.eq(M.resource("cycle_id"))))
])

const cycleScopedRole = (role: string) =>
  P.allOf([
    P.hasRole(role),
    P.hasResourceAttribute("school_id", M.eq(M.subject("school_id"))),
    wholeSchoolOrAssignedCycle
  ])

/**
 * A teacher may act on a resource (a `Session`, a grade-entry `Assessment`'s
 * owning `Course`, ...) they're actively assigned to via `TeacherAssignment`,
 * or one they're the declared substitute for
 * (`Session.substitute_teacher_person_id`, ADR-ZS-046 — a session-specific
 * concept only; call sites for a resource with no substitute notion simply
 * never populate that attribute, so the branch never matches) — both
 * resolved by the call site into resource attributes before this policy
 * runs, the same "resolve real facts, then re-check the resource-scoped
 * policy" pattern `Ownership.ts` documents. `someMatch` denies when
 * `assigned_teacher_person_ids` is absent or empty, so a teacher with no
 * `TeacherAssignment` for the resource's course is denied by construction.
 * Generalized (ticket #120) from what was originally a roll-call-only
 * private helper — resource-attribute-driven, not tied to any one entity.
 */
const teacherAssignedToResource = P.allOf([
  P.hasRole("teacher"),
  P.hasResourceAttribute("school_id", M.eq(M.subject("school_id"))),
  P.anyOf([
    P.hasResourceAttribute("assigned_teacher_person_ids", M.someMatch(M.eq(M.subject("person_id")))),
    P.hasResourceAttribute("substitute_teacher_person_id", M.eq(M.subject("person_id")))
  ])
])

/** Director (whole school), student-life scoped to the session's cycle (or whole-school), or the assigned/substitute teacher. */
export const canTakeRollCall = P.anyOf([
  directorScopedToOwnSchool,
  cycleScopedRole("student_life"),
  teacherAssignedToResource
])

/**
 * Ticket #120 (BEH-ZS-113/INV-ZS-091): grade-entry write access belongs to
 * the course's own assigned teacher alone — the spec's explicit "write: the
 * course teacher; read: school leadership" split, unlike every other MVP
 * capability's `directorScopedToOwnSchool`-included default (`canTakeRollCall`
 * above included). A director's write attempt is deliberately denied here,
 * not an oversight.
 */
export const canEnterGrades = teacherAssignedToResource

/** Front-office and student-life both record justifications on a guardian/parent's behalf (front-desk intake, BEH-ZS-104); director retains the same blanket access every other capability gives it. */
export const canRecordJustification = P.anyOf([
  directorScopedToOwnSchool,
  cycleScopedRole("front_office"),
  cycleScopedRole("student_life")
])

/** Validating (accepting/refusing) a justification is student-life's own call, not front-office's — front-office only records intake. */
export const canValidateJustification = P.anyOf([
  directorScopedToOwnSchool,
  cycleScopedRole("student_life")
])

/** The live daily-summary/discrepancy dashboard (SCR-ZS-051) is student-life's own screen, scoped the same way every other student-life capability here is. */
export const canViewStudentLifeDashboard = P.anyOf([
  directorScopedToOwnSchool,
  cycleScopedRole("student_life")
])

/** Ticket #95: declaring/bulk-declaring `Slot`/`Session` rows, and marking a `Session` uncovered/substituted (ADR-ZS-046) — student-life's own scheduling capability, same cycle-or-whole-school scoping as `canViewStudentLifeDashboard`. */
export const canManageAttendanceSchedule = P.anyOf([
  directorScopedToOwnSchool,
  cycleScopedRole("student_life")
])

/** Ticket #96: resolving a `RollCallDiscrepancy` is a distinct capability from scheduling (`canManageAttendanceSchedule`), even though both resolve to the same director-or-student-life check today — same "distinct export per capability" precedent `canManageFinance`/`canManageAcademicStructure` already set. */
export const canArbitrateAttendanceDiscrepancy = canManageAttendanceSchedule

/** Ticket #103: any staff member (teacher, student-life, or director) may report a `Incident` at their own school — "in their own class" (BEH-ZS-081) is a UI-level filter on which courses a teacher's client offers, not an auth-layer restriction, the same scope decision `confirmRollCallForHalfDay`'s doc comment makes about homeroom-teacher assignment not existing yet. */
export const canReportIncident = P.anyOf([
  directorScopedToOwnSchool,
  cycleScopedRole("student_life"),
  P.allOf([P.hasRole("teacher"), P.hasResourceAttribute("school_id", M.eq(M.subject("school_id")))])
])

/** Ticket #103: deciding a `Sanction`, executing a temporary expulsion, and proposing a suspension are student-life's/director's own capability — a teacher may report an incident (`canReportIncident`) but not decide its outcome. */
export const canManageDiscipline = P.anyOf([
  directorScopedToOwnSchool,
  cycleScopedRole("student_life")
])

/** ADR-ZS-057: approving (or dismissing) a `SuspensionProposal` — actually setting `Enrollment.status` to `suspended` — is reserved to the director, never student-life, even though student-life can propose one via `canManageDiscipline`. */
export const canApproveSuspension = directorScopedToOwnSchool

/** Ticket #106: identical shape to `canReportIncident` (any staff member at the school, no investigation step) — a distinct export since recording a reward is a different capability from reporting an incident, even though both resolve to the same check today. */
export const canRecordCommendation = canReportIncident

/** Ticket #104: issuing/tracking a `Summons` and managing a `DisciplinaryCouncil`'s minutes — student-life's/director's own capability, same shape as `canManageDiscipline` (a distinct export for the same "capability, not mechanism" reason). */
export const canManageCouncil = canManageDiscipline

/** Ticket #110 (BEH-ZS-098, resolving Attendance's #90): proposing a `ConductGrade` is any teacher actively assigned to the class (`TeacherAssignment.ts#findActiveAssignedTeacherPersonIdsForClass`) — the same missing-homeroom-teacher fallback `canEnterGrades` already uses, just resolved against a class instead of a course's own assessment. */
export const canProposeConductGrade = teacherAssignedToResource

/** Ticket #110 (BEH-ZS-098): validating a proposed `ConductGrade` is student-life's/director's own capability, per configuration — same shape as `canManageDiscipline`. */
export const canValidateConductGrade = canManageDiscipline

/** Ticket #110 (BEH-ZS-102, resolving Attendance's #90): setting a `PeriodResult`'s "excluded from rank" flag is the director's own call — BEH-ZS-102's "the director MAY exclude them," not student-life's. */
export const canSetRankExclusion = directorScopedToOwnSchool
