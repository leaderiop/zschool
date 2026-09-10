import * as Layer from "effect/Layer"
import { AppSqlLive, MigratorLive, SqlLive } from "@zschool/db"

/**
 * The database Layer every BDD scenario that touches Postgres shares
 * (features/support/README.md).
 *
 * Reads `NEON_TEST_BRANCH_URL` when set (a dedicated per-PR/per-run Neon
 * branch, ADR-ZS-103) and otherwise falls back to `DATABASE_URL`/
 * `APP_DATABASE_URL`: the per-PR branching automation itself is not wired
 * up yet, so today every local run shares the one provisioned Neon branch.
 */
if (process.env.NEON_TEST_BRANCH_URL) {
  process.env.DATABASE_URL ??= process.env.NEON_TEST_BRANCH_URL
  process.env.APP_DATABASE_URL ??= process.env.NEON_TEST_BRANCH_URL
}

/**
 * Migrations run once against `SqlLive` (`neondb_owner`) — a Scenario's own
 * steps then query through `AppSqlLive` (`zschool_app`) instead, on
 * ordinary least-privilege grounds (it holds no `CREATE`/`ALTER`/`DROP`).
 *
 * This does NOT make the suite an end-to-end proof of RLS enforcement: on
 * Neon, every role in the project — `zschool_app` included — carries
 * `BYPASSRLS`, unalterable by the project owner (verified against
 * `zschool_app` directly; see `AppSql.ts`). The "isolated to the
 * instantiating school" scenario tests what that leaves provable — the
 * `tenant_isolation` policies are correctly installed — not that a query
 * run through either role is actually blocked by them.
 *
 * `describeFeature`'s `shared` tier requires an error channel of exactly
 * `never` (it builds the Layer through its own `Effect.orDie`) — `orDie`
 * here makes that collapse explicit rather than implicit: a migration or
 * connection failure is a defect attributed to no Scenario, which is
 * correct for infrastructure that every Scenario in the run depends on.
 */
export const DatabaseTestLive = Layer.orDie(
  Layer.merge(MigratorLive.pipe(Layer.provide(SqlLive)), AppSqlLive)
)
