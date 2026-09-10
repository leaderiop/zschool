import { fileURLToPath } from "node:url"
import * as Layer from "effect/Layer"
import { PgMigrator } from "@effect/sql-pg"
import * as Migrator from "effect/unstable/sql/Migrator"
import { NodeServices } from "@effect/platform-node"

const migrationsDirectory = fileURLToPath(new URL("./migrations", import.meta.url))

/**
 * Runs pending `./migrations/*.ts` files during layer construction. Requires
 * a `PgClient`/`SqlClient` from the environment (`SqlLive`) — kept as a
 * requirement rather than baked in here so a caller can share one already-
 * built client between migrating and querying (see `features/support/layers/db.ts`).
 */
export const MigratorLive = PgMigrator.layer({
  loader: Migrator.fromFileSystem(migrationsDirectory)
}).pipe(Layer.provide(NodeServices.layer))
