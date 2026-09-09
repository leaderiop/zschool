# ZSchool — PRD. Chapter 1: Context, Vision and Scope

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09) |
| Date | 2026-09-09 |
| Status | Draft PRD — under review |
| Source | `PROJECT.md` v1.1: §2 (Moroccan context), §3 (vision, value proposition, differentiation), §11 (business model), §12 (scope by version), §14 (decisions), §15 (resolution of open questions), §16 (assumptions), §18 (next step) |
| Related files | `prd/00-conventions.md` (normative annex), `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/cross-cutting/35` (integrations), `prd/cross-cutting/36` (compliance), `prd/cross-cutting/37` (roadmap milestones), `prd/cross-cutting/38` (metrics), `prd/cross-cutting/40` (open-items tracker), `prd/cross-cutting/41` (glossary), `prd/cross-cutting/42` (review arbitrations, ARB-xx), `prd/research/` (web research findings and baseline corrections, `00-baseline-corrections.md` through `05-infrastructure-usage.md`) |

This chapter sets the product frame: the Moroccan market and its constraints (§1), the vision, value proposition and differentiation (§2), the scope by version (§3), the measurable objectives (§4), the assumptions carried by the product and how they are handled (§5), the PRD's dependency on the baseline document (§6), and the open questions arising from baseline/PRD divergences (§7). It is narrative: functional requirements (`FR-…`) live in the module chapters, cross-cutting requirements in `prd/cross-cutting/`. Terminology follows the baseline glossary (§17) and `prd/cross-cutting/41`; English terms are italicized.

---

## 1. Product context

Condensed from `PROJECT.md` §2.1 to §2.11. The figures quoted carry over from the baseline document, drawn from its documentary verification of September 9, 2026 (§16), corrected where the PRD's web research established a more current figure; sourced consolidations are carried by `prd/research/` (baseline corrections: `prd/research/00-baseline-corrections.md`) and the resulting divergences are logged in §7.

### 1.1 A mass market, poorly equipped (§2.1)

- At the start of the 2025-2026 school year, 8.27 million pupils are enrolled in Morocco, of whom 1.2 to 1.3 million are in the private sector (about 15%), preschool included (H-01, confirmed in substance; the breakdown by cycle is not consolidated in `prd/research/01-market-competition.md` and is therefore not carried over, ARB-26). The ministry recorded 7,564 private establishments in 2023-2024, 70% of them along the Casablanca–Kénitra corridor. The sector is worth about MAD 20 billion in revenue (FY 2019-2020, Competition Council); the baseline's figure of "136,000 jobs," not found in a public source, is not carried over. Sourced consolidation: `prd/research/01-market-competition.md`; nuances logged in §7 (OQ-02).
- Identifiable multi-site networks (Holged: about 17,000 pupils, 20 to 22 campuses, 9 brands; OSUI: 10 establishments, over 11,000 pupils; La Résidence Casablanca: AEFE partner running 17 OCP schools; accredited French network: 44 establishments and about 49,000 pupils in 2025-2026, OSUI included; sources in `prd/research/01-market-competition.md` §1 and §6) account for under 10% of private-sector enrollment. The long tail is made up of more than 7,000 single-site schools, ranging from the small neighborhood school (100 to 300 pupils) to the large multi-site group (2,000 to 6,000 pupils, from kindergarten to high school).
- Tooling is heterogeneous: spreadsheets, paper registers, local software. Double entry (in-house software plus Massar) is the norm. School fees are paid monthly, and collecting on arrears is a major concern for school leadership. Parents expect immediate communication (the day's absences, grades, summonses), mainly over WhatsApp and SMS.

### 1.2 Four coexisting education systems (§2.2, §2.3, §2.5)

| System | Levels and terms | Assessment | Stakes for ZSchool |
|---|---|---|---|
| Moroccan national | 1AP to 2nd Bac; semesters across all three cycles, primary included | Out of 20, ministerial weightings, certifying exams (6AP, 3AC, 1st and 2nd Bac) | Default model; continuous-assessment entry into Massar (§1.4) |
| French mission (AEFE, OSUI, accredited) | PS to Terminale; 3 terms | Out of 20, school record book | Often run on Pronote or EcoleDirecte |
| Bilingual "enhanced national curriculum" | National framework, French labels | Out of 20, semesters or terms by choice | The most common case in the private sector |
| International (British, American, IB) | Year 1-13, Grade K-12 | Letters, percentages, GPA | A minority; specific configuration |

Structuring features of the national system: certifying exams weighted by the ministry — 6AP: 50% continuous assessment, 25% school exam, 25% provincial exam; 3AC: 30% continuous assessment, 30% school exam, 40% regional exam; baccalaureate: 25% continuous assessment, 25% regional exam, 50% national exam (H-02, confirmed); grades from 16 ("très bien") down to 10 (pass), a resit band between 8 and 9.99; continuous assessment of at least two classroom tests per subject and per term, plus one school-wide unified test, except in the second semester of exam years; grade repetition possible at every level, promotion decided in a class council; report cards often bilingual, bearing the school's stamp and the head's signature; grades out of 20 with decimals, weighted averages by coefficient, class rank, remarks. The class remains the basic unit of school life (form teacher, timetable). Certifying-exam grades come from the ministry, not the school.

**Product consequence** (§2.3, RG-24): cycles, levels, tracks, assessment periods, grading scales and coefficients are configurable per school and per section, from templates supplied by ZSchool; the Moroccan national system is the default model (DEC-01).

### 1.3 Calendar and school time (§2.4)

School year running from early September to end of June (July for national exams); fees typically billed over ten months (September to June); the school week often runs Monday to Saturday noon. As of September 20, 2026, Morocco lives permanently on UTC+0 (Decree No. 2.26.530, Official Gazette No. 7521 of 06/29/2026, `prd/research/00-baseline-corrections.md` #1): the seasonal switch and the Ramadan exception disappear; during Ramadan, the continuous school day translates into a lighter timetable, with no timezone change. Public holidays mix fixed-date national holidays with movable religious holidays (Eid al-Fitr, Eid al-Adha, 1st of Muharram, Mawlid), announced only a few days ahead; the official calendar (start of term, breaks, exams) is published annually by the ministry. The `Africa/Casablanca` timezone (fixed UTC+0), editable movable holidays, and timetable variants (normal, lightened Ramadan, exams) are therefore native requirements; the timezone correction relative to the baseline document is logged in §7 (OQ-01).

### 1.4 Massar and national identifiers (§2.6)

- Each pupil is issued a **Massar code** (one letter followed by nine digits), assigned at first enrollment and kept for the whole of their schooling; for baccalaureate holders since 2015, it replaces the former National Student Code (CNE, 8 digits). Massar has covered every public and private establishment, all cycles, since 2013-2014: enrollments, classes, continuous-assessment grades; for certifying levels, this entry feeds the ministry's official average. The ESISE census of private establishments is validated from Massar data (H-03, confirmed in substance).
- Massar **exposes no interface to software vendors** (H-04, confirmed): the only documented channel is importing and exporting Excel files from the grade-entry module. ZSchool will produce files in Massar formats and will not automate entry without the ministry's agreement. Transfers between schools go through a Massar procedure validated by the provincial education office.
- Adults are identified by their national ID card (CNIE); children, generally without a CNIE before age 16, by their birth certificate extract and Massar code; foreign nationals by passport or residence card.

**Product consequence**: the Massar code is the preferred matching key for pupil identity, without being mandatory (preschool, new arrivals, foreign schools) (DEC-04).

### 1.5 Regulatory and tax framework (§2.7)

- **Law 59.21** (published in Official Gazette No. 7485 of 02/23/2026; 113 articles, 10 chapters; it repeals and replaces Laws 04.00, 05.00 and 06.00, with 35 implementing decrees expected): opening authorization, authorized cycles, permanent teaching staff, a written contract with parents, full fee transparency (art. 49: mandatory publication of the fee schedule), a ban on mid-year fee increases and forced purchases, a ban on refusing re-enrollment to a pupil in good standing, and mediation panels (naming to be confirmed in the decrees). Two rules inherited from the repealed Law 06.00 are kept in the PRD as default parameters, without being attributed to Law 59.21 until the decrees confirm them: the threshold of at least 80% permanent teachers, and the AREF's individual annual authorization for teachers moonlighting from the public sector, capped at 8 hours per week (watch item, H-14; §7 OQ-03; `prd/modules/19`).
- **Framework Law 51.17 (2019)**: system reform, languages of instruction, preschool.
- **Law 09.08 and the CNDP**: still in force, no overhaul adopted (H-05). Prior declaration for pupil and parent files; prior authorization (2 to 4 months) for health data, national ID number, biometrics, file interconnection. Any hosting abroad constitutes a transfer: unrestricted only to countries on the adequacy list (Deliberation 236-2015), otherwise an F118 authorization by the data controller is required; the United States is not on that list. No rule specific to minors: consent is given by the legal representative; no statutory obligation to appoint a data protection officer.
- **Law 05.20 (cybersecurity)**: the qualified-cloud obligation targets only public administrations, public establishments, critical infrastructure and listed operators; it does not apply to a private school or a software vendor, except under contract with a public entity (H-06, disproved as an obligation, confirmed as a market expectation). Production and backup hosting remain sited in Morocco (DEC-26).
- **Law 43.20 (electronic signature)**: simple, advanced and qualified levels (the qualified level is equivalent to a handwritten signature); qualified providers accredited by the DGSSI: Barid eSign, AfricTRUST, DamaneSign; no level is mandated by the texts for report cards and certificates; product choice under DEC-30: the school's advanced electronic stamp in V1, a qualified stamp via an accredited provider in V2.
- **Taxation (General Tax Code)**: tuition fees are VAT-exempt with no right to deduct (H-07, confirmed); catering, transport and leisure activities provided by the school to its own pupils are exempt, taxable if provided by a third party; accounting records kept for 10 years; mandatory mentions ICE, IF, RC (trade register), business license.
- **Electronic invoicing** (General Tax Code art. 145-IX, DGI platform): real-time validation model for signed invoices; decree not yet published as of mid-2026, large companies first, SMEs and micro-enterprises expected in 2027-2028 (H-08, partially confirmed).
- **School documents and unpaid fees**: issuing a certificate of enrollment or a leaving certificate may not be made conditional on any dispute, including a financial one (ministerial position of September 2020, 2020 summary-proceedings orders with a daily penalty; Law 59.21 sanctions a refusal to issue, `prd/research/02-regulatory-data.md` §6). The May 28, 2021 note on issuing documents from Massar on the guardian's written request is cited in the press but was not found online: it is not carried over as a basis (ARB-26).

**Product consequence**: ZSchool is a **data processor** for each school's operational data and a **data controller** for the global identity and the school passport; this dual role must be formalized (contracts, CNDP declarations, privacy notices, legal guardians' consent) before commercial launch (DEC-16).

### 1.6 Finance and payments (§2.8)

Commonly charged fees: a one-time, generally non-refundable enrollment fee; an annual re-enrollment fee, often with a spring deposit; monthly tuition over ten months (tariff by level, sibling discount common); mandatory annual insurance; monthly transport by circuit or zone; canteen and after-school care; one-off activities; supplies and uniforms. Observed payment methods (H-09, confirmed): cash with a cash receipt, cheques (often handed over at the start of the year to cover the whole year's installments), bank transfer, direct debit reserved to the school's own bank with no interface, and card/online payment.

- Since May 1, 2025, the CMI is no longer a commercial acquirer but a simple national *switch*; its merchant contracts were transferred to seven acquiring payment institutions (Attijari Payment, M2T, Damane Cash, Lana Cash, Al Filahi Cash, Saham Paiements, CDM Pay), a transfer completed on 01/31/2026. No Stripe equivalent is available to Moroccan entities.
- **Fatourati** (the CMI's interbank bill-payment network: 32 banks and payment institutions, more than 25,000 cash points) is the rail best suited to schools: the school becomes the creditor, the parent pays from their banking app, an ATM, a mobile wallet or a cash agent, and reconciliation is automatic; the "Fatourati Aggregator" offer, launched on 02/17/2026, lets a software vendor connect its own customers. Card payment with a stored card and recurring billing runs through NAPS or Chari Pay.
- ZSchool never holds parents' funds: each school collects into its own account; a platform that held funds would need to be licensed as a payment institution by Bank Al-Maghrib (DEC-31).

Realities to accommodate: significant payment delays, manual follow-up, bounced cheques, case-by-case negotiated discounts, in-house scholarships, payment by a third party (grandparent, employer), and a frequent gap between the legal parent and the paying parent.

### 1.7 Languages and script (§2.9)

Interface in French and Arabic, with native right-to-left (RTL) reading-direction handling; English desirable for international sections; Amazigh (Tifinagh) to be planned for certain content. Names in dual script (Latin and Arabic), both required on official documents and in Massar. Official documents are often bilingual, carrying the school's letterhead, authorization number, stamp and signature. The language of instruction is an attribute of the subject (DEC-10).

### 1.8 Digital usage (§2.10)

Mobile-first: 91.2% of individuals aged 5 and over use the internet and 89.2% of households have access (93.6% urban, 78.4% rural); 91.7% of individuals with a mobile phone own a smartphone (ANRT, 2024-2025 ICT survey); Android 67.96% and iOS 32.02% of mobile web traffic (StatCounter, August 2026, traffic share, not device-fleet share); connections in class are sometimes unstable. WhatsApp is used by 98.6% of social-network users, i.e. nearly all parents (H-11, confirmed in substance; sources in `prd/research/05-infrastructure-usage.md`): it is the de facto channel between schools and parents. SMS remains the universal notification channel and the fallback for the rural digital divide; email is rarely checked; many parents and teachers have no active email address, and the mobile number is the primary contact identifier (DEC-11). Teachers do not always have a computer in class: attendance calls and grade entry happen on the phone. These findings ground the notification-channel hierarchy (push notifications first, WhatsApp, SMS as a fallback; email secondary) (DEC-12, DEC-36).

### 1.9 Operational realities of schools (§2.11)

Multi-site school groups (one legal entity, several sites sometimes under separate authorizations, one head per site, consolidated accounting); part-time teachers working at several schools at once (more than half of private-sector teachers according to parent associations, an unofficial figure, H-13; the baseline accordingly allows simultaneous affiliations, DEC-05, RG-17); the head supervisor and supervisors, central to absences, tardiness, discipline and communication with parents; the front-office/cashier team handling enrollment, cash collection, certificates and paper files; school transport is very widespread (routes, chaperones, drivers); withholding documents (leaving certificate, report cards) for unpaid fees is a common but regulated practice and a source of disputes — the baseline settles it: no blocking of official documents (DEC-24); start-of-year workload peaks (enrollment, re-enrollment, class assignment, timetables) concentrated over a few weeks.

### 1.10 Cross-cutting product consequences

This context grounds the baseline's structuring choices: a global multi-school identity (DEC-03), a configurable pedagogical structure with the national model as default (RG-24), FR/AR bilingualism and dual script (DEC-10), phone number as contact identifier and SMS/WhatsApp as priority channels (DEC-11, DEC-12), files in Massar formats rather than automation (DEC-04, H-04), production and backup hosting in Morocco (DEC-26), and no holding of funds (DEC-31). These choices are translated into requirements in the functional chapters (`prd/modules/`) and cross-cutting chapters (`prd/cross-cutting/`).

---

## 2. Vision and value proposition

### 2.1 Vision (§3.1)

Build the digital infrastructure of the school journey in Morocco: a persistent identity for every pupil, parent and teacher, a history kept across schools, access controlled by context. The baseline's founding principle (§4) follows from this: a person's identity does not depend on the school; the school owns the context and the operational data, never the person (DEC-03). One person can carry several profiles (a teacher and a parent, for example); the account is unique, the profiles are multiple (G-27, resolved).

### 2.2 Value proposition by actor (§3.2)

| Actor | Value |
|---|---|
| School leadership | One platform for academic structure, student life, grades, finance and communication; less re-keying; better collections; immediate reporting; easier compliance. |
| Front office, cash desk, student life | Fast everyday tools (enrollment, cash collection, attendance call, certificates) on computer and mobile. |
| Teacher | Attendance calls and grades in a few taps from a phone; a single profile even while working at several schools; a preserved career record. |
| Parent | One account for every child and every school; real-time information (absences, grades, payments, announcements); accessible documents. |
| Pupil | Timetable, grades, homework, documents; a preserved record; a school passport eventually (V2). |
| ZSchool | Network effect: the more schools join, the more valuable the global identity becomes (transfers, part-time teachers, multi-school parents). |

The corresponding needs by persona are detailed in `prd/02-actors-personas.md` (`BES-…` identifiers).

### 2.3 Differentiation (§3.3)

Four pillars that no identified competitor combines:

1. **Global identity and portability**, where existing solutions are single-school (one parent account per school, no portable teacher profile).
2. **Designed for Morocco**: Massar, Arabic/French bilingualism, the Ramadan calendar, monthly fees over ten months, WhatsApp and SMS, family law (the Moudawana).
3. **Multiple education systems** in a single tool (national, French mission, bilingual, international).
4. **Mobile-first SaaS**, with no installation and no local server.

### 2.4 Competitive positioning (§3.3, G-25, Q-01, resolved)

| Segment | Players | Main limitation |
|---|---|---|
| Ministry system | Massar (Waliye, Moutamadris, Moudaris) | Mandatory and free, but with no billing, transport, canteen or communication; parent apps rated between 2 and 2.9 out of 5 (PRD research nuance: Moutamadris found at 3.1 out of 5), not updated since March 2022. |
| Legacy vendor | Madariss Plus and eMadariss (Nexsoft, Rabat; more than 900 establishments claimed) | Large installed base, desktop-software legacy, poorly rated mobile app. |
| Recent Moroccan SaaS players | Skoolly, Minassa, Tayssir School, SchoolMA, SchoolApp, E-Schools, DataSchool, SmartSchool, ALIFADA, E-Madrassati | All single-school, one parent account per school, file-based "Massar synchronization," uneven app quality. |
| Adapted ERPs | Odoo "Education Pack" via integrators, Galactis | Heavy to deploy, group-oriented. |
| French-curriculum schools | Pronote (Lycées Descartes, Louis-Massignon, EFI), EcoleDirecte | Student life with no billing or Massar; EcoleDirecte's use in Morocco is unverified. |

Baseline price benchmarks (§3.3): Moroccan public price points between MAD 10 and 65 per pupil per year; complete French offerings around €15 per pupil per year; DataSchool, the best-adopted parent app (more than 10,000 installs; the "4.2 out of 5" rating is not confirmable, 4.0 out of 5 on three App Store reviews, `prd/research/01-market-competition.md` §2). **No player offers a global multi-school identity, a single cross-school parent account, or a portable teacher profile; the weakness of existing parent apps, Massar included, is the clearest opening.** The competitive watch tied to this chapter is logged in `prd/research/`.

---

## 3. Product scope

### 3.1 Target (DEC-01, DEC-19)

- **Product target**: private schools in Morocco, from preschool to the baccalaureate, across every education system (national, French mission, bilingual, international); the Moroccan national system is the default model (DEC-01, RG-24).
- **Commercial target**: as a priority, schools of 300 to 3,000 pupils along the Casablanca–Kénitra corridor, home to 70% of private schools (DEC-19).
- **Institutional breakdown**: the isolation tenant is the school; the school group (organization) is a consolidation layer, not a data merge (DEC-02).
- **Access model**: the paying customer is the school; parents, pupils and teachers pay nothing (DEC-13).

### 3.2 Out of scope

| Item | Status | Reference |
|---|---|---|
| Higher education and vocational training | Out of scope; the level model stays generic so as not to preclude it | DEC-29, C-11, Q-11 |
| Dual enrollment (tutoring centers, outside activities) | Not modeled: a single active enrollment per pupil and per school year until V2 | DEC-21, Q-03 |
| Holding parents' funds | Never; each school collects into its own account; the platform is limited to reconciliation and initiating payments | §2.8, DEC-31 |
| Automating data entry into Massar | Excluded without the ministry's agreement; production of files in Massar formats only | §2.6, H-04 |
| Cross-rating or recommendation between teachers and schools | Excluded from the entire roadmap; only verified affiliation periods are shared | DEC-14, DEC-25 |

### 3.3 Scope by version (§12, G-22, DEC-15)

| Version | Purpose | Summary content |
|---|---|---|
| **MVP** | Validation with 3 to 5 pilot schools, activated mid-year in 2026-2027 and run through summer 2028 | **Wave 1 (activation, February 2027)**: onboarding, Excel import and mid-year data reprise (settled installment plans, cheques in hand, current-term grades); academic structure (national model), year, classes, subjects, declared attendance sessions; global identities, Massar and guardian matching, invitations, support-side duplicate merging; enrollment (a simplified state machine, completed by CANCELLED and import activation); parent-pupil relationships with default qualities and rights, adult pupils; affiliations and standard roles; attendance with SMS/WhatsApp notification (first absence of the day), justification, correction notice; grades (configurable progressive publication), averages, published, immutable bilingual report cards; base finance (fee schedule, installment plan, the Law 59.21 parent contract, cash collection including a cheque lifecycle, numbered receipts, sibling discount, unpaid fees, reminders, account statement); announcements, messages, moderated in-app threads, in-app and SMS notifications; parent dashboards for multiple children and schools, pupil, teacher and school-leadership dashboards, a read-only group consolidation view; simple transfer between ZSchool schools and a PDF exit file; FR/AR, responsive web, progressive web app (*PWA*). **Wave 2 (year-end close, June 2027)**: year-end decisions and *rollover* (structure cloned, N+1 enrollments pre-enrolled, pre-filled re-enrollment with a deposit), annual transcripts, Massar continuous-assessment and roster exports, batch documents. Extension of the baseline's §12 scope: ARB-01, a working hypothesis to be confirmed by the founder (§7 OQ-05). |
| **V1** | Commercialization | Admissions, re-enrollment campaign reminders, class council preparation; timetabling with conflict detection and Ramadan variants; full discipline and student life; self-service documents and certificates with QR verification; full finance (cheques, cash sessions, accounting exports, compliant invoices, discounts and scholarships); Massar exports and regulatory statistics; multi-school organizations with consolidated views; WhatsApp Business API, push notifications, native apps; audit, individuals' rights, formalized CNDP compliance; Fatourati payment as the primary rail (DEC-31); exit file accessible to non-ZSchool schools via a secure link (DEC-32); the school's advanced electronic stamp (DEC-30). |
| **V2 and beyond** | Extension | Digital school passport (§6.9); professional teacher network; card payment with a stored card (NAPS or Chari Pay) and direct debits; transport, canteen, activities, health; automatic timetable generation; public API, accounting integrations, Massar integration if a channel opens up; English and international grading scales (letters, GPA); light e-learning; qualified stamp and timestamp via an accredited provider (DEC-30). |

Detailed sequencing and dated milestones are carried by `prd/cross-cutting/37` (`JAL-…` identifiers); this chapter fixes only the content by version.

---

## 4. Measurable product objectives

The stated ambitions are decisions already made in the baseline document, confirmed by the founder on September 9, 2026. Their translation into lasting indicators (`KPI-…`) is carried by `prd/cross-cutting/38`; tracking of delivery is carried by `prd/cross-cutting/40`.

| Objective | Indicator | Target | Source |
|---|---|---|---|
| Validate the MVP under real conditions | Number and profiles of active pilot schools | 3 to 5 pilots, covering the four target profiles: a primary school of about 300 pupils, a middle/high school of about 800, a multi-site group of more than 2,000 pupils, a bilingual school running on terms; Casablanca–Rabat corridor | §12, DEC-35, Q-13 |
| Establish the year-1 commercial trajectory | Active client schools; active pupils | 20 schools and 15,000 pupils by the end of year 1 (pilots then the Casablanca–Kénitra corridor) | DEC-27, Q-09 |
| Reach critical mass within three years | Active client schools; active pupils | 300 schools and 200,000 pupils within three years | DEC-27 |
| Hold the pricing policy | Share of customers billed on the single plan; tariff compliance | A single plan at MAD 5 per active pupil per month over 10 months (i.e. MAD 50 per pupil per year), all modules included; only consumables (SMS, WhatsApp, storage beyond quota) and services (onboarding, migration) billed in addition; no paid per-module option | §11, DEC-28, Q-10 |
| Prove the MVP's usage value | Pilot adoption, daily attendance-call rate, notification delay, collection rate, reduction in double entry | Target values to be set in `prd/cross-cutting/38` when the KPIs are defined | §18 (point 8) |

---

## 5. Assumptions carried by the product

The baseline document verified the version 1.0 assumptions through documentary research on September 9, 2026 (§16.1) and lists the points still to verify against primary texts (§16.2). The table below reflects the state as of that date and how the PRD treats it; where the PRD's own research (`prd/research/00-baseline-corrections.md`) has updated a status or a figure, the relevant column says so explicitly. Any status change is tracked in `prd/cross-cutting/40`, and research findings in `prd/research/`.

### 5.1 Verified assumptions (§16.1)

| ID | Subject | Status (§16.1) | PRD treatment |
|---|---|---|---|
| H-01 | Private-sector share and headcount, number of establishments | Confirmed in substance | Figures carried over and refined in §1.1 (1.2-1.3M, ~15%; 7,564 establishments in 2023-2024; revenue ~MAD 20bn 2019-2020, Competition Council); sourced consolidation in `prd/research/01-market-competition.md`; nuances in §7 (OQ-02) |
| H-02 | Exam weighting (6AP, 3AC, baccalaureate) | Confirmed | Default assessment-configuration values; supplemented by H-16 |
| H-03 | Scope of Massar entries for the private sector | Confirmed in substance | Massar export framework (`prd/cross-cutting/35`); private-sector-specific circular to be documented in `prd/research/` |
| H-04 | No Massar API, Excel file channel | Confirmed | Basis for excluding all automation (§3.2); `INT-MAS` export requirements (`prd/cross-cutting/35`) |
| H-05 | Overhaul of Law 09.08 | Disproved for now | Compliance built on the law in force (`prd/cross-cutting/36`); legislative watch entered in the tracker (`prd/cross-cutting/40`) |
| H-06 | Requirement to host minors' data in Morocco | Disproved as an obligation, confirmed as a market expectation | Production and backup hosting in Morocco retained (DEC-26); compliance and hosting requirements (`prd/cross-cutting/36`, `prd/cross-cutting/32`) |
| H-07 | VAT regime for tuition and services | Confirmed | Finance-module billing rules (`prd/modules/16`) |
| H-08 | Electronic-invoicing timeline | Partially confirmed | UBL-format export and qualified stamp planned (V2, DEC-30); watch on decree publication (`prd/cross-cutting/40`) |
| H-09 | Payment providers and rails | Confirmed and refined | Payment architecture: Fatourati then stored card (DEC-31); integration requirements (`prd/cross-cutting/35`) |
| H-10 | Required statistics formats (ESISE) | Partially confirmed | ESISE channels scoped; exact forms to be gathered from the pilots (`prd/cross-cutting/40`, reporting) |
| H-11 | Parents' preference for WhatsApp, acceptance of an app | Confirmed in substance | ANRT 2024-2025 indicators carried over in §1.8; sourced consolidation in `prd/research/05-infrastructure-usage.md`; channel choice (DEC-36); confirmation via pilot survey (`prd/cross-cutting/40`) |
| H-12 | Whether school leaders accept a pupil's permanent access to their report cards | Unverified | To be tested in pilot interviews (`prd/cross-cutting/40`); the ministerial position on unconditional document delivery points that way (§1.5) |
| H-13 | Share of part-time teachers in the private sector | Partially confirmed | Simultaneous-affiliation model already settled (DEC-05, RG-17); unofficial statistic to be documented in `prd/research/` |

### 5.2 Points still to verify against primary texts (§16.2)

| ID | Subject | Status (§16.2) | PRD treatment |
|---|---|---|---|
| H-14 | Law 59.21 in the Official Gazette: document delivery and unpaid fees, fine schedule, parent-contract content | Published in Official Gazette No. 7485 of 02/23/2026 (§16.2 status to be updated) | Text read in `prd/research/02-regulatory-data.md` (repeals Laws 04.00, 05.00 and 06.00; 35 implementing decrees expected, watch in `prd/cross-cutting/40`); impact on the parent contract and unpaid-fees policy (`prd/cross-cutting/36`, documents and finance modules); baseline divergence logged in §7 (OQ-03) |
| H-15 | CNDP adequacy list in force (Deliberation 236-2015 and updates) | Unverified | Choice of messaging and backup providers (`prd/cross-cutting/36`) |
| H-16 | Numbers of the weighting decrees (bac, 3AC, 6AP), Massar and continuous-assessment grades | Unverified | Default values for average calculations; regulatory references to be logged in `prd/research/`; the 6AP label is kept as "provincial exam" (baseline §2.2), while `prd/research/04` says "regional": the divergence is to be settled against the decree (ARB-18) |
| H-17 | Possible publication of the electronic-invoicing decree since June 2026 | Unverified | Finance-module planning; watch (`prd/cross-cutting/40`) |
| H-18 | Services and pricing available in the Oracle Cloud Casablanca region | Unverified | Hosting requirements (`prd/cross-cutting/32`); findings in `prd/research/` |
| H-19 | Fatourati pricing and contract (creditor, Collect, Aggregator), multi-school payout | Unverified | Payment integration requirements (`prd/cross-cutting/35`) |
| H-20 | WhatsApp Business pricing for Morocco after October 1, 2026 | Unverified | Notification-channel re-assessment planned under DEC-36; tracking (`prd/cross-cutting/40`) |
| H-21 | Numbering of articles 180 to 186 of the Family Code; DGI doctrine on schooling | Unverified | Legal mentions on documents (`prd/cross-cutting/36`) |
| H-22 | Public digitalization-subsidy program for SMEs and micro-enterprises, applicability to schools | Unverified | Commercial lever to confirm (`prd/research/`, §11) |

### 5.3 Handling rule

A confirmed assumption directly grounds requirements; a partially confirmed assumption grounds a requirement paired with a pilot-phase verification; an unverified or disproved assumption authorizes no requirement that would depend on it without prior validation: the point is entered in the tracker (`prd/cross-cutting/40`) and, where relevant, handled as an open question (`OQ-…`) by the file that owns it (conventions §1).

---

## 6. Dependency assumptions

- Reading and drafting this PRD assumes `PROJECT.md` v1.1 is validated and unmodified while it is being drafted (conventions §1 and §6). Decisions DEC-27 (ambition), DEC-28 (price) and DEC-35 (pilots) are confirmed there by the founder; every open question from version 1.0 is resolved (§15).
- Any later change to the baseline document (a new decision, a revised assumption status, a correction) requires a corresponding update to the PRD: the baseline only changes version alongside an update to the affected decisions (§18), and the chapters that depend on it are revised accordingly, tracked in `prd/cross-cutting/40`.
- The market figures and external claims in this chapter carry over from the baseline document (sources in §16.3), corrected by the PRD's own research where they proved outdated or unsourced; their sourced consolidation is carried by `prd/research/` and the remaining divergences are logged in §7.

## 7. Open questions

The baseline document `PROJECT.md` v1.1 is frozen (conventions §1 and §6); the divergences found by the PRD's research (`prd/research/00-baseline-corrections.md`) are kept current here and logged in this chapter. Formally carrying these corrections back into the baseline document is to be submitted to the founder (§18).

| ID | Subject | Finding | Handling in this chapter | Tracking |
|---|---|---|---|---|
| OQ-01 | Timezone (§1.3; baseline §2.4, §10) | The baseline describes "UTC+1, reverting to UTC+0 during Ramadan"; Decree No. 2.26.530 (Official Gazette No. 7521 of 06/29/2026) sets a permanent return to UTC+0 as of 09/20/2026, with no seasonal switch or Ramadan exception (correction #1 of `prd/research/00-baseline-corrections.md`) | §1.3 adopts permanent UTC+0; Ramadan becomes a lightened timetable with no timezone change; a corrective update to the baseline is to be submitted to the founder | `prd/cross-cutting/40` |
| OQ-02 | Market figures and digital usage (H-01, H-11) | The exact pairing "1.27M / 15.3%," the "136,000 jobs" figure, and "8% basic-phone / 14% rural" are not found in public sources; the "~MAD 20bn" revenue figure dates to 2019-2020 (Competition Council); Android/iOS 68/32 is a web-traffic share, not a device-fleet share; Moutamadris found at 3.1 out of 5 | §1.1, §1.8 and §2.4 carry the sourced values; consolidations in `prd/research/01-market-competition.md` and `prd/research/05-infrastructure-usage.md`; cross-reference to OQ-01 of `prd/cross-cutting/33` | `prd/cross-cutting/40`, `prd/cross-cutting/33` (OQ-01) |
| OQ-03 | Publication of Law 59.21 (H-14; baseline §2.7) | The baseline places publication "in the Official Gazette in March 2026"; the text appeared in Official Gazette No. 7485 of 02/23/2026 (113 articles, 10 chapters) and repeals Laws 04.00, 05.00 and 06.00; 35 implementing decrees expected; carrying over "80% permanent teachers" (from the repealed Law 06.00) is unconfirmed | §1.5 and §5.2 updated on Official Gazette No. 7485; watch on implementing decrees; baseline update to be submitted to the founder | `prd/research/02-regulatory-data.md`, `prd/cross-cutting/36`, `prd/cross-cutting/40` |
| OQ-04 | Fatourati V1 exception (DEC-31) | DEC-31 makes Fatourati the primary rail from V1 onward (stored card in V2), where a literal reading of the baseline's §12 (online payment in V2) contradicts it | This chapter follows DEC-31 (§1.6, §3.2, §3.3); the version exception stays explicit and tracked | `prd/cross-cutting/40`, `prd/cross-cutting/35` |
| OQ-05 | MVP scope extension (ARB-01, ESC-02) | Pilots are activated mid-year (JAL-04) and must close out the 2026-2027 year (JAL-06, JAL-07) before V1; the baseline's §12 covers neither the *rollover*, nor cheques, nor the parent contract, nor a read-only group consolidation view at MVP | §3.3 adopts a two-wave MVP (ARB-01) as a working hypothesis; the development effort before February 2027 and the alternative (compressing V1) are for the founder to decide | `prd/cross-cutting/42`, `prd/cross-cutting/40`, `prd/cross-cutting/37` |
| OQ-06 | DEC-27 horizon (ARB-06, ESC-01) | The roadmap places commercialization at the 2028 school year start (JAL-10/11): "20 schools by the end of year 1" then reads as summer 2029 and "300 within three years" as 2031, whereas the founder confirmed DEC-27 without this shift | §4 carries DEC-27 as-is; the two-year gap is escalated to the founder, with no arbitration made in the PRD | `prd/cross-cutting/42`, `prd/cross-cutting/40`, `prd/cross-cutting/37` |

---

## Traceability

| Baseline ID | Subject | Coverage in this chapter |
|---|---|---|
| §2.1, H-01 | Private-education market | §1.1, §5.1, §7 (OQ-02) |
| §2.2, H-02 | Structure and weighting of the national system | §1.2 |
| §2.3 | Coexisting education systems | §1.2, §3.1 |
| §2.4 | Calendar and school time | §1.3, §7 (OQ-01) |
| §2.5 | Assessment and grading | §1.2 |
| §2.6, H-03, H-04 | Massar and national identifiers | §1.4, §3.2 |
| §2.7, H-05, H-06, H-07, H-08, H-14 | Regulatory and tax framework | §1.5, §5.2, §7 (OQ-03) |
| §2.8, H-09 | Fees and payment methods | §1.6, §7 (OQ-04) |
| §2.9 | Languages and script | §1.7 |
| §2.10, H-11 | Digital usage | §1.8, §5.1, §7 (OQ-02) |
| §2.11, H-13 | Operational realities | §1.9 |
| §3.1 | Vision | §2.1 |
| §3.2 | Value proposition by actor | §2.2 |
| §3.3, G-25, Q-01 | Differentiation and competitive landscape | §2.3, §2.4 |
| §4, G-27 | Founding principle, multiple profiles | §2.1 |
| §11, G-24, Q-10, H-22 | SaaS business model | §1.6, §4 |
| §12, G-22, DEC-15 | Scope by version | §3.3 |
| DEC-01 | Preschool-to-baccalaureate target, default national model | §3.1 |
| DEC-02 | School tenant, consolidation organization | §3.1 |
| DEC-03 | Global identity, single account, multiple profiles | §2.1 |
| DEC-04 | Massar code as a non-mandatory matching key | §1.4 |
| DEC-05, RG-17 | Simultaneous affiliations allowed | §1.9 |
| DEC-10 | FR/AR interface, dual script, bilingual documents | §1.2, §1.7 |
| DEC-11, DEC-12 | Phone as contact identifier, SMS/WhatsApp prioritized | §1.8 |
| DEC-13 | Paying customer: the school; free for users | §3.1 |
| DEC-14, DEC-25 | No cross-rating on the roadmap | §3.2 |
| DEC-16 | Dual data-processor / data-controller role | §1.5 |
| DEC-19 | Positioning and commercial target | §2.4, §3.1 |
| DEC-21, Q-03 | A single active enrollment; dual enrollment pushed to V2 | §3.2 |
| DEC-24 | No blocking of official documents for unpaid fees | §1.9 |
| DEC-26 | Production and backup hosting in Morocco | §1.5 |
| DEC-27, Q-09 | Ambition: 20/15,000 within one year, 300/200,000 within three years | §4 |
| DEC-28 | Single plan at MAD 5 per active pupil per month | §4 |
| DEC-29, Q-11, C-11 | Higher education and vocational training out of scope | §3.2 |
| DEC-30, H-08 | Electronic signature: advanced stamp in V1, qualified in V2 | §1.5, §3.3, §5.2 |
| DEC-31, Q-14 | Fatourati in V1, stored card in V2, no holding of funds | §1.6, §3.2, §3.3, §7 (OQ-04) |
| DEC-32 | Exit file accessible outside ZSchool from V1 onward | §3.3 |
| DEC-35, Q-13 | Profile of the four pilot schools | §4 |
| DEC-36, H-20 | Push/WhatsApp/SMS notification channels, pricing to be reassessed | §1.8, §5.2 |
| RG-24 | Configurable levels and terms, default national model | §1.2, §3.1 |
| §15 | Resolution of open questions | §4, §6 |
| §16.1 (H-01 to H-13) | Status of verified assumptions | §5.1, §7 (OQ-02) |
| §16.2 (H-14 to H-22) | Points to verify against primary texts | §5.2, §7 (OQ-03) |
| §18 | Rule for evolving the baseline and PRD deliverables | §4, §6 |
| ARB-01, ARB-06 (`prd/cross-cutting/42`) | Two-wave MVP scope; DEC-27 horizon escalated | §3.3, §7 (OQ-05, OQ-06) |
| ARB-18 | 6AP exam label | §5.2 (H-16) |
| ARB-26 | Aligning figures and sources with `prd/research/` | §1.1, §1.5, §2.4 |
