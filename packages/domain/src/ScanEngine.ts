import * as Context from "effect/Context"
import type * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

/**
 * Ticket #98: the malware-check + EXIF-strip + thumbnail-generation step
 * between `pending_scan` and `clean`/`rejected`. No real scanning engine
 * (ClamAV or a managed equivalent) exists in this infrastructure yet — same
 * "port in domain, adapter elsewhere, stub until the real thing exists"
 * split as `AttachmentStorage.ts`/`NotificationSender`.
 */
export class ScanEngineError extends Schema.TaggedError<ScanEngineError>()("ScanEngineError", {
  message: Schema.String
}) {}

export interface ScanResult {
  readonly clean: boolean
  /** `null` when `clean` is `false` — a rejected upload gets no thumbnail. */
  readonly thumbnailKey: string | null
}

export interface ScanEngine {
  readonly scan: (key: string, contentType: string) => Effect.Effect<ScanResult, ScanEngineError>
}

export const ScanEngine = Context.Service<ScanEngine>("@zschool/domain/ScanEngine")
