import { PgClient } from "@effect/sql-pg"
import * as Config from "effect/Config"
import * as Redacted from "effect/Redacted"

/**
 * The connection pool's actual, explicit ceiling (issue #34) — made a named
 * constant, instead of relying on `@effect/sql-pg`'s own unstated default,
 * so call sites that size their own concurrency off "how many connections
 * exist" (`StudentGuardianImport.ts`'s `analyzeGuardianRows`) have a real
 * number to reference instead of a bare, uncontextualized literal.
 */
export const APP_POOL_MAX_CONNECTIONS = 10

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
    maxConnections: Config.succeed(APP_POOL_MAX_CONNECTIONS),
    ssl: Config.Redacted(envVar).pipe(
      Config.map((url) => {
        const parsed = new URL(Redacted.value(url))
        return parsed.searchParams.get("sslmode") === "require" ? { servername: parsed.hostname } : undefined
      })
    )
  })

export const SqlLive = pgLayer("DATABASE_URL")
