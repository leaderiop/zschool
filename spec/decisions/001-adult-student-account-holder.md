# ADR-ZS-001: An adult student becomes holder of their own account and data rights

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-20

## Context

Moroccan law (Family Code Art. 209) makes a person a legal adult at 18, and gives
parents no residual right to information about an adult child. The original product
description assumed guardians keep full access indefinitely, which is legally wrong
for adult students, but a hard cutoff at 18 (dropping guardians entirely) would break
the financial reality: parents typically keep paying school fees for a Terminal-year
student who turns 18 mid-year, and schools still need one legally reachable payer.

## Decision

At 18, the student becomes the holder of their own account and of the rights over
their own data. Guardian access to academic, disciplinary, and health data is kept
by default (so nothing breaks the day a student turns 18), but the adult student may
restrict it at any time, is informed of this right on reaching adulthood and at every
re-enrollment, and any restriction is logged and notified to the school. The
financial guardian keeps access to financial and contractual data for as long as they
remain liable for fees, independent of the student's own restrictions.

## Consequences

**Positive**: a legally correct default (adult autonomy) that doesn't silently orphan
a family's day-to-day workflow at the exact moment (Terminal year, national exams)
schools most need continuity; the restriction right is discoverable, not buried.

**Negative**: the permission model needs a distinct "financial guardian" access scope
that survives a restriction the student places on academic/disciplinary/health data —
one more axis product and support staff have to reason about correctly.

**Trade-off accepted**: defaulting to "guardians keep access" rather than "access
revoked at 18 unless re-granted" trades a small compliance-purist reading of Art. 209
for a workflow that doesn't break by surprise; the restriction right and its logging
are the compensating control.
