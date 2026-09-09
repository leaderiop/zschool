# ADR-ZS-093: shadcn/ui on Tailwind CSS 4, components copied into the repository

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §7)

## Context

The interface needs full Arabic RTL support reviewed component-by-component
(ADR-ZS-021), which a hosted component library (installed as an opaque npm
dependency) makes harder to audit and adjust precisely — RTL correctness often
needs per-component tweaks that a black-box library resists.

## Decision

shadcn/ui components are copied directly into the repository via its CLI (zero
runtime dependency on an external component package), styled with Tailwind CSS 4,
enabling component-by-component RTL review, OKLCH-token-based theming, and
AA-contrast validation on both French and Arabic.

## Consequences

**Positive**: every component's RTL behavior and accessibility properties can be
audited and adjusted directly in the codebase, rather than filed as an issue
against an external library and waited on.

**Negative**: no upstream library to pull bug fixes or new components from —
copied-in components become the project's own code to maintain going forward.

**Trade-off accepted**: full local control and auditability over the lower
maintenance burden of a hosted library, because the bilingual RTL requirement
(ADR-ZS-021) specifically needs the kind of fine-grained, component-level control a
hosted library doesn't offer.
