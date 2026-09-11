# ADR-ZS-115: Testcontainers for automated test runs, Neon retained only for RlsPolicy.test.ts

> **Status:** Accepted
> **Date:** 2026-09-11
> **Historical aliases:** none

## Context

[ADR-ZS-101](./101-neon-branch-per-pr-and-per-bdd-run.md) committed to a Neon
branch per developer, per PR, and per BDD test run, but the per-run branch
automation was never actually wired up — `features/support/layers/db.ts`'s own
comment documented that every local run shared the one provisioned Neon
branch. CI's Gherkin/BDD test step was gated behind
`DATABASE_URL`/`APP_DATABASE_URL` secrets being configured, so a contributor
without those secrets got a green CI run that never executed the acceptance
suite at all. Every test run also depended on network access to Neon's
control plane, which is friction for anyone trying to run the suite offline
or in a fresh environment.

## Decision

The `unit` and `bdd` vitest projects stand up their own local, disposable
Postgres via `testcontainers` instead of depending on a Neon branch — no
secrets, no network dependency, and genuine per-run isolation for the first
time, closing the gap ADR-ZS-101 aspired to but never delivered. The exact
same `Migrator`/`SqlLive` machinery `runMigrations.ts` already uses against
Neon runs unmodified against the container, so there is only one migration
path to keep correct. CI's Neon-secrets-gated `if` condition is removed from
the BDD test step, which now runs unconditionally on every PR.

`packages/db/src/RlsPolicy.test.ts` is the deliberate exception and keeps
running against a real Neon branch, on its own vitest config
(`vitest.rls.config.ts`) and its own explicitly Neon-secrets-gated CI step.
The specific defect it guards against — `neonctl`-provisioned roles silently
inheriting Neon's `neon_superuser` role and its `BYPASSRLS` grant, the exact
bug migration `0007_replace_app_role.ts` exists to fix — is a Neon
control-plane behavior a vanilla Postgres container cannot reproduce. A
testcontainers-backed version of that one suite would pass for the wrong
reason and stop catching a regression of a bug this codebase already shipped
once.

ADR-ZS-101 is superseded by this decision. ADR-ZS-089's per-PR Alchemy
preview-stage deployment, and developers' personal Neon branches, are
unaffected — both are manual-workflow/review infrastructure, not automated
test infrastructure.

## Consequences

**Positive**: contributors can run the full unit + BDD suite with nothing but
Docker installed; the BDD suite can no longer be silently skipped by a
missing secret; every run gets a genuinely fresh, isolated database instead
of a shared branch.

**Negative**: two Postgres backends now exist for automated tests (a
testcontainers instance for everything, a real Neon branch for one suite),
which is one more thing for a future contributor to understand when deciding
where a new Neon-adjacent test belongs.

**Trade-off accepted**: keeping one suite deliberately coupled to a real Neon
branch — and therefore still gated on secrets and network access — rather
than making 100% of automated tests secret-free, because that one suite's
entire purpose is verifying a Neon-specific control-plane behavior no local
substitute can reproduce.
