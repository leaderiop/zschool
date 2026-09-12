import { RequiredPermission, requiresPermission } from "@qadi/http/RequirePermission"
import * as Schema from "effect/Schema"
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi"
import { analyzeImportsPermission, canAnalyzeImports } from "../authorization/Policies.ts"
import { ClassImportRowSchema } from "../ClassImportAnalysis.ts"
import { GradeAnalysisResultHttpSchema, GradeImportRowSchema } from "../GradeImport.ts"
import { SchoolId } from "../Ids.ts"
import { ImportBatchReportHttpSchema } from "../ImportBatch.ts"
import {
  GuardianImportRowSchema,
  GuardianRowResultHttpSchema,
  StudentAnalysisResultHttpSchema,
  StudentImportRowSchema
} from "../StudentGuardianImport.ts"
import { TeacherAnalysisResultHttpSchema, TeacherImportRowSchema } from "../TeacherImport.ts"

/**
 * Issue #38's first two endpoints (`analyzeGuardians`/`analyzeStudents`) plus
 * ticket #8's full `ImportBatch` mechanics for the classes domain (ADR-ZS-106):
 * a bilingual template download, a persisted analyze report, an async commit
 * request, and retry — `commitClassImportBatch` (the worker's own
 * re-validate-and-write step) is deliberately NOT exposed here, since it's
 * never called synchronously from a request (`apps/workers` calls it
 * directly, off an SQS message).
 *
 * `analyzeTeachers` (ticket #14) follows the guardians/students precedent,
 * not the classes one: analyze-only over HTTP, no persisted `ImportBatch`
 * report and no commit endpoint — `commitTeacherImportBatch` is exercised
 * directly against the `@zschool/domain` service interface (same seam as
 * `StudentGuardianImport.ts`'s `commitImportBatch`, which has no HTTP
 * endpoint either).
 *
 * `analyzeGrades` (ticket #15, current-term slice only — historical import
 * is a separate follow-up) follows the same precedent: analyze-only over
 * HTTP, `commitGradeImportBatch` exercised directly against the domain
 * service interface. Its payload is a `{academicYearId, rows}` struct, not
 * a bare row array like every other analyze endpoint — a grade row's
 * subject/period codes only resolve within one specific academic year, and
 * every row in one import batch shares it, so it's carried once per request
 * rather than repeated per row.
 *
 * Every endpoint carries its own `RequiredPermission` annotation, inline
 * (per `requiresPermission`'s own doc comment: the type-preserving
 * `.annotate()` call must appear at the call site, not inside a shared
 * helper) — `@qadi/http`'s `RequirePermission` middleware (attached at the
 * `Api` level, see `Api.ts`) refuses any endpoint that declares neither a
 * permission requirement nor `publicEndpoint(...)`, so a future third
 * endpoint added here without one fails loudly rather than shipping
 * unguarded.
 */
const importsRequirement = { permission: analyzeImportsPermission, policy: canAnalyzeImports }
const batchParams = { schoolId: SchoolId, batchId: Schema.String }
const GradeImportBatchPayloadSchema = Schema.Struct({
  academicYearId: Schema.NonEmptyString,
  rows: Schema.Array(GradeImportRowSchema)
})

export class ImportsApiGroup extends HttpApiGroup.make("imports")
  .add(
    HttpApiEndpoint.post(
      "analyzeGuardians",
      "/schools/:schoolId/imports/guardians/analyze",
      {
        params: { schoolId: SchoolId },
        payload: Schema.Array(GuardianImportRowSchema),
        success: Schema.Array(GuardianRowResultHttpSchema)
      }
    ).pipe((e) => e.annotate(RequiredPermission, requiresPermission(e, importsRequirement))),
    HttpApiEndpoint.post(
      "analyzeStudents",
      "/schools/:schoolId/imports/students/analyze",
      {
        params: { schoolId: SchoolId },
        payload: Schema.Array(StudentImportRowSchema),
        success: Schema.Array(StudentAnalysisResultHttpSchema)
      }
    ).pipe((e) => e.annotate(RequiredPermission, requiresPermission(e, importsRequirement))),
    HttpApiEndpoint.post(
      "analyzeTeachers",
      "/schools/:schoolId/imports/teachers/analyze",
      {
        params: { schoolId: SchoolId },
        payload: Schema.Array(TeacherImportRowSchema),
        success: Schema.Array(TeacherAnalysisResultHttpSchema)
      }
    ).pipe((e) => e.annotate(RequiredPermission, requiresPermission(e, importsRequirement))),
    HttpApiEndpoint.post(
      "analyzeGrades",
      "/schools/:schoolId/imports/grades/analyze",
      {
        params: { schoolId: SchoolId },
        payload: GradeImportBatchPayloadSchema,
        success: Schema.Array(GradeAnalysisResultHttpSchema)
      }
    ).pipe((e) => e.annotate(RequiredPermission, requiresPermission(e, importsRequirement))),
    HttpApiEndpoint.get(
      "classImportTemplate",
      "/schools/:schoolId/imports/classes/template",
      {
        params: { schoolId: SchoolId },
        success: HttpApiSchema.StreamUint8Array({
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        })
      }
    ).pipe((e) => e.annotate(RequiredPermission, requiresPermission(e, importsRequirement))),
    HttpApiEndpoint.post(
      "analyzeClasses",
      "/schools/:schoolId/imports/classes/analyze",
      {
        params: { schoolId: SchoolId },
        payload: Schema.Array(ClassImportRowSchema),
        success: ImportBatchReportHttpSchema
      }
    ).pipe((e) => e.annotate(RequiredPermission, requiresPermission(e, importsRequirement))),
    HttpApiEndpoint.get(
      "classImportBatchReport",
      "/schools/:schoolId/imports/classes/:batchId/report",
      { params: batchParams, success: ImportBatchReportHttpSchema }
    ).pipe((e) => e.annotate(RequiredPermission, requiresPermission(e, importsRequirement))),
    HttpApiEndpoint.post(
      "commitClassImportBatch",
      "/schools/:schoolId/imports/classes/:batchId/commit",
      { params: batchParams, success: Schema.Void }
    ).pipe((e) => e.annotate(RequiredPermission, requiresPermission(e, importsRequirement))),
    HttpApiEndpoint.post(
      "retryClassImportBatch",
      "/schools/:schoolId/imports/classes/:batchId/retry",
      { params: batchParams, success: Schema.Void }
    ).pipe((e) => e.annotate(RequiredPermission, requiresPermission(e, importsRequirement)))
  )
{}
