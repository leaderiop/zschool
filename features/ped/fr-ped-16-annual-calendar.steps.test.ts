import { describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { assert } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import { confirmMovableHoliday, instantiateNationalTemplate } from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(
  fileURLToPath(new URL("./fr-ped-16-annual-calendar.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined)
      })
    })
  )
}

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("a school instantiating the national template for school year {word}", function*(year) {
    const world = yield* World
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Calendar school') RETURNING id`
    const result = yield* instantiateNationalTemplate({
      schoolId: school.id,
      academicYearLabel: year,
      authorizedCycles: ["preschool", "primary", "middle", "upper_secondary"]
    }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

    yield* Ref.set(world.schoolId, school.id)
    yield* Ref.set(world.academicYearId, result.academicYearId)
  })

  Then("the fixed national holidays are preloaded, confirmed, with their correct dates", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    const rows = yield* withSchool(
      schoolId!,
      sql<{ code: string; start_date: string; confirmation_status: string }>`
        SELECT code, start_date, confirmation_status FROM calendar_events
        WHERE school_id = ${schoolId} AND event_type = 'holiday' AND is_movable = false
        ORDER BY code
      `
    ).pipe(Effect.orDie)

    assert.strictEqual(rows.length, 9)
    assert.isTrue(rows.every((r) => r.confirmation_status === "confirmed"))
    const newYear = rows.find((r) => r.code === "NEW_YEAR")
    assert.strictEqual(newYear && newYear.start_date, "2027-01-01")
    const independenceDay = rows.find((r) => r.code === "INDEPENDENCE_DAY")
    assert.strictEqual(independenceDay && independenceDay.start_date, "2026-11-18")
  })

  And("the published school breaks are preloaded, confirmed, with their documented dates", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    const rows = yield* withSchool(
      schoolId!,
      sql<{ code: string; start_date: string; end_date: string }>`
        SELECT code, start_date, end_date FROM calendar_events
        WHERE school_id = ${schoolId} AND event_type = 'break'
        ORDER BY code
      `
    ).pipe(Effect.orDie)

    assert.strictEqual(rows.length, 5)
    const midYear = rows.find((r) => r.code === "MID_YEAR_BREAK")
    assert.strictEqual(midYear && midYear.start_date, "2027-01-24")
    assert.strictEqual(midYear && midYear.end_date, "2027-01-31")
  })

  And("the movable religious holidays are preloaded {string} with no date yet", function*(status) {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    const rows = yield* withSchool(
      schoolId!,
      sql<{ code: string; start_date: string | null; confirmation_status: string }>`
        SELECT code, start_date, confirmation_status FROM calendar_events
        WHERE school_id = ${schoolId} AND is_movable = true
        ORDER BY code
      `
    ).pipe(Effect.orDie)

    assert.strictEqual(rows.length, 5)
    assert.isTrue(rows.every((r) => r.confirmation_status === status))
    assert.isTrue(rows.every((r) => r.start_date === null))
  })

  When("ZSchool confirms Eid al-Fitr's date as March 21, 2027 after the official announcement", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    const [event] = yield* withSchool(
      schoolId!,
      sql<{ id: string }>`SELECT id FROM calendar_events WHERE school_id = ${schoolId} AND code = 'EID_AL_FITR'`
    ).pipe(Effect.orDie)

    yield* confirmMovableHoliday(schoolId!, event.id, "2027-03-21").pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("Eid al-Fitr is recorded as confirmed for that date", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    const [row] = yield* withSchool(
      schoolId!,
      sql<{ start_date: string; confirmation_status: string }>`
        SELECT start_date, confirmation_status FROM calendar_events
        WHERE school_id = ${schoolId} AND code = 'EID_AL_FITR'
      `
    ).pipe(Effect.orDie)

    assert.strictEqual(row.confirmation_status, "confirmed")
    assert.strictEqual(row.start_date, "2027-03-21")
  })
})
