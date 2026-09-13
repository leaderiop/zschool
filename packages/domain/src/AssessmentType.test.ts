import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { AccessDenied } from "@qadi/core/Errors"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  createAssessment,
  createAssessmentType,
  findAssessmentCompliance,
  findAssessmentTypes
} from "./AssessmentType.ts"
import { setMassarSemesterMapping } from "./Calendar.ts"
import { assignTeacherToCourse } from "./TeacherAssignment.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

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

const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/**
 * Same hand-rolled shape as `GradeEntry.test.ts`'s own fixture, minus the
 * Assessment/Mark rows themselves (this ticket's own tests create those) —
 * a school, one class at a caller-chosen level, one course, one active
 * teacher assignment, and one `S1` `EvaluationPeriod`.
 */
const withCourseFixture = Effect.fn(function*<A, E, R>(
  levelCode: string,
  use: (seed: {
    schoolId: string
    academicYearId: string
    sectionId: string
    classId: string
    subjectId: string
    courseId: string
    teacherPersonId: string
    evaluationPeriodId: string
  }) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #109 assessment type test school') RETURNING id
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
        VALUES (${school.id}, ${year.id}, ${cycle.id}, ${levelCode}, ${levelCode}, 1) RETURNING id
      `
      const [cls] = yield* sql<{ id: string }>`
        INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
        VALUES (${school.id}, ${year.id}, ${level.id}, ${levelCode + "-1"}, 30) RETURNING id
      `
      const [subject] = yield* sql<{ id: string }>`
        INSERT INTO subjects (school_id, academic_year_id, section_id, code, name)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'MATH', 'Mathématiques') RETURNING id
      `
      const [subjectLevelConfig] = yield* sql<{ id: string }>`
        INSERT INTO subject_level_configs (school_id, academic_year_id, subject_id, level_id, coefficient, teaching_language)
        VALUES (${school.id}, ${year.id}, ${subject.id}, ${level.id}, 1, 'fr') RETURNING id
      `
      const [course] = yield* sql<{ id: string }>`
        INSERT INTO courses (school_id, academic_year_id, class_id, subject_level_config_id)
        VALUES (${school.id}, ${year.id}, ${cls.id}, ${subjectLevelConfig.id}) RETURNING id
      `
      const [period] = yield* sql<{ id: string }>`
        INSERT INTO evaluation_periods (school_id, academic_year_id, section_id, code, name, sequence)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'S1', 'Semester 1', 1) RETURNING id
      `

      const teacherPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${teacherPersonId}, 'Samira', 'Teacher', '1985-01-01')
      `
      yield* assignTeacherToCourse(school.id, course.id, teacherPersonId).pipe(
        Effect.provide(asDirectorOf(school.id))
      )

      return yield* use({
        schoolId: school.id,
        academicYearId: year.id,
        sectionId: section.id,
        classId: cls.id,
        subjectId: subject.id,
        courseId: course.id,
        teacherPersonId,
        evaluationPeriodId: period.id
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("AssessmentType catalog (ticket #109)", () => {
  it.effect("a director can create an assessment type, visible via findAssessmentTypes", () =>
    withCourseFixture("1AC", ({ schoolId }) =>
      Effect.gen(function*() {
        yield* createAssessmentType(schoolId, "Devoir surveillé", true, false).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const types = yield* findAssessmentTypes(schoolId)
        expect(types).toHaveLength(1)
        expect(types[0].label).toBe("Devoir surveillé")
        expect(types[0].counts_as_class_test).toBe(true)
        expect(types[0].counts_as_unified_test).toBe(false)
      })
    ))
})

describe("createAssessment (ticket #109)", () => {
  it.effect("a teacher assigned to the course creates a live Assessment", () =>
    withCourseFixture("1AC", ({ classId, courseId, evaluationPeriodId, schoolId, subjectId, teacherPersonId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const assessmentType = yield* createAssessmentType(schoolId, "Devoir surveillé", true, false).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const assessmentId = yield* createAssessment(schoolId, courseId, evaluationPeriodId, assessmentType.id, 2).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )

        const [assessment] = yield* sql<
          { type: string; assessment_type_id: string; coefficient: string; class_id: string; subject_id: string }
        >`
          SELECT type, assessment_type_id, coefficient, class_id, subject_id FROM assessments WHERE id = ${assessmentId}
        `
        expect(assessment.type).toBe("live")
        expect(assessment.assessment_type_id).toBe(assessmentType.id)
        expect(Number(assessment.coefficient)).toBe(2)
        expect(assessment.class_id).toBe(classId)
        expect(assessment.subject_id).toBe(subjectId)
      })
    ))

  it.effect("a teacher with no active assignment for the course is denied", () =>
    withCourseFixture("1AC", ({ courseId, evaluationPeriodId, schoolId }) =>
      Effect.gen(function*() {
        const assessmentType = yield* createAssessmentType(schoolId, "Devoir surveillé", true, false).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const unassignedTeacherPersonId = yield* randomUUID
        const error = yield* createAssessment(schoolId, courseId, evaluationPeriodId, assessmentType.id, 1).pipe(
          Effect.provide(asTeacher(schoolId, unassignedTeacherPersonId)),
          Effect.flip
        )
        expect(error).toBeInstanceOf(AccessDenied)
      })
    ))

  it.effect("a nonexistent course fails with EntityNotFoundError", () =>
    withCourseFixture("1AC", ({ evaluationPeriodId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const assessmentType = yield* createAssessmentType(schoolId, "Devoir surveillé", true, false).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const error = yield* createAssessment(
          schoolId,
          "00000000-0000-0000-0000-000000000000",
          evaluationPeriodId,
          assessmentType.id,
          1
        ).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)), Effect.flip)
        expect(error._tag).toBe("EntityNotFoundError")
      })
    ))

  it.effect("an evaluationPeriodId belonging to a different school is rejected", () =>
    Effect.gen(function*() {
      // Prepared as a fully independent effect (own layer, no `withSchool`
      // nesting) — RLS actively rejects inserting a second tenant's rows
      // from inside an already-`withSchool`-scoped connection.
      const otherPeriodId = yield* Effect.gen(function*() {
        const sql = yield* SqlClient
        const [otherSchool] = yield* sql<{ id: string }>`
          INSERT INTO schools (name) VALUES ('Ticket #109 other-tenant school') RETURNING id
        `
        return yield* withSchool(
          otherSchool.id,
          Effect.gen(function*() {
            const [otherYear] = yield* sql<{ id: string }>`
              INSERT INTO academic_years (school_id, label) VALUES (${otherSchool.id}, '2026-2027') RETURNING id
            `
            const [otherSection] = yield* sql<{ id: string }>`
              INSERT INTO sections (school_id, academic_year_id, template, name)
              VALUES (${otherSchool.id}, ${otherYear.id}, 'national', 'National') RETURNING id
            `
            const [otherPeriod] = yield* sql<{ id: string }>`
              INSERT INTO evaluation_periods (school_id, academic_year_id, section_id, code, name, sequence)
              VALUES (${otherSchool.id}, ${otherYear.id}, ${otherSection.id}, 'S1', 'Semester 1', 1) RETURNING id
            `
            return otherPeriod.id
          })
        )
      }).pipe(Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

      return yield* withCourseFixture("1AC", ({ courseId, schoolId, teacherPersonId }) =>
        Effect.gen(function*() {
          const assessmentType = yield* createAssessmentType(schoolId, "Devoir surveillé", true, false).pipe(
            Effect.provide(asDirectorOf(schoolId))
          )
          const error = yield* createAssessment(schoolId, courseId, otherPeriodId, assessmentType.id, 1).pipe(
            Effect.provide(asTeacher(schoolId, teacherPersonId)),
            Effect.flip
          )
          expect(error._tag).toBe("EntityNotFoundError")
        })
      )
    }))

  it.effect("an assessmentTypeId belonging to a different school is rejected", () =>
    Effect.gen(function*() {
      const otherSchoolTypeId = yield* Effect.gen(function*() {
        const sql = yield* SqlClient
        const [otherSchool] = yield* sql<{ id: string }>`
          INSERT INTO schools (name) VALUES ('Ticket #109 other-tenant school') RETURNING id
        `
        const otherType = yield* createAssessmentType(otherSchool.id, "Devoir surveillé", true, false).pipe(
          Effect.provide(asDirectorOf(otherSchool.id))
        )
        return otherType.id
      }).pipe(Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

      return yield* withCourseFixture("1AC", ({ courseId, evaluationPeriodId, schoolId, teacherPersonId }) =>
        Effect.gen(function*() {
          const error = yield* createAssessment(
            schoolId,
            courseId,
            evaluationPeriodId,
            otherSchoolTypeId,
            1
          ).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)), Effect.flip)
          expect(error._tag).toBe("EntityNotFoundError")
        })
      )
    }))

  it.effect("a deactivated course is rejected", () =>
    withCourseFixture("1AC", ({ courseId, evaluationPeriodId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`UPDATE courses SET is_active = false, deactivation_reason = 'no longer taught' WHERE id = ${courseId}`

        const assessmentType = yield* createAssessmentType(schoolId, "Devoir surveillé", true, false).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const error = yield* createAssessment(schoolId, courseId, evaluationPeriodId, assessmentType.id, 1).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId)),
          Effect.flip
        )
        expect(error._tag).toBe("EntityNotFoundError")
      })
    ))
})

describe("findAssessmentCompliance (ticket #109)", () => {
  it.effect("a subject/class with zero Assessments is non_compliant", () =>
    withCourseFixture("1AC", ({ classId, evaluationPeriodId, schoolId, subjectId }) =>
      Effect.gen(function*() {
        const results = yield* findAssessmentCompliance(schoolId, evaluationPeriodId)
        expect(results).toEqual([
          { subjectId, classId, classTestCount: 0, unifiedTestCount: 0, status: "non_compliant" }
        ])
      })
    ))

  it.effect("one class test but no unified test is a gap", () =>
    withCourseFixture("1AC", ({ classId, courseId, evaluationPeriodId, schoolId, subjectId, teacherPersonId }) =>
      Effect.gen(function*() {
        const classTestType = yield* createAssessmentType(schoolId, "Devoir surveillé", true, false).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        yield* createAssessment(schoolId, courseId, evaluationPeriodId, classTestType.id, 1).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )

        const results = yield* findAssessmentCompliance(schoolId, evaluationPeriodId)
        expect(results).toEqual([
          { subjectId, classId, classTestCount: 1, unifiedTestCount: 0, status: "gap" }
        ])
      })
    ))

  it.effect("two class tests and one unified test is compliant", () =>
    withCourseFixture("1AC", ({ classId, courseId, evaluationPeriodId, schoolId, subjectId, teacherPersonId }) =>
      Effect.gen(function*() {
        const classTestType = yield* createAssessmentType(schoolId, "Devoir surveillé", true, false).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const unifiedTestType = yield* createAssessmentType(schoolId, "Composition", false, true).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        yield* createAssessment(schoolId, courseId, evaluationPeriodId, classTestType.id, 1).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        yield* createAssessment(schoolId, courseId, evaluationPeriodId, classTestType.id, 1).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        yield* createAssessment(schoolId, courseId, evaluationPeriodId, unifiedTestType.id, 1).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )

        const results = yield* findAssessmentCompliance(schoolId, evaluationPeriodId)
        expect(results).toEqual([
          { subjectId, classId, classTestCount: 2, unifiedTestCount: 1, status: "compliant" }
        ])
      })
    ))

  it.effect("a certifying level's final period of the year is waived regardless of counts", () =>
    withCourseFixture("6AP", ({ classId, evaluationPeriodId, schoolId, subjectId }) =>
      Effect.gen(function*() {
        const results = yield* findAssessmentCompliance(schoolId, evaluationPeriodId)
        expect(results).toEqual([
          { subjectId, classId, classTestCount: 0, unifiedTestCount: 0, status: "compliant" }
        ])
      })
    ))
})

describe("setMassarSemesterMapping (ticket #109)", () => {
  it.effect("sets a period's Massar semester and optional split threshold", () =>
    withCourseFixture("1AC", ({ evaluationPeriodId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* setMassarSemesterMapping(schoolId, evaluationPeriodId, "S1", "2027-01-15").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const [period] = yield* sql<{ massar_semester: string; massar_semester_2_starts_at: string }>`
          SELECT massar_semester, massar_semester_2_starts_at FROM evaluation_periods WHERE id = ${evaluationPeriodId}
        `
        expect(period.massar_semester).toBe("S1")
        expect(period.massar_semester_2_starts_at).toBe("2027-01-15")
      })
    ))
})
