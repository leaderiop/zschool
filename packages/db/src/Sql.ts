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
 * A testcontainers-backed Postgres (issue #35) always resolves to the local
 * Docker host — `testcontainers`' own `resolve-host.js` defaults to
 * `localhost` — never a real network endpoint.
 */
const isLoopbackHost = (hostname: string): boolean =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"

/**
 * `SqlLive` and `AppSqlLive` (`AppSql.ts`) share this so they only ever
 * differ in which credential they read, never in pool/SSL configuration.
 *
 * SSL is required by default and skipped only for a loopback host — never
 * gated on the connection string's own `?sslmode=...` query param. An
 * earlier version of this trusted `sslmode=require` being present (true of
 * every Neon URL today) and fell back to no TLS otherwise, which fails
 * *open*: a connection string that omits or changes that param (a rewritten
 * pooler URL, a future non-Neon provider) would silently connect
 * unencrypted instead of erroring. Keying off the host instead means a
 * testcontainers Postgres (issue #35, no TLS listener, always loopback)
 * still connects, while every non-loopback connection — Neon's included —
 * gets TLS unconditionally, without depending on that URL carrying the
 * right query param.
 */
export const pgLayer = (envVar: string) =>
  PgClient.layerConfig({
    url: Config.Redacted(envVar),
    maxConnections: Config.succeed(APP_POOL_MAX_CONNECTIONS),
    ssl: Config.Redacted(envVar).pipe(
      Config.map((url) => {
        const parsed = new URL(Redacted.value(url))
        return isLoopbackHost(parsed.hostname) ? undefined : { servername: parsed.hostname }
      })
    )
  })

export const SqlLive = pgLayer("DATABASE_URL")
