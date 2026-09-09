# ADR-ZS-012: Target market and the national system as default

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-01

## Context

The original product description's examples used French nomenclature (5e, 4e, 3e)
even though the actual Moroccan target market uses a different level naming (1AC,
2AC, 3AC), and left the target teaching-system scope implicit. Left unaddressed,
this would have quietly baked a French-system assumption into a product meant for
the whole Moroccan private-school landscape, which spans the national system,
French-mission schools, bilingual schools, and international schools.

## Decision

The target is private schools in Morocco, from preschool through the baccalaureate,
across every teaching system. The Moroccan national system is the default model;
other systems (French mission, bilingual, international) are supported as
configurable structure variants rather than being treated as exceptions.

## Consequences

**Positive**: the level/structure model is built correctly from the start around
Morocco's own nomenclature and system diversity, instead of retrofitting it after
launch.

**Negative**: the structure-templating work (ADR-ZS-... national/French-mission/
international templates) has to cover several systems from day one rather than one.

**Trade-off accepted**: broader initial modeling scope over a narrower
single-system MVP, because the Moroccan market's own heterogeneity (C-01's finding)
made a single-system assumption actively wrong for the target customers.
