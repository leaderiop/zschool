import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"

/**
 * The target entity a command names either doesn't exist, or doesn't belong
 * to the caller's school — the two cases are indistinguishable to the
 * caller by design: a director must never learn "that id exists, just not
 * in your school" (that would itself leak cross-tenant existence).
 *
 * Every domain module scopes its own lookups by `school_id` explicitly
 * (rather than relying on Postgres RLS) because every Neon role currently
 * carries un-strippable `BYPASSRLS` — see `packages/db/src/AppSql.ts`.
 */
export class EntityNotFoundError extends Data.TaggedError("EntityNotFoundError")<{
  readonly entityType: string
  readonly entityId: string
}> {}

export const requireOwnedRow = <A extends Record<string, unknown> = { id: string }>(
  sql: SqlClient,
  table: string,
  entityType: string,
  entityId: string,
  schoolId: string,
  columns = "id"
): Effect.Effect<A, EntityNotFoundError | SqlError> =>
  Effect.gen(function*() {
    const rows = yield* sql<A>`
      SELECT ${sql.literal(columns)} FROM ${sql(table)} WHERE id = ${entityId} AND school_id = ${schoolId}
    `
    const [row] = rows
    if (row === undefined) {
      return yield* Effect.fail(new EntityNotFoundError({ entityType, entityId }))
    }
    return row
  })

/** A track belongs to a specific level, not just to the school — checked separately since a track and a level can each independently belong to the right school while the track still belongs to a *different* level (e.g. a 1BAC track passed alongside a 2BAC levelId). */
export const requireTrackBelongsToLevel = (
  sql: SqlClient,
  trackId: string,
  levelId: string,
  schoolId: string
): Effect.Effect<void, EntityNotFoundError | SqlError> =>
  Effect.gen(function*() {
    const rows = yield* sql`
      SELECT id FROM tracks WHERE id = ${trackId} AND level_id = ${levelId} AND school_id = ${schoolId}
    `
    if (rows.length === 0) {
      return yield* Effect.fail(new EntityNotFoundError({ entityType: "track", entityId: trackId }))
    }
  })
