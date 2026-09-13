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

export const PersonId = Schema.String.pipe(Schema.brand("PersonId"))
export type PersonId = typeof PersonId.Type

export const EnrollmentId = Schema.String.pipe(Schema.brand("EnrollmentId"))
export type EnrollmentId = typeof EnrollmentId.Type

export const AcademicYearId = Schema.String.pipe(Schema.brand("AcademicYearId"))
export type AcademicYearId = typeof AcademicYearId.Type

export const SectionId = Schema.String.pipe(Schema.brand("SectionId"))
export type SectionId = typeof SectionId.Type

export const ImportBatchId = Schema.String.pipe(Schema.brand("ImportBatchId"))
export type ImportBatchId = typeof ImportBatchId.Type

export const ImportBatchRowId = Schema.String.pipe(Schema.brand("ImportBatchRowId"))
export type ImportBatchRowId = typeof ImportBatchRowId.Type

export const TeacherPersonId = Schema.String.pipe(Schema.brand("TeacherPersonId"))
export type TeacherPersonId = typeof TeacherPersonId.Type

export const SchoolMembershipId = Schema.String.pipe(Schema.brand("SchoolMembershipId"))
export type SchoolMembershipId = typeof SchoolMembershipId.Type

export const AssessmentId = Schema.String.pipe(Schema.brand("AssessmentId"))
export type AssessmentId = typeof AssessmentId.Type

export const MarkId = Schema.String.pipe(Schema.brand("MarkId"))
export type MarkId = typeof MarkId.Type

export const FeeScheduleId = Schema.String.pipe(Schema.brand("FeeScheduleId"))
export type FeeScheduleId = typeof FeeScheduleId.Type

export const FeeItemId = Schema.String.pipe(Schema.brand("FeeItemId"))
export type FeeItemId = typeof FeeItemId.Type

export const FinancialAccountId = Schema.String.pipe(Schema.brand("FinancialAccountId"))
export type FinancialAccountId = typeof FinancialAccountId.Type

export const FinancialGuardianDesignationId = Schema.String.pipe(Schema.brand("FinancialGuardianDesignationId"))
export type FinancialGuardianDesignationId = typeof FinancialGuardianDesignationId.Type

export const FinancialAccountPayerId = Schema.String.pipe(Schema.brand("FinancialAccountPayerId"))
export type FinancialAccountPayerId = typeof FinancialAccountPayerId.Type

export const InstallmentId = Schema.String.pipe(Schema.brand("InstallmentId"))
export type InstallmentId = typeof InstallmentId.Type

export const InstallmentAdjustmentId = Schema.String.pipe(Schema.brand("InstallmentAdjustmentId"))
export type InstallmentAdjustmentId = typeof InstallmentAdjustmentId.Type

export const SiblingDiscountPolicyId = Schema.String.pipe(Schema.brand("SiblingDiscountPolicyId"))
export type SiblingDiscountPolicyId = typeof SiblingDiscountPolicyId.Type

export const SiblingDiscountLineId = Schema.String.pipe(Schema.brand("SiblingDiscountLineId"))
export type SiblingDiscountLineId = typeof SiblingDiscountLineId.Type

export const SiblingDiscountRecomputationId = Schema.String.pipe(Schema.brand("SiblingDiscountRecomputationId"))
export type SiblingDiscountRecomputationId = typeof SiblingDiscountRecomputationId.Type

export const PaymentId = Schema.String.pipe(Schema.brand("PaymentId"))
export type PaymentId = typeof PaymentId.Type

export const PaymentAllocationId = Schema.String.pipe(Schema.brand("PaymentAllocationId"))
export type PaymentAllocationId = typeof PaymentAllocationId.Type

export const ReceiptId = Schema.String.pipe(Schema.brand("ReceiptId"))
export type ReceiptId = typeof ReceiptId.Type

export const FinancialAccountCreditId = Schema.String.pipe(Schema.brand("FinancialAccountCreditId"))
export type FinancialAccountCreditId = typeof FinancialAccountCreditId.Type

export const PaymentVoidId = Schema.String.pipe(Schema.brand("PaymentVoidId"))
export type PaymentVoidId = typeof PaymentVoidId.Type

export const ChequeId = Schema.String.pipe(Schema.brand("ChequeId"))
export type ChequeId = typeof ChequeId.Type

export const DunningTierId = Schema.String.pipe(Schema.brand("DunningTierId"))
export type DunningTierId = typeof DunningTierId.Type

export const DunningId = Schema.String.pipe(Schema.brand("DunningId"))
export type DunningId = typeof DunningId.Type

export const SchoolMembershipCycleId = Schema.String.pipe(Schema.brand("SchoolMembershipCycleId"))
export type SchoolMembershipCycleId = typeof SchoolMembershipCycleId.Type

export const TeacherAssignmentId = Schema.String.pipe(Schema.brand("TeacherAssignmentId"))
export type TeacherAssignmentId = typeof TeacherAssignmentId.Type

export const SlotId = Schema.String.pipe(Schema.brand("SlotId"))
export type SlotId = typeof SlotId.Type

export const SessionId = Schema.String.pipe(Schema.brand("SessionId"))
export type SessionId = typeof SessionId.Type

export const RollCallSubmissionId = Schema.String.pipe(Schema.brand("RollCallSubmissionId"))
export type RollCallSubmissionId = typeof RollCallSubmissionId.Type

export const RollCallDiscrepancyId = Schema.String.pipe(Schema.brand("RollCallDiscrepancyId"))
export type RollCallDiscrepancyId = typeof RollCallDiscrepancyId.Type

export const AttendanceNotificationOutboxId = Schema.String.pipe(Schema.brand("AttendanceNotificationOutboxId"))
export type AttendanceNotificationOutboxId = typeof AttendanceNotificationOutboxId.Type

export const DeliveryLogId = Schema.String.pipe(Schema.brand("DeliveryLogId"))
export type DeliveryLogId = typeof DeliveryLogId.Type

export const PushSubscriptionId = Schema.String.pipe(Schema.brand("PushSubscriptionId"))
export type PushSubscriptionId = typeof PushSubscriptionId.Type

export const AttachmentId = Schema.String.pipe(Schema.brand("AttachmentId"))
export type AttachmentId = typeof AttachmentId.Type
