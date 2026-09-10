> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-STK                                                    |
> | Revision       | 1.1                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Effective                                                       |
> | Author         | ZSchool Product                                                |
> | Classification | Technical Architecture Summary                                  |
> | Change History | 1.0 (2026-09-09): Thinned from the repo-root `STACK.md` during the qadi-style spec migration, Phase 8. Every individual architecture decision STACK.md argued for now lives as its own ADR (`spec/decisions/081-104-*.md`) — this file summarizes and points to them rather than re-arguing them, per the migration plan. 1.1 (2026-09-09): ADR-ZS-091 resolved Accepted; "still-open item" note rewritten as resolved (CCR-ZS-002). |

# ZSchool — Technical Stack Summary

The full architecture reasoning (context, trade-offs, alternatives rejected)
lives one decision per file in `spec/decisions/081-effect-v4-as-application-runtime.md`
through `spec/decisions/104-clamav-upload-scanning.md`. This document is the
short index plus the material that isn't itself a decision: pinned versions,
open technical risks, and next steps.

## 1. Architecture decisions at a glance

| ADR | Decision |
|---|---|
| `ADR-ZS-081` | Effect v4 as the application runtime |
| `ADR-ZS-082` | HttpApi on NodeHttpServer, deployed as a Function Alchemy |
| `ADR-ZS-083` | Neon Lakebase Postgres over DynamoDB |
| `ADR-ZS-084` | Versioned SQL migrations via Effect's Migrator, no ORM |
| `ADR-ZS-085` | Amazon Cognito with a custom OTP authentication flow |
| `ADR-ZS-086` | Alchemy as the Infrastructure-as-Code foundation |
| `ADR-ZS-087` | React 19 + Vite 8 PWA SPA over Next.js SSR |
| `ADR-ZS-088` | `@effect-cucumber/vitest` as the BDD runner |
| `ADR-ZS-089` | GitHub Actions with per-PR Alchemy preview stages |
| `ADR-ZS-090` | `@effect/opentelemetry` to CloudWatch over an external observability SaaS |
| `ADR-ZS-091` | **EU hosting (AWS eu-central-1) as a deviation from the Morocco-hosting baseline** — Status: Accepted (product-owner sign-off 2026-09-09); see the ADR for the CNDP legal-basis detail |
| `ADR-ZS-092` | Postgres Row-Level Security as defense-in-depth behind application authorization |
| `ADR-ZS-093` | shadcn/ui on Tailwind CSS 4, components copied into the repository |
| `ADR-ZS-094` | react-hook-form with a custom Effect Schema resolver, zod rejected |
| `ADR-ZS-095` | Lambda arm64 (Graviton) over x86_64 |
| `ADR-ZS-096` | The `@qadi` family for authorization |
| `ADR-ZS-097` | TypeScript 7.x native compiler (tsgo), with a 5.9 fallback documented |
| `ADR-ZS-098` | Offline-first PWA via IndexedDB and a sync queue |
| `ADR-ZS-099` | SQS with idempotent workers for MVP async processing, workflow deferred |
| `ADR-ZS-100`–`104` | Postgres full-text search, per-PR/per-BDD-run Neon branching, pnpm workspaces (no monorepo tool), CloudFront for static assets only, ClamAV upload scanning |

**Resolved**: `ADR-ZS-091` (EU hosting) was a live deviation from the product's
original Morocco-hosting expectation, escalated to the product owner ahead of
RDM-ZS-004 and the 15/12/2026 CNDP filing deadline (`spec/cross-cutting/07-legal-compliance-data-protection.md`
`CNF-ZS-001`). The product owner accepted it on 2026-09-09: production, database,
and storage are AWS `eu-central-1`; DR replicates cross-region to `eu-west-3`
(risk 3 below); the Morocco/OCI-specific requirements it superseded
(SEC-ZS-024/025/026, INT-ZS-036/037/039/040, NFR-ZS-009/010, RSK-ZS-011) have been
redefined accordingly.

## 2. Pinned versions (npm registry snapshot, 09/09/2026)

| Package | Version | Note |
|---|---|---|
| `effect`, `@effect/vitest`, `@effect/platform-node`, `@effect/atom-react`, `@effect/opentelemetry`, `@effect/sql-pg` | `4.0.0-rc.112` (`rc` dist-tag) | v4 RC line; watching for GA |
| `@effect-cucumber/vitest` / `@effect-cucumber/gherkin` | `^0.7.0` | pre-1.0, API may still change; vitest peer range moved from `<5.0.0` (through `0.6.0`) to `>=5.0.0 <6.0.0` (from `0.7.0`) |
| `vitest` | `^5.0.0` | ceiling tracks whichever range `@effect-cucumber/vitest`'s current release supports |
| `react`, `react-dom` | `19.2.x` | |
| `vite` | `8.2.x` | |
| `typescript` | `7.x` (tsgo) | aligned with the effect repository |
| `node` | `22.x` LTS | Lambda runtime `nodejs22.x` |
| `pnpm` | `11.x` | |
| `alchemy` | `2.0.0-beta.76` (`latest` dist-tag) | "Infrastructure as Effects" IaC; aligned with `effect@rc` |
| `@qadi/*` (core, http, react, predicate-sql, audit, testing, devtools) | `0.5.0` | depends on `effect` pinned exactly to `4.0.0-rc.112` → upgrades move in lockstep with the RC |
| `shadcn` (CLI), `tailwindcss` | `4.21.x` / `4.3.x` | components copied into the repository (zero runtime dependency); Tailwind 4 CSS-first |

Routing/i18n/long-tail UI and tooling (TanStack Router, i18next, TanStack
Table, Recharts, cmdk, sonner, vaul, react-day-picker, lucide-react, Dexie,
exceljs `4.4.x`, `@faker-js/faker` `10.6.x` for fixtures, k6, Playwright):
latest stable at repository start, pinned in `package.json` at creation
time.

## 3. Technical risks and watch items

| # | Risk | Treatment |
|---|---|---|
| 1 | Effect v4 is still RC (not GA): the API may still change before GA | Pin `4.0.0-rc.112`; confine `unstable/*` behind `packages/domain` and the adapters |
| 2 | `@effect-cucumber/vitest` is pre-1.0, with a Vitest peer-dependency ceiling that has already moved once (`<5.0.0` → `>=5.0.0 <6.0.0` at `0.7.0`) | Accepted and tracked; the `.feature` files (standard Gherkin) remain stable by construction |
| 3 | Neon region is final; single-region dependency on `eu-central-1` | PITR + S3 exports replicated to `eu-west-3` + IaC rebuild; quarterly drills (`NFR-ZS`, savings/DR domain) |
| 4 | Arabic PDF (shaping/RTL) under a tight deadline (report card under 3s) | A spike at MVP start; two tooled options |
| 5 | Cognito + OTP via a Moroccan aggregator (custom triggers) | Prototype the auth flow before pilot onboarding (rate limiting, no enumeration — `spec/risks.md`) |
| 6 | Latency between Morocco and `eu-central-1` (~80-100ms round trip) vs pages under 2s on 4G | Ample margin; measured in k6 campaigns (`ADR-ZS-...` v `spec/decisions/`); connection pooling mandatory |
| 7 | Loss of the "hosted in Morocco" argument with schools | Carried by the product owner in the `ADR-ZS-091` escalation |
| 8 | Alchemy's maturity gap: Cognito, API Gateway HTTP API v2, WAF have no dedicated resources | Cognito via a custom resource over typed AWS APIs; JWT verified in-app; application-level rate limiting |
| 9 | `@qadi` coupled by an exact pin (`effect@4.0.0-rc.112`, no version range) | The workspace upgrades in lockstep on the (Effect RC, `@qadi` 0.4.x) pair; `@qadi` application-level authorization is the sole enforcement layer today (see risk 10 — RLS is not currently an independent backstop) |
| 10 | **Neon grants every project role `BYPASSRLS`, including a freshly-provisioned least-privilege role, and the project owner cannot revoke it via `ALTER ROLE ... NOBYPASSRLS`** (verified directly against `zschool_app`: refused with "Only roles with the CREATEROLE attribute and the ADMIN option on role may alter this role") | ADR-ZS-092's Postgres-RLS-as-defense-in-depth is written and installed correctly (`tenant_isolation` policies, `FORCE ROW LEVEL SECURITY`) but is not an enforced second layer on this Neon project today — `@qadi` is the sole enforcement until Neon exposes a way to provision a non-`BYPASSRLS` role (a support request, or a plan/feature not yet checked); tracked, not silently assumed fixed |

## 4. Next steps

No throwaway work: everything flagged here is a deliverable of the first
vertical slice or a backlog task — never an isolated spike.

1. **Product-owner arbitration — hosting.** Resolve `ADR-ZS-091`'s escalation before the roadmap milestone it blocks (`spec/roadmap.md`) and before the dated CNDP deadline (`spec/cross-cutting/07-legal-compliance-data-protection.md` `CNF-ZS-025`); update the baseline through the escalation mechanism.
2. **Monorepo scaffolding.** pnpm workspaces (`apps/web`, `apps/api`, `apps/workers`, `packages/{domain,db,clients,infra}`, `features/`); tooling (oxlint, dprint, tsgo, Vitest 4); the Alchemy project (`dev`/`staging`/`prod` stages, dedicated state store); separate Neon projects, production locked down.
3. **First vertical proof slice.** One trivial module end to end: an English `.feature` → `Schema` (`packages/domain`) → an HttpApi endpoint (Cognito JWT verified in-app + a traced `@qadi/http` decision) → a per-PR Neon branch (migrations + fixtures) → a Function Alchemy deployed on a `pr-N` stage; acceptance criteria: the Gherkin scenario runs in CI, the authorization decision is traced, an OpenAPI export is generated. This is the proof required by the roadmap; it puts risks §3.1, §3.2, §3.5, and §3.8 above to the test.

---

_Full traceability from every architecture decision to the requirements and
invariants it satisfies is in `spec/traceability.md` §3 (decision
traceability). Full reasoning for each decision: `spec/decisions/`._
