# ADR-ZS-018: Data ownership split between an author school and a data subject

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-07

## Context

This was the single most ambiguous point in the original description (C-05): the
global-history promise implied a student's data from every school should be
reachable everywhere, while other sections implied a new school should not
automatically see a former school's data, with nothing stating who actually decides
what gets shared. Left unresolved, the product's core value proposition (portable
history) and its multi-tenant isolation promise directly contradicted each other.

## Decision

Every academic data item has an author (the school that created it, within its own
context) and a data subject (the student, through their guardians). The school is
the operational custodian of data it authored; the data subject is its permanent
beneficiary, with the data subject's own read access to their published documents
surviving even after they leave that school. No automatic access exists between
schools — sharing follows a default transfer profile (INV-ZS-083) at transfer time, never
by default visibility.

## Consequences

**Positive**: resolves the model's central contradiction with one clean rule —
"who published it" and "who it's about" are different, well-defined roles, and every
subsequent access-control decision (INV-ZS-080 through INV-ZS-087) derives from this split
rather than needing its own separate justification.

**Negative**: every academic-data entity needs to carry both an author-school
reference and be reachable by the data subject independent of that school, which is
a more complex authorization model than either a pure school-owns-everything or a
pure student-owns-everything model would need.

**Trade-off accepted**: a two-role ownership model, more complex than either
extreme, because either extreme (school owns everything and a departing student
loses access; student owns everything and a school loses control of its own
records) breaks a requirement the product actually has to satisfy.
