import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  assignMembershipToCycle,
  findActiveCycleIds,
  inviteTeacherMembership,
  unassignMembershipFromCycle
} from "./SchoolMembership.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

/** Seeds a school, one cycle, one teacher `Person`, and their (invited) `SchoolMembership` row. */
const withMembershipAndCycle = Effect.fn(function*<A, E, R>(
  use: (seed: { schoolId: string; membershipId: string; cycleId: string; directorPersonId: string }) => Effect.Effect<
    A,
    E,
    R
  >
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #94 test school') RETURNING id
  `
  return yield* withSchool(
    school.id,
    Effect.gen(function*() {
      const [year] = yield* sql<{ id: string }>`
        INSERT INTO academic_years (school_id, label) VALUES (${school.id}, '2020-2021') RETURNING id
      `
      const [section] = yield* sql<{ id: string }>`
        INSERT INTO sections (school_id, academic_year_id, template, name)
        VALUES (${school.id}, ${year.id}, 'national', 'National') RETURNING id
      `
      const [cycle] = yield* sql<{ id: string }>`
        INSERT INTO cycles (school_id, academic_year_id, section_id, code, name, sort_order)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'PRIM', 'Primary', 1) RETURNING id
      `

      const teacherPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${teacherPersonId}, 'Samira', 'Teacher', '1985-01-01')
      `
      yield* inviteTeacherMembership(school.id, teacherPersonId)
      const [membership] = yield* sql<{ id: string }>`
        SELECT id FROM school_memberships WHERE school_id = ${school.id} AND person_id = ${teacherPersonId}
      `

      const directorPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${directorPersonId}, 'Director', 'One', '1975-01-01')
      `

      return yield* use({
        schoolId: school.id,
        membershipId: membership.id,
        cycleId: cycle.id,
        directorPersonId
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("SchoolMembership cycle scoping (ticket #94)", () => {
  it.effect("a fresh membership has no active cycle assignment (whole-school scope)", () =>
    withMembershipAndCycle(({ membershipId }) =>
      Effect.gen(function*() {
        const cycleIds = yield* findActiveCycleIds(membershipId)
        expect(cycleIds).toEqual([])
      })
    ))

  it.effect("assigning a membership to a cycle makes it active", () =>
    withMembershipAndCycle(({ cycleId, directorPersonId, membershipId, schoolId }) =>
      Effect.gen(function*() {
        yield* assignMembershipToCycle(schoolId, membershipId, cycleId, directorPersonId)
        const cycleIds = yield* findActiveCycleIds(membershipId)
        expect(cycleIds).toEqual([cycleId])
      })
    ))

  it.effect("assigning the same (membership, cycle) pair twice is idempotent", () =>
    withMembershipAndCycle(({ cycleId, directorPersonId, membershipId, schoolId }) =>
      Effect.gen(function*() {
        yield* assignMembershipToCycle(schoolId, membershipId, cycleId, directorPersonId)
        yield* assignMembershipToCycle(schoolId, membershipId, cycleId, directorPersonId)
        const cycleIds = yield* findActiveCycleIds(membershipId)
        expect(cycleIds).toEqual([cycleId])
      })
    ))

  it.effect("unassigning closes the row rather than deleting it, reverting to whole-school scope", () =>
    withMembershipAndCycle(({ cycleId, directorPersonId, membershipId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* assignMembershipToCycle(schoolId, membershipId, cycleId, directorPersonId)
        yield* unassignMembershipFromCycle(membershipId, cycleId)

        const cycleIds = yield* findActiveCycleIds(membershipId)
        expect(cycleIds).toEqual([])

        const rows = yield* withSchool(
          schoolId,
          sql<{ count: string }>`
            SELECT count(*)::int AS count FROM school_membership_cycles
            WHERE school_membership_id = ${membershipId} AND cycle_id = ${cycleId}
          `
        )
        expect(Number(rows[0].count)).toBe(1)
      })
    ))
})
