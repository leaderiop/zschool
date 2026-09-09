# ZSchool PRD — MVP, V1, V2+ Roadmap and Milestones

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 (revised per the 09/09/2026 review) |
| Date | 2026-09-09 |
| Status | PRD draft — revised per `prd/cross-cutting/42-review-arbitrations.md` (ARB-01, ARB-02, ARB-06, ARB-21, ARB-25, ARB-26; ESC-01 to ESC-03) |
| Source | `PROJECT.md` §10 (non-functional requirements), §11 (business model, DEC-28), §12 (scope by version, G-22), §16 (hypotheses H-04, H-08 to H-10, H-17 to H-20, H-22), §17 (glossary), §18 (point 1: verifications, point 8: MVP success indicators, point 9: risks); decisions DEC-15, DEC-19, DEC-27, DEC-28, DEC-30, DEC-31, DEC-32, DEC-35, DEC-36; `prd/research/00-baseline-corrections.md`; `prd/research/01` to `prd/research/05` |
| Related files | `prd/00-conventions.md`; `prd/01-context-vision-scope.md`; `prd/02-actors-personas.md` (BES needs); `prd/03-domain-data-model.md` (INV invariants); `prd/journeys/00-journey-map.md` (PC-01 to PC-11); module chapters `prd/modules/10` to `prd/modules/23`; cross-cutting chapters `prd/cross-cutting/30` to `prd/cross-cutting/41` (see the detail in §1.5); `prd/cross-cutting/42-review-arbitrations.md` (the review's arbitration table); `prd/README.md` |

---

## 1. Purpose, method, and how to read the dates

### 1.1 Purpose

This chapter sets ZSchool's **delivery roadmap**: a recap of capabilities by version (MVP, V1, V2+), dated milestones `JAL-NN` with measurable entry and exit criteria, dated external dependencies with fallback plans, and scheduling risks tied to the seasonality of the Moroccan school year. It answers point 9 of chapter 18 of the baseline (risks and mitigation, including sales seasonality) and structures how the module chapters should be read over time.

Three milestone families are distinguished:

1. **Lifecycle milestones**: product rollout and stage gates (pilot preparation, pilot go-live, MVP-to-V1 transition, commercial launch).
2. **Capability milestones**: bringing a defined scope into service (WhatsApp, Fatourati, native apps, multi-school organizations, V2 and V2+ capabilities).
3. **Recurring milestones**: annual rhythms driven by the school calendar (rollover, maintenance windows, regulatory campaigns).

### 1.2 Method: seasonal anchoring

The Moroccan school year (September to June, billed over ten months, DEC-28) is the roadmap's backbone: the start of the year concentrates workload and purchasing decisions, holidays are the only maintenance windows, and June concentrates exams, report cards, and the rollover. The official dates used are those of the **actual 2026-2027 calendar** documented in `prd/research/04` (student intake 03-05/09/2026, classes compulsory from Monday 07/09/2026, holidays on 18-25/10/2026, 06-13/12/2026, 24-31/01/2027, 21-28/03/2027, 09-16/05/2027, the national baccalaureate exam 01-03/06/2027, Ramadan 1448 from 08/02 to 09-10/03/2027); this calendar is preloaded into the platform's calendar model. The official 2027-2028 calendar had not been published as of the PRD date (dependency D-07).

### 1.3 How to read the dates

- **Sourced official dates**: publication in the Official Gazette, ministerial notices, vendor announcements (Meta, CMI), decrees. They are cited with their source and are not adjustable by this chapter.
- **Planning targets**: target windows of the **reference scenario** adopted by this chapter. They are planning choices, to be confirmed by the founder (OQ-01, OQ-02); the real binding constraint is **seasonal anchoring**, not the exact calendar date.
- **Religious dates**: indicative, confirmed by lunar observation (Ministry of Islamic Affairs) a few days beforehand; the model carries them as "to confirm" and updates them during the year.

### 1.4 Baseline / research divergences

Per `prd/research/00-baseline-corrections.md`, this chapter uses the up-to-date data (permanent UTC+0 since 20/09/2026; Law 59.21 published in Official Gazette No. 7485 of 23/02/2026; the WhatsApp pricing switch of 01/10/2026; YouCan Pay closed since January 2024) and records the baseline update as OQ-04 (escalated as ESC-03 in `prd/cross-cutting/42-review-arbitrations.md`). The two-wave MVP split (ARB-01) and the pre-pilot compliance dependencies (ARB-25) are applied throughout this chapter.

### 1.5 Cross-reference conventions

- **Modules**: the `<MOD>` codes from conventions §2 map to the following canonical files: ADM (`prd/modules/10-administration-onboarding-subscription.md`), INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), PED (`prd/modules/12-academic-structure-timetables.md`), VSC (`prd/modules/13-attendance-student-life-discipline.md`), EVA (`prd/modules/14-assessments-grades-report-cards.md`), DOC (`prd/modules/15-documents-certificates.md`), FIN (`prd/modules/16-finance-billing-collections.md`), COM (`prd/modules/17-communication-notifications.md`), TRA (`prd/modules/18-transfers-mobility.md`), CAR (`prd/modules/19-teacher-career-network.md`), RAP (`prd/modules/20-dashboards-reporting.md`), MAS (`prd/modules/21-massar-regulatory-exports.md`), SAN (`prd/modules/22-ancillary-services-transport-canteen-activities.md`), HEA (`prd/modules/23-health-sensitive-data.md`).
- **Cross-cutting**: PER (`prd/cross-cutting/30-roles-permissions-matrix.md`), SEC (`prd/cross-cutting/31-security-privacy.md`), NFR (`prd/cross-cutting/32-non-functional-requirements.md`), PAK (`prd/cross-cutting/33-business-model-packaging.md`), UX (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`), INT (`prd/cross-cutting/35-external-integrations.md`, including INT-FAT, INT-WAP, INT-SIG, INT-HEB), CNF (`prd/cross-cutting/36-legal-compliance-data-protection.md`), roadmap (this file), KPI (`prd/cross-cutting/38-kpi-success-metrics.md`), risks (`prd/cross-cutting/39-risks-mitigations.md`), tracker (`prd/cross-cutting/40-assumptions-open-questions-tracker.md`), glossary (`prd/cross-cutting/41-glossary.md`).
- **Journeys**: references to `PC-01` through `PC-11` in `prd/journeys/00-journey-map.md`, without duplicating them.
- No `KPI-NN` or `R-NN` identifier is created here: those namespaces belong to `prd/cross-cutting/38-kpi-success-metrics.md` and `prd/cross-cutting/39-risks-mitigations.md`.

---

## 2. Scope recap by version (`PROJECT.md` §12, DEC-15)

The tables below reproduce every item from the baseline's chapter 12 in full and map each to its carrying chapter. No capability is added or removed: the only adjustments come from later decisions in the baseline itself (§2.4).

### 2.1 MVP — validation with 3 to 5 pilot schools

| # | Capability (§12 MVP) | Carrying modules | Chapters | Baseline |
|---|---|---|---|---|
| 1 | School onboarding, Excel import, academic structure (national model), school year, classes, subjects | ADM, PED | `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/12-academic-structure-timetables.md` | (→ RG-18, RG-21, RG-22, RG-24, DEC-02, G-06, G-18) |
| 2 | Global student/parent/teacher identities, Massar matching, invitations and claiming | ADM | `prd/modules/10-administration-onboarding-subscription.md` | (→ RG-01 to RG-07, RG-12b, DEC-03, DEC-04) |
| 3 | Enrollment (simplified state machine: pre-enrolled, active, completed, transferred, withdrawn) | INS | `prd/modules/11-admissions-enrollment-reenrollment.md` | (→ RG-08, RG-10, DEC-06) |
| 4 | Parent-student relationships with default qualities and rights | INS | `prd/modules/11-admissions-enrollment-reenrollment.md` | (→ RG-13 to RG-16, RG-14b) |
| 5 | Teacher and staff affiliations, standard roles | ADM, cross-cutting | `prd/modules/10-administration-onboarding-subscription.md`, `prd/cross-cutting/30-roles-permissions-matrix.md` | (→ RG-17 to RG-20, DEC-05, DEC-17) |
| 6 | Attendance with SMS/WhatsApp notification, justification | VSC, COM | `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/17-communication-notifications.md` | (→ RG-38, RG-39, DEC-12, DEC-36; delay < 5 minutes: `PROJECT.md` §10) |
| 7 | Assessments, grades, average calculation, bilingual report cards published and immutable | EVA, PED | `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/12-academic-structure-timetables.md` | (→ RG-29, RG-33, DEC-09, DEC-10, G-12, G-19) |
| 8 | Basic finance: fee schedule, payment schedule, collections, receipts, unpaid fees, reminders | FIN | `prd/modules/16-finance-billing-collections.md` | (→ RG-12, RG-13, DEC-24, G-15, G-16) |
| 9 | Communication: announcements, messages, in-app and SMS notifications | COM | `prd/modules/17-communication-notifications.md` | (→ DEC-12, DEC-34 (partial), G-17) |
| 10 | Multi-child, multi-school parent dashboards; student, teacher, and school leadership dashboards | RAP | `prd/modules/20-dashboards-reporting.md` | (→ DEC-03, §7.11) |
| 11 | Simple transfer between two ZSchool schools and a PDF exit file | TRA, DOC | `prd/modules/18-transfers-mobility.md`, `prd/modules/15-documents-certificates.md` | (→ RG-30 to RG-32, DEC-07, DEC-08, G-08) |
| 12 | FR/AR, responsive web, PWA | cross-cutting | `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` | (→ DEC-10, §10) |

Notes on reading the MVP:

- **No push notifications at MVP** (PWA with no push, ARB-21b): attendance notifications are delivered in-app, by SMS, and by WhatsApp "utility" messaging limited to attendance notifications (arbitration D1); the full DEC-36 hierarchy (push first, WhatsApp "utility," SMS as fallback) applies from V1 onward. Detailed routing is carried by `prd/modules/17-communication-notifications.md` (FR-COM-04, FR-COM-11).
- **The MVP document scope** covers enrollment documents, the school-attendance certificate issued at the front desk, the leaving certificate, and the PDF exit file (INS, FIN, FR-DOC-01, FR-DOC-09, FR-DOC-11 partial, FR-DOC-14; batch certificates FR-DOC-15 in wave 2); the full DOC module (self-service, advanced seal, QR code) remains V1. **Moderated parent-teacher threads** are active in-app at MVP (DEC-34, ARB-21a; FR-COM-03).
- The reference workload profile is that of the DEC-35 pilots: a primary school of about 300 students, a middle/high school of about 800, a multi-site group of over 2,000, and a bilingual school running on trimesters.

### 2.1 bis — The MVP in two waves (ARB-01, working hypothesis to be confirmed by the founder: ESC-02)

The MVP scope covers everything a pilot school needs between its activation (JAL-04, from 01/02/2027) and the end of the 2027-2028 school year (JAL-10). It is delivered in two waves; the version tag remains `MVP`, with the Version cell of the affected requirements reading "MVP (wave 2 — year-end closing, JAL-07)."

| Wave | Window | Requirements re-tagged MVP by the review (previously V1) | Rationale |
|---|---|---|---|
| Wave 1 — activation | delivered at JAL-02 (end of January 2027), in service at JAL-04 | Cheques: FR-FIN-12; the Law 59.21 parents' contract with a tracked simple acceptance and financial-guardian countersignature: FR-FIN-02, FR-INS-16 (advanced-level e-signature via INT-SIG in V1); tamper-proof receipt numbering: FR-FIN-07 (receipts; compliant invoices in V1); sibling discount: FR-FIN-04; account statement to the financial guardian: FR-FIN-24; duplicate merging reserved to ZSchool support: FR-INS-09, INV-03; organization in read-only consolidated view: FR-ADM-04, FR-RAP-09 (shared administration and group billing in V1); ticket-based support with the school leader's consent: PER-12, `SupportTicket`; progressive grade publication: FR-EVA-19; adult student: INV-35, BES-ELE-05/07 (ARB-10); mid-year data migration: extended FR-ADM-06, FR-INS-27 (ARB-02); declared class sessions and unfulfilled sessions: FR-PED-20, FR-PED-21 (ARB-04, ARB-05); login identifier, phone number change: INV-45, FR-ADM-20, SEC-27 (ARB-07, ARB-08); pre-pilot compliance: CNF-25, CNF-03, CNF-05 (manual), CNF-08 (pilot agreement), SEC-23 (penetration test), SEC-21 and INT-HEB-06 (off-site replication) (ARB-25) | Pilots handle real data, cheques, and contracts from day one (`PROJECT.md` §2.8, Law 59.21 in force) |
| Wave 2 — year-end closing | delivered before 31/05/2027, in service at JAL-06 and JAL-07 | Rollover: FR-INS-21, FR-INS-23, FR-INS-24; re-enrollment campaign (pre-filled form, deposit, conversion): FR-INS-20 (scheduled reminders in V1); structure cloning: FR-PED-07, INV-42; class-council decisions and comments, simplified minutes: FR-EVA-13 (FR-EVA-12 preparation in V1); annual transcript: FR-EVA-18 (cumulative transcript in V1); Massar exports of class lists and continuous-assessment grades with versioned templates and a validation report: FR-MAS-02 to FR-MAS-05; batch certificates: FR-DOC-15 | JAL-06 and JAL-07 require these capabilities in June 2027, fifteen months ahead of the V1 milestone |

The capabilities that remain V1 are listed in the updated §2.2; the rejected alternative — pushing JAL-06 and JAL-07 out past V1 — would have made pilots go through two year-end closings with no tooling.

### 2.2 V1 — commercial launch

| # | Capability (§12 V1) | Carrying modules | Chapters | Baseline |
|---|---|---|---|---|
| 1 | Tooled admissions (application, documents, entrance tests, waitlist, decision: FR-INS-01 to FR-INS-05), scheduled re-enrollment campaign reminders, class-council preparation (FR-EVA-12) — the rollover, the pre-filled campaign, the class-council decisions, and the annual transcript moved to MVP wave 2 (§2.1 bis, ARB-01) | INS, EVA | `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/14-assessments-grades-report-cards.md` | (→ RG-09, G-07; ARB-01) |
| 2 | Timetable with conflict detection and Ramadan variants | PED | `prd/modules/12-academic-structure-timetables.md` | (→ G-11, G-13; actual calendar: `prd/research/04` §3) |
| 3 | Full discipline and student-life management | VSC | `prd/modules/13-attendance-student-life-discipline.md` | (→ G-14) |
| 4 | Self-service documents and certificates, QR verification | DOC | `prd/modules/15-documents-certificates.md` | (→ RG-28, RG-33, DEC-24, DEC-30: advanced seal and timestamp from V1) |
| 5 | Full finance: cash-drawer sessions, accounting exports, compliant invoices, negotiated discounts and scholarships, refunds — cheques, sibling discount, receipt numbering, account statements, and the parents' contract (simple acceptance) moved to MVP wave 1 (§2.1 bis, ARB-01) | FIN | `prd/modules/16-finance-billing-collections.md` | (→ G-15; ICE/IF mentions and 10-year retention: `prd/research/02` §7) |
| 6 | ESISE regulatory statistics, transfer log, discount audit — Massar exports of class lists and continuous-assessment grades moved to MVP wave 2 (§2.1 bis, ARB-01) | MAS | `prd/modules/21-massar-regulatory-exports.md` | (→ H-04, H-10, G-08; ESISE channel: `prd/research/04` §2) |
| 7 | Multi-school organizations: shared administration, group-level billing, advanced comparisons — organization creation and the read-only consolidated dashboard are in MVP wave 1 (§2.1 bis, ARB-01) | ADM, RAP | `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/20-dashboards-reporting.md` | (→ RG-21, RG-23, DEC-02; BES-DIR-01, BES-DIR-04) |
| 8 | Full WhatsApp Business API, push notifications (via PWA, FCM/APNs under a transfer basis: CNF-09); native Android then iOS apps in V2+ (adopted reading: `PROJECT.md` §10, aligned with NFR-MOB-02, UX-15, INT-WAP-06; the divergence with §12 is escalated as ESC-03) | COM, cross-cutting | `prd/modules/17-communication-notifications.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/35-external-integrations.md` (INT-WAP) | (→ DEC-36, H-11; §10/§12 divergence on native apps: OQ-03) |
| 9 | Audit trail, data-subject rights, formalized CNDP compliance | cross-cutting | `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md` | (→ DEC-16, DEC-22, RG-38, G-20) |
| 10 | Fatourati online payment: Collect then Aggregator, with no holding of funds (DEC-31, moving the "online payment" item from §12 V2+ to V1) | FIN, integrations | `prd/modules/16-finance-billing-collections.md`, `prd/cross-cutting/35-external-integrations.md` (INT-FAT) | (→ DEC-31, H-09, H-19; PC-08) |
| 11 | Exit file for schools outside ZSchool: a time-limited secure link with QR verification (DEC-32) | TRA, DOC | `prd/modules/18-transfers-mobility.md`, `prd/modules/15-documents-certificates.md` | (→ DEC-32; PC-09) |
| 12 | Parents' contract (Law 59.21) signed electronically at the advanced level (DEC-30, INT-SIG) — the contract itself (generation, tracked simple acceptance, financial-guardian countersignature, archiving) is in MVP wave 1 (ARB-01, ARB-20h) | DOC, FIN, compliance | `prd/modules/15-documents-certificates.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md` | (→ DEC-30; Law 59.21: `prd/research/02` §1) |

### 2.3 V2 and beyond

| # | Capability (§12 V2+) | Carrying modules | Chapters | Baseline |
|---|---|---|---|---|
| 1 | Digital school passport | TRA, DOC | `prd/modules/18-transfers-mobility.md`, `prd/modules/15-documents-certificates.md` | (→ §6.9, RG-28, RG-31, `ConsentGrant`) |
| 2 | Professional teacher network (search, applications, availability) | CAR | `prd/modules/19-teacher-career-network.md` | (→ §7.10, DEC-25, RG-20, RG-35; BES-ENS-06, BES-ENS-07) |
| 3 | Online payment: registered-card payment (NAPS e-Premium or Chari Pay), bank direct debit | FIN, integrations | `prd/modules/16-finance-billing-collections.md`, `prd/cross-cutting/35-external-integrations.md` | (→ DEC-31, H-09; rails: `prd/research/03` §2) |
| 4 | Transport, canteen, activities, health | SAN, HEA | `prd/modules/22-ancillary-services-transport-canteen-activities.md`, `prd/modules/23-health-sensitive-data.md` | (→ §7.13, §7.14, DEC-08, DEC-24, G-14) |
| 5 | Automatic timetable generation | PED | `prd/modules/12-academic-structure-timetables.md` | (→ §7.3, G-13) |
| 6 | Public API, accounting integrations, Massar integration if a channel opens up | MAS, cross-cutting | `prd/modules/21-massar-regulatory-exports.md`, `prd/cross-cutting/35-external-integrations.md` | (→ §10 interoperability, H-04) |
| 7 | English, advanced international tracks (letter grades, GPA) | PED, cross-cutting | `prd/modules/12-academic-structure-timetables.md`, `prd/cross-cutting/32-non-functional-requirements.md` | (→ §2.3, §10) |
| 8 | Lightweight e-learning (resources, online homework) | PED | `prd/modules/12-academic-structure-timetables.md` | (→ §12) |

Note: the §12 V2+ item "online payment (CMI, aggregators)" is narrowed by DEC-31, which brings Fatourati into V1 (see §2.2, row 10); the registered card and direct debit remain V2+.

### 2.4 Version consistency with the baseline's decisions

| Topic | Adopted reading | Cross-reference |
|---|---|---|
| Fatourati in V1 | DEC-31 overrides the "later version" wording for online payments (§7.7, §12); sequence is Collect then Aggregator | PC-08 in the journey map; JAL-13 |
| Native apps | §12 lists them under V1; §10 places them in V2; the review's adopted reading is §10 (V2+), aligned with NFR-MOB-02, UX-15, and INT-WAP-06; push in V1 via PWA | OQ-03 (resolved); JAL-15; ESC-03 |
| Moderated parent-teacher threads (DEC-34) | MVP in moderated in-app mode (DEC-34 "enabled by default," BES-ENS-05; ARB-21a); channels generalized in V1 | FR-COM-03; journey-map OQ-01 (resolved) |
| Documents at MVP | enrollment documents, school-attendance certificate, leaving certificate, PDF exit file, encrypted relationship documents; the full DOC module (self-service, seal, QR) in V1 | journey-map OQ-02 (resolved); ARB-19, ARB-20 |
| Adult student (RG-02, DEC-20) | MVP (INV-35; BES-ELE-05, BES-ELE-07; PJ-ELE-04, PJ-ELE-05) | ARB-10 |
| QR verification | V1 (DEC-30 dates the item after DEC-09); no MVP criterion mentions it | ARB-19 |
| Push notifications | none at MVP; the DEC-36 hierarchy from V1 onward | ARB-21b |
| Two-wave MVP scope | a working hypothesis applied throughout every chapter, to be confirmed by the founder | §2.1 bis; ARB-01; ESC-02 |
| DEC-27 horizon | the reading "year 1 = 2028-2029" is kept as a hypothesis; escalated to the founder | OQ-01; ARB-06; ESC-01 |
| WhatsApp at MVP | founder arbitration (D1): at MVP, in-app + SMS and WhatsApp "utility" limited to attendance notifications (minimal templates); at V1, generalized (all messages, managed templates, push) | JAL-12 |
| SaaS billing | MAD 5/active student/month over 10 months (September-June), no billing in July-August; consumables billed on top | DEC-28; JAL-11, JAL-19 |

---

## 3. Roadmap milestones (JAL-01 to JAL-19)

### 3.1 Chronological overview

| JAL | Title | Target window (reference scenario) | Family | Version(s) |
|---|---|---|---|---|
| JAL-01 | Freeze the MVP scope and start development | October 2026 | Lifecycle | MVP |
| JAL-02 | MVP wave 1 complete and internally validated | end of January 2027 | Lifecycle | MVP (wave 1) |
| JAL-03 | Pilot preparation: onboarding, imports, training | February-April 2027 | Lifecycle | MVP |
| JAL-04 | Pilot go-live: mid-year onboarding into the 2026-2027 school year with mid-year data migration | from Monday 01/02/2027 (resuming after the mid-year break); Compliance Gate JAL-23 cleared | Lifecycle | MVP (wave 1) |
| JAL-05 | Pilot learning loop (4 DEC-35 profiles) | February-June 2027, then ongoing | Lifecycle | MVP |
| JAL-06 | Period closing, report cards, and pilot Massar exports | May-June 2027 (2nd-year baccalaureate class: before the 01-03/06/2027 national baccalaureate exam; other levels: before the end of classes) | Lifecycle | MVP (wave 2) |
| JAL-07 | Rollover from year N to N+1 | June (first occurrence: June 2027) | Lifecycle / recurring | MVP (wave 2: FR-INS-20/21/23/24, FR-PED-07, FR-EVA-13/18); V1 (scheduled reminders, tooled admissions) |
| JAL-08 | Pilots at full load for the new school year | September 2027 (2027-2028 school year start) | Lifecycle | MVP |
| JAL-09 | First complete first-semester closing and report cards | December 2027-January 2028 | Lifecycle | MVP |
| JAL-10 | MVP-to-V1 transition (adoption, stability, KPIs) | spring 2028 review; confirmation after the June 2028 rollover | Lifecycle | MVP → V1 |
| JAL-11 | V1 commercial launch on the Casablanca-Kénitra corridor | summer 2028 campaign; 2028-2029 school year start | Lifecycle | V1 |
| JAL-12 | Capability: WhatsApp Business Platform and the 01/10/2026 pricing switch | parameter specified in the PRD before 01/10/2026, implemented at JAL-01; account verified and templates approved before 15/01/2027 (D-17); rolled out with the pilots | Capability | MVP (utility: attendance notifications); V1 (full rollout, push) |
| JAL-13 | Capability: Fatourati Collect then Aggregator | Aggregator go/no-go on 30/06/2027 (D-18), Collect as plan B; connected during the pilot cycle; in service at V1 | Capability | V1 |
| JAL-14 | Capability: multi-school organizations | consolidated read-only view from JAL-04 (DEC-35 group pilot); shared administration and group billing with V1 | Capability | MVP (read-only view); V1 |
| JAL-15 | Capability: native Android then iOS apps | V2+ (§10 reading, aligned with NFR-MOB-02; push in V1 via PWA) | Capability | V2+ |
| JAL-16 | V2+ capability: qualified seal and recurring bank-card payment | V2+, after V1 has stabilized | Capability | V2+ |
| JAL-17 | V2+ capability: transport, canteen, and health | V2+ | Capability | V2+ |
| JAL-18 | V2+ capability: school passport and professional teacher network | V2+ | Capability | V2+ |
| JAL-19 | Recurring rhythm: maintenance windows and dated annual milestones | permanent, every school year | Recurring | all versions |
| JAL-20 | Wave 1 development — identity, enrollment, structure, and data migration foundation | mid-November 2026 | Lifecycle | MVP (wave 1) |
| JAL-21 | Wave 1 development — attendance, notifications, basic finance, enrollment documents | mid-December 2026 | Lifecycle | MVP (wave 1) |
| JAL-22 | Pilot UAT on anonymized real data, and rehearsal of the mid-year data migration | mid-January 2027 | Lifecycle | MVP (wave 1) |
| JAL-23 | Pre-pilot compliance and security gate (CNDP, pilot agreement, WhatsApp Business, penetration test, off-site replication) | before 31/01/2027; CNDP filings submitted before 15/12/2026 | Lifecycle | MVP (wave 1) |
| JAL-24 | Wave 2 development — year-end closing (rollover, class councils, transcripts, Massar exports) | delivery before 31/05/2027 | Lifecycle | MVP (wave 2) |

Reading the reference scenario: the PRD is dated 09/09/2026, after the actual 2026-2027 school year had already started (classes compulsory from Monday 07/09/2026, `prd/research/04`). Pilots therefore cannot go live at the start of the 2026 school year: the reference scenario adopts a **progressive mid-year onboarding with mid-year data migration** (JAL-04, from February 2027, ARB-02), a fully tooled year-end closing in June 2027 (JAL-06, JAL-07, wave 2), a first complete school year under MVP in 2027-2028 (JAL-08, JAL-09), then the transition to V1 and commercial launch for the 2028-2029 school year (JAL-10, JAL-11). Wave 1 development is milestoned by JAL-20 to JAL-23; wave 2 by JAL-24. Alternatives and the switch-over point are recorded in OQ-02 (resolved); the resulting DEC-27 horizon is escalated to the founder (OQ-01, ESC-01).

### 3.2 Milestone fact sheets

#### JAL-01 — Freeze the MVP scope and start development

| Attribute | Value |
|---|---|
| Target window | October 2026 |
| Description | The PRD chapter review concludes with the MVP scope frozen (§12, DEC-15), the target architecture validated (production and backup in Morocco, DEC-26), and a delivery plan established through to the pilots. |
| Version(s) | MVP |
| Entry criteria | PRD chapters written and under review (`prd/README.md`); baseline/research divergences recorded (OQ-04). |
| Exit criteria | MVP scope frozen and signed off, in two waves (§2.1 bis, ARB-01); architecture validated, with a service-by-service check of the `af-casablanca-1` OCI Casablanca region catalogue (managed databases, managed Kubernetes, object storage: correction #13); MVP-to-V1 transition thresholds proposed and handed to `prd/cross-cutting/38-kpi-success-metrics.md`; a delivery plan incorporating maintenance windows (JAL-19) and the 01/10/2026 WhatsApp pricing switch designed as a dated parameter (JAL-12). |
| Dependencies | D-01 (permanent UTC+0) built in from the design stage; the dated WhatsApp switch parameter specified in the PRD before 01/10/2026 (JAL-12); team sizing and hiring plan settled (§5.2); founder confirmation of the MVP scope extension (ESC-02) and the DEC-27 horizon (ESC-01) before the freeze. |
| Stakeholders | Project founder, product team, development team, PRD review. |
| Traceability | (→ §12, DEC-15, DEC-26, §18 point 1) |

#### JAL-02 — MVP wave 1 complete and internally validated

| Attribute | Value |
|---|---|
| Target window | end of January 2027 (pushed back from February to free up the pilot-onboarding window, JAL-03) |
| Description | The twelve MVP capabilities (§2.1) and the wave-1 requirements (§2.1 bis) are developed and internally validated, following the intermediate milestones JAL-20, JAL-21, and JAL-22: end-to-end demonstration of the critical journeys (PC-03 with mid-year data migration, PC-04, PC-05 with declared class sessions, PC-06, PC-07 including cheques, PC-11), load testing at DEC-35 profile sizes (300, 800, 2,000+ students; semesters and trimesters), and verification of data residency in Morocco and off-site replication (INT-HEB-06). |
| Version(s) | MVP |
| Entry criteria | JAL-01; JAL-20 through JAL-22 cleared; a production environment available on `af-casablanca-1`. |
| Exit criteria | MVP journeys demonstrated end to end; report-card generation under 3 seconds and publication of report cards for a 2,000-student school under 10 minutes (§10); attendance notification delivered in under 5 minutes after roll-call validation (§10); attendance-taking and grade entry tolerant of connectivity loss, with sync (§10); daily backups replicated off-site with tested restoration (§10, SEC-21); a functional PWA in FR and AR with full RTL support, with no push (ARB-21b); the mid-year data migration rehearsed on an anonymized real dataset (JAL-22). |
| Dependencies | JAL-01; hosting ready. |
| Stakeholders | Development team, QA team, product leadership. |
| Traceability | (→ §10, §12, DEC-10, DEC-35) |

#### JAL-03 — Pilot preparation: onboarding, imports, training

| Attribute | Value |
|---|---|
| Target window | February-April 2027 (post-mid-year-break window; classes resume Monday 01/02/2027, `prd/research/04`); run in parallel with the first go-lives (JAL-04), pilot by pilot |
| Description | Selecting and contracting the 3 to 5 pilot schools per the DEC-35 profiles; creating the tenants; Excel-importing the initial data (students, guardians, classes, fee schedule) with duplicate checks and an error report; training the teams (school leadership, front office, teachers); each pilot's CNDP filings (F211 or F214) submitted before 15/12/2026 using the ZSchool templates (CNF-25, D-16), and a pilot data-processing agreement signed before any go-live (CNF-08, D-20); collecting parents' WhatsApp opt-in with a notice on the cross-border data transfer (ARB-25c); defining the SMS and WhatsApp consumable packs (DEC-28 consumables); and migrating mid-year data (paid installments, cheques in hand, semester grades, ARB-02). |
| Version(s) | MVP |
| Entry criteria | JAL-02; pilot school leadership commitment. |
| Exit criteria | All four DEC-35 profiles onboarded, the multi-site group with its organization in read-only consolidated view (FR-ADM-04); imports validated (error reports empty or resolved), enrollments activated via import (FR-INS-27), accurate mid-year payment schedules; duplicates merged by support (FR-INS-09); internal users active with standard roles; a first roll call and a first payment collection completed at each pilot; CNDP filings submitted before 15/12/2026 (JAL-23); pilot agreements signed; real pilot Massar Excel file structures collected for testing (D-09); the cadence and points of contact for the learning loop agreed. |
| Dependencies | JAL-02; JAL-23 (compliance gate); pilot team availability; no Fatourati dependency (V1); WhatsApp Business verified before 15/01/2027 (D-17), with SMS sufficient to start. |
| Stakeholders | ZSchool team (onboarding and support), pilot school leadership and front offices, trained teachers. |
| Traceability | (→ DEC-28, DEC-35, G-06, G-18; PC-03; compliance: `prd/cross-cutting/36-legal-compliance-data-protection.md`) |

#### JAL-04 — Pilot go-live: onboarding mid-way through the 2026-2027 school year

| Attribute | Value |
|---|---|
| Target window | from Monday 01/02/2027 (resuming after the 24-31/01/2027 mid-year break); each pilot goes live after its own onboarding (JAL-03), with JAL-03 and JAL-04 progressing in parallel across successive waves — 01/02/2027 marks the opening of the window, not the simultaneous activation of every pilot |
| Description | Progressive pilot activation against the **actual 2026-2027 calendar** (`prd/research/04` §3), after the mid-year data migration (extended FR-ADM-06, FR-INS-27: partially paid schedules, cheques in hand, first-semester grades, aggregated absences — ARB-02): daily roll calls by declared sessions (FR-PED-20) with same-day first-absence notification (ARB-15), routine grade entry, collections, cheques and reminders, front-desk attestations, announcements, moderated threads. The Ramadan schedule variant (period 1448: 08/02 to 09-10/03/2027, indicative) is configured at the relevant pilots; the time zone has been permanent UTC+0 since 20/09/2026 (Decree No. 2.26.530, D-01), and "Ramadan variants" remain a pedagogical need for shortened hours, not a time-zone issue. |
| Version(s) | MVP |
| Entry criteria | JAL-03; JAL-23 cleared (CNDP filings submitted, pilot agreement signed, penetration test performed, off-site replication active); the 2026-2027 calendar preloaded; religious holidays carried as "to confirm." |
| Exit criteria | Every pilot runs its daily roll call with notification delivered in under 5 minutes; payment schedules and reminders active; the first period closing prepared; the Ramadan variant applied with no incident at the pilots using it; no unresolved availability alert during the Ramadan period. |
| Dependencies | JAL-03; JAL-23; D-01 (time zone); D-02 (WhatsApp rate cards); D-16, D-17, D-19, D-20; JAL-12. |
| Stakeholders | Pilot school leadership, head supervisors, teachers, and front offices; ZSchool support. |
| Traceability | (→ §12, DEC-36, G-11; `prd/research/04` §3; corrections #1 and #17) |

#### JAL-05 — Pilot learning loop (4 DEC-35 profiles)

| Attribute | Value |
|---|---|
| Target window | February-June 2027, then ongoing through to the V1 transition |
| Description | A regular review cadence with the pilots (weekly during go-live, then every two weeks), a feedback log categorized by profile (a primary school of about 300 students; a middle/high school of about 800; a multi-site group of over 2,000; a bilingual school on trimesters), prioritization, and fast corrective releases; tracking the MVP success indicators defined in baseline §18 point 8 (pilot adoption, daily roll-call rate, notification delay, collection rate, reduction of double data entry), carried by `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version(s) | MVP |
| Entry criteria | JAL-04; each pilot's point of contact committed. |
| Exit criteria | A live, up-to-date feedback log; the five §18 point 8 indicators measured for each pilot; every MVP scope change decided in review and recorded in the relevant module chapters; no critical feedback item left without an owner and a deadline. |
| Dependencies | JAL-04; pilot point-of-contact availability. |
| Stakeholders | Pilot school leadership, end users (teachers, front offices, supervisors), ZSchool product team. |
| Traceability | (→ DEC-35, §18 point 8) |

#### JAL-06 — Period closing, report cards, and pilot Massar exports

| Attribute | Value |
|---|---|
| Target window | May-June 2027 (second semester for pilots on semesters; third trimester for the trimester-based school); for 2nd-year baccalaureate classes, publication before the 01-03/06/2027 national baccalaureate session; for other levels, before the end of classes (late June) |
| Description | The first full round of bilingual report cards published, immutable and versioned (digital fingerprint, signatory, RG-33, DEC-09); publication notification sent to families; annual transcripts (FR-EVA-18, wave 2); Massar exports of class lists and continuous-assessment grades (FR-MAS-02 to FR-MAS-05, wave 2: files per subject and per semester, a trimester-to-semester mapping for the bilingual school, a validation report) handed to pilots alongside their own ministry data entry; a compliance check against the national reference framework, issued as a warning (FR-EVA-06, D3). |
| Version(s) | MVP (wave 2, delivered at JAL-24) |
| Entry criteria | JAL-05; JAL-24; default weightings configured per level (baccalaureate 25/25/50; 3AC lower-secondary certificate 30/30/40; 6AP primary-school certificate 50/25/25 labeled "provincial exam," ARB-18); Massar Excel file structure tested on real files (D-09). |
| Exit criteria | 100% of pilot-period report cards published through ZSchool, with no manual recalculation; Massar exports handed to pilots and compared against their actual Massar data entry, with zero blocking discrepancy; publication completed before the end of classes; no integrity incident on published report cards. |
| Dependencies | JAL-05; D-09; H-16 (weighting reference texts, requirements phrased without depending on the exact reference number). |
| Stakeholders | Teachers (grade entry), school leadership (closing and publication), front offices (Massar exports), families (viewing). |
| Traceability | (→ RG-33, DEC-09, DEC-10, H-04, §18 point 8; PC-06) |

#### JAL-07 — Rollover from year N to N+1 (critical scheduling point)

| Attribute | Value |
|---|---|
| Target window | June, first occurrence June 2027, then every year: after class councils and before students leave, well ahead of the new school year |
| Description | Bulk year-end decisions (RG-09, FR-EVA-13, FR-INS-21): every student present at closing moves to COMPLETED with their decision recorded, "advanced with a track change" students remain at the school, and students leaving at year end move to COMPLETED with no N+1 enrollment created (ARB-03); the N+1 structure is cloned from year N without the students (RG-25, FR-PED-07); a pre-filled re-enrollment campaign with a deposit (FR-INS-20); N+1 enrollments are created in PRE-ENROLLED status only, with no duplicates (FR-INS-21); class assignment (FR-INS-23); N+1 payment schedules generated; departures processed (FR-INS-24: exit file, balance retained per RG-12). This is the scheduling point of no return: a failure here jeopardizes the school's following school-year start. |
| Version(s) | MVP (wave 2, ARB-01: FR-INS-20, FR-INS-21, FR-INS-23, FR-INS-24, FR-PED-07, FR-EVA-13, FR-EVA-18, INV-42); V1 for scheduled campaign reminders and tooled admissions |
| Entry criteria | JAL-24 delivered; year-end report cards published (JAL-06); year-end decisions entered (FR-EVA-13), "undetermined" for certifying levels pending results (ARB-17i). |
| Exit criteria | Year N+1 opened at every pilot before 30 June: enrollments created, classes assigned, payment schedules generated; the processing time of a 2,000-student school's rollover measured, staying within load thresholds (§10, NFR-RES domain); the bulk process's retry and rollback tested (no orphaned N+1 enrollment, no duplicate N+1 enrollment, RG-08, ARB-03f); no student left SUSPENDED or ACTIVE on year N after closing; the national baccalaureate exam window (01-03/06/2027 for the first occurrence) stays free of any heavy operation. |
| Dependencies | JAL-06; JAL-24; exam calendars (D-14); the next year's AREF campaign for teachers (D-13, on the CAR module side, in V1). |
| Stakeholders | School leadership (decisions), front offices (campaign and assignment), parents (confirmations and deposits). |
| Traceability | (→ RG-08, RG-09, RG-10, RG-12, RG-25, DEC-06, G-07; PC-02; BES-DIR-05) |

#### JAL-08 — Pilots at full load for the 2027-2028 school year start

| Attribute | Value |
|---|---|
| Target window | September 2027; the official 2027-2028 school-year-start date had not been published as of 09/09/2026 (D-07); working assumption modeled on the recent ministerial pattern (student intake in early September, classes compulsory from the first Monday — `prd/research/04`) |
| Description | The first full school-year start under MVP: additional imports, last-minute enrollments, school-attendance certificates, a wave of invitations and account claims, roll calls from day one, first monthly payments and enrollment fees, notification peaks; reinforced ZSchool support. |
| Version(s) | MVP |
| Entry criteria | JAL-07 (year N+1 ready); the July-August maintenance window used for version upgrades (JAL-19): no production deployment in September. |
| Exit criteria | All pilots operational from the first day of class; no unplanned outage; absence-notification delay held under 5 minutes at peak; account-creation and invitation volume absorbed with no degradation (NFR-PERF and NFR-RES domains); critical tickets resolved within 24 hours (support commitment NFR-DISP-06, OQ-06 resolved). |
| Dependencies | JAL-07; D-07; JAL-19 (version freeze). |
| Stakeholders | All pilot roles; ZSchool support. |
| Traceability | (→ §10 NFR-DISP, NFR-PERF, NFR-OFF; DEC-35; journey-map §4) |

#### JAL-09 — First complete first-semester closing and report cards (2027-2028 cycle)

| Attribute | Value |
|---|---|
| Target window | December 2027-January 2028; exact window depends on the official 2027-2028 calendar once published (D-07); the bilingual school's first trimester closing falls in December 2027 |
| Description | The first complete first-semester closing cycle at semester-based pilots, under real peak-load conditions: grade lock, bulk generation and publication, publication notification; for the trimester-based school, the "report card" workload is shifted and tripled (December, March, June — journey-map §4.2). |
| Version(s) | MVP |
| Entry criteria | JAL-08; 2027-2028 periods configured. |
| Exit criteria | Publication of report cards for a 2,000-student school confirmed under 10 minutes in production; report cards versioned and verifiable; zero data loss or corruption; no uncontrolled delay overrun. |
| Dependencies | JAL-08; D-07. |
| Stakeholders | Teachers, school leadership, head supervisors, families. |
| Traceability | (→ §10 NFR-PERF; RG-33, DEC-09; DEC-35) |

#### JAL-10 — MVP-to-V1 transition: adoption, stability, and KPI criteria

| Attribute | Value |
|---|---|
| Target window | main review in spring 2028 (after the first complete first-semester closing of the 2027-2028 cycle); final confirmation after the June 2028 rollover; decision before the summer commercial campaign |
| Description | A formal transition review held in spring 2028 covering the first part of the pilot cycle (the 2027 school-year start, the first complete first-semester closing of December 2027-January 2028) and the adoption indicators accumulated since JAL-04, based on the indicators in `prd/cross-cutting/38-kpi-success-metrics.md` and the thresholds set at JAL-01; the spring review produces a recommendation. The final go/no-go decision is made after the second period closing and the June 2028 rollover, ahead of the summer commercial campaign. The transition gates the commercial launch (JAL-11): on a no-go, the product stays on MVP, a dated catch-up plan is launched, and the launch is pushed back one school-year start (impacting OQ-01). |
| Version(s) | MVP to V1 |
| Entry criteria | JAL-05 through JAL-09 completed; indicators consolidated; V1 compliance ready (`prd/cross-cutting/36-legal-compliance-data-protection.md`). |
| Exit criteria (measurable) | **Baseline non-functional gates (§10)**: at least 99.5% availability outside announced maintenance over the cycle; attendance-notification delay under 5 minutes; report-card generation under 3 seconds; publication for a 2,000-student school under 10 minutes; zero data loss or corruption; restoration tested quarterly. **Adoption gates (proposed targets, OQ-05)**: 100% of pilots active; roll call performed on at least 90% of class days; 100% of report cards published through ZSchool; daily finance active (tracked collections, automated reminders); a measured reduction in Massar double data entry; structured interviews with pilot school leadership conducted and analyzed. **Stability gates**: no critical (P1) incident left unresolved beyond 24 hours over the last quarter; a full DR plan tested with a failover to the Moroccan backup site (D-05, V1 disaster-recovery; off-site replication is active since MVP, INT-HEB-06); an immutable, exportable audit trail, tooled data-subject rights, and formalized CNDP compliance (rows 8-9 of §2.2; the manual formalities and procedures exist since MVP, ARB-25). |
| Dependencies | JAL-05 through JAL-09; `prd/cross-cutting/38-kpi-success-metrics.md` (KPIs); `prd/cross-cutting/36-legal-compliance-data-protection.md` (compliance). |
| Stakeholders | Project founder, product leadership, pilot school leadership. |
| Traceability | (→ §10, §12, §18 point 8, DEC-15, DEC-27) |

#### JAL-11 — V1 commercial launch on the Casablanca-Kénitra corridor

| Attribute | Value |
|---|---|
| Target window | summer 2028 commercial campaign (purchasing decisions concentrate in the re-enrollment season, from spring to summer); first commercial cohort at the 2028-2029 school-year start; DEC-27 target: 20 schools and 15,000 students by the end of year 1 (reference reading: the 2028-2029 school year — **hypothesis escalated to the founder, OQ-01, ARB-06, ESC-01**, since the baseline confirmed DEC-27 without this two-year shift) then a target of 300 schools and 200,000 students at three years |
| Description | Selling the single plan (MAD 5 per active student per month over 10 months, all modules included; consumables and services billed on top, DEC-28); standardized, industrialized onboarding built on the JAL-03 setup; DEC-19 positioning: cross-school global identity, a reliable parent app, Fatourati-based collections, an FR/AR interface; geographic focus: the Casablanca-Kénitra corridor, home to 70% of the 7,564 private schools (`prd/research/01`); a MOWAKABA financing-support case prepared without making it a firm sales argument until eligibility is confirmed (D-12). |
| Version(s) | V1 |
| Entry criteria | JAL-10 go decision issued; JAL-13 (Fatourati) operational at least in Collect mode; JAL-12 in production; onboarding capacity sized. |
| Exit criteria | At least 20 active schools and about 15,000 active students by the end of year 1 (OQ-01 reading), pilots included; onboarding time and per-school acquisition cost measured and trending down; no sales outside the corridor before consolidation; trial-to-paid conversion rate tracked (`prd/cross-cutting/38-kpi-success-metrics.md`). |
| Dependencies | JAL-10; JAL-12; JAL-13; D-12; team capacity (onboarding, support, training). |
| Stakeholders | Project founder, sales team, onboarding team, client school leadership. |
| Traceability | (→ DEC-19, DEC-27, DEC-28, §11, H-01; `prd/research/01` §1) |

#### JAL-12 — Capability: WhatsApp Business Platform and the 01/10/2026 pricing switch

| Attribute | Value |
|---|---|
| Target window | the switch parameter **specified in the PRD before 01/10/2026** (FR-COM-09, INT-WAP) and implemented at JAL-01 with the before/after rate card as data; the ZSchool WhatsApp Business account verified and the "absence" templates approved before 15/01/2027 (D-17, INT-WAP-07); rolled out with the pilots (JAL-04); rate cards monitored on an ongoing basis |
| Description | Implementation of DEC-36: at MVP, WhatsApp "utility" messaging limited to attendance notifications for opted-in parents (transfer basis: express consent with a notice on the cross-border data transfer, ARB-25c) and SMS via a Moroccan aggregator as fallback, with no push; at V1, a push-first hierarchy (via PWA, with FCM/APNs entered in the sub-processor registry), full WhatsApp rollout, SMS as fallback (ARB-21b). WhatsApp has been billed per message since 01/07/2025; as of **01/10/2026**, free service and utility messages within the 24-hour window end, and Morocco moves out of "Rest of Africa" regional pricing onto a standalone rate card (higher utility and authentication rates, plus international authentication) — the switch is modeled as a **dated parameter**, and costs for **both inbound and outbound** messages are budgeted. Utility templates approved by Meta (at MVP: absence; at V1: payment reminder and report card, alongside the full rollout); opt-in compliance (Law 09.08 and 2019 CNDP-ANRT guidance); credit counters and threshold alerts per school on the consumable packs (DEC-28). |
| Version(s) | MVP for attendance notifications (§12); V1 for the broader communication rollout (§12 V1) |
| Entry criteria | D-02 (Morocco standalone rate cards, to be obtained: not found as of 09/09/2026); D-17 (Meta Business verification, a single ZSchool account, templates approved before 15/01/2027); the access mode chosen (Meta's direct Cloud API or an official BSP reachable from Morocco); parent opt-in collected (JAL-03). |
| Exit criteria | The pricing switch operational as a dated parameter (before/after 01/10/2026 rate card); per-message cost charged to the school's pack and visible to the school; utility templates approved; delivery rate and average cost per notification measured; the SMS fallback plan tested. |
| Dependencies | D-02; JAL-03 (opt-in); `prd/cross-cutting/35-external-integrations.md` (INT-WAP); `prd/modules/17-communication-notifications.md`. |
| Stakeholders | Parents (recipients), school leadership and teachers (senders), ZSchool team (cost operations). |
| Traceability | (→ DEC-12, DEC-36, H-11, H-20; `prd/research/03` §4; correction #6; PC-05, PC-11) |

#### JAL-13 — Capability: Fatourati Collect then Aggregator

| Attribute | Value |
|---|---|
| Target window | **Aggregator go/no-go on 30/06/2027** (D-18, INT-FAT-01): a framework contract signed by that date, otherwise a per-school Collect fallback plan; connected during the pilot cycle (2027-2028) for a V1 launch; Collect first, then Aggregator (vendor API) |
| Description | DEC-31: Fatourati from V1 onward as the primary rail for school fees, **with no funds held** by ZSchool; the school remains the creditor and beneficiary. Sequence: **Fatourati Collect** (a plug-and-play web app used by the school) then **Fatourati Aggregator** (launched 17/02/2026: an API for software vendors — reference and QR generation, real-time debt lookup, payment confirmation, daily anti-duplicate reconciliation, per the Eduka reference integration). Parent channels: online banking, mobile wallets, ATMs, cash agents (over 25,000 points), Fatourati QR codes. |
| Version(s) | V1 |
| Entry criteria | D-06 and D-18 (contract and pricing negotiated, H-19, decision by 30/06/2027); CMI contact (sales.fatourati@cmi.co.ma) engaged from JAL-01; a degraded mode for ZSchool outages specified (INT-FAT-02); the FIN module's reconciliation ready (`prd/modules/16-finance-billing-collections.md`). |
| Exit criteria | At least one pilot live on Collect with verified daily reconciliation; the Aggregator agreement signed; commercial schools connected for the 2028 school-year start; the PC-08 journey operational end to end (parent payment, confirmation, reconciliation with no duplicates). |
| Dependencies | D-06; each school's bank link for reconciliation; `prd/cross-cutting/35-external-integrations.md` (INT-FAT). |
| Stakeholders | Financial-guardian parents (payment), front offices and school leadership (tracking), ZSchool (technical connection, never holding funds). |
| Traceability | (→ DEC-31, H-09, H-19; `prd/research/03` §1; correction #8; PC-08) |

#### JAL-14 — Capability: multi-school organizations

| Attribute | Value |
|---|---|
| Description | Rollout of organizations (school groups): consolidated views (headcount, attendance, results, unpaid fees) and shared administration **with no data merging**; the isolation tenant remains the school (RG-21, DEC-02); SaaS billing at the organization level (unit: active student, DEC-28). The "multi-site group of over 2,000 students" pilot (DEC-35) has an organization in read-only consolidated view from JAL-04 onward (creation, tenant linking, consolidated dashboard: FR-ADM-04, FR-RAP-09, PER-13 — ARB-01); shared administration, advanced comparisons, and group-level billing arrive with V1. |
| Version(s) | MVP (read-only view, wave 1); V1 (shared administration, group billing) |
| Entry criteria | Multi-tenant foundation in place since MVP; the read-only view delivered at JAL-02; JAL-10 (go) for the V1 portion. |
| Exit criteria | Consolidated views used by the pilot group's leadership (BES-DIR-01, BES-DIR-04); tenant isolation verified in a security audit (`prd/cross-cutting/31-security-privacy.md`); accurate organization-level billing across the ten months. |
| Dependencies | MVP multi-tenant architecture; JAL-10. |
| Stakeholders | Group leadership (BES-DIR-04), school leadership, ZSchool billing. |
| Traceability | (→ RG-21, RG-23, DEC-02, DEC-28) |

#### JAL-15 — Capability: native Android then iOS apps

| Attribute | Value |
|---|---|
| Target window | V2+, after V1 (adopted reading: `PROJECT.md` §10, aligned with NFR-MOB-02, UX-15, and INT-WAP-06; the divergence with §12 is escalated as ESC-03); Android first, iOS second (Android accounts for 67.96% of web traffic vs. 32.02% for iOS — a traffic share, not a device-fleet share: correction #10) |
| Description | Developing native parent, student, and teacher apps, with the MVP's PWA remaining the foundation; push notifications arrive at V1 via the PWA (Android, and iOS via an installed PWA: NFR-OFF-05), with the native apps adding reliability and low-bandwidth support (NFR-MOB and NFR-OFF domains). §10/§12 divergence: adopted reading = §10 (V2+), recorded in OQ-03 (resolved) and escalated for a baseline update (ESC-03). Naming is checked to avoid any app-store name collision (the "Skoolly" case: `prd/research/01` §2). |
| Version(s) | V2+ |
| Entry criteria | JAL-12 (PWA push in production); V1 stable; developer accounts. |
| Exit criteria | Native parent app published (Play Store then App Store); push success rate measured; roll-call and viewing journeys functional on low bandwidth; store ratings and feedback tracked (without making this a primary KPI, given the market's low app-store volumes, `prd/research/01` §4). |
| Dependencies | JAL-12; JAL-10; developer accounts and publishing. |
| Stakeholders | Parents, students, teachers (users); ZSchool mobile team. |
| Traceability | (→ §10, §12 V1, DEC-36, H-11; `prd/research/01` §4; `prd/research/05` §2) |

#### JAL-16 — V2+ capability: qualified seal and recurring bank-card payment

| Attribute | Value |
|---|---|
| Target window | V2+, after V1 has stabilized |
| Description | **Qualified seal and timestamp** (DEC-30) via a DGSSI-approved trust service provider (Barid eSign, AfricTRUST, or DamaneSign; approval is per service — signature, seal, and timestamp are distinct; no public pricing, D-10) for the leaving certificate, attestations, and transcripts. **Registered-card bank payment** (DEC-31) via NAPS e-Premium (1.98% excl. VAT domestic, Card-On-File), Chari Pay (tokenization, split payments, tiered from 1.8%), or a bank-affiliated payment-institution acquirer; the acquirer contract is held **by the school**, with ZSchool remaining a technical provider that never holds funds; direct debit is left to each school's own bank. |
| Version(s) | V2+ |
| Entry criteria | D-10 (provider chosen, pricing negotiated); D-11 (card rails); V1 stable; willing schools (acquirer contract). |
| Exit criteria | A provider contract covering all three services signed; the qualified seal applied to the targeted documents; recurring card payment operational at willing schools with reconciliation; no fund-holding by ZSchool found in audit. |
| Dependencies | D-10; D-11; school adoption; `prd/cross-cutting/35-external-integrations.md` (INT-SIG, INT-CAR). |
| Stakeholders | School leadership (signed documents), financial-guardian parents (recurring payment), front offices. |
| Traceability | (→ DEC-30, DEC-31, H-09; `prd/research/02` §4; `prd/research/03` §2; corrections #7 and #14) |

#### JAL-17 — V2+ capability: transport, canteen, and health

| Attribute | Value |
|---|---|
| Target window | V2+ |
| Description | Ancillary services (§7.13): school transport (routes, check-in, notification), canteen and after-school care (subscriptions, menus, check-in), extracurricular activities; and the health module (§7.14): a medical record and sensitive health data, never transferred automatically (DEC-08). Optional services may be made conditional on payment; the no-blocking-official-documents principle (DEC-24) remains unchanged. |
| Version(s) | V2+ |
| Entry criteria | V1 stable; prior CNDP authorization for health data (F112, D-15); a willing pilot school per module. |
| Exit criteria | Modules delivered with their journeys; full CNDP health compliance before activation at any pilot; no impact on existing critical journeys (regression verified). |
| Dependencies | JAL-10 and V1 in production; D-15; `prd/modules/22-ancillary-services-transport-canteen-activities.md`, `prd/modules/23-health-sensitive-data.md`; `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| Stakeholders | School leadership, parents, service staff, school nurse (health). |
| Traceability | (→ §7.13, §7.14, §12, DEC-08, DEC-24, G-14, H-15; D-15) |

#### JAL-18 — V2+ capability: school passport and professional teacher network

| Attribute | Value |
|---|---|
| Target window | V2+ |
| Description | **Digital school passport**: a consolidated, consent-based student journey (§6.9), built on `ConsentGrant` (scope, duration, revocation, logging) and the principle that the data subject retains permanent access to their published data (RG-28). **Professional teacher network**: a minimal public school directory (RG-23), search, discreet applications, and availability status (BES-ENS-07), with no notification to the teacher's current employer; no cross-rating or cross-recommendation (DEC-25, RG-35); only verified affiliation periods are shared (RG-20). These capabilities exploit the network effects described in §11 (multi-school parents, part-time teachers). |
| Version(s) | V2+ |
| Entry criteria | Global identity and verified affiliations in production; a critical mass of schools (per the DEC-27 trajectory); logged consents. |
| Exit criteria | The passport viewable with explicit sharing scopes and effective revocation; a teacher's job application invisible to their current employer (dedicated test); no cross-rating possible (audit). |
| Dependencies | The DEC-27 trajectory (critical mass); `prd/modules/18-transfers-mobility.md`, `prd/modules/19-teacher-career-network.md`, `prd/modules/15-documents-certificates.md`. |
| Stakeholders | Students and guardians (passport), teachers (network), schools (verification). |
| Traceability | (→ §6.9, §7.10, §11, DEC-25, RG-20, RG-23, RG-28, RG-35; BES-ENS-06, BES-ENS-07) |

#### JAL-19 — Recurring rhythm: maintenance windows and dated annual milestones

| Attribute | Value |
|---|---|
| Target window | permanent, every school year |
| Description | Implementation of the NFR-DISP domain (§10): a 99.5% availability target outside announced maintenance; **maintenance windows outside the school-year-start and exam periods**. Actual 2026-2027 calendar windows (`prd/research/04`): 18-25/10/2026 (resuming 26/10), 06-13/12/2026 (resuming 14/12), 24-31/01/2027 (resuming 01/02), 21-28/03/2027 (resuming 29/03), 09-16/05/2027 (resuming 17/05), and July-August (a usage lull with no SaaS billing, DEC-28 — the preferred window for version upgrades and onboarding). Dated annual milestones to orchestrate: the May ESISE census (D-08); the AREF campaign for external public-sector teachers (applications from 01/04 to 15/05, final authorization by end of September, a monthly list — D-13); exams (the national baccalaureate 01-03/06/2027 for the first occurrence; regional calendars published by ministerial notice at the start of the year — D-14); the June rollover (JAL-07); the September school-year start; movable religious holidays confirmed by the Ministry of Islamic Affairs a few days beforehand (Ramadan 1448 from 08/02 to 09-10/03/2027; Eid al-Adha from 16 to 18/05/2027 — indicative); regulatory monitoring (Law 59.21 decrees, D-03) and pricing monitoring (Meta, BSPs — D-02). |
| Version(s) | all versions |
| Entry criteria | An annual operations plan set at the end of each school year. |
| Exit criteria (per cycle) | 100% of version upgrades scheduled within holiday windows or July-August; zero heavy maintenance in September or during national and regional exam windows; the N+1 official calendar preloaded before 1 July; "to confirm" religious holidays updated within 48 hours of the Ministry of Islamic Affairs' announcement; the monitoring register kept up to date. |
| Dependencies | D-01, D-02, D-03, D-07, D-08, D-13, D-14; `prd/cross-cutting/32-non-functional-requirements.md` (NFR-DISP). |
| Stakeholders | ZSchool operations team, schools (window notifications). |
| Traceability | (→ §10 NFR-DISP, DEC-28, G-11; `prd/research/04` §3; corrections #1, #17, #18) |

#### JAL-20 — Wave 1 development: identity, enrollment, structure, data-migration foundation

| Attribute | Value |
|---|---|
| Target window | mid-November 2026 |
| Description | The first slice of wave 1: global identities and a login identifier separate from the contact identifier (INV-45, SEC-01), accounts and phone-number changes (FR-ADM-20, SEC-27), student and guardian matching (FR-INS-06, FR-INS-07, FR-INS-11, ARB-09), account claiming with a knowledge challenge (FR-INS-08), the full MVP state machine with import-based activation (FR-INS-15, FR-INS-27, ARB-03), the national academic structure and calendar (FR-PED-01 to FR-PED-05, FR-PED-16), declared class sessions (FR-PED-20), Excel import extended to cover mid-year data migration (FR-ADM-06, ARB-02), the organization in read-only consolidated view (FR-ADM-04). |
| Version(s) | MVP (wave 1) |
| Entry criteria | JAL-01; team sized (§5.2); development and UAT environments. |
| Exit criteria | An anonymized real pilot file of 2,000 students imported with guardians, paid schedules, and cheques in hand, with no unflagged duplicate; import-based activation logged; context switching and multi-profile accounts demonstrated; a minor student with no phone connected via a generated identifier. |
| Dependencies | JAL-01; pilot file samples (D-09); D-16 underway (CNDP filings). |
| Stakeholders | Development team, product team. |
| Traceability | (→ ARB-02, ARB-03, ARB-07, ARB-08, ARB-09; INV-45; PC-03, PC-04) |

#### JAL-21 — Wave 1 development: attendance, notifications, basic finance, enrollment documents

| Attribute | Value |
|---|---|
| Target window | mid-December 2026 |
| Description | The second slice of wave 1: offline mobile roll call by declared session (FR-VSC-01 to FR-VSC-03), same-day first-absence notification with hold-back and correction (FR-VSC-04, FR-VSC-25, FR-COM-11), parent- and front-desk-side justification (FR-VSC-07, FR-VSC-24), an unfulfilled session (FR-PED-21); basic finance with cheques, numbered receipts, family payments, reversal via a counter-entry, sibling discount, account statement, parents' contract (FR-FIN-01 to FR-FIN-04, FR-FIN-07, FR-FIN-10, FR-FIN-12, FR-FIN-17, FR-FIN-18, FR-FIN-24, FR-FIN-29, FR-FIN-30); enrollment documents, school-attendance certificate, exit file (FR-DOC-01, FR-DOC-09, FR-DOC-14); announcements, messages, moderated threads, per-person language preference (FR-COM-01 to FR-COM-05, FR-COM-17); grade entry and progressive publication (FR-EVA-03, FR-EVA-04, FR-EVA-19); dashboards (FR-RAP-01, FR-RAP-04 to FR-RAP-06). |
| Version(s) | MVP (wave 1) |
| Entry criteria | JAL-20; SMS aggregator contracted; WhatsApp rate card obtained (D-02). |
| Exit criteria | Journeys PC-05, PC-06 (grade entry), PC-07, and PC-11 demonstrated end to end on mobile and on older PCs (NFR-MOB-06); notification handed off to the carrier within 5 minutes after validation under load testing; receipts, reversals, and family payments compliant with INV-40. |
| Dependencies | JAL-20; D-02; SMS contract. |
| Stakeholders | Development team, QA team, pilot points of contact (usability review). |
| Traceability | (→ ARB-04, ARB-05, ARB-15, ARB-17, ARB-20, ARB-21; PC-05, PC-06, PC-07, PC-11) |

#### JAL-22 — Pilot UAT on anonymized real data, and rehearsal of the mid-year data migration

| Attribute | Value |
|---|---|
| Target window | mid-January 2027 |
| Description | Wave 1 user acceptance testing with pilot points of contact on an anonymized copy of their real data; a full rehearsal of the mid-year data migration (import, activation, mid-year payment schedules, cheques, first-semester grades); load testing at DEC-35 profile sizes; iOS and Android acceptance testing on the PWA (NFR-OFF-05); RTL and Arabic PDF typography acceptance testing (NFR-DOC). |
| Version(s) | MVP (wave 1) |
| Entry criteria | JAL-21; anonymized real files for the four DEC-35 profiles. |
| Exit criteria | No blocking defect left open; the mid-year data migration replayed with no payment-schedule discrepancy; FR/AR training materials ready (guides, short videos); JAL-02 declared. |
| Dependencies | JAL-21; pilot point-of-contact availability. |
| Stakeholders | QA team, pilot points of contact, ZSchool Success team (training). |
| Traceability | (→ ARB-02, ARB-25q, ARB-25r; DEC-35) |

#### JAL-23 — Pre-pilot compliance and security gate

| Attribute | Value |
|---|---|
| Target window | cleared before 31/01/2027; CNDP filings submitted before 15/12/2026 |
| Description | No pilot is activated (JAL-04) until this gate is cleared (ARB-25): (a) F211 (or F214) filings for each pilot, and ZSchool's own filing as data controller for the global identity layer (DEC-16), submitted before 15/12/2026 (CNF-25, D-16); an F112 application filed for adults' national ID numbers, with the national-ID field left disabled until the authorization is granted (CNF-02, SEC-10); (b) a pilot data-processing agreement signed with each school (CNF-08, D-20); (c) the ZSchool WhatsApp Business account verified, templates approved, opt-in collected with a cross-border transfer notice, and an F118 application filed in parallel (CNF-03, INT-WAP-07, D-17); (d) a first independent penetration test performed, with critical findings remediated (SEC-23, D-19); (e) daily replication of encrypted backups to a second Moroccan site operational, with tested restoration (SEC-21, INT-HEB-06); (f) a manual data-subject-rights procedure and a data-protection point of contact in place (CNF-05, CNF-26). |
| Version(s) | MVP (wave 1) |
| Entry criteria | JAL-01; ZSchool's CNDP templates ready (CNF-01); a backup-hosting contract signed. |
| Exit criteria | CNDP receipts obtained, or filings dated before 15/12/2026; agreements signed; a penetration-test report with no open critical finding; a successful off-site restoration exercise; an up-to-date sub-processor register (CNF-09, including FCM/APNs and monitoring). |
| Dependencies | D-16, D-17, D-19, D-20; `prd/cross-cutting/31-security-privacy.md`; `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| Stakeholders | ZSchool compliance, technical leadership, pilot school leadership. |
| Traceability | (→ ARB-25; DEC-16, DEC-26, Law 09.08; CNF-02, CNF-03, CNF-05, CNF-08, CNF-09, CNF-25, CNF-26; SEC-10, SEC-21, SEC-23; INT-HEB-06, INT-WAP-07) |

#### JAL-24 — Wave 2 development: year-end closing

| Attribute | Value |
|---|---|
| Target window | delivery before 31/05/2027 (pilot UAT in May) |
| Description | The wave-2 requirements (§2.1 bis): class-council decisions and comments with simplified minutes (FR-EVA-13), the annual transcript (FR-EVA-18), the rollover and the pre-filled re-enrollment campaign (FR-INS-20, FR-INS-21, FR-INS-23, FR-INS-24), structure cloning (FR-PED-07), Massar exports with versioned templates, a trimester-to-semester mapping, and a validation report (FR-MAS-02 to FR-MAS-05), batch certificates (FR-DOC-15), a compliance check issued as a warning (FR-EVA-06). |
| Version(s) | MVP (wave 2) |
| Entry criteria | JAL-04 underway at at least two pilots; real pilot Massar files collected (D-09). |
| Exit criteria | The rollover replayed on the anonymized copy of the 2,000-student group with no N+1 duplicate and no orphaned enrollment; Massar exports compared against real pilot files with no blocking discrepancy; delivery outside exam windows (JAL-19). |
| Dependencies | JAL-04; D-09; D-14. |
| Stakeholders | Development team, QA team, pilot front offices and school leadership (UAT). |
| Traceability | (→ ARB-01, ARB-03, ARB-17; RG-09, RG-25; JAL-06, JAL-07) |

### 3.3 Acceptance criteria (Gherkin excerpts)

```gherkin
Feature: Year-end rollover before students leave (JAL-07)
  Scenario: Year N+1 is ready before the end of June
    Given the year-end report cards are published and the year-end decisions are entered
    When school leadership launches the rollover for a pilot school
    Then N+1 enrollments are created in PRE-ENROLLED status, classes are assigned, and N+1 payment schedules are generated before 30 June
    And every student present at closing moves to COMPLETED with their decision, with leaving students having no N+1 enrollment (ARB-03)
    And any remaining balance for each leaving student is retained (RG-12)
    And no N+1 enrollment is created for a student who already has a non-terminal one (RG-08, ARB-03f)
    And the national baccalaureate exam window (01-03/06/2027 for the first occurrence) stays free of any heavy operation

Feature: Pre-pilot compliance and security gate (JAL-23, ARB-25)
  Scenario: Pilot activation is conditional on the gate
    Given a pilot school whose onboarding is complete (JAL-03)
    When the team requests activation (JAL-04)
    Then activation is only possible if the pilot's CNDP filing and ZSchool's own filing were submitted before 15/12/2026
    And if the pilot data-processing agreement is signed
    And if the penetration-test report has no open critical finding
    And if off-site backup replication is active with tested restoration
    And if the adults' national-ID field stays disabled until the F112 authorization is obtained

Feature: MVP-to-V1 transition (JAL-10)
  Scenario: Decision based on measurable criteria
    Given 3 to 5 DEC-35 pilots have completed the first part of the annual cycle (the 2027 school-year start, the first complete first-semester closing of December 2027-January 2028)
    When the transition review computes the indicators from prd/cross-cutting/38-kpi-success-metrics.md
    Then the transition is granted if availability is at least 99.5% outside announced maintenance
    And if the absence-notification delay is under 5 minutes
    And if report-card generation is under 3 seconds and publishing 2,000 report cards is under 10 minutes
    And if no data loss or corruption is found over the cycle
    And if any adoption or stability criterion is not met, the decision is no-go
    And in that case a dated catch-up plan is launched and the commercial launch (JAL-11) is pushed back one school-year start
    And the spring 2028 review issues a recommendation on these criteria, with the final go/no-go decision made after the second period closing and the June 2028 rollover

Feature: Maintenance window (JAL-19, NFR-DISP domain)
  Scenario: Scheduling a heavy operation
    Given a version upgrade or a heavy support operation to schedule
    When the window is proposed
    Then it falls within a holiday period (18-25/10, 06-13/12, 24-31/01, 21-28/03, 09-16/05) or in July-August
    And it is never scheduled in September or during national and regional exam periods

Feature: WhatsApp pricing switch of 01/10/2026 (JAL-12, DEC-36)
  Scenario: Cost charged after the switch
    Given the Morocco standalone rate card applicable from 01/10/2026
    When a utility message is delivered to an opted-in parent
    Then the cost, whether outbound or inbound, is charged to the school's pack per the rate card in effect on the delivery date
    And the credit counter triggers a threshold alert before running out
    And if credits run out, attendance and security messages fall back to alias SMS up to the overdraft cap (FR-COM-08), and all other messages fall back to in-app notification
    And at MVP no push notification is attempted (ARB-21b)
```

---

## 4. Dated external dependencies and fallback plans

Every external claim below comes from `prd/research/00-baseline-corrections.md` and `prd/research/01` through `prd/research/05`, where each fact is referenced with its source. The `D-NN` identifiers are local to this file.

| ID | Dependency | Deadline / date | Source | Milestones affected | Fallback plan |
|---|---|---|---|---|---|
| D-01 | Time zone: permanent return to UTC+0, with no seasonal alternation and no Ramadan exception | Effective since 20/09/2026 at 02:00 (Decree No. 2.26.530; Official Gazette No. 7521 of 29/06/2026) | `prd/research/04` §3; correction #1 | JAL-01, JAL-04, JAL-19 | Settled fact: time-zone data current, storage in UTC, Official Gazette monitoring. Ramadan schedule variants remain configurable as shortened hours. |
| D-02 | Morocco standalone WhatsApp rate cards (end of free service/utility messages within the 24-hour window; exit from "Rest of Africa") | Switch on 01/10/2026; rate cards announced before 01/09/2026 but **not obtained as of 09/09/2026** (to obtain: action item in `prd/cross-cutting/40`, OQ-06) | `prd/research/03` §4; H-20; correction #6 | JAL-12 | Push (free) as the first channel; alias SMS as fallback; credit caps and alerts; annual reassessment of the access mode (Meta's direct Cloud API or a flat-fee BSP at about USD 59/month); budgeting for inbound messages. |
| D-03 | Law 59.21 implementing decrees (parents' contract template, fee-publication rules, sanctions) | 35 decrees expected; law published in Official Gazette No. 7485 of 23/02/2026 | `prd/research/02` §1; correction #2 | JAL-01, JAL-17; contract and document modules | Contract and document templates configurable with no schema overhaul; compliant with the current regime in the meantime; regulatory monitoring carried by `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| D-04 | E-invoicing decree | Not published as of 09/09/2026 (draft with the General Secretariat of Government in April 2026; announced rollout waves: large enterprises 2026, mid-size/SMEs 2027-2028, micro-enterprises after 2028; B2C not planned) | H-08, H-17; correction #15 | `prd/modules/16-finance-billing-collections.md` (V1) | A structured UBL export prepared, phased against decree publication; most schools (B2C clients, individual parents) out of scope initially; compliant accounting exports in the meantime. |
| D-05 | A second Oracle region in Morocco (Settat) | Planned, no published timeline; the Casablanca region `af-casablanca-1` opened in April 2026 with a single availability domain | H-18; correction #13; `prd/research/05` §1 | JAL-23 (MVP replication); JAL-10 (full V1 disaster recovery); `prd/cross-cutting/32-non-functional-requirements.md` | **From MVP onward**: daily replication of encrypted backups to a second Moroccan site (SEC-21, INT-HEB-06; Atlas Cloud Benguérir — Tier III + IV, ISO 27001, PCI DSS — or OVHcloud Local Zone Rabat), with tested restoration; **at V1**: a full DR plan with failover (SEC-20, NFR-DISP-03); failover to Settat once it opens; a service-by-service OCI catalogue check at launch (ARB-25h). |
| D-06 | Fatourati Aggregator contract and pricing | To be negotiated; no public pricing; the Aggregator offering launched 17/02/2026; contact sales.fatourati@cmi.co.ma | H-19; correction #8; `prd/research/03` §1 | JAL-13 | Start with per-school Fatourati Collect (standalone); basic channels (cash, cheque, bank transfer) unchanged; the Aggregator agreement delays a capability, not the V1 version itself. |
| D-07 | Official 2027-2028 school calendar | Not published as of 09/09/2026; the recent pattern places the student intake in early September with classes compulsory from the first Monday | `prd/research/04` §3 | JAL-08, JAL-09 | The 2026-2027 calendar preloaded as a seasonal template; manual per-school entry; religious holidays carried as "to confirm" and updated during the year (Ministry of Islamic Affairs). |
| D-08 | ESISE formats (private-school census, HR registry, May census, year-end results) | Forms not found online; annual May census | H-10; `prd/research/04` §2 | `prd/modules/21-massar-regulatory-exports.md` (V1) | Manual Excel exports validated with the pilots; an ESISE data mirror; real formats collected from the pilots (JAL-03). |
| D-09 | Structure of Massar grade Excel files (download then re-upload) | Not publicly documented; the re-upload is fragile even with no changes made | H-04; correction #11 | JAL-06 | Faithful generation per subject and per semester, with a validation report before submission; testing on real pilot files; no promise of synchronization. |
| D-10 | Qualified seal and timestamp provider (V2) | Approval is per service (signature, seal, timestamp); no public pricing; Barid eSign approved as a qualified trust service provider (January 2025) with qualified timestamping (April 2026); DamaneSign (March 2025); AfricTRUST (June 2026) | DEC-30; correction #14; `prd/research/02` §4 | JAL-16 | V1's advanced seal with timestamp and QR code (DEC-30) remains the document standard, admissible in court without a presumption of validity; selecting a provider covering all three services. |
| D-11 | Recurring bank-card rails (V2) | Available: NAPS e-Premium (1.98% excl. VAT domestic), Chari Pay (tokenization, tiered from 1.8%), bank-affiliated payment-institution acquirers since the CMI contract transfer completed 31/01/2026; YouCan Pay closed since January 2024 | H-09; correction #7; `prd/research/03` §2 | JAL-16 | Two candidate rails, plus bank-affiliated payment-institution acquirers as an alternative; the acquirer contract held by the school; direct debit left to each school's own bank. |
| D-12 | Private-school eligibility for the MOWAKABA program | Unconfirmed (80% for SMEs / 90% for micro-enterprises of costs, projects of MAD 15,000 to 150,000, 4-6 week approval time) | H-22; correction #20; `prd/research/02` §9 | JAL-11 | Launch with no subsidy; a MOWAKABA case prepared as financing support (onboarding, configuration, and training as eligible services); a cautious sales pitch until confirmed. |
| D-13 | The annual AREF cycle for external public-sector teachers (11/11/2024 circular) | Applications from 01/04 to 15/05; preliminary then final authorization by end of September; an 8-hour weekly cap; a monthly list submitted to the AREF | correction #18; `prd/research/02` §8 | `prd/modules/19-teacher-career-network.md` (FR-CAR-11 to FR-CAR-13, V1); JAL-19 | Manual tracking by the school; monthly reporting prepared by the platform once the CAR module is available; the aggregated hour count is visible only to the teacher (ARB-23a). |
| D-14 | Each year's exam calendars (national and regional) | 2027 national baccalaureate: 01-03/06/2027; regional calendars published by ministerial notice at the start of the year | `prd/research/04` §3 | JAL-07, JAL-19 | Manual configuration of exam windows; a freeze on heavy operations during known national and regional windows. |
| D-16 | Pre-pilot CNDP filings: each pilot's F211 (or F214) filing using the ZSchool templates, ZSchool's own filing (DEC-16), an F112 application for adults' national ID numbers | Submitted before 15/12/2026; F112 review takes two to four months, with the national-ID field disabled until authorization | ARB-25a/b; `prd/research/02` §2; CNF-25 | JAL-23, JAL-04 | If a receipt is missing by 31/01/2027: the affected pilot's go-live is delayed; if F112 is not obtained: the national ID number is not collected, with no effect on the rest of the scope. |
| D-17 | The ZSchool WhatsApp Business account verified by Meta and the "absence" templates approved | Before 15/01/2027 (Meta's approval timelines are outside our control) | ARB-21g, ARB-25c; INT-WAP-07 | JAL-12, JAL-23, JAL-04 | Pilots start on in-app + SMS only until approval; SMS is sufficient for the PC-05 journey. |
| D-18 | Go/no-go decision on the Fatourati Aggregator framework contract | 30/06/2027 | ARB-25; INT-FAT-01; H-19 | JAL-13, JAL-11 | Plan B: per-school Fatourati Collect (a direct school-CMI contract), reconciliation via statement import; V1 is not delayed. |
| D-19 | First independent penetration test | Report before 31/01/2027, critical findings remediated before JAL-04 | ARB-25g; SEC-23 | JAL-23, JAL-04 | Activation delayed as long as a critical finding remains open. |
| D-20 | Pilot data-processing agreement (Law 09.08, DEC-16) signed with each pilot | Before each pilot's activation | ARB-25e; CNF-08 | JAL-03, JAL-23, JAL-04 | No real data loaded before signature; onboarding continues with demo data. |
| D-15 | Prior CNDP authorization F112 for processing health data (art. 12 of Law 09.08) | Two-to-four-month review time; filed at least four months before activating the health module at any pilot | `prd/research/02-regulatory-data.md` §2; correction #19 | JAL-17; `prd/modules/23-health-sensitive-data.md`; `prd/cross-cutting/36-legal-compliance-data-protection.md` | As long as the authorization is not obtained, no health-data collection is activated at any pilot (feature freeze, R-15); an early filing during the V1 cycle via CNDP-FORMS; health data is never transferred automatically (DEC-08). |

---

## 5. Scheduling risks, critical path, and seasonality

### 5.1 Scheduling risks (cross-reference to the `prd/cross-cutting/39-risks-mitigations.md` register)

The consolidated risk register (`R-NN` identifiers) is carried by `prd/cross-cutting/39-risks-mitigations.md`; this chapter creates no identifier of its own and only links milestones to the risks that threaten them. Baseline §18 point 9 identifies four risks to manage: Massar (R-03), hosting (R-06), teacher adoption (R-01), sales seasonality (R-04).

| Risk (register 39) | Critical window | Milestones exposed | Mitigation carried by the roadmap |
|---|---|---|---|
| R-21 — MVP schedule slip and team capacity | October 2026 - January 2027 | JAL-20 to JAL-23, JAL-02, JAL-04 | Monthly intermediate milestones; a switch-over trigger to "first go-live at the 2027-2028 school-year start" set at 30/04/2027; a hard cut outside §2.1 and §2.1 bis |
| R-05 — School-year-start peak | September (every year) | JAL-08 | Load testing at DEC-35 profile sizes; a version freeze in September (JAL-19); reinforced support |
| R-05 — Closing and class-council peaks | December-January, March, June (tripled for the trimester-based school) | JAL-06, JAL-09 | NFR-PERF sizing; scheduled closing assistance; staggered grade locks |
| R-21 / R-03 — The June rollover, a point of no return | June (every year) | JAL-07, JAL-24 | Wave 2 delivered before 31/05/2027 and rehearsed on an anonymized copy; batch processing with retry and rollback; the exam window preserved |
| R-06 — Downtime during exams | June (baccalaureate 01-03/06/2027; regional windows) | JAL-06, JAL-19 | Zero maintenance during these windows; off-site replication since MVP; an incident-communication plan |
| R-08 / D-01 — Movable religious holidays | winter and spring (Ramadan 1448: 08/02 - 09/03/2027; Eid al-Adha: 16-18/05/2027) | JAL-04, JAL-19 | Preloading as "to confirm"; a 48-hour update turnaround; configurable schedule variants (G-11) |
| R-04 — Sales seasonality | March - September | JAL-10, JAL-11 | A go decision before summer 2028; pilot references; a MOWAKABA case (D-12); presales with a school-year-start launch |
| R-01 — Teacher adoption | February 2027 then all year | JAL-04, JAL-05, JAL-10 | JAL-03 training; the JAL-05 loop; mobile-first simplicity and offline support; optional MFA for teachers (ARB-25l) |
| R-03 — Massar: undocumented files, fragile re-upload; ESISE with no public formats | closings and the May census | JAL-06, JAL-24 | Faithful generation with a validation report (D-09); testing on real files from JAL-03 onward; ESISE formats collected (D-08); no promise of synchronization (H-04) |
| R-06 — Hosting on a single availability domain | September, December-January, June | JAL-23, JAL-08, JAL-09 | Off-site replication since MVP (INT-HEB-06); a full V1 disaster-recovery plan (D-05); no version upgrade at peak |
| R-10 — Consumable costs after the WhatsApp switch | from 01/10/2026 onward | JAL-12 | The rate card obtained (D-02); counters and alerts; authentication SMS charged to ZSchool (PAK-17); free push from V1 onward |
| R-13 — Entrenched competition on the corridor | commercial campaign (spring-summer) | JAL-11 | DEC-19 positioning; pilot references; differentiation documented in `prd/research/01` |
| R-22 — A pilot dropping out mid-year | February 2027 - June 2028 | JAL-05, JAL-10 | A pilot agreement with a duration commitment; a backup pilot identified (a fifth profile); JAL-10 criteria readable with four pilots |
| R-26 — The Fatourati contract not finalized | 30/06/2027 | JAL-13, JAL-11 | A dated go/no-go (D-18); Collect as a fallback plan |
| R-27 — CNDP filings not obtained before go-live | 15/12/2026 - 31/01/2027 | JAL-23, JAL-04 | An early filing (D-16); go-live delayed pilot by pilot; national ID numbers not collected |
| R-28 — MVP scope extension not confirmed by the founder | before JAL-01 | JAL-01, JAL-02, JAL-24 | The ESC-02 decision requested before the freeze; a fallback scenario: pushing JAL-06 and JAL-07 into an "assisted manual closing" with the founder's explicit waiver |

### 5.2 Critical path (elements missing from version 0.1)

| Item | Planning requirement | Milestones | Owner |
|---|---|---|---|
| Development team | Sizing settled at JAL-01 against wave-1 and wave-2 workload (about 110 MVP requirements to deliver between October 2026 and May 2027); hiring or reinforcement started before 15/10/2026; a velocity review at each intermediate milestone (JAL-20 to JAL-22) | JAL-01, JAL-20 to JAL-22, JAL-24 | ZSchool technical leadership |
| Pilot support | A standard support commitment (NFR-DISP-06: channel, hours, response times, FR/AR) published before JAL-04; reinforced on-call coverage in February-March 2027, June 2027, and September 2027; critical-ticket resolution time (24 hours) tracked | JAL-04, JAL-07, JAL-08 | ZSchool Success and support |
| Training | FR and AR materials (short role-based guides, videos, a test dataset) ready at JAL-22; role-based sessions at each pilot before go-live; a point of contact per school | JAL-22, JAL-03 | ZSchool Success |
| Data migration | A migration file template (paid schedules, cheques, first-semester grades) handed to pilots at JAL-22; rehearsed on an anonymized copy before go-live; a post-import quality check before activating parent accounts (R-18) | JAL-20, JAL-22, JAL-03 | ZSchool product and Success |
| Compliance and security | The JAL-23 gate (CNDP filings, pilot agreement, WhatsApp Business, penetration test, off-site replication) | JAL-23 | ZSchool compliance and technical leadership |
| Founder decisions | ESC-01 (DEC-27 horizon) and ESC-02 (MVP extension) settled before JAL-01; ESC-03 (baseline update) before JAL-02 | JAL-01, JAL-02 | Project founder |

---

## Open Questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | **Escalated — ESC-01 (ARB-06)**: How to read DEC-27's "year 1" and "at three years" (the volume ambition is confirmed by the founder; its calendar anchor is not). | Reference reading adopted here: year 1 = the 2028-2029 school year (the first year including a commercial cohort after the JAL-10 transition), i.e. 20 schools and 15,000 students by summer 2029, and 300 schools and 200,000 students by summer 2031 ("at three years" from the 2028 school-year start). Alternative reading: year 1 = 2027-2028 (pilots and first contracts), which would require an MVP-to-V1 go decision as early as summer 2027. Impact: the numeric criteria of JAL-10 and JAL-11. To be confirmed by the founder. |
| OQ-02 | **Resolved — ARB-02**: Pilot onboarding mode: progressive mid-year onboarding into the 2026-2027 school year (JAL-04, from 01/02/2027) with mid-year data migration (extended FR-ADM-06, FR-INS-27); the switch to "first go-live at the 2027-2028 school-year start" remains R-21's fallback plan (trigger on 30/04/2027). | The reference scenario adopts progressive mid-year onboarding provided the MVP core (JAL-02) is validated in time; the switch-over point between scenarios is set at 30 April 2027. A pilot onboarded mid-year does not experience a full school-year start before September 2027 (JAL-08). To be confirmed by the founder. |
| OQ-03 | **Resolved — 09/09/2026 review (aligned with NFR-MOB-02, UX-15, INT-WAP-06; ESC-03 for the baseline)**: Native apps: §12 places them in V1, §10 places them in V2; adopted reading is V2+, with push in V1 via PWA. | Reference reading: §12 (V1), Android first (DEC-36); the PWA remains the foundation regardless of the outcome. To be settled in review; impact: JAL-15. |
| OQ-04 | **Escalated — ESC-03**: Update `PROJECT.md`: divergences documented in `prd/research/00-baseline-corrections.md` and the review's arbitrations (`prd/cross-cutting/42-review-arbitrations.md` §3). | Permanent UTC+0 since 20/09/2026 (Decree No. 2.26.530; baseline §2.4/§10 still describes seasonal alternation with a Ramadan exception); memos 080.21 and 081.21 suspended on 29/11/2021 (baseline §2.2 says November 2022); YouCan Pay closed since January 2024 (baseline §2.8 still cites it); Massar note 1887/13 not corroborated (§16.2, H-16). This chapter uses the up-to-date data; the baseline update is to be carried into its next version. |
| OQ-05 | **Resolved — ARB-26h**: Numeric thresholds for the MVP-to-V1 adoption criteria, carried by `prd/cross-cutting/38-kpi-success-metrics.md` with a pilot baseline (KPI-46) measured before activation. | The non-functional gates (99.5%; under 5 minutes; under 3 seconds; under 10 minutes) come from baseline §10 and are non-negotiable. The adoption thresholds proposed at JAL-10 (share of class days with a roll call performed, share of report cards published through ZSchool, school-leadership satisfaction) are working targets: to be confirmed by the founder and detailed in `prd/cross-cutting/38-kpi-success-metrics.md` at JAL-01. |
| OQ-06 | **Resolved — ARB-25**: MVP support service levels carried by NFR-DISP-06 (`prd/cross-cutting/32-non-functional-requirements.md`), including "a critical ticket resolved within 24 hours"; numeric values to be confirmed by the founder (OQ-09 in `32`). | Baseline §10 carries an NFR-SAV domain with no numeric threshold; JAL-10's non-functional gates cover the platform, not support, and OQ-05 covers the MVP-to-V1 adoption thresholds. Targets to be confirmed by the founder and detailed in `prd/cross-cutting/32-non-functional-requirements.md` (NFR-DISP-06) and `prd/cross-cutting/38-kpi-success-metrics.md`. Impact: JAL-08. |
| OQ-07 | **Escalated — ESC-02 (ARB-01)**: Founder confirmation of the two-wave MVP scope extension (§2.1 bis) and its development workload before February 2027. | Without confirmation before JAL-01, R-28's fallback scenario applies (an assisted manual year-end closing in June 2027, with an explicit founder waiver). |

---

## Traceability

| Baseline / source ID | Covered in this file |
|---|---|
| `PROJECT.md` §10 (non-functional requirements) | JAL-02, JAL-08, JAL-09, JAL-10, JAL-19, §5 |
| `PROJECT.md` §11 (business model) | JAL-11, JAL-14, §2.4 |
| `PROJECT.md` §12 (scope by version, G-22) | §2 (MVP, V1, V2+ tables), JAL-01, JAL-10 |
| `PROJECT.md` §16 (H-01, H-04, H-08 to H-10, H-15, H-17 to H-20, H-22) | §4 (D-02, D-04, D-06, D-08, D-09, D-11, D-12, D-15), JAL-06, JAL-12, JAL-13, JAL-17 |
| `PROJECT.md` §17 (glossary) | terminology (rollover, claim, period closing, re-enrollment campaign) |
| `PROJECT.md` §18 (points 1, 8, 9) | §1.1, JAL-05, JAL-10, §5 |
| DEC-15 | §2, JAL-01, JAL-10 |
| DEC-19 | JAL-11, §5 |
| DEC-27 | JAL-11, OQ-01 |
| DEC-28 | JAL-03, JAL-11, JAL-12, JAL-14, JAL-19, §2.4 |
| DEC-30 | §2.2, JAL-16 |
| DEC-31 | §2.2, §2.3, JAL-13, JAL-16 |
| DEC-32 | §2.2, JAL-07 |
| DEC-35 | JAL-02, JAL-03, JAL-05, §5 |
| DEC-36 | JAL-04, JAL-12, JAL-15, §2.4 |
| RG-08, RG-09, RG-10, RG-12 | JAL-07 |
| RG-20, RG-23, RG-28, RG-31, RG-35 | JAL-18 |
| RG-21 | JAL-14, JAL-01 |
| RG-25 | JAL-07 |
| RG-33 | JAL-06, JAL-09 |
| DEC-02, DEC-09 | JAL-14; JAL-06, JAL-09 |
| DEC-06 | JAL-07 |
| DEC-26 | JAL-01, D-05 |
| G-06, G-18 | JAL-03 |
| G-07 | JAL-07 |
| G-08 | §2.1 (transfer), JAL-07 (Massar reference on the MAS module side) |
| G-11 | JAL-04, JAL-19 |
| G-14 | JAL-17 |
| G-22 | §2 |
| BES-DIR-01, BES-DIR-04 | JAL-14 |
| BES-DIR-05 | JAL-07 |
| BES-ENS-02, BES-ENS-03 | §5 (adoption) |
| BES-ENS-06, BES-ENS-07 | JAL-18 |
| PC-02 | JAL-07 |
| PC-03 | JAL-03 |
| PC-05, PC-11 | JAL-12 |
| PC-06 | JAL-06 |
| PC-08 | JAL-13 |
| `prd/research/00-baseline-corrections.md` #1, #2, #3, #6, #7, #8, #10, #11, #13, #14, #15, #17, #18, #19, #20 | §1.4, §4, JAL-04, JAL-06, JAL-12, JAL-13, JAL-15, JAL-16, JAL-17, OQ-04 |
| `prd/research/01` (market and competition) | JAL-11, JAL-15, §5 |
| `prd/research/02` (regulatory and data) | §4 (D-03, D-04, D-10, D-12, D-13, D-15), JAL-16, JAL-17, JAL-19 |
| `prd/research/03` (payments and communications) | D-02, D-06, D-11, JAL-12, JAL-13, JAL-16 |
| `prd/research/04` (pedagogy, Massar, calendar) | §1.2, D-01, D-07, D-08, D-09, D-14, JAL-04, JAL-06, JAL-19 |
| `prd/research/05` (infrastructure, usage) | D-05, JAL-15 |
| `prd/journeys/00-journey-map.md` §4 (seasonality) | JAL-08, JAL-19, §5 |
| ARB-01 (two-wave MVP) | §2.1 bis, §2.2, §2.4, JAL-02, JAL-06, JAL-07, JAL-14, JAL-24, OQ-07 |
| ARB-02 (mid-year data migration) | JAL-03, JAL-04, JAL-20, JAL-22, OQ-02 |
| ARB-03 (state machine, year end) | JAL-07, §3.3 |
| ARB-06 (DEC-27 horizon) | JAL-11, OQ-01, §5.2 |
| ARB-10, ARB-19, ARB-21 (adult student, QR, channels) | §2.1, §2.4, JAL-12, JAL-15 |
| ARB-25 (pre-pilot compliance and security) | JAL-23, D-16 to D-20, §5.2 |
| ARB-26 (traceability) | §5.1 (R-21 to R-28 cross-references), OQ-05 |
| ESC-01, ESC-02, ESC-03 | OQ-01, OQ-07, OQ-04, §5.2 |
| `prd/cross-cutting/39-risks-mitigations.md` (R-01, R-03 to R-06, R-08, R-10, R-13, R-21, R-22, R-26 to R-28) | §5.1 |
