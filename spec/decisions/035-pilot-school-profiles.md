# ADR-ZS-035: Pilot school profiles

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-35

## Context

Validating the MVP against a single school archetype would leave real product gaps
undiscovered until commercial launch — a primary school, a middle/high school, a
multi-site group, and a trimester-based bilingual school each stress different parts
of the platform (structure templating, timetable complexity, cross-site
consolidation, assessment-period configuration).

## Decision

Four pilot profiles: a primary school of roughly 300 students, a middle/high school
of roughly 800 students, a multi-site group of over 2,000 students, and a bilingual
school running on trimesters, along the Casablanca–Rabat corridor. Confirmed by the
product owner on 9 September 2026.

## Consequences

**Positive**: exercises the MVP against genuinely different structural and
operational patterns before commercial launch, surfacing gaps a single-archetype
pilot would miss entirely.

**Negative**: four simultaneous pilots is a larger onboarding and support load
during the validation phase than a single pilot school would require.

**Trade-off accepted**: broader pilot coverage, at higher onboarding cost, over a
narrower single-pilot validation that risks discovering structural gaps only after
commercial launch — directly informs the k6 sizing campaigns (STACK.md §8) as well.
