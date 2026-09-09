# ADR-ZS-063: Transfer request lifecycle, signatures, and declared prior records

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-22

## Context

A transfer between two schools touches finance (ADR-ZS-061), the legal-tutor/
legal-guardian distinction (INV-ZS-066), and the enrollment state machine (ADR-ZS-044)
simultaneously, and the original rules didn't fully specify the request's own
lifecycle — who can decline, who can cancel, what happens if nobody acts, and how a
student arriving from outside ZSchool entirely gets represented.

## Decision

`TransferRequest` carries the statuses initiated, approved by the origin school,
accepted by the destination, activated (origin closing and destination activation
in one transaction), declined (destination only, for capacity/track/incomplete-file
reasons), cancelled (by the legal tutor or the adult student before activation), and
expired (30 days after approval with no activation — origin stays ACTIVE, both
notified). The origin school may decline only for a missing legal-tutor signature,
never for financial reasons (ADR-ZS-005). Initiation is open to any legal guardian,
the custodial guardian, or the adult student; approval requires the legal tutor's
(or adult student's) signature specifically. Intra-group transfers follow the same
procedure and default profile. School closure triggers bulk-initiated transfers
(V1). A new MVP requirement, "declared prior record," lets a school record a
student's history from a non-ZSchool school, flagged "unverified" until a document
is attached.

## Consequences

**Positive**: gives the transfer flow a complete, unambiguous lifecycle with clear
authority for every action (who can decline, who can cancel, what a timeout does),
and represents students arriving from outside the platform entirely instead of
requiring them to have no prior history.

**Negative**: the transfer state machine now has six distinct statuses with
different actor permissions on each, a meaningfully larger surface than a simple
approve/reject flow.

**Trade-off accepted**: a fuller transfer lifecycle, precisely scoped (declining
never for financial reasons, per ADR-ZS-005) over a simpler flow that would leave
real scenarios (an expired request, a declared-but-unverified prior school)
unhandled.
