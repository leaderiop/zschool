import { assert, describe, it } from "@effect/vitest"
import { anonymous, makeSubject } from "@qadi/core/AuthSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { RequirePermissionLive } from "@qadi/http/RequirePermission"
import { SubjectExtractor } from "@qadi/http/SubjectExtractor"
import { AppSqlLive, MigratorLive, SqlLive, withSchool } from "@zschool/db"
import { analyzeGuardianRows, analyzeTeacherRows, Api, ImportQueue, SchoolId } from "@zschool/domain"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { HttpServer } from "effect/unstable/http"
import { HttpApiTest } from "effect/unstable/httpapi"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { ImportsApiHandlers } from "./Imports/http.ts"

/**
 * Issue #38's own test seam: `HttpApiTest.groups(Api, ["imports"])`, wired
 * to the real testcontainers-backed `SqlClient`/`AppSqlLive` from #35 (per
 * this ticket's Testing Decisions), not a fake/in-memory one —
 * `analyzeGuardianRows`/`analyzeStudentRows` genuinely query
 * `persons`/`guardian_profiles`/the academic tree.
 *
 * `@qadi/http`'s `RequirePermission` reads the caller's subject through its
 * own `SubjectExtractor` service, not `HttpApiSecurity` (see `Imports.ts`'s
 * doc comment), so "swap the credential" per test means swapping the
 * `SubjectExtractor` implementation `RequirePermissionLive` is built from —
 * the same shape `effect`'s own `20_testing.ts` worked example swaps an
 * `HttpApiMiddleware.layerClient` for. This composes with plain
 * `Layer.provide`/`Layer.provideMerge` and zero casts — `RequirePermissionLive`
 * declares `requires: never` and `provides: CurrentSubject` since the
 * upstream fix (see `@qadi/http`'s own `RequirePermission.ts` doc comment),
 * so Effect's inference resolves every type here on its own, including the
 * `CurrentSubject` a handler's own `authorized()` call reads.
 */
const DIRECTOR_SCHOOL_ID = SchoolId.make("00000000-0000-0000-0000-000000000001")

const directorSubject = makeSubject({
  id: "director-1",
  roles: ["director"],
  attributes: { school_id: DIRECTOR_SCHOOL_ID }
})

const asDirector = Layer.succeed(SubjectExtractor, { extract: () => Effect.succeed(directorSubject) })
const asAnonymous = Layer.succeed(SubjectExtractor, { extract: () => Effect.succeed(anonymous) })

const DbLive = Layer.orDie(Layer.merge(MigratorLive.pipe(Layer.provide(SqlLive)), AppSqlLive))

/** No `commit`/`retry` endpoint is exercised in this file yet — a no-op stands in for the real `@zschool/infra` SQS-backed one, matching `ImportBatch.test.ts`'s own `testImportQueue`. */
const NoopImportQueue = Layer.succeed(ImportQueue, { enqueueCommit: () => Effect.void })

const HandlersLive = ImportsApiHandlers.pipe(Layer.provide([EvaluationServicesNone, AppSqlLive, NoopImportQueue]))

const makeClient = HttpApiTest.groups(Api, ["imports"])

/**
 * One fully-resolved app per subject variant, built directly rather than
 * through `@effect/vitest`'s shared `layer(...)` fixture helper:
 * `RequirePermission`'s `SubjectExtractor` has to be swappable per test, and
 * that helper requires everything it wraps to already be resolved up front.
 *
 * `Layer.provideMerge`, not `Layer.provide`, for `RequirePermissionLive`:
 * `HttpApiTest.groups`'s own required context (captured ambiently from
 * wherever this whole layer is provided into) needs `RequirePermission`'s
 * own Tag available alongside the handlers/db/server services, not merely
 * consumed to satisfy `Layer.mergeAll(...)`'s own requirements.
 */
const appAs = (subjectExtractor: Layer.Layer<SubjectExtractor>) =>
  Layer.mergeAll(HandlersLive, DbLive, HttpServer.layerServices).pipe(
    Layer.provideMerge(
      RequirePermissionLive.pipe(Layer.provide(subjectExtractor), Layer.provide(EvaluationServicesNone))
    )
  )

const AppAsDirector = appAs(asDirector)
const AppAsAnonymous = appAs(asAnonymous)

/**
 * `RequirePermissionLive` (`@qadi/http`) deliberately hand-catches
 * `AccessDenied`/`UndischargedObligation` and converts them to a bare
 * `HttpServerResponse.empty({ status: 403 })` — per its own doc comment,
 * their real fields "must not reach a response body." So a real client
 * never sees a decoded `AccessDenied` tagged value for this; an empty body
 * with no schema-matching shape decodes as `effect`'s own generic
 * `HttpClientError` (`reason._tag: "StatusCodeError"`), carrying the actual
 * response status instead — the same thing any other HTTP client would see.
 */
const assertForbidden = (error: unknown) => {
  assert.strictEqual((error as { _tag: unknown })._tag, "HttpClientError")
  assert.strictEqual((error as { reason: { _tag: unknown } }).reason._tag, "StatusCodeError")
}

describe("ImportsApi (issue #38)", () => {
  it.effect("rejects analyzeGuardians with no bearer token before reaching any domain logic", () =>
    Effect.gen(function*() {
      const client = yield* makeClient
      const error = yield* client.imports.analyzeGuardians({
        params: { schoolId: DIRECTOR_SCHOOL_ID },
        payload: []
      }).pipe(Effect.flip)
      assertForbidden(error)
    }).pipe(Effect.provide(AppAsAnonymous)))

  it.effect("rejects analyzeStudents with no bearer token before reaching any domain logic", () =>
    Effect.gen(function*() {
      const client = yield* makeClient
      const error = yield* client.imports.analyzeStudents({
        params: { schoolId: DIRECTOR_SCHOOL_ID },
        payload: []
      }).pipe(Effect.flip)
      assertForbidden(error)
    }).pipe(Effect.provide(AppAsAnonymous)))

  it.effect(
    "an authorized director's analyzeGuardians matches calling analyzeGuardianRows directly (contract-vs-domain parity)",
    () =>
      Effect.gen(function*() {
        const client = yield* makeClient
        const rows = [{
          rowId: "row-1",
          firstName: "Fatima",
          lastName: "Zahra",
          dateOfBirth: "1985-03-01",
          mobileNumber: "+212600000001"
        }]
        const viaHttp = yield* client.imports.analyzeGuardians({
          params: { schoolId: DIRECTOR_SCHOOL_ID },
          payload: rows
        })
        const viaDomain = yield* analyzeGuardianRows(rows)
        assert.deepStrictEqual(viaHttp, viaDomain)
      }).pipe(Effect.provide(AppAsDirector))
  )

  it.effect(
    "an authorized director's analyzeTeachers matches calling analyzeTeacherRows directly (contract-vs-domain parity)",
    () =>
      Effect.gen(function*() {
        const client = yield* makeClient
        const rows = [{
          rowId: "row-1",
          firstName: "Karim",
          lastName: "Sefrioui",
          dateOfBirth: "1985-04-01",
          massarCode: "T900001"
        }]
        const viaHttp = yield* client.imports.analyzeTeachers({
          params: { schoolId: DIRECTOR_SCHOOL_ID },
          payload: rows
        })
        const viaDomain = yield* analyzeTeacherRows(rows)
        assert.deepStrictEqual(viaHttp, viaDomain)
      }).pipe(Effect.provide(AppAsDirector))
  )

  it.effect(
    "analyzeStudents surfaces a student row's missing class as a per-row error, not an HTTP failure",
    () =>
      Effect.gen(function*() {
        const client = yield* makeClient
        const result = yield* client.imports.analyzeStudents({
          params: { schoolId: DIRECTOR_SCHOOL_ID },
          payload: [{
            rowId: "row-1",
            firstName: "Amine",
            lastName: "Test",
            dateOfBirth: "2015-01-01",
            levelCode: "does-not-exist",
            classLabel: "A",
            effectiveDate: "2026-09-01",
            guardians: []
          }]
        })
        assert.strictEqual(result.length, 1)
        assert.strictEqual(result[0].status, "error")
      }).pipe(Effect.provide(AppAsDirector))
  )

  it.effect(
    "the classes ImportBatch flow (ticket #8/ADR-ZS-106): analyze persists a report, commit requests move it to committing, retry is accepted",
    () =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* sql`INSERT INTO schools (id, name) VALUES (${DIRECTOR_SCHOOL_ID}, 'Imports HTTP test school') ON CONFLICT DO NOTHING`
        yield* withSchool(
          DIRECTOR_SCHOOL_ID,
          Effect.gen(function*() {
            const [year] = yield* sql<{ id: string }>`
              INSERT INTO academic_years (school_id, label) VALUES (${DIRECTOR_SCHOOL_ID}, '2026-2027') RETURNING id
            `
            const [section] = yield* sql<{ id: string }>`
              INSERT INTO sections (school_id, academic_year_id, template, name)
              VALUES (${DIRECTOR_SCHOOL_ID}, ${year.id}, 'national', 'National') RETURNING id
            `
            const [cycle] = yield* sql<{ id: string }>`
              INSERT INTO cycles (school_id, academic_year_id, section_id, code, name, sort_order)
              VALUES (${DIRECTOR_SCHOOL_ID}, ${year.id}, ${section.id}, 'PRIM', 'Primary', 1) RETURNING id
            `
            yield* sql`
              INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
              VALUES (${DIRECTOR_SCHOOL_ID}, ${year.id}, ${cycle.id}, '6AP-HTTP', '6ème Année Primaire', 1)
            `
          })
        )

        const client = yield* makeClient
        const report = yield* client.imports.analyzeClasses({
          params: { schoolId: DIRECTOR_SCHOOL_ID },
          payload: [{ levelCode: "6AP-HTTP", label: "HttpClass", capacity: 10 }]
        })
        assert.strictEqual(report.status, "report_ready")
        assert.strictEqual(report.rows.length, 1)
        assert.strictEqual(report.rows[0].analysisStatus, "creatable")
        assert.strictEqual(report.rows[0].commitStatus, "pending")

        const fetched = yield* client.imports.classImportBatchReport({
          params: { schoolId: DIRECTOR_SCHOOL_ID, batchId: report.batchId }
        })
        assert.deepStrictEqual(fetched, report)

        yield* client.imports.commitClassImportBatch({
          params: { schoolId: DIRECTOR_SCHOOL_ID, batchId: report.batchId }
        })
        const afterCommitRequest = yield* client.imports.classImportBatchReport({
          params: { schoolId: DIRECTOR_SCHOOL_ID, batchId: report.batchId }
        })
        assert.strictEqual(afterCommitRequest.status, "committing")

        // Retry is accepted even while still `committing` (`retryClassImportBatch`
        // is the same request as commit — see its own doc comment).
        yield* client.imports.retryClassImportBatch({
          params: { schoolId: DIRECTOR_SCHOOL_ID, batchId: report.batchId }
        })
      }).pipe(Effect.provide(AppAsDirector))
  )
})
