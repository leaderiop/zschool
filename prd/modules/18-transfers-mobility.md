# ZSchool — Module TRA: Transfers and Mobility

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review; arbitrations from `prd/cross-cutting/42-review-arbitrations.md` applied (ARB-03, ARB-20, ARB-22, ARB-25) |
| Source | PROJECT.md §7.9 (transfers and mobility), §6.3 (state machine, RG-08 to RG-12), §6.9 (RG-28 to RG-32), §7.12 (transfer log with Massar references), §9 (logged consents), §12 (scope by version); RG-12, RG-14b, RG-28, RG-30, RG-31, RG-32; DEC-16, DEC-20, DEC-21, DEC-24, DEC-32; G-08; H-04; `prd/cross-cutting/42-review-arbitrations.md` (ARB-03, ARB-20, ARB-22, ARB-25) |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md` (PC-09), `prd/research/00-baseline-corrections.md`, `prd/research/01-market-competition.md`, `prd/research/04-pedagogy-massar-calendar.md`, `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/15-documents-certificates.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/21-massar-regulatory-exports.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` |

---

## 1. Purpose and scope

The TRA module implements school mobility between institutions, building on ZSchool's founding promise: a global identity per student that survives changes of school. A transfer is not a data migration but a **succession of relationships**: the origin enrollment is closed with status TRANSFERRED **at the exact moment the destination enrollment is activated** (a single transaction, ARB-22), the destination enrollment is created on the same `Person` (INV-43), and the destination never sees anything beyond what the legal guardian (or the adult student) has consented to share (RG-30). A departure that takes effect at the following school year's start is not a mid-year transfer: the year-N enrollment closes as COMPLETED with its year-end decision (RG-09), with no year-N+1 enrollment at the origin (ARB-03c).

Business objective: smooth departures and arrivals (the flow concentrates in June–September, PC-09) without data leakage, without wrongfully blocking departures over unpaid balances (DEC-24), and with a complete end-to-end audit trail.

### 1.1 In scope

| Capability | Version | References |
|---|---|---|
| Transfer request initiated by any legal guardian, the custodian, or the adult student (from their account), or by the ZSchool destination school; the legal tutor's signature (or the adult student's) is required at validation | MVP | §7.9; RG-14b; ARB-22 |
| File statuses: initiated, consent recorded, validated by the origin, accepted by the destination, activated, declined (by the destination only, for bounded reasons), cancelled, expired (30 days after validation with no activation) | MVP | ARB-22 |
| Choice of the shared scope by the legal guardian or the adult student, on the default transfer profile, with a consent log (`ConsentGrant`) | MVP | RG-30, RG-31; INV-23, INV-24 |
| Validation by the origin school: balance, with an account statement handed to the financial guardian (FR-FIN-24, MVP), return of loaned equipment, leaving certificate; the origin may decline only for a missing legal tutor signature, never for financial reasons | MVP | §7.9; RG-12; DEC-24; ARB-20e, ARB-22 |
| Closing the origin enrollment as TRANSFERRED and activating the destination enrollment on the same identity, in a single transaction; a departure taking effect the following school year is handled as COMPLETED + no year-N+1 enrollment | MVP | §6.3, §7.9; INV-05, INV-43; ARB-03c, ARB-22 |
| Intra-group transfer (two tenants of the same `Organization`): same procedure, same default profile; overseen by group leadership | MVP (procedure); V1 (consolidated view, RG-21) | ARB-22 |
| Destination school's access strictly limited to the shared scope | MVP | RG-30; INV-22 |
| Reference to the Massar procedure outside ZSchool: a field plus an archived document | MVP (field); V1 (consolidated log) | §7.9, §7.12; H-04 |
| Exit package for a non-ZSchool school: bilingual PDF | MVP | DEC-32; §12 MVP |
| Exit package: time-limited secure link with verification QR code | V1 | DEC-32; Q-15 |
| The receivable stays with the origin school on every transfer (no automatic transfer of debt); pro-rata for the month of transfer follows FR-FIN-03; the student is counted only once in `UsageMetric` for the month of transfer, at the origin | MVP | RG-12, C-10; FR-FIN-24; ARB-20c |
| Real transfer of unpaid balances between two sites of the same group (option, with the financial guardian's agreement) | V2+ (option) | §2.11; research 01 §5; see OQ-01 |
| Read-only access after closure with a correction grace period (default: 60 days) | MVP | RG-32; INV-25 |
| Notifications across the transfer lifecycle (in-app, SMS) | MVP | §7.8; V1: WhatsApp, push (DEC-36) |
| Time-stamped timeline for every transfer (immutable logging of entries from MVP, arbitration D4); log of shared-scope views and audit export | MVP (timeline, entries); V1 (views, full audit) | RG-38; INV-33; ARB-25j |

### 1.2 Out of scope

| Item | Reason and reference |
|---|---|
| Carrying out the Massar procedure itself (filing the request, provincial validation) | Outside ZSchool in V1; TRA only records the reference and the supporting document (§7.9; H-04) |
| Digital school passport | V2+ (PROJECT.md §12; §6.9); `ConsentGrant` is already set up to serve as its foundation |
| Generating and managing official documents (templates, numbering, seal) | Documents module (`prd/modules/15-documents-certificates.md`); TRA triggers the leaving certificate and references it |
| Balance accounting, billing, reminders | Finance module (`prd/modules/16-finance-billing-collections.md`); TRA consumes the account statement and does not write finance data (except for the group unpaid-balance transfer option, V2+) |
| Health data | Never transferred, never displayed, never exported by TRA (DEC-08; RG-31); no consent checkbox exists for it |
| Internal data (unpublished grades, drafts, deliberations, ongoing disciplinary proceedings, staff observations) | Never portable (RG-29; INV-21); outside the sharing scope |
| Teacher and staff mobility | Career module (`prd/modules/19-teacher-career-network.md`); affiliation is governed by §6.5 and RG-17 to RG-19 |
| A student arriving from a non-ZSchool school (declared prior history, paper documents) | Enrollment module: FR-INS-26 (`prd/modules/11-admissions-enrollment-reenrollment.md`, ARB-22); TRA only handles departures and arrivals between ZSchool schools |
| Bulk transfers initiated by the origin when a school closes | V1, with FR-ADM-13 (`prd/modules/10-administration-onboarding-subscription.md`); the single-file flow in this chapter applies to each student |

---

## 2. Users and use cases

| Actor | Role in the transfer | Key rights |
|---|---|---|
| Legal tutor (parent account) | May initiate the request; chooses the shared scope and signs the consent; receives the leaving certificate | Required signatory for the transfer and the leaving certificate (RG-14b; INV-11); may revoke a consent, with revocation covering future access (INV-24) |
| Other legal guardian or custodial parent who is not the legal tutor (e.g. custodial mother) | May initiate the request, which is then forwarded to the legal tutor for signature; views the file and obtains administrative school documents (self-service certificate of enrollment, ARB-20f) | Does not sign the transfer consent if a legal tutor is on record; in case of conflict, the school arbitrates and may request a court ruling (RG-14b, RG-16); does not receive the account statement unless they are the financial guardian (ARB-20e) |
| Financial guardian (tutor or third party) | Receives the account statement at departure (FR-FIN-24) | Sole recipient of the financial situation (rule N7 of `prd/cross-cutting/30-roles-permissions-matrix.md`) |
| Adult student (18 years or older) | Initiates, chooses the scope, and signs in place of the guardians | Holds their own account and rights (RG-30, RG-31; DEC-20; ARB-10) |
| Origin school leadership | Validates the request (checklist: balance, equipment, certificate, Massar reference); the closure to TRANSFERRED is executed by the platform when the destination activates | May decline only for a missing legal tutor signature; never for an unpaid balance; the leaving certificate is always issuable (RG-12, DEC-24; ARB-22) |
| Origin front office | Prepares documents, issues the statement and exit package, tracks the timeline | Scope limited by the permissions matrix (`prd/cross-cutting/30-roles-permissions-matrix.md`) |
| Destination ZSchool school | May initiate the request; accepts or declines (bounded reasons: capacity, unauthorized cycle, incomplete file); receives the consented scope; prepares then activates the destination enrollment on the existing identity | No automatic access to the origin file outside the shared scope (RG-30; INV-22); activation triggers the origin's closure (ARB-22) |
| Non-ZSchool destination school | Receives the exit package (PDF or secure link) presented by the family | No ZSchool account; access via link, without internal authentication |
| Multi-site group leadership (V1) | Oversees intra-group transfers (same procedure, same default profile, ARB-22); may enable the cross-site unpaid-balance transfer (V2+ option, OQ-01) | Consolidated views without merging tenant data (RG-21) |

Typical use cases: a move requiring a change of school mid-year; moving from primary to middle school at a different institution; a parental relocation in June for the following school year (year N closes COMPLETED, ARB-03c); departure to a school not using ZSchool (paper exit package); rebalancing a student between two sites of the same group with the receivable tracked; a request validated but never activated by the destination (expiry, the student stays ACTIVE at the origin); the destination declining for lack of space.

Persona needs served: BES-PAR-01 and BES-PAR-04 (a single parent account for multiple children across multiple schools, including during and after a transfer), BES-DIR-02 (the receivable stays managed after departure), BES-GAR (the custodial mother obtains administrative documents in line with the ministry's position, RG-14b) — `prd/02-actors-personas.md`.

---

## 3. Key journeys

The reference journey is **PC-09 — Inter-school ZSchool transfer and non-ZSchool exit package** (`prd/journeys/00-journey-map.md`): request, consent, validation, closure to TRANSFERRED, creation of the destination enrollment, exit package. Version: MVP for a simple transfer between two ZSchool schools and the PDF exit package; V1 for the time-limited secure link with QR code (DEC-32).

The detailed per-persona steps (request and scope selection on the parent side, validation and closure on the leadership and front-office side) are described in the persona files `prd/journeys/01-school-group-director.md` through `prd/journeys/07-students-minor-and-adult.md`; this chapter does not duplicate them. This module defines the requirements and screens; it assumes the enrollment state machine described in `prd/03-domain-data-model.md` §3 (ACTIVE or SUSPENDED → TRANSFERRED transitions, §3.2, ARB-03a) and the INV-05, INV-22 to INV-25, and INV-43 invariants from the same file. A student arriving from a non-ZSchool school falls under FR-INS-26 (`prd/modules/11-admissions-enrollment-reenrollment.md`).

---

## 4. Functional requirements

### FR-TRA-01 — Initiate a transfer request from the parent or the destination school

| Attribute | Value |
|---|---|
| Description | A transfer begins with a request initiated (a) by a legal guardian, the custodian, or the adult student from their account: choosing the child, a destination school found in the minimal public read-only directory (name, city, cycles — RG-23, INV-19; the directory is carried by FR-CAR-14 of `prd/modules/19-teacher-career-network.md`, MVP) or a declared non-ZSchool destination, a desired effective date (immediate mid-year or at the following school year's start), an optional reason; or (b) by the destination ZSchool school: identifying the sought student (by Massar code or matching, with anti-enumeration protection, §9) and sending the request to the origin school. In case (b), no file content is transmitted before the legal tutor's consent (RG-30). When the initiator is not the legal tutor (nor the adult student), the request is forwarded to the legal tutor for signature before any validation (RG-14b, INV-11); the initiator is informed. The origin school is notified of the request. (→ ARB-22) |
| Priority | Must |
| Version | MVP |
| Traceability | §7.9; RG-14b, RG-23, RG-30; G-08; ARB-22 |
| Actors | Legal guardian, custodian, adult student (initiators); legal tutor (signature); destination school leadership or front office; origin school leadership (notified) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Transfer request initiated by the legal tutor
  Scenario: Request toward a ZSchool school
    Given a student ACTIVE at the origin school for the current year
    And an authenticated legal tutor on their parent account
    When they select their child, the destination "School B" in the directory, and an effective date at the following school year's start
    Then a request with status "initiated" is created and addressed to both schools
    And the origin school's leadership receives an in-app and SMS notification

  Scenario: Request initiated by the destination school without data leakage
    Given a ZSchool destination school searching for a student enrolled elsewhere by their Massar code
    When it sends a transfer request
    Then only the origin school is notified
    And the destination school sees no data of the student before the legal tutor's consent

  Scenario: Request initiated by the custodial mother, signed by the legal tutor (MVP)
    Given a custodial mother who is not the legal tutor, authenticated on her account
    When she initiates a transfer request for her daughter
    Then the request is created with status "initiated" and the note "legal tutor signature required"
    And the legal tutor receives a notification to sign or decline the request
    And no validation by the origin is possible before that signature
```

### FR-TRA-02 — Transfer file: tracking, statuses, and documents

| Attribute | Value |
|---|---|
| Description | Each transfer is carried by an identified `TransferRequest` file, visible to both schools, the legal tutor, and the initiator, with a time-stamped timeline. File statuses (ARB-22): **initiated**; **consent recorded**; **validated by the origin** (checklist FR-TRA-05, with or without a future effective date); **accepted by the destination** (destination enrollment prepared); **activated** (closure to TRANSFERRED at the origin and activation at the destination in one transaction, FR-TRA-06); **declined**: by the destination only, for a mandatory reason from a bounded list (capacity reached, unauthorized cycle or section, incomplete file) — the origin has no decline option, only a "missing legal tutor signature" block (DEC-24, RG-14b); **cancelled**: by the legal tutor or the adult student at any time before activation; **expired**: 30 days (configurable) after origin validation with no destination activation, the student staying ACTIVE at the origin and both parties being notified. The file brings together: destination, effective date, reason, documents (leaving certificate, Massar reference and document, any supporting evidence; the account statement is only attached for the financial guardian). Decline, cancellation, and expiry are notified to the parties and logged in the timeline; the file is kept regardless of its final state (never deleted, RG-10 applied to the file by analogy). A new request may be initiated after a decline, cancellation, or expiry. |
| Priority | Must |
| Version | MVP |
| Traceability | §7.9; RG-10, RG-14b; RG-38; DEC-24; ARB-22 |
| Actors | Legal tutor; adult student; leadership and front office of both schools |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Transfer file lifecycle (MVP)
  Scenario: Decline by the destination for capacity reached
    Given a file "validated by the origin" toward "School B"
    And the target class at "School B" at capacity with no leadership waiver
    When "School B"'s leadership declines the file with the reason "capacity reached"
    Then the file moves to status "declined" with a reason, author, and timestamp
    And the origin enrollment stays ACTIVE with no change
    And the legal tutor and the origin school are notified

  Scenario: The origin cannot decline over an unpaid balance
    Given a file "consent recorded" with an unpaid balance of 3,000 MAD at the origin
    When the origin school's leadership opens the file
    Then no "decline" action is offered
    And validation stays possible, the balance being only an alert (DEC-24)

  Scenario: Expiry of a validated file never activated
    Given a file "validated by the origin" for 30 days with no acceptance or activation by the destination
    When the configured expiry period is reached
    Then the file moves to status "expired"
    And the origin enrollment stays ACTIVE and the student keeps appearing on its attendance lists
    And the legal tutor and both schools are notified

  Scenario: Cancellation by the legal tutor before activation
    Given a file "accepted by the destination" not yet activated
    When the legal tutor cancels the request from their account
    Then the file moves to status "cancelled" and the prepared destination enrollment is cancelled (CANCELLED state, ARB-03b)
    And the origin enrollment stays ACTIVE
```

### FR-TRA-03 — Choose the shared scope on the default transfer profile

| Attribute | Value |
|---|---|
| Description | Before any transmission, the legal tutor (or the adult student, RG-30/31 and DEC-20) chooses the shared scope from a pre-checked default profile (RG-31, INV-23): identity (civil status in dual script, photo), Massar code, schools attended, years, levels and year-end decisions, official documents (leaving certificate, year-end transcripts). Three further blocks are strictly opt-in and separate: detailed grades (period report cards), attendance, and disciplinary data (a summary, within the limits allowed by RG-29 — see OQ-03). Health data does not appear and is not shareable (DEC-08). Unpublished internal data is excluded by default (RG-29). "Schools attended" is derived from enrollments known to the platform; prior schooling outside ZSchool appears there with the note "declared, unverified" when it was entered via FR-INS-26 (declared prior history, `prd/modules/11-admissions-enrollment-reenrollment.md`, ARB-22). The chosen scope applies only to the designated destination. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-30, RG-31; DEC-08, DEC-20; INV-21, INV-23 |
| Actors | Legal tutor; adult student |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Shared scope of an inter-school transfer with consent
  Scenario: Consenting to the default profile with an opt-in block
    Given a legal tutor who must consent to their child's transfer from "School A" to "School B"
    When they keep the default profile and explicitly check "detailed grades"
    And they confirm their consent
    Then a logged consent is recorded for "School B" with the default scope plus detailed grades
    And the destination school is notified that the shared file is available

  Scenario: Health data is never shareable
    Given the shared-scope selection screen
    When the legal tutor browses the available blocks
    Then no health data block is shown or selectable
    And no health data leaves the origin school
```

### FR-TRA-04 — Revocable and bounded consent log

| Attribute | Value |
|---|---|
| Description | Each sharing consent is a logged `ConsentGrant` (timestamp, identified consenting party, recipient, exact scope, duration, basis "transfer"), immutable once recorded. It is time-bounded (default: the length of enrollment at the destination school, configurable) and revocable at any time by the consenting party from their account; revocation covers future access without erasing official documents already transmitted in the procedure (RG-30: those documents are exchanged within the procedure and fall under RG-28 for the person concerned). Entries about the consent (grant, change, revocation) are logged immutably from MVP; logging of the destination's views of the shared scope falls under the V1 audit log (RG-38, arbitration D4, ARB-25j). The consenting party receives a notification of the grant and of the revocation. |
| Priority | Must |
| Version | MVP (entries); V1 (log of views) |
| Traceability | RG-30, RG-31, RG-38; §9; INV-24; ARB-25j |
| Actors | Legal tutor; adult student; recipient school (viewer) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Revoking a transfer consent
  Scenario: Revocation covering future access
    Given an active consent granted to "School B" with access to detailed grades
    When the legal tutor revokes that consent from their account
    Then the consent moves to status "revoked" with a timestamp
    And "School B" immediately loses access to shared data not yet viewed
    And the legal tutor and "School B" are notified

  Scenario: Official documents already exchanged remain
    Given a leaving certificate and a year-end transcript already transmitted in the procedure
    When the legal tutor revokes the consent
    Then those official documents stay in the destination file
    And the revocation is logged in the transfer file's timeline
```

### FR-TRA-05 — Validation by the origin school: balance, equipment, certificate

| Attribute | Value |
|---|---|
| Description | The origin school's leadership validates the request at the end of a checklist: (a) financial situation checked and **account statement handed to the financial guardian** (FR-FIN-24, MVP; RG-12, §7.7; ARB-20e — never to a guardian who is not the payer) — a nonzero balance never prevents validation or the issuance of the certificate (DEC-24, INV-39); the only validation condition is the legal tutor's or the adult student's signature (RG-14b, ARB-22); (b) return of loaned equipment confirmed item by item (configurable list: textbooks, tablet, ID card, uniform, lab equipment) with missing items noted; (c) leaving certificate generated, bilingual, numbered, signed under the documents module's mechanism (`prd/modules/15-documents-certificates.md`; RG-14b: the legal tutor appears as the requester); (d) reference and document of the Massar procedure recorded (FR-TRA-08) — validation is possible without this reference, with an explicit "pending" note. Validation records the status "validated by the origin"; actual closure only occurs on activation by the destination (FR-TRA-06), at the earliest on the effective date. |
| Priority | Must |
| Version | MVP |
| Traceability | §7.9; RG-12, RG-14b; DEC-24; INV-39; FR-FIN-24; ARB-20e, ARB-22 |
| Actors | Origin school leadership; front office (preparation) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Transfer validation by the origin school
  Scenario: Validation with an unpaid balance not blocking
    Given a transfer file with status "consent recorded"
    And a nonzero financial balance of 1,200 MAD on the enrollment's account
    When the leadership reviews the situation, hands the account statement to the financial guardian, and completes the checklist
    Then the file moves to status "validated by the origin"
    And the leaving certificate is generated and available to the legal tutor
    And the receivable stays tracked by the origin school until settled

  Scenario: Missing equipment recorded without delaying the departure
    Given a textbook not returned at the time of validation
    When leadership closes the return checklist
    Then the missing item is recorded in the time-stamped checklist
    And the transfer is not blocked by this missing item
```

### FR-TRA-06 — Close as TRANSFERRED and create the destination enrollment on the same identity

| Attribute | Value |
|---|---|
| Description | As soon as the destination accepts, the destination enrollment is **prepared** (PRE-ENROLLED) on the existing `Person` (INV-43; no new identity, RG-04) and follows the normal path of the enrollment module (`prd/modules/11-admissions-enrollment-reenrollment.md`; level, class, regime, guardians, internal rules and Law 09.08 notices), the shared scope pre-filling what was consented to. **Activation** of the destination enrollment (complete file, initial payment, at the earliest on the effective date) and the ACTIVE-or-SUSPENDED → TRANSFERRED transition of the origin enrollment (`prd/03-domain-data-model.md` §3.2, ARB-03a) are executed **in a single transaction**: both operations succeed or fail together, so the student is never without an ACTIVE enrollment nor holds two ACTIVE enrollments at once (INV-05). Until activation occurs, the origin stays ACTIVE and the student appears on its attendance lists; without activation within the deadline, the file expires (FR-TRA-02). Closure records the reason "transfer", the date, and the destination school. The origin's financial relationship survives closure until settled (RG-12, INV-08); the transfer-month pro-rata follows FR-FIN-03 and the student is only counted once in `UsageMetric` for that month, at the origin (ARB-20c). The parent–student relationship is global and is not duplicated (RG-15). **Departure at the following school year's start** (ARB-03c): this is not a TRANSFERRED transition; the year-N enrollment is closed COMPLETED with its `YearDecision` at rollover (FR-INS-21), no year-N+1 enrollment is created at the origin, and the transfer file (with an effective date at the start of the year) serves as the basis for the year-N+1 enrollment at the destination, which activates through the normal path. The `TransferValidated` event is emitted upon activation. |
| Priority | Must |
| Version | MVP |
| Traceability | §6.3, §7.9; RG-04, RG-08, RG-09, RG-10, RG-12, RG-15; DEC-21; INV-05, INV-08, INV-43; ARB-03a, ARB-03c, ARB-20c, ARB-22 |
| Actors | Platform (closure automation); destination school (completing the enrollment); legal tutor (notified) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Transfer closure and destination enrollment
  Scenario: Mid-year transfer on the same identity (MVP)
    Given an ACTIVE enrollment at "School A" and a file "accepted by the destination" with an immediate effective date
    And a destination enrollment PRE-ENROLLED at "School B" with a complete file and the initial payment collected
    When "School B" activates the destination enrollment
    Then, in the same transaction, the origin enrollment moves to status TRANSFERRED with reason, date, and destination
    And the destination enrollment moves to ACTIVE on the same Person, with no new identity
    And the (student, year) pair holds only one ACTIVE enrollment, at "School B"

  Scenario: Failed activation without effect on the origin (MVP)
    Given the same file and a destination enrollment whose financial guardian is not filled in
    When "School B" attempts activation
    Then activation is refused (INV-09) and the origin enrollment stays ACTIVE with no change
    And the student still appears on "School A"'s attendance lists

  Scenario: Departure at the following school year's start closed as COMPLETED (MVP, wave 2)
    Given a validated file with an effective date of "following school year's start" for a 6th-grade primary student at "School A"
    When "School A" runs the year-end rollover
    Then the year-N enrollment moves to COMPLETED with the decision "promoted to the next level"
    And no year-N+1 enrollment is created at "School A" for that student
    And "School B" holds the file to create the year-N+1 enrollment on the same Person
```

### FR-TRA-07 — Destination school's access limited to the shared scope

| Attribute | Value |
|---|---|
| Description | The destination school views an "incoming student" file composed exclusively of the consented scope: identity, Massar code, enrollment history (schools, years, levels, decisions), transmitted official documents, and any checked opt-in blocks. No other origin data is visible, listable, or exportable (RG-30, INV-22); there is no "full history" view on the destination side. Every view is logged on the origin side and visible to the legal tutor in their consent history starting in V1 (RG-38, audit log, arbitration D4; at MVP, the access restriction applies in full but only entries are logged, ARB-25j). Any request for data outside the scope goes through a request addressed to the legal tutor, who consents or declines. |
| Priority | Must |
| Version | MVP (access restriction); V1 (log of views) |
| Traceability | RG-30, RG-38; DEC-07; INV-18, INV-22; ARB-25j |
| Actors | Destination school (leadership, front office); legal tutor (traceability) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Bounded access for the destination school
  Scenario: Viewing within scope
    Given a consented scope without attendance or discipline
    When the destination leadership opens the "incoming student" file
    Then they see identity, Massar code, yearly history, and official documents
    And no attendance, discipline, unshared grades, finance, or health section is accessible

  Scenario: Requesting further data
    Given a destination need for period report cards not shared
    When the destination sends a request to the legal tutor
    Then only a new explicit consent from the legal tutor opens that data
    And the origin has no forced "share everything" button
```

### FR-TRA-08 — Reference to the non-ZSchool Massar procedure

| Attribute | Value |
|---|---|
| Description | The ministerial transfer procedure is carried out outside ZSchool (§7.9; H-04: no API): the module records a "Massar reference" field on the file (number or wording of the provincial education office's decision) and the scanned supporting document. The screen indicates the outside-platform procedure for information: request filed by the tutor from their Massar parent portal (requests section) with documents, followed by provincial validation (source: `prd/research/04-pedagogy-massar-calendar.md`); ZSchool automates no filing. The field is optional at validation and its absence is flagged in an internal pending list. A consolidated, filterable, exportable log of transfers with Massar references is available to school leadership (§7.12). |
| Priority | Must (field and document); Should (consolidated log) |
| Version | MVP (field and document); V1 (log) |
| Traceability | §7.9, §7.12; H-04; G-08 |
| Actors | Origin front office and leadership; leadership (log) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Massar reference of a transfer (MVP)
  Scenario: Validation possible without a Massar reference
    Given a file "consent recorded" whose family has not yet obtained the provincial decision
    When the origin school's leadership validates the checklist leaving the reference blank
    Then the file moves to status "validated by the origin" with the note "Massar reference pending"
    And the file appears in the list of transfers without a reference

  Scenario: Later entry of the reference and the document
    Given a file activated without a Massar reference
    When the front office enters the reference and attaches the scanned document provided by the family
    Then the reference and document are recorded with author and timestamp
    And the "pending" note disappears without changing the enrollment's state
```

### FR-TRA-09 — Exit package for a non-ZSchool school

| Attribute | Value |
|---|---|
| Description | When the destination does not use ZSchool, the closure (TRANSFERRED to the declared school, or WITHDRAWN with no destination, RG-10) produces an **exit package**: a single, bilingual AR/FR document (DEC-10), compiling the default transfer profile (RG-31): identity, Massar code, enrollment and decision history, leaving certificate, year-end transcripts (FR-EVA-18, MVP wave 2) — opt-in blocks add consented detailed grades or attendance. The account statement (FR-FIN-24) is **not** included in the exit package: it is handed separately to the financial guardian only (ARB-20e), finance not being part of the transfer profile (RG-31). At MVP: a numbered PDF is generated and handed to the legal tutor or the adult student. From V1 onward (DEC-32, Q-15): the package is also exposed via a **time-limited secure link** (configurable duration, see OQ-02), requiring no account, with a **verification QR code** for authenticity, and access tracking (timestamps). The link can be regenerated (new duration) and revoked. The document is hosted in Morocco (DEC-26). |
| Priority | Must |
| Version | MVP (bilingual PDF); V1 (time-limited secure link and QR code) |
| Traceability | RG-28, RG-31; DEC-10, DEC-26, DEC-30, DEC-32; Q-15; ARB-19, ARB-20e |
| Actors | Legal tutor; adult student; origin school leadership and front office; non-ZSchool school (recipient) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Exit package for a non-ZSchool school
  Scenario: Generating the bilingual package (MVP)
    Given a closure to TRANSFERRED toward a non-ZSchool school with the default scope
    When the front office generates the exit package
    Then a bilingual AR/FR PDF document is produced with identity, Massar code, history, leaving certificate, and year-end transcripts
    And the document carries its own numbering, the date, and the school's seal
    And no account statement appears in it

  Scenario: Verification QR code and secure link (V1)
    Given the same package generated in V1
    When the front office creates the secure link
    Then the document carries a verification QR code (DEC-30) and the link has a limited duration

  Scenario: Expired secure link (V1)
    Given a secure link issued for 30 days toward the exit package
    When the recipient school opens the link after expiry
    Then access is refused with a bilingual expiry message
    And the legal tutor may request a link regeneration

  Scenario: Withdrawal with no destination (MVP)
    Given a closure to WITHDRAWN (departure with no known destination, RG-10)
    When the legal tutor requests their exit package
    Then the same package is produced, with no destination-school field filled in
```

### FR-TRA-10 — Keep the receivable with the origin school; cross-site transfer as a V2+ option

| Attribute | Value |
|---|---|
| Description | On every transfer, the receivable stays with the origin school: the unpaid balance remains a collections receivable carried on the financial guardian's account at the origin tenant (surviving financial relationship, RG-12, INV-08; C-10), tracked through reminders and the aged-balance report until settled; the balance is never automatically transmitted to the destination school, which only knows what the account statement handed to the legal tutor documents (FR-TRA-05). In V2+ (option), for a transfer between two ZSchool schools of the same `Organization` (multi-site group, §2.11) and with the explicit agreement of the financial guardian, the origin school's leadership may **transfer the unpaid balance** as an opening receivable on the destination enrollment's financial account (a practice inspired by PowerSchool's *Transfer unpaid fees* option — `prd/research/01-market-competition.md` §5); the transfer is a named act, logged on both sides (amount, remaining installments, time-stamped payer agreement, invoice references), never automatic. Aligned with FR-FIN-24 (`prd/modules/16-finance-billing-collections.md`): arbitration D2, cross-referenced in both traceability tables |
| Priority | Should |
| Version | MVP and V1 (receivable kept at the origin, in line with FR-FIN-24); V2+ (option: real cross-site transfer within the same group — see OQ-01) |
| Traceability | RG-12; C-10; §2.11; INV-08; research 01 §5; FR-FIN-24 (`prd/modules/16-finance-billing-collections.md`) |
| Actors | Origin school leadership; financial guardian (agrees to the transfer, V2+); destination site leadership (informed) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Fate of the receivable on a transfer
  Scenario: Receivable kept at the origin with no transfer
    Given a validated transfer from "School A" to "School B" with a balance of three remaining monthly installments
    When the origin enrollment's closure is executed
    Then the receivable stays carried on the financial guardian's account at the "School A" tenant
    And the account statement handed to the legal tutor documents the remaining balance due
    And no amount is automatically transmitted to the destination enrollment's account at "School B"

  Scenario: Cross-site transfer within the same group (V2+, option enabled)
    Given an Organization grouping "School A" and "School B" with the transfer option enabled
    And a remaining balance of three monthly installments on the "School A" enrollment
    When "School A"'s leadership proposes the transfer and the financial guardian accepts
    Then the receivable is recorded as an opening receivable on the destination enrollment at "School B"
    And the operation is logged with the time-stamped agreement on both files

  Scenario: Outside the group, no transfer possible
    Given a transfer to a school outside the Organization
    When leadership reviews the financial closure options
    Then the transfer option does not exist before V2+ and is not offered
    And the receivable stays fully tracked by the origin school
```

### FR-TRA-11 — Read-only access after closure with a 60-day grace period

| Attribute | Value |
|---|---|
| Description | After closure to TRANSFERRED (as with any closure), the origin enrollment's school data becomes **read-only** for the school (RG-32, INV-25): no more entering attendance, grades, incidents, or file changes. During a **configurable grace period, default 60 days**, a correction remains possible (adjusting an attendance record, a published grade under the assessments module's rules (`prd/modules/14-assessments-grades-report-cards.md`), the file); every correction during grace is logged (immutable entry from MVP, arbitration D4). After the grace period, any correction requires the audited procedure: a reasoned request from the authorized role, justification, logged validation, a separate entry in the history (MVP) then in the exportable audit log (V1, RG-38, ARB-25j). Documents already published stay governed by their own immutability rules (RG-33). The financial relationship, on the other hand, stays active until settled (RG-12, INV-08). |
| Priority | Must |
| Version | MVP |
| Traceability | RG-32, RG-38; INV-25 |
| Actors | Origin school leadership and front office; authorized role (audited corrections) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Immutability after transfer closure
  Scenario: Correction during the grace period
    Given an enrollment closed TRANSFERRED 10 days ago
    When leadership corrects a mistaken attendance record from the past week
    Then the correction is accepted and logged with author, reason, and timestamp

  Scenario: Correction refused outside grace without an audited procedure
    Given an enrollment closed TRANSFERRED 75 days ago (60-day grace period)
    When a user attempts to modify a school data item of the enrollment
    Then the change is refused as a direct write
    And the only path is the audited correction procedure, logged in the audit log
```

### FR-TRA-12 — Notifications across the transfer lifecycle

| Attribute | Value |
|---|---|
| Description | Each step of the lifecycle produces a notification addressed to the right parties according to the preferences and routing of the communication module (`prd/modules/17-communication-notifications.md`): request initiated (both schools; the legal tutor when the initiator is another guardian, for signature), consent granted or revoked (legal tutor, destination), validation by the origin, acceptance, reasoned decline, cancellation and expiry (legal tutor, initiator, both schools), activation and closure (legal tutor, destination), exit package available (legal tutor), account statement available (financial guardian), unpaid-balance transfer proposed and accepted (financial guardian; V2+, group option). Associated domain events: `TransferValidated`, `ConsentGranted`, `ConsentRevoked`, in addition to `EnrollmentStatusChanged` (`prd/03-domain-data-model.md` §7). Channels: in-app and SMS at MVP; WhatsApp and push in V1 (DEC-36). |
| Priority | Must |
| Version | MVP (in-app, SMS); V1 (WhatsApp, push) |
| Traceability | §7.8; DEC-36; `prd/03-domain-data-model.md` §7 |
| Actors | Legal tutor; adult student; leadership of both schools |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Notifications across the transfer lifecycle (MVP)
  Scenario: Activation notified on the MVP channels
    Given a transfer file activated between "School A" and "School B"
    When the TransferValidated event is emitted
    Then the legal tutor receives an in-app and SMS notification in their preferred language
    And the leadership of "School A" and of "School B" receive an in-app notification
    And no school data is contained in the message, only the file reference

  Scenario: Expiry notified
    Given a file that has moved to status "expired"
    When the platform detects the expiry
    Then the legal tutor and both schools are notified with the reminder that the student stays enrolled at "School A"
```

### FR-TRA-13 — Transfer log and audit trail

| Attribute | Value |
|---|---|
| Description | Each file carries its immutable timeline: initiation, consents (grant, change, revocation), destination views, validation, Massar reference, closure, issuance of the certificate and the exit package, financial transfers, corrections during grace. This timeline is viewable by both schools (each within their own scope) and by the legal tutor; its entries are immutable from MVP (file-level logging, arbitration D4). In V1, the whole is integrated into the school's exportable audit log (immutable, 5 years — DEC-22) and views of sensitive data appear there (RG-38, INV-33, ARB-25j). |
| Priority | Must |
| Version | MVP (per-file timeline, immutable entries); V1 (full audit log, views, export) |
| Traceability | RG-38; DEC-22; INV-24, INV-33; ARB-25j |
| Actors | Leadership of both schools; legal tutor (read); internal audit |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Immutable timeline of the transfer file (MVP)
  Scenario: Every state change is logged
    Given a file that has passed through the statuses initiated, consent recorded, validated by the origin, accepted by the destination, and activated
    When the origin school's leadership opens the timeline
    Then every state change appears with author, timestamp, and, where relevant, a reason
    And no entry can be modified or deleted

  Scenario: Reading scope of the destination
    Given the same file opened by the destination's leadership
    When they view the timeline
    Then they see the file's steps but neither the financial checklist nor the origin's financial detail
```

---

## 5. Morocco-specific considerations

| Subject | Treatment |
|---|---|
| Massar procedure | A student transfer goes through a ministerial procedure outside ZSchool: a request filed from the Massar parent portal (requests section) with documents (birth certificate, transcripts, photo), validated by the provincial education office; a recent circular has removed restrictions on transfers from private to public schools (source: `prd/research/04-pedagogy-massar-calendar.md`, correcting and refining PROJECT.md §2.6 — see OQ-04). Massar exposes no API (H-04): TRA is limited to a reference field plus a document, with no automated exchange. |
| Leaving certificate (*شهادة المغادرة*) | Official bilingual, numbered exit document, generated by the documents module (`prd/modules/15-documents-certificates.md`) at validation time (FR-TRA-05). Law 59.21 penalizes refusal to issue certificates and attestations by up to 10,000 DH when the contract is respected (source: `prd/research/00-baseline-corrections.md`, note 2): the validation checklist never has the effect of withholding the certificate (DEC-24, INV-39). |
| Moudawana and parental status | The legal tutor (by default the father; the mother in case of death, absence, or incapacity, or by ruling) is the required signatory for the transfer and the leaving certificate (RG-14b, INV-11); the custodial mother may initiate the request, which is forwarded to the tutor for signature (ARB-22), and obtains administrative school documents in self-service, including the certificate of enrollment (ministerial position, ARB-20f); conflicting requests are arbitrated by the school, which may require a ruling (RG-16). |
| Law 09.08 and CNDP | The sharing consent is logged, bounded, and revocable (INV-24); ZSchool is the data controller for global identity and consent, and the processor for schools' operational data (DEC-16); the exit package is hosted in Morocco, with no international-transfer formality (DEC-26). |
| Seasonality | Transfers concentrate in June–September (relocations, moves, orientation decisions) with a secondary mid-year flow (PC-09, §4.1 of the journey map): screens and notifications are sized for this peak. |

---

## 6. Data and events

Entities from the `prd/03-domain-data-model.md` §2 schema used by the module:

| Entity | Use in TRA |
|---|---|
| `TransferRequest` | Transfer file: student, origin, destination, statuses (initiated, consent recorded, validated by the origin, accepted by the destination, activated, declined, cancelled, expired — ARB-22), initiator, signatory, effective date, expiry deadline, documents, shared scope, Massar reference |
| `ConsentGrant` | Consent of the legal tutor or the adult student: scope, duration, timestamp, basis "transfer"; statuses active, expired, revoked; logged (INV-24) |
| `Enrollment` | Origin enrollment closed TRANSFERRED upon destination activation (ACTIVE-or-SUSPENDED → TRANSFERRED transitions, §3.2, ARB-03a), or COMPLETED for a departure at the following school year's start (ARB-03c); destination enrollment PRE-ENROLLED then ACTIVE on the same identity, CANCELLED if the file is cancelled |
| `Person`, `StudentProfile` | Identity transferred, never duplicated (INV-43); unique Massar code (INV-01) |
| `ParentStudentRelationship` | Global relationship unchanged by the transfer (RG-15); statuses determining the consenting party (RG-14b) |
| `FinancialAccount`, `Invoice`, `Installment`, `UsageMetric` | Account statement handed to the financial guardian at departure (FR-FIN-24, MVP); receivable surviving closure (INV-08); receivable always kept at the origin (FR-FIN-24, C-10); pro-rata for the transfer month (FR-FIN-03) and single count of the active student (ARB-20c); cross-site transfer in V2+ (option, OQ-01) |
| `Certificate`, `ReportCard`, `Transcript` | Official documents transmitted within scope (leaving certificate, transcripts); produced by DOC and EVA |
| `StudentDocument` | File documents (Massar reference and document, supporting evidence) |
| `School`, `Organization` | Destination (minimal directory, RG-23, carried by FR-CAR-14 at MVP); scope of the unpaid-balance transfer (V2+, option) |
| `AuditLog`, `DataExport` | Timeline and audit log; exported exit package (DEC-32) |

Notifiable domain events (consumed by the communication module (`prd/modules/17-communication-notifications.md`), routed per `prd/03-domain-data-model.md` §7): `TransferValidated` (on activation), `ConsentGranted`, `ConsentRevoked`, `EnrollmentStatusChanged` (closure to TRANSFERRED and activation of the destination enrollment), and the file's state changes (`TransferDeclined`, `TransferCancelled`, `TransferExpired` — to be added to the catalog of `prd/03-domain-data-model.md` §7, ARB-22). No TRA event carries school data content: only file and scope references.

---

## 7. Key screens

Text descriptions (conventions §1.3); mobile-first, bilingual FR/AR with full RTL support (cross-cutting UX rules: `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`).

### ECR-TRA-01 — Transfer request (parent, mobile)

Zones: (1) child selector (multi-child, multi-school view, BES-PAR-04); (2) destination search: a search field over the directory (name, city), cycle filters, or a "non-ZSchool school" choice with free-text name and city; (3) effective date: "immediate" or "at the following school year's start"; (4) reason (optional, common values plus free text); (5) summary and send button (*طلب نقل* — transfer request). States: draft, sent, awaiting legal tutor signature (if the initiator is not the tutor), declined by the destination (with reason), cancelled, expired. Behavior: searching the destination by Massar code is protected against enumeration (no usable result list outside an exact, consented match).

### ECR-TRA-02 — Choosing the shared scope and consenting (parent, mobile)

Zones: (1) file reminder (child, origin, destination, effective date); (2) "default sharing" block, pre-checked and locked in its wording: identity, Massar code, schools attended, years, levels and decisions, official documents (RG-31); (3) separate opt-in blocks: detailed grades, attendance, disciplinary data (see OQ-03); (4) permanent banner: "health data is never transferred"; (5) consent duration (default: length of enrollment at the destination school); (6) confirmation button with explicit validation, then a downloadable receipt. States: awaiting consent, granted, revoked, expired. Behavior: no sending is possible without confirmation; any change to the scope creates a new logged consent, without overwriting history.

### ECR-TRA-03 — Transfer queue and file (origin school, web)

Zones: (1) list of files by status with filters (status, class, destination, period) and counters; (2) three-column file view: time-stamped timeline, validation checklist (financial situation checked, statement handed over, item-by-item equipment return, leaving certificate generated, Massar reference and document), transmitted documents; (3) actions: validate, request more information; no "decline" button (the origin only has the "missing legal tutor signature" block, DEC-24, ARB-22). Checklist item states: to do, done, missing item noted, not applicable. Behavior: validation is possible with an unpaid balance and with the Massar reference "pending"; the screen shows the remaining time to expiry as long as the destination has not activated; the account statement is only visible to the role authorized for finance.

### ECR-TRA-04 — "Incoming student" file (destination school, web)

Zones: (1) applicant's identity and Massar code; (2) received scope, section by section, with the note "not shared" and a "request from the guardian" button (which notifies the legal tutor) for every missing section; (3) enrollment wizard: level, class, regime, guardians, pre-filled from the consented scope; (4) transfer file status, effective date, and expiry deadline; (5) actions: accept, decline (mandatory reason from the bounded list), activate (triggers, in one transaction, the origin's closure and the destination's activation). Behavior: no data outside the scope is visible, including in exports; activation is refused if the destination file is incomplete (INV-09) and leaves the origin unchanged in that case (ARB-22).

### ECR-TRA-05 — Transfer log (leadership, web, V1)

Zones: (1) consolidated table of the school's transfers (departures and arrivals): student, destination or origin, status, closure date, Massar reference; (2) filters (period, status, destination, reference present or not); (3) export; (4) access to each file's full timeline. Behavior: an alert column for closures to TRANSFERRED without a recorded Massar reference.

### ECR-TRA-06 — Exit package for a non-ZSchool school (origin, web and mobile)

Zones: (1) document preview before generation, with selection of consented opt-in blocks; (2) generating the bilingual PDF and sending it to the legal tutor (MVP); (3) secure-link management: creation with duration, regeneration, revocation, a QR code displayable and printable (V1); (4) link-access tracking (timestamps, without content viewed). States: not generated, generated, link active, link expired, link revoked. Behavior: generation is never blocked by the balance (DEC-24).

### ECR-TRA-07 — Consents and granted access (parent, mobile)

Zones: (1) list of the data subject's `ConsentGrant` entries by recipient: scope, date, duration, status; (2) detail of each consent with a downloadable receipt; (3) revocation button with explicit confirmation and a reminder of the effect (future access cut off, official documents already exchanged kept); (4) history of the destination's views. Behavior: also accessible to the adult student in their own account (DEC-20).

---

## 8. Integrations

| Integration | Role in TRA | Reference |
|---|---|---|
| Massar | No automated exchange in V1 (H-04): the transfer procedure is outside ZSchool, TRA records the reference and the document; a direct integration is only conceivable if an official channel opens (V2+, §12) | `prd/cross-cutting/35-external-integrations.md` (INT-MAS) |
| Electronic signature and seal | The leaving certificate and the exit package carry an advanced electronic seal, timestamp, and verification QR code in V1; a qualified seal via an accredited provider in V2 (DEC-30) | `prd/cross-cutting/35-external-integrations.md` (INT-SIG) |
| Messaging and notification channels | Lifecycle notifications through in-app, SMS (MVP), WhatsApp, and push (V1) channels, under the routing and opt-in rules of the communication module (`prd/modules/17-communication-notifications.md`) | `prd/cross-cutting/35-external-integrations.md` (INT-SMS, INT-WAP, INT-EML) |

No integration is specific to the module: TRA only consumes channels defined transversally; no outbound API to Massar or any other ministerial system exists in this module.

---

## 9. Module-specific non-functional requirements

| Domain | Module-specific requirement | Reference |
|---|---|---|
| Performance | Generating the exit package and the leaving certificate within a few seconds per document, including during the June peak; transactional closure and destination-enrollment creation (both operations succeed or fail together) | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-PERF) |
| Availability | Service available during the June–September mobility peak; no maintenance window during those periods | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-DISP) |
| Internationalization | All module screens and documents in FR and AR (RTL); exit package and certificate mandatorily bilingual | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-I18N) |
| Security | Exit-package link signed, time-limited, revocable, with a verification QR code; anti-enumeration protection on the Massar-code search; views of the shared scope logged | `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md` (NFR-DOC) |
| Resilience and retention | Immutable, exportable file timelines; audit log kept 5 years; official documents kept permanently; a clear response and controlled regeneration for an expired secure link | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-SAV, NFR-RES); DEC-22 |
| Mobile accessibility | The parent journey (request, scope, revocation) fully usable from a smartphone, tolerant of unstable connections | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-MOB, NFR-OFF) |

---

## 10. Success metrics

Candidate indicators for steering the module (the `KPI-NN` identifiers are carried by `prd/cross-cutting/38-kpi-success-metrics.md`; target values to be set in review):

| Indicator | Definition | Indicative target |
|---|---|---|
| Processing time | Median duration between request initiation and closure | A few business days; to be calibrated in review |
| Massar coverage | Share of transfers closed with a recorded Massar reference | Close to 100% after the procedure window |
| ZSchool share | Share of transfers toward a ZSchool destination (network effect) | Growing year over year |
| Exit packages | Share of exit packages downloaded before link expiry; number of regenerations | To be observed from V1 |
| Receivables | Share of unpaid balances settled within 12 months of closure (with and without group transfer — V2+ option) | Improvement versus the situation without a handed-over statement |

---

## 11. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Fate of the unpaid-balance transfer to the destination (FR-TRA-10). | **Resolved — D2** (see `prd/cross-cutting/42-review-arbitrations.md` §2). Decided by the founder (D2): ZSchool does not transfer the receivable in V1 — it stays with the origin school (RG-12, C-10), aligned with FR-FIN-24 (`prd/modules/16-finance-billing-collections.md`) with a cross-reference in both traceability tables. Real transfer of unpaid balances between two sites of the same group becomes a V2+ option (a capability drawn from the PowerSchool benchmark, `prd/research/01-market-competition.md` §5, not mentioned in the founding document's §12; a founding-document update to raise in review). |
| OQ-02 | Default duration of the secure link for the non-ZSchool exit package (FR-TRA-09). | DEC-32 requires "time-limited" without a value; working assumption: 30 days, configurable per school, with regeneration on the legal tutor's request; to be decided in review (a trade-off between the real turnaround of non-platform schools and exposure risk). Open (V1). |
| OQ-05 | Expiry deadline for a validated file with no activation (FR-TRA-02): 30 configurable days (ARB-22). Value to be confirmed with the pilots based on real mid-year activation turnaround. | **Resolved — ARB-22** (default value set; pilot confirmation without blocking). |
| OQ-03 | Exact scope of the "explicit sharing" of disciplinary data (FR-TRA-03). | RG-31 makes disciplinary data subject to explicit sharing, while DEC-08 declares it non-portable by default and RG-29 forbids sharing ongoing disciplinary proceedings. Working assumption: the opt-in block only covers a synthesized, closed disciplinary summary (no detailed incidents, no ongoing proceedings); to be decided in review. |
| OQ-04 | Founding-document update on the Massar transfer procedure. | Founding-document/research divergence recorded: PROJECT.md §2.6 describes "transfer request, validation by the provincial education office"; research clarifies that the request can be filed by the tutor from their Massar parent portal (requests section) with documents, and that a recent circular has removed restrictions on transfers from private to public schools (`prd/research/04-pedagogy-massar-calendar.md`; `prd/research/00-baseline-corrections.md`, note 11). No design impact: TRA stays outside the channel (reference field plus document); the §2.6 update is to be raised in the founding-document review. |

---

## 12. Traceability

| Founding-document ID | Coverage in this chapter |
|---|---|
| PROJECT.md §7.9 | §1, FR-TRA-01 to FR-TRA-13, §5, §6 |
| PROJECT.md §6.3 (state machine) | FR-TRA-06 (ACTIVE-or-SUSPENDED → TRANSFERRED transitions on activation; departure at the following school year's start closed COMPLETED), FR-TRA-09 (WITHDRAWN closure); ARB-03 |
| PROJECT.md §6.9 | FR-TRA-03, FR-TRA-04, FR-TRA-07, FR-TRA-09 |
| PROJECT.md §7.12 | FR-TRA-08 (transfer log with Massar references) |
| PROJECT.md §9 | FR-TRA-04 (logged consents), §6 (data) |
| PROJECT.md §12 | "Version" column of the FRs; §1.1 (version table) |
| RG-04 | FR-TRA-06 (no new identity) |
| RG-08 | FR-TRA-06 (only one ACTIVE enrollment per year) |
| RG-10 | FR-TRA-02 (files never deleted), FR-TRA-06 (closure with reason and date), FR-TRA-09 (WITHDRAWN withdrawal) |
| RG-12 | FR-TRA-05 (account statement), FR-TRA-06, FR-TRA-10 (receivable kept at the origin; cross-site transfer as a V2+ option) |
| C-10 | FR-TRA-10 (the receivable stays with the origin and never blocks the departure, with FR-TRA-05) |
| RG-09 | FR-TRA-06 (year-end decision kept for a departure at the following school year's start, ARB-03c) |
| RG-14b | FR-TRA-01 (initiators and the tutor's signature), FR-TRA-03, FR-TRA-05 (required signatory); §2, §5; ARB-22 |
| RG-16 | §2 (conflict arbitration), §5 |
| RG-23 | FR-TRA-01 (minimal destination directory; carried by FR-CAR-14 of `prd/modules/19-teacher-career-network.md`, MVP) |
| RG-28 | FR-TRA-04, FR-TRA-09 (permanent access to official documents) |
| RG-29 | FR-TRA-03 (internal data excluded); OQ-03 |
| RG-30 | FR-TRA-01, FR-TRA-03, FR-TRA-04, FR-TRA-07 (no automatic access) |
| RG-31 | FR-TRA-03, FR-TRA-07, FR-TRA-09 (default transfer profile) |
| RG-32 | FR-TRA-11 (read-only, 60-day grace period) |
| RG-38 | FR-TRA-04, FR-TRA-07, FR-TRA-13 (logging of views and entries) |
| DEC-08 | FR-TRA-03 (health never, discipline bounded) |
| DEC-16 | §5 (controller/processor roles for consent) |
| DEC-20 | FR-TRA-03, ECR-TRA-07 (adult student decides the sharing) |
| DEC-21 | FR-TRA-06 (only one active enrollment per year) |
| DEC-24 | FR-TRA-05, FR-TRA-09, ECR-TRA-06 (no blocking of documents for unpaid balances) |
| DEC-30 | FR-TRA-05, FR-TRA-09 (seal, timestamp, QR code); §8 (INT-SIG) |
| DEC-22 | FR-TRA-13 (log kept 5 years); §9 |
| DEC-32 | FR-TRA-09 (exit package: PDF MVP, secure link and QR V1) |
| DEC-36 | FR-TRA-12 (WhatsApp, push channels in V1) |
| G-08 | FR-TRA-01, FR-TRA-08; §5 |
| H-04 | FR-TRA-08; §1.2, §5, §8 (no Massar API) |
| `prd/03-domain-data-model.md` (INV-05, INV-08, INV-18, INV-22 to INV-25, INV-33, INV-39, INV-43) | FR-TRA-03 to FR-TRA-07, FR-TRA-10, FR-TRA-11, FR-TRA-13 |
| `prd/journeys/00-journey-map.md` (PC-09) | §3 |
| `prd/02-actors-personas.md` (BES-PAR-01, BES-PAR-04, BES-DIR-02) | §2 |
| `prd/research/01-market-competition.md` §5 | FR-TRA-10; OQ-01 |
| `prd/research/04-pedagogy-massar-calendar.md` | FR-TRA-08; §5; OQ-04 |
| `prd/research/00-baseline-corrections.md` (notes 2 and 11) | §5 (Law 59.21, Massar procedure); OQ-04 |
| `prd/modules/16-finance-billing-collections.md` (FR-FIN-03, FR-FIN-24) | FR-TRA-05, FR-TRA-06, FR-TRA-10 (statement handed to the financial guardian from MVP, transfer-month pro-rata, receivable kept at the origin, no automatic transfer; cross-reference — arbitration D2, ARB-20) |
| `prd/modules/11-admissions-enrollment-reenrollment.md` (FR-INS-21, FR-INS-26) | FR-TRA-03, FR-TRA-06 (rollover and departure at the following school year's start; declared prior history for non-ZSchool arrivals) |
| `prd/cross-cutting/42-review-arbitrations.md` | ARB-03 (§1, FR-TRA-06, §6); ARB-19 (FR-TRA-09); ARB-20 (FR-TRA-05, FR-TRA-06, FR-TRA-09, FR-TRA-10); ARB-22 (§1, §2, FR-TRA-01, FR-TRA-02, FR-TRA-05, FR-TRA-06, FR-TRA-12, §6, §7); ARB-25j (FR-TRA-04, FR-TRA-07, FR-TRA-11, FR-TRA-13) |
