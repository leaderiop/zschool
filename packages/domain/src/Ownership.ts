import * as Qadi from "@qadi/core/Qadi"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { canManageAcademicStructure } from "./authorization/Policies.ts"
import type { LevelId, SchoolId, TrackId } from "./Ids.ts"

/** Every academic-structure write goes through this same `@qadi` policy — a director may only act on their own school. Shared so a change to how failures surface doesn't need editing in every domain module. */
export const authorized = Effect.fn("Ownership.authorized")(function*<A, E, R>(
  schoolId: SchoolId,
  effect: Effect.Effect<A, E, R>
) {
  yield* Qadi.assert(canManageAcademicStructure, {
    resource: { school_id: schoolId },
    action: "manage-academic-structure"
  })
  return yield* effect
})

/**
 * The target entity a command names either doesn't exist, or doesn't belong
 * to the caller's school — the two cases are indistinguishable to the
 * caller by design: a director must never learn "that id exists, just not
 * in your school" (that would itself leak cross-tenant existence).
 *
 * Every domain module scopes its own lookups by `school_id` explicitly
 * rather than relying solely on Postgres RLS — application-level
 * authorization (`@qadi`, ADR-ZS-096) stays the primary gate even though RLS
 * is now also an enforced backstop (`packages/db/src/AppSql.ts`), since a
 * caller must never learn "that id exists, just not in your school" from
 * the *shape* of the response (an RLS-filtered empty result and a
 * genuinely-missing row look identical here, which is correct — but a
 * slower, differently-erroring path for "wrong school" versus "doesn't
 * exist" would itself leak that distinction).
 */
export class EntityNotFoundError extends Data.TaggedError("EntityNotFoundError")<{
  readonly entityType: string
  readonly entityId: string
}> {}

/** The default row shape `requireOwnedRow` decodes when a caller only needs the existence check, not any particular column. */
export const RowWithId = Schema.Struct({ id: Schema.String })

/**
 * Decodes a query result against `schema` instead of trusting a
 * compile-time-only cast — a future column rename/type change surfaces as a
 * clear `Schema.SchemaError` instead of silently producing a missing or
 * wrong field. Standalone so it's unit-testable without a `SqlClient`.
 */
export const decodeOwnedRow = <A>(
  schema: Schema.ConstraintDecoder<A>,
  row: unknown
): Effect.Effect<A, Schema.SchemaError> => Schema.decodeUnknownEffect(schema)(row)

export const requireOwnedRow = Effect.fn("Ownership.requireOwnedRow")(function*<A>(
  sql: SqlClient,
  table: string,
  entityType: string,
  entityId: string,
  schoolId: SchoolId,
  resultSchema: Schema.ConstraintDecoder<A>,
  columns = "id"
) {
  const rows = yield* sql`
    SELECT ${sql.literal(columns)} FROM ${sql(table)} WHERE id = ${entityId} AND school_id = ${schoolId}
  `
  const [row] = rows
  if (row === undefined) {
    return yield* Effect.fail(new EntityNotFoundError({ entityType, entityId }))
  }
  return yield* decodeOwnedRow(resultSchema, row)
})

/** A track belongs to a specific level, not just to the school — checked separately since a track and a level can each independently belong to the right school while the track still belongs to a *different* level (e.g. a 1BAC track passed alongside a 2BAC levelId). */
export const requireTrackBelongsToLevel = Effect.fn("Ownership.requireTrackBelongsToLevel")(function*(
  sql: SqlClient,
  trackId: TrackId,
  levelId: LevelId,
  schoolId: SchoolId
) {
  const rows = yield* sql`
    SELECT id FROM tracks WHERE id = ${trackId} AND level_id = ${levelId} AND school_id = ${schoolId}
  `
  if (rows.length === 0) {
    return yield* Effect.fail(new EntityNotFoundError({ entityType: "track", entityId: trackId }))
  }
})
