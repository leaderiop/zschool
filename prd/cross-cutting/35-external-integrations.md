# ZSchool PRD — Chapter 35: External Integrations

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review (arbitrations `prd/cross-cutting/42-review-arbitrations.md`) |
| Source | PROJECT.md §2.6, §2.7, §2.8, §9, §10, §11, §12, §14 (DEC-26, DEC-28, DEC-30, DEC-31, DEC-36), §16 (H-04, H-17, H-18, H-19, H-20, Q-08); prd/research/02-regulatory-data.md, prd/research/03-payments-communications.md, prd/research/04-pedagogy-massar-calendar.md, prd/research/05-infrastructure-usage.md; prd/research/00-baseline-corrections.md |
| Related files | prd/modules/21-massar-regulatory-exports.md, prd/modules/16-finance-billing-collections.md, prd/modules/17-communication-notifications.md, prd/modules/15-documents-certificates.md, prd/modules/18-transfers-mobility.md, prd/03-domain-data-model.md, prd/journeys/00-journey-map.md (PC-08), prd/02-actors-personas.md, prd/cross-cutting/31-security-privacy.md, prd/cross-cutting/32-non-functional-requirements.md, prd/cross-cutting/33-business-model-packaging.md, prd/cross-cutting/36-legal-compliance-data-protection.md, prd/cross-cutting/39-risks-mitigations.md, prd/cross-cutting/42-review-arbitrations.md (ARB-01, ARB-07, ARB-21, ARB-25) |

---

## 1. Purpose and chapter conventions

This chapter describes ZSchool's **eight external integrations**: Massar/ESISE (INT-MAS), CMI's Fatourati (INT-FAT), card acquiring (INT-CAR), the Moroccan SMS aggregator (INT-SMS), the WhatsApp Business Platform (INT-WAP), electronic signature and stamping under Law 43.20 (INT-SIG), cloud hosting (INT-HEB), and outbound email (INT-EML). Detailed functional requirements remain carried by the module chapters (prd/modules/10-administration-onboarding-subscription.md to prd/modules/23-health-sensitive-data.md); this chapter sets, for each system: the objective, the data flows, the contractual model, external dependencies, risks, and the `INT-<SYS>-NN` requirements.

Rules applied throughout the chapter:

1. **Identifier names**: prefix `INT-<SYS>-NN`, a counter restarted at 01 for each system (conventions §2). New open questions carry the `OQ-NN` prefix, a counter local to this file.
2. **ZSchool never holds funds** (PROJECT.md §2.8, DEC-31): every payment integration is designed so the school remains the creditor and beneficiary of the funds, ZSchool being only a software vendor and technical provider.
3. **Figures and rates**: only publicly sourced rates from prd/research/03-payments-communications.md, prd/research/02-regulatory-data.md, and prd/research/05-infrastructure-usage.md are cited, or amounts settled in the baseline (DEC-28). No price is invented; missing data is tracked as a contractual dependency (H-19, H-20) and as an open question.
4. **Versions**: MVP / V1 / V2+ tags strictly follow PROJECT.md §12. Online payment is in V1 for the Fatourati rail and in V2 for registered-card payment (DEC-31, journey PC-08 of prd/journeys/00-journey-map.md); MVP use of WhatsApp utility is the sole deviation, driven by founder arbitration D1 and logged in OQ-03 (conventions §1.5).
5. **Compliance**: every flow leaving the territory (messaging, email) cross-references the compliance chapter prd/cross-cutting/36-legal-compliance-data-protection.md (Law 09.08, CNDP, the F118 form); this chapter does not duplicate the legal analysis.
6. **Baseline/research divergences** found during drafting: the corrected data is adopted and logged in "Open questions", labeled: OQ-01 (YouCan Pay closed — exclusion applied), OQ-02 (note 1887/13 uncorroborated), OQ-03 (WhatsApp version at MVP — founder arbitration D1), OQ-04 (Android/iOS shares = web traffic shares), OQ-05 (a second Settat region is planned, DR by data center site), OQ-09 (permanent UTC+0 timezone, cross-referenced to OQ-01 of prd/cross-cutting/32-non-functional-requirements.md); contractual and pricing dependencies are tracked in OQ-06 (Fatourati, H-19), OQ-07 (WhatsApp rate cards, H-20), and OQ-08 (PSCo selection, V2).

---

## 2. INT-MAS — Massar and ESISE (Ministry of National Education)

### 2.1 Objective and scope

Massar is the ministry's information system; every student carries a **Massar code** (one letter followed by nine digits), the preferred matching key for the student's identity in ZSchool, unique and not mandatory (PROJECT.md §2.6, DEC-04, INV-01). Massar **exposes no API** to software vendors (H-04, confirmed): the only documented channel is Excel file import and export from the grade-entry module. ZSchool's goal is to **reduce double data entry** for schools (BES-DIR-03) by producing files faithful to Massar's templates, never automating entry into Massar and never promising a sync.

Scope covers: exports of continuous-assessment grades by subject, class, and semester; validation checks before submission; importing results of certifying exams (6AP, 3AC, 1st Bac, 2nd Bac); mirroring ESISE data (private-school census, HR reference data, year-end results); logging Massar transfer references. Entry into Massar itself remains out of scope.

### 2.2 Data flows

1. **Grade export (outbound)**: when an assessment period closes (`PeriodClosed` event, prd/03-domain-data-model.md §7), the Massar chapter (prd/modules/21-massar-regulatory-exports.md) generates an Excel file per subject, class, and semester, structured like the Massar module's import file; the principal's office downloads it and manually uploads it into Massar. Research confirms that Massar entry works via download-then-re-import of Excel files generated by Massar, that the column structure is not publicly documented, and that re-import often fails even without any file change — hence the requirement for faithful generation and a check before submission (prd/research/04-pedagogy-massar-calendar.md §2).
2. **Import of certifying results (inbound)**: grades for external exams (6AP, 3AC, 1st and 2nd Bac) come from the ministry, not the school (PROJECT.md §2.5); the registrar's office or the principal's office imports the results file transmitted via Massar, with an error report, and the grades feed period results (`PeriodResult`) without ever overwriting locally entered data without validation.
3. **ESISE mirror**: the school's census data (headcount by level, HR reference data, year-end results) can be exported in the format required by the three ESISE applications viewable at sise.men.gov.ma (prd/research/04-pedagogy-massar-calendar.md §2; H-10).
4. **Transfer reference**: the Massar transfer procedure (a request via the parent portal on Massar, validated by provincial education offices) is external; ZSchool records the request's reference in `TransferRequest` and logs the transfer (prd/03-domain-data-model.md §2.2 and §3.2, INV-43).

### 2.3 Contractual model

No commercial contract: Massar is a public service used directly by the school, which remains responsible for its filings and the quality of its entries. ZSchool is a third-party vendor with no contractual relationship with the ministry; any move toward an official channel (API, partner program) would require the ministry's prior agreement before any automation (PROJECT.md §2.6). Massar file formats are de facto formats, with no public documentation: supporting them means faithfully reproducing the templates used by pilot schools.

### 2.4 External dependencies

- Massar's Excel import formats are not publicly documented and vary by cycle; validated by testing with the pilots (H-04, H-16).
- Note 1887/13 (the Massar grades module's framing document) is uncorroborated online (prd/research/00-baseline-corrections.md #4); requirements are worded without relying on the exact reference number (OQ-02).
- Availability and reliability of the ministry's Massar portal, outside ZSchool's control.
- ESISE: three "view-only" applications (private-school census, HR reference data, year-end results); exact forms to be gathered from the pilots (H-10).

### 2.5 Risks

- Fragile Massar re-import: a file that looks correct to a human can be rejected by Massar (format errors or corruption reported by teachers); mitigated by INT-MAS-02 (validation and reporting) and by tests on the pilots' real files.
- Silent evolution of file templates from one year or cycle to the next; mitigated by a structure check at every generation and monitoring at every start of year.
- Unmet "sync" expectations: competing software advertises syncs that rely on the same file channel or unofficial automations (PROJECT.md §2.6); ZSchool never promises a sync.
- Enumeration of Massar codes via search functions (PROJECT.md §9): protection covered by prd/cross-cutting/31-security-privacy.md, restated here as an integration constraint.

### 2.6 INT-MAS requirements

#### INT-MAS-01 — Generate Massar-compliant Excel grade exports

| Attribute | Value |
|---|---|
| Description | The system generates, per school, an Excel file per subject, class, and semester, faithfully reproducing the structure of the Massar grades module's import file (columns, order, value formats, dual-script names). The file is downloadable by the principal's office and the registrar's office once the period closes. No automation of the deposit into Massar is performed. |
| Priority | Must |
| Version | MVP (wave 2 — year-end close, JAL-06/JAL-07; ARB-01) |
| Traceability | PROJECT.md §2.6, §7.12; H-04; BES-DIR-03; ARB-01; prd/modules/21-massar-regulatory-exports.md (FR-MAS-03, FR-MAS-04) |
| Actors | Principal's office, Registrar's office |

```gherkin
Feature: Massar export of continuous-assessment grades
  Scenario: Exporting one subject for one class for the first semester
    Given a 3AC class whose math entries are all validated and the period is closed
    When the principal's office requests the Massar export for that subject, class, and semester
    Then an Excel file is generated with the current Massar template's structure, grades out of 20 with decimals, and identities in dual script
    And the file is logged as a regulatory data export with author, date, and scope
  Scenario: Period not closed
    Given an assessment period not closed for the targeted class
    When the principal's office requests the Massar export
    Then the system refuses to generate the file and lists the missing or unvalidated entries by subject
```

#### INT-MAS-02 — Validate every export before submission with an error report

| Attribute | Value |
|---|---|
| Description | Before any submission, the system checks the generated file: column structure matching the current template, value ranges (grades, coefficients), completeness per student and per subject, uniqueness of the Massar codes present, no corrupted values. A readable error report lists the rows involved and blocks generation of a non-compliant file. For the bilingual trimester school (DEC-35), the trimester-to-Massar-semester mapping is the one configured by the school (ARB-17h). |
| Priority | Must |
| Version | MVP (wave 2 — ARB-01) |
| Traceability | PROJECT.md §2.6; H-04; prd/research/04-pedagogy-massar-calendar.md §2 (fragile Massar re-import) |
| Actors | Principal's office, Registrar's office |

```gherkin
Feature: Validating a Massar export
  Scenario: An out-of-range grade is detected
    Given a grade entry above the scale's maximum for a student in the class
    When the Massar export is requested
    Then generation is blocked and the error report identifies the student, the subject, and the value at issue
  Scenario: A compliant file
    Given a file passing every structure and value check
    When validation runs
    Then the report confirms compliance and the file is marked validated for submission
```

#### INT-MAS-03 — Log transfers with their Massar reference

| Attribute | Value |
|---|---|
| Description | During a transfer (journey PC-09), the system records in `TransferRequest` the Massar transfer request's reference when the school knows it, logs the procedure (dates, documents, declared provincial validation), and keeps the audit trail on the origin enrollment's TRANSFERRED closure. The Massar procedure itself remains external to ZSchool. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §2.6, §7.9; prd/03-domain-data-model.md §2.2, §3.2, INV-43; prd/modules/18-transfers-mobility.md |
| Actors | Principal's office, Registrar's office |

#### INT-MAS-04 — Provide ESISE data mirrors

| Attribute | Value |
|---|---|
| Description | The system produces, for each school, the extracts needed for the three ESISE applications (private-school census, HR reference data, year-end results): headcount by level and class, teacher- and staff-affiliation data, year-end decisions. Exact forms are configured from the pilots and maintained per school year. |
| Priority | Should |
| Version | V1 |
| Traceability | PROJECT.md §2.6, §7.12; H-03, H-10; prd/research/04-pedagogy-massar-calendar.md §2; prd/modules/21-massar-regulatory-exports.md |
| Actors | Principal's office |

#### INT-MAS-05 — Import results of certifying exams

| Attribute | Value |
|---|---|
| Description | The system can import a file of external exam results (6AP, 3AC, 1st Bac, 2nd Bac) transmitted via Massar, with a consistency check (student matched by Massar code, grades within range) and an error report; imported grades feed the period results of the matching enrollment, are timestamped as originating from the ministry, and cannot overwrite local data without the principal's office's explicit confirmation. |
| Priority | Should |
| Version | V1 |
| Traceability | PROJECT.md §2.5, §7.12; prd/03-domain-data-model.md §2.4 (`PeriodResult`); prd/modules/21-massar-regulatory-exports.md |
| Actors | Principal's office, Registrar's office |

```gherkin
Feature: Importing certifying-exam results
  Scenario: 3AC results imported
    Given an official results file covering students identified by their Massar code
    When the registrar's office imports the file
    Then each grade is attached to the matching enrollment, marked as originating from the ministry, with an import date
    And unmatched students appear in an exceptions report with no impact on the other rows
  Scenario: Unknown Massar code
    Given a row in the file carrying a Massar code absent from the school
    When the import runs
    Then the row is rejected in the error report and no grade is created for that row
```

#### INT-MAS-06 — Forbid any entry automation into Massar without an official channel

| Attribute | Value |
|---|---|
| Description | The system implements no automation of entry into Massar (bots, portal injection, workarounds) as long as the ministry offers no official channel. Any change to baseline H-04 (an API or partner program opening) triggers a review of this chapter before any development. Product communications speak of "exports compliant with Massar templates", never of "sync". |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §2.6 (H-04 confirmed); DEC-04; prd/modules/21-massar-regulatory-exports.md |
| Actors | Platform (ZSchool) |

---

## 3. INT-FAT — Fatourati (CMI), the school-fee payment rail

### 3.1 Objective and scope

Fatourati is the CMI's interbank bill-payment network: 32 interconnected banks and payment institutions, over 70 digital and physical channels, over 25,000 cash-collection points; over 240 million transactions and over 220 billion dirhams collected across the whole system (prd/research/03-payments-communications.md §1). Schools are an explicit target creditor segment for the system. The **Fatourati Aggregator** offer, launched on **02/17/2026**, lets a software vendor connect its own customers: API-based reference and QR generation, payment tracking; the vendor "is involved in neither fund management nor the regulatory framework", and **the school remains the creditor and beneficiary of the funds** (prd/research/03-payments-communications.md §1; prd/research/00-baseline-corrections.md #8).

ZSchool's goal: offer **Fatourati collections from V1 onward** as the primary rail (DEC-31, journey PC-08), with the parent paying from their banking app, an ATM, a mobile wallet, a branch, or a cash point, with automatic reconciliation into the school's finances. Scope covers the Aggregator partnership (API), Collect mode for self-service schools, daily anti-duplicate reconciliation, and accounting integration of payments. DGI e-invoicing is a separate system, unrelated to this rail (INT-FAT-06).

### 3.2 Data flows

1. **Activation (configuration)**: the school is registered as a creditor with the system via ZSchool's Aggregator partnership; its creditor details (an identifier, a beneficiary account managed under the school's CMI contract) are recorded in the tenant.
2. **Bill generation (outbound, REST API)**: for each due installment (`Installment`), ZSchool produces a unique bill reference (per enrollment and per financial guardian) and a Fatourati QR code; the parent finds the reference in their portal and on the reminder notice. The reference integration (Eduka) shows the pattern: real-time debt lookup by Fatourati, payment confirmation, automatic recording (prd/research/03-payments-communications.md §1).
3. **Real-time lookup (inbound)**: when a parent enters the reference on any channel, Fatourati queries ZSchool for the amount due; ZSchool responds from `Invoice`/`Installment` without holding any funds.
4. **Payment confirmation (inbound)**: upon collection, Fatourati confirms the payment; ZSchool automatically creates the `Payment` with mode "Fatourati", allocates it to the installment (reconciliation against 0..N installments), issues the receipt, and fires the `PaymentReceived` event (prd/03-domain-data-model.md §2.5 and §7).
5. **Daily reconciliation (inbound)**: a daily reconciliation file or call lists the previous day's payments; any discrepancy with received confirmations is flagged, any duplicate is rejected (the Eduka model, prd/research/03-payments-communications.md §1).
6. **Collect mode**: for a school not using the API, the school uses the Fatourati Collect web app on its own; payments are entered or imported into ZSchool by the registrar's office with supporting documentation, with no automatic confirmation.

### 3.3 Contractual model

Access via a "single contract": the CMI manages the relationship with banks and payment institutions, with the school as the final creditor (prd/research/03-payments-communications.md §1). Under the Aggregator model, ZSchool is the vendor connected to the CMI by contract; each client school joins the system as a creditor, with no bank contract of its own with each channel. ZSchool is involved in neither fund management nor the regulatory framework. **Pricing and the contract's content (schools, Aggregator, Collect) are not public and remain to be obtained (H-19)**: until obtained, no cost commitment is built into the business model (cross-reference prd/cross-cutting/33-business-model-packaging.md, DEC-28). Industry precedent: a CMI partnership with BOTI SCHOOL in May 2025; verified schools using the rail (OSUI/LFI Louis-Massignon, Lyautey, Victor Hugo) listed on fatourati.ma (prd/research/03-payments-communications.md §1).

### 3.4 External dependencies

- Signing the Aggregator partnership with the CMI (sales contact provided by the CMI: sales.fatourati@cmi.co.ma, prd/research/03-payments-communications.md §1) and obtaining API specifications and the contract (H-19): **contracting deadline of 06/30/2027** (go/no-go, one year before V1); failing that, V1 starts in Collect mode (INT-FAT-04) with a bill reference generated by the school, and the Aggregator API is deferred (dependency D-xx of prd/cross-cutting/37-roadmap-mvp-v1-v2.md; risk in prd/cross-cutting/39-risks-mitigations.md).
- Each school joining as a creditor and validating its creditor details.
- Availability of the real-time lookup API and the daily reconciliation feed, with no publicly known SLA to date (H-19).
- Fatourati QR: bill payment by QR code presented at GITEX Africa in April 2026 (prd/research/03-payments-communications.md §1); general availability to be confirmed.

### 3.5 Risks

- Reliance on a single player (the CMI) for the primary collection rail; mitigated by keeping every manual method (cash, cheque, bank transfer) and direct debit via the school's own bank (DEC-31).
- Delayed publication of rates and the contract (H-19): a risk to consumables margin and sales messaging; handled in OQ-06 and in prd/cross-cutting/39-risks-mitigations.md.
- Duplicate payments (simultaneous payment via two channels, re-entry after a cash point): mitigated by a unique reference per installment and duplicate rejection during daily reconciliation (INT-FAT-03).
- Confusion between CMI's Fatourati (bill payment) and the DGI's e-invoicing platform (H-17): handled by INT-FAT-06 and prd/cross-cutting/36-legal-compliance-data-protection.md.
- Arrears and documents: the payment rail introduces no blocking of official documents (DEC-24, INV-39).

### 3.6 INT-FAT requirements

#### INT-FAT-01 — Generate bill references and Fatourati QR codes via the Aggregator API

| Attribute | Value |
|---|---|
| Description | For every subscribed school and every installment due, the system generates via the Aggregator partnership's API a unique bill reference and a Fatourati QR code, attached to the enrollment and the financial guardian. The reference is visible to the parent (portal, reminder notifications) and at the school's front desk. A reference covers only one installment or an expressly selected balance, never an open amount. **Go/no-go**: the Aggregator contract (pricing, specifications, SLA) must be signed by 06/30/2027 at the latest; past that date, V1 ships with Collect mode (INT-FAT-04) as a fallback rail, with the API requirement remaining on the roadmap. |
| Priority | Must |
| Version | V1 (contingent on the Aggregator contract by 06/30/2027; Collect fallback) |
| Traceability | PROJECT.md §2.8, DEC-31; H-19; journey PC-08 (prd/journeys/00-journey-map.md); prd/modules/16-finance-billing-collections.md |
| Actors | Registrar's office, Accounting, Parent (payer), Platform (ZSchool) |

#### INT-FAT-02 — Answer debt lookups in real time and record payment confirmations

| Attribute | Value |
|---|---|
| Description | When Fatourati queries a reference, the system responds in real time with the amount due and the creditor details from the school's billing. Upon receiving a payment confirmation, it automatically creates the payment with mode "Fatourati", allocates it to the relevant installment, issues the receipt, and notifies the parent (`PaymentReceived`), with no manual front-desk action. **Inbound availability and degraded mode**: the lookup endpoint exposed to Fatourati targets 99.9% monthly availability, is excluded from maintenance windows (NFR-DISP-02: other services may be under maintenance, not this one), and is served by an isolated component; as a fallback, ZSchool deposits with Fatourati each night the state of open bills ("deposited bills" mode), which serves parents when the real-time lookup fails; payments received against a deposited bill are reconciled by INT-FAT-03 and flagged "to reconcile" until confirmed. A parent must never be prevented from paying by a ZSchool outage. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §2.8, §7.7, DEC-31; prd/03-domain-data-model.md §2.5, §7; BES-PAR-03; prd/modules/16-finance-billing-collections.md; NFR-DISP-01, NFR-DISP-02 |
| Actors | Platform (ZSchool), Parent (payer), Registrar's office |

```gherkin
Feature: Paying an installment via a Fatourati channel
  Scenario: Payment confirmed at a cash agent
    Given a March installment of 800 MAD with an active Fatourati reference for enrollment E-123
    When Fatourati confirms payment of the reference for an amount of 800 MAD
    Then a Fatourati payment of 800 MAD is created and allocated to the installment
    And a receipt is issued, the parent is notified, and the financial account balance is updated
  Scenario: Confirmed amount differs from the amount due
    Given a confirmation carrying an amount lower than the reference's amount due
    When the confirmation is received
    Then the payment is recorded at the amount actually paid, flagged as a discrepancy at the front desk, and the installment remains partially unpaid
  Scenario: Real-time lookup unavailable
    Given a ZSchool lookup-endpoint outage during a maintenance window
    When a parent enters their reference in their banking app
    Then Fatourati serves the amount due from the state of bills deposited the previous night
    And the payment is received by ZSchool upon recovery and reconciled with the "to reconcile" flag
```

#### INT-FAT-03 — Reconcile daily and reject duplicates

| Attribute | Value |
|---|---|
| Description | Each day, the system reconciles confirmed payments with the Fatourati reconciliation report, rejects any duplicate (a reference already reconciled), and produces a discrepancy statement for the school's accounting (payments not found, confirmations with no payment, mismatched amounts) that can be handled at the front desk. No payment can be counted twice against the same reference. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §2.8, §7.7; prd/research/03-payments-communications.md §1 (daily reconciliation, duplicate rejection, the Eduka model); prd/modules/16-finance-billing-collections.md |
| Actors | Accounting, Registrar's office, Platform (ZSchool) |

```gherkin
Feature: Daily Fatourati reconciliation
  Scenario: A duplicate is rejected
    Given a reference already reconciled the previous day appearing again in today's report
    When daily reconciliation runs
    Then the row is rejected as a duplicate, listed in the discrepancy statement, and no second payment is created
  Scenario: A report payment absent from confirmations
    Given a row in the daily report with no prior confirmation received
    When reconciliation runs
    Then the row is placed in a discrepancy queue for front-desk verification with no automatic entry
```

#### INT-FAT-04 — Offer Collect mode for self-service schools

| Attribute | Value |
|---|---|
| Description | For a school not using the API model, the system supports Fatourati Collect mode: the school manages its bills in the Collect app and declares payments collected in ZSchool (manual entry or import of a payments statement) with supporting documentation. Declared payments are distinguished from API-confirmed payments and produce no automatic confirmation. |
| Priority | Should |
| Version | V1 |
| Traceability | PROJECT.md §2.8, DEC-31; prd/research/03-payments-communications.md §1 (Fatourati Collect, a plug-and-play web app) |
| Actors | Registrar's office, Accounting |

#### INT-FAT-05 — Guarantee the school remains the creditor and ZSchool holds no funds

| Attribute | Value |
|---|---|
| Description | In every Fatourati flow, funds are collected within the CMI system for the benefit of the creditor school; ZSchool holds, moves, or transfers no funds and stores no parent bank-account data. Data processed is limited to bill references, amounts, statuses, and reconciliation information. Any contractual change that would route funds through ZSchool is prohibited without a payment-institution license, a hypothesis off the roadmap. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §2.8 (ZSchool never holds funds), DEC-31; prd/research/03-payments-communications.md §1; prd/cross-cutting/36-legal-compliance-data-protection.md |
| Actors | Platform (ZSchool), Principal's office |

#### INT-FAT-06 — Distinguish the CMI Fatourati rail from DGI e-invoicing

| Attribute | Value |
|---|---|
| Description | The system explicitly distinguishes, in the data model and in labels, the CMI's Fatourati bill-payment rail (this chapter) from DGI e-invoicing (CGI art. 145-IX, a clearance model, UBL format, decree not published as of mid-2026, H-17). UBL export preparation and the regulatory timeline fall to the finance module and the compliance chapter; no payment requirement depends on the DGI decree. Most schools billing individual parents (B2C) are outside the reform's initial scope. |
| Priority | Should |
| Version | V2+ |
| Traceability | PROJECT.md §2.7 (H-08, H-17); prd/research/02-regulatory-data.md §1 and prd/research/00-baseline-corrections.md #15; prd/cross-cutting/36-legal-compliance-data-protection.md; prd/modules/16-finance-billing-collections.md |
| Actors | Platform (ZSchool), Accounting |

---

## 4. INT-CAR — Registered card payment (NAPS, Chari Pay, bank-affiliated acquirers)

### 4.1 Objective and scope

In V2 (DEC-31), ZSchool enables **paying installments by registered card** (Card-On-File / tokenized recurring payment). The acquiring landscape as of 09/09/2026: the CMI is no longer a commercial acquirer but a **national switch**; since 05/01/2025 acquiring is handled by banks and payment institutions, with the transfer of some 55,000 CMI merchant contracts to 7 bank-affiliated acquirers (Attijari Payment, M2T, Damane Cash, Lana Cash, Al Filahi Cash, Saham Paiements, CDM Pay) finalized on 01/31/2026; independent players NAPS, Barid Cash, and VPS also operate (prd/research/03-payments-communications.md §2). **YouCan Pay ceased operations in January 2024** without a Bank Al-Maghrib license and is excluded from references (prd/research/00-baseline-corrections.md #7). Stripe is not available for Moroccan entities.

Goal: connect ZSchool to the acquirer chosen by each school for card-based recurring payments, as a **technical provider**, never holding funds. Scope covers card tokenization at the acquirer, triggering installment payments, the recurring debit mandate, disbursements (including split payments for groups), and compliance safeguards.

### 4.2 Data flows

1. **Subscription (outside ZSchool)**: the school subscribes to its own card-acceptance contract with an acquirer — NAPS (its e-Premium offer: 1.98% excl. VAT domestic, 3% international, onboarding fee 29,900 MAD excl. VAT, an annual subscription of 5,900 MAD/year waived the first year, Card-On-File and installment payment included) or Chari Pay (recurring and one-click tokenization, real-time split payments, 3DS 2.0, tiered pricing "from 1.8%", no fixed fees) or a bank-affiliated acquirer from the CMI transfer (prd/research/03-payments-communications.md §2). Rates are those published by vendors as of the PRD's date.
2. **Parent enrollment (inbound/outbound)**: from the parent portal, the payer consents to a recurring-payment mandate; the card is tokenized directly at the acquirer (3DS 2.0 where applicable); ZSchool retains only the token identifier, the masked issuer, and the mandate status — never card data.
3. **Triggering at the due date (outbound)**: on the due date, ZSchool sends the acquirer's API a payment request for the amount due in the school's name; confirmation creates the `Payment` with mode "card", the receipt, and the `PaymentReceived` notification; a failure triggers the existing graduated reminder (`InstallmentOverdue`).
4. **Disbursements**: funds are settled directly by the acquirer into the school's account; for multi-site groups, splitting between beneficiaries uses the acquirer's split payments (Chari Pay offers real-time splitting; no public evidence of multi-school disbursement was found for Payzone, which is excluded as a disbursement rail and reclassified as simple per-school card acceptance — prd/research/03-payments-communications.md §1 and §2).
5. **Reconciliation**: daily transaction and settlement reports from the acquirer are reconciled with recorded payments, per the same anti-duplicate principle as INT-FAT-03.

### 4.3 Contractual model

**The acquiring contract is taken out by the school**; ZSchool is a technical provider (integration, triggering, tracking) and, at most, an agent that holds no funds: a platform holding parents' funds would need a Bank Al-Maghrib payment-institution license, a hypothesis ruled out by the baseline (PROJECT.md §2.8). White-label and agent models are subject to Bank Al-Maghrib's principal-agent status (Chari's case, prd/research/03-payments-communications.md §2). For reference, domestic interchange has been capped at 0.65% since October 2024 (prd/research/03-payments-communications.md §2). ZSchool signs no contract on behalf of schools and takes no margin on acquiring fees; any potential ZSchool involvement in collecting commissions is covered in prd/cross-cutting/33-business-model-packaging.md.

### 4.4 External dependencies

- Each school's own acquiring contract (NAPS, Chari Pay, or a bank-affiliated acquirer); ZSchool depends on the chosen acquirer opening a merchant API and on tokenization documentation.
- Chari Pay: direct acquiring planned for late 2026 pending Bank Al-Maghrib approval (prd/research/03-payments-communications.md §2); timeline to confirm.
- 3DS 2.0 compliance and strong issuer authentication rules for recurring payments.
- Evolution of NAPS/Chari rate grids (published as of the PRD's date): any change is absorbed as external data, never recalculated by ZSchool.

### 4.5 Risks

- Fragmented integrations: each acquirer has its own API; mitigated by a single internal adapter layer and a targeted small number of V2 connectors.
- Card cost (1.8 to 3%) higher than the Fatourati rail: card payment's role is automating recurrence, not replacing the bank rail; product messaging presents Fatourati as the primary rail (DEC-31).
- Consumer disputes and payment reversals (chargebacks): a dispute procedure to document with each acquirer; ZSchool logs requests and evidence without arbitrating.
- Resurgence of unlicensed players (the case of YouCan Pay, closed in January 2024): safeguard INT-CAR-05.
- Card data: ZSchool stores none; PCI scope falls to the acquirer and hosted enrollment, a constraint covered in prd/cross-cutting/31-security-privacy.md.

### 4.6 INT-CAR requirements

#### INT-CAR-01 — Connect to the school's acquirer for tokenization and recurring payment

| Attribute | Value |
|---|---|
| Description | The system integrates with the API of the acquirer configured by the school (NAPS e-Premium, Chari Pay, or a bank-affiliated acquirer) for: hosted mandate enrollment (card tokenization at the acquirer, 3DS 2.0 authentication where applicable), viewing the mandate status, and triggering installment payments. ZSchool stores no card data, only the token, the masked last four digits, and the status. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §2.8, DEC-31; prd/research/03-payments-communications.md §2; prd/cross-cutting/31-security-privacy.md |
| Actors | Parent (payer), Accounting, Platform (ZSchool) |

```gherkin
Feature: Automatic payment of an installment by registered card
  Scenario: Successful debit
    Given an active recurring-payment mandate linked to an enrollment's financial guardian
    And an 800 MAD installment due today
    When the payment request is sent to the acquirer and confirmed
    Then an 800 MAD card payment is created, allocated to the installment, with a receipt and a notification to the parent
  Scenario: Debit declined by the issuer
    Given a payment request declined by the card issuer
    When the decline is received
    Then no payment is created, the installment remains unpaid, and the existing graduated reminder applies with the failure reason logged
```

#### INT-CAR-02 — Keep the acquiring contract in the school's name with ZSchool as technical provider

| Attribute | Value |
|---|---|
| Description | Activating card payment requires the school to provide proof of its card-acceptance contract with the acquirer; ZSchool configures the integration in the school's name and on its behalf, never holding funds or signing a commercial contract in its own name. Settlement details (the school's IBAN) are entered only at the acquirer. Terminating the school's contract suspends triggering without affecting financial history. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §2.8 (ZSchool never holds funds), DEC-31; prd/research/03-payments-communications.md §2 |
| Actors | Principal's office, Platform (ZSchool) |

#### INT-CAR-03 — Manage the recurring-payment mandate lifecycle

| Attribute | Value |
|---|---|
| Description | The payer consents to, modifies, suspends, or revokes their mandate from the parent portal; every action is timestamped and logged. Revocation halts future triggers without cancelling payments already reconciled. The school can view the status of its payers' mandates and resend the enrollment invitation, never seeing card data. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §7.7; BES-PAR-07; prd/03-domain-data-model.md §2.5 (`Payment`) |
| Actors | Parent (payer), Registrar's office, Accounting |

#### INT-CAR-04 — Split a group's multi-beneficiary disbursements via the acquirer's split payments

| Attribute | Value |
|---|---|
| Description | When a school group operates several schools with distinct settlement accounts, splitting funds between beneficiaries is handled by the acquirer's split payments (documented to date for Chari Pay, prd/research/03-payments-communications.md §2); ZSchool transmits the bill split between tenants and keeps a per-school audit trail. No disbursement is performed by ZSchool. |
| Priority | Could |
| Version | V2+ |
| Traceability | PROJECT.md §2.11 (multi-site groups), DEC-02; prd/research/03-payments-communications.md §1 (Payzone excluded as a disbursement rail) |
| Actors | Principal's office (group), Accounting, Platform (ZSchool) |

#### INT-CAR-05 — Exclude non-compliant payment rails

| Attribute | Value |
|---|---|
| Description | The system integrates, at no version, an acquiring or intermediation provider with no current Bank Al-Maghrib license: YouCan Pay (operations ceased in January 2024, prd/research/00-baseline-corrections.md #7) is the reference example; Stripe and PayPal, which do not cover Moroccan merchant collection, are not adopted. Payzone is not adopted as a multi-school disbursement rail (no public evidence), at most as card acceptance under a school's own contract. Any new rail proposal is set aside until its license and fund-flow model are verified. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §2.8; prd/research/00-baseline-corrections.md #7; prd/research/03-payments-communications.md §1-§2 |
| Actors | Platform (ZSchool) |

#### INT-CAR-06 — Reconcile card transactions daily with the school's finances

| Attribute | Value |
|---|---|
| Description | Each day, the system reconciles card transactions (successful, declined, refunded) with recorded payments and the acquirer's reports, rejects duplicates, and produces a discrepancy statement for accounting, per the same principles as INT-FAT-03. The school's account settlements are tracked as reconciliation information, with no fund movement through ZSchool. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §7.7; prd/modules/16-finance-billing-collections.md |
| Actors | Accounting |

---

## 5. INT-SMS — Moroccan SMS aggregator

### 5.1 Objective and scope

SMS is the **universal** notification channel at MVP: attendance, reminders, announcements (PROJECT.md §12 MVP, DEC-12, DEC-28); it remains the critical fallback channel for households without a smartphone or in poorly covered areas (household internet access: 93.6% urban versus 78.4% rural, ANRT 2024-2025, prd/research/05-infrastructure-usage.md §2). Goal: operate a **Moroccan SMS aggregator** via a platform account, with an **alphanumeric sender ID** per school for transactional messages, per-tenant credit accounting, and exclusion of the LowCost regime (out of scope for packs, a V2+ evolution to be studied separately — INT-SMS-04 and `prd/cross-cutting/33-business-model-packaging.md` §5.1). Scope covers transactional sending, delivery and cost tracking (`DeliveryLog`), resold prepaid packs (DEC-28), and opt-in and opposition rules; per-message-type routing rules fall to the communication module (prd/modules/17-communication-notifications.md).

### 5.2 Data flows

1. **Sending (outbound)**: a notifiable event (e.g. `AbsenceRecorded`, `ReminderSent`, `ReportCardPublished`) produces an SMS-channel `Notification`; the system transmits to the aggregator the recipient's number, the content (limited by segment size), the school's alias, and a correlation reference.
2. **Statuses and costs (inbound)**: send and delivery (and failure) receipts feed `DeliveryLog` with the unit cost charged by the aggregator, allocated to the school (prd/03-domain-data-model.md §2.6).
3. **Credits and packs**: every school has a credit counter funded by purchasing prepaid packs (resold by ZSchool at a Moroccan aggregator's rate, 0.30 to 0.50 MAD per SMS with margin, DEC-28); counters feed `UsageMetric` for consumables billing (PROJECT.md §11). Authentication SMS (OTP, MFA, invitations, claims) is sent from a separate platform account, borne by ZSchool, and never deducted from a school's credits (PAK-17, ARB-21h); an SMS to a foreign number (ARB-07) travels through an international gateway, entered in the vendor register (SEC-18), at actual cost allocated per FR-COM-08.
4. **Channel hierarchy**: SMS operates per the DEC-36 hierarchy (push first, WhatsApp utility for consenting parents, SMS as a fallback), with routing rules carried by the communication module.

### 5.3 Contractual model

Reference market as of 09/09/2026 (prd/research/03-payments-communications.md §5): Moroccan aggregators operate on a **prepaid self-service** basis for the school (credits with no expiry). Two sending regimes: the **alphanumeric alias** (11 characters, "premium" routing) priced around 0.31 to 0.36 DH depending on volume (5,000 to 100,000 SMS at bulksms.ma); the **LowCost** regime (a variable mobile-number sender) priced around 0.05 to 0.10 DH but unsuited to identified transactional use. Other references found: bulksmsmaroc.com (290 DH for 1,000), marocdata (0.44 to 0.54 DH), BulkGate (€0.1024, sender-ID approval in one to two weeks). ZSchool subscribes to the aggregator account in its own name (a single multi-tenant platform account) and **resells packs to schools** (DEC-28); no formal reseller program is published by aggregators (prd/research/03-payments-communications.md §5). The final choice of aggregator (rates, API, coverage) is an execution decision made after the PRD, with no impact on the requirements below.

### 5.4 External dependencies

- A Moroccan aggregator's contract and API (routing, delivery receipts, send and status API).
- Approval of each school's alphanumeric alias with carriers (a one-to-two-week delay observed at some aggregators, prd/research/03-payments-communications.md §5).
- The Law 09.08 framework and 2019 CNDP-ANRT guidance: opt-in and opposition for marketing; transactional messages are outside marketing scope but the number database must be declared (the exact enforceable text was not found, prd/research/03-payments-communications.md §5); cross-referenced to prd/cross-cutting/36-legal-compliance-data-protection.md.

### 5.5 Risks

- Single-aggregator service disruption: mitigated by abstracting the vendor in the sending code (one connector at a time, a single interface) and by the channel hierarchy (push and WhatsApp cover most parents).
- Cost drift (bulk SMS at the start of the year and at report-card publication, prd/journeys/00-journey-map.md §4.2): counters and threshold alerts per school (INT-SMS-03).
- Poor sender identification (messages rejected or ignored): a dedicated alias per school and a ban on LowCost for transactional messages (INT-SMS-04).
- Drift into marketing use: ZSchool's SMS channel is strictly transactional; marketing is out of the platform's scope (opt-in and opposition managed per the CNDP-ANRT framework).

### 5.6 INT-SMS requirements

#### INT-SMS-01 — Send transactional SMS via a Moroccan aggregator with a per-school alias

| Attribute | Value |
|---|---|
| Description | The system sends SMS notifications via an account on a Moroccan aggregator, with an alphanumeric alias identifying the sending school (a short name, approved by carriers). Every send carries a correlation reference to the originating `Notification`. Sending is available from MVP onward for attendance and communication notifications (PROJECT.md §12). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §12 (MVP), DEC-12, DEC-26, DEC-36; BES-SUR-02, BES-PAR-02; prd/modules/17-communication-notifications.md |
| Actors | Platform (ZSchool), all notification-sending roles |

```gherkin
Feature: Absence notification by SMS
  Scenario: Sent after attendance is confirmed
    Given confirmed attendance recording a student's absence, with the guardian having a mobile number on file
    And the school's rules calling for immediate SMS notification
    When the notification is sent
    Then the SMS is transmitted to the aggregator within five minutes of confirmation, with the school's alias
    And the delivery log records the send status, delivery, and the cost allocated to the school
  Scenario: Invalid number
    Given a phone number rejected by the aggregator
    When the failure is returned
    Then the delivery log carries the failure reason and the school sees the contact-details issue on the record
```

#### INT-SMS-02 — Track status and cost for every SMS in the delivery log

| Attribute | Value |
|---|---|
| Description | Every SMS produces a `DeliveryLog` entry: channel, statuses (sent, delivered, failed with a carrier reason), unit cost charged, and the school allocated. Consolidated costs feed `UsageMetric` and the school's credit-balance view. Bulk sends (announcements, reminders) are counted as a single viewable batch. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §11, DEC-28; prd/03-domain-data-model.md §2.6 (`DeliveryLog`, `UsageMetric`); prd/modules/17-communication-notifications.md |
| Actors | Principal's office, Registrar's office, Platform (ZSchool) |

#### INT-SMS-03 — Manage prepaid packs, credit counters, and threshold alerts per school

| Attribute | Value |
|---|---|
| Description | Every school has an SMS credit counter funded by purchasing packs (resale price within the DEC-28 range: 0.30 to 0.50 MAD per SMS). The system blocks non-critical sends beyond the balance (except a configurable emergency queue), warns at configurable thresholds (default: 20% and 10% of the last pack), and logs purchases and consumption. The remaining credit is visible to the principal's office and the registrar's office. Authentication SMS never draws on this credit (PAK-17). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §11, §12, DEC-28; prd/cross-cutting/33-business-model-packaging.md (PAK-17); prd/03-domain-data-model.md §2.7 (`UsageMetric`) |
| Actors | Principal's office, Registrar's office, Platform (ZSchool) |

```gherkin
Feature: SMS credit balance depletion
  Scenario: Alert threshold reached
    Given a credit balance falling below the configured alert threshold
    When consumption is recorded
    Then the principal's office and the registrar's office receive a threshold-alert notification
  Scenario: Balance depleted
    Given a zero credit balance
    When a non-critical notification is sent
    Then the SMS send is held pending, other channels in the hierarchy keep serving the message, and the event is logged
```

#### INT-SMS-04 — Reserve the alias for transactional messages and exclude LowCost

| Attribute | Value |
|---|---|
| Description | Every transactional message (absence, reminder, receipt, report card, notice) is sent under the school's alphanumeric alias (premium routing); the LowCost regime (a variable mobile-number sender, priced around 0.05 to 0.10 DH, prd/research/03-payments-communications.md §5) is not used at any shipped version, with the ban on transactional use active from the MVP's first send. It is out of scope for packs (`prd/cross-cutting/33-business-model-packaging.md` §5.1); a possible use for non-critical bulk alerts expressly authorized by the school — a clear school identification in the message body, banned for any message naming a student or a payment — would be a separate V2+ evolution to study, out of scope for this requirement. |
| Priority | Should |
| Version | MVP (transactional ban) |
| Traceability | PROJECT.md §12, DEC-36; prd/research/03-payments-communications.md §5; `prd/cross-cutting/33-business-model-packaging.md` §5.1 (LowCost out of packs, V2+ evolution) |
| Actors | Principal's office, Platform (ZSchool) |

#### INT-SMS-05 — Apply opt-in and opposition on SMS sends

| Attribute | Value |
|---|---|
| Description | ZSchool's SMS messages are transactional (performing the schooling contractual relationship); any marketing use is excluded. The system handles opposition: a stop request on a number suspends non-mandatory SMS sends to that recipient for the school concerned, without cutting mandatory security notifications, and logs the request. The number database is covered by the school's CNDP declarations (a template provided by ZSchool), per the compliance chapter. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §2.7 (Law 09.08), §9; prd/research/03-payments-communications.md §5 (CNDP-ANRT 2019); prd/cross-cutting/36-legal-compliance-data-protection.md |
| Actors | Parent, Principal's office, Platform (ZSchool) |

---

## 6. INT-WAP — WhatsApp Business Platform

### 6.1 Objective and scope

WhatsApp is the dominant communication channel toward parents: 98.6% of Moroccan social-media users use it (ANRT 2024-2025, prd/research/05-infrastructure-usage.md §2). DEC-36 sets the hierarchy: push first, **WhatsApp "utility" for consenting parents**, SMS as a fallback. Integration goes through the **WhatsApp Business Platform** (Meta's Cloud API or an official BSP); unofficial APIs are banned by the terms of service and forbidden; no local carrier (IAM, Orange, inwi) is a BSP; no self-hosting (prd/research/03-payments-communications.md §4). Scope covers: platform access (direct Cloud API or a BSP such as 360dialog, Twilio, Infobip, Gupshup, CM.com), Meta Business verification, utility templates and their approval, opt-in and opposition, and the 10/01/2026 pricing switch. Versions (founder arbitration D1, OQ-03): at MVP, minimal WhatsApp utility use limited to attendance notifications (one or two templates); in V1, generalized to all messages, template management, and push. Pricing has been **per-message since 07/01/2025**; on **10/01/2026**, free service and utility messages within the 24-hour window end, and Morocco exits "Rest of Africa" regional rates for a standalone rate card (higher utility and authentication, authentication-international), grids announced before 09/01/2026 (prd/research/03-payments-communications.md §4; prd/research/00-baseline-corrections.md #6; H-20).

### 6.2 Data flows

1. **Onboarding (configuration)**: creating and verifying ZSchool's Meta Business account, attaching a **single platform WABA number at MVP** (INT-WAP-07, ARB-21g), with the school identified in every message's body; a per-school number and display name in V1 as an option (the school's own Meta Business verification); choosing the access mode (direct Cloud API with Meta billing, or a BSP with contract billing).
2. **Templates (outbound/inbound)**: utility templates (absence, payment reminder, report-card publication, notice) are submitted for Meta's approval (delays observed from minutes to hours); they must stay transactional or risk reclassification as marketing (costlier); usage-based re-categorization is monitored.
3. **Sending (outbound)**: a notifiable event produces a WhatsApp-channel `Notification`; the system sends the template with its variables to the opted-in recipient's number, with a correlation reference to the notification; statuses (sent, delivered, read, failed) feed `DeliveryLog` with the message cost.
4. **Inbound replies**: parent replies open a 24-hour window; from 10/01/2026 onward, inbound and service messages are also billed (the end of free messages within the window); replies are not routed into moderated parent–teacher threads (DEC-34): they receive an automatic bilingual receipt pointing to the app and are transmitted to the relevant school's student-life team in an inbound-message queue (INT-WAP-07); WABA numbers are not unlimited free-conversation channels.
5. **Opt-in and opposition**: WhatsApp consent is collected per guardian and per school, with an explicit statement that contact data is transferred outside Morocco (Meta servers), and serves as the transfer basis at MVP (ARB-25c; the F118 request filed in parallel, CNF-25); it is revocable at any time (a STOP-type opposition, whose scope is limited to reminders and announcements, ARB-21d); the number database is covered by the school's CNDP declarations (cross-reference prd/cross-cutting/36-legal-compliance-data-protection.md).

### 6.3 Contractual model

Two access models, to be settled at execution (OQ-07 for the pricing grid): **direct Cloud API** (free access, Meta billing by volume, business-account setup borne by ZSchool) or an **official BSP** accessible from Morocco (360dialog at a flat rate of roughly $59/month per its published pricing, Twilio, Infobip, Gupshup, CM.com) (prd/research/03-payments-communications.md §4). Current order-of-magnitude rates to +212: utility around €0.0064 per message (roughly eight times cheaper than an alias SMS at 0.31-0.36 DH), marketing around €0.0357; a Moroccan vendor advertises around 0.55 MAD per message all-inclusive (prd/research/03-payments-communications.md §4) — all outdated after the 10/01/2026 switch (H-20). WhatsApp consumption is resold to schools like SMS (consumables, DEC-28, prd/cross-cutting/33-business-model-packaging.md). ZSchool operates the platform account; the school's display name follows Meta's rules.

### 6.4 External dependencies

- ZSchool's Meta Business verification, approval of the single WABA number and templates: external delays to build into the launch schedule — required from MVP onward for the utility-attendance scope (arbitration D1, OQ-03); milestone "WABA verified and templates approved" before 01/15/2027 (prd/cross-cutting/37-roadmap-mvp-v1-v2.md).
- Publication of Morocco's standalone rate cards (announced before 09/01/2026; to verify and configure, H-20, OQ-07).
- BSP: availability, support, and MAD billing to confirm depending on the vendor.
- The Law 09.08 framework and 2019 CNDP-ANRT guidance for opt-in and opposition (prd/research/03-payments-communications.md §4).

### 6.5 Risks

- 10/01/2026 pricing switch: higher cost for utility and service messages and billing for messages within the 24-hour window; the consumables business model must also budget for inbound replies (DEC-36, H-20).
- A template reclassified as marketing (content deemed promotional): multiplied costs; mitigated by template review and re-categorization monitoring.
- Number or Meta account suspension (reports, non-compliant templates): mitigated by strict adherence to Meta's rules, utility-only use, and the SMS fallback of the DEC-36 hierarchy.
- Single-BSP dependency: abstracting the sending vendor on ZSchool's side.
- Expectations of free conversation: product framing (transactional notifications; moderated in-app threads, DEC-34).

### 6.6 INT-WAP requirements

#### INT-WAP-01 — Access the WhatsApp Business Platform via direct Cloud API or an official BSP after Meta Business verification

| Attribute | Value |
|---|---|
| Description | The system sends WhatsApp notifications exclusively via the official WhatsApp Business Platform (Meta's Cloud API or an official BSP such as 360dialog, Twilio, Infobip, Gupshup, or CM.com), after Meta Business verification and number approval. No unofficial API is used. The direct Cloud API vs. BSP choice is a runtime configuration; the sending connector is abstracted from the vendor. Scope by version (founder arbitration D1, OQ-03): at MVP, use limited to attendance notifications via minimal utility templates (one or two), on a single platform WABA number (INT-WAP-07), with the recipient's express consent collected with a transfer notice (INT-WAP-03, ARB-25c) as the legal transfer basis, and Meta entered in the vendor register (SEC-18); in V1, generalized to all messages, template management, and the push channel of the DEC-36 hierarchy. |
| Priority | Must |
| Version | MVP (minimal scope: attendance utility, one or two templates, a single WABA, express consent — arbitration D1, ARB-25c); V1 (generalized) |
| Traceability | PROJECT.md §12 (V1: WhatsApp Business API; arbitration D1 for the minimal MVP scope — OQ-03), DEC-36; prd/research/03-payments-communications.md §4; prd/modules/17-communication-notifications.md; prd/cross-cutting/34-ux-ui-mobile-first-rtl.md (UX-11) |
| Actors | Platform (ZSchool), Principal's office |

#### INT-WAP-02 — Manage utility templates with prior Meta approval

| Attribute | Value |
|---|---|
| Description | Every outbound WhatsApp message outside the service window uses a utility template previously approved by Meta (absence, payment reminder, report-card publication, notice, event). The system manages the template lifecycle: bilingual drafting with variables, submission, approval status, revocation, replacement; it monitors usage-based re-categorization and alerts when a template is reclassified as marketing. No marketing message is sent over this channel. At MVP, only the one or two attendance-notification utility templates are submitted and tracked; full lifecycle management ships in V1 (arbitration D1, OQ-03). |
| Priority | Must |
| Version | MVP (one or two attendance utility templates); V1 (full management) |
| Traceability | PROJECT.md §12, DEC-36; prd/research/03-payments-communications.md §4; prd/modules/17-communication-notifications.md |
| Actors | Platform (ZSchool), Principal's office |

#### INT-WAP-03 — Collect WhatsApp opt-in and handle opposition

| Attribute | Value |
|---|---|
| Description | The WhatsApp channel is used only for consenting guardians, with opt-in collected per school (at enrollment, from the parent portal), timestamped and revocable. The opt-in text explicitly states that contact data and notification content are processed by Meta outside Morocco, in a country outside the adequacy list; this **express consent constitutes the transfer basis at MVP** (ARB-25c, `prd/research/02-regulatory-data.md` §2), with the F118 request filed in parallel (CNF-25). Opposition (a stop keyword or a portal opt-out) immediately suspends WhatsApp sends to that recipient for the school concerned, with the channel hierarchy falling back to SMS per the school's rules; a stop keyword received by WhatsApp or SMS applies only to reminders and announcements: attendance, security, and authentication notifications keep being sent and the parent is informed (ARB-21d). Consents and opt-outs are logged and covered by the school's CNDP declarations. |
| Priority | Must |
| Version | MVP (opt-in with a transfer notice, the legal basis for the attendance-utility channel); V1 |
| Traceability | PROJECT.md §9, DEC-36; prd/research/03-payments-communications.md §4 (Law 09.08, 2019 CNDP-ANRT guidance); prd/cross-cutting/36-legal-compliance-data-protection.md; BES-PAR-02 |
| Actors | Parent, Principal's office, Platform (ZSchool) |

```gherkin
Feature: WhatsApp consent and channel fallback
  Scenario: Parent with no WhatsApp opt-in
    Given a guardian who has not consented to the WhatsApp channel for the school
    When an absence is recorded and the rules call for WhatsApp then SMS
    Then the notification is sent by SMS under the school's alias and never by WhatsApp
  Scenario: Opposition received
    Given a guardian who consented and sends the opposition keyword to the school's WhatsApp number
    When the inbound message is processed
    Then consent is revoked and logged, and subsequent sends for that school fall back to other channels
```

#### INT-WAP-04 — Configure the 10/01/2026 pricing switch and Morocco's standalone rate card

| Attribute | Value |
|---|---|
| Description | The system carries the 10/01/2026 pricing-switch date as a platform parameter: before the date, the current utility grid; from the date onward, Morocco's standalone rate card (higher utility and authentication rates, end of free service and utility messages within the 24-hour window) per the grids Meta publishes (H-20, to verify and update, OQ-07). Unit costs are configuration data per category and destination, never fixed constants. The configuration is active from the MVP's first WhatsApp utility send, which comes after the switch date (arbitration D1, OQ-03). |
| Priority | Must |
| Version | MVP (at the first WhatsApp send); V1 |
| Traceability | PROJECT.md §14 (DEC-36, H-20); prd/research/03-payments-communications.md §4; prd/research/00-baseline-corrections.md #6; prd/cross-cutting/33-business-model-packaging.md |
| Actors | Platform (ZSchool) |

```gherkin
Feature: 10/01/2026 pricing switch
  Scenario: A utility message sent after the switch
    Given the switch date configured as 10/01/2026 and Morocco's standalone grid loaded
    When a utility message is delivered on 09/30/2026
    And a utility message is delivered on 10/01/2026
    Then the first is priced per the pre-switch grid
    And the second is priced per the standalone grid
    And both appear in the school's monthly consumption report
  Scenario: Grid not loaded on the switch date
    Given the switch date reached with no up-to-date grid
    When a send is scheduled
    Then a platform alert is raised and sends continue using the last known grid, flagged for correction
```

#### INT-WAP-05 — Budget for inbound messages and the service window after the switch

| Attribute | Value |
|---|---|
| Description | From 10/01/2026 onward, inbound and service messages within the 24-hour window are billed: the system counts inbound messages per school in `UsageMetric` and `DeliveryLog`, exposes inbound consumption on the school's cost dashboards, and applies consumable credit counters to inbound flows per the policy of prd/cross-cutting/33-business-model-packaging.md. |
| Priority | Should |
| Version | V1 |
| Traceability | DEC-36, DEC-28; prd/research/03-payments-communications.md §4; prd/03-domain-data-model.md §2.6-§2.7 |
| Actors | Principal's office, Platform (ZSchool) |

#### INT-WAP-06 — Follow the push, WhatsApp utility, SMS-alias channel hierarchy

| Attribute | Value |
|---|---|
| Description | The WhatsApp channel fits into the DEC-36 hierarchy, applicable from V1 onward (ARB-21b): push notification first (V1, via the PWA; native apps in V2, NFR-MOB-02), contingent on FCM and APNs being entered in the sub-processor register with a transfer basis (SEC-18, CNF-09, ARB-25d), WhatsApp utility for opted-in parents, alias SMS as a fallback (and for households without a smartphone). At MVP, the hierarchy is in-app, then WhatsApp utility (attendance only), then SMS. Fine-grained per-message-type routing rules and parent preferences fall to the communication module (prd/modules/17-communication-notifications.md); this requirement ties integrations to this hierarchy and forbids any workaround (an unconfigured, systematic double send across channels). |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §12, DEC-36; prd/modules/17-communication-notifications.md |
| Actors | Platform (ZSchool), Principal's office |

#### INT-WAP-07 — Operate a single platform WhatsApp Business account at MVP and handle inbound replies

| Attribute | Value |
|---|---|
| Description | At MVP, ZSchool operates a single WhatsApp Business account (WABA) and a single platform number for every school: the display name is ZSchool's and every message identifies the sending school in its body ("ZSchool — <school name>"); opt-in remains collected per school (INT-WAP-03) and costs are allocated to the sending school (INT-WAP-04). In V1, a school may opt to have its own number and display name after its own Meta Business verification; the connector supports both modes. **Inbound replies**: any message received on the platform number triggers an automatic bilingual receipt pointing to the app and the registrar's office, is attached to the school of the last outbound message to that number, transmitted to that school's student-life team in an inbound-message queue (reading, closing, converting into a front-desk absence justification — ARB-15d), and counted in the school's consumption after 10/01/2026 (INT-WAP-05); a stop keyword is handled per INT-WAP-03. Replies are never fed into moderated threads (DEC-34). |
| Priority | Must |
| Version | MVP (single WABA, automatic receipt, inbound queue); V1 (per-school number as an option) |
| Traceability | DEC-34, DEC-36; ARB-21g; INT-WAP-01, INT-WAP-03, INT-WAP-05; prd/modules/17-communication-notifications.md; prd/modules/13-attendance-student-life-discipline.md |
| Actors | Platform (ZSchool), Principal's office, Student life, Parent |

```gherkin
Feature: A parent replying on the platform's WhatsApp number (MVP)
  Scenario: Reply to an absence notification
    Given an absence notification sent to a parent from the platform number in School A's name
    When the parent replies "he's sick, doctor's note tomorrow"
    Then the parent receives an automatic bilingual receipt inviting them to justify the absence in the app or at the front desk
    And the message is placed in School A's student-life inbound-message queue
    And the inbound message is counted in School A's WhatsApp consumption
    And it appears in no moderated parent–teacher thread
```

---

## 7. INT-SIG — Electronic signature and stamping (Law 43.20)

### 7.1 Objective and scope

Law 43.20 (trust services for electronic transactions) and its implementing decree 2-22-687 (Official Gazette No. 7160 of 01/12/2023) distinguish three signature levels: simple, **advanced**, **qualified** (a reliability presumption, equivalent to handwritten); the simple and advanced levels are admissible in court with no presumption (prd/research/02-regulatory-data.md §4). Trust-service-provider (PSCo) licensing is granted **per service** (signature, stamping, and timestamping are three separate licenses); providers licensed as of 09/09/2026: **Barid eSign** (PSCo status in January 2025; Morocco's first qualified timestamp in April 2026), **DamaneSign** (March 2025), **AfricTRUST** (qualified certificates with the Damane Cash network, June 2026); no public pricing, quote-based (prd/research/02-regulatory-data.md §4; prd/research/00-baseline-corrections.md #14).

Per DEC-30: in **V1**, ZSchool applies the school's **advanced electronic stamp, timestamping, and a verification QR code** on official documents; in **V2**, **qualified** stamping and timestamping via a licensed PSCo for the exit certificate, attestations, and transcripts; the **parent contract (Law 59.21) is signed electronically at the advanced level**. No level is required by the texts for report cards and attestations (PROJECT.md §2.7).

### 7.2 Data flows

1. **School's stamp (configuration)**: the school uploads its stamp and logo at onboarding (PROJECT.md §7.1); ZSchool derives the tenant-linked advanced electronic-stamp data (the school's legal identity, opening authorization).
2. **Applying the advanced stamp (V1, internal)**: when an official document is generated (a published report card, certificate, attestation, `DocumentGenerated`), the system computes the document's fingerprint, applies the school's advanced electronic stamp and a timestamp, then produces the **verification QR code** pointing to the minimal public verification page (INV-26, DEC-09, DEC-30). The evidence package (document, fingerprint, timestamps, signatory, log) is archived.
3. **Signing the parent contract (V1)**: the legal guardian signs the generated contract at the advanced level: identification via account and an OTP code sent to their phone number (the primary contact identifier, DEC-11), timestamped consent, the document's fingerprint, archived in the student's record and available to the AREF (Law 59.21, annual written contract).
4. **Qualified stamping and timestamping (V2, PSCo)**: for the exit certificate, attestations, and transcripts, the system calls the chosen licensed PSCo's API to apply the qualified stamp in the school's name and a qualified timestamp; PSCo certificates belong to the school (or the mandated ZSchool/school pair, per the contract); qualified evidence is added to the V1 evidence package.

### 7.3 Contractual model

V1: no external provider required — the advanced stamp is applied by ZSchool in the school's name under Law 43.20, with an evidence package and QR code. V2: a **ZSchool-PSCo framework agreement and/or direct school-PSCo contracts** (to be settled at selection, OQ-08); licensing is **per service**: the chosen provider must cover stamping, timestamping, and signature, or two complementary providers otherwise; quote-based pricing, no public rate (prd/research/02-regulatory-data.md §4). Licensed candidates as of 09/09/2026: Barid eSign (signature, stamping, qualified timestamping since April 2026), DamaneSign, AfricTRUST. The targeted legal value is documented in each case: advanced = admissible with no presumption; qualified = a reliability presumption and handwritten equivalence.

### 7.4 External dependencies

- Confirming the licensing scope (per service) of the three candidates and their API coverage (corporate stamping, timestamping, remote signature), at the V2 tender (OQ-08).
- PSCo quotes: no public rate (prd/research/02-regulatory-data.md §4).
- Identity verification of the parent contract's signatory: account + phone OTP; any move to a higher identification level falls to the compliance chapter.
- Evidentiary archiving: fingerprints and timestamps kept per the DEC-22 periods (official documents: permanent on the school's side; accounting documents: 10 years).

### 7.5 Risks

- Challenging a V1 document's evidentiary value (advanced level, no presumption): mitigated by a complete evidence package (fingerprint, timestamps, log, verification QR) and, in V2, by moving to qualified for high-stakes documents.
- Evolution of the PSCo market (new licenses, license withdrawals): DGSSI monitoring and an abstracted stamping connector.
- Fragility of OTP identification for signing the parent contract (a shared phone): compensating measures in INT-SIG-02 (a dedicated OTP, a second element for shared or recently recovered numbers, front-desk signature as a fallback); the advanced level is accepted in V1 per DEC-30.
- Per-document qualified costs in V2: certificate and attestation volume to budget with quotes (OQ-08).

### 7.6 INT-SIG requirements

#### INT-SIG-01 — Apply the school's advanced electronic stamp and a timestamp on official documents

| Attribute | Value |
|---|---|
| Description | In V1, every published official document (a published report card, certificate, attestation) carries the school's advanced electronic stamp and a timestamp: the system computes the document's fingerprint, applies the tenant-linked stamp data, and records the evidence package (document, fingerprint, application date and time, author). The stamp reproduces the school's legal elements (name, opening authorization). The identifier carried by the verification QR code is random, non-sequential, and not derived from the document number; the public verification page is rate-limited and reveals only the document's existence, integrity, date, and type (SEC-06, SEC-24). |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §2.7 (Law 43.20), §7.6, DEC-09, DEC-30; SEC-06; prd/03-domain-data-model.md §2.4 (`ReportCard`, `Certificate`, INV-26); prd/modules/15-documents-certificates.md |
| Actors | Principal's office, Registrar's office, Platform (ZSchool) |

```gherkin
Feature: Publishing a stamped attestation of enrollment
  Scenario: Generation and advanced stamp
    Given a school whose stamp and legal elements are configured
    When the registrar's office generates a bilingual attestation of enrollment
    Then the document carries the school's advanced electronic stamp, a fingerprint, and a timestamp
    And the evidence package is archived and a verification QR code is printed on the document
  Scenario: QR verification
    Given an attestation presented with its QR code
    When a third party scans the QR
    Then the minimal public verification page confirms the document's existence, integrity (fingerprint), and date without disclosing any other student data
    And the verification identifier reveals neither the document's number nor another document's
```

#### INT-SIG-02 — Have the parent contract signed electronically at the advanced level

| Attribute | Value |
|---|---|
| Description | The annual written school-parent contract (Law 59.21) generated by the school is signed electronically by the legal guardian at the advanced level and, when distinct, countersigned by the financial guardian (ARB-20h): identification via an authenticated account and a **signature-dedicated OTP code**, distinct from the session code, sent to the signatory's mobile number, timestamped consent, the signed document's fingerprint, device fingerprint and session log, archived in the student's record and exportable for the AREF. Compensating measures for the shared-phone risk (ARB-07): the signatory is informed the code is strictly personal; when the signatory's number is declared as a shared household contact, or when the account was recovered at the front desk fewer than 30 days ago (SEC-27), signing additionally requires a second element (front-desk confirmation with identity verification, or a verified email); failing that, the contract is signed at the front desk on a tablet with identity verification. The signature carries an explicit note of the level (advanced) and the identification evidence used. Since the contract is required from MVP onward (ARB-01, FR-FIN-02), front-desk signature with identity verification and a timestamp is the MVP mode; remote signature via dedicated OTP ships in V1. |
| Priority | Must |
| Version | MVP (front-desk signature with identity verification, financial-guardian countersignature); V1 (remote signature at the advanced level) |
| Traceability | PROJECT.md §2.7 (Law 59.21, annual written contract), DEC-30; prd/03-domain-data-model.md §2.5 (`FeeSchedule`, the parent contract); prd/research/02-regulatory-data.md §1 and §4; prd/cross-cutting/36-legal-compliance-data-protection.md |
| Actors | Legal guardian (parent), Principal's office, Platform (ZSchool) |

```gherkin
Feature: Signing the parent contract
  Scenario: Signed by the legal guardian
    Given a parent contract generated from an active enrollment's fee schedule
    And a legal guardian authenticated on their account with a verified mobile number
    When the legal tutor confirms the signature after reading it
    Then the advanced signature is applied with a timestamped OTP code, the document's fingerprint, and archiving in the record
    And a copy is accessible to the parent and exportable for the AREF
  Scenario: Signatory not the legal guardian
    Given a parent whose qualities do not include legal guardian
    When they attempt to sign the contract
    Then the signature is refused and the system states that only the legal guardian may sign (RG-14b, INV-11)
```

#### INT-SIG-03 — Apply a qualified stamp and timestamp via a licensed PSCo on high-stakes documents

| Attribute | Value |
|---|---|
| Description | In V2, for the exit certificate, attestations, and transcripts, the system calls the chosen licensed PSCo's API (Barid eSign, DamaneSign, or AfricTRUST) to apply the qualified electronic stamp in the school's name and a qualified timestamp (Barid eSign has held Morocco's first qualified timestamp since April 2026, prd/research/02-regulatory-data.md §4). Qualified evidence is added to the V1 evidence package; the verification QR code distinguishes qualified documents. The connector is abstracted from the provider. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §2.7, DEC-30; prd/research/02-regulatory-data.md §4; prd/modules/15-documents-certificates.md |
| Actors | Principal's office, Platform (ZSchool) |

#### INT-SIG-04 — Select a trust provider covering stamping, timestamping, and signature

| Attribute | Value |
|---|---|
| Description | Before V2 development, ZSchool runs the selection of the PSCo(s) against three gating criteria: a current DGSSI license **per service** covering stamping, timestamping, and signature (or complementarity of two providers), a documented API for corporate stamping and qualified timestamping, quote-based pricing compatible with school volumes. The choice is logged with proof of licensing as of the decision date. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §2.7, DEC-30; prd/research/02-regulatory-data.md §4 (per-service licensing, no public rate); OQ-08 |
| Actors | Platform (ZSchool) |

#### INT-SIG-05 — Keep the evidentiary package for the legal retention periods

| Attribute | Value |
|---|---|
| Description | For every stamped document and every signed contract, the system keeps the evidence package (document, fingerprint, timestamps, signatory identity and identification evidence, access log) per the baseline's periods: official documents kept permanently by the school, financial documents ten years, logs five years (DEC-22, CGI art. 211). Exporting the package accompanies any individual-rights request and the termination export (DEC-23). |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §9, DEC-22, DEC-23, DEC-30; prd/03-domain-data-model.md §2.7 (`AuditLog`, `DataExport`); prd/cross-cutting/36-legal-compliance-data-protection.md |
| Actors | Platform (ZSchool), Principal's office |

---

## 8. INT-HEB — Cloud hosting

### 8.1 Objective and scope

The baseline requires **production and backups in Morocco** (PROJECT.md §9, Q-08, DEC-26): no student data leaves the territory, which removes any transfer formality under Law 09.08; the only outbound flows are those of messaging vendors (WhatsApp, email), governed by the F118 model (INT-EML). The **OCI "Morocco West (Casablanca)" region, af-casablanca-1**, hosted at N+ONE (Nouaceur), has been open since **April 7, 2026**, with **a single availability domain**; the second Moroccan Oracle region (Settat) is planned with no published timeline; candidate failover sites: N+ONE Settat, Atlas Cloud Services (Benguerir, Uptime Institute Tier III and IV certified, ISO 27001 and PCI DSS), and OVHcloud Local Zone Rabat (Compute, Block Storage, a local IP; Object Storage and managed Kubernetes announced in 2024, not reconfirmed) (prd/research/05-infrastructure-usage.md §1; prd/research/00-baseline-corrections.md #13). Scope covers selecting and running the hosting platform, data residency, the cross-site failover plan, and verifying the service catalog; detailed technical architecture falls to the non-functional (prd/cross-cutting/32-non-functional-requirements.md) and security (prd/cross-cutting/31-security-privacy.md) requirements.

### 8.2 Data flows

1. **Production (ZSchool tenant)**: all production processing and data is hosted in af-casablanca-1; no student data is processed or stored outside Morocco; a Europe fallback (observed RTT roughly 35 to 60 ms) is ruled out for student data (prd/research/05-infrastructure-usage.md §1).
2. **Backups (national cross-site outbound)**: daily backups, at least 30-day retention, quarterly restore testing (PROJECT.md §10); backups stay in Morocco; daily encrypted replication to a second Moroccan center **from MVP onward** (INT-HEB-06, ARB-25h: N+ONE Settat, Atlas Cloud Benguerir, or OVH Rabat); a full disaster recovery plan with failover in V1 (INT-HEB-02).
3. **Limited outbound flows**: messaging only (INT-SMS stays domestic via the Moroccan aggregator, INT-WAP travels through Meta's servers under F118 governance, INT-EML per INT-EML-03); no student-data flow to any other vendor.
4. **Operations**: observability (logs, metrics, alerts, per-tenant traceability, PROJECT.md §10) operated from the same region; support access governed and audited (prd/cross-cutting/31-security-privacy.md).

### 8.3 Contractual model

Direct contracts between the ZSchool operator and the infrastructure vendor (Oracle Cloud for af-casablanca-1) and, where applicable, the failover-site vendor. OCI Casablanca's price list is not consolidated and published as of the PRD's date and available managed services remain to be verified service by service (H-18); no cost commitment is set in this chapter. ZSchool is the controller for the global identity and a processor for schools' operational data (DEC-16): hosting contracts carry processor, confidentiality, reversibility, and audit clauses, detailed in prd/cross-cutting/36-legal-compliance-data-protection.md. DGSSI cloud qualification (Law 05.20) does not automatically apply to private schools and ZSchool in 2026, but is a sales argument and a potential contractual requirement for a public-sector client (prd/research/02-regulatory-data.md §3). **Remote administration by the vendor**: since Oracle is a foreign company, the contract specifies the terms for the vendor's regional administration (technical access from abroad limited to infrastructure, encryption of data at rest with keys managed by ZSchool — SEC-09, logged and notified access, a commitment not to access content); this clause is documented against the DGSSI standard (level 2: administration from Morocco), on a voluntary basis, and appears in the sub-processor list (CNF-09).

### 8.4 External dependencies

- af-casablanca-1's service catalog: actual, service-by-service availability of managed databases, Object Storage, and orchestration at launch (H-18, OQ-05).
- Timeline for Oracle's second Settat region: planned with no published timeline (prd/research/05-infrastructure-usage.md §1).
- Failover site: N+ONE Settat's, Atlas Cloud Benguerir's, or OVH Rabat's actual capabilities (limited services on OVH's side) to audit before committing.
- Up-to-date tzdata for the permanent UTC+0 timezone since 09/20/2026 (Decree No. 2.26.530, Official Gazette No. 7521 of 06/29/2026; prd/research/00-baseline-corrections.md #1) — no seasonal alternation or Ramadan exception.

### 8.5 Risks

- **Single availability zone**: a disaster on af-casablanca-1's sole AD is covered only by the cross-site disaster recovery plan; mitigated by INT-HEB-02 (secondary replication/backups) and recovery targets defined in prd/cross-cutting/32-non-functional-requirements.md.
- Unavailability of some managed services in the young region: catalog verification (INT-HEB-03) before any commitment avoids an architecture dependent on an absent service.
- Vendor risk and reversibility: export and portability clauses in contracts; a documented exit plan.
- Non-consolidated costs (the OCI grid not published): budget to validate by quote before commercial launch, out of scope for this chapter (OQ-05).
- Terminology caution: Oracle's (planned) "Settat region" must not be confused with the N+ONE Settat data center, available as a physical site (OQ-05).
- Remote administration of the region by a foreign vendor: without a contractual clause and ZSchool-managed encryption keys, the "no data outside Morocco" promise would be weakened; handled in §8.3 and by SEC-09.

### 8.6 INT-HEB requirements

#### INT-HEB-01 — Host production and backups in Morocco with no student-data exit

| Attribute | Value |
|---|---|
| Description | ZSchool's production and backups are hosted in Morocco, primarily targeting the OCI af-casablanca-1 region; no student data is stored or processed outside the territory, except the expressly governed messaging flows (INT-WAP, INT-EML). A residency check (locating stores, backups, and processing zones) runs at launch and at every architecture change, and is documented. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §9 (Q-08), DEC-26; prd/research/05-infrastructure-usage.md §1; prd/cross-cutting/36-legal-compliance-data-protection.md |
| Actors | Platform (ZSchool) |

```gherkin
Feature: Data residency in Morocco
  Scenario: Residency check at launch
    Given the platform deployed for the pilots
    When the residency check runs
    Then all student, guardian, and school data is located in af-casablanca-1 and backups are in Morocco
    And the check report is archived with messaging exceptions explicitly listed
  Scenario: A new external service proposed
    Given a proposal to integrate a new external vendor
    When it is evaluated
    Then it is refused until data location and Law 09.08 governance are demonstrated
```

#### INT-HEB-02 — Replicate backups to a second Moroccan site for the disaster recovery plan

| Attribute | Value |
|---|---|
| Description | The continuity plan relies on a second Moroccan site independent of the first: replication or daily backup exports to N+ONE Settat, Atlas Cloud Services Benguerir, or OVHcloud Local Zone Rabat, the choice justified by a capacity audit. Recovery targets (RPO/RTO) and plan-activation tests are defined in prd/cross-cutting/32-non-functional-requirements.md; this requirement guarantees their physical feasibility (a contracted, funded second site). |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §9 (Q-08), §10, DEC-26; prd/research/05-infrastructure-usage.md §1 (a single AD; candidate failover sites); prd/cross-cutting/32-non-functional-requirements.md |
| Actors | Platform (ZSchool) |

#### INT-HEB-03 — Verify the Casablanca region's catalog service by service before commitment

| Attribute | Value |
|---|---|
| Description | Before any architecture commitment on af-casablanca-1, the availability, quotas, and performance of every required service (compute, object and block storage, managed databases, orchestration, backup, key encryption) are verified and documented; any required service that is unavailable triggers a documented alternative choice (a self-managed service or another Moroccan site). Verification is repeated at every major architecture expansion (H-18). |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §9 (H-18); prd/research/05-infrastructure-usage.md §1; prd/cross-cutting/32-non-functional-requirements.md |
| Actors | Platform (ZSchool) |

#### INT-HEB-04 — Test restores and keep the continuity plan up to date

| Attribute | Value |
|---|---|
| Description | Daily backups (at least 30-day retention) undergo documented quarterly restore tests — backups and restore tests apply from MVP onward (the NFR-SAV domain, `prd/cross-cutting/32-non-functional-requirements.md`), this requirement covering the continuity-plan aspect in V1, without duplicating the NFR; the continuity plan (including an inventory of this chapter's integration dependencies: Massar offline, the SMS aggregator unavailable, Meta unavailable, a PSCo unavailable) is reviewed at every major change and after every test. Incidents and breaches follow the incident log and the notification the baseline requires. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §9, §10; prd/03-domain-data-model.md §6; prd/cross-cutting/31-security-privacy.md |
| Actors | Platform (ZSchool) |

#### INT-HEB-05 — Guarantee hosting reversibility

| Attribute | Value |
|---|---|
| Description | Hosting contracts carry reversibility clauses: a full data export in open formats, migration assistance, a deletion timeline after departure. A documented exit plan (data, configurations, secrets) is maintained and testable, independent of any legal cloud-qualification obligation. |
| Priority | Should |
| Version | V1 |
| Traceability | PROJECT.md §9; prd/research/02-regulatory-data.md §3 (the DGSSI cloud standard's reversibility clause, voluntarily transposed); prd/cross-cutting/36-legal-compliance-data-protection.md |
| Actors | Platform (ZSchool) |

#### INT-HEB-06 — Replicate encrypted backups daily to a second Moroccan center from MVP onward

| Attribute | Value |
|---|---|
| Description | From the pilots' activation onward, an encrypted copy (SEC-09, keys managed by ZSchool) of the complete daily backup (databases, document files, configuration, logs) is transferred each day to a second Moroccan data center, physically distinct from af-casablanca-1 (N+ONE Settat, Atlas Cloud Services Benguerir, or OVHcloud Local Zone Rabat, the choice justified by the capacity audit), on storage independent of the production account; the copy's integrity is verified after each transfer, with an alert on failure; a restore from the remote copy is tested in the quarterly exercise (NFR-SAV-03). The MVP fallback RPO is 24 hours and the fallback RTO is that of a measured full restore, both recorded in the pilot agreement (CNF-08). The full disaster recovery plan (INT-HEB-02) relies on this same site. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §9 (Q-08), §10, DEC-26; ARB-25h; SEC-20, SEC-21; NFR-DISP-03, NFR-SAV-01, NFR-SAV-03; prd/research/05-infrastructure-usage.md §1 |
| Actors | Platform (ZSchool) |

---

## 9. INT-EML — Outbound email

### 9.1 Objective and scope

Email is a **secondary, non-critical channel** (DEC-12): no recent primary data exists on Moroccan households' email use (prd/research/05-infrastructure-usage.md §2), and the primary contact identifier is the phone (DEC-11, INV-37). Outbound email nonetheless serves: authentication (an email OTP alongside SMS, PROJECT.md §9), identity invitations and claims, sending receipts and documents, optional report-card notification. Chapter goal: have a reliable, deliverable transactional sending service, with full awareness of the vendor's location (a flow outside Morocco) and the corresponding Law 09.08 governance (the F118 model provided to schools, PROJECT.md §9). Channel and routing rules fall to the communication module (prd/modules/17-communication-notifications.md); the full compliance analysis is carried by prd/cross-cutting/36-legal-compliance-data-protection.md.

### 9.2 Data flows

1. **Sending (outbound)**: an email-channel `Notification` (or an authentication trigger) is sent to the sending service with the recipient, subject, bilingual content, and correlation references; statuses (accepted, delivered, bounced, marked as spam) feed `DeliveryLog`.
2. **Location (outbound, outside Morocco)**: the sending vendor generally processes messages outside Morocco; the baseline explicitly classifies these messaging-vendor flows as the only data exits, governed by the F118 request model ZSchool provides to schools (PROJECT.md §9). The chosen vendor is preferred for processing in an adequacy-list country (Deliberation No. 236-2015: EU/EEA excluding Croatia, the United Kingdom, Switzerland, Canada — France and Spain are subject to a simple declaration, prd/research/02-regulatory-data.md §2).
3. **Domain authentication (outbound)**: sending signed from a ZSchool subdomain (or, in an advanced V1, the school's own) with SPF, DKIM, and a strict DMARC policy.
4. **Hygiene (inbound)**: managing hard bounces and unsubscribes; email is never required for a parent, student, or teacher (INV-37) and its absence degrades no service.

### 9.3 Contractual model

A ZSchool contract with a transactional-sending service (volume-based pricing, a market category not specified in the PRD — no invented rate). ZSchool is a processor for schools regarding school-data sends and a controller for its own processing (account authentication); governing flows outside the adequacy list goes through the controller's F118 authorization (a two-month delay, extendable) or choosing an adequacy-country vendor, per prd/cross-cutting/36-legal-compliance-data-protection.md. ZSchool provides schools with the corresponding F118 request template (PROJECT.md §9).

### 9.4 External dependencies

- A transactional-sending vendor and its processing location (the Deliberation 236-2015 adequacy list, with no update found as of 09/09/2026, H-15).
- DNS management for the sending domain (SPF, DKIM, DMARC) and sending reputation.
- No critical service dependency: email unavailability blocks no journey (SMS/in-app fallback).

### 9.5 Risks

- Low deliverability to parent inboxes (low observed usage, poorly maintained addresses): email is never the sole channel for an important message (the DEC-12 hierarchy).
- Law 09.08 non-compliance if a flow went to a non-listed country without governance: controlled by vendor choice and the F118 model (cross-reference prd/cross-cutting/36).
- Sender impersonation (phishing in a school's name): mitigated by a dedicated subdomain, strict SPF/DKIM/DMARC, and school identification notices in the message footer.

### 9.6 INT-EML requirements

#### INT-EML-01 — Send transactional emails via a dedicated service

| Attribute | Value |
|---|---|
| Description | The platform's emails (invitation and claim, access reset, email OTP, receipts, documents, optional notifications) are sent via a dedicated transactional-sending service (never from a personal inbox), with a correlation reference to the `Notification` and tracked statuses. Service unavailability blocks no critical journey: every important-subject email is paired with a channel from the DEC-12 hierarchy. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §9, §12, DEC-11, DEC-12; INV-37; prd/modules/17-communication-notifications.md |
| Actors | Platform (ZSchool), all recipient roles |

#### INT-EML-02 — Guarantee deliverability via a dedicated domain and SPF, DKIM, DMARC authentication

| Attribute | Value |
|---|---|
| Description | Sends originate from a dedicated ZSchool subdomain with valid SPF and DKIM records and a strict DMARC policy; hard bounces are handled automatically (the address is suspended after repeated bounces, with the school informed to correct contact details) and spam reports are monitored. A per-school sending domain (optional) keeps the same authentication discipline. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §10 (observability, service quality); prd/modules/17-communication-notifications.md |
| Actors | Platform (ZSchool), Principal's office |

#### INT-EML-03 — Govern the flow outside Morocco and provide the F118 request template to schools

| Attribute | Value |
|---|---|
| Description | The system documents where the email vendor's processing takes place and its adequacy countries; for affected schools, ZSchool provides the F118 authorization request template (a transfer to a messaging vendor), fillable with processing details, per PROJECT.md §9. No email flow of student content is activated to a non-adequacy country without governance (choosing an adequacy-country vendor, or the school's own F118) being documented. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §9 (H-15); prd/research/02-regulatory-data.md §2 (Deliberation 236-2015, F118); prd/cross-cutting/36-legal-compliance-data-protection.md |
| Actors | Platform (ZSchool), Principal's office |

#### INT-EML-04 — Keep email as an optional channel, never required

| Attribute | Value |
|---|---|
| Description | No enrollment, access, or document journey requires an email address: the account relies on the mobile phone (INV-37); the email address is entered optionally, verified if used, and its mere absence produces no anomaly alert. Official documents are never delivered exclusively by email (portal download and the DEC-12 channels remain available). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §2.10, §9, DEC-11, DEC-12; INV-37; BES-SEC-08 |
| Actors | All roles |

---

## 10. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Baseline update: YouCan Pay ceased operations in January 2024 (prd/research/00-baseline-corrections.md #7); PROJECT.md §2.8 still says "Only NAPS and YouCan Pay publish their rates". Adopt the exclusion of YouCan Pay and reword the paragraph at the baseline's next revision. | INT-CAR-05 already applies the exclusion; the frozen baseline cannot be modified by this chapter. |
| OQ-02 | Note 1887/13 (the Massar grades module's framing document) is uncorroborated online (prd/research/00-baseline-corrections.md #4): confirm the framing text and the actual Massar import formats with the pilots and the Ministry of National Education; INT-MAS requirements are worded without relying on the reference number. | H-16; validation upon the pilots' arrival (DEC-35). |
| OQ-03 | Version of the WhatsApp channel for attendance notification. **Resolved — D1 and ARB-25c** (MVP transfer basis = express consent with a transfer notice; single WABA INT-WAP-07). Context: PROJECT.md §12 MVP mentions "Attendance with SMS/WhatsApp notification" while V1 mentions "WhatsApp Business API". **Founder arbitration (D1, 09/09/2026)**: at MVP, minimal WhatsApp utility limited to attendance notifications (one or two templates), with in-app and SMS; in V1, generalized to all messages, template management, and push. Applied to the tags of INT-WAP-01 through INT-WAP-04; the presence of WhatsApp utility at MVP is a justified deviation from the §12 list (conventions §1.5); the baseline's ambiguity remains to be corrected at the next revision. | An internal ambiguity in baseline §12; journeys PC-05 and PC-11; aligned with UX-11 and OQ-03 of `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`. |
| OQ-04 | Baseline update: the "Android 68% / iOS 32%" shares cited by DEC-36 are web traffic shares (StatCounter, prd/research/00-baseline-corrections.md #10), not a device base; with no impact on the push-first priority, the baseline's wording is to be reviewed at the next revision. | DEC-36; prd/research/05-infrastructure-usage.md §2. |
| OQ-05 | Hosting: clarify that Oracle's 2nd Settat region is planned with no timeline (prd/research/00-baseline-corrections.md #13) and that the V1 disaster recovery plan relies on a data-center site (N+ONE Settat, Atlas Cloud Benguerir, OVH Rabat), not a second Oracle region; the OCI Casablanca price grid and managed services to consolidate by quote (H-18). | INT-HEB-02 and INT-HEB-03; baseline §9 spoke of "N+ONE Settat" as a failover option, which remains accurate at the data-center level. |
| OQ-06 | Obtain Fatourati's pricing and contract (creditor, Aggregator, Collect) and the actual SLA of the creditor API (H-19): no public rate as of 09/09/2026; potential impact on the consumables business model and the collections promise (DEC-28, prd/cross-cutting/33-business-model-packaging.md). **Contracting deadline (go/no-go): 06/30/2027; Collect fallback in V1 otherwise (INT-FAT-01).** | INT-FAT-01 through INT-FAT-05; CMI sales contact provided by the CMI (prd/research/03-payments-communications.md §1). |
| OQ-07 | Morocco's standalone WhatsApp grids after 10/01/2026 (H-20): Meta announces their publication before 09/01/2026; verify the actual amounts (utility, authentication, authentication-international, inbound messages), update INT-WAP-04's configuration accordingly, and reassess the consumables policy. | prd/research/00-baseline-corrections.md #6; prd/research/03-payments-communications.md §4. |
| OQ-08 | Selecting the PSCo for V2 (qualified stamping and timestamping): no public rate (quote-based, prd/research/02-regulatory-data.md §4); launch the tender (Barid eSign, DamaneSign, AfricTRUST) with verification of per-service licenses and API coverage. | INT-SIG-03, INT-SIG-04; V2 timeline (prd/cross-cutting/37-roadmap-mvp-v1-v2.md). |
| OQ-09 | **Escalated — ESC-03 (baseline update):** Timezone: the baseline (§2.4, §10) still describes the "UTC+1 / return to UTC+0 during Ramadan" alternation; Decree No. 2.26.530 (Official Gazette No. 7521 of 06/29/2026) sets permanent UTC+0 since 09/20/2026 (prd/research/00-baseline-corrections.md #1). This chapter applies permanent UTC+0 with no alternation or Ramadan exception (tzdata, §8.4); baseline update to log in review. | Same treatment as OQ-01 of prd/cross-cutting/32-non-functional-requirements.md (NFR-I18N-04). |

---

## Traceability

Table of baseline and research IDs → coverage in this file.

| Baseline ID | Coverage in this file |
|---|---|
| §2.6 (Massar, Massar code, H-04) | §2; INT-MAS-01 through INT-MAS-06 |
| §2.7 (Law 43.20, Law 59.21, e-invoicing, CNDP) | §7; INT-SIG-01 through INT-SIG-05; INT-FAT-06; INT-EML-03 |
| §2.8 (payment methods, Fatourati, card, no fund holding) | §3, §4, §5; INT-FAT-01 through INT-FAT-06; INT-CAR-01 through INT-CAR-06; INT-SMS-01 through INT-SMS-04 |
| §7.6 (documents, stamp, QR) | INT-SIG-01, INT-SIG-03 |
| §7.7 (finance, payment plans, collections) | INT-FAT-02, INT-FAT-03, INT-CAR-01, INT-CAR-06 |
| §7.8 (communication, channels) | §5, §6; INT-SMS-01, INT-WAP-06 |
| §7.9 (transfers) | INT-MAS-03 |
| §7.12 (Massar and regulatory exports) | INT-MAS-01 through INT-MAS-05 |
| §9 (security, hosting in Morocco, F118, SMS aggregator, audit log) | INT-HEB-01 through INT-HEB-05; INT-EML-01, INT-EML-03; INT-SMS-01, INT-SMS-05 |
| §10 (NFR: backups, quarterly restore, availability, interoperability) | INT-HEB-02, INT-HEB-04; INT-EML-01 |
| §11 (SMS/WhatsApp consumables, DEC-28) | INT-SMS-02, INT-SMS-03; INT-WAP-05 |
| §12 (scope by version) | "Version" column of every requirement; OQ-03 |
| DEC-04 (Massar code as matching key) | INT-MAS-01, INT-MAS-02, INT-MAS-05 |
| DEC-09 (immutable report cards, QR) | INT-SIG-01 |
| DEC-12 (channels: in-app, SMS, WhatsApp priority; email secondary) | INT-SMS-01; INT-WAP-06; INT-EML-01, INT-EML-04 |
| DEC-16 (controller/processor) | INT-HEB-03 (contractual model); INT-EML-03 |
| DEC-22 (retention periods) | INT-SIG-05 |
| DEC-23 (termination export) | INT-SIG-05 |
| DEC-24 (documents never blocked for arrears) | §3.5 (Fatourati risks) |
| DEC-26 (hosting in Morocco, F118-governed messaging, Moroccan SMS aggregator) | INT-HEB-01, INT-HEB-02, INT-HEB-06; INT-SMS-01; INT-EML-03 |
| DEC-28 (SMS packs 0.30 to 0.50 MAD with margin) | INT-SMS-03 |
| DEC-30 (advanced stamp V1, qualified V2, parent contract at the advanced level) | INT-SIG-01 through INT-SIG-05 |
| DEC-31 (Fatourati V1, card V2, direct debit via the school's bank) | INT-FAT-01 through INT-FAT-06; INT-CAR-01 through INT-CAR-06 |
| DEC-36 (push/WhatsApp/SMS hierarchy, pricing switch, H-20) | INT-WAP-01 through INT-WAP-07; INT-SMS-04 |
| H-04 (no Massar API) | INT-MAS-01, INT-MAS-02, INT-MAS-06 |
| H-15 (CNDP adequacy list) | INT-EML-03 |
| H-17 (DGI e-invoicing) | INT-FAT-06 |
| H-18 (OCI Casablanca services) | INT-HEB-03; OQ-05 |
| H-19 (Fatourati rates and contract) | INT-FAT-01 through INT-FAT-05; OQ-06 |
| H-20 (WhatsApp rates after 10/01/2026) | INT-WAP-04, INT-WAP-05; OQ-07 |
| Q-08 (resolved: production and backups hosted in Morocco) | INT-HEB-01, INT-HEB-02 |
| prd/research/00-baseline-corrections.md #1 (permanent UTC+0) | §8.4 (tzdata) |
| prd/research/00-baseline-corrections.md #4 (note 1887/13 uncorroborated) | OQ-02 |
| prd/research/00-baseline-corrections.md #6 (10/01/2026 WhatsApp switch) | INT-WAP-04, INT-WAP-05; OQ-07 |
| prd/research/00-baseline-corrections.md #7 (YouCan Pay closed, CMI switch) | INT-CAR-05; OQ-01 |
| prd/research/00-baseline-corrections.md #8 (Fatourati Aggregator 02/17/2026) | §3; INT-FAT-01 through INT-FAT-05 |
| prd/research/00-baseline-corrections.md #10 (digital usage) | OQ-04 |
| prd/research/00-baseline-corrections.md #11 (fragile Massar Excel re-import; ESISE) | INT-MAS-02, INT-MAS-04 |
| prd/research/00-baseline-corrections.md #13 (af-casablanca-1, a single AD) | INT-HEB-02, INT-HEB-03; OQ-05 |
| prd/research/00-baseline-corrections.md #14 (per-service PSCo licensing, qualified timestamp 04/2026) | INT-SIG-03, INT-SIG-04; OQ-08 |
| prd/research/00-baseline-corrections.md #15 (UBL e-invoicing, B2C out of scope) | INT-FAT-06 |
| prd/03-domain-data-model.md (INV-01, INV-11, INV-26, INV-37, INV-39, INV-43; `Notification`, `DeliveryLog`, `Payment`, `UsageMetric`, `AuditLog`) | INT-MAS-01, INT-MAS-03, INT-MAS-05; INT-FAT-02, INT-FAT-03; INT-CAR-01, INT-CAR-03; INT-SMS-02; INT-SIG-01, INT-SIG-02, INT-SIG-05; INT-EML-01, INT-EML-04 |
| prd/02-actors-personas.md (BES-DIR-02, BES-DIR-03, BES-SEC-05, BES-SUR-02, BES-PAR-02, BES-PAR-03, BES-PAR-07) | INT-MAS-01; INT-FAT-02; INT-SMS-01, INT-SMS-03; INT-WAP-03; INT-CAR-01 |
| prd/journeys/00-journey-map.md (PC-05, PC-07, PC-08, PC-09, PC-10, PC-11) | §3 (PC-08); INT-MAS-03 (PC-09); INT-SMS-01 (PC-05); INT-WAP-06 (PC-11) |
| ARB-01 (Massar exports in the MVP's wave 2) | INT-MAS-01, INT-MAS-02 |
| ARB-07 (foreign numbers, shared phone) | §5.2; INT-SIG-02 |
| ARB-15d (front-desk justification from the inbound queue) | INT-WAP-07 |
| ARB-17h (trimesters → Massar semesters) | INT-MAS-02 |
| ARB-20h (financial-guardian countersignature) | INT-SIG-02 |
| ARB-21b, ARB-21d, ARB-21g, ARB-21h (push in V1, STOP scope, single WABA, authentication SMS) | INT-WAP-03, INT-WAP-06, INT-WAP-07; §5.2, INT-SMS-03 |
| ARB-25c, ARB-25d (WhatsApp transfer basis, FCM/APNs) | INT-WAP-01, INT-WAP-03, INT-WAP-06 |
| ARB-25h (off-site replication from MVP onward) | §8.2; INT-HEB-06 |
| SEC-06, SEC-24 (anti-enumeration of the QR page) | INT-SIG-01 |
| Fatourati go/no-go 06/30/2027 | §3.4; INT-FAT-01; OQ-06 |
| Degraded mode and Fatourati inbound availability | INT-FAT-02 |
