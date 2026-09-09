> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-CC-04                                                  |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification — Cross-cutting                      |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/cross-cutting/33-business-model-packaging.md` (v0.3), old `PAK-01..17` -> `PAK-ZS-001..017`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Business Model and Packaging

## 1. Objective and scope

This file sets ZSchool's business model and packaging: who pays, how much, on which unit and cadence, what is included, what is billed separately, and how the offer positions against the market. It translates the historical baseline's business-model chapter (`spec/appendices/00-project-baseline.md` §11) and decisions [ADR-ZS-024](../decisions/024-school-is-the-paying-customer.md), [ADR-ZS-008](../decisions/008-growth-ambition-horizon.md), [ADR-ZS-009](../decisions/009-single-plan-pricing.md), and [ADR-ZS-035](../decisions/035-pilot-school-profiles.md).

In scope for this file:

- the paying customer and free end users ([ADR-ZS-024](../decisions/024-school-is-the-paying-customer.md));
- the single all-inclusive plan and reference price ([ADR-ZS-009](../decisions/009-single-plan-pricing.md));
- the billing unit: a measurable definition of "active student" and the counting rule;
- monthly billing in MAD, the subscription lifecycle, the free trial;
- consumables (SMS, WhatsApp conversations, storage) and their sourced pricing references;
- professional services (onboarding, migration, training, configuration, premium support);
- price positioning against documented competitors;
- commercial targets ([ADR-ZS-008](../decisions/008-growth-ambition-horizon.md)), pilots ([ADR-ZS-035](../decisions/035-pilot-school-profiles.md)), the MOWAKABA subsidy, group billing.

Out of scope for this file:

- billing families through the school (fee schedules, payment plans, payments, reminders): `spec/behaviors/07-finance-billing-collections.md`;
- the technical mechanics of the SMS, WhatsApp, and Fatourati channels: `spec/cross-cutting/06-external-integrations.md`;
- go-to-market milestones and detailed indicators: `spec/roadmap.md` and `spec/metrics.md`;
- the fate of personal data upon termination: `spec/domain-model.md` and `spec/behaviors/01-administration-onboarding-subscription.md`.

## 2. Business model principles

### 2.1 Paying customer and free end users

The paying customer is **the school**; for a school group, **the organization** subscribes ([ADR-ZS-024](../decisions/024-school-is-the-paying-customer.md), [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md)). Parents, students, and teachers pay nothing: no payment flow and no commercial offer is presented to them, including in the mobile apps. This free access is a foundational choice: it maximizes adoption of the parent, student, and teacher portals, which carry the global identity's network effect (needs URS-ZS-001/002/004 of `spec/urs.md`).

### 2.2 Single all-inclusive plan

A single active pricing plan includes every available module ([ADR-ZS-009](../decisions/009-single-plan-pricing.md)): administration, academics, attendance, assessments and report cards, communication, finance, timetable, documents, transfers, reporting — then, as they ship, transport, canteen, health, online payment, and the public API, activated at no extra cost via the `ModuleActivation` entity (`spec/domain-model.md`). There is no paid per-module option, no "Premium" edition, and no feature reserved for a higher tier: differentiation among competitors through nested editions (Skoolly Starter/Pro/Élite, Minassa Starter to Excellence+, SchoolMA Discovery/Enterprise — `prd/research/01-market-competition.md` §2) is explicitly avoided.

### 2.3 Price and billing cycle

| Item | Pricing rule | Source |
|---|---|---|
| Single-plan subscription | **5 MAD per active student per month**, billed over ten months (September to June), i.e. **50 MAD per student per school year**, all modules included | [ADR-ZS-009](../decisions/009-single-plan-pricing.md), confirmed by the founder on 09/09/2026; OQ-ZS-301 |
| Order of magnitude | 300 students = 1,500 MAD/month; 2,000 students = 10,000 MAD/month | `spec/appendices/00-project-baseline.md` §11 |
| SMS consumable | prepaid packs sold to the school in the **0.30–0.50 MAD per SMS** corridor (margin included); market pricing reference: alphanumeric sender ID ≈ 0.31–0.36 MAD per SMS in tiers of 5,000 to 100,000 | [ADR-ZS-009](../decisions/009-single-plan-pricing.md); `prd/research/03-payments-communications.md` §5 (bulksms.ma) |
| WhatsApp consumable | **configurable** re-billing grid by category and effective date; current reference: *utility* message ≈ **€0.0064** to +212; new "standalone rate card" for Morocco applicable from 10/01/2026 | `prd/research/03-payments-communications.md` §4; `spec/appendices/01-review-history.md` (correction #6) |
| Storage consumable | quota included in the subscription: 2 GB per school plus 5 MB per active student (working hypothesis [ADR-ZS-...](../decisions/) storage-quota decision, to be confirmed by the founder, OQ-ZS-296); tiered billing beyond that (pricing: a parameter, OQ-ZS-296) | `spec/appendices/00-project-baseline.md` §11 |
| Professional services | onboarding and data migration **at a flat rate**; training, advanced configuration, premium support billable (amounts: parameters to finalize, OQ-ZS-296) | `spec/appendices/00-project-baseline.md` §11; [ADR-ZS-009](../decisions/009-single-plan-pricing.md) |
| Trial | free, limited duration, with demo data | `spec/appendices/00-project-baseline.md` §11 |
| Public subsidies | onboarding, configuration, and training services targeted by the MOWAKABA program (80% for SMEs / 90% for micro-enterprises of cost, projects from 15,000 to 150,000 MAD); school eligibility to be confirmed | `prd/research/02-regulatory-data.md` §9 |

The 5 MAD price sits at the top of the observed Moroccan range (10 to 65 MAD per student per year — `spec/appendices/00-project-baseline.md` §3.3), with a markedly more complete offer than documented competitors: multi-school global identity, a single cross-school parent account, a parent app, Fatourati collections, all modules (detail in §8).

**Annual price stability** (logged in OQ-ZS-301): the subscription's unit price is contractually stable for the current school year; any revision takes effect the following year, consistent with the spirit of Law 59.21, which bars schools from raising fees mid-year.

### 2.4 What is always free

- Access for parents, students, and teachers to the platform and apps ([ADR-ZS-024](../decisions/024-school-is-the-paying-customer.md)).
- Free notification channels: in-app (MVP) and push (V1) notifications, the first channels in the routing hierarchy ([ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md); `prd/research/03-payments-communications.md` §4).
- The Fatourati connection in V1 ([ADR-ZS-031](../decisions/031-online-payment-rails.md)) carries **no charge billed by ZSchool**: the connection is part of the subscription and the school remains the creditor and beneficiary of the funds, with ZSchool never holding funds; the terms of the CMI rail (creditor/Aggregator/Collect contracts, non-public rates) remain to be obtained (OQ-ZS-296) and are outside ZSchool's own pricing.

## 3. Billing unit: a measurable definition of "active student"

The subscription is billed by **active student**, counted each month from September to June ([ADR-ZS-024](../decisions/024-school-is-the-paying-customer.md), [ADR-ZS-009](../decisions/009-single-plan-pricing.md)). This file proposes a measurable, auditable working definition:

1. **Counting date**: the 1st of each billing month, at midnight local `Africa/Casablanca` time (permanently UTC+0 since 09/20/2026).
2. **Counted student**: any student holding, at the billed school, at least one enrollment with status **ACTIVE** on the counting date.
3. **Students not counted**: enrollments with status CANDIDATE and PRE-ENROLLED (not yet admitted), SUSPENDED (a temporary measure that keeps the student-year pair but with no active service — an alternative is discussed in OQ-ZS-294), and the terminal statuses TRANSFERRED, WITHDRAWN, EXPELLED, COMPLETED (the state machine of `spec/domain-model.md`).
4. **No double counting**: only one ACTIVE enrollment is possible per (student, school year) pair across the entire platform ([INV-ZS-058](../invariants.md#inv-zs-058)); a single student can therefore never inflate the billable headcount of two schools, and an organization's consolidated invoice (PAK-ZS-001) is duplicate-free by construction.
5. **Mid-month entry or exit**: takes effect at the next count — a student who becomes ACTIVE on October 5 is billed starting in November; a student closed out on November 12 is still counted in November. No daily proration in the working rule; a prorated variant remains possible (OQ-ZS-294).
6. **Logging**: every monthly count is recorded in `UsageMetric` (`spec/domain-model.md`) with the date, the school, the headcount counted, and the rule version applied, as an append-only entry; it underlies the invoice and serves as the reference for any customer dispute.
7. **Transparency**: the principal's office can view the projected billable headcount for the current month and the counting history at any time; any enrollment status correction between two counts carries over to the next count, with no retroactive adjustment.
8. **Transfer between two ZSchool schools**: in the transfer month, the student is counted once, at the origin school (ACTIVE enrollment as of the 1st of the month); the receiving enrollment, activated mid-month, is counted starting the following month, per rule 5. An ACTIVE enrollment created via import activation (mid-year data migration) is counted as of the 1st of the month following its activation.

This rule is deliberately simple, predictable, and verifiable by the customer: a given month's invoice headcount is exactly the ACTIVE headcount observed on the 1st of that month.

## 4. Monthly billing and the subscription lifecycle

### 4.1 Subscription invoice

- A monthly invoice in **MAD** is issued for each school month (ten per year), in the name of the school or the organization.
- Amount = active-student headcount counted on the 1st of the month × 5 MAD. The invoice details the period, the headcount billed per school, the unit price, and the total; it can be viewed and printed from the subscription-management area.
- **No invoice is generated in July or August** ([ADR-ZS-009](../decisions/009-single-plan-pricing.md)); the subscription stays active with no amount due over the summer. These two months are the preferred window for onboarding new schools (`spec/journeys/00-journey-map.md` §4.1): a school onboarded in summer produces its first invoice on September 1.
- A subscription activated mid-month M produces its first invoice on the 1st of month M+1; no proration applies at start-up (working rule, OQ-ZS-294).
- **Case of the pilots** ([ADR-ZS-035](../decisions/035-pilot-school-profiles.md)): onboarded starting in February 2027 (RDM-ZS-001 of `spec/roadmap.md`), they are billed only for the remaining school months (five months, February to June 2027, i.e. ≈ 25 MAD per student for the 2026-2027 year). The commercial benchmark of 50 MAD per student per year assumes a full September-to-June subscription; any mid-year entry bills only the remaining months (counting rule §3, with no daily proration — OQ-ZS-294).

### 4.2 Lifecycle

The subscription's status is carried by the `Subscription` entity (`spec/domain-model.md`): **trial**, **active**, **past due**, **terminated** ([ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)).

- **Trial**: free, limited duration, with demo data (detail in §7).
- **Active**: normal regime, monthly billing per §4.1.
- **Past due**: switches to read-only after a configurable delinquency period (value to finalize, OQ-ZS-296); during read-only, viewing functions remain accessible to every role and writes are blocked; return to active follows settlement.
- **Termination**: full data export, 90 days of read-only access, deletion of operational data at 12 months, global identities and published documents retained ([ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md), [INV-ZS-045](../invariants.md#inv-zs-045)); the `SubscriptionSuspendedOrTerminated` event is fired.
- The payment methods a school uses to pay the subscription invoice (bank transfer, direct debit, other) are not specified by the baseline: OQ-ZS-297.

### 4.3 Accounting treatment of consumables

Consumables (SMS, WhatsApp, storage beyond the quota) and services are billed on separate lines from the subscription invoice, with their own usage records (§5), so the school can distinguish the fixed subscription from usage costs in its accounting (accounting-document retention: 10 years).

## 5. Consumables

Common principles: consumables are **optional** — the subscription remains fully functional without any pack; free channels are never conditioned on a purchase; consumption is measured, logged, and reported per school; it is always billed to the school, never to families ([ADR-ZS-024](../decisions/024-school-is-the-paying-customer.md)); per-school counters and threshold alerts (`prd/research/03-payments-communications.md` §5).

### 5.1 SMS

- Sales model: **prepaid packs** of SMS credits, credits with **no expiry** (a contractual model observed in the market), sold to the school self-service.
- Pricing reference: transactional SMS exclusively uses the **alphanumeric sender ID** (11 characters, premium routing), priced ≈ **0.31–0.36 MAD** per SMS in tiers of 5,000 to 100,000 sends at a Moroccan aggregator (`prd/research/03-payments-communications.md` §5, bulksms.ma). ZSchool's sell price sits in the **0.30–0.50 MAD** corridor per SMS with margin ([ADR-ZS-009](../decisions/009-single-plan-pricing.md)); the exact value and pack granularity are commercial parameters to finalize (OQ-ZS-296).
- **"LowCost" routing (≈ 0.05–0.10 MAD, variable mobile-number sender 06XX) is not used for transactional SMS**: unidentified sender, unsuited to school notifications. It is not part of the pack scope; a possible use for non-critical bulk alerts would be a separate V2+ evolution to study.
- Counters: per-school credit balance, configurable threshold alerts, SMS-channel blocking on a depleted balance **with no impact on free channels** (in-app notification, then push in V1) and an alert to the principal's office; traceability for every send (recipient, message template, outcome).
- Since no formal reseller program is published by Moroccan aggregators, ZSchool either operates a direct aggregator contract with pack sales or a proprietary account with re-billing; the technical choice is covered by `spec/cross-cutting/06-external-integrations.md`.
- **Authentication SMS** (login codes, MFA, reset, invitations and identity claims): these are never charged against a school's credits; it is a platform cost built into the subscription price and tracked as such (PAK-ZS-017).

### 5.2 WhatsApp conversations

- The WhatsApp channel — MVP usage limited to attendance notifications via WhatsApp utility (a founder arbitration; [INT-ZS-025](../cross-cutting/06-external-integrations.md) and OQ-ZS-293), generalized in V1 (all messages, managed templates, WhatsApp Business API) — is re-billed to the school per a **configurable pricing grid**: category (marketing, *utility*, authentication), amount per message, effective date. The grid is a product parameter, not a compiled constant: the market switched to per-message billing on 07/01/2025 and changes again on 10/01/2026.
- Current reference to +212: *utility* message ≈ **€0.0064**, *authentication* ≈ €0.0064, *marketing* ≈ €0.0357 (vendor BSP Messaggio, `prd/research/03-payments-communications.md` §4) — i.e. a *utility* message ≈ **8 times cheaper** than an alias SMS. These values serve as a sizing reference, not a contractual rate.
- **10/01/2026 switch**: the end of free *service* and *utility* messages within the 24-hour window, and Morocco's exit from "Rest of Africa" regional rates in favor of a **standalone rate card** (higher *utility* and *authentication* rates, plus *authentication-international*); the grids were expected to be published before 09/01/2026 — final values to be entered into configuration once published (OQ-ZS-293).
- **Inbound messages**: after 10/01/2026, parent replies within the 24-hour window become billable; they are counted in the school's consumption and shown in the report (`prd/research/03-payments-communications.md` §4).
- Safeguards: only Meta-approved *utility* templates are used (a message reclassified as *marketing* costs ≈ 5.6 times the *utility* rate); parental opt-in is required (Law 09.08 — compliance covered by `spec/cross-cutting/07-legal-compliance-data-protection.md`, integration by `spec/cross-cutting/06-external-integrations.md`); the push → WhatsApp *utility* → alias SMS routing hierarchy ([ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)) structurally limits the WhatsApp bill.
- EUR→MAD conversion for re-billing: reference rate and conversion date configured (OQ-ZS-299).

### 5.3 Document storage

- A **storage quota** is included in each school's subscription; consumption (documents, attachments, supporting files) is measured and continuously visible to the principal's office.
- Included quota (working hypothesis): 2 GB per school plus 5 MB per active student, i.e. roughly 3.5 GB for 300 students and 12 GB for 2,000 students; beyond that, consumption is billed in tiers; the final quota value and above-quota pricing remain to be confirmed by the founder (OQ-ZS-296).
- Before exceeding the quota, preventive alerts (configurable thresholds) and an upgrade offer; no blocking of critical functions (viewing existing documents, report cards) while an overage awaits billing.

## 6. Professional services

| Service | Content | Pricing | Version |
|---|---|---|---|
| Onboarding | Creating the tenant, initial configuration (legal identity, languages, channels), instantiating the national structure model, assisted Excel imports with duplicate checking, internal users and roles (journey JMP-ZS-003 of `spec/journeys/00-journey-map.md`) | Flat rate by headcount tier (amounts: parameters, OQ-ZS-296) | MVP |
| Data migration | Importing existing data (students, parents, classes, balances) from Excel or the previous tool, with a validation report | Flat rate, standalone or bundled with onboarding | MVP |
| Training | Training for teams (principal's office, registrar's office, student life, teachers), bilingual FR/AR materials | Per session or flat rate (parameters, OQ-ZS-296) | MVP (pilots); catalog offer in V1 |
| Advanced configuration | Complex fee schedules, report-card templates, timetable variants, message templates | Per session | V1 |
| Premium support | Beyond the included standard support ([NFR-ZS-014](../cross-cutting/03-non-functional-requirements.md): single channel, business hours, first response within 4 business hours for a blocker): dedicated channel, stronger response-time commitments; exact definition and pricing: parameters (OQ-ZS-296) | Subscription or annual flat rate | V1 |

Onboarding, configuration, and training services are the expenses targeted by the MOWAKABA subsidy program (§9.3): they are therefore billed with formal quotes, a prerequisite for the subsidy application (procedure: ICE + quote + online filing — `prd/research/02-regulatory-data.md` §9).

## 7. Free trial with demo data

- The trial is **free, of limited duration** (duration: commercial parameter to finalize, OQ-ZS-296), with a preloaded **demo dataset**: a model national academic structure, classes, fictional students, a few assessments and report cards — enough to explore every module without prior data entry.
- During the trial, the school can enter its own data and import its files; the exact scope of consumables during the trial (whether SMS/WhatsApp sends are allowed) is to be settled (OQ-ZS-296).
- **Conversion**: upon subscribing, the subscription switches to active status, demo data is deleted, data entered by the school is kept, and monthly billing starts on the 1st of the following month (§4.1).
- After a trial that does not convert: the tenant's fate (retention period before deletion, possible export) follows the termination cycle ([ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)); detail to be settled (OQ-ZS-296).
- The trial is a direct response to market practice (Skoolly: 30-day trial; SchoolApp: one-month trial — `prd/research/01-market-competition.md` §2) and lowers the perceived risk for principals currently equipped with Excel files.

## 8. Price positioning and competition

### 8.1 Observed public rates (as of 09/09/2026)

Every value in this table comes from `prd/research/01-market-competition.md` (§2 for Moroccan players, §3 for international ones), except where noted as from the baseline.

| Solution | Observed public rate | Notes |
|---|---|---|
| **ZSchool (target)** | **5 MAD per active student per month; 50 MAD per student per school year (10 months), all inclusive** | `spec/appendices/00-project-baseline.md` §11; [ADR-ZS-009](../decisions/009-single-plan-pricing.md) |
| Skoolly | 4, 5, or 6 MAD per student per month depending on edition (Starter, max 100 students; Pro unlimited with HR, admissions, payments; Élite with AI and multi-school support); 10% discount on annual payment; 30-day trial; cited example: 200 students on Pro = 1,000 MAD/month | Equivalent to 40–60 MAD per student over 10 months (derived calculation, no external source); Play Store app owned by an Indian developer; no visible Massar integration |
| Minassa | 249 MAD/month (0–100 students) to 1,050 MAD/month (601–800 students); + 99 MAD/month per 50-student tier; groups on quote | i.e. 1.3 to 2.5 MAD per student per month (sourced figure, `prd/research/01-market-competition.md` §2) |
| SchoolMA | Free demo (≤ 10 students); Discovery 300 MAD/month (≤ 50 students, 1 GB); Enterprise 800 MAD/month unlimited (50 GB, HR payroll, GPS transport, unlimited WhatsApp) | 300 MAD for 50 students = 6 MAD/student/month at the tier's maximum (derived calculation) |
| Madariss Plus / eMadariss (Nexsoft) | Promotion "starting at 6,800 MAD/year" (promotional page) | Locally installed software at the school (Madariss Plus) or web via subdomain (eMadariss); white-label apps per school; no cross-school parent account |
| Tayssir School | BASIC free forever (unlimited students, 2 administrators); PREMIUM on quote | ~50 schools claimed; "bidirectional Massar sync" claimed, publicly unverifiable (no documented Massar API) |
| DataSchool, SchoolApp, E-Schools, SmartSchool, ALIFADA | Prices not published (on quote) | 2 out of 6 players publish prices in the Moroccan SaaS segment (`prd/research/01-market-competition.md` §2) |
| E-Madrassati | 1,950 MAD excl. VAT/year (promotion "instead of 4,950") | Page dated 12/2023, weak sign of 2025-2026 activity |
| Galactis.Education | Essentials €5/student/year; Collaboration €1; Campus €2; e-learning €2–15; HR €20/employee/year; Express edition 5,000 MAD/year | SaaS targeting Morocco, **hosted in the United States** — at odds with the local-hosting expectation ([ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md)) |
| Pronote (Index Éducation) | Licenses €572–1,055 excl. VAT/year depending on teacher count + hosting €330–993, i.e. ≈ €2,000 excl. VAT/year for an unlimited hosted offer (2023 rates); paid export API (€140 excl. VAT/year) | ~80 Moroccan schools; does not cover billing; positioned for the French curriculum stream and bilingual groups |
| Classter (international benchmark) | ≈ $24/student/year + onboarding | Calibration benchmark, `prd/research/01-market-competition.md` §5 |

Baseline summary: Moroccan public prices sit between **10 and 65 MAD per student per year**; full-featured French offers around **€15 per student per year** (`spec/appendices/00-project-baseline.md` §3.3).

### 8.2 Competitive reading

- **Price position**: at 50 MAD per student per year, ZSchool sits at the top of the Moroccan range (10–65 MAD), on par with Skoolly Pro (4–6 MAD/month) and markedly above Minassa (1.3–2.5 MAD/student/month). The price is justified by the content: multi-school global identity, a single cross-school parent account, a portable teacher profile, Fatourati collections, all modules included — where no documented player offers global identity.
- **Sub-300-student segment**: below 300 students, some competing plans remain arithmetically cheaper (e.g. Minassa 249 MAD/month for 0–100 students, versus 750 MAD/month for 150 students at ZSchool); the commercial target ([ADR-ZS-030](../decisions/030-positioning-and-primary-target.md): 300-to-3,000-student schools on the Casablanca–Kenitra corridor) does not cover this segment. The sales pitch does not compare prices head-on there: it shifts to multi-school global identity and services (next points).
- **Documented structural differences** (`prd/research/01-market-competition.md` §2, common market traits): competitors are single-school (except group offers on quote); their "Massar sync" relies on files, never a documented API; none integrate Moroccan payment rails (CMI/Fatourati absent from product messaging); pricing is opaque (2 of 6 players publish prices); actual app adoption is low (installs on the order of 1,000 for most apps; best-installed parent app: DataSchool, 10,000+); no integrated WhatsApp messaging product.
- **Ministry apps**: Massar (Moutamadris, Waliye, Moudaris) is mandatory and free but offers no billing, transport, canteen, or communication; last updated in 2022; the baseline cites ratings of 2 to 2.9/5, research finds 3.1/5 for Moutamadris (~7,060 reviews) with unchanged dominant complaints (login failures, blank screens, unavailability) — divergence logged in OQ-ZS-291.
- **Reliability expectation**: connection reliability is the #1 complaint about parent apps (`prd/research/01-market-competition.md` §4); the 5 MAD price is underpinned by a higher quality bar ([NFR-ZS](../cross-cutting/03-non-functional-requirements.md) DISP and PERF domains).
- **Price transparency**: publishing the price list (PAK-ZS-016) is a direct differentiator in a market where pricing is mostly opaque (`prd/research/01-market-competition.md` §2).
- What is **forbidden** in sales messaging: any market figure not sourced from the research files or the baseline, any unsubstantiated quality comparison, any promise of MOWAKABA eligibility before verification (OQ-ZS-292), any promise of Massar sync beyond the file-based channel.

## 9. Commercial targets and levers

### 9.1 Reference targets ([ADR-ZS-008](../decisions/008-growth-ambition-horizon.md), confirmed by the founder on 09/09/2026)

| Horizon | Schools | Students | Annual subscription revenue at full run rate (derived calculation: headcount × 50 MAD, no external source) |
|---|---|---|---|
| End of year 1 | 20 | 15,000 | 750,000 MAD (15,000 × 50) |
| End of year 3 | 300 | 200,000 | 10,000,000 MAD (200,000 × 50) |

The "end of year 1" horizon is anchored in the calendar by `spec/roadmap.md` (RDM-ZS-009, OQ-ZS-291): a **working hypothesis** adopted by the spec, it designates the end of the 2028-2029 school year, the first full year of general rollout — not 2026-2027, which is the pilot year. This reading pushes the targets confirmed by the founder on 09/09/2026 back by two years; it is **escalated to the founder** as a blocking question ([ADR-ZS-072](../decisions/072-dec27-horizon-confirmation-escalated.md), historical alias ESC-01, superseding [ADR-ZS-047](../decisions/047-dec27-horizon-escalated.md)): either the reference targets are read from the commercial launch onward (2029 and 2031), or the roadmap must be compressed. This chapter's business case ([NFR-ZS-046](../cross-cutting/03-non-functional-requirements.md), capacity sizing) is unaffected by the choice.

Year 1: pilots then the Casablanca–Kenitra corridor ([ADR-ZS-008](../decisions/008-growth-ambition-horizon.md)). Three-year technical capacity sizing (500 schools, 500,000 students) covers roughly 2.5 times the commercial ambition. The market leaves room: 7,564 private schools (2023-2024), 70% of them on the Casablanca–Kenitra corridor, 1.2 to 1.3 million private-school students (~15%) — figures corrected by research (`prd/research/01-market-competition.md` §1; divergence from the original baseline description logged in OQ-ZS-291). At the baseline rate, the private-school base represents a theoretical potential of 60 to 65 million MAD per year (derived calculation: 1.2–1.3M × 50 MAD); this gross potential does not factor in any penetration assumption and must not be presented as a forecast.

Progress against these targets is measured by the indicators of `spec/metrics.md` (active schools, billed active students, subscription revenue); go-to-market milestones are carried by `spec/roadmap.md`.

### 9.2 Pilots ([ADR-ZS-035](../decisions/035-pilot-school-profiles.md), confirmed by the founder on 09/09/2026)

Four representative profiles on the Casablanca–Rabat corridor, which set the order of magnitude for invoices and onboarding effort:

| Pilot | Headcount | Expected monthly invoice at 5 MAD (derived calculation from the baseline rate; 300 and 2,000 students cited in `spec/appendices/00-project-baseline.md` §11) |
|---|---|---|
| Primary school | ≈ 300 students | 1,500 MAD/month |
| Middle-and-high school | ≈ 800 students | 4,000 MAD/month |
| Multi-site group | > 2,000 students | > 10,000 MAD/month (billed at the organization level, PAK-ZS-001) |
| Bilingual school on a trimester calendar | headcount not specified by the baseline | billing identical to the active headcount; the trimester calendar does not change the counting rule |

Pricing terms applicable to the pilots (full price, discount, or free) are not fixed by the baseline: to be settled before launch (OQ-ZS-296).

### 9.3 MOWAKABA subsidy as a sales lever

The MOWAKABA program (Maroc PME / Morocco Digital 2030) covers **80% of digitalization cost for an SME, 90% for a micro-enterprise**, on projects of **15,000 to 150,000 MAD**; eligible expenses are **services** (business software, deployment, training) via **listed vendors**; procedure: ICE + quote + online filing; approval in 4 to 6 weeks; disbursement after delivery (`prd/research/02-regulatory-data.md` §9).

Commercial implementation (PAK-ZS-015):

- assembling a turnkey MOWAKABA application covering eligible services (onboarding, configuration, training — PAK-ZS-012, PAK-ZS-013), with formal quotes;
- **project start decoupled from disbursement**: the project starts without waiting for approval (4 to 6 weeks) or the disbursement that follows delivery;
- **no firm commitment on eligibility** until private schools' eligibility is confirmed (one source restricts the program to the industrial sector or related activities): systematic verification with the Maroc PME regional office before any commitment (OQ-ZS-292);
- listing ZSchool as a vendor under the program (OQ-ZS-292);
- the subsidy covers services, not the subscription: the correct sales message is "up to 80–90% of start-up services covered subject to eligibility", never "the platform is subsidized".

### 9.4 Billing school groups

For an organization ([ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md), V1), a consolidated invoice aggregates the active headcounts of every affiliated school, with a breakdown per school; uniqueness of the active enrollment platform-wide ([INV-ZS-058](../invariants.md#inv-zs-058)) guarantees no double counting. This is a direct selling point for multi-site groups (Si Abdellah, 1,800 students across three sites; need URS-ZS-004).

### 9.5 Other levers from the baseline

Network effects from multi-school parents and part-time teachers, referrals between principals, partnerships (school insurers, transporters, banks for payment). Commercial seasonality follows the school year: an onboarding window from April to August (`spec/journeys/00-journey-map.md` JMP-ZS-003), no billing in July-August ([ADR-ZS-009](../decisions/009-single-plan-pricing.md)), consumables ramping up at the start of the school year (JMP-ZS-005, JMP-ZS-011).

## 10. Requirements

| ID | Title | Priority |
|---|---|---|
| PAK-ZS-001 | Restrict the paying customer to the school or the organization | Must |
| PAK-ZS-002 | Provide a single all-inclusive plan with no per-module option | Must |
| PAK-ZS-003 | Apply the single price of 5 MAD per active student per month | Must |
| PAK-ZS-004 | Count the active student per a measurable, auditable rule | Must |
| PAK-ZS-005 | Bill monthly in MAD from September to June, never in July or August | Must |
| PAK-ZS-006 | Deliver a detailed, retained subscription invoice | Must |
| PAK-ZS-007 | Manage the subscription lifecycle, from trial to termination | Must |
| PAK-ZS-008 | Bill the organization with a consolidated invoice for groups | Must |
| PAK-ZS-009 | Sell transactional SMS in prepaid, alias-priced packs | Must |
| PAK-ZS-010 | Re-bill WhatsApp conversations per a configurable grid | Must |
| PAK-ZS-011 | Measure and bill storage beyond the included quota | Should |
| PAK-ZS-012 | Sell onboarding and data migration at a flat rate | Must |
| PAK-ZS-013 | Offer training and advanced configuration as billable services | Should |
| PAK-ZS-014 | Offer billable premium support beyond standard support | Should |
| PAK-ZS-015 | Assemble MOWAKABA subsidy applications for eligible services | Should |
| PAK-ZS-016 | Publish an up-to-date public price list | Could |
| PAK-ZS-017 | Treat authentication SMS as a platform cost | Must |

### PAK-ZS-001: Restrict the paying customer to the school or the organization

> **See:** [ADR-ZS-024](../decisions/024-school-is-the-paying-customer.md), [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: The subscription MUST be taken out, billed, and paid by the school or, for a
             group, by the organization. No paid feature, no purchase flow, and no commercial
             offer MUST be presented to parents, students, or teachers, on web or mobile.

Actors: principal's office, organization administrator, ZSchool (operator); parents, students, teachers (free beneficiaries).

### PAK-ZS-002: Provide a single all-inclusive plan with no per-module option

> **See:** [ADR-ZS-009](../decisions/009-single-plan-pricing.md)
> **Priority:** Must
> **Version:** MVP (principle); no-extra-cost activation of V2+ modules follows their release (V2+)
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: Only one pricing plan MUST be active on the platform. Every available module MUST
             be included: MVP and V1 modules at their respective launch, later modules
             (transport, canteen, health, online payment, public API) as they ship, activated
             via `ModuleActivation` at no extra cost and no sales process. No edition, no
             per-module add-on, no feature MUST be capped by a subscription tier.

Actors: principal's office, organization administrator, ZSchool (operator).

### PAK-ZS-003: Apply the single price of 5 MAD per active student per month

> **See:** [ADR-ZS-009](../decisions/009-single-plan-pricing.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: The subscription price MUST be 5 MAD per active student per month, billed over ten
             months (September to June), i.e. 50 MAD per student per school year, all modules
             included. The price MUST be displayed on the public price list and carried in the
             subscription contract; it MUST be stable for the current school year (§2.3,
             OQ-ZS-301). Contractual examples: 300 students = 1,500 MAD/month; 2,000 students =
             10,000 MAD/month.

Actors: principal's office, organization administrator, ZSchool (operator).

### PAK-ZS-004: Count the active student per a measurable, auditable rule

> **Invariant:** [INV-ZS-058](../invariants.md#inv-zs-058)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-480`](../../features/cross-cutting/pak/pak-zs-004-counting-the-active-student.feature)

REQUIREMENT: Monthly active-student counting MUST apply the rule in §3: a snapshot at midnight
             local `Africa/Casablanca` time on the 1st of the billing month; counted = ACTIVE
             enrollments; not counted = CANDIDATE, PRE-ENROLLED, SUSPENDED, and terminal
             statuses; uniqueness MUST be guaranteed by INV-ZS-058; mid-month entries and exits
             MUST take effect at the next count; every count MUST be logged append-only in
             `UsageMetric` (date, school, headcount, rule version). The principal's office MUST
             be able to view the projected billable headcount for the month and the counting
             history.

Actors: principal's office, organization administrator, ZSchool (operator).

### PAK-ZS-005: Bill monthly in MAD from September to June, never in July or August

> **See:** [ADR-ZS-009](../decisions/009-single-plan-pricing.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-481`](../../features/cross-cutting/pak/pak-zs-005-monthly-subscription-billing.feature)

REQUIREMENT: A subscription invoice in MAD MUST be issued for each of the ten school months
             (September to June); its amount MUST be the active-student headcount counted on
             the 1st of the month multiplied by 5 MAD. No invoice MUST be generated in July or
             August; an active subscription MUST carry no amount due over the summer. A
             subscription activated mid-month M MUST produce its first invoice on the 1st of
             the following month.

Actors: principal's office, school accounting, organization administrator, ZSchool (operator).

### PAK-ZS-006: Deliver a detailed, retained subscription invoice

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: Every invoice MUST identify the customer (school or organization), the billing
             period, the headcount billed per school, the unit price, the total in MAD, and
             MUST separate subscription lines from consumables (§5) and services (§6). Invoices
             MUST be viewable, downloadable, and retained in the subscription-management area;
             the exact tax notices on the ZSchool invoice are handled in OQ-ZS-298.

Actors: principal's office, school accounting, organization administrator, ZSchool (operator).

### PAK-ZS-007: Manage the subscription lifecycle, from trial to termination

> **Invariant:** [INV-ZS-045](../invariants.md#inv-zs-045)
> **See:** [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-482`](../../features/cross-cutting/pak/pak-zs-007-converting-a-trial-to-a-subscription.feature)

REQUIREMENT: The subscription MUST carry the statuses trial, active, past due, terminated (the
             `Subscription` entity, `spec/domain-model.md`). The trial MUST be free, of limited
             duration, with demo data (§7). Switching to past-due MUST trigger read-only after
             a configurable delay (viewing open, writes blocked); settlement MUST restore
             active status. Termination MUST apply the export/retention timeline of
             INV-ZS-045: full export, 90 days of read-only, deletion of operational data at 12
             months, global identities and published documents retained. Every
             trial-to-past-due-to-terminated transition MUST be notified (event
             `SubscriptionSuspendedOrTerminated`). Functional owner:
             `spec/behaviors/01-administration-onboarding-subscription.md`.

Actors: principal's office, ZSchool (operator).

### PAK-ZS-008: Bill the organization with a consolidated invoice for groups

> **Invariant:** [INV-ZS-058](../invariants.md#inv-zs-058)
> **Priority:** Must
> **Version:** V1 (multi-school organizations)
> **Acceptance:** [`@REQ-ZS-483`](../../features/cross-cutting/pak/pak-zs-008-consolidated-invoice-for-a-school-group.feature)

REQUIREMENT: For an organization grouping several schools (V1), monthly billing MUST produce a
             consolidated invoice: a total at the organization level, with a breakdown per
             school (headcount billed, amount). Per-school counting MUST rely on PAK-ZS-004;
             uniqueness of the active enrollment platform-wide (INV-ZS-058) MUST rule out any
             double counting. The group administrator MUST receive the invoice and the
             breakdown.

Actors: organization administrator, each school's principal's office, ZSchool (operator).

### PAK-ZS-009: Sell transactional SMS in prepaid, alias-priced packs

> **See:** [ADR-ZS-009](../decisions/009-single-plan-pricing.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-484`](../../features/cross-cutting/pak/pak-zs-009-managing-the-sms-credit-balance.feature)

REQUIREMENT: SMS MUST be sold to the school in prepaid packs, credits with no expiry, purchased
             self-service. The per-SMS sell price MUST sit in the 0.30–0.50 MAD corridor with
             margin (exact value and pack granularity: parameters, OQ-ZS-296). Transactional
             SMS MUST exclusively use the alphanumeric-sender-ID alias; LowCost routing MUST
             NOT be used for transactional messages. Every school MUST have a credit balance,
             configurable threshold alerts, and a tracked send history; on a depleted balance,
             the SMS channel MUST be suspended for non-critical sends — except a configurable
             emergency queue, aligned with INT-ZS-020 — with no impact on free channels (in-app
             notification, push in V1), and an alert MUST be sent to the principal's office.

Actors: principal's office, registrar's office, head supervisor (senders), parents (recipients, free), ZSchool (operator).

### PAK-ZS-010: Re-bill WhatsApp conversations per a configurable grid

> **See:** [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** V1 (generalized WhatsApp, full re-billing grid); MVP usage limited to attendance notifications (OQ-ZS-293)
> **Acceptance:** [`@REQ-ZS-485`](../../features/cross-cutting/pak/pak-zs-010-whatsapp-pricing-switch.feature)

REQUIREMENT: WhatsApp conversations MUST be re-billed to the school per a pricing grid stored
             as a parameter: category (marketing, *utility*, authentication), amount per
             message, effective date. The grid MUST incorporate the current reference (*utility*
             ≈ €0.0064 to +212) and, from 10/01/2026, Morocco's standalone rate card; final
             values MUST be entered once Meta publishes them (OQ-ZS-293). From 10/01/2026
             onward, inbound messages MUST be counted in consumption. A monthly report by
             category and by school MUST underlie billing; EUR→MAD conversion MUST be
             configured (OQ-ZS-299).

Actors: principal's office, ZSchool (operator); parents (senders of inbound replies, free).

### PAK-ZS-011: Measure and bill storage beyond the included quota

> **Priority:** Should
> **Version:** MVP (quota and counting); V1 (billing an overage)
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: An included storage quota MUST be attached to every school's subscription;
             consumption MUST be measured continuously and visible to the principal's office.
             Preventive alerts (configurable thresholds) MUST precede an overage; the overage
             MUST be billed in tiers on lines separate from the invoice. Viewing existing
             documents and report cards MUST NOT be blocked by an overage awaiting billing.
             Included quota (working hypothesis): 2 GB per school plus 5 MB per active student;
             pricing beyond that: a parameter to finalize (OQ-ZS-296).

Actors: principal's office, ZSchool (operator).

### PAK-ZS-012: Sell onboarding and data migration at a flat rate

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: Onboarding (creating the tenant, initial configuration, instantiating the
             structure model, assisted Excel imports with duplicate checking, internal users
             and roles — journey JMP-ZS-003) and data migration MUST be services billed at a
             flat rate by headcount tier (amounts: parameters, OQ-ZS-296). Each flat-rate
             package MUST have defined deliverables: an operational tenant, an instantiated
             structure, imports validated by a check report, trained internal users. Formal
             quotes issued for these services are used for the MOWAKABA application
             (PAK-ZS-015).

Actors: principal's office, registrar's office, ZSchool (operator).

### PAK-ZS-013: Offer training and advanced configuration as billable services

> **Priority:** Should
> **Version:** MVP (pilots, hands-on support); catalog offer in V1
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: Team training (principal's office, registrar's office, student life, teachers),
             with bilingual FR/AR materials, and advanced configuration (complex fee schedules,
             report-card templates, timetable variants, message templates) MUST be offered as
             billable services, per session or at a flat rate (amounts: parameters,
             OQ-ZS-296). During the pilot phase, basic training accompanies onboarding (§6).

Actors: principal's office, school staff, ZSchool (operator).

### PAK-ZS-014: Offer billable premium support beyond standard support

> **See:** [NFR-ZS-014](../cross-cutting/03-non-functional-requirements.md)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: Standard support (single channel, business hours, first response within 4 business
             hours for a blocker, FR/AR response, NFR-ZS-014) MUST be included in the
             subscription. A billable premium offer MUST provide a dedicated channel and
             stronger response-time commitments; its precise definition (scope, hours,
             commitments, pricing) is a commercial parameter to finalize (OQ-ZS-296). Any
             support access to a school's data remains governed by the logged procedure.

Actors: principal's office, ZSchool (operator).

### PAK-ZS-015: Assemble MOWAKABA subsidy applications for eligible services

> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: For any school that requests it, ZSchool MUST prepare the MOWAKABA digitalization
             subsidy application covering eligible services (onboarding, configuration,
             training): formal quotes, a project description, online filing (ICE + quote +
             application procedure), tracking approval (4 to 6 weeks) and disbursement after
             delivery. Reference rates are 80% of cost for an SME and 90% for a micro-enterprise,
             on projects of 15,000 to 150,000 MAD. No eligibility commitment MUST be made until
             private schools' eligibility is confirmed (prior verification with the regional
             office, OQ-ZS-292); the project's start MUST NEVER be conditioned on the subsidy's
             disbursement.

Actors: principal's office, ZSchool (operator), Maroc PME regional office (third party).

### PAK-ZS-016: Publish an up-to-date public price list

> **Priority:** Could
> **Version:** V1
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: The public price list MUST show the subscription price (5 MAD per active student
             per month), the consumables reference (SMS corridor, WhatsApp re-billing method,
             above-quota storage principle), and the list of billable services, with dated
             updates.

Actors: principal's office (reader), ZSchool (operator).

### PAK-ZS-017: Treat authentication SMS as a platform cost

> **See:** [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** none (no dedicated scenario)

REQUIREMENT: SMS sent for account authentication and security (login codes, second factor,
             reset, number change, invitations and identity claims) MUST NEVER be deducted from
             a school's SMS credits or billed to families: they MUST be treated as a platform
             cost covered by the subscription price. ZSchool MUST measure them separately
             (monthly volume, aggregator unit cost, per-school share for reference) to track
             subscription margin and feed the annual pricing review; a sizing benchmark comes
             from the number of active accounts (two guardians per student on average, MFA for
             privileged roles, 90-day trusted devices limiting repeated OTPs — SEC-ZS-005,
             SEC-ZS-006). Authentication sends remain subject to rate limiting (SEC-ZS-011,
             SEC-ZS-003).

Actors: ZSchool (operator); principal's office (informational).

---

Open questions for this chapter are tracked in `spec/open-questions.md` (built in a later phase). Full cross-reference traceability is consolidated in `spec/traceability.md` (built in a later phase).
