import { defineConfig } from "vitest/config"

/**
 * Same reasoning as `packages/domain/vitest.config.ts`: this package's own
 * `test` script runs `vitest run` from this directory, resolved
 * independently of the root config, so it needs its own copy of the
 * testcontainers `globalSetup` — the `Imports.test.ts` suite (issue #38) is
 * `HttpApiTest`-backed but still needs a real, RLS-enforcing
 * `AppSqlLive`/`SqlLive` behind it (per #35/#38's decision), not a mock.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    globalSetup: ["../../features/support/testcontainers/globalSetup.ts"]
  }
})
