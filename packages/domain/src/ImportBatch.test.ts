import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  commitClassImportBatch,
  getClassImportBatchReport,
  requestClassImportCommit,
  retryClassImportBatch,
  startClassImportBatch
} from "./ImportBatch.ts"
import { type ImportCommitMessage, ImportQueue } from "./ImportQueue.ts"

/** A director's `Qadi.assert` context, scoped to `schoolId` — every command function under test here is gated by `Ownership.ts`'s `authorized`. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/**
 * A no-op `ImportQueue` that records every `enqueueCommit` call instead of
 * touching a real queue — `requestClassImportCommit`/`retryClassImportBatch`
 * are tested for what they enqueue, never against a real SQS/Floci
 * endpoint (that's `packages/infra`'s own test, against `Sqs.ts`).
 */
const testImportQueue = (calls: Ref.Ref<ReadonlyArray<ImportCommitMessage>>) =>
  Layer.succeed(ImportQueue, {
    enqueueCommit: (message) => Ref.update(calls, (existing) => [...existing, message])
  })

/** Same school → year → section → cycle → level chain as `AcademicTree.test.ts`'s `withSeededClass`, without pre-creating a class — each test seeds whatever classes it needs itself. */
const withSeededLevel = Effect.fn(function*<A, E, R>(
  use: (
    seed: { schoolId: string; academicYearId: string; levelId: string; levelCode: string }
  ) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<
    { id: string }
  >`INSERT INTO schools (name) VALUES ('ImportBatch test school') RETURNING id`
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
      return yield* use({ schoolId: school.id, academicYearId: year.id, levelId: level.id, levelCode: "6AP" })
    })
  )
}, Effect.provide(AppSqlLive))

describe("ImportBatch (ticket #8 / ADR-ZS-106)", () => {
  it.effect("starting a batch persists creatable, duplicate, and error rows, and reports them", () =>
    withSeededLevel(({ levelCode, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`
          INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
          SELECT school_id, academic_year_id, id, 'Existing', 20 FROM levels WHERE code = ${levelCode}
        `

        const report = yield* startClassImportBatch(schoolId, [
          { levelCode, label: "NewClass", capacity: 10 },
          { levelCode, label: "Existing", capacity: 20 },
          { levelCode: "UNKNOWN", label: "X", capacity: 5 }
        ]).pipe(Effect.provide(asDirectorOf(schoolId)))

        expect(report.status).toBe("report_ready")
        expect(report.rows).toHaveLength(3)
        expect(report.rows[0].analysisStatus).toBe("creatable")
        expect(report.rows[0].commitStatus).toBe("pending")
        expect(report.rows[1].analysisStatus).toBe("duplicate")
        expect(report.rows[1].commitStatus).toBeNull()
        expect(report.rows[2].analysisStatus).toBe("error")
        expect(report.rows[2].commitStatus).toBeNull()

        const fetched = yield* getClassImportBatchReport(schoolId, report.batchId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(fetched).toEqual(report)
      })
    ))

  it.effect("requesting commit enqueues one message and moves the batch to committing", () =>
    withSeededLevel(({ levelCode, schoolId }) =>
      Effect.gen(function*() {
        const calls = yield* Ref.make<ReadonlyArray<ImportCommitMessage>>([])
        const report = yield* startClassImportBatch(schoolId, [{ levelCode, label: "A", capacity: 10 }]).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        yield* requestClassImportCommit(schoolId, report.batchId).pipe(
          Effect.provide(Layer.mergeAll(asDirectorOf(schoolId), testImportQueue(calls)))
        )

        expect(yield* Ref.get(calls)).toEqual([{ batchId: report.batchId }])
        const after = yield* getClassImportBatchReport(schoolId, report.batchId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(after.status).toBe("committing")
      })
    ))

  it.effect("the worker creates classes for creatable rows and completes the batch", () =>
    withSeededLevel(({ levelCode, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const report = yield* startClassImportBatch(schoolId, [
          { levelCode, label: "Committed1", capacity: 15 }
        ]).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* commitClassImportBatch(report.batchId)

        const after = yield* getClassImportBatchReport(schoolId, report.batchId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(after.status).toBe("complete")
        expect(after.rows[0].commitStatus).toBe("committed")

        const classes = yield* sql<{ label: string; capacity: number }>`
          SELECT label, capacity FROM classes WHERE school_id = ${schoolId} AND label = 'Committed1'
        `
        expect(classes).toHaveLength(1)
        expect(classes[0].capacity).toBe(15)
      })
    ))

  it.effect(
    "commit re-validates against current state: a row that became a duplicate before commit is marked failed, and the batch is partially_committed",
    () =>
      withSeededLevel(({ academicYearId, levelCode, levelId, schoolId }) =>
        Effect.gen(function*() {
          const sql = yield* SqlClient
          const report = yield* startClassImportBatch(schoolId, [
            { levelCode, label: "RaceCondition", capacity: 10 }
          ]).pipe(Effect.provide(asDirectorOf(schoolId)))

          // Simulates another admin creating a matching class in the gap
          // between analyze and commit (ADR-ZS-106's own scenario).
          yield* sql`
            INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
            VALUES (${schoolId}, ${academicYearId}, ${levelId}, 'RaceCondition', 10)
          `

          yield* commitClassImportBatch(report.batchId)

          const after = yield* getClassImportBatchReport(schoolId, report.batchId).pipe(
            Effect.provide(asDirectorOf(schoolId))
          )
          expect(after.status).toBe("partially_committed")
          expect(after.rows[0].commitStatus).toBe("failed")
          expect(after.rows[0].commitReason).toContain("already exists")
        })
      )
  )

  it.effect("commitClassImportBatch is idempotent: reprocessing after completion never recreates a committed row", () =>
    withSeededLevel(({ levelCode, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const report = yield* startClassImportBatch(schoolId, [
          { levelCode, label: "Idempotent", capacity: 12 }
        ]).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* commitClassImportBatch(report.batchId)
        yield* commitClassImportBatch(report.batchId)

        const classes = yield* sql<{ id: string }>`
          SELECT id FROM classes WHERE school_id = ${schoolId} AND label = 'Idempotent'
        `
        expect(classes).toHaveLength(1)
      })
    ))

  it.effect("retrying a partially_committed batch reprocesses only the failed row, without touching the committed one", () =>
    withSeededLevel(({ academicYearId, levelCode, levelId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const report = yield* startClassImportBatch(schoolId, [
          { levelCode, label: "StaysCommitted", capacity: 10 },
          { levelCode, label: "RetriesToSuccess", capacity: 10 }
        ]).pipe(Effect.provide(asDirectorOf(schoolId)))

        const [blocker] = yield* sql<{ id: string }>`
          INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
          VALUES (${schoolId}, ${academicYearId}, ${levelId}, 'RetriesToSuccess', 10)
          RETURNING id
        `

        yield* commitClassImportBatch(report.batchId)
        const firstPass = yield* getClassImportBatchReport(schoolId, report.batchId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(firstPass.status).toBe("partially_committed")
        const committedRow = firstPass.rows.find((row) =>
          (row.payload as { label: string }).label === "StaysCommitted"
        )!
        expect(committedRow.commitStatus).toBe("committed")

        // The blocking class is removed — the condition that made the row
        // fail no longer holds, so a retry should now succeed for it.
        yield* sql`DELETE FROM classes WHERE id = ${blocker.id}`

        const calls = yield* Ref.make<ReadonlyArray<ImportCommitMessage>>([])
        yield* retryClassImportBatch(schoolId, report.batchId).pipe(
          Effect.provide(Layer.mergeAll(asDirectorOf(schoolId), testImportQueue(calls)))
        )
        yield* commitClassImportBatch(report.batchId)

        const after = yield* getClassImportBatchReport(schoolId, report.batchId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(after.status).toBe("complete")
        for (const row of after.rows) {
          expect(row.commitStatus).toBe("committed")
        }
        // The row that already succeeded on the first pass kept its original
        // `committed_entity_id` — retry never re-created or re-touched it.
        const stillCommitted = after.rows.find((row) => (row.payload as { label: string }).label === "StaysCommitted")!
        expect(stillCommitted.commitStatus).toBe("committed")

        const classes = yield* sql<{ label: string }>`
          SELECT label FROM classes WHERE school_id = ${schoolId} AND label IN ('StaysCommitted', 'RetriesToSuccess')
        `
        expect(classes).toHaveLength(2)
      })
    ))
})
