import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import { confirmPayment, findReceiptForPayment, recordBankTransfer } from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"
import { seedStudentWithDueInstallment } from "./payment-collection-support.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-13-bank-transfer.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly financialAccountId: Ref.Ref<string | undefined>
  readonly installmentId: Ref.Ref<string | undefined>
  readonly paymentId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        financialAccountId: yield* Ref.make<string | undefined>(undefined),
        installmentId: yield* Ref.make<string | undefined>(undefined),
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
      const [row] = yield* sql<{ status: string }>`SELECT status FROM installments WHERE id = ${installmentId}`
      return row.status
    })
  )
})

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ Given, Then, When }) => {
  Given("a 1,200-DH transfer received with the reference \"YOUSSEF OCT\" into School A's account", function*() {
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Youssef", "Ahmed", "2026-10-01")
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.financialAccountId, seed.financialAccountId)
    yield* Ref.set(world.installmentId, seed.installmentId)
  })

  When(
    "accounting enters the transfer with its reference and value date and reconciles it against Youssef's October installment",
    function*() {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const financialAccountId = yield* Ref.get(world.financialAccountId)

      const paymentId = yield* recordBankTransfer({
        schoolId: schoolId!,
        amountMad: 1200,
        valueDate: "2026-10-01",
        reference: "YOUSSEF OCT"
      }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
      yield* confirmPayment(schoolId!, paymentId, [financialAccountId!]).pipe(
        Effect.provide(asDirectorOf(schoolId!)),
        Effect.orDie
      )
      yield* Ref.set(world.paymentId, paymentId)
    }
  )

  Then("the installment moves to \"paid\" and a receipt is issued to the financial guardian", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const installmentId = yield* Ref.get(world.installmentId)
    const paymentId = yield* Ref.get(world.paymentId)

    const status = yield* installmentStatus(schoolId!, installmentId!).pipe(Effect.orDie)
    assert.strictEqual(status, "paid")

    const receipt = yield* findReceiptForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(receipt))
  })

  Given("a transfer entered without validation", function*() {
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Youssef", "Ahmed", "2026-10-01")
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.financialAccountId, seed.financialAccountId)
    yield* Ref.set(world.installmentId, seed.installmentId)

    const paymentId = yield* recordBankTransfer({
      schoolId: seed.schoolId,
      amountMad: 1200,
      valueDate: "2026-10-01",
      reference: "UNVALIDATED"
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
    yield* Ref.set(world.paymentId, paymentId)
  })

  When("the unpaid-balances table is viewed", function*() {
    // No dedicated unpaid-balances read model exists yet (ticket #62's own
    // scope) — this scenario only needs the underlying facts the eventual
    // view would surface, checked directly below.
  })

  Then("the installment stays due and the transfer shows as \"pending confirmation\"", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const installmentId = yield* Ref.get(world.installmentId)

    const status = yield* installmentStatus(schoolId!, installmentId!).pipe(Effect.orDie)
    assert.strictEqual(status, "due")

    const sql = yield* SqlClient
    const paymentId = yield* Ref.get(world.paymentId)
    const [payment] = yield* withSchool(
      schoolId!,
      sql<{ status: string }>`SELECT status FROM payments WHERE id = ${paymentId!}`
    )
    assert.strictEqual(payment.status, "pending_confirmation")
  })
})
