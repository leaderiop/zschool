# ADR-ZS-086: Alchemy as the Infrastructure-as-Code foundation

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §11.8)

## Context

Standard AWS IaC options (CDK v2, SST v3, SAM) all introduce a second paradigm
alongside the application's own Effect-based code — CDK synthesizes CloudFormation
from a separate construct model, for instance — meaning infrastructure definitions
and application code live in different mental models even though they describe the
same system. Alchemy instead expresses infrastructure as Effect programs directly.

## Decision

Alchemy 2.x ("Infrastructure as Effects") is the IaC foundation: infrastructure and
application code share the same Effect program, with typed IAM bindings, env vars,
and clients. The product owner's stated criteria were feature richness and harmony
with Effect/Neon specifically — maturity and popularity were explicitly out of
scope for this choice.

## Consequences

**Positive**: infrastructure definitions get the same type safety and composition
model as the rest of the codebase, and a Neon-branch-per-PR/per-BDD-run workflow
(ADR-ZS-101) is expressible as an ordinary Alchemy resource rather than a bolted-on
script.

**Negative**: Alchemy has no first-class resource for several AWS services the
architecture needs (Cognito, API Gateway, WAF — STACK.md §11.8), each requiring a
custom-resource wrapper over the typed AWS API instead of a maintained,
purpose-built construct.

**Trade-off accepted**: a less mature IaC ecosystem, accepted on the product
owner's explicit criteria (Effect/Neon harmony over maturity), with the missing-
resource gaps closed individually via typed custom resources (ADR-ZS-085 for
Cognito) rather than reconsidering the IaC choice itself.
