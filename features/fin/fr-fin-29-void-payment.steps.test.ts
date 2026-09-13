import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import {
  findReceiptForPayment,
  findVoidForPayment,
  findVoidReceiptForPayment,
  recordPayment,
  requestVoid
} from "@zschool/domain"
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

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-29-void-payment.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly installmentId: Ref.Ref<string | undefined>
  readonly financialAccountId: Ref.Ref<string | undefined>
  readonly paymentId: Ref.Ref<string | undefined>
  readonly originalReceiptNumber: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        installmentId: yield* Ref.make<string | undefined>(undefined),
        financialAccountId: yield* Ref.make<string | undefined>(undefined),
        paymentId: yield* Ref.make<string | undefined>(undefined),
        originalReceiptNumber: yield* Ref.make<string | undefined>(undefined)
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

/** The actual calendar day a payment's `created_at` fell on — scenarios pass this back into `requestVoid` for the "same day" case rather than a hand-picked literal, since the payment is inserted at real wall-clock time. */
const paymentCreatedDay = Effect.fn(function*(schoolId: string, paymentId: string) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{ day: string }>`SELECT created_at::date::text AS day FROM payments WHERE id = ${paymentId}`
      return row.day
    })
  )
})

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given(
    "a 1,200-DH payment confirmed the same day against Youssef's October installment, receipt 2026-0418",
    function*() {
      const world = yield* World
      const seed = yield* seedStudentWithDueInstallment("Youssef", "Ahmed", "2026-10-01")
      yield* Ref.set(world.schoolId, seed.schoolId)
      yield* Ref.set(world.installmentId, seed.installmentId)
      yield* Ref.set(world.financialAccountId, seed.financialAccountId)

      const { paymentId, receiptNumber } = yield* recordPayment({
        schoolId: seed.schoolId,
        method: "cash",
        amountMad: 1200,
        valueDate: "2026-10-01",
        reference: null,
        financialAccountIds: [seed.financialAccountId]
      }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
      yield* Ref.set(world.paymentId, paymentId)
      // The scenario's own "receipt 2026-0418" is illustrative prose, not a
      // literal assertion — the real per-school counter starts at 1 for a
      // fresh school seeded by this scenario alone; what's actually
      // verified below is that the void receipt is the NEXT number after
      // whichever one this call actually produced.
      yield* Ref.set(world.originalReceiptNumber, receiptNumber)
    }
  )

  And("the payment actually concerned Sara", function*() {
    // Narrative only — the mistaken attribution isn't a distinct system
    // state to seed; the correction is exercised entirely by the void
    // request in the next step.
  })

  When("Fatima voids the payment with the reason \"wrong student\"", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const paymentId = yield* Ref.get(world.paymentId)
    const voidDate = yield* paymentCreatedDay(schoolId!, paymentId!)

    yield* requestVoid({ schoolId: schoolId!, paymentId: paymentId!, reason: "wrong student", voidDate }).pipe(
      Effect.provide(asDirectorOf(schoolId!)),
      Effect.orDie
    )
  })

  Then("a reversing entry is recorded and a void receipt 2026-0419 references receipt 2026-0418", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const paymentId = yield* Ref.get(world.paymentId)
    const originalReceiptNumber = yield* Ref.get(world.originalReceiptNumber)

    const voidEntry = yield* findVoidForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(voidEntry))
    if (Option.isSome(voidEntry)) assert.strictEqual(voidEntry.value.status, "finalized")

    const voidReceipt = yield* findVoidReceiptForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(voidReceipt))
    if (Option.isSome(voidReceipt)) {
      const originalSeq = Number(originalReceiptNumber!.split("-")[1])
      const voidSeq = Number(voidReceipt.value.split("-")[1])
      assert.strictEqual(voidSeq, originalSeq + 1)
    }
  })

  And("Youssef's October installment reverts to \"due\" and Ahmed's balance is recomputed", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const installmentId = yield* Ref.get(world.installmentId)

    const status = yield* installmentStatus(schoolId!, installmentId!).pipe(Effect.orDie)
    assert.strictEqual(status, "due")

    // "Ahmed's balance is recomputed" — no separate materialized balance
    // entity exists (balances are always summed live, `Payment.ts`'s own
    // "query directly" convention); the reverted installment status above
    // IS what a live-summed balance would now reflect.
  })

  And("Ahmed is notified of the voiding and receipt 2026-0418 is flagged \"voided\" in his space", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const paymentId = yield* Ref.get(world.paymentId)

    const original = yield* findReceiptForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(original))
    if (Option.isSome(original)) assert.strictEqual(original.value.voided, true)

    // "Ahmed is notified" / "in his space" — no communications module and no
    // self-service view exist yet to dispatch/render through (out of scope,
    // the same reasoning `fr-fin-10`/`fr-fin-30`'s own "sent to the
    // guardian" steps already applied; the self-service view is ticket
    // #65's own scope).
  })

  Given("a payment confirmed three days earlier", function*() {
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Karim", "Nadia", "2026-10-01")
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.installmentId, seed.installmentId)

    const { paymentId } = yield* recordPayment({
      schoolId: seed.schoolId,
      method: "cash",
      amountMad: 1200,
      valueDate: "2026-10-01",
      reference: null,
      financialAccountIds: [seed.financialAccountId]
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
    yield* Ref.set(world.paymentId, paymentId)
  })

  When("the front desk requests it be voided", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const paymentId = yield* Ref.get(world.paymentId)

    yield* requestVoid({
      schoolId: schoolId!,
      paymentId: paymentId!,
      reason: "recorded three days earlier",
      // Deliberately not the payment's own day (seeded/confirmed "just now"
      // by the step above) — exercises BEH-ZS-179's "outside the entry's
      // own day" approval gate.
      voidDate: "1999-01-01"
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
  })

  Then(
    "the voiding stays pending until the school leadership approves it, with the reason and author traced",
    function*() {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const paymentId = yield* Ref.get(world.paymentId)
      const installmentId = yield* Ref.get(world.installmentId)

      const pendingVoid = yield* findVoidForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
      assert.ok(Option.isSome(pendingVoid))
      if (Option.isSome(pendingVoid)) {
        assert.strictEqual(pendingVoid.value.status, "pending_approval")
        assert.strictEqual(pendingVoid.value.reason, "recorded three days earlier")
        assert.ok(pendingVoid.value.requested_by_subject_id.length > 0)
      }

      // Nothing has reverted yet — the void hasn't taken effect.
      const status = yield* installmentStatus(schoolId!, installmentId!).pipe(Effect.orDie)
      assert.strictEqual(status, "paid")
      const voidReceipt = yield* findVoidReceiptForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
      assert.ok(Option.isNone(voidReceipt))
    }
  )
})
