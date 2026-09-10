# ADR-ZS-091: EU hosting (AWS eu-central-1) as a deviation from the Morocco-hosting baseline

> **Status:** Accepted — product-owner sign-off obtained 2026-09-09, ahead of RDM-ZS-004 and the 15/12/2026 CNDP filing deadline (CNF-ZS-001)
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §2) — deviates from ADR-ZS-007 (DEC-26)

## Context

ADR-ZS-007 committed to Morocco-based hosting specifically to avoid any Law 09.08
cross-border transfer question for minors' data. The product owner's 09/09/2026
instruction settled the backend on AWS serverless, and no AWS region exists in
Morocco as of that date — the two decisions are in direct tension, and something
has to give: either AWS serverless is abandoned in Morocco's favor, or Morocco
hosting is abandoned in AWS's favor, or a middle path is found. This is by far the
highest-stakes architectural decision in the stack, because it directly
contradicts a compliance-driven decision made with the same level of deliberation.

## Decision

Compute, database, and storage move to AWS `eu-central-1` (Ireland is not
available; Frankfurt is the nearest EU region to Morocco offering the needed
managed services). The legal basis shifts from "no transfer, so no transfer
question" to "the EU is on the CNDP adequacy list" (Deliberation No. 236-2015),
which exempts this specific transfer from requiring F118 authorization. Student
documents are served directly from S3 via pre-signed URLs (never proxied through a
non-EU CDN point of presence); CloudFront serves only the static SPA bundle
(ADR-ZS-103). The sub-processor registry is extended to cover AWS eu-central-1,
Neon/Databricks eu-central-1, and CloudFront. An automated residency-control check
(ADR-ZS-... in the residency-control family) replays the INT-ZS-040 Gherkin
scenario in CI against `alchemy plan`/state output.

This decision was recorded as **escalated**, not accepted, from 2026-09-09 until
the product owner's sign-off on the same date: the baseline update it required
went through the existing ESC mechanism (ADR-ZS-071) and is now settled ahead of
RDM-ZS-004 and of the 15/12/2026 CNDP filing deadline, whose forms describe the
processing activities and therefore need to describe the correct (EU) hosting
location before they're filed.

## Consequences

**Positive**: unblocks building on AWS as the product owner instructed, with a
defensible legal basis (EU adequacy) rather than an undocumented gap, and keeps the
architecture on a single, well-supported cloud platform rather than a hybrid
Morocco+AWS split.

**Negative**: loses the "hosted in Morocco" commercial argument as a differentiator
against foreign-hosted competitors — a real, named commercial cost, not a
hypothetical one. SEC-ZS-024, SEC-ZS-026, INT-ZS-036, INT-ZS-039, INT-ZS-040, and
NFR-ZS-009/NFR-ZS-010 as originally written (Morocco/OCI af-casablanca-1 specific)
are superseded and have been redefined for AWS `eu-central-1`; SEC-ZS-025/INT-ZS-037
(Moroccan cross-site DR) are redefined as cross-region EU DR (`eu-central-1` primary,
`eu-west-3` secondary, matching `spec/stack.md` §3 risk 3). RSK-ZS-011 (single OCI
availability domain in Casablanca) is likewise redefined around AWS `eu-central-1`'s
multi-AZ footprint and the remaining single-_region_ dependency.

**Trade-off accepted**: accepted by the product owner on 2026-09-09. The commercial
loss of the "hosted in Morocco" argument and the compliance shift to the CNDP
EU-adequacy basis (Deliberation No. 236-2015) are both knowingly taken in exchange
for building on AWS as instructed. Every requirement this ADR named above has been
updated to match; see each file's own Document Control "Change History" for the
specific edit.
