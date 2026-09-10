# ADR-ZS-102: pnpm workspaces, no turbo/nx, while build times allow it

> **Status:** Superseded by [ADR-ZS-114](./114-turborepo-adopted-ahead-of-schedule.md) (2026-09-10)
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §9)

## Context

A monorepo this size (apps/web, apps/api, apps/workers, several packages,
features/) could adopt a dedicated monorepo build orchestrator (Turborepo, Nx) for
task caching and dependency-graph-aware builds, or rely on pnpm's own native
workspace support plus a straightforward CI pipeline. The added tool brings real
value once build times become a bottleneck, but also its own configuration surface
and learning curve before that point.

## Decision

pnpm workspaces manage the monorepo directly, with no turbo/nx layered on top,
explicitly "while build times allow it" — an intentionally revisitable choice, not
a permanent one.

## Consequences

**Positive**: a simpler toolchain with less configuration surface for the current
project size, avoiding premature investment in build-orchestration tooling before
it's needed.

**Negative**: CI build times will grow linearly with the monorepo's size until
this is revisited — no incremental/cached build behavior across packages exists
yet.

**Trade-off accepted**: current simplicity over anticipatory investment in
build-orchestration tooling, explicitly flagged as a decision to revisit once build
times actually justify the added complexity — not a permanent architectural
commitment.
