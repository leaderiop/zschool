import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * Ticket #15's historical-grade-import follow-up (ADR-ZS-112/113).
 *
 * `is_archival` distinguishes an academic year import creates already-closed
 * (ADR-ZS-112: "born closed, never operationally opened on the platform")
 * from one the platform closed itself through normal rollover — without it,
 * a retry importing the same historical year label a second time couldn't
 * tell "this is my own archival year, safe to reuse" apart from "a real,
 * platform-operated year happens to share this label," and could either
 * silently write into someone's live year or spuriously refuse a legitimate
 * retry. `getOrCreateArchivalYear` (HistoricalGradeImport.ts) is the only
 * writer of `true`.
 *
 * `'completed'` joins `enrollments.status`'s vocabulary (ADR-ZS-113): the
 * status a synthesized historical `Enrollment` always carries, since the
 * archival year it lives in is already finished by construction — no live
 * lifecycle progression to represent. `domain-model.md`'s own `YearDecision`
 * entry already documents COMPLETED as part of `Enrollment`'s full status
 * vocabulary; this migration is the first writer to actually need it.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`ALTER TABLE academic_years ADD COLUMN is_archival boolean NOT NULL DEFAULT false`

  yield* sql`ALTER TABLE enrollments DROP CONSTRAINT enrollments_status_check`
  yield* sql`
    ALTER TABLE enrollments ADD CONSTRAINT enrollments_status_check
      CHECK (status IN ('pre_enrolled', 'active', 'completed'))
  `
})
