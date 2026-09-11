import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"

/**
 * A field required on insert/select but optional (a partial-update PATCH
 * field) on update — shared by `GradingScales.ts` (issue #36, the pattern's
 * origin) and `SubjectLevelConfigs.ts` (issue #40), rather than each keeping
 * its own copy: a future change to how PATCH-optional fields are modeled
 * only has one definition to update.
 */
export const optionalOnUpdate = <S extends Schema.Top>(schema: S) =>
  Model.Field({
    select: schema,
    insert: schema,
    update: Schema.optional(schema),
    json: schema,
    jsonCreate: schema,
    jsonUpdate: Schema.optional(schema)
  })
