# ADR-ZS-056: Absence-notification timing, grouping, and correction rules

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-15

## Context

An under-5-minute absence notification (chapter 10) sent on every single absence
event would flood parents with messages on a bad day and burn through the SMS/
WhatsApp cost budget on false positives (a roll-call correction moments later).
Real rules were needed for when to send, when to hold, and how to handle
corrections and disputes between two roll-call sources.

## Decision

Six rules: (a) only the first absence of the day (or half-day, configurable per
cycle) triggers the fast notification; later same-day absences group into an
evening summary. (b) A 3-minute hold window after validation lets a correction
cancel the send; a post-send correction triggers a correction notice on the same
channel. (c) Quiet hours never suppress attendance notifications, only others. (d)
Student-life staff may record a front-desk justification on a guardian's behalf,
logged as school-entered. (e) A discrepancy between two roll calls for the same
session: the first validation stands for notification purposes, the second opens a
discrepancy for staff to arbitrate, with no further notification while open. (f)
Preschool gets its own configurable delay/grouping, defaulting to a half-day
summary.

## Consequences

**Positive**: keeps the notification genuinely useful (fast, not noisy) while
controlling consumable cost against false positives, and gives student-life staff
a defined way to handle the routine cases (front-desk justifications, roll-call
discrepancies) that pure automation can't resolve alone.

**Negative**: six interacting rules is meaningfully more logic than a single
"notify on every absence" rule, and the discrepancy-arbitration path needs its own
UI and staff workflow.

**Trade-off accepted**: rule complexity over either notification noise (hurting
trust and cost) or a slower, always-manually-reviewed notification (defeating the
under-5-minute promise).
