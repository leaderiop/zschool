import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { SqlLive, withSchool } from "@zschool/db"
import {
  addFeeItem,
  adjustInstallment,
  createFeeSchedule,
  findInstallments,
  insertEnrollment
} from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-03-payment-schedule.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly levelId: Ref.Ref<string | undefined>
  readonly classId: Ref.Ref<string | undefined>
  readonly feeScheduleId: Ref.Ref<string | undefined>
  readonly enrollmentId: Ref.Ref<string | undefined>
  readonly adjustedInstallmentId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        levelId: yield* Ref.make<string | undefined>(undefined),
        classId: yield* Ref.make<string | undefined>(undefined),
        feeScheduleId: yield* Ref.make<string | undefined>(undefined),
        enrollmentId: yield* Ref.make<string | undefined>(undefined),
        adjustedInstallmentId: yield* Ref.make<string | undefined>(undefined)
      })
    })
  )
}

/** Same reasoning as `fr-ped-24-historical-grade-import.steps.test.ts`'s own `asOwner`. */
const asOwner = <A, E>(effect: Effect.Effect<A, E, SqlClient>): Effect.Effect<A> =>
  effect.pipe(Effect.provide(SqlLive), Effect.orDie)

const seedSchoolWithClass = () =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`
      INSERT INTO schools (name) VALUES ('Payment schedule feature school') RETURNING id
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
    return { schoolId: school.id, academicYearId: year.id, levelId: level.id, classId: cls.id }
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

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ Given, Then, When }) => {
  Given("a school with a fee schedule for a level with a monthly tuition line and a one-time registration line", function*() {
    const world = yield* World
    const seed = yield* seedSchoolWithClass()
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.academicYearId, seed.academicYearId)
    yield* Ref.set(world.levelId, seed.levelId)
    yield* Ref.set(world.classId, seed.classId)

    const feeScheduleId = yield* createFeeSchedule({
      schoolId: seed.schoolId,
      academicYearId: seed.academicYearId,
      levelId: seed.levelId
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
    yield* Ref.set(world.feeScheduleId, feeScheduleId)

    yield* addFeeItem({
      schoolId: seed.schoolId,
      feeScheduleId,
      nature: "tuition",
      labelFr: "Scolarité",
      labelAr: "الرسوم الدراسية",
      frequency: "monthly",
      amountMad: 1200,
      isMandatory: true
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)

    yield* addFeeItem({
      schoolId: seed.schoolId,
      feeScheduleId,
      nature: "registration",
      labelFr: "Inscription",
      labelAr: "التسجيل",
      frequency: "one_time",
      amountMad: 500,
      isMandatory: true
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
  })

  When("a student is enrolled in that level from the start of the school year", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const classId = yield* Ref.get(world.classId)
    const studentPersonId = yield* createStudent("Yasmine")

    const enrollment = yield* withSchool(
      schoolId!,
      insertEnrollment({
        schoolId: schoolId!,
        academicYearId: academicYearId!,
        studentPersonId,
        classId: classId!,
        effectiveDate: "2026-09-01",
        hasLegalGuardian: false,
        hasFinancialGuardian: false
      })
    ).pipe(Effect.orDie)
    yield* Ref.set(world.enrollmentId, enrollment.id)
  })

  Then("the payment schedule holds 10 monthly tuition installments and 1 registration installment", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const installments = yield* findInstallments(schoolId!, enrollmentId!).pipe(Effect.orDie)
    assert.strictEqual(installments.filter((i) => i.amount_mad === 1200).length, 10)
    assert.strictEqual(installments.filter((i) => i.amount_mad === 500).length, 1)
  })

  Then("every installment starts with status {string}", function*(expectedStatus) {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const installments = yield* findInstallments(schoolId!, enrollmentId!).pipe(Effect.orDie)
    assert.ok(installments.every((i) => i.status === expectedStatus))
  })

  When("a student is enrolled in that level partway through the school year", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const classId = yield* Ref.get(world.classId)
    const studentPersonId = yield* createStudent("Hamza")

    const enrollment = yield* withSchool(
      schoolId!,
      insertEnrollment({
        schoolId: schoolId!,
        academicYearId: academicYearId!,
        studentPersonId,
        classId: classId!,
        effectiveDate: "2026-11-15",
        hasLegalGuardian: false,
        hasFinancialGuardian: false
      })
    ).pipe(Effect.orDie)
    yield* Ref.set(world.enrollmentId, enrollment.id)
  })

  Then("the payment schedule's earliest tuition installment is due in the student's own start month", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const installments = yield* findInstallments(schoolId!, enrollmentId!).pipe(Effect.orDie)
    const tuitionInstallments = installments.filter((i) => i.amount_mad === 1200)
    assert.strictEqual(tuitionInstallments.length, 8) // November through June
    assert.strictEqual(tuitionInstallments[0].due_date, "2026-11-01")
  })

  Given("a school with a level and no fee schedule yet", function*() {
    const world = yield* World
    const seed = yield* seedSchoolWithClass()
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.academicYearId, seed.academicYearId)
    yield* Ref.set(world.levelId, seed.levelId)
    yield* Ref.set(world.classId, seed.classId)
  })

  When("a student is enrolled in that level", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const classId = yield* Ref.get(world.classId)
    const studentPersonId = yield* createStudent("Nadia")

    const enrollment = yield* withSchool(
      schoolId!,
      insertEnrollment({
        schoolId: schoolId!,
        academicYearId: academicYearId!,
        studentPersonId,
        classId: classId!,
        effectiveDate: "2026-09-01",
        hasLegalGuardian: false,
        hasFinancialGuardian: false
      })
    ).pipe(Effect.orDie)
    yield* Ref.set(world.enrollmentId, enrollment.id)
  })

  Then("the enrollment succeeds and the payment schedule is empty", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    assert.isDefined(enrollmentId)
    const installments = yield* findInstallments(schoolId!, enrollmentId!).pipe(Effect.orDie)
    assert.strictEqual(installments.length, 0)
  })

  Given("a student enrolled in that level from the start of the school year", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const classId = yield* Ref.get(world.classId)
    const studentPersonId = yield* createStudent("Yasmine")

    const enrollment = yield* withSchool(
      schoolId!,
      insertEnrollment({
        schoolId: schoolId!,
        academicYearId: academicYearId!,
        studentPersonId,
        classId: classId!,
        effectiveDate: "2026-09-01",
        hasLegalGuardian: false,
        hasFinancialGuardian: false
      })
    ).pipe(Effect.orDie)
    yield* Ref.set(world.enrollmentId, enrollment.id)
  })

  When("the director adjusts one tuition installment's amount with a reason", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const installments = yield* findInstallments(schoolId!, enrollmentId!).pipe(Effect.orDie)
    const target = installments.find((i) => i.amount_mad === 1200)!

    yield* adjustInstallment(schoolId!, target.id, {
      amountMad: 900,
      reason: "Director-approved discount"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)

    yield* Ref.set(world.adjustedInstallmentId, target.id)
  })

  Then("the installment carries the new amount", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const installmentId = yield* Ref.get(world.adjustedInstallmentId)
    const installments = yield* findInstallments(schoolId!, enrollmentId!).pipe(Effect.orDie)
    const target = installments.find((i) => i.id === installmentId)!
    assert.strictEqual(target.amount_mad, 900)
  })

  Then("the adjustment is traced with the previous amount and the reason", function*() {
    const world = yield* World
    const installmentId = yield* Ref.get(world.adjustedInstallmentId)
    const [adjustment] = yield* asOwner(Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* sql<{ previous_amount_mad: string; new_amount_mad: string; reason: string }>`
        SELECT previous_amount_mad, new_amount_mad, reason FROM installment_adjustments
        WHERE installment_id = ${installmentId}
      `
    }))
    assert.strictEqual(Number(adjustment.previous_amount_mad), 1200)
    assert.strictEqual(Number(adjustment.new_amount_mad), 900)
    assert.strictEqual(adjustment.reason, "Director-approved discount")
  })
})
