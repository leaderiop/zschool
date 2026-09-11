import { startTestPostgres } from "./TestPostgres.ts"

/**
 * Vitest global setup (issue #35): backs the `unit` and `bdd` projects with a
 * disposable local Postgres container instead of a shared Neon branch — no
 * secrets, no network dependency, and genuine per-run isolation for the
 * first time (closing the gap ADR-ZS-101 aspired to but never delivered).
 *
 * `packages/db/src/RlsPolicy.test.ts` is deliberately excluded from every
 * project that loads this file (see vitest.config.ts and
 * packages/db/vitest.rls.config.ts) and keeps connecting to a real Neon
 * branch directly: the Neon control-plane bug it guards against (roles
 * provisioned via `neonctl` silently inheriting `neon_superuser`/`BYPASSRLS`,
 * migration 0007) cannot be reproduced by a vanilla Postgres container.
 */
export default async function setup() {
  const testPostgres = await startTestPostgres()
  return async function teardown() {
    await testPostgres.stop()
  }
}
