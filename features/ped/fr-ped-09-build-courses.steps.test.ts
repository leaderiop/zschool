import { describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { assert } from "@effect-cucumber/vitest"
import { qadiTestLayer, subjectWith } from "@qadi/testing"
import { withSchool } from "@zschool/db"
import { createClass, deactivateCourse, generateCoursesForClass, instantiateNationalTemplate } from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(
  fileURLToPath(new URL("./fr-ped-09-build-courses.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly classId: Ref.Ref<string | undefined>
  readonly mandatoryCount: Ref.Ref<number>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        classId: yield* Ref.make<string | undefined>(undefined),
        mandatoryCount: yield* Ref.make(0)
      })
    })
  )
}

const asDirectorOf = (schoolId: string) =>
  qadiTestLayer(subjectWith({ roles: ["director"], attributes: { school_id: schoolId } }))

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ Given, Then, When }) => {
  Given("a class under level 1AC with the national template's mandatory subjects configured", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Courses school') RETURNING id`
    const result = yield* instantiateNationalTemplate({
      schoolId: school.id,
      academicYearLabel: "2026-2027",
      authorizedCycles: ["middle"]
    }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

    const [level1AC] = yield* withSchool(
      school.id,
      sql<{ id: string }>`SELECT id FROM levels WHERE school_id = ${school.id} AND code = '1AC'`
    ).pipe(Effect.orDie)

    const [mandatoryCount] = yield* withSchool(
      school.id,
      sql<{ count: string }>`
        SELECT count(*)::int AS count FROM subject_level_configs
        WHERE school_id = ${school.id} AND level_id = ${level1AC.id} AND is_mandatory
      `
    ).pipe(Effect.orDie)

    const classId = yield* createClass({
      schoolId: school.id,
      academicYearId: result.academicYearId,
      levelId: level1AC.id,
      label: "1AC-2",
      capacity: 30
    }).pipe(Effect.provide(asDirectorOf(school.id)))

    yield* Ref.set(world.schoolId, school.id)
    yield* Ref.set(world.academicYearId, result.academicYearId)
    yield* Ref.set(world.classId, classId)
    yield* Ref.set(world.mandatoryCount, Number(mandatoryCount.count))
  })

  When("the director generates the class's courses", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const classId = yield* Ref.get(world.classId)
    yield* generateCoursesForClass(schoolId!, academicYearId!, classId!).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("one course exists for each mandatory subject at that level", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const classId = yield* Ref.get(world.classId)
    const mandatoryCount = yield* Ref.get(world.mandatoryCount)

    const rows = yield* withSchool(
      schoolId!,
      sql<{ id: string }>`SELECT id FROM courses WHERE school_id = ${schoolId} AND class_id = ${classId}`
    ).pipe(Effect.orDie)

    assert.strictEqual(rows.length, mandatoryCount)
    assert.isAbove(rows.length, 0)
  })

  Given("a class under level 1AC with its courses generated", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Deactivate school') RETURNING id`
    const result = yield* instantiateNationalTemplate({
      schoolId: school.id,
      academicYearLabel: "2026-2027",
      authorizedCycles: ["middle"]
    }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

    const [level1AC] = yield* withSchool(
      school.id,
      sql<{ id: string }>`SELECT id FROM levels WHERE school_id = ${school.id} AND code = '1AC'`
    ).pipe(Effect.orDie)

    const classId = yield* createClass({
      schoolId: school.id,
      academicYearId: result.academicYearId,
      levelId: level1AC.id,
      label: "1AC-3",
      capacity: 30
    }).pipe(Effect.provide(asDirectorOf(school.id)))

    yield* generateCoursesForClass(school.id, result.academicYearId, classId).pipe(
      Effect.provide(asDirectorOf(school.id))
    )

    yield* Ref.set(world.schoolId, school.id)
    yield* Ref.set(world.academicYearId, result.academicYearId)
    yield* Ref.set(world.classId, classId)
  })

  When("the director deactivates one of its courses with a reason", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const classId = yield* Ref.get(world.classId)

    const [course] = yield* withSchool(
      schoolId!,
      sql<{ id: string }>`SELECT id FROM courses WHERE school_id = ${schoolId} AND class_id = ${classId} LIMIT 1`
    ).pipe(Effect.orDie)

    yield* deactivateCourse(schoolId!, course.id, "Not taught this year").pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("the course no longer appears among the class's active courses", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const classId = yield* Ref.get(world.classId)

    const active = yield* withSchool(
      schoolId!,
      sql<{ id: string }>`SELECT id FROM courses WHERE school_id = ${schoolId} AND class_id = ${classId} AND is_active`
    ).pipe(Effect.orDie)
    const all = yield* withSchool(
      schoolId!,
      sql<{ id: string }>`SELECT id FROM courses WHERE school_id = ${schoolId} AND class_id = ${classId}`
    ).pipe(Effect.orDie)

    assert.strictEqual(active.length, all.length - 1)
  })
})
