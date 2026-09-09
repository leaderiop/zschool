# ADR-ZS-002: One active enrollment per student per school year in the national system

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-21

## Context

Nothing in the original product description said whether a student could hold two
simultaneous enrollments — a real Moroccan pattern exists (a student attending a
regular school plus a private tutoring center, or dual enrollment across systems),
but modeling it fully means every attendance, grading, and finance rule has to ask
"which enrollment" at every step, for a case that doesn't materially change the
MVP's target schools.

## Decision

A student has at most one ACTIVE enrollment per school year within the national
system. Dual enrollment (a school plus a tutoring center, or any second concurrent
enrollment) is not modeled before V2.

## Consequences

**Positive**: every attendance record, grade, and report card can assume a single
current enrollment context, which is what most of the domain model (state machine,
finance, permissions) is built around.

**Negative**: schools running informal dual-track arrangements (a student enrolled
both in the school and in an affiliated tutoring/support program) have no way to
represent that in the platform before V2.

**Trade-off accepted**: correctness and simplicity for the overwhelming majority case
over completeness for an edge case that can be tracked manually until V2 justifies
the modeling cost.
