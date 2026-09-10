import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { pgLayer } from "./Sql.ts"

const EXPECTED_APP_ROLE = "zschool_service"

/**
 * Fails loudly, the moment `AppSqlLive` is built, if `APP_DATABASE_URL`
 * connects as anything other than the expected role — this exact mistake
 * (`.env.local` still pointing at the decommissioned `zschool_app`) cost
 * real time across this project's history, every time surfacing only as a
 * confusing "permission denied for function ..." or RLS violation deep
 * inside unrelated business logic, minutes after the actual cause. Failing
 * here, immediately, with the actual vs. expected role in the message, is
 * cheaper than debugging that trail again. Overridable via
 * `APP_EXPECTED_ROLE` for a deliberate future role change.
 */
const assertExpectedAppRole = Effect.fn("AppSql.assertExpectedAppRole")(function*() {
  const expected = yield* Config.String("APP_EXPECTED_ROLE").pipe(Config.withDefault(EXPECTED_APP_ROLE))
  const sql = yield* SqlClient
  const [row] = yield* sql<{ current_user: string }>`SELECT current_user`
  if (row.current_user !== expected) {
    return yield* Effect.fail(
      new Error(
        `APP_DATABASE_URL connects as "${row.current_user}", expected "${expected}". `
          + `Check .env.local's APP_DATABASE_URL (see AppSql.ts for why the role matters — `
          + `only ${expected} has RLS actually enforced).`
      )
    )
  }
})

/**
 * The restricted, least-privilege runtime role every application query (and
 * BDD scenario) connects as, instead of `SqlLive`'s `neondb_owner` (used
 * only for migrations): granted exactly `SELECT/INSERT/UPDATE/DELETE` on
 * these tables (migration 0002, migration 0007), nothing structural
 * (`CREATE`/`ALTER`/`DROP`).
 *
 * `APP_DATABASE_URL` connects as `zschool_service` (migration 0007), not the
 * original `zschool_app`. `zschool_app` was provisioned via
 * `neonctl roles create`, which — verified empirically — makes it a member
 * of Neon's own `neon_superuser` role. That membership is where `BYPASSRLS`
 * and its blanket table access actually come from (`has_table_privilege`
 * returns true for every table regardless of any GRANT/REVOKE we issue
 * directly against `zschool_app`), and it's unrevokable by `neondb_owner`
 * (`ALTER ROLE zschool_app NOBYPASSRLS` was refused: "Only roles with the
 * CREATEROLE attribute and the ADMIN option on role may alter this role" —
 * the same admin-option gap blocks revoking the membership itself).
 * `zschool_service`, created directly via plain SQL `CREATE ROLE ...
 * NOBYPASSRLS` in migration 0007, carries no such membership (verified: zero
 * rows in `pg_auth_members` for it) — RLS is a real backstop for it, for the
 * first time on this project, on top of `@qadi` (ADR-ZS-096); see stack.md
 * risk #10 for the resolution history.
 *
 * `zschool_app` itself is decommissioned as far as this codebase's own
 * grants can reach (migration 0007 revokes its direct table grants and the
 * standing `ALTER DEFAULT PRIVILEGES` rule that used to auto-grant it access
 * to every new table) rather than dropped, since Neon's ownership of the
 * role blocks `DROP ROLE` the same way it blocks `ALTER ROLE`. Its
 * `neon_superuser` membership means it likely still has de facto table
 * access via that inherited path regardless — the fix that actually matters
 * is simply that nothing points `APP_DATABASE_URL` at it anymore.
 */
export const AppSqlLive = pgLayer("APP_DATABASE_URL").pipe(
  Layer.tap((context) => Effect.provide(assertExpectedAppRole(), context))
)
