# PRD ZSchool — Journey 05: Multi-School Parent (Persona Ahmed)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09; supersedes 0.2 — revised 09/09/2026) |
| Date | 2026-09-09 |
| Status | PRD draft — under review; arbitrations ARB-01 to ARB-26 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §2.8 (finance and payments), §2.10 (digital usage), §5.2 (persona Ahmed), §6.1 to 6.4 (account, identities, parent–student relationships), §7.4 to 7.8 (attendance, assessments, documents, finance, communication), §9 (authentication, security), §10 (non-functional requirements), §11 (parents pay nothing), §12 (scope by version); decisions DEC-03, DEC-10, DEC-11, DEC-12, DEC-13, DEC-24, DEC-30, DEC-31, DEC-34, DEC-36; rules RG-01, RG-03, RG-05, RG-07, RG-12b, RG-13, RG-14, RG-14b, RG-15, RG-16, RG-28, RG-33, RG-34, RG-38 |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md` (needs BES-PAR-01 to BES-PAR-08), `prd/03-domain-data-model.md` (entities, INV-01 to INV-43, domain events), `prd/journeys/00-journey-map.md` (PC-04, PC-05, PC-06, PC-07, PC-08, PC-10, PC-11), module chapters `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/15-documents-certificates.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/20-dashboards-reporting.md`, cross-cutting `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, research `prd/research/03-payments-communications.md` and `prd/research/05-infrastructure-usage.md` |

---

## 1. Purpose and scope

### 1.1 Lead persona

Ahmed (persona `PAR`, `PROJECT.md` §5.2) is the father of three children and the legal and financial guardian of all three (§6.4):

| Child | Level | School | Access particularity |
|---|---|---|---|
| Youssef | Grade 8 (lower secondary) | School A (Rabat) | Personal access activatable (default: from Grade 7, RG-01); a generated login identifier, with no phone of his own (ARB-07) |
| Sara | Grade 3 (primary) | School A | Represented by her guardians |
| Adam | Senior kindergarten (preschool) | School B | Represented by his guardians; no account (RG-01); absence notification defaults to a half-day summary in preschool (ARB-15f) |

His expectation, per the baseline: "see everything from WhatsApp and a single app" (§5.2). His access to the platform is **free**: the paying customer is the school (§11, DEC-13); notification consumables (SMS, WhatsApp) are charged to the school (§7.8, DEC-28).

### 1.2 Chapter scope

| In scope | Out of scope (carried elsewhere) |
|---|---|
| Creating Ahmed's account by phone (OTP) and linking to his three children through invitations and claiming | Creating identities at the school and Excel imports: `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/11-admissions-enrollment-reenrollment.md` |
| A multi-child/multi-school dashboard with a child switcher | Role and permission rules: `prd/cross-cutting/30-roles-permissions-matrix.md` |
| Reacting to an absence: notification then an excuse with an attachment | Roll call and student life on the school side: `prd/modules/13-attendance-student-life-discipline.md` |
| Viewing grades and report cards from both schools with the same gestures | Entry and publication on the school side: `prd/modules/14-assessments-grades-report-cards.md` |
| Paying fees via Fatourati (a creditor reference, a banking app, a cash agent) and tracking the balance | The Fatourati connection and school finance: `prd/modules/16-finance-billing-collections.md`, `prd/cross-cutting/35-external-integrations.md` |
| Receiving a receipt and an arrears reminder | Reminders on the school side: `prd/modules/16-finance-billing-collections.md` |
| Messaging a teacher in a moderated thread (DEC-34) | Message routing and templates: `prd/modules/17-communication-notifications.md` |
| An electronic departure authorization for a school outing | Managing events on the school side: `prd/modules/17-communication-notifications.md` |
| A self-service certificate request with a verification QR code | Document generation: `prd/modules/15-documents-certificates.md` |
| A student transfer and a request initiated by the parent (PC-09) | `PJ-PAR` transfer steps described briefly in this file; the transfer journey's detail: `prd/journeys/00-journey-map.md` (PC-09) and `prd/modules/18-transfers-mobility.md` |
| Changing or losing a mobile number, a recycled number, lost access | Security rules: `prd/cross-cutting/31-security-privacy.md` (SEC-27, SEC-28); requirement: `prd/modules/10-administration-onboarding-subscription.md` (FR-ADM-20) |
| Contesting a grade or a wrongly recorded absence | Correction on the school side: `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md` |

### 1.3 Step cross-reference table

| Step | Title | Version | Needs covered | Map journey |
|---|---|---|---|---|
| PJ-PAR-01 | Creating an account by phone (OTP) | MVP | BES-PAR-01 | PC-04 |
| PJ-PAR-02 | Linking to the three children: invitations and claiming | MVP | BES-PAR-01 | PC-04 |
| PJ-PAR-03 | A multi-child, multi-school dashboard | MVP | BES-PAR-01, BES-PAR-04 | PC-04, PC-11 |
| PJ-PAR-04 | Reacting to an absence: notification then an excuse | MVP | BES-PAR-02, BES-PAR-05 | PC-05 |
| PJ-PAR-05 | Viewing grades and report cards from both schools | MVP (progressive publication included; QR: V1) | BES-PAR-02 | PC-06 |
| PJ-PAR-06 | Paying fees via Fatourati and tracking the balance | V1 (DEC-31) | BES-PAR-03, BES-PAR-07 | PC-08 |
| PJ-PAR-07 | Receiving a receipt and a reminder | MVP (WhatsApp: V1) | BES-PAR-03 | PC-07, PC-08 |
| PJ-PAR-08 | Messaging a teacher (a moderated thread) | MVP (in-app, ARB-21a); V1 (push, WhatsApp) | BES-PAR-08 | PC-11 |
| PJ-PAR-09 | An electronic departure authorization | V1 | BES-PAR-06 | PC-11 |
| PJ-PAR-10 | A self-service certificate request | V1 | BES-PAR-03 (document), BES-PAR-06 | PC-10 |
| PJ-PAR-11 | Changing a number, losing a phone, a recycled number | MVP (ARB-08) | BES-PAR-01, BES-PAR-09 | PC-04 |
| PJ-PAR-12 | Contesting a wrongly recorded grade or absence | MVP (ARB-21a, FR-VSC-25) | BES-PAR-02, BES-PAR-10 | PC-05, PC-06 |

---

## 2. Ahmed's usage context

- **Devices and connection**: an Android smartphone first; 91.7% of mobile-equipped individuals have a smartphone and 91.2% of individuals aged 5 and over use the internet (ANRT 2024-2025, `prd/research/05-infrastructure-usage.md` §2); connections can be unstable: a lightweight interface, outage tolerance, a low-bandwidth mode (`PROJECT.md` §10). The Android/iOS web-traffic shares (67.96%/32.02%, StatCounter, same source) rule out neglecting iOS.
- **Channels**: WhatsApp is used by 98.6% of social-media users (ANRT 2024-2025, `prd/research/05-infrastructure-usage.md` §2): a primary channel alongside push notifications (V1); SMS as a universal fallback, especially rural (78.4% of rural households have internet, same source); e-mail secondary, never required for a parent (INV-37, DEC-11). In MVP: in-app and SMS notifications in Ahmed's preferred language (a per-person preference, ARB-21c), WhatsApp "utility" limited to attendance notifications (minimal templates, express opt-in mentioning the transfer outside Morocco, ARB-25c), **no push**; in V1, a push, then general WhatsApp "utility," then an SMS alias hierarchy (DEC-36, §12, ARB-21b; OQ-06 resolved). Reminders and announcements are sent within allowed windows and respect the "STOP" opt-out; attendance and security notifications always still go through (ARB-21d/e).
- **Free of charge**: Ahmed never pays the platform; only settling fees owed to the school (the creditor) is at stake (§11, DEC-13).
- **Languages**: a bilingual French/Arabic interface and messages with full right-to-left support; bilingual official documents (DEC-10, §2.9).
- **Family setup**: Ahmed is the legal tutor (the father, by right) and the financially responsible parent (RG-14b, INV-11). His children's other guardians (e.g. their mother) each hold their own account and receive the same notifications by default (RG-12b, RG-13, INV-13). Any access restriction can only result from a court ruling recorded by the school (RG-14, INV-10).

---

## 3. Chapter conventions

- Each `PJ-PAR-NN` step carries an attribute table (an adaptation of the template in `prd/00-conventions.md` §3) and numbered steps; screens are described in text, with no mockup.
- Screen identifiers (`ECR-…`) are not created here: they belong to the module chapters (conventions §2) and `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`; this file only describes Ahmed's actions and visible states.
- Events cited in `Code` are those of `prd/03-domain-data-model.md` §7; invariants `INV-…` and entities in `code` come from the same file.
- References to modules use file paths (`prd/modules/16-finance-billing-collections.md`), never a requirement ID from an unwritten file.

---

## 4. Detailed journeys

### PJ-PAR-01 — Creating an account by phone (OTP)

| Attribute | Value |
|---|---|
| Description | Ahmed activates his own account from the mobile number the school holds, with no e-mail address, via a one-time code (OTP) received by SMS (DEC-11, INV-37, §9). |
| Priority | Must |
| Version | MVP (§12: global identities, invitations, and claim) |
| Traceability | (→ DEC-03, DEC-10, DEC-11, INV-13, INV-37; §9; BES-PAR-01; PC-04) |
| Actors | Ahmed; School A or School B (issuing the invitation); platform (OTP verification, audit log) |
| Trigger | The school imports guardians (onboarding, `prd/modules/10-administration-onboarding-subscription.md`) and issues an invitation, or Ahmed declares his child himself (§6.2, path 2). |
| Channels | Invitation and OTP by SMS; a deep link into the progressive web app (PWA); e-mail optional as a fallback. |

**Walkthrough**

1. Ahmed receives a bilingual SMS on his mobile: a time-limited secure link and a personal invitation code.
2. He opens the link on his phone: a "Create my account" screen showing the recipient number partly masked, a pre-filled invitation field, and a language choice (French or Arabic, right-to-left, DEC-10).
3. He requests verification: a one-time OTP is sent by SMS (§9). The code expires; resending is limited (abuse protection, `prd/cross-cutting/31-security-privacy.md`).
4. Once the code is validated, Ahmed sets his authentication secret (a code or password). An e-mail address is offered as an option and never required (INV-37). Two-factor authentication is not required for a parent (reserved for school-level roles, §9).
5. A consents screen: information notices (Law 09.08), legal guardians' consent for minors, a channel choice (WhatsApp "utility" consent gathered from MVP, needed for attendance notifications — OQ-03 and OQ-06 resolved, ARB-25c and ARB-21b). Every consent is logged (`prd/cross-cutting/36-legal-compliance-data-protection.md`).
6. Confirmation: the account is active, carried by Ahmed's global identity; no account is shared between two people (INV-13, RG-12b).

**Variants and error states**: an expired or wrong code (limited resends, a clear message); a number already holding an account (linked to the existing account, never a duplicate, ARB-09); a foreign number from an expat parent accepted in international format, SMS via an international gateway as a fallback (ARB-07); a household's second guardian sharing the same mobile: a generated login identifier, the household number declared a shared contact (ARB-07); a forgotten secret (reset by OTP on the same number, tracked); a number change, loss, or recycling: PJ-PAR-11.

```gherkin
Feature: Activating a parent account by phone
  Scenario: Standard activation with OTP (MVP)
    Given a valid SMS invitation sent to Ahmed's number by School A
    And no existing parent account for this number
    When Ahmed opens the link, enters the OTP received by SMS, and sets his secret
    Then his account is active on the platform
    And his primary contact identifier is his mobile number, with no e-mail required
    And the event is logged with author, context, and timestamp

  Scenario: Expired OTP (MVP)
    Given an OTP displayed beyond its validity period
    When Ahmed enters it
    Then verification is refused with a clear bilingual message
    And Ahmed can request a new code up to the allowed resend limit
```

### PJ-PAR-02 — Being linked to his three children: invitations and claiming

| Attribute | Value |
|---|---|
| Description | From a single account, Ahmed is linked to Youssef and Sara (School A) because School A imported its guardians with his mobile number (guardian matching, ARB-09), and claims Adam (School B) via an invitation code with a knowledge challenge (ARB-08); qualities (father, legal guardian, financially responsible) are verified on each relationship. |
| Priority | Must |
| Version | MVP (§12: Massar matching, invitations, and claim) |
| Traceability | (→ RG-05, RG-07, RG-12b, RG-13, RG-14b, DEC-03, DEC-04, INV-01, INV-02, INV-09, INV-11, INV-13; BES-PAR-01; PC-04) |
| Actors | Ahmed; school secretariats (issuing, validation); platform (matching, event `IdentityClaimed`) |
| Trigger | Ahmed's first sign-in after schools' imports and enrollments. |
| Channels | The app; SMS notifications (School B's invitation). |

**Walkthrough**

1. On first sign-in, the home screen lists children already linked: Youssef and Sara appear for School A because School A recorded Ahmed as a guardian with his mobile number during import or enrollment, and the account created on this number was linked to this guardian (strong guardian matching by mobile, ARB-09; the Massar code, meanwhile, only matches student profiles, RG-05, INV-01, INV-02).
2. Adam has no Massar code (preschool): School B created a provisional profile and sent Ahmed an invitation code; Ahmed opens the link or enters the code, then **enters Adam's date of birth** (a knowledge challenge: it is never displayed, ARB-08d); if it matches, he confirms the claim and the parent–student relationship becomes active (event `IdentityClaimed` notified to School B); three failures lock the code and alert School B, which may revoke the claim and reissue the invitation to a corrected number.
3. If only a weak match applies (first name, last name, date of birth, a guardian's phone number): a probable-duplicate alert is sent to the school, with no automatic linking (RG-05, INV-02); the secretariat decides.
4. Ahmed checks his qualities on each relationship: father, legal guardian, financially responsible, emergency contact (RG-13, RG-14b, INV-11). Any error is corrected with the school, the operational arbiter (RG-07, RG-16); identity corrections are historized and notified to other schools involved.
5. Default rights apply at both schools: viewing school information, communicating, authorizing outings, paying fees (RG-14, INV-10, RG-15). No enrollment is created by this step: linking only creates relationships.

**Variants**: Ahmed declares a child himself from his account (§6.2, path 2, FR-INS-25, ARB-09): a provisional profile that the school links at enrollment; a third-party guardian (a grandmother) added later by the school with her own qualities (RG-12b); a third-party payer (an employer) linked through a "third-party payer" relationship with no school right (ARB-14); a parent restricted by a recorded court ruling (RG-14, outside Ahmed's normal case); an invitation received by a third party due to a wrong number: the knowledge challenge fails, School B revokes the claim (ARB-08).

```gherkin
Feature: A parent claiming a child
  Scenario: Claiming Adam with an invitation code and a knowledge challenge (MVP)
    Given a provisional student profile for Adam created by School B with no Massar code
    And an invitation code sent to Ahmed's number
    When Ahmed enters the code then Adam's date of birth, which is not displayed
    Then Ahmed's parent–student relationship with Adam is active with its qualities (father, legal guardian, financially responsible)
    And School B is notified of the claim
    And Ahmed sees Adam in his dashboard with School B's context

  Scenario: An invitation received by a third party at a wrong number (MVP)
    Given an invitation code sent by mistake to the number of a person unrelated to the family
    When this person enters the code and fails the knowledge challenge three times
    Then the code is locked and no relationship is created
    And School B is alerted, revokes the claim, and reissues the invitation to the corrected number

  Scenario: No automatic linking on a weak match (MVP)
    Given a student profile with no Massar code whose first name, last name, date of birth, and a guardian's phone number partly match an existing identity
    When a parent attempts a claim with no invitation code
    Then no automatic linking happens
    And a probable-duplicate alert is sent to the school for a decision
```

### PJ-PAR-03 — Living the multi-child, multi-school dashboard day to day

| Attribute | Value |
|---|---|
| Description | A single app and a single view bring together Youssef, Sara (School A), and Adam (School B); Ahmed switches from one child to another in one action, with no reconnection or account change. |
| Priority | Must |
| Version | MVP (§12: multi-child, multi-school parent dashboards) |
| Traceability | (→ RG-03, RG-14, RG-36, DEC-10, DEC-12, INV-18, INV-31; §10; BES-PAR-01, BES-PAR-04; PC-04, PC-11) |
| Actors | Ahmed; both schools (data producers) |
| Trigger | Daily use (morning, evening, every notification). |
| Channels | PWA in MVP, native apps in V2 (§10); in-app and SMS notifications in Ahmed's language; WhatsApp "utility" (MVP: attendance notifications only); general push and WhatsApp notifications in V1 (§12, ARB-21). |

**Screen (text description)**: a permanent "My children" header with one card per child (photo, first name, level and class, a school marker); each card carries badges: today's absence, a payment due, a report card or grade available, an unread message, a document to sign (V1, departure authorizations). Below the header, a merged chronological "Today" feed crosses both schools' announcements and the three children's events, timestamped and bilingual. A "Finances" zone shows the total due across all schools and the detail per child. Switching children happens by tapping a card; the last-viewed context is remembered.

**Typical walkthrough**

1. In the morning, Ahmed opens the app: the "absence" badge on Adam's card sends him straight there (see PJ-PAR-04).
2. He reads, in the merged feed, School A's meeting announcement and School B's outing announcement, each in its language and school context.
3. He checks Youssef's grades then switches to Sara and Adam with no re-sign-in (the persona's typical scenario, §5.2): displayed data changes tenant, never account.
4. In the evening, he checks the "Finances" zone: the total due, the nearest deadline, direct access to payment (PJ-PAR-06).

**Safeguards**: aggregation is lawful because global entities (identities, relationships) are accessible through an active relationship, and every operational piece of data stays isolated by tenant with server-side control (INV-17, INV-18); Ahmed never sees another child's, another class's, or another family's data (RG-39 transposed to the parent scope: his relationships only); sensitive-data views are logged (RG-38). If Ahmed held a second profile (e.g. a teacher at another school), the profile-school context switcher would appear (RG-03, RG-36): this case is handled by `prd/cross-cutting/30-roles-permissions-matrix.md`.

```gherkin
Feature: A multi-child, multi-school dashboard
  Scenario: Switching children with no reconnection (MVP)
    Given Ahmed authenticated once on his single account
    And his three children linked across two schools
    When Ahmed views Youssef's grades then selects Sara then Adam
    Then each view shows only data for the selected (child, school) context
    And no reconnection or account change is requested
    And his chosen language and display mode are kept
```

### PJ-PAR-04 — Reacting to an absence: notification then an excuse

| Attribute | Value |
|---|---|
| Description | Ahmed is notified of Sara's absence (Grade 3, School A) within five minutes of roll-call validation — the day's first absence, after the 3-minute hold window (ARB-15) — then submits an excuse from his mobile with an attachment; he tracks his excuse's status through to validation by student life. For Adam (preschool, School B), the school applies the half-day summary by default (ARB-15f). |
| Priority | Must |
| Version | MVP (in-app, SMS, and WhatsApp "utility" attendance notification, grouping and correction notice, excuse — §12, ARB-15, ARB-21; general push and WhatsApp in V1, DEC-36) |
| Traceability | (→ DEC-12, DEC-36, RG-14, RG-38; §7.4, §10 (delay under 5 minutes); BES-PAR-02, BES-PAR-05; PC-05) |
| Actors | Ahmed; School A's teacher then student life (roll call, validation); platform (notification routing) |
| Trigger | The `AbsenceRecorded` event on roll-call validation (produced by `prd/modules/13-attendance-student-life-discipline.md`). |
| Channels | In MVP: an in-app notification, WhatsApp "utility" for attendance if Ahmed has opted in, an SMS alias as a fallback, in his language; in V1: push, then WhatsApp "utility," then SMS per DEC-36 (ARB-21); the excuse and tracking within the app. |

**Walkthrough**

1. 8:05 a.m.: the Grade 3 teacher validates the roll call for the declared 8 a.m. session; Sara is absent. The `AbsenceRecorded` event triggers, after the 3-minute hold window, notification of the day's first absence to active guardians (RG-13) within five minutes (§10), in each recipient's language: child, date, the session or half-day involved; Sara's absences at subsequent sessions the same day will be grouped into the evening summary, and a correction of the roll call after sending would issue a correction notice (ARB-15). For Adam, in senior kindergarten, School B kept the preschool default: a summary at the end of the half-day (ARB-15f).
2. Ahmed opens the notification: the absence screen shows the status "to be excused" and an "Excuse" button.
3. Ahmed chooses a reason from a list (illness, a medical appointment, a family reason, other) and attaches a photo of the medical certificate (image and PDF formats, automatic compression, a size check with a clear message on refusal).
4. Sending: the excuse moves to "submitted" (event `JustificationSubmitted`); School A's student life receives it in its processing queue. If Ahmed has no active account or hands over a paper certificate, student life can record the excuse on his behalf, marked "recorded by the school" (ARB-15d).
5. Student life accepts or refuses: Ahmed receives the status (event `JustificationValidated`) and the absence screen shows the history (prior excuses, decisions).
6. On repeated absences, crossing the school-configured threshold notifies Ahmed (event `AbsenceThresholdReached`).

**Variants and error states**: submitting during a network outage: the attachment and reason stay in a local queue and go out on reconnection, with a visible "awaiting send" status (§10); an unread notification: an SMS fallback reminder; an absence wrongly recorded: Ahmed contests from the absence screen (PJ-PAR-12); Ahmed is not a legal guardian on a given relationship: he sees the absence per his rights (RG-14).

```gherkin
Feature: A parent excusing an absence
  Scenario: A standard excuse with an attachment (MVP)
    Given Sara's absence recorded by roll call validated at 8:05 a.m. and notified at 8:09 a.m.
    When Ahmed receives the absence notification and submits a reason with the medical certificate photo
    Then the excuse is at "submitted" status within seconds of sending
    And School A's student life sees it in its processing queue
    And Ahmed receives the final status (validated or refused) with the decision's timestamp

  Scenario: A single immediate notification per day (MVP)
    Given Sara absent at the 8 a.m., 10 a.m., and 2 p.m. sessions
    When all three roll calls are validated
    Then Ahmed receives an immediate notification for the 8 a.m. session only
    And an evening summary lists all three absences

  Scenario: A half-day summary in preschool (MVP)
    Given Adam absent at the 8:30 a.m. session of School B's senior kindergarten
    When the roll call is validated
    Then Ahmed receives the half-day summary at the time School B configured, with no immediate notification

  Scenario: Submitting in a low-connectivity area (MVP)
    Given Ahmed offline at the moment of submission
    When he validates his excuse
    Then the reason and attachment are kept locally with the status "awaiting send"
    And the send happens automatically when the connection returns, with no re-entry
```

### PJ-PAR-05 — Viewing grades and report cards from both schools with the same gestures

| Attribute | Value |
|---|---|
| Description | Ahmed views Youssef's and Sara's grades, averages, and report cards (School A) and, where applicable, Adam's period summary (School B), with the same navigation and gestures regardless of the school; the report cards viewed are immutable and verifiable. |
| Priority | Must |
| Version | MVP for progressively published grades (school-configurable progressive publication, FR-EVA-19, ARB-17f) and bilingual report cards; a verification QR code in V1 (INV-26, DEC-30, ARB-19) |
| Traceability | (→ RG-28, RG-29, RG-33, DEC-09, DEC-10, INV-20, INV-26; §7.5; BES-PAR-02; PC-06) |
| Actors | Ahmed; School A and School B (publication); teachers (upstream entry) |
| Trigger | The `ReportCardPublished` event or a period transcript published by the school. |
| Channels | A publication notification (in-app and SMS in MVP, push and WhatsApp in V1); viewing within the app; a printable bilingual PDF report card. |

**Walkthrough**

1. Mid-semester, with School A having enabled progressive publication, Ahmed sees Youssef's grades as soon as an assessment is published by the school (a "published" mark status, ARB-17f); at the end of the first semester: School A publishes Youssef's report card (event `ReportCardPublished`); Ahmed receives a notification in his language with a deep link.
2. The report-card screen shows: averages by subject, a general average weighted by coefficients, rank, honors, and remarks; the scale out of 20 and the period (semester) are the school's (§2.5). The document is downloadable as a bilingual PDF (DEC-10).
3. The report card viewed is fixed: version, fingerprint, signatory, date (RG-33, INV-26). If the school corrects it, a new version is published and the old one stays viewable marked "superseded."
4. Ahmed applies the exact same gesture for Sara (Grade 3, School A): the same tabs, the same screens.
5. For Adam (School B): no numeric grading in preschool (§2.2); the screen shows no graded data exists and, if School B publishes a preschool period summary (a configurable bilingual document), the same viewing gesture applies.
6. From one school to another, only period labels, layout, and school settings change; the navigation and gestures stay identical — the core of the multi-school experience.
7. In V1, a third party (an administration, another school) can verify a printed report card's authenticity via its QR code (RG-33).

**Safeguards**: Ahmed only sees his children's published data; unpublished grades, drafts, deliberations, and internal remarks are never visible (RG-29, INV-21). Read access to published documents is permanent, even after a possible departure from the school (RG-28, INV-20).

```gherkin
Feature: Viewing report cards from two schools
  Scenario: Publication then multi-school viewing (MVP)
    Given Youssef's first-semester report card published by School A
    And Adam's period summary published by School B
    When Ahmed opens the publication notification then views both documents in turn
    Then the same gestures (a child tab, opening the period's document, PDF download) apply to both schools
    And each document shown is the current published version, marked "superseded" where applicable
    And no unpublished data (grades still being entered, deliberations) appears
```

### PJ-PAR-06 — Paying fees via Fatourati and tracking the balance

| Attribute | Value |
|---|---|
| Description | Ahmed views each of his children's payment schedule and balance, gets a creditor reference and a Fatourati QR code, and pays from his banking app, an ATM, a mobile wallet, or a cash agent; reconciliation is automatic and the school stays the creditor and beneficiary of the funds. |
| Priority | Should |
| Version | V1 for Fatourati (DEC-31, which overrides the "later version" wording in §7.7 and §12 — see `prd/journeys/00-journey-map.md`, PC-08); a stored card and direct debit in V2 (DEC-31) |
| Traceability | (→ DEC-13, DEC-28, DEC-31, INV-40; §2.8, §7.7, §11; H-09, H-19; BES-PAR-03, BES-PAR-07; PC-08) |
| Actors | Ahmed (payer); School A and School B (separate creditors); banks, payment institutions, and cash agents (the Fatourati rail); ZSchool (technical connection, no fund custody) |
| Trigger | A due installment (a dashboard badge) or a reminder received (PJ-PAR-07). |
| Channels | The app (viewing, reference, QR code); payment outside the app via Fatourati channels; confirmation by notification. |

**Prerequisites**: the school is connected as a creditor on CMI's Fatourati network; the "Fatourati Aggregator" offering (launched 17/02/2026) gives the software vendor reference and QR code generation and payment tracking, with the school staying the creditor and fund beneficiary (`prd/research/03-payments-communications.md` §1; `prd/research/00-baseline-corrections.md` point 8). The network covers 32 banks and payment institutions and over 25,000 cash points (Cash Plus, Wafacash, Barid Cash, Damane Cash, Al Filahi Cash, Inwi Money, Fawatir, and others), with over 240 million transactions to date (same source). The connection's contractual and pricing terms remain to be confirmed (H-19).

**Walkthrough**

1. Ahmed opens "Finances" for Youssef (School A): the year's payment schedule (ten monthly payments from September to June, §2.4), status per installment (paid, due, overdue), fee nature (tuition, transport, canteen), remaining balance. Amounts are fixed by the year's parent contract (no increase during the year, INV-40, `prd/modules/16-finance-billing-collections.md`).
2. He selects October's installment (or several installments) and taps "Pay via Fatourati": the screen shows the creditor reference, a QR code, and the amount due; a note recalls that the school is the creditor and that ZSchool holds no funds (§2.8, DEC-31).
3. Ahmed pays through his channel of choice: a banking app or e-banking, an ATM, a mobile wallet, a bank branch, or a neighborhood cash agent. He enters the reference (or scans the QR code); the amount is confirmed in real time by querying School A through the platform, on the integration model described in `prd/research/03-payments-communications.md` §1 (the Eduka reference).
4. The payment confirmed by the network triggers the `PaymentReceived` event: the platform records the payment, updates the installments involved and the balance, and notifies Ahmed. Reconciliation is daily and duplicates are rejected (same source).
5. Ahmed receives confirmation of the status: a bilingual notification showing the payment's status (paid, or in reconciliation where applicable, see OQ-02) with the receipt accessible (PJ-PAR-07).
6. For Adam (School B), the creditor is separate: the reference and QR code are specific to School B; no payment covers two schools, and a School A payment never changes School B's balance.
7. Ongoing tracking: the dashboard carries a badge as long as an installment is due or overdue; the "Finances" view offers Ahmed's consolidated total obligation across his three children, then the detail per child and school.

**Variants**: payment by a third party (a grandparent, an employer) using the same reference (§2.8); a split between two payers if the financially responsible parent differs (§7.7); cash, cheque, and transfer stay available at the front desk (core finance, MVP, PC-07); in V2, card payment with a stored card via NAPS e-Premium or Chari Pay (DEC-31) — YouCan Pay is excluded from references, its business having ceased in January 2024 (`prd/research/00-baseline-corrections.md` point 7).

```gherkin
Feature: Paying a monthly installment via Fatourati
  Scenario: A payment at a cash agent with a status received (V1)
    Given Youssef's October installment at "due" status at School A
    When Ahmed gets the creditor reference and QR code from his app
    And he goes to a cash agent, enters the reference, and pays the amount confirmed in real time
    Then the payment is confirmed by the Fatourati network and recorded by the platform (event PaymentReceived)
    And the covered installments move to "paid" status and the balance is updated
    And Ahmed receives a bilingual notification confirming the payment's status with the receipt accessible
    And the funds are credited to School A, with ZSchool having held no funds

  Scenario: A duplicate payment attempt rejected (V1)
    Given Youssef's October installment already paid the same day
    When a second payment attempt is made with the same reference
    Then the payment is rejected as a duplicate per Fatourati reconciliation
    And the installment's balance stays unchanged and no double entry is created

  Scenario: Creditor isolation between schools (V1)
    Given Adam enrolled at School B with an overdue installment
    When Ahmed pays Youssef's installment at School A
    Then School B's balance stays unchanged
    And each school sees only its own receivables
```

### PJ-PAR-07 — Receiving a receipt and a reminder

| Attribute | Value |
|---|---|
| Description | Every payment produces a numbered receipt given and sent to Ahmed; every unpaid installment triggers a graduated bilingual reminder that never blocks official documents. |
| Priority | Must (the receipt and reminder are part of core MVP finance, §12) |
| Version | MVP: a sequentially numbered, tamper-proof receipt (FR-FIN-07, ARB-01), a family receipt (ARB-20a), arrears, reminders (SMS and in-app messaging, allowed sending windows, and a "STOP" opt-out limited to reminders, ARB-21); WhatsApp for reminders in V1 (DEC-12, DEC-36); mail in full finance V1 (§7.7) |
| Traceability | (→ DEC-24, INV-39, INV-40; §7.7; BES-PAR-03; PC-07, PC-08) |
| Actors | Ahmed; the school's secretary-cashier and accounting; the platform (automatic reminders) |
| Trigger | The `PaymentReceived` event (a receipt) or `InstallmentOverdue` then `ReminderSent` (a reminder), produced by `prd/modules/16-finance-billing-collections.md`. |
| Channels | Receipt: in-app messaging and SMS (MVP), WhatsApp (V1), a downloadable PDF; reminder: the same channels, tiers configured by the school. |

**Walkthrough — receipt**

1. After a Fatourati payment (PJ-PAR-06) or a front-desk payment (cash, cheque, transfer — core MVP finance), a receipt is generated with the school's sequential, tamper-proof number (INV-40).
2. The receipt (a bilingual PDF) states the school, the student — or both children and their installments when Ahmed pays for Youssef and Sara at once at School A (a family receipt, ARB-20a) —, the installments covered, the amount, the payment method, and date; it is sent to Ahmed (in-app messaging and SMS in MVP, WhatsApp in V1) and stays downloadable in the "Finances" history (financial-document retention: ten years after settlement, DEC-22, ARB-25u). A payment error is corrected via a reversal and a numbered voiding receipt (PJ-SEC-09), never by editing the receipt.

**Walkthrough — reminder**

3. November's installment goes unpaid at the due date: the `InstallmentOverdue` event arms the reminder plan configured by School A (e.g. a reminder at three days then a firm reminder at ten days — configurable tiers, no figure imposed by the baseline).
4. Each tier issues a graduated message in Ahmed's language (event `ReminderSent`), in-app and SMS in MVP, within allowed sending windows (8 a.m.–8 p.m., Ramadan windows), WhatsApp and mail in V1 (DEC-12, DEC-36, ARB-21): Ahmed is told the amount due, the installment involved, and how to pay (a direct link to journey PJ-PAR-06 or contacting the secretariat). If he replies "STOP," only reminders and announcements stop; attendance and security notifications continue and he is told so (ARB-21d).
5. The reminder comes with an informational alert on the record in the app: it never blocks generating official documents (an attestation, certificates, report cards), per DEC-24 and INV-39.
6. Once settled, Ahmed receives payment confirmation and reminders stop; the history keeps a trace of the tiers issued.

```gherkin
Feature: Receipt and unpaid-fee reminder
  Scenario: A receipt after a front-desk payment (MVP)
    Given Adam's September installment paid in cash at School B's front desk
    When the secretary records the cash payment at the front desk (core finance, MVP; a tooled cash session in V1 — `prd/modules/16-finance-billing-collections.md`)
    Then a numbered bilingual receipt is generated and sent to Ahmed with the covered installments' detail
    And the receipt stays downloadable in the payment history

  Scenario: A graduated reminder then stopping after payment (MVP)
    Given Youssef's November installment unpaid for three days
    When the first reminder tier triggers
    Then Ahmed receives a bilingual message stating the amount due and how to pay
    And no official document is blocked despite the arrears (an informational alert only)
    When Ahmed pays the installment at the front desk (or via Fatourati in V1)
    Then reminders stop and payment confirmation is notified

  Scenario: A "STOP" opt-out limited to reminders (MVP)
    Given Ahmed having replied "STOP" to a reminder SMS
    When a new reminder and an absence notification are issued the same day
    Then the reminder is not sent by SMS
    And the absence notification is sent normally
```

### PJ-PAR-08 — Messaging a teacher in a moderated thread

| Attribute | Value |
|---|---|
| Description | Youssef's math teacher opens a thread with Ahmed, who replies within the moderated setup; Ahmed can only start a thread if School A allows it; leadership may view threads, and this is disclosed to users (DEC-34). |
| Priority | Should |
| Version | MVP for moderated in-app threads with an in-app and SMS notification (DEC-34 "enabled by default," BES-ENS-05, ARB-21a); V1 for push and WhatsApp notification (§12) |
| Traceability | (→ DEC-12, DEC-34, RG-38; §7.8; BES-PAR-08; PC-11) |
| Actors | Ahmed; the teacher (opens the thread); School A's leadership (viewing, configuration) |
| Trigger | A message from the teacher in Youssef's thread (context: course, class). |
| Channels | A message notification (in-app and SMS in MVP; push and WhatsApp in V1); the exchange within the app; content in each party's language. |

**Walkthrough**

1. The teacher opens a contextualized thread (Youssef, math) to flag a drop in grades and suggest follow-up: Ahmed receives a notification identifying the sender, the child, and the subject.
2. The thread screen permanently states "exchanges may be viewed by the school's leadership" (DEC-34): Ahmed replies knowing this, in French or Arabic.
3. Ahmed replies in the thread; no personal number is exposed; the full history stays viewable on both sides; exchanges are tracked (RG-38) and kept two years by default (DEC-22), with a right to erasure applicable to messages (RG-34).
4. Ahmed wants to ask another teacher a spontaneous question: as long as School A has not enabled parent-initiated threads (a DEC-34 configuration), the "New message" button is unavailable with an explanation and an alternative (going through the homeroom teacher or the secretariat).
5. If School A enables parent-initiated threads, Ahmed can open a thread with Youssef's homeroom teacher; the teacher replies within the same moderated setup.

**Variants**: an official summons: it follows the summons journey (a notification with read tracking, §7.8) not the informal thread; Ahmed's attachment in a thread: limited to simple document formats, filtered on the school side.

```gherkin
Feature: Moderated parent–teacher messaging
  Scenario: A reply in a thread opened by the teacher (MVP)
    Given a thread opened by the math teacher about Youssef
    When Ahmed receives the notification and replies in the thread
    Then his reply is visible to the teacher with the full history
    And the notice of possible leadership viewing is shown throughout the exchange
    And no personal phone number is exposed

  Scenario: Parent-initiated threads not authorized (MVP)
    Given a school that has not enabled parent-initiated threads
    When Ahmed tries to open a new thread with a teacher
    Then the action is unavailable with a bilingual explanation and a contact alternative
    And no notification is sent to the teacher
```

### PJ-PAR-09 — Signing an electronic departure authorization

| Attribute | Value |
|---|---|
| Description | School A publishes a school outing for Youssef's class with an electronic parental authorization; Ahmed views the details, signs from his account, and can revoke until the deadline; the school tracks response statuses. |
| Priority | Should |
| Version | V1 (events and outings with an electronic parental authorization, §7.8; the `Event` entity in V1, `prd/03-domain-data-model.md` §2.6) |
| Traceability | (→ RG-13, RG-14, RG-15, RG-38; §7.8; BES-PAR-06; PC-11) |
| Actors | Ahmed and any other guardian (an individual signature); the organizing teacher and School A's leadership (publication, tracking) |
| Trigger | School A publishing the "outing" event. |
| Channels | A notification (push V1, WhatsApp, SMS); signing within the app; tracking on the school side in `prd/modules/17-communication-notifications.md`. |

**Walkthrough**

1. School A publishes the outing (a museum, date, supervision, transport, instructions, a response deadline). Where applicable, the outing's cost is settled outside the platform at this stage: integrated paid activities and outings are V2+ (`prd/journeys/00-journey-map.md` §5).
2. Ahmed receives the notification with a deep link; the screen shows the details and a signing zone, along with the request's status (pending, given, revoked).
3. Ahmed signs electronically: authenticated by his account, identified by name, timestamped (the equivalent of a document's qualified seal targets school-issued documents in V2, DEC-30; here the evidentiary value rests on account identification, timestamping, and logging).
4. Each guardian signs from their own account (RG-12b, RG-13); the school sees the list of authorized and unresponded guardians and triggers automatic reminders before the deadline.
5. Ahmed can revoke his authorization until the deadline; the revocation is logged and notified to the school.
6. In the same school-context screen (RG-15), Ahmed keeps the list of people authorized to pick up the child and the emergency contact up to date, per School A's settings.

**Safeguards**: electronic signature relies on a single-person account (INV-13); every action (signing, revocation) is logged with author, context, and timestamp (RG-38).

```gherkin
Feature: An electronic parental authorization for an outing
  Scenario: Signing then revoking before the deadline (V1)
    Given a school outing published by School A with a response deadline
    When Ahmed signs the authorization from his account then revokes it before the deadline
    Then the signature and the revocation are timestamped and logged
    And the school sees the final status (not authorized) with the action history
    And automatic reminders were sent to unresponded guardians before the deadline
```

### PJ-PAR-10 — Getting a self-service attestation

| Attribute | Value |
|---|---|
| Description | Ahmed downloads, without a front-desk trip, the documents authorized by School A (e.g. Sara's enrollment certificate): a bilingual, numbered document bearing the school's advanced electronic seal, timestamped and QR-verifiable; any arrears show up as an alert without ever blocking issuance. In MVP, the same certificate is issued at the front desk (PJ-SEC-04). |
| Priority | Should |
| Version | V1 (§12: self-service documents and certificates, verification QR code; an advanced seal and timestamp from V1, DEC-30); in MVP, an enrollment certificate, receipt, and student record issued at the front desk with simple numbering (`prd/journeys/00-journey-map.md`, OQ-02 resolved) |
| Traceability | (→ RG-14b, RG-28, RG-33, DEC-24, DEC-30, INV-20, INV-39; §7.6; BES-PAR-03, BES-PAR-06; PC-10) |
| Actors | Ahmed (request); School A (configuring authorized documents, the signatory); secretariat (documents reserved for the front desk); a third-party verifier (checking the QR code) |
| Trigger | Ahmed's administrative need (a family file, an employer, an administration). |
| Channels | The app (request, download); an availability notification (SMS, WhatsApp V1); a bilingual PDF. |

**Walkthrough**

1. In Sara's "Documents" tab, Ahmed sees the list of documents School A allows self-service (an enrollment certificate, an attendance certificate, an achievement certificate where applicable) — the scope is a school setting (§7.6); any legal guardian or the holder of custody has access (ARB-20f).
2. He picks the document and confirms: on-demand generation, bilingual, sequential numbering, the school's advanced electronic seal, a timestamp, and a verification QR code (DEC-30); the `DocumentGenerated` event notifies availability.
3. Ahmed downloads the PDF; a third party (an administration, another school, an employer) verifies the printed document's authenticity by scanning the QR code.
4. If arrears exist on the record: an informational alert and the account statement are shown, but generation is never blocked (DEC-24, INV-39); Law 59.21 also fines refusal to issue certificates and attestations when the contract is being honored (`prd/research/02-regulatory-data.md` §1 and §6; `prd/research/00-baseline-corrections.md` points 2 and 16).
5. Documents reserved for the front desk (e.g. the leaving certificate, an act of the legal tutor, RG-14b) do not appear self-service: the screen points to the secretariat.

```gherkin
Feature: A self-service enrollment certificate
  Scenario: Generation and verification by a third party (V1)
    Given the enrollment certificate authorized self-service by School A for Sara
    When Ahmed requests the document from his app
    Then the bilingual document is generated with numbering, an advanced electronic seal, a timestamp, and a QR code
    And Ahmed receives the availability notification and downloads the PDF
    And a third party scanning the QR code gets confirmation of the document's authenticity

  Scenario: Issuance despite arrears (V1)
    Given arrears shown on Sara's record
    When Ahmed requests the enrollment certificate
    Then generation is not blocked
    And the arrears alert and the account statement are shown alongside the document
```

### PJ-PAR-11 — Changing a number, recovering access after losing a phone, a recycled number

| Attribute | Value |
|---|---|
| Description | Ahmed changes his mobile number, or loses his phone, or his old number is reassigned by the operator to a third party: the account stays his, access is restored with no duplicate, and no one else can enter his account with the recycled number (ARB-08). |
| Priority | Must |
| Version | MVP (ARB-08; FR-ADM-20; SEC-27, SEC-28) |
| Traceability | (→ DEC-11, RG-38, INV-13, INV-37, INV-45; §9; BES-PAR-01, BES-PAR-09; PC-04; ARB-07, ARB-08) |
| Actors | Ahmed; a school's secretariat and leadership with an active relationship (front-desk verification); the platform (double OTP, a knowledge challenge, alerts) |
| Trigger | A change of operator, a lost or stolen phone, a number cancelled then reassigned. |
| Channels | The app (self-service); the school's front desk; SMS OTP; notification to schools involved. |

**Walkthrough**

1. **Self-service change**: from "My account," Ahmed enters his new number; an OTP is sent to the old number and another to the new one; once both are validated, the login and contact identifier switches, the operation is historized, and both schools are notified.
2. **Old number unreachable** (a lost phone, a cancelled line): Ahmed goes to School A's or School B's front desk; the secretary verifies his identity (first name, last name, date of birth, linked children), enters the new number, leadership validates; the operation is historized and notified to the other school; an OTP to the new number finalizes access recovery.
3. **A recycled number**: if no sign-in has happened for six months, or after repeated OTP failures, the platform requires a **knowledge challenge** (a linked child's date of birth, entered and never displayed) before any access; on failure, the account is locked, schools are alerted, and recovery goes through the front desk.
4. **Sessions and devices**: Ahmed revokes sessions open on the lost device from "My devices"; a new device triggers a notification on the remaining channels.
5. None of these operations creates a second account: one account, one person (INV-13).

```gherkin
Feature: Number change and access recovery
  Scenario: A self-service number change (MVP)
    Given Ahmed connected with access to both his old and new numbers
    When he enters the new number and validates both OTP codes received
    Then his login identifier switches to the new number with no account created
    And School A and School B are notified of the change
    And the operation is historized with author and timestamp

  Scenario: A number recycled by the operator (MVP)
    Given Ahmed's old number reassigned to a third party and no sign-in for seven months
    When the third party requests an OTP on this number and enters it
    Then the platform requires a linked child's date of birth before any access
    And three failures lock the account and alert both schools
    And no data about Ahmed's children is shown

  Scenario: A lost phone, recovery at the front desk (MVP)
    Given Ahmed with no access to his old number
    When he goes to School A's front desk with an ID document and leadership validates the new number
    Then access is restored on the new number after an OTP
    And School B is notified of the change
```

### PJ-PAR-12 — Contesting a wrongly recorded grade or absence

| Attribute | Value |
|---|---|
| Description | Ahmed notices an absence recorded for Youssef when he was present, or a grade that does not match the paper; he contests from the relevant screen, within the moderated thread, and tracks the correction, which stays tracked on the school side; a correction to a published grade creates a new report-card version. |
| Priority | Should |
| Version | MVP (moderated in-app threads ARB-21a; an absence correction notice ARB-15b; a tracked grade correction FR-EVA-03; a new report-card version INV-26) |
| Traceability | (→ RG-33, RG-38, DEC-34, INV-26; §7.4, §7.5; BES-PAR-02, BES-PAR-10; PC-05, PC-06; ARB-15, ARB-17, ARB-21) |
| Actors | Ahmed (or Youssef from his student access); the course's teacher or student life (correction); leadership (post-closing correction, a new version) |
| Trigger | A contested absence notification; a contested published grade. |
| Channels | The app (a "Contest" button on the absence or grade, a moderated thread); notification of the outcome. |

**Walkthrough**

1. **Absence**: from the absence screen, Ahmed chooses "Contest" (a reason: present in class, a student mix-up); a moderated thread opens with School A's student life; if the roll call is corrected, a correction notice is sent on the original channel and the absence disappears from the history with the correction tracked (ARB-15b); otherwise student life replies in the thread and the absence stays, excusable per PJ-PAR-04.
2. **A grade before closing**: from a grade published progressively, Ahmed opens a moderated thread with the teacher (DEC-34); the teacher corrects the grade with a trace (author, before/after value) or explains; the new value is republished.
3. **A grade after closing or a published report card**: the contest goes through leadership; any correction creates a new report-card version, with the old one staying viewable marked "superseded" (INV-26, ARB-17g).
4. No contest changes data without a tracked school action; ZSchool does not decide.

```gherkin
Feature: Contesting an absence or a grade
  Scenario: A wrongly recorded absence corrected after a contest (MVP)
    Given an absence notification received for Youssef when he was in class
    When Ahmed contests from the absence screen and student life corrects the roll call
    Then a correction notice is sent to Ahmed on the same channel
    And the absence no longer appears in Youssef's history, with the correction tracked on the school side

  Scenario: A grade contested after report-card publication (MVP)
    Given a wrong grade appearing on Youssef's published report card
    When leadership approves the correction requested by the teacher
    Then a new report-card version is published and notified
    And the old version stays viewable marked "superseded"
```

---

## 5. Rules observed across every journey

| Rule | Concrete effect for Ahmed |
|---|---|
| One account per person, several profiles (RG-12b, INV-13) | Ahmed never shares an account; each of his children's guardians has their own. |
| The primary identifier is the mobile number (DEC-11, INV-37, INV-45) | Sign-up, OTP, and access recovery work with no e-mail; e-mail is an optional secondary channel; the login identifier is distinct from the contact identifier (a generated identifier for a minor or a second guardian with no phone of their own, ARB-07); number change and loss: PJ-PAR-11. |
| Default access for legal guardians and the holder of custody (RG-13, RG-14, INV-10) | Ahmed is informed of everything by default; any restriction can only come from a court ruling recorded by the school, with an attachment and traceability. |
| Distinct legal-tutor/custodian qualities (RG-14b, INV-11) | Ahmed, legal tutor and financially responsible parent, signs major acts (enrollment, transfer, leaving certificate). |
| Isolation per school (RG-21, INV-17) with global read access per relationship (INV-18) | Ahmed sees his three children from both schools in a single view; each piece of data stays isolated by tenant and server-controlled. |
| Permanent viewing of published documents (RG-28, INV-20) | Report cards, transcripts, and published certificates stay accessible even after a school change. |
| No document blocking for unpaid fees (DEC-24, INV-39) | Reminders and arrears alerts never prevent issuing official documents. |
| Logging (RG-38) | Every write and every sensitive view (finance, record) is tracked with author, context, and timestamp. |
| Bilingualism and RTL (DEC-10) | Interface, notifications, and documents in French and Arabic, with right-to-left support. |
| Parents pay nothing (§11, DEC-13) | Ahmed is never billed by the platform; notification costs are the school's consumables (DEC-28). |
| Performance and reliability (§10) | Absence notifications under five minutes after roll call; pages under two seconds on 4G; outage tolerance. |

---

## 6. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | **Open (V1, H-19)** — a working assumption aligned with ARB-20a: one reference per payment, able to cover several installments and several children at the same school. The Fatourati creditor reference's grain: per student (enrollment), per family, or per financially responsible parent? Can several installments, or even several children at the same school, be grouped under a single reference and a single payment? | The baseline sets the rail (DEC-31) and the creditor school (§2.8) but not the reference's grain; the reference integration described in `prd/research/03-payments-communications.md` §1 speaks of a "school reference" per parent with no grain specified. The API's exact capabilities (an amount per reference, splitting, QR) remain to be confirmed in the contract (H-19). To be settled with `prd/modules/16-finance-billing-collections.md` and `prd/cross-cutting/35-external-integrations.md`. |
| OQ-02 | **Open (V1)**. The intermediate status and display delay for a Fatourati payment not yet reconciled (daily reconciliation, a cash-agent payment in the evening): the label shown to the parent ("paid, being confirmed"), the maximum time before escalation to support, and the effect on automatic reminders (pausing the current tier). | The baseline describes automatic reconciliation (§2.8) with no definition of states visible to the parent during the reconciliation window; to be defined with `prd/modules/16-finance-billing-collections.md`. |
| OQ-03 | **Resolved — ARB-25c** (express opt-in gathered at account activation, with an explicit note on the transfer outside Morocco; withdrawal at any time, switching to SMS). The timing and method for gathering WhatsApp consent (opt-in): at account activation (PJ-PAR-01) or on the first eligible notification; handling withdrawal (an opt-out word) and automatic switching to SMS. | DEC-36 reserves WhatsApp "utility" for parents "who have accepted"; neither the baseline nor the CNDP-ANRT guidance cited in `prd/research/03-payments-communications.md` §4 sets the timing for gathering it. Carried by: `prd/modules/17-communication-notifications.md` and `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| OQ-04 | **Open (H-20)** — MVP routing already limited to attendance (ARB-21). The impact of the new WhatsApp pricing grid for Morocco on 01/10/2026 (the end of free service and utility messages within the 24-hour window, exiting "Rest of Africa" regional pricing) on parent-notification routing: should the WhatsApp usage threshold be lowered, favoring push then SMS for non-critical messages? | A baseline/research discrepancy logged in `prd/research/00-baseline-corrections.md` point 6 (the baseline's DEC-36/H-20 mentioned only a review); a dated pricing-switch parameter and figure to be carried by `prd/modules/17-communication-notifications.md`. |
| OQ-05 | **Open (V1)** — a single term "enrollment certificate" (ARB-20g). The default list of documents offered self-service to the parent (an enrollment certificate, an attendance certificate, an achievement certificate) and how self-service numbering relates to front-desk numbering (a single sequence or dedicated sequences). | The baseline provides for self-service "for documents authorized by the school" (§7.6) with no default list; tamper-proof sequential numbering is required (INV-40). To be fixed with `prd/modules/15-documents-certificates.md`. |
| OQ-06 | **Resolved — ARB-21b** (no push in MVP; the DEC-36 hierarchy from V1). MVP notification-channel scope: an adopted founder arbitration — in MVP, in-app and SMS notifications, WhatsApp "utility" limited to attendance notifications (minimal templates, opt-in required); in V1, WhatsApp generalized to all messages, managed templates, and push notifications. | The baseline stays ambiguous: §7.4 mentions "SMS/WhatsApp notification" for attendance, while §12's MVP lists "in-app and SMS notifications" and places the WhatsApp Business API and push in V1. Arbitration applied in this file (§2, PJ-PAR-01, PJ-PAR-03, PJ-PAR-04); a baseline update and harmonization by `prd/modules/17-communication-notifications.md` to be requested in review. |

### Baseline/research discrepancies adopted in this chapter

Per `prd/00-conventions.md` §1 (rule 2) and the drafting guidance, this chapter adopts the following up-to-date data, which diverge from or refine the baseline:

| Baseline point | Data adopted | Source |
|---|---|---|
| §2.8: "Only NAPS and YouCan Pay publish their rates" | YouCan Pay excluded from references (business ceased in January 2024); V2 card rails = NAPS e-Premium or Chari Pay (PJ-PAR-06) | `prd/research/00-baseline-corrections.md` point 7 |
| §2.8: the "Fatourati Aggregator" offering "launched in 2026" | Launched 17/02/2026; a reference and QR-code API; the school is the creditor; daily reconciliation with anti-duplicate checks (PJ-PAR-06) | `prd/research/00-baseline-corrections.md` point 8; `prd/research/03-payments-communications.md` §1 |
| §2.10 and DEC-36: WhatsApp rates "change on October 1, 2026, to be re-evaluated" | The change confirmed and detailed (the end of free service/utility messages within the 24-hour window; exiting "Rest of Africa" pricing) — see OQ-04 | `prd/research/00-baseline-corrections.md` point 6; `prd/research/03-payments-communications.md` §4 |
| §2.10: 91.7% of households equipped with a smartphone, "8% basic phone" | ANRT 2024-2025 figures rephrased: 91.2% of individuals 5+ using the internet; 91.7% of mobile-equipped individuals have a smartphone; 78.4% of rural households have internet (the basis for the SMS fallback, §2 of this file) | `prd/research/00-baseline-corrections.md` point 10; `prd/research/05-infrastructure-usage.md` §2 |

---

## Traceability

A table of baseline ID → the elements of this file that implement them.

| Baseline ID | Baseline element | Coverage |
|---|---|---|
| §2.4 | Fees billed over ten months | PJ-PAR-06 (payment schedule), PJ-PAR-07 |
| §2.8 | Payment methods, Fatourati, no fund custody, third-party payer | PJ-PAR-06, PJ-PAR-07; OQ-01, OQ-02 |
| §2.10 | Digital usage (WhatsApp dominant, mobile-first, instability) | §2; PJ-PAR-01, PJ-PAR-03, PJ-PAR-04 |
| §5.2 | Persona Ahmed | §1.1; PJ-PAR-01 to PJ-PAR-10 |
| §6.1, RG-03 | A single account, multiple profiles, a context switcher | PJ-PAR-01, PJ-PAR-03 |
| §6.2, RG-05, RG-07 | Creating and matching identities, corrections | PJ-PAR-02 |
| §6.4, RG-12b to RG-16 | Parent–student relationships, qualities, separate accounts, conflicts | PJ-PAR-02, PJ-PAR-09; §5 |
| §7.4 | Attendance: notification and an excuse with an attachment | PJ-PAR-04 |
| §7.5 | Assessments: bilingual, immutable report cards, QR | PJ-PAR-05 |
| §7.6 | Self-service documents | PJ-PAR-10 |
| §7.7 | Finance: payment schedules, receipts, reminders, no blocking | PJ-PAR-06, PJ-PAR-07 |
| §7.8 | Communication: moderated threads, departure authorizations | PJ-PAR-08, PJ-PAR-09 |
| §9 | Phone authentication (OTP), security | PJ-PAR-01; §5 |
| §10 | Notification delay, performance, offline, bilingualism | PJ-PAR-03, PJ-PAR-04, PJ-PAR-05; §5 |
| §11, DEC-13, DEC-28 | Parents pay nothing, a single plan, consumables | §1.1, §2; PJ-PAR-06, PJ-PAR-07 |
| §12 | Scope by version | "Version" column of PJ-PAR-01 to PJ-PAR-10; §1.3 |
| RG-01 | The student's personal access (Youssef activatable) | §1.1 |
| RG-14, RG-14b, RG-15 | Default rights, the legal tutor, context attributes | PJ-PAR-02, PJ-PAR-09; §5 |
| RG-28, RG-29 | Permanent reading of published data, non-portability of internal data | PJ-PAR-05 |
| RG-33, DEC-09 | Immutable, verifiable report cards | PJ-PAR-05, PJ-PAR-10 |
| RG-38 | Logging | §5; PJ-PAR-08, PJ-PAR-09 |
| DEC-03, DEC-04 | A global identity, Massar code as the matching key | PJ-PAR-01, PJ-PAR-02 |
| DEC-10 | FR/AR, RTL, bilingual documents | §2; PJ-PAR-05, PJ-PAR-10 |
| DEC-11, DEC-12, DEC-36 | Phone as the primary identifier; channel hierarchy | §2; PJ-PAR-01, PJ-PAR-04; OQ-03, OQ-04, OQ-06 |
| DEC-24 | Official documents never blocked | PJ-PAR-07, PJ-PAR-10 |
| DEC-30 | An advanced electronic seal, timestamp, QR (V1) | PJ-PAR-05, PJ-PAR-10 |
| DEC-31 | Fatourati from V1; a V2 card; no fund custody | PJ-PAR-06 |
| DEC-34 | Parent–teacher threads moderated by default | PJ-PAR-08 |
| G-03, G-17 | Parental authority; real channels | PJ-PAR-02; §2 |
| H-09, H-19 | Confirmed payment rails; the Fatourati contract to confirm | PJ-PAR-06; OQ-01 |
| H-11 | WhatsApp near-universal | §2 |
| INV-01, INV-02, INV-13 | Massar uniqueness, cautious matching, one account per person | PJ-PAR-02 |
| INV-17, INV-18, INV-31 | Tenant isolation, global access per relationship, contextual permissions | PJ-PAR-03 |
| INV-20, INV-26 | Permanent reading, report-card immutability | PJ-PAR-05 |
| INV-37, INV-39, INV-40 | Mobile mandatory and sufficient, no blocking, tamper-proof numbering | PJ-PAR-01, PJ-PAR-06, PJ-PAR-07, PJ-PAR-10 |
| Events `AbsenceRecorded`, `JustificationSubmitted`, `JustificationValidated`, `AbsenceThresholdReached` | Student life | PJ-PAR-04 |
| Event `ReportCardPublished` | Assessments | PJ-PAR-05 |
| Events `PaymentReceived`, `InstallmentOverdue`, `ReminderSent` | Finance | PJ-PAR-06, PJ-PAR-07 |
| Events `IdentityClaimed`, `DocumentGenerated` | Identities; documents | PJ-PAR-02, PJ-PAR-10 |
| BES-PAR-01 to BES-PAR-10 (`prd/02-actors-personas.md`) | Persona needs | §1.3 (cross-reference by step); PJ-PAR-11 (BES-PAR-09), PJ-PAR-12 (BES-PAR-10) |
| ARB-07, ARB-08, ARB-09, ARB-14 (`prd/cross-cutting/42-review-arbitrations.md`) | Identity, claim, number change, third-party payer | PJ-PAR-01, PJ-PAR-02, PJ-PAR-11 |
| ARB-15, ARB-17, ARB-19, ARB-20, ARB-21, ARB-25 | Notifications, progressive publication, receipts, moderated threads, opt-in | §2, PJ-PAR-04, PJ-PAR-05, PJ-PAR-07, PJ-PAR-08, PJ-PAR-10, PJ-PAR-12, OQ-03, OQ-06 |
| PC-04, PC-05, PC-06, PC-07, PC-08, PC-10, PC-11 (`prd/journeys/00-journey-map.md`) | Critical journeys | §1.3; PJ-PAR-01 to PJ-PAR-10 |
