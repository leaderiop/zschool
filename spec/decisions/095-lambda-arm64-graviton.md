# ADR-ZS-095: Lambda arm64 (Graviton) over x86_64

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1)

## Context

AWS Lambda offers both x86_64 and arm64 (Graviton) architectures, with arm64
generally offering a better price-performance ratio for Node.js workloads and no
compatibility concerns for a pure Node.js/TypeScript codebase with no
native-binary dependencies that specifically require x86_64.

## Decision

Every Lambda function targets `nodejs22.x` on arm64 (Graviton).

## Consequences

**Positive**: lower compute cost at the platform's target scale (hundreds of
schools, hundreds of thousands of students, STACK.md §11.6's latency/cost
discussion) for no functional downside on a pure Node.js workload.

**Negative**: any future native dependency that only ships x86_64 binaries would
need an architecture-specific build step or a fallback to x86_64 for that function.

**Trade-off accepted**: a straightforward cost optimization with no identified
downside for the current dependency set — the lowest-risk decision in this batch.
