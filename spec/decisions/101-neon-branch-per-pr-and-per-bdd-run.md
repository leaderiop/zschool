# ADR-ZS-101: A Neon branch per developer, per PR, and per BDD test run

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §5, §9)

## Context

Given Neon's database choice (ADR-ZS-083) and its sub-second copy-on-write branch
creation, database-testing strategy still needed a concrete policy: share one
development/test database across everyone (risking test interference and
non-reproducible failures), or give every unit of work its own database.

## Decision

Every developer gets a personal Neon branch (`dev-*`); every PR gets its own
expirable `pr-N` stage branch (ADR-ZS-089); every BDD test run gets its own
ephemeral branch, created fresh, migrated, seeded with anonymized fixtures, and
kept only on failure (for diagnosis) via `AfterAllScenarios` — otherwise destroyed.
No test ever runs against the shared development database. Production runs on a
dedicated, access-restricted Neon project, entirely separate from these ephemeral
branches.

## Consequences

**Positive**: every Gherkin scenario run gets a deterministic, isolated database
with no possibility of cross-test interference or leftover state from a previous
run — directly enabling the acceptance-scenario reliability the BDD suite depends
on.

**Negative**: branch lifecycle management (creation, migration, seeding,
conditional retention, expiry) is itself a piece of infrastructure that has to be
built, via Alchemy resources, and kept working correctly.

**Trade-off accepted**: the overhead of branch-per-run lifecycle management over
either shared-database test interference or a slower, more manual database-reset
strategy between test runs.
