import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"

export class InvalidMobileNumberError extends Data.TaggedError("InvalidMobileNumberError")<{
  readonly mobileNumber: string
}> {}

export interface PersonMatch {
  readonly personId: string
  readonly firstName: string
  readonly lastName: string
  readonly dateOfBirth: string
  readonly massarCode: string | null
  readonly matchKind: "strong" | "weak"
}

const E164_PATTERN = /^\+[1-9]\d{7,14}$/

export const isValidE164 = (mobileNumber: string): boolean => E164_PATTERN.test(mobileNumber)

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
export const findPersonMatches = (
  massarCode: string | undefined,
  firstName: string,
  lastName: string,
  dateOfBirth: string
): Effect.Effect<ReadonlyArray<PersonMatch>, SqlError, SqlClient> =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    const rows = yield* sql<
      {
        person_id: string
        first_name: string
        last_name: string
        date_of_birth: string
        massar_code: string | null
        match_kind: "strong" | "weak"
      }
    >`SELECT * FROM find_person_matches(${massarCode ?? null}, ${firstName}, ${lastName}, ${dateOfBirth})`
    return rows.map((r) => ({
      personId: r.person_id,
      firstName: r.first_name,
      lastName: r.last_name,
      dateOfBirth: r.date_of_birth,
      massarCode: r.massar_code,
      matchKind: r.match_kind
    }))
  })

/** ADR-ZS-050: a guardian's mobile number is the key used to detect an existing account, across schools. */
export const findGuardianMatch = (
  mobileNumber: string
): Effect.Effect<{ readonly personId: string } | undefined, SqlError, SqlClient> =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    const [row] = yield* sql<{ person_id: string }>`SELECT * FROM find_guardian_by_mobile(${mobileNumber})`
    return row === undefined ? undefined : { personId: row.person_id }
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
export const createPerson = (
  input: NewPersonInput
): Effect.Effect<string, SqlError, SqlClient> =>
  Effect.gen(function*() {
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
export const attachStudentProfile = (
  personId: string
): Effect.Effect<void, SqlError, SqlClient> =>
  Effect.gen(function*() {
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
export const attachGuardianProfile = (
  personId: string,
  mobileNumber: string
): Effect.Effect<void, InvalidMobileNumberError | SqlError, SqlClient> =>
  Effect.gen(function*() {
    if (!isValidE164(mobileNumber)) {
      return yield* Effect.fail(new InvalidMobileNumberError({ mobileNumber }))
    }
    const sql = yield* SqlClient
    yield* sql.withTransaction(
      sql`INSERT INTO guardian_profiles (person_id, mobile_number) VALUES (${personId}, ${mobileNumber})`
    ).pipe(Effect.catchReason("SqlError", "UniqueViolation", () => Effect.void))
  })

export interface GuardianQualities {
  readonly relationshipType: "mother" | "father" | "guardian" | "other"
  readonly isLegalGuardian: boolean
  readonly isFinancialGuardian: boolean
  readonly isCustodialGuardian: boolean
  readonly isEmergencyContact: boolean
  readonly isAuthorizedForPickup: boolean
}

/**
 * INV-ZS-021/064. Idempotent on the (guardian, student) pair via a caught
 * unique-violation, not `ON CONFLICT DO NOTHING` — same `ExecWithCheckOptions`
 * reasoning as `attachStudentProfile`/`attachGuardianProfile` above.
 * Re-importing the same relationship leaves the existing row as-is.
 */
export const recordGuardianRelationship = (
  guardianPersonId: string,
  studentPersonId: string,
  qualities: GuardianQualities
): Effect.Effect<void, SqlError, SqlClient> =>
  Effect.gen(function*() {
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
