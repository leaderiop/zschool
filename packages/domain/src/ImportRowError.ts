import * as Schema from "effect/Schema"
import { isSqlError } from "effect/unstable/sql/SqlError"

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

/**
 * Issue #38: `cause`'s own doc comment above says it "isn't itself meant to
 * cross a further boundary, only to be logged/inspected" — an HTTP response
 * is exactly such a further boundary, and `Schema.Defect()`'s default
 * encoding includes the underlying failure's message (and, for a nested
 * `Error.cause`, that too), which can carry raw SQL/decode detail. A caller
 * only ever needs `reason` to render "this row failed"; `cause` stays for
 * server-side logging. Structurally narrower than `ImportRowError`, so
 * encoding an actual `ImportRowError` instance (which does carry `cause`)
 * against this schema simply omits it — no separate mapping step needed at
 * the API boundary.
 */
export const ImportRowErrorPublicSchema = Schema.Struct({
  _tag: Schema.tag("ImportRowError"),
  reason: Schema.String
})

/** A `SqlError`'s own reason tag is more specific than the generic "SqlError" tag; every other tagged failure just uses its own `_tag`. Shared by every import pipeline's per-row `Effect.result` handling so a transient infrastructure failure stays distinguishable from a data problem everywhere, not just in the pipeline that happened to define this first. */
export const failureReason = (failure: { readonly _tag: string }): string =>
  isSqlError(failure) ? failure.reason._tag : failure._tag
