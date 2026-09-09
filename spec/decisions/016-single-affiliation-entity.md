# ADR-ZS-016: One affiliation entity, not several redundant ones

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-05

## Context

The original description used several overlapping, undefined entities for how a
person relates to a school as staff (SchoolMembership, TeacherMembership,
StaffProfile, an undefined "Relationship"), and its narrative assumed a sequential
career (leave one school, then join the next), which doesn't match the Moroccan
reality of part-time teachers working simultaneously at several schools.

## Decision

A single SchoolMembership entity links a person to a school, carrying a role and a
contract type, with dates, status, and permissions. Simultaneous affiliations at
different schools are explicitly authorized — nothing in the model assumes a
person leaves one school before joining another.

## Consequences

**Positive**: collapses four redundant, half-defined entities into one clear model,
and correctly represents the common part-time-teacher pattern instead of fighting
it.

**Negative**: every affiliation-scoped feature (permissions, hour totals, reporting)
has to be written with multiplicity in mind from the start — a teacher's context is
never assumed to be singular.

**Trade-off accepted**: a data model built around simultaneity from day one over a
simpler sequential model that would have been actively wrong for a large share of
the target teacher population.
