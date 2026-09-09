# ADR-ZS-085: Amazon Cognito with a custom OTP authentication flow

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §6)

## Context

The platform's actual login model (a mobile-number-based identifier, an SMS OTP,
per ADR-ZS-022/ADR-ZS-048) doesn't match Cognito's out-of-the-box authentication
flows, which assume username/password or a small set of standard federated
providers. A home-grown authentication system avoids that mismatch but takes on the
full security surface (session management, token issuance, credential storage)
that a managed identity provider would otherwise absorb.

## Decision

Amazon Cognito provides the User Pool and JWT issuance, provisioned via a custom
resource over the typed Cognito APIs, with a custom authentication flow: a
server-generated OTP delivered through the Moroccan SMS aggregator via a Lambda
trigger, plus email as a secondary channel. The issued JWT is verified in-app via
`HttpApiSecurity` and JWKS — no API Gateway sits in front of it.

## Consequences

**Positive**: gets Cognito's managed token issuance, rotation, and session
security for free, while the actual login experience (phone-number identifier, SMS
OTP) still matches what Moroccan parents and staff actually use, via Cognito's
custom-auth extension points rather than fighting its defaults.

**Negative**: a custom authentication flow is a genuinely less-traveled path
through Cognito than its standard flows, and the User Pool itself has no
first-class Alchemy resource, requiring a custom resource wrapper (a risk STACK.md
§11 explicitly tracks).

**Trade-off accepted**: managed-provider security guarantees plus a
build-it-yourself auth flow, over either a fully home-grown system (larger security
surface) or forcing users through a login flow that doesn't match how they actually
authenticate.
