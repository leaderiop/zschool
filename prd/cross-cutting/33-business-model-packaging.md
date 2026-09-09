# ZSchool PRD — Business Model and Packaging

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review (arbitrations `prd/cross-cutting/42-review-arbitrations.md`) |
| Source | PROJECT.md §2.1, §2.8, §3.3, §10, §11, §12, §14 (DEC-13, DEC-27, DEC-28, DEC-35), §15 (Q-09, Q-10), §16 (H-01, H-11, H-20, H-22); G-24; `prd/research/00-baseline-corrections.md` (#1, 6, 9, 20); `prd/research/01-market-competition.md` §2–§3; `prd/research/02-regulatory-data.md` §9; `prd/research/03-payments-communications.md` §4–§5 |
| Related files | `prd/03-domain-data-model.md` (`Subscription`, `Plan`, `ModuleActivation`, `UsageMetric`, INV-05, INV-38, OQ-05); `prd/02-actors-personas.md` (BES-DIR-01/02/04); `prd/journeys/00-journey-map.md` (PC-03, PC-07, PC-11, §4.1); `prd/modules/10-administration-onboarding-subscription.md` (subscription lifecycle); `prd/modules/16-finance-billing-collections.md` (billing families, out of scope for this file); `prd/cross-cutting/32-non-functional-requirements.md` (NFR, notably NFR-SAV); `prd/cross-cutting/35-external-integrations.md` (SMS, WhatsApp, Fatourati integrations); `prd/cross-cutting/36-legal-compliance-data-protection.md`; `prd/cross-cutting/37-roadmap-mvp-v1-v2.md` (milestones); `prd/cross-cutting/38-kpi-success-metrics.md` (indicators); `prd/cross-cutting/39-risks-mitigations.md` (risks); `prd/cross-cutting/42-review-arbitrations.md` (ARB-01, ARB-06, ARB-20c, ARB-21h, ARB-25o) |

---

## 1. Objective and scope

This file sets ZSchool's business model and packaging: who pays, how much, on which unit and cadence, what is included, what is billed separately, and how the offer positions against the market. It translates baseline `PROJECT.md` §11 (gap G-24, closed) and decisions DEC-13, DEC-27, DEC-28, and DEC-35.

In scope for this file:

- the paying customer and free end users (DEC-13);
- the single all-inclusive plan and reference price (DEC-28, Q-10);
- the billing unit: a measurable definition of "active student" and the counting rule;
- monthly billing in MAD, the subscription lifecycle, the free trial;
- consumables (SMS, WhatsApp conversations, storage) and their sourced pricing references;
- professional services (onboarding, migration, training, configuration, premium support);
- price positioning against documented competitors;
- commercial targets (DEC-27), pilots (DEC-35), the MOWAKABA subsidy, group billing.

Out of scope for this file:

- billing families through the school (fee schedules, payment plans, payments, reminders): `prd/modules/16-finance-billing-collections.md`;
- the technical mechanics of the SMS, WhatsApp, and Fatourati channels: `prd/cross-cutting/35-external-integrations.md`;
- go-to-market milestones and detailed indicators: `prd/cross-cutting/37-roadmap-mvp-v1-v2.md` and `prd/cross-cutting/38-kpi-success-metrics.md`;
- the fate of personal data upon termination: `prd/03-domain-data-model.md` and `prd/modules/10-administration-onboarding-subscription.md`.

---

## 2. Business model principles

### 2.1 Paying customer and free end users

The paying customer is **the school**; for a school group, **the organization** subscribes (DEC-13, DEC-02). Parents, students, and teachers pay nothing: no payment flow and no commercial offer is presented to them, including in the mobile apps. This free access is a foundational choice (baseline §1): it maximizes adoption of the parent, student, and teacher portals, which carry the global identity's network effect (baseline §3.2, needs BES-DIR-01/02/04 of `prd/02-actors-personas.md`).

### 2.2 Single all-inclusive plan

A single active pricing plan includes every available module (DEC-28): administration, academics, attendance, assessments and report cards, communication, finance, timetable, documents, transfers, reporting — then, as they ship, transport, canteen, health, online payment, and the public API, activated at no extra cost via the `ModuleActivation` entity (`prd/03-domain-data-model.md` §2.7). There is no paid per-module option, no "Premium" edition, and no feature reserved for a higher tier: differentiation among competitors through nested editions (Skoolly Starter/Pro/Élite, Minassa Starter to Excellence+, SchoolMA Discovery/Enterprise — `prd/research/01-market-competition.md` §2) is explicitly avoided.

### 2.3 Price and billing cycle

| Item | Pricing rule | Source |
|---|---|---|
| Single-plan subscription | **5 MAD per active student per month**, billed over ten months (September to June), i.e. **50 MAD per student per school year**, all modules included | PROJECT.md §11; DEC-28, confirmed by the founder on 09/09/2026; Q-10 |
| Order of magnitude | 300 students = 1,500 MAD/month; 2,000 students = 10,000 MAD/month | PROJECT.md §11 |
| SMS consumable | prepaid packs sold to the school in the **0.30–0.50 MAD per SMS** corridor (margin included); market pricing reference: alphanumeric sender ID ≈ 0.31–0.36 MAD per SMS in tiers of 5,000 to 100,000 | DEC-28; `prd/research/03-payments-communications.md` §5 (bulksms.ma) |
| WhatsApp consumable | **configurable** re-billing grid by category and effective date; current reference: *utility* message ≈ **€0.0064** to +212; new "standalone rate card" for Morocco applicable from 10/01/2026 | `prd/research/03-payments-communications.md` §4; correction #6 of `prd/research/00-baseline-corrections.md` |
| Storage consumable | quota included in the subscription: 2 GB per school plus 5 MB per active student (working hypothesis ARB-25o, to be confirmed by the founder, OQ-06); tiered billing beyond that (pricing: a parameter, OQ-06) | PROJECT.md §11; ARB-25o |
| Professional services | onboarding and data migration **at a flat rate**; training, advanced configuration, premium support billable (amounts: parameters to finalize, OQ-06) | PROJECT.md §11; DEC-28 |
| Trial | free, limited duration, with demo data | PROJECT.md §11 |
| Public subsidies | onboarding, configuration, and training services targeted by the MOWAKABA program (80% for SMEs / 90% for micro-enterprises of cost, projects from 15,000 to 150,000 MAD); school eligibility to be confirmed | `prd/research/02-regulatory-data.md` §9; correction #20; H-22 |

The 5 MAD price sits at the top of the observed Moroccan range (10 to 65 MAD per student per year — PROJECT.md §3.3), with a markedly more complete offer than documented competitors: multi-school global identity, a single cross-school parent account, a parent app, Fatourati collections, all modules (PROJECT.md §11; detail in §8).

**Annual price stability** (logged in OQ-10): the subscription's unit price is contractually stable for the current school year; any revision takes effect the following year, consistent with the spirit of Law 59.21, which bars schools from raising fees mid-year (baseline §2.7).

### 2.4 What is always free

- Access for parents, students, and teachers to the platform and apps (DEC-13).
- Free notification channels: in-app (MVP) and push (V1) notifications, the first channels in the routing hierarchy (DEC-36; `prd/research/03-payments-communications.md` §4).
- The Fatourati connection in V1 (DEC-31) carries **no charge billed by ZSchool**: the connection is part of the subscription and the school remains the creditor and beneficiary of the funds, with ZSchool never holding funds (baseline §2.8); the terms of the CMI rail (creditor/Aggregator/Collect contracts, non-public rates) remain to be obtained (H-19; OQ-06 of `prd/cross-cutting/35-external-integrations.md`; `prd/research/03-payments-communications.md` §1) and are outside ZSchool's own pricing.

---

## 3. Billing unit: a measurable definition of "active student"

The subscription is billed by **active student**, counted each month from September to June (DEC-13, DEC-28). The baseline sets the unit but not the counting rule; `prd/03-domain-data-model.md` logged it as OQ-05 ("counting rule for 'active student' (`UsageMetric`) for months in which an enrollment becomes ACTIVE, is SUSPENDED, or is closed"). This file proposes a measurable, auditable working definition:

1. **Counting date**: the 1st of each billing month, at midnight local `Africa/Casablanca` time (permanently UTC+0 since 09/20/2026 — correction #1 of `prd/research/00-baseline-corrections.md`).
2. **Counted student**: any student holding, at the billed school, at least one enrollment with status **ACTIVE** on the counting date.
3. **Students not counted**: enrollments with status CANDIDATE and PRE-ENROLLED (not yet admitted), SUSPENDED (a temporary measure that keeps the student-year pair but with no active service — an alternative is discussed in OQ-04), and the terminal statuses TRANSFERRED, WITHDRAWN, EXPELLED, COMPLETED (the state machine of baseline §6.3, carried by `prd/03-domain-data-model.md`).
4. **No double counting**: only one ACTIVE enrollment is possible per (student, school year) pair across the entire platform (RG-08, INV-05); a single student can therefore never inflate the billable headcount of two schools, and an organization's consolidated invoice (PAK-08) is duplicate-free by construction.
5. **Mid-month entry or exit**: takes effect at the next count — a student who becomes ACTIVE on October 5 is billed starting in November; a student closed out on November 12 is still counted in November. No daily proration in the working rule; a prorated variant remains possible (OQ-04, cross-referencing OQ-05 of `prd/03-domain-data-model.md`).
6. **Logging**: every monthly count is recorded in `UsageMetric` (`prd/03-domain-data-model.md` §2.7) with the date, the school, the headcount counted, and the rule version applied, as an append-only entry; it underlies the invoice and serves as the reference for any customer dispute.
7. **Transparency**: the principal's office can view the projected billable headcount for the current month and the counting history at any time; any enrollment status correction between two counts carries over to the next count, with no retroactive adjustment.
8. **Transfer between two ZSchool schools** (ARB-20c): in the transfer month, the student is counted once, at the origin school (ACTIVE enrollment as of the 1st of the month); the receiving enrollment, activated mid-month, is counted starting the following month, per rule 5. An ACTIVE enrollment created via import activation (mid-year data migration, ARB-02) is counted as of the 1st of the month following its activation.

This rule is deliberately simple, predictable, and verifiable by the customer: a given month's invoice headcount is exactly the ACTIVE headcount observed on the 1st of that month.

---

## 4. Monthly billing and the subscription lifecycle

### 4.1 Subscription invoice

- A monthly invoice in **MAD** is issued for each school month (ten per year), in the name of the school or the organization (DEC-13, DEC-28).
- Amount = active-student headcount counted on the 1st of the month × 5 MAD. The invoice details the period, the headcount billed per school, the unit price, and the total; it can be viewed and printed from the subscription-management area.
- **No invoice is generated in July or August** (DEC-28); the subscription stays active with no amount due over the summer. These two months are the preferred window for onboarding new schools (`prd/journeys/00-journey-map.md` §4.1): a school onboarded in summer produces its first invoice on September 1.
- A subscription activated mid-month M produces its first invoice on the 1st of month M+1; no proration applies at start-up (working rule, OQ-04).
- **Case of the DEC-35 pilots**: onboarded starting in February 2027 (JAL-04 of `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`), they are billed only for the remaining school months (five months, February to June 2027, i.e. ≈ 25 MAD per student for the 2026-2027 year). The commercial benchmark of 50 MAD per student per year assumes a full September-to-June subscription; any mid-year entry bills only the remaining months (counting rule §3, with no daily proration — OQ-04).

### 4.2 Lifecycle

The subscription's status is carried by the `Subscription` entity (`prd/03-domain-data-model.md` §2.7): **trial**, **active**, **past due**, **terminated** (DEC-23).

- **Trial**: free, limited duration, with demo data (detail in §7).
- **Active**: normal regime, monthly billing per §4.1.
- **Past due**: switches to read-only after a configurable delinquency period (value to finalize, OQ-06); during read-only, viewing functions remain accessible to every role and writes are blocked; return to active follows settlement.
- **Termination**: full data export, 90 days of read-only access, deletion of operational data at 12 months, global identities and published documents retained (DEC-23, INV-38 of `prd/03-domain-data-model.md`); the `SubscriptionSuspendedOrTerminated` event is fired (entity in the same file, §4).
- The payment methods a school uses to pay the subscription invoice (bank transfer, direct debit, other) are not specified by the baseline: OQ-07.

### 4.3 Accounting treatment of consumables

Consumables (SMS, WhatsApp, storage beyond the quota) and services are billed on separate lines from the subscription invoice, with their own usage records (§5), so the school can distinguish the fixed subscription from usage costs in its accounting (accounting-document retention: 10 years, baseline §2.7).

---

## 5. Consumables

Common principles: consumables are **optional** — the subscription remains fully functional without any pack; free channels are never conditioned on a purchase; consumption is measured, logged, and reported per school; it is always billed to the school, never to families (DEC-13); per-school counters and threshold alerts (`prd/research/03-payments-communications.md` §5).

### 5.1 SMS

- Sales model: **prepaid packs** of SMS credits, credits with **no expiry** (a contractual model observed in the market — `prd/research/03-payments-communications.md` §5), sold to the school self-service.
- Pricing reference: transactional SMS exclusively uses the **alphanumeric sender ID** (11 characters, premium routing), priced ≈ **0.31–0.36 MAD** per SMS in tiers of 5,000 to 100,000 sends at a Moroccan aggregator (`prd/research/03-payments-communications.md` §5, bulksms.ma). ZSchool's sell price sits in the **0.30–0.50 MAD** corridor per SMS with margin (DEC-28); the exact value and pack granularity are commercial parameters to finalize (OQ-06).
- **"LowCost" routing (≈ 0.05–0.10 MAD, variable mobile-number sender 06XX) is not used for transactional SMS**: unidentified sender, unsuited to school notifications (`prd/research/03-payments-communications.md` §5). It is not part of the pack scope; a possible use for non-critical bulk alerts would be a separate V2+ evolution to study.
- Counters: per-school credit balance, configurable threshold alerts, SMS-channel blocking on a depleted balance **with no impact on free channels** (in-app notification, then push in V1) and an alert to the principal's office; traceability for every send (recipient, message template, outcome).
- Since no formal reseller program is published by Moroccan aggregators (`prd/research/03-payments-communications.md` §5), ZSchool either operates a direct aggregator contract with pack sales or a proprietary account with re-billing; the technical choice is covered by `prd/cross-cutting/35-external-integrations.md`.
- **Authentication SMS** (login codes, MFA, reset, invitations and identity claims): these are never charged against a school's credits; it is a platform cost built into the subscription price and tracked as such (PAK-17, ARB-21h).

### 5.2 WhatsApp conversations

- The WhatsApp channel — MVP usage limited to attendance notifications via WhatsApp utility (founder arbitration D1; INT-WAP-01 and OQ-03 of `prd/cross-cutting/35-external-integrations.md`), generalized in V1 (all messages, managed templates, WhatsApp Business API) — is re-billed to the school per a **configurable pricing grid**: category (marketing, *utility*, authentication), amount per message, effective date. The grid is a product parameter, not a compiled constant: the market switched to per-message billing on 07/01/2025 and changes again on 10/01/2026 (correction #6).
- Current reference to +212: *utility* message ≈ **€0.0064**, *authentication* ≈ €0.0064, *marketing* ≈ €0.0357 (vendor BSP Messaggio, `prd/research/03-payments-communications.md` §4) — i.e. a *utility* message ≈ **8 times cheaper** than an alias SMS. These values serve as a sizing reference, not a contractual rate.
- **10/01/2026 switch**: the end of free *service* and *utility* messages within the 24-hour window, and Morocco's exit from "Rest of Africa" regional rates in favor of a **standalone rate card** (higher *utility* and *authentication* rates, plus *authentication-international*); the grids were expected to be published before 09/01/2026 — final values to be entered into configuration once published (OQ-03).
- **Inbound messages**: after 10/01/2026, parent replies within the 24-hour window become billable; they are counted in the school's consumption and shown in the report (correction #6; `prd/research/03-payments-communications.md` §4).
- Safeguards: only Meta-approved *utility* templates are used (a message reclassified as *marketing* costs ≈ 5.6 times the *utility* rate); parental opt-in is required (Law 09.08 — compliance covered by `prd/cross-cutting/36-legal-compliance-data-protection.md`, integration by `prd/cross-cutting/35-external-integrations.md`); the push → WhatsApp *utility* → alias SMS routing hierarchy (DEC-36) structurally limits the WhatsApp bill.
- EUR→MAD conversion for re-billing: reference rate and conversion date configured (OQ-09).

### 5.3 Document storage

- A **storage quota** is included in each school's subscription; consumption (documents, attachments, supporting files) is measured and continuously visible to the principal's office.
- Included quota (working hypothesis ARB-25o): 2 GB per school plus 5 MB per active student, i.e. roughly 3.5 GB for 300 students and 12 GB for 2,000 students; beyond that, consumption is billed in tiers; the final quota value and above-quota pricing remain to be confirmed by the founder (OQ-06).
- Before exceeding the quota, preventive alerts (configurable thresholds) and an upgrade offer; no blocking of critical functions (viewing existing documents, report cards) while an overage awaits billing.

---

## 6. Professional services

| Service | Content | Pricing | Version |
|---|---|---|---|
| Onboarding | Creating the tenant, initial configuration (legal identity, languages, channels), instantiating the national structure model, assisted Excel imports with duplicate checking, internal users and roles (journey PC-03 of `prd/journeys/00-journey-map.md`) | Flat rate by headcount tier (amounts: parameters, OQ-06) | MVP |
| Data migration | Importing existing data (students, parents, classes, balances) from Excel or the previous tool, with a validation report | Flat rate, standalone or bundled with onboarding | MVP |
| Training | Training for teams (principal's office, registrar's office, student life, teachers), bilingual FR/AR materials | Per session or flat rate (parameters, OQ-06) | MVP (pilots); catalog offer in V1 |
| Advanced configuration | Complex fee schedules, report-card templates, timetable variants, message templates | Per session | V1 |
| Premium support | Beyond the included standard support (NFR-DISP-06, `prd/cross-cutting/32-non-functional-requirements.md`: single channel, business hours, first response within 4 business hours for a blocker): dedicated channel, stronger response-time commitments; exact definition and pricing: parameters (OQ-06) | Subscription or annual flat rate | V1 |

Onboarding, configuration, and training services are the expenses targeted by the MOWAKABA subsidy program (§9.3): they are therefore billed with formal quotes, a prerequisite for the subsidy application (procedure: ICE + quote + online filing — `prd/research/02-regulatory-data.md` §9).

---

## 7. Free trial with demo data

- The trial is **free, of limited duration** (duration: commercial parameter to finalize, OQ-06), with a preloaded **demo dataset**: a model national academic structure, classes, fictional students, a few assessments and report cards — enough to explore every module without prior data entry.
- During the trial, the school can enter its own data and import its files; the exact scope of consumables during the trial (whether SMS/WhatsApp sends are allowed) is to be settled (OQ-06).
- **Conversion**: upon subscribing, the subscription switches to active status, demo data is deleted, data entered by the school is kept, and monthly billing starts on the 1st of the following month (§4.1).
- After a trial that does not convert: the tenant's fate (retention period before deletion, possible export) follows the termination cycle (DEC-23); detail to be settled (OQ-06).
- The trial is a direct response to market practice (Skoolly: 30-day trial; SchoolApp: one-month trial — `prd/research/01-market-competition.md` §2) and lowers the perceived risk for principals currently equipped with Excel files (baseline §2.1).

---

## 8. Price positioning and competition

### 8.1 Observed public rates (as of 09/09/2026)

Every value in this table comes from `prd/research/01-market-competition.md` (§2 for Moroccan players, §3 for international ones), except where noted as from the baseline.

| Solution | Observed public rate | Notes |
|---|---|---|
| **ZSchool (target)** | **5 MAD per active student per month; 50 MAD per student per school year (10 months), all inclusive** | PROJECT.md §11; DEC-28 |
| Skoolly | 4, 5, or 6 MAD per student per month depending on edition (Starter, max 100 students; Pro unlimited with HR, admissions, payments; Élite with AI and multi-school support); 10% discount on annual payment; 30-day trial; cited example: 200 students on Pro = 1,000 MAD/month | Equivalent to 40–60 MAD per student over 10 months (derived calculation, no external source); Play Store app owned by an Indian developer; no visible Massar integration |
| Minassa | 249 MAD/month (0–100 students) to 1,050 MAD/month (601–800 students); + 99 MAD/month per 50-student tier; groups on quote | i.e. 1.3 to 2.5 MAD per student per month (sourced figure, `prd/research/01-market-competition.md` §2) |
| SchoolMA | Free demo (≤ 10 students); Discovery 300 MAD/month (≤ 50 students, 1 GB); Enterprise 800 MAD/month unlimited (50 GB, HR payroll, GPS transport, unlimited WhatsApp) | 300 MAD for 50 students = 6 MAD/student/month at the tier's maximum (derived calculation) |
| Madariss Plus / eMadariss (Nexsoft) | Promotion "starting at 6,800 MAD/year" (promotional page) | Locally installed software at the school (Madariss Plus) or web via subdomain (eMadariss); white-label apps per school; no cross-school parent account |
| Tayssir School | BASIC free forever (unlimited students, 2 administrators); PREMIUM on quote | ~50 schools claimed; "bidirectional Massar sync" claimed, publicly unverifiable (no documented Massar API — H-04) |
| DataSchool, SchoolApp, E-Schools, SmartSchool, ALIFADA | Prices not published (on quote) | 2 out of 6 players publish prices in the Moroccan SaaS segment (`prd/research/01-market-competition.md` §2) |
| E-Madrassati | 1,950 MAD excl. VAT/year (promotion "instead of 4,950") | Page dated 12/2023, weak sign of 2025-2026 activity |
| Galactis.Education | Essentials €5/student/year; Collaboration €1; Campus €2; e-learning €2–15; HR €20/employee/year; Express edition 5,000 MAD/year | SaaS targeting Morocco, **hosted in the United States** — at odds with the local-hosting expectation (DEC-26) |
| Pronote (Index Éducation) | Licenses €572–1,055 excl. VAT/year depending on teacher count + hosting €330–993, i.e. ≈ €2,000 excl. VAT/year for an unlimited hosted offer (2023 rates); paid export API (€140 excl. VAT/year) | ~80 Moroccan schools; does not cover billing; positioned for the French curriculum stream and bilingual groups |
| Classter (international benchmark) | ≈ $24/student/year + onboarding | Calibration benchmark, `prd/research/01-market-competition.md` §5 |

Baseline summary: Moroccan public prices sit between **10 and 65 MAD per student per year**; full-featured French offers around **€15 per student per year** (PROJECT.md §3.3).

### 8.2 Competitive reading

- **Price position**: at 50 MAD per student per year, ZSchool sits at the top of the Moroccan range (10–65 MAD — PROJECT.md §3.3), on par with Skoolly Pro (4–6 MAD/month) and markedly above Minassa (1.3–2.5 MAD/student/month). The price is justified by the content: multi-school global identity, a single cross-school parent account, a portable teacher profile, Fatourati collections, all modules included — where no documented player offers global identity (PROJECT.md §3.3, §11).
- **Sub-300-student segment**: below 300 students, some competing plans remain arithmetically cheaper (e.g. Minassa 249 MAD/month for 0–100 students, versus 750 MAD/month for 150 students at ZSchool); the commercial target (DEC-19: 300-to-3,000-student schools on the Casablanca–Kenitra corridor) does not cover this segment. The sales pitch does not compare prices head-on there: it shifts to multi-school global identity and services (next points).
- **Documented structural differences** (`prd/research/01-market-competition.md` §2, common market traits): competitors are single-school (except group offers on quote); their "Massar sync" relies on files, never a documented API; none integrate Moroccan payment rails (CMI/Fatourati absent from product messaging); pricing is opaque (2 of 6 players publish prices); actual app adoption is low (installs on the order of 1,000 for most apps; best-installed parent app: DataSchool, 10,000+); no integrated WhatsApp messaging product.
- **Ministry apps**: Massar (Moutamadris, Waliye, Moudaris) is mandatory and free but offers no billing, transport, canteen, or communication; last updated in 2022; baseline §3.3 cites ratings of 2 to 2.9/5, research finds 3.1/5 for Moutamadris (~7,060 reviews) with unchanged dominant complaints (login failures, blank screens, unavailability) — divergence logged in OQ-01.
- **Reliability expectation**: connection reliability is the #1 complaint about parent apps (`prd/research/01-market-competition.md` §4); the 5 MAD price is underpinned by a higher quality bar (NFR-DISP and NFR-PERF domains, `prd/cross-cutting/32-non-functional-requirements.md`).
- **Price transparency**: publishing the price list (PAK-16) is a direct differentiator in a market where pricing is mostly opaque (`prd/research/01-market-competition.md` §2).
- What is **forbidden** in sales messaging: any market figure not sourced from the research files (`prd/research/00-baseline-corrections.md` through `prd/research/05-infrastructure-usage.md`) or the baseline, any unsubstantiated quality comparison, any promise of MOWAKABA eligibility before verification (OQ-02), any promise of Massar sync beyond the file-based channel (H-04).

---

## 9. Commercial targets and levers

### 9.1 Reference targets (DEC-27, confirmed by the founder on 09/09/2026)

| Horizon | Schools | Students | Annual subscription revenue at full run rate (derived calculation: headcount × 50 MAD, no external source) |
|---|---|---|---|
| End of year 1 | 20 | 15,000 | 750,000 MAD (15,000 × 50) |
| End of year 3 | 300 | 200,000 | 10,000,000 MAD (200,000 × 50) |

The "end of year 1" horizon is anchored in the calendar by `prd/cross-cutting/37-roadmap-mvp-v1-v2.md` (JAL-11, OQ-01): a **working hypothesis** adopted by the PRD, it designates the end of the 2028-2029 school year, the first full year of general rollout — not 2026-2027, which is the pilot year. This reading pushes the targets confirmed by the founder on 09/09/2026 back by two years; it is **escalated to the founder** as a blocking question (ESC-01, ARB-06; register `prd/cross-cutting/40-assumptions-open-questions-tracker.md`): either DEC-27 is read from the commercial launch onward (2029 and 2031), or the roadmap must be compressed. This chapter's business case (NFR-RES-01, capacity sizing) is unaffected by the choice.

Year 1: pilots then the Casablanca–Kenitra corridor (DEC-27). Three-year technical capacity sizing (500 schools, 500,000 students — baseline §10) covers roughly 2.5 times the commercial ambition. The market leaves room: 7,564 private schools (2023-2024), 70% of them on the Casablanca–Kenitra corridor, 1.2 to 1.3 million private-school students (~15%) — figures corrected by research (`prd/research/01-market-competition.md` §1; correction #9, divergence from baseline §2.1 logged in OQ-01). At the baseline rate, the private-school base represents a theoretical potential of 60 to 65 million MAD per year (derived calculation: 1.2–1.3M × 50 MAD); this gross potential does not factor in any penetration assumption and must not be presented as a forecast.

Progress against these targets is measured by the indicators of `prd/cross-cutting/38-kpi-success-metrics.md` (active schools, billed active students, subscription revenue); go-to-market milestones are carried by `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`.

### 9.2 Pilots (DEC-35, confirmed by the founder on 09/09/2026)

Four representative profiles on the Casablanca–Rabat corridor, which set the order of magnitude for invoices and onboarding effort:

| Pilot | Headcount | Expected monthly invoice at 5 MAD (derived calculation from the baseline rate; 300 and 2,000 students cited in PROJECT.md §11) |
|---|---|---|
| Primary school | ≈ 300 students | 1,500 MAD/month |
| Middle-and-high school | ≈ 800 students | 4,000 MAD/month |
| Multi-site group | > 2,000 students | > 10,000 MAD/month (billed at the organization level, PAK-08) |
| Bilingual school on a trimester calendar | headcount not specified by the baseline | billing identical to the active headcount; the trimester calendar does not change the counting rule |

Pricing terms applicable to the pilots (full price, discount, or free) are not fixed by the baseline: to be settled before launch (OQ-06).

### 9.3 MOWAKABA subsidy as a sales lever

The MOWAKABA program (Maroc PME / Morocco Digital 2030) covers **80% of digitalization cost for an SME, 90% for a micro-enterprise**, on projects of **15,000 to 150,000 MAD**; eligible expenses are **services** (business software, deployment, training) via **listed vendors**; procedure: ICE + quote + online filing; approval in 4 to 6 weeks; disbursement after delivery (`prd/research/02-regulatory-data.md` §9; correction #20; baseline H-22).

Commercial implementation (PAK-15):

- assembling a turnkey MOWAKABA application covering eligible services (onboarding, configuration, training — PAK-12, PAK-13), with formal quotes;
- **project start decoupled from disbursement**: the project starts without waiting for approval (4 to 6 weeks) or the disbursement that follows delivery;
- **no firm commitment on eligibility** until private schools' eligibility is confirmed (one source restricts the program to the industrial sector or related activities): systematic verification with the Maroc PME regional office before any commitment (OQ-02);
- listing ZSchool as a vendor under the program (OQ-02);
- the subsidy covers services, not the subscription: the correct sales message is "up to 80–90% of start-up services covered subject to eligibility", never "the platform is subsidized".

### 9.4 Billing school groups

For an organization (DEC-02, V1), a consolidated invoice aggregates the active headcounts of every affiliated school, with a breakdown per school; uniqueness of the active enrollment platform-wide (INV-05) guarantees no double counting. This is a direct selling point for multi-site groups (Si Abdellah, 1,800 students across three sites — baseline §5.2; need BES-DIR-04).

### 9.5 Other levers from the baseline

Network effects from multi-school parents and part-time teachers, referrals between principals, partnerships (school insurers, transporters, banks for payment) — PROJECT.md §11. Commercial seasonality follows the school year: an onboarding window from April to August (`prd/journeys/00-journey-map.md` PC-03), no billing in July-August (DEC-28), consumables ramping up at the start of the school year (PC-05, PC-11).

---

## 10. Requirements

PAK requirements follow the conventions §3 template adapted for cross-cutting rules. The Version tag follows PROJECT.md §12's scope; justifications for MVP tags outside §12's explicit list are logged in OQ-05.

### PAK-01 — Restrict the paying customer to the school or the organization

| Attribute | Value |
|---|---|
| Description | The subscription is taken out, billed, and paid by the school or, for a group, by the organization. No paid feature, no purchase flow, and no commercial offer is presented to parents, students, or teachers, on web or mobile. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-13, DEC-02, G-24, Q-10 |
| Actors | Principal's office, organization administrator, ZSchool (operator); parents, students, teachers (free beneficiaries) |

### PAK-02 — Provide a single all-inclusive plan with no per-module option

| Attribute | Value |
|---|---|
| Description | Only one pricing plan is active on the platform. Every available module is included: MVP and V1 modules at their respective launch, later modules (transport, canteen, health, online payment, public API) as they ship, activated via `ModuleActivation` at no extra cost and no sales process. No edition, no per-module add-on, no feature capped by a subscription tier. |
| Priority | Must |
| Version | MVP (principle); no-extra-cost activation of V2+ modules follows their release (V2+) |
| Traceability | DEC-28, PROJECT.md §11, §12 |
| Actors | Principal's office, organization administrator, ZSchool (operator) |

### PAK-03 — Apply the single price of 5 MAD per active student per month

| Attribute | Value |
|---|---|
| Description | The subscription price is 5 MAD per active student per month, billed over ten months (September to June), i.e. 50 MAD per student per school year, all modules included. The price is displayed on the public price list and carried in the subscription contract; it is stable for the current school year (§2.3, OQ-10). Contractual examples: 300 students = 1,500 MAD/month; 2,000 students = 10,000 MAD/month. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-28, Q-10, PROJECT.md §11, §3.3, OQ-10 |
| Actors | Principal's office, organization administrator, ZSchool (operator) |

### PAK-04 — Count the active student per a measurable, auditable rule

| Attribute | Value |
|---|---|
| Description | Monthly active-student counting applies the rule in §3: a snapshot at midnight local `Africa/Casablanca` time on the 1st of the billing month; counted = ACTIVE enrollments; not counted = CANDIDATE, PRE-ENROLLED, SUSPENDED, and terminal statuses; uniqueness guaranteed by INV-05; mid-month entries and exits take effect at the next count; every count logged append-only in `UsageMetric` (date, school, headcount, rule version). The principal's office can view the projected billable headcount for the month and the counting history. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-13, DEC-28, RG-08, INV-05, OQ-05 of `prd/03-domain-data-model.md`, OQ-04 |
| Actors | Principal's office, organization administrator, ZSchool (operator) |

```gherkin
Feature: Counting the active student
  Scenario: Student enrolled mid-month
    Given a subscribed school with an established headcount as of October 1, 2026
    And an enrollment that switched to ACTIVE status on October 5, 2026
    When the monthly count runs on November 1, 2026, at midnight
    Then the student is counted in November's billable headcount
    And they are not counted retroactively in October's headcount
    And the count is logged in UsageMetric with the date, headcount, and rule version

  Scenario: Suspended student not counted
    Given an enrollment with SUSPENDED status as of November 1, 2026
    When the monthly count runs
    Then the student is not counted in November's billable headcount
    And their return to ACTIVE status on November 20 makes them countable on December 1
```

### PAK-05 — Bill monthly in MAD from September to June, never in July or August

| Attribute | Value |
|---|---|
| Description | A subscription invoice in MAD is issued for each of the ten school months (September to June); its amount is the active-student headcount counted on the 1st of the month multiplied by 5 MAD. No invoice is generated in July or August; an active subscription carries no amount due over the summer. A subscription activated mid-month M produces its first invoice on the 1st of the following month. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-13, DEC-28, PROJECT.md §11 |
| Actors | Principal's office, school accounting, organization administrator, ZSchool (operator) |

```gherkin
Feature: Monthly subscription billing
  Scenario: October invoice for a 300-student school
    Given a subscribed school with 300 students at ACTIVE status as of October 1, 2026
    When monthly billing runs
    Then an invoice for 1,500 MAD is issued for October
    And it details the billed headcount (300 students) and the unit price (5 MAD)
    And the invoice can be viewed and printed from the subscription-management area

  Scenario: No summer billing
    Given a school whose subscription is active
    When the July 1 and August 1 counts come due
    Then no subscription invoice is generated for either July or August
    And the subscription remains active with no amount due
```

### PAK-06 — Deliver a detailed, retained subscription invoice

| Attribute | Value |
|---|---|
| Description | Every invoice identifies the customer (school or organization), the billing period, the headcount billed per school, the unit price, the total in MAD, and separates subscription lines from consumables (§5) and services (§6). Invoices can be viewed, downloaded, and are retained in the subscription-management area; the exact tax notices on the ZSchool invoice are handled in OQ-08. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-28, PROJECT.md §11, OQ-08 |
| Actors | Principal's office, school accounting, organization administrator, ZSchool (operator) |

### PAK-07 — Manage the subscription lifecycle, from trial to termination

| Attribute | Value |
|---|---|
| Description | The subscription carries the statuses trial, active, past due, terminated (`Subscription`, `prd/03-domain-data-model.md` §2.7). The trial is free, of limited duration, with demo data (§7). Switching to past-due triggers read-only after a configurable delay (viewing open, writes blocked); settlement restores active status. Termination applies DEC-23 and INV-38: full export, 90 days of read-only, deletion of operational data at 12 months, global identities and published documents retained. Every trial-to-past-due-to-terminated transition is notified (event `SubscriptionSuspendedOrTerminated`). Functional owner: `prd/modules/10-administration-onboarding-subscription.md`. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-23, DEC-28, INV-38, PROJECT.md §11 |
| Actors | Principal's office, ZSchool (operator) |

```gherkin
Feature: Converting a trial to a subscription
  Scenario: Subscribing after a trial
    Given a school on trial for 20 days
    And a preloaded demo dataset
    And real data entered by the registrar's office during the trial
    When the principal's office subscribes to the single plan
    Then the subscription switches to active status
    And the demo data is deleted
    And the school's entered data is kept unchanged
    And the first subscription invoice is issued on the 1st day of the following month
```

### PAK-08 — Bill the organization with a consolidated invoice for groups

| Attribute | Value |
|---|---|
| Description | For an organization grouping several schools (V1), monthly billing produces a consolidated invoice: a total at the organization level, with a breakdown per school (headcount billed, amount). Per-school counting relies on PAK-04; uniqueness of the active enrollment platform-wide (INV-05) rules out any double counting. The group administrator receives the invoice and the breakdown. |
| Priority | Must |
| Version | V1 (multi-school organizations, §12 V1) |
| Traceability | DEC-02, DEC-13, DEC-28, INV-05, PROJECT.md §12 |
| Actors | Organization administrator, each school's principal's office, ZSchool (operator) |

```gherkin
Feature: Consolidated invoice for a school group
  Scenario: A two-school organization
    Given an organization grouping a primary school with 300 active students
    And a middle-and-high school with 800 active students as of November 1, 2026
    When the organization's monthly billing runs
    Then a consolidated invoice of 5,500 MAD is issued in the organization's name
    And it details 1,500 MAD for the primary school and 4,000 MAD for the middle-and-high school
    And no student is counted at both schools
```

### PAK-09 — Sell transactional SMS in prepaid, alias-priced packs

| Attribute | Value |
|---|---|
| Description | SMS are sold to the school in prepaid packs, credits with no expiry, purchased self-service. The per-SMS sell price sits in the 0.30–0.50 MAD corridor with margin (exact value and pack granularity: parameters, OQ-06); the market pricing reference is the alphanumeric sender ID ≈ 0.31–0.36 MAD (`prd/research/03-payments-communications.md` §5). Transactional SMS exclusively uses the alias; LowCost routing (0.05–0.10 MAD, variable numeric sender) is not used for transactional messages. Every school has a credit balance, configurable threshold alerts, and a tracked send history; on a depleted balance, the SMS channel is suspended for non-critical sends — except a configurable emergency queue, aligned with INT-SMS-03 (`prd/cross-cutting/35-external-integrations.md`) — with no impact on free channels (in-app notification, push in V1), and an alert is sent to the principal's office. |
| Priority | Must |
| Version | MVP (SMS present at MVP, §12) |
| Traceability | DEC-28, DEC-12, DEC-36, `prd/research/03-payments-communications.md` §5 |
| Actors | Principal's office, registrar's office, head supervisor (senders), parents (recipients, free), ZSchool (operator) |

```gherkin
Feature: Managing the SMS credit balance
  Scenario: Balance depleted during the morning attendance run
    Given a school whose SMS credit balance reaches zero
    When an absence notification is triggered after attendance is taken
    Then the notification is delivered through the remaining free channels (in-app notification, then push in V1)
    And no SMS is sent, except messages kept in the configurable emergency queue (INT-SMS-03 of `prd/cross-cutting/35-external-integrations.md`)
    And the send history keeps a record of the message not delivered by SMS
    And a depleted-balance alert is sent to the principal's office

  Scenario: Topping up a pack
    Given a school under a depleted-balance alert
    When the principal's office purchases a prepaid SMS pack
    Then the credit balance is credited with the pack's amount
    And the SMS channel becomes available again for subsequent sends
    And the pack's amount appears on the next invoice, on a line separate from the subscription
```

### PAK-10 — Re-bill WhatsApp conversations per a configurable grid

| Attribute | Value |
|---|---|
| Description | WhatsApp conversations (MVP usage limited to attendance notifications — arbitration D1; generalized with a full grid in V1) are re-billed to the school per a pricing grid stored as a parameter: category (marketing, *utility*, authentication), amount per message, effective date. The grid incorporates the current reference (*utility* ≈ €0.0064 to +212) and, from 10/01/2026, Morocco's standalone rate card (end of free *service* and *utility* messages within the 24-hour window, higher *utility* and *authentication* rates, *authentication-international*); final values are entered once Meta publishes them (OQ-03). From 10/01/2026 onward, inbound messages are counted in consumption. A monthly report by category and by school underlies billing; EUR→MAD conversion is configured (OQ-09). |
| Priority | Must |
| Version | V1 (generalized WhatsApp, full re-billing grid); MVP usage limited to attendance notifications (arbitration D1, OQ-03 of `prd/cross-cutting/35-external-integrations.md`) |
| Traceability | DEC-36, H-20, DEC-12, correction #6 of `prd/research/00-baseline-corrections.md`, `prd/research/03-payments-communications.md` §4, `prd/cross-cutting/35-external-integrations.md` (INT-WAP-01, OQ-03) |
| Actors | Principal's office, ZSchool (operator); parents (senders of inbound replies, free) |

```gherkin
Feature: WhatsApp pricing switch of October 1, 2026
  Scenario: Pricing on either side of the switch
    Given the WhatsApp grid configured with the rate card applicable from October 1, 2026
    When a utility message is delivered on September 30, 2026
    And a utility message is delivered on October 1, 2026
    Then the first is priced per the grid predating October 1
    And the second is priced per the standalone rate card
    And both appear in the school's monthly consumption report

  Scenario: Counting inbound messages after the switch
    Given a parent who replied within the 24-hour window on October 3, 2026
    When the monthly consumption report is produced
    Then the inbound message is counted in the school's WhatsApp consumption
    And it appears distinctly from outbound messages
```

### PAK-11 — Measure and bill storage beyond the included quota

| Attribute | Value |
|---|---|
| Description | An included storage quota is attached to every school's subscription; consumption is measured continuously and visible to the principal's office. Preventive alerts (configurable thresholds) precede an overage; the overage is billed in tiers on lines separate from the invoice. Viewing existing documents and report cards is never blocked by an overage awaiting billing. Included quota (working hypothesis ARB-25o): 2 GB per school plus 5 MB per active student; pricing beyond that: a parameter to finalize (OQ-06). Quota counting is active from MVP onward (NFR-RES-03); billing an overage follows the first published grid. |
| Priority | Should |
| Version | MVP (quota and counting — ARB-25o); V1 (billing an overage) |
| Traceability | DEC-28, PROJECT.md §11; ARB-25o; NFR-RES-03 |
| Actors | Principal's office, ZSchool (operator) |

### PAK-12 — Sell onboarding and data migration at a flat rate

| Attribute | Value |
|---|---|
| Description | Onboarding (creating the tenant, initial configuration, instantiating the structure model, assisted Excel imports with duplicate checking, internal users and roles — journey PC-03) and data migration are services billed at a flat rate by headcount tier (amounts: parameters, OQ-06). Each flat-rate package has defined deliverables: an operational tenant, an instantiated structure, imports validated by a check report, trained internal users. Formal quotes issued for these services are used for the MOWAKABA application (PAK-15). |
| Priority | Must |
| Version | MVP (onboarding and Excel import, §12) |
| Traceability | DEC-28, DEC-35, H-22, PROJECT.md §11, `prd/journeys/00-journey-map.md` PC-03 |
| Actors | Principal's office, registrar's office, ZSchool (operator) |

### PAK-13 — Offer training and advanced configuration as billable services

| Attribute | Value |
|---|---|
| Description | Team training (principal's office, registrar's office, student life, teachers), with bilingual FR/AR materials, and advanced configuration (complex fee schedules, report-card templates, timetable variants, message templates) are offered as billable services, per session or at a flat rate (amounts: parameters, OQ-06). During the pilot phase, basic training accompanies onboarding (§6). |
| Priority | Should |
| Version | MVP (pilots, hands-on support); catalog offer in V1 |
| Traceability | DEC-28, DEC-35, H-22, PROJECT.md §11 |
| Actors | Principal's office, school staff, ZSchool (operator) |

### PAK-14 — Offer billable premium support beyond standard support

| Attribute | Value |
|---|---|
| Description | Standard support (single channel, business hours, first response within 4 business hours for a blocker, FR/AR response) is included in the subscription and defined by NFR-DISP-06 (`prd/cross-cutting/32-non-functional-requirements.md`). A billable premium offer provides a dedicated channel and stronger response-time commitments; its precise definition (scope, hours, commitments, pricing) is a commercial parameter to finalize (OQ-06). Any support access to a school's data remains governed by the logged procedure (baseline §8.1). |
| Priority | Should |
| Version | V1 |
| Traceability | DEC-28, PROJECT.md §11, §8.1; NFR-DISP-06 |
| Actors | Principal's office, ZSchool (operator) |

### PAK-15 — Assemble MOWAKABA subsidy applications for eligible services

| Attribute | Value |
|---|---|
| Description | For any school that requests it, ZSchool prepares the MOWAKABA digitalization subsidy application covering eligible services (onboarding, configuration, training): formal quotes, a project description, online filing (ICE + quote + application procedure), tracking approval (4 to 6 weeks) and disbursement after delivery. Reference rates are 80% of cost for an SME and 90% for a micro-enterprise, on projects of 15,000 to 150,000 MAD. No eligibility commitment is made until private schools' eligibility is confirmed (prior verification with the regional office, OQ-02); the project's start is never conditioned on the subsidy's disbursement. |
| Priority | Should |
| Version | V1 |
| Traceability | H-22, correction #20 of `prd/research/00-baseline-corrections.md`, `prd/research/02-regulatory-data.md` §9, PAK-12, PAK-13 |
| Actors | Principal's office, ZSchool (operator), Maroc PME regional office (third party) |

### PAK-16 — Publish an up-to-date public price list

| Attribute | Value |
|---|---|
| Description | The public price list shows the subscription price (5 MAD per active student per month), the consumables reference (SMS corridor, WhatsApp re-billing method, above-quota storage principle), and the list of billable services, with dated updates. Price transparency is a documented differentiator: only 2 of 6 players publish their prices in the Moroccan SaaS segment (`prd/research/01-market-competition.md` §2). |
| Priority | Could |
| Version | V1 |
| Traceability | DEC-28, PROJECT.md §11, §3.3 |
| Actors | Principal's office (reader), ZSchool (operator) |

### PAK-17 — Treat authentication SMS as a platform cost

| Attribute | Value |
|---|---|
| Description | SMS sent for account authentication and security (login codes, second factor, reset, number change, invitations and identity claims) are never deducted from a school's SMS credits or billed to families: they are a platform cost covered by the subscription price. ZSchool measures them separately (monthly volume, aggregator unit cost, per-school share for reference) to track subscription margin and feed the annual pricing review; a sizing benchmark is documented from the number of active accounts (two guardians per student on average, MFA for privileged roles, 90-day trusted devices limiting repeated OTPs — SEC-02, SEC-04). Authentication sends remain subject to rate limiting (SEC-24, SEC-28). |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-28, DEC-11, PROJECT.md §9, §11; ARB-21h; SEC-01, SEC-02, SEC-27; NFR-OBS-05 |
| Actors | ZSchool (operator); principal's office (informational) |

---

## Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Baseline/research divergences on which market data to keep: "1.27M / 15.3%" and "136,000 jobs" (H-01, §2.1) not corroborated — adopt 1.2–1.3M private-school students (~15%), 7,564 schools (2023-2024), revenue ~20 billion MAD in 2019-2020 (Competition Council); Massar app ratings: baseline §3.3 says "2 to 2.9/5" versus 3.1/5 for Moutamadris (~7,060 reviews) in research | Correction #9 of `prd/research/00-baseline-corrections.md`; `prd/research/01-market-competition.md` §1 and §4. Baseline update to request in review; this file retains the corrected research figures |
| OQ-02 | Private schools' eligibility for the MOWAKABA program is unconfirmed (one source restricts the program to the industrial sector or related activities) and listing ZSchool as a vendor remains to be obtained | Correction #20; H-22; `prd/research/02-regulatory-data.md` §9. To disambiguate with the Maroc PME regional office before any firm sales commitment (PAK-15) |
| OQ-03 | Final values of Morocco's standalone WhatsApp rate card applicable from 10/01/2026 (end of free *service* and *utility* messages within the 24-hour window, higher *utility* and *authentication* rates, *authentication-international*); grids announced by Meta before 09/01/2026, not found published as of the PRD's date | Correction #6; H-20; `prd/research/03-payments-communications.md` §4. PAK-10's configuration absorbs the switch with no product change; integrate the values once published |
| OQ-04 | Exact active-student counting rule | **Resolved — ARB-20c, ARB-01**: the working rule of §3 is adopted (a snapshot on the 1st of the month, mid-month entries and exits taking effect at the next count, SUSPENDED not counted), supplemented by rule 8 (a transfer counted once, at origin; import activation counted the following month); daily proration is ruled out. Founder confirmation expected with the pilot agreement. |
| OQ-05 | **Resolved — ARB-01 (MVP counting and quota, PAK-11); founder confirmation ESC-02:** Bringing the subscription-billing mechanics into MVP scope (PAK-03 to PAK-07, PAK-09, PAK-12): not explicitly listed in baseline chapter §12; rationale — the business model is settled (DEC-13, DEC-28) and MVP is deployed with billed pilots, so the counting mechanics must exist from MVP onward | Conventions §1.5 (explicit justification outside the §12 list); to be confirmed in review |
| OQ-06 | Commercial parameters not fixed by the baseline, to be finalized by the founder: free-trial duration; consumables scope during the trial and the fate of a tenant from a non-converted trial; the included storage quota's value and above-quota pricing; amounts and tiers for onboarding, migration, training, and configuration flat rates; the definition, scope, and price of premium support; the exact sell price and pack granularity for SMS within the 0.30–0.50 MAD corridor; the delinquency period before switching to read-only; pricing terms applicable to the DEC-35 pilots | PROJECT.md §11 (amounts not specified); DEC-23 (period not quantified); DEC-35 (pilot terms not specified) |
| OQ-07 | Payment methods and collection terms for the ZSchool subscription invoice paid by the school (transfer, direct debit, reminders): not specified by the baseline; to be explicitly distinguished from families' payment methods (DEC-31), which concern only schools' own collections | PROJECT.md §11; DEC-31 |
| OQ-08 | Tax treatment and notices on the ZSchool subscription invoice (whether SaaS is subject to VAT, mandatory notices, e-invoicing once the DGI rollout reaches this stage): the baseline only rules on schools' tuition-fee taxation (H-07); to be confirmed by a tax advisor before commercial launch | PROJECT.md §2.7 (H-07, H-08); correction #15 (e-invoicing: B2B first, decree not published) |
| OQ-09 | EUR→MAD conversion method for re-billing WhatsApp conversations (reference rate, conversion date, rounding): since no exchange rate is sourced in the research, the method is a parameter to define | `prd/research/03-payments-communications.md` §4 (Meta rates in euros); PAK-10 |
| OQ-11 | Horizon for the DEC-27 targets (20 schools and 15,000 students "end of year 1", 300 and 200,000 "at three years") read from the 2028 commercial launch (JAL-11), i.e. a two-year shift from the founder's literal reading | **Escalated — ESC-01, ARB-06**: working hypothesis kept in §9.1; a founder decision is required (how to read DEC-27, or compress the roadmap), register `prd/cross-cutting/40-assumptions-open-questions-tracker.md` |
| OQ-10 | Annual price stability of the unit price: the rule in §2.3 and PAK-03 (a price contractually stable for the current school year, any revision taking effect the following year, consistent with the spirit of Law 59.21 — baseline §2.7) must be confirmed in review and reflected in the subscription contract and the public price list | PAK-03; PROJECT.md §2.7; `prd/research/02-regulatory-data.md` §1 (Law 59.21) |

---

## Traceability

| Baseline/source ID | Coverage in this file |
|---|---|
| DEC-13 | PAK-01, PAK-04, PAK-05, PAK-08; §2.1, §3, §4, §5 |
| DEC-27 | §9.1 (targets, derived calculations), §9.2 |
| DEC-28 | PAK-02, PAK-03, PAK-05, PAK-06, PAK-09, PAK-10, PAK-11, PAK-12, PAK-13, PAK-14, PAK-16; §2.2–§2.4, §5, §6, OQ-05 |
| DEC-35 | PAK-12, PAK-13; §9.2, OQ-06 |
| DEC-23 | PAK-07; §4.2, §7 |
| DEC-36 | PAK-09, PAK-10; §2.4, §5.1, §5.2 |
| DEC-31 | §2.4, §8.2, OQ-07 |
| DEC-02 | PAK-01, PAK-08; §2.1, §9.4 |
| DEC-12 | PAK-09, PAK-10; §5.1, §5.2 |
| G-24 | §1, §2 (resolution of baseline §11) |
| Q-09 | §9.1 |
| Q-10 | PAK-01, PAK-03; §2.1, §2.3 |
| Q-01 | §8 |
| H-01 | §9.1, OQ-01 |
| H-11 | §5.2 |
| H-20 | PAK-10, OQ-03 |
| H-22 | PAK-12, PAK-13, PAK-15; §6, §9.3, OQ-02 |
| RG-08 | PAK-04, PAK-08 (uniqueness of the active enrollment) |
| PROJECT.md §11 | File objective (§1), §2 to §7, §9, §10 |
| PROJECT.md §12 | Version tags of PAK-01 to PAK-16; OQ-05; D1 deviation: PAK-10's limited MVP usage (OQ-03 of `prd/cross-cutting/35-external-integrations.md`) |
| PROJECT.md §3.3 | §2.3, §8.1, §8.2, PAK-16 |
| PROJECT.md §2.1 | §8.1, §9.1, OQ-01 |
| PROJECT.md §2.7 | §2.3 (price stability, spirit of Law 59.21), §4.3, OQ-08 |
| PROJECT.md §2.8, §7.7 | §2.4 (Fatourati, no fund holding), OQ-07 |
| PROJECT.md §8.1 | PAK-14 |
| `prd/research/00-baseline-corrections.md` #1 | §3 (counting timezone) |
| `prd/research/00-baseline-corrections.md` #6 | PAK-10, OQ-03; §5.2 |
| `prd/research/00-baseline-corrections.md` #9 | §8.1, §9.1, OQ-01 |
| `prd/research/00-baseline-corrections.md` #20 | PAK-15, OQ-02; §6, §9.3 |
| `prd/research/01-market-competition.md` §1 | §9.1 |
| `prd/research/01-market-competition.md` §2 | PAK-09, PAK-16; §2.2, §7, §8.1, §8.2 |
| `prd/research/01-market-competition.md` §3, §5 | §8.1 |
| `prd/research/01-market-competition.md` §4 | §8.2, OQ-01 |
| `prd/research/02-regulatory-data.md` §9 | PAK-15; §6, §9.3, OQ-02 |
| `prd/research/03-payments-communications.md` §4 | PAK-10; §2.3, §5.2, OQ-03, OQ-09 |
| `prd/research/03-payments-communications.md` §5 | PAK-09; §2.3, §5.1 |
| `prd/03-domain-data-model.md` (`Subscription`, `Plan`, `ModuleActivation`, `UsageMetric`) | PAK-02, PAK-04, PAK-07; §3, §4.2 |
| `prd/03-domain-data-model.md` INV-05 | PAK-04, PAK-08; §3 |
| `prd/03-domain-data-model.md` INV-38 | PAK-07; §4.2 |
| `prd/03-domain-data-model.md` OQ-05 | PAK-04, OQ-04 |
| `prd/02-actors-personas.md` (BES-DIR-01/02/04) | §2.1, §9.4 |
| `prd/journeys/00-journey-map.md` PC-03 | PAK-12; §4.1, §6, §9.5 |
| `prd/journeys/00-journey-map.md` PC-07, PC-11 | §4.3, §5.1, §5.2, §9.5 |
| `prd/cross-cutting/32-non-functional-requirements.md` (NFR-SAV, NFR-DISP, NFR-PERF) | PAK-14; §8.2, §6 |
| `prd/cross-cutting/35-external-integrations.md` | §2.4, §5.1, §5.2 |
| `prd/cross-cutting/36-legal-compliance-data-protection.md` | §5.2 |
| `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`, `prd/cross-cutting/38-kpi-success-metrics.md` | §9.1 |
| ARB-01 (MVP scope; consolidated read-only organization) | §3 (rule 8), PAK-11 |
| ARB-06 (DEC-27 horizon escalated, ESC-01) | §9.1; OQ-11 |
| ARB-20c (transfer counted at origin; import activation) | §3 (rule 8); OQ-04 |
| ARB-21h (authentication SMS as a platform cost) | §5.1; PAK-17 |
| ARB-25o (storage quota) | §2.3, §5.3; PAK-11 |
| NFR-DISP-06 (standard support) | §6; PAK-14 |
