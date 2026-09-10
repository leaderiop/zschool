> **Document Control**
>
> | Property       | Value                                                                                                                                                                                                                                   |
> | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-02                                                                                                                                                                                                                          |
> | Revision       | 1.0                                                                                                                                                                                                                                     |
> | Effective Date | 2026-09-09                                                                                                                                                                                                                              |
> | Status         | Draft                                                                                                                                                                                                                                   |
> | Author         | ZSchool Product                                                                                                                                                                                                                         |
> | Classification | Functional Specification                                                                                                                                                                                                                |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/11-admissions-enrollment-reenrollment.md` (v0.3), old `FR-INS-01..27` -> `BEH-ZS-021..047`, old `ECR-INS-01..12` -> `SCR-ZS-011..022`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Admissions, Enrollment and Re-enrollment (INS)

This chapter operationalizes, within the admissions-enrollment flow, the domain model's rules: identity matching and claiming, the enrollment state machine, guardians and qualities, the application file, the re-enrollment campaign and rollover. The canonical definitions (states, transitions, invariants, domain events) are owned by `spec/domain-model.md` and are not redefined here: this chapter cites and triggers them.

## 1. Objective and scope

**Objective.** Allow the school to capture admission demand (online and at the front desk), create and secure the global identity of the student and their guardians, run enrollment through the domain model's state machine, produce the parent contract and immediate enrollment documents, and then secure retention through the re-enrollment campaign and the bulk year renewal (rollover from N to N+1).

**In scope:**

| Item                                                                                                                                                                                                                                                                                                                                                                                                                                          | Version                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Core front-desk enrollment: student and guardian identity, strong and weak matching by Massar code, guardian matching by mobile number, provisional profile with invitation code and claim with knowledge challenge, pre-enrollment, activation, activation via import, closures (cancelled, active, completed, transferred, withdrawn), immediate enrollment documents, arrears alert, Massar transfer reference field, class-change history | MVP                           |
| Global identities, invitations and claims throughout enrollment; a parent declaring a child; a declared prior history for a student coming from a non-ZSchool school; the identity engine and bulk imports remain owned by `spec/behaviors/01-administration-onboarding-subscription.md`                                                                                                                                                      | MVP                           |
| Law 59.21 parent contract (generation, legal-guardian signature, financial-guardian countersignature, archiving); audited profile merges reserved for ZSchool support                                                                                                                                                                                                                                                                         | MVP (wave 1)                  |
| Re-enrollment campaign (pre-filled form, deposit, N+1 conversion), year-end rollover (bulk decisions, creation of N+1 enrollments as PRE-ENROLLED, class assignment, year-end departures)                                                                                                                                                                                                                                                     | MVP (wave 2 — year-end close) |
| Full application file (CANDIDATE state, online submission, supporting documents, admission tests, waitlist, tooled decision), SUSPENDED and EXPELLED states, scheduled campaign reminders, merge by an authorized school role                                                                                                                                                                                                                 | V1                            |
| Option attributes (transport, canteen) carried by the enrollment; the services themselves are delivered by `spec/behaviors/13-ancillary-services.md`                                                                                                                                                                                                                                                                                          | V2+                           |

**Out of scope (cross-references):**

| Excluded item                                                  | Owner                                                     | Link to this module                                                                        |
| -------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Payment schedules, deposit collection, arrears reminders       | `spec/behaviors/07-finance-billing-collections.md`        | This module triggers the reservation deposit and shows the arrears alert                   |
| Transfer procedure, sharing consents, leaving file             | `spec/behaviors/09-transfers-mobility.md`                 | This module carries the Massar transfer reference field and TRANSFERRED/WITHDRAWN closures |
| Document templates, numbering, stamp, QR code and self-service | `spec/behaviors/06-documents-certificates.md`             | This module requires immediate issuance of enrollment documents by cross-reference         |
| Expulsion decision (disciplinary council)                      | `spec/behaviors/04-attendance-student-life-discipline.md` | This module records the EXPELLED closure on a transmitted decision                         |
| Massar exports and compliance checks                           | `spec/behaviors/12-massar-regulatory-exports.md`          | This module supplies the data (enrollments, classes, Massar code)                          |
| Progression decisions made by the class council                | `spec/behaviors/05-assessments-grades-report-cards.md`    | This module consumes the decision and carries it on the enrollment                         |
| Dual schooling (tutoring centers, external activities)         | Out of scope until V2+                                    | No requirement here                                                                        |

## 2. Users and use cases

| Actor                                                   | Main use cases in this module                                                                                                                                                         | Related needs                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Front office (persona SEC, Fatima)                      | Entering a complete enrollment at the front desk in one pass; scanning documents; immediate document issuance; tracking the re-enrollment campaign; arrears alert without blocking    | URS-ZS-010, URS-ZS-013, URS-ZS-015, URS-ZS-016                                                        |
| Director (persona DIR, Si Abdellah)                     | Admission policy, documented admission decision, running the re-enrollment campaign, executing the rollover and bulk decisions, managing departures                                   | URS-ZS-005                                                                                            |
| Academic leadership / homeroom teachers                 | Assigning students to N+1 classes, mid-year class changes                                                                                                                             | URS-ZS-005                                                                                            |
| Parent or legal guardian (personas PAR, GAR)            | Submitting an online application, providing documents, signing the parent contract, confirming re-enrollment and paying the deposit, claiming the child's profile                     | URS-ZS-034, URS-ZS-036, URS-ZS-045                                                                    |
| A student who has come of age (persona ELE, Salma)      | Informed of their rights at the age of majority and at each re-enrollment ([INV-ZS-052](../invariants.md#inv-zs-052), [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)) | URS-ZS-055                                                                                            |
| Accounting / cashier                                    | Collecting the reservation deposit, viewing the arrears alert on the file                                                                                                             | URS-ZS-012                                                                                            |
| ZSchool support (MVP) or an authorized school role (V1) | Audited merge of two student profiles, arbitrating complex matches                                                                                                                    | [INV-ZS-056](../invariants.md#inv-zs-056); [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md) |

Seasonality is strong: admissions run from March to September (peaks in July-August), the re-enrollment campaign runs in spring, the rollover happens in June (see `spec/journeys/00-journey-map.md` §4). Pilots activated mid-year enter via import activation (BEH-ZS-047) and experience their first year-end close in June 2027 with MVP wave 2.

## 3. Key journeys

End-to-end journeys are mapped in `spec/journeys/00-journey-map.md`; the detailed journey steps are owned by the persona files `spec/journeys/01-school-group-director.md` through `spec/journeys/07-students-minor-and-adult.md`. This chapter does not duplicate those steps.

| Journey                                               | Content related to the module                                                                                                 | Chapter requirements                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| JMP-ZS-001 — Admitting a new student                  | File, documents, test, decision, enrollment, immediate documents; prior history of a student coming from a non-ZSchool school | BEH-ZS-021 to BEH-ZS-039, BEH-ZS-046 |
| JMP-ZS-002 — Bulk re-enrollment and N-to-N+1 rollover | Pre-filled campaign, deposits, bulk decisions, N+1 creation, class assignment, departures                                     | BEH-ZS-040 to BEH-ZS-044             |
| JMP-ZS-003 — Onboarding and mid-year catch-up         | Activating enrollments via import                                                                                             | BEH-ZS-047                           |
| JMP-ZS-004 — A parent claims an identity              | Invitation code, knowledge challenge, account activation, linking the identity; a parent declaring a child                    | BEH-ZS-028, BEH-ZS-031, BEH-ZS-045   |
| JMP-ZS-009 — Transfers and departures                 | TRANSFERRED/WITHDRAWN closure, Massar transfer reference, leaving file                                                        | BEH-ZS-035, BEH-ZS-039, BEH-ZS-044   |

## 4. Functional behaviors

| ID         | Title                                                                                   | Priority |
| ---------- | --------------------------------------------------------------------------------------- | -------- |
| BEH-ZS-021 | Submit an application file at the front desk and online                                 | Must     |
| BEH-ZS-022 | Collect and verify supporting documents                                                 | Must     |
| BEH-ZS-023 | Organize admission tests                                                                | Should   |
| BEH-ZS-024 | Manage the waitlist                                                                     | Should   |
| BEH-ZS-025 | Record the admission decision and open pre-enrollment                                   | Must     |
| BEH-ZS-026 | Create the student identity with strong matching by Massar code                         | Must     |
| BEH-ZS-027 | Detect probable duplicates via weak matching                                            | Must     |
| BEH-ZS-028 | Create a provisional profile with an invitation code and claiming                       | Must     |
| BEH-ZS-029 | Merge two student profiles under audit                                                  | Must     |
| BEH-ZS-030 | Correct identity with logging and cross-school notification                             | Must     |
| BEH-ZS-031 | Record guardians, their relationship types, and their qualities                         | Must     |
| BEH-ZS-032 | Require an active legal guardian and a financial guardian, signed by the legal guardian | Must     |
| BEH-ZS-033 | Apply default rights and accept only a court-ordered restriction                        | Must     |
| BEH-ZS-034 | Create the enrollment with its full academic context                                    | Must     |
| BEH-ZS-035 | Run the enrollment lifecycle (state machine)                                            | Must     |
| BEH-ZS-036 | Generate, have signed, and archive the parent contract (Law 59.21)                      | Must     |
| BEH-ZS-037 | Immediately issue enrollment documents                                                  | Must     |
| BEH-ZS-038 | Show the arrears alert without ever blocking                                            | Must     |
| BEH-ZS-039 | Record the Massar transfer reference                                                    | Should   |
| BEH-ZS-040 | Run the re-enrollment campaign                                                          | Must     |
| BEH-ZS-041 | Execute the year-end rollover (bulk decisions, N+1 creation)                            | Must     |
| BEH-ZS-042 | Log mid-year class changes                                                              | Must     |
| BEH-ZS-043 | Bulk-assign students to N+1 classes                                                     | Must     |
| BEH-ZS-044 | Handle departures during the rollover and on an ongoing basis                           | Must     |
| BEH-ZS-045 | Declare a child from the parent account and link it to the enrollment                   | Must     |
| BEH-ZS-046 | Record the declared prior history of a student coming from a non-ZSchool school         | Must     |
| BEH-ZS-047 | Activate an enrollment via import (data catch-up)                                       | Must     |

### 4.1 Application file and admission decision

### BEH-ZS-021: Submit an application file at the front desk and online

> **Invariant:** none
> **See:** [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-026`](../../features/ins/fr-ins-01-application-file-submission.feature)

REQUIREMENT: The system MUST let an application file (an enrollment in CANDIDATE state) be created either at the front desk by the front office, or online by the parent via an admission form shared by the school; the file MUST carry the proposed identity of the student in dual script, the requested level, the target school year, the application's origin, and the contact details of a reachable guardian (mobile number as primary identifier); each file MUST receive a shareable tracking number.

### BEH-ZS-022: Collect and verify supporting documents

> **Invariant:** none
> **See:** [ADR-ZS-054](../decisions/054-health-record-per-school.md) (tenant-keyed document storage)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-027`](../../features/ins/fr-ins-02-supporting-document-completeness.feature)

REQUIREMENT: For each requested level, the school MUST be able to define a list of mandatory and optional documents; the file MUST show each document's status (expected, received, verified, refused) and a completeness indicator that blocks the admission decision while a mandatory document is missing; sensitive documents (court rulings) MUST be encrypted and access-restricted; every document MUST be stored under the tenant key of the school that uploaded it.

### BEH-ZS-023: Organize admission tests

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: The school MAY define test or admission-interview sessions per level; the system MUST schedule the candidate, notify the guardian, record the result on the file, and MUST NOT automatically transmit that result to other schools.

### BEH-ZS-024: Manage the waitlist

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: When a level's capacity is reached (the sum of its classes' capacities, BEH-ZS-052), the file MAY be placed on a waitlist with a rank; the system MUST notify the candidate of placement, MUST automatically promote the first candidate when a spot opens, and MUST notify the promotion; priority rules (sibling, staff children) MUST be configurable by the school.

### BEH-ZS-025: Record the admission decision and open pre-enrollment

> **Invariant:** [INV-ZS-060](../invariants.md#inv-zs-060)
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-028`](../../features/ins/fr-ins-05-admission-decision.feature)

REQUIREMENT: The director MUST record a documented, dated decision (accepted, refused, waitlisted); an "accepted" decision MUST move the enrollment from CANDIDATE to PRE-ENROLLED, reserve the spot, and notify the guardian with the deposit amount and next steps; a "refused" decision MUST close the application with the reason kept on file, and no application may ever be deleted; the system MUST alert the director whenever a non-re-enrollment is recorded for a student already enrolled and in good standing (Law 59.21).

### 4.2 Student identity, matching and claiming

These requirements trigger, within the admission flow, the identity engine owned by `spec/behaviors/01-administration-onboarding-subscription.md` (bulk imports, platform-wide duplicate management).

### BEH-ZS-026: Create the student identity with strong matching by Massar code

> **Invariant:** [INV-ZS-054](../invariants.md#inv-zs-054), [INV-ZS-006](../invariants.md#inv-zs-006), [INV-ZS-005](../invariants.md#inv-zs-005)
> **See:** [ADR-ZS-015](../decisions/015-massar-code-as-preferred-matching-key.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-029`](../../features/ins/fr-ins-06-massar-code-matching.feature)

REQUIREMENT: During an admission, if a Massar code is entered, the system MUST check its format (one letter plus nine digits) and its platform-wide uniqueness; if a profile already carries this code, the system MUST offer linking rather than enforce it, with the staff member's choice logged; matching MUST be protected against identity enumeration; the Massar code MUST remain optional.

### BEH-ZS-027: Detect probable duplicates via weak matching

> **Invariant:** [INV-ZS-055](../invariants.md#inv-zs-055), [INV-ZS-005](../invariants.md#inv-zs-005)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-030`](../../features/ins/fr-ins-07-weak-matching.feature)

REQUIREMENT: Without a Massar code, the system MUST search existing profiles by cross-referencing first name, last name, date of birth, and a guardian's phone number; any match MUST produce a probable-duplicate alert shown on the file, with no automatic linking ever performed; the staff member's choice MUST be logged, and unresolved alerts MUST stay visible in a matching queue.

### BEH-ZS-028: Create a provisional profile with an invitation code and claiming

> **Invariant:** [INV-ZS-063](../invariants.md#inv-zs-063)
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md), [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md), [ADR-ZS-049](../decisions/049-number-change-loss-reassignment.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-031`](../../features/ins/fr-ins-08-provisional-profile-claiming.feature)

REQUIREMENT: When a student profile is created by the school with no existing match, it MUST be created "provisional" and an invitation code MUST be sent by SMS to each guardian; claiming MUST require, besides the code, a knowledge challenge (the child's date of birth, never displayed before validation), with three failures invalidating the code; a claim made against a wrong number MUST be revocable by the school, with a new code reissued and the revoked account notified; the invitation message MUST NOT contain the child's full name or date of birth.

### BEH-ZS-029: Merge two student profiles under audit

> **Invariant:** [INV-ZS-056](../invariants.md#inv-zs-056), [INV-ZS-020](../invariants.md#inv-zs-020)
> **See:** [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)
> **Priority:** Must
> **Version:** MVP (ZSchool support); V1 (authorized school role)
> **Acceptance:** [`@REQ-ZS-032`](../../features/ins/fr-ins-09-audited-profile-merge.feature)

REQUIREMENT: Merging two duplicate student profiles MUST be reserved for ZSchool support at MVP and MAY open to an authorized school role at V1; the system MUST present both profiles side by side, require selecting a target profile, require explicit confirmation from a legal guardian for linked data, replay the links to the target profile, and keep a full trace; each school's academic data MUST stay within its own tenant, with only identity unified.

### BEH-ZS-030: Correct identity with logging and cross-school notification

> **Invariant:** [INV-ZS-057](../invariants.md#inv-zs-057), [INV-ZS-026](../invariants.md#inv-zs-026)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-033`](../../features/ins/fr-ins-10-identity-correction.feature)

REQUIREMENT: Any school with an active enrollment MAY correct a student's identity data; every correction MUST be logged (author, before, after, reason) and notified to every other school involved and to the guardians; corrections after every active enrollment has closed MUST go through an audited procedure ([INV-ZS-024](../invariants.md#inv-zs-024)).

### 4.3 Student guardians

### BEH-ZS-031: Record guardians, their relationship types, and their qualities

> **Invariant:** [INV-ZS-028](../invariants.md#inv-zs-028), [INV-ZS-029](../invariants.md#inv-zs-029), [INV-ZS-030](../invariants.md#inv-zs-030), [INV-ZS-063](../invariants.md#inv-zs-063)
> **See:** [ADR-ZS-014](../decisions/014-global-identity-multi-profile-account.md), [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md), [ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md), [ADR-ZS-050](../decisions/050-guardian-matching-rules.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-034`](../../features/ins/fr-ins-11-guardians-and-matching.feature)

REQUIREMENT: The enrollment file MUST allow recording any number of guardians, each with their own personal account, no shared accounts; each parent-student relationship MUST carry the relationship type and cumulative qualities (legal guardian, custodial guardian, financial guardian, emergency contact, pickup authorization), with "legal guardian" and "custodial guardian" recorded distinctly and supported by documents; a mobile number already tied to a platform account MUST trigger an offer to link, never a new creation; two guardians sharing one mobile number MUST each get their own account, the second via a generated login identifier.

### BEH-ZS-032: Require an active legal guardian and a financial guardian, signed by the legal guardian

> **Invariant:** [INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-021](../invariants.md#inv-zs-021), [INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-028](../invariants.md#inv-zs-028)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-035`](../../features/ins/fr-ins-12-guardian-completeness.feature)

REQUIREMENT: To be activated, every enrollment MUST carry at least one active legal guardian and one financial guardian, which MAY be the same person or a third party; the legal tutor MUST be identified as the required signatory of the enrollment, supported by a recorded document; contradictory requests between guardians MUST be flagged to the school, which arbitrates.

### BEH-ZS-033: Apply default rights and accept only a court-ordered restriction

> **Invariant:** [INV-ZS-065](../invariants.md#inv-zs-065), [INV-ZS-027](../invariants.md#inv-zs-027)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-036`](../../features/ins/fr-ins-13-parental-access-restriction.feature)

REQUIREMENT: By default, all legal guardians and the custodial guardian MUST have access to the student's school information; restricting a guardian's access MUST be possible only under a recorded court ruling with a supporting document and traceability; the restriction MUST take effect only at schools that have attached the ruling, with other schools notified and recording it in turn after verification.

### 4.4 Enrollment, contract, and documents

### BEH-ZS-034: Create the enrollment with its full academic context

> **Invariant:** [INV-ZS-007](../invariants.md#inv-zs-007)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-037`](../../features/ins/fr-ins-14-enrollment-creation.feature)

REQUIREMENT: The enrollment MUST link the student, the school, and the school year, and carry the section, cycle, level, track and options, class, and arrangement; it MUST carry an effective date from which attendance, thresholds, and exports count; assigning a class MUST check the class's capacity, with any overage possible only under the director's documented approval; the system MUST refuse to create a second ACTIVE enrollment for the same student-school year pair.

### BEH-ZS-035: Run the enrollment lifecycle (state machine)

> **Invariant:** [INV-ZS-007](../invariants.md#inv-zs-007), [INV-ZS-008](../invariants.md#inv-zs-008), [INV-ZS-058](../invariants.md#inv-zs-058), [INV-ZS-059](../invariants.md#inv-zs-059), [INV-ZS-060](../invariants.md#inv-zs-060), [INV-ZS-062](../invariants.md#inv-zs-062)
> **See:** [ADR-ZS-044](../decisions/044-state-machine-refinements.md), [ADR-ZS-017](../decisions/017-enrollment-state-machine-no-deletion.md)
> **Priority:** Must
> **Version:** MVP (PRE-ENROLLED, ACTIVE, COMPLETED, TRANSFERRED, WITHDRAWN, CANCELLED, import activation); V1 for CANDIDATE, SUSPENDED, EXPELLED
> **Acceptance:** [`@REQ-ZS-038`](../../features/ins/fr-ins-15-enrollment-lifecycle.feature)

REQUIREMENT: The lifecycle MUST follow `spec/domain-model.md`'s state machine; an enrollment that has ever been ACTIVE MUST never be deleted, only closed with a reason and date; every transition MUST record date, reason, and author, and notify guardians per the state; activation MUST require a complete file, an initial payment, and complete guardians, except for activation via import (BEH-ZS-047); closing an enrollment MUST NOT close the financial relationship, which survives until settled.

### BEH-ZS-036: Generate, have signed, and archive the parent contract (Law 59.21)

> **Invariant:** [INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-017](../invariants.md#inv-zs-017)
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** MVP (wave 1 — generation, scanned signature, financial-guardian countersignature, archiving); V1 (advanced electronic signature)
> **Acceptance:** [`@REQ-ZS-039`](../../features/ins/fr-ins-16-parent-contract.feature)

REQUIREMENT: On enrollment activation, the system MUST generate the annual written school-parent contract required by Law 59.21, presented in French and Arabic; it MUST be signed by the legal guardian (or the adult student) and countersigned by the financial guardian when distinct; the signed contract MUST be archived in the enrollment file; no fee change MUST be possible mid-year on an active enrollment, and generating a contract mid-year for an already-active enrollment MUST be refused on this ground.

### BEH-ZS-037: Immediately issue enrollment documents

> **Invariant:** none
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)
> **Priority:** Must
> **Version:** MVP (basic issuance); V1 (certificate numbering, stamp, QR)
> **Acceptance:** [`@REQ-ZS-040`](../../features/ins/fr-ins-17-immediate-enrollment-documents.feature)

REQUIREMENT: Once enrollment entry is complete, the system MUST immediately issue the pre-enrollment or enrollment certificate, the deposit or registration-fee receipt, and the bilingual student record as downloadable PDFs, sent to guardians on their mobile channel.

### BEH-ZS-038: Show the arrears alert without ever blocking

> **Invariant:** [INV-ZS-016](../invariants.md#inv-zs-016)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-041`](../../features/ins/fr-ins-18-arrears-alert.feature)

REQUIREMENT: The system MUST show an informational arrears alert on the student's file and every enrollment screen, fed by finance; no state of the file MUST ever block issuing the certificate of enrollment, the leaving certificate, report cards, or transcripts because of arrears; a summary account statement MAY be attached to a departure file.

### BEH-ZS-039: Record the Massar transfer reference

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: The enrollment and its associated transfer request MUST carry an optional "Massar transfer reference" field, entered when the ministerial transfer procedure was carried out outside ZSchool; the system MUST check the reference's format, keep it in the transfer log, and expose it to Massar exports (BEH-ZS-208, BEH-ZS-270).

### 4.5 Re-enrollment and year-end rollover

### BEH-ZS-040: Run the re-enrollment campaign

> **Invariant:** [INV-ZS-052](../invariants.md#inv-zs-052)
> **See:** [ADR-ZS-001](../decisions/001-adult-student-account-holder.md), [ADR-ZS-031](../decisions/031-online-payment-rails.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP (wave 2 — year-end close: pre-filled form, confirmation, deposit, N+1 conversion); V1 (scheduled reminders, advanced dashboard)
> **Acceptance:** [`@REQ-ZS-042`](../../features/ins/fr-ins-20-re-enrollment-campaign.feature)

REQUIREMENT: The director MUST be able to open a re-enrollment campaign for year N+1; the system MUST generate a pre-filled form per eligible student for the legal guardian to confirm; confirmation MUST create the N+1 enrollment in PRE-ENROLLED state and trigger the reservation deposit request; the system MUST alert the director whenever a non-re-enrollment is recorded for a student in good standing (Law 59.21).

### BEH-ZS-041: Execute the year-end rollover (bulk decisions, N+1 creation)

> **Invariant:** [INV-ZS-058](../invariants.md#inv-zs-058), [INV-ZS-059](../invariants.md#inv-zs-059), [INV-ZS-024](../invariants.md#inv-zs-024), [INV-ZS-013](../invariants.md#inv-zs-013)
> **See:** [ADR-ZS-044](../decisions/044-state-machine-refinements.md), [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)
> **Priority:** Must
> **Version:** MVP (wave 2 — year-end close)
> **Acceptance:** [`@REQ-ZS-043`](../../features/ins/fr-ins-21-year-end-rollover.feature)

REQUIREMENT: The rollover MUST close year N and produce year N+1 with no re-entry: year-end decisions entered individually or in bulk; every ACTIVE and SUSPENDED enrollment present at closing moved to COMPLETED with its decision; N+1 enrollments bulk-created in PRE-ENROLLED state only, skipping students who already have a non-terminal N+1 enrollment; the bulk operation MUST be logged, simulatable before execution, and resumable after an interruption with no double-processing.

### BEH-ZS-042: Log mid-year class changes

> **Invariant:** [INV-ZS-061](../invariants.md#inv-zs-061), [INV-ZS-025](../invariants.md#inv-zs-025)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-044`](../../features/ins/fr-ins-22-mid-year-class-change.feature)

REQUIREMENT: A student's mid-year class change MUST modify the enrollment without creating a new enrollment or a state transition; each change MUST produce an append-only history entry (originating class, target class, date, reason, author); guardians, the homeroom teacher, and the teachers involved MUST be notified; grades and attendance already produced MUST remain attached to the enrollment.

### BEH-ZS-043: Bulk-assign students to N+1 classes

> **Invariant:** [INV-ZS-061](../invariants.md#inv-zs-061), [INV-ZS-025](../invariants.md#inv-zs-025)
> **See:** none
> **Priority:** Must
> **Version:** MVP (wave 2 — year-end close)
> **Acceptance:** [`@REQ-ZS-045`](../../features/ins/fr-ins-23-n1-class-assignment.feature)

REQUIREMENT: Academic leadership MUST be able to assign pre-enrolled students to classes of their level, individually or in bulk; every assignment MUST update the enrollment's class field with a history entry (BEH-ZS-042) and a notification; an assignment exceeding a class's capacity MUST be flagged and blocked pending the director's documented approval.

### BEH-ZS-044: Handle departures during the rollover and on an ongoing basis

> **Invariant:** [INV-ZS-060](../invariants.md#inv-zs-060), [INV-ZS-062](../invariants.md#inv-zs-062), [INV-ZS-008](../invariants.md#inv-zs-008), [INV-ZS-018](../invariants.md#inv-zs-018)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md)
> **Priority:** Must
> **Version:** MVP (individual mid-year closures via BEH-ZS-035; list and leaving files for year-end departures at wave 2)
> **Acceptance:** [`@REQ-ZS-046`](../../features/ins/fr-ins-24-departures.feature)

REQUIREMENT: Mid-year departures MUST close an ACTIVE (or SUSPENDED) enrollment individually to TRANSFERRED or WITHDRAWN, always with a reason and date; year-end departures (non-re-enrollees, declared departures) MUST be closed COMPLETED by the rollover with no N+1 enrollment created at the originating school; for every departure, a leaving file MUST be prepared (leaving certificate, account statement, a bilingual leaving-file PDF for a non-ZSchool destination); any outstanding claim MUST remain attached to the originating school, never transferred to the receiving school.

### BEH-ZS-045: Declare a child from the parent account and link it to the enrollment

> **Invariant:** [INV-ZS-055](../invariants.md#inv-zs-055), [INV-ZS-063](../invariants.md#inv-zs-063)
> **See:** [ADR-ZS-029](../decisions/029-academic-data-always-tied-to-enrollment.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-047`](../../features/ins/fr-ins-25-parent-declared-child.feature)

REQUIREMENT: A parent MUST be able to declare, from their account, a child not yet known to the platform, creating a "provisional" student profile linked to the declared relationship, with no enrollment or academic data whatsoever; when enrolling at the front desk or online, the school MUST find this profile by strong or weak matching and link it to the enrollment by confirming the declared qualities, never creating a duplicate; a profile declared and never linked after 24 months MUST be anonymized.

### BEH-ZS-046: Record the declared prior history of a student coming from a non-ZSchool school

> **Invariant:** [INV-ZS-081](../invariants.md#inv-zs-081), [INV-ZS-083](../invariants.md#inv-zs-083)
> **See:** [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-048`](../../features/ins/fr-ins-26-declared-prior-history.feature)

REQUIREMENT: When enrolling a student previously schooled outside the platform, the front office MUST be able to record the declared prior history (previous school, years, levels, decisions, the Massar transfer reference, supporting documents), carried as "schools attended" and marked "declared, unverified" or "declared, document attached"; no detailed grades or disciplinary data MUST be entered through this channel.

### BEH-ZS-047: Activate an enrollment via import (data catch-up)

> **Invariant:** [INV-ZS-058](../invariants.md#inv-zs-058), [INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-021](../invariants.md#inv-zs-021), [INV-ZS-007](../invariants.md#inv-zs-007)
> **See:** [ADR-ZS-043](../decisions/043-mid-year-data-reprise.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-049`](../../features/ins/fr-ins-27-import-activation.feature)

REQUIREMENT: A dedicated (import) → ACTIVE transition, reserved for bulk import (BEH-ZS-006), MUST create an enrollment directly ACTIVE — with the logged reason "import activation — data catch-up" and no requirement for an initial payment or prior acceptance of disclosures — whenever the imported student carries a reached effective date, an existing class, and at least one legal guardian and one financial guardian; those acceptances MUST be collected retroactively when the legal guardian claims the account; students imported with no financial guardian or no class MUST be created PRE-ENROLLED and listed for completion.

## 5. Morocco-specific considerations

1. **Law 59.21** (private education, Official Gazette No. 7485 of 23/02/2026; repeals Laws 04.00, 05.00 and 06.00; 35 implementing decrees expected): mandatory annual written contract generated, signed, and archived (BEH-ZS-036); fee disclosure by service category carried in the contract's schedule; ban on mid-year increases ([INV-ZS-017](../invariants.md#inv-zs-017)); compliance alert on refusing to re-enroll a student in good standing (BEH-ZS-040, see `spec/open-questions.md`).
2. **Massar code** (one letter + nine digits, preferred but not mandatory matching key): format check, platform-wide uniqueness, strong and weak matching, anti-enumeration protection (BEH-ZS-026, BEH-ZS-027); Massar transfer reference logged (BEH-ZS-039).
3. **Family Code (Moudawana, Code 70-03 in force)**: the father is legal guardian by operation of law; the "legal guardian" and "custodial guardian" qualities are recorded distinctly with supporting documents; required signatory for enrollment and admission ([INV-ZS-066](../invariants.md#inv-zs-066), BEH-ZS-031, BEH-ZS-032). The December 2024 reform report was neither voted nor enacted as of 12/08/2026: the qualities' configuration must remain flexible without a schema overhaul.
4. **Bilingualism and dual script**: civil status required in Arabic and Latin script at entry; bilingual enrollment documents and contract with an RTL interface (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`).
5. **Spring re-enrollment campaign with a deposit** (market practice): tooled campaign with pre-filled forms, deposit, reminders, and conversion (BEH-ZS-040); annual re-enrollment fees and initial registration fees generally non-refundable (configurable schedule, owned by finance).
6. **Start-of-year seasonality** (classes mandatory from early September; ministry calendar published every year): configurable campaign windows; rollover in June; no heavy maintenance during peaks (see §9).
7. **Data protection (Law 09.08)**: disclosures and acceptances collected at enrollment and logged on the enrollment; guardians' CNIE numbers are not collected at MVP (field disabled until F112 authorization); the school is the data controller, ZSchool the processor (`spec/cross-cutting/07-legal-compliance-data-protection.md`).

## 6. Data and events

**Entities used** (`spec/domain-model.md`):

| Entity                                                                             | Usage in this module                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Person`, `User`, `StudentProfile` (provisional, linked statuses), `ParentProfile` | Identity of the student and guardians; Massar code; individual accounts                                                                                                                                                                               |
| `ParentStudentRelationship`                                                        | Relationship type, cumulative qualities, rights, supporting documents, context attributes                                                                                                                                                             |
| `Enrollment`                                                                       | Application (CANDIDATE) and enrollment; level, track, section, class, arrangement, options, status (including CANCELLED), effective date, entry reason, dates, financial guardian, acceptances, registry identity snapshot, Massar transfer reference |
| `StudentClassHistory`                                                              | Class-change history (append-only)                                                                                                                                                                                                                    |
| `YearDecision`                                                                     | Year-end decision carried by the COMPLETED enrollment                                                                                                                                                                                                 |
| `StudentDocument`                                                                  | Application-file and student-file documents, carrying the tenant key of whoever uploaded them                                                                                                                                                         |
| `StudentProfile` — declared schools attended                                       | Prior history from outside ZSchool, marked "declared, unverified" or "declared, document attached"                                                                                                                                                    |
| `User`                                                                             | Login identifier distinct from contact identifiers; a household's shared contact                                                                                                                                                                      |
| `School`, `AcademicYear`, `Section`, `Cycle`, `Level`, `Track`, `Class`, `Group`   | Enrollment's academic context (managed by `spec/behaviors/03-academic-structure-timetables.md`)                                                                                                                                                       |
| `TransferRequest`, `ConsentGrant`                                                  | Massar transfer reference; sharing consents                                                                                                                                                                                                           |
| `MergeOperation`, `AuditLog`                                                       | Audited merge; logging of decisions, transitions, and sensitive access                                                                                                                                                                                |
| `FeeSchedule`, `Invoice`, `Installment`, `Payment`, `Dunning`, `FinancialAccount`  | Deposit, payment schedule, arrears alert (owned by `spec/behaviors/07-finance-billing-collections.md`)                                                                                                                                                |
| `Certificate`                                                                      | Enrollment documents (owned by `spec/behaviors/06-documents-certificates.md`)                                                                                                                                                                         |

No new entity is created by this module; the CANCELLED state, the import-activation transition, the effective date, and the entry reason are carried by `spec/domain-model.md`. Admission-specific attributes (test sessions, waitlist rank, application origin) remain to be specified in the model (see `spec/open-questions.md`).

**Domain events**:

| Event                                                               | Module's role                             | Effects                                                                                                                |
| ------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `EnrollmentStatusChanged`                                           | Produced                                  | Director, guardians (depending on state), dashboards; delivered via `spec/behaviors/08-communication-notifications.md` |
| `ProbableDuplicateDetected`                                         | Produced                                  | School involved and the authorized role (alert without linking)                                                        |
| `IdentityClaimed`                                                   | Produced                                  | The school that created the provisional profile                                                                        |
| `IdentityCorrected`                                                 | Produced                                  | Other schools involved and guardians                                                                                   |
| `MergeCompleted`                                                    | Produced                                  | Schools involved, legal guardian, audit                                                                                |
| `StudentReachedMajority`                                            | Produced (platform-triggered)             | Informs the student of their rights; the school                                                                        |
| `AccessRestrictionRecorded`                                         | Produced                                  | Guardian concerned, other schools with an active enrollment, director, log                                             |
| `ConsentGranted` / `ConsentRevoked`                                 | Produced                                  | Audit log, receiving school                                                                                            |
| `PaymentReceived`                                                   | Consumed                                  | Confirming the reservation (deposit), meeting activation conditions                                                    |
| Invitation, admission-decision, and campaign-reminder notifications | Issued via `Notification` / `DeliveryLog` | Multi-channel routing and costs owned by `spec/behaviors/08-communication-notifications.md`                            |

## 7. Screens

All screens exist in French and Arabic (full RTL), mobile-first (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`).

- **SCR-ZS-011 — Online application portal (public, mobile).** Header with the school's name, logo, and a French-Arabic switch. Short-step form: student identity, requested level and school year, guardian mobile number verified by code, documents to upload. Summary before submission, tracking number shown and sent by SMS. Offline behavior: a draft kept locally, sent once network access returns.
- **SCR-ZS-012 — Application file queue (web, front office and director).** Filterable list with status badges and a document-completeness indicator. Quick actions: open, record a document, schedule a test, record a decision. Bulk printing of submission receipts.
- **SCR-ZS-013 — Application file (web and mobile).** Tabs: identity, documents, tests, decision, history. A permanent warning banner for a probable duplicate (linking to SCR-ZS-014). The decision is blocked while a mandatory document is missing.
- **SCR-ZS-014 — Identity-matching panel.** Side-by-side comparison of the entered profile and candidate profiles (strong via Massar code, weak via name/date-of-birth/phone). Differences highlighted; "link" or "create a new identity" actions with confirmation and reason logged. A queue of unresolved duplicate alerts; access to the audited merge (BEH-ZS-029).
- **SCR-ZS-015 — Front-desk enrollment wizard (one pass).** Steps: student identity with search and matching; guardians (qualities, individual accounts, supporting documents); academics; fees; acceptances and the legal tutor's signature, with the financial guardian's countersignature when distinct; declared prior history if applicable; immediate documents generated and sent. Progress bar, resumption after an interruption.
- **SCR-ZS-016 — Enrollment record (within the student file).** Header: bilingual identity, Massar code, photo, alerts. State-machine block: current state, effective date, entry reason, available transitions. Academic block, guardians block, documents block, transfer block. An audit log viewable per permissions.
- **SCR-ZS-017 — Guardians screen.** List of the student's guardians with relationship type, checkable qualities, account status, supporting documents, communication preferences. Rules shown on screen; access-restriction button with reason and traceability.
- **SCR-ZS-018 — Parent contract.** Bilingual read view with fee schedule, payment schedule, and clauses; contract state. Electronic signature flow, timestamp, verification code. Version history in case of regeneration before signature.
- **SCR-ZS-019 — Re-enrollment campaign dashboard.** Per-level counters (eligible, confirmed, pending, reminded, departures); deposits collected; conversion rate. Non-responder list with reminders. Reminder log.
- **SCR-ZS-020 — Rollover console (web).** Source/target year selection, decisions screen with bulk entry, simulation before execution, logged and resumable execution. Class assignment. Year-end departures screen with bulk leaving-file generation.
- **SCR-ZS-021 — A parent declaring a child (mobile).** A "Declare a Child" button; a short form; a list of declared children with status. No academic data as long as no enrollment exists.
- **SCR-ZS-022 — Declared prior history (front desk).** An enrollment-wizard tab: previous school, a table of prior years, Massar transfer reference, document upload; a "declared, unverified"/"declared, document attached" badge.

## 8. Integrations

| Family                           | Usage in this module                                                                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `INT-MAS` (Massar)               | Massar-code format check; exports of student and enrollment lists; Massar transfer reference logged. Details: `spec/behaviors/12-massar-regulatory-exports.md` |
| `INT-SIG` (electronic signature) | Advanced signature and timestamp for the parent contract and enrollment documents at V1; qualified signature at V2                                             |
| `INT-SMS`, `INT-WAP`, `INT-EML`  | Invitations and claim codes, admission decisions, campaign reminders; routing and costs owned by `spec/behaviors/08-communication-notifications.md`            |
| `INT-FAT` (Fatourati)            | Paying the re-enrollment deposit from V1, with the school remaining the creditor; owned by `spec/behaviors/07-finance-billing-collections.md`                  |

Full integration specifications: `spec/cross-cutting/06-external-integrations.md`.

## 9. Module-specific non-functional requirements

Reference to NFR domains carried by `spec/cross-cutting/03-non-functional-requirements.md`; no NFR requirement is numbered here.

- **Performance (NFR-PERF)**: common pages under 2s on 4G at the front desk and on mobile; enrollment documents generated in under 3s; a 2,000-student school's rollover executed as a logged, resumable batch process.
- **Peak resilience (NFR-RES)**: absorbing start-of-year peaks at the target sizing (500 schools, 500,000 students).
- **Availability (NFR-DISP)**: 99.5% target; no heavy maintenance during start-of-year and exam periods.
- **Languages (NFR-I18N)**: FR and AR with full RTL, mandatory dual-script civil status.
- **Mobile (NFR-MOB)**: online application, re-enrollment confirmation, and contract signature usable on a smartphone, fault-tolerant with draft resumption.
- **Security (NFR-INT, `spec/cross-cutting/02-security-privacy.md`)**: protection against enumeration of Massar codes and invitation codes; reinforced encryption of sensitive documents.
- **Auditability ([INV-ZS-090](../invariants.md#inv-zs-090))**: MVP immutable entry history; V1 immutable, exportable audit log, including for the AREF.

## 10. Success metrics

`KPI-ZS-NNN` identifiers are carried by `spec/metrics.md`; this chapter feeds candidate indicators: application conversion rate, file processing time, front-desk enrollment time, guardian activation rate, re-enrollment (retention) rate, deposits collected before end of June, consolidated N+1 headcounts, zero re-entry.

## 11. Open questions

Open questions for this module (covering the archived CANCELLED state rationale, the documentary MVP scope, the parent-contract MVP timing, waitlist and deposit rules, admission-specific model support, the re-enrollment compliance alert, the baseline update following research corrections, logging MVP scope, and the adult-student mechanism version) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
