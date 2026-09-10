import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * Replaces `zschool_app` with `zschool_service` as the runtime role
 * `AppSqlLive` connects as.
 *
 * `zschool_app` was provisioned via `neonctl roles create`, which — verified
 * empirically — unconditionally grants `BYPASSRLS`, unrevokable by
 * `neondb_owner` (`ALTER ROLE zschool_app NOBYPASSRLS` is refused: "Only
 * roles with the CREATEROLE attribute and the ADMIN option on role may alter
 * this role"). A role created directly via plain SQL `CREATE ROLE`, by
 * contrast, does NOT get `BYPASSRLS` and IS alterable/droppable by the
 * owner — confirmed with a throwaway role, created and dropped without
 * lasting effect. `zschool_service` is that kind of role: the
 * `tenant_isolation` policies (migration 0001, ADR-ZS-092) and the
 * `Person`/`ParentStudentRelationship` policy (ADR-ZS-107) are, for the
 * first time on this project, an actually-enforced second layer rather than
 * correctly-written-but-inert SQL.
 *
 * `zschool_app` is decommissioned in place (its grants revoked) rather than
 * dropped: Neon's ownership of that role blocks `DROP ROLE` the same way it
 * blocks `ALTER ROLE`.
 *
 * Idempotent: skips role creation if `zschool_service` already exists (a
 * second run against the same database, or CI re-running migrations from
 * scratch after this one has already landed). `APP_ROLE_PASSWORD` is only
 * read — and only needs to be set — the first time this runs against a given
 * database.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  const [role] = yield* sql<{ exists: boolean }>`
    SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zschool_service') AS exists
  `
  if (!role.exists) {
    const password = yield* Config.string("APP_ROLE_PASSWORD")
    // CREATE ROLE is a utility statement, not an optimizable one — Postgres
    // does not accept bind parameters here, so the password (a
    // caller-generated, alphanumeric-only secret; never user input) is
    // interpolated as a literal rather than passed as a query parameter.
    yield* sql.unsafe(`CREATE ROLE zschool_service LOGIN PASSWORD '${password}' NOBYPASSRLS`)
  }

  yield* sql`GRANT USAGE ON SCHEMA public TO zschool_service`
  yield* sql`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO zschool_service`
  yield* sql`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO zschool_service`

  yield* sql`REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM zschool_app`
  yield* sql`REVOKE USAGE ON SCHEMA public FROM zschool_app`
})
