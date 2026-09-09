# ADR-ZS-027: ZSchool's data-processor and data-controller roles

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-16

## Context

Law 09.08 distinguishes a data controller (who decides the purposes of processing)
from a processor (who processes on the controller's instructions), and the two
roles carry different compliance obligations (filings, liability). ZSchool's actual
position varies by data category: for a school's own operational data, ZSchool is
clearly acting on the school's behalf; for the platform-wide global identity and
academic passport, ZSchool itself determines the processing purpose.

## Decision

ZSchool is the data processor for schools' own operational data, and the data
controller for the global identity and the academic passport. This split is
formalized legally before commercial launch.

## Consequences

**Positive**: gives every CNDP filing (per-school F211s, ZSchool's own filing) a
clear, defensible legal basis instead of an ambiguous or overreaching claim about
who controls what.

**Negative**: the platform genuinely operates under two different compliance
postures simultaneously, which the legal formalization work and any future audit
both have to account for correctly.

**Trade-off accepted**: an accurate but more complex dual role over a simpler
single-role claim that wouldn't actually match how the two data categories are
processed.
