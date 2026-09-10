> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-RTM                                                    |
> | Revision       | 1.1                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Verification Record                                            |
> | Change History | 1.0 (2026-09-09): Initial build of the traceability capstone, deriving all 9 sections from the by-then-complete `spec/*/index.yaml` registries, `spec/process/id-migration-map.md`, and `features/**/*.feature` tags (CCR-ZS-001). 1.1 (2026-09-09): ADR-ZS-091 decision-traceability row updated to Accepted (CCR-ZS-002). |

# Traceability Matrix

## Traceability chain

```
Requirement (BEH-ZS-NNN)
    -> Baseline source (spec/appendices/00-project-baseline.md)
    -> Invariant (INV-ZS-NNN)
    -> Decision (ADR-ZS-NNN)
    -> Acceptance scenario (REQ-ZS-NNN, features/**/*.feature)
    -> Screen (SCR-ZS-NNN)
```

This chain is adapted from qadi's own (`Behavior -> Source module -> Test file -> Invariant
-> Decision -> Acceptance scenario`): ZSchool has no source code or test suite yet, only a
specification, so "source module" becomes the historical baseline section a behavior traces
back to, and there is no "test file map" section -- that becomes real once
`spec/decisions/088-effect-cucumber-vitest-as-bdd-runner.md`'s runner is actually wired up.

`spec/scripts/verify-traceability.sh` checks this document the same way qadi's own script
checks qadi's: it confirms every `INV-ZS-NNN` in `invariants.md` appears somewhere in this
file (§2's coverage), every `spec/decisions/NNN-*.md` file appears here (§3's), every
`URS-ZS-NNN`/cross-cutting requirement family is mentioned at least twice in its own owning
file (a separate, per-file check handled elsewhere, not this document's job), every
`@REQ-ZS-NNN` tag used in a `.feature` file is defined here (§6's), every `SCR-ZS-NNN`
cited in a behaviors file's Screens subsection appears here (§7's), and that no relative
link anywhere in `spec/` is broken. It does **not** validate §1's behavior-to-baseline
citations against the actual baseline text, that a §3 "citing files" cell is exhaustive, or
§9's targets against a real CI config, since none exists yet. Where a claim here could not
be mechanically verified against the corpus, it is stated as an honest best-effort
cross-reference, not fabricated precision.

---

## §1 Behavior to baseline source

| Behavior file | Range | Baseline source | Historical origin (pre-migration, repo no longer has this path) |
| -------------- | ----- | ---------------- | -------------- |
| [01-administration-onboarding-subscription.md](behaviors/01-administration-onboarding-subscription.md) | BEH-ZS-001..020 | `spec/appendices/00-project-baseline.md` §7.1 | `prd/modules/10-administration-onboarding-subscription.md` |
| [02-admissions-enrollment-reenrollment.md](behaviors/02-admissions-enrollment-reenrollment.md) | BEH-ZS-021..047 | `spec/appendices/00-project-baseline.md` §7.2 | `prd/modules/11-admissions-enrollment-reenrollment.md` |
| [03-academic-structure-timetables.md](behaviors/03-academic-structure-timetables.md) | BEH-ZS-051..071 | `spec/appendices/00-project-baseline.md` §7.3 | `prd/modules/12-academic-structure-timetables.md` |
| [04-attendance-student-life-discipline.md](behaviors/04-attendance-student-life-discipline.md) | BEH-ZS-081..105 | `spec/appendices/00-project-baseline.md` §7.4 | `prd/modules/13-attendance-student-life-discipline.md` |
| [05-assessments-grades-report-cards.md](behaviors/05-assessments-grades-report-cards.md) | BEH-ZS-111..129 | `spec/appendices/00-project-baseline.md` §7.5 | `prd/modules/14-assessments-grades-report-cards.md` |
| [06-documents-certificates.md](behaviors/06-documents-certificates.md) | BEH-ZS-131..145 | `spec/appendices/00-project-baseline.md` §7.6 | `prd/modules/15-documents-certificates.md` |
| [07-finance-billing-collections.md](behaviors/07-finance-billing-collections.md) | BEH-ZS-151..180 | `spec/appendices/00-project-baseline.md` §7.7 | `prd/modules/16-finance-billing-collections.md` |
| [08-communication-notifications.md](behaviors/08-communication-notifications.md) | BEH-ZS-181..198 | `spec/appendices/00-project-baseline.md` §7.8 | `prd/modules/17-communication-notifications.md` |
| [09-transfers-mobility.md](behaviors/09-transfers-mobility.md) | BEH-ZS-201..213 | `spec/appendices/00-project-baseline.md` §7.9 | `prd/modules/18-transfers-mobility.md` |
| [10-teacher-career-network.md](behaviors/10-teacher-career-network.md) | BEH-ZS-221..239 | `spec/appendices/00-project-baseline.md` §7.10 | `prd/modules/19-teacher-career-network.md` |
| [11-dashboards-reporting.md](behaviors/11-dashboards-reporting.md) | BEH-ZS-241..253 | `spec/appendices/00-project-baseline.md` §7.11 | `prd/modules/20-dashboards-reporting.md` |
| [12-massar-regulatory-exports.md](behaviors/12-massar-regulatory-exports.md) | BEH-ZS-261..274 | `spec/appendices/00-project-baseline.md` §7.12 | `prd/modules/21-massar-regulatory-exports.md` |
| [13-ancillary-services.md](behaviors/13-ancillary-services.md) | BEH-ZS-281..293 | `spec/appendices/00-project-baseline.md` §7.13 | `prd/modules/22-ancillary-services-transport-canteen-activities.md` |
| [14-health-sensitive-data.md](behaviors/14-health-sensitive-data.md) | BEH-ZS-301..311 | `spec/appendices/00-project-baseline.md` §7.14 | `prd/modules/23-health-sensitive-data.md` |

---

## §2 Invariant traceability

`INV-ZS-046..050` are reserved headroom in the block allocated to the old `INV-NN`
namespace (per `invariants.md`'s own note) — unused at time of writing, no heading
exists for them, and they carry no coverage obligation until a future ID is minted
into that range.

| Invariant | Description | Enforced by | Related |
| --------- | ----------- | ----------- | ------- |
| [INV-ZS-001](invariants.md#inv-zs-001-every-operational-record-carries-its-tenant-key) | Every operational record carries its tenant key | cross-cutting to every module; concretely checked wherever `behaviors/*.md` requirements read or write school-scoped entities. See also `cross-cutting/02-security-privacy.md`. | ADR-ZS-013, INV-ZS-073 |
| [INV-ZS-002](invariants.md#inv-zs-002-the-public-school-directory-is-minimal) | The public school directory is minimal | `behaviors/09-transfers-mobility.md` (the directory backs teacher-network and transfer discovery), `cross-cutting/02-security-privacy.md`. | INV-ZS-075 |
| [INV-ZS-003](invariants.md#inv-zs-003-the-login-identifier-is-distinct-from-contact-identifiers) | The login identifier is distinct from contact identifiers | `behaviors/01-administration-onboarding-subscription.md` (account creation and activation). | ADR-ZS-022, INV-ZS-044 |
| [INV-ZS-004](invariants.md#inv-zs-004-anonymization-preserves-a-register-snapshot) | Anonymization preserves a register snapshot | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-037 |
| [INV-ZS-005](invariants.md#inv-zs-005-identity-matching-never-auto-links-on-a-weak-match) | Identity matching never auto-links on a weak match | `behaviors/01-administration-onboarding-subscription.md` (identity deduplication). | INV-ZS-020, INV-ZS-056 |
| [INV-ZS-006](invariants.md#inv-zs-006-the-massar-code-is-unique-platform-wide) | The Massar code is unique platform-wide | `behaviors/01-administration-onboarding-subscription.md`, `behaviors/12-massar-regulatory-exports.md`. | INV-ZS-054 |
| [INV-ZS-007](invariants.md#inv-zs-007-at-most-one-active-enrollment-per-pupil-per-year) | At most one ACTIVE enrollment per pupil per year | `behaviors/02-admissions-enrollment-reenrollment.md` (activation and reinstatement flows). | INV-ZS-058 |
| [INV-ZS-008](invariants.md#inv-zs-008-no-enrollment-that-has-been-active-is-ever-deleted) | No enrollment that has been ACTIVE is ever deleted | `behaviors/02-admissions-enrollment-reenrollment.md`. | INV-ZS-018, INV-ZS-060 |
| [INV-ZS-009](invariants.md#inv-zs-009-several-simultaneous-affiliations-are-allowed) | Several simultaneous affiliations are allowed | `behaviors/01-administration-onboarding-subscription.md`, `behaviors/10-teacher-career-network.md`. | INV-ZS-069 |
| [INV-ZS-010](invariants.md#inv-zs-010-affiliation-closure-removes-access-immediately) | Affiliation closure removes access immediately | `behaviors/01-administration-onboarding-subscription.md`, `cross-cutting/01-permissions.md`. | INV-ZS-071 |
| [INV-ZS-011](invariants.md#inv-zs-011-least-privilege-derives-from-the-active-assignment) | Least privilege derives from the active assignment | `cross-cutting/01-permissions.md`. | INV-ZS-091 |
| [INV-ZS-012](invariants.md#inv-zs-012-every-sharing-consent-is-logged-scoped-and-revocable) | Every sharing consent is logged, scoped, and revocable | `behaviors/09-transfers-mobility.md`, `cross-cutting/02-security-privacy.md`. | INV-ZS-083 |
| [INV-ZS-013](invariants.md#inv-zs-013-cloning-a-year-s-structure-never-copies-pupils) | Cloning a year's structure never copies pupils | `behaviors/03-academic-structure-timetables.md`. | INV-ZS-077 |
| [INV-ZS-014](invariants.md#inv-zs-014-a-subject-s-weight-and-language-live-on-the-level-track-config) | A subject's weight and language live on the level×track config | `behaviors/03-academic-structure-timetables.md`, `behaviors/05-assessments-grades-report-cards.md`. | INV-ZS-078 |
| [INV-ZS-015](invariants.md#inv-zs-015-a-published-report-card-is-immutable-and-versioned) | A published report card is immutable and versioned | `behaviors/05-assessments-grades-report-cards.md`. | INV-ZS-085 |
| [INV-ZS-016](invariants.md#inv-zs-016-certificates-are-never-blocked-for-unpaid-fees) | Certificates are never blocked for unpaid fees | `behaviors/06-documents-certificates.md`, `behaviors/07-finance-billing-collections.md`. | ADR-ZS-005 |
| [INV-ZS-017](invariants.md#inv-zs-017-receipt-and-invoice-numbering-is-sequential-and-tamper-proof) | Receipt and invoice numbering is sequential and tamper-proof | `behaviors/07-finance-billing-collections.md`. | INV-ZS-074 |
| [INV-ZS-018](invariants.md#inv-zs-018-the-financial-relationship-survives-enrollment-closure) | The financial relationship survives enrollment closure | `behaviors/07-finance-billing-collections.md`, `behaviors/09-transfers-mobility.md`. | INV-ZS-062 |
| [INV-ZS-019](invariants.md#inv-zs-019-every-write-and-every-sensitive-view-is-logged) | Every write and every sensitive view is logged | `cross-cutting/02-security-privacy.md`. | INV-ZS-090 |
| [INV-ZS-020](invariants.md#inv-zs-020-every-profile-merge-is-an-audited-operation) | Every profile merge is an audited operation | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-005, INV-ZS-056 |
| [INV-ZS-021](invariants.md#inv-zs-021-every-enrollment-carries-a-legal-guardian-and-a-financial-guardian) | Every enrollment carries a legal guardian and a financial guardian | `behaviors/02-admissions-enrollment-reenrollment.md`. | INV-ZS-064 |
| [INV-ZS-022](invariants.md#inv-zs-022-the-default-transfer-profile-has-a-fixed-limited-scope) | The default transfer profile has a fixed, limited scope | `behaviors/09-transfers-mobility.md`. | INV-ZS-083 |
| [INV-ZS-023](invariants.md#inv-zs-023-a-transfer-never-creates-a-new-identity) | A transfer never creates a new identity | `behaviors/09-transfers-mobility.md`. | INV-ZS-006 |
| [INV-ZS-024](invariants.md#inv-zs-024-closed-enrollment-data-is-read-only-with-a-grace-period) | Closed-enrollment data is read-only, with a grace period | `behaviors/02-admissions-enrollment-reenrollment.md`. | INV-ZS-084 |
| [INV-ZS-025](invariants.md#inv-zs-025-a-mid-year-class-change-is-append-only-history-not-a-new-enrollment) | A mid-year class change is append-only history, not a new enrollment | `behaviors/03-academic-structure-timetables.md`. | INV-ZS-061 |
| [INV-ZS-026](invariants.md#inv-zs-026-any-school-with-an-active-enrollment-can-correct-identity-and-must-log-it) | Any school with an active enrollment can correct identity, and must log it | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-057 |
| [INV-ZS-027](invariants.md#inv-zs-027-guardian-access-is-default-on-restriction-requires-a-logged-court-order) | Guardian access is default-on; restriction requires a logged court order | `behaviors/01-administration-onboarding-subscription.md`, `cross-cutting/01-permissions.md`. | INV-ZS-065 |
| [INV-ZS-028](invariants.md#inv-zs-028-legal-tutor-and-custodian-are-recorded-as-separate-qualities) | Legal tutor and custodian are recorded as separate qualities | `behaviors/02-admissions-enrollment-reenrollment.md`, `behaviors/09-transfers-mobility.md`. | INV-ZS-066 |
| [INV-ZS-029](invariants.md#inv-zs-029-the-parent-pupil-relationship-is-global-context-attributes-are-per-school) | The parent-pupil relationship is global; context attributes are per-school | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-067 |
| [INV-ZS-030](invariants.md#inv-zs-030-an-account-belongs-to-exactly-one-person) | An account belongs to exactly one person | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-053, INV-ZS-063 |
| [INV-ZS-031](invariants.md#inv-zs-031-an-affiliation-is-active-only-after-both-parties-accept) | An affiliation is active only after both parties accept | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-070 |
| [INV-ZS-032](invariants.md#inv-zs-032-global-entities-require-an-active-relationship-or-a-consent) | Global entities require an active relationship or a consent | `cross-cutting/01-permissions.md`, `cross-cutting/02-security-privacy.md`. | INV-ZS-082 |
| [INV-ZS-033](invariants.md#inv-zs-033-published-data-stays-readable-by-the-data-subject-after-departure) | Published data stays readable by the data subject after departure | `behaviors/06-documents-certificates.md`. | INV-ZS-080 |
| [INV-ZS-034](invariants.md#inv-zs-034-internal-unpublished-data-is-never-portable) | Internal, unpublished data is never portable | `behaviors/05-assessments-grades-report-cards.md`, `behaviors/04-attendance-student-life-discipline.md`. | INV-ZS-081 |
| [INV-ZS-035](invariants.md#inv-zs-035-no-automatic-inter-school-access) | No automatic inter-school access | `behaviors/09-transfers-mobility.md`, `cross-cutting/02-security-privacy.md`. | INV-ZS-032 |
| [INV-ZS-036](invariants.md#inv-zs-036-every-school-related-record-is-attached-to-an-enrollment) | Every school-related record is attached to an enrollment | cross-cutting to every module; see `domain-model.md` §1. | ADR-ZS-029 |
| [INV-ZS-037](invariants.md#inv-zs-037-erasure-anonymizes-it-never-deletes-official-registers) | Erasure anonymizes, it never deletes official registers | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-004, INV-ZS-086 |
| [INV-ZS-038](invariants.md#inv-zs-038-teacher-visibility-across-schools-is-opt-in-and-never-cross-rated) | Teacher visibility across schools is opt-in and never cross-rated | `behaviors/10-teacher-career-network.md`. | INV-ZS-039, INV-ZS-087 |
| [INV-ZS-039](invariants.md#inv-zs-039-no-cross-rating-entity-exists-between-teachers-and-schools) | No cross-rating entity exists between teachers and schools | `behaviors/10-teacher-career-network.md`. | ADR-ZS-006, INV-ZS-038 |
| [INV-ZS-040](invariants.md#inv-zs-040-permissions-are-contextual-per-profile-school-pair) | Permissions are contextual, per (profile, school) pair | `cross-cutting/01-permissions.md`. | INV-ZS-088 |
| [INV-ZS-041](invariants.md#inv-zs-041-school-roles-are-fine-grained-permission-sets-editable-from-templates) | School roles are fine-grained permission sets, editable from templates | `cross-cutting/01-permissions.md`. | INV-ZS-011, INV-ZS-089 |
| [INV-ZS-042](invariants.md#inv-zs-042-an-adult-pupil-holds-their-own-rights-the-financial-guardian-keeps-financial-access) | An adult pupil holds their own rights; the financial guardian keeps financial access | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-052 |
| [INV-ZS-043](invariants.md#inv-zs-043-pupil-personal-access-activates-from-a-school-set-level) | Pupil personal access activates from a school-set level | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-051 |
| [INV-ZS-044](invariants.md#inv-zs-044-the-primary-contact-identifier-is-the-mobile-number) | The primary contact identifier is the mobile number | `behaviors/01-administration-onboarding-subscription.md`, `behaviors/08-communication-notifications.md`. | INV-ZS-003 |
| [INV-ZS-045](invariants.md#inv-zs-045-subscription-termination-follows-a-fixed-export-retention-timeline) | Subscription termination follows a fixed export/retention timeline | `behaviors/01-administration-onboarding-subscription.md`. | ADR-ZS-004 |
| [INV-ZS-051](invariants.md#inv-zs-051-pupil-personal-access-activates-from-a-school-set-level) | Pupil personal access activates from a school-set level | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-043 |
| [INV-ZS-052](invariants.md#inv-zs-052-at-18-the-pupil-becomes-account-holder-with-restriction-rights) | At 18, the pupil becomes account holder with restriction rights | `behaviors/01-administration-onboarding-subscription.md`. | ADR-ZS-001, INV-ZS-042 |
| [INV-ZS-053](invariants.md#inv-zs-053-one-account-may-carry-several-professional-facets-at-once) | One account may carry several professional facets at once | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-030 |
| [INV-ZS-054](invariants.md#inv-zs-054-the-massar-code-is-unique-when-provided) | The Massar code is unique when provided | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-006 |
| [INV-ZS-055](invariants.md#inv-zs-055-strong-matches-are-proposed-weak-matches-only-alert) | Strong matches are proposed, weak matches only alert | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-005 |
| [INV-ZS-056](invariants.md#inv-zs-056-merging-profiles-is-audited-and-confirmed-by-a-guardian) | Merging profiles is audited and confirmed by a guardian | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-020 |
| [INV-ZS-057](invariants.md#inv-zs-057-identity-belongs-to-the-person-any-school-may-correct-it) | Identity belongs to the person; any school may correct it | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-026 |
| [INV-ZS-058](invariants.md#inv-zs-058-at-most-one-active-enrollment-per-school-year) | At most one ACTIVE enrollment per school year | `behaviors/02-admissions-enrollment-reenrollment.md`. | ADR-ZS-002, INV-ZS-007 |
| [INV-ZS-059](invariants.md#inv-zs-059-a-completed-enrollment-carries-a-year-end-decision) | A COMPLETED enrollment carries a year-end decision | `behaviors/05-assessments-grades-report-cards.md`, `behaviors/02-admissions-enrollment-reenrollment.md`. | ADR-ZS-044 |
| [INV-ZS-060](invariants.md#inv-zs-060-an-enrollment-is-never-deleted-once-active) | An enrollment is never deleted once ACTIVE | `behaviors/02-admissions-enrollment-reenrollment.md`. | INV-ZS-008 |
| [INV-ZS-061](invariants.md#inv-zs-061-a-mid-year-class-change-is-logged-not-a-new-enrollment) | A mid-year class change is logged, not a new enrollment | `behaviors/03-academic-structure-timetables.md`. | INV-ZS-025 |
| [INV-ZS-062](invariants.md#inv-zs-062-a-pupil-may-leave-with-a-non-zero-balance) | A pupil may leave with a non-zero balance | `behaviors/07-finance-billing-collections.md`. | INV-ZS-018 |
| [INV-ZS-063](invariants.md#inv-zs-063-any-number-of-guardians-each-with-their-own-account) | Any number of guardians, each with their own account | `behaviors/01-administration-onboarding-subscription.md`, `behaviors/02-admissions-enrollment-reenrollment.md`. | INV-ZS-030, INV-ZS-075 |
| [INV-ZS-064](invariants.md#inv-zs-064-every-enrollment-has-a-legal-guardian-and-a-financial-guardian) | Every enrollment has a legal guardian and a financial guardian | `behaviors/02-admissions-enrollment-reenrollment.md`. | INV-ZS-021 |
| [INV-ZS-065](invariants.md#inv-zs-065-guardian-access-is-default-on-restriction-needs-a-court-order) | Guardian access is default-on; restriction needs a court order | `behaviors/01-administration-onboarding-subscription.md`, `cross-cutting/01-permissions.md`. | INV-ZS-027 |
| [INV-ZS-066](invariants.md#inv-zs-066-the-legal-tutor-is-the-required-signatory) | The legal tutor is the required signatory | `behaviors/02-admissions-enrollment-reenrollment.md`, `behaviors/09-transfers-mobility.md`, `behaviors/06-documents-certificates.md`. | INV-ZS-028 |
| [INV-ZS-067](invariants.md#inv-zs-067-the-relationship-is-global-context-attributes-are-per-school) | The relationship is global; context attributes are per-school | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-029 |
| [INV-ZS-068](invariants.md#inv-zs-068-guardian-conflicts-are-flagged-to-the-school-not-adjudicated-by-zschool) | Guardian conflicts are flagged to the school, not adjudicated by ZSchool | `cross-cutting/01-permissions.md`. | INV-ZS-063 |
| [INV-ZS-069](invariants.md#inv-zs-069-a-person-may-hold-several-simultaneous-affiliations) | A person may hold several simultaneous affiliations | `behaviors/01-administration-onboarding-subscription.md`, `behaviors/10-teacher-career-network.md`. | INV-ZS-009 |
| [INV-ZS-070](invariants.md#inv-zs-070-affiliation-becomes-active-only-once-both-parties-accept) | Affiliation becomes active only once both parties accept | `behaviors/01-administration-onboarding-subscription.md`. | INV-ZS-031 |
| [INV-ZS-071](invariants.md#inv-zs-071-affiliation-end-removes-access-immediately) | Affiliation end removes access immediately | `behaviors/01-administration-onboarding-subscription.md`, `cross-cutting/01-permissions.md`. | INV-ZS-010 |
| [INV-ZS-072](invariants.md#inv-zs-072-a-teacher-s-professional-profile-belongs-to-them-only-affiliation-periods-are-verified) | A teacher's professional profile belongs to them; only affiliation periods are verified | `behaviors/10-teacher-career-network.md`. | INV-ZS-038 |
| [INV-ZS-073](invariants.md#inv-zs-073-the-isolation-tenant-is-the-school) | The isolation tenant is the school | cross-cutting to every module; `cross-cutting/02-security-privacy.md`. | INV-ZS-001 |
| [INV-ZS-074](invariants.md#inv-zs-074-the-school-carries-its-full-legal-identity-fields) | The school carries its full legal identity fields | `behaviors/07-finance-billing-collections.md`. | INV-ZS-017 |
| [INV-ZS-075](invariants.md#inv-zs-075-a-minimal-public-directory-exists) | A minimal public directory exists | `behaviors/09-transfers-mobility.md`, `cross-cutting/02-security-privacy.md`. | INV-ZS-002 |
| [INV-ZS-076](invariants.md#inv-zs-076-zschool-provides-structure-templates-that-schools-instantiate-and-adapt) | ZSchool provides structure templates that schools instantiate and adapt | `behaviors/03-academic-structure-timetables.md`. | INV-ZS-013 |
| [INV-ZS-077](invariants.md#inv-zs-077-a-year-s-structure-may-be-cloned-forward-without-pupils) | A year's structure may be cloned forward without pupils | `behaviors/03-academic-structure-timetables.md`. | INV-ZS-013 |
| [INV-ZS-078](invariants.md#inv-zs-078-a-subject-s-weight-and-language-are-set-per-level-and-track) | A subject's weight and language are set per level and track | `behaviors/03-academic-structure-timetables.md`. | INV-ZS-014 |
| [INV-ZS-079](invariants.md#inv-zs-079-every-academic-record-has-an-author-and-a-data-subject) | Every academic record has an author and a data subject | cross-cutting; see `domain-model.md` §5. | INV-ZS-036 |
| [INV-ZS-080](invariants.md#inv-zs-080-published-academic-data-stays-readable-after-departure) | Published academic data stays readable after departure | `behaviors/06-documents-certificates.md`. | INV-ZS-033 |
| [INV-ZS-081](invariants.md#inv-zs-081-internal-data-is-never-portable) | Internal data is never portable | `behaviors/05-assessments-grades-report-cards.md`, `behaviors/04-attendance-student-life-discipline.md`. | INV-ZS-034 |
| [INV-ZS-082](invariants.md#inv-zs-082-no-automatic-access-between-schools) | No automatic access between schools | `behaviors/09-transfers-mobility.md`. | INV-ZS-035 |
| [INV-ZS-083](invariants.md#inv-zs-083-the-default-transfer-profile-is-scoped) | The default transfer profile is scoped | `behaviors/09-transfers-mobility.md`. | INV-ZS-012, INV-ZS-022 |
| [INV-ZS-084](invariants.md#inv-zs-084-closed-enrollment-data-is-read-only-after-a-grace-period) | Closed-enrollment data is read-only after a grace period | `behaviors/02-admissions-enrollment-reenrollment.md`. | INV-ZS-024 |
| [INV-ZS-085](invariants.md#inv-zs-085-a-published-report-card-is-frozen-and-versioned) | A published report card is frozen and versioned | `behaviors/05-assessments-grades-report-cards.md`. | INV-ZS-015 |
| [INV-ZS-086](invariants.md#inv-zs-086-retention-for-official-data-outranks-erasure) | Retention for official data outranks erasure | cross-cutting; see `domain-model.md` §5. | ADR-ZS-003, INV-ZS-037 |
| [INV-ZS-087](invariants.md#inv-zs-087-teacher-history-visibility-is-opt-in) | Teacher history visibility is opt-in | `behaviors/10-teacher-career-network.md`. | INV-ZS-038 |
| [INV-ZS-088](invariants.md#inv-zs-088-permissions-are-contextual-per-account-role-and-school) | Permissions are contextual per account, role, and school | `cross-cutting/01-permissions.md`. | INV-ZS-040 |
| [INV-ZS-089](invariants.md#inv-zs-089-school-roles-are-fine-grained-and-editable) | School roles are fine-grained and editable | `cross-cutting/01-permissions.md`. | INV-ZS-041 |
| [INV-ZS-090](invariants.md#inv-zs-090-every-write-and-sensitive-view-is-logged) | Every write and sensitive view is logged | `cross-cutting/02-security-privacy.md`. | INV-ZS-019 |
| [INV-ZS-091](invariants.md#inv-zs-091-least-privilege-by-assignment-not-by-role-alone) | Least privilege by assignment, not by role alone | `cross-cutting/01-permissions.md`. | INV-ZS-011 |

---

## §3 Decision traceability

| Decision | Title | Status | Affected invariants |
| -------- | ----- | ------ | -------------------- |
| [ADR-ZS-001](decisions/001-adult-student-account-holder.md) | An adult student becomes holder of their own account and data rights | Accepted | INV-ZS-042, INV-ZS-052 |
| [ADR-ZS-002](decisions/002-single-active-enrollment-per-year.md) | One active enrollment per student per school year in the national system | Accepted | INV-ZS-007, INV-ZS-058 |
| [ADR-ZS-003](decisions/003-default-retention-durations.md) | Default data-retention durations, set per data type | Accepted | INV-ZS-004, INV-ZS-037, INV-ZS-086 |
| [ADR-ZS-004](decisions/004-cancellation-export-and-deletion-timeline.md) | Subscription cancellation - export window, then deletion | Accepted | INV-ZS-045 |
| [ADR-ZS-005](decisions/005-no-document-blocking-for-unpaid-fees.md) | Official documents are never withheld for unpaid fees | Accepted | INV-ZS-016 |
| [ADR-ZS-006](decisions/006-no-teacher-school-cross-rating.md) | No rating or cross-recommendation between teachers and schools | Accepted | INV-ZS-038, INV-ZS-039 |
| [ADR-ZS-007](decisions/007-hosting-and-cross-border-transfer-morocco.md) | Production and backup hosting in Morocco | Accepted - later deviated from in practice, see ADR-ZS-091 | — |
| [ADR-ZS-008](decisions/008-growth-ambition-horizon.md) | Reference growth ambition and horizon | Accepted | — |
| [ADR-ZS-009](decisions/009-single-plan-pricing.md) | A single all-inclusive pricing plan | Accepted | INV-ZS-017 |
| [ADR-ZS-010](decisions/010-higher-education-out-of-scope.md) | Higher education and vocational training out of scope | Accepted | — |
| [ADR-ZS-011](decisions/011-document-seal-and-signature-levels.md) | Document seal and signature levels, phased V1 to V2 | Accepted | — |
| [ADR-ZS-012](decisions/012-target-market-and-default-system.md) | Target market and the national system as default | Accepted | — |
| [ADR-ZS-013](decisions/013-school-as-isolation-tenant.md) | The school is the data-isolation tenant, not the organization | Accepted | INV-ZS-001 |
| [ADR-ZS-014](decisions/014-global-identity-multi-profile-account.md) | A global identity, decoupled from any one school | Accepted | INV-ZS-030 |
| [ADR-ZS-015](decisions/015-massar-code-as-preferred-matching-key.md) | The Massar code as preferred, non-mandatory matching key | Accepted | INV-ZS-006 |
| [ADR-ZS-016](decisions/016-single-affiliation-entity.md) | One affiliation entity, not several redundant ones | Accepted | INV-ZS-009 |
| [ADR-ZS-017](decisions/017-enrollment-state-machine-no-deletion.md) | The enrollment state machine, and enrollments are never deleted | Accepted | INV-ZS-008 |
| [ADR-ZS-018](decisions/018-data-ownership-author-and-subject.md) | Data ownership split between an author school and a data subject | Accepted | INV-ZS-033, INV-ZS-035 |
| [ADR-ZS-019](decisions/019-disciplinary-and-health-data-not-portable.md) | Disciplinary and health data are not portable by default | Accepted | INV-ZS-022 |
| [ADR-ZS-020](decisions/020-immutable-versioned-report-cards.md) | Published report cards are immutable and versioned | Accepted | INV-ZS-015 |
| [ADR-ZS-021](decisions/021-bilingual-fr-ar-interface-from-mvp.md) | A French and Arabic (RTL) interface from MVP onward | Accepted | — |
| [ADR-ZS-022](decisions/022-mobile-number-as-primary-login-identifier.md) | Mobile phone number as the primary contact identifier | Accepted | INV-ZS-003, INV-ZS-044 |
| [ADR-ZS-023](decisions/023-notification-channel-priority.md) | In-app, SMS, and WhatsApp as priority notification channels | Accepted | — |
| [ADR-ZS-024](decisions/024-school-is-the-paying-customer.md) | The school is the paying customer; families and teachers pay nothing | Accepted | — |
| [ADR-ZS-025](decisions/025-no-cross-rating-in-v1-superseded.md) | Merged into ADR-ZS-006 | Merged - see ADR-ZS-006 | — |
| [ADR-ZS-026](decisions/026-mvp-v1-v2-scope-breakdown.md) | The MVP / V1 / V2 scope breakdown | Accepted - later extended, see ADR-ZS-041 | — |
| [ADR-ZS-027](decisions/027-processor-and-controller-roles.md) | ZSchool's data-processor and data-controller roles | Accepted | — |
| [ADR-ZS-028](decisions/028-detailed-roles-and-fine-grained-permissions.md) | Detailed school roles with fine-grained, logged permissions | Accepted | INV-ZS-041 |
| [ADR-ZS-029](decisions/029-academic-data-always-tied-to-enrollment.md) | Every academic data item is tied to an enrollment | Accepted | INV-ZS-036 |
| [ADR-ZS-030](decisions/030-positioning-and-primary-target.md) | Market positioning and primary target segment | Accepted | — |
| [ADR-ZS-031](decisions/031-online-payment-rails.md) | Fatourati as the primary online payment rail | Accepted | — |
| [ADR-ZS-032](decisions/032-exit-file-for-non-zschool-transfers.md) | A bilingual PDF exit file for transfers outside ZSchool | Accepted | — |
| [ADR-ZS-033](decisions/033-unverified-teacher-declared-experience.md) | Teachers may declare experience at schools outside ZSchool, marked unverified | Accepted | INV-ZS-038 |
| [ADR-ZS-034](decisions/034-moderated-parent-teacher-communication.md) | Parent-teacher communication is moderated by default | Accepted | — |
| [ADR-ZS-035](decisions/035-pilot-school-profiles.md) | Pilot school profiles | Accepted | — |
| [ADR-ZS-036](decisions/036-notification-channel-hierarchy.md) | Push-first notification channel hierarchy, with WhatsApp pricing flagged | Accepted | — |
| [ADR-ZS-041](decisions/041-mvp-scope-mid-year-close.md) | MVP scope extended to cover a school year's mid-year close | Working hypothesis - extends ADR-ZS-026 | — |
| [ADR-ZS-042](decisions/042-traceability-and-source-corrections.md) | Corpus-wide traceability rebuild and source corrections | Accepted | — |
| [ADR-ZS-043](decisions/043-mid-year-data-reprise.md) | Mid-year data reprise for onboarding pilots | Accepted | — |
| [ADR-ZS-044](decisions/044-state-machine-refinements.md) | Enrollment state-machine refinements | Accepted | INV-ZS-059 |
| [ADR-ZS-045](decisions/045-attendance-session-without-timetable.md) | Attendance sessions defined independently of the timetable at MVP | Accepted | — |
| [ADR-ZS-046](decisions/046-uncovered-session-and-substitution.md) | Declaring an uncovered or substituted teaching session | Accepted | — |
| [ADR-ZS-047](decisions/047-dec27-horizon-escalated.md) | The ADR-ZS-008 growth-ambition horizon kept as a hypothesis, pending confirmation | Escalated - pending product owner sign-off | — |
| [ADR-ZS-048](decisions/048-login-identifier-distinct-from-contact.md) | Login identifier distinct from the contact identifier | Accepted | INV-ZS-003, INV-ZS-044 |
| [ADR-ZS-049](decisions/049-number-change-loss-reassignment.md) | Handling phone-number change, loss, and SIM reassignment | Accepted | — |
| [ADR-ZS-050](decisions/050-guardian-matching-rules.md) | Guardian matching by strong and weak keys | Accepted | — |
| [ADR-ZS-051](decisions/051-adult-student-mvp.md) | Adult-student handling (INV-ZS-042) is MVP, not deferred | Accepted | — |
| [ADR-ZS-052](decisions/052-court-ordered-restriction-scope.md) | A court-ordered access restriction applies only where recorded | Accepted | — |
| [ADR-ZS-053](decisions/053-anonymization-school-registers.md) | Schools keep an identity snapshot in their registers after anonymization | Accepted | INV-ZS-004 |
| [ADR-ZS-054](decisions/054-health-record-per-school.md) | HealthRecord becomes a per-school entity, tenant-keyed | Accepted | — |
| [ADR-ZS-055](decisions/055-third-party-payer-relationship.md) | A third-party payer is a relationship carrying only the financial-guardian quality | Accepted | — |
| [ADR-ZS-056](decisions/056-absence-notification-rules.md) | Absence-notification timing, grouping, and correction rules | Accepted | — |
| [ADR-ZS-057](decisions/057-temporary-exclusion-vs-suspended.md) | Temporary exclusion sanctions are distinct from the SUSPENDED enrollment state | Accepted | — |
| [ADR-ZS-058](decisions/058-grading-calculation-rules-mvp.md) | Grading calculation rules for MVP | Accepted | — |
| [ADR-ZS-059](decisions/059-6ap-provincial-exam-label.md) | The 6AP exam is labeled provincial, correcting a research-file divergence | Accepted | — |
| [ADR-ZS-060](decisions/060-verification-qr-code-timing.md) | The verification QR code ships at V1 | Accepted | — |
| [ADR-ZS-061](decisions/061-finance-rules-batch.md) | Finance rules - split payments, cancellations, proration, statements, signatures | Accepted | INV-ZS-017 |
| [ADR-ZS-062](decisions/062-communication-rules-batch.md) | Communication rules - MVP threads, channel timing, language, opt-out, WABA | Accepted | — |
| [ADR-ZS-063](decisions/063-transfer-lifecycle-rules.md) | Transfer request lifecycle, signatures, and declared prior records | Accepted | — |
| [ADR-ZS-064](decisions/064-teacher-career-rules.md) | Teacher career rules | Accepted | — |
| [ADR-ZS-065](decisions/065-reporting-and-capacity-definitions.md) | Single definitions for attendance rate, capacity, effective date, ESISE control | Accepted | — |
| [ADR-ZS-066](decisions/066-compliance-and-security-before-pilot-batch.md) | Compliance and security posture required before pilot activation | Accepted | — |
| [ADR-ZS-071](decisions/071-baseline-update-escalated.md) | The corresponding baseline update is escalated to the product owner | Escalated - pending product owner sign-off | — |
| [ADR-ZS-072](decisions/072-dec27-horizon-confirmation-escalated.md) | Confirming the ADR-ZS-008 horizon reading is escalated to the product owner | Escalated - pending product owner sign-off | — |
| [ADR-ZS-073](decisions/073-mvp-scope-extension-cost-escalated.md) | Confirming the MVP scope extension and its development cost is escalated | Escalated - pending product owner sign-off | — |
| [ADR-ZS-081](decisions/081-effect-v4-as-application-runtime.md) | Effect v4 as the application runtime | Accepted | — |
| [ADR-ZS-082](decisions/082-httpapi-on-function-alchemy.md) | HttpApi on NodeHttpServer, deployed as a Function Alchemy | Accepted | — |
| [ADR-ZS-083](decisions/083-neon-postgres-over-dynamodb.md) | Neon Lakebase Postgres over DynamoDB | Accepted | — |
| [ADR-ZS-084](decisions/084-versioned-sql-migrator-no-orm.md) | Versioned SQL migrations via Effect's Migrator, no ORM | Accepted | — |
| [ADR-ZS-085](decisions/085-cognito-custom-auth-flow.md) | Amazon Cognito with a custom OTP authentication flow | Accepted | — |
| [ADR-ZS-086](decisions/086-alchemy-as-infrastructure-as-effects.md) | Alchemy as the Infrastructure-as-Code foundation | Accepted | — |
| [ADR-ZS-087](decisions/087-react-vite-pwa-over-nextjs.md) | React 19 + Vite 8 PWA SPA over Next.js SSR | Accepted | — |
| [ADR-ZS-088](decisions/088-effect-cucumber-vitest-as-bdd-runner.md) | @effect-cucumber/vitest as the BDD runner | Accepted | — |
| [ADR-ZS-089](decisions/089-github-actions-alchemy-per-pr-stages.md) | GitHub Actions with per-PR Alchemy preview stages | Accepted | — |
| [ADR-ZS-090](decisions/090-effect-opentelemetry-cloudwatch.md) | @effect/opentelemetry to CloudWatch over an external observability SaaS | Accepted | — |
| [ADR-ZS-091](decisions/091-eu-hosting-deviation-from-morocco-baseline.md) | EU hosting (AWS eu-central-1) as a deviation from the Morocco-hosting baseline | Accepted - product-owner sign-off obtained 2026-09-09 | — |
| [ADR-ZS-092](decisions/092-rls-as-defense-in-depth.md) | Postgres Row-Level Security as defense-in-depth behind application authorization | Accepted | — |
| [ADR-ZS-093](decisions/093-shadcn-ui-tailwind4.md) | shadcn/ui on Tailwind CSS 4, components copied into the repository | Accepted | — |
| [ADR-ZS-094](decisions/094-react-hook-form-effect-schema-zod-rejected.md) | react-hook-form with a custom Effect Schema resolver, zod rejected | Accepted | — |
| [ADR-ZS-095](decisions/095-lambda-arm64-graviton.md) | Lambda arm64 (Graviton) over x86_64 | Accepted | — |
| [ADR-ZS-096](decisions/096-qadi-for-authorization.md) | The @qadi family for authorization | Accepted | — |
| [ADR-ZS-097](decisions/097-typescript-7-tsgo-with-fallback.md) | TypeScript 7.x native compiler (tsgo), with a 5.9 fallback documented | Accepted | — |
| [ADR-ZS-098](decisions/098-offline-first-pwa-indexeddb-sync-queue.md) | Offline-first PWA via IndexedDB and a sync queue | Accepted | — |
| [ADR-ZS-099](decisions/099-sqs-idempotent-workers-mvp-async.md) | SQS with idempotent workers for MVP async processing, workflow deferred | Accepted | — |
| [ADR-ZS-100](decisions/100-postgres-full-text-search-over-external-engine.md) | Postgres full-text search over an external search engine | Accepted | — |
| [ADR-ZS-101](decisions/101-neon-branch-per-pr-and-per-bdd-run.md) | A Neon branch per developer, per PR, and per BDD test run | Accepted | — |
| [ADR-ZS-102](decisions/102-pnpm-workspaces-no-monorepo-tool.md) | pnpm workspaces, no turbo/nx, while build times allow it | Superseded by ADR-ZS-114 | — |
| [ADR-ZS-103](decisions/103-cloudfront-static-assets-only.md) | CloudFront serves only the static SPA bundle, never student data | Accepted | — |
| [ADR-ZS-104](decisions/104-clamav-upload-scanning.md) | Uploaded documents scanned by ClamAV before storage or distribution | Accepted | — |
| [ADR-ZS-105](decisions/105-academic-structure-school-vs-year-scoped-entities.md) | Every MVP academic-structure entity is a per-year snapshot, cloned wholesale at rollover | Accepted | — |
| [ADR-ZS-106](decisions/106-onboarding-import-staged-batch-sync-analyze-async-commit.md) | Onboarding import: staged batch, synchronous analyze, async idempotent commit with re-validation | Accepted | — |
| [ADR-ZS-107](decisions/107-person-relationship-rls-exists-subquery.md) | Person and ParentStudentRelationship stay covered by RLS via an EXISTS-subquery policy | Accepted | — |
| [ADR-ZS-108](decisions/108-cross-tenant-matching-security-definer-function.md) | Cross-tenant identity matching goes through a narrow SECURITY DEFINER function, never raw row access | Accepted | — |
| [ADR-ZS-109](decisions/109-person-separate-facet-tables.md) | Person plus separate facet tables per profile type | Accepted | — |
| [ADR-ZS-110](decisions/110-combined-import-batch-commit-order.md) | Combined import batch commits classes, then guardians, then per-student units | Accepted | — |
| [ADR-ZS-111](decisions/111-teacher-import-invited-only-no-assignment.md) | Bulk-imported teacher affiliations are created invited, never active — course assignment stays a manual post-acceptance step | Accepted | — |
| [ADR-ZS-112](decisions/112-historical-grades-archival-academic-year.md) | "Historical" grades are this school's own prior-year archive, imported into a born-closed archival AcademicYear | Accepted | — |
| [ADR-ZS-113](decisions/113-grade-import-synthesizes-assessment-and-enrollment.md) | Grade import synthesizes a placeholder Assessment, and a COMPLETED Enrollment for historical rows | Accepted | — |
| [ADR-ZS-114](decisions/114-turborepo-adopted-ahead-of-schedule.md) | Turborepo adopted ahead of ADR-ZS-102's "while build times allow it" schedule | Accepted | — |

---

## §4 URS / persona-need traceability

Lifted from `urs.md`'s own §6 (built when that file was written), table rows only -- its accompanying prose note about unresolved links is stale (Phases 2-3 have since landed, so those `spec/behaviors/*`/`spec/journeys/*` links now resolve).

| -------- | ------------ |
| ----- | ------------ | ----- |
| Requirement | Persona | Related journey | Satisfied by |
| ----------- | ------- | ---------------- | ------------ |
| URS-ZS-001 | DIR | `spec/journeys/01-school-group-director.md` (`JNY-ZS`, ex-`JNY-ZS-001`) | *(behaviors not yet migrated — see `spec/behaviors/11-dashboards-reporting.md` once written)* |
| URS-ZS-002 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`, `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-003 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/12-massar-regulatory-exports.md`)* |
| URS-ZS-004 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/11-dashboards-reporting.md`, `spec/behaviors/01-administration-onboarding-subscription.md`)* |
| URS-ZS-005 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/02-admissions-enrollment-reenrollment.md`, `spec/behaviors/03-academic-structure-timetables.md`)* |
| URS-ZS-006 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/05-assessments-grades-report-cards.md`)* |
| URS-ZS-007 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/01-administration-onboarding-subscription.md`)* |
| URS-ZS-008 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/12-massar-regulatory-exports.md`, `spec/behaviors/05-assessments-grades-report-cards.md`)* |
| URS-ZS-009 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/09-transfers-mobility.md`)* |
| URS-ZS-010 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/02-admissions-enrollment-reenrollment.md`, `spec/behaviors/06-documents-certificates.md`)* |
| URS-ZS-011 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`)* |
| URS-ZS-012 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/06-documents-certificates.md`)* |
| URS-ZS-013 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/06-documents-certificates.md`, `spec/behaviors/07-finance-billing-collections.md`)* |
| URS-ZS-014 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`, `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-015 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/06-documents-certificates.md`, `spec/behaviors/02-admissions-enrollment-reenrollment.md`)* |
| URS-ZS-016 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/02-admissions-enrollment-reenrollment.md`)* |
| URS-ZS-017 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/cross-cutting/03-non-functional-requirements.md`)* |
| URS-ZS-018 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-019 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`, `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-020 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-021 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-022 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-023 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/cross-cutting/01-permissions.md`)* |
| URS-ZS-024 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/11-dashboards-reporting.md`)* |
| URS-ZS-025 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-026 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/cross-cutting/01-permissions.md`)* |
| URS-ZS-027 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-028 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/05-assessments-grades-report-cards.md`)* |
| URS-ZS-029 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/03-academic-structure-timetables.md`)* |
| URS-ZS-030 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-031 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/10-teacher-career-network.md`)* |
| URS-ZS-032 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/10-teacher-career-network.md`)* |
| URS-ZS-033 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/11-dashboards-reporting.md`)* |
| URS-ZS-034 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/cross-cutting/01-permissions.md`)* |
| URS-ZS-035 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-036 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`)* |
| URS-ZS-037 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/11-dashboards-reporting.md`)* |
| URS-ZS-038 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-039 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-040 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`)* |
| URS-ZS-041 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-042 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/cross-cutting/01-permissions.md`)* |
| URS-ZS-043 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`, `spec/behaviors/05-assessments-grades-report-cards.md`)* |
| URS-ZS-044 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/13-ancillary-services.md`, `spec/domain-model.md`)* |
| URS-ZS-045 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/02-admissions-enrollment-reenrollment.md`, `spec/behaviors/01-administration-onboarding-subscription.md`)* |
| URS-ZS-046 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/cross-cutting/01-permissions.md`)* |
| URS-ZS-047 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/06-documents-certificates.md`)* |
| URS-ZS-048 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-049 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/01-administration-onboarding-subscription.md`)* |
| URS-ZS-050 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`)* |
| URS-ZS-051 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/cross-cutting/01-permissions.md`, `spec/invariants.md`)* |
| URS-ZS-052 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/behaviors/03-academic-structure-timetables.md`)* |
| URS-ZS-053 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/behaviors/05-assessments-grades-report-cards.md`)* |
| URS-ZS-054 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/behaviors/03-academic-structure-timetables.md`)* |
| URS-ZS-055 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/cross-cutting/01-permissions.md`, `spec/invariants.md`)* |
| URS-ZS-056 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/behaviors/05-assessments-grades-report-cards.md`, `spec/behaviors/06-documents-certificates.md`)* |
| URS-ZS-057 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/invariants.md`)* |
| URS-ZS-058 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/behaviors/06-documents-certificates.md`)* |

---

## §5 Journey traceability

| Journey file | Range(s) | Related modules cited |
| ------------ | -------- | ----------------------- |
| [00-journey-map.md](journeys/00-journey-map.md) | JMP-ZS-001..011 | `01-administration-onboarding-subscription`, `14-health-sensitive-data` |
| [01-school-group-director.md](journeys/01-school-group-director.md) | JNY-ZS-001..008 | `01-administration-onboarding-subscription`, `02-admissions-enrollment-reenrollment`, `03-academic-structure-timetables`, `05-assessments-grades-report-cards`, `06-documents-certificates`, `07-finance-billing-collections`, `08-communication-notifications`, `09-transfers-mobility`, `10-teacher-career-network`, `11-dashboards-reporting`, `12-massar-regulatory-exports`, `14-health-sensitive-data` |
| [02-secretary-cashier.md](journeys/02-secretary-cashier.md) | JNY-ZS-011..021 | `01-administration-onboarding-subscription`, `02-admissions-enrollment-reenrollment`, `06-documents-certificates`, `07-finance-billing-collections`, `08-communication-notifications` |
| [03-head-supervisor.md](journeys/03-head-supervisor.md) | JNY-ZS-031..039 | `04-attendance-student-life-discipline`, `05-assessments-grades-report-cards`, `07-finance-billing-collections`, `13-ancillary-services`, `14-health-sensitive-data` |
| [04-part-time-teacher.md](journeys/04-part-time-teacher.md) | JNY-ZS-041..050 | `01-administration-onboarding-subscription`, `03-academic-structure-timetables`, `04-attendance-student-life-discipline`, `05-assessments-grades-report-cards`, `08-communication-notifications`, `10-teacher-career-network`, `11-dashboards-reporting`, `12-massar-regulatory-exports` |
| [05-multi-school-parent.md](journeys/05-multi-school-parent.md) | JNY-ZS-051..062 | `01-administration-onboarding-subscription`, `02-admissions-enrollment-reenrollment`, `04-attendance-student-life-discipline`, `05-assessments-grades-report-cards`, `06-documents-certificates`, `07-finance-billing-collections`, `08-communication-notifications`, `09-transfers-mobility`, `11-dashboards-reporting` |
| [06-custodial-mother-and-guardian.md](journeys/06-custodial-mother-and-guardian.md) | JNY-ZS-071..077 | `01-administration-onboarding-subscription`, `02-admissions-enrollment-reenrollment`, `04-attendance-student-life-discipline`, `05-assessments-grades-report-cards`, `06-documents-certificates`, `07-finance-billing-collections`, `08-communication-notifications`, `09-transfers-mobility`, `14-health-sensitive-data` |
| [07-students-minor-and-adult.md](journeys/07-students-minor-and-adult.md) | JNY-ZS-081..089 | `01-administration-onboarding-subscription`, `02-admissions-enrollment-reenrollment`, `03-academic-structure-timetables`, `04-attendance-student-life-discipline`, `05-assessments-grades-report-cards`, `06-documents-certificates`, `07-finance-billing-collections`, `08-communication-notifications`, `09-transfers-mobility` |

---

## §6 Acceptance-scenario traceability

Every `@REQ-ZS-NNN` tag found anywhere under `features/` (308 scenarios total). This section is what `verify-traceability.sh` check 5 validates against.

| Tag | Feature file | Covers |
| --- | ------------ | ------ |
| REQ-ZS-001 | `features/san/fr-san-03-boarding-checkin-and-notification.feature` | BEH-ZS-283, BEH-ZS-284 |
| REQ-ZS-002 | `features/san/fr-san-03-student-not-present-at-stop.feature` | BEH-ZS-283, BEH-ZS-284 |
| REQ-ZS-003 | `features/san/fr-san-13-conditionable-service-access.feature` | BEH-ZS-293, BEH-ZS-282 |
| REQ-ZS-004 | `features/san/fr-san-09-activity-enrollment-waitlist.feature` | BEH-ZS-289 |
| REQ-ZS-005 | `features/san/fr-san-12-uniform-sale-billing.feature` | BEH-ZS-292 |
| REQ-ZS-006 | `features/adm/beh-zs-001-tenant-provisioning.feature` | BEH-ZS-001 |
| REQ-ZS-007 | `features/adm/beh-zs-003-legal-record.feature` | BEH-ZS-003 |
| REQ-ZS-008 | `features/adm/beh-zs-004-organization.feature` | BEH-ZS-004 |
| REQ-ZS-009 | `features/adm/beh-zs-005-setup-wizard.feature` | BEH-ZS-005 |
| REQ-ZS-010 | `features/adm/beh-zs-006-bulk-import.feature` | BEH-ZS-006 |
| REQ-ZS-011 | `features/adm/beh-zs-007-internal-users.feature` | BEH-ZS-007 |
| REQ-ZS-012 | `features/adm/beh-zs-008-languages.feature` | BEH-ZS-008 |
| REQ-ZS-013 | `features/adm/beh-zs-009-channel-configuration.feature` | BEH-ZS-009 |
| REQ-ZS-014 | `features/adm/beh-zs-010-trial-activation.feature` | BEH-ZS-010 |
| REQ-ZS-015 | `features/adm/beh-zs-011-payment-delinquency.feature` | BEH-ZS-011 |
| REQ-ZS-016 | `features/adm/beh-zs-012-cancellation.feature` | BEH-ZS-012 |
| REQ-ZS-017 | `features/adm/beh-zs-013-school-closure.feature` | BEH-ZS-013 |
| REQ-ZS-018 | `features/adm/beh-zs-014-active-student-count.feature` | BEH-ZS-014 |
| REQ-ZS-019 | `features/adm/beh-zs-015-consumable-packs.feature` | BEH-ZS-015 |
| REQ-ZS-020 | `features/adm/beh-zs-016-administration-log.feature` | BEH-ZS-016 |
| REQ-ZS-021 | `features/adm/beh-zs-017-public-directory.feature` | BEH-ZS-017 |
| REQ-ZS-022 | `features/adm/beh-zs-019-express-start-of-year.feature` | BEH-ZS-019 |
| REQ-ZS-023 | `features/adm/beh-zs-020-number-change-recovery.feature` | BEH-ZS-020 |
| REQ-ZS-026 | `features/ins/fr-ins-01-application-file-submission.feature` | BEH-ZS-021 |
| REQ-ZS-027 | `features/ins/fr-ins-02-supporting-document-completeness.feature` | BEH-ZS-022 |
| REQ-ZS-028 | `features/ins/fr-ins-05-admission-decision.feature` | BEH-ZS-025 |
| REQ-ZS-029 | `features/ins/fr-ins-06-massar-code-matching.feature` | BEH-ZS-026 |
| REQ-ZS-030 | `features/ins/fr-ins-07-weak-matching.feature` | BEH-ZS-027 |
| REQ-ZS-031 | `features/ins/fr-ins-08-provisional-profile-claiming.feature` | BEH-ZS-028 |
| REQ-ZS-032 | `features/ins/fr-ins-09-audited-profile-merge.feature` | BEH-ZS-029 |
| REQ-ZS-033 | `features/ins/fr-ins-10-identity-correction.feature` | BEH-ZS-030 |
| REQ-ZS-034 | `features/ins/fr-ins-11-guardians-and-matching.feature` | BEH-ZS-031 |
| REQ-ZS-035 | `features/ins/fr-ins-12-guardian-completeness.feature` | BEH-ZS-032 |
| REQ-ZS-036 | `features/ins/fr-ins-13-parental-access-restriction.feature` | BEH-ZS-033 |
| REQ-ZS-037 | `features/ins/fr-ins-14-enrollment-creation.feature` | BEH-ZS-034 |
| REQ-ZS-038 | `features/ins/fr-ins-15-enrollment-lifecycle.feature` | BEH-ZS-035 |
| REQ-ZS-039 | `features/ins/fr-ins-16-parent-contract.feature` | BEH-ZS-036 |
| REQ-ZS-040 | `features/ins/fr-ins-17-immediate-enrollment-documents.feature` | BEH-ZS-037 |
| REQ-ZS-041 | `features/ins/fr-ins-18-arrears-alert.feature` | BEH-ZS-038 |
| REQ-ZS-042 | `features/ins/fr-ins-20-re-enrollment-campaign.feature` | BEH-ZS-040 |
| REQ-ZS-043 | `features/ins/fr-ins-21-year-end-rollover.feature` | BEH-ZS-041 |
| REQ-ZS-044 | `features/ins/fr-ins-22-mid-year-class-change.feature` | BEH-ZS-042 |
| REQ-ZS-045 | `features/ins/fr-ins-23-n1-class-assignment.feature` | BEH-ZS-043 |
| REQ-ZS-046 | `features/ins/fr-ins-24-departures.feature` | BEH-ZS-044 |
| REQ-ZS-047 | `features/ins/fr-ins-25-parent-declared-child.feature` | BEH-ZS-045 |
| REQ-ZS-048 | `features/ins/fr-ins-26-declared-prior-history.feature` | BEH-ZS-046 |
| REQ-ZS-049 | `features/ins/fr-ins-27-import-activation.feature` | BEH-ZS-047 |
| REQ-ZS-053 | `features/ped/fr-ped-01-instantiate-national-template.feature` | BEH-ZS-051 |
| REQ-ZS-054 | `features/ped/fr-ped-02-academic-tree.feature` | BEH-ZS-052 |
| REQ-ZS-055 | `features/ped/fr-ped-03-subject-level-config.feature` | BEH-ZS-053 |
| REQ-ZS-056 | `features/ped/fr-ped-04-evaluation-periods.feature` | BEH-ZS-054 |
| REQ-ZS-057 | `features/ped/fr-ped-05-grading-scales.feature` | BEH-ZS-055 |
| REQ-ZS-058 | `features/ped/fr-ped-07-clone-structure-n-plus-1.feature` | BEH-ZS-057 |
| REQ-ZS-059 | `features/ped/fr-ped-08-teacher-assignment.feature` | BEH-ZS-058 |
| REQ-ZS-060 | `features/ped/fr-ped-09-build-courses.feature` | BEH-ZS-059 |
| REQ-ZS-061 | `features/ped/fr-ped-10-class-change.feature` | BEH-ZS-060, BEH-ZS-042 |
| REQ-ZS-062 | `features/ped/fr-ped-12-conflict-detection.feature` | BEH-ZS-062 |
| REQ-ZS-063 | `features/ped/fr-ped-13-timetable-variants.feature` | BEH-ZS-063 |
| REQ-ZS-064 | `features/ped/fr-ped-16-annual-calendar.feature` | BEH-ZS-066 |
| REQ-ZS-065 | `features/ped/fr-ped-19-structure-enrollment-consistency.feature` | BEH-ZS-069 |
| REQ-ZS-066 | `features/ped/fr-ped-20-expected-sessions.feature` | BEH-ZS-070 |
| REQ-ZS-067 | `features/ped/fr-ped-21-session-not-held.feature` | BEH-ZS-071 |
| REQ-ZS-074 | `features/vsc/fr-vsc-01-mobile-roll-call.feature` | BEH-ZS-081 |
| REQ-ZS-075 | `features/vsc/fr-vsc-02-offline-roll-call-sync.feature` | BEH-ZS-082 |
| REQ-ZS-076 | `features/vsc/fr-vsc-03-roll-call-sync-conflicts.feature` | BEH-ZS-083 |
| REQ-ZS-077 | `features/vsc/fr-vsc-04-absence-notification-5-minutes.feature` | BEH-ZS-084 |
| REQ-ZS-078 | `features/vsc/fr-vsc-05-multichannel-notification-routing.feature` | BEH-ZS-085 |
| REQ-ZS-079 | `features/vsc/fr-vsc-06-notification-configuration.feature` | BEH-ZS-086 |
| REQ-ZS-080 | `features/vsc/fr-vsc-07-parent-justification-with-attachment.feature` | BEH-ZS-087 |
| REQ-ZS-081 | `features/vsc/fr-vsc-08-justification-validation.feature` | BEH-ZS-088 |
| REQ-ZS-082 | `features/vsc/fr-vsc-14-disciplinary-incidents.feature` | BEH-ZS-094 |
| REQ-ZS-083 | `features/vsc/fr-vsc-15-graduated-sanctions.feature` | BEH-ZS-095 |
| REQ-ZS-084 | `features/vsc/fr-vsc-21-logging-student-life-entries.feature` | BEH-ZS-101 |
| REQ-ZS-085 | `features/vsc/fr-vsc-24-front-desk-justification.feature` | BEH-ZS-104 |
| REQ-ZS-086 | `features/vsc/fr-vsc-25-notification-retention-correction.feature` | BEH-ZS-105 |
| REQ-ZS-099 | `features/eva/fr-eva-01-assessment-types.feature` | BEH-ZS-111 |
| REQ-ZS-100 | `features/eva/fr-eva-02-assessment-periods-per-section.feature` | BEH-ZS-112 |
| REQ-ZS-101 | `features/eva/fr-eva-03-draft-grade-entry.feature` | BEH-ZS-113 |
| REQ-ZS-102 | `features/eva/fr-eva-04-offline-grade-entry.feature` | BEH-ZS-114 |
| REQ-ZS-103 | `features/eva/fr-eva-05-period-closing-and-locking.feature` | BEH-ZS-115 |
| REQ-ZS-104 | `features/eva/fr-eva-06-compliance-check.feature` | BEH-ZS-116 |
| REQ-ZS-105 | `features/eva/fr-eva-07-marker-and-grading-scale-rules.feature` | BEH-ZS-117 |
| REQ-ZS-106 | `features/eva/fr-eva-08-default-national-weightings.feature` | BEH-ZS-118 |
| REQ-ZS-107 | `features/eva/fr-eva-09-period-average-computation.feature` | BEH-ZS-119 |
| REQ-ZS-108 | `features/eva/fr-eva-10-manually-entered-certifying-exam-grades.feature` | BEH-ZS-120 |
| REQ-ZS-109 | `features/eva/fr-eva-11-import-certifying-exam-results.feature` | BEH-ZS-121 |
| REQ-ZS-110 | `features/eva/fr-eva-13-end-of-year-decisions.feature` | BEH-ZS-123 |
| REQ-ZS-111 | `features/eva/fr-eva-14-generation-of-bilingual-report-cards.feature` | BEH-ZS-124 |
| REQ-ZS-112 | `features/eva/fr-eva-15-publication-of-period-report-cards.feature` | BEH-ZS-125 |
| REQ-ZS-113 | `features/eva/fr-eva-16-authenticity-verification.feature` | BEH-ZS-126 |
| REQ-ZS-114 | `features/eva/fr-eva-17-correcting-a-published-report-card.feature` | BEH-ZS-127 |
| REQ-ZS-115 | `features/eva/fr-eva-18-annual-transcript.feature` | BEH-ZS-128 |
| REQ-ZS-116 | `features/eva/fr-eva-19-progressive-publication-of-grades.feature` | BEH-ZS-129 |
| REQ-ZS-118 | `features/doc/fr-doc-01-issuing-the-leaving-certificate.feature` | BEH-ZS-131, BEH-ZS-139 |
| REQ-ZS-119 | `features/doc/fr-doc-04-sequential-document-numbering.feature` | BEH-ZS-134 |
| REQ-ZS-120 | `features/doc/fr-doc-07-verifying-a-documents-authenticity.feature` | BEH-ZS-137 |
| REQ-ZS-121 | `features/doc/fr-doc-08-self-service-documents-for-guardians.feature` | BEH-ZS-138 |
| REQ-ZS-122 | `features/doc/fr-doc-09-no-document-blocking-for-unpaid-balances.feature` | BEH-ZS-139 |
| REQ-ZS-123 | `features/doc/fr-doc-10-written-traceability-of-requests-and-deliveries.feature` | BEH-ZS-140 |
| REQ-ZS-124 | `features/doc/fr-doc-11-digital-student-file.feature` | BEH-ZS-141 |
| REQ-ZS-125 | `features/doc/fr-doc-12-access-control-on-the-student-file.feature` | BEH-ZS-142 |
| REQ-ZS-126 | `features/doc/fr-doc-13-exit-file-to-a-non-zschool-school.feature` | BEH-ZS-143 |
| REQ-ZS-127 | `features/doc/fr-doc-14-document-versions-and-retention.feature` | BEH-ZS-144 |
| REQ-ZS-133 | `features/fin/fr-fin-01-fee-schedules.feature` | BEH-ZS-151 |
| REQ-ZS-134 | `features/fin/fr-fin-02-parents-contract.feature` | BEH-ZS-152 |
| REQ-ZS-135 | `features/fin/fr-fin-03-payment-schedule.feature` | BEH-ZS-153 |
| REQ-ZS-136 | `features/fin/fr-fin-04-sibling-discount.feature` | BEH-ZS-154 |
| REQ-ZS-137 | `features/fin/fr-fin-07-tamper-proof-numbering.feature` | BEH-ZS-157 |
| REQ-ZS-138 | `features/fin/fr-fin-10-payment-collection.feature` | BEH-ZS-160 |
| REQ-ZS-139 | `features/fin/fr-fin-11-cash-session.feature` | BEH-ZS-161 |
| REQ-ZS-140 | `features/fin/fr-fin-12-cheque-lifecycle.feature` | BEH-ZS-162 |
| REQ-ZS-141 | `features/fin/fr-fin-13-bank-transfer.feature` | BEH-ZS-163 |
| REQ-ZS-142 | `features/fin/fr-fin-15-fatourati.feature` | BEH-ZS-165 |
| REQ-ZS-143 | `features/fin/fr-fin-17-numbered-receipts.feature` | BEH-ZS-167 |
| REQ-ZS-144 | `features/fin/fr-fin-18-graduated-reminder.feature` | BEH-ZS-168 |
| REQ-ZS-145 | `features/fin/fr-fin-20-unpaid-balances-table.feature` | BEH-ZS-170 |
| REQ-ZS-146 | `features/fin/fr-fin-22-financial-guardian-third-party-payer.feature` | BEH-ZS-172 |
| REQ-ZS-147 | `features/fin/fr-fin-23-balance-survives-closing.feature` | BEH-ZS-173 |
| REQ-ZS-148 | `features/fin/fr-fin-24-account-statement-departure.feature` | BEH-ZS-174 |
| REQ-ZS-149 | `features/fin/fr-fin-26-self-service-financial-status.feature` | BEH-ZS-176 |
| REQ-ZS-150 | `features/fin/fr-fin-28-no-document-blocking.feature` | BEH-ZS-178 |
| REQ-ZS-151 | `features/fin/fr-fin-29-void-payment.feature` | BEH-ZS-179 |
| REQ-ZS-152 | `features/fin/fr-fin-30-family-payment.feature` | BEH-ZS-180 |
| REQ-ZS-163 | `features/com/fr-com-01-targeted-announcement.feature` | BEH-ZS-181 |
| REQ-ZS-164 | `features/com/fr-com-02-individual-message.feature` | BEH-ZS-182 |
| REQ-ZS-165 | `features/com/fr-com-03-moderated-thread.feature` | BEH-ZS-183 |
| REQ-ZS-166 | `features/com/fr-com-04-notification-routing.feature` | BEH-ZS-184 |
| REQ-ZS-167 | `features/com/fr-com-05-preferences-and-opt-out.feature` | BEH-ZS-185 |
| REQ-ZS-168 | `features/com/fr-com-06-bilingualism.feature` | BEH-ZS-186 |
| REQ-ZS-169 | `features/com/fr-com-07-delivery-tracking.feature` | BEH-ZS-187 |
| REQ-ZS-170 | `features/com/fr-com-08-credit-counters.feature` | BEH-ZS-188 |
| REQ-ZS-171 | `features/com/fr-com-09-whatsapp-tariff-switch.feature` | BEH-ZS-189 |
| REQ-ZS-172 | `features/com/fr-com-11-absence-notification.feature` | BEH-ZS-191 |
| REQ-ZS-173 | `features/com/fr-com-14-outing-authorization.feature` | BEH-ZS-194 |
| REQ-ZS-174 | `features/com/fr-com-15-message-templates.feature` | BEH-ZS-195 |
| REQ-ZS-175 | `features/com/fr-com-16-logging.feature` | BEH-ZS-196 |
| REQ-ZS-176 | `features/com/fr-com-17-communication-language.feature` | BEH-ZS-197 |
| REQ-ZS-177 | `features/com/fr-com-18-inbound-whatsapp-replies.feature` | BEH-ZS-198 |
| REQ-ZS-181 | `features/tra/fr-tra-01-transfer-request-initiation.feature` | BEH-ZS-201 |
| REQ-ZS-182 | `features/tra/fr-tra-02-transfer-file-lifecycle.feature` | BEH-ZS-202 |
| REQ-ZS-183 | `features/tra/fr-tra-03-shared-scope-consent.feature` | BEH-ZS-203 |
| REQ-ZS-184 | `features/tra/fr-tra-04-consent-revocation.feature` | BEH-ZS-204 |
| REQ-ZS-185 | `features/tra/fr-tra-05-origin-validation.feature` | BEH-ZS-205 |
| REQ-ZS-186 | `features/tra/fr-tra-06-closure-and-destination-enrollment.feature` | BEH-ZS-206 |
| REQ-ZS-187 | `features/tra/fr-tra-07-destination-bounded-access.feature` | BEH-ZS-207 |
| REQ-ZS-188 | `features/tra/fr-tra-08-massar-reference.feature` | BEH-ZS-208 |
| REQ-ZS-189 | `features/tra/fr-tra-09-exit-package.feature` | BEH-ZS-209 |
| REQ-ZS-190 | `features/tra/fr-tra-10-receivable-fate.feature` | BEH-ZS-210 |
| REQ-ZS-191 | `features/tra/fr-tra-11-post-closure-read-only.feature` | BEH-ZS-211 |
| REQ-ZS-192 | `features/tra/fr-tra-12-lifecycle-notifications.feature` | BEH-ZS-212 |
| REQ-ZS-193 | `features/tra/fr-tra-13-transfer-log-audit-trail.feature` | BEH-ZS-213 |
| REQ-ZS-194 | `features/car/fr-car-01-single-affiliation-register.feature` | BEH-ZS-221 |
| REQ-ZS-195 | `features/car/fr-car-02-invitation-and-bilateral-acceptance.feature` | BEH-ZS-222 |
| REQ-ZS-196 | `features/car/fr-car-03-simultaneous-multi-affiliation.feature` | BEH-ZS-223 |
| REQ-ZS-197 | `features/car/fr-car-04-closing-an-affiliation.feature` | BEH-ZS-224 |
| REQ-ZS-198 | `features/car/fr-car-05-suspending-and-resuming-affiliation.feature` | BEH-ZS-225 |
| REQ-ZS-199 | `features/car/fr-car-06-fine-grained-permissions.feature` | BEH-ZS-226 |
| REQ-ZS-200 | `features/car/fr-car-11-tracking-aref-authorization-deadlines.feature` | BEH-ZS-231 |
| REQ-ZS-201 | `features/car/fr-car-12-tracking-8-hour-weekly-cap.feature` | BEH-ZS-232 |
| REQ-ZS-202 | `features/car/fr-car-14-minimal-directory-consumption.feature` | BEH-ZS-234 |
| REQ-ZS-203 | `features/car/fr-car-16-confidentiality-of-job-search.feature` | BEH-ZS-236 |
| REQ-ZS-204 | `features/car/fr-car-18-no-cross-rating.feature` | BEH-ZS-238 |
| REQ-ZS-205 | `features/car/fr-car-19-permanent-teacher-share-indicator.feature` | BEH-ZS-239 |
| REQ-ZS-213 | `features/rap/fr-rap-01-leadership-dashboard.feature` | BEH-ZS-241 |
| REQ-ZS-214 | `features/rap/fr-rap-02-period-and-year-filters.feature` | BEH-ZS-242 |
| REQ-ZS-215 | `features/rap/fr-rap-03-student-life-daily-view.feature` | BEH-ZS-243 |
| REQ-ZS-216 | `features/rap/fr-rap-04-teacher-dashboard.feature` | BEH-ZS-244 |
| REQ-ZS-217 | `features/rap/fr-rap-05-multi-school-parent-dashboard.feature` | BEH-ZS-245 |
| REQ-ZS-218 | `features/rap/fr-rap-06-student-dashboard.feature` | BEH-ZS-246 |
| REQ-ZS-219 | `features/rap/fr-rap-09-organization-cross-site-comparison.feature` | BEH-ZS-249 |
| REQ-ZS-220 | `features/rap/fr-rap-10-exporting-dashboards.feature` | BEH-ZS-250 |
| REQ-ZS-221 | `features/rap/fr-rap-11-esise-data-preparation.feature` | BEH-ZS-251 |
| REQ-ZS-222 | `features/rap/fr-rap-12-scheduled-weekly-report.feature` | BEH-ZS-252 |
| REQ-ZS-223 | `features/rap/fr-rap-13-permissions-applied-to-indicators.feature` | BEH-ZS-253 |
| REQ-ZS-226 | `features/mas/fr-mas-01-massar-code-as-matching-key.feature` | BEH-ZS-261 |
| REQ-ZS-227 | `features/mas/fr-mas-02-version-managed-templates.feature` | BEH-ZS-262 |
| REQ-ZS-228 | `features/mas/fr-mas-03-export-student-lists.feature` | BEH-ZS-263 |
| REQ-ZS-229 | `features/mas/fr-mas-04-export-grades-by-subject-semester.feature` | BEH-ZS-264 |
| REQ-ZS-230 | `features/mas/fr-mas-05-validation-report-before-submission.feature` | BEH-ZS-265 |
| REQ-ZS-231 | `features/mas/fr-mas-06-compliance-status-and-closing-statement.feature` | BEH-ZS-266 |
| REQ-ZS-232 | `features/mas/fr-mas-10-import-certifying-exam-results.feature` | BEH-ZS-270 |
| REQ-ZS-233 | `features/mas/fr-mas-11-transfer-massar-reference.feature` | BEH-ZS-271 |
| REQ-ZS-234 | `features/mas/fr-mas-13-no-automation-of-massar-entry.feature` | BEH-ZS-273 |
| REQ-ZS-241 | `features/hea/fr-hea-01-one-record-per-school.feature` | BEH-ZS-301 |
| REQ-ZS-242 | `features/hea/fr-hea-02-activation-conditions.feature` | BEH-ZS-302 |
| REQ-ZS-243 | `features/hea/fr-hea-03-restricted-access.feature` | BEH-ZS-303 |
| REQ-ZS-244 | `features/hea/fr-hea-04-minimal-alerts.feature` | BEH-ZS-304 |
| REQ-ZS-245 | `features/hea/fr-hea-05-full-access-logging.feature` | BEH-ZS-305 |
| REQ-ZS-246 | `features/hea/fr-hea-06-no-automatic-transfer.feature` | BEH-ZS-306 |
| REQ-ZS-247 | `features/hea/fr-hea-07-retention-and-deletion.feature` | BEH-ZS-307 |
| REQ-ZS-248 | `features/hea/fr-hea-10-data-subject-rights.feature` | BEH-ZS-310 |
| REQ-ZS-275 | `features/journeys/dir/jny-zs-001-school-group-onboarding.feature` | JNY-ZS-001 |
| REQ-ZS-276 | `features/journeys/dir/jny-zs-002-multi-site-year-rollover.feature` | JNY-ZS-002 |
| REQ-ZS-277 | `features/journeys/dir/jny-zs-003-consolidated-cross-site-steering.feature` | JNY-ZS-003 |
| REQ-ZS-278 | `features/journeys/dir/jny-zs-004-multi-site-collections.feature` | JNY-ZS-004 |
| REQ-ZS-279 | `features/journeys/dir/jny-zs-005-period-closings-and-report-cards.feature` | JNY-ZS-005 |
| REQ-ZS-280 | `features/journeys/dir/jny-zs-006-inter-site-transfer.feature` | JNY-ZS-006 |
| REQ-ZS-281 | `features/journeys/dir/jny-zs-007-administering-roles-and-subscription.feature` | JNY-ZS-007 |
| REQ-ZS-282 | `features/journeys/dir/jny-zs-008-tooled-admission.feature` | JNY-ZS-008 |
| REQ-ZS-290 | `features/journeys/sec/jny-zs-011-enrolling-at-the-front-desk.feature` | JNY-ZS-011 |
| REQ-ZS-291 | `features/journeys/sec/jny-zs-012-collecting-a-monthly-payment-in-cash.feature` | JNY-ZS-012 |
| REQ-ZS-292 | `features/journeys/sec/jny-zs-013-collecting-start-of-year-cheques.feature` | JNY-ZS-013 |
| REQ-ZS-293 | `features/journeys/sec/jny-zs-014-issuing-a-certificate-despite-unpaid-fees.feature` | JNY-ZS-014 |
| REQ-ZS-294 | `features/journeys/sec/jny-zs-015-updating-a-students-file.feature` | JNY-ZS-015 |
| REQ-ZS-295 | `features/journeys/sec/jny-zs-016-phone-reminder-for-an-unpaid-fee.feature` | JNY-ZS-016 |
| REQ-ZS-296 | `features/journeys/sec/jny-zs-017-responding-to-a-parent.feature` | JNY-ZS-017 |
| REQ-ZS-297 | `features/journeys/sec/jny-zs-018-re-enrollment-and-rollover-secretariat-side.feature` | JNY-ZS-018 |
| REQ-ZS-298 | `features/journeys/sec/jny-zs-019-voiding-a-payment.feature` | JNY-ZS-019 |
| REQ-ZS-299 | `features/journeys/sec/jny-zs-020-arrival-of-a-student-from-outside-zschool.feature` | JNY-ZS-020 |
| REQ-ZS-300 | `features/journeys/sec/jny-zs-021-mid-year-resumption.feature` | JNY-ZS-021 |
| REQ-ZS-305 | `features/journeys/sur/jny-zs-031-morning-roll-call-offline.feature` | JNY-ZS-031 |
| REQ-ZS-306 | `features/journeys/sur/jny-zs-032-handling-absentees.feature` | JNY-ZS-032 |
| REQ-ZS-307 | `features/journeys/sur/jny-zs-033-tardiness-early-departure-exemption.feature` | JNY-ZS-033 |
| REQ-ZS-308 | `features/journeys/sur/jny-zs-034-incident-and-graduated-sanction.feature` | JNY-ZS-034 |
| REQ-ZS-309 | `features/journeys/sur/jny-zs-036-targeted-communication-to-a-class.feature` | JNY-ZS-036 |
| REQ-ZS-310 | `features/journeys/sur/jny-zs-038-adult-student-and-disciplinary-data.feature` | JNY-ZS-038 |
| REQ-ZS-311 | `features/journeys/sur/jny-zs-039-session-not-held.feature` | JNY-ZS-039 |
| REQ-ZS-320 | `features/journeys/ens/jny-zs-041-first-activation.feature` | JNY-ZS-041 |
| REQ-ZS-321 | `features/journeys/ens/jny-zs-042-daily-context-switcher.feature` | JNY-ZS-042 |
| REQ-ZS-322 | `features/journeys/ens/jny-zs-043-roll-call-offline.feature` | JNY-ZS-043, BEH-ZS-070 |
| REQ-ZS-323 | `features/journeys/ens/jny-zs-044-evening-grade-entry.feature` | JNY-ZS-044 |
| REQ-ZS-324 | `features/journeys/ens/jny-zs-046-messages-to-parents-moderated.feature` | JNY-ZS-046, ADR-ZS-034 |
| REQ-ZS-325 | `features/journeys/ens/jny-zs-047-preparing-averages-for-council.feature` | JNY-ZS-047 |
| REQ-ZS-326 | `features/journeys/ens/jny-zs-048-professional-profile.feature` | JNY-ZS-048 |
| REQ-ZS-327 | `features/journeys/ens/jny-zs-049-discreet-applications.feature` | JNY-ZS-049 |
| REQ-ZS-328 | `features/journeys/ens/jny-zs-050-aref-8-hour-cap.feature` | JNY-ZS-050, BEH-ZS-231, BEH-ZS-232 |
| REQ-ZS-336 | `features/journeys/par/jny-zs-051-creating-an-account-by-phone.feature` | JNY-ZS-051 |
| REQ-ZS-337 | `features/journeys/par/jny-zs-052-being-linked-to-his-children.feature` | JNY-ZS-052 |
| REQ-ZS-338 | `features/journeys/par/jny-zs-053-multi-child-multi-school-dashboard.feature` | JNY-ZS-053 |
| REQ-ZS-339 | `features/journeys/par/jny-zs-054-reacting-to-an-absence.feature` | JNY-ZS-054 |
| REQ-ZS-340 | `features/journeys/par/jny-zs-055-viewing-report-cards-from-two-schools.feature` | JNY-ZS-055 |
| REQ-ZS-341 | `features/journeys/par/jny-zs-056-paying-fees-via-fatourati.feature` | JNY-ZS-056 |
| REQ-ZS-342 | `features/journeys/par/jny-zs-057-receipt-and-reminder.feature` | JNY-ZS-057 |
| REQ-ZS-343 | `features/journeys/par/jny-zs-058-moderated-parent-teacher-messaging.feature` | JNY-ZS-058 |
| REQ-ZS-344 | `features/journeys/par/jny-zs-059-electronic-departure-authorization.feature` | JNY-ZS-059 |
| REQ-ZS-345 | `features/journeys/par/jny-zs-060-self-service-certificate.feature` | JNY-ZS-060 |
| REQ-ZS-346 | `features/journeys/par/jny-zs-061-number-change-and-access-recovery.feature` | JNY-ZS-061 |
| REQ-ZS-347 | `features/journeys/par/jny-zs-062-contesting-a-grade-or-absence.feature` | JNY-ZS-062 |
| REQ-ZS-356 | `features/journeys/gar/jny-zs-071-recording-distinct-qualities.feature` | JNY-ZS-071 |
| REQ-ZS-357 | `features/journeys/gar/jny-zs-072-daily-life-both-parents-informed.feature` | JNY-ZS-072 |
| REQ-ZS-358 | `features/journeys/gar/jny-zs-073-reserved-acts-and-accessible-documents.feature` | JNY-ZS-073 |
| REQ-ZS-359 | `features/journeys/gar/jny-zs-074-restricting-access-on-a-court-ruling.feature` | JNY-ZS-074 |
| REQ-ZS-360 | `features/journeys/gar/jny-zs-075-a-conflict-between-guardians.feature` | JNY-ZS-075 |
| REQ-ZS-361 | `features/journeys/gar/jny-zs-076-adult-student-restriction-projection.feature` | JNY-ZS-076 |
| REQ-ZS-362 | `features/journeys/gar/jny-zs-077-guardianship-regime-parameter.feature` | JNY-ZS-077 |
| REQ-ZS-369 | `features/journeys/ele/jny-zs-081-activating-student-access.feature` | JNY-ZS-081 |
| REQ-ZS-370 | `features/journeys/ele/jny-zs-083-report-card-publication.feature` | JNY-ZS-083 |
| REQ-ZS-372 | `features/journeys/ele/jny-zs-085-parental-access-restriction.feature` | JNY-ZS-085 |
| REQ-ZS-373 | `features/journeys/ele/jny-zs-088-post-departure-permanent-access.feature` | JNY-ZS-088 |
| REQ-ZS-374 | `features/journeys/ele/jny-zs-089-contesting-a-grade-or-absence.feature` | JNY-ZS-089 |
| REQ-ZS-400 | `features/cross-cutting/per/per-zs-005-supervisor-scope.feature` | PER-ZS-009, PER-ZS-004 |
| REQ-ZS-401 | `features/cross-cutting/per/per-zs-011-immediate-revocation.feature` | PER-ZS-011 |
| REQ-ZS-402 | `features/cross-cutting/per/per-zs-001-support-elevation.feature` | PER-ZS-001 |
| REQ-ZS-403 | `features/cross-cutting/per/per-zs-012-court-order-restriction.feature` | PER-ZS-012 |
| REQ-ZS-404 | `features/cross-cutting/per/per-zs-013-adult-student-restriction.feature` | PER-ZS-013 |
| REQ-ZS-405 | `features/cross-cutting/per/per-zs-003-local-admin-no-elevation.feature` | PER-ZS-003 |
| REQ-ZS-420 | `features/cross-cutting/sec/req-zs-420-identity-enumeration-protection.feature` | SEC-ZS-010 |
| REQ-ZS-421 | `features/cross-cutting/sec/req-zs-421-multi-tenant-isolation.feature` | SEC-ZS-012 |
| REQ-ZS-422 | `features/cross-cutting/sec/req-zs-422-strengthened-encryption-identity-documents.feature` | SEC-ZS-016 |
| REQ-ZS-423 | `features/cross-cutting/sec/req-zs-423-zschool-support-access.feature` | SEC-ZS-009 |
| REQ-ZS-424 | `features/cross-cutting/sec/req-zs-424-cndp-tier-change-alert.feature` | SEC-ZS-001 |
| REQ-ZS-425 | `features/cross-cutting/sec/req-zs-425-on-demand-restoration.feature` | SEC-ZS-026 |
| REQ-ZS-426 | `features/cross-cutting/sec/req-zs-426-termination-export-and-purge.feature` | SEC-ZS-019 |
| REQ-ZS-427 | `features/cross-cutting/sec/req-zs-427-recycled-number-and-self-service-change.feature` | SEC-ZS-004 |
| REQ-ZS-451 | `features/cross-cutting/nfr/nfr-zs-002-maintenance-window.feature` | NFR-ZS-002 |
| REQ-ZS-452 | `features/cross-cutting/nfr/nfr-zs-005-batch-report-card-publication.feature` | NFR-ZS-005 |
| REQ-ZS-453 | `features/cross-cutting/nfr/nfr-zs-018-permanent-utc0-timestamp.feature` | NFR-ZS-018 |
| REQ-ZS-454 | `features/cross-cutting/nfr/nfr-zs-023-absence-notification-latency.feature` | NFR-ZS-023 |
| REQ-ZS-455 | `features/cross-cutting/nfr/nfr-zs-030-idempotent-offline-sync.feature` | NFR-ZS-030 |
| REQ-ZS-456 | `features/cross-cutting/nfr/nfr-zs-031-offline-entry-conflict.feature` | NFR-ZS-031 |
| REQ-ZS-457 | `features/cross-cutting/nfr/nfr-zs-011-quarterly-restore-test.feature` | NFR-ZS-011 |
| REQ-ZS-480 | `features/cross-cutting/pak/pak-zs-004-counting-the-active-student.feature` | PAK-ZS-004 |
| REQ-ZS-481 | `features/cross-cutting/pak/pak-zs-005-monthly-subscription-billing.feature` | PAK-ZS-005 |
| REQ-ZS-482 | `features/cross-cutting/pak/pak-zs-007-converting-a-trial-to-a-subscription.feature` | PAK-ZS-007 |
| REQ-ZS-483 | `features/cross-cutting/pak/pak-zs-008-consolidated-invoice-for-a-school-group.feature` | PAK-ZS-008 |
| REQ-ZS-484 | `features/cross-cutting/pak/pak-zs-009-managing-the-sms-credit-balance.feature` | PAK-ZS-009 |
| REQ-ZS-485 | `features/cross-cutting/pak/pak-zs-010-whatsapp-pricing-switch.feature` | PAK-ZS-010 |
| REQ-ZS-500 | `features/cross-cutting/ux/req-zs-500-attendance-reliability-offline.feature` | UX-ZS-006 |
| REQ-ZS-501 | `features/cross-cutting/ux/req-zs-501-bilingual-rtl-interface.feature` | UX-ZS-013 |
| REQ-ZS-502 | `features/cross-cutting/ux/req-zs-502-context-switcher.feature` | UX-ZS-004 |
| REQ-ZS-503 | `features/cross-cutting/ux/req-zs-503-notification-preferences-consent.feature` | UX-ZS-005 |
| REQ-ZS-504 | `features/cross-cutting/ux/req-zs-504-phone-primary-contact-identifier.feature` | UX-ZS-009 |
| REQ-ZS-505 | `features/cross-cutting/ux/req-zs-505-shared-device-account-selection.feature` | UX-ZS-001 |
| REQ-ZS-520 | `features/cross-cutting/int/int-zs-002-massar-grade-export.feature` | INT-ZS-002 |
| REQ-ZS-521 | `features/cross-cutting/int/int-zs-001-massar-export-validation.feature` | INT-ZS-001 |
| REQ-ZS-522 | `features/cross-cutting/int/int-zs-005-certifying-exam-import.feature` | INT-ZS-005 |
| REQ-ZS-523 | `features/cross-cutting/int/int-zs-011-paying-installment-fatourati.feature` | INT-ZS-011 |
| REQ-ZS-524 | `features/cross-cutting/int/int-zs-009-daily-fatourati-reconciliation.feature` | INT-ZS-009 |
| REQ-ZS-525 | `features/cross-cutting/int/int-zs-014-automatic-card-payment.feature` | INT-ZS-014 |
| REQ-ZS-526 | `features/cross-cutting/int/int-zs-021-absence-notification-by-sms.feature` | INT-ZS-021 |
| REQ-ZS-527 | `features/cross-cutting/int/int-zs-020-sms-credit-balance-depletion.feature` | INT-ZS-020 |
| REQ-ZS-528 | `features/cross-cutting/int/int-zs-026-whatsapp-consent-and-fallback.feature` | INT-ZS-026 |
| REQ-ZS-529 | `features/cross-cutting/int/int-zs-028-pricing-switch.feature` | INT-ZS-028 |
| REQ-ZS-530 | `features/cross-cutting/int/int-zs-024-parent-reply-platform-number.feature` | INT-ZS-024 |
| REQ-ZS-531 | `features/cross-cutting/int/int-zs-032-stamped-attestation.feature` | INT-ZS-032 |
| REQ-ZS-532 | `features/cross-cutting/int/int-zs-031-signing-the-parent-contract.feature` | INT-ZS-031 |
| REQ-ZS-533 | `features/cross-cutting/int/int-zs-040-data-residency-morocco.feature` | INT-ZS-040 |
| REQ-ZS-550 | `features/cross-cutting/cnf/cnf-02-f112-tier-change.feature` | CNF-ZS-008 |
| REQ-ZS-551 | `features/cross-cutting/cnf/cnf-04-privacy-notice.feature` | CNF-ZS-009 |
| REQ-ZS-552 | `features/cross-cutting/cnf/cnf-05-rights-request-desk.feature` | CNF-ZS-003 |
| REQ-ZS-553 | `features/cross-cutting/cnf/cnf-11-annual-contract-signature.feature` | CNF-ZS-005 |
| REQ-ZS-554 | `features/cross-cutting/cnf/cnf-12-pricing-lock.feature` | CNF-ZS-015 |
| REQ-ZS-555 | `features/cross-cutting/cnf/cnf-13-re-enrollment-anti-refusal.feature` | CNF-ZS-006 |
| REQ-ZS-556 | `features/cross-cutting/cnf/cnf-14-unconditional-document-delivery.feature` | CNF-ZS-016 |
| REQ-ZS-558 | `features/cross-cutting/cnf/cnf-18-restricting-parent-access.feature` | CNF-ZS-019 |
| REQ-ZS-559 | `features/cross-cutting/cnf/cnf-21-anonymization-and-erasure.feature` | CNF-ZS-023 |
| REQ-ZS-560 | `features/cross-cutting/cnf/cnf-22-school-termination.feature` | CNF-ZS-024 |
| REQ-ZS-561 | `features/cross-cutting/cnf/cnf-25-pilot-cndp-timeline.feature` | CNF-ZS-001 |

---

## §7 Cross-cutting namespace coverage

### Requirement families

| Family | Range | Owning file |
| ------ | ----- | ----------- |
| PER-ZS | PER-ZS-001..019 | [01-permissions.md](cross-cutting/01-permissions.md) |
| SEC-ZS | SEC-ZS-001..028 | [02-security-privacy.md](cross-cutting/02-security-privacy.md) |
| NFR-ZS | NFR-ZS-001..050 | [03-non-functional-requirements.md](cross-cutting/03-non-functional-requirements.md) |
| PAK-ZS | PAK-ZS-001..017 | [04-business-model-packaging.md](cross-cutting/04-business-model-packaging.md) |
| UX-ZS | UX-ZS-001..017 | [05-ux-ui-mobile-first-rtl.md](cross-cutting/05-ux-ui-mobile-first-rtl.md) |
| INT-ZS | INT-ZS-001..045 | [06-external-integrations.md](cross-cutting/06-external-integrations.md) |
| CNF-ZS | CNF-ZS-001..027 | [07-legal-compliance-data-protection.md](cross-cutting/07-legal-compliance-data-protection.md) |
| RDM-ZS | (see `roadmap.md`) | [roadmap.md](roadmap.md) |
| KPI-ZS | (see `metrics.md`) | [metrics.md](metrics.md) |
| RSK-ZS | (see `risks.md`) | [risks.md](risks.md) |

### Screens (SCR-ZS)

130 screens total. Compact range form (consecutive runs collapsed):

| Range | Owning file |
| ----- | ----------- |
| SCR-ZS-001, SCR-ZS-002, SCR-ZS-003, SCR-ZS-004, SCR-ZS-005, SCR-ZS-006, SCR-ZS-007 | [behaviors/01-administration-onboarding-subscription.md](behaviors/01-administration-onboarding-subscription.md) |
| SCR-ZS-011, SCR-ZS-012, SCR-ZS-013, SCR-ZS-014, SCR-ZS-015, SCR-ZS-016, SCR-ZS-017, SCR-ZS-018, SCR-ZS-019, SCR-ZS-020, SCR-ZS-021, SCR-ZS-022 | [behaviors/02-admissions-enrollment-reenrollment.md](behaviors/02-admissions-enrollment-reenrollment.md) |
| SCR-ZS-031, SCR-ZS-032, SCR-ZS-033, SCR-ZS-034, SCR-ZS-035, SCR-ZS-036, SCR-ZS-037, SCR-ZS-038, SCR-ZS-039, SCR-ZS-040, SCR-ZS-041, SCR-ZS-042 | [behaviors/03-academic-structure-timetables.md](behaviors/03-academic-structure-timetables.md) |
| SCR-ZS-051, SCR-ZS-052, SCR-ZS-053, SCR-ZS-054, SCR-ZS-055, SCR-ZS-056, SCR-ZS-057, SCR-ZS-058, SCR-ZS-059, SCR-ZS-060 | [behaviors/04-attendance-student-life-discipline.md](behaviors/04-attendance-student-life-discipline.md) |
| SCR-ZS-061, SCR-ZS-062, SCR-ZS-063, SCR-ZS-064, SCR-ZS-065, SCR-ZS-066, SCR-ZS-067, SCR-ZS-068, SCR-ZS-069 | [behaviors/05-assessments-grades-report-cards.md](behaviors/05-assessments-grades-report-cards.md) |
| SCR-ZS-071, SCR-ZS-072, SCR-ZS-073, SCR-ZS-074, SCR-ZS-075, SCR-ZS-076, SCR-ZS-077 | [behaviors/06-documents-certificates.md](behaviors/06-documents-certificates.md) |
| SCR-ZS-081, SCR-ZS-082, SCR-ZS-083, SCR-ZS-084, SCR-ZS-085, SCR-ZS-086, SCR-ZS-087, SCR-ZS-088, SCR-ZS-089, SCR-ZS-090, SCR-ZS-091, SCR-ZS-092 | [behaviors/07-finance-billing-collections.md](behaviors/07-finance-billing-collections.md) |
| SCR-ZS-101, SCR-ZS-102, SCR-ZS-103, SCR-ZS-104, SCR-ZS-105, SCR-ZS-106, SCR-ZS-107, SCR-ZS-108, SCR-ZS-109, SCR-ZS-110 | [behaviors/08-communication-notifications.md](behaviors/08-communication-notifications.md) |
| SCR-ZS-111, SCR-ZS-112, SCR-ZS-113, SCR-ZS-114, SCR-ZS-115, SCR-ZS-116, SCR-ZS-117 | [behaviors/09-transfers-mobility.md](behaviors/09-transfers-mobility.md) |
| SCR-ZS-121, SCR-ZS-122, SCR-ZS-123, SCR-ZS-124, SCR-ZS-125, SCR-ZS-126 | [behaviors/10-teacher-career-network.md](behaviors/10-teacher-career-network.md) |
| SCR-ZS-131, SCR-ZS-132, SCR-ZS-133, SCR-ZS-134, SCR-ZS-135, SCR-ZS-136, SCR-ZS-137, SCR-ZS-138, SCR-ZS-139 | [behaviors/11-dashboards-reporting.md](behaviors/11-dashboards-reporting.md) |
| SCR-ZS-141, SCR-ZS-142, SCR-ZS-143, SCR-ZS-144, SCR-ZS-145, SCR-ZS-146, SCR-ZS-147, SCR-ZS-148 | [behaviors/12-massar-regulatory-exports.md](behaviors/12-massar-regulatory-exports.md) |
| SCR-ZS-151, SCR-ZS-152, SCR-ZS-153, SCR-ZS-154, SCR-ZS-155, SCR-ZS-156 | [behaviors/13-ancillary-services.md](behaviors/13-ancillary-services.md) |
| SCR-ZS-161, SCR-ZS-162, SCR-ZS-163, SCR-ZS-164, SCR-ZS-165, SCR-ZS-166 | [behaviors/14-health-sensitive-data.md](behaviors/14-health-sensitive-data.md) |
| SCR-ZS-171, SCR-ZS-172, SCR-ZS-173, SCR-ZS-174, SCR-ZS-175, SCR-ZS-176, SCR-ZS-177, SCR-ZS-178, SCR-ZS-179 | [cross-cutting/05-ux-ui-mobile-first-rtl.md](cross-cutting/05-ux-ui-mobile-first-rtl.md) |

---

## §8 Open-questions coverage

All 265 `OQ-ZS-NNN` entries are tracked in `open-questions.md`, consolidated in Phase 6 from the file-local `OQ-NN` sections of every `prd/**` chapter (a scheme that collided across ~20+ files, re-keyed here into one global, permanent register). This section exists only so `open-questions.md`'s own completeness is discoverable from the traceability capstone; per-question detail, status, and cross-references live in that file, not duplicated here.

| Register | Total entries | ID range |
| -------- | -------------- | -------- |
| [open-questions.md](open-questions.md) | 265 | OQ-ZS-001..OQ-ZS-265 |

---

## §9 Coverage targets

qadi's own §6 ties coverage percentages to a real `vitest.config.ts` and a running mutation-testing gate. **ZSchool has neither yet** -- no `package.json`, no test runner, no CI pipeline exist in this repository as of this migration (`features/support/README.md`'s "claims of absence" table says this plainly, and nothing here should be read as contradicting it). Stating coverage percentages now would be fabricated precision against nothing.

What this section will track, once `spec/decisions/088-effect-cucumber-vitest-as-bdd-runner.md`'s runner is actually wired up (per `STACK.md` §8-9 and the `spec/scripts/generate-id-map.mjs`-adjacent `verify-bdd-traceability.ts` concept referenced in `reports/2026-09-09-organizing-bdd-gherkin-tests.html`):

- **Scenario execution coverage**: what fraction of the 308 `REQ-ZS-NNN` scenarios in `features/**/*.feature` actually run green in CI, per module/cross-cutting family.
- **Requirement coverage**: what fraction of the 258 `BEH-ZS-NNN` behaviors (plus cross-cutting PER/SEC/NFR/PAK/UX/INT/CNF-ZS requirements) have at least one passing acceptance scenario, surfacing the gaps already visible in §6 (not every `BEH-ZS`/`PER-ZS`/etc. requirement has Gherkin in the source PRD -- several were directional or narrative-only, and that's a real, pre-existing gap, not one this migration introduced).
- **Code coverage**, once `packages/*` exist: statement/branch thresholds per package, matching qadi's own convention of failing the run on a shortfall rather than merely reporting it.

A shortfall against any future target here should fail the build, exactly as qadi's own policy states -- this section is deliberately left as an honest placeholder rather than invented numbers.

---
