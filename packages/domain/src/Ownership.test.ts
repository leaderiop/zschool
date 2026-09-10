import { assert, describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { decodeOwnedRow, RowWithId } from "./Ownership.ts"

/**
 * Isolated proof of the `decodeOwnedRow` decode boundary `requireOwnedRow`
 * (issue #27) builds on — no live `SqlClient`/database needed.
 */
describe("Ownership schema decode boundary", () => {
  it.effect("decodeOwnedRow decodes a row matching the schema", () =>
    Effect.gen(function*() {
      const row = yield* decodeOwnedRow(RowWithId, { id: "11111111-1111-1111-1111-111111111111" })
      assert.deepStrictEqual(row, { id: "11111111-1111-1111-1111-111111111111" })
    }))

  it.effect("decodeOwnedRow surfaces a column-shape mismatch as a clear decode failure, not a silently-missing field", () =>
    Effect.gen(function*() {
      // `id` present as the wrong type — a compile-time-only cast would have
      // silently trusted this as a `string` and let a caller read a number
      // where it expected one; the schema decode instead fails outright.
      const error = yield* Effect.flip(decodeOwnedRow(RowWithId, { id: 12345 }))
      assert.isTrue(Schema.isSchemaError(error))
      assert.isTrue(error.message.length > 0)
    }))

  it.effect("decodeOwnedRow surfaces a missing required field as a clear decode failure", () =>
    Effect.gen(function*() {
      const error = yield* Effect.flip(decodeOwnedRow(RowWithId, {}))
      assert.isTrue(Schema.isSchemaError(error))
    }))
})
