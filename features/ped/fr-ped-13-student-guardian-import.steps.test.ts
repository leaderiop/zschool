import { describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { assert } from "@effect-cucumber/vitest"
import { SqlLive, withSchool } from "@zschool/db"
import {
  analyzeGuardianRows,
  analyzeStudentRows,
  commitImportBatch,
  createClass,
  type GuardianImportRow,
  type GuardianRowResult,
  type ImportBatchResult,
  instantiateNationalTemplate,
  type StudentAnalysisResult,
  type StudentImportRow
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
  fileURLToPath(new URL("./fr-ped-13-student-guardian-import.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly existingPersonId: Ref.Ref<string | undefined>
  readonly guardianRows: Ref.Ref<ReadonlyArray<GuardianImportRow>>
  readonly studentRows: Ref.Ref<ReadonlyArray<StudentImportRow>>
  readonly commitResult: Ref.Ref<ImportBatchResult | undefined>
  readonly guardianAnalysis: Ref.Ref<ReadonlyArray<GuardianRowResult> | undefined>
  readonly studentAnalysis: Ref.Ref<ReadonlyArray<StudentAnalysisResult> | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        existingPersonId: yield* Ref.make<string | undefined>(undefined),
        guardianRows: yield* Ref.make<ReadonlyArray<GuardianImportRow>>([]),
        studentRows: yield* Ref.make<ReadonlyArray<StudentImportRow>>([]),
        commitResult: yield* Ref.make<ImportBatchResult | undefined>(undefined),
        guardianAnalysis: yield* Ref.make<ReadonlyArray<GuardianRowResult> | undefined>(undefined),
        studentAnalysis: yield* Ref.make<ReadonlyArray<StudentAnalysisResult> | undefined>(undefined)
      })
    })
  )
}

/**
 * Verification-only: runs a query as `neondb_owner` rather than
 * `zschool_service`, bypassing `persons`/`enrollments`' RLS entirely. Every
 * ground-truth assertion in this suite ("exactly one Person exists
 * globally", "the count is still 1 after a rejected match") needs this —
 * running it through the ambient `AppSqlLive` connection would itself be
 * RLS-filtered to whatever the *last* `withSchool` call happened to scope
 * to, which is exactly the school-visibility behavior these assertions are
 * trying to look past, not exercise.
 */
const asOwner = <A, E>(effect: Effect.Effect<A, E, SqlClient>): Effect.Effect<A> =>
  effect.pipe(Effect.provide(SqlLive), Effect.orDie)

/** `asOwner`, specialized to a `count(*)::int AS count` query — the shape every ground-truth assertion below needs. */
const ownerCount = (
  build: (sql: SqlClient) => Effect.Effect<ReadonlyArray<{ readonly count: string }>, SqlError>
): Effect.Effect<number> =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [row] = yield* build(sql)
    return Number(row.count)
  }))

/** Every scenario needs at least one school with a resolvable (level, class) target — 1AC under the middle cycle, same as `fr-ped-09`'s courses tests. */
const setupSchoolWithClass = (name: string, academicYearLabel: string) =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES (${name}) RETURNING id`
    const result = yield* instantiateNationalTemplate({
      schoolId: school.id,
      academicYearLabel,
      authorizedCycles: ["middle"]
    }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

    const [level1AC] = yield* withSchool(
      school.id,
      sql<{ id: string }>`SELECT id FROM levels WHERE school_id = ${school.id} AND code = '1AC'`
    ).pipe(Effect.orDie)

    yield* createClass({
      schoolId: school.id,
      academicYearId: result.academicYearId,
      levelId: level1AC.id,
      label: "1AC-1",
      capacity: 30
    }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

    return { schoolId: school.id, academicYearId: result.academicYearId }
  })

const legalAndFinancialQualities = {
  relationshipType: "mother" as const,
  isLegalGuardian: true,
  isFinancialGuardian: true,
  isCustodialGuardian: true,
  isEmergencyContact: true,
  isAuthorizedForPickup: true
}

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ Given, Then, When }) => {
  Given("a student with a Massar code already enrolled at another school", function*() {
    const world = yield* World
    const a = yield* setupSchoolWithClass("Massar school A", "2026-2027")

    const guardianRow: GuardianImportRow = {
      rowId: "g1",
      firstName: "Fatima",
      lastName: "Alaoui",
      dateOfBirth: "1985-01-01",
      mobileNumber: "+212600000001"
    }
    const student: StudentImportRow = {
      rowId: "s1",
      firstName: "Youssef",
      lastName: "Alaoui",
      dateOfBirth: "2014-05-10",
      massarCode: "M100001",
      levelCode: "1AC",
      classLabel: "1AC-1",
      effectiveDate: "2020-01-01",
      guardians: [{ mobileNumber: guardianRow.mobileNumber, qualities: legalAndFinancialQualities }]
    }
    const result = yield* commitImportBatch({
      schoolId: a.schoolId,
      academicYearId: a.academicYearId,
      guardianRows: [guardianRow],
      studentRows: [student]
    }).pipe(Effect.provide(asDirectorOf(a.schoolId)))

    const [row] = result.studentResults
    assert.strictEqual(row.status, "active")
    if (row.status !== "active") throw new Error("unreachable")
    yield* Ref.set(world.existingPersonId, row.studentPersonId)

    const massarCount = yield* ownerCount((sql) =>
      sql`SELECT count(*)::int AS count FROM persons WHERE massar_code = 'M100001'`
    )
    assert.strictEqual(massarCount, 1)

    const b = yield* setupSchoolWithClass("Massar school B", "2026-2027")
    yield* Ref.set(world.schoolId, b.schoolId)
    yield* Ref.set(world.academicYearId, b.academicYearId)
    yield* Ref.set(world.studentRows, [{
      rowId: "s2",
      firstName: "Youssef",
      lastName: "Alaoui",
      dateOfBirth: "2014-05-10",
      massarCode: "M100001",
      levelCode: "1AC",
      classLabel: "1AC-1",
      effectiveDate: "2020-01-01",
      guardians: []
    }])
  })

  When("a second school imports a student row with the same Massar code and no confirmation", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const studentRows = yield* Ref.get(world.studentRows)

    const analysis = yield* analyzeStudentRows(schoolId!, studentRows)
    assert.strictEqual(analysis[0].status, "strong_match_awaiting_confirmation")

    const result = yield* commitImportBatch({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      guardianRows: [],
      studentRows
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
    yield* Ref.set(world.commitResult, result)
  })

  Then("the row is awaiting confirmation and no new Person is created", function*() {
    const world = yield* World
    const result = yield* Ref.get(world.commitResult)
    assert.strictEqual(result!.studentResults[0].status, "awaiting_confirmation")

    const massarCount = yield* ownerCount((sql) =>
      sql`SELECT count(*)::int AS count FROM persons WHERE massar_code = 'M100001'`
    )
    assert.strictEqual(massarCount, 1)
  })

  Given(
    "a student named {string} born on {string} with no Massar code, enrolled at another school",
    function*(fullName, dob) {
      const world = yield* World
      const [firstName, lastName] = fullName.split(" ")
      const a = yield* setupSchoolWithClass("Weak match school A", "2026-2027")

      const result = yield* commitImportBatch({
        schoolId: a.schoolId,
        academicYearId: a.academicYearId,
        guardianRows: [],
        studentRows: [{
          rowId: "s1",
          firstName,
          lastName,
          dateOfBirth: dob,
          levelCode: "1AC",
          classLabel: "1AC-1",
          effectiveDate: "2020-01-01",
          guardians: []
        }]
      }).pipe(Effect.provide(asDirectorOf(a.schoolId)))
      assert.strictEqual(result.studentResults[0].status, "pre_enrolled")

      const b = yield* setupSchoolWithClass("Weak match school B", "2026-2027")
      yield* Ref.set(world.schoolId, b.schoolId)
      yield* Ref.set(world.academicYearId, b.academicYearId)
      yield* Ref.set(world.studentRows, [{
        rowId: "s2",
        firstName,
        lastName,
        dateOfBirth: dob,
        levelCode: "1AC",
        classLabel: "1AC-1",
        effectiveDate: "2020-01-01",
        guardians: []
      }])
    }
  )

  When("another school imports a student row with the same name and date of birth, unconfirmed", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const studentRows = yield* Ref.get(world.studentRows)

    const result = yield* commitImportBatch({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      guardianRows: [],
      studentRows
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
    yield* Ref.set(world.commitResult, result)
  })

  Then("the row commits as a new, separate Person rather than merging", function*() {
    const world = yield* World
    const result = yield* Ref.get(world.commitResult)
    assert.strictEqual(result!.studentResults[0].status, "pre_enrolled")

    const nameCount = yield* ownerCount((sql) =>
      sql`
      SELECT count(*)::int AS count FROM persons WHERE first_name = 'Amina' AND last_name = 'Tazi' AND date_of_birth = '2015-03-01'
    `
    )
    assert.strictEqual(nameCount, 2)
  })

  Given("an import batch with two student rows sharing one guardian's mobile number", function*() {
    const world = yield* World
    const a = yield* setupSchoolWithClass("Siblings school", "2026-2027")
    yield* Ref.set(world.schoolId, a.schoolId)
    yield* Ref.set(world.academicYearId, a.academicYearId)

    const guardianRow: GuardianImportRow = {
      rowId: "g1",
      firstName: "Nadia",
      lastName: "Bennis",
      dateOfBirth: "1980-06-15",
      mobileNumber: "+212600000099"
    }
    yield* Ref.set(world.guardianRows, [guardianRow, guardianRow])
    yield* Ref.set(world.studentRows, [
      {
        rowId: "s1",
        firstName: "Karim",
        lastName: "Bennis",
        dateOfBirth: "2013-01-01",
        levelCode: "1AC",
        classLabel: "1AC-1",
        effectiveDate: "2020-01-01",
        guardians: [{ mobileNumber: guardianRow.mobileNumber, qualities: legalAndFinancialQualities }]
      },
      {
        rowId: "s2",
        firstName: "Salma",
        lastName: "Bennis",
        dateOfBirth: "2015-01-01",
        levelCode: "1AC",
        classLabel: "1AC-1",
        effectiveDate: "2020-01-01",
        guardians: [{ mobileNumber: guardianRow.mobileNumber, qualities: legalAndFinancialQualities }]
      }
    ])
  })

  Given(
    "a student row with an effective date in the past, a resolved class, a legal guardian, and a financial guardian",
    function*() {
      const world = yield* World
      const a = yield* setupSchoolWithClass("Active enrollment school", "2026-2027")
      yield* Ref.set(world.schoolId, a.schoolId)
      yield* Ref.set(world.academicYearId, a.academicYearId)

      const guardianRow: GuardianImportRow = {
        rowId: "g1",
        firstName: "Hassan",
        lastName: "Idrissi",
        dateOfBirth: "1978-02-02",
        mobileNumber: "+212600000010"
      }
      yield* Ref.set(world.guardianRows, [guardianRow])
      yield* Ref.set(world.studentRows, [{
        rowId: "s1",
        firstName: "Omar",
        lastName: "Idrissi",
        dateOfBirth: "2013-09-01",
        levelCode: "1AC",
        classLabel: "1AC-1",
        effectiveDate: "2020-01-01",
        guardians: [{ mobileNumber: guardianRow.mobileNumber, qualities: legalAndFinancialQualities }]
      }])
    }
  )

  Given("a student row with only a legal guardian and no financial guardian", function*() {
    const world = yield* World
    const a = yield* setupSchoolWithClass("Pre-enrolled school", "2026-2027")
    yield* Ref.set(world.schoolId, a.schoolId)
    yield* Ref.set(world.academicYearId, a.academicYearId)

    const guardianRow: GuardianImportRow = {
      rowId: "g1",
      firstName: "Latifa",
      lastName: "Chraibi",
      dateOfBirth: "1982-04-04",
      mobileNumber: "+212600000011"
    }
    yield* Ref.set(world.guardianRows, [guardianRow])
    yield* Ref.set(world.studentRows, [{
      rowId: "s1",
      firstName: "Yassine",
      lastName: "Chraibi",
      dateOfBirth: "2013-09-01",
      levelCode: "1AC",
      classLabel: "1AC-1",
      effectiveDate: "2020-01-01",
      guardians: [{
        mobileNumber: guardianRow.mobileNumber,
        qualities: { ...legalAndFinancialQualities, isFinancialGuardian: false }
      }]
    }])
  })

  When("the batch commits", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const guardianRows = yield* Ref.get(world.guardianRows)
    const studentRows = yield* Ref.get(world.studentRows)

    const result = yield* commitImportBatch({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      guardianRows,
      studentRows
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
    yield* Ref.set(world.commitResult, result)
  })

  Then("exactly one guardian Person is created for that mobile number and both students are linked to it", function*() {
    const world = yield* World
    const result = yield* Ref.get(world.commitResult)
    assert.strictEqual(result!.guardianResults.size, 1)

    const guardian = result!.guardianResults.get("+212600000099")
    assert.isDefined(guardian)
    assert.strictEqual(guardian!.status, "committed")
    if (guardian!.status !== "committed") throw new Error("unreachable")

    const profileCount = yield* ownerCount((sql) =>
      sql`
      SELECT count(*)::int AS count FROM guardian_profiles WHERE mobile_number = '+212600000099'
    `
    )
    assert.strictEqual(profileCount, 1)

    const relationshipCount = yield* ownerCount((sql) =>
      sql`
      SELECT count(*)::int AS count FROM parent_student_relationships WHERE guardian_person_id = ${guardian!.personId}
    `
    )
    assert.strictEqual(relationshipCount, 2)
  })

  Then("the student's enrollment status is {string}", function*(expectedStatus) {
    const world = yield* World
    const result = yield* Ref.get(world.commitResult)
    assert.strictEqual(result!.studentResults[0].status, expectedStatus)
  })

  Given("a student already actively enrolled for this academic year label at another school", function*() {
    const world = yield* World
    const a = yield* setupSchoolWithClass("Duplicate active school A", "2026-2027")

    const guardianRow: GuardianImportRow = {
      rowId: "g1",
      firstName: "Rachid",
      lastName: "Fassi",
      dateOfBirth: "1975-03-03",
      mobileNumber: "+212600000020"
    }
    const student: StudentImportRow = {
      rowId: "s1",
      firstName: "Anas",
      lastName: "Fassi",
      dateOfBirth: "2013-09-01",
      massarCode: "M900001",
      levelCode: "1AC",
      classLabel: "1AC-1",
      effectiveDate: "2020-01-01",
      guardians: [{ mobileNumber: guardianRow.mobileNumber, qualities: legalAndFinancialQualities }]
    }
    const result = yield* commitImportBatch({
      schoolId: a.schoolId,
      academicYearId: a.academicYearId,
      guardianRows: [guardianRow],
      studentRows: [student]
    }).pipe(Effect.provide(asDirectorOf(a.schoolId)))

    const [row] = result.studentResults
    assert.strictEqual(row.status, "active")
    if (row.status !== "active") throw new Error("unreachable")
    yield* Ref.set(world.existingPersonId, row.studentPersonId)

    const b = yield* setupSchoolWithClass("Duplicate active school B", "2026-2027")
    yield* Ref.set(world.schoolId, b.schoolId)
    yield* Ref.set(world.academicYearId, b.academicYearId)
  })

  When("this school commits an active-eligible enrollment for the same underlying person and year", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const existingPersonId = yield* Ref.get(world.existingPersonId)

    const guardianRow: GuardianImportRow = {
      rowId: "g1",
      firstName: "Rachid",
      lastName: "Fassi",
      dateOfBirth: "1975-03-03",
      mobileNumber: "+212600000021"
    }
    const student: StudentImportRow = {
      rowId: "s1",
      firstName: "Anas",
      lastName: "Fassi",
      dateOfBirth: "2013-09-01",
      massarCode: "M900001",
      confirmedMatchPersonId: existingPersonId,
      levelCode: "1AC",
      classLabel: "1AC-1",
      effectiveDate: "2020-01-01",
      guardians: [{ mobileNumber: guardianRow.mobileNumber, qualities: legalAndFinancialQualities }]
    }
    const result = yield* commitImportBatch({
      schoolId: schoolId!,
      academicYearId: academicYearId!,
      guardianRows: [guardianRow],
      studentRows: [student]
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
    yield* Ref.set(world.commitResult, result)
  })

  Then("that row errors instead of creating a second active enrollment", function*() {
    const world = yield* World
    const existingPersonId = yield* Ref.get(world.existingPersonId)
    const result = yield* Ref.get(world.commitResult)
    assert.strictEqual(result!.studentResults[0].status, "error")
    if (result!.studentResults[0].status !== "error") throw new Error("unreachable")
    assert.strictEqual(result!.studentResults[0].error.reason, "DuplicateActiveEnrollmentError")

    const activeCount = yield* ownerCount((sql) =>
      sql`
      SELECT count(*)::int AS count FROM enrollments WHERE student_person_id = ${existingPersonId} AND status = 'active'
    `
    )
    assert.strictEqual(activeCount, 1)
  })

  Given("a guardian import row with an invalid phone number", function*() {
    const world = yield* World
    yield* Ref.set(world.guardianRows, [{
      rowId: "g1",
      firstName: "Yassine",
      lastName: "Amrani",
      dateOfBirth: "1980-01-01",
      mobileNumber: "0600000000"
    }])
  })

  When("the guardian rows are analyzed", function*() {
    const world = yield* World
    const guardianRows = yield* Ref.get(world.guardianRows)
    const analysis = yield* analyzeGuardianRows(guardianRows)
    yield* Ref.set(world.guardianAnalysis, analysis)
  })

  Then("the row is rejected with a reason naming the phone number field", function*() {
    const world = yield* World
    const analysis = yield* Ref.get(world.guardianAnalysis)
    const [row] = analysis!
    assert.strictEqual(row.status, "error")
    if (row.status !== "error") throw new Error("unreachable")
    assert.include(row.error.reason, "mobileNumber")
  })

  Given("a student import row missing a required first name", function*() {
    const world = yield* World
    yield* Ref.set(world.studentRows, [{
      rowId: "s1",
      firstName: "",
      lastName: "Amrani",
      dateOfBirth: "2013-09-01",
      levelCode: "1AC",
      classLabel: "1AC-1",
      effectiveDate: "2020-01-01",
      guardians: []
    }])
  })

  When("the student rows are analyzed", function*() {
    const world = yield* World
    const studentRows = yield* Ref.get(world.studentRows)
    const analysis = yield* analyzeStudentRows("00000000-0000-0000-0000-000000000000", studentRows)
    yield* Ref.set(world.studentAnalysis, analysis)
  })

  Then("the row is rejected with a reason naming the first name field", function*() {
    const world = yield* World
    const analysis = yield* Ref.get(world.studentAnalysis)
    const [row] = analysis!
    assert.strictEqual(row.status, "error")
    if (row.status !== "error") throw new Error("unreachable")
    assert.include(row.error.reason, "firstName")
  })
})
