> **Document Control**
>
> | Property       | Value                                                                                                                                                                                                                                   |
> | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-04                                                                                                                                                                                                                          |
> | Revision       | 1.0                                                                                                                                                                                                                                     |
> | Effective Date | 2026-09-09                                                                                                                                                                                                                              |
> | Status         | Draft                                                                                                                                                                                                                                   |
> | Author         | ZSchool Product                                                                                                                                                                                                                         |
> | Classification | Functional Specification                                                                                                                                                                                                                |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/13-attendance-student-life-discipline.md` (v0.3), old `FR-VSC-01..25` -> `BEH-ZS-081..105`, old `ECR-VSC-01..10` -> `SCR-ZS-051..060`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Attendance, Student Life, and Discipline (VSC)

This module covers the daily chain of attendance and student life: taking attendance on mobile, automatically notifying guardians of an absent student, justifying absences, tracking tardiness, early departures and exemptions, then, at V1, full disciplinary processing (incidents, graduated sanctions, summonses, disciplinary council, conduct grade) and statistics. It carries the critical journey JMP-ZS-005 (morning roll call and absence notification, `spec/journeys/00-journey-map.md`).

The guiding principle is **child safety**: a student's absence must reach their family in under 5 minutes after roll call is confirmed, even when the classroom's network connection is unstable, which requires roll call to be fault-tolerant with synchronization and conflict resolution.

## 1. Objective and scope

**In scope:**

| Subject                                                                                                                                                                                                                                                                                           | Version                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Roll call per declared session (course × date × slot, BEH-ZS-070 in `spec/behaviors/03-academic-structure-timetables.md`, [ADR-ZS-045](../decisions/045-attendance-session-without-timetable.md)) or per half-day, on mobile, for teachers and student life; a "tardy" state entered at roll call | MVP                                                                                                                                                                                               |
| Offline mode, synchronization, a conflict-resolution rule, and arbitration of discrepancies by student life ([ADR-ZS-056](../decisions/056-absence-notification-rules.md))                                                                                                                        | MVP                                                                                                                                                                                               |
| Automatic notification of guardians within 5 minutes of roll call confirmation, limited to the first absence of the day (or half-day), a 3-minute retention window, a correction notice after a fix, an evening summary                                                                           | MVP                                                                                                                                                                                               |
| A justification recorded at the front desk by student life on a guardian's behalf                                                                                                                                                                                                                 | MVP                                                                                                                                                                                               |
| Student life's daily summary: expected and received roll calls, absentees, notification status (URS-ZS-024)                                                                                                                                                                                       | MVP                                                                                                                                                                                               |
| Full multi-channel routing (push, WhatsApp, SMS) per preferences and consents                                                                                                                                                                                                                     | V1 — generalization (all messages, managed templates, push); at MVP: in-app, SMS, and "utility" WhatsApp limited to attendance notifications (minimal templates) — historical alias D1, OQ-ZS-078 |
| Absence justification by the parent with an attachment, validated by student life                                                                                                                                                                                                                 | MVP                                                                                                                                                                                               |
| Configuring notification rules (delay, thresholds, recipients)                                                                                                                                                                                                                                    | MVP                                                                                                                                                                                               |
| Attendance-rate alert thresholds and threshold-breach alerts                                                                                                                                                                                                                                      | V1                                                                                                                                                                                                |
| Tardiness: duration, reason, late passes, tardiness notification; early departures; exemptions (PE)                                                                                                                                                                                               | V1                                                                                                                                                                                                |
| Attendance statistics (rate by class, by period)                                                                                                                                                                                                                                                  | V1                                                                                                                                                                                                |
| Discipline: incidents, warnings, graduated sanctions, summonses, disciplinary council, conduct grade                                                                                                                                                                                              | V1                                                                                                                                                                                                |
| Disciplinary statistics (repeat offenses, by class)                                                                                                                                                                                                                                               | V1                                                                                                                                                                                                |
| Non-portability and logging of disciplinary data                                                                                                                                                                                                                                                  | V1 (constraint active as soon as the data exists)                                                                                                                                                 |
| Immutable, record-level history of roll-call and justification entries (historical alias D4, [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md))                                                                                                                        | MVP (disciplinary-record access log and audit-log export: V1)                                                                                                                                     |
| Excluding a student from rank calculation via configuration (indicator owned by BEH-ZS-119, [ADR-ZS-058](../decisions/058-grading-calculation-rules-mvp.md))                                                                                                                                      | V1                                                                                                                                                                                                |
| Rewards and commendations (student life's positive side)                                                                                                                                                                                                                                          | V1 (Could)                                                                                                                                                                                        |
| A justification recorded at the front desk on a guardian's behalf (BEH-ZS-104, [ADR-ZS-056](../decisions/056-absence-notification-rules.md))                                                                                                                                                      | MVP                                                                                                                                                                                               |
| Grouping absence notifications by day, a 3-minute retention window, a correction notice, an evening summary (BEH-ZS-105, [ADR-ZS-056](../decisions/056-absence-notification-rules.md))                                                                                                            | MVP                                                                                                                                                                                               |

**Out of scope (cross-references):** calculating averages and rank, and publishing report cards, are owned by `spec/behaviors/05-assessments-grades-report-cards.md`; notification channels, message templates, parent–teacher threads, and communication-sense summonses are owned by `spec/behaviors/08-communication-notifications.md`; declared sessions (BEH-ZS-070), sessions not held and substitutions (BEH-ZS-071), timetables and their variants (normal, Ramadan, exams) are owned by `spec/behaviors/03-academic-structure-timetables.md`; management dashboards are owned by `spec/behaviors/11-dashboards-reporting.md`; transport and canteen check-in are owned by `spec/behaviors/13-ancillary-services.md` (V2+); health data and medical certificates in the strict sense are owned by `spec/behaviors/14-health-sensitive-data.md` (V2+); offline grade entry is owned by the EVA module (`spec/behaviors/05-assessments-grades-report-cards.md`) under the same NFR principles.

## 2. Users and use cases

| Actor                                | Use case in this module                                                                                                                                                                               | Needs cited                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Teacher (ENS)                        | Taking roll call for their courses on their phone at the start of a session, including offline; reporting classroom incidents at V1                                                                   | URS-ZS-027, URS-ZS-018                 |
| Head supervisor / student life (SUR) | Roll call per class or half-day, the daily summary, following up with families, validating justifications, tardiness and late passes, full discipline within their cycle scope                        | URS-ZS-018 to URS-ZS-024               |
| Director (DIR)                       | Configuration (roll-call modes, delays, thresholds, channels, rank exclusion), reviewing statistics, summonses, disciplinary council, arbitrating roll-call discrepancies                             | URS-ZS-007 (fine-grained permissions)  |
| Front office (SEC)                   | Viewing the day's attendance and a student's record at a family's request, with no write access                                                                                                       | `spec/cross-cutting/01-permissions.md` |
| Parent / guardian (PAR, GAR)         | Receiving the absence notification within 5 minutes, justifying with an attachment from mobile, viewing their child's attendance, receiving summonses and disciplinary notifications per their rights | URS-ZS-035, URS-ZS-038, URS-ZS-048     |
| Student (ELE)                        | Viewing their own attendance per their access level; on reaching majority, controlling the sharing of disciplinary data with their guardians                                                          | URS-ZS-051, URS-ZS-055                 |

The historical baseline's head supervisor (Rachid) called the parents of absentees "before 10am": automation within 5 minutes replaces this phone workload while logging it ([INV-ZS-090](../invariants.md#inv-zs-090)).

## 3. Key journeys

- **JMP-ZS-005 — Morning roll call and absence notification to guardians** (`spec/journeys/00-journey-map.md`): the module's owning journey at MVP; actors are the teacher, the head supervisor, and parents; step details are in `spec/journeys/04-part-time-teacher.md` (taking roll call) and `spec/journeys/03-head-supervisor.md` (daily tracking).
- **JMP-ZS-011 — Communication: targeted announcement, summons, moderated parent–teacher message**: student-life summonses (V1) are issued from this module and carried by the COM module (`spec/behaviors/08-communication-notifications.md`); parent-side detail in `spec/journeys/05-multi-school-parent.md`.
- **JMP-ZS-006 — Grades, class council, report cards**: the conduct grade and rank exclusion feed into class councils and report cards (`spec/behaviors/05-assessments-grades-report-cards.md`); the adult student (Salma) views her record per her rights (`spec/journeys/07-students-minor-and-adult.md`).

This chapter does not duplicate the detailed journey steps owned by the persona journey files.

## 4. Functional behaviors

| ID         | Title                                                                                 | Priority |
| ---------- | ------------------------------------------------------------------------------------- | -------- |
| BEH-ZS-081 | Take roll call per course or per half-day on mobile                                   | Must     |
| BEH-ZS-082 | Synchronize roll call taken offline                                                   | Must     |
| BEH-ZS-083 | Resolve roll-call synchronization conflicts                                           | Must     |
| BEH-ZS-084 | Notify guardians of an absence within 5 minutes                                       | Must     |
| BEH-ZS-085 | Route notifications per preferences, consents, and fallbacks                          | Must     |
| BEH-ZS-086 | Configure the school's notification rules                                             | Must     |
| BEH-ZS-087 | Justify an absence with an attachment from the parent's mobile                        | Must     |
| BEH-ZS-088 | Validate or refuse justifications via student life                                    | Must     |
| BEH-ZS-089 | Trigger attendance alert thresholds                                                   | Should   |
| BEH-ZS-090 | Record tardiness and late passes                                                      | Must     |
| BEH-ZS-091 | Manage authorized early departures                                                    | Must     |
| BEH-ZS-092 | Manage activity exemptions (PE)                                                       | Must     |
| BEH-ZS-093 | Produce attendance statistics                                                         | Should   |
| BEH-ZS-094 | Record disciplinary incidents                                                         | Must     |
| BEH-ZS-095 | Decide warnings and graduated sanctions                                               | Must     |
| BEH-ZS-096 | Issue student-life summonses                                                          | Must     |
| BEH-ZS-097 | Conduct a disciplinary council with minutes                                           | Must     |
| BEH-ZS-098 | Keep the per-period conduct grade                                                     | Must     |
| BEH-ZS-099 | Produce disciplinary statistics                                                       | Should   |
| BEH-ZS-100 | Ensure the non-portability and confidentiality of disciplinary data                   | Must     |
| BEH-ZS-101 | Log student-life entries and access                                                   | Must     |
| BEH-ZS-102 | Exclude a student from rank calculation via configuration                             | Should   |
| BEH-ZS-103 | Recognize rewards and commendations                                                   | Could    |
| BEH-ZS-104 | Record a justification at the front desk on a guardian's behalf                       | Must     |
| BEH-ZS-105 | Group absence notifications by day, hold before sending, and issue correction notices | Must     |

### BEH-ZS-081: Take roll call per course or per half-day on mobile

> **Invariant:** [INV-ZS-091](../invariants.md#inv-zs-091) (least privilege)
> **See:** [ADR-ZS-045](../decisions/045-attendance-session-without-timetable.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-074`](../../features/vsc/fr-vsc-01-mobile-roll-call.feature)

REQUIREMENT: The teacher or student life MUST be able to take roll call from mobile: the
list of students enrolled in the course (or in the class for a half-day roll
call), a status per student (present, absent, tardy), "present" pre-selected
for speed, an absentee count, and a confirmation before submitting. Roll
call per course MUST be tied to a declared session (course × date × slot,
BEH-ZS-070) — only one session per triplet, so only one roll call per course
and per slot; roll call per half-day MUST be tied to the class and the
half-day. A temporarily expelled student MUST appear on the list with the
pre-filled status "exclusion (administrative absence)," non-editable and
without a notification. Confirmed roll call MUST carry the date, the session
or half-day, the class or course, the list of statuses, the author, and the
timestamp. Scope MUST respect least privilege: a teacher only calls roll for
their own courses, a supervisor only for their assigned cycles
([INV-ZS-091](../invariants.md#inv-zs-091), [INV-ZS-011](../invariants.md#inv-zs-011)).

Corrections after confirmation are logged, not overwritten (BEH-ZS-101).

### BEH-ZS-082: Synchronize roll call taken offline

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-075`](../../features/vsc/fr-vsc-02-offline-roll-call-sync.feature)

REQUIREMENT: Roll call MUST remain fully usable with no network: entries MUST be stored
on the device with a local timestamp, the interface MUST flag the offline
state and the pending sync queue, and the connection's return MUST
automatically trigger the transmission with no further user action.
Notification events (`AbsenceRecorded`) MUST be produced only once the roll
call is received server-side; the 5-minute delay MUST be measured from the
server's receipt of the confirmation.

Detailed non-functional requirements: `NFR-OFF` domain in `spec/cross-cutting/03-non-functional-requirements.md`.

### BEH-ZS-083: Resolve roll-call synchronization conflicts

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090) (audit logging)
> **See:** [ADR-ZS-056](../decisions/056-absence-notification-rules.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-076`](../../features/vsc/fr-vsc-03-roll-call-sync-conflicts.feature)

REQUIREMENT: Two concurrent entries for the same session (an offline teacher roll call
and a simultaneous student-life roll call or correction) MUST converge with
no loss: a discrepancy MUST be detected, both versions MUST be kept with
timestamps and authors; the first confirmation received server-side MUST
govern the notification (no second notification is issued); the second MUST
open a discrepancy in student life's queue (SCR-ZS-051, MVP), which they
arbitrate student by student; while a discrepancy is open, no further
notification MUST be sent; an arbitration that makes a student absent when
they were not in the first version MUST trigger the notification, the
reverse MUST trigger a correction notice (BEH-ZS-105). Any post-confirmation
change MUST be a logged correction (author, original value, reason,
BEH-ZS-101), producing a correction notice if the notification already went
out.

The rule is deterministic and guarantees, from MVP, that no roll call is ever lost or ambiguous.

### BEH-ZS-084: Notify guardians of an absence within 5 minutes

> **Invariant:** [INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065), [INV-ZS-052](../invariants.md#inv-zs-052)
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), [ADR-ZS-001](../decisions/001-adult-student-account-holder.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP (in-app, SMS, and "utility" WhatsApp limited to attendance notifications, minimal templates; generalization of channels and push at V1)
> **Acceptance:** [`@REQ-ZS-077`](../../features/vsc/fr-vsc-04-absence-notification-5-minutes.feature)

REQUIREMENT: On roll-call confirmation, an absence notification MUST be automatically
sent to each absent student's guardians for the first absence of the day (or
half-day, per cycle configuration, BEH-ZS-086): by default, to all legal
guardians and the custodial guardian ([INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065)),
unless the school has configured otherwise; to the adult student, who holds
their own rights ([INV-ZS-052](../invariants.md#inv-zs-052), [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)).
Subsequent absences by the same student on the same day MUST NOT trigger a
new send and MUST be grouped into the evening summary (BEH-ZS-105); in
preschool, the default MUST be a half-day summary. Sending MUST be preceded
by a 3-minute retention window allowing a false positive to be cancelled
(BEH-ZS-105), included within the 5-minute cap. The message MUST be in the
recipient's preferred language, MUST carry no other student's data, and MUST
state the date, the slot, and how to respond (justification). Every
notification MUST be delivered, or reach a final failure state, less than 5
minutes after the server receives the roll-call confirmation (aligned with
NFR-ZS-023 in `spec/cross-cutting/03-non-functional-requirements.md`); every
send MUST produce a `Notification` and a `DeliveryLog` (channel, status,
cost).

Per-channel routing is described in BEH-ZS-085.

### BEH-ZS-085: Route notifications per preferences, consents, and fallbacks

> **Invariant:** none
> **See:** [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** V1 (generalization: all messages, managed templates, push); MVP: in-app, SMS, and "utility" WhatsApp limited to attendance notifications — minimal templates — per consents, with no push
> **Acceptance:** [`@REQ-ZS-078`](../../features/vsc/fr-vsc-05-multichannel-notification-routing.feature)

REQUIREMENT: Attendance and student-life notifications MUST follow the channel
hierarchy: push first at V1, "utility" WhatsApp for parents who have opted
in, SMS via a Moroccan aggregator as the critical fallback for households
without a smartphone; the in-app record MUST remain the reference trace. At
MVP, the active channels MUST be limited to in-app, SMS, and "utility"
WhatsApp for attendance notifications with minimal templates; generalization
to all messages, template management, and push are V1. Routing MUST respect
the parent's communication preferences and WhatsApp consents (opt-in and
opposition, Law 09.08); every channel attempted, whether successful or
failed, MUST be logged with its cost.

Channel, template, and cost mechanics are detailed in `spec/behaviors/08-communication-notifications.md` and `spec/cross-cutting/06-external-integrations.md` (INT-WAP, INT-SMS).

### BEH-ZS-086: Configure the school's notification rules

> **Invariant:** [INV-ZS-064](../invariants.md#inv-zs-064)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-079`](../../features/vsc/fr-vsc-06-notification-configuration.feature)

REQUIREMENT: The director MUST be able to configure, per school (and per cycle where
needed): the roll-call mode per cycle (per session or per half-day), the
grouping granularity for absence notifications (day or half-day; preschool
default: half-day summary), the retention window before sending (default 3
minutes, bounded to respect the 5-minute limit), recipients (all legal
guardians and the custodial guardian by default), the evening summary's
time, the school's default language, and the channel hierarchy with its
fallback order. The school's quiet hours (sending windows) MUST NEVER apply
to attendance notifications, which MUST stay under the 5-minute cap; they
defer other messages instead. Settings MUST NEVER weaken this cap.

### BEH-ZS-087: Justify an absence with an attachment from the parent's mobile

> **Invariant:** [INV-ZS-001](../invariants.md#inv-zs-001), [INV-ZS-073](../invariants.md#inv-zs-073)
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-080`](../../features/vsc/fr-vsc-07-parent-justification-with-attachment.feature)

REQUIREMENT: The parent (or the custodial guardian, per their rights) MUST be able to
submit, from their mobile, a justification tied to the absence record:
reason, comment, attachment (a photo of the certificate or document, or a
file). The justification MUST be created with status "submitted," MUST
appear in student life's queue, and its status MUST remain visible to the
parent. The attachment MUST stay within the school's scope
([INV-ZS-001](../invariants.md#inv-zs-001), [INV-ZS-073](../invariants.md#inv-zs-073)) and MUST follow attendance's
retention period. The same record MAY receive several successive
justifications (`Justification` tied to `AttendanceRecord`).

### BEH-ZS-088: Validate or refuse justifications via student life

> **Invariant:** [INV-ZS-091](../invariants.md#inv-zs-091)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-081`](../../features/vsc/fr-vsc-08-justification-validation.feature)

REQUIREMENT: Student life MUST process the justification queue within their cycle scope
([INV-ZS-091](../invariants.md#inv-zs-091)): viewing the attachment, validating or refusing with
a reason. Validation MUST mark the absence record "justified"; a refusal
MUST leave the absence unjustified and countable in attendance counters
(alert thresholds at V1, BEH-ZS-089). Justifications recorded at the front
desk (BEH-ZS-104) MUST follow the same queue. Every decision MUST carry
author, context, and timestamp ([INV-ZS-090](../invariants.md#inv-zs-090)), and the parent MUST be
notified of the outcome. Justifications MUST remain editable as long as they
are in "submitted" status; after a decision, any revision MUST go through a
new, logged justification.

### BEH-ZS-089: Trigger attendance alert thresholds

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: The director MUST be able to set alert thresholds per period (number of
unjustified absences, tardiness, a weighted total) at the school, level, or
class level. When a threshold is crossed, the `AbsenceThresholdReached`
event MUST notify the director and the head supervisor, and MAY notify
guardians per configuration; the alert MUST appear on the student's
attendance record and in the day's student-life dashboard. Alerts MUST be
acknowledgeable and logged.

### BEH-ZS-090: Record tardiness and late passes

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: The "tardy" status is entered at roll call from MVP (BEH-ZS-081); at V1,
student life MUST be able to record tardiness on arrival (student, date,
slot, duration, declared reason) and issue a late pass: a timestamped record
authorizing the student to rejoin class, viewable by the teacher concerned.
Tardiness MUST appear on the roll call for the slot concerned and MUST count
toward attendance counters and thresholds. Notifying guardians of tardiness
MUST be configurable (immediate, at the end of the half-day, or disabled).

### BEH-ZS-091: Manage authorized early departures

> **Invariant:** [INV-ZS-029](../invariants.md#inv-zs-029)
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: An early departure MUST be recorded (student, date, time, reason, person
authorized to pick up the student) based on the parental authorization on
file (a context attribute of the parent-student relationship,
[INV-ZS-029](../invariants.md#inv-zs-029)) or a one-off request validated by student life. The
departure MUST be logged, the student MUST be marked as departed for the
slot concerned, and authorized guardians MUST be notified per configuration.
The day's departure log MUST be viewable by student life and the director.

### BEH-ZS-092: Manage activity exemptions (PE)

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: An exemption (`Dispensation`) MUST carry the student, the period (dates,
slots, or subjects concerned), the reason, and, where needed, an attachment
(a certificate submitted by the parent; the medical treatment itself is
owned by `spec/behaviors/14-health-sensitive-data.md`). During the exemption
period, the student MUST be marked "exempt" for the slots concerned: a
status distinct from absence, not counted in absence thresholds. Expired
exemptions MUST close automatically, and the history MUST stay viewable.

### BEH-ZS-093: Produce attendance statistics

> **Invariant:** [INV-ZS-091](../invariants.md#inv-zs-091)
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: The module MUST calculate and show: absenteeism rate by class, by level,
and by period; validated-justification rate; average notification delay;
distribution by half-day and by slot. Statistics MUST respect scopes
([INV-ZS-091](../invariants.md#inv-zs-091)) and MUST be exportable (Excel/CSV).

Consolidated, multi-site management dashboards are owned by `spec/behaviors/11-dashboards-reporting.md`.

### BEH-ZS-094: Record disciplinary incidents

> **Invariant:** [INV-ZS-081](../invariants.md#inv-zs-081), [INV-ZS-083](../invariants.md#inv-zs-083), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-082`](../../features/vsc/fr-vsc-14-disciplinary-incidents.feature)

REQUIREMENT: An incident (`Incident`) MUST carry the student, the date, the context
(class, course, recess), a configurable severity (the school's graduated
scale), a factual description, any witnesses, and the author. A teacher MAY
report an incident in their class; student life investigates. The incident
MUST trigger the `IncidentRecorded` event and MUST notify authorized
guardians per severity and configuration. Incidents are disciplinary data:
MUST NOT be portable outside the originating school, and MUST be logged
([INV-ZS-081](../invariants.md#inv-zs-081), [INV-ZS-083](../invariants.md#inv-zs-083), [INV-ZS-090](../invariants.md#inv-zs-090), [ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md)).

### BEH-ZS-095: Decide warnings and graduated sanctions

> **Invariant:** [INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065), [INV-ZS-052](../invariants.md#inv-zs-052), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-001](../decisions/001-adult-student-account-holder.md), [ADR-ZS-057](../decisions/057-temporary-exclusion-vs-suspended.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-083`](../../features/vsc/fr-vsc-15-graduated-sanctions.feature)

REQUIREMENT: The sanction scale MUST be configured by the school and graduated (verbal
warning, written warning, removal from class, detention, temporary
expulsion, referral to the disciplinary council). A sanction (`Sanction`)
MUST be tied to an incident, MUST carry its type, duration, and decision;
its execution MUST be tracked (carried out, in progress, lifted), and any
lifting or revision MUST be documented and logged. The sanction notification
MUST go to legal guardians and the custodial guardian per their rights
([INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065)) and to the adult student per their choices
([INV-ZS-052](../invariants.md#inv-zs-052), [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)). A temporary expulsion MUST create, for
its duration, attendance records of type "exclusion (administrative
absence)": the student stays on roll-call lists with this pre-filled status,
with no absence notification and no attendance count
([ADR-ZS-057](../decisions/057-temporary-exclusion-vs-suspended.md)); it MUST NEVER automatically trigger the enrollment's
SUSPENDED state, reserved for the director's administrative measures
(BEH-ZS-035), which the sanction can only propose. A temporary expulsion MAY
justify exclusion from rank calculation (BEH-ZS-102).

### BEH-ZS-096: Issue student-life summonses

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: Student life and the director MUST be able to issue summonses
(disciplinary interview, disciplinary council, meeting with guardians) with
date, time, purpose, recipients, and read tracking. The summons MUST be
carried by the COM module (`SummonsIssued` event, read tracking, bilingual
templates: `spec/behaviors/08-communication-notifications.md`). A meeting
MAY be rescheduled with a version history.

### BEH-ZS-097: Conduct a disciplinary council with minutes

> **Invariant:** [INV-ZS-081](../invariants.md#inv-zs-081), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: The disciplinary council (`DisciplinaryCouncil`) MUST be conducted within
the module: summoning members and guardians, a session file (incidents,
prior sanctions, academic-context elements), deliberation, decision, and
numbered bilingual minutes attached to the student's file. The decision MAY
justify an expulsion (an enrollment transition, `spec/domain-model.md`). The
minutes and the deliberation MUST be internal, non-portable data
([INV-ZS-081](../invariants.md#inv-zs-081)), and every access MUST be logged ([INV-ZS-090](../invariants.md#inv-zs-090)).

### BEH-ZS-098: Keep the per-period conduct grade

> **Invariant:** [INV-ZS-081](../invariants.md#inv-zs-081)
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: The conduct grade (`ConductGrade`) MUST be entered per evaluation period,
on the school's scale (proposed by the homeroom teacher, validated by
student life or the director, per configuration). It MUST be passed to the
EVA module to appear on the period's report card
(`spec/behaviors/05-assessments-grades-report-cards.md`). The conduct grade
MUST be non-portable ([INV-ZS-081](../invariants.md#inv-zs-081)) and MUST be logged per period. Whether
it factors into the overall average is a school parameter (see
OQ-ZS-074 in `spec/open-questions.md`).

### BEH-ZS-099: Produce disciplinary statistics

> **Invariant:** [INV-ZS-081](../invariants.md#inv-zs-081), [INV-ZS-091](../invariants.md#inv-zs-091)
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: The module MUST calculate: number of incidents and sanctions by severity,
by class, and by period; repeat-offense rate (students with at least two
incidents in the period); average time between an incident and a decision;
tracking of executed sanctions. These statistics feed class councils and
parent-school meetings, MUST respect scopes ([INV-ZS-091](../invariants.md#inv-zs-091)), and MUST be
exportable. No statistic MUST leave the school, including to another school
in the same group ([INV-ZS-081](../invariants.md#inv-zs-081), [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md)).

### BEH-ZS-100: Ensure the non-portability and confidentiality of disciplinary data

> **Invariant:** [INV-ZS-083](../invariants.md#inv-zs-083), [INV-ZS-052](../invariants.md#inv-zs-052), [INV-ZS-034](../invariants.md#inv-zs-034), [INV-ZS-022](../invariants.md#inv-zs-022), [INV-ZS-042](../invariants.md#inv-zs-042), [INV-ZS-080](../invariants.md#inv-zs-080), [INV-ZS-033](../invariants.md#inv-zs-033), [INV-ZS-082](../invariants.md#inv-zs-082)
> **See:** [ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md), [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)
> **Priority:** Must
> **Version:** V1 (constraint active as soon as the data exists)
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: Disciplinary data (incidents, sanctions, councils, conduct) MUST NEVER be
portable or visible outside the originating school: excluded from the
default transfer profile ([INV-ZS-083](../invariants.md#inv-zs-083), [INV-ZS-022](../invariants.md#inv-zs-022)), from the PDF leaving
file, and from any inter-school sharing, including within a school group
([INV-ZS-081](../invariants.md#inv-zs-081), [INV-ZS-034](../invariants.md#inv-zs-034), [ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md)). Any explicit transfer MUST
remain at the legal guardian's discretion within the limits of
[INV-ZS-082](../invariants.md#inv-zs-082)/[INV-ZS-083](../invariants.md#inv-zs-083) and MUST NEVER include an in-progress procedure.
The adult student MAY restrict parental access to disciplinary data
([INV-ZS-052](../invariants.md#inv-zs-052), [ADR-ZS-001](../decisions/001-adult-student-account-holder.md), [INV-ZS-042](../invariants.md#inv-zs-042)): disciplinary
notifications to that parent are then suspended. The parent and the student
retain read access to their published data per their rights
([INV-ZS-080](../invariants.md#inv-zs-080), [INV-ZS-033](../invariants.md#inv-zs-033)).

### BEH-ZS-101: Log student-life entries and access

> **Invariant:** [INV-ZS-019](../invariants.md#inv-zs-019)
> **See:** [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)
> **Priority:** Must
> **Version:** MVP (immutable history of roll-call and justification entries); disciplinary access and log export: V1 (historical alias D4)
> **Acceptance:** [`@REQ-ZS-084`](../../features/vsc/fr-vsc-21-logging-student-life-entries.feature)

REQUIREMENT: At MVP, every roll-call entry (confirmation, correction, discrepancy
arbitration) and justification entry (submission, front-desk entry,
decision) MUST carry author, context, and timestamp at the record level,
append-only: post-confirmation roll-call corrections MUST create a distinct
trace (the correction's author, original value, reason) instead of
overwriting the entry; these traces MUST be immutable ([ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)).
At V1, all entries (roll call, justification, incident, sanction, council
decision, conduct grade) and access to the disciplinary record MUST be
logged in the exportable audit log (`AuditLog`, [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-019](../invariants.md#inv-zs-019)),
reserved for the director and for audits.

### BEH-ZS-102: Exclude a student from rank calculation via configuration

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-058](../decisions/058-grading-calculation-rules-mvp.md)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: When a student is subject to a temporary expulsion or a prolonged absence,
the director MAY exclude them from their class's rank calculation for the
period concerned: the rank is then computed without them, and their report
card shows no rank for the period. This choice MUST be configurable (whether
or not to enable the option per school), dated, documented, reversible, and
logged ([INV-ZS-090](../invariants.md#inv-zs-090)). The decision sets the "excluded from rank"
indicator carried by `PeriodResult`; the actual rank calculation, its effect
on the report card, and the indicator itself are owned by BEH-ZS-119 in
`spec/behaviors/05-assessments-grades-report-cards.md`.

### BEH-ZS-103: Recognize rewards and commendations

> **Invariant:** none
> **See:** none
> **Priority:** Could
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the migrated source)

REQUIREMENT: Student life's positive side MAY allow recording distinctions,
commendations, and positive remarks in the student's file, visible to the
parent and the student per their rights, with no inter-school portability
beyond the general rules.

This requirement rounds out the sometimes purely punitive reading of student life.

### BEH-ZS-104: Record a justification at the front desk on a guardian's behalf

> **Invariant:** [INV-ZS-065](../invariants.md#inv-zs-065), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-056](../decisions/056-absence-notification-rules.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-085`](../../features/vsc/fr-vsc-24-front-desk-justification.feature)

REQUIREMENT: Student life (or the front office, per permissions) MUST be able to record
an absence justification on behalf of a guardian who delivered it on paper
or declared it verbally at the front desk: student, absences concerned,
reason, an optional scanned document, the declaring guardian, delivery
method (paper, verbal, phone). The justification MUST be marked "entered by
the school" and then MUST follow the same validation flow as a parent's
(BEH-ZS-088); the guardian, if they have an account, MUST be notified and
can view it. A front-desk justification MUST NOT be attributed to a guardian
whose access is restricted ([INV-ZS-065](../invariants.md#inv-zs-065)).

### BEH-ZS-105: Group absence notifications by day, hold before sending, and issue correction notices

> **Invariant:** none
> **See:** [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md), [ADR-ZS-056](../decisions/056-absence-notification-rules.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-086`](../../features/vsc/fr-vsc-25-notification-retention-correction.feature)

REQUIREMENT: The absence-notification sending mechanics MUST work as follows: (a)
**grouping** — an absent student triggers only one notification per day (or
per half-day, per cycle), on their first absence; subsequent absences that
day MUST feed a per-student evening summary (missed sessions, tardiness),
sent on the in-app channel and, per configuration, SMS or WhatsApp; (b)
**retention** — sending MUST be delayed by 3 minutes (configurable, bounded
to respect the 5-minute cap) after the server receives the roll call; during
this window, a roll-call correction MUST cancel the send with no trace
reaching the family; (c) **correction notice** — any correction made after
sending (a student ultimately present, tardiness reclassified, a discrepancy
arbitration under BEH-ZS-083) MUST produce a bilingual correction message on
the same channel, referenced to the original notification, and MUST update
the delivery log; (d) **cost** — grouping and retention reduce billable
sends; every send, including a correction notice, MUST produce a
`DeliveryLog` with its cost; (e) **discrepancy** — no notification MUST be
sent while a roll-call discrepancy is open (BEH-ZS-083).

## 5. Morocco-specific considerations

1. **School time.** A Monday-to-Saturday-noon week at many private schools; half-day roll call distinguishes morning (including a working Saturday morning) from afternoon. Schedule variants (normal, reduced-hours Ramadan, exams) change slots: roll call follows the day's declared session (a simple per-variant grid at MVP, a timetable at V1), owned by `spec/behaviors/03-academic-structure-timetables.md`.
2. **Time zone.** A definitive return to UTC+0 on 20/09/2026, with no seasonal alternation (Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026). The module uses `Africa/Casablanca` at permanent UTC+0, with roll-call and notification timestamps in UTC (see OQ-ZS-071 in `spec/open-questions.md`).
3. **Channels to families.** WhatsApp is used by 98.6% of Moroccan internet users; household internet reaches 78.4% in rural areas versus 93.6% in urban areas: SMS remains a critical fallback for the rural digital divide and for households without a smartphone ([ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)). Sending via WhatsApp requires the parent's opt-in (Law 09.08, CNDP-ANRT 2019 guidance), and utility pricing changes on 01/10/2026: costs logged per send and a configured pricing-shift parameter (`spec/cross-cutting/06-external-integrations.md`, INT-WAP).
4. **Unstable classroom connections** and teachers with no computer in class: fault-tolerant mobile roll call (BEH-ZS-082, `NFR-OFF` domain) is not a convenience option but the actual condition of use; the interface stays usable on low bandwidth.
5. **Head-supervisor practice.** Phoning the parents of absentees "before 10am" — automation within 5 minutes with logging ([INV-ZS-090](../invariants.md#inv-zs-090)) replaces this workload without removing the human follow-up for notification failures (BEH-ZS-084).
6. **Message language.** Notifications and justifications are bilingual FR/AR with full RTL ([ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)); Arabic is the mother tongue of most families, French that of bilingual schools: the priority language is configured per school and, where needed, per recipient.
7. **Retention.** Attendance and discipline: kept until end of schooling plus 2 years, then anonymized ([ADR-ZS-003](../decisions/003-default-retention-durations.md)); justification attachments follow the same fate as the justified absence.

## 6. Data and events

**Entities used** (dictionary in `spec/domain-model.md`):

| Entity                        | Role in the module                                                                                                                              | Key rules                                                                                                                                                                                                                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AttendanceRecord`            | An attendance event: absence, tardiness, early departure, exempt, exclusion (administrative absence)                                            | Always tied to an enrollment ([INV-ZS-036](../invariants.md#inv-zs-036)); fault-tolerant mobile entry; corrections logged ([INV-ZS-090](../invariants.md#inv-zs-090))                                                                                                                                |
| `Session`                     | Course × date × slot, status (expected, held, not held, substituted); underpins roll call per course                                            | Owned by `spec/behaviors/03-academic-structure-timetables.md` (BEH-ZS-070, BEH-ZS-071); only one roll call per session                                                                                                                                                                               |
| `Justification`               | A parent's justification, or one entered at the front desk on the parent's behalf (BEH-ZS-104): reason, attachment, delivery method, validation | Statuses: submitted, validated, refused; tied to an `AttendanceRecord`                                                                                                                                                                                                                               |
| `Dispensation`                | An activity exemption: period, reason                                                                                                           | Not counted as an absence                                                                                                                                                                                                                                                                            |
| `Incident`                    | A disciplinary fact: date, severity, description                                                                                                | Non-portable ([INV-ZS-081](../invariants.md#inv-zs-081), [ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md)); retained until end of schooling + 2 years, then anonymized ([ADR-ZS-003](../decisions/003-default-retention-durations.md))                                    |
| `Sanction`                    | A graduated sanction: type, duration, decision, execution tracking                                                                              | Non-portable ([INV-ZS-081](../invariants.md#inv-zs-081), [INV-ZS-083](../invariants.md#inv-zs-083)); tied to an `Incident`                                                                                                                                                                           |
| `DisciplinaryCouncil`         | A disciplinary council: members, deliberation, minutes, decision                                                                                | May justify an enrollment transition; V1                                                                                                                                                                                                                                                             |
| `ConductGrade`                | The conduct grade: period, value                                                                                                                | Non-portable ([INV-ZS-081](../invariants.md#inv-zs-081)); passed to the report card via EVA                                                                                                                                                                                                          |
| `Notification`, `DeliveryLog` | Attendance and disciplinary notifications; channel, status, cost                                                                                | Produced by every send; delay < 5 min for an absence                                                                                                                                                                                                                                                 |
| `AuditLog`                    | Log of sensitive entries and access                                                                                                             | Immutable, exportable, 5 years ([INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-019](../invariants.md#inv-zs-019), [ADR-ZS-003](../decisions/003-default-retention-durations.md)); at MVP, immutable, record-level history of entries; disciplinary access and export at V1 (historical alias D4) |

**Domain events** produced or consumed (`spec/domain-model.md` §7):

| Event                     | Producer                                           | Consumers and effects                                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AbsenceRecorded`         | VSC (roll call confirmed and received server-side) | Guardians (notification within 5 min for the day's first absence, after a 3-min retention window; an evening summary for subsequent ones; a correction notice if amended — BEH-ZS-105), teacher, director; COM routing |
| `SessionNotHeld`          | PED (BEH-ZS-071)                                   | Student life: the session drops out of expected roll calls; consumed by roll-call rates                                                                                                                                |
| `JustificationSubmitted`  | Parent (portal)                                    | Student-life processing queue; acknowledgment to the parent                                                                                                                                                            |
| `JustificationValidated`  | Student life                                       | Parent (status), attendance counters                                                                                                                                                                                   |
| `AbsenceThresholdReached` | VSC                                                | Director, head supervisor, guardians (per configuration)                                                                                                                                                               |
| `IncidentRecorded`        | VSC                                                | Authorized guardians, director                                                                                                                                                                                         |
| `SanctionNotified`        | VSC                                                | Authorized guardians per their rights, adult student                                                                                                                                                                   |
| `SummonsIssued`           | VSC or the director                                | Parent via COM, with read tracking                                                                                                                                                                                     |

## 7. Screens

Text descriptions; detailed design is in `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md` (mobile-first, full RTL, FR/AR).

- **SCR-ZS-052 — Mobile roll call for a course (MVP).** A full-screen phone view for a teacher or supervisor. Header area: course or class, date, session (an expected slot or one chosen on the fly, BEH-ZS-070), headcount. Connection status banner: "online," "offline — N roll calls pending sync" (BEH-ZS-082). Body: the student list (photo, name in the usual script, short code), a per-student status via three quick buttons Present / Absent / Tardy, "Present" pre-selected, a pre-filled and locked "exclusion" status for a temporarily expelled student; name search for large classes. Footer: an absentee and tardy count, a "Confirm Roll Call" button with a confirmation screen if absences are recorded. After confirmation: a read-only roll call with a logged correction window (BEH-ZS-101). States: list loading, offline, sync pending, confirmed, discrepancy detected (linking to SCR-ZS-051). Arabic version: RTL interface, names in Arabic script.
- **SCR-ZS-051 — Daily summary and discrepancies (MVP).** A student-life screen (mobile and web): by class or by cycle per authorizations ([INV-ZS-091](../invariants.md#inv-zs-091)), expected sessions (BEH-ZS-070), roll calls received, pending, sessions not held (BEH-ZS-071); a list of the day's absentees with notification status (in retention, sent, delivered, failed, corrected) and a follow-up action; a "front-desk justification" button (BEH-ZS-104); a queue for the day's tardiness and departures (V1 details); a queue of sync discrepancies with both timestamped versions and student-by-student arbitration (MVP). Covers URS-ZS-024 (MVP).
- **SCR-ZS-053 — Parent justification (MVP).** A mobile screen in the parent portal: a list of the selected child's absences and tardiness to justify (multi-child selector), a justification form (a reason from a configurable list, a free comment, an attachment via camera or file), the current status of each justification (submitted, validated, refused with a reason). Bilingual FR/AR.
- **SCR-ZS-054 — Justification validation queue (MVP).** A student-life screen: a queue sorted by age, filters by class, status, origin (parent, front desk), and period; opening a justification with a viewable attachment; "Validate" / "Refuse" actions with a comment; a logged decision. Access limited to authorized cycles ([INV-ZS-091](../invariants.md#inv-zs-091)).
- **SCR-ZS-055 — Front-desk justification (MVP, web and mobile).** A student-life form: student search, selecting the absences to justify (checkboxes on a timeline), the declaring guardian, delivery method (paper, verbal, phone), reason, scanning the document via the camera; recorded with status "submitted — entered by the school," then direct validation is possible by the same staff member if their permissions allow it (BEH-ZS-104).
- **SCR-ZS-056 — Student attendance record (MVP read, V1 full).** A chronological year view (a calendar with absences, tardiness, departures, exemptions), per-type counters, thresholds reached and alerts, a history of justifications and their decisions. Visible to the parent and the student per their rights ([INV-ZS-065](../invariants.md#inv-zs-065), [INV-ZS-080](../invariants.md#inv-zs-080)); visible to student life and the director per scope; disciplinary-record access is logged ([INV-ZS-090](../invariants.md#inv-zs-090)).
- **SCR-ZS-057 — Incident and sanction (V1).** An incident form (student, date, context, severity, factual description, witnesses) reportable from the teacher side; an incident record view with graduated decisions proposed per the school's scale; sanction-execution tracking; notifications sent are shown.
- **SCR-ZS-058 — Disciplinary council (V1).** A session file: summonses issued, the student's prior incidents and sanctions (school scope only), deliberation, decision, numbered bilingual minutes, editable then locked; any reopening is logged.
- **SCR-ZS-059 — Student-life statistics (V1).** The module's dashboard: absenteeism rate by class, level, and period; validated justifications; average notification delay; disciplinary repeat offenses; Excel/CSV exports. Consolidated, multi-site views are owned by `spec/behaviors/11-dashboards-reporting.md`.
- **SCR-ZS-060 — Student-life configuration (MVP for notifications, V1 for the rest).** Per-cycle settings: roll-call mode (session or half-day), notification-grouping granularity (day, half-day), the retention window, the evening-summary time, recipients, quiet hours (with no effect on attendance), the channel hierarchy and consents (cross-reference COM), alert thresholds, the severity and sanction scale, enabling rank exclusion, the roll-call correction window. Reserved for the director (fine-grained permissions, `spec/cross-cutting/01-permissions.md`).

## 8. Integrations

| Integration                            | Role in the module                                                                                                                                     | Cross-reference                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `INT-WAP` (WhatsApp Business Platform) | "Utility" WhatsApp channel for absence, threshold, and sanction notifications, on consent; approved templates; the 01/10/2026 pricing shift configured | `spec/cross-cutting/06-external-integrations.md`, `spec/behaviors/08-communication-notifications.md` |
| `INT-SMS` (Moroccan aggregator)        | Critical notification fallback; alphanumeric sender ID; the school's SMS credit with counters and threshold alerts                                     | `spec/cross-cutting/06-external-integrations.md`, `spec/behaviors/08-communication-notifications.md` |
| Push notifications                     | No push notification at MVP; the first channel from V1 (installed PWA, then native apps)                                                               | `spec/behaviors/08-communication-notifications.md`                                                   |
| Email (`INT-EML`)                      | An optional secondary channel if the address is on file ([ADR-ZS-023](../decisions/023-notification-channel-priority.md))                              | `spec/behaviors/08-communication-notifications.md`                                                   |
| Massar                                 | No attendance flow provided for in the historical baseline; left open (see OQ-ZS-073 in `spec/open-questions.md`)                                      | `spec/behaviors/12-massar-regulatory-exports.md`                                                     |

## 9. Module-specific non-functional requirements

| Domain                   | Requirement applied to this module                                                                                                                                        | Cross-reference                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `NFR-OFF`                | Roll call fully usable offline, automatic sync, lossless convergence of concurrent entries; a persistent queue on the device                                              | `spec/cross-cutting/03-non-functional-requirements.md`                                                                          |
| Notification delay       | Absence notified in under 5 minutes after the server receives the roll-call confirmation, including at start-of-year peak load (definition shared with NFR-ZS-023)        | `spec/cross-cutting/03-non-functional-requirements.md`; `spec/journeys/00-journey-map.md`                                       |
| `NFR-PERF`               | A class's roll-call list shown in under 2s on 4G mobile; roll-call confirmation confirmed locally in under one second, even offline                                       | `spec/cross-cutting/03-non-functional-requirements.md`                                                                          |
| Logging                  | At MVP, immutable, record-level history of roll-call and justification entries (historical alias D4); at V1, logged disciplinary-record access and an exportable AuditLog | [INV-ZS-090](../invariants.md#inv-zs-090); [INV-ZS-019](../invariants.md#inv-zs-019)                                            |
| Least privilege          | A teacher limited to their courses; a supervisor limited to their cycles; systematic server-side enforcement                                                              | [INV-ZS-091](../invariants.md#inv-zs-091); [INV-ZS-011](../invariants.md#inv-zs-011), [INV-ZS-001](../invariants.md#inv-zs-001) |
| Low bandwidth            | A roll-call interface usable on a degraded network: preloaded lists, deferred thumbnails, reduced payloads                                                                | `spec/cross-cutting/03-non-functional-requirements.md`                                                                          |
| Time zone and timestamps | UTC timestamps for roll calls and notifications; `Africa/Casablanca` display at permanent UTC+0 (see OQ-ZS-071)                                                           | `spec/open-questions.md`                                                                                                        |
| Retention                | Attendance and discipline: end of schooling + 2 years then anonymized; logs 5 years                                                                                       | [ADR-ZS-003](../decisions/003-default-retention-durations.md)                                                                   |
| Accessibility and RTL    | Contrast, font sizes, keyboard navigation on the web validation queue; full Arabic RTL                                                                                    | `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`                                                                               |

## 10. Success metrics

Module-specific indicators (`KPI-ZS-NNN` identifiers are carried by `spec/metrics.md`):

- Share of roll calls confirmed before the configured deadline (service target: roll call taken within the first 15 minutes of the slot) — measured per school.
- Median and 95th-percentile delay between the server receiving the roll call and the notification being delivered (the service commitment is 5 minutes).
- Notification failure rate and the associated human follow-up delay.
- Share of absences justified within 48 hours; average time for student life to process the queue.
- Attendance rate (single definition, [ADR-ZS-065](../decisions/065-reporting-and-capacity-definitions.md): (expected sessions − absences) / expected sessions, over declared sessions not marked "not held"; a variant excluding justified absences) by class and by period; trend in disciplinary repeat offenses after processing.
- Adoption: share of roll calls taken on mobile in offline mode at least once a week (validates the value of NFR-OFF).

## 11. Open questions

Open questions for this module (OQ-ZS-071 through OQ-ZS-079 in the migrated source, covering the time-zone baseline update, the sync-conflict arbitration version, Massar attendance export, whether the conduct grade factors into the average, national absence thresholds, printed late passes, the logging version, the WhatsApp-channel version, and sessions with no timetable at MVP) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
