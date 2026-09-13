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
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { addFeeItem, createFeeSchedule } from "./FeeSchedule.ts"
import { insertEnrollment } from "./Enrollment.ts"
import {
  confirmPayment,
  findAccountCreditBalance,
  findPayment,
  findPaymentAllocations,
  findReceiptForPayment,
  InvalidPaymentError,
  PaymentNotPendingError,
  recordBankTransfer,
  recordPayment
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
