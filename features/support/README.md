# Support

`support/` holds step definitions, deterministic test layers (TestClock,
transport stubs), and fixtures for the BDD runner (`@effect-cucumber/vitest`,
`spec/decisions/088-effect-cucumber-vitest-as-bdd-runner.md`).

| What | Status |
|---|---|
| `support/layers/db.ts` (`DatabaseTestLive`: migrations + a restricted-role `SqlClient`) | **Exists**, shared by every Postgres-backed Feature. |
| `<feature>.steps.test.ts` colocated step definitions | **Exists** for `fr-ped-01-instantiate-national-template`, `fr-ped-02-academic-tree`, `fr-ped-03-subject-level-config` — the pattern to follow for the next Feature (`loadFeature` + `describeFeature`, per `@effect-cucumber/vitest`'s own README). |
| `support/steps/*.steps.ts` (step modules shared across more than one Feature, via `defineSteps`) | Not needed yet — every step so far is specific to its one Feature. Extract to a shared module (by domain concept, not by `.feature` file) once a second Feature needs the same step text. |
| `support/layers/*.ts` (TestClock, SMS/WhatsApp/CMI transport stubs, `@qadi/testing` resolvers) | Not needed yet — no Feature written so far exercises those services. |
| `support/fixtures/*` (builders, anonymized test sets) | Not needed yet. |
| `support/hooks.ts` (global hooks, ephemeral per-run Neon branch lifecycle) | **Does not exist.** Every local run and CI run currently share the one provisioned Neon branch (`DatabaseTestLive`'s own doc comment) rather than getting a fresh one per run — ADR-ZS-103's per-PR/per-BDD-run branching is not wired up. |
| CI wiring that runs `.feature` files | **Wired, conditionally.** `.github/workflows/ci.yml` runs `pnpm test:bdd` against the shared Neon branch, but only when `DATABASE_URL`/`APP_DATABASE_URL` repo secrets are set — until then the step is skipped rather than failing every run red. |

This table is the registry for what's still missing, following the pattern
`/Users/mohammadalmechkor/Projects/Perso/qadi/spec/devtools-spec/` uses for
"not yet built" statements: when any row above becomes false, update the row
and delete it together in the same change — don't let a stale "does not
exist" line sit next to code that now exists.
