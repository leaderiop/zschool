> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-CC-06                                                  |
> | Revision       | 1.1                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification — Cross-Cutting (External Integrations) |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/cross-cutting/35-external-integrations.md` (v0.3), old `INT-<SYS>-NN` -> `INT-ZS-NNN`, per `spec/process/id-migration-map.md` (CCR-ZS-001). 1.1 (2026-09-09): §8 (Cloud hosting) and INT-ZS-036/037/039/040 redefined for AWS `eu-central-1`/`eu-west-3` per ADR-ZS-091 (Accepted) (CCR-ZS-002). |

# External Integrations

## 1. Purpose and chapter conventions

This chapter describes ZSchool's **eight external integrations**: Massar/ESISE (`[MAS]`), CMI's Fatourati (`[FAT]`), card acquiring (`[CAR]`), the Moroccan SMS aggregator (`[SMS]`), the WhatsApp Business Platform (`[WAP]`), electronic signature and stamping under Law 43.20 (`[SIG]`), cloud hosting (`[HEB]`), and outbound email (`[EML]`). Detailed functional requirements remain carried by the module chapters (`spec/behaviors/01-*.md` through `spec/behaviors/14-*.md`); this chapter sets, for each system: the objective, the data flows, the contractual model, external dependencies, risks, and the `INT-ZS-NNN` requirements — each requirement's title keeps the system code in brackets, e.g. "INT-ZS-002: [MAS] Generate Massar-compliant Excel grade exports", since that code is meaningful and not opaque like the numeral.

Rules applied throughout the chapter:

1. **Identifier names**: `INT-ZS-NNN`, unified across all eight systems (the pre-migration scheme restarted the counter at 01 per system; the new scheme is one flat sequence, per `spec/process/requirement-id-scheme.md`).
2. **ZSchool never holds funds** ([ADR-ZS-031](../decisions/031-online-payment-rails.md)): every payment integration is designed so the school remains the creditor and beneficiary of the funds, ZSchool being only a software vendor and technical provider.
3. **Figures and rates**: only publicly sourced rates are cited, or amounts settled in the historical baseline. No price is invented; missing data is tracked as a contractual dependency (see `spec/appendices/01-review-history.md` for the closed H- hypothesis records) and as an open question in `spec/open-questions.md`.
4. **Versions**: MVP / V1 / V2+ tags strictly follow the historical baseline's scope-by-version (`spec/appendices/00-project-baseline.md` §12). Online payment is in V1 for the Fatourati rail and in V2 for registered-card payment ([ADR-ZS-031](../decisions/031-online-payment-rails.md), journey JMP-ZS-008 of `spec/journeys/00-journey-map.md`); MVP use of WhatsApp utility is the sole deviation, driven by founder arbitration D1 (absorbed into [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)) and tracked as OQ-ZS-323 in `spec/open-questions.md`.
5. **Compliance**: every flow leaving the territory (messaging, email) cross-references `spec/cross-cutting/07-legal-compliance-data-protection.md` (Law 09.08, CNDP, the F118 form); this chapter does not duplicate the legal analysis.
6. **Baseline/research divergences** found during the original drafting are tracked as OQ-ZS-321 through OQ-ZS-329 in `spec/open-questions.md`, not locally in this file.

---

## 2. [MAS] Massar and ESISE (Ministry of National Education)

### 2.1 Objective and scope

Massar is the ministry's information system; every student carries a **Massar code** (one letter followed by nine digits), the preferred matching key for the student's identity in ZSchool, unique and not mandatory ([ADR-ZS-015](../decisions/015-massar-code-as-preferred-matching-key.md), [INV-ZS-006](../invariants.md#inv-zs-006)). Massar **exposes no API** to software vendors (a closed, confirmed hypothesis — see `spec/appendices/01-review-history.md`): the only documented channel is Excel file import and export from the grade-entry module. ZSchool's goal is to **reduce double data entry** for schools ([URS-ZS-003](../urs.md)) by producing files faithful to Massar's templates, never automating entry into Massar and never promising a sync.

Scope covers: exports of continuous-assessment grades by subject, class, and semester; validation checks before submission; importing results of certifying exams (6AP, 3AC, 1st Bac, 2nd Bac); mirroring ESISE data (private-school census, HR reference data, year-end results); logging Massar transfer references. Entry into Massar itself remains out of scope.

### 2.2 Data flows

1. **Grade export (outbound)**: when an assessment period closes (`PeriodClosed` event, `spec/domain-model.md` §7), the Massar behaviors file (`spec/behaviors/12-massar-regulatory-exports.md`) generates an Excel file per subject, class, and semester, structured like the Massar module's import file; the principal's office downloads it and manually uploads it into Massar. Research confirms that Massar entry works via download-then-re-import of Excel files generated by Massar, that the column structure is not publicly documented, and that re-import often fails even without any file change — hence the requirement for faithful generation and a check before submission.
2. **Import of certifying results (inbound)**: grades for external exams (6AP, 3AC, 1st and 2nd Bac) come from the ministry, not the school; the registrar's office or the principal's office imports the results file transmitted via Massar, with an error report, and the grades feed period results (`PeriodResult`) without ever overwriting locally entered data without validation.
3. **ESISE mirror**: the school's census data (headcount by level, HR reference data, year-end results) can be exported in the format required by the three ESISE applications viewable at sise.men.gov.ma.
4. **Transfer reference**: the Massar transfer procedure (a request via the parent portal on Massar, validated by provincial education offices) is external; ZSchool records the request's reference in `TransferRequest` and logs the transfer (`spec/domain-model.md`, [INV-ZS-023](../invariants.md#inv-zs-023)).

### 2.3 Contractual model

No commercial contract: Massar is a public service used directly by the school, which remains responsible for its filings and the quality of its entries. ZSchool is a third-party vendor with no contractual relationship with the ministry; any move toward an official channel (API, partner program) would require the ministry's prior agreement before any automation. Massar file formats are de facto formats, with no public documentation: supporting them means faithfully reproducing the templates used by pilot schools.

### 2.4 External dependencies

- Massar's Excel import formats are not publicly documented and vary by cycle; validated by testing with the pilots.
- The Massar grades module's framing document is uncorroborated online; requirements are worded without relying on an exact reference number (OQ-ZS-322).
- Availability and reliability of the ministry's Massar portal, outside ZSchool's control.
- ESISE: three "view-only" applications (private-school census, HR reference data, year-end results); exact forms to be gathered from the pilots.

### 2.5 Risks

- Fragile Massar re-import: a file that looks correct to a human can be rejected by Massar (format errors or corruption reported by teachers); mitigated by INT-ZS-001 (validation and reporting) and by tests on the pilots' real files.
- Silent evolution of file templates from one year or cycle to the next; mitigated by a structure check at every generation and monitoring at every start of year.
- Unmet "sync" expectations: competing software advertises syncs that rely on the same file channel or unofficial automations; ZSchool never promises a sync.
- Enumeration of Massar codes via search functions: protection covered by `spec/cross-cutting/02-security-privacy.md`, restated here as an integration constraint.

### 2.6 Requirements

| ID | Title | Priority |
|---|---|---|
| INT-ZS-002 | [MAS] Generate Massar-compliant Excel grade exports | Must |
| INT-ZS-001 | [MAS] Validate every export before submission with an error report | Must |
| INT-ZS-003 | [MAS] Log transfers with their Massar reference | Must |
| INT-ZS-004 | [MAS] Provide ESISE data mirrors | Should |
| INT-ZS-005 | [MAS] Import results of certifying exams | Should |
| INT-ZS-006 | [MAS] Forbid any entry automation into Massar without an official channel | Must |

### INT-ZS-002: [MAS] Generate Massar-compliant Excel grade exports

> **Invariant:** [INV-ZS-006](../invariants.md#inv-zs-006)
> **See:** none
> **Priority:** Must
> **Version:** MVP (wave 2 — year-end close; [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md))
> **Acceptance:** [`@REQ-ZS-520`](../../features/cross-cutting/int/int-zs-002-massar-grade-export.feature)

REQUIREMENT: The system MUST generate, per school, an Excel file per subject, class, and
             semester, faithfully reproducing the structure of the Massar grades module's
             import file (columns, order, value formats, dual-script names); the file MUST
             be downloadable by the principal's office and the registrar's office once the
             period closes; no automation of the deposit into Massar is performed.

Actors: Principal's office, Registrar's office. Traceability: [URS-ZS-003](../urs.md); `spec/behaviors/12-massar-regulatory-exports.md` (BEH-ZS-263, BEH-ZS-264).

### INT-ZS-001: [MAS] Validate every export before submission with an error report

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP (wave 2; [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md))
> **Acceptance:** [`@REQ-ZS-521`](../../features/cross-cutting/int/int-zs-001-massar-export-validation.feature)

REQUIREMENT: Before any submission, the system MUST check the generated file: column
             structure matching the current template, value ranges (grades, coefficients),
             completeness per student and per subject, uniqueness of the Massar codes
             present, no corrupted values. A readable error report MUST list the rows
             involved and MUST block generation of a non-compliant file. For the bilingual
             trimester school ([ADR-ZS-035](../decisions/035-pilot-school-profiles.md)),
             the trimester-to-Massar-semester mapping is the one configured by the school
             ([ADR-ZS-058](../decisions/058-grading-calculation-rules-mvp.md)).

Actors: Principal's office, Registrar's office.

### INT-ZS-003: [MAS] Log transfers with their Massar reference

> **Invariant:** [INV-ZS-023](../invariants.md#inv-zs-023)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: During a transfer (journey JMP-ZS-009), the system MUST record in
             `TransferRequest` the Massar transfer request's reference when the school
             knows it, MUST log the procedure (dates, documents, declared provincial
             validation), and MUST keep the audit trail on the origin enrollment's
             TRANSFERRED closure. The Massar procedure itself remains external to ZSchool.

Actors: Principal's office, Registrar's office. Traceability: `spec/behaviors/09-transfers-mobility.md`.

### INT-ZS-004: [MAS] Provide ESISE data mirrors

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: The system MUST produce, for each school, the extracts needed for the three
             ESISE applications (private-school census, HR reference data, year-end
             results): headcount by level and class, teacher- and staff-affiliation data,
             year-end decisions. Exact forms are configured from the pilots and maintained
             per school year.

Actors: Principal's office. Traceability: `spec/behaviors/12-massar-regulatory-exports.md`.

### INT-ZS-005: [MAS] Import results of certifying exams

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-522`](../../features/cross-cutting/int/int-zs-005-certifying-exam-import.feature)

REQUIREMENT: The system MUST be able to import a file of external exam results (6AP, 3AC,
             1st Bac, 2nd Bac) transmitted via Massar, with a consistency check (student
             matched by Massar code, grades within range) and an error report; imported
             grades MUST feed the period results of the matching enrollment, MUST be
             timestamped as originating from the ministry, and MUST NOT overwrite local
             data without the principal's office's explicit confirmation.

Actors: Principal's office, Registrar's office. Traceability: `spec/domain-model.md` (`PeriodResult`).

### INT-ZS-006: [MAS] Forbid any entry automation into Massar without an official channel

> **Invariant:** none
> **See:** [ADR-ZS-015](../decisions/015-massar-code-as-preferred-matching-key.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (a negative/prohibitive requirement, no scenario)

REQUIREMENT: The system MUST implement no automation of entry into Massar (bots, portal
             injection, workarounds) as long as the ministry offers no official channel.
             Any change to the "no Massar API" hypothesis (see `spec/appendices/01-review-
             history.md`) MUST trigger a review of this chapter before any development.
             Product communications speak of "exports compliant with Massar templates",
             never of "sync".

Actors: Platform (ZSchool).

---

## 3. [FAT] Fatourati (CMI), the school-fee payment rail

### 3.1 Objective and scope

Fatourati is the CMI's interbank bill-payment network: 32 interconnected banks and payment institutions, over 70 digital and physical channels, over 25,000 cash-collection points; over 240 million transactions and over 220 billion dirhams collected across the whole system. Schools are an explicit target creditor segment for the system. The **Fatourati Aggregator** offer, launched on **02/17/2026**, lets a software vendor connect its own customers: API-based reference and QR generation, payment tracking; the vendor "is involved in neither fund management nor the regulatory framework", and **the school remains the creditor and beneficiary of the funds**.

ZSchool's goal: offer **Fatourati collections from V1 onward** as the primary rail ([ADR-ZS-031](../decisions/031-online-payment-rails.md), journey JMP-ZS-008), with the parent paying from their banking app, an ATM, a mobile wallet, a branch, or a cash point, with automatic reconciliation into the school's finances. Scope covers the Aggregator partnership (API), Collect mode for self-service schools, daily anti-duplicate reconciliation, and accounting integration of payments. DGI e-invoicing is a separate system, unrelated to this rail (INT-ZS-007).

### 3.2 Data flows

1. **Activation (configuration)**: the school is registered as a creditor with the system via ZSchool's Aggregator partnership; its creditor details (an identifier, a beneficiary account managed under the school's CMI contract) are recorded in the tenant.
2. **Bill generation (outbound, REST API)**: for each due installment (`Installment`), ZSchool produces a unique bill reference (per enrollment and per financial guardian) and a Fatourati QR code; the parent finds the reference in their portal and on the reminder notice.
3. **Real-time lookup (inbound)**: when a parent enters the reference on any channel, Fatourati queries ZSchool for the amount due; ZSchool responds from `Invoice`/`Installment` without holding any funds.
4. **Payment confirmation (inbound)**: upon collection, Fatourati confirms the payment; ZSchool automatically creates the `Payment` with mode "Fatourati", allocates it to the installment (reconciliation against 0..N installments), issues the receipt, and fires the `PaymentReceived` event.
5. **Daily reconciliation (inbound)**: a daily reconciliation file or call lists the previous day's payments; any discrepancy with received confirmations is flagged, any duplicate is rejected.
6. **Collect mode**: for a school not using the API, the school uses the Fatourati Collect web app on its own; payments are entered or imported into ZSchool by the registrar's office with supporting documentation, with no automatic confirmation.

### 3.3 Contractual model

Access via a "single contract": the CMI manages the relationship with banks and payment institutions, with the school as the final creditor. Under the Aggregator model, ZSchool is the vendor connected to the CMI by contract; each client school joins the system as a creditor, with no bank contract of its own with each channel. ZSchool is involved in neither fund management nor the regulatory framework. **Pricing and the contract's content (schools, Aggregator, Collect) are not public and remain to be obtained**: until obtained, no cost commitment is built into the business model (cross-reference `spec/cross-cutting/04-business-model-packaging.md`, [ADR-ZS-009](../decisions/009-single-plan-pricing.md)).

### 3.4 External dependencies

- Signing the Aggregator partnership with the CMI and obtaining API specifications and the contract: **contracting deadline of 06/30/2027** (go/no-go, one year before V1); failing that, V1 starts in Collect mode (INT-ZS-008) with a bill reference generated by the school, and the Aggregator API is deferred (dependency in `spec/roadmap.md`; risk in `spec/risks.md`).
- Each school joining as a creditor and validating its creditor details.
- Availability of the real-time lookup API and the daily reconciliation feed, with no publicly known SLA to date.
- Fatourati QR: bill payment by QR code presented at GITEX Africa in April 2026; general availability to be confirmed.

### 3.5 Risks

- Reliance on a single player (the CMI) for the primary collection rail; mitigated by keeping every manual method (cash, cheque, bank transfer) and direct debit via the school's own bank ([ADR-ZS-031](../decisions/031-online-payment-rails.md)).
- Delayed publication of rates and the contract: a risk to consumables margin and sales messaging; handled in OQ-ZS-326 and in `spec/risks.md`.
- Duplicate payments (simultaneous payment via two channels, re-entry after a cash point): mitigated by a unique reference per installment and duplicate rejection during daily reconciliation (INT-ZS-009).
- Confusion between CMI's Fatourati (bill payment) and the DGI's e-invoicing platform: handled by INT-ZS-007 and `spec/cross-cutting/07-legal-compliance-data-protection.md`.
- Arrears and documents: the payment rail introduces no blocking of official documents ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [INV-ZS-016](../invariants.md#inv-zs-016)).

### 3.6 Requirements

| ID | Title | Priority |
|---|---|---|
| INT-ZS-010 | [FAT] Generate bill references and Fatourati QR codes via the Aggregator API | Must |
| INT-ZS-011 | [FAT] Answer debt lookups in real time and record payment confirmations | Must |
| INT-ZS-009 | [FAT] Reconcile daily and reject duplicates | Must |
| INT-ZS-008 | [FAT] Offer Collect mode for self-service schools | Should |
| INT-ZS-012 | [FAT] Guarantee the school remains the creditor and ZSchool holds no funds | Must |
| INT-ZS-007 | [FAT] Distinguish the CMI Fatourati rail from DGI e-invoicing | Should |

### INT-ZS-010: [FAT] Generate bill references and Fatourati QR codes via the Aggregator API

> **Invariant:** none
> **See:** [ADR-ZS-031](../decisions/031-online-payment-rails.md)
> **Priority:** Must
> **Version:** V1 (contingent on the Aggregator contract by 06/30/2027; Collect fallback)
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: For every subscribed school and every installment due, the system MUST
             generate via the Aggregator partnership's API a unique bill reference and a
             Fatourati QR code, attached to the enrollment and the financial guardian. The
             reference MUST be visible to the parent (portal, reminder notifications) and
             at the school's front desk. A reference MUST cover only one installment or an
             expressly selected balance, never an open amount. **Go/no-go**: the Aggregator
             contract (pricing, specifications, SLA) must be signed by 06/30/2027 at the
             latest; past that date, V1 ships with Collect mode (INT-ZS-008) as a fallback
             rail, with the API requirement remaining on the roadmap.

Actors: Registrar's office, Accounting, Parent (payer), Platform (ZSchool). Traceability: journey JMP-ZS-008; `spec/behaviors/07-finance-billing-collections.md`.

### INT-ZS-011: [FAT] Answer debt lookups in real time and record payment confirmations

> **Invariant:** none
> **See:** [ADR-ZS-031](../decisions/031-online-payment-rails.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-523`](../../features/cross-cutting/int/int-zs-011-paying-installment-fatourati.feature)

REQUIREMENT: When Fatourati queries a reference, the system MUST respond in real time with
             the amount due and the creditor details from the school's billing. Upon
             receiving a payment confirmation, it MUST automatically create the payment
             with mode "Fatourati", allocate it to the relevant installment, issue the
             receipt, and notify the parent (`PaymentReceived`), with no manual front-desk
             action. **Inbound availability and degraded mode**: the lookup endpoint
             exposed to Fatourati targets 99.9% monthly availability, is excluded from
             maintenance windows ([NFR-ZS-002](../cross-cutting/03-non-functional-requirements.md):
             other services may be under maintenance, not this one), and is served by an
             isolated component; as a fallback, ZSchool deposits with Fatourati each night
             the state of open bills ("deposited bills" mode), which serves parents when
             the real-time lookup fails; payments received against a deposited bill are
             reconciled by INT-ZS-009 and flagged "to reconcile" until confirmed. A parent
             MUST never be prevented from paying by a ZSchool outage.

Actors: Platform (ZSchool), Parent (payer), Registrar's office. Traceability: [URS-ZS-036](../urs.md); `spec/domain-model.md`; `spec/behaviors/07-finance-billing-collections.md`; [NFR-ZS-008](../cross-cutting/03-non-functional-requirements.md).

### INT-ZS-009: [FAT] Reconcile daily and reject duplicates

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-524`](../../features/cross-cutting/int/int-zs-009-daily-fatourati-reconciliation.feature)

REQUIREMENT: Each day, the system MUST reconcile confirmed payments with the Fatourati
             reconciliation report, MUST reject any duplicate (a reference already
             reconciled), and MUST produce a discrepancy statement for the school's
             accounting (payments not found, confirmations with no payment, mismatched
             amounts) that can be handled at the front desk. No payment can be counted
             twice against the same reference.

Actors: Accounting, Registrar's office, Platform (ZSchool). Traceability: `spec/behaviors/07-finance-billing-collections.md`.

### INT-ZS-008: [FAT] Offer Collect mode for self-service schools

> **Invariant:** none
> **See:** [ADR-ZS-031](../decisions/031-online-payment-rails.md)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: For a school not using the API model, the system MUST support Fatourati
             Collect mode: the school manages its bills in the Collect app and declares
             payments collected in ZSchool (manual entry or import of a payments
             statement) with supporting documentation. Declared payments MUST be
             distinguished from API-confirmed payments and MUST produce no automatic
             confirmation.

Actors: Registrar's office, Accounting.

### INT-ZS-012: [FAT] Guarantee the school remains the creditor and ZSchool holds no funds

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (a structural/prohibitive requirement, no scenario)

REQUIREMENT: In every Fatourati flow, funds MUST be collected within the CMI system for
             the benefit of the creditor school; ZSchool MUST hold, move, or transfer no
             funds and MUST store no parent bank-account data. Data processed is limited
             to bill references, amounts, statuses, and reconciliation information. Any
             contractual change that would route funds through ZSchool is prohibited
             without a payment-institution license, a hypothesis off the roadmap.

Actors: Platform (ZSchool), Principal's office. Traceability: `spec/cross-cutting/07-legal-compliance-data-protection.md`.

### INT-ZS-007: [FAT] Distinguish the CMI Fatourati rail from DGI e-invoicing

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: The system MUST explicitly distinguish, in the data model and in labels, the
             CMI's Fatourati bill-payment rail (this chapter) from DGI e-invoicing (a
             clearance model, UBL format, implementing decree not published as of mid-2026
             — see `spec/appendices/01-review-history.md`). UBL export preparation and the
             regulatory timeline fall to the finance behaviors and the compliance chapter;
             no payment requirement depends on the DGI decree. Most schools billing
             individual parents (B2C) are outside the reform's initial scope.

Actors: Platform (ZSchool), Accounting. Traceability: `spec/cross-cutting/07-legal-compliance-data-protection.md`; `spec/behaviors/07-finance-billing-collections.md`.

---

## 4. [CAR] Registered card payment (NAPS, Chari Pay, bank-affiliated acquirers)

### 4.1 Objective and scope

In V2 ([ADR-ZS-031](../decisions/031-online-payment-rails.md)), ZSchool enables **paying installments by registered card** (Card-On-File / tokenized recurring payment). The acquiring landscape as of 09/09/2026: the CMI is no longer a commercial acquirer but a **national switch**; since 05/01/2025 acquiring is handled by banks and payment institutions, with the transfer of some 55,000 CMI merchant contracts to 7 bank-affiliated acquirers (Attijari Payment, M2T, Damane Cash, Lana Cash, Al Filahi Cash, Saham Paiements, CDM Pay) finalized on 01/31/2026; independent players NAPS, Barid Cash, and VPS also operate. **YouCan Pay ceased operations in January 2024** without a Bank Al-Maghrib license and is excluded from references. Stripe is not available for Moroccan entities.

Goal: connect ZSchool to the acquirer chosen by each school for card-based recurring payments, as a **technical provider**, never holding funds. Scope covers card tokenization at the acquirer, triggering installment payments, the recurring debit mandate, disbursements (including split payments for groups), and compliance safeguards.

### 4.2 Data flows

1. **Subscription (outside ZSchool)**: the school subscribes to its own card-acceptance contract with an acquirer — NAPS (its e-Premium offer: 1.98% excl. VAT domestic, 3% international, onboarding fee 29,900 MAD excl. VAT, an annual subscription of 5,900 MAD/year waived the first year, Card-On-File and installment payment included) or Chari Pay (recurring and one-click tokenization, real-time split payments, 3DS 2.0, tiered pricing "from 1.8%", no fixed fees) or a bank-affiliated acquirer from the CMI transfer. Rates are those published by vendors as of the PRD's date.
2. **Parent enrollment (inbound/outbound)**: from the parent portal, the payer consents to a recurring-payment mandate; the card is tokenized directly at the acquirer (3DS 2.0 where applicable); ZSchool retains only the token identifier, the masked issuer, and the mandate status — never card data.
3. **Triggering at the due date (outbound)**: on the due date, ZSchool sends the acquirer's API a payment request for the amount due in the school's name; confirmation creates the `Payment` with mode "card", the receipt, and the `PaymentReceived` notification; a failure triggers the existing graduated reminder (`InstallmentOverdue`).
4. **Disbursements**: funds are settled directly by the acquirer into the school's account; for multi-site groups, splitting between beneficiaries uses the acquirer's split payments (Chari Pay offers real-time splitting; no public evidence of multi-school disbursement was found for Payzone, which is excluded as a disbursement rail and reclassified as simple per-school card acceptance).
5. **Reconciliation**: daily transaction and settlement reports from the acquirer are reconciled with recorded payments, per the same anti-duplicate principle as INT-ZS-009.

### 4.3 Contractual model

**The acquiring contract is taken out by the school**; ZSchool is a technical provider (integration, triggering, tracking) and, at most, an agent that holds no funds: a platform holding parents' funds would need a Bank Al-Maghrib payment-institution license, a hypothesis ruled out by the historical baseline. White-label and agent models are subject to Bank Al-Maghrib's principal-agent status (Chari's case). For reference, domestic interchange has been capped at 0.65% since October 2024. ZSchool signs no contract on behalf of schools and takes no margin on acquiring fees; any potential ZSchool involvement in collecting commissions is covered in `spec/cross-cutting/04-business-model-packaging.md`.

### 4.4 External dependencies

- Each school's own acquiring contract (NAPS, Chari Pay, or a bank-affiliated acquirer); ZSchool depends on the chosen acquirer opening a merchant API and on tokenization documentation.
- Chari Pay: direct acquiring planned for late 2026 pending Bank Al-Maghrib approval; timeline to confirm.
- 3DS 2.0 compliance and strong issuer authentication rules for recurring payments.
- Evolution of NAPS/Chari rate grids (published as of the PRD's date): any change is absorbed as external data, never recalculated by ZSchool.

### 4.5 Risks

- Fragmented integrations: each acquirer has its own API; mitigated by a single internal adapter layer and a targeted small number of V2 connectors.
- Card cost (1.8 to 3%) higher than the Fatourati rail: card payment's role is automating recurrence, not replacing the bank rail; product messaging presents Fatourati as the primary rail ([ADR-ZS-031](../decisions/031-online-payment-rails.md)).
- Consumer disputes and payment reversals (chargebacks): a dispute procedure to document with each acquirer; ZSchool logs requests and evidence without arbitrating.
- Resurgence of unlicensed players (the case of YouCan Pay, closed in January 2024): safeguard INT-ZS-013.
- Card data: ZSchool stores none; PCI scope falls to the acquirer and hosted enrollment, a constraint covered in `spec/cross-cutting/02-security-privacy.md`.

### 4.6 Requirements

| ID | Title | Priority |
|---|---|---|
| INT-ZS-014 | [CAR] Connect to the school's acquirer for tokenization and recurring payment | Must |
| INT-ZS-015 | [CAR] Keep the acquiring contract in the school's name with ZSchool as technical provider | Must |
| INT-ZS-016 | [CAR] Manage the recurring-payment mandate lifecycle | Must |
| INT-ZS-017 | [CAR] Split a group's multi-beneficiary disbursements via the acquirer's split payments | Could |
| INT-ZS-013 | [CAR] Exclude non-compliant payment rails | Must |
| INT-ZS-018 | [CAR] Reconcile card transactions daily with the school's finances | Must |

### INT-ZS-014: [CAR] Connect to the school's acquirer for tokenization and recurring payment

> **Invariant:** none
> **See:** [ADR-ZS-031](../decisions/031-online-payment-rails.md)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-525`](../../features/cross-cutting/int/int-zs-014-automatic-card-payment.feature)

REQUIREMENT: The system MUST integrate with the API of the acquirer configured by the
             school (NAPS e-Premium, Chari Pay, or a bank-affiliated acquirer) for: hosted
             mandate enrollment (card tokenization at the acquirer, 3DS 2.0 authentication
             where applicable), viewing the mandate status, and triggering installment
             payments. ZSchool MUST store no card data, only the token, the masked last
             four digits, and the status.

Actors: Parent (payer), Accounting, Platform (ZSchool). Traceability: `spec/cross-cutting/02-security-privacy.md`.

### INT-ZS-015: [CAR] Keep the acquiring contract in the school's name with ZSchool as technical provider

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: Activating card payment MUST require the school to provide proof of its
             card-acceptance contract with the acquirer; ZSchool configures the
             integration in the school's name and on its behalf, never holding funds or
             signing a commercial contract in its own name. Settlement details (the
             school's IBAN) are entered only at the acquirer. Terminating the school's
             contract suspends triggering without affecting financial history.

Actors: Principal's office, Platform (ZSchool).

### INT-ZS-016: [CAR] Manage the recurring-payment mandate lifecycle

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: The payer MUST be able to consent to, modify, suspend, or revoke their
             mandate from the parent portal; every action is timestamped and logged.
             Revocation halts future triggers without cancelling payments already
             reconciled. The school can view the status of its payers' mandates and resend
             the enrollment invitation, never seeing card data.

Actors: Parent (payer), Registrar's office, Accounting. Traceability: [URS-ZS-040](../urs.md); `spec/domain-model.md` (`Payment`).

### INT-ZS-017: [CAR] Split a group's multi-beneficiary disbursements via the acquirer's split payments

> **Invariant:** none
> **See:** none
> **Priority:** Could
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: When a school group operates several schools with distinct settlement
             accounts, splitting funds between beneficiaries MUST be handled by the
             acquirer's split payments (documented to date for Chari Pay); ZSchool
             transmits the bill split between tenants and keeps a per-school audit trail.
             No disbursement is performed by ZSchool.

Actors: Principal's office (group), Accounting, Platform (ZSchool).

### INT-ZS-013: [CAR] Exclude non-compliant payment rails

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** none (a negative/prohibitive requirement, no scenario)

REQUIREMENT: The system MUST integrate, at no version, an acquiring or intermediation
             provider with no current Bank Al-Maghrib license: YouCan Pay (operations
             ceased in January 2024) is the reference example; Stripe and PayPal, which do
             not cover Moroccan merchant collection, are not adopted. Payzone is not
             adopted as a multi-school disbursement rail (no public evidence), at most as
             card acceptance under a school's own contract. Any new rail proposal is set
             aside until its license and fund-flow model are verified.

Actors: Platform (ZSchool).

### INT-ZS-018: [CAR] Reconcile card transactions daily with the school's finances

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: Each day, the system MUST reconcile card transactions (successful, declined,
             refunded) with recorded payments and the acquirer's reports, MUST reject
             duplicates, and MUST produce a discrepancy statement for accounting, per the
             same principles as INT-ZS-009. The school's account settlements are tracked
             as reconciliation information, with no fund movement through ZSchool.

Actors: Accounting. Traceability: `spec/behaviors/07-finance-billing-collections.md`.

---

## 5. [SMS] Moroccan SMS aggregator

### 5.1 Objective and scope

SMS is the **universal** notification channel at MVP: attendance, reminders, announcements ([ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-009](../decisions/009-single-plan-pricing.md)); it remains the critical fallback channel for households without a smartphone or in poorly covered areas (household internet access: 93.6% urban versus 78.4% rural, ANRT 2024-2025). Goal: operate a **Moroccan SMS aggregator** via a platform account, with an **alphanumeric sender ID** per school for transactional messages, per-tenant credit accounting, and exclusion of the LowCost regime (out of scope for packs, a V2+ evolution to be studied separately — INT-ZS-019 and `spec/cross-cutting/04-business-model-packaging.md` §5.1). Scope covers transactional sending, delivery and cost tracking (`DeliveryLog`), resold prepaid packs ([ADR-ZS-009](../decisions/009-single-plan-pricing.md)), and opt-in and opposition rules; per-message-type routing rules fall to `spec/behaviors/08-communication-notifications.md`.

### 5.2 Data flows

1. **Sending (outbound)**: a notifiable event (e.g. `AbsenceRecorded`, `ReminderSent`, `ReportCardPublished`) produces an SMS-channel `Notification`; the system transmits to the aggregator the recipient's number, the content (limited by segment size), the school's alias, and a correlation reference.
2. **Statuses and costs (inbound)**: send and delivery (and failure) receipts feed `DeliveryLog` with the unit cost charged by the aggregator, allocated to the school (`spec/domain-model.md`).
3. **Credits and packs**: every school has a credit counter funded by purchasing prepaid packs (resold by ZSchool at a Moroccan aggregator's rate, 0.30 to 0.50 MAD per SMS with margin, [ADR-ZS-009](../decisions/009-single-plan-pricing.md)); counters feed `UsageMetric` for consumables billing. Authentication SMS (OTP, MFA, invitations, claims) is sent from a separate platform account, borne by ZSchool, and never deducted from a school's credits (`spec/cross-cutting/04-business-model-packaging.md` PAK-17; [ADR-ZS-062](../decisions/062-communication-rules-batch.md)); an SMS to a foreign number ([ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md)) travels through an international gateway, entered in the vendor register ([SEC-ZS-023](../cross-cutting/02-security-privacy.md)), at actual cost allocated per `spec/behaviors/08-communication-notifications.md`.
4. **Channel hierarchy**: SMS operates per the [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md) hierarchy (push first, WhatsApp utility for consenting parents, SMS as a fallback), with routing rules carried by `spec/behaviors/08-communication-notifications.md`.

### 5.3 Contractual model

Reference market as of 09/09/2026: Moroccan aggregators operate on a **prepaid self-service** basis for the school (credits with no expiry). Two sending regimes: the **alphanumeric alias** (11 characters, "premium" routing) priced around 0.31 to 0.36 DH depending on volume (5,000 to 100,000 SMS at bulksms.ma); the **LowCost** regime (a variable mobile-number sender) priced around 0.05 to 0.10 DH but unsuited to identified transactional use. Other references found: bulksmsmaroc.com (290 DH for 1,000), marocdata (0.44 to 0.54 DH), BulkGate (€0.1024, sender-ID approval in one to two weeks). ZSchool subscribes to the aggregator account in its own name (a single multi-tenant platform account) and **resells packs to schools** ([ADR-ZS-009](../decisions/009-single-plan-pricing.md)); no formal reseller program is published by aggregators. The final choice of aggregator (rates, API, coverage) is an execution decision made after this spec, with no impact on the requirements below.

### 5.4 External dependencies

- A Moroccan aggregator's contract and API (routing, delivery receipts, send and status API).
- Approval of each school's alphanumeric alias with carriers (a one-to-two-week delay observed at some aggregators).
- The Law 09.08 framework and 2019 CNDP-ANRT guidance: opt-in and opposition for marketing; transactional messages are outside marketing scope but the number database must be declared (the exact enforceable text was not found); cross-referenced to `spec/cross-cutting/07-legal-compliance-data-protection.md`.

### 5.5 Risks

- Single-aggregator service disruption: mitigated by abstracting the vendor in the sending code (one connector at a time, a single interface) and by the channel hierarchy (push and WhatsApp cover most parents).
- Cost drift (bulk SMS at the start of the year and at report-card publication, `spec/journeys/00-journey-map.md`): counters and threshold alerts per school (INT-ZS-020).
- Poor sender identification (messages rejected or ignored): a dedicated alias per school and a ban on LowCost for transactional messages (INT-ZS-019).
- Drift into marketing use: ZSchool's SMS channel is strictly transactional; marketing is out of the platform's scope (opt-in and opposition managed per the CNDP-ANRT framework).

### 5.6 Requirements

| ID | Title | Priority |
|---|---|---|
| INT-ZS-021 | [SMS] Send transactional SMS via a Moroccan aggregator with a per-school alias | Must |
| INT-ZS-022 | [SMS] Track status and cost for every SMS in the delivery log | Must |
| INT-ZS-020 | [SMS] Manage prepaid packs, credit counters, and threshold alerts per school | Must |
| INT-ZS-019 | [SMS] Reserve the alias for transactional messages and exclude LowCost | Should |
| INT-ZS-023 | [SMS] Apply opt-in and opposition on SMS sends | Must |

### INT-ZS-021: [SMS] Send transactional SMS via a Moroccan aggregator with a per-school alias

> **Invariant:** none
> **See:** [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-526`](../../features/cross-cutting/int/int-zs-021-absence-notification-by-sms.feature)

REQUIREMENT: The system MUST send SMS notifications via an account on a Moroccan
             aggregator, with an alphanumeric alias identifying the sending school (a
             short name, approved by carriers). Every send MUST carry a correlation
             reference to the originating `Notification`. Sending is available from MVP
             onward for attendance and communication notifications.

Actors: Platform (ZSchool), all notification-sending roles. Traceability: [URS-ZS-019](../urs.md), [URS-ZS-035](../urs.md); `spec/behaviors/08-communication-notifications.md`.

### INT-ZS-022: [SMS] Track status and cost for every SMS in the delivery log

> **Invariant:** none
> **See:** [ADR-ZS-009](../decisions/009-single-plan-pricing.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: Every SMS MUST produce a `DeliveryLog` entry: channel, statuses (sent,
             delivered, failed with a carrier reason), unit cost charged, and the school
             allocated. Consolidated costs feed `UsageMetric` and the school's
             credit-balance view. Bulk sends (announcements, reminders) are counted as a
             single viewable batch.

Actors: Principal's office, Registrar's office, Platform (ZSchool). Traceability: `spec/domain-model.md` (`DeliveryLog`, `UsageMetric`); `spec/behaviors/08-communication-notifications.md`.

### INT-ZS-020: [SMS] Manage prepaid packs, credit counters, and threshold alerts per school

> **Invariant:** none
> **See:** [ADR-ZS-009](../decisions/009-single-plan-pricing.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-527`](../../features/cross-cutting/int/int-zs-020-sms-credit-balance-depletion.feature)

REQUIREMENT: Every school MUST have an SMS credit counter funded by purchasing packs
             (resale price within the [ADR-ZS-009](../decisions/009-single-plan-pricing.md)
             range: 0.30 to 0.50 MAD per SMS). The system MUST block non-critical sends
             beyond the balance (except a configurable emergency queue), MUST warn at
             configurable thresholds (default: 20% and 10% of the last pack), and MUST log
             purchases and consumption. The remaining credit is visible to the principal's
             office and the registrar's office. Authentication SMS never draws on this
             credit (`spec/cross-cutting/04-business-model-packaging.md` PAK-17).

Actors: Principal's office, Registrar's office, Platform (ZSchool). Traceability: `spec/cross-cutting/04-business-model-packaging.md` (PAK-17); `spec/domain-model.md` (`UsageMetric`).

### INT-ZS-019: [SMS] Reserve the alias for transactional messages and exclude LowCost

> **Invariant:** none
> **See:** [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Should
> **Version:** MVP (transactional ban)
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: Every transactional message (absence, reminder, receipt, report card,
             notice) MUST be sent under the school's alphanumeric alias (premium
             routing); the LowCost regime (a variable mobile-number sender, priced around
             0.05 to 0.10 DH) MUST NOT be used at any shipped version, with the ban on
             transactional use active from the MVP's first send. It is out of scope for
             packs (`spec/cross-cutting/04-business-model-packaging.md` §5.1); a possible
             use for non-critical bulk alerts expressly authorized by the school — a clear
             school identification in the message body, banned for any message naming a
             student or a payment — would be a separate V2+ evolution to study, out of
             scope for this requirement.

Actors: Principal's office, Platform (ZSchool). Traceability: `spec/cross-cutting/04-business-model-packaging.md` §5.1.

### INT-ZS-023: [SMS] Apply opt-in and opposition on SMS sends

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: ZSchool's SMS messages are transactional (performing the schooling
             contractual relationship); any marketing use is excluded. The system MUST
             handle opposition: a stop request on a number suspends non-mandatory SMS
             sends to that recipient for the school concerned, without cutting mandatory
             security notifications, and MUST log the request. The number database is
             covered by the school's CNDP declarations (a template provided by ZSchool),
             per the compliance chapter.

Actors: Parent, Principal's office, Platform (ZSchool). Traceability: `spec/cross-cutting/07-legal-compliance-data-protection.md`.

---

## 6. [WAP] WhatsApp Business Platform

### 6.1 Objective and scope

WhatsApp is the dominant communication channel toward parents: 98.6% of Moroccan social-media users use it (ANRT 2024-2025). [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md) sets the hierarchy: push first, **WhatsApp "utility" for consenting parents**, SMS as a fallback. Integration goes through the **WhatsApp Business Platform** (Meta's Cloud API or an official BSP); unofficial APIs are banned by the terms of service and forbidden; no local carrier (IAM, Orange, inwi) is a BSP; no self-hosting. Scope covers: platform access (direct Cloud API or a BSP such as 360dialog, Twilio, Infobip, Gupshup, CM.com), Meta Business verification, utility templates and their approval, opt-in and opposition, and the 10/01/2026 pricing switch. Versions (founder arbitration D1, absorbed into [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md), tracked at OQ-ZS-323): at MVP, minimal WhatsApp utility use limited to attendance notifications (one or two templates); in V1, generalized to all messages, template management, and push. Pricing has been **per-message since 07/01/2025**; on **10/01/2026**, free service and utility messages within the 24-hour window end, and Morocco exits "Rest of Africa" regional rates for a standalone rate card (higher utility and authentication, authentication-international), grids announced before 09/01/2026.

### 6.2 Data flows

1. **Onboarding (configuration)**: creating and verifying ZSchool's Meta Business account, attaching a **single platform WABA number at MVP** (INT-ZS-024, [ADR-ZS-062](../decisions/062-communication-rules-batch.md)), with the school identified in every message's body; a per-school number and display name in V1 as an option (the school's own Meta Business verification); choosing the access mode (direct Cloud API with Meta billing, or a BSP with contract billing).
2. **Templates (outbound/inbound)**: utility templates (absence, payment reminder, report-card publication, notice) are submitted for Meta's approval (delays observed from minutes to hours); they must stay transactional or risk reclassification as marketing (costlier); usage-based re-categorization is monitored.
3. **Sending (outbound)**: a notifiable event produces a WhatsApp-channel `Notification`; the system sends the template with its variables to the opted-in recipient's number, with a correlation reference to the notification; statuses (sent, delivered, read, failed) feed `DeliveryLog` with the message cost.
4. **Inbound replies**: parent replies open a 24-hour window; from 10/01/2026 onward, inbound and service messages are also billed (the end of free messages within the window); replies are not routed into moderated parent–teacher threads ([ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md)): they receive an automatic bilingual receipt pointing to the app and are transmitted to the relevant school's student-life team in an inbound-message queue (INT-ZS-024); WABA numbers are not unlimited free-conversation channels.
5. **Opt-in and opposition**: WhatsApp consent is collected per guardian and per school, with an explicit statement that contact data is transferred outside Morocco (Meta servers), and serves as the transfer basis at MVP ([ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md); the F118 request filed in parallel, [CNF-ZS-001](../cross-cutting/07-legal-compliance-data-protection.md)); it is revocable at any time (a STOP-type opposition, whose scope is limited to reminders and announcements, [ADR-ZS-062](../decisions/062-communication-rules-batch.md)); the number database is covered by the school's CNDP declarations (cross-reference `spec/cross-cutting/07-legal-compliance-data-protection.md`).

### 6.3 Contractual model

Two access models, to be settled at execution (OQ-ZS-327 for the pricing grid): **direct Cloud API** (free access, Meta billing by volume, business-account setup borne by ZSchool) or an **official BSP** accessible from Morocco (360dialog at a flat rate of roughly $59/month per its published pricing, Twilio, Infobip, Gupshup, CM.com). Current order-of-magnitude rates to +212: utility around €0.0064 per message (roughly eight times cheaper than an alias SMS at 0.31-0.36 DH), marketing around €0.0357; a Moroccan vendor advertises around 0.55 MAD per message all-inclusive — all outdated after the 10/01/2026 switch. WhatsApp consumption is resold to schools like SMS (consumables, [ADR-ZS-009](../decisions/009-single-plan-pricing.md), `spec/cross-cutting/04-business-model-packaging.md`). ZSchool operates the platform account; the school's display name follows Meta's rules.

### 6.4 External dependencies

- ZSchool's Meta Business verification, approval of the single WABA number and templates: external delays to build into the launch schedule — required from MVP onward for the utility-attendance scope (arbitration absorbed into [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md), OQ-ZS-323); milestone "WABA verified and templates approved" before 01/15/2027 (`spec/roadmap.md`).
- Publication of Morocco's standalone rate cards (announced before 09/01/2026; to verify and configure, OQ-ZS-327).
- BSP: availability, support, and MAD billing to confirm depending on the vendor.
- The Law 09.08 framework and 2019 CNDP-ANRT guidance for opt-in and opposition.

### 6.5 Risks

- 10/01/2026 pricing switch: higher cost for utility and service messages and billing for messages within the 24-hour window; the consumables business model must also budget for inbound replies ([ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)).
- A template reclassified as marketing (content deemed promotional): multiplied costs; mitigated by template review and re-categorization monitoring.
- Number or Meta account suspension (reports, non-compliant templates): mitigated by strict adherence to Meta's rules, utility-only use, and the SMS fallback of the [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md) hierarchy.
- Single-BSP dependency: abstracting the sending vendor on ZSchool's side.
- Expectations of free conversation: product framing (transactional notifications; moderated in-app threads, [ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md)).

### 6.6 Requirements

| ID | Title | Priority |
|---|---|---|
| INT-ZS-025 | [WAP] Access the WhatsApp Business Platform via direct Cloud API or an official BSP after Meta Business verification | Must |
| INT-ZS-027 | [WAP] Manage utility templates with prior Meta approval | Must |
| INT-ZS-026 | [WAP] Collect WhatsApp opt-in and handle opposition | Must |
| INT-ZS-028 | [WAP] Configure the 10/01/2026 pricing switch and Morocco's standalone rate card | Must |
| INT-ZS-029 | [WAP] Budget for inbound messages and the service window after the switch | Should |
| INT-ZS-030 | [WAP] Follow the push, WhatsApp utility, SMS-alias channel hierarchy | Must |
| INT-ZS-024 | [WAP] Operate a single platform WhatsApp Business account at MVP and handle inbound replies | Must |

### INT-ZS-025: [WAP] Access the WhatsApp Business Platform via direct Cloud API or an official BSP after Meta Business verification

> **Invariant:** none
> **See:** [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP (minimal scope: attendance utility, one or two templates, a single WABA, express consent — arbitration absorbed into [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)); V1 (generalized)
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: The system MUST send WhatsApp notifications exclusively via the official
             WhatsApp Business Platform (Meta's Cloud API or an official BSP such as
             360dialog, Twilio, Infobip, Gupshup, or CM.com), after Meta Business
             verification and number approval. No unofficial API is used. The direct
             Cloud API vs. BSP choice is a runtime configuration; the sending connector is
             abstracted from the vendor. Scope by version: at MVP, use limited to
             attendance notifications via minimal utility templates (one or two), on a
             single platform WABA number (INT-ZS-024), with the recipient's express
             consent collected with a transfer notice (INT-ZS-026) as the legal transfer
             basis, and Meta entered in the vendor register ([SEC-ZS-023](../cross-cutting/02-security-privacy.md));
             in V1, generalized to all messages, template management, and the push channel
             of the [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
             hierarchy.

Actors: Platform (ZSchool), Principal's office. Traceability: `spec/behaviors/08-communication-notifications.md`; `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`.

### INT-ZS-027: [WAP] Manage utility templates with prior Meta approval

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP (one or two attendance utility templates); V1 (full management)
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: Every outbound WhatsApp message outside the service window MUST use a
             utility template previously approved by Meta (absence, payment reminder,
             report-card publication, notice, event). The system MUST manage the template
             lifecycle: bilingual drafting with variables, submission, approval status,
             revocation, replacement; it monitors usage-based re-categorization and alerts
             when a template is reclassified as marketing. No marketing message is sent
             over this channel. At MVP, only the one or two attendance-notification
             utility templates are submitted and tracked; full lifecycle management ships
             in V1.

Actors: Platform (ZSchool), Principal's office. Traceability: `spec/behaviors/08-communication-notifications.md`.

### INT-ZS-026: [WAP] Collect WhatsApp opt-in and handle opposition

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP (opt-in with a transfer notice, the legal basis for the attendance-utility channel); V1
> **Acceptance:** [`@REQ-ZS-528`](../../features/cross-cutting/int/int-zs-026-whatsapp-consent-and-fallback.feature)

REQUIREMENT: The WhatsApp channel is used only for consenting guardians, with opt-in
             collected per school (at enrollment, from the parent portal), timestamped
             and revocable. The opt-in text explicitly states that contact data and
             notification content are processed by Meta outside Morocco, in a country
             outside the adequacy list; this **express consent constitutes the transfer
             basis at MVP** ([ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)),
             with the F118 request filed in parallel ([CNF-ZS-001](../cross-cutting/07-legal-compliance-data-protection.md)).
             Opposition (a stop keyword or a portal opt-out) MUST immediately suspend
             WhatsApp sends to that recipient for the school concerned, with the channel
             hierarchy falling back to SMS per the school's rules; a stop keyword
             received by WhatsApp or SMS applies only to reminders and announcements:
             attendance, security, and authentication notifications keep being sent and
             the parent is informed ([ADR-ZS-062](../decisions/062-communication-rules-batch.md)).
             Consents and opt-outs MUST be logged and covered by the school's CNDP
             declarations.

Actors: Parent, Principal's office, Platform (ZSchool). Traceability: [URS-ZS-035](../urs.md); `spec/cross-cutting/07-legal-compliance-data-protection.md`.

### INT-ZS-028: [WAP] Configure the 10/01/2026 pricing switch and Morocco's standalone rate card

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP (at the first WhatsApp send); V1
> **Acceptance:** [`@REQ-ZS-529`](../../features/cross-cutting/int/int-zs-028-pricing-switch.feature)

REQUIREMENT: The system MUST carry the 10/01/2026 pricing-switch date as a platform
             parameter: before the date, the current utility grid; from the date onward,
             Morocco's standalone rate card (higher utility and authentication rates, end
             of free service and utility messages within the 24-hour window) per the
             grids Meta publishes (OQ-ZS-327, to verify and update). Unit costs are
             configuration data per category and destination, never fixed constants. The
             configuration is active from the MVP's first WhatsApp utility send, which
             comes after the switch date.

Actors: Platform (ZSchool). Traceability: `spec/cross-cutting/04-business-model-packaging.md`.

### INT-ZS-029: [WAP] Budget for inbound messages and the service window after the switch

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: From 10/01/2026 onward, inbound and service messages within the 24-hour
             window are billed: the system MUST count inbound messages per school in
             `UsageMetric` and `DeliveryLog`, MUST expose inbound consumption on the
             school's cost dashboards, and MUST apply consumable credit counters to
             inbound flows per the policy of `spec/cross-cutting/04-business-model-packaging.md`.

Actors: Principal's office, Platform (ZSchool). Traceability: `spec/domain-model.md`.

### INT-ZS-030: [WAP] Follow the push, WhatsApp utility, SMS-alias channel hierarchy

> **Invariant:** none
> **See:** [ADR-ZS-062](../decisions/062-communication-rules-batch.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: The WhatsApp channel fits into the [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
             hierarchy, applicable from V1 onward: push notification first (V1, via the
             PWA; native apps in V2, [NFR-ZS-022](../cross-cutting/03-non-functional-requirements.md)),
             contingent on FCM and APNs being entered in the sub-processor register with a
             transfer basis ([SEC-ZS-023](../cross-cutting/02-security-privacy.md),
             [CNF-ZS-012](../cross-cutting/07-legal-compliance-data-protection.md),
             [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)),
             WhatsApp utility for opted-in parents, alias SMS as a fallback (and for
             households without a smartphone). At MVP, the hierarchy is in-app, then
             WhatsApp utility (attendance only), then SMS. Fine-grained per-message-type
             routing rules and parent preferences fall to `spec/behaviors/08-communication-notifications.md`;
             this requirement ties integrations to this hierarchy and forbids any
             workaround (an unconfigured, systematic double send across channels).

Actors: Platform (ZSchool), Principal's office. Traceability: `spec/behaviors/08-communication-notifications.md`.

### INT-ZS-024: [WAP] Operate a single platform WhatsApp Business account at MVP and handle inbound replies

> **Invariant:** none
> **See:** [ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP (single WABA, automatic receipt, inbound queue); V1 (per-school number as an option)
> **Acceptance:** [`@REQ-ZS-530`](../../features/cross-cutting/int/int-zs-024-parent-reply-platform-number.feature)

REQUIREMENT: At MVP, ZSchool MUST operate a single WhatsApp Business account (WABA) and
             a single platform number for every school: the display name is ZSchool's and
             every message identifies the sending school in its body ("ZSchool — <school
             name>"); opt-in remains collected per school (INT-ZS-026) and costs are
             allocated to the sending school (INT-ZS-028). In V1, a school may opt to have
             its own number and display name after its own Meta Business verification;
             the connector supports both modes. **Inbound replies**: any message received
             on the platform number MUST trigger an automatic bilingual receipt pointing
             to the app and the registrar's office, MUST be attached to the school of the
             last outbound message to that number, MUST be transmitted to that school's
             student-life team in an inbound-message queue (reading, closing, converting
             into a front-desk absence justification — [ADR-ZS-056](../decisions/056-absence-notification-rules.md)),
             and MUST be counted in the school's consumption after 10/01/2026 (INT-ZS-029);
             a stop keyword is handled per INT-ZS-026. Replies are never fed into
             moderated threads ([ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md)).

Actors: Platform (ZSchool), Principal's office, Student life, Parent. Traceability: `spec/behaviors/08-communication-notifications.md`; `spec/behaviors/04-attendance-student-life-discipline.md`.

---

## 7. [SIG] Electronic signature and stamping (Law 43.20)

### 7.1 Objective and scope

Law 43.20 (trust services for electronic transactions) and its implementing decree distinguish three signature levels: simple, **advanced**, **qualified** (a reliability presumption, equivalent to handwritten); the simple and advanced levels are admissible in court with no presumption. Trust-service-provider (PSCo) licensing is granted **per service** (signature, stamping, and timestamping are three separate licenses); providers licensed as of 09/09/2026: **Barid eSign** (PSCo status in January 2025; Morocco's first qualified timestamp in April 2026), **DamaneSign** (March 2025), **AfricTRUST** (qualified certificates with the Damane Cash network, June 2026); no public pricing, quote-based.

Per [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md): in **V1**, ZSchool applies the school's **advanced electronic stamp, timestamping, and a verification QR code** on official documents; in **V2**, **qualified** stamping and timestamping via a licensed PSCo for the exit certificate, attestations, and transcripts; the **parent contract (Law 59.21) is signed electronically at the advanced level**. No level is required by the texts for report cards and attestations.

### 7.2 Data flows

1. **School's stamp (configuration)**: the school uploads its stamp and logo at onboarding; ZSchool derives the tenant-linked advanced electronic-stamp data (the school's legal identity, opening authorization).
2. **Applying the advanced stamp (V1, internal)**: when an official document is generated (a published report card, certificate, attestation, `DocumentGenerated`), the system computes the document's fingerprint, applies the school's advanced electronic stamp and a timestamp, then produces the **verification QR code** pointing to the minimal public verification page ([INV-ZS-015](../invariants.md#inv-zs-015), [ADR-ZS-020](../decisions/020-immutable-versioned-report-cards.md), [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)). The evidence package (document, fingerprint, timestamps, signatory, log) is archived.
3. **Signing the parent contract (V1)**: the legal guardian signs the generated contract at the advanced level: identification via account and an OTP code sent to their phone number (the primary contact identifier, [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md)), timestamped consent, the document's fingerprint, archived in the student's record and available to the AREF (Law 59.21, annual written contract).
4. **Qualified stamping and timestamping (V2, PSCo)**: for the exit certificate, attestations, and transcripts, the system calls the chosen licensed PSCo's API to apply the qualified stamp in the school's name and a qualified timestamp; PSCo certificates belong to the school (or the mandated ZSchool/school pair, per the contract); qualified evidence is added to the V1 evidence package.

### 7.3 Contractual model

V1: no external provider required — the advanced stamp is applied by ZSchool in the school's name under Law 43.20, with an evidence package and QR code. V2: a **ZSchool-PSCo framework agreement and/or direct school-PSCo contracts** (to be settled at selection, OQ-ZS-328); licensing is **per service**: the chosen provider must cover stamping, timestamping, and signature, or two complementary providers otherwise; quote-based pricing, no public rate. Licensed candidates as of 09/09/2026: Barid eSign (signature, stamping, qualified timestamping since April 2026), DamaneSign, AfricTRUST. The targeted legal value is documented in each case: advanced = admissible with no presumption; qualified = a reliability presumption and handwritten equivalence.

### 7.4 External dependencies

- Confirming the licensing scope (per service) of the three candidates and their API coverage (corporate stamping, timestamping, remote signature), at the V2 tender (OQ-ZS-328).
- PSCo quotes: no public rate.
- Identity verification of the parent contract's signatory: account + phone OTP; any move to a higher identification level falls to the compliance chapter.
- Evidentiary archiving: fingerprints and timestamps kept per the retention periods ([ADR-ZS-003](../decisions/003-default-retention-durations.md)): official documents: permanent on the school's side; accounting documents: 10 years.

### 7.5 Risks

- Challenging a V1 document's evidentiary value (advanced level, no presumption): mitigated by a complete evidence package (fingerprint, timestamps, log, verification QR) and, in V2, by moving to qualified for high-stakes documents.
- Evolution of the PSCo market (new licenses, license withdrawals): DGSSI monitoring and an abstracted stamping connector.
- Fragility of OTP identification for signing the parent contract (a shared phone): compensating measures in INT-ZS-031 (a dedicated OTP, a second element for shared or recently recovered numbers, front-desk signature as a fallback); the advanced level is accepted in V1 per [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md).
- Per-document qualified costs in V2: certificate and attestation volume to budget with quotes (OQ-ZS-328).

### 7.6 Requirements

| ID | Title | Priority |
|---|---|---|
| INT-ZS-032 | [SIG] Apply the school's advanced electronic stamp and a timestamp on official documents | Must |
| INT-ZS-031 | [SIG] Have the parent contract signed electronically at the advanced level | Must |
| INT-ZS-033 | [SIG] Apply a qualified stamp and timestamp via a licensed PSCo on high-stakes documents | Must |
| INT-ZS-034 | [SIG] Select a trust provider covering stamping, timestamping, and signature | Must |
| INT-ZS-035 | [SIG] Keep the evidentiary package for the legal retention periods | Must |

### INT-ZS-032: [SIG] Apply the school's advanced electronic stamp and a timestamp on official documents

> **Invariant:** [INV-ZS-015](../invariants.md#inv-zs-015)
> **See:** [ADR-ZS-020](../decisions/020-immutable-versioned-report-cards.md), [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-531`](../../features/cross-cutting/int/int-zs-032-stamped-attestation.feature)

REQUIREMENT: In V1, every published official document (a published report card,
             certificate, attestation) MUST carry the school's advanced electronic stamp
             and a timestamp: the system computes the document's fingerprint, applies the
             tenant-linked stamp data, and records the evidence package (document,
             fingerprint, application date and time, author). The stamp reproduces the
             school's legal elements (name, opening authorization). The identifier
             carried by the verification QR code MUST be random, non-sequential, and not
             derived from the document number; the public verification page is
             rate-limited and reveals only the document's existence, integrity, date, and
             type ([SEC-ZS-010](../cross-cutting/02-security-privacy.md), [SEC-ZS-011](../cross-cutting/02-security-privacy.md)).

Actors: Principal's office, Registrar's office, Platform (ZSchool). Traceability: `spec/domain-model.md` (`ReportCard`, `Certificate`, [INV-ZS-015](../invariants.md#inv-zs-015)); `spec/behaviors/06-documents-certificates.md`.

### INT-ZS-031: [SIG] Have the parent contract signed electronically at the advanced level

> **Invariant:** none
> **See:** [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** MVP (front-desk signature with identity verification, financial-guardian countersignature); V1 (remote signature at the advanced level)
> **Acceptance:** [`@REQ-ZS-532`](../../features/cross-cutting/int/int-zs-031-signing-the-parent-contract.feature)

REQUIREMENT: The annual written school-parent contract (Law 59.21) generated by the
             school MUST be signed electronically by the legal guardian at the advanced
             level and, when distinct, countersigned by the financial guardian
             ([ADR-ZS-061](../decisions/061-finance-rules-batch.md)): identification via
             an authenticated account and a **signature-dedicated OTP code**, distinct
             from the session code, sent to the signatory's mobile number, timestamped
             consent, the signed document's fingerprint, device fingerprint and session
             log, archived in the student's record and exportable for the AREF.
             Compensating measures for the shared-phone risk ([ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md)):
             the signatory is informed the code is strictly personal; when the
             signatory's number is declared as a shared household contact, or when the
             account was recovered at the front desk fewer than 30 days ago ([SEC-ZS-004](../cross-cutting/02-security-privacy.md)),
             signing additionally requires a second element (front-desk confirmation with
             identity verification, or a verified email); failing that, the contract is
             signed at the front desk on a tablet with identity verification. The
             signature carries an explicit note of the level (advanced) and the
             identification evidence used. Since the contract is required from MVP onward
             ([ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)), front-desk
             signature with identity verification and a timestamp is the MVP mode; remote
             signature via dedicated OTP ships in V1.

Actors: Legal guardian (parent), Principal's office, Platform (ZSchool). Traceability: `spec/domain-model.md` (`FeeSchedule`, the parent contract); `spec/cross-cutting/07-legal-compliance-data-protection.md`.

Note: per [INV-ZS-058](../invariants.md#inv-zs-058) / [INV-ZS-066](../invariants.md#inv-zs-066), only the **legal tutor** — not every legal guardian — may sign this contract; a signatory whose qualities do not include legal tutor is refused.

### INT-ZS-033: [SIG] Apply a qualified stamp and timestamp via a licensed PSCo on high-stakes documents

> **Invariant:** none
> **See:** [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: In V2, for the exit certificate, attestations, and transcripts, the system
             MUST call the chosen licensed PSCo's API (Barid eSign, DamaneSign, or
             AfricTRUST) to apply the qualified electronic stamp in the school's name and
             a qualified timestamp (Barid eSign has held Morocco's first qualified
             timestamp since April 2026). Qualified evidence is added to the V1 evidence
             package; the verification QR code distinguishes qualified documents. The
             connector is abstracted from the provider.

Actors: Principal's office, Platform (ZSchool). Traceability: `spec/behaviors/06-documents-certificates.md`.

### INT-ZS-034: [SIG] Select a trust provider covering stamping, timestamping, and signature

> **Invariant:** none
> **See:** [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: Before V2 development, ZSchool MUST run the selection of the PSCo(s)
             against three gating criteria: a current DGSSI license **per service**
             covering stamping, timestamping, and signature (or complementarity of two
             providers), a documented API for corporate stamping and qualified
             timestamping, quote-based pricing compatible with school volumes. The choice
             MUST be logged with proof of licensing as of the decision date.

Actors: Platform (ZSchool). Traceability: OQ-ZS-328.

### INT-ZS-035: [SIG] Keep the evidentiary package for the legal retention periods

> **Invariant:** none
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md), [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md), [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: For every stamped document and every signed contract, the system MUST keep
             the evidence package (document, fingerprint, timestamps, signatory identity
             and identification evidence, access log) per the baseline's retention
             periods: official documents kept permanently by the school, financial
             documents ten years, logs five years. Exporting the package accompanies any
             individual-rights request and the termination export.

Actors: Platform (ZSchool), Principal's office. Traceability: `spec/domain-model.md` (`AuditLog`, `DataExport`); `spec/cross-cutting/07-legal-compliance-data-protection.md`.

---

## 8. [HEB] Cloud hosting

### 8.1 Objective and scope

The historical baseline required **production and backups in Morocco** ([ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md), the **OCI "Morocco West (Casablanca)" region, af-casablanca-1**, hosted at N+ONE Nouaceur, open since April 7, 2026, with a single availability domain). **[ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md) (Accepted, 2026-09-09) supersedes that baseline**: production, database, and storage now run on AWS `eu-central-1` (Frankfurt), with `eu-west-3` (Paris) as the second region for backup replication and disaster recovery. No student data leaves the EU/EEA, which keeps the transfer question closed under the CNDP EU-adequacy list (Deliberation No. 236-2015, Law 09.08) rather than under the original "no transfer at all" basis; the only outbound flows outside the EU/EEA are those of messaging vendors (WhatsApp, email), governed by the F118 model (INT-ZS-038). Scope covers selecting and running the hosting platform, data residency, the cross-region failover plan, and verifying the service catalog; detailed technical architecture falls to `spec/cross-cutting/03-non-functional-requirements.md` and `spec/cross-cutting/02-security-privacy.md`.

**Deviation note.** [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md) is the accepted deviation from the Morocco-hosting baseline recorded above; every requirement in this chapter's §8.6 that cited Morocco/af-casablanca-1 specifics has been redefined for AWS `eu-central-1`/`eu-west-3` accordingly. ADR-ZS-007 remains on record as the superseded original decision, not as the current baseline.

### 8.2 Data flows

1. **Production (ZSchool tenant)**: all production processing and data is hosted in AWS `eu-central-1` (ADR-ZS-091); no student data is processed or stored outside the EU/EEA except the governed messaging flows below.
2. **Backups (cross-region EU replication)**: daily backups, at least 30-day retention, quarterly restore testing; backups stay within the EU (`eu-central-1`); daily encrypted replication to a second EU region **from MVP onward** (INT-ZS-036, [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md), [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md): `eu-west-3`); a full disaster recovery plan with failover in V1 (INT-ZS-037).
3. **Limited outbound flows**: messaging only (INT-ZS-021 stays domestic via the Moroccan aggregator, INT-ZS-025 travels through Meta's servers under F118 governance, INT-ZS-038 per INT-ZS-038); no student-data flow to any other vendor.
4. **Operations**: observability (logs, metrics, alerts, per-tenant traceability) operated from the same region; support access governed and audited (`spec/cross-cutting/02-security-privacy.md`).

### 8.3 Contractual model

Direct contracts between the ZSchool operator and AWS (`eu-central-1`, `eu-west-3` per ADR-ZS-091). AWS's pricing is published and available managed services (RDS/Neon-managed Postgres, Lambda, S3, Cognito, CloudFront) are verified service by service at launch (INT-ZS-039); no cost commitment is set in this chapter beyond `spec/stack.md` §2's pinned-version snapshot. ZSchool is the controller for the global identity and a processor for schools' operational data ([ADR-ZS-027](../decisions/027-processor-and-controller-roles.md)): hosting contracts carry processor, confidentiality, reversibility, and audit clauses, detailed in `spec/cross-cutting/07-legal-compliance-data-protection.md`. DGSSI cloud qualification (Law 05.20) does not automatically apply to private schools and ZSchool in 2026 and is moot for an AWS EU deployment; the sub-processor registry (SEC-ZS-024, [CNF-ZS-012](../cross-cutting/07-legal-compliance-data-protection.md)) is extended to cover AWS `eu-central-1`, Neon `eu-central-1`, and CloudFront, per ADR-ZS-091's Decision.

### 8.4 External dependencies

- AWS `eu-central-1`'s service catalog: actual, service-by-service availability of managed Postgres, S3, Lambda, and Cognito at launch (INT-ZS-039; supersedes OQ-ZS-325's original OCI-Casablanca framing).
- Failover region: `eu-west-3` (Paris) capacity and pricing to confirm before committing (ADR-ZS-091).
- Up-to-date tzdata for the permanent UTC+0 timezone since 09/20/2026 (decree no. 2.26.530, Official Gazette no. 7521 of 06/29/2026) — no seasonal alternation or Ramadan exception.

### 8.5 Risks

- **Single-region dependency**: AWS `eu-central-1` is multi-AZ (unlike the superseded OCI af-casablanca-1 single-availability-domain risk), but the platform still depends on one region for primary traffic; a region-level disaster is covered only by the cross-region EU disaster recovery plan; mitigated by INT-ZS-037 (secondary replication/backups to `eu-west-3`) and recovery targets defined in `spec/cross-cutting/03-non-functional-requirements.md` (see also RSK-ZS-011, redefined under ADR-ZS-091).
- Unavailability of some managed services in the young region: catalog verification (INT-ZS-039) before any commitment avoids an architecture dependent on an absent service.
- Vendor risk and reversibility: export and portability clauses in contracts; a documented exit plan.
- Non-consolidated costs (the OCI grid not published): budget to validate by quote before commercial launch, out of scope for this chapter (OQ-ZS-325).
- Terminology caution: Oracle's (planned) "Settat region" must not be confused with the N+ONE Settat data center, available as a physical site (OQ-ZS-325).
- Remote administration of the region by a foreign vendor: without a contractual clause and ZSchool-managed encryption keys, the "no data outside Morocco" promise would be weakened; handled in §8.3 and by [SEC-ZS-015](../cross-cutting/02-security-privacy.md).

### 8.6 Requirements

| ID | Title | Priority |
|---|---|---|
| INT-ZS-040 | [HEB] Host production and backups in the EU with a documented residency check | Must |
| INT-ZS-037 | [HEB] Replicate backups to a second EU region for the disaster recovery plan | Must |
| INT-ZS-039 | [HEB] Verify the `eu-central-1` region's catalog service by service before commitment | Must |
| INT-ZS-041 | [HEB] Test restores and keep the continuity plan up to date | Must |
| INT-ZS-042 | [HEB] Guarantee hosting reversibility | Should |
| INT-ZS-036 | [HEB] Replicate encrypted backups daily to a second EU region from MVP onward | Must |

### INT-ZS-040: [HEB] Host production and backups in the EU with a documented residency check

> **Invariant:** none
> **See:** [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-533`](../../features/cross-cutting/int/int-zs-040-data-residency-morocco.feature)

REQUIREMENT: **Redefined by [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md)
             (Accepted, 2026-09-09).** ZSchool's production and backups MUST be hosted in the
             EU, targeting AWS `eu-central-1` (Frankfurt); no student data is stored or
             processed outside the EU/EEA, except the expressly governed messaging
             flows (INT-ZS-025, INT-ZS-038), which are separately assessed against the CNDP
             adequacy list. A residency check (locating stores, backups, and processing
             zones) MUST run at launch and at every architecture change, and MUST be
             documented — this requirement now serves as that residency check for
             ADR-ZS-091 itself, replacing the original Morocco-only baseline
             ([ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md)).

Actors: Platform (ZSchool). Traceability: `spec/cross-cutting/07-legal-compliance-data-protection.md`.

### INT-ZS-037: [HEB] Replicate backups to a second EU region for the disaster recovery plan

> **Invariant:** none
> **See:** [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: **Redefined by [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md)
             (Accepted, 2026-09-09).** The continuity plan relies on a second EU region
             independent of the first: replication or daily backup exports from AWS
             `eu-central-1` (Frankfurt) to `eu-west-3` (Paris), matching `spec/stack.md`
             §3 risk 3. Recovery targets (RPO/RTO) and plan-activation tests are
             defined in `spec/cross-cutting/03-non-functional-requirements.md`; this
             requirement guarantees their physical feasibility (a contracted, funded
             second region).

Actors: Platform (ZSchool). Traceability: `spec/cross-cutting/03-non-functional-requirements.md`.

### INT-ZS-039: [HEB] Verify the `eu-central-1` region's catalog service by service before commitment

> **Invariant:** none
> **See:** [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: **Redefined by [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md)
             (Accepted, 2026-09-09).** Before any architecture commitment on AWS
             `eu-central-1`, the availability, quotas, and performance of every required
             service (compute, object and block storage, managed Postgres, orchestration,
             backup, key encryption) MUST be verified and documented; any required
             service that is unavailable triggers a documented alternative choice (a
             self-managed service or another EU region such as `eu-west-3`).
             Verification is repeated at every major architecture expansion.

Actors: Platform (ZSchool). Traceability: `spec/cross-cutting/03-non-functional-requirements.md`.

### INT-ZS-041: [HEB] Test restores and keep the continuity plan up to date

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: Daily backups (at least 30-day retention) undergo documented quarterly
             restore tests — backups and restore tests apply from MVP onward (the
             NFR-SAV domain, `spec/cross-cutting/03-non-functional-requirements.md`), this
             requirement covering the continuity-plan aspect in V1, without duplicating
             the NFR; the continuity plan (including an inventory of this chapter's
             integration dependencies: Massar offline, the SMS aggregator unavailable,
             Meta unavailable, a PSCo unavailable) is reviewed at every major change and
             after every test. Incidents and breaches follow the incident log and the
             notification the baseline requires.

Actors: Platform (ZSchool). Traceability: `spec/domain-model.md`; `spec/cross-cutting/02-security-privacy.md`.

### INT-ZS-042: [HEB] Guarantee hosting reversibility

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: Hosting contracts carry reversibility clauses: a full data export in open
             formats, migration assistance, a deletion timeline after departure. A
             documented exit plan (data, configurations, secrets) MUST be maintained and
             testable, independent of any legal cloud-qualification obligation.

Actors: Platform (ZSchool). Traceability: `spec/cross-cutting/07-legal-compliance-data-protection.md`.

### INT-ZS-036: [HEB] Replicate encrypted backups daily to a second EU region from MVP onward

> **Invariant:** none
> **See:** [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md), [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: **Redefined by [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md)
             (Accepted, 2026-09-09).** From the pilots' activation onward, an encrypted
             copy ([SEC-ZS-015](../cross-cutting/02-security-privacy.md), keys managed by
             ZSchool) of the complete daily backup (databases, document files,
             configuration, logs) MUST be transferred each day to a second EU region,
             `eu-west-3` (Paris), physically distinct from the primary `eu-central-1`
             (Frankfurt) region, on storage independent of the production account; the
             copy's integrity MUST be verified after each transfer, with an alert on
             failure; a restore from the remote copy is tested in the quarterly exercise
             ([NFR-ZS-011](../cross-cutting/03-non-functional-requirements.md)).
             The MVP fallback RPO is 24 hours and the fallback RTO is that of a measured
             full restore, both recorded in the pilot agreement ([CNF-ZS-002](../cross-cutting/07-legal-compliance-data-protection.md)).
             The full disaster recovery plan (INT-ZS-037) relies on this same region.

Actors: Platform (ZSchool). Traceability: [SEC-ZS-004](../cross-cutting/02-security-privacy.md); [NFR-ZS-009](../cross-cutting/03-non-functional-requirements.md), [NFR-ZS-010](../cross-cutting/03-non-functional-requirements.md).

---

## 9. [EML] Outbound email

### 9.1 Objective and scope

Email is a **secondary, non-critical channel** ([ADR-ZS-023](../decisions/023-notification-channel-priority.md)): no recent primary data exists on Moroccan households' email use, and the primary contact identifier is the phone ([ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md), [INV-ZS-044](../invariants.md#inv-zs-044)). Outbound email nonetheless serves: authentication (an email OTP alongside SMS), identity invitations and claims, sending receipts and documents, optional report-card notification. Chapter goal: have a reliable, deliverable transactional sending service, with full awareness of the vendor's location (a flow outside Morocco) and the corresponding Law 09.08 governance (the F118 model provided to schools). Channel and routing rules fall to `spec/behaviors/08-communication-notifications.md`; the full compliance analysis is carried by `spec/cross-cutting/07-legal-compliance-data-protection.md`.

### 9.2 Data flows

1. **Sending (outbound)**: an email-channel `Notification` (or an authentication trigger) is sent to the sending service with the recipient, subject, bilingual content, and correlation references; statuses (accepted, delivered, bounced, marked as spam) feed `DeliveryLog`.
2. **Location (outbound, outside Morocco)**: the sending vendor generally processes messages outside Morocco; the baseline explicitly classifies these messaging-vendor flows as the only data exits, governed by the F118 request model ZSchool provides to schools. The chosen vendor is preferred for processing in an adequacy-list country (the EU/EEA excluding Croatia, the United Kingdom, Switzerland, Canada — France and Spain are subject to a simple declaration).
3. **Domain authentication (outbound)**: sending signed from a ZSchool subdomain (or, in an advanced V1, the school's own) with SPF, DKIM, and a strict DMARC policy.
4. **Hygiene (inbound)**: managing hard bounces and unsubscribes; email is never required for a parent, student, or teacher ([INV-ZS-044](../invariants.md#inv-zs-044)) and its absence degrades no service.

### 9.3 Contractual model

A ZSchool contract with a transactional-sending service (volume-based pricing, a market category not specified — no invented rate). ZSchool is a processor for schools regarding school-data sends and a controller for its own processing (account authentication); governing flows outside the adequacy list goes through the controller's F118 authorization (a two-month delay, extendable) or choosing an adequacy-country vendor, per `spec/cross-cutting/07-legal-compliance-data-protection.md`. ZSchool provides schools with the corresponding F118 request template.

### 9.4 External dependencies

- A transactional-sending vendor and its processing location (the adequacy list, with no update found as of 09/09/2026 — see `spec/appendices/01-review-history.md`).
- DNS management for the sending domain (SPF, DKIM, DMARC) and sending reputation.
- No critical service dependency: email unavailability blocks no journey (SMS/in-app fallback).

### 9.5 Risks

- Low deliverability to parent inboxes (low observed usage, poorly maintained addresses): email is never the sole channel for an important message (the [ADR-ZS-023](../decisions/023-notification-channel-priority.md) hierarchy).
- Law 09.08 non-compliance if a flow went to a non-listed country without governance: controlled by vendor choice and the F118 model (cross-reference `spec/cross-cutting/07-legal-compliance-data-protection.md`).
- Sender impersonation (phishing in a school's name): mitigated by a dedicated subdomain, strict SPF/DKIM/DMARC, and school identification notices in the message footer.

### 9.6 Requirements

| ID | Title | Priority |
|---|---|---|
| INT-ZS-043 | [EML] Send transactional emails via a dedicated service | Must |
| INT-ZS-044 | [EML] Guarantee deliverability via a dedicated domain and SPF, DKIM, DMARC authentication | Must |
| INT-ZS-038 | [EML] Govern the flow outside Morocco and provide the F118 request template to schools | Must |
| INT-ZS-045 | [EML] Keep email as an optional channel, never required | Must |

### INT-ZS-043: [EML] Send transactional emails via a dedicated service

> **Invariant:** [INV-ZS-044](../invariants.md#inv-zs-044)
> **See:** [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md), [ADR-ZS-023](../decisions/023-notification-channel-priority.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: The platform's emails (invitation and claim, access reset, email OTP,
             receipts, documents, optional notifications) MUST be sent via a dedicated
             transactional-sending service (never from a personal inbox), with a
             correlation reference to the `Notification` and tracked statuses. Service
             unavailability blocks no critical journey: every important-subject email is
             paired with a channel from the [ADR-ZS-023](../decisions/023-notification-channel-priority.md)
             hierarchy.

Actors: Platform (ZSchool), all recipient roles. Traceability: `spec/behaviors/08-communication-notifications.md`.

### INT-ZS-044: [EML] Guarantee deliverability via a dedicated domain and SPF, DKIM, DMARC authentication

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: Sends MUST originate from a dedicated ZSchool subdomain with valid SPF and
             DKIM records and a strict DMARC policy; hard bounces MUST be handled
             automatically (the address is suspended after repeated bounces, with the
             school informed to correct contact details) and spam reports are monitored.
             A per-school sending domain (optional) keeps the same authentication
             discipline.

Actors: Platform (ZSchool), Principal's office. Traceability: `spec/behaviors/08-communication-notifications.md`.

### INT-ZS-038: [EML] Govern the flow outside Morocco and provide the F118 request template to schools

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: The system MUST document where the email vendor's processing takes place
             and its adequacy countries; for affected schools, ZSchool MUST provide the
             F118 authorization request template (a transfer to a messaging vendor),
             fillable with processing details. No email flow of student content is
             activated to a non-adequacy country without governance (choosing an
             adequacy-country vendor, or the school's own F118) being documented.

Actors: Platform (ZSchool), Principal's office. Traceability: `spec/cross-cutting/07-legal-compliance-data-protection.md`.

### INT-ZS-045: [EML] Keep email as an optional channel, never required

> **Invariant:** [INV-ZS-044](../invariants.md#inv-zs-044)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario in the source)

REQUIREMENT: No enrollment, access, or document journey requires an email address: the
             account relies on the mobile phone ([INV-ZS-044](../invariants.md#inv-zs-044));
             the email address is entered optionally, verified if used, and its mere
             absence produces no anomaly alert. Official documents are never delivered
             exclusively by email (portal download and the [ADR-ZS-023](../decisions/023-notification-channel-priority.md)
             channels remain available).

Actors: All roles. Traceability: [URS-ZS-017](../urs.md).

---

## 10. Open questions

Open questions for this chapter (OQ-ZS-321 through OQ-ZS-329 in the migrated source, covering YouCan Pay's closure, the uncorroborated Massar framing note, the WhatsApp MVP version arbitration, digital-usage-share sourcing, hosting/Settat terminology, Fatourati pricing, WhatsApp post-switch rate cards, PSCo selection, and the permanent UTC+0 timezone) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

---

## 11. Traceability

Full cross-reference coverage for this chapter is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
