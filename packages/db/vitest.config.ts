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
    include: ["src/**/*.test.ts"]
  }
})
