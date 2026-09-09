# ADR-ZS-006: No rating or cross-recommendation between teachers and schools

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-14, DEC-25

## Context

A teacher-career network naturally invites comparison to consumer rating platforms:
teachers rating schools, schools rating teachers, the way employees rate employers
elsewhere. This decision was made twice in the source material — first scoped to "no
cross-rating in V1" (ADR-ZS-025), then hardened to "no rating or cross-recommendation…
on the roadmap" (ADR-ZS-006) once the reasoning was worked through fully — so it is
recorded here as one decision, not two, since the second supersedes the first rather
than adding anything new.

Two-sided rating between a school and a teacher creates exactly the kind of adversarial
incentive ZSchool is trying to avoid: a school could retaliate against a teacher who
rates it poorly by not renewing an affiliation (which the platform would have no way
to distinguish from a legitimate non-renewal), and a teacher's rating of a former
employer would follow them into every future job search visible on the same platform
that arbitrates their affiliations.

## Decision

No rating or cross-recommendation between teachers and schools exists anywhere on
the roadmap, not just deferred to V1. Only verified affiliation periods (start date,
end date, role) are shared on the teacher network — never a qualitative evaluation.

## Consequences

**Positive**: removes a whole class of retaliation and reputational-gaming risk from
a feature (the teacher network) that depends on both sides trusting the platform is
neutral.

**Negative**: schools lose a signal that consumer platforms in other domains use
heavily (peer reviews) to help other schools evaluate a candidate teacher; hiring
decisions fall back entirely on verified history plus outside-platform reference
checks.

**Trade-off accepted**: neutrality over a richer signal, because the richer signal
would come at the cost of the platform being usable as a retaliation channel by
whichever side has more leverage in a given relationship — almost always the school
over the teacher.
