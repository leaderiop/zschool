# ZSchool — Chapter 07: Student Journeys — Youssef (Middle Schooler) and Salma (Adult High Schooler)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09; supersedes 0.2 — revised 09/09/2026) |
| Date | 2026-09-09 |
| Status | PRD draft — under review; arbitrations ARB-01 to ARB-26 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §2.2 (system structure, weightings), §2.4 (calendar), §2.6 (Massar, Massar code/CNE), §2.10 (digital usage, H-11), §5.2 (personas Youssef and Salma), §6.1 (RG-01, RG-02), §6.3 (enrollment lifecycle, RG-09), §6.4 (parent–student relationships, RG-12b to RG-16), §6.9 (RG-27 to RG-34), §7.2 (re-enrollment), §7.3 (timetable, lesson log), §7.5 (assessments, report cards, transcripts), §7.6 (documents), §7.9 (transfers), §8 (roles and permissions), §9 (security and compliance), §10 (non-functional requirements), §12 (scope by version), §14 (DEC-03, DEC-09, DEC-10, DEC-11, DEC-12, DEC-20, DEC-22, DEC-24, DEC-29, DEC-30, DEC-32, DEC-36), §15 (Q-02), §16 (H-11, H-12), §17 (glossary); `prd/research/00-baseline-corrections.md` (discrepancies 1 and 10); `prd/research/04-pedagogy-massar-calendar.md`; `prd/research/05-infrastructure-usage.md` |
| Related files | `prd/00-conventions.md`; `prd/02-actors-personas.md` (BES-ELE-01 to BES-ELE-08); `prd/03-domain-data-model.md` (INV-05, INV-08, INV-13, INV-20, INV-21, INV-23, INV-24, INV-26, INV-33, INV-35, INV-36, INV-37, INV-39); `prd/journeys/00-journey-map.md` (PC-04, PC-06, PC-09, PC-10); `prd/journeys/01-school-group-director.md`, `prd/journeys/02-secretary-cashier.md`, `prd/journeys/03-head-supervisor.md`, `prd/journeys/04-part-time-teacher.md`, `prd/journeys/05-multi-school-parent.md`, `prd/journeys/06-custodial-mother-and-guardian.md` (other personas' journeys); modules: `prd/modules/11-admissions-enrollment-reenrollment.md` (INS), `prd/modules/12-academic-structure-timetables.md` (PED), `prd/modules/13-attendance-student-life-discipline.md` (VSC), `prd/modules/14-assessments-grades-report-cards.md` (EVA), `prd/modules/15-documents-certificates.md` (DOC), `prd/modules/16-finance-billing-collections.md` (FIN), `prd/modules/17-communication-notifications.md` (COM), `prd/modules/18-transfers-mobility.md` (TRA), `prd/modules/23-health-sensitive-data.md` (HEA); cross-cutting: `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/38-kpi-success-metrics.md` |

---

## 1. Purpose and scope

This file describes the detailed journeys of the "student" persona (`ELE`, conventions §2), carried by two baseline profiles (§5.2):

- **Youssef, 13, Grade 8**: a minor middle schooler who views his timetable, grades, and homework **on the family phone** shared with his father Ahmed (persona `PAR`, `prd/journeys/05-multi-school-parent.md`). His access is governed by **RG-01** (personal access activated by a legal guardian from a level set by the school, default: Grade 7) and set for his level (Grade 8 beyond the Grade 7 default).
- **Salma, 18, 2nd-year baccalaureate**: an **adult** high schooler (18 Gregorian years completed, art. 209 of the Family Code). At majority, she becomes **the holder of her own account and rights over her data** (RG-02, DEC-20): informed of her rights, restricting parental access to school, disciplinary, and health data, financial access kept for the liable financially responsible parent, transcripts for her post-baccalaureate applications, then permanent access to her published documents after leaving (RG-28).

The journeys below detail the `PJ-ELE-NN` steps referenced by the map `prd/journeys/00-journey-map.md` (PC-04 activation/claim, PC-06 grades and report cards, PC-09 transfer and departure, PC-10 self-service documents). They cover needs **BES-ELE-01 to BES-ELE-08** of `prd/02-actors-personas.md`.

**In scope**: activating student access (PJ-ELE-01); daily use (PJ-ELE-02); notification and viewing a report card (PJ-ELE-03); reaching majority and information on rights (PJ-ELE-04); restricting parental access (PJ-ELE-05); annual and cumulative transcripts for post-baccalaureate applications (PJ-ELE-06); year end: the decision and the achievement certificate (PJ-ELE-07); post-baccalaureate departure or a departure outside ZSchool and permanent access to published documents (PJ-ELE-08); the student contesting a grade or an absence (PJ-ELE-09).

**Out of scope**: admission and front-desk enrollment (journeys 01 DIR and 02 SEC, PC-01); a parent claiming the identity, detailed in journeys 05 and 06 (PC-04); morning roll call and absence notification to guardians (PC-05, journeys 03 and 04); grade entry and class councils (PC-06, journeys 01 and 04); managing the transfer on the schools' side (PC-09, journeys 01 and 02); a guardian's finance and payments (PC-07, PC-08); operational health data (module HEA, V2+, `prd/journeys/00-journey-map.md` §5); e-learning, the digital school passport, transport, and canteen (V2+, `prd/journeys/00-journey-map.md` §5); university pre-enrollment and higher education, out of scope (DEC-29).

---

## 2. Personas and access context

### 2.1 Summary of both profiles

| Attribute | Youssef (a minor, `ELE`) | Salma (an adult, `ELE`) |
|---|---|---|
| Baseline profile | 13, Grade 8; views his timetable, grades, and homework on the family phone (§5.2) | 18, 2nd-year baccalaureate; wants her own access and transcripts for her post-baccalaureate applications (§5.2) |
| Legal access framework | RG-01: personal access **activated by a legal guardian**, from the level set by the school (default: Grade 7); no minor-specific rule under Law 09.08: consent is given by the legal representative (§2.7) | RG-02, DEC-20: the holder of her own account and rights at 18 years completed; informed of her rights at majority and at every re-enrollment; parental access restriction at her own hand (school, disciplinary, health); financial access kept by the liable payer |
| Device and connection | A shared **family** phone (an Android smartphone), limited data, sometimes unstable network (§2.10); 91.2% of individuals aged 5 and over use the internet and 78.4% of rural households are connected (ANRT 2024-2025, `prd/research/05-infrastructure-usage.md` §2) | A **personal** smartphone, an unstable mobile network; a median mobile speed of 60.31 Mbps (DataReportal, `prd/research/05-infrastructure-usage.md` §2) |
| Dominant goals | Knowing what to review, where, and when; seeing her grades as soon as published (BES-ELE-01 to BES-ELE-04) | Documentary autonomy: cumulative transcripts, attestations, permanent access after departure (BES-ELE-05 to BES-ELE-08) |
| What he/she does not see | Unpublished grades, finance, health (baseline §8.3 matrix) | Per her own restriction choices for her parents; she herself keeps her full scope |

### 2.2 Cross-cutting access framework

- **One account per person**: no account is shared between two people (RG-12b, INV-13). On the family phone, Ahmed's account and Youssef's account are two separate accounts with separate sessions and an explicit sign-out between uses.
- **A login identifier distinct from the contact identifier** (ARB-07, INV-45): the mobile phone number is the primary contact identifier, e-mail is optional and never required (DEC-11, INV-37); a minor student with no phone of their own gets a **platform-generated login identifier** (readable, not derived from the Massar code), activated by a legal guardian with an OTP to that guardian's number; migrating to a personal number is possible at any time and tracked (OQ-06 resolved).
- **Contextual permissions**: the student role carries limited read rights (§8.3 matrix: reading the timetable, attendance, published report cards, partial discipline, the record; no finance, no health), refined by the fine-grained permissions of `prd/cross-cutting/30-roles-permissions-matrix.md` (least privilege, RG-39).
- **Logging**: every write action is historized with author, context, and timestamp from MVP (D4, ARB-25j); an immutable, exportable audit log also covering sensitive views in V1 (RG-38, INV-33, kept 5 years, DEC-22).
- **Market reference**: the ministry's Massar apps (Moutamadris, Waliye, Moudaris) have not been updated since 2022 and are rated 3.1/5 with connection complaints dominant (Play Store, `prd/research/01-market-competition.md` §4); connection reliability and notification robustness set the entry bar for the student space.

---

## 3. Journey overview

| ID | Journey | Persona | Map journey | Modules involved | Dominant version |
|---|---|---|---|---|---|
| PJ-ELE-01 | Activating the student's personal access by a legal guardian | Youssef | PC-04 | ADM, INS, COM | MVP |
| PJ-ELE-02 | Daily use: today's sessions, grades, homework, attendance | Youssef | PC-06 | PED, EVA, VSC, PRT | MVP (core, grades published progressively); V1 (timetable, homework) |
| PJ-ELE-03 | Notification and viewing a published report card | Youssef | PC-06 | EVA, DOC, COM | MVP (in-app, SMS); V1 (push, QR) |
| PJ-ELE-04 | Reaching majority: account ownership and information on rights | Salma | PC-04 | ADM, INS, COM | MVP (ARB-10) |
| PJ-ELE-05 | Parental-access restriction by the adult student | Salma | PC-04 | ADM, COM | MVP (ARB-10) |
| PJ-ELE-06 | Annual and cumulative transcripts for post-baccalaureate applications | Salma | PC-06, PC-10 | EVA, DOC | MVP wave 2 (annual transcript); V1 (cumulative transcript, QR, self-service) |
| PJ-ELE-07 | Year end: the year-end decision and the achievement certificate | Youssef, Salma | PC-02, PC-06, PC-10 | INS, EVA, DOC, COM | MVP wave 2 (decision, COMPLETED status, rollover); V1 (a sealed achievement certificate) |
| PJ-ELE-08 | Post-baccalaureate departure or a departure outside ZSchool: permanent access to published documents | Salma | PC-09, PC-10 | TRA, DOC, FIN | MVP (permanent reading, a PDF exit dossier); V1 (a secure link, QR) |
| PJ-ELE-09 | Contesting a grade or an absence from her student access | Youssef, Salma | PC-05, PC-06 | VSC, EVA, COM | MVP (ARB-15, ARB-21) |

Reading conventions: each journey is described by an attribute table followed, for critical flows, by Gherkin acceptance criteria. Screens are described in text (section 8); steps refer to modules by code — `prd/modules/11-admissions-enrollment-reenrollment.md` (INS), `prd/modules/12-academic-structure-timetables.md` (PED), `prd/modules/13-attendance-student-life-discipline.md` (VSC), `prd/modules/14-assessments-grades-report-cards.md` (EVA), `prd/modules/15-documents-certificates.md` (DOC), `prd/modules/16-finance-billing-collections.md` (FIN), `prd/modules/17-communication-notifications.md` (COM), `prd/modules/18-transfers-mobility.md` (TRA) — without duplicating their requirements.

---

## 4. Detailed journeys

### PJ-ELE-01 — Activating the student's personal access by a legal guardian

| Attribute | Content |
|---|---|
| Objective | Give an eligible student personal read access to her school data, activated by a legal guardian, with no new identity created and no duplicate of the parent's account, on the available device (here, the family phone). |
| Actors | The legal guardian (activation), the student (first sign-in), the school (configuring the access level), the platform (creating the account linked to the existing profile, logging). |
| Preconditions | An ACTIVE enrollment (ACTIVE status, RG-08, INV-05); an existing student profile with a linked identity (from enrollment or a parental claim, PC-04); an active legal guardian on the relationship (RG-13, INV-09). |
| Configuration | The school sets the **student access level** in its settings; the platform default: from Grade 7 (RG-01, INV-36). A primary school may set a higher level; a middle/high school keeps the default. The parameter is by entry level, logged on every change. |
| Walkthrough | 1. Ahmed, a legal guardian, opens Youssef's record from his account (the "Enrollment" section, "Student access" tab); the "Activate student access" button only appears if the enrollment's current level (Grade 8) reaches the configured level. 2. An activation screen: a reminder of student access's scope (reading: the timetable, published grades, homework, attendance, documents; no finance or health, §8.3 matrix); **Youssef's login identifier**: his own mobile if he has one, otherwise a platform-generated identifier (readable, not derived from the Massar code, ARB-07); an initial password set by the guardian, to change on first sign-in; a confirmation OTP sent to Ahmed's number. 3. Confirmation by the guardian; creating the `User` linked to the existing `StudentProfile` (no new identity, INV-13); historizing the activation (author = the legal guardian, date, school context). 4. Youssef's first sign-in on the family phone: an account-selection screen on the shared device (Ahmed's/Youssef's accounts), opening a dedicated session, an FR/AR language switch available, a short first-visit tutorial. 5. In any case, the legal guardian keeps the ability to suspend student access from the same screen (a logged reason); the school may disable access (departure, an error) with traceability. |
| Data and events | A `User` linked to the `StudentProfile`; `ParentStudentRelationship` unchanged (activation changes neither the parent's qualities nor rights); an audit entry (RG-38). |
| Confidentiality and traceability | The student account is personal and individual (RG-12b); activation and suspension are logged; no financial data is exposed to the student account (§8.3 matrix). |
| Version | MVP (§12: global identities, invitations, and claim; the student dashboard). |
| Needs covered | BES-ELE-01. |
| Traceability | (→ RG-01, RG-12b, RG-38, DEC-03, DEC-11; INV-13, INV-36, INV-37) |

```gherkin
Feature: Activating student access by a legal guardian

  Scenario: Activating an eligible student with no phone of their own (MVP)
    Given Youssef enrolled ACTIVE in Grade 8 at a school whose student access level is at the Grade 7 default
    And Youssef with no active account and no personal mobile number
    When Ahmed, a legal guardian, activates student access from Youssef's record and validates the OTP received on his own number
    Then an account is created with a generated login identifier linked to Youssef's existing student profile, with no additional identity created
    And Youssef can sign in from the family phone with this identifier and a session distinct from Ahmed's
    And the activation is historized with the author (legal guardian), date, and school context

  Scenario: A student below the school-set access level (MVP)
    Given a Grade 6 student at a school configured at the Grade 7 default
    When the legal guardian tries to activate student access
    Then activation is refused with a bilingual message stating the school-set access level
    And no student session is created

  Scenario: The school changing the access level (MVP)
    Given a director signed in to their school's settings
    When they raise the student access level from Grade 7 to Grade 8 for the current year
    Then the change is recorded, dated, and logged
    And guardians of students below the eligible levels no longer see the activation action
```

### PJ-ELE-02 — Daily use: timetable, grades, homework, attendance

| Attribute | Content |
|---|---|
| Objective | Give the student a single, reliable daily entry point on her school life, viewable in seconds on an entry-level smartphone with a variable mobile connection, including on the family phone late in the evening. |
| Actors | The student (viewing), teachers and leadership (producing the data: timetable, homework, grades, attendance), the school (publication settings). |
| Preconditions | An active student account (PJ-ELE-01); data published by the school (a published timetable, published grades and report cards, homework entered in the lesson log). |
| Walkthrough | 1. The student home screen (mobile-first): a "Today" banner (in MVP, today's declared sessions; in V1, courses drawn from the timetable with the active variant shown, ARB-04), the latest published grades and report cards, homework due, recent notifications. 2. A "Timetable" tab (V1): a weekly grid readable in portrait, **period variants** (normal, shortened Ramadan hours, exams) with the active variant explicitly labeled; the week extended to Saturday morning where the school configures it (§2.4; a working Saturday is the norm, `prd/research/04-pedagogy-massar-calendar.md` §3). 3. A "Results" tab: published grades by subject and period, averages and honors as published; **unpublished** grades stay invisible to the student (§8.3 matrix: "unpublished grades" — student access forbidden); progressive grade publication before the report card is a school setting from MVP (a "draft/published" mark status, FR-EVA-19, ARB-17f); a contested grade or absence follows PJ-ELE-09. 4. A "Homework" tab (V1): work due and resources from the student's courses' lesson logs. 5. An "Attendance" tab: her absences, tardiness, and early departures, excuse status (read-only; excusing stays a parent action, PC-05). 6. On the family phone: at the end of every use, returning to the account-selection screen; none of Youssef's data is viewable from Ahmed's session (separate accounts, RG-12b). 7. Network behavior: typical pages under 2 s on mobile network (§10); lightweight caching of the timetable and homework to tolerate outages; graceful degradation (image-free lists) in low-bandwidth mode (`prd/research/05-infrastructure-usage.md` §2). |
| Data and events | Views of `Timetable`, published `Mark`/`PeriodResult`, `Assessment` (homework), `AttendanceRecord`; sensitive views logged (RG-38). |
| Confidentiality and traceability | Read-only across the whole scope; least privilege: the student only sees her own data (RG-39); no financial or health data (§8.3 matrix). |
| Version | MVP: the student home screen (declared sessions), grades published progressively and report cards, attendance read-only. V1: a timetable with variants, homework and the lesson log (§12; BES-ELE-02, BES-ELE-04; ARB-04, ARB-17f). |
| Needs covered | BES-ELE-02, BES-ELE-03, BES-ELE-04. |
| Traceability | (→ RG-01, RG-12b, RG-39, §2.4, §7.3, §7.5, §10; INV-34) |

### PJ-ELE-03 — Notification and viewing a published report card

| Attribute | Content |
|---|---|
| Objective | Guarantee that the family and student learn of report-card publication through a reliable channel and view an immutable, bilingual, verifiable document, with no paper distribution. |
| Actors | Leadership (period closing and publication), the student and guardians (notification, viewing), the platform (multi-channel routing, immutability). |
| Preconditions | The period closed and grades locked (`PeriodClosed`, module EVA); the report card generated and published (RG-33, DEC-09). |
| Walkthrough | 1. On publication, the published-report-card event triggers a notification to **the student and legal guardians and the holder of custody** (event consumers, `prd/03-domain-data-model.md` §7): in-app and SMS in MVP; in V1, a push-first, WhatsApp "utility" for consenting parents, SMS-fallback hierarchy (DEC-12, DEC-36). 2. Youssef receives the notification on the family phone (the student session); Ahmed receives it on his preferred channel. 3. Viewing the report card: a bilingual AR/FR PDF (names in both scripts), the school's header, seal and signature, **version, fingerprint, signatory, date**, plus, in V1, the verification QR code (RG-33, INV-26); opens under 3 s (§10). 4. Version history: if a correction is published, a new version is created; the old one stays viewable marked "superseded" (RG-33). 5. The report card stays viewable indefinitely in "My documents" (permanent reading, RG-28, PJ-ELE-08). |
| Data and events | `ReportCard` (versions, fingerprint, signatory, QR), `Notification` + `DeliveryLog` (channel, status, cost charged to the school). |
| Confidentiality and traceability | The published report card is fixed and third-party verifiable; drafts and deliberations stay invisible (RG-29, INV-21); distribution tracked via `DeliveryLog`. |
| Version | MVP: immutable publication, in-app and SMS notification. V1: push, WhatsApp, a verification QR code (§12; DEC-30 for the advanced electronic seal). |
| Needs covered | BES-ELE-03. |
| Traceability | (→ RG-28, RG-29, RG-33, DEC-09, DEC-12, DEC-30, DEC-36; INV-26) |

```gherkin
Feature: Report-card publication and notifying the student and guardians

  Scenario: Immediate notification and viewing (MVP; QR in V1)
    Given Youssef's first-semester report card published and locked by leadership
    When publication happens
    Then Youssef and his legal guardians and the holder of custody receive a notification within a short delay (in-app and SMS in MVP)
    And the report card viewed carries its version, fingerprint, signatory, date, and, in V1, a verification QR code
    And the report card opens in under 3 seconds (§10)

  Scenario: A correction after publication (MVP)
    Given the first-semester report card already published
    When leadership publishes a corrected version
    Then a new version is created and notified
    And the old version stays viewable marked "superseded"
    And each version keeps its distinct fingerprint and, in V1, its distinct QR code
```

### PJ-ELE-04 — Reaching majority: account ownership and information on rights

| Attribute | Content |
|---|---|
| Objective | Guarantee that at 18 years completed the student becomes the holder of her own account and data rights, that she is clearly and bilingually informed of it **at majority and at every re-enrollment** (RG-02), and that the school is informed, with nothing else changing by default. |
| Actors | The platform (detecting majority), the adult student (information, ownership), the school (notification, re-enrollments), guardians (no change by default). |
| Preconditions | The person's date of birth on file; an ACTIVE enrollment at the time of majority (the case of an adult student with no active enrollment is covered by PJ-ELE-08). |
| Walkthrough | 1. Detection: the platform detects the 18th birthday (18 Gregorian years completed, art. 209 of the Family Code) on the `Person` and triggers the majority event (`StudentReachedMajority`, `prd/03-domain-data-model.md` §7). 2. Informing the student: a bilingual notification and a "Your rights" screen recalling: account ownership and rights over her data; the **right to restrict at any time** her parents' access to school, disciplinary, and health data; the **default maintenance** of guardians' access while the enrollment is active; the **maintenance of the financially responsible parent's financial access** as long as they remain liable (RG-02, DEC-20, Q-02); permanent access to her published documents even after departure (RG-28). 3. Informing the school: a notification to the director (no action required); the list of students who have reached majority is viewable by leadership. 4. Information at every re-enrollment: the pre-filled re-enrollment form (campaign PC-02) shows the adult-student rights notice again before confirmation (RG-02). 5. Ownership: Salma's account — opened via RG-01 while she was in high school — stops depending on parental activation; her credentials are hers: if her access had been activated with an identifier generated on the family phone, she migrates to her personal mobile number by double OTP, a tracked operation (DEC-11, ARB-07; OQ-06 resolved). 6. No restriction is applied automatically: by default, guardians' access is **maintained** while the enrollment is active (RG-02); the restriction is a voluntary act by the student (PJ-ELE-05). |
| Data and events | The `StudentReachedMajority` event (logged); a majority attribute on the person; a tracked information notice (majority, re-enrollments). |
| Confidentiality and traceability | Moroccan law gives parents no right to information about an adult child, but they stay signers of the contract and payers (RG-02, Q-02); every information step is timestamped (compliance proof for the school). |
| Version | **MVP** (INV-35, ARB-10: RG-02 is a legal rule and pilots have 2nd-year baccalaureate students reaching 18 in 2026-2027; BES-ELE-05 realigned; OQ-01 resolved). |
| Needs covered | BES-ELE-05. |
| Traceability | (→ RG-02, DEC-20, Q-02, §2.7; INV-35) |

### PJ-ELE-05 — Parental-access restriction by the adult student

| Attribute | Content |
|---|---|
| Objective | Let the adult student restrict **at any time** her guardians' access to school, disciplinary, and health data, while keeping the liable financially responsible parent's financial access, with full logging and notification to the school (RG-02, DEC-20). |
| Actors | The adult student (decision), restricted or unrestricted guardians, the school (notified, the operational arbiter on conflict, RG-16), the platform (execution, logging). |
| Preconditions | An adult student holding her own account (PJ-ELE-04); active guardians on the relationship; the enrollment is ACTIVE (a restriction is moot after closing, see PJ-ELE-08). |
| Walkthrough | 1. From the "My rights" screen, Salma sees each guardian's access status by **data block**: school (published grades, report cards, transcripts, attendance), disciplinary (incidents, sanctions, councils, conduct), health (a V2+ module; the block is present in the model from MVP so it can apply once the health module ships). 2. Salma restricts one or more blocks for a given guardian; a confirmation screen recalling: the immediate effect; keeping the financially responsible parent's financial access as long as they remain liable (payment schedule, receipts, balance); **reversibility at any time**; logging and notification to the school. 3. Immediate effect: the restricted blocks disappear from the guardian's portal and their matching notifications; the student keeps her own access in full (RG-02: an adult student keeps access to her data despite the parental restriction, BES-ELE-07). 4. Logging: every restriction (and every restoration) is historized with author (the student), the exact scope (blocks, guardian, school), and a timestamp (RG-38; an exportable audit log in V1, INV-33). 5. Notification to the school: leadership is notified of every change (RG-02); the school-side student record shows the current state of parental access with the change history (read-only for the school: it can neither restrict nor restore on the adult student's behalf). 6. Handling conflicts: if a guardian objects, the school is the operational arbiter and may record documents (a ruling, correspondence); ZSchool does not decide (RG-16). Conversely, for a **minor** student, the only path to restrict a parent's access remains a court ruling recorded by the school with an attachment (RG-14, INV-10): the "My rights" facility exists only for adults. 7. Reversibility: Salma restores access in the same way (confirmation, logging, notification to the school). |
| Data and events | Restriction state by (student, guardian, block, school); audit entries; an access-change event consumed by leadership; consents and revocations tracked per INV-24. |
| Confidentiality and traceability | Full logging (RG-38); notification to the school (RG-02); whether the restricted guardian is notified and fine-grained sub-blocks are left open (OQ-03, OQ-04); the emergency contact and health emergencies stay outside the scope of the school restriction (see OQ-05). |
| Version | **MVP** (INV-35, ARB-10; BES-ELE-05, BES-ELE-07 realigned; OQ-01 resolved). The "health" block only takes effect once the HEA module ships (V2+). |
| Needs covered | BES-ELE-05, BES-ELE-07. |
| Traceability | (→ RG-02, RG-14, RG-16, RG-38, DEC-20, Q-02; INV-10, INV-24, INV-33, INV-35) |

```gherkin
Feature: Parental-access restriction at the student's majority

  Scenario: Information on rights at majority (MVP)
    Given Salma, a 2nd-year baccalaureate student, whose date of birth matches 18 Gregorian years completed
    And an ACTIVE enrollment at the school
    When the platform detects majority
    Then Salma receives a bilingual notification informing her of her ownership and her right to restrict parental access
    And the "Your rights" screen recalls the default maintenance of guardians' access and the maintenance of the liable payer's financial access
    And the school is notified of the majority (a logged event)
    And guardians' access stays unchanged by default

  Scenario: Restricting the school and disciplinary blocks, keeping the financial block (MVP)
    Given adult Salma signed in to her account
    And her father active as a legal guardian and financially responsible, liable for an installment
    When Salma restricts her father's access to the "school" and "disciplinary" blocks
    Then her father no longer sees her published grades, report cards, transcripts, attendance, or disciplinary data
    And her father keeps access to financial and contractual data: payment schedule, receipts, balance, and account statement
    And Salma keeps full access to all her data
    And the restriction is logged (author, exact scope, timestamp) and notified to the school

  Scenario: Reversibility of the restriction (MVP)
    Given an active restriction of the "school" block for the father
    When Salma restores access from the "My rights" screen
    Then the father's access to the "school" block is restored immediately
    And the restoration is logged and notified to the school

  Scenario: A minor student's guardian cannot restrict the other (MVP)
    Given a minor student whose father wants to restrict the mother's access
    When the father tries a restriction from his account
    Then the function does not exist for minors
    And only the school may record a minor student's parent restriction, on a court ruling with an attachment and traceability (RG-14)
```

### PJ-ELE-06 — Annual and cumulative transcripts for post-baccalaureate applications

| Attribute | Content |
|---|---|
| Objective | Let Salma build her post-baccalaureate file herself and without delay: bilingual, signed, verifiable annual and cumulative transcripts, self-service downloadable, never withheld for unpaid fees. |
| Actors | The adult student (request and download), leadership (self-service document settings, issuing transcripts), the school (permanent retention), a third-party recipient (verification by QR code). |
| Preconditions | Results published and closed; certifying-exam grades (the regional exam for 1st-year baccalaureate, the national exam for 2nd-year) integrated from the ministry's results (§7.5); the school having enabled document self-service (V1). |
| Walkthrough | 1. In "My transcripts," Salma picks an **annual** transcript (year by year, common trunk, 1st-year baccalaureate, 2nd-year baccalaureate; MVP wave 2, issued by the school at the front desk then self-service in V1) or a **cumulative** one (a multi-year summary of the qualifying secondary cycle, V1). 2. On-demand generation: a bilingual AR/FR PDF, the school's details (name, authorization, AREF), civil status in both scripts, the Massar code (the national candidate identifier for university pre-enrollment since 2015, §2.6), subject and general averages with level-and-track coefficients, published remarks, the year-end decision where applicable, the school's advanced electronic seal, a timestamp, numbering, and a **verification QR code** (DEC-30; V1). 3. 2nd-year baccalaureate continuous-assessment grades appear for their contractual share (25% of the baccalaureate, a configured and versioned national weighting, §2.2); the baccalaureate's final grade is the ministry's and appears only once official results are imported. 4. Download and sharing: immediate download, an availability notification; no dependency on the front desk or a parent's account. 5. Guarantees: **no blocking for unpaid fees** (DEC-24, INV-39); the transcript is available even with arrears, with the alert staying on the school-side record. 6. University applications and pre-enrollment happen outside ZSchool (DEC-29): ZSchool provides the documents and the QR code lets a third party verify their authenticity. 7. Issued transcripts are kept permanently by the school (DEC-22) and stay accessible to Salma after her departure (RG-28, PJ-ELE-08). |
| Data and events | `Transcript` (annual, cumulative), `Certificate` (where applicable), `PeriodResult`, `YearDecision`, a document-generated event (`DocumentGenerated`). |
| Confidentiality and traceability | Tracked numbering, a fingerprint, and QR (RG-33, DEC-30); generations logged (RG-38); unpublished internal data never exposed (RG-29). |
| Version | MVP wave 2 for the annual transcript issued by the school (FR-EVA-18, ARB-01: an MVP exit-dossier document); V1 for the cumulative transcript, the advanced seal, the QR code, and self-service (BES-ELE-06; §12 V1). |
| Needs covered | BES-ELE-06. |
| Traceability | (→ RG-28, RG-33, §2.2, §2.6, §7.5, §7.6, DEC-22, DEC-24, DEC-29, DEC-30; INV-20, INV-26, INV-39; ARB-01, ARB-19) |

### PJ-ELE-07 — Year end: the year-end decision and the achievement certificate

| Attribute | Content |
|---|---|
| Objective | Close the student's year with an explicit decision (promoted, repeating, graduated, streamed, undetermined), inform the family and student, and issue the achievement certificate with no trip needed. |
| Actors | Leadership and the class council (decision), secretariat (rollover, certificates), the student and guardians (information, download). |
| Preconditions | The second period closed; certifying-exam results imported for the levels involved (6AP, 3AC, 1st-year baccalaureate, 2nd-year baccalaureate); class councils held (V1). |
| Walkthrough | 1. The class council deliberates (promotion, repeating, streaming at the end of 3AC and the common trunk, §2.5); leadership records the **year-end decision** (RG-09; FR-EVA-13 and FR-INS-21, MVP wave 2, ARB-01) carried by the enrollment's COMPLETED status (state machine §6.3); for Salma, at a certifying level, the decision is first "undetermined" then updated once the baccalaureate results are imported in July (ARB-17i); "streamed" (a track choice at the end of 3AC, a year away for Youssef) is not a departure (ARB-03d). 2. At closing, the decision is notified to the student (if access is active) and to legal guardians and the holder of custody (in-app and SMS in MVP, DEC-12, DEC-36, ARB-21); the summer calendar integrates ministry deadlines (the national baccalaureate exam 01-03/06/2027, `prd/research/04-pedagogy-massar-calendar.md` §3). 3. Issuing the **achievement certificate** (for promoted/graduated decisions): in MVP, a numbered bilingual document issued at the front desk; in V1, an advanced electronic seal, timestamp, and QR code (DEC-30), self-service for the student (adult or with active access) and for guardians per the school's settings. 4. Rollover (MVP wave 2): for a promoted student, the pre-filled re-enrollment campaign (PC-02) offers confirming her N+1 enrollment, created as PRE-ENROLLED; for graduated Salma, no re-enrollment: the COMPLETED status with the "graduated" decision opens the departure file (PJ-ELE-08). 5. Repeating: the "repeating" decision is tracked and the year's report cards stay viewable (history kept, RG-28). |
| Data and events | `YearDecision` (1 — 1 COMPLETED `Enrollment`), the COMPLETED status, `Certificate` (the achievement certificate), notifications. |
| Confidentiality and traceability | The decision is timestamped and unchangeable after closing (read-only, RG-32); certificates numbered and verifiable; no blocking for unpaid fees (DEC-24). |
| Version | MVP wave 2 (year-end close, JAL-07): the COMPLETED status with a decision, council decision entry, rollover, a numbered achievement certificate at the front desk (ARB-01, ARB-03). V1: tooled council preparation, a certificate with an advanced seal and QR code (§12, DEC-30; the map's OQ-02 resolved). |
| Needs covered | BES-ELE-06 (documents), BES-ELE-08 (retention). |
| Traceability | (→ RG-09, RG-28, RG-32, §2.5, §7.2, §7.5, DEC-22, DEC-24, DEC-30; INV-05, INV-39) |

### PJ-ELE-08 — Post-baccalaureate departure or a departure outside ZSchool: permanent access to published documents

| Attribute | Content |
|---|---|
| Objective | Guarantee that the student — here Salma after her baccalaureate — keeps **lifelong** read access to her **published** school data, regardless of the reason for leaving (graduated, a transfer to a school outside ZSchool, withdrawal), and that the school keeps its archives (RG-28, DEC-07, DEC-23). |
| Actors | The former student (permanent reading), the origin school (retention, the exit dossier), the receiving school where applicable (outside ZSchool: receiving the exit dossier), the financially responsible parent (settling the balance). |
| Preconditions | The enrollment closed (COMPLETED, TRANSFERRED, or WITHDRAWN); documents published during her time at the school. |
| Walkthrough | 1. After closing, Salma's account switches to a read-only **"My documents"** portal: published report cards (every version), annual and cumulative transcripts, year-end decisions, issued attestations and official documents (the leaving certificate, the achievement certificate) — exactly the published data covered by RG-28/INV-20, within retention periods (DEC-22). 2. Never exposed through this portal: unpublished internal data (drafts, deliberations, remarks, ongoing disciplinary procedures, RG-29); **attendance** stays viewable as published data (RG-28) within its retention period (end of enrollment + 2 years then anonymization, DEC-22); **disciplinary data** is not published data under RG-28: only sanctions that were notified to the student stay readable by her, at the originating school and within the same retention period, never portable (RG-29, DEC-08). 3. Departure to a school **outside ZSchool**: generating the **bilingual PDF exit dossier** (identity, Massar code, years, levels and year-end decisions, the leaving certificate, the annual year-end transcript — the default transfer profile, RG-31/INV-23; the annual transcript and decision available from MVP wave 2, ARB-01), accessible via a **time-limited secure link with a verification QR code** (DEC-32, V1; the PDF exit dossier alone exists in MVP). The link is personal, expiring, revocable; every access is logged. To a ZSchool school, the transfer follows the full statuses (validated, accepted, activated, refused, cancelled, expired) and the origin only closes on the receiving school's activation (ARB-22). 4. Disciplinary and health data are **never** transferred automatically (RG-31, DEC-08); no further sharing to a third party happens without explicit, logged, bounded, revocable consent (RG-30, INV-24). 5. Financial component: the leaving certificate and official documents are **never** withheld for unpaid fees (DEC-24, INV-39); the financially responsible parent keeps access to the payment history and is the **only** recipient of the account statement, delivered separately from the exit dossier (ARB-20e); the financial relationship survives closing until settled (RG-12, INV-08). 6. Durability: permanent access survives the school's possible closure (export, 90-day read-only, operational-data deletion at 12 months; global identities and published documents maintained, DEC-23, INV-38); leadership's acceptance of this permanent access remains to be confirmed with pilots (H-12). 7. On a transfer to another ZSchool school: the identity is reused (no new identity, INV-43) and the receiving school only sees what the adult student chose to share (RG-30; for a minor, chosen by the legal guardian). |
| Data and events | A read-only closed enrollment (RG-32, INV-25), `Certificate` (the leaving certificate), the exit dossier, `TransferRequest` where applicable, an expiring secure link, audit entries for post-departure views. |
| Confidentiality and traceability | Permanent, tracked reading (RG-28, RG-38); possible anonymization of the global identity after 3 years of inactivity with no active relationship, with the school keeping an identity snapshot (first name, last name, date of birth, Massar code) in its registry for reissuing attestations (RG-34, DEC-22, INV-44, ARB-12); permanent retention of official documents (DEC-22). |
| Version | MVP: permanent reading of published documents, a PDF exit dossier. V1: a time-limited secure link with a QR code (DEC-32). |
| Needs covered | BES-ELE-07, BES-ELE-08. |
| Traceability | (→ RG-12, RG-28, RG-29, RG-30, RG-31, RG-32, RG-34, DEC-07, DEC-08, DEC-22, DEC-23, DEC-24, DEC-32, H-12; INV-20, INV-21, INV-23, INV-24, INV-25, INV-38, INV-39, INV-43) |

```gherkin
Feature: Permanent access to published documents after departure

  Scenario: Viewing after obtaining the baccalaureate (MVP)
    Given graduated Salma, her enrollment COMPLETED with the decision "graduated"
    When she signs in to her account after leaving the school
    Then she gets read-only access to her published report cards, transcripts, year-end decisions, and official documents
    And no unpublished internal data (drafts, deliberations, remarks) is exposed to her
    And every post-departure access is logged

  Scenario: A departure to a school outside ZSchool (MVP; a secure link and QR in V1)
    Given a closing for a departure to a school outside ZSchool
    When the exit dossier is issued
    Then a bilingual PDF matching the default transfer profile is generated (identity, Massar code, years, levels, decisions, the leaving certificate, the annual year-end transcript)
    And in V1 the dossier is accessible via a personal, time-limited, revocable secure link with a verification QR code
    And disciplinary data, health data, and the account statement do not appear in the dossier

  Scenario: No document blocking for unpaid fees (MVP)
    Given an unsettled financial balance at departure
    When the former student or the financially responsible parent requests the leaving certificate or transcripts
    Then the documents are generated with no blocking
    And the arrears appear only as an alert on the record and in the account statement given to the financially responsible parent
```

### PJ-ELE-09 — Contesting a grade or an absence from her student access

| Attribute | Content |
|---|---|
| Objective | Let the student (a minor with activated access, or an adult) flag an absence recorded when she was present, or a published grade that does not match her paper, in a moderated setup, and track the correction tracked by the school. |
| Actors | The student (contesting), the course's teacher or student life (correction), leadership (a post-closing correction, a new report-card version), guardians (informed for a minor). |
| Preconditions | Active student access (PJ-ELE-01); moderated in-app threads enabled (DEC-34, MVP, ARB-21a). |
| Walkthrough | 1. From the absence or grade screen, the student chooses "Contest" with a short reason; a moderated thread opens with student life (an absence) or the course's teacher (a grade) in the school's context; for a minor, legal guardians see the thread. 2. **Absence**: if the roll call is corrected, a correction notice is sent to guardians on the original channel and the absence disappears from the history with the correction tracked (ARB-15b); otherwise student life replies in the thread. 3. **A grade before closing**: the teacher corrects with a trace (before/after value) or explains; the republished grade replaces the old one. 4. **A grade after closing or a published report card**: leadership decides; any correction creates a new report-card version, with the old one staying viewable marked "superseded" (INV-26, ARB-17g). 5. ZSchool never decides; any change is a tracked school action. |
| Data and events | `AttendanceRecord`, `Mark`, `ReportCard` (versions), `Thread`, `Message`, `Notification`; correction historization. |
| Confidentiality and traceability | The thread is moderated and viewable by leadership (DEC-34); corrections carry author, before/after value, and timestamp (RG-38). |
| Version | MVP (moderated in-app threads ARB-21a; a correction notice ARB-15b; a new version INV-26). |
| Needs covered | BES-ELE-03; the counterpart of BES-PAR-10 (`prd/journeys/05-multi-school-parent.md`, PJ-PAR-12). |
| Traceability | (→ RG-33, RG-38, DEC-34; INV-26; ARB-15, ARB-17, ARB-21) |

```gherkin
Feature: Contesting by the student

  Scenario: An absence contested by Youssef and corrected (MVP)
    Given an absence recorded for Youssef at the 8 a.m. session when he was present
    When Youssef contests from his attendance screen and student life corrects the roll call
    Then a correction notice is sent to his guardians on the original channel
    And the absence no longer appears in his history, with the correction tracked on the school side

  Scenario: A grade contested by Salma after report-card publication (MVP)
    Given a published grade on Salma's report card that does not match her paper
    When Salma contests in the moderated thread and leadership approves the correction
    Then a new report-card version is published and notified to Salma
    And the old version stays viewable marked "superseded"
```

---

## 5. Cross-cutting confidentiality, permissions, and logging

The journeys in this file draw on a shared set of confidentiality rules, detailed below and carried by `prd/cross-cutting/30-roles-permissions-matrix.md` (permissions) and `prd/cross-cutting/31-security-privacy.md` (security):

| Subject | Rule applied | References |
|---|---|---|
| Individual accounts | One account per person, separate sessions on a shared device, an explicit sign-out | RG-12b, INV-13; §9 (session and device management) |
| Identification | Mobile phone as the primary contact identifier, e-mail optional; a generated login identifier for a minor with no phone of her own, a tracked migration to a personal number at majority | DEC-11, INV-37, INV-45, ARB-07 |
| A minor student's scope | Reading: the timetable, published grades, attendance, partial discipline, the record; never finance or health | §8.3 matrix; RG-39 |
| An adult student's scope | Same as a minor, plus: ownership, a parental restriction, full document self-service | RG-02, DEC-20 |
| A minor's parental restriction | Only on a court ruling recorded by the school, an attachment, and traceability | RG-14, INV-10 |
| An adult's parental restriction | At the student's own hand, by block (school, disciplinary, health), financial access kept for the liable payer, logged and notified to the school | RG-02, DEC-20, Q-02 |
| Conflicts between guardians | Flagged to the school, which stays the operational arbiter; ZSchool does not decide | RG-16 |
| Internal data | Unpublished grades, drafts, deliberations, remarks: invisible to the student and non-portable | RG-29, INV-21 |
| Post-departure data | Permanent reading of published data; non-portable beyond consented sharing; views logged | RG-28, RG-30, INV-20, INV-22 |
| Audit log | MVP: immutable historization of entries (activations, restrictions, document generations); V1: an exportable log also covering sensitive views and post-departure accesses; 5 years | RG-38, INV-33, DEC-22, ARB-25j |
| Consents | Any sharing beyond the default is logged, bounded in scope and duration, revocable | RG-30, INV-24 |
| Retention | Official documents permanent; attendance/discipline end of enrollment + 2 years; finance 10 years; anonymization rather than deleting registers | DEC-22, RG-34, INV-28 |

---

## 6. Morocco specifics

- **Time zone**: Morocco **permanently returns to UTC+0 on 20/09/2026 at 2:00 a.m.** (Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026), with no seasonal switch or Ramadan exception (`prd/research/00-baseline-corrections.md`, discrepancy 1). Student journeys therefore show times in permanent UTC+0 (`Africa/Casablanca`); the **Ramadan variant** remains a pedagogical need (shortened hours shown in Youssef's timetable) but is no longer a time-zone issue — a baseline discrepancy logged in OQ-02.
- **School calendar**: classes mandatory for everyone from Monday, 07/09/2026; four weeks of breaks plus mid-year; the national baccalaureate exam 01-03/06/2027; Saturday morning available as a configuration option (`prd/research/04-pedagogy-massar-calendar.md` §3). The student timetable reflects these periods and variants.
- **Baccalaureate weightings**: 25% 2nd-year continuous assessment + 25% 1st-year regional exam + 50% national exam (§2.2); configurable, school-year-versioned weightings (`prd/research/04-pedagogy-massar-calendar.md` §1, correction 3: memos 080.21/081.21 suspended on 29/11/2021). Salma's transcripts state the calculation basis as configured by the school.
- **Massar code and post-baccalaureate**: the Massar code has replaced the CNE since 2015 as the candidate identifier for university pre-enrollment (§2.6); it appears on Salma's transcripts and attestations. Pre-enrollment itself is out of scope (DEC-29).
- **Civil majority**: 18 Gregorian years completed (art. 209 of the Family Code); the Family Code reform stays an **unvoted report of proposals** as of 12/08/2026 (`prd/research/02-regulatory-data.md` §5): no impact on RG-02, with legal-tutor/holder-of-custody qualities staying recorded separately (RG-14b, INV-11).
- **Bilingualism**: every document and screen in the student journeys is available in FR and AR with full RTL support, names in both scripts on official documents (DEC-10, §2.9); English is V2 (§10).
- **Usage and the digital divide**: Android-first mobile-first, iOS well handled (Android 67.96%/iOS 32.02% of **web traffic** share, StatCounter — `prd/research/05-infrastructure-usage.md` §2); an SMS fallback for poorly connected households (rural household internet: 78.4%, ANRT 2024-2025); the phone stays the primary contact identifier (DEC-11).

---

## 7. Data and events used

Model entities (`prd/03-domain-data-model.md` §2) used by these journeys, without redefinition:

| Domain | Entities | Journeys |
|---|---|---|
| Identity | `User`, `Person`, `StudentProfile` | PJ-ELE-01, PJ-ELE-04 |
| Relations | `Enrollment` (and ACTIVE/COMPLETED/TRANSFERRED/WITHDRAWN statuses), `ParentStudentRelationship` (qualities, rights), `TransferRequest` | PJ-ELE-01, PJ-ELE-04, PJ-ELE-05, PJ-ELE-07, PJ-ELE-08 |
| School | `Level` (an access parameter), `Timetable`/`TimetableSlot` (variants), `EvaluationPeriod` | PJ-ELE-01, PJ-ELE-02 |
| School data | `Mark`, `PeriodResult`, `YearDecision`, `ReportCard`, `Transcript`, `Certificate`, `AttendanceRecord` | PJ-ELE-02, PJ-ELE-03, PJ-ELE-06, PJ-ELE-07, PJ-ELE-08 |
| Communication | `Notification`, `DeliveryLog` | PJ-ELE-03, PJ-ELE-04, PJ-ELE-07 |
| Platform | `AuditLog` (cross-cutting logging) | All |

Domain events consumed or produced (`prd/03-domain-data-model.md` §7): `ReportCardPublished` (notifying the student + guardians), `StudentReachedMajority` (information on rights, notifying the school), `DocumentGenerated` (transcripts, attestations, the exit dossier), `EnrollmentStatusChanged` (COMPLETED with a decision), `TransferValidated` (departure), `ConsentGranted`/`ConsentRevoked` (sharing beyond the default). The adult student's restrictions add to the audit entries described in PJ-ELE-05.

---

## 8. Key screens

Screens described in text, mobile-first, bilingual FR/AR with full RTL (`ECR-…` identifiers are carried by the module chapters, conventions §2):

1. **Account selection on a shared device**: a list of accounts already open on the device (avatars and first names), entering the secret on every session opening, no switching without first signing out; an FR/AR language choice from the home screen.
2. **Student home screen**: a "Today" banner (today's classes, room, active timetable variant), the latest publications (grades, report card, homework), recent notifications; empty (no publication) and offline (the latest cached content, with an age note) states.
3. **Timetable (V1)**: a weekly grid readable in portrait, a week selector, a variant selector (normal, Ramadan, exams) with an explicit label, course detail on tap (subject, teacher, room).
4. **Results**: a list by period then by subject; grade, average, published remark; an explicit note when a grade is not yet published; access to the PDF report card from each period.
5. **Report card (viewing)**: a bilingual PDF with a version history ("superseded"), a QR verification button, download and system sharing.
6. **Your rights (adult student)**: for each guardian, block status (school, disciplinary, health) with a restriction toggle; an RG-02 information panel before confirmation; a chronological history of restrictions and restorations; a permanent note on the liable payer's financial access.
7. **My transcripts**: a list of available annual and cumulative transcripts, a generate/download button, generation status, a visible QR code.
8. **My documents (after departure)**: a read-only portal grouping report cards, transcripts, decisions, and official documents; a banner explaining retention and durations; no write action.
9. **Notifications**: an in-app notification center, channel preferences for the adult student (a minor's channels are her guardians').

---

## 9. Integrations

- **Notifications**: multi-channel routing of these journeys' events (in-app, SMS in MVP; push, WhatsApp "utility," an SMS fallback in V1) per DEC-12 and DEC-36, with costs charged to the school; the `INT-SMS` and `INT-WAP` integrations carried by `prd/cross-cutting/35-external-integrations.md`.
- **E-mail messaging**: a secondary channel only (INT-EML, `prd/cross-cutting/35-external-integrations.md`); never required for a student account (DEC-11, INV-37).
- **Massar**: no direct dependency; a transfer to another school goes through the ministerial procedure outside ZSchool in V1 (a recorded reference, §7.9), and university pre-enrollment is out of scope (DEC-29). The Massar code appears on issued documents.
- **Signature and seal**: an advanced electronic seal and timestamp on transcripts and attestations in V1, a qualified seal via an accredited provider in V2 (DEC-30; `INT-SIG`, `prd/cross-cutting/35-external-integrations.md`).

---

## 10. Specific non-functional requirements

NFR domains carried by `prd/cross-cutting/32-non-functional-requirements.md`, cited without numbering:

- **Performance**: typical pages under 2 s on 4G mobile network; a report card opens under 3 s; a publication notification delivered school-wide within the bulk-publication window (2,000 students under 10 minutes) (§10).
- **Availability**: 99.5% outside announced maintenance, windows outside the start of year and exams; semester-end publications must not degrade student viewing (§10).
- **Mobile and offline**: PWA in MVP, native apps in V2; a low-bandwidth mode and lightweight caching of the timetable and homework; an entry-level family phone supported (§10, §2.10).
- **Languages**: FR and AR with full RTL from MVP; bilingual content (names, documents); EN in V2 (§10, DEC-10).
- **Documents**: bilingual PDFs, correct Arabic fonts, A4/A5, batch printing on the school side (§10).
- **Security and confidentiality**: sessions and devices managed (§9), a generated login identifier and password for student accounts with no phone (an OTP to the guardian's number), protection against Massar-code enumeration (the generated identifier is not derived from it), encryption in transit and at rest, immutable historization of entries; data hosted in Morocco (DEC-26).
- **Accessibility**: contrast, adjustable font sizes, and keyboard navigation on the main journeys (§10); readability for teenagers on small screens (adapted typography templates, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`).

---

## 11. Success metrics

Candidate indicators to develop in `prd/cross-cutting/38-kpi-success-metrics.md` (the `KPI` namespace carried by that file), unnumbered here:

- Student-access activation rate among students at eligible levels (a per-school steering target).
- Median delay between a report card's publication and its first viewing by the student and a guardian.
- Volume and seasonality of transcripts generated (an expected peak from April to July, post-baccalaureate applications).
- Usage rate of the "My documents" portal by leavers (post-departure sign-ins, downloads).
- Number of parental restrictions set by adult students and the school's average time to apply them.
- Sign-in failure rate and notification complaints (an unfavorable benchmark from unmaintained Massar apps, `prd/research/01-market-competition.md` §4).

---

## 12. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | The activation version for the adult student's rights (information, restriction). | **Resolved — ARB-10**: MVP (INV-35; RG-02 is a legal rule, art. 209, and pilots have 2nd-year baccalaureate students reaching 18 in 2026-2027 — an explicit justification per conventions §1.5); `prd/02`, `prd/journeys/03`, and `prd/journeys/06` aligned; transcript self-service stays V1. |
| OQ-02 | **Escalated — ESC-03.** A baseline update on the time zone: baseline §2.4/§10 ("UTC+1, a return to UTC+0 during Ramadan") is obsolete since Decree No. 2.26.530 (Official Gazette No. 7521 of 29/06/2026): a permanent return to UTC+0 on 20/09/2026, with no Ramadan exception. | Student journeys are modeled on permanent UTC+0; the "Ramadan" variant remains as shortened hours (a pedagogical need) and not as a time-zone change. To be carried forward into a later version of PROJECT.md. |
| OQ-03 | **Open** (the adopted recommendation: a generic notification). Should the guardian whose access is restricted by the adult student be notified (a generic message), or only the school as RG-02 requires? | The baseline requires logging and notifying the school, with no ruling on the parent. Transparency would limit misunderstandings and calls to the secretariat; discretion protects the student in conflict situations. To be settled in review; recommendation: a generic notification to the restricted guardian, with no detail on reasons. |
| OQ-04 | **Open** (three blocks adopted). The granularity of the adult student's restriction: three independent blocks (school, disciplinary, health) as adopted in PJ-ELE-05, or sub-scopes (e.g. attendance separate from grades)? | RG-02 cites the three blocks with no internal granularity. Three blocks cover the baseline with the least complexity; any fine-grained option is deferred to a later version if pilots request it. |
| OQ-05 | **Open** (the adopted recommendation: security notifications maintained, consistent with ARB-21d). The restriction's effect on an adult student's student-life notifications: do absence alerts fall under the restrictable "school" block, or are they maintained on security grounds (the "emergency contact" quality of the relationship)? | The baseline keeps the payer's financial access but says nothing about an adult's absence notifications. Recommendation: maintain security-natured notifications (today's absence, an emergency) independent of the school restriction, disclosing this to the student at the time of restriction. |
| OQ-06 | The login identifier for a minor student with no phone or e-mail of her own. | **Resolved — ARB-07** (INV-45): a login identifier distinct from the contact identifier; a generated, readable identifier not derived from the Massar code, activated by the legal guardian with an OTP to his number; a tracked migration to a personal number (Salma); carried by `prd/cross-cutting/31-security-privacy.md` and `prd/03-domain-data-model.md`. |
| OQ-07 | **Escalated — ESC-03.** A baseline update on digital usage: baseline §2.10 cites "91.7% of households have a smartphone," "about 8% of households have only a basic phone (up to 14% in rural areas)"; ANRT 2024-2025 gives 91.2% of individuals aged 5 and over using the internet, 89.2% of connected households (78.4% rural), and 91.7% of mobile-equipped individuals owning a smartphone; the "8% basic phone" figure is not found (`prd/research/00-baseline-corrections.md`, discrepancy 10). | A limited impact on journeys (the SMS fallback and mobile-first stay valid); to be carried forward into a later version of PROJECT.md for citation consistency. |

---

## Traceability

| Baseline ID | Covered in this file |
|---|---|
| RG-01 | PJ-ELE-01, PJ-ELE-02; OQ-06 |
| RG-02, DEC-20, Q-02 | PJ-ELE-04, PJ-ELE-05; OQ-01, OQ-03, OQ-04, OQ-05 |
| RG-08 | PJ-ELE-01 (an ACTIVE-enrollment precondition) |
| RG-09 | PJ-ELE-07 |
| RG-12 | PJ-ELE-08 (the financial relationship surviving departure) |
| RG-12b | PJ-ELE-01, PJ-ELE-02 (individual accounts, a shared device) |
| RG-13 | PJ-ELE-01 (relationship preconditions) |
| RG-14 | PJ-ELE-05 (restricting a minor student's parent on a court ruling) |
| RG-14b | §6 (distinct qualities, an unvoted reform) |
| RG-16 | PJ-ELE-05 (conflicts arbitrated by the school) |
| RG-27, DEC-07 | PJ-ELE-08 (author and person concerned, permanent reading) |
| RG-28 | PJ-ELE-03, PJ-ELE-06, PJ-ELE-07, PJ-ELE-08 |
| RG-29 | PJ-ELE-03, PJ-ELE-06, PJ-ELE-08 (invisible internal data) |
| RG-30 | PJ-ELE-08 (no automatic inter-school access) |
| RG-31 | PJ-ELE-08 (the default transfer profile) |
| RG-32 | PJ-ELE-07, PJ-ELE-08 (read-only after closing) |
| RG-34, DEC-22 | PJ-ELE-08, §5 (retention and anonymization) |
| RG-38 | PJ-ELE-01, PJ-ELE-05, PJ-ELE-06, PJ-ELE-08; §5 |
| RG-39 | PJ-ELE-02 (least privilege) |
| DEC-03 | PJ-ELE-01 (an account linked to the existing profile) |
| DEC-09 | PJ-ELE-03 (immutable report cards) |
| DEC-10, §2.9 | §6, §8 (bilingualism, RTL, both scripts) |
| DEC-11 | PJ-ELE-04 (a mobile identifier), OQ-06 |
| DEC-12, DEC-36 | PJ-ELE-03, PJ-ELE-07 (channel hierarchy) |
| DEC-08 | PJ-ELE-08 (discipline and health never transferred automatically) |
| DEC-23 | PJ-ELE-08 (access durability after the school's termination) |
| DEC-24 | PJ-ELE-06, PJ-ELE-07, PJ-ELE-08 (documents never blocked for unpaid fees) |
| DEC-29 | PJ-ELE-06, §9 (pre-enrollment out of scope) |
| DEC-30 | PJ-ELE-03, PJ-ELE-06, PJ-ELE-07 (advanced seal, timestamp, QR) |
| DEC-32 | PJ-ELE-08 (the exit dossier via a secure link with QR) |
| §2.2 (weightings) | PJ-ELE-06; §6 |
| §2.4 (calendar, time zone) | PJ-ELE-02, §6; OQ-02 |
| §2.6 (Massar, CNE) | PJ-ELE-06, §9 |
| §2.7 (the Moudawana, art. 209) | PJ-ELE-04, §6 |
| §2.10, H-11 (usage) | §2.1, §6; OQ-07 |
| §5.2 (personas) | §1, §2 |
| §6.3 (the state machine) | PJ-ELE-07, PJ-ELE-08 |
| §7.3 (timetable, lesson log) | PJ-ELE-02 |
| §7.5 (assessments, transcripts) | PJ-ELE-02, PJ-ELE-03, PJ-ELE-06 |
| §7.6 (documents) | PJ-ELE-06, PJ-ELE-07, PJ-ELE-08 |
| §7.9 (transfers) | PJ-ELE-08 |
| §8.3 (the permission matrix) | PJ-ELE-01, PJ-ELE-02, §5 |
| §9 (security, compliance) | §5, §10 |
| §10 (NFR) | PJ-ELE-02, PJ-ELE-03, §10 |
| §12 (versions) | "Version" column of the journeys; OQ-01 |
| H-12 | PJ-ELE-08 (accepting permanent access to test with pilots) |
| `prd/research/00-baseline-corrections.md` discrepancy 1 | §6, OQ-02 |
| `prd/research/00-baseline-corrections.md` discrepancy 10 | §6, OQ-07 |
| `prd/research/04-pedagogy-massar-calendar.md` (calendar, weightings) | §6, PJ-ELE-02, PJ-ELE-07 |
| `prd/research/05-infrastructure-usage.md` (ANRT usage, speeds) | §2.1, §6 |
| ARB-01, ARB-03, ARB-04, ARB-17 (`prd/cross-cutting/42-review-arbitrations.md`) | PJ-ELE-02, PJ-ELE-06, PJ-ELE-07, PJ-ELE-08 |
| ARB-07, ARB-10, ARB-12, ARB-25 | §2.2, PJ-ELE-01, PJ-ELE-04, PJ-ELE-05, PJ-ELE-08, §5, §10, OQ-01, OQ-06 |
| ARB-15, ARB-19, ARB-20, ARB-21, ARB-22 | PJ-ELE-03, PJ-ELE-07, PJ-ELE-08, PJ-ELE-09 |
