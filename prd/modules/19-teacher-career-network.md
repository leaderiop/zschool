# ZSchool — Chapter 19: Career and Teacher Network (CAR)

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review; arbitrations from `prd/cross-cutting/42-review-arbitrations.md` applied (ARB-23, ARB-25, ARB-26) |
| Source | `PROJECT.md` §6.5 (teacher and staff affiliation, RG-17 to RG-20), §6.6 (RG-23), §6.9 (RG-35), §7.10 (career and network, G-23), §8.1–8.2 (RG-36 to RG-39), §12 (scope by version); DEC-05, DEC-14, DEC-17, DEC-25, DEC-33; G-23; H-13; Q-07, Q-16; `prd/research/00-baseline-corrections.md` correction no. 18; `prd/research/02-regulatory-data.md` §8; `prd/cross-cutting/42-review-arbitrations.md` (ARB-23) |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/journeys/04-part-time-teacher.md`, `prd/modules/10-administration-onboarding-subscription.md` (FR-ADM), `prd/modules/12-academic-structure-timetables.md` (FR-PED), `prd/modules/17-communication-notifications.md` (FR-COM), `prd/modules/20-dashboards-reporting.md` (FR-RAP), `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` |

---

## 1. Purpose and scope

This module carries the **relationship between a person and a school** (the `SchoolMembership` entity, a single affiliation link) and the **teacher's portable career**: a professional profile belongs to the teacher, time spent at ZSchool schools becomes "verified" periods, and — in V2 and beyond — a discreet professional network enables searches, applications, and availability signals without ever exposing a job search to the current employer.

### 1.1 In scope

| Scope | Content | Version |
|---|---|---|
| Professional profile | Profile carried by the teacher (degrees, subjects, levels, languages, teaching authorization, experience), "verified" affiliation periods, "unverified" non-ZSchool experience, cross-school confidentiality | V1 |
| AREF compliance | Tracking of external public-sector teachers: authorizations (preliminary/final), deadlines, the global 8-hour/week cap (cumulative total visible to the teacher only; a binary alert to the school on consent, ARB-23a), a monthly list prepared by the platform; indicator of the share of permanent teachers (FR-CAR-19, ARB-23c) | V1 |
| Minimal school directory | Minimal public read-only directory (name, city, cycles — RG-23), **carried by FR-ADM-17** (`prd/modules/10-administration-onboarding-subscription.md`) and consumed here for transfer-destination search and, in V2+, for the network (FR-CAR-14 as a reference) | MVP (minimal directory); V2+ (network uses) |
| Professional network | Search, applications, invitations, acceptance, availability, "open to opportunities" status invisible to active employers | V2+ |

### 1.2 Out of scope

| Out of scope | Reference |
|---|---|
| Assigning teachers to courses (`TeacherAssignment`), timetable, lesson planner | `prd/modules/12-academic-structure-timetables.md` (FR-PED) |
| Attendance, grade entry, communication with parents: exercising the permissions derived from the affiliation, not managed here | `prd/modules/12-academic-structure-timetables.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/17-communication-notifications.md` |
| Account creation, identity matching and claiming, bulk Excel import of staff | `prd/modules/10-administration-onboarding-subscription.md` (FR-ADM) |
| Payroll, pay slips, social security filings (CNSS): no coverage in the founding document; ZSchool manages the affiliation relationship, not payroll | Out of scope (no requirement) |
| Rating, evaluating, or cross-recommending teachers ↔ schools | Forbidden at every version (DEC-25, see FR-CAR-18) |
| Detailed job postings, a recruitment marketplace | Out of scope; V2 is limited to search, applications, and availability (§12) |

## 2. Users and use cases

| Actor | Use case | Version |
|---|---|---|
| School leadership | Invite a teacher or a staff member, maintain the affiliation register, close or suspend an affiliation, track AREF authorizations for their external public-sector teachers, prepare the monthly AREF list | MVP (register); V1 (AREF) |
| Front office | Create affiliations at the start of the year (often in bulk after an Excel import), follow up on pending invitations | MVP |
| Teacher | Accept an invitation, hold multiple affiliations at once, switch context, maintain their professional profile, see their verified periods; in V2, signal availability and apply discreetly | MVP (affiliations); V1 (profile); V2 (network) |
| Non-teaching staff member | Accept their invitation, see their affiliation and their permissions | MVP |
| Person outside ZSchool | Browse the minimal directory, create an identity, apply (V2) | MVP (minimal directory); V2+ (application) |
| ZSchool (operator) | Guarantee profile confidentiality and that job searches are never disclosed; no viewing of profiles outside a logged support procedure | All versions |

Persona needs covered: BES-ENS-01 (single profile across multiple schools), BES-ENS-06 (portable, confidential professional profile), BES-ENS-07 (applying without notifying the employer), BES-DIR-07 (fine-grained roles and permissions). Reference persona: Khadija, a part-time teacher in two schools in Rabat (§2.4 of `prd/02-actors-personas.md`, H-13); the 8-hour AREF cap does not apply to her. The "external public-sector teacher" case is illustrated by a secondary character, Hassan, a permanent public-school teacher working part-time at School A (PJ-ENS-10 of `prd/journeys/04-part-time-teacher.md`, ARB-23d).

## 3. Key journeys

The `prd/journeys/00-journey-map.md` map has no end-to-end journey dedicated to the teacher's career (the network is explicitly out of MVP, RG-35 and DEC-25 appear there as "outside MVP"). The anchor points are:

| Journey | Link to this module |
|---|---|
| PC-03 — School onboarding | Inviting teachers and staff when the tenant is created (RG-18 cited by the journey map); bulk start-of-year affiliations extend this journey |
| PC-04 — Claiming an identity | The invited teacher claims their identity and account, then accepts their affiliation; identity matching avoids duplicates across schools |
| `prd/journeys/04-part-time-teacher.md` (the teacher's detailed journey, `PJ-ENS-…` steps) | Holding two schools at once, switching context, maintaining the profile; the V2 network plugs into it without a new identity structure |

The detailed invitation → acceptance → activation flow is normalized by FR-CAR-02 below; journeys reference it without re-describing it.

## 4. Functional requirements

Counter `FR-CAR-NN` starting at 01, a namespace exclusive to this file (conventions §2). Version tags follow `PROJECT.md` §12.

### FR-CAR-01 — Maintain a single affiliation register

| Attribute | Value |
|---|---|
| Description | For each person linked to the school, a single affiliation entity carries: one or more roles (teacher, principal, front-office staff, accountant, head supervisor, supervisor, nurse, driver, system administrator…), a contract nature (permanent, part-time, intern, contractor, and "external public-sector teacher", see OQ-01), start and end dates, a status among invited, active, suspended, ended, and contextual permissions. An affiliation that has been active is never deleted: it is closed with a reason and a date. The register is viewable by leadership and the front office, filterable by status, role, contract nature, and school year. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-05, RG-17, INV-14; research correction no. 18 ("external public-sector teacher" nature, OQ-01) |
| Actors | Leadership, front office |

```gherkin
Feature: Single affiliation register (MVP)
  Scenario: An affiliation that has been active cannot be deleted
    Given an affiliation "active" then "ended" with reason "end of contract" and a date
    When leadership attempts to delete the affiliation from the register
    Then the deletion is refused and the affiliation stays viewable with status "ended"

  Scenario: Filtering the register at the start of the year
    Given 42 affiliations, 5 "invited", 35 "active", and 2 "suspended" for the 2026-2027 year
    When the front office filters the register by status "invited"
    Then only the 5 pending invitations are shown with their expiry date and the "resend" action
```

### FR-CAR-02 — Create an affiliation by invitation with bilateral acceptance

| Attribute | Value |
|---|---|
| Description | The school invites a person identified by their mobile phone number (primary identifier) or their email address: a named invitation, with proposed roles and contract nature, sent by in-app and SMS notification (primary contact identifier, DEC-11), email remaining optional and never required (INV-37). The person accepts or declines; moving from status "invited" to status "active" only occurs after acceptance by both parties (the invitation opens no access until it is accepted). Conversely, a person may file an application toward a directory school; the school accepts or declines it, and the same bilateral principle applies (V2, with the directory). Unaccepted invitations expire (configurable duration, default: 30 days) and stay viewable in the register. |
| Priority | Must |
| Version | MVP (invitation and acceptance); V2+ (spontaneous application via the directory) |
| Traceability | RG-18, INV-15; Q-16 (identity linking), G-23 |
| Actors | Leadership, front office, teacher, staff |

```gherkin
Feature: Invitation and bilateral acceptance of an affiliation
  Scenario: A teacher accepts an invitation from their second school
    Given a teacher active at School A, with her own account
    And an invitation from School B for a "teacher" role under a part-time contract
    When she opens the notification, reviews the roles, and accepts the invitation
    Then her affiliation with School B moves to status "active" as of that day
    And the context switcher offers the (teacher, School B) pair
    And School B sees the active affiliation in its register, without seeing School A's data

  Scenario: Declining an invitation
    Given an invitation with status "invited"
    When the person declines the invitation
    Then the affiliation stays at status "invited" with a "declined" note, with no access
    And the school is notified of the decline and may invite again

  Scenario: An invitation alone grants no rights
    Given an invitation sent and not yet accepted
    When the person browses the platform
    Then they see no content of the inviting school beyond the invitation itself
```

### FR-CAR-03 — Allow simultaneous multi-school, multi-role affiliations

| Attribute | Value |
|---|---|
| Description | A person may hold several active affiliations at once in different schools (the case of part-time teachers, a majority in the private sector, H-13) and combine several roles in a single school. No cap on the number of active affiliations is imposed by the platform. Each affiliation carries its own permissions; the interface offers a context selector (profile × school) and switching never loses in-progress entries. Teacher dashboards and daily tools work per context. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-17, RG-36, INV-14, INV-31; H-13; BES-ENS-01 |
| Actors | Teacher, staff |

```gherkin
Feature: Simultaneous multi-affiliation of a part-time teacher across two schools
  Scenario: Two active affiliations in the same year
    Given a teacher whose affiliation with School A is "active" for the 2026-2027 year
    When she accepts School B's invitation for the same school year
    Then she holds two simultaneous "active" affiliations, with no error or conflict
    And each school sees only its own affiliation and its own dates

  Scenario: Switching context without losing entries
    Given a grade entry in progress in School A's context
    When the teacher switches to School B's context and back
    Then her School A entry is found exactly as she left it

  Scenario: Combining roles at a single school
    Given a person affiliated with School A
    When leadership adds a second "supervisor" role to their existing affiliation
    Then a single affiliation carries both roles and their combined permissions
```

### FR-CAR-04 — Close an affiliation with immediate access removal and retention of attributed data

| Attribute | Value |
|---|---|
| Description | Leadership closes an affiliation, recording a reason (resignation, end of contract, dismissal, departure) and an end date: immediate, past, or **scheduled** (a known future date, end of contract) — in the latter case, the affiliation stays active until that date and the person's courses appear as "to be reassigned before <date>" in FR-PED-08 (`prd/modules/12-academic-structure-timetables.md`); closure is executed automatically on that date (ARB-23e). Upon closure, the person's access to the school's data is removed immediately: timetable sessions, classes, entries, communication threads. Data produced by the person during their affiliation (entered grades, attendance taken, messages sent) stays with the school, attributed to its author: no deletion, no automatic anonymization. Past affiliation periods stay viewable by the person from their "My affiliations" area (MVP); their display as "verified" periods in the professional profile falls under FR-CAR-08 (V1). The closure event is notified to the parties and logged. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-19, INV-16; RG-20 (verified periods maintained, V1 via FR-CAR-08); ARB-23e |
| Actors | Leadership, teacher, staff |

```gherkin
Feature: Closing an affiliation
  Scenario: Immediate access removal
    Given a teacher "active" at School A, having entered grades and taken attendance
    When leadership closes their affiliation with immediate effect
    Then from closure on, the account can no longer access School A's classes, grades, attendance, or messages
    And their affiliations at other schools stay unchanged

  Scenario: Retention of attributed data
    Given grades and attendance produced by the teacher before their closure
    When leadership views this data after the closure
    Then it still appears in the school, attributed to its author
    And none of this data has been deleted or detached from its context

  Scenario: Closed period kept on the teacher's side (MVP)
    Given an affiliation closed covering the 2025-2026 year
    When the teacher views their "My affiliations" area
    Then the period appears with status "ended", with school, years, roles, and contract nature
    And, in V1, the same period is shown "verified" in their professional profile (FR-CAR-08)

  Scenario: Scheduled closure with course reassignment (MVP)
    Given a teacher "active" whose contract ends on January 31, 2027
    When leadership records a scheduled closure for January 31, 2027
    Then the affiliation stays "active" until that date with the note "closure scheduled"
    And their courses appear "to be reassigned before 01/31/2027" in the structure alerts (FR-PED-08)
    And on February 1, 2027, closure executes and access is removed
```

### FR-CAR-05 — Suspend and later resume an affiliation

| Attribute | Value |
|---|---|
| Description | Leadership may suspend an active affiliation (long absence, an investigation, leave) with dates and a reason; during suspension, the person's effective rights over the school are removed as in a closure, without closing. Resumption restores the affiliation and its permissions without recreation; the suspension/resumption history is kept. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-19 (access removal by analogy), INV-15 (statuses) |
| Actors | Leadership |

```gherkin
Feature: Suspending and resuming an affiliation (MVP)
  Scenario: Suspension for extended leave
    Given a teacher "active" at School A
    When leadership suspends their affiliation from March 1 to April 30, 2027 with reason "leave"
    Then from March 1 on, they no longer access School A's classes, grades, attendance, or messages
    And their affiliations at other schools stay unchanged
    And their courses appear "to be covered" for the period in the structure alerts

  Scenario: Resumption without recreation
    Given the same suspended affiliation
    When the resumption date is reached or leadership lifts the suspension
    Then the affiliation returns to "active" with its prior roles and permissions
    And the history keeps the suspension and resumption with their dates
```

### FR-CAR-06 — Carry roles and fine-grained permissions on the affiliation

| Attribute | Value |
|---|---|
| Description | Each affiliation carries the person's roles at the school; roles are made up of fine-grained permissions (read/write per module and per scope: class, level, whole school) based on role templates provided by ZSchool and editable by the school. Permissions are contextual: the rights of a single account differ by (profile, school) pair. Least privilege applies: a teacher's rights over students derive from their active course assignments. Every role or permission change is logged. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-36, RG-37, RG-39, DEC-17, INV-31, INV-32, INV-34; rule detail in `prd/cross-cutting/30-roles-permissions-matrix.md` |
| Actors | Leadership, school system administrator |

```gherkin
Feature: Fine-grained permissions carried by the affiliation (MVP)
  Scenario: A role template changed without affecting other affiliations
    Given the "supervisor" role template limited to the middle-school cycle for one affiliation
    When leadership extends this role to the upper-secondary cycle for that one affiliation
    Then the person sees students of both cycles as soon as the change is made
    And other affiliations carrying the "supervisor" role template stay unchanged
    And the change is logged with author and timestamp

  Scenario: A teacher's rights derive from their courses
    Given a "teacher" affiliation with no active course assignment
    When the teacher opens the student list
    Then no class is visible until at least one course assignment exists (INV-34)
```

### FR-CAR-07 — Maintain the professional profile carried by the teacher

| Attribute | Value |
|---|---|
| Description | The teacher creates and owns their professional profile, independent of any school: degrees (declared, never certified by the platform), subjects taught, levels (pre-school through baccalaureate), languages of instruction, teaching authorization (qualification, civil-service or file number where relevant), experience. Schools do not edit this global profile; they feed it indirectly through verified affiliation periods (FR-CAR-08). The profile may exist without an active affiliation and without an activated account. |
| Priority | Should |
| Version | V1 |
| Traceability | RG-20; BES-ENS-06; G-23 (degree verification: declared outside the platform) |
| Actors | Teacher |

### FR-CAR-08 — Mark affiliation periods as "verified"

| Attribute | Value |
|---|---|
| Description | Every affiliation period created by a school (invited then active, or closed after having been active) appears in the person's profile as a verified period: school, school years, roles, contract nature. Only these periods are authoritative in the views offered to schools (RG-35); no other element of the profile is presented as verified. The person sees the "verified" note and its origin; they cannot create or modify a verified period. |
| Priority | Should |
| Version | V1 |
| Traceability | RG-20, RG-35, INV-29; DEC-25 (only verified periods are shared) |
| Actors | Teacher, leadership |

### FR-CAR-09 — Declare non-ZSchool experience as "unverified"

| Attribute | Value |
|---|---|
| Description | The teacher may declare experience at schools not on ZSchool: school name, city, periods, roles, contract nature. This experience is displayed with the explicit note "unverified", with no automatic verification and no request for supporting documents by the platform; only the hiring school can check the originals outside the platform. The "unverified" note appears wherever the experience is visible, including in selective shares. |
| Priority | Should |
| Version | V1 |
| Traceability | DEC-33, INV-29, Q-16; G-23 |
| Actors | Teacher |

### FR-CAR-10 — Guarantee profile confidentiality between schools

| Attribute | Value |
|---|---|
| Description | A school sees only what a teacher explicitly shares of their history, plus their verified affiliation periods relating to it. No evaluation, appraisal, or observation of a teacher produced by one school is visible from another school; there is no "employer history" view. A school's view of the shared profile is logged. The rule applies from V1 for verified periods, and reaches its full scope with the V2+ network. |
| Priority | Should |
| Version | V1 |
| Traceability | RG-35, INV-29, INV-33; G-23 |
| Actors | Leadership, teacher |

### FR-CAR-11 — Track AREF authorizations of external public-sector teachers

| Attribute | Value |
|---|---|
| Description | For each affiliation of nature "external public-sector teacher", the school records and tracks the teaching authorization issued by AREF: reference, type (preliminary or final), validity dates, provincial education office. The platform reflects the ministry's yearly circuit schedule: a request filed by the teacher from April 1 to May 15 with their public-sector school (with their public-school principal's endorsement), forwarded to the provincial office before May 20, a preliminary AREF authorization then a final authorization at the end of September. Reminders are sent at deadlines (opening of the request window, May 20, start of the school year without a final authorization, expiry); a per-school and organization-consolidated status lists external public-sector teachers and their authorization status. |
| Priority | Should |
| Version | V1 |
| Traceability | Research correction no. 18; `prd/research/02-regulatory-data.md` §8 (ministerial circular of 11/11/2024); OQ-01, OQ-03 |
| Actors | Leadership, external public-sector teacher |

```gherkin
Feature: Tracking AREF authorization deadlines
  Scenario: Alert at the opening of the request window
    Given an external public-sector teacher whose final authorization expires at the end of the school year
    When April 1 arrives
    Then the school receives a reminder: the renewal request is to be filed between April 1 and May 15
    And the teacher receives the same reminder in their area

  Scenario: Start of the school year without a final authorization
    Given an external public-sector teacher holding only a preliminary authorization in September
    When leadership views the authorization status
    Then the affiliation appears "preliminary, final expected end of September" with the validity date
    And no punitive action is triggered: tracking is a tool, the decision stays with the school and AREF
```

### FR-CAR-12 — Track the global 8-hour/week cap for external public-sector teachers

| Attribute | Value |
|---|---|
| Description | The weekly hour total of an external public-sector teacher is computed by the platform from their assignments across every ZSchool school where they are active **and from hours they self-declare** outside the platform (their originating public school, non-ZSchool schools: teacher-entered data, marked "declared"), compared to the global cap of 8 hours per week (ministerial circular of 11/11/2024). **This total is visible only to the teacher** in their own area (RG-35, INV-29, INV-17: no school sees the existence or the volume of affiliations held elsewhere). A school sees only **its own hours** assigned to the teacher and, **if the teacher has consented to sharing the total** (a checkbox in their own area, revocable, logged), a **binary alert**: "8-hour cap exceeded across all affiliations combined", with no detail or volume. When a scheduled affiliation is created or changed at a school, the teacher receives a non-blocking alert if they cross the cap; the school receives the binary alert only if consent was given. Recording stays possible; **justification** is entered by the teacher (or by the school if it received the alert) and logged (author, reason, timestamp). ZSchool does not block the entry and does not rule on regulatory compliance: that judgment belongs to the teacher, the school, and AREF (arbitration D8; PJ-ENS-10 of `prd/journeys/04-part-time-teacher.md`). The cap and the alert rules are configurable (see OQ-03). Hours specific to one school feed its monthly list (FR-CAR-13). (→ ARB-23a) |
| Priority | Should |
| Version | V1 |
| Traceability | Research correction no. 18; `prd/research/02-regulatory-data.md` §8; RG-35, INV-17, INV-29; OQ-03, OQ-06 (arbitration D8: non-blocking alert); ARB-23a |
| Actors | External public-sector teacher (total, declaration, consent); leadership (own hours, binary alert on consent) |

```gherkin
Feature: Tracking the 8-hour weekly cap without cross-school leakage (V1)
  Scenario: The total is visible only to the teacher
    Given Hassan, an external public-sector teacher, assigned 6 hours a week at School A
    And 2 hours a week at School B
    And 4 hours self-declared at his originating public school
    When School C's leadership records a 2-hour weekly assignment for Hassan
    Then Hassan sees a total of 14 hours over an 8-hour cap in his own area and receives the non-blocking alert
    And School C sees only its 2 hours and learns neither the existence nor the volume of the affiliations at schools A and B
    And recording stays possible with a logged justification (ZSchool does not block it)

  Scenario: A binary alert to the school on the teacher's consent
    Given Hassan, having checked "share the cap-exceeded alert with my schools"
    When School C records the assignment that crosses the cap
    Then School C receives the alert "8-hour cap exceeded across all affiliations combined", with no volume or list of schools
    And the justification entered by School C is logged

  Scenario: Without consent, no signal to the school
    Given Hassan not having consented to sharing the total
    When School C records an assignment that crosses the cap
    Then only Hassan receives the alert and School C observes no difference from an ordinary assignment
```

### FR-CAR-13 — Prepare the monthly list of external public-sector teachers for AREF

| Attribute | Value |
|---|---|
| Description | Every month, the platform prepares for the school the list required by the circular of 11/11/2024: external public-sector teachers, timetables, hours assigned and hours actually taught **at that school only**, authorization references (no hours from another school appear there, RG-35, ARB-23a). The document is generated in printable and spreadsheet format (bilingual Arabic/French), ready to be signed and forwarded by the school to its provincial education office; the platform transmits nothing to AREF itself. Generations are time-stamped and archived; the organization may produce a consolidated multi-site view. |
| Priority | Should |
| Version | V1 |
| Traceability | Research correction no. 18; `prd/research/02-regulatory-data.md` §8; OQ-04 |
| Actors | Leadership |

### FR-CAR-14 — Publish a minimal public school directory

| Attribute | Value |
|---|---|
| Description | The minimal public school directory is **carried by FR-ADM-17** (`prd/modules/10-administration-onboarding-subscription.md`), the sole owner of the rule (content, publication, hiding); this module is a consumer of it (ARB-26, a single owner per capability). At MVP, the directory is limited to three read-only fields: name, city, authorized cycles — the scope needed for transfer-destination search (FR-TRA-01 of `prd/modules/18-transfers-mobility.md`; RG-23, INV-19). A constraint specific to this module: a school hidden from the directory (an FR-ADM-17 option) stays **reachable as a transfer destination by entering its exact identifier**, communicated to the family, so as not to push families toward the "non-ZSchool" path and identity duplication (INV-43). In V2+, the expanded directory (education systems, website) serves the teacher network (search and applications, FR-CAR-15). Directory searches never notify the schools consulted. |
| Priority | Must |
| Version | MVP (minimal directory in read-only: name, city, cycles — arbitration D6, OQ-02); V2+ (network uses) |
| Traceability | RG-23, INV-19, INV-43; C-08; OQ-02 (arbitration D6); FR-ADM-17 (owner); FR-TRA-01 reference (`prd/modules/18-transfers-mobility.md`); ARB-26 |
| Actors | Any person, leadership |

```gherkin
Feature: Minimal-directory consumption by transfers (MVP)
  Scenario: Hidden school reachable by exact identifier
    Given a school that has chosen not to appear in the directory (FR-ADM-17)
    When a legal tutor enters that school's exact identifier in the transfer request
    Then the school is offered as a ZSchool destination
    And no partial search allows discovering it
```

### FR-CAR-15 — Professional network: search, application, invitation, acceptance

| Attribute | Value |
|---|---|
| Description | The teacher searches the directory for schools (city, cycles, subjects, education system), views their minimal profiles, and files an application choosing the scope of their shared profile (verified periods, experience, professional-profile elements). The school views received applications and invites; an invitation or application only proceeds through the bilateral flow of FR-CAR-02. No search, profile view, or application is notified to or visible from the person's current employer. Schools may also search for teachers who have made their availability visible (FR-CAR-17), never accessing an unshared profile. |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.10; RG-18; G-23; DEC-25; BES-ENS-07 |
| Actors | Teacher, leadership |

### FR-CAR-16 — Maintain an "open to opportunities" status invisible to active employers

| Attribute | Value |
|---|---|
| Description | The teacher enables or disables their "open to opportunities" status at any time. This status is invisible to schools where the person holds an active or recently past affiliation, and to their users, including in administration views. No notification, no counter, no trace viewable by the current employer is produced: neither searches, nor profile views, nor applications are notified to or exposed to them. Only the school that is the recipient of an explicit share (application, availability) sees what was addressed to it. |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.10, G-23; RG-35; BES-ENS-07 |
| Actors | Teacher |

```gherkin
Feature: Confidentiality of a job search
  Scenario: The "open" status stays invisible to the current employer
    Given a teacher actively affiliated with School A
    When she enables her "open to opportunities" status
    Then no School A user can see this status, today or retroactively
    And no notification is emitted to School A

  Scenario: Searches are never notified
    Given the same teacher browsing schools in the directory
    When she views School B's profile, a competitor of her employer
    Then no event of this view is notified, either to School A or to School B
    And the platform's audit log exposes this view only for internal security purposes (`prd/cross-cutting/31-security-privacy.md`), never to a school
```

### FR-CAR-17 — Declare selectively shared availability

| Attribute | Value |
|---|---|
| Description | The teacher declares their availability: days and time slots, weekly hour volumes, subjects, levels, geographic areas, availability date. For each recipient school, they choose the visible scope; without explicit sharing, no availability is visible from a school. Updating or withdrawing a share takes effect immediately. |
| Priority | Could |
| Version | V2+ |
| Traceability | §7.10 (availability); RG-35; G-23 |
| Actors | Teacher, leadership |

### FR-CAR-18 — Forbid any cross-rating between teachers and schools

| Attribute | Value |
|---|---|
| Description | The module exposes, at no version of the roadmap, any function for rating, evaluating, recommending, reviewing, or ranking teachers by schools or schools by teachers; verified affiliation periods are the only shared career element. Any proposed development in that direction is out of scope and must be refused in review. |
| Priority | Must |
| Version | MVP (a structural constraint maintained in V1 and V2+) |
| Traceability | DEC-14, DEC-25, INV-30; Q-07 |
| Actors | All |

```gherkin
Feature: Structural absence of cross-rating (all versions)
  Scenario: No rating function is exposed
    Given a principal viewing a teacher's affiliation card
    When they browse every available action
    Then no rating, review, recommendation, or ranking action exists
    And no free-text "teacher appraisal" field is shared outside the school

  Scenario: A verified period carries no judgment
    Given a verified affiliation period viewed by another school on the teacher's share
    When that school opens the period
    Then it sees school, years, roles, and contract nature, and nothing else
```

### FR-CAR-19 — Track the share of permanent teachers

| Attribute | Value |
|---|---|
| Description | The school has a configurable indicator of the **share of permanent teachers** among its active teaching affiliations (permanent teachers relative to all active teachers, by headcount and, optionally, by assigned hours), compared to a configured threshold (default value: 80%, inherited from the repealed Law 06.00; whether it is carried over into Law 59.21's decrees is unconfirmed — monitored by `prd/cross-cutting/36-legal-compliance-data-protection.md`, OQ-03). Crossing below the threshold produces a non-blocking alert to leadership; the indicator is viewable per school and consolidated per organization (RG-21), and feeds the ESISE HR-referential filing (FR-MAS-08 of `prd/modules/21-massar-regulatory-exports.md`). No data from another school enters the calculation (RG-35). (→ ARB-23c) |
| Priority | Should |
| Version | V1 |
| Traceability | Research correction no. 18; `prd/research/02-regulatory-data.md` §1; RG-21, RG-35; OQ-03; FR-MAS-08; ARB-23c |
| Actors | Leadership, group administrator |

```gherkin
Feature: Permanent-teacher share indicator (V1)
  Scenario: Crossing below the threshold
    Given a school with 40 active teachers, 33 of them permanent, and a threshold set at 80%
    When a new part-time affiliation is activated, bringing the headcount to 41 with 33 permanent
    Then the indicator shows 80.5% and stays above the threshold
    When a second part-time affiliation is activated (42, with 33 permanent)
    Then the indicator shows 78.6% and leadership receives a non-blocking alert
```

## 5. Morocco-specific considerations

| Subject | Data and source | Handling in this module |
|---|---|---|
| External public-sector teachers | Ministerial circular of 11/11/2024: requests from 04/01 to 05/15, endorsement of the public-school principal, provincial transmission before 05/20, preliminary AREF authorization then final at the end of September; global 8-hour/week cap across all schools combined; monthly AREF list (timetables, hours taught) (`prd/research/02-regulatory-data.md` §8; Médias24 11/13/2024, note 22524) | FR-CAR-11, FR-CAR-12, FR-CAR-13 |
| Weight of part-time teachers | About 50% of the private teaching body (industry source, Médias24 01/11/2023; no official statistic — the founding document said "more than 50%", H-13 partially confirmed) | Multi-affiliation (FR-CAR-03) is treated as the nominal case, not an exception |
| Fate of Law 06.00 | Law 06.00 repealed by Law 59.21 (BO no. 7485 of 02/23/2026); carry-over of "80% permanent" and the 8 hours unconfirmed; monitoring required (`prd/research/02-regulatory-data.md` §1 and §8) | Cap, permanent-teacher threshold, and categories configurable (FR-CAR-12, FR-CAR-19); OQ-03 |
| Decree 1538.03 | Teacher files to be filed with AREF: a decree cited by the founding document, text not found online | AREF file content not modeled; OQ-04 |
| Teachers' personal data | The global professional profile (identity, career, adults' national ID) falls under Law 09.08: collecting the national ID card number switches to prior authorization (F112); ZSchool is the data controller for global identity, the school for its operational data (`prd/research/02-regulatory-data.md` §2) | Reference `prd/cross-cutting/36-legal-compliance-data-protection.md` (CNDP basis for the global teacher profile and the national ID card not collected at MVP, ARB-25a); OQ-05 |
| Languages and materials | Bilingual Arabic/French interactions, full RTL; monthly AREF list printable in Arabic and French | Screens §7, FR-CAR-13 |

## 6. Data and events

### 6.1 Entities used (dictionary from `prd/03-domain-data-model.md`)

| Entity | Use in this module |
|---|---|
| `SchoolMembership` | Central entity: multiple roles, contract nature (permanent, part-time, intern, contractor, external public-sector teacher — OQ-01), dates (including a scheduled end date, ARB-23e), statuses (invited, active, suspended, ended), permissions; **qualification as declared to the employer** (degrees and titles as declared to that school, the sole source of ESISE filings, ARB-23b); AREF attributes for external public-sector teachers (reference, type, and validity of the authorization, provincial office; weekly hours assigned at that school) |
| `TeacherProfile` | Professional profile held by the teacher: degrees, subjects, levels, languages, teaching authorization, verified experience (periods confirmed by schools) and declarative "unverified" experience, hours self-declared outside the platform and consent to sharing the cap-exceeded alert (ARB-23a), availability (V2); never exported to the ministry (ARB-23b) |
| `TeacherAssignment` | Active course assignments: form the basis for the weekly-hours calculation (FR-CAR-12) and least-privilege permissions; managed by `prd/modules/12-academic-structure-timetables.md` |
| `School` | Minimal directory fields (name, city, cycles; systems and website in V1+), carried by FR-ADM-17; stays private beyond that (INV-19) |
| `Person`, `User` | Unique identity and account, multiple profiles; phone = primary contact identifier |
| `AuditLog` | Immutable logging of entries on affiliations and permissions (MVP, arbitration D4); log of views of shared profiles (V1, ARB-25j) |

No new entity is created: AREF tracking is carried by `SchoolMembership` attributes and aggregated views, in line with the frozen schema of `PROJECT.md` §6.10.

### 6.2 Domain events

Events produced by this module and consumed by communication (`prd/modules/17-communication-notifications.md`); `AffiliationClosed` already appears in the catalog of `prd/03-domain-data-model.md` §7.

| Event | Trigger | Notifiable recipients |
|---|---|---|
| `AffiliationInvited` | Invitation sent | Invited person (in-app, SMS, or email) |
| `AffiliationAccepted` / `AffiliationDeclined` | The person's decision | Inviting school |
| `AffiliationActivated` | Bilateral acceptance | Person and school |
| `AffiliationSuspended` / `AffiliationResumed` | Leadership's decision | Person concerned |
| `AffiliationClosed` | Closure by leadership | Person concerned (immediate access removal, RG-19) |
| `ApplicationFiled` | Application via the network (V2) | Recipient school only |
| `ArefAuthorizationDeadline` | Deadlines 04/01, 05/20, start of school year, expiry | The school and teacher concerned |
| `HoursCapExceeded` | Crossing the 8-hour cap | Teacher; concerned schools only if the teacher consented to sharing the alert (ARB-23a) |
| `MonthlyArefListGenerated` | Generating the monthly list | Leadership |
| `PermanentThresholdCrossed` | Permanent-teacher share falling below the threshold (FR-CAR-19) | Leadership, group administrator |
| `AffiliationScheduledClosureRecorded` | Scheduled closure recorded (FR-CAR-04) | Academic leadership (course reassignment), person concerned |

## 7. Key screens

Text descriptions (conventions §1.3); mobile-first, bilingual FR/AR with RTL.

### ECR-CAR-01 — School affiliation register (web, leadership and front office)

Top area: filters (status, role, contract nature, school year, search by name or phone). Dense list: person (name AR/FR), roles, contract, dates, status by badge (invited, active, suspended, ended), "external public-sector teacher" badge with authorization status. Per-row actions: view detail, suspend, resume, close, resend an invitation. Desktop view preferred; mobile adaptation as stacked lists. Explicit empty states ("no pending invitations").

### ECR-CAR-02 — Affiliation record (creation and detail)

A three-block form: (1) person (search an existing identity by phone, or create one, with duplicate checking); (2) affiliation (multiple roles, contract nature, dates, school year, editable role-template permissions); (3) an "external public-sector teacher" block (reference and validity of the AREF authorization, weekly hours assigned) shown only when the contract nature warrants it. Hours assigned **at that school** shown read-only (never the cross-school total, ARB-23a); a "qualification as declared to the employer" field; a scheduled end date with a reassignment reminder. Status-change log at the bottom of the record.

### ECR-CAR-03 — Person's "My affiliations" area (mobile-first, PWA)

A list of affiliations per school with status, roles, and dates; a context switcher at the top of the screen; received invitations with role detail and accept/decline buttons; history of closed periods (MVP) then "verified" (V1, with a note and the issuing school); for external public-sector teachers (V1): the total hours across all affiliations, entry of self-declared off-platform hours, a "share the cap-exceeded alert with my schools" toggle; links to the professional profile. No trace of searches or views performed is visible there to a third party.

### ECR-CAR-04 — Teacher's professional profile (mobile and web)

Editing by the teacher: professional identity, degrees (declared), subjects, levels, languages, teaching authorization, experience (a separate "non-ZSchool experience — unverified" block), availability (V2, with per-recipient sharing scope). A "what a school sees" preview view. A restricted school view: only explicitly shared elements and that school's verified periods; a note that the view is logged.

### ECR-CAR-05 — AREF dashboard (web, leadership)

Three zones: (1) authorization status of external public-sector teachers (reference, type, validity, next deadline, alert badges); (2) weekly hours assigned per teacher at the school, and a "cap exceeded across all affiliations" badge only for teachers who have consented to sharing (no total or remaining hours shown, ARB-23a); (3) generating the monthly list (month, scope, preview, bilingual PDF and spreadsheet export, time-stamped generation history). Consolidated view at the organization level (V1, RG-21).

### ECR-CAR-06 — Directory and network (mobile-first, V2+)

School search (city, cycles, subjects, system); minimal card matching the directory (RG-23); an "apply" action with a choice of shared scope; a "my applications" tab with statuses; an "open to opportunities" toggle with a reminder of its confidentiality ("invisible to your schools"); a school tab with "applications received" and "shared availability". No social counter, no rating, no ranking (FR-CAR-18). At MVP, the minimal directory is only exposed via the transfer module's destination search (ECR-TRA-01, `prd/modules/18-transfers-mobility.md`); the network screen above arrives in V2+.

## 8. Integrations

| Integration | Use | Reference |
|---|---|---|
| Messaging (SMS, email) and in-app notifications | Sending invitations, AREF deadline reminders, cap alerts | `prd/cross-cutting/35-external-integrations.md` (INT-SMS, INT-EML), `prd/modules/17-communication-notifications.md` |
| AREF | No interface: the monthly list is prepared by the platform then forwarded by the school (mail or provincial channel) | FR-CAR-13; `prd/research/02-regulatory-data.md` §8 |
| Massar | No exchange: the module does not depend on the Massar code (adults matched by phone) | `prd/modules/21-massar-regulatory-exports.md` |

## 9. Module-specific non-functional requirements

| Domain | Module-specific requirement | Reference |
|---|---|---|
| Confidentiality and audit | Every view of a shared profile and every write on an affiliation is logged (author, context, timestamp); no exposure of the log to schools beyond what is provided for (RG-38) | `prd/cross-cutting/31-security-privacy.md` |
| Mobile and offline | Affiliations area and invitation acceptance usable on mobile PWA over unstable networks; no offline-entry requirement specific to this module (the flows are short) | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-MOB, NFR-OFF) |
| Internationalization | Role and contract terminology translated FR/AR with full RTL; bilingual AREF documents | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-I18N) |
| Performance | Register filterable across several hundred affiliations per school within the general targets (usual pages under 2 s on 4G) | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-PERF) |
| Retention | Verified periods survive affiliations and follow the founding document's retention periods; a school's closure (shutdown, cancellation) maintains the person's access to a statement of their periods | DEC-22, DEC-23; `prd/cross-cutting/31-security-privacy.md` |

## 10. Success metrics

Indicators proposed for consolidation in `prd/cross-cutting/38-kpi-success-metrics.md` (`KPI-NN` IDs carried by that file; the affiliation, AREF, and permanent-teacher-share indicators are created there under KPI-35 and following, ARB-26h):

| Indicator | Indicative target | Version |
|---|---|---|
| Share of active teachers holding more than one active affiliation | Measure of the part-time-teacher network effect (reference H-13: about 50% of the teaching body) | MVP |
| Rate of affiliations activated with no follow-up (invitation accepted within 7 days) | Quality of the staff onboarding flow | MVP |
| Rate of filled-in professional profiles (at least subjects and levels) among active teachers | V1 adoption | V1 |
| Share of external public-sector teachers with an up-to-date AREF authorization as of September 30 | Client-school compliance | V1 |
| Share of schools above the configured permanent-teacher threshold (FR-CAR-19) | Client-school compliance | V1 |
| Monthly AREF lists generated within the first 5 days of the month | Compliance regularity | V1 |
| Applications filed and accepted via the network; activation of the "open" status | Network adoption, never measuring an employer's search (G-23) | V2+ |

## 11. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Extend the founding document's enumeration of `SchoolMembership` contract natures with "external public-sector teacher" | Research (correction no. 18, circular of 11/11/2024) makes this category a regulatory reality distinct from "part-time"; the founding document §6.5 (DEC-05) does not list it. Approach taken here: a category carried by AREF attributes, pending an update to the founding document |
| OQ-02 | Version for activating the minimal public directory (RG-23) | **Resolved — D6**: minimal read-only directory (name, city, cycles) at MVP, Must priority — needed for MVP transfer (FR-TRA-01 of `prd/modules/18-transfers-mobility.md`); INV-19 is tagged "MVP (name, city, cycles); V1 (further fields)" in `prd/03-domain-data-model.md`, in line with this; sole owner of the rule: FR-ADM-17 (ARB-26), FR-CAR-14 as a reference; network functions (advanced search, applications) stay V2+. |
| OQ-03 | Survival of the 8-hour/week cap and the "external public-sector teacher" status after Law 06.00's repeal by Law 59.21 | Carry-over unconfirmed as of 09/09/2026 (research, correction no. 18); the platform configures the cap and categories, with regulatory monitoring driven from `prd/cross-cutting/36-legal-compliance-data-protection.md` |
| OQ-04 | Exact content of the teacher file to be filed with AREF (decree 1538.03 cited by the founding document, text not found) | The monthly list (FR-CAR-13) covers the only dated and sourced requirement; the initial file's scope is still to be confirmed with pilots and AREFs |
| OQ-05 | CNDP filing basis covering the global professional profile (TeacherProfile) and the V2 network | **Partially resolved — ARB-25a**: adults' national ID card is not collected at MVP (the field is disabled until F112 authorization); the global teacher profile falls under ZSchool's own filing as data controller (DEC-16), formalized in `prd/cross-cutting/36-legal-compliance-data-protection.md`. Still open for V2: the legal basis and notices specific to network availability and applications. |
| OQ-06 | Behavior when the 8-hour/week AREF cap is exceeded (founder arbitration D8). | **Resolved — D8, completed by ARB-23a** (total visible to the teacher only, binary alert on consent, declarative off-platform hours). Decided: the cap-exceeded alert is non-blocking and a justification is entered and logged by the teacher or by the school that received the alert; ZSchool does not block the entry and does not rule on compliance — that judgment belongs to the teacher, the school, and AREF. FR-CAR-12 reworded accordingly; PJ-ENS-10 of `prd/journeys/04-part-time-teacher.md` carried by Hassan (ARB-23d). |
| OQ-07 | Owner of the "permanent-teacher share" ratio cited by FR-MAS-08 | **Resolved — ARB-23c**: FR-CAR-19 (V1), configurable threshold, default 80%, Law 59.21 monitoring (OQ-03). |

## 12. Traceability

Table: founding-document ID → this file's requirements that cover them.

| Founding-document ID | Founding-document element | Coverage |
|---|---|---|
| RG-17 | Simultaneous active affiliations, multiple roles | FR-CAR-01, FR-CAR-03 |
| RG-18 | Invitation/application, bilateral acceptance | FR-CAR-02, FR-CAR-15 |
| RG-19 | Closure (immediate or scheduled): immediate removal, attributed data kept | FR-CAR-04, FR-CAR-05; ARB-23e |
| RG-20 | Professional profile carried by the teacher, verified periods | FR-CAR-07, FR-CAR-08, FR-CAR-04 |
| RG-23 | Minimal public school directory | FR-CAR-14 (consumer; owner FR-ADM-17; FR-TRA-01 reference of `prd/modules/18-transfers-mobility.md`) |
| RG-35 | Restricted visibility of a teacher's history | FR-CAR-10, FR-CAR-08, FR-CAR-12 (total not exposed), FR-CAR-13, FR-CAR-16, FR-CAR-19; ARB-23a |
| RG-36 to RG-39 | Contextual permissions, fine-grained roles, logging, least privilege | FR-CAR-06 |
| DEC-05 | Single `SchoolMembership` entity, simultaneous affiliations | FR-CAR-01, FR-CAR-03; OQ-01 |
| DEC-14, DEC-25 | No cross-rating; only verified periods are shared | FR-CAR-18, FR-CAR-08, FR-CAR-10 |
| DEC-17 | Detailed roles and fine-grained permissions | FR-CAR-06 |
| DEC-33 | Non-ZSchool experience "unverified" | FR-CAR-09 |
| G-23 | Job-search confidentiality, cross-evaluations, degree verification | FR-CAR-16, FR-CAR-10, FR-CAR-07, FR-CAR-15, FR-CAR-17 |
| §7.10 | Career and network scope | FR-CAR-07 to FR-CAR-17 |
| C-06, C-07, C-08 | Resolutions carried down to requirement level | FR-CAR-03, FR-CAR-01, FR-CAR-14 |
| H-13 | Share of part-time teachers | FR-CAR-03; §5; §10 |
| Q-07, Q-16 | Founding-document answers carried forward | FR-CAR-18; FR-CAR-09 |
| Research, correction no. 18 | Circular of 11/11/2024: AREF authorizations, 8 hours, monthly list; ~50% part-time; 80% permanent (Law 06.00) | FR-CAR-11, FR-CAR-12, FR-CAR-13, FR-CAR-19; §5; OQ-01, OQ-03, OQ-04, OQ-07 |
| `prd/cross-cutting/42-review-arbitrations.md` | Arbitrations from the 09/09/2026 review | ARB-23a (FR-CAR-12, FR-CAR-13, §6, §7); ARB-23b (§6: qualification as declared to the employer, FR-MAS-08); ARB-23c (FR-CAR-19); ARB-23d (§2, persona Hassan); ARB-23e (FR-CAR-04); ARB-25a (§5, OQ-05); ARB-25j (§6 `AuditLog`); ARB-26 (FR-CAR-14 as a reference to FR-ADM-17) |
| INV-14, INV-15, INV-16, INV-19, INV-29, INV-30, INV-31, INV-32, INV-33, INV-34 (cross-references `prd/03-domain-data-model.md`) | Invariants implemented | FR-CAR-01, FR-CAR-02, FR-CAR-04, FR-CAR-06, FR-CAR-08, FR-CAR-10, FR-CAR-14, FR-CAR-18 |
| BES-ENS-01, BES-ENS-06, BES-ENS-07, BES-DIR-07 (cross-references `prd/02-actors-personas.md`) | Persona needs covered | FR-CAR-03, FR-CAR-07, FR-CAR-15/16, FR-CAR-06 |
