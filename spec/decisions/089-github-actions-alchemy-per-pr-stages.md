# ADR-ZS-089: GitHub Actions with per-PR Alchemy preview stages

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §9)

## Context

Given Alchemy as the IaC foundation (ADR-ZS-086), the CI/CD pipeline needed a way
to give every pull request its own fully deployed preview (API, database branch)
for both manual review and the Gherkin acceptance suite to run against — a shared
staging environment would create test interference between concurrent PRs and
wouldn't let a reviewer click through a real, isolated instance of the change.

## Decision

GitHub Actions runs lint, unit tests, and the Gherkin suite on every PR, then the
official Alchemy Action deploys a `pr-N` stage (a full preview: API on a function
URL, a dedicated Neon branch) via OIDC identities; merges to `main` deploy to
staging, and production promotion is a separate `--stage prod` deploy. Previews are
destroyed automatically when the PR closes.

## Consequences

**Positive**: every PR gets a genuinely isolated, fully deployed environment
(application and database both), which both catches integration issues before
merge and gives reviewers something real to click through, not just a diff.

**Negative**: a per-PR full deployment (compute, database branch, preview URL) is
more CI/CD infrastructure cost and complexity than running tests against a single
shared environment.

**Trade-off accepted**: per-PR isolation and reviewability over the lower cost of
a shared staging environment — directly enables the ephemeral-Neon-branch-per-run
testing strategy (ADR-ZS-101) the BDD suite depends on.
