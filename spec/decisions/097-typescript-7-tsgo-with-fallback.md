# ADR-ZS-097: TypeScript 7.x native compiler (tsgo), with a 5.9 fallback documented

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §3)

## Context

The effect repository itself builds under TypeScript 7.x's native compiler
(tsgo), and `@effect-cucumber/vitest` checks its own type guarantees under the
same compiler — staying aligned with that toolchain avoids a mismatch between how
the framework's own type-level guarantees are verified and how ZSchool's code is
checked. tsgo is new enough that not every build tool in the ecosystem supports it
yet.

## Decision

TypeScript 7.x (tsgo) is the primary compiler, aligned with the effect repository's
own toolchain, with a documented 5.9 fallback for any build tool that doesn't yet
support tsgo.

## Consequences

**Positive**: stays aligned with the exact toolchain the Effect ecosystem itself
uses to verify its own type guarantees, reducing the chance of a
compiler-version-specific type-checking mismatch.

**Negative**: tsgo's newness means some tooling may not support it yet, requiring
the documented fallback path to remain genuinely maintained, not just a note that
bit-rots.

**Trade-off accepted**: staying current with the ecosystem's own toolchain over
the safety of a longer-established compiler version — mitigated by keeping the 5.9
fallback path real and documented rather than aspirational.
