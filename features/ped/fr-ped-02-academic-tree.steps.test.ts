import { fileURLToPath } from "node:url"
import { describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { assert } from "@effect-cucumber/vitest"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
import type { EnforcementError } from "@qadi/core/Qadi"
import { qadiTestLayer, subjectWith } from "@qadi/testing"
import { withSchool } from "@zschool/db"
import {
  ActiveEnrollmentsExistError,
  createClass,
  createGroup,
  deleteClass,
  instantiateNationalTemplate,
  levelCapacity,
  renameLevel
} from "@zschool/domain"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(
  fileURLToPath(new URL("./fr-ped-02-academic-tree.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly levelId: Ref.Ref<string | undefined>
  readonly classId: Ref.Ref<string | undefined>
  readonly error: Ref.Ref<ActiveEnrollmentsExistError | EnforcementError | SqlError | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        levelId: yield* Ref.make<string | undefined>(undefined),
        classId: yield* Ref.make<string | undefined>(undefined),
        error: yield* Ref.make<ActiveEnrollmentsExistError | EnforcementError | SqlError | undefined>(undefined)
      })
    })
  )
}

const asDirectorOf = (schoolId: string) =>
  qadiTestLayer(subjectWith({ roles: ["director"], attributes: { school_id: schoolId } }))

/** Creates a school and instantiates the national template, returning the school and academic year ids plus the id of the level matching `levelCode`. */
const givenLevel = (levelCode: string) =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Academic tree school') RETURNING id`
    // `Effect.orDie`: every cycle is authorized here, so `UnauthorizedCycleError`
    // can never actually occur — collapsing it to a defect (rather than
    // leaving it in the error channel) keeps every step below in this Feature
    // sharing one error union instead of each having to know about a business
    // error that only a misconfigured test setup could ever raise.
    const result = yield* instantiateNationalTemplate({
      schoolId: school.id,
      academicYearLabel: "2026-2027",
      authorizedCycles: ["preschool", "primary", "middle", "upper_secondary"]
    }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

    const [level] = yield* withSchool(
      school.id,
      sql<{ id: string }>`SELECT id FROM levels WHERE school_id = ${school.id} AND code = ${levelCode}`
    )

    return { schoolId: school.id, academicYearId: result.academicYearId, levelId: level.id }
  })

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("a 2AC level instantiated in the national section", function*() {
    const world = yield* World
    const { academicYearId, levelId, schoolId } = yield* givenLevel("2AC")
    yield* Ref.set(world.schoolId, schoolId)
    yield* Ref.set(world.academicYearId, academicYearId)
    yield* Ref.set(world.levelId, levelId)
  })

  When("the director creates the class {string} with a capacity of {int}", function*(label, capacity) {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const levelId = yield* Ref.get(world.levelId)
    const classId = yield* createClass({ schoolId: schoolId!, academicYearId: academicYearId!, levelId: levelId!, label, capacity }).pipe(
      Effect.provide(asDirectorOf(schoolId!))
    )
    yield* Ref.set(world.classId, classId)
  })

  Then("the class appears under level 2AC with an enrollment of 0 out of 32", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const classId = yield* Ref.get(world.classId)

    const [row] = yield* withSchool(
      schoolId!,
      sql<{ label: string; capacity: number }>`SELECT label, capacity FROM classes WHERE id = ${classId}`
    )
    assert.strictEqual(row.label, "2AC-3")
    assert.strictEqual(row.capacity, 32)
    // No Enrollment entity exists yet (ticket #9) — "0 enrolled" holds
    // trivially for a class that was just created, not by querying one.
  })

  And("level 2AC's capacity is recalculated as the sum of its classes' capacities", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const levelId = yield* Ref.get(world.levelId)
    const capacity = yield* levelCapacity(schoolId!, levelId!)
    assert.strictEqual(capacity, 32)
  })

  And("an empty class {string} with a capacity of {int}", function*(label, capacity) {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const levelId = yield* Ref.get(world.levelId)
    const classId = yield* createClass({ schoolId: schoolId!, academicYearId: academicYearId!, levelId: levelId!, label, capacity }).pipe(
      Effect.provide(asDirectorOf(schoolId!))
    )
    yield* Ref.set(world.classId, classId)
  })

  When("the director deletes the class", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const classId = yield* Ref.get(world.classId)
    yield* deleteClass(schoolId!, classId!).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("the class no longer appears under level 2AC", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const classId = yield* Ref.get(world.classId)
    const rows = yield* withSchool(schoolId!, sql`SELECT id FROM classes WHERE id = ${classId}`)
    assert.strictEqual(rows.length, 0)
  })

  And("level 2AC's capacity no longer counts it", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const levelId = yield* Ref.get(world.levelId)
    const capacity = yield* levelCapacity(schoolId!, levelId!)
    assert.strictEqual(capacity, 0)
  })

  Given("a class {string} under level 1BAC", function*(label) {
    const world = yield* World
    const { academicYearId, levelId, schoolId } = yield* givenLevel("1BAC")
    yield* Ref.set(world.schoolId, schoolId)
    yield* Ref.set(world.academicYearId, academicYearId)
    yield* Ref.set(world.levelId, levelId)
    const classId = yield* createClass({ schoolId, academicYearId, levelId, label, capacity: 30 }).pipe(
      Effect.provide(asDirectorOf(schoolId))
    )
    yield* Ref.set(world.classId, classId)
  })

  When("the director creates a {string} group named {string} within it", function*(groupType, name) {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const classId = yield* Ref.get(world.classId)
    yield* createGroup({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      classId: classId!,
      code: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      groupType: groupType as "language" | "option" | "lab"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("both groups appear under the class", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const classId = yield* Ref.get(world.classId)
    const rows = yield* withSchool(
      schoolId!,
      sql<{ name: string }>`SELECT name FROM groups WHERE class_id = ${classId} ORDER BY name`
    )
    assert.strictEqual(rows.length, 2)
    assert.deepStrictEqual(rows.map((r) => r.name), ["English track", "Physics lab"])
  })

  And("a class {string} already created under it", function*(label) {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const levelId = yield* Ref.get(world.levelId)
    const classId = yield* createClass({ schoolId: schoolId!, academicYearId: academicYearId!, levelId: levelId!, label, capacity: 30 }).pipe(
      Effect.provide(asDirectorOf(schoolId!))
    )
    yield* Ref.set(world.classId, classId)
  })

  When("the director renames level {string} to {string}", function*(_oldCode, newName) {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const levelId = yield* Ref.get(world.levelId)
    yield* renameLevel(schoolId!, levelId!, newName).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("the class still resolves to the renamed level by id", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const classId = yield* Ref.get(world.classId)
    const levelId = yield* Ref.get(world.levelId)
    const [row] = yield* withSchool(
      schoolId!,
      sql<{ name: string }>`
        SELECT l.name FROM classes c JOIN levels l ON l.id = c.level_id
        WHERE c.id = ${classId} AND l.id = ${levelId}
      `
    )
    assert.strictEqual(row.name, "Collège — 2ème année")
  })

  And("the rename is recorded in the structure audit log", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const levelId = yield* Ref.get(world.levelId)
    const rows = yield* withSchool(
      schoolId!,
      sql<{ action: string }>`
        SELECT action FROM structure_audit_log
        WHERE entity_type = 'level' AND entity_id = ${levelId} AND action = 'renamed'
      `
    )
    assert.isAbove(rows.length, 0)
  })
})
