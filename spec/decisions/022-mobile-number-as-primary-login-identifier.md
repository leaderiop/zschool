# ADR-ZS-022: Mobile phone number as the primary contact identifier

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-11

## Context

Morocco's mobile penetration is high and near-universal, while email adoption is
uneven, particularly among parents and non-office staff who are the platform's
largest user population. A platform built around email as the primary identifier
would exclude or degrade the experience for a large share of its actual users.

## Decision

The primary contact identifier is a mobile phone number; email is optional. (A
separate, distinct login-identifier mechanism was later introduced for people
without their own number — see ADR-ZS-048.)

## Consequences

**Positive**: matches the actual reachability of the target user base — nearly
every guardian has a mobile number to receive an OTP on, which email adoption
doesn't guarantee.

**Negative**: SMS/WhatsApp OTP delivery becomes a hard operational dependency (an
aggregator relationship, delivery reliability, cost per message) for something as
basic as login, rather than a free channel like email.

**Trade-off accepted**: reachability for the real user base over the lower
operating cost of an email-first identity system.
