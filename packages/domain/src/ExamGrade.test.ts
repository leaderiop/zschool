import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  analyzeExamGradeRows,
  commitExamGradeBatch,
  type ExamGradeImportRow,
  ExamGradeAlreadyExistsError,
  InvalidExamGradeValueError,
  InvalidExamSlotForLevelError,
  recordExamGrade
} from "./ExamGrade.ts"
import { defaultHonorsThresholds } from "./GradingScales.ts"
import { recomputePeriodResult } from "./PeriodResult.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asDirectorOf = (schoolId: string, directorPersonId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({ id: directorPersonId, roles: ["director"], attributes: { school_id: schoolId } })
    )
  )

const asTeacherOf = (schoolId: string, teacherPersonId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({
        id: teacherPersonId,
        roles: ["teacher"],
        attributes: { school_id: schoolId, person_id: teacherPersonId }
      })
    )
  )

/**
 * A 3AC (certifying-level) class with one subject, one evaluation period, a
 * `ComputationRule` matching BEH-ZS-118's real 3AC weighting (30% continuous
 * / 30% local unified exam / 40% regional exam), two `AssessmentType`s (one
 * ordinary, one `counts_as_unified_test`), and one enrolled student with a
 * known Massar code and name/date-of-birth — enough for
 * `recordExamGrade`/`analyzeExamGradeRows`/`commitExamGradeBatch`'s full
 * validation/matching pipeline and `recomputePeriodResult`'s certifying-level
 * folding, without depending on `InstantiateNationalTemplate.ts`'s own
 * broader seed.
 */
const withExamGradeFixture = Effect.fn(function*<A, E, R>(
  use: (seed: {
    schoolId: string
    academicYearId: string
    classId: string
    subjectId: string
    evaluationPeriodId: string
    continuousAssessmentTypeId: string
    unifiedAssessmentTypeId: string
    enrollmentId: string
    massarCode: string
    directorPersonId: string
    teacherPersonId: string
  }) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #111 exam grade test school') RETURNING id
  `
  return yield* withSchool(
    school.id,
    Effect.gen(function*() {
      const [year] = yield* sql<{ id: string }>`
        INSERT INTO academic_years (school_id, label) VALUES (${school.id}, '2026-2027') RETURNING id
      `
      const [section] = yield* sql<{ id: string }>`
        INSERT INTO sections (school_id, academic_year_id, template, name)
        VALUES (${school.id}, ${year.id}, 'national', 'National') RETURNING id
      `
      const [cycle] = yield* sql<{ id: string }>`
        INSERT INTO cycles (school_id, academic_year_id, section_id, code, name, sort_order)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'MIDDLE', 'Middle', 1) RETURNING id
      `
      const [level] = yield* sql<{ id: string }>`
        INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
        VALUES (${school.id}, ${year.id}, ${cycle.id}, '3AC', '3AC', 1) RETURNING id
      `
      const [cls] = yield* sql<{ id: string }>`
        INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
        VALUES (${school.id}, ${year.id}, ${level.id}, '3AC-1', 30) RETURNING id
      `
      const [subject] = yield* sql<{ id: string }>`
        INSERT INTO subjects (school_id, academic_year_id, section_id, code, name)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'MATH', 'Mathématiques') RETURNING id
      `
      const [slc] = yield* sql<{ id: string }>`
        INSERT INTO subject_level_configs (school_id, academic_year_id, subject_id, level_id, coefficient, teaching_language)
        VALUES (${school.id}, ${year.id}, ${subject.id}, ${level.id}, 4, 'fr') RETURNING id
      `
      yield* sql`
        INSERT INTO courses (school_id, academic_year_id, class_id, subject_level_config_id)
        VALUES (${school.id}, ${year.id}, ${cls.id}, ${slc.id})
      `
      const [period] = yield* sql<{ id: string }>`
        INSERT INTO evaluation_periods (school_id, academic_year_id, section_id, code, name, sequence)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'S1', 'Semester 1', 1) RETURNING id
      `
      // Real BEH-ZS-118 3AC weighting: 30% continuous, 30% local unified exam
      // (slot 1, internal), 40% regional exam (slot 2, external).
      yield* sql`
        INSERT INTO computation_rules (
          school_id, academic_year_id, level_id, weight_continuous, weight_exam_1, weight_exam_2,
          reference_text, lowest_grade_exclusion_min_count, honors_thresholds, unjustified_absence_counts_as_zero
        )
        VALUES (
          ${school.id}, ${year.id}, ${level.id}, 30, 30, 40, 'test 3AC rule', NULL,
          ${JSON.stringify(defaultHonorsThresholds)}::jsonb, true
        )
      `
      const [continuousAssessmentType] = yield* sql<{ id: string }>`
        INSERT INTO assessment_types (school_id, label, counts_as_class_test, counts_as_unified_test)
        VALUES (${school.id}, 'Devoir', true, false) RETURNING id
      `
      const [unifiedAssessmentType] = yield* sql<{ id: string }>`
        INSERT INTO assessment_types (school_id, label, counts_as_class_test, counts_as_unified_test)
        VALUES (${school.id}, 'Examen unifié', false, true) RETURNING id
      `

      const directorPersonId = yield* randomUUID
      yield* sql`INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${directorPersonId}, 'Nadia', 'Director', '1975-01-01')`

      const teacherPersonId = yield* randomUUID
      yield* sql`INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${teacherPersonId}, 'Samira', 'Teacher', '1985-01-01')`

      const studentId = yield* randomUUID
      const massarCode = "M" + school.id.replace(/-/g, "").slice(0, 12)
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth, massar_code)
        VALUES (${studentId}, 'Zineb', 'Fassi', '2013-01-01', ${massarCode})
      `
      const [enrollment] = yield* sql<{ id: string }>`
        INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
        VALUES (${school.id}, ${year.id}, '2026-2027', ${studentId}, ${cls.id}, 'active', '2026-09-01')
        RETURNING id
      `

      return yield* use({
        schoolId: school.id,
        academicYearId: year.id,
        classId: cls.id,
        subjectId: subject.id,
        evaluationPeriodId: period.id,
        continuousAssessmentTypeId: continuousAssessmentType.id,
        unifiedAssessmentTypeId: unifiedAssessmentType.id,
        enrollmentId: enrollment.id,
        massarCode,
        directorPersonId,
        teacherPersonId
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

const insertMark = (
  sql: SqlClient,
  seed: { schoolId: string; academicYearId: string; evaluationPeriodId: string; classId: string; subjectId: string },
  assessmentTypeId: string,
  enrollmentId: string,
  value: number
) =>
  Effect.gen(function*() {
    const [assessment] = yield* sql<{ id: string }>`
      INSERT INTO assessments
        (school_id, academic_year_id, evaluation_period_id, subject_id, class_id, type, assessment_type_id, coefficient, is_import_synthesized)
      VALUES (
        ${seed.schoolId}, ${seed.academicYearId}, ${seed.evaluationPeriodId}, ${seed.subjectId}, ${seed.classId},
        'live', ${assessmentTypeId}, 1, false
      )
      RETURNING id
    `
    yield* sql`
      INSERT INTO marks (school_id, assessment_id, enrollment_id, value, marker, status, entered_at)
      VALUES (${seed.schoolId}, ${assessment.id}, ${enrollmentId}, ${value}, NULL, 'published', now())
    `
  })

describe("recordExamGrade (ticket #111)", () => {
  it.effect("records a manual grade for an externally-valid slot, and audit-logs it", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const id = yield* recordExamGrade(
          seed.schoolId,
          seed.enrollmentId,
          seed.subjectId,
          seed.evaluationPeriodId,
          2,
          "June 2026 regional exam",
          15,
          undefined,
          seed.directorPersonId,
          false
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)))

        const [row] = yield* sql<{ value: string; source: string }>`
          SELECT value::text AS value, source FROM exam_grades WHERE id = ${id}
        `
        expect(Number(row.value)).toBe(15)
        expect(row.source).toBe("manual")

        const [auditRow] = yield* sql<{ action: string; entity_type: string; entity_id: string }>`
          SELECT action, entity_type, entity_id FROM audit_log
          WHERE entity_type = 'exam_grade' AND entity_id = ${id}
        `
        expect(auditRow).toBeDefined()
        expect(auditRow.action).toBe("record_exam_grade")
      })
    ))

  it.effect("is refused for a non-director actor", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const error = yield* recordExamGrade(
          seed.schoolId,
          seed.enrollmentId,
          seed.subjectId,
          seed.evaluationPeriodId,
          2,
          "June 2026 regional exam",
          15,
          undefined,
          seed.teacherPersonId,
          false
        ).pipe(Effect.provide(asTeacherOf(seed.schoolId, seed.teacherPersonId)), Effect.flip)
        expect(error).toBeDefined()
      })
    ))

  it.effect("rejects an internal-only slot for the enrollment's level", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        // 3AC's slot 1 is the internal "local unified exam" — never an
        // external grade.
        const error = yield* recordExamGrade(
          seed.schoolId,
          seed.enrollmentId,
          seed.subjectId,
          seed.evaluationPeriodId,
          1,
          "local exam",
          15,
          undefined,
          seed.directorPersonId,
          false
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)), Effect.flip)
        expect(error).toBeInstanceOf(InvalidExamSlotForLevelError)
      })
    ))

  it.effect("rejects an out-of-range value before ever reaching SQL", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const error = yield* recordExamGrade(
          seed.schoolId,
          seed.enrollmentId,
          seed.subjectId,
          seed.evaluationPeriodId,
          2,
          "June 2026 regional exam",
          25,
          undefined,
          seed.directorPersonId,
          false
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)), Effect.flip)
        expect(error).toBeInstanceOf(InvalidExamGradeValueError)
      })
    ))

  it.effect("rejects a degenerate scale that would normalize to a non-finite value", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const error = yield* recordExamGrade(
          seed.schoolId,
          seed.enrollmentId,
          seed.subjectId,
          seed.evaluationPeriodId,
          2,
          "June 2026 regional exam",
          15,
          0,
          seed.directorPersonId,
          false
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)), Effect.flip)
        expect(error).toBeInstanceOf(InvalidExamGradeValueError)
      })
    ))

  it.effect("refuses to overwrite an existing grade unless allowOverwrite is set, then overwrites when it is", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* recordExamGrade(
          seed.schoolId,
          seed.enrollmentId,
          seed.subjectId,
          seed.evaluationPeriodId,
          2,
          "June 2026 regional exam",
          15,
          undefined,
          seed.directorPersonId,
          false
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)))

        const error = yield* recordExamGrade(
          seed.schoolId,
          seed.enrollmentId,
          seed.subjectId,
          seed.evaluationPeriodId,
          2,
          "June 2026 regional exam (retry)",
          17,
          undefined,
          seed.directorPersonId,
          false
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)), Effect.flip)
        expect(error).toBeInstanceOf(ExamGradeAlreadyExistsError)

        const id = yield* recordExamGrade(
          seed.schoolId,
          seed.enrollmentId,
          seed.subjectId,
          seed.evaluationPeriodId,
          2,
          "June 2026 regional exam (corrected)",
          17,
          undefined,
          seed.directorPersonId,
          true
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)))

        const [row] = yield* sql<{ value: string }>`SELECT value::text AS value FROM exam_grades WHERE id = ${id}`
        expect(Number(row.value)).toBe(17)
      })
    ))
})

describe("analyzeExamGradeRows / commitExamGradeBatch (ticket #111, BEH-ZS-121)", () => {
  it.effect("resolves by Massar code, and by name+DOB fallback when no Massar code is given", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const rows: ReadonlyArray<ExamGradeImportRow> = [
          {
            rowId: "1",
            massarCode: seed.massarCode,
            subjectCode: "MATH",
            periodCode: "S1",
            examSlot: 2,
            session: "June 2026 regional exam",
            value: 14
          },
          {
            rowId: "2",
            lastName: "Fassi",
            firstName: "Zineb",
            dateOfBirth: "2013-01-01",
            subjectCode: "MATH",
            periodCode: "S1",
            examSlot: 2,
            session: "June 2026 regional exam",
            value: 14
          }
        ]
        const results = yield* analyzeExamGradeRows(seed.schoolId, seed.academicYearId, rows).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )
        expect(results.every((r) => r.status === "resolvable")).toBe(true)
      })
    ))

  it.effect("rejects an invalid exam_slot on import", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const rows: ReadonlyArray<ExamGradeImportRow> = [
          {
            rowId: "1",
            massarCode: seed.massarCode,
            subjectCode: "MATH",
            periodCode: "S1",
            examSlot: 3,
            session: "June 2026 regional exam",
            value: 14
          }
        ]
        const [result] = yield* analyzeExamGradeRows(seed.schoolId, seed.academicYearId, rows).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )
        expect(result.status).toBe("error")
      })
    ))

  it.effect("flags a row that would overwrite an existing grade", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        yield* recordExamGrade(
          seed.schoolId,
          seed.enrollmentId,
          seed.subjectId,
          seed.evaluationPeriodId,
          2,
          "June 2026 regional exam",
          15,
          undefined,
          seed.directorPersonId,
          false
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)))

        const rows: ReadonlyArray<ExamGradeImportRow> = [
          {
            rowId: "1",
            massarCode: seed.massarCode,
            subjectCode: "MATH",
            periodCode: "S1",
            examSlot: 2,
            session: "June 2026 regional exam (import)",
            value: 16
          }
        ]
        const [result] = yield* analyzeExamGradeRows(seed.schoolId, seed.academicYearId, rows).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )
        expect(result.status).toBe("would_overwrite")
        if (result.status === "would_overwrite") {
          expect(result.existingValue).toBe(15)
        }
      })
    ))

  it.effect("commits nothing at all when any row in the batch fails validation (all-or-nothing)", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows: ReadonlyArray<ExamGradeImportRow> = [
          {
            rowId: "good",
            massarCode: seed.massarCode,
            subjectCode: "MATH",
            periodCode: "S1",
            examSlot: 2,
            session: "June 2026 regional exam",
            value: 14
          },
          {
            rowId: "bad-no-match",
            massarCode: "NO-SUCH-CODE",
            subjectCode: "MATH",
            periodCode: "S1",
            examSlot: 2,
            session: "June 2026 regional exam",
            value: 14
          }
        ]
        const results = yield* commitExamGradeBatch(seed.schoolId, seed.academicYearId, rows, seed.directorPersonId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )
        expect(results.every((r) => r.status === "error")).toBe(true)

        const [{ count }] = yield* sql<{ count: string }>`SELECT count(*)::text AS count FROM exam_grades`
        expect(Number(count)).toBe(0)
      })
    ))

  it.effect("commits nothing when two rows in the batch target the same student/subject/period/slot", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows: ReadonlyArray<ExamGradeImportRow> = [
          {
            rowId: "1",
            massarCode: seed.massarCode,
            subjectCode: "MATH",
            periodCode: "S1",
            examSlot: 2,
            session: "June 2026 regional exam",
            value: 14
          },
          {
            rowId: "2-duplicate",
            massarCode: seed.massarCode,
            subjectCode: "MATH",
            periodCode: "S1",
            examSlot: 2,
            session: "June 2026 regional exam (resit line)",
            value: 16
          }
        ]
        const results = yield* commitExamGradeBatch(seed.schoolId, seed.academicYearId, rows, seed.directorPersonId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )
        expect(results.every((r) => r.status === "error")).toBe(true)

        const [{ count }] = yield* sql<{ count: string }>`SELECT count(*)::text AS count FROM exam_grades`
        expect(Number(count)).toBe(0)
      })
    ))

  it.effect("commits every row when the whole batch validates cleanly, and audit-logs each one", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows: ReadonlyArray<ExamGradeImportRow> = [
          {
            rowId: "1",
            massarCode: seed.massarCode,
            subjectCode: "MATH",
            periodCode: "S1",
            examSlot: 2,
            session: "June 2026 regional exam",
            value: 14
          }
        ]
        const results = yield* commitExamGradeBatch(seed.schoolId, seed.academicYearId, rows, seed.directorPersonId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )
        expect(results.every((r) => r.status === "committed")).toBe(true)

        const [{ count }] = yield* sql<{ count: string }>`SELECT count(*)::text AS count FROM exam_grades`
        expect(Number(count)).toBe(1)

        const [{ count: auditCount }] = yield* sql<{ count: string }>`
          SELECT count(*)::text AS count FROM audit_log WHERE entity_type = 'exam_grade' AND action = 'import_exam_grade'
        `
        expect(Number(auditCount)).toBe(1)
      })
    ))
})

describe("recomputePeriodResult folds ExamGrade into a certifying level's weighted average (ticket #111)", () => {
  it.effect("blends continuous (excluding unified-test marks), the internal unified exam, and the external exam", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        // Continuous (30%): 12. Local unified exam, slot 1 internal (30%): 15.
        // External regional exam, slot 2 (40%): 18.
        yield* insertMark(sql, seed, seed.continuousAssessmentTypeId, seed.enrollmentId, 12)
        yield* insertMark(sql, seed, seed.unifiedAssessmentTypeId, seed.enrollmentId, 15)
        yield* recordExamGrade(
          seed.schoolId,
          seed.enrollmentId,
          seed.subjectId,
          seed.evaluationPeriodId,
          2,
          "June 2026 regional exam",
          18,
          undefined,
          seed.directorPersonId,
          false
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)))

        yield* recomputePeriodResult(seed.schoolId, seed.evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )

        const [periodResult] = yield* sql<{ overall_average: string }>`
          SELECT overall_average::text AS overall_average FROM period_results
          WHERE evaluation_period_id = ${seed.evaluationPeriodId} AND enrollment_id = ${seed.enrollmentId}
        `
        // 12*0.30 + 15*0.30 + 18*0.40 = 3.6 + 4.5 + 7.2 = 15.3
        expect(Number(periodResult.overall_average)).toBe(15.3)
      })
    ))

  it.effect("treats a not-yet-sat external exam as contributing 0, not as excluded", () =>
    withExamGradeFixture((seed) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* insertMark(sql, seed, seed.continuousAssessmentTypeId, seed.enrollmentId, 12)
        yield* insertMark(sql, seed, seed.unifiedAssessmentTypeId, seed.enrollmentId, 15)
        // No ExamGrade for slot 2 at all yet.

        yield* recomputePeriodResult(seed.schoolId, seed.evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )

        const [periodResult] = yield* sql<{ overall_average: string }>`
          SELECT overall_average::text AS overall_average FROM period_results
          WHERE evaluation_period_id = ${seed.evaluationPeriodId} AND enrollment_id = ${seed.enrollmentId}
        `
        // 12*0.30 + 15*0.30 + 0*0.40 = 8.1
        expect(Number(periodResult.overall_average)).toBe(8.1)
      })
    ))
})
