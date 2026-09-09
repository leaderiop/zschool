> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-05                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification                                       |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/14-assessments-grades-report-cards.md` (v0.3), old `FR-EVA-01..19` -> `BEH-ZS-111..129`, old `ECR-EVA-01..09` -> `SCR-ZS-061..069`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Assessments, Grades and Report Cards (EVA)

## 1. Objective and scope

**Objective.** Cover the full assessment cycle, from the assessment reference framework to family consultation: configuration of assessment types, periods and calculation rules compliant with the Moroccan national reference framework; grade entry by teachers on web and mobile, resilient to connectivity gaps; compliance check against the national reference framework before closing; locking by the school leadership; integration of certifying-exam grades; end-of-year decisions and class-council minutes; bilingual report cards, published and immutable (QR-code verification in V1, [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)); annual and cumulative transcripts for post-baccalaureate files. The MVP calculation rules (markers, grading scales, ungraded subjects, class changes, rank exclusion) are set by [ADR-ZS-058](../decisions/058-grading-calculation-rules-mvp.md). The reference journey is JMP-ZS-006 (`spec/journeys/00-journey-map.md`, built in Phase 3).

**In scope:**

| Item | Version |
|---|---|
| Configurable assessment types with grading scale, weighting and period | MVP |
| Assessment periods: semesters (national default) or trimesters (sections following the French reference framework), sub-periods; trimester -> Massar semester mapping | MVP (OQ-ZS-084 resolved) |
| Web and mobile grade entry, drafts, offline mode with synchronization | MVP |
| Period closing and locking of entries by the school leadership | MVP |
| Configurable calculation rules and computation of averages, ranks, honors | MVP |
| Default national weightings, versioned by school year, traced on the report card | MVP |
| Certifying-exam grades: manual entry | MVP |
| Bilingual report cards, templates, seal, signature, publication, immutability, versioning | MVP |
| Compliance check against the national reference framework before closing (alert, then blocking with justified waiver) | MVP (informational warning without blocking, BEH-ZS-116); V1 (blocking with justified waiver) |
| MVP calculation rules: absent, exempted and ungraded markers; normalization of grading scales to 20; ungraded subject marked "NG"; class change mid-period; rank exclusion; trimester -> Massar semester mapping | MVP |
| Structured import of certifying-exam results | V1 |
| End-of-year decisions, general remarks and simplified minutes (BEH-ZS-123) | MVP (wave 2 -- year-end closing, RDM-ZS-003) |
| Full class council: file preparation (BEH-ZS-122) | V1 |
| Verification QR code for report cards and transcripts | V1 |
| Annual transcript | MVP (wave 2 -- year-end closing, RDM-ZS-003) |
| Multi-year cumulative transcript (post-baccalaureate) | V1 |
| Progressive publication of detailed grades to families (configurable option, default: published with the report card) | MVP (URS-ZS-035) |

**Out of scope (covered elsewhere):**

| Item | Owning file |
|---|---|
| Periods, grading scales and weightings as elements of the academic structure (creation, cloning from year N to N+1) | `spec/behaviors/03-academic-structure-timetables.md` |
| Production of the conduct grade, incidents and disciplinary councils | `spec/behaviors/04-attendance-student-life-discipline.md` (this module reproduces the configured conduct grade on the report card) |
| Notification channels and templates, SMS/WhatsApp costs | `spec/behaviors/08-communication-notifications.md` |
| Dashboards and results statistics | `spec/behaviors/11-dashboards-reporting.md` |
| Massar exports of continuous-assessment grades, pre-submission validation, ESISE mirror | `spec/behaviors/12-massar-regulatory-exports.md` |
| Fine-grained permissions, logging, UX and RTL, detailed NFRs, numbered metrics | `spec/cross-cutting/01-permissions.md`, `spec/cross-cutting/03-non-functional-requirements.md`, `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`, `spec/metrics.md` |
| Online homework and lightweight e-learning (resources, electronic submissions) | V2+ |
| Letter grades and GPA for advanced international sections (`GradingScale`) | V2+ |
| Qualified seal and timestamp via a DGSSI-approved provider | V2 ([ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md); `spec/cross-cutting/06-external-integrations.md`) |

## 2. Users and use cases

Effective rights derive from the fine-grained permissions of `spec/cross-cutting/01-permissions.md` (INV-ZS-091, INV-ZS-011): a teacher only accesses students in their own courses, and the permission matrix distinguishes unpublished grades (write: the course teacher; read: school leadership) from published report cards.

| User | Main use cases |
|---|---|
| Teacher | Creates assessments within their subject and classes; enters grades and remarks on mobile in class or in the evening, including offline; views their classes' averages; receives the lock notice at closing (-> URS-ZS-028, URS-ZS-033). |
| Homeroom teacher | Has the class summary view: averages, ranks, absences and conduct, in preparation for the class council. |
| School leadership (director, academic leadership) | Configures assessment types, periods, calculation rules and weightings; monitors compliance with the national reference framework; closes and locks periods; chairs the class council and records decisions; publishes report cards, corrects them via a new version, issues transcripts (-> URS-ZS-006, URS-ZS-008). |
| Head supervisor | Feeds the council file (absences, tardiness, conduct); views published report cards for their assigned cycles (-> URS-ZS-024). |
| Front desk | Views and prints published report cards on request from families at the front desk; no write access to grades. |
| Parent / guardian (PAR, GAR) | Receives the publication notification; views the report card and, depending on the school's settings, grades published as they are entered; downloads transcripts (-> URS-ZS-035, URS-ZS-044). The custodial parent has equal access to the legal guardian (INV-ZS-065). |
| Student (ELE) | Views published grades and report cards through the access activated by their guardians; an adult student downloads their annual and cumulative transcripts for post-baccalaureate applications (-> URS-ZS-053, URS-ZS-056). |

## 3. Key journeys

The critical journey JMP-ZS-006 -- Grade entry, class council, report-card publication (`spec/journeys/00-journey-map.md`, built in Phase 3) structures this module: continuous weekly entry in normal operation, closing peaks at the end of each period (two closings for semesters, three for the [ADR-ZS-035](../decisions/035-pilot-school-profiles.md) pilot school running on trimesters), import of certifying-exam results in June. Detailed steps live in `spec/journeys/` once built: JNY-ZS entries for the teacher (evening entry, context switching between schools), the director (closing, council, publication), the parent and custodial mother (viewing, notification), and students Youssef and Salma (report card, post-bac transcripts).

Upstream dependencies: periods and weightings carried by the academic structure (`spec/behaviors/03-academic-structure-timetables.md`, INV-ZS-076 to INV-ZS-078); conduct supplied by `spec/behaviors/04-attendance-student-life-discipline.md`. Downstream dependencies: notifications (`spec/behaviors/08-communication-notifications.md`), Massar exports (`spec/behaviors/12-massar-regulatory-exports.md`), end-of-year decisions consumed by the rollover (JMP-ZS-002, `spec/behaviors/02-admissions-enrollment-reenrollment.md`).

## 4. Functional behaviors

| ID | Title | Priority | Version |
|---|---|---|---|
| BEH-ZS-111 | Configure assessment types | Must | MVP |
| BEH-ZS-112 | Configure assessment periods per section | Must | MVP |
| BEH-ZS-113 | Enter grades by subject and class on web and mobile, with drafts | Must | MVP |
| BEH-ZS-114 | Enter grades offline and synchronize | Must | MVP |
| BEH-ZS-115 | Close the period and lock entries by the school leadership | Must | MVP |
| BEH-ZS-116 | Check compliance with the national reference framework before closing | Should | MVP (warning) / V1 (blocking) |
| BEH-ZS-117 | Configure calculation rules | Must | MVP |
| BEH-ZS-118 | Provide default national weightings, versioned by year and traced on the report card | Must | MVP |
| BEH-ZS-119 | Compute averages, ranks and honors per period and for the year | Must | MVP |
| BEH-ZS-120 | Manually enter certifying-exam grades | Must | MVP |
| BEH-ZS-121 | Import certifying-exam results with a validation report | Should | V1 |
| BEH-ZS-122 | Prepare the class council | Should | V1 |
| BEH-ZS-123 | Record council remarks and decisions and produce the minutes | Must | MVP (wave 2) / V1 (full council) |
| BEH-ZS-124 | Generate bilingual report cards from configurable templates | Must | MVP |
| BEH-ZS-125 | Publish report cards to families with immutability and versioning | Must | MVP |
| BEH-ZS-126 | Verify report-card and transcript authenticity by QR code | Must | V1 |
| BEH-ZS-127 | Correct a published report card by creating a new version | Must | MVP |
| BEH-ZS-128 | Issue annual and cumulative transcripts | Must | MVP (wave 2 annual) / V1 (cumulative) |
| BEH-ZS-129 | Publish detailed grades progressively (option) | Must | MVP |

### BEH-ZS-111: Configure assessment types

> **Invariant:** none directly cited
> **See:** none directly cited
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-099`](../../features/eva/fr-eva-01-assessment-types.feature)

REQUIREMENT: The school MUST be able to define, per section and per cycle, a library of assessment types (continuous assessment, supervised assignment, composition/exam, mock exam, unified school exam, oral exam, project), each carrying a grading scale, a weighting, and a mandatory link to an assessment period. Assessment creation MUST be limited to the teacher's assigned courses (INV-ZS-091).

The school defines, per section and per cycle, a library of assessment types among: continuous assessment (class test), supervised assignment, composition/exam, mock exam, unified school exam, oral exam, project. Each type carries a grading scale (scale and grading increment, default: out of 20 with decimals), an assessment weighting and a mandatory link to an assessment period. An assessment (`Assessment` entity) is created per subject, class **or group** (clarification carried in the dictionary of `spec/domain-model.md`) and per period, within the limits of the teacher's assigned courses (INV-ZS-091). The "local unified exam" for certifying levels (organized by the school at the end of semester 1) is a type within this library: it is entered as an internal assessment and is never re-entered as an external grade (BEH-ZS-120 covers only the regional and national exams).

### BEH-ZS-112: Configure assessment periods per section

> **Invariant:** INV-ZS-076, INV-ZS-077 ([spec/invariants.md](../invariants.md))
> **See:** none directly cited
> **Priority:** Must
> **Version:** MVP (bilingual trimester pilot, [ADR-ZS-035](../decisions/035-pilot-school-profiles.md); OQ-ZS-084 resolved)
> **Acceptance:** [`@REQ-ZS-100`](../../features/eva/fr-eva-02-assessment-periods-per-section.feature)

REQUIREMENT: Each section MUST define its own assessment periods (`EvaluationPeriod`), with dates bounded within the school-year calendar. Structure cloning from year N to N+1 MUST reproduce periods without grades (INV-ZS-077). When a section runs on trimesters, the school MUST configure a period -> Massar-semester mapping.

Each section (education system) defines its own assessment periods (`EvaluationPeriod` entity): two semesters for the default national model, three trimesters for sections following the French reference framework or bilingual sections running on trimesters, with optional sub-periods (tests, exams, mock exams). Periods carry dates bounded within the school-year calendar, a status (open, closed) and a closing history. The templates provided at instantiation (national, French mission, international) pre-configure these periods (INV-ZS-076), and cloning from year N to N+1 reproduces them without the grades (INV-ZS-077). **Mapping to Massar semesters:** when a section runs on trimesters, the school configures the period -> Massar-semester mapping table (default: T1 -> S1; T2 -> S1 until the end date of semester 1 in the ministry calendar, then S2; T3 -> S2); the exported semester averages (BEH-ZS-264, `spec/behaviors/12-massar-regulatory-exports.md`) are recomputed from dated grades, with no double entry.

### BEH-ZS-113: Enter grades by subject and class on web and mobile, with drafts

> **Invariant:** INV-ZS-081, INV-ZS-034 ([spec/invariants.md](../invariants.md))
> **See:** none directly cited
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-101`](../../features/eva/fr-eva-03-draft-grade-entry.feature)

REQUIREMENT: Grades MUST be entered in draft mode: each `Mark` MUST carry a draft or published status, and MUST NOT be visible to families or other teachers until published. Every write MUST carry the author, date and context, and MUST be linked to the enrollment.

The teacher enters the grades of an assessment for the students in their class or group, on the web (desktop) and on mobile: student list, numeric value validated against the grading scale, absent/exempted/ungraded markers, an optional short remark per student (`Mark` entity). Entry happens in draft mode: each `Mark` carries a **draft** or **published** status; nothing is visible to families or other teachers until the grade is published, either when the report card is published or on an ongoing basis if the school has enabled it (BEH-ZS-129) (INV-ZS-081, INV-ZS-034). Every write carries the author, date and context (INV-ZS-079, INV-ZS-090) and is linked to the enrollment ([ADR-ZS-029](../decisions/029-academic-data-always-tied-to-enrollment.md), INV-ZS-036). Averages are recomputed on every save.

### BEH-ZS-114: Enter grades offline and synchronize

> **Invariant:** none directly cited
> **See:** `spec/cross-cutting/03-non-functional-requirements.md` (NFR-OFF domain, built in Phase 4)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-102`](../../features/eva/fr-eva-04-offline-grade-entry.feature)

REQUIREMENT: Mobile grade entry MUST tolerate network outages: offline grades MUST be kept locally as drafts and synchronized once the network returns, with conflict resolution favoring the most recent timestamped write and an alert on overwrite.

Mobile grade entry tolerates network outages: grades entered offline are kept locally as drafts and synchronized once the network is back, with conflict resolution (most recent timestamped write wins, with an alert if a value entered elsewhere is overwritten). Offline mode covers creating and completing assessments that were already planned; the screen constantly shows the number of grades pending synchronization. This requirement implements the baseline's offline requirement for grade entry, on the same footing as attendance taking.

### BEH-ZS-115: Close the period and lock entries by the school leadership

> **Invariant:** INV-ZS-085, INV-ZS-090 ([spec/invariants.md](../invariants.md))
> **See:** none directly cited
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-103`](../../features/eva/fr-eva-05-period-closing-and-locking.feature)

REQUIREMENT: The school leadership MUST be able to close an assessment period, class by class then globally; at closing, all assessments and grades for the period MUST become read-only for teachers. Reopening MUST be reserved to the school leadership, justified, dated and logged.

The school leadership closes an assessment period, class by class then globally: at closing, all assessments and grades for the period become read-only for teachers; the `PeriodClosed` event is emitted (teachers, school leadership). Any reopening is reserved to the school leadership, must be justified, dated and logged (INV-ZS-090); it re-locks the period at re-closing. Once report cards are published, a correction never modifies the published report card: it goes through a new version (BEH-ZS-127). At the MVP stage, closing is never blocked by a compliance check: the informational warning produced by BEH-ZS-116 lists apparent gaps; blocking with a justified waiver arrives in V1.

### BEH-ZS-116: Check compliance with the national reference framework before closing

> **Invariant:** none directly cited
> **See:** `spec/behaviors/08-communication-notifications.md`
> **Priority:** Should
> **Version:** MVP (informational warning, no blocking); V1 (blocking with justified waiver)
> **Acceptance:** [`@REQ-ZS-104`](../../features/eva/fr-eva-06-compliance-check.feature)

REQUIREMENT: Before each semester closing, the system MUST check, per subject and per class, the national continuous-assessment minimum (at least two class tests and one unified school test per subject and per semester, except in the second semester of exam years) and surface any gap.

Before each semester closing, the system checks, per subject and per class, the national continuous-assessment minimum: at least two class tests and one unified school test per subject and per semester, except in the second semester of exam years (certifying levels 6AP, 3AC, 1st and 2nd year of baccalaureate; exact scope of the waiver: OQ-ZS-085). A subjects x classes compliance table is available at all times; as the period end approaches, the school leadership and the teachers concerned receive an alert listing the gaps. At the MVP stage, the check produces the informational warning consumed by BEH-ZS-115; in V1, closing is blocked on non-compliance unless the school leadership records a justified, logged waiver. This count is unique: BEH-ZS-266 (`spec/behaviors/12-massar-regulatory-exports.md`) refers back to it and never recomputes it. The required minimum (number of tests, list of admissible types, waivers) is configurable per level.

### BEH-ZS-117: Configure calculation rules

> **Invariant:** INV-ZS-078, INV-ZS-014 ([spec/invariants.md](../invariants.md))
> **See:** [ADR-ZS-058](../decisions/058-grading-calculation-rules-mvp.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-105`](../../features/eva/fr-eva-07-marker-and-grading-scale-rules.feature)

REQUIREMENT: The school MUST be able to configure, per level and per track, the subject-average and overall-average calculation, rounding, lowest-grade exclusion, honors, ranking and thresholds. An unjustified absence MUST count as 0 by default; a grading scale other than 20 MUST be normalized to 20 before weighting; an ungraded subject at closing MUST be excluded from the overall average and marked "NG".

The school configures, per level and per track (`ComputationRule` entity): the subject-average calculation (weighting assessments by their weightings), the overall average (weighting subjects by the weightings carried on `SubjectLevelConfig`, never globally -- INV-ZS-078, INV-ZS-014), rounding rules (number of decimals, rounding mode), the optional exclusion of the lowest grade beyond a given number of grades, honors, the ranking method, and alert or decision thresholds (admission, resit, failure). National templates pre-configure these rules at instantiation (INV-ZS-076); the annual clone reproduces them (INV-ZS-077, INV-ZS-013). Any change made during the school year is versioned and logged; it does not affect periods already closed. **Processing rules ([ADR-ZS-058](../decisions/058-grading-calculation-rules-mvp.md)):** (a) markers -- an unjustified absence at an assessment counts as 0 by default (configurable: 0 or exclusion); a justified absence, exemption and non-graded status are excluded from the average's denominator; (b) any grading scale other than 20 is normalized to 20 before weighting; (c) a subject with no grade at all at closing is excluded from the overall average and marked "NG" (not graded) on the report card, without neutralizing the weighting of the other subjects; (d) in the event of a class change mid-period (INV-ZS-061, INV-ZS-025), grades stay attached to the enrollment and the rank is computed within the current class at closing.

### BEH-ZS-118: Provide default national weightings, versioned by year and traced on the report card

> **Invariant:** INV-ZS-077 ([spec/invariants.md](../invariants.md))
> **See:** [ADR-ZS-059](../decisions/059-6ap-provincial-exam-label.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-106`](../../features/eva/fr-eva-08-default-national-weightings.feature)

REQUIREMENT: For certifying levels, the system MUST pre-configure the official weightings between continuous assessment and external exams, versioned by school year, each carrying its text reference; that reference and the applicable weighting table MUST appear in full on the report card.

For certifying levels, the system pre-configures the official weightings between continuous assessment and external exams, versioned by school year: 6AP 50% continuous assessment / 25% local unified exam / 25% provincial exam; 3AC 30% continuous assessment (15% + 15% per semester) / 30% local unified exam / 40% regional exam; baccalaureate 25% continuous assessment / 25% regional exam (end of year 1) / 50% national exam (end of year 2). Each weighting set carries its text reference (the text organizing the exam, as configured); that reference and the applicable weighting table appear in full on the report card. The "provincial exam" label for 6AP follows the historical baseline's wording (`spec/appendices/00-project-baseline.md` §2.2); pedagogy research says "regional" -- a divergence flagged by the research ([ADR-ZS-059](../decisions/059-6ap-provincial-exam-label.md)), with the decree reference still to be recorded (OQ-ZS-081). Weightings remain editable per level, track, section and year (possible AREF variants); version history is kept, with the exceptional 2021-2022 variant (6AP 75/25, 3AC 50/50) serving as an example of a historized version.

### BEH-ZS-119: Compute averages, ranks and honors per period and for the year

> **Invariant:** none directly cited
> **See:** `spec/behaviors/04-attendance-student-life-discipline.md` (BEH-ZS-102)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-107`](../../features/eva/fr-eva-09-period-average-computation.feature)

REQUIREMENT: The system MUST compute and store, per the configured rules, the subject average, weighted overall average, class rank (with ties handled), honors level, and annual results in `PeriodResult`. A student flagged "excluded from rank" MUST keep their averages, have no rank, and not count in the class ranking's denominator.

The system computes, per the configured rules (BEH-ZS-117), and stores in `PeriodResult`: the subject average, the weighted overall average, the class rank (with ties handled), the honors level, and the annual results (average of the periods, equal-weighted by default, with period weighting configurable via BEH-ZS-117). Honors levels follow the historical baseline's thresholds for the baccalaureate (highest distinction from 16; distinction from 14; merit from 12; pass from 10; resit between 8 and 9.99) and are configurable for other cycles. Calculations run continuously during the period, are frozen at closing, and also apply to external-exam grades to produce the weighted summaries for certifying levels. The rounding rule and weightings used are restated on the report card. The calculation applies the rules from BEH-ZS-117 (markers, normalization of grading scales to 20, "NG" subject excluded, rank within the current class). **Rank exclusion:** `PeriodResult` carries an "excluded from rank" flag set per the school's configuration (late arrival, extended exemption, a student-life decision -- BEH-ZS-102 in `spec/behaviors/04-attendance-student-life-discipline.md` refers back to it); a student excluded keeps their averages, has no rank and does not count in the denominator of their class's ranking; the report card shows "unranked".

### BEH-ZS-120: Manually enter certifying-exam grades

> **Invariant:** none directly cited
> **See:** none directly cited
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-108`](../../features/eva/fr-eva-10-manually-entered-certifying-exam-grades.feature)

REQUIREMENT: For certifying levels, the school MUST be able to record external-exam grades (provincial, regional, national) manually upon receipt. Each grade MUST carry the session, subject, source and entry author, and MUST NOT be editable after the period closes without the unlock procedure.

For certifying levels, the school records external-exam grades into the student's average: provincial exam (6AP), regional exam and national exam (results sent by the ministry, entered manually upon receipt). The local unified exam, organized by the school at the end of semester 1, is an internal assessment entered via BEH-ZS-111 and BEH-ZS-113: it is never re-entered here (a single model). Each grade carries the session, the subject, the source (school or ministry) and the entry's author; it cannot be edited after the period closes, nor overwritten by a later import without validation (BEH-ZS-121). These grades feed the weighted summaries of BEH-ZS-119.

### BEH-ZS-121: Import certifying-exam results with a validation report

> **Invariant:** none directly cited
> **See:** `spec/behaviors/12-massar-regulatory-exports.md`
> **Priority:** Should
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-109`](../../features/eva/fr-eva-11-import-certifying-exam-results.feature)

REQUIREMENT: Bulk import of certifying-exam results MUST be all-or-nothing per batch, with student matching by Massar code (preferred, [ADR-ZS-015](../decisions/015-massar-code-as-preferred-matching-key.md)) falling back to name and date of birth, and MUST produce a line-by-line error report before confirmation with no silent partial import.

The school bulk-imports certifying-exam results from a structured file (format of ministry and Massar templates, file channel -- no API): student matching by Massar code (preferred matching key, [ADR-ZS-015](../decisions/015-massar-code-as-preferred-matching-key.md)) with a fallback to last name, first name and date of birth, consistency checks (subject, session, grading scale), a line-by-line error report before confirmation, and all-or-nothing import per batch. No silent partial import: rejected lines are listed with a reason; the file and the report are kept as audit records. Since ministry file structures are not publicly documented, column mapping is configurable and reusable per format (see OQ-ZS-087).

### BEH-ZS-122: Prepare the class council

> **Invariant:** INV-ZS-081 ([spec/invariants.md](../invariants.md))
> **See:** none directly cited
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none -- no Gherkin scenario in the source PRD for this requirement

REQUIREMENT: The system MUST assemble, per class and period, the class-council file (subject and overall averages, rank, change from the previous period, absences, tardiness, conduct grade, remarks, observations), staying internal until deliberation.

For each class and period, the system assembles the class-council file: per student, subject and overall averages, rank, change from the previous period, absences and tardiness (drawn from `spec/behaviors/04-attendance-student-life-discipline.md`), conduct grade, per-subject remarks, observations; for the class, averages and distribution, attendance rate. The homeroom teacher pre-enters an opinion and proposals; the school leadership prepares the agenda (promotion, track guidance at the end of 3AC and of the common core, disciplinary cases linked to student life). The file stays internal until deliberation (INV-ZS-081).

### BEH-ZS-123: Record council remarks and decisions and produce the minutes

> **Invariant:** INV-ZS-059, INV-ZS-090 ([spec/invariants.md](../invariants.md))
> **See:** [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)
> **Priority:** Must
> **Version:** MVP (wave 2 -- year-end closing, RDM-ZS-003: decisions, general remarks, simplified minutes); V1 (full class council with BEH-ZS-122)
> **Acceptance:** [`@REQ-ZS-110`](../../features/eva/fr-eva-13-end-of-year-decisions.feature)

REQUIREMENT: Following deliberation, the school leadership MUST record the general remark per student and the end-of-period decision; at year end, `YearDecision` MUST be logged with author and timestamp and MUST feed the N+1 rollover.

Following deliberation, the school leadership records: the general remark per student, the end-of-period decision, and, at year end, the decision carried by `YearDecision` (promoted to the next level, repeating the year, graduated, tracked into a program, undetermined -- INV-ZS-059) with, for track guidance, the requested and awarded track. Decisions are logged with author and timestamp (INV-ZS-090). The council minutes are generated as a bilingual document, archived in the class file, and end-of-year decisions feed the N+1 rollover (JMP-ZS-002, BEH-ZS-041 in `spec/behaviors/02-admissions-enrollment-reenrollment.md`) and the grade shown on the report card. **Certifying levels:** the decision entered at the June rollover is "undetermined" until exam results are known; it is updated (promoted, graduated, repeating) once results are entered or imported (BEH-ZS-120, BEH-ZS-121, BEH-ZS-270), before the grace period of the COMPLETED enrollment ends (INV-ZS-024), with the update kept traceable. At the MVP stage (wave 2), the requirement covers entering decisions and general remarks per class and the simplified minutes (a signed list of decisions); full council-file preparation (BEH-ZS-122) and detailed minutes arrive in V1.

### BEH-ZS-124: Generate bilingual report cards from configurable templates

> **Invariant:** none directly cited
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md); `spec/behaviors/06-documents-certificates.md`
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-111`](../../features/eva/fr-eva-14-generation-of-bilingual-report-cards.feature)

REQUIREMENT: Report-card templates MUST exist in French, Arabic and bilingual versions (RTL Arabic layout), and generation MUST produce a bilingual PDF compliant with document requirements, showing weightings, grades, average, rank, honors, remarks, conduct grade, attendance summary, and seal/signature zones.

The school configures report-card templates per cycle and section: header (school, year, period, class, headcount), student identity in dual French/Arabic script ([ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)), subject tables with weightings, per-period grades and average, overall average, rank, honors, per-subject and general remarks, conduct grade where applicable (produced by `spec/behaviors/04-attendance-student-life-discipline.md`), attendance summary, applicable weighting table and text reference (BEH-ZS-118), seal and school-leadership signature zones. Each template exists in French, Arabic and bilingual versions (right-to-left Arabic layout). Generation produces a bilingual PDF document compliant with the document requirements (`spec/cross-cutting/03-non-functional-requirements.md`) and the rules of the documents module (`spec/behaviors/06-documents-certificates.md`): A4 and A5 formats, Arabic fonts, batch printing. "NG" subjects and exemptions appear with their notation (BEH-ZS-117).

### BEH-ZS-125: Publish report cards to families with immutability and versioning

> **Invariant:** INV-ZS-080, INV-ZS-085, INV-ZS-016 ([spec/invariants.md](../invariants.md))
> **See:** [ADR-ZS-020](../decisions/020-immutable-versioned-report-cards.md), [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-112`](../../features/eva/fr-eva-15-publication-of-period-report-cards.feature)

REQUIREMENT: Each published report card MUST become immutable (version, fingerprint, signatory, publication date frozen), MUST remain permanently readable by the student and their guardians even after leaving the school, and MUST NEVER be blocked for unpaid balances.

The school leadership publishes report cards by class then by period: each published report card becomes immutable -- version, fingerprint, signatory, publication date frozen (INV-ZS-085, [ADR-ZS-020](../decisions/020-immutable-versioned-report-cards.md)) -- and the student and their authorized guardians are notified (`ReportCardPublished` event, notification via `spec/behaviors/08-communication-notifications.md`). The published report card remains permanently readable by the student and their guardians per their rights, even after leaving the school (INV-ZS-080); it is never blocked for unpaid balances ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), INV-ZS-016: arrears appear only as an alert on the account). Version history remains available, with earlier versions marked "superseded".

### BEH-ZS-126: Verify report-card and transcript authenticity by QR code

> **Invariant:** INV-ZS-085, INV-ZS-015 ([spec/invariants.md](../invariants.md))
> **See:** [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md); `spec/cross-cutting/06-external-integrations.md` (INT-SIG, built in Phase 4)
> **Priority:** Must
> **Version:** V1 (immutability and versioning from the MVP, INV-ZS-015)
> **Acceptance:** [`@REQ-ZS-113`](../../features/eva/fr-eva-16-authenticity-verification.feature)

REQUIREMENT: Every published report card and transcript MUST carry a verification QR code; the account-free verification page MUST show authenticity status, issuing school, year, period, version and superseded flag without exposing detailed grades.

Every published report card and transcript carries a verification QR code allowing a printed document's authenticity to be checked (INV-ZS-085): the verification page, accessible without an account, shows the authenticity status, the issuing school, the school year, the period, the current version and a "superseded" flag where applicable, without exposing detailed grades or data beyond what is strictly necessary. The QR code is tied to the document's fingerprint and covers reissues; it relies on the same verification component as the documents module's documents. In V1, report cards and transcripts carry the school's advanced electronic seal and a timestamp ([ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)); the qualified seal via an approved provider is out of scope for this chapter (V2, `spec/cross-cutting/06-external-integrations.md`).

### BEH-ZS-127: Correct a published report card by creating a new version

> **Invariant:** INV-ZS-085, INV-ZS-090 ([spec/invariants.md](../invariants.md))
> **See:** [ADR-ZS-020](../decisions/020-immutable-versioned-report-cards.md), [ADR-ZS-003](../decisions/003-default-retention-durations.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-114`](../../features/eva/fr-eva-17-correcting-a-published-report-card.feature)

REQUIREMENT: Any correction to a published report card MUST create a new version; the old version MUST remain viewable marked "superseded"; there MUST be no direct edit of a published report card regardless of the time elapsed.

Any correction to a published report card creates a new version: the old version remains viewable marked "superseded", the new one carries its own fingerprint, signatory and date (INV-ZS-085). The correction is reserved to the school leadership, must be justified, logged (INV-ZS-090) and notified to the recipients of the superseded version. There is no direct edit of a published report card, regardless of the time elapsed; the enrollment-closing grace period concerns closing the enrollment, not publication. Report cards are kept permanently by the school ([ADR-ZS-003](../decisions/003-default-retention-durations.md)).

### BEH-ZS-128: Issue annual and cumulative transcripts

> **Invariant:** INV-ZS-080, INV-ZS-083 ([spec/invariants.md](../invariants.md))
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md), [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)
> **Priority:** Must
> **Version:** MVP (wave 2 -- year-end closing, RDM-ZS-003: annual transcript); V1 (multi-year cumulative transcript)
> **Acceptance:** [`@REQ-ZS-115`](../../features/eva/fr-eva-18-annual-transcript.feature)

REQUIREMENT: The system MUST produce, on request, the annual transcript and (V1) the multi-year cumulative transcript, as bilingual sealed PDF documents, permanently retained, permanently readable even after leaving, and never blocked for unpaid balances.

The system produces, at the request of the student or their guardians and at the school's request: the annual transcript (a summary of the year's periods and the end-of-year decision) and the multi-year cumulative transcript (the student's path within the school, for post-baccalaureate applications). These transcripts are bilingual documents carrying a seal and signature, generated as PDFs, downloadable in self-service from the parent and student portals (verification QR code and advanced electronic seal in V1, BEH-ZS-126). They fall under official documents: permanent retention ([ADR-ZS-003](../decisions/003-default-retention-durations.md)), permanently readable access even after leaving (INV-ZS-080), year-end transcript included in the default transfer profile (INV-ZS-083, INV-ZS-022), never blocked for unpaid balances ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)).

### BEH-ZS-129: Publish detailed grades progressively (option)

> **Invariant:** INV-ZS-081, INV-ZS-034 ([spec/invariants.md](../invariants.md))
> **See:** `spec/behaviors/08-communication-notifications.md`
> **Priority:** Must
> **Version:** MVP (configurable option, disabled by default)
> **Acceptance:** [`@REQ-ZS-116`](../../features/eva/fr-eva-19-progressive-publication-of-grades.feature)

REQUIREMENT: The school MAY enable progressive publication: each assessment becomes visible to families as soon as the teacher publishes it, without waiting for closing. Until published, a grade MUST stay internal, and the default MUST be disabled.

By default, detailed grades become visible to families when the period's report card is published. The school may enable progressive publication: each assessment becomes visible (grade, teacher's remark) as soon as the teacher publishes it, without waiting for closing; the period average is only exposed on dates set by the school. As long as a grade is not published, it stays internal (INV-ZS-081, INV-ZS-034; the permission matrix: no parental view of unpublished grades). The scope (assessment types covered, levels) is configurable by the school. Publishing an assessment moves its `Mark` records from "draft" to "published" status (BEH-ZS-113) and triggers a notification to guardians per the rules of `spec/behaviors/08-communication-notifications.md` (MVP channels: in-app and SMS, grouped daily). Default value: disabled (publication with the report card); enabling it is at the school leadership's discretion (URS-ZS-035, OQ-ZS-086 resolved).

## 5. Morocco specifics

1. **National continuous-assessment reference framework.** Continuous assessment is an integral part of teaching in every subject, under inspector supervision (memo of 11/01/2006, still invoked). The historical baseline sets the product rule: at least two class tests per subject and per semester, plus one unified school test per semester, except in the second semester of exam years; it is implemented as a compliance check before closing (BEH-ZS-116).
2. **Certifying-exam weightings.** Default values from the research (H-02 confirmed and completed, `spec/appendices/01-review-history.md`): 6AP 50/25/25; 3AC 30/30/40 (including 15% + 15% continuous assessment per semester, local exam at the end of S1); baccalaureate 25/25/50 with the regional exam at the end of year 1 and the national exam at the end of year 2. The "provincial exam" label for 6AP follows the historical baseline (the research says "regional": a divergence flagged, [ADR-ZS-059](../decisions/059-6ap-provincial-exam-label.md)). Decree numbers were not found online (H-16, `spec/appendices/01-review-history.md`): the text reference is entered and traced, not pre-printed (BEH-ZS-118, OQ-ZS-081).
3. **Memoranda 080.21 and 081.21 suspended.** The ministry memos of 15/09/2021 setting rules for homework (2 assignments + 1 unified test per semester) and the 6AP 75/25, 3AC 50/50 variants were suspended on **29/11/2021** -- a date correcting the historical baseline (which said "November 2022"); the spec records this variant as a past configuration version and keeps the standard default weightings.
4. **Baccalaureate honors and resit.** Highest distinction from 16; distinction from 14; merit from 12; pass from 10; resit session between 8 and 9.99.
5. **External-exam grades.** Regional- and national-exam grades come from the ministry, not the school: manual entry in MVP, structured import in V1 over the file channel (no Massar API); Excel-file structures are not publicly documented and re-import is reported to be fragile -- hence configurable mapping and a validation report before confirmation (BEH-ZS-121).
6. **Bilingual report cards with seal.** Report cards are often bilingual (Arabic and French) and carry the school leadership's seal and signature: AR/FR/bilingual templates with RTL layout, advanced electronic seal and timestamp in V1 ([ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)), verification QR code (INV-ZS-085).
7. **Semesters vs. trimesters.** The semester is the assessment period for the three cycles of the national system, primary included; the trimester is specific to schools following the French reference framework; some bilingual schools run on trimesters ([ADR-ZS-035](../decisions/035-pilot-school-profiles.md) pilot). Period configuration is per section (BEH-ZS-112).
8. **Time and calendar.** Period boundaries are dated in local `Africa/Casablanca` time: a **permanent switch to UTC+0 on 20/09/2026**, with no seasonal alternation or Ramadan exception (decree 2.26.530, Official Gazette No. 7521 of 29/06/2026); internal storage in UTC. The 2027 national baccalaureate exam runs from June 1 to 3, 2027: maintenance windows are prohibited during exams.
9. **Double entry in Massar.** Private schools enter continuous-assessment grades into Massar at every level, structurally unavoidable for certifying levels (H-03, `spec/appendices/01-review-history.md`): ZSchool produces faithful exports per subject, class and semester (`spec/behaviors/12-massar-regulatory-exports.md`) without promising synchronization; the residual double entry is accepted until an official channel, if any, becomes available.

## 6. Data and events

Entities from the consolidated schema (`spec/domain-model.md`) drawn on by the module:

| Entity | Use in the module | Key constraints |
|---|---|---|
| `EvaluationPeriod` | Assessment periods (semesters, trimesters, sub-periods), dates, closing status | Linked to the school year; locked at closing (BEH-ZS-115) |
| `Assessment` | Assessment: type, subject, class **or group**, period, grading scale, weighting | Linked to context (INV-ZS-036); reference-framework compliance (BEH-ZS-116); linkage to a `Group` to be added to the dictionary (OQ-ZS-090) |
| `Mark` | A student's grade, marker (justified or unjustified absence, exempted, ungraded) and remark for an assessment; **draft / published status** | Author, timestamp; not visible outside the school until published (INV-ZS-081, INV-ZS-034) |
| `Remark` | Per-subject remark and general remark | Author, scope; internal observations not portable (INV-ZS-081) |
| `PeriodResult` | Subject and overall averages, rank, honors, remarks, per period; "excluded from rank" flag | Frozen at closing; recomputed continuously during the period |
| `YearDecision` | End-of-year decision (promotion, repeating the year, graduation, track guidance, undetermined) | Carried by the COMPLETED enrollment (INV-ZS-059); feeds the rollover (JMP-ZS-002); "undetermined" updated on import of certifying results |
| `ReportCard` | Period report card: versions, fingerprint, signatory, date, QR code | Immutable after publication; earlier versions marked "superseded" (INV-ZS-085, [ADR-ZS-020](../decisions/020-immutable-versioned-report-cards.md)) |
| `Transcript` | Annual and cumulative transcript | Published document, permanent access (INV-ZS-080); permanent retention ([ADR-ZS-003](../decisions/003-default-retention-durations.md)) |
| `ConductGrade` | Conduct grade reproduced on the report card | Produced by `spec/behaviors/04-attendance-student-life-discipline.md`; not portable (INV-ZS-081) |
| `EvaluationPeriod`, `ComputationRule`, `GradingScale`, `SubjectLevelConfig` | Configuration framework (periods, calculation rules, scales, weightings per level and track) | Weighting and language per level and track, never global (INV-ZS-078, INV-ZS-014); letter and GPA scales: V2+ |
| `Enrollment`, `StudentProfile` | Carries all grades and results; import matching by Massar code | No floating school data ([ADR-ZS-029](../decisions/029-academic-data-always-tied-to-enrollment.md), INV-ZS-036); Massar code as the matching key ([ADR-ZS-015](../decisions/015-massar-code-as-preferred-matching-key.md)) |

Domain events (event dictionary in `spec/domain-model.md`) produced or consumed by the module:

| Event | Produced by | Consumers and effects |
|---|---|---|
| `PeriodClosed` | Assessments (closing by the school leadership) | Teachers (entries locked), school leadership; triggers the frozen calculation and opens the councils |
| `ReportCardPublished` | Assessments (publication) | Student and guardians (notification, QR code available); publication logged |

Associated notifications (multichannel routing, templates, costs) are carried by `spec/behaviors/08-communication-notifications.md` ([ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md); at the MVP stage, in-app and SMS channels, with WhatsApp "utility" limited to attendance notifications). Every write to grades, locking, unlocking, publication and correction carries author, context and timestamp at the record level from the MVP stage on (minimal history); the immutable, exportable AuditLog is V1.

## 7. Screens

### SCR-ZS-061 -- Teacher's assessments home screen (mobile, PWA)

Zones: context selector (profile, school -- INV-ZS-053); list of the teacher's courses (subject x class or group); per course, the current period's status (open, closed) and a badge with the number of pending entries; "new assessment" shortcut; offline banner with a counter of grades pending synchronization. States: period open (actions active), closed (read-only). Behavior: the last-viewed class persists; bilingual labels "Assessments" / "التقييمات".

### SCR-ZS-062 -- Entering an assessment's grades (mobile)

Zones: header (subject, class, assessment type, grading scale, weighting, period); alphabetically sorted student list with photo; numeric entry field validated against the grading scale (decimals allowed), field-to-field navigation by touch or keyboard; absent/exempted/ungraded markers; optional short-remark field; progress indicator (grades entered vs. headcount); "save draft" and "finish entry" actions. States: draft (editable, not visible to families), entry complete (to be validated), locked (read-only after closing); permanent offline banner with the number of values pending synchronization. Behavior: automatic draft save on every value, conflict resolution at sync with an overwrite alert (BEH-ZS-114); bilingual labels "Grade entry" / "تسجيل النقط".

### SCR-ZS-063 -- Period closing (web, school leadership)

Zones: year, period, class or global selection; a subjects x classes cross-table with an assessment-count-per-type indicator and a compliance status (compliant, gaps, non-compliant); a detailed gap report with a reminder sent to the teachers concerned; a justified-waiver box (logged); a closing button with a confirmation screen listing the effects (locking, notification). States: period open, partial compliance, closed. Behavior: at the MVP stage, closing is always possible with an informational warning of apparent gaps, with no compliance blocking (BEH-ZS-115); in V1, a full compliance indicator and closing refused until compliance is reached or waived (BEH-ZS-116); bilingual labels "Period closing" / "إغلاق الدورة".

### SCR-ZS-064 -- Assessment configuration (web, school leadership)

Zones: assessment-type library (default grading scale, weighting); assessment periods per section with sub-periods; calculation rules (rounding, exclusion, honors, rank, thresholds); default national weightings with text reference and version year; change history. Behavior: any change made during the school year is versioned, logged and has no retroactive effect on closed periods (BEH-ZS-117, BEH-ZS-118).

### SCR-ZS-065 -- Certifying-exam results (web)

Zones: certifying-level, session, subject selection; file import with reusable column mapping and a validation report (lines accepted, rejected with a reason); manual line-by-line entry as a supplement; log of imports and entries (source, author, timestamp). States: import draft, validated, imported; import blocked on a closed period without the school leadership's unlock (BEH-ZS-120, BEH-ZS-121).

### SCR-ZS-066 -- Class-council file (web, school leadership and homeroom teacher)

Zones: student list with overall average, rank, change between periods, absences and tardiness, conduct, per-subject remarks; a detailed per-student card (averages, observations, homeroom teacher's opinion, proposed decision); a class view (average distribution, attendance rate); a box for recording the decision and general remark; minutes generation. States: preparation, deliberated, decisions recorded, minutes archived. Behavior: the file stays internal until it is recorded (INV-ZS-081); end-of-year decisions propagate to the rollover (BEH-ZS-122, BEH-ZS-123). At the MVP stage (wave 2), only the per-class decision-recording box (bulk entry) and the simplified-minutes generation are delivered; the full preparation file arrives in V1.

### SCR-ZS-067 -- Report cards: templates, publication and versions (web, school leadership)

Zones: template library (AR, FR, bilingual) with preview; class and period selection; student list with report-card status (to generate, generated, published, superseded); individual preview before publication; bulk publication with confirmation; per-student version history (fingerprint, signatory, date, "superseded" flag); A4/A5 batch printing. Behavior: publication freezes the version and emits the notification (BEH-ZS-124, BEH-ZS-125); a correction creates a new version with a reason (BEH-ZS-127).

### SCR-ZS-068 -- Viewing results (mobile, parent and student)

Zones: child selector (multi-child, multi-school view -- INV-ZS-053); latest published report card (bilingual PDF rendering with seal and signature; QR code in V1); period and version history; detailed published grades where applicable (BEH-ZS-129). States: no publication yet (waiting message), published, superseded (current version shown). Behavior: opened from a publication notification; permanently readable even after leaving (INV-ZS-080); no display of unpublished grades (INV-ZS-081).

### SCR-ZS-069 -- Annual and cumulative transcripts (web editing, mobile viewing)

Zones: student and year selection; annual-transcript preview (periods, averages, decision -- MVP wave 2) and multi-year cumulative-transcript preview (V1); bilingual PDF generation with seal and signature (QR code in V1); reissue history. Behavior: self-service for parent and student; the year-end transcript is automatically offered in the transfer profile (INV-ZS-083); never blocked for unpaid balances (BEH-ZS-128).

## 8. Integrations

Integrations are specified in detail in `spec/cross-cutting/06-external-integrations.md` (built in Phase 4); this chapter only sets the module's needs:

| Integration | Module need |
|---|---|
| INT-MAS (Massar) | Export of continuous-assessment grades in Massar template format, per subject, class and semester, with a validation report before submission (file structure not publicly documented, fragile re-import); structured import of certifying-exam results (BEH-ZS-121); no automation of Massar data entry (H-04, `spec/appendices/01-review-history.md`). Refers to `spec/behaviors/12-massar-regulatory-exports.md`. |
| INT-SIG (signature and seal) | The school's advanced electronic seal and timestamp on report cards and transcripts in V1; verification QR code tied to the document's fingerprint; qualified seal via a DGSSI-approved provider in V2 ([ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)). |

Notifications (publication, closing, compliance alerts) go through the communication module's channels (at the MVP stage: in-app and SMS, with WhatsApp "utility" limited to attendance notifications; general rollout in V1 -- `spec/behaviors/08-communication-notifications.md`, [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)).

## 9. Module-specific non-functional requirements

Numbering carried by `spec/cross-cutting/03-non-functional-requirements.md` (built in Phase 4):

| Domain | Requirement applied to the module |
|---|---|
| NFR-PERF | Report-card generation under 3 s; report-card publication for a 2,000-student school under 10 minutes; usual pages under 2 s on 4G, including entry grids |
| NFR-OFF | Grade entry resilient to outages, with synchronization and conflict resolution (BEH-ZS-114) |
| NFR-I18N | Full FR and AR with RTL from the MVP; names in dual script on report cards and transcripts; bilingual documents |
| NFR-DOC | Bilingual PDFs, correct Arabic fonts, A4 and A5 formats, batch printing (report cards, transcripts, minutes) |
| NFR-MOB | PWA in MVP for teachers, parents and students; native apps in V2 |
| NFR-DISP | 99.5% target excluding announced maintenance; maintenance windows outside school-start and exam periods (period closings and the June results import are critical peaks) |
| NFR-RES | Sizing of generation and publication peaks to the three-year technical target (500 schools, 500,000 students) |
| NFR-INT | Excel, CSV and PDF exports available on grade, average and result lists |

Applicable security requirements: least privilege on grades (INV-ZS-011, INV-ZS-091), logging of writes and sensitive views (minimal history at MVP, immutable exportable AuditLog in V1; INV-ZS-090, INV-ZS-019), multi-tenant isolation (INV-ZS-001) -- detailed in `spec/cross-cutting/01-permissions.md` and `spec/cross-cutting/02-security-privacy.md`.

## 10. Success metrics

Product indicators are numbered in `spec/metrics.md`; the module proposes the following candidate measures, to be carried up there upon review:

| Candidate measure | Definition |
|---|---|
| Closing-to-publication lag | Median duration between period closing and report-card publication, per school and per period (service target to be set on review) |
| First-pass compliance rate | Share of classes that pass the national-reference-framework compliance check with no gap on the first check (BEH-ZS-116) |
| Under-48-hour viewing rate | Share of published report cards viewed by at least one guardian or the student within 48 hours of the notification (measures the parent-app promise, URS-ZS-035) |
| Post-publication correction rate | Number of correction versions per 100 published report cards (entry and calculation quality; low target) |
| Progressive-publication adoption | Share of schools enabling progressive grade publication (BEH-ZS-129) and the resulting viewing rate |

## 11. Open questions

Open questions for this module are consolidated in `spec/open-questions.md` (built in Phase 6) under `OQ-ZS-081` through `OQ-ZS-090`.

## 12. Traceability

Full cross-reference traceability for this module is consolidated in `spec/traceability.md` (built in Phase 7).
