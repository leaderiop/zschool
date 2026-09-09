# ADR-ZS-004: Subscription cancellation — export window, then deletion

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-23

## Context

A school leaving the platform needs a predictable, bounded process — both so the
school isn't left scrambling for its own historical data, and so ZSchool isn't left
holding operational data indefinitely for a tenant that no longer pays. Nothing in
the original description addressed what happens to a school's data after it cancels.

## Decision

On cancellation: a full export of the school's data and documents is handed to the
school; read-only access continues for 90 days; operational data is deleted 12
months after cancellation. People (students, parents, teachers) keep their global
identity and access to their own published documents regardless of what the
originating school does.

## Consequences

**Positive**: a bounded, predictable timeline that protects both the departing
school (guaranteed export, a grace window) and the people whose documents must
remain reachable independent of any one school's subscription status.

**Negative**: operational data has to be tracked per-tenant against a 12-month
deletion clock, and the read-only mode during the 90-day window has to be enforced
consistently across every module, not just the obvious ones (finance, academics).

**Trade-off accepted**: a fixed 12-month deletion horizon over indefinite retention
"just in case" — indefinite retention of a cancelled tenant's operational data would
be both a Law 09.08 liability and a cost with no offsetting subscription revenue.
