# ADR-ZS-049: Handling phone-number change, loss, and SIM reassignment

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-08

## Context

Morocco has high SIM churn, and numbers get recycled to new subscribers after a
period of inactivity. A platform using the phone number as a login identifier
(ADR-ZS-022, ADR-ZS-048) is exposed to a real risk: someone who's issued a
previously-used number could gain access to the prior holder's family data unless
the platform actively detects and challenges that case.

## Decision

Four mechanisms, all MVP: (a) self-service number change via OTP to both the old
and new number; (b) an in-person path at any school with an active relationship —
identity verification by office staff, leadership approval, logged, other schools
notified; (c) recycled-number detection — after 6 months of no login or repeated OTP
failures, a knowledge challenge (an undisplayed answer, e.g. a linked child's date
of birth) is required before any access, with schools alerted; (d) the same
knowledge challenge applies to account claiming, with a school able to revoke and
reissue a claim.

## Consequences

**Positive**: closes a real, high-likelihood account-takeover vector specific to
Morocco's SIM-churn rate, without requiring every number change to go through a
slow manual process.

**Negative**: four distinct mechanisms (self-service, in-person, automated
detection, claim-specific) is meaningfully more security surface to build and test
correctly than a single "just verify the new number" flow.

**Trade-off accepted**: this layered complexity over a simpler but exploitable
model — a recycled number silently granting access to a stranger would be a severe,
foreseeable harm to a family already using the platform.
