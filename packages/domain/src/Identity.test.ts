import { assert, describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { GuardianMatchRow, PersonMatchRow } from "./Identity.ts"

/**
 * Isolated proof of the `SqlSchema`/`Schema` decode boundary
 * `findPersonMatches`/`findGuardianMatch` build on (issue #24) — no live
 * `SqlClient` needed, `execute` is stubbed with fixed unknown-shaped rows,
 * same style as effect's own `SqlSchema.test.ts`.
 */
describe("Identity schema decode boundary", () => {
  it.effect("PersonMatchRow decodes a valid find_person_matches row", () =>
    Effect.gen(function*() {
      const query = SqlSchema.findAll({
        Request: Schema.Void,
        Result: PersonMatchRow,
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
          person_id: "11111111-1111-1111-1111-111111111111",
          first_name: "Youssef",
          last_name: "Alaoui",
          date_of_birth: "2014-05-10",
          massar_code: "M100001",
          match_kind: "strong"
        }
      ])
    }))

  it.effect("PersonMatchRow decodes a null massar_code", () =>
    Effect.gen(function*() {
      const query = SqlSchema.findAll({
        Request: Schema.Void,
        Result: PersonMatchRow,
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
      assert.strictEqual(row.massar_code, null)
      assert.strictEqual(row.match_kind, "weak")
    }))

  it.effect("PersonMatchRow fails to decode an unexpected match_kind", () =>
    Effect.gen(function*() {
      const query = SqlSchema.findAll({
        Request: Schema.Void,
        Result: PersonMatchRow,
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

  it.effect("GuardianMatchRow decodes the first row as Some", () =>
    Effect.gen(function*() {
      const query = SqlSchema.findOneOption({
        Request: Schema.Void,
        Result: GuardianMatchRow,
        execute: () => Effect.succeed([{ person_id: "33333333-3333-3333-3333-333333333333" }])
      })

      const result = yield* query(undefined)
      assert.isTrue(Option.isSome(result))
      assert.strictEqual(Option.getOrUndefined(result)?.person_id, "33333333-3333-3333-3333-333333333333")
    }))

  it.effect("GuardianMatchRow decodes no rows as None", () =>
    Effect.gen(function*() {
      const query = SqlSchema.findOneOption({
        Request: Schema.Void,
        Result: GuardianMatchRow,
        execute: () => Effect.succeed([])
      })

      const result = yield* query(undefined)
      assert.isTrue(Option.isNone(result))
    }))
})
