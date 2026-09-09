# ADR-ZS-064: Teacher career rules — cross-school hour visibility, ESISE qualifications, staffing indicator

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-23

## Context

The teacher-career module needed precise rules for several points the original
description left implicit: whether a school can see a teacher's total hours across
every affiliation (a confidentiality question), which qualification source feeds
regulatory ESISE exports, whether a permanent-staff-share indicator is needed for
Law 59.21 compliance watching, and how the persona set represents a
public-sector teacher who isn't a ZSchool user.

## Decision

Five rules: (a) a teacher's cross-school hour total is visible only to the teacher
themself; a school sees only its own hours and, only with the teacher's consent, a
binary "cap exceeded across all affiliations" alert; hours outside the platform are
self-declared. (b) ESISE-exported qualifications are those declared to the employer
on `SchoolMembership` — never the broader `TeacherProfile`. (c) A new V1
requirement adds a configurable permanent-staff-share indicator (default threshold
80%), watching Law 59.21. (d) The persona set keeps Khadija as a private-sector
part-time teacher; a secondary character (Hassan, part-time public-sector) carries
the "external public-sector teacher" journey. (e) A scheduled future affiliation-end
date is allowed, with course reassignment before that date.

## Consequences

**Positive**: protects teacher privacy on cross-school hour totals (a genuine
confidentiality concern, since a school shouldn't see a teacher's full outside
workload) while still giving schools the cap-exceeded signal they need, and gives
regulatory exports an unambiguous, employer-declared qualification source.

**Negative**: the hour-visibility rule requires explicit teacher consent to be
modeled and enforced, and the qualification-source distinction (SchoolMembership
vs. TeacherProfile) has to be kept clear across every export path.

**Trade-off accepted**: teacher privacy on the sensitive cross-school-hours signal
over full school visibility, because full visibility would let a school
effectively surveil a part-time teacher's entire outside workload without consent.
