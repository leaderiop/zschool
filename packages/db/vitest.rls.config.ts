import { defineConfig } from "vitest/config"

/**
 * `RlsPolicy.test.ts`'s own config (issue #35) — deliberately separate from
 * `vitest.config.ts`, and deliberately not part of turbo's generic `test`
 * task, so this suite only ever runs where it's explicitly invoked (CI's
 * Neon-secrets-gated step) against a real Neon branch, never accidentally
 * against a testcontainers instance or without DATABASE_URL/APP_DATABASE_URL
 * configured.
 */
export default defineConfig({
  test: {
    include: ["src/RlsPolicy.test.ts"]
  }
})
