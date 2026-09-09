# ADR-ZS-026: The MVP / V1 / V2 scope breakdown

> **Status:** Accepted — later extended, see ADR-ZS-041
> **Date:** 2026-09-09
> **Historical aliases:** DEC-15

## Context

A platform this broad (identity, enrollment, attendance, grading, finance,
communication, transfers, career, reporting, Massar, and later ancillary services
and health) cannot ship everything at once without an unbounded first release. A
staged scope was needed that still lets pilot schools genuinely operate on the
platform at MVP, not merely demo it.

## Decision

Scope is split into MVP (validation with 3-5 pilot schools: onboarding, identity,
a simplified enrollment state machine, attendance with notification, grading and
immutable report cards, base finance, communication, dashboards, a simple transfer,
FR/AR responsive web), V1 (commercial launch: admissions/re-enrollment, full
timetabling, full discipline, self-service documents, full finance, Massar exports,
multi-school organizations, WhatsApp Business API, native apps, formalized
compliance), and V2+ (academic passport, teacher network, online payment, transport/
canteen/health, automatic timetabling, a public API, English, e-learning).

## Consequences

**Positive**: gives every subsequent chapter (functional modules, roadmap,
requirements) an unambiguous version tag to organize against, and keeps the MVP
genuinely operable rather than a stripped demo.

**Negative**: some genuinely useful functionality (full discipline tooling, native
apps, online payment) is deliberately absent from the pilots, which pilot schools
will notice and may push back on.

**Trade-off accepted**: a real, usable MVP scoped tightly enough to validate the
core promise over a broader first release that would take longer to ship and be
harder to build correctly under time pressure. ADR-ZS-041 records the later
mid-year-close extension made once pilot timing was worked through.
