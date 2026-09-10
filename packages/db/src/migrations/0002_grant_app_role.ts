import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * `zschool_app` was the original least-privilege runtime role the
 * application (and every BDD scenario, `AppSql.ts`) connected as, instead of
 * `neondb_owner`. Its creation was deliberately NOT here: a Neon role needs
 * a control-plane-generated password (`neonctl roles create zschool_app`),
 * which has no business living in a migration file.
 *
 * **Superseded by migration 0007**: `neonctl`-provisioned roles carry an
 * unrevokable `BYPASSRLS` (verified empirically against this exact role),
 * making the `tenant_isolation` RLS policies from migration 0001
 * correctly-written but inert for anything connecting as `zschool_app`.
 * Migration 0007 replaces it with `zschool_service`, a plain-SQL-created
 * role that does NOT carry `BYPASSRLS`, and revokes `zschool_app`'s grants
 * entirely. This migration is kept as-is for history; do not grant
 * `zschool_app` anything new — extend migration 0007's grants instead.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`GRANT USAGE ON SCHEMA public TO zschool_app`
  yield* sql`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO zschool_app`
  yield* sql`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO zschool_app`
})
