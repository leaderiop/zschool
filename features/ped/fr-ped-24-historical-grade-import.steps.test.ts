import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { SqlLive, withSchool } from "@zschool/db"
import {
  analyzeHistoricalGradeRows,
  commitHistoricalGradeImportBatch,
  getOrCreateArchivalYear,
  type HistoricalGradeImportRow,
  type HistoricalGradeRowResult
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

const feature = await loadFeature(
  fileURLToPath(new URL("./fr-ped-24-historical-grade-import.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly rows: Ref.Ref<ReadonlyArray<HistoricalGradeImportRow>>
  readonly yearLabel: Ref.Ref<string | undefined>
  readonly commitResult: Ref.Ref<ReadonlyArray<HistoricalGradeRowResult> | undefined>
  readonly existingPersonId: Ref.Ref<string | undefined>
  readonly refusalError: Ref.Ref<{ readonly _tag: string } | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        rows: yield* Ref.make<ReadonlyArray<HistoricalGradeImportRow>>([]),
        yearLabel: yield* Ref.make<string | undefined>(undefined),
        commitResult: yield* Ref.make<ReadonlyArray<HistoricalGradeRowResult> | undefined>(undefined),
        existingPersonId: yield* Ref.make<string | undefined>(undefined),
        refusalError: yield* Ref.make<{ readonly _tag: string } | undefined>(undefined)
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

const historicalRow = (overrides: Partial<HistoricalGradeImportRow> = {}): HistoricalGradeImportRow => ({
  rowId: "h1",
  firstName: "Rania",
  lastName: "Kabbaj",
  dateOfBirth: "2005-05-05",
  levelCode: "3AC",
  classLabel: "3AC-A",
  subjectCode: "SVT",
  periodCode: "S1",
  value: 14,
  effectiveDate: "2019-09-01",
  ...overrides
})

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ Given, Then, When }) => {
  Given(
    "a historical grade row for a new student in a prior year the school never ran on the platform",
    function*() {
      const world = yield* World
      const schoolId = yield* createSchool("Historical grade import school")
      yield* Ref.set(world.schoolId, schoolId)
      yield* Ref.set(world.yearLabel, "2019-2020")
      yield* Ref.set(world.rows, [historicalRow({ massarCode: "H500001" })])
    }
  )

  When("the batch commits", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const yearLabel = yield* Ref.get(world.yearLabel)
    const rows = yield* Ref.get(world.rows)
    const result = yield* commitHistoricalGradeImportBatch(schoolId!, yearLabel!, rows).pipe(
      Effect.provide(asDirectorOf(schoolId!))
    )
    yield* Ref.set(world.commitResult, result)
  })

  Then("a born-closed archival AcademicYear is created for that label", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const yearLabel = yield* Ref.get(world.yearLabel)
    const [year] = yield* asOwner(Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* sql<{ status: string; is_archival: boolean }>`
        SELECT status, is_archival FROM academic_years WHERE school_id = ${schoolId} AND label = ${yearLabel}
      `
    }))
    assert.deepStrictEqual(year, { status: "closed", is_archival: true })
  })

  Then("the student's Enrollment in it is {string}", function*(expectedStatus) {
    const world = yield* World
    const result = yield* Ref.get(world.commitResult)
    const [row] = result!
    assert.strictEqual(row.status, "committed")
    if (row.status !== "committed") throw new Error("unreachable")

    const [enrollment] = yield* asOwner(Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* sql<{ status: string }>`
        SELECT e.status FROM enrollments e JOIN marks m ON m.enrollment_id = e.id WHERE m.id = ${row.markId}
      `
    }))
    assert.strictEqual(enrollment.status, expectedStatus)
  })

  Then("a Mark is created for the row", function*() {
    const world = yield* World
    const result = yield* Ref.get(world.commitResult)
    const [row] = result!
    assert.strictEqual(row.status, "committed")
    if (row.status !== "committed") throw new Error("unreachable")

    const count = yield* ownerCount((sql) => sql`SELECT count(*)::int AS count FROM marks WHERE id = ${row.markId}`)
    assert.strictEqual(count, 1)
  })

  Given("a historical grade row already committed into a historical year label", function*() {
    const world = yield* World
    const schoolId = yield* createSchool("Reuse archival year school")
    yield* Ref.set(world.schoolId, schoolId)
    yield* Ref.set(world.yearLabel, "2018-2019")

    yield* commitHistoricalGradeImportBatch(schoolId, "2018-2019", [historicalRow({ massarCode: "H600001" })]).pipe(
      Effect.provide(asDirectorOf(schoolId))
    )
  })

  When("another historical grade row for a different student is imported into the same label", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const yearLabel = yield* Ref.get(world.yearLabel)
    yield* commitHistoricalGradeImportBatch(
      schoolId!,
      yearLabel!,
      [historicalRow({ rowId: "h2", massarCode: "H600002", firstName: "Hamza", lastName: "Idrissi" })]
    ).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("only one archival AcademicYear exists for that label", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const yearLabel = yield* Ref.get(world.yearLabel)
    const count = yield* ownerCount((sql) =>
      sql`SELECT count(*)::int AS count FROM academic_years WHERE school_id = ${schoolId} AND label = ${yearLabel}`
    )
    assert.strictEqual(count, 1)
  })

  Given("a student already imported into one historical year", function*() {
    const world = yield* World
    const schoolId = yield* createSchool("Historical Massar match school")
    yield* Ref.set(world.schoolId, schoolId)
    yield* Ref.set(world.yearLabel, "2017-2018")

    const result = yield* commitHistoricalGradeImportBatch(
      schoolId,
      "2017-2018",
      [historicalRow({ massarCode: "H700001" })]
    ).pipe(Effect.provide(asDirectorOf(schoolId)))
    const [row] = result
    assert.strictEqual(row.status, "committed")
    if (row.status !== "committed") throw new Error("unreachable")

    const [{ student_person_id: studentPersonId }] = yield* asOwner(Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* sql<{ student_person_id: string }>`
        SELECT e.student_person_id FROM enrollments e JOIN marks m ON m.enrollment_id = e.id WHERE m.id = ${row.markId}
      `
    }))
    yield* Ref.set(world.existingPersonId, studentPersonId)
  })

  When("a second historical row with the same Massar code is imported unconfirmed", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const yearLabel = yield* Ref.get(world.yearLabel)
    const secondRow = historicalRow({ rowId: "h2", massarCode: "H700001", periodCode: "S2" })

    const analysis = yield* analyzeHistoricalGradeRows([secondRow])
    assert.strictEqual(analysis[0].status, "strong_match_awaiting_confirmation")

    const result = yield* commitHistoricalGradeImportBatch(schoolId!, yearLabel!, [secondRow]).pipe(
      Effect.provide(asDirectorOf(schoolId!))
    )
    yield* Ref.set(world.commitResult, result)
  })

  Then("the row is awaiting confirmation and no new Person is created", function*() {
    const world = yield* World
    const result = yield* Ref.get(world.commitResult)
    assert.strictEqual(result![0].status, "awaiting_confirmation")

    const count = yield* ownerCount((sql) =>
      sql`SELECT count(*)::int AS count FROM persons WHERE massar_code = 'H700001'`
    )
    assert.strictEqual(count, 1)
  })

  Given("a school with a genuine, non-archival academic year already on file", function*() {
    const world = yield* World
    const schoolId = yield* createSchool("Conflicting year school")
    yield* Ref.set(world.schoolId, schoolId)
    yield* Ref.set(world.yearLabel, "2026-2027")

    yield* withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`INSERT INTO academic_years (school_id, label) VALUES (${schoolId}, '2026-2027')`
      })
    )
  })

  When("a historical batch is imported using that same year label", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const yearLabel = yield* Ref.get(world.yearLabel)
    const result = yield* withSchool(schoolId!, getOrCreateArchivalYear(schoolId!, yearLabel!)).pipe(Effect.result)
    if (result._tag === "Failure") {
      yield* Ref.set(world.refusalError, result.failure)
    }
  })

  Then("the import is refused rather than writing into the live year", function*() {
    const world = yield* World
    const error = yield* Ref.get(world.refusalError)
    assert.strictEqual(error?._tag, "ArchivalYearConflictError")
  })
})
