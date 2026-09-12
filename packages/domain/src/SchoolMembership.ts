import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import { SchoolId, TeacherPersonId } from "./Ids.ts"

/**
 * `Model.Class` for `school_memberships` (migration 0011, ticket #14 /
 * ADR-ZS-016). `role` and `status` intentionally only cover this ticket's
 * own slice ("a teacher, invited") — the full affiliation entity (other
 * roles, contract types, dates, permissions) is `spec/domain-model.md`'s own
 * future scope, not reintroduced here ahead of a ticket that needs it.
 */
export class SchoolMembership extends Model.Class<SchoolMembership>("SchoolMembership")({
  id: Model.Field({ select: Schema.String, update: Schema.String, json: Schema.String, jsonUpdate: Schema.String }),
  school_id: SchoolId,
  person_id: TeacherPersonId,
  role: Schema.Literals(["teacher"]),
  status: Schema.Literals(["invited", "active", "suspended", "ended"]),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

const schoolMembershipRepo = SqlModel.makeRepository(SchoolMembership, {
  tableName: "school_memberships",
  spanPrefix: "SchoolMembership",
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
