import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"

/**
 * Runs `effect` inside a transaction with the Postgres session GUC
 * `app.current_school_id` set to `schoolId`, so every `tenant_isolation` RLS
 * policy (ADR-ZS-092) scopes visible rows to this school for the duration of
 * the transaction. This is the RLS half of tenant isolation — the `@qadi`
 * authorization decision that a caller may act as this school is a separate,
 * prior check (ADR-ZS-096), not performed here.
 */
export const withSchool = <A, E, R>(
  schoolId: string,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E | SqlError, R | SqlClient> =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    return yield* sql.withTransaction(
      Effect.andThen(sql`SELECT set_config('app.current_school_id', ${schoolId}, true)`, effect)
    )
  })
