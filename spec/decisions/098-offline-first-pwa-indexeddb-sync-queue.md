# ADR-ZS-098: Offline-first PWA via IndexedDB and a sync queue

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §7) — see BES-SUR-01, BES-ENS-02/03

## Context

Attendance-taking and grade entry (URS-ZS-018, URS-ZS-027/03) explicitly need to
tolerate connectivity drops — a real condition in Moroccan school buildings, not an
edge case — and the platform is a PWA rather than a native app at MVP (ADR-ZS-087),
so offline support has to be built at the web-application layer rather than relying
on native-app offline primitives.

## Decision

An IndexedDB (Dexie) application cache holds data locally, with a sync queue that
replays queued writes idempotently against the API once connectivity returns.
Conflicts are resolved by row version, arbitrated server-side rather than left to
the client to guess.

## Consequences

**Positive**: attendance-taking and grade entry keep working through a
connectivity drop — exactly the scenario the requirement exists to cover — without
requiring a native app to get there.

**Negative**: idempotent replay and server-side conflict arbitration are genuinely
harder to build and test correctly than an always-online write path, and every
offline-capable write path has to be designed with this queue in mind from the
start.

**Trade-off accepted**: the real engineering cost of offline-first design over
either requiring connectivity (directly violating URS-ZS-018/ENS-02/03) or
deferring offline support past MVP, which the same requirements make clear isn't
acceptable.
