import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { insertEnrollment } from "./Enrollment.ts"
import {
  type ChannelSendResult,
  type NotificationChannel,
  NotificationSender,
  processOutboxOnce,
  registerPushSubscription,
  StubNotificationSenderLive
} from "./AttendanceNotification.ts"
import { arbitrateRollCallDiscrepancy, confirmRollCallForSession, RollCallEntry, sessionKey } from "./RollCall.ts"
import { createSlot, findOrCreateSessionForRollCall } from "./Session.ts"
import { assignTeacherToCourse } from "./TeacherAssignment.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

const asTeacher = (schoolId: string, teacherPersonId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({
        id: teacherPersonId,
        roles: ["teacher"],
        attributes: { school_id: schoolId, person_id: teacherPersonId }
      })
    )
  )

const asStudentLifeOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({ id: "sl-1", roles: ["student_life"], attributes: { school_id: schoolId, cycle_ids: [] } })
    )
  )

/** Records every `NotificationSender.send` call instead of actually sending — the same "fake instead of the real adapter" idiom `ImportBatch.test.ts`'s `testImportQueue` uses for `ImportQueue`. */
const recordingSender = (calls: Ref.Ref<ReadonlyArray<{ channel: NotificationChannel; recipientPersonId: string }>>) =>
  Layer.succeed(NotificationSender, {
    send: (channel, recipientPersonId) =>
      Ref.update(calls, (existing) => [...existing, { channel, recipientPersonId }]).pipe(
        Effect.as({ delivered: true, providerMessageId: null } satisfies ChannelSendResult)
      )
  })

/** Seeds a school, cycle, class, course, an assigned teacher, a Slot, one enrolled student, and a guardian relationship. */
const withNotificationFixture = Effect.fn(function*<A, E, R>(
  use: (
    seed: {
      schoolId: string
      sessionId: string
      teacherPersonId: string
      studentEnrollmentId: string
      guardianPersonId: string
    }
  ) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #97 test school') RETURNING id
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
      const [subject] = yield* sql<{ id: string }>`
        INSERT INTO subjects (school_id, academic_year_id, section_id, code, name)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'MATH', 'Mathématiques') RETURNING id
      `
      const [subjectLevelConfig] = yield* sql<{ id: string }>`
        INSERT INTO subject_level_configs (school_id, academic_year_id, subject_id, level_id, coefficient, teaching_language)
        VALUES (${school.id}, ${year.id}, ${subject.id}, ${level.id}, 1, 'fr') RETURNING id
      `
      const [course] = yield* sql<{ id: string }>`
        INSERT INTO courses (school_id, academic_year_id, class_id, subject_level_config_id)
        VALUES (${school.id}, ${year.id}, ${cls.id}, ${subjectLevelConfig.id}) RETURNING id
      `

      const teacherPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${teacherPersonId}, 'Samira', 'Teacher', '1985-01-01')
      `
      yield* assignTeacherToCourse(school.id, course.id, teacherPersonId).pipe(
        Effect.provide(asDirectorOf(school.id))
      )

      const slot = yield* createSlot(school.id, cycle.id, "Period 1", 1, "morning").pipe(
        Effect.provide(asDirectorOf(school.id))
      )

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
      yield* sql`
        INSERT INTO parent_student_relationships
          (guardian_person_id, student_person_id, relationship_type, is_legal_guardian, is_financial_guardian)
        VALUES (${guardianPersonId}, ${studentPersonId}, 'father', true, true)
      `

      const session = yield* findOrCreateSessionForRollCall(school.id, course.id, "2020-09-07", slot.id).pipe(
        Effect.provide(asTeacher(school.id, teacherPersonId))
      )

      return yield* use({
        schoolId: school.id,
        sessionId: session.id,
        teacherPersonId,
        studentEnrollmentId: enrollment.id,
        guardianPersonId
      })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("attendance notification outbox (ticket #97)", () => {
  it.effect("confirming an absence writes a first_absence_of_day outbox row within the same transaction", () =>
    withNotificationFixture(({ schoolId, sessionId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "absent" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ event_type: string; status: string }>`
            SELECT event_type, status FROM attendance_notification_outbox
            WHERE key = ${sessionKey(sessionId)} AND student_enrollment_id = ${studentEnrollmentId}
          `
        )
        expect(rows).toHaveLength(1)
        expect(rows[0].event_type).toBe("first_absence_of_day")
        expect(rows[0].status).toBe("pending")
      })
    ))

  it.effect("a second, conflicting confirmation cancels the still-pending outbox row", () =>
    withNotificationFixture(({ schoolId, sessionId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "absent" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "present" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const sql = yield* SqlClient
        const rows = yield* withSchool(
          schoolId,
          sql<{ status: string }>`
            SELECT status FROM attendance_notification_outbox
            WHERE key = ${sessionKey(sessionId)} AND student_enrollment_id = ${studentEnrollmentId}
          `
        )
        expect(rows).toHaveLength(1)
        expect(rows[0].status).toBe("canceled")
      })
    ))

  it.effect("processOutboxOnce with the stub sender marks a first_absence_of_day row sent and logs deliveries", () =>
    withNotificationFixture(({ schoolId, sessionId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "absent" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const sql = yield* SqlClient
        // Force the row past its 3-minute retention window for this test.
        yield* withSchool(schoolId, sql`UPDATE attendance_notification_outbox SET process_after = now()`)

        const result = yield* processOutboxOnce(schoolId).pipe(Effect.provide(StubNotificationSenderLive))
        expect(result.processed).toBe(1)

        const rows = yield* withSchool(
          schoolId,
          sql<{ status: string }>`
            SELECT status FROM attendance_notification_outbox
            WHERE key = ${sessionKey(sessionId)} AND student_enrollment_id = ${studentEnrollmentId}
          `
        )
        expect(rows[0].status).toBe("sent")

        // in_app isn't dispatched by this ticket's channel set — only
        // push/whatsapp/sms, per its own "send push+WhatsApp+SMS in
        // parallel" — but every one of those three logs a delivery attempt.
        const logs = yield* withSchool(schoolId, sql<{ channel: string }>`SELECT channel FROM delivery_logs`)
        expect(logs.map((l) => l.channel).sort()).toEqual(["push", "sms", "whatsapp"])
      })
    ))

  it.effect("a discrepancy opened after the outbox row was written defers dispatch", () =>
    withNotificationFixture(({ schoolId, sessionId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "absent" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const sql = yield* SqlClient
        // Mark the row already past retention AND still pending, then open a
        // discrepancy by hand (simulating one arriving after the outbox row
        // was already written but before it was processed).
        yield* withSchool(schoolId, sql`UPDATE attendance_notification_outbox SET process_after = now()`)
        yield* withSchool(
          schoolId,
          sql`
            INSERT INTO roll_call_discrepancies (school_id, key, student_enrollment_id)
            VALUES (${schoolId}, ${sessionKey(sessionId)}, ${studentEnrollmentId})
          `
        )

        const result = yield* processOutboxOnce(schoolId).pipe(Effect.provide(StubNotificationSenderLive))
        expect(result.processed).toBe(0)

        const rows = yield* withSchool(
          schoolId,
          sql<{ status: string }>`
            SELECT status FROM attendance_notification_outbox
            WHERE key = ${sessionKey(sessionId)} AND student_enrollment_id = ${studentEnrollmentId}
          `
        )
        expect(rows[0].status).toBe("pending")
      })
    ))

  it.effect("push channel is skipped (logged failed) with no active subscription, but registering one makes it eligible", () =>
    withNotificationFixture(({ guardianPersonId, schoolId, sessionId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "absent" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const sql = yield* SqlClient
        yield* withSchool(schoolId, sql`UPDATE attendance_notification_outbox SET process_after = now()`)

        const calls = yield* Ref.make<ReadonlyArray<{ channel: NotificationChannel; recipientPersonId: string }>>([])
        yield* processOutboxOnce(schoolId).pipe(Effect.provide(recordingSender(calls)))

        // Push was never handed to the sender at all (no active subscription).
        const madeCalls = yield* Ref.get(calls)
        expect(madeCalls.some((c) => c.channel === "push")).toBe(false)

        const pushLog = yield* withSchool(
          schoolId,
          sql<{ status: string }>`SELECT status FROM delivery_logs WHERE channel = 'push'`
        )
        expect(pushLog[0].status).toBe("failed")

        yield* registerPushSubscription(schoolId, guardianPersonId, "expo-token-1", null)
      })
    ))

  it.effect("a correction after an already-sent notification queues a correction outbox row referencing the original", () =>
    withNotificationFixture(({ schoolId, sessionId, studentEnrollmentId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "absent" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const sql = yield* SqlClient
        yield* withSchool(schoolId, sql`UPDATE attendance_notification_outbox SET process_after = now()`)
        yield* processOutboxOnce(schoolId).pipe(Effect.provide(StubNotificationSenderLive))

        const [original] = yield* withSchool(
          schoolId,
          sql<{ id: string }>`
            SELECT id FROM attendance_notification_outbox
            WHERE key = ${sessionKey(sessionId)} AND student_enrollment_id = ${studentEnrollmentId} AND status = 'sent'
          `
        )

        // A second submission opens a discrepancy; student-life arbitrates
        // to "present" — the original notification already went out, so
        // this should queue a correction referencing it.
        yield* confirmRollCallForSession(schoolId, sessionId, teacherPersonId, [
          new RollCallEntry({ studentEnrollmentId, status: "present" })
        ]).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const [discrepancy] = yield* withSchool(
          schoolId,
          sql<{ id: string }>`
            SELECT id FROM roll_call_discrepancies
            WHERE key = ${sessionKey(sessionId)} AND student_enrollment_id = ${studentEnrollmentId} AND resolved_at IS NULL
          `
        )
        const studentLifePersonId = yield* randomUUID
        yield* sql`
          INSERT INTO persons (id, first_name, last_name, date_of_birth)
          VALUES (${studentLifePersonId}, 'Amina', 'StudentLife', '1980-01-01')
        `
        yield* arbitrateRollCallDiscrepancy(schoolId, discrepancy.id, "present", studentLifePersonId).pipe(
          Effect.provide(asStudentLifeOf(schoolId))
        )

        const correction = yield* withSchool(
          schoolId,
          sql<{ event_type: string; corrects_outbox_id: string }>`
            SELECT event_type, corrects_outbox_id FROM attendance_notification_outbox WHERE event_type = 'correction'
          `
        )
        expect(correction).toHaveLength(1)
        expect(correction[0].corrects_outbox_id).toBe(original.id)
      })
    ))
})
