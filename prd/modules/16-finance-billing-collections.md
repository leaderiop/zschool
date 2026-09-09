# ZSchool — Chapter 16: Finance, Billing and Collections (FIN module)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09); previously 0.2 — revised (review of 09/09/2026) |
| Date | 2026-09-09 |
| Status | Draft PRD — under review; arbitrations ARB-01, ARB-14, ARB-20, ARB-25 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §2.8 (finance and payments), §7.7 (finance module), §6.3 (RG-08 to RG-12), §6.4 (RG-13 to RG-16), §6.10 (FINANCE entities), §12 (scope by version), §14 (DEC-10, DEC-22, DEC-24, DEC-28, DEC-30, DEC-31, DEC-36), §15 (Q-06), §16 (H-07 to H-09, H-17, H-19, H-20), §13.1 (C-10), §13.2 (G-15, G-16); `prd/research/00-baseline-corrections.md` (corrections No. 7, No. 8, No. 15); `prd/research/02-regulatory-data.md` §7; `prd/research/03-payments-communications.md` |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/15-documents-certificates.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/18-transfers-mobility.md`, `prd/modules/20-dashboards-reporting.md`, `prd/modules/22-ancillary-services-transport-canteen-activities.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` |

---

## 1. Objective and scope

The FIN module gives the school full control of the financial cycle of schooling: pricing (fee schedules by year, level, section and track, with ancillary fees), payment schedules per enrollment, invoicing compliant with Moroccan tax law, payment collection through every method with receipts, graduated reminders, tracking of unpaid balances and accounting exports. It carries the financial relationship between the school and guardians: a financial guardian distinct from the legal guardian, multi-payer splits, payment by a third party, and the balance surviving the enrollment's closing (RG-12). Lastly, it upholds ZSchool's founding collections principle: **documents are never blocked for unpaid balances** (DEC-24).

Structuring payment principle: **ZSchool never holds funds**. Each school collects into its own account; ZSchool is a technical provider, never a fund holder (§2.8, DEC-31).

### 1.1 In scope

| Scope | Version |
|---|---|
| Fee schedules by school year, level, section, track; ancillary fees (registration, re-enrollment, insurance, transport, canteen, activities, supplies) | MVP |
| Parents' contract under Law 59.21 (generation, logged acceptance, archiving, tariffs fixed for the year; countersignature of a distinct financial guardian) | MVP (wave 1 — the law has been in force since 23/02/2026; ARB-01, ARB-20h; advanced electronic signature in V1, DEC-30) |
| Monthly (10-month), quarterly and annual payment schedules per enrollment; proration rule for arrivals and departures | MVP (proration: ARB-20c) |
| Automatic sibling discount | MVP (wave 1 — ARB-01) |
| Negotiated discounts and internal scholarships with approval | V1 |
| Compliant invoices (statutory notices, ICE/IF, VAT classification by fee nature) | V1 |
| Tamper-proof sequential numbering | MVP (receipts and void receipts); V1 (invoices and credit notes) |
| Payment collection: cash with a receipt (MVP), then a cash session (V1), cheques with a full lifecycle (MVP — ARB-01), bank transfer (MVP), Fatourati (V1, DEC-31), semi-manual direct debit (V2), tokenized recurring card (V2) | See requirements |
| Family payment split across several children with a single receipt (FR-FIN-30); voiding a payment or a receipt through a traced reversing entry (FR-FIN-29) | MVP (ARB-20 a, b) |
| Printable, sent, numbered receipts; self-service financial status for the parent | MVP |
| Automatic graduated reminders (in-app and SMS in MVP; WhatsApp utility, push and printable mail in V1 — arbitration D1, OQ-08) and bilingual templates | MVP (reminders), V1 (custom templates) |
| Unpaid-balances table (MVP), aged balance (V1) | MVP / V1 |
| Distinct financial guardian, multi-payer splits, third-party payer ("third-party payer" relationship type, ARB-14) | MVP |
| Balance surviving enrollment closing; account statement on departure handed to the financial guardian only; optional carry-forward of unpaid balances (the claim stays with the school of origin's tenant; inter-site transfer within the same group: V2+ option) | MVP (survival and statement — FR-FIN-24, ARB-01, ARB-20e), V1 (optional carry-forward, refers to FR-TRA-10) |
| Accounting exports (cash journal, simplified general ledger) | V1 |
| Traced refunds | V1 |
| Preparation of electronic invoicing (UBL export) | V1 (preparation); compliant activation: V2+ (H-17) |

### 1.2 Out of scope

| Item | Reference |
|---|---|
| Generation of official documents (leaving certificate, certificates) and their delivery | `prd/modules/15-documents-certificates.md` — FIN only exposes the arrears alert and the account statement (DEC-24) |
| Operational management of ancillary services (transport routes, canteen, activities) whose fees appear in the fee schedules | `prd/modules/22-ancillary-services-transport-canteen-activities.md` (V2+) |
| ZSchool's SaaS billing to schools (plan, usage, consumables) | `PROJECT.md` §11, DEC-28; `prd/cross-cutting/33-business-model-packaging.md` |
| The school's general accounting, payroll | Out of product scope (the module delivers exports, not bookkeeping) |
| Holding or carrying parents' funds, bank aggregation | Never (§2.8, DEC-31) |
| Judicial collection procedure (payment order, protest) | Off-platform; the "litigation" status closes the amicable process and prepares the file |

---

## 2. Users and use cases

| User | Main use cases | Needs cited |
|---|---|---|
| School leadership / accounting | Set fee schedules, approve discounts and scholarships, oversee unpaid balances and the aged balance, approve sensitive reminders, export for the accountant, reconcile Fatourati | BES-DIR-02 |
| Front desk / cashier | Collect payment at the counter in one pass (cash, cheque, transfer), hand over a receipt, open and close the cash session, track the cheque portfolio, see the arrears alert without blocking a document | BES-SEC-02, BES-SEC-04, BES-SEC-05 |
| Financial-guardian parent | View each child's payment schedule and balance, pay (front desk, transfer, Fatourati, card in V2), receive receipts and reminders, receive their share under a multi-payer split | BES-PAR-03, BES-PAR-07, BES-GAR-07 |
| Third-party payer (grandparent, employer) | Pay all or part of a student's fees with no parental relationship: a "third-party payer" relationship type carrying only the "financial guardian" status (ARB-14), a receipt in their name, no access to school data | §2.8, §7.7; RG-13 |
| Adult student | Financial status viewable per their rights; financial access stays with the financial guardian as long as they owe money (RG-02, DEC-20) | BES-ELE-07 |
| External accountant | Receives the cash journal, simplified general ledger, aged balance (an export recipient, with no account) | §7.7 |

Operational realities addressed (§2.8): significant payment delays, reminders that are currently manual, bounced cheques, case-by-case negotiated discounts, internal scholarships, payment by a third party, a frequent difference between the legal parent and the paying parent.

---

## 3. Key journeys

References to `prd/journeys/00-journey-map.md` (with no duplication):

| Journey | Role of the FIN module |
|---|---|
| PC-01 (admission and enrollment) | Registration fee and reservation deposit collected at the PRE-ENROLLED → ACTIVE transition; first billing and payment schedule |
| PC-02 (re-enrollment and rollover) | Re-enrollment fee with a spring deposit; N+1 payment schedules generated at rollover; sibling discount recomputed |
| PC-07 (payment collection and reminders for unpaid balances) | The module's primary journey: collection through every method, receipts, graduated reminders, unpaid-balances table, aged balance |
| PC-08 (Fatourati online payment) | Exposing receivables, confirmation and daily reconciliation (INT-FAT) |
| PC-09 (transfer and exit file) | Balance after departure, settlement, account statement, optional carry-forward of unpaid balances (RG-12) |
| PC-10 (self-service certificate) | Arrears alert shown on the file, with no blocking whatsoever (DEC-24); account statement attached to the exit file |

---

## 4. Functional requirements

`FR-FIN-NN` counter starting at 01, a namespace exclusive to this file (conventions §2). Versions strictly follow `PROJECT.md` §12; justified deviations (Fatourati in V1) are recorded in OQ-02.

### FR-FIN-01 — Manage fee schedules by year, level, section and track

| Attribute | Value |
|---|---|
| Description | For each school year, the school defines fee schedules applicable by level, section (education system) and track/program, made of typed fee lines: registration (one-time), re-enrollment (annual, with a spring deposit), tuition (monthly by default), school insurance (annual), transport (monthly, priced by route or zone), canteen/after-school care, extracurricular activities and outings, supplies, books, uniform. Each line carries: a bilingual FR/AR label, frequency (one-time, monthly, quarterly, annual, ad hoc), amount in MAD, mandatory-or-optional status, a refund rule (default: registration non-refundable, §2.8) and a VAT classification (FR-FIN-08). Law 59.21 safeguard (forced sale): marking a books, supplies or uniform line as "mandatory" triggers a legal alert — forced sale of textbooks and supplies through the school is prohibited — and requires a traced justification to be recorded in the compliance log (`prd/cross-cutting/36-legal-compliance-data-protection.md`; research 02 §1). A fee schedule is cloned from one year to the next and then adjusted; cloning copies the fees, never the enrollments. The validated fee schedule can be exported as a display document for the fee disclosure required by Article 49 of Law 59.21 (research 02 §1). Transport and canteen fees appear in the fee schedule from the MVP; their operational management stays with `prd/modules/22-ancillary-services-transport-canteen-activities.md` in V2+. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §2.8, §7.7, G-15, RG-25, INV-40; correction No. 2 — Article 49 of Law 59.21; research 02 §1) |
| Actors | School leadership, accounting |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Fee schedules (MVP)
  Scenario: A level's fee schedule with ancillary fees
    Given the 2026-2027 year at School A
    When the school leadership creates the 2AC fee schedule with monthly tuition of 1,200 DH, non-refundable registration of 2,000 DH, annual insurance of 150 DH and monthly transport by zone
    Then each line carries a bilingual label, frequency, amount, mandatory-or-optional status and a tax classification
    And the validated fee schedule can be exported as a fee-disclosure document (Article 49)
  Scenario: Forced-sale safeguard
    Given a "textbooks" line marked mandatory
    When the school leadership confirms the fee schedule
    Then a legal alert is shown and confirmation requires a traced justification
```

### FR-FIN-02 — Generate and archive the parents' contract under Law 59.21 with fixed tariffs

| Attribute | Value |
|---|---|
| Description | When an enrollment is activated (PRE-ENROLLED → ACTIVE), the system generates the annual written school-parents contract required by Law 59.21 (published in Official Gazette No. 7485 of 23/02/2026; a template set by regulation, configurable by the school): identification of the parties, the full applicable fee schedule, the payment schedule, statutory notices (prohibition of mid-year increases, re-enrollment terms). The contract is bilingual FR/AR, signed by the legal tutor (required signatory, RG-14b) and, where distinct, countersigned by the financial guardian so the payment schedule is enforceable against them (ARB-20h). In MVP, acceptance is simple and logged electronically (a one-time code sent to the signatory's number, timestamped, with the document's fingerprint) or, absent a claimed account, a scanned paper signature attached by the front desk; an advanced-level signature with a timestamp and a verification QR code arrives in V1 (DEC-30, INT-SIG). The contract is archived in the enrollment's file, a copy is given to the parents, and it is kept available for the AREF office. For an enrollment activated through a mid-year import (ARB-02), the contract is generated at import time and its acceptance is gathered once the account is claimed, with a reminder sent. Any mid-year change to the tariff on an active enrollment is technically impossible: a tariff change only applies to new enrollments or the following year (INV-40). Scope of the parents'-contract owners: FR-INS-16 (`prd/modules/11-admissions-enrollment-reenrollment.md`) owns the enrollment flow (generation and signature at the front desk); FR-FIN-02 owns the contract's financial components (applicable fee schedule, payment schedule, tariff fixing, INV-40); CNF-11 (`prd/cross-cutting/36-legal-compliance-data-protection.md`) owns the compliance requirement and the regulatory template — the three requirements reference one another without duplicating content. |
| Priority | Must |
| Version | MVP (wave 1 — simple logged acceptance; ARB-01, ARB-20h; OQ-01 resolved); V1 (advanced electronic signature, DEC-30) |
| Traceability | (→ §7.7, INV-40, RG-13, RG-14b, DEC-30, H-14; correction No. 2; research 02 §1; ARB-01, ARB-02, ARB-20h) |
| Actors | School leadership, legal tutor (signatory), financial guardian (countersignatory) |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Parents' contract under Law 59.21 (MVP)
  Scenario: Generation and acceptance at activation
    Given a PRE-ENROLLED enrollment for Sara in CE2, whose legal guardian is Ahmed, also the financial guardian
    When the enrollment moves to ACTIVE
    Then a bilingual contract is generated with the applicable fee schedule, the payment schedule and statutory notices
    And Ahmed accepts it via a one-time code from his account, the acceptance timestamped with the document's fingerprint
    And the contract is archived in the enrollment's file and a copy is given to Ahmed

  Scenario: Distinct financial guardian
    Given an enrollment whose legal guardian is the father and whose financial guardian is the grandfather
    When the contract is generated
    Then the father's signature and the grandfather's countersignature are both required
    And the payment schedule is enforceable against the grandfather only after his traced countersignature

  Scenario: Tariff fixed for the year
    Given an ACTIVE enrollment with an archived contract
    When the school leadership publishes a new version of the fee schedule
    Then this enrollment's payment schedule stays unchanged and the new fee schedule only applies to new enrollments
```

### FR-FIN-03 — Generate the payment schedule per enrollment

| Attribute | Value |
|---|---|
| Description | For each enrollment, a payment schedule is generated from the applicable fee schedule, at the school's choice: monthly over 10 months (September to June, the market default), quarterly (3 installments, the bilingual DEC-35 pilot school's configuration) or annual (payment in full, with a configurable cash discount). The schedule integrates one-time fees (registration, re-enrollment, insurance) and recurring fees, as well as the re-enrollment-campaign deposit (PC-02). Manual adjustment is possible (dates, amounts, a negotiated split) with the author and the reason traced. **Proration** (ARB-20c): for an arrival, a departure or a transfer during the year, the month already begun is due in full by default (observed practice); the school may choose daily proration per fee type; annual fees (registration, insurance) follow their own refund rule (FR-FIN-01). A mid-year change of class, arrangement or options recomputes unsettled installments without ever touching settled ones (append-only entries, by analogy with INV-07). Installment statuses: due, partially paid, paid, overdue. Installments feed the unpaid-balances table (FR-FIN-20), the aged balance (FR-FIN-21) and the reminder engine (FR-FIN-18). |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §2.4, §2.8, §7.7, G-15, DEC-35; ARB-20c; OQ-06 resolved) |
| Actors | Accounting, front desk, school leadership |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Payment schedule (MVP)
  Scenario: Ten-month monthly schedule
    Given a 2026-2027 fee schedule for 2AC with monthly tuition of 1,200 DH and annual insurance of 150 DH
    When Youssef's enrollment moves to ACTIVE on September 5
    Then ten monthly installments of 1,200 DH are created from September to June
    And a single insurance installment of 150 DH is created on the activation date

  Scenario: Mid-year arrival with the month already begun due in full
    Given the same fee schedule and an enrollment activated on January 18
    When the payment schedule is generated with the default rule
    Then six monthly installments of 1,200 DH are created from January to June
    And the month of January is due in full

  Scenario: Mid-year departure
    Given an enrollment closed to WITHDRAWN on March 12
    When the payment schedule is recomputed
    Then the unsettled April-to-June installments are voided with a trace
    And the March installment stays due in full and the balance survives closing (FR-FIN-23)
```

### FR-FIN-04 — Apply the sibling discount automatically

| Attribute | Value |
|---|---|
| Description | An automatic discount, configurable by the school: a percentage or a flat amount, applying to tuition and/or designated fees, possibly graduated by the child's rank (1st, 2nd, 3rd enrolled sibling). It applies as soon as at least two students of the same sibling group (linked to the same guardian through `ParentStudentRelationship`) are active enrollments at the same school in the same year. Automatic computation when the fee schedule is assigned and recomputed whenever a sibling is added or removed; the discount appears on the payment schedule and invoices as a distinct, referenced line. The scope is intra-school by default; extending it to a multi-school group is an organization-level option (V1, OQ-05 resolved). |
| Priority | Must |
| Version | MVP (wave 1 — a pilot with more than 2,000 students counts hundreds of sibling groups; ARB-01) |
| Traceability | (→ §7.7, G-15, RG-12b; ARB-01) |
| Actors | Accounting, school leadership |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Automatic sibling discount (MVP)
  Scenario: Second child enrolled
    Given a sibling discount configured at 10 percent on tuition from the second child on
    And Youssef enrolled ACTIVE at School A with Ahmed as financial guardian
    When Sara's enrollment, same guardian, moves to ACTIVE at the same school
    Then the 10 percent discount is applied to Sara's tuition installments as a distinct line
    And Ahmed's payment schedule shows the discount, referenced

  Scenario: A sibling leaves
    Given the sibling discount applied to Sara
    When Youssef's enrollment closes mid-year
    Then the discount is removed from Sara's unsettled installments, with the recomputation traced
```

### FR-FIN-05 — Process negotiated discounts and internal scholarships with approval

| Attribute | Value |
|---|---|
| Description | Entry of a negotiated discount (an amount or percentage, applying to designated fees, valid for the year) or an internal scholarship (amount, criteria, reason) on an enrollment, with a mandatory approval workflow: any discount or scholarship requires validation by an authorized role (default: school leadership) before any accounting effect; a threshold triggering dual validation is configurable. A full history (requester, approver, reason, dates) is logged (RG-38). A discount granted mid-year never has a retroactive effect on already-settled installments: it is applied against the remaining ones. The scholarship and discount appear on invoices and on the parent's financial status. |
| Priority | Must |
| Version | V1 |
| Traceability | (→ §2.8, §7.7, RG-38) |
| Actors | Accounting (entry), school leadership (approval) |

### FR-FIN-06 — Issue invoices compliant with mandatory notices

| Attribute | Valeur |
|---|---|
| Description | Issuance of invoices compliant with Article 145 of the CGI: the issuer's identity and address, tax identifier (IF), common enterprise identifier (ICE) of the school (the tenant's legal data, RG-22); the client's ICE where subject to VAT; continuous chronological numbering (FR-FIN-07); date; a breakdown by fee nature with a VAT classification (FR-FIN-08); payment method; pre-tax/tax-inclusive totals. The trade-register (RC) and business-license (patente) notices, common practice but not required by Article 145 (research 02 §7), are shown for information, configurably (OQ-03). A bilingual FR/AR invoice (DEC-10), rendered as a PDF, archived for 10 years (DEC-22), linked to the enrollment and the financial account. An invoice may cover one installment, a group of installments, or ad hoc fees. |
| Priority | Must |
| Version | V1 |
| Traceability | (→ §7.7, RG-22, INV-40, DEC-10, DEC-22, H-07; research 02 §7; OQ-03) |
| Actors | Accounting, school leadership |

### FR-FIN-07 — Guarantee continuous, tamper-proof sequential numbering

| Attribute | Value |
|---|---|
| Description | Invoice and receipt numbers are assigned by a continuous sequence, with no gaps and no reuse, per school (and per fiscal year if the school configures it). Assignment happens server-side at the moment a document is finally confirmed: no numbered draft, no offline numbering, no deletion of a numbered document. An error is corrected by a credit note linked to the original invoice, itself numbered. Any attempt to work around this (editing, reassigning) is blocked and logged (RG-38). |
| Priority | Must |
| Version | MVP (receipt and void-receipt sequence, FR-FIN-17, FR-FIN-29 — INV-40 from the MVP); V1 (invoices and credit notes, FR-FIN-06) |
| Traceability | (→ §7.7, INV-40, RG-38; ARB-01) |
| Actors | Accounting |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Tamper-proof numbering (MVP)
  Scenario: A receipt numbered at server-side confirmation
    Given a payment entered on a workstation whose connection then drops
    When the cashier confirms it
    Then no number is assigned until the server confirms, and confirmation resumes with no duplicate number on reconnection
  Scenario: Deletion attempt
    Given a receipt numbered 2026-0418
    When a user attempts to delete it or edit its number
    Then the action is blocked and logged; only voiding through a reversing entry (FR-FIN-29) is offered
```

### FR-FIN-08 — Classify each fee for tax purposes (out of scope, exempt, taxable)

| Attribute | Value |
|---|---|
| Description | Each fee nature carries a tax classification that drives invoice notices: (a) tuition is **out of the scope of VAT** (corrected by DGI response No. 340 of 18/04/2004); (b) catering, transport and school leisure activities **provided by the school itself** to its own students are **exempt with no right of deduction** (CGI Article 91-V-4°); school supplies are exempt (Article 91-E-4°, 2024 Finance Act); (c) **re-billing services provided by a third party** is taxable: transport at 10% since 01/01/2026 (Circular Note 735 of the 2024 Finance Act, after 14% then 13% in 2025), catering at 10%. Rates are configurable with a history (the rate applied depends on the transaction date); out-of-scope and exempt lines carry the corresponding statutory notice. Safe default classification: out of scope or exempt; making a line taxable requires an explicit action by the school. |
| Priority | Must |
| Version | V1 |
| Traceability | (→ H-07; research 02 §7; correction No. 15) |
| Actors | School leadership, accounting |

### FR-FIN-09 — Prepare electronic invoicing (UBL export)

| Attribute | Value |
|---|---|
| Description | The billing model keeps, for every invoice, the structured data required for a UBL export (issuer/client identifiers, lines, pre-tax/tax-inclusive amounts, classifications, contract references); a UBL export of a period's invoices is available. The DGI's electronic platform has been developed and accepted, but the implementing decree is not published as of 09/09/2026 (UBL format, qualified signature, a clearance model have been announced); the press-reported timeline (large enterprises 2026, mid-size/small businesses 2027-2028, micro-businesses after 2028; B2C not initially planned) leaves most parents — private individuals — out of scope for now (research 02 §7, correction No. 15). Operational compliance (clearance, signature) is a milestone triggered by the decree's publication (H-17), with no redesign of the model. |
| Priority | Should |
| Version | V1 (preparatory export); compliant activation: V2+ (H-17, H-08) |
| Traceability | (→ H-08, H-17; research 02 §7; correction No. 15) |
| Actors | Accounting, school leadership |

### FR-FIN-10 — Record a multi-method payment collection with allocation to installments

| Attribute | Value |
|---|---|
| Description | Recording a payment against one or more installments, an invoice, or the guardian's account: cash, cheque, bank transfer in MVP; Fatourati in V1 (FR-FIN-15); direct debit and card in V2 (FR-FIN-14, FR-FIN-16). Each payment carries: method, amount, value date, reference (cheque number, bank reference, Fatourati reference), the collector, a cash session for cash payments from V1 on (FR-FIN-11); in MVP, logging only. Allocation against installments in the configured order (default: oldest first); any surplus becomes a credit carried on the guardian's account, usable against later installments or refundable (FR-FIN-27). Every payment triggers the `PaymentReceived` event (receipt, notification, balance update). A partial payment leaves the installment "partially paid". A payment covering several children of the same payer is split per FR-FIN-30; an erroneous payment is voided per FR-FIN-29, never deleted. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §2.8, §7.7, H-09, G-15; event: `prd/03-domain-data-model.md` §7; FR-FIN-29, FR-FIN-30) |
| Actors | Front desk/cashier, accounting |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Front-desk payment collection (MVP)
  Scenario: Cash with no cash session
    Given Youssef's October installment of 1,200 DH in "due" status
    When Fatima collects 1,200 DH in cash at the front desk
    Then the payment is recorded with method, amount, value date and collector, with no cash session required in MVP
    And the installment moves to "paid", the balance is updated and a numbered receipt is printed and sent to the financial guardian

  Scenario: Partial payment
    Given the same 1,200-DH installment
    When the guardian settles 700 DH by a confirmed bank transfer
    Then the installment moves to "partially paid" with 500 DH remaining due
    And the receipt states the remaining balance

  Scenario: Surplus carried as credit
    Given a guardian who pays 1,500 DH against a 1,200-DH installment
    When the payment is confirmed
    Then 300 DH are carried as a credit on the guardian's account, usable against the next installment or refundable (FR-FIN-27, V1)
```

### FR-FIN-11 — Manage cash sessions (discrepancy, closing)

| Attribute | Value |
|---|---|
| Description | Opening of a cash session in the collector's name (per collector and per site) with an opening cash float; every cash payment is attached to it. Closing with a declared count: the system computes the discrepancy between theoretical collections and cash counted, requires a free-text justification for the discrepancy, locks the session and produces an exportable cash journal for the day. A forced closing is possible with a reason (logged). Discrepancies are visible on the school-leadership dashboard (a drift indicator, with no automatic disciplinary action). In MVP (no session), cash collection stays possible and is logged; the session becomes mandatory for cash from V1 on. |
| Priority | Must |
| Version | V1 |
| Traceability | (→ §7.7, §12 V1, RG-38, RG-37) |
| Actors | Front desk, school leadership |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Collecting cash within a cash session
  Scenario: Successful collection against an installment
    Given a cash session opened by the cashier with a 500-DH float
    And the student Youssef has an 800-DH installment in "due" status (October's monthly fee)
    When the cashier collects 800 DH in cash against this installment
    Then the payment is recorded, attached to the current session and to the installment
    And a numbered receipt is printed and sent to the financial guardian
    And the installment moves to "paid" and the financial account's balance is updated
    And the PaymentReceived event is logged with the author and the timestamp

  Scenario: Closing a session with a discrepancy
    Given a session whose total recorded cash collections is 4,300 DH
    When the cashier closes the session declaring 4,150 DH counted
    Then the -50-DH discrepancy is computed, shown and recorded with its justification
    And the session is locked and the day's cash journal is exportable
    And the discrepancy appears on the school-leadership dashboard

  Scenario: Collection with no session open (from V1 on)
    Given no cash session open for the collector
    When they attempt to collect cash
    Then the collection is refused with a prompt to open a session
    And no receipt number is consumed
```

In MVP (no cash session), cash collection is allowed outside a session and logged; the first two scenarios apply as written from V1 on.

### FR-FIN-12 — Track the full lifecycle of cheques

| Attribute | Value |
|---|---|
| Description | Every cheque follows the cycle: **handed over** (recorded at the front desk, often in advance for several monthly installments, §2.8) → **deposited** (individually or in a dated batch deposit) → **cleared** (value date) or **bounced** (reason, date, bounce-notice reference) → **regularized** (a new deposit of the corrected cheque or a compensating payment) or **in litigation** (a switch decided by the school leadership; tracking then moves to manual, off-platform, with documents archived in the file). A cheque portfolio with deposit due dates and alerts; a post-dated cheque covers future installments without marking them paid before it actually clears. On a bounce: the covered installments revert to unpaid, the balance re-includes the arrears, configurable bounce fees may be charged, a dedicated reminder is triggered. Legal framework taken into account (research 03 §3): roughly 972,232 bounced cheques a year; law 71-24 decriminalizes the first incident, grants a one-month regularization period renewable once, and provides for a 5-year banking ban failing that. The module automates no legal wording: the switch to litigation is a human decision. Cheques already in the portfolio at a mid-year data import are imported with their status (ARB-02). |
| Priority | Must |
| Version | MVP (wave 1 — the post-dated cheque handed over in September is the dominant method, §2.8, BES-SEC-02; ARB-01) |
| Traceability | (→ §2.8, §7.7; research 03 §3; BES-SEC-02; ARB-01, ARB-02) |
| Actors | Front desk, accounting, school leadership |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Lifecycle of a bounced cheque
  Scenario: Bounce after deposit
    Given a 3,000-DH cheque handed over in September, in "handed over" status, covering the October monthly fee
    And a bank deposit on November 3 including this cheque
    When the bank returns the cheque for insufficient funds on November 8
    Then the cheque moves to "bounced" status with a reason, date and bounce-notice reference
    And the October monthly fee reverts to "overdue" status and the balance re-includes 3,000 DH in arrears
    And a notification is sent to the financial guardian and a reminder is scheduled
    And the incident is logged with the author of the entry

  Scenario: Regularization
    Given a cheque in "bounced" status and an installment back to unpaid
    When the guardian brings a compensating cash payment
    And the school records the regularization
    Then the cheque moves to "regularized" status with both attempts traced
    And the installment is settled by the new payment and a receipt is issued

  Scenario: Switch to litigation
    Given a "bounced" cheque not regularized after the reminder tiers and the regularization period
    When the school leadership switches the file to "litigation"
    Then automatic reminders stop and the file moves to manual tracking
    And documents (bounce notice, letters, history) are archived in the file
```

### FR-FIN-13 — Collect by bank transfer with assisted reconciliation

| Attribute | Value |
|---|---|
| Description | Collection by bank transfer: entry with the advice's reference (transaction number, label), the bank value date, the amount; reconciliation against installments through assisted search (reference, amount, guardian). A structured bank statement can be imported to pre-match transfers: pre-matching is offered, human validation remains mandatory. A transfer not yet validated shows as "pending confirmation" and does not affect the amount due. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §2.8, §7.7) |
| Actors | Accounting |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Collection by bank transfer (MVP)
  Scenario: Manually reconciled transfer
    Given a 1,200-DH transfer received with the reference "YOUSSEF OCT" into School A's account
    When accounting enters the transfer with its reference and value date and reconciles it against Youssef's October installment
    Then the installment moves to "paid" and a receipt is issued to the financial guardian
  Scenario: Transfer pending confirmation
    Given a transfer entered without validation
    When the unpaid-balances table is viewed
    Then the installment stays due and the transfer shows as "pending confirmation"
```

### FR-FIN-14 — Manage semi-manual direct debit on mandates

| Attribute | Value |
|---|---|
| Description | A direct-debit mandate signed by the financial guardian and archived in the file; a debit schedule aligned with the installments; generation of a debit file handed to the school's bank (no bank API is documented in Morocco for this flow: mandate + file exchanges with the bank, research 03 §3); import of the return file to flag received and rejected debits; a rejection makes the installment due again with a reminder and configurable fees where applicable. ZSchool has no direct access to the bank account and holds no funds. |
| Priority | Should |
| Version | V2 |
| Traceability | (→ §12 V2, DEC-31; research 03 §3) |
| Actors | Accounting, the school's bank (off-platform) |

### FR-FIN-15 — Expose and reconcile Fatourati online payment

| Attribute | Value |
|---|---|
| Description | Connection to CMI's Fatourati rail: the school is the creditor and beneficiary of the funds, ZSchool is the connected software vendor (the Aggregator offer, launched 17/02/2026), holding no funds and playing no regulatory role (research 03 §1). Functions: exposing receivables with a stable school reference per guardian and generating a reference/QR code per receivable; real-time response to debt queries from payment channels (32 banks and payment institutions, more than 70 channels, more than 25,000 cash points); automatic recording of payment confirmations with the Fatourati reference and matching against the receivable; daily file-based reconciliation with duplicate rejection; a list of discrepancies for accounting to process; immediate deactivation of receivable references settled elsewhere. The Collect mode (a per-school web application) can complement this for a self-contained school; tariffs and the contract remain to be obtained (H-19). |
| Priority | Must |
| Version | V1 (DEC-31 prevails over the "later version" wording of §7.7 and §12 V2; see OQ-02 and PC-08 of `prd/journeys/00-journey-map.md`) |
| Traceability | (→ DEC-31, H-09, H-19; research 03 §1; correction No. 8) |
| Actors | Financial guardian (payment), accounting (reconciliation), school leadership |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Reconciled Fatourati online payment
  Scenario: Settling a receivable through a banking channel
    Given a 1,200-DH receivable exposed on Fatourati with school reference R-2026-0142
    When the parent pays 1,200 DH from their banking app
    And Fatourati confirms the payment to ZSchool
    Then the payment is automatically recorded with the Fatourati reference
    And it is matched against the receivable, which moves to settled and stops being exposed
    And a receipt is issued and sent to the financial guardian
    And the PaymentReceived event is logged

  Scenario: Rejecting duplicates at daily reconciliation
    Given a Fatourati confirmation already recorded (same transaction reference)
    When the daily reconciliation file contains this confirmation again
    Then the duplicate is rejected and logged
    And no second payment or second receipt is created

  Scenario: Reconciliation discrepancy
    Given a settlement present in the reconciliation file with no prior confirmation recorded
    Then the discrepancy appears in the reconciliation list to process
    And the accountant can match it manually with a reason, the operation staying logged
```

### FR-FIN-16 — Collect by card with a stored card (recurring)

| Attribute | Value |
|---|---|
| Description | Payment by a stored card: the token is held by the school's acquirer — NAPS e-Premium (Card-On-File included, published national rate of 1.98% excl. tax) or Chari Pay (tokenization, recurring payment, a declining rate announced from 1.8%) or a payment-institution acquirer stemming from the CMI contract handover (research 03 §2); YouCan Pay is excluded (activity discontinued in January 2024, correction No. 7). Consent (a card debit mandate) signed and archived; execution on each installment; failure handling (notification, reminder, retry); receipts. ZSchool is a technical provider and agent, never a fund holder; the acquirer contract is signed by the school. Integration reference: INT-CAR (`prd/cross-cutting/35-external-integrations.md`). |
| Priority | Should |
| Version | V2 |
| Traceability | (→ DEC-31; research 03 §2; correction No. 7) |
| Actors | Financial guardian, accounting |

### FR-FIN-17 — Issue printable, sent, numbered receipts

| Attribute | Value |
|---|---|
| Description | Every payment produces a numbered receipt (its own continuous, tamper-proof sequence from the MVP, FR-FIN-07), bilingual FR/AR, immediately printable at the front desk and automatically sent to the financial guardian (in-app or SMS notification in MVP; WhatsApp utility and push in V1 per DEC-12 and DEC-36 — arbitration D1, OQ-08; email if provided). The receipt details: the issuer with its ICE, the student(s) and installments covered (a single receipt for a family payment, FR-FIN-30), the payment method and amount, the remaining balance. Receipts are archived for 10 years with the payments (DEC-22) and reissuable unchanged (a marked reissue); an erroneous receipt is voided by a void receipt (FR-FIN-29), never edited. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §7.7, DEC-10, DEC-12, DEC-22, DEC-36, INV-40; FR-FIN-07, FR-FIN-29, FR-FIN-30) |
| Actors | Front desk, financial guardian (recipient) |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Numbered receipts (MVP)
  Scenario: Continuous numbering
    Given the school's last receipt numbered 2026-0417
    When two payments are confirmed in a row
    Then the receipts carry numbers 2026-0418 and 2026-0419, assigned server-side at confirmation
    And no numbered receipt can be deleted

  Scenario: Sent to the financial guardian
    Given a payment confirmed for a financial guardian with no email on file
    When the receipt is issued
    Then an in-app notification and an SMS with a link to the receipt are sent to their mobile number
    And the bilingual receipt is downloadable from their account
```

### FR-FIN-18 — Trigger automatic graduated reminders

| Attribute | Value |
|---|---|
| Description | A reminder engine (`Dunning`) per unpaid installment: tiers configurable by the school (count, offsets such as D-3 before the due date then D+X after, increasing severity), channels per tier — in-app and SMS in MVP; WhatsApp utility, push and printable mail at the final tier in V1 (arbitration D1: in MVP, in-app and SMS only, with WhatsApp utility staying limited to attendance notifications; ARB-20i). Reminders honor the sending windows (08:00-20:00, configured days) and the STOP opt-out, which applies only to reminders and announcements (ARB-21 d, e). Bilingual templates with variables (student, amount, due date, reference, the simplest payment method, portal access). Automatic daily triggering; immediate stop once settled; a full history per tier with channel and cost (tracked in `DeliveryLog`, consumable packs billed to the school, DEC-28). WhatsApp opt-in is honored (falling back to SMS otherwise); the STOP opt-out is handled. Safeguard: no template mentions withholding official documents or exclusion for unpaid balances (DEC-24); only consequences on non-mandatory services may be mentioned. Reminders target the financial guardian (and the relevant payer under a multi-payer split). An ad hoc manual reminder is possible from the unpaid-balances table. Channels follow the COM module's versions: in-app and SMS in MVP, WhatsApp in V1, printable mail in V1. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §7.7, DEC-12, DEC-24, DEC-28, DEC-36, RG-38; research 03 §4-5) |
| Actors | Accounting, school leadership, financial guardian (recipient) |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Graduated reminder for an unpaid installment
  Scenario: Triggering the tiers
    Given a 900-DH installment unpaid since October 5
    And tiers configured at D+3 (in-app), D+7 (SMS), D+15 (printable mail, from V1 on)
    And a parent with an active account and a mobile number on file
    When the D+7 tier's date is reached with no payment
    Then an SMS reminder is sent from the bilingual template
    And the reminder is logged with its tier, channel and cost
    And the unpaid-balances table reflects the tiers' status

  Scenario: Reminders stop once settled
    Given tiers scheduled on an unpaid installment
    When a payment settles the installment
    Then the remaining reminders are canceled
    And a receipt is sent to the financial guardian

  Scenario: Content safeguard
    Given any reminder tier or letter
    Then no message mentions withholding official documents or exclusion for unpaid balances
    And the template is not published if it contains such wording
```

### FR-FIN-19 — Manage reminder and letter templates

| Attribute | Value |
|---|---|
| Description | A library of FR and AR templates (upcoming-due-date reminder, overdue notice, bounced-cheque notice, amicable formal notice, end-of-amicable-process letter, settlement certificate) with variables and a preview before sending; customization by the school reserved to the school leadership, with versions. Default templates comply with DEC-24 and use a factual tone; mail-based tiers may require local approval before printing. |
| Priority | Should |
| Version | V1 |
| Traceability | (→ §7.7, DEC-10, DEC-24) |
| Actors | School leadership, accounting |

### FR-FIN-20 — View the unpaid-balances table by class and by guardian

| Attribute | Value |
|---|---|
| Description | A consolidated view of unpaid balances: by student/enrollment (a breakdown of overdue installments), by class, by level, by financial guardian (grouping all their students), by site; filters (year, period, status, amount) and totals; inline actions: collect, remind, view history. Closed-enrollment accounts not yet settled appear with a "closed file" tag (RG-12). Viewing scopes follow permissions (RG-37, RG-39): the front desk sees its own scope, the school leadership sees everything. Excel/CSV export. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §7.7, RG-12, RG-37, RG-39; BES-DIR-02, BES-SEC-02) |
| Actors | School leadership, accounting, front desk |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Unpaid-balances table (MVP)
  Scenario: View by multi-child financial guardian
    Given Ahmed, financial guardian of Youssef and Sara at School A, with two overdue installments
    When the school leadership opens the unpaid-balances table by guardian
    Then one row groups Ahmed with the total of both installments and the per-child detail
    And the collect and remind actions are available from the row

  Scenario: Closed file not settled
    Given a TRANSFERRED enrollment with 1,500 DH still due
    When the table is shown
    Then the row carries the "closed file" tag and stays in the unpaid totals
```

### FR-FIN-21 — Produce the aged balance

| Attribute | Value |
|---|---|
| Description | Aged balance by financial guardian and by student: outstanding amounts broken down by age band since the due date (0-30, 31-60, 61-90, over 90 days), per school and consolidated at the organization level for a group (V1); highlighting at-risk receivables (bounced cheque, litigation, exhausted reminders); change from the previous period; export for collection action. A treasury-management tool for the PC-07 journey. |
| Priority | Must |
| Version | V1 |
| Traceability | (→ §7.7, BES-DIR-02) |
| Actors | School leadership, accounting |

### FR-FIN-22 — Distinguish the financial guardian, multi-payer splits and the third-party payer

| Attribute | Value |
|---|---|
| Description | The enrollment's financial guardian (RG-13: at least one per enrollment, possibly distinct from the legal guardian) is designated, editable and traced; they may be a third party with no parental relationship (grandparent, employer). Multi-payer split: sharing an installment's or the balance's amount between two or more payers (percentages or fixed amounts), each notified of their share and receiving their own receipts; reminders go to the relevant payer. The third-party payer is modeled as a `ParentStudentRelationship` of type "third-party payer" carrying only the "financial guardian" status (ARB-14): a receipt in their name, access limited to the financial sphere, no access to school data (RG-13/RG-14, G-30); `FinancialAccount` is always attached to a relationship, which satisfies INV-18. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ RG-13, RG-14, G-30, §2.8, §7.7; BES-GAR-07; INV-18; ARB-14) |
| Actors | School leadership, accounting, guardians and payers |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Financial guardian, multi-payer split and third-party payer (MVP)
  Scenario: Grandfather as third-party payer
    Given Lina's enrollment, whose legal guardian is the father and whose custodial parent is Naïma
    When the front desk registers the grandfather as third-party payer
    Then a "third-party payer" relationship carrying only the "financial guardian" status is created
    And the grandfather receives receipts and reminders but sees no grades, absences or documents

  Scenario: Split between two payers
    Given a 1,200-DH installment split 50/50 between the father and the mother
    When the father pays 600 DH
    Then his share is settled, the mother's stays due, and each payer receives their own receipt
```

### FR-FIN-23 — Keep the balance and access alive after the enrollment closes

| Attribute | Value |
|---|---|
| Description | When an enrollment closes (TRANSFERRED, WITHDRAWN, EXPELLED, COMPLETED), the financial account stays active until settled (RG-12, INV-08, C-10): the school keeps full access (payment collection, reminders, statements, billing for arrears) with no need to recreate an enrollment; the parent keeps read access to their payment history and balance from their multi-school portal; for an adult student, financial access stays with the financial guardian as long as they owe money (RG-02, DEC-20). Settlement entries (payment, discount, credit note) are recorded on the original account and logged. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ RG-12, RG-02, C-10, INV-08, DEC-20) |
| Actors | Accounting, school leadership, financial guardian |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Balance surviving the enrollment's closing
  Scenario: Settlement after departure
    Given a student whose enrollment moved to TRANSFERRED status with 1,500 DH still due
    When accounting records a 1,500-DH bank transfer against this closed enrollment's account
    Then the payment is accepted with no new enrollment created
    And the balance drops to zero (account settled) with a numbered receipt
    And the file leaves the unpaid-balances table and the operation is logged
```

### FR-FIN-24 — Hand over an account statement on departure and optionally carry forward unpaid balances

| Attribute | Value |
|---|---|
| Description | When a student leaves, a detailed account statement is generated (settled and remaining installments, payments, discounts and scholarships) and handed **to the financial guardian only** (ARB-20e) together with the exit file (with `prd/modules/15-documents-certificates.md` and `prd/modules/18-transfers-mobility.md`), with no blocking whatsoever (DEC-24). Optional carry-forward of unpaid balances: the school may mark the remaining balance as a "collection receivable" carried on the financial guardian's account within the tenant of origin (the financial relationship survives), kept in reminders and the aged balance; this practice exists in international SIS reference systems (a "transfer unpaid fees" option, research 01 §5). The balance is never automatically sent to the receiving school; the leaving certificate stays neutral (no balance mentioned, DEC-24). Inter-site transfer within the same group with an actual carry-forward of the receivable is a V2+ option: in V1, ZSchool does not transfer the receivable, which stays with the school of origin (RG-12, C-10) — a reference requirement, realigned with FR-TRA-10 (`prd/modules/18-transfers-mobility.md`), which refers back to it. |
| Priority | Must |
| Version | MVP (wave 1 — account statement on departure, a component of the exit file FR-DOC-01; ARB-01); V1 (optional carry-forward of unpaid balances as a collection receivable) |
| Traceability | (→ RG-12, DEC-24, DEC-32, C-10; research 01 §5; FR-TRA-10 `prd/modules/18-transfers-mobility.md`; ARB-01, ARB-20e) |
| Actors | Accounting, school leadership, front desk |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Account statement on departure (MVP)
  Scenario: Statement handed to the financial guardian
    Given Youssef's enrollment closed to TRANSFERRED with 1,500 DH still due
    When the exit file is assembled
    Then a detailed account statement (settled and due installments, payments, discounts) is generated and handed to Ahmed, the financial guardian
    And the leaving certificate carries no balance mention
  Scenario: A guardian who is not the financial guardian
    Given Naïma, holder of custody with no financial-guardian status
    When she views her daughter's exit file
    Then the account statement is not shown to her
```

### FR-FIN-25 — Export the cash journal and the simplified general ledger

| Attribute | Value |
|---|---|
| Description | Accounting exports configurable by period: cash journal (by day and by session, with closing discrepancies), receipts journal by payment method, simplified general ledger by financial guardian and by fee nature, list of invoices and credit notes, aged balance; CSV and Excel formats compatible with common accounting software (ISO dates, amounts in MAD, labeled columns); a separate UBL export (FR-FIN-09). Every export is logged (RG-38), carries the documents' official numbering and observes the 10-year retention period (DEC-22). |
| Priority | Must |
| Version | V1 |
| Traceability | (→ §7.7, §12 V1, RG-38, DEC-22) |
| Actors | Accounting, external accountant (recipient) |

### FR-FIN-26 — Expose financial status to the parent in self-service

| Attribute | Value |
|---|---|
| Description | In the parent portal (web and mobile), per child: the payment schedule with statuses, the amount of the next installment, payment history with downloadable receipts, discounts and scholarships applied, balance; an upcoming-due-date alert (configurable D-3); a "pay" button per version (Fatourati in V1, card in V2). Multi-child, multi-school view: a multi-school parent aggregates every child's installments from a single screen (BES-PAR-03, BES-PAR-04). FR/AR interface. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ §7.7, BES-PAR-03, BES-PAR-04, DEC-31) |
| Actors | Financial guardian, payers, adult student (per RG-02 rights) |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Self-service financial status (MVP)
  Scenario: Aggregated multi-school view
    Given Ahmed, financial guardian of Youssef and Sara (School A) and of Adam (School B)
    When he opens the "Payments" tab of his account
    Then he sees, per child and per school, the payment schedule, the next installment and the balance, with an aggregated total
    And he downloads each payment's receipt

  Scenario: An adult student with an indebted financial guardian
    Given Salma, an adult, who has restricted parental access to school data
    When her father, the financial guardian, opens her financial status
    Then Salma's payment schedule and receipts stay visible to him as long as he owes money
```

### FR-FIN-27 — Process refunds with approval

| Attribute | Value |
|---|---|
| Description | Refund of an overpayment (a carried credit) or a refundable fee (default: registration is non-refundable, §2.8): reason, amount, refund method (cash with a traced cash-session outflow, or bank transfer), school-leadership approval beyond a configurable threshold, a numbered refund document, an account update and reclassification of installments if needed. Logged end to end (RG-38). |
| Priority | Should |
| Version | V1 |
| Traceability | (→ §2.8, RG-38; `Refund` entity V1: `prd/03-domain-data-model.md` §2.5) |
| Actors | Accounting, school leadership |

### FR-FIN-28 — Never block official documents for unpaid balances

| Attribute | Value |
|---|---|
| Description | No state of the finance module blocks the generation of the enrollment certificate, the leaving certificate, report cards or transcripts (DEC-24, Q-06, INV-39; implementation carried by `prd/modules/15-documents-certificates.md`). When there are arrears, the student file carries a visible alert (amount, overdue installments, last reminder), and the account statement (FR-FIN-24, MVP) is one click away for handing to the financial guardian. The school may, at its sole discretion, condition non-mandatory services (transport, canteen, activities) on payment — a condition carried by the services themselves, effective once they launch in V2+ (`prd/modules/22-ancillary-services-transport-canteen-activities.md`), never by official documents. Every view of financial status is logged (RG-38, INV-33). Written traceability of document requests and deliveries while arrears exist is kept. |
| Priority | Must |
| Version | MVP |
| Traceability | (→ DEC-24, Q-06, G-16, INV-39, INV-33, RG-38; `prd/modules/15-documents-certificates.md`) |
| Actors | Front desk, school leadership, DOC module |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: No document blocking for unpaid balances
  Scenario: Enrollment certificate despite arrears
    Given an active student with 2,400 DH in arrears and three reminders issued
    When the front-desk staff issues the enrollment certificate from the file
    Then the document is generated immediately, with no blocking or blocking warning
    And a non-blocking arrears alert is shown on the file
    And the account statement can be attached in one click
    And the request and the delivery are traced
```

### FR-FIN-29 — Void a payment or a receipt through a traced reversing entry

| Attribute | Value |
|---|---|
| Description | A confirmed payment (wrong student, wrong amount, wrong method, duplicate entry) is never edited or deleted: it is voided by a dated reversing entry carrying the reason, the author, and, beyond a configurable threshold or outside the day it was entered, an authorized role's approval (default: school leadership). Voiding generates a numbered void receipt in the same sequence as receipts (FR-FIN-07) that references the original receipt; the original keeps its number with a "voided" status. Matched installments revert to their previous state, the balance is recomputed, the financial guardian is notified, and the original receipt is flagged "voided" in their space. A new, correct payment is then entered normally. Voidings are visible on the collections dashboard and exported with the cash journal; in V1, voiding an invoice goes through a credit note (FR-FIN-07). |
| Priority | Must |
| Version | MVP (ARB-20b) |
| Traceability | (→ §7.7, INV-40, RG-38; FR-FIN-07, FR-FIN-17; ARB-20b) |
| Actors | Front desk, accounting, school leadership (approval), financial guardian (notification) |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Voiding a payment (MVP)
  Scenario: A receipt issued for the wrong student
    Given a 1,200-DH payment confirmed the same day against Youssef's October installment, receipt 2026-0418
    And the payment actually concerned Sara
    When Fatima voids the payment with the reason "wrong student"
    Then a reversing entry is recorded and a void receipt 2026-0419 references receipt 2026-0418
    And Youssef's October installment reverts to "due" and Ahmed's balance is recomputed
    And Ahmed is notified of the voiding and receipt 2026-0418 is flagged "voided" in his space

  Scenario: Voiding outside the day it was entered
    Given a payment confirmed three days earlier
    When the front desk requests it be voided
    Then the voiding stays pending until the school leadership approves it, with the reason and author traced
```

### FR-FIN-30 — Collect a family payment split across several accounts with a single receipt

| Attribute | Value |
|---|---|
| Description | At the front desk and for online methods, a payer settles, in a single operation, the installments of several children for whom they are financial guardian, at the same school: the collection screen offers all of the payer's children with their due installments, the amount is split automatically (configured order: oldest first, then by child) or manually, and a single `Payment` is recorded with its split across the relevant `FinancialAccount` records (ARB-20a). A single numbered receipt lists the children and installments covered; each financial account carries its allocated share; the unpaid-balances table and the parent's financial status reflect the split. The sibling discount (FR-FIN-04) applies upstream, on the installments. A single cheque covering several children follows the same split (FR-FIN-12). |
| Priority | Must |
| Version | MVP (ARB-20a) |
| Traceability | (→ §2.8, §7.7, RG-12b; FR-FIN-10, FR-FIN-17; ARB-20a) |
| Actors | Front desk, accounting, financial guardian |

**Acceptance criteria (critical flows, Gherkin format)**:

```gherkin
Feature: Family payment (MVP)
  Scenario: One payment for two children
    Given Ahmed, financial guardian of Youssef (October installment 1,200 DH) and Sara (October installment 1,000 DH) at School A
    When Fatima collects 2,200 DH in cash, selecting both children
    Then a single payment is recorded, split 1,200 DH to Youssef's account and 1,000 DH to Sara's
    And a single numbered receipt lists both children and both settled installments
    And the unpaid-balances table no longer shows any October installment for Ahmed

  Scenario: Split partial payment
    Given the same installments and a payment of 1,500 DH
    When automatic splitting is applied with the "oldest first, then by child" order
    Then Youssef's installment is settled and Sara's moves to "partially paid" with 700 DH remaining due
    And the single receipt details the split
```

---

## 5. Morocco specifics

### 5.1 Taxation and invoicing (CGI)

| Point | Rule adopted | Source |
|---|---|---|
| Tuition | Out of the scope of VAT (DGI response No. 340 of 18/04/2004) | research 02 §7 |
| Internal services | Catering, transport, school leisure activities provided by the school to its own students: exempt with no right of deduction (Article 91-V-4°) | research 02 §7 |
| School supplies | Exempt (Article 91-E-4°, 2024 Finance Act) | research 02 §7 |
| Re-billing third parties | Transport at 10% from 01/01/2026 (Circular Note 735/2024 Finance Act, after 14% then 13% in 2025); catering 10% | research 02 §7 |
| Invoice notices | Identity, IF, ICE, address, continuous chronological numbering, payment method, VAT where applicable (Article 145); RC/patente for information (OQ-03) | research 02 §7 |
| Retention | Financial documents 10 years (CGI Article 211; Article 22 of law 9-88); electronic archiving clarified by the 2026 Finance Act | research 02 §7, DEC-22 |
| Electronic invoicing | DGI platform ready, decree not published as of 09/09/2026; UBL format, clearance, qualified signature; B2C out of scope for now | research 02 §7, H-08, H-17, correction No. 15 |

### 5.2 Law 59.21 and school practices

Permanent disclosure of the fee list (Article 49); prohibitions (mid-year increases, forced purchase of textbooks, refusing re-enrollment to a student in good standing); a mandatory annual written contract with a copy to parents and a file available for the AREF office; penalties of up to 10,000 DH for refusing to deliver certificates when the contract is being honored — hence the FR-FIN-28 principle (Official Gazette No. 7485 of 23/02/2026; research 02 §1; correction No. 2).

### 5.3 Local payment methods

Cash is dominant, with cash sessions; post-dated cheques handed over at the start of the year (lifecycle FR-FIN-12); Fatourati as an invoice-payment rail (creditor: the school; channels: 32 banks/payment institutions, more than 25,000 cash points); semi-manual direct debit through the school's bank with no API; a recurring card via NAPS, Chari Pay or a bank payment-institution acquirer; no fund-carrying platform without a Bank Al-Maghrib payment-institution approval — ZSchool never holds any (§2.8, DEC-31; research 03 §1-3).

### 5.4 Other

Financial-transaction timestamps in Morocco's local time: permanent UTC+0 since 20/09/2026 (correction No. 1); bilingual FR/AR financial documents (DEC-10); a September-to-June school billing year (10 months, §2.4); the movable religious-holiday calendar shifts collection windows (Ramadan variant: the front desk open on adjusted hours).

---

## 6. Data and events

FINANCE-domain entities from `prd/03-domain-data-model.md` §2.5 drawn on, with this chapter's local details:

| Entity | Module-specific detail |
|---|---|
| `FeeSchedule`, `FeeItem` | Schedules by year/level/section/track; typed fee natures; VAT classification; refund rule; annual cloning |
| `Discount`, `Scholarship` | Automatic sibling discount; negotiated discounts and scholarships with approval and history |
| `Invoice` | ICE/IF notices; continuous, tamper-proof numbering; linked credit notes; UBL export |
| `Installment` | Due, partially paid, paid, overdue statuses; feeds unpaid balances, aged balance and reminders |
| `Payment` | Methods: cash (session from V1), cheque (a six-state cycle, MVP), bank transfer, direct debit (V2), Fatourati (V1), recurring card (V2); references and value date; **split across several `FinancialAccount` records** (FR-FIN-30); voiding through a reversing entry (FR-FIN-29) |
| `Receipt` | A tamper-proof sequence of its own from the MVP; bilingual; a marked reissue; a single family receipt; a void receipt referencing the original |
| `Refund` | Reason, approval beyond a threshold, a traced cash-session outflow |
| `Dunning` | Tiers, channels, dates, cost; stops once settled |
| `CashSession` | Opening, float, closing, discrepancy, justification, journal |
| `FinancialAccount` | Per enrollment and/or financial guardian, always attached to a relationship (third-party payer: a "third-party payer" relationship type, ARB-14); survives closing (INV-08); carried credits; collection receivable (FR-FIN-24) |

Notifiable events (catalog: `prd/03-domain-data-model.md` §7):

| Event | Effects |
|---|---|
| `PaymentReceived` | Receipt to the financial guardian, balance update, reminders stop, logged |
| `InstallmentOverdue` | Feeds the unpaid-balances table and the aged balance, arms the first reminder tier |
| `ReminderSent` | Notification to the recipient, tier/channel/cost traceability, visible to the school leadership |

Additional events proposed by this chapter (a bounced cheque, a voided payment, a cash session closed with a discrepancy, an invoice issued, an account settled): harmonization requested with the catalog carried by `prd/03-domain-data-model.md` — OQ-07.

---

## 7. Key screens

Text descriptions (no mockups); mobile-first; FR and AR with full RTL (DEC-10, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`).

| ID | Screen | Description |
|---|---|---|
| ECR-FIN-01 | Collections dashboard | Zones: today's and the month's indicators (collected, unpaid, collection rate, the week's installments), a summary aged balance, reminders sent, recent cash discrepancies; site/class filters; direct access to files. States: empty (no data), loading, filters active. On mobile: stacked indicators, expandable tables. Actors: school leadership, accounting. |
| ECR-FIN-02 | Fee schedules | A list of years with fee schedules; editing a schedule by level/section/track with fee lines (nature, frequency, amount, mandatory, VAT, refund); a legal alert and a traced justification are required if a books/supplies/uniform line is marked mandatory (FR-FIN-01); a "clone from previous year" action; a preview of the display document (Article 49). States: draft, confirmed (fixed for the year's active enrollments, INV-40); a new fee-schedule version can be created mid-year for new enrollments only, with the old one staying attached to existing enrollments (FR-FIN-02); confirmation requires explicit approval. Actors: school leadership. |
| ECR-FIN-03 | Enrollment payment schedule | Dated installments with statuses (due, partially paid, paid, overdue), discounts applied, total settled/remaining; actions: adjust (a traced reason), collect, remind; a change history. On mobile: a vertical list by month. Actors: accounting, front desk. |
| ECR-FIN-04 | Collection counter | Search by student or payer (or a reference scan), pre-selected due installments, the option to select several children of the same payer with automatic splitting and a single receipt (FR-FIN-30), a choice of method, amount, reference (cheque/bank), change given for cash; a single confirmation; the receipt printed and sent; a "void a payment" action with a reason and approval (FR-FIN-29). Optimized for an older PC and mobile (BES-SEC-08): keyboard-friendly fields, few clicks, resuming after an outage with no double submission. States: awaiting confirmation, success with a receipt, refused (no session in V1). Actors: front desk/cashier. |
| ECR-FIN-05 | Cash session | Opening (cash float), session in progress (the day's collections, theoretical total), closing (a declared count, computed discrepancy, mandatory justification if there is a discrepancy, locking, an exportable journal). States: open, closed (read-only), forced closing with a reason. Actors: front desk, school leadership. |
| ECR-FIN-06 | Cheque portfolio | A list of cheques by status (handed over, deposited, cleared, bounced, regularized, in litigation) with deposit due dates and alerts; actions: batch deposit, record a clearance or a bounce, regularize, switch to litigation (school-leadership confirmation); a full history per cheque. Actors: front desk, accounting, school leadership. |
| ECR-FIN-07 | Discounts and scholarships | A queue of requests with amounts and reasons; an approve/reject action (the approver traced, dual validation beyond the threshold); a per-student history; the impact shown on the payment schedule before confirmation. Actors: accounting (entry), school leadership (approval). |
| ECR-FIN-08 | Unpaid balances and aged balance | A table by class/guardian with an overdue-installments breakdown, a "closed file" tag (RG-12); an aged balance by band; filters and export; collect/remind actions from the row. Actors: school leadership, accounting, front desk (RG-37/RG-39 scopes). |
| ECR-FIN-09 | Reminders | Tier configuration (offsets, channels, templates) by the school; a library of bilingual templates with variables and a preview; a send history (tier, channel, cost, delivery status); an ad hoc manual reminder. A visible safeguard: a DEC-24 reminder in the editor. Actors: school leadership, accounting. |
| ECR-FIN-10 | Fatourati tracking | Exposed receivables (reference, status), confirmations received, the day's reconciliation with discrepancies to process, duplicate rejections logged; the service's connectivity status (INT-FAT). States: up to date, discrepancies pending, service unavailable (queued and resumed). Actors: accounting, school leadership. |
| ECR-FIN-11 | Invoices and credit notes | Issuance (a scope choice: installment, group, ad hoc fee), a numbered list per fiscal year, viewing an invoice (notices, lines, VAT), creating a linked credit note, CSV/Excel/UBL export. States: draft (unnumbered), confirmed (numbered, not editable), credit note. Actors: accounting. |
| ECR-FIN-12 | Parent financial status | A per-child view (payment schedule, next installment, balance, downloadable receipts, discounts applied) and an aggregated multi-child, multi-school view; an upcoming-due-date alert; a "pay" button (Fatourati in V1, card in V2). On mobile: cards per child. States: up to date, due date near, unpaid (with no document-threat wording of any kind). Actors: financial guardian, payers, adult student per RG-02. |

---

## 8. Integrations

Refers to the catalog: `prd/cross-cutting/35-external-integrations.md` (no duplication).

| Integration | Use in this module | Version |
|---|---|---|
| INT-FAT (Fatourati/CMI) | Exposing receivables, confirmation, daily anti-duplicate reconciliation, QR code (FR-FIN-15); contract and tariffs to be obtained (H-19) | V1 |
| INT-CAR (card/NAPS/Chari) | Tokenized recurring card, mandates, failures (FR-FIN-16) | V2 |
| INT-SMS | Reminders and receipts by SMS through a Moroccan aggregator (fallback) | MVP |
| INT-WAP (WhatsApp) | WhatsApp utility reminders with opt-in (DEC-36) | V1 |
| INT-EML | Optional sending of receipts and invoices | Should |
| INT-SIG (electronic signature) | The parents' contract signed at the advanced level with a timestamp (DEC-30); in MVP, simple logged acceptance via a one-time code (FR-FIN-02) | V1 (MVP: simple acceptance) |

Channel costs: reminder sends are traced with a cost (`DeliveryLog`) and billed to the school's consumables (DEC-28); the WhatsApp tariff switch of 01/10/2026 is a parameter on the COM-module side (correction No. 6, H-20).

---

## 9. Module-specific non-functional requirements

Refers to the `NFR-<DOM>` domains carried by `prd/cross-cutting/32-non-functional-requirements.md` (numbering there):

| Domain | Finance-specific requirement |
|---|---|
| NFR-PERF | A responsive collection counter on older PCs (BES-SEC-08); absorbing month-start and school-start peaks (PC-07, the journey map's §4); bulk reminder generation with no front-desk blocking |
| NFR-DISP | Target availability of 99.5% excluding maintenance; month-end closings and Fatourati reconciliations are critical operations; no maintenance window during collection peaks |
| NFR-OFF | No offline numbering: confirming an invoice or a receipt requires a server-side connection (sequence integrity); graceful front-desk degradation with resumption and no double submission |
| NFR-I18N | Bilingual FR/AR invoices, receipts, contracts and reminders, full RTL, localized amounts and dates; Arabic glossary terms (receipt, unpaid) |
| NFR-DOC | 10-year archiving of financial documents, closing exports, an identical marked reissue (DEC-22) |
| NFR-RES | Backups and replication in Morocco; numbering sequences and cash sessions must be reconstructable after an incident with no gap or duplicate |
| Security | Finance is sensitive data: every write and view is logged with author, context and timestamp in an immutable, exportable log from V1 on (RG-38, INV-33; in MVP, minimal write history, corrections traced at the record level — arbitration D4, OQ-09); fine-grained permissions per role and scope (RG-37; `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`); encryption in transit and at rest (`prd/03-domain-data-model.md` §6) |

---

## 10. Success metrics

To be numbered in `prd/cross-cutting/38-kpi-success-metrics.md` (a KPI namespace not allocated here); measurement basis tracked by the module:

- Collection rate at D+30 and D+60 after the due date (BES-DIR-02 oversight, PC-07 journey).
- Unpaid amount as a percentage of billed amounts; the aged balance's change by band.
- Share of payments collected via Fatourati (a target of shifting from cash to the online rail, PC-08).
- Average collection lag after the due date; share of installments settled with no reminder.
- Bounced-cheque rate and average regularization lag (FR-FIN-12).
- Cash discrepancies: frequency and average amount (FR-FIN-11).
- Average cost of a reminder by channel and the reminder-to-payment conversion rate (DEC-28, DEC-36, H-20).
- Share of students with an active, up-to-date payment schedule by October (a measure of start-of-year configuration quality).

---

## 11. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Version at which the parents' contract under Law 59.21 activates. | **Resolved — ARB-01, ARB-20h**: generation, simple logged acceptance (or a scanned paper signature) and archiving from the MVP (wave 1), with countersignature by a distinct financial guardian; an advanced electronic signature in V1 (DEC-30). Same position in FR-INS-16 and CNF-11. |
| OQ-02 | Internal baseline divergence on the version of online payment. | §7.7 and §12 (V2) say "a later version"; DEC-31 sets "Fatourati as the primary rail from V1 on". This chapter adopts V1, in step with PC-08 of `prd/journeys/00-journey-map.md`. Related divergence: the BES-PAR-07 tag in `prd/02-actors-personas.md` (online payment) carried V2 — corrected to V1 in the same review pass to align with DEC-31. The three sources (baseline §7.7/§12, the BES-PAR-07 tag, this chapter) are to be realigned together at the baseline's next revision. |
| OQ-03 | RC and patente notices on invoices. | §7.7 lists them among compliant invoicing notices; Article 145 of the CGI (research 02 §7) only requires identity, IF, ICE, address, continuous numbering, payment method and VAT. Adopted treatment: ICE/IF mandatory, RC/patente informational and configurable. Recorded for a baseline update. |
| OQ-04 | Baseline/research divergence No. 7: YouCan Pay. | §2.8 cites YouCan Pay among providers publishing their rates; the business ceased operating in January 2024 (research 03 §2). Card rails adopted: NAPS e-Premium, Chari Pay, a bank payment-institution acquirer. Recorded for a baseline update. |
| OQ-05 | Scope of the sibling discount. | **Resolved**: siblings at the same school by default (MVP, FR-FIN-04); extension to a multi-school group as an organization-level option (V1). |
| OQ-06 | Proration rule for mid-year fees. | **Resolved — ARB-20c**: the month already begun is due in full by default, daily proration is an option per fee type; annual fees follow their own refund rule; applied to arrivals, departures and transfers (FR-FIN-03). |
| OQ-07 | Additional financial events. | `ChequeBounced`, `CashSessionClosed`, `InvoiceIssued`, `AccountSettled` are needed for notifications and dashboards; the canonical catalog is carried by `prd/03-domain-data-model.md` §7. Harmonization needed on review before final numbering. |
| OQ-08 | Founder arbitration (D1) — WhatsApp and notification channels. | In MVP, notifications are limited to in-app and SMS; WhatsApp utility is reserved for attendance notifications with minimal templates. MVP reminders therefore use neither WhatsApp nor push: WhatsApp utility, push and general rollout (all message types, managed templates) arrive in V1 (DEC-12, DEC-36; COM module, `prd/modules/17-communication-notifications.md`). Applied in §1.1, FR-FIN-17 and FR-FIN-18. |
| OQ-09 | Founder arbitration (D4) — logging. | In MVP, minimal history of financial writes (corrections traced at the record level); the immutable, exportable AuditLog (RG-38, INV-33) arrives in V1 (§12). The "Security" row of §9 rephrased accordingly; aligned with the reporting module (FR-RAP-10/13). |

---

## 12. Traceability

| Baseline ID | Covered in this file |
|---|---|
| §2.4 (10-month year) | FR-FIN-03 |
| §2.8 | FR-FIN-01, FR-FIN-03, FR-FIN-04, FR-FIN-05, FR-FIN-10 to FR-FIN-16, FR-FIN-22, FR-FIN-27, FR-FIN-29, FR-FIN-30; §5.3 |
| §7.7 | Every FR-FIN; §1, §6 |
| §12 (MVP/V1/V2) | Version column of every FR; OQ-01, OQ-02 |
| RG-12 | FR-FIN-20, FR-FIN-23, FR-FIN-24 |
| RG-13 | FR-FIN-02, FR-FIN-22 |
| RG-14 | FR-FIN-22 |
| RG-25 | FR-FIN-01 (fee-schedule cloning) |
| RG-37, RG-39 | FR-FIN-11, FR-FIN-20; §7 (scopes), §9 |
| RG-38 | FR-FIN-01 (forced-sale safeguard justification), FR-FIN-05, FR-FIN-07, FR-FIN-11, FR-FIN-18, FR-FIN-25, FR-FIN-27, FR-FIN-28; §9 |
| RG-02 (DEC-20) | FR-FIN-23, FR-FIN-26 |
| DEC-10 | FR-FIN-06, FR-FIN-17, FR-FIN-18, FR-FIN-19; §7 |
| DEC-12, DEC-36 | FR-FIN-17, FR-FIN-18; §8 |
| DEC-22 | FR-FIN-06, FR-FIN-17, FR-FIN-25; §9 (NFR-DOC) |
| DEC-24, Q-06, G-16 | FR-FIN-18 (safeguard), FR-FIN-24, FR-FIN-28 |
| DEC-28 | FR-FIN-18; §8 (consumable costs) |
| DEC-30 | FR-FIN-02; §8 (INT-SIG) |
| DEC-31 | FR-FIN-14, FR-FIN-15, FR-FIN-16; OQ-02 |
| G-15 | FR-FIN-01, FR-FIN-03, FR-FIN-04, FR-FIN-10 |
| C-10 | FR-FIN-23, FR-FIN-24 |
| H-07 | FR-FIN-08 |
| H-08, H-17 | FR-FIN-09 |
| H-09 | FR-FIN-10, FR-FIN-15 |
| H-19 | FR-FIN-15, FR-FIN-16; §8 |
| H-20 | FR-FIN-18; §8; §10 |

| PRD references | Covered in this file |
|---|---|
| INV-08 (`prd/03`) | FR-FIN-23 |
| INV-33 (`prd/03`) | FR-FIN-28; §9 |
| INV-39 (`prd/03`) | FR-FIN-28 |
| INV-40 (`prd/03`) | FR-FIN-02, FR-FIN-06, FR-FIN-07 (receipts from the MVP, invoices in V1), FR-FIN-17, FR-FIN-29 |
| `PaymentReceived`, `InstallmentOverdue`, `ReminderSent` events (`prd/03` §7) | FR-FIN-10, FR-FIN-18; §6 |
| FR-TRA-10 (`prd/modules/18-transfers-mobility.md`) | FR-FIN-24 (cross-reference: carry-forward of unpaid balances on departure, the receivable kept at the school of origin; FR-TRA-10 realigned with FR-FIN-24) |
| BES-DIR-02 (`prd/02`) | FR-FIN-20, FR-FIN-21; §10 |
| BES-SEC-02, BES-SEC-04, BES-SEC-05 (`prd/02`) | FR-FIN-10, FR-FIN-11, FR-FIN-17, FR-FIN-18, FR-FIN-20, FR-FIN-28 |
| BES-PAR-03, BES-PAR-04 (`prd/02`) | FR-FIN-26 |
| BES-PAR-07 (`prd/02`) | FR-FIN-15, FR-FIN-16, FR-FIN-26 |
| BES-GAR-07 (`prd/02`) | FR-FIN-22 |
| BES-ELE-07 (`prd/02`) | FR-FIN-23, FR-FIN-26 |
| PC-01, PC-02, PC-07, PC-08, PC-09, PC-10 (`prd/journeys/00`) | §3 |
| Baseline corrections No. 1, No. 2, No. 6, No. 7, No. 8, No. 15 (`prd/research/00-baseline-corrections.md`) | §5.4, FR-FIN-02, §8, FR-FIN-16, FR-FIN-15, FR-FIN-08, FR-FIN-09 |
| research 01 §5 | FR-FIN-24 |
| research 02 §1, §7 | FR-FIN-02; FR-FIN-06, FR-FIN-08, FR-FIN-09; §5.1, §5.2 |
| research 03 §1-§5 | FR-FIN-12, FR-FIN-14, FR-FIN-15, FR-FIN-16, FR-FIN-18; §5.3 |
| INV-18 (`prd/03`) | FR-FIN-22 (third-party payer attached through a relationship) |
| ARB-01 (`prd/cross-cutting/42`) | FR-FIN-02, FR-FIN-04, FR-FIN-07, FR-FIN-12, FR-FIN-24 (MVP retags); §1.1 |
| ARB-02 (`prd/cross-cutting/42`) | FR-FIN-02 (contract at import), FR-FIN-12 (imported cheques) |
| ARB-14 (`prd/cross-cutting/42`) | FR-FIN-22; §2, §6 |
| ARB-20 a/b/c/e/h/i (`prd/cross-cutting/42`) | FR-FIN-30, FR-FIN-29, FR-FIN-03, FR-FIN-24, FR-FIN-02, FR-FIN-18 |
| ARB-21 d/e (`prd/cross-cutting/42`) | FR-FIN-18 (STOP scope, sending windows) |
| ARB-25j (`prd/cross-cutting/42`) | §9 (MVP logging); OQ-09 |
