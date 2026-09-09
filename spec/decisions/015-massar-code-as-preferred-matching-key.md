# ADR-ZS-015: The Massar code as preferred, non-mandatory matching key

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-04

## Context

A global identity model needs a reliable way to recognize "this is the same student"
across two schools' enrollment data. The ministry's Massar code is the closest thing
to a national student identifier, but it isn't universally entered correctly or
even always available (e.g. very young children before their first official
enrollment), so treating it as mandatory would block onboarding for real students.

## Decision

The Massar code, when provided, is the preferred matching key and is unique across
the platform. It is not mandatory — matching falls back to weaker signals (name,
date of birth, a guardian's phone number) when it is absent, with a probable-duplicate
alert rather than an automatic match in that weaker case.

## Consequences

**Positive**: gets the strong, low-ambiguity matching signal the platform needs
whenever the code is available, without making onboarding depend on data schools
don't always have.

**Negative**: the weak-match path (name + date of birth + guardian phone) needs its
own careful duplicate-detection and merge workflow, since it can't auto-attach
without risking merging two different children.

**Trade-off accepted**: matching accuracy on the common case (Massar code present)
over a simpler, single-signal matching rule that would exclude students without one.
