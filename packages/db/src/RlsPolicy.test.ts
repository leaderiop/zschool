import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { AppSqlLive } from "./AppSql.ts"
import { withSchool } from "./SchoolScope.ts"
import { SqlLive } from "./Sql.ts"

/**
 * Issue #13's second test seam: proves the `person_select`/`relationship_select`
 * RLS policies (migration 0008, ADR-ZS-107) alone block a cross-tenant read of
 * `persons`/`parent_student_relationships` — independent of `@qadi` and every
 * domain-service function, which this file deliberately never imports (this
 * package, `@zschool/db`, cannot depend on `@zschool/domain` anyway — the
 * dependency runs the other way).
 *
 * Fixtures are seeded with raw SQL as `neondb_owner` (`SqlLive`, RLS-exempt),
 * replicating just enough of the FK chain (school -> academic_year -> section
 * -> cycle -> level -> class) for a real `Enrollment` row to exist. The
 * verification reads run as `zschool_service` (`AppSqlLive`) with the
 * `app.current_school_id` GUC set via `withSchool` — no `@qadi` check, no
 * domain function, just the RLS policy against a raw `SELECT`.
 *
 * Meaningful only since migration 0007: `zschool_service` doesn't carry
 * `BYPASSRLS` (unlike the `zschool_app` role this project used to run as,
 * which — via Neon's `neon_superuser` membership — bypassed RLS regardless
 * of what any policy said). Retroactively adding this suite for tickets
 * #2-#8's tenant_isolation-only tables is out of this ticket's scope.
 *
 * Runs against a persistent, shared Neon branch (per-PR ephemeral branching
 * isn't wired up yet — features/support/layers/db.ts), so the fixture is
 * deleted in a `finally` rather than left to accumulate across runs.
 */
interface Fixture {
  readonly schoolAId: string
  readonly schoolBId: string
  readonly studentPersonId: string
  readonly guardianPersonId: string
  readonly relationshipId: string
}

const seedFixture: Effect.Effect<Fixture, never, SqlClient> = Effect.gen(function*() {
  const sql = yield* SqlClient

  const [schoolA] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('RLS test school A') RETURNING id`
  const [schoolB] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('RLS test school B') RETURNING id`

  const [year] = yield* sql<{ id: string }>`
    INSERT INTO academic_years (school_id, label, status) VALUES (${schoolA.id}, '2026-2027', 'active') RETURNING id
  `
  const [section] = yield* sql<{ id: string }>`
    INSERT INTO sections (school_id, academic_year_id, template, name)
    VALUES (${schoolA.id}, ${year.id}, 'national', 'RLS test section') RETURNING id
  `
  const [cycle] = yield* sql<{ id: string }>`
    INSERT INTO cycles (school_id, academic_year_id, section_id, code, name, sort_order)
    VALUES (${schoolA.id}, ${year.id}, ${section.id}, 'C1', 'Cycle 1', 1) RETURNING id
  `
  const [level] = yield* sql<{ id: string }>`
    INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
    VALUES (${schoolA.id}, ${year.id}, ${cycle.id}, 'L1', 'Level 1', 1) RETURNING id
  `
  const [cls] = yield* sql<{ id: string }>`
    INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
    VALUES (${schoolA.id}, ${year.id}, ${level.id}, 'RLS-1', 30) RETURNING id
  `
  const [student] = yield* sql<{ id: string }>`
    INSERT INTO persons (first_name, last_name, date_of_birth) VALUES ('Rls', 'Student', '2010-01-01') RETURNING id
  `
  const [guardian] = yield* sql<{ id: string }>`
    INSERT INTO persons (first_name, last_name, date_of_birth) VALUES ('Rls', 'Guardian', '1980-01-01') RETURNING id
  `
  yield* sql`
    INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
    VALUES (${schoolA.id}, ${year.id}, '2026-2027', ${student.id}, ${cls.id}, 'active', '2020-01-01')
  `
  const [relationship] = yield* sql<{ id: string }>`
    INSERT INTO parent_student_relationships
      (guardian_person_id, student_person_id, relationship_type, is_legal_guardian, is_financial_guardian, is_custodial_guardian, is_emergency_contact, is_authorized_for_pickup)
    VALUES (${guardian.id}, ${student.id}, 'mother', true, true, false, false, false)
    RETURNING id
  `

  return {
    schoolAId: schoolA.id,
    schoolBId: schoolB.id,
    studentPersonId: student.id,
    guardianPersonId: guardian.id,
    relationshipId: relationship.id
  }
}).pipe(Effect.orDie)

/** Reverse-FK-order teardown so the shared Neon branch doesn't accumulate a growing set of RLS-test rows across runs. */
const deleteFixture = (fixture: Fixture): Effect.Effect<void, never, SqlClient> =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    yield* sql`DELETE FROM parent_student_relationships WHERE id = ${fixture.relationshipId}`
    yield* sql`DELETE FROM enrollments WHERE student_person_id = ${fixture.studentPersonId}`
    yield* sql`DELETE FROM classes WHERE school_id = ${fixture.schoolAId}`
    yield* sql`DELETE FROM levels WHERE school_id = ${fixture.schoolAId}`
    yield* sql`DELETE FROM cycles WHERE school_id = ${fixture.schoolAId}`
    yield* sql`DELETE FROM sections WHERE school_id = ${fixture.schoolAId}`
    yield* sql`DELETE FROM academic_years WHERE school_id = ${fixture.schoolAId}`
    yield* sql`DELETE FROM persons WHERE id IN (${fixture.studentPersonId}, ${fixture.guardianPersonId})`
    yield* sql`DELETE FROM schools WHERE id IN (${fixture.schoolAId}, ${fixture.schoolBId})`
  }).pipe(Effect.orDie)

describe("RLS policy enforcement (ADR-ZS-107)", () => {
  // Real network round trips to Postgres (Neon): seeding the FK chain, six
  // verification reads, and teardown, all on one connection per role —
  // comfortably exceeds vitest's 5s default, same rationale as the bdd
  // project's testTimeout in vitest.config.ts.
  it.effect(
    "blocks a cross-tenant read of persons and parent_student_relationships, while allowing the legitimate same-school read",
    () =>
      Effect.gen(function*() {
        const fixture = yield* seedFixture.pipe(Effect.provide(SqlLive))

        const verify = Effect.gen(function*() {
          const readAsSchool = (schoolId: string, personId: string) =>
            withSchool(
              schoolId,
              Effect.gen(function*() {
                const sql = yield* SqlClient
                return yield* sql<{ id: string }>`SELECT id FROM persons WHERE id = ${personId}`
              })
            )

          const readRelationshipAsSchool = (schoolId: string) =>
            withSchool(
              schoolId,
              Effect.gen(function*() {
                const sql = yield* SqlClient
                return yield* sql<
                  { id: string }
                >`SELECT id FROM parent_student_relationships WHERE id = ${fixture.relationshipId}`
              })
            )

          // Positive control FIRST — proves the policy actually allows the
          // legitimate same-school read, so the negative checks below prove
          // real tenant isolation rather than a policy that blocks everything.
          const studentAtA = yield* readAsSchool(fixture.schoolAId, fixture.studentPersonId)
          expect(studentAtA).toHaveLength(1)

          const guardianAtA = yield* readAsSchool(fixture.schoolAId, fixture.guardianPersonId)
          expect(guardianAtA).toHaveLength(1)

          const relationshipAtA = yield* readRelationshipAsSchool(fixture.schoolAId)
          expect(relationshipAtA).toHaveLength(1)

          // The actual proof: school B's own session cannot see school A's
          // student, guardian, or relationship rows at all.
          const studentAtB = yield* readAsSchool(fixture.schoolBId, fixture.studentPersonId)
          expect(studentAtB).toHaveLength(0)

          const guardianAtB = yield* readAsSchool(fixture.schoolBId, fixture.guardianPersonId)
          expect(guardianAtB).toHaveLength(0)

          const relationshipAtB = yield* readRelationshipAsSchool(fixture.schoolBId)
          expect(relationshipAtB).toHaveLength(0)
        }).pipe(Effect.orDie, Effect.provide(AppSqlLive))

        yield* verify.pipe(
          Effect.ensuring(deleteFixture(fixture).pipe(Effect.provide(SqlLive), Effect.orDie))
        )
      }),
    30_000
  )
})
