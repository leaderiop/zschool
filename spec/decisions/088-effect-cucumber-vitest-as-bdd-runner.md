# ADR-ZS-088: @effect-cucumber/vitest as the BDD runner

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §8)

## Context

The PRD's own acceptance criteria are already written as Gherkin scenarios
attached to each requirement, and the product owner's brief specified Vitest as the
test runner. Standalone Cucumber.js runs independently of Vitest's own test
process, and `@amiceli/vitest-cucumber` integrates Gherkin into Vitest but without
Effect-native service injection — every step would need its own manual wiring to
the Effect services (Layers) the application is built from.

## Decision

`@effect-cucumber/vitest` (`^0.7.0`) runs the Gherkin suite inside Vitest, with
Effect Layers injected directly into `describeFeature` (`shared` per Feature,
`perScenario` per scenario) and a compile-time guarantee that a step referencing a
service missing from the supplied Layer is a TypeScript error at the call site.

## Consequences

**Positive**: Gherkin scenarios get the same Effect-native, typed service
injection as the rest of the codebase, with missing-dependency errors caught at
compile time rather than discovered as a runtime failure inside a test.

**Negative**: the package is explicitly pre-1.0 (STACK.md §11.2) and its Vitest
peer-dependency ceiling has already moved once (`<5.0.0` through `0.6.0`,
`>=5.0.0 <6.0.0` from `0.7.0`) — the project's Vitest version stays coupled to
whichever range the library's current release supports.

**Trade-off accepted**: pre-1.0 tooling risk over either abandoning Effect-native
step injection (standalone Cucumber.js) or losing compile-time dependency checking
(`@amiceli/vitest-cucumber`) — mitigated by the fact that the `.feature` files
themselves (standard Gherkin) remain stable regardless of which runner executes
them.
