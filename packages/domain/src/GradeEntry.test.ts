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
import { assignTeacherToCourse } from "./TeacherAssignment.ts"
import { enterGrades, type GradeEntry } from "./GradeEntry.ts"

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
 * Same hand-rolled shape as `TeacherAssignment.test.ts`'s own
 * `withCourseAndTeacher`, extended with an `EvaluationPeriod`, an
 * `Assessment` (`type: 'imported'` is a stand-in only — the real type
 * vocabulary is #109's own decision; this ticket's functions treat an
 * `assessmentId` as a given, not something they create), and one enrolled
 * student to enter grades for.
 */
const withAssessmentFixture = Effect.fn(function*<A, E, R>(
  use: (seed: {
    schoolId: string
    classId: string
    academicYearId: string
    assessmentId: string
    courseId: string
    teacherPersonId: string
    enrollmentId: string
  }) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #120 grade entry test school') RETURNING id
  `
  return yield* withSchool(
    school.id,
    Effect.gen(function*() {
      const [year] = yield* sql<{ id: string }>`
        INSERT INTO academic_years (school_id, label) VALUES (${school.id}, '2020-2021') RETURNING id
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
        VALUES (${school.id}, ${year.id}, ${cycle.id}, '6AP', '6ème Année Primaire', 1) RETURNING id
      `
      const [cls] = yield* sql<{ id: string }>`
        INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
        VALUES (${school.id}, ${year.id}, ${level.id}, '6AP-1', 30) RETURNING id
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
      const [assessment] = yield* sql<{ id: string }>`
        INSERT INTO assessments (school_id, academic_year_id, evaluation_period_id, subject_id, class_id, type, is_import_synthesized)
        VALUES (${school.id}, ${year.id}, ${period.id}, ${subject.id}, ${cls.id}, 'imported', false) RETURNING id
      `

      const teacherPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${teacherPersonId}, 'Samira', 'Teacher', '1985-01-01')
      `
      yield* assignTeacherToCourse(school.id, course.id, teacherPersonId).pipe(
        Effect.provide(asDirectorOf(school.id))
      )

      const studentPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth, massar_code)
        VALUES (${studentPersonId}, 'Nadia', 'Student', '2013-01-01', ${`G${studentPersonId.replaceAll("-", "").slice(0, 12)}`})
      `
      const [enrollment] = yield* sql<{ id: string }>`
        INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
        VALUES (${school.id}, ${year.id}, '2020-2021', ${studentPersonId}, ${cls.id}, 'active', '2020-09-01')
        RETURNING id
      `

      return yield* use({
        schoolId: school.id,
        classId: cls.id,
        academicYearId: year.id,
        assessmentId: assessment.id,
        courseId: course.id,
        teacherPersonId,
        enrollmentId: enrollment.id
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("GradeEntry (ticket #120)", () => {
  it.effect("a numeric grade entry commits a draft Mark", () =>
    withAssessmentFixture(({ assessmentId, enrollmentId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const entries: ReadonlyArray<GradeEntry> = [
          { enrollmentId, value: 14, enteredAt: "2027-01-10T09:00:00.000Z" }
        ]
        const results = yield* enterGrades(schoolId, assessmentId, entries).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        expect(results).toEqual([{ enrollmentId, status: "committed" }])

        const [mark] = yield* sql<{ value: string | null; marker: string | null; status: string }>`
          SELECT value, marker, status FROM marks WHERE assessment_id = ${assessmentId} AND enrollment_id = ${enrollmentId}
        `
        expect(Number(mark.value)).toBe(14)
        expect(mark.marker).toBeNull()
        expect(mark.status).toBe("draft")
      })
    ))

  it.effect("a marker entry commits a Mark with no numeric value", () =>
    withAssessmentFixture(({ assessmentId, enrollmentId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const entries: ReadonlyArray<GradeEntry> = [
          { enrollmentId, marker: "absent_justified", enteredAt: "2027-01-10T09:00:00.000Z" }
        ]
        const results = yield* enterGrades(schoolId, assessmentId, entries).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        expect(results).toEqual([{ enrollmentId, status: "committed" }])

        const [mark] = yield* sql<{ value: string | null; marker: string | null }>`
          SELECT value, marker FROM marks WHERE assessment_id = ${assessmentId} AND enrollment_id = ${enrollmentId}
        `
        expect(mark.value).toBeNull()
        expect(mark.marker).toBe("absent_justified")
      })
    ))

  it.effect("a stale entry is rejected while a fresher entry for a different student in the same batch still commits", () =>
    withAssessmentFixture(({ academicYearId, assessmentId, classId, enrollmentId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const secondStudentPersonId = yield* randomUUID
        yield* sql`
          INSERT INTO persons (id, first_name, last_name, date_of_birth, massar_code)
          VALUES (${secondStudentPersonId}, 'Omar', 'Tazi', '2013-02-02', ${`G${
          secondStudentPersonId.replaceAll("-", "").slice(0, 12)
        }`})
        `
        const [secondEnrollment] = yield* sql<{ id: string }>`
          INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
          VALUES (${schoolId}, ${academicYearId}, '2020-2021', ${secondStudentPersonId}, ${classId}, 'active', '2020-09-01')
          RETURNING id
        `

        yield* enterGrades(schoolId, assessmentId, [
          { enrollmentId, value: 10, enteredAt: "2027-01-10T09:00:00.000Z" }
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const results = yield* enterGrades(schoolId, assessmentId, [
          // Older than what's stored for `enrollmentId` — must be rejected.
          { enrollmentId, value: 20, enteredAt: "2027-01-09T09:00:00.000Z" },
          // A brand-new Mark for a different student in the same batch — must still commit.
          { enrollmentId: secondEnrollment.id, value: 16, enteredAt: "2027-01-10T09:00:00.000Z" }
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        expect(results).toEqual([
          { enrollmentId, status: "rejected_stale" },
          { enrollmentId: secondEnrollment.id, status: "committed" }
        ])

        const [mark] = yield* sql<{ value: string }>`
          SELECT value FROM marks WHERE assessment_id = ${assessmentId} AND enrollment_id = ${enrollmentId}
        `
        expect(Number(mark.value)).toBe(10)
      })
    ))

  it.effect("an exact retry (identical enteredAt) is reported rejected_stale, not duplicated", () =>
    withAssessmentFixture(({ assessmentId, enrollmentId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const entry: GradeEntry = { enrollmentId, value: 12, enteredAt: "2027-01-10T09:00:00.000Z" }

        const first = yield* enterGrades(schoolId, assessmentId, [entry]).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        const second = yield* enterGrades(schoolId, assessmentId, [entry]).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        expect(first).toEqual([{ enrollmentId, status: "committed" }])
        expect(second).toEqual([{ enrollmentId, status: "rejected_stale" }])

        const [{ count }] = yield* sql<{ count: string }>`
          SELECT count(*)::int AS count FROM marks WHERE assessment_id = ${assessmentId} AND enrollment_id = ${enrollmentId}
        `
        expect(Number(count)).toBe(1)
      })
    ))

  it.effect("an entry with both value and marker set is reported invalid", () =>
    withAssessmentFixture(({ assessmentId, enrollmentId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const entries = [
          { enrollmentId, value: 12, marker: "exempted", enteredAt: "2027-01-10T09:00:00.000Z" } as GradeEntry
        ]
        const results = yield* enterGrades(schoolId, assessmentId, entries).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        expect(results[0].status).toBe("invalid")
        if (results[0].status !== "invalid") throw new Error("unreachable")
        expect(results[0].reason).not.toBe("")
        expect(results[0].reason).toContain("Exactly one of value or marker")
      })
    ))

  it.effect("an entry for an enrollment id that doesn't exist is reported no_such_enrollment", () =>
    withAssessmentFixture(({ assessmentId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const entries: ReadonlyArray<GradeEntry> = [
          { enrollmentId: "00000000-0000-0000-0000-000000000000", value: 12, enteredAt: "2027-01-10T09:00:00.000Z" }
        ]
        const results = yield* enterGrades(schoolId, assessmentId, entries).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        expect(results).toEqual([
          { enrollmentId: "00000000-0000-0000-0000-000000000000", status: "no_such_enrollment" }
        ])
      })
    ))

  it.effect("an enrollment that exists but belongs to a different class is reported no_such_enrollment", () =>
    withAssessmentFixture(({ academicYearId, assessmentId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const [otherClass] = yield* sql<{ level_id: string }>`
          SELECT level_id FROM classes WHERE school_id = ${schoolId} LIMIT 1
        `.pipe(
          Effect.flatMap((rows) =>
            sql<{ id: string }>`
              INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
              VALUES (${schoolId}, ${academicYearId}, ${rows[0].level_id}, '6AP-2', 30) RETURNING id
            `
          )
        )
        const otherStudentPersonId = yield* randomUUID
        yield* sql`
          INSERT INTO persons (id, first_name, last_name, date_of_birth, massar_code)
          VALUES (${otherStudentPersonId}, 'Yassine', 'Alaoui', '2013-03-03', ${`G${
          otherStudentPersonId.replaceAll("-", "").slice(0, 12)
        }`})
        `
        const [otherEnrollment] = yield* sql<{ id: string }>`
          INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
          VALUES (${schoolId}, ${academicYearId}, '2020-2021', ${otherStudentPersonId}, ${otherClass.id}, 'active', '2020-09-01')
          RETURNING id
        `

        const entries: ReadonlyArray<GradeEntry> = [
          { enrollmentId: otherEnrollment.id, value: 12, enteredAt: "2027-01-10T09:00:00.000Z" }
        ]
        const results = yield* enterGrades(schoolId, assessmentId, entries).pipe(
          Effect.provide(asTeacher(schoolId, teacherPersonId))
        )
        expect(results).toEqual([{ enrollmentId: otherEnrollment.id, status: "no_such_enrollment" }])
      })
    ))

  it.effect("a later entry can never silently overwrite an already-published Mark", () =>
    withAssessmentFixture(({ assessmentId, enrollmentId, schoolId, teacherPersonId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* enterGrades(schoolId, assessmentId, [
          { enrollmentId, value: 10, enteredAt: "2027-01-10T09:00:00.000Z" }
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))
        yield* sql`
          UPDATE marks SET status = 'published'
          WHERE assessment_id = ${assessmentId} AND enrollment_id = ${enrollmentId}
        `

        const results = yield* enterGrades(schoolId, assessmentId, [
          { enrollmentId, value: 18, enteredAt: "2027-01-11T09:00:00.000Z" }
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        expect(results).toEqual([{ enrollmentId, status: "rejected_published" }])

        const [mark] = yield* sql<{ value: string; status: string }>`
          SELECT value, status FROM marks WHERE assessment_id = ${assessmentId} AND enrollment_id = ${enrollmentId}
        `
        expect(Number(mark.value)).toBe(10)
        expect(mark.status).toBe("published")
      })
    ))

  it.effect("a teacher with no active assignment for the course is denied", () =>
    withAssessmentFixture(({ assessmentId, enrollmentId, schoolId }) =>
      Effect.gen(function*() {
        const unassignedTeacherPersonId = yield* randomUUID
        const entries: ReadonlyArray<GradeEntry> = [
          { enrollmentId, value: 12, enteredAt: "2027-01-10T09:00:00.000Z" }
        ]
        const error = yield* enterGrades(schoolId, assessmentId, entries).pipe(
          Effect.provide(asTeacher(schoolId, unassignedTeacherPersonId)),
          Effect.flip
        )
        expect(error).toBeInstanceOf(AccessDenied)
      })
    ))

  it.effect("a director's write attempt is denied — grade entry is teacher-only", () =>
    withAssessmentFixture(({ assessmentId, enrollmentId, schoolId }) =>
      Effect.gen(function*() {
        const entries: ReadonlyArray<GradeEntry> = [
          { enrollmentId, value: 12, enteredAt: "2027-01-10T09:00:00.000Z" }
        ]
        const error = yield* enterGrades(schoolId, assessmentId, entries).pipe(
          Effect.provide(asDirectorOf(schoolId)),
          Effect.flip
        )
        expect(error).toBeInstanceOf(AccessDenied)
      })
    ))
})
