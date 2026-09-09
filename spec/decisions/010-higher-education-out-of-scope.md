# ADR-ZS-010: Higher education and vocational training out of scope

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-29

## Context

The original product description's mention of a "school or professional career" and
an "academic passport" read ambiguously — did the product intend to eventually cover
higher education or vocational training, or only K-12? Left unresolved, this
ambiguity would have pulled the level/track data model toward generality it doesn't
need yet, at real modeling cost.

## Decision

The product's target is preschool through the baccalaureate. "Professional" in the
original description refers to teachers' careers, not a student's post-K-12 path.
Extension to higher education is explicitly out of scope. The level model stays
generic enough not to preclude a future extension, without being built for one now.

## Consequences

**Positive**: removes an ambiguity that would otherwise have justified building
more generality into the level/track model than the actual K-12 target needs.

**Negative**: a school group that also runs a higher-education or vocational arm
gets no platform support for that arm; those students fall entirely outside the
product.

**Trade-off accepted**: a focused K-12 scope over a broader "cradle to career"
ambition, while keeping the level model generic enough to not foreclose a later
extension if the business case for one emerges.
