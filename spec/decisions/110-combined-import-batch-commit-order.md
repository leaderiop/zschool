# ADR-ZS-110: Combined import batch commits classes, then guardians, then per-student units

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (minted during a `/grill-with-docs` session on the minimal Identity + Enrollment slice needed to unblock student + guardian import)

## Context

BEH-ZS-006 specifies one workbook with one sheet per domain (students,
guardians, teachers, classes, grades) — not separate uploads per domain. A
student row references a target class and, per INV-ZS-021, needs its
guardians resolved before the "at least one legal guardian and one financial
guardian" import-activation check (BEH-ZS-047) can run. ADR-ZS-050 already
establishes that guardians are deduplicated within the file by mobile number
at analyze time, so by commit time each unique guardian appears once, shared
by however many student rows reference them (e.g. siblings). Neither BEH-ZS-006
nor ADR-ZS-106 fixes the actual commit order or the retry unit for a batch
spanning several domains at once.

## Decision

A combined batch commits in dependency order: **classes** first (so a
student row's class reference resolves), then **guardians** — each unique,
already-deduplicated guardian committed exactly once, matched via
[ADR-ZS-108](./108-cross-tenant-matching-security-definer-function.md)'s
matching function — then **students**, committed as a per-student unit: match
or create the student's `Person` and `StudentProfile`
([ADR-ZS-109](./109-person-separate-facet-tables.md)), create
`ParentStudentRelationship` rows to the already-committed guardians, evaluate
import-activation eligibility, and create the `Enrollment`. The retry unit
stays row-level per ADR-ZS-106, but for the students pass a "row" is one
student family unit — a shared guardian committed in the earlier pass is
never re-created or re-committed when a sibling's row is retried.

## Consequences

**Positive**: a student row can always resolve its class and guardian
references at commit time, since both were committed in an earlier pass of
the same batch; a shared guardian is committed exactly once regardless of how
many students reference them, and retrying a failed student never risks
duplicating that guardian.

**Negative**: a batch now has internal phase structure (classes, then
guardians, then students) rather than being a flat list of independent rows —
a failure in the guardian pass blocks every student row that depends on it
from even being attempted, not just the guardian's own row.

**Trade-off accepted**: phased, dependency-ordered commits over a flat
single-pass model that can't guarantee a student's class and guardians exist
by the time its own row is processed.
