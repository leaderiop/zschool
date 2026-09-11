import { describe, expect, it } from "@effect/vitest"
import { AppSqlLive } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import {
  findClassByLevelAndLabel,
  findClassByLevelLabelAndTrack,
  findLevelByCode,
  findTrackByCode
} from "./AcademicTree.ts"

const NIL = "00000000-0000-0000-0000-000000000000"

/**
 * Issue #39's regression coverage for the shared `Level`/`Track`/`Class`
 * lookup functions `ClassImportAnalysis.ts`'s `analyzeRow` and
 * `StudentGuardianImport.ts`'s `resolveClass` now both share, instead of
 * each hand-writing their own `sql<{id: string}>` queries against these
 * tables: the "not found" path each one relies on still returns cleanly.
 *
 * No fixture/seed data needed: none of these functions call `withSchool`
 * themselves (that's the caller's job, same as before this migration), so
 * without it setting the RLS session GUC, every lookup here correctly sees
 * zero rows regardless of what the database actually contains (same
 * reasoning `GradingScales.test.ts`'s own not-found regression test relies
 * on). The "found" path is already exercised end-to-end, against real
 * seeded data, by the fr-ped-02/fr-ped-09/fr-ped-13 BDD scenarios that
 * create classes and run class/guardian import against these same tables.
 */
describe("AcademicTree shared lookups (issue #39)", () => {
  it.effect("findLevelByCode returns None for an unmatched code", () =>
    Effect.gen(function*() {
      const result = yield* findLevelByCode(NIL, "NOPE")
      expect(Option.isNone(result)).toBe(true)
    }).pipe(Effect.provide(AppSqlLive)))

  it.effect("findTrackByCode returns None for an unmatched code", () =>
    Effect.gen(function*() {
      const result = yield* findTrackByCode(NIL, NIL, "NOPE")
      expect(Option.isNone(result)).toBe(true)
    }).pipe(Effect.provide(AppSqlLive)))

  it.effect("findClassByLevelAndLabel returns None for an unmatched label", () =>
    Effect.gen(function*() {
      const result = yield* findClassByLevelAndLabel(NIL, NIL, "Unmatched")
      expect(Option.isNone(result)).toBe(true)
    }).pipe(Effect.provide(AppSqlLive)))

  it.effect("findClassByLevelLabelAndTrack returns None for an unmatched (label, track)", () =>
    Effect.gen(function*() {
      const result = yield* findClassByLevelLabelAndTrack(NIL, NIL, "Unmatched", null)
      expect(Option.isNone(result)).toBe(true)
    }).pipe(Effect.provide(AppSqlLive)))
})
