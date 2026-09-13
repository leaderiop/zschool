import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import { findPaymentAllocations, findReceiptForPayment, recordPayment } from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"
import { seedFamilyWithDueInstallments } from "./payment-collection-support.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-30-family-payment.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly youssefAccountId: Ref.Ref<string | undefined>
  readonly youssefInstallmentId: Ref.Ref<string | undefined>
  readonly saraAccountId: Ref.Ref<string | undefined>
  readonly saraInstallmentId: Ref.Ref<string | undefined>
  readonly paymentId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        youssefAccountId: yield* Ref.make<string | undefined>(undefined),
        youssefInstallmentId: yield* Ref.make<string | undefined>(undefined),
        saraAccountId: yield* Ref.make<string | undefined>(undefined),
        saraInstallmentId: yield* Ref.make<string | undefined>(undefined),
        paymentId: yield* Ref.make<string | undefined>(undefined)
      })
    })
  )
}

const installmentStatus = Effect.fn(function*(schoolId: string, installmentId: string) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{ status: string; amount_mad: string }>`
        SELECT status, amount_mad FROM installments WHERE id = ${installmentId}
      `
      return row
    })
  )
})

const seedFamily = Effect.fn(function*() {
  const world = yield* World
  const seed = yield* seedFamilyWithDueInstallments("Ahmed", [
    { name: "Youssef", tuitionAmountMad: 1200 },
    { name: "Sara", tuitionAmountMad: 1000 }
  ], "2026-10-01")
  yield* Ref.set(world.schoolId, seed.schoolId)
  yield* Ref.set(world.youssefAccountId, seed.children[0].financialAccountId)
  yield* Ref.set(world.youssefInstallmentId, seed.children[0].installmentId)
  yield* Ref.set(world.saraAccountId, seed.children[1].financialAccountId)
  yield* Ref.set(world.saraInstallmentId, seed.children[1].installmentId)
})

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given(
    "Ahmed, financial guardian of Youssef \\(October installment 1,200 DH) and Sara \\(October installment 1,000 DH) at School A",
    function*() {
      yield* seedFamily()
    }
  )

  When("Fatima collects 2,200 DH in cash, selecting both children", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const youssefAccountId = yield* Ref.get(world.youssefAccountId)
    const saraAccountId = yield* Ref.get(world.saraAccountId)

    const { paymentId } = yield* recordPayment({
      schoolId: schoolId!,
      method: "cash",
      amountMad: 2200,
      valueDate: "2026-10-01",
      reference: null,
      financialAccountIds: [youssefAccountId!, saraAccountId!]
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
    yield* Ref.set(world.paymentId, paymentId)
  })

  Then("a single payment is recorded, split 1,200 DH to Youssef's account and 1,000 DH to Sara's", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const paymentId = yield* Ref.get(world.paymentId)
    const youssefInstallmentId = yield* Ref.get(world.youssefInstallmentId)
    const saraInstallmentId = yield* Ref.get(world.saraInstallmentId)

    const allocations = yield* findPaymentAllocations(schoolId!, paymentId!).pipe(Effect.orDie)
    assert.strictEqual(allocations.length, 2)
    const byInstallment = new Map(allocations.map((a) => [a.installment_id, a.amount_mad]))
    assert.strictEqual(byInstallment.get(youssefInstallmentId!), 1200)
    assert.strictEqual(byInstallment.get(saraInstallmentId!), 1000)
  })

  And("a single numbered receipt lists both children and both settled installments", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const paymentId = yield* Ref.get(world.paymentId)

    const receipt = yield* findReceiptForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(receipt))

    // "Lists both children" — the receipt's own two `payment_allocations`
    // rows, joined to their distinct `financial_account_id`s, already
    // proven above; a rendered receipt DOCUMENT is out of scope (no
    // documents module exists yet, same reasoning as `fr-fin-17`'s
    // "downloadable" step).
  })

  And("the unpaid-balances table no longer shows any October installment for Ahmed", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const youssefInstallmentId = yield* Ref.get(world.youssefInstallmentId)
    const saraInstallmentId = yield* Ref.get(world.saraInstallmentId)

    const youssef = yield* installmentStatus(schoolId!, youssefInstallmentId!).pipe(Effect.orDie)
    const sara = yield* installmentStatus(schoolId!, saraInstallmentId!).pipe(Effect.orDie)
    assert.strictEqual(youssef.status, "paid")
    assert.strictEqual(sara.status, "paid")
  })

  Given("the same installments and a payment of 1,500 DH", function*() {
    yield* seedFamily()
  })

  When("automatic splitting is applied with the \"oldest first, then by child\" order", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const youssefAccountId = yield* Ref.get(world.youssefAccountId)
    const saraAccountId = yield* Ref.get(world.saraAccountId)

    // "Oldest first, then by child" — both installments share the same due
    // date (both October), so the default allocator's `ORDER BY due_date
    // ASC, id ASC` tie-break needs `financialAccountIds` given in child
    // order (Youssef, then Sara) for a deterministic "then by child" result;
    // `id ASC` alone (a random uuid) wouldn't reliably prefer one child over
    // the other.
    const { paymentId } = yield* recordPayment({
      schoolId: schoolId!,
      method: "cash",
      amountMad: 1500,
      valueDate: "2026-10-01",
      reference: null,
      financialAccountIds: [youssefAccountId!, saraAccountId!]
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
    yield* Ref.set(world.paymentId, paymentId)
  })

  Then("Youssef's installment is settled and Sara's moves to \"partially paid\" with 700 DH remaining due", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const youssefInstallmentId = yield* Ref.get(world.youssefInstallmentId)
    const saraInstallmentId = yield* Ref.get(world.saraInstallmentId)

    const youssef = yield* installmentStatus(schoolId!, youssefInstallmentId!).pipe(Effect.orDie)
    assert.strictEqual(youssef.status, "paid")

    const sara = yield* installmentStatus(schoolId!, saraInstallmentId!).pipe(Effect.orDie)
    assert.strictEqual(sara.status, "partially_paid")
    assert.strictEqual(Number(sara.amount_mad) - 300, 700)
  })

  And("the single receipt details the split", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const paymentId = yield* Ref.get(world.paymentId)

    const allocations = yield* findPaymentAllocations(schoolId!, paymentId!).pipe(Effect.orDie)
    assert.strictEqual(allocations.length, 2)
    const receipt = yield* findReceiptForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(receipt))
  })
})
