import { makeSubject } from "@qadi/core/AuthSubject"
import { SubjectExtractionFailed, subjectExtractorBearer } from "@qadi/http/SubjectExtractor"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { createRemoteJWKSet, jwtVerify } from "jose"

/**
 * Issue #38 / ADR-ZS-085: the platform's actual JWT issuer is Amazon
 * Cognito, verified in-app via JWKS — no API Gateway sits in front of it.
 * Provisioning the User Pool itself (the JWKS endpoint this config points
 * at) is separate infrastructure work (ADR-ZS-082's Function Alchemy
 * deployment, out of this ticket's scope); this reads whatever JWKS
 * endpoint/issuer/audience the environment names, so this code is already
 * correct the day that infrastructure exists.
 */
const AuthConfig = Config.all({
  jwksUrl: Config.String("AUTH_JWKS_URL"),
  issuer: Config.String("AUTH_ISSUER"),
  audience: Config.String("AUTH_AUDIENCE")
})

/**
 * Cognito's own claim names for a User Pool Group membership
 * (`cognito:groups`, the idiomatic way to carry a role in a Cognito token)
 * and a custom attribute (the `custom:` prefix every non-standard Cognito
 * attribute carries) — `school_id` is exactly such an attribute, set once at
 * account provisioning and never taken from caller input, matching
 * `Ownership.ts`'s own stated invariant for where `school_id` may come from.
 */
const ROLES_CLAIM = "cognito:groups"
const SCHOOL_ID_CLAIM = "custom:school_id"

/**
 * A validly-signed token missing `sub` or `custom:school_id` is still a
 * malformed credential, not a real subject — `String(undefined)` would
 * otherwise silently mint the literal id `"undefined"` (collapsing every
 * such caller into one bogus identity in decision-history/audit logs), and
 * an absent `school_id` would silently deny every school-scoped policy with
 * no diagnostic pointing at the actual cause. Both fail extraction instead,
 * the same way a bad signature does.
 */
const toAuthSubject = (payload: Record<string, unknown>) =>
  Effect.gen(function*() {
    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      return yield* new SubjectExtractionFailed({ reason: "token is missing a `sub` claim" })
    }
    const schoolId = payload[SCHOOL_ID_CLAIM]
    if (typeof schoolId !== "string" || schoolId.length === 0) {
      return yield* new SubjectExtractionFailed({ reason: `token is missing a \`${SCHOOL_ID_CLAIM}\` claim` })
    }
    return makeSubject({
      id: payload.sub,
      roles: Array.isArray(payload[ROLES_CLAIM]) ? payload[ROLES_CLAIM].map(String) : [],
      attributes: { school_id: schoolId }
    })
  })

/**
 * The production `SubjectExtractor` (`@qadi/http`): resolves the JWKS once
 * per process (`createRemoteJWKSet` caches and auto-refetches the key set
 * itself) and verifies every bearer token's signature, issuer, and audience
 * against it. A verification failure is a `SubjectExtractionFailed` — per
 * that error's own doc comment, this is "the credential store is broken or
 * the token is bad," not a denial `@qadi/core` should reason about, so
 * `RequirePermission`'s middleware answers it with a flat 502, never a 403.
 */
export const AuthorizationLive = Layer.unwrap(
  Effect.gen(function*() {
    const config = yield* AuthConfig
    const jwks = createRemoteJWKSet(new URL(config.jwksUrl))
    const lookup = (token: string) =>
      Effect.tryPromise({
        try: () => jwtVerify(token, jwks, { issuer: config.issuer, audience: config.audience }),
        catch: (cause) => new SubjectExtractionFailed({ reason: String(cause) })
      }).pipe(Effect.flatMap(({ payload }) => toAuthSubject(payload)))

    return subjectExtractorBearer(lookup)
  })
)
