# ADR-ZS-050: Guardian matching by strong and weak keys

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-09

## Context

INV-ZS-055's matching rule as originally stated covers only the student side; nothing
specified how the platform should recognize "this is the same guardian" when a
parent's data shows up from two different schools or from a parent declaring their
own child before a school has even enrolled them (URS-ZS-034's dependency).

## Decision

A strong key (a mobile number matching an existing account or profile) proposes an
attachment but never auto-creates a new identity. A weak key (first name + last
name + date of birth, where known) raises an alert rather than auto-attaching.
Within-file de-duplication by mobile number happens at import time. A new MVP
requirement lets a parent declare a child from their own account, creating a
provisional profile the school later claims at enrollment.

## Consequences

**Positive**: gives guardian identity the same strong/weak matching discipline
INV-ZS-055 already established for students, and unblocks the "parent declares a child
first" path the persona research depends on.

**Negative**: a probable-duplicate alert workflow for guardians has to be built
alongside the existing student one — effectively doubling that piece of the
identity-matching surface.

**Trade-off accepted**: matching precision and no silent auto-merging over a
simpler but riskier rule that might auto-attach two different people who happen to
share a name and birth date.
