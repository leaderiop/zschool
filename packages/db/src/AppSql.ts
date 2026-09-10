import { pgLayer } from "./Sql.ts"

/**
 * The restricted, least-privilege runtime role every application query (and
 * BDD scenario) connects as, instead of `SqlLive`'s `neondb_owner` (used
 * only for migrations): granted exactly `SELECT/INSERT/UPDATE/DELETE` on
 * these tables (migration 0002, migration 0007), nothing structural
 * (`CREATE`/`ALTER`/`DROP`).
 *
 * `APP_DATABASE_URL` connects as `zschool_service` (migration 0007), not the
 * original `zschool_app`. `zschool_app` was provisioned via
 * `neonctl roles create`, which — verified empirically — unconditionally
 * grants `BYPASSRLS`, unrevokable by the project owner (`ALTER ROLE
 * zschool_app NOBYPASSRLS` was refused: "Only roles with the CREATEROLE
 * attribute and the ADMIN option on role may alter this role").
 * `zschool_service`, created directly via plain SQL `CREATE ROLE ...
 * NOBYPASSRLS` in migration 0007, does NOT get `BYPASSRLS` — also verified
 * empirically, with a throwaway role created and dropped without lasting
 * effect. That makes the `tenant_isolation` RLS policies from migration
 * 0001 (and the `Person`/`ParentStudentRelationship` policy, ADR-ZS-107) an
 * actually-enforced second layer for the first time on this project, on top
 * of `@qadi` (ADR-ZS-096) — see stack.md risk #10 for the resolution
 * history. `zschool_app` itself is decommissioned (its grants revoked by
 * migration 0007) rather than dropped, since Neon's ownership of that role
 * blocks `DROP ROLE` the same way it blocks `ALTER ROLE`.
 */
export const AppSqlLive = pgLayer("APP_DATABASE_URL")
