import { defineConfig } from "vitest/config"

/**
 * Without this, vitest's default include glob also matches compiled test
 * files under `dist/` (produced by `tsc -b` since test files aren't excluded
 * from this package's tsconfig `include`), running every test twice — once
 * against source, once against a build that's stale the moment `src`
 * changes without a rebuild.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // Runs against a real Neon branch, not the testcontainers Postgres every
    // other suite uses (issue #35) — see vitest.rls.config.ts, which is how
    // it's actually invoked (packages/db's own `test` script, and turbo's
    // generic `test` task by extension, must never pick it up: it needs
    // Neon secrets this script doesn't require).
    exclude: ["src/RlsPolicy.test.ts"]
  }
})
