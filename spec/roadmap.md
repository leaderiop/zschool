# ZSchool Roadmap

> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-RMP                                                    |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Planning                                                       |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/cross-cutting/37-roadmap-mvp-v1-v2.md` (v0.3, English translation); `JAL-NN` renamed `RDM-ZS-NNN`; review arbitrations ADR-ZS-041, ADR-ZS-043, ADR-ZS-047, ADR-ZS-062, ADR-ZS-066, ADR-ZS-042, and the escalated founder decisions ADR-ZS-071/072/073, carried over as-is (CCR-ZS pending) |

---

## Current state

This roadmap describes **product milestones** (`RDM-ZS-NNN`), not engineering CI
state — ZSchool has no source code, build pipeline, or test suite yet, so a
qadi-style pass/fail gate table does not apply here. As of this document's
effective date, the product is at milestone **RDM-ZS-011 — Freeze the MVP
scope and start development** (target window: October 2026), which is itself
blocked on three founder decisions that remain open: ADR-ZS-071 (a `PROJECT.md`
baseline update), ADR-ZS-072 (the ADR-ZS-008 volume-horizon reading), and
ADR-ZS-073 (confirming the two-wave MVP scope extension) — see §3.2's
`RDM-ZS-011` fact sheet and §5.2. Once engineering work starts, this section is
the place to track delivery status against the milestones below; until then it
tracks planning status only.

---

## 1. Purpose, method, and how to read the dates

### 1.1 Purpose

This chapter sets ZSchool's **delivery roadmap**: a recap of capabilities by version (MVP, V1, V2+), dated milestones `RDM-ZS-NNN` with measurable entry and exit criteria, dated external dependencies with fallback plans, and scheduling risks tied to the seasonality of the Moroccan school year. It answers point 9 of chapter 18 of the baseline (risks and mitigation, including sales seasonality) and structures how the module chapters should be read over time.

Three milestone families are distinguished:

1. **Lifecycle milestones**: product rollout and stage gates (pilot preparation, pilot go-live, MVP-to-V1 transition, commercial launch).
2. **Capability milestones**: bringing a defined scope into service (WhatsApp, Fatourati, native apps, multi-school organizations, V2 and V2+ capabilities).
3. **Recurring milestones**: annual rhythms driven by the school calendar (rollover, maintenance windows, regulatory campaigns).

### 1.2 Method: seasonal anchoring

The Moroccan school year (September to June, billed over ten months, ADR-ZS-009) is the roadmap's backbone: the start of the year concentrates workload and purchasing decisions, holidays are the only maintenance windows, and June concentrates exams, report cards, and the rollover. The official dates used are those of the **actual 2026-2027 calendar** documented in `prd/research/04` (student intake 03-05/09/2026, classes compulsory from Monday 07/09/2026, holidays on 18-25/10/2026, 06-13/12/2026, 24-31/01/2027, 21-28/03/2027, 09-16/05/2027, the national baccalaureate exam 01-03/06/2027, Ramadan 1448 from 08/02 to 09-10/03/2027); this calendar is preloaded into the platform's calendar model. The official 2027-2028 calendar had not been published as of the PRD date (dependency D-07).

### 1.3 How to read the dates

- **Sourced official dates**: publication in the Official Gazette, ministerial notices, vendor announcements (Meta, CMI), decrees. They are cited with their source and are not adjustable by this chapter.
- **Planning targets**: target windows of the **reference scenario** adopted by this chapter. They are planning choices, to be confirmed by the founder (OQ-ZS-351, OQ-ZS-352); the real binding constraint is **seasonal anchoring**, not the exact calendar date.
- **Religious dates**: indicative, confirmed by lunar observation (Ministry of Islamic Affairs) a few days beforehand; the model carries them as "to confirm" and updates them during the year.

### 1.4 Baseline / research divergences

Per `prd/research/00-baseline-corrections.md`, this chapter uses the up-to-date data (permanent UTC+0 since 20/09/2026; Law 59.21 published in Official Gazette No. 7485 of 23/02/2026; the WhatsApp pricing switch of 01/10/2026; YouCan Pay closed since January 2024) and records the baseline update as OQ-ZS-354 (escalated as ADR-ZS-071 in `prd/cross-cutting/42-review-arbitrations.md`). The two-wave MVP split (ADR-ZS-041) and the pre-pilot compliance dependencies (ADR-ZS-066) are applied throughout this chapter.

### 1.5 Cross-reference conventions

- **Modules**: the `<MOD>` codes from conventions §2 map to the following canonical files: ADM (`prd/modules/10-administration-onboarding-subscription.md`), INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), PED (`prd/modules/12-academic-structure-timetables.md`), VSC (`prd/modules/13-attendance-student-life-discipline.md`), EVA (`prd/modules/14-assessments-grades-report-cards.md`), DOC (`prd/modules/15-documents-certificates.md`), FIN (`prd/modules/16-finance-billing-collections.md`), COM (`prd/modules/17-communication-notifications.md`), TRA (`prd/modules/18-transfers-mobility.md`), CAR (`prd/modules/19-teacher-career-network.md`), RAP (`prd/modules/20-dashboards-reporting.md`), MAS (`prd/modules/21-massar-regulatory-exports.md`), SAN (`prd/modules/22-ancillary-services-transport-canteen-activities.md`), HEA (`prd/modules/23-health-sensitive-data.md`).
- **Cross-cutting**: PER (`prd/cross-cutting/30-roles-permissions-matrix.md`), SEC (`prd/cross-cutting/31-security-privacy.md`), NFR (`prd/cross-cutting/32-non-functional-requirements.md`), PAK (`prd/cross-cutting/33-business-model-packaging.md`), UX (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`), INT (`prd/cross-cutting/35-external-integrations.md`, including INT-FAT, INT-WAP, INT-SIG, INT-HEB), CNF (`prd/cross-cutting/36-legal-compliance-data-protection.md`), roadmap (this file), KPI (`prd/cross-cutting/38-kpi-success-metrics.md`), risks (`prd/cross-cutting/39-risks-mitigations.md`), tracker (`prd/cross-cutting/40-assumptions-open-questions-tracker.md`), glossary (`prd/cross-cutting/41-glossary.md`).
- **Journeys**: references to `JMP-ZS-001` through `JMP-ZS-011` in `prd/journeys/00-journey-map.md`, without duplicating them.
- No `KPI-ZS-NNN` or `RSK-ZS-NNN` identifier is created here: those namespaces belong to `prd/cross-cutting/38-kpi-success-metrics.md` and `prd/cross-cutting/39-risks-mitigations.md`.

---

## 2. Scope recap by version (`PROJECT.md` §12, ADR-ZS-026)

The tables below reproduce every item from the baseline's chapter 12 in full and map each to its carrying chapter. No capability is added or removed: the only adjustments come from later decisions in the baseline itself (§2.4).

### 2.1 MVP — validation with 3 to 5 pilot schools

| # | Capability (§12 MVP) | Carrying modules | Chapters | Baseline |
|---|---|---|---|---|
| 1 | School onboarding, Excel import, academic structure (national model), school year, classes, subjects | ADM, PED | `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/12-academic-structure-timetables.md` | (→ INV-ZS-070, INV-ZS-073, INV-ZS-074, INV-ZS-076, ADR-ZS-013, G-06, G-18) |
| 2 | Global student/parent/teacher identities, Massar matching, invitations and claiming | ADM | `prd/modules/10-administration-onboarding-subscription.md` | (→ INV-ZS-051 to INV-ZS-057, INV-ZS-063, ADR-ZS-014, ADR-ZS-015) |
| 3 | Enrollment (simplified state machine: pre-enrolled, active, completed, transferred, withdrawn) | INS | `prd/modules/11-admissions-enrollment-reenrollment.md` | (→ INV-ZS-058, INV-ZS-060, ADR-ZS-017) |
| 4 | Parent-student relationships with default qualities and rights | INS | `prd/modules/11-admissions-enrollment-reenrollment.md` | (→ INV-ZS-064 to INV-ZS-068, INV-ZS-066) |
| 5 | Teacher and staff affiliations, standard roles | ADM, cross-cutting | `prd/modules/10-administration-onboarding-subscription.md`, `prd/cross-cutting/30-roles-permissions-matrix.md` | (→ INV-ZS-069 to INV-ZS-072, ADR-ZS-016, ADR-ZS-028) |
| 6 | Attendance with SMS/WhatsApp notification, justification | VSC, COM | `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/17-communication-notifications.md` | (→ INV-ZS-090, INV-ZS-091, ADR-ZS-023, ADR-ZS-036; delay < 5 minutes: `PROJECT.md` §10) |
| 7 | Assessments, grades, average calculation, bilingual report cards published and immutable | EVA, PED | `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/12-academic-structure-timetables.md` | (→ INV-ZS-081, INV-ZS-085, ADR-ZS-020, ADR-ZS-021, G-12, G-19) |
| 8 | Basic finance: fee schedule, payment schedule, collections, receipts, unpaid fees, reminders | FIN | `prd/modules/16-finance-billing-collections.md` | (→ INV-ZS-062, INV-ZS-064, ADR-ZS-005, G-15, G-16) |
| 9 | Communication: announcements, messages, in-app and SMS notifications | COM | `prd/modules/17-communication-notifications.md` | (→ ADR-ZS-023, ADR-ZS-034 (partial), G-17) |
| 10 | Multi-child, multi-school parent dashboards; student, teacher, and school leadership dashboards | RAP | `prd/modules/20-dashboards-reporting.md` | (→ ADR-ZS-014, §7.11) |
| 11 | Simple transfer between two ZSchool schools and a PDF exit file | TRA, DOC | `prd/modules/18-transfers-mobility.md`, `prd/modules/15-documents-certificates.md` | (→ INV-ZS-082 to INV-ZS-084, ADR-ZS-018, ADR-ZS-019, G-08) |
| 12 | FR/AR, responsive web, PWA | cross-cutting | `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` | (→ ADR-ZS-021, §10) |

Notes on reading the MVP:

- **No push notifications at MVP** (PWA with no push, ADR-ZS-062 (§21b)): attendance notifications are delivered in-app, by SMS, and by WhatsApp "utility" messaging limited to attendance notifications (historical alias D1; ADR-ZS-062, ADR-ZS-066 §25c); the full ADR-ZS-036 hierarchy (push first, WhatsApp "utility," SMS as fallback) applies from V1 onward. Detailed routing is carried by `prd/modules/17-communication-notifications.md` (BEH-ZS-184, BEH-ZS-191).
- **The MVP document scope** covers enrollment documents, the school-attendance certificate issued at the front desk, the leaving certificate, and the PDF exit file (INS, FIN, BEH-ZS-131, BEH-ZS-139, BEH-ZS-141 partial, BEH-ZS-144; batch certificates BEH-ZS-145 in wave 2); the full DOC module (self-service, advanced seal, QR code) remains V1. **Moderated parent-teacher threads** are active in-app at MVP (ADR-ZS-034, ADR-ZS-062 (§21a); BEH-ZS-183).
- The reference workload profile is that of the ADR-ZS-035 pilots: a primary school of about 300 students, a middle/high school of about 800, a multi-site group of over 2,000, and a bilingual school running on trimesters.

### 2.1 bis — The MVP in two waves (ADR-ZS-041, working hypothesis to be confirmed by the founder: ADR-ZS-073)

The MVP scope covers everything a pilot school needs between its activation (RDM-ZS-001, from 01/02/2027) and the end of the 2027-2028 school year (RDM-ZS-002). It is delivered in two waves; the version tag remains `MVP`, with the Version cell of the affected requirements reading "MVP (wave 2 — year-end closing, RDM-ZS-003)."

| Wave | Window | Requirements re-tagged MVP by the review (previously V1) | Rationale |
|---|---|---|---|
| Wave 1 — activation | delivered at RDM-ZS-004 (end of January 2027), in service at RDM-ZS-001 | Cheques: BEH-ZS-162; the Law 59.21 parents' contract with a tracked simple acceptance and financial-guardian countersignature: BEH-ZS-152, BEH-ZS-036 (advanced-level e-signature via INT-SIG in V1); tamper-proof receipt numbering: BEH-ZS-157 (receipts; compliant invoices in V1); sibling discount: BEH-ZS-154; account statement to the financial guardian: BEH-ZS-174; duplicate merging reserved to ZSchool support: BEH-ZS-029, INV-ZS-020; organization in read-only consolidated view: BEH-ZS-004, BEH-ZS-249 (shared administration and group billing in V1); ticket-based support with the school leader's consent: PER-ZS-001, `SupportTicket`; progressive grade publication: BEH-ZS-129; adult student: INV-ZS-042, URS-ZS-055/07 (ADR-ZS-051); mid-year data migration: extended BEH-ZS-006, BEH-ZS-047 (ADR-ZS-043); declared class sessions and unfulfilled sessions: BEH-ZS-070, BEH-ZS-071 (ADR-ZS-045, ADR-ZS-046); login identifier, phone number change: INV-ZS-003, BEH-ZS-020, SEC-ZS-004 (ADR-ZS-048, ADR-ZS-049); pre-pilot compliance: CNF-ZS-001, CNF-ZS-004, CNF-ZS-003 (manual), CNF-ZS-002 (pilot agreement), SEC-ZS-027 (penetration test), SEC-ZS-026 and INT-ZS-036 (off-site replication) (ADR-ZS-066) | Pilots handle real data, cheques, and contracts from day one (`PROJECT.md` §2.8, Law 59.21 in force) |
| Wave 2 — year-end closing | delivered before 31/05/2027, in service at RDM-ZS-005 and RDM-ZS-003 | Rollover: BEH-ZS-041, BEH-ZS-043, BEH-ZS-044; re-enrollment campaign (pre-filled form, deposit, conversion): BEH-ZS-040 (scheduled reminders in V1); structure cloning: BEH-ZS-057, INV-ZS-013; class-council decisions and comments, simplified minutes: BEH-ZS-123 (BEH-ZS-122 preparation in V1); annual transcript: BEH-ZS-128 (cumulative transcript in V1); Massar exports of class lists and continuous-assessment grades with versioned templates and a validation report: BEH-ZS-262 to BEH-ZS-265; batch certificates: BEH-ZS-145 | RDM-ZS-005 and RDM-ZS-003 require these capabilities in June 2027, fifteen months ahead of the V1 milestone |

The capabilities that remain V1 are listed in the updated §2.2; the rejected alternative — pushing RDM-ZS-005 and RDM-ZS-003 out past V1 — would have made pilots go through two year-end closings with no tooling.

### 2.2 V1 — commercial launch

| # | Capability (§12 V1) | Carrying modules | Chapters | Baseline |
|---|---|---|---|---|
| 1 | Tooled admissions (application, documents, entrance tests, waitlist, decision: BEH-ZS-021 to BEH-ZS-025), scheduled re-enrollment campaign reminders, class-council preparation (BEH-ZS-122) — the rollover, the pre-filled campaign, the class-council decisions, and the annual transcript moved to MVP wave 2 (§2.1 bis, ADR-ZS-041) | INS, EVA | `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/14-assessments-grades-report-cards.md` | (→ INV-ZS-059, G-07; ADR-ZS-041) |
| 2 | Timetable with conflict detection and Ramadan variants | PED | `prd/modules/12-academic-structure-timetables.md` | (→ G-11, G-13; actual calendar: `prd/research/04` §3) |
| 3 | Full discipline and student-life management | VSC | `prd/modules/13-attendance-student-life-discipline.md` | (→ G-14) |
| 4 | Self-service documents and certificates, QR verification | DOC | `prd/modules/15-documents-certificates.md` | (→ INV-ZS-080, INV-ZS-085, ADR-ZS-005, ADR-ZS-011: advanced seal and timestamp from V1) |
| 5 | Full finance: cash-drawer sessions, accounting exports, compliant invoices, negotiated discounts and scholarships, refunds — cheques, sibling discount, receipt numbering, account statements, and the parents' contract (simple acceptance) moved to MVP wave 1 (§2.1 bis, ADR-ZS-041) | FIN | `prd/modules/16-finance-billing-collections.md` | (→ G-15; ICE/IF mentions and 10-year retention: `prd/research/02` §7) |
| 6 | ESISE regulatory statistics, transfer log, discount audit — Massar exports of class lists and continuous-assessment grades moved to MVP wave 2 (§2.1 bis, ADR-ZS-041) | MAS | `prd/modules/21-massar-regulatory-exports.md` | (→ H-04, H-10, G-08; ESISE channel: `prd/research/04` §2) |
| 7 | Multi-school organizations: shared administration, group-level billing, advanced comparisons — organization creation and the read-only consolidated dashboard are in MVP wave 1 (§2.1 bis, ADR-ZS-041) | ADM, RAP | `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/20-dashboards-reporting.md` | (→ INV-ZS-073, INV-ZS-075, ADR-ZS-013; URS-ZS-001, URS-ZS-004) |
| 8 | Full WhatsApp Business API, push notifications (via PWA, FCM/APNs under a transfer basis: CNF-ZS-012); native Android then iOS apps in V2+ (adopted reading: `PROJECT.md` §10, aligned with NFR-ZS-022, UX-ZS-010, INT-ZS-030; the divergence with §12 is escalated as ADR-ZS-071) | COM, cross-cutting | `prd/modules/17-communication-notifications.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/35-external-integrations.md` (INT-WAP) | (→ ADR-ZS-036, H-11; §10/§12 divergence on native apps: OQ-ZS-353) |
| 9 | Audit trail, data-subject rights, formalized CNDP compliance | cross-cutting | `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md` | (→ ADR-ZS-027, ADR-ZS-003, INV-ZS-090, G-20) |
| 10 | Fatourati online payment: Collect then Aggregator, with no holding of funds (ADR-ZS-031, moving the "online payment" item from §12 V2+ to V1) | FIN, integrations | `prd/modules/16-finance-billing-collections.md`, `prd/cross-cutting/35-external-integrations.md` (INT-FAT) | (→ ADR-ZS-031, H-09, H-19; JMP-ZS-008) |
| 11 | Exit file for schools outside ZSchool: a time-limited secure link with QR verification (ADR-ZS-032) | TRA, DOC | `prd/modules/18-transfers-mobility.md`, `prd/modules/15-documents-certificates.md` | (→ ADR-ZS-032; JMP-ZS-009) |
| 12 | Parents' contract (Law 59.21) signed electronically at the advanced level (ADR-ZS-011, INT-SIG) — the contract itself (generation, tracked simple acceptance, financial-guardian countersignature, archiving) is in MVP wave 1 (ADR-ZS-041, ADR-ZS-061 (§20h)) | DOC, FIN, compliance | `prd/modules/15-documents-certificates.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md` | (→ ADR-ZS-011; Law 59.21: `prd/research/02` §1) |

### 2.3 V2 and beyond

| # | Capability (§12 V2+) | Carrying modules | Chapters | Baseline |
|---|---|---|---|---|
| 1 | Digital school passport | TRA, DOC | `prd/modules/18-transfers-mobility.md`, `prd/modules/15-documents-certificates.md` | (→ §6.9, INV-ZS-080, INV-ZS-083, `ConsentGrant`) |
| 2 | Professional teacher network (search, applications, availability) | CAR | `prd/modules/19-teacher-career-network.md` | (→ §7.10, ADR-ZS-006, INV-ZS-072, INV-ZS-087; URS-ZS-031, URS-ZS-032) |
| 3 | Online payment: registered-card payment (NAPS e-Premium or Chari Pay), bank direct debit | FIN, integrations | `prd/modules/16-finance-billing-collections.md`, `prd/cross-cutting/35-external-integrations.md` | (→ ADR-ZS-031, H-09; rails: `prd/research/03` §2) |
| 4 | Transport, canteen, activities, health | SAN, HEA | `prd/modules/22-ancillary-services-transport-canteen-activities.md`, `prd/modules/23-health-sensitive-data.md` | (→ §7.13, §7.14, ADR-ZS-019, ADR-ZS-005, G-14) |
| 5 | Automatic timetable generation | PED | `prd/modules/12-academic-structure-timetables.md` | (→ §7.3, G-13) |
| 6 | Public API, accounting integrations, Massar integration if a channel opens up | MAS, cross-cutting | `prd/modules/21-massar-regulatory-exports.md`, `prd/cross-cutting/35-external-integrations.md` | (→ §10 interoperability, H-04) |
| 7 | English, advanced international tracks (letter grades, GPA) | PED, cross-cutting | `prd/modules/12-academic-structure-timetables.md`, `prd/cross-cutting/32-non-functional-requirements.md` | (→ §2.3, §10) |
| 8 | Lightweight e-learning (resources, online homework) | PED | `prd/modules/12-academic-structure-timetables.md` | (→ §12) |

Note: the §12 V2+ item "online payment (CMI, aggregators)" is narrowed by ADR-ZS-031, which brings Fatourati into V1 (see §2.2, row 10); the registered card and direct debit remain V2+.

### 2.4 Version consistency with the baseline's decisions

| Topic | Adopted reading | Cross-reference |
|---|---|---|
| Fatourati in V1 | ADR-ZS-031 overrides the "later version" wording for online payments (§7.7, §12); sequence is Collect then Aggregator | JMP-ZS-008 in the journey map; RDM-ZS-006 |
| Native apps | §12 lists them under V1; §10 places them in V2; the review's adopted reading is §10 (V2+), aligned with NFR-ZS-022, UX-ZS-010, and INT-ZS-030; push in V1 via PWA | OQ-ZS-353 (resolved); RDM-ZS-007; ADR-ZS-071 |
| Moderated parent-teacher threads (ADR-ZS-034) | MVP in moderated in-app mode (ADR-ZS-034 "enabled by default," URS-ZS-030; ADR-ZS-062 (§21a)); channels generalized in V1 | BEH-ZS-183; journey-map OQ-ZS-351 (resolved) |
| Documents at MVP | enrollment documents, school-attendance certificate, leaving certificate, PDF exit file, encrypted relationship documents; the full DOC module (self-service, seal, QR) in V1 | journey-map OQ-ZS-352 (resolved); ADR-ZS-060, ADR-ZS-061 |
| Adult student (INV-ZS-052, ADR-ZS-001) | MVP (INV-ZS-042; URS-ZS-055, URS-ZS-057; JNY-ZS-084, JNY-ZS-085) | ADR-ZS-051 |
| QR verification | V1 (ADR-ZS-011 dates the item after ADR-ZS-020); no MVP criterion mentions it | ADR-ZS-060 |
| Push notifications | none at MVP; the ADR-ZS-036 hierarchy from V1 onward | ADR-ZS-062 (§21b) |
| Two-wave MVP scope | a working hypothesis applied throughout every chapter, to be confirmed by the founder | §2.1 bis; ADR-ZS-041; ADR-ZS-073 |
| ADR-ZS-008 horizon | the reading "year 1 = 2028-2029" is kept as a hypothesis; escalated to the founder | OQ-ZS-351; ADR-ZS-047; ADR-ZS-072 |
| WhatsApp at MVP | founder arbitration (historical alias D1; ADR-ZS-062, ADR-ZS-066 §25c): at MVP, in-app + SMS and WhatsApp "utility" limited to attendance notifications (minimal templates); at V1, generalized (all messages, managed templates, push) | RDM-ZS-008 |
| SaaS billing | MAD 5/active student/month over 10 months (September-June), no billing in July-August; consumables billed on top | ADR-ZS-009; RDM-ZS-009, RDM-ZS-010 |

---

## 3. Roadmap milestones (RDM-ZS-011 to RDM-ZS-010)

### 3.1 Chronological overview

| JAL | Title | Target window (reference scenario) | Family | Version(s) |
|---|---|---|---|---|
| RDM-ZS-011 | Freeze the MVP scope and start development | October 2026 | Lifecycle | MVP |
| RDM-ZS-004 | MVP wave 1 complete and internally validated | end of January 2027 | Lifecycle | MVP (wave 1) |
| RDM-ZS-012 | Pilot preparation: onboarding, imports, training | February-April 2027 | Lifecycle | MVP |
| RDM-ZS-001 | Pilot go-live: mid-year onboarding into the 2026-2027 school year with mid-year data migration | from Monday 01/02/2027 (resuming after the mid-year break); Compliance Gate RDM-ZS-013 cleared | Lifecycle | MVP (wave 1) |
| RDM-ZS-014 | Pilot learning loop (4 ADR-ZS-035 profiles) | February-June 2027, then ongoing | Lifecycle | MVP |
| RDM-ZS-005 | Period closing, report cards, and pilot Massar exports | May-June 2027 (2nd-year baccalaureate class: before the 01-03/06/2027 national baccalaureate exam; other levels: before the end of classes) | Lifecycle | MVP (wave 2) |
| RDM-ZS-003 | Rollover from year N to N+1 | June (first occurrence: June 2027) | Lifecycle / recurring | MVP (wave 2: BEH-ZS-040/21/23/24, BEH-ZS-057, BEH-ZS-123/18); V1 (scheduled reminders, tooled admissions) |
| RDM-ZS-015 | Pilots at full load for the new school year | September 2027 (2027-2028 school year start) | Lifecycle | MVP |
| RDM-ZS-016 | First complete first-semester closing and report cards | December 2027-January 2028 | Lifecycle | MVP |
| RDM-ZS-002 | MVP-to-V1 transition (adoption, stability, KPIs) | spring 2028 review; confirmation after the June 2028 rollover | Lifecycle | MVP → V1 |
| RDM-ZS-009 | V1 commercial launch on the Casablanca-Kénitra corridor | summer 2028 campaign; 2028-2029 school year start | Lifecycle | V1 |
| RDM-ZS-008 | Capability: WhatsApp Business Platform and the 01/10/2026 pricing switch | parameter specified in the PRD before 01/10/2026, implemented at RDM-ZS-011; account verified and templates approved before 15/01/2027 (D-17); rolled out with the pilots | Capability | MVP (utility: attendance notifications); V1 (full rollout, push) |
| RDM-ZS-006 | Capability: Fatourati Collect then Aggregator | Aggregator go/no-go on 30/06/2027 (D-18), Collect as plan B; connected during the pilot cycle; in service at V1 | Capability | V1 |
| RDM-ZS-017 | Capability: multi-school organizations | consolidated read-only view from RDM-ZS-001 (ADR-ZS-035 group pilot); shared administration and group billing with V1 | Capability | MVP (read-only view); V1 |
| RDM-ZS-007 | Capability: native Android then iOS apps | V2+ (§10 reading, aligned with NFR-ZS-022; push in V1 via PWA) | Capability | V2+ |
| RDM-ZS-018 | V2+ capability: qualified seal and recurring bank-card payment | V2+, after V1 has stabilized | Capability | V2+ |
| RDM-ZS-019 | V2+ capability: transport, canteen, and health | V2+ | Capability | V2+ |
| RDM-ZS-020 | V2+ capability: school passport and professional teacher network | V2+ | Capability | V2+ |
| RDM-ZS-010 | Recurring rhythm: maintenance windows and dated annual milestones | permanent, every school year | Recurring | all versions |
| RDM-ZS-021 | Wave 1 development — identity, enrollment, structure, and data migration foundation | mid-November 2026 | Lifecycle | MVP (wave 1) |
| RDM-ZS-022 | Wave 1 development — attendance, notifications, basic finance, enrollment documents | mid-December 2026 | Lifecycle | MVP (wave 1) |
| RDM-ZS-023 | Pilot UAT on anonymized real data, and rehearsal of the mid-year data migration | mid-January 2027 | Lifecycle | MVP (wave 1) |
| RDM-ZS-013 | Pre-pilot compliance and security gate (CNDP, pilot agreement, WhatsApp Business, penetration test, off-site replication) | before 31/01/2027; CNDP filings submitted before 15/12/2026 | Lifecycle | MVP (wave 1) |
| RDM-ZS-024 | Wave 2 development — year-end closing (rollover, class councils, transcripts, Massar exports) | delivery before 31/05/2027 | Lifecycle | MVP (wave 2) |

Reading the reference scenario: the PRD is dated 09/09/2026, after the actual 2026-2027 school year had already started (classes compulsory from Monday 07/09/2026, `prd/research/04`). Pilots therefore cannot go live at the start of the 2026 school year: the reference scenario adopts a **progressive mid-year onboarding with mid-year data migration** (RDM-ZS-001, from February 2027, ADR-ZS-043), a fully tooled year-end closing in June 2027 (RDM-ZS-005, RDM-ZS-003, wave 2), a first complete school year under MVP in 2027-2028 (RDM-ZS-015, RDM-ZS-016), then the transition to V1 and commercial launch for the 2028-2029 school year (RDM-ZS-002, RDM-ZS-009). Wave 1 development is milestoned by RDM-ZS-021 to RDM-ZS-013; wave 2 by RDM-ZS-024. Alternatives and the switch-over point are recorded in OQ-ZS-352 (resolved); the resulting ADR-ZS-008 horizon is escalated to the founder (OQ-ZS-351, ADR-ZS-072).

### 3.2 Milestone fact sheets

#### RDM-ZS-011 — Freeze the MVP scope and start development

| Attribute | Value |
|---|---|
| Target window | October 2026 |
| Description | The PRD chapter review concludes with the MVP scope frozen (§12, ADR-ZS-026), the target architecture validated (production and backup in Morocco, ADR-ZS-007), and a delivery plan established through to the pilots. |
| Version(s) | MVP |
| Entry criteria | PRD chapters written and under review (`prd/README.md`); baseline/research divergences recorded (OQ-ZS-354). |
| Exit criteria | MVP scope frozen and signed off, in two waves (§2.1 bis, ADR-ZS-041); architecture validated, with a service-by-service check of the `af-casablanca-1` OCI Casablanca region catalogue (managed databases, managed Kubernetes, object storage: correction #13); MVP-to-V1 transition thresholds proposed and handed to `prd/cross-cutting/38-kpi-success-metrics.md`; a delivery plan incorporating maintenance windows (RDM-ZS-010) and the 01/10/2026 WhatsApp pricing switch designed as a dated parameter (RDM-ZS-008). |
| Dependencies | D-01 (permanent UTC+0) built in from the design stage; the dated WhatsApp switch parameter specified in the PRD before 01/10/2026 (RDM-ZS-008); team sizing and hiring plan settled (§5.2); founder confirmation of the MVP scope extension (ADR-ZS-073) and the ADR-ZS-008 horizon (ADR-ZS-072) before the freeze. |
| Stakeholders | Project founder, product team, development team, PRD review. |
| Traceability | (→ §12, ADR-ZS-026, ADR-ZS-007, §18 point 1) |

#### RDM-ZS-004 — MVP wave 1 complete and internally validated

| Attribute | Value |
|---|---|
| Target window | end of January 2027 (pushed back from February to free up the pilot-onboarding window, RDM-ZS-012) |
| Description | The twelve MVP capabilities (§2.1) and the wave-1 requirements (§2.1 bis) are developed and internally validated, following the intermediate milestones RDM-ZS-021, RDM-ZS-022, and RDM-ZS-023: end-to-end demonstration of the critical journeys (JMP-ZS-003 with mid-year data migration, JMP-ZS-004, JMP-ZS-005 with declared class sessions, JMP-ZS-006, JMP-ZS-007 including cheques, JMP-ZS-011), load testing at ADR-ZS-035 profile sizes (300, 800, 2,000+ students; semesters and trimesters), and verification of data residency in Morocco and off-site replication (INT-ZS-036). |
| Version(s) | MVP |
| Entry criteria | RDM-ZS-011; RDM-ZS-021 through RDM-ZS-023 cleared; a production environment available on `af-casablanca-1`. |
| Exit criteria | MVP journeys demonstrated end to end; report-card generation under 3 seconds and publication of report cards for a 2,000-student school under 10 minutes (§10); attendance notification delivered in under 5 minutes after roll-call validation (§10); attendance-taking and grade entry tolerant of connectivity loss, with sync (§10); daily backups replicated off-site with tested restoration (§10, SEC-ZS-026); a functional PWA in FR and AR with full RTL support, with no push (ADR-ZS-062 (§21b)); the mid-year data migration rehearsed on an anonymized real dataset (RDM-ZS-023). |
| Dependencies | RDM-ZS-011; hosting ready. |
| Stakeholders | Development team, QA team, product leadership. |
| Traceability | (→ §10, §12, ADR-ZS-021, ADR-ZS-035) |

#### RDM-ZS-012 — Pilot preparation: onboarding, imports, training

| Attribute | Value |
|---|---|
| Target window | February-April 2027 (post-mid-year-break window; classes resume Monday 01/02/2027, `prd/research/04`); run in parallel with the first go-lives (RDM-ZS-001), pilot by pilot |
| Description | Selecting and contracting the 3 to 5 pilot schools per the ADR-ZS-035 profiles; creating the tenants; Excel-importing the initial data (students, guardians, classes, fee schedule) with duplicate checks and an error report; training the teams (school leadership, front office, teachers); each pilot's CNDP filings (F211 or F214) submitted before 15/12/2026 using the ZSchool templates (CNF-ZS-001, D-16), and a pilot data-processing agreement signed before any go-live (CNF-ZS-002, D-20); collecting parents' WhatsApp opt-in with a notice on the cross-border data transfer (ADR-ZS-066 (§25c)); defining the SMS and WhatsApp consumable packs (ADR-ZS-009 consumables); and migrating mid-year data (paid installments, cheques in hand, semester grades, ADR-ZS-043). |
| Version(s) | MVP |
| Entry criteria | RDM-ZS-004; pilot school leadership commitment. |
| Exit criteria | All four ADR-ZS-035 profiles onboarded, the multi-site group with its organization in read-only consolidated view (BEH-ZS-004); imports validated (error reports empty or resolved), enrollments activated via import (BEH-ZS-047), accurate mid-year payment schedules; duplicates merged by support (BEH-ZS-029); internal users active with standard roles; a first roll call and a first payment collection completed at each pilot; CNDP filings submitted before 15/12/2026 (RDM-ZS-013); pilot agreements signed; real pilot Massar Excel file structures collected for testing (D-09); the cadence and points of contact for the learning loop agreed. |
| Dependencies | RDM-ZS-004; RDM-ZS-013 (compliance gate); pilot team availability; no Fatourati dependency (V1); WhatsApp Business verified before 15/01/2027 (D-17), with SMS sufficient to start. |
| Stakeholders | ZSchool team (onboarding and support), pilot school leadership and front offices, trained teachers. |
| Traceability | (→ ADR-ZS-009, ADR-ZS-035, G-06, G-18; JMP-ZS-003; compliance: `prd/cross-cutting/36-legal-compliance-data-protection.md`) |

#### RDM-ZS-001 — Pilot go-live: onboarding mid-way through the 2026-2027 school year

| Attribute | Value |
|---|---|
| Target window | from Monday 01/02/2027 (resuming after the 24-31/01/2027 mid-year break); each pilot goes live after its own onboarding (RDM-ZS-012), with RDM-ZS-012 and RDM-ZS-001 progressing in parallel across successive waves — 01/02/2027 marks the opening of the window, not the simultaneous activation of every pilot |
| Description | Progressive pilot activation against the **actual 2026-2027 calendar** (`prd/research/04` §3), after the mid-year data migration (extended BEH-ZS-006, BEH-ZS-047: partially paid schedules, cheques in hand, first-semester grades, aggregated absences — ADR-ZS-043): daily roll calls by declared sessions (BEH-ZS-070) with same-day first-absence notification (ADR-ZS-056), routine grade entry, collections, cheques and reminders, front-desk attestations, announcements, moderated threads. The Ramadan schedule variant (period 1448: 08/02 to 09-10/03/2027, indicative) is configured at the relevant pilots; the time zone has been permanent UTC+0 since 20/09/2026 (Decree No. 2.26.530, D-01), and "Ramadan variants" remain a pedagogical need for shortened hours, not a time-zone issue. |
| Version(s) | MVP |
| Entry criteria | RDM-ZS-012; RDM-ZS-013 cleared (CNDP filings submitted, pilot agreement signed, penetration test performed, off-site replication active); the 2026-2027 calendar preloaded; religious holidays carried as "to confirm." |
| Exit criteria | Every pilot runs its daily roll call with notification delivered in under 5 minutes; payment schedules and reminders active; the first period closing prepared; the Ramadan variant applied with no incident at the pilots using it; no unresolved availability alert during the Ramadan period. |
| Dependencies | RDM-ZS-012; RDM-ZS-013; D-01 (time zone); D-02 (WhatsApp rate cards); D-16, D-17, D-19, D-20; RDM-ZS-008. |
| Stakeholders | Pilot school leadership, head supervisors, teachers, and front offices; ZSchool support. |
| Traceability | (→ §12, ADR-ZS-036, G-11; `prd/research/04` §3; corrections #1 and #17) |

#### RDM-ZS-014 — Pilot learning loop (4 ADR-ZS-035 profiles)

| Attribute | Value |
|---|---|
| Target window | February-June 2027, then ongoing through to the V1 transition |
| Description | A regular review cadence with the pilots (weekly during go-live, then every two weeks), a feedback log categorized by profile (a primary school of about 300 students; a middle/high school of about 800; a multi-site group of over 2,000; a bilingual school on trimesters), prioritization, and fast corrective releases; tracking the MVP success indicators defined in baseline §18 point 8 (pilot adoption, daily roll-call rate, notification delay, collection rate, reduction of double data entry), carried by `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version(s) | MVP |
| Entry criteria | RDM-ZS-001; each pilot's point of contact committed. |
| Exit criteria | A live, up-to-date feedback log; the five §18 point 8 indicators measured for each pilot; every MVP scope change decided in review and recorded in the relevant module chapters; no critical feedback item left without an owner and a deadline. |
| Dependencies | RDM-ZS-001; pilot point-of-contact availability. |
| Stakeholders | Pilot school leadership, end users (teachers, front offices, supervisors), ZSchool product team. |
| Traceability | (→ ADR-ZS-035, §18 point 8) |

#### RDM-ZS-005 — Period closing, report cards, and pilot Massar exports

| Attribute | Value |
|---|---|
| Target window | May-June 2027 (second semester for pilots on semesters; third trimester for the trimester-based school); for 2nd-year baccalaureate classes, publication before the 01-03/06/2027 national baccalaureate session; for other levels, before the end of classes (late June) |
| Description | The first full round of bilingual report cards published, immutable and versioned (digital fingerprint, signatory, INV-ZS-085, ADR-ZS-020); publication notification sent to families; annual transcripts (BEH-ZS-128, wave 2); Massar exports of class lists and continuous-assessment grades (BEH-ZS-262 to BEH-ZS-265, wave 2: files per subject and per semester, a trimester-to-semester mapping for the bilingual school, a validation report) handed to pilots alongside their own ministry data entry; a compliance check against the national reference framework, issued as a warning (BEH-ZS-116, historical alias D3). |
| Version(s) | MVP (wave 2, delivered at RDM-ZS-024) |
| Entry criteria | RDM-ZS-014; RDM-ZS-024; default weightings configured per level (baccalaureate 25/25/50; 3AC lower-secondary certificate 30/30/40; 6AP primary-school certificate 50/25/25 labeled "provincial exam," ADR-ZS-059); Massar Excel file structure tested on real files (D-09). |
| Exit criteria | 100% of pilot-period report cards published through ZSchool, with no manual recalculation; Massar exports handed to pilots and compared against their actual Massar data entry, with zero blocking discrepancy; publication completed before the end of classes; no integrity incident on published report cards. |
| Dependencies | RDM-ZS-014; D-09; H-16 (weighting reference texts, requirements phrased without depending on the exact reference number). |
| Stakeholders | Teachers (grade entry), school leadership (closing and publication), front offices (Massar exports), families (viewing). |
| Traceability | (→ INV-ZS-085, ADR-ZS-020, ADR-ZS-021, H-04, §18 point 8; JMP-ZS-006) |

#### RDM-ZS-003 — Rollover from year N to N+1 (critical scheduling point)

| Attribute | Value |
|---|---|
| Target window | June, first occurrence June 2027, then every year: after class councils and before students leave, well ahead of the new school year |
| Description | Bulk year-end decisions (INV-ZS-059, BEH-ZS-123, BEH-ZS-041): every student present at closing moves to COMPLETED with their decision recorded, "advanced with a track change" students remain at the school, and students leaving at year end move to COMPLETED with no N+1 enrollment created (ADR-ZS-044); the N+1 structure is cloned from year N without the students (INV-ZS-077, BEH-ZS-057); a pre-filled re-enrollment campaign with a deposit (BEH-ZS-040); N+1 enrollments are created in PRE-ENROLLED status only, with no duplicates (BEH-ZS-041); class assignment (BEH-ZS-043); N+1 payment schedules generated; departures processed (BEH-ZS-044: exit file, balance retained per INV-ZS-062). This is the scheduling point of no return: a failure here jeopardizes the school's following school-year start. |
| Version(s) | MVP (wave 2, ADR-ZS-041: BEH-ZS-040, BEH-ZS-041, BEH-ZS-043, BEH-ZS-044, BEH-ZS-057, BEH-ZS-123, BEH-ZS-128, INV-ZS-013); V1 for scheduled campaign reminders and tooled admissions |
| Entry criteria | RDM-ZS-024 delivered; year-end report cards published (RDM-ZS-005); year-end decisions entered (BEH-ZS-123), "undetermined" for certifying levels pending results (ADR-ZS-058 (§17i)). |
| Exit criteria | Year N+1 opened at every pilot before 30 June: enrollments created, classes assigned, payment schedules generated; the processing time of a 2,000-student school's rollover measured, staying within load thresholds (§10, NFR-RES domain); the bulk process's retry and rollback tested (no orphaned N+1 enrollment, no duplicate N+1 enrollment, INV-ZS-058, ADR-ZS-044 (§03f)); no student left SUSPENDED or ACTIVE on year N after closing; the national baccalaureate exam window (01-03/06/2027 for the first occurrence) stays free of any heavy operation. |
| Dependencies | RDM-ZS-005; RDM-ZS-024; exam calendars (D-14); the next year's AREF campaign for teachers (D-13, on the CAR module side, in V1). |
| Stakeholders | School leadership (decisions), front offices (campaign and assignment), parents (confirmations and deposits). |
| Traceability | (→ INV-ZS-058, INV-ZS-059, INV-ZS-060, INV-ZS-062, INV-ZS-077, ADR-ZS-017, G-07; JMP-ZS-002; URS-ZS-005) |

#### RDM-ZS-015 — Pilots at full load for the 2027-2028 school year start

| Attribute | Value |
|---|---|
| Target window | September 2027; the official 2027-2028 school-year-start date had not been published as of 09/09/2026 (D-07); working assumption modeled on the recent ministerial pattern (student intake in early September, classes compulsory from the first Monday — `prd/research/04`) |
| Description | The first full school-year start under MVP: additional imports, last-minute enrollments, school-attendance certificates, a wave of invitations and account claims, roll calls from day one, first monthly payments and enrollment fees, notification peaks; reinforced ZSchool support. |
| Version(s) | MVP |
| Entry criteria | RDM-ZS-003 (year N+1 ready); the July-August maintenance window used for version upgrades (RDM-ZS-010): no production deployment in September. |
| Exit criteria | All pilots operational from the first day of class; no unplanned outage; absence-notification delay held under 5 minutes at peak; account-creation and invitation volume absorbed with no degradation (NFR-PERF and NFR-RES domains); critical tickets resolved within 24 hours (support commitment NFR-ZS-014, OQ-ZS-356 resolved). |
| Dependencies | RDM-ZS-003; D-07; RDM-ZS-010 (version freeze). |
| Stakeholders | All pilot roles; ZSchool support. |
| Traceability | (→ §10 NFR-DISP, NFR-PERF, NFR-OFF; ADR-ZS-035; journey-map §4) |

#### RDM-ZS-016 — First complete first-semester closing and report cards (2027-2028 cycle)

| Attribute | Value |
|---|---|
| Target window | December 2027-January 2028; exact window depends on the official 2027-2028 calendar once published (D-07); the bilingual school's first trimester closing falls in December 2027 |
| Description | The first complete first-semester closing cycle at semester-based pilots, under real peak-load conditions: grade lock, bulk generation and publication, publication notification; for the trimester-based school, the "report card" workload is shifted and tripled (December, March, June — journey-map §4.2). |
| Version(s) | MVP |
| Entry criteria | RDM-ZS-015; 2027-2028 periods configured. |
| Exit criteria | Publication of report cards for a 2,000-student school confirmed under 10 minutes in production; report cards versioned and verifiable; zero data loss or corruption; no uncontrolled delay overrun. |
| Dependencies | RDM-ZS-015; D-07. |
| Stakeholders | Teachers, school leadership, head supervisors, families. |
| Traceability | (→ §10 NFR-PERF; INV-ZS-085, ADR-ZS-020; ADR-ZS-035) |

#### RDM-ZS-002 — MVP-to-V1 transition: adoption, stability, and KPI criteria

| Attribute | Value |
|---|---|
| Target window | main review in spring 2028 (after the first complete first-semester closing of the 2027-2028 cycle); final confirmation after the June 2028 rollover; decision before the summer commercial campaign |
| Description | A formal transition review held in spring 2028 covering the first part of the pilot cycle (the 2027 school-year start, the first complete first-semester closing of December 2027-January 2028) and the adoption indicators accumulated since RDM-ZS-001, based on the indicators in `prd/cross-cutting/38-kpi-success-metrics.md` and the thresholds set at RDM-ZS-011; the spring review produces a recommendation. The final go/no-go decision is made after the second period closing and the June 2028 rollover, ahead of the summer commercial campaign. The transition gates the commercial launch (RDM-ZS-009): on a no-go, the product stays on MVP, a dated catch-up plan is launched, and the launch is pushed back one school-year start (impacting OQ-ZS-351). |
| Version(s) | MVP to V1 |
| Entry criteria | RDM-ZS-014 through RDM-ZS-016 completed; indicators consolidated; V1 compliance ready (`prd/cross-cutting/36-legal-compliance-data-protection.md`). |
| Exit criteria (measurable) | **Baseline non-functional gates (§10)**: at least 99.5% availability outside announced maintenance over the cycle; attendance-notification delay under 5 minutes; report-card generation under 3 seconds; publication for a 2,000-student school under 10 minutes; zero data loss or corruption; restoration tested quarterly. **Adoption gates (proposed targets, OQ-ZS-355)**: 100% of pilots active; roll call performed on at least 90% of class days; 100% of report cards published through ZSchool; daily finance active (tracked collections, automated reminders); a measured reduction in Massar double data entry; structured interviews with pilot school leadership conducted and analyzed. **Stability gates**: no critical (P1) incident left unresolved beyond 24 hours over the last quarter; a full DR plan tested with a failover to the Moroccan backup site (D-05, V1 disaster-recovery; off-site replication is active since MVP, INT-ZS-036); an immutable, exportable audit trail, tooled data-subject rights, and formalized CNDP compliance (rows 8-9 of §2.2; the manual formalities and procedures exist since MVP, ADR-ZS-066). |
| Dependencies | RDM-ZS-014 through RDM-ZS-016; `prd/cross-cutting/38-kpi-success-metrics.md` (KPIs); `prd/cross-cutting/36-legal-compliance-data-protection.md` (compliance). |
| Stakeholders | Project founder, product leadership, pilot school leadership. |
| Traceability | (→ §10, §12, §18 point 8, ADR-ZS-026, ADR-ZS-008) |

#### RDM-ZS-009 — V1 commercial launch on the Casablanca-Kénitra corridor

| Attribute | Value |
|---|---|
| Target window | summer 2028 commercial campaign (purchasing decisions concentrate in the re-enrollment season, from spring to summer); first commercial cohort at the 2028-2029 school-year start; ADR-ZS-008 target: 20 schools and 15,000 students by the end of year 1 (reference reading: the 2028-2029 school year — **hypothesis escalated to the founder, OQ-ZS-351, ADR-ZS-047, ADR-ZS-072**, since the baseline confirmed ADR-ZS-008 without this two-year shift) then a target of 300 schools and 200,000 students at three years |
| Description | Selling the single plan (MAD 5 per active student per month over 10 months, all modules included; consumables and services billed on top, ADR-ZS-009); standardized, industrialized onboarding built on the RDM-ZS-012 setup; ADR-ZS-030 positioning: cross-school global identity, a reliable parent app, Fatourati-based collections, an FR/AR interface; geographic focus: the Casablanca-Kénitra corridor, home to 70% of the 7,564 private schools (`prd/research/01`); a MOWAKABA financing-support case prepared without making it a firm sales argument until eligibility is confirmed (D-12). |
| Version(s) | V1 |
| Entry criteria | RDM-ZS-002 go decision issued; RDM-ZS-006 (Fatourati) operational at least in Collect mode; RDM-ZS-008 in production; onboarding capacity sized. |
| Exit criteria | At least 20 active schools and about 15,000 active students by the end of year 1 (OQ-ZS-351 reading), pilots included; onboarding time and per-school acquisition cost measured and trending down; no sales outside the corridor before consolidation; trial-to-paid conversion rate tracked (`prd/cross-cutting/38-kpi-success-metrics.md`). |
| Dependencies | RDM-ZS-002; RDM-ZS-008; RDM-ZS-006; D-12; team capacity (onboarding, support, training). |
| Stakeholders | Project founder, sales team, onboarding team, client school leadership. |
| Traceability | (→ ADR-ZS-030, ADR-ZS-008, ADR-ZS-009, §11, H-01; `prd/research/01` §1) |

#### RDM-ZS-008 — Capability: WhatsApp Business Platform and the 01/10/2026 pricing switch

| Attribute | Value |
|---|---|
| Target window | the switch parameter **specified in the PRD before 01/10/2026** (BEH-ZS-189, INT-WAP) and implemented at RDM-ZS-011 with the before/after rate card as data; the ZSchool WhatsApp Business account verified and the "absence" templates approved before 15/01/2027 (D-17, INT-ZS-024); rolled out with the pilots (RDM-ZS-001); rate cards monitored on an ongoing basis |
| Description | Implementation of ADR-ZS-036: at MVP, WhatsApp "utility" messaging limited to attendance notifications for opted-in parents (transfer basis: express consent with a notice on the cross-border data transfer, ADR-ZS-066 (§25c)) and SMS via a Moroccan aggregator as fallback, with no push; at V1, a push-first hierarchy (via PWA, with FCM/APNs entered in the sub-processor registry), full WhatsApp rollout, SMS as fallback (ADR-ZS-062 (§21b)). WhatsApp has been billed per message since 01/07/2025; as of **01/10/2026**, free service and utility messages within the 24-hour window end, and Morocco moves out of "Rest of Africa" regional pricing onto a standalone rate card (higher utility and authentication rates, plus international authentication) — the switch is modeled as a **dated parameter**, and costs for **both inbound and outbound** messages are budgeted. Utility templates approved by Meta (at MVP: absence; at V1: payment reminder and report card, alongside the full rollout); opt-in compliance (Law 09.08 and 2019 CNDP-ANRT guidance); credit counters and threshold alerts per school on the consumable packs (ADR-ZS-009). |
| Version(s) | MVP for attendance notifications (§12); V1 for the broader communication rollout (§12 V1) |
| Entry criteria | D-02 (Morocco standalone rate cards, to be obtained: not found as of 09/09/2026); D-17 (Meta Business verification, a single ZSchool account, templates approved before 15/01/2027); the access mode chosen (Meta's direct Cloud API or an official BSP reachable from Morocco); parent opt-in collected (RDM-ZS-012). |
| Exit criteria | The pricing switch operational as a dated parameter (before/after 01/10/2026 rate card); per-message cost charged to the school's pack and visible to the school; utility templates approved; delivery rate and average cost per notification measured; the SMS fallback plan tested. |
| Dependencies | D-02; RDM-ZS-012 (opt-in); `prd/cross-cutting/35-external-integrations.md` (INT-WAP); `prd/modules/17-communication-notifications.md`. |
| Stakeholders | Parents (recipients), school leadership and teachers (senders), ZSchool team (cost operations). |
| Traceability | (→ ADR-ZS-023, ADR-ZS-036, H-11, H-20; `prd/research/03` §4; correction #6; JMP-ZS-005, JMP-ZS-011) |

#### RDM-ZS-006 — Capability: Fatourati Collect then Aggregator

| Attribute | Value |
|---|---|
| Target window | **Aggregator go/no-go on 30/06/2027** (D-18, INT-ZS-010): a framework contract signed by that date, otherwise a per-school Collect fallback plan; connected during the pilot cycle (2027-2028) for a V1 launch; Collect first, then Aggregator (vendor API) |
| Description | ADR-ZS-031: Fatourati from V1 onward as the primary rail for school fees, **with no funds held** by ZSchool; the school remains the creditor and beneficiary. Sequence: **Fatourati Collect** (a plug-and-play web app used by the school) then **Fatourati Aggregator** (launched 17/02/2026: an API for software vendors — reference and QR generation, real-time debt lookup, payment confirmation, daily anti-duplicate reconciliation, per the Eduka reference integration). Parent channels: online banking, mobile wallets, ATMs, cash agents (over 25,000 points), Fatourati QR codes. |
| Version(s) | V1 |
| Entry criteria | D-06 and D-18 (contract and pricing negotiated, H-19, decision by 30/06/2027); CMI contact (sales.fatourati@cmi.co.ma) engaged from RDM-ZS-011; a degraded mode for ZSchool outages specified (INT-ZS-011); the FIN module's reconciliation ready (`prd/modules/16-finance-billing-collections.md`). |
| Exit criteria | At least one pilot live on Collect with verified daily reconciliation; the Aggregator agreement signed; commercial schools connected for the 2028 school-year start; the JMP-ZS-008 journey operational end to end (parent payment, confirmation, reconciliation with no duplicates). |
| Dependencies | D-06; each school's bank link for reconciliation; `prd/cross-cutting/35-external-integrations.md` (INT-FAT). |
| Stakeholders | Financial-guardian parents (payment), front offices and school leadership (tracking), ZSchool (technical connection, never holding funds). |
| Traceability | (→ ADR-ZS-031, H-09, H-19; `prd/research/03` §1; correction #8; JMP-ZS-008) |

#### RDM-ZS-017 — Capability: multi-school organizations

| Attribute | Value |
|---|---|
| Description | Rollout of organizations (school groups): consolidated views (headcount, attendance, results, unpaid fees) and shared administration **with no data merging**; the isolation tenant remains the school (INV-ZS-073, ADR-ZS-013); SaaS billing at the organization level (unit: active student, ADR-ZS-009). The "multi-site group of over 2,000 students" pilot (ADR-ZS-035) has an organization in read-only consolidated view from RDM-ZS-001 onward (creation, tenant linking, consolidated dashboard: BEH-ZS-004, BEH-ZS-249, PER-ZS-002 — ADR-ZS-041); shared administration, advanced comparisons, and group-level billing arrive with V1. |
| Version(s) | MVP (read-only view, wave 1); V1 (shared administration, group billing) |
| Entry criteria | Multi-tenant foundation in place since MVP; the read-only view delivered at RDM-ZS-004; RDM-ZS-002 (go) for the V1 portion. |
| Exit criteria | Consolidated views used by the pilot group's leadership (URS-ZS-001, URS-ZS-004); tenant isolation verified in a security audit (`prd/cross-cutting/31-security-privacy.md`); accurate organization-level billing across the ten months. |
| Dependencies | MVP multi-tenant architecture; RDM-ZS-002. |
| Stakeholders | Group leadership (URS-ZS-004), school leadership, ZSchool billing. |
| Traceability | (→ INV-ZS-073, INV-ZS-075, ADR-ZS-013, ADR-ZS-009) |

#### RDM-ZS-007 — Capability: native Android then iOS apps

| Attribute | Value |
|---|---|
| Target window | V2+, after V1 (adopted reading: `PROJECT.md` §10, aligned with NFR-ZS-022, UX-ZS-010, and INT-ZS-030; the divergence with §12 is escalated as ADR-ZS-071); Android first, iOS second (Android accounts for 67.96% of web traffic vs. 32.02% for iOS — a traffic share, not a device-fleet share: correction #10) |
| Description | Developing native parent, student, and teacher apps, with the MVP's PWA remaining the foundation; push notifications arrive at V1 via the PWA (Android, and iOS via an installed PWA: NFR-ZS-028), with the native apps adding reliability and low-bandwidth support (NFR-MOB and NFR-OFF domains). §10/§12 divergence: adopted reading = §10 (V2+), recorded in OQ-ZS-353 (resolved) and escalated for a baseline update (ADR-ZS-071). Naming is checked to avoid any app-store name collision (the "Skoolly" case: `prd/research/01` §2). |
| Version(s) | V2+ |
| Entry criteria | RDM-ZS-008 (PWA push in production); V1 stable; developer accounts. |
| Exit criteria | Native parent app published (Play Store then App Store); push success rate measured; roll-call and viewing journeys functional on low bandwidth; store ratings and feedback tracked (without making this a primary KPI, given the market's low app-store volumes, `prd/research/01` §4). |
| Dependencies | RDM-ZS-008; RDM-ZS-002; developer accounts and publishing. |
| Stakeholders | Parents, students, teachers (users); ZSchool mobile team. |
| Traceability | (→ §10, §12 V1, ADR-ZS-036, H-11; `prd/research/01` §4; `prd/research/05` §2) |

#### RDM-ZS-018 — V2+ capability: qualified seal and recurring bank-card payment

| Attribute | Value |
|---|---|
| Target window | V2+, after V1 has stabilized |
| Description | **Qualified seal and timestamp** (ADR-ZS-011) via a DGSSI-approved trust service provider (Barid eSign, AfricTRUST, or DamaneSign; approval is per service — signature, seal, and timestamp are distinct; no public pricing, D-10) for the leaving certificate, attestations, and transcripts. **Registered-card bank payment** (ADR-ZS-031) via NAPS e-Premium (1.98% excl. VAT domestic, Card-On-File), Chari Pay (tokenization, split payments, tiered from 1.8%), or a bank-affiliated payment-institution acquirer; the acquirer contract is held **by the school**, with ZSchool remaining a technical provider that never holds funds; direct debit is left to each school's own bank. |
| Version(s) | V2+ |
| Entry criteria | D-10 (provider chosen, pricing negotiated); D-11 (card rails); V1 stable; willing schools (acquirer contract). |
| Exit criteria | A provider contract covering all three services signed; the qualified seal applied to the targeted documents; recurring card payment operational at willing schools with reconciliation; no fund-holding by ZSchool found in audit. |
| Dependencies | D-10; D-11; school adoption; `prd/cross-cutting/35-external-integrations.md` (INT-SIG, INT-CAR). |
| Stakeholders | School leadership (signed documents), financial-guardian parents (recurring payment), front offices. |
| Traceability | (→ ADR-ZS-011, ADR-ZS-031, H-09; `prd/research/02` §4; `prd/research/03` §2; corrections #7 and #14) |

#### RDM-ZS-019 — V2+ capability: transport, canteen, and health

| Attribute | Value |
|---|---|
| Target window | V2+ |
| Description | Ancillary services (§7.13): school transport (routes, check-in, notification), canteen and after-school care (subscriptions, menus, check-in), extracurricular activities; and the health module (§7.14): a medical record and sensitive health data, never transferred automatically (ADR-ZS-019). Optional services may be made conditional on payment; the no-blocking-official-documents principle (ADR-ZS-005) remains unchanged. |
| Version(s) | V2+ |
| Entry criteria | V1 stable; prior CNDP authorization for health data (F112, D-15); a willing pilot school per module. |
| Exit criteria | Modules delivered with their journeys; full CNDP health compliance before activation at any pilot; no impact on existing critical journeys (regression verified). |
| Dependencies | RDM-ZS-002 and V1 in production; D-15; `prd/modules/22-ancillary-services-transport-canteen-activities.md`, `prd/modules/23-health-sensitive-data.md`; `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| Stakeholders | School leadership, parents, service staff, school nurse (health). |
| Traceability | (→ §7.13, §7.14, §12, ADR-ZS-019, ADR-ZS-005, G-14, H-15; D-15) |

#### RDM-ZS-020 — V2+ capability: school passport and professional teacher network

| Attribute | Value |
|---|---|
| Target window | V2+ |
| Description | **Digital school passport**: a consolidated, consent-based student journey (§6.9), built on `ConsentGrant` (scope, duration, revocation, logging) and the principle that the data subject retains permanent access to their published data (INV-ZS-080). **Professional teacher network**: a minimal public school directory (INV-ZS-075), search, discreet applications, and availability status (URS-ZS-032), with no notification to the teacher's current employer; no cross-rating or cross-recommendation (ADR-ZS-006, INV-ZS-087); only verified affiliation periods are shared (INV-ZS-072). These capabilities exploit the network effects described in §11 (multi-school parents, part-time teachers). |
| Version(s) | V2+ |
| Entry criteria | Global identity and verified affiliations in production; a critical mass of schools (per the ADR-ZS-008 trajectory); logged consents. |
| Exit criteria | The passport viewable with explicit sharing scopes and effective revocation; a teacher's job application invisible to their current employer (dedicated test); no cross-rating possible (audit). |
| Dependencies | The ADR-ZS-008 trajectory (critical mass); `prd/modules/18-transfers-mobility.md`, `prd/modules/19-teacher-career-network.md`, `prd/modules/15-documents-certificates.md`. |
| Stakeholders | Students and guardians (passport), teachers (network), schools (verification). |
| Traceability | (→ §6.9, §7.10, §11, ADR-ZS-006, INV-ZS-072, INV-ZS-075, INV-ZS-080, INV-ZS-087; URS-ZS-031, URS-ZS-032) |

#### RDM-ZS-010 — Recurring rhythm: maintenance windows and dated annual milestones

| Attribute | Value |
|---|---|
| Target window | permanent, every school year |
| Description | Implementation of the NFR-DISP domain (§10): a 99.5% availability target outside announced maintenance; **maintenance windows outside the school-year-start and exam periods**. Actual 2026-2027 calendar windows (`prd/research/04`): 18-25/10/2026 (resuming 26/10), 06-13/12/2026 (resuming 14/12), 24-31/01/2027 (resuming 01/02), 21-28/03/2027 (resuming 29/03), 09-16/05/2027 (resuming 17/05), and July-August (a usage lull with no SaaS billing, ADR-ZS-009 — the preferred window for version upgrades and onboarding). Dated annual milestones to orchestrate: the May ESISE census (D-08); the AREF campaign for external public-sector teachers (applications from 01/04 to 15/05, final authorization by end of September, a monthly list — D-13); exams (the national baccalaureate 01-03/06/2027 for the first occurrence; regional calendars published by ministerial notice at the start of the year — D-14); the June rollover (RDM-ZS-003); the September school-year start; movable religious holidays confirmed by the Ministry of Islamic Affairs a few days beforehand (Ramadan 1448 from 08/02 to 09-10/03/2027; Eid al-Adha from 16 to 18/05/2027 — indicative); regulatory monitoring (Law 59.21 decrees, D-03) and pricing monitoring (Meta, BSPs — D-02). |
| Version(s) | all versions |
| Entry criteria | An annual operations plan set at the end of each school year. |
| Exit criteria (per cycle) | 100% of version upgrades scheduled within holiday windows or July-August; zero heavy maintenance in September or during national and regional exam windows; the N+1 official calendar preloaded before 1 July; "to confirm" religious holidays updated within 48 hours of the Ministry of Islamic Affairs' announcement; the monitoring register kept up to date. |
| Dependencies | D-01, D-02, D-03, D-07, D-08, D-13, D-14; `prd/cross-cutting/32-non-functional-requirements.md` (NFR-DISP). |
| Stakeholders | ZSchool operations team, schools (window notifications). |
| Traceability | (→ §10 NFR-DISP, ADR-ZS-009, G-11; `prd/research/04` §3; corrections #1, #17, #18) |

#### RDM-ZS-021 — Wave 1 development: identity, enrollment, structure, data-migration foundation

| Attribute | Value |
|---|---|
| Target window | mid-November 2026 |
| Description | The first slice of wave 1: global identities and a login identifier separate from the contact identifier (INV-ZS-003, SEC-ZS-002), accounts and phone-number changes (BEH-ZS-020, SEC-ZS-004), student and guardian matching (BEH-ZS-026, BEH-ZS-027, BEH-ZS-031, ADR-ZS-050), account claiming with a knowledge challenge (BEH-ZS-028), the full MVP state machine with import-based activation (BEH-ZS-035, BEH-ZS-047, ADR-ZS-044), the national academic structure and calendar (BEH-ZS-051 to BEH-ZS-055, BEH-ZS-066), declared class sessions (BEH-ZS-070), Excel import extended to cover mid-year data migration (BEH-ZS-006, ADR-ZS-043), the organization in read-only consolidated view (BEH-ZS-004). |
| Version(s) | MVP (wave 1) |
| Entry criteria | RDM-ZS-011; team sized (§5.2); development and UAT environments. |
| Exit criteria | An anonymized real pilot file of 2,000 students imported with guardians, paid schedules, and cheques in hand, with no unflagged duplicate; import-based activation logged; context switching and multi-profile accounts demonstrated; a minor student with no phone connected via a generated identifier. |
| Dependencies | RDM-ZS-011; pilot file samples (D-09); D-16 underway (CNDP filings). |
| Stakeholders | Development team, product team. |
| Traceability | (→ ADR-ZS-043, ADR-ZS-044, ADR-ZS-048, ADR-ZS-049, ADR-ZS-050; INV-ZS-003; JMP-ZS-003, JMP-ZS-004) |

#### RDM-ZS-022 — Wave 1 development: attendance, notifications, basic finance, enrollment documents

| Attribute | Value |
|---|---|
| Target window | mid-December 2026 |
| Description | The second slice of wave 1: offline mobile roll call by declared session (BEH-ZS-081 to BEH-ZS-083), same-day first-absence notification with hold-back and correction (BEH-ZS-084, BEH-ZS-105, BEH-ZS-191), parent- and front-desk-side justification (BEH-ZS-087, BEH-ZS-104), an unfulfilled session (BEH-ZS-071); basic finance with cheques, numbered receipts, family payments, reversal via a counter-entry, sibling discount, account statement, parents' contract (BEH-ZS-151 to BEH-ZS-154, BEH-ZS-157, BEH-ZS-160, BEH-ZS-162, BEH-ZS-167, BEH-ZS-168, BEH-ZS-174, BEH-ZS-179, BEH-ZS-180); enrollment documents, school-attendance certificate, exit file (BEH-ZS-131, BEH-ZS-139, BEH-ZS-144); announcements, messages, moderated threads, per-person language preference (BEH-ZS-181 to BEH-ZS-185, BEH-ZS-197); grade entry and progressive publication (BEH-ZS-113, BEH-ZS-114, BEH-ZS-129); dashboards (BEH-ZS-241, BEH-ZS-244 to BEH-ZS-246). |
| Version(s) | MVP (wave 1) |
| Entry criteria | RDM-ZS-021; SMS aggregator contracted; WhatsApp rate card obtained (D-02). |
| Exit criteria | Journeys JMP-ZS-005, JMP-ZS-006 (grade entry), JMP-ZS-007, and JMP-ZS-011 demonstrated end to end on mobile and on older PCs (NFR-ZS-026); notification handed off to the carrier within 5 minutes after validation under load testing; receipts, reversals, and family payments compliant with INV-ZS-017. |
| Dependencies | RDM-ZS-021; D-02; SMS contract. |
| Stakeholders | Development team, QA team, pilot points of contact (usability review). |
| Traceability | (→ ADR-ZS-045, ADR-ZS-046, ADR-ZS-056, ADR-ZS-058, ADR-ZS-061, ADR-ZS-062; JMP-ZS-005, JMP-ZS-006, JMP-ZS-007, JMP-ZS-011) |

#### RDM-ZS-023 — Pilot UAT on anonymized real data, and rehearsal of the mid-year data migration

| Attribute | Value |
|---|---|
| Target window | mid-January 2027 |
| Description | Wave 1 user acceptance testing with pilot points of contact on an anonymized copy of their real data; a full rehearsal of the mid-year data migration (import, activation, mid-year payment schedules, cheques, first-semester grades); load testing at ADR-ZS-035 profile sizes; iOS and Android acceptance testing on the PWA (NFR-ZS-028); RTL and Arabic PDF typography acceptance testing (NFR-DOC). |
| Version(s) | MVP (wave 1) |
| Entry criteria | RDM-ZS-022; anonymized real files for the four ADR-ZS-035 profiles. |
| Exit criteria | No blocking defect left open; the mid-year data migration replayed with no payment-schedule discrepancy; FR/AR training materials ready (guides, short videos); RDM-ZS-004 declared. |
| Dependencies | RDM-ZS-022; pilot point-of-contact availability. |
| Stakeholders | QA team, pilot points of contact, ZSchool Success team (training). |
| Traceability | (→ ADR-ZS-043, ADR-ZS-066 (§25q), ADR-ZS-066 (§25r); ADR-ZS-035) |

#### RDM-ZS-013 — Pre-pilot compliance and security gate

| Attribute | Value |
|---|---|
| Target window | cleared before 31/01/2027; CNDP filings submitted before 15/12/2026 |
| Description | No pilot is activated (RDM-ZS-001) until this gate is cleared (ADR-ZS-066): (a) F211 (or F214) filings for each pilot, and ZSchool's own filing as data controller for the global identity layer (ADR-ZS-027), submitted before 15/12/2026 (CNF-ZS-001, D-16); an F112 application filed for adults' national ID numbers, with the national-ID field left disabled until the authorization is granted (CNF-ZS-008, SEC-ZS-016); (b) a pilot data-processing agreement signed with each school (CNF-ZS-002, D-20); (c) the ZSchool WhatsApp Business account verified, templates approved, opt-in collected with a cross-border transfer notice, and an F118 application filed in parallel (CNF-ZS-004, INT-ZS-024, D-17); (d) a first independent penetration test performed, with critical findings remediated (SEC-ZS-027, D-19); (e) daily replication of encrypted backups to a second Moroccan site operational, with tested restoration (SEC-ZS-026, INT-ZS-036); (f) a manual data-subject-rights procedure and a data-protection point of contact in place (CNF-ZS-003, CNF-ZS-026). |
| Version(s) | MVP (wave 1) |
| Entry criteria | RDM-ZS-011; ZSchool's CNDP templates ready (CNF-ZS-007); a backup-hosting contract signed. |
| Exit criteria | CNDP receipts obtained, or filings dated before 15/12/2026; agreements signed; a penetration-test report with no open critical finding; a successful off-site restoration exercise; an up-to-date sub-processor register (CNF-ZS-012, including FCM/APNs and monitoring). |
| Dependencies | D-16, D-17, D-19, D-20; `prd/cross-cutting/31-security-privacy.md`; `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| Stakeholders | ZSchool compliance, technical leadership, pilot school leadership. |
| Traceability | (→ ADR-ZS-066; ADR-ZS-027, ADR-ZS-007, Law 09.08; CNF-ZS-008, CNF-ZS-004, CNF-ZS-003, CNF-ZS-002, CNF-ZS-012, CNF-ZS-001, CNF-ZS-026; SEC-ZS-016, SEC-ZS-026, SEC-ZS-027; INT-ZS-036, INT-ZS-024) |

#### RDM-ZS-024 — Wave 2 development: year-end closing

| Attribute | Value |
|---|---|
| Target window | delivery before 31/05/2027 (pilot UAT in May) |
| Description | The wave-2 requirements (§2.1 bis): class-council decisions and comments with simplified minutes (BEH-ZS-123), the annual transcript (BEH-ZS-128), the rollover and the pre-filled re-enrollment campaign (BEH-ZS-040, BEH-ZS-041, BEH-ZS-043, BEH-ZS-044), structure cloning (BEH-ZS-057), Massar exports with versioned templates, a trimester-to-semester mapping, and a validation report (BEH-ZS-262 to BEH-ZS-265), batch certificates (BEH-ZS-145), a compliance check issued as a warning (BEH-ZS-116). |
| Version(s) | MVP (wave 2) |
| Entry criteria | RDM-ZS-001 underway at at least two pilots; real pilot Massar files collected (D-09). |
| Exit criteria | The rollover replayed on the anonymized copy of the 2,000-student group with no N+1 duplicate and no orphaned enrollment; Massar exports compared against real pilot files with no blocking discrepancy; delivery outside exam windows (RDM-ZS-010). |
| Dependencies | RDM-ZS-001; D-09; D-14. |
| Stakeholders | Development team, QA team, pilot front offices and school leadership (UAT). |
| Traceability | (→ ADR-ZS-041, ADR-ZS-044, ADR-ZS-058; INV-ZS-059, INV-ZS-077; RDM-ZS-005, RDM-ZS-003) |

### 3.3 Acceptance criteria (Gherkin excerpts)

```gherkin
Feature: Year-end rollover before students leave (RDM-ZS-003)
  Scenario: Year N+1 is ready before the end of June
    Given the year-end report cards are published and the year-end decisions are entered
    When school leadership launches the rollover for a pilot school
    Then N+1 enrollments are created in PRE-ENROLLED status, classes are assigned, and N+1 payment schedules are generated before 30 June
    And every student present at closing moves to COMPLETED with their decision, with leaving students having no N+1 enrollment (ADR-ZS-044)
    And any remaining balance for each leaving student is retained (INV-ZS-062)
    And no N+1 enrollment is created for a student who already has a non-terminal one (INV-ZS-058, ADR-ZS-044 (§03f))
    And the national baccalaureate exam window (01-03/06/2027 for the first occurrence) stays free of any heavy operation

Feature: Pre-pilot compliance and security gate (RDM-ZS-013, ADR-ZS-066)
  Scenario: Pilot activation is conditional on the gate
    Given a pilot school whose onboarding is complete (RDM-ZS-012)
    When the team requests activation (RDM-ZS-001)
    Then activation is only possible if the pilot's CNDP filing and ZSchool's own filing were submitted before 15/12/2026
    And if the pilot data-processing agreement is signed
    And if the penetration-test report has no open critical finding
    And if off-site backup replication is active with tested restoration
    And if the adults' national-ID field stays disabled until the F112 authorization is obtained

Feature: MVP-to-V1 transition (RDM-ZS-002)
  Scenario: Decision based on measurable criteria
    Given 3 to 5 ADR-ZS-035 pilots have completed the first part of the annual cycle (the 2027 school-year start, the first complete first-semester closing of December 2027-January 2028)
    When the transition review computes the indicators from prd/cross-cutting/38-kpi-success-metrics.md
    Then the transition is granted if availability is at least 99.5% outside announced maintenance
    And if the absence-notification delay is under 5 minutes
    And if report-card generation is under 3 seconds and publishing 2,000 report cards is under 10 minutes
    And if no data loss or corruption is found over the cycle
    And if any adoption or stability criterion is not met, the decision is no-go
    And in that case a dated catch-up plan is launched and the commercial launch (RDM-ZS-009) is pushed back one school-year start
    And the spring 2028 review issues a recommendation on these criteria, with the final go/no-go decision made after the second period closing and the June 2028 rollover

Feature: Maintenance window (RDM-ZS-010, NFR-DISP domain)
  Scenario: Scheduling a heavy operation
    Given a version upgrade or a heavy support operation to schedule
    When the window is proposed
    Then it falls within a holiday period (18-25/10, 06-13/12, 24-31/01, 21-28/03, 09-16/05) or in July-August
    And it is never scheduled in September or during national and regional exam periods

Feature: WhatsApp pricing switch of 01/10/2026 (RDM-ZS-008, ADR-ZS-036)
  Scenario: Cost charged after the switch
    Given the Morocco standalone rate card applicable from 01/10/2026
    When a utility message is delivered to an opted-in parent
    Then the cost, whether outbound or inbound, is charged to the school's pack per the rate card in effect on the delivery date
    And the credit counter triggers a threshold alert before running out
    And if credits run out, attendance and security messages fall back to alias SMS up to the overdraft cap (BEH-ZS-188), and all other messages fall back to in-app notification
    And at MVP no push notification is attempted (ADR-ZS-062 (§21b))
```

---

## 4. Dated external dependencies and fallback plans

Every external claim below comes from `prd/research/00-baseline-corrections.md` and `prd/research/01` through `prd/research/05`, where each fact is referenced with its source. The `D-NN` identifiers are local to this file.

| ID | Dependency | Deadline / date | Source | Milestones affected | Fallback plan |
|---|---|---|---|---|---|
| D-01 | Time zone: permanent return to UTC+0, with no seasonal alternation and no Ramadan exception | Effective since 20/09/2026 at 02:00 (Decree No. 2.26.530; Official Gazette No. 7521 of 29/06/2026) | `prd/research/04` §3; correction #1 | RDM-ZS-011, RDM-ZS-001, RDM-ZS-010 | Settled fact: time-zone data current, storage in UTC, Official Gazette monitoring. Ramadan schedule variants remain configurable as shortened hours. |
| D-02 | Morocco standalone WhatsApp rate cards (end of free service/utility messages within the 24-hour window; exit from "Rest of Africa") | Switch on 01/10/2026; rate cards announced before 01/09/2026 but **not obtained as of 09/09/2026** (to obtain: action item in `prd/cross-cutting/40`, OQ-ZS-356) | `prd/research/03` §4; H-20; correction #6 | RDM-ZS-008 | Push (free) as the first channel; alias SMS as fallback; credit caps and alerts; annual reassessment of the access mode (Meta's direct Cloud API or a flat-fee BSP at about USD 59/month); budgeting for inbound messages. |
| D-03 | Law 59.21 implementing decrees (parents' contract template, fee-publication rules, sanctions) | 35 decrees expected; law published in Official Gazette No. 7485 of 23/02/2026 | `prd/research/02` §1; correction #2 | RDM-ZS-011, RDM-ZS-019; contract and document modules | Contract and document templates configurable with no schema overhaul; compliant with the current regime in the meantime; regulatory monitoring carried by `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| D-04 | E-invoicing decree | Not published as of 09/09/2026 (draft with the General Secretariat of Government in April 2026; announced rollout waves: large enterprises 2026, mid-size/SMEs 2027-2028, micro-enterprises after 2028; B2C not planned) | H-08, H-17; correction #15 | `prd/modules/16-finance-billing-collections.md` (V1) | A structured UBL export prepared, phased against decree publication; most schools (B2C clients, individual parents) out of scope initially; compliant accounting exports in the meantime. |
| D-05 | A second Oracle region in Morocco (Settat) | Planned, no published timeline; the Casablanca region `af-casablanca-1` opened in April 2026 with a single availability domain | H-18; correction #13; `prd/research/05` §1 | RDM-ZS-013 (MVP replication); RDM-ZS-002 (full V1 disaster recovery); `prd/cross-cutting/32-non-functional-requirements.md` | **From MVP onward**: daily replication of encrypted backups to a second Moroccan site (SEC-ZS-026, INT-ZS-036; Atlas Cloud Benguérir — Tier III + IV, ISO 27001, PCI DSS — or OVHcloud Local Zone Rabat), with tested restoration; **at V1**: a full DR plan with failover (SEC-ZS-025, NFR-ZS-009); failover to Settat once it opens; a service-by-service OCI catalogue check at launch (ADR-ZS-066 (§25h)). |
| D-06 | Fatourati Aggregator contract and pricing | To be negotiated; no public pricing; the Aggregator offering launched 17/02/2026; contact sales.fatourati@cmi.co.ma | H-19; correction #8; `prd/research/03` §1 | RDM-ZS-006 | Start with per-school Fatourati Collect (standalone); basic channels (cash, cheque, bank transfer) unchanged; the Aggregator agreement delays a capability, not the V1 version itself. |
| D-07 | Official 2027-2028 school calendar | Not published as of 09/09/2026; the recent pattern places the student intake in early September with classes compulsory from the first Monday | `prd/research/04` §3 | RDM-ZS-015, RDM-ZS-016 | The 2026-2027 calendar preloaded as a seasonal template; manual per-school entry; religious holidays carried as "to confirm" and updated during the year (Ministry of Islamic Affairs). |
| D-08 | ESISE formats (private-school census, HR registry, May census, year-end results) | Forms not found online; annual May census | H-10; `prd/research/04` §2 | `prd/modules/21-massar-regulatory-exports.md` (V1) | Manual Excel exports validated with the pilots; an ESISE data mirror; real formats collected from the pilots (RDM-ZS-012). |
| D-09 | Structure of Massar grade Excel files (download then re-upload) | Not publicly documented; the re-upload is fragile even with no changes made | H-04; correction #11 | RDM-ZS-005 | Faithful generation per subject and per semester, with a validation report before submission; testing on real pilot files; no promise of synchronization. |
| D-10 | Qualified seal and timestamp provider (V2) | Approval is per service (signature, seal, timestamp); no public pricing; Barid eSign approved as a qualified trust service provider (January 2025) with qualified timestamping (April 2026); DamaneSign (March 2025); AfricTRUST (June 2026) | ADR-ZS-011; correction #14; `prd/research/02` §4 | RDM-ZS-018 | V1's advanced seal with timestamp and QR code (ADR-ZS-011) remains the document standard, admissible in court without a presumption of validity; selecting a provider covering all three services. |
| D-11 | Recurring bank-card rails (V2) | Available: NAPS e-Premium (1.98% excl. VAT domestic), Chari Pay (tokenization, tiered from 1.8%), bank-affiliated payment-institution acquirers since the CMI contract transfer completed 31/01/2026; YouCan Pay closed since January 2024 | H-09; correction #7; `prd/research/03` §2 | RDM-ZS-018 | Two candidate rails, plus bank-affiliated payment-institution acquirers as an alternative; the acquirer contract held by the school; direct debit left to each school's own bank. |
| D-12 | Private-school eligibility for the MOWAKABA program | Unconfirmed (80% for SMEs / 90% for micro-enterprises of costs, projects of MAD 15,000 to 150,000, 4-6 week approval time) | H-22; correction #20; `prd/research/02` §9 | RDM-ZS-009 | Launch with no subsidy; a MOWAKABA case prepared as financing support (onboarding, configuration, and training as eligible services); a cautious sales pitch until confirmed. |
| D-13 | The annual AREF cycle for external public-sector teachers (11/11/2024 circular) | Applications from 01/04 to 15/05; preliminary then final authorization by end of September; an 8-hour weekly cap; a monthly list submitted to the AREF | correction #18; `prd/research/02` §8 | `prd/modules/19-teacher-career-network.md` (BEH-ZS-231 to BEH-ZS-233, V1); RDM-ZS-010 | Manual tracking by the school; monthly reporting prepared by the platform once the CAR module is available; the aggregated hour count is visible only to the teacher (ADR-ZS-064 (§23a)). |
| D-14 | Each year's exam calendars (national and regional) | 2027 national baccalaureate: 01-03/06/2027; regional calendars published by ministerial notice at the start of the year | `prd/research/04` §3 | RDM-ZS-003, RDM-ZS-010 | Manual configuration of exam windows; a freeze on heavy operations during known national and regional windows. |
| D-16 | Pre-pilot CNDP filings: each pilot's F211 (or F214) filing using the ZSchool templates, ZSchool's own filing (ADR-ZS-027), an F112 application for adults' national ID numbers | Submitted before 15/12/2026; F112 review takes two to four months, with the national-ID field disabled until authorization | ADR-ZS-066 (§25a)/b; `prd/research/02` §2; CNF-ZS-001 | RDM-ZS-013, RDM-ZS-001 | If a receipt is missing by 31/01/2027: the affected pilot's go-live is delayed; if F112 is not obtained: the national ID number is not collected, with no effect on the rest of the scope. |
| D-17 | The ZSchool WhatsApp Business account verified by Meta and the "absence" templates approved | Before 15/01/2027 (Meta's approval timelines are outside our control) | ADR-ZS-062 (§21g), ADR-ZS-066 (§25c); INT-ZS-024 | RDM-ZS-008, RDM-ZS-013, RDM-ZS-001 | Pilots start on in-app + SMS only until approval; SMS is sufficient for the JMP-ZS-005 journey. |
| D-18 | Go/no-go decision on the Fatourati Aggregator framework contract | 30/06/2027 | ADR-ZS-066; INT-ZS-010; H-19 | RDM-ZS-006, RDM-ZS-009 | Plan B: per-school Fatourati Collect (a direct school-CMI contract), reconciliation via statement import; V1 is not delayed. |
| D-19 | First independent penetration test | Report before 31/01/2027, critical findings remediated before RDM-ZS-001 | ADR-ZS-066 (§25g); SEC-ZS-027 | RDM-ZS-013, RDM-ZS-001 | Activation delayed as long as a critical finding remains open. |
| D-20 | Pilot data-processing agreement (Law 09.08, ADR-ZS-027) signed with each pilot | Before each pilot's activation | ADR-ZS-066 (§25e); CNF-ZS-002 | RDM-ZS-012, RDM-ZS-013, RDM-ZS-001 | No real data loaded before signature; onboarding continues with demo data. |
| D-15 | Prior CNDP authorization F112 for processing health data (art. 12 of Law 09.08) | Two-to-four-month review time; filed at least four months before activating the health module at any pilot | `prd/research/02-regulatory-data.md` §2; correction #19 | RDM-ZS-019; `prd/modules/23-health-sensitive-data.md`; `prd/cross-cutting/36-legal-compliance-data-protection.md` | As long as the authorization is not obtained, no health-data collection is activated at any pilot (feature freeze, RSK-ZS-019); an early filing during the V1 cycle via CNDP-FORMS; health data is never transferred automatically (ADR-ZS-019). |

---

## 5. Scheduling risks, critical path, and seasonality

### 5.1 Scheduling risks (cross-reference to the `prd/cross-cutting/39-risks-mitigations.md` register)

The consolidated risk register (`RSK-ZS-NNN` identifiers) is carried by `prd/cross-cutting/39-risks-mitigations.md`; this chapter creates no identifier of its own and only links milestones to the risks that threaten them. Baseline §18 point 9 identifies four risks to manage: Massar (RSK-ZS-008), hosting (RSK-ZS-011), teacher adoption (RSK-ZS-001), sales seasonality (RSK-ZS-009).

| Risk (register 39) | Critical window | Milestones exposed | Mitigation carried by the roadmap |
|---|---|---|---|
| RSK-ZS-003 — MVP schedule slip and team capacity | October 2026 - January 2027 | RDM-ZS-021 to RDM-ZS-013, RDM-ZS-004, RDM-ZS-001 | Monthly intermediate milestones; a switch-over trigger to "first go-live at the 2027-2028 school-year start" set at 30/04/2027; a hard cut outside §2.1 and §2.1 bis |
| RSK-ZS-010 — School-year-start peak | September (every year) | RDM-ZS-015 | Load testing at ADR-ZS-035 profile sizes; a version freeze in September (RDM-ZS-010); reinforced support |
| RSK-ZS-010 — Closing and class-council peaks | December-January, March, June (tripled for the trimester-based school) | RDM-ZS-005, RDM-ZS-016 | NFR-PERF sizing; scheduled closing assistance; staggered grade locks |
| RSK-ZS-003 / RSK-ZS-008 — The June rollover, a point of no return | June (every year) | RDM-ZS-003, RDM-ZS-024 | Wave 2 delivered before 31/05/2027 and rehearsed on an anonymized copy; batch processing with retry and rollback; the exam window preserved |
| RSK-ZS-011 — Downtime during exams | June (baccalaureate 01-03/06/2027; regional windows) | RDM-ZS-005, RDM-ZS-010 | Zero maintenance during these windows; off-site replication since MVP; an incident-communication plan |
| RSK-ZS-013 / D-01 — Movable religious holidays | winter and spring (Ramadan 1448: 08/02 - 09/03/2027; Eid al-Adha: 16-18/05/2027) | RDM-ZS-001, RDM-ZS-010 | Preloading as "to confirm"; a 48-hour update turnaround; configurable schedule variants (G-11) |
| RSK-ZS-009 — Sales seasonality | March - September | RDM-ZS-002, RDM-ZS-009 | A go decision before summer 2028; pilot references; a MOWAKABA case (D-12); presales with a school-year-start launch |
| RSK-ZS-001 — Teacher adoption | February 2027 then all year | RDM-ZS-001, RDM-ZS-014, RDM-ZS-002 | RDM-ZS-012 training; the RDM-ZS-014 loop; mobile-first simplicity and offline support; optional MFA for teachers (ADR-ZS-066 (§25l)) |
| RSK-ZS-008 — Massar: undocumented files, fragile re-upload; ESISE with no public formats | closings and the May census | RDM-ZS-005, RDM-ZS-024 | Faithful generation with a validation report (D-09); testing on real files from RDM-ZS-012 onward; ESISE formats collected (D-08); no promise of synchronization (H-04) |
| RSK-ZS-011 — Hosting on a single availability domain | September, December-January, June | RDM-ZS-013, RDM-ZS-015, RDM-ZS-016 | Off-site replication since MVP (INT-ZS-036); a full V1 disaster-recovery plan (D-05); no version upgrade at peak |
| RSK-ZS-005 — Consumable costs after the WhatsApp switch | from 01/10/2026 onward | RDM-ZS-008 | The rate card obtained (D-02); counters and alerts; authentication SMS charged to ZSchool (PAK-ZS-002); free push from V1 onward |
| RSK-ZS-017 — Entrenched competition on the corridor | commercial campaign (spring-summer) | RDM-ZS-009 | ADR-ZS-030 positioning; pilot references; differentiation documented in `prd/research/01` |
| RSK-ZS-023 — A pilot dropping out mid-year | February 2027 - June 2028 | RDM-ZS-014, RDM-ZS-002 | A pilot agreement with a duration commitment; a backup pilot identified (a fifth profile); RDM-ZS-002 criteria readable with four pilots |
| RSK-ZS-027 — The Fatourati contract not finalized | 30/06/2027 | RDM-ZS-006, RDM-ZS-009 | A dated go/no-go (D-18); Collect as a fallback plan |
| RSK-ZS-028 — CNDP filings not obtained before go-live | 15/12/2026 - 31/01/2027 | RDM-ZS-013, RDM-ZS-001 | An early filing (D-16); go-live delayed pilot by pilot; national ID numbers not collected |
| RSK-ZS-004 — MVP scope extension not confirmed by the founder | before RDM-ZS-011 | RDM-ZS-011, RDM-ZS-004, RDM-ZS-024 | The ADR-ZS-073 decision requested before the freeze; a fallback scenario: pushing RDM-ZS-005 and RDM-ZS-003 into an "assisted manual closing" with the founder's explicit waiver |

### 5.2 Critical path (elements missing from version 0.1)

| Item | Planning requirement | Milestones | Owner |
|---|---|---|---|
| Development team | Sizing settled at RDM-ZS-011 against wave-1 and wave-2 workload (about 110 MVP requirements to deliver between October 2026 and May 2027); hiring or reinforcement started before 15/10/2026; a velocity review at each intermediate milestone (RDM-ZS-021 to RDM-ZS-023) | RDM-ZS-011, RDM-ZS-021 to RDM-ZS-023, RDM-ZS-024 | ZSchool technical leadership |
| Pilot support | A standard support commitment (NFR-ZS-014: channel, hours, response times, FR/AR) published before RDM-ZS-001; reinforced on-call coverage in February-March 2027, June 2027, and September 2027; critical-ticket resolution time (24 hours) tracked | RDM-ZS-001, RDM-ZS-003, RDM-ZS-015 | ZSchool Success and support |
| Training | FR and AR materials (short role-based guides, videos, a test dataset) ready at RDM-ZS-023; role-based sessions at each pilot before go-live; a point of contact per school | RDM-ZS-023, RDM-ZS-012 | ZSchool Success |
| Data migration | A migration file template (paid schedules, cheques, first-semester grades) handed to pilots at RDM-ZS-023; rehearsed on an anonymized copy before go-live; a post-import quality check before activating parent accounts (RSK-ZS-021) | RDM-ZS-021, RDM-ZS-023, RDM-ZS-012 | ZSchool product and Success |
| Compliance and security | The RDM-ZS-013 gate (CNDP filings, pilot agreement, WhatsApp Business, penetration test, off-site replication) | RDM-ZS-013 | ZSchool compliance and technical leadership |
| Founder decisions | ADR-ZS-072 (ADR-ZS-008 horizon) and ADR-ZS-073 (MVP extension) settled before RDM-ZS-011; ADR-ZS-071 (baseline update) before RDM-ZS-004 | RDM-ZS-011, RDM-ZS-004 | Project founder |

---

## Open Questions

| ID | Question | Context |
|---|---|---|
| OQ-ZS-351 | **Escalated — ADR-ZS-072 (ADR-ZS-047)**: How to read ADR-ZS-008's "year 1" and "at three years" (the volume ambition is confirmed by the founder; its calendar anchor is not). | Reference reading adopted here: year 1 = the 2028-2029 school year (the first year including a commercial cohort after the RDM-ZS-002 transition), i.e. 20 schools and 15,000 students by summer 2029, and 300 schools and 200,000 students by summer 2031 ("at three years" from the 2028 school-year start). Alternative reading: year 1 = 2027-2028 (pilots and first contracts), which would require an MVP-to-V1 go decision as early as summer 2027. Impact: the numeric criteria of RDM-ZS-002 and RDM-ZS-009. To be confirmed by the founder. |
| OQ-ZS-352 | **Resolved — ADR-ZS-043**: Pilot onboarding mode: progressive mid-year onboarding into the 2026-2027 school year (RDM-ZS-001, from 01/02/2027) with mid-year data migration (extended BEH-ZS-006, BEH-ZS-047); the switch to "first go-live at the 2027-2028 school-year start" remains RSK-ZS-003's fallback plan (trigger on 30/04/2027). | The reference scenario adopts progressive mid-year onboarding provided the MVP core (RDM-ZS-004) is validated in time; the switch-over point between scenarios is set at 30 April 2027. A pilot onboarded mid-year does not experience a full school-year start before September 2027 (RDM-ZS-015). To be confirmed by the founder. |
| OQ-ZS-353 | **Resolved — 09/09/2026 review (aligned with NFR-ZS-022, UX-ZS-010, INT-ZS-030; ADR-ZS-071 for the baseline)**: Native apps: §12 places them in V1, §10 places them in V2; adopted reading is V2+, with push in V1 via PWA. | Reference reading: §12 (V1), Android first (ADR-ZS-036); the PWA remains the foundation regardless of the outcome. To be settled in review; impact: RDM-ZS-007. |
| OQ-ZS-354 | **Escalated — ADR-ZS-071**: Update `PROJECT.md`: divergences documented in `prd/research/00-baseline-corrections.md` and the review's arbitrations (`prd/cross-cutting/42-review-arbitrations.md` §3). | Permanent UTC+0 since 20/09/2026 (Decree No. 2.26.530; baseline §2.4/§10 still describes seasonal alternation with a Ramadan exception); memos 080.21 and 081.21 suspended on 29/11/2021 (baseline §2.2 says November 2022); YouCan Pay closed since January 2024 (baseline §2.8 still cites it); Massar note 1887/13 not corroborated (§16.2, H-16). This chapter uses the up-to-date data; the baseline update is to be carried into its next version. |
| OQ-ZS-355 | **Resolved — ADR-ZS-042 (§26h)**: Numeric thresholds for the MVP-to-V1 adoption criteria, carried by `prd/cross-cutting/38-kpi-success-metrics.md` with a pilot baseline (KPI-ZS-012) measured before activation. | The non-functional gates (99.5%; under 5 minutes; under 3 seconds; under 10 minutes) come from baseline §10 and are non-negotiable. The adoption thresholds proposed at RDM-ZS-002 (share of class days with a roll call performed, share of report cards published through ZSchool, school-leadership satisfaction) are working targets: to be confirmed by the founder and detailed in `prd/cross-cutting/38-kpi-success-metrics.md` at RDM-ZS-011. |
| OQ-ZS-356 | **Resolved — ADR-ZS-066**: MVP support service levels carried by NFR-ZS-014 (`prd/cross-cutting/32-non-functional-requirements.md`), including "a critical ticket resolved within 24 hours"; numeric values to be confirmed by the founder (OQ-ZS-288 in `spec/cross-cutting/03-non-functional-requirements.md`). | Baseline §10 carries an NFR-SAV domain with no numeric threshold; RDM-ZS-002's non-functional gates cover the platform, not support, and OQ-ZS-355 covers the MVP-to-V1 adoption thresholds. Targets to be confirmed by the founder and detailed in `prd/cross-cutting/32-non-functional-requirements.md` (NFR-ZS-014) and `prd/cross-cutting/38-kpi-success-metrics.md`. Impact: RDM-ZS-015. |
| OQ-ZS-357 | **Escalated — ADR-ZS-073 (ADR-ZS-041)**: Founder confirmation of the two-wave MVP scope extension (§2.1 bis) and its development workload before February 2027. | Without confirmation before RDM-ZS-011, RSK-ZS-004's fallback scenario applies (an assisted manual year-end closing in June 2027, with an explicit founder waiver). |

---

## Traceability

| Baseline / source ID | Covered in this file |
|---|---|
| `PROJECT.md` §10 (non-functional requirements) | RDM-ZS-004, RDM-ZS-015, RDM-ZS-016, RDM-ZS-002, RDM-ZS-010, §5 |
| `PROJECT.md` §11 (business model) | RDM-ZS-009, RDM-ZS-017, §2.4 |
| `PROJECT.md` §12 (scope by version, G-22) | §2 (MVP, V1, V2+ tables), RDM-ZS-011, RDM-ZS-002 |
| `PROJECT.md` §16 (H-01, H-04, H-08 to H-10, H-15, H-17 to H-20, H-22) | §4 (D-02, D-04, D-06, D-08, D-09, D-11, D-12, D-15), RDM-ZS-005, RDM-ZS-008, RDM-ZS-006, RDM-ZS-019 |
| `PROJECT.md` §17 (glossary) | terminology (rollover, claim, period closing, re-enrollment campaign) |
| `PROJECT.md` §18 (points 1, 8, 9) | §1.1, RDM-ZS-014, RDM-ZS-002, §5 |
| ADR-ZS-026 | §2, RDM-ZS-011, RDM-ZS-002 |
| ADR-ZS-030 | RDM-ZS-009, §5 |
| ADR-ZS-008 | RDM-ZS-009, OQ-ZS-351 |
| ADR-ZS-009 | RDM-ZS-012, RDM-ZS-009, RDM-ZS-008, RDM-ZS-017, RDM-ZS-010, §2.4 |
| ADR-ZS-011 | §2.2, RDM-ZS-018 |
| ADR-ZS-031 | §2.2, §2.3, RDM-ZS-006, RDM-ZS-018 |
| ADR-ZS-032 | §2.2, RDM-ZS-003 |
| ADR-ZS-035 | RDM-ZS-004, RDM-ZS-012, RDM-ZS-014, §5 |
| ADR-ZS-036 | RDM-ZS-001, RDM-ZS-008, RDM-ZS-007, §2.4 |
| INV-ZS-058, INV-ZS-059, INV-ZS-060, INV-ZS-062 | RDM-ZS-003 |
| INV-ZS-072, INV-ZS-075, INV-ZS-080, INV-ZS-083, INV-ZS-087 | RDM-ZS-020 |
| INV-ZS-073 | RDM-ZS-017, RDM-ZS-011 |
| INV-ZS-077 | RDM-ZS-003 |
| INV-ZS-085 | RDM-ZS-005, RDM-ZS-016 |
| ADR-ZS-013, ADR-ZS-020 | RDM-ZS-017; RDM-ZS-005, RDM-ZS-016 |
| ADR-ZS-017 | RDM-ZS-003 |
| ADR-ZS-007 | RDM-ZS-011, D-05 |
| G-06, G-18 | RDM-ZS-012 |
| G-07 | RDM-ZS-003 |
| G-08 | §2.1 (transfer), RDM-ZS-003 (Massar reference on the MAS module side) |
| G-11 | RDM-ZS-001, RDM-ZS-010 |
| G-14 | RDM-ZS-019 |
| G-22 | §2 |
| URS-ZS-001, URS-ZS-004 | RDM-ZS-017 |
| URS-ZS-005 | RDM-ZS-003 |
| URS-ZS-027, URS-ZS-028 | §5 (adoption) |
| URS-ZS-031, URS-ZS-032 | RDM-ZS-020 |
| JMP-ZS-002 | RDM-ZS-003 |
| JMP-ZS-003 | RDM-ZS-012 |
| JMP-ZS-005, JMP-ZS-011 | RDM-ZS-008 |
| JMP-ZS-006 | RDM-ZS-005 |
| JMP-ZS-008 | RDM-ZS-006 |
| `prd/research/00-baseline-corrections.md` #1, #2, #3, #6, #7, #8, #10, #11, #13, #14, #15, #17, #18, #19, #20 | §1.4, §4, RDM-ZS-001, RDM-ZS-005, RDM-ZS-008, RDM-ZS-006, RDM-ZS-007, RDM-ZS-018, RDM-ZS-019, OQ-ZS-354 |
| `prd/research/01` (market and competition) | RDM-ZS-009, RDM-ZS-007, §5 |
| `prd/research/02` (regulatory and data) | §4 (D-03, D-04, D-10, D-12, D-13, D-15), RDM-ZS-018, RDM-ZS-019, RDM-ZS-010 |
| `prd/research/03` (payments and communications) | D-02, D-06, D-11, RDM-ZS-008, RDM-ZS-006, RDM-ZS-018 |
| `prd/research/04` (pedagogy, Massar, calendar) | §1.2, D-01, D-07, D-08, D-09, D-14, RDM-ZS-001, RDM-ZS-005, RDM-ZS-010 |
| `prd/research/05` (infrastructure, usage) | D-05, RDM-ZS-007 |
| `prd/journeys/00-journey-map.md` §4 (seasonality) | RDM-ZS-015, RDM-ZS-010, §5 |
| ADR-ZS-041 (two-wave MVP) | §2.1 bis, §2.2, §2.4, RDM-ZS-004, RDM-ZS-005, RDM-ZS-003, RDM-ZS-017, RDM-ZS-024, OQ-ZS-357 |
| ADR-ZS-043 (mid-year data migration) | RDM-ZS-012, RDM-ZS-001, RDM-ZS-021, RDM-ZS-023, OQ-ZS-352 |
| ADR-ZS-044 (state machine, year end) | RDM-ZS-003, §3.3 |
| ADR-ZS-047 (ADR-ZS-008 horizon) | RDM-ZS-009, OQ-ZS-351, §5.2 |
| ADR-ZS-051, ADR-ZS-060, ADR-ZS-062 (adult student, QR, channels) | §2.1, §2.4, RDM-ZS-008, RDM-ZS-007 |
| ADR-ZS-066 (pre-pilot compliance and security) | RDM-ZS-013, D-16 to D-20, §5.2 |
| ADR-ZS-042 (traceability) | §5.1 (RSK-ZS-003 to RSK-ZS-004 cross-references), OQ-ZS-355 |
| ADR-ZS-072, ADR-ZS-073, ADR-ZS-071 | OQ-ZS-351, OQ-ZS-357, OQ-ZS-354, §5.2 |
| `prd/cross-cutting/39-risks-mitigations.md` (RSK-ZS-001, RSK-ZS-008 to RSK-ZS-011, RSK-ZS-013, RSK-ZS-005, RSK-ZS-017, RSK-ZS-003, RSK-ZS-023, RSK-ZS-027 to RSK-ZS-004) | §5.1 |
