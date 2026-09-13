import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { SchoolId, SchoolMembershipCycleId, TeacherPersonId } from "./Ids.ts"

/**
 * `Model.Class` for `school_memberships` (migration 0011, ticket #14 /
 * ADR-ZS-016; role vocabulary extended by migration 0024, ticket #94, for
 * the Attendance capability's `student_life`/`front_office` roles). `role`
 * and `status` intentionally only cover what's been needed so far — the
 * full affiliation entity (contract types, dates, permissions) is
 * `spec/domain-model.md`'s own future scope, not reintroduced here ahead of
 * a ticket that needs it.
 */
export class SchoolMembership extends Model.Class<SchoolMembership>("SchoolMembership")({
  id: Model.Field({ select: Schema.String, update: Schema.String, json: Schema.String, jsonUpdate: Schema.String }),
  school_id: SchoolId,
  person_id: TeacherPersonId,
  role: Schema.Literals(["teacher", "student_life", "front_office"]),
  status: Schema.Literals(["invited", "active", "suspended", "ended"]),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

const schoolMembershipRepo = SqlModel.makeRepository(SchoolMembership, {
  tableName: "school_memberships",
  spanPrefix: "SchoolMembership",
  idColumn: "id"
})

/**
 * `Model.Class` for `school_membership_cycles` (migration 0024, ticket #94).
 * Generalized cycle-scoping usable by any role, not hardcoded to
 * `student_life`: no *active* row (`unassigned_at IS NULL`) for a membership
 * means whole-school scope; one or more means cycle-scoped to exactly those
 * cycles. This is the table `canTakeRollCall`/`canViewStudentLifeDashboard`
 * (`authorization/Policies.ts`) read to populate a subject's `cycle_ids`
 * attribute.
 */
export class SchoolMembershipCycle extends Model.Class<SchoolMembershipCycle>("SchoolMembershipCycle")({
  id: Model.Field({
    select: SchoolMembershipCycleId,
    update: SchoolMembershipCycleId,
    json: SchoolMembershipCycleId,
    jsonUpdate: SchoolMembershipCycleId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  school_membership_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  cycle_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  assigned_by: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  assigned_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  unassigned_at: Schema.NullOr(Schema.DateTimeUtcFromMillis)
}) {}

const schoolMembershipCycleRepo = SqlModel.makeRepository(SchoolMembershipCycle, {
  tableName: "school_membership_cycles",
  spanPrefix: "SchoolMembershipCycle",
  idColumn: "id"
})

/**
 * ADR-ZS-111: the only membership bulk import ever creates — always
 * `'invited'`, never `'active'`. Idempotent on the (school, person, role)
 * triple via the table's own unique index (same caught-unique-violation
 * pattern as `Identity.ts`'s `attachStudentProfile`/`attachGuardianProfile`)
 * — re-importing the same teacher into the same school is a no-op rather
 * than a duplicate invitation.
 */
export const inviteTeacherMembership = Effect.fn("SchoolMembership.inviteTeacherMembership")(function*(
  schoolId: string,
  personId: string
) {
  const sql = yield* SqlClient
  const repo = yield* schoolMembershipRepo
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  const validPersonId = yield* Schema.decodeEffect(TeacherPersonId)(personId)
  yield* sql.withTransaction(
    repo.insertVoid({ school_id: validSchoolId, person_id: validPersonId, role: "teacher", status: "invited" })
  ).pipe(Effect.catchReason("SqlError", "UniqueViolation", () => Effect.void))
})

/**
 * Assigns `schoolMembershipId` to `cycleId` — usable regardless of the
 * membership's role, per ticket #94's "generalized, not per-role" mandate.
 * Assigning a membership already whole-school-scoped narrows it to the
 * given cycles (each assignment is additive; a membership with N active
 * rows is scoped to N cycles). Idempotent on the partial unique index
 * `(school_membership_id, cycle_id) WHERE unassigned_at IS NULL` — assigning
 * an already-active pair again is a no-op, same caught-unique-violation
 * idiom as `inviteTeacherMembership` above.
 */
export const assignMembershipToCycle = Effect.fn("SchoolMembership.assignMembershipToCycle")(function*(
  schoolId: string,
  schoolMembershipId: string,
  cycleId: string,
  assignedByPersonId: string
) {
  const sql = yield* SqlClient
  const repo = yield* schoolMembershipCycleRepo
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  yield* sql.withTransaction(
    repo.insertVoid({
      school_id: validSchoolId,
      school_membership_id: schoolMembershipId,
      cycle_id: cycleId,
      assigned_by: assignedByPersonId,
      unassigned_at: null
    })
  ).pipe(Effect.catchReason("SqlError", "UniqueViolation", () => Effect.void))
})

/**
 * Closes the active assignment row rather than deleting it (ticket #94:
 * "assignment history preserved") — the same "close, don't delete" idiom
 * `Enrollment.ts`'s `closeEnrollment` already uses for a different entity. A
 * membership with no remaining active row for any cycle reverts to
 * whole-school scope, exactly as if it had never been cycle-assigned.
 */
export const unassignMembershipFromCycle = Effect.fn("SchoolMembership.unassignMembershipFromCycle")(function*(
  schoolMembershipId: string,
  cycleId: string
) {
  const sql = yield* SqlClient
  yield* sql`
    UPDATE school_membership_cycles
    SET unassigned_at = now()
    WHERE school_membership_id = ${schoolMembershipId}
      AND cycle_id = ${cycleId}
      AND unassigned_at IS NULL
  `
})

/**
 * The `cycle_ids` a `SchoolMembership` is actively scoped to — an empty
 * array means whole-school scope. This is the read path the auth-subject
 * minting flow (not yet built, same "policy exists ahead of its own login
 * flow" precedent as `financialGuardianViewingOwnData`) must call to
 * populate the `cycle_ids` attribute `canTakeRollCall` and friends check.
 */
export const findActiveCycleIds = Effect.fn("SchoolMembership.findActiveCycleIds")(function*(
  schoolMembershipId: string
) {
  const sql = yield* SqlClient
  return yield* SqlSchema.findAll({
    Request: Schema.Struct({ schoolMembershipId: Schema.String }),
    Result: Schema.Struct({ cycle_id: Schema.String }),
    execute: (req) =>
      sql`
        SELECT cycle_id FROM school_membership_cycles
        WHERE school_membership_id = ${req.schoolMembershipId} AND unassigned_at IS NULL
      `
  })({ schoolMembershipId }).pipe(Effect.map((rows) => rows.map((row) => row.cycle_id)))
})
