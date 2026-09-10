import { PgClient } from "@effect/sql-pg"
import * as Config from "effect/Config"
import * as Redacted from "effect/Redacted"

/** `SqlLive` and `AppSqlLive` (`AppSql.ts`) share this so they only ever differ in which credential they read, never in pool/SSL configuration. */
export const pgLayer = (envVar: string) =>
  PgClient.layerConfig({
    url: Config.Redacted(envVar),
    ssl: Config.Redacted(envVar).pipe(
      Config.map((url) => ({ servername: new URL(Redacted.value(url)).hostname }))
    )
  })

export const SqlLive = pgLayer("DATABASE_URL")
