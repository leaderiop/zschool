# ADR-ZS-033: Teachers may declare experience at schools outside ZSchool, marked unverified

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-33

## Context

A teacher's professional history predates ZSchool and often includes schools that
will never be on the platform (public-sector schools, schools that have closed, or
simply schools that haven't onboarded). Restricting the career profile to only
platform-verified affiliations would understate every teacher's real experience,
undermining the professional-network feature's usefulness from the start.

## Decision

Teachers may declare experience at schools absent from ZSchool; it is shown as
"unverified," visually distinct from platform-confirmed affiliation periods.

## Consequences

**Positive**: keeps a teacher's professional profile complete and useful even for
experience the platform can never itself confirm, while never misrepresenting
unverified claims as confirmed ones.

**Negative**: the network now carries a mix of verified and unverified data that
every consumer of a teacher profile (a hiring school) has to read carefully,
including whatever gaming risk unverified self-declaration invites.

**Trade-off accepted**: a complete but mixed-confidence profile over a sparse,
platform-only-verified one — with the verified/unverified distinction itself
carrying most of the risk mitigation.
