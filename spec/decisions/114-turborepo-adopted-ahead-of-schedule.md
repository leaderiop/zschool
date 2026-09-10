# ADR-ZS-114: Turborepo adopted ahead of ADR-ZS-102's "while build times allow it" schedule

> **Status:** Accepted
> **Date:** 2026-09-10
> **Historical aliases:** none

## Context

[ADR-ZS-102](./102-pnpm-workspaces-no-monorepo-tool.md) decided pnpm
workspaces alone, explicitly "while build times allow it," calling the choice
"intentionally revisitable... not a permanent one." Monorepo scaffolding
carried out in an earlier session set up Turborepo with self-hosted remote
caching (`turbo.json`, the `turbo` devDependency, `infra/remote-cache`)
directly, without a build-time threshold ever being measured or a decision
recorded to revisit ADR-102. Proceeding with implementation on top of an
undocumented contradiction between the recorded architecture and the actual
scaffolding isn't acceptable — either the code should match ADR-102, or the
decision needs to actually be revisited and recorded.

## Decision

Turborepo is kept. ADR-ZS-102 is superseded: task orchestration and caching
use Turborepo from the start of implementation, not deferred until build
times justify it. The remote-caching setup already scaffolded
(`infra/remote-cache`) is retained as the caching backend.

## Consequences

**Positive**: the monorepo gets dependency-graph-aware builds and caching
from day one of feature implementation, rather than adding it mid-project
once CI times have already become painful — and the spec now accurately
reflects what the code actually does, instead of silently diverging from it.

**Negative**: `turbo.json`'s task graph and remote-cache configuration are
now a piece of infrastructure to maintain from the start, and every future
package added to the workspace needs its task definitions kept consistent
with Turborepo's expectations — overhead ADR-ZS-102 had deliberately deferred.

**Trade-off accepted**: taking on build-orchestration tooling before ADR-ZS-102's
own stated threshold ("while build times allow it") was ever reached, in
exchange for not carrying a repo where the code and the recorded architecture
disagree with each other from the very first implemented ticket onward.
