# ADR-ZS-031: Fatourati as the primary online payment rail

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-31

## Context

Online payment in Morocco for a platform that never wants to hold student/parent
funds itself needs a rail that keeps ZSchool out of the funds-custody business
while still letting parents pay online. Several options exist (Fatourati, card
networks, direct bank integration), each with different integration complexity and
funds-flow implications.

## Decision

Fatourati (Collect, then Aggregator) is the primary online-payment rail from V1
onward, with no funds held by ZSchool. A registered bank card via NAPS e-Premium or
Chari Pay is a V2 addition; direct debit is left to each school's own bank
relationship rather than being built into the platform.

## Consequences

**Positive**: keeps ZSchool out of funds custody and the regulatory burden that
would come with it, while still giving parents a real online-payment option from
V1.

**Negative**: schools that want a payment method Fatourati doesn't cover have no
platform-native option until V2 at the earliest, and direct debit specifically is
never built in at all — schools handle it entirely through their own bank.

**Trade-off accepted**: a narrower V1 payment surface, staged in over two versions,
over building broader payment-rail support immediately at higher integration cost
and regulatory exposure.
