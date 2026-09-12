import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #15 (ADR-ZS-113): the current-term slice of grade import. `Mark` is
 * N—1 to `Assessment`, never attached directly to `Subject`/`EvaluationPeriod`
 * (spec/behaviors/05-assessments-grades-report-cards.md §6) — since no
 * assessment-entry feature exists yet to have created one, import synthesizes
 * a placeholder `Assessment` per (evaluation_period, subject, class),
 * `is_import_synthesized = true` so it's never confused with one a teacher
 * actually created (ADR-ZS-113 user stories 6/18). `type` is restricted to
 * `'imported'` for now — the full type vocabulary (test, homework, exam, ...)
 * is the not-yet-built EVA capability's own scope, not reintroduced here
 * ahead of a ticket that needs it (same reasoning as `import_batches
 * .import_domain`'s single-value CHECK, migration 0010).
 *
 * Historical grade import (ADR-ZS-112's archival `AcademicYear`, and the
 * `'completed'` `Enrollment` status ADR-ZS-113 pairs with it) is deliberately
 * out of this migration's scope — a separate follow-up ticket, per this
 * session's own scoping decision on #15.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE assessments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      academic_year_id uuid NOT NULL REFERENCES academic_years (id),
      evaluation_period_id uuid NOT NULL REFERENCES evaluation_periods (id),
      subject_id uuid NOT NULL REFERENCES subjects (id),
      class_id uuid NOT NULL REFERENCES classes (id),
      type text NOT NULL CHECK (type IN ('imported')),
      coefficient numeric NOT NULL DEFAULT 1,
      is_import_synthesized boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      -- One synthesized "imported" assessment per (period, subject, class) —
      -- the natural key findOrCreateImportedAssessment finds-or-creates on,
      -- so committing the same batch twice never creates a second container.
      UNIQUE (evaluation_period_id, subject_id, class_id, type)
    )
  `
  yield* applyTenantIsolation(sql, "assessments")

  yield* sql`
    CREATE TABLE marks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      assessment_id uuid NOT NULL REFERENCES assessments (id),
      enrollment_id uuid NOT NULL REFERENCES enrollments (id),
      -- Always the value already normalized to /20 (ADR-ZS-058: "any scale
      -- other than /20 is normalized to /20 before weighting") — the row's
      -- own original scale, if not /20, is a commit-time input only, never
      -- persisted per-Mark.
      value numeric NOT NULL CHECK (value >= 0 AND value <= 20),
      -- Defaults to draft, never auto-published: import writes raw data a
      -- teacher never entered through the platform's own review flow, so
      -- publication stays a deliberate later step (the not-yet-built
      -- closing/publish flow), not something the import pipeline decides.
      status text NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
      remark text,
      created_at timestamptz NOT NULL DEFAULT now(),
      -- One mark per (assessment, enrollment): ADR-ZS-113's synthesized
      -- assessment "is the entirety of what's known for this period" per
      -- student — re-committing the same row is a no-op, not a duplicate.
      UNIQUE (assessment_id, enrollment_id)
    )
  `
  yield* applyTenantIsolation(sql, "marks")
})
