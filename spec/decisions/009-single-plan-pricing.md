# ADR-ZS-009: A single all-inclusive pricing plan

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-28

## Context

Per-module pricing is the norm among school-management SaaS competitors observed in
the Moroccan market, but it creates a sales friction ZSchool's own differentiation
(a genuinely global identity across every module) works against: a school that only
buys the "attendance" module gets none of the cross-module value (a single identity
feeding attendance, grades, finance, and communication together) that is the whole
point of the product.

## Decision

A single plan at MAD 5 per active student per month, billed over 10 months
(September to June), includes every available module — administration, academics,
attendance, grades, report cards, communication, finance, timetable, documents,
transfers, and later modules (transport, canteen, health, online payment, an API) as
they roll out. No paid option exists per module. Only consumables (SMS, WhatsApp,
storage beyond quota) and services (onboarding, migration) are billed on top.
Confirmed by the product owner on 9 September 2026.

## Consequences

**Positive**: a simple, predictable sales conversation (one number, no module
matrix to negotiate), and it structurally prevents the "bought half the modules,
gets none of the cross-module value" failure mode that undermines the product's core
differentiation.

**Negative**: schools that only want one or two modules pay for the full platform
regardless, which may push price-sensitive small schools toward a cheaper
single-purpose competitor for their narrower need.

**Trade-off accepted**: pricing simplicity and protecting the cross-module value
proposition over maximizing addressable market among schools that only want a
narrow slice of functionality.
