# Self-hosted Turborepo remote cache

`ducktors/turborepo-remote-cache` (the cache API `turbo` speaks) deployed on
Fly.io, backed by Fly's built-in Tigris object storage (S3-compatible). Free
tier on both, no domain needed — Fly gives automatic HTTPS on `*.fly.dev`.

Live deployment: **`zschool-turbo-cache`** app, region `cdg`, at
`https://zschool-turbo-cache.fly.dev`.

## Topology

```
turbo (local / CI) --HTTPS--> zschool-turbo-cache.fly.dev --S3 API--> Tigris bucket
                                (ducktors/turborepo-remote-cache)      zschool-turbo-cache-storage
```

No MinIO, no VPS, no cert management — Fly + Tigris handle storage and TLS.

## Redeploying / changing config

```
flyctl deploy -a zschool-turbo-cache -c infra/remote-cache/fly.toml
```

`fly.toml` pins the exact upstream image tag (`ducktors/turborepo-remote-cache:2.12.3`);
bump it there deliberately, don't float `latest`.

## Secrets on the Fly app

Set via `flyctl secrets set -a zschool-turbo-cache ...` (see `.env.example` for
the full list: Tigris S3 credentials, `TURBO_TOKEN`, and
`TURBO_REMOTE_CACHE_SIGNATURE_KEY`). Already provisioned; `flyctl secrets list
-a zschool-turbo-cache` shows what's staged/deployed without exposing values.

Real values live only in `infra/remote-cache/.env.fly` (gitignored) and as Fly
secrets — never commit them.

## Point turbo at it

Local dev / CI, via env vars:

```
TURBO_API=https://zschool-turbo-cache.fly.dev
TURBO_TOKEN=<same value as the TURBO_TOKEN Fly secret>
TURBO_TEAM=zschool
TURBO_REMOTE_CACHE_SIGNATURE_KEY=<same value as the Fly secret>
```

`TURBO_REMOTE_CACHE_SIGNATURE_KEY` must also be set **client-side** — `turbo.json`'s
`remoteCache.signature: true` means every artifact is HMAC-signed on write and
verified on read; the client and server must share the same key or cache
writes/reads are rejected.

GitHub Actions: already set as repo secrets/variable on `leaderiop/zschool`
(`TURBO_API`, `TURBO_TOKEN`, `TURBO_REMOTE_CACHE_SIGNATURE_KEY` as secrets,
`TURBO_TEAM` as a variable) — see `.github/workflows/ci.yml`.

## Verifying it's alive

```
curl -s -o /dev/null -w '%{http_code}\n' https://zschool-turbo-cache.fly.dev/
```

Or do a real round trip:

```
rm -rf .turbo/cache packages/*/dist packages/*/tsconfig.tsbuildinfo
source infra/remote-cache/.env.fly
TURBO_API=https://zschool-turbo-cache.fly.dev TURBO_TEAM=zschool \
  TURBO_TOKEN="$TURBO_TOKEN" TURBO_REMOTE_CACHE_SIGNATURE_KEY="$TURBO_REMOTE_CACHE_SIGNATURE_KEY" \
  pnpm turbo run build --filter=@zschool/domain
```

Expect `>>> FULL TURBO` after the first (upload) run once you clear local
state and rerun.
