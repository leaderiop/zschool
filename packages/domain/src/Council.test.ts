import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Result from "effect/Result"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { StubNotificationSenderLive } from "./AttendanceNotification.ts"
import {
  createDisciplinaryCouncil,
  CouncilMinutesLockedError,
  escalateUnreadSummonses,
  findLockedCouncilDecisions,
  issueSummons,
  lockCouncilMinutes,
  markSummonsRead,
  reopenCouncilMinutes,
  updateCouncilMinutes
} from "./Council.ts"
import { insertEnrollment } from "./Enrollment.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asStudentLifeOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({ id: "sl-1", roles: ["student_life"], attributes: { school_id: schoolId, cycle_ids: [] } })
    )
  )

const withCouncilFixture = Effect.fn(function*<A, E, R>(
  use: (
    seed: {
      schoolId: string
      studentEnrollmentId: string
      guardianPersonId: string
      studentLifePersonId: string
    }
  ) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #104 test school') RETURNING id
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
      const [level] = yield* sql<{ id: string }>`
        INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
        VALUES (${school.id}, ${year.id}, ${cycle.id}, '6AP', '6ème Année Primaire', 1) RETURNING id
      `
      const [cls] = yield* sql<{ id: string }>`
        INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
        VALUES (${school.id}, ${year.id}, ${level.id}, '6AP-1', 30) RETURNING id
      `

      const studentPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${studentPersonId}, 'Nadia', 'Student', '2010-01-01')
      `
      const enrollment = yield* insertEnrollment({
        schoolId: school.id,
        academicYearId: year.id,
        studentPersonId,
        classId: cls.id,
        effectiveDate: "2020-09-01",
        hasLegalGuardian: true,
        hasFinancialGuardian: true
      })

      const guardianPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${guardianPersonId}, 'Karim', 'Guardian', '1980-01-01')
      `

      const studentLifePersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${studentLifePersonId}, 'Amina', 'StudentLife', '1980-01-01')
      `

      return yield* use({
        schoolId: school.id,
        studentEnrollmentId: enrollment.id,
        guardianPersonId,
        studentLifePersonId
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer, StubNotificationSenderLive)))

describe("Summons (ticket #104)", () => {
  it.effect("a summons can be issued, delivered, and read-tracked", () =>
    withCouncilFixture(({ guardianPersonId, schoolId, studentEnrollmentId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const summons = yield* issueSummons(
          schoolId,
          studentEnrollmentId,
          "disciplinary_council",
          "2020-09-20",
          "14:00",
          "Discuss recent incidents",
          [guardianPersonId],
          studentLifePersonId
        ).pipe(Effect.provide(asStudentLifeOf(schoolId)))
        expect(summons.delivered_channel).toBe("push")
        expect(summons.read_at).toBeNull()

        yield* markSummonsRead(schoolId, summons.id).pipe(Effect.provide(asStudentLifeOf(schoolId)))

        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ read_at: string | null }>`SELECT read_at FROM summonses WHERE id = ${summons.id}`
        )
        expect(rows[0].read_at).not.toBeNull()
      })
    ))

  it.effect("an unread summons past 24h escalates via the next channel", () =>
    withCouncilFixture(({ guardianPersonId, schoolId, studentEnrollmentId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const summons = yield* issueSummons(
          schoolId,
          studentEnrollmentId,
          "disciplinary_council",
          "2020-09-20",
          "14:00",
          "Discuss recent incidents",
          [guardianPersonId],
          studentLifePersonId
        ).pipe(Effect.provide(asStudentLifeOf(schoolId)))

        const sql = yield* SqlClient
        yield* withSchool(
          schoolId,
          sql`UPDATE summonses SET created_at = now() - interval '25 hours' WHERE id = ${summons.id}`
        )

        const result = yield* escalateUnreadSummonses(schoolId)
        expect(result.escalated).toBe(1)

        const rows = yield* withSchool(
          schoolId,
          sql<{ escalated_at: string | null }>`SELECT escalated_at FROM summonses WHERE id = ${summons.id}`
        )
        expect(rows[0].escalated_at).not.toBeNull()
      })
    ))

  it.effect("a read summons is never escalated", () =>
    withCouncilFixture(({ guardianPersonId, schoolId, studentEnrollmentId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const summons = yield* issueSummons(
          schoolId,
          studentEnrollmentId,
          "disciplinary_council",
          "2020-09-20",
          "14:00",
          "Discuss recent incidents",
          [guardianPersonId],
          studentLifePersonId
        ).pipe(Effect.provide(asStudentLifeOf(schoolId)))
        yield* markSummonsRead(schoolId, summons.id).pipe(Effect.provide(asStudentLifeOf(schoolId)))

        const sql = yield* SqlClient
        yield* withSchool(
          schoolId,
          sql`UPDATE summonses SET created_at = now() - interval '25 hours' WHERE id = ${summons.id}`
        )

        const result = yield* escalateUnreadSummonses(schoolId)
        expect(result.escalated).toBe(0)
      })
    ))
})

describe("DisciplinaryCouncil minutes (ticket #104)", () => {
  it.effect("minutes are editable pre-lock, and every edit is recorded as a full revision snapshot", () =>
    withCouncilFixture(({ schoolId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const council = yield* createDisciplinaryCouncil(schoolId, null, ["sl-1"], [], studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )
        yield* updateCouncilMinutes(
          schoolId,
          council.id,
          { deliberation: "Discussed the incident" },
          studentLifePersonId
        ).pipe(Effect.provide(asStudentLifeOf(schoolId)))
        yield* updateCouncilMinutes(schoolId, council.id, { decision: "Written warning" }, studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )

        const sql = yield* SqlClient
        const revisions = yield* withSchool(
          schoolId,
          sql<{ count: string }>`SELECT count(*)::int AS count FROM council_minutes_revisions WHERE council_id = ${council.id}`
        )
        expect(Number(revisions[0].count)).toBe(2)
      })
    ))

  it.effect("minutes get a tamper-proof sequential number at lock, immutable and refused-to-edit afterward", () =>
    withCouncilFixture(({ schoolId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const council = yield* createDisciplinaryCouncil(schoolId, null, ["sl-1"], [], studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )
        yield* updateCouncilMinutes(
          schoolId,
          council.id,
          { decision: "Suspension proposed" },
          studentLifePersonId
        ).pipe(Effect.provide(asStudentLifeOf(schoolId)))
        const locked = yield* lockCouncilMinutes(schoolId, council.id, studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )
        expect(locked.minutes_number).toMatch(/^CD-\d{4}-\d{4}$/)
        expect(locked.status).toBe("locked")

        const editAttempt = yield* Effect.result(
          updateCouncilMinutes(schoolId, council.id, { decision: "Changed my mind" }, studentLifePersonId).pipe(
            Effect.provide(asStudentLifeOf(schoolId))
          )
        )
        expect(Result.isFailure(editAttempt)).toBe(true)
        if (Result.isFailure(editAttempt)) expect(editAttempt.failure).toBeInstanceOf(CouncilMinutesLockedError)
      })
    ))

  it.effect("reopening locked minutes records a post-lock-reopening snapshot and keeps the same minutes number on re-lock", () =>
    withCouncilFixture(({ schoolId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const council = yield* createDisciplinaryCouncil(schoolId, null, ["sl-1"], [], studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )
        const locked = yield* lockCouncilMinutes(schoolId, council.id, studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )

        yield* reopenCouncilMinutes(schoolId, council.id, studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )
        yield* updateCouncilMinutes(
          schoolId,
          council.id,
          { decision: "Corrected decision" },
          studentLifePersonId
        ).pipe(Effect.provide(asStudentLifeOf(schoolId)))
        const relocked = yield* lockCouncilMinutes(schoolId, council.id, studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )
        expect(relocked.minutes_number).toBe(locked.minutes_number)

        const sql = yield* SqlClient
        const reopenings = yield* withSchool(
          schoolId,
          sql<{ count: string }>`
            SELECT count(*)::int AS count FROM council_minutes_revisions
            WHERE council_id = ${council.id} AND is_post_lock_reopening = true
          `
        )
        expect(Number(reopenings[0].count)).toBe(1)
      })
    ))

  it.effect("a council decision never calls closeEnrollment itself — it's a queue a director reads separately", () =>
    withCouncilFixture(({ schoolId, studentLifePersonId }) =>
      Effect.gen(function*() {
        const council = yield* createDisciplinaryCouncil(schoolId, null, ["sl-1"], [], studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )
        yield* updateCouncilMinutes(
          schoolId,
          council.id,
          { decision: "Expulsion recommended" },
          studentLifePersonId
        ).pipe(Effect.provide(asStudentLifeOf(schoolId)))
        yield* lockCouncilMinutes(schoolId, council.id, studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )

        const decisions = yield* findLockedCouncilDecisions(schoolId).pipe(Effect.provide(asStudentLifeOf(schoolId)))
        expect(decisions.map((d) => d.id)).toContain(council.id)

        const sql = yield* SqlClient
        const enrollmentStillActive = yield* withSchool(
          schoolId,
          sql<{ status: string }>`SELECT status FROM enrollments`
        )
        expect(enrollmentStillActive[0].status).toBe("active")
      })
    ))
})
