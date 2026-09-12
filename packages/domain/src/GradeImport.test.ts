import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { insertEnrollment } from "./Enrollment.ts"
import { analyzeGradeRows, commitGradeImportBatch, type GradeImportRow, normalizeToTwenty } from "./GradeImport.ts"
import { GradingScales } from "./GradingScales.ts"
import { attachStudentProfile, createPerson } from "./Identity.ts"
import { instantiateNationalTemplate } from "./InstantiateNationalTemplate.ts"

/** Same `authorized`-gating context as every other import domain's test in this package. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/**
 * Reuses `instantiateNationalTemplate` (same as
 * `fr-ped-13-student-guardian-import.steps.test.ts`'s own
 * `setupSchoolWithClass`) so the seeded school already has real
 * `Subject`/`EvaluationPeriod` rows ("AR"/"FR"/"MATH", "S1"/"S2") — no
 * bespoke seeding needed for what grade import actually resolves against.
 * Also creates one enrolled student with a known Massar code, since every
 * grade row needs a real `Enrollment` to attach to.
 */
const withSeededEnrollment = Effect.fn(function*<A, E, R>(
  use: (
    seed: { schoolId: string; academicYearId: string; classId: string; massarCode: string; enrollmentId: string }
  ) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<
    { id: string }
  >`INSERT INTO schools (name) VALUES ('GradeImport test school') RETURNING id`
  const schoolId = school.id

  const result = yield* instantiateNationalTemplate({
    schoolId,
    academicYearLabel: "2026-2027",
    authorizedCycles: ["middle"]
  }).pipe(Effect.provide(asDirectorOf(schoolId)))

  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const [level] = yield* sql<{ id: string }>`
        SELECT id FROM levels WHERE school_id = ${schoolId} AND code = '1AC'
      `
      const [cls] = yield* sql<{ id: string }>`
        INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
        VALUES (${schoolId}, ${result.academicYearId}, ${level.id}, '1AC-1', 30) RETURNING id
      `

      // Derived from the already-unique school id rather than `Math.random()`
      // (effecttsgo's `global-random-in-effect`) — just needs to be unique
      // against `persons`' platform-wide massar_code index (migration 0008).
      const massarCode = "M" + schoolId.replace(/-/g, "").slice(0, 12)
      const personId = yield* createPerson({
        firstName: "Zineb",
        lastName: "Fassi",
        dateOfBirth: "2013-01-01",
        massarCode
      })
      yield* attachStudentProfile(personId)
      const enrollment = yield* insertEnrollment({
        schoolId,
        academicYearId: result.academicYearId,
        studentPersonId: personId,
        classId: cls.id,
        effectiveDate: "2020-01-01",
        hasLegalGuardian: true,
        hasFinancialGuardian: true
      })

      return yield* use({
        schoolId,
        academicYearId: result.academicYearId,
        classId: cls.id,
        massarCode,
        enrollmentId: enrollment.id
      })
    })
  )
}, Effect.provide(Layer.merge(AppSqlLive, GradingScales.layer)))

describe("GradeImport", () => {
  it("normalizeToTwenty converts a non-/20 scale before weighting", () => {
    expect(normalizeToTwenty(15, 20)).toBe(15)
    expect(normalizeToTwenty(8, 10)).toBe(16)
    expect(normalizeToTwenty(75, 100)).toBe(15)
  })

  it.effect("a resolvable row commits a Mark, normalized to /20, on a synthesized imported Assessment", () =>
    withSeededEnrollment(({ academicYearId, classId, massarCode, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const row: GradeImportRow = {
          rowId: "g1",
          massarCode,
          subjectCode: "MATH",
          periodCode: "S1",
          value: 8,
          scale: 10
        }

        const analysis = yield* analyzeGradeRows(schoolId, academicYearId, [row])
        expect(analysis).toEqual([{ rowId: "g1", status: "resolvable" }])

        const results = yield* commitGradeImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results).toHaveLength(1)
        expect(results[0].status).toBe("committed")
        if (results[0].status !== "committed") throw new Error("unreachable")

        const [mark] = yield* sql<{ value: string; status: string }>`
          SELECT value, status FROM marks WHERE id = ${results[0].markId}
        `
        expect(Number(mark.value)).toBe(16)
        expect(mark.status).toBe("draft")

        const [assessment] = yield* sql<{ class_id: string; type: string; is_import_synthesized: boolean }>`
          SELECT a.class_id, a.type, a.is_import_synthesized FROM assessments a
          JOIN marks m ON m.assessment_id = a.id WHERE m.id = ${results[0].markId}
        `
        expect(assessment.class_id).toBe(classId)
        expect(assessment.type).toBe("imported")
        expect(assessment.is_import_synthesized).toBe(true)
      })
    ))

  it.effect("two students in the same class/subject/period share one synthesized Assessment", () =>
    withSeededEnrollment(({ academicYearId, classId, massarCode: firstMassarCode, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const secondPersonId = yield* createPerson({
          firstName: "Omar",
          lastName: "Tazi",
          dateOfBirth: "2013-02-02",
          // Same "derive from an already-unique id" reasoning as `withSeededEnrollment`'s own massarCode above.
          massarCode: "N" + schoolId.replace(/-/g, "").slice(0, 12)
        })
        yield* attachStudentProfile(secondPersonId)
        yield* insertEnrollment({
          schoolId,
          academicYearId,
          studentPersonId: secondPersonId,
          classId,
          effectiveDate: "2020-01-01",
          hasLegalGuardian: true,
          hasFinancialGuardian: true
        })
        const [secondPerson] = yield* sql<{ massar_code: string }>`
          SELECT massar_code FROM persons WHERE id = ${secondPersonId}
        `

        const rows: ReadonlyArray<GradeImportRow> = [
          { rowId: "g1", massarCode: firstMassarCode, subjectCode: "MATH", periodCode: "S1", value: 12 },
          { rowId: "g2", massarCode: secondPerson.massar_code, subjectCode: "MATH", periodCode: "S1", value: 18 }
        ]
        const results = yield* commitGradeImportBatch(schoolId, academicYearId, rows).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results.every((r) => r.status === "committed")).toBe(true)

        const [{ count }] = yield* sql<{ count: string }>`
          SELECT count(*)::int AS count FROM assessments WHERE class_id = ${classId}
        `
        expect(Number(count)).toBe(1)
      })
    ))

  it.effect("re-committing the same row is idempotent — no duplicate Mark", () =>
    withSeededEnrollment(({ academicYearId, massarCode, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const row: GradeImportRow = { rowId: "g1", massarCode, subjectCode: "MATH", periodCode: "S1", value: 14 }

        const first = yield* commitGradeImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const second = yield* commitGradeImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(first[0].status).toBe("committed")
        expect(second[0].status).toBe("committed")
        if (first[0].status !== "committed" || second[0].status !== "committed") throw new Error("unreachable")
        expect(second[0].markId).toBe(first[0].markId)

        const [{ count }] = yield* sql<{ count: string }>`SELECT count(*)::int AS count FROM marks`
        expect(Number(count)).toBe(1)
      })
    ))

  it.effect("a row referencing a student with no matching Enrollment is reported as an error, not skipped", () =>
    withSeededEnrollment(({ academicYearId, schoolId }) =>
      Effect.gen(function*() {
        const row: GradeImportRow = {
          rowId: "g1",
          massarCode: "DOES-NOT-EXIST",
          subjectCode: "MATH",
          periodCode: "S1",
          value: 10
        }
        const analysis = yield* analyzeGradeRows(schoolId, academicYearId, [row])
        expect(analysis[0].status).toBe("error")

        const results = yield* commitGradeImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results[0].status).toBe("error")
        if (results[0].status !== "error") throw new Error("unreachable")
        expect(results[0].error.reason).toContain("DOES-NOT-EXIST")
      })
    ))

  it.effect("an unresolvable subject code is reported as a per-row error", () =>
    withSeededEnrollment(({ academicYearId, massarCode, schoolId }) =>
      Effect.gen(function*() {
        const row: GradeImportRow = {
          rowId: "g1",
          massarCode,
          subjectCode: "DOES-NOT-EXIST",
          periodCode: "S1",
          value: 10
        }
        const results = yield* commitGradeImportBatch(schoolId, academicYearId, [row]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results[0].status).toBe("error")
      })
    ))
})
