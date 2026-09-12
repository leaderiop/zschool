import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { SqlLive } from "@zschool/db"
import { addFeeItem, createFeeSchedule, findFeeItems } from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-01-fee-schedules.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly levelId: Ref.Ref<string | undefined>
  readonly feeScheduleId: Ref.Ref<string | undefined>
  readonly refusalError: Ref.Ref<{ readonly _tag: string } | undefined>
  readonly createdFeeItemId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        levelId: yield* Ref.make<string | undefined>(undefined),
        feeScheduleId: yield* Ref.make<string | undefined>(undefined),
        refusalError: yield* Ref.make<{ readonly _tag: string } | undefined>(undefined),
        createdFeeItemId: yield* Ref.make<string | undefined>(undefined)
      })
    })
  )
}

/** Same reasoning as `fr-ped-24-historical-grade-import.steps.test.ts`'s own `asOwner`. */
const asOwner = <A, E>(effect: Effect.Effect<A, E, SqlClient>): Effect.Effect<A> =>
  effect.pipe(Effect.provide(SqlLive), Effect.orDie)

/** Seeds a school -> year -> section -> cycle -> level chain, the same shape `ImportBatch.test.ts`'s `withSeededLevel` uses. */
const seedSchoolWithLevel = () =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`
      INSERT INTO schools (name) VALUES ('Fee schedule feature school') RETURNING id
    `
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
      VALUES (${school.id}, ${year.id}, ${cycle.id}, '6AP', '6ème Année Primaire', 1) RETURNING id
    `
    return { schoolId: school.id, academicYearId: year.id, levelId: level.id }
  }))

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ Given, Then, When }) => {
  Given("a school with a level and no fee schedule yet", function*() {
    const world = yield* World
    const seed = yield* seedSchoolWithLevel()
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.academicYearId, seed.academicYearId)
    yield* Ref.set(world.levelId, seed.levelId)
  })

  When("the director creates a fee schedule for that level and adds tuition and registration lines", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const levelId = yield* Ref.get(world.levelId)

    const feeScheduleId = yield* createFeeSchedule({ schoolId: schoolId!, academicYearId: academicYearId!, levelId: levelId! }).pipe(
      Effect.provide(asDirectorOf(schoolId!)),
      Effect.orDie
    )
    yield* Ref.set(world.feeScheduleId, feeScheduleId)

    yield* addFeeItem({
      schoolId: schoolId!,
      feeScheduleId,
      nature: "tuition",
      labelFr: "Scolarité",
      labelAr: "الرسوم الدراسية",
      frequency: "monthly",
      amountMad: 1200,
      isMandatory: true
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)

    yield* addFeeItem({
      schoolId: schoolId!,
      feeScheduleId,
      nature: "registration",
      labelFr: "Inscription",
      labelAr: "التسجيل",
      frequency: "one_time",
      amountMad: 500,
      isMandatory: true
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
  })

  Then("the fee schedule holds both fee lines with their amounts", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const feeScheduleId = yield* Ref.get(world.feeScheduleId)
    const items = yield* findFeeItems(schoolId!, feeScheduleId!)
    assert.strictEqual(items.length, 2)
    const tuition = items.find((item) => item.nature === "tuition")
    const registration = items.find((item) => item.nature === "registration")
    assert.strictEqual(tuition?.amount_mad, 1200)
    assert.strictEqual(registration?.amount_mad, 500)
  })

  Given("a school with a fee schedule for a level", function*() {
    const world = yield* World
    const seed = yield* seedSchoolWithLevel()
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.academicYearId, seed.academicYearId)
    yield* Ref.set(world.levelId, seed.levelId)

    const feeScheduleId = yield* createFeeSchedule({
      schoolId: seed.schoolId,
      academicYearId: seed.academicYearId,
      levelId: seed.levelId
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
    yield* Ref.set(world.feeScheduleId, feeScheduleId)
  })

  When("the director tries to add a mandatory uniform line with no justification", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const feeScheduleId = yield* Ref.get(world.feeScheduleId)

    const result = yield* addFeeItem({
      schoolId: schoolId!,
      feeScheduleId: feeScheduleId!,
      nature: "uniform",
      labelFr: "Uniforme",
      labelAr: "الزي المدرسي",
      frequency: "annual",
      amountMad: 300,
      isMandatory: true
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.result)

    if (result._tag === "Failure") {
      yield* Ref.set(world.refusalError, result.failure)
    }
  })

  Then("the fee line is refused for missing the legal justification", function*() {
    const world = yield* World
    const error = yield* Ref.get(world.refusalError)
    assert.strictEqual(error?._tag, "MandatoryJustificationRequiredError")
  })

  When("the director adds a mandatory uniform line with a traced justification", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const feeScheduleId = yield* Ref.get(world.feeScheduleId)

    const feeItemId = yield* addFeeItem({
      schoolId: schoolId!,
      feeScheduleId: feeScheduleId!,
      nature: "uniform",
      labelFr: "Uniforme",
      labelAr: "الزي المدرسي",
      frequency: "annual",
      amountMad: 300,
      isMandatory: true,
      mandatoryJustification: "School board decision 2026-09-01, on file"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
    yield* Ref.set(world.createdFeeItemId, feeItemId)
  })

  Then("the fee line is created and carries the justification", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const feeScheduleId = yield* Ref.get(world.feeScheduleId)
    const createdFeeItemId = yield* Ref.get(world.createdFeeItemId)
    const items = yield* findFeeItems(schoolId!, feeScheduleId!)
    const item = items.find((it) => it.id === createdFeeItemId)
    assert.strictEqual(item?.mandatory_justification, "School board decision 2026-09-01, on file")
  })

  When("the director tries to create another fee schedule for the same year and level", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const levelId = yield* Ref.get(world.levelId)

    const result = yield* createFeeSchedule({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      levelId: levelId!
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.result)

    if (result._tag === "Failure") {
      yield* Ref.set(world.refusalError, result.failure)
    }
  })

  Then("the second fee schedule is refused as a duplicate", function*() {
    const world = yield* World
    const error = yield* Ref.get(world.refusalError)
    assert.strictEqual(error?._tag, "DuplicateFeeScheduleError")
  })
})
