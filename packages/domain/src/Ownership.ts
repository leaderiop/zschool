import type { Policy } from "@qadi/core/Policy"
import * as Qadi from "@qadi/core/Qadi"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { canManageAcademicStructure, canManageFinance } from "./authorization/Policies.ts"
import type { SchoolId } from "./Ids.ts"

/** The actual `Qadi.assert` call every capability-scoped write shares — `authorized`/`authorizedFinance` below are named, single-policy wrappers over this so a call site never has to name its own policy/action pair. */
export const authorizeWith = Effect.fn("Ownership.authorizeWith")(function*<A, E, R>(
  policy: Policy,
  action: string,
  schoolId: SchoolId,
  effect: Effect.Effect<A, E, R>
) {
  yield* Qadi.assert(policy, { resource: { school_id: schoolId }, action })
  return yield* effect
})

/** Every academic-structure write goes through this same `@qadi` policy — a director may only act on their own school. Shared so a change to how failures surface doesn't need editing in every domain module. */
export const authorized = <A, E, R>(schoolId: SchoolId, effect: Effect.Effect<A, E, R>) =>
  authorizeWith(canManageAcademicStructure, "manage-academic-structure", schoolId, effect)

/** Same shape as `authorized` above, gated by `canManageFinance` instead — finance writes (ticket #56 onward) are a distinct capability from academic-structure writes, even though both are director-only at MVP. */
export const authorizedFinance = <A, E, R>(schoolId: SchoolId, effect: Effect.Effect<A, E, R>) =>
  authorizeWith(canManageFinance, "manage-finance", schoolId, effect)

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
export class EntityNotFoundError extends Schema.TaggedError<EntityNotFoundError>()("EntityNotFoundError", {
  entityType: Schema.String,
  entityId: Schema.String
}) {}

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
