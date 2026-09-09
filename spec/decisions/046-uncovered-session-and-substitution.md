# ADR-ZS-046: Declaring an uncovered or substituted teaching session

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-05

## Context

Nothing in the original requirement set covered the everyday reality of a teacher
being absent or a session being cancelled or substituted — without a way to
declare this, an uncovered session would either wrongly count against attendance
statistics or simply go unrecorded, and the head supervisor (who deals with this
daily) had no requirement covering it at all.

## Decision

A new MVP requirement lets student-life staff or academic leadership declare a
teacher absence or a cancelled/substituted session. Declaring it removes the
session from expected attendance, flags the lesson log, and optionally notifies
parents.

## Consequences

**Positive**: keeps attendance rates accurate and gives the head supervisor — whose
daily workflow this is — a tool for a situation that happens routinely, not an edge
case.

**Negative**: one more requirement added to an already-tight MVP wave-1 scope.

**Trade-off accepted**: including this at MVP over deferring it, because without it
attendance-rate reporting (an MVP-critical metric) would be systematically wrong on
any day a teacher is absent.
