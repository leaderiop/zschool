import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import { AttachmentStorage, type UploadedPart } from "./AttachmentStorage.ts"
import { canRecordJustification } from "./authorization/Policies.ts"
import { AttachmentId, SchoolId } from "./Ids.ts"
import { authorizeWith, EntityNotFoundError, requireOwnedRow } from "./Ownership.ts"
import { ScanEngine } from "./ScanEngine.ts"

export { EntityNotFoundError }

export class AttachmentNotCleanError extends Schema.TaggedError<AttachmentNotCleanError>()(
  "AttachmentNotCleanError",
  { attachmentId: Schema.String }
) {}

/**
 * `Model.Class` for `attachments` (migration 0028, ticket #98). `s3_key` is
 * derived from the row's own `id` (`attachments/<school_id>/<id>`) once the
 * DB has generated it — never a caller-supplied path — so there's no
 * separate identifier space to keep in sync with the primary key.
 */
export class Attachment extends Model.Class<Attachment>("Attachment")({
  id: Model.Field({ select: AttachmentId, update: AttachmentId, json: AttachmentId, jsonUpdate: AttachmentId }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  status: Schema.Literals(["pending_scan", "clean", "rejected"]),
  s3_key: Schema.String,
  thumbnail_s3_key: Schema.NullOr(Schema.String),
  content_type: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  uploaded_by_person_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  multipart_upload_id: Schema.NullOr(Schema.String),
  created_at: Model.GeneratedByDb(Schema.DateTimeUtcFromMillis),
  scanned_at: Schema.NullOr(Schema.DateTimeUtcFromMillis)
}) {}

const attachmentRepo = SqlModel.makeRepository(Attachment, {
  tableName: "attachments",
  spanPrefix: "Attachment",
  idColumn: "id"
})

const keyFor = (schoolId: string, attachmentId: string) => `attachments/${schoolId}/${attachmentId}`

/**
 * Requests a single-part pre-signed upload URL, scoped to the caller's
 * school (ticket #98's own acceptance criterion). Gated by
 * `canRecordJustification` — front-office/student-life/director, the same
 * roles ticket #94 already lets record a justification's intake; a
 * guardian's own self-upload (ticket #101's parent screen) needs a
 * guardian-portal auth flow that doesn't exist yet, same "policy ahead of
 * its own login flow" gap `financialGuardianViewingOwnData` already
 * documents.
 */
export const requestUploadUrl = Effect.fn("Attachment.requestUploadUrl")(function*(
  rawSchoolId: string,
  uploadedByPersonId: string,
  contentType: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canRecordJustification,
    "upload-attachment",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const repo = yield* attachmentRepo
        const storage = yield* AttachmentStorage
        const attachment = yield* repo.insert({
          school_id: schoolId,
          status: "pending_scan",
          s3_key: "",
          thumbnail_s3_key: null,
          content_type: contentType,
          uploaded_by_person_id: uploadedByPersonId,
          multipart_upload_id: null,
          scanned_at: null
        })
        const key = keyFor(schoolId, attachment.id)
        const presigned = yield* storage.createPresignedUploadUrl(key, contentType)
        yield* repo.update({
          id: attachment.id,
          status: attachment.status,
          s3_key: key,
          thumbnail_s3_key: attachment.thumbnail_s3_key,
          multipart_upload_id: attachment.multipart_upload_id,
          scanned_at: attachment.scanned_at
        })
        return { attachmentId: attachment.id, uploadUrl: presigned.url }
      })
    )
  )
})

/** Same as `requestUploadUrl`, but for a resumable multipart upload — the client uploads each part directly to the URL `presignUploadPartUrl` returns, then calls `completeUpload`. */
export const requestMultipartUploadUrl = Effect.fn("Attachment.requestMultipartUploadUrl")(function*(
  rawSchoolId: string,
  uploadedByPersonId: string,
  contentType: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorizeWith(
    canRecordJustification,
    "upload-attachment",
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const repo = yield* attachmentRepo
        const storage = yield* AttachmentStorage
        const attachment = yield* repo.insert({
          school_id: schoolId,
          status: "pending_scan",
          s3_key: "",
          thumbnail_s3_key: null,
          content_type: contentType,
          uploaded_by_person_id: uploadedByPersonId,
          multipart_upload_id: null,
          scanned_at: null
        })
        const key = keyFor(schoolId, attachment.id)
        const multipart = yield* storage.createMultipartUpload(key, contentType)
        yield* repo.update({
          id: attachment.id,
          status: attachment.status,
          s3_key: key,
          thumbnail_s3_key: attachment.thumbnail_s3_key,
          multipart_upload_id: multipart.uploadId,
          scanned_at: attachment.scanned_at
        })
        return { attachmentId: attachment.id, uploadId: multipart.uploadId }
      })
    )
  )
})

export const presignUploadPartUrl = Effect.fn("Attachment.presignUploadPartUrl")(function*(
  rawSchoolId: string,
  attachmentId: string,
  partNumber: number
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const attachment = yield* requireOwnedRow(
        sql,
        "attachments",
        "attachment",
        attachmentId,
        schoolId,
        Schema.Struct({ s3_key: Schema.String, multipart_upload_id: Schema.String }),
        "s3_key, multipart_upload_id"
      )
      const storage = yield* AttachmentStorage
      return yield* storage.presignUploadPart(attachment.s3_key, attachment.multipart_upload_id, partNumber)
    })
  )
})

export const completeMultipartUpload = Effect.fn("Attachment.completeMultipartUpload")(function*(
  rawSchoolId: string,
  attachmentId: string,
  parts: ReadonlyArray<UploadedPart>
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const attachment = yield* requireOwnedRow(
        sql,
        "attachments",
        "attachment",
        attachmentId,
        schoolId,
        Schema.Struct({ s3_key: Schema.String, multipart_upload_id: Schema.String }),
        "s3_key, multipart_upload_id"
      )
      const storage = yield* AttachmentStorage
      yield* storage.completeMultipartUpload(attachment.s3_key, attachment.multipart_upload_id, parts)
    })
  )
})

/**
 * The scan pipeline's own entry point — invoked by whatever triggers on a
 * new S3 object (an event notification, once the real bucket exists; a
 * polling worker until then), not a human action, so this is deliberately
 * unauthorized/internal, the same category as `Dunning.ts`'s
 * `evaluateDunningForOverdueInstallments`. Transitions `pending_scan` to
 * `clean` (recording the generated thumbnail) or `rejected`.
 */
export const runScan = Effect.fn("Attachment.runScan")(function*(rawSchoolId: string, attachmentId: string) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const attachment = yield* requireOwnedRow(
        sql,
        "attachments",
        "attachment",
        attachmentId,
        schoolId,
        Schema.Struct({ s3_key: Schema.String, content_type: Schema.String }),
        "s3_key, content_type"
      )
      const engine = yield* ScanEngine
      const result = yield* engine.scan(attachment.s3_key, attachment.content_type)
      yield* sql`
        UPDATE attachments
        SET status = ${result.clean ? "clean" : "rejected"}, thumbnail_s3_key = ${result.thumbnailKey}, scanned_at = now()
        WHERE id = ${attachmentId}
      `
    })
  )
})

/** Invisible until `clean` (ticket #98's own acceptance criterion) — a `pending_scan`/`rejected` attachment is reported not found, the same "existence itself is part of what's protected" treatment `Ownership.ts`'s `EntityNotFoundError` doc comment describes for cross-tenant rows. */
export const findCleanAttachment = Effect.fn("Attachment.findCleanAttachment")(function*(
  rawSchoolId: string,
  attachmentId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const rows = yield* sql`SELECT * FROM attachments WHERE id = ${attachmentId} AND status = 'clean'`
      const [row] = rows
      if (row === undefined) {
        return yield* Effect.fail(new EntityNotFoundError({ entityType: "attachment", entityId: attachmentId }))
      }
      return yield* Schema.decodeUnknownEffect(Attachment)(row)
    })
  )
})

/**
 * Deletion wired into the same job that anonymizes the parent record
 * (ticket #98's own requirement, ADR-ZS-003) — not built yet (no
 * anonymization job exists anywhere in this codebase yet, for any data
 * type), so this is the function such a job calls, the same "the record-
 * creation function exists; wiring a scheduling harness to invoke it is out
 * of this ticket's scope" precedent `Dunning.ts` already sets.
 */
export const deleteAttachment = Effect.fn("Attachment.deleteAttachment")(function*(
  rawSchoolId: string,
  attachmentId: string
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* withSchool(
    schoolId,
    Effect.gen(function*() {
      const sql = yield* SqlClient
      const attachment = yield* requireOwnedRow(
        sql,
        "attachments",
        "attachment",
        attachmentId,
        schoolId,
        Schema.Struct({ s3_key: Schema.String }),
        "s3_key"
      )
      const storage = yield* AttachmentStorage
      yield* storage.deleteObject(attachment.s3_key)
      yield* sql`DELETE FROM attachments WHERE id = ${attachmentId}`
    })
  )
})
