import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { addFeeItem, createFeeSchedule } from "./FeeSchedule.ts"
import { closeEnrollment, insertEnrollment } from "./Enrollment.ts"
import { ensureFinancialAccount, findCurrentFinancialGuardian, designateFinancialGuardian } from "./FinancialAccount.ts"
import { attachGuardianProfile, createPerson, GuardianQualitiesSchema, recordGuardianRelationship } from "./Identity.ts"
import { GuardianPersonId, StudentPersonId } from "./Ids.ts"
import { findInstallments } from "./PaymentSchedule.ts"
import {
  approveVoid,
  bounceCheque,
  clearCheque,
  confirmPayment,
  configureVoidApprovalPolicy,
  depositCheque,
  escalateToLitigation,
  findAccountCreditBalance,
  findCheque,
  findChequeForPayment,
  findPayment,
  findPaymentAllocations,
  findReceiptForPayment,
  findVoidForPayment,
  findVoidReceiptForPayment,
  InvalidChequeTransitionError,
  InvalidPaymentError,
  PaymentNotPendingError,
  PaymentNotVoidableError,
  recordBankTransfer,
  recordCheque,
  recordChequeAtStatus,
  recordPayment,
  regularizeCheque,
  requestVoid,
  VoidAlreadyRequestedError,
  VoidNotPendingError
} from "./Payment.ts"
import { EntityNotFoundError } from "./Ownership.ts"

/** Same `authorized`-gating context as `TeacherImport.test.ts`'s own `asDirectorOf`. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "cashier-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

/** Seeds school -> year -> section -> cycle -> level -> class -> a monthly-tuition fee schedule, then enrolls `studentCount` students (1 or 2, for the multi-sibling scenarios) at `effectiveDate`. */
const withSeededAccounts = (studentCount: 1 | 2, effectiveDate = "2026-09-01") =>
  Effect.fn(function*<A, E, R>(
    use: (seed: { schoolId: string; financialAccountIds: ReadonlyArray<string> }) => Effect.Effect<A, E, R>
  ) {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Payment test school') RETURNING id`
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
          amountMad: 1200,
          isMandatory: true
        }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

        const financialAccountIds: Array<string> = []
        for (let i = 0; i < studentCount; i++) {
          const studentPersonId = yield* randomUUID
          yield* sql`
            INSERT INTO persons (id, first_name, last_name, date_of_birth)
            VALUES (${studentPersonId}, 'Student', ${`Child${i}`}, '2015-01-01')
          `
          const enrollment = yield* insertEnrollment({
            schoolId: school.id,
            academicYearId: year.id,
            studentPersonId,
            classId: cls.id,
            effectiveDate,
            hasLegalGuardian: false,
            hasFinancialGuardian: false
          })
          const [account] = yield* sql<{ id: string }>`
            SELECT id FROM financial_accounts WHERE enrollment_id = ${enrollment.id}
          `
          financialAccountIds.push(account.id)
        }

        return yield* use({ schoolId: school.id, financialAccountIds })
      })
    )
  }, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

const firstInstallmentId = Effect.fn(function*(financialAccountId: string) {
  const sql = yield* SqlClient
  const [row] = yield* sql<{ id: string }>`
    SELECT id FROM installments WHERE financial_account_id = ${financialAccountId} ORDER BY due_date ASC LIMIT 1
  `
  return row.id
})

/** The actual calendar day a payment's `created_at` (`clock_timestamp()`) fell on — tests compare `requestVoid`'s `voidDate` against this rather than a hand-picked constant, since the payment is inserted at real wall-clock time. */
const paymentCreatedDay = Effect.fn(function*(paymentId: string) {
  const sql = yield* SqlClient
  const [row] = yield* sql<{ day: string }>`SELECT created_at::date::text AS day FROM payments WHERE id = ${paymentId}`
  return row.day
})

const installmentStatus = Effect.fn(function*(installmentId: string) {
  const sql = yield* SqlClient
  const [row] = yield* sql<{ status: string }>`SELECT status FROM installments WHERE id = ${installmentId}`
  return row.status
})

describe("Payment (ticket #59 / BEH-ZS-157/160/163/167/180)", () => {
  it.effect("a cash payment settles the oldest due installment and issues a numbered receipt", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { paymentId, receiptNumber } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        expect(receiptNumber).toMatch(/^\d{4}-\d{4}$/)

        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        const [installment] = yield* withSchool(
          schoolId,
          Effect.flatMap(SqlClient, (sql) => sql<{ status: string }>`SELECT status FROM installments WHERE id = ${installmentId}`)
        )
        expect(installment.status).toBe("paid")

        const receipt = yield* findReceiptForPayment(schoolId, paymentId)
        expect(Option.isSome(receipt)).toBe(true)
        if (Option.isSome(receipt)) expect(receipt.value.receipt_number).toBe(receiptNumber)
      })
    ))

  it.effect("a partial cash payment leaves the installment partially paid", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 700,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        const [installment] = yield* withSchool(
          schoolId,
          Effect.flatMap(SqlClient, (sql) => sql<{ status: string }>`SELECT status FROM installments WHERE id = ${installmentId}`)
        )
        expect(installment.status).toBe("partially_paid")
      })
    ))

  it.effect("a surplus beyond what's due becomes a credit on the guardian's account", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1500,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        const [installment] = yield* withSchool(
          schoolId,
          Effect.flatMap(SqlClient, (sql) => sql<{ status: string }>`SELECT status FROM installments WHERE id = ${installmentId}`)
        )
        expect(installment.status).toBe("paid")

        const credit = yield* findAccountCreditBalance(schoolId, financialAccountIds[0])
        expect(credit).toBe(300)
      })
    ))

  it.effect("a manual allocation overrides the oldest-first default", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ id: string }>`
            SELECT id FROM installments WHERE financial_account_id = ${financialAccountIds[0]} ORDER BY due_date ASC
          `
        )
        const secondInstallmentId = rows[1].id

        yield* recordPayment(
          {
            schoolId,
            method: "cash",
            amountMad: 1200,
            valueDate: "2026-09-05",
            reference: null,
            financialAccountIds
          },
          [{ installmentId: secondInstallmentId, amountMad: 1200 }]
        ).pipe(Effect.provide(asDirectorOf(schoolId)))

        const [second] = yield* withSchool(
          schoolId,
          sql<{ status: string }>`SELECT status FROM installments WHERE id = ${secondInstallmentId}`
        )
        expect(second.status).toBe("paid")

        const firstInstallment = yield* firstInstallmentId(financialAccountIds[0])
        const [first] = yield* withSchool(
          schoolId,
          sql<{ status: string }>`SELECT status FROM installments WHERE id = ${firstInstallment}`
        )
        expect(first.status).toBe("due")
      })
    ))

  it.effect("an over-allocation beyond an installment's remaining owed amount is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        const result = yield* recordPayment(
          {
            schoolId,
            method: "cash",
            amountMad: 5000,
            valueDate: "2026-09-05",
            reference: null,
            financialAccountIds
          },
          [{ installmentId, amountMad: 5000 }]
        ).pipe(Effect.provide(asDirectorOf(schoolId)), Effect.flip)
        expect(result).toBeInstanceOf(InvalidPaymentError)
      })
    ))

  it.effect("allocating against an installment outside the named financial accounts is rejected", () =>
    withSeededAccounts(2)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const otherAccountInstallmentId = yield* firstInstallmentId(financialAccountIds[1])
        const result = yield* recordPayment(
          {
            schoolId,
            method: "cash",
            amountMad: 1200,
            valueDate: "2026-09-05",
            reference: null,
            financialAccountIds: [financialAccountIds[0]]
          },
          [{ installmentId: otherAccountInstallmentId, amountMad: 1200 }]
        ).pipe(Effect.provide(asDirectorOf(schoolId)), Effect.flip)
        expect(result).toBeInstanceOf(EntityNotFoundError)
      })
    ))

  it.effect("a family payment covering two siblings splits oldest-first across both accounts in one receipt", () =>
    withSeededAccounts(2)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 2400,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const allocations = yield* findPaymentAllocations(schoolId, paymentId)
        expect(allocations).toHaveLength(2)
        const totalAllocated = allocations.reduce((sum, a) => sum + a.amount_mad, 0)
        expect(totalAllocated).toBe(2400)

        const receipt = yield* findReceiptForPayment(schoolId, paymentId)
        expect(Option.isSome(receipt)).toBe(true)
      })
    ))

  it.effect("a bank transfer starts pending confirmation and affects no balance until confirmed", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const paymentId = yield* recordBankTransfer({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: "YOUSSEF OCT"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const pending = yield* findPayment(schoolId, paymentId)
        expect(Option.isSome(pending)).toBe(true)
        if (Option.isSome(pending)) expect(pending.value.status).toBe("pending_confirmation")

        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        const [beforeConfirm] = yield* withSchool(
          schoolId,
          Effect.flatMap(SqlClient, (sql) => sql<{ status: string }>`SELECT status FROM installments WHERE id = ${installmentId}`)
        )
        expect(beforeConfirm.status).toBe("due")

        yield* confirmPayment(schoolId, paymentId, financialAccountIds).pipe(Effect.provide(asDirectorOf(schoolId)))

        const confirmed = yield* findPayment(schoolId, paymentId)
        expect(Option.isSome(confirmed)).toBe(true)
        if (Option.isSome(confirmed)) expect(confirmed.value.status).toBe("confirmed")

        const [afterConfirm] = yield* withSchool(
          schoolId,
          Effect.flatMap(SqlClient, (sql) => sql<{ status: string }>`SELECT status FROM installments WHERE id = ${installmentId}`)
        )
        expect(afterConfirm.status).toBe("paid")
      })
    ))

  it.effect("confirming an already-confirmed payment is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const paymentId = yield* recordBankTransfer({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: "REF"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* confirmPayment(schoolId, paymentId, financialAccountIds).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* confirmPayment(schoolId, paymentId, financialAccountIds).pipe(
          Effect.provide(asDirectorOf(schoolId)),
          Effect.flip
        )
        expect(result).toBeInstanceOf(PaymentNotPendingError)
      })
    ))

  it.effect("receipt numbers are assigned sequentially, per school, at confirmation", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const first = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 100,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        const second = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 100,
          valueDate: "2026-09-06",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const firstSeq = Number(first.receiptNumber.split("-")[1])
        const secondSeq = Number(second.receiptNumber.split("-")[1])
        expect(secondSeq).toBe(firstSeq + 1)
      })
    ))
})

describe("Payment void/reversing entries (ticket #60 / BEH-ZS-179)", () => {
  it.effect("voiding a same-day payment reverts its installment, issues a void receipt in the same sequence, and flags the original", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { paymentId, receiptNumber } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        expect(yield* installmentStatus(installmentId)).toBe("paid")
        const sameDay = yield* paymentCreatedDay(paymentId)

        const result = yield* requestVoid({
          schoolId,
          paymentId,
          reason: "wrong student",
          voidDate: sameDay
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(result.status).toBe("finalized")
        expect(result.receiptNumber).toBeDefined()

        expect(yield* installmentStatus(installmentId)).toBe("due")

        const originalReceipt = yield* findReceiptForPayment(schoolId, paymentId)
        expect(Option.isSome(originalReceipt)).toBe(true)
        if (Option.isSome(originalReceipt)) {
          expect(originalReceipt.value.receipt_number).toBe(receiptNumber)
          expect(originalReceipt.value.voided).toBe(true)
        }

        const voidReceipt = yield* findVoidReceiptForPayment(schoolId, paymentId)
        expect(Option.isSome(voidReceipt)).toBe(true)
        if (Option.isSome(voidReceipt)) {
          const originalSeq = Number(receiptNumber.split("-")[1])
          const voidSeq = Number(voidReceipt.value.split("-")[1])
          expect(voidSeq).toBe(originalSeq + 1)
        }
      })
    ))

  it.effect("voiding reverses a surplus credit the voided payment created", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1500,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(yield* findAccountCreditBalance(schoolId, financialAccountIds[0])).toBe(300)
        const sameDay = yield* paymentCreatedDay(paymentId)

        yield* requestVoid({ schoolId, paymentId, reason: "duplicate", voidDate: sameDay }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        expect(yield* findAccountCreditBalance(schoolId, financialAccountIds[0])).toBe(0)
      })
    ))

  it.effect("voiding outside the entry's own day stays pending until approved, tracing reason and author", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        const installmentId = yield* firstInstallmentId(financialAccountIds[0])

        const result = yield* requestVoid({
          schoolId,
          paymentId,
          reason: "recorded three days late",
          voidDate: "2099-01-01"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(result.status).toBe("pending_approval")
        expect(result.receiptNumber).toBeUndefined()

        // Nothing reverted yet — the void hasn't taken effect.
        expect(yield* installmentStatus(installmentId)).toBe("paid")
        const receiptBeforeApproval = yield* findVoidReceiptForPayment(schoolId, paymentId)
        expect(Option.isNone(receiptBeforeApproval)).toBe(true)

        const pendingVoid = yield* findVoidForPayment(schoolId, paymentId)
        expect(Option.isSome(pendingVoid)).toBe(true)
        if (Option.isSome(pendingVoid)) {
          expect(pendingVoid.value.reason).toBe("recorded three days late")
          expect(pendingVoid.value.requested_by_subject_id).toBe("cashier-1")
          expect(pendingVoid.value.status).toBe("pending_approval")
        }

        yield* approveVoid(schoolId, paymentId).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(yield* installmentStatus(installmentId)).toBe("due")
        const receiptAfterApproval = yield* findVoidReceiptForPayment(schoolId, paymentId)
        expect(Option.isSome(receiptAfterApproval)).toBe(true)
      })
    ))

  it.effect("approving a void that isn't pending is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* approveVoid(schoolId, paymentId).pipe(Effect.provide(asDirectorOf(schoolId)), Effect.flip)
        expect(result).toBeInstanceOf(VoidNotPendingError)
      })
    ))

  it.effect("voiding a payment above the school's configured amount threshold requires approval even same-day", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        yield* configureVoidApprovalPolicy({ schoolId, amountThresholdMad: 1000 }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        const sameDay = yield* paymentCreatedDay(paymentId)

        const result = yield* requestVoid({
          schoolId,
          paymentId,
          reason: "over threshold",
          voidDate: sameDay
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(result.status).toBe("pending_approval")
      })
    ))

  it.effect("voiding a payment under the school's configured amount threshold, same-day, needs no approval", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        yield* configureVoidApprovalPolicy({ schoolId, amountThresholdMad: 5000 }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        const sameDay = yield* paymentCreatedDay(paymentId)

        const result = yield* requestVoid({
          schoolId,
          paymentId,
          reason: "under threshold",
          voidDate: sameDay
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(result.status).toBe("finalized")
      })
    ))

  it.effect("voiding an already-voided payment is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        const sameDay = yield* paymentCreatedDay(paymentId)
        yield* requestVoid({ schoolId, paymentId, reason: "first void", voidDate: sameDay }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const result = yield* requestVoid({ schoolId, paymentId, reason: "second attempt", voidDate: sameDay }).pipe(
          Effect.provide(asDirectorOf(schoolId)),
          Effect.flip
        )
        expect(result).toBeInstanceOf(PaymentNotVoidableError)
      })
    ))

  it.effect("requesting a second void while the first is still pending approval is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* requestVoid({ schoolId, paymentId, reason: "first", voidDate: "2099-01-01" }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        // Still `confirmed` (the first void is only `pending_approval`), so
        // this reaches the `UNIQUE (payment_id)` guard, not the
        // already-`voided` status check above.
        const result = yield* requestVoid({ schoolId, paymentId, reason: "second", voidDate: "2099-01-01" }).pipe(
          Effect.provide(asDirectorOf(schoolId)),
          Effect.flip
        )
        expect(result).toBeInstanceOf(VoidAlreadyRequestedError)
      })
    ))

  it.effect("voiding a still-pending bank transfer (never confirmed) is rejected", () =>
    withSeededAccounts(1)(({ schoolId }) =>
      Effect.gen(function*() {
        const paymentId = yield* recordBankTransfer({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: "REF"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* requestVoid({
          schoolId,
          paymentId,
          reason: "wrong",
          voidDate: "2026-09-05"
        }).pipe(Effect.provide(asDirectorOf(schoolId)), Effect.flip)
        expect(result).toBeInstanceOf(PaymentNotVoidableError)
      })
    ))

  it.effect("a void with an empty reason is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* requestVoid({ schoolId, paymentId, reason: "   ", voidDate: "2026-09-05" }).pipe(
          Effect.provide(asDirectorOf(schoolId)),
          Effect.flip
        )
        expect(result).toBeInstanceOf(InvalidPaymentError)
      })
    ))

  it.effect("a family payment split across two siblings' installments reverts every covered installment on void", () =>
    withSeededAccounts(2)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { paymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 2400,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        const firstChildInstallment = yield* firstInstallmentId(financialAccountIds[0])
        const secondChildInstallment = yield* firstInstallmentId(financialAccountIds[1])
        expect(yield* installmentStatus(firstChildInstallment)).toBe("paid")
        expect(yield* installmentStatus(secondChildInstallment)).toBe("paid")
        const sameDay = yield* paymentCreatedDay(paymentId)

        yield* requestVoid({ schoolId, paymentId, reason: "family payment error", voidDate: sameDay }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        expect(yield* installmentStatus(firstChildInstallment)).toBe("due")
        expect(yield* installmentStatus(secondChildInstallment)).toBe("due")
      })
    ))
})

describe("Cheque lifecycle (ticket #61 / REQ-ZS-140 / BEH-ZS-162)", () => {
  it.effect("a cheque stays pending and its installment unpaid until it clears", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        const { chequeId, paymentId } = yield* recordCheque({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-001",
          bank: "BMCE",
          chequeDate: "2026-09-05",
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        expect(yield* installmentStatus(installmentId)).toBe("due")
        const payment = yield* findPayment(schoolId, paymentId).pipe(Effect.orDie)
        expect(Option.isSome(payment) && payment.value.status).toBe("pending_confirmation")

        const cheque = yield* findCheque(schoolId, chequeId).pipe(Effect.orDie)
        expect(Option.isSome(cheque) && cheque.value.status).toBe("handed_over")
      })
    ))

  it.effect("depositing then clearing a cheque settles its installment and issues a receipt", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        const { chequeId, paymentId } = yield* recordCheque({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-002",
          bank: "BMCE",
          chequeDate: "2026-09-05",
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* depositCheque(schoolId, chequeId, "batch-1").pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(yield* installmentStatus(installmentId)).toBe("due")

        yield* clearCheque(schoolId, chequeId).pipe(Effect.provide(asDirectorOf(schoolId)))

        expect(yield* installmentStatus(installmentId)).toBe("paid")
        const payment = yield* findPayment(schoolId, paymentId).pipe(Effect.orDie)
        expect(Option.isSome(payment) && payment.value.status).toBe("confirmed")
        const receipt = yield* findReceiptForPayment(schoolId, paymentId).pipe(Effect.orDie)
        expect(Option.isSome(receipt)).toBe(true)
        const cheque = yield* findCheque(schoolId, chequeId).pipe(Effect.orDie)
        expect(Option.isSome(cheque) && cheque.value.status).toBe("cleared")
      })
    ))

  it.effect("clearing a cheque that hasn't been deposited is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { chequeId } = yield* recordCheque({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-003",
          bank: "BMCE",
          chequeDate: "2026-09-05",
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* clearCheque(schoolId, chequeId).pipe(Effect.provide(asDirectorOf(schoolId)), Effect.flip)
        expect(result).toBeInstanceOf(InvalidChequeTransitionError)
      })
    ))

  it.effect("a bounced cheque never marked its installment paid, and the amount stays in arrears", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        const { chequeId, paymentId } = yield* recordCheque({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-004",
          bank: "BMCE",
          chequeDate: "2026-09-05",
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* depositCheque(schoolId, chequeId, null).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* bounceCheque(schoolId, chequeId, "insufficient funds", "NOTICE-77").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const cheque = yield* findCheque(schoolId, chequeId).pipe(Effect.orDie)
        expect(Option.isSome(cheque) && cheque.value.status).toBe("bounced")
        expect(Option.isSome(cheque) && cheque.value.bounce_reason).toBe("insufficient funds")
        expect(Option.isSome(cheque) && cheque.value.bounce_notice_reference).toBe("NOTICE-77")
        expect(Option.isSome(cheque) && (cheque.value.bounced_by_subject_id?.length ?? 0) > 0).toBe(true)

        // Never confirmed, so nothing to revert — "stays unpaid" and "the
        // amount stays in arrears" both already hold.
        expect(yield* installmentStatus(installmentId)).toBe("due")
        const payment = yield* findPayment(schoolId, paymentId).pipe(Effect.orDie)
        expect(Option.isSome(payment) && payment.value.status).toBe("pending_confirmation")
        const balance = yield* findAccountCreditBalance(schoolId, financialAccountIds[0]).pipe(Effect.orDie)
        expect(balance).toBe(0)
      })
    ))

  it.effect("bouncing a cheque that hasn't been deposited is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { chequeId } = yield* recordCheque({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-005",
          bank: "BMCE",
          chequeDate: "2026-09-05",
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* bounceCheque(schoolId, chequeId, "reason", "ref").pipe(
          Effect.provide(asDirectorOf(schoolId)),
          Effect.flip
        )
        expect(result).toBeInstanceOf(InvalidChequeTransitionError)
      })
    ))

  it.effect(
    "regularizing a bounced cheque with a compensating payment settles the installment and traces both attempts",
    () =>
      withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
        Effect.gen(function*() {
          const installmentId = yield* firstInstallmentId(financialAccountIds[0])
          const { chequeId } = yield* recordCheque({
            schoolId,
            amountMad: 1200,
            valueDate: "2026-09-05",
            reference: null,
            chequeNumber: "CHQ-006",
            bank: "BMCE",
            chequeDate: "2026-09-05",
            financialAccountIds
          }).pipe(Effect.provide(asDirectorOf(schoolId)))
          yield* depositCheque(schoolId, chequeId, null).pipe(Effect.provide(asDirectorOf(schoolId)))
          yield* bounceCheque(schoolId, chequeId, "insufficient funds", "NOTICE-1").pipe(
            Effect.provide(asDirectorOf(schoolId))
          )

          const { paymentId: compensatingPaymentId } = yield* recordPayment({
            schoolId,
            method: "cash",
            amountMad: 1200,
            valueDate: "2026-09-10",
            reference: null,
            financialAccountIds
          }).pipe(Effect.provide(asDirectorOf(schoolId)))
          expect(yield* installmentStatus(installmentId)).toBe("paid")

          yield* regularizeCheque(schoolId, chequeId, compensatingPaymentId).pipe(
            Effect.provide(asDirectorOf(schoolId))
          )

          const cheque = yield* findCheque(schoolId, chequeId).pipe(Effect.orDie)
          expect(Option.isSome(cheque) && cheque.value.status).toBe("regularized")
          expect(Option.isSome(cheque) && cheque.value.regularizing_payment_id).toBe(compensatingPaymentId)
        })
      )
  )

  it.effect("regularizing a cheque that isn't bounced is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { chequeId } = yield* recordCheque({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-007",
          bank: "BMCE",
          chequeDate: "2026-09-05",
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        const { paymentId: otherPaymentId } = yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* regularizeCheque(schoolId, chequeId, otherPaymentId).pipe(
          Effect.provide(asDirectorOf(schoolId)),
          Effect.flip
        )
        expect(result).toBeInstanceOf(InvalidChequeTransitionError)
      })
    ))

  it.effect("a bounced cheque can be escalated to litigation, an explicit human-initiated transition", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { chequeId } = yield* recordCheque({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-008",
          bank: "BMCE",
          chequeDate: "2026-09-05",
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* depositCheque(schoolId, chequeId, null).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* bounceCheque(schoolId, chequeId, "insufficient funds", "NOTICE-2").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        yield* escalateToLitigation(schoolId, chequeId).pipe(Effect.provide(asDirectorOf(schoolId)))

        const cheque = yield* findCheque(schoolId, chequeId).pipe(Effect.orDie)
        expect(Option.isSome(cheque) && cheque.value.status).toBe("litigation")
      })
    ))

  it.effect("escalating a cheque that isn't bounced is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { chequeId } = yield* recordCheque({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-009",
          bank: "BMCE",
          chequeDate: "2026-09-05",
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* escalateToLitigation(schoolId, chequeId).pipe(
          Effect.provide(asDirectorOf(schoolId)),
          Effect.flip
        )
        expect(result).toBeInstanceOf(InvalidChequeTransitionError)
      })
    ))

  it.effect("a mid-year import can record a cheque already cleared, without replaying earlier states", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        const { chequeId, paymentId } = yield* recordChequeAtStatus({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-010",
          bank: "BMCE",
          chequeDate: "2026-08-01",
          financialAccountIds,
          initialStatus: "cleared"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        expect(yield* installmentStatus(installmentId)).toBe("paid")
        const payment = yield* findPayment(schoolId, paymentId).pipe(Effect.orDie)
        expect(Option.isSome(payment) && payment.value.status).toBe("confirmed")
        const cheque = yield* findCheque(schoolId, chequeId).pipe(Effect.orDie)
        expect(Option.isSome(cheque) && cheque.value.status).toBe("cleared")
        const receipt = yield* findReceiptForPayment(schoolId, paymentId).pipe(Effect.orDie)
        expect(Option.isSome(receipt)).toBe(true)
      })
    ))

  it.effect("a mid-year import can record a cheque already bounced, without ever confirming it", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const installmentId = yield* firstInstallmentId(financialAccountIds[0])
        const { chequeId, paymentId } = yield* recordChequeAtStatus({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-011",
          bank: "BMCE",
          chequeDate: "2026-08-01",
          financialAccountIds,
          initialStatus: "bounced",
          bounceReason: "insufficient funds",
          bounceNoticeReference: "NOTICE-IMPORT-1"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        expect(yield* installmentStatus(installmentId)).toBe("due")
        const payment = yield* findPayment(schoolId, paymentId).pipe(Effect.orDie)
        expect(Option.isSome(payment) && payment.value.status).toBe("pending_confirmation")
        const cheque = yield* findCheque(schoolId, chequeId).pipe(Effect.orDie)
        expect(Option.isSome(cheque) && cheque.value.status).toBe("bounced")
        expect(Option.isSome(cheque) && cheque.value.bounce_reason).toBe("insufficient funds")
      })
    ))

  it.effect("importing a cheque already bounced without a reason/notice reference is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const result = yield* recordChequeAtStatus({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-013",
          bank: "BMCE",
          chequeDate: "2026-08-01",
          financialAccountIds,
          initialStatus: "bounced"
        }).pipe(Effect.provide(asDirectorOf(schoolId)), Effect.flip)
        expect(result).toBeInstanceOf(InvalidPaymentError)
      })
    ))

  it.effect("regularizing a bounced cheque with a still-pending payment is rejected", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { chequeId } = yield* recordCheque({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-014",
          bank: "BMCE",
          chequeDate: "2026-09-05",
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* depositCheque(schoolId, chequeId, null).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* bounceCheque(schoolId, chequeId, "insufficient funds", "NOTICE-3").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const pendingPaymentId = yield* recordBankTransfer({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-10",
          reference: null
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const result = yield* regularizeCheque(schoolId, chequeId, pendingPaymentId).pipe(
          Effect.provide(asDirectorOf(schoolId)),
          Effect.flip
        )
        expect(result).toBeInstanceOf(InvalidPaymentError)
      })
    ))

  it.effect("findChequeForPayment resolves the cheque tied to a payment", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const { chequeId, paymentId } = yield* recordCheque({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          chequeNumber: "CHQ-012",
          bank: "BMCE",
          chequeDate: "2026-09-05",
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const cheque = yield* findChequeForPayment(schoolId, paymentId).pipe(Effect.orDie)
        expect(Option.isSome(cheque) && cheque.value.id).toBe(chequeId)
      })
    ))
})

/**
 * Ticket #63 (BEH-ZS-173 / fr-fin-23-balance-survives-closing.feature): none
 * of `FinancialAccount.ts`/`Payment.ts`/`PaymentSchedule.ts` ever join
 * through `enrollments.status` — `closeEnrollment` (ticket #58) only ever
 * flips `enrollments.status`/`closure_reason`, never touches
 * `financial_accounts`. These tests exist to lock that guarantee in as a
 * regression, not because a gap was found — `withSeededAccounts` enrolls
 * with `hasLegalGuardian`/`hasFinancialGuardian` both `false` (so its
 * enrollment starts `'pre_enrolled'`, not `'active'`), so the raw `UPDATE`
 * below is test-only setup to reach `closeEnrollment`'s own precondition,
 * mirroring `SiblingDiscount.test.ts`'s identical direct-`UPDATE` pattern for
 * reaching a state this file's shared helper doesn't produce on its own.
 */
describe("Balance survives enrollment closing (ticket #63 / BEH-ZS-173)", () => {
  it.effect("a closed enrollment's account stays open; settlement lands on that same account and is traceable", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const [financialAccountId] = financialAccountIds
        const [{ enrollment_id: enrollmentId }] = yield* withSchool(
          schoolId,
          sql<{ enrollment_id: string }>`SELECT enrollment_id FROM financial_accounts WHERE id = ${financialAccountId}`
        )
        yield* withSchool(schoolId, sql`UPDATE enrollments SET status = 'active' WHERE id = ${enrollmentId}`)

        yield* closeEnrollment(schoolId, enrollmentId, "Transferred to another school").pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const installmentId = yield* firstInstallmentId(financialAccountId)
        const paymentId = yield* recordBankTransfer({
          schoolId,
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: "VIR-CLOSED-1"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        yield* confirmPayment(schoolId, paymentId, financialAccountIds).pipe(Effect.provide(asDirectorOf(schoolId)))

        expect(yield* installmentStatus(installmentId)).toBe("paid")

        const receipt = yield* findReceiptForPayment(schoolId, paymentId)
        expect(Option.isSome(receipt)).toBe(true)

        // never a new account — the closed enrollment keeps its original one
        const [{ count }] = yield* withSchool(
          schoolId,
          sql<{ count: string }>`SELECT count(*)::bigint AS count FROM financial_accounts WHERE enrollment_id = ${enrollmentId}`
        )
        expect(Number(count)).toBe(1)
        const resolvedAgain = yield* ensureFinancialAccount(schoolId, enrollmentId)
        expect(resolvedAgain).toBe(financialAccountId)

        // "logged": the payment row itself carries who collected it and when
        const payment = yield* findPayment(schoolId, paymentId)
        expect(Option.isSome(payment) && payment.value.collector_subject_id).toBe("cashier-1")
      })
    ))

  it.effect("the financial guardian keeps read access to payment history and balance after closing", () =>
    withSeededAccounts(1)(({ financialAccountIds, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const [financialAccountId] = financialAccountIds
        const [{ enrollment_id: enrollmentId, student_person_id: studentPersonId }] = yield* withSchool(
          schoolId,
          sql<{ enrollment_id: string; student_person_id: string }>`
            SELECT a.enrollment_id, e.student_person_id
            FROM financial_accounts a JOIN enrollments e ON e.id = a.enrollment_id
            WHERE a.id = ${financialAccountId}
          `
        )

        const guardianPersonId = yield* createPerson({
          firstName: "Karim",
          lastName: "Guardian",
          dateOfBirth: "1985-01-01"
        })
        yield* attachGuardianProfile(guardianPersonId, "+212700000099")
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
        )
        yield* designateFinancialGuardian(schoolId, enrollmentId, guardianPersonId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        yield* recordPayment({
          schoolId,
          method: "cash",
          amountMad: 1200,
          valueDate: "2026-09-05",
          reference: null,
          financialAccountIds
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* withSchool(schoolId, sql`UPDATE enrollments SET status = 'active' WHERE id = ${enrollmentId}`)
        yield* closeEnrollment(schoolId, enrollmentId, "Withdrawn").pipe(Effect.provide(asDirectorOf(schoolId)))

        const guardian = yield* findCurrentFinancialGuardian(schoolId, enrollmentId)
        expect(Option.isSome(guardian) && guardian.value.guardian_person_id).toBe(guardianPersonId)

        const installments = yield* findInstallments(schoolId, enrollmentId)
        expect(installments.some((installment) => installment.status === "paid")).toBe(true)
      })
    ))
})
