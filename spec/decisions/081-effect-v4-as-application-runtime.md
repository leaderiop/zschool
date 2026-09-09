# ADR-ZS-081: Effect v4 as the application runtime

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §4)

## Context

The product owner's brief specified TypeScript + Effect v4 + React directly, but
Effect v4 was still on the `rc` dist-tag (not GA) at the time this decision was
made, while Effect 3.x is the stable, widely-adopted line. Building on a
pre-release major version carries real API-churn risk; building on the stable line
would mean diverging from the product owner's stated technology direction and from
the sibling `@qadi` authorization library, which is itself pinned to the v4 RC.

## Decision

Effect v4 (`4.0.0-rc.112`, `rc` dist-tag) is the application runtime, with every
`@effect/*` package aligned to the same `rc` line.

## Consequences

**Positive**: matches the product owner's explicit brief, and keeps ZSchool aligned
with `@qadi`'s own exact-pinned dependency on the same RC — the two can only be
upgraded in lockstep, which this decision accepts rather than fights.

**Negative**: the API surface can still change before GA, and any breaking change
in the RC line has to be absorbed as it happens, without the stability guarantee a
GA release would offer.

**Trade-off accepted**: RC-line risk over stable-3.x conservatism, mitigated by
pinning the exact RC version and confining `unstable/*` surfaces behind
`packages/domain` and adapter packages (STACK.md §4) so an eventual breaking change
has a small, contained blast radius.
