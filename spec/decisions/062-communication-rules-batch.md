# ADR-ZS-062: Communication rules — MVP threads, channel timing, language, opt-out, WABA

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-21, historical alias: D1

## Context

The channel hierarchy (ADR-ZS-036) and moderated-communication decision (ADR-ZS-
034) both needed concrete timing and scope rules to actually implement: which
channels ship at MVP versus V1, how per-person language preference interacts with
bilingual content, what "STOP" actually opts a household out of, when sends defer
for quiet hours, and how the WhatsApp Business Account itself is provisioned. D1
(MVP channels = in-app + SMS + WhatsApp utility, limited to attendance; V1 = full
rollout including push) is the same channel-scoping decision this arbitration
makes concrete and is folded in here.

## Decision

Eight rules: (a) moderated parent-teacher threads are MVP, consistent with ADR-
ZS-034. (b) No push notifications at MVP; the full ADR-ZS-036 channel hierarchy
applies from V1. (c) A per-person FR/AR language preference on `User` governs SMS,
WhatsApp, and in-app delivery; bilingual institutional content covers
announcements, documents, and in-app messages regardless. (d) "STOP" opts out of
reminders and announcements only — attendance, security, and authentication
notifications keep sending, and the parent is told so. (e) Reminders and
announcements defer outside 08:00-20:00 and during configured windows (Ramadan,
Friday); attendance and security notifications are exempt. (f) A "read" status is
shown only on channels that support it (in-app, WhatsApp); SMS reports "delivered"
at most. (g) A single ZSchool WhatsApp Business Account serves MVP, with a
per-school display name and per-school opt-in; a per-school number becomes a V1
option; inbound replies get an automatic bilingual acknowledgment routed to
student-life staff as a message queue. (h) Authentication SMS cost is borne by
ZSchool as a platform expense, not billed to schools.

## Consequences

**Positive**: gives every notification-sending code path an unambiguous channel,
timing, and language rule to follow, and D1's MVP-vs-V1 channel split is now
expressed as part of one coherent communication ruleset rather than a standalone
note.

**Negative**: eight interacting rules (channel, timing, language, opt-out,
read-status, WABA provisioning, authentication-cost) is substantial complexity for
what looks superficially like "send a message."

**Trade-off accepted**: rule precision over ambiguity, because getting
communication wrong (over-notifying, under-notifying, or notifying in the wrong
language) directly damages trust with families — the product's primary daily
touchpoint.
