> **Document Control**
>
> | Property       | Value                                                                                                                                                                                                                                       |
> | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-01                                                                                                                                                                                                                              |
> | Revision       | 1.0                                                                                                                                                                                                                                         |
> | Effective Date | 2026-09-09                                                                                                                                                                                                                                  |
> | Status         | Draft                                                                                                                                                                                                                                       |
> | Author         | ZSchool Product                                                                                                                                                                                                                             |
> | Classification | Functional Specification                                                                                                                                                                                                                    |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/10-administration-onboarding-subscription.md` (v0.3), old `FR-ADM-01..20` -> `BEH-ZS-001..020`, old `ECR-ADM-01..07` -> `SCR-ZS-001..007`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Administration, Onboarding and Subscription (ADM)

The ADM module is the platform's front door: it puts a school into production cleanly and quickly, then governs its day-to-day administration and the subscription's contractual lifecycle. It covers the full cycle: tenant creation (isolated, [INV-ZS-073](../invariants.md#inv-zs-073), [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md)), maintaining the legal information record ([INV-ZS-074](../invariants.md#inv-zs-074)), a setup wizard that instantiates an academic structure from the templates provided ([INV-ZS-076](../invariants.md#inv-zs-076)), bulk import of existing data with duplicate control and an error report (historical baseline gap G-18, `spec/appendices/01-review-history.md`), management of internal users and their roles, language and channel configuration, subscription lifecycle (trial, active, past due, cancelled — [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)), a school closure procedure (historical baseline gap G-33), counting the "active student" for SaaS billing (§10, [ADR-ZS-024](../decisions/024-school-is-the-paying-customer.md), [ADR-ZS-009](../decisions/009-single-plan-pricing.md)), and managing consumable packs.

## 1. Objective and Scope

### 1.1 In Scope

| Scope item                                                                                                                                                                                                                                                                          | Version |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Tenant creation via ZSchool provisioning                                                                                                                                                                                                                                            | MVP     |
| School legal information record ([INV-ZS-074](../invariants.md#inv-zs-074))                                                                                                                                                                                                         | MVP     |
| Setup wizard (structure template, school year, terms, grading scales, initial fee schedule)                                                                                                                                                                                         | MVP     |
| Bulk Excel import (students, guardians, teachers, classes, current-term and historical grades) with error report                                                                                                                                                                    | MVP     |
| Mid-year catch-up: importing partially paid installment schedules, cheques on hand, and aggregated absences; activating enrollments via import (`BEH-ZS-047` in `spec/behaviors/02-admissions-enrollment-reenrollment.md`, [ADR-ZS-043](../decisions/043-mid-year-data-reprise.md)) | MVP     |
| Managing internal users, standard roles and affiliations                                                                                                                                                                                                                            | MVP     |
| Language configuration (FR/AR, RTL) and notification channels (in-app, SMS, WhatsApp "presence" utility)                                                                                                                                                                            | MVP     |
| Subscription lifecycle: trial, activation, simplified trial exit                                                                                                                                                                                                                    | MVP     |
| Mobile number change, access recovery, handling a recycled number ([ADR-ZS-049](../decisions/049-number-change-loss-reassignment.md))                                                                                                                                               | MVP     |
| ZSchool support access via ticket with explicit director approval ([ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md))                                                                                                                                    | MVP     |
| Counting the "active student" and usage statement                                                                                                                                                                                                                                   | MVP     |
| Express start-of-year path (onboarding subset unblocking roll call, front-desk enrollment and notifications)                                                                                                                                                                        | MVP     |
| Administration operations log                                                                                                                                                                                                                                                       | MVP     |
| Online self-registration with validation                                                                                                                                                                                                                                            | V1      |
| Organization (school group): creation, attaching schools, read-only consolidated dashboard ([ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md))                                                                                                                             | MVP     |
| Organization: shared administration (shared users and settings), SaaS billing at the organization level                                                                                                                                                                             | V1      |
| Subscription payment delinquency and read-only mode                                                                                                                                                                                                                                 | V1      |
| Cancellation: full export, 90-day read-only period, deletion at 12 months                                                                                                                                                                                                           | V1      |
| School closure procedure                                                                                                                                                                                                                                                            | V1      |
| Consumable packs: counters, alert thresholds, consumption history, storage quota ([ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md))                                                                                                                     | MVP     |
| Self-service subscription and purchase of consumable packs                                                                                                                                                                                                                          | V1      |
| Minimal school directory (read: name, city, cycles)                                                                                                                                                                                                                                 | MVP     |
| Directory: additional fields (education systems, website) and publication management                                                                                                                                                                                                | V1      |
| Tenant administration API                                                                                                                                                                                                                                                           | V2+     |

### 1.2 Out of Scope (cross-references)

| Out of scope for ADM                                                                                         | Owning file                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Creation and claiming of global identities, Massar matching, profile merges, guardian qualities              | `spec/behaviors/02-admissions-enrollment-reenrollment.md` (events `ProbableDuplicateDetected`, `IdentityClaimed`, `IdentityCorrected`, `MergeCompleted` are described there) |
| Detailed academic structure (sections, cycles, levels, subjects, coefficients, timetables, year-N+1 cloning) | `spec/behaviors/03-academic-structure-timetables.md`                                                                                                                         |
| Import of historical grades and Massar exports (formats, compliance)                                         | `spec/behaviors/05-assessments-grades-report-cards.md`, `spec/behaviors/12-massar-regulatory-exports.md`                                                                     |
| School fee schedule, payment schedules, collections, compliant invoices                                      | `spec/behaviors/07-finance-billing-collections.md`                                                                                                                           |
| Message content and templates, parent–teacher threads, detailed routing                                      | `spec/behaviors/08-communication-notifications.md`                                                                                                                           |
| Student transfers and leaving files                                                                          | `spec/behaviors/09-transfers-mobility.md`                                                                                                                                    |
| Detailed permissions and fine-grained role matrix                                                            | `spec/cross-cutting/01-permissions.md` (Phase 4)                                                                                                                             |
| Pricing, single plan, pack composition and service offerings (onboarding, migration, premium support)        | `spec/cross-cutting/04-business-model-packaging.md` (Phase 4)                                                                                                                |
| Electronic signature, stamps, CNDP compliance, technical audit log                                           | `spec/cross-cutting/02-security-privacy.md` (Phase 4), `spec/cross-cutting/07-legal-compliance-data-protection.md` (Phase 4)                                                 |

## 2. Users and Use Cases

| Actor                           | Main use cases in ADM                                                                                                                                                                            | Related needs                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| ZSchool super-administrator     | Provision a tenant, validate a self-registration, drive subscription states, trigger exports and deletions, access a tenant on a tracked ticket                                                  | (historical G-06; §8.1)                                                                                                                  |
| School director / administrator | Complete the legal record, run the setup wizard, launch imports, manage users and roles, configure languages and channels, monitor subscription and usage, request cancellation or run a closure | [URS-ZS-004](../urs.md), [URS-ZS-007](../urs.md); ([INV-ZS-074](../invariants.md#inv-zs-074), [INV-ZS-076](../invariants.md#inv-zs-076)) |
| Group administrator (V1)        | Create the organization, attach schools, manage shared users and settings, view consolidated usage                                                                                               | ([INV-ZS-073](../invariants.md#inv-zs-073), [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md), §10)                           |
| Front office                    | Review and correct import reports, invite users, enter delegated fields on the school record                                                                                                     | [URS-ZS-010](../urs.md), [URS-ZS-017](../urs.md); (historical G-18)                                                                      |
| Teacher, staff                  | Accept an affiliation invitation, activate their account                                                                                                                                         | ([INV-ZS-070](../invariants.md#inv-zs-070))                                                                                              |
| Parent, student (indirect)      | Beneficiaries of language and channel configuration; notification recipients; retain access to their published documents after cancellation or closure                                           | ([INV-ZS-080](../invariants.md#inv-zs-080), [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md))                 |
| ZSchool support                 | Assist onboarding, run supported imports, handle tracked temporary-access tickets                                                                                                                | (§8.1, [INV-ZS-090](../invariants.md#inv-zs-090))                                                                                        |

## 3. Key User Journeys

Cross-reference to the journeys in `spec/journeys/00-journey-map.md` (built in Phase 3); this chapter does not duplicate the steps.

| Journey                                                                     | Role of the ADM module                                                                                                                                                                                               |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JMP-ZS-003 — Onboarding a school (tenant, structure template, Excel import) | Owner: tenant creation, legal record, wizard, imports, users and roles, subscription lifecycle. Owning personas: `spec/journeys/01-school-group-director.md` (DIR) and `spec/journeys/02-secretary-cashier.md` (SEC) |
| JMP-ZS-004 — A parent claims an identity                                    | Supporting: the module issues invitations and prepares internal accounts; identity matching is owned by `spec/behaviors/02-admissions-enrollment-reenrollment.md`                                                    |
| JMP-ZS-009 — Inter-school transfers and leaving files                       | Supporting: closing a school (BEH-ZS-013) triggers bulk transfers handled by `spec/behaviors/09-transfers-mobility.md`                                                                                               |
| JMP-ZS-011 — Communication                                                  | Supporting: channel configuration (BEH-ZS-009) feeds the routing described in `spec/behaviors/08-communication-notifications.md`                                                                                     |

Seasonality: onboarding is a one-off event per school with two windows (JMP-ZS-003, [ADR-ZS-043](../decisions/043-mid-year-data-reprise.md)): the back-to-school window (April to August, import before the start of the school year) and the mid-year catch-up window (case of pilots activated from 01/02/2027, [RDM-ZS-001](../roadmap.md), catching up on data already produced since September); back-to-school imports (September) form a bulk-processing peak that must be absorbed at target scale (see section 9).

## 4. Functional Behaviors

| ID         | Title                                                                | Priority | Version        |
| ---------- | -------------------------------------------------------------------- | -------- | -------------- |
| BEH-ZS-001 | Create a school's tenant via ZSchool provisioning                    | Must     | MVP            |
| BEH-ZS-002 | Allow a school to self-register with validation                      | Should   | V1             |
| BEH-ZS-003 | Maintain the school's legal information record                       | Must     | MVP            |
| BEH-ZS-004 | Administer an organization (school group)                            | Must     | MVP / V1       |
| BEH-ZS-005 | Run the setup wizard                                                 | Must     | MVP            |
| BEH-ZS-006 | Bulk-import existing data from Excel                                 | Must     | MVP            |
| BEH-ZS-007 | Manage internal users and their roles                                | Must     | MVP            |
| BEH-ZS-008 | Configure languages and bilingualism                                 | Must     | MVP            |
| BEH-ZS-009 | Configure communication channels                                     | Must     | MVP            |
| BEH-ZS-010 | Manage the subscription trial and activation                         | Must     | MVP            |
| BEH-ZS-011 | Handle subscription payment delinquency                              | Must     | V1             |
| BEH-ZS-012 | Cancel the subscription with full export and delayed deletion        | Must     | V1             |
| BEH-ZS-013 | Manage the closure of a school                                       | Should   | V1             |
| BEH-ZS-014 | Count active students and present usage                              | Must     | MVP            |
| BEH-ZS-015 | Manage consumable packs                                              | Must     | MVP / V1       |
| BEH-ZS-016 | Log administration operations                                        | Must     | MVP / V1       |
| BEH-ZS-017 | Publish the minimal public school directory                          | Must     | MVP / V1 / V2+ |
| BEH-ZS-018 | Offer a tenant administration API                                    | Could    | V2+            |
| BEH-ZS-019 | Offer an express start-of-year path                                  | Must     | MVP            |
| BEH-ZS-020 | Change a mobile number, recover access, and handle a recycled number | Must     | MVP            |

### BEH-ZS-001: Create a school's tenant via ZSchool provisioning

> **Invariant:** [INV-ZS-073](../invariants.md#inv-zs-073)
> **See:** [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-006`](../../features/adm/beh-zs-001-tenant-provisioning.feature)

REQUIREMENT: The system MUST let a ZSchool super-administrator create a school's tenant from minimal input (bilingual name, city, director contact, internal reference), MUST isolate it per INV-ZS-073 so no other school's data is visible from it, and MUST log the operation.

The ZSchool team (super-administrator) creates a school's tenant: minimal input (name in Arabic and French, city, director contact, internal tenant reference), choice of the initial subscription status (trial with demo data, or active), optional attachment to an existing organization (V1), creation and dispatch of the invitation for the first director-administrator account.

### BEH-ZS-002: Allow a school to self-register with validation

> **Priority:** Should
> **Version:** V1

REQUIREMENT: The system MUST require human validation by the ZSchool team before any self-registered tenant is created, and MUST cross-check the request against existing schools (authorization number, ICE, known contact) before that validation.

A director can submit an online registration request for their school: bilingual name, city, address, authorization number, AREF affiliation, ICE, estimated headcount, director contact. No tenant is created automatically. The applicant is informed of the processing time and the status of their request. The form is protected against abuse (rate limiting, §9).

### BEH-ZS-003: Maintain the school's legal information record

> **Invariant:** [INV-ZS-074](../invariants.md#inv-zs-074)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-007`](../../features/adm/beh-zs-003-legal-record.feature)

REQUIREMENT: The system MUST hold the school's legal record per INV-ZS-074 (dual-script name, authorization, AREF/provincial affiliation, ICE/IF/RC/patente, CNSS, addresses, logo/stamp, signatories, bank details), MUST flag missing mandatory fields before issuing official documents, and MUST log every change with author, timestamp, and before/after value.

Fields required for billing and official documents (ICE/IF/RC/patente mentions, header with authorization number, stamp and signatories on report cards and certificates) are marked mandatory and checked for format and completeness. Values propagate to invoices (`spec/behaviors/07-finance-billing-collections.md`) and documents (`spec/behaviors/06-documents-certificates.md`). A single legal entity may operate several schools with distinct authorizations: ICE uniqueness across tenants is not enforced.

### BEH-ZS-004: Administer an organization (school group)

> **Invariant:** [INV-ZS-073](../invariants.md#inv-zs-073)
> **See:** [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md), [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)
> **Priority:** Must
> **Version:** MVP (organization creation, attaching tenants, read-only consolidated dashboard); V1 (shared administration, organization-level billing)
> **Acceptance:** [`@REQ-ZS-008`](../../features/adm/beh-zs-004-organization.feature)

REQUIREMENT: The system MUST let a group administrator create an organization, attach and detach schools to it, and MUST provide consolidated views without ever merging tenant data (INV-ZS-073).

**At MVP** ([ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md), "multi-site group" pilot, [URS-ZS-001](../urs.md)): organization creation by ZSchool, attaching and detaching tenants, appointing group administrators, a read-only consolidated dashboard (`spec/behaviors/11-dashboards-reporting.md`, headcount/attendance/arrears by site), and a consolidated usage statement (BEH-ZS-014). **At V1**: shared administration (managing shared users, roles and settings), SaaS billing established at the organization level for attached schools (§10). Creating, attaching and detaching a school are logged and never compromise data isolation.

### BEH-ZS-005: Run the setup wizard

> **Invariant:** [INV-ZS-076](../invariants.md#inv-zs-076), [INV-ZS-077](../invariants.md#inv-zs-077)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-009`](../../features/adm/beh-zs-005-setup-wizard.feature)

REQUIREMENT: The system MUST guide the director through a saved, resumable six-step onboarding wizard (structure template, school year and periods, grading scales, initial fee schedule, import, user invitations) and MUST show a continuously updated production-readiness checklist.

(1) choice of a structure template among those provided by ZSchool — Moroccan national system by default, French curriculum, international — then instantiation and customization of sections, cycles, levels and tracks (INV-ZS-076); (2) creating the school year with evaluation periods and preloading the ministry's calendar with movable religious holidays marked "to confirm"; (3) default grading scales and computation rules — detailed structure and year-N+1 cloning belong to `spec/behaviors/03-academic-structure-timetables.md`; (4) initial fee schedule (`spec/behaviors/07-finance-billing-collections.md`); (5) importing existing data (BEH-ZS-006); (6) inviting internal users (BEH-ZS-007). The time zone is fixed to `Africa/Casablanca` at permanent UTC+0 (see OQ-ZS-036 in `spec/open-questions.md`).

### BEH-ZS-006: Bulk-import existing data from Excel

> **Invariant:** [INV-ZS-054](../invariants.md#inv-zs-054), [INV-ZS-055](../invariants.md#inv-zs-055), [INV-ZS-021](../invariants.md#inv-zs-021), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md), [ADR-ZS-043](../decisions/043-mid-year-data-reprise.md), [ADR-ZS-050](../decisions/050-guardian-matching-rules.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-010`](../../features/adm/beh-zs-006-bulk-import.feature)

REQUIREMENT: The system MUST import bulk data (students, guardians, teachers, classes, grades) through a three-step analysis → error report → explicit commit sequence, MUST never write a record before explicit commit, and MUST make an import replayable without creating duplicates.

The school imports its initial data via Excel files (downloadable templates, bilingual, with instructions and an example) by domain: students (bilingual identity, Massar code, date of birth, level, class, enrollment effective date); guardians (identity, mandatory mobile number in international E.164 format — [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md); relationship type and qualities, including at least one legal guardian and one financial guardian per student, INV-ZS-021; the CNIE number is not imported at MVP); teachers; classes; current-term and historical grades. **Mid-year catch-up** ([ADR-ZS-043](../decisions/043-mid-year-data-reprise.md)): the "finance" domain imports each student's payment schedule with amounts already paid, cheques on hand, and discounts granted; the "attendance" domain optionally imports absences aggregated by student and period. **Guardians** ([ADR-ZS-050](../decisions/050-guardian-matching-rules.md)): intra-file deduplication by mobile number; a mobile number already tied to a platform account is offered for matching, never created anew; identical first name + last name + date of birth produces an alert without matching. **Exit state**: students imported with an effective date already reached receive an ACTIVE enrollment via import activation (`BEH-ZS-047`); the others are created PRE-ENROLLED. Processing happens in three steps: (1) a non-committal analysis; (2) a downloadable, line-by-line error report distinguishing creatable rows, proposed strong matches (identical Massar code, never enforced, INV-ZS-055), probable-duplicate alerts (weak match, INV-ZS-055), and rows in error; (3) explicit commit after correction. The result gives counts of created, matched, flagged, errored, and skipped rows; the report is archived and the operation logged (INV-ZS-090). Identities produced by the import follow the model's matching and deduplication rules (INV-ZS-006, INV-ZS-005) described in `spec/behaviors/02-admissions-enrollment-reenrollment.md`.

### BEH-ZS-007: Manage internal users and their roles

> **Invariant:** [INV-ZS-053](../invariants.md#inv-zs-053), [INV-ZS-070](../invariants.md#inv-zs-070), [INV-ZS-071](../invariants.md#inv-zs-071), [INV-ZS-089](../invariants.md#inv-zs-089), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-011`](../../features/adm/beh-zs-007-internal-users.feature)

REQUIREMENT: The system MUST create every internal affiliation as an invitation that becomes active only once both parties accept (INV-ZS-070), MUST revoke access immediately on closure while keeping data attributed to its author (INV-ZS-071), and MUST require MFA from MVP for director, academic-leadership, administrator, accounting and system-administrator roles.

The director (or delegated administrator) creates and manages the school's internal affiliations: directors, academic leadership, front office, accounting, head supervisor and supervisors, infirmary, transport, library, system administrator, teachers. The primary contact identifier is the mobile phone number ([ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md)), email being optional. ZSchool provides standard roles composed of fine-grained permissions by module and scope, customizable by the school (INV-ZS-089); the detailed matrix is owned by `spec/cross-cutting/01-permissions.md` (Phase 4). Two-factor authentication is optional for teachers and supervisors, with trusted devices recognized for 90 days (§9; SEC-ZS-005, SEC-ZS-006, PER-ZS-018 aligned). The local system administrator cannot create or reset a director-role account (dual control). Any grant, suspension or closure is logged (INV-ZS-090). A single account may carry several profiles and switch context (INV-ZS-053); accounts are never shared between two people.

### BEH-ZS-008: Configure languages and bilingualism

> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-012`](../../features/adm/beh-zs-008-languages.feature)

REQUIREMENT: The system MUST support a school default interface language and a per-user personal preference, MUST offer full French/Arabic with complete right-to-left support, and MUST require dual-script (Latin and Arabic) entry of first and last names on identity forms.

Institutional content (message templates, school announcements, official documents) is bilingual; individual messages and parent–teacher threads render in the author's own language as-is (UX-ZS in `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md` (Phase 4)), with assisted translation as a V2+ option owned by `spec/behaviors/08-communication-notifications.md`. English as an interface language is out of scope for MVP and V1.

### BEH-ZS-009: Configure communication channels

> **See:** [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md), [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-013`](../../features/adm/beh-zs-009-channel-configuration.feature)

REQUIREMENT: The system MUST let the school configure notification channels and their routing by message type, MUST provide in-app and SMS at MVP complemented by opt-in "utility" WhatsApp limited to attendance notifications, and MUST track per-channel consumption counters.

At V1, generalized WhatsApp (all message types, managed templates) and push notifications complete the choices (§10, [ADR-ZS-023](../decisions/023-notification-channel-priority.md)), with email remaining secondary. Configuration includes: per-channel activation, fallback order by message type (SMS fallback for households without a smartphone or internet), sending windows and hours, WhatsApp consent management (prior parental opt-in, opposition, Law 09.08 and CNDP-ANRT 2019 guidance), and tracking of consumption counters (BEH-ZS-015). Message templates and the delivery engine are owned by `spec/behaviors/08-communication-notifications.md`; this module owns only the school's configuration.

### BEH-ZS-010: Manage the subscription trial and activation

> **See:** [ADR-ZS-009](../decisions/009-single-plan-pricing.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-014`](../../features/adm/beh-zs-010-trial-activation.feature)

REQUIREMENT: The system MUST create a subscription in "trial" or "active" status on tenant creation, MUST notify the director before trial expiry, and MUST offer a simplified trial exit (30 days read-only, export, then purge) when no activation or extension occurs.

At expiry: conversion to "active" (single plan, [ADR-ZS-009](../decisions/009-single-plan-pricing.md); demo data is purged and the school proceeds with its real import), a request for extension handled by ZSchool, or simplified trial exit. Real data entered during a trial is retained upon activation. The status change is logged and the director is notified.

### BEH-ZS-011: Handle subscription payment delinquency

> **See:** [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-015`](../../features/adm/beh-zs-011-payment-delinquency.feature)

REQUIREMENT: The system MUST move an unpaid subscription to "past due" (write operations blocked, viewing and exports possible) after a configured delay, MUST keep operational safety functions (same-day absence notification) in effect regardless of delinquency, and MUST restore write access immediately with no data loss once payment is recorded.

This clause covers exclusively the school's unpaid SaaS invoice; it has no bearing on students' official documents, which are never blocked for school-fee arrears (`spec/behaviors/02-admissions-enrollment-reenrollment.md`, `spec/behaviors/06-documents-certificates.md`).

### BEH-ZS-012: Cancel the subscription with full export and delayed deletion

> **Invariant:** [INV-ZS-045](../invariants.md#inv-zs-045), [INV-ZS-060](../invariants.md#inv-zs-060), [INV-ZS-080](../invariants.md#inv-zs-080)
> **See:** [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-016`](../../features/adm/beh-zs-012-cancellation.feature)

REQUIREMENT: The system MUST, on cancellation, produce a full export before any deletion, MUST hold the tenant in 90-day read-only before any purge, MUST delete only operational data at 12 months while retaining global identities and published-document access, and MUST close active enrollments and affiliations with a dedicated reason.

Cancellation is initiated at the school's request (confirmed by a second validation) or by ZSchool. Effects, per [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md) and INV-ZS-045: (1) full export via a secure, time-limited link; (2) "cancelled" status, 90 days read-only; (3) closing active enrollments with reason "subscription cancellation" (INV-ZS-060; COMPLETED with a decision if at year end, WITHDRAWN mid-year, so the student's global history never shows a "student departure") and closing affiliations; (4) 12 months after cancellation, deletion of operational data, retaining global identities and published-document access (INV-ZS-080, INV-ZS-033); (5) director notification at each step (`SubscriptionSuspendedOrTerminated`); (6) updating the public directory (BEH-ZS-017).

### BEH-ZS-013: Manage the closure of a school

> **Invariant:** [INV-ZS-060](../invariants.md#inv-zs-060), [INV-ZS-080](../invariants.md#inv-zs-080), [INV-ZS-075](../invariants.md#inv-zs-075)
> **See:** [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md), [ADR-ZS-003](../decisions/003-default-retention-durations.md), [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-017`](../../features/adm/beh-zs-013-school-closure.feature)

REQUIREMENT: The system MUST support closing a school as a dedicated procedure distinct from commercial cancellation, MUST block new enrollments immediately, MUST close active enrollments with the dedicated reason "school closure" and produce leaving certificates/files in bulk, and MUST transfer students to other schools on the same global identity without ever duplicating an identity.

Closing a school (voluntary closure, non-renewal or withdrawal of ministerial authorization, merger within a group) reuses cancellation's export and retention mechanisms ([ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)): recording the reason and date; blocking new enrollments; controlled closing of active enrollments (INV-ZS-060) with leaving certificates/files (`spec/behaviors/09-transfers-mobility.md`, [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md)); bulk transfers to other schools on the same global identity (no identity is ever duplicated); full export; updating the public directory (BEH-ZS-017); retaining data-subject access (INV-ZS-080) and applying retention periods ([ADR-ZS-003](../decisions/003-default-retention-durations.md)) then deletion timelines ([ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)).

### BEH-ZS-014: Count active students and present usage

> **See:** [ADR-ZS-024](../decisions/024-school-is-the-paying-customer.md), [ADR-ZS-009](../decisions/009-single-plan-pricing.md), PAK-ZS-010
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-018`](../../features/adm/beh-zs-014-active-student-count.feature)

REQUIREMENT: The system MUST count "active students" each month from September to June as a headcount of ACTIVE-status enrollments at a fixed monthly count date, MUST count a student transferred between two tenants once, in the month of transfer, at the originating school, and MUST keep an append-only count history.

The SaaS billing unit for the single plan (§10, [ADR-ZS-024](../decisions/024-school-is-the-paying-customer.md), [ADR-ZS-009](../decisions/009-single-plan-pricing.md)). Counting rule detailed in PAK-ZS-010 (`spec/cross-cutting/04-business-model-packaging.md` (Phase 4) §3: count on the 1st of the month at midnight `Africa/Casablanca` time, only ACTIVE enrollments counted, append-only history in `UsageMetric`). The director (and the group administrator) can view a usage statement at any time: active students for the month and 10-month history, forecast, SMS/WhatsApp/storage consumption; the statement is exportable.

### BEH-ZS-015: Manage consumable packs

> **See:** [ADR-ZS-009](../decisions/009-single-plan-pricing.md), PAK-ZS-016
> **Priority:** Must
> **Version:** MVP (counters, alert thresholds, consumption history); V1 (self-service pack subscription and purchase)
> **Acceptance:** [`@REQ-ZS-019`](../../features/adm/beh-zs-015-consumable-packs.feature)

REQUIREMENT: The system MUST maintain per-channel counters, configurable alert thresholds, and a consumption history for consumable packs (SMS, WhatsApp, storage beyond quota), MUST never silently lose a critical notification when a channel is exhausted, and MUST never deduct authentication SMS (OTP, MFA, reset, invitations) from a school's packs.

Each school has per-channel counters, thresholds (director notified when crossed), and a consumption history with cost per send. When a prepaid channel is exhausted: that channel is suspended with fallback to available channels and an immediate alert to the director; failure status remains visible in delivery tracking. Included document storage quota is set at MVP to 2 GB per school plus 5 MB per active student, to be costed in `spec/cross-cutting/04-business-model-packaging.md` (Phase 4) (PAK-ZS-016); exceeding it triggers an alert then billing beyond the quota. Authentication SMS cost is borne by ZSchool. Pack composition and pricing are owned by `spec/cross-cutting/04-business-model-packaging.md` (Phase 4).

### BEH-ZS-016: Log administration operations

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **Priority:** Must
> **Version:** MVP (entry history); V1 (immutable, exportable audit log)
> **Acceptance:** [`@REQ-ZS-020`](../../features/adm/beh-zs-016-administration-log.feature)

REQUIREMENT: The system MUST log every administration operation (tenant creation/configuration, legal-record changes, imports, role grants/suspensions/closures, subscription status changes, exports/deletions, support access) with author, context, timestamp, and before/after values where applicable, and MUST require the director's explicit in-app approval before any ZSchool support access to a tenant.

At MVP, logging ensures immutable, record-level history of administration entries; the sensitive-access log and audit-log export ship at V1 (§10). Support access happens only via ticket (`SupportTicket`, MVP), for a bounded duration, and tracked (§8.1). The technical aspects of the log (immutability, 5-year retention, export) are owned by `spec/cross-cutting/02-security-privacy.md` (Phase 4).

### BEH-ZS-017: Publish the minimal public school directory

> **Invariant:** [INV-ZS-075](../invariants.md#inv-zs-075), [INV-ZS-002](../invariants.md#inv-zs-002)
> **See:** [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)
> **Priority:** Must
> **Version:** MVP (minimal read-only directory); V1 (additional fields, publication management); V2+ (network, applications)
> **Acceptance:** [`@REQ-ZS-021`](../../features/adm/beh-zs-017-public-directory.feature)

REQUIREMENT: The system MUST maintain a minimal, read-only school directory strictly limited to name/city/cycles (INV-ZS-075, INV-ZS-002), MUST let the director hide their school from browsing while keeping it selectable as a transfer destination via exact name search, and MUST log publishing/editing/hiding.

Needed for transfer procedures from MVP (`spec/behaviors/09-transfers-mobility.md`). A hidden school remains selectable as a transfer destination via an exact name search ([ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md): otherwise the family is pushed toward the "outside ZSchool" path and an identity gets duplicated). Every other field on the record stays private. `spec/behaviors/10-teacher-career-network.md` cross-references this directory. At V1: additional fields and fine-grained publication management; professional-network and application features wait for V2+.

### BEH-ZS-018: Offer a tenant administration API

> **Priority:** Could
> **Version:** V2+

REQUIREMENT: When delivered, the tenant administration API MUST be authenticated, scoped to authorized areas, and logged like any write operation (INV-ZS-090).

A documented API lets a school (or its organization) programmatically drive administration functions: viewing usage and counters, managing users and roles, triggering and tracking exports, viewing subscription status. Delivered with the roadmap's "public API" wave (§10). External integrations (messaging, payment) remain owned by `spec/cross-cutting/06-external-integrations.md` (Phase 4).

### BEH-ZS-019: Offer an express start-of-year path

> **Invariant:** [INV-ZS-076](../invariants.md#inv-zs-076), [INV-ZS-070](../invariants.md#inv-zs-070)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-022`](../../features/adm/beh-zs-019-express-start-of-year.feature)

REQUIREMENT: The system MUST offer a minimal subset of the setup wizard and the import (structure template + school year, student/guardian import with class assignment, teacher invitations) that, once completed, MUST make roll call, front-desk enrollment, and notifications operational, and MUST let the remaining wizard steps be deferred without blocking production.

A minimal subset of the setup wizard (BEH-ZS-005) and the import (BEH-ZS-006) forms an "express start-of-year path" for schools arriving a few days before the school year starts. Roll call is owned by `spec/behaviors/04-attendance-student-life-discipline.md`, front-desk enrollment by `spec/behaviors/02-admissions-enrollment-reenrollment.md`, notifications by `spec/behaviors/08-communication-notifications.md`. Measurable target: complete express-path preparation in under one day for a 300-student school; proposed as an indicator to `spec/metrics.md`.

### BEH-ZS-020: Change a mobile number, recover access, and handle a recycled number

> **Invariant:** [INV-ZS-030](../invariants.md#inv-zs-030), [INV-ZS-044](../invariants.md#inv-zs-044), [INV-ZS-003](../invariants.md#inv-zs-003)
> **See:** [ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md), [ADR-ZS-049](../decisions/049-number-change-loss-reassignment.md), SEC-ZS-007
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-023`](../../features/adm/beh-zs-020-number-change-recovery.feature)

REQUIREMENT: The system MUST support self-service number change with two-code confirmation, MUST support front-desk recovery with identity verification and director validation when the old number is unreachable, and MUST require a knowledge challenge before granting access to an account with no login for six months or three consecutive one-time-code failures.

The mobile number is the default login identifier ([ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md), INV-ZS-044, INV-ZS-003); its loss, change, or reassignment by a carrier must neither lock out the holder nor expose their data to a third party ([ADR-ZS-049](../decisions/049-number-change-loss-reassignment.md)). (a) Self-service change: one-time code on old and new numbers; logged; schools with an active relationship notified. (b) Recovery without access to the old number: front-desk identity verification, director validation, the other schools involved notified. (c) Recycled number: knowledge challenge (date of birth of a linked child, entered without being displayed) before access; on failure, account locked and schools alerted. (d) Also applies to claiming a profile (`spec/behaviors/02-admissions-enrollment-reenrollment.md`). Minor students with a generated login identifier change identifiers through a legal guardian; an adult student migrates to a personal number via path (a).

## Screens

Screens described in text, mobile-first, available in French and Arabic (full RTL). General UX principles are owned by `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md` (Phase 4).

### SCR-ZS-001 — "My School" (legal record)

- **Purpose**: view and edit the INV-ZS-074 record (BEH-ZS-003).
- **Areas**: header with logo, AR/FR name and subscription status; sections "Legal identity", "Tax and social", "Contact details", "Visual identity and signature", "Bank details."
- **States**: missing mandatory fields flagged with a counter and a list; logged values viewable (last change, author); read-only mode for unauthorized roles.
- **FR/AR behavior**: bilingual labels, dual-script name entry with an AR/FR keyboard toggle; long form broken into steps on mobile with saving at each step; completeness check shown before validation.

### SCR-ZS-002 — "Setup Wizard"

- **Purpose**: run the six-step onboarding (BEH-ZS-005).
- **Areas**: numbered step thread with saved progress; default choices drawn from the national template; a "Resume where you left off" banner; a production-readiness checklist accessible at all times.
- **States**: completed, in progress, not-yet-reached steps; warnings; "ready for production" state once the checklist is complete.
- **FR/AR behavior**: bilingual, high-contrast interface usable on mobile; each default choice explainable in one line; a "Skip for now" button available outside mandatory steps.

### SCR-ZS-003 — "Data Import"

- **Purpose**: bulk Excel import with error report (BEH-ZS-006).
- **Areas**: domain selection; template and instructions download; file drop zone; report screen (counters, line-by-line table, filters, download); commit screen; result screen with final counts and a link to the archived report.
- **States**: analysis in progress, report ready, commit in progress, import complete, import partially committed; blocking errors vs. warnings visually distinguished.
- **FR/AR behavior**: bilingual, actionable error reasons; resumable after correction and re-upload; on mobile, report viewable read-only, commit reserved for larger screens.

### SCR-ZS-004 — "Users and Roles"

- **Purpose**: manage internal affiliations (BEH-ZS-007).
- **Areas**: user list with search and status filters; user record; invitation screen; customizable standard-roles screen with a permissions preview.
- **States**: invited, active, suspended, terminated; contextual actions; grant and revocation traces.
- **FR/AR behavior**: explicit warning before any closure; two-factor authentication required at the first login of school-level roles.

### SCR-ZS-005 — "Settings — Languages and Channels"

- **Purpose**: configure languages (BEH-ZS-008) and communication channels (BEH-ZS-009).
- **Areas**: languages block; channels block (message-type × channel matrix with fallback order, sending windows, WhatsApp opt-in management); consumption alerts block.
- **States**: channel enabled/disabled; opt-in granted/refused/withdrawn; preview of a bilingual template before saving.
- **FR/AR behavior**: switching language immediately flips reading direction; unavailable choices shown "coming soon"; the MVP's "presence" utility WhatsApp channel is visible and configurable with its minimal templates.

### SCR-ZS-006 — "Subscription and Usage"

- **Purpose**: track the subscription, usage, and consumables (BEH-ZS-010, BEH-ZS-011, BEH-ZS-012, BEH-ZS-014, BEH-ZS-015).
- **Areas**: status banner; usage statement; consumables; received SaaS invoices; "export and cancellation" area; for the group administrator, a consolidated view.
- **States**: subscription statuses; exports in preparation/ready/expired; cancellation requests awaiting second validation.
- **FR/AR behavior**: in "past due"/"cancelled" status, write actions are dimmed with a reason message and a path to compliance; durations stated in days and calendar dates.

### SCR-ZS-007 — "My Number and My Access"

- **Purpose**: number change, access recovery, and handling of recycled numbers (BEH-ZS-020).
- **Areas**: holder side (mobile): current number, "Change Number" button, devices and active sessions with remote sign-out; front-office side (web): recovery form; director side: a queue of recovery requests.
- **States**: change pending the second code; recovery request pending/validated/refused; account locked after a failed knowledge challenge, with a front-desk unlock path.
- **FR/AR behavior**: bilingual messages; the knowledge challenge never displays the expected value; the old number receives an information SMS after any change.

## 5. Morocco-Specific Considerations

| Specific                     | Treatment in this module                                                                                                                                                                                                  | Source                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| A school's legal identifiers | Legal record with ICE, IF, RC, patente, CNSS, authorization number, AREF and provincial education office                                                                                                                  | [INV-ZS-074](../invariants.md#inv-zs-074); `prd/research/02-regulatory-data.md` §7 (historical research corpus) |
| Adults' CNIE (Law 09.08)     | Guardians' and staff's CNIE number is neither entered nor imported at MVP: the field is disabled until CNDP's prior F112 authorization is obtained                                                                        | `spec/cross-cutting/07-legal-compliance-data-protection.md` (Phase 4)                                           |
| Oversight by the AREF        | Authorization number and AREF/provincial office affiliation mandatory on the record; authorized cycles bound structure instantiation                                                                                      | [INV-ZS-074](../invariants.md#inv-zs-074); Law 59.21                                                            |
| Bilingualism and dual script | School and person names in dual AR/FR script; bilingual documents and notifications; full RTL interface                                                                                                                   | [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)                                            |
| Time zone                    | Configuration fixed to `Africa/Casablanca` at permanent UTC+0 since 20/09/2026 (Decree No. 2.26.530); the baseline's former Ramadan alternation is obsolete — divergence recorded in OQ-ZS-036 (`spec/open-questions.md`) | historical research corrections                                                                                 |
| Ministry calendar            | Preloading the year's calendar, Saturday morning classes configurable, movable religious holidays marked "to confirm"                                                                                                     | historical research corpus                                                                                      |
| Communication channels       | Mobile phone as primary identifier; SMS as a universal fallback channel; WhatsApp under prior opt-in; pricing shift on 01/10/2026 to be absorbed via a parameter (OQ-ZS-037)                                              | historical research corpus                                                                                      |
| Digitalization support       | The MOWAKABA program may fund onboarding, configuration, and training services; school eligibility is unconfirmed                                                                                                         | historical research corpus                                                                                      |
| Sovereign hosting            | Production and backups in Morocco ([ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md)); constrains export timelines and the location of cancellation archives                                    | [ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md)                                     |

## 6. Data and Events

### 6.1 Entities used (dictionary: `spec/domain-model.md`)

| Domain    | Entities                                                                                                                                                                                                    | Usage in ADM                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| School    | `School`, `Organization`, `Campus`, `Section`, `AcademicYear`, `Calendar`, `Holiday`, `ScheduleVariant`, `Cycle`, `Level`, `Track`, `Class`, `Group`, `GradingScale`, `EvaluationPeriod`, `ComputationRule` | Legal record and settings, organization, setup wizard (template instantiation)                                                                               |
| Relations | `SchoolMembership`                                                                                                                                                                                          | Internal affiliations, roles, invited/active/suspended/terminated statuses                                                                                   |
| Identity  | `User`, `StaffProfile`                                                                                                                                                                                      | Internal accounts, invitations, phone as primary identifier                                                                                                  |
| Platform  | `Subscription`, `Plan`, `ModuleActivation`, `UsageMetric`, `AuditLog`, `DataExport`, `SupportTicket` (MVP)                                                                                                  | Subscription lifecycle, active-student and consumable counting, administration log, cancellation exports, ticket-based support access with director approval |
| Identity  | `User` (login identifier distinct from contact identifiers, INV-ZS-003)                                                                                                                                     | Number change, access recovery, recycled number (BEH-ZS-020)                                                                                                 |
| Imports   | `Person`, profiles, `ParentStudentRelationship`, `Enrollment`, `StudentClassHistory` (derived creations)                                                                                                    | Produced by imports; matching and duplicate rules owned by `spec/behaviors/02-admissions-enrollment-reenrollment.md`                                         |

### 6.2 Notifiable Events

Per the domain event catalog (`spec/domain-model.md`):

| Event                               | ADM's role         | Effects                                                                                                             |
| ----------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `SubscriptionSuspendedOrTerminated` | Producer           | Notifies the director: move to read-only, export available, deletion timeline                                       |
| `ProbableDuplicateDetected`         | Consumer (imports) | Alerts the school when a weak match is detected during an import; never automatic linking                           |
| `IdentityCorrected`                 | Indirect consumer  | Post-import identity corrections follow the rules in `spec/behaviors/02-admissions-enrollment-reenrollment.md`      |
| Invitation and alert notifications  | Producer           | Affiliation invitations, subscription alerts, consumable thresholds: issued via `Notification` with a `DeliveryLog` |

## 8. Integrations

Cross-reference to the integrations catalog (`spec/cross-cutting/06-external-integrations.md` (Phase 4)); this chapter does not substitute for any technical specification.

| Integration                             | Usage in ADM                                                                                                                                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SMS via a Moroccan aggregator (INT-SMS) | Fallback notification channel; consumption deducted from packs                                                                                                                                     |
| WhatsApp Business Platform (INT-WAP)    | Parent channel under opt-in: MVP limited to utility attendance notifications; generalized at V1; pricing-shift parameter on 01/10/2026                                                             |
| Email (INT-EML)                         | Secondary, optional channel                                                                                                                                                                        |
| Hosting (INT-HEB)                       | Production and backups in Morocco ([ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md)); governs the location of cancellation exports and archives                         |
| Electronic signature (INT-SIG)          | No direct application in ADM; the legal record's image stamp precedes the advanced electronic stamp (V1) owned by documents ([ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)) |

## 9. Module-Specific Non-Functional Requirements

Numbered `NFR-ZS-*` requirements are owned by `spec/cross-cutting/03-non-functional-requirements.md` (Phase 4); this chapter cites the applicable domains and the historical baseline's thresholds.

| Domain                  | Application to ADM                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-RES (volumetry)     | Back-to-school imports must absorb the pilots' scale (up to 2,000+ students for the multi-site group) and the three-year target (500 schools, 500,000 students)                                                                                                                                                                              |
| NFR-PERF (performance)  | Analyzing an import of several thousand rows and producing a full cancellation export must stay within objective timeframes; the admin interface follows the general requirement of common pages loading under 2s on 4G                                                                                                                      |
| NFR-DISP (availability) | Heavy onboarding processes are scheduled outside the start of the school year and exam periods                                                                                                                                                                                                                                               |
| NFR-I18N (languages)    | FR/AR interface with full RTL from MVP; English out of scope before V2                                                                                                                                                                                                                                                                       |
| NFR-OBS (observability) | Logging and per-tenant traceability of administration operations                                                                                                                                                                                                                                                                             |
| NFR-SAV (support)       | Temporary, audited support-access procedure by ticket; traceable onboarding assistance                                                                                                                                                                                                                                                       |
| Application security    | Rate limiting on self-registration, MFA for director/administration/accounting/system-administrator roles (optional for teachers and supervisors), anti-enumeration protection on searches during imports, knowledge challenge on recycled numbers; security requirements are owned by `spec/cross-cutting/02-security-privacy.md` (Phase 4) |

## 10. Success Metrics

Indicators proposed for this module (consolidation and `KPI-ZS-*` numbering owned by `spec/metrics.md`):

| Indicator                    | Proposed definition                                                                             | Indicative target                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Time to production           | Time between tenant creation and the first roll call taken in production                        | Under 10 business days with standard support |
| "Express start-of-year" time | Preparation time for the minimal subset (BEH-ZS-019) until critical functions are in production | Under 1 day for 300 students                 |
| Onboarding autonomy          | Share of schools completing the wizard without support intervention                             | To be established with the pilots            |
| Import quality               | Share of rows committable on the first pass (no correction)                                     | Above 95%                                    |
| Internal-user adoption       | Share of invited affiliations that become active within 14 days                                 | To be established with the pilots            |
| Subscription health          | Share of active schools with no delinquency incident; annual renewal rate                       | Commercial tracking                          |
| Counting accuracy            | Gap between the "active students" count and enrollments actually active on the count date       | Zero (monthly check)                         |

## 11. Open Questions

Open questions for this module (11 items, originally numbered locally) are tracked in `spec/open-questions.md` as OQ-ZS-031 through OQ-ZS-041 (built in Phase 6 of the migration).

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
