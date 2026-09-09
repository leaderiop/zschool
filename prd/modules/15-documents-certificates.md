# ZSchool — Chapter 15: Documents and Certificates (DOC module)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09); previously 0.2 — revised (review of 09/09/2026) |
| Date | 2026-09-09 |
| Status | Draft PRD — under review; arbitrations ARB-01, ARB-13, ARB-19, ARB-20, ARB-25 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §7.6 (documents and certificates), §7.2 (enrollment documents), §7.7 (documents and unpaid balances, DEC-24), §7.9 (transfers, exit file), §9 (encryption, audit log), §10 (document NFRs), §12 (scope by version); RG-14, RG-14b, RG-15, RG-22, RG-28, RG-30, RG-31, RG-32, RG-33, RG-34, RG-38, RG-39; DEC-10, DEC-22, DEC-24, DEC-30, DEC-32; G-19, G-31; Q-06, Q-12, Q-15; H-14; `prd/research/00` (notes 1, 14, 16, 19), `prd/research/02` §2, §4 and §6 |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md` (BES-SEC-03/04/06, BES-GAR-04, BES-ELE-06/08), `prd/03-domain-data-model.md` (`Certificate`, `StudentDocument`, `AuditLog` entities; INV-11, INV-17, INV-20, INV-26, INV-33, INV-39), `prd/journeys/00-journey-map.md` (PC-01, PC-06, PC-09, PC-10), `prd/modules/11-admissions-enrollment-reenrollment.md` (enrollment documents), `prd/modules/14-assessments-grades-report-cards.md` (report cards, shared QR mechanism), `prd/modules/16-finance-billing-collections.md` (arrears alert, account statement), `prd/modules/17-communication-notifications.md` (document delivery), `prd/modules/18-transfers-mobility.md` (leaving certificate, exit file), `prd/modules/23-health-sensitive-data.md` (health data), `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` |

---

## 1. Objective and scope

The DOC module produces, numbers, seals and delivers the school's **official documents**, and manages the **digital student file** (supporting documents). It safeguards two non-negotiable baseline principles: **delivery is never blocked for unpaid balances** (DEC-24, INV-39), and delivered documents are **verifiable** (verification QR code in V1 per DEC-30, RG-33, G-19, ARB-19). Single terminology (ARB-20g): the document attesting a current enrollment is called an "enrollment certificate" throughout the PRD.

### 1.1 In scope

| Item | Content | Version |
|---|---|---|
| Catalog of official documents | Seven types: enrollment certificate, achievement certificate, attendance certificate, leaving certificate, student information form, student release authorization, employer certificate | MVP (core set: enrollment certificate, information form, leaving certificate and exit file — via INS/FIN/TRA on the same `Certificate` entity, OQ-01 resolved); V1 (full catalog, FR-DOC-02) |
| Configurable bilingual templates | Bilingual AR/FR header, logo, authorization number, statutory notices, per-type body, signatories | V1 |
| Numbering | Sequential per type and per school year, tamper-proof | V1 |
| Seal and timestamp | Advanced electronic seal + timestamp + QR code in V1; qualified seal and timestamp via an approved provider (TSP) in V2 (refers to `INT-SIG`) | V1 / V2 |
| Public verification | Authenticity-verification page by QR code, no authentication required | V1 |
| Generation | By the front desk on request; self-service by the parent for documents the school authorizes | V1 |
| Delivery and unpaid balances | No blocking; arrears alert; account statement on departure (to the financial guardian only, ARB-20e); written log of requests and deliveries | MVP for the no-blocking rule and the statement; V1 for the log |
| Digital student file | Documents attached to a relationship or a restriction (court rulings, proof of status), the child's birth certificate and photo; strict access control | MVP (relationship and restriction documents, the child's identity documents, INV-10, INV-11; ARB-13); V1 (full file, expected-documents checklist, completeness tracking, view logging) |
| Batch generation | Start-of-year enrollment certificates (for insurance), A4/A5 printing | MVP (wave 2 — 2027 school start, JAL-07; ARB-01) |
| Departure to a non-ZSchool school | Bilingual PDF exit file (MVP); time-limited secure link with QR code (V1) | MVP / V1 |

### 1.2 Out of scope (references)

| Item | Owning module | Reference |
|---|---|---|
| Report cards and transcripts (content, calculation, publication); the report-card verification QR code reuses this module's shared mechanism | EVA | `prd/modules/14-assessments-grades-report-cards.md` |
| Documents issued at enrollment (certificate, receipt, student form) within the front-desk flow; documents required for the admission file | INS | `prd/modules/11-admissions-enrollment-reenrollment.md` |
| Cash receipts, invoices, account statement (financial content), electronically signed parents' contract | FIN | `prd/modules/16-finance-billing-collections.md` |
| Electronic parental authorization for a school event or outing (online consent) | COM | `prd/modules/17-communication-notifications.md` (baseline §7.8) |
| Transfer procedure, choice of shared scope, Massar reference | TRA | `prd/modules/18-transfers-mobility.md` |
| Structured health data (medical record, allergies, treatments); the "vaccination record" document remains a file document | HEA | `prd/modules/23-health-sensitive-data.md` (V2); boundary in OQ-05 |
| Digital school passport | TRA, DOC | `PROJECT.md` §12 V2+ |
| Electronic signature of the parents' contract (advanced level) | FIN + `INT-SIG` | DEC-30, `prd/cross-cutting/35-external-integrations.md` |

---

## 2. Users and use cases

| Actor | Use case | Requirements | Persona reference |
|---|---|---|---|
| Front desk | Generates certificates and certifications on request at the counter; scans in file documents; views the delivery log; hands over the exit file (leaving certificate) | FR-DOC-01, FR-DOC-02, FR-DOC-08, FR-DOC-09, FR-DOC-10, FR-DOC-11, FR-DOC-15, ECR-DOC-01, ECR-DOC-02, ECR-DOC-05, ECR-DOC-07 | BES-SEC-03, BES-SEC-04, BES-SEC-06 (`prd/02-actors-personas.md`) |
| School leadership | Configures templates, numbering, self-service-authorized documents and signatories; views the log and the audit trail; signs documents | FR-DOC-03, FR-DOC-04, FR-DOC-05, FR-DOC-08, FR-DOC-13 | BES-DIR-07 (`prd/02-actors-personas.md`) |
| Parent / guardian | Downloads authorized documents in self-service; requests others from the front desk; the legal guardian receives the exit file, the financial guardian the account statement (ARB-20e) | FR-DOC-08, FR-DOC-09, FR-DOC-14 | BES-GAR-04, BES-PAR-03 (`prd/02-actors-personas.md`) |
| Custodial parent | Obtains administrative school documents in self-service (enrollment certificate, attendance certificate) without going through the legal guardian (ministry position, baseline §2.7; `prd/research/02` §5; ARB-20f); the leaving certificate remains signed by the legal guardian (RG-14b) | FR-DOC-08 | BES-GAR-04 |
| Adult student | Accesses their published documents; downloads their transcripts and certificates for their own procedures | FR-DOC-08, FR-DOC-14 | BES-ELE-06, BES-ELE-08 |
| Minor student with activated access | Views and downloads their published documents per the school's policy | FR-DOC-08, FR-DOC-14 | RG-01 |
| Third-party verifier (employer, new school, administration, bank, insurer) | Verifies a document's authenticity by QR code, with no ZSchool account | FR-DOC-07, ECR-DOC-06 | Off-platform (no account) |
| ZSchool support | No direct access to documents outside a logged support procedure | — | Baseline §8.1 |

---

## 3. Key journeys

| Journey | Role of the DOC module | Reference |
|---|---|---|
| Admission of a new student | Immediate issuance of enrollment documents (certificate, bilingual student form) within the front-desk flow, on the same `Certificate` entity | PC-01 (`prd/journeys/00-journey-map.md`); `prd/modules/11-admissions-enrollment-reenrollment.md` |
| Grades, councils, report cards | Provision of the seal, timestamp and verification-QR mechanism shared with report cards | PC-06; `prd/modules/14-assessments-grades-report-cards.md` |
| Transfer and departure | Generation of the leaving certificate at closing (ACTIVE → TRANSFERRED transition, state machine §3.2 of chapter 3), assembly of the exit-file PDF, time-limited secure link to a non-ZSchool school | PC-09; `prd/modules/18-transfers-mobility.md` |
| Self-service certificate by a parent | Download of authorized documents, non-blocking arrears alert, verification QR code | PC-10 |
| Step-level detail | Detailed `PJ-…` steps per persona are carried by `prd/journeys/01` to `prd/journeys/07`; this chapter does not duplicate them | `prd/journeys/00-journey-map.md` |

---

## 4. Functional requirements

### FR-DOC-01 — Generate the leaving certificate and the exit-file PDF as soon as the enrollment closes

| Attribute | Value |
|---|---|
| Description | When an enrollment closes during the school year (TRANSFERRED or WITHDRAWN status) or a student leaves at the next school start (a COMPLETED enrollment with no N+1 enrollment at the school of origin, ARB-03c), the system automatically generates the leaving certificate as a bilingual PDF (A4) and assembles the bilingual exit-file PDF: leaving certificate, annual transcript (FR-EVA-18, MVP wave 2; for a mid-year departure, a transcript of the closed periods), end-of-year decision where it exists (FR-EVA-13, FR-INS-21), and, **for the financial guardian only**, the account statement (FR-FIN-24, ARB-20e). The exit file is handed to the legal tutor (required signatory, RG-14b) or the adult student, downloadable from their account; the custodial parent who is not the legal guardian gets read access to it, excluding the account statement (ministry position, ARB-20f). No disciplinary or health data appears in it (RG-29, RG-31, DEC-08). Generation is never conditioned on any payment (DEC-24). The verification QR code is added in V1 (FR-DOC-05, ARB-19). |
| Priority | Must |
| Version | MVP (§12 MVP: "simple transfer between two ZSchool schools and exit-file PDF"; MVP components: FR-EVA-18 wave 2, FR-FIN-24 wave 1 — ARB-01; INV-39) |
| Traceability | (→ DEC-24, DEC-32 (PDF without the link: MVP), RG-12, RG-14b, RG-29, RG-31, INV-08, INV-11, INV-39; Q-06; ARB-01, ARB-03c, ARB-19, ARB-20e/f) |
| Actors | Front desk, school leadership, legal guardian, custodial parent, financial guardian |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Issuing the leaving certificate
  Scenario: A student leaves with an unpaid balance
    Given an ACTIVE enrollment for the student Youssef for the 2026-2027 year
    And an arrears balance of 1,500 MAD on his financial guardian's account
    When the legal guardian requests the leaving certificate
    And the front desk closes the enrollment to TRANSFERRED status
    Then the leaving certificate is generated as a bilingual PDF, with no condition tied to the balance
    And an arrears alert of 1,500 MAD is shown on the student's file
    And an account statement summarizing the arrears is offered as an attachment to the file handed to the financial guardian
    And the request, the delivery, the alert and the statement are logged with author, date and time
  Scenario: Departure with no known destination
    Given an ACTIVE enrollment for a student who leaves the school without a transfer
    When the front desk records the departure as WITHDRAWN with a reason and a date
    Then the leaving certificate and the exit-file PDF are generated the same way
    And no destination is stated on the certificate
  Scenario: Departure at the next school start
    Given a 2026-2027 enrollment moved to COMPLETED with the decision "promoted to the next level"
    And no 2027-2028 enrollment created at the school for this student
    When the legal guardian requests the leaving certificate in July
    Then the certificate and the exit file are generated with the annual transcript and the end-of-year decision
    And the 2026-2027 enrollment stays COMPLETED (no move to TRANSFERRED)
  Scenario: The custodial mother's access to the exit file
    Given Naïma, holder of custody, with no legal-guardian or financial-guardian status
    When she opens her daughter's exit file
    Then she can view the leaving certificate, the annual transcript and the decision
    And the account statement is not offered to her
```

### FR-DOC-02 — Offer the full catalog of official documents for issuance by the front desk

| Attribute | Value |
|---|---|
| Description | The module offers a catalog of seven official document types, issuable on request from the student's file: enrollment certificate (current enrollment, level, class, arrangement, year), achievement certificate (promotion or graduation, based on the end-of-year decision, RG-09), attendance certificate (period attended), leaving certificate, student information form (bilingual identity, class, guardians), student release authorization (leaving during school hours, person authorized to pick up the student), employer certificate (proof of a parent's children's schooling, for the parent's employer). Each issuance goes through a preview before generation, a choice of template language (Arabic, French, bilingual), then PDF generation, printing and delivery. Documents generated through the enrollment (`prd/modules/11-admissions-enrollment-reenrollment.md`) and finance (`prd/modules/16-finance-billing-collections.md`) flows use the same engine and the same `Certificate` entity. |
| Priority | Must |
| Version | V1 (§12 V1: "self-service documents and certificates"; on-request issuance at the front desk: BES-SEC-03) |
| Traceability | (→ RG-09, RG-14b, RG-15, baseline §7.6; BES-SEC-03) |
| Actors | Front desk, school leadership |

### FR-DOC-03 — Configure bilingual document templates

| Attribute | Value |
|---|---|
| Description | For each document type, the school leadership has a default template supplied by ZSchool and a template editor: bilingual header (the school's AR/FR name, logo, address, contact details), ministry **authorization number**, associated AREF and provincial education office (RG-22), statutory notices and type-specific notices (for example the school year, the level, the arrangement), a document body with variables (identity in dual script, class, dates, decision), a seal zone, a list of authorized signatories (school leadership). A preview is available in Arabic and French before saving; templates are versioned, and editing a template does not change documents already issued. |
| Priority | Should |
| Version | V1 (default bilingual templates are supplied from the MVP for the core document set, DEC-10) |
| Traceability | (→ RG-22, DEC-10, baseline §2.9 and §7.6) |
| Actors | School leadership |

### FR-DOC-04 — Number each document sequentially by type and by year

| Attribute | Value |
|---|---|
| Description | Every generated document carries a unique number, assigned by a sequential counter per (school, document type, school year) triplet, with no gaps and no reuse. Single rule: the number is assigned when generation is confirmed, never at the preview stage; an abandoned preview consumes no number; a confirmed document that is later voided keeps its number with a "voided" status and appears in the log. The number is printed on the document and recorded in the delivery log; it serves as the reference for searches and verification. The counter cannot be reset manually; any numbering correction goes through a logged support procedure (mirroring the tamper-proof invoice numbering, INV-40). |
| Priority | Must |
| Version | V1 (enrollment documents issued in MVP through the INS/FIN flows already carry a simple sequential number, see OQ-01) |
| Traceability | (→ baseline §7.6; INV-40 (equivalent principle for invoices); G-19) |
| Actors | Front desk, school leadership |

**Acceptance criteria**

```gherkin
Feature: Sequential document numbering
  Scenario: Two certificates of the same type on the same day
    Given an "enrollment certificate" counter at 41 for the 2026-2027 year
    When the front desk issues two enrollment certificates the same day
    Then the documents carry consecutive numbers 42 and 43
    And the delivery log records both numbers with author, date and time
  Scenario: Abandoned preview
    Given a counter at 43 and a certificate preview shown but never confirmed
    When the front desk abandons the issuance and starts a new generation
    Then no number was consumed by the preview
    And the next document carries number 44
  Scenario: A confirmed document later voided
    Given a certificate confirmed under number 44 with a class error
    When the front desk voids it with a reason
    Then number 44 stays assigned to the document with a "voided" status in the log
    And the corrected certificate carries number 45
```

### FR-DOC-05 — Apply the advanced electronic seal, timestamp and verification QR code

| Attribute | Value |
|---|---|
| Description | In V1, every generated official document carries: the school's **advanced** electronic seal (tied to the signing school's identity), a reliable **timestamp** of the generation, and a **verification QR code** pointing to the public verification page (FR-DOC-07). The PDF's fingerprint is computed and kept with the document: any alteration of the file makes verification fail. The advanced level is admissible in court with no presumption of reliability (Law 43.20 and decree 2-22-687; `prd/research/02` §4). The same mechanism is shared with report cards (`prd/modules/14-assessments-grades-report-cards.md`, RG-33). |
| Priority | Must |
| Version | V1 (DEC-30: "in V1, the school's advanced electronic seal, timestamp and verification QR code") |
| Traceability | (→ DEC-30, RG-33, G-19, G-31; Q-12) |
| Actors | School leadership (signatory), front desk, system |

### FR-DOC-06 — Qualify the seal and timestamp via an approved provider (V2)

| Attribute | Value |
|---|---|
| Description | In V2, the electronic seal and timestamp on sensitive documents (leaving certificate, certificates, transcripts) become **qualified**, via the API of a DGSSI-approved trust service provider (Barid eSign, DamaneSign or AfricTRUST), in the school's name. Since approval is granted **per service** (signature, seal, timestamp), the chosen provider must cover all three services; the technical integration is specified in `prd/cross-cutting/35-external-integrations.md` (`INT-SIG`) and is not duplicated here. No level is mandated by the texts for report cards and certificates (baseline §2.7): the qualified level is a choice for stronger evidentiary robustness, not an obligation. |
| Priority | Must |
| Version | V2 (DEC-30) |
| Traceability | (→ DEC-30, baseline §2.7; `prd/research/02` §4; refers to `INT-SIG` (`prd/cross-cutting/35-external-integrations.md`)) |
| Actors | School leadership, ZSchool (integration), approved provider |

### FR-DOC-07 — Enable public authenticity verification by QR code

| Attribute | Value |
|---|---|
| Description | Anyone holding a printed or PDF document (a third party with no ZSchool account) can verify its authenticity by scanning the QR code or entering the code on a public page. The page shows a status (authentic, superseded by a newer version, revoked, unknown) and a minimum of data: document type, issuing school, issue date. The student's full name (dual script) is shown only after a knowledge challenge: the verifier enters the document number and the student's date of birth as printed on the document presented; otherwise, the name stays masked (ARB-26, OQ-03 resolved). The page never exposes file data (grades, finance, documents, health) and is protected against enumeration (identical message for an unknown code, and rate limiting, baseline §9). Verification is logged with no collection of the verifier's personal data. |
| Priority | Must |
| Version | V1 (verification QR code: §12 V1; RG-33 applied to report cards, extended here to certificates) |
| Traceability | (→ RG-33, G-19, DEC-09 (principle); baseline §9 (anti-enumeration)) |
| Actors | Third-party verifier (off-platform), front desk, school leadership |

**Acceptance criteria**

```gherkin
Feature: Verifying a document's authenticity
  Scenario: An employer verifies a certificate by QR code
    Given an issued attendance certificate carrying a verification QR code
    When a third party scans the QR code from a phone, with no ZSchool account
    Then the public page shows the status "authentic document"
    And it states the document type, the issuing school, the issue date
    And the student's name stays masked until the verifier enters the document number and the date of birth
    And after this knowledge challenge, the full name in dual script is shown for comparison with the document presented
    And no file data (grades, finance, documents, health) is accessible from this page
  Scenario: Superseded document
    Given a certificate superseded by a corrected version
    When a third party scans the QR code of the superseded version
    Then the status shown is "document superseded"
    And the page names the current version without delivering its content
  Scenario: Unknown or forged code
    Given a verification code that does not exist, or an altered PDF whose fingerprint no longer matches
    When a third party submits this code on the public page
    Then the status shown is "document unknown"
    And the message is identical to that of an invalid code, to prevent enumeration
```

### FR-DOC-08 — Enable parent self-service for documents

| Attribute | Value |
|---|---|
| Description | The school leadership chooses, per document type, which ones guardians may download in **self-service** from their portal (default: enrollment certificate and attendance certificate; the leaving certificate and departure documents stay front-desk-only by default). Self-service applies to every legal guardian and to the custodial parent (RG-14, RG-14b: the custodial parent obtains administrative school documents without going through the legal guardian — ARB-20f) and, per the school's policy, to the student (a minor with activated access, or an adult). The leaving certificate, an act signed by the legal guardian, is never self-service (RG-14b). A self-service document is generated with the same guarantees as a front-desk one: bilingual template, number, advanced seal, timestamp, QR code. Types not authorized remain requestable from the front desk through the portal (a logged request, FR-DOC-10). Each generation notifies the other legal guardians per their rights (RG-13). |
| Priority | Must |
| Version | V1 (§12 V1: "self-service documents and certificates, verification QR code"; PC-10) |
| Traceability | (→ RG-01, RG-13, RG-14, RG-14b, RG-28, DEC-24, DEC-30; BES-GAR-04, BES-ELE-06, BES-ELE-08) |
| Actors | Parent / guardian, custodial parent, adult student, minor student with access, school leadership (configuration), front desk (requests) |

**Acceptance criteria**

```gherkin
Feature: Self-service documents for guardians
  Scenario: The custodial mother downloads an authorized enrollment certificate
    Given a school that authorizes self-service enrollment certificates
    And Naïma, holder of custody of her daughter, with an active account
    When Naïma opens her daughter's "Documents" area and requests an enrollment certificate
    Then the bilingual document is generated, numbered, carrying the advanced seal and the verification QR code
    And it is immediately downloadable from her account
    And the father, the legal guardian, receives the delivery notification
  Scenario: Document not authorized for self-service
    Given a school that does not release the leaving certificate for self-service
    When the parent views the "Documents" area
    Then the leaving certificate does not appear for download
    And an option to request it from the front desk is shown, logged in the register
  Scenario: Arrears with no blocking in self-service
    Given an enrollment certificate requested in self-service for a student with arrears
    When the parent generates the document
    Then generation succeeds with no blocking
    And the arrears alert appears on the file interface and on the account statement available to the parent
```

### FR-DOC-09 — Never block delivery for unpaid balances: alert and account statement

| Attribute | Value |
|---|---|
| Description | No rule tied to a financial balance may block the generation of an official document: neither at the front desk, nor in self-service, nor in automatic flows (closing, transfer). When a student has arrears, the file interface shows a non-blocking **alert** (amount, overdue installments), fed by the finance module (`prd/modules/16-finance-billing-collections.md`), and a summary **account statement** is attached to the exit file. The school cannot configure any payment condition on official documents; only non-mandatory services (transport, canteen, activities — the single list in CNF-14, `prd/cross-cutting/36-legal-compliance-data-protection.md`) can be conditioned, outside this module's scope. **Re-enrollment for the following year is never a conditionable service**: refusing re-enrollment to a student in good standing is prohibited by Law 59.21 and falls under the anti-refusal check CNF-13 (ARB-20d). |
| Priority | Must |
| Version | MVP (DEC-24, INV-39: no state of the model blocks generation; Q-06 resolved; ministry position 2020 and summary-proceedings orders, baseline §2.7; details in `prd/research/02` §6) |
| Traceability | (→ DEC-24, RG-12, INV-08, INV-39; Q-06; `prd/research/02` §6; `prd/research/00` note 16; CNF-13, CNF-14; ARB-20d) |
| Actors | Front desk, school leadership, parent / financial guardian |

**Acceptance criteria**

```gherkin
Feature: No document blocking for unpaid balances (MVP)
  Scenario: Self-service certificate with arrears
    Given a student whose financial guardian has 2,400 MAD in arrears
    When a legal guardian requests the enrollment certificate
    Then the document is generated immediately
    And a non-blocking arrears alert is shown on the file
  Scenario: A payment condition cannot be configured
    Given the school leadership on the document-configuration screen
    When they try to condition an official document or re-enrollment on settling the balance
    Then no such option exists and the list of conditionable services is limited to that of CNF-14
```

### FR-DOC-10 — Keep a written record of document requests and deliveries

| Attribute | Value |
|---|---|
| Description | Every request for an official document (front desk, portal, a phone call logged by the front desk) and every outcome (delivery, a reasoned refusal for a reason other than financial, a pending request) is recorded in a **log**: requester, type, student, date and time, author of the action, document issued (number). The log is viewable by the school leadership and exportable; it is the written proof of delivery traceability required by oversight practice: Law 59.21 penalizes, with fines up to 10,000 DH, the refusal to deliver certificates when the contract is being honored (Official Gazette No. 7485 of 23/02/2026; `prd/research/02` §1 and §6; `prd/research/00` note 16). No reason for refusal tied to unpaid balances exists in the system (FR-DOC-09). Log entries are added to the audit trail (RG-38, INV-33). |
| Priority | Must |
| Version | V1 (in MVP, minimal history of generations at the record level; written log and exportable immutable AuditLog in V1, INV-33 — arbitration D4, OQ-08) |
| Traceability | (→ RG-38, INV-33, DEC-24; `prd/research/02` §1 and §6; H-14 (full text to be confirmed against the Official Gazette)) |
| Actors | Front desk, school leadership, support (export) |

**Acceptance criteria**

```gherkin
Feature: Written traceability of requests and deliveries
  Scenario: Front-desk request with a disputed arrears balance
    Given a parent requesting an enrollment certificate at the front desk
    And a disputed arrears balance of 800 MAD on the student's file
    When the front desk processes the request
    Then the request and the delivery are logged with author, date and time
    And the issued document carries its counter number
    And the interface offers no refusal reason based on the unpaid balance
  Scenario: Pending request
    Given a leaving-certificate request filed through the portal
    When the enrollment closing has not yet been recorded
    Then the request appears in the log with a "pending" status
    And the front desk can process it as soon as closing happens, with traceability kept end to end
```

### FR-DOC-11 — Maintain the digital student file of supporting documents

| Attribute | Value |
|---|---|
| Description | The digital student file centralizes documents: the child's birth certificate and photo, court rulings (guardianship, custody, restriction) and proof of status attached to the parent-student relationship (INV-10, INV-11), vaccination record, foreign nationals' passport or residence permit, and any document filed under a configurable type. **In MVP, neither the number nor a copy of adults' national ID (CNIE) is collected** (ARB-25a): collection is enabled once the CNDP F112 prior authorization is obtained (`prd/cross-cutting/36-legal-compliance-data-protection.md`). The front desk uploads documents (scan or mobile photo) with type, date and a comment, and can view the child's identity documents; court rulings are viewable by the school leadership only, once filed (FR-DOC-12). A checklist of expected documents, configurable by the school, shows the file's completeness (V1). Documents are encrypted with extra protection (identity documents, court rulings — baseline §9) and carry the key of the tenant that filed them (ARB-13); they are shared only through the transfer profile (RG-31). Documents required at admission are set by the admissions module (`prd/modules/11-admissions-enrollment-reenrollment.md`) and managed here once the enrollment is created. |
| Priority | Must |
| Version | MVP (relationship and restriction documents, birth certificate and photo: upload and viewing — INV-10, INV-11, PJ-GAR-01/04); V1 (full file, checklist of expected documents, completeness; BES-SEC-06) |
| Traceability | (→ baseline §7.6, baseline §9 (extra encryption, F112); BES-SEC-06; `prd/research/02` §2; INV-10, INV-11; ARB-13, ARB-25a) |
| Actors | Front desk (upload), school leadership (configuration, viewing), authorized roles (viewing) |

**Acceptance criteria**

```gherkin
Feature: Digital student file
  Scenario: Uploading a birth certificate
    Given a student file where the "birth certificate" document is expected
    When the front desk uploads the scanned certificate with its type and date
    Then the document is filed, encrypted at rest, and the file's completeness is updated
    And the upload is logged with author, context and timestamp
  Scenario: Uploading a custody ruling (MVP)
    Given Naïma's relationship, as holder of custody, with her daughter
    When the front desk uploads the custody ruling attached to this relationship
    Then the document is encrypted, filed as "school-leadership confidential", attached to the relationship and to the filing school
    And the "holder of custody" status carries the reference of the supporting document
  Scenario: File completeness (V1)
    Given a checklist of expected documents configured by the school
    When an expected document is missing at the school start
    Then the file shows the missing document
    And the front desk can send a reminder to the guardian from the file screen
```

### FR-DOC-12 — Strictly restrict access to file documents and log it

| Attribute | Value |
|---|---|
| Description | Access to each document is governed by fine-grained permissions per type and per role (`prd/cross-cutting/30-roles-permissions-matrix.md`) under least privilege (RG-39): court rulings are visible to the school leadership only; the front desk uploads and views administrative documents and the child's identity documents (birth certificate, photo); teachers see neither the file nor its documents; parents view their child's documents per their rights (RG-14); the adult student holds their own rights (RG-02, DEC-20). Every view (authorized or refused) of a sensitive document is logged with author, context and timestamp (RG-38, INV-33). A restriction on a parent's access based on a court decision recorded by the school applies to the file (RG-14). Storage stays in Morocco (DEC-26): no document transits or is stored outside the territory. |
| Priority | Must |
| Version | MVP (permissions per type and role, court-ordered restrictions — INV-10; write-level history, arbitration D4); V1 (log of views and refused attempts, INV-33 — ARB-25j) |
| Traceability | (→ RG-02, RG-14, RG-38, RG-39, DEC-20, DEC-26, INV-10, INV-17, INV-33, INV-34; ARB-25j) |
| Actors | School leadership, front desk, authorized roles, parents, adult student |

**Acceptance criteria**

```gherkin
Feature: Access control on the student file
  Scenario: Unauthorized viewing of a court ruling
    Given a custody ruling filed as "school-leadership confidential" in a student's file
    When a teacher opens the student's file
    Then the document is neither visible nor downloadable
    And the refused access attempt is logged with author, context and timestamp
  Scenario: Authorized viewing logged
    Given a front-desk staff member authorized for administrative documents
    When they view a student's birth certificate
    Then the view is logged with author, context and timestamp
    And the document stays unchanged (no edit possible from viewing)
```

### FR-DOC-13 — Deliver the exit file to a non-ZSchool school through a time-limited secure link

| Attribute | Value |
|---|---|
| Description | When a student joins a school outside ZSchool, the bilingual exit-file PDF is made accessible to the receiving school through a **time-limited secure link** with a **verification QR code** (DEC-32, Q-15 resolved). The link is generated by the front desk or the school leadership from the exit file, with a configurable validity period (default: 30 days); it grants access to the exit file only (no ZSchool account needed), is logged on every access, and can be revoked and regenerated. The PDF's scope stays that of the default transfer profile (RG-31): no disciplinary or health data. |
| Priority | Must |
| Version | V1 (DEC-32: "from V1 on"; the PDF alone is MVP, FR-DOC-01) |
| Traceability | (→ DEC-32, RG-29, RG-31, RG-38; Q-15) |
| Actors | Front desk, school leadership, receiving school (off-platform recipient), legal guardian |

**Acceptance criteria**

```gherkin
Feature: Exit file to a non-ZSchool school
  Scenario: Access by secure link before expiry
    Given a student transferred to a school outside ZSchool
    And a secure link generated with a 30-day validity period
    When the recipient opens the link before it expires
    Then the bilingual exit-file PDF displays and downloads with no ZSchool account
    And the access is logged with date, time and result
  Scenario: Expired or revoked link
    Given a secure link that expired 5 days ago
    When the recipient opens the link
    Then the page shows an expiry message with no content from the file
    And the issuing school can generate a new link from the exit file
    And the old link stays unusable
```

### FR-DOC-14 — Version, reissue and retain documents

| Attribute | Value |
|---|---|
| Description | A delivered document stands as issued: any needed correction creates a **new version**, with the old one remaining viewable marked "superseded" (immutability and verification principle, RG-33); the verification page names the version in force (FR-DOC-07). The log keeps the history of versions and reissues. After an enrollment closes, the school's documents are read-only (RG-32), and the student and their guardians keep permanent read access to published official documents (RG-28, INV-20), within the permanent-retention limit applicable to official documents (DEC-22) — including if the school is closed down (G-33). Reissuing an archived document (for example, to prove a past enrollment) regenerates an identical PDF marked "reissue" with its own log number. |
| Priority | Must |
| Version | MVP (versioning and permanent read access to published documents, INV-20, RG-28); V1 (reissue from the log, the current version named on the verification page) |
| Traceability | (→ RG-28, RG-32, RG-33, RG-34, DEC-22, G-19, G-33, INV-20, INV-25, INV-26) |
| Actors | Front desk, school leadership, parent / guardian, adult student |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Document versions and retention (MVP)
  Scenario: Permanent read access after departure
    Given an enrollment certificate delivered to Youssef in 2026-2027, then his enrollment closed to TRANSFERRED
    When his father opens "My documents" a year later
    Then the document stays viewable and downloadable unchanged
  Scenario: Correction via a new version
    Given a certificate delivered with a class error
    When the front desk issues the corrected version
    Then a new version is created and the old one stays viewable marked "superseded"
```

### FR-DOC-15 — Generate and print documents in batches

| Attribute | Value |
|---|---|
| Description | The front desk can bulk-generate one document type for a scope (class, level, school) — for example, enrollment certificates for every class for start-of-year insurance files — with a shared counter (one number per document, FR-DOC-04), a ZIP output of PDFs and batch printing (A4 and A5 formats, baseline §10). The batch is logged as a whole (author, scope, count), and each document remains individually traceable in the log. |
| Priority | Should |
| Version | MVP (wave 2 — start-of-year enrollment certificates for insurance, September 2027, JAL-07; ARB-01) |
| Traceability | (→ baseline §10 (document NFRs); FR-DOC-04, FR-DOC-10; ARB-01) |
| Actors | Front desk, school leadership |

---

## 5. Morocco specifics

| Topic | Rule adopted in this module | Source |
|---|---|---|
| Bilingualism and dual script | Every official document is bilingual Arabic/French (default template); names appear in dual script; the interface and labels are AR/FR with full RTL | DEC-10; baseline §2.9 |
| Authorization number and seal | Document headers carry the ministry authorization number and the AREF affiliation, configured at the school level | RG-22; baseline §2.9 |
| Delivery and unpaid balances | No official document can be withheld for unpaid balances: ministry position (September 2020), documented summary-proceedings orders (Salé 11/07/2020, Tangier 07/09/2020 with a 500-DH/day penalty, Benguerir, Khemisset), a note of 28 May 2021 on delivery through Massar | Baseline §2.7; `prd/research/02` §6; H-14 (primary texts to confirm) |
| Penalty for refusing delivery | Law 59.21 (Official Gazette No. 7485 of 23/02/2026) penalizes, with fines up to 10,000 DH, refusal to deliver certificates when the contract is being honored: hence the absence of any blocking function and the written log of requests (FR-DOC-09, FR-DOC-10) | `prd/research/02` §1 and §6; `prd/research/00` note 16 |
| Guardianship and custody | The legal guardian (by default the father) or the adult student signs the leaving certificate; the holder of custody obtains administrative documents in self-service (enrollment certificate, attendance certificate — ministry position of 30/05/2023; ARB-20f); in case of conflict, the school files the court ruling in the file | RG-14b; INV-11; baseline §2.7; `prd/research/02` §5; ARB-20f |
| Seal and evidentiary value | Framework under Law 43.20 and decree 2-22-687 (Official Gazette No. 7160 of 12/01/2023): three levels, admissibility with no presumption for the advanced level; TSP approvals granted per service (Barid eSign since January 2025 with qualified timestamping from April 2026, DamaneSign March 2025, AfricTRUST June 2026); no level mandated for certificates | Baseline §2.7; `prd/research/02` §4; `prd/research/00` note 14 |
| Protection of file data | File and documents: the school is the data controller, ZSchool the processor; CIN number and health data: CNDP prior authorization (F112); extra encryption for identity documents and court rulings; storage in Morocco | Baseline §9; `prd/research/02` §2; `prd/research/00` note 19 |
| Timestamp and timezone | Document timestamps are expressed in `Africa/Casablanca` time, set to **permanent UTC+0** as of 20/09/2026 (decree No. 2.26.530); the divergence from the baseline is settled once in OQ-01 of `prd/01-context-vision-scope.md` | `prd/research/00` note 1 |
| Retention | Official documents and logs are kept permanently by the school (past certificates can be reissued); audit logs 5 years | DEC-22; RG-34 |

---

## 6. Data and events

### 6.1 Entities used (canonical names from `PROJECT.md` §6.10, detail in `prd/03-domain-data-model.md`)

| Entity | Use in the module |
|---|---|
| `Certificate` | Official document: type (the catalog's seven types), counter number (school × type × year triplet), PDF version and fingerprint, seal (image or advanced-seal reference, then qualified in V2), timestamp, signatory, verification QR code, status (delivered, superseded, reissue); linked to the enrollment and the school |
| `StudentDocument` | Student-file document: configurable type, encrypted file, confidentiality level, file completeness; linked to the student profile **and carries the key of the filing tenant** (ARB-13); court rulings join the parent-student relationship's supporting documents (RG-14) |
| `School` | Supplies the legal header for templates: AR/FR name, authorization number, AREF, logo, seal, signatories (RG-22) |
| `Enrollment`, `YearDecision`, `PeriodResult`, `Transcript` | Data reused in documents (enrollment, end-of-year decision, transcripts) and in the exit file |
| `ParentStudentRelationship` | Determines who can obtain documents (statuses and rights, RG-14, RG-14b) and the "release authorization" context attribute (RG-15) |
| `FinancialAccount` | Feeds the arrears alert and the exit file's account statement (RG-12, INV-08) |
| `AuditLog` | Logs generations, sensitive views and refused attempts (RG-38, INV-33) |

### 6.2 Notifiable events

| Event | Producer | Consumers and effects |
|---|---|---|
| `DocumentGenerated` | DOC module (front-desk issuance, self-service, closing flows) | Parent and the legal guardians concerned (document delivery and verification QR code via `prd/modules/17-communication-notifications.md`); delivery log; audit trail |
| Document request (status: filed, processed, refused) | Parent (portal) or front desk | Front desk (processing queue), parent (status); recorded in the log (FR-DOC-10) |
| Exit-file access (secure link) | DOC module | Audit trail; the school's visibility into the access log (FR-DOC-13) |

Notifications go out through the standard channels (in-app and SMS from the MVP; WhatsApp utility limited to attendance notifications in MVP, then general rollout of WhatsApp, push and email in V1 per the module), with no duplication of the routing rules described in `prd/modules/17-communication-notifications.md`.

---

## 7. Key screens

Text-described screens, mobile-first, labels provided in French and Arabic (RTL); reference UX detail: `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`.

### ECR-DOC-01 — Generating a document (front desk)

Front-desk screen, web and mobile. Zone 1: student search (name in dual script or Massar code) with context selection (school, year, class). Zone 2: file-status banner — non-blocking arrears alert if there is a balance (amount and overdue installments, DEC-24), enrollment status. Zone 3: list of the seven document types with availability (departure documents only appear for an enrollment that can be, or has been, closed). Zone 4: form for the chosen type (template language: Arabic, French, bilingual; variable fields pre-filled from the file). Zone 5: PDF preview before generation, then Generate, Print, Download, Send to parent (notification) actions. States: preview (no number consumed), confirmed (number assigned at confirmation), voided (number kept in the log), error (clear message) — single rule FR-DOC-04. In AR: mirrored RTL layout, correct Arabic fonts (baseline §10).

### ECR-DOC-02 — Log of delivered documents (front desk, school leadership)

Filterable table (type, school year, class, student, period, status): number, type, student, requester, issued by, date and time, version, status (delivered, superseded, reissue) columns. Actions: view the archived PDF, verify the QR code, reissue (FR-DOC-14), export the log (FR-DOC-10). On mobile: a simplified list with search by number, detail on tap. Each row opens the version history with a "superseded" flag where applicable.

### ECR-DOC-03 — Template and self-service configuration (school leadership)

List of the seven types with the active template and version. Template editor: bilingual header (AR/FR name, logo, address), authorization number and AREF, notices, body with variables, authorized signatories; side-by-side preview in Arabic and French. Self-service section: per type, an "authorized for parent/student download" toggle with a default value (enrollment certificate and attendance certificate authorized; leaving certificate not authorized). Numbering section: read-only view of counters per type and per year (FR-DOC-04). Any change creates a new template version with no effect on documents already issued.

### ECR-DOC-04 — "Documents" area of the parent portal (mobile-first)

Child and school selector (multi-school, one account). List of documents available for download (authorized types, FR-DOC-08) and a history of documents received (viewable PDFs, QR code visible). "Request from the front desk" button for non-authorized types, with request status (filed, processed, refused). Arrears alert visible on the file, never blocking (DEC-24), with access to the account statement (finance module). In AR: full RTL interface; availability notifications per preferences (push, WhatsApp, SMS).

### ECR-DOC-05 — Student file: supporting documents (front desk)

List of expected documents with a completeness status (per-document tag: missing, filed, validated). Upload by file or mobile photo: type (identity document, birth certificate, photo, vaccination record, court ruling, other), date, comment. Per document: confidentiality level (for example "school-leadership confidential" for court rulings), filing date, author, view log. Actions: upload, replace (the old version is kept), send a reminder to the guardian for a missing document. Sensitive documents show a reminder that views are logged (RG-38).

### ECR-DOC-06 — Public verification page (third party, no authentication)

Page accessible by QR code or by entering the verification code. Display: status (authentic document, superseded document, unknown document), type, issuing school, issue date; the student's name masked, revealed in dual script after entering the document number and date of birth (FR-DOC-07). Never any file data; a single message for an unknown or invalid code (anti-enumeration, baseline §9); rate limiting. In AR and FR per the browser language. No tracking cookie, no verifier personal data collected.

### ECR-DOC-07 — Exit file and secure link (front desk, school leadership)

Exit-file assembly screen: included documents (leaving certificate, annual transcript, decision; the account statement attached to the financial guardian's copy only, ARB-20e), recipients (legal guardian or adult student; custodial parent in read access excluding finance), bilingual PDF preview, consistency check (enrollment closed or COMPLETED with no N+1, decision entered). Secure-link section: validity period (default 30 days), link and QR-code generation, regeneration, revocation, access log (date, time, result, FR-DOC-13). Rule reminders: no disciplinary or health data in the file (RG-31, DEC-08), delivery never blocked for unpaid balances (DEC-24).

---

## 8. Integrations

| Integration | Use in this module | Version | Reference |
|---|---|---|---|
| `INT-SIG` — qualified trust service provider | Qualified seal and timestamp in the school's name (V2); per-service approval requires a provider covering signature, seal and timestamp | V2 | `prd/cross-cutting/35-external-integrations.md`; DEC-30; `prd/research/02` §4 |
| Notification channels (`INT-SMS`, `INT-WAP`, `INT-EML`) | Delivery of generated documents and availability notifications; no full document travels in the message body: a link to the portal or an attachment per the communication module's rules; MVP: in-app and SMS (WhatsApp utility limited to attendance notifications), V1: general rollout of WhatsApp/push/email | MVP/V1 | `prd/modules/17-communication-notifications.md`; `prd/cross-cutting/35-external-integrations.md` |
| Hosting in Morocco | Storage of PDFs and documents in Morocco (production and backups), with no outgoing document flow | All | DEC-26; `prd/cross-cutting/35-external-integrations.md` |

No Massar integration is required by this module: the Massar transfer procedure stays off-platform in V1, and the reference is recorded by the transfers module (`prd/modules/18-transfers-mobility.md`).

---

## 9. Module-specific non-functional requirements

Requirements are numbered in `prd/cross-cutting/32-non-functional-requirements.md` (`NFR-…` domains); this chapter sets the module's expectations without duplicating the numbering:

- **NFR-DOC domain**: bilingual PDFs with correct Arabic fonts, A4 and A5 formats, batch printing, archiving PDFs and fingerprints unchanged for the retention period (DEC-22).
- **NFR-PERF domain**: on-demand document generation in a few seconds on a mobile network, aligned with the report-card generation target (baseline §10); start-of-year batches (FR-DOC-15) run in a background queue with a completion notification.
- **NFR-RES domain**: document volume (PDFs and scanned documents) sized to the 500,000-student target; a storage quota per school, beyond which storage is billed as a consumable (baseline §11).
- **NFR-I18N domain**: AR/FR templates and labels with full RTL, name variables in dual script, document date in local format.
- **NFR-SEC and NFR-OBS domains**: extra encryption for documents (baseline §9), full logging of views and attempts (RG-38), per-tenant traceability.
- **NFR-DISP domain**: June peaks (exit files, batch certificates) must not degrade single-document generation; no maintenance window during closing and departure periods (baseline §10).

---

## 10. Success metrics

No dedicated `KPI-NN` for the DOC module is set by the baseline; platform indicators are carried by `prd/cross-cutting/38-kpi-success-metrics.md`. The module contributes to the following measures, to be instrumented from V1 on:

- Front-desk document delivery lag (from request to handover), target: a few minutes, no appointment or preparation delay.
- Share of common documents obtained in self-service by parents (share of parent-generated documents out of all issued enrollment and attendance certificates).
- QR-verification success rate (authentic documents verified by third parties).
- Student-file completeness (share of files with no missing document after the start-of-year period).
- Traceability: share of requests and deliveries recorded in the log (target: 100% of deliveries, since the log is systematic).

---

## 11. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Exact MVP document scope | **Resolved — ARB-01**: MVP core set = enrollment documents (enrollment certificate, information form via INS), receipts and account statement (FIN), leaving certificate and exit file (FR-DOC-01), relationship and restriction documents (FR-DOC-11), batch start-of-year certificates for 2027 (FR-DOC-15, wave 2); full catalog, editable templates, log, QR code and general self-service rollout in V1. |
| OQ-02 | Exact content of the non-ZSchool exit file | No regulatory template is fixed at the baseline for the PDF handed to a non-ZSchool school (included documents, notices); to be validated with the AREF offices and the pilots (DEC-35) before fixing the default composition |
| OQ-03 | Data exposed by the public verification page and link validity period | **Partially resolved**: name revealed after a knowledge challenge (document number + date of birth, FR-DOC-07); anti-enumeration via a single message and rate limiting; default link validity 30 days (FR-DOC-13). Still to confirm with `prd/cross-cutting/31-security-privacy.md`: non-sequential format for verification codes (SEC-06 extended to certificates). |
| OQ-04 | Relationship among the three "release authorization" objects | The §7.6 catalog cites the release authorization as a document (DOC); RG-15 cites it as a context attribute of the parent-student relationship (OQ-04 of chapter 3); §7.8 describes the electronic parental authorization for an event (COM). To clarify on review: the DOC document could be issued from the relationship attribute, with electronic consent staying with the COM module |
| OQ-05 | "Vaccination record" boundary between DOC and HEA | In V1, vaccination is a file document (`StudentDocument`); in V2, the health module (`prd/modules/23-health-sensitive-data.md`) will structure health data under CNDP authorization (F112). Define the possible migration of documents into structured data with no dual source of truth |
| OQ-06 | Baseline/research divergence on the timezone affecting timestamps | **Resolved**: settled once in OQ-01 of `prd/01-context-vision-scope.md` (permanent UTC+0); this chapter does not open a separate question. |
| OQ-07 | Mandatory statutory notices on official documents | The full text of Law 59.21 in the Official Gazette (H-14) and any regulatory templates may mandate notices (school identity, authorization, contract references); to confirm against Official Gazette No. 7485 and the expected implementing decrees before fixing default templates |
| OQ-08 | Founder arbitration (D4) — logging | **Resolved — ARB-25j**: in MVP, an immutable history of writes at the record level (generations, voids, document uploads); the written delivery log (FR-DOC-10), the sensitive-view log (FR-DOC-12) and the exportable AuditLog (INV-33) arrive in V1. |

---

## 12. Traceability

| Baseline ID | Covered in this file |
|---|---|
| RG-14 | FR-DOC-08, FR-DOC-12 (restrictions on court decision) |
| RG-14b | FR-DOC-01, FR-DOC-02, FR-DOC-08 (leaving-certificate signatory, custodial-parent documents); INV-11 |
| RG-15 | FR-DOC-02 (release authorization), OQ-04 |
| RG-22 | FR-DOC-03, FR-DOC-12 (header: authorization number, seal, signatories) |
| RG-28 | FR-DOC-08, FR-DOC-14 (permanent read access to published documents); INV-20 |
| RG-29, RG-30, RG-31 | FR-DOC-01, FR-DOC-13 (exit-file content bounded to the transfer profile) |
| RG-32 | FR-DOC-14 (read-only after closing); INV-25 |
| RG-33 | FR-DOC-05, FR-DOC-07, FR-DOC-14 (QR code, fingerprint, versions); INV-26; G-19 |
| RG-34, DEC-22 | FR-DOC-14 (permanent retention of official documents) |
| RG-38 | FR-DOC-10, FR-DOC-12 (logging of writes and sensitive views); INV-33 |
| RG-39 | FR-DOC-12 (least privilege on the file); INV-34 |
| DEC-10 | FR-DOC-03 (bilingual templates, dual script) |
| DEC-24 | FR-DOC-01, FR-DOC-08, FR-DOC-09, FR-DOC-10 (no blocking, alert, statement, log); INV-39; Q-06 |
| DEC-30 | FR-DOC-05 (advanced seal, timestamp, QR code in V1), FR-DOC-06 (qualified in V2); Q-12 |
| DEC-32 | FR-DOC-01 (PDF, MVP), FR-DOC-13 (time-limited secure link and QR code, V1); Q-15 |
| DEC-26 | FR-DOC-12 (document storage in Morocco) |
| DEC-08 | FR-DOC-01, FR-DOC-13 (health and discipline excluded from the exit file) |
| DEC-20 | FR-DOC-12 (adult student's rights over their own file) |
| G-31 | FR-DOC-05, FR-DOC-06 (evidentiary value of the seal, by level) |
| G-33 | FR-DOC-14 (access to published documents after school closure) |
| H-14 | FR-DOC-10, OQ-07 (full text of Law 59.21 and notices to confirm) |
| §7.2 (enrollment documents) | FR-DOC-02, OQ-01 (engine shared with INS) |
| §7.6 (documents and certificates) | Entire chapter (catalog, templates, numbering, seal, digital file, generation) |
| §7.7 (documents and unpaid balances) | FR-DOC-09 (alert and account statement) |
| §7.9 (transfers, exit file) | FR-DOC-01, FR-DOC-13 |
| §9 (security, CNDP) | FR-DOC-07 (anti-enumeration), FR-DOC-11, FR-DOC-12 (extra encryption, F112) |
| §10 (document NFRs) | FR-DOC-15 and §9 of this chapter (bilingual PDFs, A4/A5, batch printing) |
| §12 (versions) | Version tags on every requirement |
| `prd/research/00` notes 1, 14, 16, 19 | OQ-06 (timezone), FR-DOC-05/FR-DOC-06 (TSP), FR-DOC-09/FR-DOC-10 (Law 59.21, orders), FR-DOC-11 (F112) |
| `prd/research/02` §2, §4, §6 | FR-DOC-11 (F112), FR-DOC-05/FR-DOC-06 (Law 43.20, approvals), FR-DOC-09/FR-DOC-10 (delivery and unpaid balances) |
| CNF-13, CNF-14 (`prd/cross-cutting/36`) | FR-DOC-09 (single list of conditionable services; re-enrollment excluded) |
| INV-10, INV-11 (`prd/03`) | FR-DOC-11, FR-DOC-12 (relationship and restriction documents from the MVP) |
| ARB-01 (`prd/cross-cutting/42`) | §1.1 (MVP core set), FR-DOC-01, FR-DOC-15; OQ-01 |
| ARB-13 (`prd/cross-cutting/42`) | FR-DOC-11; §6.1 (`StudentDocument` per filing tenant) |
| ARB-19 (`prd/cross-cutting/42`) | §1, FR-DOC-01 (QR code in V1) |
| ARB-20 d/e/f/g (`prd/cross-cutting/42`) | FR-DOC-01, FR-DOC-08, FR-DOC-09; §2, §5 ("enrollment certificate" terminology) |
| ARB-25 a/j (`prd/cross-cutting/42`) | FR-DOC-11 (CNIE not collected in MVP), FR-DOC-12 (logging) |
| ARB-26 (`prd/cross-cutting/42`) | FR-DOC-07 (knowledge challenge); OQ-03 |
