# ADR-ZS-021: A French and Arabic (RTL) interface from MVP onward

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-10

## Context

Moroccan private schools operate bilingually as a matter of course — official
documents, communication with families, and the ministry's own systems (Massar) all
use both French and Arabic, with Arabic requiring right-to-left layout. A
French-only MVP would be unusable for the "official document" and "communication"
surfaces of the product from day one, not a gap that could be patched in later
without a significant rebuild of every screen and document template.

## Decision

The interface ships in French and Arabic (full RTL) from MVP onward; English is
deferred to V2. Names are captured in dual script, and documents are bilingual.

## Consequences

**Positive**: every MVP-pilot school gets a genuinely usable product on day one
instead of a French-only product bolted with Arabic later — and RTL support baked
in from the start avoids the much larger cost of retrofitting layout, typography,
and document generation for RTL after the fact.

**Negative**: doubles (at minimum) the localization and QA surface for every screen
and document from the very first release, and RTL-aware component review has to
happen for every UI element, not just text.

**Trade-off accepted**: a materially larger MVP scope (full bilingual RTL) over a
faster French-only ship, because Arabic isn't a "nice to have" localization for this
market — it's a baseline requirement the pilots would reject the product without.
