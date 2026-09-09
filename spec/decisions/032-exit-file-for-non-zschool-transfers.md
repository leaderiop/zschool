# ADR-ZS-032: A bilingual PDF exit file for transfers outside ZSchool

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-32

## Context

Most transfer scenarios happen between two ZSchool schools and can carry the
default transfer profile (INV-ZS-083) natively. A transfer to a school that isn't on the
platform at all needs a different mechanism — there's no receiving system to hand
data to programmatically, only a human at the destination school who needs the
record in a form they can actually use.

## Decision

Transfers to a school outside ZSchool are handled with a bilingual PDF exit file,
reachable through a time-limited secure link and carrying a verification QR code,
available from V1 onward.

## Consequences

**Positive**: gives every transferring student a usable, verifiable record
regardless of whether the destination school is on the platform, which matters for
adoption — families won't tolerate a product that only handles transfers within its
own network.

**Negative**: the exit-file path is a genuinely separate mechanism from the
in-platform transfer flow (different data shape, different security model — a
time-limited link rather than an authenticated in-app transfer), doubling the
transfer feature's surface area.

**Trade-off accepted**: building and maintaining two transfer mechanisms over
restricting transfers to only work between ZSchool schools, because the latter
would make the product actively harmful to a family's interests the moment they
need to leave the ZSchool network entirely.
