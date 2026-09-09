# ADR-ZS-011: Document seal and signature levels, phased V1 to V2

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-30

## Context

Official school documents (certificates, transcripts, the parent contract) need
enough evidentiary weight to be trusted by third parties (other schools, employers,
authorities), but Morocco's qualified electronic-signature ecosystem (DGSSI-accredited
providers) is a heavier integration than an MVP validation phase can absorb, and the
document-security requirement (INV-ZS-085, immutable/versioned report cards with a QR
verification code) has to ship well before that integration is realistic.

## Decision

In V1: the school's advanced electronic seal, a timestamp, and a verification QR
code. In V2: a qualified seal and timestamp through a DGSSI-accredited provider
(Barid eSign, AfricTRUST, or DamaneSign) for the certificate of departure,
certificates, and transcripts. The parent contract (Law 59.21) is signed
electronically at the advanced level throughout.

## Consequences

**Positive**: ships real document-authenticity guarantees (advanced seal + QR
verification) from V1 without blocking on a DGSSI-accredited provider integration
that isn't needed to validate the product with pilot schools.

**Negative**: documents issued in V1 carry a lower evidentiary tier than a fully
qualified signature would provide, which could matter for documents that end up in
a legal or administrative dispute before V2 ships.

**Trade-off accepted**: shipping document features early at the advanced-seal tier
over delaying the whole documents module until a qualified-signature integration is
ready — the QR-verification mechanism (ADR-ZS-060 records the later timing
refinement) gives most of the practical trust benefit in the interim.
