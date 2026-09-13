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
import { AttachmentStorage } from "./AttachmentStorage.ts"
import { deleteAttachment, EntityNotFoundError, findCleanAttachment, requestUploadUrl, runScan } from "./Attachment.ts"
import { ScanEngine } from "./ScanEngine.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asFrontOfficeOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({ id: "fo-1", roles: ["front_office"], attributes: { school_id: schoolId, cycle_ids: [] } })
    )
  )

const asTeacher = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "t-1", roles: ["teacher"], attributes: { school_id: schoolId } }))
  )

const fakeDeletedKeys: Array<string> = []

const fakeStorageLive = Layer.succeed(AttachmentStorage, {
  createPresignedUploadUrl: (key) => Effect.succeed({ url: `https://fake-bucket.example/${key}` }),
  createMultipartUpload: () => Effect.succeed({ uploadId: "fake-upload-id" }),
  presignUploadPart: (key, uploadId, partNumber) =>
    Effect.succeed({ url: `https://fake-bucket.example/${key}?uploadId=${uploadId}&part=${partNumber}` }),
  completeMultipartUpload: () => Effect.void,
  deleteObject: (key) =>
    Effect.sync(() => {
      fakeDeletedKeys.push(key)
    })
})

const cleanScanEngineLive = Layer.succeed(ScanEngine, {
  scan: () => Effect.succeed({ clean: true, thumbnailKey: "thumb.jpg" })
})

const rejectingScanEngineLive = Layer.succeed(ScanEngine, {
  scan: () => Effect.succeed({ clean: false, thumbnailKey: null })
})

/** Seeds a school and one front-office `Person`. */
const withSchoolFixture = Effect.fn(function*<A, E, R>(
  use: (seed: { schoolId: string; uploaderPersonId: string }) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #98 test school') RETURNING id
  `
  return yield* withSchool(
    school.id,
    Effect.gen(function*() {
      const uploaderPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${uploaderPersonId}, 'Fatima', 'FrontOffice', '1990-01-01')
      `
      return yield* use({ schoolId: school.id, uploaderPersonId })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("Attachment upload/scan lifecycle (ticket #98)", () => {
  it.effect("a client can request a pre-signed upload URL scoped to the caller's school", () =>
    withSchoolFixture(({ schoolId, uploaderPersonId }) =>
      Effect.gen(function*() {
        const { attachmentId, uploadUrl } = yield* requestUploadUrl(schoolId, uploaderPersonId, "image/jpeg").pipe(
          Effect.provide(Layer.merge(asFrontOfficeOf(schoolId), fakeStorageLive))
        )
        expect(uploadUrl).toContain(schoolId)
        expect(uploadUrl).toContain(attachmentId)
      })
    ))

  it.effect("a teacher (not front-office/student-life/director) cannot request an upload URL", () =>
    withSchoolFixture(({ schoolId, uploaderPersonId }) =>
      Effect.gen(function*() {
        const result = yield* Effect.result(
          requestUploadUrl(schoolId, uploaderPersonId, "image/jpeg").pipe(
            Effect.provide(Layer.merge(asTeacher(schoolId), fakeStorageLive))
          )
        )
        expect(Result.isFailure(result)).toBe(true)
      })
    ))

  it.effect("an uploaded attachment starts pending_scan and is invisible until clean", () =>
    withSchoolFixture(({ schoolId, uploaderPersonId }) =>
      Effect.gen(function*() {
        const { attachmentId } = yield* requestUploadUrl(schoolId, uploaderPersonId, "image/jpeg").pipe(
          Effect.provide(Layer.merge(asFrontOfficeOf(schoolId), fakeStorageLive))
        )

        const beforeScan = yield* Effect.result(findCleanAttachment(schoolId, attachmentId))
        expect(Result.isFailure(beforeScan)).toBe(true)
        if (Result.isFailure(beforeScan)) expect(beforeScan.failure).toBeInstanceOf(EntityNotFoundError)

        yield* runScan(schoolId, attachmentId).pipe(Effect.provide(cleanScanEngineLive))

        const afterScan = yield* findCleanAttachment(schoolId, attachmentId)
        expect(afterScan.status).toBe("clean")
        expect(afterScan.thumbnail_s3_key).toBe("thumb.jpg")
      })
    ))

  it.effect("a rejected scan never becomes visible", () =>
    withSchoolFixture(({ schoolId, uploaderPersonId }) =>
      Effect.gen(function*() {
        const { attachmentId } = yield* requestUploadUrl(schoolId, uploaderPersonId, "image/jpeg").pipe(
          Effect.provide(Layer.merge(asFrontOfficeOf(schoolId), fakeStorageLive))
        )
        yield* runScan(schoolId, attachmentId).pipe(Effect.provide(rejectingScanEngineLive))

        const result = yield* Effect.result(findCleanAttachment(schoolId, attachmentId))
        expect(Result.isFailure(result)).toBe(true)
      })
    ))

  it.effect("deleting an attachment removes the S3 object and the row", () =>
    withSchoolFixture(({ schoolId, uploaderPersonId }) =>
      Effect.gen(function*() {
        const { attachmentId } = yield* requestUploadUrl(schoolId, uploaderPersonId, "image/jpeg").pipe(
          Effect.provide(Layer.merge(asFrontOfficeOf(schoolId), fakeStorageLive))
        )
        yield* runScan(schoolId, attachmentId).pipe(Effect.provide(cleanScanEngineLive))

        yield* deleteAttachment(schoolId, attachmentId).pipe(Effect.provide(fakeStorageLive))

        expect(fakeDeletedKeys.some((k) => k.includes(attachmentId))).toBe(true)

        const sql = yield* SqlClient
        const rows = yield* withSchool(schoolId, sql`SELECT id FROM attachments WHERE id = ${attachmentId}`)
        expect(rows).toHaveLength(0)
      })
    ))
})
