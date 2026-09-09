# ADR-ZS-096: The @qadi family for authorization

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §4)

## Context

The PRD's own permission matrix (12 roles × 10 domains, `spec/cross-cutting/01-
permissions.md`) requires an authorization model with real structure — role-based
access scoped by class/level/school, fine-grained per-module permissions, and an
audit trail — not a simple flag-check. Building bespoke authorization from scratch
would mean re-solving policy representation, decision evaluation, and audit
logging as one-off code, with no independent verification that "unwired" access
paths fail safely by default.

## Decision

The `@qadi` family (core, http, react, predicate-sql, audit, testing, devtools)
provides authorization: permission tokens and a role DAG, a Schema-derived
policy-as-value ADT, and an Effect-based evaluator that returns an explainable,
traceable decision (`Trace`, `explain`, `renderTrace`). It is fail-closed by
default (an unwired resolver denies, never silently grants) and treats resolver
failure as distinct from denial (a resolver error raises in the error channel
rather than being conflated with "access denied"). The product owner's stated
criteria were feature richness and harmony with Effect, same as the IaC choice
(ADR-ZS-086). It is pinned to an exact `effect` version (`4.0.0-rc.112`, no version
range), and `@qadi/predicate-sql` compiles permission predicates into SQL WHERE
fragments as a complement to Postgres RLS (ADR-ZS-092), never a replacement for it.

## Consequences

**Positive**: gets a purpose-built, fail-closed authorization model with a
traceable decision log built in, matching the platform's own logging and
least-privilege requirements (INV-ZS-090/INV-ZS-091 in `spec/invariants.md`) without having
to build that from scratch.

**Negative**: the exact-pin dependency on `effect@4.0.0-rc.112` means the whole
workspace's Effect upgrade path is coupled to `@qadi`'s own release cadence — the
two can only move together, compounding the RC-line risk already accepted in
ADR-ZS-081.

**Trade-off accepted**: a purpose-built, well-matched authorization library with a
tight version coupling over either a looser-fitting general-purpose ACL library or
a bespoke build — the fit with the PRD's own permission-matrix complexity (chapter
30) was judged to outweigh the coupling risk.
