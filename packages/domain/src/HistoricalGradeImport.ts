import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Match from "effect/Match"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { findClassByLevelAndLabel, insertClassRow } from "./AcademicTree.ts"
import { enrollmentRepo } from "./Enrollment.ts"
import {
  findEvaluationPeriodByCode,
  findOrCreateImportedAssessment,
  findSubjectByCode,
  normalizeToTwenty,
  upsertMark
} from "./GradeImport.ts"
import { attachStudentProfile, createPerson, findPersonMatches } from "./Identity.ts"
import { AcademicYearId, SchoolId, StudentPersonId } from "./Ids.ts"
import { failureReason, ImportRowError, ImportRowErrorPublicSchema } from "./ImportRowError.ts"
import { authorized } from "./Ownership.ts"

/**
 * Ticket #15's deliberate follow-up: historical (prior-year archive) grade
 * import (ADR-ZS-112/113). "Historical" means this school's own pre-ZSchool
 * archive, never an externally-schooled transfer student's grades
 * (BEH-ZS-046 forbids that through this channel).
 *
 * Unlike current-term import (`GradeImport.ts`), nothing a historical row
 * references already exists: the archival `AcademicYear` (born closed,
 * ADR-ZS-112), its minimal Section/Cycle/Level/Class structure, its
 * Subject/EvaluationPeriod catalog, and each student's `Enrollment` are all
 * created on demand by this file. Every find-or-create helper below follows
 * the same "try insert, catch the unique violation, re-select" idempotency
 * shape already established by `GradeImport.ts`'s own
 * `findOrCreateImportedAssessment` and `Identity.ts`'s
 * `attachStudentProfile`/`attachGuardianProfile`.
 */

export class ArchivalYearConflictError
  extends Schema.TaggedError<ArchivalYearConflictError>()("ArchivalYearConflictError", {
    label: Schema.String
  })
{}

/**
 * ADR-ZS-112: creates a new, dedicated archival year the first time a given
 * label is imported for this school, or reuses the same one on a retry —
 * `is_archival` (migration 0013) is what makes that distinction safe: a
 * label that already exists but wasn't created by this same path (a real,
 * platform-operated year happening to share the label) is refused outright
 * rather than silently written into, per ADR-ZS-112's core safety concern.
 */
export const getOrCreateArchivalYear = Effect.fn("HistoricalGradeImport.getOrCreateArchivalYear")(function*(
  schoolId: string,
  label: string
) {
  const sql = yield* SqlClient
  const [existing] = yield* sql<{ id: string; is_archival: boolean }>`
    SELECT id, is_archival FROM academic_years WHERE school_id = ${schoolId} AND label = ${label}
  `
  if (existing !== undefined) {
    if (!existing.is_archival) {
      return yield* Effect.fail(new ArchivalYearConflictError({ label }))
    }
    return existing.id
  }

  const [created] = yield* sql<{ id: string }>`
    INSERT INTO academic_years (school_id, label, status, is_archival)
    VALUES (${schoolId}, ${label}, 'closed', true) RETURNING id
  `
  return created.id
})

/** One archival `Section` per archival year — a fixed container, never surfaced to a director the way a real section is. */
export const getOrCreateArchivalSection = Effect.fn("HistoricalGradeImport.getOrCreateArchivalSection")(function*(
  schoolId: string,
  academicYearId: string
) {
  const sql = yield* SqlClient
  const [existing] = yield* sql<{ id: string }>`
    SELECT id FROM sections WHERE school_id = ${schoolId} AND academic_year_id = ${academicYearId} LIMIT 1
  `
  if (existing !== undefined) return existing.id

  const [created] = yield* sql<{ id: string }>`
    INSERT INTO sections (school_id, academic_year_id, template, name)
    VALUES (${schoolId}, ${academicYearId}, 'national', 'Archive') RETURNING id
  `
  return created.id
})

const ARCHIVAL_CYCLE_CODE = "ARCHIVE"

/** One fixed pseudo-`Cycle` per archival year — historical rows declare a level, never a cycle, so every archival level hangs off this one shared placeholder. */
export const getOrCreateArchivalCycle = Effect.fn("HistoricalGradeImport.getOrCreateArchivalCycle")(function*(
  schoolId: string,
  academicYearId: string,
  sectionId: string
) {
  const sql = yield* SqlClient
  // A caught unique violation still leaves the *transaction* aborted in
  // Postgres — `sql.withTransaction` opens a SAVEPOINT here so the fallback
  // SELECT below (and whatever the caller does next) isn't run against an
  // already-aborted transaction (same reasoning as `Identity.ts`'s
  // `attachStudentProfile`).
  const created = yield* Effect.result(sql.withTransaction(sql<{ id: string }>`
    INSERT INTO cycles (school_id, academic_year_id, section_id, code, name, sort_order)
    VALUES (${schoolId}, ${academicYearId}, ${sectionId}, ${ARCHIVAL_CYCLE_CODE}, 'Archive', 0) RETURNING id
  `))
  if (Result.isSuccess(created)) return created.success[0].id

  const [existing] = yield* sql<{ id: string }>`
    SELECT id FROM cycles WHERE section_id = ${sectionId} AND code = ${ARCHIVAL_CYCLE_CODE}
  `
  return existing.id
})

/** Find-or-create by `(cycle_id, code)` — the row's own `levelCode` names the archival level, created with `code` doubling as `name` (no separate name field on a historical row). */
export const findOrCreateArchivalLevel = Effect.fn("HistoricalGradeImport.findOrCreateArchivalLevel")(function*(
  schoolId: string,
  academicYearId: string,
  cycleId: string,
  code: string
) {
  const sql = yield* SqlClient
  const created = yield* Effect.result(sql.withTransaction(sql<{ id: string }>`
    INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
    VALUES (${schoolId}, ${academicYearId}, ${cycleId}, ${code}, ${code}, 0) RETURNING id
  `))
  if (Result.isSuccess(created)) return created.success[0].id

  const [existing] = yield* sql<{ id: string }>`SELECT id FROM levels WHERE cycle_id = ${cycleId} AND code = ${code}`
  return existing.id
})

/** Find-or-create by `(section_id, code)`, same reasoning as `findOrCreateArchivalLevel` above. */
export const findOrCreateArchivalSubject = Effect.fn("HistoricalGradeImport.findOrCreateArchivalSubject")(function*(
  schoolId: string,
  academicYearId: string,
  sectionId: string,
  code: string
) {
  const sql = yield* SqlClient
  const created = yield* Effect.result(sql.withTransaction(sql<{ id: string }>`
    INSERT INTO subjects (school_id, academic_year_id, section_id, code, name)
    VALUES (${schoolId}, ${academicYearId}, ${sectionId}, ${code}, ${code}) RETURNING id
  `))
  if (Result.isSuccess(created)) return created.success[0].id

  const subject = yield* findSubjectByCode(schoolId, academicYearId, code)
  return Option.getOrThrow(subject).id
})

/** Same reasoning, `evaluation_periods` — created directly `'closed'` (ADR-ZS-112: the archival year is already finished by construction, no live period-closing lifecycle to progress through). */
export const findOrCreateArchivalEvaluationPeriod = Effect.fn(
  "HistoricalGradeImport.findOrCreateArchivalEvaluationPeriod"
)(function*(
  schoolId: string,
  academicYearId: string,
  sectionId: string,
  code: string
) {
  const sql = yield* SqlClient
  const created = yield* Effect.result(sql.withTransaction(sql<{ id: string }>`
    INSERT INTO evaluation_periods (school_id, academic_year_id, section_id, code, name, sequence, status)
    VALUES (${schoolId}, ${academicYearId}, ${sectionId}, ${code}, ${code}, 0, 'closed') RETURNING id
  `))
  if (Result.isSuccess(created)) return created.success[0].id

  const period = yield* findEvaluationPeriodByCode(schoolId, academicYearId, code)
  return Option.getOrThrow(period).id
})

/** Find-or-create by `(level_id, label)`, reusing `AcademicTree.ts`'s own `insertClassRow`/`findClassByLevelAndLabel` rather than a third, independent class-creation path. A fixed generous capacity: an archival class never grows beyond the historical roster it's created for. */
export const findOrCreateArchivalClass = Effect.fn("HistoricalGradeImport.findOrCreateArchivalClass")(function*(
  schoolId: string,
  academicYearId: string,
  levelId: string,
  label: string
) {
  const sql = yield* SqlClient
  const created = yield* Effect.result(sql.withTransaction(
    insertClassRow({
      schoolId: SchoolId.make(schoolId),
      academicYearId,
      levelId,
      label,
      capacity: 9999
    })
  ))
  if (Result.isSuccess(created)) return created.success

  const cls = yield* findClassByLevelAndLabel(schoolId, levelId, label)
  return Option.getOrThrow(cls).id
})

/**
 * ADR-ZS-113: the `'completed'` enrollment synthesized once per (student,
 * archival year) — shared by every historical grade row for that student in
 * that year, never one per row. No DB-level uniqueness enforces this (unlike
 * `Mark`'s own unique index) — find-first-then-create, matching
 * `StudentGuardianImport.ts`'s own in-memory guardian-dedup reasoning: this
 * is safe under the ordinary single-request, sequential-commit-loop usage
 * every import pipeline in this codebase already assumes.
 */
export const findOrCreateCompletedEnrollment = Effect.fn(
  "HistoricalGradeImport.findOrCreateCompletedEnrollment"
)(function*(
  schoolId: string,
  academicYearId: string,
  academicYearLabel: string,
  studentPersonId: string,
  classId: string,
  effectiveDate: string
) {
  const sql = yield* SqlClient
  const [existing] = yield* sql<{ id: string }>`
    SELECT id FROM enrollments
    WHERE school_id = ${schoolId} AND academic_year_id = ${academicYearId}
      AND student_person_id = ${studentPersonId} AND status = 'completed'
  `
  if (existing !== undefined) return existing.id

  const repo = yield* enrollmentRepo
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  const validAcademicYearId = yield* Schema.decodeEffect(AcademicYearId)(academicYearId)
  const validStudentPersonId = yield* Schema.decodeEffect(StudentPersonId)(studentPersonId)
  const enrollment = yield* repo.insert({
    school_id: validSchoolId,
    academic_year_id: validAcademicYearId,
    academic_year_label: academicYearLabel,
    student_person_id: validStudentPersonId,
    class_id: classId,
    status: "completed",
    effective_date: effectiveDate,
    capacity_override_reason: null
  })
  return enrollment.id
})

export interface HistoricalGradeImportRow {
  readonly rowId: string
  readonly firstName: string
  readonly lastName: string
  readonly dateOfBirth: string
  readonly massarCode?: string
  /** A prior analyze pass's proposed Massar-code match, explicitly confirmed by the caller — never inferred (same rule as `StudentImportRow`). */
  readonly confirmedMatchPersonId?: string
  readonly levelCode: string
  readonly classLabel: string
  readonly subjectCode: string
  readonly periodCode: string
  readonly value: number
  readonly scale?: number
  readonly remark?: string
  /** The synthesized `Enrollment`'s effective date (ADR-ZS-113) — this school's own record of when the student was in this archival class, not inferred from the year label. */
  readonly effectiveDate: string
}

export const HistoricalGradeImportRowSchema = Schema.Struct({
  rowId: Schema.NonEmptyString,
  firstName: Schema.NonEmptyString,
  lastName: Schema.NonEmptyString,
  dateOfBirth: Schema.NonEmptyString,
  massarCode: Schema.optional(Schema.String),
  confirmedMatchPersonId: Schema.optional(Schema.String),
  levelCode: Schema.NonEmptyString,
  classLabel: Schema.NonEmptyString,
  subjectCode: Schema.NonEmptyString,
  periodCode: Schema.NonEmptyString,
  value: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  scale: Schema.optional(Schema.Number.check(Schema.isGreaterThan(0))),
  remark: Schema.optional(Schema.String),
  effectiveDate: Schema.NonEmptyString
})

export const decodeHistoricalGradeImportRow = (
  row: HistoricalGradeImportRow
): Result.Result<HistoricalGradeImportRow, Schema.SchemaError> =>
  Schema.decodeResult(HistoricalGradeImportRowSchema)(row)

const historicalRowCreatable = Schema.Struct({ rowId: Schema.String, status: Schema.Literal("creatable") })
const historicalRowStrongMatchAwaitingConfirmation = Schema.Struct({
  rowId: Schema.String,
  status: Schema.Literal("strong_match_awaiting_confirmation"),
  personId: Schema.String
})
const historicalRowWeakMatchAlert = Schema.Struct({
  rowId: Schema.String,
  status: Schema.Literal("weak_match_alert"),
  personId: Schema.String
})

/** Same shape as `StudentAnalysisResultSchema` — identity resolution is the only thing worth pre-validating: the archival structure (level/class/subject/period) is always created on demand, so there is nothing else to "resolve" ahead of commit. */
export const HistoricalGradeAnalysisResultSchema = Schema.Union([
  historicalRowCreatable,
  historicalRowStrongMatchAwaitingConfirmation,
  historicalRowWeakMatchAlert,
  Schema.Struct({ rowId: Schema.String, status: Schema.Literal("error"), error: ImportRowError })
])
export type HistoricalGradeAnalysisResult = typeof HistoricalGradeAnalysisResultSchema.Type

export const HistoricalGradeAnalysisResultHttpSchema = Schema.Union([
  historicalRowCreatable,
  historicalRowStrongMatchAwaitingConfirmation,
  historicalRowWeakMatchAlert,
  Schema.Struct({ rowId: Schema.String, status: Schema.Literal("error"), error: ImportRowErrorPublicSchema })
])

export type HistoricalGradeRowResult =
  | { readonly rowId: string; readonly status: "committed"; readonly markId: string }
  | { readonly rowId: string; readonly status: "awaiting_confirmation"; readonly proposedPersonId: string }
  | { readonly rowId: string; readonly status: "error"; readonly error: ImportRowError }

/** Same "pass an already-`ImportRowError`-shaped failure through as-is" reasoning as `GradeImport.ts`'s own `mapRowOutcome`. */
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

const analyzeHistoricalRow = Effect.fn("HistoricalGradeImport.analyzeHistoricalRow")(function*(
  row: HistoricalGradeImportRow
) {
  const decoded = decodeHistoricalGradeImportRow(row)
  if (Result.isFailure(decoded)) {
    return {
      rowId: row.rowId,
      status: "error",
      error: new ImportRowError({ reason: decoded.failure.message })
    } as const
  }

  const matched = yield* Effect.result(Effect.gen(function*() {
    const matches = yield* findPersonMatches(row.massarCode, row.firstName, row.lastName, row.dateOfBirth)
    const strong = matches.find((m) => m.matchKind === "strong")
    if (strong !== undefined && row.confirmedMatchPersonId === undefined) {
      return { _tag: "strongMatch" as const, personId: strong.personId }
    }
    const weak = matches.find((m) => m.matchKind === "weak")
    return weak === undefined
      ? { _tag: "creatable" as const }
      : { _tag: "weakMatch" as const, personId: weak.personId }
  }))

  return mapRowOutcome(
    matched,
    (outcome): HistoricalGradeAnalysisResult =>
      Match.valueTags(outcome, {
        strongMatch: (m: { readonly personId: string }): HistoricalGradeAnalysisResult => ({
          rowId: row.rowId,
          status: "strong_match_awaiting_confirmation",
          personId: m.personId
        }),
        weakMatch: (m: { readonly personId: string }): HistoricalGradeAnalysisResult => ({
          rowId: row.rowId,
          status: "weak_match_alert",
          personId: m.personId
        }),
        creatable: (): HistoricalGradeAnalysisResult => ({ rowId: row.rowId, status: "creatable" })
      }),
    (error): HistoricalGradeAnalysisResult => ({ rowId: row.rowId, status: "error", error })
  )
})

export const analyzeHistoricalGradeRows = Effect.fn("HistoricalGradeImport.analyzeHistoricalGradeRows")(function*(
  rows: ReadonlyArray<HistoricalGradeImportRow>
) {
  return yield* Effect.forEach(rows, analyzeHistoricalRow)
})

/**
 * Commits an entire historical batch into ONE archival year (`yearLabel`).
 * Re-validates identity matching at commit time (ADR-ZS-106 spirit), same as
 * every other import domain. Level/class/subject/period lookups are cached
 * per this call (a `Map` keyed by code) so a batch with many rows sharing a
 * class or subject doesn't repeat the same insert-catch-reselect cycle per
 * row — mirroring `StudentGuardianImport.ts`'s own guardian-dedup Map.
 */
export const commitHistoricalGradeImportBatch = Effect.fn(
  "HistoricalGradeImport.commitHistoricalGradeImportBatch"
)(function*(
  schoolId: string,
  yearLabel: string,
  rows: ReadonlyArray<HistoricalGradeImportRow>
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const academicYearId = yield* getOrCreateArchivalYear(schoolId, yearLabel)
        const sectionId = yield* getOrCreateArchivalSection(schoolId, academicYearId)
        const cycleId = yield* getOrCreateArchivalCycle(schoolId, academicYearId, sectionId)

        const results: Array<HistoricalGradeRowResult> = []
        const validRows = rows.filter((row) => {
          const decoded = decodeHistoricalGradeImportRow(row)
          if (Result.isSuccess(decoded)) return true
          results.push({
            rowId: row.rowId,
            status: "error",
            error: new ImportRowError({ reason: decoded.failure.message })
          })
          return false
        })

        // Every shared structural entity (level, class, subject, period) is
        // resolved ONCE up front, directly in this outer transaction — not
        // inside any per-row savepoint below. A per-row savepoint that later
        // rolls back (e.g. a duplicate Mark race) must never take a
        // just-created level/class/subject/period down with it; resolving
        // them here, before any row-specific work can fail, avoids a
        // rolled-back savepoint ever invalidating an id another row already
        // cached.
        const levelIdByCode = new Map<string, string>()
        for (const code of new Set(validRows.map((r) => r.levelCode))) {
          levelIdByCode.set(code, yield* findOrCreateArchivalLevel(schoolId, academicYearId, cycleId, code))
        }
        const classIdByLevelAndLabel = new Map<string, string>()
        for (const row of validRows) {
          const levelId = levelIdByCode.get(row.levelCode)!
          const key = `${levelId}:${row.classLabel}`
          if (!classIdByLevelAndLabel.has(key)) {
            classIdByLevelAndLabel.set(
              key,
              yield* findOrCreateArchivalClass(schoolId, academicYearId, levelId, row.classLabel)
            )
          }
        }
        const subjectIdByCode = new Map<string, string>()
        for (const code of new Set(validRows.map((r) => r.subjectCode))) {
          subjectIdByCode.set(code, yield* findOrCreateArchivalSubject(schoolId, academicYearId, sectionId, code))
        }
        const periodIdByCode = new Map<string, string>()
        for (const code of new Set(validRows.map((r) => r.periodCode))) {
          periodIdByCode.set(
            code,
            yield* findOrCreateArchivalEvaluationPeriod(schoolId, academicYearId, sectionId, code)
          )
        }

        // Same "dedup within this call" reasoning as
        // `StudentGuardianImport.ts`'s guardian-by-mobile-number Map — a
        // single historical student naturally has many rows in one batch
        // (one per subject/period), unlike students/guardians import where
        // one row is one person. Without this, the second row for the same
        // student would re-run `findPersonMatches`, find the `Person` the
        // first row just created within this same batch, and incorrectly
        // treat it as a cross-tenant strong match needing confirmation.
        const resolvedPersonIdByIdentityKey = new Map<string, string>()
        const identityKey = (r: HistoricalGradeImportRow) =>
          r.massarCode ?? `${r.firstName}|${r.lastName}|${r.dateOfBirth}`

        for (const row of validRows) {
          const levelId = levelIdByCode.get(row.levelCode)!
          const classId = classIdByLevelAndLabel.get(`${levelId}:${row.classLabel}`)!
          const subjectId = subjectIdByCode.get(row.subjectCode)!
          const periodId = periodIdByCode.get(row.periodCode)!

          const unit = yield* Effect.result(sql.withTransaction(Effect.gen(function*() {
            const cachedPersonId = resolvedPersonIdByIdentityKey.get(identityKey(row))
            let studentPersonId: string

            if (cachedPersonId !== undefined) {
              studentPersonId = cachedPersonId
            } else {
              const matches = yield* findPersonMatches(row.massarCode, row.firstName, row.lastName, row.dateOfBirth)
              const strong = matches.find((m) => m.matchKind === "strong")
              if (strong !== undefined && row.confirmedMatchPersonId === undefined) {
                return { _tag: "awaitingConfirmation" as const, proposedPersonId: strong.personId }
              }

              studentPersonId = row.confirmedMatchPersonId ?? strong?.personId ?? (yield* createPerson({
                firstName: row.firstName,
                lastName: row.lastName,
                dateOfBirth: row.dateOfBirth,
                massarCode: row.massarCode
              }))
              yield* attachStudentProfile(studentPersonId)
              resolvedPersonIdByIdentityKey.set(identityKey(row), studentPersonId)
            }

            const enrollmentId = yield* findOrCreateCompletedEnrollment(
              schoolId,
              academicYearId,
              yearLabel,
              studentPersonId,
              classId,
              row.effectiveDate
            )

            const assessmentId = yield* findOrCreateImportedAssessment(
              schoolId,
              academicYearId,
              periodId,
              subjectId,
              classId
            )

            const normalizedValue = normalizeToTwenty(row.value, row.scale ?? 20)
            const markId = yield* upsertMark(schoolId, assessmentId, enrollmentId, normalizedValue, row.remark)
            return { _tag: "committed" as const, markId }
          })))

          results.push(
            mapRowOutcome(
              unit,
              (outcome): HistoricalGradeRowResult =>
                Match.valueTags(outcome, {
                  awaitingConfirmation: (o: { readonly proposedPersonId: string }): HistoricalGradeRowResult => ({
                    rowId: row.rowId,
                    status: "awaiting_confirmation",
                    proposedPersonId: o.proposedPersonId
                  }),
                  committed: (o: { readonly markId: string }): HistoricalGradeRowResult => ({
                    rowId: row.rowId,
                    status: "committed",
                    markId: o.markId
                  })
                }),
              (error): HistoricalGradeRowResult => ({ rowId: row.rowId, status: "error", error })
            )
          )
        }

        return results
      })
    )
  )
})
