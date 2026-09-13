import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { SqlLive, withSchool } from "@zschool/db"
import {
  addFeeItem,
  attachStudentProfile,
  commitFinancialHistoryImportBatch,
  createFeeSchedule,
  createPerson,
  insertEnrollment,
  type FinancialHistoryImportRow
} from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"

const feature = await loadFeature(
  fileURLToPath(new URL("./fr-fin-31-mid-year-financial-catchup.feature", import.meta.url))
)

/** Same reasoning as `fr-fin-04-sibling-discount.steps.test.ts`'s own `asOwner` — seeding queries run as the migration-time superuser, never the RLS/@qadi-gated app role a Scenario's real steps exercise. */
const asOwner = <A, E>(effect: Effect.Effect<A, E, SqlClient>): Effect.Effect<A> =>
  effect.pipe(Effect.provide(SqlLive), Effect.orDie)

const TUITION_AMOUNT_MAD = 1200

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly academicYearId: Ref.Ref<string | undefined>
  readonly enrollmentId: Ref.Ref<string | undefined>
  readonly massarCode: Ref.Ref<string | undefined>
  readonly rowResult: Ref.Ref<{ readonly status: string; readonly error?: { readonly reason: string } } | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        academicYearId: yield* Ref.make<string | undefined>(undefined),
        enrollmentId: yield* Ref.make<string | undefined>(undefined),
        massarCode: yield* Ref.make<string | undefined>(undefined),
        rowResult: yield* Ref.make<{ readonly status: string; readonly error?: { readonly reason: string } } | undefined>(
          undefined
        )
      })
    })
  )
}

/**
 * A school -> year -> section -> cycle -> level -> class -> monthly-tuition
 * fee schedule, then one enrolled student with a known Massar code —
 * financial-history import matches by Massar code, never by a new
 * cross-tenant identity mechanism (`GradeImport.ts`'s own precedent).
 * `withFeeSchedule: false` skips the `createFeeSchedule`/`addFeeItem` calls
 * for the "fee schedule never configured" scenario.
 */
const seedPilotStudent = (withFeeSchedule: boolean) =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`
      INSERT INTO schools (name) VALUES ('Mid-year catch-up feature school') RETURNING id
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

        if (withFeeSchedule) {
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
            amountMad: TUITION_AMOUNT_MAD,
            isMandatory: true
          }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)
        }

        const massarCode = "M" + school.id.replace(/-/g, "").slice(0, 12)
        const personId = yield* createPerson({
          firstName: "Ilyas",
          lastName: "Pilot",
          dateOfBirth: "2013-01-01",
          massarCode
        }).pipe(Effect.orDie)
        yield* attachStudentProfile(personId).pipe(Effect.orDie)
        const enrollment = yield* insertEnrollment({
          schoolId: school.id,
          academicYearId: year.id,
          studentPersonId: personId,
          classId: cls.id,
          effectiveDate: "2026-09-01",
          hasLegalGuardian: true,
          hasFinancialGuardian: true
        }).pipe(Effect.orDie)

        return { schoolId: school.id, academicYearId: year.id, enrollmentId: enrollment.id, massarCode }
      })
    )
  }))

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("a pilot student enrolled since September with a freshly generated, entirely-unpaid payment schedule", function*() {
    const world = yield* World
    const seed = yield* seedPilotStudent(true)
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.academicYearId, seed.academicYearId)
    yield* Ref.set(world.enrollmentId, seed.enrollmentId)
    yield* Ref.set(world.massarCode, seed.massarCode)
  })

  Given("a pilot student with a payment schedule", function*() {
    const world = yield* World
    const seed = yield* seedPilotStudent(true)
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.academicYearId, seed.academicYearId)
    yield* Ref.set(world.enrollmentId, seed.enrollmentId)
    yield* Ref.set(world.massarCode, seed.massarCode)
  })

  Given("a pilot student with no fee schedule configured for their level", function*() {
    const world = yield* World
    const seed = yield* seedPilotStudent(false)
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.academicYearId, seed.academicYearId)
    yield* Ref.set(world.enrollmentId, seed.enrollmentId)
    yield* Ref.set(world.massarCode, seed.massarCode)
  })

  Given("a pilot student whose financial history has already been imported once", function*() {
    const world = yield* World
    const seed = yield* seedPilotStudent(true)
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.academicYearId, seed.academicYearId)
    yield* Ref.set(world.enrollmentId, seed.enrollmentId)
    yield* Ref.set(world.massarCode, seed.massarCode)

    const row: FinancialHistoryImportRow = {
      rowId: "r1",
      massarCode: seed.massarCode,
      amountAlreadyPaidMad: TUITION_AMOUNT_MAD,
      asOfDate: "2026-09-01"
    }
    yield* commitFinancialHistoryImportBatch(seed.schoolId, seed.academicYearId, [row]).pipe(
      Effect.provide(asDirectorOf(seed.schoolId))
    )
  })

  When("the director imports that 3 months of tuition are already paid as of December", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const massarCode = yield* Ref.get(world.massarCode)

    const row: FinancialHistoryImportRow = {
      rowId: "r1",
      massarCode: massarCode!,
      amountAlreadyPaidMad: TUITION_AMOUNT_MAD * 3,
      asOfDate: "2026-12-01"
    }
    const results = yield* commitFinancialHistoryImportBatch(schoolId!, academicYearId!, [row]).pipe(
      Effect.provide(asDirectorOf(schoolId!))
    )
    yield* Ref.set(world.rowResult, results[0])
  })

  When("the director imports a cheque already in hand, still only deposited", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const massarCode = yield* Ref.get(world.massarCode)

    const row: FinancialHistoryImportRow = {
      rowId: "r1",
      massarCode: massarCode!,
      cheques: [{
        chequeNumber: "CHQ-100",
        bank: "Attijariwafa Bank",
        chequeDate: "2027-02-01",
        amountMad: TUITION_AMOUNT_MAD,
        initialStatus: "deposited"
      }]
    }
    const results = yield* commitFinancialHistoryImportBatch(schoolId!, academicYearId!, [row]).pipe(
      Effect.provide(asDirectorOf(schoolId!))
    )
    yield* Ref.set(world.rowResult, results[0])
  })

  When("the director imports a discount already granted by the school before onboarding", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const massarCode = yield* Ref.get(world.massarCode)

    const row: FinancialHistoryImportRow = {
      rowId: "r1",
      massarCode: massarCode!,
      discountAlreadyGrantedMad: 300,
      discountReason: "Founder's-family discount granted before ZSchool onboarding"
    }
    const results = yield* commitFinancialHistoryImportBatch(schoolId!, academicYearId!, [row]).pipe(
      Effect.provide(asDirectorOf(schoolId!))
    )
    yield* Ref.set(world.rowResult, results[0])
  })

  When("the director imports that student's already-paid amount", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const massarCode = yield* Ref.get(world.massarCode)

    const row: FinancialHistoryImportRow = {
      rowId: "r1",
      massarCode: massarCode!,
      amountAlreadyPaidMad: TUITION_AMOUNT_MAD,
      asOfDate: "2026-10-01"
    }
    const results = yield* commitFinancialHistoryImportBatch(schoolId!, academicYearId!, [row]).pipe(
      Effect.provide(asDirectorOf(schoolId!))
    )
    yield* Ref.set(world.rowResult, results[0])
  })

  When("the director re-imports the exact same file", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const academicYearId = yield* Ref.get(world.academicYearId)
    const massarCode = yield* Ref.get(world.massarCode)

    const row: FinancialHistoryImportRow = {
      rowId: "r1",
      massarCode: massarCode!,
      amountAlreadyPaidMad: TUITION_AMOUNT_MAD,
      asOfDate: "2026-09-01"
    }
    const results = yield* commitFinancialHistoryImportBatch(schoolId!, academicYearId!, [row]).pipe(
      Effect.provide(asDirectorOf(schoolId!))
    )
    yield* Ref.set(world.rowResult, results[0])
  })

  Then("the payment schedule shows those 3 installments paid and the rest due", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)

    const installments = yield* withSchool(
      schoolId!,
      sql<{ status: string }>`
        SELECT i.status FROM installments i
        JOIN financial_accounts a ON a.id = i.financial_account_id
        WHERE a.enrollment_id = ${enrollmentId!}
        ORDER BY i.due_date ASC
      `
    )
    assert.strictEqual(installments.filter((i) => i.status === "paid").length, 3)
    assert.ok(installments.some((i) => i.status === "due"))
  })

  Then("the cheque appears in cheque tracking at its imported status", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)

    const [cheque] = yield* withSchool(
      schoolId!,
      sql<{ status: string }>`SELECT status FROM cheques WHERE cheque_number = 'CHQ-100'`
    )
    assert.strictEqual(cheque.status, "deposited")
  })

  And("none of the student's installments are marked paid by it", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)

    const installments = yield* withSchool(
      schoolId!,
      sql<{ status: string }>`
        SELECT i.status FROM installments i
        JOIN financial_accounts a ON a.id = i.financial_account_id
        WHERE a.enrollment_id = ${enrollmentId!}
      `
    )
    assert.ok(installments.every((i) => i.status === "due"))
  })

  Then("the earliest installment's amount is reduced by the discount", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)

    const [installment] = yield* withSchool(
      schoolId!,
      sql<{ amount_mad: string }>`
        SELECT i.amount_mad FROM installments i
        JOIN financial_accounts a ON a.id = i.financial_account_id
        WHERE a.enrollment_id = ${enrollmentId!}
        ORDER BY i.due_date ASC LIMIT 1
      `
    )
    assert.strictEqual(Number(installment.amount_mad), TUITION_AMOUNT_MAD - 300)
  })

  And("the reduction is traced with its reason", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)

    const [adjustment] = yield* withSchool(
      schoolId!,
      sql<{ reason: string }>`
        SELECT ia.reason FROM installment_adjustments ia
        JOIN installments i ON i.id = ia.installment_id
        JOIN financial_accounts a ON a.id = i.financial_account_id
        WHERE a.enrollment_id = ${enrollmentId!}
      `
    )
    assert.strictEqual(adjustment.reason, "Founder's-family discount granted before ZSchool onboarding")
  })

  Then("the row fails with a clear reason instead of a silently-wrong catch-up", function*() {
    const world = yield* World
    const result = yield* Ref.get(world.rowResult)
    assert.strictEqual(result!.status, "error")
    assert.ok(result!.error!.reason.includes("payment schedule"))
  })

  Then("the row is recognized as already applied and nothing is double-recorded", function*() {
    const world = yield* World
    const sql = yield* SqlClient
    const schoolId = yield* Ref.get(world.schoolId)
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const result = yield* Ref.get(world.rowResult)
    assert.strictEqual(result!.status, "skipped_already_applied")

    const [{ count }] = yield* withSchool(
      schoolId!,
      sql<{ count: string }>`
        SELECT count(*)::int AS count FROM payments p
        JOIN payment_allocations pa ON pa.payment_id = p.id
        JOIN installments i ON i.id = pa.installment_id
        JOIN financial_accounts a ON a.id = i.financial_account_id
        WHERE a.enrollment_id = ${enrollmentId!}
      `
    )
    assert.strictEqual(Number(count), 1)
  })
})
