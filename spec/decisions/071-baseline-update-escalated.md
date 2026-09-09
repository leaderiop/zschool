# ADR-ZS-071: The corresponding baseline update is escalated to the product owner

> **Status:** Escalated — pending product owner sign-off
> **Date:** 2026-09-09
> **Historical aliases:** ESC-03, historical alias: ARB-21b/ARB-25c divergence markers

## Context

The review that produced ADR-ZS-041 through ADR-ZS-066 resolved a large number of
PRD-level details that were never reflected back into `PROJECT.md` itself (the
frozen baseline): the permanent UTC+0 timezone switch, Law 59.21's Official Gazette
reference, the enrollment state-machine refinements (ADR-ZS-044), the login-
identifier distinction (ADR-ZS-048), the per-school health record (ADR-ZS-054), and
the ADR-ZS-041 MVP-scope extension. The PRD chapters now reflect these corrections,
but the baseline document they were meant to correct does not yet, which the
review flags as a gap the product owner — not the review itself — needs to close.

## Decision

Not yet decided. This ADR exists to hold the escalation, not to resolve it: whether
and how `PROJECT.md` gets updated to a new baseline version reflecting these
corrections is left to the product owner.

## Consequences

**Positive**: none yet — resolving this keeps the baseline and the PRD from
silently diverging further as more corrections accumulate downstream of it.

**Negative**: until resolved, `PROJECT.md` remains the frozen baseline in name
while several PRD chapters have already moved past it on these specific points —
anyone reading only the baseline gets a partially stale picture.

**Trade-off accepted**: none — this is an open decision, not yet made.
