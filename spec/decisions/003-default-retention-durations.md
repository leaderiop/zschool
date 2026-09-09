# ADR-ZS-003: Default data-retention durations, set per data type

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-22

## Context

Law 09.08 requires that personal data not be kept longer than necessary for its
purpose, but "necessary" varies enormously by data type at a school: an academic
register has genuine permanent archival value (a former student may need a
transcript reissued decades later), while a chat message or a login audit log does
not. Without stated defaults, every school would improvise its own retention policy,
which is both a compliance risk and an inconsistent user experience across schools.

## Decision

Default retention durations are set per data type: enrollment registers, year-end
decisions, report cards, transcripts, and certificates are kept permanently by the
school (archives and certificate reissuance); financial documents for 10 years (CGI
Art. 211); attendance and discipline for end-of-schooling plus 2 years, then
anonymization; health for end-of-schooling plus 1 year, then deletion; messages and
notifications for 2 years; audit logs for 5 years; accounts with no active
relationship are anonymized after 3 years of inactivity. These durations are declared
in the CNDP filings and are adjustable per school within legal limits.

## Consequences

**Positive**: a defensible, filed retention posture from day one, and a genuine
default rather than a placeholder schools have to invent themselves.

**Negative**: seven distinct retention clocks (register, finance, attendance/
discipline, health, messages, audit, dormant-account) is real complexity for the
scheduled anonymization/deletion jobs to get right and keep auditable.

**Trade-off accepted**: per-data-type precision over a single blanket retention rule,
because a blanket rule would either over-retain sensitive data (health) or
under-retain data with real legal/archival value (registers, finance).
