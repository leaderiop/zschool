import { describe, expect, it } from "@effect/vitest"
import { NodeCrypto } from "@effect/platform-node"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  createClass,
  createGroup,
  deactivateClass,
  deleteClass,
  EnrollmentsExistError,
  findClassByLevelAndLabel,
  findClassByLevelLabelAndTrack,
  findLevelByCode,
  findTrackByCode,
  levelCapacity,
  renameClass,
  renameLevel
} from "./AcademicTree.ts"

const NIL = "00000000-0000-0000-0000-000000000000"

/** A seed row's id — via Effect's `Crypto` service, not a bare global, so it's provided (`NodeCrypto.layer` below) like every other dependency. */
const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

/** A director's `Qadi.assert` context, scoped to `schoolId` — every command function under test (`createClass`, `renameClass`, ...) is gated by `Ownership.ts`'s `authorized`. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/**
 * Seeds one school → academic year → section → cycle → level → track →
 * class chain via raw SQL and runs `use` inside `withSchool` (needed for
 * every insert below the top-level `schools` row, and for the lookups
 * themselves, to satisfy each table's RLS policy) — enough for the "found"
 * tests below to have a real row to decode.
 */
const withSeededClass = Effect.fn(function*<A, E, R>(
  use: (
    seed: { schoolId: string; academicYearId: string; levelId: string; trackId: string; classId: string }
  ) => Effect.Effect<A, E, R>
) {
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
      return yield* use({
        schoolId: school.id,
        academicYearId: year.id,
        levelId: level.id,
        trackId: track.id,
        classId: cls.id
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

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

/**
 * Ticket #3's own acceptance criteria, exercised end to end against real
 * seeded rows — until now only the read-only lookup functions above had
 * regression coverage; `createClass`/`createGroup`/`levelCapacity`/
 * `renameClass`/`renameLevel`/`deactivateClass`/`deleteClass` (the actual
 * behaviors the criteria describe) had none.
 */
describe("AcademicTree commands (ticket #3)", () => {
  it.effect("a director can create a Class under a Level with a label and capacity, and a Group within it", () =>
    withSeededClass(({ academicYearId, levelId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const director = asDirectorOf(schoolId)

        const classId = yield* createClass({
          schoolId,
          academicYearId,
          levelId,
          label: "6AP-2",
          capacity: 25
        }).pipe(Effect.provide(director))

        const [created] = yield* sql<{ label: string; capacity: number; track_id: string | null }>`
          SELECT label, capacity, track_id FROM classes WHERE id = ${classId}
        `
        expect(created).toEqual({ label: "6AP-2", capacity: 25, track_id: null })

        const groupId = yield* createGroup({
          schoolId,
          academicYearId,
          classId,
          code: "EN",
          name: "English",
          groupType: "language"
        }).pipe(Effect.provide(director))

        const [group] = yield* sql<{ class_id: string; group_type: string }>`
          SELECT class_id, group_type FROM groups WHERE id = ${groupId}
        `
        expect(group).toEqual({ class_id: classId, group_type: "language" })
      })
    ))

  it.effect("a level's capacity is the sum of its active classes' capacities, excluding a deactivated one", () =>
    withSeededClass(({ academicYearId, classId, levelId, schoolId }) =>
      Effect.gen(function*() {
        const director = asDirectorOf(schoolId)
        // `withSeededClass` already seeded one class of capacity 30.
        yield* createClass({
          schoolId,
          academicYearId,
          levelId,
          label: "6AP-3",
          capacity: 20
        }).pipe(Effect.provide(director))

        expect(yield* levelCapacity(schoolId, levelId)).toBe(50)

        yield* deactivateClass(schoolId, classId).pipe(Effect.provide(director))
        expect(yield* levelCapacity(schoolId, levelId)).toBe(20)
      })
    ))

  it.effect("renaming a Class/Level is logged to structure_audit_log and never breaks the row's id", () =>
    withSeededClass(({ classId, levelId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const director = asDirectorOf(schoolId)

        yield* renameClass(schoolId, classId, "6AP-1 Renamed").pipe(Effect.provide(director))
        yield* renameLevel(schoolId, levelId, "Sixième Année Primaire (Renamed)").pipe(Effect.provide(director))

        const [cls] = yield* sql<{ id: string; label: string }>`SELECT id, label FROM classes WHERE id = ${classId}`
        expect(cls).toEqual({ id: classId, label: "6AP-1 Renamed" })

        const auditRows = yield* sql<{ entity_type: string; entity_id: string; action: string }>`
          SELECT entity_type, entity_id, action FROM structure_audit_log
          WHERE school_id = ${schoolId} AND action = 'renamed'
          ORDER BY entity_type
        `
        expect(auditRows).toEqual([
          { entity_type: "class", entity_id: classId, action: "renamed" },
          { entity_type: "level", entity_id: levelId, action: "renamed" }
        ])
      })
    ))

  it.effect("deleting a Class rejects with EnrollmentsExistError when it has an active enrollment; deactivation is unaffected", () =>
    withSeededClass(({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const director = asDirectorOf(schoolId)

        // No `RETURNING` on the `persons` insert: a brand-new person has no
        // `Enrollment`/relationship yet, so `person_select`'s RLS policy
        // can't make a just-inserted row visible for `RETURNING` to return
        // (same chicken-and-egg `Identity.ts`'s `createPerson` documents) —
        // a client-generated id sidesteps that instead.
        const personId = yield* randomUUID
        yield* sql`
          INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${personId}, 'Occupant', 'Student', '2015-01-01')
        `
        yield* sql`
          INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
          VALUES (${schoolId}, ${academicYearId}, '2026-2027', ${personId}, ${classId}, 'active', '2026-09-01')
        `

        const failure = yield* deleteClass(schoolId, classId).pipe(Effect.provide(director), Effect.flip)
        expect(failure).toBeInstanceOf(EnrollmentsExistError)

        // Deactivation remains the offered alternative, and still works.
        yield* deactivateClass(schoolId, classId).pipe(Effect.provide(director))
        const [cls] = yield* sql<{ is_active: boolean }>`SELECT is_active FROM classes WHERE id = ${classId}`
        expect(cls.is_active).toBe(false)
      })
    ))

  it.effect("deleting a Class with no enrollments succeeds and is logged", () =>
    withSeededClass(({ academicYearId, levelId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const director = asDirectorOf(schoolId)

        const classId = yield* createClass({
          schoolId,
          academicYearId,
          levelId,
          label: "Empty Class",
          capacity: 10
        }).pipe(Effect.provide(director))

        yield* deleteClass(schoolId, classId).pipe(Effect.provide(director))

        const remaining = yield* sql<{ id: string }>`SELECT id FROM classes WHERE id = ${classId}`
        expect(remaining).toHaveLength(0)

        const [audit] = yield* sql<{ action: string }>`
          SELECT action FROM structure_audit_log WHERE entity_id = ${classId} AND action = 'deleted'
        `
        expect(audit).toEqual({ action: "deleted" })
      })
    ))
})
