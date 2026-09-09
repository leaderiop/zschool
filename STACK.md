# ZSchool — Technical Stack (STACK.md)

| Field | Value |
|---|---|
| Version | 0.2 — English translation (2026-09-09); draft for architecture review |
| Date | 2026-09-09 |
| Status | Proposal; the hosting deviation (§2) requires the product owner's arbitration |
| Sources | Product owner's instruction (09/09/2026: "AWS serverless, DynamoDB or Neon, TypeScript + Effect v4 + React, `@effect-cucumber/vitest` BDD"); `PROJECT.md` v1.2 (English edition); `prd/README.md` v1.1 and the chapters cited; Effect v4 repository (`~/Projects/Perso/effect`, `main` = 5a80204398, package lines `4.0.0-rc.112`); npm registry (09/09/2026); Neon documentation (neon.com/docs, 09/09/2026) |
| Related files | `prd/cross-cutting/31-security-privacy.md` (SEC-19..21), `prd/cross-cutting/32-non-functional-requirements.md` (NFR-DISP, NFR-SAV), `prd/cross-cutting/35-external-integrations.md` (INT-HEB and others), `prd/cross-cutting/37-roadmap-mvp-v1-v2.md` (JAL-02) |

---

## 1. Decision summary

| Layer | Choice | Main alternative rejected |
|---|---|---|
| Language | TypeScript (7.x branch, native tsgo compiler, aligned with the effect repository toolchain), strict ESM | — |
| Runtime | Node.js 22 LTS; Lambda `nodejs22.x`, arm64 (Graviton) | Lambda x86_64 (cost/perf) |
| Application runtime | Effect **v4** (`4.0.0-rc.112`, `rc` dist-tag) and `@effect/*` packages aligned to `rc` | Effect 3.x (stable but outside the product owner's brief) |
| API | Effect's HttpApi (`effect/unstable/httpapi`) on NodeHttpServer (`@effect/platform-node`), deployed as a **Function Alchemy** (function URL) | Third-party HTTP framework (Express/Hono) under Effect |
| Database | **Neon — Lakebase Postgres**, project in AWS region `eu-central-1` (Frankfurt) | **DynamoDB** (rejection reasoned in §5) |
| Data access | `effect/unstable/sql` + `@effect/sql-pg` (Neon PgBouncer pool), versioned SQL via Effect's Migrator | ORM (Drizzle/Kysely: absent from the v4 line) |
| Authentication | Amazon Cognito (custom authentication: SMS OTP via the INT-SMS aggregator), JWT verified in-app (`HttpApiSecurity`, JWKS) | Home-grown auth in the database (larger security surface) |
| Infra as code | **Alchemy** `2.x` ("Infrastructure as Effects") — infra and application code in the same Effect program (IAM bindings + env + typed client) | CDK v2 (a second paradigm: CloudFormation synthesis), SST v3, SAM |
| Frontend | React 19 + Vite 8 (SPA/PWA), TanStack Router, `@effect/atom-react` state, i18next FR/AR (RTL), **shadcn/ui** on Tailwind CSS 4 | SSR/Next.js (no MVP need, offline PWA is required) |
| BDD / tests | **Vitest 4.x + `@effect/vitest` + `@effect-cucumber/vitest` 0.4.0**, `.feature` Gherkin in English, ephemeral Neon branch per run | Standalone Cucumber.js, `@amiceli/vitest-cucumber` |
| CI/CD | GitHub Actions + the official Alchemy Action (OIDC): `alchemy plan` on PRs with a `pr-N` stage (preview + Neon branch), `alchemy deploy` for staging/prod | — |
| Observability | `@effect/opentelemetry` → OTLP → CloudWatch (logs, metrics, traces) | External stack (outbound flow to be governed, SEC-18) |

## 2. Deviation from the baseline: hosting (product-owner arbitration required)

The baseline and the PRD require production **in Morocco**: the OCI `af-casablanca-1` region and on-territory backups (DEC-26, SEC-19, SEC-21, INT-HEB-01/06 — **Must MVP** requirements, with a Gherkin residency-control scenario), a disaster-recovery plan to a second Moroccan site (SEC-20, INT-HEB-02, V1), and JAL-02 makes verification of the OCI catalog an architecture exit criterion.

The product owner's instruction of 09/09/2026 settles on **AWS serverless**. No AWS region exists in Morocco as of 09/09/2026. As a consequence:

1. **SEC-19, SEC-21, and INT-HEB-01 are not satisfied as currently written**; SEC-20/INT-HEB-02 (cross-site Moroccan DR) are redefined as cross-region EU DR. Updating the baseline follows the existing escalation mechanism (see ESC-01..03, `prd/cross-cutting/42-review-arbitrations.md`) and must be settled **before** JAL-02 and before the 15/12/2026 CNDP filings (CNF-25), whose forms describe the processing activities.
2. **Legal treatment adopted**: data hosted in the EU — AWS region `eu-central-1` (Ireland) for compute, database, storage, and email. The EU appears on the CNDP adequacy list (Deliberation No. 236-2015, cited in SEC-17 §4.3), which **exempts the transfer from F118 authorization**. The sub-processor registry (SEC-18) is extended to cover AWS (eu-central-1), Neon/Databricks (eu-central-1), and CloudFront.
3. **Student documents**: served directly from S3 `eu-central-1` via pre-signed URLs; CloudFront serves only the static SPA bundle, so no student data passes through non-EU points of presence.
4. **What is lost**: the commercial argument "data hosted in Morocco" (an advantage explicitly cited against competitors hosted outside Morocco, `prd/cross-cutting/33-business-model-packaging.md` §5). To be arbitrated with full awareness of the trade-off.
5. **Continuity**: the 8-hour RTO / 15-minute RPO for a site disaster (NFR-DISP-03, ARB-25i) become achievable via Neon PITR + cross-region S3 replication to `eu-west-3` (Paris) + IaC rebuild; daily replication from MVP onward (SEC-21, ARB-25h, a 24-hour fallback RPO recorded in the pilot agreement); quarterly restore drills (NFR-SAV-03).
6. **Automated residency control**: the INT-HEB-01 Gherkin scenario is replayed in CI — checking each resource's region from `alchemy plan`/state, checking bucket policies and replication destinations; a report is archived on every architecture change.

Alternatives rejected: OCI `af-casablanca-1` (no verified Lambda-equivalent serverless offering, catalog to be confirmed service by service — H-18; and outside the product owner's brief); waiting for an AWS Morocco region (does not exist); DynamoDB alone (§5).

## 3. Language and runtime

- **TypeScript** in strict mode, ESM ("type: module"), **7.x** branch (native tsgo compiler): the effect repository builds under `typescript ^7.0.2` and `@effect-cucumber/vitest` checks its type guarantees under tsgo; a 5.9 fallback is documented if a build tool does not yet support it.
- **Node.js 22 LTS** everywhere (local, CI, Lambda `nodejs22.x`); **arm64** Lambda targets.
- Package management: **pnpm 11** (same generation as the effect repository, `pnpm@11.20.0`).

## 4. Effect v4 and its ecosystem

Structure observed in the v4 repository (`~/Projects/Perso/effect`) and on npm (`rc` dist-tag, all published at `4.0.0-rc.112`):

| Package | Role in ZSchool |
|---|---|
| `effect` (core) | `Effect`, `Schema` (domain model, `Schema.Class`, `Schema.TaggedError`), `Context.Service` + `Layer`, `Config`, `DateTime`, `Clock`, `Scope`; sub-namespaces `effect/unstable/{sql, httpapi, reactivity, workflow, persistence, rpc, cluster}` |
| `@effect/sql-pg` | PostgreSQL driver (pooled Neon connection in transaction mode) |
| `@effect/platform-node` | `NodeHttpServer`, outbound HTTP client (`NodeHttpClient` for INT-SMS/INT-WAP/INT-EML/INT-FAT) |
| `@effect/atom-react` | React-side state and data (replaces `@effect-rx/rx`, which stayed on the v3 line) |
| `@effect/vitest` | `it.effect`, Effect unit/integration tests |
| `@effect/opentelemetry` | OTLP traces/metrics |
| `@qadi/*` (core, http, react, predicate-sql, audit, testing, devtools) | Authorization: permission tokens, role DAG, policy-as-value (a Schema-derived ADT), an Effect evaluator returning a traceable decision |

Coding conventions (from the repository's `LLMS.md`): inline `Effect.gen`, `Effect.fn("name")` for reusable functions, services via `Context.Service` with `static layer`, validation exclusively through `Schema` (never manual parsing), composition via `Layer.provide`, `ManagedRuntime` for non-Effect entry points, `DateTime` + a `CurrentTimeZone` service — timestamps always stored in UTC, displayed in `Africa/Casablanca` (permanent UTC+0 since 20/09/2026, Decree No. 2.26.530).

- **API**: contracts declared with **HttpApi** (`effect/unstable/httpapi`) using `HttpApiSecurity` (bearer JWT from Cognito, verified in-app via JWKS), implemented by `HttpApiBuilder`; the Lambda is declared as a **Function Alchemy** and exposed via its function URL — the same program runs locally (`alchemy dev`) and when deployed. The React client consumes the **typed HttpApi client** end to end.
- **Authorization**: the `@qadi` family (aligned to `effect@4.0.0-rc.112`) — permission tokens and a role DAG modeling the PER matrix (12 roles × 10 domains, `prd/cross-cutting/30-*`, backed by `SchoolMembership`), policy-as-value (a Schema-derived ADT), `Effect` evaluation with attribute resolvers supplied as Layers; **fail-closed by default** (an unwired resolver means denial, never a silent grant) and **failure ≠ denial** (a resolver error raises in the error channel; it does not negate authorization); every decision carries an explainable `Trace` (`explain`, `renderTrace`). Enforcement: HttpApi middleware (`@qadi/http`) and `enforce`/`filter` combinators in workers; predicates compiled into SQL WHERE fragments (`@qadi/predicate-sql`) as a complement — never a replacement — to RLS (§5); an audit trail with retention (`@qadi/audit`, the foundation for the V1 `AuditLog` — D4, ARB-25j).
- **Async**: SQS queues consumed by idempotent Effect workers; `effect/unstable/workflow` + `persistence` (durable workflows) is a **V1** candidate for multi-step Massar imports — for MVP, SQS plus idempotence is enough.
- **RC tracking**: versions pinned to the `rc` dist-tag; watching the repository's changesets and the eventual GA switch; the `unstable/*` surfaces stay confined behind `packages/domain` and the adapters (§9), never imported directly into React components.

## 5. Data: Neon (Lakebase Postgres) — and the rejection of DynamoDB

**Decision: Lakebase Postgres via Neon**, project created in region `aws-eu-central-1` (as of 09/09/2026, Neon does not offer a Paris region; Frankfurt is the nearest EU region; a Neon project's region is final — the choice must be locked in at creation).

Reasons, grounded in the PRD:

1. **Heavy relational model**: ~66 entities and 45 invariants (`prd/03-domain-data-model.md`, INV-01..45). The invariants become native DDL constraints (FK, CHECK, UNIQUE, exclusions) verifiable by Gherkin scenarios; on DynamoDB (single-table), each invariant becomes application code — cost and regression risk proportional to 45.
2. **Multi-tenancy**: per-school isolation (PER matrix, `prd/cross-cutting/30-*`) enforced by Postgres **Row-Level Security** (`school_id` + session context) as defense in depth behind application-level filtering.
3. **Finance**: billing, payment schedules, cheques, CMI/Fatourati payments (FIN module, 30 FRs) require ACID transactions and analytical queries; reporting (RAP module) is SQL.
4. **Mid-year data reprise** (ARB-02, Massar imports): transactional imports with a validation report, more naturally expressed as set-based SQL.
5. **BDD**: Neon branches (copy-on-write, created in <1 s) give every test run a disposable database with a known schema plus test fixtures (§8) — determinism for Gherkin scenarios.
6. **Scale**: the 3-year target is roughly 300 schools / 200,000 students (DEC-27, Q-09; sized at 2.5×) with p95 pages under 2 s on 4G (NFR-PERF) — trivial for an indexed Postgres; the start-of-year peak (R-05) is absorbed by queues and batch processing (§6), not by the database.

**Rejection of DynamoDB**: its strengths (massive-scale key-value access, predictable key-based queries) match no constraint in the PRD; its weaknesses (no joins, no constraints, poor analytical queries) hit exactly the EVA/RAP/FIN/TRA modules. The invariants, the permission matrix, and reporting would make the domain more costly to prove through BDD, not less.

**Operations**:
- Lambda connection: **pooled** string (PgBouncer, transaction pooling); migrations and long-running jobs: direct string. TLS mandatory; the `DATABASE_URL` secret lives in Secrets Manager.
- **Migrations**: versioned SQL (`packages/db`), applied within the deployment graph by **Alchemy's Neon resource** (ordered, hashed files, tracked in `__alchemy_migrations`); the DDL carries INV-01..45; `neon diff` reviewed on every PR.
- **Backups**: Neon PITR + a daily encrypted `pg_dump` export to S3 `eu-central-1`, replicated (S3 CRR) to `eu-west-3`; restore tested quarterly (NFR-SAV-01..03, SEC-21 adapted, §2).
- **Branches**: one branch per developer (`dev-*`), one branch per PR (expirable `pr-N` stage), and one ephemeral branch per BDD run in CI (§8) — all declared as Alchemy resources; production runs on a dedicated Neon project with restricted access (secret authentication + TLS only).
- **Search**: Postgres full text (`tsvector` with `french` and `arabic` configurations, `pg_trgm` trigrams for typo tolerance) over dense lists (students, documents) — no external search engine at MVP; no distributed cache either (CloudFront for static assets is enough).

## 6. AWS serverless backend

| Component | Service | ZSchool notes |
|---|---|---|
| Compute | AWS Lambda `nodejs22.x` arm64 (Functions Alchemy) | API, SQS workers, scheduled triggers — code and infra in the same Effect program; container images only where needed (PDF) |
| API | Lambda function URL exposing the Effect HttpApi | No API Gateway: the Cognito JWT is verified in-app (`HttpApiSecurity`, JWKS) and rate limiting is application-level (R-16); no edge WAF at MVP; an OpenAPI export of the HttpApi (documentation for pilots/reviews) ships with the first vertical slice (§12) |
| Authentication | Amazon Cognito — a User Pool provisioned by a **custom resource** over the typed Cognito APIs (`@distilled.cloud/aws`) | **Custom authentication flow**: a 6-digit OTP generated server-side, sent through the Moroccan SMS aggregator (INT-SMS) via a Lambda trigger; email as a complement (INT-EML); login identifier distinct from the contact number (ARB-07); fine-grained authorization enforced by `@qadi/http` as HttpApi middleware (§4) |
| Queues | SQS (+ DLQ) | Prioritized notifications — absence alerts under 5 minutes (§10) ahead of PDFs and imports; batch report-card generation (2,000 students under 10 minutes, §10); critical notifications published via a Postgres **outbox** (no message lost between validation and sending) |
| Scheduling | EventBridge Scheduler | Reminders, retention/anonymization (DEC-22), backup replication |
| Object storage | S3 `eu-central-1` | Supporting documents, health records (strengthened SSE-KMS encryption, CNF-02/18 — KMS key via the typed AWS API), generated PDFs; access via short-lived pre-signed URLs; CloudFront serves only the SPA (§2.3) |
| Email | Amazon SES `eu-central-1` | EU processing → covered by the adequacy list, no F118 needed; receipts, invitations, optional report cards (INT-EML) |
| SMS / WhatsApp | External providers (INT-SMS, INT-WAP) | Isolated Effect adapters (`packages/clients`); routing configurable by message type and by school (DEC-12, DEC-36); flows governed by F118/consent (ARB-25c/d) |
| Payments | CMI / Fatourati (INT-FAT, INT-CAR) | Server-to-server calls from Lambda; webhooks via a function URL |
| Secrets | Secrets Manager | `DATABASE_URL` (pooled and direct strings), OTP keys, provider secrets |
| Application security | Headers, scanning, quotas | Strict CSP and security headers on both SPA and API; uploads (supporting documents, health data) validated then **scanned by ClamAV in a Lambda worker** before any distribution; rate-limiting counters in Postgres (sliding window) — R-16, SEC-23/24 |
| Observability | CloudWatch + `@effect/opentelemetry` | Structured logs, OTLP traces; dashboards and alarms declared as resources; correlation by Effect span; application errors aggregated via Effect's `ErrorReporter` module — any external SaaS (e.g. an EU Sentry) would go through the SEC-18 registry; application log (SEC-11/12); `AuditLog` in the database from V1 (D4, ARB-25j) |
| PDF/Excel documents | `@react-pdf/renderer`, `exceljs` | Arabic/RTL shaping validated by a prototype embedded in report-card development — a deliverable, not throwaway work (DEC-32, §10: report card under 3 s); fallback: headless Chromium in a Lambda container image; **exceljs** for Excel/CSV exports (Massar/ESISE — INT-MAS, accounting exports) |

## 7. React frontend

- **React 19 + Vite 8**, **PWA** SPA (`vite-plugin-pwa`/Workbox) — a native app is deferred to V2 (ARB-21b).
- **Offline at MVP** (NFR-OFF; BES-SUR-01, BES-ENS-02/03: attendance-taking and grade entry tolerant of connectivity drops): an IndexedDB (Dexie) application cache plus a sync queue with idempotent replay on the API side; conflict resolution by row version, arbitrated server-side.
- **State and data**: `@effect/atom-react` (atoms fed by the typed HttpApi client); TanStack Router for typed routing across ~121 screens (ECR-…); screen visibility and actions driven by `@qadi/react` (`QadiProvider`, `Can`/`Cannot`) on the **same policies** as the API — the decision timeline is inspectable in dev (`@qadi/devtools`).
- **Design system**: **shadcn/ui** on **Tailwind CSS 4** — components copied into the repository via the `shadcn` CLI (zero runtime dependency, fully customizable: component-by-component RTL review, OKLCH tokens carried by CVA and tailwind-merge, lucide-react icons); AA contrast validated via tokens on both FR and AR. Supporting libraries: **TanStack Table** (dense tables — students, payments, logs), **Recharts** through shadcn charts (RAP module), **cmdk** (command palette, combobox), **sonner** (toasts), **vaul** (mobile-first drawers), **react-day-picker** (school calendar). Forms: shadcn components plus **react-hook-form** with a **custom resolver over the Effect Schema** (zod was rejected — validation stays singular, in `packages/domain`).
- **Bilingual FR/AR from MVP** (DEC-10): i18next + react-i18next (ICU), `dir="rtl"`, Tailwind 4 logical properties, self-hosted Arabic fonts (Noto, `@fontsource`); shadcn/ui components (Radix primitives underneath, RTL handled via `Direction` and component-by-component review); **WCAG 2.1 AA** target (NFR-RES-04, ARB-25p).
- Form validation uses the **same `Schema`** as the API (the `packages/domain` package) — no duplicated validation logic.

## 8. BDD — Gherkin with `@effect-cucumber/vitest`

Constraints checked on 09/09/2026 (npm registry):

| Item | Value |
|---|---|
| `@effect-cucumber/vitest` | `^0.4.0` — `describeFeature(feature, layer, define)`, `Given/When/Then` steps, six hooks (`Before`…`AfterAllScenarios`), `it.effect` execution, a compile-time guarantee: a service missing from the supplied Layer is a TypeScript error at the step's call site |
| Required peers | `effect@^4.0.0-rc.112`, `@effect/vitest@^4.0.0-rc.112`, `@effect/platform-node@^4.0.0-rc.112`, **`vitest >=4.1.0 <5.0.0`** (Vitest stays on 4.x while this ceiling stands) |
| Gherkin parsing | `@effect-cucumber/gherkin` (depends on the official `@cucumber/gherkin`, `@cucumber/cucumber-expressions`) → **English** i18n keywords: `Feature:`, `Scenario:`, `Given/When/Then` — validated in the first vertical slice (§12) |

Organization:

- **Scenario source = the PRD**: the Gherkin acceptance criteria of the 258 `FR-…` requirements and the `PJ-…` journeys (conventions §3) are carried over into `features/<module>/*.feature` (one file per module, `ADM`…`MAS`), in English, without any rewording that would weaken traceability.
- **Steps = thin adapters**: each step calls a domain service through the Layer supplied to `describeFeature` (`shared` for Feature-level state, `perScenario` reset per scenario); the test logic lives in the services, not in the steps; permission scenarios (PER matrix) rely on the deterministic Layers and registered resolvers from `@qadi/testing` (reproducible decisions).
- **Database per run**: the Alchemy PR stage creates its own Neon branch (a dedicated resource), applies migrations to it, then anonymized fixtures; `AfterAllScenarios` keeps the branch for diagnosis on failure; stage branches expire (TTL); no test ever runs against the development database.
- **Pyramid**: `@effect/vitest` unit tests (`it.effect`, no database) for pure logic; Gherkin scenarios as the per-module acceptance net; critical end-to-end journeys (PC-03..PC-07, PC-11) run against the deployed API in a UAT environment; Playwright as an interface complement starting from MVP wave 1.
- **Performance** (JAL-02, DEC-35 geometries: 300 / 800 / 2,000+ students): **k6** load campaigns run separately from the BDD suite, before every start of school year.

## 9. Monorepo, CI/CD

**pnpm workspaces** (no turbo/nx while build times allow it):

```
apps/web          React SPA (Vite, PWA)
apps/api          HttpApi + Functions Alchemy (function URL)
apps/workers      SQS consumers, EventBridge triggers
packages/domain   domain model (Schema.Class, tagged errors) — zero I/O
packages/db       SQL migrations, repositories, RLS, test fixtures
packages/clients  adapters for INT-SMS, INT-WAP, INT-EML, INT-FAT, INT-CAR, INT-SIG, Massar
packages/infra    Alchemy 2.x — alchemy.run.ts, Web / Api / Data stacks
features/         *.feature Gherkin (EN) + step definitions
```

- Lint/format: **oxlint + dprint** (tooling from the effect repository, for ecosystem consistency); types checked by tsgo in CI.
- GitHub Actions pipeline: PR → lint + `vitest` (unit tests + Gherkin scenarios) + `alchemy deploy --stage pr-N` (a full preview: API on a function URL, dedicated Neon branch); merge to `main` → `alchemy deploy --stage staging`; production promotion = `--stage prod`. The official `alchemy-run/alchemy@v1` action (OIDC identities), previews destroyed when the PR closes. Supply chain: Renovate (updates), `pnpm audit`, and secret scanning in CI; accessibility: axe-core inside Playwright scenarios (NFR-RES-04).
- Alchemy composition: a root `alchemy.run.ts` in `packages/infra`; a dedicated remote Postgres state store (a separate Neon project, outside production); `alchemy plan` attached to every PR review; pre-existing resources can be adopted (`adopt`); no resource is ever created outside IaC.
- Local development (no container required): database = a **personal Neon branch** (`neon checkout dev-<dev>`, `DATABASE_URL` in `.env`, migrations run on deploy); API = the same HttpApi program served by `NodeHttpServer` (`Layer.launch`) behind `pnpm --filter api dev`; web = Vite HMR (the PWA service worker disabled in dev); auth: `OTP_TRANSPORT=log` (OTP written to logs, the real aggregator reserved for staging); workers = local runners over the Effect handlers, with actual SQS consumption tested on the deployed stage (`alchemy deploy --stage dev_<dev>`); BDD suite = an ephemeral Neon branch per run.

## 10. Pinned versions (npm registry snapshot, 09/09/2026)

| Package | Version | Note |
|---|---|---|
| `effect`, `@effect/vitest`, `@effect/platform-node`, `@effect/atom-react`, `@effect/opentelemetry`, `@effect/sql-pg` | `4.0.0-rc.112` (`rc` dist-tag) | v4 RC line; watching for GA (§4) |
| `@effect-cucumber/vitest` / `@effect-cucumber/gherkin` | `^0.4.0` | pre-1.0, API may still change |
| `vitest` | `^4.1.0` | `<5` ceiling imposed by `@effect-cucumber/vitest` |
| `react`, `react-dom` | `19.2.x` | |
| `vite` | `8.2.x` | |
| `typescript` | `7.x` (tsgo) | aligned with the effect repository |
| `node` | `22.x` LTS | Lambda runtime `nodejs22.x` |
| `pnpm` | `11.x` | |
| `alchemy` | `2.0.0-beta.76` (`latest` dist-tag) | "Infrastructure as Effects" IaC; aligned with `effect@rc` |
| `@qadi/*` (core, http, react, predicate-sql, audit, testing, devtools) | `0.4.0` | depends on `effect` pinned exactly to `4.0.0-rc.112` → upgrades move in lockstep with the RC |
| `shadcn` (CLI), `tailwindcss` | `4.21.x` / `4.3.x` | components copied into the repository (zero runtime dependency); Tailwind 4 CSS-first |

Routing/i18n/long-tail UI and tooling (TanStack Router, i18next, TanStack Table, Recharts, cmdk, sonner, vaul, react-day-picker, lucide-react, Dexie, exceljs `4.4.x`, @faker-js/faker `10.6.x` for fixtures, k6, Playwright): latest stable at repository start, pinned in `package.json` at creation time.

## 11. Technical risks and watch items

| # | Risk | Treatment |
|---|---|---|
| 1 | Effect v4 is still **RC** (not GA): the API may still change before GA | Pin `4.0.0-rc.112`; confine `unstable/*` behind `packages/domain` and the adapters; follow the repository's changesets (a `migration/v3-to-v4.md` guide is available) |
| 2 | `@effect-cucumber/vitest` is pre-1.0, with a `vitest <5` ceiling | Accepted and tracked; upgrade as soon as cucumber releases; the `.feature` files (standard Gherkin) remain stable by construction |
| 3 | Neon region is final; single-region dependency on `eu-central-1` | PITR + S3 exports replicated to `eu-west-3` + IaC rebuild; quarterly drills (NFR-SAV-03); a substitute for risk R-06 (a single OCI availability domain) |
| 4 | Arabic PDF (shaping/RTL) under a tight deadline (report card under 3 s) | A spike at MVP start; two tooled options (§6) |
| 5 | Cognito + OTP via a Moroccan aggregator (custom triggers) | Prototype the auth flow before pilot onboarding (R-16: rate limiting, no enumeration) |
| 6 | Latency between Morocco and `eu-central-1` (~80-100 ms round trip) vs pages under 2 s on 4G (NFR-PERF) | Ample margin; measured in the k6 campaigns (DEC-35); connection pooling mandatory |
| 7 | Loss of the "hosted in Morocco" argument with schools (chapter 33 §5) | To be carried by the product owner in the §2 arbitration |
| 8 | **Alchemy chosen** as the IaC foundation (the product owner's criteria: feature richness and harmony with Effect/Neon — maturity and popularity out of scope); consequences: Cognito, API Gateway HTTP API v2, and WAF have no dedicated resources | Cognito via a custom resource over the typed AWS APIs (`@distilled.cloud/aws`); JWT verified in-app (`HttpApiSecurity`); application-level rate limiting (R-16); the whole AWS API remains reachable in a typed escape hatch within the same program |
| 9 | `@qadi` chosen for authorization (the product owner's criteria: feature richness, harmony with Effect); coupled by an exact pin (`effect@4.0.0-rc.112`, no version range) and generated SQL predicates | The workspace is upgraded in lockstep on the (Effect RC, `@qadi` 0.4.x) pair; invariant: `@qadi/predicate-sql` filters at the application level, Postgres RLS remains the final safeguard (§5); policies and decisions are covered by the Gherkin suite (§8) |

## 12. Next steps

No throwaway work: the checks flagged in this document are deliverables of the first vertical slice or backlog tasks — never isolated "spikes".

| # | Step | Content | Constraint |
|---|---|---|---|
| 1 | **Product-owner arbitration — hosting** | Rule on the EU-vs-DEC-26 deviation (§2); update the baseline through the ESC mechanism; describe EU hosting in the CNDP forms | **Blocking and dated**: before JAL-02 and before 15/12/2026 (CNF-25) |
| 2 | **Monorepo scaffolding** | The pnpm workspaces from §9 (`apps/web`, `apps/api`, `apps/workers`, `packages/{domain,db,clients,infra}`, `features/`); tooling (oxlint, dprint, tsgo, Vitest 4); the Alchemy project (`dev`/`staging`/`prod` stages, dedicated state store); separate Neon projects, production locked down | — |
| 3 | **First vertical proof slice** | One trivial module end to end: an English `.feature` → `Schema` (`packages/domain`) → an HttpApi endpoint (Cognito JWT verified in-app + a traced `@qadi/http` decision) → a per-PR Neon branch (migrations + fixtures) → a Function Alchemy deployed on a `pr-N` stage; acceptance criteria: the Gherkin scenario runs in CI, the authorization decision is traced, an OpenAPI export is generated | The proof required by JAL-02; puts risks §11.1, §11.2, §11.5, and §11.8 to the test |

## 13. Traceability

| Baseline / PRD subject | Stack treatment |
|---|---|
| DEC-26, SEC-19, SEC-20, SEC-21, INT-HEB-01/02/05/06, Q-08, H-18 | Deviation documented and redefined as EU hosting + cross-region DR (§2) — product-owner arbitration required |
| ARB-25h/25i, NFR-DISP-01/03, NFR-SAV-01..03 | 99.5% SLA (§6); 8-hour RTO / 15-minute RPO via PITR + CRR + IaC (§5) |
| INV-01..45, ~66 entities, PER matrix | Postgres + DDL + RLS (§5); application-level `@qadi` authorization — roles, tokens, traced decisions (§4); reasoned rejection of DynamoDB |
| DEC-10 (FR/AR at MVP), NFR-RES-04 (WCAG 2.1 AA), NFR-I18N | i18next, RTL, shadcn/ui + Tailwind 4, token-based contrast (§7) |
| NFR-OFF, BES-SUR-01, BES-ENS-02/03 | PWA + IndexedDB + sync queue (§7) |
| §10 (report card under 3 s; 2,000 students under 10 minutes; alert under 5 minutes) | Prioritized SQS, PDF batches, `@react-pdf/renderer` + an AR spike (§6) |
| DEC-36, INT-SMS, INT-WAP, INT-EML | Channel adapters, configurable routing, EU SES (§6) |
| R-05, R-16, R-17 (in part) | Queues + k6 load tests (§8); application-level rate limiting (HttpApi layer); substitutable channels (§6) |
| SEC-11/12 (logging), D4/ARB-25j (AuditLog V1), R-16 | `@qadi/audit` (audit trail, retention); `Trace`/`explain` decisions logged; fail-closed by default, failure ≠ denial (§4) |
| DEC-32 (PDF at MVP), ARB-07 (login identifier), INT-MAS (Excel/CSV exports) | PDF/Excel document generation (§6); identifier distinct from the contact number (§6 auth) |
| JAL-02, DEC-35 | This document feeds the architecture review; k6 campaigns at the target geometries |
| CNF-25, SEC-18 | CNDP filings to describe EU hosting; the sub-processor registry extended (§2) |
| INT-HEB-05 (hosting reversibility) | `alchemy plan` / `destroy` / `adopt`, an inspectable and exportable state store (§9) |
| Conventions §3 (requirement Gherkin) | The PRD's `.feature` files become the BDD test runs (§8) |
