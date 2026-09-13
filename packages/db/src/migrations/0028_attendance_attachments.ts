import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { applyTenantIsolation } from "./shared.ts"

/**
 * Ticket #98 (justification attachment storage, wayfinder ticket #84):
 * `attachments` is a standalone storage primitive — no FK to a
 * `Justification` entity, since none of this map's tickets actually define
 * one as its own domain model (ticket #103's "front-desk/parent
 * justification validation queue" and ticket #101's parent screen both
 * reference "the justification" without owning its storage) — a future
 * ticket introducing `Justification` links to `attachments.id`, not the
 * other way around.
 */
export default Effect.gen(function*() {
  const sql = yield* SqlClient

  yield* sql`
    CREATE TABLE attachments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL REFERENCES schools (id),
      status text NOT NULL CHECK (status IN ('pending_scan', 'clean', 'rejected')) DEFAULT 'pending_scan',
      s3_key text NOT NULL UNIQUE,
      thumbnail_s3_key text,
      content_type text NOT NULL,
      uploaded_by_person_id uuid NOT NULL REFERENCES persons (id),
      multipart_upload_id text,
      created_at timestamptz NOT NULL DEFAULT now(),
      scanned_at timestamptz
    )
  `
  yield* applyTenantIsolation(sql, "attachments")
})
