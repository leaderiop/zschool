# ADR-ZS-043: Mid-year data reprise for onboarding pilots

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-02

## Context

Because pilots onboard mid-school-year (ADR-ZS-041), the standard "import at the
start of a fresh year" onboarding flow doesn't fit — 100% of pilot students arrive
with an already-running school year: partial payment schedules, cheques already in
hand, current-semester grades in progress, and accumulated absences. Without a
dedicated mid-year path, every pilot school's payment schedules would be wrong from
day one.

## Decision

The bulk-import requirement (BEH-ZS-006) is extended to also import: payment
schedules with amounts already settled per student and installment, cheques on
hand, current-semester grades (with a published/draft status), and optionally
aggregated absences. A dedicated `(import) → ACTIVE` state-machine transition,
reserved to this import path and logged as "data reprise," requires a legal
guardian and a financial guardian already on file and defers acceptance of internal
rules and Law 09.08 notices to account claiming. The journey map's admission
process (JMP-ZS-003) gains a second window (mid-year reprise) alongside the normal
April–August window.

## Consequences

**Positive**: pilot schools get financially correct payment schedules and grade
continuity from day one, instead of starting the platform relationship with wrong
numbers that erode pilot trust immediately.

**Negative**: a materially more complex import path than a fresh-year import —
partial payment history, in-progress grades, and a dedicated state-machine
transition all have to be built and validated before the first pilot can onboard.

**Trade-off accepted**: import complexity, accepted because it's the only entry
path that works for real pilots — a fresh-year-only import would simply not be
usable by any of the four pilot profiles (ADR-ZS-035).
