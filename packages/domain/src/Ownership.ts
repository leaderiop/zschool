import type { EvaluationServices } from "@qadi/core/Evaluate"
import * as Qadi from "@qadi/core/Qadi"
import type { EnforcementError } from "@qadi/core/Qadi"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { canManageAcademicStructure } from "./authorization/Policies.ts"
import type { LevelId, SchoolId, TrackId } from "./Ids.ts"

/** Every academic-structure write goes through this same `@qadi` policy — a director may only act on their own school. Shared so a change to how failures surface doesn't need editing in every domain module. */
export const authorized = Effect.fn("Ownership.authorized")(function*<A, E, R>(
  schoolId: SchoolId,
  effect: Effect.Effect<A, E, R>
): Effect.fn.Return<A, E | EnforcementError, R | EvaluationServices> {
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

export const requireOwnedRow = Effect.fn("Ownership.requireOwnedRow")(function*<
  A extends Record<string, unknown> = { id: string }
>(
  sql: SqlClient,
  table: string,
  entityType: string,
  entityId: string,
  schoolId: SchoolId,
  columns = "id"
): Effect.fn.Return<A, EntityNotFoundError | SqlError> {
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
export const requireTrackBelongsToLevel = Effect.fn("Ownership.requireTrackBelongsToLevel")(function*(
  sql: SqlClient,
  trackId: TrackId,
  levelId: LevelId,
  schoolId: SchoolId
): Effect.fn.Return<void, EntityNotFoundError | SqlError> {
  const rows = yield* sql`
    SELECT id FROM tracks WHERE id = ${trackId} AND level_id = ${levelId} AND school_id = ${schoolId}
  `
  if (rows.length === 0) {
    return yield* Effect.fail(new EntityNotFoundError({ entityType: "track", entityId: trackId }))
  }
})
