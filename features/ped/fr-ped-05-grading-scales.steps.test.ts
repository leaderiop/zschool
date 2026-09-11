import { describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { assert } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import { GradingScales, instantiateNationalTemplate, InvalidWeightingError } from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(
  fileURLToPath(new URL("./fr-ped-05-grading-scales.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly sectionId: Ref.Ref<string | undefined>
  readonly level6APId: Ref.Ref<string | undefined>
  readonly error: Ref.Ref<InvalidWeightingError | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        sectionId: yield* Ref.make<string | undefined>(undefined),
        level6APId: yield* Ref.make<string | undefined>(undefined),
        error: yield* Ref.make<InvalidWeightingError | undefined>(undefined)
      })
    })
  )
}

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("year 2026-2027 instantiated on the national template", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Grading school') RETURNING id`
    const result = yield* instantiateNationalTemplate({
      schoolId: school.id,
      academicYearLabel: "2026-2027",
      authorizedCycles: ["preschool", "primary", "middle", "upper_secondary"]
    }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

    const [level6AP] = yield* withSchool(
      school.id,
      sql<{ id: string }>`SELECT id FROM levels WHERE school_id = ${school.id} AND code = '6AP'`
    ).pipe(Effect.orDie)

    yield* Ref.set(world.schoolId, school.id)
    yield* Ref.set(world.academicYearId, result.academicYearId)
    yield* Ref.set(world.sectionId, result.sectionId)
    yield* Ref.set(world.level6APId, level6AP.id)
  })

  When("the director opens the certifying-exam weightings", function*() {
    yield* Effect.void
  })

  Then(
    "the default values 6AP 50\\/25\\/25, 3AC 30\\/30\\/40, and Baccalaureate 25\\/25\\/50 are pre-filled with their textual reference",
    function*() {
      const world = yield* World
      const sql = yield* SqlClient
      const schoolId = yield* Ref.get(world.schoolId)

      const rows = yield* withSchool(
        schoolId!,
        sql<
          {
            code: string
            weight_continuous: string
            weight_exam_1: string
            weight_exam_2: string
            reference_text: string
          }
        >`
          SELECT l.code, cr.weight_continuous, cr.weight_exam_1, cr.weight_exam_2, cr.reference_text
          FROM computation_rules cr JOIN levels l ON l.id = cr.level_id
          WHERE cr.school_id = ${schoolId} AND cr.is_current
          ORDER BY l.code
        `
      ).pipe(Effect.orDie)

      assert.strictEqual(rows.length, 3)
      const sixAP = rows.find((r) => r.code === "6AP")!
      assert.strictEqual(Number(sixAP.weight_continuous), 50)
      assert.strictEqual(Number(sixAP.weight_exam_1), 25)
      assert.strictEqual(Number(sixAP.weight_exam_2), 25)
      assert.isAbove(sixAP.reference_text.length, 0)

      const threeAC = rows.find((r) => r.code === "3AC")!
      assert.strictEqual(Number(threeAC.weight_continuous), 30)
      assert.strictEqual(Number(threeAC.weight_exam_1), 30)
      assert.strictEqual(Number(threeAC.weight_exam_2), 40)

      const bac = rows.find((r) => r.code === "2BAC")!
      assert.strictEqual(Number(bac.weight_continuous), 25)
      assert.strictEqual(Number(bac.weight_exam_1), 25)
      assert.strictEqual(Number(bac.weight_exam_2), 50)
    }
  )

  And("a change creates a dated version for the year, with the previous one still viewable", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const level6APId = yield* Ref.get(world.level6APId)

    const gradingScales = yield* GradingScales
    yield* gradingScales.setComputationRule({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      levelId: level6APId!,
      weightContinuous: 40,
      weightExam1: 30,
      weightExam2: 30,
      referenceText: "Updated local weighting"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))

    const rows = yield* withSchool(
      schoolId!,
      sql<{ is_current: boolean; weight_continuous: string }>`
        SELECT is_current, weight_continuous FROM computation_rules
        WHERE school_id = ${schoolId} AND level_id = ${level6APId}
        ORDER BY effective_from
      `
    ).pipe(Effect.orDie)

    assert.strictEqual(rows.length, 2)
    assert.isFalse(rows[0].is_current)
    assert.strictEqual(Number(rows[0].weight_continuous), 50)
    assert.isTrue(rows[1].is_current)
    assert.strictEqual(Number(rows[1].weight_continuous), 40)
  })

  When("the director attempts to set 6AP's weighting to 50\\/25\\/30", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const level6APId = yield* Ref.get(world.level6APId)

    const gradingScales = yield* GradingScales
    const outcome = yield* gradingScales.setComputationRule({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      levelId: level6APId!,
      weightContinuous: 50,
      weightExam1: 25,
      weightExam2: 30,
      referenceText: "Bad weighting"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.result)

    if (outcome._tag === "Failure") {
      yield* Ref.set(world.error, outcome.failure as InvalidWeightingError)
    }
  })

  Then("the change is refused since the weights do not sum to 100", function*() {
    const world = yield* World
    const error = yield* Ref.get(world.error)
    assert.isDefined(error)
    assert.instanceOf(error, InvalidWeightingError)
  })

  And("the previous weighting is unchanged", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const level6APId = yield* Ref.get(world.level6APId)

    const rows = yield* withSchool(
      schoolId!,
      sql<{ weight_continuous: string }>`
        SELECT weight_continuous FROM computation_rules
        WHERE school_id = ${schoolId} AND level_id = ${level6APId} AND is_current
      `
    ).pipe(Effect.orDie)

    assert.strictEqual(rows.length, 1)
    assert.strictEqual(Number(rows[0].weight_continuous), 50)
  })

  When("the director changes the grading scale to a maximum score of 100", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const sectionId = yield* Ref.get(world.sectionId)

    const gradingScales = yield* GradingScales
    yield* gradingScales.updateGradingScale({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      sectionId: sectionId!,
      maxScore: 100
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("the section's grading scale reflects the new maximum score", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const sectionId = yield* Ref.get(world.sectionId)

    const [row] = yield* withSchool(
      schoolId!,
      sql<
        { max_score: string }
      >`SELECT max_score FROM grading_scales WHERE school_id = ${schoolId} AND section_id = ${sectionId}`
    ).pipe(Effect.orDie)

    assert.strictEqual(Number(row.max_score), 100)
  })
})
