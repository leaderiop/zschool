# ADR-ZS-020: Published report cards are immutable and versioned

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-09

## Context

A report card is the single most consequential document the platform produces —
schools, parents, and downstream institutions all treat it as an authoritative
record. Left mutable, a published report card could be silently altered after the
fact with no trace, which is both a trust problem and, for a document families rely
on for enrollment elsewhere, a real harm if it happened by accident (e.g. a grade
correction overwriting the original instead of superseding it).

## Decision

A published report card is immutable and versioned, carrying a fingerprint, its
signer, and the publication date. Any correction creates a new version; the prior
version remains viewable, marked "superseded." (The verification QR code mentioned
alongside this decision was later retimed to V1 rather than shipping at the same
moment — see ADR-ZS-060.)

## Consequences

**Positive**: every report card a family or a third party ever sees is either the
authoritative current version or a clearly marked superseded one — no silent
rewrites, ever.

**Negative**: the report-card store has to carry every version permanently, and
every consumer of "the" report card has to be explicit about resolving to the
current version rather than any historical one.

**Trade-off accepted**: append-only versioning over simpler in-place edits, because
in-place edits are exactly the failure mode (silent, untraceable change to an
authoritative document) this decision exists to prevent.
