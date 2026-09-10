import { pgLayer } from "./Sql.ts"

/**
 * The restricted, least-privilege runtime role every application query (and
 * BDD scenario) connects as, instead of `SqlLive`'s `neondb_owner` (used
 * only for migrations): granted exactly `SELECT/INSERT/UPDATE/DELETE` on
 * these tables (migration 0002), nothing structural (`CREATE`/`ALTER`/`DROP`).
 *
 * **Verified limitation, not a guarantee**: on Neon, every role in a
 * project — including one provisioned fresh via `neonctl roles create`, with
 * no elevated grant requested — carries `BYPASSRLS`, and the project owner
 * cannot strip it via `ALTER ROLE ... NOBYPASSRLS` (refused: "Only roles
 * with the CREATEROLE attribute and the ADMIN option on role may alter this
 * role"). Confirmed empirically against `zschool_app` itself, not assumed.
 * That means the `tenant_isolation` RLS policies from migration 0001 are
 * currently **not** an enforced second layer for either role on this Neon
 * project — `@qadi` (ADR-ZS-096) is the sole enforcement until a Neon role
 * without `BYPASSRLS` is available (tracked as a stack.md risk, not silently
 * assumed fixed by switching roles).
 */
export const AppSqlLive = pgLayer("APP_DATABASE_URL")
