# ADR-ZS-108: Cross-tenant identity matching goes through a narrow SECURITY DEFINER function, never raw row access

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (minted during a `/grill-with-docs` session on the minimal Identity + Enrollment slice needed to unblock student + guardian import)

## Context

BEH-ZS-006 and ADR-ZS-015 require import analysis to search for a Massar
strong match or a name+date-of-birth weak match across the whole platform —
not just the importing school's own data — since a student's Massar code or a
guardian's mobile number may already exist at a different school (INV-ZS-005,
INV-ZS-006, INV-ZS-054, INV-ZS-055). [ADR-ZS-107](./107-person-relationship-rls-exists-subquery.md)'s
RLS policy would block exactly this search: the importing school has no
existing `Enrollment`/`SchoolMembership`/`ParentStudentRelationship` linking
it to a person it hasn't matched yet, so a plain query finds nothing to match
against.

## Decision

Cross-tenant identity matching runs through a narrow, privileged Postgres
function (`SECURITY DEFINER`, or an RLS-bypass role scoped to only this
function) that accepts a Massar code or a name+date-of-birth pair and returns
only match-candidate summaries — id, name, date of birth, Massar code —
never full profile data, relationship data, or which other schools a
candidate is associated with. The importing school never gets raw row access
to another tenant's `Person` data through this path; it gets a candidate to
propose, and INV-ZS-055 already requires the director's explicit confirmation
before any link is made. The function is called both at analyze time and
again at commit time, per [ADR-ZS-106](./106-onboarding-import-staged-batch-sync-analyze-async-commit.md)'s
re-validation rule.

## Consequences

**Positive**: import can do its job (find real cross-school matches) without
opening general cross-tenant read access to `Person`; the privileged surface
is one narrow, auditable function rather than a query pattern repeated (and
potentially gotten wrong) at every import call site.

**Negative**: every field a future import domain might need to match on
(e.g. a national ID, once CNIE import is allowed post-CNDP-authorization) has
to be deliberately added to this function's return shape — it can't be
worked around by just querying `Person` directly, which is the point, but
does mean the function needs its own change process rather than an ordinary
schema migration.

**Trade-off accepted**: a single well-audited privileged surface, and the
discipline of routing every cross-tenant match through it, over either
leaving `Person` matching broken by RLS or quietly granting broader
cross-tenant read access than import actually needs.
