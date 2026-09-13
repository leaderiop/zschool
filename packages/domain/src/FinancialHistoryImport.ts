import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { ensureFinancialAccount } from "./FinancialAccount.ts"
import { findEnrollmentByMassarCode } from "./GradeImport.ts"
import { SchoolId } from "./Ids.ts"
import { failureReason, ImportRowError, ImportRowErrorPublicSchema } from "./ImportRowError.ts"
import { authorizedFinance } from "./Ownership.ts"
import { CHEQUE_STATUSES, recordChequeAtStatus, recordPayment } from "./Payment.ts"
import { adjustInstallment, findInstallments } from "./PaymentSchedule.ts"

/**
 * Ticket #12 (ADR-ZS-043 / BEH-ZS-006's "Mid-year catch-up for a pilot"
 * scenario): a fourth import domain, following the same stateless
 * synchronous analyze/commit pair every import domain but classes-import
 * uses (`GradeImport.ts`, `HistoricalGradeImport.ts`, `TeacherImport.ts`,
 * `StudentGuardianImport.ts`) — not `ImportBatch.ts`'s persisted async
 * pattern, which stays classes-only (`import_batches.import_domain` is
 * `Schema.Literals(["classes"])`).
 *
 * A row targets an enrollment already made ACTIVE by the student+guardian
 * import (#9, BEH-ZS-047) and already holding a freshly-generated,
 * entirely-unpaid payment schedule (#57) — this module never creates an
 * enrollment or a payment schedule itself, only reconciles one against
 * real-world history using the exact primitives a director would use to
 * record the same events happening today: `recordPayment` (an aggregate
 * already-paid amount), `recordChequeAtStatus` (ticket #61's own "mid-year
 * import escape hatch"), and `adjustInstallment` (a discount already
 * granted, BEH-ZS-153's manual-adjustment primitive — the full negotiated-
 * discount workflow, BEH-ZS-155, is V1 scope).
 */

export const FinancialHistoryChequeRowSchema = Schema.Struct({
  chequeNumber: Schema.NonEmptyString,
  bank: Schema.NonEmptyString,
  chequeDate: Schema.String,
  amountMad: Schema.Finite.check(Schema.isGreaterThan(0)),
  initialStatus: Schema.Literals(CHEQUE_STATUSES),
  bounceReason: Schema.optional(Schema.NonEmptyString),
  bounceNoticeReference: Schema.optional(Schema.NonEmptyString),
  regularizingPaymentId: Schema.optional(Schema.NonEmptyString)
})
export type FinancialHistoryChequeRow = typeof FinancialHistoryChequeRowSchema.Type

export interface FinancialHistoryImportRow {
  readonly rowId: string
  readonly massarCode: string
  /** An aggregate figure, not a per-installment breakdown — a real pilot school's own pre-ZSchool records are "family X has paid Y DH so far," not a structured ledger. Fed through `recordPayment`'s existing oldest-first allocator. */
  readonly amountAlreadyPaidMad?: number
  /** Required when `amountAlreadyPaidMad` is given — the historical date the allocator restricts itself to installments due on or before. */
  readonly asOfDate?: string
  readonly cheques?: ReadonlyArray<FinancialHistoryChequeRow>
  readonly discountAlreadyGrantedMad?: number
  /** Required when `discountAlreadyGrantedMad` is given — traced onto every `InstallmentAdjustment` it produces. */
  readonly discountReason?: string
}

export const FinancialHistoryImportRowSchema = Schema.Struct({
  rowId: Schema.NonEmptyString,
  massarCode: Schema.NonEmptyString,
  amountAlreadyPaidMad: Schema.optional(Schema.Finite.check(Schema.isGreaterThanOrEqualTo(0))),
  asOfDate: Schema.optional(Schema.String),
  cheques: Schema.optional(Schema.Array(FinancialHistoryChequeRowSchema)),
  discountAlreadyGrantedMad: Schema.optional(Schema.Finite.check(Schema.isGreaterThanOrEqualTo(0))),
  discountReason: Schema.optional(Schema.NonEmptyString)
})

/**
 * Cross-field checks the schema alone can't express (issue #34's
 * `ImportRowError` shape, same "decode then refine" split
 * `GradeImport.ts`'s own row decode keeps free of `Schema.filter` combinators
 * for a multi-field rule).
 */
const refineFinancialHistoryImportRow = (
  row: FinancialHistoryImportRow
): Result.Result<FinancialHistoryImportRow, ImportRowError> => {
  if (row.amountAlreadyPaidMad !== undefined && row.amountAlreadyPaidMad > 0 && row.asOfDate === undefined) {
    return Result.fail(new ImportRowError({ reason: "asOfDate is required when amountAlreadyPaidMad is given" }))
  }
  if (
    row.discountAlreadyGrantedMad !== undefined && row.discountAlreadyGrantedMad > 0 &&
    row.discountReason === undefined
  ) {
    return Result.fail(
      new ImportRowError({ reason: "discountReason is required when discountAlreadyGrantedMad is given" })
    )
  }
  for (const cheque of row.cheques ?? []) {
    const bounceStates: ReadonlyArray<string> = ["bounced", "regularized", "litigation"]
    if (
      bounceStates.includes(cheque.initialStatus) &&
      (cheque.bounceReason === undefined || cheque.bounceNoticeReference === undefined)
    ) {
      return Result.fail(
        new ImportRowError({
          reason:
            `cheque ${cheque.chequeNumber}: a bounce reason and notice reference are required to import a cheque already ${cheque.initialStatus}`
        })
      )
    }
    if (cheque.initialStatus === "regularized" && cheque.regularizingPaymentId === undefined) {
      return Result.fail(
        new ImportRowError({
          reason: `cheque ${cheque.chequeNumber}: a regularizing payment id is required to import an already-regularized cheque`
        })
      )
    }
  }
  return Result.succeed(row)
}

export const decodeFinancialHistoryImportRow = (
  row: FinancialHistoryImportRow
): Result.Result<FinancialHistoryImportRow, ImportRowError | Schema.SchemaError> =>
  Result.flatMap(
    Schema.decodeResult(FinancialHistoryImportRowSchema)(row) as Result.Result<
      FinancialHistoryImportRow,
      Schema.SchemaError
    >,
    refineFinancialHistoryImportRow
  )

const rowResolvable = Schema.Struct({ rowId: Schema.String, status: Schema.Literal("resolvable") })
export const FinancialHistoryAnalysisResultSchema = Schema.Union([
  rowResolvable,
  Schema.Struct({ rowId: Schema.String, status: Schema.Literal("error"), error: ImportRowError })
])
export type FinancialHistoryAnalysisResult = typeof FinancialHistoryAnalysisResultSchema.Type

/** The `analyzeFinancialHistoryRows` endpoint's wire contract — see `GradeAnalysisResultHttpSchema`'s own doc comment for why the `error` branch differs. */
export const FinancialHistoryAnalysisResultHttpSchema = Schema.Union([
  rowResolvable,
  Schema.Struct({ rowId: Schema.String, status: Schema.Literal("error"), error: ImportRowErrorPublicSchema })
])

export type FinancialHistoryRowResult =
  | { readonly rowId: string; readonly status: "committed" }
  | { readonly rowId: string; readonly status: "skipped_already_applied" }
  | { readonly rowId: string; readonly status: "error"; readonly error: ImportRowError }

const mapRowOutcome = <A, B>(
  unit: Result.Result<A, { readonly _tag: string }>,
  onSuccess: (success: A) => B,
  onFailure: (error: ImportRowError) => B
): B =>
  Result.match(unit, {
    onFailure: (failure) =>
      onFailure(
        failure._tag === "ImportRowError"
          ? failure as ImportRowError
          : new ImportRowError({ reason: failureReason(failure), cause: failure })
      ),
    onSuccess
  })

/**
 * Read-only resolution of a row's target — enrollment/Massar-code match and
 * payment-schedule existence — without writing anything, same non-committal
 * preview every import domain gives before commit. No authorization gate,
 * matching `GradeImport.ts`'s own `analyzeGradeRows` (a read-only preview
 * needs no `authorizedFinance` check).
 */
const analyzeFinancialHistoryRow = Effect.fn("FinancialHistoryImport.analyzeFinancialHistoryRow")(function*(
  schoolId: string,
  academicYearId: string,
  row: FinancialHistoryImportRow
) {
  const decoded = decodeFinancialHistoryImportRow(row)
  if (Result.isFailure(decoded)) {
    const failure = decoded.failure
    return {
      rowId: row.rowId,
      status: "error",
      error: failure._tag === "ImportRowError" ? failure : new ImportRowError({ reason: failure.message })
    } as const
  }

  const resolved = yield* Effect.result(Effect.gen(function*() {
    const enrollment = yield* findEnrollmentByMassarCode(schoolId, academicYearId, row.massarCode)
    if (Option.isNone(enrollment)) {
      return yield* Effect.fail(new ImportRowError({ reason: `No enrollment for Massar code "${row.massarCode}"` }))
    }
    const installments = yield* findInstallments(schoolId, enrollment.value.enrollmentId)
    if (installments.length === 0) {
      return yield* Effect.fail(
        new ImportRowError({
          reason:
            `No payment schedule generated yet for Massar code "${row.massarCode}" — configure the level's fee schedule first`
        })
      )
    }
  }))

  return mapRowOutcome(
    resolved,
    (): FinancialHistoryAnalysisResult => ({ rowId: row.rowId, status: "resolvable" }),
    (error): FinancialHistoryAnalysisResult => ({ rowId: row.rowId, status: "error", error })
  )
})

export const analyzeFinancialHistoryRows = Effect.fn("FinancialHistoryImport.analyzeFinancialHistoryRows")(function*(
  schoolId: string,
  academicYearId: string,
  rows: ReadonlyArray<FinancialHistoryImportRow>
) {
  return yield* withSchool(
    schoolId,
    Effect.forEach(rows, (row) => analyzeFinancialHistoryRow(schoolId, academicYearId, row))
  )
})

/**
 * An installment's remaining owed amount — a deliberate independent copy of
 * `Payment.ts`'s own private `remainingOwed`, not an import: this module
 * must never drift from Payment.ts's definition of "settled," but importing
 * an unexported internal would couple the two files' internals rather than
 * their public contract. Both read the identical `payment_allocations`/
 * `payments.status` shape (same reasoning `Dunning.ts`'s own copy gives).
 */
const remainingOwed = Effect.fn("FinancialHistoryImport.remainingOwed")(function*(
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
 * Reduces the earliest unsettled installments, oldest first, by
 * `discountMad` in total — via `adjustInstallment`, exhausting the discount
 * across as many installments as needed, mirroring `Payment.ts`'s own
 * `autoAllocateOldestFirst` traversal but applied to reducing `amount_mad`
 * instead of allocating a payment.
 *
 * If every installment is already fully settled (nothing left to reduce),
 * the discount is silently not applied to anything — the same best-effort
 * treatment `Enrollment.ts#insertEnrollment` already gives its own
 * secondary effects (sibling-discount recompute, schedule generation): a
 * row-level failure here would refuse an otherwise-valid payment/cheque
 * import over an edge case with no real-world financial consequence (there
 * is nothing left to discount).
 */
const applyDiscount = Effect.fn("FinancialHistoryImport.applyDiscount")(function*(
  sql: SqlClient,
  schoolId: string,
  enrollmentId: string,
  discountMad: number,
  reason: string
) {
  const installments = yield* findInstallments(schoolId, enrollmentId)
  let remainingDiscount = discountMad
  for (const installment of installments) {
    if (remainingDiscount <= 0.01) break
    const owed = yield* remainingOwed(sql, installment.id, installment.amount_mad)
    if (owed <= 0.01) continue
    const reduceBy = Math.min(remainingDiscount, owed)
    const newAmountMad = Math.round((installment.amount_mad - reduceBy) * 100) / 100
    yield* adjustInstallment(schoolId, installment.id, { amountMad: newAmountMad, reason })
    remainingDiscount -= reduceBy
  }
})

/**
 * Re-validates each row against current DB state at commit time (ADR-ZS-106
 * spirit, even though this domain doesn't use `ImportBatch.ts` itself) and
 * applies its three effects — already-paid amount, cheques on hand,
 * discount already granted — inside one transaction per row, guarded by the
 * per-`FinancialAccount` `mid_year_catchup_applied_at` marker (migration
 * 0023) so a retried row is a no-op rather than a double-application.
 */
export const commitFinancialHistoryImportBatch = Effect.fn(
  "FinancialHistoryImport.commitFinancialHistoryImportBatch"
)(function*(
  rawSchoolId: string,
  academicYearId: string,
  rows: ReadonlyArray<FinancialHistoryImportRow>
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizedFinance(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const results: Array<FinancialHistoryRowResult> = []

        for (const row of rows) {
          const decoded = decodeFinancialHistoryImportRow(row)
          if (Result.isFailure(decoded)) {
            const failure = decoded.failure
            results.push({
              rowId: row.rowId,
              status: "error",
              error: failure._tag === "ImportRowError" ? failure : new ImportRowError({ reason: failure.message })
            })
            continue
          }

          const unit = yield* Effect.result(sql.withTransaction(Effect.gen(function*() {
            const enrollment = yield* findEnrollmentByMassarCode(schoolId, academicYearId, row.massarCode)
            if (Option.isNone(enrollment)) {
              return yield* Effect.fail(
                new ImportRowError({ reason: `No enrollment for Massar code "${row.massarCode}"` })
              )
            }
            const installments = yield* findInstallments(schoolId, enrollment.value.enrollmentId)
            if (installments.length === 0) {
              return yield* Effect.fail(
                new ImportRowError({
                  reason:
                    `No payment schedule generated yet for Massar code "${row.massarCode}" — configure the level's fee schedule first`
                })
              )
            }

            const financialAccountId = yield* ensureFinancialAccount(schoolId, enrollment.value.enrollmentId)

            const [account] = yield* sql<{ mid_year_catchup_applied_at: string | null }>`
              SELECT mid_year_catchup_applied_at FROM financial_accounts WHERE id = ${financialAccountId}
            `
            if (account.mid_year_catchup_applied_at !== null) {
              return "already_applied" as const
            }

            if (row.amountAlreadyPaidMad !== undefined && row.amountAlreadyPaidMad > 0) {
              yield* recordPayment({
                schoolId,
                method: "cash",
                amountMad: row.amountAlreadyPaidMad,
                valueDate: row.asOfDate!,
                reference: "Mid-year catch-up import",
                financialAccountIds: [financialAccountId]
              })
            }

            for (const cheque of row.cheques ?? []) {
              yield* recordChequeAtStatus({
                schoolId,
                amountMad: cheque.amountMad,
                valueDate: cheque.chequeDate,
                reference: "Mid-year catch-up import",
                chequeNumber: cheque.chequeNumber,
                bank: cheque.bank,
                chequeDate: cheque.chequeDate,
                financialAccountIds: [financialAccountId],
                initialStatus: cheque.initialStatus,
                bounceReason: cheque.bounceReason,
                bounceNoticeReference: cheque.bounceNoticeReference,
                regularizingPaymentId: cheque.regularizingPaymentId
              })
            }

            if (row.discountAlreadyGrantedMad !== undefined && row.discountAlreadyGrantedMad > 0) {
              yield* applyDiscount(
                sql,
                schoolId,
                enrollment.value.enrollmentId,
                row.discountAlreadyGrantedMad,
                row.discountReason!
              )
            }

            yield* sql`
              UPDATE financial_accounts SET mid_year_catchup_applied_at = clock_timestamp()
              WHERE id = ${financialAccountId}
            `
            return "committed" as const
          })))

          results.push(
            mapRowOutcome(
              unit,
              (outcome): FinancialHistoryRowResult =>
                outcome === "already_applied"
                  ? { rowId: row.rowId, status: "skipped_already_applied" }
                  : { rowId: row.rowId, status: "committed" },
              (error): FinancialHistoryRowResult => ({ rowId: row.rowId, status: "error", error })
            )
          )
        }

        return results
      })
    )
  )
})
