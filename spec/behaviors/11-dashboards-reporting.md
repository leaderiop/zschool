> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-11                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification                                      |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/20-dashboards-reporting.md` (v0.3), old `FR-RAP-01..13` -> `BEH-ZS-241..253`, old `ECR-RAP-01..09` -> `SCR-ZS-131..139`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Dashboards and Reporting (RAP)

## 1. Objective and scope

**Objective.** Turn operational data produced by the other modules into readable, actionable indicators, with no re-entry and no manual spreadsheet consolidation. RAP serves four audiences: leadership (steering a single school, then a multi-site group), student life staff (a view of the day), teachers (a view of their courses), and families (a per-child view, across every school). It also prepares data for the regulatory statistics transmitted through the ministry's ESISE platform.

The historical baseline sets the expected content (`spec/appendices/00-project-baseline.md` §7.11): "Leadership: headcount by level and class, attendance rate, results by subject, unpaid balances, room occupancy, teacher activity, cross-site comparison (organization). Student life: today's absences, tardiness, ongoing incidents. Teacher: today's classes, pending entries, their classes' averages. Parent: per-child and cross-school view. Regulatory statistics: headcount, staffing, year-end results to be transmitted through the ministry's ESISE platform."

**Scope included:**

| Item | Version |
|---|---|
| School leadership dashboard (headcount, attendance, results, unpaid balances) | MVP |
| Teacher dashboard (least privilege, INV-ZS-091) and student dashboard | MVP |
| Multi-child, multi-school parent dashboard | MVP |
| Period filters (assessment period, month, day) and school year | MVP |
| Excel/CSV/PDF exports of dashboards and reports (export logging: V1) | MVP |
| Student life dashboard for the day (absences, tardiness, ongoing incidents); at MVP, the daily attendance summary is carried by SCR-ZS-051 (`spec/behaviors/04-attendance-student-life-discipline.md`) | V1 (full dashboard) |
| Organization-level consolidated views (INV-ZS-073): consolidated read-only indicators per school for the "multi-site group" pilot ([ADR-ZS-035](../decisions/035-pilot-school-profiles.md), URS-ZS-001) | MVP (consolidated read-only); V1 (advanced comparisons, shared administration) — [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md) |
| Room occupancy and teacher activity (leadership indicators) | V1 |
| Preparation of ESISE regulatory statistics data | V1 |
| Schedulable reports (weekly for leadership) | V1 |

**Out of scope:**

| Item | Reference |
|---|---|
| Producing the Massar exports and the ESISE files themselves (formats, exact columns, submission) | `spec/behaviors/12-massar-regulatory-exports.md`: RAP prepares and presents the data, MAS produces and submits the files |
| Managing absence alert thresholds and notification rules | `spec/behaviors/04-attendance-student-life-discipline.md`; RAP shows the counters, it does not own the rules |
| Managing unpaid balances, reminders, aged-balance report (processing) | `spec/behaviors/07-finance-billing-collections.md`; RAP only exposes the consolidated read view |
| Grade entry, period closures, report card publication | `spec/behaviors/05-assessments-grades-report-cards.md` |
| Rating or evaluating teachers by the school, or vice versa | Forbidden at every version ([ADR-ZS-006](../decisions/006-no-teacher-school-cross-rating.md)); see BEH-ZS-248 for the retained limit |
| Accounting exports, general ledger, cash journal | `spec/behaviors/07-finance-billing-collections.md` |
| A public API for accessing indicators, webhooks | V2+; out of scope for this chapter |
| ZSchool's multi-tenant operator oversight (SaaS usage, billing) | Platform level, outside the RAP module |

## 2. Users and use cases

Reference personas: `spec/urs.md` (URS-ZS-001, URS-ZS-004, URS-ZS-024, URS-ZS-033, URS-ZS-037). Effective rights result from fine-grained permissions per module and per scope (`spec/cross-cutting/01-permissions.md`, INV-ZS-089) under least privilege (INV-ZS-091).

| User | Main use cases | Frequency |
|---|---|---|
| Principal / academic leadership | Morning dashboard: actual headcount, attendance rate, unpaid balances; monitoring results by subject during period closures; preparing ESISE statistics in May and June | Daily, peaks at period closure and at the start of the year |
| Group administrator (organization) | Cross-site comparison: headcount, attendance, results, unpaid balances per school; consolidated steering without merging data (INV-ZS-073) | Weekly, monthly |
| Head supervisor | View of the day: absences by class after attendance checks, tardiness, ongoing incidents; follow-up on unsubmitted justifications | Daily, morning |
| Teacher / homeroom teacher | Today's classes, pending entries (attendance, grades), their classes' averages; for the homeroom teacher, a class summary | Daily |
| Parent / guardian | Per-child view, switching between children and between schools from a single account; spotting absences to justify and financial deadlines | Daily |
| Student | Tracking their published averages, absences, and documents | Weekly |

No dedicated dashboard is planned for the front office; its tracking needs (re-enrollment campaign, cheques with due dates) stay carried by the INS and FIN modules. The "accounting / cashier" role accesses financial indicators per its permissions (INV-ZS-089), with no dedicated dashboard.

## 3. Key journeys

The RAP module is a consumer in the critical journeys mapped in `spec/journeys/00-journey-map.md`; it carries no journey step of its own.

| Journey | RAP's contribution | Reference |
|---|---|---|
| JMP-ZS-002 — Re-enrollment and N-to-N+1 rollover | Re-enrollment rate, year-N+1 headcount by level, to steer the campaign | `spec/journeys/00-journey-map.md`; leadership detail `spec/journeys/01-school-group-director.md` |
| JMP-ZS-005 — Morning attendance check and absence notification | Student life dashboard for the day, fed by validated attendance checks (absences, tardiness, pending justifications) | detail `spec/journeys/03-head-supervisor.md` |
| JMP-ZS-006 — Grades, grading conference, report cards | Results by subject and class, entry progress, averages after closure | detail `spec/journeys/04-part-time-teacher.md` (pending entries) and `spec/journeys/01-school-group-director.md` |
| JMP-ZS-007 — Collections and unpaid-balance reminders | Unpaid balances by class and by guardian, a simplified aged-balance report, the effect of reminders | detail `spec/journeys/02-secretary-cashier.md` |

## 4. Functional behaviors

| ID | Title | Priority |
|---|---|---|
| BEH-ZS-241 | Provide leadership with their school's dashboard | Must |
| BEH-ZS-242 | Filter every dashboard by period and by school year | Must |
| BEH-ZS-243 | Provide student life staff with today's view (absences, tardiness, ongoing incidents) | Must |
| BEH-ZS-244 | Provide the teacher with a dashboard limited to their courses | Must |
| BEH-ZS-245 | Provide the parent with a per-child, multi-child, multi-school view | Must |
| BEH-ZS-246 | Provide the student with a dashboard of their own data | Must |
| BEH-ZS-247 | Expose room occupancy | Should |
| BEH-ZS-248 | Track teacher activity for strictly operational purposes | Should |
| BEH-ZS-249 | Compare sites at the organization level without merging data | Must |
| BEH-ZS-250 | Export every dashboard and report to Excel, CSV, and PDF | Must |
| BEH-ZS-251 | Prepare data for ESISE regulatory statistics | Must |
| BEH-ZS-252 | Schedule recurring reports (weekly for leadership) | Should |
| BEH-ZS-253 | Apply permissions and log access to sensitive indicators | Must |

### BEH-ZS-241: Provide leadership with their school's dashboard

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-213`](../../features/rap/fr-rap-01-leadership-dashboard.feature)

REQUIREMENT: Leadership MUST be able to view their school's status for the selected year
             and period in a single screen: actual headcount by level and class (ACTIVE
             enrollments, broken down by section and regime), the attendance rate,
             results by subject and class as soon as the period closes, unpaid balances,
             and daily activity indicators. Each indicator MUST be clickable and MUST
             link to the detailed list in the source module. Attendance rate MUST use a
             single definition ([ADR-ZS-065](../decisions/065-reporting-and-capacity-definitions.md)):
             (expected sessions − unjustified absences − justified absences) / expected
             sessions, computed over declared sessions (BEH-ZS-070) or, in V1, over
             timetable-derived sessions; excused absences MUST be excluded from the
             denominator and tardiness counted separately; the same definition MUST be
             reused by KPI-ZS-019 and KPI-ZS-020. Day counters MUST rely on domain events
             (a validated attendance check, an unpaid due date) rather than manual
             recounting.

Traceability: URS-ZS-001; JMP-ZS-005, JMP-ZS-006, JMP-ZS-007; events `AttendanceRecorded`, `PeriodClosed`, `InstallmentOverdue` (`spec/domain-model.md` §7); BEH-ZS-070 (declared sessions).

### BEH-ZS-242: Filter every dashboard by period and by school year

> **Invariant:** [INV-ZS-088](../invariants.md#inv-zs-088)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-214`](../../features/rap/fr-rap-02-period-and-year-filters.feature)

REQUIREMENT: Every dashboard and every export MUST offer two systematic filters: school
             year (current year by default, earlier years available in read-only per
             retention periods) and period (day, week, month, the school's assessment
             period — semesters or trimesters depending on configuration, full year).
             Filters MUST apply to every indicator shown and MUST propagate to exports
             and to detailed lists reached by drill-down. The context selector MUST
             always be shown for a multi-context account (INV-ZS-088). Within the same
             year, changing the period MUST NOT trigger a full page reload; today's
             indicators MUST stay available offline from a recent session as a last
             computed value, with a freshness timestamp shown.

Traceability: INV-ZS-077 (structure cloning, per-year history); Hijri and Gregorian holiday calendars.

### BEH-ZS-243: Provide student life staff with today's view (absences, tardiness, ongoing incidents)

> **Invariant:** [INV-ZS-091](../invariants.md#inv-zs-091)
> **See:** none
> **Priority:** Must
> **Version:** V1 (full dashboard); at MVP, the daily attendance summary is carried by SCR-ZS-051
> **Acceptance:** [`@REQ-ZS-215`](../../features/rap/fr-rap-03-student-life-daily-view.feature)

REQUIREMENT: The head supervisor MUST be able to view a view limited to the current day,
             restricted to their assigned cycles (INV-ZS-091): a list of absences by
             class and by time slot as soon as attendance checks are validated, with a
             justification status and a family-notification status; a list of the day's
             tardiness with duration; a list of ongoing incidents with severity and any
             sanction. Classes whose attendance has not yet been taken MUST be flagged as
             "attendance pending" to distinguish "confirmed absent" from "attendance not
             taken". The view MUST refresh as offline attendance checks sync.

Traceability: URS-ZS-024, URS-ZS-023; JMP-ZS-005; SCR-ZS-051 (MVP); events `AttendanceRecorded`, `JustificationSubmitted`, `IncidentRecorded` (`spec/domain-model.md` §7).

### BEH-ZS-244: Provide the teacher with a dashboard limited to their courses

> **Invariant:** [INV-ZS-091](../invariants.md#inv-zs-091), [INV-ZS-019](../invariants.md#inv-zs-019)
> **See:** [ADR-ZS-045](../decisions/045-attendance-session-without-timetable.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-216`](../../features/rap/fr-rap-04-teacher-dashboard.feature)

REQUIREMENT: The teacher MUST be able to view a dashboard strictly derived from their
             active assignments: their classes and courses for the day (declared
             sessions at MVP, BEH-ZS-070; timetable-derived courses in V1, BEH-ZS-061),
             their pending entries, and their classes' averages for their subjects,
             visible according to the school's publication state. The teacher MUST NOT
             see other courses' students, class overall averages (except the homeroom
             teacher), or any financial or disciplinary data. The homeroom teacher MUST
             additionally see their class's summary. With multiple affiliations, the
             dashboard MUST follow the selected context (INV-ZS-088).

Traceability: URS-ZS-033; INV-ZS-091, INV-ZS-019 (`spec/domain-model.md` §4); BEH-ZS-070 (MVP), BEH-ZS-061 (V1).

### BEH-ZS-245: Provide the parent with a per-child, multi-child, multi-school view

> **Invariant:** [INV-ZS-042](../invariants.md#inv-zs-042), [INV-ZS-052](../invariants.md#inv-zs-052)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-217`](../../features/rap/fr-rap-05-multi-school-parent-dashboard.feature)

REQUIREMENT: From their single account, the parent MUST be able to view an overview of
             every child linked by an active relationship, regardless of school: a card
             per child grouped by school, with the moment's key indicators, following
             the rights carried by each relationship (INV-ZS-064, INV-ZS-065). Selecting
             a child MUST open their detailed view; switching between children and
             schools MUST NOT require re-authentication (INV-ZS-053, INV-ZS-088). For a
             student who has become an adult and has restricted parental access, the
             relevant cards and views MUST hide those indicators, with the financial
             guardian's access to financial data kept as long as they remain the payer
             (INV-ZS-052). Children whose relationship is suspended or revoked MUST no
             longer appear.

Traceability: URS-ZS-037; INV-ZS-052, INV-ZS-053, INV-ZS-065, INV-ZS-064, INV-ZS-088; INV-ZS-033, INV-ZS-042 (`spec/domain-model.md` §4).

### BEH-ZS-246: Provide the student with a dashboard of their own data

> **Invariant:** [INV-ZS-051](../invariants.md#inv-zs-051), [INV-ZS-052](../invariants.md#inv-zs-052)
> **See:** [ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-218`](../../features/rap/fr-rap-06-student-dashboard.feature)

REQUIREMENT: A student with an activated personal access MUST be able to view a
             dashboard of their own data: today's sessions, latest published grades and
             period averages, their own absences and tardiness with justification
             status, recent documents and announcements. The student MUST NOT see other
             students' data or class-aggregated indicators beyond what the school
             publishes. Access MUST be subject to the activation level set by the school
             and to restrictions an adult student places on their own data (INV-ZS-052).

Traceability: student dashboard scope; INV-ZS-051, INV-ZS-052; INV-ZS-042, INV-ZS-043 (`spec/domain-model.md` §4); BEH-ZS-070.

### BEH-ZS-247: Expose room occupancy

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at MVP)

REQUIREMENT: Leadership MUST be able to view room occupancy rates per site and per time
             slot, computed from published timetables. The view MUST offer a
             day-by-time-slot grid, a per-room summary, and a flag for over-requested or
             under-used rooms. Unpublished timetables MUST be excluded from the
             calculation and flagged as not accounted for.

Traceability: timetable dependency (V1); schedule variants.

### BEH-ZS-248: Track teacher activity for strictly operational purposes

> **Invariant:** [INV-ZS-039](../invariants.md#inv-zs-039)
> **See:** [ADR-ZS-006](../decisions/006-no-teacher-school-cross-rating.md)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at MVP)

REQUIREMENT: Leadership MUST be able to view operational activity indicators, aggregated
             by class and by course, in read-only. RAP MUST NOT execute the compliance
             check itself; it exposes the status produced by BEH-ZS-116
             (`spec/behaviors/05-assessments-grades-report-cards.md`) and relayed by
             BEH-ZS-266 (`spec/behaviors/12-massar-regulatory-exports.md`), with no
             second tally. These indicators MUST stay factual and operational: no
             overall score, ranking, or rating of a teacher may ever be produced or
             shown ([ADR-ZS-006](../decisions/006-no-teacher-school-cross-rating.md)).

Traceability: compliance check; [ADR-ZS-006](../decisions/006-no-teacher-school-cross-rating.md); INV-ZS-039 (`spec/domain-model.md` §4); references BEH-ZS-116, BEH-ZS-266.

### BEH-ZS-249: Compare sites at the organization level without merging data

> **Invariant:** [INV-ZS-073](../invariants.md#inv-zs-073), [INV-ZS-088](../invariants.md#inv-zs-088)
> **See:** [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md), [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)
> **Priority:** Must
> **Version:** MVP (consolidated read view); V1 (advanced comparisons, shared administration) — [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)
> **Acceptance:** [`@REQ-ZS-219`](../../features/rap/fr-rap-09-organization-cross-site-comparison.feature)

REQUIREMENT: The group administrator MUST be able to view a consolidated multi-site
             view: every leadership-dashboard indicator computed per school and shown in
             comparison, with a group-total row. Consolidation MUST aggregate indicators
             already computed within each tenant; it MUST NEVER open data merging
             (INV-ZS-073, [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md)):
             a school's student-level detail MUST be visible only to an account also
             authorized within that tenant (INV-ZS-088). At MVP: a consolidated read
             view (creating the organization and attaching tenants via BEH-ZS-004, a
             cross-table with a group total) to serve [ADR-ZS-035](../decisions/035-pilot-school-profiles.md)'s
             "multi-site group" pilot and URS-ZS-001; in V1: advanced comparisons,
             shared administration, and group billing.

Traceability: multi-school organizations with consolidated views; INV-ZS-073, INV-ZS-088, [ADR-ZS-013](../decisions/013-school-as-isolation-tenant.md); URS-ZS-001, URS-ZS-004; [ADR-ZS-035](../decisions/035-pilot-school-profiles.md); INV-ZS-001 (`spec/domain-model.md` §4); BEH-ZS-004.

### BEH-ZS-250: Export every dashboard and report to Excel, CSV, and PDF

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-220`](../../features/rap/fr-rap-10-exporting-dashboards.feature)

REQUIREMENT: Every dashboard and every report MUST export to Excel, CSV, and PDF (a
             bilingual print layout with school header, period, production date and
             time, author). The export MUST exactly reflect the active filters and MUST
             carry the school's and the report's names. Exports MUST respect the
             author's permissions: an export MUST NEVER contain data the author cannot
             view on screen. Export logging (author, scope, timestamp) becomes effective
             in V1 with the AuditLog (INV-ZS-090); at MVP, traceability is limited to
             minimal entry logging.

Traceability: interoperability, bilingual PDF documents; INV-ZS-090 (export logging: V1).

### BEH-ZS-251: Prepare data for ESISE regulatory statistics

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-221`](../../features/rap/fr-rap-11-esise-data-preparation.feature)

REQUIREMENT: The module MUST prepare, for each school, the datasets required by the
             ministry's ESISE applications: the private-school census, the HR
             referential (qualifications **as declared to the employer on
             `SchoolMembership`** — never the global `TeacherProfile`,
             [ADR-ZS-064](../decisions/064-teacher-career-rules.md)), and year-end
             results. Each dataset MUST be shown as a field-to-field mapping stating the
             ZSchool entity and field feeding it, the number of filled-in values, and
             any detected anomaly. Completeness MUST be checked before generation: an
             incomplete dataset MUST be flagged and cannot be marked ready. The review
             view MUST be unique and carried here
             ([ADR-ZS-065](../decisions/065-reporting-and-capacity-definitions.md)):
             BEH-ZS-267 through BEH-ZS-269 (`spec/behaviors/12-massar-regulatory-exports.md`)
             MUST NOT duplicate it. ESISE consolidation MUST stay per school: no
             multi-school consolidated file may be produced.

Traceability: regulatory statistics; census data preparation; permanent-teacher share (BEH-ZS-239); [ADR-ZS-064](../decisions/064-teacher-career-rules.md), [ADR-ZS-065](../decisions/065-reporting-and-capacity-definitions.md).

### BEH-ZS-252: Schedule recurring reports (weekly for leadership)

> **Invariant:** [INV-ZS-044](../invariants.md#inv-zs-044)
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-222`](../../features/rap/fr-rap-12-scheduled-weekly-report.feature)

REQUIREMENT: Leadership MUST be able to schedule recurring reports: choosing a report
             type, a frequency, a scope, and internal recipients. The report MUST be
             produced at the deadline with the defined filters, stored in a viewable and
             exportable history, and notified to recipients through internal channels
             (in-app first, SMS or email based on preferences, email never required —
             [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md),
             INV-ZS-044). Production MUST account for the school's calendar: no issuance
             on configured non-working days, deferred to the next working day. The
             report MUST be sent to internal roles only; parents MUST NEVER be
             recipients of management reports.

Traceability: leadership reporting; interoperability, availability; school calendar (INV-ZS-074).

### BEH-ZS-253: Apply permissions and log access to sensitive indicators

> **Invariant:** [INV-ZS-088](../invariants.md#inv-zs-088), [INV-ZS-089](../invariants.md#inv-zs-089), [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-091](../invariants.md#inv-zs-091)
> **See:** [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-223`](../../features/rap/fr-rap-13-permissions-applied-to-indicators.feature)

REQUIREMENT: Every indicator and every detailed list on a dashboard MUST obey the
             role's permissions in its context (INV-ZS-088, INV-ZS-089) and least
             privilege (INV-ZS-091): an indicator the role has no right to view MUST NOT
             be shown or derivable from other indicators (aggregates MUST NOT bypass
             permissions). Permissions MUST apply in full from MVP. Logging of
             sensitive-data views and exports, with author, context, and timestamp
             (INV-ZS-090), becomes effective in V1 with the AuditLog; at MVP,
             traceability is limited to minimal entry logging, an accepted and recorded
             degradation. Any permission change MUST apply immediately to already-in-
             place dashboards and scheduled reports.

Traceability: INV-ZS-088, INV-ZS-089, INV-ZS-090, INV-ZS-091; INV-ZS-040, INV-ZS-041, INV-ZS-019, INV-ZS-011 (`spec/domain-model.md` §4); [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md).

## 5. Morocco-specific considerations

1. **The ESISE platform.** Regulatory statistics go through ESISE (sise.men.gov.ma), which as of 09/09/2026 offers three applications "under review": private-school census, HR referential, year-end results. No public API exists: the channel stays manual Excel import/export, hence the choice to prepare and check data in RAP (BEH-ZS-251) and produce the files in MAS. The divergence with the historical baseline (which mentions "private-school census, HR referential, May census") is recorded in OQ-ZS-141.
2. **School calendar and periods.** The year runs from September to June, with assessment periods in semesters or trimesters depending on the school (including the bilingual pilot school in trimesters, [ADR-ZS-035](../decisions/035-pilot-school-profiles.md)); RAP's period filters follow each school's configuration (INV-ZS-074). The May ESISE census and year-end results fall respectively during the re-enrollment campaign period and in June: data preparation must be available starting in April.
3. **Time zone.** Decree no. 2.26.530 (Official Gazette no. 7521 of 06/29/2026): a definitive return to UTC+0 on 09/20/2026, with no seasonal alternation or Ramadan exception. The day boundaries of daily indicators are computed in the `Africa/Casablanca` time zone at fixed UTC+0, with storage in UTC; "reduced Ramadan hours" stay a timetable (pedagogical) variant, not a time-zone matter.
4. **Six-day school week.** The school week runs Monday to Saturday, Saturday morning staying a working day depending on the school's configuration: weekly reports and "for the week" counters follow the school calendar's definition of a week.
5. **Bilingualism and dual script.** Dashboards and PDF exports are available in French and Arabic with RTL support (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`); people's names appear in dual script ([ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)) and statistical exports reuse the script required by ministerial forms.
6. **Massar code and national matching.** Statistical headcounts distinguish students with and without a filled-in Massar code (INV-ZS-054, code not mandatory) to prepare the matching required by ministerial forms; the count stays internal and code-enumeration protection applies.
7. **Moroccan multi-site context.** School groups operate several sites with separate leadership and consolidated accounting: the cross-site comparison (BEH-ZS-249) answers this reality without merging tenants, each site remaining a full-fledged filer with its own AREF and provincial education office (INV-ZS-074).

## 6. Data and events

The RAP module creates no new canonical entity: it reads and aggregates the schema detailed in `spec/domain-model.md`.

| Source domain | Entities read by RAP | Indicators produced |
|---|---|---|
| Relations | `Enrollment`, `StudentClassHistory`, `TeacherAssignment`, `SchoolMembership` (including qualification as declared to the employer) | Headcount by level/class/regime; re-enrollment rate; teachers' operational activity; ESISE HR referential (never from `TeacherProfile`) |
| Academic | `AttendanceRecord`, `Justification`, `Dispensation` | Today's and period attendance; absences, tardiness, pending justifications |
| Academic | `Assessment`, `Mark`, `PeriodResult`, `YearDecision`, `ConductGrade` | Results by subject and class; averages; honors; distribution; ESISE year-end results |
| Discipline | `Incident`, `Sanction` (V1) | Ongoing incidents, severity; today's student-life tracking |
| Finance | `Invoice`, `Installment`, `Payment`, `FinancialAccount`, `Dunning` | Unpaid balances by class/guardian; outstanding amounts; aging; effect of reminders |
| School | `School`, `Organization`, `Campus`, `AcademicYear`, `EvaluationPeriod`, `Cycle`, `Level`, `Class`, `Subject`, `Room`, declared sessions (MVP), `Timetable`, `TimetableSlot`, `ScheduleVariant` (V1) | Breakdown scopes; expected sessions (attendance-rate denominator); room occupancy; period/year filters; group consolidation |
| Communication | `Notification`, `DeliveryLog` | Absence-notification statuses (sent, delivered, read) shown on the student-life dashboard |

To meet performance targets on aggregates recomputed on every open, indicators rely on pre-computed aggregates refreshed by domain events — an implementation choice serving observable behavior, with no extra entity in the logical model.

| Consumed event | Effect on dashboards | Reference |
|---|---|---|
| `AttendanceRecorded`, `JustificationSubmitted`, `JustificationValidated` | Updates today's absences, pending justifications, and the attendance rate | `spec/domain-model.md` §7 |
| `AbsenceThresholdReached` | A counter of students at the threshold (the alert display stays carried by VSC) | idem |
| `IncidentRecorded`, `SanctionNotified` (V1) | Ongoing incidents on the student-life dashboard | idem |
| `PeriodClosed`, `ReportCardPublished` | Results by subject available; averages visible on teacher/parent/student dashboards | idem |
| `EnrollmentStatusChanged` | Actual (ACTIVE) headcount and campaign re-enrollment rate | idem |
| `InstallmentOverdue`, `ReminderSent`, `PaymentReceived` | Unpaid balances, outstanding amounts, the effect of reminders | idem |
| `ClassChanged` | Up-to-date breakdown of headcount by class (via `StudentClassHistory`) | idem |

## 7. Screens

Screens are described textually; mobile-first, light/dark themes, bilingual FR/AR labels with full RTL support (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`). Detailed lists reached by drill-down belong to the source modules: RAP does not redefine them.

- **SCR-ZS-131 — Leadership dashboard (school).** Header zone: context selector, school-year and period selectors, data-freshness timestamp, access to advanced filters and export (BEH-ZS-242, BEH-ZS-250). Indicator zone in stacked cards on mobile, a grid on large screens: actual headcount, attendance rate, outstanding unpaid balances, results for the last closed period, a summary of pending entries. States: loading, partial data, empty. Behavior: refreshes on open and on incoming events; every card respects the role's permissions (BEH-ZS-253).
- **SCR-ZS-132 — Consolidated organization view (cross-site comparison).** An organization selector; a cross-table of indicators per school with a group-total row (MVP, consolidated read view) and a relative-gap column against the group average (V1); a day/week/period/year switch. A school row expands into a summary mini-dashboard; a link to the school's full dashboard only for accounts authorized within that tenant. Indicators without group permission are absent, never shown as zero.
- **SCR-ZS-133 — Today's student-life dashboard.** Today's view, scoped to assigned cycles: a top counter band; a main list of absences by class with time slot, justification status, and family-notification status; tardiness and ongoing-incident tabs; a distinct "attendance pending" signal. Quick per-row actions: open the student record, follow up on a justification, contact the guardian via the COM module.
- **SCR-ZS-134 — Teacher dashboard.** The teacher's daily schedule; a "pending entries" block; an "my averages" block by class and subject per the publication state; for the homeroom teacher, a "my class" tab with a class summary. Nothing outside the scope of active assignments.
- **SCR-ZS-135 — Multi-child, multi-school parent view (indicators and aggregates).** Grouping by school; within each section, a card per child carrying the moment's aggregates; an account header. Selecting a card: the child's view in their school context; switching with no re-authentication. Adult-student-with-restriction case: a card showing "access restricted by the student" while keeping financial indicators for the financial guardian who remains the payer.
- **SCR-ZS-136 — Student view (indicators and aggregates).** Latest published grades by subject, published period average, personal absences and tardiness with justification status, recent documents and announcements. No comparison with other students outside a scale published by the school.
- **SCR-ZS-137 — Report and export builder.** A single screen for producing a report: choosing the report type, filters, the format (Excel, CSV, PDF), and the orientation. A preview of the first rows before production; a reminder of effective permissions; the account's export history with re-download. Every export is logged starting in V1.
- **SCR-ZS-138 — Preparing ESISE regulatory statistics.** A list of datasets by ESISE application with status and an indicative deadline. Dataset detail: a field-by-field mapping table, a filter on anomalies with a link back to source records; consistency checks. Actions: prepare/recompute, mark ready for submission, a link to MAS for generating and submitting the file.
- **SCR-ZS-139 — Scheduled reports.** A list of schedules; creation/editing: choice of report type, frequency, scope and filters, internal recipients, notification channels; a history of runs. Shown constraints: the school calendar's non-working days, internal recipients only.

## 8. Integrations

The RAP module consumes no external integration directly; it relies on:

| Need | Integration | Reference |
|---|---|---|
| Notification of scheduled-report availability and email distribution | Internal in-app channels and INT-EML | `spec/cross-cutting/06-external-integrations.md`; COM module (`spec/behaviors/08-communication-notifications.md`) |
| Production and submission of ESISE and Massar files | The file channel (Excel import/export, no API) | `spec/cross-cutting/06-external-integrations.md`; `spec/behaviors/12-massar-regulatory-exports.md` |
| Career data used for the ESISE HR referential | Reading `SchoolMembership` only; never `TeacherProfile` ([ADR-ZS-064](../decisions/064-teacher-career-rules.md)) | `spec/behaviors/10-teacher-career-network.md` |

No outbound flow to Massar or ESISE is automated; every submission stays a documented human action.

## 9. Module-specific non-functional requirements

References to the domains carried by `spec/cross-cutting/03-non-functional-requirements.md` (without renumbering):

| Domain | Application to the RAP module |
|---|---|
| PERF (performance) | Dashboard pages under 2 s on 4G; pre-computed aggregates refreshed by events; exporting a 2,000-student school handled in acceptable batches without blocking the interface |
| DISP (availability) | Today's dashboards stay viewable as the last computed value with a timestamp if recomputation is unavailable; target availability 99.5% outside maintenance |
| MOB (mobile) | Leadership and student-life dashboards usable on mobile between sites and while walking the halls; touch targets and card stacking matching mobile-first UX |
| I18N (languages) | FR/AR with full RTL, English in V2; bilingual indicator labels; dual script in lists and exports |
| OFF (offline) | The dashboard is not an offline feature: in a dead zone, the last computed view stays shown in read mode with a "data as of [timestamp]" band; entry stays offline on the VSC/EVA side |
| DOC (documents) | Bilingual PDF exports, correct Arabic fonts, A4/A5, batch printing |
| OBS (observability) | Aggregate freshness, computation time, and recomputation errors tracked per tenant; logging of sensitive views and exports (V1 — minimal entry logging at MVP) |
| RES (volumetry) | Sized for 500 schools, 500,000 students: consolidated organization views and exports stay linear in school size, never in platform size |
| Interoperability | Excel/CSV/PDF exports everywhere; a stable, documented CSV structure for re-import into schools' tools |

Security: systematic server-side control of the tenant key on every indicator and every export (INV-ZS-001, INV-ZS-073); no aggregate may allow reconstructing a forbidden data point (BEH-ZS-253); exports protected by an authenticated link (no public link).

## 10. Success metrics

The catalog and numbering of success indicators fall under `spec/metrics.md`; this chapter creates no `KPI-ZS-NNN` identifier of its own (the indicators below, not yet catalogued, are created there; KPI-ZS-019 and KPI-ZS-020 reuse BEH-ZS-241's attendance-rate definition). Behaviors to instrument within RAP, made available to that catalog:

- Adoption: share of leadership viewing the dashboard at least three days a week; share of supervisors opening the daily view before 10 a.m.; export usage frequency.
- Effectiveness: reduction in the delay between an attendance check and leadership's awareness of absences; share of scheduled weekly reports actually produced and opened.
- Collections: change in outstanding unpaid balances and average settlement time after the unpaid-balance dashboard and reminders are put in place.
- Compliance: ESISE dataset completion rate at first check; number of blocking anomalies detected before submission; deadlines met.
- Data quality: share of schools with published timetables; rate of attendance checks validated on time.

## 11. Open questions

Open questions for this module (OQ-ZS-141 through OQ-ZS-147 in the migrated source, covering the exact content of the ESISE applications, the standardized attendance-rate definition — resolved, see [ADR-ZS-065](../decisions/065-reporting-and-capacity-definitions.md) — the closed list of teacher-activity indicators, the scope of organization-level financial indicators, the version for scheduled reports, the version for group consolidation — resolved, see [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md) — and the version timing for logging views of sensitive data — resolved, see [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
