import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * Ticket #120 (EVA: batch grade entry with offline conflict resolution,
 * resolving wayfinder ticket #108 / spec #119): widens `marks` (migration
 * 0012) beyond the import-only shape its own comment left room for.
 *
 * `value` becomes nullable — a `marker` column now covers the non-numeric
 * outcomes BEH-ZS-117(a) requires (`absent_unjustified`, `absent_justified`,
 * `exempted`); the table-level CHECK enforces exactly one of the two is ever
 * set. "Ungraded/NG" is deliberately NOT one of these markers — per
 * BEH-ZS-117(c) it's a subject-wide state a future `PeriodResult`
 * computation derives when a subject has zero `Mark` rows at all, not
 * something recorded on any individual `Mark`.
 *
 * `entered_at`/`updated_at` support BEH-ZS-114's offline conflict rule
 * (last-write-wins by `entered_at`, never by `updated_at`): `entered_at` is
 * the client-supplied "when the teacher actually entered this," excluded
 * from `Mark`'s own `insert`/`jsonCreate` Model type so the existing
 * `GradeImport.ts#upsertMark` import path (no client timestamp to give)
 * keeps relying on the column default; `updated_at` is server-write-time
 * only, matching `created_at`'s own `Model.GeneratedByDb` treatment.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`ALTER TABLE marks ALTER COLUMN value DROP NOT NULL`
  yield* sql`
    ALTER TABLE marks ADD COLUMN marker text
      CHECK (marker IN ('absent_unjustified', 'absent_justified', 'exempted'))
  `
  yield* sql`
    ALTER TABLE marks ADD CONSTRAINT marks_value_xor_marker CHECK ((value IS NULL) <> (marker IS NULL))
  `
  yield* sql`ALTER TABLE marks ADD COLUMN entered_at timestamptz NOT NULL DEFAULT now()`
  yield* sql`ALTER TABLE marks ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now()`
})
