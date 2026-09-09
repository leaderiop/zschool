# ZSchool — Cross-Cutting Chapter 30: Roles, Permissions and Access Matrix

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review (arbitrations `prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §4 (authorization chain), §5.1 (actors), §6.1 (RG-01 to RG-03), §6.4 (RG-12b to RG-16), §6.5 (RG-17 to RG-20), §6.6 (RG-21), §8 (roles, RG-36 to RG-39, matrix 8.3), §9 (security, audit log), §11 (activatable modules), §12 (scope by version), §13 (C-09, G-05, G-32), §14 (DEC-02, DEC-05, DEC-17, DEC-20, DEC-31, DEC-34), §18 (point 5: complete permissions matrix) |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md` (BES-…), `prd/03-domain-data-model.md` (entities, INV-01 to INV-43, events), `prd/journeys/00-journey-map.md` (PC-01 to PC-11), `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/12-academic-structure-timetables.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/15-documents-certificates.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/18-transfers-mobility.md`, `prd/modules/19-teacher-career-network.md`, `prd/modules/20-dashboards-reporting.md`, `prd/modules/21-massar-regulatory-exports.md`, `prd/modules/22-ancillary-services-transport-canteen-activities.md`, `prd/modules/23-health-sensitive-data.md` (functional modules), `prd/research/00-baseline-corrections.md` (notes 1, 5 and 18), `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` (arbitrations ARB-01, ARB-07, ARB-10, ARB-21, ARB-25) |

---

## 1. Objective and scope

This chapter implements the resolution of **C-09** ("Administration" as a single role replaced by detailed roles and fine-grained permissions), closes gap **G-05** (non-teaching staff, administrative sub-roles, platform roles) and gap **G-32** (ZSchool support access to school data), in line with **DEC-17**. It produces the **complete permissions matrix** requested in point 5 of baseline chapter 18, extending the §8.3 excerpt into a full data × role matrix.

In scope:

- the role catalog by level (platform, organization, school, individuals);
- the permission composition principles (context, granularity, least privilege);
- the `PER-NN` permission rules;
- the complete data × role matrix, consistent with baseline §8.3;
- critical rights-management flows and management interfaces (textual description).

Out of scope (covered elsewhere, without duplicating their requirements):

- authentication, session management and encryption mechanisms (`prd/cross-cutting/31-security-privacy.md`; baseline §9);
- non-functional requirements for performance, availability and observability (`prd/cross-cutting/32-non-functional-requirements.md`);
- Law 09.08 / CNDP formalities and retention periods (`prd/cross-cutting/36-legal-compliance-data-protection.md`; DEC-22);
- the technical implementation of access control (this document describes observable behavior, not an architecture).

The matrix describes the target state per role; availability of each row by version is given in §5.4, strictly aligned with baseline chapter 12.

## 2. Role catalog

### 2.1 Four role levels

| Level | Held by | Examples | Scope of rights |
|---|---|---|---|
| Platform | ZSchool operator (§5.1) | Super-administrator, ZSchool support | Provisioning, global configuration, compliance; no default access to school data |
| Organization (school group) | `Organization` (consolidated read-only at MVP, shared administration and group billing in V1 — ARB-01; RG-21, DEC-02) | Group administrator | Consolidated views, management of the group's schools, subscription; no data merging |
| School | `School` (tenant) via `SchoolMembership` (RG-17, DEC-05) | Principal, academic direction, registrar's office, accounting, student life, teachers, ancillary-module roles | Fine-grained permissions per module and per scope, within the tenant |
| Individuals | `ParentStudentRelationship` (RG-12b) and student status (RG-01, RG-02) | Parent/guardian, student | According to the relationship's qualities, rights, and the school's policy |

A single account can span several levels (a teacher at one school, a parent at another, a staff member at a third): rights are carried by the relationships, never by the account itself (RG-03, RG-36, INV-13, INV-31).

### 2.2 Platform roles

| Role | Description | Default rights |
|---|---|---|
| ZSchool super-administrator | Tenant provisioning, global configuration, technical oversight, platform compliance (§8.1) | No access to school data without a logged support procedure; technical operations (tenant creation, module activation) are logged |
| ZSchool support | On-demand assistance to schools (§8.1, G-32) | No default access; temporary elevation on an audited ticket, bounded in time and scope (PER-12) |

Both roles are held by dedicated ZSchool team accounts, separate from any external personal account, subject to strengthened authentication (baseline §9; detail in `prd/cross-cutting/31-security-privacy.md`).

### 2.3 Organization role (school group: consolidated read-only at MVP, shared administration in V1 — ARB-01)

| Role | Description | Default rights |
|---|---|---|
| Group administrator | Group governance: creating and attaching schools, SaaS subscription and billing, consolidated views (§8.1, §7.11) | Read access to **aggregated** cross-school indicators (headcount, attendance, results, arrears, communication costs); management of the scope (schools, subscription); no per-record data of a tenant by default (RG-21, PER-13) |

The group is not a super-tenant: it does not "see" operational data by default; any potential named delegation is the subject of OQ-04. At MVP (ARB-01), the role covers creating the organization, attaching tenants, and reading aggregates (FR-ADM-04, FR-RAP-09 read-only); shared administration and consolidated billing (PAK-08) arrive in V1.

### 2.4 School roles

Standard roles provided by ZSchool (RG-37, DEC-17), instantiated per school and adjustable (§4). Default scope = least privilege (RG-39). The "Version" column indicates when the role is introduced per baseline chapter 12.

| Role | Default scope | Typical content (§8.1) | Version |
|---|---|---|---|
| Principal / administrator | Entire tenant | All tenant functions: configuration, roles, sign-off, closings, publication | MVP |
| Academic direction | Entire tenant, academic track | Structure, assignments, report cards, class councils (§8.1); primary owner of the matrix's "Structure and timetable" row | MVP |
| Registrar's office | Entire tenant, administrative track | Enrollment, records, documents, communication (§8.1); editing the timetable grid within the granted scope (§8.3) | MVP |
| Accounting / cashier | Entire tenant, **finance only** | Fee schedules, invoices, payments, receipts, reminders, cash sessions; no access to school data (grades, discipline, health) | MVP |
| Head supervisor (student life) | All of the school's cycles | Attendance, discipline, communication with families (§8.1, §2.11); full discipline module in V1 (§12) | MVP |
| Supervisor | Cycles assigned to them (RG-39) | Support attendance-taking, tardiness, student-life follow-up within their scope | MVP |
| Teacher | Their own courses (active `TeacherAssignment`, INV-34) | Attendance, grades, lesson log, messages to parents of their students (§8.1); permanent, part-time, or external public-sector teacher status (correction #18 of `prd/research/00-baseline-corrections.md`) | MVP |
| Homeroom teacher | Their class | Teacher rights plus a summary view of their class (§8.1); carried by an attribute of `Class`/`TeacherAssignment` | MVP |
| Infirmary | Health module only | Medical record and alerts (§8.1, §7.14); the infirmary visit log is out of scope (`prd/modules/23-health-sensitive-data.md` §1) | V2+ (health module) |
| Transport | Transport module only | Routes, subscriptions, check-in (§7.13) | V2+ (transport module) |
| Library | Library module only | Loans, catalog (§7.13) | V2+ (ancillary modules) |
| Local system administrator | Tenant's technical entitlements | Managing the tenant's accounts and activations under the principal's authority; no default access to sensitive data (§5.1, §6.5); cannot create, modify, or reset a principal-track account (PER-19, ARB-25m) | MVP (optional role) |

The principal can create additional roles by duplicating and adjusting the standard roles (RG-37); any role creation, modification, or deletion is logged (PER-14).

### 2.5 Individuals: parent/guardian and student

| Role | Rights | References |
|---|---|---|
| Parent/guardian | Rights carried by the relationship's qualities (legal guardian *wilaya*, custodian *hadana*, financial guardian, emergency contact, pick-up authorization) and by the relationship's access rights (grades, attendance, documents, finance, communication, outing authorizations, e-signature) | RG-12b, RG-13, RG-14, RG-14b, RG-15; INV-09 to INV-12 |
| Student | Personal access activated by a legal guardian from the level set by the school (default: 1AC, first year of middle school); once 18, becomes the account holder, may restrict parental access to school, disciplinary, and health data, with the financial guardian retaining financial access | RG-01, RG-02, DEC-20; INV-35, INV-36 |

No account is shared between two people (RG-12b, INV-13); restricting a parent's access can only result from a court decision recorded by the school (RG-14). The "legal guardian" and "custodian" qualities are recorded separately (RG-14b); the "guardianship regime" setting remains adjustable pending any future change to the Family Code (correction #5 of `prd/research/00-baseline-corrections.md`: the 2024 reform is not enacted as of 09/09/2026).

## 3. Permission model

### 3.1 Composition

A **fine-grained permission** is the triplet (module, operation, scope):

- **Module**: codes `ADM`, `INS`, `PED`, `VSC`, `EVA`, `DOC`, `FIN`, `COM`, `TRA`, `RAP`, `MAS`, `SAN`, `HEA`, `PRT` (conventions §2);
- **Operation**: read (R), write (W: create and modify), configure (module settings within the scope);
- **Scope**: course, group, class, level, cycle, school (least-privilege default: the narrowest scope derivable from the assignments, RG-39).

A **role** is a named set of fine-grained permissions. The standard roles of §2.4 ship with a default composition; the principal can duplicate them, adjust them, and create dedicated roles, within the model's limits (PER-03, PER-04): permissions related to global identity (RG-07), consents (RG-30/31), and audited operations (RG-06, RG-32) remain reserved to the roles provided by the baseline and cannot be freely assigned.

### 3.2 Contextuality

Permissions are evaluated in the current context: the selected (profile, school) pair, further scoped by the school year and the granted scope (RG-36, INV-31). The context switcher (RG-03) lets a multi-profile account toggle between its active contexts; scopes follow the current school year's assignments and change with them (class change, new assignment, affiliation closure).

### 3.3 Logging and least privilege

Every write is attributed to its author and logged immutably at the record level from MVP onward (arbitration D4, ARB-25j); logging of sensitive-data views (identity file, health, finance, discipline) with author, context, and timestamp (RG-38), in an immutable, exportable log kept for five years (DEC-22), ships in V1 (technical detail in `prd/cross-cutting/31-security-privacy.md`, SEC-11 and SEC-12). Least privilege applies by default, and any scope broadening is an explicit, logged administrative act (RG-39).

## 4. Permission rules (PER)

Format: conventions §3 template adapted to cross-cutting rules (attribute table + traceability). Counter `PER-NN` starting at 01, namespace exclusive to this file (conventions §2).

### PER-01 — Four-level role catalog

| Attribute | Value |
|---|---|
| Description | The system offers roles at the four levels of §2: platform (super-administrator, support), organization (group administrator), school (standard roles of §2.4), individuals (parent/guardian, student). Every effective right derives from an active relationship: `SchoolMembership` for staff and teachers, `ParentStudentRelationship` for guardians, enrollment and activation for the student. No right is carried by the account itself. |
| Priority | Must |
| Version | MVP (platform, school, and individual roles; group administrator in consolidated read-only mode — ARB-01); V1 (shared administration and group billing) |
| Traceability | §5.1, §6.5 (RG-17, DEC-05), §6.4 (RG-12b), §8.1, RG-21, DEC-02, DEC-17, C-09, G-05 |
| Actors | All roles |

### PER-02 — Contextual permissions by profile and by school

| Attribute | Value |
|---|---|
| Description | Permissions are evaluated in the account's active (profile, school) context: an account that is a teacher at School A and a parent at School B exercises only their affiliation rights at School A and only their parental-relationship rights at School B. A context switch never changes another context's rights. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-36, RG-03, INV-31, INV-13 |
| Actors | Multi-profile accounts (teacher-parent, parent-staff, multi-school part-time teacher) |

### PER-03 — Standard roles provided, instantiated and adjustable

| Attribute | Value |
|---|---|
| Description | ZSchool provides the standard roles of §2.4, instantiated per school at onboarding (PC-03) and adjustable by the principal: duplication, adjusting permissions per module and per scope, creating dedicated roles, restoring the factory composition. Rights reserved by the baseline (profile merges RG-06, post-grace corrections RG-32, support access) do not appear in any adjustable role. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-37, DEC-17, INV-32, §7.1, §8.1; PC-03 |
| Actors | Principal; ZSchool support for factory compositions |

### PER-04 — Fine-grained permissions by module, operation and scope

| Attribute | Value |
|---|---|
| Description | Every right of a school role is expressed as a (module, operation, scope) triplet per §3.1. Read, write, and configuration are separated: having write access to a module does not open its configuration, and configuration does not open reading of data in other scopes. The default scope granted is always the narrowest one compatible with the function. |
| Priority | Must |
| Version | MVP (triplet applied to standard roles); V1 (full role editor in the interface) |
| Traceability | RG-37, RG-39, DEC-17, INV-32 |
| Actors | Principal, academic direction, all school roles |

### PER-05 — Default least privilege derived from assignments

| Attribute | Value |
|---|---|
| Description | A teacher's access to students and their data derives from their active `TeacherAssignment` records: they see only the students in their courses. A supervisor sees only the cycles assigned to them. A homeroom teacher sees a summary view of their class's students. Any broadening (level, cycle, school) is an explicit, dated, attributed administrative decision. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-39, INV-34; BES-ENS-05, BES-SUR-06 (`prd/02-actors-personas.md`) |
| Actors | Teacher, homeroom teacher, supervisor, head supervisor |

### PER-06 — Multi-profile accounts and context switcher

| Attribute | Value |
|---|---|
| Description | An account holding several profiles or affiliations has a context switcher (profile + school); the data and actions displayed correspond exclusively to the active context. Part-time teachers working at several schools switch between schools without logging out (PC-04, ENS persona). |
| Priority | Must |
| Version | MVP |
| Traceability | RG-03, RG-17, RG-36, H-13; `prd/02-actors-personas.md` §1.2 |
| Actors | Any multi-profile account |

### PER-07 — Immediate revocation of access when a relationship closes

| Attribute | Value |
|---|---|
| Description | When an affiliation closes (`SchoolMembership` completed or suspended), access to the school's data is revoked immediately, with no grace period or delayed logout; open sessions are invalidated. Data produced (grades entered, attendance taken, messages) remains in the school, attributed to its author. The same immediate revocation applies to the suspension or revocation of a parental relationship and to deactivation of a student account. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-19, RG-14, INV-16; `AffiliationClosed` event (`prd/03-domain-data-model.md` §7) |
| Actors | Principal (administrative act); any affected role |

### PER-08 — Parent rights by quality, court-order-only restriction

| Attribute | Value |
|---|---|
| Description | By default, all legal guardians and the custodian have access to the student's school information and receive notifications (RG-13, RG-14). Financial-data read access is carried by the financial-guardian quality (sole or shared, including a third party). Restricting a parent's access requires a court decision recorded by the school, with a supporting document and an audit trail; no discretionary restriction is possible. Conflicts between guardians are escalated to the school, which arbitrates; ZSchool does not rule on them (RG-16). |
| Priority | Must |
| Version | MVP |
| Traceability | RG-12b, RG-13, RG-14, RG-14b, RG-15, RG-16; INV-09 to INV-13; BES-GAR-01, BES-GAR-03, BES-GAR-06 |
| Actors | Parent/guardian; school administration (recording court decisions) |

### PER-09 — Student rights: activation, coming of age, parental restriction

| Attribute | Value |
|---|---|
| Description | A student's personal access is activated by a legal guardian from the level set by the school (default: 1AC) and covers their own data per the school's policy. Once 18, the student becomes the account holder, is informed of their rights at the time and at every re-enrollment, and may restrict parental access to school, disciplinary, and health data; the financial guardian retains access to financial data as long as they remain liable for fees. Every restriction is logged and notified to the school. |
| Priority | Must |
| Version | MVP (activation, account ownership at majority, notice, adult student's self-restriction — ARB-10) |
| Traceability | RG-01, RG-02, DEC-20; INV-35, INV-36; `StudentTurnsAdult` event; BES-ELE-01, BES-ELE-05, BES-ELE-07; ARB-10 |
| Actors | Student, legal guardian, school administration |

### PER-10 — Logging of writes and of sensitive-data views

| Attribute | Value |
|---|---|
| Description | Every write action and every view of sensitive data (identity file and its documents, health, finance, discipline) is logged with author, context (tenant, role, active scope), timestamp, and object viewed. The log is immutable, exportable by the school, and kept for five years (DEC-22). Version pacing follows arbitration D4 (ARB-25j): at MVP, every write is logged immutably at the record level (author, timestamp, prior value), and security events and support-access events are logged; logging of sensitive-data views, the review console, and export ship in V1. |
| Priority | Must |
| Version | MVP (immutable write logging, security events, support access — D4, ARB-25j); V1 (log of sensitive-data views, console, export) |
| Traceability | RG-38, RG-19, §9, DEC-22, INV-33, G-20; ARB-25j |
| Actors | All roles; log review: principal, ZSchool support |

### PER-11 — Domain separation by permissions: accounting kept out of student life

| Attribute | Value |
|---|---|
| Description | The Accounting/cashier role is single-domain: finance only (§8.1), with no access to grades, discipline, health, or academic content; identity is visible only for people linked to financial accounts (§8.3). Symmetrically, student life has no access to finance, and a teacher has no access to finance or the administrative file. A single person may still hold several roles (RG-17); the domains then stay separated at the permission level and the interface presents the contexts distinctly. |
| Priority | Must |
| Version | MVP |
| Traceability | §8.1 (accounting: finance only), §8.3, RG-39, RG-17 |
| Actors | Accounting, student life, teacher, principal (role composition) |

### PER-12 — Logged ZSchool support: temporary elevation on ticket

| Attribute | Value |
|---|---|
| Description | ZSchool support has no default access to a tenant's data. Any access is preceded by a ticket stating the school, the reason, the data scope involved, and a duration; at MVP, elevation additionally requires the principal's explicit approval given in the application (ARB-25k); the elevation is bounded by that duration, revocable at any time, logged end-to-end (RG-38), and notified to the school (opening and expiry of the access). Support writes are limited to provisioning, global configuration, and the audited procedures provided by the baseline (profile merges RG-06, post-grace-period corrections RG-32); they are reserved to the super-administrator or to support with dual logging. |
| Priority | Must |
| Version | MVP (ticket-based access with the principal's explicit in-app approval, bounded duration, logged — ARB-25k; `SupportTicket` entity, MVP); V1 (full workflow, exportable log) |
| Traceability | §8.1, G-32, RG-38, RG-06, RG-32; `SupportTicket`, `MergeOperation`, `AuditLog` entities (`prd/03-domain-data-model.md` §2.7) |
| Actors | ZSchool support, super-administrator, principal (notification) |

### PER-13 — Group administrator: default aggregates, explicit delegation

| Attribute | Value |
|---|---|
| Description | The group administrator has default access to cross-school aggregated indicators (headcount, attendance rate, results, arrears, communication costs) and to managing the group's scope (schools, subscription). They have no default access to any school's per-record data; the group never opens a data merge (RG-21, DEC-02). Any extension beyond aggregates is subject to an express delegation (OQ-04). |
| Priority | Should |
| Version | MVP (consolidated read-only: creating the organization, attaching tenants, aggregates — ARB-01); V1 (shared administration, group billing, OQ-04 delegation) |
| Traceability | §8.1, RG-21, DEC-02, §7.11; BES-DIR-01, BES-DIR-04; ARB-01 |
| Actors | Group administrator, principals of the group's schools |

### PER-14 — Traceability and notification of rights changes

| Attribute | Value |
|---|---|
| Description | Every role grant, change, or revocation, and every change to a role's scope, is logged (author, beneficiary, scope, timestamp) and notified to the person concerned; log and export extensions are governed by PER-10. The principal has a view of their school's active roles and their history. |
| Priority | Should |
| Version | V1 |
| Traceability | RG-38, RG-19, RG-02 (restriction-notification principle), DEC-17 |
| Actors | Principal, academic direction, role beneficiaries |

### PER-15 — Post-closure changes: grace period then audited procedure

| Attribute | Value |
|---|---|
| Description | After an enrollment closes, its data is read-only for the school; correction remains possible during a configurable grace period (default: 60 days) by the usual write roles, then only through an audited procedure (principal role with justification, or support per PER-12). A published report card is never edited: any correction creates a new version (RG-33). Period-closing locks apply to all write roles (§7.5). |
| Priority | Must |
| Version | MVP |
| Traceability | RG-32, RG-33, INV-25, INV-26, §7.5 |
| Actors | Principal's office, registrar's office, teachers (grace period); ZSchool support (audited procedure) |

### PER-16 — Permissions bounded by activated modules

| Attribute | Value |
|---|---|
| Description | Permissions on a module are inoperative until the module is activated for the tenant: the infirmary, transport, and library roles open no access before the corresponding modules ship (V2+), and roles created by duplication inherit this bound. Activating a module makes the permissions effective without a new grant. |
| Priority | Should |
| Version | V1 (activation management); the bound applies from MVP onward for modules not yet shipped |
| Traceability | §11 (single plan, activated modules), §7.13, §7.14, §12 |
| Actors | Principal, group administrator, super-administrator |

### PER-17 — Strengthened authentication for privileged roles

| Attribute | Value |
|---|---|
| Description | Multi-factor authentication (§9) is mandatory from MVP onward for the principal, academic direction, registrar's office, accounting, and local system administrator roles, as well as for platform accounts (super-administrator, support), which are further subject to strengthened controls (separate accounts, short session expiry, re-validation on PER-12 elevation). For teachers, supervisors, and ancillary-module roles, the second factor is optional and can be activated by the school; every role benefits from trusted devices (90 days, SEC-04) to limit repeated OTPs on mobile (ARB-25l). Mechanism detail is covered by the PRD's security chapter (`prd/cross-cutting/31-security-privacy.md`); the PER rule sets the functional requirement per role. |
| Priority | Must |
| Version | MVP (principal's office, administration, accounting, system administrator, platform roles; optional for teachers and supervisors — ARB-25l) |
| Traceability | §9, RG-38, G-32; ARB-25l; SEC-02, SEC-04 |
| Actors | All school and platform roles |

### PER-18 — Ancillary-module roles bounded to their module

| Attribute | Value |
|---|---|
| Description | The infirmary, transport, and library roles carry permissions limited to their module (§8.1): the nurse accesses the health records of students flagged to them and the alerts, the transport lead accesses routes and subscriptions, the library lead accesses the catalog and loans; none of them access grades, discipline, or finance. Health data is never transferred automatically and its processing follows prior CNDP authorization (F112). |
| Priority | Should |
| Version | V2+ (health module and ancillary services) |
| Traceability | §8.1, §7.13, §7.14, RG-39, DEC-08, §9 (F112) |
| Actors | Infirmary, transport, library, principal's office |

### PER-19 — Bounding the local system administrator

| Attribute | Value |
|---|---|
| Description | The "Local system administrator" role manages the tenant's accounts and activations without constituting an elevation path: it cannot create or modify roles, or reset access for an account holding a principal or academic-direction role; those operations require dual control (principal + a second member of the leadership team, or principal + ZSchool support on a PER-12 ticket). It cannot grant itself an additional role. Any out-of-scope attempt is denied and logged. |
| Priority | Must |
| Version | MVP |
| Traceability | §8.1, RG-37, RG-38, RG-39; ARB-25m; SEC-05 |
| Actors | Local system administrator, principal, ZSchool support |

## 5. Complete permissions matrix

### 5.1 Legend

| Symbol | Meaning |
|---|---|
| R | Read |
| W | Write (create and modify) |
| — | No access |
| (partial) | Subset of the data, detailed in note N |
| (aggregated) | Aggregated indicators, no per-record data (PER-13) |
| † | Sensitive data: viewing it is logged (RG-38, PER-10) |
| * | Temporary ZSchool support access on an audited, bounded, notified ticket (G-32, PER-12) |

Columns: the student has an activated account (RG-01); the parent exercises their rights according to their qualities (RG-13/14); "Course teacher" designates the teacher holding an active `TeacherAssignment`; "Homeroom teacher" combines teacher rights with a summary view of their class; "Student life" covers the head supervisor (whole school) and the supervisor (assigned cycles, RG-39); "Principal's office" covers the principal and the academic direction, with nuances noted below.

### 5.2 Matrix (12 data rows × 10 role columns)

| Data | Student | Parent | Course teacher | Homeroom teacher | Student life | Registrar | Accounting | Principal's office | Group admin | ZSchool support |
|---|---|---|---|---|---|---|---|---|---|---|
| Timetable (published grids) | R | R | R | R | R | R/W | — | R/W | R (aggregated) | R* |
| Attendance and punctuality † | R | R/W (justification, N14) | W (own courses) | R | R/W | R | — | R/W | R (aggregated) | R* |
| Unpublished grades | — | — | W (own courses) | R (own class) | — | — | — | R/W | — | R* (explicit ticket) |
| Published report cards and transcripts | R | R | R (own subjects) | R (own class) | R | R | — | R/W | R (aggregated) | R* |
| Discipline † | R (partial) | R | R (own students) | R | R/W | — | — | R/W | R (aggregated) | R* |
| Identity file † | R (own data) | R/W (partial) | — | R (partial) | R (record; documents —, N14) | R/W | R (partial) | R/W | — | R* |
| Finance † | — | R (if entitled) | — | — | — | R | R/W | R/W | R (consolidated) | R* |
| Health † (V2 module) | R (adult student) | R/W | — | R (alerts) | R (alerts) | — | — | R | — | R* (explicit ticket) |
| Documents (certificates, file records) † | R (published) | R (configured self-service) | — | — | — | R/W | R (partial) | R/W | — | R* |
| Communication (announcements, messages, threads, notices) | R (own concerns) | R/W (partial) | R/W (own courses) | R/W (own class) | R/W (assigned cycles) | R/W | — | R/W | R (aggregated costs) | R* |
| Academic structure and timetable editing | — | — | R (own assignments) | R (own class) | — | R/W (grid) | — | R/W | R (consolidated) | R/W* (ticket) |
| Configuration (settings, roles, subscription, channels) | — | — | — | — | — | — | — | R/W | R/W (group and subscription) | R/W* (ticket) |

Correspondence with the baseline: the eight "Student" through "Principal's office" columns reproduce baseline §8.3 row by row, with two clarifications carried in note N14 (parental write access limited to submitting an absence justification; student-life reads on the identity-file row limited to the record, excluding documents). The "Timetable" row of §8.3 is split here into viewing (row 1) and editing/structure (row 11); the rights of §8.3 (registrar R/W, principal's office R/W) are carried by these two rows. Adding the "Group admin" and "ZSchool support" columns and the "Documents", "Communication", "Structure", and "Configuration" rows extends the matrix without contradicting the baseline excerpt, consistent with its note "excerpt, to be detailed in the PRD". The "Health" row details the baseline's "Student: —" cell per RG-02: once an adult, the student holds their own account, views their health record, and may restrict parental access (the baseline cell describes the typical minor student).

### 5.3 Nuance notes

- **N1 — Active context.** All rights above are exercised within the active (profile, school, year) context (PER-02, RG-36); an account that combines two roles in the same column (e.g., secretary-cashier) exercises the combined rights of both roles, presented per context (RG-17, PER-11).
- **N2 — Homeroom teacher.** Homeroom teacher rights = teacher rights + summary view of their class (§8.1); their read access to unpublished grades covers their class, with no write access to other teachers' grades.
- **N3 — Student life.** The head supervisor operates across all of the school's cycles; the supervisor only on their assigned cycles (RG-39). Full disciplinary writes (incidents, sanctions, councils) ship with the full student-life module in V1 (§12); at MVP, simple incident logging and attendance follow-up are covered.
- **N4 — Report card immutability.** "Principal's office" write access on published report cards means publishing, locking the period, and creating a corrective version; no role edits a published report card (RG-33, INV-26). After enrollment closes, correction follows PER-15 (grace period then audited procedure).
- **N5 — Grade locking.** After a period closes, teacher writes are blocked (§7.5); the "W (own courses)" cell applies outside closure. The principal's office retains write access for closing, general remarks, and grace-period corrections.
- **N6 — Identity file on the parent side.** The parent edits their own contact details and preferences, their relationship's contextual attributes (RG-15: outing authorization, people authorized to pick up the child, communication preferences), and the civil-status data declared when they create a child profile (§6.2); corrections to a child's identity data follow RG-07 (logged, notified to the schools concerned). The exact set of fields directly editable by the parent is raised in OQ-02.
- **N7 — Finance.** Parental read access is carried by the financial-guardian quality, including for a third party who is not a legal guardian (RG-13, §7.7); after leaving, the parent retains access to their payment history, and the financial guardian retains the financial relationship until settled (RG-12, INV-08). The registrar's office reads finance (§8.3); collecting payments falls to the Accounting/cashier role, which the "secretary-cashier" persona holds by combination (N1). Generating official documents is never blocked for arrears (DEC-24, INV-39).
- **N8 — Health.** V2 module; non-medical roles' access is limited to alerts (allergies, emergency instructions) for the homeroom teacher and student life, and to module management for the principal's office (§8.1, §7.14). Processing is subject to prior CNDP authorization (F112); never transferred automatically (DEC-08, RG-31); the adult student views their own record and may restrict parental access (RG-02, PER-09).
- **N9 — Documents.** Generation by the registrar's office (and configured parental self-service, V1) is never conditioned on any dispute, including a financial one (DEC-24); file records (birth certificates, national ID, court decisions) are strongly encrypted and viewing them is logged (RG-38, §9). Accounting only reads its own financial documents (invoices, receipts).
- **N10 — Communication.** Parent–teacher threads default to moderated mode: the teacher or the school opens the thread, the parent replies, parental thread-opening is configurable; the principal's office may view threads, which is disclosed to users (DEC-34). Student read access covers targeted announcements and content concerning them. Financial reminders are produced by the finance module (graduated reminders, §7.7) and do not require the communication role's write access for accounting.
- **N11 — Structure and timetable.** Primary owner: academic direction (structure, assignments, councils, §8.1); the registrar's office edits the grid within the granted scope (§8.3); cloning year N to N+1 (RG-25) and publishing grids fall to the principal's office. Teachers and homeroom teachers have read access to their own scope; conflict detection (teacher, room, class) is an editing function (§7.3).
- **N12 — ZSchool support.** No default access; every cell marked * assumes a ticket with reason, scope, and duration (PER-12). Support writes (R/W*) are limited to provisioning, global configuration, and the baseline's audited procedures (merges RG-06, post-grace corrections RG-32); viewing unpublished grades and health data requires an explicit ticket naming those categories. Every elevation is notified to the school and logged.
- **N13 — Group admin.** Aggregated reads reveal no per-record data (PER-13, RG-21); group management covers creating and attaching schools and the subscription (§8.1, §7.1). A school's internal academic settings remain under its own principal's authority. At MVP, the consolidated view is read-only (ARB-01).
- **N14 — Review clarifications.** Parental write access on the "Attendance" row is limited to submitting an absence justification with a supporting document (BES-PAR-05, FR-VSC-07); student life may also record a justification on a guardian's behalf (ARB-15d), logged as "entered by the school". Student life's read access on the "Identity file" row covers the record (civil status, contacts, guardians' qualities) and never the supporting documents (national ID, birth certificate, court decisions), which are reserved to the registrar's office and the principal's office (SEC-10). Adults' national ID numbers are not collected at MVP (ARB-25a).

### 5.4 Row availability by version

Compliance with baseline chapter 12 (the §5.2 table describes the target state per role):

| Row | MVP | V1 | V2+ |
|---|---|---|---|
| Timetable (viewing and editing) | Basic structure (classes, subjects); declared sessions per course and slot, without grid or rooms (ARB-04) | Grids with conflict detection and variants (Ramadan, exams) | Automatic generation |
| Attendance and punctuality | Attendance per declared session, notification aggregated per day, justification (parent or front desk), uncovered session (ARB-04, ARB-05, ARB-15) | Full student life (tardiness, early departures, exemptions, thresholds) | — |
| Unpublished grades | Entry and averages; configurable progressive publication (ARB-17f); year-end decisions and remarks in wave 2 (ARB-01) | Locks, full class-council preparation | — |
| Published report cards and transcripts | Immutable bilingual report cards; annual transcripts (wave 2, ARB-01) | Verification QR code (ARB-19), cumulative transcripts | — |
| Discipline | Simple incident logging | Full discipline (sanctions, councils, conduct grade) | — |
| Identity file | Creation, matching (students and guardians, ARB-09), corrections, merge by ZSchool support (ARB-01); declared prior history (ARB-22) | Merge by an authorized school role | — |
| Finance | Fee schedule, payment plan, payments (including family split payment and logged cancellation, ARB-20), numbered receipts, arrears, reminders, cheques, sibling discount, account statement, parent contract (ARB-01) | Cash sessions, compliant invoices, negotiated discounts and scholarships, accounting exports | Online payment (Fatourati from V1 per DEC-31, see OQ-07; card in V2) |
| Health | — | — | Health module (F112, alerts) |
| Documents | Immediate enrollment documents, front-desk enrollment certificate, PDF exit file, batch certificates (wave 2, ARB-01) | Full documents module, self-service, QR code | Qualified stamp (DEC-30) |
| Communication | Announcements, messages, moderated in-app threads (ARB-21a), in-app and SMS notifications; WhatsApp utility limited to attendance notifications (minimal templates; arbitration D1) | Generalized WhatsApp, push, generalized moderated threads, notices | — |
| Academic structure and timetable editing | Basic structure, assignments, uncovered session (ARB-05), N+1 cloning in wave 2 (ARB-01) | Grids, conflicts, variants | Automatic generation |
| Configuration | Basic setup, standard roles, MFA for privileged roles (ARB-25l), consolidated read-only organization (ARB-01), write logging (D4) | Shared group administration, full audit log | — |

## 6. Role management in the interface

Screens described in text (no mockups); screen identifiers remain carried by the module chapters (conventions §2).

- **"Members and roles" screen (school administration, EN/AR).** List of the tenant's active affiliations with role(s), scope, status, and dates; search by name; actions: invite, assign a standard role, adjust a scope, suspend, close (with a reminder of immediate revocation, PER-07). Every sensitive action requires confirmation and produces a log entry (RG-38).
- **Role-editing screen.** Column view: modules in rows, operations (read, write, configure) and scopes in columns; checkboxes; a readable indication of the effective scope ("3 classes, 1 cycle"); duplicating a standard role, restoring factory settings; blocking of rights reserved by the baseline (merges, audited corrections) with an explanatory message (PER-03).
- **"Audit log" view (principal's office).** Log filterable by author, period, action type (write, sensitive view, rights change, support access), exportable (PER-10, DEC-22); read-only. At MVP, the view is limited to the write history of a record (D4); the full console ships in V1.
- **Homeroom teacher summary view.** For their class: headcount, today's absences, student-life alerts, entry status, period averages; read-only beyond their own courses (N2).
- **Support console (platform).** Ticket queue, elevation request creation (school, reason, scope, duration), a visible countdown, automatic notification to the school, an access log attached to the ticket when it closes (PER-12, G-32).

## 7. Critical flows (acceptance criteria)

```gherkin
Feature: Assigning a role and the immediate effect of its scope
  Scenario: A supervisor only sees their assigned cycles
    Given a school with a middle-school cycle and a high-school cycle
    And a supervisor affiliated with the "Supervisor" role limited to the middle-school cycle
    When the supervisor opens today's absence list
    Then only classes from the assigned cycle are visible
    And no class from the high-school cycle is accessible, even via direct search
    And the role assignment appears in the log with author, beneficiary, and scope

Feature: Immediate access revocation when an affiliation closes
  Scenario: A part-time teacher whose affiliation is closed
    Given a teacher active at the school with grades entered
    When the principal closes the affiliation with a reason and a date
    Then any request from that account against the school's data is denied immediately
    And open sessions are invalidated
    And the grades and attendance records produced remain viewable in the school, attributed to their author

Feature: Temporary elevation of ZSchool support on a ticket
  Scenario: Bounded, notified, and logged access
    Given a support ticket reporting an import issue on a tenant
    When a support agent requests an access elevation with scope "enrollment" and a 4-hour duration
    And the principal approves the request in the application (MVP, ARB-25k)
    Then the school is notified that access has been opened
    And the agent sees only the ticket's scope for the stated duration
    And every view and write is logged with the associated ticket
    And on expiry, access is closed and the school is notified of the closure

Feature: Restricting a parent's access only on a court decision
  Scenario: Attempt without a decision, then a substantiated restriction
    Given a student with two active legal guardians
    When the principal attempts to remove the second parent's school rights without a supporting document
    Then the operation is denied with a notice that a court decision is required
    When the principal records a court decision with a supporting document
    Then the parent's rights are adjusted according to the decision
    And the restriction is logged and visible in the relationship's history
    And the other parent retains their default rights in full

Feature: Adult student in control of their own data
  Scenario: Restricting parental access upon coming of age
    Given a student who turns 18 with an active account
    When the student is informed of their rights upon reaching majority
    Then they can restrict their parents' access to school, disciplinary, and health data
    And the financial guardian retains access to financial data as long as they remain liable
    And the restriction is logged and notified to the school

Feature: Local system administrator with no elevation path (MVP)
  Scenario: Attempt to reset a principal-track account
    Given a local system administrator of the tenant
    When they attempt to reset the principal's account access
    Then the operation is denied with a notice that dual control by the leadership is required (PER-19)
    And the attempt is logged with author and timestamp
```

## 8. Specific non-functional requirements

- **Systematic server-side access control** on every request, keyed by tenant (INV-17); no right is inferred client-side. Details and performance thresholds in `prd/cross-cutting/32-non-functional-requirements.md`.
- **Immutable log, exportable, kept for five years** (DEC-22); timestamps in the `Africa/Casablanca` timezone (permanently UTC+0 since 20/09/2026, Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026; correction #1 of `prd/research/00-baseline-corrections.md`); storage in UTC.
- **Strengthened authentication** (MFA from MVP for principal's office, administration, accounting, system administrator, and platform accounts; optional for teachers and supervisors; 90-day trusted devices — ARB-25l): baseline §9; mechanisms in `prd/cross-cutting/31-security-privacy.md`.
- **Protection against enumeration** of identifiers (notably the Massar code) in searches accessible to authorized roles (§9).
- **Aggregate exploitation** by the group admin without exposing per-record data (PER-13): consolidated views compute indicators server-side.

## 9. Associated metrics

Tracking indicators (definitions and targets consolidated in `prd/cross-cutting/38-kpi-success-metrics.md`): share of affiliations carrying an unmodified standard role (model simplicity), time between an affiliation closing and effective access invalidation (target: immediate), number of support elevations per school per month (G-32 monitoring), volume of logged sensitive-data views per role (anomaly detection).

## 10. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Support service level at MVP. | **Resolved — ARB-25k**: at MVP, support access on a ticket with the principal's explicit in-app approval, bounded scope and duration, logged (PER-12, SEC-13, `SupportTicket` MVP); full workflow and exportable log in V1. |
| OQ-02 | Identity-file fields directly editable by the parent. | Baseline §8.3 gives the parent "R/W (partial)" without listing the fields. Proposal: the parent's own contact details and preferences, relationship attributes (RG-15), civil status entered when the parent creates a child profile (§6.2); for a child's civil status after linking, correction requests handled by the school (RG-07). Field list to be finalized in review with the enrollment module. |
| OQ-03 | Exact scope of the "sensitive views" that are logged (RG-38). | The baseline cites "identity file, health, finance, discipline". Proposed extension: supporting file documents, bulk exports regardless of domain, and any support view (already covered by PER-12). To be validated in review, including the resulting log volume. Version pacing settled by ARB-25j (views in V1, writes logged from MVP). |
| OQ-04 | Named delegation for the group administrator. | RG-21 forbids merging data, but §8.1 mentions "shared administration". Question: can each school's principal explicitly delegate limited, named rights to the group level (e.g., reading financial files), logged and revocable? Proposal: yes, via an express, per-school, logged, time-bound delegation; to be settled in review. |
| OQ-05 | MFA rollout. | **Resolved — ARB-25l**: MFA from MVP for principal's office, academic direction, registrar's office, accounting, system administrator, and platform roles; optional for teachers, supervisors, and ancillary roles; 90-day trusted devices (PER-17, SEC-02, SEC-04). |
| OQ-06 | Baseline/research divergence on the guardianship regime. | The Family Code reform "adopted in December 2024" per the baseline is actually a proposal report not yet voted as of 09/09/2026 (correction #5 of `prd/research/00-baseline-corrections.md`). RG-14b remains unchanged; default values for the qualities (legal guardian, custodian) remain configurable to absorb a possible future enactment without reworking rights. |
| OQ-07 | **Resolved — DEC-31 (logged deviation, `01` OQ-04):** Online payment: DEC-31 (Fatourati from V1) vs. §12 (online payment out of V1 scope). | Baseline §12 lists "Online payment (CMI, aggregators), direct debit" outside MVP/V1, while DEC-31, confirmed by Q-14, retains "Fatourati (Collect then Aggregator) from V1 as the primary rail, holding no funds". The matrix follows DEC-31: the Finance row of §5.4 carries online payment from V1 (Fatourati), with card payment staying in V2. Divergence logged here per conventions §1.5. |
| OQ-08 | **Resolved — ARB-10 (adult student, MVP):** Matrix extension: "Student: R" on the Health row for the adult student. | Baseline §8.3 gives "Student: —" for Health; matrix §5.2 gives "R (adult student)". Extension justified by RG-02: once 18, the student becomes the account holder and may restrict parental access (PER-09), the baseline cell describing the typical minor student; explained in note N8. Logged here for traceability of the deviation from the baseline. |

## Traceability

| Baseline ID | Coverage in this file |
|---|---|
| §4 (authorization chain) | §1, §2.1 |
| §5.1 (actors, ZSchool operator) | §2.1, §2.2 |
| §6.1 (RG-01, RG-02, RG-03) | §2.5; PER-02, PER-06, PER-09; OQ-08 (Health extension: adult student) |
| §6.4 (RG-12b to RG-16) | §2.5; PER-08; N6, N7 |
| §6.5 (RG-17 to RG-20, DEC-05) | §2.4; PER-01, PER-06, PER-07, PER-11 |
| §6.6 (RG-21, DEC-02) | §2.3; PER-13; N13 |
| §7.1 (administration, subscription) | §2.3, §5.3; PER-13, PER-16 |
| §7.3 (structure, timetable) | Matrix rows 1 and 11; N11 |
| §7.4 (attendance, discipline) | Rows 2 and 5; N3 |
| §7.5 (assessments, report cards) | Rows 3 and 4; N4, N5 |
| §7.6 (documents) | Row 9; N9 |
| §7.7 (finance, DEC-24) | Row 7; N7 |
| §7.8 (communication, DEC-34) | Row 10; N10 |
| §7.13, §7.14 (ancillary, health) | Row 8; PER-16, PER-18; N8 |
| §8.1 (role catalog) | §2.2 to §2.4; PER-01 |
| §8.2 (RG-36 to RG-39) | §3; PER-02, PER-03, PER-04, PER-05, PER-10, PER-11 |
| §8.3 (summary matrix) | §5.2 (detailed reproduction and extension) and §5.3 |
| §9 (security, audit, CNDP) | PER-10, PER-12, PER-17, PER-18; §8; N8, N9 |
| §11 (single plan, activated modules) | PER-16 |
| §12 (scope by version) | "Version" columns of the PER rules; §5.4; OQ-07 (online payment: DEC-31) |
| §13 — C-09 | §1, §2, §3 (permission granularity) |
| §13 — G-05 | §2.1 to §2.4 (platform roles, administrative sub-roles) |
| §13 — G-32 | §2.2; PER-12; N12; OQ-01 |
| §14 — DEC-02 | §2.1, §2.3; PER-13 |
| §14 — DEC-05 | §2.1; PER-01 |
| §14 — DEC-17 | §1, §2.4, §3, §4 (all PER rules) |
| §14 — DEC-20 | §2.5; PER-09; matrix row 8 |
| §14 — DEC-22 | PER-10; §8 |
| §14 — DEC-24 | N7, N9 |
| §14 — DEC-30 | §5.4 (documents, qualified stamp V2) |
| §14 — DEC-31 | §5.4 (online payment, Finance row); OQ-07 |
| §14 — DEC-34 | Row 10; N10 |
| §16 — H-13 | PER-06 (multi-affiliation of part-time teachers) |
| §18 point 5 (complete permissions matrix) | §5 |
| Research correction #1 (timezone) | §8 (log timestamps) |
| Research correction #5 (Family Code) | §2.5; OQ-06 |
| Research correction #18 (part-time teachers, external public-sector teachers) | §2.4 (teacher statuses) |
| ARB-01 (pilot MVP scope; consolidated read-only organization) | §2.1, §2.3; PER-01, PER-13; §5.4; N13 |
| ARB-04, ARB-05, ARB-15 (declared sessions, uncovered session, front-desk justification) | §5.4; N14 |
| ARB-09, ARB-22 (guardian matching, prior history) | §5.4 (identity file) |
| ARB-10 (adult student at MVP) | PER-09 |
| ARB-17f, ARB-19, ARB-20, ARB-21a (progressive publication, QR in V1, MVP finance, moderated threads) | §5.4 |
| ARB-25a (national ID not collected at MVP) | N14 |
| ARB-25j (D4 logging) | §3.3; PER-10; §6; OQ-03 |
| ARB-25k (support at MVP) | PER-12; §7; OQ-01 |
| ARB-25l (MFA) | PER-17; §8; OQ-05 |
| ARB-25m (local system administrator) | §2.4; PER-19; §7 |
