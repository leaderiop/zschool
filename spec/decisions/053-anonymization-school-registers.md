# ADR-ZS-053: Schools keep an identity snapshot in their registers after anonymization

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-12

## Context

ADR-ZS-003's retention rules keep enrollment registers permanently, but the global
identity itself can be anonymized after prolonged inactivity (ADR-ZS-003, INV-ZS-086).
Without reconciling the two, a permanently-retained register could end up
referencing an identity that no longer carries a name at all, breaking the
register's own archival purpose (certificate reissuance years later).

## Decision

When a global identity is anonymized, each school keeps its own identity snapshot
(name in both scripts, date of birth, Massar code) inside its own enrollment
register, under that school's custodial responsibility, for the register's own
permanent retention period. A new invariant (INV-ZS-004, now in `spec/invariants.md`)
codifies this.

## Consequences

**Positive**: keeps the register's actual archival purpose (reissuing a
certificate to a former student decades later) intact even after the global
identity itself is anonymized.

**Negative**: creates a second, school-local copy of identity data that
technically survives the "anonymization" of the global identity — a nuance that has
to be communicated clearly in any privacy documentation, since it isn't full
erasure.

**Trade-off accepted**: a school-local snapshot surviving anonymization over a
register that would otherwise become useless for its own stated legal purpose —
directly required by ADR-ZS-003/ADR-ZS-003's "kept permanently" register rule.
