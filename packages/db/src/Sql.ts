import * as Config from "effect/Config"
import { PgClient } from "@effect/sql-pg"

/** `SqlLive` and `AppSqlLive` (`AppSql.ts`) share this so they only ever differ in which credential they read, never in pool/SSL configuration. */
export const pgLayer = (envVar: string) =>
  PgClient.layerConfig({
    url: Config.redacted(envVar)
  })

export const SqlLive = pgLayer("DATABASE_URL")
