# ZSchool — Chapter 17: Communication and Notifications (COM)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09); previously 0.2 — revised (review of 09/09/2026) |
| Date | 2026-09-09 |
| Status | Draft PRD — under review; arbitrations ARB-15, ARB-21, ARB-25 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §2.10 (digital usage), §6.10 (COMMUNICATION and PLATFORM entities), §7.8 (communication, **G-17**), §8.1–8.2 (roles, RG-37 to RG-39), §10 (non-functional requirements), §12 (scope by version); decisions DEC-10, DEC-11, DEC-12, DEC-22, DEC-26, DEC-28, DEC-34, DEC-36; RG-13, RG-38; G-17, H-11, H-20, Q-17 |
| Research | `prd/research/03-payments-communications.md` §4 (WhatsApp Business Platform) and §5 (SMS); `prd/research/05-infrastructure-usage.md` (mobile usage); baseline/research divergences No. 1 (timezone), No. 6 (WhatsApp), No. 10 (usage) of `prd/research/00-baseline-corrections.md` |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md` (BES-DIR-02, BES-SEC-05, BES-SUR-02, BES-SUR-08, BES-ENS-05, BES-PAR-02, BES-PAR-06, BES-PAR-08, BES-GAR-05), `prd/03-domain-data-model.md` (§2.6 COM entities, §7 events, INV-10, INV-12, INV-17, INV-33, INV-34, INV-37), `prd/journeys/00-journey-map.md` (PC-05, PC-06, PC-07, PC-10, PC-11), `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/22-ancillary-services-transport-canteen-activities.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` |

---

## 1. Objective and scope

The COM module is the end-to-end communication infrastructure between the school and families: composing and targeting announcements, individual messages, moderated parent-teacher threads, multi-channel routing with cost control, delivery tracking, summonses, appointments, events with electronic parental authorization, and message templates. It replaces informal messaging groups with a traceable, bilingual, budgeted channel (PC-11 of `prd/journeys/00-journey-map.md`).

**In scope**

| Capability | Version |
|---|---|
| Bilingual targeted announcements (school, campus, section, cycle, level, track, class, group) | MVP |
| Individual messages and in-app and SMS notifications | MVP |
| Automatic same-day absence notification (in-app, SMS, WhatsApp utility), delivered to the operator within 5 minutes of the attendance-taking being confirmed; the day's first absence is notified, later ones are grouped; a retention window and a correction notice (ARB-15) | MVP |
| Configurable bilingual message templates, FR/AR content | MVP |
| Communication language per person (FR or AR), applied to SMS, WhatsApp and in-app (FR-COM-17) | MVP (ARB-21c) |
| Sending windows for reminders and announcements (08:00-20:00, configurable days); the STOP opt-out's scope limited to reminders and announcements | MVP (ARB-21 d, e) |
| Handling inbound WhatsApp replies (automatic acknowledgment, the student-life queue, cost attribution) (FR-COM-18) | MVP (ARB-21g) |
| Delivery tracking (sent, delivered, read); message and notification retention (2 years by default) | MVP; full multi-channel in V1 |
| SMS packs, counters, costs billed to the school, threshold alerts | MVP (SMS and WhatsApp presence utility); V1 (WhatsApp general rollout) |
| Mobile push notifications (Android then iOS) — no push notifications in MVP; the DEC-36 hierarchy (push first) applies from V1 on | V1 (ARB-21b) |
| WhatsApp Business Platform, approved utility templates, explicit opt-in | MVP (limited to attendance notifications, minimal templates — arbitration D1, OQ-06); V1 (general rollout to every message type, managed templates; the 01/10/2026 tariff-switch parameter) |
| Moderated parent-teacher threads (DEC-34), in-app | MVP (ARB-21a; OQ-01 resolved) |
| Summonses (student life, discipline, administrative) with read tracking | V1 |
| Parent-teacher meeting appointments | V1 |
| Events and outings with electronic parental authorization | V1 |
| Low-cost SMS for non-critical mass alerts | V1 |
| English templates (international sections), organization-level consolidated communication status | V2+ |

**Out of scope**: prospecting and marketing toward families (never; opt-in and opt-out are managed only for service messages); student-to-student discussions; cross-functional team messaging (an internal tool outside this chapter); transport and canteen notifications (SAN modules, V2+, `prd/modules/22-ancillary-services-transport-canteen-activities.md`); managing parent-to-parent groups; social networks. School-leadership viewing of threads is provided for, but removing messages is not (see OQ-04). Disciplinary summonses as student-life objects fall under `prd/modules/13-attendance-student-life-discipline.md`: COM handles their delivery and read tracking.

---

## 2. Users and use cases

| Actor | Main use cases |
|---|---|
| School leadership (`DIR`) | Multi-scope targeted announcements; configuring routing, templates and packs; viewing moderated threads; administrative summonses; cost and delivery oversight; organizing parent-teacher meetings |
| Front desk (`SEC`) | Administrative messages and summonses; payment reminders from templates (`prd/modules/16-finance-billing-collections.md`); document reminders (`prd/modules/11-admissions-enrollment-reenrollment.md`); publishing events |
| Head supervisor (`SUR`) | Same-day absence notifications; student-life summonses; contacting a parent from the student's file with a traced history (BES-SUR-08) |
| Teacher (`ENS`) | Announcements to their classes; opening a thread with the parents of their own students only (least privilege, RG-39); publishing an outing with authorization; parent-teacher appointments (BES-ENS-05) |
| Homeroom teacher | Same uses as a teacher, extended to their class's summary |
| Parent / guardian (`PAR`, `GAR`) | Multi-channel receipt per preferences; replying in open threads; signing outing authorizations; booking appointments; managing their opt-ins (BES-PAR-02, BES-PAR-06, BES-PAR-08, BES-GAR-05) |
| Student (`ELE`) | Receiving notifications concerning them per their rights: activated access (RG-01); once 18, a rightful recipient with parental restriction honored in routing (RG-02) |
| ZSchool (operator) | Providing and overseeing the WhatsApp, SMS and email rails; billing consumables (DEC-28); no reading of content outside a logged support procedure |

Preferences are carried per personal account (no shared account, RG-12b): the father and the mother receive the same school information by default (INV-10) but configure their own channels independently.

---

## 3. Key journeys

| Journey | Role of COM | Reference |
|---|---|---|
| PC-05 — Morning attendance and absence notification | Consuming `AbsenceRecorded`, multi-channel routing within 5 minutes | `prd/journeys/00-journey-map.md` |
| PC-06 — Grades, class council, report cards | Notifying report-card publication (`ReportCardPublished`) to students and guardians | `prd/journeys/00-journey-map.md` |
| PC-07 — Payment collection and reminders for unpaid balances | Multi-channel execution of graduated reminders from templates (`ReminderSent`); driven by `prd/modules/16-finance-billing-collections.md` | `prd/journeys/00-journey-map.md` |
| PC-10 — Self-service certificate | Notifying document availability (`DocumentGenerated`) | `prd/journeys/00-journey-map.md` |
| PC-11 — Targeted announcement, summons, moderated parent-teacher message | The module's primary end-to-end journey | `prd/journeys/00-journey-map.md` |

Detailed per-persona steps (communication-related PJ-DIR, PJ-ENS, PJ-SUR and PJ-PAR steps) are carried by files `prd/journeys/01-school-group-director.md` to `prd/journeys/05-multi-school-parent.md`: this chapter does not duplicate them.

---

## 4. Functional requirements

`FR-COM-NN` counter starting at 01, a namespace exclusive to this file (conventions §2).

### FR-COM-01 — Publish targeted announcements by scope

| Attribute | Value |
|---|---|
| Description | The school leadership and teachers compose bilingual announcements targeted by a nested scope: school, campus, section (education system), cycle, level, track, class, group. The announcement is created as a draft, previewed, scheduled or sent immediately; the effective recipients (guardians of students in scope, students per their rights) are summarized before sending, along with the estimated cost of paid channels. The announcement stays viewable in each recipient's news feed. Every publication is logged (RG-38). Announcements honor the school's sending windows (ARB-21e) |
| Priority | Must |
| Version | MVP |
| Traceability | §7.8, DEC-10, RG-38, G-17; BES-DIR, BES-ENS-05; ARB-21e |
| Actors | School leadership, front desk, head supervisor, teacher, homeroom teacher |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Targeted announcement (MVP)
  Scenario: Bilingual announcement to a level
    Given School A's leadership drafting an announcement in French and Arabic targeted at level 2AC
    When they confirm sending
    Then the summary shows the effective recipient guardians and students, and the estimated SMS cost
    And each recipient receives the announcement in-app in their communication language, with SMS per the routing matrix
    And the publication is logged with author and timestamp

  Scenario: Announcement scheduled outside the sending window
    Given a non-critical announcement confirmed at 10:30 PM
    When the system processes the send
    Then the in-app announcement is published immediately and the SMS is deferred to 8:00 AM the next day
```

### FR-COM-02 — Send individual messages

| Attribute | Value |
|---|---|
| Description | An authorized staff member or a teacher sends an individual message to a guardian or a student from that person's file or from a selected recipient list. The message is linked to its context (school, enrollment), timestamped, logged, and joins the discussion thread if one already exists for the same pair of correspondents. Numbers and addresses come exclusively from the files on record; no free-text entry of a recipient outside the directory |
| Priority | Must |
| Version | MVP |
| Traceability | §7.8, RG-38, RG-39; BES-SUR-08, BES-SEC-05 |
| Actors | School leadership, front desk, head supervisor, teacher, homeroom teacher |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Individual message (MVP)
  Scenario: The head supervisor writes to the father from the student's file
    Given Rachid, head supervisor, on the file of a 2AC student within his scope
    When he sends a message to the legal guardian from the file
    Then the message is linked to the enrollment, timestamped and logged
    And it joins the existing thread with this guardian, if one exists
    And the number used is the one on file, with no free-text entry

  Scenario: Teacher outside their scope
    Given a teacher with no course in a student's class
    When she attempts to write to that student's guardian
    Then the send is refused (RG-39) and the attempt is logged
```

### FR-COM-03 — Govern parent-teacher discussion threads in moderated mode

| Attribute | Value |
|---|---|
| Description | Per DEC-34: the thread is opened by the teacher (within their own courses and the guardians of their own students, RG-39 and INV-34) or by the school; the parent replies within the thread. The school may, by configuration, let parents initiate threads; parental initiation is disabled by default. The school leadership can view any thread; this view is permanently flagged to participants by a visible mention in the thread and logged with author, context and timestamp. The thread is closed by its initiator or by the school leadership, with full retention per the DEC-22 durations. The thread (`Thread`) is linked to the student's enrollment at the school (tenant), not to the global relationship (clarification added to `prd/03-domain-data-model.md`). In MVP, threads are in-app only (an in-app new-message notification with an SMS fallback); WhatsApp and push arrive in V1 |
| Priority | Must |
| Version | MVP (moderated in-app — DEC-34 "enabled by default", BES-ENS-05; ARB-21a, OQ-01 resolved); V1 (push notification and WhatsApp) |
| Traceability | DEC-34, Q-17, RG-38, RG-39, INV-10, INV-34; BES-PAR-08, BES-ENS-05; ARB-21a |
| Actors | Teacher, homeroom teacher, parent, school leadership |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Moderated parent-teacher discussion thread (MVP)
  Scenario: Opened by the teacher, with the parent replying
    Given a teacher assigned to the math course of class 3AC-2
    And a school whose configuration disallows parental thread initiation
    When the teacher opens a thread with the legal guardian of a student in this course
    Then the thread is created, linked to the student's enrollment, the interface staying bilingual and messages written in their author's own language (UX-08)
    And the parent can reply within this thread
    And the parent cannot initiate a thread or write to a teacher outside their child's courses

  Scenario: Traced viewing by the school leadership
    Given a thread open between a parent and a teacher
    When a member of the school leadership opens this thread
    Then the view is logged with author, context and timestamp
    And both participants see the possible-school-leadership-view indicator at all times
    And the thread is neither censored nor removed by the school leadership (see OQ-04)
```

### FR-COM-04 — Route each notification by type, preferences and channel availability

| Attribute | Value |
|---|---|
| Description | Every notification is routed per a matrix configurable by the school (message type × channel), honoring the recipient's preferences and consents. **In MVP** (ARB-21b): a systematic in-app notification (the baseline for everything), an SMS alias for critical messages and per the matrix, WhatsApp utility for attendance notifications only, to recipients who consented (arbitration D1); no push notification. **From V1 on**, the DEC-36 hierarchy: mobile push as the first immediate channel, WhatsApp utility rolled out generally to consenting recipients, SMS as a critical fallback (households with no smartphone, or failed channels), email as secondary (DEC-12). Critical notifications (same-day absence, summons, security alert) never depend on a single channel: an observed failure or non-delivery on one channel triggers a fallback to the next channel within the required delay window. Every message is issued in the recipient's own communication language (FR-COM-17). Routing rules are editable by the school leadership only (fine-grained permissions, RG-37) |
| Priority | Must |
| Version | MVP (in-app, SMS; WhatsApp utility limited to attendance notifications — arbitration D1, OQ-06); V1 (push, general WhatsApp rollout, email — ARB-21b) |
| Traceability | DEC-12, DEC-36, RG-37, INV-37, §10; BES-PAR-02; ARB-21 b, c |
| Actors | School leadership (configuration), all recipients |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Notification routing (MVP)
  Scenario: SMS fallback on WhatsApp failure
    Given a parent who consented to WhatsApp for attendance notifications
    And an absence notification whose WhatsApp send fails (the number is unreachable on WhatsApp)
    When the failure is observed within the delay window
    Then an SMS alias is sent to the same number
    And both attempts are traced with status and cost

  Scenario: Non-critical message with no paid channel
    Given a courtesy announcement, and a school whose matrix reserves SMS for critical messages
    When the announcement is published
    Then only the in-app notification is sent
```

### FR-COM-05 — Manage each recipient's communication preferences and consents

| Attribute | Value |
|---|---|
| Description | Every parent (and every student, per their rights) has a preferences screen per message type: activatable channels, primary contact number (INV-37), consent status. WhatsApp opt-in is explicit, revocable at any time, timestamped and logged; the disclosure notice states that the message goes through a provider outside Morocco (the transfer basis in MVP, ARB-25c). **Opt-out (the STOP keyword)**: handled automatically and confirmed to the person, it applies only to payment reminders and announcements; attendance, security (summons, alert) and authentication notifications keep being delivered, and the parent is told so in the confirmation (ARB-21d). The in-app channel is never deactivated for security messages. **Sending windows** (ARB-21e): reminders and announcements are deferred outside 08:00-20:00 and the windows configured by the school (Ramadan, Friday midday); attendance and security are exempt. Preferences are per person (communication language: FR-COM-17): the father, mother and legal guardian configure them separately, and every legal guardian stays informed by default (INV-10). For an adult student, notifications concerning them are addressed to them directly, and the parental restriction decided under RG-02 is applied to routing (MVP, ARB-10). No prospecting is sent to families, regardless of preferences |
| Priority | Must |
| Version | MVP (in-app and SMS preferences, WhatsApp opt-in and opt-out, sending windows, adult-student routing — arbitrations D1, ARB-10, ARB-21 d/e); V1 (general WhatsApp rollout, push) |
| Traceability | DEC-11, DEC-34, RG-02, RG-12b, RG-13, INV-10, INV-35, INV-37; BES-GAR-05; compliance with Law 09.08 and CNDP-ANRT 2019 guidance (`prd/research/03` §4); ARB-10, ARB-21 c/d/e, ARB-25c |
| Actors | Parent, adult student, student with activated access, school leadership (viewing) |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Preferences and opt-out (MVP)
  Scenario: STOP limited to reminders and announcements
    Given Ahmed, who replies "STOP" to a payment-reminder SMS
    When the opt-out is recorded
    Then reminders and announcements by SMS stop for Ahmed, and a confirmation is sent to him
    And the confirmation states that absence and security notifications keep reaching him
    And the next day's absence notification is indeed sent to him by SMS

  Scenario: Two parents, two preferences
    Given Naïma and the father, legal guardians of Lina
    When Naïma chooses Arabic and the father chooses French as their communication language
    Then every notification is issued to each of them in their own language, both staying informed by default
```

### FR-COM-06 — Mandatory bilingualism for institutional content; author's language for individual messages

| Attribute | Value |
|---|---|
| Description | Institutional content — message templates, school announcements, summonses, authorizations and documents issued by the school — is entered and delivered in French and Arabic (DEC-10): both versions are mandatory when publishing a school announcement, with right-to-left rendering and names in dual script in the message body. Institutional content incomplete in one of the two languages is flagged before sending; sending is possible only with both versions or with the author's explicit, traced waiver. **Short channels** (ARB-21c): an SMS or WhatsApp message drawn from an institutional template is sent only in the recipient's own communication language (FR-COM-17), never in both, since an Arabic SMS is limited to 70 characters per segment; the bilingual requirement applies to the template, not to every message sent. Individual messages and contributions to parent-teacher threads are written in their author's chosen language and rendered as-is, with no translation requirement (UX-08 of `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, §4.E); assisted translation is an option studied for V2+. A third language (English) is available in V2+ for international sections |
| Priority | Must |
| Version | MVP (FR/AR); V2+ (EN; assisted translation as an option) |
| Traceability | DEC-10, §2.9, G-10; UX-08 (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` §4.E); arbitration D7 (OQ-07) |
| Actors | Authors of institutional content, all recipients |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Bilingualism of institutional content (MVP)
  Scenario: Announcement incomplete in one language
    Given a school announcement written in French only
    When the school leadership attempts to publish it
    Then the system flags the missing Arabic version and only allows sending with both versions or an explicit, traced waiver
  Scenario: SMS in a single language
    Given an absence template available in French and Arabic
    When the notification is sent to a parent whose communication language is Arabic
    Then a single SMS in Arabic is sent, with no French version
```

### FR-COM-07 — Track each notification's delivery (sent, delivered, read)

| Attribute | Value |
|---|---|
| Description | Every send produces a delivery trace per channel and per recipient: sent, delivered and, only for channels that offer it (in-app, WhatsApp, push), read statuses — SMS never goes beyond "delivered" (ARB-21f) — with timestamps and, where applicable, a failure reason (unreachable number, no opt-in, unavailable channel). Announcements and summonses carry a read receipt visible to the sender (who has read it, who has not, with a reminder possible for non-readers). Traces feed the school leadership's tracking table (ECR-COM-05). Messages and notifications are retained for 2 years by default, a duration the school can adjust within legal limits (DEC-22) |
| Priority | Must |
| Version | MVP (basic statuses, in-app and SMS); V1 (push, WhatsApp, email statuses, and reminders for non-readers) |
| Traceability | §7.8, DEC-22, RG-38 |
| Actors | School leadership, front desk, teacher (their own sends), head supervisor |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Delivery tracking (MVP)
  Scenario: Per-channel statuses
    Given a summons sent in-app and by SMS to a guardian
    When the guardian opens the summons in the app
    Then the in-app trace moves to "read" with a timestamp, and the SMS trace stays at most "delivered"
  Scenario: Traced failure
    Given an SMS to an unreachable number
    When the operator returns a failure
    Then the trace carries the failure reason, and student life sees it in the tracking table
```

### FR-COM-08 — Bill communication costs through packs, counters and threshold alerts

| Attribute | Value |
|---|---|
| Description | Paid channels (SMS, WhatsApp) are prefunded by packs purchased by the school and resold by ZSchool per DEC-28 (consumables billed on top); every send decrements the tenant's counter and feeds usage metrics (`UsageMetric`). The school leadership tracks balances, usage by message type and projections; configurable threshold alerts (default: 80% then 95% of the pack) are sent to the school leadership. Once the balance runs out, non-critical sends are queued until top-up; security alerts (same-day absence, disciplinary summons) keep being delivered **within an overdraft capped by ZSchool** (default: 500 credits per school), re-billed at the next top-up; beyond the cap, only in-app is served and a critical alert is sent to the school leadership (ARB-21h). **Authentication SMS** (one-time login codes, MFA, password resets, invitations and claims) are never deducted from the school's pack: their cost is borne by ZSchool as a platform expense (`prd/cross-cutting/33-business-model-packaging.md`, ARB-21h). Costs are visible by announcement, by class and by month |
| Priority | Must |
| Version | MVP (SMS and WhatsApp-presence-utility packs and counters, a capped overdraft, authentication SMS outside the pack); V1 (general WhatsApp metering, including post-switch inbound conversations, and enriched alerts) |
| Traceability | §7.8, DEC-28, §11, INV-17; BES-DIR-02; ARB-21h |
| Actors | School leadership, ZSchool (billing) |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Credit counters and threshold alerts
  Scenario: An SMS pack's alert threshold reached
    Given a 5,000-credit SMS pack with an alert configured at 80 percent
    When the balance drops below 1,000 credits
    Then the school leadership receives an in-app and an email alert
    And the consumption projection stays viewable on the costs page

  Scenario: Balance exhausted during a school day
    Given a zero credit balance, a 500-credit authorized overdraft, and a confirmed attendance-taking flagging absences
    When the absence notification is triggered
    Then security alerts keep being delivered on the available channel and the overdraft is decremented
    And non-critical sends are queued with an urgent top-up request to the school leadership

  Scenario: Overdraft exhausted
    Given a 500-credit overdraft fully consumed
    When a new absence notification is triggered
    Then only the in-app notification is sent and the school leadership receives a critical alert
    And the overdraft is re-billed to the school at the next top-up

  Scenario: Authentication SMS outside the pack
    Given a parent receiving a one-time code to log in
    When the SMS is sent
    Then the school's pack counter stays unchanged
```

### FR-COM-09 — Operate WhatsApp Business as a utility channel, with the 01/10/2026 tariff switch

| Attribute | Value |
|---|---|
| Description | WhatsApp notifications exclusively use utility templates pre-approved by Meta, triggered by authorized message types (absence, payment reminder, report card published, summons); no marketing-type content is sent, and a template's re-categorization to marketing blocks it until corrected. Sending only happens for recipients who consented (FR-COM-05) and stays within the transactional scope (Law 09.08, CNDP-ANRT 2019 guidance). The system integrates a tariff-switch parameter dated 01/10/2026: the end of free service and utility messages within the 24-hour window, and Morocco moving out of the "Rest of Africa" regional rates onto a standalone rate card; from that date on, parents' inbound replies within the window count toward the school's WhatsApp costs and feed budget projections (see OQ-02 and OQ-05); their handling is carried by FR-COM-18. **WhatsApp Business account** (ARB-21g): in MVP, a single ZSchool account serves every school, with the school's name at the top of every message ("ZSchool — <school>") and opt-in gathered per school; a dedicated number per school (its own Meta Business verification, the school's display name) is a V1 option. Technical access (Meta Cloud API or a BSP) is defined in `prd/cross-cutting/35-external-integrations.md`; unofficial interfaces are prohibited |
| Priority | Should |
| Version | MVP (utility limited to attendance notifications, minimal templates — arbitration D1, OQ-06); V1 (general rollout to every message type, managed templates) |
| Traceability | DEC-36, H-11, H-20, §7.8; `prd/research/03` §4; divergence No. 6 of `prd/research/00-baseline-corrections.md` |
| Actors | School leadership (configuration), recipient parents, ZSchool (rail) |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: WhatsApp tariff switch of October 1, 2026
  Scenario: Billable inbound reply after the switch
    Given the tariff-switch parameter activated on 01/10/2026
    And a parent who replied to a utility notification on 02/10/2026
    When the inbound reply is received
    Then it counts toward the school's WhatsApp costs
    And it appears in delivery tracking, linked to the original notification

  Scenario: A utility template re-categorized by the platform
    Given a utility template whose category is changed to marketing while sending
    When the platform detects the re-categorization
    Then the template's send is suspended, the school leadership is alerted, and the SMS fallback is triggered for the affected recipients
```

### FR-COM-10 — Distinguish the transactional SMS alias from mass-alert low-cost SMS

| Attribute | Value |
|---|---|
| Description | Transactional SMS (absence, summons, critical alert) is sent from an alphanumeric alias identifying the school, a channel suited to transactional use. Low-cost SMS (a variable sender, a reduced rate) is reserved for non-critical mass alerts (an event reminder, courtesy information, a weather alert) and never used for security messages or individual messages that need a certain sender identification. The choice of alias or low-cost is part of the routing matrix (FR-COM-04), and the cost charged to the counter differs by channel |
| Priority | Should |
| Version | MVP (transactional alias); V1 (mass-alert low-cost) |
| Traceability | DEC-12, DEC-36, §7.8; `prd/research/03` §5 |
| Actors | School leadership (configuration), all recipients |

### FR-COM-11 — Automatically notify a same-day absence within 5 minutes

| Attribute | Value |
|---|---|
| Description | When an attendance-taking confirmation marks a student absent with no prior justification, the module consumes the `AbsenceRecorded` event produced by student life (`prd/modules/13-attendance-student-life-discipline.md`) and notifies every legal guardian and the custodial parent (INV-10): the notification is **delivered to the channel's operator** within 5 minutes of confirmation (§10; final delivery depends on the operators and is traced by FR-COM-07), regardless of how many channels are used. **Aggregation and correction rules** (ARB-15, carried by FR-VSC-04): only the day's first absence (or half-day's, configurable per cycle) triggers an immediate send; later absences the same day are grouped into an evening summary; a 3-minute retention window after confirmation lets a correction cancel the send; after sending, a correction issues a correction notice on the same channel. The message comes from the school's same-day-absence template, issued in each recipient's own language (in MVP, the only notification allowed on WhatsApp utility, with a minimal template — arbitration D1, OQ-06), states the date, time and justification method; routing applies FR-COM-04 with fallbacks within the delay window. A justification sent by the parent after notification updates the notification (justified absence) with no new mass send |
| Priority | Must |
| Version | MVP |
| Traceability | §7.4, §7.8, §10, RG-13, INV-10, DEC-36; BES-SUR-02, BES-PAR-02; PC-05; ARB-15, ARB-21b |
| Actors | Student life (producer), parent, teacher (informed), school leadership (oversight) |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Absence notification with routing and fallback
  Scenario: Multi-channel delivery within the five-minute window (MVP)
    Given Ahmed, who consented to WhatsApp for attendance notifications, with no email on file
    And an attendance-taking confirmed at 8:10 AM marking Youssef absent with no justification, the day's first absence
    When the AbsenceRecorded event is consumed by the COM module after the 3-minute retention window
    Then an in-app notification is created immediately in Ahmed's language
    And the WhatsApp utility attendance template is sent
    And a channel whose non-delivery is observed within the delay window triggers a fallback SMS alias
    And each channel produces a delivery trace with status and cost
    And the notification is delivered to the operator within 5 minutes of the attendance-taking confirmation

  Scenario: Later absences on the same day (MVP)
    Given Youssef already notified absent for the first 8:00 AM class
    When the 10:00 AM attendance-taking marks him absent again
    Then no new immediate notification is sent
    And the evening summary lists the day's missed classes

  Scenario: Correction after sending (MVP)
    Given an absence notification already delivered to the operator
    When the teacher corrects the attendance record, marking the student present
    Then a correction notice is issued on the same channel and the original notification is flagged "corrected"

  Scenario: A household with no smartphone (MVP)
    Given a parent with no smartphone, no WhatsApp opt-in and no email
    When an absence is recorded for their child
    Then only the SMS (alias) route is used, in addition to the in-app notification
    And the SMS trace is flagged delivered, or carries a failure reason viewable by student life

  Scenario: Push-first hierarchy (V1)
    Given a parent who enabled push on the native app and consented to WhatsApp
    When an absence is recorded for their child
    Then push is sent first, then the WhatsApp utility template, with an SMS fallback on observed non-delivery
```

### FR-COM-12 — Issue summonses with read tracking

| Attribute | Value |
|---|---|
| Description | The school leadership, the front desk and student life issue summonses (mandatory meeting, disciplinary council, administrative appointment): dated, located, bilingual, addressed to the relevant guardians with a read receipt and an automatic reminder for non-readers at a configurable deadline. The summons produces the `SummonsIssued` event, and its read tracking is viewable by the sender. Disciplinary summonses are created from the student-life module (`prd/modules/13-attendance-student-life-discipline.md`), which owns the object; COM handles delivery, reminders and traceability. A refusal or delivery failure is reported to the sender with a reason |
| Priority | Must |
| Version | V1 |
| Traceability | §7.8, §7.4, RG-38; `prd/03-domain-data-model.md` §2.6 (`Meeting/Convocation`, `SummonsIssued` event); BES-SUR-05 |
| Actors | School leadership, front desk, head supervisor, parents |

### FR-COM-13 — Organize parent-teacher meeting appointments

| Attribute | Value |
|---|---|
| Description | The school or the homeroom teacher creates a parent-teacher meeting with appointment slots per teacher (duration, room, in-person or remote mode). The parent books, moves or cancels their slot from their own space, limited to one appointment per teacher and per meeting; teachers see their filled schedule and the open slots. Automatic reminders are sent before the meeting (configurable deadlines), and an attendance sheet for confirmed appointments is exportable by the organizer. Late cancellations and unbooked slots are visible to the organizer for following up with families |
| Priority | Should |
| Version | V1 |
| Traceability | §7.8; BES-PAR-08, BES-DIR |
| Actors | School leadership, homeroom teacher, teacher, parent |

### FR-COM-14 — Manage events and outings with electronic parental authorization

| Attribute | Value |
|---|---|
| Description | The organizing teacher or the school leadership publishes an event or school outing (purpose, date, location, supervision, response deadline, an optional cost handled by `prd/modules/16-finance-billing-collections.md`) targeted at one or more classes. The legal tutor (RG-14b: required signatory) grants authorization through a timestamped electronic acceptance, linked to the enrollment and logged; a single signature is enough; the second legal guardian and the custodial parent are notified and may object within 24 hours, which puts the authorization into a "contested" status to be arbitrated by the school (RG-16); refusal is possible with an optional reason. Non-respondents receive reminders up to the deadline; the organizer views in real time the list of authorizations granted, refused, contested and pending, and a student with no authorization is not enrolled on the outing. The event stays viewable by participants for DEC-22's "messages" retention period; granted authorizations, evidence for civil-liability purposes, are kept for five years after the event (a proposed duration, to be confirmed by the founder: OQ-08) |
| Priority | Must |
| Version | V1 |
| Traceability | §7.8, RG-13, RG-14b, RG-16, RG-38, DEC-22; BES-PAR-06; OQ-08 |
| Actors | Organizing teacher, school leadership, front desk, legal guardian |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Electronic parental authorization for an outing
  Scenario: Acceptance by the legal guardian
    Given a school outing published for class 6AP-1 with a D-2 response deadline
    And a legal guardian holding their own parent account
    When the guardian confirms the authorization from their mobile
    Then the acceptance is timestamped, linked to the enrollment and logged
    And the organizer immediately sees the authorization granted in their class list

  Scenario: No response by the deadline
    Given a response deadline reached and a parent with no response
    When the deadline passes
    Then the parent receives a final reminder on their active channels
    And a student with no granted authorization cannot be enrolled on the outing
    And the organizer sees the student in a pending or not-authorized status

  Scenario: Objection from the second legal guardian
    Given an authorization granted by the father, the legal guardian
    When the mother, a legal guardian, objects within 24 hours
    Then the authorization moves to "contested" status and the school is notified for arbitration
    And the student is not enrolled on the outing until the arbitration is recorded
```

### FR-COM-15 — Configure bilingual message templates per school

| Attribute | Value |
|---|---|
| Description | The school has ready-to-use bilingual message templates, editable within contractual limits: same-day absence, late payment, report card published, summons, weather alert, Ramadan information (adjusted hours, timetable variants). Each template carries controlled variables (the student's name in dual script, date, class, a deep link to the relevant area), a message-type classification that drives routing, and a compliance lock: a template cannot be repurposed into promotional content. The school leadership can create additional templates, version them and restore an earlier version; baseline templates are supplied in FR/AR at onboarding. Each template shows, for its SMS version, the number of segments per language (Arabic: 70 characters per segment) |
| Priority | Must |
| Version | MVP |
| Traceability | §7.8, DEC-10, §2.4; BES-SEC-05; ARB-21c |
| Actors | School leadership (configuration), front desk, student life, teacher (use) |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Bilingual message templates (MVP)
  Scenario: Customizing the absence template
    Given the "same-day absence" template supplied in FR and AR at onboarding
    When the school leadership edits the French text and saves
    Then a new template version is created, with the old one restorable
    And the editor shows the SMS segment count for each language

  Scenario: Compliance lock
    Given a reminder template into which the school leadership inserts a mention of withholding the report card
    When they attempt to publish the template
    Then publication is refused with a reminder of DEC-24
```

### FR-COM-16 — Log communication writes and views

| Attribute | Value |
|---|---|
| Description | Every write in the module (publishing an announcement, sending a message, opening and closing a thread, granting an authorization, editing the routing matrix or the templates) is logged with author, context and timestamp (RG-38). A thread viewed by the school leadership — a view of exchanges treated as sensitive relationship data — is likewise logged and flagged to participants (DEC-34). In MVP, writes are held in an immutable record-level history, and delivery traces are retained (arbitration D4, ARB-25j); in V1, the log of views (including school-leadership thread views, always flagged to participants from the MVP on) joins the immutable, exportable `AuditLog`, retained for 5 years (DEC-22, `prd/03-domain-data-model.md` INV-33). Delivery traces (FR-COM-07) and cost counters (FR-COM-08) are kept with the same rigor |
| Priority | Must |
| Version | MVP (immutable history of writes, sending and delivery traces — D4); V1 (log of views and an exportable AuditLog compliant with INV-33 — ARB-25j) |
| Traceability | RG-38, DEC-34, DEC-22, INV-33; BES-SUR-06; ARB-25j |
| Actors | Every writing actor, school leadership (log viewing), ZSchool (platform audit) |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Logging communication writes (MVP)
  Scenario: A logged publication
    Given an announcement published by the school leadership
    When the announcement's history is viewed
    Then the publication's author, context and timestamp are visible and cannot be edited
  Scenario: A thread viewed by the school leadership
    Given an open parent-teacher thread
    When a member of the school leadership views it
    Then participants see the possible-view indicator; logging of the view itself is guaranteed in V1 (INV-33)
```

### FR-COM-17 — Manage each person's communication language

| Attribute | Value |
|---|---|
| Description | Every account (`User`) carries a **communication language** (French or Arabic; English in V2+ for international sections) distinct from the interface language, chosen when the account is claimed, editable at any time by the person, and pre-set by the school when the profile is created. Every notification, SMS, WhatsApp message or institutional content drawn from a template is issued in this language, in a single copy; two guardians of the same student may receive the same information in two different languages. On a shared phone, the language follows the logged-in account, never the device (NFR-I18N-01). For a profile with no account (a preschooler, an unclaimed parent), the language declared by the school applies; a person who reads neither French nor Arabic is flagged to the school (a voice channel or a trusted third party off-platform) |
| Priority | Must |
| Version | MVP (ARB-21c) |
| Traceability | DEC-10, DEC-11, §2.9, §2.10; NFR-I18N-01 (`prd/cross-cutting/32-non-functional-requirements.md`); UX-08; ARB-21c |
| Actors | Parent, student, teacher (preference); the school (pre-setting) |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Communication language (MVP)
  Scenario: SMS in the recipient's language
    Given Naïma, whose communication language is Arabic, and Lina's father, whose communication language is French
    When an absence notification is issued for Lina
    Then Naïma receives an SMS in Arabic and the father an SMS in French, each in a single copy

  Scenario: Shared phone
    Given Ahmed (Arabic) and Youssef (French) who use the same phone
    When Youssef opens his session
    Then the interface and the in-app notifications are in French, with no change to Ahmed's preference
```

### FR-COM-18 — Handle inbound WhatsApp replies

| Attribute | Value |
|---|---|
| Description | Every parent reply to a WhatsApp notification receives an automatic bilingual acknowledgment noting that the channel does not support back-and-forth exchange and pointing to the app (a deep link to the absence justification, the thread, or payments). The reply is linked to the original notification, to the relevant school and enrollment, and dropped into an **inbound-reply queue** viewable by student life and the front desk (reading, marking processed, opening a thread or an individual message in reply). After the 01/10/2026 tariff switch, every inbound conversation counts and is billed to the school (FR-COM-08, FR-COM-09); an unprocessed-reply counter appears on the tracking table. No inbound content is read by ZSchool outside a logged support procedure |
| Priority | Should |
| Version | MVP (ARB-21g) |
| Traceability | DEC-36, H-20, §7.8; `prd/research/03` §4; ARB-21g; OQ-05 |
| Actors | Parent (sender), student life, front desk, school leadership |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Inbound WhatsApp replies (MVP)
  Scenario: A reply to an absence notification
    Given Ahmed, who replies "he is sick" to Youssef's absence WhatsApp notification
    When the reply is received
    Then an automatic bilingual acknowledgment offers him the link to the absence-justification screen in the app
    And the reply appears in School A's student-life queue, linked to the original notification
    And, after 01/10/2026, the inbound conversation counts toward the school's costs
```

---

## 5. Morocco specifics

1. **WhatsApp, the de facto channel**: 98.6% of social-network users use it (ANRT, H-11; `prd/research/05`), the mobile number is the primary contact identifier (DEC-11, INV-37), and email is rarely checked: hence the push, WhatsApp, SMS, secondary-email hierarchy (DEC-12, DEC-36), applicable from V1 on; in MVP, in-app, SMS and WhatsApp attendance utility (arbitration D1, ARB-21b). The Arabic alphabet caps an SMS segment at 70 characters: SMS are sent only in the recipient's own language (FR-COM-17).
2. **Channel economics**: alias SMS ≈ 0.31-0.36 MAD per message, low-cost SMS ≈ 0.05-0.10 MAD (unsuited to identified transactional use), WhatsApp utility ≈ €0.0064 per message to +212, roughly 8 times cheaper than the alias (Messaggio, EnvoiSMS, bulksms.ma rate cards; `prd/research/03` §4-5). Resold packs (0.30-0.50 MAD per SMS, DEC-28) stay consistent with the alias rate.
3. **The 01/10/2026 tariff switch**: since 01/07/2025 WhatsApp billing has been per-message; on 01/10/2026 free service and utility messages within the 24-hour window end, and Morocco moves off the "Rest of Africa" regional rates onto a standalone rate card, published before 01/09/2026 (Meta Pricing; `prd/research/03` §4; divergence No. 6 of `prd/research/00-baseline-corrections.md`). Consequence adopted: budget for inbound replies too (FR-COM-09, OQ-05).
4. **Consent and prospecting**: prior opt-in and opt-out are required for any prospecting (Law 09.08, CNDP-ANRT 2019 guidance); school notifications fall under performing the contractual relationship, but WhatsApp opt-in and opt-out are managed, and the number database is declared to the CNDP (`prd/research/03` §4; formalities in `prd/cross-cutting/36-legal-compliance-data-protection.md`).
5. **Messaging providers and transfers**: messaging providers are the only exception provided for to the no-transfer-outside-Morocco rule (DEC-26); outside the current adequacy list (deliberation 236-2015), the F118 authorization applies (`prd/research/02`; `prd/cross-cutting/36-legal-compliance-data-protection.md`). No unofficial WhatsApp API may be used (Meta's terms of service).
6. **Bilingualism**: mandatory FR/AR institutional content (templates, school announcements, documents), RTL rendering, names in dual script (DEC-10); individual messages and threads in their author's own language (UX-08 of `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` — arbitration D7, OQ-07); Ramadan templates account for adjusted hours rather than a timezone change: a permanent switch to UTC+0 on 20/09/2026, with no seasonal alternation (decree No. 2.26.530; divergence No. 1 of `prd/research/00-baseline-corrections.md`). Timestamps and sending windows are expressed in fixed local `Africa/Casablanca` UTC+0 time.
7. **The digital divide**: some households only have a basic phone, more so in rural areas (rural household internet access at 78.4%, ANRT; the baseline's "8% basic phone / 14% rural" figures were not found in the ANRT 2024-2025 edition — divergence No. 10): SMS remains the universal critical fallback, and the absence of a reachable channel is flagged to the school rather than hidden.

---

## 6. Data and events

**Entities used** (`PROJECT.md` §6.10; detailed dictionary in `prd/03-domain-data-model.md` §2.6):

| Entity | Role in COM | Ownership |
|---|---|---|
| `Announcement` | Targeted announcement: scope (school, campus, section, cycle, level, track, class, group), FR/AR content, draft/scheduled/published states | COM |
| `Message` | Individual message or thread contribution; content, language, channel | COM |
| `Thread` | Parent-teacher thread linked to the enrollment (tenant); initiator, participants, open/closed state, school-leadership-view indicator (DEC-34) | COM |
| `User` (communication language) | FR / AR preference per person, applied to channels (FR-COM-17) | Platform (used by COM) |
| `Notification` | A single notification per recipient: message type, priority, channels used | COM |
| `DeliveryLog` | Per-channel trace: sent, delivered, read status, timestamps, cost, failure reason | COM |
| `Meeting/Convocation` | Summons and appointment: date, purpose, participants, read tracking, parent-teacher meeting slots | COM |
| `Event` | Event or outing: class targeting, deadline, linked parental authorizations | COM |
| `ConsentGrant` | Communication consents: WhatsApp opt-in, scope, duration, revocation (INV-24 for sharing; channel consent follows the same trace discipline) | COM (usage), platform-wide ownership |
| `UsageMetric` | SMS, WhatsApp and inbound-conversation counters per school (DEC-28) | Platform |
| `AuditLog` | Log of writes and sensitive views (RG-38, INV-33) | Platform |

**Consumed events** (catalog in `prd/03-domain-data-model.md` §7): `AbsenceRecorded`, `JustificationSubmitted` and `JustificationValidated` (status to the parent), `AbsenceThresholdReached`, `IncidentRecorded` and `SanctionNotified`, `SummonsIssued`, `PeriodClosed` and `ReportCardPublished`, `PaymentReceived`, `InstallmentOverdue` and `ReminderSent`, `DocumentGenerated`, `EnrollmentStatusChanged`, `ClassChanged`, `TransferValidated`, `StudentReachedMajority`, `SubscriptionSuspendedOrTerminated` (informing the school leadership, routing kept in read-only).

**Events produced by COM** (a proposed addition to the catalog, to be reconciled on review — OQ-03): `AnnouncementPublished`, `ThreadOpened` and `ThreadClosed`, `OutingAuthorizationSubmitted`, `AppointmentConfirmed`, `CreditThresholdReached`, `InboundReplyReceived`. Every send produces a `Notification` and at least one `DeliveryLog`.

Every operational record carries the key of its school (INV-17): no announcement, thread or trace crosses the tenant boundary; organization-level consolidated views (V1) aggregate counters only, never content.

---

## 7. Key screens

Text descriptions; mobile-first, bilingual FR/AR with RTL rendering (ergonomics detail in `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`).

- **ECR-COM-01 — Composing a targeted announcement** (web, school leadership and teachers): a cascading scope selector (campus, section, cycle, level, track, class, group); side-by-side FR and AR entry fields; choosing a template, inserting variables; a bilingual preview and a per-channel rendering preview (in-app, push, WhatsApp, SMS with segmentation shown); a summary of the effective recipients and the estimated cost; scheduling options; a send button with confirmation. States: draft, scheduled, published. A simplified mobile version: scope and text, an SMS preview.
- **ECR-COM-02 — In-app notification center** (mobile-first, all recipients): a chronological list filterable by child, school and type; read and unread states; icons for the channels actually used; contextual actions (justify an absence, reply in a thread, book a slot, authorize an outing); an entry point to viewable announcements.
- **ECR-COM-03 — Parent-teacher discussion thread** (mobile): a list of open threads with unread counts; a thread view with the full history, text reply and attachment; a permanent banner "this thread may be viewed by the school leadership"; a closed, read-only state; a notice disabling parental initiation shown when the configuration disallows it.
- **ECR-COM-04 — Communication preferences** (mobile, parent and student): communication language (FR / AR) at the top; a message type × channel table with toggles; the WhatsApp consent status with its date, a mention of the transfer outside Morocco, and a withdrawal button; the keyword opt-out shown with its scope (reminders and announcements only); a verifiable primary contact number; a note "attendance and security notifications keep being delivered"; Law 09.08 disclosure notices.
- **ECR-COM-05 — Delivery tracking and costs** (web, school leadership): a table per announcement and per summons: sent, delivered, read, rate, possible reminders; per-channel detail with failure reasons; cumulative costs by period, class and type; reconciliation with packs; export.
- **ECR-COM-06 — Communication configuration** (web, school leadership): the message type × channel routing matrix with fallbacks; alias or low-cost choice per type; editing bilingual templates with versioning; sending windows (08:00-20:00 by default, excluded days and periods) and reminder deadlines; grouping of attendance notifications by cycle (half-day, full day); pack management, alert thresholds and the authorized overdraft; the dated WhatsApp tariff-switch parameter; authorizing parent-initiated threads (disabled by default).
- **ECR-COM-10 — Inbound-reply queue** (web and mobile, student life and front desk): a list of WhatsApp replies received per school with the original notification, the student and the guardian; unprocessed / processed status; actions: open a thread, send an individual message, mark processed; a counter of unprocessed replies and cumulative cost after the switch (FR-COM-18).
- **ECR-COM-07 — Summonses and appointments** (web sender, mobile parent): creating a summons with purpose, date, location, recipients and read tracking with a reminder; a slot grid for a parent-teacher meeting per teacher; a parent view for booking, moving and canceling; an editable attendance sheet.
- **ECR-COM-08 — Event and outing authorization** (mobile parent; organizer view): a bilingual event card (purpose, date, location, supervision, deadline); authorize and refuse buttons with a timestamp shown after the action; a reminder counter; an organizer view: a per-class list of authorizations granted, refused and pending, with a group reminder.
- **ECR-COM-09 — Credit counters and alerts** (a school-leadership widget and a dedicated page): SMS and WhatsApp balances, this month's consumption, end-of-month projections, threshold alerts received, a pack-purchase history, the impact of inbound conversations after the tariff switch.

---

## 8. Integrations

Technical specifications (access, keys, webhooks, incident recovery) are carried by `prd/cross-cutting/35-external-integrations.md`: this chapter sets the functional needs.

| Integration | COM needs |
|---|---|
| `INT-WAP` — WhatsApp Business Platform (`prd/cross-cutting/35-external-integrations.md`) | Meta Cloud API or an official BSP; a single ZSchool WhatsApp Business account in MVP, a per-school number as a V1 option (ARB-21g); Meta Business verification; managing utility templates and their approvals; status webhooks (delivered, read, failure, re-categorization); receiving and metering inbound conversations (FR-COM-18); unofficial interfaces are prohibited |
| `INT-SMS` — a Moroccan aggregator (`prd/cross-cutting/35-external-integrations.md`) | Alias and low-cost sending; delivery-status webhooks; managing the school's prepaid credits |
| `INT-EML` — email (`prd/cross-cutting/35-external-integrations.md`) | Secondary sending, handling bounces and non-existent addresses; never required for a parent (INV-37) |
| Push notifications | V1: mobile-platform notification services (FCM, APNs), operated outside Morocco and therefore listed in the sub-processor register with a transfer basis (CNF-09, ARB-25d); no push notification in MVP (PWA); delay and fallback requirements expressed by FR-COM-04 and FR-COM-11 |
| Compliance | CNDP declarations for the number database and the F118 authorization for messaging providers outside the adequacy list: `prd/cross-cutting/36-legal-compliance-data-protection.md` |

---

## 9. Module-specific non-functional requirements

References to the NFR domains of `prd/cross-cutting/32-non-functional-requirements.md` (no local numbering):

| Domain | COM-specific requirement |
|---|---|
| Performance (NFR-PERF) | An absence notification delivered to the channel's operator within 5 minutes of the attendance-taking confirmation, including during the school-start peak (§10); absorbing September's outbound-throughput peaks and report-card publications (`prd/journeys/00` §4.2); send queues that prioritize security messages |
| Availability (NFR-DISP) | Continuous delivery of security alerts even if a paid channel is unavailable or packs are exhausted (FR-COM-08); graceful per-channel degradation |
| Languages (NFR-I18N) | FR/AR bilingualism of institutional content, RTL rendering, names in dual script; individual messages and threads in their author's own language (UX-08, FR-COM-06); correct Arabic fonts in previews |
| Mobile (NFR-MOB) | Parent and teacher screens designed mobile-first; reliable push on Android first (DEC-36), then iOS |
| Offline (NFR-OFF) | Compositions and replies made offline are queued and synchronized; no duplicate send at resynchronization |
| Observability (NFR-OBS) | Per-tenant metrics: volumes by channel and type, delivery and read rates, costs, delivery latency; platform alerts on rail failures |
| Security and isolation (reference `prd/cross-cutting/31-security-privacy.md`) | Per-tenant isolation of every entity (INV-17); protecting numbers against enumeration; immutable logs (INV-33); no reading of content by ZSchool outside a logged support procedure |
| Volume (NFR-RES) | Sizing to target peaks (500 schools, 500,000 students): announcement publication at the scale of a 2,000-student school with no service degradation |

---

## 10. Success metrics

Proposed indicators (final identifiers in `prd/cross-cutting/38-kpi-success-metrics.md`):

| Indicator | Indicative target | Source |
|---|---|---|
| Median time to deliver an absence notification to the operator after the attendance-taking confirmation | Under 5 minutes (§10) | Delivery traces |
| Per-channel delivery rate (push, WhatsApp, SMS, email) | Above 95% per active channel | Delivery traces |
| Announcement read rate within 48 hours | Tracked per school, with no target set in MVP | Read receipts |
| WhatsApp opt-in rate among active guardians | Tracked monthly; a DEC-36 adoption indicator | Consents |
| Communication cost per active student per month | Kept in check through packs and threshold alerts (DEC-28) | Counters |
| Share of inbound WhatsApp conversations in total cost after 01/10/2026 | Tracking the switch (H-20) | Counters |
| Share of parent-teacher threads resolved with no school-leadership intervention | Qualitative tracking in V1 | Closed threads |
| Response rate to summonses and authorizations before the deadline | Above 90% after reminders | Read tracking and authorizations |

---

## 11. Open questions

`OQ-NN` counter specific to this file (conventions §2).

| ID | Question | Context |
|---|---|---|
| OQ-01 | Version at which moderated parent-teacher threads activate. | **Resolved — ARB-21a**: MVP, in-app, in moderated mode per DEC-34 ("enabled by default") and BES-ENS-05; BES-PAR-08 and the journey map are aligned; push and WhatsApp thread notifications in V1. |
| OQ-02 | Baseline updates from the research affecting COM, to be arbitrated by the founder. | (a) WhatsApp: the 01/10/2026 switch clarified — the end of free service and utility messages within the 24-hour window, Morocco moving off the "Rest of Africa" rates onto a standalone rate card, published before 01/09/2026 (`prd/research/00-baseline-corrections.md` divergence No. 6; DEC-36 and H-20 to update). (b) Timezone: a permanent switch to UTC+0 on 20/09/2026, the Ramadan exception disappears (divergence No. 1; baseline §10 to update); sending windows and timestamps modeled in fixed UTC+0. (c) Usage: the "8% basic phone / 14% rural" figures not found in the ANRT 2024-2025 edition (divergence No. 10); the SMS-fallback rule is kept with no reuse of that figure. |
| OQ-03 | Events produced by COM. | The catalog of `prd/03-domain-data-model.md` §7 treats COM as a consumer; this chapter proposes adding `AnnouncementPublished`, `ThreadOpened`, `ThreadClosed`, `OutingAuthorizationSubmitted`, `AppointmentConfirmed`, `CreditThresholdReached`. Reconciliation needed on review. |
| OQ-04 | The exact scope of "moderation" (DEC-34). | The baseline provides for school-leadership viewing of threads, flagged to users; it does not provide for removal or prior censorship. Adopted assumption: traced viewing with no removal; a school wanting editorial control must have the baseline changed. To be settled on review. |
| OQ-05 | Re-billing inbound WhatsApp conversations after 01/10/2026. | **Resolved for attribution — ARB-21g**: billed to the school (as with sending), handled by FR-COM-18; still open: the final pricing model (per message or per conversation, Morocco's rate card) to confirm once published (H-20), and its impact on DEC-28 consumables. |
| OQ-06 | WhatsApp scope in MVP (founder arbitration D1). | Settled: in MVP, WhatsApp utility is limited to attendance notifications (same-day absence) with minimal templates, alongside in-app and SMS; general rollout (every message type, managed templates, push) stays in V1. Tags aligned: §1, FR-COM-04, FR-COM-05, FR-COM-08, FR-COM-09, FR-COM-11; updating the baseline's §12 (DEC-36) is to be carried through on review. |
| OQ-07 | Bilingualism of content (founder arbitration D7). | Settled: mandatory FR/AR bilingualism applies to institutional content (templates, school announcements, authorizations, documents); individual messages and parent-teacher threads follow UX-08 (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` §4.E) — the author's language rendered as-is, with assisted translation optional in V2+. FR-COM-06 rewritten accordingly; supplemented by ARB-21c: an SMS or WhatsApp message is sent only in the recipient's own language (FR-COM-17). |
| OQ-08 | Retention period for outing parental authorizations (FR-COM-14). | DEC-22 sets 2 years for messages; the authorization is evidence for civil-liability purposes in case of an accident. Proposal: 5 years after the event, to be confirmed by the founder and carried into DEC-22 and CNDP declarations (`prd/cross-cutting/36-legal-compliance-data-protection.md`). |

---

## 12. Traceability

A table mapping baseline IDs to the requirements and sections of this file that cover them.

| Baseline ID | Element | Coverage |
|---|---|---|
| §2.9 | Bilingualism, dual script | FR-COM-01, FR-COM-06, FR-COM-15; §5 |
| §2.10 | Digital usage (WhatsApp, SMS, email rarely checked, mobile-first) | FR-COM-04, FR-COM-05, FR-COM-10; §2, §5 |
| §6.10 | COMMUNICATION and PLATFORM entities | §6 |
| §7.4 | Absence notification linked to attendance-taking | FR-COM-11; PC-05 |
| §7.7 | Multi-channel payment reminders | FR-COM-15; PC-07 |
| §7.8 | Communication (G-17): the module's full scope | FR-COM-01 to FR-COM-18 |
| §8.1–8.2 | Roles, fine-grained permissions, logging, least privilege | FR-COM-03, FR-COM-04, FR-COM-16 (RG-37, RG-38, RG-39) |
| §10 | Notification delay, timezone, platforms | FR-COM-04, FR-COM-11; §5, §9 |
| §11 | Consumables billed on top | FR-COM-08 |
| §12 | Scope by version | §1; the Version tag of every requirement |
| RG-02 / DEC-20 | Adult student, parental restriction | FR-COM-05 |
| RG-12b | No shared account: preferences per person | FR-COM-05 |
| RG-13 / INV-10 | Every legal guardian informed by default | FR-COM-05, FR-COM-11 |
| RG-14b | The legal tutor as signatory | FR-COM-14 |
| RG-21 / DEC-02 / INV-17 | Per-tenant isolation | §6, §9 |
| RG-38 / INV-33 | Logging of writes and sensitive views | FR-COM-16; §9 |
| RG-39 / INV-34 | Teacher's least privilege | FR-COM-03 |
| DEC-10 | Bilingual FR/AR interface and content | FR-COM-01, FR-COM-06, FR-COM-15 |
| DEC-11 / INV-37 | Mobile phone as contact identifier, email optional | FR-COM-05; §5 |
| DEC-12 | Channels: in-app, SMS, WhatsApp priority, email secondary | FR-COM-04 |
| DEC-22 | Retention: messages and notifications 2 years, logs 5 years | FR-COM-07, FR-COM-14, FR-COM-16 |
| DEC-26 | Messaging providers and F118 | §5, §8 |
| DEC-28 | Consumables (SMS, WhatsApp) billed on top, packs | FR-COM-08 |
| DEC-34 / Q-17 | Moderated threads: governed initiation, school-leadership view flagged | FR-COM-03, FR-COM-16; OQ-01, OQ-04 |
| DEC-36 | Push hierarchy, WhatsApp utility opt-in, SMS fallback; tariff switch | FR-COM-04, FR-COM-09, FR-COM-10, FR-COM-11 |
| G-17 | Real channels, costs, preferences | The whole module (§1) |
| H-11 | Parents' WhatsApp preference | §2, §5 |
| H-20 | WhatsApp tariffs after 01/10/2026 | FR-COM-09; OQ-02, OQ-05 |
| UX-08 (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` §4.E) | The author's language for user-generated content | FR-COM-06; OQ-07 |
| NFR-I18N-01 (`prd/cross-cutting/32`) | A language per user | FR-COM-17 |
| FR-VSC-04 (`prd/modules/13`) | Aggregation and correction rules for absence notifications | FR-COM-11 |
| CNF-09 (`prd/cross-cutting/36`) | Sub-processors outside Morocco (FCM, APNs, Meta) | §8 |
| ARB-10 (`prd/cross-cutting/42`) | Adult-student routing from the MVP | FR-COM-05 |
| ARB-15 (`prd/cross-cutting/42`) | The day's first absence, a 3-minute retention window, a correction notice | FR-COM-11; §1 |
| ARB-21 a–h (`prd/cross-cutting/42`) | MVP threads, no push in MVP, per-person language, STOP scope, sending windows, "read" status, a single WhatsApp account, authentication SMS | FR-COM-03, FR-COM-04, FR-COM-05, FR-COM-06, FR-COM-07, FR-COM-08, FR-COM-09, FR-COM-17, FR-COM-18 |
| ARB-25 c/d/j (`prd/cross-cutting/42`) | WhatsApp transfer basis, FCM/APNs in the sub-processor register, MVP logging | FR-COM-05, FR-COM-16; §8 |
