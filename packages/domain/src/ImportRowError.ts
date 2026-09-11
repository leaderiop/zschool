import * as Schema from "effect/Schema"

/**
 * One shared "this row failed" shape (issue #34) — `ClassImportAnalysis.ts`,
 * and `StudentGuardianImport.ts`'s guardian and student pipelines each used
 * to declare their own independent `{status: "error"; reason: string}`
 * variant; a fourth import domain would otherwise have reinvented a fourth,
 * slightly different one. `cause` carries the underlying decode/SQL failure
 * when there is one (`Schema.Defect()` since that failure's own shape varies
 * by source — a `Schema.SchemaError`, a `SqlError`'s reason, etc. — and isn't
 * itself meant to cross a further boundary, only to be logged/inspected).
 */
export class ImportRowError extends Schema.TaggedError<ImportRowError>()("ImportRowError", {
  reason: Schema.String,
  cause: Schema.optional(Schema.Defect())
}) {}
