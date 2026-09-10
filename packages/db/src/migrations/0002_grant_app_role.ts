import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * `zschool_app` is the least-privilege runtime role the application (and
 * every BDD scenario, `AppSql.ts`) connects as, instead of `neondb_owner`.
 * Its creation is deliberately NOT here: a Neon role needs a
 * control-plane-generated password (`neonctl roles create zschool_app`),
 * which has no business living in a migration file. This migration only
 * grants it table privileges, which is plain, idempotent SQL — safe to
 * re-run, and the right place to keep new tables' grants in lockstep via
 * `ALTER DEFAULT PRIVILEGES`.
 *
 * This role does NOT make the `tenant_isolation` RLS policies from
 * migration 0001 an enforced second layer — see `AppSql.ts` for the
 * verified reason (every Neon role, `zschool_app` included, carries
 * `BYPASSRLS`, and the project owner cannot strip it). It's still worth
 * having on ordinary least-privilege grounds (no `CREATE`/`ALTER`/`DROP`),
 * independent of the RLS question.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`GRANT USAGE ON SCHEMA public TO zschool_app`
  yield* sql`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO zschool_app`
  yield* sql`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO zschool_app`
})
