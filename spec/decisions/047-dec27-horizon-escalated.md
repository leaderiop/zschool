# ADR-ZS-047: The ADR-ZS-008 growth-ambition horizon is kept as a hypothesis, pending confirmation

> **Status:** Escalated — pending product owner sign-off
> **Date:** 2026-09-09
> **Historical aliases:** ARB-06

## Context

The roadmap chapter's reading of when commercial launch actually starts relative to
ADR-ZS-008's "year 1" figure carries a two-year ambiguity depending on interpretation
(whether year 1 starts at commercial launch in 2028/2029, or the ambition figure
already assumes an earlier start). The product owner confirmed the ambition figure
itself (ADR-ZS-008) without explicitly resolving this particular timing reading.

## Decision

The PRD keeps the roadmap's existing reading (commercial launch at the start of the
2028 school year, year 1 = 2028-2029) as a working hypothesis, but escalates the
question as blocking: either the ADR-ZS-008 figure is read as starting from commercial
launch, or the roadmap must compress materially (V1 by summer 2027 instead).

## Consequences

**Positive**: makes an ambiguity that could otherwise silently produce two very
different roadmaps explicit and visible, rather than letting planning proceed on an
unstated assumption.

**Negative**: roadmap milestones downstream of this reading (JAL entries) can't be
fully finalized until the product owner resolves it.

**Trade-off accepted**: flagging this as a blocking escalation over silently
picking one reading and proceeding — a two-year misalignment discovered late would
be far more costly than a short delay to get explicit confirmation now.
