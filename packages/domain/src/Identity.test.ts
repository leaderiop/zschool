import { assert, describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { GuardianMatch, isValidE164, PersonMatch } from "./Identity.ts"

/**
 * Isolated proof of the `SqlSchema`/`Schema` decode boundary
 * `findPersonMatches`/`findGuardianMatch` build on (issue #24) — no live
 * `SqlClient` needed, `execute` is stubbed with fixed unknown-shaped rows,
 * same style as effect's own `SqlSchema.test.ts`.
 *
 * `PersonMatch`/`GuardianMatch` decode straight from the DB's snake_case row
 * shape to the application's camelCase shape via `Schema.encodeKeys` (issue
 * #34) — these assertions prove that fold behaves identically to the
 * hand-written `.map` it replaced, on the same fixed inputs.
 */
describe("Identity schema decode boundary", () => {
  it.effect("PersonMatch decodes a valid find_person_matches row into its camelCase shape", () =>
    Effect.gen(function*() {
      const query = SqlSchema.findAll({
        Request: Schema.Void,
        Result: PersonMatch,
        execute: () =>
          Effect.succeed([
            {
              person_id: "11111111-1111-1111-1111-111111111111",
              first_name: "Youssef",
              last_name: "Alaoui",
              date_of_birth: "2014-05-10",
              massar_code: "M100001",
              match_kind: "strong"
            }
          ])
      })

      const rows = yield* query(undefined)
      assert.deepStrictEqual(rows, [
        {
          personId: "11111111-1111-1111-1111-111111111111",
          firstName: "Youssef",
          lastName: "Alaoui",
          dateOfBirth: "2014-05-10",
          massarCode: "M100001",
          matchKind: "strong"
        }
      ])
    }))

  it.effect("PersonMatch decodes a null massar_code", () =>
    Effect.gen(function*() {
      const query = SqlSchema.findAll({
        Request: Schema.Void,
        Result: PersonMatch,
        execute: () =>
          Effect.succeed([
            {
              person_id: "22222222-2222-2222-2222-222222222222",
              first_name: "Amina",
              last_name: "Tazi",
              date_of_birth: "2015-03-01",
              massar_code: null,
              match_kind: "weak"
            }
          ])
      })

      const [row] = yield* query(undefined)
      assert.strictEqual(row.massarCode, null)
      assert.strictEqual(row.matchKind, "weak")
    }))

  it.effect("PersonMatch fails to decode an unexpected match_kind", () =>
    Effect.gen(function*() {
      const query = SqlSchema.findAll({
        Request: Schema.Void,
        Result: PersonMatch,
        execute: () =>
          Effect.succeed([
            {
              person_id: "1",
              first_name: "A",
              last_name: "B",
              date_of_birth: "2020-01-01",
              massar_code: null,
              match_kind: "exact"
            }
          ])
      })

      const error = yield* Effect.flip(query(undefined))
      assert.isTrue(Schema.isSchemaError(error))
    }))

  it.effect("GuardianMatch decodes the first row as Some, in its camelCase shape", () =>
    Effect.gen(function*() {
      const query = SqlSchema.findOneOption({
        Request: Schema.Void,
        Result: GuardianMatch,
        execute: () => Effect.succeed([{ person_id: "33333333-3333-3333-3333-333333333333" }])
      })

      const result = yield* query(undefined)
      assert.isTrue(Option.isSome(result))
      assert.strictEqual(Option.getOrUndefined(result)?.personId, "33333333-3333-3333-3333-333333333333")
    }))

  it.effect("GuardianMatch decodes no rows as None", () =>
    Effect.gen(function*() {
      const query = SqlSchema.findOneOption({
        Request: Schema.Void,
        Result: GuardianMatch,
        execute: () => Effect.succeed([])
      })

      const result = yield* query(undefined)
      assert.isTrue(Option.isNone(result))
    }))

  describe("isValidE164", () => {
    it("accepts a well-formed E.164 number", () => {
      assert.isTrue(isValidE164("+212612345678"))
    })

    it("rejects a number missing the leading +", () => {
      assert.isFalse(isValidE164("212612345678"))
    })

    it("rejects a number with a leading zero after the country code", () => {
      assert.isFalse(isValidE164("+0212612345678"))
    })
  })
})
