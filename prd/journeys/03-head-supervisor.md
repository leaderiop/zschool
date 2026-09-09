# PRD ZSchool — Detailed Journeys 03: Rachid, Head Supervisor (Middle/High School)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09; supersedes 0.2 — revised 09/09/2026) |
| Date | 2026-09-09 |
| Status | PRD draft — under review; arbitrations ARB-01 to ARB-26 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §5.2 (persona Rachid), §7.4 (attendance and student life), §7.11 (student-life dashboard), §8.1 and §8.3 (student-life role, access matrix), §10 (offline, notification delay), §12 (scope by version); decisions DEC-08, DEC-10, DEC-11, DEC-12, DEC-15, DEC-18, DEC-20, DEC-22, DEC-24, DEC-28, DEC-34, DEC-35, DEC-36 cited in support |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md` (BES-SUR-01 to BES-SUR-08), `prd/03-domain-data-model.md` (entities, INV-…, events), `prd/journeys/00-journey-map.md` (PC-05, PC-06, PC-11), `prd/journeys/04-part-time-teacher.md` (the teacher's per-course roll calls), `prd/journeys/05-multi-school-parent.md` and `prd/journeys/06-custodial-mother-and-guardian.md` (notification and excuse, parent side), `prd/modules/13-attendance-student-life-discipline.md` (VSC), `prd/modules/17-communication-notifications.md` (COM), `prd/modules/20-dashboards-reporting.md` (RAP), `prd/cross-cutting/30-roles-permissions-matrix.md` (permissions), `prd/cross-cutting/32-non-functional-requirements.md` (NFR, domains NFR-OFF and NFR-MOB), `prd/cross-cutting/35-external-integrations.md` (SMS, WhatsApp), `prd/research/00-baseline-corrections.md`, `prd/research/03-payments-communications.md`, `prd/research/04-pedagogy-massar-calendar.md`, `prd/research/05-infrastructure-usage.md` |

---

## 1. Purpose and scope

This file describes the daily journeys of **Rachid, head supervisor (*الحارس العام*) of a middle/high school in Marrakech** (§5.2): taking roll call by class, working the absentee list to confirm each case before 10 a.m., tardiness, early departures and exemptions, graduated discipline, preparing the student-life portion of class councils, targeted communication to a class's parents, the day's summary, and handling sessions not held. The students named here (e.g. Omar, Grade 8) belong to the middle/high school in Marrakech; Youssef, a student at School A in Rabat, appears only in journeys 04, 05, and 07 (a single scenario set, ARB-26f). It breaks down, for this persona, the cross-cutting journeys PC-05 (morning roll call and absence notification), PC-06 (class council, student-life portion), and PC-11 (summons) of `prd/journeys/00-journey-map.md`.

**In scope**: attendance (roll call, absences, tardiness, early departures, exemptions, passes), excuse submission and validation, discipline (incidents, graduated sanctions, summons, the disciplinary council, conduct grade), student-life opinions and alerts for class councils, targeted communication to guardians, the daily summary.

**Out of scope**: grade and report card entry (files `prd/journeys/04-part-time-teacher.md` and `prd/journeys/01-school-group-director.md`, module EVA `prd/modules/14-assessments-grades-report-cards.md`), finance and collections (PC-07, `prd/modules/16-finance-billing-collections.md`), admissions and transfers (PC-01, PC-09), health (module HEA, V2+, `prd/modules/23-health-sensitive-data.md` — student life only gets alerts from it, and only once the module ships), transport, canteen, and activities (module SAN, V2+, `prd/modules/22-ancillary-services-transport-canteen-activities.md`; `prd/journeys/00-journey-map.md` §5).

No `FR-VSC-…` requirement is numbered here: functional requirements are carried by `prd/modules/13-attendance-student-life-discipline.md`; this file provides the end-to-end journeys and acceptance criteria that motivate them.

---

## 2. Usage context and working assumptions

- **Reference school**: a middle/high school of about 800 students (the DEC-35 pilot profile), middle-school and high-school cycles; Rachid is assigned to these two cycles and does not see other scopes (RG-39).
- **Devices and network**: mobile at all times, little computer use; sometimes unstable connections in class (§2.10). Every critical journey is therefore usable on mobile, tolerant of outages, with sync and conflict resolution (§10).
- **School time**: Monday-to-Saturday week (Saturday morning available as a configuration option); in MVP, the sessions to call are **declared sessions** (course, date, chosen time slot) or expected sessions declared by student life in a simple weekly grid; in V1, the timetable (FR-PED-11) and its variants (normal, shortened during Ramadan, exams) automatically feed expected sessions (ARB-04). Reference local time: **Africa/Casablanca, permanent UTC+0** from 20/09/2026 (Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026) — a baseline discrepancy logged in OQ-01 (`prd/research/00-baseline-corrections.md` No. 1; `prd/research/04-pedagogy-massar-calendar.md` §3).
- **Role and authorization**: the "head supervisor/student life" role (§8.1): read and write on attendance and discipline, communication to parents; **no access to unpublished grades** and no access to finance (§8.3 matrix); every write and every sensitive view logged (RG-38).
- **Families**: every student has at least one active legal guardian and one financially responsible parent (RG-13); by default every legal guardian and the holder of custody (*hadana*) receive notifications, except for a restriction grounded in a court ruling (RG-14) or a restriction made by an adult student (RG-02).

---

## 3. Journey overview

| ID | Journey | Map | Needs | Version |
|---|---|---|---|---|
| PJ-SUR-01 | Morning roll call by class (mobile, offline, notification under 5 minutes) | PC-05 | BES-SUR-01, BES-SUR-02, BES-SUR-06 | MVP |
| PJ-SUR-02 | Handling absentees: follow-up before 10 a.m., excuses, validation | PC-05 | BES-SUR-02, BES-SUR-03, BES-SUR-08 | MVP (core); V1 (thresholds and statistics) |
| PJ-SUR-03 | Tardiness, early departure, exemption (passes) | PC-05 (extension) | BES-SUR-04 | V1 |
| PJ-SUR-04 | Incident and graduated sanction (summons, disciplinary council) | PC-05, PC-11 | BES-SUR-05 | V1 |
| PJ-SUR-05 | Preparing the class council: student-life portion (absence/conduct alerts) | PC-06 | BES-SUR-05, BES-SUR-07 | V1 |
| PJ-SUR-06 | Targeted communication to a class's parents | PC-11 | BES-SUR-08 | MVP (core, moderated in-app threads); V1 (general WhatsApp, push, summons) |
| PJ-SUR-07 | Daily summary (today's absentees, open incidents) | PC-05 | BES-SUR-07 | MVP (today's lists, attendance rate); V1 (enriched student-life dashboard, thresholds) |
| PJ-SUR-08 | The adult student's case in student life | PC-05, PC-06 | BES-SUR-05, BES-SUR-06 | MVP (RG-02 mechanism, ARB-10); V1 (full disciplinary effects) |
| PJ-SUR-09 | A session not held: teacher absence, cancellation, replacement | PC-05 | BES-SUR-01, BES-SUR-07 | MVP (ARB-05) |

The head supervisor's role differs from the teacher's (file `prd/journeys/04-part-time-teacher.md`): the teacher takes the roll call **for their own courses** (a scope derived from their assignments per RG-39), while Rachid takes the roll call **by class** for the classes in his cycles, follows up on missing roll calls, and handles everything after roll call. Priority rule (ARB-15e): for a given session, the **first synchronized validation is authoritative** for notification; a second one opens a gap that Rachid arbitrates, with no new notification while the gap stays open.

---

## 4. Cross-cutting points to emphasize

These three points apply to every journey below and are non-negotiable design constraints.

### 4.1 Disciplinary data never leaves the school

- Incidents, sanctions, ongoing disciplinary procedures, councils, and student-life observations are **non-portable and invisible outside the originating school** (RG-29, INV-21 of `prd/03-domain-data-model.md`; DEC-08).
- They are **never part of the default transfer profile** and require explicit sharing by the legal guardian or the adult student to be seen by another school (RG-31, INV-23); in practice, the disciplinary file stays internal and appears neither in the PDF exit dossier (DEC-32), nor in Massar exports, nor on any certificate, attestation, or report card.
- Retention: end of enrollment **plus 2 years, then anonymization** (DEC-22, INV-28); once an enrollment closes, disciplinary files move to read-only (RG-32).
- Consequence for the persona: the file presented to a council (PJ-SUR-04, PJ-SUR-05) is built **exclusively** from tenant data, and a student who changes schools leaves with a clean disciplinary record unless sharing was expressly consented to.

### 4.2 Least privilege and traceability

- The head supervisor **only sees the cycles assigned to him** (RG-39, INV-34): classes, roll-call lists, disciplinary files, and communications are filtered by this scope server-side (INV-17), never client-side.
- Permissions are contextual and made of fine-grained rights (RG-36, RG-37): the "student life" template role (§8.1) gives read/write on attendance and discipline, read access to the identity record, and **no** access to unpublished grades (§8.3 matrix) — Rachid prepares councils without seeing averages.
- Every write (roll call, a validated excuse, an incident, a sanction, a summons, a send) and every sensitive-data view (discipline, record) is logged with author, context, and timestamp (RG-38, INV-33); data produced stays attributed to its author even after their affiliation closes (RG-19, INV-16).

### 4.3 Notifying parents: mobile-first, WhatsApp and SMS

- The mobile phone number is the primary contact identifier (DEC-11); in MVP, routing is limited to in-app notifications, WhatsApp "utility" limited to attendance notifications (minimal templates, express opt-in serving as the transfer basis, ARB-25c), and **SMS via a Moroccan aggregator as the universal fallback**, with every message sent only in the recipient's language (ARB-21c); **no push notification in MVP**; in V1, the DEC-36 hierarchy applies: push first, general WhatsApp "utility," SMS as a fallback (DEC-12, DEC-36, arbitration D1, ARB-21b); e-mail stays secondary.
- WhatsApp is used by 98.6% of social-media users in Morocco (H-11; `prd/research/05-infrastructure-usage.md` §2), but rural household internet access drops to 78.4% (ANRT 2024-2025, `prd/research/05-infrastructure-usage.md` §2): the SMS fallback is not a residual option, it is the guarantee of reaching every family — including those without a smartphone.
- The notification delay for the **first absence of the day** (or of the half-day, configurable per cycle) is **under 5 minutes after roll-call validation**, including a 3-minute hold window during which a correction cancels the send; subsequent absences on the same day are grouped into an evening summary; after sending, any correction issues a correction notice on the same channel (§10, ARB-15a/b); the school's quiet-hours window never applies to attendance notifications (ARB-15c); a parent's "STOP" opt-out only covers reminders and announcements (ARB-21d). Every send produces a delivery trace (channel, status, cost) and is charged to the school's consumable bundles (DEC-28). The WhatsApp pricing switch of 01/10/2026 is a dated parameter (`prd/research/03-payments-communications.md` §4; `prd/research/00-baseline-corrections.md` No. 6).

---

## 5. Detailed journeys

### PJ-SUR-01 — Morning roll call by class (mobile, offline, notification under 5 minutes)

| Attribute | Value |
|---|---|
| Objective | Know each class's absentees from the first time slot and notify each family automatically, despite unstable connections; a notification delay for the day's first absence of under 5 minutes after roll-call validation (§10, ARB-15). |
| Trigger | The start of the half-day (a time set by the school; expected sessions declared by student life in MVP, drawn from the timetable and its variants in V1, ARB-04); every school day, including Saturday morning. |
| Actors | Head supervisor (owner), teachers (concurrent per-course roll calls), legal guardians and the holder of custody (recipients), leadership (viewing). |
| Preconditions | Rachid authenticated in the "head supervisor" context of his school (RG-03, RG-36); middle-school and high-school cycles assigned (RG-39); classes and headcounts up to date (ACTIVE enrollments, RG-08); at least one active legal guardian per student (RG-13). |
| Data and events | `AttendanceRecord`; event `AbsenceRecorded`; `Notification`, `DeliveryLog`; `AuditLog`. |
| Output | Roll calls validated and timestamped; today's absentees populated; families notified. |
| Version | MVP (§12: "attendance with SMS/WhatsApp notification, excuses"; declared sessions ARB-04; grouping, hold window, correction notice ARB-15). |
| Traceability | (→ §7.4, §10; RG-13, RG-38, RG-39; DEC-11, DEC-12, DEC-36; BES-SUR-01, BES-SUR-02, BES-SUR-06; PC-05; ARB-04, ARB-15, ARB-21) |

Steps:

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SUR-01.1 | Start of the half-day (a time set by the school) | Rachid (head supervisor) | Today's screen (mobile): a list of his cycles' classes with each half-day's roll-call status — not taken, in progress, validated; today's expected sessions (declared by student life in the simple weekly grid in MVP; drawn from the timetable in V1, ARB-04), sessions not held removed (PJ-SUR-09); for classes where a teacher has already validated a session's roll call, a "partial" status is visible; FR/AR labels, a battery-efficient one-handed display | Roll-call status visible in one view | MVP |
| PJ-SUR-01.2 | A class opened (e.g. 2AC-3) | Rachid | A list of students with ACTIVE enrollment, alphabetical order, photo, arrangement (day student, boarding lunch); search by name in Latin or Arabic script (both scripts, DEC-10) | Roll-call list ready | MVP |
| PJ-SUR-01.3 | Roll-call list shown | Rachid | Present by default; toggled to absent, late, or a known upcoming absence (an early departure) with a short reason; markings are immediate, with no page reload | Markings recorded in real time | MVP |
| PJ-SUR-01.4 | Unstable connection or an outage | Mobile app | A persistent network-status indicator; every entry is kept locally in a sync queue; neither an outage nor an accidental app closure loses an entry (§10: roll call tolerant of outages, with sync and conflict resolution) | No lost entries | MVP |
| PJ-SUR-01.5 | Markings finished | Rachid | A summary (present, absent, late) then confirmation; the roll call moves to "validated" with author, local entry time, and sync timestamp | Roll call validated and timestamped | MVP |
| PJ-SUR-01.6 | Roll call synced on the platform side | System (notification) | On receipt by the platform, an absence event is issued per student; only the **first absence of the day** (or of the half-day, per cycle) triggers immediate notification, after a **3-minute hold window** during which a correction cancels the send; subsequent absences on the same day are grouped into an evening summary (ARB-15a/b); notification to legal guardians and the holder of custody per their rights (RG-14), in each recipient's language (ARB-21c); MVP routing: in-app notification, WhatsApp "utility" (opt-in, scope limited to attendance notifications, arbitration D1), then SMS as a fallback; push arrives in V1; delivery tracked by channel, status, and cost | Families notified in under 5 minutes after sync, with no burst of messages | MVP (in-app, WhatsApp utility for attendance, SMS); V1 (push) |
| PJ-SUR-01.7 | A teacher's per-course roll call and the per-class roll call diverge | System (detection), Rachid (arbitration) | The **first synchronized validation is authoritative** for notification; a second one opens a gap flagged to Rachid, with no new notification while the gap stays open (ARB-15e); on arbitration, a correction issues a correction notice if a notification already went out; no roll call is silently overwritten | Discrepancies visible and arbitrated; no double or wrongful notification | MVP |
| PJ-SUR-01.8 | Roll-call window passed | Rachid | Classes still without a validated roll call after the window are highlighted; Rachid follows up with the teachers involved from today's screen, then takes the class's roll call himself if needed | No class left without a roll call; absences notified | MVP |

```gherkin
Feature: Morning roll call by class in offline mode
  Background:
    Given Rachid is authenticated on the mobile app in the "head supervisor" context of his school
    And the middle-school and high-school cycles are assigned to him
    And class 2AC-3 has 32 students with ACTIVE enrollment for the current year
    And the morning half-day roll call is not yet validated for 2AC-3

  Scenario: roll call validated with no network then automatic sync (MVP)
    When Rachid marks 29 students present, 2 absent, and 1 late, then validates the roll call
    And the phone is offline at the moment of validation
    Then the validation is confirmed locally with the status "awaiting sync"
    And the markings and the local entry time are kept on the device
    When the network connection is restored
    Then the roll call syncs automatically, with no re-entry and no duplicate
    And attendance records carry the author, the local entry time, and the sync timestamp
    And any discrepancy with an already-synced per-course roll call is flagged to Rachid for arbitration, with the first synchronized validation authoritative
    And the 5-minute notification delay runs from the roll call's platform-side sync, not from the local validation time

  Scenario: notification of the day's first absence delivered in under 5 minutes (MVP)
    Given a class roll call validated and synced at 8:12 a.m. with 2 unexcused absent students
    And each absent student has at least one reachable active legal guardian
    When the 3-minute hold window elapses with no correction
    Then each legal guardian and the holder of custody receive the notification in their language on their channel (in MVP: an in-app notification, then WhatsApp utility if express consent, then SMS; push arrives in V1, arbitration D1)
    And delivery happens in under 5 minutes after the roll call's actual platform-side validation
    And every send produces a delivery trace with channel, status, and cost charged to the school

  Scenario: subsequent absences grouped and a correction after sending (MVP)
    Given Omar, a Grade 8 student, absent at the 8 a.m. session, then at the 10 a.m. and 2 p.m. sessions
    When all three roll calls are validated
    Then a single immediate notification is sent for the 8 a.m. absence
    And the 10 a.m. and 2 p.m. absences appear in the evening summary with no new immediate send
    When the 8 a.m. teacher corrects Omar to "present" at 8:30 a.m.
    Then a correction notice is sent to the guardians on the same channel

  Scenario: correction within the hold window (MVP)
    Given a roll call validated at 8:12 a.m. with a student wrongly marked absent
    When the teacher corrects the roll call at 8:14 a.m.
    Then no notification is sent to that student's guardians
```

---

### PJ-SUR-02 — Handling absentees: follow-up before 10 a.m., excuses, validation

| Attribute | Value |
|---|---|
| Objective | Resolve every doubt about the day's absences: automatic notification, then a human follow-up before 10 a.m. (the persona's goal, §5.2), processing parental excuses with tracked validation; alert thresholds for repeated absences. |
| Trigger | Absence notifications issued (PJ-SUR-01); an excuse submitted by a parent; an absence threshold crossed. |
| Actors | Head supervisor (owner; can also record an excuse at the front desk on a parent's behalf, ARB-15d), parents (excuse, response), secretariat (correcting contact details), leadership (threshold alerts). |
| Preconditions | Today's absentees recorded; parent accounts active; channels and preferences configured. |
| Data and events | `AttendanceRecord`, `Justification`, `Dispensation`; `JustificationSubmitted`, `JustificationValidated`, `AbsenceThresholdReached`; `Notification`, `DeliveryLog`. |
| Output | Every absence of the day is excused, processed, or escalated (threshold, summons); wrong contact details flagged. |
| Version | MVP for notification, follow-up, and excuses (§12); V1 for statistics and alert thresholds (§12 V1: full student life). |
| Traceability | (→ §5.2, §7.4; RG-14, RG-28, RG-38; DEC-11, DEC-12, DEC-36; BES-SUR-02, BES-SUR-03, BES-SUR-08; BES-PAR-05; PC-05) |

Steps:

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SUR-02.1 | Automatic notifications issued (PJ-SUR-01) | Rachid | The day's processing queue: after automatic notifications, the absentee list reads across three status columns — notified and delivered; **unreached** (delivery failure, SMS only, no smartphone); excuses awaiting validation | An up-to-date processing queue | MVP |
| PJ-SUR-02.2 | Unreached absentees | Rachid | For each unreached case, opening the student record and calling the primary contact number (DEC-11) from his own phone; logging the outcome — reached (a verbal message, instructions given), still absent (a new attempt scheduled), **wrong number** (flagged to the secretariat for correction of the file and follow-up by another guardian on the relationship); the call attempt is tracked with author, timestamp, and outcome (RG-38; BES-SUR-08; a tracking entity: OQ-06) | Every unreached case followed up before 10 a.m. with a trace | MVP |
| PJ-SUR-02.3 | An excuse submitted by a parent from their account (files `prd/journeys/05-multi-school-parent.md` and `prd/journeys/06-custodial-mother-and-guardian.md`) | Parent/legal guardian | Submitting an excuse with an attachment (a medical certificate, a summons, an administrative document); the absence moves to "excuse pending validation" and its status is visible to the parent with permanent read access (RG-28) | Excuse in the validation queue, status visible to the parent | MVP |
| PJ-SUR-02.4 | An excuse awaiting validation | Rachid | Reviewing the attachment, accepting (absence excused) or refusing with a reason; the decision carries the author and timestamp; the parent is informed of the final status on their notification channel | Decision tracked and notified to the parent | MVP |
| PJ-SUR-02.5 | An exemption certificate submitted by the parent | Rachid, System (linking) | The exemption certificate is linked to the exemption (PJ-SUR-03) and requires no absence excuse for the time slots covered | An exemption covering the slots, with no redundant excuse | V1 (PJ-SUR-03 is V1) |
| PJ-SUR-02.6 | Accumulated absences per student and per period | System (comparison, alert) | Accumulated absences (excused and unexcused) per student and per period are compared against configured thresholds; on crossing, an alert to student life and leadership and guardians informed; the history feeds the councils' file (PJ-SUR-05) and, where applicable, a disciplinary file (PJ-SUR-04) | Crossed thresholds escalated | V1 (thresholds and alerts) |
| PJ-SUR-02.7 | An invalid number flagged | Rachid (flagging), Secretariat (correction) | Every invalid number flagged becomes a secretariat action (correcting civil status and contact details, the number-change procedure FR-ADM-20); until corrected, the student stays in the "reach by any means" list | Contact details corrected; the student kept on the list to reach | MVP |
| PJ-SUR-02.8 | A paper certificate handed over by the student or a parent with no claimed account (the majority case) | Rachid (front-desk entry) | Recording an excuse **on the guardian's behalf** from the absence's record: a reason, a photographed paper document or a logged verbal reason, marked "recorded by the school" with author and timestamp; validated on the spot or queued; a parent with an account sees the excuse and its status (ARB-15d, FR-VSC-24) | No absence excused outside the tool; parents without an account still served | MVP |

```gherkin
Feature: Handling the day's absentees
  Scenario: phone follow-up before 10 a.m. for unreached absentees (MVP)
    Given 2 unexcused absences notified at 8:12 a.m.
    And Student A's parent only receives the SMS fallback (no smartphone, no WhatsApp)
    And the SMS fallback is delivered with no reply
    When the day's processing queue is shown to Rachid
    Then Student A appears in the "to call back before 10 a.m." list with the primary contact number
    And after Rachid's call, the logged outcome (reached, still absent, or wrong number) is tracked with author and timestamp
    And a wrong number generates a correction flag to the secretariat

  Scenario: parental excuse then validation by student life (MVP)
    Given an absence recorded this morning for Omar, a Grade 8 student
    And his father, a legal guardian, has an active account
    When the father submits an excuse with a photo of the medical certificate from his account
    Then the absence moves to "excuse pending validation" and its status is visible to the parent
    And the excuse appears in student life's processing queue
    When Rachid reviews the attachment and validates the excuse
    Then the absence is marked excused with the decision's author and timestamp
    And the father is informed of the final status on his notification channel

  Scenario: an excuse recorded at the front desk on a parent's behalf with no account (MVP)
    Given an absence recorded yesterday for a Grade 7 student whose guardian has not claimed an account
    When the student hands Rachid a paper medical certificate
    Then Rachid records the excuse under the mother's name with the certificate photo and the note "recorded by the school"
    And the absence is marked excused with the author and timestamp
```

---

### PJ-SUR-03 — Tardiness, early departure, exemption (passes)

| Attribute | Value |
|---|---|
| Objective | Track late arrivals, early departures, and exemptions consistently, with timestamped passes replacing manual paper slips, and feed student-life statistics. |
| Trigger | A student's late arrival; a parent's or student's request for an early departure at the office; an exemption certificate submitted. |
| Actors | Head supervisor (owner), supervisors (between-class check-in), parents (departure requests, exemption submission), teachers (viewing the "exempt" status on their lists), leadership (statistics). |
| Preconditions | ACTIVE enrollments; the parent–student relationship's context attributes filled in (people authorized to pick up the student, departure authorization — RG-15). |
| Data and events | `AttendanceRecord` (tardiness, departure), `Dispensation`, `Notification`; logging. |
| Output | Passes issued; attendance completed; statistics per student, class, and period. |
| Version | V1 (§12 V1: "full discipline and student life"; BES-SUR-04). |
| Traceability | (→ §7.4; RG-14, RG-15, RG-16, RG-38; DEC-10, DEC-11; BES-SUR-04; PC-05) |

Steps:

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SUR-03.1 | A student arriving at the office after roll-call validation | Rachid | Recording the tardiness with the arrival time and stated reason; issuing an **entry pass** (number, timestamp, class, bilingual FR/AR name) that authorizes class entry; guardians notified per configuration (immediate or batched) | Entry pass issued; tardiness tracked and notified | V1 |
| PJ-SUR-03.2 | Between classes | Supervisors (check-in) | Light mobile check-in by supervisors; accumulated per student and per period; a configured tardiness threshold exceeded: a student-life alert and guardians informed | Tardiness accumulated; thresholds monitored | V1 |
| PJ-SUR-03.3 | An early-departure request (a parent from their account, a departure authorization — context attribute RG-15 — or a request at the office) | Rachid | Verifying the **person authorized to pick up the child** (a quality carried by the parent–student relationship, RG-15) before releasing the student; issuing a **departure pass**; the remaining time slots are recorded as an absence with the reason "early departure"; guardians notified; on conflicting requests between guardians (RG-16), the conflict is flagged to the school, which arbitrates — the platform does not decide | A safe departure; remaining slots recorded as an excused absence | V1 |
| PJ-SUR-03.4 | An exemption certificate recorded or submitted by the parent | Rachid | An exemption with dates and time slots covered; in the roll-call lists of teachers involved, the student appears "exempt," distinct from "absent"; the supporting document stays in the file with strict access control (student life does not access the medical content; health is a V2+ module, §7.14) | Exemption tracked, visible to teachers with no medical content | V1 |
| PJ-SUR-03.5 | Tardiness, departures, and exemptions recorded | System (statistics) | Accumulated per student, class, and period; alert thresholds; feeds the daily summary (PJ-SUR-07) and the council file (PJ-SUR-05) | Statistics available for the summary and councils | V1 |

```gherkin
Feature: Morning tardiness with an entry pass
  Scenario: a student late after roll-call validation (V1)
    Given the morning roll call for 3AC validated at 8:05 a.m.
    And a 3AC student arrives at the student-life office at 8:35 a.m. with no excuse
    When Rachid records the tardiness with the arrival time and stated reason
    Then a numbered, timestamped entry pass is issued and the student is authorized to join their class
    And the tardiness is linked to the student's enrollment and appears in the day's summary
    And the student's tardiness count is updated for thresholds and councils

  Scenario: an early departure handed to an authorized person (V1)
    Given an early-departure request for a Grade 6 student filed by his mother, holder of custody
    And the maternal grandmother is among the people authorized to pick up the student
    When Rachid verifies the identity of the person present and validates the departure
    Then a departure pass is issued with the departure time and the person picking up the student
    And the remaining time slots are recorded as an absence with the reason "early departure"
    And the legal guardians and the holder of custody are notified of the student's departure
```

---

### PJ-SUR-04 — Incident and graduated sanction (summons, disciplinary council)

| Attribute | Value |
|---|---|
| Objective | Move discipline off the paper register: factual reporting, a graduated sanction scale configured by the school, tracked summons, a tooled disciplinary council, all under strict confidentiality (§4.1). |
| Trigger | A report from a teacher, a supervisor, or a direct observation; accumulated absence or tardiness alerts. |
| Actors | Head supervisor (owner), teachers (reporting), leadership (heavy sanctions, chairing the council), parents and student (recipients), disciplinary council. |
| Preconditions | ACTIVE enrollment; a sanction scale and summons templates configured by the school; cycles assigned. |
| Data and events | `Incident`, `Sanction`, `DisciplinaryCouncil`, `ConductGrade`, `Meeting/Convocation`; `IncidentRecorded`, `SanctionNotified`, `SummonsIssued`; `AuditLog`. |
| Output | Incident processed, sanction issued and notified; where applicable, a disciplinary-council decision recorded (up to the ACTIVE → EXPELLED transition). |
| Version | V1 (§12 V1: "full discipline and student life"; BES-SUR-05). |
| Traceability | (→ §7.4; RG-14, RG-29, RG-31, RG-38; DEC-08, DEC-18, DEC-22, DEC-24; BES-SUR-05; INV-21, INV-23, INV-33, INV-39; PC-11) |

Steps:

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SUR-04.1 | A report received (teacher, supervisor) or a direct observation | Rachid | A mobile or web form — date, place, severity, a factual description, any witnesses, an attachment; the incident is linked to the student's enrollment (no floating school data, DEC-18) and to the class | Incident recorded and linked | V1 |
| PJ-SUR-04.2 | Incident recorded | System (isolation) | The incident, sanctions, and any ongoing procedure are invisible outside the originating school (RG-29, INV-21) and excluded from any inter-school sharing, transfer dossier, or official document (RG-31, INV-23, DEC-08, §4.1); every disciplinary view and write is logged (RG-38, INV-33) | Disciplinary confidentiality guaranteed and tracked | V1 |
| PJ-SUR-04.3 | Incident processed | System (notifications) | Legal guardians and the holder of custody are notified per their rights (RG-14); for an adult student, the student herself is a direct recipient (RG-02 — PJ-SUR-08) | The right recipients notified | V1 |
| PJ-SUR-04.4 | Incident classified | Rachid, Leadership (heavy sanctions) | A scale configured by the school — a logged verbal reminder, a written warning, community service, a temporary exclusion, appearing before the disciplinary council; the sanction carries type, duration, and decision; a **temporary exclusion** creates, for its duration, attendance records of type "exclusion (administrative absence)," with no absence notification or attendance-count impact; the enrollment's SUSPENDED state stays an administrative measure taken by leadership that a sanction may propose but never apply automatically (ARB-16); the conduct grade is updated per the school's scale; the sanction notification sent to authorized recipients | A graduated sanction issued and notified; the excluded student absent from roll-call lists with no parent alert | V1 |
| PJ-SUR-04.5 | A sanction requiring a summons | System (send, read tracking) | A written bilingual summons to guardians (a meeting with student life, a council appearance) with date, time, subject, and a note on how to respond; sent through notification channels (§4.3) with read tracking (SummonsIssued) and a reminder if unread | Summons tracked with read tracking | V1 |
| PJ-SUR-04.6 | Serious or repeated facts | Leadership (chairing the council), Rachid (building the file) | Building the file — a history of incidents and sanctions **from this school only**, absence alerts, student-life opinions; the session is held outside ZSchool, the decision is recorded (a final warning, a temporary exclusion, a permanent expulsion); on permanent expulsion, the enrollment moves from ACTIVE to EXPELLED with a reason and date; official documents stay issued with no blocking for unpaid fees (DEC-24, INV-39) | The council's decision recorded; closure to EXPELLED where applicable | V1 |
| PJ-SUR-04.7 | Incidents and sanctions closed | System (retention) | Incidents and sanctions kept until end of enrollment plus 2 years, then anonymized (DEC-22); after enrollment closing, read-only viewing (RG-32) | Retention and read-only compliance | V1 |

```gherkin
Feature: Incident and graduated sanction under disciplinary confidentiality
  Scenario: recording an incident and notifying guardians (V1)
    Given an incident reported by a teacher concerning a 1st-year baccalaureate student
    And the school's sanction scale is configured from a written warning to a disciplinary-council appearance
    When Rachid records the incident with date, place, severity, and a factual description
    Then the incident is linked to the student's enrollment and invisible outside the school
    And the legal guardians and the holder of custody, per their rights, are notified
    And Rachid's viewing of the incident is logged with author, context, and timestamp
    When a written warning is issued as the first sanction
    Then the sanction is recorded with type, duration, and decision, and notified to authorized recipients

  Scenario: disciplinary council and permanent expulsion (V1)
    Given a file of repeated incidents and exhausted graduated sanctions for a student
    And the parents summoned with a tracked summons and a read receipt
    When the disciplinary council pronounces a permanent expulsion and the decision is recorded
    Then the enrollment moves from ACTIVE status to EXPELLED status with a reason and date
    And no disciplinary mention appears on the leaving certificate or any official document
    And official documents stay issued even in the presence of arrears
```

---

### PJ-SUR-05 — Preparing the class council: the student-life portion (absence/conduct alerts)

| Attribute | Value |
|---|---|
| Objective | Give the class council a reliable, complete student-life portion: absence totals, tardiness, incidents, the conduct grade, and a **flagged opinion** from student life for each flagged student, without encroaching on the academic portion. |
| Trigger | Approaching period close (semester or trimester); leadership opening council preparation (PC-06). |
| Actors | Head supervisor (owns the student-life portion), leadership (chairing the council, minutes), homeroom teacher and teachers (academic portion), parents and student (feedback per school decisions). |
| Preconditions | Assessment periods configured; attendance and discipline entered (PJ-SUR-01 to PJ-SUR-04). |
| Data and events | `AttendanceRecord`, `Incident`, `Sanction`, `ConductGrade`; a student-life opinion (an internal remark). |
| Output | A student-life file per class attached to the council; alerts formalized; commitments tracked into the following semester. |
| Version | V1 (§12 V1: class councils; full student life; BES-SUR-07). |
| Traceability | (→ §7.4, §7.5, §7.11, §8.3; RG-29, RG-38, RG-39; DEC-18; BES-SUR-05, BES-SUR-07; PC-06) |

Steps:

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SUR-05.1 | Approaching period close; attendance and discipline entered (PJ-SUR-01 to PJ-SUR-04) | Rachid | Generating, on demand, the student-life file per class — per student: excused and unexcused absences, tardiness, departures, open incidents and sanctions, the conduct grade; per class: a comparative summary | Student-life file built | V1 |
| PJ-SUR-05.2 | Students flagged in the file | Rachid | For each flagged student, writing a **student-life opinion** (an absence alert, a conduct alert, a suggested meeting) attached to the council file; the opinion is a staff observation, internal to the school, never portable (RG-29) | Flagged opinions formalized and attached to the file | V1 |
| PJ-SUR-05.3 | File built | A design safeguard (scope) | The file contains no grade or average — unpublished grades are invisible to student life (§8.3 matrix, RG-39); the academic portion (averages, remarks, streaming proposals) stays carried by teachers and leadership in journey PC-06 | Strict scope respected: no grade or average | V1 |
| PJ-SUR-05.4 | The class council session | Rachid (student-life portion), Leadership (minutes, academic decisions) | During the session, student life answers questions on its file and logs requests (clarifications, a commitment asked of the student); the minutes and academic decisions stay entered by leadership | Student-life portion logged without encroaching on academic matters | V1 |
| PJ-SUR-05.5 | Council held | Rachid | Student-life commitments (an absence warning, a conduct agreement, a scheduled meeting) tracked with a deadline; unresolved alerts are reiterated at the next council with the history | Commitments tracked; unresolved alerts reiterated | V1 |

---

### PJ-SUR-06 — Targeted communication to a class's parents

| Attribute | Value |
|---|---|
| Objective | Replace informal messaging groups with a traceable, bilingual channel: a student-life announcement or instruction sent only to a class's parents (or a level, a cycle within his scope), with delivery tracking and controlled costs. |
| Trigger | A student-life need: a rule reminder, foreseeable collective absence information (transport, a mock exam), a collective summons, a weather instruction. |
| Actors | Head supervisor (owner, within his cycles), leadership (templates, moderation), parents (recipients), teachers (possible cc recipients). |
| Preconditions | Message templates approved by the school; communication preferences and WhatsApp opt-in up to date; SMS/WhatsApp credits available. |
| Data and events | `Announcement`, `Message`, `Notification`, `DeliveryLog`; `SummonsIssued`. |
| Output | Message delivered and tracked; failures visible and retriable; costs charged. |
| Version | MVP for announcements, messages, and moderated in-app threads with in-app and SMS notifications in the recipient's language, sending windows, and a "STOP" opt-out limited to announcements (§12, ARB-21); V1 for the general WhatsApp Business API, push, summons, and full read tracking (§12 V1; PC-11: student-life summons in V1). |
| Traceability | (→ §7.8; RG-38, RG-39; DEC-10, DEC-11, DEC-12, DEC-28, DEC-34, DEC-36; BES-SUR-08; PC-11) |

Steps:

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SUR-06.1 | A student-life need (a rule reminder, a foreseeable collective absence, a collective summons, a weather instruction) | Rachid | Choosing a template approved by the school (bilingual FR/AR — templates for the day's absence, a summons, a rule reminder, Ramadan); customization limited to configured fields; targeting by class, level, or cycle within his assigned cycles (RG-39) | Message ready, targeted within the assigned cycles' scope | MVP |
| PJ-SUR-06.2 | Message validated | System (routing) | In MVP, every recipient receives the announcement in-app and by SMS in their language (a single targeted segment, ARB-21c), within allowed sending windows (8 a.m.–8 p.m., configured Ramadan windows, ARB-21e); a parent who opted out via "STOP" no longer receives announcements but keeps attendance and security notifications (ARB-21d); in V1, a push, WhatsApp utility if express consent, SMS otherwise hierarchy (DEC-12, DEC-36, arbitration D1); the mobile number is the contact key (DEC-11) | Message delivered on each recipient's available channel | MVP (in-app, SMS); V1 (WhatsApp, push) |
| PJ-SUR-06.3 | Sends completed | Rachid | Tracking sent and delivered per recipient ("read" reserved for channels that offer it: in-app, WhatsApp — SMS does not provide it, ARB-21f); failures visible with a reason (invalid number, undelivered); a targeted manual reminder available; unreached recipients feed the phone follow-up (PJ-SUR-02) | Traceable delivery, failures retriable | MVP (sent, delivered, read in-app); V1 (read WhatsApp, full read tracking) |
| PJ-SUR-06.4 | The day's send volume | System (charging, alerts) | Charged to the school's SMS/WhatsApp bundles with a credit-threshold alert; the WhatsApp pricing switch of 01/10/2026 is a cost parameter (OQ-02; DEC-28 for the bundle model) | Costs charged and credit thresholds alerted | MVP (SMS bundles); V1 (WhatsApp bundles) |
| PJ-SUR-06.5 | Parent replies | System (moderated threads), Leadership (viewing) | Parent replies arrive within the school's moderated in-app threads (DEC-34, MVP — ARB-21a); incoming WhatsApp replies get an automatic bilingual acknowledgment pointing back to the app and are forwarded to student life in a message queue (ARB-21g); leadership may view threads, which is disclosed to users | Replies framed and viewable | MVP (moderated in-app threads); V1 (WhatsApp replies) |

```gherkin
Feature: Targeted communication to a class's parents
  Scenario: an in-app and SMS student-life announcement (MVP)
    Given a student-life instruction meant for the parents of 2AC-3
    And some parents whose preferred language is Arabic and others whose preferred language is French
    When Rachid broadcasts the bilingual announcement from the school-approved template at 5 p.m.
    Then each parent receives the message in-app and by SMS in their preferred language only
    And delivery tracking distinguishes sent and delivered for each recipient, and read for in-app
    And delivery failures are listed with their reason for a targeted follow-up
    And the SMS send cost is charged to the school's bundles

  Scenario: an announcement deferred outside the sending window (MVP)
    Given a non-urgent announcement validated at 10 p.m.
    When routing runs
    Then the send is deferred to the next day at 8 a.m.
    And an attendance notification issued at 10 p.m. for a late departure is not deferred

  Scenario: a student-life announcement with multi-channel routing (V1)
    Given a student-life instruction meant for the parents of 2AC-3
    And 85 percent of the parents involved have given WhatsApp consent and have the app installed
    When Rachid broadcasts the bilingual announcement from the school-approved template
    Then each parent receives the message on their priority channel (push, then WhatsApp utility, then SMS)
    And the cost of WhatsApp and SMS sends is charged to the school's bundles
```

---

### PJ-SUR-07 — Daily summary (today's absentees, open incidents)

| Attribute | Value |
|---|---|
| Objective | Give the head supervisor the day's view that replaces the physical round and the paper register: missing roll calls, absentees, tardiness, excuses awaiting validation, open incidents — and give leadership the same view (§7.11). |
| Trigger | Continuous (morning, day, evening); every school day. |
| Actors | Head supervisor (owner), leadership (viewing), teachers (feedback on missing roll calls). |
| Preconditions | The day's roll calls and entries in progress (PJ-SUR-01 to PJ-SUR-04). |
| Data and events | `AttendanceRecord`, `Incident`, `Justification`, `Notification`; `AbsenceThresholdReached`. |
| Output | The day's summary closed; escalations completed; weekly and per-period statistics available. |
| Version | MVP for the day's lists, processing queues, and the per-class attendance rate (single definition ARB-24a: (expected sessions − unexcused absences − excused absences) / expected sessions, computed on declared sessions; a variant excluding excused absences is displayable); V1 for the enriched student-life dashboard, thresholds, and recommended actions (BES-SUR-07). |
| Traceability | (→ §7.11; RG-38, RG-39; BES-SUR-07; PC-05) |

Steps:

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SUR-07.1 | Morning | Rachid | Today's view — classes with no validated roll call (follow-up, PJ-SUR-01), absentees by class, morning tardiness, passes issued, failed notifications | Missing roll calls and absentees visible from the morning | MVP (today's lists via PJ-SUR-01 and PJ-SUR-02); V1 (dashboard) |
| PJ-SUR-07.2 | During the day | Rachid | Open incidents, excuses awaiting validation, remaining "before 10 a.m." follow-ups, today's early departures | The day's queues in view | MVP |
| PJ-SUR-07.3 | Evening | Rachid | A summary — the day's absentees with a processing status (excused, processed, escalated), the attendance rate per class (ARB-24a definition), today's sessions not held (PJ-SUR-09), open incidents, unread summons; crossed thresholds appear with a recommended action (V1); sending the evening summary to the families of students who accumulated several absences during the day (ARB-15a) | The day's summary closed | MVP (lists, processing statuses, attendance rate, evening summary); V1 (thresholds, recommended actions) |
| PJ-SUR-07.4 | The whole summary | A design safeguard (scope and confidentiality) | The summary only covers assigned cycles (RG-39) and exposes no financial data or grade; viewing disciplinary files from the summary is logged (RG-38) | Scope and confidentiality respected | MVP and V1 (a permanent principle) |
| PJ-SUR-07.5 | Leadership viewing | Leadership | Leadership views the same summary in their dashboard (§7.11: student life — today's absentees, tardiness, open incidents) with no additional action from Rachid | The same view on leadership's side | V1 |

---

### PJ-SUR-08 — The adult student's case in student life

| Attribute | Value |
|---|---|
| Objective | Correctly apply the adult-student regime (18 years reached) in student-life journeys: disciplinary and absence notifications addressed to the student herself, a parental-access restriction operated by the student, restrictions respected by student life. |
| Trigger | A high-school student reaching civil majority; a parental-access restriction recorded; a disciplinary incident concerning an adult student. |
| Actors | Head supervisor (owner), adult student (holder of her rights), parents (default access, then restricted), leadership (restriction notification). |
| Preconditions | Date of birth up to date; the RG-02 restriction mechanism active; the disciplinary journey V1 for the discipline component. |
| Data and events | `Incident`, `Sanction`, `Notification`; `StudentReachedMajority`; `AuditLog`. |
| Output | Notifications addressed to the right recipient; restrictions respected and tracked. |
| Version | RG-02/DEC-20 mechanism: **MVP** (INV-35, ARB-10; aligned with `prd/02`, `prd/journeys/06`, and `prd/journeys/07`); the full disciplinary journey: V1. |
| Traceability | (→ §6.1 (RG-02), §8.1; RG-14, RG-29, RG-38; DEC-20; BES-SUR-05, BES-SUR-06; INV-35; PC-06) |

Steps:

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SUR-08.1 | A student reaching 18 years | System (detection, notification) | The student becomes the holder of her own account and rights; the majority event is notified to the student (information on her rights) and to the school; student life sees the "adult student" indicator on the record | Majority recorded and flagged | MVP |
| PJ-SUR-08.2 | Adult student with no restriction recorded | System (notifications) | As long as the adult student has not restricted parental access, legal guardians stay informed by default; absence and disciplinary notifications are addressed **equally** to the student herself | A default dual recipient (parents and student) | MVP (absence); V1 (discipline) |
| PJ-SUR-08.3 | A restriction decided by the adult student | Adult student (decision), System (log, notification) | The student may restrict her parents' access to school, disciplinary, and health data at any time; the restriction is logged and notified to the school (RG-02, DEC-20); once recorded, student life no longer sends disciplinary notifications to restricted parents, and journeys PJ-SUR-01, PJ-SUR-02, and PJ-SUR-04 automatically filter recipients | Restrictions respected, tracked, and immediately effective | RG-02 mechanism: MVP; full disciplinary effect: V1 |
| PJ-SUR-08.4 | Edge cases | System, Leadership | The financially responsible parent keeps access only to financial data as long as they remain liable (a component outside student life's scope); the adult student stays subject to the internal rules and may be summoned and heard by the disciplinary council in her own name | Edge-case rights correctly applied | MVP (financial data); V1 (disciplinary council) |

```gherkin
Feature: Adult student and disciplinary data
  Scenario: parental-access restriction on disciplinary data (MVP mechanism; V1 disciplinary effect)
    Given a 2nd-year baccalaureate student, 18 years reached, holder of her account
    And a disciplinary incident recorded concerning her
    And her parents are informed by default as long as no restriction is recorded
    When the student restricts her parents' access to disciplinary data
    Then the restriction is logged and notified to the school
    And subsequent disciplinary notifications are no longer addressed to the parents but to the student herself
    And the disciplinary file stays invisible outside the school
```

---

### PJ-SUR-09 — A session not held: teacher absence, cancellation, replacement

| Attribute | Value |
|---|---|
| Objective | Declare that a session did not happen or was replaced, so that expected roll calls, roll-call rates, the lesson log, and notifications to families stay accurate (ARB-05). |
| Trigger | A teacher absent (illness, delay, a trip), a cancelled session (an outing, an exam, bad weather), a replacement by a colleague. |
| Actors | Head supervisor (owner), academic leadership (replacements), teachers (information), parents (optional information). |
| Preconditions | Expected sessions declared (PJ-SUR-01.1); course assignments up to date. |
| Data and events | An expected session (status: held, not held, replaced), `TeacherAssignment` (a substitute), `Notification`. |
| Output | The session removed from expected roll calls or reassigned; the lesson log marked; families informed if the school configures it. |
| Version | MVP (ARB-05, FR-PED-21). |
| Traceability | (→ §7.3, §7.4; RG-38, RG-39; BES-SUR-01, BES-SUR-07; PC-05; ARB-05) |

Steps:

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SUR-09.1 | A teacher reported absent in the morning | Rachid | From today's screen, declaring the teacher's absence for the day or for specific sessions; the sessions involved move to "not held" and leave the list of expected roll calls; no "missing roll call" alert is generated | Expected roll calls accurate | MVP |
| PJ-SUR-09.2 | A session not held | Academic leadership, Rachid | A replacement option: assigning a substitute teacher (a temporary assignment, RG-39 scope extended to the session), or student life taking over the class with a per-class roll call | Session replaced and rolled, or students released per the school's rule | MVP |
| PJ-SUR-09.3 | A session not held at the start or end of a half-day | System (configurable notification) | Informing the class's guardians (in-app, SMS; an early release or a delayed entry) per configuration; the session's lesson log is marked "not held" (V1 with FR-PED-17) | Families informed; a consistent lesson log | MVP (notification); V1 (lesson log) |
| PJ-SUR-09.4 | End of day | System (statistics) | Sessions not held are excluded from the denominator of roll-call and attendance rates (ARB-24a); counted per teacher for strictly operational purposes (FR-RAP-08, V1) | Accurate indicators | MVP (exclusion); V1 (per-teacher tracking) |

```gherkin
Feature: A session not held
  Scenario: a teacher's absence declared in the morning (MVP)
    Given a math session expected at 10 a.m. for 2AC-3
    When Rachid declares the teacher absent for the day
    Then the 10 a.m. session moves to "not held" and disappears from expected roll calls
    And no missing-roll-call alert is issued for this session
    And 2AC-3's attendance rate for the day is computed without this session
```

---

## 6. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Baseline update on the time zone. | **Escalated — ESC-03.** The baseline (§2.4, §10) still provides for "UTC+1 with a return to UTC+0 during Ramadan." Research establishes a **permanent return to UTC+0 on 20/09/2026** (Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026), with no seasonal switch or Ramadan exception (`prd/research/00-baseline-corrections.md` No. 1; `prd/research/04-pedagogy-massar-calendar.md` §3). Adopted in this file: Africa/Casablanca = permanent UTC+0, UTC storage; "shortened Ramadan hours" remains a pedagogical timetable variant. Baseline update to be requested in review. |
| OQ-02 | Routing and WhatsApp cost for student-life notifications after 01/10/2026. | **Resolved — ARB-21d/g, ARB-25c** (express opt-in serving as the transfer basis, opt-out limited to announcements and reminders, incoming replies acknowledged and forwarded, a dated pricing switch parameter). Correction No. 6: per-message billing from 01/07/2025; on 01/10/2026, the end of free service and utility messages within the 24-hour window and Morocco's exit from Rest-of-Africa regional pricing (Meta's announcement of 01/07/2026; `prd/research/03-payments-communications.md` §4). To be settled: a dated pricing-switch parameter, budgeting for incoming replies, and the exact scope of opt-in and opt-out (attendance notifications are part of service delivery, student-life announcements need classification; CNDP-ANRT 2019 guidance, Law 09.08). DEC-36 remains the governing decision. |
| OQ-03 | Digital-usage figures to cite in support of mobile-first. | **Escalated — ESC-03.** The baseline (§2.10) cites "91.7% of households equipped with a smartphone, 89.2% internet, ~8% basic phone (14% rural)." Correction No. 10: ANRT 2024-2025 = 91.2% of individuals 5+ use the internet, 89.2% of households, 91.7% of mobile-equipped individuals have a smartphone; rural household internet 78.4%; the "8%/14%" pair does not appear in the edition (`prd/research/05-infrastructure-usage.md` §2). Adopted: the SMS fallback stays sized for the rural digital divide; baseline figures to be updated in review. |
| OQ-04 | Priority between the per-class roll call (supervisor) and per-course roll calls (teachers) for the same half-day. | **Resolved — ARB-15e** (the first synchronized validation is authoritative; a gap is arbitrated with no new notification; a correction notice after arbitration). The baseline provides for "roll call per course or per half-day" (§7.4) and the persona takes roll call by class (§5.2). An arbitration rule to define in review: a school-configurable priority, flagging discrepancies (already required here), a ban on silently overwriting a teacher's roll call; a direct impact on absence events and the notification delay. |
| OQ-05 | Compatibility of offline mode with the under-5-minute notification delay. | **Resolved — ARB-15b** (the delay runs from platform-side sync, including the 3-minute hold window; carried forward by FR-VSC-25). The baseline (§10) sets "an absence notification delay under 5 minutes after roll-call validation." Interpretation adopted in PJ-SUR-01: the delay runs from actual platform-side validation (including sync), with the roll call validated locally then transmitted. Alternative: a clock triggered at the local validation time. To be settled in review; an impact on the NFR-OFF and NFR-PERF domains of `prd/cross-cutting/32-non-functional-requirements.md`. |
| OQ-06 | The tracking entity for student life's manual phone calls. | **Open** (not covered by ARB-01 to ARB-26; a proposal: a contact trace carried by `prd/modules/17`). The entity schema (§6.10) and `prd/03-domain-data-model.md` carry no entity for logging an outbound phone contact (author, timestamp, outcome, the student involved); BES-SUR-08 nonetheless assumes a tracked history. To be settled: a contact trace in `prd/modules/17-communication-notifications.md` or a dedicated record in `prd/modules/13-attendance-student-life-discipline.md`; failing that, logging stays as text in the day's tracking. |
| OQ-07 | Default alert-threshold values (absences, tardiness). | **Open** (to be gathered from pilots, V1). The baseline provides for "statistics and alert thresholds" (§7.4) with no values; configuration is per school. Propose default values to be gathered from pilots (DEC-35) — for instance per semester — rather than imposing a national rule that does not exist for the private sector. |
| OQ-08 | WhatsApp and push scope in MVP (founder arbitration D1, review). | **Resolved — ARB-21b** (no push in MVP; the DEC-36 hierarchy from V1). MVP: in-app notifications, SMS, and WhatsApp "utility" limited to attendance notifications (minimal templates); V1: general WhatsApp (all messages, managed templates) and push. Breaks down into PJ-SUR-01 (step 6), PJ-SUR-06 (step 2), and §4.3; to be reflected in `prd/modules/17-communication-notifications.md` (arbitration D1). |

---

## Traceability

| Baseline ID | Coverage in this file |
|---|---|
| §5.2 (persona Rachid) | Purpose (§1), all journeys PJ-SUR-01 to PJ-SUR-08 |
| §6.1 (RG-02), §6.4 (RG-13, RG-14, RG-15, RG-16) | PJ-SUR-01, PJ-SUR-02, PJ-SUR-03, PJ-SUR-04, PJ-SUR-08 |
| §7.4 (attendance and student life) | PJ-SUR-01 to PJ-SUR-04, PJ-SUR-07 |
| §7.5, §7.11 (councils, student-life dashboard) | PJ-SUR-05, PJ-SUR-07 |
| §7.8 (communication), DEC-34 | PJ-SUR-06 |
| §8.1, §8.3 (student-life role, matrix) | §2, §4.2, PJ-SUR-05 |
| §10 (offline, notification delay) | PJ-SUR-01 (Gherkin), OQ-05 |
| §12 (MVP/V1/V2) | Overview table (§3), Version column of every journey |
| RG-14 | PJ-SUR-01, PJ-SUR-02, PJ-SUR-03, PJ-SUR-04 (notifications to guardians and the holder of custody) |
| RG-15, RG-16 | PJ-SUR-03 (early departure, the person picking up, conflicts) |
| RG-19 | §4.2 (data attributed to its author after an affiliation closes) |
| RG-28 | PJ-SUR-02 (excuse status visible to the parent) |
| RG-29, RG-31, DEC-08 | §4.1, PJ-SUR-04, PJ-SUR-05 (disciplinary non-portability) |
| RG-32, DEC-22 | §4.1, PJ-SUR-04 (read-only after closing, retention end of enrollment + 2 years) |
| RG-36, RG-37, RG-39 | §2, §4.2, PJ-SUR-01, PJ-SUR-05, PJ-SUR-06, PJ-SUR-07 (assigned-cycle scope) |
| RG-38 | §4.2 and every sensitive write and view across journeys |
| DEC-10 | PJ-SUR-01, PJ-SUR-03, PJ-SUR-06 (FR/AR bilingualism, both scripts) |
| DEC-11 | §4.3, PJ-SUR-02, PJ-SUR-06 (phone = primary contact) |
| DEC-12, DEC-36 | §4.3, PJ-SUR-01, PJ-SUR-06 (push, WhatsApp, SMS routing) |
| DEC-15 | §3 (version scoping) |
| DEC-18 | PJ-SUR-04 (incident linked to the enrollment) |
| DEC-20 | PJ-SUR-08 (adult student) |
| DEC-24 | PJ-SUR-04 (documents not blocked for unpaid fees, the EXPELLED case) |
| DEC-28 | §4.3, PJ-SUR-06 (notification costs as consumables) |
| DEC-34 | PJ-SUR-06 (replies within moderated threads) |
| DEC-35 | §2 (a middle/high school of about 800 students), OQ-07 |
| G-14 | Purpose (§1): closing the student-life/discipline gap through journeys |
| H-11, H-20 | §4.3, OQ-02 (WhatsApp adoption, rates to confirm) |
| INV-21, INV-23, INV-33, INV-34, INV-35, INV-39 | PJ-SUR-04, PJ-SUR-05, PJ-SUR-08 (references to `prd/03-domain-data-model.md`) |
| BES-SUR-01 to BES-SUR-08 | Overview table (§3) |
| PC-05, PC-06, PC-11 | §3 and corresponding journeys (`prd/journeys/00-journey-map.md`) |
| Research (corrections No. 1, 6, 10) | §2, §4.3, OQ-01, OQ-02, OQ-03 |
| ARB-04, ARB-05, ARB-15, ARB-16 (`prd/cross-cutting/42-review-arbitrations.md`) | §2, §3, §4.3, PJ-SUR-01, PJ-SUR-02.8, PJ-SUR-04.4, PJ-SUR-07, PJ-SUR-09, OQ-04, OQ-05 |
| ARB-10, ARB-21, ARB-24, ARB-25 | PJ-SUR-06, PJ-SUR-07, PJ-SUR-08, OQ-02, OQ-08 |
| ARB-26 (single scenario set) | §1 (Omar, Marrakech middle/high school), PJ-SUR-02 (Gherkin) |
