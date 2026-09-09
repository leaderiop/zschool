# ADR-ZS-099: SQS with idempotent workers for MVP async processing, workflow deferred

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §4)

## Context

Effect's own `unstable/workflow` and `persistence` modules offer durable,
resumable multi-step workflows — a good fit for something like a multi-step Massar
import — but adopting them at MVP means taking on another `unstable/*` surface
(compounding the RC-line risk already accepted in ADR-ZS-081) for a capability
simpler queuing can cover at MVP's actual scale.

## Decision

MVP async processing (notifications, PDF generation, imports) uses SQS queues
consumed by idempotent Effect workers. `effect/unstable/workflow` + `persistence`
is treated as a V1 candidate specifically for multi-step Massar imports, not
adopted at MVP.

## Consequences

**Positive**: keeps MVP's async processing on a simple, well-understood primitive
(SQS plus idempotence) rather than adding a second `unstable/*` dependency before
it's actually needed.

**Negative**: a genuinely multi-step import with partial-failure recovery is
harder to express correctly with plain idempotent SQS workers than it would be with
a durable-workflow engine — some of that complexity is being deferred, not solved.

**Trade-off accepted**: simplicity now, deferring durable-workflow adoption to V1
when the Massar-import complexity actually justifies it, over taking on the RC-line
risk of a second unstable Effect surface before MVP needs it.
