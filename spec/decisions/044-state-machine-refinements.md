# ADR-ZS-044: Enrollment state-machine refinements — SUSPENDED exits, CANCELLED, year end, re-entry

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-03

## Context

The baseline state machine (ADR-ZS-017) didn't fully specify several real
transitions the review surfaced: what happens when a SUSPENDED enrollment
eventually resolves, whether a CANDIDATE or PRE-ENROLLED admission that never
completes needs its own terminal state distinct from an active withdrawal, exactly
how year-end closing works across every present student, and whether a student can
ever re-enroll after a prior enrollment closed.

## Decision

Seven refinements: (a) SUSPENDED may exit to TRANSFERRED, WITHDRAWN, EXPELLED, or
COMPLETED under the same conditions as from ACTIVE. (b) A new CANCELLED terminal
state exists for CANDIDATE and PRE-ENROLLED, preserving admission-campaign history
without conflating it with a real withdrawal. (c) At year end, every present
student moves to COMPLETED with a year-end decision; TRANSFERRED/WITHDRAWN are
reserved for genuine mid-year departures; a "leaving at the start of next year" is
COMPLETED with no N+1 enrollment plus a dated TransferRequest. (d) A track-change
promotion is not treated as a departure. (e) Re-entry (a new enrollment for the same
student and school year) is allowed once the prior enrollment sits in any terminal
state other than SUSPENDED, logged as "re-entry" and linked to the prior enrollment.
(f) The re-enrollment bulk process only creates N+1 enrollments in PRE-ENROLLED
state and skips students who already have one. (g) The mid-year import path is
governed by ADR-ZS-043.

## Consequences

**Positive**: the state machine now has an answer for every real transition pilots
will actually hit, rather than leaving edge cases (an unresolved suspension, a
cancelled admission, a re-entry) undefined until they're discovered in production.

**Negative**: seven additional transition rules is real complexity added to what
was already the most heavily-relied-on part of the domain model.

**Trade-off accepted**: a fuller, more precisely specified state machine over
leaving these cases to be improvised inconsistently by whoever implements them
first.
