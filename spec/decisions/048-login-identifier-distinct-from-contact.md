# ADR-ZS-048: Login identifier distinct from the contact identifier

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-07

## Context

ADR-ZS-022's decision to use a mobile number as the primary contact identifier runs
into real edge cases: a minor student often has no mobile number of their own, and
two guardians in the same household sometimes share a single mobile number between
them. Treating "the phone number" and "the login identifier" as strictly the same
thing makes both cases impossible to represent, and INV-ZS-051, INV-ZS-063, and INV-ZS-044 turn
out to be mutually incompatible without separating the two concepts.

## Decision

`User` carries a distinct login identifier (by default the mobile number, unique)
separate from contact identifiers (mobile, email). A minor student with no mobile
number gets a platform-generated, readable login identifier (deliberately not
derived from the Massar code, to avoid enumeration), activated by a legal guardian
via OTP to the guardian's own number, with a tracked migration path to a personal
number available at any time. Two guardians sharing one mobile number: the second
gets a generated identifier with OTP routed to the shared household number. Foreign
numbers are accepted in E.164 format, with SMS falling back to an international
gateway and WhatsApp preferred. A new invariant (INV-ZS-003, now unified into
`spec/invariants.md`) codifies this.

## Consequences

**Positive**: resolves a genuine incompatibility between three separate rules
(INV-ZS-051, INV-ZS-063, INV-ZS-044) that couldn't all hold under a single "login = phone
number" assumption, and makes both minors-without-phones and phone-sharing
households representable.

**Negative**: authentication now has two distinct identifier concepts to reason
about everywhere (login vs. contact), rather than one, and generated login
identifiers need their own enumeration-resistance design.

**Trade-off accepted**: a more complex identity model over either excluding
phoneless minors from the platform or breaking the one-account-per-person invariant
for phone-sharing households — neither of which was acceptable.
