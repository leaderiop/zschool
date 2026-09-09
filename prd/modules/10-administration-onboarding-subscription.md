# ZSchool — Chapter 10: School Administration, Onboarding and Subscription (ADM)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09) |
| Date | 2026-09-09 |
| Status | PRD Draft — under review |
| Source | `PROJECT.md` §5.1 (actors), §6.6 (school, organization, tenant: RG-21 to RG-23), §6.7 (structure, RG-24/RG-25), §6.10 (entity schema), §7.1 (administration and onboarding, G-06), §8 (roles and permissions), §9 (security, compliance), §10 (non-functional requirements), §11 (SaaS business model), §12 (scope by version), §13 (gaps G-06, G-18, G-33), §14 (DEC-02, DEC-10, DEC-11, DEC-12, DEC-13, DEC-23, DEC-28, DEC-36), §15 (Q-05), §17 (glossary); `prd/research/00-baseline-corrections.md` (points 1, 6, 20) |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/journeys/01-school-group-director.md`, `prd/journeys/02-secretary-cashier.md`, `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/12-academic-structure-timetables.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/15-documents-certificates.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/18-transfers-mobility.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/33-business-model-packaging.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` (arbitrations ARB-01, ARB-02, ARB-08, ARB-09, ARB-25) |

---

## 1. Objective and Scope

### 1.1 Objective

The ADM module is the platform's front door: it puts a school into production cleanly and quickly, then governs its day-to-day administration and the subscription's contractual lifecycle. It covers the full cycle: tenant creation (isolated, RG-21, DEC-02), maintaining the legal information record (RG-22), a setup wizard that instantiates an academic structure from the templates provided (RG-24), bulk import of existing data with duplicate control and an error report (G-18), management of internal users and their roles, language and channel configuration, subscription lifecycle (trial, active, past due, cancelled — DEC-23), a school closure procedure (G-33), counting the "active student" for SaaS billing (§11, DEC-13, DEC-28), and managing consumable packs.

### 1.2 In-Scope

| Scope item | Version |
|---|---|
| Tenant creation via ZSchool provisioning | MVP |
| School legal information record (RG-22) | MVP |
| Setup wizard (structure template, school year, terms, grading scales, initial fee schedule) | MVP |
| Bulk Excel import (students, guardians, teachers, classes, current-term and historical grades) with error report | MVP |
| Mid-year catch-up: importing partially paid installment schedules, cheques on hand, and aggregated absences; activating enrollments via import (FR-INS-27, ARB-02) | MVP |
| Managing internal users, standard roles and affiliations | MVP |
| Language configuration (FR/AR, RTL) and notification channels (in-app, SMS, WhatsApp "presence" utility) | MVP |
| Subscription lifecycle: trial, activation, simplified trial exit | MVP |
| Mobile number change, access recovery, handling a recycled number (ARB-08) | MVP |
| ZSchool support access via ticket with explicit director approval (ARB-25k) | MVP |
| Counting the "active student" and usage statement | MVP |
| Express start-of-year path (onboarding subset unblocking roll call, front-desk enrollment and notifications) | MVP |
| Administration operations log | MVP |
| Online self-registration with validation | V1 |
| Organization (school group): creation, attaching schools, read-only consolidated dashboard (ARB-01) | MVP |
| Organization: shared administration (shared users and settings), SaaS billing at the organization level | V1 |
| Subscription payment delinquency and read-only mode | V1 |
| Cancellation: full export, 90-day read-only period, deletion at 12 months | V1 |
| School closure procedure | V1 |
| Consumable packs: counters, alert thresholds, consumption history, storage quota (ARB-25o) | MVP |
| Self-service subscription and purchase of consumable packs | V1 |
| Minimal school directory (read: name, city, cycles) | MVP |
| Directory: additional fields (education systems, website) and publication management | V1 |
| Tenant administration API | V2+ |
| Mobile number change, access recovery, recycled number, knowledge challenge (FR-ADM-20, ARB-08) | MVP |
| Mid-year catch-up: importing settled payment schedules, cheques on hand, term grades, import activation (extended FR-ADM-06, FR-INS-27, ARB-02) | MVP (wave 1) |

### 1.3 Out of Scope (cross-references)

| Out of scope for ADM | Owning file |
|---|---|
| Creation and claiming of global identities, Massar matching, profile merges, guardian qualities | `prd/modules/11-admissions-enrollment-reenrollment.md` (events `ProbableDuplicateDetected`, `IdentityClaimed`, `IdentityCorrected`, `MergeCompleted` are described there) |
| Detailed academic structure (sections, cycles, levels, subjects, coefficients, timetables, year-N+1 cloning) | `prd/modules/12-academic-structure-timetables.md` |
| Import of historical grades and Massar exports (formats, compliance) | `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/21-massar-regulatory-exports.md` |
| School fee schedule, payment schedules, collections, compliant invoices | `prd/modules/16-finance-billing-collections.md` |
| Message content and templates, parent–teacher threads, detailed routing | `prd/modules/17-communication-notifications.md` |
| Student transfers and leaving files | `prd/modules/18-transfers-mobility.md` |
| Detailed permissions and fine-grained role matrix | `prd/cross-cutting/30-roles-permissions-matrix.md` |
| Pricing, single plan, pack composition and service offerings (onboarding, migration, premium support) | `prd/cross-cutting/33-business-model-packaging.md` |
| Electronic signature, stamps, CNDP compliance, technical audit log | `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md` |

---

## 2. Users and Use Cases

| Actor | Main use cases in ADM | Related needs |
|---|---|---|
| ZSchool super-administrator | Provision a tenant, validate a self-registration, drive subscription states, trigger exports and deletions, access a tenant on a tracked ticket | (→ G-06, DEC-23, §8.1) |
| School director / administrator | Complete the legal record, run the setup wizard, launch imports, manage users and roles, configure languages and channels, monitor subscription and usage, request cancellation or run a closure | BES-DIR-04, BES-DIR-07; (→ RG-22, RG-24) |
| Group administrator (V1) | Create the organization, attach schools, manage shared users and settings, view consolidated usage | (→ RG-21, DEC-02, §11) |
| Front office | Review and correct import reports, invite users, enter delegated fields on the school record | BES-SEC-01, BES-SEC-08; (→ G-18) |
| Teacher, staff | Accept an affiliation invitation, activate their account | (→ RG-18) |
| Parent, student (indirect) | Beneficiaries of language and channel configuration; notification recipients; retain access to their published documents after cancellation or closure | (→ RG-28, DEC-23) |
| ZSchool support | Assist onboarding, run supported imports, handle tracked temporary-access tickets | (→ §8.1, RG-38) |

---

## 3. Key User Journeys

Cross-reference to the journeys in `prd/journeys/00-journey-map.md`; this chapter does not duplicate the steps.

| Journey | Role of the ADM module |
|---|---|
| PC-03 — Onboarding a school (tenant, structure template, Excel import) | Owner: tenant creation, legal record, wizard, imports, users and roles, subscription lifecycle. Owning personas: 01 DIR (`prd/journeys/01-school-group-director.md`) and 02 SEC (`prd/journeys/02-secretary-cashier.md`) |
| PC-04 — A parent claims an identity | Supporting: the module issues invitations and prepares internal accounts; identity matching is owned by `prd/modules/11-admissions-enrollment-reenrollment.md` |
| PC-09 — Inter-school transfers and leaving files | Supporting: closing a school (FR-ADM-13) triggers bulk transfers handled by `prd/modules/18-transfers-mobility.md` |
| PC-11 — Communication | Supporting: channel configuration (FR-ADM-09) feeds the routing described in `prd/modules/17-communication-notifications.md` |

Seasonality: onboarding is a one-off event per school with two windows (PC-03, ARB-02): the back-to-school window (April to August, import before the start of the school year) and the mid-year catch-up window (case of pilots activated from 01/02/2027, JAL-04, catching up on data already produced since September); back-to-school imports (September) form a bulk-processing peak that must be absorbed at target scale (see section 9).

---

## 4. Functional Requirements

### FR-ADM-01 — Create a school's tenant via ZSchool provisioning

| Attribute | Value |
|---|---|
| Description | The ZSchool team (super-administrator) creates a school's tenant: minimal input (name in Arabic and French, city, director contact, internal tenant reference), choice of the initial subscription status (trial with demo data, or active), optional attachment to an existing organization (V1), creation and dispatch of the invitation for the first director-administrator account. The tenant is isolated per RG-21 (tenant key on every operational record, server-side enforcement) and no other school's data is visible from it. The operation is logged. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ RG-21, DEC-02, G-06, §8.1, §9) |
| Actors | ZSchool super-administrator, director |

```gherkin
Feature: Provisioning a new tenant
  Scenario: Creating a tenant with a trial
    Given a school director who has signed with ZSchool
    When the super-administrator creates the tenant with the bilingual name, the city, and status "trial"
    Then the school exists in isolation and a director-administrator account is invited by mobile number
    And no other school's data is accessible from this tenant
    And the creation is recorded in the administration operations log
```

### FR-ADM-02 — Allow a school to self-register with validation

| Attribute | Value |
|---|---|
| Description | A director can submit an online registration request for their school: bilingual name, city, address, authorization number, AREF affiliation, ICE, estimated headcount, director contact. The request is automatically cross-checked (whether the school already exists on the platform, by authorization number, ICE, or known contact) and undergoes human validation by the ZSchool team before any tenant is created; no tenant is created automatically. The applicant is informed of the processing time and the status of their request. The form is protected against abuse (rate limiting, §9). |
| Priority | Should |
| Version | V1 |
| Traceability | (→ G-06, §9) |
| Actors | Prospective director, ZSchool super-administrator |

### FR-ADM-03 — Maintain the school's legal information record

| Attribute | Value |
|---|---|
| Description | The school record carries, per RG-22: name in dual Arabic/French script; ministerial authorization number and date; AREF and provincial education office affiliation; authorized cycles; ICE, IF, RC, business license (patente); CNSS number; address(es); logo and stamp (image files); authorized signatories (identity, role, specimen signature); bank details; director contacts. Fields required for billing and official documents (ICE/IF/RC/patente mentions, header with authorization number, stamp and signatories on report cards and certificates) are marked mandatory and checked for format and completeness. Any change is logged (author, timestamp, before/after value) and values propagate to invoices (`prd/modules/16-finance-billing-collections.md`) and documents (`prd/modules/15-documents-certificates.md`). A single legal entity may operate several schools with distinct authorizations: ICE uniqueness across tenants is not enforced. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ RG-22, RG-38, §2.7, §2.9, §7.6, §7.7) |
| Actors | Director, administrator, front office (delegated fields) |

```gherkin
Feature: School legal record
  Scenario: Completeness checked before issuing an official document (MVP)
    Given a school record whose ICE and stamp are filled in but whose authorization number is missing
    When the front office attempts to issue a certificate of enrollment
    Then the system flags the missing mandatory field on the record and on the document header
    And once entered, the change to the authorization number is logged with author, timestamp, and before/after value
```

### FR-ADM-04 — Administer an organization (school group)

| Attribute | Value |
|---|---|
| Description | A group administrator creates an organization (school group), attaches several schools to it, and gets consolidated views and shared administration without any merging of tenant data (RG-21, DEC-02). **At MVP** (ARB-01, "multi-site group" pilot from DEC-35, BES-DIR-01): organization creation by ZSchool, attaching and detaching tenants, appointing group administrators, a read-only consolidated dashboard (FR-RAP-09 from `prd/modules/20-dashboards-reporting.md` — headcount, attendance, arrears by site), and a consolidated usage statement (FR-ADM-14). **At V1**: shared administration (managing shared users, roles and settings), SaaS billing established at the organization level for attached schools (§11). Creating, attaching and detaching a school are logged and never compromise data isolation. |
| Priority | Must |
| Version | MVP (organization creation, attaching tenants, read-only consolidated dashboard — ARB-01); V1 (shared administration, organization-level billing) |
| Traceability | (→ RG-21, DEC-02, DEC-35, §11, §12; BES-DIR-01, BES-DIR-04; ARB-01) |
| Actors | Group administrator, ZSchool super-administrator |

```gherkin
Feature: Organization (school group)
  Scenario: Consolidated dashboard without data merging (MVP)
    Given an organization created by ZSchool grouping three schools (separate tenants)
    And an appointed group administrator
    When the group administrator opens the consolidated dashboard
    Then they see the headcount, attendance rate, and arrears for each site and their total
    And no named data from one site is visible from another site
    And a student search launched from one tenant never returns a student from another tenant
  Scenario: Logged detachment
    Given a school attached to an organization
    When the super-administrator detaches this school
    Then the school retains all of its data and its own subscription in full
    And the detachment is recorded in the administration operations log
```

### FR-ADM-05 — Run the setup wizard

| Attribute | Value |
|---|---|
| Description | After tenant creation, a guided wizard leads the director to production readiness in saved, resumable steps: (1) choice of a structure template among those provided by ZSchool — Moroccan national system by default, French curriculum, international — then instantiation and customization of sections, cycles, levels and tracks (RG-24); (2) creating the school year with evaluation periods (semesters by default, terms possible) and preloading the ministry's calendar for the year (start of school, holidays, exams) with movable religious holidays marked "to confirm" (source: `prd/research/04-pedagogy-massar-calendar.md` §3); (3) default grading scales and computation rules (grading out of 20, national weightings by cycle, honors ratings, rounding) — the detailed structure and year-N+1 cloning belong to `prd/modules/12-academic-structure-timetables.md`; (4) initial fee schedule (cross-reference `prd/modules/16-finance-billing-collections.md`); (5) importing existing data (FR-ADM-06); (6) inviting internal users (FR-ADM-07). The wizard continuously shows a production-readiness checklist (complete legal record, school year open, at least one class, at least one enrollment, first roll call taken) and its progress. The time zone is fixed to `Africa/Casablanca` at permanent UTC+0 (see OQ-06). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ RG-24, RG-25, G-06, §2.4, §2.5, §6.7, §12) |
| Actors | Director, ZSchool support (guidance) |

```gherkin
Feature: Full onboarding of a new school
  Scenario: Putting a 300-student primary school into production
    Given a tenant created by ZSchool with the Moroccan national structure template
    And an invited and activated director-administrator
    When the director completes the wizard: school year 2026-2027, two semesters, default national grading scales, initial fee schedule
    And imports the student and guardian file (each student with a legal guardian and a financial guardian) with no blocking error, and assigns students to classes
    Then the imported enrollments are activated via import (FR-INS-27) with an "data catch-up" trace
    And the production-readiness checklist shows all steps complete
    And an enrollment can be created at the front desk and a roll call can be taken as early as the next day
    And the usage statement counts active students at the next monthly checkpoint
  Scenario: Resuming after an interruption
    Given a wizard interrupted after the "evaluation periods" step
    When the director logs back in
    Then the wizard resumes at the next step without losing the saved choices
```

### FR-ADM-06 — Bulk-import existing data from Excel

| Attribute | Value |
|---|---|
| Description | The school imports its initial data via Excel files (downloadable templates, bilingual, with instructions and an example) by domain: students (bilingual identity, Massar code, date of birth, level, class, enrollment effective date); guardians (identity, mandatory mobile number in international E.164 format — DEC-11, ARB-07; relationship type and qualities, including at least one legal guardian and one financial guardian per student, INV-09; the CNIE number is not imported at MVP, ARB-25a); teachers (identity, subject, affiliation); classes (level, label, homeroom teacher, capacity); current-term grades and historical grades (attached to the current enrollment or, for prior years, to COMPLETED enrollments created by the import with their year-end decision; a "published" or "draft" status column, RG-29; formats: `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/21-massar-regulatory-exports.md`). **Mid-year catch-up** (ARB-02): the "finance" domain imports each student's payment schedule with the amounts already paid per installment (date, method), cheques on hand (number, bank, due date, amount, student), and discounts granted; the "attendance" domain optionally imports absences aggregated by student and period (count, justified or not). **Guardians** (ARB-09): intra-file deduplication by mobile number; a mobile number already tied to a platform account or profile is offered for matching (never created anew); identical first name + last name + date of birth produces an alert without matching. **Exit state**: students imported with an effective date already reached receive an ACTIVE enrollment via import activation (FR-INS-27); the others are created PRE-ENROLLED. Processing happens in three steps: (1) a non-committal analysis checking structure, formats, mandatory fields and consistency (class exists, level authorized); (2) a downloadable, line-by-line error report distinguishing creatable rows, proposed strong matches (identical Massar code — never enforced, RG-05), probable-duplicate alerts (weak match: first name + last name + date of birth + a guardian's phone number — without automatic linking, RG-05), and rows in error with a reason; (3) explicit commit after correction: import validated in batches, or all-or-nothing at the user's choice. The result gives counts of created, matched, flagged, errored, and skipped rows; the report is archived and the operation logged (RG-38). An import can be replayed after correction without creating duplicates. Identities produced by the import follow the model's matching and deduplication rules (INV-01, INV-02) described in `prd/modules/11-admissions-enrollment-reenrollment.md`. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ G-18, RG-04, RG-05, RG-13, RG-38, DEC-11, H-04, §12; ARB-02, ARB-07, ARB-09, ARB-25a; FR-INS-27) |
| Actors | Director, front office, ZSchool support (assisted imports) |

```gherkin
Feature: Bulk import with error report
  Scenario: Importing a student file containing duplicates and errors
    Given a file of 320 students, 4 of whom are already on the platform by Massar code
    And 3 invalid rows: an unreadable date of birth, a non-existent class, a guardian with no phone number
    When the front office uploads the file and requests analysis
    Then the report distinguishes 313 creatable rows and 4 proposed strong matches, none enforced
    And 3 rows in error with a reason for each
    And no record is written before explicit commit
    When the front office corrects and excludes the 3 error rows, then commits the import
    Then 313 profiles are created, 4 matches are proposed for validation
    And a downloadable report is archived and the operation is logged
  Scenario: Replay without creating duplicates
    Given an import already committed for a given file
    When the same file is submitted again
    Then the already-imported rows are recognized and offered for matching, never duplicated
  Scenario: Mid-year catch-up for a pilot (MVP, ARB-02)
    Given a school activated on 01/02/2027 with 800 students enrolled since September 2026
    And a finance file carrying, for each student, the September-to-January installments already paid and two post-dated cheques on hand
    When the director commits the student, guardian, finance, and first-semester grade imports
    Then each student receives an ACTIVE enrollment activated via import with an effective date of 07/09/2026
    And their payment schedule shows the five installments paid and the five remaining ones due
    And the cheques on hand appear in cheque tracking with their due dates (FR-FIN-12)
    And first-semester grades marked "published" are visible to families, the others remain in draft
  Scenario: Guardian already known to the platform (ARB-09)
    Given an existing parent account carrying mobile number +212661234567 at School A
    When School B imports a guardian with this same number
    Then the system offers matching to the existing account and creates no second account
    And two rows of the same file carrying this number are merged into a single guardian before commit
```

### FR-ADM-07 — Manage internal users and their roles

| Attribute | Value |
|---|---|
| Description | The director (or delegated administrator) creates and manages the school's internal affiliations: directors, academic leadership, front office, accounting, head supervisor and supervisors, infirmary, transport, library, system administrator, teachers. Each affiliation is an invitation (a single affiliation entity, person × school, with roles and contract type) that becomes active once both parties accept (RG-18); the primary contact identifier is the mobile phone number (DEC-11), email being optional. ZSchool provides standard roles composed of fine-grained permissions by module and scope, customizable by the school (RG-37); the detailed matrix is owned by `prd/cross-cutting/30-roles-permissions-matrix.md`. Suspending a user interrupts their access; closing an affiliation revokes access immediately while retaining the data produced, attributed to its author (RG-19). Two-factor authentication is required from MVP for the director, academic-leadership, administrator, accounting and system-administrator roles; it is optional for teachers and supervisors, with trusted devices recognized for 90 days (§9; ARB-25l; SEC-02, SEC-04 and PER-17 aligned). The local system administrator cannot create or reset a director-role account (dual control, ARB-25m). Any grant, suspension or closure is logged (RG-38). A single account may carry several profiles and switch context (RG-03); accounts are never shared between two people. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ RG-03, RG-18, RG-19, RG-37, RG-38, DEC-11, §8, §9; ARB-25l, ARB-25m) |
| Actors | Director, administrator, internal users, group administrator (V1) |

```gherkin
Feature: Internal users and roles
  Scenario: Inviting a part-time teacher without mandatory MFA (MVP)
    Given a director who invites a teacher by mobile number with the standard "teacher" role and contract type "part-time"
    When the teacher accepts the invitation and activates their account
    Then the affiliation becomes active and their permissions derive from their course assignments
    And two-factor authentication is offered without being required
  Scenario: Dual control on director accounts
    Given a local system administrator
    When they attempt to reset the director's password
    Then the operation is refused and validation by a second director-role account is required
```

### FR-ADM-08 — Configure languages and bilingualism

| Attribute | Value |
|---|---|
| Description | The school sets its default interface language (French or Arabic); each user may choose their personal preference. The interface is fully available in French and Arabic with complete right-to-left support (DEC-10). Identity forms require dual-script entry (Latin and Arabic) of first and last names. Institutional content (message templates, school announcements, official documents) is bilingual; individual messages and parent–teacher threads render in the author's own language as-is (UX-08 in `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`), with assisted translation as a V2+ option owned by `prd/modules/17-communication-notifications.md`. English as an interface language is out of scope for MVP and V1 (the baseline places it at V2, §10); the technical requirements for RTL and fonts are owned by `prd/cross-cutting/32-non-functional-requirements.md` and `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ DEC-10, G-10, §2.9, §10; ARB-21c) |
| Actors | Director, all users |

```gherkin
Feature: Languages and bilingualism
  Scenario: Per-person language preference (MVP, ARB-21c)
    Given a school whose default language is French
    And a father and his son using the same phone with two separate accounts
    When the father chooses Arabic and the son keeps French
    Then each person's interface, SMS, and notifications follow their own preference, independent of the device
```

### FR-ADM-09 — Configure communication channels

| Attribute | Value |
|---|---|
| Description | The school configures the notification channels available and their routing by message type: in-app and SMS at MVP, complemented from MVP by "utility" WhatsApp limited to attendance notifications under opt-in (minimal templates — arbitration recorded in OQ-09); at V1, generalized WhatsApp (all message types, managed templates) and push notifications complete the choices (§12, DEC-12), with email remaining secondary. Configuration includes: per-channel activation, fallback order by message type (SMS fallback for households without a smartphone or internet, rural digital divide), sending windows and hours, WhatsApp consent management (prior parental opt-in, opposition, Law 09.08 and CNDP-ANRT 2019 guidance — source: `prd/research/03-payments-communications.md` §4-5), and tracking of consumption counters (FR-ADM-15). Message templates themselves and the delivery engine are owned by `prd/modules/17-communication-notifications.md`; this module owns only the school's configuration. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ DEC-11, DEC-12, DEC-36, G-17, §2.10, §12; MVP WhatsApp scope in OQ-09, ARB-21) |
| Actors | Director, administrator |

```gherkin
Feature: Channel configuration
  Scenario: Channels available at MVP (ARB-21b)
    Given a school on MVP
    When the director opens channel configuration
    Then they can activate in-app, SMS, and "utility" WhatsApp for attendance notifications only
    And push notifications and generalized WhatsApp are shown as "coming in V1" and cannot be activated
    And sending windows for reminders and announcements are configurable, with attendance notifications exempt
```

### FR-ADM-10 — Manage the subscription trial and activation

| Attribute | Value |
|---|---|
| Description | On tenant creation, the subscription is created in "trial" status (limited duration, demo data provided per §11) or directly "active." The platform notifies the director before the trial expires. At expiry: conversion to "active" (single plan, DEC-28; demo data is purged and the school proceeds with its real import), a request for extension handled by ZSchool, or **simplified trial exit** (MVP): status "trial expired," 30 days read-only, simple export of the real data entered (spreadsheet), then purge; full cancellation of an active subscription (full export, 90 days, deletion at 12 months) is owned by FR-ADM-12 (V1). Real data entered during a trial is retained upon activation. The status change is logged and the director is notified. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ G-06, DEC-28, §11, §12; MVP justification in OQ-01) |
| Actors | Director, ZSchool super-administrator |

```gherkin
Feature: Trial and activation
  Scenario: Activation at the end of the trial
    Given a tenant on trial with demo data and some real data entered
    When the super-administrator converts the subscription to "active"
    Then the demo data is purged, the real data is retained, and the director is notified
  Scenario: Trial exit without activation (MVP)
    Given a trial that has expired without conversion or extension
    When the deadline passes
    Then the tenant moves to "trial expired," read-only for 30 days with a simple export available
    And the data is purged at the end of the 30 days, the operation being logged
```

### FR-ADM-11 — Handle subscription payment delinquency

| Attribute | Value |
|---|---|
| Description | When an active school's (or, for an organization, its attached schools') SaaS invoice goes unpaid, the platform sends graduated reminders to the director (and to the group administrator where applicable). After a platform-level configured delay, the subscription moves to "past due" status: the school's write operations are blocked (read-only mode), viewing and exports remain possible, and an information banner is shown to the school's accounts. Student safety comes first: operational safety functions (in particular same-day absence notification) remain in effect as long as the subscription is not cancelled (proposal recorded in OQ-03). Once payment is made, the subscription reverts to "active" and write operations are restored immediately, with no data loss. This clause covers exclusively the school's unpaid SaaS invoice; it has no bearing on DEC-24: students' official documents are never blocked for school-fee arrears (FR-INS-18 in `prd/modules/11-admissions-enrollment-reenrollment.md`, FR-DOC-09 in `prd/modules/15-documents-certificates.md`). |
| Priority | Must |
| Version | V1 |
| Traceability | (→ §7.1, §11, DEC-23; delay in OQ-02) |
| Actors | Director, group administrator, ZSchool super-administrator |

```gherkin
Feature: Subscription payment delinquency
  Scenario: Moving to read-only then back to active
    Given an active school whose monthly invoice is unpaid
    And reminders sent to the director without payment
    When the configured delay expires
    Then the subscription moves to "past due" status
    And the school's write operations are blocked, with viewing and exports still possible
    And a banner informs users and the director is notified
    When the payment is recorded
    Then the subscription reverts to "active" and write operations are restored immediately with no data loss
```

### FR-ADM-12 — Cancel the subscription with full export and delayed deletion

| Attribute | Value |
|---|---|
| Description | Cancellation is initiated at the school's request (director's request, confirmed by a second validation) or by ZSchool (prolonged non-payment, founder's decision). Effects, per DEC-23 and INV-38: (1) production of a full export of the school's data (operational data, published documents, audit logs concerning it) made available to the director via a secure, time-limited link; (2) move to "cancelled" status with 90 days of read-only access: viewing and exports possible, no writes; (3) closing active enrollments with the dedicated reason "subscription cancellation" and date (RG-10; ARB-03: COMPLETED with a decision if cancellation occurs at year end, WITHDRAWN with this dedicated reason mid-year, so the student's global history never shows a "student departure") and closing affiliations (RG-19); (4) 12 months after cancellation, deletion of the tenant's operational data, while global identities, relationships and data subjects' access to their published documents are retained (RG-28, INV-20); (5) director notification at each step (event `SubscriptionSuspendedOrTerminated`); (6) updating the public directory (FR-ADM-17). The entire operation is logged. |
| Priority | Must |
| Version | V1 |
| Traceability | (→ DEC-23, Q-05, RG-10, RG-19, RG-28, G-06, §12; INV-38) |
| Actors | Director, group administrator, ZSchool super-administrator |

```gherkin
Feature: Cancellation with full export
  Scenario: Cancellation at the school's request
    Given an active school whose director requests cancellation
    When the request is confirmed by the second validation
    Then a full export of the school's data is produced and made available via a secure, time-limited link
    And the subscription moves to "cancelled": 90 days read-only, no writes possible
    And active enrollments are closed with a reason and date, and affiliations are ended
    And parents and students retain access to their published documents
    When 12 months since cancellation have passed
    Then the tenant's operational data is deleted
    And global identities and people's access to their published documents are retained
```

### FR-ADM-13 — Manage the closure of a school (G-33)

| Attribute | Value |
|---|---|
| Description | Closing a school (voluntary closure, non-renewal or withdrawal of ministerial authorization, merger within a group) is a dedicated procedure, distinct from commercial cancellation though it reuses its export and retention mechanisms (DEC-23): (1) recording the reason and date of closure; (2) immediately blocking new enrollments; (3) controlled closing of active enrollments (RG-10) with the dedicated reason "school closure," leaving certificates and leaving files produced in bulk (cross-reference `prd/modules/18-transfers-mobility.md`, DEC-32); (4) transfers initiated by the originating school in bulk to other schools on the same global identity (no identity is ever duplicated — INV-43; ARB-22); (5) full export delivered to the director; (6) updating the public directory (FR-ADM-17); (7) retaining data subjects' access to their published data (RG-28, INV-20) and applying retention periods (DEC-22) then deletion timelines (DEC-23). The procedure is logged end to end. |
| Priority | Should |
| Version | V1 |
| Traceability | (→ G-33, RG-10, RG-28, RG-23, DEC-22, DEC-23, DEC-32) |
| Actors | Director, group administrator, ZSchool super-administrator |

```gherkin
Feature: School closure
  Scenario: Administrative closure mid-year
    Given a school closed by management decision or whose authorization is withdrawn
    When the closure procedure is launched with reason and date
    Then new enrollments are blocked
    And every active student receives a leaving certificate and a leaving file in bulk
    And transfers to other schools proceed on the same global identity
    And a full export is delivered, the public directory is updated
    And parents and students retain access to their published documents
```

### FR-ADM-14 — Count active students and present usage

| Attribute | Value |
|---|---|
| Description | The platform counts, each month from September to June (10 months, no billing in July and August), the number of "active students" at each school: the SaaS billing unit for the single plan (§11, DEC-13, DEC-28). The proposed counting rule is a headcount of ACTIVE-status enrollments at a fixed monthly count date — rule detailed in PAK-04 of `prd/cross-cutting/33-business-model-packaging.md` §3 (count on the 1st of the month at midnight `Africa/Casablanca` time, only ACTIVE enrollments counted, append-only history in `UsageMetric`); entries and exits during the month are picked up at the next count, and a student transferred between two tenants is counted once, in the month of transfer, at the originating school (ARB-20c; OQ-05 resolved). The director (and the group administrator for their schools) can view a usage statement at any time: active students for the month and 10-month history, forecast for the next checkpoint, SMS, WhatsApp and storage consumption; the statement is exportable. Pricing and billing terms are owned by `prd/cross-cutting/33-business-model-packaging.md`. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ DEC-13, DEC-28, §11, §12; PAK-04 in `prd/cross-cutting/33-business-model-packaging.md` §3; MVP justification in OQ-01; ARB-20c) |
| Actors | Director, group administrator, ZSchool super-administrator |

```gherkin
Feature: Counting active students
  Scenario: Monthly count and a mid-month transfer (MVP)
    Given School A with 300 ACTIVE enrollments at midnight on March 1st, Morocco time
    And a student transferred from A to B on March 12th
    When the April count is run
    Then the student is counted at B and not at A in April
    And for the month of March they were counted only once, at A
    And each count is recorded as an append-only entry in the usage statement
```

### FR-ADM-15 — Manage consumable packs

| Attribute | Value |
|---|---|
| Description | The school (or its organization) subscribes to and manages consumable packs: SMS, WhatsApp conversations, document storage beyond the quota (§11, DEC-28: only consumables and services are billed in addition). Each school has per-channel counters, configurable alert thresholds (director notified when crossed), and a consumption history with cost per send (delivery-log traces). When a prepaid channel is exhausted: that channel is suspended with fallback to available channels (in-app notification) and an immediate alert to the director; critical notifications are never silently lost (failure status remains visible in delivery tracking). The included document storage quota is set at MVP to 2 GB per school plus 5 MB per active student (hypothesis ARB-25o, to be costed in `prd/cross-cutting/33-business-model-packaging.md`, PAK-11); exceeding it triggers an alert then billing beyond the quota. Authentication SMS (OTP, MFA, reset, invitations) are never deducted from the school's packs: their cost is borne by ZSchool (ARB-21h). Pack composition and pricing are owned by `prd/cross-cutting/33-business-model-packaging.md`. MVP SMS consumption is tracked from the outset (counters, thresholds and history active from pilot onboarding); self-service pack subscription and purchase arrive at V1 with commercialization (see OQ-01). |
| Priority | Must |
| Version | MVP (counters, alert thresholds, consumption history); V1 (self-service pack subscription and purchase — see OQ-01) |
| Traceability | (→ DEC-28, §11, §7.8, §12; MVP and V1 justification in OQ-01; ARB-21h, ARB-25o) |
| Actors | Director, group administrator, accounting |

```gherkin
Feature: Consumables
  Scenario: SMS credit exhaustion (MVP)
    Given a school whose SMS credit reaches the configured alert threshold
    When a notification is routed to the SMS channel
    Then the director is alerted immediately and the consumption history shows the cost per send
    And once the credit is exhausted, attendance notifications keep being delivered on the available channels, with the SMS failure remaining visible in delivery tracking
  Scenario: OTP not deducted
    Given a parent logging in with a one-time code
    When the code SMS is sent
    Then no charge appears on the school's counters
```

### FR-ADM-16 — Log administration operations

| Attribute | Value |
|---|---|
| Description | Every administration operation produces a logged entry (RG-38): tenant creation and configuration, legal-record changes, bulk imports (file, counts, report), role grants, suspensions and closures, subscription status changes, exports and deletions tied to cancellation or closure, and any ZSchool support access to a tenant — which happens only via ticket (`SupportTicket`, MVP), after the director's explicit in-app approval, for a bounded duration, and tracked (§8.1, G-32; ARB-25k). Each entry carries author, context (tenant), timestamp, and before/after values where applicable. At MVP, logging ensures immutable, record-level history of administration entries (arbitration D4, ARB-25j); the sensitive-access log and audit-log export ship at V1 (§12). The technical aspects of the log (immutability, 5-year retention, export) are owned by `prd/cross-cutting/31-security-privacy.md`. |
| Priority | Must |
| Version | MVP (entry history); V1 (immutable, exportable audit log — see OQ-08) |
| Traceability | (→ RG-38, G-32, §8.1, §9; ARB-25j, ARB-25k) |
| Actors | Director, ZSchool support, ZSchool super-administrator |

```gherkin
Feature: Administration log and support access
  Scenario: Support access via ticket with director approval (MVP)
    Given a support ticket opened for School A
    When the support agent requests temporary tenant access
    Then access opens only after the director's explicit in-app approval, for at most the requested duration
    And every write made during this access is logged with the ticket identifier
```

### FR-ADM-17 — Publish the minimal public school directory

| Attribute | Value |
|---|---|
| Description | The platform maintains a minimal, read-only school directory strictly limited to the fields: name, city, cycles (RG-23, INV-19); it is needed for transfer procedures from MVP (cross-reference `prd/modules/18-transfers-mobility.md`). The director chooses the published values and may request that their school be hidden from browsing and network listings; a hidden school remains selectable as a transfer destination via an exact name search (ARB-22: otherwise the family is pushed toward the "outside ZSchool" path and an identity gets duplicated). Every other field on the record (including contact details, headcount, financial information) stays private. The single owner of the directory is this requirement; FR-CAR-14 in `prd/modules/19-teacher-career-network.md` cross-references it. At V1: additional fields (education systems, website) and fine-grained publication management; professional-network and application features wait for V2+ (§12). Publishing, editing, and hiding are logged. |
| Priority | Must |
| Version | MVP (minimal read-only directory); V1 (additional fields, publication management); V2+ (network, applications) |
| Traceability | (→ RG-23, INV-19, C-08; MVP arbitration in OQ-10 (D6); ARB-22) |
| Actors | Director, group administrator |

```gherkin
Feature: Minimal directory
  Scenario: A hidden school still reachable for a transfer (MVP)
    Given a school that has requested to be hidden from the directory
    When a legal guardian enters this school's exact name as a transfer destination
    Then the school is offered and the transfer request can be initiated
    And the school appears in no browsing or network listing
```

### FR-ADM-18 — Offer a tenant administration API

| Attribute | Value |
|---|---|
| Description | A documented API lets a school (or its organization) programmatically drive administration functions: viewing usage and counters, managing users and roles, triggering and tracking exports, viewing subscription status. The API is authenticated, scoped to authorized areas, logged like any write operation (RG-38), and delivered with the roadmap's "public API" wave (§10: public API documented at V2; §12). External integrations (messaging, payment) remain owned by `prd/cross-cutting/35-external-integrations.md`. |
| Priority | Could |
| Version | V2+ |
| Traceability | (→ §10, §12) |
| Actors | Director, group administrator, integrators |

### FR-ADM-19 — Offer an express start-of-year path

| Attribute | Value |
|---|---|
| Description | A minimal subset of the setup wizard (FR-ADM-05) and the import (FR-ADM-06) forms an "express start-of-year path" for schools arriving a few days before the school year starts: (1) instantiating the national structure template and creating the school year with its evaluation periods (RG-24); (2) importing students and their guardians with class assignment (G-18); (3) inviting teachers (RG-18). At the end of this subset, roll call (owned by `prd/modules/13-attendance-student-life-discipline.md`), front-desk enrollment (owned by `prd/modules/11-admissions-enrollment-reenrollment.md`), and notifications (owned by `prd/modules/17-communication-notifications.md`) are operational. The rest of the wizard (fee schedule, advanced grading scales, full channel configuration, rooms and timetables) can be deferred without blocking production. The requirement carries a measurable target: complete express-path preparation in under one day for a 300-student school; this target is proposed as an indicator to `prd/cross-cutting/38-kpi-success-metrics.md` (mentioned in the traceability, with no dedicated KPI ID at this stage). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ G-06, RG-24, RG-18, §12; time target tracked via `prd/cross-cutting/38-kpi-success-metrics.md`; origin: review finding "express start-of-year path") |
| Actors | Director, ZSchool support |

```gherkin
Feature: Express start-of-year for a 300-student school
  Scenario: Operational school in under one day
    Given a tenant created the day before the start of school with the national structure template
    When the director completes the express path: school year 2026-2027 and periods, importing 300 students and their guardians, class assignment, teacher invitations
    Then morning roll call, front-desk enrollment, and attendance notifications are operational on the first day of school
    And full express-path preparation took under one day
  Scenario: Deferrable steps with no blocking
    Given an express path completed without a fee schedule or advanced grading scales
    When the director opens the full setup wizard after the start of school
    Then the remaining steps are offered without redoing the choices already made
    And no function unlocked by the express path (roll call, front desk, notifications) is degraded
```

### FR-ADM-20 — Change a mobile number, recover access, and handle a recycled number

| Attribute | Value |
|---|---|
| Description | The mobile number is the default login identifier (DEC-11, INV-37, INV-45); its loss, change, or reassignment by a carrier must neither lock out the holder nor expose their data to a third party (ARB-08). (a) **Self-service change**: the holder enters the new number, confirms a one-time code on the old and new numbers; the operation is logged and the schools with an active relationship are notified. (b) **Recovery without access to the old number**: at the front desk of any school where the person has an active relationship, the front office verifies identity (ID presented, matched against the recorded civil status), records the request with the new number, the director validates it; the change is logged, and the other schools involved and the old number are notified. (c) **Recycled number**: after six months with no login, or after three consecutive one-time-code failures, any login requires a knowledge challenge (date of birth of a linked child or of a student in their classes, entered without being displayed) before access; on failure, the account is locked and the schools involved are alerted. (d) The knowledge challenge also applies to claiming a profile (FR-INS-08 in `prd/modules/11-admissions-enrollment-reenrollment.md`). Minor students with a generated login identifier (ARB-07) change identifiers through a legal guardian; an adult student migrates to a personal number via path (a). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ DEC-11, RG-12b, §9; INV-13, INV-37, INV-45; ARB-07, ARB-08; SEC-05 in `prd/cross-cutting/31-security-privacy.md`) |
| Actors | Parent, teacher, staff, adult student, front office, director |

```gherkin
Feature: Number change and recycled numbers
  Scenario: Self-service number change (MVP)
    Given a parent whose account is identified by number +212661234567
    When they enter the new number +212677654321 and confirm the two codes received on the old and new numbers
    Then their account is identified by the new number, the operation is logged, and the schools of their children are notified
  Scenario: Front-desk recovery after phone loss
    Given a parent who no longer has access to their old number
    When School A's front office verifies their ID and records the request with the new number
    And the director validates the request
    Then the account is linked to the new number, the old number receives an information message, and the operation is logged
  Scenario: Number reassigned by the carrier
    Given an account with no login for seven months
    When someone attempts to log in with this number and receives the one-time code
    Then a knowledge challenge (date of birth of a linked child) is required before any access
    And three wrong answers lock the account and alert the schools involved
```

---

## 5. Morocco-Specific Considerations

| Specific | Treatment in this module | Source |
|---|---|---|
| A school's legal identifiers | Legal record with ICE, IF, RC, patente, CNSS, authorization number, AREF and provincial education office; these entries feed invoices and official documents | RG-22; `prd/research/02-regulatory-data.md` §7 |
| Adults' CNIE (Law 09.08) | Guardians' and staff's CNIE number is neither entered nor imported at MVP: the field is disabled until CNDP's prior F112 authorization is obtained; adult identity relies on first name, last name, date of birth, and mobile number | ARB-25a; `prd/cross-cutting/36-legal-compliance-data-protection.md` |
| Oversight by the AREF | Authorization number and AREF/provincial office affiliation mandatory on the record; authorized cycles bound structure instantiation | RG-22; Law 59.21 (`prd/research/02-regulatory-data.md` §1) |
| Bilingualism and dual script | School and person names in dual AR/FR script; bilingual documents and notifications; full RTL interface | DEC-10; §2.9 |
| Time zone | Configuration fixed to `Africa/Casablanca` at permanent UTC+0 since 20/09/2026 (Decree No. 2.26.530); the baseline's former Ramadan alternation is obsolete — divergence recorded in OQ-06 | `prd/research/00-baseline-corrections.md` point 1; `prd/research/04-pedagogy-massar-calendar.md` §3 |
| Ministry calendar | Preloading the year's calendar (start of school, four weeks of holidays, mid-year, exams), Saturday morning classes configurable, movable religious holidays marked "to confirm" | `prd/research/04-pedagogy-massar-calendar.md` §3 |
| Communication channels | Mobile phone as primary identifier (DEC-11); SMS as a universal fallback channel; WhatsApp under prior opt-in (Law 09.08, CNDP-ANRT 2019 guidance); WhatsApp pricing shift on 01/10/2026 to be absorbed via a parameter (OQ-07) | `prd/research/03-payments-communications.md` §4-5; `prd/research/05-infrastructure-usage.md` §2 |
| Digitalization support | The MOWAKABA program (80% SME / 90% micro-enterprise coverage of digitalization services) may fund onboarding, configuration, and training services; school eligibility is unconfirmed: a commercial argument to be used with caution and prior verification | `prd/research/02-regulatory-data.md` §9; `prd/research/00-baseline-corrections.md` point 20 |
| Sovereign hosting | Production and backups in Morocco (DEC-26): a feasibility condition for the promise "student data never leaves Morocco, except for messaging flows governed by F118"; no direct functional bearing on this module, but it constrains export timelines and the location of cancellation archives | DEC-26; `prd/research/05-infrastructure-usage.md` §1 |

---

## 6. Data and Events

### 6.1 Entities used (dictionary: `prd/03-domain-data-model.md` §2)

| Domain | Entities | Usage in ADM |
|---|---|---|
| School | `School`, `Organization`, `Campus`, `Section`, `AcademicYear`, `Calendar`, `Holiday`, `ScheduleVariant`, `Cycle`, `Level`, `Track`, `Class`, `Group`, `GradingScale`, `EvaluationPeriod`, `ComputationRule` | Legal record and settings (RG-22), organization, setup wizard (template instantiation, RG-24) |
| Relations | `SchoolMembership` | Internal affiliations, roles, invited/active/suspended/terminated statuses (RG-18, RG-19) |
| Identity | `User`, `StaffProfile` | Internal accounts, invitations, phone as primary identifier (DEC-11) |
| Platform | `Subscription`, `Plan`, `ModuleActivation`, `UsageMetric`, `AuditLog`, `DataExport`, `SupportTicket` (MVP, ARB-25k) | Subscription lifecycle, active-student and consumable counting, administration log, cancellation exports, ticket-based support access with director approval |
| Identity | `User` (login identifier distinct from contact identifiers, INV-45) | Number change, access recovery, recycled number (FR-ADM-20) |
| Imports | `Person`, profiles, `ParentStudentRelationship`, `Enrollment`, `StudentClassHistory` (derived creations) | Produced by imports; matching and duplicate rules owned by `prd/modules/11-admissions-enrollment-reenrollment.md` (INV-01, INV-02) |

### 6.2 Notifiable Events

Per the domain event catalog (`prd/03-domain-data-model.md` §7):

| Event | ADM's role | Effects |
|---|---|---|
| `SubscriptionSuspendedOrTerminated` | Producer | Notifies the director (and group administrator): move to read-only, export available, deletion timeline (DEC-23) |
| `ProbableDuplicateDetected` | Consumer (imports) | Alerts the school when a weak match is detected during an import; never automatic linking (RG-05) |
| `IdentityCorrected` | Indirect consumer | Post-import identity corrections follow the rules in `prd/modules/11-admissions-enrollment-reenrollment.md` (RG-07) |
| Invitation and alert notifications | Producer | Affiliation invitations, subscription alerts (trial ending, non-payment), consumable thresholds: issued via `Notification` with a `DeliveryLog` (channel, status, cost), per FR-ADM-09 configuration |

---

## 7. Key Screens

Screens described in text, mobile-first, available in French and Arabic (full RTL). General UX principles are owned by `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`.

### ECR-ADM-01 — "My School" (legal record)

- **Purpose**: view and edit the RG-22 record.
- **Areas**: header with logo, AR/FR name and subscription status; sections "Legal identity" (authorization, AREF, provincial office, authorized cycles), "Tax and social" (ICE, IF, RC, patente, CNSS), "Contact details" (addresses, contacts), "Visual identity and signature" (logo, stamp, signatories with specimen), "Bank details."
- **States**: missing mandatory fields flagged with a counter and a list; logged values viewable (last change, author); read-only mode for unauthorized roles.
- **FR/AR behavior**: bilingual labels, dual-script name entry with an AR/FR keyboard toggle; long form broken into steps on mobile with saving at each step; completeness check shown before validation (FR-ADM-03).

### ECR-ADM-02 — "Setup Wizard"

- **Purpose**: run the six-step onboarding (FR-ADM-05).
- **Areas**: numbered step thread (1 structure template, 2 school year and periods, 3 grading scales, 4 initial fee schedule, 5 import, 6 users) with saved progress; at each step, default choices drawn from the national template; a "Resume where you left off" banner; a production-readiness checklist accessible at all times.
- **States**: completed, in progress, not-yet-reached steps; warnings (for example "religious holidays to confirm" on the preloaded calendar); "ready for production" state once the checklist is complete.
- **FR/AR behavior**: bilingual, high-contrast interface usable on mobile; each default choice explainable in one line; a "Skip for now" button available outside mandatory steps (FR-ADM-05).

### ECR-ADM-03 — "Data Import"

- **Purpose**: bulk Excel import with error report (FR-ADM-06).
- **Areas**: domain selection (students, guardians, teachers, classes, historical grades); template and instructions download; file drop zone; report screen: counters (creatable, proposed strong matches, probable duplicates, errors), a line-by-line table with reasons, filters, report download; commit screen (summary, choice of batch or all-or-nothing validation); result screen with final counts and a link to the archived report.
- **States**: analysis in progress (progress bar), report ready, commit in progress, import complete, import partially committed; blocking errors vs. warnings visually distinguished.
- **FR/AR behavior**: bilingual, actionable error reasons (column and offending value); resumable after correction and re-upload; on mobile, the report is viewable read-only, with commit reserved for larger screens (G-18).

### ECR-ADM-04 — "Users and Roles"

- **Purpose**: manage internal affiliations (FR-ADM-07).
- **Areas**: user list (name, roles, status, last activity) with search and status filters; user record (contact details with phone as primary identifier, roles, scopes, history); invitation screen (phone, standard role or fine-grained permissions, contract type); customizable standard-roles screen with a permissions preview.
- **States**: invited, active, suspended, terminated; contextual actions (resend an invitation, suspend, close with confirmation and reason); grant and revocation traces.
- **FR/AR behavior**: an explicit warning before any closure ("access is revoked immediately; data produced stays attributed to the author"); two-factor authentication required at the first login of school-level roles (RG-18, RG-19, §9).

### ECR-ADM-05 — "Settings — Languages and Channels"

- **Purpose**: configure languages (FR-ADM-08) and communication channels (FR-ADM-09).
- **Areas**: languages block (school default language, personal preference, reminder of the dual-script requirement); channels block (message-type × channel matrix with fallback order, sending windows, WhatsApp opt-in management with per-parent status searchable); consumption alerts block (per-channel thresholds).
- **States**: channel enabled/disabled; opt-in granted/refused/withdrawn; preview of a bilingual template before saving.
- **FR/AR behavior**: switching language immediately flips reading direction; choices not yet available in the current version (WhatsApp generalization and push before V1) are shown "coming soon" and cannot be configured; the MVP's "presence" utility WhatsApp channel is visible and configurable with its minimal templates (DEC-10, DEC-12, OQ-09).

### ECR-ADM-06 — "Subscription and Usage"

- **Purpose**: track the subscription, usage, and consumables (FR-ADM-10, FR-ADM-11, FR-ADM-12, FR-ADM-14, FR-ADM-15).
- **Areas**: status banner (trial with deadline, active, past due with a permanent banner, cancelled with a read-only countdown); usage statement (active students for the month, 10-month history, forecast); consumables (per-channel balance, thresholds, history, pack subscription at V1); received SaaS invoices; "export and cancellation" area (cancellation request with double confirmation, available exports with link expiration dates, deletion timeline spelled out); for the group administrator: a consolidated view of attached schools.
- **States**: subscription statuses; exports in preparation/ready/expired; cancellation requests awaiting second validation.
- **FR/AR behavior**: in "past due" or "cancelled" status, write actions are dimmed with a reason message and a path to compliance; no legal jargon: durations (90 days, 12 months) are stated in days and calendar dates (DEC-23, §11).

### ECR-ADM-07 — "My Number and My Access"

- **Purpose**: number change, access recovery, and handling of recycled numbers (FR-ADM-20).
- **Areas**: holder side (mobile): current number, "Change Number" button with two-code validation, list of devices and active sessions with remote sign-out; front-office side (web): a recovery form (person lookup by civil status, ID presented, new number, reason) sent for director validation; director side: a queue of recovery requests to validate.
- **States**: change pending the second code; recovery request pending, validated, or refused; account locked after a failed knowledge challenge, with a front-desk unlock path.
- **FR/AR behavior**: bilingual messages; the knowledge challenge never displays the expected value or children's names; the old number receives an information SMS after any change.

---

## 8. Integrations

Cross-reference to the integrations catalog (`prd/cross-cutting/35-external-integrations.md`); this chapter does not substitute for any technical specification.

| Integration | Usage in ADM |
|---|---|
| SMS via a Moroccan aggregator (INT-SMS) | Fallback notification channel; consumption deducted from packs (FR-ADM-09, FR-ADM-15) |
| WhatsApp Business Platform (INT-WAP) | Parent channel under opt-in: MVP limited to utility attendance notifications (minimal templates, OQ-09); generalized at V1; pricing-shift parameter on 01/10/2026 (OQ-07); opt-in and opposition are managed at the configuration level (Law 09.08, CNDP-ANRT 2019 guidance) |
| Email (INT-EML) | Secondary, optional channel (DEC-11, DEC-12) |
| Hosting (INT-HEB) | Production and backups in Morocco (DEC-26); governs the location of cancellation exports and archives |
| Electronic signature (INT-SIG) | No direct application in ADM; the legal record's image stamp precedes the advanced electronic stamp (V1) owned by documents (`prd/modules/15-documents-certificates.md`, DEC-30) |

---

## 9. Module-Specific Non-Functional Requirements

Numbered `NFR-*` requirements are owned by `prd/cross-cutting/32-non-functional-requirements.md`; this chapter cites the applicable domains and the baseline's thresholds.

| Domain | Application to ADM |
|---|---|
| NFR-RES (volumetry) | Back-to-school imports must absorb the pilots' scale (up to 2,000+ students for the multi-site group, DEC-35) and the three-year target (500 schools, 500,000 students, §10) |
| NFR-PERF (performance) | Analyzing an import of several thousand rows and producing a full cancellation export must stay within objective timeframes to be set in `prd/cross-cutting/32-*`; the admin interface follows the general requirement of common pages loading under 2s on 4G |
| NFR-DISP (availability) | Heavy onboarding processes (large assisted imports) are scheduled outside the start of the school year and exam periods, per the baseline's maintenance windows |
| NFR-I18N (languages) | FR/AR interface with full RTL from MVP (DEC-10); English out of scope before V2 |
| NFR-OBS (observability) | Logging and per-tenant traceability of administration operations (RG-38) |
| NFR-SAV (support) | Temporary, audited support-access procedure by ticket (§8.1, G-32); traceable onboarding assistance |
| Application security | Rate limiting on self-registration, MFA for director, administration, accounting and system-administrator roles (optional for teachers and supervisors, ARB-25l), anti-enumeration protection on searches during imports, knowledge challenge on recycled numbers (FR-ADM-20, §9); security requirements are owned by `prd/cross-cutting/31-security-privacy.md` |

---

## 10. Success Metrics

Indicators proposed for this module (consolidation and `KPI-*` numbering owned by `prd/cross-cutting/38-kpi-success-metrics.md`):

| Indicator | Proposed definition | Indicative target |
|---|---|---|
| Time to production | Time between tenant creation and the first roll call taken in production | Under 10 business days with standard support |
| "Express start-of-year" time | Preparation time for the minimal subset (FR-ADM-19) until critical functions are in production (roll call, front-desk enrollment, notifications) | Under 1 day for 300 students (cross-reference `prd/cross-cutting/38-kpi-success-metrics.md`) |
| Onboarding autonomy | Share of schools completing the wizard without support intervention | To be established with the pilots |
| Import quality | Share of rows committable on the first pass (no correction) | Above 95% |
| Internal-user adoption | Share of invited affiliations that become active within 14 days | To be established with the pilots |
| Subscription health | Share of active schools with no delinquency incident; annual renewal rate | Commercial tracking |
| Counting accuracy | Gap between the "active students" count and enrollments actually active on the count date | Zero (monthly check) |

---

## 11. Open Questions

| ID | Question | Context and proposal |
|---|---|---|
| OQ-01 | Exact scope of subscription management at MVP. | **Resolved — ARB-01, ARB-25k** (simplified trial exit and ticket-based support access added to MVP; the rest unchanged). The baseline's §12 does not explicitly cite the subscription lifecycle at MVP. This chapter treats trial, activation (FR-ADM-10) and active-student counting (FR-ADM-14) as MVP because they are inseparable from pilot onboarding and the adopted DEC-28 model; packs (FR-ADM-15) are MVP for their counters, alert thresholds and history — pilots consume SMS from onboarding and no billable consumption is traceable without counters (review finding RT4) — self-service subscription remaining V1; payment delinquency (FR-ADM-11) stays V1 because at MVP the pilots' SaaS billing (small headcount, close commercial follow-up) does not justify automating the move to read-only, a sensitive mechanism deferred to generalization — deviations from §12 recorded here, per INV-38. To be confirmed in review. |
| OQ-02 | Delay before moving to read-only on payment delinquency. | The baseline says "read-only mode after a delay" without fixing the delay. Proposal: graduated reminders from the due date, moving to "past due" 15 days after the unpaid due date; a platform-level configurable value. To be confirmed by the founder. |
| OQ-03 | Exact scope of read-only mode when past due. | Adopted proposal: writes blocked, viewing and exports retained, and operational safety functions (same-day absence notification) remain in effect until cancellation, so as never to degrade student safety. To be confirmed in review (collections/safety trade-off). |
| OQ-04 | Reactivation after cancellation. | The baseline says nothing about reactivation. Proposal: reactivation possible during the 90-day read-only period with no data loss; between 90 days and 12 months, restoration from the export via a controlled support operation; after deletion at 12 months, re-registration as a new school. To be confirmed by the founder. |
| OQ-05 | Proration rule for the "active student" count. | **Resolved — ARB-20c**: a student is counted if their enrollment is ACTIVE at midnight on the 1st of the month, `Africa/Casablanca` time (PAK-04); entries and exits during the month are picked up at the next count; a transferred student is counted once, in the month of transfer, at the originating school. A mid-year pilot's September count is run retroactively on the imported effective dates (FR-INS-27), with pilot billing governed by their agreement (`prd/cross-cutting/33-business-model-packaging.md`). |
| OQ-06 | Baseline update on the time zone. | **Escalated — ESC-03** (`prd/cross-cutting/42-review-arbitrations.md`): this chapter configures `Africa/Casablanca` at permanent UTC+0 (Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026); "lighter Ramadan hours" remains a timetable variant owned by `prd/modules/12-academic-structure-timetables.md`. The corresponding update to `PROJECT.md` is grouped under ESC-03. |
| OQ-07 | WhatsApp pricing shift of 01/10/2026. | Baseline/research divergence: the baseline (H-20, DEC-36) announced a change "on October 1, 2026"; the research specifies the end of free service/utility messages within the 24-hour window and Morocco's exit from "Rest of Africa" regional pricing (Meta announcement of 01/07/2026). Channel configuration (FR-ADM-09) and packs (FR-ADM-15) must absorb a dated shift parameter and also budget for inbound replies. To be consolidated in `prd/cross-cutting/35-external-integrations.md`. |
| OQ-08 | Logging: MVP scope. | **Resolved — ARB-25j (D4)**: at MVP, immutable, record-level history of administration entries; the sensitive-access log and audit-log export (RG-38, 5-year retention) at V1 (§12). FR-ADM-16 reworded; SEC-11 and PER-10 aligned on the same position. |
| OQ-09 | WhatsApp at MVP. | **Resolved — D1, ARB-21, ARB-25c**: at MVP, "utility" WhatsApp limited to attendance notifications under express opt-in (which also serves as the basis for the cross-border transfer, with explicit mention at collection), minimal templates, a single ZSchool WhatsApp Business account; no push notification at MVP; generalized at V1. FR-ADM-09, ECR-ADM-05 and §8 aligned; the 01/10/2026 pricing shift remains handled in OQ-07. |
| OQ-10 | The school directory at MVP. | **Resolved — D6, ARB-22**: minimal read-only directory (name, city, cycles) as MVP Must; a hidden school remains selectable as a transfer destination via exact search; additional fields and publication management at V1, network and applications at V2+. FR-ADM-17 is the single owner, FR-CAR-14 cross-references it. |
| OQ-11 | MVP scope of the organization. | **Resolved — ARB-01**: the "multi-site group" pilot (DEC-35) requires at MVP the organization's creation, attaching tenants, and a read-only consolidated dashboard (FR-ADM-04, FR-RAP-09); shared administration and group billing at V1. Extending the MVP scope is to be confirmed by the founder (ESC-02). |

---

## 12. Traceability

Table mapping baseline IDs to the requirements in this file that cover them.

| Baseline ID | Coverage |
|---|---|
| §5.1 (ZSchool operator actor) | FR-ADM-01, FR-ADM-02, FR-ADM-16 |
| §6.6 / RG-21 | FR-ADM-01, FR-ADM-04, FR-ADM-17; isolation restated in each tenant requirement |
| §6.6 / RG-22 | FR-ADM-03, ECR-ADM-01 |
| §6.6 / RG-23 | FR-ADM-17 |
| §6.7 / RG-24 | FR-ADM-05 (template instantiation; structural detail: `prd/modules/12-academic-structure-timetables.md`) |
| §6.7 / RG-25 | FR-ADM-05 (year-N+1 cloning cross-reference) |
| §7.1 / G-06 | FR-ADM-01, FR-ADM-02, FR-ADM-05, FR-ADM-10, FR-ADM-11, FR-ADM-12 |
| §7.1 / G-18 | FR-ADM-06, ECR-ADM-03 |
| G-33 | FR-ADM-13 |
| §6.5 / RG-18, RG-19 | FR-ADM-07 |
| §8 / RG-37, RG-38, RG-39 | FR-ADM-07 (standard roles and fine-grained permissions), FR-ADM-16 (logging) |
| §8.1 / G-32 | FR-ADM-16 (ticket-tracked support access) |
| §9 | FR-ADM-02 (rate limiting), FR-ADM-07 (MFA), FR-ADM-16 (audit log) |
| §11 (business model) | FR-ADM-10 (trial), FR-ADM-11 (delinquency), FR-ADM-12 (cancellation), FR-ADM-14 (active student — detailed rule PAK-04), FR-ADM-15 (consumables); OQ-05 |
| §12 (scope by version) | "Version" column of each requirement; OQ-01 for the MVP justification of the trial cycle, counting and pack counters; OQ-08 to OQ-10 for version arbitrations (logging, WhatsApp, directory) |
| RG-04, RG-05, INV-01, INV-02 | FR-ADM-06 (duplicate control during imports; matching owned by `prd/modules/11-admissions-enrollment-reenrollment.md`) |
| RG-10, INV-43 | FR-ADM-12, FR-ADM-13 (closures with reason; transfers without identity duplication) |
| RG-28, INV-20, INV-38 | FR-ADM-12, FR-ADM-13 (access retained to published documents after cancellation or closure) |
| DEC-02 | FR-ADM-01, FR-ADM-04 |
| DEC-10 | FR-ADM-08 |
| DEC-11 | FR-ADM-06, FR-ADM-07 |
| DEC-12, DEC-36 | FR-ADM-09, FR-ADM-15; OQ-07 |
| DEC-13, DEC-28 | FR-ADM-10, FR-ADM-14, FR-ADM-15 |
| DEC-22 | FR-ADM-13 (retention before deletion) |
| DEC-23 / Q-05 / INV-38 | FR-ADM-11, FR-ADM-12, FR-ADM-13 |
| DEC-32 | FR-ADM-13 (leaving files) |
| DEC-30 | Section 8 (image stamp; electronic stamp owned by documents) |
| §2.4, §2.5 | FR-ADM-05 (year, periods, grading scales, preloaded calendar) |
| §2.7 | FR-ADM-03 (legal and tax entries) |
| §2.9 | FR-ADM-03, FR-ADM-08 (dual script, bilingualism) |
| §2.10 | FR-ADM-09 (channels, opt-in, SMS fallback) |
| §10 (NFR) | Section 9 |
| H-04, H-22 | FR-ADM-06 (Massar file channel); section 5 (MOWAKABA, eligibility unconfirmed) |
| Research corrections (points 1, 6, 20 of `prd/research/00-baseline-corrections.md`) | FR-ADM-05 and OQ-06 (permanent UTC+0 time zone); FR-ADM-09, FR-ADM-15 and OQ-07 (WhatsApp); section 5 (MOWAKABA) |
| Express start-of-year path (review finding) | FR-ADM-19; time target proposed to `prd/cross-cutting/38-kpi-success-metrics.md` |
| ARB-01 (pilot MVP scope) | FR-ADM-04 (read-only consolidated organization); OQ-11 |
| ARB-02 (mid-year catch-up) | FR-ADM-05, FR-ADM-06, §3 (onboarding windows); FR-INS-27 in `prd/modules/11-admissions-enrollment-reenrollment.md` |
| ARB-07, ARB-08 (login identifier, number change and reassignment) | FR-ADM-20; ECR-ADM-07; INV-45 |
| ARB-09 (guardian matching) | FR-ADM-06 |
| ARB-20c (counting at transfer) | FR-ADM-14; OQ-05 |
| ARB-21 (channels, per-person language, ZSchool-borne OTP) | FR-ADM-08, FR-ADM-09, FR-ADM-15; OQ-09 |
| ARB-22 (directory and transfers) | FR-ADM-13, FR-ADM-17; OQ-10 |
| ARB-25a, j, k, l, m, o (CNIE, D4 logging, support, MFA, dual control, quota) | §5; FR-ADM-06, FR-ADM-07, FR-ADM-15, FR-ADM-16; OQ-08 |
