import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import {
  addFeeItem,
  attachGuardianProfile,
  closeEnrollment,
  confirmPayment,
  createFeeSchedule,
  createPerson,
  designateFinancialGuardian,
  findReceiptForPayment,
  GuardianPersonId,
  GuardianQualitiesSchema,
  insertEnrollment,
  recordBankTransfer,
  recordGuardianRelationship,
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
import { asOwner } from "./payment-collection-support.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-23-balance-survives-closing.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly enrollmentId: Ref.Ref<string | undefined>
  readonly financialAccountId: Ref.Ref<string | undefined>
  readonly installmentId: Ref.Ref<string | undefined>
  readonly paymentId: Ref.Ref<string | undefined>
  readonly enrollmentCountBefore: Ref.Ref<number | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        enrollmentId: yield* Ref.make<string | undefined>(undefined),
        financialAccountId: yield* Ref.make<string | undefined>(undefined),
        installmentId: yield* Ref.make<string | undefined>(undefined),
        paymentId: yield* Ref.make<string | undefined>(undefined),
        enrollmentCountBefore: yield* Ref.make<number | undefined>(undefined)
      })
    })
  )
}

/**
 * A dedicated seed (not `payment-collection-support.ts`'s shared
 * `seedStudentWithDueInstallment`, which hardcodes `TUITION_AMOUNT_MAD`,
 * 1,200 DH — this scenario's own wording is fixed at 1,500 DH): a school with
 * a 1,500-DH monthly-tuition fee schedule, one enrolled student whose
 * enrollment is already ACTIVE and due, then immediately closed (ticket #58's
 * `closeEnrollment`, reusing the single `'completed'` status with a free-text
 * `closure_reason` rather than a dedicated `TRANSFERRED` literal — see that
 * function's own doc comment).
 */
const seedClosedEnrollmentWithDueBalance = asOwner(Effect.gen(function*() {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Balance survives closing feature school') RETURNING id
  `
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
        amountMad: 1500,
        isMandatory: true
      }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

      const studentPersonId = yield* sql<{ id: string }>`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (gen_random_uuid(), 'Nadia', 'Student', '2015-01-01') RETURNING id
      `.pipe(Effect.map((rows) => rows[0].id))

      const guardianPersonId = yield* createPerson({
        firstName: "Rachid",
        lastName: "Guardian",
        dateOfBirth: "1980-01-01"
      }).pipe(Effect.orDie)
      // A dedicated block, unused by any other `.steps.test.ts`/`.test.ts`
      // file — see `feedback_zschool_bdd_fixture_uniqueness.md` on why a
      // reused number bleeds across scenarios in the shared BDD container.
      yield* attachGuardianProfile(guardianPersonId, "+212700000301").pipe(Effect.orDie)
      const qualities = yield* Schema.decodeEffect(GuardianQualitiesSchema)({
        relationshipType: "father",
        isLegalGuardian: true,
        isFinancialGuardian: true,
        isCustodialGuardian: true,
        isEmergencyContact: true,
        isAuthorizedForPickup: true
      }).pipe(Effect.orDie)
      yield* recordGuardianRelationship(
        GuardianPersonId.make(guardianPersonId),
        StudentPersonId.make(studentPersonId),
        qualities
      ).pipe(Effect.orDie)

      const enrollment = yield* insertEnrollment({
        schoolId: school.id,
        academicYearId: year.id,
        studentPersonId,
        classId: cls.id,
        effectiveDate: "2026-09-01",
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
      const [installment] = yield* sql<{ id: string }>`
        SELECT id FROM installments WHERE financial_account_id = ${financialAccount.id} ORDER BY due_date ASC LIMIT 1
      `
      const [{ count: enrollmentCountBefore }] = yield* sql<{ count: string }>`
        SELECT count(*)::bigint AS count FROM enrollments WHERE student_person_id = ${studentPersonId}
      `

      yield* closeEnrollment(school.id, enrollment.id, "Transferred to another school").pipe(
        Effect.provide(asDirectorOf(school.id)),
        Effect.orDie
      )

      return {
        schoolId: school.id,
        enrollmentId: enrollment.id,
        financialAccountId: financialAccount.id,
        installmentId: installment.id,
        enrollmentCountBefore: Number(enrollmentCountBefore)
      }
    })
  )
}))

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("a student whose enrollment moved to TRANSFERRED status with 1,500 DH still due", function*() {
    const world = yield* World
    const seed = yield* seedClosedEnrollmentWithDueBalance
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.enrollmentId, seed.enrollmentId)
    yield* Ref.set(world.financialAccountId, seed.financialAccountId)
    yield* Ref.set(world.installmentId, seed.installmentId)
    yield* Ref.set(world.enrollmentCountBefore, seed.enrollmentCountBefore)
  })

  When("accounting records a 1,500-DH bank transfer against this closed enrollment's account", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const financialAccountId = yield* Ref.get(world.financialAccountId)

    const paymentId = yield* recordBankTransfer({
      schoolId: schoolId!,
      amountMad: 1500,
      valueDate: "2026-09-10",
      reference: "SETTLEMENT-AFTER-DEPARTURE"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
    yield* confirmPayment(schoolId!, paymentId, [financialAccountId!]).pipe(
      Effect.provide(asDirectorOf(schoolId!)),
      Effect.orDie
    )
    yield* Ref.set(world.paymentId, paymentId)
  })

  Then("the payment is accepted with no new enrollment created", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const enrollmentCountBefore = yield* Ref.get(world.enrollmentCountBefore)

    const [{ enrollment_id: paymentAccountEnrollmentId }] = yield* withSchool(
      schoolId!,
      sql<{ enrollment_id: string }>`
        SELECT enrollment_id FROM financial_accounts WHERE id = ${(yield* Ref.get(world.financialAccountId))!}
      `
    )
    assert.strictEqual(paymentAccountEnrollmentId, enrollmentId)

    const [{ count: enrollmentCountAfter }] = yield* withSchool(
      schoolId!,
      sql<{ count: string }>`
        SELECT count(*)::bigint AS count FROM enrollments
        WHERE student_person_id = (SELECT student_person_id FROM enrollments WHERE id = ${enrollmentId!})
      `
    )
    assert.strictEqual(Number(enrollmentCountAfter), enrollmentCountBefore)
  })

  And("the balance drops to zero \\(account settled) with a numbered receipt", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const installmentId = yield* Ref.get(world.installmentId)
    const paymentId = yield* Ref.get(world.paymentId)

    const [{ status }] = yield* withSchool(
      schoolId!,
      sql<{ status: string }>`SELECT status FROM installments WHERE id = ${installmentId!}`
    )
    assert.strictEqual(status, "paid")

    const receipt = yield* findReceiptForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(receipt))
  })

  Then("the file leaves the unpaid-balances table and the operation is logged", function*() {
    // No dedicated unpaid-balances read model exists on this branch yet
    // (ticket #62's own scope, developed in parallel) — this scenario only
    // needs the underlying facts the eventual view would surface: nothing
    // actually due as of the settlement's value date is left unpaid on this
    // account (the fee schedule's later, not-yet-due monthly installments
    // are a separate concern, not part of "the file leaves the
    // unpaid-balances table"), checked directly below — the same "check the
    // fact, not a not-yet-built view" treatment
    // `fr-fin-13-bank-transfer.steps.test.ts`'s own "unpaid-balances table"
    // step already gives.
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const financialAccountId = yield* Ref.get(world.financialAccountId)
    const paymentId = yield* Ref.get(world.paymentId)

    const [{ count: unpaidCount }] = yield* withSchool(
      schoolId!,
      sql<{ count: string }>`
        SELECT count(*)::bigint AS count FROM installments
        WHERE financial_account_id = ${financialAccountId!} AND status != 'paid' AND due_date <= '2026-09-10'
      `
    )
    assert.strictEqual(Number(unpaidCount), 0)

    // "logged": the payment row itself carries who collected it and when.
    const [payment] = yield* withSchool(
      schoolId!,
      sql<{ collector_subject_id: string; created_at: string }>`
        SELECT collector_subject_id, created_at::text FROM payments WHERE id = ${paymentId!}
      `
    )
    assert.ok(payment.collector_subject_id.length > 0)
    assert.ok(payment.created_at.length > 0)
  })
})
