import { describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { assert } from "@effect-cucumber/vitest"
import type { EnforcementError } from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import {
  configureSubjectLevel,
  createSubject,
  DuplicateConfigError,
  EntityNotFoundError,
  instantiateNationalTemplate,
  updateSubjectLevelConfig
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
  fileURLToPath(new URL("./fr-ped-03-subject-level-config.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly sectionId: Ref.Ref<string | undefined>
  readonly otherAcademicYearId: Ref.Ref<string | undefined>
  readonly error: Ref.Ref<DuplicateConfigError | EntityNotFoundError | EnforcementError | SqlError | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        sectionId: yield* Ref.make<string | undefined>(undefined),
        otherAcademicYearId: yield* Ref.make<string | undefined>(undefined),
        error: yield* Ref.make<DuplicateConfigError | EntityNotFoundError | EnforcementError | SqlError | undefined>(
          undefined
        )
      })
    })
  )
}

const instantiate = (schoolId: string, academicYearLabel: string) =>
  instantiateNationalTemplate({
    schoolId,
    academicYearLabel,
    authorizedCycles: ["preschool", "primary", "middle", "upper_secondary"]
  }).pipe(Effect.provide(asDirectorOf(schoolId)), Effect.orDie)

const findId = (
  schoolId: string,
  table: string,
  code: string
): Effect.Effect<string, never, SqlClient> =>
  withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{ id: string }>`SELECT id FROM ${
        sql(table)
      } WHERE school_id = ${schoolId} AND code = ${code}`
      return row.id
    })
  ).pipe(Effect.orDie)

/** Track codes repeat across levels (every tracked level carries the same 12 codes) — `findId` alone would pick an arbitrary one, so this scopes by level too. */
const findTrackId = (
  schoolId: string,
  levelId: string,
  code: string
): Effect.Effect<string, never, SqlClient> =>
  withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{ id: string }>`
        SELECT id FROM tracks WHERE school_id = ${schoolId} AND level_id = ${levelId} AND code = ${code}
      `
      return row.id
    })
  ).pipe(Effect.orDie)

const configCoefficient = (
  schoolId: string,
  academicYearId: string,
  subjectCode: string,
  levelCode: string,
  trackCode: string
): Effect.Effect<number, never, SqlClient> =>
  withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{ coefficient: string }>`
        SELECT slc.coefficient
        FROM subject_level_configs slc
        JOIN subjects s ON s.id = slc.subject_id
        JOIN levels l ON l.id = slc.level_id
        JOIN tracks t ON t.id = slc.track_id
        WHERE slc.school_id = ${schoolId} AND slc.academic_year_id = ${academicYearId}
          AND s.code = ${subjectCode} AND l.code = ${levelCode} AND t.code = ${trackCode}
      `
      return Number(row.coefficient)
    })
  ).pipe(Effect.orDie)

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("a school instantiating the national template for school year {word}", function*(year) {
    const world = yield* World
    const sql = yield* SqlClient
    const [school] = yield* sql<
      { id: string }
    >`INSERT INTO schools (name) VALUES ('Subject config school') RETURNING id`
    const result = yield* instantiate(school.id, year)
    yield* Ref.set(world.schoolId, school.id)
    yield* Ref.set(world.academicYearId, result.academicYearId)
    yield* Ref.set(world.sectionId, result.sectionId)
  })

  When(
    "the director changes Mathematics' coefficient for \\(2nd Bac, Mathematical Sciences A) to {int}",
    function*(newCoefficient) {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const academicYearId = yield* Ref.get(world.academicYearId)

      const levelId = yield* findId(schoolId!, "levels", "2BAC")
      const trackId = yield* findTrackId(schoolId!, levelId, "math_sciences_a")
      const [config] = yield* withSchool(
        schoolId!,
        Effect.gen(function*() {
          const sql = yield* SqlClient
          return yield* sql<{ id: string }>`
          SELECT slc.id FROM subject_level_configs slc
          JOIN subjects s ON s.id = slc.subject_id
          WHERE slc.level_id = ${levelId} AND slc.track_id = ${trackId} AND s.code = 'MATH'
        `
        })
      ).pipe(Effect.orDie)

      yield* updateSubjectLevelConfig({
        schoolId: schoolId!,
        academicYearId: academicYearId!,
        configId: config.id,
        coefficient: newCoefficient
      }).pipe(Effect.provide(asDirectorOf(schoolId!)))
    }
  )

  Then("the configuration for \\(2nd Bac, Mathematical Sciences A) reflects the new coefficient", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const coefficient = yield* configCoefficient(schoolId!, academicYearId!, "MATH", "2BAC", "math_sciences_a")
    assert.strictEqual(coefficient, 8)
  })

  And("the configuration for \\(2nd Bac, Economics) stays independent and unchanged", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const coefficient = yield* configCoefficient(schoolId!, academicYearId!, "MATH", "2BAC", "economics")
    assert.strictEqual(coefficient, 4)
  })

  When(
    "the director attempts to create a second configuration for Mathematics at \\(2nd Bac, Mathematical Sciences A)",
    function*() {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const academicYearId = yield* Ref.get(world.academicYearId)
      const subjectId = yield* findId(schoolId!, "subjects", "MATH")
      const levelId = yield* findId(schoolId!, "levels", "2BAC")
      const trackId = yield* findTrackId(schoolId!, levelId, "math_sciences_a")

      const outcome = yield* configureSubjectLevel({
        schoolId: schoolId!,
        academicYearId: academicYearId!,
        subjectId,
        levelId,
        trackId,
        coefficient: 99,
        teachingLanguage: "French",
        isMandatory: true
      }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.result)

      if (outcome._tag === "Failure") {
        yield* Ref.set(world.error, outcome.failure)
      }
    }
  )

  Then("the creation is refused with an explicit error", function*() {
    const world = yield* World
    const error = yield* Ref.get(world.error)
    assert.isDefined(error)
    assert.instanceOf(error, DuplicateConfigError)
  })

  And("the existing configuration is preserved", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const coefficient = yield* configCoefficient(schoolId!, academicYearId!, "MATH", "2BAC", "math_sciences_a")
    assert.strictEqual(coefficient, 7)
  })

  When("the director adds the subject {string} to the catalog", function*(name) {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const sectionId = yield* Ref.get(world.sectionId)
    yield* createSubject({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      sectionId: sectionId!,
      code: "ROBOT",
      name
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  And(
    "configures it for \\(2nd Bac, Science and Technology) with coefficient {int} and teaching language French",
    function*(coefficient) {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const academicYearId = yield* Ref.get(world.academicYearId)
      const subjectId = yield* findId(schoolId!, "subjects", "ROBOT")
      const levelId = yield* findId(schoolId!, "levels", "2BAC")
      const trackId = yield* findTrackId(schoolId!, levelId, "science_technology")

      yield* configureSubjectLevel({
        schoolId: schoolId!,
        academicYearId: academicYearId!,
        subjectId,
        levelId,
        trackId,
        coefficient,
        teachingLanguage: "French",
        isMandatory: false
      }).pipe(Effect.provide(asDirectorOf(schoolId!)))
    }
  )

  Then("the new subject's configuration is specific to that level-track pair", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const coefficient = yield* configCoefficient(schoolId!, academicYearId!, "ROBOT", "2BAC", "science_technology")
    assert.strictEqual(coefficient, 3)
  })

  Given("two academic years for the same school, each instantiated from the national template", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Two-year school') RETURNING id`
    const first = yield* instantiate(school.id, "2026-2027")
    const second = yield* instantiate(school.id, "2027-2028")
    yield* Ref.set(world.schoolId, school.id)
    yield* Ref.set(world.academicYearId, first.academicYearId)
    yield* Ref.set(world.otherAcademicYearId, second.academicYearId)
  })

  When("the director changes Mathematics' coefficient for 1AP in the 2026-2027 year", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)

    const [config] = yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        return yield* sql<{ id: string }>`
          SELECT slc.id FROM subject_level_configs slc
          JOIN subjects s ON s.id = slc.subject_id
          JOIN levels l ON l.id = slc.level_id
          WHERE slc.academic_year_id = ${academicYearId} AND s.code = 'MATH' AND l.code = '1AP'
        `
      })
    ).pipe(Effect.orDie)

    yield* updateSubjectLevelConfig({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      configId: config.id,
      coefficient: 20
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("the 2027-2028 year's own Mathematics configuration for 1AP is unaffected", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const otherAcademicYearId = yield* Ref.get(world.otherAcademicYearId)

    // 1AP is untracked (track_id IS NULL) — no `tracks` join needed here.
    const [row] = yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        return yield* sql<{ coefficient: string }>`
          SELECT slc.coefficient FROM subject_level_configs slc
          JOIN subjects s ON s.id = slc.subject_id
          JOIN levels l ON l.id = slc.level_id
          WHERE slc.academic_year_id = ${otherAcademicYearId} AND s.code = 'MATH' AND l.code = '1AP' AND slc.track_id IS NULL
        `
      })
    ).pipe(Effect.orDie)

    assert.strictEqual(Number(row.coefficient), 4)
  })
})
