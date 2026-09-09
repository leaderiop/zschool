# Module MAS — Massar and Regulatory Exports

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review; arbitrations from `prd/cross-cutting/42-review-arbitrations.md` applied (ARB-01, ARB-17, ARB-18, ARB-23, ARB-24) |
| Source | `PROJECT.md` §2.5 (continuous assessment), §2.6 (Massar and national identifiers), §2.7 (processor role), §7.9 (transfers), §7.11 (ESISE regulatory statistics), §7.12 (Massar and regulatory exports, G-08), §9 (anti-enumeration), §12 (scope by version); RG-04, RG-05, RG-07, RG-38; DEC-04, DEC-10; G-08; H-03, H-04, H-10, H-13, H-16; `prd/research/00-baseline-corrections.md` (corrections no. 4 and 11); `prd/research/04-pedagogy-massar-calendar.md` §1–2; `prd/cross-cutting/42-review-arbitrations.md` (ARB-01, ARB-17, ARB-18, ARB-23, ARB-24) |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/modules/10-administration-onboarding-subscription.md` (FR-ADM, matching), `prd/modules/11-admissions-enrollment-reenrollment.md` (FR-INS), `prd/modules/14-assessments-grades-report-cards.md` (FR-EVA), `prd/modules/18-transfers-mobility.md` (FR-TRA), `prd/modules/20-dashboards-reporting.md` (FR-RAP), `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md` (INT-MAS), `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` |

---

## 1. Purpose and scope

This module fills gap G-08: the dialogue between ZSchool and the education authorities. It makes the platform the preparation station for everything a school must transmit to the ministry — student lists, continuous-assessment grades, ESISE statistics, transfer references — and the controlled receptacle for what the ministry sends back (certifying-exam results). Its central promise is **eliminating double entry**: ZSchool produces files in the format of Massar's templates, which the school downloads and imports into Massar itself; it never automates data entry into Massar (H-04, confirmed). Its second promise is **submission reliability**: Massar's Excel file structures are not publicly documented and re-import often fails even without changing the file (`prd/research/04-pedagogy-massar-calendar.md` §2); so no file is submitted without a prior validation report, and templates are managed as file versions.

### 1.1 In scope

| Scope | Content | Version |
|---|---|---|
| Massar code | A field on the student profile: format (one letter followed by nine digits), unique across the whole platform, optional, protected against enumeration — the rule is carried by FR-INS-06, this module references it (ARB-24e) | MVP |
| Export templates | Version-managed file templates, activated by ZSchool with no rollout on the school's side | MVP (wave 2 — year-end close, JAL-07; ARB-01) |
| Massar exports | Student lists and continuous-assessment grades by subject and semester, in the format of Massar's entry-module files, with a period-to-semester mapping for trimestral schools (ARB-17h) | MVP (wave 2 — year-end close, JAL-07; ARB-01) |
| Validation report | Completeness, template compliance, and consistency checks, mandatory before any submission | MVP (wave 2 — year-end close, JAL-07; ARB-01) |
| Pedagogical compliance | Exposing the continuous-assessment referential compliance status produced by FR-EVA-06 (sole owner: a warning at MVP, a blocking check unless waived in V1 — arbitration D3) within the MAS portal and the closing statement; no second tally | MVP (view); V1 (closing statement and waivers) |
| ESISE | Preparing the three filings: private-school census (May), HR referential, year-end results | V1 |
| Certifying results | Import of exam results published by the ministry (primary-school certificate, 3AC diploma, regional 1st-year baccalaureate, national 2nd-year baccalaureate) | V1 |
| Transfers | A log of transfers with Massar references | V1 |
| Traceability | A log of the module's exports, submissions, and imports | V1 |
| Direct integration | Monitoring and a connector should an official channel open | V2+ |

### 1.2 Out of scope

| Out of scope | Reference |
|---|---|
| Matching, deduplication, claiming, and merging of identities by Massar code | `prd/modules/10-administration-onboarding-subscription.md` (FR-ADM); `prd/03-domain-data-model.md` INV-02, INV-03 |
| Grade entry, average calculation, grading conferences, report cards | `prd/modules/14-assessments-grades-report-cards.md` (FR-EVA); this module only reads grades from locked periods. The referential compliance check is carried entirely by FR-EVA-06 (a warning at MVP, a blocking check unless waived in V1 — arbitration D3); FR-MAS-06 only exposes it and produces the closing statement |
| Format, uniqueness, and anti-enumeration of the Massar code | Rule carried by FR-INS-06 (`prd/modules/11-admissions-enrollment-reenrollment.md`); FR-MAS-01 refers to it without redefining it (ARB-24e) |
| The transfer procedure itself: the legal guardian's request, consent, exit package, closure | `prd/modules/18-transfers-mobility.md` (FR-TRA); this module only maintains the Massar-reference log |
| Any automation of Massar data entry (browser control, bots, ministerial accounts, "sync") | Forbidden at every version, see FR-MAS-13 |
| Official documents (certificates, attestations) issued by the school | `prd/modules/15-documents-certificates.md` (FR-DOC) |
| Internal leadership statistics (dashboards, comparisons) | `prd/modules/20-dashboards-reporting.md` (FR-RAP); this module only covers regulatory filings |
| Technical formats, encodings, and the update cycle of templates | `prd/cross-cutting/35-external-integrations.md` (INT-MAS) |
| Staffing statistics for leadership use outside ministerial filings | `prd/modules/20-dashboards-reporting.md` (FR-RAP) |

## 2. Users and use cases

| Actor | Use case | Version |
|---|---|---|
| Leadership | Enter and check Massar codes; track continuous-assessment referential compliance before closure; generate list and grade exports after report validation; import certifying-exam results; prepare ESISE filings; maintain the transfer and submission log | MVP (codes, list and grade exports — wave 2); V1 (ESISE, certifying results, logs) |
| Front office | Generate Massar-format student lists at the start of the year; enter Massar codes provided by families or looked up on Massar | MVP (codes; lists — wave 2) |
| Academic leadership | Check grade completeness by class and subject before locking a period; arbitrate referential waivers | V1 |
| Teacher | No direct module access: their grades feed exports through `prd/modules/14-assessments-grades-report-cards.md`; they receive alerts about missing tests concerning them | V1 |
| ZSchool (operator) | Activate and retire template versions based on Massar files observed at pilot schools; drive integration monitoring (H-04) | MVP (baseline templates, wave 2); V2+ (connector) |

Persona needs covered (cross-references `prd/02-actors-personas.md`): BES-DIR-03 (files conforming to Massar templates to eliminate double entry), BES-DIR-08 (compliance check before closure). Reference personas: Si Abdellah, a group director (ending Massar double entry) and Fatima, a front-office secretary (start-of-year lists).

## 3. Key journeys

The module has no journey of its own in the map; it is used by two critical journeys (cross-references `prd/journeys/00-journey-map.md`, without duplicating their steps):

| Journey | Role of the MAS module |
|---|---|
| PC-06 — Grade entry, grading conference, report-card publication | Referential compliance check before closure (an alert to leadership), export of continuous-assessment grades by subject and semester with a validation report; entry-step detail in `prd/modules/14-assessments-grades-report-cards.md`, leadership steps in `prd/journeys/01-school-group-director.md` |
| PC-09 — Inter-school transfer and exit package | Recording the Massar reference of the transfer procedure (a procedure outside ZSchool) in the module's log; the procedure itself stays carried by FR-TRA |

Seasonality (map §4.1): an April–May peak (the May ESISE census), a June–July peak (certifying exams: the national baccalaureate ordinary session 06/01–03/2027 per `prd/research/04-pedagogy-massar-calendar.md` §3, followed by results import); grade exports at both semester closures (December–January and May–June), three for the trimestral pilot school (DEC-35).

## 4. Functional requirements

Counter `FR-MAS-NN` starting at 01, a namespace exclusive to this file (conventions §2). Version tags: the Massar code is MVP ("Massar matching", §12); templates, list and grade exports, and the validation report are **MVP wave 2** (the June 2027 year-end close, JAL-06/JAL-07 — the §12 scope extension enacted by ARB-01, a working assumption to be confirmed by the founder); ESISE statistics, certifying-result import, and consolidated logs stay V1; direct integration is V2+ ("Massar integration if a channel exists").

### FR-MAS-01 — Manage the Massar code with format control, uniqueness, and anti-enumeration protection

| Attribute | Value |
|---|---|
| Description | The Massar code rule (an optional field on the student profile, format "one letter followed by nine digits", unique across the whole platform, a strong match proposed and never forced, corrections logged and notified, anti-enumeration protection) is **carried by FR-INS-06** (`prd/modules/11-admissions-enrollment-reenrollment.md`), the sole owner (ARB-24e); FR-ADM and this module reference it without redefining it. This module adds only what is specific to it: using the code as the matching key in every export and import (FR-MAS-03, FR-MAS-04, FR-MAS-10), flagging students without a code in validation reports (FR-MAS-05), keeping the old CNE code (eight digits, for baccalaureate holders before 2015) as a simple historical note with no key role, and recording anti-enumeration-protection episodes triggered from its screens in the module's log. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-04, RG-05, RG-07, DEC-04, §2.6, §9; INV-01, INV-02, INV-04 (cross-references `prd/03-domain-data-model.md`); FR-INS-06 (rule owner); matching detailed in `prd/modules/10-administration-onboarding-subscription.md`; ARB-24e |
| Actors | Leadership, front office, ZSchool support |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Massar code as the key for exports and imports (MVP)
  Scenario: A student with no Massar code flagged in an export
    Given a class of 30 students, 2 of them without a Massar code (rule FR-INS-06: the code is optional)
    When leadership generates the list export for that class
    Then the 2 students appear with an empty cell and are listed as a warning in the validation report
    And the export stays possible after a reasoned confirmation (FR-MAS-05)

  Scenario: Old CNE code kept with no key role
    Given a baccalaureate holder before 2015 whose profile carries an eight-digit CNE
    When a user attempts to use the CNE as a matching key in an import
    Then the CNE is ignored as a key and only the name, first name, and date-of-birth rule applies (FR-MAS-10)

  Scenario: Anti-enumeration episode logged (rule FR-INS-06)
    Given a code sweep detected from the module's import screen
    When FR-INS-06's protection triggers
    Then the episode is logged in the module's log with the originating screen
```

### FR-MAS-02 — Manage export templates by file version

| Attribute | Value |
|---|---|
| Description | Each file type to be produced (student lists, continuous-assessment grades by subject and semester, ESISE filings) relies on a version-managed template: a version identifies the cycle, period, and school year it applies to, and matches the column structure of a file actually generated by Massar. ZSchool activates, replaces, or retires versions with no rollout at the school; the school selects the version matching the file downloaded from its Massar area (selection aids: year, cycle, column preview). A retired version stays viewable in read-only for archiving and reproducing an earlier file. No template invents a structure: each version is validated against real files provided by pilot schools before activation (structures not publicly documented). |
| Priority | Must |
| Version | MVP (wave 2 — year-end close, JAL-07; ARB-01) |
| Traceability | ARB-01; H-04, H-10, §7.12; correction no. 11 (`prd/research/00-baseline-corrections.md`); `prd/research/04-pedagogy-massar-calendar.md` §2; OQ-02 |
| Actors | ZSchool support, leadership |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Version-managed templates (MVP, wave 2)
  Scenario: Activating a version validated against a real file
    Given a grade file actually generated by Massar, provided by a pilot school for the middle-school cycle, semester 1, 2026-2027 year
    When ZSchool support creates the version "grades-middle-S1-2026-2027" and validates it against that file
    Then the version is activated for every school with no rollout
    And the export wizard offers it with a column preview and its activation date

  Scenario: Retired version stays viewable
    Given a template version retired after an observed structure change
    When leadership views the export history produced with that version
    Then earlier files stay exactly reproducible and the version is marked "retired"
    And no new export can use it
```

### FR-MAS-03 — Export student lists in Massar file format

| Attribute | Value |
|---|---|
| Description | For a class or a whole level, generate a spreadsheet file in the active template format for student lists: identity in dual script (Latin and Arabic), Massar code where filled in, date and place of birth, sex, level, track and option, class, regime, guardians with status and phone. Selection by school year, site, and classes; a headcount counter before generation. Students with no Massar code appear with an empty cell and are flagged in the validation report (FR-MAS-05) — they are precisely those the school must register in Massar. |
| Priority | Must |
| Version | MVP (wave 2 — year-end close, JAL-07; ARB-01) |
| Traceability | ARB-01; §7.12, §2.6, DEC-10; BES-DIR-03 (cross-reference `prd/02-actors-personas.md`); OQ-02 |
| Actors | Leadership, front office |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Exporting student lists in Massar format (MVP, wave 2)
  Scenario: A whole level's list in dual script
    Given level 1AC with 92 ACTIVE students across three classes, 3 without a Massar code
    When the front office generates the level's list with the active template
    Then the file has 92 rows with name and first name in Latin and Arabic script, date and place of birth, sex, class, and regime
    And the 3 students without a code appear with an empty cell and are listed in the validation report
    And the headcount counter shown before generation is 92
```

### FR-MAS-04 — Export continuous-assessment grades by subject and semester

| Attribute | Value |
|---|---|
| Description | For a (class, subject, semester) triple, generate a file in the format of the active Massar grade-entry template: one column per test and assessment in the template's order, the semester's continuous-assessment average, each student's bilingual identity and Massar code, the subject carried in its language of instruction (a subject attribute). The file only carries grades from a period locked in `prd/modules/14-assessments-grades-report-cards.md`; any grade changed after locking (a new report-card version) makes the previous export stale and triggers a new generation. **Trimestral schools** (the bilingual pilot school, DEC-35; ARB-17h): Massar expects semesters for the national program; the school configures a **period-to-Massar-semester mapping table** (default: T1 → S1; T2 → S1 until the ministerial semester-1 end date, S2 afterward; T3 → S2), and semester continuous-assessment averages are **recomputed from dated grades** per FR-EVA-07's calculation rules, without changing published trimestral averages; the validation report flags assessments whose date falls outside any configured semester. The module reads grades, it never modifies them. |
| Priority | Must |
| Version | MVP (wave 2 — year-end close, JAL-07; ARB-01) |
| Traceability | ARB-01, ARB-17h; §7.12, §2.5, H-04, DEC-10; BES-DIR-03 (cross-reference `prd/02-actors-personas.md`); `prd/modules/14-assessments-grades-report-cards.md` |
| Actors | Leadership |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Exporting a class's first-semester grades with validation
  Scenario: Export blocked by blocking anomalies
    Given class 2AC-B for the first semester of 2026-2027 with the active template "grades-2AC-S1"
    And a student with no Massar code and a test grade out of range (22 out of 20) in the math subject
    When leadership requests the math export for 2AC-B for semester 1
    Then the validation report is produced before any final download
    And it lists the out-of-range grade as a blocking anomaly and the missing Massar code as a warning
    And the final file cannot be downloaded while a blocking anomaly remains

  Scenario: A compliant export handed to the log
    Given the same class with all blocking anomalies corrected
    When leadership relaunches generation and validates a report that only contains warnings
    And confirms submission with a reason for the remaining warnings
    Then the file is downloaded with a kept fingerprint
    And the export log records author, timestamp, template and version, exact scope, the report, and the confirmation

  Scenario: A trimestral school exported by Massar semester
    Given a bilingual school on three trimesters with the default mapping (T1 → S1, T2 → S1 until January 31 then S2, T3 → S2)
    And math grades dated October 15, January 20, and March 10 in 2AC-B
    When leadership requests the math export for 2AC-B for semester 1
    Then the file carries the October 15 and January 20 grades with a semester-1 average recomputed from those grades
    And the March 10 grade is reserved for the semester-2 export
    And the trimestral averages published to families stay unchanged
```

### FR-MAS-05 — Produce a validation report before any submission

| Attribute | Value |
|---|---|
| Description | Every export generation produces, before the final download, a validation report in three sections: completeness (students with no Massar code, missing grades, empty required fields), template compliance (data types, grade bounds, date formats, column order and headers), consistency (announced headcount, duplicates, totals). Each anomaly is classified as blocking (submission is refused until corrected) or a warning (submission requires an explicit, reasoned confirmation from leadership). The report is shown on screen, downloadable, and kept with the operation in the log (FR-MAS-12). Reason: re-importing files into Massar often fails even with no file change; avoiding the smallest error before submission spares a manual re-entry (`prd/research/04-pedagogy-massar-calendar.md` §2). |
| Priority | Must |
| Version | MVP (wave 2 — year-end close, JAL-07; ARB-01) |
| Traceability | ARB-01; §7.12, H-04; correction no. 11; `prd/research/04-pedagogy-massar-calendar.md` §2 |
| Actors | Leadership |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Validation report before submission
  Scenario: Reasoned confirmation of warnings
    Given a validation report with only warnings (three students with no Massar code)
    When leadership opens the report then confirms submission with a stated reason
    Then the file is released for download
    And the reason, author, and timestamp are kept in the export log

  Scenario: No download without validation
    Given a generated student-list export
    When a user attempts to download the final file without going through the report screen
    Then the download is refused and the interface redirects to the validation report
```

### FR-MAS-06 — Control referential compliance before closure

| Attribute | Value |
|---|---|
| Description | **Sole owner of the rule: FR-EVA-06** (`prd/modules/14-assessments-grades-report-cards.md`, arbitration D3) — a tally by class and subject of tests entered per semester against the configured referential (by default at least two class tests per subject and per semester plus a school-wide unified test, except in the second semester of exam years; configurable by level and school year, H-16), a recurring alert as closure approaches, **a warning with no blocking at MVP, a blocking check unless a reasoned waiver in V1**. This module keeps **no second tally**: it **exposes** the compliance status produced by FR-EVA-06 within the MAS portal (banner ECR-MAS-01, matrix ECR-MAS-04), integrates it into the **closing statement** attached to every grade export (compliant subjects, non-compliant subjects, waivers with author and reason), and blocks submission of an export where a subject is non-compliant without a waiver (V1, consistent with FR-EVA-06's closure block). FR-RAP-08 (`prd/modules/20-dashboards-reporting.md`) gives its read-only indicator view. |
| Priority | Should |
| Version | MVP (exposing FR-EVA-06's status); V1 (closing statement, submission block unless waived) |
| Traceability | §2.5, §7.12, H-16; BES-DIR-08 (cross-reference `prd/02-actors-personas.md`); `prd/research/04-pedagogy-massar-calendar.md` §1 (note 43 of 01/11/2006, still invoked); OQ-06; FR-EVA-06 (owner, arbitration D3), FR-RAP-08 (`prd/modules/20-dashboards-reporting.md`) |
| Actors | Leadership, academic leadership, teachers |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Exposing compliance status and the closing statement
  Scenario: Compliance status relayed in the portal (MVP)
    Given class 1AC-A's history-geography subject declared "non-compliant" by FR-EVA-06 (only one test in semester 1)
    When leadership opens the Massar and ESISE portal
    Then the status banner and the compliance matrix show the non-compliant subject with the teacher concerned
    And no tally is recomputed by the module: the status shown is the one produced by FR-EVA-06

  Scenario: Closing statement and a logged waiver (V1)
    Given a subject declared non-compliant at closure for lack of a unified test, and a waiver recorded by leadership in FR-EVA-06 (second semester of an exam year)
    When leadership generates that class's grade export
    Then the attached closing statement mentions the waiver, its author, and its reason
    And submission is possible; without the waiver, it would have been blocked until compliance was reached
```

### FR-MAS-07 — Prepare the private-school census (ESISE, May)

| Attribute | Value |
|---|---|
| Description | The module consolidates, in a yearly file opened starting in April, private-school census statistics: the school's and its sites' legal identification (authorization number, authorized cycles), headcount by level, class, and sex, staffing counts, all drawn from active enrollments and the school record. It produces a file conforming to the active form version (a template managed as in FR-MAS-02) after leadership validation; the field-by-field review view is unique and carried by FR-RAP-11 (`prd/modules/20-dashboards-reporting.md`, ARB-24d), this module does not generate a second one. Submission stays an act of the school on the ESISE platform; ZSchool transmits nothing directly. The exact forms are to be gathered from pilots (H-10): the three ESISE applications are under review on the ministry's portal. |
| Priority | Should |
| Version | V1 |
| Traceability | §7.11 (regulatory statistics), §7.12, H-03, H-10; correction no. 11; `prd/research/04-pedagogy-massar-calendar.md` §2 (sise.men.gov.ma, three applications); OQ-03 |
| Actors | Leadership |

### FR-MAS-08 — Prepare the HR referential for ESISE

| Attribute | Value |
|---|---|
| Description | The same yearly file consolidates the HR referential: staff headcount by category (permanent teachers, part-time teachers, external public-sector teachers with an AREF authorization, administrative staff), **qualifications as declared to the employer on `SchoolMembership`** (never the global `TeacherProfile`'s degrees, which belong to the teacher and are visible only on sharing — RG-20, RG-35, ARB-23b), assignments, and **hourly volumes at that school only** (no hours from another school, ARB-23a), drawn from current affiliations. Personal data not required by the form is not exported; the filing only outputs the active form's fields. The permanent-teacher share is provided by FR-CAR-19 and the external-teacher cap by FR-CAR-12 (`prd/modules/19-teacher-career-network.md`); this module only produces the filing, and the unique review view is FR-RAP-11 (ARB-24d). |
| Priority | Should |
| Version | V1 |
| Traceability | §7.11, H-10, H-13; correction no. 18; FR-CAR-12, FR-CAR-19 (`prd/modules/19-teacher-career-network.md`); FR-RAP-11; OQ-03; ARB-23a, ARB-23b, ARB-24d |
| Actors | Leadership |

### FR-MAS-09 — Prepare year-end results for ESISE

| Attribute | Value |
|---|---|
| Description | The yearly file consolidates year-end results: promotion or repeat decisions, diplomas obtained (primary-school certificate, 3AC diploma, baccalaureate), yearly averages by level, as recorded in `prd/modules/14-assessments-grades-report-cards.md` and completed by imported results (FR-MAS-10). Output as a file conforming to the active form, with leadership validation (unique review view: FR-RAP-11, ARB-24d). The filing relies on enrollments in COMPLETED status after the June rollover (FR-INS-21, `prd/modules/11-admissions-enrollment-reenrollment.md`); for certifying levels, it waits for the "undetermined" decisions to be updated by the results import (FR-MAS-10, ARB-17i) before being marked ready. |
| Priority | Should |
| Version | V1 |
| Traceability | §7.11, §7.12, H-10; OQ-03 |
| Actors | Leadership |

### FR-MAS-10 — Import certifying-exam results

| Attribute | Value |
|---|---|
| Description | An import wizard for official results published by the ministry: the provincial exam for the primary-school certificate (6AP — the "provincial" label kept, ARB-18), the regional exam for the 3AC diploma, the regional exam (1st-year baccalaureate), the national exam (2nd-year baccalaureate), for both the ordinary and the resit session. Depositing a file (transcripts or minutes) or a controlled row-by-row entry; matching rows to students by Massar code as the priority, then by name, first name, and date of birth; any ambiguous or missing match is placed in a manual arbitration queue, never automatically attached. Imported grades are recorded read-only, attached to the year's enrollment, marked with their source ("ministry"), the session, and the import date; they feed official averages per `prd/modules/14-assessments-grades-report-cards.md`'s calculation rules. The import produces a summary (attached, arbitrated, rejected) and is entered in the log (FR-MAS-12). **Sequencing with the rollover** (ARB-17i): the June rollover (FR-INS-21) closes certifying-level enrollments as COMPLETED with the decision "undetermined"; the results import (June–July) updates the `YearDecision` ("graduated", "promoted", "repeating") during the 60-day grace period (INV-25), with no additional audited procedure; past that deadline, the audited procedure applies. Typical window: June–July. |
| Priority | Must |
| Version | V1 |
| Traceability | §7.12, §2.5, §2.6, H-10; `prd/research/04-pedagogy-massar-calendar.md` §2–3; `prd/modules/14-assessments-grades-report-cards.md`; FR-INS-21; INV-25; OQ-04; ARB-17i, ARB-18 |
| Actors | Leadership |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Importing national baccalaureate results
  Scenario: Nominal import with a Massar-code match
    Given a 2026-2027 national baccalaureate results file deposited by leadership
    And every row carrying a Massar code matching an enrolled 2nd-year student
    When leadership runs the wizard and confirms the match preview
    Then each grade is recorded read-only, attached to the enrollment, marked "ministry" with the session
    And the summary shows the number of rows attached, arbitrated, and rejected
    And the operation is logged in the import log with the file's fingerprint

  Scenario: An ambiguous match placed in arbitration
    Given a row with no Massar code whose name, first name, and date of birth match two namesakes
    When the wizard completes the matching
    Then the row is placed in the arbitration queue with no automatic attachment
    And leadership picks the correct student or rejects the row, the choice being logged

  Scenario: An unreadable file rejected with no effect
    Given a file whose columns cannot be matched to the expected template at all
    When leadership launches the import
    Then the wizard fails with a readable error report
    And no grade is changed and no row is imported

  Scenario: Updating the year-end decision after the rollover
    Given a 2nd-year baccalaureate student whose enrollment has been COMPLETED since the June 25 rollover with the decision "undetermined"
    When leadership imports the national baccalaureate results on July 12, where she appears as passed
    Then the year-end decision moves to "graduated" during the grace period, with the import logged as the source
    And no additional audited procedure is required
```

### FR-MAS-11 — Maintain the transfer log with Massar references

| Attribute | Value |
|---|---|
| Description | For every closed transfer (an enrollment moved to state TRANSFERRED), the module keeps a log entry: student, origin school, destination school, closure date, and the Massar reference of the transfer procedure. The ministerial procedure takes place outside ZSchool — a request filed from the Massar parent portal then validated by the provincial education office — so the reference is entered afterward by the front office or leadership; it is optional at closure but transfers with no reference are flagged and can be followed up. The log is filterable by year, school, and reference status, exportable, and cross-linked to the transfer journey without duplicating its steps. |
| Priority | Must |
| Version | MVP (log entry and reference, fed by FR-TRA-08: field and document); V1 (consolidated filterable log, follow-ups) — aligned with FR-TRA-08 |
| Traceability | §7.12, §2.6, §7.9; FR-TRA-08 (owner of the field and document); INV-23, INV-43 (cross-references `prd/03-domain-data-model.md`); correction no. 11; `prd/research/04-pedagogy-massar-calendar.md` §2; `prd/modules/18-transfers-mobility.md`; OQ-05 |
| Actors | Leadership, front office |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: Massar reference of a transfer
  Scenario: Later entry of the reference after provincial validation
    Given a student whose enrollment has moved to state TRANSFERRED with no Massar reference
    When the front office returns to the log and enters the reference communicated by the family
    Then the log entry is updated with author and timestamp
    And the "transfer with no reference" signal disappears

  Scenario: Following up on transfers with no reference
    Given several transfers closed with no Massar reference after the configured deadline
    When leadership views the log filtered on missing references
    Then each entry offers the action "enter the reference" or "follow up with the family"
    And no transfer closure is undone by this follow-up
```

### FR-MAS-12 — Log and audit every generation, submission, and import

| Attribute | Value |
|---|---|
| Description | Every operation of the module is recorded in a log viewable by leadership: operation type (export, import, ESISE filing), template and version used, exact scope (year, sites, classes, subjects, semesters), author, school, timestamp, associated validation report, fingerprint of the produced or imported file, submission confirmation, and any waiver reason. The log is filterable, exportable for audit, and follows the founding document's retention periods. Operations never alter school data: they create dedicated export records. |
| Priority | Should |
| Version | V1 |
| Traceability | RG-38, §9; DataExport and AuditLog entities (cross-references `prd/03-domain-data-model.md`) |
| Actors | Leadership, ZSchool support |

### FR-MAS-13 — Forbid any automation of Massar data entry

| Attribute | Value |
|---|---|
| Description | A permanent product rule: ZSchool controls no browser, no bot, and no ministerial account, and offers no function named "Massar sync". The channel stays exclusively the production of conforming files that the school downloads and then imports itself into its Massar area: Massar exposes no programming interface or interoperability program to vendors (H-04, confirmed). The interface and documentation use unambiguous wording ("file to import into Massar", "submission by the school") and remind users that submission is an act of the school — which also bounds ZSchool's role as a processor under data-protection rules (§2.7). This rule can only be revisited by the opening of an official channel (FR-MAS-14). |
| Priority | Must |
| Version | MVP |
| Traceability | H-04, §2.6, §2.7, §7.12; correction no. 11 |
| Actors | ZSchool (operator), leadership |

**Acceptance criteria (critical flows)**:

```gherkin
Feature: No automation of Massar data entry (MVP)
  Scenario: Unambiguous wording and actions
    Given a principal who has generated a validated grade export
    When they view the actions available on the file
    Then the only action is "download the file to import into Massar"
    And no "sync", "send to Massar", or "connect to Massar" action exists in the interface

  Scenario: No ministerial credential stored
    Given the school's integration settings
    When leadership browses the module's settings
    Then no field allows entering a Massar account login or password
```

### FR-MAS-14 — Prepare direct integration should an official channel open

| Attribute | Value |
|---|---|
| Description | ZSchool maintains product monitoring on the opening of a Massar programming interface or interoperability program (vendor partnerships, ministry announcements) and keeps its architecture ready to plug in a connector: a separation between data preparation (scopes, checks, validation reports — unchanged) and transport (files today, structured exchange tomorrow). Any direct integration stays in V2 and beyond, subject to a documented ministry agreement; no commercial announcement precedes that agreement. |
| Priority | Could |
| Version | V2+ |
| Traceability | §7.12 (medium-term goal), §12, H-04; map §5 (outside MVP) |
| Actors | ZSchool (operator) |

## 5. Morocco-specific considerations

| Subject | Finding and source | Effect on the product |
|---|---|---|
| Massar's scope | Massar has covered public and private schools since 2013-2014; private schools register students and classes there and enter continuous assessment there at every level, entry that is structurally unavoidable for certifying levels since it feeds the official average (H-03, confirmed in substance) | Grade exports (FR-MAS-04) and referential compliance (FR-MAS-06) target every level, with critical stakes at 6AP, 3AC, and 1st- and 2nd-year baccalaureate |
| No programming interface | No API or vendor program; the only channel is Excel file import/export; column structures not publicly documented; fragile re-import even with no changes (H-04 confirmed; `prd/research/04-pedagogy-massar-calendar.md` §2, a competing vendor's testimony, August 2026) | Version-managed templates (FR-MAS-02) and a mandatory validation report (FR-MAS-05); a ban on automation (FR-MAS-13) |
| Massar code | One letter followed by nine digits, assigned at first enrollment and kept throughout schooling; replaces the CNE (eight digits) for baccalaureate holders from 2015 onward; the preferred matching key without being mandatory (§2.6, DEC-04) | FR-MAS-01: format controlled, unique across the platform, optional |
| ESISE | The ministry's statistical platform with three applications under review: private-school census, HR referential, year-end results; the census is validated from Massar data; a May window; exact forms to be gathered from pilots (H-10) | FR-RAP-11 checks (a unique view), FR-MAS-07 to FR-MAS-09 produce the files, submission stays an act of the school; OQ-03 |
| Exam results | Certifying-exam grades come from the ministry, not the school (§2.5): the provincial exam (6AP, the founding document's wording kept — research `prd/research/04` §1 says "regional", a divergence flagged, ARB-18), regional (3AC, 1st-year baccalaureate), national (2nd-year baccalaureate); the national baccalaureate's ordinary session runs 06/01–03/2027; results usable in July (`prd/research/04-pedagogy-massar-calendar.md` §3) | FR-MAS-10: a read-only import, cautious attachment, a June–July window; updating "undetermined" decisions after the rollover (ARB-17i) |
| Transfers | Massar procedure: a request from the parent area (requests section), supporting documents, provincial-education-office validation; a recent circular removing restrictions on transfers from private to public schools (`prd/research/04-pedagogy-massar-calendar.md` §2) | FR-MAS-11: a procedure reference recorded in the log, the procedure staying outside ZSchool |
| Framing texts | Note 1887/13, cited as the framing text for the Massar grade-entry module, is not corroborated online (correction no. 4); note 43 of 01/11/2006 stays the reference text for continuous assessment; weighting-decree numbers were not found (H-16) | Requirements worded with no dependency on any text number; default configuration; OQ-01 |
| Dual script | Massar requires names in Latin and Arabic script (§2.9, DEC-10) | Bilingual identity columns in every template (FR-MAS-03, FR-MAS-04) |
| Trimestral schools | The national program is semestral in Massar; the bilingual pilot school runs on trimesters (DEC-35) | A period-to-Massar-semester mapping table and recomputation of semestral averages from dated grades (FR-MAS-04, ARB-17h) |
| Role and responsibility | The school is the data controller, ZSchool the processor (§2.7): submission to the ministry is an act of the school | No direct transmission by ZSchool; full traceability on the school's side (FR-MAS-12, FR-MAS-13) |

## 6. Data and events

Entities used from the consolidated schema (cross-references `prd/03-domain-data-model.md`, §2):

| Entity | Use in the module |
|---|---|
| `StudentProfile` | Massar code (optional, unique, format controlled — INV-01) |
| `Person` | Civil status in dual script, feeding the templates' identity columns |
| `Enrollment` | Export scope: active enrollments by year, class, level, track |
| `Class`, `Subject`, `EvaluationPeriod`, `ComputationRule` | Pedagogical scope of grade exports; a period-to-Massar-semester mapping table (an `EvaluationPeriod` attribute, ARB-17h); a compliance referential carried by FR-EVA-06 |
| `Assessment`, `Mark` | Continuous-assessment grades exported (read-only) |
| `PeriodResult`, `YearDecision` | Period averages, decisions, and diplomas in ESISE-results filings |
| `TransferRequest` | Massar reference of the transfer procedure |
| `School`, `Campus`, `Section` | Legal identification and sites in ESISE filings |
| `SchoolMembership` | Headcount, qualifications as declared to the employer, and hours specific to the school for the ESISE HR referential (never `TeacherProfile`, ARB-23b) |
| `DataExport`, `AuditLog` | Export records and logging (RG-38) |

Events: the module creates no new canonical event. It consumes `PeriodClosed` (produced by assessments) to freeze the period's exports and settle compliance alerts, and `TransferValidated` to open the matching transfer-log entry. Its alerts (missing tests as closure approaches, transfers with no reference) reach leadership and the teachers concerned through the communication module's service notifications, each send producing a notification and a delivery log. Any future addition of module-specific events (an export generated, an import validated) would extend §7 of `prd/03-domain-data-model.md`, to be decided in review.

## 7. Key screens

Every screen exists in French and Arabic with full right-to-left reading (DEC-10); export templates stay in the language and column order of real Massar files, regardless of interface language.

### ECR-MAS-01 — Massar and ESISE portal (web, leadership)

The module's entry page: the active school year; a referential compliance status banner for the current period (number of non-compliant class-subject pairs, time before closure); shortcuts to the four action families (exports, result imports, ESISE filings, logs); a list of the log's latest operations. Explicit empty states: "no export for this year", "period not yet closed". Mobile: view-only, file generation staying reserved for wide screens.

### ECR-MAS-02 — Export wizard (web)

A four-step wizard: choice of file type (student lists; continuous-assessment grades); choice of scope (school year, site, classes, then subject and semester for grades); choice of the active template version, with a column preview and a reminder of its activation date; check and submission (linking to ECR-MAS-03). A progress bar and cancellation during generation; a scope and headcount summary at the end.

### ECR-MAS-03 — Validation report (web, mobile viewing)

A summary at the top: number of blocking anomalies, warnings, compliant rows; the report body detailed by row and by flagged column, filterable by anomaly type and by student; per-anomaly actions: "fix" (linking back to the relevant record in the source module) or, for warnings, "confirm submission" with a mandatory reason. Report states: to validate, validated, rejected. Downloading the final file is only enabled in the validated state.

### ECR-MAS-04 — Referential compliance table (web + mobile)

A matrix with classes in rows, subjects in columns, filterable by semester and level: each cell shows the compliance status **produced by FR-EVA-06** (a tally of tests entered, a unified test yes/no) with a color code compliant, incomplete, waived; hover detail: assessments involved, teacher; actions: follow up with the teacher, open the waiver in the assessments module (the waiver is recorded in FR-EVA-06, never here). A recurring alert at the top while a subject remains non-compliant as closure approaches. MVP: view-only; V1: a downloadable closing statement.

### ECR-MAS-05 — Certifying-result import (web)

A four-step wizard: file deposit or a row-by-row manual-entry mode; column matching against the expected format (a preview of the first ten rows); a preview of per-student matches (Massar code first) with an arbitration queue for ambiguous matches and reasoned rejections; a final confirmation and summary (attached, arbitrated, rejected, file fingerprint). No write before final confirmation.

### ECR-MAS-06 — ESISE filings (web)

One file per application (the May census, the HR referential, year-end results): indicative opening period and deadline; consolidated data shown by section with built-in consistency checks (headcount by level compared to active classes); form-version choice; file export; leadership validation with date and author; a history of submissions and produced versions. A permanent note: "submission to be performed by the school on the ministry's platform".

### ECR-MAS-07 — Export and submission log (web)

A reverse-chronological list of every module operation, filterable by type, template, class, author, period, and submission status; an operation's detail: scope, validation report, fingerprint, confirmations and reasons; log export for audit. View-only: no deletion or retroactive change.

### ECR-MAS-08 — Transfer log (web)

A list of closed transfers with a Massar-reference column (filled in or missing), a filter dedicated to missing references beyond the configured deadline, actions "enter the reference" (with correction logging) and "follow up with the family". A link back to the transfer's detail in the transfer module without duplicating its data.

## 8. Integrations

| Integration | Use | Reference |
|---|---|---|
| Massar | No programming interface (H-04): the only channel is Excel files produced by ZSchool then imported by the school into its Massar area; templates and file versions | INT-MAS in `prd/cross-cutting/35-external-integrations.md`; FR-MAS-02, FR-MAS-13 |
| ESISE (the ministry's statistical portal) | No interface: ZSchool prepares the files, the school files on the portal | FR-MAS-07 to FR-MAS-09; `prd/research/04-pedagogy-massar-calendar.md` §2 |
| Ministry exams (certifying results) | No interface: importing transcripts or controlled entry | FR-MAS-10; OQ-04 |
| Notifications | Compliance alerts and reference follow-ups through the communication module's channels | `prd/modules/17-communication-notifications.md`; `prd/cross-cutting/35-external-integrations.md` |
| A possible direct connector | V2 and beyond, subject to a documented official channel | FR-MAS-14; map §5 (outside MVP) |

## 9. Module-specific non-functional requirements

| Domain | Module-specific requirement | Reference |
|---|---|---|
| Template fidelity | Every template version is validated against a real Massar-generated file before activation; no invented column, no structure enrichment; recalibration at every school year start if files change | FR-MAS-02; OQ-02; `prd/cross-cutting/35-external-integrations.md` |
| Anti-enumeration | Massar-code searches and matches protected (rate limiting, lockout, non-disclosure); episodes logged | §9; FR-MAS-01; `prd/cross-cutting/31-security-privacy.md` |
| Audit | Logging of every module operation (author, context, timestamp); exportable, tamper-proof logs | RG-38; FR-MAS-12; `prd/cross-cutting/31-security-privacy.md` |
| Performance | Generating a class export in under two seconds; whole-school imports handled in the background with visible progress; targets consolidated in the non-functional requirements file | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-PERF) |
| Internationalization | Bilingual interface and messages with full right-to-left; identity columns in dual script; subjects in their language of instruction | DEC-10; `prd/cross-cutting/32-non-functional-requirements.md` (NFR-I18N); `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` |
| Availability | April–May peaks (ESISE census) and June–July (results): the general availability target maintained, maintenance windows outside exam and closure periods | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-DISP); map §4.2 |
| Retention | Validation reports, fingerprints, and logs kept per the founding document's retention periods; regulatory exports reproducible from archived templates | FR-MAS-02, FR-MAS-12; `prd/cross-cutting/31-security-privacy.md` |
| Mobile | Compliance tables and logs viewable on mobile; file generation and import reserved for the web | `prd/cross-cutting/32-non-functional-requirements.md` (NFR-MOB) |

## 10. Success metrics

Indicators proposed for consolidation in `prd/cross-cutting/38-kpi-success-metrics.md` (KPI identifiers carried by that file; Massar and ESISE indicators are created there under KPI-35 and following, ARB-26h; grade exports being MVP wave 2, KPI-19 to KPI-21 become measurable from June 2027):

| Indicator | Indicative target | Version |
|---|---|---|
| Rate of files imported into Massar on the first attempt (no correction or regeneration) | At least nine submissions out of ten | MVP (wave 2) |
| Average time to prepare a class-and-subject grade export, report included | Under five minutes | MVP (wave 2) |
| Share of class-subject pairs compliant with the referential at closure (logged waivers excepted) | One hundred percent | V1 |
| Share of active students carrying a filled-in Massar code | A coverage indicator with no imposed target (optional by design) | MVP |
| Time to prepare the May census file after the window opens | At most five business days | V1 |
| Attachment-without-arbitration rate of imported exam results | At least ninety-five percent of rows | V1 |

## 11. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Confirm the framing text of the Massar grade-entry module (note 1887/13 cited by industry sources, not corroborated online) and whether note 43 of 01/11/2006 remains the continuous-assessment reference | Correction no. 4 of `prd/research/00-baseline-corrections.md`; H-16. This chapter's requirements are worded with no dependency on any number; to be confirmed with pilots and the ministry |
| OQ-02 | Exact column structure of Massar's Excel files (student lists; grades by subject, class, and semester) per cycle and semester | Not publicly documented and fragile on re-import (`prd/research/04-pedagogy-massar-calendar.md` §2); to be gathered from real files with pilots before activating templates; recalibration planned at every school year start |
| OQ-03 | Exact forms of the three ESISE applications (the May private-school census, the HR referential, year-end results) | H-10 partially confirmed: applications "under review" on the ministry's portal; to be gathered from pilots before the first production May window |
| OQ-04 | Format of certifying-exam result transcripts to import (individual transcripts, minutes, Massar-generated files) and availability of a digital export | No public format documented; to be confirmed with pilots (H-10); absent a digital export, controlled row-by-row entry (FR-MAS-10) stays the fallback path |
| OQ-05 | Exact format of the Massar transfer reference and how to obtain it from the family or the provincial education office | Procedure described in `prd/research/04-pedagogy-massar-calendar.md` §2 (parent area, provincial validation); the reference itself is not documented; to be refined with pilots |
| OQ-06 | Regional variants of the continuous-assessment referential: does per-level and per-school-year configuration suffice, or is a per-regional-academy variant needed | Research considers per-academy variations (`prd/research/04-pedagogy-massar-calendar.md` §1) with no documented example; to be settled with multi-region pilots (configuration carried by FR-EVA-06) |
| OQ-07 | Version of Massar exports: the founding document §12 places them in V1; JAL-06 requires them from pilots in June 2027. | **Resolved — ARB-01** (a working assumption to be confirmed by the founder, ESC-02): FR-MAS-02 to FR-MAS-05 at MVP wave 2; ESISE, certifying results, and consolidated logs in V1. |
| OQ-08 | 6AP exam label: "provincial" (founding document §2.2) or "regional" (`prd/research/04` §1). | **Resolved — ARB-18**: the founding document is authoritative (a standardized provincial exam), research is corrected; the decree reference is to be recorded (H-16). |
| OQ-09 | Trimester-to-Massar-semester mapping for the bilingual pilot school (DEC-35). | **Resolved — ARB-17h**: a configurable mapping table with a default value and recomputation of semestral averages from dated grades (FR-MAS-04). |

## 12. Traceability

Table: founding-document ID → this file's requirements that cover them.

| Founding-document ID | Founding-document element | Coverage |
|---|---|---|
| RG-04 | Platform-wide uniqueness of the filled-in Massar code | FR-MAS-01 |
| RG-05 | Strong matching proposed, never forced; weak duplicate flagged | FR-MAS-01, FR-MAS-10 |
| RG-07 | Identity correction logged and notified to concerned schools | FR-MAS-01 |
| RG-38 | Logging of entries and sensitive views | FR-MAS-11, FR-MAS-12 |
| DEC-04 | Massar code as the preferred, unique, non-mandatory matching key | FR-MAS-01, FR-MAS-10 |
| DEC-10 | Dual script names, bilingual interface and documents | FR-MAS-03, FR-MAS-04; §7 |
| G-08 | Gap "Massar, regulatory obligations, ministry statistics" | §1 (scope) |
| §2.5 | Continuous assessment: at least two tests per subject and semester, unified, an exception in the second semester of exam years; external certifying results | FR-MAS-06, FR-MAS-10 |
| §2.6 | Massar, Massar code (letter + nine digits), historical CNE, transfers, no API | FR-MAS-01, FR-MAS-11, FR-MAS-13; §5 |
| §2.7 | Processor role: submission is an act of the school | FR-MAS-12, FR-MAS-13; §5 |
| §7.11 (regulatory statistics) | ESISE: private-school census, HR referential, year-end results | FR-MAS-07, FR-MAS-08, FR-MAS-09 |
| §7.9 | Transfers: procedure reference recorded outside ZSchool | FR-MAS-11; `prd/modules/18-transfers-mobility.md` |
| §7.12 | Every provision of the module (Massar code, exports, compliance, ESISE, results, transfer log, medium-term integration) | FR-MAS-01 to FR-MAS-14 |
| §9 | Protection against identity enumeration, especially the Massar code | FR-MAS-01; §9 |
| §12 | Scope by version: Massar matching (MVP), Massar exports (MVP wave 2 by ARB-01, OQ-07), regulatory statistics (V1), integration if a channel exists (V2+) | §1.1; version tags of the FRs |
| H-03 | Private-sector Massar entry scope, ESISE validated on Massar | §1, FR-MAS-07; §5 |
| H-04 | No API, Excel import/export channel only | FR-MAS-02, FR-MAS-04, FR-MAS-13, FR-MAS-14; §5 |
| H-10 | Exact statistical forms to be gathered from pilots | FR-MAS-07, FR-MAS-08, FR-MAS-09, FR-MAS-10; OQ-03, OQ-04 |
| H-13 | Share of part-time teachers (ESISE HR referential) | FR-MAS-08 |
| H-16 | Text numbers not found: default configuration, no documentary dependency | FR-MAS-06; §5; OQ-01 |
| Correction no. 4 (`prd/research/00-baseline-corrections.md`) | Note 1887/13 not corroborated online | §5; OQ-01 |
| Correction no. 11 (`prd/research/00-baseline-corrections.md`) | Grade entry via Excel file re-import, undocumented structures, ESISE in three applications, transfer via the parent area | FR-MAS-02, FR-MAS-05, FR-MAS-07, FR-MAS-11; §5 |
| `prd/research/04-pedagogy-massar-calendar.md` §1 | Weightings by cycle, the "at least two tests plus one unified test" rule, note 43 of 2006; divergent 6AP label (corrected, ARB-18) | FR-MAS-06; FR-MAS-10; OQ-06, OQ-08 |
| `prd/research/04-pedagogy-massar-calendar.md` §2 | Fragile re-import, a vendor's testimony, sise.men.gov.ma, transfers via the parent area | FR-MAS-02, FR-MAS-05, FR-MAS-07, FR-MAS-11 |
| `prd/research/04-pedagogy-massar-calendar.md` §3 | National baccalaureate 06/01–03/2027, exam calendar | FR-MAS-10; §3 |
| INV-01, INV-02, INV-04 (cross-references `prd/03-domain-data-model.md`) | Massar-code, matching, and correction invariants | FR-MAS-01 |
| INV-23, INV-43 (cross-references `prd/03-domain-data-model.md`) | Transfer profile with a Massar code, transfer on the same identity | FR-MAS-11 |
| BES-DIR-03, BES-DIR-08 (cross-references `prd/02-actors-personas.md`) | Persona needs covered | FR-MAS-03, FR-MAS-04; FR-MAS-06 (via FR-EVA-06) |
| `prd/modules/11-admissions-enrollment-reenrollment.md` (FR-INS-06, FR-INS-21) | The Massar-code rule (sole owner); rollover and "undetermined" decisions | FR-MAS-01, FR-MAS-09, FR-MAS-10 |
| `prd/modules/14-assessments-grades-report-cards.md` (FR-EVA-06, FR-EVA-07) | Referential compliance (sole owner, D3); semestral-average calculation rules | FR-MAS-04, FR-MAS-06 |
| `prd/modules/19-teacher-career-network.md` (FR-CAR-12, FR-CAR-19); `prd/modules/20-dashboards-reporting.md` (FR-RAP-11) | Cap, permanent-teacher share, unique ESISE review view | FR-MAS-07, FR-MAS-08, FR-MAS-09 |
| `prd/cross-cutting/42-review-arbitrations.md` | Arbitrations from the 09/09/2026 review | ARB-01 (FR-MAS-02..05 versions, OQ-07); ARB-17h (FR-MAS-04, OQ-09); ARB-17i (FR-MAS-09, FR-MAS-10); ARB-18 (FR-MAS-10, §5, OQ-08); ARB-23a/b (FR-MAS-08, §6); ARB-24d (FR-MAS-07..09); ARB-24e (FR-MAS-01) |
| PC-06, PC-09 (cross-references `prd/journeys/00-journey-map.md`) | Journeys using the module | §3 |
