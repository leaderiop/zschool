# ADR-ZS-055: A third-party payer is a relationship carrying only the financial-guardian quality

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-14

## Context

INV-ZS-064 allows a financial guardian to be a third party who is not a legal guardian
(e.g. an employer, a sponsor, an extended-family member paying fees without any
parental role), but the data model needed an explicit shape for that relationship —
otherwise a third-party payer would either need to be forced into an ill-fitting
"legal guardian" relationship type or have no representation at all.

## Decision

A third-party payer is modeled as a `ParentStudentRelationship` of a distinct type
carrying only the "financial guardian" quality, with no academic rights.
`FinancialAccount` always attaches to a relationship, never directly to a bare
payer record.

## Consequences

**Positive**: lets a sponsor or employer pay fees without being granted any
academic visibility they have no legitimate claim to, and keeps `FinancialAccount`
uniformly attached to the same relationship model used everywhere else.

**Negative**: one more relationship-type variant for every screen and permission
check that reasons about `ParentStudentRelationship` to handle correctly (a
financial-only relationship with no academic rights, distinct from every other
type).

**Trade-off accepted**: a narrower-scoped relationship type over either excluding
third-party payers from the model entirely or over-granting them academic access
they shouldn't have.
