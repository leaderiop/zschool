import * as Qadi from "@qadi/core/Qadi"
import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { canViewOwnFinancialStatus } from "./authorization/Policies.ts"
import { findSiblingDiscountLines } from "./SiblingDiscount.ts"

/**
 * Ticket #65 (Finance capability #54): a financial guardian's own view of
 * every child's payment schedule, history, discounts and balance — the
 * first SELF-service (non-staff) read in this capability. Every other
 * Finance module scopes to one `schoolId` via `withSchool`/`authorizedFinance`
 * because those are all staff operations within one tenant; a guardian's own
 * children can span multiple schools (`fr-fin-26`'s own "Aggregated
 * multi-school view" scenario), so this module instead: (1) authorizes once,
 * up front, that the caller may see THIS guardian's data at all
 * (`canViewOwnFinancialStatus`, keyed by the caller's own `person_id`
 * subject attribute — never a caller-supplied id used blind), (2) resolves
 * every school the guardian has a real financial relationship in via the
 * narrow `SECURITY DEFINER` `find_financial_accounts_for_guardian` function
 * (migration 0022, same ADR-ZS-050/108 precedent as
 * `find_guardian_by_mobile`/`find_person_matches`), then (3) queries each
 * school normally, under its own `withSchool`, respecting RLS as usual —
 * never a single cross-tenant data query, only a single cross-tenant
 * *lookup* of which schools to visit.
 *
 * BEH-ZS-176's "an adult student can view their own financial status... with
 * financial control staying with the financial guardian for as long as they
 * owe money" (issue #65's acceptance criterion 3) is realized as written in
 * this capability's own reserved BDD scenario (`fr-fin-26`'s "adult student
 * with an indebted financial guardian"): this module's authorization is keyed
 * SOLELY on `financial_guardian_designations`/`financial_account_payers` (the
 * financial-guardian relationship), never on any other academic/legal-
 * guardian access flag — no "restricted parental access to school data"
 * concept exists anywhere else in this codebase (nothing in `Identity.ts`
 * models it), so this view's access to a child's financial data is already,
 * by construction, independent of and unaffected by whatever that other
 * domain's restriction would be. "Financial control staying with the
 * guardian" therefore requires no additional code here: it already holds,
 * since nothing revokes a `financial_guardian_designations` row when a
 * student turns 18, and this module never consults student-side access at
 * all. A genuinely separate "adult student logs in and views their OWN
 * status" self-service path would need this codebase's first
 * student-login/subject-linkage infrastructure, which doesn't exist yet —
 * out of scope here, the same "infrastructure that doesn't exist yet" scoping
 * every prior ticket in this capability (#59, #64) already applied to a
 * documents/communications module.
 */
const FinancialAccountRef = Schema.Struct({
  school_id: Schema.String,
  financial_account_id: Schema.String,
  enrollment_id: Schema.String
})

const findFinancialAccountsForGuardian = Effect.fn("GuardianSelfService.findFinancialAccountsForGuardian")(function*(
  sql: SqlClient,
  guardianPersonId: string
) {
  return yield* SqlSchema.findAll({
    Request: Schema.String,
    Result: FinancialAccountRef,
    execute: (id) => sql`SELECT * FROM find_financial_accounts_for_guardian(${id})`
  })(guardianPersonId)
})

export interface PaymentHistoryEntry {
  readonly paymentId: string
  readonly method: string
  readonly amountMad: number
  readonly valueDate: string
  readonly status: string
  readonly receiptNumber: string | null
}

export interface ScheduledInstallment {
  readonly installmentId: string
  readonly amountMad: number
  readonly dueDate: string
  readonly status: string
}

export interface NextInstallment {
  readonly installmentId: string
  readonly amountOwedMad: number
  readonly dueDate: string
}

export interface DiscountApplied {
  readonly installmentId: string
  readonly amountMad: number
}

export interface ChildFinancialStatus {
  readonly schoolId: string
  readonly enrollmentId: string
  readonly studentPersonId: string
  readonly studentFirstName: string
  readonly studentLastName: string
  readonly installments: ReadonlyArray<ScheduledInstallment>
  /** The soonest not-yet-fully-paid installment, amount shown as what's still owed on it (not its face amount, if partially paid) — `null` once every installment is settled. */
  readonly nextInstallment: NextInstallment | null
  readonly balanceOwedMad: number
  readonly paymentHistory: ReadonlyArray<PaymentHistoryEntry>
  readonly discountsApplied: ReadonlyArray<DiscountApplied>
}

const InstallmentBalanceRow = Schema.Struct({
  installment_id: Schema.String,
  amount_mad: Schema.FiniteFromString,
  due_date: Schema.String,
  status: Schema.String,
  paid_mad: Schema.FiniteFromString
})

/**
 * One child's full financial status within their own school — "current
 * balance" and "payment schedule with statuses" both come from the same
 * per-installment query, excluding a `'voided'` payment's allocation from
 * `paid_mad` the same way `Payment.ts`'s `remainingOwed`/`Dunning.ts`'s own
 * independent copy/`UnpaidBalances.ts` all do (kept as an independent copy
 * here too, not an import, for the same reason `Dunning.ts`'s own doc
 * comment gives: never coupling to another module's unexported internal).
 */
const findChildFinancialStatus = Effect.fn("GuardianSelfService.findChildFinancialStatus")(function*(
  ref: { readonly school_id: string; readonly financial_account_id: string; readonly enrollment_id: string }
) {
  return yield* withSchool(
    ref.school_id,
    Effect.gen(function*() {
      const sql = yield* SqlClient

      const [student] = yield* sql<{ student_person_id: string; first_name: string; last_name: string }>`
        SELECT e.student_person_id, p.first_name, p.last_name
        FROM enrollments e JOIN persons p ON p.id = e.student_person_id
        WHERE e.id = ${ref.enrollment_id}
      `

      const balanceRows = yield* SqlSchema.findAll({
        Request: Schema.String,
        Result: InstallmentBalanceRow,
        execute: (financialAccountId) =>
          sql`
            SELECT i.id AS installment_id, i.amount_mad, i.due_date::text, i.status,
              COALESCE(paid.paid_mad, 0) AS paid_mad
            FROM installments i
            LEFT JOIN LATERAL (
              SELECT SUM(pa.amount_mad) AS paid_mad
              FROM payment_allocations pa
              JOIN payments pay ON pay.id = pa.payment_id
              WHERE pa.installment_id = i.id AND pay.status != 'voided'
            ) paid ON true
            WHERE i.financial_account_id = ${financialAccountId}
            ORDER BY i.due_date ASC
          `
      })(ref.financial_account_id)

      const discountLines = yield* findSiblingDiscountLines(ref.school_id, ref.enrollment_id)

      // Every payment that ever touched one of this account's installments,
      // voided ones included — a guardian's own history is more transparent
      // shown whole (with `status` distinguishing a voided entry) than
      // silently filtered.
      const paymentRows = yield* sql<{
        id: string
        method: string
        amount_mad: string
        value_date: string
        status: string
        receipt_number: string | null
      }>`
        SELECT DISTINCT pay.id, pay.method, pay.amount_mad, pay.value_date::text, pay.status, r.receipt_number
        FROM payments pay
        JOIN payment_allocations pa ON pa.payment_id = pay.id
        JOIN installments i ON i.id = pa.installment_id
        LEFT JOIN receipts r ON r.payment_id = pay.id AND r.kind = 'payment'
        WHERE i.financial_account_id = ${ref.financial_account_id}
        ORDER BY pay.value_date::text DESC
      `

      let balanceOwedMad = 0
      let nextInstallment: NextInstallment | null = null
      for (const row of balanceRows) {
        const owed = Math.round((row.amount_mad - row.paid_mad) * 100) / 100
        balanceOwedMad = Math.round((balanceOwedMad + owed) * 100) / 100
        if (owed > 0.01 && nextInstallment === null) {
          nextInstallment = { installmentId: row.installment_id, amountOwedMad: owed, dueDate: row.due_date }
        }
      }

      return {
        schoolId: ref.school_id,
        enrollmentId: ref.enrollment_id,
        studentPersonId: student.student_person_id,
        studentFirstName: student.first_name,
        studentLastName: student.last_name,
        installments: balanceRows.map((row) => ({
          installmentId: row.installment_id,
          amountMad: row.amount_mad,
          dueDate: row.due_date,
          status: row.status
        })),
        nextInstallment,
        balanceOwedMad,
        paymentHistory: paymentRows.map((row) => ({
          paymentId: row.id,
          method: row.method,
          amountMad: Number(row.amount_mad),
          valueDate: row.value_date,
          status: row.status,
          receiptNumber: row.receipt_number
        })),
        discountsApplied: discountLines.map((line) => ({
          installmentId: line.installment_id,
          amountMad: line.amount_mad
        }))
      }
    })
  )
})

/**
 * BEH-ZS-176: every child the CALLING guardian has a financial relationship
 * to, across every school, aggregated into one result. `guardianPersonId`
 * must be the caller's own id — `canViewOwnFinancialStatus` denies anything
 * else, so this can never be used to look up another guardian's children.
 */
export const findMyChildrenFinancialStatus = Effect.fn("GuardianSelfService.findMyChildrenFinancialStatus")(
  function*(guardianPersonId: string) {
    yield* Qadi.assert(canViewOwnFinancialStatus, {
      resource: { guardian_person_id: guardianPersonId },
      action: "view-own-financial-status"
    })

    const sql = yield* SqlClient
    const refs = yield* findFinancialAccountsForGuardian(sql, guardianPersonId)

    const children: Array<ChildFinancialStatus> = []
    for (const ref of refs) {
      children.push(yield* findChildFinancialStatus(ref))
    }
    return children
  }
)
