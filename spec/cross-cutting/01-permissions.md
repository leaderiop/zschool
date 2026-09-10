> **Document Control**
>
> | Property       | Value                                                                                                                                                                                 |
> | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-CC-01                                                                                                                                                                         |
> | Revision       | 1.0                                                                                                                                                                                   |
> | Effective Date | 2026-09-09                                                                                                                                                                            |
> | Status         | Draft                                                                                                                                                                                 |
> | Author         | ZSchool Product                                                                                                                                                                       |
> | Classification | Functional Specification — Cross-Cutting                                                                                                                                              |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/cross-cutting/30-roles-permissions-matrix.md` (v0.3), old `PER-01..19` -> `PER-ZS-001..019`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Roles, Permissions and Access Matrix

## 1. Objective and scope

This chapter implements the resolution of **C-09** (`spec/appendices/01-review-history.md`) — "Administration" as a single role replaced by detailed roles and fine-grained permissions — closes gap **G-05** (non-teaching staff, administrative sub-roles, platform roles) and gap **G-32** (ZSchool support access to school data), in line with **[ADR-ZS-028](../decisions/028-detailed-roles-and-fine-grained-permissions.md)**. It produces the **complete permissions matrix** requested in the historical baseline (`spec/appendices/00-project-baseline.md` §18 point 5), extending the earlier §8.3 excerpt into a full data × role matrix.

In scope:

- the role catalog by level (platform, organization, school, individuals);
- the permission composition principles (context, granularity, least privilege);
- the `PER-ZS-NNN` permission rules;
- the complete data × role matrix, consistent with the baseline;
- critical rights-management flows and management interfaces (textual description).

Out of scope (covered elsewhere, without duplicating their requirements):

- authentication, session management and encryption mechanisms (`spec/cross-cutting/02-security-privacy.md`);
- non-functional requirements for performance, availability and observability (`spec/cross-cutting/03-non-functional-requirements.md`, not yet migrated at time of writing);
- Law 09.08 / CNDP formalities and retention periods (`spec/cross-cutting/07-legal-compliance-data-protection.md`, not yet migrated at time of writing; [ADR-ZS-003](../decisions/003-default-retention-durations.md));
- the technical implementation of access control (this document describes observable behavior, not an architecture).

The matrix describes the target state per role; availability of each row by version is given in §5.4, strictly aligned with the historical baseline's version scoping.

## 2. Role catalog

### 2.1 Four role levels

| Level                       | Held by                                                                                                                                                                                                                                                             | Examples                                                                                                      | Scope of rights                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Platform                    | ZSchool operator                                                                                                                                                                                                                                                    | Super-administrator, ZSchool support                                                                          | Provisioning, global configuration, compliance; no default access to school data     |
| Organization (school group) | `Organization` (consolidated read-only at MVP, shared administration and group billing in V1 — [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md); [INV-ZS-073](../invariants.md#inv-zs-073), [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md)) | Group administrator                                                                                           | Consolidated views, management of the group's schools, subscription; no data merging |
| School                      | `School` (tenant) via `SchoolMembership` ([INV-ZS-069](../invariants.md#inv-zs-069), [ADR-ZS-016](../decisions/016-single-affiliation-entity.md))                                                                                                                   | Principal, academic direction, registrar's office, accounting, student life, teachers, ancillary-module roles | Fine-grained permissions per module and per scope, within the tenant                 |
| Individuals                 | `ParentStudentRelationship` ([INV-ZS-063](../invariants.md#inv-zs-063)) and student status ([INV-ZS-051](../invariants.md#inv-zs-051), [INV-ZS-052](../invariants.md#inv-zs-052))                                                                                   | Parent/guardian, student                                                                                      | According to the relationship's qualities, rights, and the school's policy           |

A single account can span several levels (a teacher at one school, a parent at another, a staff member at a third): rights are carried by the relationships, never by the account itself ([INV-ZS-053](../invariants.md#inv-zs-053), [INV-ZS-088](../invariants.md#inv-zs-088), [INV-ZS-030](../invariants.md#inv-zs-030), [INV-ZS-041](../invariants.md#inv-zs-041)).

### 2.2 Platform roles

| Role                        | Description                                                                         | Default rights                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ZSchool super-administrator | Tenant provisioning, global configuration, technical oversight, platform compliance | No access to school data without a logged support procedure; technical operations (tenant creation, module activation) are logged |
| ZSchool support             | On-demand assistance to schools (G-32, `spec/appendices/01-review-history.md`)      | No default access; temporary elevation on an audited ticket, bounded in time and scope (PER-ZS-001)                               |

Both roles are held by dedicated ZSchool team accounts, separate from any external personal account, subject to strengthened authentication (detail in `spec/cross-cutting/02-security-privacy.md`, not yet migrated at time of writing).

### 2.3 Organization role (school group: consolidated read-only at MVP, shared administration in V1 — [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md))

| Role                | Description                                                                                         | Default rights                                                                                                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Group administrator | Group governance: creating and attaching schools, SaaS subscription and billing, consolidated views | Read access to **aggregated** cross-school indicators (headcount, attendance, results, arrears, communication costs); management of the scope (schools, subscription); no per-record data of a tenant by default ([INV-ZS-073](../invariants.md#inv-zs-073), PER-ZS-002) |

The group is not a super-tenant: it does not "see" operational data by default; any potential named delegation is the subject of OQ-ZS-264 (`spec/open-questions.md`, not yet consolidated at time of writing). At MVP ([ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)), the role covers creating the organization, attaching tenants, and reading aggregates (BEH-ZS-004, BEH-ZS-249 read-only); shared administration and consolidated billing (PAK-ZS-001) arrive in V1.

### 2.4 School roles

Standard roles provided by ZSchool ([INV-ZS-089](../invariants.md#inv-zs-089), [ADR-ZS-028](../decisions/028-detailed-roles-and-fine-grained-permissions.md)), instantiated per school and adjustable (§4). Default scope = least privilege ([INV-ZS-091](../invariants.md#inv-zs-091)). The "Version" column indicates when the role is introduced.

| Role                           | Default scope                                                                             | Typical content                                                                                                                                                                             | Version                 |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Principal / administrator      | Entire tenant                                                                             | All tenant functions: configuration, roles, sign-off, closings, publication                                                                                                                 | MVP                     |
| Academic direction             | Entire tenant, academic track                                                             | Structure, assignments, report cards, class councils; primary owner of the matrix's "Structure and timetable" row                                                                           | MVP                     |
| Registrar's office             | Entire tenant, administrative track                                                       | Enrollment, records, documents, communication; editing the timetable grid within the granted scope                                                                                          | MVP                     |
| Accounting / cashier           | Entire tenant, **finance only**                                                           | Fee schedules, invoices, payments, receipts, reminders, cash sessions; no access to school data (grades, discipline, health)                                                                | MVP                     |
| Head supervisor (student life) | All of the school's cycles                                                                | Attendance, discipline, communication with families; full discipline module in V1                                                                                                           | MVP                     |
| Supervisor                     | Cycles assigned to them ([INV-ZS-091](../invariants.md#inv-zs-091))                       | Support attendance-taking, tardiness, student-life follow-up within their scope                                                                                                             | MVP                     |
| Teacher                        | Their own courses (active `TeacherAssignment`, [INV-ZS-011](../invariants.md#inv-zs-011)) | Attendance, grades, lesson log, messages to parents of their students; permanent, part-time, or external public-sector teacher status                                                       | MVP                     |
| Homeroom teacher               | Their class                                                                               | Teacher rights plus a summary view of their class; carried by an attribute of `Class`/`TeacherAssignment`                                                                                   | MVP                     |
| Infirmary                      | Health module only                                                                        | Medical record and alerts; the infirmary visit log is out of scope (`spec/behaviors/14-health-sensitive-data.md` §1)                                                                        | V2+ (health module)     |
| Transport                      | Transport module only                                                                     | Routes, subscriptions, check-in                                                                                                                                                             | V2+ (transport module)  |
| Library                        | Library module only                                                                       | Loans, catalog                                                                                                                                                                              | V2+ (ancillary modules) |
| Local system administrator     | Tenant's technical entitlements                                                           | Managing the tenant's accounts and activations under the principal's authority; no default access to sensitive data; cannot create, modify, or reset a principal-track account (PER-ZS-003) | MVP (optional role)     |

The principal can create additional roles by duplicating and adjusting the standard roles ([INV-ZS-089](../invariants.md#inv-zs-089)); any role creation, modification, or deletion is logged (PER-ZS-004).

### 2.5 Individuals: parent/guardian and student

| Role            | Rights                                                                                                                                                                                                                                                                                         | References                                                                                                                                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent/guardian | Rights carried by the relationship's qualities (legal guardian _wilaya_, custodian _hadana_, financial guardian, emergency contact, pick-up authorization) and by the relationship's access rights (grades, attendance, documents, finance, communication, outing authorizations, e-signature) | [INV-ZS-063](../invariants.md#inv-zs-063), [INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065), [INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-067](../invariants.md#inv-zs-067); [INV-ZS-021](../invariants.md#inv-zs-021) to [INV-ZS-029](../invariants.md#inv-zs-029) |
| Student         | Personal access activated by a legal guardian from the level set by the school (default: 1AC, first year of middle school); once 18, becomes the account holder, may restrict parental access to school, disciplinary, and health data, with the financial guardian retaining financial access | [INV-ZS-051](../invariants.md#inv-zs-051), [INV-ZS-052](../invariants.md#inv-zs-052), [ADR-ZS-001](../decisions/001-adult-student-account-holder.md); [INV-ZS-042](../invariants.md#inv-zs-042), [INV-ZS-043](../invariants.md#inv-zs-043)                                                                    |

No account is shared between two people ([INV-ZS-063](../invariants.md#inv-zs-063), [INV-ZS-030](../invariants.md#inv-zs-030)); restricting a parent's access can only result from a court decision recorded by the school ([INV-ZS-065](../invariants.md#inv-zs-065)). The "legal guardian" and "custodian" qualities are recorded separately ([INV-ZS-066](../invariants.md#inv-zs-066)); the "guardianship regime" setting remains adjustable pending any future change to the Family Code (the 2024 reform is not enacted as of 09/09/2026, per `spec/appendices/00-project-baseline.md`'s research corrections).

## 3. Permission model

### 3.1 Composition

A **fine-grained permission** is the triplet (module, operation, scope):

- **Module**: codes `ADM`, `INS`, `PED`, `VSC`, `EVA`, `DOC`, `FIN`, `COM`, `TRA`, `RAP`, `MAS`, `SAN`, `HEA`, `PRT` (kept unchanged as opaque codes per `spec/process/requirement-id-scheme.md`);
- **Operation**: read (R), write (W: create and modify), configure (module settings within the scope);
- **Scope**: course, group, class, level, cycle, school (least-privilege default: the narrowest scope derivable from the assignments, [INV-ZS-091](../invariants.md#inv-zs-091)).

A **role** is a named set of fine-grained permissions. The standard roles of §2.4 ship with a default composition; the principal can duplicate them, adjust them, and create dedicated roles, within the model's limits (PER-ZS-005, PER-ZS-006): permissions related to global identity ([INV-ZS-057](../invariants.md#inv-zs-057)), consents ([INV-ZS-082](../invariants.md#inv-zs-082)/[INV-ZS-083](../invariants.md#inv-zs-083)), and audited operations ([INV-ZS-056](../invariants.md#inv-zs-056), [INV-ZS-084](../invariants.md#inv-zs-084)) remain reserved to the roles provided by the baseline and cannot be freely assigned.

### 3.2 Contextuality

Permissions are evaluated in the current context: the selected (profile, school) pair, further scoped by the school year and the granted scope ([INV-ZS-088](../invariants.md#inv-zs-088), [INV-ZS-040](../invariants.md#inv-zs-040)). The context switcher ([INV-ZS-053](../invariants.md#inv-zs-053)) lets a multi-profile account toggle between its active contexts; scopes follow the current school year's assignments and change with them (class change, new assignment, affiliation closure).

### 3.3 Logging and least privilege

Every write is attributed to its author and logged immutably at the record level from MVP onward ([ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md), historical alias D4); logging of sensitive-data views (identity file, health, finance, discipline) with author, context, and timestamp ([INV-ZS-090](../invariants.md#inv-zs-090)), in an immutable, exportable log kept for five years ([ADR-ZS-003](../decisions/003-default-retention-durations.md)), ships in V1 (technical detail in `spec/cross-cutting/02-security-privacy.md`, not yet migrated at time of writing — will carry SEC-ZS-017 and SEC-ZS-018). Least privilege applies by default, and any scope broadening is an explicit, logged administrative act ([INV-ZS-091](../invariants.md#inv-zs-091)).

## 4. Permission rules

| ID         | Title                                                                 | Priority |
| ---------- | --------------------------------------------------------------------- | -------- |
| PER-ZS-001 | Logged ZSchool support: temporary elevation on ticket                 | Must     |
| PER-ZS-002 | Group administrator: default aggregates, explicit delegation          | Should   |
| PER-ZS-003 | Bounding the local system administrator                               | Must     |
| PER-ZS-004 | Traceability and notification of rights changes                       | Should   |
| PER-ZS-005 | Standard roles provided, instantiated and adjustable                  | Must     |
| PER-ZS-006 | Fine-grained permissions by module, operation and scope               | Must     |
| PER-ZS-007 | Four-level role catalog                                               | Must     |
| PER-ZS-008 | Contextual permissions by profile and by school                       | Must     |
| PER-ZS-009 | Default least privilege derived from assignments                      | Must     |
| PER-ZS-010 | Multi-profile accounts and context switcher                           | Must     |
| PER-ZS-011 | Immediate revocation of access when a relationship closes             | Must     |
| PER-ZS-012 | Parent rights by quality, court-order-only restriction                | Must     |
| PER-ZS-013 | Student rights: activation, coming of age, parental restriction       | Must     |
| PER-ZS-014 | Logging of writes and of sensitive-data views                         | Must     |
| PER-ZS-015 | Domain separation by permissions: accounting kept out of student life | Must     |
| PER-ZS-016 | Post-closure changes: grace period then audited procedure             | Must     |
| PER-ZS-017 | Permissions bounded by activated modules                              | Should   |
| PER-ZS-018 | Strengthened authentication for privileged roles                      | Must     |
| PER-ZS-019 | Ancillary-module roles bounded to their module                        | Should   |

### PER-ZS-007: Four-level role catalog

> **Invariant:** [INV-ZS-069](../invariants.md#inv-zs-069)
> **See:** [ADR-ZS-016](../decisions/016-single-affiliation-entity.md), [ADR-ZS-028](../decisions/028-detailed-roles-and-fine-grained-permissions.md)
> **Priority:** Must
> **Version:** MVP (platform, school, and individual roles; group administrator in consolidated read-only mode — [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)); V1 (shared administration and group billing)
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: The system MUST offer roles at the four levels of §2: platform (super-administrator,
support), organization (group administrator), school (standard roles of §2.4),
individuals (parent/guardian, student). Every effective right MUST derive from an
active relationship: `SchoolMembership` for staff and teachers,
`ParentStudentRelationship` for guardians, enrollment and activation for the student.
No right MUST be carried by the account itself.

Actors: All roles.

### PER-ZS-008: Contextual permissions by profile and by school

> **Invariant:** [INV-ZS-088](../invariants.md#inv-zs-088)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: Permissions MUST be evaluated in the account's active (profile, school) context: an
account that is a teacher at School A and a parent at School B MUST exercise only
their affiliation rights at School A and only their parental-relationship rights at
School B. A context switch MUST NOT change another context's rights.

Actors: Multi-profile accounts (teacher-parent, parent-staff, multi-school part-time teacher).

### PER-ZS-005: Standard roles provided, instantiated and adjustable

> **Invariant:** [INV-ZS-089](../invariants.md#inv-zs-089)
> **See:** [ADR-ZS-028](../decisions/028-detailed-roles-and-fine-grained-permissions.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: ZSchool MUST provide the standard roles of §2.4, instantiated per school at
onboarding (JMP-ZS-003, `spec/journeys/00-journey-map.md`) and adjustable by the
principal: duplication, adjusting permissions per module and per scope, creating
dedicated roles, restoring the factory composition. Rights reserved by the baseline
(profile merges [INV-ZS-056](../invariants.md#inv-zs-056), post-grace corrections
[INV-ZS-084](../invariants.md#inv-zs-084), support access) MUST NOT appear in any
adjustable role.

Actors: Principal; ZSchool support for factory compositions.

### PER-ZS-006: Fine-grained permissions by module, operation and scope

> **Invariant:** [INV-ZS-089](../invariants.md#inv-zs-089), [INV-ZS-091](../invariants.md#inv-zs-091)
> **See:** [ADR-ZS-028](../decisions/028-detailed-roles-and-fine-grained-permissions.md)
> **Priority:** Must
> **Version:** MVP (triplet applied to standard roles); V1 (full role editor in the interface)
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: Every right of a school role MUST be expressed as a (module, operation, scope)
triplet per §3.1. Read, write, and configuration MUST be separated: having write
access to a module MUST NOT open its configuration, and configuration MUST NOT open
reading of data in other scopes. The default scope granted MUST always be the
narrowest one compatible with the function.

Actors: Principal, academic direction, all school roles.

### PER-ZS-009: Default least privilege derived from assignments

> **Invariant:** [INV-ZS-091](../invariants.md#inv-zs-091), [INV-ZS-011](../invariants.md#inv-zs-011)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-400`](../../features/cross-cutting/per/per-zs-005-supervisor-scope.feature)

REQUIREMENT: A teacher's access to students and their data MUST derive from their active
`TeacherAssignment` records: they MUST see only the students in their courses. A
supervisor MUST see only the cycles assigned to them. A homeroom teacher MUST see a
summary view of their class's students. Any broadening (level, cycle, school) MUST be
an explicit, dated, attributed administrative decision.

Actors: Teacher, homeroom teacher, supervisor, head supervisor. Needs covered: URS-ZS-030 (ENS), URS-ZS-023 (SUR), `spec/urs.md`.

### PER-ZS-010: Multi-profile accounts and context switcher

> **Invariant:** [INV-ZS-053](../invariants.md#inv-zs-053), [INV-ZS-069](../invariants.md#inv-zs-069), [INV-ZS-088](../invariants.md#inv-zs-088)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: An account holding several profiles or affiliations MUST have a context switcher
(profile + school); the data and actions displayed MUST correspond exclusively to
the active context. Part-time teachers working at several schools MUST be able to
switch between schools without logging out (JMP-ZS-004, `spec/journeys/00-journey-map.md`, ENS persona).

Actors: Any multi-profile account.

### PER-ZS-011: Immediate revocation of access when a relationship closes

> **Invariant:** [INV-ZS-071](../invariants.md#inv-zs-071), [INV-ZS-065](../invariants.md#inv-zs-065), [INV-ZS-010](../invariants.md#inv-zs-010)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-401`](../../features/cross-cutting/per/per-zs-011-immediate-revocation.feature)

REQUIREMENT: When an affiliation closes (`SchoolMembership` completed or suspended), access to
the school's data MUST be revoked immediately, with no grace period or delayed
logout; open sessions MUST be invalidated. Data produced (grades entered, attendance
taken, messages) MUST remain in the school, attributed to its author. The same
immediate revocation MUST apply to the suspension or revocation of a parental
relationship and to deactivation of a student account.

Actors: Principal (administrative act); any affected role. Domain event: `AffiliationClosed` (`spec/domain-model.md` §7).

### PER-ZS-012: Parent rights by quality, court-order-only restriction

> **Invariant:** [INV-ZS-063](../invariants.md#inv-zs-063), [INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065), [INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-067](../invariants.md#inv-zs-067), [INV-ZS-068](../invariants.md#inv-zs-068)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-403`](../../features/cross-cutting/per/per-zs-012-court-order-restriction.feature)

REQUIREMENT: By default, all legal guardians and the custodian MUST have access to the student's
school information and receive notifications ([INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065)). Financial-data read access
MUST be carried by the financial-guardian quality (sole or shared, including a third
party). Restricting a parent's access MUST require a court decision recorded by the
school, with a supporting document and an audit trail; no discretionary restriction
MUST be possible. Conflicts between guardians MUST be escalated to the school, which
arbitrates; ZSchool MUST NOT rule on them ([INV-ZS-068](../invariants.md#inv-zs-068)).

Actors: Parent/guardian; school administration (recording court decisions). Needs covered: URS-ZS-044, URS-ZS-046, URS-ZS-049 (GAR), `spec/urs.md`.

### PER-ZS-013: Student rights: activation, coming of age, parental restriction

> **Invariant:** [INV-ZS-042](../invariants.md#inv-zs-042), [INV-ZS-043](../invariants.md#inv-zs-043)
> **See:** [ADR-ZS-001](../decisions/001-adult-student-account-holder.md), [ADR-ZS-051](../decisions/051-adult-student-mvp.md)
> **Priority:** Must
> **Version:** MVP (activation, account ownership at majority, notice, adult student's self-restriction — [ADR-ZS-051](../decisions/051-adult-student-mvp.md))
> **Acceptance:** [`@REQ-ZS-404`](../../features/cross-cutting/per/per-zs-013-adult-student-restriction.feature)

REQUIREMENT: A student's personal access MUST be activated by a legal guardian from the level set
by the school (default: 1AC) and MUST cover their own data per the school's policy.
Once 18, the student MUST become the account holder, MUST be informed of their
rights at the time and at every re-enrollment, and MUST be able to restrict parental
access to school, disciplinary, and health data; the financial guardian MUST retain
access to financial data as long as they remain liable for fees. Every restriction
MUST be logged and notified to the school.

Actors: Student, legal guardian, school administration. Domain event: `StudentTurnsAdult`. Needs covered: URS-ZS-051, URS-ZS-055, URS-ZS-057 (ELE), `spec/urs.md`.

### PER-ZS-014: Logging of writes and of sensitive-data views

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-071](../invariants.md#inv-zs-071)
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md), [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)
> **Priority:** Must
> **Version:** MVP (immutable write logging, security events, support access — historical alias D4, [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)); V1 (log of sensitive-data views, console, export)
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: Every write action and every view of sensitive data (identity file and its
documents, health, finance, discipline) MUST be logged with author, context (tenant,
role, active scope), timestamp, and object viewed. The log MUST be immutable,
exportable by the school, and kept for five years ([ADR-ZS-003](../decisions/003-default-retention-durations.md)).

Actors: All roles; log review: principal, ZSchool support.

### PER-ZS-015: Domain separation by permissions: accounting kept out of student life

> **Invariant:** [INV-ZS-091](../invariants.md#inv-zs-091), [INV-ZS-069](../invariants.md#inv-zs-069)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: The Accounting/cashier role MUST be single-domain: finance only, with no access to
grades, discipline, health, or academic content; identity MUST be visible only for
people linked to financial accounts. Symmetrically, student life MUST have no access
to finance, and a teacher MUST have no access to finance or the administrative file.
A single person may still hold several roles ([INV-ZS-069](../invariants.md#inv-zs-069)); the domains MUST then stay
separated at the permission level and the interface MUST present the contexts
distinctly.

Actors: Accounting, student life, teacher, principal (role composition).

### PER-ZS-001: Logged ZSchool support: temporary elevation on ticket

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-056](../invariants.md#inv-zs-056), [INV-ZS-084](../invariants.md#inv-zs-084)
> **See:** none
> **Priority:** Must
> **Version:** MVP (ticket-based access with the principal's explicit in-app approval, bounded duration, logged — historical alias ARB-25k; `SupportTicket` entity, MVP); V1 (full workflow, exportable log)
> **Acceptance:** [`@REQ-ZS-402`](../../features/cross-cutting/per/per-zs-001-support-elevation.feature)

REQUIREMENT: ZSchool support MUST have no default access to a tenant's data. Any access MUST be
preceded by a ticket stating the school, the reason, the data scope involved, and a
duration; at MVP, elevation MUST additionally require the principal's explicit
approval given in the application; the elevation MUST be bounded by that duration,
revocable at any time, logged end-to-end ([INV-ZS-090](../invariants.md#inv-zs-090)), and notified to the school
(opening and expiry of the access). Support writes MUST be limited to provisioning,
global configuration, and the audited procedures provided by the baseline (profile
merges [INV-ZS-056](../invariants.md#inv-zs-056), post-grace-period corrections [INV-ZS-084](../invariants.md#inv-zs-084)); they MUST be reserved to
the super-administrator or to support with dual logging.

Actors: ZSchool support, super-administrator, principal (notification). Data entities: `SupportTicket`, `MergeOperation`, `AuditLog` (`spec/domain-model.md` §2.7).

### PER-ZS-002: Group administrator: default aggregates, explicit delegation

> **Invariant:** [INV-ZS-073](../invariants.md#inv-zs-073)
> **See:** [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md)
> **Priority:** Should
> **Version:** MVP (consolidated read-only: creating the organization, attaching tenants, aggregates — [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)); V1 (shared administration, group billing, OQ-ZS-264 delegation)
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: The group administrator MUST have default access to cross-school aggregated
indicators (headcount, attendance rate, results, arrears, communication costs) and
to managing the group's scope (schools, subscription). They MUST have no default
access to any school's per-record data; the group MUST NOT open a data merge
([INV-ZS-073](../invariants.md#inv-zs-073), [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md)). Any extension beyond aggregates is subject to an
express delegation (OQ-ZS-264, `spec/open-questions.md`, not yet consolidated at
time of writing).

Actors: Group administrator, principals of the group's schools. Needs covered: URS-ZS-001, URS-ZS-004 (DIR), `spec/urs.md`.

### PER-ZS-004: Traceability and notification of rights changes

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-071](../invariants.md#inv-zs-071), [INV-ZS-052](../invariants.md#inv-zs-052)
> **See:** [ADR-ZS-028](../decisions/028-detailed-roles-and-fine-grained-permissions.md)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-400`](../../features/cross-cutting/per/per-zs-005-supervisor-scope.feature) (indirectly, via the role-assignment logging scenario)

REQUIREMENT: Every role grant, change, or revocation, and every change to a role's scope, MUST be
logged (author, beneficiary, scope, timestamp) and notified to the person concerned;
log and export extensions are governed by PER-ZS-014. The principal MUST have a view
of their school's active roles and their history.

Actors: Principal, academic direction, role beneficiaries.

### PER-ZS-016: Post-closure changes: grace period then audited procedure

> **Invariant:** [INV-ZS-084](../invariants.md#inv-zs-084), [INV-ZS-085](../invariants.md#inv-zs-085), [INV-ZS-024](../invariants.md#inv-zs-024), [INV-ZS-015](../invariants.md#inv-zs-015)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: After an enrollment closes, its data MUST be read-only for the school; correction
MUST remain possible during a configurable grace period (default: 60 days) by the
usual write roles, then only through an audited procedure (principal role with
justification, or support per PER-ZS-001). A published report card MUST NEVER be
edited: any correction MUST create a new version ([INV-ZS-085](../invariants.md#inv-zs-085)). Period-closing locks
MUST apply to all write roles.

Actors: Principal's office, registrar's office, teachers (grace period); ZSchool support (audited procedure).

### PER-ZS-017: Permissions bounded by activated modules

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1 (activation management); the bound applies from MVP onward for modules not yet shipped
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: Permissions on a module MUST be inoperative until the module is activated for the
tenant: the infirmary, transport, and library roles MUST open no access before the
corresponding modules ship (V2+), and roles created by duplication MUST inherit this
bound. Activating a module MUST make the permissions effective without a new grant.

Actors: Principal, group administrator, super-administrator.

### PER-ZS-018: Strengthened authentication for privileged roles

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** none
> **Priority:** Must
> **Version:** MVP (principal's office, administration, accounting, system administrator, platform roles; optional for teachers and supervisors — historical alias ARB-25l)
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: Multi-factor authentication MUST be mandatory from MVP onward for the principal,
academic direction, registrar's office, accounting, and local system administrator
roles, as well as for platform accounts (super-administrator, support), which MUST
be further subject to strengthened controls (separate accounts, short session
expiry, re-validation on PER-ZS-001 elevation). For teachers, supervisors, and
ancillary-module roles, the second factor MUST be optional and MAY be activated by
the school; every role MUST benefit from trusted devices (90 days, SEC-ZS-006) to
limit repeated OTPs on mobile. Mechanism detail is covered by
`spec/cross-cutting/02-security-privacy.md` (not yet migrated at time of writing);
this rule sets the functional requirement per role.

Actors: All school and platform roles.

### PER-ZS-019: Ancillary-module roles bounded to their module

> **Invariant:** none
> **See:** [ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md)
> **Priority:** Should
> **Version:** V2+ (health module and ancillary services)
> **Acceptance:** none (organizational rule, not a scenario-bearing behavior)

REQUIREMENT: The infirmary, transport, and library roles MUST carry permissions limited to their
module: the nurse MUST access only the health records of students flagged to them and
the alerts, the transport lead MUST access only routes and subscriptions, the library
lead MUST access only the catalog and loans; none of them MUST access grades,
discipline, or finance. Health data MUST NEVER be transferred automatically and its
processing MUST follow prior CNDP authorization (F112).

Actors: Infirmary, transport, library, principal's office.

### PER-ZS-003: Bounding the local system administrator

> **Invariant:** [INV-ZS-089](../invariants.md#inv-zs-089), [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-091](../invariants.md#inv-zs-091)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-405`](../../features/cross-cutting/per/per-zs-003-local-admin-no-elevation.feature)

REQUIREMENT: The "Local system administrator" role MUST manage the tenant's accounts and
activations without constituting an elevation path: it MUST NOT create or modify
roles, or reset access for an account holding a principal or academic-direction role;
those operations MUST require dual control (principal + a second member of the
leadership team, or principal + ZSchool support on a PER-ZS-001 ticket). It MUST NOT
grant itself an additional role. Any out-of-scope attempt MUST be denied and logged.

Actors: Local system administrator, principal, ZSchool support.

## 5. Complete permissions matrix

### 5.1 Legend

| Symbol       | Meaning                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------- |
| R            | Read                                                                                         |
| W            | Write (create and modify)                                                                    |
| —            | No access                                                                                    |
| (partial)    | Subset of the data, detailed in note N                                                       |
| (aggregated) | Aggregated indicators, no per-record data (PER-ZS-002)                                       |
| †            | Sensitive data: viewing it is logged ([INV-ZS-090](../invariants.md#inv-zs-090), PER-ZS-014) |
| *            | Temporary ZSchool support access on an audited, bounded, notified ticket (G-32, PER-ZS-001)  |

Columns: the student has an activated account ([INV-ZS-051](../invariants.md#inv-zs-051)); the parent exercises their rights according to their qualities ([INV-ZS-064](../invariants.md#inv-zs-064)/[INV-ZS-065](../invariants.md#inv-zs-065)); "Course teacher" designates the teacher holding an active `TeacherAssignment`; "Homeroom teacher" combines teacher rights with a summary view of their class; "Student life" covers the head supervisor (whole school) and the supervisor (assigned cycles, [INV-ZS-091](../invariants.md#inv-zs-091)); "Principal's office" covers the principal and the academic direction, with nuances noted below.

### 5.2 Matrix (12 data rows × 10 role columns)

| Data                                                      | Student           | Parent                      | Course teacher      | Homeroom teacher | Student life                 | Registrar  | Accounting  | Principal's office | Group admin                  | ZSchool support      |
| --------------------------------------------------------- | ----------------- | --------------------------- | ------------------- | ---------------- | ---------------------------- | ---------- | ----------- | ------------------ | ---------------------------- | -------------------- |
| Timetable (published grids)                               | R                 | R                           | R                   | R                | R                            | R/W        | —           | R/W                | R (aggregated)               | R*                   |
| Attendance and punctuality †                              | R                 | R/W (justification, N14)    | W (own courses)     | R                | R/W                          | R          | —           | R/W                | R (aggregated)               | R*                   |
| Unpublished grades                                        | —                 | —                           | W (own courses)     | R (own class)    | —                            | —          | —           | R/W                | —                            | R* (explicit ticket) |
| Published report cards and transcripts                    | R                 | R                           | R (own subjects)    | R (own class)    | R                            | R          | —           | R/W                | R (aggregated)               | R*                   |
| Discipline †                                              | R (partial)       | R                           | R (own students)    | R                | R/W                          | —          | —           | R/W                | R (aggregated)               | R*                   |
| Identity file †                                           | R (own data)      | R/W (partial)               | —                   | R (partial)      | R (record; documents —, N14) | R/W        | R (partial) | R/W                | —                            | R*                   |
| Finance †                                                 | —                 | R (if entitled)             | —                   | —                | —                            | R          | R/W         | R/W                | R (consolidated)             | R*                   |
| Health † (V2 module)                                      | R (adult student) | R/W                         | —                   | R (alerts)       | R (alerts)                   | —          | —           | R                  | —                            | R* (explicit ticket) |
| Documents (certificates, file records) †                  | R (published)     | R (configured self-service) | —                   | —                | —                            | R/W        | R (partial) | R/W                | —                            | R*                   |
| Communication (announcements, messages, threads, notices) | R (own concerns)  | R/W (partial)               | R/W (own courses)   | R/W (own class)  | R/W (assigned cycles)        | R/W        | —           | R/W                | R (aggregated costs)         | R*                   |
| Academic structure and timetable editing                  | —                 | —                           | R (own assignments) | R (own class)    | —                            | R/W (grid) | —           | R/W                | R (consolidated)             | R/W* (ticket)        |
| Configuration (settings, roles, subscription, channels)   | —                 | —                           | —                   | —                | —                            | —          | —           | R/W                | R/W (group and subscription) | R/W* (ticket)        |

Correspondence with the baseline: the eight "Student" through "Principal's office" columns reproduce the historical baseline's role matrix row by row, with two clarifications carried in note N14 (parental write access limited to submitting an absence justification; student-life reads on the identity-file row limited to the record, excluding documents). The "Timetable" row of the baseline is split here into viewing (row 1) and editing/structure (row 11); the baseline's rights (registrar R/W, principal's office R/W) are carried by these two rows. Adding the "Group admin" and "ZSchool support" columns and the "Documents", "Communication", "Structure", and "Configuration" rows extends the matrix without contradicting the baseline excerpt. The "Health" row details the baseline's "Student: —" cell per [INV-ZS-052](../invariants.md#inv-zs-052): once an adult, the student holds their own account, views their health record, and may restrict parental access (the baseline cell describes the typical minor student).

### 5.3 Nuance notes

- **N1 — Active context.** All rights above are exercised within the active (profile, school, year) context (PER-ZS-008, [INV-ZS-088](../invariants.md#inv-zs-088)); an account that combines two roles in the same column (e.g., secretary-cashier) exercises the combined rights of both roles, presented per context ([INV-ZS-069](../invariants.md#inv-zs-069), PER-ZS-015).
- **N2 — Homeroom teacher.** Homeroom teacher rights = teacher rights + summary view of their class; their read access to unpublished grades covers their class, with no write access to other teachers' grades.
- **N3 — Student life.** The head supervisor operates across all of the school's cycles; the supervisor only on their assigned cycles ([INV-ZS-091](../invariants.md#inv-zs-091)). Full disciplinary writes (incidents, sanctions, councils) ship with the full student-life module in V1. At MVP, simple incident logging and attendance follow-up are covered.
- **N4 — Report card immutability.** "Principal's office" write access on published report cards means publishing, locking the period, and creating a corrective version; no role edits a published report card ([INV-ZS-085](../invariants.md#inv-zs-085), [INV-ZS-015](../invariants.md#inv-zs-015)). After enrollment closes, correction follows PER-ZS-016 (grace period then audited procedure).
- **N5 — Grade locking.** After a period closes, teacher writes are blocked; the "W (own courses)" cell applies outside closure. The principal's office retains write access for closing, general remarks, and grace-period corrections.
- **N6 — Identity file on the parent side.** The parent edits their own contact details and preferences, their relationship's contextual attributes ([INV-ZS-067](../invariants.md#inv-zs-067): outing authorization, people authorized to pick up the child, communication preferences), and the civil-status data declared when they create a child profile; corrections to a child's identity data follow [INV-ZS-057](../invariants.md#inv-zs-057) (logged, notified to the schools concerned). The exact set of fields directly editable by the parent is raised in OQ-ZS-262 (`spec/open-questions.md`, not yet consolidated at time of writing).
- **N7 — Finance.** Parental read access is carried by the financial-guardian quality, including for a third party who is not a legal guardian ([INV-ZS-064](../invariants.md#inv-zs-064)); after leaving, the parent retains access to their payment history, and the financial guardian retains the financial relationship until settled ([INV-ZS-062](../invariants.md#inv-zs-062), [INV-ZS-018](../invariants.md#inv-zs-018)). The registrar's office reads finance; collecting payments falls to the Accounting/cashier role, which the "secretary-cashier" persona holds by combination (N1). Generating official documents is never blocked for arrears ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [INV-ZS-016](../invariants.md#inv-zs-016)).
- **N8 — Health.** V2 module; non-medical roles' access is limited to alerts (allergies, emergency instructions) for the homeroom teacher and student life, and to module management for the principal's office. Processing is subject to prior CNDP authorization (F112); never transferred automatically ([ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md), [INV-ZS-083](../invariants.md#inv-zs-083)); the adult student views their own record and may restrict parental access ([INV-ZS-052](../invariants.md#inv-zs-052), PER-ZS-013).
- **N9 — Documents.** Generation by the registrar's office (and configured parental self-service, V1) is never conditioned on any dispute, including a financial one ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)); file records (birth certificates, national ID, court decisions) are strongly encrypted and viewing them is logged ([INV-ZS-090](../invariants.md#inv-zs-090)). Accounting only reads its own financial documents (invoices, receipts).
- **N10 — Communication.** Parent–teacher threads default to moderated mode: the teacher or the school opens the thread, the parent replies, parental thread-opening is configurable; the principal's office may view threads, which is disclosed to users ([ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md)). Student read access covers targeted announcements and content concerning them. Financial reminders are produced by the finance module and do not require the communication role's write access for accounting.
- **N11 — Structure and timetable.** Primary owner: academic direction (structure, assignments, councils); the registrar's office edits the grid within the granted scope. Cloning year N to N+1 ([INV-ZS-077](../invariants.md#inv-zs-077)) and publishing grids fall to the principal's office. Teachers and homeroom teachers have read access to their own scope; conflict detection (teacher, room, class) is an editing function.
- **N12 — ZSchool support.** No default access; every cell marked * assumes a ticket with reason, scope, and duration (PER-ZS-001). Support writes (R/W*) are limited to provisioning, global configuration, and the baseline's audited procedures (merges [INV-ZS-056](../invariants.md#inv-zs-056), post-grace corrections [INV-ZS-084](../invariants.md#inv-zs-084)); viewing unpublished grades and health data requires an explicit ticket naming those categories. Every elevation is notified to the school and logged.
- **N13 — Group admin.** Aggregated reads reveal no per-record data (PER-ZS-002, [INV-ZS-073](../invariants.md#inv-zs-073)); group management covers creating and attaching schools and the subscription. A school's internal academic settings remain under its own principal's authority. At MVP, the consolidated view is read-only ([ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)).
- **N14 — Review clarifications.** Parental write access on the "Attendance" row is limited to submitting an absence justification with a supporting document (URS-ZS-038, BEH-ZS-087); student life may also record a justification on a guardian's behalf, logged as "entered by the school". Student life's read access on the "Identity file" row covers the record (civil status, contacts, guardians' qualities) and never the supporting documents (national ID, birth certificate, court decisions), which are reserved to the registrar's office and the principal's office (SEC-ZS-016). Adults' national ID numbers are not collected at MVP.

### 5.4 Row availability by version

Compliance with the historical baseline's version scoping (the §5.2 table describes the target state per role):

| Row                                      | MVP                                                                                                                                                                                                 | V1                                                                                           | V2+                                                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Timetable (viewing and editing)          | Basic structure (classes, subjects); declared sessions per course and slot, without grid or rooms                                                                                                   | Grids with conflict detection and variants (Ramadan, exams)                                  | Automatic generation                                                                                      |
| Attendance and punctuality               | Attendance per declared session, notification aggregated per day, justification (parent or front desk), uncovered session                                                                           | Full student life (tardiness, early departures, exemptions, thresholds)                      | —                                                                                                         |
| Unpublished grades                       | Entry and averages; configurable progressive publication; year-end decisions and remarks in wave 2                                                                                                  | Locks, full class-council preparation                                                        | —                                                                                                         |
| Published report cards and transcripts   | Immutable bilingual report cards; annual transcripts (wave 2)                                                                                                                                       | Verification QR code, cumulative transcripts                                                 | —                                                                                                         |
| Discipline                               | Simple incident logging                                                                                                                                                                             | Full discipline (sanctions, councils, conduct grade)                                         | —                                                                                                         |
| Identity file                            | Creation, matching (students and guardians), corrections, merge by ZSchool support; declared prior history                                                                                          | Merge by an authorized school role                                                           | —                                                                                                         |
| Finance                                  | Fee schedule, payment plan, payments (including family split payment and logged cancellation), numbered receipts, arrears, reminders, cheques, sibling discount, account statement, parent contract | Cash sessions, compliant invoices, negotiated discounts and scholarships, accounting exports | Online payment (Fatourati from V1 per [ADR-ZS-031](../decisions/031-online-payment-rails.md), card in V2) |
| Health                                   | —                                                                                                                                                                                                   | —                                                                                            | Health module (F112, alerts)                                                                              |
| Documents                                | Immediate enrollment documents, front-desk enrollment certificate, PDF exit file, batch certificates (wave 2)                                                                                       | Full documents module, self-service, QR code                                                 | Qualified stamp ([ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md))                    |
| Communication                            | Announcements, messages, moderated in-app threads, in-app and SMS notifications; WhatsApp utility limited to attendance notifications (minimal templates)                                           | Generalized WhatsApp, push, generalized moderated threads, notices                           | —                                                                                                         |
| Academic structure and timetable editing | Basic structure, assignments, uncovered session, N+1 cloning in wave 2                                                                                                                              | Grids, conflicts, variants                                                                   | Automatic generation                                                                                      |
| Configuration                            | Basic setup, standard roles, MFA for privileged roles, consolidated read-only organization, write logging                                                                                           | Shared group administration, full audit log                                                  | —                                                                                                         |

## 6. Role management in the interface

Screens described in text (no mockups); screen identifiers remain carried by the module chapters.

- **"Members and roles" screen (school administration, EN/AR).** List of the tenant's active affiliations with role(s), scope, status, and dates; search by name; actions: invite, assign a standard role, adjust a scope, suspend, close (with a reminder of immediate revocation, PER-ZS-011). Every sensitive action requires confirmation and produces a log entry ([INV-ZS-090](../invariants.md#inv-zs-090)).
- **Role-editing screen.** Column view: modules in rows, operations (read, write, configure) and scopes in columns; checkboxes; a readable indication of the effective scope ("3 classes, 1 cycle"); duplicating a standard role, restoring factory settings; blocking of rights reserved by the baseline (merges, audited corrections) with an explanatory message (PER-ZS-005).
- **"Audit log" view (principal's office).** Log filterable by author, period, action type (write, sensitive view, rights change, support access), exportable (PER-ZS-014, [ADR-ZS-003](../decisions/003-default-retention-durations.md)); read-only. At MVP, the view is limited to the write history of a record (historical alias D4); the full console ships in V1.
- **Homeroom teacher summary view.** For their class: headcount, today's absences, student-life alerts, entry status, period averages; read-only beyond their own courses (N2).
- **Support console (platform).** Ticket queue, elevation request creation (school, reason, scope, duration), a visible countdown, automatic notification to the school, an access log attached to the ticket when it closes (PER-ZS-001, G-32).

## 7. Critical flows

Acceptance criteria extracted to `features/cross-cutting/per/*.feature`, one file per scenario, tagged `@REQ-ZS-400` through `@REQ-ZS-405`:

| Feature                                                 | Tag           | Covers                 |
| ------------------------------------------------------- | ------------- | ---------------------- |
| Assigning a role and the immediate effect of its scope  | `@REQ-ZS-400` | PER-ZS-009, PER-ZS-004 |
| Immediate access revocation when an affiliation closes  | `@REQ-ZS-401` | PER-ZS-011             |
| Temporary elevation of ZSchool support on a ticket      | `@REQ-ZS-402` | PER-ZS-001             |
| Restricting a parent's access only on a court decision  | `@REQ-ZS-403` | PER-ZS-012             |
| Adult student in control of their own data              | `@REQ-ZS-404` | PER-ZS-013             |
| Local system administrator with no elevation path (MVP) | `@REQ-ZS-405` | PER-ZS-003             |

## 8. Specific non-functional requirements

- **Systematic server-side access control** on every request, keyed by tenant ([INV-ZS-001](../invariants.md#inv-zs-001)); no right is inferred client-side. Details and performance thresholds in `spec/cross-cutting/03-non-functional-requirements.md` (not yet migrated at time of writing).
- **Immutable log, exportable, kept for five years** ([ADR-ZS-003](../decisions/003-default-retention-durations.md)); timestamps in the `Africa/Casablanca` timezone (permanently UTC+0 since 20/09/2026, Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026); storage in UTC.
- **Strengthened authentication** (MFA from MVP for principal's office, administration, accounting, system administrator, and platform accounts; optional for teachers and supervisors; 90-day trusted devices): `spec/cross-cutting/02-security-privacy.md` (not yet migrated at time of writing).
- **Protection against enumeration** of identifiers (notably the Massar code) in searches accessible to authorized roles.
- **Aggregate exploitation** by the group admin without exposing per-record data (PER-ZS-002): consolidated views compute indicators server-side.

## 9. Associated metrics

Tracking indicators (definitions and targets consolidated in `spec/metrics.md`): share of affiliations carrying an unmodified standard role (model simplicity), time between an affiliation closing and effective access invalidation (target: immediate), number of support elevations per school per month (G-32 monitoring), volume of logged sensitive-data views per role (anomaly detection).

## 10. Open questions

Open questions for this chapter are tracked in `spec/open-questions.md` (built in a later migration phase; the frozen `spec/process/id-migration-map.md` already reserves OQ-ZS-261 through OQ-ZS-268 for this file's eight original questions).

## Traceability

Full cross-reference coverage for this chapter is consolidated in `spec/traceability.md` (built in a later migration phase).
