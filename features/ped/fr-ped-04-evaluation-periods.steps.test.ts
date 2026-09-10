import { describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { assert } from "@effect-cucumber/vitest"
import type { EnforcementError } from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import {
  addSubPeriod,
  type EntityNotFoundError,
  instantiateNationalTemplate,
  PeriodOverlapError,
  setEvaluationPeriodDates
} from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import type { SchemaError } from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(
  fileURLToPath(new URL("./fr-ped-04-evaluation-periods.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly semester1Id: Ref.Ref<string | undefined>
  readonly error: Ref.Ref<
    PeriodOverlapError | EntityNotFoundError | SchemaError | EnforcementError | SqlError | undefined
  >
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        semester1Id: yield* Ref.make<string | undefined>(undefined),
        error: yield* Ref.make<
          PeriodOverlapError | EntityNotFoundError | SchemaError | EnforcementError | SqlError | undefined
        >(
          undefined
        )
      })
    })
  )
}

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("a school instantiating the national template for school year {word}", function*(year) {
    const world = yield* World
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Periods school') RETURNING id`
    const result = yield* instantiateNationalTemplate({
      schoolId: school.id,
      academicYearLabel: year,
      authorizedCycles: ["preschool", "primary", "middle", "upper_secondary"]
    }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

    const [semester1] = yield* withSchool(
      school.id,
      sql<{ id: string }>`SELECT id FROM evaluation_periods WHERE school_id = ${school.id} AND code = 'S1'`
    ).pipe(Effect.orDie)

    yield* Ref.set(world.schoolId, school.id)
    yield* Ref.set(world.academicYearId, result.academicYearId)
    yield* Ref.set(world.semester1Id, semester1.id)
  })

  When("the director records semester 1's dates as September 7, 2026 to January 24, 2027", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const semester1Id = yield* Ref.get(world.semester1Id)
    yield* setEvaluationPeriodDates({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      periodId: semester1Id!,
      startDate: "2026-09-07",
      endDate: "2027-01-24"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("semester 1's dates are stored as entered", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const semester1Id = yield* Ref.get(world.semester1Id)
    const [row] = yield* withSchool(
      schoolId!,
      sql<{ start_date: string; end_date: string }>`
        SELECT start_date, end_date FROM evaluation_periods WHERE id = ${semester1Id}
      `
    ).pipe(Effect.orDie)
    assert.strictEqual(row.start_date, "2026-09-07")
    assert.strictEqual(row.end_date, "2027-01-24")
  })

  And("semester 1 already dated September 7, 2026 to January 24, 2027", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const semester1Id = yield* Ref.get(world.semester1Id)
    yield* setEvaluationPeriodDates({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      periodId: semester1Id!,
      startDate: "2026-09-07",
      endDate: "2027-01-24"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  When("the director enters semester 2 starting on January 20, 2027 through July 4, 2027", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const [semester2] = yield* withSchool(
      schoolId!,
      sql<{ id: string }>`SELECT id FROM evaluation_periods WHERE school_id = ${schoolId} AND code = 'S2'`
    ).pipe(Effect.orDie)

    const outcome = yield* setEvaluationPeriodDates({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      periodId: semester2.id,
      startDate: "2027-01-20",
      endDate: "2027-07-04"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.result)

    if (outcome._tag === "Failure") {
      yield* Ref.set(world.error, outcome.failure)
    }
  })

  Then("the entry is refused with the overlap reason", function*() {
    const world = yield* World
    const error = yield* Ref.get(world.error)
    assert.isDefined(error)
    assert.instanceOf(error, PeriodOverlapError)
  })

  And("semester 1's original dates are preserved", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const semester1Id = yield* Ref.get(world.semester1Id)
    const [row] = yield* withSchool(
      schoolId!,
      sql<{ start_date: string; end_date: string }>`
        SELECT start_date, end_date FROM evaluation_periods WHERE id = ${semester1Id}
      `
    ).pipe(Effect.orDie)
    assert.strictEqual(row.start_date, "2026-09-07")
    assert.strictEqual(row.end_date, "2027-01-24")
  })

  When("the director adds a mock exam sub-period from December 15, 2026 to December 18, 2026", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const semester1Id = yield* Ref.get(world.semester1Id)
    yield* addSubPeriod({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      evaluationPeriodId: semester1Id!,
      code: "MOCK_1",
      name: "December mock exam",
      subPeriodType: "mock_exam",
      startDate: "2026-12-15",
      endDate: "2026-12-18"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("the sub-period appears within semester 1", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const semester1Id = yield* Ref.get(world.semester1Id)
    const rows = yield* withSchool(
      schoolId!,
      sql<{ code: string }>`
        SELECT code FROM evaluation_sub_periods WHERE evaluation_period_id = ${semester1Id}
      `
    ).pipe(Effect.orDie)
    assert.deepStrictEqual(rows.map((r) => r.code), ["MOCK_1"])
  })
})
