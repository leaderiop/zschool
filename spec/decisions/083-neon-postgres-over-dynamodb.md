# ADR-ZS-083: Neon Lakebase Postgres over DynamoDB

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §5)

## Context

The product owner's brief explicitly named DynamoDB as an option alongside Neon.
The domain model (`spec/domain-model.md`, `spec/invariants.md`) is heavily
relational: roughly 66 entities and 45+ invariants that would each become native
DDL constraints (FK, CHECK, UNIQUE, exclusion) under Postgres, versus application
code under DynamoDB's single-table model — a cost and regression risk that scales
directly with the invariant count. Finance, multi-tenant permission enforcement,
and reporting all lean on relational joins and transactions DynamoDB doesn't offer
natively.

## Decision

Neon (Lakebase Postgres) is the database, with a project in AWS region
`eu-central-1`. DynamoDB is rejected: its strengths (massive-scale key-value
access, predictable key-based queries) match no actual constraint in the PRD, and
its weaknesses (no joins, no constraints, weak analytical queries) land exactly on
the modules — assessments, reporting, finance, transfers — that most need them.
Neon's branch-per-test-run capability (copy-on-write, sub-second creation) also
gives the Gherkin BDD suite (STACK.md §8) deterministic, disposable databases per
scenario run, which a DynamoDB-based design would have to build separately.

## Consequences

**Positive**: the 45+ domain invariants become enforceable database constraints
instead of 45+ pieces of application code each capable of drifting from the rule it
implements; Row-Level Security (ADR-ZS-092) becomes available as defense-in-depth;
Postgres full-text search (ADR-ZS-100) is available without a separate search
engine.

**Negative**: departs from one of the two options the product owner's brief
explicitly named, and commits to a single-region Neon project (a Neon project's
region is final at creation) as a genuine architectural constraint.

**Trade-off accepted**: relational correctness and lower invariant-regression risk
over DynamoDB's operational simplicity at extreme scale — a trade the PRD's own
shape (invariant-heavy, join-heavy, three-year target of ~500 schools) clearly
favors, at real three-year technical sizing, not hypothetical massive scale.
