# PRD ZSchool — Journey 02: Fatima, Primary School Secretary-Cashier

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09; supersedes 0.2 — revised 09/09/2026) |
| Date | 2026-09-09 |
| Status | PRD draft — under review; arbitrations ARB-01 to ARB-26 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §5.2 (persona Fatima), §2.10–2.11 (usage, operational realities), §6.2–6.4 (identity, enrollment, guardians), §7.2 (admissions and enrollment), §7.6 (documents and certificates), §7.7 (finance), §7.8 (communication), §8 (roles), §10, §12; decisions DEC-03, DEC-04, DEC-10, DEC-11, DEC-12, DEC-24, DEC-30, DEC-31, DEC-36; `prd/research/00-baseline-corrections.md` (discrepancies 2, 14, 16), `prd/research/03-payments-communications.md` |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md` (BES-SEC-01 to BES-SEC-08), `prd/03-domain-data-model.md` (entities, INV-01 to INV-43), `prd/journeys/00-journey-map.md` (PC-01, PC-02, PC-07, PC-09, PC-10, PC-11), `prd/modules/11-admissions-enrollment-reenrollment.md` (module INS), `prd/modules/15-documents-certificates.md` (module DOC), `prd/modules/16-finance-billing-collections.md` (module FIN), `prd/modules/17-communication-notifications.md` (module COM), `prd/cross-cutting/32-non-functional-requirements.md` (NFR), `prd/cross-cutting/35-external-integrations.md` (integrations) |

---

## 1. Purpose and scope

This file describes Fatima's daily journeys (§5.2): secretary-cashier at a 350-student primary school in Salé, she enrolls, collects payments, prints certificates, and answers the phone, on an old PC and her mobile phone. Steps are identified `PJ-SEC-NN` (a counter local to this file, conventions §2) and link to the critical journeys `PC-…` in the map `prd/journeys/00-journey-map.md`.

In scope:

1. Enrolling a new student at the front desk (PJ-SEC-01).
2. Collecting a monthly payment in cash with a cash session (PJ-SEC-02).
3. Collecting start-of-year cheques and tracking bounces (PJ-SEC-03).
4. Issuing and delivering certificates and attestations (PJ-SEC-04).
5. Updating a student's file: missing documents and identity correction (PJ-SEC-05).
6. Phone reminder for an unpaid fee with an account statement (PJ-SEC-06).
7. Responding to a parent: announcements, summons, messages (PJ-SEC-07).
8. Re-enrollment and year-end rollover, secretariat side (PJ-SEC-08).
9. Voiding or correcting a payment and a receipt (PJ-SEC-09).
10. Arrival of a student from a school outside ZSchool (PJ-SEC-10).
11. Mid-year resumption: importing payment schedules, cheques, and grades from a semester in progress (PJ-SEC-11).

Out of scope (handled elsewhere): the admission decision, tests, and waitlist (owned by leadership, PJ-DIR-08 of `prd/journeys/01-school-group-director.md`, V1), a parent claiming their account (`prd/journeys/05-multi-school-parent.md`, PC-04), taking roll call (`prd/journeys/03-head-supervisor.md`, PC-05), grade entry (`prd/journeys/04-part-time-teacher.md`, PC-06), online payment by the parent (`prd/journeys/05-multi-school-parent.md`, PC-08), the full transfer procedure (PC-09, owned by leadership), and school configuration (PC-03, owned by leadership; Fatima only reviews imports). Functional requirements and `ECR-…` screens are carried by the module chapters `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/15-documents-certificates.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`; this file describes the journeys without duplicating the requirement templates.

---

## 2. Usage context and interface constraints

All the journeys below run within the persona's hardware and time constraints:

| Constraint | Product consequence | References |
|---|---|---|
| Old PC | Lightweight web interface, responsive pages with no unnecessary effects, acceptable performance on modest hardware | §5.2, §10; BES-SEC-08; domains NFR-MOB and NFR-PERF, `prd/cross-cutting/32-non-functional-requirements.md` |
| Phone as a backup | Every journey has a "small screen" variant: short paths, large touch targets, an adapted keyboard (numeric for cash handling), no dense tables on mobile | §5.2, §10; BES-SEC-08 |
| Sometimes unstable connection | Resume after an outage with no lost entry: front-desk forms keep data locally and resync; no receipt or document ever gets lost once confirmed by the server | §2.10; BES-SEC-08; domain NFR-OFF |
| Busy front desk, queues | One parent = one pass: search in one action, the main action reachable from the record, receipt handed over and sent without leaving the screen | §2.11; BES-SEC-01, BES-SEC-02 |
| Minimal typing | Search by the parent's phone number (primary contact identifier) or by Massar code before any civil-status entry; fields pre-filled from the fee schedule and the current school year; pick lists rather than free text | DEC-11; §7.2 |
| QR and document capture | Photographing or uploading documents from the PC or mobile from MVP for sensitive supporting documents (rulings, ID documents, hardened encryption); a complete digital file with tooled completeness checking in V1; a verification QR code on documents (V1); a Fatourati receivable QR code shown at the front desk to offer the parent online payment (V1, PC-08) | §7.6, DEC-30, DEC-31; ARB-13; `prd/research/03-payments-communications.md` |
| Bilingualism | Names in both Arabic and French scripts mandatory before generating a document; FR/AR interface with full RTL; bilingual documents | §2.9, DEC-10 |
| Traceability | Every write (payment, certificate, correction, message) is historized with author, context, and timestamp in MVP (record-level historization, D4); an immutable, exportable audit log in V1 | RG-38; INV-33; ARB-25j |

Role: "Secretariat" (enrollment, files, documents, communication) and "Accounting/Cash" (finance) as defined in §8.1; Fatima frequently combines both in small schools, with the §8.3 matrix giving her read access to the record and finance, and write access to the identity documents in the file. Effective permissions come from editable template roles (RG-37) carried by `prd/cross-cutting/30-roles-permissions-matrix.md`.

---

## 3. Journey overview

| ID | Journey | Typical trigger | Map journey | Modules | Needs covered | Core version |
|---|---|---|---|---|---|---|
| PJ-SEC-01 | Enrolling a new student at the front desk | A parent at the front desk with documents | PC-01 (variant PC-01a) | INS, DOC, FIN, COM | BES-SEC-01, BES-SEC-08 | MVP (core, parent contract, sensitive documents uploaded, sibling discount); V1 (application file, advanced signature) |
| PJ-SEC-02 | Collecting a monthly payment in cash | A parent settling at the front desk | PC-07 | FIN, COM | BES-SEC-02 | MVP (payment, numbered receipt, family payment); V1 (cash session, discrepancy, cash log) |
| PJ-SEC-03 | Collecting start-of-year cheques | Cheques handed over at the start of the year | PC-07 | FIN, COM | BES-SEC-02 | MVP (ARB-01) |
| PJ-SEC-04 | Issuing and delivering attestations and certificates | A request from the parent or tutor | PC-07, PC-09, PC-10 | DOC, FIN | BES-SEC-03, BES-SEC-04 | MVP (enrollment certificate, receipt, student record, leaving certificate, simple numbering); V1 (full catalog, advanced seal, QR, self-service) |
| PJ-SEC-05 | Updating a student's file | A missing document, a civil-status correction | PC-01 (continued) | INS, DOC | BES-SEC-06 | MVP (identity correction, completeness list, encrypted document upload); V1 (complete digital file) |
| PJ-SEC-06 | Phone reminder for an unpaid fee | A late installment on the arrears table | PC-07 | FIN, COM | BES-SEC-05 | MVP (SMS reminder, trace); V1 (WhatsApp, statement sent in one action) |
| PJ-SEC-07 | Responding to a parent: announcements, summons | A parent at the front desk or on the phone | PC-11 | COM | BES-SEC-05 | MVP (announcements, messages, SMS); V1 (WhatsApp, summons with read tracking) |
| PJ-SEC-08 | Re-enrollment and rollover, secretariat side | The spring campaign, year end | PC-02 | INS, FIN, COM | BES-SEC-07 | MVP wave 2 (pre-filled forms, deposit, rollover, assignment); V1 (automated campaign reminders) |
| PJ-SEC-09 | Voiding or correcting a payment and a receipt | An amount, method, or student error after issuance | PC-07 | FIN | BES-SEC-02 | MVP (ARB-20b) |
| PJ-SEC-10 | Arrival of a student from a school outside ZSchool | Enrollment with a paper leaving certificate | PC-01, PC-09 | INS, DOC | BES-SEC-01 | MVP (ARB-22) |
| PJ-SEC-11 | Mid-year resumption: payment schedules, cheques, grades from a semester in progress | A school joining ZSchool after the start of the year | PC-03 | ADM, INS, FIN, EVA | BES-SEC-02, BES-SEC-08 | MVP (ARB-02) |

---

## 4. Detailed journeys

### PJ-SEC-01 — Enrolling a new student at the front desk

| Attribute | Value |
|---|---|
| Objective | Turn a parent at the front desk into a complete enrollment — identity, guardians, documents, parent contract, payment schedule, first payment, enrollment documents — in a single pass and with no re-entry |
| Actors | Fatima (secretariat, entry and payment); parent or legal tutor (submission, acceptances, signature — the legal tutor is the required signer, RG-14b); leadership (admission decision, CANDIDATE state); ZSchool support or an authorized role (merging duplicates, RG-06) |
| Map journey | PC-01 (owned by 02 SEC) |
| Modules involved | INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), DOC (`prd/modules/15-documents-certificates.md`), FIN (`prd/modules/16-finance-billing-collections.md`), COM (`prd/modules/17-communication-notifications.md`) |
| Needs covered | BES-SEC-01, BES-SEC-08; downstream BES-PAR-01, BES-GAR-02, BES-GAR-03 |
| Data | `Person`, `StudentProfile`, `ParentStudentRelationship`, `Enrollment`, `FeeSchedule`, `Installment`, `Receipt`, `StudentDocument`, `Certificate` (`prd/03-domain-data-model.md`) |
| Version | MVP core (simplified state machine, starting at PRE-ENROLLED; parent contract by electronic acceptance, ARB-01; sensitive documents uploaded and encrypted, ARB-13; sibling discount, ARB-01; guardian matching by mobile number, ARB-09); V1 for the tooled CANDIDATE state (PJ-DIR-08), tooled completeness checking, and advanced electronic contract signature |
| Baseline | (→ RG-04, RG-05, RG-07, RG-08, RG-10, RG-12b, RG-13, RG-14, RG-14b, RG-15, RG-16, DEC-03, DEC-04, DEC-10, DEC-11, DEC-21, G-07, INV-01, INV-02, INV-05, INV-09, INV-11, INV-13, INV-40) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-01.1 | A parent at the front desk; a search precedes any new file | Fatima (secretariat) | From the "Front desk" screen, search for the parent by phone number (primary contact identifier, DEC-11) or the student by Massar code; a guardian whose mobile number is already known to the platform is offered for linking, never recreated (strong guardian matching, ARB-09); a child declared by the parent from their own account (a provisional profile, path 2 of baseline §6.2, FR-INS-25) is offered for linking; a linking suggestion is made if a student profile already exists (strong matching by Massar code, INV-01); failing that, a weak match (first name, last name, date of birth, a guardian's phone number) triggers a probable-duplicate alert with no automatic linking (INV-02, event `ProbableDuplicateDetected`) | Existing file found and opened, or creation started with no silent duplicate | MVP |
| PJ-SEC-01.2 | No student profile exists after matching | Fatima (secretariat) | Entering the civil status in both Arabic and French scripts (DEC-10), date and place of birth, sex; creating a "provisional" student profile; sending an invitation code to guardians to claim the account (§6.2, PC-04); Massar-code search protected against enumeration (§9) | Provisional student profile created; claim invitations sent to guardians | MVP |
| PJ-SEC-01.3 | Provisional student profile created | Fatima (secretariat), parent or tutor (providing information) | A form defaulting to father and mother, each with their own account (RG-12b, INV-13); two guardians sharing a single mobile number: the second receives a generated login identifier, with the household number declared as a shared contact (ARB-07); a foreign number accepted in international format (ARB-07); qualities entered separately: legal tutor (*wilaya*) and holder of custody (*hadana*) recorded separately (RG-14b, INV-11), financially responsible parent (who may be a third party who is not a legal guardian: a "third-party payer" relationship type with no school rights, RG-13, ARB-14), an emergency contact, people authorized to pick up the child (context attributes, RG-15); legal defaults (father as tutor, mother as custodian when separation is declared) apply with no document required; any configuration that deviates (mother as tutor, a court-appointed tutor, a restriction) requires a supporting document uploaded and encrypted in the file (ARB-13); conflicting requests are flagged to leadership, the sole arbiter (RG-16) | Blocking check satisfied: at least one active legal guardian and one financially responsible parent (RG-13, INV-09) | MVP |
| PJ-SEC-01.4 | Guardians recorded | Fatima (secretariat), parent (providing documents) | A completeness list per school type and cycle: birth certificate, photographs, vaccination record, the tutor's ID document (adults' national ID is not collected in MVP until the F112 authorization is obtained, ARB-25a; adult identity relies on first name, last name, date of birth, and mobile number), any court rulings (§7.6, §9); from MVP, photographing or uploading sensitive documents from the PC or phone, strongly encrypted and linked to the uploading tenant (ARB-13); in V1, a complete digital file with tooled completeness checking (BES-SEC-06) | Missing documents tracked without blocking pre-enrollment (continued in PJ-SEC-05) | MVP (encrypted document upload); V1 (complete tooled file) |
| PJ-SEC-01.5 | Identity and guardians in place | Fatima (secretariat) | Choosing the current school year, level, track, arrangement (day student, boarding lunch), the enrollment's effective date (attendance and exports counted from this date, ARB-24c), a suggested class with available places (capacity checked, an override on leadership approval, ARB-24b); for a student coming from another school, entering their prior history (PJ-SEC-10) | Blocking check satisfied: at most one ACTIVE or SUSPENDED enrollment for the (student, school year) pair platform-wide (RG-08, DEC-21, INV-05) | MVP |
| PJ-SEC-01.6 | Academic choices made | System (calculation), Fatima (validation) | Automatic application of the year and level's fee schedule (enrollment fee, tuition billed over ten months from September to June, options) — the fee schedule serves as the published fee list required under article 49 of Law 59.21 (`prd/research/02-regulatory-data.md`); sibling discount applied automatically (FR-FIN-04, MVP — ARB-01); pro-ration for a mid-year arrival: a part-month owed in full by default, an optional daily pro-rata (ARB-20c); payment schedule created | Payment schedule created from the fee schedule with no re-entry | MVP |
| PJ-SEC-01.7 | Payment schedule created | Legal tutor (acceptances), a separate financially responsible parent (countersignature), Fatima (generation, archiving) | Acceptance of the internal rules and the Law 09.08 notices by the legal tutor (§7.2); generating the annual written school-parent contract from the fee schedule (FR-FIN-02, MVP — ARB-01; Law 59.21: a mandatory contract, a copy given to parents, kept on file and available to AREF; no fee change during the year on an active enrollment — INV-40); countersignature by the financially responsible parent when different from the tutor (payment-schedule enforceability, ARB-20h); in MVP, tracked electronic acceptance at the front desk (a box checked by the present tutor with an OTP to their mobile, or on account claiming) and archived in the file; in V1, an advanced-level electronic signature with identification proof, a timestamp, and a verification QR code (DEC-30; providers accredited per service — signature, seal, timestamp — are listed in `prd/research/02-regulatory-data.md`: Barid eSign, DamaneSign, AfricTRUST) | Acceptances and contract archived in the file, enforceable | MVP (electronic acceptance); V1 (advanced signature, DEC-30) |
| PJ-SEC-01.8 | Contract and acceptances recorded | Fatima (payment), System (state transitions) | In MVP, the journey starts at PRE-ENROLLED (deposit collected, PJ-SEC-02, MVP core) then moves to ACTIVE once the file is complete and the initial payment collected (RG-13); an abandoned pre-enrollment moves to the terminal state CANCELLED, with the history kept (ARB-03b); in V1, the CANDIDATE state covers the admission file with a leadership decision (§6.3, PC-01b, PJ-DIR-08); immediate issuance produces the enrollment documents: enrollment certificate, receipt, bilingual student record, with simple sequential numbering (FR-INS-17; §7.2; the map's OQ-02 resolved) | Enrollment at the target state (PRE-ENROLLED then ACTIVE in MVP); enrollment documents issued immediately | MVP (core, PRE-ENROLLED to ACTIVE, CANCELLED); V1 (tooled CANDIDATE state) |
| PJ-SEC-01.9 | Enrollment recorded | System (sending), Fatima (triggering) | Sending the invitation code by SMS to the registered numbers; the parent claims their account from home with a knowledge challenge (the child's date of birth entered, never displayed, ARB-08); on a wrong number, Fatima revokes the claim and reissues the invitation (PC-04) | Every guardian invited on their own number; no identifier printed on paper; a revocable claim | MVP |

**Mobile and small-screen points.** A single "New enrollment" button; a single parent/student search by phone or Massar code; required fields first, with deferred completion allowed (enrollment can be finalized later without recreating the file); photographing documents with the phone; the deposit amount pre-calculated; a Fatourati receivable QR code shown on screen to offer the parent payment of the deposit from their banking app (V1, PC-08, DEC-31).

**Acceptance criteria.**

```gherkin
Feature: Enrolling a new student at the front desk
  Scenario: Complete enrollment in a single pass (MVP)
    Given an active school for the 2026-2027 year with a published fee schedule
    And a parent at the front desk carrying their son's birth certificate and vaccination record
    When the secretary creates the enrollment: identity in both scripts, father and mother as legal guardians, father as financially responsible, level 2AP, a class with places, a ten-month payment schedule, acceptances recorded, deposit collected
    Then the enrollment moves to the ACTIVE state
    And a Law 59.21 parent contract is generated from the fee schedule, electronically accepted by the tutor, archived in the file, and a copy given to the parents
    And the enrollment certificate, a numbered receipt, and a bilingual student record are produced immediately
    And each guardian receives an invitation code by SMS on their own number

  Scenario: A guardian already known on the platform (MVP)
    Given a father with a ZSchool account for a child enrolled at another school
    When the secretary enters his mobile number for the enrollment of his second child
    Then the system offers linking to the existing account and creates no new guardian
    And the father sees both his children from a single account after enrollment

  Scenario: Strong match by Massar code (MVP)
    Given a student profile existing on the platform carrying Massar code "X123456789"
    When the secretary enters this code during a new enrollment
    Then the system offers linking to the existing identity instead of creating a duplicate
    And no linking happens without the secretary's confirmation

  Scenario: Incomplete guardians rejected (MVP)
    Given an enrollment entry with no active legal guardian
    When the secretary tries to move the enrollment to the ACTIVE state
    Then the system refuses the transition and shows the missing item (legal guardian, financially responsible parent)
    And the enrollment stays at the PRE-ENROLLED state with the file and documents already entered kept
```

### PJ-SEC-02 — Collecting a monthly payment in cash

| Attribute | Value |
|---|---|
| Objective | Collect a monthly payment in cash at the front desk in a few steps: receipt handed over and sent, an accurate cash drawer, tracked entries |
| Actors | Fatima (cash); the financially responsible parent (payment); leadership (reviewing the cash log, approving discrepancies) |
| Map journey | PC-07 (owned by 02 SEC) |
| Modules involved | FIN (`prd/modules/16-finance-billing-collections.md`), COM (`prd/modules/17-communication-notifications.md`) |
| Needs covered | BES-SEC-02, BES-SEC-08 |
| Data | `CashSession`, `Payment`, `Receipt`, `Installment`, `Invoice`, `FinancialAccount`, `Dunning` (`prd/03-domain-data-model.md`) |
| Version | Payment, sequentially numbered and tamper-proof receipts (FR-FIN-07 for receipts, MVP — ARB-01), a family payment split across several children with a single receipt (ARB-20a), and sending to the parent from MVP (§12 core finance); a cash session, discrepancy, and cash log in V1 (§12 full finance, `CashSession`) |
| Baseline | (→ RG-12, RG-13, RG-38, §7.7, DEC-12, DEC-24, G-15, INV-08, INV-33, INV-39, INV-40) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-02.1 | First cash transaction of the day | Fatima (cash) | On the first cash transaction of the day, the platform requires an open cash session (`CashSession` entity: opening, closing, discrepancy, cash payments) with a cash-float amount entered; the prompt to open is offered in one step from the payment screen; in MVP, without a formal session, cash payments are logged like other methods and reconciled manually | Cash session open (V1); payment possible | V1 (cash session); MVP (logging with no session) |
| PJ-SEC-02.2 | Cash session open (V1) or MVP logging active | Fatima (cash) | Searching by the parent's phone number, name, or Massar code; the financial record shows due installments, the next installment, the balance, and any arrears alert (never a block, DEC-24, INV-39) | An up-to-date financial record in view, with no blocking for unpaid fees | MVP |
| PJ-SEC-02.3 | Financial record shown | Fatima (cash) | The amount due pre-filled; entering the amount handed over by the parent, the change due calculated and shown; allocation to installments suggested automatically (oldest due first) and stays adjustable; a parent paying for several children at once: a single payment split across the siblings' financial accounts, a single receipt listing children and installments (ARB-20a); a partial payment creates a partially allocated payment, with the remaining balance staying visible; a third-party payer (grandparent, employer) pays on the "third-party payer" relationship (ARB-14) | Payment entered and allocated, partial or family, with no loss of visibility | MVP |
| PJ-SEC-02.4 | Payment entered | Fatima (confirmation), System (entries, receipt) | On confirmation, the payment is recorded, the `PaymentReceived` event is produced, the enrollment's and the financially responsible parent's balance is updated, and a sequentially numbered, tamper-proof receipt is issued (FR-FIN-07, MVP): printed at the front desk and sent to the parent in their language on their channel (§7.7; in MVP, in-app and SMS, with WhatsApp reserved for attendance notifications, arbitration D1; general WhatsApp in V1, DEC-12, DEC-36, ARB-21); an error found after issuance is corrected only via a tracked reversal (PJ-SEC-09) | A numbered receipt printed and sent; balances up to date | MVP (payment, receipt, in-app/SMS sending); V1 (WhatsApp "utility") |
| PJ-SEC-02.5 | Cash payments for the session | System (log) | Every cash payment feeds the session's cash log in real time (V1); log export in a format compatible with accounting software (V1, §7.7) | Cash log up to date and exportable | V1 |
| PJ-SEC-02.6 | End of day | Fatima (counting), System (calculation, notification) | Entering the counted cash total; the system computes the discrepancy (expected = cash float + cash payments, vs. counted), requires a reason if the discrepancy is non-zero, tracks it all, and notifies leadership per the approval circuit (threshold: open question OQ-02) | Discrepancy calculated, explained, and tracked; leadership notified | V1 |

**Mobile and small-screen points.** Automatic numeric keypad; the amount due and the change shown in large type; a single "Collect and send the receipt" button; no intermediate screen between entering the amount and the receipt; resuming after an outage: a payment confirmed by the server always produces its receipt, an unconfirmed operation is resumed with no double charge.

**Acceptance criteria.**

```gherkin
Feature: Collecting a monthly payment in cash
  Scenario: Standard payment with a receipt (MVP)
    Given an ACTIVE enrollment whose October installment of 800 MAD is due
    When the secretary enters a cash payment of 1,000 MAD
    Then the system allocates 800 MAD to the October installment, which moves to the paid state
    And the 200 MAD surplus is allocated per the secretary's choice and stays visible on the balance
    And a sequentially numbered receipt is printed and sent to the parent in their language
    And the payment is historized with author, timestamp, and amount

  Scenario: A family payment for two children with a single receipt (MVP)
    Given two children of the same mother enrolled at the school, each with an October installment of 800 MAD due
    When the mother pays 1,600 MAD in cash in one transaction
    Then the system splits 800 MAD onto each child's financial account
    And a single numbered receipt lists both children and both installments covered

  Scenario: Standard payment within a cash session (V1)
    Given an open cash session with a 200 MAD cash float
    When the secretary collects 800 MAD in cash
    Then the session's cash log records the operation with author, timestamp, and amount

  Scenario: Cash payment outside a cash session refused (V1)
    Given no cash session open for the day
    When the secretary tries a cash payment
    Then the system offers to open the session in one step and records no cash payment before it opens
    And cheque or transfer payments outside a session stay possible per their own cycle

  Scenario: A cash discrepancy tracked at closing (V1)
    Given a cash session with 1,500 MAD in cash payments and a 200 MAD float
    When the secretary closes the session, declaring 1,680 MAD counted
    Then the system computes a discrepancy of -20 MAD
    And requires a reason, tracking the discrepancy with author and timestamp
    And notifies leadership per the configured circuit
```

### PJ-SEC-03 — Collecting start-of-year cheques and tracking bounces

| Attribute | Value |
|---|---|
| Objective | Take in, in one pass, cheques covering several monthly payments, schedule their deposit at each due date, and track the lifecycle through to clearing or a bounce, with no manual log |
| Actors | Fatima (entry, bank deposits, tracking); the financially responsible parent (handing over cheques); leadership (viewing pending cheques and bounces) |
| Map journey | PC-07 (seasonality: "cheques handed over at the start of the year with due dates") |
| Modules involved | FIN (`prd/modules/16-finance-billing-collections.md`), COM (`prd/modules/17-communication-notifications.md`) |
| Needs covered | BES-SEC-02 |
| Data | `Payment` (cheque method: due date, bank deposit, bounce), `Installment`, `Receipt`, `Dunning`, `FinancialAccount` |
| Version | **MVP** (ARB-01: FR-FIN-12 retagged MVP wave 1, since the cheque is the dominant method per baseline §2.8 and BES-SEC-02 is MVP; §12 had placed cheques in V1) |
| Baseline | (→ §7.7, §2.8, RG-12, DEC-24, INV-08, INV-40; ARB-01; market context: `prd/research/03-payments-communications.md`) |

**Context.** A widespread practice: at the start of the year, the parent hands over a series of post-dated cheques covering several monthly payments (§2.8). The lifecycle to model follows the research: handed over, deposited, cleared, bounced, resolved, litigation; the cheque's legal framework (Law 71-24: decriminalizing the first incident, a one-month resolution period renewable once, Bank Al-Maghrib's central incident file) is documented in `prd/research/03-payments-communications.md`.

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-03.1 | A parent handing over a series of cheques at the start of the year | Fatima (entry) | From the financial record, the "Cheque deposit" screen: entering each cheque in the series (amount, bank, number, due date, holder), assigning each cheque to one or more future installments; a consistency check (increasing dates, a sum covering the chosen installments) | Cheques recorded as a series and assigned to installments | MVP |
| PJ-SEC-03.2 | Cheques entered | Fatima (issuance), System (installment protection) | Issuing a receipt listing the cheques handed over with their target installments, handed over and sent to the parent; the covered installments move to "covered by cheque" and trigger no reminder before their date | An overall receipt handed over and sent; covered installments protected from any early reminder | MVP |
| PJ-SEC-03.3 | Cheques in hand | Fatima (tracking), System (reminders, linking credits) | A per-school tracking table: cheques to deposit in the coming days (a configurable D-3 reminder), cheques deposited, cheques cleared (an installment moves to paid on receiving the credit, event `PaymentReceived`) | Deposits scheduled; credits linked to installments | MVP |
| PJ-SEC-03.4 | A bank bounce notice | Fatima (resolution), Leadership (litigation) | On a bounce notice (insufficient funds or missing signature), the cheque moves to the BOUNCED state with a reason; the covered installments become unpaid again; the `InstallmentOverdue` event is produced and the graduated reminder cycle applies; Fatima contacts the parent for resolution (funds, a new cheque, cash), which moves the cheque to RESOLVED with the new payment's reference; failing resolution within the legal period, a move to LITIGATION on leadership's decision | Bounces handled: resolution tracked or litigation decided | MVP |
| PJ-SEC-03.5 | Status transitions made | System (traceability) | Every cheque status transition is dated and attributed (RG-38); the table feeds leadership's aged balance and arrears view | Complete history; aged balance and arrears view fed | MVP |

**Mobile and small-screen points.** Series entry with the holder and bank duplicated from one cheque to the next; photographing the front of cheques for visual reconciliation (a payment attachment, with no automatic recognition engaged); a "today's cheques" view at the top of the screen.

**Acceptance criteria.**

```gherkin
Feature: Collecting start-of-year cheques
  Scenario: Handing over three cheques covering three monthly payments (MVP)
    Given an ACTIVE enrollment with September, October, and November installments due
    When the parent hands over three cheques of 800 MAD dated September 5, October 5, and November 5
    And the secretary records the series with bank, numbers, and dates
    Then each cheque is linked to its installment and moves to the HANDED-OVER state
    And an overall receipt listing the three cheques is printed and sent to the parent
    And no reminder is triggered on the covered installments before their date

  Scenario: A cheque bounces and is resolved (MVP)
    Given a cheque deposited at the bank covering the October installment
    When the bank notifies the bounce
    Then the cheque moves to the BOUNCED state with a reason and date
    And the October installment becomes unpaid again and triggers the graduated reminder cycle
    And when the secretary records a new payment for the same installment
    Then the cheque moves to the RESOLVED state with the new payment's reference
    And the full history of both operations stays viewable on the financial record
```

### PJ-SEC-04 — Issuing and delivering certificates and attestations

| Attribute | Value |
|---|---|
| Objective | Produce a numbered bilingual official document at the front desk in seconds (sealed and QR-verifiable in V1) — regardless of the file's balance — and leave an enforceable trace. Single term: "enrollment certificate" (ARB-20g). |
| Actors | Fatima (issuance, handover); a parent, legal tutor, or custodian (request, pickup); leadership (templates, signatories, configuring self-service documents); a third-party verifier (checking the QR code) |
| Map journey | PC-07 (arrears alert), PC-09 (leaving certificate), PC-10 (parent self-service) |
| Modules involved | DOC (`prd/modules/15-documents-certificates.md`), FIN (`prd/modules/16-finance-billing-collections.md`) |
| Needs covered | BES-SEC-03, BES-SEC-04 |
| Data | `Certificate`, `StudentDocument`, `Invoice`, `Installment`, `FinancialAccount` |
| Version | From MVP: enrollment certificate, receipt, student record, leaving certificate and PDF exit dossier, simple sequential numbering (FR-INS-17, FR-DOC-01; the map's OQ-02 resolved), bulk documents for insurance in MVP wave 2 (FR-DOC-15, ARB-01); the full catalog, advanced electronic seal, timestamp, QR, and self-service in V1 (§12, DEC-30, ARB-19); a qualified seal via an accredited provider in V2 (PC-10) |
| Baseline | (→ DEC-24, RG-14b, RG-16, RG-28, RG-33, §7.6, §7.7, INV-11, INV-39, G-16; Law 59.21: `prd/research/00-baseline-corrections.md` discrepancy 2; traceability of issuances: discrepancy 16) |

**Governing rule (non-negotiable).** ZSchool never blocks generating the enrollment certificate, the leaving certificate, report cards, or transcripts for unpaid fees (DEC-24, INV-39). Arrears show up only as an alert on the file and as an account statement given to the parent; only non-mandatory services (transport, canteen, activities) can be conditioned on payment. This is grounded in the ministry's position, the 2020 summary-proceedings rulings, and Law 59.21, which fines up to 10,000 DH for refusing to issue certificates and attestations when the contract is being honored (Official Gazette No. 7485 of 23/02/2026; `prd/research/02-regulatory-data.md`).

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-04.1 | A request at the front desk or a self-service request from the parent (PC-10, V1) | Fatima (issuance), Parent (request) | Finding the student and choosing the document type (enrollment certificate, attendance certificate, achievement certificate, leaving certificate, information sheet, an employer attestation — §7.6); any legal guardian and the holder of custody can request an enrollment certificate (ARB-20f); the parent can also request certain documents self-service from their account (PC-10, V1) | Request recorded with type, requester, and recipient | MVP (enrollment certificate, student record, leaving certificate); V1 (full catalog and self-service) |
| PJ-SEC-04.2 | Request recorded | System (checks), Fatima (processing) | Checking identity completeness (both scripts), showing the arrears alert if any — never blocking issuance; **enrollment certificate** and routine administrative documents: issued to any legal guardian or the holder of custody, with no account or tutor signature needed (RG-14b, the ministry's position, ARB-20f; OQ-04 resolved); **leaving certificate**: tied to the closing procedure (TRANSFERRED, WITHDRAWN, or COMPLETED status, PC-09) and **signed on request by the legal tutor or the adult student** (RG-14b, INV-11, ARB-20f) — the custodial mother may initiate the request, which then awaits the tutor's signature; in a conflict between guardians, the school requires a ruling or the King's prosecutor's opinion and attaches it to the file (RG-16) | Checks passed; signer and rights confirmed; arrears alert shown with no blocking on issuance | MVP |
| PJ-SEC-04.3 | Checks passed | System (generation) | Bilingual generation (Arabic and French) with simple sequential numbering per school from MVP (FR-INS-17); an advanced electronic school seal, timestamp, and verification QR code in V1 (DEC-30, ARB-19; V2: a qualified seal via a DGSSI-accredited provider); the issued document is immutable, archived in the file, viewable by the parent and student after departure (RG-28, INV-20, MVP) | A numbered, immutable, archived bilingual document; sealed and verifiable in V1 | MVP (simple numbering, immutability, permanent read access); V1 (advanced seal, timestamp, QR); V2 (DGSSI-qualified seal) |
| PJ-SEC-04.4 | Document issued | Fatima (handover), System (log) | Printed at the front desk or sent to the parent; on arrears, the system offers to give the account statement **only to the financially responsible parent** (FR-FIN-24, MVP — ARB-20e); when a student leaves, the account statement is given separately to the financially responsible parent and never included in the dossier given to another guardian (DEC-24, ARB-20e); every request and every issuance is historized in MVP (author, date, document type, recipient — D4, ARB-25j), a written register and an exportable audit log in V1 (discrepancy 16 in `prd/research/00-baseline-corrections.md`; OQ-03 resolved) | Document handed over or sent; an enforceable trace of the issuance | MVP (non-blocking, statement to the payer, historization); V1 (audit log) |

**Mobile and small-screen points.** An "Attestation" button directly on the front-desk record; document types in a short list with common labels; a single-column preview before printing; in V1, the QR code lets a third party verify the document with no contact with the school.

**Acceptance criteria.**

```gherkin
Feature: Issuing a certificate despite unpaid fees
  Scenario: Enrollment certificate issued with arrears shown (MVP)
    Given an ACTIVE enrollment with two unpaid installments totaling 1,600 MAD
    When the parent requests an enrollment certificate at the front desk
    Then the system shows the arrears alert and offers to give the account statement to the financially responsible parent
    And issuing the certificate is neither blocked nor delayed by the arrears
    And the bilingual document is numbered and dated
    And the request and the issuance are historized with author and timestamp

  Scenario: Enrollment certificate requested by the custodial mother (MVP)
    Given a student whose legal tutor is the father and whose mother holds custody
    When the mother requests an enrollment certificate at the front desk
    Then the document is issued with no account or tutor signature needed
    And no account statement is given to the mother, who is not the financially responsible parent

  Scenario: A leaving certificate initiated by the custodial mother (MVP)
    Given an enrollment being closed as TRANSFERRED whose legal tutor is the father
    When the mother who holds custody requests the leaving certificate
    Then the request is created under her name and awaits the legal tutor's signature
    And the certificate is issued after the father signs, signed by the school
    And no screen function makes issuance conditional on paying arrears

  Scenario: Authenticity verification by QR code (V1)
    Given a printed attestation carrying a verification QR code
    When a third party scans the QR code
    Then the public page confirms the document's authenticity without revealing other data from the file
```

### PJ-SEC-05 — Updating a student's file: missing documents and identity correction

| Attribute | Value |
|---|---|
| Objective | Keep the file complete and identity accurate: chasing missing documents, correcting civil status with a history and notifications to other schools |
| Actors | Fatima (reminders, receiving, corrections); the parent (providing documents, requesting a correction); other schools involved (recipients of correction notifications) |
| Map journey | PC-01 (file completeness) |
| Modules involved | INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), DOC (`prd/modules/15-documents-certificates.md`) |
| Needs covered | BES-SEC-06 |
| Data | `StudentDocument`, `Person`, `StudentProfile`, `ParentStudentRelationship`, events `IdentityCorrected`, `ProbableDuplicateDetected` |
| Version | Identity correction, a completeness list, and encrypted document upload from MVP (RG-07, INV-04, ARB-13); a complete digital file with tooled completeness checking in V1 (BES-SEC-06) |
| Baseline | (→ RG-05, RG-07, RG-10, RG-32, DEC-10, DEC-22, INV-01, INV-04, INV-13, INV-25) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-05.1 | A file with missing documents | Fatima (reminders, receiving), Parent (providing) | An "incomplete files" screen: for each student, missing documents by type; a reminder sent to the parent on their channel (a message template); on receipt, photographing or uploading the file, encrypted and linked to the tenant (MVP for sensitive documents and the child's ID documents, ARB-13), or simply checking off a document received in person, with date and author; tooled completeness checking per school type in V1 | Reminders sent; documents received and tracked with date and author | MVP (encrypted upload); V1 (complete tooled file) |
| PJ-SEC-05.2 | A correction needed (spelling, script, Massar code, photo, guardians) | Fatima (correction) | From the record, correcting civil status (spelling, Arabic or Latin script, date of birth), the Massar code (a platform-wide uniqueness check, INV-01), the photo, or guardians; any school with an active enrollment for the student may correct; the correction is historized (before/after, reason, author) and notified to other schools involved and to guardians (RG-07, INV-04, event `IdentityCorrected`) | Identity corrected, historized, and propagated with no duplicate | MVP |
| PJ-SEC-05.3 | Correction recorded | System (document consistency) | Documents issued afterward carry the new identity; documents already issued stay valid with their original version (official document immutability, RG-33); published report cards are never rewritten (INV-26) | Document consistency with no rewriting of the past | MVP |
| PJ-SEC-05.4 | Enrollment closed | Fatima (request), Leadership or support (an audited procedure) | Corrections are possible only during the grace period (default: 60 days), then only through an audited procedure (RG-32, INV-25); Fatima is directed to leadership or support depending on authorization | Post-closing corrections governed and audited | MVP |

**Mobile and small-screen points.** Direct photographing of the document from the app; guided field-by-field corrections with a before/after view; no re-entry of unchanged data.

**Acceptance criteria.**

```gherkin
Feature: Updating a student's file
  Scenario: Correcting the Arabic spelling of a name (MVP)
    Given a student enrolled at two schools, one of them Fatima's primary school
    When the secretary corrects the Arabic spelling of the student's name with the reason "data-entry error"
    Then the correction is historized with before/after values, reason, author, and timestamp
    And the other school involved receives the identity-correction notification
    And the student's guardians are informed

  Scenario: Document completeness tracked through to a complete file (MVP)
    Given a PRE-ENROLLED enrollment missing the birth certificate
    When the secretary sends the document reminder and then records the photograph of the certificate provided by the parent
    Then the document is archived in the file with date and author
    And the file moves to complete once the completeness list is satisfied
```

### PJ-SEC-06 — Phone reminder for an unpaid fee with an account statement

| Attribute | Value |
|---|---|
| Objective | Turn the morning's phone call into a tracked, effective action: accurate information, a statement sent on the spot, a dated commitment, never mentioning withholding documents |
| Actors | Fatima (call, trace); the financially responsible parent (the person on the call); leadership (escalation, aged balance) |
| Map journey | PC-07 |
| Modules involved | FIN (`prd/modules/16-finance-billing-collections.md`), COM (`prd/modules/17-communication-notifications.md`) |
| Needs covered | BES-SEC-05 |
| Data | `Installment`, `Dunning`, `FinancialAccount`, `Notification`, `DeliveryLog`, `Message` |
| Version | SMS reminders and a trace from MVP; a statement sent in one action via WhatsApp and read tracking in V1 (§12, DEC-12, DEC-36; channel costs: `prd/cross-cutting/35-external-integrations.md` and the WhatsApp pricing switch of 01/10/2026 documented in `prd/research/03-payments-communications.md`) |
| Baseline | (→ §7.7, §7.8, RG-38, DEC-12, DEC-24, DEC-36, G-16, INV-33, INV-39) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-06.1 | Due installments on the arrears table | Fatima (reminder) | From the arrears table by class and guardian, filtering due installments and opening the record of the first parent to call; the record shows the current number, payment history, reminders already sent (`Dunning` tiers), and prior promises | A complete reminder record in view | MVP |
| PJ-SEC-06.2 | Record opened | Fatima (call, logging) | Calling from the number shown (no paper address book); logging the outcome: unreachable, a payment promise by a date, refusal, a wrong number (correcting the number in one step) | A call tracked with outcome, author, and timestamp | MVP |
| PJ-SEC-06.3 | Call made | Fatima (sending), System (logging) | During or right after the call, sending the account statement (installments, payments, balance; FR-FIN-24, MVP) to the financially responsible parent, in their language, by SMS with a link (MVP) or WhatsApp (V1); the send is logged with channel and delivery status (`DeliveryLog`) | Statement sent on the available channel and logged | MVP (SMS with a link); V1 (WhatsApp) |
| PJ-SEC-06.4 | A promise recorded or the installment stays unpaid | System (reminders, follow-up), Leadership (escalation) | A dated promise creates a dated reminder in the tracking table; when the promise date passes with no payment, the next tier of the graduated reminder cycle applies (in-app and SMS in MVP within the allowed sending windows; WhatsApp and mail in V1 — §7.7, ARB-21); a parent who opted out via "STOP" no longer receives reminders but keeps attendance notifications (ARB-21d); beyond the configured threshold, leadership takes over (escalation) | Commitments tracked; escalation configured | MVP (in-app, SMS); V1 (WhatsApp, mail) |
| PJ-SEC-06.5 | The whole journey | A design safeguard (screens and actions) | No action in the journey allows suspending the student's access, withholding an official document, or recording a threat to withhold one (DEC-24, INV-39); collection continues through reminders and then legal action, outside the tool's scope | No document blocking possible; DEC-24 compliance guaranteed | MVP and V1 (a permanent principle) |

**Mobile and small-screen points.** The day's arrears table fits on a phone screen; calling and sending a statement from the same record; call outcomes logged with one tap (preset buttons).

**Acceptance criteria.**

```gherkin
Feature: Phone reminder for an unpaid fee
  Scenario: A call with the statement sent immediately (MVP)
    Given an 800 MAD installment overdue for 12 days and an automatic SMS reminder already sent
    When the secretary calls the father from the record and logs "payment promise on the 20th of the month"
    Then the call is tracked with outcome, author, and timestamp
    And the account statement is sent to the parent on the chosen channel and the send is logged
    And a reminder dated the 20th of the month appears in the promise's tracking

  Scenario: No document-blocking function (MVP)
    Given a parent with several unpaid installments and a certificate requested
    When the secretary works through the reminder record
    Then no screen in the journey offers to withhold an official document or suspend the student
    And the arrears alert stays the only expression of unpaid fees on the file (DEC-24)
```

### PJ-SEC-07 — Responding to a parent: announcements, summons, messages

| Attribute | Value |
|---|---|
| Objective | Answer the phone or the front desk with up-to-date information and leave a trace: an individual message, an administrative summons, a targeted announcement, sending a document |
| Actors | Fatima (response, sends); the parent (recipient); leadership (broad-reach announcements, viewing) |
| Map journey | PC-11 (owned by 01 DIR, 04 ENS, 03 SUR; Fatima owns administrative summons) |
| Modules involved | COM (`prd/modules/17-communication-notifications.md`) |
| Needs covered | BES-SEC-05 |
| Data | `Message`, `Announcement`, `Meeting/Convocation`, `Notification`, `DeliveryLog` |
| Version | Announcements, messages, moderated in-app threads (ARB-21a), and in-app and SMS notifications from MVP; the general WhatsApp Business API, push, summons with read tracking in V1 (§12) |
| Baseline | (→ §7.8, RG-38, DEC-12, DEC-34, DEC-36, G-17, INV-33) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-07.1 | A parent at the front desk or on the phone | Fatima (response) | For the student in question, the screen gathers the four most-requested pieces of information: the week's absences and tardies, the last summons, the financial balance, available documents — before any response to the parent (no information from memory, no paper notes) | An up-to-date front-desk record, viewable in one screen | MVP |
| PJ-SEC-07.2 | A question or information to relay | Fatima (drafting, sending) | Drafting a message to the parent from bilingual templates (a summons notice, a missing document, a meeting reminder), sending on the preferred channel, delivery tracked (sent, delivered, read) | Message sent, delivery tracked | MVP (templates, in-app/SMS channels); V1 (WhatsApp, full read tracking) |
| PJ-SEC-07.3 | An administrative meeting to summon | Fatima (creation) | Creating a summons with a subject, date, recipients (the authorized guardians, RG-14), and read tracking; an automatic reminder if unread by a configurable D-2; student-life and disciplinary summons stay owned by the head supervisor and leadership (PC-11) | Summons issued, reading tracked, automatic reminder | V1 |
| PJ-SEC-07.4 | Collective information within her authority (a class, a level) | Fatima (broadcast) | Broadcasting a targeted announcement from a template; school-wide announcements stay under leadership's authority (§7.8, PC-11) | Targeted announcement broadcast from a template | MVP |
| PJ-SEC-07.5 | A financial or administrative question on the phone | Fatima (response, sending) | Reading the record and, if the parent wants, sending the relevant document or statement in the same action; the exchange is logged (RG-38) | An informed, tracked response | MVP |

**Mobile and small-screen points.** Message templates at the top of a searchable list; sending in two taps (template, send); the front-desk record fits on a phone screen without excessive scrolling.

**Acceptance criteria.**

```gherkin
Feature: Responding to a parent
  Scenario: An administrative summons with read tracking (V1)
    Given a parent to summon for an administrative meeting
    When the secretary creates the summons from a bilingual template with a date and subject
    Then the summons is sent to the authorized guardians on their preferred channels
    And the read status is visible on the summons
    And an automatic reminder is sent if the summons stays unread by D-2

  Scenario: An informed phone response (MVP)
    Given a parent calling to learn their child's balance and absences
    When the secretary opens the student's front-desk record
    Then the week's absences, the last summons, the balance, and available documents are shown with no further search
    And any sending of a statement or document from the record is logged
```

### PJ-SEC-08 — Re-enrollment and year-end rollover, secretariat side

| Attribute | Value |
|---|---|
| Objective | Secure retention in spring and produce year N+1 with no re-entry: tracking confirmations and deposits by class, chasing non-responses, then creating N+1 enrollments and handling departures |
| Actors | Fatima (campaign, deposits, routine assignments); leadership (promotion decisions, rollover validation); parents (confirmation and deposit) |
| Map journey | PC-02 (owned by 01 DIR and 02 SEC) |
| Modules involved | INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), FIN (`prd/modules/16-finance-billing-collections.md`), COM (`prd/modules/17-communication-notifications.md`) |
| Needs covered | BES-SEC-07 |
| Data | `Enrollment`, `Installment`, `Payment`, `YearDecision`, `FeeSchedule` |
| Version | **MVP (wave 2 — year-end close, JAL-07)** for pre-filled forms, the deposit, the rollover, and assignment (FR-INS-20/21/23/24, ARB-01); V1 for automated campaign reminders (map PC-02) |
| Baseline | (→ RG-08, RG-09, RG-10, RG-25, DEC-06, DEC-21, G-07; Law 59.21: a ban on refusing to re-enroll a student in good standing — `prd/research/00-baseline-corrections.md` discrepancy 2) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-08.1 | Campaign opened by leadership | Fatima (tracking) | Pre-filled re-enrollment forms sent to families (§7.2, FR-INS-20); tracking the progress table by class: confirmed, pending, announced departures | Campaign tracked class by class | MVP (wave 2) |
| PJ-SEC-08.2 | Families with no response | Fatima (reminders, calls), System (automated reminders, V1) | Calling silent families from the record (an adapted PJ-SEC-06 journey); automated graduated reminders from templates in V1; the reservation deposit collected at the front desk (PJ-SEC-02) or online (PC-08, V1); the N+1 enrollment created as PRE-ENROLLED on confirmation | Non-responses followed up; deposits collected and tracked | MVP (wave 2); V1 (automated reminders) |
| PJ-SEC-08.3 | Re-enrollment file | A design safeguard (screens and actions) | No student in good standing can be excluded from re-enrollment (Law 59.21); places and classes stay managed by leadership; Fatima has no refusal action | Law 59.21 compliance guaranteed | MVP and V1 (a permanent principle) |
| PJ-SEC-08.4 | Year-end decisions entered by leadership (promoted, repeating, graduated, streamed, undetermined — RG-09) | System (batch processing), Fatima (routine assignments) | Closing every present student to COMPLETED with their decision; creating N+1 enrollments as PRE-ENROLLED on the cloned structure (RG-25) with no student copy, with no duplicate for students already pre-enrolled by the campaign (ARB-03f); "streamed" stays at the school; a student leaving at the next start of year stays COMPLETED with no N+1 (neither TRANSFERRED nor WITHDRAWN, reserved for mid-year departures, ARB-03c); class assignment (FR-INS-23); year-end attestations issued (PJ-SEC-04) | N+1 enrollments created; decisions kept for every student | MVP (wave 2) |
| PJ-SEC-08.5 | Campaign and rollover handled | Fatima (viewing), Leadership (steering) | Re-enrollment rate and projected N+1 headcount viewable by leadership (dashboards §7.11); Fatima no longer exports Excel files for this tracking | A retention summary available with no manual export | MVP (wave 2) |

**Mobile and small-screen points.** A per-class progress table viewable on a phone; collecting a deposit from the parent's row without changing screens; departures processed in a short list at the end of June.

**Acceptance criteria.**

```gherkin
Feature: Re-enrollment and rollover, secretariat side
  Scenario: Campaign tracking and collecting the deposit (MVP wave 2)
    Given a re-enrollment campaign open for the 2027-2028 year
    When a 4AP student's parent confirms re-enrollment and pays the deposit at the front desk
    Then the N+1 enrollment appears in the preparation list with the deposit collected and the receipt issued
    And the class progress table moves the student to "confirmed"
    And no further reminder is sent to this family

  Scenario: Rollover with no re-entry (MVP wave 2)
    Given year-end decisions entered by leadership for a 5AP class
    When the rollover creates the 6AP enrollments for year N+1
    Then every promoted student receives a PRE-ENROLLED N+1 enrollment linked to their existing identity
    And all 5AP enrollments move to COMPLETED with their decision, including students leaving at the start of the next year
    And no identity is recreated or duplicated
```

### PJ-SEC-09 — Voiding or correcting a payment and a receipt

| Attribute | Value |
|---|---|
| Objective | Correct a payment error (amount, method, student, installment) after receipt issuance without ever breaking the tamper-proof numbering: a tracked reversal, a numbered voiding receipt, validation |
| Actors | Fatima (voiding request); leadership or accounting (validation); the parent (informed, a new receipt) |
| Map journey | PC-07 |
| Modules involved | FIN (`prd/modules/16-finance-billing-collections.md`, FR-FIN-29) |
| Needs covered | BES-SEC-02 |
| Data | `Payment`, `Receipt`, `Installment`, `FinancialAccount` |
| Version | MVP (ARB-20b) |
| Baseline | (→ §7.7, RG-38, INV-40; ARB-20b) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-09.1 | A receipt issued with an error (amount, method, wrong student, or wrong installment) | Fatima (request) | From the receipt, a "Void or correct" action: a mandatory reason, the original amount and allocation recalled; the original receipt is never edited or deleted (INV-40) | Voiding request created with a reason | MVP |
| PJ-SEC-09.2 | Request created | Leadership or accounting (validation) | Validation per a configured threshold (auto-validated below the threshold, leadership validation above it); a reasoned refusal is possible | Decision tracked | MVP |
| PJ-SEC-09.3 | Voiding validated | System (reversal) | A negative reversal entry on the installments involved; a voiding receipt with its own sequential number referencing the original receipt; the installments become due again; on a simple correction, a new payment and a new receipt issued right after (PJ-SEC-02) | Sequential numbering preserved; accurate balances | MVP |
| PJ-SEC-09.4 | Reversal posted | System (notification) | The financially responsible parent receives the voiding receipt and, where applicable, the new receipt; the file's history shows the three linked documents | Parent informed; a readable history | MVP |

**Acceptance criteria.**

```gherkin
Feature: Voiding a payment
  Scenario: A receipt issued to the wrong student (MVP)
    Given receipt No. 2027-000418 for 800 MAD wrongly allocated to Student A
    When the secretary requests a voiding with the reason "wrong student" and leadership validates
    Then a reversal of -800 MAD is posted to Student A's account with a numbered voiding receipt referencing No. 2027-000418
    And receipt No. 2027-000418 stays viewable, marked "voided," with no gap in the sequence
    And a new payment of 800 MAD is recorded for Student B with a new receipt
```

### PJ-SEC-10 — Arrival of a student from a school outside ZSchool

| Attribute | Value |
|---|---|
| Objective | Enroll, with no re-entry and no duplicate identity, a student arriving from a school not on ZSchool (the majority case at launch), keeping their declared prior history and paper documents |
| Actors | Fatima (entry); the legal tutor (declaration, documents); leadership (validation) |
| Map journey | PC-01, PC-09 |
| Modules involved | INS (`prd/modules/11-admissions-enrollment-reenrollment.md`, FR-INS-26), DOC (`prd/modules/15-documents-certificates.md`) |
| Needs covered | BES-SEC-01 |
| Data | `Person`, `StudentProfile`, `Enrollment`, `StudentDocument` |
| Version | MVP (ARB-22) |
| Baseline | (→ RG-04, RG-05, RG-31, DEC-04, DEC-08; ARB-22) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-10.1 | A parent at the front desk with a paper leaving certificate and report cards | Fatima (search) | Searching by Massar code and by the guardian's mobile number: if the student already exists on the platform (a former ZSchool school, or a profile declared by the parent), linking; otherwise, creation (PJ-SEC-01.1, PJ-SEC-01.2) | No duplicate identity | MVP |
| PJ-SEC-10.2 | Identity in place | Fatima (entry), tutor (declaration) | Entering the declared prior history: previous school (name, city, off-platform), years, levels, year-end decisions; attachments (a paper leaving certificate, transcripts) uploaded and encrypted; each item is marked "unverified" until an attachment is provided; no disciplinary or health data brought over (DEC-08) | A declarative history linked to the identity, separate from ZSchool enrollments | MVP |
| PJ-SEC-10.3 | Prior history entered | Fatima, leadership | Continuing the ordinary enrollment (PJ-SEC-01.5 to 01.9) with an effective date; the Massar transfer procedure reference recorded (FR-INS-19) | Active enrollment; ESISE and the school passport fed by the declared history | MVP |

**Acceptance criteria.**

```gherkin
Feature: Arrival of a student from outside ZSchool
  Scenario: Enrollment with declared prior history (MVP)
    Given a 4AP student arriving from a school not on ZSchool with a paper leaving certificate
    When the secretary creates the enrollment and enters the previous school, the years, levels, and decisions, then attaches the photographed certificate
    Then the prior history appears on the student's record marked "declared, attachment provided"
    And no disciplinary or health data is entered
    And a future departure's default transfer profile carries these years and decisions with their declarative status
```

### PJ-SEC-11 — Mid-year resumption: payment schedules, cheques, and grades from a semester in progress

| Attribute | Value |
|---|---|
| Objective | Bring into production a school joining ZSchool after the start of the year (pilots: from 01/02/2027) with accurate payment schedules from day one and no re-entry of the semester already completed |
| Actors | Fatima (preparing files, reviewing); leadership (checking balances); ZSchool (support) |
| Map journey | PC-03 (mid-year resumption) |
| Modules involved | ADM (`prd/modules/10-administration-onboarding-subscription.md`, FR-ADM-06), INS (FR-INS-27, activation via import), FIN, EVA |
| Needs covered | BES-SEC-02, BES-SEC-08 |
| Data | `Enrollment`, `Installment`, `Payment` (cheques), `Mark`, `AttendanceRecord` |
| Version | MVP (ARB-02) |
| Baseline | (→ §7.1, G-18, RG-13, INV-09; ARB-02) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-SEC-11.1 | Structure and classes imported (PJ-DIR-01) | Fatima | Preparing the financial resumption file: per student and per installment, amount due, amount paid, date, and method; cheques in hand (number, bank, due date, amount); a financially responsible parent required per student | A file checked by the import report | MVP |
| PJ-SEC-11.2 | Financial file accepted | System | Creating payment schedules with monthly payments already settled marked paid on their date, with no reminder; imported cheques added to the wallet (PJ-SEC-03); enrollments activated via import (a logged reason, "data resumption") | Accurate payment schedules; no undue reminder | MVP |
| PJ-SEC-11.3 | Semester grades and absences available | Fatima, teachers | Importing the current semester's grades (a "published" or "draft" column) linked to the current enrollment; an optional import of aggregated absences per student | Semester report cards producible with no re-entry | MVP |
| PJ-SEC-11.4 | Resumption finished | Leadership, Fatima | Cross-checking balances (total due, total paid) against paper registers before going live; sending claim invitations with acceptance of the internal rules and Law 09.08 notices deferred to claiming (ARB-02) | Go-live validated; acceptances gathered progressively | MVP |

**Acceptance criteria.**

```gherkin
Feature: Mid-year resumption
  Scenario: A payment schedule resumed with five monthly payments settled (MVP)
    Given a student whose September-to-January monthly payments were settled before adopting ZSchool
    When the secretary imports the financial resumption file
    Then the payment schedule shows five payments paid on the imported dates and five still due
    And no reminder is sent for the settled payments
    And the enrollment is ACTIVE with the activation reason "data resumption"
```

---

## 5. Gains over the paper process

The table compares the persona's current practice (paper registers, Excel files, handwritten notes — §2.1, §2.11) with the target behavior described above. The gains are qualitative: the program's quantified indicators (collection rate, notification delay, reduction in double entry) are carried by `prd/cross-cutting/38-kpi-success-metrics.md` and not invented here.

| Task | Current paper process | With ZSchool | Expected gains |
|---|---|---|---|
| Enrollment (PJ-SEC-01) | A paper form then re-entered into a spreadsheet and into Massar; a risk of duplicates; identifiers noted by hand | One pass at the front desk: search by phone or Massar code, anti-duplicate matching, contract generated from the fee schedule, invitation by SMS | Zero re-entry, duplicates avoided at the source, a usable file from the first minute |
| Cash payment (PJ-SEC-02) | A handwritten cash register, receipt stubs, totals recounted in the evening, discrepancies found late | Collection in a few steps, a numbered receipt handed over and sent, a real-time cash log, a discrepancy computed at closing | An accurate, defensible cash drawer, a receipt always given, no more manual recounts |
| Cheques (PJ-SEC-03) | Cheque due dates tracked in a notebook; bounces discovered at the bank with no link to the file | A full lifecycle: due dates scheduled, reminders before deposit, a bounce linked to the installment and the reminder | No cheque forgotten, bounces handled with the history in view |
| Certificates (PJ-SEC-04) | Word templates retyped, a manual seal, no trace of requests, tension when arrears exist | Issuance in seconds, bilingual, numbered, sealed, and QR-coded, an arrears alert with no blocking, a statement attached, requests and issuances logged | Compliance (DEC-24, Law 59.21), no more retyping, written proof in a dispute |
| Student file (PJ-SEC-05) | Documents in cardboard folders, missing items noted nowhere, corrections never propagated | A completeness list per student, reminders to families, identity corrections historized and notified to other schools | A verifiably complete file, reliable identity platform-wide |
| Reminders (PJ-SEC-06) | Calls from numbers noted on paper, promises not tracked, a sometimes confrontational tone | An up-to-date record, a statement sent during the call, a dated promise, configured escalation, the DEC-24 safeguard | Shorter, less tense calls, tracked commitments, no illegal threats |
| Responding to parents (PJ-SEC-07) | Responses from memory or after checking three registers; summons on paper distributed by the student | An up-to-date front-desk record, bilingual templates, a summons with read tracking | An accurate response the first time, proof of distribution |
| Re-enrollment and year end (PJ-SEC-08) | Paper re-enrollment lists, deposits noted by hand, N+1 classes recopied in a spreadsheet | A pre-filled campaign, a progress table, tracked deposits, an automatic rollover on the cloned structure | Retention tracked class by class, year N+1 ready with no re-entry |
| Correcting a receipt (PJ-SEC-09) | A crossed-out receipt, a scratched-out stub, an unexplained cash discrepancy | A tracked reversal and a numbered voiding receipt | Tamper-proof numbering and a defensible cash drawer |
| Arrival from outside ZSchool (PJ-SEC-10) | The student's history unknown or recopied from memory | A declared prior history with documents, no duplicate identity | Statistics and future transfers fed with data |
| Mid-year resumption (PJ-SEC-11) | Re-entering five months of payments and grades | A checked import of payment schedules, cheques, and grades | Go-live with no re-entry or undue reminder |

---

## 6. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | **Escalated — ESC-03 (baseline update).** A baseline/research discrepancy on Law 59.21: the baseline (§2.7, H-14) mentions a publication "in the BO in March 2026," while research establishes publication in **Official Gazette No. 7485 of 23/02/2026** (113 articles; repealing Laws 04.00, 05.00, and 06.00; 35 implementing decrees expected; article 49 on fee disclosure; fines up to 10,000 DH, 20,000 DH, and 100,000 DH on repeat offense under articles 64-65). | The exact mandatory content of the parent contract is set by regulation (decrees not yet published as of 09/09/2026): ZSchool's contract templates must therefore be configurable without a rebuild, and the baseline mention deserves updating at its next revision. Sources: `prd/research/00-baseline-corrections.md` (discrepancy 2), `prd/research/02-regulatory-data.md` §1. |
| OQ-02 | **Open (V1, cash sessions).** The cash-discrepancy approval circuit: the baseline requires a cash session with a discrepancy field (§7.7, `CashSession` entity) but sets no alert threshold for leadership, no approver for non-zero discrepancies, and no handling of recurring discrepancies from the same staff member. | Working proposal: a justified discrepancy tracked with no notification if below a school-configurable threshold, leadership notified above it; monthly discrepancy consolidation per staff member in accounting exports. To be settled in review with the pilots (DEC-35). |
| OQ-03 | **Resolved — ARB-25j** (historization in MVP, a written register and audit log in V1; PJ-SEC-04.4). The form of written traceability for document requests and issuances: research recommends an enforceable trace (discrepancy 16, Law 59.21 penalizing refusal to issue), but the exact form (an automatic log is enough, or a request register signed by the recipient for verbal requests) is not settled. | A founder arbitration (D4, review): in MVP, minimal historization of entries (requests and issuances tracked at the record level); the immutable, exportable AuditLog is generalized in V1 (§12). Working proposal: a systematic automatic log (author, date, type, recipient) plus capturing the recipient's identity for any in-person handover outside a parent account; a signed register as a school option. To be confirmed with pilots and the compliance chapter (`prd/cross-cutting/36-legal-compliance-data-protection.md`). |
| OQ-04 | **Resolved — ARB-20f.** Interpreting RG-14b for issuing administrative school documents to the holder of custody (PJ-SEC-04, step 2). | Enrollment certificate and routine administrative documents: issued to any legal guardian or the holder of custody with no account or tutor signature needed (the ministry's position); leaving certificate: request signed by the legal tutor or the adult student, with the custodian able to initiate it (RG-14b, INV-11). Aligned with `prd/journeys/06-custodial-mother-and-guardian.md` PJ-GAR-03. |

---

## Traceability

| Baseline ID | Coverage in this file |
|---|---|
| §5.2 (persona Fatima) | §1, §2; PJ-SEC-01 to PJ-SEC-08 |
| §6.2 (identity, matching) | PJ-SEC-01 (steps 1–2), PJ-SEC-05 |
| §6.3 (enrollment, state machine) | PJ-SEC-01 (step 8), PJ-SEC-08 (step 4) |
| §6.4 (parent–student relationships) | PJ-SEC-01 (step 3), PJ-SEC-04 (step 2), PJ-SEC-07 (step 3) |
| §7.2 (admissions, enrollment, re-enrollment) | PJ-SEC-01, PJ-SEC-05, PJ-SEC-08 |
| §7.6 (documents and certificates) | PJ-SEC-04, PJ-SEC-05 |
| §7.7 (finance) | PJ-SEC-02, PJ-SEC-03, PJ-SEC-04, PJ-SEC-06 |
| §7.8 (communication) | PJ-SEC-06, PJ-SEC-07 |
| §8 (roles and permissions) | §2 (persona role), PJ-SEC-05 (step 4) |
| §10 (NFR) | §2 (old PC, instability, channels, bilingual documents) |
| §12 (scope by version) | "Version" column of every journey, §3 |
| RG-05, RG-06, RG-07 | PJ-SEC-01 (steps 1–2), PJ-SEC-05 |
| RG-08, RG-09, RG-10 | PJ-SEC-01 (step 5), PJ-SEC-08 (step 4) |
| RG-12, RG-13 | PJ-SEC-01 (step 3), PJ-SEC-02 (steps 3–4) |
| RG-14, RG-14b, RG-15, RG-16 | PJ-SEC-01 (step 3), PJ-SEC-04 (step 2), PJ-SEC-07 (step 3) |
| RG-25 | PJ-SEC-08 (step 4) |
| RG-28, RG-32, RG-33 | PJ-SEC-04 (step 3), PJ-SEC-05 (steps 3–4) |
| RG-38 | §2 (traceability), PJ-SEC-02, PJ-SEC-03, PJ-SEC-06, PJ-SEC-07 |
| DEC-03, DEC-04, DEC-10, DEC-11 | PJ-SEC-01 (steps 1–3), PJ-SEC-05 (step 2) |
| DEC-12, DEC-36 | PJ-SEC-02 (step 4), PJ-SEC-06 (step 3), PJ-SEC-07 |
| DEC-21 | PJ-SEC-01 (step 5) |
| DEC-24 | PJ-SEC-04 (governing rule), PJ-SEC-06 (step 5) |
| DEC-30 | PJ-SEC-01 (step 7), PJ-SEC-04 (step 3) |
| DEC-31 | PJ-SEC-01 (mobile points: Fatourati QR), PJ-SEC-08 (step 2) |
| DEC-34 | PJ-SEC-07 (scope: individual messages; moderated threads outside the role's scope) |
| G-07 | PJ-SEC-01, PJ-SEC-08 |
| G-15, G-16 | PJ-SEC-02, PJ-SEC-03, PJ-SEC-06 |
| G-17 | PJ-SEC-06, PJ-SEC-07 |
| INV-01, INV-02 | PJ-SEC-01 (step 1), PJ-SEC-05 (step 2) |
| INV-05, INV-08, INV-09, INV-11, INV-13 | PJ-SEC-01 (steps 3, 5, 8), PJ-SEC-02 |
| INV-25, INV-26 | PJ-SEC-04 (step 3), PJ-SEC-05 (steps 3–4) |
| INV-33, INV-39, INV-40 | PJ-SEC-01 (step 7), PJ-SEC-02 (steps 5–6), PJ-SEC-04 (governing rule), PJ-SEC-06 |
| PC-01, PC-02 | PJ-SEC-01, PJ-SEC-08 |
| PC-07, PC-09, PC-10, PC-11 | PJ-SEC-02, PJ-SEC-03, PJ-SEC-06, PJ-SEC-04, PJ-SEC-07 |
| BES-SEC-01 to BES-SEC-08 | §3 ("Needs covered" column) |
| `prd/research/00-baseline-corrections.md` (discrepancies 2, 14, 16) | PJ-SEC-01 (step 7), PJ-SEC-04 (governing rule), OQ-01, OQ-03 |
| `prd/research/02-regulatory-data.md` | PJ-SEC-01 (step 7), PJ-SEC-04 (governing rule) |
| `prd/research/03-payments-communications.md` | PJ-SEC-03 (cheque context), PJ-SEC-06 (channel cost) |
| ARB-01, ARB-02 (`prd/cross-cutting/42-review-arbitrations.md`) | PJ-SEC-01 (01.6, 01.7), PJ-SEC-03, PJ-SEC-08, PJ-SEC-11 |
| ARB-03, ARB-07, ARB-08, ARB-09, ARB-13, ARB-14 | PJ-SEC-01 (01.1, 01.3, 01.4, 01.8, 01.9), PJ-SEC-05.1 |
| ARB-20, ARB-21, ARB-22, ARB-24, ARB-25 | PJ-SEC-01.5, PJ-SEC-02, PJ-SEC-04, PJ-SEC-06, PJ-SEC-09, PJ-SEC-10, OQ-03, OQ-04 |
