# ADR-ZS-045: Attendance sessions defined independently of the timetable at MVP

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-04

## Context

Attendance-taking (an MVP requirement) was originally implied to depend on the full
timetable module, which is V1 scope — an inverted dependency that would have made
attendance impossible to ship at MVP at all. Real attendance-taking doesn't
actually require a fully conflict-checked timetable; it only needs a way to say
which course met, when, in which declared slot.

## Decision

At MVP, an attendance session is defined simply as (course, date, declared time
slot): the teacher picks the course and an open slot, and student-life staff can
declare a simple weekly grid of expected sessions with no rooms or conflict
checking. In V1, the full timetable (BEH-ZS-061) automatically feeds these expected
sessions instead. Session uniqueness is enforced per (course, date, time slot).

## Consequences

**Positive**: unblocks attendance — an MVP-critical, daily-use feature — from a
timetable dependency that wasn't actually necessary and wouldn't ship until V1
otherwise.

**Negative**: MVP attendance reporting has no room or conflict awareness, and the
"declared session" concept is a distinct data source from the eventual V1 timetable
feed, requiring a defined handoff between the two.

**Trade-off accepted**: a simpler, timetable-independent MVP attendance model over
correctly sequencing the dependency (timetable before attendance), which would have
delayed a daily-use MVP feature behind a V1 module.
