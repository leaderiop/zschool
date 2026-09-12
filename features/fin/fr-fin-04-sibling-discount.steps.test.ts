import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { SqlLive, withSchool } from "@zschool/db"
import {
  addFeeItem,
  closeEnrollment,
  configureSiblingDiscountPolicy,
  createFeeSchedule,
  createPerson,
  findSiblingDiscountLines,
  GuardianPersonId,
  GuardianQualitiesSchema,
  insertEnrollment,
  recordGuardianRelationship,
  StudentPersonId
} from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-04-sibling-discount.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly classId: Ref.Ref<string | undefined>
  readonly guardianPersonId: Ref.Ref<string | undefined>
  readonly youssefEnrollmentId: Ref.Ref<string | undefined>
  readonly youssefStudentPersonId: Ref.Ref<string | undefined>
  readonly saraEnrollmentId: Ref.Ref<string | undefined>
  readonly saraStudentPersonId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        classId: yield* Ref.make<string | undefined>(undefined),
        guardianPersonId: yield* Ref.make<string | undefined>(undefined),
        youssefEnrollmentId: yield* Ref.make<string | undefined>(undefined),
        youssefStudentPersonId: yield* Ref.make<string | undefined>(undefined),
        saraEnrollmentId: yield* Ref.make<string | undefined>(undefined),
        saraStudentPersonId: yield* Ref.make<string | undefined>(undefined)
      })
    })
  )
}

/** Same reasoning as `fr-ped-24-historical-grade-import.steps.test.ts`'s own `asOwner`. */
const asOwner = <A, E>(effect: Effect.Effect<A, E, SqlClient>): Effect.Effect<A> =>
  effect.pipe(Effect.provide(SqlLive), Effect.orDie)

const TUITION_AMOUNT_MAD = 1000

const seedSchoolWithFeeSchedule = () =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`
      INSERT INTO schools (name) VALUES ('Sibling discount feature school') RETURNING id
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
    return { schoolId: school.id, academicYearId: year.id, classId: cls.id, levelId: level.id }
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

const enrollChild = Effect.fn(function*(
  schoolId: string,
  academicYearId: string,
  classId: string,
  guardianPersonId: string,
  childName: string,
  effectiveDate: string
) {
  const studentPersonId = yield* createStudent(childName)
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

  const enrollment = yield* withSchool(
    schoolId,
    insertEnrollment({
      schoolId,
      academicYearId,
      studentPersonId,
      classId,
      effectiveDate,
      hasLegalGuardian: true,
      hasFinancialGuardian: true
    })
  ).pipe(Effect.orDie)

  return { enrollmentId: enrollment.id, studentPersonId }
})

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("a sibling discount configured at 10 percent on tuition from the second child on", function*() {
    const world = yield* World
    const seed = yield* seedSchoolWithFeeSchedule()
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.academicYearId, seed.academicYearId)
    yield* Ref.set(world.classId, seed.classId)

    const feeScheduleId = yield* createFeeSchedule({
      schoolId: seed.schoolId,
      academicYearId: seed.academicYearId,
      levelId: seed.levelId
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)

    yield* addFeeItem({
      schoolId: seed.schoolId,
      feeScheduleId,
      nature: "tuition",
      labelFr: "Scolarité",
      labelAr: "الرسوم الدراسية",
      frequency: "monthly",
      amountMad: TUITION_AMOUNT_MAD,
      isMandatory: true
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)

    yield* configureSiblingDiscountPolicy({
      schoolId: seed.schoolId,
      academicYearId: seed.academicYearId,
      discountType: "percentage",
      discountValue: 10,
      appliesToNatures: ["tuition"]
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
  })

  And("Youssef enrolled ACTIVE at School A with Ahmed as financial guardian", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const classId = yield* Ref.get(world.classId)

    const guardianPersonId = yield* createPerson({
      firstName: "Ahmed",
      lastName: "Guardian",
      dateOfBirth: "1980-01-01"
    }).pipe(Effect.orDie)
    yield* Ref.set(world.guardianPersonId, guardianPersonId)

    const youssef = yield* enrollChild(schoolId!, academicYearId!, classId!, guardianPersonId, "Youssef", "2024-09-01")
    yield* Ref.set(world.youssefEnrollmentId, youssef.enrollmentId)
    yield* Ref.set(world.youssefStudentPersonId, youssef.studentPersonId)
  })

  When("Sara's enrollment, same guardian, moves to ACTIVE at the same school", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const classId = yield* Ref.get(world.classId)
    const guardianPersonId = yield* Ref.get(world.guardianPersonId)

    const sara = yield* enrollChild(schoolId!, academicYearId!, classId!, guardianPersonId!, "Sara", "2024-09-15")
    yield* Ref.set(world.saraEnrollmentId, sara.enrollmentId)
    yield* Ref.set(world.saraStudentPersonId, sara.studentPersonId)
  })

  Then("the 10 percent discount is applied to Sara's tuition installments as a distinct line", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const saraEnrollmentId = yield* Ref.get(world.saraEnrollmentId)
    const youssefEnrollmentId = yield* Ref.get(world.youssefEnrollmentId)

    const saraLines = yield* findSiblingDiscountLines(schoolId!, saraEnrollmentId!).pipe(Effect.orDie)
    assert.strictEqual(saraLines.length, 10) // 10 monthly tuition installments
    assert.ok(saraLines.every((line) => line.amount_mad === TUITION_AMOUNT_MAD * 0.1))

    // The FIRST enrolled sibling never gets a discount — only the second one on.
    const youssefLines = yield* findSiblingDiscountLines(schoolId!, youssefEnrollmentId!).pipe(Effect.orDie)
    assert.strictEqual(youssefLines.length, 0)
  })

  And("Ahmed's payment schedule shows the discount, referenced", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const saraEnrollmentId = yield* Ref.get(world.saraEnrollmentId)

    // "Referenced" — a distinct row pointing at a real installment, never a
    // number folded into the installment's own `amount_mad`.
    const rows = yield* asOwner(Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* withSchool(
        schoolId!,
        sql<{ installment_amount: string; discount_amount: string }>`
          SELECT i.amount_mad AS installment_amount, l.amount_mad AS discount_amount
          FROM sibling_discount_lines l
          JOIN installments i ON i.id = l.installment_id
          JOIN financial_accounts a ON a.id = l.financial_account_id
          WHERE a.enrollment_id = ${saraEnrollmentId!}
        `
      )
    }))
    assert.strictEqual(rows.length, 10)
    assert.ok(rows.every((row) => Number(row.installment_amount) === TUITION_AMOUNT_MAD))
    assert.ok(rows.every((row) => Number(row.discount_amount) === TUITION_AMOUNT_MAD * 0.1))
  })

  Given("the sibling discount applied to Sara", function*() {
    const world = yield* World
    const seed = yield* seedSchoolWithFeeSchedule()
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.academicYearId, seed.academicYearId)
    yield* Ref.set(world.classId, seed.classId)

    const feeScheduleId = yield* createFeeSchedule({
      schoolId: seed.schoolId,
      academicYearId: seed.academicYearId,
      levelId: seed.levelId
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)

    yield* addFeeItem({
      schoolId: seed.schoolId,
      feeScheduleId,
      nature: "tuition",
      labelFr: "Scolarité",
      labelAr: "الرسوم الدراسية",
      frequency: "monthly",
      amountMad: TUITION_AMOUNT_MAD,
      isMandatory: true
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)

    yield* configureSiblingDiscountPolicy({
      schoolId: seed.schoolId,
      academicYearId: seed.academicYearId,
      discountType: "percentage",
      discountValue: 10,
      appliesToNatures: ["tuition"]
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)

    const guardianPersonId = yield* createPerson({
      firstName: "Ahmed",
      lastName: "Guardian",
      dateOfBirth: "1980-01-01"
    }).pipe(Effect.orDie)
    yield* Ref.set(world.guardianPersonId, guardianPersonId)

    const youssef = yield* enrollChild(
      seed.schoolId,
      seed.academicYearId,
      seed.classId,
      guardianPersonId,
      "Youssef",
      "2024-09-01"
    )
    yield* Ref.set(world.youssefEnrollmentId, youssef.enrollmentId)
    yield* Ref.set(world.youssefStudentPersonId, youssef.studentPersonId)

    const sara = yield* enrollChild(
      seed.schoolId,
      seed.academicYearId,
      seed.classId,
      guardianPersonId,
      "Sara",
      "2024-09-15"
    )
    yield* Ref.set(world.saraEnrollmentId, sara.enrollmentId)
    yield* Ref.set(world.saraStudentPersonId, sara.studentPersonId)

    const saraLines = yield* findSiblingDiscountLines(seed.schoolId, sara.enrollmentId).pipe(Effect.orDie)
    assert.strictEqual(saraLines.length, 10)
  })

  When("Youssef's enrollment closes mid-year", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const youssefEnrollmentId = yield* Ref.get(world.youssefEnrollmentId)

    yield* closeEnrollment(schoolId!, youssefEnrollmentId!, "Withdrawn mid-year").pipe(
      Effect.provide(asDirectorOf(schoolId!)),
      Effect.orDie
    )
  })

  Then("the discount is removed from Sara's unsettled installments, with the recomputation traced", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const saraEnrollmentId = yield* Ref.get(world.saraEnrollmentId)

    const saraLines = yield* findSiblingDiscountLines(schoolId!, saraEnrollmentId!).pipe(Effect.orDie)
    assert.strictEqual(saraLines.length, 0)

    const [recomputation] = yield* asOwner(Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* withSchool(
        schoolId!,
        sql<{ trigger_reason: string; installments_removed: number }>`
          SELECT r.trigger_reason, r.installments_removed FROM sibling_discount_recomputations r
          JOIN financial_accounts a ON a.id = r.financial_account_id
          WHERE a.enrollment_id = ${saraEnrollmentId!} AND r.trigger_reason = 'sibling_closed'
        `
      )
    }))
    assert.isDefined(recomputation)
    assert.strictEqual(recomputation.trigger_reason, "sibling_closed")
    assert.strictEqual(Number(recomputation.installments_removed), 10)
  })
})
