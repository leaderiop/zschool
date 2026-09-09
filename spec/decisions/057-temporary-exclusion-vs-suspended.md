# ADR-ZS-057: Temporary exclusion sanctions are distinct from the SUSPENDED enrollment state

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-16

## Context

A disciplinary "temporary exclusion" sanction and the enrollment-level SUSPENDED
state look similar on the surface (both keep a student away from class
temporarily), but conflating them would let a student-life sanction accidentally
trigger enrollment-level consequences reserved for leadership decisions, and vice
versa.

## Decision

A temporary-exclusion sanction creates attendance records of type "exclusion
(administrative absence)" for its duration, with no absence notification and no
effect on attendance-rate counts. SUSPENDED remains reserved strictly for
administrative measures taken by school leadership; a sanction may propose
suspension but never applies it automatically.

## Consequences

**Positive**: keeps disciplinary action (a student-life function) and enrollment-
state changes (a leadership decision) as separate authorities, matching how real
school governance actually splits that responsibility.

**Negative**: a new attendance-record subtype ("exclusion") has to be introduced
and excluded correctly from every attendance-rate calculation, adding a case to
that logic.

**Trade-off accepted**: keeping the two concepts structurally separate, at the cost
of a new attendance-record subtype, over letting a disciplinary action silently
reach into enrollment-state territory it shouldn't have authority over.
