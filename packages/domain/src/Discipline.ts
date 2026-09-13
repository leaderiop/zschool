import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { NotificationSender } from "./AttendanceNotification.ts"
import { writeAuditLog, withDisciplinaryAccessLog } from "./AuditLog.ts"
import {
  canApproveSuspension,
  canManageDiscipline,
  canReportIncident
} from "./authorization/Policies.ts"
import {
  DisciplineSeverityLevelId,
  IncidentId,
  SanctionId,
  SanctionTypeId,
  SchoolId,
  SuspensionProposalId
} from "./Ids.ts"
import { authorizeWith, EntityNotFoundError, requireOwnedRow } from "./Ownership.ts"

export { EntityNotFoundError }

export class SanctionTypeNotTemporaryExpulsionError
  extends Schema.TaggedError<SanctionTypeNotTemporaryExpulsionError>()("SanctionTypeNotTemporaryExpulsionError", {
    sanctionTypeId: Schema.String
  })
{}

export class SuspensionProposalNotPendingError
  extends Schema.TaggedError<SuspensionProposalNotPendingError>()("SuspensionProposalNotPendingError", {
    proposalId: Schema.String
  })
{}

/** School-configurable catalog (migration 0029, ticket #103) — same shape as `DunningTier`/`Slot`: a plain, ordered, per-school list. */
export class DisciplineSeverityLevel extends Model.Class<DisciplineSeverityLevel>("DisciplineSeverityLevel")({
  id: Model.Field({
    select: DisciplineSeverityLevelId,
    update: DisciplineSeverityLevelId,
    json: DisciplineSeverityLevelId,
    jsonUpdate: DisciplineSeverityLevelId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  label: Schema.String,
  ordinal: Schema.Int
}) {}

const disciplineSeverityLevelRepo = SqlModel.makeRepository(DisciplineSeverityLevel, {
  tableName: "discipline_severity_levels",
  spanPrefix: "Discipline",
  idColumn: "id"
})

export const createDisciplineSeverityLevel = Effect.fn("Discipline.createDisciplineSeverityLevel")(function*(
  rawSchoolId: string,
  label: string,
  ordinal: number
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageDiscipline,
    "manage-discipline",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const repo = yield* disciplineSeverityLevelRepo
        return yield* repo.insert({ school_id: schoolId, label, ordinal })
      })
    )
  )
})

export const findDisciplineSeverityLevels = Effect.fn("Discipline.findDisciplineSeverityLevels")(function*(
  rawSchoolId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      return yield* SqlSchema.findAll({
        Request: Schema.Struct({ schoolId: Schema.String }),
        Result: DisciplineSeverityLevel,
        execute: (req) => sql`SELECT * FROM discipline_severity_levels WHERE school_id = ${req.schoolId} ORDER BY ordinal ASC`
      })({ schoolId })
    })
  )
})

/**
 * `Model.Class` for `incidents` (migration 0029). `witnesses` is a `jsonb`
 * array — read as an already-parsed JS array (`Schema.Array(Schema.String)`,
 * not `Schema.fromJsonString`), written via a hand-built `INSERT` rather
 * than `SqlModel.makeRepository`'s generated one, same "jsonb column, raw
 * insert with an explicit `::jsonb` cast" idiom `ImportBatch.ts`'s
 * `ImportBatchRow.payload`/`insertBatchRow` already establishes.
 *
 * ADR-ZS-019: non-portable by construction — see this migration's own
 * comment on why no extra mechanism beyond `school_id` RLS scoping exists
 * here yet.
 */
export class Incident extends Model.Class<Incident>("Incident")({
  id: Model.Field({ select: IncidentId, update: IncidentId, json: IncidentId, jsonUpdate: IncidentId }),
  school_id: SchoolId,
  student_enrollment_id: Schema.String,
  date: Schema.String,
  context: Schema.String,
  severity_level_id: Schema.String,
  description: Schema.String,
  witnesses: Schema.Array(Schema.String),
  author_person_id: Schema.String,
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/** ADR-ZS-105's own "repeat-offense" threshold: 2 or more incidents for the same student within a rolling 90-day window — no explicit "period" is defined anywhere else in this spec, so a rolling window is used rather than an arbitrary calendar boundary (a student's 2nd incident on day 89 and day 91 of the same "month" would otherwise be treated inconsistently). */
const REPEAT_OFFENSE_THRESHOLD = 2
const REPEAT_OFFENSE_WINDOW_DAYS = 90

/**
 * Gated by `canReportIncident` — a teacher, student-life member, or director
 * at the school; see that policy's own doc comment for why "in their own
 * class" isn't enforced here. Ticket #105 folds in: the `discipline_stats_by_class_period`
 * rollup (kept in sync transactionally, never recomputed by a slow scan),
 * an `audit_log` row, and a proactive notification to student-life staff
 * when this student crosses the repeat-offense threshold — sent directly
 * via `NotificationSender` (no outbox/retention-window: that machinery
 * exists for `AttendanceNotification.ts`'s guardian-facing absence flow,
 * not an internal staff alert).
 */
export const reportIncident = Effect.fn("Discipline.reportIncident")(function*(
  rawSchoolId: string,
  studentEnrollmentId: string,
  date: string,
  context: string,
  severityLevelId: string,
  description: string,
  witnesses: ReadonlyArray<string>,
  authorPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canReportIncident,
    "report-incident",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient

        const enrollment = yield* requireOwnedRow(
          sql,
          "enrollments",
          "enrollment",
          studentEnrollmentId,
          schoolId,
          Schema.Struct({ class_id: Schema.String }),
          "class_id"
        )

        const incident = yield* sql.withTransaction(Effect.gen(function*() {
          const [row] = yield* sql`
            INSERT INTO incidents (school_id, student_enrollment_id, date, context, severity_level_id, description, witnesses, author_person_id)
            VALUES (
              ${schoolId}, ${studentEnrollmentId}, ${date}::date, ${context}, ${severityLevelId}, ${description},
              ${JSON.stringify(witnesses)}::jsonb, ${authorPersonId}
            )
            RETURNING *
          `
          const created = yield* Schema.decodeUnknownEffect(Incident)(row)

          yield* sql`
            INSERT INTO discipline_stats_by_class_period (school_id, class_id, period_label, incident_count)
            VALUES (${schoolId}, ${enrollment.class_id}, to_char(${date}::date, 'YYYY-MM'), 1)
            ON CONFLICT (school_id, class_id, period_label)
              DO UPDATE SET incident_count = discipline_stats_by_class_period.incident_count + 1, updated_at = now()
          `

          yield* writeAuditLog(schoolId, authorPersonId, "report_incident", "incident", created.id, null, created)

          return created
        }))

        const [{ count }] = yield* sql<{ count: string }>`
          SELECT count(*)::int AS count FROM incidents
          WHERE student_enrollment_id = ${studentEnrollmentId} AND date >= (${date}::date - (${REPEAT_OFFENSE_WINDOW_DAYS} || ' days')::interval)
        `
        if (Number(count) >= REPEAT_OFFENSE_THRESHOLD) {
          const studentLifeStaff = yield* sql<{ person_id: string }>`
            SELECT person_id FROM school_memberships WHERE school_id = ${schoolId} AND role = 'student_life' AND status = 'active'
          `
          const sender = yield* NotificationSender
          yield* Effect.forEach(
            studentLifeStaff,
            (staff) =>
              sender.send("in_app", staff.person_id, {
                type: "repeat_offense",
                studentEnrollmentId,
                incidentCount: Number(count)
              }),
            { discard: true }
          )
        }

        return incident
      })
    )
  )
})

/** Ticket #105's own demonstrated `withDisciplinaryAccessLog` usage — see that combinator's doc comment for why the other disciplinary reads in this module haven't all been retrofitted in the same pass. */
export const findIncidentsForStudentAudited = Effect.fn("Discipline.findIncidentsForStudentAudited")(function*(
  rawSchoolId: string,
  studentEnrollmentId: string,
  actorPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withDisciplinaryAccessLog(
    schoolId,
    actorPersonId,
    "incident",
    studentEnrollmentId,
    findIncidentsForStudent(schoolId, studentEnrollmentId)
  )
})

export const findIncidentsForStudent = Effect.fn("Discipline.findIncidentsForStudent")(function*(
  rawSchoolId: string,
  studentEnrollmentId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageDiscipline,
    "manage-discipline",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows = yield* sql`
          SELECT * FROM incidents WHERE student_enrollment_id = ${studentEnrollmentId} ORDER BY date DESC
        `
        return yield* Schema.decodeUnknownEffect(Schema.Array(Incident))(rows)
      })
    )
  )
})

/** The precomputed rollup `reportIncident` keeps in sync — queryable without a slow aggregate scan (ticket #105's own acceptance criterion). */
export const findDisciplineStats = Effect.fn("Discipline.findDisciplineStats")(function*(rawSchoolId: string) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageDiscipline,
    "manage-discipline",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        return yield* sql<{ class_id: string; period_label: string; incident_count: number }>`
          SELECT class_id, period_label, incident_count FROM discipline_stats_by_class_period
          WHERE school_id = ${schoolId}
          ORDER BY period_label DESC, class_id ASC
        `
      })
    )
  )
})

/** School-configurable catalog — `is_temporary_expulsion` distinguishes the one `SanctionType` variant that actually excludes a student from attendance (`executeTemporaryExpulsion` below refuses any other). */
export class SanctionType extends Model.Class<SanctionType>("SanctionType")({
  id: Model.Field({ select: SanctionTypeId, update: SanctionTypeId, json: SanctionTypeId, jsonUpdate: SanctionTypeId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  label: Schema.String,
  is_temporary_expulsion: Schema.Boolean
}) {}

const sanctionTypeRepo = SqlModel.makeRepository(SanctionType, {
  tableName: "sanction_types",
  spanPrefix: "Discipline",
  idColumn: "id"
})

export const createSanctionType = Effect.fn("Discipline.createSanctionType")(function*(
  rawSchoolId: string,
  label: string,
  isTemporaryExpulsion: boolean
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageDiscipline,
    "manage-discipline",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const repo = yield* sanctionTypeRepo
        return yield* repo.insert({ school_id: schoolId, label, is_temporary_expulsion: isTemporaryExpulsion })
      })
    )
  )
})

/** `Model.Class` for `sanctions` (migration 0029) — `execution_status` starts `in_progress`; `executeTemporaryExpulsion` is the only path that moves a temporary-expulsion `Sanction` to `carried_out`. */
export class Sanction extends Model.Class<Sanction>("Sanction")({
  id: Model.Field({ select: SanctionId, update: SanctionId, json: SanctionId, jsonUpdate: SanctionId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  incident_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  sanction_type_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  duration_days: Schema.NullOr(Schema.Int).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  decision: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  execution_status: Schema.Literals(["in_progress", "carried_out", "lifted"]),
  decided_by_person_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  decided_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

const sanctionRepo = SqlModel.makeRepository(Sanction, { tableName: "sanctions", spanPrefix: "Discipline", idColumn: "id" })

/** Student-life/director deciding a sanction for an already-reported incident — a teacher may report (`reportIncident`/`canReportIncident`) but never decide one. */
export const decideSanction = Effect.fn("Discipline.decideSanction")(function*(
  rawSchoolId: string,
  incidentId: string,
  sanctionTypeId: string,
  durationDays: number | null,
  decision: string,
  decidedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageDiscipline,
    "manage-discipline",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "incidents", "incident", incidentId, schoolId, Schema.Struct({ id: Schema.String }))
        const repo = yield* sanctionRepo
        const sanction = yield* repo.insert({
          school_id: schoolId,
          incident_id: incidentId,
          sanction_type_id: sanctionTypeId,
          duration_days: durationDays,
          decision,
          execution_status: "in_progress",
          decided_by_person_id: decidedByPersonId
        })
        yield* writeAuditLog(schoolId, decidedByPersonId, "decide_sanction", "sanction", sanction.id, null, sanction)
        return sanction
      })
    )
  )
})

/**
 * Ticket #103's own trigger for ticket #96's stub: creates the
 * `temporary_exclusions` window, immediately upserts `exclusion`-status
 * `attendance_records` for every key this student already has within the
 * range (a session already rolled or bulk-declared before the sanction was
 * decided), and marks the `Sanction` `carried_out`. A key created LATER,
 * inside an already-active window, is handled by `RollCall.ts`'s
 * `writeRollCall` consulting `isStudentTemporarilyExcluded` at confirm time
 * — this function only needs to backfill what already exists right now.
 */
export const executeTemporaryExpulsion = Effect.fn("Discipline.executeTemporaryExpulsion")(function*(
  rawSchoolId: string,
  sanctionId: string,
  studentEnrollmentId: string,
  startDate: string,
  endDate: string,
  executedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageDiscipline,
    "manage-discipline",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const sanction = yield* requireOwnedRow(
          sql,
          "sanctions",
          "sanction",
          sanctionId,
          schoolId,
          Schema.Struct({ sanction_type_id: Schema.String }),
          "sanction_type_id"
        )
        const sanctionType = yield* requireOwnedRow(
          sql,
          "sanction_types",
          "sanction_type",
          sanction.sanction_type_id,
          schoolId,
          Schema.Struct({ is_temporary_expulsion: Schema.Boolean }),
          "is_temporary_expulsion"
        )
        if (!sanctionType.is_temporary_expulsion) {
          return yield* Effect.fail(
            new SanctionTypeNotTemporaryExpulsionError({ sanctionTypeId: sanction.sanction_type_id })
          )
        }

        yield* sql.withTransaction(Effect.gen(function*() {
          yield* sql`
            INSERT INTO temporary_exclusions (school_id, sanction_id, student_enrollment_id, start_date, end_date)
            VALUES (${schoolId}, ${sanctionId}, ${studentEnrollmentId}, ${startDate}::date, ${endDate}::date)
          `

          yield* sql`
            INSERT INTO attendance_records (key, student_enrollment_id, school_id, status)
            SELECT DISTINCT key, student_enrollment_id, ${schoolId}::uuid, 'exclusion'
            FROM attendance_records
            WHERE student_enrollment_id = ${studentEnrollmentId}
            ON CONFLICT (key, student_enrollment_id) DO UPDATE SET status = 'exclusion', updated_at = now()
          `

          yield* sql`UPDATE sanctions SET execution_status = 'carried_out' WHERE id = ${sanctionId}`

          yield* writeAuditLog(
            schoolId,
            executedByPersonId,
            "execute_temporary_expulsion",
            "sanction",
            sanctionId,
            null,
            { studentEnrollmentId, startDate, endDate }
          )
        }))
      })
    )
  )
})

/** Consulted by `RollCall.ts#writeRollCall` before writing any confirmation — a student inside an active temporary-exclusion window always gets `exclusion`, never the submitted status, and never a notification. */
export const isStudentTemporarilyExcluded = Effect.fn("Discipline.isStudentTemporarilyExcluded")(function*(
  studentEnrollmentId: string,
  date: string
) {
  const sql = yield* SqlClient
  const rows = yield* sql<{ id: string }>`
    SELECT id FROM temporary_exclusions
    WHERE student_enrollment_id = ${studentEnrollmentId} AND start_date <= ${date}::date AND end_date >= ${date}::date
    LIMIT 1
  `
  return rows.length > 0
})

/**
 * `Model.Class` for `suspension_proposals` (migration 0029, ADR-ZS-057):
 * "notifies the director" (ticket #103's own wording) is satisfied by this
 * row becoming queryable via `findPendingSuspensionProposals` — no separate
 * push/email exists for it (that would mean coupling the discipline module
 * to Attendance's own notification outbox, which is keyed to roll-call
 * events, not an arbitrary staff action), same "a UI reads a queryable
 * record" treatment `Dunning.ts`'s configured tiers already get.
 */
export class SuspensionProposal extends Model.Class<SuspensionProposal>("SuspensionProposal")({
  id: Model.Field({
    select: SuspensionProposalId,
    update: SuspensionProposalId,
    json: SuspensionProposalId,
    jsonUpdate: SuspensionProposalId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  student_enrollment_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  sanction_id: Schema.NullOr(Schema.String).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  reason: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  status: Schema.Literals(["pending", "approved", "dismissed"]),
  proposed_by_person_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  decided_by_person_id: Schema.NullOr(Schema.String),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  decided_at: Schema.NullOr(Schema.DateTimeUtcFromMillis)
}) {}

const suspensionProposalRepo = SqlModel.makeRepository(SuspensionProposal, {
  tableName: "suspension_proposals",
  spanPrefix: "Discipline",
  idColumn: "id"
})

/** Ticket #103's own acceptance criterion: "a Sanction can propose suspension without ever setting Enrollment.status to suspended directly" — this function never touches `enrollments`. */
export const proposeSuspension = Effect.fn("Discipline.proposeSuspension")(function*(
  rawSchoolId: string,
  studentEnrollmentId: string,
  sanctionId: string | null,
  reason: string,
  proposedByPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canManageDiscipline,
    "manage-discipline",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const repo = yield* suspensionProposalRepo
        return yield* repo.insert({
          school_id: schoolId,
          student_enrollment_id: studentEnrollmentId,
          sanction_id: sanctionId,
          reason,
          status: "pending",
          proposed_by_person_id: proposedByPersonId,
          decided_by_person_id: null,
          decided_at: null
        })
      })
    )
  )
})

export const findPendingSuspensionProposals = Effect.fn("Discipline.findPendingSuspensionProposals")(function*(
  rawSchoolId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canApproveSuspension,
    "approve-suspension",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        return yield* SqlSchema.findAll({
          Request: Schema.Struct({ schoolId: Schema.String }),
          Result: SuspensionProposal,
          execute: (req) =>
            sql`SELECT * FROM suspension_proposals WHERE school_id = ${req.schoolId} AND status = 'pending' ORDER BY created_at ASC`
        })({ schoolId })
      })
    )
  )
})

const decideSuspensionProposal = Effect.fn("Discipline.decideSuspensionProposal")(function*(
  schoolId: SchoolId,
  proposalId: string,
  decidedByPersonId: string,
  outcome: "approved" | "dismissed"
) {
  const sql = yield* SqlClient
  const proposal = yield* requireOwnedRow(
    sql,
    "suspension_proposals",
    "suspension_proposal",
    proposalId,
    schoolId,
    Schema.Struct({ status: Schema.String, student_enrollment_id: Schema.String }),
    "status, student_enrollment_id"
  )
  if (proposal.status !== "pending") {
    return yield* Effect.fail(new SuspensionProposalNotPendingError({ proposalId }))
  }

  yield* sql.withTransaction(Effect.gen(function*() {
    yield* sql`
      UPDATE suspension_proposals
      SET status = ${outcome}, decided_by_person_id = ${decidedByPersonId}, decided_at = now()
      WHERE id = ${proposalId}
    `
    if (outcome === "approved") {
      yield* sql`UPDATE enrollments SET status = 'suspended' WHERE id = ${proposal.student_enrollment_id}`
    }
    yield* writeAuditLog(schoolId, decidedByPersonId, `decide_suspension_${outcome}`, "suspension_proposal", proposalId, null, { outcome })
  }))
})

/** ADR-ZS-057: the ONLY path that ever sets `Enrollment.status` to `'suspended'` — director-only (`canApproveSuspension`), always starting from a pending proposal, never automatic. */
export const approveSuspension = Effect.fn("Discipline.approveSuspension")(function*(
  rawSchoolId: string,
  proposalId: string,
  directorPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canApproveSuspension,
    "approve-suspension",
    schoolId,
    withSchool(schoolId, decideSuspensionProposal(schoolId, proposalId, directorPersonId, "approved"))
  )
})

export const dismissSuspensionProposal = Effect.fn("Discipline.dismissSuspensionProposal")(function*(
  rawSchoolId: string,
  proposalId: string,
  directorPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canApproveSuspension,
    "approve-suspension",
    schoolId,
    withSchool(schoolId, decideSuspensionProposal(schoolId, proposalId, directorPersonId, "dismissed"))
  )
})

