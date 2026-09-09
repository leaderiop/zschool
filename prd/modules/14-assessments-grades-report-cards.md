# ZSchool — Chapter 14: Assessments, Grades and Report Cards (EVA module)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09); previously 0.2 — revised (review of 09/09/2026) |
| Date | 2026-09-09 |
| Status | Draft PRD — under review; arbitrations ARB-01, ARB-17, ARB-18, ARB-19 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | PROJECT.md §2.2 (certifying-exam weightings and honors), §2.3 (education systems), §2.5 (assessment and grading), §6.7 (academic structure), §7.5 (assessments, grades and report cards module), §8 (roles and permissions), §10 (non-functional requirements), §12 (scope by version), §14 (DEC-09, DEC-10, DEC-18, DEC-30, DEC-35), §16 (H-02, H-04, H-16); `prd/research/00-baseline-corrections.md` (items 1, 3 and 4); `prd/research/04-pedagogy-massar-calendar.md` §1 |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/journeys/01-school-group-director.md`, `prd/journeys/04-part-time-teacher.md`, `prd/journeys/05-multi-school-parent.md`, `prd/journeys/06-custodial-mother-and-guardian.md`, `prd/journeys/07-students-minor-and-adult.md`, `prd/modules/12-academic-structure-timetables.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/20-dashboards-reporting.md`, `prd/modules/21-massar-regulatory-exports.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` |

---

## 1. Objective and scope

### 1.1 Objective

Cover the full assessment cycle, from the assessment reference framework to family consultation: configuration of assessment types, periods and calculation rules compliant with the Moroccan national reference framework; grade entry by teachers on web and mobile, resilient to connectivity gaps; compliance check against the national reference framework before closing; locking by the school leadership; integration of certifying-exam grades; end-of-year decisions and class-council minutes; bilingual report cards, published and immutable (QR-code verification in V1, DEC-30); annual and cumulative transcripts for post-baccalaureate files. The MVP calculation rules (markers, grading scales, ungraded subjects, class changes, rank exclusion) are set by arbitration ARB-17. The reference journey is **PC-06** in `prd/journeys/00-journey-map.md`.

### 1.2 In scope

| Item | Version (PROJECT.md §12) |
|---|---|
| Configurable assessment types with grading scale, weighting and period | MVP |
| Assessment periods: semesters (national default) or trimesters (sections following the French reference framework), sub-periods; trimester → Massar semester mapping | MVP (OQ-04 resolved, ARB-17h) |
| Web and mobile grade entry, drafts, offline mode with synchronization | MVP |
| Period closing and locking of entries by the school leadership | MVP |
| Configurable calculation rules and computation of averages, ranks, honors | MVP |
| Default national weightings, versioned by school year, traced on the report card | MVP |
| Certifying-exam grades: manual entry | MVP |
| Bilingual report cards, templates, seal, signature, publication, immutability, versioning | MVP |
| Compliance check against the national reference framework before closing (alert, then blocking with justified waiver) | MVP (informational warning without blocking, FR-EVA-06); V1 (blocking with justified waiver — arbitration D3) |
| MVP calculation rules: absent, exempted and ungraded markers; normalization of grading scales to 20; ungraded subject marked "NG"; class change mid-period; rank exclusion; trimester → Massar semester mapping | MVP (ARB-17) |
| Structured import of certifying-exam results | V1 |
| End-of-year decisions, general remarks and simplified minutes (FR-EVA-13) | MVP (wave 2 — year-end closing, JAL-07; ARB-01) |
| Full class council: file preparation (FR-EVA-12) | V1 |
| Verification QR code for report cards and transcripts | V1 |
| Annual transcript | MVP (wave 2 — year-end closing, JAL-07; ARB-01) |
| Multi-year cumulative transcript (post-baccalaureate) | V1 |
| Progressive publication of detailed grades to families (configurable option, default: published with the report card) | MVP (ARB-17f; BES-PAR-02) |

### 1.3 Out of scope (covered elsewhere)

| Item | Owning file |
|---|---|
| Periods, grading scales and weightings as elements of the academic structure (creation, cloning from year N to N+1) | `prd/modules/12-academic-structure-timetables.md` |
| Production of the conduct grade, incidents and disciplinary councils | `prd/modules/13-attendance-student-life-discipline.md` (this module reproduces the configured conduct grade on the report card) |
| Notification channels and templates, SMS/WhatsApp costs | `prd/modules/17-communication-notifications.md` |
| Dashboards and results statistics | `prd/modules/20-dashboards-reporting.md` |
| Massar exports of continuous-assessment grades, pre-submission validation, ESISE mirror | `prd/modules/21-massar-regulatory-exports.md` |
| Fine-grained permissions, logging, UX and RTL, detailed NFRs, numbered metrics | `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/38-kpi-success-metrics.md` |
| Online homework and lightweight e-learning (resources, electronic submissions) | V2+ (PROJECT.md §12) |
| Letter grades and GPA for advanced international sections (`GradingScale`) | V2+ (PROJECT.md §12) |
| Qualified seal and timestamp via a DGSSI-approved provider | V2 (DEC-30; `prd/cross-cutting/35-external-integrations.md`) |

---

## 2. Users and use cases

Baseline roles (PROJECT.md §8.1) drawn on by the module; effective rights derive from the fine-grained permissions of `prd/cross-cutting/30-roles-permissions-matrix.md` (RG-37, RG-39, INV-34): a teacher only accesses students in their own courses, and the baseline's §8.3 matrix distinguishes unpublished grades (write: the course teacher; read: school leadership) from published report cards.

| User | Main use cases |
|---|---|
| Teacher | Creates assessments within their subject and classes; enters grades and remarks on mobile in class or in the evening, including offline; views their classes' averages; receives the lock notice at closing (→ BES-ENS-03, BES-ENS-08). |
| Homeroom teacher | Has the class summary view: averages, ranks, absences and conduct, in preparation for the class council. |
| School leadership (director, academic leadership) | Configures assessment types, periods, calculation rules and weightings; monitors compliance with the national reference framework; closes and locks periods; chairs the class council and records decisions; publishes report cards, corrects them via a new version, issues transcripts (→ BES-DIR-06, BES-DIR-08). |
| Head supervisor | Feeds the council file (absences, tardiness, conduct); views published report cards for their assigned cycles. |
| Front desk | Views and prints published report cards on request from families at the front desk; no write access to grades. |
| Parent / guardian (PAR, GAR) | Receives the publication notification; views the report card and, depending on the school's settings, grades published as they are entered; downloads transcripts (→ BES-PAR-02, BES-GAR-01). The custodial parent has equal access to the legal guardian (RG-14). |
| Student (ELE) | Views published grades and report cards through the access activated by their guardians (RG-01); an adult student downloads their annual and cumulative transcripts for post-baccalaureate applications (RG-02, DEC-20 → BES-ELE-03, BES-ELE-06). |

---

## 3. Key journeys

The critical journey **PC-06 — Grade entry, class council, report-card publication** (`prd/journeys/00-journey-map.md`) structures the module: continuous weekly entry in normal operation, closing peaks at the end of each period (two closings for semesters, three for the DEC-35 pilot school running on trimesters), import of certifying-exam results in June. Detailed steps are not duplicated here:

| Persona | Reference |
|---|---|
| Teacher (evening entry, context switching between schools) | PJ-ENS grade-entry steps, `prd/journeys/04-part-time-teacher.md` |
| Director (closing, council, publication) | PJ-DIR class-council and publication steps, `prd/journeys/01-school-group-director.md` |
| Parent and custodial mother (viewing, notification) | PJ-PAR and PJ-GAR result-viewing steps, `prd/journeys/05-multi-school-parent.md`, `prd/journeys/06-custodial-mother-and-guardian.md` |
| Students Youssef and Salma (report card, post-bac transcripts) | PJ-ELE viewing steps, `prd/journeys/07-students-minor-and-adult.md` |

Upstream dependencies: periods and weightings carried by the academic structure (`prd/modules/12-academic-structure-timetables.md`, RG-24 to RG-26); conduct supplied by `prd/modules/13-attendance-student-life-discipline.md`. Downstream dependencies: notifications (`prd/modules/17-communication-notifications.md`), Massar exports (`prd/modules/21-massar-regulatory-exports.md`), end-of-year decisions consumed by the rollover (PC-02, `prd/modules/11-admissions-enrollment-reenrollment.md`).

---

## 4. Functional requirements

### FR-EVA-01 — Configure assessment types

| Attribute | Value |
|---|---|
| Description | The school defines, per section and per cycle, a library of assessment types among: continuous assessment (class test), supervised assignment, composition/exam, mock exam, unified school exam, oral exam, project. Each type carries a grading scale (scale and grading increment, default: out of 20 with decimals), an assessment weighting and a mandatory link to an assessment period. An assessment (`Assessment` entity) is created per subject, class **or group** (clarification carried in the dictionary of `prd/03-domain-data-model.md`) and per period, within the limits of the teacher's assigned courses (RG-39). The "local unified exam" for certifying levels (organized by the school at the end of semester 1) is a type within this library: it is entered as an internal assessment and is never re-entered as an external grade (ARB-17j; FR-EVA-10 covers only the regional and national exams). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.5, §6.7, G-12, RG-39 |
| Actors | Teacher (creation within their scope), school leadership (library and rules), academic leadership |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Assessment types (MVP)
  Scenario: Creating a test within the teacher's scope
    Given the middle-school-cycle library with the "class test" type out of 20, weighting 1
    When Khadija creates an assessment of this type for her math course in 2AC-3 in semester 1
    Then the assessment is linked to the subject, the class, the period and her course
    And it does not appear in other teachers' courses
  Scenario: Local unified exam entered as an internal assessment
    Given the "unified school exam" type from the library
    When the school leadership creates the end-of-semester-1 unified exam for 3AC classes
    Then grades are entered via FR-EVA-03 and no re-entry is offered on the external-exam screen
```

### FR-EVA-02 — Configure assessment periods per section

| Attribute | Value |
|---|---|
| Description | Each section (education system) defines its own assessment periods (`EvaluationPeriod` entity): two semesters for the default national model, three trimesters for sections following the French reference framework or bilingual sections running on trimesters, with optional sub-periods (tests, exams, mock exams). Periods carry dates bounded within the school-year calendar, a status (open, closed) and a closing history. The templates provided at instantiation (national, French mission, international) pre-configure these periods (RG-24), and cloning from year N to N+1 reproduces them without the grades (RG-25, INV-42). **Mapping to Massar semesters** (ARB-17h): when a section runs on trimesters, the school configures the period → Massar-semester mapping table (default: T1 → S1; T2 → S1 until the end date of semester 1 in the ministry calendar, then S2; T3 → S2); the exported semester averages (FR-MAS-04, `prd/modules/21-massar-regulatory-exports.md`) are recomputed from dated grades, with no double entry. |
| Priority | Must |
| Version | MVP (bilingual trimester pilot, DEC-35; Massar mapping: ARB-17h; OQ-04 resolved) |
| Traceability | PROJECT.md §2.5, §2.3, §6.7, §12, DEC-35, G-12 |
| Actors | School leadership, academic leadership |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Assessment periods per section (MVP)
  Scenario: Bilingual section on trimesters
    Given the bilingual pilot school whose section runs on three trimesters
    When the school leadership instantiates the 2026-2027 periods
    Then three periods bounded within the calendar are created with the default Massar mapping (T1 → S1, T2 → S1 then S2, T3 → S2)
    And the continuous-assessment export produces two semester averages recomputed from dated grades
  Scenario: Cloning without grades
    Given the 2026-2027 periods closed
    When the structure is cloned to 2027-2028
    Then the periods are reproduced with shifted dates and no grade is copied
```

### FR-EVA-03 — Enter grades by subject and class on web and mobile, with drafts

| Attribute | Value |
|---|---|
| Description | The teacher enters the grades of an assessment for the students in their class or group, on the web (desktop) and on mobile: student list, numeric value validated against the grading scale, absent/exempted/ungraded markers, an optional short remark per student (`Mark` entity). Entry happens in draft mode: each `Mark` carries a **draft** or **published** status (ARB-17f); nothing is visible to families or other teachers until the grade is published, either when the report card is published or on an ongoing basis if the school has enabled it (FR-EVA-19) (RG-29, INV-21). Every write carries the author, date and context (RG-27, RG-38) and is linked to the enrollment (DEC-18, INV-27). Averages are recomputed on every save. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.5, §10, §8.3, RG-27, RG-29, RG-38, RG-39, DEC-18, BES-ENS-03; ARB-17f |
| Actors | Teacher; viewing: homeroom teacher, school leadership |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Draft grade entry (MVP)
  Scenario: Mobile entry of a test with markers
    Given Khadija, a math teacher assigned to the course of class 2AC-3 at School A
    And a class test out of 20 created for semester 1
    When she enters 14.5 for Youssef, the "absent" marker for one student and "exempted" for another
    Then each grade is saved as a draft with author, timestamp and context, linked to the student's enrollment
    And none of these values is visible to families or other teachers
    And the subject's provisional average is recomputed per FR-EVA-07

  Scenario: Entry refused outside scope
    Given a teacher with no assignment to the physics course of class 2AC-3
    When she attempts to open the entry grid for that course
    Then access is denied (RG-39, INV-34) and the attempt is logged
```

### FR-EVA-04 — Enter grades offline and synchronize

| Attribute | Value |
|---|---|
| Description | Mobile grade entry tolerates network outages: grades entered offline are kept locally as drafts and synchronized once the network is back, with conflict resolution (most recent timestamped write wins, with an alert if a value entered elsewhere is overwritten). Offline mode covers creating and completing assessments that were already planned; the screen constantly shows the number of grades pending synchronization. This requirement implements the baseline's offline requirement for grade entry, on the same footing as attendance taking. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §10 (offline), §2.10, §7.5, BES-ENS-03; NFR-OFF domain (`prd/cross-cutting/32-non-functional-requirements.md`) |
| Actors | Teacher |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Offline grade entry (MVP)
  Scenario: Network outage during entry
    Given Khadija entering test grades on her phone
    And the mobile network drops after the tenth grade
    When she continues entering the remaining twenty grades and then closes the app
    Then the thirty grades are kept locally as drafts with a "30 pending" counter
    And upon reconnection, the grades are synchronized without loss or duplication

  Scenario: Conflict at synchronization
    Given a grade entered offline at 8:05 PM for a student
    And the same grade edited on the web by the same teacher at 8:30 PM
    When synchronization runs
    Then the most recent value is kept
    And the teacher receives an overwrite alert listing the value that was replaced, with no silent change
```

### FR-EVA-05 — Close the period and lock entries by the school leadership

| Attribute | Value |
|---|---|
| Description | The school leadership closes an assessment period, class by class then globally: at closing, all assessments and grades for the period become read-only for teachers; the `PeriodClosed` event is emitted (teachers, school leadership). Any reopening is reserved to the school leadership, must be justified, dated and logged (RG-38); it re-locks the period at re-closing. Once report cards are published, a correction never modifies the published report card: it goes through a new version (FR-EVA-17). At the MVP stage, closing is never blocked by a compliance check: the informational warning produced by FR-EVA-06 lists apparent gaps; blocking with a justified waiver arrives in V1 (founder's arbitration D3). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.5, §12 (immutable published report cards), RG-33, RG-38, BES-DIR-06; `PeriodClosed` event (`prd/03-domain-data-model.md` §7) |
| Actors | School leadership; teachers notified |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Period closing and entry locking
  Scenario: Closing with a compliance warning and no blocking (MVP)
    Given a 2AC class in semester 1 of the 2026-2027 school year
    And the "Mathematics" subject has only one class test and no unified exam
    When the director starts the semester-1 closing for this class
    Then closing proceeds and a warning lists the apparent gaps subject by subject
    And the period's grades are locked once closing completes

  Scenario: Closing and locking entries
    Given a class whose assessments for the period are all entered
    And the director confirms the semester-1 closing
    When the closing is recorded
    Then all assessments and grades for the period become read-only for teachers
    And teachers and the school leadership receive the period-closing notification
    And any further edit attempt is refused with a pointer to the unlock procedure

  Scenario: Traced exceptional unlock
    Given a closed period and an entry error reported by a teacher
    When the director reopens the period with a stated reason
    Then the action is logged with author, reason and timestamp
    And the edited grades are locked again at re-closing
```

### FR-EVA-06 — Check compliance with the national reference framework before closing

| Attribute | Value |
|---|---|
| Description | Before each semester closing, the system checks, per subject and per class, the national continuous-assessment minimum: at least two class tests and one unified school test per subject and per semester, except in the second semester of exam years (certifying levels 6AP, 3AC, 1st and 2nd year of baccalaureate; exact scope of the waiver: OQ-05). A subjects × classes compliance table is available at all times; as the period end approaches, the school leadership and the teachers concerned receive an alert listing the gaps (notification via `prd/modules/17-communication-notifications.md`). At the MVP stage, the check produces the informational warning consumed by FR-EVA-05; in V1, closing is blocked on non-compliance unless the school leadership records a justified, logged waiver (arbitration D3). This count is unique: FR-MAS-06 (`prd/modules/21-massar-regulatory-exports.md`) refers back to it and never recomputes it. The required minimum (number of tests, list of admissible types, waivers) is configurable per level. |
| Priority | Should |
| Version | MVP (informational warning, no blocking); V1 (blocking with justified waiver — arbitration D3) |
| Traceability | PROJECT.md §2.5, §7.5, §7.12, BES-DIR-08; `prd/research/04-pedagogy-massar-calendar.md` §1 |
| Actors | School leadership, academic leadership, alerted teachers |

**Acceptance criteria (MVP: warning; V1: blocking check, arbitration D3):**

```gherkin
Feature: Compliance check with the national reference framework before closing
  Scenario: Warning without blocking (MVP)
    Given a 2AC class in semester 1 whose "Mathematics" subject has only one class test
    When the director opens the closing screen
    Then the subjects × classes table flags the gap
    And closing remains possible and proceeds with the warning listed in the summary

  Scenario: Closing blocked on non-compliance with the national reference framework (V1)
    Given a 2AC class in semester 1 of the 2026-2027 school year
    And the "Mathematics" subject has only one class test and no unified exam
    When the director starts the semester-1 closing for this class
    Then closing is refused and a compliance report lists the gaps subject by subject
    And no grade for the period is locked

  Scenario: Justified waiver by the school leadership (V1)
    Given a class partially non-compliant with the national reference framework
    When the director records a justified waiver
    Then closing is authorized despite the remaining gaps
    And the waiver is logged with author, reason and timestamp
```

### FR-EVA-07 — Configure calculation rules

| Attribute | Value |
|---|---|
| Description | The school configures, per level and per track (`ComputationRule` entity): the subject-average calculation (weighting assessments by their weightings), the overall average (weighting subjects by the weightings carried on `SubjectLevelConfig`, never globally — RG-26, INV-41), rounding rules (number of decimals, rounding mode), the optional exclusion of the lowest grade beyond a given number of grades, honors, the ranking method, and alert or decision thresholds (admission, resit, failure). National templates pre-configure these rules at instantiation (RG-24); the annual clone reproduces them (RG-25, INV-42). Any change made during the school year is versioned and logged; it does not affect periods already closed. **Processing rules set by ARB-17**: (a) markers — an unjustified absence at an assessment counts as 0 by default (configurable: 0 or exclusion); a justified absence, exemption and non-graded status are excluded from the average's denominator; (b) any grading scale other than 20 is normalized to 20 before weighting; (c) a subject with no grade at all at closing is excluded from the overall average and marked "NG" (not graded) on the report card, without neutralizing the weighting of the other subjects; (d) in the event of a class change mid-period (RG-11, INV-07), grades stay attached to the enrollment and the rank is computed within the current class at closing. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.5, §6.7, RG-24, RG-25, RG-26, INV-41, INV-42, G-12; ARB-17 a–d |
| Actors | School leadership, academic leadership |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Marker and grading-scale calculation rules (MVP)
  Scenario: Unjustified absence counted as 0
    Given a default "unjustified absence = 0" rule for level 2AC
    And a student marked absent without justification for a test weighted 1, with 12 and 16 on the other two tests
    When the subject average is computed
    Then it equals 9.33 out of 20
    And the report card states the rule applied

  Scenario: Exemption excluded from the denominator
    Given a student exempted from physical education for the period
    When the overall average is computed
    Then the subject is excluded from the weighted denominator and shows "exempted" on the report card

  Scenario: Grading scale out of 10 normalized
    Given an assignment graded out of 10 with the value 7 and a test out of 20 with the value 12, of equal weighting
    When the subject average is computed
    Then the grade of 7/10 is normalized to 14/20 before weighting and the average equals 13/20

  Scenario: Class change mid-period
    Given a student who moved from class 2AC-1 to class 2AC-3 on October 15, with two grades entered in 2AC-1
    When semester 1 is closed
    Then their grades from 2AC-1 are kept on their enrollment and count toward their averages
    And their rank is computed among the students of class 2AC-3
```

### FR-EVA-08 — Provide default national weightings, versioned by year and traced on the report card

| Attribute | Value |
|---|---|
| Description | For certifying levels, the system pre-configures the official weightings between continuous assessment and external exams, versioned by school year: 6AP 50% continuous assessment / 25% local unified exam / 25% provincial exam; 3AC 30% continuous assessment (15% + 15% per semester) / 30% local unified exam / 40% regional exam; baccalaureate 25% continuous assessment / 25% regional exam (end of year 1) / 50% national exam (end of year 2). Each weighting set carries its text reference (the text organizing the exam, as configured, H-16); that reference and the applicable weighting table appear in full on the report card. The "provincial exam" label for 6AP follows the baseline's §2.2 wording (the standardized provincial primary-school-certificate exam); `prd/research/04-pedagogy-massar-calendar.md` §1 says "regional" — a divergence flagged by the research (ARB-18), with the decree reference still to be recorded (H-16, OQ-01). Weightings remain editable per level, track, section and year (possible AREF variants); version history is kept, with the exceptional 2021-2022 variant (6AP 75/25, 3AC 50/50) serving as an example of a historized version. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §2.2, H-02, H-16, RG-25; `prd/research/00-baseline-corrections.md` item 3; `prd/research/04-pedagogy-massar-calendar.md` §1 (see OQ-01, OQ-02); ARB-18 |
| Actors | School leadership, academic leadership; viewing: families on the report card |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Default national weightings (MVP)
  Scenario: Report card for a certifying level
    Given a 3AC class with the default 30 / 30 / 40 weightings versioned for 2026-2027
    When the semester-2 report card is generated
    Then the weighting table and its text reference appear in full on the report card
  Scenario: Historized variant
    Given the 2021-2022 variant (3AC 50 / 50) kept as a past version
    When the school leadership views the weighting history
    Then the variant appears with its year without being offered by default for 2026-2027
```

### FR-EVA-09 — Compute averages, ranks and honors per period and for the year

| Attribute | Value |
|---|---|
| Description | The system computes, per the configured rules (FR-EVA-07), and stores in `PeriodResult`: the subject average, the weighted overall average, the class rank (with ties handled), the honors level, and the annual results (average of the periods, equal-weighted by default, with period weighting configurable via FR-EVA-07). Honors levels follow the baseline's thresholds for the baccalaureate (highest distinction from 16; distinction from 14; merit from 12; pass from 10; resit between 8 and 9.99) and are configurable for other cycles. Calculations run continuously during the period, are frozen at closing, and also apply to external-exam grades to produce the weighted summaries for certifying levels. The rounding rule and weightings used are restated on the report card. The calculation applies the rules from FR-EVA-07 (markers, normalization of grading scales to 20, "NG" subject excluded, rank within the current class). **Rank exclusion** (ARB-17e): `PeriodResult` carries an "excluded from rank" flag set per the school's configuration (late arrival, extended exemption, a student-life decision — FR-VSC-22 in `prd/modules/13-attendance-student-life-discipline.md` refers back to it); a student excluded keeps their averages, has no rank and does not count in the denominator of their class's ranking; the report card shows "unranked". |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §2.5, §7.5, G-12; `prd/research/04-pedagogy-massar-calendar.md` §1 (honors); ARB-17 b, c, e; FR-VSC-22 |
| Actors | System; viewing: teachers, homeroom teacher, school leadership |

**Acceptance criteria:**

```gherkin
Feature: Period average computation
  Scenario: Subject average with the lowest grade excluded
    Given a calculation rule excluding the lowest grade beyond three grades
    And a student who scored 12, 8, 15 and 17 in mathematics out of 20
    When the subject average is computed
    Then the grade of 8 is excluded and the resulting average is 14.67 out of 20
    And the report card states the exclusion rule and rounding applied

  Scenario: Overall average weighted by subject weightings
    Given the subject weightings defined per level and track
    And a student's subject averages
    When the overall average is computed
    Then each subject counts according to its weighting, not uniformly
    And the rank is computed within the class, with ties handled

  Scenario: Subject not graded at closing
    Given a class whose "Visual Arts" subject carries no grade in semester 1
    When the overall average is computed at closing
    Then the subject is excluded from the overall average
    And the report card shows "NG" for that subject, with the other weightings unchanged

  Scenario: Student excluded from rank
    Given a student who arrived on December 20 and is flagged "excluded from rank" by the school leadership
    When semester-1 ranks are computed
    Then the student is marked "unranked" and keeps their averages
    And the class ranking of the other students is established without them
```

### FR-EVA-10 — Manually enter certifying-exam grades

| Attribute | Value |
|---|---|
| Description | For certifying levels, the school records external-exam grades into the student's average: provincial exam (6AP), regional exam and national exam (results sent by the ministry, entered manually upon receipt). The local unified exam, organized by the school at the end of semester 1, is an internal assessment entered via FR-EVA-01 and FR-EVA-03: it is never re-entered here (ARB-17j, a single model). Each grade carries the session, the subject, the source (school or ministry) and the entry's author; it cannot be edited after the period closes, nor overwritten by a later import without validation (FR-EVA-11). These grades feed the weighted summaries of FR-EVA-09. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §2.5, §7.5, §2.2 (certifying weightings) |
| Actors | School leadership, academic leadership, front desk (delegated entry) |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Manually entered certifying-exam grades (MVP)
  Scenario: Entering regional-exam results
    Given the 3AC regional-exam results sent by the ministry in July 2027
    When the front desk enters each student's grade with the session and subject
    Then each grade carries the source "ministry", the author and the timestamp
    And the weighted summary from FR-EVA-09 is recomputed and the "undetermined" decision may be updated (FR-EVA-13)
  Scenario: Grade protected after closing
    Given a regional-exam grade entered and then the period closed
    When a user attempts to edit it
    Then the edit requires the school leadership's logged unlock procedure
```

### FR-EVA-11 — Import certifying-exam results with a validation report

| Attribute | Value |
|---|---|
| Description | The school bulk-imports certifying-exam results from a structured file (format of ministry and Massar templates, file channel — no API, H-04): student matching by Massar code (preferred matching key, RG-04, DEC-04) with a fallback to last name, first name and date of birth, consistency checks (subject, session, grading scale), a line-by-line error report before confirmation, and all-or-nothing import per batch. No silent partial import: rejected lines are listed with a reason; the file and the report are kept as audit records. Since ministry file structures are not publicly documented, column mapping is configurable and reusable per format (see OQ-07). |
| Priority | Should |
| Version | V1 |
| Traceability | PROJECT.md §2.6, H-04, RG-04, DEC-04; `prd/research/04-pedagogy-massar-calendar.md` §2 (fragile re-import, undocumented structure); refers to `prd/modules/21-massar-regulatory-exports.md` |
| Actors | School leadership, academic leadership |

**Acceptance criteria:**

```gherkin
Feature: Import of certifying-exam results
  Scenario: Invalid file rejected with no partial import
    Given a ministry results file for a 2nd-year baccalaureate class
    And three lines do not match any Massar code at the school
    When the import is run
    Then no result is written and the error report lists the rejected lines with a reason
    And the source file and the report are kept as audit records

  Scenario: Valid import logged and protected after closing
    Given a valid results file for 3AC candidates
    And the grades match the announced session and subjects
    When the import is confirmed
    Then each grade is linked to the student, subject and session with source "ministry" and the import's author
    And any later edit after closing requires the school leadership's logged unlock procedure
```

### FR-EVA-12 — Prepare the class council

| Attribute | Value |
|---|---|
| Description | For each class and period, the system assembles the class-council file: per student, subject and overall averages, rank, change from the previous period, absences and tardiness (drawn from `prd/modules/13-attendance-student-life-discipline.md`), conduct grade, per-subject remarks, observations; for the class, averages and distribution, attendance rate. The homeroom teacher pre-enters an opinion and proposals; the school leadership prepares the agenda (promotion, track guidance at the end of 3AC and of the common core, disciplinary cases linked to student life). The file stays internal until deliberation (RG-29, INV-21). |
| Priority | Should |
| Version | V1 (class councils: PROJECT.md §12) |
| Traceability | PROJECT.md §7.5, §2.5, §8.1, RG-29, BES-SUR-07; PC-06 |
| Actors | School leadership (chair), homeroom teacher, head supervisor (input), teachers (opinions) |

### FR-EVA-13 — Record council remarks and decisions and produce the minutes

| Attribute | Value |
|---|---|
| Description | Following deliberation, the school leadership records: the general remark per student, the end-of-period decision, and, at year end, the decision carried by `YearDecision` (promoted to the next level, repeating the year, graduated, tracked into a program, undetermined — RG-09) with, for track guidance, the requested and awarded track. Decisions are logged with author and timestamp (RG-38). The council minutes are generated as a bilingual document, archived in the class file, and end-of-year decisions feed the N+1 rollover (PC-02, FR-INS-21 in `prd/modules/11-admissions-enrollment-reenrollment.md`) and the grade shown on the report card. **Certifying levels** (ARB-17i): the decision entered at the June rollover is "undetermined" until exam results are known; it is updated (promoted, graduated, repeating) once results are entered or imported (FR-EVA-10, FR-EVA-11, FR-MAS-10), before the grace period of the COMPLETED enrollment ends (INV-25), with the update kept traceable. At the MVP stage (wave 2), the requirement covers entering decisions and general remarks per class and the simplified minutes (a signed list of decisions); full council-file preparation (FR-EVA-12) and detailed minutes arrive in V1. |
| Priority | Must |
| Version | MVP (wave 2 — year-end closing, JAL-07: decisions, general remarks, simplified minutes; ARB-01); V1 (full class council with FR-EVA-12) |
| Traceability | PROJECT.md §7.5, §2.5, §6.3, RG-09, RG-38; PC-02, PC-06; ARB-01, ARB-17i |
| Actors | School leadership (entering decisions), homeroom teacher |

**Acceptance criteria (critical flows):**

```gherkin
Feature: End-of-year decisions (MVP, wave 2)
  Scenario: Bulk entry of a class's decisions
    Given class 2AC-3 with semester 2 of the 2026-2027 school year closed
    When the director enters "promoted to the next level" for 28 students and "repeating the year" for 2 students
    Then each decision is recorded with author and timestamp and shown on the end-of-year report card
    And the class's bilingual simplified minutes are generated and archived
    And the decisions are available for the FR-INS-21 rollover

  Scenario: Certifying level awaiting results
    Given class 3AC-1, whose regional exam is held after the June closing
    When the director runs the rollover
    Then each student's decision is "undetermined"
    And once results are imported in July, it is updated to "promoted" or "repeating" with the update traced
```

### FR-EVA-14 — Generate bilingual report cards from configurable templates

| Attribute | Value |
|---|---|
| Description | The school configures report-card templates per cycle and section: header (school, year, period, class, headcount), student identity in dual French/Arabic script (DEC-10), subject tables with weightings, per-period grades and average, overall average, rank, honors, per-subject and general remarks, conduct grade where applicable (produced by `prd/modules/13-attendance-student-life-discipline.md`), attendance summary, applicable weighting table and text reference (FR-EVA-08), seal and school-leadership signature zones. Each template exists in French, Arabic and bilingual versions (right-to-left Arabic layout, DEC-10). Generation produces a bilingual PDF document compliant with the NFR-DOC document requirements (`prd/cross-cutting/32-non-functional-requirements.md`) and the rules of the documents module (DOC module, `prd/modules/15-documents-certificates.md`): A4 and A5 formats, Arabic fonts, batch printing. "NG" subjects and exemptions appear with their notation (FR-EVA-07). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.5, §2.5, §10 (documents), DEC-10 |
| Actors | School leadership (templates, publication), front desk (printing), system |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Generation of bilingual report cards (MVP)
  Scenario: Bilingual report card for a national-system class
    Given the default bilingual template for the middle-school cycle and class 2AC-3 closed for semester 1
    When the school leadership generates the class's report cards
    Then each PDF report card carries the student's identity in dual script, subjects with weightings, averages, rank, honors and remarks
    And the Arabic layout renders right-to-left with correct Arabic fonts
    And the weighting table and its text reference appear on certifying-level report cards

  Scenario: Generation under a performance constraint
    Given a school of 2,000 students whose classes are all closed
    When the school leadership starts generating all report cards
    Then each report card is produced in under 3 seconds and the full batch in under 10 minutes
```

### FR-EVA-15 — Publish report cards to families with immutability and versioning

| Attribute | Value |
|---|---|
| Description | The school leadership publishes report cards by class then by period: each published report card becomes immutable — version, fingerprint, signatory, publication date frozen (RG-33, DEC-09, INV-26) — and the student and their authorized guardians are notified (`ReportCardPublished` event, notification via `prd/modules/17-communication-notifications.md`). The published report card remains permanently readable by the student and their guardians per their rights, even after leaving the school (RG-28, INV-20); it is never blocked for unpaid balances (DEC-24, INV-39: arrears appear only as an alert on the account). Version history remains available, with earlier versions marked "superseded". |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.5, §12, RG-28, RG-33, DEC-09, DEC-24, INV-20, INV-26, INV-39; `ReportCardPublished` event |
| Actors | School leadership (publication); viewing: student, parents, teachers (their subjects), student life, front desk |

**Acceptance criteria:**

```gherkin
Feature: Publication of period report cards
  Scenario: Bulk publication and notification
    Given semester-1 results validated and closing recorded for class 2AC-3
    When the director publishes the class's report cards
    Then each report card is frozen as version 1 with fingerprint, signatory and date
    And the student and their authorized guardians receive the publication notification
    And the report card remains permanently readable, even after the student leaves

  Scenario: No blocking of report cards for unpaid balances
    Given a student whose financial guardian has arrears
    When their class's report cards are published
    Then that student's report card is published and viewable like any other
    And the arrears appear only as an alert on the financial account
```

### FR-EVA-16 — Verify report-card and transcript authenticity by QR code

| Attribute | Value |
|---|---|
| Description | Every published report card and transcript carries a verification QR code allowing a printed document's authenticity to be checked (RG-33, G-19): the verification page, accessible without an account, shows the authenticity status, the issuing school, the school year, the period, the current version and a "superseded" flag where applicable, without exposing detailed grades or data beyond what is strictly necessary. The QR code is tied to the document's fingerprint and covers reissues; it relies on the same verification component as the documents module's documents. In V1, report cards and transcripts carry the school's advanced electronic seal and a timestamp (DEC-30); the qualified seal via an approved provider is out of scope for this chapter (V2, `prd/cross-cutting/35-external-integrations.md`). |
| Priority | Must |
| Version | V1 (DEC-30 dates the verification QR code to V1; immutability and versioning from the MVP, INV-26; ARB-19, OQ-09 resolved) |
| Traceability | PROJECT.md §7.5, RG-33, DEC-09, DEC-30, G-19, INV-26; refers to `prd/cross-cutting/35-external-integrations.md` (INT-SIG) |
| Actors | Third-party verifier (no account); system |

**Acceptance criteria:**

```gherkin
Feature: Authenticity verification of a published report card
  Scenario: Checking a printed report card by QR code
    Given a published, printed semester-1 report card carrying its verification QR code
    When a third party scans the QR code
    Then the verification page shows "authentic", the issuing school, the year, the period and the current version
    And no detailed grade or personal data beyond what is strictly necessary is exposed

  Scenario: Correction after publication
    Given a grading error found after publishing version 1 of a report card
    When the school leadership makes the correction
    Then a version 2 is generated, signed and published
    And version 1 remains viewable marked "superseded"
    And the current version's QR code reflects the version history
```

### FR-EVA-17 — Correct a published report card by creating a new version

| Attribute | Value |
|---|---|
| Description | Any correction to a published report card creates a new version: the old version remains viewable marked "superseded", the new one carries its own fingerprint, signatory and date (RG-33, INV-26). The correction is reserved to the school leadership, must be justified, logged (RG-38) and notified to the recipients of the superseded version. There is no direct edit of a published report card, regardless of the time elapsed (ARB-17g); the RG-32 grace period concerns closing the enrollment, not publication. Report cards are kept permanently by the school (DEC-22). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.5, RG-33, RG-38, DEC-09, DEC-22, INV-26; ARB-17g |
| Actors | School leadership |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Correcting a published report card (MVP)
  Scenario: New version after an entry error
    Given Youssef's semester-1 report card published as version 1
    When the school leadership corrects a grade and republishes with a reason
    Then a version 2 is published with its own fingerprint, signatory and date
    And version 1 remains viewable marked "superseded" and the recipients are notified
  Scenario: No direct edit
    Given a report card published ten days ago
    When a user attempts to directly edit its content
    Then the action is impossible: only the creation of a new version is offered
```

### FR-EVA-18 — Issue annual and cumulative transcripts

| Attribute | Value |
|---|---|
| Description | The system produces, at the request of the student or their guardians and at the school's request: the annual transcript (a summary of the year's periods and the end-of-year decision) and the multi-year cumulative transcript (the student's path within the school, for post-baccalaureate applications). These transcripts are bilingual documents carrying a seal and signature, generated as PDFs, downloadable in self-service from the parent and student portals (verification QR code and advanced electronic seal in V1, FR-EVA-16). They fall under official documents: permanent retention (DEC-22), permanently readable access even after leaving (RG-28), year-end transcript included in the default transfer profile (RG-31, INV-23), never blocked for unpaid balances (DEC-24). |
| Priority | Must |
| Version | MVP (wave 2 — year-end closing, JAL-07: annual transcript, required for the exit file FR-DOC-01 and the transfer profile RG-31; ARB-01); V1 (multi-year cumulative transcript, BES-ELE-06) |
| Traceability | PROJECT.md §7.5, §6.9, RG-28, RG-31, DEC-22, DEC-24, BES-ELE-06; ARB-01 |
| Actors | Student (directly if an adult, via guardians if a minor), parents, school leadership, front desk |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Annual transcript (MVP, wave 2)
  Scenario: Annual transcript after year-end closing
    Given Youssef's 2026-2027 enrollment moved to COMPLETED with the decision "promoted to the next level"
    When his father downloads the annual transcript from his account
    Then the bilingual PDF shows both semesters' averages, the annual average and the end-of-year decision
    And it is produced with no condition tied to the financial balance

  Scenario: Cumulative transcript (V1)
    Given Salma, an adult student, enrolled for three years at the school
    When she requests the cumulative transcript
    Then the document covers the three years with an advanced electronic seal and a verification QR code
```

### FR-EVA-19 — Publish detailed grades progressively (option)

| Attribute | Value |
|---|---|
| Description | By default, detailed grades become visible to families when the period's report card is published. The school may enable progressive publication: each assessment becomes visible (grade, teacher's remark) as soon as the teacher publishes it, without waiting for closing; the period average is only exposed on dates set by the school. As long as a grade is not published, it stays internal (RG-29, INV-21; the baseline's §8.3 matrix: no parental view of unpublished grades). The scope (assessment types covered, levels) is configurable by the school. Publishing an assessment moves its `Mark` records from "draft" to "published" status (FR-EVA-03) and triggers a notification to guardians per the rules of `prd/modules/17-communication-notifications.md` (MVP channels: in-app and SMS, grouped daily). Default value: disabled (publication with the report card); enabling it is at the school leadership's discretion (ARB-17f, OQ-06 resolved). |
| Priority | Must |
| Version | MVP (configurable option, disabled by default; ARB-17f, BES-PAR-02) |
| Traceability | PROJECT.md §2.1 (expectation of real-time grade communication), §8.3, RG-29; BES-PAR-02; ARB-17f |
| Actors | School leadership (configuration), teacher (publishing their assessments); viewing: student, parents |

**Acceptance criteria (critical flows):**

```gherkin
Feature: Progressive publication of grades (MVP)
  Scenario: Publishing a test as it happens
    Given a school that has enabled progressive publication for class tests
    And a test whose grades are all entered as drafts
    When the teacher publishes the assessment
    Then the grades move to "published" status and become visible to guardians and the student
    And a grouped daily notification is sent to guardians
    And the period average remains invisible until the date set by the school

  Scenario: School without progressive publication
    Given a school keeping the default setting
    When a teacher finishes entering a test
    Then no grade is visible to families before the report card is published
```

---

## 5. Morocco specifics

1. **National continuous-assessment reference framework.** Continuous assessment is an integral part of teaching in every subject, under inspector supervision (memo of 11/01/2006, still invoked). The baseline sets the product rule: at least two class tests per subject and per semester, plus one unified school test per semester, except in the second semester of exam years (PROJECT.md §2.5); it is implemented as a compliance check before closing (FR-EVA-06).
2. **Certifying-exam weightings.** Default values from the research (H-02 confirmed and completed; `prd/research/04-pedagogy-massar-calendar.md` §1): 6AP 50/25/25; 3AC 30/30/40 (including 15% + 15% continuous assessment per semester, local exam at the end of S1); baccalaureate 25/25/50 with the regional exam at the end of year 1 and the national exam at the end of year 2. The "provincial exam" label for 6AP follows the baseline §2.2 (the research says "regional": a divergence flagged, ARB-18). Decree numbers were not found online (H-16): the text reference is entered and traced, not pre-printed (FR-EVA-08, OQ-01).
3. **Memoranda 080.21 and 081.21 suspended.** The ministry memos of 15/09/2021 setting rules for homework (2 assignments + 1 unified test per semester) and the 6AP 75/25, 3AC 50/50 variants were suspended on **29/11/2021** — a date correcting the baseline (which said "November 2022"); the PRD records this variant as a past configuration version and keeps the standard default weightings (correction in `prd/research/00-baseline-corrections.md` item 3).
4. **Baccalaureate honors and resit.** Highest distinction from 16; distinction from 14; merit from 12; pass from 10; resit session between 8 and 9.99 (PROJECT.md §2.2; `prd/research/04-pedagogy-massar-calendar.md` §1).
5. **External-exam grades.** Regional- and national-exam grades come from the ministry, not the school (PROJECT.md §2.5): manual entry in MVP, structured import in V1 over the file channel (no Massar API, H-04); Excel-file structures are not publicly documented and re-import is reported to be fragile (`prd/research/04-pedagogy-massar-calendar.md` §2) — hence configurable mapping and a validation report before confirmation (FR-EVA-11).
6. **Bilingual report cards with seal.** Report cards are often bilingual (Arabic and French) and carry the school leadership's seal and signature (PROJECT.md §2.5): AR/FR/bilingual templates with RTL layout, advanced electronic seal and timestamp in V1 (DEC-30), verification QR code (RG-33).
7. **Semesters vs. trimesters.** The semester is the assessment period for the three cycles of the national system, primary included; the trimester is specific to schools following the French reference framework; some bilingual schools run on trimesters (DEC-35 pilot). Period configuration is per section (FR-EVA-02).
8. **Time and calendar.** Period boundaries are dated in local `Africa/Casablanca` time: a **permanent switch to UTC+0 on 20/09/2026**, with no seasonal alternation or Ramadan exception (decree 2.26.530, Official Gazette No. 7521 of 29/06/2026 — baseline correction, `prd/research/00-baseline-corrections.md` item 1); internal storage in UTC. The 2027 national baccalaureate exam runs from June 1 to 3, 2027: maintenance windows are prohibited during exams (PROJECT.md §10; `prd/research/04-pedagogy-massar-calendar.md` §3).
9. **Double entry in Massar.** Private schools enter continuous-assessment grades into Massar at every level, structurally unavoidable for certifying levels (PROJECT.md §2.6, H-03): ZSchool produces faithful exports per subject, class and semester (MAS module, `prd/modules/21-massar-regulatory-exports.md`) without promising synchronization; the residual double entry is accepted until an official channel, if any, becomes available.

---

## 6. Data and events

Entities from the consolidated schema (PROJECT.md §6.10, dictionary in `prd/03-domain-data-model.md` §2) drawn on by the module:

| Entity | Use in the module | Key constraints |
|---|---|---|
| `EvaluationPeriod` | Assessment periods (semesters, trimesters, sub-periods), dates, closing status | Linked to the school year; locked at closing (FR-EVA-05) |
| `Assessment` | Assessment: type, subject, class **or group**, period, grading scale, weighting | Linked to context (INV-27); reference-framework compliance (FR-EVA-06); linkage to a `Group` to be added to the dictionary (ARB-17j) |
| `Mark` | A student's grade, marker (justified or unjustified absence, exempted, ungraded) and remark for an assessment; **draft / published status** (ARB-17f) | Author, timestamp; not visible outside the school until published (RG-29, INV-21) |
| `Remark` | Per-subject remark and general remark | Author, scope; internal observations not portable (RG-29) |
| `PeriodResult` | Subject and overall averages, rank, honors, remarks, per period; "excluded from rank" flag (ARB-17e) | Frozen at closing; recomputed continuously during the period |
| `YearDecision` | End-of-year decision (promotion, repeating the year, graduation, track guidance, undetermined) | Carried by the COMPLETED enrollment (RG-09); feeds the rollover (PC-02); "undetermined" updated on import of certifying results (ARB-17i) |
| `ReportCard` | Period report card: versions, fingerprint, signatory, date, QR code | Immutable after publication; earlier versions marked "superseded" (RG-33, DEC-09, INV-26) |
| `Transcript` | Annual and cumulative transcript | Published document, permanent access (RG-28); permanent retention (DEC-22) |
| `ConductGrade` | Conduct grade reproduced on the report card | Produced by `prd/modules/13-attendance-student-life-discipline.md`; not portable (RG-29) |
| `EvaluationPeriod`, `ComputationRule`, `GradingScale`, `SubjectLevelConfig` | Configuration framework (periods, calculation rules, scales, weightings per level and track) | Weighting and language per level and track, never global (RG-26, INV-41); letter and GPA scales: V2+ |
| `Enrollment`, `StudentProfile` | Carries all grades and results; import matching by Massar code | No floating school data (DEC-18, INV-27); Massar code as the matching key (RG-04, DEC-04) |

Domain events (event dictionary in `prd/03-domain-data-model.md` §7) produced or consumed by the module:

| Event | Produced by | Consumers and effects |
|---|---|---|
| `PeriodClosed` | Assessments (closing by the school leadership) | Teachers (entries locked), school leadership; triggers the frozen calculation and opens the councils |
| `ReportCardPublished` | Assessments (publication) | Student and guardians (notification, QR code available); publication logged |

Associated notifications (multichannel routing, templates, costs) are carried by `prd/modules/17-communication-notifications.md` (DEC-12, DEC-36; at the MVP stage, in-app and SMS channels, with WhatsApp "utility" limited to attendance notifications — arbitration D1). Every write to grades, locking, unlocking, publication and correction carries author, context and timestamp at the record level from the MVP stage on (minimal history — correction D4); the immutable, exportable AuditLog is V1 (arbitration recorded in OQ-07 of `prd/modules/13-attendance-student-life-discipline.md`).

---

## 7. Key screens

Screens described in text, mobile-first; the interface exists in French and Arabic (RTL) from the MVP (DEC-10, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`). Bilingual labels are given for illustration.

### ECR-EVA-01 — Teacher's assessments home screen (mobile, PWA)

Zones: context selector (profile, school — RG-03); list of the teacher's courses (subject × class or group); per course, the current period's status (open, closed) and a badge with the number of pending entries; "new assessment" shortcut; offline banner with a counter of grades pending synchronization. States: period open (actions active), closed (read-only). Behavior: the last-viewed class persists; bilingual labels "Assessments" / "التقييمات".

### ECR-EVA-02 — Entering an assessment's grades (mobile)

Zones: header (subject, class, assessment type, grading scale, weighting, period); alphabetically sorted student list with photo; numeric entry field validated against the grading scale (decimals allowed), field-to-field navigation by touch or keyboard; absent/exempted/ungraded markers; optional short-remark field; progress indicator (grades entered vs. headcount); "save draft" and "finish entry" actions. States: draft (editable, not visible to families), entry complete (to be validated), locked (read-only after closing); permanent offline banner with the number of values pending synchronization. Behavior: automatic draft save on every value, conflict resolution at sync with an overwrite alert (FR-EVA-04); bilingual labels "Grade entry" / "تسجيل النقط".

### ECR-EVA-03 — Period closing (web, school leadership)

Zones: year, period, class or global selection; a subjects × classes cross-table with an assessment-count-per-type indicator and a compliance status (compliant, gaps, non-compliant); a detailed gap report with a reminder sent to the teachers concerned; a justified-waiver box (logged); a closing button with a confirmation screen listing the effects (locking, notification). States: period open, partial compliance, closed. Behavior: at the MVP stage, closing is always possible with an informational warning of apparent gaps, with no compliance blocking (FR-EVA-05); in V1, a full compliance indicator and closing refused until compliance is reached or waived (FR-EVA-06); bilingual labels "Period closing" / "إغلاق الدورة".

### ECR-EVA-04 — Assessment configuration (web, school leadership)

Zones: assessment-type library (default grading scale, weighting); assessment periods per section with sub-periods; calculation rules (rounding, exclusion, honors, rank, thresholds); default national weightings with text reference and version year; change history. Behavior: any change made during the school year is versioned, logged and has no retroactive effect on closed periods (FR-EVA-07, FR-EVA-08).

### ECR-EVA-05 — Certifying-exam results (web)

Zones: certifying-level, session, subject selection; file import with reusable column mapping and a validation report (lines accepted, rejected with a reason); manual line-by-line entry as a supplement; log of imports and entries (source, author, timestamp). States: import draft, validated, imported; import blocked on a closed period without the school leadership's unlock (FR-EVA-10, FR-EVA-11).

### ECR-EVA-06 — Class-council file (web, school leadership and homeroom teacher)

Zones: student list with overall average, rank, change between periods, absences and tardiness, conduct, per-subject remarks; a detailed per-student card (averages, observations, homeroom teacher's opinion, proposed decision); a class view (average distribution, attendance rate); a box for recording the decision and general remark; minutes generation. States: preparation, deliberated, decisions recorded, minutes archived. Behavior: the file stays internal until it is recorded (RG-29); end-of-year decisions propagate to the rollover (FR-EVA-12, FR-EVA-13). At the MVP stage (wave 2), only the per-class decision-recording box (bulk entry) and the simplified-minutes generation are delivered; the full preparation file arrives in V1.

### ECR-EVA-07 — Report cards: templates, publication and versions (web, school leadership)

Zones: template library (AR, FR, bilingual) with preview; class and period selection; student list with report-card status (to generate, generated, published, superseded); individual preview before publication; bulk publication with confirmation; per-student version history (fingerprint, signatory, date, "superseded" flag); A4/A5 batch printing. Behavior: publication freezes the version and emits the notification (FR-EVA-14, FR-EVA-15); a correction creates a new version with a reason (FR-EVA-17).

### ECR-EVA-08 — Viewing results (mobile, parent and student)

Zones: child selector (multi-child, multi-school view — RG-03); latest published report card (bilingual PDF rendering with seal and signature; QR code in V1); period and version history; detailed published grades where applicable (FR-EVA-19); download and share. States: no publication yet (waiting message), published, superseded (current version shown). Behavior: opened from a publication notification; permanently readable even after leaving (RG-28); no display of unpublished grades (RG-29).

### ECR-EVA-09 — Annual and cumulative transcripts (web editing, mobile viewing)

Zones: student and year selection; annual-transcript preview (periods, averages, decision — MVP wave 2) and multi-year cumulative-transcript preview (V1); bilingual PDF generation with seal and signature (QR code in V1); reissue history. Behavior: self-service for parent and student; the year-end transcript is automatically offered in the transfer profile (RG-31); never blocked for unpaid balances (FR-EVA-18).

---

## 8. Integrations

Integrations are specified in detail in `prd/cross-cutting/35-external-integrations.md`; this chapter only sets the module's needs:

| Integration | Module need |
|---|---|
| INT-MAS (Massar) | Export of continuous-assessment grades in Massar template format, per subject, class and semester, with a validation report before submission (file structure not publicly documented, fragile re-import); structured import of certifying-exam results (FR-EVA-11); no automation of Massar data entry (H-04). Refers to `prd/modules/21-massar-regulatory-exports.md`. |
| INT-SIG (signature and seal) | The school's advanced electronic seal and timestamp on report cards and transcripts in V1; verification QR code tied to the document's fingerprint; qualified seal via a DGSSI-approved provider in V2 (DEC-30). Refers to `prd/cross-cutting/35-external-integrations.md`. |

Notifications (publication, closing, compliance alerts) go through the communication module's channels (at the MVP stage: in-app and SMS, with WhatsApp "utility" limited to attendance notifications; general rollout in V1 — `prd/modules/17-communication-notifications.md`, DEC-12, DEC-36, arbitration D1).

---

## 9. Module-specific non-functional requirements

Numbering carried by `prd/cross-cutting/32-non-functional-requirements.md`; domains cited without a number (conventions `prd/00-conventions.md` §2):

| Domain | Requirement applied to the module | Source |
|---|---|---|
| NFR-PERF | Report-card generation under 3 s; report-card publication for a 2,000-student school under 10 minutes; usual pages under 2 s on 4G, including entry grids | PROJECT.md §10; PC-06 |
| NFR-OFF | Grade entry resilient to outages, with synchronization and conflict resolution (FR-EVA-04) | PROJECT.md §10 |
| NFR-I18N | Full FR and AR with RTL from the MVP; names in dual script on report cards and transcripts; bilingual documents | PROJECT.md §10, DEC-10 |
| NFR-DOC | Bilingual PDFs, correct Arabic fonts, A4 and A5 formats, batch printing (report cards, transcripts, minutes) | PROJECT.md §10 |
| NFR-MOB | PWA in MVP for teachers, parents and students; native apps in V2 | PROJECT.md §10, §12 |
| NFR-DISP | 99.5% target excluding announced maintenance; maintenance windows outside school-start and exam periods (period closings and the June results import are critical peaks) | PROJECT.md §10; PC-06 |
| NFR-RES | Sizing of generation and publication peaks to the three-year technical target (500 schools, 500,000 students) | PROJECT.md §10 |
| NFR-INT | Excel, CSV and PDF exports available on grade, average and result lists | PROJECT.md §10 |

Applicable security requirements: least privilege on grades (INV-34, RG-39), logging of writes and sensitive views (minimal history at MVP, immutable exportable AuditLog in V1 — correction D4, OQ-07 in `prd/modules/13-attendance-student-life-discipline.md`; RG-38, INV-33), multi-tenant isolation (INV-17) — detailed in `prd/cross-cutting/30-roles-permissions-matrix.md` and `prd/cross-cutting/31-security-privacy.md`.

---

## 10. Success metrics

Product indicators are numbered in `prd/cross-cutting/38-kpi-success-metrics.md`; the module proposes the following candidate measures, to be carried up there upon review:

| Candidate measure | Definition |
|---|---|
| Closing-to-publication lag | Median duration between period closing and report-card publication, per school and per period (service target to be set on review) |
| First-pass compliance rate | Share of classes that pass the national-reference-framework compliance check with no gap on the first check (FR-EVA-06) |
| Under-48-hour viewing rate | Share of published report cards viewed by at least one guardian or the student within 48 hours of the notification (measures the parent-app promise, BES-PAR-02) |
| Post-publication correction rate | Number of correction versions per 100 published report cards (entry and calculation quality; low target) |
| Progressive-publication adoption | Share of schools enabling progressive grade publication (FR-EVA-19) and the resulting viewing rate |

---

## 11. Open questions

`OQ-NN` counter specific to this file (conventions §2). The baseline/research divergences cited below are those of `prd/research/00-baseline-corrections.md`:

| ID | Question | Context |
|---|---|---|
| OQ-01 | Text references to pre-load for certifying weightings (baccalaureate, brevet, primary-school-certificate decrees) and correction of the memoranda 080.21/081.21 suspension date (29/11/2021, not "November 2022"). | The baseline §2.2 carries the wrong date; decree numbers were not found online (H-16; baseline correction item 3; `prd/research/04-pedagogy-massar-calendar.md` §1). The PRD sets the text reference as a traced free-text field; to be confirmed with pilots and primary texts. |
| OQ-02 | The Massar grade-module framing text (memo 1887/13, 2013) is not corroborated online: Massar requirements should be phrased without depending on the exact number. | Baseline correction item 4; PROJECT.md §16.2 H-16. To be confirmed with pilots and the Ministry of National Education; impacts mainly `prd/modules/21-massar-regulatory-exports.md`. |
| OQ-03 | Timezone: update of baseline §2.4 and §10 ("UTC+1, back to UTC+0 during Ramadan") to permanent UTC+0 since 20/09/2026 (decree 2.26.530, Official Gazette No. 7521 of 29/06/2026). | Baseline correction item 1. This chapter models period boundaries in permanent UTC+0, UTC storage; the Ramadan schedule variant remains a pedagogical need (`prd/modules/12-academic-structure-timetables.md`). |
| OQ-04 | Version of trimester-period configuration: the MVP §12 cites the "academic structure (national model)" (semester-based), but DEC-35 includes a bilingual pilot running on trimesters. | **Resolved — ARB-01, ARB-17h**: semester/trimester/sub-period configuration from the MVP (FR-EVA-02) with a trimester → Massar-semester mapping table. |
| OQ-05 | Exact scope of the "except in the second semester of exam years" waiver: does the suspension of the unified test apply alone (with the two class tests still required) and only to certifying levels (6AP, 3AC, baccalaureate years 1 and 2)? | The baseline §2.5 states the waiver with no per-cycle detail; the FR-EVA-06 configuration allows either reading. To be confirmed with pilots. |
| OQ-06 | Progressive publication of detailed grades: default value (publication with the report card only, this chapter's working assumption) and the version at which it is enabled. | **Resolved — ARB-17f**: an MVP option, disabled by default, draft/published status on `Mark`; FR-EVA-19 retagged MVP to support BES-PAR-02. |
| OQ-07 | Certifying-exam-results file format: column structure not publicly documented and fragile re-import (testimonies, `prd/research/04-pedagogy-massar-calendar.md` §2). | Working assumption: configurable, reusable column mapping per school and per format, with a validation report (FR-EVA-11); actual formats to be gathered from pilots. |
| OQ-08 | Conduct grade on the report card: default weighting in the overall average (if any), scale (out of 20) and applicable cycle. | Conduct is produced by `prd/modules/13-attendance-student-life-discipline.md` and reproduced on the report card; the baseline sets neither a scale nor a weighting; to be aligned with that module on review; twin question to OQ-04 of `prd/modules/13-attendance-student-life-discipline.md`, a single arbitration on review. |
| OQ-09 | Deferral of the verification QR code to V1: DEC-09 and G-19 include verification in the report-card immutability mechanism, while INV-26 and §12 reserve immutability to the MVP and the QR code to V1 (FR-EVA-16). | **Resolved — ARB-19**: DEC-30, later and more specific, explicitly dates the verification QR code to V1; no deviation from a baseline decision. Immutability and versioning apply from the MVP. |
| OQ-10 | Linking an `Assessment` to a `Group` (a language, elective or lab group): the dictionary in `prd/03-domain-data-model.md` only cites `Class`. | Clarification to be added to the dictionary (ARB-17j); has no effect on calculation rules. |

---

## 12. Traceability

| Baseline ID | Baseline element | Coverage in this file |
|---|---|---|
| §2.1 | Expectation of real-time grade communication | FR-EVA-19; §10 |
| §2.2 | Certifying-exam weightings and honors | FR-EVA-08, FR-EVA-09; §5 (items 2 and 4) |
| §2.3 | Coexisting education systems (trimesters, scales) | FR-EVA-02; §1.3 (GPA V2+) |
| §2.5 | Assessment and grading (continuous assessment, periods, council, bilingual report cards) | FR-EVA-01 to FR-EVA-19; §5 |
| §2.6 | Massar (grade entry, no API) | FR-EVA-11; §5 (item 5); §8 (INT-MAS) |
| §6.7 | Academic structure (periods, grading scales, calculation rules) | FR-EVA-02, FR-EVA-07, FR-EVA-08; §6 |
| §7.5 | Assessments, grades and report cards module | §1, FR-EVA-01 to FR-EVA-18 |
| §8.1, §8.3 | Roles and access matrix (unpublished grades, published report cards) | §2; FR-EVA-03, FR-EVA-19 |
| §10 | Non-functional requirements (offline, performance, documents, languages, availability) | FR-EVA-04; §9 |
| §12 | Scope by version | Version column of every requirement; §1.2; OQ-04 |
| §17 | Glossary (AR/FR terminology) | Terminology throughout the chapter |
| RG-04, DEC-04 | Massar code as matching key | FR-EVA-11 |
| RG-09 | End-of-year decision | FR-EVA-13 |
| RG-14 | Access for legal guardians and the custodial parent | §2 |
| RG-24, RG-25, RG-26 | Structure templates, cloning, per-level and per-track weightings | FR-EVA-02, FR-EVA-07, FR-EVA-08; §6 |
| RG-27 | Author and data subject | FR-EVA-03 |
| RG-28 | Permanent access to published data | FR-EVA-15, FR-EVA-18 |
| RG-29 | Unpublished grades not portable | FR-EVA-03, FR-EVA-12, FR-EVA-19; §6 |
| RG-31 | Transfer profile (year-end transcript) | FR-EVA-18 |
| RG-32 | Immutability after closing, grace period | Not applicable to report cards (ARB-17g); closing grace period carried by `prd/modules/18-transfers-mobility.md` (FR-TRA-11) |
| RG-33 | Immutable report cards, versions, QR code | FR-EVA-05, FR-EVA-15, FR-EVA-16, FR-EVA-17 |
| RG-38 | Logging of writes | FR-EVA-03, FR-EVA-05, FR-EVA-13, FR-EVA-17; §6, §9 |
| RG-39 | Least privilege (teacher limited to their courses) | FR-EVA-01, FR-EVA-03 |
| DEC-09 | Published report cards immutable and versioned, QR code | FR-EVA-15, FR-EVA-16, FR-EVA-17; OQ-09 (resolved, ARB-19) |
| DEC-10 | FR/AR, dual script, bilingual documents | FR-EVA-14; §7 |
| DEC-18 | School data linked to the enrollment | FR-EVA-03; §6 |
| DEC-22 | Permanent retention of report cards and transcripts | FR-EVA-17, FR-EVA-18 |
| DEC-24 | No blocking of official documents for unpaid balances | FR-EVA-15, FR-EVA-18 |
| DEC-30 | Advanced seal and timestamp in V1, qualified in V2 | FR-EVA-16; §8 (INT-SIG) |
| DEC-35 | Bilingual trimester pilot | FR-EVA-02; OQ-04 |
| G-12 | Configurable assessment system | §1, FR-EVA-01 to FR-EVA-09 |
| G-19 | Immutability, versioning, verification | FR-EVA-15, FR-EVA-16, FR-EVA-17; OQ-09 |
| H-02 | Certifying-exam weightings confirmed and completed | FR-EVA-08; §5 |
| H-04 | No Massar API, file channel | FR-EVA-11; §5, §8 |
| H-16 | Primary texts to verify (decrees, ministry memos) | OQ-01, OQ-02 |
| `prd/research/00-baseline-corrections.md` items 1, 3, 4 | UTC+0 timezone, 29/11/2021 suspension, memo 1887/13 not corroborated | FR-EVA-08; §5 (items 3 and 8); OQ-01 to OQ-03 |
| `prd/research/04-pedagogy-massar-calendar.md` §1, §2 | Weightings, honors, Massar Excel channel | FR-EVA-08, FR-EVA-09, FR-EVA-11; §5 |
| INV-17, INV-20, INV-21, INV-25, INV-26, INV-27, INV-33, INV-34, INV-39, INV-41, INV-42 | Data-model invariants | FR-EVA-03, FR-EVA-05, FR-EVA-07, FR-EVA-08, FR-EVA-15, FR-EVA-17, FR-EVA-19; §6, §9 |
| BES-DIR-06, BES-DIR-08 | Closing, locking, compliance | FR-EVA-05, FR-EVA-06 |
| BES-ENS-03, BES-ENS-08 | Mobile grade entry, class averages | FR-EVA-03, FR-EVA-04 |
| BES-PAR-02, BES-GAR-01 | Notification and viewing by guardians | FR-EVA-15, FR-EVA-19 |
| BES-ELE-03, BES-ELE-06 | Viewing report cards, post-bac transcripts | FR-EVA-15, FR-EVA-18 |
| PC-06 | Grade, council and report-card journey | §1, §3, FR-EVA-01 to FR-EVA-17 |
| `PeriodClosed`, `ReportCardPublished` events | Event dictionary | FR-EVA-05, FR-EVA-15; §6 |
| FR-VSC-22 (`prd/modules/13`) | Rank exclusion | FR-EVA-09 (indicator on `PeriodResult`) |
| FR-MAS-04, FR-MAS-06, FR-MAS-10 (`prd/modules/21`) | Trimester → semester mapping, single check, certifying results | FR-EVA-02, FR-EVA-06, FR-EVA-13 |
| ARB-01 (`prd/cross-cutting/42`) | MVP scope by wave | FR-EVA-13, FR-EVA-18 (wave 2); §1.2 |
| ARB-17 (`prd/cross-cutting/42`) | MVP calculation rules | FR-EVA-01, FR-EVA-02, FR-EVA-03, FR-EVA-07, FR-EVA-09, FR-EVA-10, FR-EVA-13, FR-EVA-17, FR-EVA-19; §6 |
| ARB-18 (`prd/cross-cutting/42`) | "Provincial exam" label for 6AP | FR-EVA-08, FR-EVA-10; §5 |
| ARB-19 (`prd/cross-cutting/42`) | Verification QR code in V1 (DEC-30) | FR-EVA-16, FR-EVA-18; OQ-09 |
