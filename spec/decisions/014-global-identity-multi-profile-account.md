# ADR-ZS-014: A global identity, decoupled from any one school

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-03

## Context

This is the product's own founding idea (see the executive summary): a person's
identity should not depend on the school. Making that concrete in the data model
requires deciding how accounts, profiles, and school relationships actually
compose — a single global identity per person is straightforward to state but has
real consequences for how multi-role people (a parent who is also a teacher
elsewhere) and pre-account people (a preschool child, a teacher not yet invited) get
represented.

## Decision

A global identity exists for students, parents, teachers, and staff, independent of
any school. An account may carry several profiles (a person can be a parent at one
school and a teacher at another). A profile may exist with no account at all (a
preschool child represented entirely through their guardians; a teacher created by
a school before they activate their own account).

## Consequences

**Positive**: directly delivers the product's founding promise — a multi-child,
multi-school parent uses one account; a transferring student keeps their record;
this decision is the data-model foundation everything else in the domain model
builds on.

**Negative**: the account/profile/relationship separation is a genuinely more
complex data model than a simpler "one school, one student record" system would
need, with real consequences for matching, merging, and permission scoping (see
ADR-ZS-... on Massar matching and merge operations).

**Trade-off accepted**: modeling complexity now, in exchange for a product that can
actually keep the "identity doesn't depend on the school" promise instead of merely
stating it in marketing copy while the data model quietly assumes otherwise.
