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
import { attachGuardianProfile, createPerson, GuardianQualitiesSchema, recordGuardianRelationship } from "./Identity.ts"
import {
  FinancialAccountId,
  FinancialAccountPayerId,
  FinancialGuardianDesignationId,
  GuardianPersonId,
  SchoolId,
  StudentPersonId
} from "./Ids.ts"
import { authorizedFinance, EntityNotFoundError, requireOwnedRow } from "./Ownership.ts"

export { EntityNotFoundError }

export class GuardianRelationshipNotFoundError
  extends Schema.TaggedError<GuardianRelationshipNotFoundError>()("GuardianRelationshipNotFoundError", {
    guardianPersonId: Schema.String,
    studentPersonId: Schema.String
  })
{}

export class InvalidSplitError extends Schema.TaggedError<InvalidSplitError>()("InvalidSplitError", {
  reason: Schema.String
}) {}

/**
 * `Model.Class` for `financial_accounts` (ticket #56, migration 0015).
 * Insert-only from this file's perspective — `id` still needs this custom
 * `Model.Field` variant rather than `Model.GeneratedByDb`, the same
 * `SqlModel.makeRepository`-`idColumn` reasoning as `Enrollment.id`.
 */
export class FinancialAccount extends Model.Class<FinancialAccount>("FinancialAccount")({
  id: Model.Field({
    select: FinancialAccountId,
    update: FinancialAccountId,
    json: FinancialAccountId,
    jsonUpdate: FinancialAccountId
  }),
  school_id: SchoolId,
  enrollment_id: Schema.String,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/**
 * `financial_guardian_designations` is append-only (migration 0015's own
 * comment) — "the current financial guardian" is whichever row is most
 * recent for the account, never an updated pointer field, so "designated and
 * later changed, with the change traced" (ticket #56) falls out of the
 * table's shape for free.
 */
export class FinancialGuardianDesignation
  extends Model.Class<FinancialGuardianDesignation>("FinancialGuardianDesignation")({
    id: Model.Field({
      select: FinancialGuardianDesignationId,
      update: FinancialGuardianDesignationId,
      json: FinancialGuardianDesignationId,
      jsonUpdate: FinancialGuardianDesignationId
    }),
    school_id: SchoolId,
    financial_account_id: Schema.String,
    guardian_person_id: Schema.String,
    actor_subject_id: Schema.String,
    // `clock_timestamp()`, not `now()` (migration 0015) — advances between
    // statements even within one transaction, so "most recent designation"
    // (`findCurrentFinancialGuardian`'s `ORDER BY d.created_at DESC`) is
    // never ambiguous between two designations made in the same transaction.
    created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
  })
{}

/** `split_value` is `numeric` (migration 0015) — round-trips as a decimal string, same reasoning as `FeeItem.amount_mad`. */
export class FinancialAccountPayer extends Model.Class<FinancialAccountPayer>("FinancialAccountPayer")({
  id: Model.Field({
    select: FinancialAccountPayerId,
    update: FinancialAccountPayerId,
    json: FinancialAccountPayerId,
    jsonUpdate: FinancialAccountPayerId
  }),
  school_id: SchoolId,
  financial_account_id: Schema.String,
  guardian_person_id: Schema.String,
  split_type: Schema.Literals(["percentage", "fixed_amount"]),
  split_value: Schema.FiniteFromString,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

export interface PayerSplit {
  readonly guardianPersonId: string
  readonly splitType: "percentage" | "fixed_amount"
  readonly splitValue: number
}

const financialAccountRepo = SqlModel.makeRepository(FinancialAccount, {
  tableName: "financial_accounts",
  spanPrefix: "FinancialAccount",
  idColumn: "id"
})

const financialGuardianDesignationRepo = SqlModel.makeRepository(FinancialGuardianDesignation, {
  tableName: "financial_guardian_designations",
  spanPrefix: "FinancialAccount",
  idColumn: "id"
})

const financialAccountPayerRepo = SqlModel.makeRepository(FinancialAccountPayer, {
  tableName: "financial_account_payers",
  spanPrefix: "FinancialAccount",
  idColumn: "id"
})

/**
 * Idempotent find-or-create (BEH-ZS-172/173: "every enrollment gets exactly
 * one FinancialAccount") — same insert-catch-unique-then-reselect shape as
 * `GradeImport.ts`'s `findOrCreateImportedAssessment`. Deliberately without
 * its own `authorized`/`withSchool` wrapping: `Enrollment.ts`'s
 * `insertEnrollment` calls this directly, inside its own already-open scope,
 * the same reasoning as that function's own doc comment for why it, too,
 * has no wrapping of its own.
 */
export const ensureFinancialAccount = Effect.fn("FinancialAccount.ensureFinancialAccount")(function*(
  schoolId: string,
  enrollmentId: string
) {
  const sql = yield* SqlClient
  const repo = yield* financialAccountRepo
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)

  const created = yield* Effect.result(sql.withTransaction(repo.insert({
    school_id: validSchoolId,
    enrollment_id: enrollmentId
  })))
  if (Result.isSuccess(created)) return created.success.id

  const existing = yield* SqlSchema.findOneOption({
    Request: Schema.Struct({ enrollmentId: Schema.String }),
    Result: FinancialAccount,
    execute: (req) => sql`SELECT * FROM financial_accounts WHERE enrollment_id = ${req.enrollmentId}`
  })({ enrollmentId })

  return yield* Option.match(existing, {
    onNone: () => Effect.fail(created.failure),
    onSome: (account) => Effect.succeed(account.id)
  })
})

/** The enrollment's `student_person_id`, re-checked against `schoolId` — same `requireOwnedRow` reasoning as every other domain module's own lookups (`Ownership.ts`'s stated invariant). */
const requireEnrollmentStudent = Effect.fn("FinancialAccount.requireEnrollmentStudent")(function*(
  sql: SqlClient,
  schoolId: string,
  enrollmentId: string
) {
  const row = yield* requireOwnedRow(
    sql,
    "enrollments",
    "enrollment",
    enrollmentId,
    yield* Schema.decodeEffect(SchoolId)(schoolId),
    Schema.Struct({ student_person_id: Schema.String }),
    "student_person_id"
  )
  return row.student_person_id
})

/** A `parent_student_relationship` row already exists between the two — required before designating a financial guardian (BEH-ZS-172: "editable, and traced"), never auto-created here. */
const requireGuardianRelationship = Effect.fn("FinancialAccount.requireGuardianRelationship")(function*(
  sql: SqlClient,
  guardianPersonId: string,
  studentPersonId: string
) {
  const rows = yield* sql`
    SELECT 1 FROM parent_student_relationships
    WHERE guardian_person_id = ${guardianPersonId} AND student_person_id = ${studentPersonId}
  `
  if (rows.length === 0) {
    return yield* Effect.fail(new GuardianRelationshipNotFoundError({ guardianPersonId, studentPersonId }))
  }
})

const insertDesignation = Effect.fn("FinancialAccount.insertDesignation")(function*(
  schoolId: SchoolId,
  financialAccountId: string,
  guardianPersonId: string
) {
  const repo = yield* financialGuardianDesignationRepo
  const subject = yield* CurrentSubject
  const designation = yield* repo.insert({
    school_id: schoolId,
    financial_account_id: financialAccountId,
    guardian_person_id: guardianPersonId,
    actor_subject_id: subject.id
  })
  return designation.id
})

/**
 * BEH-ZS-172: designates (or re-designates — a later call simply appends a
 * newer designation) the enrollment's financial guardian. `guardianPersonId`
 * must already hold SOME `ParentStudentRelationship` to the student — a
 * distinct third party with no such relationship goes through
 * `createThirdPartyPayer` below instead, which creates that relationship
 * first.
 */
export const designateFinancialGuardian = Effect.fn("FinancialAccount.designateFinancialGuardian")(function*(
  rawSchoolId: string,
  enrollmentId: string,
  guardianPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizedFinance(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const studentPersonId = yield* requireEnrollmentStudent(sql, schoolId, enrollmentId)
        yield* requireGuardianRelationship(sql, guardianPersonId, studentPersonId)
        const financialAccountId = yield* ensureFinancialAccount(schoolId, enrollmentId)
        return yield* insertDesignation(schoolId, financialAccountId, guardianPersonId)
      })
    )
  )
})

/** The enrollment's current financial guardian — the most recent designation for its account, if any. */
export const findCurrentFinancialGuardian = Effect.fn("FinancialAccount.findCurrentFinancialGuardian")(function*(
  schoolId: string,
  enrollmentId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findOneOption({
        Request: Schema.Struct({ schoolId: Schema.String, enrollmentId: Schema.String }),
        Result: FinancialGuardianDesignation,
        execute: (req) =>
          sql`
            SELECT d.* FROM financial_guardian_designations d
            JOIN financial_accounts a ON a.id = d.financial_account_id
            WHERE a.school_id = ${req.schoolId} AND a.enrollment_id = ${req.enrollmentId}
            ORDER BY d.created_at DESC LIMIT 1
          `
      })({ schoolId, enrollmentId })
    })
  )
})

export interface ThirdPartyPayerInput {
  readonly firstName: string
  readonly lastName: string
  readonly dateOfBirth: string
  readonly mobileNumber: string
}

/**
 * ADR-ZS-055/BEH-ZS-172: a third party with no parental relationship,
 * designated financial guardian in the same operation that creates them —
 * unlike `designateFinancialGuardian` above, there is no pre-existing
 * relationship to require, since this function is the one that creates it,
 * carrying ONLY the financial-guardian quality (migration 0015's
 * `third_party_payer_financial_only` CHECK is the actual enforcement).
 */
export const createThirdPartyPayer = Effect.fn("FinancialAccount.createThirdPartyPayer")(function*(
  rawSchoolId: string,
  enrollmentId: string,
  input: ThirdPartyPayerInput
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizedFinance(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const studentPersonId = yield* requireEnrollmentStudent(sql, schoolId, enrollmentId)

        const personId = yield* createPerson({
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth
        })
        const guardianPersonId = yield* Schema.decodeEffect(GuardianPersonId)(personId)
        yield* attachGuardianProfile(personId, input.mobileNumber)

        const qualities = yield* Schema.decodeEffect(GuardianQualitiesSchema)({
          relationshipType: "third_party_payer",
          isLegalGuardian: false,
          isFinancialGuardian: true,
          isCustodialGuardian: false,
          isEmergencyContact: false,
          isAuthorizedForPickup: false
        })
        const validStudentPersonId = yield* Schema.decodeEffect(StudentPersonId)(studentPersonId)
        yield* recordGuardianRelationship(guardianPersonId, validStudentPersonId, qualities)

        const financialAccountId = yield* ensureFinancialAccount(schoolId, enrollmentId)
        yield* insertDesignation(schoolId, financialAccountId, guardianPersonId)
        return guardianPersonId
      })
    )
  )
})

/**
 * BEH-ZS-172: replaces the account's entire payer set in one transaction —
 * every `guardianPersonId` must already have a `ParentStudentRelationship` to
 * the student (the same precondition `designateFinancialGuardian` enforces).
 * A `percentage` split MUST be the only split type present and MUST sum to
 * exactly 100 — mixing `percentage` and `fixed_amount` payers, or a
 * percentage split that doesn't total 100, is refused rather than silently
 * accepted (there is no sum constraint on a purely `fixed_amount` split: the
 * amounts are literal shares of the bill, not required to total it exactly).
 */
export const splitFinancialResponsibility = Effect.fn("FinancialAccount.splitFinancialResponsibility")(function*(
  rawSchoolId: string,
  enrollmentId: string,
  payers: ReadonlyArray<PayerSplit>
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)

  return yield* authorizedFinance(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        // Validated inside the `authorizedFinance` gate, not before it —
        // matching `designateFinancialGuardian`/`createThirdPartyPayer` in
        // this same file, so an unauthorized caller never gets business-rule
        // feedback (e.g. the exact percentage total) before the permission
        // check has run.
        if (payers.length === 0) {
          return yield* Effect.fail(new InvalidSplitError({ reason: "at least one payer is required" }))
        }
        const uniqueGuardianCount = new Set(payers.map((payer) => payer.guardianPersonId)).size
        if (uniqueGuardianCount !== payers.length) {
          return yield* Effect.fail(new InvalidSplitError({ reason: "each payer may appear at most once" }))
        }
        const splitTypes = new Set(payers.map((payer) => payer.splitType))
        if (splitTypes.has("percentage") && splitTypes.size > 1) {
          return yield* Effect.fail(
            new InvalidSplitError({ reason: "a percentage split cannot be mixed with a fixed-amount payer" })
          )
        }
        if (splitTypes.has("percentage")) {
          const total = payers.reduce((sum, payer) => sum + payer.splitValue, 0)
          if (Math.abs(total - 100) > 0.01) {
            return yield* Effect.fail(
              new InvalidSplitError({ reason: `percentage split must total 100, got ${total}` })
            )
          }
        }

        const sql = yield* SqlClient
        const studentPersonId = yield* requireEnrollmentStudent(sql, schoolId, enrollmentId)
        for (const payer of payers) {
          yield* requireGuardianRelationship(sql, payer.guardianPersonId, studentPersonId)
        }
        const financialAccountId = yield* ensureFinancialAccount(schoolId, enrollmentId)

        const repo = yield* financialAccountPayerRepo
        return yield* sql.withTransaction(Effect.gen(function*() {
          yield* sql`DELETE FROM financial_account_payers WHERE financial_account_id = ${financialAccountId}`
          const rows: Array<FinancialAccountPayer> = []
          for (const payer of payers) {
            const row = yield* repo.insert({
              school_id: schoolId,
              financial_account_id: financialAccountId,
              guardian_person_id: payer.guardianPersonId,
              split_type: payer.splitType,
              split_value: payer.splitValue
            })
            rows.push(row)
          }
          return rows
        }))
      })
    )
  )
})

/** The account's current payer split, if one has been recorded. */
export const findFinancialAccountPayers = Effect.fn("FinancialAccount.findFinancialAccountPayers")(function*(
  schoolId: string,
  enrollmentId: string
) {
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String, enrollmentId: Schema.String }),
        Result: FinancialAccountPayer,
        execute: (req) =>
          sql`
            SELECT p.* FROM financial_account_payers p
            JOIN financial_accounts a ON a.id = p.financial_account_id
            WHERE a.school_id = ${req.schoolId} AND a.enrollment_id = ${req.enrollmentId}
          `
      })({ schoolId, enrollmentId })
    })
  )
})
