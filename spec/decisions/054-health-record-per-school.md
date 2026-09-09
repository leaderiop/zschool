# ADR-ZS-054: HealthRecord becomes a per-school entity, tenant-keyed

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-13

## Context

ADR-ZS-019 already establishes that health data is never transferred
automatically, but the entity shape itself needed to match that rule structurally,
not just by access-control policy — a single global HealthRecord per student would
make "never transfer automatically" a policy layered on top of a naturally
shareable structure, rather than a structural guarantee.

## Decision

`HealthRecord` is modeled per (student × school), tenant-keyed, one record per
current enrollment. `StudentDocument` carries the key of whichever tenant filed it.
Identity documents specifically remain shareable through the transfer profile
(INV-ZS-083), but never automatically.

## Consequences

**Positive**: makes "health data doesn't transfer automatically" a structural
property of the data model (a new school genuinely has no record until one is
created there) rather than solely an access-control policy that could be
misconfigured.

**Negative**: a student with health data recorded at a former school starts with a
genuinely empty health record at a new school, requiring the new school to
re-collect information the family has already provided elsewhere.

**Trade-off accepted**: structural non-portability over the convenience of a
single shared health record, consistent with treating health as the platform's
most sensitive data category.
