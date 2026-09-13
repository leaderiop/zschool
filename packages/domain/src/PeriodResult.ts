import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { CERTIFYING_LEVEL_CODES } from "./AssessmentType.ts"
import { writeAuditLog } from "./AuditLog.ts"
import { canSetRankExclusion } from "./authorization/Policies.ts"
import { EXTERNAL_EXAM_SLOTS_BY_LEVEL_CODE } from "./ExamGrade.ts"
import { defaultHonorsThresholds, type HonorsThreshold } from "./GradingScales.ts"
import { AcademicYearId, ClassId, EvaluationPeriodId, PeriodResultId, SchoolId, SubjectResultId, YearResultId } from "./Ids.ts"
import { authorized, authorizeWith, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

/**
 * Ticket #110 (EVA: calculation rules, PeriodResult, rank/honors, and
 * rank-exclusion — resolving wayfinder ticket #110, spec #119, also closing
 * Attendance's own #90). `Model.Class`es matching migration 0036's
 * `period_results`/`subject_results`/`year_results` — the writes below stay
 * raw SQL throughout, the same "no `SqlModel` repository" choice
 * `AssessmentType.ts#findAssessmentCompliance` already made for a
 * compute-then-overwrite projection: these rows are read-mostly and fully
 * recomputed each time, never partially patched, so a repository's
 * single-row `update` abstraction buys nothing here.
 */
export class PeriodResult extends Model.Class<PeriodResult>("PeriodResult")({
  id: Model.Field({ select: PeriodResultId, update: PeriodResultId, json: PeriodResultId, jsonUpdate: PeriodResultId }),
  school_id: SchoolId,
  evaluation_period_id: Schema.String,
  enrollment_id: Schema.String,
  class_id: Schema.String,
  overall_average: Schema.NullOr(Schema.NumberFromString),
  rank: Schema.NullOr(Schema.Int),
  honors_label: Schema.NullOr(Schema.String),
  excluded_from_rank: Schema.Boolean,
  excluded_from_rank_reason: Schema.NullOr(Schema.String),
  computed_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

export class SubjectResult extends Model.Class<SubjectResult>("SubjectResult")({
  id: Model.Field({
    select: SubjectResultId,
    update: SubjectResultId,
    json: SubjectResultId,
    jsonUpdate: SubjectResultId
  }),
  school_id: SchoolId,
  period_result_id: Schema.String,
  subject_id: Schema.String,
  // NULL = "NG" (BEH-ZS-117(c)).
  average: Schema.NullOr(Schema.NumberFromString)
}) {}

export class YearResult extends Model.Class<YearResult>("YearResult")({
  id: Model.Field({ select: YearResultId, update: YearResultId, json: YearResultId, jsonUpdate: YearResultId }),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  enrollment_id: Schema.String,
  class_id: Schema.String,
  year_average: Schema.NullOr(Schema.NumberFromString),
  rank: Schema.NullOr(Schema.Int),
  honors_label: Schema.NullOr(Schema.String),
  // True when the enrollment was `excluded_from_rank` on ANY `PeriodResult`
  // averaged into this year — BEH-ZS-102's exclusion is a serious,
  // documented decision; it stays in force for the annual ranking, not just
  // the one period it was recorded against.
  excluded_from_rank: Schema.Boolean,
  computed_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis)
}) {}

/** Postgres's `round(numeric, n)` is already "round half away from zero" — the only rounding mode BEH-ZS-118's default (`NationalTemplate.ts`'s `"half_up"`) or any grading scale on hand actually asks for, so `GradingScale.rounding`'s text value isn't branched on yet. A future non-`half_up` rounding mode is a disclosed gap, not silently wrong: everything still rounds, just always the same way. */
const roundToDecimals = (value: number, decimals: number): number => {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

const honorsLabelFor = (average: number, thresholds: ReadonlyArray<HonorsThreshold>): string | null => {
  const applicable = (thresholds.length > 0 ? thresholds : defaultHonorsThresholds)
    .filter((t) => average >= t.min_average)
    .sort((a, b) => b.min_average - a.min_average)
  return applicable[0]?.label ?? null
}

/** Standard competition ranking (1, 2, 2, 4): ties share a rank, the next distinct value skips ahead by the number of ties — French/Moroccan report-card convention ("ex-æquo"). `null` averages (no marks at all this period) get no rank, same as an excluded student. Keyed by `enrollmentId`, not object identity — robust to a future refactor that clones entries mid-pipeline. */
const assignRanks = <T extends { readonly enrollmentId: string; readonly average: number | null }>(
  entries: ReadonlyArray<T>
): ReadonlyArray<T & { readonly rank: number | null }> => {
  const ranked = entries.filter((e): e is T & { average: number } => e.average !== null)
    .slice()
    .sort((a, b) => b.average - a.average)

  const rankByEnrollmentId = new Map<string, number>()
  let currentRank = 1
  ranked.forEach((entry, index) => {
    if (index > 0 && entry.average !== ranked[index - 1].average) {
      currentRank = index + 1
    }
    rankByEnrollmentId.set(entry.enrollmentId, currentRank)
  })

  return entries.map((entry) => ({ ...entry, rank: rankByEnrollmentId.get(entry.enrollmentId) ?? null }))
}

interface MarkRow {
  readonly subject_id: string
  readonly coefficient: string
  readonly value: string | null
  readonly marker: string | null
  /** Ticket #111: an assessment whose `AssessmentType.counts_as_unified_test` is true — the "local unified exam" (BEH-ZS-118/120), which certifying levels weight separately from ordinary continuous assessment, not lumped in with it. */
  readonly is_unified_test: boolean
}

interface SubjectRosterRow {
  readonly subject_id: string
  readonly coefficient: string
}

/**
 * BEH-ZS-117: weights each included mark by its `Assessment.coefficient`;
 * an `absent_unjustified` marker counts as `0` when
 * `unjustifiedAbsenceCountsAsZero`, otherwise is excluded exactly like
 * `absent_justified`/`exempted` — both are excluded from the denominator
 * per BEH-ZS-117(b). `lowestGradeExclusionMinCount` drops the single lowest
 * included value once the included count exceeds it. `null` return means
 * "NG" (no grade at all).
 */
const computeSubjectAverage = (
  marks: ReadonlyArray<MarkRow>,
  unjustifiedAbsenceCountsAsZero: boolean,
  lowestGradeExclusionMinCount: number | null
): number | null => {
  if (marks.length === 0) return null

  const included = marks.flatMap((mark) => {
    const coefficient = Number(mark.coefficient)
    if (mark.marker === null) return [{ value: Number(mark.value), coefficient }]
    if (mark.marker === "absent_unjustified" && unjustifiedAbsenceCountsAsZero) {
      return [{ value: 0, coefficient }]
    }
    return []
  })

  if (included.length === 0) return null

  const withExclusion = lowestGradeExclusionMinCount !== null && included.length > lowestGradeExclusionMinCount
    ? included.slice().sort((a, b) => a.value - b.value).slice(1)
    : included

  const weightSum = withExclusion.reduce((sum, m) => sum + m.coefficient, 0)
  if (weightSum === 0) return null
  const weighted = withExclusion.reduce((sum, m) => sum + m.value * m.coefficient, 0)
  return weighted / weightSum
}

/** Same coefficient-weighted-average shape as `computeSubjectAverage`'s own final reduction, reused for the exam_1/exam_2 buckets below (which have no marker/exclusion logic of their own — a `null` entry just drops out of both sums, same "NG excluded, not zeroed" treatment `computeSubjectAverage` gives a subject with no marks at all). */
const weightedSubjectAverage = (entries: ReadonlyArray<{ coefficient: number; value: number | null }>): number | null => {
  const included = entries.filter((e): e is typeof e & { value: number } => e.value !== null)
  if (included.length === 0) return null
  const weightSum = included.reduce((sum, e) => sum + e.coefficient, 0)
  if (weightSum === 0) return null
  const weighted = included.reduce((sum, e) => sum + e.value * e.coefficient, 0)
  return weighted / weightSum
}

/**
 * Ticket #110: computes and overwrites `PeriodResult`/`SubjectResult` for
 * every active enrollment in `classId`, for `evaluationPeriodId`. On-demand
 * only — no automatic trigger from `enterGrades`/`publishAssessment` yet;
 * wiring this into the actual "when do results become final" moment, and
 * freezing it at closing, is #112's job.
 *
 * BEH-ZS-118's certifying weighting: `ComputationRule.weight_continuous`
 * (non-certifying levels are seeded at `100`, so this is a no-op
 * multiplication for them) plus, for the three certifying levels
 * (`AssessmentType.ts#CERTIFYING_LEVEL_CODES`), `weight_exam_1`/
 * `weight_exam_2` (ticket #111). Per subject, each exam slot's value comes
 * from an `ExamGrade` row if one exists, else — for whichever slot isn't
 * external for this level (`ExamGrade.ts#EXTERNAL_EXAM_SLOTS_BY_LEVEL_CODE`;
 * 6AP/3AC's slot 1 is the internal "local unified exam") — from that
 * subject's own `counts_as_unified_test` marks, which are excluded from the
 * continuous bucket entirely for these three levels so they're never
 * double-counted. A slot with no value at all (neither an `ExamGrade` nor
 * applicable marks) contributes `0` to the final weighted sum, not an
 * excluded term — the same "an unsat exam reads as 0, not NG" numeric
 * meaning ticket #110's own interim version already established, now just
 * populated by real data once it exists instead of always being empty.
 * `SubjectResult.average` stores only the continuous-assessment subject
 * average (unaffected by this ticket) — a report card's own per-subject
 * exam breakdown is a future ticket's concern, not persisted here.
 */
export const recomputePeriodResult = Effect.fn("PeriodResult.recomputePeriodResult")(function*(
  rawSchoolId: string,
  rawEvaluationPeriodId: string,
  rawClassId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const evaluationPeriodId = yield* Schema.decodeEffect(EvaluationPeriodId)(rawEvaluationPeriodId)
  const classId = yield* Schema.decodeEffect(ClassId)(rawClassId)

  return yield* authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient

        const classRows = yield* sql<{ level_id: string; level_code: string }>`
          SELECT c.level_id, lv.code AS level_code FROM classes c
          JOIN levels lv ON lv.id = c.level_id
          WHERE c.id = ${classId} AND c.school_id = ${schoolId}
        `
        const classRow = classRows[0]
        if (classRow === undefined) {
          return yield* new EntityNotFoundError({ entityType: "class", entityId: classId })
        }
        const isCertifyingLevel = CERTIFYING_LEVEL_CODES.has(classRow.level_code)
        const externalSlots = EXTERNAL_EXAM_SLOTS_BY_LEVEL_CODE.get(classRow.level_code) ?? new Set<number>()

        yield* requireOwnedRow(
          sql,
          "evaluation_periods",
          "evaluation_period",
          evaluationPeriodId,
          schoolId,
          RowWithId
        )

        const ruleRows = yield* sql<{
          lowest_grade_exclusion_min_count: number | null
          honors_thresholds: ReadonlyArray<HonorsThreshold>
          unjustified_absence_counts_as_zero: boolean
          weight_continuous: string
          weight_exam_1: string
          weight_exam_2: string
        }>`
          SELECT lowest_grade_exclusion_min_count, honors_thresholds, unjustified_absence_counts_as_zero,
            weight_continuous::text AS weight_continuous, weight_exam_1::text AS weight_exam_1,
            weight_exam_2::text AS weight_exam_2
          FROM computation_rules
          WHERE school_id = ${schoolId} AND level_id = ${classRow.level_id} AND is_current
        `
        const rule = ruleRows[0]
        if (rule === undefined) {
          return yield* new EntityNotFoundError({ entityType: "computation_rule", entityId: classRow.level_id })
        }

        const schoolRows = yield* sql<{ conduct_grade_counts_toward_average: boolean }>`
          SELECT conduct_grade_counts_toward_average FROM schools WHERE id = ${schoolId}
        `
        const conductGradeCountsTowardAverage = schoolRows[0]?.conduct_grade_counts_toward_average ?? false

        const roster: ReadonlyArray<SubjectRosterRow> = yield* sql<SubjectRosterRow>`
          SELECT DISTINCT slc.subject_id, slc.coefficient
          FROM courses c
          JOIN subject_level_configs slc ON slc.id = c.subject_level_config_id
          WHERE c.class_id = ${classId} AND c.school_id = ${schoolId} AND c.is_active
        `

        const enrollments = yield* sql<{ id: string }>`
          SELECT id FROM enrollments WHERE class_id = ${classId} AND school_id = ${schoolId} AND status = 'active'
        `

        const perEnrollment: Array<{ enrollmentId: string; average: number | null }> = []

        for (const enrollment of enrollments) {
          const marks = yield* sql<MarkRow>`
            SELECT a.subject_id, a.coefficient::text AS coefficient, m.value::text AS value, m.marker,
              COALESCE(at.counts_as_unified_test, false) AS is_unified_test
            FROM marks m
            JOIN assessments a ON a.id = m.assessment_id
            LEFT JOIN assessment_types at ON at.id = a.assessment_type_id
            WHERE m.enrollment_id = ${enrollment.id}
              AND a.evaluation_period_id = ${evaluationPeriodId}
              AND m.status = 'published'
          `
          // Certifying levels pull `counts_as_unified_test` marks out of the
          // continuous bucket entirely (they weight separately, as slot 1's
          // internal fallback below) — every other level keeps them lumped
          // in with ordinary continuous marks, unchanged from before #111.
          const continuousMarks = isCertifyingLevel ? marks.filter((m) => !m.is_unified_test) : marks
          const unifiedMarks = isCertifyingLevel ? marks.filter((m) => m.is_unified_test) : []

          const marksBySubject = new Map<string, Array<MarkRow>>()
          for (const mark of continuousMarks) {
            const list = marksBySubject.get(mark.subject_id) ?? []
            list.push(mark)
            marksBySubject.set(mark.subject_id, list)
          }
          const unifiedMarksBySubject = new Map<string, Array<MarkRow>>()
          for (const mark of unifiedMarks) {
            const list = unifiedMarksBySubject.get(mark.subject_id) ?? []
            list.push(mark)
            unifiedMarksBySubject.set(mark.subject_id, list)
          }

          const examGradesBySubjectSlot = new Map<string, number>()
          if (isCertifyingLevel) {
            const examGrades = yield* sql<{ subject_id: string; exam_slot: number; value: string }>`
              SELECT subject_id, exam_slot, value::text AS value FROM exam_grades
              WHERE enrollment_id = ${enrollment.id} AND evaluation_period_id = ${evaluationPeriodId}
            `
            for (const grade of examGrades) {
              examGradesBySubjectSlot.set(`${grade.subject_id}:${grade.exam_slot}`, Number(grade.value))
            }
          }

          const subjectAverages = roster.map((subject) => ({
            subjectId: subject.subject_id,
            coefficient: Number(subject.coefficient),
            average: computeSubjectAverage(
              marksBySubject.get(subject.subject_id) ?? [],
              rule.unjustified_absence_counts_as_zero,
              rule.lowest_grade_exclusion_min_count
            )
          }))

          let weightSum = subjectAverages
            .filter((s) => s.average !== null)
            .reduce((sum, s) => sum + s.coefficient, 0)
          let weighted = subjectAverages
            .filter((s): s is typeof s & { average: number } => s.average !== null)
            .reduce((sum, s) => sum + s.average * s.coefficient, 0)

          if (conductGradeCountsTowardAverage) {
            const conductRows = yield* sql<{ value: string }>`
              SELECT value::text AS value FROM conduct_grades
              WHERE enrollment_id = ${enrollment.id} AND evaluation_period_id = ${evaluationPeriodId}
                AND status = 'validated'
            `
            const conductGrade = conductRows[0]
            if (conductGrade !== undefined) {
              weightSum += 1
              weighted += Number(conductGrade.value)
            }
          }

          const rawOverallAverage = weightSum === 0 ? null : weighted / weightSum

          let overallAverage: number | null = null
          if (rawOverallAverage !== null) {
            if (isCertifyingLevel) {
              const examSlotValue = (slot: 1 | 2) =>
                roster.map((subject) => {
                  const fromExamGrade = examGradesBySubjectSlot.get(`${subject.subject_id}:${slot}`)
                  const value = fromExamGrade ?? (
                    !externalSlots.has(slot)
                      ? computeSubjectAverage(
                        unifiedMarksBySubject.get(subject.subject_id) ?? [],
                        rule.unjustified_absence_counts_as_zero,
                        rule.lowest_grade_exclusion_min_count
                      )
                      : null
                  )
                  return { coefficient: Number(subject.coefficient), value: value ?? null }
                })

              const exam1Overall = weightedSubjectAverage(examSlotValue(1))
              const exam2Overall = weightedSubjectAverage(examSlotValue(2))

              const combined = rawOverallAverage * (Number(rule.weight_continuous) / 100) +
                (exam1Overall ?? 0) * (Number(rule.weight_exam_1) / 100) +
                (exam2Overall ?? 0) * (Number(rule.weight_exam_2) / 100)
              overallAverage = roundToDecimals(combined, 2)
            } else {
              overallAverage = roundToDecimals(rawOverallAverage * (Number(rule.weight_continuous) / 100), 2)
            }
          }
          perEnrollment.push({ enrollmentId: enrollment.id, average: overallAverage })

          const [periodResult] = yield* sql<{ id: string; excluded_from_rank: boolean }>`
            INSERT INTO period_results (school_id, evaluation_period_id, enrollment_id, class_id, overall_average, computed_at)
            VALUES (${schoolId}, ${evaluationPeriodId}, ${enrollment.id}, ${classId}, ${overallAverage}, now())
            ON CONFLICT (evaluation_period_id, enrollment_id) DO UPDATE SET
              overall_average = EXCLUDED.overall_average,
              class_id = EXCLUDED.class_id,
              computed_at = EXCLUDED.computed_at
            RETURNING id, excluded_from_rank
          `

          yield* sql`DELETE FROM subject_results WHERE period_result_id = ${periodResult.id}`
          for (const subject of subjectAverages) {
            yield* sql`
              INSERT INTO subject_results (school_id, period_result_id, subject_id, average)
              VALUES (${schoolId}, ${periodResult.id}, ${subject.subjectId}, ${subject.average})
            `
          }

          const honorsLabel = overallAverage === null ? null : honorsLabelFor(overallAverage, rule.honors_thresholds)
          yield* sql`UPDATE period_results SET honors_label = ${honorsLabel} WHERE id = ${periodResult.id}`
        }

        const rankable = yield* sql<{ enrollment_id: string; excluded_from_rank: boolean }>`
          SELECT enrollment_id, excluded_from_rank FROM period_results
          WHERE evaluation_period_id = ${evaluationPeriodId} AND class_id = ${classId}
        `
        const excludedByEnrollment = new Map(rankable.map((r) => [r.enrollment_id, r.excluded_from_rank]))

        const rankInput = perEnrollment
          .filter((e) => !excludedByEnrollment.get(e.enrollmentId))
          .map((e) => ({ enrollmentId: e.enrollmentId, average: e.average }))
        const ranked = assignRanks(rankInput)

        for (const entry of ranked) {
          yield* sql`
            UPDATE period_results SET rank = ${entry.rank}
            WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${entry.enrollmentId}
          `
        }
        for (const excludedId of excludedByEnrollment.entries()) {
          if (excludedId[1]) {
            yield* sql`
              UPDATE period_results SET rank = NULL
              WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${excludedId[0]}
            `
          }
        }
      })
    )
  )
})

/**
 * Ticket #110 (BEH-ZS-119: "annual results — average of the periods,
 * equal-weighted by default, with period weighting configurable"). Reads
 * every `EvaluationPeriod`'s own `weight` (null = equal) for the class's
 * section/year and averages that class's `PeriodResult.overall_average`
 * rows across them, weighted the same way, then ranks/honors identically to
 * `recomputePeriodResult`.
 */
export const recomputeYearResult = Effect.fn("PeriodResult.recomputeYearResult")(function*(
  rawSchoolId: string,
  rawAcademicYearId: string,
  rawClassId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  const academicYearId = yield* Schema.decodeEffect(AcademicYearId)(rawAcademicYearId)
  const classId = yield* Schema.decodeEffect(ClassId)(rawClassId)

  return yield* authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient

        const classRows = yield* sql<{ level_id: string }>`
          SELECT level_id FROM classes WHERE id = ${classId} AND school_id = ${schoolId}
        `
        const classRow = classRows[0]
        if (classRow === undefined) {
          return yield* new EntityNotFoundError({ entityType: "class", entityId: classId })
        }

        const ruleRows = yield* sql<{ honors_thresholds: ReadonlyArray<HonorsThreshold> }>`
          SELECT honors_thresholds FROM computation_rules
          WHERE school_id = ${schoolId} AND level_id = ${classRow.level_id} AND is_current
        `
        const honorsThresholds = ruleRows[0]?.honors_thresholds ?? defaultHonorsThresholds

        const sectionRows = yield* sql<{ section_id: string }>`
          SELECT cy.section_id FROM levels lv JOIN cycles cy ON cy.id = lv.cycle_id
          WHERE lv.id = ${classRow.level_id}
        `
        const sectionId = sectionRows[0]?.section_id
        if (sectionId === undefined) {
          return yield* new EntityNotFoundError({ entityType: "section", entityId: classRow.level_id })
        }

        const periods = yield* sql<{ id: string; weight: string | null }>`
          SELECT id, weight::text AS weight FROM evaluation_periods
          WHERE school_id = ${schoolId} AND section_id = ${sectionId} AND academic_year_id = ${academicYearId}
        `

        const enrollments = yield* sql<{ id: string }>`
          SELECT id FROM enrollments WHERE class_id = ${classId} AND school_id = ${schoolId} AND status = 'active'
        `

        const perEnrollment: Array<{ enrollmentId: string; average: number | null; excludedFromRank: boolean }> = []

        for (const enrollment of enrollments) {
          let weightSum = 0
          let weighted = 0
          let excludedFromRank = false
          for (const period of periods) {
            const [periodResult] = yield* sql<
              { overall_average: string | null; excluded_from_rank: boolean }
            >`
              SELECT overall_average::text AS overall_average, excluded_from_rank FROM period_results
              WHERE evaluation_period_id = ${period.id} AND enrollment_id = ${enrollment.id}
            `
            if (periodResult?.excluded_from_rank) excludedFromRank = true
            if (periodResult?.overall_average == null) continue
            const w = period.weight === null ? 1 : Number(period.weight)
            weightSum += w
            weighted += Number(periodResult.overall_average) * w
          }
          const yearAverage = weightSum === 0 ? null : roundToDecimals(weighted / weightSum, 2)
          perEnrollment.push({ enrollmentId: enrollment.id, average: yearAverage, excludedFromRank })

          const honorsLabel = yearAverage === null ? null : honorsLabelFor(yearAverage, honorsThresholds)

          yield* sql`
            INSERT INTO year_results
              (school_id, academic_year_id, enrollment_id, class_id, year_average, honors_label, excluded_from_rank, computed_at)
            VALUES (
              ${schoolId}, ${academicYearId}, ${enrollment.id}, ${classId}, ${yearAverage}, ${honorsLabel},
              ${excludedFromRank}, now()
            )
            ON CONFLICT (academic_year_id, enrollment_id) DO UPDATE SET
              year_average = EXCLUDED.year_average,
              honors_label = EXCLUDED.honors_label,
              excluded_from_rank = EXCLUDED.excluded_from_rank,
              class_id = EXCLUDED.class_id,
              computed_at = EXCLUDED.computed_at
          `
        }

        const ranked = assignRanks(
          perEnrollment.filter((e) => !e.excludedFromRank).map((e) => ({ enrollmentId: e.enrollmentId, average: e.average }))
        )
        for (const entry of ranked) {
          yield* sql`
            UPDATE year_results SET rank = ${entry.rank}
            WHERE academic_year_id = ${academicYearId} AND enrollment_id = ${entry.enrollmentId}
          `
        }
        for (const excluded of perEnrollment.filter((e) => e.excludedFromRank)) {
          yield* sql`
            UPDATE year_results SET rank = NULL
            WHERE academic_year_id = ${academicYearId} AND enrollment_id = ${excluded.enrollmentId}
          `
        }
      })
    )
  )
})

/**
 * Ticket #110 (BEH-ZS-102, resolving Attendance's #90): sets/clears a
 * `PeriodResult`'s "excluded from rank" flag — director-only
 * (`canSetRankExclusion`), refused unless the school has opted in
 * (`schools.rank_exclusion_enabled`, BEH-ZS-102's own "configurable...
 * whether to enable the option per school"). Dated/logged (`AuditLog.ts`,
 * reused rather than a bespoke log) and reversible: calling this again with
 * `excluded: false` clears it, no separate "undo" operation needed. Re-ranks
 * the class immediately rather than waiting for the next
 * `recomputePeriodResult` call, since excluding/re-including a student
 * changes everyone else's rank too.
 */
export class RankExclusionNotEnabledError
  extends Schema.TaggedError<RankExclusionNotEnabledError>()("RankExclusionNotEnabledError", { schoolId: Schema.String })
{}

export const setRankExclusion = Effect.fn("PeriodResult.setRankExclusion")(function*(
  rawSchoolId: string,
  evaluationPeriodId: string,
  enrollmentId: string,
  excluded: boolean,
  reason: string,
  actorPersonId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canSetRankExclusion,
    "set-rank-exclusion",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient

        const schoolRows = yield* sql<{ rank_exclusion_enabled: boolean }>`
          SELECT rank_exclusion_enabled FROM schools WHERE id = ${schoolId}
        `
        if (schoolRows[0]?.rank_exclusion_enabled !== true) {
          return yield* new RankExclusionNotEnabledError({ schoolId })
        }

        const rows = yield* sql<{ id: string; class_id: string; excluded_from_rank: boolean }>`
          SELECT id, class_id, excluded_from_rank FROM period_results
          WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${enrollmentId} AND school_id = ${schoolId}
        `
        const before = rows[0]
        if (before === undefined) {
          return yield* new EntityNotFoundError({ entityType: "period_result", entityId: enrollmentId })
        }

        yield* sql`
          UPDATE period_results
          SET excluded_from_rank = ${excluded}, excluded_from_rank_reason = ${excluded ? reason : null}
          WHERE id = ${before.id}
        `
        yield* writeAuditLog(
          schoolId,
          actorPersonId,
          "set_rank_exclusion",
          "period_result",
          before.id,
          { excluded: before.excluded_from_rank },
          { excluded, reason }
        )

        yield* recomputeRanksOnly(sql, evaluationPeriodId, before.class_id)
      })
    )
  )
})

/** Re-ranks a class's already-computed `PeriodResult.overall_average` values without recomputing them — `setRankExclusion`'s own follow-up, since excluding/including a student changes everyone else's rank without changing anyone's average. */
const recomputeRanksOnly = (sql: SqlClient, evaluationPeriodId: string, classId: string) =>
  Effect.gen(function*() {
    const rows = yield* sql<{ enrollment_id: string; overall_average: string | null; excluded_from_rank: boolean }>`
      SELECT enrollment_id, overall_average::text AS overall_average, excluded_from_rank FROM period_results
      WHERE evaluation_period_id = ${evaluationPeriodId} AND class_id = ${classId}
    `
    const rankInput = rows
      .filter((r) => !r.excluded_from_rank)
      .map((r) => ({ enrollmentId: r.enrollment_id, average: r.overall_average === null ? null : Number(r.overall_average) }))
    const ranked = assignRanks(rankInput)

    for (const entry of ranked) {
      yield* sql`
        UPDATE period_results SET rank = ${entry.rank}
        WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${entry.enrollmentId}
      `
    }
    for (const row of rows) {
      if (row.excluded_from_rank) {
        yield* sql`
          UPDATE period_results SET rank = NULL
          WHERE evaluation_period_id = ${evaluationPeriodId} AND enrollment_id = ${row.enrollment_id}
        `
      }
    }
  })
