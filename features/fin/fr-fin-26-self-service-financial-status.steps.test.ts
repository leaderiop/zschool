import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import {
  addFeeItem,
  createFeeSchedule,
  createPerson,
  designateFinancialGuardian,
  findMyChildrenFinancialStatus,
  GuardianPersonId,
  GuardianQualitiesSchema,
  insertEnrollment,
  recordGuardianRelationship,
  recordPayment,
  StudentPersonId
} from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf, asFinancialGuardian } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"
import { asOwner } from "./payment-collection-support.ts"

const feature = await loadFeature(
  fileURLToPath(new URL("./fr-fin-26-self-service-financial-status.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly guardianPersonId: Ref.Ref<string | undefined>
  readonly schoolIds: Ref.Ref<ReadonlyArray<string> | undefined>
  readonly fatherPersonId: Ref.Ref<string | undefined>
  readonly salmaSchoolId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        guardianPersonId: yield* Ref.make<string | undefined>(undefined),
        schoolIds: yield* Ref.make<ReadonlyArray<string> | undefined>(undefined),
        fatherPersonId: yield* Ref.make<string | undefined>(undefined),
        salmaSchoolId: yield* Ref.make<string | undefined>(undefined)
      })
    })
  )
}

/**
 * One school -> year -> section -> cycle -> level -> class -> a monthly-
 * tuition fee schedule, one student enrolled under the given (already
 * created) guardian, designated their financial guardian. No mobile number
 * seeded — this ticket's own cross-tenant lookup
 * (`find_financial_accounts_for_guardian`, migration 0022) resolves a
 * guardian's schools from `financial_guardian_designations`/
 * `financial_account_payers` directly, never from mobile matching, so this
 * scenario needs none of the fixture-uniqueness care that involves.
 *
 * `qualities` is a parameter (not always the full-rights default every other
 * `fr-fin-*` seed uses) so the second scenario can seed a father who holds
 * ONLY the financial-guardian quality — this feature's own "restricted
 * parental access" scenario, scoped down per this module's own doc comment:
 * no other-domain access-restriction concept exists in this codebase to
 * actually restrict, so the seed demonstrates the one guarantee this ticket
 * DOES own — a financial-only relationship still carries full financial
 * self-service access.
 */
const seedChildForGuardian = (
  schoolName: string,
  guardianPersonId: string,
  studentName: string,
  tuitionAmountMad: number,
  qualities: {
    readonly isLegalGuardian: boolean
    readonly isCustodialGuardian: boolean
    readonly isEmergencyContact: boolean
    readonly isAuthorizedForPickup: boolean
  } = { isLegalGuardian: true, isCustodialGuardian: true, isEmergencyContact: true, isAuthorizedForPickup: true }
) =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES (${schoolName}) RETURNING id`
    return yield* withSchool(
      school.id,
      Effect.gen(function*() {
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

        const feeScheduleId = yield* createFeeSchedule({
          schoolId: school.id,
          academicYearId: year.id,
          levelId: level.id
        }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)
        yield* addFeeItem({
          schoolId: school.id,
          feeScheduleId,
          nature: "tuition",
          labelFr: "Scolarité",
          labelAr: "الرسوم الدراسية",
          frequency: "monthly",
          amountMad: tuitionAmountMad,
          isMandatory: true
        }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

        const studentPersonId = yield* sql<{ id: string }>`
          INSERT INTO persons (id, first_name, last_name, date_of_birth)
          VALUES (gen_random_uuid(), ${studentName}, 'Student', '2015-01-01') RETURNING id
        `.pipe(Effect.map((rows) => rows[0].id))

        const decodedQualities = yield* Schema.decodeEffect(GuardianQualitiesSchema)({
          relationshipType: "father",
          isFinancialGuardian: true,
          ...qualities
        }).pipe(Effect.orDie)
        yield* recordGuardianRelationship(
          GuardianPersonId.make(guardianPersonId),
          StudentPersonId.make(studentPersonId),
          decodedQualities
        ).pipe(Effect.orDie)

        const enrollment = yield* insertEnrollment({
          schoolId: school.id,
          academicYearId: year.id,
          studentPersonId,
          classId: cls.id,
          effectiveDate: "2026-09-01",
          // The enrollment-intake attestation ("a legal guardian is on
          // file") is independent of THIS relationship's own
          // `isLegalGuardian` quality — always true here so the enrollment
          // activates and its payment schedule generates regardless of
          // which quality flags this particular guardian's relationship
          // carries.
          hasLegalGuardian: true,
          hasFinancialGuardian: true
        }).pipe(Effect.orDie)

        yield* designateFinancialGuardian(school.id, enrollment.id, guardianPersonId).pipe(
          Effect.provide(asDirectorOf(school.id)),
          Effect.orDie
        )

        const [financialAccount] = yield* sql<{ id: string }>`
          SELECT id FROM financial_accounts WHERE enrollment_id = ${enrollment.id}
        `

        return { schoolId: school.id, enrollmentId: enrollment.id, financialAccountId: financialAccount.id }
      })
    )
  }))

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("Ahmed, financial guardian of Youssef and Sara \\(School A) and of Adam \\(School B)", function*() {
    const world = yield* World
    const guardianPersonId = yield* createPerson({
      firstName: "Ahmed",
      lastName: "Guardian",
      dateOfBirth: "1980-01-01"
    }).pipe(Effect.orDie)

    const childA1 = yield* seedChildForGuardian("Self-service School A", guardianPersonId, "Youssef", 1200)
    const childA2 = yield* seedChildForGuardian("Self-service School A", guardianPersonId, "Sara", 1000)
    const childB = yield* seedChildForGuardian("Self-service School B", guardianPersonId, "Adam", 900)

    // A confirmed payment on one child, so "he downloads each payment's
    // receipt" has a real receipt to check.
    yield* recordPayment({
      schoolId: childA1.schoolId,
      method: "cash",
      amountMad: 1200,
      valueDate: "2026-09-01",
      reference: null,
      financialAccountIds: [childA1.financialAccountId]
    }).pipe(Effect.provide(asDirectorOf(childA1.schoolId)), Effect.orDie)

    yield* Ref.set(world.guardianPersonId, guardianPersonId)
    yield* Ref.set(world.schoolIds, [childA1.schoolId, childA2.schoolId, childB.schoolId])
  })

  When("he opens the \"Payments\" tab of his account", function*() {
    // No UI exists yet — the "tab" is realized as the read call itself,
    // exercised directly in the Then step below (same "check the underlying
    // read, not a not-yet-built screen" treatment every other `fr-fin-*`
    // scenario already gives a UI action).
  })

  Then(
    "he sees, per child and per school, the payment schedule, the next installment and the balance, with an aggregated total",
    function*() {
      const world = yield* World
      const guardianPersonId = yield* Ref.get(world.guardianPersonId)
      const schoolIds = yield* Ref.get(world.schoolIds)

      const status = yield* findMyChildrenFinancialStatus(guardianPersonId!).pipe(
        Effect.provide(asFinancialGuardian(guardianPersonId!))
      )

      // Three children, spanning both School A and School B, in one result.
      assert.strictEqual(status.length, 3)
      const seenSchoolIds = new Set(status.map((entry) => entry.schoolId))
      for (const schoolId of schoolIds!) assert.ok(seenSchoolIds.has(schoolId))

      for (const entry of status) {
        assert.ok(entry.installments.length > 0)
        assert.ok(typeof entry.balanceOwedMad === "number")
      }

      const aggregatedTotal = status.reduce((sum, entry) => sum + entry.balanceOwedMad, 0)
      assert.ok(aggregatedTotal > 0)
    }
  )

  And("he downloads each payment's receipt", function*() {
    // "downloads" — no document-delivery module exists yet (out of scope,
    // same boundary every other finance ticket's own "sent to guardian"/
    // "downloadable receipt" steps already draw). What's checked here is
    // that the payment recorded in the Given step is actually present in
    // this guardian's OWN payment history with a real, issued receipt
    // number attached — the data a download action would need.
    const world = yield* World
    const guardianPersonId = yield* Ref.get(world.guardianPersonId)

    const status = yield* findMyChildrenFinancialStatus(guardianPersonId!).pipe(
      Effect.provide(asFinancialGuardian(guardianPersonId!))
    )
    const withPayments = status.filter((entry) => entry.paymentHistory.length > 0)
    assert.strictEqual(withPayments.length, 1)
    assert.ok(withPayments[0].paymentHistory[0].receiptNumber !== null)
  })

  Given("Salma, an adult, who has restricted parental access to school data", function*() {
    const world = yield* World
    const fatherPersonId = yield* createPerson({
      firstName: "Rachid",
      lastName: "Father",
      dateOfBirth: "1975-01-01"
    }).pipe(Effect.orDie)

    // "restricted parental access" — no such concept exists elsewhere in
    // this codebase (nothing in `Identity.ts` models a general access
    // restriction). The father's relationship here carries ONLY the
    // financial-guardian quality, everything else false — the closest real
    // seed this codebase can express for "restricted" access, and
    // `GuardianSelfService.ts`'s own authorization is keyed on
    // `isFinancialGuardian` alone regardless, so this is also the accurate
    // one to seed.
    const child = yield* seedChildForGuardian(
      "Self-service adult student school",
      fatherPersonId,
      "Salma",
      1500,
      { isLegalGuardian: false, isCustodialGuardian: false, isEmergencyContact: false, isAuthorizedForPickup: false }
    )

    yield* Ref.set(world.fatherPersonId, fatherPersonId)
    yield* Ref.set(world.salmaSchoolId, child.schoolId)
  })

  When("her father, the financial guardian, opens her financial status", function*() {
    const world = yield* World
    const fatherPersonId = yield* Ref.get(world.fatherPersonId)
    const status = yield* findMyChildrenFinancialStatus(fatherPersonId!).pipe(
      Effect.provide(asFinancialGuardian(fatherPersonId!))
    )
    yield* Ref.set(world.guardianPersonId, fatherPersonId)
    yield* Ref.set(world.schoolIds, status.map((entry) => entry.schoolId))
  })

  Then("Salma's payment schedule and receipts stay visible to him as long as he owes money", function*() {
    const world = yield* World
    const fatherPersonId = yield* Ref.get(world.fatherPersonId)
    const salmaSchoolId = yield* Ref.get(world.salmaSchoolId)

    const status = yield* findMyChildrenFinancialStatus(fatherPersonId!).pipe(
      Effect.provide(asFinancialGuardian(fatherPersonId!))
    )
    const salma = status.find((entry) => entry.schoolId === salmaSchoolId)
    assert.ok(salma !== undefined)
    // Nothing has been paid yet — the whole schedule is still owed, and
    // stays reachable through the father's own financial-guardian access.
    assert.ok(salma!.balanceOwedMad > 0)
    assert.ok(salma!.installments.length > 0)
  })
})
