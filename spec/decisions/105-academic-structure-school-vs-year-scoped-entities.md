# ADR-ZS-105: Every MVP academic-structure entity is a per-year snapshot, cloned wholesale at rollover

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (minted during a `/grill-with-docs` session on MVP capability #1, school onboarding + academic structure)

## Context

`spec/behaviors/03-academic-structure-timetables.md` describes the academic
tree (Section → Cycle → Level → Track → Class → Group) plus `GradingScale`,
`ComputationRule`, and `EvaluationPeriod`. BEH-ZS-057 requires cloning the
structure from year N to N+1 "without students," and INV-ZS-084 requires a
closed year to stay read-only.

An earlier version of this ADR read `domain-model.md`'s terse relationship
column (`GradingScale`/`ComputationRule` — `N—1 School`) as meaning those two
entities are school-level constants, shared unchanged across years, with only
`Cycle`/`Level`/`Track`/`Subject`/`SubjectLevelConfig`/`Class`/`Group` treated
as per-year snapshots. That reading directly contradicts the more detailed
behavior spec: BEH-ZS-057 explicitly lists _sections, cycles, levels, tracks,
classes, groups, subjects, per-level/track configurations, template periods,
**grading scales, and computation rules**_ as things that "MUST be copied" on
cloning, and BEH-ZS-055 states weightings are "versioned per school year." The
detailed, MUST-level requirement text is the authoritative source here, not a
summary table's cardinality notation — this ADR corrects the earlier reading.

## Decision

Every MVP academic-structure entity is a **per-`AcademicYear` snapshot**: a
fresh set of rows created for each year, produced by cloning on rollover
(BEH-ZS-057), never shared or mutated across years. This includes `Section`,
`Cycle`, `Level`, `Track`, `Subject`, `SubjectLevelConfig`, `Class`, `Group`,
`GradingScale`, `ComputationRule`, and `EvaluationPeriod` — the full list
BEH-ZS-057 enumerates as copied on cloning, with no exceptions.

There is no "school-level constant, never cloned" bucket for MVP academic
structure. `Campus`/`Room` are the actual school-level, never-cloned
entities in the domain model, but they're V1 (BEH-ZS-056), out of scope for
MVP.

Rollover (BEH-ZS-057, RDM-ZS-003) bulk-clones every one of these entities
into the new `AcademicYear` in one operation — there's no need to special-case
any of them as "shared, skip during clone."

## Consequences

**Positive**: a closed year (INV-ZS-084) is read-only by construction, for
every structure entity uniformly — editing year N+1's rows can never
retroactively touch year N's, because every entity in the tree is a distinct
row per year, with no exceptions to remember. Cloning is a single uniform
bulk-insert across the whole tree, with no special-cased "this one is
school-level, don't clone it" branch to get wrong.

**Negative**: a genuinely permanent choice that a school essentially never
changes (e.g. which curriculum system/`Section` it runs) still gets a new row
every year, which can read as redundant duplication for something that
"morally" doesn't change; a school could also, in principle, drop a `Section`
during cloning without realizing that also silently drops everything nested
under it for the new year (mitigated by the cloning report BEH-ZS-057
requires, which lists gaps to fill in).

**Trade-off accepted**: uniform correctness and simplicity — one cloning rule
for the entire tree, no per-entity exceptions — over a shared/mutable model
for the handful of entities that rarely change in practice.
