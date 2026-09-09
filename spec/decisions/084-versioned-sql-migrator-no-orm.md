# ADR-ZS-084: Versioned SQL migrations via Effect's Migrator, no ORM

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1)

## Context

Once Postgres is chosen (ADR-ZS-083), a query/schema layer still has to be picked:
an ORM (Drizzle, Kysely) offers a more familiar developer experience for
CRUD-style access, but neither has first-class support in the Effect v4 line at the
time this decision was made, and an ORM's generated queries are a layer between the
schema and the SQL that the domain invariants (ADR-ZS-083's whole rationale) have
to be trusted to preserve correctly.

## Decision

Data access uses `effect/unstable/sql` and `@effect/sql-pg` directly, with
versioned SQL migrations applied through Effect's own Migrator and tracked by
Alchemy's Neon resource.

## Consequences

**Positive**: schema and query logic stay in the Effect ecosystem's own tooling,
with no ORM abstraction between the invariant-bearing DDL and the SQL that actually
runs — the constraint enforcement ADR-ZS-083 is built around isn't mediated by a
third layer.

**Negative**: no ORM means more hand-written SQL and repository code than a
schema-first ORM would generate, and no automatic migration-diffing tool beyond
what Alchemy's Neon resource and `neon diff` provide.

**Trade-off accepted**: direct SQL control over ORM convenience, consistent with
keeping the database layer inside the same Effect-native, typed composition model
as the rest of the stack (ADR-ZS-081, ADR-ZS-082).
