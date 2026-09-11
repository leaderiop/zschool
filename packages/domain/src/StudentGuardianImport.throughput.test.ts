import { describe, expect, it } from "@effect/vitest"
import { AppSqlLive } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { analyzeGuardianRows, type GuardianImportRow } from "./StudentGuardianImport.ts"

/**
 * Issue #37's one request-count assertion — everywhere else, "how many SQL
 * statements ran" is an implementation detail this suite deliberately never
 * asserts on. Here it's the entire point: proving the batched
 * `find_guardian_by_mobile` lookup (`Identity.ts`) actually coalesces a
 * whole import batch into a small, bounded number of round trips instead of
 * one per row.
 *
 * Wraps the real `SqlClient` (via `AppSqlLive`, the same role
 * `analyzeGuardianRows` runs under in production) with a counting `Proxy`
 * around its callable tagged-template interface — cheap and precise here
 * because `SqlResolver.grouped`'s `execute` callback calls `sql\`...\`` (with
 * the literal query text available synchronously in `strings`, before any
 * compilation or network round trip) exactly once per batch, so counting
 * calls whose text names `find_guardian_by_mobile` counts batches directly.
 */
const countingSqlClientLayer = (counts: { findGuardianByMobile: number }) =>
  Layer.effect(
    SqlClient,
    Effect.map(SqlClient, (real) =>
      new Proxy(real, {
        apply(target, thisArg, args) {
          const [strings] = args as [TemplateStringsArray]
          if (Array.isArray(strings) && strings.join(" ").includes("find_guardian_by_mobile")) {
            counts.findGuardianByMobile++
          }
          return Reflect.apply(target as (...a: Array<unknown>) => unknown, thisArg, args)
        }
      }))
  ).pipe(Layer.provide(AppSqlLive))

const guardianRow = (n: number): GuardianImportRow => ({
  rowId: `g${n}`,
  firstName: `Guardian${n}`,
  lastName: "Throughput",
  dateOfBirth: "1985-01-01",
  // Distinct, valid E.164 numbers — none pre-exist, so every row takes the
  // same "no phone match, fall through to name matching" path, keeping the
  // batched lookup itself the only thing under test.
  mobileNumber: `+2126${String(10000000 + n).padStart(8, "0")}`
})

describe("StudentGuardianImport throughput (issue #37)", () => {
  it.effect("analyzing 20 distinct-phone-number guardian rows batches the phone lookup, not one query per row", () =>
    Effect.gen(function*() {
      const counts = { findGuardianByMobile: 0 }
      const rows = Array.from({ length: 20 }, (_, i) => guardianRow(i))

      const results = yield* analyzeGuardianRows(rows).pipe(Effect.provide(countingSqlClientLayer(counts)))

      // Behavior is unchanged regardless of how the lookup is batched: no
      // phone number pre-exists, so every row is analyzed successfully
      // (creatable, absent a coincidental name/DOB match with a fixture from
      // another test in this same testcontainers run).
      expect(results).toHaveLength(20)

      expect(counts.findGuardianByMobile).toBeGreaterThan(0)
      expect(counts.findGuardianByMobile).toBeLessThan(rows.length)
    }))
})
