# ADR-ZS-107: Person and ParentStudentRelationship stay covered by RLS via an EXISTS-subquery policy

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (minted during a `/grill-with-docs` session on the minimal Identity + Enrollment slice needed to unblock student + guardian import)

## Context

[ADR-ZS-014](./014-global-identity-multi-profile-account.md) establishes that
`Person` (and by extension `ParentStudentRelationship`, the guardian↔student
link) is global — independent of any one school, with no `school_id` column.
[ADR-ZS-092](./092-rls-as-defense-in-depth.md) establishes Row-Level Security
keyed on `school_id` as a defense-in-depth backstop behind `@qadi`'s
application-level authorization, motivated explicitly by the risk of a single
missed application-level filter leaking data across tenants "for a platform
holding minors' data across hundreds of tenants." Neither ADR states how a
table with no `school_id` fits that RLS model — leaving open whether `Person`
and `ParentStudentRelationship` are simply outside RLS's coverage (relying on
`@qadi`'s join-based scoping alone) or need their own mechanism.

## Decision

`Person` and `ParentStudentRelationship` are covered by RLS through an
EXISTS-subquery policy: a session may see a `Person` (or
`ParentStudentRelationship`) row only if the session's school has at least one
`Enrollment`, `SchoolMembership`, or `ParentStudentRelationship` linking to
that person — current or historical. There is no RLS-free exception for these
tables.

## Consequences

**Positive**: ADR-ZS-092's defense-in-depth guarantee extends to the single
most sensitive table in the schema (every child's and guardian's civil
status) instead of carving out an exception for it; a missed
application-level filter on a `Person` query still can't leak a full
cross-tenant record.

**Negative**: the policy is more expensive than a flat `school_id = current_
setting(...)` check — an EXISTS subquery runs per row — and has more upkeep
surface, since every new relationship type that can legitimately link a
school to a person (enrollment, affiliation, guardian relationship, and any
later addition) must be added to the policy's `EXISTS` clause or that
relationship silently stops granting visibility.

**Trade-off accepted**: query cost and policy-maintenance overhead over
leaving the platform's most sensitive table as the one exception to RLS
coverage.
