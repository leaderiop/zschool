import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  analyzeHistoricalGradeRows,
  commitHistoricalGradeImportBatch,
  getOrCreateArchivalYear,
  type HistoricalGradeImportRow
} from "./HistoricalGradeImport.ts"

/** Same `authorized`-gating context as every other import domain's test in this package. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/**
 * `use` runs inside the same `withSchool` scope this seeds (matching
 * `ImportBatch.test.ts`'s own `withSeededLevel`), so a plain ambient `sql`
 * query inside `use` — a ground-truth assertion after commit — still has
 * `app.current_school_id` set, rather than hitting `tenant_isolation`'s
 * `current_setting(...)::uuid` cast with nothing set.
 */
const withSeededSchool = Effect.fn(function*<A, E, R>(
  use: (schoolId: string) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<
    { id: string }
  >`INSERT INTO schools (name) VALUES ('HistoricalGradeImport test school') RETURNING id`
  return yield* withSchool(school.id, use(school.id))
}, Effect.provide(AppSqlLive))

const row = (overrides: Partial<HistoricalGradeImportRow> = {}): HistoricalGradeImportRow => ({
  rowId: "h1",
  firstName: "Rania",
  lastName: "Kabbaj",
  dateOfBirth: "2005-05-05",
  massarCode: "H100001",
  levelCode: "3AC",
  classLabel: "3AC-A",
  subjectCode: "SVT",
  periodCode: "S1",
  value: 14,
  effectiveDate: "2019-09-01",
  ...overrides
})

describe("HistoricalGradeImport", () => {
  it.effect(
    "a creatable row synthesizes an archival year, tree, completed Enrollment, Assessment, and Mark",
    () =>
      withSeededSchool((schoolId) =>
        Effect.gen(function*() {
          const sql = yield* SqlClient
          const historicalRow = row()

          const analysis = yield* analyzeHistoricalGradeRows([historicalRow])
          expect(analysis).toEqual([{ rowId: "h1", status: "creatable" }])

          const results = yield* commitHistoricalGradeImportBatch(schoolId, "2019-2020", [historicalRow]).pipe(
            Effect.provide(asDirectorOf(schoolId))
          )
          expect(results[0].status).toBe("committed")
          if (results[0].status !== "committed") throw new Error("unreachable")

          const [year] = yield* sql<{ status: string; is_archival: boolean }>`
            SELECT status, is_archival FROM academic_years WHERE school_id = ${schoolId} AND label = '2019-2020'
          `
          expect(year).toEqual({ status: "closed", is_archival: true })

          const [mark] = yield* sql<{ value: string; status: string }>`
            SELECT value, status FROM marks WHERE id = ${results[0].markId}
          `
          expect(Number(mark.value)).toBe(14)
          expect(mark.status).toBe("draft")

          const [enrollment] = yield* sql<{ status: string }>`
            SELECT e.status FROM enrollments e
            JOIN marks m ON m.enrollment_id = e.id
            WHERE m.id = ${results[0].markId}
          `
          expect(enrollment.status).toBe("completed")

          const [cls] = yield* sql<{ label: string }>`
            SELECT c.label FROM classes c
            JOIN enrollments e ON e.class_id = c.id
            JOIN marks m ON m.enrollment_id = e.id
            WHERE m.id = ${results[0].markId}
          `
          expect(cls.label).toBe("3AC-A")
        })
      )
  )

  it.effect("re-importing into the same historical year label reuses the same archival year", () =>
    withSeededSchool((schoolId) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const first = row({ rowId: "h1", massarCode: "H200001" })
        const second = row({ rowId: "h2", massarCode: "H200002", subjectCode: "MATH" })

        yield* commitHistoricalGradeImportBatch(schoolId, "2018-2019", [first]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        yield* commitHistoricalGradeImportBatch(schoolId, "2018-2019", [second]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const years = yield* sql<{ count: string }>`
          SELECT count(*)::int AS count FROM academic_years WHERE school_id = ${schoolId} AND label = '2018-2019'
        `
        expect(Number(years[0].count)).toBe(1)
      })
    ))

  it.effect("two grade rows for the same student in the same historical year share one completed Enrollment", () =>
    withSeededSchool((schoolId) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const rows: ReadonlyArray<HistoricalGradeImportRow> = [
          row({ rowId: "h1", massarCode: "H300001", subjectCode: "SVT" }),
          row({ rowId: "h2", massarCode: "H300001", subjectCode: "MATH" })
        ]

        const results = yield* commitHistoricalGradeImportBatch(schoolId, "2017-2018", rows).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(results.every((r) => r.status === "committed")).toBe(true)

        const [{ count }] = yield* sql<{ count: string }>`
          SELECT count(*)::int AS count FROM enrollments e
          JOIN persons p ON p.id = e.student_person_id
          WHERE p.massar_code = 'H300001'
        `
        expect(Number(count)).toBe(1)
      })
    ))

  it.effect("a Massar-code strong match is proposed, never auto-linked, and confirming reuses the same Person", () =>
    withSeededSchool((schoolId) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const first = row({ rowId: "h1", massarCode: "H400001" })
        const firstResult = yield* commitHistoricalGradeImportBatch(schoolId, "2016-2017", [first]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(firstResult[0].status).toBe("committed")

        const secondRow = row({ rowId: "h2", massarCode: "H400001", periodCode: "S2" })
        const analysis = yield* analyzeHistoricalGradeRows([secondRow])
        expect(analysis[0].status).toBe("strong_match_awaiting_confirmation")
        if (analysis[0].status !== "strong_match_awaiting_confirmation") throw new Error("unreachable")
        const existingPersonId = analysis[0].personId

        const unconfirmed = yield* commitHistoricalGradeImportBatch(schoolId, "2016-2017", [secondRow]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(unconfirmed[0].status).toBe("awaiting_confirmation")

        const confirmedRow = row({
          rowId: "h3",
          massarCode: "H400001",
          confirmedMatchPersonId: existingPersonId,
          periodCode: "S2"
        })
        const confirmed = yield* commitHistoricalGradeImportBatch(schoolId, "2016-2017", [confirmedRow]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(confirmed[0].status).toBe("committed")

        const [{ count }] = yield* sql<{ count: string }>`
          SELECT count(*)::int AS count FROM persons WHERE massar_code = 'H400001'
        `
        expect(Number(count)).toBe(1)
      })
    ))

  it.effect("importing into a label that already belongs to a genuine (non-archival) year is refused", () =>
    withSeededSchool((schoolId) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`INSERT INTO academic_years (school_id, label) VALUES (${schoolId}, '2026-2027')`

        const result = yield* getOrCreateArchivalYear(schoolId, "2026-2027").pipe(Effect.result)
        expect(result._tag).toBe("Failure")
        if (result._tag !== "Failure") throw new Error("unreachable")
        expect(result.failure._tag).toBe("ArchivalYearConflictError")
      })
    ))

  it.effect("a missing required field is rejected with a reason naming that field", () =>
    Effect.gen(function*() {
      const analysis = yield* analyzeHistoricalGradeRows([row({ firstName: "" })])
      expect(analysis[0].status).toBe("error")
      if (analysis[0].status !== "error") throw new Error("unreachable")
      expect(analysis[0].error.reason).toContain("firstName")
    }).pipe(Effect.provide(AppSqlLive)))
})
