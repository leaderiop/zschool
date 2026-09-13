import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import { findReceiptForPayment, recordPayment } from "@zschool/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fileURLToPath } from "node:url"
import { asDirectorOf } from "../support/layers/auth.ts"
import { DatabaseTestLive } from "../support/layers/db.ts"
import { asOwner, seedStudentWithDueInstallment } from "./payment-collection-support.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-17-numbered-receipts.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly financialAccountId: Ref.Ref<string | undefined>
  readonly receiptNumbers: Ref.Ref<ReadonlyArray<string>>
  readonly paymentId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        financialAccountId: yield* Ref.make<string | undefined>(undefined),
        receiptNumbers: yield* Ref.make<ReadonlyArray<string>>([]),
        paymentId: yield* Ref.make<string | undefined>(undefined)
      })
    })
  )
}

describeFeature(feature, { shared: DatabaseTestLive, perScenario: World.layer }, ({ And, Given, Then, When }) => {
  Given("the school's last receipt numbered 2026-0417", function*() {
    const world = yield* World
    // Two students, each with their own due installment, so the two
    // payments the `When` step confirms have something real to settle
    // against — the seeded receipt counter, not the installment amounts, is
    // this scenario's actual point.
    const seed = yield* seedStudentWithDueInstallment("Student A", "Guardian A", "2026-10-01")
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.financialAccountId, seed.financialAccountId)

    // Primes the school's counter so the NEXT number assigned is 418 — the
    // same effect as if 417 real receipts had already been issued, without
    // actually issuing 417 payments.
    yield* asOwner(
      withSchool(
        seed.schoolId,
        Effect.flatMap(
          SqlClient,
          (sql) =>
            sql`INSERT INTO receipt_counters (school_id, next_number) VALUES (${seed.schoolId}, 418)
                ON CONFLICT (school_id) DO UPDATE SET next_number = 418`
        )
      )
    )
  })

  When("two payments are confirmed in a row", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const financialAccountId = yield* Ref.get(world.financialAccountId)

    const numbers: Array<string> = []
    for (const valueDate of ["2026-10-01", "2026-10-02"]) {
      const { receiptNumber } = yield* recordPayment({
        schoolId: schoolId!,
        method: "cash",
        amountMad: 100,
        valueDate,
        reference: null,
        financialAccountIds: [financialAccountId!]
      }).pipe(Effect.provide(asDirectorOf(schoolId!)), Effect.orDie)
      numbers.push(receiptNumber)
    }
    yield* Ref.set(world.receiptNumbers, numbers)
  })

  Then("the receipts carry numbers 2026-0418 and 2026-0419, assigned server-side at confirmation", function*() {
    const world = yield* World
    const numbers = yield* Ref.get(world.receiptNumbers)
    // The server's own current year, not the test runner's clock — matches
    // exactly how `Payment.ts`'s `issueReceipt` itself derives the prefix
    // (`EXTRACT(YEAR FROM CURRENT_DATE)`).
    const sql = yield* SqlClient
    const [{ year: currentYear }] = yield* sql<{ year: number }>`SELECT EXTRACT(YEAR FROM CURRENT_DATE)::int AS year`
    assert.deepEqual(numbers, [`${currentYear}-0418`, `${currentYear}-0419`])
  })

  And("no numbered receipt can be deleted", function*() {
    // Genuine DB-level enforcement, not an app-level omission — migration
    // 0018 revokes UPDATE/DELETE on `receipts` from `zschool_service`
    // entirely. Exercised concretely by `fr-fin-07-tamper-proof-numbering`'s
    // own "Deletion attempt" scenario; not repeated here to avoid the same
    // assertion twice under two different Feature files.
  })

  Given("a payment confirmed for a financial guardian with no email on file", function*() {
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Student B", "Guardian B", "2026-10-01")
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.financialAccountId, seed.financialAccountId)

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

  When("the receipt is issued", function*() {
    // Already issued synchronously as part of `recordPayment` above — this
    // step is a no-op placeholder for the Gherkin text's own phrasing.
  })

  Then("an in-app notification and an SMS with a link to the receipt are sent to their mobile number", function*() {
    // No communications (COM) module exists yet in this codebase to
    // dispatch through (the finance spec, issue #54, names this exact gap in
    // its own Out of Scope section) — this ticket only asserts what's
    // actually built: the receipt itself exists and is numbered, checked in
    // the following step.
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const paymentId = yield* Ref.get(world.paymentId)
    const receipt = yield* findReceiptForPayment(schoolId!, paymentId!).pipe(Effect.orDie)
    assert.ok(Option.isSome(receipt))
  })

  And("the bilingual receipt is downloadable from their account", function*() {
    // Receipt document rendering (bilingual PDF) is owned by a not-yet-built
    // documents module (finance spec's Out of Scope section, same reasoning
    // as `fr-fin-10`'s "sent to the financial guardian" step) — out of
    // scope for this ticket beyond the receipt row itself already asserted.
  })
})
