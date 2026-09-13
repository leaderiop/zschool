import { CurrentSubject } from "@qadi/core/CurrentSubject"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { PaymentAllocationId, PaymentId, PaymentVoidId, SchoolId } from "./Ids.ts"
import { authorizedFinance, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

export { EntityNotFoundError }

export const PAYMENT_METHODS = ["cash", "cheque", "bank_transfer"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

/** `recordPayment` only ever inserts these two — `bank_transfer` always goes through `recordBankTransfer`/`confirmPayment` instead, since it starts `pending_confirmation` (BEH-ZS-163). */
export const IMMEDIATE_PAYMENT_METHODS = ["cash", "cheque"] as const
export type ImmediatePaymentMethod = (typeof IMMEDIATE_PAYMENT_METHODS)[number]

export const PAYMENT_STATUSES = ["pending_confirmation", "confirmed", "voided"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export class InvalidPaymentError extends Schema.TaggedError<InvalidPaymentError>()("InvalidPaymentError", {
  reason: Schema.String
}) {}

export class PaymentNotPendingError extends Schema.TaggedError<PaymentNotPendingError>()("PaymentNotPendingError", {
  paymentId: Schema.String
}) {}

/** Ticket #60: the payment named for voiding isn't (or is no longer) `'confirmed'` — either it's still `pending_confirmation` (nothing to reverse yet) or it's already `'voided'`. One tag for both since the caller's remedy is the same: pick a different payment. */
export class PaymentNotVoidableError extends Schema.TaggedError<PaymentNotVoidableError>()("PaymentNotVoidableError", {
  paymentId: Schema.String,
  currentStatus: Schema.String
}) {}

/** A `payment_voids` row already exists for this payment (BEH-ZS-179: a payment may be voided at most once, ever — including while a prior request is still `pending_approval`) — raised whether this call's own read missed it or a concurrent request won the `UNIQUE (payment_id)` race. */
export class VoidAlreadyRequestedError extends Schema.TaggedError<VoidAlreadyRequestedError>()(
  "VoidAlreadyRequestedError",
  { paymentId: Schema.String }
) {}

/** `approveVoid` named a payment with no `pending_approval` void request — either none exists, or it's already been finalized. */
export class VoidNotPendingError extends Schema.TaggedError<VoidNotPendingError>()("VoidNotPendingError", {
  paymentId: Schema.String
}) {}

/**
 * `Model.Class` for `payments` (ticket #59, migration 0018). `status`/
 * `confirmed_at` are `GeneratedByDb` — the DB defaults `status` to
 * `'pending_confirmation'`, and both fields only ever change through the raw
 * `UPDATE` `confirmPayment` issues, the same read-only-through-the-Model
 * shape `installments.status` (`PaymentSchedule.ts`) already established for
 * a column with exactly one, DB-side-defaulted, later-transitioned value.
 */
export class Payment extends Model.Class<Payment>("Payment")({
  id: Model.Field({ select: PaymentId, update: PaymentId, json: PaymentId, jsonUpdate: PaymentId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  method: Schema.Literals(PAYMENT_METHODS).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  amount_mad: Schema.FiniteFromString.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  value_date: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  reference: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  collector_subject_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  status: Model.GeneratedByDb(Schema.Literals(PAYMENT_STATUSES)),
  confirmed_at: Model.GeneratedByDb(Schema.NullOr(Schema.DateTimeUtcFromMillis)),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/** CURRENT STATE, not a log — one row per `(payment, installment)` a payment settled against (migration 0018's `UNIQUE (payment_id, installment_id)`). */
export class PaymentAllocation extends Model.Class<PaymentAllocation>("PaymentAllocation")({
  id: Model.Field({
    select: PaymentAllocationId,
    update: PaymentAllocationId,
    json: PaymentAllocationId,
    jsonUpdate: PaymentAllocationId
  }),
  school_id: SchoolId,
  payment_id: Schema.String,
  installment_id: Schema.String,
  amount_mad: Schema.FiniteFromString,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

export interface AllocationInput {
  readonly installmentId: string
  readonly amountMad: number
}

export const VOID_STATUSES = ["pending_approval", "finalized"] as const
export type VoidStatus = (typeof VOID_STATUSES)[number]

export const RECEIPT_KINDS = ["payment", "void"] as const
export type ReceiptKind = (typeof RECEIPT_KINDS)[number]

/**
 * `Model.Class` for `payment_voids` (ticket #60, migration 0019) — the
 * reversing entry itself. `status`/`approved_by_subject_id`/`approved_at`/
 * `finalized_at` are `GeneratedByDb`: the DB defaults `status` to
 * `'pending_approval'`, and all four only ever change through the raw
 * `UPDATE`s `finalizeVoid`/`approveVoid` issue, the same read-only-through-
 * the-Model shape `Payment.status`/`confirmed_at` already established.
 */
export class PaymentVoid extends Model.Class<PaymentVoid>("PaymentVoid")({
  id: Model.Field({ select: PaymentVoidId, update: PaymentVoidId, json: PaymentVoidId, jsonUpdate: PaymentVoidId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  payment_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  reason: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  void_date: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  requested_by_subject_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  status: Model.GeneratedByDb(Schema.Literals(VOID_STATUSES)),
  approved_by_subject_id: Model.GeneratedByDb(Schema.NullOr(Schema.String)),
  approved_at: Model.GeneratedByDb(Schema.NullOr(Schema.DateTimeUtcFromMillis)),
  finalized_at: Model.GeneratedByDb(Schema.NullOr(Schema.DateTimeUtcFromMillis)),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

export class RecordPaymentCommand extends Schema.Class<RecordPaymentCommand>("RecordPaymentCommand")({
  schoolId: SchoolId,
  method: Schema.Literals(IMMEDIATE_PAYMENT_METHODS),
  // A money field must never decode NaN/Infinity — `Schema.Finite` (ticket
  // #55's own review finding, applied here too).
  amountMad: Schema.Finite,
  valueDate: Schema.String,
  reference: Schema.NullOr(Schema.String),
  financialAccountIds: Schema.Array(Schema.String)
}) {}

export class RecordBankTransferCommand extends Schema.Class<RecordBankTransferCommand>("RecordBankTransferCommand")({
  schoolId: SchoolId,
  amountMad: Schema.Finite,
  valueDate: Schema.String,
  reference: Schema.NullOr(Schema.String)
}) {}

export class RequestVoidCommand extends Schema.Class<RequestVoidCommand>("RequestVoidCommand")({
  schoolId: SchoolId,
  paymentId: Schema.String,
  reason: Schema.String,
  // The calendar day the void is being recorded on — compared against the
  // original payment's own day to decide whether BEH-ZS-179's "outside the
  // entry's own day" approval gate applies. Caller-supplied (not
  // `CURRENT_DATE`) so a BDD scenario can assert "three days later" without
  // the test's own wall-clock date mattering.
  voidDate: Schema.String
}) {}

export class ConfigureVoidApprovalPolicyCommand
  extends Schema.Class<ConfigureVoidApprovalPolicyCommand>("ConfigureVoidApprovalPolicyCommand")({
    schoolId: SchoolId,
    // `null` means the school hasn't opted into an amount-based approval
    // gate at all — only the same-day rule still applies unconditionally.
    amountThresholdMad: Schema.NullOr(Schema.Finite)
  })
{}

const paymentRepo = SqlModel.makeRepository(Payment, {
  tableName: "payments",
  spanPrefix: "Payment",
  idColumn: "id"
})

const paymentAllocationRepo = SqlModel.makeRepository(PaymentAllocation, {
  tableName: "payment_allocations",
  spanPrefix: "Payment",
  idColumn: "id"
})

const paymentVoidRepo = SqlModel.makeRepository(PaymentVoid, {
  tableName: "payment_voids",
  spanPrefix: "Payment",
  idColumn: "id"
})

/**
 * An installment's remaining owed amount — its own `amount_mad` minus every
 * allocation against it from a payment that isn't `'voided'`. The `voided`
 * exclusion is dead code until ticket #60 exists (nothing in this ticket
 * ever writes it), kept here now so #60 doesn't have to hunt down every
 * place this sum is computed.
 */
const remainingOwed = Effect.fn("Payment.remainingOwed")(function*(
  sql: SqlClient,
  installmentId: string,
  amountMad: number
) {
  const [row] = yield* sql<{ paid: string }>`
    SELECT COALESCE(SUM(pa.amount_mad) FILTER (WHERE p.status != 'voided'), 0) AS paid
    FROM payment_allocations pa
    JOIN payments p ON p.id = pa.payment_id
    WHERE pa.installment_id = ${installmentId}
  `
  return amountMad - Number(row.paid)
})

/**
 * Recomputes and writes one installment's `status` from its own amount
 * versus everything confirmed-and-not-voided allocated against it so far —
 * a raw `UPDATE`, same reasoning as `Enrollment.ts`'s `closeEnrollment`/
 * `Class.ts`'s `deactivateClass` for a column no typed command otherwise
 * transitions. Never produces `'overdue'` — nothing in this codebase writes
 * that status yet (`PaymentSchedule.ts`'s migration only ever DEFAULTs a
 * fresh installment to `'due'`), so there is no existing `'overdue'` row
 * this function could ever need to reconcile a payment against; ticket #64
 * (dunning) is the expected owner of an actual due-date-based transition
 * into it, and should decide then whether a partial payment against an
 * already-`'overdue'` installment ought to stay `'overdue'` rather than
 * fall back to `'partially_paid'` the way this function currently would.
 */
const refreshInstallmentStatus = Effect.fn("Payment.refreshInstallmentStatus")(function*(
  sql: SqlClient,
  installmentId: string
) {
  const [row] = yield* sql<{ amount_mad: string; paid: string }>`
    SELECT i.amount_mad, COALESCE(SUM(pa.amount_mad) FILTER (WHERE p.status != 'voided'), 0) AS paid
    FROM installments i
    LEFT JOIN payment_allocations pa ON pa.installment_id = i.id
    LEFT JOIN payments p ON p.id = pa.payment_id
    WHERE i.id = ${installmentId}
    GROUP BY i.amount_mad
  `
  const amount = Number(row.amount_mad)
  const paid = Number(row.paid)
  const newStatus = paid >= amount - 0.01 ? "paid" : paid > 0.01 ? "partially_paid" : "due"
  yield* sql`UPDATE installments SET status = ${newStatus} WHERE id = ${installmentId}`
})

/** Validates and resolves a caller-supplied allocation list — every installment must belong to one of `financialAccountIds` (tenant + scope check, `Ownership.ts`'s stated invariant) and must have enough remaining owed to accept the amount; over-allocation is refused rather than silently capped. */
const resolveManualAllocations = Effect.fn("Payment.resolveManualAllocations")(function*(
  sql: SqlClient,
  schoolId: SchoolId,
  financialAccountIds: ReadonlyArray<string>,
  allocations: ReadonlyArray<AllocationInput>
) {
  const resolved: Array<AllocationInput> = []
  for (const allocation of allocations) {
    if (allocation.amountMad <= 0) {
      return yield* Effect.fail(
        new InvalidPaymentError({ reason: `allocation amount must be positive, got ${allocation.amountMad}` })
      )
    }
    const installment = yield* requireOwnedRow(
      sql,
      "installments",
      "installment",
      allocation.installmentId,
      schoolId,
      Schema.Struct({ financial_account_id: Schema.String, amount_mad: Schema.FiniteFromString }),
      "financial_account_id, amount_mad"
    )
    if (!financialAccountIds.includes(installment.financial_account_id)) {
      return yield* Effect.fail(
        new EntityNotFoundError({ entityType: "installment", entityId: allocation.installmentId })
      )
    }
    const remaining = yield* remainingOwed(sql, allocation.installmentId, installment.amount_mad)
    if (allocation.amountMad > remaining + 0.01) {
      return yield* Effect.fail(
        new InvalidPaymentError({
          reason:
            `allocation of ${allocation.amountMad} to installment ${allocation.installmentId} exceeds its remaining owed amount of ${remaining}`
        })
      )
    }
    resolved.push(allocation)
  }
  return resolved
})

/**
 * BEH-ZS-160's default: unsettled installments across every given
 * `FinancialAccount`, oldest due date first — then, for two installments due
 * the same day (a family payment's several children are routinely billed
 * for the exact same month), by the ORDER `financialAccountIds` was given in
 * (BEH-ZS-180's "oldest first, then by child"; `array_position` turns the
 * caller's own array order into that tie-break instead of an arbitrary `id`
 * sort) — filled until `budget` (the payment's amount) runs out, restricted
 * to installments actually due on or before `valueDate`. Without that
 * cutoff, a school's future (not yet due) monthly installments would
 * silently absorb any surplus as an unrequested prepayment instead of it
 * ever becoming the credit BEH-ZS-160 requires — "a surplus payment beyond
 * what's CURRENTLY due" only has meaning relative to a cutoff date.
 */
const autoAllocateOldestFirst = Effect.fn("Payment.autoAllocateOldestFirst")(function*(
  sql: SqlClient,
  schoolId: SchoolId,
  financialAccountIds: ReadonlyArray<string>,
  budget: number,
  valueDate: string
) {
  const rows = yield* sql<{ id: string; amount_mad: string; paid: string }>`
    SELECT i.id, i.amount_mad, COALESCE(SUM(pa.amount_mad) FILTER (WHERE p.status != 'voided'), 0) AS paid
    FROM installments i
    LEFT JOIN payment_allocations pa ON pa.installment_id = i.id
    LEFT JOIN payments p ON p.id = pa.payment_id
    WHERE i.school_id = ${schoolId}
      AND i.financial_account_id = ANY(${financialAccountIds}::uuid[])
      AND i.status IN ('due', 'partially_paid', 'overdue')
      AND i.due_date <= ${valueDate}
    GROUP BY i.id, i.amount_mad, i.due_date, i.financial_account_id
    ORDER BY i.due_date ASC, array_position(${financialAccountIds}::uuid[], i.financial_account_id) ASC, i.id ASC
  `

  const resolved: Array<AllocationInput> = []
  let remainingBudget = budget
  for (const row of rows) {
    if (remainingBudget <= 0.01) break
    const remainingOwedOnRow = Number(row.amount_mad) - Number(row.paid)
    if (remainingOwedOnRow <= 0.01) continue
    const toAllocate = Math.min(remainingBudget, remainingOwedOnRow)
    resolved.push({ installmentId: row.id, amountMad: Math.round(toAllocate * 100) / 100 })
    remainingBudget -= toAllocate
  }
  return resolved
})

/** Draws the next number from the school's single continuous, gapless counter (migration 0018's `receipt_counters`, BEH-ZS-157) — shared by every receipt kind (`issueReceipt`, `issueVoidReceipt`) so a void receipt truly consumes the SAME sequence, never a second one. Must run inside the same transaction as the row it numbers, so a rollback never burns a number. */
const drawNextReceiptNumber = Effect.fn("Payment.drawNextReceiptNumber")(function*(
  sql: SqlClient,
  schoolId: SchoolId
) {
  const [counter] = yield* sql<{ assigned: number; year: number }>`
    INSERT INTO receipt_counters (school_id, next_number) VALUES (${schoolId}, 2)
    ON CONFLICT (school_id) DO UPDATE SET next_number = receipt_counters.next_number + 1
    RETURNING next_number - 1 AS assigned, EXTRACT(YEAR FROM CURRENT_DATE)::int AS year
  `
  return `${counter.year}-${String(counter.assigned).padStart(4, "0")}`
})

/** Draws a receipt number and inserts the `receipts` row for a confirmed payment. */
const issueReceipt = Effect.fn("Payment.issueReceipt")(function*(
  sql: SqlClient,
  schoolId: SchoolId,
  paymentId: string
) {
  const receiptNumber = yield* drawNextReceiptNumber(sql, schoolId)
  yield* sql`
    INSERT INTO receipts (school_id, payment_id, receipt_number, kind) VALUES (${schoolId}, ${paymentId}, ${receiptNumber}, 'payment')
  `
  return receiptNumber
})

/** BEH-ZS-179: a void's own numbered receipt, in the SAME per-school sequence as every other receipt, referencing both the original payment and the `payment_voids` row it finalizes — never a mutation of the original receipt, which keeps its own number. */
const issueVoidReceipt = Effect.fn("Payment.issueVoidReceipt")(function*(
  sql: SqlClient,
  schoolId: SchoolId,
  paymentId: string,
  voidId: string
) {
  const receiptNumber = yield* drawNextReceiptNumber(sql, schoolId)
  yield* sql`
    INSERT INTO receipts (school_id, payment_id, receipt_number, kind, void_id)
    VALUES (${schoolId}, ${paymentId}, ${receiptNumber}, 'void', ${voidId})
  `
  return receiptNumber
})

/**
 * The shared confirmation logic `recordPayment` (cash/cheque, confirmed
 * immediately) and `confirmPayment` (a `bank_transfer` reconciled later) both
 * run once a payment's status is (or is about to become) `'confirmed'`:
 * resolve allocations (manual override or oldest-first default), write them,
 * refresh every installment they touch, carry any surplus as a credit, and
 * issue the receipt — all inside the SAME transaction as the status
 * transition, so a failure at any step leaves the payment exactly as it was
 * (still pending, or never inserted).
 */
const applyConfirmation = Effect.fn("Payment.applyConfirmation")(function*(
  sql: SqlClient,
  schoolId: SchoolId,
  paymentId: string,
  amountMad: number,
  valueDate: string,
  financialAccountIds: ReadonlyArray<string>,
  allocations: ReadonlyArray<AllocationInput> | undefined,
  creditFinancialAccountId: string | undefined
) {
  if (financialAccountIds.length === 0) {
    return yield* Effect.fail(new InvalidPaymentError({ reason: "at least one financial account is required" }))
  }
  for (const financialAccountId of financialAccountIds) {
    yield* requireOwnedRow(sql, "financial_accounts", "financial_account", financialAccountId, schoolId, RowWithId)
  }

  const resolvedAllocations = allocations !== undefined
    ? yield* resolveManualAllocations(sql, schoolId, financialAccountIds, allocations)
    : yield* autoAllocateOldestFirst(sql, schoolId, financialAccountIds, amountMad, valueDate)

  const totalAllocated = resolvedAllocations.reduce((sum, allocation) => sum + allocation.amountMad, 0)
  if (totalAllocated > amountMad + 0.01) {
    return yield* Effect.fail(
      new InvalidPaymentError({ reason: `allocations totalling ${totalAllocated} exceed the payment amount ${amountMad}` })
    )
  }

  const allocationRepo = yield* paymentAllocationRepo
  for (const allocation of resolvedAllocations) {
    yield* allocationRepo.insert({
      school_id: schoolId,
      payment_id: paymentId,
      installment_id: allocation.installmentId,
      amount_mad: allocation.amountMad
    })
    yield* refreshInstallmentStatus(sql, allocation.installmentId)
  }

  // BEH-ZS-160: a surplus beyond what's due becomes a credit, never rejected
  // — attributed to `creditFinancialAccountId` if the caller named one
  // (relevant once a family payment spans several siblings' accounts),
  // otherwise the first account named.
  const surplus = amountMad - totalAllocated
  if (surplus > 0.01) {
    const targetAccountId = creditFinancialAccountId ?? financialAccountIds[0]
    yield* requireOwnedRow(sql, "financial_accounts", "financial_account", targetAccountId, schoolId, RowWithId)
    yield* sql`
      INSERT INTO financial_account_credits (school_id, financial_account_id, amount_mad, source_payment_id)
      VALUES (${schoolId}, ${targetAccountId}, ${Math.round(surplus * 100) / 100}, ${paymentId})
    `
  }

  return yield* issueReceipt(sql, schoolId, paymentId)
})

/**
 * BEH-ZS-160/180: records a `cash` or `cheque` payment, confirmed
 * immediately — allocates against `financialAccountIds`' unsettled
 * installments (oldest-first by default, or `allocations` as an explicit
 * override), covering several siblings' accounts in one operation when more
 * than one id is given, and issues one receipt for the whole payment.
 */
export const recordPayment = Effect.fn("Payment.recordPayment")(function*(
  rawCommand: (typeof RecordPaymentCommand)["Encoded"],
  allocations?: ReadonlyArray<AllocationInput>,
  creditFinancialAccountId?: string
) {
  const command = yield* Schema.decodeEffect(RecordPaymentCommand)(rawCommand)
  return yield* authorizedFinance(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        // Validated inside the `authorizedFinance` gate, not before it —
        // matching every other finance command in this capability.
        if (command.amountMad <= 0) {
          return yield* Effect.fail(new InvalidPaymentError({ reason: "payment amount must be positive" }))
        }

        const sql = yield* SqlClient
        const subject = yield* CurrentSubject
        const repo = yield* paymentRepo

        return yield* sql.withTransaction(Effect.gen(function*() {
          const payment = yield* repo.insert({
            school_id: command.schoolId,
            method: command.method,
            amount_mad: command.amountMad,
            value_date: command.valueDate,
            reference: command.reference,
            collector_subject_id: subject.id
          })
          yield* sql`UPDATE payments SET status = 'confirmed', confirmed_at = clock_timestamp() WHERE id = ${payment.id}`
          const receiptNumber = yield* applyConfirmation(
            sql,
            command.schoolId,
            payment.id,
            command.amountMad,
            command.valueDate,
            command.financialAccountIds,
            allocations,
            creditFinancialAccountId
          )
          return { paymentId: payment.id, receiptNumber }
        }))
      })
    )
  )
})

/**
 * BEH-ZS-163: records a `bank_transfer` payment in its `pending_confirmation`
 * sub-state — no target installment is chosen yet (accounting typically
 * knows only the amount and a free-text reference at the moment the transfer
 * lands), and it affects no balance until `confirmPayment` reconciles it.
 */
export const recordBankTransfer = Effect.fn("Payment.recordBankTransfer")(function*(
  rawCommand: (typeof RecordBankTransferCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(RecordBankTransferCommand)(rawCommand)
  return yield* authorizedFinance(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        if (command.amountMad <= 0) {
          return yield* Effect.fail(new InvalidPaymentError({ reason: "payment amount must be positive" }))
        }
        const subject = yield* CurrentSubject
        const repo = yield* paymentRepo
        const payment = yield* repo.insert({
          school_id: command.schoolId,
          method: "bank_transfer",
          amount_mad: command.amountMad,
          value_date: command.valueDate,
          reference: command.reference,
          collector_subject_id: subject.id
        })
        return payment.id
      })
    )
  )
})

/**
 * BEH-ZS-163: a human reconciling a `pending_confirmation` payment against
 * the installment(s) it actually settles — the same allocation/receipt/credit
 * machinery `recordPayment` runs, just deferred to this later, explicit step
 * instead of running at insert time.
 */
export const confirmPayment = Effect.fn("Payment.confirmPayment")(function*(
  rawSchoolId: string,
  paymentId: string,
  financialAccountIds: ReadonlyArray<string>,
  allocations?: ReadonlyArray<AllocationInput>,
  creditFinancialAccountId?: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizedFinance(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const before = yield* requireOwnedRow(
          sql,
          "payments",
          "payment",
          paymentId,
          schoolId,
          Schema.Struct({ status: Schema.String, amount_mad: Schema.FiniteFromString, value_date: Schema.String }),
          "status, amount_mad, value_date"
        )
        if (before.status !== "pending_confirmation") {
          return yield* Effect.fail(new PaymentNotPendingError({ paymentId }))
        }

        return yield* sql.withTransaction(Effect.gen(function*() {
          const [updated] = yield* sql`
            UPDATE payments SET status = 'confirmed', confirmed_at = clock_timestamp()
            WHERE id = ${paymentId} AND school_id = ${schoolId} AND status = 'pending_confirmation'
            RETURNING id
          `
          // Guards against a concurrent double-confirmation racing this same
          // check-then-act sequence — the `before` read above is advisory,
          // this `UPDATE ... WHERE status = 'pending_confirmation'` is the
          // actual, atomic guard.
          if (updated === undefined) {
            return yield* Effect.fail(new PaymentNotPendingError({ paymentId }))
          }
          const receiptNumber = yield* applyConfirmation(
            sql,
            schoolId,
            paymentId,
            before.amount_mad,
            before.value_date,
            financialAccountIds,
            allocations,
            creditFinancialAccountId
          )
          return { receiptNumber }
        }))
      })
    )
  )
})

/** The per-school approval-threshold config (migration 0019's `void_approval_policies`) — a plain single-row-per-school setting, not a `Model.Class`/repository, the same "raw SQL, no separate entity" treatment `receipt_counters` already gets rather than `SiblingDiscountPolicy`'s per-academic-year shape (this is an operational finance-ops setting, not an `ADR-ZS-105` academic snapshot). */
export const findVoidApprovalPolicy = Effect.fn("Payment.findVoidApprovalPolicy")(function*(
  sql: SqlClient,
  schoolId: SchoolId
) {
  const rows = yield* sql<{ amount_threshold_mad: string | null }>`
    SELECT amount_threshold_mad FROM void_approval_policies WHERE school_id = ${schoolId}
  `
  return rows[0] === undefined ? undefined : rows[0].amount_threshold_mad === null ? null : Number(rows[0].amount_threshold_mad)
})

/** Upserts the school's void-approval threshold — `null` clears it (no amount-based gate, only the same-day rule still applies). */
export const configureVoidApprovalPolicy = Effect.fn("Payment.configureVoidApprovalPolicy")(function*(
  rawCommand: (typeof ConfigureVoidApprovalPolicyCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(ConfigureVoidApprovalPolicyCommand)(rawCommand)
  return yield* authorizedFinance(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`
          INSERT INTO void_approval_policies (school_id, amount_threshold_mad) VALUES (${command.schoolId}, ${command.amountThresholdMad})
          ON CONFLICT (school_id) DO UPDATE SET amount_threshold_mad = ${command.amountThresholdMad}, updated_at = clock_timestamp()
        `
      })
    )
  )
})

/**
 * BEH-ZS-179: reverts every installment the voided payment covered (by
 * flipping `payments.status` to `'voided'` first, then re-running
 * `refreshInstallmentStatus` — its `paid` sum already filters
 * `WHERE p.status != 'voided'`, so this single status flip is what makes
 * every affected installment's recomputed status correct, including a
 * payment that spanned MULTIPLE installments/`FinancialAccount`s from a
 * family payment) and issues the void receipt — shared between "no approval
 * needed" (called inline from `requestVoid`) and "approved later" (called
 * from `approveVoid`), both inside the same transaction as the status
 * transition that triggers it.
 */
const finalizeVoid = Effect.fn("Payment.finalizeVoid")(function*(
  sql: SqlClient,
  schoolId: SchoolId,
  paymentId: string,
  voidId: string
) {
  yield* sql`UPDATE payments SET status = 'voided' WHERE id = ${paymentId}`
  const allocations = yield* sql<{ installment_id: string }>`
    SELECT installment_id FROM payment_allocations WHERE payment_id = ${paymentId}
  `
  for (const allocation of allocations) {
    yield* refreshInstallmentStatus(sql, allocation.installment_id)
  }
  yield* sql`UPDATE payment_voids SET status = 'finalized', finalized_at = clock_timestamp() WHERE id = ${voidId}`
  return yield* issueVoidReceipt(sql, schoolId, paymentId, voidId)
})

/**
 * BEH-ZS-179: voids a confirmed payment through a dated, reasoned reversing
 * entry — never an edit or delete of the original. Requires approval (stays
 * `pending_approval`, no reversal/receipt yet) when `voidDate` isn't the
 * same calendar day the payment was originally recorded on, or its amount
 * exceeds the school's configured threshold; otherwise finalizes
 * immediately in the same transaction as the `payment_voids` insert.
 */
export const requestVoid = Effect.fn("Payment.requestVoid")(function*(
  rawCommand: (typeof RequestVoidCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(RequestVoidCommand)(rawCommand)
  return yield* authorizedFinance(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        // Validated inside the `authorizedFinance` gate, not before it —
        // matching every other finance command in this capability.
        if (command.reason.trim().length === 0) {
          return yield* Effect.fail(new InvalidPaymentError({ reason: "a void reason is required" }))
        }

        const sql = yield* SqlClient
        const subject = yield* CurrentSubject
        const payment = yield* requireOwnedRow(
          sql,
          "payments",
          "payment",
          command.paymentId,
          command.schoolId,
          Schema.Struct({ status: Schema.String, amount_mad: Schema.FiniteFromString, created_at: Schema.String }),
          "status, amount_mad, created_at::text"
        )
        if (payment.status !== "confirmed") {
          return yield* Effect.fail(
            new PaymentNotVoidableError({ paymentId: command.paymentId, currentStatus: payment.status })
          )
        }

        const threshold = yield* findVoidApprovalPolicy(sql, command.schoolId)
        const paymentDay = payment.created_at.slice(0, 10)
        const requiresApproval = command.voidDate !== paymentDay ||
          (threshold !== undefined && threshold !== null && payment.amount_mad > threshold)

        // The insert (and, when no approval is needed, the finalize that
        // immediately follows it) runs as ONE atomic transaction — but that
        // transaction must stay INSIDE `Effect.result`, not the other way
        // around: once a Postgres statement fails, the whole transaction is
        // aborted and every later statement on it (including a reselect)
        // fails with "current transaction is aborted" rather than actually
        // running. Wrapping `Effect.result` around the ENTIRE
        // `sql.withTransaction` (so the transaction rolls back and closes
        // BEFORE the reselect below ever runs, as a fresh statement) is what
        // makes the reselect safe — the reverse nesting (a `withTransaction`
        // wrapping only the insert, reselect issued inside the same outer
        // transaction) was this function's first draft and would have made
        // the reselect itself always fail after a genuine conflict.
        const insertResult = yield* Effect.result(
          sql.withTransaction(Effect.gen(function*() {
            const repo = yield* paymentVoidRepo
            const voidRow = yield* repo.insert({
              school_id: command.schoolId,
              payment_id: command.paymentId,
              reason: command.reason,
              void_date: command.voidDate,
              requested_by_subject_id: subject.id
            })
            if (!requiresApproval) {
              const receiptNumber = yield* finalizeVoid(sql, command.schoolId, command.paymentId, voidRow.id)
              return { voidId: voidRow.id, status: "finalized" as const, receiptNumber }
            }
            return { voidId: voidRow.id, status: "pending_approval" as const, receiptNumber: undefined }
          }))
        )
        if (Result.isSuccess(insertResult)) {
          return insertResult.success
        }
        // Same "insert-catch-unique-then-reselect" idiom as
        // `PaymentSchedule.ts`'s generation loop, adapted: here a row FOUND
        // on reselect is not benign (unlike a retried, idempotent insert) —
        // `UNIQUE (payment_id)` means finding one means a void already
        // exists (this call's own read above raced a concurrent one), so
        // it's a genuine conflict, not a skip. Reselect finding NOTHING
        // still means the original failure was something else (e.g. a
        // dropped connection) and must surface unchanged.
        const existing = yield* sql<{ id: string }>`SELECT id FROM payment_voids WHERE payment_id = ${command.paymentId}`
        if (existing[0] !== undefined) {
          return yield* Effect.fail(new VoidAlreadyRequestedError({ paymentId: command.paymentId }))
        }
        return yield* Effect.fail(insertResult.failure)
      })
    )
  )
})

/**
 * BEH-ZS-179: an authorized approval finalizes a `pending_approval` void —
 * the `UPDATE ... WHERE status = 'pending_approval'` is the actual atomic
 * guard against a concurrent double-approval, the same "advisory read, then
 * atomic guarded UPDATE" shape `confirmPayment` already uses. Gated by the
 * same `authorizedFinance`/`canManageFinance` policy as every other finance
 * write (`Ownership.ts`), since this codebase has no role more senior than
 * `director` to reserve "school leadership" approval to yet — the
 * requirement's traceability comes from this being a distinct, explicit,
 * separately-audited action (`approved_by_subject_id`/`approved_at`, never
 * implicit in `requestVoid` itself), not from a role gap between requester
 * and approver. A future senior role can narrow this policy without
 * changing `requestVoid`'s or `finalizeVoid`'s shape at all.
 */
export const approveVoid = Effect.fn("Payment.approveVoid")(function*(rawSchoolId: string, paymentId: string) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizedFinance(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const subject = yield* CurrentSubject
        return yield* sql.withTransaction(Effect.gen(function*() {
          const [updated] = yield* sql<{ id: string }>`
            UPDATE payment_voids SET approved_by_subject_id = ${subject.id}, approved_at = clock_timestamp()
            WHERE payment_id = ${paymentId} AND school_id = ${schoolId} AND status = 'pending_approval'
            RETURNING id
          `
          if (updated === undefined) {
            return yield* Effect.fail(new VoidNotPendingError({ paymentId }))
          }
          const receiptNumber = yield* finalizeVoid(sql, schoolId, paymentId, updated.id)
          return { receiptNumber }
        }))
      })
    )
  )
})

/** One payment's void request, if any — for BDD/UI display of whether a payment is voided, still pending approval, or was never voided at all. */
export const findVoidForPayment = Effect.fn("Payment.findVoidForPayment")(function*(
  schoolId: string,
  paymentId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findOneOption({
        Request: Schema.Struct({ schoolId: Schema.String, paymentId: Schema.String }),
        Result: PaymentVoid,
        execute: (req) =>
          sql`SELECT * FROM payment_voids WHERE school_id = ${req.schoolId} AND payment_id = ${req.paymentId}`
      })({ schoolId, paymentId })
    })
  )
})

/** The credit balance carried on one `FinancialAccount` — summed from `financial_account_credits` rather than a mutable column, matching `Enrollment.ts`'s `hasEnrollments` "query directly" precedent. Excludes any credit whose source payment has since been voided (BEH-ZS-179: the balance must recompute automatically), the same `p.status != 'voided'` filter `remainingOwed`/`autoAllocateOldestFirst` already apply. */
export const findAccountCreditBalance = Effect.fn("Payment.findAccountCreditBalance")(function*(
  schoolId: string,
  financialAccountId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const [row] = yield* sql<{ total: string }>`
        SELECT COALESCE(SUM(fac.amount_mad) FILTER (WHERE p.status != 'voided'), 0) AS total
        FROM financial_account_credits fac
        JOIN payments p ON p.id = fac.source_payment_id
        WHERE fac.financial_account_id = ${financialAccountId}
      `
      return Number(row.total)
    })
  )
})

/** Every allocation a confirmed payment produced, for receipt/statement display. */
export const findPaymentAllocations = Effect.fn("Payment.findPaymentAllocations")(function*(
  schoolId: string,
  paymentId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String, paymentId: Schema.String }),
        Result: PaymentAllocation,
        execute: (req) =>
          sql`SELECT * FROM payment_allocations WHERE school_id = ${req.schoolId} AND payment_id = ${req.paymentId}`
      })({ schoolId, paymentId })
    })
  )
})

/** The receipt issued for one payment, if it's been confirmed. */
export const findReceiptForPayment = Effect.fn("Payment.findReceiptForPayment")(function*(
  schoolId: string,
  paymentId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const rows = yield* sql<{ receipt_number: string; issued_at: string; voided: boolean }>`
        SELECT r.receipt_number, r.issued_at::text, (p.status = 'voided') AS voided
        FROM receipts r JOIN payments p ON p.id = r.payment_id
        WHERE r.school_id = ${schoolId} AND r.payment_id = ${paymentId} AND r.kind = 'payment'
      `
      return rows[0] === undefined ? Option.none() : Option.some(rows[0])
    })
  )
})

/** BEH-ZS-179: the void receipt issued for a payment's reversing entry, if it's been finalized — a distinct row from `findReceiptForPayment`'s original, in the same sequence. */
export const findVoidReceiptForPayment = Effect.fn("Payment.findVoidReceiptForPayment")(function*(
  schoolId: string,
  paymentId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const rows = yield* sql<{ receipt_number: string }>`
        SELECT receipt_number FROM receipts WHERE school_id = ${schoolId} AND payment_id = ${paymentId} AND kind = 'void'
      `
      return rows[0] === undefined ? Option.none() : Option.some(rows[0].receipt_number)
    })
  )
})

/** One payment's own row, decoded, for BDD/UI display of its current status. */
export const findPayment = Effect.fn("Payment.findPayment")(function*(schoolId: string, paymentId: string) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findOneOption({
        Request: Schema.Struct({ schoolId: Schema.String, paymentId: Schema.String }),
        Result: Payment,
        execute: (req) => sql`SELECT * FROM payments WHERE school_id = ${req.schoolId} AND id = ${req.paymentId}`
      })({ schoolId, paymentId })
    })
  )
})
