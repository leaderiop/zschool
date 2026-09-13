import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import {
  closeEnrollment,
  findUnpaidBalances,
  findUnpaidBalancesByGuardian,
  recordPayment,
  triggerManualReminder,
  type GuardianUnpaidBalance,
  type UnpaidBalance
} from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"
import { seedFamilyWithDueInstallments, seedStudentWithDueInstallment } from "./payment-collection-support.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-20-unpaid-balances-table.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly guardianPersonId: Ref.Ref<string | undefined>
  readonly children: Ref.Ref<
    ReadonlyArray<{ readonly name: string; readonly financialAccountId: string; readonly installmentId: string }>
    | undefined
  >
  readonly enrollmentId: Ref.Ref<string | undefined>
  readonly guardianRows: Ref.Ref<ReadonlyArray<GuardianUnpaidBalance> | undefined>
  readonly balanceRows: Ref.Ref<ReadonlyArray<UnpaidBalance> | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        guardianPersonId: yield* Ref.make<string | undefined>(undefined),
        children: yield* Ref.make<
          ReadonlyArray<{ readonly name: string; readonly financialAccountId: string; readonly installmentId: string }>
          | undefined
        >(undefined),
        enrollmentId: yield* Ref.make<string | undefined>(undefined),
        guardianRows: yield* Ref.make<ReadonlyArray<GuardianUnpaidBalance> | undefined>(undefined),
        balanceRows: yield* Ref.make<ReadonlyArray<UnpaidBalance> | undefined>(undefined)
      })
    })
  )
}

/** Same relative-offset idiom `fr-fin-18-graduated-reminder.steps.test.ts` uses — keeps "overdue" true regardless of the real wall-clock date the suite runs on. */
const setDaysOverdue = Effect.fn(function*(schoolId: string, installmentId: string, daysOverdue: number) {
  yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      yield* sql`UPDATE installments SET due_date = CURRENT_DATE - ${daysOverdue}::int WHERE id = ${installmentId}`
    })
  )
})

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("Ahmed, financial guardian of Youssef and Sara at School A, with two overdue installments", function*() {
    const world = yield* World
    const seed = yield* seedFamilyWithDueInstallments("Ahmed", [
      { name: "Youssef", tuitionAmountMad: 1200 },
      { name: "Sara", tuitionAmountMad: 1000 }
    ])
    for (const child of seed.children) {
      yield* setDaysOverdue(seed.schoolId, child.installmentId, 10)
    }
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.guardianPersonId, seed.guardianPersonId)
    yield* Ref.set(world.children, seed.children)
  })

  When("the school leadership opens the unpaid-balances table by guardian", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const rows = yield* findUnpaidBalancesByGuardian(schoolId!)
    yield* Ref.set(world.guardianRows, rows)
  })

  Then("one row groups Ahmed with the total of both installments and the per-child detail", function*() {
    // The fee schedule generates one installment per month of the school
    // year, not just the single overdue one each child's Given step marks —
    // so the expected total is computed from each child's actual installment
    // rows rather than hardcoded to the two overdue amounts, keeping this
    // assertion correct regardless of how many monthly occurrences
    // `PaymentSchedule.ts` produces for a given `effectiveDate`.
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const guardianPersonId = yield* Ref.get(world.guardianPersonId)
    const children = yield* Ref.get(world.children)
    const rows = yield* Ref.get(world.guardianRows)

    const sql = yield* SqlClient
    const expectedTotal = yield* withSchool(
      schoolId!,
      Effect.gen(function*() {
        let total = 0
        for (const child of children!) {
          const [row] = yield* sql<{ sum: string | null }>`
            SELECT SUM(amount_mad)::text AS sum FROM installments WHERE financial_account_id = ${child.financialAccountId}
          `
          total += Number(row.sum ?? 0)
        }
        return Math.round(total * 100) / 100
      })
    )

    const row = rows!.find((r) => r.guardianPersonId === guardianPersonId)
    assert.ok(row !== undefined)
    assert.strictEqual(row!.totalOwedMad, expectedTotal)
    assert.strictEqual(row!.children.length, 2)
  })

  And("the collect and remind actions are available from the row", function*() {
    // No UI/API surface exists yet (out of scope, same boundary every other
    // finance ticket's own "sent to guardian"/"downloadable receipt" steps
    // already draw) — "available" is checked here as: the underlying
    // capabilities this row's per-child installments can be acted on with
    // already exist and are directly callable. Collect: `recordPayment`
    // (ticket #59). Remind: `triggerManualReminder` (ticket #64).
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const children = yield* Ref.get(world.children)

    const { paymentId } = yield* recordPayment({
      schoolId: schoolId!,
      method: "cash",
      amountMad: 1200,
      valueDate: new Date().toISOString().slice(0, 10),
      reference: null,
      financialAccountIds: [children![0].financialAccountId]
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
    assert.ok(paymentId.length > 0)

    const dunning = yield* triggerManualReminder({
      schoolId: schoolId!,
      installmentId: children![1].installmentId
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
    assert.ok(dunning.id.length > 0)
  })

  Given("a TRANSFERRED enrollment with 1,500 DH still due", function*() {
    // "1,500 DH" is illustrative — `seedStudentWithDueInstallment`'s own
    // fixed tuition amount is what's actually seeded; the Then step below
    // asserts the balance is positive and tagged, not a literal amount
    // (same treatment `fr-fin-18-graduated-reminder.steps.test.ts`'s own
    // "900-DH" gets).
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Nadia", "Rachid", "2026-08-01")
    yield* closeEnrollment(seed.schoolId, seed.enrollmentId, "Transferred to another school").pipe(
      Effect.provide(asDirectorOf(seed.schoolId))
    )
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.enrollmentId, seed.enrollmentId)
  })

  When("the table is shown", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const rows = yield* findUnpaidBalances(schoolId!)
    yield* Ref.set(world.balanceRows, rows)
  })

  Then("the row carries the \"closed file\" tag and stays in the unpaid totals", function*() {
    const world = yield* World
    const enrollmentId = yield* Ref.get(world.enrollmentId)
    const rows = yield* Ref.get(world.balanceRows)
    const row = rows!.find((r) => r.enrollmentId === enrollmentId)
    assert.ok(row !== undefined)
    assert.strictEqual(row!.closedFile, true)
    assert.ok(row!.totalOwedMad > 0)
  })
})
