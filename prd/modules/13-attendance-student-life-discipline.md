# PRD ZSchool — Attendance, Student Life, and Discipline (VSC)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09) |
| Date | 2026-09-09 |
| Status | PRD Draft — under review |
| Source | PROJECT.md §7.4, §6.8, §6.9, §5.2, §8.1–8.3, §10, §12; rules RG-29, RG-31, RG-38, RG-39; decisions DEC-08, DEC-10, DEC-12, DEC-20, DEC-22, DEC-36; gap resolved G-14 |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/journeys/03-head-supervisor.md`, `prd/journeys/04-part-time-teacher.md`, `prd/journeys/05-multi-school-parent.md`, `prd/journeys/06-custodial-mother-and-guardian.md`, `prd/journeys/07-students-minor-and-adult.md`, `prd/modules/12-academic-structure-timetables.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/20-dashboards-reporting.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/research/00-baseline-corrections.md`, `prd/research/03-payments-communications.md`, `prd/research/05-infrastructure-usage.md`, `prd/cross-cutting/42-review-arbitrations.md` (ARB-04, ARB-05, ARB-15, ARB-16, ARB-17e, ARB-21, ARB-25j) |

---

## 1. Objective and Scope

This module covers the daily chain of attendance and student life: taking attendance on mobile, automatically notifying the guardians of an absent student, justifying absences, tracking tardiness, early departures and exemptions, then, at V1, full disciplinary processing (incidents, graduated sanctions, summonses, disciplinary council, conduct grade) and statistics. It carries the critical journey PC-05 (morning roll call and absence notification) described in `prd/journeys/00-journey-map.md`.

The guiding principle is **child safety**: a student's absence must reach their family in under 5 minutes after roll call is confirmed (PROJECT.md §10), even when the classroom's network connection is unstable (§2.10), which requires roll call to be fault-tolerant with synchronization and conflict resolution.

**In scope:**

| Subject | Version |
|---|---|
| Roll call per declared session (course × date × slot, FR-PED-20 in `prd/modules/12-academic-structure-timetables.md`, ARB-04) or per half-day, on mobile, for teachers and student life; a "tardy" state entered at roll call | MVP |
| Offline mode, synchronization, a conflict-resolution rule, and arbitration of discrepancies by student life (ARB-15e) | MVP |
| Automatic notification of guardians within 5 minutes of roll call confirmation, limited to the first absence of the day (or half-day), a 3-minute retention window, a correction notice after a fix, an evening summary (ARB-15) | MVP |
| A justification recorded at the front desk by student life on a guardian's behalf (ARB-15d) | MVP |
| Student life's daily summary: expected and received roll calls, absentees, notification status (BES-SUR-07) | MVP |
| Full multi-channel routing (push, WhatsApp, SMS) per preferences and consents | V1 — generalization (all messages, managed templates, push); at MVP: in-app, SMS, and "utility" WhatsApp limited to attendance notifications (minimal templates) — D1 arbitration, OQ-08 |
| Absence justification by the parent with an attachment, validated by student life | MVP |
| Configuring notification rules (delay, thresholds, recipients) | MVP |
| Attendance-rate alert thresholds and threshold-breach alerts | V1 |
| Tardiness: duration, reason, late passes, tardiness notification; early departures; exemptions (PE) | V1 |
| Attendance statistics (rate by class, by period) | V1 |
| Discipline: incidents, warnings, graduated sanctions, summonses, disciplinary council, conduct grade | V1 |
| Disciplinary statistics (repeat offenses, by class) | V1 |
| Non-portability and logging of disciplinary data | V1 (constraint active as soon as the data exists) |
| Immutable, record-level history of roll-call and justification entries (D4, ARB-25j) | MVP (disciplinary-record access log and audit-log export: V1) |
| Excluding a student from rank calculation via configuration (indicator owned by FR-EVA-09, ARB-17e) | V1 |
| Rewards and commendations (student life's positive side, §6.8) | V1 (Could) |
| A justification recorded at the front desk on a guardian's behalf (FR-VSC-24, ARB-15d) | MVP |
| Grouping absence notifications by day, a 3-minute retention window, a correction notice, an evening summary (FR-VSC-25, ARB-15a/b) | MVP |

**Out of scope (cross-references):** calculating averages and rank, and publishing report cards, are owned by `prd/modules/14-assessments-grades-report-cards.md`; notification channels, message templates, parent–teacher threads, and communication-sense summonses are owned by `prd/modules/17-communication-notifications.md`; declared sessions (FR-PED-20), sessions not held and substitutions (FR-PED-21), timetables and their variants (normal, Ramadan, exams) are owned by `prd/modules/12-academic-structure-timetables.md`; management dashboards are owned by `prd/modules/20-dashboards-reporting.md`; transport and canteen check-in are owned by `prd/modules/22-ancillary-services-transport-canteen-activities.md` (V2+); health data and medical certificates in the strict sense are owned by `prd/modules/23-health-sensitive-data.md` (V2+); offline grade entry is owned by the EVA module (`prd/modules/14-assessments-grades-report-cards.md`) under the same NFR principles.

---

## 2. Users and Use Cases

| User | Use case in this module | Needs cited |
|---|---|---|
| Teacher (ENS) | Taking roll call for their courses on their phone at the start of a session, including offline; reporting classroom incidents at V1 | BES-ENS-02, BES-SUR-01 |
| Head supervisor / student life (SUR) | Roll call per class or half-day, the daily summary, following up with families, validating justifications, tardiness and late passes, full discipline within their cycle scope | BES-SUR-01 to BES-SUR-07 |
| Director (DIR) | Configuration (roll-call modes, delays, thresholds, channels, rank exclusion), reviewing statistics, summonses, disciplinary council, arbitrating roll-call discrepancies | BES-DIR-07 (fine-grained permissions) |
| Front office (SEC) | Viewing the day's attendance and a student's record at a family's request, with no write access | Baseline matrix §8.3 |
| Parent / guardian (PAR, GAR) | Receiving the absence notification within 5 minutes, justifying with an attachment from mobile, viewing their child's attendance, receiving summonses and disciplinary notifications per their rights | BES-PAR-02, BES-PAR-05, BES-GAR-05 |
| Student (ELE) | Viewing their own attendance per their access level; on reaching majority, controlling the sharing of disciplinary data with their guardians | BES-ELE-01, BES-ELE-05 |

The baseline's head supervisor (Rachid, §5.2) calls the parents of absentees "before 10am" today: automation within 5 minutes replaces this phone workload while logging it (RG-38).

---

## 3. Key User Journeys

- **PC-05 — Morning roll call and absence notification to guardians** (`prd/journeys/00-journey-map.md`): the module's owning journey at MVP; actors are the teacher, the head supervisor, and parents; step details are in `prd/journeys/04-part-time-teacher.md` (taking roll call) and `prd/journeys/03-head-supervisor.md` (daily tracking).
- **PC-11 — Communication: targeted announcement, summons, moderated parent–teacher message**: student-life summonses (V1) are issued from this module and carried by the COM module (`prd/modules/17-communication-notifications.md`); parent-side detail in `prd/journeys/05-multi-school-parent.md`.
- **PC-06 — Grades, class council, report cards**: the conduct grade and rank exclusion feed into class councils and report cards (`prd/modules/14-assessments-grades-report-cards.md`); the adult student (Salma) views her record per her rights (`prd/journeys/07-students-minor-and-adult.md`).

This chapter does not duplicate the detailed `PJ-…` steps owned by the persona files.

---

## 4. Functional Requirements

### FR-VSC-01 — Take roll call per course or per half-day on mobile

| Attribute | Value |
|---|---|
| Description | The teacher or student life takes roll call from mobile: the list of students enrolled in the course (or in the class for a half-day roll call), a status per student (present, absent, tardy — the "tardy" status is entered from MVP; duration, reason, late pass, and tardiness notification are owned by FR-VSC-10, V1), "present" pre-selected for speed, an absentee count, and a confirmation before submitting. **Session** (ARB-04): roll call per course is tied to a declared session (course × date × slot, FR-PED-20) — a session expected as declared by student life or created on the fly by the teacher on a free slot of the day; only one session per triplet, so only one roll call per course and per slot; roll call per half-day is tied to the class and the half-day. A temporarily expelled student (ARB-16) appears on the list with the pre-filled status "exclusion (administrative absence)," non-editable and without a notification. Confirmed roll call carries the date, the session or half-day, the class or course, the list of statuses, the author, and the timestamp. Scope respects least privilege: a teacher only calls roll for their own courses, a supervisor only for their assigned cycles (RG-39, INV-34). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.4, §10, §5.2; RG-39; ARB-04, ARB-16; FR-PED-20 |
| Actors | Teacher, head supervisor, director |

```gherkin
Feature: Taking roll call for a course on mobile
  Scenario: Standard roll call for a course with all students present
    Given a teacher assigned to the math course for class 2AC-B this Monday at 8:00am
    And an expected session declared (math 2AC-B, Monday, 8am–9am)
    And the list of students enrolled in this course loaded on their phone
    When the teacher confirms roll call with no student marked absent
    Then a roll call is created for this session with the date, the slot, and the attendance list
    And the roll call carries the status "confirmed," its author, and its timestamp
    And no AbsenceRecorded event is produced

  Scenario: Only one roll call per session (ARB-04)
    Given a roll call already confirmed for the session (math 2AC-B, Monday, 8am–9am)
    When the supervisor opens roll call for the same course on the same slot
    Then the system shows the existing roll call in logged-correction mode instead of creating a second one

  Scenario: Half-day roll call for a primary class
    Given a school configured for half-day roll call in primary
    And a supervisor authorized for the primary cycle
    When the supervisor confirms the morning half-day roll call for class CE2-A with one absentee
    Then the roll call is tied to the class and the morning half-day
    And an AbsenceRecorded event is produced for the absent student
```

### FR-VSC-02 — Synchronize roll call taken offline

| Attribute | Value |
|---|---|
| Description | Roll call remains fully usable with no network: entries are stored on the device with a local timestamp, the interface flags the offline state and the pending sync queue, and the connection's return automatically triggers the transmission with no further user action. Notification events (AbsenceRecorded) are produced only once the roll call is received server-side; the 5-minute delay is measured from the server's receipt of the confirmation. Detailed non-functional requirements: `NFR-OFF` domain in `prd/cross-cutting/32-non-functional-requirements.md`. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.4, §10; BES-ENS-02, BES-SUR-01 |
| Actors | Teacher, head supervisor |

```gherkin
Feature: Offline roll call and synchronization
  Scenario: Roll call confirmed with no network, then synchronized automatically
    Given a teacher in class whose phone has lost network connectivity
    And an in-progress roll call for the 8:00am slot with three absences marked
    When the teacher confirms roll call while the phone is offline
    Then the confirmation is saved locally and the roll call is kept on the device with its timestamp
    And a pending-sync indicator is shown
    When the network connection is restored
    Then the roll call is transmitted to the server automatically with no further action from the teacher
    And the AbsenceRecorded events for the three absentees are produced once synchronization completes
    And notifications to guardians start within the 5-minute limit after this receipt
```

### FR-VSC-03 — Resolve roll-call synchronization conflicts

| Attribute | Value |
|---|---|
| Description | Two concurrent entries for the same session (an offline teacher roll call and a simultaneous student-life roll call or correction) converge with no loss (ARB-15e): a discrepancy is detected, both versions are kept with timestamps and authors; **the first confirmation received server-side governs the notification** (no second notification is issued); the second opens a **discrepancy** in student life's queue (ECR-VSC-02, MVP), which they arbitrate student by student; while a discrepancy is open, no further notification is sent; an arbitration that makes a student absent when they were not in the first version triggers the notification, the reverse triggers a correction notice (FR-VSC-25). Any post-confirmation change is a logged correction (author, original value, reason, FR-VSC-21) which, if the notification has already gone out, produces a correction notice. The rule is deterministic and guarantees, from MVP, that no roll call is ever lost or ambiguous. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.4, §10; RG-38; ARB-15b, ARB-15e; FR-VSC-25 |
| Actors | Head supervisor, director |

```gherkin
Feature: Roll-call synchronization conflicts (MVP)
  Scenario: An offline teacher roll call and a supervisor roll call for the same session
    Given the supervisor confirming online at 8:10am the roll call for the session (Arabic 2AC-B, 8am–9am) with Omar marked absent
    And the teacher who had confirmed offline the same roll call at 8:05am with Omar marked present, synced at 8:20am
    When the teacher's roll-call sync is received
    Then the supervisor's version, received first, remains the reference, and Omar's already-issued absence notification is not duplicated
    And a discrepancy is opened in student life's queue with both timestamped versions
    When student life arbitrates "Omar present"
    Then the absence is corrected, a correction notice is sent to Omar's guardians, and the arbitration is logged
```

### FR-VSC-04 — Notify guardians of an absence within 5 minutes

| Attribute | Value |
|---|---|
| Description | On roll-call confirmation, an absence notification is automatically sent to each absent student's guardians **for the first absence of the day** (or half-day, per cycle configuration, FR-VSC-06; ARB-15a): by default, to all legal guardians and the custodial guardian (RG-13, RG-14), unless the school has configured otherwise; to the adult student, who holds their own rights (RG-02, DEC-20). Subsequent absences by the same student on the same day do not trigger a new send and are grouped into the evening summary (FR-VSC-25); in preschool, the default is a half-day summary (ARB-15f). Sending is preceded by a 3-minute retention window allowing a false positive to be cancelled (FR-VSC-25, ARB-15b), included within the 5-minute cap. The message is in the recipient's preferred language (ARB-21c; institutional content is available in French and Arabic, DEC-10), carries no other student's data, and states the date, the slot, and how to respond (justification). Every notification is delivered, or reaches a final failure state, less than 5 minutes after the server receives the roll-call confirmation (a measurement definition aligned with NFR-MOB-03 in `prd/cross-cutting/32-non-functional-requirements.md`); every send produces a `Notification` and a `DeliveryLog` (channel, status, cost). Per-channel routing is described in FR-VSC-05. |
| Priority | Must |
| Version | MVP (in-app, SMS, and "utility" WhatsApp limited to attendance notifications, minimal templates; generalization of channels and push at V1 — D1 arbitration, OQ-08; DEC-36) |
| Traceability | PROJECT.md §7.4, §10; RG-13, RG-14, RG-02; DEC-10, DEC-20, DEC-36; ARB-15a, ARB-15b, ARB-15f, ARB-21c; FR-VSC-25 |
| Actors | Parent, custodial guardian, adult student, head supervisor (failure tracking) |

```gherkin
Feature: Absence notification within 5 minutes
  Scenario: Notification delivered to guardians after roll-call confirmation
    Given an 8:00am course roll call received server-side at 8:06am with two students absent
    And each absent student having at least one reachable legal guardian (RG-13)
    When the roll-call confirmation is recorded server-side
    Then a bilingual absence notification is issued to each absentee's guardians
    And every notification is delivered, or reaches a final failure state, less than 5 minutes after confirmation
    And every send produces a delivery-log entry with the channel, status, and cost
    And student life sees notification failures for manual follow-up

  Scenario: No notification for a present student
    Given a confirmed roll call where student Youssef is marked present
    When the confirmation is recorded server-side
    Then no absence notification is issued for Youssef
    And no other student's notification mentions Youssef

  Scenario: A single notification per day for a student absent all day (ARB-15a)
    Given Omar absent from all six Monday sessions
    When the six roll calls are confirmed over the course of the day
    Then his guardians receive a single notification, within 5 minutes of the first roll call
    And the evening summary mentions the six missed sessions
    And six SMS sends are not deducted from the school's credit — only one is
```

### FR-VSC-05 — Route notifications per preferences, consents, and fallbacks

| Attribute | Value |
|---|---|
| Description | Attendance and student-life notifications follow the baseline's hierarchy: push first at V1, "utility" WhatsApp for parents who have opted in, SMS via a Moroccan aggregator as the critical fallback for households without a smartphone (DEC-36); the in-app record remains the reference trace. At MVP (the founder's D1 arbitration), the active channels are in-app, SMS, and "utility" WhatsApp limited to attendance notifications with minimal templates; generalization to all messages, template management, and push are V1 (OQ-08; `INT-WAP` in `prd/cross-cutting/35-external-integrations.md` updated to match). Routing respects the parent's communication preferences and WhatsApp consents (opt-in and opposition, Law 09.08); every channel attempted, whether successful or failed, is logged with its cost. WhatsApp pricing is dated: the 01/10/2026 shift (end of free service messages, and Morocco's exit from regional pricing) is a school- and platform-level parameter, with no service interruption (see `prd/research/00-baseline-corrections.md` note 6 and `prd/research/03-payments-communications.md`). Channel, template, and cost mechanics are detailed in `prd/modules/17-communication-notifications.md` and `prd/cross-cutting/35-external-integrations.md` (INT-WAP, INT-SMS). |
| Priority | Must |
| Version | V1 (generalization: all messages, managed templates, push); MVP: in-app, SMS, and "utility" WhatsApp limited to attendance notifications — minimal templates — per consents, with no push (D1 arbitration, OQ-08) |
| Traceability | DEC-12, DEC-36; H-11; Law 09.08 (opt-in) |
| Actors | Parent, custodial guardian, director (configuration) |

```gherkin
Feature: Multi-channel routing of absence notifications
  Scenario: Falling back to SMS with no WhatsApp consent (no push at MVP)
    Given a legal guardian who has not given WhatsApp consent
    When an absence notification is routed for this guardian
    Then no WhatsApp message is sent to them, and the system attempts the remaining channels per the configured hierarchy (in-app then SMS at MVP; push at V1, DEC-36)
    And the SMS is sent via the school's aggregator, charged against its message credit
    And the delivery log keeps every attempt, its status, and its cost

  Scenario: Respecting a parent's opposition to the WhatsApp channel
    Given a legal guardian who has withdrawn their WhatsApp consent
    When an absence notification is routed for this guardian
    Then no WhatsApp message is sent to them
    And routing falls back to the remaining channels per the configured hierarchy
    And the consent withdrawal is logged with its timestamp
```

### FR-VSC-06 — Configure the school's notification rules

| Attribute | Value |
|---|---|
| Description | The director configures, per school (and per cycle where needed): the roll-call mode per cycle (per session or per half-day), the grouping granularity for absence notifications (day or half-day; preschool default: half-day summary, ARB-15a, ARB-15f), the retention window before sending (default 3 minutes, bounded to respect the 5-minute limit, ARB-15b), recipients (all legal guardians and the custodial guardian by default, RG-13), the evening summary's time, the school's default language (each recipient keeping their own preference, ARB-21c), and the channel hierarchy with its fallback order. The school's **quiet hours** (sending windows, ARB-21e) never apply to attendance notifications, which stay under the baseline's 5-minute cap; they defer other messages. Settings never weaken this cap, a guaranteed service value. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.4 ("delay, thresholds"), §10; RG-13, RG-14; ARB-15, ARB-21c, ARB-21e |
| Actors | Director |

```gherkin
Feature: Notification configuration (MVP)
  Scenario: Quiet hours have no effect on absences
    Given quiet hours configured from 8pm to 8am, and a 7:50am roll call confirmed with one absence
    When the confirmation is received server-side
    Then the absence notification goes out within 5 minutes despite quiet hours
    And an announcement published at 9pm is deferred to the next day at 8am
  Scenario: Half-day grouping in preschool
    Given the preschool cycle configured for half-day summaries
    When a senior-preschool child is marked absent at 8:30am
    Then no immediate notification is sent, and the absence appears in the end-of-morning summary
```

### FR-VSC-07 — Justify an absence with an attachment from the parent's mobile

| Attribute | Value |
|---|---|
| Description | The parent (or the custodial guardian, per their rights) submits, from their mobile, a justification tied to the absence record: reason, comment, attachment (a photo of the certificate or document, or a file). The justification is created with status "submitted," appears in student life's queue, and its status remains visible to the parent. The attachment stays within the school's scope (INV-17, RG-21) and follows attendance's retention period (DEC-22). The same record can receive several successive justifications (`Justification` tied to `AttendanceRecord`). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.4; BES-PAR-05; DEC-22 |
| Actors | Parent, custodial guardian |

```gherkin
Feature: A parent justifying an absence
  Scenario: Submitting a justification with an attachment
    Given a parent notified of their child's absence on the morning of September 21
    And active parent access for this student
    When the parent submits a justification with reason "medical certificate" and a photo of the document
    Then the justification is created with status "submitted" and tied to the absence record
    And the attachment is stored within the school's scope
    And the justification appears in student life's processing queue
    And the parent sees the status "submitted" on the justification
```

### FR-VSC-08 — Validate or refuse justifications via student life

| Attribute | Value |
|---|---|
| Description | Student life processes the justification queue within their cycle scope (RG-39): viewing the attachment, validating or refusing with a reason. Validation marks the absence record "justified"; a refusal leaves the absence unjustified and countable in attendance counters (alert thresholds at V1, FR-VSC-09). Justifications recorded at the front desk (FR-VSC-24) follow the same queue. Every decision carries author, context, and timestamp (RG-38), and the parent is notified of the outcome. Justifications remain editable as long as they are in "submitted" status; after a decision, any revision goes through a new, logged justification. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.4; BES-SUR-03; RG-38, RG-39 |
| Actors | Head supervisor, director |

```gherkin
Feature: Validating a justification via student life
  Scenario: Validating a justification
    Given a justification in "submitted" status with a legible attachment
    And a student-life staff member authorized for the cycle concerned (RG-39)
    When the staff member validates the justification with a comment
    Then the justification moves to "validated" status with author and timestamp
    And the associated absence record is marked "justified"
    And the parent is notified of the validation

  Scenario: Refusing an illegible justification
    Given a justification in "submitted" status whose attachment is illegible
    When the staff member refuses the justification with a reason
    Then the justification moves to "refused" status with author and timestamp
    And the absence stays unjustified and keeps counting in attendance counters
    And the parent is notified of the refusal with the reason
```

### FR-VSC-09 — Trigger attendance alert thresholds

| Attribute | Value |
|---|---|
| Description | The director sets alert thresholds per period (number of unjustified absences, tardiness, a weighted total) at the school, level, or class level. When a threshold is crossed, the `AbsenceThresholdReached` event notifies the director and the head supervisor, and may notify guardians per configuration; the alert appears on the student's attendance record and in the day's student-life dashboard. Alerts are acknowledgeable and logged. |
| Priority | Should |
| Version | V1 |
| Traceability | PROJECT.md §7.4 ("statistics and alert thresholds"); `AbsenceThresholdReached` event in `prd/03-domain-data-model.md` §7 |
| Actors | Director, head supervisor, parent (per configuration) |

### FR-VSC-10 — Record tardiness and late passes

| Attribute | Value |
|---|---|
| Description | The "tardy" status is entered at roll call from MVP (FR-VSC-01); this V1 requirement completes it: student life records tardiness on arrival (student, date, slot, duration, declared reason) and issues a **late pass**: a timestamped record authorizing the student to rejoin class, viewable by the teacher concerned. Tardiness appears on the roll call for the slot concerned and counts toward attendance counters and thresholds. Notifying guardians of tardiness is configurable (immediate, at the end of the half-day, or disabled). |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §7.4; BES-SUR-04 |
| Actors | Head supervisor, teacher (viewing), parent (notification) |

### FR-VSC-11 — Manage authorized early departures

| Attribute | Value |
|---|---|
| Description | An early departure is recorded (student, date, time, reason, person authorized to pick up the student) based on the parental authorization on file (a context attribute of the parent-student relationship, INV-12) or a one-off request validated by student life. The departure is logged, the student is marked as departed for the slot concerned, and authorized guardians are notified per configuration. The day's departure log is viewable by student life and the director. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §7.4; INV-12; RG-38 |
| Actors | Head supervisor, director, parent |

### FR-VSC-12 — Manage activity exemptions (PE)

| Attribute | Value |
|---|---|
| Description | An exemption (`Dispensation`) carries the student, the period (dates, slots, or subjects concerned), the reason, and, where needed, an attachment (a certificate submitted by the parent; the medical treatment itself is owned by `prd/modules/23-health-sensitive-data.md`). During the exemption period, the student is marked "exempt" for the slots concerned: a status distinct from absence, not counted in absence thresholds. Expired exemptions close automatically, and the history stays viewable. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §7.4; `prd/03-domain-data-model.md` §2.4 |
| Actors | Student life (validation), parent (request), PE teacher (viewing) |

### FR-VSC-13 — Produce attendance statistics

| Attribute | Value |
|---|---|
| Description | The module calculates and shows: absenteeism rate by class, by level, and by period; validated-justification rate; average notification delay; distribution by half-day and by slot. Statistics respect scopes (RG-39) and are exportable (Excel/CSV, PROJECT.md §10). Consolidated, multi-site management dashboards are owned by `prd/modules/20-dashboards-reporting.md`. |
| Priority | Should |
| Version | V1 |
| Traceability | PROJECT.md §7.4; BES-SUR-07 |
| Actors | Director, head supervisor |

### FR-VSC-14 — Record disciplinary incidents

| Attribute | Value |
|---|---|
| Description | An incident (`Incident`) carries the student, the date, the context (class, course, recess), a configurable severity (the school's graduated scale), a factual description, any witnesses, and the author. A teacher may report an incident in their class; student life investigates. The incident triggers the `IncidentRecorded` event and notifies authorized guardians per severity and configuration. Incidents are disciplinary data: not portable outside the originating school, and logged (RG-29, RG-31, RG-38, DEC-08). |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §7.4; RG-29, RG-31, RG-38; DEC-08 |
| Actors | Teacher (reporting), head supervisor, director |

```gherkin
Feature: Disciplinary incidents (V1)
  Scenario: Reported by a teacher and investigated by student life
    Given a teacher who witnesses an incident during their 2AC-B course
    When they report the incident with the date, context, proposed severity, and a factual description
    Then the incident is created in the student's record within the school's scope and forwarded to student life for investigation
    And authorized guardians are notified per severity and configuration
    And the incident appears in no transfer profile or leaving file
```

### FR-VSC-15 — Decide warnings and graduated sanctions

| Attribute | Value |
|---|---|
| Description | The sanction scale is configured by the school and graduated (verbal warning, written warning, removal from class, detention, temporary expulsion, referral to the disciplinary council). A sanction (`Sanction`) is tied to an incident, carries its type, duration, and decision; its execution is tracked (carried out, in progress, lifted), and any lifting or revision is documented and logged. The sanction notification goes to legal guardians and the custodial guardian per their rights (RG-13, RG-14) and to the adult student per their choices (RG-02, DEC-20). A temporary expulsion creates, for its duration, attendance records of type "exclusion (administrative absence)": the student stays on roll-call lists with this pre-filled status, with no absence notification and no attendance count (ARB-16); it never automatically triggers the enrollment's SUSPENDED state, reserved for the director's administrative measures (FR-INS-15), which the sanction can only propose. A temporary expulsion may justify exclusion from rank calculation (FR-VSC-22). |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §7.4; RG-13, RG-14, RG-02; DEC-20; RG-38; ARB-16 |
| Actors | Head supervisor, director |

```gherkin
Feature: A graduated sanction and its notification
  Scenario: Notifying a sanction to authorized guardians
    Given a "medium"-severity incident recorded for a 2AC student
    And a written-warning decision made by student life
    When the sanction is recorded in the student's file
    Then authorized legal guardians are notified with the nature of the sanction
    And the notification states the school's internal channels of appeal
    And recording and sending the sanction are logged with author, context, and timestamp (RG-38)
    And no data about this incident is visible to any other family or school (RG-29)

  Scenario: Suppressing a disciplinary notification to a parent restricted by the adult student
    Given an adult student who has restricted their parent's disciplinary access (RG-02, DEC-20)
    When a sanction is recorded in this student's file
    Then no disciplinary notification is sent to this parent
    And the restriction is restated in the record and logged
```

### FR-VSC-16 — Issue student-life summonses

| Attribute | Value |
|---|---|
| Description | Student life and the director issue summonses (disciplinary interview, disciplinary council, meeting with guardians) with date, time, purpose, recipients, and read tracking. The summons is carried by the COM module (`SummonsIssued` event, read tracking, bilingual templates): `prd/modules/17-communication-notifications.md`. A meeting can be rescheduled with a version history. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §7.4, §7.8; `SummonsIssued` event in `prd/03-domain-data-model.md` §7; BES-SUR-05 |
| Actors | Head supervisor, director, parent, adult student |

### FR-VSC-17 — Conduct a disciplinary council with minutes

| Attribute | Value |
|---|---|
| Description | The disciplinary council (`DisciplinaryCouncil`) is conducted within the module: summoning members and guardians, a session file (incidents, prior sanctions, academic-context elements), deliberation, decision, and numbered bilingual minutes attached to the student's file. The decision may justify an expulsion (an enrollment transition, `prd/03-domain-data-model.md` §3). The minutes and the deliberation are internal, non-portable data (RG-29), and every access is logged (RG-38). |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §7.4; RG-29, RG-38; `prd/03-domain-data-model.md` §2.4 |
| Actors | Director (chair), student life, homeroom teacher, parent, adult student |

### FR-VSC-18 — Keep the per-period conduct grade

| Attribute | Value |
|---|---|
| Description | The conduct grade (`ConductGrade`) is entered per evaluation period, on the school's scale (proposed by the homeroom teacher, validated by student life or the director, per configuration). It is passed to the EVA module to appear on the period's report card (`prd/modules/14-assessments-grades-report-cards.md`). Whether it factors into the overall average is a parameter (OQ-04). The conduct grade is non-portable (RG-29) and logged per period. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §7.4; RG-29; §6.8 |
| Actors | Homeroom teacher, head supervisor, director |

### FR-VSC-19 — Produce disciplinary statistics

| Attribute | Value |
|---|---|
| Description | The module calculates: number of incidents and sanctions by severity, by class, and by period; repeat-offense rate (students with at least two incidents in the period); average time between an incident and a decision; tracking of executed sanctions. These statistics feed class councils and parent-school meetings, respect scopes (RG-39), and are exportable. No statistic leaves the school, including to another school in the same group (RG-29, DEC-02). |
| Priority | Should |
| Version | V1 |
| Traceability | PROJECT.md §7.4; RG-29, RG-39 |
| Actors | Director, head supervisor |

### FR-VSC-20 — Ensure the non-portability and confidentiality of disciplinary data

| Attribute | Value |
|---|---|
| Description | Disciplinary data (incidents, sanctions, councils, conduct) is never portable or visible outside the originating school: excluded from the default transfer profile (RG-31, INV-23), from the PDF leaving file, and from any inter-school sharing, including within a school group (RG-29, INV-21, DEC-08). Any explicit transfer remains at the legal guardian's discretion within the limits of RG-30/31 and never includes an in-progress procedure. The adult student may restrict parental access to disciplinary data (RG-02, DEC-20, INV-35): disciplinary notifications to that parent are then suspended. The parent and the student retain read access to their published data per their rights (RG-28, INV-20). |
| Priority | Must |
| Version | V1 (constraint active as soon as the data exists) |
| Traceability | RG-29, RG-31, RG-02, RG-30; DEC-08, DEC-20; G-14; INV-21, INV-23, INV-35 |
| Actors | Director, student life, parent, adult student |

### FR-VSC-21 — Log student-life entries and access

| Attribute | Value |
|---|---|
| Description | At MVP, every roll-call entry (confirmation, correction, discrepancy arbitration) and justification entry (submission, front-desk entry, decision) carries author, context, and timestamp at the record level, append-only: post-confirmation roll-call corrections create a distinct trace (the correction's author, original value, reason) instead of overwriting the entry; these traces are immutable (D4, ARB-25j). At V1, all entries (roll call, justification, incident, sanction, council decision, conduct grade) and access to the disciplinary record are logged in the exportable audit log (AuditLog, RG-38, INV-33), reserved for the director and for audits. |
| Priority | Must |
| Version | MVP (immutable history of roll-call and justification entries); disciplinary access and log export: V1 (D4, ARB-25j) |
| Traceability | RG-38; INV-33; PROJECT.md §9; OQ-07; ARB-25j |
| Actors | Director (viewing), platform (operations) |

```gherkin
Feature: Logging student-life entries (MVP)
  Scenario: A roll-call correction logged with no overwrite
    Given a roll call confirmed at 8:06am by the teacher with Sara marked absent
    When student life corrects Sara's status to "present" with the reason "entry error"
    Then the original entry remains viewable, and a correction trace is added with author, original value, reason, and timestamp
    And no trace can be edited or deleted by a school user
```

### FR-VSC-22 — Exclude a student from rank calculation via configuration

| Attribute | Value |
|---|---|
| Description | When a student is subject to a temporary expulsion or a prolonged absence, the director may exclude them from their class's rank calculation for the period concerned: the rank is then computed without them, and their report card shows no rank for the period. This choice is configurable (whether or not to enable the option per school), dated, documented, reversible, and logged (RG-38). The decision sets the "excluded from rank" indicator carried by `PeriodResult`; the actual rank calculation, its effect on the report card, and the indicator itself are owned by FR-EVA-09 in `prd/modules/14-assessments-grades-report-cards.md` (ARB-17e). |
| Priority | Should |
| Version | V1 |
| Traceability | PROJECT.md §7.4, §7.5; ARB-17e; FR-EVA-09 |
| Actors | Director |

### FR-VSC-23 — Recognize rewards and commendations

| Attribute | Value |
|---|---|
| Description | Student life's positive side (§6.8: rewards) allows recording distinctions, commendations, and positive remarks in the student's file, visible to the parent and the student per their rights, with no inter-school portability beyond the general rules. This requirement rounds out the sometimes purely punitive reading of student life; baseline §6.8 lists rewards among student-life data with no later-version marker, so the requirement is attached to V1 "full discipline and student life" with low priority. |
| Priority | Could |
| Version | V1 |
| Traceability | PROJECT.md §6.8, §12 |
| Actors | Director, student life, homeroom teacher |

### FR-VSC-24 — Record a justification at the front desk on a guardian's behalf

| Attribute | Value |
|---|---|
| Description | Student life (or the front office, per permissions) records an absence justification on behalf of a guardian who delivered it on paper or declared it verbally at the front desk (the majority case: a medical certificate brought by the student, a parent with no claimed account — ARB-15d): student, absences concerned, reason, an optional scanned document, the declaring guardian, delivery method (paper, verbal, phone). The justification is marked "entered by the school" and then follows the same validation flow as a parent's (FR-VSC-08); the guardian, if they have an account, is notified and can view it. A front-desk justification cannot be attributed to a guardian whose access is restricted (RG-14). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.4; RG-14, RG-38; ARB-15d; BES-SUR-03 |
| Actors | Head supervisor, front office, parent (notification) |

```gherkin
Feature: Front-desk justification (MVP)
  Scenario: A medical certificate delivered by the student
    Given Omar absent Monday and Tuesday, whose father has not yet claimed his account
    When the supervisor records at the front desk a scanned medical certificate on the father's behalf for these two days
    Then a justification "entered by the school" is created for the two absences with method "paper"
    And it appears in the validation queue, and once validated, both absences are marked justified
    And the father, once he claims his account, sees the justification and its decision
```

### FR-VSC-25 — Group absence notifications by day, hold before sending, and issue correction notices

| Attribute | Value |
|---|---|
| Description | The absence-notification sending mechanics (ARB-15): (a) **grouping** — an absent student triggers only one notification per day (or per half-day, per cycle), on their first absence; subsequent absences that day feed a per-student **evening summary** (missed sessions, tardiness), sent on the in-app channel and, per configuration, SMS or WhatsApp; (b) **retention** — sending is delayed by 3 minutes (configurable, bounded to respect the 5-minute cap) after the server receives the roll call; during this window, a roll-call correction cancels the send with no trace reaching the family; (c) **correction notice** — any correction made after sending (a student ultimately present, tardiness reclassified, a discrepancy arbitration under FR-VSC-03) produces a bilingual correction message on the same channel, referenced to the original notification, and updates the delivery log; (d) **cost** — grouping and retention reduce billable sends; every send, including a correction notice, produces a `DeliveryLog` with its cost; (e) **discrepancy** — no notification is sent while a roll-call discrepancy is open (FR-VSC-03). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.4, §10; DEC-36; ARB-15a, ARB-15b, ARB-15e; FR-VSC-03, FR-VSC-04, FR-VSC-06; FR-COM-11 (`prd/modules/17-communication-notifications.md`) |
| Actors | Parent, custodial guardian, adult student, head supervisor |

```gherkin
Feature: Retention and correction notices (MVP)
  Scenario: A false positive corrected during the retention window
    Given a roll call received server-side at 8:06am with Sara marked absent by mistake
    When the teacher corrects the roll call at 8:08am to mark Sara present
    Then no notification is sent to Sara's guardians, and the correction is logged
  Scenario: A correction notice after sending
    Given an absence notification for Sara delivered at 8:10am
    When student life corrects the roll call at 8:30am to mark Sara present
    Then a correction message is sent to the same guardians on the same channel, referenced to the original notification
    And the delivery log carries the original send, the correction notice, and their costs
  Scenario: The evening summary
    Given Omar notified absent at 8:10am, then absent for the next five sessions
    When the configured summary time (6pm) is reached
    Then his guardians receive a single summary listing the six missed sessions
```

---

## 5. Morocco-Specific Considerations

1. **School time.** A Monday-to-Saturday-noon week at many private schools (§2.4); half-day roll call distinguishes morning (including a working Saturday morning) from afternoon. Schedule variants (normal, reduced-hours Ramadan, exams) change slots: roll call follows the day's declared session (a simple per-variant grid at MVP, a timetable at V1), owned by `prd/modules/12-academic-structure-timetables.md`.
2. **Time zone — baseline correction.** Baseline §2.4/§10 still provides for "UTC+1 with a return to UTC+0 during Ramadan"; Decree No. 2.26.530 (Official Gazette No. 7521 of 29/06/2026) sets a **final return to UTC+0 on 20/09/2026**, with no seasonal alternation (see `prd/research/00-baseline-corrections.md` note 1). The module uses `Africa/Casablanca` at permanent UTC+0, with roll-call and notification timestamps in UTC: see OQ-01.
3. **Channels to families.** WhatsApp is used by 98.6% of Moroccan internet users; household internet reaches 78.4% in rural areas versus 93.6% in urban areas (ANRT 2024-2025, `prd/research/05-infrastructure-usage.md`): SMS remains a critical fallback for the rural digital divide and for households without a smartphone (DEC-36). Sending via WhatsApp requires the parent's opt-in (Law 09.08, CNDP-ANRT 2019 guidance), and utility pricing changes on 01/10/2026 (`prd/research/03-payments-communications.md`): costs logged per send and a configured pricing-shift parameter (pricing-shift parameter: INT-WAP-04, `prd/cross-cutting/35-external-integrations.md` §6).
4. **Unstable classroom connections** (§2.10) and teachers with no computer in class: fault-tolerant mobile roll call (FR-VSC-02, `NFR-OFF` domain) is not a convenience option but the actual condition of use; the interface stays usable on low bandwidth.
5. **Head-supervisor practice.** The baseline (persona Rachid, §5.2) describes phoning the parents of absentees "before 10am": automation within 5 minutes with logging (RG-38) replaces this workload without removing the human follow-up for notification failures (FR-VSC-04).
6. **Message language.** Notifications and justifications are bilingual FR/AR with full RTL (DEC-10); Arabic is the mother tongue of most families, French that of bilingual schools: the priority language is configured per school and, where needed, per recipient.
7. **Retention.** Attendance and discipline: kept until end of schooling plus 2 years, then anonymized (DEC-22); justification attachments follow the same fate as the justified absence.

---

## 6. Data and Events

**Entities used** (dictionary in `prd/03-domain-data-model.md` §2.4, §2.6, §2.7, per the baseline's §6.10 schema):

| Entity | Role in the module | Key rules |
|---|---|---|
| `AttendanceRecord` | An attendance event: absence, tardiness, early departure, exempt, exclusion (administrative absence, ARB-16); tied to the session (`Session`, FR-PED-20) or to the half-day | Always tied to an enrollment (INV-27); fault-tolerant mobile entry; corrections logged (RG-38) |
| `Session` | Course × date × slot, status (expected, held, not held, substituted); underpins roll call per course | Owned by `prd/modules/12-academic-structure-timetables.md` (FR-PED-20, FR-PED-21); only one roll call per session |
| `Justification` | A parent's justification, or one entered at the front desk on the parent's behalf (FR-VSC-24): reason, attachment, delivery method, validation | Statuses: submitted, validated, refused; tied to an `AttendanceRecord` |
| `Dispensation` | An activity exemption: period, reason | Not counted as an absence |
| `Incident` | A disciplinary fact: date, severity, description | Non-portable (RG-29, DEC-08); retained until end of schooling + 2 years, then anonymized (DEC-22) |
| `Sanction` | A graduated sanction: type, duration, decision, execution tracking | Non-portable (RG-29, RG-31); tied to an `Incident` |
| `DisciplinaryCouncil` | A disciplinary council: members, deliberation, minutes, decision | May justify an enrollment transition (§6.3); V1 |
| `ConductGrade` | The conduct grade: period, value | Non-portable (RG-29); passed to the report card via EVA |
| `Notification`, `DeliveryLog` | Attendance and disciplinary notifications; channel, status, cost | Produced by every send; delay < 5 min for an absence |
| `AuditLog` | Log of sensitive entries and access | Immutable, exportable, 5 years (RG-38, INV-33, DEC-22); at MVP, immutable, record-level history of entries; disciplinary access and export at V1 (D4, ARB-25j) |

**Domain events** produced or consumed (catalog in `prd/03-domain-data-model.md` §7):

| Event | Producer | Consumers and effects |
|---|---|---|
| `AbsenceRecorded` | VSC (roll call confirmed and received server-side) | Guardians (notification within 5 min for the day's first absence, after a 3-min retention window; an evening summary for subsequent ones; a correction notice if amended — FR-VSC-25), teacher, director; COM routing |
| `SessionNotHeld` | PED (FR-PED-21) | Student life: the session drops out of expected roll calls; consumed by roll-call rates |
| `JustificationSubmitted` | Parent (portal) | Student-life processing queue; acknowledgment to the parent |
| `JustificationValidated` | Student life | Parent (status), attendance counters |
| `AbsenceThresholdReached` | VSC | Director, head supervisor, guardians (per configuration) |
| `IncidentRecorded` | VSC | Authorized guardians, director |
| `SanctionNotified` | VSC | Authorized guardians per their rights, adult student |
| `SummonsIssued` | VSC or the director | Parent via COM, with read tracking |

---

## 7. Key Screens

Text descriptions; detailed design is in `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` (mobile-first, full RTL, FR/AR).

**ECR-VSC-01 — Mobile roll call for a course (MVP).** A full-screen phone view for a teacher or supervisor. Header area: course or class, date, session (an expected slot or one chosen on the fly, FR-PED-20), headcount. Connection status banner: "online," "offline — N roll calls pending sync" (FR-VSC-02). Body: the student list (photo, name in the usual script, short code), a per-student status via three quick buttons Present / Absent / Tardy, "Present" pre-selected, a pre-filled and locked "exclusion" status for a temporarily expelled student; name search for large classes. Footer: an absentee and tardy count, a "Confirm Roll Call" button with a confirmation screen if absences are recorded. After confirmation: a read-only roll call with a logged correction window (FR-VSC-21). States: list loading, offline, sync pending, confirmed, discrepancy detected (linking to ECR-VSC-02). Arabic version: RTL interface, names in Arabic script.

**ECR-VSC-02 — Daily summary and discrepancies (MVP).** A student-life screen (mobile and web): by class or by cycle per authorizations (RG-39), expected sessions (FR-PED-20), roll calls received, pending, sessions not held (FR-PED-21); a list of the day's absentees with notification status (in retention, sent, delivered, failed, corrected) and a follow-up action; a "front-desk justification" button (FR-VSC-24); a queue for the day's tardiness and departures (V1 details); a queue of sync discrepancies with both timestamped versions and student-by-student arbitration (MVP, ARB-15e). Covers BES-SUR-07 (MVP).

**ECR-VSC-03 — Parent justification (MVP).** A mobile screen in the parent portal: a list of the selected child's absences and tardiness to justify (multi-child selector), a justification form (a reason from a configurable list, a free comment, an attachment via camera or file), the current status of each justification (submitted, validated, refused with a reason). Bilingual FR/AR.

**ECR-VSC-04 — Justification validation queue (MVP).** A student-life screen: a queue sorted by age, filters by class, status, origin (parent, front desk), and period; opening a justification with a viewable attachment; "Validate" / "Refuse" actions with a comment; a logged decision. Access limited to authorized cycles (RG-39).

**ECR-VSC-10 — Front-desk justification (MVP, web and mobile).** A student-life form: student search, selecting the absences to justify (checkboxes on a timeline), the declaring guardian, delivery method (paper, verbal, phone), reason, scanning the document via the camera; recorded with status "submitted — entered by the school," then direct validation is possible by the same staff member if their permissions allow it (FR-VSC-24).

**ECR-VSC-05 — Student attendance record (MVP read, V1 full).** A chronological year view (a calendar with absences, tardiness, departures, exemptions), per-type counters, thresholds reached and alerts, a history of justifications and their decisions. Visible to the parent and the student per their rights (RG-14, RG-28); visible to student life and the director per scope; disciplinary-record access is logged (RG-38).

**ECR-VSC-06 — Incident and sanction (V1).** An incident form (student, date, context, severity, factual description, witnesses) reportable from the teacher side; an incident record view with graduated decisions proposed per the school's scale; sanction-execution tracking; notifications sent are shown.

**ECR-VSC-07 — Disciplinary council (V1).** A session file: summonses issued, the student's prior incidents and sanctions (school scope only), deliberation, decision, numbered bilingual minutes, editable then locked; any reopening is logged.

**ECR-VSC-08 — Student-life statistics (V1).** The module's dashboard: absenteeism rate by class, level, and period; validated justifications; average notification delay; disciplinary repeat offenses; Excel/CSV exports. Consolidated, multi-site views are owned by `prd/modules/20-dashboards-reporting.md`.

**ECR-VSC-09 — Student-life configuration (MVP for notifications, V1 for the rest).** Per-cycle settings: roll-call mode (session or half-day), notification-grouping granularity (day, half-day), the retention window, the evening-summary time, recipients, quiet hours (with no effect on attendance), the channel hierarchy and consents (cross-reference COM), alert thresholds, the severity and sanction scale, enabling rank exclusion, the roll-call correction window. Reserved for the director (fine-grained permissions, `prd/cross-cutting/30-roles-permissions-matrix.md`).

---

## 8. Integrations

| Integration | Role in the module | Cross-reference |
|---|---|---|
| `INT-WAP` (WhatsApp Business Platform) | "Utility" WhatsApp channel for absence, threshold, and sanction notifications, on consent; approved templates; the 01/10/2026 pricing shift configured | `prd/cross-cutting/35-external-integrations.md`, `prd/modules/17-communication-notifications.md`, `prd/research/03-payments-communications.md` |
| `INT-SMS` (Moroccan aggregator) | Critical notification fallback; alphanumeric sender ID; the school's SMS credit with counters and threshold alerts | `prd/cross-cutting/35-external-integrations.md`, `prd/modules/17-communication-notifications.md` |
| Push notifications | No push notification at MVP (ARB-21b); the first channel from V1 (installed PWA, then native apps) | `prd/modules/17-communication-notifications.md`, PROJECT.md §10, §12 |
| Email (`INT-EML`) | An optional secondary channel if the address is on file (DEC-12) | `prd/modules/17-communication-notifications.md` |
| Massar | No attendance flow provided for in the baseline (§7.12: grades and headcounts); left open in OQ-03 | `prd/modules/21-massar-regulatory-exports.md` |

---

## 9. Module-Specific Non-Functional Requirements

| Domain | Requirement applied to this module | Cross-reference |
|---|---|---|
| `NFR-OFF` | Roll call fully usable offline, automatic sync, lossless convergence of concurrent entries; a persistent queue on the device | `prd/cross-cutting/32-non-functional-requirements.md`; PROJECT.md §10 |
| Notification delay | Absence notified in under 5 minutes after the server receives the roll-call confirmation, including at start-of-year peak load (definition shared with NFR-MOB-03) | PROJECT.md §10; NFR-MOB-03 (`prd/cross-cutting/32-non-functional-requirements.md`, aligned on the same definition); `prd/journeys/00-journey-map.md` §4.2 |
| `NFR-PERF` | A class's roll-call list shown in under 2s on 4G mobile; roll-call confirmation confirmed locally in under one second, even offline | PROJECT.md §10 |
| Logging | At MVP, immutable, record-level history of roll-call and justification entries (D4, ARB-25j); at V1, logged disciplinary-record access and an exportable AuditLog | RG-38; INV-33; PROJECT.md §9 |
| Least privilege | A teacher limited to their courses; a supervisor limited to their cycles; systematic server-side enforcement | RG-39; INV-34, INV-17 |
| Low bandwidth | A roll-call interface usable on a degraded network: preloaded lists, deferred thumbnails, reduced payloads | PROJECT.md §2.10; `prd/research/05-infrastructure-usage.md` |
| Time zone and timestamps | UTC timestamps for roll calls and notifications; `Africa/Casablanca` display at permanent UTC+0 (OQ-01) | `prd/research/00-baseline-corrections.md` note 1 |
| Retention | Attendance and discipline: end of schooling + 2 years then anonymized; logs 5 years | DEC-22 |
| Accessibility and RTL | Contrast, font sizes, keyboard navigation on the web validation queue; full Arabic RTL | PROJECT.md §10; `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` |

---

## 10. Success Metrics

Module-specific indicators (`KPI-…` numbers are assigned in `prd/cross-cutting/38-kpi-success-metrics.md`):

- Share of roll calls confirmed before the configured deadline (service target: roll call taken within the first 15 minutes of the slot) — measured per school.
- Median and 95th-percentile delay between the server receiving the roll call and the notification being delivered (the service commitment is 5 minutes, PROJECT.md §10).
- Notification failure rate and the associated human follow-up delay.
- Share of absences justified within 48 hours; average time for student life to process the queue.
- Attendance rate (single definition, ARB-24a: (expected sessions − absences) / expected sessions, over declared sessions not marked "not held"; a variant excluding justified absences) by class and by period; trend in disciplinary repeat offenses after processing.
- Adoption: share of roll calls taken on mobile in offline mode at least once a week (validates the value of NFR-OFF).

---

## 11. Open Questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Baseline/research divergence on the time zone. | **Escalated — ESC-03** (`prd/cross-cutting/42-review-arbitrations.md`): the chapter retains permanent UTC+0 (Decree No. 2.26.530), UTC timestamps; the baseline update is grouped under ESC-03. |
| OQ-02 | Version of manual arbitration for sync conflicts. | **Resolved — ARB-15e**: the first confirmation governs the notification; the second opens a discrepancy arbitrated student by student by student life from MVP (FR-VSC-03, ECR-VSC-02), with a correction notice where needed (FR-VSC-25). |
| OQ-03 | Exporting attendance to Massar: baseline §7.12 cites no attendance flow, and the research confirms no API exists (H-04). Should an Excel export of absences in Massar's format be provided for schools that also enter it on the ministry side? To be gathered from the pilots. | §8, `prd/modules/21-massar-regulatory-exports.md` |
| OQ-04 | Does the conduct grade factor into the overall average (a configurable weight) or does it appear separately on the report card? Baseline §2.5 defines the average via subject coefficients with no mention of conduct. Proposal: shown separately by default, with average inclusion as a school option; to be decided with `prd/modules/14-assessments-grades-report-cards.md`. | FR-VSC-18; a twin question to OQ-08 in `prd/modules/14-assessments-grades-report-cards.md`, single arbitration at review |
| OQ-05 | National regulatory absence threshold (year or exam exclusion for absences): no text in the baseline or the research. Pending confirmation, the alert threshold remains a school-level parameter with no "regulatory" status. | FR-VSC-09 |
| OQ-06 | Printed late passes: should a thermal-printed or QR late pass be given to the student at the end of the half-day, or does the digital record suffice? To decide per the pilots' equipment (DEC-35). | FR-VSC-10 |
| OQ-07 | Version of logging. | **Resolved — D4, ARB-25j**: immutable, record-level history of roll-call and justification entries at MVP; disciplinary-record access log and export at V1 (FR-VSC-21); SEC-11 and PER-10 aligned. |
| OQ-08 | Version of the WhatsApp channel for attendance notifications. | **Resolved — D1, ARB-21, ARB-25c**: at MVP, "utility" WhatsApp limited to attendance notifications under express opt-in (the basis for cross-border transfer), minimal templates, alongside in-app and SMS, with no push; V1 = generalization. |
| OQ-09 | Sessions with no timetable at MVP. | **Resolved — ARB-04, ARB-05**: roll call per course is tied to a declared session (FR-PED-20); sessions not held (FR-PED-21) drop out of expected roll calls; the V1 timetable generates sessions. |

---

## 12. Traceability

| Baseline ID | Covered in this file |
|---|---|
| PROJECT.md §7.4 (VSC module) | FR-VSC-01 to FR-VSC-25; screens ECR-VSC-01 to ECR-VSC-10 |
| PROJECT.md §6.8 (contextualized data) | §6 (entities and events); FR-VSC-23 |
| PROJECT.md §6.9 / RG-29 / RG-31 (non-portability) | FR-VSC-20; FR-VSC-14, FR-VSC-17, FR-VSC-18, FR-VSC-19; INV-21, INV-23 (`prd/03-domain-data-model.md`) |
| RG-02 / DEC-20 (adult student) | FR-VSC-04, FR-VSC-15, FR-VSC-20 |
| RG-13 / RG-14 (notification recipients) | FR-VSC-04, FR-VSC-06, FR-VSC-15 |
| RG-28 (permanent read access) | FR-VSC-20, ECR-VSC-05 |
| RG-38 (logging) | FR-VSC-21 (MVP: immutable entry history; V1: access and export — D4); FR-VSC-03, FR-VSC-08, FR-VSC-11, FR-VSC-15, FR-VSC-22, FR-VSC-24 |
| RG-39 (least privilege) | FR-VSC-01, FR-VSC-08, FR-VSC-13, FR-VSC-19; ECR-VSC-01, ECR-VSC-04 |
| DEC-08 (discipline non-portable) | FR-VSC-20 |
| DEC-10 (bilingual FR/AR) | FR-VSC-04; §5 (point 6); screens |
| DEC-12 (channels) | FR-VSC-05; §8 |
| DEC-22 (retention) | FR-VSC-07; §5 (point 7), §9 |
| DEC-36 (push/WhatsApp/SMS hierarchy) | FR-VSC-05; §5 (point 3), §8 |
| G-14 (student-life data portability decided) | FR-VSC-20 (the whole chapter) |
| PROJECT.md §10 (offline, delay < 5 min, exports, accessibility) | FR-VSC-02, FR-VSC-03, FR-VSC-04; §9 |
| PROJECT.md §12 (scope by version) | "Version" column of requirements (MVP: FR-VSC-01, 02, 03, 04, 05 (partial), 06, 07, 08, 21 (entry history), 24, 25; V1: full discipline and student life, rewards (FR-VSC-23), logged access, channel generalization; see OQ-07 and OQ-08) |
| H-11 (families' WhatsApp usage) | §5 (point 3) |
| BES-SUR-01 to BES-SUR-07, BES-ENS-02, BES-PAR-02, BES-PAR-05, BES-GAR-05 | §2; FR-VSC-01 to FR-VSC-08, FR-VSC-10, FR-VSC-14 to FR-VSC-16, FR-VSC-24, FR-VSC-25; ECR-VSC-02 (BES-SUR-07, MVP) |
| ARB-04, ARB-05 (declared sessions, sessions not held) | FR-VSC-01; §1, §5, §6; OQ-09 |
| ARB-15 (grouping, retention, correction notice, front-desk justification, discrepancies, preschool) | FR-VSC-03, FR-VSC-04, FR-VSC-06, FR-VSC-24, FR-VSC-25; ECR-VSC-02, ECR-VSC-10; OQ-02 |
| ARB-16 (temporary expulsion and SUSPENDED) | FR-VSC-01, FR-VSC-15; §6 |
| ARB-17e (rank exclusion owned by FR-EVA-09) | FR-VSC-22 |
| ARB-21 (no push at MVP, per-person language, sending windows) | FR-VSC-04, FR-VSC-06; §8 |
| ARB-24a (attendance-rate definition) | §10 |
| ARB-25j (D4 logging) | FR-VSC-21; §6, §9; OQ-07 |
| Domain events (`prd/03-domain-data-model.md` §7) | §6 (AbsenceRecorded, JustificationSubmitted/Validated, AbsenceThresholdReached, IncidentRecorded, SanctionNotified, SummonsIssued) |
