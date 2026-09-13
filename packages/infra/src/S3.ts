import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { AttachmentStorage, AttachmentStorageError } from "@zschool/domain"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

/**
 * The real `AttachmentStorage` backing for ticket #98 — `packages/domain`
 * stays platform-agnostic (no AWS SDK import there), same "port in domain,
 * adapter in its own package" split as `Sqs.ts`'s `SqsImportQueueLive`.
 *
 * The bucket itself (`eu-central-1` primary, `eu-west-3` cross-region
 * replica, ADR-ZS-091) is infrastructure this codebase change cannot
 * provision — a human with AWS console/Terraform access does that; this
 * Layer only assumes `ATTACHMENTS_BUCKET`/`AWS_REGION` resolve to a bucket
 * that already exists once it's actually deployed.
 */
export const attachmentsBucket = Config.String("ATTACHMENTS_BUCKET")

const makeS3Client = Effect.gen(function*() {
  const region = yield* Config.String("AWS_REGION").pipe(Config.withDefault("eu-central-1"))
  return new S3Client({ region })
})

const PRESIGNED_URL_EXPIRY_SECONDS = 15 * 60

export const S3AttachmentStorageLive = Layer.effect(
  AttachmentStorage,
  Effect.gen(function*() {
    const bucket = yield* attachmentsBucket
    const client = yield* makeS3Client

    const wrap = <A>(operation: string, promise: () => Promise<A>) =>
      Effect.tryPromise({
        try: promise,
        catch: (cause) => new AttachmentStorageError({ message: `${operation} failed: ${String(cause)}` })
      })

    return {
      createPresignedUploadUrl: (key, contentType) =>
        wrap("createPresignedUploadUrl", () =>
          getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), {
            expiresIn: PRESIGNED_URL_EXPIRY_SECONDS
          }).then((url) => ({ url }))),

      createMultipartUpload: (key, contentType) =>
        wrap("createMultipartUpload", () =>
          client.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType })).then(
            (result) => {
              if (result.UploadId === undefined) throw new Error("no UploadId returned")
              return { uploadId: result.UploadId }
            }
          )),

      presignUploadPart: (key, uploadId, partNumber) =>
        wrap("presignUploadPart", () =>
          getSignedUrl(
            client,
            new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber }),
            { expiresIn: PRESIGNED_URL_EXPIRY_SECONDS }
          ).then((url) => ({ url }))),

      completeMultipartUpload: (key, uploadId, parts) =>
        wrap("completeMultipartUpload", () =>
          client.send(
            new CompleteMultipartUploadCommand({
              Bucket: bucket,
              Key: key,
              UploadId: uploadId,
              MultipartUpload: { Parts: parts.map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })) }
            })
          )).pipe(Effect.asVoid),

      deleteObject: (key) =>
        wrap("deleteObject", () => client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))).pipe(
          Effect.asVoid
        )
    }
  })
)
