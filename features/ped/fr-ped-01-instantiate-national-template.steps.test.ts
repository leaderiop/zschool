import { describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { assert } from "@effect-cucumber/vitest"
import type { EnforcementError } from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import {
  type CycleCode,
  instantiateNationalTemplate,
  type InstantiateNationalTemplateResult,
  UnauthorizedCycleError
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
  fileURLToPath(new URL("./fr-ped-01-instantiate-national-template.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly authorizedCycles: Ref.Ref<ReadonlyArray<CycleCode>>
  readonly academicYearLabel: Ref.Ref<string>
  readonly result: Ref.Ref<InstantiateNationalTemplateResult | undefined>
  // `SchemaError` joined this union (issue #42): `instantiateNationalTemplate`
  // now decodes `schoolId` and its `AcademicYear`/`Section` repository
  // inserts through `Model.Class` schemas instead of hand-written queries.
  readonly error: Ref.Ref<UnauthorizedCycleError | SchemaError | SqlError | EnforcementError | undefined>
  readonly otherSchoolId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        authorizedCycles: yield* Ref.make<ReadonlyArray<CycleCode>>([]),
        academicYearLabel: yield* Ref.make("2026-2027"),
        result: yield* Ref.make<InstantiateNationalTemplateResult | undefined>(undefined),
        error: yield* Ref.make<UnauthorizedCycleError | SchemaError | SqlError | EnforcementError | undefined>(
          undefined
        ),
        otherSchoolId: yield* Ref.make<string | undefined>(undefined)
      })
    })
  )
}

const createSchool = (name: string) =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    const [row] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES (${name}) RETURNING id`
    return row.id
  })

const runInstantiation = (schoolId: string, academicYearLabel: string, authorizedCycles: ReadonlyArray<CycleCode>) =>
  instantiateNationalTemplate({ schoolId, academicYearLabel, authorizedCycles }).pipe(
    Effect.provide(asDirectorOf(schoolId)),
    Effect.result
  )

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("a newly onboarded school with no academic structure", function*() {
    const world = yield* World
    yield* Ref.set(world.schoolId, yield* createSchool("Newly onboarded school"))
  })

  And("whose authorized cycles are primary, middle school, and upper secondary", function*() {
    const world = yield* World
    yield* Ref.set(world.authorizedCycles, ["primary", "middle", "upper_secondary"])
  })

  When("the director launches the instantiation wizard and chooses the {string} template", function*(templateName) {
    yield* Effect.void
    assert.strictEqual(templateName, "Moroccan national")
  })

  And("confirms school year {word}", function*(year) {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const authorizedCycles = yield* Ref.get(world.authorizedCycles)
    const outcome = yield* runInstantiation(schoolId!, year, authorizedCycles)
    if (outcome._tag === "Success") {
      yield* Ref.set(world.result, outcome.success)
    } else {
      yield* Ref.set(world.error, outcome.failure)
    }
  })

  Then("sections, cycles, and levels 1AP through 2nd Bac are created per the template", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const result = yield* Ref.get(world.result)
    assert.isDefined(result)

    yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        const sections = yield* sql`SELECT id FROM sections WHERE school_id = ${schoolId}`
        assert.strictEqual(sections.length, 1)

        const oneAp = yield* sql`SELECT id FROM levels WHERE school_id = ${schoolId} AND code = '1AP'`
        assert.strictEqual(oneAp.length, 1)

        const secondBac = yield* sql`SELECT id FROM levels WHERE school_id = ${schoolId} AND code = '2BAC'`
        assert.strictEqual(secondBac.length, 1)
      })
    )
  })

  And("the default evaluation periods are two semesters", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        const periods = yield* sql<{ code: string }>`
          SELECT code FROM evaluation_periods WHERE school_id = ${schoolId} ORDER BY sequence
        `
        assert.deepStrictEqual(periods.map((p) => p.code), ["S1", "S2"])
      })
    )
  })

  And("usual subjects are created with default ministry coefficients, editable", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        const [mathConfig] = yield* sql<{ coefficient: string }>`
          SELECT slc.coefficient
          FROM subject_level_configs slc
          JOIN subjects s ON s.id = slc.subject_id
          JOIN levels l ON l.id = slc.level_id
          WHERE slc.school_id = ${schoolId} AND s.code = 'MATH' AND l.code = '1AP'
        `
        assert.isDefined(mathConfig)
        assert.strictEqual(Number(mathConfig.coefficient), 4)
      })
    )
  })

  And("no preschool cycle is created, since the school is not authorized for it", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        const preschool = yield* sql`SELECT id FROM cycles WHERE school_id = ${schoolId} AND code = 'preschool'`
        assert.strictEqual(preschool.length, 0)
      })
    )
  })

  Given("a school authorized only for preschool and primary", function*() {
    const world = yield* World
    yield* Ref.set(world.schoolId, yield* createSchool("Preschool and primary only school"))
    yield* Ref.set(world.authorizedCycles, ["preschool", "primary"])
  })

  When("the director attempts to instantiate an upper-secondary-only section", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const outcome = yield* instantiateNationalTemplate({
      schoolId: schoolId!,
      academicYearLabel: "2026-2027",
      authorizedCycles: ["preschool", "primary"],
      requestedCycles: ["upper_secondary"]
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.result)

    if (outcome._tag === "Failure") {
      yield* Ref.set(world.error, outcome.failure)
    }
  })

  Then("the wizard flags the mismatch with the school's authorized cycles", function*() {
    const world = yield* World
    const error = yield* Ref.get(world.error)
    assert.isDefined(error)
    assert.instanceOf(error, UnauthorizedCycleError)
  })

  And("no section is created", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        const sections = yield* sql`SELECT id FROM sections WHERE school_id = ${schoolId}`
        assert.strictEqual(sections.length, 0)
      })
    )
  })

  Given("a school authorized for upper secondary and instantiating the national template", function*() {
    const world = yield* World
    yield* Ref.set(world.schoolId, yield* createSchool("Upper secondary school"))
    yield* Ref.set(world.authorizedCycles, ["upper_secondary"])
  })

  When("the instantiation completes for school year {word}", function*(year) {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const authorizedCycles = yield* Ref.get(world.authorizedCycles)
    const outcome = yield* runInstantiation(schoolId!, year, authorizedCycles)
    assert.strictEqual(outcome._tag, "Success")
    if (outcome._tag === "Success") yield* Ref.set(world.result, outcome.success)
  })

  Then(
    "1st Bac and 2nd Bac each carry the 12 standard tracks, from Mathematical Sciences A to the International Option in Spanish",
    function*() {
      const world = yield* World
      const sql = yield* SqlClient
      const schoolId = yield* Ref.get(world.schoolId)

      yield* withSchool(
        schoolId!,
        Effect.gen(function*() {
          for (const levelCode of ["1BAC", "2BAC"]) {
            const tracks = yield* sql<{ code: string }>`
              SELECT t.code FROM tracks t
              JOIN levels l ON l.id = t.level_id
              WHERE t.school_id = ${schoolId} AND l.code = ${levelCode}
            `
            assert.strictEqual(tracks.length, 12)
            assert.include(tracks.map((t) => t.code), "math_sciences_a")
            assert.include(tracks.map((t) => t.code), "international_option_es")
          }
        })
      )
    }
  )

  And(
    "a track's subject coefficients are configured independently of every other track at the same level",
    function*() {
      const world = yield* World
      const sql = yield* SqlClient
      const schoolId = yield* Ref.get(world.schoolId)

      yield* withSchool(
        schoolId!,
        Effect.gen(function*() {
          const [mathA, mathB] = yield* sql<{ coefficient: string }>`
          SELECT slc.coefficient
          FROM subject_level_configs slc
          JOIN subjects s ON s.id = slc.subject_id
          JOIN levels l ON l.id = slc.level_id
          JOIN tracks t ON t.id = slc.track_id
          WHERE slc.school_id = ${schoolId} AND s.code = 'MATH' AND l.code = '2BAC'
            AND t.code IN ('math_sciences_a', 'math_sciences_b')
          ORDER BY t.code
        `
          assert.isDefined(mathA)
          assert.isDefined(mathB)
          assert.notStrictEqual(Number(mathA.coefficient), Number(mathB.coefficient))
        })
      )
    }
  )

  Given("a school instantiating the national template for school year {word}", function*(year) {
    const world = yield* World
    yield* Ref.set(world.schoolId, yield* createSchool("Grading defaults school"))
    yield* Ref.set(world.authorizedCycles, ["preschool", "primary", "middle", "upper_secondary"])
    yield* Ref.set(world.academicYearLabel, year)
  })

  When("the instantiation completes", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const authorizedCycles = yield* Ref.get(world.authorizedCycles)
    const academicYearLabel = yield* Ref.get(world.academicYearLabel)
    const outcome = yield* runInstantiation(schoolId!, academicYearLabel, authorizedCycles)
    assert.strictEqual(outcome._tag, "Success")
    if (outcome._tag === "Success") yield* Ref.set(world.result, outcome.success)
  })

  Then("the section's grading scale defaults to a maximum score of 20", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const result = yield* Ref.get(world.result)

    yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        const [scale] = yield* sql<{ max_score: string }>`
          SELECT max_score FROM grading_scales WHERE school_id = ${schoolId} AND section_id = ${result!.sectionId}
        `
        assert.strictEqual(Number(scale.max_score), 20)
      })
    )
  })

  And("the default is editable afterward without affecting already-recorded grades", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const result = yield* Ref.get(world.result)

    yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        yield* sql`UPDATE grading_scales SET max_score = 100 WHERE school_id = ${schoolId} AND section_id = ${
          result!.sectionId
        }`
        const [scale] = yield* sql<{ max_score: string }>`
          SELECT max_score FROM grading_scales WHERE school_id = ${schoolId} AND section_id = ${result!.sectionId}
        `
        assert.strictEqual(Number(scale.max_score), 100)
      })
    )
  })

  Given("a school that instantiated the national template for school year {word}", function*(year) {
    const world = yield* World
    const schoolId = yield* createSchool("Renaming school")
    yield* Ref.set(world.schoolId, schoolId)
    const outcome = yield* runInstantiation(schoolId, year, [
      "preschool",
      "primary",
      "middle",
      "upper_secondary"
    ])
    assert.strictEqual(outcome._tag, "Success")
    if (outcome._tag === "Success") yield* Ref.set(world.result, outcome.success)
  })

  When("the director renames level {string} to {string}", function*(oldCode, newName) {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    yield* withSchool(
      schoolId!,
      sql`UPDATE levels SET name = ${newName} WHERE school_id = ${schoolId} AND code = ${oldCode}`
    )
  })

  Then("the subject-level configurations already created for {string} still resolve to it by id", function*(levelCode) {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        const configs = yield* sql<{ id: string }>`
          SELECT slc.id
          FROM subject_level_configs slc
          JOIN levels l ON l.id = slc.level_id
          WHERE slc.school_id = ${schoolId} AND l.code = ${levelCode}
        `
        assert.isAbove(configs.length, 0)
      })
    )
  })

  And("the renamed level's coefficients are unchanged", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        const [mathConfig] = yield* sql<{ coefficient: string; level_name: string }>`
          SELECT slc.coefficient, l.name AS level_name
          FROM subject_level_configs slc
          JOIN subjects s ON s.id = slc.subject_id
          JOIN levels l ON l.id = slc.level_id
          WHERE slc.school_id = ${schoolId} AND s.code = 'MATH' AND l.code = '2AC'
        `
        assert.strictEqual(mathConfig.level_name, "Collège 2ème année")
        assert.strictEqual(Number(mathConfig.coefficient), 4)
      })
    )
  })

  Given("two schools, each instantiating the national template for school year {word}", function*(year) {
    const world = yield* World
    yield* Ref.set(world.schoolId, yield* createSchool("Isolation school A"))
    yield* Ref.set(world.otherSchoolId, yield* createSchool("Isolation school B"))
    yield* Ref.set(world.academicYearLabel, year)
  })

  When("both instantiations complete", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const otherSchoolId = yield* Ref.get(world.otherSchoolId)
    const year = yield* Ref.get(world.academicYearLabel)
    const authorizedCycles: ReadonlyArray<CycleCode> = ["preschool", "primary", "middle", "upper_secondary"]

    const a = yield* runInstantiation(schoolId!, year, authorizedCycles)
    const b = yield* runInstantiation(otherSchoolId!, year, authorizedCycles)
    assert.strictEqual(a._tag, "Success")
    assert.strictEqual(b._tag, "Success")
  })

  Then(
    "each school's academic years, sections, cycles, levels, and subjects carry only that school's school_id",
    function*() {
      const world = yield* World
      const sql = yield* SqlClient
      const schoolId = yield* Ref.get(world.schoolId)
      const otherSchoolId = yield* Ref.get(world.otherSchoolId)

      // Explicit `WHERE school_id = ...`, run under each school's own
      // `withSchool` scope — since migration 0007, `zschool_service` does not
      // carry `BYPASSRLS` (see `packages/db/src/AppSql.ts`), so the
      // `tenant_isolation` policy is a real, independent second layer here:
      // reading `sections` from OUTSIDE any `withSchool` scope would now be
      // RLS-filtered to nothing rather than freely returning every school's
      // rows, which is exactly the isolation this assertion is checking for.
      const sections = yield* withSchool(
        schoolId!,
        sql<{ school_id: string }>`SELECT school_id FROM sections WHERE school_id = ${schoolId}`
      )
      assert.isAbove(sections.length, 0)
      assert.isTrue(sections.every((row) => row.school_id === schoolId))

      const otherSections = yield* withSchool(
        otherSchoolId!,
        sql<{ school_id: string }>`SELECT school_id FROM sections WHERE school_id = ${otherSchoolId}`
      )
      assert.isAbove(otherSections.length, 0)
      assert.isTrue(otherSections.every((row) => row.school_id === otherSchoolId))

      // The actual RLS-blocking proof: scoped to `schoolId`, a query for the
      // OTHER school's own rows (by their real id, no `WHERE school_id`
      // mismatch involved) must come back empty — the two same-school checks
      // above would pass identically even if `tenant_isolation` were broken.
      const crossTenantRead = yield* withSchool(
        schoolId!,
        sql<{ school_id: string }>`SELECT school_id FROM sections WHERE school_id = ${otherSchoolId}`
      )
      assert.strictEqual(crossTenantRead.length, 0)

      assert.notStrictEqual(schoolId, otherSchoolId)
    }
  )

  And(
    "every tenant-scoped table created by the migration has a tenant_isolation row-level-security policy keyed on school_id",
    function*() {
      const sql = yield* SqlClient
      const tenantScopedTables = [
        "academic_years",
        "sections",
        "cycles",
        "levels",
        "tracks",
        "subjects",
        "subject_level_configs",
        "grading_scales",
        "evaluation_periods"
      ]

      const policies = yield* sql<{ tablename: string; qual: string; relrowsecurity: boolean }>`
        SELECT p.tablename, p.qual, c.relrowsecurity
        FROM pg_policies p
        JOIN pg_class c ON c.relname = p.tablename
        WHERE p.schemaname = 'public' AND p.policyname = 'tenant_isolation'
      `
      const byTable = new Map(policies.map((p) => [p.tablename, p]))

      for (const table of tenantScopedTables) {
        const policy = byTable.get(table)
        assert.isDefined(policy, `expected a tenant_isolation policy on ${table}`)
        assert.isTrue(policy!.relrowsecurity, `expected row security enabled on ${table}`)
        assert.include(policy!.qual, "school_id")
        assert.include(policy!.qual, "current_setting")
      }
    }
  )
})
