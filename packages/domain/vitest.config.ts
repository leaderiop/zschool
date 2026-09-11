import { defineConfig } from "vitest/config"

/**
 * `include` avoids vitest's default glob also matching compiled test files
 * under `dist/` (produced by `tsc -b`, since test files aren't excluded from
 * this package's tsconfig `include`) — same guard as
 * `packages/db/vitest.config.ts`, and without it every test here runs
 * twice: once against source, once against a build that's stale the moment
 * `src` changes without a rebuild.
 *
 * `globalSetup` is required here, not just on the root `vitest.config.ts`'s
 * "unit" project: this package's own `test` script — the one `pnpm turbo
 * run test` and CI actually invoke — runs `vitest run` from this directory,
 * which vitest resolves independently of the root config. Without a local
 * copy of the same testcontainers setup, `GradingScales.test.ts` and
 * `StudentGuardianImport.throughput.test.ts` (both real-Postgres-backed, via
 * `AppSqlLive`/`SqlLive`) fail with a `DATABASE_URL`/`APP_DATABASE_URL`
 * decode error outside a root-relative `vitest --project unit` invocation
 * nothing in this repo actually performs.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    globalSetup: ["../../features/support/testcontainers/globalSetup.ts"]
  }
})
