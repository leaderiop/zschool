import { describe, expect, it } from "@effect/vitest"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  findClassByLevelAndLabel,
  findClassByLevelLabelAndTrack,
  findLevelByCode,
  findTrackByCode
} from "./AcademicTree.ts"

const NIL = "00000000-0000-0000-0000-000000000000"

/**
 * Seeds one school → academic year → section → cycle → level → track →
 * class chain via raw SQL and runs `use` inside `withSchool` (needed for
 * every insert below the top-level `schools` row, and for the lookups
 * themselves, to satisfy each table's RLS policy) — enough for the "found"
 * tests below to have a real row to decode.
 */
const withSeededClass = <A, E, R>(
  use: (seed: { schoolId: string; levelId: string; trackId: string; classId: string }) => Effect.Effect<A, E, R>
) =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<
      { id: string }
    >`INSERT INTO schools (name) VALUES ('AcademicTree test school') RETURNING id`
    return yield* withSchool(
      school.id,
      Effect.gen(function*() {
        const [year] = yield* sql<{ id: string }>`
          INSERT INTO academic_years (school_id, label) VALUES (${school.id}, '2026-2027') RETURNING id
        `
        const [section] = yield* sql<{ id: string }>`
          INSERT INTO sections (school_id, academic_year_id, template, name)
          VALUES (${school.id}, ${year.id}, 'national', 'National') RETURNING id
        `
        const [cycle] = yield* sql<{ id: string }>`
          INSERT INTO cycles (school_id, academic_year_id, section_id, code, name, sort_order)
          VALUES (${school.id}, ${year.id}, ${section.id}, 'PRIM', 'Primary', 1) RETURNING id
        `
        const [level] = yield* sql<{ id: string }>`
          INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
          VALUES (${school.id}, ${year.id}, ${cycle.id}, '6AP', '6ème Année Primaire', 1) RETURNING id
        `
        const [track] = yield* sql<{ id: string }>`
          INSERT INTO tracks (school_id, academic_year_id, level_id, code, name)
          VALUES (${school.id}, ${year.id}, ${level.id}, 'SCI', 'Sciences') RETURNING id
        `
        const [cls] = yield* sql<{ id: string }>`
          INSERT INTO classes (school_id, academic_year_id, level_id, track_id, label, capacity)
          VALUES (${school.id}, ${year.id}, ${level.id}, ${track.id}, '6AP-1', 30) RETURNING id
        `
        return yield* use({ schoolId: school.id, levelId: level.id, trackId: track.id, classId: cls.id })
      })
    )
  }).pipe(Effect.provide(AppSqlLive))

/**
 * Issue #39's regression coverage for the shared `Level`/`Track`/`Class`
 * lookup functions `ClassImportAnalysis.ts`'s `analyzeRow` and
 * `StudentGuardianImport.ts`'s `resolveClass` now both share, instead of
 * each hand-writing their own `sql<{id: string}>` queries against these
 * tables — both the "not found" path each relies on, and the "found"
 * (decode) path, which no BDD scenario actually exercises for two of these
 * four functions: `analyzeClassImport` (the only caller of
 * `findClassByLevelAndLabel`) has zero callers anywhere in this repo today,
 * and `findTrackByCode`'s "found" branch only runs when a row supplies a
 * `trackCode`, which fr-ped-13's guardian/student import scenarios never
 * do. A prior version of this file's comment claimed BDD already covered
 * this — it didn't, for exactly these two.
 */
describe("AcademicTree shared lookups (issue #39)", () => {
  it.effect("findLevelByCode/findTrackByCode/findClassByLevelAndLabel/findClassByLevelLabelAndTrack decode a real seeded row", () =>
    withSeededClass(({ classId, levelId, schoolId, trackId }) =>
      Effect.gen(function*() {
        const level = yield* findLevelByCode(schoolId, "6AP")
        expect(Option.isSome(level)).toBe(true)
        if (Option.isSome(level)) expect(level.value.id).toBe(levelId)

        const track = yield* findTrackByCode(schoolId, levelId, "SCI")
        expect(Option.isSome(track)).toBe(true)
        if (Option.isSome(track)) expect(track.value.id).toBe(trackId)

        const duplicate = yield* findClassByLevelAndLabel(schoolId, levelId, "6AP-1")
        expect(Option.isSome(duplicate)).toBe(true)
        if (Option.isSome(duplicate)) expect(duplicate.value.id).toBe(classId)

        const exact = yield* findClassByLevelLabelAndTrack(schoolId, levelId, "6AP-1", trackId)
        expect(Option.isSome(exact)).toBe(true)
        if (Option.isSome(exact)) expect(exact.value.id).toBe(classId)

        // The same class, looked up as if it were untracked, must miss —
        // `track_id IS NOT DISTINCT FROM` is not a wildcard match.
        const wrongTrack = yield* findClassByLevelLabelAndTrack(schoolId, levelId, "6AP-1", null)
        expect(Option.isNone(wrongTrack)).toBe(true)
      })
    ))

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
