> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-08                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification                                       |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/17-communication-notifications.md` (v0.3), old `FR-COM-01..18` -> `BEH-ZS-181..198`, old `ECR-COM-01..10` -> `SCR-ZS-101..110`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Communication and Notifications (COM)

The COM module is the end-to-end communication infrastructure between the school and families: composing and targeting announcements, individual messages, moderated parent-teacher threads, multi-channel routing with cost control, delivery tracking, summonses, appointments, events with electronic parental authorization, and message templates. It replaces informal messaging groups with a traceable, bilingual, budgeted channel (JMP-ZS-011, spec/journeys/00-journey-map.md).

## 1. Objective and scope

**In scope**

| Capability | Version |
|---|---|
| Bilingual targeted announcements (school, campus, section, cycle, level, track, class, group) | MVP |
| Individual messages and in-app and SMS notifications | MVP |
| Automatic same-day absence notification (in-app, SMS, WhatsApp utility), delivered to the operator within 5 minutes of the attendance-taking being confirmed; the day's first absence is notified, later ones are grouped; a retention window and a correction notice ([ADR-ZS-056](../decisions/056-absence-notification-rules.md)) | MVP |
| Configurable bilingual message templates, FR/AR content | MVP |
| Communication language per person (FR or AR), applied to SMS, WhatsApp and in-app (BEH-ZS-197) | MVP (per [ADR-ZS-062](../decisions/062-communication-rules-batch.md)) |
| Sending windows for reminders and announcements (08:00-20:00, configurable days); the STOP opt-out's scope limited to reminders and announcements | MVP (per [ADR-ZS-062](../decisions/062-communication-rules-batch.md)) |
| Handling inbound WhatsApp replies (automatic acknowledgment, the student-life queue, cost attribution) (BEH-ZS-198) | MVP (per [ADR-ZS-062](../decisions/062-communication-rules-batch.md)) |
| Delivery tracking (sent, delivered, read); message and notification retention (2 years by default) | MVP; full multi-channel in V1 |
| SMS packs, counters, costs billed to the school, threshold alerts | MVP (SMS and WhatsApp presence utility); V1 (WhatsApp general rollout) |
| Mobile push notifications (Android then iOS) — no push notifications in MVP; the [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md) hierarchy (push first) applies from V1 on | V1 |
| WhatsApp Business Platform, approved utility templates, explicit opt-in | MVP (limited to attendance notifications, minimal templates); V1 (general rollout to every message type, managed templates; the 01/10/2026 tariff-switch parameter) |
| Moderated parent-teacher threads ([ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md)), in-app | MVP |
| Summonses (student life, discipline, administrative) with read tracking | V1 |
| Parent-teacher meeting appointments | V1 |
| Events and outings with electronic parental authorization | V1 |
| Low-cost SMS for non-critical mass alerts | V1 |
| English templates (international sections), organization-level consolidated communication status | V2+ |

**Out of scope**: prospecting and marketing toward families (never; opt-in and opt-out are managed only for service messages); student-to-student discussions; cross-functional team messaging (an internal tool outside this chapter); transport and canteen notifications (SAN module, V2+, `spec/behaviors/13-ancillary-services.md`); managing parent-to-parent groups; social networks. School-leadership viewing of threads is provided for, but removing messages is not (see OQ-ZS-114 in `spec/open-questions.md`). Disciplinary summonses as student-life objects fall under `spec/behaviors/04-attendance-student-life-discipline.md`: COM handles their delivery and read tracking.

## 2. Users and use cases

| Actor | Main use cases |
|---|---|
| School leadership (`DIR`) | Multi-scope targeted announcements; configuring routing, templates and packs; viewing moderated threads; administrative summonses; cost and delivery oversight; organizing parent-teacher meetings |
| Front desk (`SEC`) | Administrative messages and summonses; payment reminders from templates (`spec/behaviors/07-finance-billing-collections.md`); document reminders (`spec/behaviors/02-admissions-enrollment-reenrollment.md`); publishing events |
| Head supervisor (`SUR`) | Same-day absence notifications; student-life summonses; contacting a parent from the student's file with a traced history (URS-ZS-025) |
| Teacher (`ENS`) | Announcements to their classes; opening a thread with the parents of their own students only (least privilege, INV-ZS-091); publishing an outing with authorization; parent-teacher appointments (URS-ZS-030) |
| Homeroom teacher | Same uses as a teacher, extended to their class's summary |
| Parent / guardian (`PAR`, `GAR`) | Multi-channel receipt per preferences; replying in open threads; signing outing authorizations; booking appointments; managing their opt-ins (URS-ZS-035, URS-ZS-039, URS-ZS-041, URS-ZS-048) |
| Student (`ELE`) | Receiving notifications concerning them per their rights: activated access (INV-ZS-051); once 18, a rightful recipient with parental restriction honored in routing (INV-ZS-052) |
| ZSchool (operator) | Providing and overseeing the WhatsApp, SMS and email rails; billing consumables ([ADR-ZS-009](../decisions/009-single-plan-pricing.md)); no reading of content outside a logged support procedure |

Preferences are carried per personal account (no shared account, INV-ZS-063): the father and the mother receive the same school information by default (INV-ZS-027) but configure their own channels independently.

## 3. Key journeys

| Journey | Role of COM | Reference |
|---|---|---|
| JMP-ZS-005 — Morning attendance and absence notification | Consuming `AbsenceRecorded`, multi-channel routing within 5 minutes | spec/journeys/00-journey-map.md |
| JMP-ZS-006 — Grades, class council, report cards | Notifying report-card publication (`ReportCardPublished`) to students and guardians | spec/journeys/00-journey-map.md |
| JMP-ZS-007 — Payment collection and reminders for unpaid balances | Multi-channel execution of graduated reminders from templates (`ReminderSent`); driven by `spec/behaviors/07-finance-billing-collections.md` | spec/journeys/00-journey-map.md |
| JMP-ZS-010 — Self-service certificate | Notifying document availability (`DocumentGenerated`) | spec/journeys/00-journey-map.md |
| JMP-ZS-011 — Targeted announcement, summons, moderated parent-teacher message | The module's primary end-to-end journey | spec/journeys/00-journey-map.md |

Detailed per-persona steps (communication-related journey steps for DIR, ENS, SUR and PAR) are carried by `spec/journeys/01-school-group-director.md` through `spec/journeys/05-multi-school-parent.md`: this chapter does not duplicate them.

## 4. Functional behaviors

`BEH-ZS-NNN` counter continuing the corpus-wide sequence (`spec/process/id-migration-map.md`).

| ID | Title | Priority |
|---|---|---|
| BEH-ZS-181 | Publish targeted announcements by scope | Must |
| BEH-ZS-182 | Send individual messages | Must |
| BEH-ZS-183 | Govern parent-teacher discussion threads in moderated mode | Must |
| BEH-ZS-184 | Route each notification by type, preferences and channel availability | Must |
| BEH-ZS-185 | Manage each recipient's communication preferences and consents | Must |
| BEH-ZS-186 | Mandatory bilingualism for institutional content; author's language for individual messages | Must |
| BEH-ZS-187 | Track each notification's delivery (sent, delivered, read) | Must |
| BEH-ZS-188 | Bill communication costs through packs, counters and threshold alerts | Must |
| BEH-ZS-189 | Operate WhatsApp Business as a utility channel, with the 01/10/2026 tariff switch | Should |
| BEH-ZS-190 | Distinguish the transactional SMS alias from mass-alert low-cost SMS | Should |
| BEH-ZS-191 | Automatically notify a same-day absence within 5 minutes | Must |
| BEH-ZS-192 | Issue summonses with read tracking | Must |
| BEH-ZS-193 | Organize parent-teacher meeting appointments | Should |
| BEH-ZS-194 | Manage events and outings with electronic parental authorization | Must |
| BEH-ZS-195 | Configure bilingual message templates per school | Must |
| BEH-ZS-196 | Log communication writes and views | Must |
| BEH-ZS-197 | Manage each person's communication language | Must |
| BEH-ZS-198 | Handle inbound WhatsApp replies | Should |

### BEH-ZS-181: Publish targeted announcements by scope

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090) (audit logging)
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-163`](../../features/com/fr-com-01-targeted-announcement.feature)

REQUIREMENT: The school leadership and teachers MUST be able to compose bilingual
             announcements targeted by a nested scope (school, campus, section, cycle,
             level, track, class, group), preview effective recipients and estimated paid-
             channel cost before sending, and every publication MUST be logged.
             Announcements MUST honor the school's configured sending windows.

The announcement is created as a draft, previewed, scheduled or sent immediately; it stays viewable in each recipient's news feed.

### BEH-ZS-182: Send individual messages

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-091](../invariants.md#inv-zs-091)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-164`](../../features/com/fr-com-02-individual-message.feature)

REQUIREMENT: An authorized staff member or teacher MUST be able to send an individual
             message to a guardian or student from that person's file, linked to its
             context, timestamped, logged, and joined to an existing thread with the same
             correspondent pair if one exists. The recipient identifier MUST come
             exclusively from the file on record — no free-text recipient entry.

### BEH-ZS-183: Govern parent-teacher discussion threads in moderated mode

> **Invariant:** [INV-ZS-091](../invariants.md#inv-zs-091), [INV-ZS-027](../invariants.md#inv-zs-027)
> **See:** [ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md)
> **Priority:** Must
> **Version:** MVP (moderated in-app); V1 (push notification and WhatsApp)
> **Acceptance:** [`@REQ-ZS-165`](../../features/com/fr-com-03-moderated-thread.feature)

REQUIREMENT: A parent-teacher thread MUST be opened only by the teacher (within their own
             courses and the guardians of their own students) or by the school, with
             parental initiation disabled by default and configurable per school. School
             leadership MUST be able to view any thread, and that view MUST be permanently
             flagged to participants and logged with author, context and timestamp.

The thread closes at its initiator's or school leadership's action, with full retention per the retention durations decided in [ADR-ZS-003](../decisions/003-default-retention-durations.md). The thread (`Thread`) is linked to the student's enrollment at the school (tenant), not to the global relationship. In MVP, threads are in-app only (an in-app new-message notification with an SMS fallback); WhatsApp and push arrive in V1.

### BEH-ZS-184: Route each notification by type, preferences and channel availability

> **Invariant:** [INV-ZS-044](../invariants.md#inv-zs-044)
> **See:** [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP (in-app, SMS; WhatsApp utility limited to attendance notifications); V1 (push, general WhatsApp rollout, email)
> **Acceptance:** [`@REQ-ZS-166`](../../features/com/fr-com-04-notification-routing.feature)

REQUIREMENT: Every notification MUST be routed per a matrix configurable by the school
             (message type × channel), honoring recipient preferences and consents.
             Critical notifications (same-day absence, summons, security alert) MUST NOT
             depend on a single channel: an observed failure or non-delivery on one
             channel MUST trigger a fallback to the next channel within the required
             delay window.

In MVP: systematic in-app (the baseline for everything), an SMS alias for critical messages and per the matrix, WhatsApp utility for attendance notifications only to consenting recipients, no push. From V1 on, the channel hierarchy decided in [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md): mobile push first, WhatsApp utility rolled out generally, SMS as a critical fallback, email as secondary. Every message is issued in the recipient's own communication language (BEH-ZS-197). Routing rules are editable by school leadership only (INV-ZS-089).

### BEH-ZS-185: Manage each recipient's communication preferences and consents

> **Invariant:** [INV-ZS-027](../invariants.md#inv-zs-027), [INV-ZS-044](../invariants.md#inv-zs-044)
> **See:** [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md), [ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md)
> **Priority:** Must
> **Version:** MVP (in-app and SMS preferences, WhatsApp opt-in and opt-out, sending windows, adult-student routing); V1 (general WhatsApp rollout, push)
> **Acceptance:** [`@REQ-ZS-167`](../../features/com/fr-com-05-preferences-and-opt-out.feature)

REQUIREMENT: Every parent (and every student, per their rights) MUST have a preferences
             screen per message type with activatable channels, a primary contact number,
             and consent status. WhatsApp opt-in MUST be explicit, revocable at any time,
             timestamped and logged, disclosing the transfer outside Morocco. The STOP
             opt-out MUST apply only to payment reminders and announcements — attendance,
             security, and authentication notifications MUST keep being delivered, with
             that fact confirmed to the person.

Sending windows: reminders and announcements are deferred outside 08:00-20:00 and school-configured windows (Ramadan, Friday midday); attendance and security are exempt. Preferences are per person: the father, mother, and legal guardian configure them separately, and every legal guardian stays informed by default (INV-ZS-027). For an adult student, notifications are addressed to them directly, with the parental restriction decided under INV-ZS-052 applied to routing (MVP). No prospecting is sent to families, regardless of preferences.

### BEH-ZS-186: Mandatory bilingualism for institutional content; author's language for individual messages

> **Invariant:** none
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)
> **Priority:** Must
> **Version:** MVP (FR/AR); V2+ (EN; assisted translation as an option)
> **Acceptance:** [`@REQ-ZS-168`](../../features/com/fr-com-06-bilingualism.feature)

REQUIREMENT: Institutional content (templates, school announcements, summonses,
             authorizations, documents) MUST be entered and delivered in French and
             Arabic; sending MUST be blocked unless both versions are complete, or the
             author makes an explicit, traced waiver. Short channels (SMS, WhatsApp) MUST
             be sent only in the recipient's own communication language, never both.

Individual messages and thread contributions are written in their author's chosen language and rendered as-is, with no translation requirement. A third language (English) is available in V2+ for international sections.

### BEH-ZS-187: Track each notification's delivery (sent, delivered, read)

> **Invariant:** none
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md)
> **Priority:** Must
> **Version:** MVP (basic statuses, in-app and SMS); V1 (push, WhatsApp, email statuses, and reminders for non-readers)
> **Acceptance:** [`@REQ-ZS-169`](../../features/com/fr-com-07-delivery-tracking.feature)

REQUIREMENT: Every send MUST produce a delivery trace per channel and recipient: sent,
             delivered, and — only for channels that offer it (in-app, WhatsApp, push) —
             read, with timestamps and a failure reason where applicable. SMS status MUST
             NOT go beyond "delivered".

Announcements and summonses carry a read receipt visible to the sender. Traces feed the school leadership's tracking table (SCR-ZS-101). Messages and notifications are retained for 2 years by default, adjustable within legal limits.

### BEH-ZS-188: Bill communication costs through packs, counters and threshold alerts

> **Invariant:** [INV-ZS-029](../invariants.md#inv-zs-029)
> **See:** [ADR-ZS-009](../decisions/009-single-plan-pricing.md)
> **Priority:** Must
> **Version:** MVP (SMS and WhatsApp-presence-utility packs and counters, a capped overdraft, authentication SMS outside the pack); V1 (general WhatsApp metering, enriched alerts)
> **Acceptance:** [`@REQ-ZS-170`](../../features/com/fr-com-08-credit-counters.feature)

REQUIREMENT: Paid channels (SMS, WhatsApp) MUST be prefunded by packs the school
             purchases and ZSchool resells; every send MUST decrement the tenant's
             counter. Once the balance runs out, non-critical sends MUST queue until
             top-up; security alerts (same-day absence, disciplinary summons) MUST keep
             being delivered within a capped overdraft (default 500 credits), re-billed at
             the next top-up. Authentication SMS (login codes, MFA, resets, invitations)
             MUST NEVER be deducted from the school's pack — that cost is borne by ZSchool.

School leadership tracks balances, usage, and projections; configurable threshold alerts (default 80% then 95%) are sent to them. Beyond the overdraft cap, only in-app is served and a critical alert is sent to school leadership. Costs are visible by announcement, class, and month.

### BEH-ZS-189: Operate WhatsApp Business as a utility channel, with the 01/10/2026 tariff switch

> **Invariant:** none
> **See:** [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Should
> **Version:** MVP (utility limited to attendance notifications, minimal templates); V1 (general rollout, managed templates)
> **Acceptance:** [`@REQ-ZS-171`](../../features/com/fr-com-09-whatsapp-tariff-switch.feature)

REQUIREMENT: WhatsApp notifications MUST exclusively use utility templates pre-approved
             by Meta, triggered only by authorized message types; a template
             re-categorized to marketing MUST be blocked until corrected. The system MUST
             integrate a tariff-switch parameter dated 01/10/2026: from that date, inbound
             replies within the 24-hour window MUST count toward the school's WhatsApp
             costs (handled by BEH-ZS-198).

WhatsApp Business account: in MVP, a single ZSchool account serves every school, with the school's name at the top of every message and opt-in gathered per school; a dedicated per-school number is a V1 option. Technical access (Meta Cloud API or a BSP) is carried by `spec/cross-cutting/06-external-integrations.md` (INT-WAP); unofficial interfaces are prohibited.

### BEH-ZS-190: Distinguish the transactional SMS alias from mass-alert low-cost SMS

> **Invariant:** none
> **See:** [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Should
> **Version:** MVP (transactional alias); V1 (mass-alert low-cost)
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: Transactional SMS (absence, summons, critical alert) MUST be sent from an
             alphanumeric alias identifying the school. Low-cost SMS (a variable sender)
             MUST be reserved for non-critical mass alerts and MUST NEVER be used for
             security messages or individually identified sends.

The choice of alias or low-cost is part of the routing matrix (BEH-ZS-184); the cost charged to the counter differs by channel.

### BEH-ZS-191: Automatically notify a same-day absence within 5 minutes

> **Invariant:** [INV-ZS-027](../invariants.md#inv-zs-027)
> **See:** [ADR-ZS-056](../decisions/056-absence-notification-rules.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-172`](../../features/com/fr-com-11-absence-notification.feature)

REQUIREMENT: When an attendance-taking confirmation marks a student absent with no prior
             justification, the module MUST consume the `AbsenceRecorded` event and
             notify every legal guardian and the custodial parent, with delivery to the
             channel's operator within 5 minutes of confirmation, regardless of channel
             count.

Aggregation and correction rules (from [ADR-ZS-056](../decisions/056-absence-notification-rules.md), carried by BEH-ZS-084 in `spec/behaviors/04-attendance-student-life-discipline.md`): only the day's first absence (or half-day's, configurable per cycle) triggers an immediate send; later absences the same day group into an evening summary; a 3-minute retention window after confirmation lets a correction cancel the send; after sending, a correction issues a correction notice on the same channel. The message comes from the school's same-day-absence template, issued in each recipient's own language (in MVP, the only notification allowed on WhatsApp utility). A parent justification after notification updates the notification with no new mass send.

### BEH-ZS-192: Issue summonses with read tracking

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: School leadership, front desk, and student life MUST be able to issue
             summonses (mandatory meeting, disciplinary council, administrative
             appointment): dated, located, bilingual, addressed to the relevant
             guardians, with a read receipt and an automatic reminder for non-readers at
             a configurable deadline. Issuing a summons MUST produce a `SummonsIssued`
             event.

Disciplinary summonses are created from `spec/behaviors/04-attendance-student-life-discipline.md`, which owns the object; COM handles delivery, reminders, and traceability. A refusal or delivery failure is reported to the sender with a reason.

### BEH-ZS-193: Organize parent-teacher meeting appointments

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: The school or the homeroom teacher MUST be able to create a parent-teacher
             meeting with per-teacher appointment slots (duration, room, mode); a parent
             MUST be able to book, move, or cancel their own slot, limited to one
             appointment per teacher per meeting.

Teachers see their filled schedule and open slots. Automatic reminders are sent before the meeting; an attendance sheet for confirmed appointments is exportable by the organizer. Late cancellations and unbooked slots are visible to the organizer.

### BEH-ZS-194: Manage events and outings with electronic parental authorization

> **Invariant:** [INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-068](../invariants.md#inv-zs-068)
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-173`](../../features/com/fr-com-14-outing-authorization.feature)

REQUIREMENT: An organizing teacher or school leadership MUST be able to publish an event
             or outing targeted at one or more classes. The legal tutor's authorization
             MUST be granted through a timestamped electronic acceptance, linked to the
             enrollment and logged; a single signature suffices. A student with no
             granted authorization MUST NOT be enrolled on the outing.

The second legal guardian and the custodial parent are notified and may object within 24 hours, moving the authorization to a "contested" status for the school to arbitrate. Non-respondents receive reminders up to the deadline; the organizer sees authorizations granted, refused, contested, and pending in real time. Granted authorizations are civil-liability evidence, kept for a proposed 5 years after the event (see OQ-ZS-118).

### BEH-ZS-195: Configure bilingual message templates per school

> **Invariant:** none
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-174`](../../features/com/fr-com-15-message-templates.feature)

REQUIREMENT: The school MUST have ready-to-use bilingual message templates (same-day
             absence, late payment, report card published, summons, weather alert,
             Ramadan information), each carrying controlled variables, a message-type
             classification driving routing, and a compliance lock preventing repurposing
             into promotional content. School leadership MUST be able to create, version,
             and restore templates.

Baseline templates are supplied in FR/AR at onboarding. Each template shows, for its SMS version, the segment count per language (Arabic: 70 characters per segment).

### BEH-ZS-196: Log communication writes and views

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-019](../invariants.md#inv-zs-019)
> **See:** [ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md), [ADR-ZS-003](../decisions/003-default-retention-durations.md)
> **Priority:** Must
> **Version:** MVP (immutable history of writes, sending and delivery traces); V1 (log of views and an exportable AuditLog)
> **Acceptance:** [`@REQ-ZS-175`](../../features/com/fr-com-16-logging.feature)

REQUIREMENT: Every write in the module (publishing an announcement, sending a message,
             opening/closing a thread, granting an authorization, editing the routing
             matrix or templates) MUST be logged with author, context, and timestamp. A
             thread viewed by school leadership MUST likewise be logged and flagged to
             participants.

In MVP, writes are held in an immutable record-level history. In V1, the log of views joins the immutable, exportable `AuditLog` (INV-ZS-019), retained for 5 years. Delivery traces (BEH-ZS-187) and cost counters (BEH-ZS-188) are kept with the same rigor.

### BEH-ZS-197: Manage each person's communication language

> **Invariant:** none
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-176`](../../features/com/fr-com-17-communication-language.feature)

REQUIREMENT: Every account MUST carry a communication language (French or Arabic;
             English in V2+) distinct from the interface language, chosen at account
             claiming, editable at any time, and pre-set by the school at profile
             creation. Every notification or template-drawn content MUST be issued in
             this language, in a single copy per recipient — two guardians of the same
             student may receive the same information in two different languages.

On a shared phone, the language follows the logged-in account, never the device. For a profile with no account, the school-declared language applies; a person who reads neither French nor Arabic is flagged to the school for an off-platform channel.

### BEH-ZS-198: Handle inbound WhatsApp replies

> **Invariant:** none
> **See:** [ADR-ZS-062](../decisions/062-communication-rules-batch.md)
> **Priority:** Should
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-177`](../../features/com/fr-com-18-inbound-whatsapp-replies.feature)

REQUIREMENT: Every parent reply to a WhatsApp notification MUST receive an automatic
             bilingual acknowledgment noting the channel doesn't support back-and-forth
             exchange and pointing to the app. The reply MUST be linked to the original
             notification, school, and enrollment, and dropped into an inbound-reply
             queue viewable by student life and the front desk.

After the 01/10/2026 tariff switch, every inbound conversation counts and is billed to the school (BEH-ZS-188, BEH-ZS-189); an unprocessed-reply counter appears on the tracking table. No inbound content is read by ZSchool outside a logged support procedure.

## 5. Morocco-specific considerations

1. **WhatsApp, the de facto channel**: the overwhelming majority of social-network users use it, the mobile number is the primary contact identifier ([ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md), INV-ZS-044), and email is rarely checked: hence the push, WhatsApp, SMS, secondary-email hierarchy ([ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)), applicable from V1 on; in MVP, in-app, SMS and WhatsApp attendance utility. The Arabic alphabet caps an SMS segment at 70 characters: SMS are sent only in the recipient's own language (BEH-ZS-197).
2. **Channel economics**: alias SMS roughly 0.31-0.36 MAD per message, low-cost SMS roughly 0.05-0.10 MAD (unsuited to identified transactional use), WhatsApp utility roughly 8 times cheaper than the alias. Resold packs (0.30-0.50 MAD per SMS, [ADR-ZS-009](../decisions/009-single-plan-pricing.md)) stay consistent with the alias rate.
3. **The 01/10/2026 tariff switch**: since 01/07/2025 WhatsApp billing has been per-message; on 01/10/2026 free service and utility messages within the 24-hour window end, and Morocco moves off regional rates onto a standalone rate card. Consequence adopted: budget for inbound replies too (BEH-ZS-189, OQ-ZS-115).
4. **Consent and prospecting**: prior opt-in and opt-out are required for any prospecting; school notifications fall under performing the contractual relationship, but WhatsApp opt-in and opt-out are managed, and the number database is declared to the CNDP (formalities in `spec/cross-cutting/07-legal-compliance-data-protection.md`).
5. **Messaging providers and transfers**: messaging providers are an exception to the no-transfer-outside-Morocco rule ([ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md)); outside the current adequacy list, the F118 authorization applies. No unofficial WhatsApp API may be used.
6. **Bilingualism**: mandatory FR/AR institutional content, RTL rendering, names in dual script ([ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)); individual messages and threads in their author's own language (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md` UX-ZS-08); Ramadan templates account for adjusted hours rather than a timezone change: a permanent switch to UTC+0 on 20/09/2026, with no seasonal alternation. Timestamps and sending windows are expressed in fixed local `Africa/Casablanca` UTC+0 time.
7. **The digital divide**: some households only have a basic phone, more so in rural areas: SMS remains the universal critical fallback, and the absence of a reachable channel is flagged to the school rather than hidden.

## 6. Data and events

**Entities used** (detailed dictionary in `spec/domain-model.md`):

| Entity | Role in COM | Ownership |
|---|---|---|
| `Announcement` | Targeted announcement: scope, FR/AR content, draft/scheduled/published states | COM |
| `Message` | Individual message or thread contribution; content, language, channel | COM |
| `Thread` | Parent-teacher thread linked to the enrollment (tenant); initiator, participants, open/closed state, school-leadership-view indicator | COM |
| `User` (communication language) | FR / AR preference per person, applied to channels (BEH-ZS-197) | Platform (used by COM) |
| `Notification` | A single notification per recipient: message type, priority, channels used | COM |
| `DeliveryLog` | Per-channel trace: sent, delivered, read status, timestamps, cost, failure reason | COM |
| `Meeting/Convocation` | Summons and appointment: date, purpose, participants, read tracking, parent-teacher meeting slots | COM |
| `Event` | Event or outing: class targeting, deadline, linked parental authorizations | COM |
| `ConsentGrant` | Communication consents: WhatsApp opt-in, scope, duration, revocation | COM (usage), platform-wide ownership |
| `UsageMetric` | SMS, WhatsApp and inbound-conversation counters per school | Platform |
| `AuditLog` | Log of writes and sensitive views (INV-ZS-090, INV-ZS-019) | Platform |

**Consumed events**: `AbsenceRecorded`, `JustificationSubmitted` and `JustificationValidated`, `AbsenceThresholdReached`, `IncidentRecorded` and `SanctionNotified`, `SummonsIssued`, `PeriodClosed` and `ReportCardPublished`, `PaymentReceived`, `InstallmentOverdue` and `ReminderSent`, `DocumentGenerated`, `EnrollmentStatusChanged`, `ClassChanged`, `TransferValidated`, `StudentReachedMajority`, `SubscriptionSuspendedOrTerminated`.

**Events produced by COM** (a proposed catalog addition, see OQ-ZS-113): `AnnouncementPublished`, `ThreadOpened` and `ThreadClosed`, `OutingAuthorizationSubmitted`, `AppointmentConfirmed`, `CreditThresholdReached`, `InboundReplyReceived`. Every send produces a `Notification` and at least one `DeliveryLog`.

Every operational record carries the key of its school (INV-ZS-001): no announcement, thread, or trace crosses the tenant boundary; organization-level consolidated views (V1) aggregate counters only, never content.

## 7. Screens

Text descriptions; mobile-first, bilingual FR/AR with RTL rendering (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`).

- **SCR-ZS-102 — Composing a targeted announcement** (web, school leadership and teachers): a cascading scope selector; side-by-side FR and AR entry fields; a template picker with variables; a bilingual preview and per-channel rendering preview; a recipient/cost summary; scheduling options. States: draft, scheduled, published. A simplified mobile version: scope and text, an SMS preview.
- **SCR-ZS-103 — In-app notification center** (mobile-first, all recipients): a chronological list filterable by child, school, and type; read/unread states; channel icons; contextual actions.
- **SCR-ZS-104 — Parent-teacher discussion thread** (mobile): an open-thread list with unread counts; full history, text reply, attachment; a permanent school-leadership-view banner; a closed read-only state.
- **SCR-ZS-105 — Communication preferences** (mobile, parent and student): communication language at the top; a message-type × channel toggle table; WhatsApp consent status with a withdrawal button; the STOP scope shown; Law 09.08 disclosure notices.
- **SCR-ZS-101 — Delivery tracking and costs** (web, school leadership): a per-announcement/summons table (sent, delivered, read, rate, reminders); per-channel failure detail; cumulative costs; pack reconciliation; export.
- **SCR-ZS-106 — Communication configuration** (web, school leadership): the routing matrix with fallbacks; template editing with versioning; sending windows and reminder deadlines; pack management, alert thresholds, authorized overdraft; the dated WhatsApp tariff-switch parameter; authorizing parent-initiated threads.
- **SCR-ZS-107 — Inbound-reply queue** (web and mobile, student life and front desk): WhatsApp replies received per school with the original notification, student, and guardian; unprocessed/processed status; a cumulative-cost counter after the switch.
- **SCR-ZS-108 — Summonses and appointments** (web sender, mobile parent): creating a summons; a parent-teacher meeting slot grid per teacher; a parent booking view; an editable attendance sheet.
- **SCR-ZS-109 — Event and outing authorization** (mobile parent; organizer view): a bilingual event card; authorize/refuse buttons; a reminder counter; an organizer per-class authorization list.
- **SCR-ZS-110 — Credit counters and alerts** (a school-leadership widget and a dedicated page): SMS and WhatsApp balances, monthly consumption, projections, threshold alerts, pack-purchase history.

## 8. Integrations

Technical specifications (access, keys, webhooks, incident recovery) are carried by `spec/cross-cutting/06-external-integrations.md`: this chapter sets the functional needs.

| Integration | COM needs |
|---|---|
| `INT-WAP` — WhatsApp Business Platform | Meta Cloud API or an official BSP; a single ZSchool WhatsApp Business account in MVP, a per-school number as a V1 option; Meta Business verification; managing utility templates and their approvals; status webhooks; receiving and metering inbound conversations (BEH-ZS-198); unofficial interfaces are prohibited |
| `INT-SMS` — a Moroccan aggregator | Alias and low-cost sending; delivery-status webhooks; managing the school's prepaid credits |
| `INT-EML` — email | Secondary sending, handling bounces and non-existent addresses; never required for a parent (INV-ZS-044) |
| Push notifications | V1: mobile-platform notification services (FCM, APNs), operated outside Morocco and listed in the sub-processor register with a transfer basis; no push notification in MVP (PWA); delay and fallback requirements expressed by BEH-ZS-184 and BEH-ZS-191 |
| Compliance | CNDP declarations for the number database and the F118 authorization for messaging providers outside the adequacy list: `spec/cross-cutting/07-legal-compliance-data-protection.md` |

## 9. Module-specific non-functional requirements

References to the NFR domains of `spec/cross-cutting/03-non-functional-requirements.md` (no local numbering):

| Domain | COM-specific requirement |
|---|---|
| Performance (NFR-PERF) | An absence notification delivered to the channel's operator within 5 minutes of the attendance-taking confirmation, including during the school-start peak; absorbing September's outbound-throughput peaks and report-card publications; send queues that prioritize security messages |
| Availability (NFR-DISP) | Continuous delivery of security alerts even if a paid channel is unavailable or packs are exhausted (BEH-ZS-188); graceful per-channel degradation |
| Languages (NFR-I18N) | FR/AR bilingualism of institutional content, RTL rendering, names in dual script; individual messages and threads in their author's own language (UX-ZS-08, BEH-ZS-186); correct Arabic fonts in previews |
| Mobile (NFR-MOB) | Parent and teacher screens designed mobile-first; reliable push on Android first, then iOS |
| Offline (NFR-OFF) | Compositions and replies made offline are queued and synchronized; no duplicate send at resynchronization |
| Observability (NFR-OBS) | Per-tenant metrics: volumes by channel and type, delivery and read rates, costs, delivery latency; platform alerts on rail failures |
| Security and isolation (`spec/cross-cutting/02-security-privacy.md`) | Per-tenant isolation of every entity (INV-ZS-001); protecting numbers against enumeration; immutable logs (INV-ZS-019); no reading of content by ZSchool outside a logged support procedure |
| Volume (NFR-RES) | Sizing to target peaks (500 schools, 500,000 students): announcement publication at the scale of a 2,000-student school with no service degradation |

## 10. Success metrics

Proposed indicators (final identifiers in `spec/metrics.md`):

| Indicator | Indicative target | Source |
|---|---|---|
| Median time to deliver an absence notification to the operator after the attendance-taking confirmation | Under 5 minutes | Delivery traces |
| Per-channel delivery rate (push, WhatsApp, SMS, email) | Above 95% per active channel | Delivery traces |
| Announcement read rate within 48 hours | Tracked per school, with no target set in MVP | Read receipts |
| WhatsApp opt-in rate among active guardians | Tracked monthly | Consents |
| Communication cost per active student per month | Kept in check through packs and threshold alerts | Counters |
| Share of inbound WhatsApp conversations in total cost after 01/10/2026 | Tracking the switch | Counters |
| Share of parent-teacher threads resolved with no school-leadership intervention | Qualitative tracking in V1 | Closed threads |
| Response rate to summonses and authorizations before the deadline | Above 90% after reminders | Read tracking and authorizations |

## 11. Open questions

Open questions for this module are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration): OQ-ZS-111 through OQ-ZS-118.

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
