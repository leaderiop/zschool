import * as Context from "effect/Context"
import type * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

/**
 * Ticket #98: the S3 access `Attachment.ts`'s upload flow needs — no AWS SDK
 * import here, same "domain declares the port, an adapter package provides
 * the concrete implementation" split as `ImportQueue.ts`/`NotificationSender`
 * (`AttendanceNotification.ts`). The real bucket (`eu-central-1` primary,
 * `eu-west-3` cross-region replica, ADR-ZS-091) and its adapter Layer are
 * infrastructure this ticket's own AWS console/Terraform side, not
 * something this codebase change can provision — `@zschool/infra`'s
 * `S3.ts` implements this port against a real bucket once one exists.
 */
export class AttachmentStorageError extends Schema.TaggedError<AttachmentStorageError>()("AttachmentStorageError", {
  message: Schema.String
}) {}

export interface PresignedUpload {
  readonly url: string
}

export interface MultipartUpload {
  readonly uploadId: string
}

export interface PresignedPart {
  readonly url: string
}

export interface UploadedPart {
  readonly partNumber: number
  readonly etag: string
}

export interface AttachmentStorage {
  readonly createPresignedUploadUrl: (
    key: string,
    contentType: string
  ) => Effect.Effect<PresignedUpload, AttachmentStorageError>

  /** Resumable multipart upload (ticket #98's own "supporting resumable multipart upload"): `createMultipartUpload` then one `presignUploadPart` per chunk, `completeMultipartUpload` once every part has landed. */
  readonly createMultipartUpload: (
    key: string,
    contentType: string
  ) => Effect.Effect<MultipartUpload, AttachmentStorageError>
  readonly presignUploadPart: (
    key: string,
    uploadId: string,
    partNumber: number
  ) => Effect.Effect<PresignedPart, AttachmentStorageError>
  readonly completeMultipartUpload: (
    key: string,
    uploadId: string,
    parts: ReadonlyArray<UploadedPart>
  ) => Effect.Effect<void, AttachmentStorageError>

  readonly deleteObject: (key: string) => Effect.Effect<void, AttachmentStorageError>
}

export const AttachmentStorage = Context.Service<AttachmentStorage>("@zschool/domain/AttachmentStorage")
