# ADR-ZS-109: Person plus separate facet tables per profile type

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (minted during a `/grill-with-docs` session on the minimal Identity + Enrollment slice needed to unblock student + guardian import)

## Context

[ADR-ZS-014](./014-global-identity-multi-profile-account.md) establishes a
global `Person` who may carry multiple profiles at once (a parent who is also
a teacher elsewhere). The business spec doesn't fix a schema shape for this —
leaving open whether `Person` is one table with nullable columns for every
profile type's fields, or a shared `Person` table plus separate per-type
facet tables.

## Decision

`Person` holds only genuinely shared fields (civil status, dual-script name,
date of birth, Massar code). `StudentProfile`, `GuardianProfile`,
`TeacherProfile`, and `StaffProfile` are separate tables, each with a 0..1
relationship to `Person`, holding only that profile type's own fields.

## Consequences

**Positive**: a person who carries two profiles (parent and teacher) is
naturally represented as one `Person` row with two facet rows, with no
duplicate identity and no column on either facet table ever null because it
belongs to a profile the person doesn't have. Each facet table's schema stays
honest about what a profile of that type actually needs.

**Negative**: any query that needs "all of a person's profiles" has to
explicitly check/join every facet table rather than reading one row; adding a
new profile type later means a new table, not a new column.

**Trade-off accepted**: a few more joins for whole-person queries, in
exchange for a schema where a profile's fields are exactly the fields that
profile type has — never a wide, mostly-null table shaped by the union of
every profile type that has ever existed.
