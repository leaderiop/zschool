# ADR-ZS-007: Production and backup hosting in Morocco

> **Status:** Accepted — later deviated from in practice, see ADR-ZS-091
> **Date:** 2026-09-09
> **Historical aliases:** DEC-26

## Context

ZSchool holds minors' personal data at national scale. Law 09.08 requires a
documented legal basis for any transfer of personal data outside Morocco, and
in-country hosting sidesteps that transfer question entirely for the bulk of the
platform's data, at the cost of ruling out the largest global cloud providers, none
of which had a Moroccan region at the time this decision was made.

## Decision

Production and backup hosting is in Morocco. No transfer of minors' data outside
Morocco occurs other than through messaging vendors (SMS, WhatsApp), which are
themselves governed by a CNDP F118 authorization specific to that flow.

## Consequences

**Positive**: the strongest possible position on data sovereignty for a platform
holding minors' data — no transfer-basis argument to make for the database, storage,
or compute layers at all, and a genuine commercial differentiator against
foreign-hosted competitors.

**Negative**: constrains cloud-provider choice to whichever Moroccan data centers
offer the managed services (database, object storage, serverless compute) the
platform's architecture actually needs — a materially smaller menu than AWS/GCP/Azure
offer globally.

**Trade-off accepted**: sovereignty and the associated commercial argument over
architectural flexibility — accepted at the time this decision was made; ADR-ZS-091
records the later product-owner instruction that moved compute and storage to AWS
`eu-central-1`, which reopens this trade-off under a different legal basis (CNDP's
EU adequacy listing) rather than in-country hosting.
