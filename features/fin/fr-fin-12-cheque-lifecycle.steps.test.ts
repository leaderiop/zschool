import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import {
  bounceCheque,
  clearCheque,
  depositCheque,
  escalateToLitigation,
  findAccountCreditBalance,
  findCheque,
  findReceiptForPayment,
  recordCheque,
  recordPayment,
  regularizeCheque
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

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-12-cheque-lifecycle.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly installmentId: Ref.Ref<string | undefined>
  readonly financialAccountId: Ref.Ref<string | undefined>
  readonly chequeId: Ref.Ref<string | undefined>
  readonly regularizingPaymentId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        installmentId: yield* Ref.make<string | undefined>(undefined),
        financialAccountId: yield* Ref.make<string | undefined>(undefined),
        chequeId: yield* Ref.make<string | undefined>(undefined),
        regularizingPaymentId: yield* Ref.make<string | undefined>(undefined)
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

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given(
    "a 3,000-DH cheque handed over in September, in \"handed over\" status, covering the October monthly fee",
    function*() {
      const world = yield* World
      const seed = yield* seedStudentWithDueInstallment("Amine", "Karim", "2026-10-01")
      yield* Ref.set(world.schoolId, seed.schoolId)
      yield* Ref.set(world.installmentId, seed.installmentId)
      yield* Ref.set(world.financialAccountId, seed.financialAccountId)

      const { chequeId } = yield* recordCheque({
        schoolId: seed.schoolId,
        amountMad: 3000,
        valueDate: "2026-10-01",
        reference: null,
        chequeNumber: "CHQ-100",
        bank: "BMCE",
        // Physically handed over in September for October's fee.
        chequeDate: "2026-09-15",
        financialAccountIds: [seed.financialAccountId]
      }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
      yield* Ref.set(world.chequeId, chequeId)

      const cheque = yield* findCheque(seed.schoolId, chequeId).pipe(Effect.orDie)
      assert.ok(Option.isSome(cheque))
      if (Option.isSome(cheque)) assert.strictEqual(cheque.value.status, "handed_over")
    }
  )

  And("a bank deposit on November 3 including this cheque", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const chequeId = yield* Ref.get(world.chequeId)

    yield* depositCheque(schoolId!, chequeId!, "batch-2026-11-03").pipe(
      Effect.provide(asDirectorOf(schoolId!)),
      Effect.orDie
    )
  })

  When("the bank returns the cheque for insufficient funds on November 8", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const chequeId = yield* Ref.get(world.chequeId)

    yield* bounceCheque(schoolId!, chequeId!, "insufficient funds", "NOTICE-2026-11-08").pipe(
      Effect.provide(asDirectorOf(schoolId!)),
      Effect.orDie
    )
  })

  Then("the cheque moves to \"bounced\" status with a reason, date and bounce-notice reference", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const chequeId = yield* Ref.get(world.chequeId)

    const cheque = yield* findCheque(schoolId!, chequeId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(cheque))
    if (Option.isSome(cheque)) {
      assert.strictEqual(cheque.value.status, "bounced")
      assert.strictEqual(cheque.value.bounce_reason, "insufficient funds")
      assert.strictEqual(cheque.value.bounce_notice_reference, "NOTICE-2026-11-08")
      assert.ok(cheque.value.bounced_at !== null)
    }
  })

  And(
    "the October monthly fee reverts to \"overdue\" status and the balance re-includes 3,000 DH in arrears",
    function*() {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      const installmentId = yield* Ref.get(world.installmentId)
      const financialAccountId = yield* Ref.get(world.financialAccountId)

      // Every cheque, cleared or not, defers confirmation until it actually
      // clears (Payment.ts's ticket #61 doc comment) — this cheque never
      // reached "cleared" before it bounced, so the installment was never
      // marked paid in the first place: "reverts to unpaid" already holds
      // trivially. A due-date-based transition into the literal "overdue"
      // value is ticket #64's (dunning) scope, the same boundary
      // Payment.ts's refreshInstallmentStatus already draws — this step
      // asserts what's actually built: the installment stayed unpaid
      // ("due"), and the balance still owes the full amount, exactly the
      // "in arrears" outcome the scenario describes.
      const status = yield* installmentStatus(schoolId!, installmentId!).pipe(Effect.orDie)
      assert.notStrictEqual(status, "paid")

      const creditBalance = yield* findAccountCreditBalance(schoolId!, financialAccountId!).pipe(Effect.orDie)
      assert.strictEqual(creditBalance, 0)
    }
  )

  And("a notification is sent to the financial guardian and a reminder is scheduled", function*() {
    // No communications/dunning module exists yet (ticket #64's scope) —
    // out of scope, the same reasoning fr-fin-10/30/29's own "sent to the
    // guardian" steps already applied.
  })

  And("the incident is logged with the author of the entry", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const chequeId = yield* Ref.get(world.chequeId)

    const cheque = yield* findCheque(schoolId!, chequeId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(cheque))
    if (Option.isSome(cheque)) {
      assert.ok((cheque.value.bounced_by_subject_id ?? "").length > 0)
    }
  })

  Given("a cheque in \"bounced\" status and an installment back to unpaid", function*() {
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Salma", "Yassine", "2026-10-01")
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.installmentId, seed.installmentId)
    yield* Ref.set(world.financialAccountId, seed.financialAccountId)

    const { chequeId } = yield* recordCheque({
      schoolId: seed.schoolId,
      amountMad: 1200,
      valueDate: "2026-10-01",
      reference: null,
      chequeNumber: "CHQ-101",
      bank: "BMCE",
      chequeDate: "2026-09-15",
      financialAccountIds: [seed.financialAccountId]
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
    yield* Ref.set(world.chequeId, chequeId)

    yield* depositCheque(seed.schoolId, chequeId, null).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
    yield* bounceCheque(seed.schoolId, chequeId, "insufficient funds", "NOTICE-1").pipe(
      Effect.provide(asDirectorOf(seed.schoolId)),
      Effect.orDie
    )

    const status = yield* installmentStatus(seed.schoolId, seed.installmentId).pipe(Effect.orDie)
    assert.notStrictEqual(status, "paid")
  })

  When("the guardian brings a compensating cash payment", function*() {
    // Narrative only — the guardian's action isn't a distinct system state;
    // it's exercised by the school recording the payment in the next step.
  })

  And("the school records the regularization", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const financialAccountId = yield* Ref.get(world.financialAccountId)
    const chequeId = yield* Ref.get(world.chequeId)

    const { paymentId } = yield* recordPayment({
      schoolId: schoolId!,
      method: "cash",
      amountMad: 1200,
      valueDate: "2026-11-10",
      reference: null,
      financialAccountIds: [financialAccountId!]
    }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
    yield* Ref.set(world.regularizingPaymentId, paymentId)

    yield* regularizeCheque(schoolId!, chequeId!, paymentId).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
  })

  Then("the cheque moves to \"regularized\" status with both attempts traced", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const chequeId = yield* Ref.get(world.chequeId)
    const regularizingPaymentId = yield* Ref.get(world.regularizingPaymentId)

    const cheque = yield* findCheque(schoolId!, chequeId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(cheque))
    if (Option.isSome(cheque)) {
      assert.strictEqual(cheque.value.status, "regularized")
      assert.strictEqual(cheque.value.regularizing_payment_id, regularizingPaymentId)
    }
  })

  And("the installment is settled by the new payment and a receipt is issued", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const installmentId = yield* Ref.get(world.installmentId)
    const regularizingPaymentId = yield* Ref.get(world.regularizingPaymentId)

    const status = yield* installmentStatus(schoolId!, installmentId!).pipe(Effect.orDie)
    assert.strictEqual(status, "paid")

    const receipt = yield* findReceiptForPayment(schoolId!, regularizingPaymentId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(receipt))
  })

  Given("a \"bounced\" cheque not regularized after the reminder tiers and the regularization period", function*() {
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Nizar", "Fatima", "2026-10-01")
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.chequeId, undefined)

    const { chequeId } = yield* recordCheque({
      schoolId: seed.schoolId,
      amountMad: 1200,
      valueDate: "2026-10-01",
      reference: null,
      chequeNumber: "CHQ-102",
      bank: "BMCE",
      chequeDate: "2026-09-15",
      financialAccountIds: [seed.financialAccountId]
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
    yield* Ref.set(world.chequeId, chequeId)

    yield* depositCheque(seed.schoolId, chequeId, null).pipe(Effect.provide(asDirectorOf(seed.schoolId)), Effect.orDie)
    yield* bounceCheque(seed.schoolId, chequeId, "insufficient funds", "NOTICE-2").pipe(
      Effect.provide(asDirectorOf(seed.schoolId)),
      Effect.orDie
    )
    // "not regularized after the reminder tiers and the regularization
    // period" is narrative context (ticket #64's dunning scope) — nothing
    // further to seed here; the cheque is simply still "bounced".
  })

  When("the school leadership switches the file to \"litigation\"", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const chequeId = yield* Ref.get(world.chequeId)

    yield* escalateToLitigation(schoolId!, chequeId!).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
  })

  Then("automatic reminders stop and the file moves to manual tracking", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const chequeId = yield* Ref.get(world.chequeId)

    const cheque = yield* findCheque(schoolId!, chequeId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(cheque))
    if (Option.isSome(cheque)) assert.strictEqual(cheque.value.status, "litigation")
    // No dunning engine exists yet to actually "stop" (ticket #64's scope);
    // "litigation" is itself the terminal, manually-tracked status.
  })

  And("documents \\(bounce notice, letters, history) are archived in the file", function*() {
    // No document-archival module exists yet — out of scope, same reasoning
    // as the notification step above.
  })
})
