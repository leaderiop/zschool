import { defineConfig } from "vitest/config"

/**
 * Same "own copy of globalSetup, since this package's `test` script runs
 * independently of the root config" reasoning as `packages/domain/vitest.config.ts`
 * — `globalSetupWithQueue.ts` (not the plain `globalSetup.ts`) since
 * `Imports.test.ts` exercises the real Floci-backed queue too (ticket #8).
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    testTimeout: 30_000,
    globalSetup: ["../../features/support/testcontainers/globalSetupWithQueue.ts"]
  }
})
