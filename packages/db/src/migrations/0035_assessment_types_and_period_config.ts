import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #109 (EVA capability map, #107): assessment type library, period
 * configuration, and the national-reference-framework compliance check.
 *
 * `assessment_types` is a flat per-school catalog (BEH-ZS-111) — same shape
 * as `discipline_severity_levels`/`sanction_types` (migration 0029), not
 * scoped by section/cycle despite the spec's literal wording: no catalog
 * anywhere in this codebase uses that scoping dimension, and a school
 * needing per-section variants can just label entries distinctly.
 * `counts_as_class_test`/`counts_as_unified_test` back BEH-ZS-116's
 * compliance check ("admissible types... configurable per level" — kept
 * catalog-wide rather than a separate per-level table, the same
 * simplification).
 *
 * `assessments.type`'s CHECK (migration 0012, deliberately left open for
 * this ticket — "the full type vocabulary... is the not-yet-built EVA
 * capability's own scope") widens to add `'live'`: a teacher-created
 * Assessment, as opposed to `'imported'`'s synthesized-by-the-import-
 * pipeline meaning. `assessment_type_id` is the REAL BEH-ZS-111 type — only
 * ever set (and required) for a `'live'` Assessment; an imported one has no
 * real type on record, `is_import_synthesized` already says why.
 * Assessment's own weighting reuses the already-existing `coefficient`
 * column (never a new field) and its grading scale is normalized-at-entry
 * per section (`GradingScale`, already built, ticket #6/#36) —
 * `AssessmentType` itself carries neither, staying a pure label per this
 * ticket's own resolution.
 *
 * Migration 0012's `UNIQUE (evaluation_period_id, subject_id, class_id,
 * type)` was designed entirely around the import path's "one synthesized
 * placeholder per triple" invariant — correct for `type = 'imported'`, but
 * wrong the moment `'live'` assessments exist: a teacher legitimately
 * creates SEVERAL live assessments for the same (period, subject, class)
 * — two class tests and a composition exam in one semester, say. Narrowed
 * to a partial unique index scoped to `WHERE type = 'imported'` so the
 * import invariant survives unchanged while live assessments are unlimited
 * per triple.
 *
 * `evaluation_periods.massar_semester`/`massar_semester_2_starts_at`
 * (BEH-ZS-112): a semester-based section's own periods ARE the Massar
 * semesters (`massar_semester` set directly, no split needed). A trimester
 * section needs the default T1->S1, T3->S2 mapping plus T2's own
 * date-conditional split (S1 until the ministry's own semester-1 end date,
 * S2 from then on) — `massar_semester_2_starts_at` carries that threshold
 * only on the one period that actually splits; every other period leaves it
 * null. Only the mapping's own shape is built here — resolving a specific
 * grade's date against it is Massar export's own job (#118), unbuilt. A
 * partial unique index enforces "only one period per (section, academic
 * year) can be the one that splits" — the shape the doc comment above
 * documents, now a real constraint rather than a convention a caller could
 * silently violate.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE assessment_types (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      label text NOT NULL,
      counts_as_class_test boolean NOT NULL DEFAULT false,
      counts_as_unified_test boolean NOT NULL DEFAULT false
    )
  `
  yield* applyTenantIsolation(sql, "assessment_types")

  yield* sql`ALTER TABLE assessments DROP CONSTRAINT assessments_type_check`
  yield* sql`ALTER TABLE assessments ADD CONSTRAINT assessments_type_check CHECK (type IN ('imported', 'live'))`
  yield* sql`ALTER TABLE assessments ADD COLUMN assessment_type_id uuid REFERENCES assessment_types (id)`
  yield* sql`
    ALTER TABLE assessments ADD CONSTRAINT assessments_live_has_assessment_type CHECK (
      (type = 'imported' AND assessment_type_id IS NULL) OR (type = 'live' AND assessment_type_id IS NOT NULL)
    )
  `

  yield* sql`ALTER TABLE assessments DROP CONSTRAINT assessments_evaluation_period_id_subject_id_class_id_type_key`
  yield* sql`
    CREATE UNIQUE INDEX assessments_imported_period_subject_class_key
      ON assessments (evaluation_period_id, subject_id, class_id, type)
      WHERE type = 'imported'
  `

  yield* sql`ALTER TABLE evaluation_periods ADD COLUMN massar_semester text CHECK (massar_semester IN ('S1', 'S2'))`
  yield* sql`ALTER TABLE evaluation_periods ADD COLUMN massar_semester_2_starts_at date`
  yield* sql`
    CREATE UNIQUE INDEX evaluation_periods_one_massar_split_per_section_year
      ON evaluation_periods (section_id, academic_year_id)
      WHERE massar_semester_2_starts_at IS NOT NULL
  `
})
