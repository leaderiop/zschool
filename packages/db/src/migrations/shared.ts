import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * Enables RLS on `table` and installs the standard `tenant_isolation` policy
 * every school-scoped table in this schema carries (ADR-ZS-092). Shared
 * across every migration so a copy-pasted block can't typo the GUC name or
 * drop `FORCE` for one table without the reuse making that structurally
 * impossible instead of test-detected.
 */
export const applyTenantIsolation = (sql: SqlClient, table: string) =>
  Effect.gen(function*() {
    yield* sql`ALTER TABLE ${sql(table)} ENABLE ROW LEVEL SECURITY`
    yield* sql`ALTER TABLE ${sql(table)} FORCE ROW LEVEL SECURITY`
    yield* sql`
      CREATE POLICY tenant_isolation ON ${sql(table)}
        USING (school_id = current_setting('app.current_school_id', true)::uuid)
    `
  })
