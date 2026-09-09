# ADR-ZS-065: Single definitions for attendance rate, capacity, effective date, and ESISE control

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-24

## Context

Several reporting requirements referenced concepts (the attendance rate, class/
grade-level capacity, an enrollment's "effective date," which requirement owns the
ESISE control view) without a single authoritative definition — leaving each
requirement to define its own version would make cross-requirement KPIs
inconsistent and unverifiable.

## Decision

Five definitions, each owned by exactly one requirement and reused everywhere
else: attendance rate = (expected sessions − unjustified − justified absences) /
expected sessions, computed over declared sessions (ADR-ZS-045), with an optional
justified-excluded variant, defined once in BEH-ZS-241 and reused by the relevant
KPIs. Per-class capacity is checked at placement (leadership approval required to
exceed); per-grade-level capacity is the sum of its classes' capacities. An
enrollment's effective date governs when attendance rates, thresholds, and exports
start counting. ESISE preparation and the data-checking view both live in
BEH-ZS-251, with the actual file production split across BEH-ZS-267..09. Massar-code
ownership is carried by BEH-ZS-026, with BEH-ZS-261 and FR-ADM pointing to it rather
than redefining it.

## Consequences

**Positive**: makes every reporting number verifiable against one owning
definition instead of several requirements each computing "the same" metric
slightly differently, which is exactly what made these unverifiable before this
decision.

**Negative**: every requirement that had been informally computing its own version
of these metrics has to be corrected to defer to the single owning definition.

**Trade-off accepted**: definitional discipline (one owner per concept) over
letting each requirement state its own convenient version — required simply to
make the requirements verifiable at all.
