# ADR-ZS-112: "Historical" grades are this school's own prior-year archive, imported into a born-closed archival AcademicYear

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (minted during a `/grill-with-docs` session on the two ambiguous terms and one closed-year tension blocking grades import)

## Context

BEH-ZS-006 lists "current-term and historical grades" as a bulk-import
sub-domain with no further elaboration. Three candidate readings existed:
(a) prior terms of the current, still-open school year; (b) a prior, already
platform-closed `AcademicYear` at this school; (c) an externally-schooled
transfer student's grades from a different, non-ZSchool school.

Reading (c) is ruled out by BEH-ZS-046, which explicitly forbids detailed
grades for a student "previously schooled outside the platform" — that
channel carries only "declared, unverified" history, never grades.
[ADR-ZS-043](./043-mid-year-data-reprise.md) already names reading (a)
explicitly — "current-semester grades (with a published/draft status)" — as
part of the mid-year catch-up path, without ever using the word "historical."
That left "historical" pointing at reading (b): a prior year this school ran
(on paper or a legacy system) before joining ZSchool, which it now wants to
digitize.

Reading (b), taken literally as "a prior `AcademicYear`," runs into
[ADR-ZS-105](./105-academic-structure-school-vs-year-scoped-entities.md)
and INV-ZS-084: once the platform itself closes a year, that year's
structure and academic data are a frozen, read-only snapshot. Neither
document addresses whether import may write into a year that was never
operationally run on the platform at all.

## Decision

"Historical" grades means this school's own prior-year archive — a school
digitizing pre-ZSchool records (paper or legacy system) for a year it never
ran on the platform. "Current-term" covers grades for a period the school is
actively running on ZSchool, including ADR-ZS-043's mid-year "current-semester
grades in progress" case.

Historical grade import **creates a new, dedicated archival `AcademicYear`** —
born closed, never operationally opened on the platform — rather than writing
into a year the platform itself already closed through the normal
rollover-then-close flow (ADR-ZS-057). INV-ZS-084's read-only guarantee is
about *mutating* a year after ZSchool closes it; it says nothing about
*creating* a year that represents pre-platform history and is immediately
marked closed on arrival. Import is the only path that ever creates a year in
this already-closed state — every other path (BEH-ZS-057's cloning, the
normal wizard) always creates a year in "in preparation" or "in progress."

## Consequences

**Positive**: a school's real grade history can be preserved without
reopening or silently mutating any year the platform has genuinely closed
through its own lifecycle, and without inventing a fourth reading of
"historical" that the spec never actually supports.

**Negative**: the platform now has two distinct ways a year ends up "closed"
— through the normal operational rollover, and through import creating one
pre-closed — and any future code or report that assumes "closed" always means
"this school actually ran this year on ZSchool" needs to account for the
archival case instead.

**Trade-off accepted**: a second closed-year origin path, in exchange for
never having to choose between losing a school's real grade history and
violating the closed-year immutability guarantee ADR-ZS-105 already commits
to.
