import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import { confirmPayment, findReceiptForPayment, recordBankTransfer } from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import * as Result from "effect/Result"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"
import { seedStudentWithDueInstallment } from "./payment-collection-support.ts"

const feature = await loadFeature(
  fileURLToPath(new URL("./fr-fin-07-tamper-proof-numbering.feature", import.meta.url))
)

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly financialAccountId: Ref.Ref<string | undefined>
  readonly paymentId: Ref.Ref<string | undefined>
  readonly receiptId: Ref.Ref<string | undefined>
  readonly firstReceiptNumber: Ref.Ref<string | undefined>
  readonly secondConfirmError: Ref.Ref<{ readonly _tag: string } | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        financialAccountId: yield* Ref.make<string | undefined>(undefined),
        paymentId: yield* Ref.make<string | undefined>(undefined),
        receiptId: yield* Ref.make<string | undefined>(undefined),
        firstReceiptNumber: yield* Ref.make<string | undefined>(undefined),
        secondConfirmError: yield* Ref.make<{ readonly _tag: string } | undefined>(undefined)
      })
    })
  )
}

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ Given, Then, When }) => {
  Given("a payment entered on a workstation whose connection then drops", function*() {
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Youssef", "Ahmed", "2026-10-01")
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.financialAccountId, seed.financialAccountId)

    // "Entered" but never confirmed — the workstation's connection drops
    // before the confirmation round trip completes, leaving the payment
    // stuck `pending_confirmation` exactly as `recordBankTransfer` alone
    // leaves it.
    const paymentId = yield* recordBankTransfer({
      schoolId: seed.schoolId,
      amountMad: 1200,
      valueDate: "2026-10-01",
      reference: "DROPPED-CONNECTION"
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
    yield* Ref.set(world.paymentId, paymentId)
  })

  When("the cashier confirms it", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const financialAccountId = yield* Ref.get(world.financialAccountId)
    const paymentId = yield* Ref.get(world.paymentId)

    const { receiptNumber } = yield* confirmPayment(schoolId!, paymentId!, [financialAccountId!]).pipe(
      Effect.provide(asDirectorOf(schoolId!)),
      Effect.orDie
    )
    yield* Ref.set(world.firstReceiptNumber, receiptNumber)

    // The dropped connection's own retry, reaching the server again after
    // reconnecting — this must fail (the payment is no longer pending), and
    // above all must NOT mint a second, duplicate number for the same
    // payment.
    const retry = yield* confirmPayment(schoolId!, paymentId!, [financialAccountId!]).pipe(
      Effect.provide(asDirectorOf(schoolId!)),
      Effect.result
    )
    if (Result.isFailure(retry)) {
      yield* Ref.set(world.secondConfirmError, retry.failure)
    }
  })

  Then(
    "no number is assigned until the server confirms, and confirmation resumes with no duplicate number on reconnection",
    function*() {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const paymentId = yield* Ref.get(world.paymentId)
      const firstReceiptNumber = yield* Ref.get(world.firstReceiptNumber)
      const secondConfirmError = yield* Ref.get(world.secondConfirmError)

      assert.isDefined(firstReceiptNumber)
      assert.strictEqual(secondConfirmError?._tag, "PaymentNotPendingError")

      // Exactly one receipt exists for this payment, still carrying the
      // FIRST number — the reconnection retry above never issued a second
      // one.
      const receipt = yield* findReceiptForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
      assert.ok(Option.isSome(receipt))
      if (Option.isSome(receipt)) assert.strictEqual(receipt.value.receipt_number, firstReceiptNumber)
    }
  )

  Given("a receipt numbered 2026-0418", function*() {
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Youssef", "Ahmed", "2026-10-01")
    yield* Ref.set(world.schoolId, seed.schoolId)

    const paymentId = yield* recordBankTransfer({
      schoolId: seed.schoolId,
      amountMad: 1200,
      valueDate: "2026-10-01",
      reference: "DELETION-ATTEMPT"
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
    yield* confirmPayment(seed.schoolId, paymentId, [seed.financialAccountId]).pipe(
      Effect.provide(asDirectorOf(seed.schoolId)),
      Effect.orDie
    )

    const sql = yield* SqlClient
    const [receipt] = yield* withSchool(
      seed.schoolId,
      sql<{ id: string }>`SELECT id FROM receipts WHERE payment_id = ${paymentId}`
    )
    yield* Ref.set(world.receiptId, receipt.id)
  })

  When("a user attempts to delete it or edit its number", function*() {
    // Attempted below, through the SAME restricted `zschool_service` role
    // every other step in this suite queries through (`DatabaseTestLive`'s
    // own doc comment) — not `SqlLive`/the migration-time superuser, which
    // would bypass the very grant this scenario is proving.
  })

  Then(
    "the action is blocked and logged; only voiding through a reversing entry is offered",
    function*() {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const receiptId = yield* Ref.get(world.receiptId)

      const deleteAttempt = yield* withSchool(
        schoolId!,
        Effect.flatMap(SqlClient, (sql) => sql`DELETE FROM receipts WHERE id = ${receiptId!}`)
      ).pipe(Effect.result)
      assert.ok(Result.isFailure(deleteAttempt))

      const editAttempt = yield* withSchool(
        schoolId!,
        Effect.flatMap(SqlClient, (sql) => sql`UPDATE receipts SET receipt_number = '9999-9999' WHERE id = ${receiptId!}`)
      ).pipe(Effect.result)
      assert.ok(Result.isFailure(editAttempt))

      const sql = yield* SqlClient
      const rows = yield* withSchool(schoolId!, sql<{ id: string }>`SELECT id FROM receipts WHERE id = ${receiptId!}`)
      assert.strictEqual(rows.length, 1)
    }
  )
})
