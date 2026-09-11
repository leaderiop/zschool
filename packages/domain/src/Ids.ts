import * as Schema from "effect/Schema"

/**
 * Schema-backed branded identifier types (issue #34) — `Schema.brand` alone
 * adds no runtime check of its own (it only tags the TypeScript type), but
 * layering it on `Schema.String` means `Schema.decodeEffect(SchoolId)(...)`
 * at an untrusted boundary (a raw command field, an import row) now actually
 * rejects a malformed value instead of silently flowing through
 * as a "validated" value that was never checked (the previous `Brand.nominal`
 * behavior). An already-validated internal value (e.g. one id derived from
 * another already-decoded one) can still be cast directly — see call sites.
 */

export const SchoolId = Schema.String.pipe(Schema.brand("SchoolId"))
export type SchoolId = typeof SchoolId.Type

export const ClassId = Schema.String.pipe(Schema.brand("ClassId"))
export type ClassId = typeof ClassId.Type

export const LevelId = Schema.String.pipe(Schema.brand("LevelId"))
export type LevelId = typeof LevelId.Type

export const TrackId = Schema.String.pipe(Schema.brand("TrackId"))
export type TrackId = typeof TrackId.Type

export const GroupId = Schema.String.pipe(Schema.brand("GroupId"))
export type GroupId = typeof GroupId.Type

export const GuardianPersonId = Schema.String.pipe(Schema.brand("GuardianPersonId"))
export type GuardianPersonId = typeof GuardianPersonId.Type

export const StudentPersonId = Schema.String.pipe(Schema.brand("StudentPersonId"))
export type StudentPersonId = typeof StudentPersonId.Type

export const GradingScaleId = Schema.String.pipe(Schema.brand("GradingScaleId"))
export type GradingScaleId = typeof GradingScaleId.Type

export const ComputationRuleId = Schema.String.pipe(Schema.brand("ComputationRuleId"))
export type ComputationRuleId = typeof ComputationRuleId.Type

export const SubjectId = Schema.String.pipe(Schema.brand("SubjectId"))
export type SubjectId = typeof SubjectId.Type

export const SubjectLevelConfigId = Schema.String.pipe(Schema.brand("SubjectLevelConfigId"))
export type SubjectLevelConfigId = typeof SubjectLevelConfigId.Type

export const CourseId = Schema.String.pipe(Schema.brand("CourseId"))
export type CourseId = typeof CourseId.Type

export const CalendarEventId = Schema.String.pipe(Schema.brand("CalendarEventId"))
export type CalendarEventId = typeof CalendarEventId.Type

export const EvaluationPeriodId = Schema.String.pipe(Schema.brand("EvaluationPeriodId"))
export type EvaluationPeriodId = typeof EvaluationPeriodId.Type

export const EvaluationSubPeriodId = Schema.String.pipe(Schema.brand("EvaluationSubPeriodId"))
export type EvaluationSubPeriodId = typeof EvaluationSubPeriodId.Type
