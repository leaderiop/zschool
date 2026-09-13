import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { AuditLogId, SchoolId } from "./Ids.ts"
import { canManageDiscipline } from "./authorization/Policies.ts"
import { authorizeWith } from "./Ownership.ts"

/**
 * `Model.Class` for `audit_log` (migration 0031, ticket #105) — one shared
 * shape across every entity type this covers (roll call, justification,
 * incident, sanction, council decision, conduct grade, disciplinary-record
 * access), the same "one generic table, `entity_type` picks the concrete
 * meaning" idiom `AcademicTree.ts`'s `structure_audit_log` already uses.
 */
export class AuditLogEntry extends Model.Class<AuditLogEntry>("AuditLogEntry")({
  id: Model.Field({ select: AuditLogId, update: AuditLogId, json: AuditLogId, jsonUpdate: AuditLogId }),
  school_id: SchoolId,
  actor_person_id: Schema.String,
  action: Schema.String,
  entity_type: Schema.String,
  entity_id: Schema.String,
  before_value: Schema.NullOr(Schema.Unknown),
  after_value: Schema.NullOr(Schema.Unknown),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/**
 * The one writer every other module calls — a hand-built `INSERT`, not
 * `SqlModel.makeRepository`, for the same "`jsonb` columns, raw insert with
 * an explicit `::jsonb` cast" reason `ImportBatch.ts`'s `insertBatchRow`
 * documents (`before_value`/`after_value` are nullable `jsonb`, unlike that
 * table's always-present `payload`).
 */
export const writeAuditLog = Effect.fn("AuditLog.writeAuditLog")(function*(
  schoolId: string,
  actorPersonId: string,
  action: string,
  entityType: string,
  entityId: string,
  beforeValue: unknown,
  afterValue: unknown
) {
  const sql = yield* SqlClient
  yield* sql`
    INSERT INTO audit_log (school_id, actor_person_id, action, entity_type, entity_id, before_value, after_value)
    VALUES (
      ${schoolId}, ${actorPersonId}, ${action}, ${entityType}, ${entityId},
      ${beforeValue === null || beforeValue === undefined ? null : JSON.stringify(beforeValue)}::jsonb,
      ${afterValue === null || afterValue === undefined ? null : JSON.stringify(afterValue)}::jsonb
    )
  `
})

/**
 * Ticket #105's own "every read of Incident/Sanction/Council data produces
 * an `audit_log` row via [this] shared wrapper" — logs an `'access'` action
 * only once `effect` succeeds (a denied/failed read isn't a data access).
 * Demonstrated on `Discipline.ts#findIncidentsForStudentAudited`; other
 * disciplinary reads (`findPendingSuspensionProposals`,
 * `findPendingJustifications`, a future council-minutes read) should adopt
 * the same wrapper as they're next touched, rather than this ticket
 * retrofitting every one of them at once.
 */
export const withDisciplinaryAccessLog = <A, E, R>(
  schoolId: string,
  actorPersonId: string,
  entityType: string,
  entityId: string,
  effect: Effect.Effect<A, E, R>
) => Effect.tap(effect, () => writeAuditLog(schoolId, actorPersonId, "access", entityType, entityId, null, null))

const csvEscape = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value

/** Ticket #105's own "dual export: CSV/Excel and structured JSON for the audit log specifically." A `text/csv` string, RFC-4180-quoted — opens directly in Excel, satisfying both halves of that requirement with one format. */
export const exportAuditLogCsv = Effect.fn("AuditLog.exportAuditLogCsv")(function*(rawSchoolId: string) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const entries = yield* findAuditLog(schoolId)
  const header = "id,actor_person_id,action,entity_type,entity_id,created_at"
  const rows = entries.map((e) =>
    [e.id, e.actor_person_id, e.action, e.entity_type, e.entity_id, e.created_at.toString()]
      .map(csvEscape)
      .join(",")
  )
  return [header, ...rows].join("\n")
})

export const exportAuditLogJson = Effect.fn("AuditLog.exportAuditLogJson")(function*(rawSchoolId: string) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* findAuditLog(schoolId)
})

const findAuditLog = Effect.fn("AuditLog.findAuditLog")(function*(schoolId: SchoolId) {
  return yield* authorizeWith(
    canManageDiscipline,
    "manage-discipline",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        return yield* SqlSchema.findAll({
          Request: Schema.Struct({ schoolId: Schema.String }),
          Result: AuditLogEntry,
          execute: (req) =>
            sql`SELECT * FROM audit_log WHERE school_id = ${req.schoolId} ORDER BY created_at ASC`
        })({ schoolId })
      })
    )
  )
})
