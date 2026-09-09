> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-07                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification                                      |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/16-finance-billing-collections.md` (v0.3), old `FR-FIN-01..30` -> `BEH-ZS-151..180`, old `ECR-FIN-01..12` -> `SCR-ZS-081..092`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Finance, Billing and Collections (FIN)

## 1. Objective and scope

The FIN module gives the school full control of the financial cycle of schooling: pricing (fee schedules by year, level, section and track, with ancillary fees), payment schedules per enrollment, invoicing compliant with Moroccan tax law, payment collection through every method with receipts, graduated reminders, tracking of unpaid balances and accounting exports. It carries the financial relationship between the school and guardians: a financial guardian distinct from the legal guardian, multi-payer splits, payment by a third party, and the balance surviving the enrollment's closing ([INV-ZS-062](../invariants.md#inv-zs-062)). Lastly, it upholds ZSchool's founding collections principle: **documents are never blocked for unpaid balances** ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)).

Structuring payment principle: **ZSchool never holds funds**. Each school collects into its own account; ZSchool is a technical provider, never a fund holder ([ADR-ZS-031](../decisions/031-online-payment-rails.md)).

**Scope included:**

| Scope | Version |
|---|---|
| Fee schedules by school year, level, section, track; ancillary fees | MVP |
| Parents' contract under Law 59.21 (generation, logged acceptance, archiving, tariffs fixed for the year; countersignature of a distinct financial guardian) | MVP wave 1; advanced electronic signature in V1 ([ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)) |
| Monthly (10-month), quarterly and annual payment schedules per enrollment; proration rule for arrivals and departures | MVP |
| Automatic sibling discount | MVP wave 1 |
| Negotiated discounts and internal scholarships with approval | V1 |
| Compliant invoices (statutory notices, ICE/IF, VAT classification by fee nature) | V1 |
| Tamper-proof sequential numbering | MVP (receipts, void receipts); V1 (invoices, credit notes) |
| Payment collection: cash with a receipt (MVP), cash session (V1), cheques with a full lifecycle (MVP), bank transfer (MVP), Fatourati (V1), semi-manual direct debit (V2), tokenized recurring card (V2) | See requirements |
| Family payment split across several children with a single receipt; voiding a payment or receipt through a traced reversing entry | MVP |
| Printable, sent, numbered receipts; self-service financial status for the parent | MVP |
| Automatic graduated reminders (in-app and SMS in MVP; WhatsApp utility, push and printable mail in V1) and bilingual templates | MVP (reminders), V1 (custom templates) |
| Unpaid-balances table (MVP), aged balance (V1) | MVP / V1 |
| Distinct financial guardian, multi-payer splits, third-party payer | MVP |
| Balance surviving enrollment closing; account statement on departure to the financial guardian only; optional carry-forward of unpaid balances (V2+ for inter-site transfer within a group) | MVP (survival, statement); V1 (optional carry-forward) |
| Accounting exports (cash journal, simplified general ledger) | V1 |
| Traced refunds | V1 |
| Preparation of electronic invoicing (UBL export) | V1 (preparation); compliant activation V2+ |

**Out of scope:** generation of official documents themselves (`spec/behaviors/06-documents-certificates.md` — FIN only exposes the arrears alert and account statement); operational management of ancillary services (`spec/behaviors/13-ancillary-services.md`, V2+); ZSchool's own SaaS billing to schools (`spec/cross-cutting/04-business-model-packaging.md`); the school's general accounting and payroll; holding or carrying parents' funds ([ADR-ZS-031](../decisions/031-online-payment-rails.md)); judicial collection procedure (off-platform — the "litigation" status closes the amicable process and prepares the file).

## 2. Users and use cases

| User | Main use cases | Needs cited |
|---|---|---|
| School leadership / accounting | Set fee schedules, approve discounts and scholarships, oversee unpaid balances and the aged balance, approve sensitive reminders, export for the accountant, reconcile Fatourati | [URS-ZS-002](../urs.md) |
| Front desk / cashier | Collect payment at the counter (cash, cheque, transfer), hand over a receipt, open and close the cash session, track the cheque portfolio, see the arrears alert without blocking a document | [URS-ZS-012](../urs.md), [URS-ZS-013](../urs.md), [URS-ZS-014](../urs.md) |
| Financial-guardian parent | View each child's payment schedule and balance, pay (front desk, transfer, Fatourati, card in V2), receive receipts and reminders, receive their share under a multi-payer split | [URS-ZS-036](../urs.md), [URS-ZS-040](../urs.md), [URS-ZS-050](../urs.md) |
| Third-party payer (grandparent, employer) | Pay all or part of a student's fees with no parental relationship: a "third-party payer" relationship type carrying only the "financial guardian" status ([ADR-ZS-055](../decisions/055-third-party-payer-relationship.md)), a receipt in their name, no access to school data | [INV-ZS-064](../invariants.md#inv-zs-064) |
| Adult student | Financial status viewable per their rights; financial access stays with the financial guardian as long as they owe money ([INV-ZS-052](../invariants.md#inv-zs-052), [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)) | [URS-ZS-057](../urs.md) |
| External accountant | Receives the cash journal, simplified general ledger, aged balance (an export recipient, with no account) | — |

Operational realities addressed: significant payment delays, reminders that are currently manual, bounced cheques, case-by-case negotiated discounts, internal scholarships, payment by a third party, a frequent difference between the legal parent and the paying parent.

## 3. Key journeys

References to `spec/journeys/00-journey-map.md` (with no duplication):

| Journey | Role of the FIN module |
|---|---|
| JMP-ZS-001 (admission and enrollment) | Registration fee and reservation deposit collected at the PRE-ENROLLED → ACTIVE transition; first billing and payment schedule |
| JMP-ZS-002 (re-enrollment and rollover) | Re-enrollment fee with a spring deposit; N+1 payment schedules generated at rollover; sibling discount recomputed |
| JMP-ZS-007 (payment collection and reminders for unpaid balances) | The module's primary journey: collection through every method, receipts, graduated reminders, unpaid-balances table, aged balance |
| JMP-ZS-008 (Fatourati online payment) | Exposing receivables, confirmation and daily reconciliation (INT-FAT) |
| JMP-ZS-009 (transfer and exit file) | Balance after departure, settlement, account statement, optional carry-forward of unpaid balances |
| JMP-ZS-010 (self-service certificate) | Arrears alert shown on the file, with no blocking whatsoever; account statement attached to the exit file |

## 4. Functional behaviors

| ID | Title | Priority |
|---|---|---|
| BEH-ZS-151 | Manage fee schedules by year, level, section and track | Must |
| BEH-ZS-152 | Generate and archive the parents' contract under Law 59.21 with fixed tariffs | Must |
| BEH-ZS-153 | Generate the payment schedule per enrollment | Must |
| BEH-ZS-154 | Apply the sibling discount automatically | Must |
| BEH-ZS-155 | Process negotiated discounts and internal scholarships with approval | Must |
| BEH-ZS-156 | Issue invoices compliant with mandatory notices | Must |
| BEH-ZS-157 | Guarantee continuous, tamper-proof sequential numbering | Must |
| BEH-ZS-158 | Classify each fee for tax purposes | Must |
| BEH-ZS-159 | Prepare electronic invoicing (UBL export) | Should |
| BEH-ZS-160 | Record a multi-method payment collection with allocation to installments | Must |
| BEH-ZS-161 | Manage cash sessions (discrepancy, closing) | Must |
| BEH-ZS-162 | Track the full lifecycle of cheques | Must |
| BEH-ZS-163 | Collect by bank transfer with assisted reconciliation | Must |
| BEH-ZS-164 | Manage semi-manual direct debit on mandates | Should |
| BEH-ZS-165 | Expose and reconcile Fatourati online payment | Must |
| BEH-ZS-166 | Collect by card with a stored card (recurring) | Should |
| BEH-ZS-167 | Issue printable, sent, numbered receipts | Must |
| BEH-ZS-168 | Trigger automatic graduated reminders | Must |
| BEH-ZS-169 | Manage reminder and letter templates | Should |
| BEH-ZS-170 | View the unpaid-balances table by class and by guardian | Must |
| BEH-ZS-171 | Produce the aged balance | Must |
| BEH-ZS-172 | Distinguish the financial guardian, multi-payer splits and the third-party payer | Must |
| BEH-ZS-173 | Keep the balance and access alive after the enrollment closes | Must |
| BEH-ZS-174 | Hand over an account statement on departure and optionally carry forward unpaid balances | Must |
| BEH-ZS-175 | Export the cash journal and the simplified general ledger | Must |
| BEH-ZS-176 | Expose financial status to the parent in self-service | Must |
| BEH-ZS-177 | Process refunds with approval | Should |
| BEH-ZS-178 | Never block official documents for unpaid balances | Must |
| BEH-ZS-179 | Void a payment or a receipt through a traced reversing entry | Must |
| BEH-ZS-180 | Collect a family payment split across several accounts with a single receipt | Must |

### BEH-ZS-151: Manage fee schedules by year, level, section and track

> **Invariant:** [INV-ZS-077](../invariants.md#inv-zs-077) (fee-schedule cloning)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-133`](../../features/fin/fr-fin-01-fee-schedules.feature)

REQUIREMENT: For each school year, the school MUST be able to define fee schedules
             applicable by level, section, and track, made of typed fee lines
             (registration, re-enrollment, tuition, insurance, transport, canteen,
             activities, supplies, uniform), each carrying a bilingual FR/AR label,
             frequency, amount in MAD, mandatory-or-optional status, a refund rule, and
             a VAT classification. Marking a books/supplies/uniform line as "mandatory"
             MUST trigger a legal alert (Law 59.21 forced-sale prohibition) and require
             a traced justification. A fee schedule MUST be clonable from one year to
             the next, copying fees only, never enrollments. A validated fee schedule
             MUST be exportable as the fee-disclosure document required by Article 49
             of Law 59.21.

Transport and canteen fees appear in the fee schedule from the MVP; their operational management stays with `spec/behaviors/13-ancillary-services.md` in V2+.

### BEH-ZS-152: Generate and archive the parents' contract under Law 59.21 with fixed tariffs

> **Invariant:** [INV-ZS-017](../invariants.md#inv-zs-017)
> **See:** [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** MVP wave 1 (simple logged acceptance); V1 (advanced electronic signature)
> **Acceptance:** [`@REQ-ZS-134`](../../features/fin/fr-fin-02-parents-contract.feature)

REQUIREMENT: When an enrollment is activated (PRE-ENROLLED → ACTIVE), the system MUST
             generate the annual written school-parents contract required by Law
             59.21, bilingual FR/AR, signed by the legal tutor and, where distinct,
             countersigned by the financial guardian so the payment schedule is
             enforceable against them. In MVP, acceptance MUST be simple and logged
             electronically (a one-time code, timestamped, with the document's
             fingerprint) or a scanned paper signature; an advanced-level signature
             with a timestamp and a verification QR code arrives in V1. A mid-year
             tariff change on an active enrollment MUST be technically impossible: it
             only applies to new enrollments or the following year.

Scope of ownership: `spec/behaviors/02-admissions-enrollment-reenrollment.md` (BEH-ZS-036) owns the enrollment flow (generation and signature at the front desk); this behavior owns the contract's financial components (applicable fee schedule, payment schedule, tariff fixing); `spec/cross-cutting/07-legal-compliance-data-protection.md` (CNF-ZS-005) owns the compliance requirement and the regulatory template — the three reference one another without duplicating content. For an enrollment activated through a mid-year import, the contract is generated at import time and acceptance is gathered once the account is claimed, with a reminder sent.

### BEH-ZS-153: Generate the payment schedule per enrollment

> **Invariant:** none
> **See:** [ADR-ZS-035](../decisions/035-pilot-school-profiles.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-135`](../../features/fin/fr-fin-03-payment-schedule.feature)

REQUIREMENT: For each enrollment, a payment schedule MUST be generated from the
             applicable fee schedule at the school's choice (monthly over 10 months,
             quarterly, or annual with an optional cash discount), integrating
             one-time and recurring fees plus any re-enrollment deposit. Manual
             adjustment MUST be possible with author and reason traced. For an
             arrival, departure, or transfer during the year, the month already begun
             is due in full by default (daily proration is a school option); annual
             fees follow their own refund rule. A mid-year change of class,
             arrangement, or options MUST recompute unsettled installments only,
             never touching settled ones (append-only entries).

Installment statuses: due, partially paid, paid, overdue. Installments feed the unpaid-balances table (BEH-ZS-170), the aged balance (BEH-ZS-171), and the reminder engine (BEH-ZS-168).

### BEH-ZS-154: Apply the sibling discount automatically

> **Invariant:** [INV-ZS-063](../invariants.md#inv-zs-063)
> **See:** [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)
> **Priority:** Must
> **Version:** MVP wave 1
> **Acceptance:** [`@REQ-ZS-136`](../../features/fin/fr-fin-04-sibling-discount.feature)

REQUIREMENT: An automatic discount, configurable by the school (percentage or flat
             amount, possibly graduated by sibling rank), MUST apply to tuition
             and/or designated fees as soon as at least two students of the same
             sibling group are active enrollments at the same school in the same
             year. It MUST be computed automatically when the fee schedule is
             assigned and recomputed whenever a sibling is added or removed, and MUST
             appear on the payment schedule and invoices as a distinct, referenced
             line.

Scope is intra-school by default; extending it to a multi-school group is an organization-level option (V1).

### BEH-ZS-155: Process negotiated discounts and internal scholarships with approval

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: Entry of a negotiated discount or an internal scholarship on an
             enrollment MUST go through a mandatory approval workflow by an
             authorized role before any accounting effect, with a configurable
             dual-validation threshold and a full logged history (requester,
             approver, reason, dates). A discount granted mid-year MUST NOT have
             retroactive effect on already-settled installments.

### BEH-ZS-156: Issue invoices compliant with mandatory notices

> **Invariant:** [INV-ZS-074](../invariants.md#inv-zs-074), [INV-ZS-017](../invariants.md#inv-zs-017)
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), [ADR-ZS-003](../decisions/003-default-retention-durations.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: Invoices MUST comply with CGI Article 145: issuer identity and address,
             tax identifier (IF), common enterprise identifier (ICE), the client's
             ICE where subject to VAT, continuous chronological numbering, date, a
             breakdown by fee nature with VAT classification, payment method, and
             pre-tax/tax-inclusive totals. Invoices MUST be bilingual FR/AR, rendered
             as PDF, archived for 10 years, and linked to the enrollment and
             financial account.

Trade-register (RC) and business-license (patente) notices are shown for information only, configurably, since Article 145 does not require them.

### BEH-ZS-157: Guarantee continuous, tamper-proof sequential numbering

> **Invariant:** [INV-ZS-017](../invariants.md#inv-zs-017), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)
> **Priority:** Must
> **Version:** MVP (receipts and void receipts); V1 (invoices and credit notes)
> **Acceptance:** [`@REQ-ZS-137`](../../features/fin/fr-fin-07-tamper-proof-numbering.feature)

REQUIREMENT: Invoice and receipt numbers MUST be assigned by a continuous sequence
             per school, with no gaps and no reuse, server-side only at final
             confirmation — never a numbered draft, never offline numbering, never a
             deletion of a numbered document. An error MUST be corrected only by a
             linked, numbered credit note. Any attempt to edit or reassign a number
             MUST be blocked and logged.

### BEH-ZS-158: Classify each fee for tax purposes

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: Each fee nature MUST carry a tax classification driving invoice
             notices: tuition out of the scope of VAT; catering, transport, and
             school leisure activities provided by the school itself to its own
             students exempt with no right of deduction (CGI Art. 91-V-4°); school
             supplies exempt (Art. 91-E-4°); re-billed third-party services taxable
             (transport and catering at 10%). Rates MUST be configurable with a
             history. The safe default classification MUST be out of scope or
             exempt; making a line taxable MUST require an explicit school action.

### BEH-ZS-159: Prepare electronic invoicing (UBL export)

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1 (preparatory export); compliant activation V2+
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: The billing model MUST keep, for every invoice, the structured data
             required for a UBL export (issuer/client identifiers, lines, amounts,
             classifications, contract references), and a UBL export of a period's
             invoices MUST be available. Operational compliance (clearance,
             qualified signature) is a milestone triggered by the DGI's implementing
             decree, not yet published, with no redesign of the model expected.

### BEH-ZS-160: Record a multi-method payment collection with allocation to installments

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-138`](../../features/fin/fr-fin-10-payment-collection.feature)

REQUIREMENT: Recording a payment against one or more installments, an invoice, or
             the guardian's account MUST support cash, cheque, and bank transfer in
             MVP (Fatourati in V1; direct debit and card in V2), each carrying
             method, amount, value date, reference, and collector. Allocation
             against installments MUST follow the configured order (default: oldest
             first); any surplus MUST become a credit carried on the guardian's
             account. Every payment MUST trigger the `PaymentReceived` event. A
             partial payment MUST leave the installment "partially paid".

A payment covering several children of the same payer is split per BEH-ZS-180; an erroneous payment is voided per BEH-ZS-179, never deleted.

### BEH-ZS-161: Manage cash sessions (discrepancy, closing)

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-089](../invariants.md#inv-zs-089)
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-139`](../../features/fin/fr-fin-11-cash-session.feature)

REQUIREMENT: Opening a cash session in the collector's name (per collector and per
             site) with an opening float MUST attach every cash payment to it.
             Closing with a declared count MUST compute the discrepancy between
             theoretical collections and cash counted, require a free-text
             justification for any discrepancy, lock the session, and produce an
             exportable cash journal for the day. A forced closing MUST be possible
             with a logged reason. In MVP (no session), cash collection stays
             possible and is logged; the session becomes mandatory for cash from V1
             on.

### BEH-ZS-162: Track the full lifecycle of cheques

> **Invariant:** none
> **See:** [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md), [ADR-ZS-043](../decisions/043-mid-year-data-reprise.md)
> **Priority:** Must
> **Version:** MVP wave 1
> **Acceptance:** [`@REQ-ZS-140`](../../features/fin/fr-fin-12-cheque-lifecycle.feature)

REQUIREMENT: Every cheque MUST follow the cycle: handed over → deposited (individually
             or in a dated batch) → cleared or bounced (with reason, date,
             bounce-notice reference) → regularized or in litigation (a school-
             leadership decision that moves tracking off-platform). A cheque
             portfolio with deposit due dates and alerts MUST be maintained; a
             post-dated cheque MUST NOT mark covered installments paid before it
             actually clears. On a bounce, covered installments MUST revert to
             unpaid, the balance MUST re-include the arrears, and a dedicated
             reminder MUST be triggered. Cheques already in the portfolio at a
             mid-year data import are imported with their status.

The module automates no legal wording under Law 71-24; the switch to litigation is always a human decision.

### BEH-ZS-163: Collect by bank transfer with assisted reconciliation

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-141`](../../features/fin/fr-fin-13-bank-transfer.feature)

REQUIREMENT: Collection by bank transfer MUST support entry with the advice's
             reference, bank value date, and amount, reconciled against installments
             through assisted search. A structured bank statement MAY be imported to
             pre-match transfers, but human validation MUST remain mandatory. An
             unvalidated transfer MUST show as "pending confirmation" and MUST NOT
             affect the amount due.

### BEH-ZS-164: Manage semi-manual direct debit on mandates

> **Invariant:** none
> **See:** [ADR-ZS-031](../decisions/031-online-payment-rails.md)
> **Priority:** Should
> **Version:** V2
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: A direct-debit mandate signed by the financial guardian MUST be
             archived in the file; a debit schedule aligned with the installments
             MUST generate a debit file handed to the school's bank (no bank API is
             documented in Morocco for this flow); the return file MUST be importable
             to flag received and rejected debits, with a rejection making the
             installment due again with a reminder.

ZSchool has no direct access to the bank account and holds no funds.

### BEH-ZS-165: Expose and reconcile Fatourati online payment

> **Invariant:** none
> **See:** [ADR-ZS-031](../decisions/031-online-payment-rails.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-142`](../../features/fin/fr-fin-15-fatourati.feature)

REQUIREMENT: The system MUST connect to CMI's Fatourati rail with the school as
             creditor and beneficiary of the funds, ZSchool holding no funds and
             playing no regulatory role. It MUST expose receivables with a stable
             school reference per guardian and generate a reference/QR code per
             receivable; respond in real time to debt queries from payment channels;
             automatically record payment confirmations, matching them against the
             receivable; reconcile daily by file with duplicate rejection; and list
             discrepancies for accounting to process. Receivable references settled
             elsewhere MUST be deactivated immediately.

### BEH-ZS-166: Collect by card with a stored card (recurring)

> **Invariant:** none
> **See:** [ADR-ZS-031](../decisions/031-online-payment-rails.md)
> **Priority:** Should
> **Version:** V2
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: Payment by a stored card MUST hold the token at the school's acquirer
             (NAPS e-Premium, Chari Pay, or a payment-institution acquirer),
             excluding YouCan Pay (discontinued January 2024). A signed and archived
             debit mandate MUST precede execution on each installment; failures MUST
             trigger notification, reminder, and retry handling.

ZSchool is a technical provider and agent, never a fund holder; the acquirer contract is signed by the school. Integration reference: `spec/cross-cutting/06-external-integrations.md` (INT-CAR).

### BEH-ZS-167: Issue printable, sent, numbered receipts

> **Invariant:** [INV-ZS-017](../invariants.md#inv-zs-017)
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-003](../decisions/003-default-retention-durations.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-143`](../../features/fin/fr-fin-17-numbered-receipts.feature)

REQUIREMENT: Every payment MUST produce a numbered receipt (its own continuous,
             tamper-proof sequence from the MVP), bilingual FR/AR, immediately
             printable at the front desk, and automatically sent to the financial
             guardian (in-app or SMS in MVP; WhatsApp utility and push in V1; email
             if provided). Receipts MUST be archived for 10 years and reissuable
             unchanged (a marked reissue); an erroneous receipt MUST be voided by a
             void receipt (BEH-ZS-179), never edited.

The receipt details the issuer with its ICE, the student(s) and installments covered (a single receipt for a family payment, BEH-ZS-180), the payment method and amount, and the remaining balance.

### BEH-ZS-168: Trigger automatic graduated reminders

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [ADR-ZS-009](../decisions/009-single-plan-pricing.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md), [ADR-ZS-061](../decisions/061-finance-rules-batch.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-144`](../../features/fin/fr-fin-18-graduated-reminder.feature)

REQUIREMENT: A reminder engine (`Dunning`) MUST run per unpaid installment, with
             school-configurable tiers (count, offsets, increasing severity) and
             channels per tier (in-app and SMS in MVP; WhatsApp utility, push, and
             printable mail at the final tier in V1). Reminders MUST honor sending
             windows and the STOP opt-out. Automatic daily triggering MUST stop
             immediately once settled, with a full history per tier (channel, cost)
             kept in `DeliveryLog`. No reminder template MAY mention withholding
             official documents or exclusion for unpaid balances; only consequences
             on non-mandatory services may be mentioned.

Reminders target the financial guardian (and the relevant payer under a multi-payer split); an ad hoc manual reminder is possible from the unpaid-balances table.

### BEH-ZS-169: Manage reminder and letter templates

> **Invariant:** none
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: A library of FR and AR templates (upcoming-due-date reminder, overdue
             notice, bounced-cheque notice, amicable formal notice, end-of-amicable-
             process letter, settlement certificate) MUST support variables and a
             preview before sending, with customization reserved to school
             leadership and version history. Default templates MUST comply with the
             no-document-blocking principle and use a factual tone.

### BEH-ZS-170: View the unpaid-balances table by class and by guardian

> **Invariant:** [INV-ZS-062](../invariants.md#inv-zs-062), [INV-ZS-089](../invariants.md#inv-zs-089), [INV-ZS-091](../invariants.md#inv-zs-091)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-145`](../../features/fin/fr-fin-20-unpaid-balances-table.feature)

REQUIREMENT: The system MUST provide a consolidated view of unpaid balances by
             student/enrollment, class, level, financial guardian, and site, with
             filters, totals, and inline actions (collect, remind, view history).
             Closed-enrollment accounts not yet settled MUST appear with a "closed
             file" tag. Viewing scopes MUST follow permissions (the front desk sees
             its own scope, school leadership sees everything). Excel/CSV export
             MUST be available.

### BEH-ZS-171: Produce the aged balance

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: An aged balance by financial guardian and by student MUST break
             outstanding amounts down by age band since the due date (0-30, 31-60,
             61-90, over 90 days), per school and consolidated at the organization
             level for a group, highlighting at-risk receivables (bounced cheque,
             litigation, exhausted reminders) and exportable for collection action.

### BEH-ZS-172: Distinguish the financial guardian, multi-payer splits and the third-party payer

> **Invariant:** [INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065), [INV-ZS-032](../invariants.md#inv-zs-032)
> **See:** [ADR-ZS-055](../decisions/055-third-party-payer-relationship.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-146`](../../features/fin/fr-fin-22-financial-guardian-third-party-payer.feature)

REQUIREMENT: The enrollment's financial guardian (at least one per enrollment,
             possibly distinct from the legal guardian) MUST be designated,
             editable, and traced, and MAY be a third party with no parental
             relationship. Multi-payer splits (percentages or fixed amounts) MUST
             notify each payer of their share and issue separate receipts, with
             reminders routed to the relevant payer. The third-party payer MUST be
             modeled as a `ParentStudentRelationship` of type "third-party payer"
             carrying only the "financial guardian" status: access limited to the
             financial sphere, no access to school data. `FinancialAccount` MUST
             always be attached to a relationship.

### BEH-ZS-173: Keep the balance and access alive after the enrollment closes

> **Invariant:** [INV-ZS-062](../invariants.md#inv-zs-062), [INV-ZS-052](../invariants.md#inv-zs-052), [INV-ZS-018](../invariants.md#inv-zs-018)
> **See:** [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-147`](../../features/fin/fr-fin-23-balance-survives-closing.feature)

REQUIREMENT: When an enrollment closes (TRANSFERRED, WITHDRAWN, EXPELLED, COMPLETED),
             the financial account MUST stay active until settled: the school keeps
             full access (collection, reminders, statements, billing for arrears)
             with no need to recreate an enrollment; the parent keeps read access to
             their payment history and balance; for an adult student, financial
             access MUST stay with the financial guardian as long as they owe money.
             Settlement entries on a closed account MUST be recorded on the original
             account and logged.

### BEH-ZS-174: Hand over an account statement on departure and optionally carry forward unpaid balances

> **Invariant:** [INV-ZS-062](../invariants.md#inv-zs-062)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md)
> **Priority:** Must
> **Version:** MVP wave 1 (statement); V1 (optional carry-forward)
> **Acceptance:** [`@REQ-ZS-148`](../../features/fin/fr-fin-24-account-statement-departure.feature)

REQUIREMENT: When a student leaves, a detailed account statement (settled and
             remaining installments, payments, discounts, scholarships) MUST be
             generated and handed **to the financial guardian only**, together with
             the exit file, with no blocking whatsoever. The leaving certificate
             MUST stay neutral (no balance mentioned). An optional carry-forward of
             unpaid balances as a "collection receivable" on the financial
             guardian's account within the tenant of origin MAY be offered (V1); the
             balance is never automatically sent to the receiving school. Inter-site
             transfer within the same group with an actual carry-forward is a V2+
             option — in V1, the receivable stays with the school of origin.

Cross-reference: `spec/behaviors/09-transfers-mobility.md` (BEH-ZS-210) refers back to this behavior for the receivable-location rule.

### BEH-ZS-175: Export the cash journal and the simplified general ledger

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: Accounting exports MUST be configurable by period: cash journal (by
             day and session, with closing discrepancies), receipts journal by
             payment method, simplified general ledger by financial guardian and fee
             nature, list of invoices and credit notes, aged balance, in CSV and
             Excel formats compatible with common accounting software. Every export
             MUST be logged, carry official document numbering, and observe the
             10-year retention period.

### BEH-ZS-176: Expose financial status to the parent in self-service

> **Invariant:** none
> **See:** [ADR-ZS-031](../decisions/031-online-payment-rails.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-149`](../../features/fin/fr-fin-26-self-service-financial-status.feature)

REQUIREMENT: The parent portal MUST show, per child: the payment schedule with
             statuses, the next installment's amount, payment history with
             downloadable receipts, discounts and scholarships applied, and balance,
             plus a configurable upcoming-due-date alert and a "pay" button (Fatourati
             in V1, card in V2). A multi-school parent's view MUST aggregate every
             child's installments from a single screen. The interface MUST be FR/AR.

### BEH-ZS-177: Process refunds with approval

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: A refund of an overpayment or a refundable fee MUST record reason,
             amount, refund method (cash with a traced cash-session outflow, or bank
             transfer), and require school-leadership approval beyond a configurable
             threshold, producing a numbered refund document, an account update, and
             installment reclassification if needed. The operation MUST be logged
             end to end.

### BEH-ZS-178: Never block official documents for unpaid balances

> **Invariant:** [INV-ZS-016](../invariants.md#inv-zs-016), [INV-ZS-019](../invariants.md#inv-zs-019), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-150`](../../features/fin/fr-fin-28-no-document-blocking.feature)

REQUIREMENT: No state of the finance module MAY block the generation of the
             enrollment certificate, the leaving certificate, report cards, or
             transcripts (implementation carried by `spec/behaviors/06-documents-
             certificates.md`). When arrears exist, the student file MUST carry a
             visible, non-blocking alert (amount, overdue installments, last
             reminder), with the account statement one click away. The school MAY,
             at its sole discretion, condition only non-mandatory services
             (transport, canteen, activities, V2+) on payment — never official
             documents. Every view of financial status MUST be logged.

### BEH-ZS-179: Void a payment or a receipt through a traced reversing entry

> **Invariant:** [INV-ZS-017](../invariants.md#inv-zs-017), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-061](../decisions/061-finance-rules-batch.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-151`](../../features/fin/fr-fin-29-void-payment.feature)

REQUIREMENT: A confirmed payment MUST NOT ever be edited or deleted: it MUST be
             voided by a dated reversing entry carrying reason, author, and, beyond
             a configurable threshold or outside the entry day, an authorized role's
             approval. Voiding MUST generate a numbered void receipt in the same
             sequence, referencing the original receipt, which keeps its number with
             a "voided" status. Matched installments MUST revert to their previous
             state, the balance recomputed, and the financial guardian notified.

In V1, voiding an invoice goes through a credit note (BEH-ZS-157).

### BEH-ZS-180: Collect a family payment split across several accounts with a single receipt

> **Invariant:** [INV-ZS-063](../invariants.md#inv-zs-063)
> **See:** [ADR-ZS-061](../decisions/061-finance-rules-batch.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-152`](../../features/fin/fr-fin-30-family-payment.feature)

REQUIREMENT: At the front desk and for online methods, a payer settling
             installments of several children for whom they are financial guardian,
             at the same school, MUST be able to do so in a single operation: the
             amount split automatically (default: oldest first, then by child) or
             manually, recorded as a single `Payment` split across the relevant
             `FinancialAccount` records, with a single numbered receipt listing every
             child and installment covered.

The sibling discount (BEH-ZS-154) applies upstream, on the installments. A single cheque covering several children follows the same split (BEH-ZS-162).

## 5. Morocco-specific considerations

**Taxation and invoicing (CGI).** Tuition is out of the scope of VAT (DGI response No. 340). Internal services (catering, transport, school leisure) provided by the school to its own students are exempt with no right of deduction (Art. 91-V-4°). School supplies are exempt (Art. 91-E-4°). Re-billed third-party services (transport, catering) are taxable at 10%. Invoice notices per Article 145: identity, IF, ICE, address, continuous numbering, payment method, VAT where applicable — RC/patente are informational only (see OQ-ZS-103 in `spec/open-questions.md`). Retention: 10 years (CGI Art. 211). Electronic invoicing: the DGI platform is ready but the implementing decree is not yet published; UBL format, clearance, and qualified signature are announced; B2C is out of scope for now.

**Law 59.21.** Permanent disclosure of the fee list (Art. 49); prohibitions on mid-year increases, forced textbook purchase, and refusing re-enrollment to a student in good standing; a mandatory annual written contract; penalties up to 10,000 DH for refusing to deliver certificates while the contract is honored — the direct legal basis for BEH-ZS-178.

**Local payment methods.** Cash dominant, with cash sessions; post-dated cheques handed over at the start of the year; Fatourati as the primary online rail (the school as creditor); semi-manual direct debit with no bank API; a recurring card via NAPS, Chari Pay, or a bank payment-institution acquirer; no fund-carrying platform without a Bank Al-Maghrib payment-institution approval — ZSchool never holds any.

**Other.** Financial-transaction timestamps in Morocco's local time, permanent UTC+0 since 20/09/2026; bilingual FR/AR financial documents; a September-to-June school billing year (10 months); the movable religious-holiday calendar shifts collection windows.

## 6. Data and events

**Existing entities used** (`spec/domain-model.md`):

| Entity | Module-specific detail |
|---|---|
| `FeeSchedule`, `FeeItem` | Schedules by year/level/section/track; typed fee natures; VAT classification; refund rule; annual cloning |
| `Discount`, `Scholarship` | Automatic sibling discount; negotiated discounts and scholarships with approval and history |
| `Invoice` | ICE/IF notices; continuous, tamper-proof numbering; linked credit notes; UBL export |
| `Installment` | Due, partially paid, paid, overdue statuses; feeds unpaid balances, aged balance, and reminders |
| `Payment` | Methods: cash (session from V1), cheque (a six-state cycle), bank transfer, direct debit (V2), Fatourati (V1), recurring card (V2); split across several `FinancialAccount` records; voided through a reversing entry |
| `Receipt` | A tamper-proof sequence of its own from the MVP; bilingual; a marked reissue; a single family receipt; a void receipt referencing the original |
| `Refund` | Reason, approval beyond a threshold, a traced cash-session outflow |
| `Dunning` | Tiers, channels, dates, cost; stops once settled |
| `CashSession` | Opening, float, closing, discrepancy, justification, journal |
| `FinancialAccount` | Per enrollment and/or financial guardian, always attached to a relationship; survives closing; carried credits; collection receivable |

**Notifiable events** (catalog: `spec/domain-model.md` §7): `PaymentReceived` (receipt, balance update, reminders stop, logged), `InstallmentOverdue` (feeds unpaid-balances table and aged balance, arms first reminder tier), `ReminderSent` (notification, tier/channel/cost traceability). Additional events proposed by this chapter (`ChequeBounced`, `CashSessionClosed`, `InvoiceIssued`, `AccountSettled`) still need harmonization with the canonical catalog (see OQ-ZS-107 in `spec/open-questions.md`).

## 7. Screens

Text descriptions (no mockups); mobile-first; FR and AR with full RTL (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`).

- **SCR-ZS-081 — Collections dashboard.** Today's and the month's indicators (collected, unpaid, collection rate, the week's installments), a summary aged balance, reminders sent, recent cash discrepancies; site/class filters; direct access to files. States: empty, loading, filters active. Actors: school leadership, accounting.
- **SCR-ZS-082 — Fee schedules.** A list of years with fee schedules; editing by level/section/track with fee lines (nature, frequency, amount, mandatory, VAT, refund); a legal alert and traced justification required for a mandatory books/supplies/uniform line; a "clone from previous year" action; a preview of the display document (Article 49). States: draft, confirmed. Actors: school leadership.
- **SCR-ZS-083 — Enrollment payment schedule.** Dated installments with statuses, discounts applied, total settled/remaining; actions: adjust (traced reason), collect, remind; a change history. Actors: accounting, front desk.
- **SCR-ZS-084 — Collection counter.** Search by student or payer, pre-selected due installments, multi-child selection with automatic splitting and a single receipt, choice of method, amount, reference, change for cash; a single confirmation; a "void a payment" action with reason and approval. Optimized for an older PC and mobile: keyboard-friendly fields, few clicks, resuming after an outage with no double submission. Actors: front desk/cashier.
- **SCR-ZS-085 — Cash session.** Opening (cash float), session in progress (the day's collections, theoretical total), closing (declared count, computed discrepancy, mandatory justification, locking, exportable journal). States: open, closed (read-only), forced closing with a reason. Actors: front desk, school leadership.
- **SCR-ZS-086 — Cheque portfolio.** A list of cheques by status with deposit due dates and alerts; actions: batch deposit, record a clearance or bounce, regularize, switch to litigation (school-leadership confirmation); a full per-cheque history. Actors: front desk, accounting, school leadership.
- **SCR-ZS-087 — Discounts and scholarships.** A queue of requests with amounts and reasons; an approve/reject action (approver traced, dual validation beyond the threshold); a per-student history; the impact shown on the payment schedule before confirmation. Actors: accounting, school leadership.
- **SCR-ZS-088 — Unpaid balances and aged balance.** A table by class/guardian with an overdue-installments breakdown, a "closed file" tag; an aged balance by band; filters and export; collect/remind actions from the row. Actors: school leadership, accounting, front desk.
- **SCR-ZS-089 — Reminders.** Tier configuration (offsets, channels, templates); a library of bilingual templates with variables and a preview; a send history; an ad hoc manual reminder; a visible safeguard against document-blocking wording in the editor. Actors: school leadership, accounting.
- **SCR-ZS-090 — Fatourati tracking.** Exposed receivables, confirmations received, the day's reconciliation with discrepancies to process, duplicate rejections logged; the service's connectivity status. States: up to date, discrepancies pending, service unavailable. Actors: accounting, school leadership.
- **SCR-ZS-091 — Invoices and credit notes.** Issuance (installment, group, or ad hoc scope), a numbered list per fiscal year, viewing an invoice, creating a linked credit note, CSV/Excel/UBL export. States: draft (unnumbered), confirmed (numbered), credit note. Actors: accounting.
- **SCR-ZS-092 — Parent financial status.** A per-child view and an aggregated multi-child, multi-school view; an upcoming-due-date alert; a "pay" button. States: up to date, due date near, unpaid (with no document-threat wording of any kind). Actors: financial guardian, payers, adult student.

## 8. Integrations

| Integration | Use in this module | Version |
|---|---|---|
| INT-FAT (Fatourati/CMI) | Exposing receivables, confirmation, daily anti-duplicate reconciliation, QR code (BEH-ZS-165) | V1 |
| INT-CAR (card/NAPS/Chari) | Tokenized recurring card, mandates, failures (BEH-ZS-166) | V2 |
| INT-SMS | Reminders and receipts by SMS through a Moroccan aggregator (fallback) | MVP |
| INT-WAP (WhatsApp) | WhatsApp utility reminders with opt-in | V1 |
| INT-EML | Optional sending of receipts and invoices | Should |
| INT-SIG (electronic signature) | The parents' contract signed at the advanced level with a timestamp; in MVP, simple logged acceptance via a one-time code (BEH-ZS-152) | V1 (MVP: simple acceptance) |

Channel costs: reminder sends are traced with a cost (`DeliveryLog`) and billed to the school's consumables; the WhatsApp tariff switch of 10/01/2026 is a parameter on the communication-module side.

## 9. Module-specific non-functional requirements

Reference to NFR domains carried by `spec/cross-cutting/03-non-functional-requirements.md`; no NFR requirement is numbered here.

- **Performance (NFR-PERF):** a responsive collection counter on older PCs; absorbing month-start and school-start peaks; bulk reminder generation with no front-desk blocking.
- **Availability (NFR-DISP):** target 99.5% excluding maintenance; month-end closings and Fatourati reconciliations are critical operations; no maintenance window during collection peaks.
- **Offline (NFR-OFF):** no offline numbering — confirming an invoice or receipt requires a server-side connection for sequence integrity; graceful front-desk degradation with resumption and no double submission.
- **Bilingual/RTL (NFR-I18N):** bilingual FR/AR invoices, receipts, contracts, and reminders, full RTL, localized amounts and dates.
- **Retention (NFR-DOC):** 10-year archiving of financial documents and closing exports, an identical marked reissue.
- **Resilience (NFR-RES):** backups and replication in Morocco; numbering sequences and cash sessions must be reconstructable after an incident with no gap or duplicate.
- **Security:** finance is sensitive data — every write and view is logged with author, context, and timestamp in an immutable, exportable log from V1 on (in MVP, minimal write history with record-level traced corrections); fine-grained permissions per role and scope; encryption in transit and at rest.

## 10. Success metrics

`KPI-ZS-NNN` identifiers are carried by `spec/metrics.md`; measurement basis tracked by this module: collection rate at D+30 and D+60; unpaid amount as a percentage of billed amounts and the aged balance's change by band; share of payments collected via Fatourati; average collection lag after the due date; bounced-cheque rate and average regularization lag; cash discrepancies (frequency and average amount); average cost of a reminder by channel and the reminder-to-payment conversion rate; share of students with an active, up-to-date payment schedule by October.

## 11. Open questions

Open questions for this module (OQ-ZS-101 through OQ-ZS-109 in the migrated source, covering the parents'-contract activation version, the Fatourati version divergence, RC/patente invoice notices, the YouCan Pay correction, sibling-discount scope, the mid-year proration rule, additional financial events needing catalog harmonization, and the two founder arbitrations on WhatsApp/notification channels and MVP logging) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
