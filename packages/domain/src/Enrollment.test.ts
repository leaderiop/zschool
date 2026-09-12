import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { CapacityApprovalRequiredError, insertEnrollment } from "./Enrollment.ts"

/** A seed row's id — via Effect's `Crypto` service, not a bare global, so it's provided (`NodeCrypto.layer` below) like every other dependency. */
const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

/**
 * Seeds one school → academic year → section → cycle → level → class of the
 * given `capacity`, with exactly `occupants` existing active enrollments
 * already filling seats — same chain as `AcademicTree.test.ts`'s
 * `withSeededClass`, kept separate since this file needs to control both
 * numbers independently to put a class exactly at, under, or over capacity.
 */
const withSeededClassAt = Effect.fn(function*<A, E, R>(
  capacity: number,
  occupants: number,
  use: (seed: { schoolId: string; academicYearId: string; classId: string }) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Enrollment test school') RETURNING id`
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
      const [cls] = yield* sql<{ id: string }>`
        INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
        VALUES (${school.id}, ${year.id}, ${level.id}, '6AP-1', ${capacity}) RETURNING id
      `
      for (let i = 0; i < occupants; i++) {
        // No `RETURNING` on the `persons` insert — see `insertNewStudent`'s
        // doc comment below for why.
        const occupantId = yield* randomUUID
        yield* sql`
          INSERT INTO persons (id, first_name, last_name, date_of_birth)
          VALUES (${occupantId}, ${`Occupant${i}`}, 'Student', '2015-01-01')
        `
        yield* sql`
          INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
          VALUES (${school.id}, ${year.id}, '2026-2027', ${occupantId}, ${cls.id}, 'active', '2026-09-01')
        `
      }
      return yield* use({ schoolId: school.id, academicYearId: year.id, classId: cls.id })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

/**
 * No `RETURNING` on the `persons` insert: a brand-new person has no
 * `Enrollment`/relationship yet, so `person_select`'s RLS policy can't make
 * a just-inserted row visible for `RETURNING` to return (same chicken-and-egg
 * `Identity.ts`'s `createPerson` documents) — a client-generated id
 * sidesteps that instead.
 */
const insertNewStudent = Effect.fn(function*(name: string) {
  const sql = yield* SqlClient
  const id = yield* randomUUID
  yield* sql`INSERT INTO persons (id, first_name, last_name, date_of_birth) VALUES (${id}, ${name}, 'Student', '2015-01-01')`
  return id
})

describe("Enrollment capacity approval (ticket #3 acceptance criterion 6 / ADR-ZS-065)", () => {
  it.effect("enrolling under capacity needs no capacityOverrideReason, and stores none", () =>
    withSeededClassAt(2, 0, ({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const studentPersonId = yield* insertNewStudent("UnderCapacity")

        const result = yield* insertEnrollment({
          schoolId,
          academicYearId,
          studentPersonId,
          classId,
          effectiveDate: "2026-09-01",
          hasLegalGuardian: true,
          hasFinancialGuardian: true
        })
        expect(result.status).toBe("active")

        const [row] = yield* sql<{ capacity_override_reason: string | null }>`
          SELECT capacity_override_reason FROM enrollments WHERE id = ${result.id}
        `
        expect(row.capacity_override_reason).toBeNull()
      })))

  it.effect("enrolling at capacity without a reason fails with CapacityApprovalRequiredError", () =>
    withSeededClassAt(1, 1, ({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const studentPersonId = yield* insertNewStudent("NoReason")

        const failure = yield* insertEnrollment({
          schoolId,
          academicYearId,
          studentPersonId,
          classId,
          effectiveDate: "2026-09-01",
          hasLegalGuardian: true,
          hasFinancialGuardian: true
        }).pipe(Effect.flip)

        expect(failure).toBeInstanceOf(CapacityApprovalRequiredError)
        if (failure instanceof CapacityApprovalRequiredError) {
          expect(failure.capacity).toBe(1)
          expect(failure.currentEnrollmentCount).toBe(1)
        }
      })))

  it.effect("enrolling at capacity with a documented reason succeeds and persists that reason", () =>
    withSeededClassAt(1, 1, ({ academicYearId, classId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const studentPersonId = yield* insertNewStudent("WithReason")

        const result = yield* insertEnrollment({
          schoolId,
          academicYearId,
          studentPersonId,
          classId,
          effectiveDate: "2026-09-01",
          hasLegalGuardian: true,
          hasFinancialGuardian: true,
          capacityOverrideReason: "Director-approved: sibling placement"
        })
        expect(result.status).toBe("active")

        const [row] = yield* sql<{ capacity_override_reason: string | null }>`
          SELECT capacity_override_reason FROM enrollments WHERE id = ${result.id}
        `
        expect(row.capacity_override_reason).toBe("Director-approved: sibling placement")
      })))
})
