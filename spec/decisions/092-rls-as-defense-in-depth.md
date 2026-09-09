# ADR-ZS-092: Postgres Row-Level Security as defense-in-depth behind application authorization

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §4, §5)

## Context

Multi-tenant isolation (ADR-ZS-013, the school as tenant) is already enforced by
the `@qadi` application-level authorization layer, which compiles permission
predicates into SQL WHERE fragments. Relying on application-level filtering alone
means a single bug in one query path (a missing WHERE clause, a forgotten filter)
could leak data across tenants, with no independent layer to catch it.

## Decision

Postgres Row-Level Security, keyed on `school_id` plus session context, runs as a
second, independent enforcement layer behind the `@qadi` application-level
filtering — never as a replacement for it, but as defense-in-depth in case an
application-level filter is ever missing or wrong.

## Consequences

**Positive**: a single missed application-level filter no longer means a full
cross-tenant data leak — RLS is a structural backstop that doesn't depend on every
query author remembering to filter correctly.

**Negative**: two enforcement layers (application predicates plus database RLS
policies) have to be kept consistent with each other, and RLS policies add their
own maintenance surface as the schema evolves.

**Trade-off accepted**: the operational cost of maintaining two isolation layers
over relying on a single layer that a single missed filter could defeat entirely —
for a platform holding minors' data across hundreds of tenants, that risk isn't
acceptable to leave uncovered.
