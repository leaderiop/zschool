import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { SqlLive, withSchool } from "@zschool/db"
import {
  analyzeGradeRows,
  attachStudentProfile,
  commitGradeImportBatch,
  createPerson,
  type GradeAnalysisResult,
  type GradeImportRow,
  type GradeRowResult,
  GradingScales,
  insertEnrollment,
  instantiateNationalTemplate
} from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-ped-23-grade-import.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly classId: Ref.Ref<string | undefined>
  readonly rows: Ref.Ref<ReadonlyArray<GradeImportRow>>
  readonly commitResult: Ref.Ref<ReadonlyArray<GradeRowResult> | undefined>
  readonly analysis: Ref.Ref<ReadonlyArray<GradeAnalysisResult> | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        classId: yield* Ref.make<string | undefined>(undefined),
        rows: yield* Ref.make<ReadonlyArray<GradeImportRow>>([]),
        commitResult: yield* Ref.make<ReadonlyArray<GradeRowResult> | undefined>(undefined),
        analysis: yield* Ref.make<ReadonlyArray<GradeAnalysisResult> | undefined>(undefined)
      })
    })
  )
}

/** Same reasoning as `fr-ped-13-student-guardian-import.steps.test.ts`'s own `asOwner`/`ownerCount`. */
const asOwner = <A, E>(effect: Effect.Effect<A, E, SqlClient>): Effect.Effect<A> =>
  effect.pipe(Effect.provide(SqlLive), Effect.orDie)

const ownerCount = (
  build: (sql: SqlClient) => Effect.Effect<ReadonlyArray<{ readonly count: string }>, SqlError>
): Effect.Effect<number> =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [row] = yield* build(sql)
    return Number(row.count)
  }))

/** Same "instantiate the national template, then pull out a level/class" shape as `fr-ped-13`'s own `setupSchoolWithClass` — gives real `Subject`/`EvaluationPeriod` rows ("MATH", "S1") for free. */
const setupSchoolWithEnrolledStudent = (name: string, studentName: string, massarCode: string) =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES (${name}) RETURNING id`
    const result = yield* instantiateNationalTemplate({
      schoolId: school.id,
      academicYearLabel: "2026-2027",
      authorizedCycles: ["middle"]
    }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

    return yield* withSchool(
      school.id,
      Effect.gen(function*() {
        const [level] = yield* sql<{ id: string }>`
          SELECT id FROM levels WHERE school_id = ${school.id} AND code = '1AC'
        `
        const [cls] = yield* sql<{ id: string }>`
          INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
          VALUES (${school.id}, ${result.academicYearId}, ${level.id}, '1AC-1', 30) RETURNING id
        `

        const [firstName, lastName] = studentName.split(" ")
        const personId = yield* createPerson({ firstName, lastName, dateOfBirth: "2013-01-01", massarCode })
        yield* attachStudentProfile(personId)
        yield* insertEnrollment({
          schoolId: school.id,
          academicYearId: result.academicYearId,
          studentPersonId: personId,
          classId: cls.id,
          effectiveDate: "2020-01-01",
          hasLegalGuardian: true,
          hasFinancialGuardian: true
        })

        return { schoolId: school.id, academicYearId: result.academicYearId, classId: cls.id }
      })
    ).pipe(Effect.orDie)
  })

describeFeature(
  feature,
  { shared: Layer.merge(DatabaseTestLive, GradingScales.layer), perScenario: World.layer },
  ({ Given, Then, When }) => {
    Given("a grade row for an enrolled student, a real subject, and a real evaluation period", function*() {
      const world = yield* World
      const seed = yield* setupSchoolWithEnrolledStudent("Grade import school", "Zineb Fassi", "M700001")
      yield* Ref.set(world.schoolId, seed.schoolId)
      yield* Ref.set(world.academicYearId, seed.academicYearId)
      yield* Ref.set(world.rows, [
        { rowId: "g1", massarCode: "M700001", subjectCode: "MATH", periodCode: "S1", value: 15 }
      ])
    })

    When("the batch commits", function*() {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const academicYearId = yield* Ref.get(world.academicYearId)
      const rows = yield* Ref.get(world.rows)
      const result = yield* commitGradeImportBatch(schoolId!, academicYearId!, rows).pipe(
        Effect.provide(asDirectorOf(schoolId!))
      )
      yield* Ref.set(world.commitResult, result)
    })

    Then("a Mark is created, attached to the student's Enrollment", function*() {
      const world = yield* World
      const result = yield* Ref.get(world.commitResult)
      const [row] = result!
      assert.strictEqual(row.status, "committed")
      if (row.status !== "committed") throw new Error("unreachable")

      const count = yield* ownerCount((sql) => sql`SELECT count(*)::int AS count FROM marks WHERE id = ${row.markId}`)
      assert.strictEqual(count, 1)
    })

    Given("a grade row with a value of 8 out of a scale of 10", function*() {
      const world = yield* World
      const seed = yield* setupSchoolWithEnrolledStudent("Scale import school", "Omar Tazi", "M700002")
      yield* Ref.set(world.schoolId, seed.schoolId)
      yield* Ref.set(world.academicYearId, seed.academicYearId)
      yield* Ref.set(world.rows, [
        { rowId: "g1", massarCode: "M700002", subjectCode: "MATH", periodCode: "S1", value: 8, scale: 10 }
      ])
    })

    Then("the stored Mark value is {int}", function*(expectedValue) {
      const world = yield* World
      const result = yield* Ref.get(world.commitResult)
      const [row] = result!
      assert.strictEqual(row.status, "committed")
      if (row.status !== "committed") throw new Error("unreachable")

      const [{ value }] = yield* asOwner(Effect.gen(function*() {
        const sql = yield* SqlClient
        return yield* sql<{ value: string }>`SELECT value FROM marks WHERE id = ${row.markId}`
      }))
      assert.strictEqual(Number(value), expectedValue)
    })

    Given("two enrolled students graded on the same subject and evaluation period", function*() {
      const world = yield* World
      const seed = yield* setupSchoolWithEnrolledStudent("Shared assessment school", "Salma Idrissi", "M700003")
      yield* Ref.set(world.schoolId, seed.schoolId)
      yield* Ref.set(world.academicYearId, seed.academicYearId)
      yield* Ref.set(world.classId, seed.classId)

      yield* withSchool(
        seed.schoolId,
        Effect.gen(function*() {
          const secondPersonId = yield* createPerson({
            firstName: "Hamza",
            lastName: "Idrissi",
            dateOfBirth: "2013-03-03",
            massarCode: "M700004"
          })
          yield* attachStudentProfile(secondPersonId)
          yield* insertEnrollment({
            schoolId: seed.schoolId,
            academicYearId: seed.academicYearId,
            studentPersonId: secondPersonId,
            classId: seed.classId,
            effectiveDate: "2020-01-01",
            hasLegalGuardian: true,
            hasFinancialGuardian: true
          })
        })
      )

      yield* Ref.set(world.rows, [
        { rowId: "g1", massarCode: "M700003", subjectCode: "MATH", periodCode: "S1", value: 12 },
        { rowId: "g2", massarCode: "M700004", subjectCode: "MATH", periodCode: "S1", value: 17 }
      ])
    })

    Then("exactly one Assessment exists for that subject and period", function*() {
      const world = yield* World
      const classId = yield* Ref.get(world.classId)
      const count = yield* ownerCount((sql) =>
        sql`SELECT count(*)::int AS count FROM assessments WHERE class_id = ${classId}`
      )
      assert.strictEqual(count, 1)
    })

    Given("a grade row referencing a Massar code with no matching Enrollment", function*() {
      const world = yield* World
      const seed = yield* setupSchoolWithEnrolledStudent("No enrollment school", "Yassine Amrani", "M700005")
      yield* Ref.set(world.schoolId, seed.schoolId)
      yield* Ref.set(world.academicYearId, seed.academicYearId)
      yield* Ref.set(world.rows, [
        { rowId: "g1", massarCode: "DOES-NOT-EXIST", subjectCode: "MATH", periodCode: "S1", value: 10 }
      ])
    })

    When("the grade rows are analyzed", function*() {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const academicYearId = yield* Ref.get(world.academicYearId)
      const rows = yield* Ref.get(world.rows)
      const analysis = yield* analyzeGradeRows(schoolId!, academicYearId!, rows)
      yield* Ref.set(world.analysis, analysis)
    })

    Then("the row is rejected with a reason naming the missing enrollment", function*() {
      const world = yield* World
      const analysis = yield* Ref.get(world.analysis)
      const [row] = analysis!
      assert.strictEqual(row.status, "error")
      if (row.status !== "error") throw new Error("unreachable")
      assert.include(row.error.reason, "DOES-NOT-EXIST")
    })

    Given("a grade row already committed once", function*() {
      const world = yield* World
      const seed = yield* setupSchoolWithEnrolledStudent("Idempotent grade school", "Nadia Bennis", "M700006")
      yield* Ref.set(world.schoolId, seed.schoolId)
      yield* Ref.set(world.academicYearId, seed.academicYearId)
      const row: GradeImportRow = {
        rowId: "g1",
        massarCode: "M700006",
        subjectCode: "MATH",
        periodCode: "S1",
        value: 13
      }
      yield* Ref.set(world.rows, [row])

      const first = yield* commitGradeImportBatch(seed.schoolId, seed.academicYearId, [row]).pipe(
        Effect.provide(asDirectorOf(seed.schoolId))
      )
      yield* Ref.set(world.commitResult, first)
    })

    When("that same row is committed again", function*() {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const academicYearId = yield* Ref.get(world.academicYearId)
      const rows = yield* Ref.get(world.rows)
      const second = yield* commitGradeImportBatch(schoolId!, academicYearId!, rows).pipe(
        Effect.provide(asDirectorOf(schoolId!))
      )
      yield* Ref.set(world.commitResult, second)
    })

    Then("no duplicate Mark is created", function*() {
      const world = yield* World
      const result = yield* Ref.get(world.commitResult)
      assert.strictEqual(result![0].status, "committed")

      // Scoped to this scenario's own student (not a bare global count) —
      // scenarios in this feature share one real database, same as
      // `fr-ped-13-student-guardian-import.steps.test.ts`'s own ground-truth
      // assertions.
      const count = yield* ownerCount((sql) =>
        sql`
          SELECT count(*)::int AS count FROM marks m
          JOIN enrollments e ON e.id = m.enrollment_id
          JOIN persons p ON p.id = e.student_person_id
          WHERE p.massar_code = 'M700006'
        `
      )
      assert.strictEqual(count, 1)
    })
  }
)
