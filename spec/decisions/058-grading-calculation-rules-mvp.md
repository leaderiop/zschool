# ADR-ZS-058: Grading calculation rules for MVP

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-17

## Context

Every MVP average, report card, and rank depends on a consistent set of grading
calculation rules, and none of these were specified precisely enough to implement
without ambiguity: how an unjustified absence affects a grade, how non-/20 scales
convert, how a subject with no grade is handled, how mid-period class changes
affect ranking, how trimester-to-semester correspondence works for Massar
alignment, and more.

## Decision

Ten rules govern MVP grading: unjustified absences default to a 0 (configurable);
justified absences/exemptions/"not assessed" are excluded from the denominator; any
non-/20 scale converts to /20 before weighting; a subject with no grade at closing
is excluded from the overall average and marked "NA"; grades stay attached to the
enrollment through a mid-period class change, with rank computed in the current
class; rank exclusion is an explicit indicator on `PeriodResult`; progressive grade
publication is MVP, configurable per school with a draft/published status on
`Mark`; any correction to a published report card creates a new version, no
exceptions; a per-school trimester-to-Massar-semester correspondence table with a
sensible default; a "not yet determined" year-end decision for certifying grade
levels updates once results import, before the grace period ends; a single internal
`Assessment` type covers "local unified exams," with external exams handled
separately.

## Consequences

**Positive**: every MVP-critical calculation (averages, report cards, rank) now has
an unambiguous, implementable rule instead of ten separate implicit assumptions
that different engineers or schools might resolve differently.

**Negative**: ten interacting rules is genuine complexity in the grading engine,
and several (the Massar correspondence table, the "not yet determined" decision
flow) need their own configuration UI.

**Trade-off accepted**: precision over simplicity, because grading correctness is
the single most trust-critical calculation in the product — an ambiguous rule here
produces wrong report cards, not a minor cosmetic issue.
