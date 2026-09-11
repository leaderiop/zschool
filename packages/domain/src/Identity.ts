import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import type { GuardianPersonId, StudentPersonId } from "./Ids.ts"

export class InvalidMobileNumberError extends Schema.TaggedError<InvalidMobileNumberError>()(
  "InvalidMobileNumberError",
  { mobileNumber: Schema.String }
) {}

export const E164_PATTERN = /^\+[1-9]\d{7,14}$/

/**
 * The single source of truth for "is this a valid E.164 mobile number" — the
 * import row schemas (`StudentGuardianImport.ts`) reference this schema
 * directly instead of redeclaring the same `Schema.isPattern` check (issue
 * #34), so the rule can't silently drift between the two.
 */
export const MobileNumber = Schema.String.check(Schema.isPattern(E164_PATTERN, { expected: "an E.164 mobile number" }))
export const isValidE164 = Schema.is(MobileNumber)

/**
 * The `find_person_matches` (migration 0008) row shape, decoded (rather than
 * trusted via a compile-time-only cast) directly into its camelCase
 * application shape via `Schema.encodeKeys` — a future column rename/type
 * change is caught here, and the snake_case-to-camelCase mapping lives in
 * the schema itself instead of a hand-written `.map` after decode (issue
 * #34).
 */
export const PersonMatch = Schema.Struct({
  personId: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  dateOfBirth: Schema.String,
  massarCode: Schema.NullOr(Schema.String),
  matchKind: Schema.Literals(["strong", "weak"])
}).pipe(Schema.encodeKeys({
  personId: "person_id",
  firstName: "first_name",
  lastName: "last_name",
  dateOfBirth: "date_of_birth",
  massarCode: "massar_code",
  matchKind: "match_kind"
}))
export type PersonMatch = typeof PersonMatch.Type

/** The `find_guardian_by_mobile` row shape, decoded for the same reason as `PersonMatch`. */
export const GuardianMatch = Schema.Struct({
  personId: Schema.String
}).pipe(Schema.encodeKeys({ personId: "person_id" }))
export type GuardianMatch = typeof GuardianMatch.Type

// `packages/domain` stays platform-agnostic (no `node:*` imports, no
// `@types/node` anywhere in this monorepo) — the Web Crypto global that
// provides `randomUUID` is available at runtime (Node 22, browsers) without
// needing the DOM lib this package doesn't otherwise pull in.
const randomUUID = (): string => (globalThis as unknown as { crypto: { randomUUID(): string } }).crypto.randomUUID()

export interface NewPersonInput {
  readonly firstName: string
  readonly lastName: string
  readonly dateOfBirth: string
  readonly massarCode?: string
}

/**
 * ADR-ZS-108: the only path to a cross-tenant identity match — `persons`'
 * own RLS would otherwise hide every person not already linked to the
 * caller's school, which is useless for detecting that an import row
 * matches someone enrolled elsewhere. Returns only id/name/dob/massar_code,
 * per row, never a full `Person` and never another table — see
 * `find_person_matches` (migration 0008) for why that can't be widened into
 * a general search tool.
 */
export const findPersonMatches = Effect.fn("Identity.findPersonMatches")(function*(
  massarCode: string | undefined,
  firstName: string,
  lastName: string,
  dateOfBirth: string
) {
  const sql = yield* SqlClient
  const query = SqlSchema.findAll({
    Request: Schema.Void,
    Result: PersonMatch,
    execute: () =>
      sql`SELECT * FROM find_person_matches(${massarCode ?? null}, ${firstName}, ${lastName}, ${dateOfBirth})`
  })
  return yield* query(undefined)
})

/**
 * ADR-ZS-050: a guardian's mobile number is the key used to detect an
 * existing account, across schools. Returns `Option` rather than collapsing
 * to `undefined` here — the "may not exist yet" stays composable all the way
 * to whichever caller actually needs a raw nullable (issue #34: `Option`
 * kept through the caller boundary, converted only at the one call site in
 * `StudentGuardianImport.ts`'s `commitImportBatch` that wants a `??` chain).
 */
export const findGuardianMatch = Effect.fn("Identity.findGuardianMatch")(function*(
  mobileNumber: string
) {
  const sql = yield* SqlClient
  const query = SqlSchema.findOneOption({
    Request: Schema.Void,
    Result: GuardianMatch,
    execute: () => sql`SELECT * FROM find_guardian_by_mobile(${mobileNumber})`
  })
  return yield* query(undefined)
})

/**
 * Creates the shared `Person` row a profile attaches to. Not
 * `authorized()`-wrapped: `persons` carries no `school_id` to check, and
 * this is only ever called from within an already-authorized import flow.
 *
 * The id is generated here rather than left to `persons`' own
 * `DEFAULT gen_random_uuid()` plus `RETURNING id`: Postgres RLS filters a
 * `RETURNING` clause's output through the table's SELECT policy, and
 * `persons`' SELECT policy (migration 0008) requires an `Enrollment` or
 * relationship that doesn't exist yet for a brand-new person — the insert
 * itself would succeed (`WITH CHECK (true)`) but `RETURNING id` would then
 * find no visible row and fail with "new row violates row-level security
 * policy". Knowing the id up front sidesteps needing to read it back at all.
 */
export const createPerson = Effect.fn("Identity.createPerson")(function*(
  input: NewPersonInput
) {
  const sql = yield* SqlClient
  const id = randomUUID()
  yield* sql`
    INSERT INTO persons (id, first_name, last_name, date_of_birth, massar_code)
    VALUES (${id}, ${input.firstName}, ${input.lastName}, ${input.dateOfBirth}, ${input.massarCode ?? null})
  `
  return id
})

/**
 * Idempotent — a `Person` has at most one `StudentProfile` (unique
 * `person_id`). A plain `INSERT`, not `ON CONFLICT (person_id) DO NOTHING`:
 * empirically, Postgres evaluates `ON CONFLICT`'s arbiter through
 * `ExecWithCheckOptions` even when no row actually conflicts, which here
 * means checking `student_profiles`' SELECT policy (`person_scoped_select`,
 * migration 0008) — itself delegating to `persons`' own SELECT policy. For a
 * person matched from ANOTHER school (the whole point of ADR-ZS-108's
 * cross-tenant matching), that's false in the CURRENT school's session until
 * this same import creates an `Enrollment` here, so `ON CONFLICT` fails with
 * "new row violates row-level security policy" regardless of whether a
 * conflict exists. Catching the unique-violation reason instead sidesteps
 * RLS's `ON CONFLICT` handling entirely. The caller doesn't need this
 * function's return value — nothing downstream uses a profile's own id,
 * only the `Person`'s.
 */
export const attachStudentProfile = Effect.fn("Identity.attachStudentProfile")(function*(
  personId: string
) {
  const sql = yield* SqlClient
  // A caught error still leaves the *transaction* aborted in Postgres —
  // catching it in Effect doesn't undo that at the connection level.
  // `withTransaction` opens a SAVEPOINT here (nested inside the caller's
  // own transaction) and rolls back to just that savepoint on failure, so
  // the surrounding import transaction stays usable afterward.
  yield* sql.withTransaction(sql`INSERT INTO student_profiles (person_id) VALUES (${personId})`).pipe(
    Effect.catchReason("SqlError", "UniqueViolation", () => Effect.void)
  )
})

/** Same reasoning as `attachStudentProfile` above. */
export const attachGuardianProfile = Effect.fn("Identity.attachGuardianProfile")(function*(
  personId: string,
  mobileNumber: string
) {
  if (!isValidE164(mobileNumber)) {
    return yield* Effect.fail(new InvalidMobileNumberError({ mobileNumber }))
  }
  const sql = yield* SqlClient
  yield* sql.withTransaction(
    sql`INSERT INTO guardian_profiles (person_id, mobile_number) VALUES (${personId}, ${mobileNumber})`
  ).pipe(Effect.catchReason("SqlError", "UniqueViolation", () => Effect.void))
})

/**
 * The single source of truth for a guardian relationship's qualities (issue
 * #34) — previously declared twice (an interface here, a structurally
 * identical `GuardianQualitiesSchema` in `StudentGuardianImport.ts`), which
 * meant a field added to one could silently fail to reach the other.
 */
export const GuardianQualitiesSchema = Schema.Struct({
  relationshipType: Schema.Literals(["mother", "father", "guardian", "other"]),
  isLegalGuardian: Schema.Boolean,
  isFinancialGuardian: Schema.Boolean,
  isCustodialGuardian: Schema.Boolean,
  isEmergencyContact: Schema.Boolean,
  isAuthorizedForPickup: Schema.Boolean
})
export type GuardianQualities = typeof GuardianQualitiesSchema.Type

/**
 * INV-ZS-021/064. Idempotent on the (guardian, student) pair via a caught
 * unique-violation, not `ON CONFLICT DO NOTHING` — same `ExecWithCheckOptions`
 * reasoning as `attachStudentProfile`/`attachGuardianProfile` above.
 * Re-importing the same relationship leaves the existing row as-is.
 */
export const recordGuardianRelationship = Effect.fn("Identity.recordGuardianRelationship")(function*(
  guardianPersonId: GuardianPersonId,
  studentPersonId: StudentPersonId,
  qualities: GuardianQualities
) {
  const sql = yield* SqlClient
  yield* sql.withTransaction(sql`
    INSERT INTO parent_student_relationships
      (guardian_person_id, student_person_id, relationship_type, is_legal_guardian, is_financial_guardian, is_custodial_guardian, is_emergency_contact, is_authorized_for_pickup)
    VALUES (
      ${guardianPersonId}, ${studentPersonId}, ${qualities.relationshipType},
      ${qualities.isLegalGuardian}, ${qualities.isFinancialGuardian}, ${qualities.isCustodialGuardian},
      ${qualities.isEmergencyContact}, ${qualities.isAuthorizedForPickup}
    )
  `).pipe(Effect.catchReason("SqlError", "UniqueViolation", () => Effect.void))
})
