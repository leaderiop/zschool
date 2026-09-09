# Invariants

> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-INV                                                    |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification                                      |
> | Change History | 1.0 (2026-09-09): Migrated and unified from `prd/03-domain-data-model.md` §4 (old `INV-ZS-006..45`) and `PROJECT.md` §6/§9 prose (old `INV-ZS-051..39`, including `INV-ZS-063`/`INV-ZS-066`), per `spec/process/id-migration-map.md` (CCR-ZS-001) |

---

Properties that must hold for every ZSchool tenant, at every version of the roadmap. Each
entry names what enforces it and what breaks if it is violated, because an invariant nobody
enforces is a wish, not a guarantee.

This document unifies two namespaces that were split only by the PRD's own drafting history,
not by any real difference in kind: the domain-model invariants formerly numbered `INV-NN`
(`prd/03-domain-data-model.md` §4) and the business rules formerly numbered `RG-NN`
(`PROJECT.md`, prose scattered across §4–§9). A business rule like "the legal tutor is the
required signer" and a data-model invariant like "at most one ACTIVE enrollment per pupil per
year" are the same kind of claim — a property that must always hold — just stated at different
altitudes. `INV-ZS-001..045` are the former `INV-NN` entries; `INV-ZS-051..091` are the former
`RG-NN` entries (block `046..050` is reserved headroom per the numbering rule in
`spec/process/requirement-id-scheme.md` and currently unused). Numbering follows
`spec/process/id-migration-map.md` exactly — do not renumber.

Enforcement below cites the future `behaviors/*.md` file that will carry the corresponding
functional requirements once Phase 2 of the migration runs; those files do not exist yet at
the time of writing, only their names and positions in the tree are fixed by the plan.

---

## INV-ZS-001: Every operational record carries its tenant key

Every school-related record carries the identifier of the school (`School`) that owns it, and
every access to it is checked server-side, never left to the client.

**Source**: `prd/03-domain-data-model.md` §1.1, §4 (old `INV-ZS-001`); `PROJECT.md` (old `INV-ZS-073`,
`ADR-ZS-013`).

**Implication**: without server-side tenant checks, one school's data becomes reachable from
another school's session — the entire multi-tenant isolation model collapses to a UI-level
convention instead of a guarantee.

**Enforcement**: cross-cutting to every module; concretely checked wherever
`behaviors/*.md` requirements read or write school-scoped entities. See also
`cross-cutting/02-security-privacy.md`.

**Related**: [INV-ZS-073](#inv-zs-073-the-isolation-tenant-is-the-school), [ADR-ZS-013](decisions/013-school-as-isolation-tenant.md).

---

## INV-ZS-002: The public school directory is minimal

The only `School` fields visible without an active relationship are name, city, cycles,
education systems, and website — every other field is private.

**Source**: `prd/03-domain-data-model.md` §1.1, §4 (old `INV-ZS-002`); `PROJECT.md` (old `INV-ZS-075`).

**Implication**: a wider default directory would expose enrollment numbers, contact details,
or financial standing to unauthenticated visitors, undermining schools' willingness to be
listed at all.

**Enforcement**: `behaviors/09-transfers-mobility.md` (the directory backs teacher-network and
transfer discovery), `cross-cutting/02-security-privacy.md`.

**Related**: [INV-ZS-075](#inv-zs-075-a-minimal-public-directory-exists).

---

## INV-ZS-003: The login identifier is distinct from contact identifiers

An account's login identifier (by default the mobile number, otherwise a platform-generated
one) is a separate concept from its contact identifiers; a contact mobile number may be shared
by several accounts in one household without any account itself being shared.

**Source**: `prd/03-domain-data-model.md` §2.1, §4 (old `INV-ZS-003`); `PROJECT.md` (old `INV-ZS-051`,
`INV-ZS-063`, `ADR-ZS-022`, `ADR-ZS-048`).

**Implication**: without this split, a household with one shared phone and several children
cannot give each child (or each parent) their own account and session — the platform would
force account-sharing, breaking per-person audit trails and consent.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md` (account creation
and activation).

**Related**: [INV-ZS-044](#inv-zs-044-the-primary-contact-identifier-is-the-mobile-number),
[ADR-ZS-022](decisions/022-mobile-number-as-primary-login-identifier.md).

---

## INV-ZS-004: Anonymization preserves a register snapshot

When a global identity is anonymized (no active relationship for 3 years, right to erasure),
each school that enrolled that person keeps a permanent identity snapshot (name in dual
script, date of birth, Massar code) in its own enrollment register.

**Source**: `prd/03-domain-data-model.md` §4 (old `INV-ZS-004`); `PROJECT.md` (old `ADR-ZS-003`,
`INV-ZS-086`, `ADR-ZS-053`).

**Implication**: without the snapshot, anonymizing the global `Person`/`User` would also erase
a school's legally-mandated enrollment register — the platform cannot let a person's own
erasure request destroy a third party's regulatory record.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-037](#inv-zs-037-erasure-anonymizes-it-never-deletes-official-registers).

---

## INV-ZS-005: Identity matching never auto-links on a weak match

A "strong" match (identical Massar code) may be proposed automatically; a "weak" match (name +
date of birth + a guardian's phone number) only raises a probable-duplicate alert — it never
links two identities by itself.

**Source**: `prd/03-domain-data-model.md` §4 (old `INV-ZS-005`); `PROJECT.md` (old `INV-ZS-055`).

**Implication**: automatic weak-match linking would eventually merge two different students
who happen to share a name and birth month, silently corrupting both their academic records.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md` (identity
deduplication).

**Related**: [INV-ZS-020](#inv-zs-020-every-profile-merge-is-an-audited-operation),
[INV-ZS-056](#inv-zs-056-merging-profiles-is-audited-and-confirmed-by-a-guardian).

---

## INV-ZS-006: The Massar code is unique platform-wide

When a Massar code is provided, it is unique across the whole platform, not merely within one
school.

**Source**: `prd/03-domain-data-model.md` §4 (old `INV-ZS-006`); `PROJECT.md` (old `INV-ZS-054`,
`ADR-ZS-015`).

**Implication**: a per-school-only uniqueness check would let the same government-issued
student code appear on two different `Person` records platform-wide, breaking every
Massar-based lookup and export.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`,
`behaviors/12-massar-regulatory-exports.md`.

**Related**: [INV-ZS-054](#inv-zs-054-the-massar-code-is-unique-when-provided).

---

## INV-ZS-007: At most one ACTIVE enrollment per pupil per year

A (pupil, school year) pair holds at most one ACTIVE enrollment; a SUSPENDED enrollment still
holds the pair and blocks a new activation; any other terminal state frees the pair for a
linked reinstatement.

**Source**: `prd/03-domain-data-model.md` §3, §4 (old `INV-ZS-007`); `PROJECT.md` (old `INV-ZS-058`,
`ADR-ZS-002`).

**Implication**: without this, the same pupil could be double-counted in two schools' active
headcounts for the same year, corrupting billing (active-pupil pricing), Massar exports, and
attendance-rate statistics.

**Enforcement**: `behaviors/02-admissions-enrollment-reenrollment.md` (activation and
reinstatement flows).

**Related**: [INV-ZS-058](#inv-zs-058-at-most-one-active-enrollment-per-school-year).

---

## INV-ZS-008: No enrollment that has been ACTIVE is ever deleted

Once ACTIVE, an enrollment is only ever closed (with a reason and a date), never deleted;
cancellation is reserved to enrollments still in CANDIDATE or PRE-ENROLLED.

**Source**: `prd/03-domain-data-model.md` §3.3, §4 (old `INV-ZS-008`); `PROJECT.md` (old `INV-ZS-060`,
`ADR-ZS-017`).

**Implication**: deleting an ACTIVE enrollment would erase the historical record a school is
legally required to keep (report cards, attendance, disciplinary history) and would break the
financial relationship it grounds.

**Enforcement**: `behaviors/02-admissions-enrollment-reenrollment.md`.

**Related**: [INV-ZS-060](#inv-zs-060-an-enrollment-is-never-deleted-once-active),
[INV-ZS-018](#inv-zs-018-the-financial-relationship-survives-enrollment-closure).

---

## INV-ZS-009: Several simultaneous affiliations are allowed

A person may hold several active `SchoolMembership` affiliations at different schools at once
(part-time teachers), and several roles within one school.

**Source**: `prd/03-domain-data-model.md` §2.2, §4 (old `INV-ZS-009`); `PROJECT.md` (old `INV-ZS-069`,
`ADR-ZS-016`).

**Implication**: forcing a single-school affiliation would exclude the many Moroccan teachers
who work part-time across several schools — a real, common employment pattern the product must
support, not an edge case.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`,
`behaviors/10-teacher-career-network.md`.

**Related**: [INV-ZS-069](#inv-zs-069-a-person-may-hold-several-simultaneous-affiliations).

---

## INV-ZS-010: Affiliation closure removes access immediately

When a `SchoolMembership` ends, access to that school's data is removed immediately; the data
already produced stays with the school, attributed to its author.

**Source**: `prd/03-domain-data-model.md` §2.2, §4 (old `INV-ZS-010`); `PROJECT.md` (old `INV-ZS-071`).

**Implication**: a delayed-revocation window would let a departed teacher or staff member keep
reading (or writing) pupil data after their affiliation legally ended.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`,
`cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-071](#inv-zs-071-affiliation-end-removes-access-immediately).

---

## INV-ZS-011: Least privilege derives from the active assignment

A teacher's access to pupils derives strictly from their active `TeacherAssignment` records; a
supervisor only sees the cycles they are assigned to.

**Source**: `prd/03-domain-data-model.md` §2.2, §4 (old `INV-ZS-011`); `PROJECT.md` (old `INV-ZS-091`).

**Implication**: granting access by role alone (rather than by the specific assignment) would
let a teacher of one class see every class at the school — a much wider blast radius than the
job requires.

**Enforcement**: `cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-091](#inv-zs-091-least-privilege-by-assignment-not-by-role-alone).

---

## INV-ZS-012: Every sharing consent is logged, scoped, and revocable

Every `ConsentGrant` is logged, bounded by a scope and a duration, and revocable; revocation
covers future access only.

**Source**: `prd/03-domain-data-model.md` §2.2, §4 (old `INV-ZS-012`); `PROJECT.md` §9.

**Implication**: an unlogged or unbounded consent could not be audited or withdrawn, which
would put ZSchool in breach of Law 09.08's consent requirements for any data shared beyond a
transfer's default scope.

**Enforcement**: `behaviors/09-transfers-mobility.md`, `cross-cutting/02-security-privacy.md`.

**Related**: [INV-ZS-083](#inv-zs-083-the-default-transfer-profile-is-scoped).

---

## INV-ZS-013: Cloning a year's structure never copies pupils

Cloning the structure from year N to N+1 copies structural elements (levels, subjects,
coefficients, scales) and never copies enrollments or pupils.

**Source**: `prd/03-domain-data-model.md` §2.3, §4 (old `INV-ZS-013`); `PROJECT.md` (old `INV-ZS-077`).

**Implication**: cloning pupils along with the structure would silently pre-enroll last year's
entire cohort into next year, including pupils who left or graduated.

**Enforcement**: `behaviors/03-academic-structure-timetables.md`.

**Related**: [INV-ZS-077](#inv-zs-077-a-years-structure-may-be-cloned-forward-without-pupils).

---

## INV-ZS-014: A subject's weight and language live on the level×track config

A subject's coefficient and language of instruction are carried by `SubjectLevelConfig` (per
level × track), never by the `Subject` alone.

**Source**: `prd/03-domain-data-model.md` §2.3, §4 (old `INV-ZS-014`); `PROJECT.md` (old `INV-ZS-078`).

**Implication**: a global subject-level coefficient would be wrong the moment two tracks weight
the same subject differently, which is the normal case (e.g. maths weighted differently between
a science and a literary track).

**Enforcement**: `behaviors/03-academic-structure-timetables.md`,
`behaviors/05-assessments-grades-report-cards.md`.

**Related**: [INV-ZS-078](#inv-zs-078-a-subjects-weight-and-language-are-set-per-level-and-track).

---

## INV-ZS-015: A published report card is immutable and versioned

A published report card is fixed (version, fingerprint, signatory, date); any correction
creates a new version, and the old one stays viewable, marked "superseded".

**Source**: `prd/03-domain-data-model.md` §2.4, §4 (old `INV-ZS-015`); `PROJECT.md` (old `INV-ZS-085`,
`ADR-ZS-020`, `G-19`).

**Implication**: an editable-in-place report card could be silently altered after a parent
already read or printed it, destroying the document's evidentiary value.

**Enforcement**: `behaviors/05-assessments-grades-report-cards.md`.

**Related**: [INV-ZS-085](#inv-zs-085-a-published-report-card-is-frozen-and-versioned).

---

## INV-ZS-016: Certificates are never blocked for unpaid fees

No state of the model blocks generating the enrollment certificate, the leaving certificate,
report cards, or transcripts because of unpaid fees; arrears are only ever expressed as an
alert and an account statement.

**Source**: `prd/03-domain-data-model.md` §2.4, §4 (old `INV-ZS-016`); `PROJECT.md` (old `ADR-ZS-005`).

**Implication**: withholding official documents over debt would put ZSchool schools in
violation of Law 59.21 art. 49-adjacent obligations (a pupil's right to the documents they need
to enroll elsewhere cannot be conditioned on payment).

**Enforcement**: `behaviors/06-documents-certificates.md`, `behaviors/07-finance-billing-collections.md`.

**Related**: [ADR-ZS-005](decisions/005-no-document-blocking-for-unpaid-fees.md).

---

## INV-ZS-017: Receipt and invoice numbering is sequential and tamper-proof

Receipt numbering (MVP) and invoice numbering (V1) are sequential and tamper-proof per school;
voiding is done via a numbered reversal entry, never a deletion; an active enrollment's
contractual tariff is fixed for the whole year.

**Source**: `prd/03-domain-data-model.md` §2.5, §4 (old `INV-ZS-017`); `PROJECT.md` (old `INV-ZS-074`,
`ADR-ZS-009`, `ADR-ZS-061`).

**Implication**: gapped or editable numbering would fail a Moroccan tax audit outright — the
General Tax Code requires sequential, non-alterable receipt/invoice numbering.

**Enforcement**: `behaviors/07-finance-billing-collections.md`.

**Related**: [INV-ZS-074](#inv-zs-074-the-school-carries-its-full-legal-identity-fields).

---

## INV-ZS-018: The financial relationship survives enrollment closure

`FinancialAccount`, balances, and documents stay active after an enrollment closes, until
settled.

**Source**: `prd/03-domain-data-model.md` §2.5, §4 (old `INV-ZS-018`); `PROJECT.md` (old `INV-ZS-062`).

**Implication**: closing the financial account along with the enrollment would let a departed
family walk away from an outstanding balance with no record for the school to pursue.

**Enforcement**: `behaviors/07-finance-billing-collections.md`, `behaviors/09-transfers-mobility.md`.

**Related**: [INV-ZS-062](#inv-zs-062-a-pupil-may-leave-with-a-non-zero-balance).

---

## INV-ZS-019: Every write and every sensitive view is logged

Every write action and every view of sensitive data (file, health, finance, discipline) is
logged with author, context, and timestamp, in an immutable, exportable log.

**Source**: `prd/03-domain-data-model.md` §4, §6 (old `INV-ZS-019`); `PROJECT.md` §9 (old
`INV-ZS-090`).

**Implication**: without a write/sensitive-view log, neither a school nor ZSchool support could
answer "who saw this pupil's health record" — a basic accountability requirement for handling
sensitive personal data under Law 09.08.

**Enforcement**: `cross-cutting/02-security-privacy.md`.

**Related**: [INV-ZS-090](#inv-zs-090-every-write-and-sensitive-view-is-logged).

---

## INV-ZS-020: Every profile merge is an audited operation

Every `MergeOperation` is audited, reserved to ZSchool support or an authorized role, and
requires confirmation by a legal guardian.

**Source**: `prd/03-domain-data-model.md` §2.7, §4 (old `INV-ZS-020`); `PROJECT.md` (old `INV-ZS-056`).

**Implication**: an unconfirmed or unaudited merge could combine two different pupils' academic
histories irreversibly, with no record of who did it or why.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-005](#inv-zs-005-identity-matching-never-auto-links-on-a-weak-match),
[INV-ZS-056](#inv-zs-056-merging-profiles-is-audited-and-confirmed-by-a-guardian).

---

## INV-ZS-021: Every enrollment carries a legal guardian and a financial guardian

Every enrollment carries at least one active legal guardian and one financial guardian, who
may be the same person or a third party.

**Source**: `prd/03-domain-data-model.md` §3.2, §4 (old `INV-ZS-021`); `PROJECT.md` (old `INV-ZS-064`).

**Implication**: an enrollment with no responsible adult attached would have nobody to notify,
nobody to bill, and nobody legally able to sign the enrollment contract.

**Enforcement**: `behaviors/02-admissions-enrollment-reenrollment.md`.

**Related**: [INV-ZS-064](#inv-zs-064-every-enrollment-has-a-legal-guardian-and-a-financial-guardian).

---

## INV-ZS-022: The default transfer profile has a fixed, limited scope

The default transfer profile includes identity, Massar code, schools attended, years, levels,
year-end decisions, and official documents; detailed grades, absences and disciplinary data
require explicit sharing; health data is never transferred automatically.

**Source**: `prd/03-domain-data-model.md` §2.2, §4 (old `INV-ZS-022`); `PROJECT.md` (old `INV-ZS-083`,
`ADR-ZS-019`).

**Implication**: a wider default would leak a pupil's full disciplinary or health history to a
new school without anyone having actually consented to that specific disclosure.

**Enforcement**: `behaviors/09-transfers-mobility.md`.

**Related**: [INV-ZS-083](#inv-zs-083-the-default-transfer-profile-is-scoped).

---

## INV-ZS-023: A transfer never creates a new identity

A transfer never creates a new `Person`; the receiving enrollment attaches to the pupil's
existing identity.

**Source**: `prd/03-domain-data-model.md` §2.2, §3.3, §4 (old `INV-ZS-023`); `PROJECT.md` §7.9
(old `INV-ZS-054`).

**Implication**: minting a fresh identity at the destination school would fragment a pupil's
academic history across two unrelated `Person` records, defeating the whole point of a
platform-wide identity.

**Enforcement**: `behaviors/09-transfers-mobility.md`.

**Related**: [INV-ZS-006](#inv-zs-006-the-massar-code-is-unique-platform-wide).

---

## INV-ZS-024: Closed-enrollment data is read-only, with a grace period

After an enrollment closes, the origin school's data becomes read-only; correction stays
possible during a grace period (default 60 days), and only through an audited procedure
thereafter.

**Source**: `prd/03-domain-data-model.md` §3.3, §4 (old `INV-ZS-024`); `PROJECT.md` (old `INV-ZS-084`).

**Implication**: leaving closed records freely editable indefinitely would let a school quietly
rewrite history — grades, attendance, disciplinary outcomes — after a pupil has already left.

**Enforcement**: `behaviors/02-admissions-enrollment-reenrollment.md`.

**Related**: [INV-ZS-084](#inv-zs-084-closed-enrollment-data-is-read-only-after-a-grace-period).

---

## INV-ZS-025: A mid-year class change is append-only history, not a new enrollment

A mid-year class change produces an append-only entry in `StudentClassHistory`; it never
creates a new enrollment and never rewrites the existing one.

**Source**: `prd/03-domain-data-model.md` §2.2, §3.2, §4 (old `INV-ZS-025`); `PROJECT.md` (old
`INV-ZS-061`).

**Implication**: modeling a class change as a new enrollment would double-count the pupil in
active-pupil billing and break every report/attendance record tied to the original enrollment.

**Enforcement**: `behaviors/03-academic-structure-timetables.md`.

**Related**: [INV-ZS-061](#inv-zs-061-a-mid-year-class-change-is-logged-not-a-new-enrollment).

---

## INV-ZS-026: Any school with an active enrollment can correct identity, and must log it

Any school with an active enrollment for a pupil can correct that pupil's identity data; the
correction is logged and reported to the other schools concerned.

**Source**: `prd/03-domain-data-model.md` §2.1, §4 (old `INV-ZS-026`); `PROJECT.md` (old `INV-ZS-057`).

**Implication**: restricting corrections to a single "owning" school would leave a typo
uncorrectable at every other school that enrolled the same pupil; silent, unreported
corrections would let one school's edit desynchronize from what others believe is true.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-057](#inv-zs-057-identity-belongs-to-the-person-any-school-may-correct-it).

---

## INV-ZS-027: Guardian access is default-on; restriction requires a logged court order

By default, every legal guardian and the custodian have access to school information; a
parent's access may be restricted only by a court order the school logs, with the document
attached and traceable, applying only to the schools that attached it.

**Source**: `prd/03-domain-data-model.md` §2.2, §4 (old `INV-ZS-027`); `PROJECT.md` (old `INV-ZS-065`).

**Implication**: allowing restriction without a logged legal basis would let one parent
unilaterally cut off the other's access to their own child's school information, a serious
liability given custody disputes are common in the schools ZSchool targets.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`,
`cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-065](#inv-zs-065-guardian-access-is-default-on-restriction-needs-a-court-order).

---

## INV-ZS-028: Legal tutor and custodian are recorded as separate qualities

The "legal tutor" and "custodian" qualities on a `ParentStudentRelationship` are recorded
separately; the legal tutor is the required signatory for enrollment, transfer, and the
leaving certificate.

**Source**: `prd/03-domain-data-model.md` §2.2, §4 (old `INV-ZS-028`); `PROJECT.md` (old `INV-ZS-066`).

**Implication**: collapsing the two qualities into one would misidentify who may lawfully sign
a transfer or enrollment contract in the common case where custody and legal tutorship are held
by different parents.

**Enforcement**: `behaviors/02-admissions-enrollment-reenrollment.md`,
`behaviors/09-transfers-mobility.md`.

**Related**: [INV-ZS-066](#inv-zs-066-the-legal-tutor-is-the-required-signatory).

---

## INV-ZS-029: The parent-pupil relationship is global; context attributes are per-school

The relationship is a single global entity; each school may add its own context attributes to
it (outing authorization, pickup, communication preferences) without duplicating the
relationship itself.

**Source**: `prd/03-domain-data-model.md` §2.2, §4 (old `INV-ZS-029`); `PROJECT.md` (old `INV-ZS-067`).

**Implication**: a per-school copy of the relationship would let two schools disagree about who
a pupil's guardian even is, and would force a guardian to re-establish the relationship at
every school their children attend.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-067](#inv-zs-067-the-relationship-is-global-context-attributes-are-per-school).

---

## INV-ZS-030: An account belongs to exactly one person

An account belongs to a single person; it may carry several profiles, a profile may exist
without an account, and no account is ever shared between two people.

**Source**: `prd/03-domain-data-model.md` §2.1, §4 (old `INV-ZS-030`); `PROJECT.md` (old `INV-ZS-053`,
`INV-ZS-063`, `ADR-ZS-014`).

**Implication**: a shared account would make every audit-log entry ambiguous about which real
person actually performed the action — the precondition for the write/sensitive-view logging
this whole model depends on.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-053](#inv-zs-053-one-account-may-carry-several-professional-facets-at-once),
[INV-ZS-063](#inv-zs-063-any-number-of-guardians-each-with-their-own-account).

---

## INV-ZS-031: An affiliation is active only after both parties accept

An affiliation becomes active only once both the school and the person have accepted it
(whichever side initiated the invitation or application).

**Source**: `prd/03-domain-data-model.md` §2.2, §4 (old `INV-ZS-031`); `PROJECT.md` (old `INV-ZS-070`).

**Implication**: a unilaterally-active affiliation would let a school grant staff-level access
to someone who never agreed to it, or let a person claim a role at a school that never approved
them.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-070](#inv-zs-070-affiliation-becomes-active-only-once-both-parties-accept).

---

## INV-ZS-032: Global entities require an active relationship or a consent

`Person`, `User`, profiles, `ParentStudentRelationship`, and `ConsentGrant` are accessible only
through an active relationship (enrollment, affiliation, parental link) or a consent.

**Source**: `prd/03-domain-data-model.md` §1.1, §6, §4 (old `INV-ZS-032`); `PROJECT.md` (old
`INV-ZS-082`, `INV-ZS-088`), §9.

**Implication**: without this gate, any authenticated user on the platform could look up any
person's global identity record, regardless of whether they have any actual relationship to
that person.

**Enforcement**: `cross-cutting/01-permissions.md`, `cross-cutting/02-security-privacy.md`.

**Related**: [INV-ZS-082](#inv-zs-082-no-automatic-access-between-schools).

---

## INV-ZS-033: Published data stays readable by the data subject after departure

The pupil and their guardians (per their rights) keep permanent read access to their published
school data (report cards, transcripts, absences, official documents), even after departure,
within retention limits.

**Source**: `prd/03-domain-data-model.md` §2.4, §4 (old `INV-ZS-033`); `PROJECT.md` (old `INV-ZS-080`,
`ADR-ZS-018`).

**Implication**: cutting off access at departure would strand a family without the very
documents (transcripts, certificates) they most need at the moment they leave.

**Enforcement**: `behaviors/06-documents-certificates.md`.

**Related**: [INV-ZS-080](#inv-zs-080-published-academic-data-stays-readable-after-departure).

---

## INV-ZS-034: Internal, unpublished data is never portable

Internal data (unpublished grades, drafts, internal remarks, deliberations, ongoing
disciplinary proceedings, staff observations) is never portable or visible outside the
authoring school.

**Source**: `prd/03-domain-data-model.md` §2.4, §4 (old `INV-ZS-034`); `PROJECT.md` (old `INV-ZS-081`).

**Implication**: exposing draft grades or internal staff notes to another school (or to the
family, before publication) would leak deliberations that were never meant to be final,
undermining teachers' willingness to write honest working notes.

**Enforcement**: `behaviors/05-assessments-grades-report-cards.md`,
`behaviors/04-attendance-student-life-discipline.md`.

**Related**: [INV-ZS-081](#inv-zs-081-internal-data-is-never-portable).

---

## INV-ZS-035: No automatic inter-school access

No school automatically sees another school's data about a pupil; only what was consented to
be shared, plus the official documents exchanged during a transfer, cross the boundary.

**Source**: `prd/03-domain-data-model.md` §2.2, §4 (old `INV-ZS-035`); `PROJECT.md` (old `INV-ZS-082`,
`ADR-ZS-018`).

**Implication**: automatic cross-school visibility would mean a pupil's full history follows
them everywhere with no consent step at all, contrary to Law 09.08's purpose-limitation
principle.

**Enforcement**: `behaviors/09-transfers-mobility.md`, `cross-cutting/02-security-privacy.md`.

**Related**: [INV-ZS-032](#inv-zs-032-global-entities-require-an-active-relationship-or-a-consent).

---

## INV-ZS-036: Every school-related record is attached to an enrollment

Every school-related record is attached to an enrollment, and thus to a school/year/level/class
context; no school-related data "floats" on the identity alone.

**Source**: `prd/03-domain-data-model.md` §1, §4 (old `INV-ZS-036`); `PROJECT.md` §6.8 (old
`ADR-ZS-029`).

**Implication**: an unattached record would have no tenant, no school year, and no clear
retention rule — the entire ownership/consent/retention model in §5 assumes every record can
answer "which enrollment produced this."

**Enforcement**: cross-cutting to every module; see `domain-model.md` §1.

**Related**: [ADR-ZS-029](decisions/029-academic-data-always-tied-to-enrollment.md).

---

## INV-ZS-037: Erasure anonymizes, it never deletes official registers

The right to erasure results in anonymizing the identity; it never deletes a school's official
registers.

**Source**: `prd/03-domain-data-model.md` §5, §4 (old `INV-ZS-037`); `PROJECT.md` (old `INV-ZS-086`,
`ADR-ZS-003`).

**Implication**: literal deletion on request would let a school lose its legally-mandated
enrollment register the moment a former pupil exercises a data-protection right that was never
meant to override statutory retention.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-004](#inv-zs-004-anonymization-preserves-a-register-snapshot),
[INV-ZS-086](#inv-zs-086-retention-for-official-data-outranks-erasure).

---

## INV-ZS-038: Teacher visibility across schools is opt-in and never cross-rated

A school only sees of a teacher's record what the teacher chooses to share, plus their
verified affiliation periods; no school's rating of a teacher is visible to another school.

**Source**: `prd/03-domain-data-model.md` §2.1, §4 (old `INV-ZS-038`); `PROJECT.md` (old `INV-ZS-087`,
`ADR-ZS-006`, `ADR-ZS-033`, `G-23`).

**Implication**: cross-visible ratings would let one school's subjective assessment of a
teacher follow them into every hiring conversation at every other school, without recourse —
exactly the professional-reputation risk that would make teachers refuse to use the network
feature at all.

**Enforcement**: `behaviors/10-teacher-career-network.md`.

**Related**: [INV-ZS-039](#inv-zs-039-no-cross-rating-entity-exists-between-teachers-and-schools),
[INV-ZS-087](#inv-zs-087-teacher-history-visibility-is-opt-in).

---

## INV-ZS-039: No cross-rating entity exists between teachers and schools

The model contains no cross-rating or recommendation entity between teachers and schools, at
any version of the roadmap.

**Source**: `prd/03-domain-data-model.md` §2.1, §4 (old `INV-ZS-039`); `PROJECT.md` §7.10 (old
`ADR-ZS-006`).

**Implication**: this is a standing design constraint, not a version-gated feature gap —
introducing a rating entity later (even in V2+) would need a new decision to override
`ADR-ZS-006`, not just an engineering ticket.

**Enforcement**: `behaviors/10-teacher-career-network.md`.

**Related**: [INV-ZS-038](#inv-zs-038-teacher-visibility-across-schools-is-opt-in-and-never-cross-rated),
[ADR-ZS-006](decisions/006-no-teacher-school-cross-rating.md).

---

## INV-ZS-040: Permissions are contextual, per (profile, school) pair

Permissions are contextual: the same account carries distinct rights per (profile, school)
pair — a teacher at School A and a parent at School B are two different rights contexts.

**Source**: `prd/03-domain-data-model.md` §1, §4 (old `INV-ZS-040`); `PROJECT.md` (old `INV-ZS-088`).

**Implication**: a single global rights set per account would let a person's teacher-level
access at one school leak into their parent-level session at another — an obvious privilege
escalation for anyone who is both an employee and a parent somewhere in the platform.

**Enforcement**: `cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-088](#inv-zs-088-permissions-are-contextual-per-account-role-and-school).

---

## INV-ZS-041: School roles are fine-grained permission sets, editable from templates

School-side roles are made up of fine-grained permissions by module and by scope (class,
level, school), based on editable standard role templates.

**Source**: `prd/03-domain-data-model.md` §6, §4 (old `INV-ZS-041`); `PROJECT.md` (old `INV-ZS-089`,
`ADR-ZS-028`).

**Implication**: coarse, fixed roles would force a school to over-grant access (e.g. giving a
front-desk role full financial write access) just to unblock one narrow task, defeating least
privilege for every role in the system.

**Enforcement**: `cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-011](#inv-zs-011-least-privilege-derives-from-the-active-assignment),
[INV-ZS-089](#inv-zs-089-school-roles-are-fine-grained-and-editable).

---

## INV-ZS-042: An adult pupil holds their own rights; the financial guardian keeps financial access

Having turned 18, the pupil becomes the account holder and holds their own rights; they may
restrict parental access to academic, disciplinary, and health data; the financial guardian
keeps financial access while they remain liable for fees.

**Source**: `prd/03-domain-data-model.md` §2.1, §4 (old `INV-ZS-042`); `PROJECT.md` (old `INV-ZS-052`,
`ADR-ZS-001`).

**Implication**: keeping parents' full access after majority regardless of the pupil's wishes
would conflict with Family Code art. 209's grant of full legal capacity at 18; keeping the
financial guardian on the hook is what lets the school still collect fees from whoever
contractually owes them, independent of the pupil's new rights.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-052](#inv-zs-052-at-18-the-pupil-becomes-account-holder-with-restriction-rights).

---

## INV-ZS-043: Pupil personal access activates from a school-set level

A pupil's own personal access is activated from the level the school sets (default: 1AC), and
only by a legal guardian.

**Source**: `prd/03-domain-data-model.md` §2.1, §4 (old `INV-ZS-043`); `PROJECT.md` (old `INV-ZS-051`).

**Implication**: a fixed, non-configurable activation level would ignore real variation across
schools in how early they consider pupils ready for their own login (some may want it later
than 1AC for younger cohorts).

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-051](#inv-zs-051-pupil-personal-access-activates-from-a-school-set-level).

---

## INV-ZS-044: The primary contact identifier is the mobile number

An account's primary contact identifier is the mobile phone number in international E.164
format; email is optional and never required for a parent, pupil, or teacher.

**Source**: `prd/03-domain-data-model.md` §2.1, §4 (old `INV-ZS-044`); `PROJECT.md` (old `ADR-ZS-022`,
`ADR-ZS-048`).

**Implication**: requiring email would exclude a meaningful share of Moroccan parents and
guardians who are reachable by mobile but do not use email regularly — this is a market-fit
constraint, not a convenience choice.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`,
`behaviors/08-communication-notifications.md`.

**Related**: [INV-ZS-003](#inv-zs-003-the-login-identifier-is-distinct-from-contact-identifiers).

---

## INV-ZS-045: Subscription termination follows a fixed export/retention timeline

On a school's subscription termination: a full export is delivered, read-only access continues
for 90 days, and operational data is deleted 12 months later; global identities and
individuals' access to their own published documents are maintained throughout.

**Source**: `prd/03-domain-data-model.md` §6, §4 (old `INV-ZS-045`); `PROJECT.md` §7.1 (old
`ADR-ZS-004`).

**Implication**: immediate deletion on termination would strand every enrolled family without
their children's records; indefinite retention with no deletion path would leave a
terminated school's data live forever with nobody actively maintaining it.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [ADR-ZS-004](decisions/004-cancellation-export-and-deletion-timeline.md).

---

*(`INV-ZS-046..050` reserved headroom, unused at time of writing — see
`spec/process/requirement-id-scheme.md` §2 for the block-sizing rule.)*

---

## INV-ZS-051: Pupil personal access activates from a school-set level

A pupil has personal access to their own data from a level set by the school (default: from
1AC onward), activated by a legal guardian.

**Source**: `PROJECT.md` (old `INV-ZS-051`).

**Implication**: see [INV-ZS-043](#inv-zs-043-pupil-personal-access-activates-from-a-school-set-level)
— this is the same rule, restated at business-rule altitude in `PROJECT.md`.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-043](#inv-zs-043-pupil-personal-access-activates-from-a-school-set-level).

---

## INV-ZS-052: At 18, the pupil becomes account holder with restriction rights

At 18, a student becomes the holder of their own account and of the rights over their own data
(Family Code art. 209). Parents have no statutory right to information about an adult child but
remain contract signatories and payers; guardian access is kept by default while the enrollment
is active; the adult student is informed of their rights at majority and at every
re-enrollment, and may restrict parents' access to academic, disciplinary, and health data at
any time; the financial guardian keeps access to financial and contractual data while liable
for fees; any restriction is logged and notified to the school.

**Source**: `PROJECT.md` §6.1, §9 (old `INV-ZS-052`, `ADR-ZS-001`).

**Implication**: see [INV-ZS-042](#inv-zs-042-an-adult-pupil-holds-their-own-rights-the-financial-guardian-keeps-financial-access)
— same rule, this is its fuller original statement including the notification and logging
obligations.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-042](#inv-zs-042-an-adult-pupil-holds-their-own-rights-the-financial-guardian-keeps-financial-access),
[ADR-ZS-001](decisions/001-adult-student-account-holder.md).

---

## INV-ZS-053: One account may carry several professional facets at once

The same account may be a parent, a teacher, and staff at once; the interface offers a context
selector (profile + school).

**Source**: `PROJECT.md` (old `INV-ZS-053`).

**Implication**: without a single account carrying multiple facets, a teacher who is also a
parent at the same or another ZSchool school would need two logins for one real person,
splitting their audit trail and doubling their account-recovery burden.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-030](#inv-zs-030-an-account-belongs-to-exactly-one-person).

---

## INV-ZS-054: The Massar code is unique when provided

The Massar code, when provided, is unique across the whole platform.

**Source**: `PROJECT.md` (old `INV-ZS-054`).

**Implication**: see [INV-ZS-006](#inv-zs-006-the-massar-code-is-unique-platform-wide) — the
same rule, restated at business-rule altitude.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-006](#inv-zs-006-the-massar-code-is-unique-platform-wide).

---

## INV-ZS-055: Strong matches are proposed, weak matches only alert

A "strong" match (an identical Massar code) is proposed automatically. A "weak" match (first
name + last name + date of birth + a guardian's phone number) raises a probable-duplicate
alert, with no automatic attachment.

**Source**: `PROJECT.md` (old `INV-ZS-055`).

**Implication**: see [INV-ZS-005](#inv-zs-005-identity-matching-never-auto-links-on-a-weak-match).

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-005](#inv-zs-005-identity-matching-never-auto-links-on-a-weak-match).

---

## INV-ZS-056: Merging profiles is audited and confirmed by a guardian

Merging two student profiles is an audited operation, reserved to ZSchool support or an
authorized school role, with confirmation by a legal guardian.

**Source**: `PROJECT.md` (old `INV-ZS-056`).

**Implication**: see [INV-ZS-020](#inv-zs-020-every-profile-merge-is-an-audited-operation).

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-020](#inv-zs-020-every-profile-merge-is-an-audited-operation).

---

## INV-ZS-057: Identity belongs to the person; any school may correct it

Identity (civil status, Massar code, photo, guardians) belongs to the person. Any school with
an active enrollment may correct it; the correction is logged and notified to the other
schools concerned.

**Source**: `PROJECT.md` (old `INV-ZS-057`).

**Implication**: see [INV-ZS-026](#inv-zs-026-any-school-with-an-active-enrollment-can-correct-identity-and-must-log-it).

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-026](#inv-zs-026-any-school-with-an-active-enrollment-can-correct-identity-and-must-log-it).

---

## INV-ZS-058: At most one ACTIVE enrollment per school year

A student has at most one ACTIVE enrollment per school year within the national system. Dual
enrollment (a school plus a tutoring center) is not modeled before V2.

**Source**: `PROJECT.md` (old `INV-ZS-058`, `ADR-ZS-002`).

**Implication**: see [INV-ZS-007](#inv-zs-007-at-most-one-active-enrollment-per-pupil-per-year).
The V2 note matters for scope: tutoring-center dual enrollment is explicitly out of scope, not
an oversight.

**Enforcement**: `behaviors/02-admissions-enrollment-reenrollment.md`.

**Related**: [INV-ZS-007](#inv-zs-007-at-most-one-active-enrollment-per-pupil-per-year),
[ADR-ZS-002](decisions/002-single-active-enrollment-per-year.md).

---

## INV-ZS-059: A COMPLETED enrollment carries a year-end decision

The COMPLETED status carries a year-end decision: promoted to the next level, held back,
graduated, tracked (a track/stream choice), or not yet determined.

**Source**: `PROJECT.md` (old `INV-ZS-059`).

**Implication**: a COMPLETED status with no attached decision would leave next year's *rollover*
with no basis for deciding which level/track to pre-enroll the pupil into.

**Enforcement**: `behaviors/05-assessments-grades-report-cards.md`,
`behaviors/02-admissions-enrollment-reenrollment.md`.

**Related**: [ADR-ZS-044](decisions/044-state-machine-refinements.md) (year-end closing mechanics).

---

## INV-ZS-060: An enrollment is never deleted once ACTIVE

An enrollment is never deleted once it has been ACTIVE; it is closed with a reason and a date.
Only CANDIDATE or PRE-ENROLLED enrollments may be cancelled.

**Source**: `PROJECT.md` (old `INV-ZS-060`).

**Implication**: see [INV-ZS-008](#inv-zs-008-no-enrollment-that-has-been-active-is-ever-deleted).

**Enforcement**: `behaviors/02-admissions-enrollment-reenrollment.md`.

**Related**: [INV-ZS-008](#inv-zs-008-no-enrollment-that-has-been-active-is-ever-deleted).

---

## INV-ZS-061: A mid-year class change is logged, not a new enrollment

A mid-year class change is logged (`StudentClassHistory`) without creating a new enrollment.

**Source**: `PROJECT.md` (old `INV-ZS-061`).

**Implication**: see [INV-ZS-025](#inv-zs-025-a-mid-year-class-change-is-append-only-history-not-a-new-enrollment).

**Enforcement**: `behaviors/03-academic-structure-timetables.md`.

**Related**: [INV-ZS-025](#inv-zs-025-a-mid-year-class-change-is-append-only-history-not-a-new-enrollment).

---

## INV-ZS-062: A pupil may leave with a non-zero balance

A student may leave a school with a possibly non-zero financial balance; the financial
relationship survives the closing of the enrollment.

**Source**: `PROJECT.md` §7.7 (old `INV-ZS-062`).

**Implication**: see [INV-ZS-018](#inv-zs-018-the-financial-relationship-survives-enrollment-closure).

**Enforcement**: `behaviors/07-finance-billing-collections.md`.

**Related**: [INV-ZS-018](#inv-zs-018-the-financial-relationship-survives-enrollment-closure).

---

## INV-ZS-063: Any number of guardians, each with their own account

A student may have any number of guardians, with no technical limit; the enrollment form
offers two parents by default (father, mother) and allows adding others (a legal guardian, a
grandparent). Each guardian has their own account: no account is shared between two people.

**Source**: `PROJECT.md` §6.1 (old `INV-ZS-063`).

**Implication**: a hard-coded two-guardian limit would exclude blended families, guardianship
arrangements, and grandparent caregivers, all of which are real cases in the target market.

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`,
`behaviors/02-admissions-enrollment-reenrollment.md`.

**Related**: [INV-ZS-030](#inv-zs-030-an-account-belongs-to-exactly-one-person),
[INV-ZS-075](#inv-zs-075-relationship-conflicts-are-flagged-to-the-school-not-adjudicated-by-zschool).

---

## INV-ZS-064: Every enrollment has a legal guardian and a financial guardian

Every enrollment must have at least one active legal guardian and one financial guardian (who
may be the same person or a third party who is not a legal guardian). When both parents are
registered, they are both legal guardians by default and both receive notifications, unless
configured otherwise.

**Source**: `PROJECT.md` §6.4 (old `INV-ZS-064`).

**Implication**: see [INV-ZS-021](#inv-zs-021-every-enrollment-carries-a-legal-guardian-and-a-financial-guardian).
The "both parents notified by default" clause is the specific rule that keeps the broader
"legal guardian" quality distinct from the narrower "legal tutor" signatory quality in
[INV-ZS-028](#inv-zs-028-legal-tutor-and-custodian-are-recorded-as-separate-qualities)/`INV-ZS-066`.

**Enforcement**: `behaviors/02-admissions-enrollment-reenrollment.md`.

**Related**: [INV-ZS-021](#inv-zs-021-every-enrollment-carries-a-legal-guardian-and-a-financial-guardian).

---

## INV-ZS-065: Guardian access is default-on; restriction needs a court order

By default, every legal guardian and the custodial parent have access to academic information.
Restricting a parent's access is only possible on a court order recorded by the school, with
the document attached and traceable.

**Source**: `PROJECT.md` §6.4 (old `INV-ZS-065`).

**Implication**: see [INV-ZS-027](#inv-zs-027-guardian-access-is-default-on-restriction-requires-a-logged-court-order).

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`,
`cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-027](#inv-zs-027-guardian-access-is-default-on-restriction-requires-a-logged-court-order).

---

## INV-ZS-066: The legal tutor is the required signatory

The legal guardian (by default the father; the mother if the father has died, is absent, or is
incapacitated, or by court order) is the required signatory for enrollment, transfer, and the
certificate of departure. The custodial parent may obtain the student's administrative school
documents, per the ministry's position. In case of conflict, the school requests a court order
or the King's prosecutor's opinion and attaches it to the file. ZSchool records the "legal
guardian" and "custodial parent" qualities separately, and will adapt the default values once
the Family Code reform comes into force.

**Source**: `PROJECT.md` §6.4 (old `INV-ZS-066`); Family Code art. 236 default (per
`prd/research/02-regulatory-data.md` §5, cited during the migration but out of scope for this
document).

**Implication**: this is the invariant behind the entire "legal guardian" (broad, default
access) vs. "legal tutor" (narrow, required signer) distinction preserved throughout the
corpus — collapsing the two would misidentify who may lawfully sign a transfer or enrollment
contract, and would need re-litigating the moment the Family Code reform changes the default.

**Enforcement**: `behaviors/02-admissions-enrollment-reenrollment.md`,
`behaviors/09-transfers-mobility.md`, `behaviors/06-documents-certificates.md`.

**Related**: [INV-ZS-028](#inv-zs-028-legal-tutor-and-custodian-are-recorded-as-separate-qualities).

---

## INV-ZS-067: The relationship is global; context attributes are per-school

The relationship is global (independent of the school), but each school may add its own
context attributes to it (an outing authorization, people authorized to pick up the child,
communication preferences).

**Source**: `PROJECT.md` (old `INV-ZS-067`).

**Implication**: see [INV-ZS-029](#inv-zs-029-the-parent-pupil-relationship-is-global-context-attributes-are-per-school).

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-029](#inv-zs-029-the-parent-pupil-relationship-is-global-context-attributes-are-per-school).

---

## INV-ZS-068: Guardian conflicts are flagged to the school, not adjudicated by ZSchool

Conflicts between guardians (contradictory requests) are flagged to the school, which remains
the operational arbiter; ZSchool does not adjudicate.

**Source**: `PROJECT.md` (old `INV-ZS-068`).

**Implication**: ZSchool taking on adjudication itself would put the platform in the position
of making custody-adjacent legal judgments it has no authority or standing to make — the school
(and ultimately the courts) must remain the arbiter.

**Enforcement**: `cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-063](#inv-zs-063-any-number-of-guardians-each-with-their-own-account).

---

## INV-ZS-069: A person may hold several simultaneous affiliations

A person may hold several active affiliations at once at different schools (part-time
teachers) and several roles within a single school.

**Source**: `PROJECT.md` (old `INV-ZS-069`).

**Implication**: see [INV-ZS-009](#inv-zs-009-several-simultaneous-affiliations-are-allowed).

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`,
`behaviors/10-teacher-career-network.md`.

**Related**: [INV-ZS-009](#inv-zs-009-several-simultaneous-affiliations-are-allowed).

---

## INV-ZS-070: Affiliation becomes active only once both parties accept

An affiliation is created by the school (an invitation) or requested by the person (an
application); it becomes active once both parties accept.

**Source**: `PROJECT.md` (old `INV-ZS-070`).

**Implication**: see [INV-ZS-031](#inv-zs-031-an-affiliation-is-active-only-after-both-parties-accept).

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`.

**Related**: [INV-ZS-031](#inv-zs-031-an-affiliation-is-active-only-after-both-parties-accept).

---

## INV-ZS-071: Affiliation end removes access immediately

When an affiliation ends, access to the school's data is removed immediately; data produced
(grades entered, roll calls, messages) stays with the school, attributed to its author.

**Source**: `PROJECT.md` (old `INV-ZS-071`).

**Implication**: see [INV-ZS-010](#inv-zs-010-affiliation-closure-removes-access-immediately).

**Enforcement**: `behaviors/01-administration-onboarding-subscription.md`,
`cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-010](#inv-zs-010-affiliation-closure-removes-access-immediately).

---

## INV-ZS-072: A teacher's professional profile belongs to them; only affiliation periods are verified

A teacher's professional profile (diplomas, subjects, levels, experience, teaching
authorization) belongs to them. Affiliation periods are confirmed by schools and shown as
"verified"; the rest is self-declared.

**Source**: `PROJECT.md` (old `INV-ZS-072`).

**Implication**: attributing the whole profile's ownership to a school (rather than the
teacher) would strand a teacher's professional history at whichever school first entered it,
defeating the point of a portable teacher-career network.

**Enforcement**: `behaviors/10-teacher-career-network.md`.

**Related**: [INV-ZS-038](#inv-zs-038-teacher-visibility-across-schools-is-opt-in-and-never-cross-rated).

---

## INV-ZS-073: The isolation tenant is the school

The isolation tenant is the school. The organization offers consolidated views and shared
administration without merging the data.

**Source**: `PROJECT.md` (old `INV-ZS-073`).

**Implication**: see [INV-ZS-001](#inv-zs-001-every-operational-record-carries-its-tenant-key).
Merging data across an organization's schools (rather than just providing a consolidated read
view) would defeat per-school isolation for every school in that group.

**Enforcement**: cross-cutting to every module; `cross-cutting/02-security-privacy.md`.

**Related**: [INV-ZS-001](#inv-zs-001-every-operational-record-carries-its-tenant-key).

---

## INV-ZS-074: The school carries its full legal identity fields

The school carries: name (AR/FR), authorization number, its AREF and provincial directorate,
authorized cycles, ICE, IF, RC, business license number, CNSS, address, logo, seal,
signatories, bank details, and settings (calendar, periods, grading, languages, channels).

**Source**: `PROJECT.md` (old `INV-ZS-074`).

**Implication**: missing any of these fields would make the school unable to issue a
Law-59.21-compliant invoice or Moroccan-tax-compliant document, since ICE/IF/RC/business-license
mentions are mandatory on a compliant invoice.

**Enforcement**: `behaviors/07-finance-billing-collections.md`.

**Related**: [INV-ZS-017](#inv-zs-017-receipt-and-invoice-numbering-is-sequential-and-tamper-proof).

---

## INV-ZS-075: A minimal public directory exists

A minimal public school directory (name, city, cycles, systems, website) exists for the
teacher network and for transfers. Everything else is private.

**Source**: `PROJECT.md` (old `INV-ZS-075`, resolved `C-08`).

**Implication**: see [INV-ZS-002](#inv-zs-002-the-public-school-directory-is-minimal).

**Enforcement**: `behaviors/09-transfers-mobility.md`, `cross-cutting/02-security-privacy.md`.

**Related**: [INV-ZS-002](#inv-zs-002-the-public-school-directory-is-minimal).

---

## INV-ZS-076: ZSchool provides structure templates that schools instantiate and adapt

ZSchool provides structure templates (the Moroccan national model per cycle, the French
mission, international) that the school instantiates and then adapts.

**Source**: `PROJECT.md` (old `INV-ZS-076`).

**Implication**: forcing every school onto one fixed structure would fail the many schools that
run a non-national curriculum (French mission, international sections) that this rule
explicitly accommodates.

**Enforcement**: `behaviors/03-academic-structure-timetables.md`.

**Related**: [INV-ZS-013](#inv-zs-013-cloning-a-years-structure-never-copies-pupils).

---

## INV-ZS-077: A year's structure may be cloned forward without pupils

The structure for year N+1 may be cloned from year N (levels, subjects, weights, grading
scales) without the students.

**Source**: `PROJECT.md` (old `INV-ZS-077`).

**Implication**: see [INV-ZS-013](#inv-zs-013-cloning-a-years-structure-never-copies-pupils).

**Enforcement**: `behaviors/03-academic-structure-timetables.md`.

**Related**: [INV-ZS-013](#inv-zs-013-cloning-a-years-structure-never-copies-pupils).

---

## INV-ZS-078: A subject's weight and language are set per level and track

A subject's weight and language of instruction are set per level and per track, not globally.

**Source**: `PROJECT.md` (old `INV-ZS-078`).

**Implication**: see [INV-ZS-014](#inv-zs-014-a-subjects-weight-and-language-live-on-the-leveltrack-config).

**Enforcement**: `behaviors/03-academic-structure-timetables.md`.

**Related**: [INV-ZS-014](#inv-zs-014-a-subjects-weight-and-language-live-on-the-leveltrack-config).

---

## INV-ZS-079: Every academic record has an author and a data subject

Every academic data item has an author (the school, within its own context) and a data subject
(the student, through their guardians). The school is its operational custodian; the data
subject is its beneficiary.

**Source**: `PROJECT.md` (old `INV-ZS-079`).

**Implication**: this is the founding distinction the whole ownership/retention/portability
table in `domain-model.md` §5 is built on — without it, "who may read this" and "who is
responsible for it" collapse into the same undifferentiated question, which they are not.

**Enforcement**: cross-cutting; see `domain-model.md` §5.

**Related**: [INV-ZS-036](#inv-zs-036-every-school-related-record-is-attached-to-an-enrollment).

---

## INV-ZS-080: Published academic data stays readable after departure

The student (and their guardians, per their rights) keeps permanent read access to their
published academic data (report cards, transcripts, absences, official documents), even after
leaving the school.

**Source**: `PROJECT.md` (old `INV-ZS-080`).

**Implication**: see [INV-ZS-033](#inv-zs-033-published-data-stays-readable-by-the-data-subject-after-departure).

**Enforcement**: `behaviors/06-documents-certificates.md`.

**Related**: [INV-ZS-033](#inv-zs-033-published-data-stays-readable-by-the-data-subject-after-departure).

---

## INV-ZS-081: Internal data is never portable

Never portable and never visible outside the authoring school: unpublished grades, drafts,
internal comments, deliberations, ongoing disciplinary procedures, staff observation notes.

**Source**: `PROJECT.md` (old `INV-ZS-081`).

**Implication**: see [INV-ZS-034](#inv-zs-034-internal-unpublished-data-is-never-portable).

**Enforcement**: `behaviors/05-assessments-grades-report-cards.md`,
`behaviors/04-attendance-student-life-discipline.md`.

**Related**: [INV-ZS-034](#inv-zs-034-internal-unpublished-data-is-never-portable).

---

## INV-ZS-082: No automatic access between schools

A new school sees of a former one only what the legal guardians (or the adult student) choose
to share, plus the official documents exchanged during a transfer procedure.

**Source**: `PROJECT.md` (old `INV-ZS-082`).

**Implication**: see [INV-ZS-035](#inv-zs-035-no-automatic-inter-school-access).

**Enforcement**: `behaviors/09-transfers-mobility.md`.

**Related**: [INV-ZS-035](#inv-zs-035-no-automatic-inter-school-access).

---

## INV-ZS-083: The default transfer profile is scoped

The default sharing on a transfer includes: identity, the Massar code, schools attended,
years, levels, and year-end decisions, official documents (the certificate of departure, the
year-end transcript). Detailed grades, absences, and disciplinary data require explicit
sharing. Health data is never transferred automatically.

**Source**: `PROJECT.md` (old `INV-ZS-083`).

**Implication**: see [INV-ZS-022](#inv-zs-022-the-default-transfer-profile-has-a-fixed-limited-scope).

**Enforcement**: `behaviors/09-transfers-mobility.md`.

**Related**: [INV-ZS-022](#inv-zs-022-the-default-transfer-profile-has-a-fixed-limited-scope),
[INV-ZS-012](#inv-zs-012-every-sharing-consent-is-logged-scoped-and-revocable).

---

## INV-ZS-084: Closed-enrollment data is read-only after a grace period

After an enrollment closes, the originating school keeps its data read-only, for its own
archives and legal obligations. A correction remains possible during a configurable grace
period (default: 60 days), then only through an audited procedure.

**Source**: `PROJECT.md` (old `INV-ZS-084`).

**Implication**: see [INV-ZS-024](#inv-zs-024-closed-enrollment-data-is-read-only-with-a-grace-period).

**Enforcement**: `behaviors/02-admissions-enrollment-reenrollment.md`.

**Related**: [INV-ZS-024](#inv-zs-024-closed-enrollment-data-is-read-only-with-a-grace-period).

---

## INV-ZS-085: A published report card is frozen and versioned

A published report card is frozen (version, fingerprint, signer, date). Any correction creates
a new version; the old one stays viewable, marked "superseded". A verification code (QR) lets
anyone check the authenticity of a printed document.

**Source**: `PROJECT.md` (old `INV-ZS-085`, resolved `G-19`).

**Implication**: see [INV-ZS-015](#inv-zs-015-a-published-report-card-is-immutable-and-versioned).

**Enforcement**: `behaviors/05-assessments-grades-report-cards.md`.

**Related**: [INV-ZS-015](#inv-zs-015-a-published-report-card-is-immutable-and-versioned).

---

## INV-ZS-086: Retention for official data outranks erasure

Historical retention takes precedence for official academic data, for the durations set per
data type (permanent for official registers and documents, 10 years for finance, limited
durations for attendance, discipline, health, and messages). The right to erasure applies to
the account and to non-official data and results in anonymizing the identity, not in deleting
the school's registers.

**Source**: `PROJECT.md` (old `INV-ZS-086`, `ADR-ZS-003`).

**Implication**: see [INV-ZS-037](#inv-zs-037-erasure-anonymizes-it-never-deletes-official-registers).
The per-type duration table itself lives in `domain-model.md` §5, carried over from
`prd/03-domain-data-model.md` §5.

**Enforcement**: cross-cutting; see `domain-model.md` §5.

**Related**: [INV-ZS-037](#inv-zs-037-erasure-anonymizes-it-never-deletes-official-registers),
[ADR-ZS-003](decisions/003-default-retention-durations.md).

---

## INV-ZS-087: Teacher history visibility is opt-in

A school sees of a teacher's history only what that teacher shares, plus verified affiliation
periods. No evaluation of a teacher by one school is visible to another school.

**Source**: `PROJECT.md` (old `INV-ZS-087`, resolved `G-23`).

**Implication**: see [INV-ZS-038](#inv-zs-038-teacher-visibility-across-schools-is-opt-in-and-never-cross-rated).

**Enforcement**: `behaviors/10-teacher-career-network.md`.

**Related**: [INV-ZS-038](#inv-zs-038-teacher-visibility-across-schools-is-opt-in-and-never-cross-rated).

---

## INV-ZS-088: Permissions are contextual per account, role, and school

Permissions are contextual: the same account may be a teacher at School A and a parent at
School B; each context carries its own rights.

**Source**: `PROJECT.md` (old `INV-ZS-088`).

**Implication**: see [INV-ZS-040](#inv-zs-040-permissions-are-contextual-per-profile-school-pair).

**Enforcement**: `cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-040](#inv-zs-040-permissions-are-contextual-per-profile-school-pair).

---

## INV-ZS-089: School roles are fine-grained and editable

School roles are made up of fine-grained permissions (read/write per module and per scope:
class, level, the whole school); ZSchool provides editable role templates.

**Source**: `PROJECT.md` (old `INV-ZS-089`).

**Implication**: see [INV-ZS-041](#inv-zs-041-school-roles-are-fine-grained-permission-sets-editable-from-templates).

**Enforcement**: `cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-041](#inv-zs-041-school-roles-are-fine-grained-permission-sets-editable-from-templates).

---

## INV-ZS-090: Every write and sensitive view is logged

Every write action and every consultation of sensitive data (a file, health, finance,
discipline) is logged with the author, the context, and a timestamp.

**Source**: `PROJECT.md` (old `INV-ZS-090`).

**Implication**: see [INV-ZS-019](#inv-zs-019-every-write-and-every-sensitive-view-is-logged).

**Enforcement**: `cross-cutting/02-security-privacy.md`.

**Related**: [INV-ZS-019](#inv-zs-019-every-write-and-every-sensitive-view-is-logged).

---

## INV-ZS-091: Least privilege by assignment, not by role alone

The principle of least privilege: a teacher sees only the students in their own courses; a
supervisor sees only the cycles they are assigned to.

**Source**: `PROJECT.md` (old `INV-ZS-091`).

**Implication**: see [INV-ZS-011](#inv-zs-011-least-privilege-derives-from-the-active-assignment).

**Enforcement**: `cross-cutting/01-permissions.md`.

**Related**: [INV-ZS-011](#inv-zs-011-least-privilege-derives-from-the-active-assignment).
