import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * Ticket #3 acceptance criterion 6 / ADR-ZS-065: "leadership approval
 * required to exceed" a class's capacity. `enrollments` is insert-only
 * (`Enrollment.ts`'s own doc comment) — recording the director's reason
 * directly on the enrollment row it justifies makes that row its own
 * permanent evidence of the approval, with no separate mutable approval
 * record to keep in sync. `NULL` when the enrollment didn't need one.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient
  yield* sql`ALTER TABLE enrollments ADD COLUMN capacity_override_reason text NULL`
})
