import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { analyzeTeacherRows, commitTeacherImportBatch, type TeacherImportRow } from "./TeacherImport.ts"

/** Same `authorized`-gating context as `ImportBatch.test.ts`'s own `asDirectorOf`. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/**
 * Ground-truth check scoped to one school's own `app.current_school_id`,
 * via the same `AppSqlLive` connection the whole test already runs on —
 * NOT a separate owner connection (`fr-ped-13`'s own `asOwner` pattern):
 * `withSeededSchool` deliberately keeps the whole test body inside one
 * still-open transaction (matching `ImportBatch.test.ts`'s `withSeededLevel`),
 * so a second connection/role would see none of its uncommitted writes yet.
 */
const membershipCountAt = (schoolId: string, personId: string) =>
  withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const [{ count }] = yield* sql<{ count: string }>`
        SELECT count(*)::int AS count FROM school_memberships WHERE person_id = ${personId}
      `
      return Number(count)
    })
  )

/**
 * Same shape as `ImportBatch.test.ts`'s `withSeededLevel` — `AppSqlLive` is
 * baked in via `Effect.fn`'s second argument so every call site stays free
 * of a leftover `SqlClient` requirement. `use` runs inside the same
 * `withSchool` scope this seeds (matching `withSeededLevel`'s own nesting),
 * so a plain ambient `sql` query inside `use` — e.g. a ground-truth
 * assertion after commit — still has `app.current_school_id` set, rather
 * than hitting `tenant_isolation`'s `current_setting(...)::uuid` cast with
 * nothing set.
 */
const withSeededSchool = Effect.fn(function*<A, E, R>(
  use: (schoolId: string) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<
    { id: string }
  >`INSERT INTO schools (name) VALUES ('TeacherImport test school') RETURNING id`
  return yield* withSchool(school.id, use(school.id))
}, Effect.provide(AppSqlLive))

describe("TeacherImport", () => {
  it.effect(
    "a creatable row is invited: a Person, a TeacherProfile, and an invited SchoolMembership are created",
    () =>
      withSeededSchool((schoolId) =>
        Effect.gen(function*() {
          const sql = yield* SqlClient
          const row: TeacherImportRow = {
            rowId: "t1",
            firstName: "Karim",
            lastName: "Sefrioui",
            dateOfBirth: "1985-04-01",
            massarCode: "T100001"
          }

          const analysis = yield* analyzeTeacherRows([row])
          expect(analysis).toEqual([{ rowId: "t1", status: "creatable" }])

          const results = yield* commitTeacherImportBatch(schoolId, [row]).pipe(
            Effect.provide(asDirectorOf(schoolId))
          )
          expect(results).toHaveLength(1)
          expect(results[0].status).toBe("invited")
          if (results[0].status !== "invited") throw new Error("unreachable")

          const [membership] = yield* sql<{ status: string; role: string }>`
          SELECT status, role FROM school_memberships WHERE person_id = ${results[0].personId}
        `
          expect(membership).toEqual({ status: "invited", role: "teacher" })

          const [profile] = yield* sql<{ count: string }>`
          SELECT count(*)::int AS count FROM teacher_profiles WHERE person_id = ${results[0].personId}
        `
          expect(Number(profile.count)).toBe(1)
        })
      )
  )

  it.effect("a Massar-code strong match is proposed, never auto-linked, and no duplicate Person is created", () =>
    withSeededSchool((schoolA) =>
      Effect.gen(function*() {
        const row: TeacherImportRow = {
          rowId: "t1",
          firstName: "Nadia",
          lastName: "Chami",
          dateOfBirth: "1980-01-01",
          massarCode: "T200001"
        }
        const first = yield* commitTeacherImportBatch(schoolA, [row]).pipe(Effect.provide(asDirectorOf(schoolA)))
        expect(first[0].status).toBe("invited")
        if (first[0].status !== "invited") throw new Error("unreachable")
        const existingPersonId = first[0].personId

        const schoolB = yield* withSeededSchool((id) => Effect.succeed(id))
        const secondRow: TeacherImportRow = { ...row, rowId: "t2" }

        const analysis = yield* analyzeTeacherRows([secondRow])
        expect(analysis[0].status).toBe("strong_match_awaiting_confirmation")

        const unconfirmed = yield* commitTeacherImportBatch(schoolB, [secondRow]).pipe(
          Effect.provide(asDirectorOf(schoolB))
        )
        expect(unconfirmed[0].status).toBe("awaiting_confirmation")

        const confirmedRow: TeacherImportRow = { ...secondRow, confirmedMatchPersonId: existingPersonId }
        const confirmed = yield* commitTeacherImportBatch(schoolB, [confirmedRow]).pipe(
          Effect.provide(asDirectorOf(schoolB))
        )
        expect(confirmed[0].status).toBe("invited")
        if (confirmed[0].status !== "invited") throw new Error("unreachable")
        expect(confirmed[0].personId).toBe(existingPersonId)

        const sql = yield* SqlClient
        const [{ count: massarCount }] = yield* sql<{ count: string }>`
          SELECT count(*)::int AS count FROM persons WHERE massar_code = 'T200001'
        `
        expect(Number(massarCount)).toBe(1)

        // ADR-ZS-016: simultaneous affiliations at different schools are
        // both allowed and expected — this teacher now holds a distinct
        // SchoolMembership row at each of the two schools.
        expect(yield* membershipCountAt(schoolA, existingPersonId)).toBe(1)
        expect(yield* membershipCountAt(schoolB, existingPersonId)).toBe(1)
      })
    ))

  it.effect("re-committing an already-invited row is idempotent — no duplicate SchoolMembership", () =>
    withSeededSchool((schoolId) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const row: TeacherImportRow = {
          rowId: "t1",
          firstName: "Younes",
          lastName: "Berrada",
          dateOfBirth: "1990-06-15"
        }
        const first = yield* commitTeacherImportBatch(schoolId, [row]).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(first[0].status).toBe("invited")
        if (first[0].status !== "invited") throw new Error("unreachable")

        const retryRow: TeacherImportRow = { ...row, confirmedMatchPersonId: first[0].personId }
        const second = yield* commitTeacherImportBatch(schoolId, [retryRow]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(second[0].status).toBe("invited")

        const [{ count }] = yield* sql<{ count: string }>`
          SELECT count(*)::int AS count FROM school_memberships WHERE person_id = ${first[0].personId}
        `
        expect(Number(count)).toBe(1)
      })
    ))

  it.effect("a missing required field is rejected with a reason naming that field", () =>
    Effect.gen(function*() {
      const analysis = yield* analyzeTeacherRows([{
        rowId: "t1",
        firstName: "",
        lastName: "Amrani",
        dateOfBirth: "1990-01-01"
      }])
      expect(analysis[0].status).toBe("error")
      if (analysis[0].status !== "error") throw new Error("unreachable")
      expect(analysis[0].error.reason).toContain("firstName")
    }).pipe(Effect.provide(AppSqlLive)))
})
