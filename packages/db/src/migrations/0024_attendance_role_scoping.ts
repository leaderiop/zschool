import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #94 (Attendance role/scoping foundation, wayfinder ticket #83):
 * `school_memberships.role` gains `student_life` (student-life/supervisor)
 * and `front_office` (front-desk/SEC) — the first roles added since the
 * check constraint was created 'teacher'-only (migration 0011).
 *
 * `school_membership_cycles` generalizes "assigned to a subset of the
 * school" so it isn't hardcoded per role: no row for a membership means
 * whole-school scope, one or more *active* (`unassigned_at IS NULL`) rows
 * means cycle-scoped. Reassignment never deletes a row — it closes the old
 * one (`unassigned_at`) and inserts a new one — so assignment history is
 * preserved, mirroring `Enrollment.ts`'s own "close, don't delete" idiom.
 *
 * `teacher_assignments` is the `(course, teacher)` link `Courses.ts` has
 * been missing since ticket #10 (its own comment names the gap) — needed
 * now because `canTakeRollCall` denies a teacher with no active assignment
 * for the course.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`ALTER TABLE school_memberships DROP CONSTRAINT school_memberships_role_check`
  yield* sql`
    ALTER TABLE school_memberships
      ADD CONSTRAINT school_memberships_role_check
      CHECK (role IN ('teacher', 'student_life', 'front_office'))
  `

  yield* sql`
    CREATE TABLE school_membership_cycles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      school_membership_id uuid NOT NULL REFERENCES school_memberships (id),
      cycle_id uuid NOT NULL REFERENCES cycles (id),
      assigned_at timestamptz NOT NULL DEFAULT now(),
      unassigned_at timestamptz NULL,
      assigned_by uuid NOT NULL REFERENCES persons (id)
    )
  `
  yield* sql`
    CREATE UNIQUE INDEX school_membership_cycles_active_key
      ON school_membership_cycles (school_membership_id, cycle_id)
      WHERE unassigned_at IS NULL
  `
  yield* applyTenantIsolation(sql, "school_membership_cycles")

  yield* sql`
    CREATE TABLE teacher_assignments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      course_id uuid NOT NULL REFERENCES courses (id),
      teacher_person_id uuid NOT NULL REFERENCES persons (id),
      assigned_at timestamptz NOT NULL DEFAULT now(),
      unassigned_at timestamptz NULL
    )
  `
  yield* sql`
    CREATE UNIQUE INDEX teacher_assignments_active_key
      ON teacher_assignments (course_id, teacher_person_id)
      WHERE unassigned_at IS NULL
  `
  yield* applyTenantIsolation(sql, "teacher_assignments")
})
