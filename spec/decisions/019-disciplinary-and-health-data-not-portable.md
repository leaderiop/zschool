# ADR-ZS-019: Disciplinary and health data are not portable by default

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-08

## Context

The default transfer profile (INV-ZS-083) already carries identity, academic history,
and official documents automatically. Whether disciplinary records and health data
should travel with a transferring student the same way is a materially different
question — a disciplinary record following a student automatically could function as
an unappealable, permanent mark against a fresh start at a new school, and health
data carries its own heightened sensitivity under Law 09.08.

## Decision

Disciplinary and health data are not portable by default. Health data specifically
is never transferred automatically under any circumstance — a receiving school gets
neither unless the sending party explicitly shares it (health) or unless INV-ZS-083's
narrower academic scope happens to include it (it doesn't).

## Consequences

**Positive**: protects a transferring student from carrying an unreviewable
disciplinary shadow into a new school, and keeps health data — the most sensitive
category the product holds — under the tightest possible default.

**Negative**: a receiving school has genuinely less context about a new student than
it might want (a documented pattern of serious incidents, or a health condition
relevant to daily supervision), which it now has to obtain through other means
(direct conversation with guardians, the family disclosing it).

**Trade-off accepted**: student privacy and a clean-slate default over administrative
convenience for the receiving school — consistent with INV-ZS-081's broader rule that
internal/sensitive data isn't portable.
