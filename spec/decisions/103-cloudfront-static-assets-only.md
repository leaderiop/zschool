# ADR-ZS-103: CloudFront serves only the static SPA bundle, never student data

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §2, §6) — part of the ADR-ZS-091 hosting deviation

## Context

Once compute and storage moved to AWS `eu-central-1` (ADR-ZS-091), a CDN in front
of the application raises its own data-boundary question: a CDN's points of
presence are geographically distributed by design, and if student documents were
served through it, that could route sensitive data through non-EU points of
presence — reopening exactly the cross-border transfer question ADR-ZS-091 was
trying to settle with the EU-adequacy argument.

## Decision

CloudFront serves only the static SPA bundle. Student documents and other
sensitive files are served directly from S3 `eu-central-1` via short-lived
pre-signed URLs, never proxied through CloudFront.

## Consequences

**Positive**: keeps every byte of actual student data within the EU region
boundary the adequacy argument (ADR-ZS-091) depends on, with the CDN's
geographic-distribution behavior confined entirely to non-sensitive static assets.

**Negative**: student documents don't benefit from CDN edge caching or
acceleration, which could matter for perceived load speed on slower connections.

**Trade-off accepted**: a strict data-boundary guarantee over CDN performance
benefits for sensitive files — non-negotiable given what ADR-ZS-091's EU-adequacy
argument actually depends on.
