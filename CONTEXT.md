# ZSchool

A Moroccan private-school SaaS. This file is the engineering-skills glossary for terms sharpened during implementation design (via `/grill-with-docs`); the authoritative, product-wide glossary is `spec/glossary.md` (trilingual FR/AR/EN) — check both.

## Language

**ImportBatch**:
A persisted, resumable snapshot of one onboarding-import upload: the workbook's rows staged with a per-row match status (creatable / strong-match / weak-match / error) between the non-committal analysis step and the explicit commit step. Introduced in [ADR-ZS-106](./spec/decisions/106-onboarding-import-staged-batch-sync-analyze-async-commit.md).
_Avoid_: Import job, upload session (neither captures that it's a durable entity distinct from the raw uploaded file).

**Academic-structure snapshot**:
Every MVP academic-structure entity (`Section`, `Cycle`, `Level`, `Track`, `Subject`, `SubjectLevelConfig`, `Class`, `Group`, `GradingScale`, `ComputationRule`, `EvaluationPeriod`) is a fresh set of rows created per `AcademicYear`, produced by cloning wholesale on rollover — never shared or mutated across years. There is no school-level-constant exception among these; `Campus`/`Room` are the genuinely school-level, never-cloned entities, but they're V1. See [ADR-ZS-105](./spec/decisions/105-academic-structure-school-vs-year-scoped-entities.md).

**Person**:
The global identity root, independent of any school — holds only shared civil-status fields (dual-script name, date of birth, Massar code). Never school-scoped, never carries `school_id`. See [ADR-ZS-014](./spec/decisions/014-global-identity-multi-profile-account.md), [ADR-ZS-109](./spec/decisions/109-person-separate-facet-tables.md).
_Avoid_: User, Account, Profile alone (a `Person` may have zero accounts and several profiles — see below).

**Profile** (`StudentProfile`, `GuardianProfile`, `TeacherProfile`, `StaffProfile`):
A facet of a `Person`, 0..1 per type per person, holding only that profile type's own fields. A person can carry more than one at once (a parent who is also a teacher). See [ADR-ZS-109](./spec/decisions/109-person-separate-facet-tables.md).

**ParentStudentRelationship**:
The global guardian↔student link, carrying relationship type and stackable qualities (legal guardian, financial guardian, emergency contact, pickup authorization). Global like `Person` — not school- or enrollment-scoped. See [ADR-ZS-107](./spec/decisions/107-person-relationship-rls-exists-subquery.md).

**Cross-tenant identity matching**:
Finding a Massar/weak-match `Person` candidate across schools during import goes through a narrow, privileged function returning only match-candidate summaries (id, name, date of birth, Massar code) — never raw cross-tenant row access. See [ADR-ZS-108](./spec/decisions/108-cross-tenant-matching-security-definer-function.md).
_Avoid_: querying `Person` directly for matching — RLS (ADR-ZS-107) blocks it by design.

**SchoolMembership**:
The single entity linking a `Person` to a `School` as staff (role, contract type, dates, status, permissions) — one entity, not separate ones per role. Becomes active only once both the school and the person accept (INV-ZS-070/031); bulk import can only ever create one "invited," never active — there is no import-activation-style bypass for affiliations the way there is for `Enrollment`. See [ADR-ZS-016](./spec/decisions/016-single-affiliation-entity.md), [ADR-ZS-111](./spec/decisions/111-teacher-import-invited-only-no-assignment.md).
_Avoid_: TeacherMembership, StaffProfile-as-affiliation (both were rejected in favor of one entity, ADR-ZS-016).

**Historical grades** (vs. **current-term grades**):
"Historical" means this school's own prior-year archive — records from a year the school ran before joining ZSchool (paper or legacy system), never an externally-schooled transfer student's grades (that's BEH-ZS-046's separate, non-detailed declaration path). "Current-term" means grades for a period the school actively runs on the platform, including the mid-year "current-semester grades in progress" case (ADR-ZS-043). See [ADR-ZS-112](./spec/decisions/112-historical-grades-archival-academic-year.md).

**Archival AcademicYear**:
An `AcademicYear` created by historical-grade import, born closed and never operationally opened on the platform — distinct from a year the platform closes through its own rollover lifecycle (ADR-ZS-057). INV-ZS-084's read-only guarantee is about mutating a year after ZSchool closes it, not about creating one already closed. See [ADR-ZS-112](./spec/decisions/112-historical-grades-archival-academic-year.md).

**Synthesized Assessment / synthesized Enrollment**:
Placeholder entities grade import creates to satisfy structural requirements a school that's never used the platform's own features can't yet have met — one `Assessment` per (subject, period, class/group) since `Mark` can't attach to `Subject`/`EvaluationPeriod` directly, and (for historical rows) a `COMPLETED`-status `Enrollment` in the archival year since ADR-ZS-029 permits no floating academic data. Marked as import-originated so they're never confused with a director's or teacher's own activity. See [ADR-ZS-113](./spec/decisions/113-grade-import-synthesizes-assessment-and-enrollment.md).
