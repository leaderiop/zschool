> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-10                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification                                      |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/19-teacher-career-network.md` (v0.3), old `FR-CAR-01..19` -> `BEH-ZS-221..239`, old `ECR-CAR-01..06` -> `SCR-ZS-121..126`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Teacher Career and Network (CAR)

## 1. Objective and scope

**Objective.** This module carries the **relationship between a person and a school** (the `SchoolMembership` entity, a single affiliation link) and the **teacher's portable career**: a professional profile belongs to the teacher, time spent at ZSchool schools becomes "verified" periods, and — in V2 and beyond — a discreet professional network enables searches, applications, and availability signals without ever exposing a job search to the current employer.

**Scope included:**

| Scope | Content | Version |
|---|---|---|
| Professional profile | Profile carried by the teacher (degrees, subjects, levels, languages, teaching authorization, experience), "verified" affiliation periods, "unverified" non-ZSchool experience, cross-school confidentiality | V1 |
| AREF compliance | Tracking of external public-sector teachers: authorizations (preliminary/final), deadlines, the global 8-hour/week cap (cumulative total visible to the teacher only; a binary alert to the school on consent, [ADR-ZS-064](../decisions/064-teacher-career-rules.md)a), a monthly list prepared by the platform; indicator of the share of permanent teachers (BEH-ZS-239, [ADR-ZS-064](../decisions/064-teacher-career-rules.md)c) | V1 |
| Minimal school directory | Minimal public read-only directory (name, city, cycles — [INV-ZS-075](../invariants.md#inv-zs-075)), **carried by BEH-ZS-017** (`spec/behaviors/01-administration-onboarding-subscription.md`) and consumed here for transfer-destination search and, in V2+, for the network (BEH-ZS-234 as a reference) | MVP (minimal directory); V2+ (network uses) |
| Professional network | Search, applications, invitations, acceptance, availability, "open to opportunities" status invisible to active employers | V2+ |

**Out of scope:**

| Out of scope | Reference |
|---|---|
| Assigning teachers to courses (`TeacherAssignment`), timetable, lesson planner | `spec/behaviors/03-academic-structure-timetables.md` |
| Attendance, grade entry, communication with parents: exercising the permissions derived from the affiliation, not managed here | `spec/behaviors/03-academic-structure-timetables.md`, `spec/behaviors/04-attendance-student-life-discipline.md`, `spec/behaviors/05-assessments-grades-report-cards.md`, `spec/behaviors/08-communication-notifications.md` |
| Account creation, identity matching and claiming, bulk Excel import of staff | `spec/behaviors/01-administration-onboarding-subscription.md` |
| Payroll, pay slips, social security filings (CNSS): no coverage in the founding document; ZSchool manages the affiliation relationship, not payroll | Out of scope (no requirement) |
| Rating, evaluating, or cross-recommending teachers ↔ schools | Forbidden at every version ([ADR-ZS-006](../decisions/006-no-teacher-school-cross-rating.md), see BEH-ZS-238) |
| Detailed job postings, a recruitment marketplace | Out of scope; V2 is limited to search, applications, and availability |

## 2. Users and use cases

| Actor | Use case | Version |
|---|---|---|
| School leadership | Invite a teacher or a staff member, maintain the affiliation register, close or suspend an affiliation, track AREF authorizations for their external public-sector teachers, prepare the monthly AREF list | MVP (register); V1 (AREF) |
| Front office | Create affiliations at the start of the year (often in bulk after an Excel import), follow up on pending invitations | MVP |
| Teacher | Accept an invitation, hold multiple affiliations at once, switch context, maintain their professional profile, see their verified periods; in V2, signal availability and apply discreetly | MVP (affiliations); V1 (profile); V2 (network) |
| Non-teaching staff member | Accept their invitation, see their affiliation and their permissions | MVP |
| Person outside ZSchool | Browse the minimal directory, create an identity, apply (V2) | MVP (minimal directory); V2+ (application) |
| ZSchool (operator) | Guarantee profile confidentiality and that job searches are never disclosed; no viewing of profiles outside a logged support procedure | All versions |

Needs covered: [URS-ZS-026](../urs.md) (single profile across multiple schools), [URS-ZS-031](../urs.md) (portable, confidential professional profile), [URS-ZS-032](../urs.md) (applying without notifying the employer), [URS-ZS-007](../urs.md) (fine-grained roles and permissions). Reference persona: Khadija, a part-time teacher in two schools in Rabat (`spec/urs.md`; historical hypothesis H-13, `spec/appendices/01-review-history.md`); the 8-hour AREF cap does not apply to her. The "external public-sector teacher" case is illustrated by a secondary character, Hassan, a permanent public-school teacher working part-time at School A (a journey step of `spec/journeys/04-part-time-teacher.md`, [ADR-ZS-064](../decisions/064-teacher-career-rules.md)d).

## 3. Key journeys

`spec/journeys/00-journey-map.md` has no end-to-end journey dedicated to the teacher's career (the network is explicitly out of MVP, per [INV-ZS-087](../invariants.md#inv-zs-087) and [ADR-ZS-006](../decisions/006-no-teacher-school-cross-rating.md)). The anchor points are:

- **JMP-ZS-003** (school onboarding): inviting teachers and staff when the tenant is created ([INV-ZS-070](../invariants.md#inv-zs-070) is cited by the journey map); bulk start-of-year affiliations extend this journey.
- **JMP-ZS-004** (claiming an identity): the invited teacher claims their identity and account, then accepts their affiliation; identity matching avoids duplicates across schools.
- `spec/journeys/04-part-time-teacher.md` (the teacher's detailed journey): holding two schools at once, switching context, maintaining the profile; the V2 network plugs into it without a new identity structure.

The detailed invitation → acceptance → activation flow is normalized by BEH-ZS-222 below; journeys reference it without re-describing it.

## 4. Functional behaviors

| ID | Title | Priority |
|---|---|---|
| BEH-ZS-221 | Maintain a single affiliation register | Must |
| BEH-ZS-222 | Create an affiliation by invitation with bilateral acceptance | Must |
| BEH-ZS-223 | Allow simultaneous multi-school, multi-role affiliations | Must |
| BEH-ZS-224 | Close an affiliation with immediate access removal and retention of attributed data | Must |
| BEH-ZS-225 | Suspend and later resume an affiliation | Must |
| BEH-ZS-226 | Carry roles and fine-grained permissions on the affiliation | Must |
| BEH-ZS-227 | Maintain the professional profile carried by the teacher | Should |
| BEH-ZS-228 | Mark affiliation periods as "verified" | Should |
| BEH-ZS-229 | Declare non-ZSchool experience as "unverified" | Should |
| BEH-ZS-230 | Guarantee profile confidentiality between schools | Should |
| BEH-ZS-231 | Track AREF authorizations of external public-sector teachers | Should |
| BEH-ZS-232 | Track the global 8-hour/week cap for external public-sector teachers | Should |
| BEH-ZS-233 | Prepare the monthly list of external public-sector teachers for AREF | Should |
| BEH-ZS-234 | Publish a minimal public school directory | Must |
| BEH-ZS-235 | Professional network: search, application, invitation, acceptance | Should |
| BEH-ZS-236 | Maintain an "open to opportunities" status invisible to active employers | Should |
| BEH-ZS-237 | Declare selectively shared availability | Could |
| BEH-ZS-238 | Forbid any cross-rating between teachers and schools | Must |
| BEH-ZS-239 | Track the share of permanent teachers | Should |

### BEH-ZS-221: Maintain a single affiliation register

> **Invariant:** [INV-ZS-009](../invariants.md#inv-zs-009), [INV-ZS-069](../invariants.md#inv-zs-069)
> **See:** [ADR-ZS-016](../decisions/016-single-affiliation-entity.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-194`](../../features/car/fr-car-01-single-affiliation-register.feature)

REQUIREMENT: For each person linked to the school, a single affiliation entity MUST carry
             one or more roles (teacher, principal, front-office staff, accountant, head
             supervisor, supervisor, nurse, driver, system administrator…), a contract
             nature (permanent, part-time, intern, contractor, and "external public-sector
             teacher", see OQ-ZS-131), start and end dates, a status among invited,
             active, suspended, ended, and contextual permissions. An affiliation that has
             been active MUST NEVER be deleted: it MUST be closed with a reason and a
             date. The register MUST be viewable by leadership and the front office,
             filterable by status, role, contract nature, and school year.

Research correction no. 18 documents the "external public-sector teacher" contract nature.

### BEH-ZS-222: Create an affiliation by invitation with bilateral acceptance

> **Invariant:** [INV-ZS-031](../invariants.md#inv-zs-031)
> **See:** none
> **Priority:** Must
> **Version:** MVP (invitation and acceptance); V2+ (spontaneous application via the directory)
> **Acceptance:** [`@REQ-ZS-195`](../../features/car/fr-car-02-invitation-and-bilateral-acceptance.feature)

REQUIREMENT: The school MUST invite a person identified by their mobile phone number
             (primary identifier) or their email address: a named invitation, with
             proposed roles and contract nature, sent by in-app and SMS notification
             (primary contact identifier, [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md)), email remaining optional and
             never required ([INV-ZS-044](../invariants.md#inv-zs-044)). The person MUST accept or decline; moving
             from status "invited" to status "active" MUST occur only after acceptance by
             both parties (the invitation opens no access until it is accepted). A person
             MAY file an application toward a directory school (V2+, with the directory);
             the same bilateral principle applies. Unaccepted invitations MUST expire
             (configurable duration, default: 30 days) and stay viewable in the register.

### BEH-ZS-223: Allow simultaneous multi-school, multi-role affiliations

> **Invariant:** [INV-ZS-009](../invariants.md#inv-zs-009), [INV-ZS-088](../invariants.md#inv-zs-088), [INV-ZS-040](../invariants.md#inv-zs-040)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-196`](../../features/car/fr-car-03-simultaneous-multi-affiliation.feature)

REQUIREMENT: A person MUST be able to hold several active affiliations at once in
             different schools and combine several roles in a single school. No cap on
             the number of active affiliations MAY be imposed by the platform. Each
             affiliation MUST carry its own permissions; the interface MUST offer a
             context selector (profile × school), and switching MUST NEVER lose
             in-progress entries. Teacher dashboards and daily tools MUST work per
             context.

About half the private-sector teaching body works part-time across several schools (H-13, `spec/appendices/01-review-history.md`).

### BEH-ZS-224: Close an affiliation with immediate access removal and retention of attributed data

> **Invariant:** [INV-ZS-010](../invariants.md#inv-zs-010), [INV-ZS-072](../invariants.md#inv-zs-072) (verified periods maintained, V1 via BEH-ZS-228)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-197`](../../features/car/fr-car-04-closing-an-affiliation.feature)

REQUIREMENT: Leadership MUST close an affiliation, recording a reason (resignation, end
             of contract, dismissal, departure) and an end date: immediate, past, or
             **scheduled** (a known future date, end of contract) — in the latter case,
             the affiliation MUST stay active until that date and the person's courses
             MUST appear as "to be reassigned before <date>" in the academic-structure
             module; closure MUST execute automatically on that date. Upon closure, the
             person's access to the school's data MUST be removed immediately: timetable
             sessions, classes, entries, communication threads. Data produced by the
             person during their affiliation (entered grades, attendance taken, messages
             sent) MUST stay with the school, attributed to its author: no deletion, no
             automatic anonymization. Past affiliation periods MUST stay viewable by the
             person from their "My affiliations" area (MVP); their display as "verified"
             periods in the professional profile is BEH-ZS-228 (V1). The closure event
             MUST be notified to the parties and logged.

### BEH-ZS-225: Suspend and later resume an affiliation

> **Invariant:** [INV-ZS-010](../invariants.md#inv-zs-010) (access removal by analogy), [INV-ZS-031](../invariants.md#inv-zs-031) (statuses)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-198`](../../features/car/fr-car-05-suspending-and-resuming-affiliation.feature)

REQUIREMENT: Leadership MAY suspend an active affiliation (long absence, an
             investigation, leave) with dates and a reason; during suspension, the
             person's effective rights over the school MUST be removed as in a closure,
             without closing. Resumption MUST restore the affiliation and its permissions
             without recreation; the suspension/resumption history MUST be kept.

### BEH-ZS-226: Carry roles and fine-grained permissions on the affiliation

> **Invariant:** [INV-ZS-088](../invariants.md#inv-zs-088), [INV-ZS-089](../invariants.md#inv-zs-089), [INV-ZS-091](../invariants.md#inv-zs-091), [INV-ZS-040](../invariants.md#inv-zs-040), [INV-ZS-041](../invariants.md#inv-zs-041)
> **See:** [ADR-ZS-028](../decisions/028-detailed-roles-and-fine-grained-permissions.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-199`](../../features/car/fr-car-06-fine-grained-permissions.feature)

REQUIREMENT: Each affiliation MUST carry the person's roles at the school; roles MUST be
             made up of fine-grained permissions (read/write per module and per scope:
             class, level, whole school) based on role templates provided by ZSchool and
             editable by the school. Permissions MUST be contextual: the rights of a
             single account MUST differ by (profile, school) pair. Least privilege MUST
             apply: a teacher's rights over students MUST derive from their active course
             assignments. Every role or permission change MUST be logged.

Rule detail lives in `spec/cross-cutting/01-permissions.md`.

### BEH-ZS-227: Maintain the professional profile carried by the teacher

> **Invariant:** [INV-ZS-072](../invariants.md#inv-zs-072)
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario carried over from the source)

REQUIREMENT: The teacher MUST create and own their professional profile, independent of
             any school: degrees (declared, never certified by the platform), subjects
             taught, levels (pre-school through baccalaureate), languages of instruction,
             teaching authorization (qualification, civil-service or file number where
             relevant), experience. Schools MUST NOT edit this global profile; they feed
             it indirectly through verified affiliation periods (BEH-ZS-228). The profile
             MAY exist without an active affiliation and without an activated account.

Degree verification stays outside the platform's scope (a closed baseline review point, `spec/appendices/01-review-history.md`, G-23).

### BEH-ZS-228: Mark affiliation periods as "verified"

> **Invariant:** [INV-ZS-072](../invariants.md#inv-zs-072), [INV-ZS-087](../invariants.md#inv-zs-087), [INV-ZS-038](../invariants.md#inv-zs-038)
> **See:** [ADR-ZS-006](../decisions/006-no-teacher-school-cross-rating.md) (only verified periods are shared)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario carried over from the source)

REQUIREMENT: Every affiliation period created by a school (invited then active, or
             closed after having been active) MUST appear in the person's profile as a
             verified period: school, school years, roles, contract nature. Only these
             periods MAY be presented as authoritative in the views offered to schools;
             no other element of the profile MAY be presented as verified. The person
             MUST see the "verified" note and its origin; they MUST NOT be able to create
             or modify a verified period.

### BEH-ZS-229: Declare non-ZSchool experience as "unverified"

> **Invariant:** [INV-ZS-038](../invariants.md#inv-zs-038)
> **See:** [ADR-ZS-033](../decisions/033-unverified-teacher-declared-experience.md)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario carried over from the source)

REQUIREMENT: The teacher MAY declare experience at schools not on ZSchool: school name,
             city, periods, roles, contract nature. This experience MUST be displayed
             with the explicit note "unverified", with no automatic verification and no
             request for supporting documents by the platform; only the hiring school MAY
             check the originals outside the platform. The "unverified" note MUST appear
             wherever the experience is visible, including in selective shares.

Identity-linking treatment of declared experience is tracked as a closed baseline review point (Q-16, `spec/appendices/01-review-history.md`).

### BEH-ZS-230: Guarantee profile confidentiality between schools

> **Invariant:** [INV-ZS-087](../invariants.md#inv-zs-087), [INV-ZS-038](../invariants.md#inv-zs-038), [INV-ZS-019](../invariants.md#inv-zs-019)
> **See:** none
> **Priority:** Should
> **Version:** V1 (verified periods); V2+ (full scope with the network)
> **Acceptance:** none (no dedicated scenario carried over from the source)

REQUIREMENT: A school MUST see only what a teacher explicitly shares of their history,
             plus their verified affiliation periods relating to it. No evaluation,
             appraisal, or observation of a teacher produced by one school MAY be visible
             from another school; there MUST be no "employer history" view. A school's
             view of the shared profile MUST be logged.

### BEH-ZS-231: Track AREF authorizations of external public-sector teachers

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-200`](../../features/car/fr-car-11-tracking-aref-authorization-deadlines.feature)

REQUIREMENT: For each affiliation of nature "external public-sector teacher", the school
             MUST record and track the teaching authorization issued by AREF: reference,
             type (preliminary or final), validity dates, provincial education office.
             The platform MUST reflect the ministry's yearly circuit schedule: a request
             filed by the teacher from April 1 to May 15 with their public-sector school
             (with their public-school principal's endorsement), forwarded to the
             provincial office before May 20, a preliminary AREF authorization then a
             final authorization at the end of September. Reminders MUST be sent at
             deadlines (opening of the request window, May 20, start of the school year
             without a final authorization, expiry); a per-school and
             organization-consolidated status MUST list external public-sector teachers
             and their authorization status.

Sourced from the ministerial circular of 11/11/2024 (`spec/appendices/00-project-baseline.md`, research correction no. 18); OQ-ZS-131 and OQ-ZS-133 track the open items.

### BEH-ZS-232: Track the global 8-hour/week cap for external public-sector teachers

> **Invariant:** [INV-ZS-001](../invariants.md#inv-zs-001), [INV-ZS-038](../invariants.md#inv-zs-038)
> **See:** [ADR-ZS-064](../decisions/064-teacher-career-rules.md)a
> **Priority:** Should
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-201`](../../features/car/fr-car-12-tracking-8-hour-weekly-cap.feature)

REQUIREMENT: The weekly hour total of an external public-sector teacher MUST be computed
             by the platform from their assignments across every ZSchool school where
             they are active **and from hours they self-declare** outside the platform
             (their originating public school, non-ZSchool schools: teacher-entered data,
             marked "declared"), compared to the global cap of 8 hours per week. **This
             total MUST be visible only to the teacher** in their own area: no school MAY
             see the existence or the volume of affiliations held elsewhere. A school
             MUST see only **its own hours** assigned to the teacher and, **if the
             teacher has consented to sharing the total** (a checkbox in their own area,
             revocable, logged), a **binary alert**: "8-hour cap exceeded across all
             affiliations combined", with no detail or volume. When a scheduled
             affiliation is created or changed at a school, the teacher MUST receive a
             non-blocking alert if they cross the cap; the school MUST receive the binary
             alert only if consent was given. Recording MUST stay possible; a
             **justification** MUST be entered by the teacher (or by the school if it
             received the alert) and logged (author, reason, timestamp). ZSchool MUST NOT
             block the entry and MUST NOT rule on regulatory compliance: that judgment
             belongs to the teacher, the school, and AREF. The cap and the alert rules
             MUST be configurable (see OQ-ZS-133). Hours specific to one school MUST feed
             its monthly list (BEH-ZS-233).

The non-blocking-alert design was arbitrated as historical shorthand "D8", folded into [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md) (compliance/security timing batch); a journey step of `spec/journeys/04-part-time-teacher.md` carries this for the persona Hassan.

### BEH-ZS-233: Prepare the monthly list of external public-sector teachers for AREF

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario carried over from the source)

REQUIREMENT: Every month, the platform MUST prepare for the school the list required by
             the circular of 11/11/2024: external public-sector teachers, timetables,
             hours assigned and hours actually taught **at that school only**,
             authorization references (no hours from another school MAY appear there).
             The document MUST be generated in printable and spreadsheet format
             (bilingual Arabic/French), ready to be signed and forwarded by the school to
             its provincial education office; the platform MUST transmit nothing to AREF
             itself. Generations MUST be time-stamped and archived; the organization MAY
             produce a consolidated multi-site view.

### BEH-ZS-234: Publish a minimal public school directory

> **Invariant:** [INV-ZS-002](../invariants.md#inv-zs-002), [INV-ZS-075](../invariants.md#inv-zs-075), [INV-ZS-023](../invariants.md#inv-zs-023)
> **See:** [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md) (historical alias: D6), [ADR-ZS-042](../decisions/042-traceability-and-source-corrections.md)
> **Priority:** Must
> **Version:** MVP (minimal directory in read-only: name, city, cycles); V2+ (network uses)
> **Acceptance:** [`@REQ-ZS-202`](../../features/car/fr-car-14-minimal-directory-consumption.feature)

REQUIREMENT: The minimal public school directory MUST be **carried by BEH-ZS-017**
             (`spec/behaviors/01-administration-onboarding-subscription.md`), the sole
             owner of the rule (content, publication, hiding); this module is a consumer
             of it. At MVP, the directory MUST be limited to three read-only fields:
             name, city, authorized cycles — the scope needed for transfer-destination
             search (`spec/behaviors/09-transfers-mobility.md`, BEH-ZS-201). A school
             hidden from the directory (a behavior-01 option) MUST stay **reachable as a
             transfer destination by entering its exact identifier**, communicated to the
             family, so as not to push families toward the "non-ZSchool" path and
             identity duplication. In V2+, the expanded directory (education systems,
             website) serves the teacher network (search and applications, BEH-ZS-235).
             Directory searches MUST NEVER notify the schools consulted.

### BEH-ZS-235: Professional network: search, application, invitation, acceptance

> **Invariant:** none
> **See:** [ADR-ZS-006](../decisions/006-no-teacher-school-cross-rating.md)
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario carried over from the source)

REQUIREMENT: The teacher MUST be able to search the directory for schools (city, cycles,
             subjects, education system), view their minimal profiles, and file an
             application choosing the scope of their shared profile (verified periods,
             experience, professional-profile elements). The school MUST be able to view
             received applications and invite; an invitation or application MUST only
             proceed through the bilateral flow of BEH-ZS-222. No search, profile view,
             or application MAY be notified to or visible from the person's current
             employer. Schools MAY search for teachers who have made their availability
             visible (BEH-ZS-237), never accessing an unshared profile.

### BEH-ZS-236: Maintain an "open to opportunities" status invisible to active employers

> **Invariant:** [INV-ZS-087](../invariants.md#inv-zs-087)
> **See:** none
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-203`](../../features/car/fr-car-16-confidentiality-of-job-search.feature)

REQUIREMENT: The teacher MUST be able to enable or disable their "open to opportunities"
             status at any time. This status MUST be invisible to schools where the
             person holds an active or recently past affiliation, and to their users,
             including in administration views. No notification, no counter, no trace
             viewable by the current employer MAY be produced: neither searches, nor
             profile views, nor applications MAY be notified to or exposed to them. Only
             the school that is the recipient of an explicit share (application,
             availability) MUST see what was addressed to it.

### BEH-ZS-237: Declare selectively shared availability

> **Invariant:** [INV-ZS-087](../invariants.md#inv-zs-087)
> **See:** none
> **Priority:** Could
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario carried over from the source)

REQUIREMENT: The teacher MUST be able to declare their availability: days and time
             slots, weekly hour volumes, subjects, levels, geographic areas, availability
             date. For each recipient school, they MUST choose the visible scope; without
             explicit sharing, no availability MAY be visible from a school. Updating or
             withdrawing a share MUST take effect immediately.

### BEH-ZS-238: Forbid any cross-rating between teachers and schools

> **Invariant:** [INV-ZS-039](../invariants.md#inv-zs-039)
> **See:** [ADR-ZS-025](../decisions/025-no-cross-rating-in-v1-superseded.md), [ADR-ZS-006](../decisions/006-no-teacher-school-cross-rating.md)
> **Priority:** Must
> **Version:** MVP (a structural constraint maintained in V1 and V2+)
> **Acceptance:** [`@REQ-ZS-204`](../../features/car/fr-car-18-no-cross-rating.feature)

REQUIREMENT: The module MUST NOT expose, at any version of the roadmap, any function for
             rating, evaluating, recommending, reviewing, or ranking teachers by schools
             or schools by teachers; verified affiliation periods MUST stay the only
             shared career element. Any proposed development in that direction MUST be
             refused in review.

Tracked as a closed baseline review point (Q-07, `spec/appendices/01-review-history.md`).

### BEH-ZS-239: Track the share of permanent teachers

> **Invariant:** [INV-ZS-073](../invariants.md#inv-zs-073), [INV-ZS-087](../invariants.md#inv-zs-087)
> **See:** [ADR-ZS-064](../decisions/064-teacher-career-rules.md)c
> **Priority:** Should
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-205`](../../features/car/fr-car-19-permanent-teacher-share-indicator.feature)

REQUIREMENT: The school MUST have a configurable indicator of the **share of permanent
             teachers** among its active teaching affiliations (permanent teachers
             relative to all active teachers, by headcount and, optionally, by assigned
             hours), compared to a configured threshold (default value: 80%, inherited
             from the repealed Law 06.00; whether it is carried over into Law 59.21's
             decrees is unconfirmed — monitored by
             `spec/cross-cutting/07-legal-compliance-data-protection.md`, OQ-ZS-133).
             Crossing below the threshold MUST produce a non-blocking alert to
             leadership; the indicator MUST be viewable per school and consolidated per
             organization, and MUST feed the ESISE HR-referential filing
             (`spec/behaviors/12-massar-regulatory-exports.md`, BEH-ZS-268). No data from
             another school MAY enter the calculation.

## 5. Morocco-specific considerations

| Subject | Data and source | Handling in this module |
|---|---|---|
| External public-sector teachers | Ministerial circular of 11/11/2024: requests from 04/01 to 05/15, endorsement of the public-school principal, provincial transmission before 05/20, preliminary AREF authorization then final at the end of September; global 8-hour/week cap across all schools combined; monthly AREF list (timetables, hours taught) | BEH-ZS-231, BEH-ZS-232, BEH-ZS-233 |
| Weight of part-time teachers | About 50% of the private teaching body (industry source; no official statistic — the founding document said "more than 50%", H-13 partially confirmed) | Multi-affiliation (BEH-ZS-223) is treated as the nominal case, not an exception |
| Fate of Law 06.00 | Law 06.00 repealed by Law 59.21 (Official Gazette no. 7485 of 02/23/2026); carry-over of "80% permanent" and the 8 hours unconfirmed; monitoring required | Cap, permanent-teacher threshold, and categories configurable (BEH-ZS-232, BEH-ZS-239); OQ-ZS-133 |
| Decree 1538.03 | Teacher files to be filed with AREF: a decree cited by the founding document, text not found online | AREF file content not modeled; OQ-ZS-134 |
| Teachers' personal data | The global professional profile (identity, career, adults' national ID) falls under Law 09.08: collecting the national ID card number switches to prior authorization (F112); ZSchool is the data controller for global identity, the school for its operational data | Reference `spec/cross-cutting/07-legal-compliance-data-protection.md` (national ID card not collected at MVP); OQ-ZS-135 |
| Languages and materials | Bilingual Arabic/French interactions, full RTL; monthly AREF list printable in Arabic and French | Screens §7, BEH-ZS-233 |

## 6. Data and events

### 6.1 Entities used (dictionary from `spec/domain-model.md`)

| Entity | Use in this module |
|---|---|
| `SchoolMembership` | Central entity: multiple roles, contract nature (permanent, part-time, intern, contractor, external public-sector teacher — OQ-ZS-131), dates (including a scheduled end date), statuses (invited, active, suspended, ended), permissions; qualification as declared to the employer (degrees and titles as declared to that school, the sole source of ESISE filings); AREF attributes for external public-sector teachers |
| `TeacherProfile` | Professional profile held by the teacher: degrees, subjects, levels, languages, teaching authorization, verified experience (periods confirmed by schools) and declarative "unverified" experience, hours self-declared outside the platform and consent to sharing the cap-exceeded alert, availability (V2); never exported to the ministry |
| `TeacherAssignment` | Active course assignments: form the basis for the weekly-hours calculation (BEH-ZS-232) and least-privilege permissions; managed by `spec/behaviors/03-academic-structure-timetables.md` |
| `School` | Minimal directory fields (name, city, cycles; systems and website in V1+), carried by BEH-ZS-017; stays private beyond that ([INV-ZS-002](../invariants.md#inv-zs-002)) |
| `Person`, `User` | Unique identity and account, multiple profiles; phone = primary contact identifier |
| `AuditLog` | Immutable logging of entries on affiliations and permissions (MVP); log of views of shared profiles (V1) |

No new entity is created: AREF tracking is carried by `SchoolMembership` attributes and aggregated views, in line with the frozen schema of `spec/domain-model.md`.

### 6.2 Domain events

Events produced by this module and consumed by communication (`spec/behaviors/08-communication-notifications.md`); `AffiliationClosed` already appears in the catalog of `spec/domain-model.md` §7.

| Event | Trigger | Notifiable recipients |
|---|---|---|
| `AffiliationInvited` | Invitation sent | Invited person (in-app, SMS, or email) |
| `AffiliationAccepted` / `AffiliationDeclined` | The person's decision | Inviting school |
| `AffiliationActivated` | Bilateral acceptance | Person and school |
| `AffiliationSuspended` / `AffiliationResumed` | Leadership's decision | Person concerned |
| `AffiliationClosed` | Closure by leadership | Person concerned (immediate access removal) |
| `ApplicationFiled` | Application via the network (V2) | Recipient school only |
| `ArefAuthorizationDeadline` | Deadlines 04/01, 05/20, start of school year, expiry | The school and teacher concerned |
| `HoursCapExceeded` | Crossing the 8-hour cap | Teacher; concerned schools only if the teacher consented to sharing the alert |
| `MonthlyArefListGenerated` | Generating the monthly list | Leadership |
| `PermanentThresholdCrossed` | Permanent-teacher share falling below the threshold (BEH-ZS-239) | Leadership, group administrator |
| `AffiliationScheduledClosureRecorded` | Scheduled closure recorded (BEH-ZS-224) | Academic leadership (course reassignment), person concerned |

## 7. Screens

Text descriptions (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`); mobile-first, bilingual FR/AR with RTL.

- **SCR-ZS-121 — School affiliation register (web, leadership and front office).** Top area: filters (status, role, contract nature, school year, search by name or phone). Dense list: person (name AR/FR), roles, contract, dates, status by badge (invited, active, suspended, ended), "external public-sector teacher" badge with authorization status. Per-row actions: view detail, suspend, resume, close, resend an invitation. Desktop view preferred; mobile adaptation as stacked lists. Explicit empty states ("no pending invitations").
- **SCR-ZS-122 — Affiliation record (creation and detail).** A three-block form: (1) person (search an existing identity by phone, or create one, with duplicate checking); (2) affiliation (multiple roles, contract nature, dates, school year, editable role-template permissions); (3) an "external public-sector teacher" block (reference and validity of the AREF authorization, weekly hours assigned) shown only when the contract nature warrants it. Hours assigned **at that school** shown read-only (never the cross-school total); a "qualification as declared to the employer" field; a scheduled end date with a reassignment reminder. Status-change log at the bottom of the record.
- **SCR-ZS-123 — Person's "My affiliations" area (mobile-first, PWA).** A list of affiliations per school with status, roles, and dates; a context switcher at the top of the screen; received invitations with role detail and accept/decline buttons; history of closed periods (MVP) then "verified" (V1, with a note and the issuing school); for external public-sector teachers (V1): the total hours across all affiliations, entry of self-declared off-platform hours, a "share the cap-exceeded alert with my schools" toggle; links to the professional profile. No trace of searches or views performed is visible there to a third party.
- **SCR-ZS-124 — Teacher's professional profile (mobile and web).** Editing by the teacher: professional identity, degrees (declared), subjects, levels, languages, teaching authorization, experience (a separate "non-ZSchool experience — unverified" block), availability (V2, with per-recipient sharing scope). A "what a school sees" preview view. A restricted school view: only explicitly shared elements and that school's verified periods; a note that the view is logged.
- **SCR-ZS-125 — AREF dashboard (web, leadership).** Three zones: (1) authorization status of external public-sector teachers (reference, type, validity, next deadline, alert badges); (2) weekly hours assigned per teacher at the school, and a "cap exceeded across all affiliations" badge only for teachers who have consented to sharing (no total or remaining hours shown); (3) generating the monthly list (month, scope, preview, bilingual PDF and spreadsheet export, time-stamped generation history). Consolidated view at the organization level (V1).
- **SCR-ZS-126 — Directory and network (mobile-first, V2+).** School search (city, cycles, subjects, system); minimal card matching the directory; an "apply" action with a choice of shared scope; a "my applications" tab with statuses; an "open to opportunities" toggle with a reminder of its confidentiality ("invisible to your schools"); a school tab with "applications received" and "shared availability". No social counter, no rating, no ranking (BEH-ZS-238). At MVP, the minimal directory is only exposed via the transfer module's destination search; the network screen above arrives in V2+.

## 8. Integrations

| Integration | Use | Reference |
|---|---|---|
| Messaging (SMS, email) and in-app notifications | Sending invitations, AREF deadline reminders, cap alerts | `spec/cross-cutting/06-external-integrations.md` (INT-SMS, INT-EML), `spec/behaviors/08-communication-notifications.md` |
| AREF | No interface: the monthly list is prepared by the platform then forwarded by the school (mail or provincial channel) | BEH-ZS-233 |
| Massar | No exchange: the module does not depend on the Massar code (adults matched by phone) | `spec/behaviors/12-massar-regulatory-exports.md` |

## 9. Module-specific non-functional requirements

Reference to NFR domains carried by `spec/cross-cutting/03-non-functional-requirements.md`; no NFR requirement is numbered here.

| Domain | Module-specific requirement | Reference |
|---|---|---|
| Confidentiality and audit | Every view of a shared profile and every write on an affiliation is logged (author, context, timestamp); no exposure of the log to schools beyond what is provided for | `spec/cross-cutting/02-security-privacy.md` ([INV-ZS-090](../invariants.md#inv-zs-090)) |
| Mobile and offline | Affiliations area and invitation acceptance usable on mobile PWA over unstable networks; no offline-entry requirement specific to this module (the flows are short) | NFR-MOB, NFR-OFF |
| Internationalization | Role and contract terminology translated FR/AR with full RTL; bilingual AREF documents | NFR-I18N |
| Performance | Register filterable across several hundred affiliations per school within the general targets (usual pages under 2 s on 4G) | NFR-PERF |
| Retention | Verified periods survive affiliations and follow the founding document's retention periods; a school's closure (shutdown, cancellation) maintains the person's access to a statement of their periods | [ADR-ZS-003](../decisions/003-default-retention-durations.md), [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md) |

## 10. Success metrics

`KPI-ZS-NNN` identifiers are carried by `spec/metrics.md` (starting at [KPI-ZS-037](../metrics.md)); this chapter proposes indicators, to be formalized there:

- share of active teachers holding more than one active affiliation (reference: about 50% of the teaching body, H-13);
- rate of affiliations activated with no follow-up (invitation accepted within 7 days);
- rate of filled-in professional profiles (at least subjects and levels) among active teachers;
- share of external public-sector teachers with an up-to-date AREF authorization as of September 30;
- share of schools above the configured permanent-teacher threshold;
- monthly AREF lists generated within the first 5 days of the month;
- applications filed and accepted via the network; activation of the "open" status (never measuring an employer's search).

## 11. Open questions

Open questions for this module (OQ-ZS-131 through OQ-ZS-137 in the migrated source, covering the "external public-sector teacher" contract-nature terminology, the minimal-directory activation version, the 8-hour cap's survival past Law 06.00's repeal, the AREF file content under decree 1538.03, the CNDP filing basis for the professional profile and the V2 network, the AREF-cap-exceeded behavior, and the ownership of the permanent-teacher-share ratio) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
