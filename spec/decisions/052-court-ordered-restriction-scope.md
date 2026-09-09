# ADR-ZS-052: A court-ordered access restriction applies only where recorded, with other schools notified

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-11

## Context

INV-ZS-065 requires a supporting document for any restriction on a guardian's access,
but didn't specify the restriction's actual scope: does a restriction recorded at
one school automatically apply everywhere the student is enrolled, or only where
it was actually verified? An automatic global restriction based on an unverified
claim from one school would let a single school's data-entry error (or bad-faith
action) silently cut off a guardian's access at every other school too.

## Decision

A restriction recorded by one school applies only to the schools that attached the
supporting court order. Other schools with an active enrollment for the same
student are notified (via an AccessRestrictionRecorded event) and must record the
restriction themselves after independently checking the document.

## Consequences

**Positive**: prevents a single school's restriction claim from silently
propagating platform-wide without independent verification at each school, while
still making sure every relevant school is promptly notified.

**Negative**: a guardian legitimately restricted at one school could, in the gap
before another school independently verifies and records it, retain unrestricted
access elsewhere — a real if narrow window.

**Trade-off accepted**: per-school verification over automatic global propagation,
because an unverified global restriction is a bigger risk (wrongly cutting off a
guardian everywhere on one school's say-so) than a short verification-window gap.
