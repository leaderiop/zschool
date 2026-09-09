# ADR-ZS-029: Every academic data item is tied to an enrollment

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-18

## Context

Without an explicit rule, academic data (a grade, an attendance record, a document)
could conceivably be attached directly to a person's global identity, "floating"
free of any specific school-year context. That would blur exactly the school/
identity separation the whole domain model (ADR-ZS-013, ADR-ZS-014) depends on, and
would make it unclear which school's isolation boundary a given piece of data falls
under.

## Decision

Every academic data item is tied to an enrollment — never attached directly to the
global identity as "floating" data with no school-year context.

## Consequences

**Positive**: keeps the isolation model (ADR-ZS-013) and the ownership model
(ADR-ZS-018) coherent — every academic record has an unambiguous authoring school
and school-year context by construction, not by convention that could be violated.

**Negative**: any feature that seems to want identity-level academic data (e.g. "this
student's lifetime grade trend across every school") has to be built as an explicit
cross-enrollment aggregation, never as a simpler direct query.

**Trade-off accepted**: a stricter, enrollment-anchored data model over the
convenience of identity-level academic fields, because the latter would silently
undermine the isolation and ownership rules the rest of chapter 6 depends on.
