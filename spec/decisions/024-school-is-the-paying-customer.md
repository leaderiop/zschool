# ADR-ZS-024: The school is the paying customer; families and teachers pay nothing

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-13

## Context

A school-management platform could in principle charge on either side of the
two-sided market it connects (schools, or the families/teachers who use it), and
several competitors in adjacent markets charge parents directly for premium
features. Charging parents would directly undermine the product's own value
proposition, which depends on universal adoption by every family at a subscribing
school — a paywall on the parent side would fragment that adoption.

## Decision

The paying customer is the school (billed per active student per school year, in
MAD). Parents, students, and teachers pay nothing to use the platform.

## Consequences

**Positive**: removes any adoption friction on the family/teacher side, which
matters directly for the product's own value — a parent app is only as valuable as
its actual adoption rate among a school's families.

**Negative**: the entire revenue model rests on school-side willingness to pay,
with no secondary revenue stream from the (much larger) population of individual
users.

**Trade-off accepted**: single-sided monetization and free universal access over a
two-sided model that would generate more revenue streams but actively work against
the product's core "everyone actually uses it" value proposition.
