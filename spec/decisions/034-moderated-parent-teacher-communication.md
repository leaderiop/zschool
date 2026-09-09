# ADR-ZS-034: Parent-teacher communication is moderated by default

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-34

## Context

Direct, unmoderated parent-teacher messaging is a real support and safeguarding
concern at scale — a teacher fielding unmanaged direct messages from every parent in
their class has no boundary on volume or content, and a school has no visibility
into communication happening entirely outside its oversight, which matters both for
staff workload and for child-safety accountability.

## Decision

Parent-teacher communication defaults to moderated mode: the teacher or the school
opens a thread, and the parent replies within it. A school may allow parents to
initiate threads instead. Leadership may view any thread, and this visibility is
disclosed to users rather than happening silently.

## Consequences

**Positive**: gives schools a real communication channel between families and
teachers without either an unbounded direct-messaging free-for-all or leadership
losing all visibility into what's being said.

**Negative**: the moderated model adds friction for the (common, benign) case where
a parent has a quick question and just wants to reach the teacher directly, rather
than waiting for a thread to be opened.

**Trade-off accepted**: bounded, disclosed communication over unmoderated
convenience — the visibility being disclosed to users, rather than covert, is the
compensating control for the safeguarding/oversight rationale.
