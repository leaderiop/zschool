# ADR-ZS-051: Adult-student handling (INV-ZS-042) is MVP, not deferred

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-10

## Context

Adulthood at 18 is a matter of law (Family Code Art. 209), not a product choice
that could reasonably be deferred, and the pilot cohort specifically includes
Terminal-year (2ème Bac) students who will turn 18 during the 2026-2027 school
year. Deferring adult-student handling past MVP would mean the pilots hit a legal
compliance gap during the pilot period itself.

## Decision

The adult-student model (ADR-ZS-001, INV-ZS-042, and the associated persona needs and
journey steps) is MVP, not V1 as some adjacent scope might otherwise suggest.

## Consequences

**Positive**: avoids a real legal-compliance gap that would otherwise surface
during the pilot period, when a real Terminal-year student turns 18 mid-pilot.

**Negative**: adds the full adult-student restriction/notification workflow (ADR-
ZS-001) to an already extended MVP wave (ADR-ZS-041).

**Trade-off accepted**: MVP scope growth over shipping a product that would be
legally non-compliant the moment a pilot's own Terminal-year students turn 18 —
not a hypothetical risk given the pilot timeline.
