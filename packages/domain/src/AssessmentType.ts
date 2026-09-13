import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { canEnterGrades } from "./authorization/Policies.ts"
import { AssessmentTypeId, CourseId, EvaluationPeriodId, SchoolId } from "./Ids.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"
import { assertTeacherAssignedToCourse } from "./TeacherAssignment.ts"

/**
 * Ticket #109 (EVA capability map, #107): the assessment-type library
 * (BEH-ZS-111), live `Assessment` creation (the counterpart `GradeEntry.ts`
 * — tickets #120/#121 — deliberately left as "a given input, not something
 * this ticket creates"), and the BEH-ZS-116 compliance check.
 *
 * `AssessmentType` is a pure label (school-configurable per-school catalog,
 * migration 0035) — no grading scale or weighting of its own. An
 * `Assessment` instance already carries both: `coefficient` (its existing
 * column, reused rather than duplicated — the spec's own "weighting")
 * normalized against the section's own `GradingScale` at entry time
 * (`GradeImport.ts`/`GradeEntry.ts`'s existing normalize-to-/20 convention).
 */

export class AssessmentType extends Model.Class<AssessmentType>("AssessmentType")({
  id: Model.Field({
    select: AssessmentTypeId,
    update: AssessmentTypeId,
    json: AssessmentTypeId,
    jsonUpdate: AssessmentTypeId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  label: Schema.String,
  counts_as_class_test: Schema.Boolean,
  counts_as_unified_test: Schema.Boolean
}) {}

const assessmentTypeRepo = SqlModel.makeRepository(AssessmentType, {
  tableName: "assessment_types",
  spanPrefix: "AssessmentType",
  idColumn: "id"
})

/** School-leadership configuration, same `canManageAcademicStructure`-via-`authorized` gate every other structural catalog in this codebase uses (`Courses.ts`, `GradingScales.ts`, `Calendar.ts`) — distinct from `canEnterGrades`, which only gates writing actual grade data. */
export const createAssessmentType = Effect.fn("AssessmentType.createAssessmentType")(function*(
  rawSchoolId: string,
  label: string,
  countsAsClassTest: boolean,
  countsAsUnifiedTest: boolean
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const repo = yield* assessmentTypeRepo
        return yield* repo.insert({
          school_id: schoolId,
          label,
          counts_as_class_test: countsAsClassTest,
          counts_as_unified_test: countsAsUnifiedTest
        })
      })
    )
  )
})

export const findAssessmentTypes = Effect.fn("AssessmentType.findAssessmentTypes")(function*(rawSchoolId: string) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String }),
        Result: AssessmentType,
        execute: (req) => sql`SELECT * FROM assessment_types WHERE school_id = ${req.schoolId} ORDER BY label`
      })({ schoolId })
    })
  )
})

/**
 * Creates the live `Assessment` `GradeEntry.ts`'s `enterGrades`/
 * `publishAssessment` (tickets #120/#121) treat as a given — the
 * counterpart to `GradeImport.ts#findOrCreateImportedAssessment`, for a
 * teacher actually giving a test rather than importing historical data.
 * Gated the same way grade entry itself is (BEH-ZS-111's own "assessment
 * creation MUST be limited to the teacher's assigned courses," INV-ZS-091)
 * — reuses `assertTeacherAssignedToCourse` so this and `GradeEntry.ts`'s
 * `authorizeGradeWrite` never drift apart. `(subject_id, class_id,
 * academic_year_id)` are resolved from `courseId` itself, never
 * caller-supplied, so a stale/mismatched value can't create an Assessment
 * that disagrees with its own course. Every id this function is given
 * (`courseId`, `evaluationPeriodId`, `assessmentTypeId`) is confirmed to
 * belong to `schoolId` before the write — a bare FK alone would let a
 * cross-tenant id either surface as a raw constraint error or, worse,
 * silently attach across tenants, the same reasoning `Ownership.ts`'s own
 * `requireOwnedRow` documents for every other write in this codebase.
 */
export const createAssessment = Effect.fn("AssessmentType.createAssessment")(function*(
  rawSchoolId: string,
  rawCourseId: string,
  rawEvaluationPeriodId: string,
  rawAssessmentTypeId: string,
  coefficient: number
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const courseId = yield* Schema.decodeEffect(CourseId)(rawCourseId)
  const evaluationPeriodId = yield* Schema.decodeEffect(EvaluationPeriodId)(rawEvaluationPeriodId)
  const assessmentTypeId = yield* Schema.decodeEffect(AssessmentTypeId)(rawAssessmentTypeId)

  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient

      // Resolved (and existence-checked) BEFORE authorization: a courseId
      // that doesn't exist has no assigned teachers either, so checking
      // authorization first would always surface as a denial rather than
      // the more useful "not found" — same "check first" ordering every
      // import/write domain in this codebase already follows. Excludes a
      // deactivated course (`c.is_active`), matching
      // `findAssessmentCompliance`'s own denominator below — a course no
      // longer taught shouldn't gain new live Assessments either.
      const courseRows = yield* sql<{ class_id: string; subject_id: string; academic_year_id: string }>`
        SELECT c.class_id, c.academic_year_id, slc.subject_id
        FROM courses c
        JOIN subject_level_configs slc ON slc.id = c.subject_level_config_id
        WHERE c.id = ${courseId} AND c.school_id = ${schoolId} AND c.is_active
      `
      const course = courseRows[0]
      if (course === undefined) {
        return yield* new EntityNotFoundError({ entityType: "course", entityId: courseId })
      }

      yield* requireOwnedRow(sql, "evaluation_periods", "evaluation_period", evaluationPeriodId, schoolId, RowWithId)
      yield* requireOwnedRow(sql, "assessment_types", "assessment_type", assessmentTypeId, schoolId, RowWithId)

      yield* assertTeacherAssignedToCourse(canEnterGrades, schoolId, courseId, "create-assessment")

      const [inserted] = yield* sql<{ id: string }>`
        INSERT INTO assessments
          (school_id, academic_year_id, evaluation_period_id, subject_id, class_id, type, assessment_type_id, coefficient, is_import_synthesized)
        VALUES (
          ${schoolId}, ${course.academic_year_id}, ${evaluationPeriodId}, ${course.subject_id}, ${course.class_id},
          'live', ${assessmentTypeId}, ${coefficient}, false
        )
        RETURNING id
      `
      return inserted.id
    })
  )
})

export type ComplianceStatus = "compliant" | "gap" | "non_compliant"

export interface SubjectClassCompliance {
  readonly subjectId: string
  readonly classId: string
  readonly classTestCount: number
  readonly unifiedTestCount: number
  readonly status: ComplianceStatus
}

const REQUIRED_CLASS_TESTS = 2
const REQUIRED_UNIFIED_TESTS = 1

/**
 * BEH-ZS-058/ADR-ZS-058's own certifying-level codes (`GradingScales.ts`'s
 * `defaultComputationRules`) reused here rather than a new "is this a
 * certifying level" schema concept — no such flag exists anywhere else in
 * this codebase, and BEH-ZS-116's waiver ("except in the second semester of
 * exam years") only needs to know the same three level codes that already
 * drive the certifying weightings.
 */
const CERTIFYING_LEVEL_CODES: ReadonlySet<string> = new Set(["6AP", "3AC", "2BAC"])

/**
 * BEH-ZS-116: an informational-only (MVP), per-`(subject, class)` view of
 * whether the national continuous-assessment minimum (at least two
 * `counts_as_class_test` Assessments and one `counts_as_unified_test`
 * Assessment, per subject and per semester) is met for one
 * `EvaluationPeriod` — never blocking, never written anywhere.
 *
 * Starts from `courses` (a subject a class is actually meant to be taught,
 * per its `SubjectLevelConfig`), left-joining any matching `Assessment`s
 * for the period, so a subject/class with ZERO assessments still appears
 * (correctly `non_compliant`) rather than being silently absent from the
 * result the way starting from `assessments` itself would leave it.
 *
 * The exam-year waiver ("except in the second semester of exam years") is
 * approximated as "the certifying level's own last `EvaluationPeriod` of
 * the academic year" — this codebase has no explicit end-of-year/semester
 * marker beyond period `sequence`, and BEH-ZS-116 is itself only an
 * informational warning at MVP, so an imprecise waiver boundary has no
 * blocking consequence.
 *
 * Disclosed limitation: an `'imported'` `Assessment` never counts toward
 * either total (`assessment_type_id` is always `NULL` for one, per this
 * ticket's own CHECK) — not fixable without also redesigning
 * `GradeImport.ts`'s row shape, which has no notion of "class test" vs.
 * "unified test" at all (out of this ticket's scope). A school whose
 * current-term data arrived entirely via import will under-report here
 * even if genuinely compliant; acceptable given BEH-ZS-116 is informational
 * only, never blocking, at MVP.
 */
export const findAssessmentCompliance = Effect.fn("AssessmentType.findAssessmentCompliance")(function*(
  rawSchoolId: string,
  rawEvaluationPeriodId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const evaluationPeriodId = yield* Schema.decodeEffect(EvaluationPeriodId)(rawEvaluationPeriodId)

  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient

      const periodRows = yield* sql<{ sequence: number; section_id: string; academic_year_id: string; max_sequence: number }>`
        SELECT ep.sequence, ep.section_id, ep.academic_year_id,
          (SELECT max(sequence) FROM evaluation_periods
           WHERE section_id = ep.section_id AND academic_year_id = ep.academic_year_id) AS max_sequence
        FROM evaluation_periods ep
        WHERE ep.id = ${evaluationPeriodId} AND ep.school_id = ${schoolId}
      `
      const period = periodRows[0]
      if (period === undefined) return []

      const isFinalPeriodOfYear = period.sequence === period.max_sequence

      const rows = yield* sql<{
        subject_id: string
        class_id: string
        level_code: string
        class_test_count: string
        unified_test_count: string
      }>`
        SELECT slc.subject_id, c.class_id, lvl.code AS level_code,
          count(*) FILTER (WHERE at.counts_as_class_test) AS class_test_count,
          count(*) FILTER (WHERE at.counts_as_unified_test) AS unified_test_count
        FROM courses c
        JOIN subject_level_configs slc ON slc.id = c.subject_level_config_id
        JOIN classes cls ON cls.id = c.class_id
        JOIN levels lvl ON lvl.id = cls.level_id
        LEFT JOIN assessments a ON a.class_id = c.class_id AND a.subject_id = slc.subject_id
          AND a.evaluation_period_id = ${evaluationPeriodId}
        LEFT JOIN assessment_types at ON at.id = a.assessment_type_id
        WHERE c.school_id = ${schoolId} AND c.academic_year_id = ${period.academic_year_id} AND c.is_active
        GROUP BY slc.subject_id, c.class_id, lvl.code
      `

      return rows.map((row): SubjectClassCompliance => {
        const classTestCount = Number(row.class_test_count)
        const unifiedTestCount = Number(row.unified_test_count)
        const waived = isFinalPeriodOfYear && CERTIFYING_LEVEL_CODES.has(row.level_code)
        const status: ComplianceStatus = waived ||
            (classTestCount >= REQUIRED_CLASS_TESTS && unifiedTestCount >= REQUIRED_UNIFIED_TESTS)
          ? "compliant"
          : classTestCount === 0 && unifiedTestCount === 0
          ? "non_compliant"
          : "gap"
        return { subjectId: row.subject_id, classId: row.class_id, classTestCount, unifiedTestCount, status }
      })
    })
  )
})
