import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { MigratorLive, SqlLive } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as crypto from "node:crypto"

/**
 * Pinned to the Postgres major version the project's Neon branch runs
 * (issue #35) — do not float `:latest`, since a version-specific behavior
 * difference could cause a false pass/fail between this container and the
 * real Neon branch `RlsPolicy.test.ts` still uses.
 */
const POSTGRES_IMAGE = "postgres:17-alpine"

/**
 * On a real Neon project, `zschool_app` is provisioned out-of-band by
 * `neonctl roles create` — deliberately never by a migration (migration
 * 0002's own comment: "a Neon role needs a control-plane-generated
 * password, which has no business living in a migration file"). Migrations
 * 0002 and 0007 both assume that role already exists (they only GRANT/REVOKE
 * against it). A fresh testcontainers Postgres has no such out-of-band
 * provisioning step, so this replicates just enough of it — a role that
 * exists, nothing more — for those migrations to run completely unmodified.
 */
const provisionNeonProvisionedRoles = Effect.gen(function*() {
  const sql = yield* SqlClient
  const [role] = yield* sql<{ exists: boolean }>`
    SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zschool_app') AS exists
  `
  if (!role.exists) {
    yield* sql.unsafe(`CREATE ROLE zschool_app NOLOGIN`)
  }
})

export interface TestPostgres {
  readonly databaseUrl: string
  readonly appDatabaseUrl: string
  readonly stop: () => Promise<void>
}

/**
 * Starts a fresh, disposable Postgres container, runs every migration
 * against it through the exact same `Migrator`/`SqlLive` machinery
 * `runMigrations.ts` uses against a real Neon branch — so there is only one
 * migration path to keep correct, never a test-only variant — and sets
 * `DATABASE_URL`/`APP_DATABASE_URL` so `pgLayer` (`Sql.ts`) picks the
 * container up exactly as it would a Neon connection string.
 *
 * `zschool_service` (migration 0007) is created during this migration run
 * the same way it is against Neon; `APP_ROLE_PASSWORD` is generated here
 * since nothing external provisions it for an ephemeral container.
 */
export const startTestPostgres = async (): Promise<TestPostgres> => {
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE).start()
  const databaseUrl = container.getConnectionUri()
  // Alphanumeric-only: migration 0007 interpolates this into a `CREATE ROLE`
  // statement as a literal, not a bind parameter (Postgres doesn't accept
  // bind parameters in utility statements).
  const appRolePassword = crypto.randomBytes(24).toString("hex")

  process.env.DATABASE_URL = databaseUrl
  process.env.APP_ROLE_PASSWORD = appRolePassword

  await Effect.runPromise(
    Effect.provide(provisionNeonProvisionedRoles, SqlLive)
  )
  await Effect.runPromise(Effect.provide(Effect.void, Layer.provide(MigratorLive, SqlLive)))

  const appUrl = new URL(databaseUrl)
  appUrl.username = "zschool_service"
  appUrl.password = appRolePassword
  const appDatabaseUrl = appUrl.toString()
  process.env.APP_DATABASE_URL = appDatabaseUrl

  return {
    databaseUrl,
    appDatabaseUrl,
    stop: () => container.stop().then(() => undefined)
  }
}
