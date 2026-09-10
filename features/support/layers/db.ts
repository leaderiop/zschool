import { AppSqlLive, MigratorLive, SqlLive } from "@zschool/db"
import { GradingScales } from "@zschool/domain"
import * as Layer from "effect/Layer"

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
 * steps then query through `AppSqlLive` (`zschool_service`, migration 0007)
 * instead, on ordinary least-privilege grounds (it holds no
 * `CREATE`/`ALTER`/`DROP`).
 *
 * Since migration 0007, this suite IS a genuine (if incidental) proof of RLS
 * enforcement, not just correctly-installed-but-inert SQL: `zschool_service`
 * does not carry `BYPASSRLS` (see `AppSql.ts`), so the "isolated to the
 * instantiating school" scenarios only pass because the `tenant_isolation`
 * policies actually block cross-school rows for this role, in addition to
 * `@qadi`'s own filtering.
 *
 * `describeFeature`'s `shared` tier requires an error channel of exactly
 * `never` (it builds the Layer through its own `Effect.orDie`) — `orDie`
 * here makes that collapse explicit rather than implicit: a migration or
 * connection failure is a defect attributed to no Scenario, which is
 * correct for infrastructure that every Scenario in the run depends on.
 *
 * `GradingScales.layer` (ticket #23's service pilot) is folded in here too:
 * `instantiateNationalTemplate` — called from nearly every Feature's own
 * setup step, not just fr-ped-05's — now requires `GradingScales` to seed
 * the default computation rules, so every scenario needs it provided the
 * same way it already gets `AppSqlLive`.
 */
export const DatabaseTestLive = Layer.merge(
  Layer.orDie(
    Layer.merge(MigratorLive.pipe(Layer.provide(SqlLive)), AppSqlLive)
  ),
  GradingScales.layer
)
