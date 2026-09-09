# ADR-ZS-013: The school is the data-isolation tenant, not the organization

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-02

## Context

Multi-site school groups are common in the Moroccan market, and the original
description was internally inconsistent about the isolation boundary — §13 implied
strict isolation while other sections implied a shared directory and consolidated
views across sites. Left unresolved, this ambiguity would have made it unclear
whether two schools in the same group can see each other's operational data by
default.

## Decision

The isolation tenant is the school. The organization (a school group) is a
consolidation level offering shared administration and consolidated reporting
views, never a data merge — two schools in the same organization do not
automatically see each other's students, grades, or finances.

## Consequences

**Positive**: gives every module a single, unambiguous isolation boundary to design
against (the school), while still letting a group leadership team get the
consolidated view they need without weakening per-school isolation.

**Negative**: a group-level feature (e.g. a consolidated finance report) has to be
built as an explicit aggregation layer over isolated per-school data, rather than
simply querying across a shared tenant.

**Trade-off accepted**: strict per-school isolation as the default, with
consolidation as an explicit, additive capability, over a looser group-level
tenant that would have made cross-school data leakage the default behavior to guard
against instead of an opt-in feature to build.
