# PRD ZSchool — Detailed Journeys 01: Si Abdellah, School Group Director (`DIR`)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09; supersedes 0.2 — revised 09/09/2026) |
| Date | 2026-09-09 |
| Status | PRD draft — under review; arbitrations ARB-01 to ARB-26 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §2.4, §2.8, §2.10, §2.11, §5.2, §6.6, §6.7, §6.9, §6.10, §7.1, §7.2, §7.5, §7.7, §7.8, §7.9, §7.11, §7.12, §8, §9, §10, §11, §12, §14 (decisions DEC-01 to DEC-36), §16 (hypotheses H-…); baseline corrections logged in `prd/research/00-baseline-corrections.md` |
| Related files | `prd/00-conventions.md`, `prd/research/00-baseline-corrections.md`, `prd/research/01-market-competition.md`, `prd/research/02-regulatory-data.md`, `prd/research/03-payments-communications.md`, `prd/research/04-pedagogy-massar-calendar.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/journeys/02-secretary-cashier.md`, `prd/journeys/03-head-supervisor.md`, `prd/journeys/04-part-time-teacher.md`, `prd/journeys/05-multi-school-parent.md`, `prd/journeys/06-custodial-mother-and-guardian.md`, `prd/journeys/07-students-minor-and-adult.md`, `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/12-academic-structure-timetables.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/15-documents-certificates.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/18-transfers-mobility.md`, `prd/modules/20-dashboards-reporting.md`, `prd/modules/21-massar-regulatory-exports.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/33-business-model-packaging.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/38-kpi-success-metrics.md` |

---

## 1. Purpose and reading conventions

This file describes the detailed journeys of persona `DIR` (Si Abdellah, general director of a private school group of 1,800 students across three sites, from preschool to high school, with a national track and an International Baccalaureate track, `PROJECT.md` §5.2). It answers point 2 of baseline chapter 18 for this persona and details the steps announced by the map `prd/journeys/00-journey-map.md` (umbrella journeys `PC-01` to `PC-11`), which is authoritative for the titles.

- **Steps**: each journey is broken into numbered steps `PJ-DIR-NN`, each carrying four fields: **starting condition**, **actor**, **action**, **expected outcome**; the **Version** column refers to the `PROJECT.md` §12 scope (MVP / V1 / V2+).
- **Cross-references**: the umbrella journeys `PC-NN` are carried by `prd/journeys/00-journey-map.md`; needs `BES-DIR-NN` by `prd/02-actors-personas.md`; invariants `INV-NN` by `prd/03-domain-data-model.md`; functional requirements `FR-<MOD>-NN` remain carried by the module files `prd/modules/10-administration-onboarding-subscription.md` to `prd/modules/23-health-sensitive-data.md`, never here. Integrations are cited by domain (e.g. `INT-FAT`) without a number, their carrying file being `prd/cross-cutting/35-external-integrations.md`.
- **Screens**: named in text, without an `ECR-…` identifier (that namespace is reserved for module chapters, conventions §2). Each name comes with a brief description of zones, states, and behavior, in the spirit of mobile-first and bilingual FR/AR (DEC-10).
- **External figures**: sourced only from the baseline or from the files `prd/research/00-baseline-corrections.md` to `prd/research/05-infrastructure-usage.md`, with a source reference.
- **Frustrations / target experience**: each journey contrasts the current situation (Excel files, paper registers, double entry, inconsistent local software, §2.1 and §2.11) with the target ZSchool experience.

---

## 2. Persona snapshot and needs map

| Attribute | Content |
|---|---|
| Profile | General director of a private school group in Casablanca: 1,800 students across three sites, preschool to high school, national track and International Baccalaureate track (§5.2). |
| Operating context | Multi-site legal entity, separate authorizations per site, one head per site, consolidated accounting (§2.11). Currently managed with Excel files, paper registers, and inconsistent local software (§2.1, §2.11). |
| Devices and network | Computer at the office, mobile between sites; sometimes unstable connections (§2.10; `prd/02-actors-personas.md` §2.1). |
| Baseline role | Carries the "Group administrator" profile (consolidated views, managing the group's schools, subscription) and, per site, "Director/administrator" of the tenant (§8.1). |
| Pilot positioning | A profile close to DEC-35's "multi-site group of over 2,000 students" pilot, going live mid-year from 01/02/2027 (JAL-04); the organization is set up from MVP in **read-only consolidated view** (creation, linking tenants, consolidated dashboard), with shared administration and organization-level SaaS billing arriving in V1 (ARB-01; §11, DEC-13, DEC-28). |

`BES-DIR` needs map (carried by `prd/02-actors-personas.md` §3.1) and the journeys covering them in this file:

| Need | Title | Covering journey |
|---|---|---|
| BES-DIR-01 | Multi-site consolidated dashboard | PJ-DIR-03 |
| BES-DIR-02 | Steering collections and graduated reminders | PJ-DIR-04 |
| BES-DIR-03 | Massar-compliant files, end of double entry | PJ-DIR-05 |
| BES-DIR-04 | Steering the group without merging data | PJ-DIR-03, PJ-DIR-01, PJ-DIR-07 |
| BES-DIR-05 | Running the start of year: campaign, rollover, assignments | PJ-DIR-02 |
| BES-DIR-06 | Period closings and validated, locked report cards | PJ-DIR-05 |
| BES-DIR-07 | Roles made of fine-grained permissions by module and scope | PJ-DIR-07, PJ-DIR-01 |
| BES-DIR-08 | Compliance check before closing (checks per subject and period) | PJ-DIR-05 |
| BES-DIR-09 | Mobility: inter-site transfers, tracked arrivals and departures | PJ-DIR-06 |

---

## 3. Director's journey map

| ID | Journey | Umbrella journey (`prd/journeys/00-journey-map.md`) | Needs | Modules involved | Dominant version |
|---|---|---|---|---|---|
| PJ-DIR-01 | Group onboarding: organization, schools, structure, import, mid-year resumption | PC-03 | BES-DIR-04, BES-DIR-07 | ADM, PED, FIN, COM | MVP (school, read-only consolidated organization, parent contracts, mid-year resumption); V1 (shared administration, advanced signature, Fatourati) |
| PJ-DIR-02 | Multi-site year rollover: bulk decisions and assignments | PC-02 | BES-DIR-05 | INS, PED, FIN, COM, RAP | MVP (wave 2 — year-end close, JAL-07); V1 (campaign reminders) |
| PJ-DIR-03 | Consolidated cross-site steering: dashboards and comparison | No dedicated PC (supports PC-02, PC-06, PC-07/08) | BES-DIR-01, BES-DIR-04 | RAP, ADM, MAS, COM | MVP (leadership, read-only consolidated); V1 (enriched comparison, threshold alerts, ESISE) |
| PJ-DIR-04 | Multi-site arrears tracking and collections | PC-07, PC-08 | BES-DIR-02 | FIN, COM, DOC, RAP | MVP (core, cheques, account statement); V1 (aged balance, cash sessions, bursaries, Fatourati) |
| PJ-DIR-05 | Period closings and report card publication | PC-06 | BES-DIR-03, BES-DIR-06, BES-DIR-08 | EVA, PED, MAS, DOC, COM, RAP | MVP (grades, report cards, compliance warning); MVP wave 2 (council decisions, Massar exports); V1 (tooled councils, blocking compliance, QR) |
| PJ-DIR-06 | Managing an inter-site transfer, an arrival, and a departure | PC-09 | BES-DIR-09 (supports BES-SEC, BES-PAR) | TRA, ADM, DOC, FIN, MAS | MVP (simple transfer with full statuses, PDF dossier, Massar reference); V1 (secure link, QR, full log) |
| PJ-DIR-07 | Administering roles, access, and the subscription | Extends PC-03 | BES-DIR-07, BES-DIR-04 | ADM, CAR, RAP | MVP (affiliations, role templates, leadership MFA, historization); V1 (audit log, termination cycle, public-sector outside teachers) |
| PJ-DIR-08 | Tooled admission: file, tests, waitlist, decision | PC-01 (variant PC-01b) | BES-DIR-05 | INS, COM, FIN | V1 |

---

## 4. Detailed journeys

### PJ-DIR-01 — School group onboarding: organization, schools, structure, and import

#### Journey profile

| Attribute | Value |
|---|---|
| Business objective | Get the group into production cleanly and quickly: organization created, one tenant per school (RG-21), academic structures instantiated from the national and international models (RG-24), initial data imported from Excel with duplicate control (G-18), staff authorized, fee schedule and payment connection ready; shorten the time to first value (first enrollment, first payment). |
| Actors | Si Abdellah (general director), ZSchool team (provisioning and support, tracked access G-32), site directors, secretariats (reviewing import reports), legal tutors (parent contracts). |
| Umbrella journey | PC-03 (School onboarding, `prd/journeys/00-journey-map.md`). |
| Trigger and seasonality | Adoption decision; two windows: April to August before the start of the year, or mid-year with resumption of data from a semester already in progress (pilots: from 01/02/2027, JAL-04, ARB-02); one-off per school, repeated for each new site in the group. |
| Modules involved | `prd/modules/10-administration-onboarding-subscription.md` (tenant, wizard, imports, users, subscription), `prd/modules/12-academic-structure-timetables.md` (models, year, periods, grading scales), `prd/modules/16-finance-billing-collections.md` (fee schedule, contracts), `prd/modules/17-communication-notifications.md` (invitations), `prd/cross-cutting/35-external-integrations.md` (`INT-FAT`). |
| Current frustrations | Three sites on disconnected tools: one Excel file per site, document templates redone by hand, no shared structure, raw imports with no duplicate control, impossible to bring historical data over without re-entry (§2.1, §2.11). |
| Target experience | A guided wizard per school: legal information entered once, national structure model (and international for the International Baccalaureate track) instantiated then adapted, controlled Excel import with an error report and matching suggestions, template roles assigned, fee schedule and contracts generated; the group sees onboarding progress site by site. |
| Version | PJ-DIR-01.1 to 01.9 and 01.11: MVP (school onboarding, Excel import with duplicate merging by ZSchool support, structure model, identities and template roles, core finance with sibling discount, read-only consolidated organization, Law 59.21 parent contracts by electronic acceptance, mid-year resumption — ARB-01, ARB-02); advanced-level signature (DEC-30), shared group administration, and Fatourati connection (DEC-31): V1 (PJ-DIR-01.10). |

#### Steps

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-DIR-01.1 | Onboarding request logged; free trial available with demo data (§11) | ZSchool (provisioning), Si Abdellah | Creation of the leadership account (mobile phone as the primary identifier, DEC-11), MFA enabled (§9); creation of the group's pilot school | Tenant created, setup wizard screen offered, trial subscription active | MVP |
| PJ-DIR-01.2 | Tenant created | Si Abdellah (assisted by ZSchool) | Entry of the school's legal information (RG-22: name in AR/FR, authorization number, AREF and provincial education office, authorized cycles, ICE, IF, RC, business license, CNSS, address, logo, seal, signatories, bank details), choice of FR/AR languages and channels (DEC-10, DEC-12) | Complete, verified legal record; school identifiable on bilingual documents | MVP |
| PJ-DIR-01.3 | Legal record saved | Si Abdellah, site academic directors | Instantiating the structure from the supplied models (RG-24: national per cycle; international for the International Baccalaureate track), choosing the school year, periods (semesters, or trimesters for a track that requires them), grading scales and calculation rules, coefficients by level and track (RG-26); year calendar pre-loaded from published ministry dates, religious holidays "to be confirmed" updated during the year, Saturday morning available as a configuration option (`prd/research/04`; permanent UTC+0 time zone, see OQ-01) | Ready, consistent academic structure per track; year and periods configured | MVP |
| PJ-DIR-01.4 | Structure ready; historical Excel files available | Si Abdellah, secretariats | Bulk import from Excel (students, parents, teachers, classes, historical grades; G-18); reading the error report, correcting rejected rows, handling strong-match suggestions (Massar code) and probable-duplicate alerts (RG-05, INV-01, INV-02); guardian matching by an identical mobile number (suggestion only, never creation) and intra-file de-duplication of sibling guardians (ARB-09); duplicate merges confirmed by ZSchool support, an audited operation (RG-06, INV-03, MVP — ARB-01); exit state: enrollments set to ACTIVE via a tracked "import activation" (ARB-02), with a legal guardian and a financially responsible guardian required in the file | Initial data integrated with no silent duplicates; import report archived; active enrollments | MVP |
| PJ-DIR-01.5 | Data imported | Si Abdellah | Inviting internal users by phone number (DEC-11), assigning editable template roles (site director, secretariat, accounting, student life, teacher, homeroom teacher; §8.1, RG-37, INV-32), activation after mutual acceptance (RG-18, INV-15), MFA for school-level roles (§9) | Staff for all three sites operational, each within their least-privilege scope (RG-39) | MVP |
| PJ-DIR-01.6 | Users in place | Si Abdellah, group accountant | Entering the initial fee schedule by year, level, track, and option, ancillary fees, automatic sibling discount (§7.7; FR-FIN-04, MVP — ARB-01), a pro-ration rule (a part-month owed in full by default, ARB-20c); preparing standard payment schedules | Fee schedule ready for billing | MVP |
| PJ-DIR-01.7 | Fee schedule saved | Si Abdellah | End-to-end check on a real case: first front-desk enrollment by a secretary (certificate, receipt issued immediately), first tracked payment | First value delivered; trial convertible to an active subscription | MVP |
| PJ-DIR-01.8 | Pilot school validated | Si Abdellah, ZSchool | Creating the group organization and linking schools (FR-ADM-04, MVP in read-only consolidated view — ARB-01); replicating onboarding across the other two sites; group dashboard visible in read-only (FR-RAP-09); shared administration and an organization-level billable subscription in V1 (§11, DEC-13) | Group set up: consolidated views without merging data (RG-21, DEC-02) | MVP (read-only consolidated); V1 (shared administration, group billing) |
| PJ-DIR-01.9 | Fee schedules finalized | Si Abdellah | Generating annual written parent contracts (Law 59.21: Official Gazette No. 7485 of 23/02/2026, mandatory contract, copy to parents, archiving; art. 49: publication of the fee list; `prd/research/02`) signed by the legal tutor and countersigned by the financially responsible parent if different (ARB-20h): tracked electronic acceptance in MVP (FR-FIN-02, ARB-01), advanced-level signature in V1 (DEC-30); archived in the student's file | Contracts accepted and archived, enforceable, available for AREF inspection | MVP (electronic acceptance); V1 (advanced signature) |
| PJ-DIR-01.10 | Subscription active | Si Abdellah | Decision to connect online payment: the school subscribes to the Fatourati creditor contract (Aggregator offering launched 17/02/2026; ZSchool is not involved in the funds or the regulatory framework; `prd/research/03`), configuring the `INT-FAT` integration (reference generation, daily reconciliation) | Online payment rail ready for the start of the year (V1, DEC-31) | V1 |
| PJ-DIR-01.11 | School joining ZSchool mid-year (pilots, February 2027) | Si Abdellah, secretariats, ZSchool | Resuming the semester already in progress (ARB-02): importing payment schedules with amounts already paid per student and per installment (date, method), cheques in hand (number, bank, due date, amount), current-semester grades linked to the current enrollment (a "published" or "draft" status per column), and aggregated absences; activation via import (a logged "data resumption" reason); acceptance of the internal rules and Law 09.08 notices deferred to account claiming, with a follow-up reminder; a cross-check of balances by site before going live | Accurate payment schedules from day one; no double entry for the semester already completed; balances checked | MVP |

#### Screens involved (names, no `ECR` identifier)

- **School setup wizard**: A queue of numbered steps (legal, structure, import, users, finance), progress status, resumes where it left off; bilingual FR/AR.
- **School legal record**: Form organized in blocks (identity, authorization, tax, bank details, seal and logo), completeness check against the RG-22 fields, states "incomplete/complete".
- **Academic structure wizard**: Gallery of models (national per cycle, international), editable Section–Cycle–Level–Track–Class tree, period and grading-scale settings, preview of the pre-loaded calendar.
- **Bulk import and error report**: File selection, column mapping, counters (rows imported, rejected, probable duplicates), filterable anomaly list with row-by-row correction, downloadable import log.
- **User and role management**: List of affiliations by site, phone-based invitations, template roles with permission detail, states "invited/active/suspended/terminated".
- **Fee schedule**: Table by level and track, ancillary fees, sibling discount, fee-schedule version history.
- **Group dashboard**: Cards per school (onboarding status, headcount, subscription), access to consolidated views (V1).
- **Parent contracts**: Bulk generation, signature queue, statuses (generated, signed, archived), viewing an archived contract.
- **Subscription and usage**: Status (trial, active, overdue), active students for the month, remaining consumables, SaaS invoice history.

#### Rules and decisions cited

(→ RG-05, RG-06, RG-18, RG-21, RG-22, RG-24, RG-26, RG-37, RG-39; DEC-02, DEC-10, DEC-11, DEC-12, DEC-13, DEC-28, DEC-30, DEC-31, DEC-35; G-06, G-18, G-32; INV-01, INV-02, INV-03, INV-15, INV-32; §2.8, §6.6, §6.7, §7.1, §7.7, §11, §12; `prd/research/00-baseline-corrections.md` #1, #2, #7, #17; `prd/research/02`, `prd/research/03`, `prd/research/04`)

#### Acceptance criteria (critical flows)

```gherkin
Feature: School group onboarding
  Scenario: Instantiating the structure from the national model (MVP)
    Given a school whose legal record is complete
    When the general director selects the national structure model for the qualifying cycle and applies it
    Then the cycles, levels, tracks, and subjects of the model are instantiated for the chosen year
    And coefficients and languages of instruction are carried by level and track, never globally
    And the structure stays editable as long as no enrollment is linked to it
```

```gherkin
Feature: School group onboarding
  Scenario: Excel import with duplicate detection (MVP)
    Given an Excel file of 1,800 students, some rows already existing on the platform
    When the secretary starts the bulk import
    Then an error report lists the rejected rows with their reason
    And matches by Massar code are suggested as a strong match without being imposed
    And probable duplicates (first name, last name, date of birth, a guardian's phone number) are flagged without automatic linking
    And no profile merge happens without an audited ZSchool support operation
    And guardians carrying an already-known mobile number are offered for linking, never recreated
```

```gherkin
Feature: School group onboarding
  Scenario: Bringing a second group site into production (MVP)
    Given an organization grouping one active school
    When the general director creates the second school and links it to the organization
    Then the second school is an isolated tenant with its own data
    And the group dashboard shows both schools in read-only without merging their data
    And each school keeps its own count of active students (organization-level billing: V1)
```

```gherkin
Feature: School group onboarding
  Scenario: Mid-year resumption with partially settled payment schedules (MVP)
    Given a group site joining ZSchool on 01/02/2027 with five monthly payments already collected per student
    When the secretariat imports the payment schedules with the amounts paid, the cheques in hand, and the first-semester grades
    Then each enrollment is activated via import activation with the logged reason "data resumption"
    And each student's payment schedule shows the five paid installments and the five still due with no undue reminder
    And the imported cheques appear in the wallet with their due date
    And acceptance of the internal rules is requested from each guardian when they claim their account
```

---

### PJ-DIR-02 — Multi-site year rollover: bulk decisions and assignments

#### Journey profile

| Attribute | Value |
|---|---|
| Business objective | Produce year N+1 across the three sites without re-entry: a secure spring re-enrollment campaign, year-end decisions entered in bulk (RG-09), N+1 enrollments created (promoted, repeating), departures handled (transfers, withdrawals), class assignment, and N+1 payment schedules ready before the start of year. |
| Actors | Si Abdellah (steering and validation), site directors, class councils upstream (decisions and remarks entered in MVP wave 2, tooled preparation in V1), secretariats (campaign, assignment), parents (confirmation and deposit), group accountant (N+1 fee schedules and payment schedules). |
| Umbrella journey | PC-02 (Bulk re-enrollment and year N-to-N+1 rollover, `prd/journeys/00-journey-map.md`). |
| Trigger and seasonality | Seasonal: re-enrollment campaign in spring (re-enrollment fees often paid in spring with a deposit, §2.8), decisions and rollover in June before students leave, adjustments through September. |
| Modules involved | `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/12-academic-structure-timetables.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/20-dashboards-reporting.md`. |
| Current frustrations | Promotion decisions written notebook by notebook then copied into Excel; manual class reassignment drawn on paper; students leaving with no trace; N+1 fee schedules and payment schedules redone by hand in three disconnected files; level mistakes at the start of the year (§2.11). |
| Target experience | A rollover console per school, consolidated at group level: N+1 structure cloned in one action, decisions entered in bulk from a single screen, N+1 enrollments created in batch with automatic uniqueness checks, assisted assignment (target headcounts, options, language groups), payment schedules generated from the N+1 fee schedule; the director sees progress site by site and any gaps. |
| Version | **MVP (wave 2 — year-end close, JAL-07)**: pre-filled forms and a deposit, structure cloning (FR-PED-07, INV-42), bulk decisions and closing to COMPLETED (FR-INS-21), creation of N+1 enrollments as PRE-ENROLLED, class assignment (FR-INS-23/24), N+1 payment schedules and contracts (ARB-01, ARB-03); V1: automated campaign reminders and tooled council preparation (FR-EVA-12). |

#### Steps

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-DIR-02.1 | Year N in progress, third term; promotion decisions being prepared | Si Abdellah, site directors | Opening the re-enrollment campaign per school: pre-filled forms sent to guardians, a deposit expected (§7.2); tracking response and conversion rates per site; automated reminders in V1 | Campaign launched, per-site tracking dashboards available | MVP (wave 2); V1 (automated reminders) |
| PJ-DIR-02.2 | Campaign in progress | Si Abdellah, academic directors | Cloning the N+1 structure from year N per school (levels, subjects, coefficients, grading scales, without students; RG-25, INV-42, FR-PED-07); adjusting N+1 grading scales and coefficients; loading the ministry's N+1 calendar as soon as published, religious holidays "to be confirmed" (`prd/research/04`) | N+1 school year ready in each tenant, with no students | MVP (wave 2) |
| PJ-DIR-02.3 | Annual report cards and results available (see PJ-DIR-05) | Class councils, site directors, Si Abdellah | Bulk entry of year-end decisions per class and level (promoted to the next level, repeating, graduated, streamed, undetermined; RG-09) from the rollover console; for certifying levels, an "undetermined" decision updated when the ministry's results are imported in July, before the end of the INV-25 grace period (ARB-17i); validated by the site director, then a consolidated view for the general director | Every ACTIVE or SUSPENDED enrollment of year N carries its decision (`YearDecision` entity); anomalies flagged (students without a decision) | MVP (wave 2) |
| PJ-DIR-02.4 | Decisions validated | System (batch processing), secretariats | Closing to COMPLETED **every** ACTIVE or SUSPENDED enrollment present at year end, each with its decision (RG-09, ARB-03c); bulk creation of N+1 enrollments **as PRE-ENROLLED only** (ARB-03f): promoted students to the next level, repeating students to the same level, **streamed students to their chosen track** (streaming is not a departure, ARB-03d); graduates get no N+1 enrollment; any student who already has an N+1 enrollment in a non-terminal state (from the PJ-DIR-02.1 campaign) is skipped with no duplicate; automatic uniqueness check (RG-08, DEC-21, INV-05); no enrollment that has been ACTIVE is ever deleted (RG-10, INV-06) | N+1 enrollments created in batch as PRE-ENROLLED; students without a confirmed re-enrollment isolated in a "departures at the next start of year" list | MVP (wave 2) |
| PJ-DIR-02.5 | N+1 enrollments created; departures identified | Secretariats, site directors | Handling departures: a student who leaves the school **at the next start of year** stays COMPLETED with their decision and simply has no N+1 enrollment (never moved to TRANSFERRED or WITHDRAWN, which are reserved for mid-year departures, ARB-03c); a ZSchool transfer with an effective date of "start of year" is recorded as a `TransferRequest` (see PJ-DIR-06); the financial relationship survives until settled (RG-12, INV-08) | Year-end departures tracked with no loss of the year-end decision; balances kept | MVP (wave 2) |
| PJ-DIR-02.6 | N+1 enrollments without a class | Site directors, Si Abdellah | Assisted class assignment (FR-INS-23): target headcounts per class (capacity checked, an override on leadership approval, ARB-24b), balancing, accounting for options and language groups, siblings; unassignment and replay possible until publication; homeroom teachers designated (§7.3) | N+1 class lists published per site; later mid-year changes tracked in the class history with no new enrollment (RG-11, INV-07) | MVP (wave 2) |
| PJ-DIR-02.7 | Assignments published | Group accountant, Si Abdellah | Activating the N+1 fee schedule (any increase can only apply to year N+1: no fee change during the year on an active enrollment, Law 59.21, §7.7, INV-40); generating N+1 payment schedules, N+1 parent contracts, and the sibling discount; the N+1 PRE-ENROLLED-to-ACTIVE move follows the ordinary conditions (complete file, initial payment, guardians, acceptances) | N+1 payment schedules and contracts ready; no invoice issued on the N+1 fee schedule for year N | MVP (wave 2) |
| PJ-DIR-02.8 | Start of year approaching | Si Abdellah | Reviewing the N+1 headcount table by site, cycle, level, and class; headcount alerts (under- or over-capacity); decisions to open or close classes; communicating the start of year to families (per-school announcement, DEC-12) | N+1 headcounts controlled and arbitrated at group level; families informed | MVP (wave 2) |

#### Screens involved (names, no `ECR` identifier)

- **Re-enrollment campaign — tracking**: Funnel per site (sent, confirmed, deposits received, reminders in progress), detail by class, manual reminder available; bilingual.
- **N-to-N+1 rollover console**: Step queue (cloning, decisions, creation, assignments, finance), per-site progress counters, an explicit block if a prior step is incomplete.
- **Bulk entry of year-end decisions**: Grid by class with a default value (promoted), cell-by-cell or batch editing, list of students without a decision, change log.
- **N+1 structure cloning**: Selecting the source year, checkboxes per structure element, a cloning report, warnings on detected differences.
- **Class assignment**: View by level with unassigned students, headcount and option constraints, a preview before publication, publication history.
- **N+1 contracts and payment schedules**: Preview of the generated contract, signature queue, payment-schedule table by class, fee-schedule checks.
- **N+1 headcounts by site**: Cross-table site × level × class with headcount alerts, trend charts, export.

#### Rules and decisions cited

(→ RG-08, RG-09, RG-10, RG-11, RG-12, RG-25, RG-26; DEC-06, DEC-12, DEC-21; G-07; INV-05, INV-06, INV-07, INV-08, INV-40, INV-42; §2.8, §2.11, §6.7, §7.2, §7.3, §7.7, §12; Law 59.21 via `prd/research/00-baseline-corrections.md` #2; `prd/research/04`)

#### Acceptance criteria (critical flows)

```gherkin
Feature: Multi-site year rollover
  Scenario: Year-end decisions entered in bulk (MVP wave 2)
    Given a Grade 8 class at Site A whose annual results are closed
    When the site director enters "promoted" for 31 students and "repeating" for 2 students
    Then every active or suspended enrollment for year N carries a year-end decision
    And the general director's consolidated view reflects the decisions across all three sites
    And no student without a decision is offered for N+1 enrollment creation
```

```gherkin
Feature: Multi-site year rollover
  Scenario: Bulk creation of N+1 enrollments with guaranteed uniqueness (MVP wave 2)
    Given year-end decisions validated across the three sites
    And a Grade 9 student already pre-enrolled in the common track by the re-enrollment campaign
    When the batch process creates the N+1 enrollments
    Then every promoted student receives a PRE-ENROLLED enrollment at the next level in their school
    And every repeating student receives a PRE-ENROLLED enrollment at the same level
    And the streamed student receives a PRE-ENROLLED enrollment in their school's chosen track
    And the student already pre-enrolled by the campaign receives no second enrollment
    And no (student, school year) pair carries more than one ACTIVE or SUSPENDED enrollment
    And every year-N enrollment is closed to COMPLETED with its decision and never deleted

  Scenario: Departure at the next start of year with no loss of decision (MVP wave 2)
    Given a student promoted to Grade 4 whose family announces a move to another school at the next start of year
    When the rollover runs
    Then their year-N enrollment is COMPLETED with the decision "promoted"
    And no N+1 enrollment is created for them at the school
    And their year-N enrollment is neither TRANSFERRED nor WITHDRAWN
    And the default transfer profile carries their year-end decision
```

```gherkin
Feature: Multi-site year rollover
  Scenario: Structure cloning without copying students (MVP wave 2)
    Given the complete academic structure of year N for a school
    When the site director clones the structure to year N+1
    Then the levels, subjects, coefficients, and grading scales are copied
    And no enrollment and no student is copied
    And coefficients stay carried by level and track
```

---

### PJ-DIR-03 — Consolidated cross-site steering: dashboards and comparison

#### Journey profile

| Attribute | Value |
|---|---|
| Business objective | Give the general director a fresh, single, comparable view of the three sites: headcounts, attendance, results, arrears, occupancy, with drill-down to named detail within his scope; support decisions (headcounts, classes, financial trade-offs) and prepare regulatory statistics. |
| Actors | Si Abdellah (primary user), site directors (their site dashboards), group accountant (financial indicators), ZSchool (stable indicator definitions). |
| Umbrella journey | No dedicated PC (supports PC-02, PC-06, PC-07/08): this journey uses data produced by PC-02 (headcounts), PC-06 (results), and PC-07/PC-08 (collections); it materializes §7.11 (leadership: cross-site comparison). |
| Trigger and seasonality | Daily (at 8 a.m., before the round of sites, see `prd/02-actors-personas.md` §2.1), weekly for the comparison, monthly for collections, annual for regulatory statistics (May census). |
| Modules involved | `prd/modules/20-dashboards-reporting.md`, `prd/modules/10-administration-onboarding-subscription.md` (organization), `prd/modules/21-massar-regulatory-exports.md` (regulatory statistics), `prd/modules/17-communication-notifications.md` (alerts). |
| Current frustrations | No overview without manual Excel consolidation every week; figures not comparable because each site keeps its own file with its own definitions; headcount decisions made several days late; ministry statistics rebuilt by hand (§2.1, §2.11, §5.2). |
| Target experience | In the morning, a single page shows the three sites' indicators with the same definitions; one click drills from group to site, site to class, class to the named list; the cross-site comparison places indicators side by side; thresholds (an attendance drop, arrears drifting) trigger alerts; ESISE data is prepared with no re-entry. |
| Version | Leadership dashboards and the read-only consolidated group dashboard (organization MVP, ARB-01): MVP; enriched cross-site comparison, threshold alerts, consolidated aged balance: V1 (§12; §7.11); ESISE regulatory statistics: V1 (§12). Single definition of the attendance rate: ARB-24a (FR-RAP-01). |

#### Steps

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-DIR-03.1 | School day in progress; roll calls validated progressively | Si Abdellah | Morning review of the group's consolidated dashboard (read-only, FR-RAP-09): today's headcount, absentees by site, attendance rate computed on declared sessions (ARB-24a), student-life alerts, the previous day's payments | A single up-to-date view; every figure carries a freshness timestamp | MVP |
| PJ-DIR-03.2 | Consolidated indicator reviewed | Si Abdellah | Drilling down from group to site, from site to cycle, level, and class, down to a named list within his rights scope (RG-21: consolidation without merging; data stays in its tenant) | Named detail accessible without leaving the dashboard, with sensitive-view historization (MVP) then an audit log (V1, RG-38, D4) | MVP (read-only); V1 (log of views) |
| PJ-DIR-03.3 | End of week | Si Abdellah, site directors | Reviewing the cross-site comparison: headcounts, attendance rate, results by subject and period, arrears and collection rate, room occupancy, teacher activity (§7.11), shown side by side with the same indicator definitions | Cross-site gaps made objective; comparison exported for the leadership meeting | V1 |
| PJ-DIR-03.4 | Start of month | Si Abdellah, group accountant | Reviewing the consolidated collections section: outstanding amounts by site, monthly trend, top debtor accounts, collection rate (processing detail in PJ-DIR-04) | The group's financial position readable in a few minutes | V1 (consolidated aged balance) |
| PJ-DIR-03.5 | Threshold crossed (attendance drop at a level, arrears drift at a site) | System | Triggering an alert to the general director and the relevant site director per the configured thresholds (channels DEC-12) | Alert logged, viewable, linked to its source indicator | V1 |
| PJ-DIR-03.6 | May census | Si Abdellah, secretariats | Preparing ESISE regulatory data from the consolidated data: private-school census, HR reference file, year-end results (H-10; three ESISE applications, `prd/research/04`); exporting the prepared tables, transmission through the official channel outside ZSchool | Group data ready for the ministry's e-filing, with no re-entry from Excel | V1 |
| PJ-DIR-03.7 | Need to share (management board, owner) | Si Abdellah | Excel/PDF export of any view (§10: interoperability); printing tables | Reports shareable outside the platform | MVP (exports); V1 (exportable consolidated views) |

#### Screens involved (names, no `ECR` identifier)

- **Consolidated group dashboard**: Period-selector header, indicator cards side by side per site, alert zones; mobile-friendly for viewing between sites (§2.10, §10); bilingual FR/AR.
- **Site dashboard**: Per-school version with the same indicator definitions as the group view, filters by cycle and level.
- **Cross-site comparison**: Cross-table of sites × indicators, mini trend charts, indicator selection, flagging significant gaps.
- **Consolidated aged balance**: Arrears age brackets by site and consolidated, drilling into accounts (see PJ-DIR-04).
- **ESISE preparation**: Checklist of required tables, completeness status per school, preview before export, transmission log.
- **Thresholds and alerts**: Threshold settings per indicator and per site, history of alerts raised.

#### Rules and decisions cited

(→ RG-21, RG-38; DEC-02, DEC-12; G-04, G-08 (statistics component), G-21; INV-17, INV-33; §7.11, §7.12, §10, §11; H-10 via `prd/research/00-baseline-corrections.md`; `prd/research/04`)

#### Acceptance criteria (critical flows)

```gherkin
Feature: Consolidated cross-site steering
  Scenario: Consolidated morning review (MVP)
    Given three active schools linked to the group's organization
    And morning roll calls already validated at two sites
    When the general director opens the group's consolidated dashboard
    Then each site's headcount, attendance rate, and outstanding arrears are shown on a single view
    And every indicator carries the timestamp of its last update
    And no data is visible outside the director's rights scope
```

```gherkin
Feature: Consolidated cross-site steering
  Scenario: Drilling down from a consolidated indicator to the detail (MVP)
    Given an 86% attendance rate shown for Site B
    When the general director drills from group to site, then to level, then to class
    Then each drill-down level shows the same indicator recalculated for the selected scope
    And the final named list is accessible within the role's scope
    And the consolidation has merged no data across tenants
```

```gherkin
Feature: Consolidated cross-site steering
  Scenario: Weekly cross-site comparison (V1)
    Given the three sites' indicators for the past week
    When the general director opens the cross-site comparison
    Then the indicators are shown side by side with identical definitions across sites
    And gaps above the configured threshold are flagged
    And an Excel and PDF export of the comparison is generated
```

---

### PJ-DIR-04 — Multi-site arrears tracking and collections

#### Journey profile

| Attribute | Value |
|---|---|
| Business objective | Maximize the group's collections (cash flow): arrears visible by site and consolidated, automatic graduated reminders, Fatourati online payment to ease settlement, cheques tracked through to deposit, discounts and bursaries approved at the right level — never blocking official documents for unpaid fees (DEC-24). |
| Actors | Si Abdellah (steering, approvals), group accountant, secretary-cashiers (payments, local reminders, `prd/journeys/02-secretary-cashier.md`), financially responsible parents (payment, possibly different from the legal guardians, RG-13). |
| Umbrella journey | PC-07 (Collecting a monthly payment and chasing arrears) and PC-08 (Online payment via Fatourati), `prd/journeys/00-journey-map.md`. |
| Trigger and seasonality | Monthly over ten months (September to June, §2.4), peaking at the start of each month and the start of the year; cheques handed over at the start of the year with due dates (§2.8); daily review of payments, weekly review of reminders. |
| Modules involved | `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/15-documents-certificates.md` (arrears alerts), `prd/modules/20-dashboards-reporting.md`, `prd/cross-cutting/35-external-integrations.md` (`INT-FAT`). |
| Current frustrations | Manual phone-by-phone reminders with no trace; cheque logs kept by hand; heavy payment delays and bounced cheques (§2.8; about 972,000 bounced cheques per year in Morocco, `prd/research/03`); withholding documents for unpaid fees: a common practice but a source of disputes and now legally risky (2020 summary-proceedings rulings with daily penalties; Law 59.21: fines up to 10,000 DH for refusing to issue documents, `prd/research/02`); no group-level view of arrears without manual Excel consolidation (§2.11). |
| Target experience | The director opens the day's financial dashboard: the previous day's payments from every source, arrears by site, reminders already sent automatically; the aged balance sorts accounts by age; parents pay via Fatourati from their bank, an ATM, a wallet, or a cash agent (32 banks and payment institutions, over 25,000 points, `prd/research/03`) and reconciliation is daily; every reminder, every discount approval is tracked. |
| Version | Core finance (payment schedules, payments, numbered receipts, arrears, in-app and SMS reminders), **cheque lifecycle** (FR-FIN-12), sibling discount, account statement, payment voiding via a reversal entry: MVP (§12, ARB-01, ARB-20); aged balance, cash sessions, compliant invoices, negotiated discounts and bursaries, postal mail: V1 (§12); Fatourati from V1 (DEC-31, which overrides the "later version" wording in §7.7 and §12); card with a stored card and direct debits: V2, outside this journey (DEC-31). |

#### Steps

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-DIR-04.1 | Day started | Si Abdellah, group accountant | Reviewing the day's financial section: the previous day's payments from every source (cash, cheques, transfers, online), cash-session discrepancies by site | Cash position for the day known, discrepancies flagged | MVP (payments); V1 (cash sessions) |
| PJ-DIR-04.2 | Monthly installments due | Si Abdellah | Reviewing the aged balance by site and consolidated: age brackets, top debtor accounts by financially responsible parent, by class and level (§7.7) | Priority accounts objectively identified | V1 |
| PJ-DIR-04.3 | Automated reminders scheduled | System | Triggering graduated reminders on unpaid installments per the school's configured tiers: in-app and SMS notification in MVP, in the financially responsible parent's language and within the allowed sending windows (ARB-21c/e); WhatsApp, push, and mail in V1 (DEC-12, DEC-36, ARB-21b); bilingual templates (DEC-10); a parent who replied "STOP" no longer receives reminders but keeps attendance and security notifications (ARB-21d); each send tracks channel, status, and the cost charged to the school (§7.8) | Reminders sent with no manual action; reminder log viewable (event `ReminderSent`, `prd/03-domain-data-model.md` §7) | MVP (in-app, SMS); V1 (WhatsApp, push, mail) |
| PJ-DIR-04.4 | Critical accounts after automated reminders | Si Abdellah, site secretariat | Targeted reminder: a call or message from the account record, tracked content (RG-38); a dated payment promise logged | Human contact documented; a committing due date logged | MVP |
| PJ-DIR-04.5 | Discount or bursary request filed | Group accountant, Si Abdellah | Processing the request through the approval workflow: reason, amount, the account's payment history; approval, a reasoned refusal, or a counter-offer (§7.7) | Approval decision tracked with author and date; payment schedule recalculated | V1 |
| PJ-DIR-04.6 | Fatourati rail connected (V1, DEC-31) | System, parents | Tracking Fatourati receivables: references generated per enrollment, payments received from banking channels, cash agents, and wallets, daily reconciliation with duplicate rejection (`prd/research/03`); a `PaymentReceived` event on every payment (`prd/03-domain-data-model.md` §7) | Online payments automatically reconciled; receipts issued; front-desk workload reduced | V1 |
| PJ-DIR-04.7 | Cheques in hand | Group accountant, secretariats | Tracking the cheque lifecycle: handed over, deposited, cleared, bounced, resolved (§7.7; `prd/research/03`; FR-FIN-12, MVP — ARB-01); a specific reminder on a bounce; escalation to legal action decided at group level | Cheques tracked through to deposit; bounces handled with no manual log | MVP |
| PJ-DIR-04.8 | Debtor account requesting a document | Secretariat, Si Abdellah | Compliance check: generating the enrollment certificate or leaving certificate is never blocked for unpaid fees (DEC-24, INV-39); arrears shown as an alert on the record and summarized in an account statement given to the **financially responsible parent only** (FR-FIN-24, MVP — ARB-20e); requests and issuances historized in MVP, a written register and audit log in V1 (`prd/research/00-baseline-corrections.md` #16, D4) | Documents issued per the ministry's position; financial dispute separated from document issuance | MVP (non-blocking, statement); V1 (audit log) |
| PJ-DIR-04.9 | Closing an enrollment with a balance | Si Abdellah, group accountant | Tracking settlement: the financial account of a closed enrollment stays active until the balance is zero, the parent keeps access to their history (RG-12, INV-08); payment-conditional services limited to non-mandatory services, available from V2 (transport, canteen, activities, §7.7, §12) | Post-departure receivables tracked through to settlement or a legal decision (litigation handled outside the platform) | MVP (account survival); V2 (conditioning ancillary services) |

#### Screens involved (names, no `ECR` identifier)

- **Day's financial dashboard**: Payments by source and by site, cash discrepancies, SMS/WhatsApp credit alerts; mobile view for review between sites.
- **Aged balance (site and consolidated)**: Configurable age brackets, sorting by amount and age, filters by class and level, direct access to the account record.
- **Financial account record**: Enrollment payment schedule, payments and receipts, reminders sent with channel and status, payment commitments, a persistent arrears alert, tracked history.
- **Reminder-tier settings**: Tiers (days after due date), channels per tier, editable bilingual templates, message preview, activation per school.
- **Discount and bursary approval**: Request queue by site, account and history detail, a reasoned decision, approval log.
- **Fatourati tracking**: References generated, the day's payments, reconciliation anomalies, rail usage rate by site.
- **Cheque tracking**: Wallet by status (handed over, deposited, cleared, bounced, resolved), upcoming due dates, deposit and resolution actions.
- **Account arrears alert**: A non-blocking alert banner on the student record and at document issuance, an account statement generated in one action.

#### Rules and decisions cited

(→ RG-12, RG-13, RG-38; DEC-10, DEC-12, DEC-13, DEC-24, DEC-28, DEC-31, DEC-36; G-15, G-16; INV-08, INV-39, INV-40; §2.8, §2.4, §7.7, §7.8, §12; H-09, H-11; `prd/research/00-baseline-corrections.md` #7, #16; `prd/research/02`, `prd/research/03`)

#### Acceptance criteria (critical flows)

```gherkin
Feature: Multi-site collections
  Scenario: Automatic graduated reminder on an unpaid installment (MVP)
    Given a payment-schedule installment unpaid for 7 days with a reminder tier set at D+7 by SMS
    When the tier date is reached
    Then a bilingual reminder is sent to the financially responsible parent on the configured channel
    And the reminder is logged with channel, status, and cost
    And the site's aged balance and the group's consolidated view show the account as reminded
```

```gherkin
Feature: Multi-site collections
  Scenario: Issuing a certificate despite arrears (MVP)
    Given a student record showing arrears displayed as an alert
    When the secretary generates the enrollment certificate requested by the parent
    Then the document is generated with no blocking
    And the arrears alert is visible on the record and the account statement is offered to the financially responsible parent
    And the request and the issuance are historized
```

```gherkin
Feature: Multi-site collections
  Scenario: Daily reconciliation of Fatourati payments (V1)
    Given receivables generated on the Fatourati rail for several enrollments across the three sites
    When parents pay through their banking channels and a daily reconciliation runs
    Then each payment is reconciled against its receivable with no duplicate
    And a receipt is issued and the account balance is updated
    And ZSchool has held no funds
```

---

### PJ-DIR-05 — Period closings and report card publication

#### Journey profile

| Attribute | Value |
|---|---|
| Business objective | Produce, across the three sites, reliable and immutable bilingual report cards at every period close: compliance with the national continuous-assessment framework checked before closing (at least two assessments per subject per semester), tooled class councils, bulk publication to families with QR verification, then Massar grade exports with no double entry. |
| Actors | Si Abdellah (closing, publication, oversight), site academic directors (council preparation), teachers (entry, `prd/journeys/04-part-time-teacher.md`), head supervisors (conduct, `prd/journeys/03-head-supervisor.md`), parents and students (viewing, `prd/journeys/05-multi-school-parent.md` to `prd/journeys/07-students-minor-and-adult.md`). |
| Umbrella journey | PC-06 (Grade entry, class council, report card publication, `prd/journeys/00-journey-map.md`). |
| Trigger and seasonality | Two annual closings on a semester calendar (December–January and June); generation and publication peaks; continuous entry in steady state; import of certifying exam results in June (§7.5, §7.12); the trimester track would shift and triple the peak (DEC-35). |
| Modules involved | `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/12-academic-structure-timetables.md` (periods, grading scales), `prd/modules/21-massar-regulatory-exports.md`, `prd/modules/15-documents-certificates.md` (QR), `prd/modules/17-communication-notifications.md`, `prd/modules/20-dashboards-reporting.md`. |
| Current frustrations | Report cards assembled by hand in a word processor, copy-pasted from Excel, late delivery to families; continuous-assessment compliance checked by eye; grades re-entered in Massar from the same files (`prd/research/04`: fragile re-import of Massar Excel files); corrections lost, no proof of who validated what (§2.6, §2.11, H-04). |
| Target experience | A week before closing, the compliance table shows, by class and subject, missing assessments and late entries; closing locks the grades; councils prepare remarks and decisions; generation produces signed, immutable bilingual report cards; publication notifies each family; a third party verifies a printed report card by QR code; Massar exports are derived from the same grades, validated before submission. |
| Version | Entry, averages (ARB-17 rules), published immutable bilingual report cards, progressive grade publication, and dashboards: MVP (§12); council decision and remark entry with a simplified minutes (FR-EVA-13), the annual transcript (FR-EVA-18), and Massar exports (FR-MAS-02..05): MVP wave 2 (ARB-01); tooled council preparation (FR-EVA-12), verification QR (DEC-30, ARB-19), blocking compliance check, regulatory statistics, cumulative transcript: V1 (§12). Compliance check: a warning only in MVP; a blocking check at closing in V1 (arbitration D3, carried by FR-EVA-06). |

#### Steps

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-DIR-05.1 | Week before period closing; entry in progress | Si Abdellah, academic directors | Reviewing the pre-closing compliance table: number of assessments per subject and period compared against the framework minimum (at least two assessments per subject per semester, §7.12), missing entries per teacher, pre-closing alerts (BES-DIR-08); a non-blocking warning in MVP; blocked closing unless a reasoned exception in V1 (D3, FR-EVA-06) | Compliance gaps visible per site; reminders sent to late teachers | MVP (warning); V1 (blocking) |
| PJ-DIR-05.2 | Late entries flagged | Academic directors, teachers | Reminding teachers via a targeted announcement or message (channels DEC-12); tracking pending entries by class and subject through to completion (teachers enter on web and mobile, §7.5) | Entry completion rate raised to the required level before closing | MVP |
| PJ-DIR-05.3 | Completeness reached; councils held or pending | Site director | Closing the period per school: locking the period's grades (§7.5); event `PeriodClosed` (`prd/03-domain-data-model.md` §7) | Entries locked; no more direct edits to the period's grades | MVP |
| PJ-DIR-05.4 | Period closed; results computed | Class councils, academic directors | Holding councils: entering general remarks, end-of-period and end-of-year decisions, a simplified minutes (FR-EVA-13, MVP wave 2 — ARB-01); tooled preparation (per-student file, situations) in V1 (FR-EVA-12) (§7.5) | Councils documented; remarks integrated into the period results (`PeriodResult`) | MVP (wave 2: decisions, remarks, simplified minutes); V1 (tooled preparation) |
| PJ-DIR-05.5 | Results validated | System, Si Abdellah | Bulk generation of bilingual report cards (FR/AR, DEC-10) with the school's seal and signature; MVP calculation rules applied (an unexcused absence counts as 0 by default, scales rebased to 20, ungraded subjects excluded and marked "NG", rank within the current class, rank exclusion via a flag — ARB-17); every published report card is fixed (version, fingerprint, signatory, date), any correction creates a new version marked "superseded", with no exception or grace period (RG-33, DEC-09, INV-26, ARB-17g); verification QR added in V1 (DEC-30, ARB-19) | Report cards generated and immutable; performance held: generation under 3 s per report card, publication for a 2,000-student school under 10 minutes (§10) | MVP (immutable report cards); V1 (QR) |
| PJ-DIR-05.6 | Report cards generated | Si Abdellah | Bulk publication to families per school; publication notification (`ReportCardPublished` event; in MVP, in-app and SMS in each recipient's language, general push and WhatsApp in V1, DEC-12/DEC-36, ARB-21); the school can also publish grades progressively before the report card (FR-EVA-19, MVP, ARB-17f); publication log | Families notified; report cards viewable on the parent and student portals (permanent read access, RG-28); adult student in control of her own access (RG-02, DEC-20, MVP — ARB-10) | MVP |
| PJ-DIR-05.7 | Correction needed after publication | Site director, Si Abdellah | Correcting via a new version: the old version stays viewable marked "superseded", the new one carries its own fingerprint and QR code (RG-33, INV-26) | Error corrected without destroying the history; full version traceability | MVP (versioning); V1 (QR on new versions) |
| PJ-DIR-05.8 | A printed report card in circulation | Third-party verifier (employer, another school, an administration) | Verifying the QR code through the public verification service: the document's authenticity and version confirmed | A printed document authenticable without contacting the school | V1 |
| PJ-DIR-05.9 | Period closed; final grades | Si Abdellah, secretariats | Generating Massar exports of the lists and continuous-assessment grades by subject, class, and semester, in the format of the Massar module's import files (H-04: no API, file channel only; FR-MAS-02..05, MVP wave 2 — ARB-01); for the trimester track, a period-to-Massar-semester correspondence table configured by the school, with semester averages recalculated from dated grades (ARB-17h); a validation check before submission, since file re-import is fragile (`prd/research/04`); submission by the administration then entry into Massar outside ZSchool | Double entry eliminated: grades entered once feed report cards and exports; an export log produced | MVP (wave 2) |
| PJ-DIR-05.10 | Year end; certifying exam results published (July) | Secretariats, Si Abdellah | Entering or importing the ministry's results (certifying exams 6AP, 3AC, baccalaureate) into student records (§7.5, §7.12; manual entry FR-EVA-10 MVP, import with a report FR-EVA-11 V1); checking the weightings configured per level (baccalaureate 25/25/50; 3AC 30/30/40; 6AP 50% continuous assessment, 25% school exam, 25% provincial exam, `prd/research/04`, wording ARB-18); updating "undetermined" decisions entered at the June rollover (ARB-17i); annual report cards and annual transcripts produced | Certifying results integrated; complete records for rollover decisions (PJ-DIR-02) and post-baccalaureate applications (annual transcripts MVP wave 2, cumulative transcripts V1, §7.5) | MVP (entry, annual transcript in wave 2); V1 (import with report, cumulative transcript) |

#### Screens involved (names, no `ECR` identifier)

- **Pre-closing compliance table**: A classes × subjects matrix with an assessment counter, a minimum threshold, status (compliant, insufficient), a list of missing entries per teacher.
- **Period closing**: A per-school closing checklist, a summary of any blocking checks, the director's confirmation, closing history.
- **Class council console**: Per-student file (averages, absences, conduct, remarks), decision entry, minutes generated.
- **Report card generation and publication console**: School × period selection, generation counters, real-time progress, a publish button, a publication log with timestamps.
- **QR verification**: A public verification page (scan or enter the reference), the authenticity result, the current version, and a "superseded" note where applicable.
- **Massar exports**: Subject × class × semester selection, a preview of the generated file, a validation report (columns, formats, missing values), an export log.
- **Publication and version log**: Per-student history of report card versions with fingerprint, signatory, and correction reason.

#### Rules and decisions cited

(→ RG-02, RG-26, RG-28, RG-29, RG-33; DEC-09, DEC-10, DEC-12, DEC-20, DEC-35, DEC-36; G-12, G-19; INV-21, INV-26, INV-41; §2.6, §7.5, §7.12, §10, §12; H-04, H-16; `prd/research/00-baseline-corrections.md` #3, #4; `prd/research/04`)

#### Acceptance criteria (critical flows)

```gherkin
Feature: Period closings and report cards
  Scenario: Compliance warning before closing (MVP)
    Given a class where one subject counts only one assessment for the semester
    When the site director reviews the pre-closing compliance table
    Then the subject is flagged as non-compliant with the framework (minimum of two assessments per subject per semester)
    And an alert is sent to the teacher concerned
    And closing remains possible, with the warning historized alongside the closing

  Scenario: Blocking compliance check at closing (V1)
    Given a class where one subject remains non-compliant with the framework at the closing date
    When the site director starts closing the period
    Then closing is blocked as long as the subject remains non-compliant
    And only a logged, reasoned exception from leadership allows closing
```

```gherkin
Feature: Period closings and report cards
  Scenario: Locking grades at closing (MVP)
    Given a period closed by the site director
    When a teacher tries to edit a grade from that period
    Then the edit is refused
    And the closing event is logged with author and timestamp
    And any corrections go through the report card's new-version procedure
```

```gherkin
Feature: Period closings and report cards
  Scenario: Bulk publication and immutability (MVP)
    Given the generated and validated report cards for a school the size of the group
    When the general director publishes the period's report cards
    Then every published report card is fixed with a version, fingerprint, signatory, and date
    And families receive an in-app and SMS publication notification in their language
    And any later correction creates a new version while the old one stays viewable marked "superseded"

  Scenario: QR verification of a printed report card (V1)
    Given a report card published in V1 carrying a verification QR code
    When a third party scans the code
    Then the public page confirms the document's authenticity and current version
```

---

### PJ-DIR-06 — Managing an inter-site transfer and a student's departure

#### Journey profile

| Attribute | Value |
|---|---|
| Business objective | Handle mobility cleanly: an internal transfer between two group sites on the same global identity, with consent and a shared scope chosen by the legal tutor; a departure to a school outside ZSchool with a secure exit dossier; non-blocking balances, certificates issued, complete legal records. |
| Actors | Any legal guardian, the custodian, or the adult student (initiation), legal tutor or adult student (signature and consent; required signer, RG-14b, ARB-22), Si Abdellah and site directors (origin validation, acceptance or reasoned refusal of an arrival, RG-16 conflict arbitration), secretariats (issuing, closing), parents (information). |
| Umbrella journey | PC-09 (Inter-school transfer within ZSchool and exit dossier outside ZSchool, `prd/journeys/00-journey-map.md`). |
| Trigger and seasonality | One-off throughout the year, heavily concentrated in June–September (relocations, moves, streaming decisions, §2.11). |
| Modules involved | `prd/modules/18-transfers-mobility.md`, `prd/modules/10-administration-onboarding-subscription.md` (identities), `prd/modules/15-documents-certificates.md`, `prd/modules/16-finance-billing-collections.md` (balance, statement), `prd/modules/21-massar-regulatory-exports.md` (transfer log). |
| Current frustrations | Departures discovered late or with no trace; records copied by hand for the receiving site; leaving certificates withheld for unpaid fees, a practice that causes disputes and is now legally risky (2020 summary-proceedings rulings, including one in Tangier with a 500 DH per-day penalty; Law 59.21: fines up to 10,000 DH, `prd/research/02`); no trace of consents between sites of the same group (§2.11). |
| Target experience | A transfer request handled in one sitting: identity kept (no new record), a shared scope chosen and logged, origin validation with a non-blocking balance check, a leaving certificate generated, the receiving enrollment created at the destination site, the payment schedule at the receiving site and the prior balance tracked at the origin site; for a departure outside ZSchool, a bilingual PDF exit dossier accessible via a time-limited secure link with a QR code. |
| Version | A simple transfer between two ZSchool schools with full statuses (initiated, validated by the origin, accepted by the destination, activated, refused, cancelled, expired — ARB-22), the PDF exit dossier, the Massar transfer reference (FR-INS-19), and arrival from a school outside ZSchool (declared prior history): MVP (§12); the time-limited secure link with QR (DEC-32), the full audit log, and bulk transfers when a school closes: V1 (§12; the Massar ministerial procedure stays outside ZSchool, §7.9). |

#### Steps

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-DIR-06.1 | A family wanting to move a student from one group site to another (e.g. preschool to primary, or a move) | Legal guardian, custodian, or adult student (initiation), secretariat | Filing the transfer request: from the parent portal or at the front desk; naming the receiving school (in the group or outside it, via the minimal directory); identifying the student by their existing global identity (RG-04; no new identity will be created, INV-43); the request waits for the legal tutor's (or adult student's) signature before validation (ARB-22) | Request "initiated" with the requester, origin, and destination; the tutor's signature required | MVP |
| PJ-DIR-06.2 | Request signed | Legal tutor (or adult student) | Choosing the shared scope: default transfer profile (identity, Massar code, schools attended, years, levels and year-end decisions, official documents; detailed grades, absences, and discipline require explicit sharing; health never automatic, RG-31, INV-23; intra-group transfer: same default profile, ARB-22); consent logged with its author, bounded and revocable (INV-24; events `ConsentGranted`/`ConsentRevoked`) | Scope consented to and tracked; no data crosses outside this scope (RG-30) | MVP (default); V1 (fine-grained consent management) |
| PJ-DIR-06.3 | Scope consented to | Origin site director | Origin validation: balance check (an alert and account statement to the financially responsible parent, never blocking, DEC-24, INV-39), returning school equipment, a leaving certificate generated and signed (§7.9); the origin can only refuse for a missing tutor signature, never for a financial reason (ARB-22); in case of a conflict between parents, arbitration by the school respecting the recorded qualities (RG-14, RG-16, INV-10) | Status "validated by the origin", reasoned and dated; leaving certificate prepared | MVP |
| PJ-DIR-06.4 | Origin validation recorded | Receiving site director, system, secretariats | Acceptance by the destination (or a reasoned refusal: capacity, unauthorized cycle, incomplete file; status "refused", the origin stays ACTIVE); at the effective date, **activation** in one transaction: closing the origin enrollment to TRANSFERRED with a reason and date and activating the receiving enrollment on the same identity (RG-10, INV-05, INV-43); with no activation within 30 days of validation, the request **expires**, the origin stays ACTIVE, and both parties are notified; the tutor may cancel before activation; a departure with an effective date of "next start of year" closes the year as COMPLETED (ARB-03c, ARB-22); event `TransferValidated` (`prd/03-domain-data-model.md` §7) | Transfer materialized: origin closed and destination active simultaneously, a single identity kept; no student left without an active enrollment | MVP |
| PJ-DIR-06.5 | Receiving enrollment created | Receiving site secretariat | Onboarding at the destination: class assignment (historized where applicable, RG-11), the receiving site's payment schedule and fee schedule; the prior balance stays tracked by the origin site's financial account until settled (RG-12, INV-08); documents shared per the consented scope made available to the destination | Student operational at the receiving site; both sites' accounting kept separate and accurate | MVP |
| PJ-DIR-06.6 | Transfer validated | Secretariat | Recording the Massar transfer reference (field and attachment, FR-INS-19, MVP; the ministerial procedure carried out outside ZSchool through the parent's Massar portal and provincial validation, `prd/research/04`); feeding the transfer log with Massar references (§7.12, V1) | Official procedure tracked by its reference; log viewable | MVP (reference); V1 (log) |
| PJ-DIR-06.7 | Departure to a school outside ZSchool | Secretariat, Si Abdellah | Generating the bilingual PDF exit dossier (report cards, annual transcript, year-end decision, official documents within scope — MVP wave 2 for the transcript and decision, ARB-01); made available via a time-limited secure link with a verification QR code (DEC-32, V1); the account statement delivered separately to the financially responsible parent only, never included in the dossier given to another guardian (ARB-20e) | Complete, secure exit dossier; clean closing | MVP (PDF); V1 (secure link, QR) |
| PJ-DIR-06.8 | Transfers and departures handled | Si Abdellah | Reviewing the group's consolidated arrivals-and-departures log: origins, destinations, reasons, Massar references; per-site retention indicators in reporting | Group mobility visible and steered; informed retention decisions | V1 |
| PJ-DIR-06.9 | Student arriving from a school outside ZSchool (the majority case at launch) | Receiving site secretariat, legal tutor | Entering the declared prior history (ARB-22; detail in PJ-SEC-10): previous school, years, levels, year-end decisions, documents (a paper leaving certificate, transcripts); items marked "unverified" until an attachment is provided; no disciplinary or health data brought over | Student history usable for ESISE and the school passport, with no duplicate identity | MVP |

#### Screens involved (names, no `ECR` identifier)

- **Transfer requests**: A queue by status (initiated, awaiting the tutor's signature, validated by the origin, accepted by the destination, activated, refused, cancelled, expired), filters by site and period, access to the request detail, an expiry countdown.
- **Transfer validation wizard**: Summary of the student and the requested scope, a balance check with a non-blocking alert, an equipment-return checklist, generating the leaving certificate, a reasoned confirmation.
- **Shared-scope selection**: The parent-side view (portal) listing the default profile's data categories, explicit-extension checkboxes, a summary before consent, a consent trail.
- **Leaving certificate**: Bilingual preview, numbering, seal and signature, QR code, issuance history.
- **Exit dossier**: Dossier composition (documents included), bilingual PDF generation, creating the secure link with a duration, a log of link access.
- **Group transfer log**: Timeline of transfers and departures with Massar references, filters by site, export.

#### Rules and decisions cited

(→ RG-02, RG-04, RG-10, RG-11, RG-12, RG-14, RG-14b, RG-16, RG-21, RG-30, RG-31, RG-32; DEC-07, DEC-08, DEC-20, DEC-24, DEC-32; G-08; INV-05, INV-08, INV-10, INV-23, INV-24, INV-25, INV-39, INV-43; §6.9, §7.7, §7.9, §7.12, §12; `prd/research/00-baseline-corrections.md` #2, #16; `prd/research/02`, `prd/research/04`)

#### Acceptance criteria (critical flows)

```gherkin
Feature: Inter-site transfer
  Scenario: Internal transfer preserving the identity (MVP)
    Given a student enrolled and active at group Site A
    When the legal tutor requests a transfer to Site B, Site A validates it, and Site B accepts and activates it
    Then Site A's enrollment moves to TRANSFERRED with a reason and date in the same transaction as the Site B activation
    And Site B's enrollment links to the same global identity
    And no new student identity is created

  Scenario: A validated transfer never activated (MVP)
    Given a transfer request validated by Site A on March 10
    When Site B has neither accepted nor activated the receiving enrollment by April 9
    Then the request moves to "expired"
    And Site A's enrollment stays ACTIVE with no interruption
    And the legal tutor and both sites are notified

  Scenario: Refusal by the receiving school (MVP)
    Given a transfer request validated by the origin
    When the receiving site refuses for lack of capacity
    Then the request carries the status "refused" with the reason
    And the origin's enrollment stays ACTIVE
    And the origin can never refuse a transfer for a financial reason
```

```gherkin
Feature: Inter-site transfer
  Scenario: Shared scope consented to and logged (MVP)
    Given a transfer request accepted between two group schools
    When the legal tutor chooses the default transfer profile with no extension
    Then the receiving site gets only: identity, Massar code, schools attended, years, levels and year-end decisions, official documents
    And detailed grades, absences, and disciplinary data are not transmitted without explicit sharing
    And health data is never transferred automatically
    And the consent is logged with scope and timestamp
```

```gherkin
Feature: Inter-site transfer
  Scenario: Validation with no financial blocking (MVP)
    Given a student record showing a debit balance at the time of the transfer request
    When the origin site director validates the transfer
    Then validation is not blocked by the balance
    And the arrears alert is visible on the record and the account statement is given to the financially responsible parent
    And the origin site's financial account stays active until settled
```

---

### PJ-DIR-07 — Administering the group's roles, access, and subscription

#### Journey profile

| Field | Value |
|---|---|
| Business objective | Ensure that every staff member across the three sites has the right role, the right scope, and traceable access, and that the group's subscription (active students, consumables, lifecycle) is under control: strengthened authentication, affiliations kept current, immediate access removal on departure, communication costs visible. |
| Actors | Si Abdellah (group administrator and tenant director, §8.1), site directors, group accountant (consumables), affected staff (accepting affiliations), ZSchool (tracked support G-32, SaaS billing). |
| Umbrella journey | Extends PC-03 (onboarding sets up roles and the subscription; this journey covers their ongoing administration). |
| Trigger and seasonality | Continuous: staff arrivals and departures all year; a rights review at the start of the year; monthly usage tracking (SaaS billing from September to June, DEC-28). |
| Modules involved | `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/19-teacher-career-network.md` (teaching affiliations), `prd/modules/20-dashboards-reporting.md` (usage), `prd/cross-cutting/30-roles-permissions-matrix.md` (the detailed `PER-…` matrix carried by this file). |
| Current frustrations | Accounts and passwords shared across secretariats; "all or nothing" rights in local software; no log of who changed what; staff departing with access left open; opaque SMS bills with no per-site breakdown (§2.1, §2.11). |
| Target experience | Roles assigned per person and per site from editable template roles (fine-grained permissions by module and scope); every write and every sensitive view logged; immediate access removal on closing an affiliation; the group's SaaS usage and invoice readable by site with threshold alerts; ZSchool support reachable only through an audited ticket. |
| Version | Affiliations, template roles and fine-grained permissions, MFA for leadership, administration, and accounting roles (optional for teachers and supervisors, 90-day trusted devices, ARB-25l), support access on a ticket with the director's approval (ARB-25k), historization of writes (D4): MVP (§12); an exportable audit log, formalized compliance, "public-sector outside teacher" status and the AREF cap (FR-CAR-11/12): V1 (§12; INV-33); the full subscription lifecycle including termination (export, 90-day read-only, deletion at 12 months): V1 (INV-38, DEC-23). |

#### Steps

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-DIR-07.1 | A staff member joins (teacher, secretary, supervisor…) | Si Abdellah, site director | Creating the affiliation (`SchoolMembership`): invitation by phone (DEC-11), roles and contract type (permanent, part-time, trainee; qualification declared to the employer for ESISE, ARB-23b), activation after both parties accept (RG-18, INV-15); simultaneous multi-site, multi-role affiliations allowed (RG-17, INV-14); in V1, a "public-sector outside teacher" status with AREF authorization tracking and a binary over-the-8-hour-cap alert if the teacher has consented to share their total hours (FR-CAR-11/12, ARB-23a, `prd/research/00-baseline-corrections.md` #18; non-blocking cap breach, D8) | Staff authorized to the right scope; contract statuses tracked | MVP; V1 (public-sector outside teachers) |
| PJ-DIR-07.2 | Affiliation active; specific permission needs | Si Abdellah | Adjusting roles: editable template roles made of fine-grained permissions by module and scope (class, level, school; RG-37, INV-32); checking least privilege (RG-39) and multiple contexts (a Site A teacher who is a parent at Site B; RG-36, INV-31) | Precise, reviewable permissions, with no shared generic account (RG-12b, INV-13) | MVP |
| PJ-DIR-07.3 | Suspected error, dispute, or audit | Si Abdellah | In MVP, reviewing the record-level historization of writes (author, timestamp, before/after value — D4, ARB-25j); in V1, an immutable audit log of writes and sensitive views with author, context, and timestamp (RG-38, INV-33) and exporting the log for a dispute or audit (§9; 5-year retention, DEC-22) | Traceable proof of actions taken; exportable in V1 | MVP (historization); V1 (audit log) |
| PJ-DIR-07.4 | A staff member's departure or end of contract | Site director, Si Abdellah | Closing the affiliation: immediate access removal (RG-19, INV-16); data produced kept at the school and attributed to its author; event `AffiliationClosed` (`prd/03-domain-data-model.md` §7) | No residual access; data assets intact | MVP |
| PJ-DIR-07.5 | Accounts to secure (onboarding, an incident, hardening) | Si Abdellah | Administering account security: MFA mandatory for leadership, administration, accounting, and system administrator roles, optional for teachers and supervisors, 90-day trusted devices (§9, ARB-25l); front-desk number change with identity verification and leadership approval (ARB-08, FR-ADM-20); the local system administrator can neither create nor reset a leadership-role account (ARB-25m); reviewing sessions and devices; on an incident, ZSchool support only intervenes on a ticket with the director's explicit in-app approval, a bounded duration, and historization (G-32, ARB-25k) | Accounts protected; every support access tracked | MVP |
| PJ-DIR-07.6 | Every month from September to June | Group accountant, Si Abdellah | Tracking the group's subscription: active students counted per school and in total (billing unit, DEC-13; a single plan at 5 MAD per active student per month, i.e. 9,000 MAD per month for 1,800 students, DEC-28, §11); SMS and WhatsApp bundles and storage (consumables) with per-school counters and threshold alerts; monthly SaaS invoices in MAD (see OQ-05 for where group bundles are purchased) | SaaS bill understood and anticipated; no interruption in notification credit | MVP (basic counters); V1 (consolidated per-site tracking) |
| PJ-DIR-07.7 | Deteriorating situation (unpaid SaaS bill, termination decided) | Si Abdellah | Managing the subscription lifecycle: trial, active, overdue (read-only mode after a delay), termination: a full data export given to the school, read-only for 90 days, operational data deleted at 12 months, global identities and access to published documents maintained (DEC-23, INV-38; event `SubscriptionSuspendedOrTerminated`) | Continuity of personal rights guaranteed even on exit; known, tracked deadlines | V1 |

#### Screens involved (names, no `ECR` identifier)

- **Staff affiliations**: List by site with roles, contracts, statuses (invited, active, suspended, terminated), dates, a filter by role; phone-based invitations; change history.
- **Roles and permissions**: Catalog of template roles, permission detail by module and scope, duplicating and editing a role, a per-person summary matrix.
- **Audit log**: Search by author, period, action type, and school; timestamped detail; log export.
- **Subscription and usage**: Subscription status, active students per school and total, SMS/WhatsApp and storage counters with thresholds, monthly SaaS invoices, history.
- **Account invitations**: Queue of pending invitations, a reminder, cancellation; activation log.

#### Rules and decisions cited

(→ RG-12b, RG-17, RG-18, RG-19, RG-36, RG-37, RG-38, RG-39; DEC-05, DEC-11, DEC-13, DEC-17, DEC-22, DEC-23, DEC-28; G-05, G-06, G-24, G-32; INV-13, INV-14, INV-15, INV-16, INV-31, INV-32, INV-33, INV-38; §7.1, §8, §9, §11, §12; `prd/research/00-baseline-corrections.md` #18; `prd/research/02`)

#### Acceptance criteria (critical flows)

```gherkin
Feature: Administering roles and the subscription
  Scenario: Immediate access removal on closing an affiliation (MVP)
    Given a staff member active at Site B with the secretariat role
    When their affiliation is closed for end of contract
    Then their access to Site B's data is removed immediately
    And the data they produced stays at the school, attributed to its author
    And the closing is logged with author and timestamp
```

```gherkin
Feature: Administering roles and the subscription
  Scenario: Contextual permissions across two group sites (MVP)
    Given a person who teaches at Site A and is a parent of a student at Site B
    When they sign in with their single account
    Then they hold teacher rights at Site A and parent rights at Site B
    And no right from one context spills over to the other
    And a context switcher lets them toggle between them
```

```gherkin
Feature: Administering roles and the subscription
  Scenario: Subscription overdue then terminated (V1)
    Given a group subscription overdue beyond the grace period
    When the platform sets the subscription to read-only mode and termination is pronounced
    Then data entry is blocked but viewing stays available read-only for 90 days
    And a full data export for every school in the group is delivered
    And operational data is deleted 12 months after termination
    And global identities and access to published documents are maintained
```

---

### PJ-DIR-08 — Tooled admission: application file, tests, waitlist, decision (V1)

#### Journey profile

| Attribute | Value |
|---|---|
| Business objective | Tool up the PC-01b variant of admission for a selective group: application file submitted online or at the front desk, documents checked, admission tests scheduled, a waitlist by level capacity, a tracked and notified site-leadership decision, opening pre-enrollment. |
| Actors | Site directors (decision), Si Abdellah (admission policy, capacities), secretariats (files, summons), parents and legal tutor (submission, documents), applicants. |
| Umbrella journey | PC-01 (variant PC-01b, `prd/journeys/00-journey-map.md`). |
| Trigger and seasonality | Admission campaign from March to September; bottlenecks in July–August. |
| Modules involved | `prd/modules/11-admissions-enrollment-reenrollment.md` (FR-INS-01 to FR-INS-05), `prd/modules/17-communication-notifications.md` (summons, decisions), `prd/modules/16-finance-billing-collections.md` (application fee, deposit). |
| Current frustrations | Paper files, tests scheduled by phone, waitlists kept on a spreadsheet, untracked decisions, families called back one by one. |
| Target experience | One CANDIDATE file per student, completeness visible, a tracked test summons, a reasoned decision in one action, a waitlist ordered by level capacity (the sum of class capacities, ARB-24b), an automatic move to PRE-ENROLLED once the deposit is paid; cancellation possible to the CANCELLED terminal state (ARB-03b). |
| Version | V1 (§12 V1: admissions; CANDIDATE and CANCELLED states). In MVP, admission follows the PC-01a front-desk variant (PJ-SEC-01) with an implicit leadership decision. |

#### Steps

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| PJ-DIR-08.1 | Admission campaign open | Si Abdellah, site directors | Configuring the admission policy per site: open levels, capacities per level, required documents, any tests, application fees | Policy published on the school's public portal | V1 |
| PJ-DIR-08.2 | Interested family | Parent, secretariat | Submitting the application file online or at the front desk (FR-INS-01): identity matched (RG-05), documents submitted and checked (FR-INS-02), declared prior history (PJ-SEC-10); enrollment created in the CANDIDATE state | CANDIDATE file with visible completeness | V1 |
| PJ-DIR-08.3 | Complete file | Secretariat, site director | Organizing admission tests (FR-INS-03): sessions, tracked summons with read receipts, results entered | Candidates tested, results recorded | V1 |
| PJ-DIR-08.4 | Results available; level capacity reached | System, site director | Ordered waitlist (FR-INS-04); a place automatically freed when a pre-enrollment is cancelled; families notified of their rank | Transparent waitlist | V1 |
| PJ-DIR-08.5 | Decision made | Site director | Recording the admission decision (FR-INS-05): admitted (opening pre-enrollment, deposit expected), rejected (an internal reason, a neutral notification), waitlisted; cancelling an application to the CANCELLED state, keeping the history (ARB-03b) | Decision tracked and notified; move from CANDIDATE to PRE-ENROLLED on payment of the deposit | V1 |

#### Acceptance criteria (critical flows)

```gherkin
Feature: Tooled admission
  Scenario: Admission decision and opening pre-enrollment (V1)
    Given a complete CANDIDATE file whose admission test is passed
    When the site director records the decision "admitted"
    Then the family is notified and a reservation deposit is expected
    And the enrollment moves to PRE-ENROLLED on payment of the deposit
    And the decision is tracked with author and timestamp

  Scenario: Cancelling an application (V1)
    Given a CANDIDATE file whose family withdraws
    When the secretariat cancels the application
    Then the enrollment moves to the terminal state CANCELLED and its history is kept
    And a place is freed for the level's waitlist
```

---

## Open questions

Counter `OQ-NN` local to this file (conventions §2). OQ-01 to OQ-04 log baseline/research discrepancies from `prd/research/00-baseline-corrections.md`; the PRD keeps the up-to-date figure.

| ID | Question | Context |
|---|---|---|
| OQ-01 | Time zone: the baseline (§10) mentions "UTC+1 with a return to UTC+0 during Ramadan." | **Escalated — ESC-03 (baseline update)**. **Obsolete**: Decree No. 2.26.530, permanent return to UTC+0 on 20/09/2026 at 2 a.m., with no seasonal switch; the Ramadan exception disappears (`prd/research/00-baseline-corrections.md` #1; `prd/research/04`). PRD treatment: calendars, schedules, and timestamps modeled in permanent UTC+0 (`Africa/Casablanca`), UTC storage; "shortened Ramadan hours" remains a pedagogical need (PJ-DIR-01.3) but is no longer a time-zone issue. Baseline update to be logged in review. |
| OQ-02 | Suspension date of memos 080.21 and 081.21: the baseline (§2.2) states "November 2022." | **Escalated — ESC-03**. **Wrong date**: suspended by ministerial notice on 29/11/2021 (`prd/research/00-baseline-corrections.md` #3; `prd/research/04`). PRD treatment: the standard weightings (baccalaureate 25/25/50; 3AC 30/30/40; 6AP 50/25/25) are set as defaults (PJ-DIR-05.10) and the 2021-2022 exceptional variant is historized; baseline correction to be logged in review. |
| OQ-03 | Payment-provider references: the baseline (§2.8) cites "YouCan Pay" among the players publishing their rates. | **Escalated — ESC-03**. **YouCan Pay ceased operations in January 2024**; CMI is no longer an acquirer (a switch), with acquiring handled by licensed payment institutions (`prd/research/00-baseline-corrections.md` #7; `prd/research/03`). PRD treatment: YouCan Pay excluded from references; DEC-31 unchanged (Fatourati in V1; NAPS e-Premium or Chari Pay in V2 for card payments). PJ-DIR-04 is worded without depending on a closed provider. |
| OQ-04 | Massar grade-module framing text: the baseline (§16.2, H-16) cites memo 1887/13. | **Open (H-16).** **Not corroborated online**; only non-primary sources (`prd/research/00-baseline-corrections.md` #4; `prd/research/04`). PRD treatment: Massar compliance and export requirements (PJ-DIR-05.1, PJ-DIR-05.9) are worded without depending on the exact memo number; confirmation to be obtained from pilots and the Ministry of Education (link H-16). |
| OQ-05 | Purchase point and scope of consumable bundles (SMS, WhatsApp, storage) in a multi-site group. | **Open** (not covered by ARB-01 to ARB-26; to be settled with `prd/cross-cutting/33`). §7.8 charges SMS/WhatsApp costs "to the school (bundles)," while §11 allows the organization as the paying customer for the subscription. For a group like this persona's, this file's working assumption is: bundles subscribed per tenant with per-school counters and alerts, and a consolidated usage view at the organization level (PJ-DIR-07.6). To be settled in review with `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/17-communication-notifications.md`, and `prd/cross-cutting/33-business-model-packaging.md`. |

---

## Traceability

Baseline ID → coverage in this file table (steps `PJ-DIR-NN.m`, journey sections, and OQs).

| Baseline ID | Coverage in this file |
|---|---|
| §2.4 (ten months, seasonality) | PJ-DIR-04 (trigger), PJ-DIR-07.6 |
| §2.8 (fees, methods, Fatourati) | PJ-DIR-04 (all steps), PJ-DIR-01.10 |
| §2.10 (mobile, instability) | PJ-DIR-03.1 (screens), PJ-DIR-04 (screens) |
| §2.11 (multi-site, start-of-year peaks) | §2 (profile), PJ-DIR-02, PJ-DIR-06 (trigger) |
| §5.2 (persona Si Abdellah) | §1, §2 |
| §6.6 (organization, school, site, tenant) | PJ-DIR-01 (all steps), PJ-DIR-03.2 |
| §6.7 (academic structure) | PJ-DIR-01.3, PJ-DIR-02.2 |
| §6.9 (ownership, consent, portability) | PJ-DIR-06.2, PJ-DIR-06.7 |
| §6.10 (entities) | Entities cited: `Organization`, `Enrollment`, `YearDecision`, `ReportCard`, `FeeSchedule`, `Installment`, `Payment`, `Dunning`, `SchoolMembership`, `TransferRequest`, `ConsentGrant`, `Subscription`, `UsageMetric`, `AuditLog` (via `prd/03-domain-data-model.md` §2) |
| §7.1 (administration, onboarding, subscription) | PJ-DIR-01, PJ-DIR-07 |
| §7.2 (admissions, re-enrollments, rollover) | PJ-DIR-02 |
| §7.5 (assessments, grades, report cards) | PJ-DIR-05 |
| §7.7 (finance, collections, DEC-24) | PJ-DIR-04, PJ-DIR-06.3 |
| §7.8 (communication, channels, bundles) | PJ-DIR-04.3, PJ-DIR-05.6, OQ-05 |
| §7.9 (transfers and mobility) | PJ-DIR-06 |
| §7.11 (dashboards, comparison, ESISE) | PJ-DIR-03 |
| §7.12 (Massar, compliance, transfer log) | PJ-DIR-05.1, PJ-DIR-05.9, PJ-DIR-06.6 |
| §8 (roles and permissions) | PJ-DIR-07 |
| §9 (security, MFA, audit, tracked support) | PJ-DIR-07.3, PJ-DIR-07.5 |
| §10 (NFR: performance, notification under 5 min per VSC, interoperability) | PJ-DIR-05.5 (generation and publication), PJ-DIR-03.7 |
| §11 (SaaS business model) | PJ-DIR-01.1, PJ-DIR-07.6 |
| §12 (scope by version) | Version column of every step table; journey profiles |
| RG-04, RG-05 | PJ-DIR-01.4 (matching and duplicates) |
| RG-06 | PJ-DIR-01.4 (auditable merge) |
| RG-08, DEC-21 | PJ-DIR-02.4 (active-enrollment uniqueness) |
| RG-09 | PJ-DIR-02.3, PJ-DIR-02.4 |
| RG-10, DEC-06 | PJ-DIR-02.4, PJ-DIR-02.5, PJ-DIR-06.4 |
| RG-11 | PJ-DIR-02.6, PJ-DIR-06.5 |
| RG-12 | PJ-DIR-02.5, PJ-DIR-04.9, PJ-DIR-06.5 |
| RG-12b | PJ-DIR-07.2 |
| RG-13 | PJ-DIR-04 (financially responsible parent), PJ-DIR-06 |
| RG-14, RG-14b, RG-16 | PJ-DIR-06.3 (signer, arbitration) |
| RG-17, RG-18, RG-19 | PJ-DIR-07.1, PJ-DIR-07.4 |
| RG-21, DEC-02 | PJ-DIR-01.8, PJ-DIR-03.2 (consolidation without merging) |
| RG-22 | PJ-DIR-01.2 |
| RG-24, RG-26 | PJ-DIR-01.3, PJ-DIR-02.2 |
| RG-25 | PJ-DIR-02.2 |
| RG-29 | PJ-DIR-05 (non-portable internal data, cited in rules) |
| RG-30, RG-31, DEC-07, DEC-08 | PJ-DIR-06.2, PJ-DIR-06.7 |
| RG-32 | PJ-DIR-06 (read-only closing, cited in rules) |
| RG-33, DEC-09, G-19 | PJ-DIR-05.5, PJ-DIR-05.7, PJ-DIR-05.8 |
| RG-36, RG-37, DEC-17 | PJ-DIR-07.2 |
| RG-38 | PJ-DIR-03.2, PJ-DIR-04.4, PJ-DIR-07.3 |
| RG-39 | PJ-DIR-01.5, PJ-DIR-07.2 |
| DEC-10 | PJ-DIR-01.2, PJ-DIR-04.3, PJ-DIR-05.5, PJ-DIR-06.7 |
| DEC-11 | PJ-DIR-01.1, PJ-DIR-01.5, PJ-DIR-07.1 |
| DEC-12 | PJ-DIR-01.2, PJ-DIR-02.8, PJ-DIR-03.5, PJ-DIR-04.3, PJ-DIR-05.6 |
| DEC-13, DEC-28, G-24 | PJ-DIR-01.8, PJ-DIR-07.6 |
| DEC-20 | PJ-DIR-05.6, PJ-DIR-06.2 |
| DEC-22 | PJ-DIR-07.3 (log retention) |
| DEC-23, G-06 | PJ-DIR-07.7 |
| DEC-24, G-16 | PJ-DIR-04.8, PJ-DIR-06.3 |
| DEC-30 | PJ-DIR-01.9 (advanced contract signature) |
| DEC-31, H-09 | PJ-DIR-01.10, PJ-DIR-04.6, OQ-03 |
| DEC-32 | PJ-DIR-06.7 |
| DEC-35 | PJ-DIR-01 (pilot profile, §2), PJ-DIR-05 (trimester peak) |
| DEC-36, H-11 | PJ-DIR-04.3, PJ-DIR-05.6 |
| G-04 | PJ-DIR-01.8, PJ-DIR-03 |
| G-05 | PJ-DIR-07 |
| G-07 | PJ-DIR-02 |
| G-08 | PJ-DIR-03.6, PJ-DIR-05.9, PJ-DIR-06.6 |
| G-12 | PJ-DIR-05 |
| G-15 | PJ-DIR-04 |
| G-18 | PJ-DIR-01.4 |
| G-20 | PJ-DIR-07.3 |
| G-21 | §10 cited via PJ-DIR-05.5, PJ-DIR-03 (screens) |
| G-22 | Version column of every journey |
| G-32 | PJ-DIR-01 (tracked support access), PJ-DIR-07.5 |
| H-04 | PJ-DIR-05.9 (file channel, no API) |
| H-10 | PJ-DIR-03.6 (ESISE forms to be gathered) |
| H-16 | OQ-04 |
| INV-01, INV-02 | PJ-DIR-01.4 |
| INV-03 | PJ-DIR-01.4 (audited merge) |
| INV-05, INV-06 | PJ-DIR-02.4, PJ-DIR-06.4 |
| INV-07 | PJ-DIR-02.6, PJ-DIR-06.5 |
| INV-08 | PJ-DIR-02.5, PJ-DIR-04.9, PJ-DIR-06.5 |
| INV-10 | PJ-DIR-06.3 |
| INV-13, INV-14, INV-15, INV-16 | PJ-DIR-07.1, PJ-DIR-07.2, PJ-DIR-07.4 |
| INV-17 | PJ-DIR-03.2 (tenant isolation) |
| INV-23, INV-24 | PJ-DIR-06.2 |
| INV-25 | PJ-DIR-06 (read-only closing) |
| INV-26 | PJ-DIR-05.5, PJ-DIR-05.7, PJ-DIR-05.8 |
| INV-31, INV-32 | PJ-DIR-07.2 |
| INV-33 | PJ-DIR-03.2, PJ-DIR-07.3 |
| INV-38 | PJ-DIR-07.7 |
| INV-39 | PJ-DIR-04.8, PJ-DIR-06.3 |
| INV-40 | PJ-DIR-02.7 (fee fixed on an active enrollment) |
| INV-41 | PJ-DIR-01.3, PJ-DIR-02.2 (coefficients by level and track) |
| INV-42 | PJ-DIR-02.2 |
| INV-43 | PJ-DIR-06.1, PJ-DIR-06.4 |
| `prd/research/00-baseline-corrections.md` #1 | OQ-01, PJ-DIR-01.3 |
| `prd/research/00-baseline-corrections.md` #2 | PJ-DIR-01.9, PJ-DIR-02.7, PJ-DIR-04 (frustrations), OQ (Law 59.21 contract) |
| `prd/research/00-baseline-corrections.md` #3 | OQ-02, PJ-DIR-05.10 |
| `prd/research/00-baseline-corrections.md` #4 | OQ-04 |
| `prd/research/00-baseline-corrections.md` #7 | OQ-03 |
| `prd/research/00-baseline-corrections.md` #16 | PJ-DIR-04.8, PJ-DIR-06 (frustrations) |
| `prd/research/00-baseline-corrections.md` #17 | PJ-DIR-01.3, PJ-DIR-02.2 (pre-loaded calendar) |
| `prd/research/00-baseline-corrections.md` #18 | PJ-DIR-07.1 (affiliation statuses, AREF cap) |
| `prd/research/02` | Law 59.21 (contract, art. 49, fines), documents and arrears: PJ-DIR-01.9, PJ-DIR-04 (frustrations), PJ-DIR-06 (frustrations) |
| `prd/research/03` | Fatourati (channel, Aggregator 17/02/2026, reconciliation), cheques: PJ-DIR-01.10, PJ-DIR-04.6, PJ-DIR-04.7 |
| `prd/research/04` | Weightings, Massar, 2026-2027 calendar: PJ-DIR-01.3, PJ-DIR-02.2, PJ-DIR-05.10, PJ-DIR-06.6 |
| ARB-01, ARB-02 (`prd/cross-cutting/42-review-arbitrations.md`) | §2, §3; PJ-DIR-01 (01.4, 01.6, 01.8, 01.9, 01.11), PJ-DIR-02 (all steps), PJ-DIR-04.7, PJ-DIR-05 (05.4, 05.9, 05.10) |
| ARB-03, ARB-22 | PJ-DIR-02.4, PJ-DIR-02.5, PJ-DIR-06 (06.1 to 06.4, 06.9), PJ-DIR-08.5 |
| ARB-08, ARB-09, ARB-25 | PJ-DIR-01.4, PJ-DIR-07.3, PJ-DIR-07.5 |
| ARB-17, ARB-18, ARB-19, ARB-20, ARB-21 | PJ-DIR-04.3, PJ-DIR-04.8, PJ-DIR-05.5, PJ-DIR-05.6, PJ-DIR-05.10, PJ-DIR-06.7 |
| ARB-23, ARB-24 | PJ-DIR-02.6, PJ-DIR-03.1, PJ-DIR-07.1, PJ-DIR-08.4 |
| BES-DIR-09 | PJ-DIR-06 |
