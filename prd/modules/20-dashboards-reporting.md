# ZSchool — Chapter 20: Dashboards and Reporting (RAP)

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review; arbitrations from `prd/cross-cutting/42-review-arbitrations.md` applied (ARB-01, ARB-04, ARB-23, ARB-24, ARB-25) |
| Source | `PROJECT.md` §7.11 (dashboards and reporting), §7.12 (ESISE preparation), §6.10 (entities), §8.1–8.2 (roles, RG-36 to RG-39), §10 (interoperability, performance), §12 (scope by version); `prd/research/00-baseline-corrections.md` (corrections no. 1 and 11); `prd/research/04-pedagogy-massar-calendar.md` §2 (ESISE); `prd/cross-cutting/42-review-arbitrations.md` (ARB-01, ARB-04, ARB-23, ARB-24, ARB-25) |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/21-massar-regulatory-exports.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` |

---

## 1. Purpose and scope

### 1.1 Purpose

The RAP module turns operational data produced by the other modules into readable, actionable indicators, with no re-entry and no manual spreadsheet consolidation. It serves four audiences: leadership (steering a single school, then a multi-site group), student life staff (a view of the day), teachers (a view of their courses), and families (a per-child view, across every school). It also prepares data for the regulatory statistics transmitted through the ministry's ESISE platform.

The founding document sets the expected content (§7.11): "Leadership: headcount by level and class, attendance rate, results by subject, unpaid balances, room occupancy, teacher activity, cross-site comparison (organization). Student life: today's absences, tardiness, ongoing incidents. Teacher: today's classes, pending entries, their classes' averages. Parent: per-child and cross-school view. Regulatory statistics: headcount, staffing, year-end results to be transmitted through the ministry's ESISE platform" (H-10).

### 1.2 In scope

| Item | Version |
|---|---|
| School leadership dashboard (headcount, attendance, results, unpaid balances) | MVP |
| Teacher dashboard (least privilege, RG-39) and student dashboard | MVP |
| Multi-child, multi-school parent dashboard | MVP |
| Period filters (assessment period, month, day) and school year | MVP |
| Excel/CSV/PDF exports of dashboards and reports (§10, interoperability; export logging: V1, OQ-06) | MVP |
| Student life dashboard for the day (absences, tardiness, ongoing incidents); at MVP, the daily attendance summary is carried by ECR-VSC-02 (`prd/modules/13-attendance-student-life-discipline.md`) | V1 (full dashboard) |
| Organization-level consolidated views (RG-21): consolidated read-only indicators per school for the "multi-site group" pilot (DEC-35, BES-DIR-01) | MVP (consolidated read-only); V1 (advanced comparisons, shared administration) — ARB-01 |
| Room occupancy and teacher activity (leadership indicators) | V1 |
| Preparation of ESISE regulatory statistics data (H-10) | V1 |
| Schedulable reports (weekly for leadership) | V1 |

### 1.3 Out of scope

| Item | Reference |
|---|---|
| Producing the Massar exports and the ESISE files themselves (formats, exact columns, submission) | `prd/modules/21-massar-regulatory-exports.md`: RAP prepares and presents the data, MAS produces and submits the files |
| Managing absence alert thresholds and notification rules | `prd/modules/13-attendance-student-life-discipline.md` (§7.4); RAP shows the counters, it does not own the rules |
| Managing unpaid balances, reminders, aged-balance report (processing) | `prd/modules/16-finance-billing-collections.md`; RAP only exposes the consolidated read view |
| Grade entry, period closures, report card publication | `prd/modules/14-assessments-grades-report-cards.md` |
| Rating or evaluating teachers by the school, or vice versa | Forbidden at every version (DEC-25); see FR-RAP-08 for the retained limit |
| Accounting exports, general ledger, cash journal | `prd/modules/16-finance-billing-collections.md` |
| A public API for accessing indicators, webhooks | V2+ (§12); out of scope for this chapter |
| ZSchool's multi-tenant operator oversight (SaaS usage, billing) | Platform level, outside the RAP module |

## 2. Users and use cases

Reference personas: `prd/02-actors-personas.md` (BES-DIR-01, BES-DIR-04, BES-SUR-07, BES-ENS-08, BES-PAR-04). Effective rights result from fine-grained permissions per module and per scope (`prd/cross-cutting/30-roles-permissions-matrix.md`, RG-37) under least privilege (RG-39).

| User | Main use cases | Frequency |
|---|---|---|
| Principal / academic leadership | Morning dashboard: actual headcount, attendance rate, unpaid balances; monitoring results by subject during period closures; preparing ESISE statistics in May and June | Daily, peaks at period closure and at the start of the year |
| Group administrator (organization) | Cross-site comparison: headcount, attendance, results, unpaid balances per school; consolidated steering without merging data (RG-21) | Weekly, monthly |
| Head supervisor | View of the day: absences by class after attendance checks, tardiness, ongoing incidents; follow-up on unsubmitted justifications | Daily, morning |
| Teacher / homeroom teacher | Today's classes, pending entries (attendance, grades), their classes' averages; for the homeroom teacher, a class summary (§8.1) | Daily |
| Parent / guardian | Per-child view, switching between children and between schools from a single account; spotting absences to justify and financial deadlines | Daily |
| Student | Tracking their published averages, absences, and documents | Weekly |

No dedicated dashboard is planned in the founding document for the front office; its tracking needs (re-enrollment campaign, cheques with due dates) stay carried by the INS and FIN modules. The "accounting / cashier" role accesses financial indicators per its permissions (RG-37), with no dedicated dashboard.

## 3. Key journeys

The RAP module is a consumer in the critical journeys mapped in `prd/journeys/00-journey-map.md`; it carries no `PJ-…` step of its own.

| Journey | RAP's contribution | Reference |
|---|---|---|
| PC-02 — Re-enrollment and N-to-N+1 rollover | Re-enrollment rate, year-N+1 headcount by level, to steer the campaign | `prd/journeys/00-journey-map.md` § PC-02; leadership detail `prd/journeys/01-school-group-director.md` |
| PC-05 — Morning attendance check and absence notification | Student life dashboard for the day, fed by validated attendance checks (absences, tardiness, pending justifications) | § PC-05; detail `prd/journeys/03-head-supervisor.md` |
| PC-06 — Grades, grading conference, report cards | Results by subject and class, entry progress, averages after closure | § PC-06; detail `prd/journeys/04-part-time-teacher.md` (pending entries) and `prd/journeys/01-school-group-director.md` |
| PC-07 — Collections and unpaid-balance reminders | Unpaid balances by class and by guardian, a simplified aged-balance report, the effect of reminders | § PC-07; detail `prd/journeys/02-secretary-cashier.md` |

## 4. Functional requirements

### FR-RAP-01 — Provide leadership with their school's dashboard

| Attribute | Value |
|---|---|
| Description | Leadership views their school's status for the selected year and period in a single screen: actual headcount by level and class (ACTIVE enrollments, broken down by section and regime), today's and the period's attendance rate — **a single definition (ARB-24a)**: attendance rate = (expected sessions − unjustified absences − justified absences) / expected sessions, computed over declared sessions (FR-PED-20, `prd/modules/12-academic-structure-timetables.md`) or, in V1, over timetable-derived sessions; excused absences are excluded from the denominator and tardiness is counted separately; the school may also show the rate excluding justified absences as a supplement; the same definition is reused by KPI-06 and KPI-07 —, results by subject and class as soon as the period closes (averages, distribution by band, number of honors), unpaid balances (total amount, number of students affected, breakdown by class and by guardian, aging), and daily activity indicators (attendance checks completed). Each indicator is clickable and links to the detailed list in the source module (for example, the list of students with unpaid balances links to the FIN module). The day's counters rely on domain events (a validated attendance check, an unpaid due date) rather than manual recounting. |
| Priority | Must |
| Version | MVP |
| Traceability | §7.11; BES-DIR-01; PC-05, PC-06, PC-07; events `AttendanceRecorded`, `PeriodClosed`, `InstallmentOverdue` (`prd/03-domain-data-model.md` §7); FR-PED-20 (declared sessions); ARB-24a |
| Actors | Leadership, academic leadership |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Leadership dashboard
  Scenario: Opening the dashboard at the start of the day
    Given a principal authenticated in their school's context for the 2026-2027 year
    And 247 ACTIVE enrollments spread over 12 classes, of which 4 students absent today after attendance checks were validated
    And 31 students with at least one overdue installment for a total outstanding of 46,500 MAD
    When the principal opens the school's dashboard
    Then the headcount shown is 247, broken down by level and by class
    And today's attendance rate is computed over expected sessions with a validated attendance check (ARB-24a) and shown with detail of the 4 absent students
    And the outstanding amount shown is 46,500 MAD for 31 students, broken down by class and by guardian
    And each indicator links to its corresponding detailed list without re-entering a filter
```

### FR-RAP-02 — Filter every dashboard by period and by school year

| Attribute | Value |
|---|---|
| Description | Every dashboard and every export offers two systematic filters: school year (current year by default, earlier years available in read-only per retention periods) and period (day, week, month, the school's assessment period — semesters or trimesters depending on configuration, full year). Filters apply to every indicator shown and propagate to exports and to detailed lists reached by drill-down. The context selector (school, for a multi-context account) is always shown (RG-36). Within the same year, changing the period does not trigger a full page reload; today's indicators stay available offline from a recent session as a last computed value, with a freshness timestamp shown. |
| Priority | Must |
| Version | MVP |
| Traceability | §7.11; RG-36; RG-25 (structure cloning, per-year history); Hijri and Gregorian holiday calendars (§10) |
| Actors | All internal roles, parent, student |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Period and school-year filters (MVP)
  Scenario: Changing the period without a reload
    Given a principal on the 2026-2027 dashboard, "semester 1" period
    When they select the period "semester 2"
    Then every indicator shown is recomputed for semester 2 without a full page reload
    And the export launched afterward carries the "semester 2" filter

  Scenario: A school with trimesters
    Given a school whose assessment periods are trimestral (DEC-35)
    When a user opens the period selector
    Then the school's three trimesters are offered, not semesters
```

### FR-RAP-03 — Provide student life staff with today's view (absences, tardiness, ongoing incidents)

| Attribute | Value |
|---|---|
| Description | The head supervisor views a view limited to the current day, restricted to their assigned cycles (RG-39): a list of absences by class and by time slot as soon as attendance checks are validated, with a justification status (unjustified, submitted, accepted, declined) and a family-notification status; a list of the day's tardiness with duration; a list of ongoing incidents with severity and any sanction. Classes whose attendance has not yet been taken are flagged as "attendance pending" to distinguish "confirmed absent" from "attendance not taken". A per-level counter summarizes the situation. The view refreshes as offline attendance checks sync (a class that took attendance in a network dead zone appears as soon as it resyncs). |
| Priority | Must |
| Version | V1 (full dashboard); at MVP, the daily attendance summary (absences by declared session, expected and received checks) is carried by ECR-VSC-02 of `prd/modules/13-attendance-student-life-discipline.md` |
| Traceability | §7.11; BES-SUR-07; BES-SUR-06; RG-39; PC-05; ECR-VSC-02 (MVP); events `AttendanceRecorded`, `JustificationSubmitted`, `IncidentRecorded` (`prd/03-domain-data-model.md` §7) |
| Actors | Head supervisor, leadership |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Today's student-life dashboard
  Scenario: Tracking absences after morning checks
    Given a head supervisor assigned to the middle-school and upper-secondary cycles
    And the 8 a.m. class of 2AC-3 validated with 2 unjustified absences and 1 tardiness
    And class 1AC-1 whose 8 a.m. attendance has not yet been taken
    When the supervisor opens today's student-life dashboard
    Then 2AC-3's 2 absent students appear with status "unjustified" and the family-notification state
    And 2AC-3's tardiness appears in today's tardiness list
    And class 1AC-1 appears with the note "attendance pending", not among the absences
    And no class from the pre-school cycle is visible, that cycle not being assigned to the supervisor
```

### FR-RAP-04 — Provide the teacher with a dashboard limited to their courses

| Attribute | Value |
|---|---|
| Description | The teacher views a dashboard strictly derived from their active assignments (`TeacherAssignment`): their classes and courses for the day — at MVP, **declared sessions** (course, date, declared slot, FR-PED-20, ARB-04); in V1, timetable-derived courses with times and rooms (FR-PED-11) —, their pending entries (today's unvalidated attendance checks, created assessments with no grades entered, with age), and their classes' averages for their subjects, computed after entry and visible according to the school's publication state. They see neither other courses' students, nor class overall averages (except for the homeroom teacher), nor any financial or disciplinary data. The homeroom teacher additionally sees their class's summary: headcount, cumulative period absences, overall average and student distribution after publication (§8.1). With multiple affiliations, the dashboard follows the selected context (RG-36). |
| Priority | Must |
| Version | MVP |
| Traceability | §7.11; §8.1 (homeroom teacher); BES-ENS-08; RG-39, INV-34 (`prd/03-domain-data-model.md` §4); FR-PED-20 (MVP), FR-PED-11 (V1); ARB-04 |
| Actors | Teacher, homeroom teacher |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Teacher dashboard and least privilege
  Scenario: A teacher sees only their courses
    Given a math teacher assigned to the 2AC-3 and 2AC-4 courses
    And a 2AC-3 attendance check not yet validated today and a 2AC-4 "quiz 1" assessment created with no grades
    And a 2AC-4 overall average available after closure
    When the teacher opens her dashboard
    Then she sees only 2AC-3 and 2AC-4 among today's classes
    And her pending entries list the 2AC-3 attendance check and the 2AC-4 "quiz 1" assessment with their age
    And the averages shown are limited to the math subject in her two classes
    And she cannot access 2AC-4's overall average, nor any student's unpaid balances or incidents
```

### FR-RAP-05 — Provide the parent with a per-child, multi-child, multi-school view

| Attribute | Value |
|---|---|
| Description | From their single account, the parent views an overview of every child linked by an active relationship, regardless of school: a card per child (school, level, class, photo) grouped by school, with the moment's key indicators — absences to justify, latest grades or published report card, next financial due date and balance, latest unread announcements — following the rights carried by each relationship (RG-13, RG-14). Selecting a child opens their detailed view; switching between children and schools never requires re-authentication (RG-03, RG-36). For a student who has become an adult and has restricted parental access to school, disciplinary, or health data, the relevant cards and views hide those indicators and note it explicitly, with the financial guardian's access to financial data kept as long as they remain the payer (RG-02). Children whose relationship is suspended or revoked no longer appear. |
| Priority | Must |
| Version | MVP |
| Traceability | §7.11; §8; BES-PAR-04; RG-02, RG-03, RG-12b, RG-13, RG-36; INV-20, INV-35 (`prd/03-domain-data-model.md` §4) |
| Actors | Parent / guardian |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Multi-school parent dashboard
  Scenario: A parent tracks three children in two schools from a single account
    Given a parent responsible for Youssef (2AC, School A), Sara (CE2, School A), and Adam (senior kindergarten, School B)
    And Adam absent this morning with a justification pending
    And one of Adam's monthly installments overdue and unpaid at School B
    When the parent opens their dashboard
    Then the three children appear grouped by school, with no re-authentication or second account
    And Adam's card highlights the absence to justify and the overdue installment
    When the parent switches to Youssef's view
    Then only Youssef's data is shown, in School A's context
  Scenario: An adult student has restricted parental access to school data
    Given a parent whose child Salma, having turned 18, has restricted parental access to school data
    And that parent still being the financial guardian and the payer
    When the parent opens their dashboard
    Then Salma's card hides grades, attendance, and disciplinary data with the note "access restricted by the student"
    And Salma's financial due date and balance stay visible
```

### FR-RAP-06 — Provide the student with a dashboard of their own data

| Attribute | Value |
|---|---|
| Description | A student with an activated personal access (RG-01, their own login identifier even without a personal mobile phone, ARB-07) views a dashboard of their own data: today's sessions (declared sessions at MVP, FR-PED-20; the full timetable in V1, FR-PED-11), latest published grades and published period averages, their own absences and tardiness with justification status, recent documents and announcements. The student never sees other students' data or class-aggregated indicators beyond what the school publishes (for example, a class average made visible through configuration). Access is subject to the activation level set by the school and to restrictions an adult student places on their own data (RG-02). |
| Priority | Must |
| Version | MVP |
| Traceability | §7.11; §12 (student dashboard); RG-01, RG-02; INV-35, INV-36 (`prd/03-domain-data-model.md` §4); FR-PED-20; ARB-04, ARB-07 |
| Actors | Student |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Student dashboard (MVP)
  Scenario: A middle-school student views their data on the family phone
    Given Youssef, 2AC at School A, whose personal access was activated by his father
    And a math grade published and an unjustified absence the day before
    When Youssef opens his dashboard in his own session
    Then he sees today's sessions, the published grade, and the absence with status "justification pending"
    And no other student's data, no financial data, and no unpublished class average are visible

  Scenario: Unpublished grades stay invisible
    Given a grade entered in draft by the teacher for Youssef
    When Youssef opens the "Results" tab
    Then the draft grade does not appear until the school publishes it (RG-29)
```

### FR-RAP-07 — Expose room occupancy

| Attribute | Value |
|---|---|
| Description | Leadership views room occupancy rates per site and per time slot, computed from published timetables (occupied slots against room capacity and openable slots under the applicable schedule variant — normal, Ramadan, exams). The view offers a day-by-time-slot grid, a per-room summary (weekly average rate, free slots), and a flag for over-requested or under-used rooms to inform next year's assignment decisions. Unpublished timetables are excluded from the calculation and flagged as not accounted for. |
| Priority | Should |
| Version | V1 |
| Traceability | §7.11; timetable dependency (§7.3, V1); schedule variants (§10, §6.7 `ScheduleVariant`) |
| Actors | Leadership, academic leadership |

### FR-RAP-08 — Track teacher activity for strictly operational purposes

| Attribute | Value |
|---|---|
| Description | Leadership views operational activity indicators, aggregated by class and by course: rate of attendance checks validated on time, completeness of expected assessment entries per period, compliance with the minimum number of tests per subject and per semester (national-reference compliance check, §7.12), age of pending entries. Boundary: RAP does not execute this check; it exposes in read-only the compliance status produced by FR-EVA-06 (`prd/modules/14-assessments-grades-report-cards.md`, sole owner of the rule: a warning at MVP, blocking check unless waived in V1 — arbitration D3) and relayed by FR-MAS-06 (`prd/modules/21-massar-regulatory-exports.md`), with no second tally. These indicators are factual and operational: they are never a rating, a ranking, or an evaluation of the person — no overall score, no ranked comparison between teachers is produced or shown, in line with the founding document's prohibition (DEC-25). School HR tracking (staff presence, contracts, authorizations) falls under the CAR module and affiliation data (`SchoolMembership`), referenced by a link from these indicators. |
| Priority | Should |
| Version | V1 |
| Traceability | §7.11; §7.12 (compliance check); DEC-25; INV-30 (`prd/03-domain-data-model.md` §4); references FR-EVA-06 (`prd/modules/14-assessments-grades-report-cards.md`), FR-MAS-06 (`prd/modules/21-massar-regulatory-exports.md`) |
| Actors | Leadership, academic leadership |

### FR-RAP-09 — Compare sites at the organization level without merging data

| Attribute | Value |
|---|---|
| Description | The group administrator views a consolidated multi-site view: every leadership-dashboard indicator (headcount, attendance rate, results, unpaid balances, re-enrollment rate) is computed per school and shown in comparison (a cross-table and relative gaps), with a group-total row made of the sum or the headcount-weighted average of per-school values. Consolidation aggregates indicators already computed within each tenant; it never opens data merging (RG-21, DEC-02): a school's student-level detail is visible only to an account also authorized within that tenant (RG-36), the rest of the view staying at the aggregate level. Each row offers a link to the corresponding school's dashboard for authorized accounts. Consolidated financial indicators are visible only if the financial permission exists at the group level per the role matrix (`prd/cross-cutting/30-roles-permissions-matrix.md`). **Versions (ARB-01)**: at MVP, a consolidated read view (creating the organization and attaching tenants via FR-ADM-04, a cross-table of FR-RAP-01's indicators per school with a group total) to serve DEC-35's "multi-site group" pilot and BES-DIR-01; in V1, advanced comparisons (relative gaps, history, a consolidated re-enrollment rate), shared administration, and group billing. |
| Priority | Must |
| Version | MVP (consolidated read view); V1 (advanced comparisons, shared administration) — ARB-01 |
| Traceability | §7.11; §12 V1 (multi-school organizations with consolidated views); RG-21, RG-36, DEC-02; BES-DIR-01, BES-DIR-04; DEC-35; G-04; INV-17 (`prd/03-domain-data-model.md` §4); FR-ADM-04; ARB-01 |
| Actors | Group administrator, leadership |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Cross-site comparison at the organization level
  Scenario: Consolidating three schools without merging data (MVP, consolidated read view)
    Given an organization grouping schools A (900 students), B (600 students), and C (300 students)
    And a group administrator authorized only at the organization level
    And a today's attendance rate of 96.2% at A, 94.8% at B, and 97.1% at C
    When the administrator opens today's consolidated view
    Then each indicator is shown per school with the group total
    And the consolidated attendance rate is the headcount-weighted average, i.e. 95.9% (rounded to one decimal)
    And the detail of absent students at a given school is not accessible from the consolidated view
    And each row offers a link to the school's dashboard for accounts authorized within that tenant
  Scenario: A financial indicator without group permission (MVP)
    Given a group administrator with no financial permission at the group level
    When they open the consolidated view
    Then the unpaid-balance column is neither shown nor derivable from any other indicator
```

### FR-RAP-10 — Export every dashboard and report to Excel, CSV, and PDF

| Attribute | Value |
|---|---|
| Description | Every dashboard and every report exports to three formats: Excel (data with the current breakdown), CSV (raw data, configurable separator), and PDF (bilingual print layout with school header, period, production date and time, author). The export exactly reflects the active filters (year, period, scope) and carries the school's and the report's names. Exports respect the author's permissions: an export never contains data the author cannot view on screen. Export logging (author, scope, timestamp) becomes effective in V1, with the founding document's immutable exportable AuditLog (RG-38, OQ-06); at MVP, traceability is limited to minimal entry logging (OQ-06). Produced PDFs respect the dual-script names and correct Arabic typography (§10). |
| Priority | Must |
| Version | MVP |
| Traceability | §10 (interoperability: "Excel/CSV/PDF exports everywhere"; bilingual PDF documents); RG-38 (export logging: V1 — OQ-06) |
| Actors | All authorized internal roles |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Exporting dashboards
  Scenario: Exporting the filtered unpaid-balance status
    Given a principal viewing the 2026-2027 unpaid balances for the October period
    When they request the Excel export then the PDF export of the current view
    Then each produced file exactly reflects the filtered scope (year, period, breakdown by class and by guardian)
    And the PDF file carries the school's bilingual header, the production date and time, and the author's name
    And no student outside the author's permission scope appears in the file
```

### FR-RAP-11 — Prepare data for ESISE regulatory statistics

| Attribute | Value |
|---|---|
| Description | The module prepares, for each school, the datasets required by the ministry's ESISE applications (sise.men.gov.ma): the private-school census (school identification and headcount by level, section, and regime), the HR referential (teaching and non-teaching staff: headcount, qualifications **as declared to the employer on `SchoolMembership`** — never the global `TeacherProfile`, RG-20, RG-35, ARB-23b —, contract natures, the permanent-teacher share drawn from FR-CAR-19), and year-end results (averages, promotion decisions, and diplomas per level). Each dataset is shown as a field-to-field mapping: for every expected field, the screen states the ZSchool entity and field feeding it (for example "3AC female headcount" ← ACTIVE 3AC enrollments in the day-student regime), the number of filled-in values, and any detected anomaly (missing, inconsistent, or out-of-range values). Completeness is checked before generation: an incomplete dataset is flagged and cannot be marked ready. The **review view is unique and carried here** (ARB-24d): FR-MAS-07 to FR-MAS-09 (`prd/modules/21-massar-regulatory-exports.md`) do not duplicate it and are limited to generating the final file under the active template, leadership validation, and deadline tracking (the May census, year-end results); submission to the ESISE platform (Excel import/export, no public API: `prd/research/04-pedagogy-massar-calendar.md` §2) stays an act of the school. ESISE consolidation stays per school (tenant): no multi-school consolidated file is produced, each school being declared under its own authorization number (RG-21, RG-22). Since the exact forms are "under review" and not fixed (H-10, partially confirmed), mappings are kept in a repository configurable by the ZSchool team, not hard-coded into the application. |
| Priority | Must |
| Version | V1 |
| Traceability | §7.11 (regulatory statistics); §7.12 (ESISE census data preparation); §12 V1 (regulatory statistics); H-10; G-08; `prd/research/00-baseline-corrections.md` no. 11; `prd/research/04-pedagogy-massar-calendar.md` §2; FR-CAR-19; ARB-23b, ARB-24d |
| Actors | Leadership, ZSchool administrator (mapping maintenance) |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Preparing ESISE data
  Scenario: Completeness check before submission
    Given a school of 812 students preparing the May census
    And the "1AC female headcount" field auto-filled from ACTIVE 1AC enrollments
    And the "number of part-time teachers" field of the HR referential with no source filled in for 3 affiliations under an unqualified contract
    When leadership opens the census preparation screen
    Then each field shows its ZSchool source, computed value, and completion rate
    And the 3 affiliations under an unqualified contract show up as anomalies with a link back to their affiliation records
    And the "mark ready for submission" button stays unavailable while a blocking anomaly remains
  Scenario: Per-school isolation
    Given an organization of two schools A and B
    When school A's leadership prepares its ESISE data
    Then the dataset produced contains only tenant A's data
    And no consolidated A+B file is offered
```

### FR-RAP-12 — Schedule recurring reports (weekly for leadership)

| Attribute | Value |
|---|---|
| Description | Leadership schedules recurring reports: choosing a report type (weekly school status: headcount, the week's attendance, unpaid balances, pending entries; a monthly financial report; a re-enrollment tracking report during campaign periods), a frequency (weekly, monthly, with an issue day and time), a scope, and internal recipients. The report is produced at the deadline with the defined filters (a rolling period: past week, past month), stored in a viewable and exportable history, and notified to recipients through internal channels (an in-app notification first, SMS or email based on each recipient's preferences, email never required — DEC-11, INV-37; see `prd/cross-cutting/35-external-integrations.md`). Production accounts for the school's calendar: no issuance on configured non-working days (calendar, Saturday not a working day in configuration), deferred to the next working day. The report is sent to internal roles only; parents are never recipients of management reports. |
| Priority | Should |
| Version | V1 |
| Traceability | §7.11 (leadership reporting); §10 (interoperability, availability); school calendar (RG-22) |
| Actors | Leadership, group administrator |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Scheduled weekly report
  Scenario: Producing and distributing the weekly report
    Given a weekly report scheduled for Monday at 7:30 a.m. for School A's leadership
    And covering the past week with the headcount, attendance, unpaid-balance, and pending-entries indicators
    When the Monday 7:30 a.m. deadline arrives on a working day of the school's calendar
    Then the report is produced with the past week's data and time-stamped
    And it appears in the report history and is notified to internal recipients
    And its content respects the report's permissions, regardless of the recipients
  Scenario: A deadline falling on a non-working day
    Given the same scheduled report whose deadline falls on a holiday in the school's calendar
    When the deadline arrives
    Then production is deferred to the next working day at the same time
    And no notification is sent before actual production
```

### FR-RAP-13 — Apply permissions and log access to sensitive indicators

| Attribute | Value |
|---|---|
| Description | Every indicator and every detailed list on a dashboard obey the role's permissions in its context (RG-36, RG-37) and least privilege (RG-39): an indicator the role has no right to view is neither shown nor derivable from other indicators (aggregates do not bypass permissions); the head supervisor sees only their cycles; the teacher only their courses; financial and disciplinary indicators are visible only to authorized roles; permissions apply in full from MVP. Logging of sensitive-data views (finance, discipline, file) and exports, with author, context, and timestamp (RG-38; exports: FR-RAP-10), becomes effective in V1 with the founding document's immutable exportable AuditLog; at MVP, traceability is limited to minimal entry logging (corrections tracked at the record level), an accepted and recorded degradation, OQ-06. Any permission change applies immediately to already-in-place dashboards and scheduled reports. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-36, RG-37, RG-38, RG-39; INV-31, INV-32, INV-33, INV-34 (`prd/03-domain-data-model.md` §4); logging of sensitive views and exports: V1 — AuditLog, OQ-06 (arbitration D4, ARB-25j) |
| Actors | All roles |

**Acceptance criteria (critical flow)**

```gherkin
Feature: Permissions applied to indicators (MVP)
  Scenario: An aggregate does not bypass a permission
    Given a head supervisor assigned to the middle-school cycle only, with no financial permission
    When they open the school's dashboard
    Then unpaid-balance indicators are neither shown nor derivable from a total
    And the headcount and attendance shown concern the middle-school cycle only

  Scenario: A removed permission takes effect immediately
    Given a weekly report scheduled for an account holding the financial permission
    When leadership removes that permission from the account
    Then the next report is produced without the unpaid-balances section
```

## 5. Morocco-specific considerations

1. **The ESISE platform (H-10).** Regulatory statistics go through ESISE (sise.men.gov.ma), which as of 09/09/2026 offers three applications "under review": private-school census, HR referential, year-end results (source: `prd/research/04-pedagogy-massar-calendar.md` §2, GuideEsise_V1.pdf). No public API exists: the channel stays manual Excel import/export, hence the choice to prepare and check data in RAP (FR-RAP-11) and produce the files in MAS. The divergence with the founding document (which mentions "private-school census, HR referential, May census") is recorded in OQ-01.
2. **School calendar and periods.** The year runs from September to June, with assessment periods in semesters or trimesters depending on the school (including the bilingual pilot school in trimesters, DEC-35); RAP's period filters follow each school's configuration (RG-22). The May ESISE census and year-end results fall respectively during the re-enrollment campaign period and in June: data preparation must be available starting in April (see seasonality, `prd/journeys/00-journey-map.md` §4.1).
3. **Time zone.** Decree no. 2.26.530 (BO no. 7521 of 06/29/2026): a definitive return to UTC+0 on 09/20/2026, with no seasonal alternation or Ramadan exception (`prd/research/00-baseline-corrections.md` no. 1). The day boundaries of daily indicators ("today's absences", weekly reports) are computed in the `Africa/Casablanca` time zone at fixed UTC+0, with storage in UTC; "reduced Ramadan hours" stay a timetable (pedagogical) variant, not a time-zone matter.
4. **Six-day school week.** The school week runs Monday to Saturday, Saturday morning staying a working day depending on the school's configuration (`prd/research/04-pedagogy-massar-calendar.md` §3): weekly reports and "for the week" counters follow the school calendar's definition of a week.
5. **Bilingualism and dual script.** Dashboards and PDF exports are available in French and Arabic with RTL support (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`); people's names appear in dual script (DEC-10) and statistical exports reuse the script required by ministerial forms.
6. **Massar code and national matching.** Statistical headcounts distinguish students with and without a filled-in Massar code (RG-04, code not mandatory) to prepare the matching required by ministerial forms; the count stays internal and code-enumeration protection applies (§9).
7. **Moroccan multi-site context.** School groups operate several sites with separate leadership and consolidated accounting (§2.11): the cross-site comparison (FR-RAP-09) answers this reality without merging tenants, each site remaining a full-fledged filer with its own AREF and provincial education office (RG-22).

## 6. Data and events

The RAP module creates no new canonical entity: it reads and aggregates the `PROJECT.md` §6.10 schema as detailed in `prd/03-domain-data-model.md`.

| Source domain | Entities read by RAP | Indicators produced |
|---|---|---|
| Relations | `Enrollment`, `StudentClassHistory`, `TeacherAssignment`, `SchoolMembership` (including qualification as declared to the employer, ARB-23b) | Headcount by level/class/regime; re-enrollment rate; teachers' operational activity; ESISE HR referential (never from `TeacherProfile`) |
| Academic | `AttendanceRecord`, `Justification`, `Dispensation` | Today's and period attendance; absences, tardiness, pending justifications |
| Academic | `Assessment`, `Mark`, `PeriodResult`, `YearDecision`, `ConductGrade` | Results by subject and class; averages; honors; distribution; ESISE year-end results |
| Discipline | `Incident`, `Sanction` (V1) | Ongoing incidents, severity; today's student-life tracking |
| Finance | `Invoice`, `Installment`, `Payment`, `FinancialAccount`, `Dunning` | Unpaid balances by class/guardian; outstanding amounts; aging; effect of reminders |
| School | `School`, `Organization`, `Campus`, `AcademicYear`, `EvaluationPeriod`, `Cycle`, `Level`, `Class`, `Subject`, `Room`, declared sessions (FR-PED-20, MVP), `Timetable`, `TimetableSlot`, `ScheduleVariant` (V1) | Breakdown scopes; expected sessions (attendance-rate denominator, ARB-24a); room occupancy; period/year filters; group consolidation |
| Communication | `Notification`, `DeliveryLog` | Absence-notification statuses (sent, delivered, read) shown on the student-life dashboard |

To meet performance targets (pages under 2 s on 4G, §10) on aggregates recomputed on every open, indicators rely on pre-computed aggregates refreshed by domain events — an implementation choice serving observable behavior (shown freshness, speed), with no extra entity in the logical model. Each block's freshness is shown (time of last computation) and today's indicators refresh on every incoming event.

| Consumed event | Effect on dashboards | Reference |
|---|---|---|
| `AttendanceRecorded`, `JustificationSubmitted`, `JustificationValidated` | Updates today's absences, pending justifications, and the attendance rate | `prd/03-domain-data-model.md` §7 |
| `AbsenceThresholdReached` | A counter of students at the threshold (the alert display stays carried by VSC) | idem |
| `IncidentRecorded`, `SanctionNotified` (V1) | Ongoing incidents on the student-life dashboard | idem |
| `PeriodClosed`, `ReportCardPublished` | Results by subject available; averages visible on teacher/parent/student dashboards | idem |
| `EnrollmentStatusChanged` | Actual (ACTIVE) headcount and campaign re-enrollment rate | idem |
| `InstallmentOverdue`, `ReminderSent`, `PaymentReceived` | Unpaid balances, outstanding amounts, the effect of reminders | idem |
| `ClassChanged` | Up-to-date breakdown of headcount by class (via `StudentClassHistory`) | idem |

## 7. Key screens

Screens are described textually (conventions §1); mobile-first, light/dark themes, bilingual FR/AR labels with full RTL support (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`). Detailed lists reached by drill-down belong to the source modules: RAP does not redefine them.

### ECR-RAP-01 — Leadership dashboard (school)

Header zone: context selector (school), school-year and period selectors, data-freshness timestamp, access to advanced filters and export (FR-RAP-02, FR-RAP-10). Indicator zone in stacked cards on mobile, a grid on large screens: actual headcount (total and by level, with a campaign-vs-enrollment gap), today's and the period's attendance rate, outstanding unpaid balances (amount, number of students), results for the last closed period (overall average, distribution), a summary reminder of pending entries. Each card: a bilingual title, a headline value, a trend versus the previous period, and a drill-down action. States: loading, partial data (a gray block with a reason: "timetables not published", "period not closed"), empty (no data for the filter, a bilingual absence message and a call to configuration). Behavior: refreshes on open and on incoming events; every card respects the role's permissions (FR-RAP-13).

### ECR-RAP-02 — Consolidated organization view (cross-site comparison)

An organization selector in the header; a cross-table of indicators per school with a group-total row (sums for volumes, headcount-weighted averages for rates) (MVP, consolidated read view, ARB-01) and a relative-gap column against the group average (V1); a day/week/period/year switch. A school row expands into a summary mini-dashboard; a link to the school's full dashboard only for accounts authorized within that tenant (RG-21, FR-RAP-09). On mobile, a per-school card layout with a swipeable comparison. Indicators without group permission are absent, never shown as zero.

### ECR-RAP-03 — Today's student-life dashboard

Today's view, scoped to assigned cycles (RG-39): a top counter band (confirmed absences, tardiness, ongoing incidents, pending attendance checks); a main list of absences by class with time slot, justification status (badge: unjustified / submitted / accepted / declined), and family-notification status; tardiness and ongoing-incident tabs; a distinct "attendance pending" signal for classes not yet checked. Quick per-row actions: open the student record, follow up on a justification, contact the guardian via the COM module. Refreshes as offline syncs complete; a freshness band with the time of the last computation. FR/AR labels, touch targets matching the supervisor's mobile usage (§2.10).

### ECR-RAP-04 — Teacher dashboard

The teacher's daily schedule (declared sessions at MVP: course, class, time slot; in V1: rooms, times, and the active schedule variant from the timetable); a "pending entries" block (today's unvalidated attendance checks, assessments with no grades, with age and direct access to entry in the source module); an "my averages" block by class and subject per the publication state; for the homeroom teacher, a "my class" tab with a class summary (§8.1). Nothing outside the scope of active assignments (RG-39). A context selector shown for a multi-affiliation account (RG-36).

### ECR-RAP-05 — Multi-child, multi-school parent view (indicators and aggregates)

The parent's home screen is ECR-UX-01 (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`); ECR-RAP-05 describes the indicator-and-aggregate view produced by RAP, reached from that home screen: grouping by school (one section per school, bilingual name and logo); within each section, a card per child carrying the moment's aggregates (absences to justify, latest grades or published report card, next financial due date and balance, unread announcements) per the relationship's rights; an account header (number of children, of schools). Selecting a card: the child's view in their school context; switching with no re-authentication. Adult-student-with-restriction case (RG-02): a card showing "access restricted by the student" while keeping financial indicators for the financial guardian who remains the payer. Empty states: no active linked child (message and a link to the school); a child with no activated account.

### ECR-RAP-06 — Student view (indicators and aggregates)

The student's home screen is ECR-UX-02 (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`); ECR-RAP-06 describes the view of their own data's indicators and aggregates produced by RAP: latest published grades by subject, published period average, personal absences and tardiness with justification status, recent documents and announcements. No comparison with other students outside a scale published by the school; no other student's data.

### ECR-RAP-07 — Report and export builder

A single screen for producing a report: choosing the report type (headcount, attendance, results, unpaid balances, room occupancy, operational activity, regulatory statistics), filters (year, period, scope: school, campus, cycle, level, class), the format (Excel, CSV, PDF), and the orientation (portrait/landscape for PDF). A preview of the first rows before production; a reminder of effective permissions; launching production with a progress indicator for wide scopes; the account's export history (file, scope, date, author) with re-download. Every export is logged starting in V1 (FR-RAP-10, FR-RAP-13, OQ-06).

### ECR-RAP-08 — Preparing ESISE regulatory statistics

A list of datasets by ESISE application (private-school census, HR referential, year-end results — `prd/research/04-pedagogy-massar-calendar.md` §2) with status (to prepare, in progress, complete, anomalies, ready for submission) and an indicative deadline (the May census, year end). Dataset detail: a field-by-field mapping table (ESISE field / ZSchool source: entity and field / computed value / completion rate / anomalies), a filter on anomalies with a link back to source records; consistency checks (per-level sums, male/female balance, ranges). Actions: prepare/recompute, mark ready for submission (blocked if blocking anomalies exist), a link to MAS for generating and submitting the file (`prd/modules/21-massar-regulatory-exports.md`). Bilingual labels and respect for ministerial scripts in exported values.

### ECR-RAP-09 — Scheduled reports

A list of schedules (report type, frequency, scope, internal recipients, next deadline, status: active, paused); creation/editing: choice of report type, weekly or monthly frequency with a day and time, scope and filters, a rolling period (past week, past month), internal recipients (authorized roles or accounts), notification channels (in-app, email); a history of runs (production date, scope, recipients, downloadable file). Shown constraints: the school calendar's non-working days (deferred to the next working day), internal recipients only (FR-RAP-12).

## 8. Integrations

The RAP module consumes no external integration directly; it relies on:

| Need | Integration | Reference |
|---|---|---|
| Notification of scheduled-report availability and email distribution | Internal in-app channels and INT-EML | `prd/cross-cutting/35-external-integrations.md`; COM module (`prd/modules/17-communication-notifications.md`) |
| Production and submission of ESISE and Massar files | The file channel (Excel import/export, no API: H-04 confirmed) | `prd/cross-cutting/35-external-integrations.md`; `prd/modules/21-massar-regulatory-exports.md` |
| Career data used for the ESISE HR referential | Reading `SchoolMembership` only (qualification as declared to the employer, FR-CAR-19's permanent-teacher share); never `TeacherProfile` (RG-20, RG-35, ARB-23b) | `prd/modules/19-teacher-career-network.md` |

No outbound flow to Massar or ESISE is automated; every submission stays a documented human action (H-04, H-10).

## 9. Module-specific non-functional requirements

References to the domains carried by `prd/cross-cutting/32-non-functional-requirements.md` (without renumbering):

| Domain | Application to the RAP module |
|---|---|
| PERF (performance) | Dashboard pages under 2 s on 4G (§10); pre-computed aggregates refreshed by events; exporting a 2,000-student school handled in memory in acceptable batches without blocking the interface |
| DISP (availability) | Today's dashboards (leadership, student life) stay viewable as the last computed value with a timestamp if recomputation is unavailable; target availability 99.5% outside maintenance (§10) |
| MOB (mobile) | Leadership and student-life dashboards usable on mobile between sites and while walking the halls (§2.10); touch targets and card stacking matching mobile-first UX |
| I18N (languages) | FR/AR with full RTL, English in V2; bilingual indicator labels; dual script in lists and exports (§10, DEC-10) |
| OFF (offline) | The dashboard is not an offline feature: in a dead zone, the last computed view stays shown in read mode with a "data as of [timestamp]" band; entry (attendance, grades) stays offline on the VSC/EVA side |
| DOC (documents) | Bilingual PDF exports, correct Arabic fonts, A4/A5, batch printing (§10) |
| OBS (observability) | Aggregate freshness, computation time, and recomputation errors tracked per tenant (§10); logging of sensitive views and exports (RG-38; V1 — OQ-06, minimal entry logging at MVP) |
| RES (volumetry) | Sized for 500 schools, 500,000 students (§10): consolidated organization views and exports stay linear in school size, never in platform size |
| Interoperability | Excel/CSV/PDF exports everywhere (§10); a stable, documented CSV structure for re-import into schools' tools |

Security: systematic server-side control of the tenant key on every indicator and every export (INV-17, RG-21); no aggregate may allow reconstructing a forbidden data point (FR-RAP-13); exports protected by an authenticated link (no public link).

## 10. Success metrics

The catalog and numbering of success indicators fall under `prd/cross-cutting/38-kpi-success-metrics.md`; this chapter creates no `KPI-NN` identifier (the indicators below, not yet catalogued, are created there under KPI-35 and following, ARB-26h; KPI-06 and KPI-07 reuse FR-RAP-01's attendance-rate definition). Behaviors to instrument within RAP, made available to that catalog:

- Adoption: share of leadership viewing the dashboard at least three days a week; share of supervisors opening the daily view before 10 a.m.; export usage frequency.
- Effectiveness: reduction in the delay between an attendance check and leadership's awareness of absences (target: information available as soon as the attendance check is validated); share of scheduled weekly reports actually produced and opened.
- Collections: change in outstanding unpaid balances and average settlement time after the unpaid-balance dashboard and reminders are put in place (to be correlated with the FIN module, with cautious causal attribution).
- Compliance: ESISE dataset completion rate at first check; number of blocking anomalies detected before submission; deadlines met (May census, year-end results).
- Data quality: share of schools with published timetables (a condition for the room-occupancy indicator); rate of attendance checks validated on time.

## 11. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Exact content of the three ESISE applications and stabilization of their forms. | The founding document (§7.11) cites "private-school census, HR referential, May census"; research (`prd/research/04-pedagogy-massar-calendar.md` §2) finds three applications "under review": private-school census, HR referential, year-end results, and H-10 (partially confirmed) lists four items, including "the May census" and "year-end results". The PRD takes research's reading (three applications, the May census being an update deadline for the census) and records the divergence; field mappings are to be validated with pilots once forms are fixed, and the mapping repository stays configurable (FR-RAP-11). |
| OQ-02 | Standardized definition of "attendance rate". | **Resolved — ARB-24a**: attendance rate = (expected sessions − unjustified absences − justified absences) / expected sessions, over declared sessions (MVP) or timetable sessions (V1); excused absences excluded from the denominator; tardiness counted separately; sessions not held (FR-PED-21) removed from expected sessions; a rate excluding justified absences displayable as a supplement. A single definition in FR-RAP-01, reused by KPI-06/07 and the cross-site comparison. |
| OQ-03 | A closed list of "teacher activity" indicators allowed given DEC-25. | FR-RAP-08 keeps strictly operational indicators with no score or ranking; the exact boundary (for example: whether to show an individual per-teacher rate at all) is to be arbitrated in review with pilots, the ban on rating staying absolute. |
| OQ-04 | Scope of financial indicators at the organization level (from MVP as a consolidated read view, ARB-01). | The founding document offers consolidated, unmerged views (RG-21) and a group administrator with "consolidated views, school management, subscription" (§8.1); consolidating per-school unpaid balances assumes a group financial permission. To be fixed in `prd/cross-cutting/30-roles-permissions-matrix.md`: per-school aggregates allowed, detail forbidden without tenant authorization. |
| OQ-05 | Version for introducing scheduled reports. | §12 does not explicitly cite scheduled reports; this chapter places them in V1 (Should), weekly production relying on V1 capabilities (exports, internal channels). Without justification for MVP; to be confirmed in review. Open (V1, non-blocking). |
| OQ-07 | Version of group consolidation (FR-RAP-09): the founding document §12 places it in V1, while the "group > 2,000 students" pilot (DEC-35) and BES-DIR-01 (Must MVP) require it at MVP. | **Resolved — ARB-01** (a working assumption to be confirmed by the founder, ESC-02): a consolidated read view at MVP, advanced comparisons and shared administration in V1. |
| OQ-06 | Version timing for logging views of sensitive data and exports (RG-38; FR-RAP-10, FR-RAP-13). | **Resolved — D4 / ARB-25j.** The founding document sets RG-38 as a cross-cutting rule but places the audit ("Audit, personal-data rights, formalized CNDP compliance") in V1 (§12). Arbitration adopted: at MVP, minimal entry logging (corrections tracked at the record level), with no logging of views of sensitive data or exports; in V1, an immutable exportable AuditLog covering sensitive views and exports. This MVP degradation is accepted; FR-RAP-10, FR-RAP-13, ECR-RAP-07, and §9 are aligned accordingly. |

---

## 12. Traceability

| Founding-document ID | Coverage in this file |
|---|---|
| §7.11 (dashboards and reporting) | §1; FR-RAP-01 to FR-RAP-09, FR-RAP-11 to FR-RAP-13; ECR-RAP-01 to ECR-RAP-06, ECR-RAP-08 |
| §7.12 (census data preparation, compliance check) | FR-RAP-08, FR-RAP-11; ECR-RAP-08; references to `prd/modules/14-assessments-grades-report-cards.md` (FR-EVA-06), `prd/modules/21-massar-regulatory-exports.md` (FR-MAS-06) |
| §8.1 (roles: homeroom teacher, group administrator) | FR-RAP-04, FR-RAP-09; ECR-RAP-02, ECR-RAP-04 |
| §10 (interoperability, performance, languages, documents, observability, volumetry) | FR-RAP-02, FR-RAP-10; §9; ECR-RAP-07 |
| §12 MVP (leadership, teacher, student, multi-child multi-school parent dashboards) | FR-RAP-01, FR-RAP-02, FR-RAP-04, FR-RAP-05, FR-RAP-06, FR-RAP-10, FR-RAP-13 |
| §12 V1 (multi-school consolidated views, regulatory statistics, discipline) | FR-RAP-03, FR-RAP-07, FR-RAP-08, FR-RAP-09 (advanced comparisons; consolidated read view at MVP by ARB-01), FR-RAP-11, FR-RAP-12 |
| RG-02 | FR-RAP-05 (adult-student restriction, financial access kept); ECR-RAP-05 |
| RG-03, RG-36 | FR-RAP-02, FR-RAP-04, FR-RAP-05, FR-RAP-09 (context selector, contextual permissions) |
| RG-04 | §5.6 (with/without Massar code distinction in statistics) |
| RG-13, RG-14 | FR-RAP-05 (rights per relationship, statuses) |
| RG-21, DEC-02 | FR-RAP-09, FR-RAP-11, FR-RAP-13; §9; OQ-04 |
| RG-22 | FR-RAP-02, FR-RAP-12; §5.2, §5.4 |
| RG-25 | FR-RAP-02 (history per school year) |
| RG-37 | FR-RAP-13; §2 |
| RG-38 | FR-RAP-10, FR-RAP-13; §9; OQ-06 (detailed logging in V1, minimal entry logging at MVP) |
| RG-39 | FR-RAP-03, FR-RAP-04, FR-RAP-13 |
| DEC-10 | §5.5, §9 (dual script) |
| DEC-25 | FR-RAP-08 (no rating of teachers); OQ-03 |
| DEC-35 | §5.2 (the pilot school's trimestral periods) |
| H-04 | §8 (no Massar/ESISE API, file channel); FR-RAP-11 |
| H-10 | FR-RAP-11; OQ-01 |
| G-04 | FR-RAP-09 |
| G-08 | FR-RAP-11 |
| G-22 | §1.2 (scope by version) |
| `prd/research/00-baseline-corrections.md` no. 1 (permanent UTC+0 time zone) | §5.3; FR-RAP-02 (day boundaries) |
| `prd/research/00-baseline-corrections.md` no. 11 (ESISE, no API) | FR-RAP-11; §5.1, §8; OQ-01 |
| `prd/research/04-pedagogy-massar-calendar.md` §2 (ESISE, three applications) | FR-RAP-11; ECR-RAP-08; §5.1; OQ-01 |
| `prd/research/04-pedagogy-massar-calendar.md` §3 (Monday–Saturday week, 2026-2027 calendar) | §5.2, §5.4; FR-RAP-12 |
| Persona needs | BES-DIR-01 (FR-RAP-01, FR-RAP-09 as a consolidated read view at MVP), BES-DIR-04 (FR-RAP-09), BES-SUR-07 (FR-RAP-03; ECR-VSC-02 at MVP), BES-ENS-08 (FR-RAP-04), BES-PAR-04 (FR-RAP-05) |
| `prd/modules/12-academic-structure-timetables.md` (FR-PED-20, FR-PED-21) | FR-RAP-01, FR-RAP-04, FR-RAP-06 (declared sessions, sessions not held) |
| `prd/modules/19-teacher-career-network.md` (FR-CAR-19) | FR-RAP-11 (permanent-teacher share) |
| `prd/cross-cutting/42-review-arbitrations.md` | ARB-01 (§1.2, FR-RAP-09, ECR-RAP-02, OQ-07); ARB-04 (FR-RAP-04, FR-RAP-06, ECR-RAP-04); ARB-07 (FR-RAP-06); ARB-23b (FR-RAP-11, §6, §8); ARB-24a (FR-RAP-01, OQ-02); ARB-24d (FR-RAP-11); ARB-25j (FR-RAP-10, FR-RAP-13, OQ-06) |
| Journeys | PC-02, PC-05, PC-06, PC-07 (§3) |
