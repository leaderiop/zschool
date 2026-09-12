import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { SqlLive, withSchool } from "@zschool/db"
import {
  attachGuardianProfile,
  createPerson,
  createThirdPartyPayer,
  designateFinancialGuardian,
  findCurrentFinancialGuardian,
  findFinancialAccountPayers,
  GuardianPersonId,
  GuardianQualitiesSchema,
  insertEnrollment,
  recordGuardianRelationship,
  splitFinancialResponsibility,
  StudentPersonId
} from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-02-financial-guardian.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly enrollmentId: Ref.Ref<string | undefined>
  readonly studentPersonId: Ref.Ref<string | undefined>
  readonly guardianPersonIds: Ref.Ref<ReadonlyArray<string>>
  readonly refusalError: Ref.Ref<{ readonly _tag: string } | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        enrollmentId: yield* Ref.make<string | undefined>(undefined),
        studentPersonId: yield* Ref.make<string | undefined>(undefined),
        guardianPersonIds: yield* Ref.make<ReadonlyArray<string>>([]),
        refusalError: yield* Ref.make<{ readonly _tag: string } | undefined>(undefined)
      })
    })
  )
}

/** Same reasoning as `fr-ped-24-historical-grade-import.steps.test.ts`'s own `asOwner`. */
const asOwner = <A, E>(effect: Effect.Effect<A, E, SqlClient>): Effect.Effect<A> =>
  effect.pipe(Effect.provide(SqlLive), Effect.orDie)

/** Same school -> year -> section -> cycle -> level -> class chain as `FinancialAccount.test.ts`'s own `withSeededEnrollment`, without the pre-existing guardian relationship (each scenario adds whichever guardians it needs). */
const seedSchoolWithClass = () =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`
      INSERT INTO schools (name) VALUES ('Financial guardian feature school') RETURNING id
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
    const [cls] = yield* sql<{ id: string }>`
      INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
      VALUES (${school.id}, ${year.id}, ${level.id}, '6AP-1', 30) RETURNING id
    `
    return { schoolId: school.id, academicYearId: year.id, classId: cls.id }
  }))

const createStudent = (name: string) =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [row] = yield* sql<{ id: string }>`
      INSERT INTO persons (id, first_name, last_name, date_of_birth)
      VALUES (gen_random_uuid(), ${name}, 'Student', '2015-01-01') RETURNING id
    `
    return row.id
  }))

const createGuardianWithRelationship = (studentPersonId: string, name: string, mobileNumber: string) =>
  Effect.gen(function*() {
    const guardianPersonId = yield* createPerson({ firstName: name, lastName: "Guardian", dateOfBirth: "1985-01-01" })
    yield* attachGuardianProfile(guardianPersonId, mobileNumber)
    const qualities = yield* Schema.decodeEffect(GuardianQualitiesSchema)({
      relationshipType: "father",
      isLegalGuardian: true,
      isFinancialGuardian: true,
      isCustodialGuardian: true,
      isEmergencyContact: true,
      isAuthorizedForPickup: true
    })
    yield* recordGuardianRelationship(
      yield* Schema.decodeEffect(GuardianPersonId)(guardianPersonId),
      yield* Schema.decodeEffect(StudentPersonId)(studentPersonId),
      qualities
    )
    return guardianPersonId
  }).pipe(Effect.orDie)

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ Given, Then, When }) => {
  Given("a school with an active enrollment", function*() {
    const world = yield* World
    const seed = yield* seedSchoolWithClass()
    const studentPersonId = yield* createStudent("Yasmine")
    const enrollment = yield* withSchool(seed.schoolId, insertEnrollment({
      schoolId: seed.schoolId,
      academicYearId: seed.academicYearId,
      studentPersonId,
      classId: seed.classId,
      effectiveDate: "2026-09-01",
      hasLegalGuardian: false,
      hasFinancialGuardian: false
    })).pipe(Effect.orDie)

    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.studentPersonId, studentPersonId)
    yield* Ref.set(world.enrollmentId, enrollment.id)
  })

  Then("the enrollment has exactly one FinancialAccount", function*() {
    const world = yield* World
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const count = yield* asOwner(Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{ count: string }>`
        SELECT count(*)::int AS count FROM financial_accounts WHERE enrollment_id = ${enrollmentId}
      `
      return Number(row.count)
    }))
    assert.strictEqual(count, 1)
  })

  Given("a school with an active enrollment and its legal guardian on file", function*() {
    const world = yield* World
    const seed = yield* seedSchoolWithClass()
    const studentPersonId = yield* createStudent("Yasmine")
    const guardianId = yield* createGuardianWithRelationship(studentPersonId, "Karim", "+212600000001")
    const enrollment = yield* withSchool(seed.schoolId, insertEnrollment({
      schoolId: seed.schoolId,
      academicYearId: seed.academicYearId,
      studentPersonId,
      classId: seed.classId,
      effectiveDate: "2026-09-01",
      hasLegalGuardian: true,
      hasFinancialGuardian: true
    })).pipe(Effect.orDie)

    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.studentPersonId, studentPersonId)
    yield* Ref.set(world.enrollmentId, enrollment.id)
    yield* Ref.set(world.guardianPersonIds, [guardianId])
  })

  When("the director designates the guardian as financial guardian", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const [guardianId] = yield* Ref.get(world.guardianPersonIds)
    yield* designateFinancialGuardian(schoolId!, enrollmentId!, guardianId).pipe(
      Effect.provide(asDirectorOf(schoolId!)),
      Effect.orDie
    )
  })

  When("the director later designates a different guardian on file as financial guardian", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const studentPersonId = yield* Ref.get(world.studentPersonId)
    const existing = yield* Ref.get(world.guardianPersonIds)

    const secondGuardianId = yield* createGuardianWithRelationship(studentPersonId!, "Salma", "+212600000002")
    yield* designateFinancialGuardian(schoolId!, enrollmentId!, secondGuardianId).pipe(
      Effect.provide(asDirectorOf(schoolId!)),
      Effect.orDie
    )
    yield* Ref.set(world.guardianPersonIds, [...existing, secondGuardianId])
  })

  Then("the current financial guardian is the most recently designated one", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const guardians = yield* Ref.get(world.guardianPersonIds)
    const current = yield* findCurrentFinancialGuardian(schoolId!, enrollmentId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(current))
    if (Option.isSome(current)) assert.strictEqual(current.value.guardian_person_id, guardians.at(-1))
  })

  Then("both designations remain in the trace", function*() {
    const world = yield* World
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const count = yield* asOwner(Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{ count: string }>`
        SELECT count(*)::int AS count FROM financial_guardian_designations d
        JOIN financial_accounts a ON a.id = d.financial_account_id
        WHERE a.enrollment_id = ${enrollmentId}
      `
      return Number(row.count)
    }))
    assert.strictEqual(count, 2)
  })

  When("the director registers a third-party payer as financial guardian", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const thirdPartyId = yield* createThirdPartyPayer(schoolId!, enrollmentId!, {
      firstName: "Ahmed",
      lastName: "Sponsor",
      dateOfBirth: "1970-01-01",
      mobileNumber: "+212600000099"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
    yield* Ref.set(world.guardianPersonIds, [thirdPartyId])
  })

  Then("the third party carries only the financial-guardian quality and no academic access", function*() {
    const world = yield* World
    const [thirdPartyId] = yield* Ref.get(world.guardianPersonIds)
    const relationship = yield* asOwner(Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{
        relationship_type: string
        is_financial_guardian: boolean
        is_legal_guardian: boolean
      }>`
        SELECT relationship_type, is_financial_guardian, is_legal_guardian
        FROM parent_student_relationships WHERE guardian_person_id = ${thirdPartyId}
      `
      return row
    }))
    assert.strictEqual(relationship.relationship_type, "third_party_payer")
    assert.strictEqual(relationship.is_financial_guardian, true)
    assert.strictEqual(relationship.is_legal_guardian, false)
  })

  Given("a school with an active enrollment and two guardians on file", function*() {
    const world = yield* World
    const seed = yield* seedSchoolWithClass()
    const studentPersonId = yield* createStudent("Yasmine")
    const firstGuardianId = yield* createGuardianWithRelationship(studentPersonId, "Karim", "+212600000003")
    const secondGuardianId = yield* createGuardianWithRelationship(studentPersonId, "Salma", "+212600000004")
    const enrollment = yield* withSchool(seed.schoolId, insertEnrollment({
      schoolId: seed.schoolId,
      academicYearId: seed.academicYearId,
      studentPersonId,
      classId: seed.classId,
      effectiveDate: "2026-09-01",
      hasLegalGuardian: true,
      hasFinancialGuardian: true
    })).pipe(Effect.orDie)

    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.studentPersonId, studentPersonId)
    yield* Ref.set(world.enrollmentId, enrollment.id)
    yield* Ref.set(world.guardianPersonIds, [firstGuardianId, secondGuardianId])
  })

  When("the director splits financial responsibility 60 percent and 40 percent between the two guardians", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const [firstGuardianId, secondGuardianId] = yield* Ref.get(world.guardianPersonIds)

    yield* splitFinancialResponsibility(schoolId!, enrollmentId!, [
      { guardianPersonId: firstGuardianId, splitType: "percentage", splitValue: 60 },
      { guardianPersonId: secondGuardianId, splitType: "percentage", splitValue: 40 }
    ]).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
  })

  Then("the account's payer split totals 100 percent across both guardians", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const payers = yield* findFinancialAccountPayers(schoolId!, enrollmentId!).pipe(Effect.orDie)
    assert.strictEqual(payers.length, 2)
    const total = payers.reduce((sum, payer) => sum + payer.split_value, 0)
    assert.strictEqual(total, 100)
  })

  When("the director tries to split financial responsibility with a single 60 percent share", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const [guardianId] = yield* Ref.get(world.guardianPersonIds)

    const result = yield* splitFinancialResponsibility(schoolId!, enrollmentId!, [
      { guardianPersonId: guardianId, splitType: "percentage", splitValue: 60 }
    ]).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.result)

    if (result._tag === "Failure") {
      yield* Ref.set(world.refusalError, result.failure)
    }
  })

  Then("the split is refused", function*() {
    const world = yield* World
    const error = yield* Ref.get(world.refusalError)
    assert.strictEqual(error?._tag, "InvalidSplitError")
  })
})
