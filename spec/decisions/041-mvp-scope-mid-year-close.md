# ADR-ZS-041: MVP scope extended to cover a school year's mid-year close

> **Status:** Working hypothesis — extends ADR-ZS-026
> **Date:** 2026-09-09
> **Historical aliases:** ARB-01

## Context

The pilot schedule (RDM-ZS-001, activation 01/02/2027, through RDM-ZS-002, end of the
2027-2028 school year) puts real pilot schools live mid-school-year and running
through a full year-end close before V1 would otherwise ship. The MVP scope as
originally drawn (ADR-ZS-026) was a validation slice, not necessarily one capable
of actually closing out a school year — leaving pilots to live through a year-end
close with no tooling was rejected as untenable.

## Decision

The MVP covers everything a pilot school needs between activation (February 2027)
and the end of the 2027-2028 school year, shipped in two waves: wave 1 (activation)
and wave 2 (year-end close, June 2027). Version tags stay `MVP`, with wave-2
requirements carrying "MVP (wave 2 — year-end close)" in their Version cell. A
specific, named set of requirements (re-enrollment pre-fill/deposit/conversion,
timetable auto-feed, annual transcript, class-council minutes, several Massar and
finance requirements, read-only organization consolidation, support-ticket access)
moved from V1 into this extended MVP.

## Consequences

**Positive**: pilots can actually complete a real operational year on the platform,
which is the only way MVP validation is meaningful — a pilot that can't close a
year hasn't really been validated against real school operations.

**Negative**: the MVP is materially larger than originally scoped, pulling forward
V1 work (re-enrollment, timetable auto-feed, class councils) that now has to ship
on the wave-2 timeline.

**Trade-off accepted**: a heavier MVP delivery load over letting pilots hit a
year-end close with no tooling, which would have undermined the entire point of
running pilots in the first place. This scope extension and its development-effort
cost are recorded as still needing product-owner confirmation — see ADR-ZS-072
(ADR-ZS-073).
