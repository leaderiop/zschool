import { SendMessageCommand } from "@aws-sdk/client-sqs"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import { getClassImportBatchReport, startClassImportBatch } from "@zschool/domain"
import { importCommitQueueUrl, makeSqsClient } from "@zschool/infra"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { processOneMessage } from "./Imports.ts"

/** Same director-context helper as `packages/domain`'s own tests (`ImportBatch.test.ts`). */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

const withSeededLevel = Effect.fn(function*<A, E, R>(
  use: (seed: { schoolId: string; levelCode: string }) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES ('Workers test school') RETURNING id`
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
      yield* sql`
        INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
        VALUES (${school.id}, ${year.id}, ${cycle.id}, '6AP', '6ème Année Primaire', 1)
      `
      return yield* use({ schoolId: school.id, levelCode: "6AP" })
    })
  )
}, Effect.provide(AppSqlLive))

describe("Imports worker (ticket #8 / ADR-ZS-106 / ADR-ZS-099)", () => {
  it.effect("processes a real SQS commit message end to end: creates the class, completes the batch, and deletes the message", () =>
    withSeededLevel(({ levelCode, schoolId }) =>
      Effect.gen(function*() {
        const report = yield* startClassImportBatch(schoolId, [
          { levelCode, label: "WorkerCommitted", capacity: 12 }
        ]).pipe(Effect.provide(asDirectorOf(schoolId)))

        const queueUrl = yield* importCommitQueueUrl
        const client = yield* makeSqsClient
        yield* Effect.tryPromise(() =>
          client.send(
            new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify({ batchId: report.batchId }) })
          )
        )

        yield* processOneMessage(client, queueUrl)

        const after = yield* getClassImportBatchReport(schoolId, report.batchId).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(after.status).toBe("complete")
        expect(after.rows[0].commitStatus).toBe("committed")

        const sql = yield* SqlClient
        const classes = yield* sql<{ label: string }>`
          SELECT label FROM classes WHERE school_id = ${schoolId} AND label = 'WorkerCommitted'
        `
        expect(classes).toHaveLength(1)
      })
    ))
})
