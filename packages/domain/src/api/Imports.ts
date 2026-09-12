import { RequiredPermission, requiresPermission } from "@qadi/http/RequirePermission"
import * as Schema from "effect/Schema"
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi"
import { analyzeImportsPermission, canAnalyzeImports } from "../authorization/Policies.ts"
import { SchoolId } from "../Ids.ts"
import {
  GuardianImportRowSchema,
  GuardianRowResultHttpSchema,
  StudentAnalysisResultHttpSchema,
  StudentImportRowSchema
} from "../StudentGuardianImport.ts"

/**
 * Issue #38: the `imports` group's first two endpoints — `analyzeGuardians`/
 * `analyzeStudents` — backed directly by `StudentGuardianImport.ts`'s
 * `analyzeGuardianRows`/`analyzeStudentRows`. `commitImportBatch` is
 * deliberately not exposed here (ADR-ZS-106: commit is async, via
 * ADR-ZS-099's not-yet-built worker infrastructure, and a synchronous
 * stand-in would misrepresent that design).
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
    ).pipe((e) => e.annotate(RequiredPermission, requiresPermission(e, importsRequirement)))
  )
{}
