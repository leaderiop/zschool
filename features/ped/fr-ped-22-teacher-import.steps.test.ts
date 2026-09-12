import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { SqlLive } from "@zschool/db"
import {
  analyzeTeacherRows,
  commitTeacherImportBatch,
  type TeacherAnalysisResult,
  type TeacherImportRow,
  type TeacherRowResult
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

const feature = await loadFeature(fileURLToPath(new URL("./fr-ped-22-teacher-import.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly otherSchoolId: Ref.Ref<string | undefined>
  readonly teacherRows: Ref.Ref<ReadonlyArray<TeacherImportRow>>
  readonly commitResult: Ref.Ref<ReadonlyArray<TeacherRowResult> | undefined>
  readonly analysis: Ref.Ref<ReadonlyArray<TeacherAnalysisResult> | undefined>
  readonly existingPersonId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        otherSchoolId: yield* Ref.make<string | undefined>(undefined),
        teacherRows: yield* Ref.make<ReadonlyArray<TeacherImportRow>>([]),
        commitResult: yield* Ref.make<ReadonlyArray<TeacherRowResult> | undefined>(undefined),
        analysis: yield* Ref.make<ReadonlyArray<TeacherAnalysisResult> | undefined>(undefined),
        existingPersonId: yield* Ref.make<string | undefined>(undefined)
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

const createSchool = (name: string) =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES (${name}) RETURNING id`
    return school.id
  })

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ Given, Then, When }) => {
  Given("a new teacher import row for a school", function*() {
    const world = yield* World
    const schoolId = yield* createSchool("Teacher import school")
    yield* Ref.set(world.schoolId, schoolId)
    yield* Ref.set(world.teacherRows, [{
      rowId: "t1",
      firstName: "Salma",
      lastName: "Ouazzani",
      dateOfBirth: "1988-02-14",
      massarCode: "T500001"
    }])
  })

  When("the batch commits", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const rows = yield* Ref.get(world.teacherRows)
    const result = yield* commitTeacherImportBatch(schoolId!, rows).pipe(Effect.provide(asDirectorOf(schoolId!)))
    yield* Ref.set(world.commitResult, result)
  })

  Then("a SchoolMembership is created in {string} status", function*(expectedStatus) {
    const world = yield* World
    const result = yield* Ref.get(world.commitResult)
    const [row] = result!
    assert.strictEqual(row.status, "invited")
    if (row.status !== "invited") throw new Error("unreachable")

    const count = yield* ownerCount((sql) =>
      sql`
      SELECT count(*)::int AS count FROM school_memberships
      WHERE person_id = ${row.personId} AND status = ${expectedStatus} AND role = 'teacher'
    `
    )
    assert.strictEqual(count, 1)
  })

  Then("no TeacherAssignment is created", function*() {
    // ADR-ZS-111: import never writes `teacher_assignments` — the table
    // doesn't exist yet in this codebase (a future, separate capability),
    // so the strongest available assertion is that this commit's own result
    // never carries anything beyond a `SchoolMembership` invitation.
    const world = yield* World
    const result = yield* Ref.get(world.commitResult)
    assert.strictEqual(result!.length, 1)
    assert.strictEqual(result![0].status, "invited")
  })

  Given("a teacher with a Massar code already affiliated with another school", function*() {
    const world = yield* World
    const schoolA = yield* createSchool("Massar teacher school A")
    const row: TeacherImportRow = {
      rowId: "t1",
      firstName: "Hicham",
      lastName: "Bouzidi",
      dateOfBirth: "1979-11-20",
      massarCode: "T600001"
    }
    const result = yield* commitTeacherImportBatch(schoolA, [row]).pipe(Effect.provide(asDirectorOf(schoolA)))
    const [committed] = result
    assert.strictEqual(committed.status, "invited")
    if (committed.status !== "invited") throw new Error("unreachable")
    yield* Ref.set(world.existingPersonId, committed.personId)

    const schoolB = yield* createSchool("Massar teacher school B")
    yield* Ref.set(world.schoolId, schoolB)
    yield* Ref.set(world.teacherRows, [{ ...row, rowId: "t2" }])
  })

  When("a second school imports a teacher row with the same Massar code and no confirmation", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const rows = yield* Ref.get(world.teacherRows)

    const analysis = yield* analyzeTeacherRows(rows)
    assert.strictEqual(analysis[0].status, "strong_match_awaiting_confirmation")

    const result = yield* commitTeacherImportBatch(schoolId!, rows).pipe(Effect.provide(asDirectorOf(schoolId!)))
    yield* Ref.set(world.commitResult, result)
  })

  Then("the row is awaiting confirmation and no new Person is created", function*() {
    const world = yield* World
    const result = yield* Ref.get(world.commitResult)
    assert.strictEqual(result![0].status, "awaiting_confirmation")

    const count = yield* ownerCount((sql) =>
      sql`SELECT count(*)::int AS count FROM persons WHERE massar_code = 'T600001'`
    )
    assert.strictEqual(count, 1)
  })

  Given("a teacher already invited at one school", function*() {
    const world = yield* World
    const schoolA = yield* createSchool("Simultaneous school A")
    const row: TeacherImportRow = {
      rowId: "t1",
      firstName: "Imane",
      lastName: "Kadiri",
      dateOfBirth: "1983-07-09",
      massarCode: "T700001"
    }
    const result = yield* commitTeacherImportBatch(schoolA, [row]).pipe(Effect.provide(asDirectorOf(schoolA)))
    const [committed] = result
    assert.strictEqual(committed.status, "invited")
    if (committed.status !== "invited") throw new Error("unreachable")
    yield* Ref.set(world.schoolId, schoolA)
    yield* Ref.set(world.existingPersonId, committed.personId)

    const schoolB = yield* createSchool("Simultaneous school B")
    yield* Ref.set(world.otherSchoolId, schoolB)
    yield* Ref.set(world.teacherRows, [{ ...row, rowId: "t2" }])
  })

  When("another school imports and confirms the same matched teacher", function*() {
    const world = yield* World
    const schoolB = yield* Ref.get(world.otherSchoolId)
    const existingPersonId = yield* Ref.get(world.existingPersonId)
    const [row] = yield* Ref.get(world.teacherRows)

    const confirmedRow: TeacherImportRow = { ...row, confirmedMatchPersonId: existingPersonId }
    const result = yield* commitTeacherImportBatch(schoolB!, [confirmedRow]).pipe(
      Effect.provide(asDirectorOf(schoolB!))
    )
    yield* Ref.set(world.commitResult, result)
  })

  Then("both schools have their own SchoolMembership for that teacher", function*() {
    const world = yield* World
    const schoolA = yield* Ref.get(world.schoolId)
    const schoolB = yield* Ref.get(world.otherSchoolId)
    const existingPersonId = yield* Ref.get(world.existingPersonId)
    const result = yield* Ref.get(world.commitResult)
    assert.strictEqual(result![0].status, "invited")

    const countA = yield* ownerCount((sql) =>
      sql`SELECT count(*)::int AS count FROM school_memberships WHERE school_id = ${schoolA} AND person_id = ${existingPersonId}`
    )
    const countB = yield* ownerCount((sql) =>
      sql`SELECT count(*)::int AS count FROM school_memberships WHERE school_id = ${schoolB} AND person_id = ${existingPersonId}`
    )
    assert.strictEqual(countA, 1)
    assert.strictEqual(countB, 1)
  })

  Given("a teacher already invited at a school", function*() {
    const world = yield* World
    const schoolId = yield* createSchool("Idempotent import school")
    const row: TeacherImportRow = {
      rowId: "t1",
      firstName: "Othmane",
      lastName: "Lahlou",
      dateOfBirth: "1991-03-03"
    }
    const result = yield* commitTeacherImportBatch(schoolId, [row]).pipe(Effect.provide(asDirectorOf(schoolId)))
    const [committed] = result
    assert.strictEqual(committed.status, "invited")
    if (committed.status !== "invited") throw new Error("unreachable")
    yield* Ref.set(world.schoolId, schoolId)
    yield* Ref.set(world.existingPersonId, committed.personId)
    yield* Ref.set(world.teacherRows, [{ ...row, confirmedMatchPersonId: committed.personId }])
  })

  When("that school imports the same confirmed teacher row again", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const rows = yield* Ref.get(world.teacherRows)
    const result = yield* commitTeacherImportBatch(schoolId!, rows).pipe(Effect.provide(asDirectorOf(schoolId!)))
    yield* Ref.set(world.commitResult, result)
  })

  Then("no duplicate SchoolMembership is created", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const existingPersonId = yield* Ref.get(world.existingPersonId)
    const result = yield* Ref.get(world.commitResult)
    assert.strictEqual(result![0].status, "invited")

    const count = yield* ownerCount((sql) =>
      sql`SELECT count(*)::int AS count FROM school_memberships WHERE school_id = ${schoolId} AND person_id = ${existingPersonId}`
    )
    assert.strictEqual(count, 1)
  })

  Given("a teacher import row missing a required first name", function*() {
    const world = yield* World
    yield* Ref.set(world.teacherRows, [{
      rowId: "t1",
      firstName: "",
      lastName: "Amrani",
      dateOfBirth: "1990-01-01"
    }])
  })

  When("the teacher rows are analyzed", function*() {
    const world = yield* World
    const rows = yield* Ref.get(world.teacherRows)
    const analysis = yield* analyzeTeacherRows(rows)
    yield* Ref.set(world.analysis, analysis)
  })

  Then("the row is rejected with a reason naming the first name field", function*() {
    const world = yield* World
    const analysis = yield* Ref.get(world.analysis)
    const [row] = analysis!
    assert.strictEqual(row.status, "error")
    if (row.status !== "error") throw new Error("unreachable")
    assert.include(row.error.reason, "firstName")
  })
})
