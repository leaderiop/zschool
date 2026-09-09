# PRD ZSchool — Detailed Journeys: Khadija, Part-Time Teacher (`ENS`)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09; supersedes 0.2 — revised 09/09/2026) |
| Date | 2026-09-09 |
| Status | PRD draft — under review; arbitrations ARB-01 to ARB-26 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §2.10, §2.11, §5.2, §6.1, §6.5 (RG-17 to RG-20), §6.8, §6.9, §7.3, §7.4, §7.5, §7.8, §7.10, §7.11, §8 (RG-36 to RG-39), §9, §10, §12, §14; `prd/research/02-regulatory-data.md` §8 (part-timers and AREF), `prd/research/04-pedagogy-massar-calendar.md` §1 (weightings and continuous-assessment compliance), `prd/research/05-infrastructure-usage.md` §2 (ANRT 2024-2025 digital usage); `prd/research/00-baseline-corrections.md` (discrepancies No. 1, 10, and 18) |
| Related files | `prd/02-actors-personas.md` (BES-ENS-01 to BES-ENS-08), `prd/03-domain-data-model.md` (entities, INV-…, events), `prd/journeys/00-journey-map.md` (PC-04, PC-05, PC-06, PC-11), `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/12-academic-structure-timetables.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/19-teacher-career-network.md`, `prd/modules/20-dashboards-reporting.md`, `prd/modules/21-massar-regulatory-exports.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` |

---

## 1. Purpose and file conventions

This file describes the end-to-end journeys of **Khadija, a part-time math teacher** at two private schools in Rabat (`PROJECT.md` §5.2): first activating her account, day-to-day handling of the multi-school context, taking roll call for her courses, entering grades in the evening on mobile, the lesson log and homework, messages to her students' parents, preparing her averages before the council, and managing her professional profile. The "public-sector outside teacher" status journey (AREF authorization, 8-hour cap) is carried by a secondary character, **Hassan, a part-time public-sector teacher at School A**, since Khadija is a private-sector part-timer whom this cap does not concern (ARB-23d).

It applies the conventions of `prd/00-conventions.md`:

- Journey steps carry the identifier `PJ-ENS-NN`, a counter starting at 01, a namespace exclusive to this file.
- Persona needs (`BES-ENS-…`) are carried by `prd/02-actors-personas.md` §3.4; this file narrates them without redefining them.
- Cross-cutting critical journeys (`PC-…`) are carried by `prd/journeys/00-journey-map.md`; this file describes the steps from the teacher's viewpoint without duplicating the overview.
- Functional requirements (`FR-…`) are carried by the files `prd/modules/10-administration-onboarding-subscription.md` to `prd/modules/23-health-sensitive-data.md`; every step points to the relevant module by file path.
- Version tags (MVP, V1, V2+) strictly follow `PROJECT.md` §12 (DEC-15).

## 2. Usage profile and persona constraints

The full profile is carried by `prd/02-actors-personas.md` §2.4. Constraints that shape this file's journeys:

1. **Multi-affiliation**: two Rabat schools in the same year; over half of private-sector teachers are in this situation (H-13; estimated at about 50% per an industry source, Médias24 11/01/2023, `prd/research/02-regulatory-data.md` §8 — a discrepancy with the baseline's "over 50%" in §2.11, see OQ-01).
2. **Mobile-first, unstable network**: not always a computer in class; roll call and grade entry on the phone, with resume after an outage (`PROJECT.md` §2.10, §10). Per the ANRT (TIC 2024-2025 survey), 91.2% of individuals aged 5 and over use the internet, 91.7% of mobile-equipped individuals have a smartphone, and WhatsApp is used by 98.6% of social-media users; the Android 67.96%/iOS 32.02% shares are web-traffic shares (StatCounter), not device-fleet shares (`prd/research/05-infrastructure-usage.md` §2 — a wording discrepancy with baseline §2.10, see OQ-05).
3. **Evening entry**: grades are entered in the evening, on a limited data plan; write timestamps are expressed in the `Africa/Casablanca` time zone, now **permanent UTC+0** from 20/09/2026 (Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026 — `prd/research/00-baseline-corrections.md` No. 1; a discrepancy with baseline §2.4/§10, see OQ-04).
4. **Career confidentiality**: Khadija is looking for a full-time position next year; her search must not leak to her current employers (`PROJECT.md` §7.10).
5. **Free of charge**: the teacher pays nothing; the paying customer is the school (DEC-13).

## 3. Journey overview

| ID | Journey | Trigger | Frequency | Version | Needs | Critical journeys |
|---|---|---|---|---|---|---|
| PJ-ENS-01 | First activation: invitation, account creation, claiming an affiliation | An invitation from a school | One-off, replayed for each new school | MVP | BES-ENS-01 | PC-04 (shared mechanics) |
| PJ-ENS-02 | The daily multi-school context switcher | Every session, every switch | Daily | MVP | BES-ENS-01 | Cross-cutting |
| PJ-ENS-03 | Taking roll call for her courses on mobile (declared sessions), including offline | Every session | Daily | MVP | BES-ENS-02 | PC-05 |
| PJ-ENS-04 | Evening grade entry on mobile: saving, leadership lock | An assessment held; before period closing | Weekly, peaking at period end | MVP | BES-ENS-03, BES-ENS-08 | PC-06 |
| PJ-ENS-05 | Lesson log and homework | After each session; a homework due date | Weekly | V1 | BES-ENS-04 | PC-06 (peripheral) |
| PJ-ENS-06 | Messages to her students' parents (moderated mode, DEC-34) | A need to inform or open a thread | One-off to weekly | MVP (announcements, messages, moderated in-app threads — ARB-21a); V1 (general WhatsApp, push) | BES-ENS-05 | PC-11 |
| PJ-ENS-07 | Preparing her averages before the class council | Approaching period close | Twice a month, peaking at semester end | MVP (averages); V1 (council) | BES-ENS-08 | PC-06 |
| PJ-ENS-08 | Professional profile and verified experience | A profile update; confirmation by a school | One-off, recurring at each affiliation | MVP (identity); V1 (profile editor and "verified" statuses) | BES-ENS-06 | Cross-cutting |
| PJ-ENS-09 | Availability and discreet applications on the teacher network | Looking for a full-time job | One-off | V2 | BES-ENS-07 | Out of MVP (map §5) |
| PJ-ENS-10 | AREF authorization for a "public-sector outside teacher": the 8-hour cap and documents (secondary character: Hassan) | Hiring, the start of the year, an annual request | Seasonal and monthly (the AREF list) | V1 | BES-ENS-01, BES-ENS-06 | Cross-cutting |

## 4. Detailed journeys

### PJ-ENS-01 — First activation: an invitation from a school, account creation, claiming the affiliation

| Attribute | Value |
|---|---|
| Objective | Activate Khadija on her own account and make her affiliation to the inviting school active, with no duplicate account created if she already exists on the platform. |
| Trigger | The school creates the affiliation (teacher role, part-time contract, dates) and sends the invitation. |
| Frequency | One-off per school; the journey replays identically for the second school (RG-17, INV-14). |
| Actors | Khadija; leadership or secretariat of the inviting school; ZSchool support (duplicates, an audited merge). |
| Preconditions | The school is onboarded; the academic structure and course assignments (`TeacherAssignment`) are configured or in progress. |
| Version | MVP (`PROJECT.md` §12: global teacher identities, invitations and claim; teacher affiliations, template roles). |
| Needs covered | BES-ENS-01. |
| Baseline | (→ RG-17, RG-18, RG-19, RG-36, DEC-03, DEC-05, DEC-11, INV-13, INV-14, INV-15, INV-16, INV-37; event `IdentityClaimed`) |

**Steps.**

1. The secretary or leadership at School A creates the affiliation in the administration module (`prd/modules/10-administration-onboarding-subscription.md`): identity (a name in both scripts, mobile number), role "teacher," contract type "part-time," dates, scope (course assignments). She either creates a provisional identity or links the existing global identity found by mobile number (the primary contact identifier, DEC-11, INV-37).
2. The school sends the invitation: a bilingual SMS to the mobile number containing a time-limited invitation link or code (FR/AR, DEC-10). The affiliation is in the "invited" status; it only becomes active once both parties accept (RG-18, INV-15).
3. Khadija opens the link on her phone. **Case a — first contact with ZSchool**: creating an account by mobile number with a one-time code, completing the minimal teacher profile (a name in both scripts, a password of at least 12 characters; MFA is optional for teachers, with 90-day trusted devices, ARB-25l, `PROJECT.md` §9). **Case b — an existing account** (she already teaches at School B): signing in with her usual account; no second account creation is possible (INV-13).
4. She accepts the affiliation: the status moves to "active," the context "School A — teacher" appears in her context switcher (PJ-ENS-02), and her courses become visible in "My courses." The event `IdentityClaimed` is produced toward the creating school (`prd/03-domain-data-model.md` §7).
5. Declining the invitation keeps the affiliation at the "invited" state, then closes it after expiry; the school is notified of the decline with no access to the account.
6. If a duplicate is detected (two identities for the same person), merging is an audited operation reserved for ZSchool support from MVP (RG-06, INV-03, ARB-01, module `prd/modules/10-administration-onboarding-subscription.md`). On a number change or loss, Khadija follows the number-change procedure (self-service via a double OTP, or at an affiliated school's front desk with identity verification, ARB-08, FR-ADM-20).
7. Shared mechanics with the parent claim described in PC-04 of `prd/journeys/00-journey-map.md`; this file covers only the teacher-specific parts.

**Rules and edge cases.**

- The same person may hold several active affiliations at different schools and several roles at the same school (RG-17, INV-14).
- Later closing an affiliation immediately removes access to the school's data; data produced (grades, roll calls, messages) stays at the school, attributed to its author (RG-19, INV-16; event `AffiliationClosed`).
- Context permissions are recalculated at every sign-in and every affiliation state change (RG-36, INV-31; `prd/cross-cutting/30-roles-permissions-matrix.md`).

**Acceptance criteria (Gherkin).**

```gherkin
Feature: A part-time teacher's first activation
  Scenario: Inviting a new teacher with no existing account (MVP)
    Given a School A onboarded with a "Math — 2AC-3" course
    When the secretary creates Khadija's part-time affiliation and sends the SMS invitation
    Then Khadija receives a bilingual SMS with a time-limited invitation link
    When she creates her account with her mobile number and accepts the affiliation
    Then her affiliation moves to the "active" status
    And the context "School A — teacher" appears in her context switcher
    And the identity-claim event is notified to School A

  Scenario: Inviting a teacher already active at another school (MVP)
    Given Khadija holds an active account with an active affiliation to School B
    When School A creates her affiliation and sends the invitation to the same mobile number
    And Khadija signs in with her existing account and accepts
    Then she holds two simultaneous active affiliations (RG-17)
    And a single account carries both contexts (INV-13)
    And no new identity was created
```

### PJ-ENS-02 — The daily multi-school context switcher

| Attribute | Value |
|---|---|
| Objective | Guarantee that Khadija always acts in the right school: one person, several contexts, strictly separated data. |
| Trigger | Signing in; switching between schools during the day (morning at School A, evening entry at School B). |
| Frequency | Daily. |
| Actors | Khadija. |
| Preconditions | At least one active affiliation; where applicable, a second profile (e.g. a parent at another school, RG-03). |
| Version | MVP (`PROJECT.md` §12: multi-school dashboards, PWA; RG-03: a context switcher offered by the interface). |
| Needs covered | BES-ENS-01. |
| Baseline | (→ RG-03, RG-21, RG-36, RG-37, RG-39, DEC-03, INV-13, INV-17, INV-31, INV-32, INV-34) |

**Steps.**

1. On opening, the app shows the context switcher: a list of active (profile, school) pairs — "Teacher, School A," "Teacher, School B," and, where applicable, "Parent, School C" (RG-03). The last session's context is offered by default; a single active context is selected with no step.
2. The current context stays permanently identified in the app's header (the school's name), so no write can be made "in the wrong school" by mistake.
3. Switching context is available at any time from the header; it reloads the selected tenant's data: courses, classes, students, periods, messages. No school data from one school is visible from another school's context (RG-21, INV-17).
4. Displayed permissions (action buttons, accessible screens) are recalculated for the current (profile, school) pair (RG-36, INV-31) based on the school's roles and fine-grained permissions (RG-37, INV-32; `prd/cross-cutting/30-roles-permissions-matrix.md`).
5. Notifications are grouped by context; a notification always carries the name of the sending school.
6. Pending invitations from other schools appear in the switcher with their status; a closed affiliation disappears from the switcher at the next server request (RG-19, INV-16).
7. Least privilege applies in every context: Khadija only sees the students in her courses, derived from her active assignments (RG-39, INV-34).

**Acceptance criteria (Gherkin).**

```gherkin
Feature: The multi-school context switcher
  Scenario: Switching between two schools with data isolation (MVP)
    Given Khadija signed in in the "School A — teacher" context
    And assessments entered the same day for her School A courses
    When she switches to the "School B — teacher" context
    Then no assessment, student, or message from School A is visible
    And only courses from her active School B assignments are offered

  Scenario: Immediate removal of a closed context (MVP)
    Given an active affiliation of Khadija to School A
    When School A closes her affiliation
    Then the "School A — teacher" context disappears from the switcher at the next server request
    And any attempt to access School A's data is refused server-side
    And the grades Khadija entered stay at School A, attributed to their author (RG-19)
```

### PJ-ENS-03 — Taking roll call for her courses on mobile, including offline

| Attribute | Value |
|---|---|
| Objective | Make roll call reliable for every session from the classroom, with no computer or network, and trigger notification of absent students' families within the target delay. |
| Trigger | The start of each of her courses' sessions. |
| Frequency | Daily, every school day. |
| Actors | Khadija (rolls her own courses); head supervisor (the day's follow-up, reminders, excuses); parents (notification, excuse). |
| Preconditions | Active affiliation; active course assignments; her courses' student list available. |
| Version | MVP (`PROJECT.md` §12: attendance with SMS/WhatsApp notification, excuses; §7.4: roll call per course or per half-day, on mobile, with offline mode and sync; declared sessions ARB-04, grouping and hold window ARB-15). |
| Needs covered | BES-ENS-02. |
| Critical journeys | PC-05 (`prd/journeys/00-journey-map.md`). |
| Baseline | (→ §7.4, §10; RG-38, RG-39, DEC-12, DEC-36, INV-34; event `AbsenceRecorded`; ARB-04, ARB-15) |

**Steps.**

1. From the school's context, "My courses today" lists the day's sessions: in MVP, **declared sessions** — Khadija picks the course and a free time slot, or finds expected sessions declared by student life (a single session per course, date, and slot, FR-PED-20, ARB-04); in V1, sessions drawn from the timetable (`prd/modules/12-academic-structure-timetables.md`), with room, class or group, and time slot. A declared session that student life marks not held (an absence, a cancellation, PJ-SUR-09) does not appear.
2. Khadija opens the session: the student list is limited to her course's enrolled students (RG-39, INV-34). Every student is marked present by default; she toggles to "absent," "late," or "excused absence" per the states offered by the student-life module (`prd/modules/13-attendance-student-life-discipline.md`).
3. Roll call works offline: markings are kept locally with a timestamp; the screen shows "awaiting sync" (`PROJECT.md` §7.4 and §10; NFR-OFF domain of `prd/cross-cutting/32-non-functional-requirements.md`).
4. On roll-call validation (possible after resyncing), the `AbsenceRecorded` event is produced; only each student's first absence of the day triggers immediate notification, after a 3-minute hold window; subsequent absences on the same day are grouped into the evening summary (ARB-15a/b). In MVP, guardians receive the notification in-app, via WhatsApp "utility" if they've opted in, then SMS as a fallback, in their language; push arrives in V1 (DEC-12, DEC-36, ARB-21; `prd/modules/17-communication-notifications.md`). The target delay is under 5 minutes after synchronized validation (`PROJECT.md` §10).
5. Roll-call corrections stay possible during the day, tracked with author and timestamp (RG-38); a correction within the hold window cancels the send, a correction after sending issues a correction notice (ARB-15b); if the supervisor has already validated a roll call for the same session, the first synchronized validation is authoritative and the gap is arbitrated by student life (ARB-15e); once switched to the day's student-life view, follow-ups and excuses fall to the head supervisor (PC-05).
6. If the school configures roll call by half-day, the same grid is offered per half-day instead of per course (§7.4).

**Acceptance criteria (Gherkin).**

```gherkin
Feature: Taking roll call for her courses on mobile
  Scenario: Offline roll call in class then sync (MVP)
    Given Khadija in the room for the declared session "Math — 2AC-3, 8 a.m." with no network
    When she marks two students absent and one late, then validates the roll call
    Then the markings are kept locally with a timestamp
    And the screen shows "validation awaiting sync"
    When the connection returns
    Then the synced roll call triggers, after the 3-minute hold window, notification of the two absent students' guardians if it is their first absence of the day
    And the notification is delivered in under 5 minutes after synchronized validation

  Scenario: A declared session with no timetable (MVP)
    Given School A with no timetable entered
    When Khadija opens "My courses today" and declares the session "Math — 2AC-3" on the 8 a.m. slot
    Then the session is created only once for this course, date, and slot
    And the session's roll call is offered immediately

  Scenario: Limited to her courses' students (MVP)
    Given a School A student enrolled in a class where Khadija does not teach
    When Khadija opens her course's roll-call list
    Then this student does not appear in the list
    And no search for a student outside her assignments is possible from the roll-call screen
```

### PJ-ENS-04 — Evening grade entry on mobile: saving and leadership lock

| Attribute | Value |
|---|---|
| Objective | Enable reliable entry of her assessment grades, in the evening, on the phone, for each of her schools, with no loss on an outage, with integrity protected once leadership closes the period. |
| Trigger | An assessment held; an entry deadline before the assessment period closes. |
| Frequency | Weekly in steady state; peaks before the two semester closings (three for a trimester school, DEC-35). |
| Actors | Khadija (entry and validation); leadership (creating periods, closing and locking, post-lock corrections). |
| Preconditions | The school's context selected; an assessment period open; an active course assignment; an assessment created or creatable. |
| Version | MVP (`PROJECT.md` §12: assessments, grades, average calculation; §7.5: entry by teachers on web and mobile, leadership lock at period closing; §10: entry tolerant of outages; a "draft/published" mark status and the ARB-17 calculation rules). V1 for the exportable immutable audit log (INV-33); council decision entry in MVP wave 2, tooled preparation in V1 (ARB-01). |
| Needs covered | BES-ENS-03, BES-ENS-08. |
| Critical journeys | PC-06 (`prd/journeys/00-journey-map.md`). |
| Baseline | (→ §2.5, §7.5, §10; RG-29, RG-38, RG-39, INV-21, INV-27, INV-34, INV-41; event `PeriodClosed`) |

**Steps.**

1. From the relevant school's context (PJ-ENS-02), the teacher dashboard lists "pending entries" by course and period (`PROJECT.md` §7.11; `prd/modules/20-dashboards-reporting.md`; `prd/modules/14-assessments-grades-report-cards.md`).
2. Khadija opens an existing assessment or creates one: type (continuous assessment, homework, test, mock exam, oral, project), scale (grades out of 20 with decimals, §2.5), coefficient, and period offered from the school's configuration; the subject's coefficient and language of instruction come from the level-and-track configuration (INV-41). Creation is limited to her courses (RG-39).
3. The mobile entry grid shows one student per row (a name in both scripts), a touch-optimized numeric field accepting comma and period decimal separators, and an immediate plausibility check (a value between 0 and the scale). The "absent," "exempt," and "not graded" markers are explicit, never an implicit zero; in the average, an unexcused absence counts as 0 by default (configurable), an excused absence, an exemption, and "not graded" are excluded from the denominator; any scale other than 20 is rebased to 20 before weighting (ARB-17a/b).
4. Saving is automatic after each cell; on a network outage, entered values are kept in a local draft and the screen shows "local save awaiting sync"; on reconnection, the draft resyncs with no re-entry (`PROJECT.md` §10; NFR-OFF domain of `prd/cross-cutting/32-non-functional-requirements.md`).
5. On review, consistency checks are offered: out-of-scale grades blocked, students with no grade flagged, a reminder of the school's rule on the minimum number of assessments per subject and period (at least two assessments and one unified assessment per semester, except the second semester of exam years — §2.5; national-framework compliance detailed in `prd/research/04-pedagogy-massar-calendar.md` §1).
6. Final validation moves the assessment from "draft" to "submitted"; every entry carries the author, course, period, and timestamp in the `Africa/Casablanca` time zone, permanent UTC+0 from 20/09/2026 (`prd/research/00-baseline-corrections.md` No. 1). Entries are logged (RG-38; an immutable, exportable log in V1, INV-33).
7. Before the period closes, Khadija freely edits her grades; every change is tracked.
8. When leadership closes the period (event `PeriodClosed`), every assessment for the period moves to read-only for the teacher (a leadership lock, §7.5). Any correction goes through a request to leadership, which applies or refuses the correction in a tracked procedure.
9. Entered grades stay invisible to families and students until published: by default at report-card publication, or progressively if the school enables progressive publication (a "draft/published" mark status, FR-EVA-19, MVP, ARB-17f); they are never visible from another school (RG-29, INV-21). On a grade contested by a parent or student in a moderated thread (PJ-PAR-12), Khadija corrects before closing with a trace, or asks leadership for the correction after closing.
10. Khadija then reviews her subject averages (PJ-ENS-07); report-card publication and authenticity verification fall to leadership (PC-06, RG-33).

**Acceptance criteria (Gherkin).**

```gherkin
Feature: Evening grade entry on mobile
  Background: Khadija is a part-time math teacher at two Rabat schools
    And her affiliation to School A is active with an assignment on "Math — 2AC-3"
    And the period "First semester" is open for entry

  Scenario: Complete entry and validation of an assessment (MVP)
    Given Khadija signed in in the "School A — teacher" context
    And an assessment "Test 1" on a scale of 20 linked to her course
    When she enters grades for her 31 students, including "12.5" entered with a comma
    And she validates the entry
    Then every grade is recorded with author, course, period, and a UTC+0 timestamp
    And the assessment moves to "submitted" status and feeds the subject average
    And no grade is visible to families until published (a report card, or progressive publication if the school enables it)

  Scenario: A network outage during entry then resumption with no loss (MVP)
    Given 18 grades already entered in the evening's grid
    When the mobile connection is interrupted
    Then the 18 grades are kept in a local draft on the device
    And the screen shows "local save awaiting sync"
    When the connection returns and Khadija finishes and validates the entry
    Then all 31 grades sync with no re-entry and no loss
    And no duplicate assessment is created by the resync

  Scenario: Leadership lock at period closing (MVP)
    Given Khadija's entry validated for the "First semester" period
    When leadership closes the period
    Then every assessment for the period moves to read-only for the teacher
    And any edit attempt is refused with a correction-request option offered
    And the correction request is logged with author, context, and timestamp

  Scenario: An out-of-scale grade refused on entry (MVP)
    When Khadija enters "21" for an assessment on a scale of 20
    Then the value is refused with the message "grade above the scale"
    And the cell stays in edit mode until corrected
```

### PJ-ENS-05 — Lesson log and homework

| Attribute | Value |
|---|---|
| Objective | Replace the paper lesson log with a digital log per course: session content, homework assigned and its due date, resources, visible to students and parents per the school's configuration. |
| Trigger | After each session; assigning homework with a due date. |
| Frequency | Weekly. |
| Actors | Khadija (keeping the log for her courses); the class's students and parents (viewing); leadership (configuring visibility). |
| Preconditions | An active course assignment. |
| Version | V1 (BES-ENS-04; basic pedagogical entry is MVP but keeping the lesson log and publishing homework ship in V1). Online homework submission (light e-learning) stays V2+ (`PROJECT.md` §12). |
| Needs covered | BES-ENS-04. |
| Baseline | (→ §7.3, §7.5, RG-39, DEC-10, DEC-12, DEC-36) |

**Steps.**

1. From "My courses," Khadija opens the course's lesson log (`prd/modules/12-academic-structure-timetables.md`): it is pre-structured by timetable session.
2. She logs the session's content (topics covered, in-class exercises) and the homework assigned, with a due date; she may attach lightweight resources (a document, a link) within the school's configured limits.
3. She publishes the session: the class's students and their guardians see the content per the school's configuration (parent and student portals, `PROJECT.md` §7.8 and §8.3); a notification is issued per the channel hierarchy (a notification, WhatsApp utility opt-in, SMS as a fallback — DEC-12, DEC-36; `prd/modules/17-communication-notifications.md`).
4. Upcoming homework due dates are aggregated in the class's weekly view; Khadija sees only her own courses' logs (RG-39).
5. Entry works with the same offline tolerances as grade entry (§10, NFR-OFF domain).
6. Out of scope at every version covered here: online homework submission, automated digital grading, resource rating (light e-learning V2+, `PROJECT.md` §12).

**Rules.** Lesson-log content is school data (author: the school in its context, RG-27); it stays visible after an affiliation closes, within the school, attributed to its author (RG-19).

### PJ-ENS-06 — Messages to her students' parents (moderated mode, DEC-34)

| Attribute | Value |
|---|---|
| Objective | Give Khadija a traceable, bilingual channel to her students' parents only, framed by the school's moderation, replacing informal messaging groups. |
| Trigger | Information to give a class (an announcement) or a parent (a message, a discussion thread). |
| Frequency | One-off to weekly. |
| Actors | Khadija; her students' parents (receiving, replying); leadership (moderation settings, viewing threads); secretariat (no role on pedagogical threads). |
| Preconditions | Active assignments; parents' WhatsApp opt-in for this channel (where applicable). |
| Version | MVP for announcing to her classes, individual messages, and **moderated in-app parent–teacher discussion threads** (DEC-34 "enabled by default," BES-ENS-05, ARB-21a) with in-app and SMS notifications in the recipient's language (`PROJECT.md` §12); V1 for the general WhatsApp Business API and push notifications (`PROJECT.md` §12 V1, ARB-21b). |
| Needs covered | BES-ENS-05. |
| Critical journeys | PC-11 (`prd/journeys/00-journey-map.md`). |
| Baseline | (→ §7.8, §8.1, §8.3; RG-38, RG-39, DEC-12, DEC-22, DEC-34, DEC-36, INV-34) |

**Steps.**

1. From her context, Khadija has two communication actions limited to her courses: "Announce to my classes" and "Write to a student's parents" (`prd/modules/17-communication-notifications.md`). The list of possible recipients derives from her active assignments: she can neither search for nor write to the parents of students she does not teach (RG-39, INV-34; §8.3 matrix).
2. **Announcement**: selecting one or more of her courses, bilingual drafting (FR/AR, DEC-10), sending within allowed sending windows; in MVP, in-app and SMS routing only in the recipient's language; in V1, a push, WhatsApp utility, SMS hierarchy (DEC-12, DEC-36, ARB-21). Delivery tracking (sent, delivered; read for in-app) is visible to Khadija for her sends.
3. **Discussion thread** (MVP, in-app): moderated mode by default (DEC-34) — Khadija opens the thread with one of her students' parents; the parent replies in the thread; they cannot start a thread unless the school enables that option for its scope. Leadership may view threads; this is disclosed to users in the interface.
4. Every message carries its author, school context, and timestamp; leadership viewing a thread is logged (RG-38, INV-33 in V1).
5. Leadership moderation may hide a non-compliant message and close a thread; Khadija and the parent involved are informed.
6. Messages and notifications are kept per the retention period applicable to messages (two years by default, adjustable, DEC-22).
7. The case of a parent restricted by a court ruling or with no opt-in: notification automatically switches to authorized channels with no exposure of Khadija's number (RG-14 for the restriction; DEC-36 for channels).

**Acceptance criteria (Gherkin).**

```gherkin
Feature: Messages to her students' parents in moderated mode
  Scenario: Opening a thread with a student's parent (MVP)
    Given Khadija teaches a student, Youssef, at School A
    When Khadija opens a thread with Youssef's guardian
    Then the thread is created in School A's context and the parent is notified
    And the parent can reply in the thread with no ability to start another thread
    And the interface shows that leadership can view threads (DEC-34)

  Scenario: Unable to write to parents outside her courses (MVP)
    Given a student in a School A class where Khadija does not teach
    When Khadija searches for this student's parents from messaging
    Then no result is returned
    And no path to message these parents is offered (RG-39)

  Scenario: Leadership viewing a thread (MVP)
    Given a thread open between Khadija and one of her students' guardians
    When leadership views the thread
    Then the viewing is logged with author, context, and timestamp
    And the notice of this capability stays shown in the thread
```

### PJ-ENS-07 — Preparing her averages before the class council

| Attribute | Value |
|---|---|
| Objective | Let Khadija check the completeness and compliance of her entries, track her subjects' averages, and prepare remarks before closing and the class council. |
| Trigger | Approaching period close; a summons to the class council. |
| Frequency | Twice a month in steady state; a peak before the two semester closings (three for trimesters, DEC-35). |
| Actors | Khadija; leadership (closing, chairing the council, publication); class council (V1). |
| Preconditions | Assessments entered (PJ-ENS-04); the period open. |
| Version | MVP for viewing her classes' averages (a teacher dashboard, §7.11) and the compliance warning (D3); MVP wave 2 for entering council remarks and decisions (FR-EVA-13, ARB-01); V1 for tooled council preparation (FR-EVA-12) and the blocking check (`PROJECT.md` §12). |
| Needs covered | BES-ENS-08. |
| Critical journeys | PC-06 (`prd/journeys/00-journey-map.md`). |
| Baseline | (→ §2.5, §7.5, §7.11, §10; RG-29, RG-39, INV-41; `prd/research/04-pedagogy-massar-calendar.md` §1) |

**Steps.**

1. The teacher dashboard (`prd/modules/20-dashboards-reporting.md`) shows, for each of her classes: today's classes, pending entries, and her subjects' averages (§7.11). Averages are computed per the school's configured rules (coefficients by level and track, INV-41; rounding, honors per the school's scale).
2. Before closing, a compliance check is offered by subject and period: the minimum number of assessments reached (at least two assessments and one unified assessment per semester, except the second semester of exam years — §2.5), no unjustified "not graded" cell. National weighting references (baccalaureate 25/25/50, 3AC 30/30/40, 6AP 50/25/25) serve as school-configurable defaults, versioned per school year (`prd/research/04-pedagogy-massar-calendar.md` §1); Khadija views them, leadership configures them.
3. Khadija drafts or revises the per-subject remarks required by the school; they stay internal data until published (RG-29, INV-21).
4. She closes her portion: any unsubmitted assessment is flagged to leadership in the entry-tracking table (PC-06).
5. After closing (the lock, PJ-ENS-04), preparing and holding the class council, general remarks, decisions, and report-card publication fall to leadership (PC-06); Khadija then views the report cards for her subjects (§8.3: reading published report cards for her subjects).
6. For her own archiving or offline-preparation needs, Khadija can export her grade summaries per subject and period in Excel/CSV format (`PROJECT.md` §10, interoperability; regulatory Massar exports stay the school's responsibility, `prd/modules/21-massar-regulatory-exports.md`).

**Acceptance criteria (Gherkin).**

```gherkin
Feature: Preparing averages before the council
  Scenario: Non-compliance warning before closing (MVP)
    Given the subject "Math — 2AC-3" with two assessments entered
    And the school rule requiring at least one unified assessment per semester
    When Khadija opens the period's compliance check
    Then the subject is flagged "non-compliant: unified assessment missing"
    When Khadija enters and submits the unified assessment
    Then the subject moves to "compliant" status for the period

  Scenario: Visibility limited to her subjects' averages (MVP)
    Given the period closed by leadership
    When Khadija views her class's results
    Then she sees the averages and report cards for her subjects only
    And other subjects' remarks and the general remark are not visible
```

### PJ-ENS-08 — Professional profile and verified experience

| Attribute | Value |
|---|---|
| Objective | Give Khadija ownership of a portable professional profile: degrees, subjects, levels, languages, teaching authorization, experience, distinguishing confirmed affiliation periods ("verified") from declared experience ("unverified"), with no cross-rating. |
| Trigger | A profile update; a newly confirmed affiliation period; preparing an application (PJ-ENS-09). |
| Frequency | One-off, recurring at each affiliation. |
| Actors | Khadija (owner of the profile); affiliated schools (confirming affiliation periods); a viewing school (a view limited to shared and verified periods). |
| Preconditions | An active account; at least an "invited" affiliation for history. |
| Version | MVP for teacher identity and the profile's core (`PROJECT.md` §12: global teacher identities); V1 for the full profile editor, the "verified"/"unverified" marking, and its associated confidentiality (BES-ENS-06; INV-29 in V1). |
| Needs covered | BES-ENS-06. |
| Baseline | (→ §7.10; RG-19, RG-20, RG-35, DEC-25, DEC-33, INV-16, INV-29, INV-30) |

**Steps.**

1. Khadija views and edits her professional profile from her account, independent of any school context: degrees, subjects taught, levels, languages, teaching authorization, experience (`prd/modules/19-teacher-career-network.md`). This profile is hers (RG-20).
2. Affiliation periods created by schools and accepted by her (PJ-ENS-01) appear with dates, role, and contract type; they are marked "verified" since confirmed by the schools (RG-20).
3. She may declare experience at schools not on ZSchool; it is shown "unverified" (DEC-33, INV-29).
4. A school only sees what Khadija shares of her career and her verified affiliation periods (RG-35, INV-29); no school's rating of a teacher is visible from another school, and the model contains no cross-rating or recommendation (DEC-25, INV-30).
5. When an affiliation closes, the period stays in the profile's history with its "verified" status; access to the school's operational data is removed (RG-19, INV-16).
6. Tracking the AREF authorization tied to the "public-sector outside teacher" status (Hassan's case, not Khadija's) is described in PJ-ENS-10; the related documents are linked to the affiliation involved, not the global profile. Degrees exported to ESISE by a school are those declared to that employer on the affiliation (a declared qualification), never the global profile (ARB-23b).

**Acceptance criteria (Gherkin).**

```gherkin
Feature: The teacher's professional profile
  Scenario: A verified period and declared experience (V1)
    Given an active affiliation of Khadija to School A since September 2026
    And declared experience at a school not on ZSchool
    When School A's leadership views Khadija's shared profile
    Then the 2026 affiliation period appears "verified"
    And the declared experience appears "unverified" (DEC-33)
    And no rating of Khadija from School A is visible from another school

  Scenario: History kept after closing (V1)
    Given Khadija's affiliation to School A closed in June 2027
    When Khadija views her profile
    Then the 2026-2027 period stays shown "verified"
    And Khadija's access to School A's operational data is removed (RG-19)
```

### PJ-ENS-09 — Availability and discreet applications on the teacher network

| Attribute | Value |
|---|---|
| Objective | Let Khadija, looking for a full-time position, signal her availability and apply to other schools with no notification to her current employers. |
| Trigger | Looking for a position for the following year. |
| Frequency | One-off, concentrated in spring (schools' re-enrollment campaign, PC-02). |
| Actors | Khadija; recruiting schools (searching the directory, receiving applications); current affiliated schools (no notification). |
| Preconditions | An active account; a filled-in professional profile (PJ-ENS-08). |
| Version | V2 (`PROJECT.md` §12: the teacher professional network — search, applications, availability; out of MVP, §5 of `prd/journeys/00-journey-map.md`). |
| Needs covered | BES-ENS-07. |
| Baseline | (→ §7.10, RG-23, RG-35, DEC-25, INV-19, INV-29, INV-30) |

**Steps.**

1. Khadija activates "open to opportunities" and fills in her availability: weekly slots, geographic areas (Rabat and surroundings), target levels and subjects (`prd/modules/19-teacher-career-network.md`).
2. The status and availability are invisible to schools where she is affiliated; searches by schools are never notified to her current employer (`PROJECT.md` §7.10).
3. She browses the minimal public school directory (name, city, cycles, education systems, website — RG-23, INV-19) and applies for a position: the file sent includes her profile (PJ-ENS-08) with verified periods and "unverified" declared experience.
4. The recruiting school accepts the application and creates the affiliation; it becomes active once both parties accept (RG-18, INV-15) — returning to PJ-ENS-01, step 4.
5. On leaving, closing the former affiliation applies RG-19 (immediate access removal, author traces kept) and PJ-ENS-08, step 6.

**Acceptance criteria (Gherkin).**

```gherkin
Feature: Discreet applications on the teacher network
  Scenario: Searching for a recruiting school with no notification to the employer (V2)
    Given Khadija "open to opportunities" with active affiliations at Schools A and B
    When a recruiting school views her shared profile
    Then the "open to opportunities" status is not visible to Schools A and B
    And no notification of the views is sent to Schools A and B
    When Khadija applies to the recruiting school
    Then only the application is transmitted to the recruiter
    And Schools A and B are not informed of it
```

### PJ-ENS-10 — AREF authorization for a "public-sector outside teacher": tracking the 8-hour cap and documents (secondary character: Hassan)

**Secondary character.** This journey does not concern Khadija, a private-sector part-timer: it is carried by **Hassan, a physics teacher at a public high school in Rabat, authorized by AREF to teach 6 hours a week at School A** and 2 hours at School B (ARB-23d). Khadija does not appear in it.

| Attribute | Value |
|---|---|
| Objective | Tool compliance for public-sector teachers authorized to teach in the private sector: a dedicated status on the affiliation, a cross-school total of weekly hours visible only to the teacher with an alert at the 8-hour cap, AREF authorization tracking (preliminary then final), and preparing the monthly list to submit to AREF, without revealing a teacher's affiliations elsewhere to any one school (RG-35, ARB-23a). |
| Trigger | Hiring a public-sector outside teacher; the annual request campaign; preparing the monthly list. |
| Frequency | Seasonal (the campaign) and monthly (the AREF list). |
| Actors | Hassan (declaring his hours, his authorizations, and consenting to sharing the total); each school's leadership (status, documents, its own school's monthly list); ZSchool support (configuring the cap). |
| Preconditions | The affiliation created; the school's timetable configured for hour calculation. |
| Version | V1 (FR-CAR-11, FR-CAR-12; administrative compliance grounded in the ministerial circular of 11/11/2024; the rule stays configurable, see OQ-01). The status does not ship in MVP (consistent with `prd/journeys/01` PJ-DIR-07.1). |
| Needs covered | BES-ENS-01, BES-ENS-06. |
| Baseline | (→ §2.11, §7.10, RG-17, RG-22, RG-35, DEC-05, DEC-33, H-13; ARB-23; `prd/research/02-regulatory-data.md` §8; `prd/research/00-baseline-corrections.md` No. 18) |

**Regulatory framework adopted** (`prd/research/02-regulatory-data.md` §8). Ministerial circular of 11/11/2024: public-sector teachers may be authorized to teach in the private sector; the application is filed from 01/04 to 15/05, with the public school's director's opinion, transmitted to the provincial office before 20/05, a preliminary AREF authorization then a final authorization at the end of September; an **overall 8-hour-per-week cap**, across all schools combined; a **monthly list** submitted to AREF (timetables, hours worked). The "8 hours" and "80% permanent staff" rules come from Law 06.00, repealed by Law 59.21; whether they carry over is unconfirmed (35 implementing decrees expected) — see OQ-01.

**Steps.**

1. School A's leadership sets Hassan's affiliation status to "public-sector outside teacher," alongside "permanent," "part-time," and "trainee" (`prd/modules/19-teacher-career-network.md`; entity `SchoolMembership`, `prd/03-domain-data-model.md` §2.2).
2. Hassan declares, for each school where he is affiliated, his weekly hours; hours derived from ZSchool timetables are offered by default and adjustable; hours at a school outside ZSchool and at his public-sector position are declared manually (consolidating the "overall cap" basis, ARB-23a).
3. The platform computes the cross-school total and shows it **to Hassan alone** as an "X hours out of 8" indicator; each school only sees its own hours; if Hassan consents to sharing his total, the school receives a **binary alert** "cap exceeded across all affiliations," with no detail or volume of other affiliations (RG-35, INV-29, ARB-23a; OQ-02 resolved).
4. When adding an assignment that would push the total past the configured cap (default: 8 hours/week), an alert is issued to Hassan before saving and, if he has consented to sharing, to the school involved in binary form; saving stays possible with a justification — compliance arbitration belongs to the school, ZSchool neither blocks nor decides (D8; → FR-CAR-12, `prd/modules/19-teacher-career-network.md`).
5. The affiliation file carries the authorization documents: the AREF preliminary authorization, the final authorization, with due dates and expiry reminders; documents are visible only to the school involved (RG-35).
6. Every month, the platform prepares, for each school, the list of its public-sector outside teachers: identity, timetables, hours worked — exportable in spreadsheet format for submission to AREF (`PROJECT.md` §10; the submission channel stays outside ZSchool).
7. The circular's annual calendar (application 01/04–15/05, provincial before 20/05, final authorization end of September) is recalled in the module's contextual help; ZSchool does not impose a regulatory workflow outside its scope.
8. Displayed hours and timestamps are expressed in `Africa/Casablanca`, permanent UTC+0 (`prd/research/00-baseline-corrections.md` No. 1).

**Acceptance criteria (Gherkin).**

```gherkin
Feature: Tracking the AREF 8-hour weekly cap
  Scenario: Cross-school total and a cap alert (V1)
    Given Hassan, "public-sector outside teacher," with 6 weekly hours at School A
    And 2 weekly hours declared at School B
    And Hassan having consented to sharing his total with his schools
    When School B adds a one-hour assignment to its timetable
    Then the total shown to Hassan moves to "9 hours out of 8"
    And School B's leadership receives a binary alert "cap exceeded across all affiliations" with no detail of hours at School A
    And saving stays possible with a justification entered by the school

  Scenario: Confidentiality with no sharing consent (V1)
    Given Hassan has not consented to sharing his total
    When School B views Hassan's affiliation
    Then it sees only its own hours and the status of his AREF authorization
    And no information on the existence or volume of other affiliations is shown

  Scenario: The monthly list for AREF (V1)
    Given the past month's timetables and hours worked at School A
    When leadership generates the monthly list of public-sector outside teachers
    Then the export contains, for each: identity, timetables, and hours worked
    And the export is timestamped in UTC+0 and kept in the school's file
```

## 5. Rules cutting across the persona

1. **One account, several contexts**: Khadija's account is unique and global; profiles and affiliations combine with no data merging (RG-03, RG-17, RG-36, DEC-03, INV-13, INV-14, INV-31; `prd/cross-cutting/30-roles-permissions-matrix.md`).
2. **Systematic least privilege**: in every context, visibility derives from active assignments; every write is logged with author, context, and timestamp (RG-38, RG-39, INV-33, INV-34).
3. **Mobile and offline first**: roll call, grade entry, and the lesson log run as a PWA with outage tolerance and sync; typical pages under 2 seconds on 4G (`PROJECT.md` §10; `prd/cross-cutting/32-non-functional-requirements.md`; `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`). Native apps in V2.
4. **Bilingualism**: interface and content in French and Arabic with full RTL, names in both scripts (DEC-10).
5. **Mobile contact**: the phone number is the contact identifier; e-mail is optional and never required (DEC-11, INV-37).
6. **Notification channel**: in MVP, in-app, WhatsApp utility limited to attendance notifications for opted-in parents, an SMS aggregator as a fallback, with no push; in V1, push first, then general WhatsApp utility, then SMS (DEC-12, DEC-36, ARB-21; `prd/modules/17-communication-notifications.md`).
7. **The teacher pays nothing**: no feature described here is billed to Khadija (DEC-13).
8. **What history means**: when an affiliation closes, access disappears, author traces stay (RG-19, INV-16); the professional profile follows Khadija (RG-20, RG-35).

## 6. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | **Open (regulatory watch, V1)**. The fate of the "8 hours/week" rule after Law 06.00's repeal by Law 59.21 (Official Gazette No. 7485 of 23/02/2026): whether the cap and the 80%-permanent-staff quota carry over is unconfirmed, with 35 implementing decrees expected (`prd/research/02-regulatory-data.md` §1 and §8). | Treatment adopted: the cap modeled as a configurable global parameter (default: 8 hours/week) and the "public-sector outside teacher" affiliation status kept; a discrepancy with baseline §2.11 ("over 50% part-timers" vs. about 50% per an industry source, Médias24 11/01/2023) also logged. Baseline update to be requested in review. |
| OQ-02 | **Resolved — ARB-23a** (a total visible only to the teacher; a binary alert to the school on consent; off-platform hours declared). The level of cross-school hour detail beyond the overall cap indicator. | Tension between the overall-cap requirement (the 11/11/2024 circular) and career-path confidentiality between schools (RG-35). This file's working assumption: an "X out of 8" indicator visible to schools involved, hour detail at other employers masked without Khadija's explicit sharing. To be settled in review with legal counsel. |
| OQ-03 | **Resolved — ARB-21a** (moderated in-app threads from MVP). Activation version for moderated parent–teacher discussion threads (DEC-34). | Baseline §12 MVP lists "announcements, messages, in-app and SMS notifications" without §7.8's moderated threads. Consistent with OQ-01 of `prd/journeys/00-journey-map.md`: a messaging core in MVP, full moderated threads in V1 with WhatsApp and push; to be settled in review. |
| OQ-04 | **Escalated — ESC-03.** Time zone: baseline §2.4/§10 describes "UTC+1 with a return to UTC+0 during Ramadan"; Decree No. 2.26.530 sets a permanent return to UTC+0 on 20/09/2026, with no Ramadan exception (`prd/research/00-baseline-corrections.md` No. 1). | Treatment adopted: ZSchool models `Africa/Casablanca` as permanent UTC+0, UTC storage; shortened Ramadan hours remain a pedagogical need (timetable variants) but are no longer a time-zone issue. Baseline update to be requested in review. |
| OQ-05 | **Escalated — ESC-03.** Baseline §2.10 usage indicators: ANRT 2024-2025 shows 91.2% of individuals aged 5+ using the internet, 89.2% of connected households (93.6% urban, 78.4% rural), and 91.7% of mobile-equipped individuals owning a smartphone; the cited Android/iOS shares are web-traffic shares (`prd/research/05-infrastructure-usage.md` §2). | Treatment adopted: cite ANRT 2024-2025 with these labels; do not present 68/32 as a device-fleet share; keep Android-first mobile-first and the SMS fallback for the rural digital divide. Baseline update to be requested in review. |

---

## Traceability

A table of baseline ID → the journeys and sections of this file that cover them.

| Baseline ID | Covered in this file |
|---|---|
| RG-03 | PJ-ENS-02, §5 (rule 1) |
| RG-05, RG-06 | PJ-ENS-01 (step 6: duplicates and audited merge) |
| RG-14 | PJ-ENS-06 (step 7: a restricted parent) |
| RG-17 | PJ-ENS-01, PJ-ENS-02, PJ-ENS-10, §5 (rule 1) |
| RG-18 | PJ-ENS-01, PJ-ENS-09 (step 4) |
| RG-19 | PJ-ENS-01, PJ-ENS-02, PJ-ENS-05, PJ-ENS-08, PJ-ENS-09, §5 (rule 8) |
| RG-20 | PJ-ENS-08, §5 (rule 8) |
| RG-21 | PJ-ENS-02 |
| RG-22 | PJ-ENS-10 (school configuration) |
| RG-23 | PJ-ENS-09 (step 3) |
| RG-27 | PJ-ENS-05 (rules) |
| RG-29 | PJ-ENS-04, PJ-ENS-07 |
| RG-33 | PJ-ENS-04 (step 10, referring to PC-06) |
| RG-35 | PJ-ENS-08, PJ-ENS-09, PJ-ENS-10, OQ-02 |
| RG-36 | PJ-ENS-01, PJ-ENS-02, §5 (rule 1) |
| RG-37 | PJ-ENS-02 |
| RG-38 | PJ-ENS-03, PJ-ENS-04, PJ-ENS-06, §5 (rule 2) |
| RG-39 | PJ-ENS-02, PJ-ENS-03, PJ-ENS-04, PJ-ENS-05, PJ-ENS-06, PJ-ENS-07, §5 (rule 2) |
| DEC-03 | PJ-ENS-01, PJ-ENS-02, §5 (rule 1) |
| DEC-05 | PJ-ENS-01, PJ-ENS-10 |
| DEC-10 | PJ-ENS-01, PJ-ENS-05, PJ-ENS-06, §5 (rule 4) |
| DEC-11 | PJ-ENS-01, §5 (rule 5) |
| DEC-12 | PJ-ENS-03, PJ-ENS-05, PJ-ENS-06, §5 (rule 6) |
| DEC-13 | §2 (point 5), §5 (rule 7) |
| DEC-22 | PJ-ENS-06 (step 6) |
| DEC-25 | PJ-ENS-08, PJ-ENS-09 |
| DEC-33 | PJ-ENS-08, PJ-ENS-10 |
| DEC-34 | PJ-ENS-06, OQ-03 |
| DEC-35 | PJ-ENS-04, PJ-ENS-07 (closing peaks) |
| DEC-36 | PJ-ENS-03, PJ-ENS-05, PJ-ENS-06, §5 (rule 6) |
| G-12 | PJ-ENS-04, PJ-ENS-07 (assessments resolved, baseline §7.5) |
| G-17 | PJ-ENS-06 (communication resolved, baseline §7.8) |
| G-23 | PJ-ENS-08, PJ-ENS-09 (career and network, baseline §7.10) |
| H-11 | §2 (point 2), PJ-ENS-06 (the WhatsApp channel) |
| H-13 | §2 (point 1), PJ-ENS-10, OQ-01 |
| INV-13, INV-14 | PJ-ENS-01, PJ-ENS-02, §5 (rule 1) |
| INV-15, INV-16 | PJ-ENS-01, PJ-ENS-09 |
| INV-17, INV-31, INV-32 | PJ-ENS-02, §5 (rule 1) |
| INV-19 | PJ-ENS-09 |
| INV-21 | PJ-ENS-04, PJ-ENS-07 |
| INV-27 | PJ-ENS-04 (mandatory context) |
| INV-29, INV-30 | PJ-ENS-08, PJ-ENS-09 |
| INV-33 | PJ-ENS-04, PJ-ENS-06, §5 (rule 2) |
| INV-34 | PJ-ENS-03, PJ-ENS-04, PJ-ENS-06, §5 (rule 2) |
| INV-37 | PJ-ENS-01, §5 (rule 5) |
| INV-41 | PJ-ENS-04, PJ-ENS-07 |
| `PROJECT.md` §2.5 | PJ-ENS-04, PJ-ENS-07 (grading and continuous assessment) |
| `PROJECT.md` §2.10, §10 | §2, §5 (rule 3), PJ-ENS-03, PJ-ENS-04, PJ-ENS-05, PJ-ENS-07, PJ-ENS-10 |
| `PROJECT.md` §2.11 | §2 (point 1), PJ-ENS-10 |
| `PROJECT.md` §5.2 | §1, §2 |
| `PROJECT.md` §6.5 | PJ-ENS-01, PJ-ENS-02, PJ-ENS-08, PJ-ENS-10 |
| `PROJECT.md` §7.3 | PJ-ENS-03, PJ-ENS-05 |
| `PROJECT.md` §7.4 | PJ-ENS-03 |
| `PROJECT.md` §7.5 | PJ-ENS-04, PJ-ENS-07 |
| `PROJECT.md` §7.8 | PJ-ENS-05, PJ-ENS-06 |
| `PROJECT.md` §7.10 | PJ-ENS-08, PJ-ENS-09, PJ-ENS-10 |
| `PROJECT.md` §7.11 | PJ-ENS-04, PJ-ENS-07 |
| `PROJECT.md` §12 | "Version" column of every journey (§3) |
| `prd/research/02-regulatory-data.md` §8 | PJ-ENS-10, OQ-01 |
| `prd/research/00-baseline-corrections.md` No. 1, 10, 18 | §2 (points 1 to 3), PJ-ENS-04, PJ-ENS-10, OQ-01, OQ-04, OQ-05 |
| BES-ENS-01 to BES-ENS-08 | "Needs" column of the §3 table; sections PJ-ENS-01 to PJ-ENS-10 |
| PC-04, PC-05, PC-06, PC-11 | "Critical journeys" column of the §3 table; PJ-ENS-01, PJ-ENS-03, PJ-ENS-04, PJ-ENS-06, PJ-ENS-07 |
| ARB-01, ARB-04, ARB-15, ARB-17 (`prd/cross-cutting/42-review-arbitrations.md`) | PJ-ENS-01 (step 6), PJ-ENS-03, PJ-ENS-04, PJ-ENS-07 |
| ARB-08, ARB-21, ARB-23, ARB-25 | PJ-ENS-01 (steps 3 and 6), PJ-ENS-06, PJ-ENS-08, PJ-ENS-10, §5 (rule 6), OQ-02, OQ-03 |
| ARB-26 (a single scenario set) | §1, PJ-ENS-10 (Hassan) |
