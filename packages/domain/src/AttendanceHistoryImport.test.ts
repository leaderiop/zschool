import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  analyzeAttendanceHistoryRows,
  commitAttendanceHistoryImportBatch,
  findImportedAbsenceHistory
} from "./AttendanceHistoryImport.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/** Seeds a school, cycle, class, and one enrolled student with a Massar code, mirroring `FinancialHistoryImport.test.ts`'s own fixture shape (a mid-year-onboarded student ready for catch-up import). */
const withImportFixture = Effect.fn(function*<A, E, R>(
  use: (seed: { schoolId: string; academicYearId: string; massarCode: string; enrollmentId: string }) => Effect.Effect<
    A,
    E,
    R
  >
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #77 test school') RETURNING id
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

      const massarCode = `G${(yield* randomUUID).replaceAll("-", "").slice(0, 12)}`
      const studentPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth, massar_code)
        VALUES (${studentPersonId}, 'Nadia', 'Student', '2010-01-01', ${massarCode})
      `
      const [enrollment] = yield* sql<{ id: string }>`
        INSERT INTO enrollments (school_id, academic_year_id, academic_year_label, student_person_id, class_id, status, effective_date)
        VALUES (${school.id}, ${year.id}, '2020-2021', ${studentPersonId}, ${cls.id}, 'active', '2020-09-01')
        RETURNING id
      `

      return yield* use({ schoolId: school.id, academicYearId: year.id, massarCode, enrollmentId: enrollment.id })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("Attendance mid-year catch-up import (ticket #77)", () => {
  it.effect("aggregated absences by student and period can be analyzed and imported", () =>
    withImportFixture(({ academicYearId, massarCode, schoolId }) =>
      Effect.gen(function*() {
        const rows = [
          {
            rowId: "row-1",
            massarCode,
            periodLabel: "September 2020",
            startDate: "2020-09-01",
            endDate: "2020-09-30",
            absenceCount: 3,
            tardyCount: 1
          }
        ]

        const analysis = yield* analyzeAttendanceHistoryRows(schoolId, academicYearId, rows)
        expect(analysis).toEqual([{ rowId: "row-1", status: "resolvable" }])

        const results = yield* commitAttendanceHistoryImportBatch(schoolId, academicYearId, rows).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results).toEqual([{ rowId: "row-1", status: "committed" }])
      })
    ))

  it.effect("imported attendance history is attached to the correct Enrollment", () =>
    withImportFixture(({ academicYearId, enrollmentId, massarCode, schoolId }) =>
      Effect.gen(function*() {
        const rows = [
          {
            rowId: "row-1",
            massarCode,
            periodLabel: "September 2020",
            startDate: "2020-09-01",
            endDate: "2020-09-30",
            absenceCount: 3
          }
        ]
        yield* commitAttendanceHistoryImportBatch(schoolId, academicYearId, rows).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const history = yield* findImportedAbsenceHistory(schoolId, enrollmentId)
        expect(history).toHaveLength(1)
        expect(history[0].absence_count).toBe(3)
        expect(history[0].period_label).toBe("September 2020")
      })
    ))

  it.effect("re-importing the same (enrollment, period) is a no-op, not a double count", () =>
    withImportFixture(({ academicYearId, massarCode, schoolId }) =>
      Effect.gen(function*() {
        const rows = [
          {
            rowId: "row-1",
            massarCode,
            periodLabel: "September 2020",
            startDate: "2020-09-01",
            endDate: "2020-09-30",
            absenceCount: 3
          }
        ]
        yield* commitAttendanceHistoryImportBatch(schoolId, academicYearId, rows).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const secondAttempt = yield* commitAttendanceHistoryImportBatch(schoolId, academicYearId, rows).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(secondAttempt).toEqual([{ rowId: "row-1", status: "skipped_already_applied" }])
      })
    ))

  it.effect("a row with no matching enrollment is reported as an error, not committed", () =>
    withImportFixture(({ academicYearId, schoolId }) =>
      Effect.gen(function*() {
        const rows = [
          {
            rowId: "row-1",
            massarCode: "UNKNOWN-CODE",
            periodLabel: "September 2020",
            startDate: "2020-09-01",
            endDate: "2020-09-30",
            absenceCount: 3
          }
        ]
        const results = yield* commitAttendanceHistoryImportBatch(schoolId, academicYearId, rows).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results[0].status).toBe("error")
      })
    ))

  it.effect("a row with endDate before startDate is refused at analysis time", () =>
    withImportFixture(({ academicYearId, massarCode, schoolId }) =>
      Effect.gen(function*() {
        const rows = [
          {
            rowId: "row-1",
            massarCode,
            periodLabel: "September 2020",
            startDate: "2020-09-30",
            endDate: "2020-09-01",
            absenceCount: 3
          }
        ]
        const analysis = yield* analyzeAttendanceHistoryRows(schoolId, academicYearId, rows)
        expect(analysis[0].status).toBe("error")
      })
    ))
})
