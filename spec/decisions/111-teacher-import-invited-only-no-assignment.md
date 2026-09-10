# ADR-ZS-111: Bulk-imported teacher affiliations are created invited, never active — course assignment stays a manual post-acceptance step

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (minted during a `/grill-with-docs` session on the two open Staff Affiliation questions blocking teacher import)

## Context

INV-ZS-070/031 require a `SchoolMembership` to become active only once both the
school and the person have accepted — with no exception language anywhere in
the spec, unlike `Enrollment`, where BEH-ZS-047 explicitly names an
"import activation" transition that bypasses the equivalent enrollment
conditions for bulk import. Separately, BEH-ZS-058 requires "the school's
active affiliations (an active `SchoolMembership`, INV-ZS-070)" as a
precondition for creating a `TeacherAssignment` (subject × class/group).
BEH-ZS-006 (bulk import) names "teachers" as an import domain but gives no
field-level detail, unlike its student/guardian sections — leaving open both
whether import can activate a `SchoolMembership` directly, and whether import
also creates `TeacherAssignment` records.

## Decision

Bulk-importing a teacher creates a `SchoolMembership` in **"invited"** status
only — never active. The school's act of importing satisfies the school's
half of BEH-ZS-007's "created as an invitation" step; the teacher still has
to separately accept before the affiliation activates, through the same
accept flow already used for a manually-created invitation. There is no
affiliation equivalent of enrollment's import-activation bypass.

Import **never creates `TeacherAssignment` records**. This follows directly
from the first part of this decision: BEH-ZS-058 requires an active
`SchoolMembership` before a `TeacherAssignment` can exist, and import only
ever produces "invited" ones — so assignment is structurally deferred to a
manual step the director performs after the teacher accepts, regardless of
this decision.

Teacher rows carry no ordering dependency within a combined import batch
(unlike ADR-ZS-110's classes → guardians → students phasing for the
student+guardian domains): a teacher row references no class and no other
import domain, and nothing in this batch depends on a teacher row succeeding,
so teachers can commit in any order relative to the other domains.

Teacher identity matching reuses the same platform-wide Massar/weak-match
rules and the narrow cross-tenant matching function already established for
students and guardians (INV-ZS-005/006, ADR-ZS-108), and a matched or created
teacher is one global `Person` with a `TeacherProfile` facet
(ADR-ZS-109) — no new matching mechanism is introduced by this decision.

## Consequences

**Positive**: no second, affiliation-specific bypass of a mutual-acceptance
invariant has to be designed, reviewed, or maintained alongside enrollment's
existing one; a teacher retains real control over accepting a role at a
school even when that school brought them in via bulk import rather than a
one-by-one invitation, keeping BEH-ZS-007's product promise intact for the
bulk path too.

**Negative**: a school that bulk-imports its whole teaching staff can't
immediately assign any of them to courses — every imported teacher has to
individually accept before BEH-ZS-058 assignment becomes possible for them,
which can leave a school's course-assignment step blocked on however many
teachers are slow to accept an invitation.

**Trade-off accepted**: consistency with the existing mutual-acceptance
invariant and the manually-specified assignment precondition, over the
convenience of a fully turnkey bulk-import-to-ready-to-teach path.
