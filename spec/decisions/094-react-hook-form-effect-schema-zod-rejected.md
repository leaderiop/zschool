# ADR-ZS-094: react-hook-form with a custom Effect Schema resolver, zod rejected

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §7)

## Context

react-hook-form's default validation ecosystem is built heavily around zod, but
the domain model's validation rules already live in `packages/domain` as Effect
`Schema` definitions (shared between the API and the client, per STACK.md §7's own
statement that form validation must not duplicate logic). Adding zod would mean a
second, parallel validation vocabulary describing the same domain rules.

## Decision

Forms use react-hook-form with a custom resolver built over Effect `Schema`
directly; zod is not used anywhere in the stack.

## Consequences

**Positive**: exactly one validation definition per domain rule, shared end to end
between API and client — no risk of a zod schema and an Effect Schema silently
drifting apart for the same field.

**Negative**: a custom resolver is bespoke code to build and maintain, rather than
using react-hook-form's well-trodden, community-maintained zod integration.

**Trade-off accepted**: a small amount of custom integration code over introducing
a second validation library that would duplicate — and risk diverging from — the
domain's single source of truth in `packages/domain`.
