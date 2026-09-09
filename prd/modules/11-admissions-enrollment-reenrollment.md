# ZSchool — Chapter 11: Admissions, Enrollment and Re-enrollment (INS module)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09) |
| Date | 2026-09-09 |
| Status | PRD Draft — under review |
| Source | `PROJECT.md` §6.2 (student identity, matching, G-01), §6.3 (enrollment lifecycle, C-04), §6.4 (guardians), §7.2 (admissions, enrollment, re-enrollment module, G-07), §7.7 (Law 59.21 parent contract, arrears alert, DEC-24), §7.9 (Massar transfer reference), §9 (anti-enumeration protection), §12 (scope by version); RG-04 to RG-16; DEC-04, DEC-06, DEC-10, DEC-11, DEC-20, DEC-21, DEC-24, DEC-30, DEC-31, DEC-32, DEC-36; C-04, G-01, G-07; H-14 |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/journeys/01-school-group-director.md` through `prd/journeys/07-students-minor-and-adult.md`, `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/12-academic-structure-timetables.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/15-documents-certificates.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/18-transfers-mobility.md`, `prd/modules/21-massar-regulatory-exports.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/research/00-baseline-corrections.md`, `prd/research/02-regulatory-data.md`, `prd/cross-cutting/42-review-arbitrations.md` (ARB-01, ARB-02, ARB-03, ARB-07 to ARB-11, ARB-20, ARB-22, ARB-24) |

This chapter operationalizes, within the admissions-enrollment flow, the baseline's rules: identity matching and claiming (§6.2), the enrollment state machine (§6.3), guardians and qualities (§6.4), the application file, the re-enrollment campaign and rollover (§7.2). The canonical definitions (states, transitions, invariants `INV-05` to `INV-09`, domain events) are owned by `prd/03-domain-data-model.md` and are not redefined here: this chapter cites and triggers them.

---

## 1. Objective and Scope

Module objective: allow the school to capture admission demand (online and at the front desk), create and secure the global identity of the student and their guardians, run enrollment through the domain model's state machine, produce the parent contract and immediate enrollment documents, and then secure retention through the re-enrollment campaign and the bulk year renewal (rollover from N to N+1).

### 1.1 In-Scope

| Item | Version |
|---|---|
| Core front-desk enrollment: student and guardian identity, strong and weak matching by Massar code, guardian matching by mobile number (ARB-09), provisional profile with invitation code and claim with knowledge challenge (ARB-08), pre-enrollment, activation, activation via import (ARB-02), closures (cancelled, active, completed, transferred, withdrawn), immediate enrollment documents, arrears alert, Massar transfer reference field, class-change history | MVP |
| Global identities, invitations and claims throughout enrollment; a parent declaring a child (path 2 of baseline §6.2); a declared prior history for a student coming from a non-ZSchool school (ARB-22); the identity engine and bulk imports remain owned by `prd/modules/10-administration-onboarding-subscription.md` | MVP |
| Law 59.21 parent contract (generation, legal-guardian signature, financial-guardian countersignature, archiving); audited profile merges reserved for ZSchool support | MVP (wave 1, ARB-01) |
| Re-enrollment campaign (pre-filled form, deposit, N+1 conversion), year-end rollover (bulk RG-09 decisions, creation of N+1 enrollments as PRE-ENROLLED, class assignment, year-end departures) | MVP (wave 2 — year-end close, JAL-07, ARB-01) |
| Full application file (CANDIDATE state, online submission, supporting documents, admission tests, waitlist, tooled decision), SUSPENDED and EXPELLED states, scheduled campaign reminders, merge by an authorized school role | V1 |
| Option attributes (transport, canteen) carried by the enrollment; the services themselves are delivered by `prd/modules/22-ancillary-services-transport-canteen-activities.md` | V2+ |
| Declaring a child from the parent account and linking it to the enrollment (FR-INS-25, ARB-09) | MVP |
| Declared prior history for a student coming from a non-ZSchool school (FR-INS-26, ARB-22) | MVP |
| Activating an enrollment via import, (import) → ACTIVE transition (FR-INS-27, ARB-02) | MVP |

### 1.2 Out of Scope (cross-references)

| Excluded item | Owner | Link to this module |
|---|---|---|
| Payment schedules, deposit collection, arrears reminders | `prd/modules/16-finance-billing-collections.md` | This module triggers the reservation deposit and shows the arrears alert (DEC-24) |
| Transfer procedure, sharing consents, leaving file | `prd/modules/18-transfers-mobility.md` | This module carries the Massar transfer reference field and TRANSFERRED/WITHDRAWN closures |
| Document templates, numbering, stamp, QR code and self-service | `prd/modules/15-documents-certificates.md` | This module requires immediate issuance of enrollment documents by cross-reference |
| Expulsion decision (disciplinary council) | `prd/modules/13-attendance-student-life-discipline.md` | This module records the EXPELLED closure on a transmitted decision |
| Massar exports and compliance checks | `prd/modules/21-massar-regulatory-exports.md` | This module supplies the data (enrollments, classes, Massar code) |
| Progression decisions made by the class council | `prd/modules/14-assessments-grades-report-cards.md` | This module consumes the decision and carries it on the enrollment (RG-09) |
| Dual schooling (tutoring centers, external activities) | Out of scope until V2+ (DEC-21, RG-08) | No requirement here |

---

## 2. Users and Use Cases

| Actor | Main use cases in this module | Related needs |
|---|---|---|
| Front office (persona `SEC`, Fatima) | Entering a complete enrollment at the front desk in one pass; scanning documents; immediate document issuance; tracking the re-enrollment campaign; arrears alert without blocking | BES-SEC-01, BES-SEC-04, BES-SEC-06, BES-SEC-07 |
| Director (persona `DIR`, Si Abdellah) | Admission policy, documented admission decision, running the re-enrollment campaign, executing the rollover and bulk decisions, managing departures | BES-DIR-05 |
| Academic leadership / homeroom teachers | Assigning students to N+1 classes, mid-year class changes | BES-DIR-05 |
| Parent or legal guardian (personas `PAR`, `GAR`) | Submitting an online application, providing documents, signing the parent contract, confirming re-enrollment and paying the deposit, claiming the child's profile | BES-PAR-01, BES-PAR-03, BES-GAR-02 |
| A student who has come of age (persona `ELE`, Salma) | Informed of their rights at the age of majority and at each re-enrollment (RG-02, DEC-20) | BES-ELE-05 |
| Accounting / cashier | Collecting the reservation deposit, viewing the arrears alert on the file | BES-SEC-02 |
| ZSchool support (MVP) or an authorized school role (V1) | Audited merge of two student profiles, arbitrating complex matches | RG-06; ARB-01 |

Seasonality is strong: admissions run from March to September (peaks in July-August), the re-enrollment campaign runs in spring, the rollover happens in June (see `prd/journeys/00-journey-map.md` §4). Pilots activated mid-year (JAL-04, ARB-02) enter via import activation (FR-INS-27) and experience their first year-end close in June 2027 with MVP wave 2 (ARB-01).

---

## 3. Key User Journeys

End-to-end journeys are mapped in `prd/journeys/00-journey-map.md`; the detailed `PJ-…` steps are owned by the persona files `prd/journeys/01-school-group-director.md` through `prd/journeys/07-students-minor-and-adult.md`. This chapter does not duplicate those steps.

| Journey | Content related to the module | Detailed steps | Chapter requirements |
|---|---|---|---|
| PC-01 — Admitting a new student | File, documents, test, decision, enrollment, immediate documents; prior history of a student coming from a non-ZSchool school | `prd/journeys/02-secretary-cashier.md` (PJ-SEC steps), `prd/journeys/01-school-group-director.md` (PJ-DIR decision), `prd/journeys/05-multi-school-parent.md` and `prd/journeys/06-custodial-mother-and-guardian.md` (submission and signatures) | FR-INS-01 to FR-INS-19, FR-INS-26 |
| PC-02 — Bulk re-enrollment and N-to-N+1 rollover | Pre-filled campaign, deposits, bulk decisions, N+1 creation, class assignment, departures | `prd/journeys/01-school-group-director.md` and `prd/journeys/02-secretary-cashier.md` (PJ-DIR and PJ-SEC steps) | FR-INS-20 to FR-INS-24 |
| PC-03 — Onboarding and mid-year catch-up | Activating enrollments via import | `prd/journeys/01-school-group-director.md`, `prd/journeys/02-secretary-cashier.md` | FR-INS-27 |
| PC-04 — A parent claims an identity | Invitation code, knowledge challenge, account activation, linking the identity; a parent declaring a child | `prd/journeys/05-multi-school-parent.md` and `prd/journeys/06-custodial-mother-and-guardian.md` (PJ-PAR and PJ-GAR steps) | FR-INS-08, FR-INS-11, FR-INS-25 |
| PC-09 — Transfers and departures | TRANSFERRED/WITHDRAWN closure, Massar transfer reference, leaving file | `prd/journeys/01-school-group-director.md`, `prd/journeys/02-secretary-cashier.md`, `prd/journeys/05-multi-school-parent.md` | FR-INS-15, FR-INS-19, FR-INS-24 |

---

## 4. Functional Requirements

### 4.1 Application file and admission decision

### FR-INS-01 — Submit an application file at the front desk and online

| Attribute | Value |
|---|---|
| Description | The system allows creating an application file (an enrollment in CANDIDATE state, state machine in `prd/03-domain-data-model.md` §3) either at the front desk by the front office, or online by the parent via an admission form shared by the school (link or access code). The file carries the proposed identity of the student (civil status in dual script, date and place of birth, sex), the requested level, the target school year, the application's origin (front desk, online, referral), and the contact details of a reachable guardian (mobile number as primary identifier, DEC-11). Each file receives a tracking number that can be shared with the parent. |
| Priority | Must |
| Version | V1 |
| Traceability | (→ §7.2, G-07, RG-05, DEC-11, prd/03 §3.2 (creation → CANDIDATE)) |
| Actors | Front office, director, parent or legal guardian |

```gherkin
Feature: Submitting an application file (V1)
  Scenario: Online submission by a parent
    Given an admission form shared by the school for the 2027-2028 school year
    When a parent enters the child's identity in dual script, the requested level, and their mobile number verified by code
    Then an enrollment in CANDIDATE state is created with a tracking number sent by SMS
    And the file appears in the front office's application queue with origin "online"
```

### FR-INS-02 — Collect and verify supporting documents

| Attribute | Value |
|---|---|
| Description | For each requested level, the school defines the list of mandatory and optional documents (birth certificate, photos, vaccination record, prior report cards, court ruling where applicable; default values by cycle). The file shows the status of each document (expected, received, verified, refused) and a completeness indicator that blocks the admission decision as long as a mandatory document is missing. Documents are scanned at the front desk or uploaded online; they feed the digital student file (owned by `prd/modules/15-documents-certificates.md`, `StudentDocument` entity in `prd/03`). Sensitive documents (court rulings) are encrypted and access-restricted. |
| Priority | Must |
| Version | V1 |
| Traceability | (→ §7.2 (required documents), §7.6, RG-14, DEC-10; ARB-13) |
| Actors | Front office, director, parent or legal guardian |

```gherkin
Feature: Application documents (V1)
  Scenario: Completeness of mandatory documents
    Given a list of mandatory documents configured for level 1AC comprising the birth certificate and two photos
    When the front office scans the birth certificate and marks the photos "received"
    Then the completeness indicator switches to "complete" and the admission decision becomes possible
    And each document is stored under the tenant key of the school that uploaded it (ARB-13) and, for a court ruling, encrypted and access-restricted
```

### FR-INS-03 — Organize admission tests

| Attribute | Value |
|---|---|
| Description | The school may define test or admission-interview sessions per level (dates, capacities, free-form evaluation criteria). The system schedules the candidate for a session, notifies the guardian (primary channel SMS/WhatsApp per their preferences), records the result (the school's own free-form scale, remark, optional interview notice) and attaches it to the file. The result is viewable in the file but is never automatically transmitted to other schools. |
| Priority | Should |
| Version | V1 |
| Traceability | (→ §7.2 (admission tests), G-07, DEC-11) |
| Actors | Director, front office, parent or legal guardian |

### FR-INS-04 — Manage the waitlist

| Attribute | Value |
|---|---|
| Description | When a level's capacity is reached (the level's capacity is the sum of the capacities of the level's classes as defined by FR-PED-02 in `prd/modules/12-academic-structure-timetables.md`, ARB-24b), the file may be placed on a waitlist with a rank (automatic by date or manual by the director). The system notifies the candidate of their placement, automatically promotes the first candidate on the list when a spot opens up (cancellation, withdrawal), and notifies the promotion. Waitlist tracking (headcount, conversions) is visible to the director. Priority rules (sibling of an enrolled student, staff children) are configurable by the school. |
| Priority | Should |
| Version | V1 |
| Traceability | (→ §7.2 (waitlist), G-07, §2.8 (usual sibling discount); ARB-24b) |
| Actors | Director, front office |

### FR-INS-05 — Record the admission decision and open pre-enrollment

| Attribute | Value |
|---|---|
| Description | The director records a documented, dated decision on the file: accepted, refused, waitlisted. An "accepted" decision moves the enrollment from CANDIDATE to PRE-ENROLLED (transition in `prd/03` §3.2), reserves the spot at the requested level, and notifies the guardian with the reservation deposit amount and next steps (remaining documents, contract). A "refused" decision closes the application with the reason kept on file; no application is ever deleted (campaign history retained, see OQ-01). Refusing to admit an outside candidate falls within the school's academic discretion; however, for a student already enrolled and in good standing, the system alerts the director whenever a non-re-enrollment is recorded, reminding them of the prohibition set by Law 59.21 (see OQ-06). |
| Priority | Must |
| Version | V1 |
| Traceability | (→ §7.2, G-07, RG-10, prd/03 §3.2 (CANDIDATE → PRE-ENROLLED), H-14, `prd/research/00-baseline-corrections.md` no. 2 (Law 59.21)) |
| Actors | Director, front office, parent or legal guardian |

```gherkin
Feature: Full admission of a new student
  Scenario: Complete file, successful test, favorable decision
    Given a CANDIDATE application at the front desk for Yasmine Benali, born 12/03/2015, requesting level 5AP for 2027-2028
    And all mandatory documents received and verified
    And an admission test recorded with the result "satisfactory"
    When the director records the decision "accepted" with its reason
    Then the enrollment moves to PRE-ENROLLED state and the 5AP spot is reserved
    And the legal guardian receives the decision notification with the deposit amount and remaining documents
    And the admissions dashboard shows the application as "pre-enrolled"

  Scenario: Decision blocked by a missing mandatory document
    Given an application whose birth certificate is still expected
    When the director attempts to record the decision "accepted"
    Then the system refuses the decision and lists the missing mandatory documents
    And the decision is only possible after the document is recorded, or after a documented exception granted by the director
```

### 4.2 Student identity, matching and claiming

These requirements trigger, within the admission flow, the identity engine described by `PROJECT.md` §6.2 and operationally owned by `prd/modules/10-administration-onboarding-subscription.md` (bulk imports, platform-wide duplicate management). The applicable invariants are `INV-01` to `INV-04` in `prd/03`.

### FR-INS-06 — Create the student identity with strong matching by Massar code

| Attribute | Value |
|---|---|
| Description | During an admission, if a Massar code is entered, the system checks its format (one letter followed by nine digits) and its uniqueness across the entire platform (RG-04, `INV-01`). If a student profile already carries this code, the system offers linking to the existing profile instead of a new creation; the offer is never enforced: the staff member confirms or creates a distinct identity after verification, with the choice logged. Search and matching by Massar code are protected against identity enumeration (rate limiting, PROJECT.md §9). The Massar code remains optional (preschool, new arrivals, foreign schools, DEC-04). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.2, RG-04, RG-05, DEC-04, G-01, `INV-01`, `INV-02`) |
| Actors | Front office, director, ZSchool support |

```gherkin
Feature: Identity matching by Massar code
  Scenario: Strong match offered, never enforced
    Given an existing student profile on the platform carrying Massar code R134520789
    When the front office enters an admission with Massar code R134520789
    Then the system offers linking to the existing profile without creating a duplicate
    And a distinct identity is created only after the staff member's explicit confirmation, with the choice logged

  Scenario: Invalid Massar code rejected at entry
    Given an admission being entered
    When the staff member enters a Massar code that does not match the one-letter-plus-nine-digit format
    Then the entry is flagged invalid before it is saved
```

### FR-INS-07 — Detect probable duplicates via weak matching

| Attribute | Value |
|---|---|
| Description | Without a Massar code, the system searches existing profiles by cross-referencing first name, last name, date of birth, and a guardian's phone number ("weak" matching, RG-05). Any match produces a probable-duplicate alert (`ProbableDuplicateDetected` event in `prd/03` §7) shown on the file and passed to support or the authorized role; no automatic linking is ever performed. The staff member chooses "link" or "create a new identity," with the choice logged. Unresolved alerts stay visible in a matching queue. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.2, RG-05, G-01, `INV-02`, `prd/03` §7 (`ProbableDuplicateDetected`)) |
| Actors | Front office, ZSchool support, authorized role |

```gherkin
Feature: Weak matching
  Scenario: Probable duplicate detected without automatic linking
    Given an existing student profile named Yassine El Amrani, born 05/09/2014, whose guardian's number is 0661234567
    When an admission is entered with the same first name, last name, date of birth, and guardian phone number, with no Massar code
    Then a probable-duplicate alert is shown and passed to the authorized role
    And the system links nothing automatically
    And the staff member chooses "link" or "create a new identity," with the choice logged
```

### FR-INS-08 — Create a provisional profile with an invitation code and claiming

| Attribute | Value |
|---|---|
| Description | When identity is created by the school with no existing profile, the student profile is created in a "provisional" state (a `StudentProfile` status, `prd/03` §2.1) and an invitation code is sent to each guardian (SMS to their mobile number, DEC-11). A guardian who creates or already has an account enters this code to claim the child's identity: the profile moves from "provisional" to "linked," the parent-student relationship becomes active, and the creating school is notified (`IdentityClaimed` event). The invitation code has a configurable validity period, is regenerable by the front office, and is protected against enumeration. Claiming requires, besides the code, a **knowledge challenge**: the guardian enters the child's date of birth, which is never displayed before validation (ARB-08d); three failures invalidate the code. A claim made against an incorrect number is **revocable** by the school (reason, logged) with a new code reissued to the corrected number and a notification to the revoked account. The invitation message contains neither the child's full name nor date of birth. A provisional profile remains usable by the school (enrollment, student life) even while unclaimed. A minor with no personal number is linked to their guardians via this same mechanism; the student's own access (RG-01) is owned by FR-ADM-20 and INV-45. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.2 (path 1), RG-12b, DEC-03, DEC-11, G-01, `prd/03` §7 (`IdentityClaimed`); ARB-08d) |
| Actors | Parent or legal guardian, front office, student (per RG-01) |

```gherkin
Feature: Claiming a provisional profile via an invitation code
  Scenario: A legal guardian claims their child's identity
    Given a provisional student profile created by the school with two guardians, one a legal guardian reachable at 0662345678
    When the legal guardian enters the invitation code received by SMS from their account
    Then the student profile moves from "provisional" to "linked"
    And the parent-student relationship becomes active with the recorded qualities
    And the creating school is notified of the claim

  Scenario: Expired invitation code
    Given an invitation code past its validity period
    When the guardian attempts to claim the profile with this code
    Then the claim is refused with an invitation to request a new code from the front office
    And the front office can regenerate a code

  Scenario: Invitation sent to a wrong number (ARB-08d)
    Given an invitation code sent by mistake to a third party's number
    When this third party enters the code without knowing the child's date of birth
    Then the claim is refused after three failures and the code is invalidated
    And the front office corrects the number, revokes any wrongful claim, and reissues a code, the operation being logged
```

### FR-INS-09 — Merge two student profiles under audit

| Attribute | Value |
|---|---|
| Description | Merging two student profiles detected as duplicates is an operation reserved for ZSchool support from MVP (pilot imports produce duplicates from February 2027, ARB-01) and opened to an authorized school role at V1 (RG-06, `MergeOperation` entity in `prd/03`). The system presents the two profiles side by side (identity, enrollments, guardians, data), requires selecting a target profile, requires explicit confirmation from a legal guardian for the linked data, replays the links to the target profile, and keeps a full trace (author, merged content, timestamp). Each school's academic data stays within its own tenant; only identity is unified. The operation notifies the schools involved (`MergeCompleted` event). |
| Priority | Must |
| Version | MVP (ZSchool support); V1 (authorized school role) — ARB-01 |
| Traceability | (→ §6.2, RG-06, G-01, `INV-03`, `prd/03` §7 (`MergeCompleted`); ARB-01) |
| Actors | ZSchool support, authorized role (V1), legal guardian (confirmation) |

```gherkin
Feature: Audited merge of two student profiles (MVP)
  Scenario: Merge after a multi-site group import
    Given two student profiles created by two sites of the same group for the same person, flagged as a probable duplicate
    When ZSchool support selects the target profile and obtains confirmation from a legal guardian
    Then the enrollments and relationships of both profiles are linked to the target profile
    And each site keeps its own academic data in its tenant, with only identity unified
    And the operation is fully traced and the two sites are notified
```

### FR-INS-10 — Correct identity with logging and cross-school notification

| Attribute | Value |
|---|---|
| Description | Identity (civil status, Massar code, photo, guardians) belongs to the person. Any school with an active enrollment may correct identity data; each correction is logged (author, before, after, reason) and notified to the other schools involved and to the guardians (`IdentityCorrected` event, RG-07, `INV-04`). Corrections after all of a person's active enrollments have closed go through an audited procedure (consistent with `INV-25`). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.2, RG-07, G-01, `INV-04`, `prd/03` §7 (`IdentityCorrected`)) |
| Actors | Front office, director, ZSchool support |

```gherkin
Feature: Shared identity correction
  Scenario: Correction notified to other schools
    Given a student enrolled at School A with an active enrollment also at School B
    When School A's front office corrects the Arabic spelling of the student's name
    Then the correction is logged with author, before and after values, and reason
    And School B and the guardians receive the correction notification
    And the corrected identity is identical as seen from both schools
```

### 4.3 Student guardians

### FR-INS-11 — Record guardians, their relationship types, and their qualities

| Attribute | Value |
|---|---|
| Description | The enrollment file allows recording any number of guardians (RG-12b), each with their own personal account (no shared accounts, `INV-13`): the form offers two parents (father, mother) by default and allows adding a legal guardian, grandparent, adult sibling, or other third party. For each guardian, the parent-student relationship carries the relationship type and the cumulative qualities: legal guardian (wilaya), custodial guardian (hadana), financial guardian, emergency contact, person authorized to pick up the child (RG-15). The "legal guardian" and "custodial guardian" qualities are recorded distinctly (`INV-11`) with their supporting document (court ruling, certificate, statement). School-specific context attributes (pickup authorizations, communication preferences) are added without duplicating the global relationship (RG-15). A guardian's minimal contact details are a mobile number in international E.164 format (DEC-11; foreign numbers accepted, ARB-07); an email address remains optional. **Guardian matching** (ARB-09): a mobile number already tied to a platform account or profile triggers an offer to link to the existing account, never a new creation (this is the mechanism that gives the multi-school parent a single account, BES-PAR-01); identical first name + last name + date of birth produces an alert without automatic linking. **Two guardians sharing the same mobile number** (ARB-07): the first is identified by the mobile number; the second receives a generated login identifier (INV-45), with the household's mobile number recorded as a shared contact for their one-time codes; no account is ever shared (INV-13). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.4, RG-12b, RG-14b, RG-15, DEC-03, DEC-11, `INV-11`, `INV-12`, `INV-13`, `INV-45`, BES-GAR-02, BES-PAR-01; ARB-07, ARB-09) |
| Actors | Front office, director, parent or legal guardian |

```gherkin
Feature: Guardians and matching (MVP)
  Scenario: A parent already known at another school
    Given Ahmed, holder of an account identified by +212661234567, guardian of Youssef and Sara at School A
    When School B enters a guardian "Ahmed" with this same number for Adam's enrollment
    Then the system offers linking to Ahmed's existing account and refuses to create a second account
    And after confirmation, Ahmed sees Adam from his single account alongside Youssef and Sara
  Scenario: Two guardians, one mobile number
    Given a father and mother reachable on the same mobile number
    When the front office records both guardians
    Then the father is identified by the mobile number and the mother receives a generated login identifier with the household's mobile number as a shared contact
    And each has their own account and their own qualities
```

### FR-INS-12 — Require an active legal guardian and a financial guardian, signed by the legal guardian

| Attribute | Value |
|---|---|
| Description | To be activated, every enrollment must carry at least one active legal guardian and one financial guardian (RG-13, `INV-09`); both qualities may be held by the same person or by a third party who is not a legal guardian (payment by a grandparent or an employer, §2.8). When both parents are recorded, they are both legal guardians by default and both receive notifications, unless configured otherwise under a court ruling (RG-14). The file identifies the legal tutor as the required signatory of the enrollment (RG-14b, `INV-11`; typically the father unless deceased, absent, or incapacitated, or by court order, in which case the mother — the *wali*); their status is supported by a recorded document (certificate, court ruling). **MVP signature-collection method**: a handwritten signature on the printed enrollment form, then scanned, or a signature on a touchscreen at the front desk, attached to the file; acceptance of the school rules and the Law 09.08 disclosures is additionally confirmed in the app by the legal guardian when claiming their account. Advanced electronic signature (INT-SIG in `prd/cross-cutting/35-external-integrations.md`) replaces scanning at V1. The ministry's position is respected: a custodial parent may obtain the child's administrative school documents; in the event of a conflict between guardians, the school is the operational arbiter and the system flags contradictory requests (RG-16). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.4, RG-13, RG-14b, RG-16, `INV-09`, `INV-11`, prd/03 §3.2 (PRE-ENROLLED → ACTIVE conditions)) |
| Actors | Front office, director |

```gherkin
Feature: Guardian completeness before activation
  Scenario: Move to ACTIVE refused with no financial guardian
    Given a complete pre-enrollment whose only guardian is a legal guardian not designated as financial guardian
    When the staff member attempts to move the enrollment to ACTIVE state
    Then the system blocks the transition and requests that a financial guardian be designated
    And the transition is only possible once the "financial guardian" quality is recorded, held by the legal guardian or by a third party
```

### FR-INS-13 — Apply default rights and accept only a court-ordered restriction

| Attribute | Value |
|---|---|
| Description | By default, all legal guardians and the custodial guardian have access to the student's school information (RG-14, `INV-10`). Restricting a guardian's access is possible only under a court ruling recorded by the school, with a supporting document attached and traceability; no informal restriction is allowed. **Scope** (ARB-11): the restriction is recorded on the global relationship but takes effect only at schools that have attached the ruling; other schools where the child has an active enrollment are notified (`AccessRestrictionRecorded`) and record it in turn after verifying the document. Suspending or revoking a relationship also requires a supporting document. Conflicts between guardians (contradictory requests) are flagged to the school, which arbitrates; ZSchool does not rule on them (RG-16). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.4, RG-14, RG-16, `INV-10`, BES-GAR-06; ARB-11) |
| Actors | Director, front office |

```gherkin
Feature: Restricting a parent's access
  Scenario: Restriction only under a court ruling
    Given an ACTIVE enrollment with two active legal guardians
    When the director records a court ruling restricting the father's access, with a supporting document attached
    Then the father's rights are adjusted per the ruling
    And the change is logged and the file carries the attached document
    And an attempt to record it with no supporting document is refused

  Scenario: Scope of the restriction for a child enrolled at two schools (ARB-11)
    Given a restriction recorded by School A with the ruling attached
    And an active enrollment for the same child at School B
    When the restriction is recorded
    Then School B receives a notification inviting it to attach the ruling
    And the father's access at School B is restricted only once School B has recorded it
```

### 4.4 Enrollment, contract, and documents

### FR-INS-14 — Create the enrollment with its full academic context

| Attribute | Value |
|---|---|
| Description | The enrollment (`Enrollment` entity, `prd/03` §2.2) links the student, the school, and the school year, and carries: the section (education system), the cycle and level, the track and options where the level has them (high school), the class (assignment can happen after pre-enrollment), the arrangement (day student, boarder), and, at V2+, the transport and canteen options (`prd/modules/22-ancillary-services-transport-canteen-activities.md`). Creation is possible at the front desk in one pass (MVP, starting at PRE-ENROLLED), via import activation (FR-INS-27), via the re-enrollment campaign (FR-INS-20), or from an admission decision (V1). The enrollment carries an **effective date** (ARB-24c): attendance, thresholds, and exports count from this date. Assigning a class checks the class's **capacity** (FR-PED-02): exceeding it is only possible with the director's documented approval (ARB-24b). Before activation, the system records on the enrollment the acceptance of the school rules and the Law 09.08 disclosures (author, date, collection method; the `ConsentGrant` entity remains reserved for sharing consents). The system refuses to create a second ACTIVE enrollment for the same student-school year pair (RG-08, DEC-21, `INV-05`). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.3, §7.2, C-04, RG-08, DEC-21, `INV-05`, BES-SEC-01; ARB-24b, ARB-24c) |
| Actors | Front office, director |

```gherkin
Feature: Creating an enrollment (MVP)
  Scenario: Mid-year enrollment with an effective date
    Given a student arriving on January 12, 2027 into a 5AP class with a capacity of 30 already holding 29 students
    When the front office creates the enrollment with an effective date of 12/01/2027 and assigns it to this class
    Then the enrollment is created PRE-ENROLLED, and the class now has 30 students
    And the student's attendance counters start on 12/01/2027
  Scenario: Capacity overrun referred to the director
    Given a class with a capacity of 30, already full
    When the front office attempts to assign an additional student to it
    Then the assignment is blocked pending the director's documented approval, which is logged
```

### FR-INS-15 — Run the enrollment lifecycle (state machine)

| Attribute | Value |
|---|---|
| Description | The lifecycle follows the state machine in `prd/03-domain-data-model.md` §3, completed by ARB-03: at MVP, states PRE-ENROLLED, ACTIVE, COMPLETED, TRANSFERRED, WITHDRAWN and **CANCELLED** (an archived terminal state for cancelled CANDIDATE or PRE-ENROLLED enrollments, which keeps the campaign history, ARB-03b), plus the (import) → ACTIVE transition reserved for FR-INS-27; at V1, additional states CANDIDATE (admissions, FR-INS-01), SUSPENDED (a temporary administrative measure by the director, documented and dated, with a return to ACTIVE; a disciplinary temporary expulsion does not trigger this state, ARB-16), and EXPELLED (disciplinary council decision passed from `prd/modules/13-attendance-student-life-discipline.md`). **Exits from SUSPENDED**: SUSPENDED → TRANSFERRED, WITHDRAWN, EXPELLED, or COMPLETED under the same conditions as from ACTIVE (ARB-03a). **Year end**: every student present at closing moves to COMPLETED with their year-end decision (RG-09); TRANSFERRED and WITHDRAWN are reserved for mid-year departures; a departure for the following school year results in COMPLETED with no N+1 enrollment created at the originating school (ARB-03c); the "tracked" decision (choice of track) is not a departure (ARB-03d). **Reinstatement**: a new enrollment for the same (student, year) pair is allowed once the prior enrollment is TRANSFERRED, WITHDRAWN, or EXPELLED, with the reason "reinstatement" and a link to the prior enrollment (ARB-03e; INV-05 unchanged: only ACTIVE and SUSPENDED block the pair). Every transition records the date, reason, and author, and notifies guardians per the state (`EnrollmentStatusChanged` event). Rules upheld: an enrollment that has ever been ACTIVE is never deleted, it is closed with a reason and date (RG-10, DEC-06, `INV-06`); activation requires a complete file, an initial payment, and complete guardians (FR-INS-12), except for activation via import (FR-INS-27); closing an enrollment does not close the financial relationship, which survives until settled (RG-12, `INV-08`). |
| Priority | Must |
| Version | MVP (PRE-ENROLLED, ACTIVE, COMPLETED, TRANSFERRED, WITHDRAWN, CANCELLED, import activation); V1 for CANDIDATE, SUSPENDED, EXPELLED |
| Traceability | (→ §6.3, §7.2, C-04, RG-08, RG-09, RG-10, RG-12, DEC-06, DEC-21, `INV-05`, `INV-06`, `INV-08`, `prd/03` §3; ARB-03, ARB-16) |
| Actors | Front office, director, student life |

```gherkin
Feature: Closing an enrollment
  Scenario: Deletion forbidden after activation
    Given an enrollment that was once ACTIVE and then moved to WITHDRAWN with a reason and date
    When a staff member attempts to delete this enrollment
    Then the operation is refused
    And the enrollment remains closed, with its full history viewable

  Scenario: Temporary suspension with a return (V1)
    Given an ACTIVE enrollment
    When the director records a temporary suspension with a reason, a start date, and an end date
    Then the enrollment moves to SUSPENDED, and guardians are notified
    And on the end date, or on a resumption decision, the enrollment returns to ACTIVE

  Scenario: Year end for a suspended student (V1, ARB-03a)
    Given a SUSPENDED enrollment on the year's closing date
    When the director enters the student's year-end decision
    Then the enrollment moves directly from SUSPENDED to COMPLETED with its decision, without going back through ACTIVE

  Scenario: Cancelling a pre-enrollment (MVP, ARB-03b)
    Given a PRE-ENROLLED enrollment whose family withdraws
    When the front office cancels the enrollment with a reason
    Then the enrollment moves to the terminal CANCELLED state and remains viewable in the campaign history

  Scenario: Mid-year reinstatement (MVP, ARB-03e)
    Given a student whose 2026-2027 enrollment has been WITHDRAWN since November
    When the front office creates a new 2026-2027 enrollment with the reason "reinstatement"
    Then the creation is accepted, linked to the prior enrollment, and the single-active-enrollment rule is upheld
```

### FR-INS-16 — Generate, have signed, and archive the parent contract (Law 59.21)

| Attribute | Value |
|---|---|
| Description | On enrollment activation, the system generates the annual written school-parent contract required by Law 59.21 (published in the Official Gazette No. 7485 of 23/02/2026; the model's content is set by regulation, with implementing decrees still pending — H-14, see `prd/research/02-regulatory-data.md`): identification of the parties, list of services and their fees by category (tuition, insurance, meals, boarding, transport — fee disclosure, art. 49), payment schedule, mandatory clauses. The contract is presented in French and Arabic, signed by the legal guardian (or the adult student), countersigned by the financial guardian when distinct from the legal guardian (so the payment schedule is enforceable against the payer, ARB-20h), and by the school's representative. Signature method at MVP (wave 1, ARB-01): a handwritten signature on the printed contract, then scanned, or on a touchscreen, attached to the file, with acceptance confirmed in the app when claiming the account; advanced electronic signature with timestamp and verification code at V1, qualified signature via an accredited provider at V2 (DEC-30, `INT-SIG` family in `prd/cross-cutting/35-external-integrations.md`). The signed contract is archived in the enrollment file, a copy is given to guardians, and the document stays available to the AREF via the school's export. No fee change is possible mid-year on an active enrollment (`INV-40`); generating a contract mid-year for an already-active enrollment is refused on this ground. |
| Priority | Must |
| Version | MVP (wave 1 — generation, scanned signature, financial-guardian countersignature, archiving; ARB-01); V1 (advanced electronic signature) |
| Traceability | (→ §7.7 (parent contract), RG-13, RG-14b (signatory), DEC-10, DEC-30, H-14, `INV-40`, `prd/research/00-baseline-corrections.md` no. 2; ARB-01, ARB-20h) |
| Actors | Legal guardian, financial guardian, adult student, director, front office |

```gherkin
Feature: Law 59.21 parent contract
  Scenario: Front-desk signature and archiving (MVP)
    Given an enrollment moved to ACTIVE with a complete fee schedule by service category
    And a financial guardian (the grandfather) distinct from the legal guardian
    When the legal guardian and the grandfather sign the printed contract, scanned by the front office
    Then the signed contract is archived in the enrollment file with the date and the author of the upload
    And a copy is sent to the guardians and acceptance is confirmed in the app when claiming the account
    And billing of the payment schedule can start

  Scenario: Advanced electronic signature (V1)
    Given an ACTIVE enrollment with the contract generated
    When the legal guardian signs the contract electronically
    Then the signed contract is timestamped, archived, and verifiable by its code

  Scenario: Mid-year fee change refused
    Given an ACTIVE enrollment with a contract signed for 2026-2027
    When a staff member attempts to apply a new fee to this enrollment
    Then the operation is refused with the reason "mid-year increase prohibited"
    And the new fee only applies to an enrollment for a later school year
```

### FR-INS-17 — Immediately issue enrollment documents

| Attribute | Value |
|---|---|
| Description | Once enrollment entry is complete (at the front desk as online), the system immediately issues: the pre-enrollment or enrollment certificate, the receipt for the deposit or registration fee (produced by finance, `prd/modules/16-finance-billing-collections.md`), and the bilingual student record (French and Arabic, DEC-10). Documents are generated as PDFs with the school's letterhead, downloadable and sendable to guardians (primary channel: mobile, DEC-11). Numbering, stamp, signature, and the verification QR code belong to the documents module (`prd/modules/15-documents-certificates.md`, V1 for the QR code and self-service); at MVP, basic issuance is handled within this module (see OQ-02). |
| Priority | Must |
| Version | MVP (basic issuance; receipts numbered in a continuous sequence from MVP, FR-FIN-07 and FR-FIN-17 in `prd/modules/16-finance-billing-collections.md`, ARB-01); V1 (certificate numbering, stamp, QR via `prd/modules/15-documents-certificates.md`) |
| Traceability | (→ §7.2 (immediate issuance), DEC-10, BES-SEC-01, `prd/journeys/00-journey-map.md` OQ-02; ARB-01) |
| Actors | Front office, parent or legal guardian |

```gherkin
Feature: Immediate enrollment documents (MVP)
  Scenario: Issuance at the front desk in one pass
    Given an enrollment entered at the front desk with the deposit collected
    When the front office confirms the wizard's last step
    Then the bilingual pre-enrollment certificate, the receipt numbered in a continuous sequence, and the student record are generated as PDFs in under 3 seconds
    And they are sent to the legal guardian on their mobile channel and remain downloadable from the file
```

### FR-INS-18 — Show the arrears alert without ever blocking

| Attribute | Value |
|---|---|
| Description | On the student's file and on every enrollment screen, the system shows an arrears alert fed by finance (unpaid installments, the enrollment's balance and, where applicable, unsettled prior enrollments). This alert is informational: no state of the file blocks issuing the certificate of enrollment, the leaving certificate, report cards, or transcripts because of arrears (DEC-24, `INV-39`). The system allows a summary account statement to be attached to a departure file for the guardian. Conditioning access on payment applies only to non-mandatory services (transport, canteen, activities) and is owned by finance. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §7.7 (official documents and arrears), DEC-24, `INV-39`, BES-SEC-04) |
| Actors | Front office, director, accounting |

```gherkin
Feature: Arrears alert without blocking
  Scenario: Certificate issued despite arrears
    Given an ACTIVE enrollment carrying an unpaid installment of 850 MAD
    When the front office generates the certificate of enrollment
    Then the arrears alert is shown on the file, but issuance is never blocked
    And the account statement can be attached to the file given to the guardian
```

### FR-INS-19 — Record the Massar transfer reference

| Attribute | Value |
|---|---|
| Description | The enrollment (and the associated transfer request, `TransferRequest` entity in `prd/03`) carries a "Massar transfer reference" field, entered by the school when the ministerial transfer procedure was carried out outside ZSchool. The transfer procedure between ZSchool schools is owned by `prd/modules/18-transfers-mobility.md` (MVP); the Massar ministerial procedure remains carried out outside ZSchool and only its reference is entered here, from MVP (single owner of the rule: FR-TRA-08; FR-MAS-11 keeps its log at V1). The system checks the reference's format, keeps it in the transfer log, and exposes it to Massar exports. The field is optional and does not affect the enrollment's lifecycle. |
| Priority | Should |
| Version | MVP |
| Traceability | (→ §7.9, §7.12, `prd/03` §2.2 (`TransferRequest`), BES-DIR-03) |
| Actors | Front office, director |

### 4.5 Re-enrollment and year-end rollover

### FR-INS-20 — Run the re-enrollment campaign

| Attribute | Value |
|---|---|
| Description | The director opens a re-enrollment campaign for year N+1 (date window, open levels, deposit amount and due date, guaranteed-spot policy). The system generates, for each eligible student, a pre-filled form (identity, guardians, expected level, arrangement, options) that the legal guardian confirms from their account, correcting data as needed; they are informed that any identity correction will be notified to other schools (FR-INS-10). Confirmation creates the N+1 enrollment in PRE-ENROLLED state (a conversion, state machine in `prd/03`) and triggers the reservation deposit request (collection owned by `prd/modules/16-finance-billing-collections.md`, including via the Fatourati rail from V1, DEC-31); moving the N+1 enrollment to ACTIVE requires collecting the deposit (activation conditions, FR-INS-12). The system presents a campaign dashboard (confirmed, pending, declared departures, deposits collected); scheduled reminders to non-responders (channels and templates from `prd/modules/17-communication-notifications.md`, costs charged to the school) and reminder counters ship at V1. On confirmation, a student who has come of age is informed of their rights (RG-02, DEC-20, `StudentReachedMajority` event in `prd/03` §7). Refusing to re-enroll a student in good standing is prohibited by Law 59.21: the system alerts the director if a non-re-enrollment is recorded for a student with no arrears and no disciplinary decision (see OQ-06). |
| Priority | Must |
| Version | MVP (wave 2 — year-end close, JAL-07: pre-filled form, confirmation, deposit, N+1 conversion to PRE-ENROLLED; ARB-01); V1 (scheduled reminders, advanced dashboard) |
| Traceability | (→ §7.2 (re-enrollment campaign), §2.8 (spring deposit), RG-02, DEC-20, DEC-31, DEC-36, H-14, BES-SEC-07, BES-DIR-05; FR-INS-12; ARB-01) |
| Actors | Director, front office, legal guardian, adult student |

```gherkin
Feature: Re-enrollment campaign
  Scenario: Converting a confirmed re-enrollment
    Given a re-enrollment campaign open for 2027-2028 with a configured deposit
    And a student Adam in the senior preschool group at School B, eligible for CP
    When the legal guardian confirms re-enrollment from their account
    Then a 2027-2028 enrollment is created in PRE-ENROLLED state at level CP, pre-filled (guardians, arrangement, options)
    And the reservation deposit is requested from the guardian
    And the N+1 payment schedule and the sibling discount are prepared by finance
    And the campaign dashboard moves the file to "confirmed"

  Scenario: Reminding non-responders (V1)
    Given a campaign open for three weeks with files still without a response
    When the scheduled reminder date is reached
    Then the guardians concerned receive a reminder on their configured channels
    And each send is logged with its channel and cost in the campaign tracker

  Scenario: Moving to ACTIVE once the deposit is collected
    Given a confirmed re-enrollment in PRE-ENROLLED state with the deposit requested
    When the deposit collection is recorded by finance (`PaymentReceived` event)
    Then the N+1 enrollment's activation conditions are met (FR-INS-12)
    And the enrollment can move to ACTIVE state
```

### FR-INS-21 — Execute the year-end rollover (bulk decisions, N+1 creation)

| Attribute | Value |
|---|---|
| Description | The rollover closes year N and produces year N+1 with no re-entry: (1) year-end decisions (promoted to the next level, repeating, graduated, tracked into a program, undetermined — RG-09, `YearDecision` entity) are entered individually or in bulk via filters (level, class), after (or independently, depending on the school) the class councils in `prd/modules/14-assessments-grades-report-cards.md`; for certifying levels, the decision stays "undetermined" until results are imported (FR-MAS-10, ARB-17i); (2) execution moves **all** ACTIVE and SUSPENDED enrollments present at closing to COMPLETED with their decision (ARB-03a, ARB-03c) — including students leaving the school the following school year, who are COMPLETED with no N+1 enrollment created (the TRANSFERRED and WITHDRAWN states are reserved for mid-year departures, FR-INS-24) — ; "tracked" is a track choice and the student stays at the school (ARB-03d); (3) it bulk-creates N+1 enrollments **in PRE-ENROLLED state only** (next level for the promoted, same level for those repeating, the chosen track for those tracked), with activation still subject to the conditions in FR-INS-12; any student who already has an N+1 enrollment in a non-terminal state (via the re-enrollment campaign, FR-INS-20) is skipped with no duplicate created (ARB-03f); any creation violating the single-active-enrollment-per-year rule is refused (RG-08, `INV-05`); (4) the bulk operation is logged, can be simulated before execution, and can be re-run after an interruption without double-processing. The N+1 structure is cloned beforehand from year N without the students (RG-25, `INV-42`, FR-PED-07 in `prd/modules/12-academic-structure-timetables.md`, MVP wave 2). Undecided enrollments remain explicitly flagged after rollover and can be updated during the grace period (INV-25). |
| Priority | Must |
| Version | MVP (wave 2 — year-end close, JAL-07; ARB-01) |
| Traceability | (→ §7.2 (rollover), RG-08, RG-09, DEC-06, DEC-21, `INV-05`, `INV-25`, `INV-42`, BES-DIR-05; ARB-01, ARB-03, ARB-17i) |
| Actors | Director, front office |

```gherkin
Feature: Bulk year-end rollover (MVP wave 2)
  Scenario: Decisions, N+1 enrollment creation, and year-end departures
    Given school year 2026-2027 with 640 ACTIVE enrollments, of which 600 promoted, 30 repeating, and 10 students leaving the school for the following school year
    And 120 of the 600 promoted students already PRE-ENROLLED for 2027-2028 via the re-enrollment campaign
    And the 2027-2028 structure cloned from 2026-2027
    When the director executes the rollover to 2027-2028
    Then the 640 enrollments move to COMPLETED with their year-end decision, including the 10 departing students
    And 510 2027-2028 enrollments are created in PRE-ENROLLED state (next level for the promoted, same level for those repeating)
    And no second 2027-2028 enrollment is created for the 120 already-pre-enrolled students
    And the 10 departing students have no 2027-2028 enrollment, and their year-end decision appears in their transfer profile
    And the bulk operation is logged and viewable

  Scenario: Interrupted execution and resumption with no duplicates
    Given a rollover interrupted after processing 4 of 20 classes
    When the director resumes execution
    Then only the remaining classes are processed
    And no N+1 enrollment is created twice
```

### FR-INS-22 — Log mid-year class changes

| Attribute | Value |
|---|---|
| Description | Sole owner of this rule (FR-PED-10 in `prd/modules/12-academic-structure-timetables.md` cross-references it for access from the structure browser). A student's mid-year class change (rebalancing, track change) modifies the enrollment without creating a new enrollment or a state transition (RG-11): each change produces an append-only entry in `StudentClassHistory` (originating class, target class, date, reason, author — `INV-07`). Guardians, the homeroom teacher, and the teachers involved (old and new) are notified (`ClassChanged` event in `prd/03` §7); grades and attendance already produced remain attached to the enrollment, with the current period's rank computed in the current class at closing (ARB-17d). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.3, RG-11, `INV-07`, `prd/03` §7 (`ClassChanged`); ARB-17d) |
| Actors | Director, academic leadership, front office |

```gherkin
Feature: Mid-year class change (MVP)
  Scenario: Rebalancing in October
    Given a student in 2AC-3 with two math grades
    When academic leadership assigns them to 2AC-1 on October 15 with the reason "rebalancing"
    Then a history entry is added (2AC-3, 2AC-1, 15/10, reason, author) and the enrollment stays unchanged
    And their two grades remain attached to their enrollment and count toward their average
    And the parents, homeroom teacher, and teachers of both classes are notified
```

### FR-INS-23 — Bulk-assign students to N+1 classes

| Attribute | Value |
|---|---|
| Description | For year N+1, academic leadership assigns pre-enrolled students to the classes of their level, individually or in bulk: per-class lists with headcounts and capacities, batch moves, indicative rebalancing criteria (headcount, language option, repeaters). Every assignment updates the enrollment (class field) with a history entry (FR-INS-22) and a notification. The assignment remains editable until the year opens; after classes begin, it follows the class-change process. Classes, levels, and capacities are owned by the academic structure (`prd/modules/12-academic-structure-timetables.md`). |
| Priority | Must |
| Version | MVP (wave 2 — year-end close, JAL-07; ARB-01) |
| Traceability | (→ §7.2 (rollover: class assignment), RG-11, `INV-07`; ARB-01, ARB-24b) |
| Actors | Academic leadership, director, front office |

```gherkin
Feature: N+1 class assignment (MVP wave 2)
  Scenario: Bulk assignment with capacity control
    Given 90 students pre-enrolled in 1AC for 2027-2028 and three 1AC classes with a capacity of 30 each
    When academic leadership distributes students in a batch
    Then each enrollment carries its class and a history entry
    And any class exceeding 30 students is flagged and blocked pending the director's documented approval
```

### FR-INS-24 — Handle departures during the rollover and on an ongoing basis

| Attribute | Value |
|---|---|
| Description | The system distinguishes two families of departures (ARB-03c). **Mid-year departures**: individual closing of an ACTIVE (or SUSPENDED) enrollment to TRANSFERRED (known destination, procedure in `prd/modules/18-transfers-mobility.md`) or WITHDRAWN (departure with no destination), always with a reason and date (RG-10, `INV-06`). **Year-end departures**: non-re-enrollees (no confirmation by campaign close, no N+1 enrollment) and departures declared for the following school year are closed COMPLETED with their year-end decision by the rollover (FR-INS-21), with no N+1 enrollment created at the originating school; any destination is carried by a transfer request with an effective date at the start of the next school year. The system lists year-end departures in bulk to prepare leaving files. For each departure, the leaving file is prepared: leaving certificate, account statement (RG-12, non-blocking arrears alert, FR-INS-18), a bilingual leaving-file PDF for a non-ZSchool school (DEC-32). Per RG-12, any outstanding claim remains attached to the originating school: ZSchool does not transfer the claim to the receiving school, in any version (D2 arbitration; the account statement at departure is owned by FR-FIN-24, MVP wave 1, in `prd/modules/16-finance-billing-collections.md`); an actual balance carry-over between sites of the same group is a V2+ option (`prd/modules/18-transfers-mobility.md`). The transfer procedure proper (consents, shared scope) is owned by `prd/modules/18-transfers-mobility.md`; this module handles only state closure and campaign counters. |
| Priority | Must |
| Version | MVP (individual mid-year closures via FR-INS-15; list and leaving files for year-end departures at wave 2 — ARB-01) |
| Traceability | (→ §7.2 (managing departures), RG-09, RG-10, RG-12, DEC-24, DEC-32, `INV-06`, `INV-08`; FR-FIN-24 in `prd/modules/16-finance-billing-collections.md`; ARB-01, ARB-03c) |
| Actors | Director, front office |

```gherkin
Feature: Departures (MVP)
  Scenario: Mid-year departure with no destination
    Given an ACTIVE enrollment whose family declares a departure on March 15 with no known destination
    When the front office closes the enrollment WITHDRAWN with a reason and date
    Then the leaving file is prepared (leaving certificate, account statement to the financial guardian)
    And the financial account remains open until settled
  Scenario: Departure for the following school year (wave 2)
    Given a student promoted at year end whose family declares they will not return
    When the rollover is executed
    Then the enrollment moves to COMPLETED with the decision "promoted" and no N+1 enrollment is created
    And the student appears in the year-end departures list with their leaving file prepared
```

### FR-INS-25 — Declare a child from the parent account and link it to the enrollment

| Attribute | Value |
|---|---|
| Description | Identity-creation path 2 from the baseline (§6.2): a parent declares, from their account, a child not yet known to the platform (civil status in dual script, date of birth, Massar code if known, declared relationship type and qualities). A "provisional" student profile is created, linked to the declared parent-student relationship, with no enrollment or academic data whatsoever (DEC-18). When enrolling at the front desk or online, the school finds this profile by strong matching (Massar code) or weak matching (first name, last name, date of birth, parent's mobile number — FR-INS-06, FR-INS-07) and links it to the enrollment by confirming the declared qualities (FR-INS-11, FR-INS-12); never a duplicate creation. A profile declared and never linked after 24 months is anonymized (DEC-22). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.2 (path 2), RG-05, RG-12b, DEC-03, DEC-18, DEC-22; ARB-09; BES-PAR-01) |
| Actors | Parent, front office |

```gherkin
Feature: A parent declaring a child (MVP)
  Scenario: Declaration then linking to the enrollment
    Given Ahmed, an account holder, who declares his son Adam (born 03/05/2021, no Massar code) from his account
    When School B enters Adam's enrollment with Ahmed's mobile number as guardian
    Then the system offers the profile Ahmed declared via weak matching
    And after the front office confirms, the enrollment is linked to this profile and Ahmed keeps his declared qualities, with no duplicate created
```

### FR-INS-26 — Record the declared prior history of a student coming from a non-ZSchool school

| Attribute | Value |
|---|---|
| Description | When enrolling a student previously schooled at an institution not on the platform (the dominant case at launch, ARB-22), the front office records the declared prior history: previous school (name, city, free text or a directory choice), school years, levels, and year-end decisions, the Massar transfer reference (FR-INS-19), supporting documents (paper leaving certificate, most recent report card or transcript). These elements are carried on the student's identity as "schools attended," marked **"declared, unverified"** as long as no document is attached, **"declared, document attached"** thereafter; they feed the default transfer profile (RG-31), ESISE statistics and, eventually, the school passport, without ever being presented as verified by the platform. No detailed grades or disciplinary data are entered through this channel (RG-29). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.2, §7.9, RG-29, RG-31, DEC-33 (analogy "unverified"); ARB-22; FR-TRA-03 in `prd/modules/18-transfers-mobility.md`) |
| Actors | Front office, legal guardian |

```gherkin
Feature: Declared prior history (MVP)
  Scenario: Arrival from a non-ZSchool school with a paper certificate
    Given a student enrolled in 3AC whose previous school is not on the platform
    When the front office records the previous school, the years 2024-2025 (1AC, promoted) and 2025-2026 (2AC, promoted), and attaches the scanned leaving certificate
    Then the prior history appears on the student's identity marked "declared, document attached"
    And it appears in the default transfer profile and in ESISE data, with no "verified" mention
```

### FR-INS-27 — Activate an enrollment via import (data catch-up)

| Attribute | Value |
|---|---|
| Description | A dedicated (import) → ACTIVE transition in the state machine (ARB-02), reserved for bulk import (FR-ADM-06 in `prd/modules/10-administration-onboarding-subscription.md`): when an imported student carries a reached effective date, an existing class, and at least one legal guardian and one financial guardian (INV-09), their enrollment is created directly ACTIVE with the logged reason "import activation — data catch-up," with no requirement for an initial payment or prior acceptance of the school rules and Law 09.08 disclosures. These acceptances are collected **retroactively** when the legal guardian claims the account (claim, FR-INS-08) and re-prompted at 30 and 60 days; the parent contract (FR-INS-16) is generated from the imported payment schedule and signed per the MVP method. Students imported with no financial guardian or no class are created PRE-ENROLLED and listed for completion. Any import activation is counted in the usage statement from its effective date. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §6.3, §7.1 (import), RG-08, RG-13, `INV-05`, `INV-09`; ARB-02; FR-ADM-06) |
| Actors | Director, front office, ZSchool support |

```gherkin
Feature: Enrollment activation via import (MVP)
  Scenario: Catch-up for a school activated mid-year
    Given an import file of 350 students with effective date 07/09/2026, class, legal guardian, and financial guardian filled in for 340 of them
    When the director commits the import
    Then 340 enrollments are created ACTIVE with the reason "import activation — data catch-up"
    And 10 enrollments are created PRE-ENROLLED and listed for completion
    And each legal guardian receives their claim code and confirms acceptances when claiming the account
    And no second ACTIVE enrollment exists for the same student and the same year
```

---

## 5. Morocco-Specific Considerations

| Specific | Translation into the module |
|---|---|
| Law 59.21 (private education, Official Gazette No. 7485 of 23/02/2026; repeals Laws 04.00, 05.00 and 06.00; 35 implementing decrees expected) | Mandatory annual written contract generated, signed, and archived (FR-INS-16); fee disclosure by service category (art. 49) carried in the contract's schedule; ban on mid-year increases (`INV-40`); compliance alert on refusing to re-enroll a student in good standing (FR-INS-20, OQ-06). Source: `prd/research/02-regulatory-data.md` §1, `prd/research/00-baseline-corrections.md` no. 2. |
| Massar code (one letter + nine digits, preferred but not mandatory matching key) | Format check, platform-wide uniqueness, strong and weak matching, anti-enumeration protection (FR-INS-06, FR-INS-07); Massar transfer reference logged (FR-INS-19). |
| Family Code (Moudawana, Code 70-03 in force) | The father is legal guardian by operation of law; the "legal guardian" and "custodial guardian" qualities are recorded distinctly with supporting documents; required signatory for enrollment and admission (RG-14b, FR-INS-11, FR-INS-12). The "December 2024 reform" is a report submitted to the King on 23/12/2024, neither voted nor enacted as of 12/08/2026: the qualities' configuration must remain flexible without a schema overhaul. Source: `prd/research/02-regulatory-data.md` §5, `prd/research/00-baseline-corrections.md` no. 5. |
| Bilingualism and dual script | Civil status required in Arabic and Latin script at entry (DEC-10); bilingual enrollment documents and contract with an RTL interface (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`). |
| Spring re-enrollment campaign with a deposit (market practice, §2.8) | Tooled campaign with pre-filled forms, deposit, reminders, and conversion (FR-INS-20); annual re-enrollment fees and initial registration fees generally non-refundable (configurable schedule, owned by finance). |
| Start-of-year seasonality (classes mandatory from early September; ministry calendar published every year) | Configurable campaign windows (spring re-enrollment, admissions through September); rollover in June; no heavy maintenance during peaks (see §9). |
| Data protection (Law 09.08) | Disclosures and acceptances collected at enrollment and logged on the enrollment (`ConsentGrant` remains reserved for sharing consents); guardians' CNIE numbers are not collected at MVP (field disabled until F112 authorization, ARB-25a); the school is the data controller, ZSchool the processor (formalities detailed in `prd/cross-cutting/36-legal-compliance-data-protection.md`). |

---

## 6. Data and Events

### 6.1 Entities used (reference: `prd/03-domain-data-model.md` §2)

| Entity | Usage in this module |
|---|---|
| `Person`, `User`, `StudentProfile` (provisional, linked statuses), `ParentProfile` | Identity of the student and guardians; Massar code; individual accounts |
| `ParentStudentRelationship` | Relationship type, cumulative qualities, rights, supporting documents, context attributes |
| `Enrollment` | Application (CANDIDATE) and enrollment; level, track, section, class, arrangement, options, status (including CANCELLED, ARB-03b), effective date (ARB-24c), entry reason (front desk, campaign, import activation, reinstatement), dates, financial guardian, acceptances (school rules, Law 09.08 disclosures: author, date, collection method), registry identity snapshot (INV-44), Massar transfer reference |
| `StudentClassHistory` | Class-change history (append-only) |
| `YearDecision` | Year-end decision carried by the COMPLETED enrollment |
| `StudentDocument` | Application-file and student-file documents, carrying the tenant key of whoever uploaded them (ARB-13) |
| `StudentProfile` — declared schools attended | Prior history from outside ZSchool (FR-INS-26), marked "declared, unverified" or "declared, document attached" |
| `User` | Login identifier distinct from contact identifiers (INV-45); a household's shared contact (ARB-07) |
| `School`, `AcademicYear`, `Section`, `Cycle`, `Level`, `Track`, `Class`, `Group` | Enrollment's academic context (managed by `prd/modules/12-academic-structure-timetables.md`) |
| `TransferRequest`, `ConsentGrant` | Massar transfer reference; sharing consents (enrollment acceptances are carried by `Enrollment`) |
| `MergeOperation`, `AuditLog` | Audited merge; logging of decisions, transitions, and sensitive access |
| `FeeSchedule`, `Invoice`, `Installment`, `Payment`, `Dunning`, `FinancialAccount` | Deposit, payment schedule, arrears alert (owned by `prd/modules/16-finance-billing-collections.md`) |
| `Certificate` | Enrollment documents (owned by `prd/modules/15-documents-certificates.md`) |

No new entity is created by this module; the CANCELLED state, the import-activation transition, the effective date, and the entry reason are to be carried over into `prd/03-domain-data-model.md` (ARB-02, ARB-03). Admission-specific attributes (test sessions, waitlist rank, application origin) and campaign support are to be specified in the model at review time (OQ-05).

### 6.2 Domain events (reference: `prd/03-domain-data-model.md` §7)

| Event | Module's role | Effects |
|---|---|---|
| `EnrollmentStatusChanged` | Produced | Director, guardians (depending on state), dashboards; delivered via `prd/modules/17-communication-notifications.md` |
| `ProbableDuplicateDetected` | Produced | School involved and the authorized role (alert without linking) |
| `IdentityClaimed` | Produced | The school that created the provisional profile |
| `IdentityCorrected` | Produced | Other schools involved and guardians |
| `MergeCompleted` | Produced | Schools involved, legal guardian, audit |
| `StudentReachedMajority` | Produced (platform-triggered) | Informs the student of their rights; the school (MVP, ARB-10) |
| `AccessRestrictionRecorded` | Produced | Guardian concerned, other schools with an active enrollment (which record the decision in turn, ARB-11), director, log |
| `ConsentGranted` / `ConsentRevoked` | Produced | Audit log, receiving school |
| `PaymentReceived` | Consumed | Confirming the reservation (deposit), meeting activation conditions |
| Invitation, admission-decision, and campaign-reminder notifications | Issued via `Notification` / `DeliveryLog` | Multi-channel routing and costs owned by `prd/modules/17-communication-notifications.md` (DEC-12, DEC-36) |

---

## 7. Key Screens

All screens exist in French and Arabic (full RTL), mobile-first (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`). Descriptions are textual; no graphic mockup is produced in this document.

### ECR-INS-01 — Online application portal (public, mobile)

Header area with the school's name, logo, and a French-Arabic switch. Short-step form: student (civil status in dual script, date and place of birth), requested level and school year, guardian (mandatory mobile number, code received by SMS to continue), documents to upload (list per level, expected/received states). Summary before submission, tracking number shown and sent by SMS. File states visible to the parent: submitted, under review, decision issued, missing documents. Offline behavior: a draft is kept locally, sent once network access returns.

### ECR-INS-02 — Application file queue (web, front office and director)

Filterable list (year, level, state, completeness, origin) with status badges (CANDIDATE, waitlisted, pre-enrolled, refused) and a document-completeness indicator. Quick actions: open, record a document, schedule a test, record a decision. Summary counters at the top (received, in progress, accepted, refused, waitlisted). Bulk printing of submission receipts.

### ECR-INS-03 — Application file (web and mobile)

Tabs: identity, documents (with states and re-upload), tests (sessions, results), decision (reason, date, signatory), history. A permanent warning banner for a probable duplicate (linking to the matching panel ECR-INS-05). The decision is blocked while a mandatory document is missing; the refusal reason is mandatory. An action log for the file at the bottom.

### ECR-INS-04 — Front-desk enrollment wizard (one pass)

A step-by-step wizard: (1) student identity with search and matching (offer to link or create); (2) guardians (father, mother, others; checkable qualities; individual accounts; supporting documents); (3) academics (section, cycle, level, track, optional class, arrangement); (4) fees (deposit and registration fee, cross-reference to the cash desk); (5) acceptances (school rules, Law 09.08 disclosures) and the legal tutor's signature — at MVP, a touchscreen signature or a scanned printed form, confirmed in the app when claiming the account; advanced electronic signature at V1 — with the financial guardian's countersignature when distinct; (5 bis) declared prior history if the student comes from a non-ZSchool school (FR-INS-26); (6) immediate documents (certificate, numbered receipt, bilingual student record) generated and sent. Progress bar, resumption after an interruption, blocking checks on minimal qualities (FR-INS-12) and class capacity (ARB-24b) before step 5.

### ECR-INS-05 — Identity-matching panel

Side-by-side comparison of the entered profile and candidate profiles (strong via Massar code, weak via first name, last name, date of birth, phone number). Differences highlighted; "link" or "create a new identity" actions with confirmation and reason logged. A queue of unresolved duplicate alerts for the authorized role; access to the audited merge (FR-INS-09).

### ECR-INS-06 — Enrollment record (within the student file)

Header: bilingual identity, Massar code, photo, alerts (non-blocking arrears, duplicate, court-ordered restrictions). State-machine block: current state, effective date, entry reason (front desk, campaign, import activation, reinstatement), dates, reasons, author, available transitions per state (activation, cancelling a pre-enrollment, suspension with a return, TRANSFERRED/WITHDRAWN mid-year closures, COMPLETED with a decision at year end, exits from SUSPENDED — ARB-03). Academic block: section, cycle, level, track, class (with change history), arrangement, options. Guardians block: qualities, rights, supporting documents. Documents block: certificate, contract, receipt. Transfer block: Massar reference, link to the transfer file. An audit log viewable per permissions (`prd/cross-cutting/30-roles-permissions-matrix.md`).

### ECR-INS-07 — Guardians screen

List of the student's guardians with, for each: relationship type, checkable qualities (legal guardian, custodial guardian, financial guardian, emergency contact, pickup authorization), account status (invited, active), attached supporting documents, communication preferences. Rules shown on screen: at least one active legal guardian and one financial guardian to activate; access restriction only under a court ruling with an attached document (dedicated button, reason, and traceability). Flagging contradictory requests to the school.

### ECR-INS-08 — Parent contract

Bilingual read view of the contract with the fee schedule by service category, payment schedule, and clauses; contract state (awaiting signature, signed, archived, replaced). Electronic signature by the legal guardian then the school's representative, timestamp shown, verification code. Download and send a copy to guardians. Version history in case of regeneration before signature; explicit refusal of any mid-year fee change.

### ECR-INS-09 — Re-enrollment campaign dashboard

Per-level counters: eligible, confirmed, pending, reminded, declared departures; deposits collected; conversion rate. List of non-responders with individual or batch reminders (channel choice, bilingual template preview). Reminder log (dates, channels, costs). Campaign opening and closing by the director, deposit and due-date configuration.

### ECR-INS-10 — Rollover console (web)

Selecting the source year and target year (structure cloned beforehand, control shown). Decisions screen: filters by level and class, bulk entry or import of decisions, share of decisions made, list of "undetermined." Simulation before execution: projected N+1 headcounts by level, detected conflicts (enrollments already active at N+1). Logged execution, progress bar, resumption after interruption. Then class assignment: per-class lists with headcounts and capacities, batch moves, automatic history entries. Finally the year-end departures screen: non-re-enrollees and declared departures, all COMPLETED with a decision and no N+1 enrollment (ARB-03c), bulk generation of leaving files; TRANSFERRED/WITHDRAWN closures remain reserved for mid-year departures from the enrollment record.

### ECR-INS-11 — A parent declaring a child (mobile)

From the parent account: a "Declare a Child" button; a short form (civil status in dual script, date of birth, optional Massar code, relationship type and qualities); a list of declared children with status "declared, unlinked" or "linked to School X"; no academic data as long as no enrollment exists (FR-INS-25). Bilingual FR/AR.

### ECR-INS-12 — Declared prior history (front desk)

An enrollment-wizard tab: previous school (directory search or free text with city), a table of prior years (year, level, decision), Massar transfer reference, document upload (leaving certificate, most recent report card); badge "declared, unverified" or "declared, document attached" (FR-INS-26).

---

## 8. Integrations

Integrations are specified in detail in `prd/cross-cutting/35-external-integrations.md`; this chapter cites only the module's touchpoints.

| Family | Usage in this module |
|---|---|
| `INT-MAS` (Massar) | Massar-code format check; exports of student and enrollment lists; Massar transfer reference logged. Details and files: `prd/modules/21-massar-regulatory-exports.md` (no Massar API, H-04 confirmed) |
| `INT-SIG` (electronic signature) | Advanced signature and timestamp for the parent contract and enrollment documents at V1; qualified signature via a DGSSI-accredited provider at V2 (DEC-30) |
| `INT-SMS`, `INT-WAP`, `INT-EML` | Invitations and claim codes (SMS), admission decisions, campaign reminders. MVP: in-app and SMS, with "utility" WhatsApp limited to attendance notifications under opt-in (minimal templates); V1: generalization, push as the first channel, expanded WhatsApp, SMS fallback (DEC-12, DEC-36); routing and costs owned by `prd/modules/17-communication-notifications.md` |
| `INT-FAT` (Fatourati) | Paying the re-enrollment deposit via Fatourati channels from V1, with the school remaining the creditor (DEC-31); owned by `prd/modules/16-finance-billing-collections.md` |

---

## 9. Module-Specific Non-Functional Requirements

General requirements are owned by `prd/cross-cutting/32-non-functional-requirements.md`; this chapter adds module-specific constraints.

| Domain | Module-specific requirement |
|---|---|
| Performance (NFR-PERF) | Common pages under 2s on 4G at the front desk and on mobile; enrollment documents generated in under 3s; a 2,000-student school's rollover executed as a logged, resumable batch process, with no degradation of other usage |
| Peak resilience (NFR-RES) | Absorbing start-of-year peaks (simultaneous online-application sessions, front-desk entries, invitation sends) at the target sizing (500 schools, 500,000 students) |
| Availability (NFR-DISP) | 99.5% target; no heavy maintenance or bulk operations during start-of-year and exam periods; rollover and campaigns schedulable outside opening hours |
| Languages (NFR-I18N) | FR and AR with full RTL, mandatory dual-script civil status, bilingual documents and contract |
| Mobile (NFR-MOB) | Online application, re-enrollment confirmation, and contract signature usable on a smartphone (PWA at MVP, native apps at V2), fault-tolerant with draft resumption |
| Security (NFR-INT, `prd/cross-cutting/31-security-privacy.md`) | Protection against enumeration of Massar codes and invitation codes (rate limiting, revocation); reinforced encryption of sensitive documents (court rulings) |
| Auditability (RG-38, `INV-33`) | MVP: immutable entry history (D4, ARB-25j) (decisions, state transitions, identity corrections logged at the record level, with author, before/after values, reason); V1: immutable, exportable audit log, including exporting the log for the AREF (arbitration recorded in OQ-08) |

---

## 10. Success Metrics

Consolidated indicators (definitions, targets, dashboards) are owned by `prd/cross-cutting/38-kpi-success-metrics.md`. This module feeds the following candidate indicators, drawn from its data:

| Candidate indicator | Working definition |
|---|---|
| Application conversion rate | Share of CANDIDATE files that become ACTIVE enrollments during the campaign |
| File processing time | Median time between submission and admission decision |
| Front-desk enrollment time | Time to enter a complete enrollment in one pass (usage target: a few minutes) |
| Guardian activation rate | Share of students whose guardians have claimed their account within 30 days |
| Re-enrollment (retention) rate | N+1 enrollments created relative to year N's COMPLETED "promoted" enrollments |
| Deposits collected before end of June | Share of confirmed re-enrollments whose deposit is collected by the campaign due date |
| Consolidated N+1 headcounts | Date by which the director has reliable per-level and per-class headcounts for the following year |
| Zero re-entry | Share of pre-filled fields kept unchanged between year N's enrollment and the N+1 re-enrollment |

---

## 11. Open Questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Should there be an archived CANCELLED terminal state for cancelled applications and pre-enrollments (instead of a logical deletion)? | **Resolved — ARB-03b**: an archived terminal CANCELLED state (FR-INS-15), keeping the campaign history; the corresponding baseline update is grouped under ESC-03. |
| OQ-02 | Documentary scope of the MVP for enrollment documents. | **Resolved — ARB-01**: basic issuance at MVP via INS/FIN, with receipts numbered in a continuous sequence from MVP (FR-FIN-07, FR-FIN-17) and bulk certificates of enrollment for start-of-year insurance at wave 2 (FR-DOC-15); certificate numbering, stamp, QR code, and self-service at V1 (FR-INS-17). |
| OQ-03 | Should the Law 59.21 parent contract be moved forward to MVP? | **Resolved — ARB-01, ARB-20h**: the contract is at MVP (wave 1) with a scanned signature and the financial guardian's countersignature (FR-INS-16); advanced electronic signature at V1 (DEC-30). The regulatory model's exact content remains tracked under H-14. |
| OQ-04 | Waitlist and deposit rules. | Retention period for a pre-enrolled spot, deposit refund policy (or not) on withdrawal, waitlist priorities (siblings, staff): market practices not fixed by the baseline, to be configured per school with default values to be confirmed with the pilots. |
| OQ-05 | Model support for admissions (tests, waitlist, origin). | `prd/03-domain-data-model.md` does not carry a dedicated entity for test sessions, waitlist rank, or application origin; to be specified at review (attributes of the CANDIDATE enrollment or associated entities) without creating floating academic data (DEC-18). |
| OQ-06 | "Refusal to re-enroll a student in good standing" compliance alert (Law 59.21). | Partially resolved — **ARB-20d**: re-enrollment is never conditioned on payment (CNF-14 is authoritative, FR-DOC-09 aligned); a blocking warning at documented confirmation when the student has no arrears and no disciplinary decision. Still open: the exact article and the contract's content, to be confirmed against the full text (H-14). |
| OQ-07 | Baseline update following research corrections. | **Escalated — ESC-03** (`prd/cross-cutting/42-review-arbitrations.md`): Official Gazette No. 7485 of 23/02/2026 for Law 59.21, an unvoted report for the Family Code, a completed state machine (CANCELLED, exits from SUSPENDED, import activation); this chapter uses the up-to-date data. |
| OQ-08 | Logging: MVP scope. | **Resolved — ARB-25j (D4)**: at MVP, immutable, record-level history of entries (per FR-INS-10); the sensitive-access log and audit-log export (RG-38, `INV-33`), including for the AREF, at V1 (§12). |
| OQ-09 | Version of the adult-student mechanism. | **Resolved — ARB-10**: INV-35 (RG-02, DEC-20) is MVP; informing the adult student at each re-enrollment (FR-INS-20) and the `StudentReachedMajority` event are MVP. |

---

## 12. Traceability

| Baseline ID | Element | Coverage in this chapter |
|---|---|---|
| §6.2 | Student identity, creation and matching (G-01), path 2 (parent declaration) | FR-INS-06 to FR-INS-10, FR-INS-25, FR-INS-26; §6.1 and §6.2 (entities) |
| §6.3 | Enrollment lifecycle (C-04) | FR-INS-14, FR-INS-15, FR-INS-21, FR-INS-22, FR-INS-24, FR-INS-27; ECR-INS-06, ECR-INS-10 |
| §6.4 | Guardians and qualities | FR-INS-11 to FR-INS-13; ECR-INS-07 |
| §7.2 | Admissions, enrollment, re-enrollment (G-07) | FR-INS-01 to FR-INS-05, FR-INS-14 to FR-INS-17, FR-INS-20 to FR-INS-24 |
| §7.7 | Parent contract, documents, and arrears | FR-INS-16, FR-INS-18 |
| §7.9 | Massar transfer reference | FR-INS-19, FR-INS-24 |
| §9 | Anti-enumeration protection | FR-INS-06, FR-INS-08; §9 (security) |
| §12 | MVP / V1 / V2+ scope | Version column of each requirement; §1.1 |
| RG-04 | Massar-code uniqueness | FR-INS-06 |
| RG-05 | Strong and weak matching | FR-INS-06, FR-INS-07 |
| RG-06 | Audited merge | FR-INS-09 |
| RG-07 | Identity correction logged and notified | FR-INS-10 |
| RG-08 | A single active enrollment per year | FR-INS-14, FR-INS-15, FR-INS-21 |
| RG-09 | Year-end decision | FR-INS-15, FR-INS-21, FR-INS-24 |
| RG-10 | Closing, never deleted after ACTIVE | FR-INS-05, FR-INS-15, FR-INS-24 |
| RG-11 | Class-change history | FR-INS-22, FR-INS-23 |
| RG-12 | Balance after departure, surviving financial relationship | FR-INS-18, FR-INS-24; the claim remains with the originating school, never transferred, in any version (D2; account statement FR-FIN-24, MVP, in `prd/modules/16-finance-billing-collections.md`) |
| RG-12b | Multiple guardians, individual accounts | FR-INS-08, FR-INS-11 |
| RG-13 | At least one legal guardian and one financial guardian | FR-INS-12 |
| RG-14 | Default rights, court-ordered restriction | FR-INS-13; FR-INS-02 (documents, supporting evidence) |
| RG-14b | Distinct legal tutor and custodial guardian, required signatory | FR-INS-11, FR-INS-12, FR-INS-16 |
| RG-15 | Per-school context attributes | FR-INS-11 |
| RG-16 | Guardian conflicts arbitrated by the school | FR-INS-12, FR-INS-13 |
| DEC-04 | Massar code as matching key, not mandatory | FR-INS-06 |
| DEC-06 | State machine, no deletion after ACTIVE | FR-INS-15 |
| DEC-10 | FR/AR, dual script, bilingual documents | FR-INS-02, FR-INS-16, FR-INS-17; §5; ECR-INS-01, ECR-INS-08 |
| DEC-11 | Mobile phone as contact identifier | FR-INS-01, FR-INS-08, FR-INS-11, FR-INS-17 |
| DEC-20 | Adult student holds their own account | FR-INS-20 (informed at each re-enrollment) |
| DEC-21 | A single active enrollment, dual schooling out of scope before V1 | FR-INS-14, FR-INS-15, FR-INS-21; §1.2 |
| DEC-24 | No blocking of official documents for arrears | FR-INS-18, FR-INS-24 |
| DEC-30 | Advanced stamp and signature at V1, qualified at V2 | FR-INS-16, FR-INS-17 |
| DEC-31 | Fatourati as the primary rail from V1 | FR-INS-20; §8 |
| DEC-32 | Leaving file for a non-ZSchool school (secure link, QR) | FR-INS-24 |
| DEC-36 | Notification channel hierarchy | FR-INS-08, FR-INS-20; §8 |
| C-04 | Enrollment-status contradiction resolved by the state machine | FR-INS-15 |
| G-01 | Identity/matching gap resolved | FR-INS-06 to FR-INS-10 |
| G-07 | Admissions/re-enrollment/rollover gap resolved | FR-INS-01 to FR-INS-05, FR-INS-20 to FR-INS-24 |
| H-14 | Exact content of the parent contract (full text) | FR-INS-16; OQ-03, OQ-06 |
| `prd/03` INV-01 to INV-13 | Invariants used | Cited in each requirement (see Traceability column) |
| `prd/research/00-baseline-corrections.md` nos. 2 and 5 | Law 59.21 (Official Gazette No. 7485 of 23/02/2026); Moudawana (unvoted report) | FR-INS-16; §5; OQ-07 |
| Logging: MVP/V1 scope (arbitration) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | OQ-08; §9 (Auditability) |
| ARB-01 (pilot MVP scope, waves 1 and 2) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-09, FR-INS-16, FR-INS-20, FR-INS-21, FR-INS-23, FR-INS-24; §1.1; OQ-02, OQ-03 |
| ARB-02 (mid-year catch-up) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-27; §2 |
| ARB-03 (state machine: exits from SUSPENDED, CANCELLED, year end, tracked, reinstatement, N+1 as PRE-ENROLLED) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-15, FR-INS-21, FR-INS-24; ECR-INS-06, ECR-INS-10; OQ-01 |
| ARB-07 (login identifier, shared mobile number, foreign numbers) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-08, FR-INS-11; INV-45 |
| ARB-08 (knowledge challenge, claim revocation) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-08 |
| ARB-09 (guardian matching, path 2) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-11, FR-INS-25; ECR-INS-11 |
| ARB-10 (adult student MVP) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-20; §6.2; OQ-09 |
| ARB-11 (scope of court-ordered restriction) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-13; §6.2 |
| ARB-13 (per-tenant documents) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-02; §6.1 |
| ARB-16 (temporary expulsion vs. SUSPENDED) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-15 |
| ARB-17d, ARB-17i (class change and rank; provisional decision for certifying levels) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-21, FR-INS-22 |
| ARB-20d, ARB-20h (re-enrollment never conditional; financial-guardian countersignature) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-16; OQ-06 |
| ARB-22 (arrival from outside ZSchool, Massar reference) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-19, FR-INS-26; ECR-INS-12 |
| ARB-24b, ARB-24c (capacity, effective date) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-INS-04, FR-INS-14, FR-INS-23 |
| ARB-25a (CNIE not collected) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | §5 |
