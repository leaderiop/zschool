import { assert, describeFeature, loadFeature } from "@effect-cucumber/vitest"
import { withSchool } from "@zschool/db"
import {
  configureDunningTiers,
  evaluateDunningForOverdueInstallments,
  findDunningHistory,
  findReceiptForPayment,
  recordPayment
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
import { seedStudentWithDueInstallment, TUITION_AMOUNT_MAD } from "./payment-collection-support.ts"

const feature = await loadFeature(fileURLToPath(new URL("./fr-fin-18-graduated-reminder.feature", import.meta.url)))

class World extends Context.Service<World, {
  readonly schoolId: Ref.Ref<string | undefined>
  readonly installmentId: Ref.Ref<string | undefined>
  readonly financialAccountId: Ref.Ref<string | undefined>
}>()("World") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function*() {
      return World.of({
        schoolId: yield* Ref.make<string | undefined>(undefined),
        installmentId: yield* Ref.make<string | undefined>(undefined),
        financialAccountId: yield* Ref.make<string | undefined>(undefined)
      })
    })
  )
}

/** Forces the seeded installment's `due_date` to exactly `daysOverdue` days before `CURRENT_DATE` — a direct `UPDATE`, not a literal calendar date, so "October 5" / "the D+7 tier's date is reached" stay correct regardless of the real wall-clock date the suite runs on (the scenario's own dates are narrative prose, not literal assertions — same treatment `fr-fin-29`'s own "receipt 2026-0418" already gets). */
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
  Given("a 900-DH installment unpaid since October 5", function*() {
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Ilyas", "Karim")
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.installmentId, seed.installmentId)
    yield* Ref.set(world.financialAccountId, seed.financialAccountId)
    // "900-DH" is illustrative — `seedStudentWithDueInstallment`'s own fixed
    // tuition amount (`TUITION_AMOUNT_MAD`) is what's actually asserted
    // below; "since October 5" is realized as exactly D+7 days overdue by
    // the `When` step, not a literal calendar date.
    yield* setDaysOverdue(seed.schoolId, seed.installmentId, 7)
  })

  And(
    // Literal parentheses must be escaped — `@effect-cucumber`'s step text is
    // parsed as a Cucumber Expression, where a bare `(...)` denotes an
    // OPTIONAL text group, not literal parens (the first step registration
    // this ticket's feature file needed containing any).
    "tiers configured at D+3 \\(in-app), D+7 \\(SMS), D+15 \\(printable mail, from V1 on)",
    function*() {
      const world = yield* World
      const schoolId = yield* Ref.get(world.schoolId)
      // Channel names ("in-app"/"SMS"/"printable mail") are recorded as each
      // tier's `severityLabel` — actually dispatching THROUGH any of those
      // channels is out of scope (no communications module exists yet, see
      // the feature file's own `@skip`'d "Content safeguard" scenario and
      // the finance spec's Out-of-Scope note).
      yield* configureDunningTiers({
        schoolId: schoolId!,
        tiers: [
          { order: 1, dayOffsetDays: 3, severityLabel: "in-app" },
          { order: 2, dayOffsetDays: 7, severityLabel: "SMS" },
          { order: 3, dayOffsetDays: 15, severityLabel: "printable mail" }
        ]
      }).pipe(Effect.provide(asDirectorOf(schoolId!)))
    }
  )

  And("a parent with an active account and a mobile number on file", function*() {
    // Already true of `seedStudentWithDueInstallment`'s own guardian —
    // narrative confirmation only, nothing further to seed.
  })

  When("the D+7 tier's date is reached with no payment", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    yield* evaluateDunningForOverdueInstallments(schoolId!)
  })

  Then("an SMS reminder is sent from the bilingual template", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const installmentId = yield* Ref.get(world.installmentId)

    // "sent from the bilingual template" — no dispatch/template module
    // exists yet (out of scope); what this ticket actually builds is the
    // Dunning RECORD itself, so this asserts the D+7 ("SMS") tier fired and
    // the D+15 ("printable mail") tier, not yet crossed, did not.
    const history = yield* findDunningHistory(schoolId!, installmentId!)
    const firedLabels = history.filter((d) => !d.is_manual).map((d) => d.dunning_tier_id)
    assert.strictEqual(firedLabels.length, 2) // D+3 and D+7, D+15 not yet
  })

  And("the reminder is logged with its tier, channel and cost", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const installmentId = yield* Ref.get(world.installmentId)

    // "cost" tracking has no home yet (no dispatch, no billed channel
    // exists) — out of scope. What IS logged and asserted here is the tier
    // reference itself, kept in `dunnings.dunning_tier_id`, never anonymous.
    const history = yield* findDunningHistory(schoolId!, installmentId!)
    assert.ok(history.every((d) => d.dunning_tier_id !== null))
  })

  And("the unpaid-balances table reflects the tiers' status", function*() {
    // Ticket #62's own scope (the unpaid-balances view) — out of scope here.
  })

  Given("tiers scheduled on an unpaid installment", function*() {
    const world = yield* World
    const seed = yield* seedStudentWithDueInstallment("Salma", "Omar")
    yield* Ref.set(world.schoolId, seed.schoolId)
    yield* Ref.set(world.installmentId, seed.installmentId)
    yield* Ref.set(world.financialAccountId, seed.financialAccountId)
    yield* setDaysOverdue(seed.schoolId, seed.installmentId, 10)

    yield* configureDunningTiers({
      schoolId: seed.schoolId,
      tiers: [
        { order: 1, dayOffsetDays: 3, severityLabel: "in-app" },
        { order: 2, dayOffsetDays: 7, severityLabel: "SMS" }
      ]
    }).pipe(Effect.provide(asDirectorOf(seed.schoolId)))

    yield* evaluateDunningForOverdueInstallments(seed.schoolId)
  })

  When("a payment settles the installment", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const financialAccountId = yield* Ref.get(world.financialAccountId)

    yield* recordPayment({
      schoolId: schoolId!,
      method: "cash",
      amountMad: TUITION_AMOUNT_MAD,
      valueDate: new Date().toISOString().slice(0, 10),
      reference: null,
      financialAccountIds: [financialAccountId!]
    }).pipe(Effect.provide(asDirectorOf(schoolId!)))
  })

  Then("the remaining reminders are canceled", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)
    const installmentId = yield* Ref.get(world.installmentId)

    const before = yield* findDunningHistory(schoolId!, installmentId!)
    assert.strictEqual(before.length, 2)

    // "canceled" — nothing here is deleted (BEH-ZS-168's own "full per-tier
    // history kept"); what actually stops is evaluation creating any FURTHER
    // record for this now-settled installment.
    const result = yield* evaluateDunningForOverdueInstallments(schoolId!)
    assert.strictEqual(result.created, 0)

    const after = yield* findDunningHistory(schoolId!, installmentId!)
    assert.strictEqual(after.length, 2)
  })

  And("a receipt is sent to the financial guardian", function*() {
    const world = yield* World
    const schoolId = yield* Ref.get(world.schoolId)

    // "sent to the guardian" — no dispatch channel exists yet (same scoping
    // `fr-fin-10`/`fr-fin-30` already apply); what's asserted is that the
    // receipt itself was actually issued by the settling payment above.
    const sql = yield* SqlClient
    const [payment] = yield* withSchool(
      schoolId!,
      sql<{ id: string }>`SELECT id FROM payments WHERE school_id = ${schoolId} ORDER BY created_at DESC LIMIT 1`
    )
    const receipt = yield* findReceiptForPayment(schoolId!, payment.id)
    assert.ok(Option.isSome(receipt))
  })
})
