import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #111 (EVA: certifying-exam grades — resolving wayfinder ticket
 * #111). `exam_grades` is a new, dedicated entity rather than a widened
 * `Assessment`/`Mark` — BEH-ZS-120's required `session`/`source`/entry-author
 * fields have no home on `Mark`'s value/marker/status shape, and an external
 * exam doesn't belong to one class the way a `Mark` does.
 *
 * `exam_slot` (1 or 2) matches `computation_rules.weight_exam_1`/
 * `weight_exam_2` (migration 0005/0036) — which of the two ministry
 * weighting slots this grade fills. For 6AP/3AC, slot 1 is the *internal*
 * "local unified exam" (an ordinary `counts_as_unified_test` Assessment,
 * migration 0035) and never gets a row here; only slot 2 (the true external
 * exam) does. For the baccalaureate, both slots are external and both get
 * rows. `ExamGrade.ts#assertValidExamSlotForLevel` rejects a slot that
 * isn't externally valid for the enrollment's level before ever reaching
 * this table.
 *
 * `UNIQUE (enrollment_id, subject_id, evaluation_period_id, exam_slot)`:
 * one grade per student/subject/period/slot — `ExamGrade.ts`'s own
 * overwrite-confirmation flow (`would_overwrite` analyze outcome) is the
 * only path that replaces an existing row, never a second insert.
 *
 * `value` carries the same 0-20 `CHECK` as `marks.value`/`conduct_grades.value`
 * as a backstop — `ExamGrade.ts` checks this before ever reaching SQL, same
 * "check first" idiom as `ConductGrade.ts`'s `assertValidConductGradeValue`.
 *
 * No lock/unlock enforcement yet (BEH-ZS-120's "cannot be edited after the
 * period closes without the unlock procedure") — deferred to #112, same
 * disclosed-interim-state precedent #110 already set for `PeriodResult`
 * freezing.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE exam_grades (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      subject_id uuid NOT NULL REFERENCES subjects (id),
      evaluation_period_id uuid NOT NULL REFERENCES evaluation_periods (id),
      exam_slot integer NOT NULL CHECK (exam_slot IN (1, 2)),
      -- Free-text, e.g. "June 2026 provincial exam" — same "tracked text, not
      -- structured data" precedent as computation_rules.reference_text.
      session text NOT NULL,
      value numeric NOT NULL CHECK (value >= 0 AND value <= 20),
      source text NOT NULL CHECK (source IN ('manual', 'import')),
      entered_by_person_id uuid NOT NULL REFERENCES persons (id),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz,
      UNIQUE (enrollment_id, subject_id, evaluation_period_id, exam_slot)
    )
  `
  yield* applyTenantIsolation(sql, "exam_grades")
})
