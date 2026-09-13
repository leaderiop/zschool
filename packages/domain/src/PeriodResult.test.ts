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
import { ConductGradeAlreadyExistsError, InvalidConductGradeValueError, proposeConductGrade, validateConductGrade } from "./ConductGrade.ts"
import { defaultHonorsThresholds } from "./GradingScales.ts"
import { recomputePeriodResult, recomputeYearResult, RankExclusionNotEnabledError, setRankExclusion } from "./PeriodResult.ts"
import { assignTeacherToCourse } from "./TeacherAssignment.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asDirectorOf = (schoolId: string, directorPersonId = "director-1") =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({ id: directorPersonId, roles: ["director"], attributes: { school_id: schoolId } })
    )
  )

const asStudentLifeOf = (schoolId: string, studentLifePersonId = "student-life-1") =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({
        id: studentLifePersonId,
        roles: ["student_life"],
        attributes: { school_id: schoolId, cycle_ids: [] }
      })
    )
  )

const asTeacher = (schoolId: string, teacherPersonId: string) =>
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
 * A class taught in two subjects (weighted 2 and 1), one evaluation period,
 * a `ComputationRule` with lowest-grade exclusion enabled beyond 2 grades
 * (so a test's own 3rd mark exercises it), and two active student
 * enrollments — enough for `recomputePeriodResult`'s full weighting/NG/rank
 * pipeline without going through the live grade-entry API (this ticket's
 * own tests insert `assessments`/`marks` directly for full control over the
 * values each scenario needs).
 */
const withResultsFixture = Effect.fn(function*<A, E, R>(
  use: (seed: {
    schoolId: string
    academicYearId: string
    classId: string
    subjectAId: string
    subjectBId: string
    evaluationPeriodId: string
    assessmentTypeId: string
    enrollment1Id: string
    enrollment2Id: string
    directorPersonId: string
    studentLifePersonId: string
  }) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #110 period result test school') RETURNING id
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
        VALUES (${school.id}, ${year.id}, ${section.id}, 'PRIM', 'Primary', 1) RETURNING id
      `
      const [level] = yield* sql<{ id: string }>`
        INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
        VALUES (${school.id}, ${year.id}, ${cycle.id}, '1AC', '1AC', 1) RETURNING id
      `
      const [cls] = yield* sql<{ id: string }>`
        INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
        VALUES (${school.id}, ${year.id}, ${level.id}, '1AC-1', 30) RETURNING id
      `
      const [subjectA] = yield* sql<{ id: string }>`
        INSERT INTO subjects (school_id, academic_year_id, section_id, code, name)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'MATH', 'Mathématiques') RETURNING id
      `
      const [subjectB] = yield* sql<{ id: string }>`
        INSERT INTO subjects (school_id, academic_year_id, section_id, code, name)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'FR', 'Français') RETURNING id
      `
      const [slcA] = yield* sql<{ id: string }>`
        INSERT INTO subject_level_configs (school_id, academic_year_id, subject_id, level_id, coefficient, teaching_language)
        VALUES (${school.id}, ${year.id}, ${subjectA.id}, ${level.id}, 2, 'fr') RETURNING id
      `
      const [slcB] = yield* sql<{ id: string }>`
        INSERT INTO subject_level_configs (school_id, academic_year_id, subject_id, level_id, coefficient, teaching_language)
        VALUES (${school.id}, ${year.id}, ${subjectB.id}, ${level.id}, 1, 'fr') RETURNING id
      `
      const [courseA] = yield* sql<{ id: string }>`
        INSERT INTO courses (school_id, academic_year_id, class_id, subject_level_config_id)
        VALUES (${school.id}, ${year.id}, ${cls.id}, ${slcA.id}) RETURNING id
      `
      yield* sql`
        INSERT INTO courses (school_id, academic_year_id, class_id, subject_level_config_id)
        VALUES (${school.id}, ${year.id}, ${cls.id}, ${slcB.id})
      `
      const [period] = yield* sql<{ id: string }>`
        INSERT INTO evaluation_periods (school_id, academic_year_id, section_id, code, name, sequence)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'S1', 'Semester 1', 1) RETURNING id
      `
      yield* sql`
        INSERT INTO computation_rules (
          school_id, academic_year_id, level_id, weight_continuous, weight_exam_1, weight_exam_2,
          reference_text, lowest_grade_exclusion_min_count, honors_thresholds, unjustified_absence_counts_as_zero
        )
        VALUES (
          ${school.id}, ${year.id}, ${level.id}, 100, 0, 0, 'test rule', 2,
          ${JSON.stringify(defaultHonorsThresholds)}::jsonb, true
        )
      `
      const [assessmentType] = yield* sql<{ id: string }>`
        INSERT INTO assessment_types (school_id, label) VALUES (${school.id}, 'Devoir') RETURNING id
      `

      const teacherPersonId = yield* randomUUID
      yield* sql`INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${teacherPersonId}, 'Samira', 'Teacher', '1985-01-01')`

      const directorPersonId = yield* randomUUID
      const studentLifePersonId = yield* randomUUID
      yield* sql`INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${directorPersonId}, 'Nadia', 'Director', '1975-01-01')`
      yield* sql`INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${studentLifePersonId}, 'Hicham', 'StudentLife', '1980-01-01')`

      yield* assignTeacherToCourse(school.id, courseA.id, teacherPersonId).pipe(
        Effect.provide(asDirectorOf(school.id, directorPersonId))
      )

      const student1Id = yield* randomUUID
      const student2Id = yield* randomUUID
      yield* sql`INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${student1Id}, 'Amine', 'Student', '2012-01-01')`
      yield* sql`INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${student2Id}, 'Yasmine', 'Student', '2012-01-01')`
      const [enrollment1] = yield* sql<{ id: string }>`
        INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
        VALUES (${school.id}, ${year.id}, '2026-2027', ${student1Id}, ${cls.id}, 'active', '2026-09-01') RETURNING id
      `
      const [enrollment2] = yield* sql<{ id: string }>`
        INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
        VALUES (${school.id}, ${year.id}, '2026-2027', ${student2Id}, ${cls.id}, 'active', '2026-09-01') RETURNING id
      `

      return yield* use({
        schoolId: school.id,
        academicYearId: year.id,
        classId: cls.id,
        subjectAId: subjectA.id,
        subjectBId: subjectB.id,
        evaluationPeriodId: period.id,
        assessmentTypeId: assessmentType.id,
        enrollment1Id: enrollment1.id,
        enrollment2Id: enrollment2.id,
        directorPersonId,
        studentLifePersonId
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

/** Inserts a `'live'` `Assessment` plus one published `Mark` for one enrollment, bypassing `GradeEntry.ts`'s own API — full control over `coefficient`/`value`/`marker` is what these tests need, and the live grade-entry path is already covered by ticket #120's own test suite. */
const insertMark = (
  sql: SqlClient,
  seed: { schoolId: string; academicYearId: string; evaluationPeriodId: string; classId: string; assessmentTypeId: string },
  subjectId: string,
  coefficient: number,
  enrollmentId: string,
  entry: { value: number } | { marker: "absent_unjustified" | "absent_justified" | "exempted" }
) =>
  Effect.gen(function*() {
    const [assessment] = yield* sql<{ id: string }>`
      INSERT INTO assessments
        (school_id, academic_year_id, evaluation_period_id, subject_id, class_id, type, assessment_type_id, coefficient, is_import_synthesized)
      VALUES (
        ${seed.schoolId}, ${seed.academicYearId}, ${seed.evaluationPeriodId}, ${subjectId}, ${seed.classId},
        'live', ${seed.assessmentTypeId}, ${coefficient}, false
      )
      RETURNING id
    `
    yield* sql`
      INSERT INTO marks (school_id, assessment_id, enrollment_id, value, marker, status, entered_at)
      VALUES (
        ${seed.schoolId}, ${assessment.id}, ${enrollmentId},
        ${"value" in entry ? entry.value : null}, ${"marker" in entry ? entry.marker : null}, 'published', now()
      )
    `
  })

describe("recomputePeriodResult (ticket #110)", () => {
  it.effect("computes weighted subject and overall averages", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, subjectAId, subjectBId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 10 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 14 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectBId, 1, enrollment1Id, { value: 16 })

        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId))
        )

        const [periodResult] = yield* sql<{ overall_average: string }>`
          SELECT overall_average::text AS overall_average FROM period_results
          WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${enrollment1Id}
        `
        expect(Number(periodResult.overall_average)).toBeCloseTo(13.33, 2)

        const subjectResults = yield* sql<{ subject_id: string; average: string | null }>`
          SELECT subject_id, average::text AS average FROM subject_results sr
          JOIN period_results pr ON pr.id = sr.period_result_id
          WHERE pr.evaluation_period_id = ${evaluationPeriodId} AND pr.enrollment_id = ${enrollment1Id}
        `
        const bySubject = new Map(subjectResults.map((r) => [r.subject_id, r.average]))
        expect(Number(bySubject.get(subjectAId))).toBe(12)
        expect(Number(bySubject.get(subjectBId))).toBe(16)
      })
    ))

  it.effect("lowest-grade exclusion drops the single lowest mark once the threshold is exceeded", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 5 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 10 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 15 })

        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId))
        )

        const [periodResult] = yield* sql<{ overall_average: string }>`
          SELECT overall_average::text AS overall_average FROM period_results
          WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${enrollment1Id}
        `
        // subjectB has no marks (NG, excluded) — overall average is subjectA's own average alone.
        expect(Number(periodResult.overall_average)).toBeCloseTo(12.5, 2)
      })
    ))

  it.effect("an unjustified absence counts as 0 by default", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 10 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { marker: "absent_unjustified" })

        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId))
        )

        const [subjectResult] = yield* sql<{ average: string }>`
          SELECT sr.average::text AS average FROM subject_results sr
          JOIN period_results pr ON pr.id = sr.period_result_id
          WHERE pr.evaluation_period_id = ${evaluationPeriodId} AND pr.enrollment_id = ${enrollment1Id} AND sr.subject_id = ${subjectAId}
        `
        expect(Number(subjectResult.average)).toBe(5)
      })
    ))

  it.effect("a justified absence is excluded from the denominator entirely", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 10 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { marker: "absent_justified" })

        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId))
        )

        const [subjectResult] = yield* sql<{ average: string }>`
          SELECT sr.average::text AS average FROM subject_results sr
          JOIN period_results pr ON pr.id = sr.period_result_id
          WHERE pr.evaluation_period_id = ${evaluationPeriodId} AND pr.enrollment_id = ${enrollment1Id} AND sr.subject_id = ${subjectAId}
        `
        expect(Number(subjectResult.average)).toBe(10)
      })
    ))

  it.effect("a subject with no marks at all is NG (null average)", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, subjectAId, subjectBId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 12 })

        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId))
        )

        const [subjectBResult] = yield* sql<{ average: string | null }>`
          SELECT sr.average::text AS average FROM subject_results sr
          JOIN period_results pr ON pr.id = sr.period_result_id
          WHERE pr.evaluation_period_id = ${evaluationPeriodId} AND pr.enrollment_id = ${enrollment1Id} AND sr.subject_id = ${subjectBId}
        `
        expect(subjectBResult.average).toBeNull()

        const [periodResult] = yield* sql<{ overall_average: string }>`
          SELECT overall_average::text AS overall_average FROM period_results
          WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${enrollment1Id}
        `
        expect(Number(periodResult.overall_average)).toBe(12)
      })
    ))

  it.effect("assigns standard competition ranks (ties share a rank, the next skips ahead) and honors labels", () =>
    withResultsFixture(({ enrollment1Id, enrollment2Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const student3Id = yield* randomUUID
        yield* sql`INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${student3Id}, 'Karim', 'Student', '2012-01-01')`
        const [enrollment3] = yield* sql<{ id: string }>`
          INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
          VALUES (${seed.schoolId}, ${seed.academicYearId}, '2026-2027', ${student3Id}, ${seed.classId}, 'active', '2026-09-01')
          RETURNING id
        `

        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 17 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment2Id, { value: 17 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment3.id, { value: 11 })

        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )

        const rows = yield* sql<{ enrollment_id: string; rank: number; honors_label: string }>`
          SELECT enrollment_id, rank, honors_label FROM period_results WHERE evaluation_period_id = ${evaluationPeriodId}
        `
        const byEnrollment = new Map(rows.map((r) => [r.enrollment_id, r]))
        expect(byEnrollment.get(enrollment1Id)?.rank).toBe(1)
        expect(byEnrollment.get(enrollment2Id)?.rank).toBe(1)
        expect(byEnrollment.get(enrollment3.id)?.rank).toBe(3)
        expect(byEnrollment.get(enrollment1Id)?.honors_label).toBe("highest_distinction")
        expect(byEnrollment.get(enrollment3.id)?.honors_label).toBe("pass")
      })
    ))

  it.effect("scales a certifying level's average by ComputationRule.weight_continuous", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        // A 6AP-shaped rule: 50% continuous, 50% external exam (not yet
        // modeled — #111) — the live PeriodResult should read as half the
        // raw continuous average until #111 supplies real exam grades.
        yield* sql`
          UPDATE computation_rules SET weight_continuous = 50, weight_exam_1 = 25, weight_exam_2 = 25
          WHERE school_id = ${seed.schoolId}
        `
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 16 })

        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )

        const [periodResult] = yield* sql<{ overall_average: string }>`
          SELECT overall_average::text AS overall_average FROM period_results
          WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${enrollment1Id}
        `
        // Raw continuous average is 16 (only subjectA has marks, subjectB is NG and excluded);
        // scaled by weight_continuous=50% => 8.
        expect(Number(periodResult.overall_average)).toBe(8)
      })
    ))
})

describe("setRankExclusion (ticket #110, resolves Attendance's #90)", () => {
  it.effect("is refused when the school has not enabled rank exclusion", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 12 })
        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )

        const error = yield* setRankExclusion(
          seed.schoolId,
          evaluationPeriodId,
          enrollment1Id,
          true,
          "prolonged absence",
          seed.directorPersonId
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)), Effect.flip)
        expect(error).toBeInstanceOf(RankExclusionNotEnabledError)
      })
    ))

  it.effect("excludes a student from rank and re-ranks the rest of the class", () =>
    withResultsFixture(({ enrollment1Id, enrollment2Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`UPDATE schools SET rank_exclusion_enabled = true WHERE id = ${seed.schoolId}`
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 18 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment2Id, { value: 10 })
        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )

        yield* setRankExclusion(
          seed.schoolId,
          evaluationPeriodId,
          enrollment1Id,
          true,
          "temporary expulsion",
          seed.directorPersonId
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)))

        const rows = yield* sql<{ enrollment_id: string; rank: number | null; excluded_from_rank: boolean }>`
          SELECT enrollment_id, rank, excluded_from_rank FROM period_results WHERE evaluation_period_id = ${evaluationPeriodId}
        `
        const byEnrollment = new Map(rows.map((r) => [r.enrollment_id, r]))
        expect(byEnrollment.get(enrollment1Id)?.excluded_from_rank).toBe(true)
        expect(byEnrollment.get(enrollment1Id)?.rank).toBeNull()
        expect(byEnrollment.get(enrollment2Id)?.rank).toBe(1)
      })
    ))

  it.effect("re-including a student (excluded: false) restores their rank and clears the reason", () =>
    withResultsFixture(({ enrollment1Id, enrollment2Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`UPDATE schools SET rank_exclusion_enabled = true WHERE id = ${seed.schoolId}`
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 18 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment2Id, { value: 10 })
        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )
        yield* setRankExclusion(
          seed.schoolId,
          evaluationPeriodId,
          enrollment1Id,
          true,
          "temporary expulsion",
          seed.directorPersonId
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)))

        yield* setRankExclusion(
          seed.schoolId,
          evaluationPeriodId,
          enrollment1Id,
          false,
          "",
          seed.directorPersonId
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)))

        const [row] = yield* sql<{ rank: number | null; excluded_from_rank: boolean; excluded_from_rank_reason: string | null }>`
          SELECT rank, excluded_from_rank, excluded_from_rank_reason FROM period_results
          WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${enrollment1Id}
        `
        expect(row.excluded_from_rank).toBe(false)
        expect(row.excluded_from_rank_reason).toBeNull()
        expect(row.rank).toBe(1)
      })
    ))
})

describe("recomputeYearResult (ticket #110)", () => {
  it.effect("averages periods weighted by EvaluationPeriod.weight, equal-weighted by default", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 10 })
        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId))
        )

        const [period2] = yield* sql<{ id: string }>`
          INSERT INTO evaluation_periods (school_id, academic_year_id, section_id, code, name, sequence)
          SELECT school_id, academic_year_id, section_id, 'S2', 'Semester 2', 2 FROM evaluation_periods WHERE id = ${evaluationPeriodId}
          RETURNING id
        `
        yield* insertMark(
          sql,
          { evaluationPeriodId: period2.id, ...seed },
          subjectAId,
          1,
          enrollment1Id,
          { value: 20 }
        )
        yield* recomputePeriodResult(seed.schoolId, period2.id, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId))
        )

        yield* recomputeYearResult(seed.schoolId, seed.academicYearId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId))
        )

        const [yearResult] = yield* sql<{ year_average: string }>`
          SELECT year_average::text AS year_average FROM year_results
          WHERE academic_year_id = ${seed.academicYearId} AND enrollment_id = ${enrollment1Id}
        `
        expect(Number(yearResult.year_average)).toBe(15)
      })
    ))

  it.effect("carries a period's rank exclusion forward into the year (excluded_from_rank, no rank)", () =>
    withResultsFixture(({ enrollment1Id, enrollment2Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`UPDATE schools SET rank_exclusion_enabled = true WHERE id = ${seed.schoolId}`
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 18 })
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment2Id, { value: 10 })
        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )
        yield* setRankExclusion(
          seed.schoolId,
          evaluationPeriodId,
          enrollment1Id,
          true,
          "temporary expulsion",
          seed.directorPersonId
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)))

        yield* recomputeYearResult(seed.schoolId, seed.academicYearId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )

        const rows = yield* sql<{ enrollment_id: string; rank: number | null; excluded_from_rank: boolean }>`
          SELECT enrollment_id, rank, excluded_from_rank FROM year_results WHERE academic_year_id = ${seed.academicYearId}
        `
        const byEnrollment = new Map(rows.map((r) => [r.enrollment_id, r]))
        expect(byEnrollment.get(enrollment1Id)?.excluded_from_rank).toBe(true)
        expect(byEnrollment.get(enrollment1Id)?.rank).toBeNull()
        expect(byEnrollment.get(enrollment2Id)?.rank).toBe(1)
      })
    ))
})

describe("ConductGrade (ticket #110, resolves Attendance's #90)", () => {
  it.effect("a teacher assigned to a course in the class proposes a conduct grade", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const [assignment] = yield* sql<{ teacher_person_id: string }>`
          SELECT ta.teacher_person_id FROM teacher_assignments ta
          JOIN courses c ON c.id = ta.course_id
          WHERE c.class_id = ${seed.classId} AND ta.unassigned_at IS NULL
        `
        const conductGradeId = yield* proposeConductGrade(
          seed.schoolId,
          enrollment1Id,
          evaluationPeriodId,
          16,
          assignment.teacher_person_id
        ).pipe(Effect.provide(asTeacher(seed.schoolId, assignment.teacher_person_id)))

        const [row] = yield* sql<{ status: string; value: string }>`
          SELECT status, value::text AS value FROM conduct_grades WHERE id = ${conductGradeId}
        `
        expect(row.status).toBe("proposed")
        expect(Number(row.value)).toBe(16)
      })
    ))

  it.effect("a teacher with no assignment in the class is denied", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, schoolId }) =>
      Effect.gen(function*() {
        const unassignedTeacherPersonId = yield* randomUUID
        const error = yield* proposeConductGrade(
          schoolId,
          enrollment1Id,
          evaluationPeriodId,
          16,
          unassignedTeacherPersonId
        ).pipe(Effect.provide(asTeacher(schoolId, unassignedTeacherPersonId)), Effect.flip)
        expect(error._tag).toBe("AccessDenied")
      })
    ))

  it.effect("student-life validates a proposed conduct grade, optionally adjusting the value", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const [assignment] = yield* sql<{ teacher_person_id: string }>`
          SELECT ta.teacher_person_id FROM teacher_assignments ta
          JOIN courses c ON c.id = ta.course_id
          WHERE c.class_id = ${seed.classId} AND ta.unassigned_at IS NULL
        `
        const conductGradeId = yield* proposeConductGrade(
          seed.schoolId,
          enrollment1Id,
          evaluationPeriodId,
          16,
          assignment.teacher_person_id
        ).pipe(Effect.provide(asTeacher(seed.schoolId, assignment.teacher_person_id)))

        yield* validateConductGrade(seed.schoolId, conductGradeId, 15, seed.studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(seed.schoolId, seed.studentLifePersonId))
        )

        const [row] = yield* sql<{ status: string; value: string; validated_by_person_id: string }>`
          SELECT status, value::text AS value, validated_by_person_id FROM conduct_grades WHERE id = ${conductGradeId}
        `
        expect(row.status).toBe("validated")
        expect(Number(row.value)).toBe(15)
        expect(row.validated_by_person_id).toBe(seed.studentLifePersonId)
      })
    ))

  it.effect("a validated conduct grade counts toward the overall average when the school opts in", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, subjectAId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`UPDATE schools SET conduct_grade_counts_toward_average = true WHERE id = ${seed.schoolId}`
        yield* insertMark(sql, { evaluationPeriodId, ...seed }, subjectAId, 1, enrollment1Id, { value: 10 })

        const [assignment] = yield* sql<{ teacher_person_id: string }>`
          SELECT ta.teacher_person_id FROM teacher_assignments ta
          JOIN courses c ON c.id = ta.course_id
          WHERE c.class_id = ${seed.classId} AND ta.unassigned_at IS NULL
        `
        const conductGradeId = yield* proposeConductGrade(
          seed.schoolId,
          enrollment1Id,
          evaluationPeriodId,
          20,
          assignment.teacher_person_id
        ).pipe(Effect.provide(asTeacher(seed.schoolId, assignment.teacher_person_id)))
        yield* validateConductGrade(seed.schoolId, conductGradeId, undefined, seed.directorPersonId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )

        yield* recomputePeriodResult(seed.schoolId, evaluationPeriodId, seed.classId).pipe(
          Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId))
        )

        const [periodResult] = yield* sql<{ overall_average: string }>`
          SELECT overall_average::text AS overall_average FROM period_results
          WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${enrollment1Id}
        `
        // subjectA average 10 (coeff 2) + conduct grade 20 (weight 1) => (20 + 20) / 3.
        expect(Number(periodResult.overall_average)).toBeCloseTo(13.33, 2)
      })
    ))

  it.effect("a second proposal for the same enrollment and period is rejected", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const [assignment] = yield* sql<{ teacher_person_id: string }>`
          SELECT ta.teacher_person_id FROM teacher_assignments ta
          JOIN courses c ON c.id = ta.course_id
          WHERE c.class_id = ${seed.classId} AND ta.unassigned_at IS NULL
        `
        yield* proposeConductGrade(
          seed.schoolId,
          enrollment1Id,
          evaluationPeriodId,
          16,
          assignment.teacher_person_id
        ).pipe(Effect.provide(asTeacher(seed.schoolId, assignment.teacher_person_id)))

        const error = yield* proposeConductGrade(
          seed.schoolId,
          enrollment1Id,
          evaluationPeriodId,
          18,
          assignment.teacher_person_id
        ).pipe(Effect.provide(asTeacher(seed.schoolId, assignment.teacher_person_id)), Effect.flip)
        expect(error).toBeInstanceOf(ConductGradeAlreadyExistsError)
      })
    ))

  it.effect("an out-of-range value is rejected before ever reaching SQL", () =>
    withResultsFixture(({ enrollment1Id, evaluationPeriodId, ...seed }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const [assignment] = yield* sql<{ teacher_person_id: string }>`
          SELECT ta.teacher_person_id FROM teacher_assignments ta
          JOIN courses c ON c.id = ta.course_id
          WHERE c.class_id = ${seed.classId} AND ta.unassigned_at IS NULL
        `
        const error = yield* proposeConductGrade(
          seed.schoolId,
          enrollment1Id,
          evaluationPeriodId,
          25,
          assignment.teacher_person_id
        ).pipe(Effect.provide(asTeacher(seed.schoolId, assignment.teacher_person_id)), Effect.flip)
        expect(error).toBeInstanceOf(InvalidConductGradeValueError)
      })
    ))

  it.effect("validating a nonexistent or already-validated conduct grade fails with EntityNotFoundError", () =>
    withResultsFixture(({ ...seed }) =>
      Effect.gen(function*() {
        const error = yield* validateConductGrade(
          seed.schoolId,
          "00000000-0000-0000-0000-000000000000",
          undefined,
          seed.directorPersonId
        ).pipe(Effect.provide(asDirectorOf(seed.schoolId, seed.directorPersonId)), Effect.flip)
        expect(error._tag).toBe("EntityNotFoundError")
      })
    ))
})
