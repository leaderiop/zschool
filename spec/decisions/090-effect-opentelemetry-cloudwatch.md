# ADR-ZS-090: @effect/opentelemetry to CloudWatch over an external observability SaaS

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §6)

## Context

Observability tooling for a system holding minors' data has to be weighed against
the sub-processor and cross-border data-transfer rules the platform is already
built around (ADR-ZS-007's Morocco/EU hosting reasoning, and the sub-processor
registry, SEC-ZS-023). A popular external observability SaaS (e.g. an EU-hosted
Sentry/Datadog) would add another sub-processor and another outbound data flow to
govern, for a capability CloudWatch already provides within the same AWS account
and region boundary already chosen for compute and storage.

## Decision

`@effect/opentelemetry` emits OTLP traces and metrics to CloudWatch, correlated by
Effect span. Any future external observability SaaS is treated as requiring
sub-processor registry review (SEC-ZS-023) before adoption, not as a default choice.

## Consequences

**Positive**: keeps telemetry data inside the same AWS account/region boundary
already governing compute and storage, without adding a new sub-processor or
data-transfer question to resolve.

**Negative**: CloudWatch's own tooling (dashboards, alerting, trace exploration)
is generally considered less polished than dedicated observability SaaS products,
which may cost engineering time in day-to-day debugging.

**Trade-off accepted**: staying within an already-governed data boundary over a
richer standalone observability product, consistent with treating every new
outbound data flow as a decision to justify, not a default.
