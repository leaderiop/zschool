# ADR-ZS-082: HttpApi on NodeHttpServer, deployed as a Function Alchemy

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §4)

## Context

An Effect-based backend could either adopt a third-party HTTP framework (Express,
Hono) wrapped in Effect, or use Effect's own native HttpApi module. A wrapped
third-party framework means the API contract, error handling, and middleware model
live partly outside Effect's own type system and composition model.

## Decision

API contracts are declared with Effect's HttpApi (`effect/unstable/httpapi`) using
`HttpApiSecurity` for bearer-JWT authentication, implemented via `HttpApiBuilder`,
and deployed as a Lambda function URL declared as a Function Alchemy resource — the
same program runs locally (`alchemy dev`) and when deployed.

## Consequences

**Positive**: the API contract, security requirements, and implementation all stay
in Effect's own composable, typed model end to end, including on the React client
side via the typed HttpApi client — no boundary where type safety or Effect's error
model has to be bridged to a foreign framework.

**Negative**: `effect/unstable/httpapi` is, as the name signals, an unstable
surface — building the entire API layer on it carries the same RC-line risk as
ADR-ZS-081, concentrated in the most externally-visible part of the system.

**Trade-off accepted**: full Effect-native composition over the relative maturity
of an established framework like Express — accepted because a wrapped framework
would reintroduce exactly the kind of boundary-crossing complexity Effect's type
system is meant to eliminate.
