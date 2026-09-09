# ADR-ZS-060: The verification QR code ships at V1, not with the earlier immutability decision

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-19

## Context

Two decisions in the source material both mentioned a report-card verification QR
code at different timings — ADR-ZS-020 (ADR-ZS-020) implied it alongside immutability,
while ADR-ZS-011 (ADR-ZS-011) explicitly places the QR code at V1 as part of the
advanced-seal document tier. ADR-ZS-011 is the later, more specific decision.

## Decision

The verification QR code ships at V1, consistent with ADR-ZS-011. ADR-ZS-020's
report-card immutability and versioning ship at MVP without the QR code; the MVP
Gherkin acceptance criteria for report cards no longer reference the QR code.

## Consequences

**Positive**: resolves a genuine timing conflict between two earlier decisions in
favor of the later, more specific one, and keeps the MVP requirement set honest
about what actually ships at MVP versus V1.

**Negative**: MVP report cards carry versioning and a fingerprint but not the QR
verification a reader might expect from the "immutable, verifiable" framing in
ADR-ZS-020 alone.

**Trade-off accepted**: consistency with the later, more specific decision (ADR-
ZS-011) over leaving both timings simultaneously implied, which would have left
implementers to guess which one governs.
