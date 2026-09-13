import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #77 (ADR-ZS-043's "optionally aggregated absences" — the
 * attendance half of the mid-year catch-up import, split off from #12 once
 * the Attendance capability's own domain models existed). Unlike
 * `FinancialHistoryImport.ts`'s marker-column idempotency (migration 0023:
 * its underlying operations have no natural per-row key), one row here IS
 * naturally unique per `(student_enrollment_id, period_label)` — so that
 * pair is the table's own unique constraint, the same "insert, catch the
 * unique violation, treat as already-applied" idiom `SchoolMembership.ts`'s
 * `inviteTeacherMembership` already uses, rather than a separate marker.
 *
 * Deliberately NOT synthesized into `attendance_records`/
 * `roll_call_submissions` (ticket #96): those represent real operational
 * roll-call events with a real teacher and session behind them, which a
 * pre-ZSchool aggregate count has none of — same "historical data gets its
 * own honest shape, not faked into the live pipeline" precedent
 * `HistoricalGradeImport.ts`'s archival-year synthesis establishes for
 * grades.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE imported_absence_history (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      student_enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      period_label text NOT NULL,
      start_date date NOT NULL,
      end_date date NOT NULL,
      absence_count integer NOT NULL,
      tardy_count integer NOT NULL DEFAULT 0,
      imported_at timestamptz NOT NULL DEFAULT now(),
      CHECK (end_date >= start_date),
      UNIQUE (student_enrollment_id, period_label)
    )
  `
  yield* applyTenantIsolation(sql, "imported_absence_history")
})
