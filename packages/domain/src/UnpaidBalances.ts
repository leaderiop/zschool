import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"

/**
 * Ticket #62 (Finance capability #54): one row per (enrollment, unpaid
 * installment) — `findUnpaidBalances` aggregates these into a per-enrollment
 * total below, the same "row-per-join, aggregate in TS" shape
 * `PaymentSchedule.ts`'s own read queries never needed but this one does,
 * since a school's front-desk/accounting view is inherently a rollup across
 * many installments per student. Read-only: `withSchool` alone, matching
 * `findInstallments`/`findFinancialAccountPayers`'s own precedent that a
 * query needs tenant scoping but not the `authorizedFinance` mutation gate.
 *
 * `current_guardian_person_id` is nullable: nothing requires a financial
 * guardian to be designated before installments exist (`ensureFinancialAccount`
 * runs at enrollment time regardless — `FinancialAccount.ts`'s own
 * `designateFinancialGuardian` is a separate, later step).
 */
const UnpaidBalanceRow = Schema.Struct({
  enrollment_id: Schema.String,
  student_person_id: Schema.String,
  first_name: Schema.String,
  last_name: Schema.String,
  class_id: Schema.String,
  level_id: Schema.String,
  enrollment_status: Schema.Literals(["pre_enrolled", "active", "completed"]),
  current_guardian_person_id: Schema.NullOr(Schema.String),
  installment_id: Schema.String,
  due_date: Schema.String,
  amount_mad: Schema.FiniteFromString,
  paid_mad: Schema.FiniteFromString
})

export interface OverdueInstallment {
  readonly installmentId: string
  readonly dueDate: string
  readonly amountOwed: number
}

export interface UnpaidBalance {
  readonly enrollmentId: string
  readonly studentPersonId: string
  readonly studentFirstName: string
  readonly studentLastName: string
  readonly classId: string
  readonly levelId: string
  readonly currentGuardianPersonId: string | null
  /** BEH-ZS-170: a closed enrollment (`'completed'` — this codebase folds transferred/withdrawn/expelled into that one status via `Enrollment.ts`'s `closeEnrollment`) still carrying an unsettled balance. Deliberately NOT "any non-`'active'` status": a fresh `'pre_enrolled'` enrollment (no legal/financial guardian recorded yet, or a future `effectiveDate`) is not closed, it hasn't started yet — `computeEnrollmentStatus` only ever produces `'pre_enrolled'`/`'active'` here, `'completed'` comes solely from `closeEnrollment`. */
  readonly closedFile: boolean
  readonly totalOwedMad: number
  readonly overdueInstallments: ReadonlyArray<OverdueInstallment>
}

export interface UnpaidBalancesFilter {
  readonly classId?: string
  readonly levelId?: string
  readonly guardianPersonId?: string
}

interface Accumulator {
  enrollmentId: string
  studentPersonId: string
  studentFirstName: string
  studentLastName: string
  classId: string
  levelId: string
  currentGuardianPersonId: string | null
  closedFile: boolean
  totalOwedMad: number
  overdue: Array<OverdueInstallment>
}

/**
 * BEH-ZS-170/178: unpaid balances by student/enrollment, filterable by
 * class, level, and financial guardian, with totals — the minimal
 * arrears-alert data (amount owed, overdue installments) a student's file
 * needs, with no document-blocking behavior anywhere: this function only
 * ever reads and returns data, never gates any other action (BEH-ZS-178,
 * ticket #62's own scope — the actual non-blocking document flow that
 * CONSUMES this data, `fr-fin-28-no-document-blocking.feature`, needs a
 * documents/communications module that doesn't exist yet in this codebase
 * and stays unimplemented, the same boundary #59's PR drew around
 * "sent to guardian"/"downloadable receipt").
 *
 * An installment only counts as unpaid once its `amount_mad` exceeds what's
 * been allocated to it from a non-`'voided'` payment — the same
 * `p.status != 'voided'` exclusion `Payment.ts`'s `remainingOwed`/
 * `autoAllocateOldestFirst` apply, so a payment still `'pending_confirmation'`
 * (a cheque not yet cleared, ticket #61; a bank transfer not yet reconciled,
 * ticket #59) contributes nothing yet and the installment stays fully owed.
 * "Overdue" is computed here from `due_date < today`, not from
 * `installments.status = 'overdue'` — nothing in this codebase ever writes
 * that status yet (see `PaymentSchedule.ts`'s `Installment` model comment
 * and `Payment.ts`'s `refreshInstallmentStatus` comment); ticket #64
 * (dunning) is the expected owner of an actual due-date-based transition
 * into it, and once it exists this view keeps working unchanged either way.
 *
 * The guardian filter matches either the account's current financial
 * guardian (`financial_guardian_designations`, most recent row per account)
 * or a payer in its multi-payer split (`financial_account_payers`,
 * ticket #56) — a third-party payer or a secondary sibling-split payer is
 * just as much "who owes this" as the primary designated guardian.
 */
const queryUnpaidBalanceRows = Effect.fn("UnpaidBalances.queryUnpaidBalanceRows")(function*(
  sql: SqlClient,
  schoolId: string,
  filter: UnpaidBalancesFilter
) {
  const classId = filter.classId ?? null
  const levelId = filter.levelId ?? null
  const guardianPersonId = filter.guardianPersonId ?? null

  return yield* SqlSchema.findAll({
    Request: Schema.Struct({
      schoolId: Schema.String,
      classId: Schema.NullOr(Schema.String),
      levelId: Schema.NullOr(Schema.String),
      guardianPersonId: Schema.NullOr(Schema.String)
    }),
    Result: UnpaidBalanceRow,
    execute: (req) =>
      sql`
        SELECT
          e.id AS enrollment_id,
          e.student_person_id,
          p.first_name,
          p.last_name,
          e.class_id,
          c.level_id,
          e.status AS enrollment_status,
          current_guardian.guardian_person_id AS current_guardian_person_id,
          i.id AS installment_id,
          i.due_date::text,
          i.amount_mad,
          COALESCE(paid.paid_mad, 0) AS paid_mad
        FROM installments i
        JOIN financial_accounts fa ON fa.id = i.financial_account_id
        JOIN enrollments e ON e.id = fa.enrollment_id
        JOIN classes c ON c.id = e.class_id
        JOIN persons p ON p.id = e.student_person_id
        LEFT JOIN LATERAL (
          SELECT d.guardian_person_id FROM financial_guardian_designations d
          WHERE d.financial_account_id = fa.id
          ORDER BY d.created_at DESC LIMIT 1
        ) current_guardian ON true
        LEFT JOIN LATERAL (
          SELECT SUM(pa.amount_mad) AS paid_mad
          FROM payment_allocations pa
          JOIN payments pay ON pay.id = pa.payment_id
          WHERE pa.installment_id = i.id AND pay.status != 'voided'
        ) paid ON true
        WHERE i.school_id = ${req.schoolId}
          AND (i.amount_mad - COALESCE(paid.paid_mad, 0)) > 0.01
          AND (${req.classId}::uuid IS NULL OR e.class_id = ${req.classId}::uuid)
          AND (${req.levelId}::uuid IS NULL OR c.level_id = ${req.levelId}::uuid)
          AND (
            ${req.guardianPersonId}::uuid IS NULL
            OR current_guardian.guardian_person_id = ${req.guardianPersonId}::uuid
            OR EXISTS (
              SELECT 1 FROM financial_account_payers fap
              WHERE fap.financial_account_id = fa.id AND fap.guardian_person_id = ${req.guardianPersonId}::uuid
            )
          )
        ORDER BY e.id, i.due_date ASC
      `
  })({ schoolId, classId, levelId, guardianPersonId })
})

const groupByEnrollment = (
  rows: ReadonlyArray<typeof UnpaidBalanceRow.Type>
): ReadonlyArray<Accumulator> => {
  const today = new Date().toISOString().slice(0, 10)
  const byEnrollment = new Map<string, Accumulator>()
  for (const row of rows) {
    let entry = byEnrollment.get(row.enrollment_id)
    if (entry === undefined) {
      entry = {
        enrollmentId: row.enrollment_id,
        studentPersonId: row.student_person_id,
        studentFirstName: row.first_name,
        studentLastName: row.last_name,
        classId: row.class_id,
        levelId: row.level_id,
        currentGuardianPersonId: row.current_guardian_person_id,
        closedFile: row.enrollment_status === "completed",
        totalOwedMad: 0,
        overdue: []
      }
      byEnrollment.set(row.enrollment_id, entry)
    }
    const owed = Math.round((row.amount_mad - row.paid_mad) * 100) / 100
    entry.totalOwedMad = Math.round((entry.totalOwedMad + owed) * 100) / 100
    if (row.due_date < today) {
      entry.overdue.push({ installmentId: row.installment_id, dueDate: row.due_date, amountOwed: owed })
    }
  }
  return Array.from(byEnrollment.values())
}

const toUnpaidBalance = (entry: Accumulator): UnpaidBalance => ({
  enrollmentId: entry.enrollmentId,
  studentPersonId: entry.studentPersonId,
  studentFirstName: entry.studentFirstName,
  studentLastName: entry.studentLastName,
  classId: entry.classId,
  levelId: entry.levelId,
  currentGuardianPersonId: entry.currentGuardianPersonId,
  closedFile: entry.closedFile,
  totalOwedMad: entry.totalOwedMad,
  overdueInstallments: entry.overdue
})

/** By student/enrollment — see the module-level doc comment for the full behavioral contract. */
export const findUnpaidBalances = Effect.fn("UnpaidBalances.findUnpaidBalances")(function*(
  schoolId: string,
  filter: UnpaidBalancesFilter = {}
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const rows = yield* queryUnpaidBalanceRows(sql, schoolId, filter)
      return groupByEnrollment(rows).map(toUnpaidBalance)
    })
  )
})

export interface GuardianUnpaidBalance {
  readonly guardianPersonId: string
  readonly totalOwedMad: number
  readonly children: ReadonlyArray<UnpaidBalance>
}

/**
 * BEH-ZS-170: the school's own "unpaid-balances table by guardian" —
 * one row per financial guardian, with the multi-child total and each
 * child's own breakdown, so a guardian paying for several siblings (a
 * family payment, ticket #59) is shown as the single collectible unit
 * `PaymentSchedule.ts`'s per-sibling installments don't otherwise surface
 * as. Grouped from the exact same rows `findUnpaidBalances` uses, keyed by
 * `current_guardian_person_id` — a child with no financial guardian
 * designated yet is omitted here (nothing to group it under) but still
 * appears in `findUnpaidBalances`.
 */
export const findUnpaidBalancesByGuardian = Effect.fn("UnpaidBalances.findUnpaidBalancesByGuardian")(function*(
  schoolId: string,
  filter: Omit<UnpaidBalancesFilter, "guardianPersonId"> & { readonly guardianPersonId?: string } = {}
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const rows = yield* queryUnpaidBalanceRows(sql, schoolId, filter)
      const children = groupByEnrollment(rows)

      const byGuardian = new Map<string, Array<Accumulator>>()
      for (const child of children) {
        if (child.currentGuardianPersonId === null) continue
        const bucket = byGuardian.get(child.currentGuardianPersonId)
        if (bucket === undefined) {
          byGuardian.set(child.currentGuardianPersonId, [child])
        } else {
          bucket.push(child)
        }
      }

      return Array.from(byGuardian.entries()).map(([guardianPersonId, childEntries]): GuardianUnpaidBalance => ({
        guardianPersonId,
        totalOwedMad: Math.round(childEntries.reduce((sum, c) => sum + c.totalOwedMad, 0) * 100) / 100,
        children: childEntries.map(toUnpaidBalance)
      }))
    })
  )
})
