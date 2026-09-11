import { PgClient } from "@effect/sql-pg"
import * as Config from "effect/Config"
import * as Redacted from "effect/Redacted"

/**
 * `SqlLive` and `AppSqlLive` (`AppSql.ts`) share this so they only ever
 * differ in which credential they read, never in pool/SSL configuration.
 *
 * SSL is negotiated only when the connection string itself asks for it
 * (`?sslmode=require`, as every Neon URL does) — a testcontainers-backed
 * Postgres (issue #35) has no TLS listener at all, so unconditionally
 * building a `{ servername }` object here (which forces TLS negotiation)
 * would make every local/CI test run fail to connect.
 */
export const pgLayer = (envVar: string) =>
  PgClient.layerConfig({
    url: Config.Redacted(envVar),
    ssl: Config.Redacted(envVar).pipe(
      Config.map((url) => {
        const parsed = new URL(Redacted.value(url))
        return parsed.searchParams.get("sslmode") === "require" ? { servername: parsed.hostname } : undefined
      })
    )
  })

export const SqlLive = pgLayer("DATABASE_URL")
