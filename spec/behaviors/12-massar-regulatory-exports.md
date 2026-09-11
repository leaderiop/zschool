> **Document Control**
>
> | Property       | Value                                                                                                                                                                                                                          |
> | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | Document ID    | ZSCHOOL-BEH-12                                                                                                                                                                                                                 |
> | Revision       | 1.0                                                                                                                                                                                                                            |
> | Effective Date | 2026-09-09                                                                                                                                                                                                                     |
> | Status         | Draft                                                                                                                                                                                                                          |
> | Author         | ZSchool Product                                                                                                                                                                                                                |
> | Classification | Functional Specification                                                                                                                                                                                                       |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/21-massar-regulatory-exports.md` (v0.3), old `FR-MAS-01..14` -> `BEH-ZS-261..274`, old `ECR-MAS-01..08` -> `SCR-ZS-141..148`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Massar and Regulatory Exports (MAS)

## 1. Objective and scope

**Objective.** Building on the identity/enrollment and assessment foundations, this module is the platform's preparation station for everything a school must transmit to the ministry — student lists, continuous-assessment grades, ESISE statistics, transfer references — and the controlled receptacle for what the ministry sends back (certifying-exam results). Its central promise is **eliminating double entry**: ZSchool produces files in the format of Massar's own templates, which the school downloads and imports into Massar itself; it never automates data entry into Massar. Its second promise is **submission reliability**: Massar's Excel file structures are not publicly documented and re-import often fails even without changing the file, so no file is submitted without a prior validation report, and templates are managed as file versions.

**Scope included:**

| Scope                  | Content                                                                                                                                                                                                                                                                | Version                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Massar code            | A field on the student profile: format (one letter followed by nine digits), unique across the whole platform, optional, protected against enumeration — the rule is carried by [BEH-ZS-026](02-admissions-enrollment-reenrollment.md), this module references it      | MVP                                            |
| Export templates       | Version-managed file templates, activated by ZSchool with no rollout on the school's side                                                                                                                                                                              | MVP (wave 2 — year-end close, RDM-ZS-003)      |
| Massar exports         | Student lists and continuous-assessment grades by subject and semester, in the format of Massar's entry-module files, with a period-to-semester mapping for trimestral schools                                                                                         | MVP (wave 2 — year-end close, RDM-ZS-003)      |
| Validation report      | Completeness, template compliance, and consistency checks, mandatory before any submission                                                                                                                                                                             | MVP (wave 2 — year-end close, RDM-ZS-003)      |
| Pedagogical compliance | Exposing the continuous-assessment referential compliance status produced by [BEH-ZS-116](05-assessments-grades-report-cards.md) (sole owner: a warning at MVP, a blocking check unless waived in V1) within the MAS portal and the closing statement; no second tally | MVP (view); V1 (closing statement and waivers) |
| ESISE                  | Preparing the three filings: private-school census (May), HR referential, year-end results                                                                                                                                                                             | V1                                             |
| Certifying results     | Import of exam results published by the ministry (primary-school certificate, 3AC diploma, regional 1st-year baccalaureate, national 2nd-year baccalaureate)                                                                                                           | V1                                             |
| Transfers              | A log of transfers with Massar references                                                                                                                                                                                                                              | V1                                             |
| Traceability           | A log of the module's exports, submissions, and imports                                                                                                                                                                                                                | V1                                             |
| Direct integration     | Monitoring and a connector should an official channel open                                                                                                                                                                                                             | V2+                                            |

**Out of scope:**

| Out of scope                                                                                | Reference                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Matching, deduplication, claiming, and merging of identities by Massar code                 | `spec/behaviors/01-administration-onboarding-subscription.md`; `spec/domain-model.md` (INV-ZS-005, INV-ZS-006)                                                                                                                                                                                        |
| Grade entry, average calculation, grading conferences, report cards                         | `spec/behaviors/05-assessments-grades-report-cards.md`; this module only reads grades from locked periods. The referential compliance check is carried entirely by BEH-ZS-116 (a warning at MVP, a blocking check unless waived in V1); BEH-ZS-266 only exposes it and produces the closing statement |
| Format, uniqueness, and anti-enumeration of the Massar code                                 | Rule carried by BEH-ZS-026 (`spec/behaviors/02-admissions-enrollment-reenrollment.md`); BEH-ZS-261 refers to it without redefining it                                                                                                                                                                 |
| The transfer procedure itself: the legal guardian's request, consent, exit package, closure | `spec/behaviors/09-transfers-mobility.md`; this module only maintains the Massar-reference log                                                                                                                                                                                                        |
| Any automation of Massar data entry (browser control, bots, ministerial accounts, "sync")   | Forbidden at every version, see BEH-ZS-273                                                                                                                                                                                                                                                            |
| Official documents (certificates, attestations) issued by the school                        | `spec/behaviors/06-documents-certificates.md`                                                                                                                                                                                                                                                         |
| Internal leadership statistics (dashboards, comparisons)                                    | `spec/behaviors/11-dashboards-reporting.md`; this module only covers regulatory filings                                                                                                                                                                                                               |
| Technical formats, encodings, and the update cycle of templates                             | `spec/cross-cutting/06-external-integrations.md` (INT-MAS)                                                                                                                                                                                                                                            |
| Staffing statistics for leadership use outside ministerial filings                          | `spec/behaviors/11-dashboards-reporting.md`                                                                                                                                                                                                                                                           |

## 2. Users and use cases

| Actor               | Use case                                                                                                                                                                                                                                                  | Version                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Leadership          | Enter and check Massar codes; track continuous-assessment referential compliance before closure; generate list and grade exports after report validation; import certifying-exam results; prepare ESISE filings; maintain the transfer and submission log | MVP (codes, list and grade exports — wave 2); V1 (ESISE, certifying results, logs) |
| Front office        | Generate Massar-format student lists at the start of the year; enter Massar codes provided by families or looked up on Massar                                                                                                                             | MVP (codes; lists — wave 2)                                                        |
| Academic leadership | Check grade completeness by class and subject before locking a period; arbitrate referential waivers                                                                                                                                                      | V1                                                                                 |
| Teacher             | No direct module access: their grades feed exports through `spec/behaviors/05-assessments-grades-report-cards.md`; they receive alerts about missing tests concerning them                                                                                | V1                                                                                 |
| ZSchool (operator)  | Activate and retire template versions based on Massar files observed at pilot schools; drive integration monitoring                                                                                                                                       | MVP (baseline templates, wave 2); V2+ (connector)                                  |

Persona needs covered: [URS-ZS-003](../urs.md) (files conforming to Massar templates to eliminate double entry), [URS-ZS-008](../urs.md) (compliance check before closure). Reference personas: Si Abdellah, a group director (ending Massar double entry) and Fatima, a front-office secretary (start-of-year lists).

## 3. Key journeys

The module has no journey of its own in the map; it is used by two critical journeys, without duplicating their steps:

| Journey                                                               | Role of the MAS module                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JMP-ZS-006 — Grade entry, grading conference, report-card publication | Referential compliance check before closure (an alert to leadership), export of continuous-assessment grades by subject and semester with a validation report; entry-step detail in `spec/behaviors/05-assessments-grades-report-cards.md`, leadership steps in `spec/journeys/01-school-group-director.md` |
| JMP-ZS-009 — Inter-school transfer and exit package                   | Recording the Massar reference of the transfer procedure (a procedure outside ZSchool) in the module's log; the procedure itself stays carried by `spec/behaviors/09-transfers-mobility.md`                                                                                                                 |

Seasonality: an April-May peak (the May ESISE census), a June-July peak (certifying exams: the national baccalaureate ordinary session 06/01-03/2027, followed by results import); grade exports at both semester closures (December-January and May-June), three for the trimestral pilot school.

## 4. Functional behaviors

Counter `BEH-ZS-261..274`. Version tags: the Massar code is MVP ("Massar matching"); templates, list and grade exports, and the validation report are **MVP wave 2** (the June 2027 year-end close, RDM-ZS-005/RDM-ZS-003 — the scope extension enacted by ADR-ZS-041, a working assumption to be confirmed by the founder); ESISE statistics, certifying-result import, and consolidated logs stay V1; direct integration is V2+.

| ID         | Title                                                                                   | Priority |
| ---------- | --------------------------------------------------------------------------------------- | -------- |
| BEH-ZS-261 | Manage the Massar code with format control, uniqueness, and anti-enumeration protection | Must     |
| BEH-ZS-262 | Manage export templates by file version                                                 | Must     |
| BEH-ZS-263 | Export student lists in Massar file format                                              | Must     |
| BEH-ZS-264 | Export continuous-assessment grades by subject and semester                             | Must     |
| BEH-ZS-265 | Produce a validation report before any submission                                       | Must     |
| BEH-ZS-266 | Control referential compliance before closure                                           | Should   |
| BEH-ZS-267 | Prepare the private-school census (ESISE, May)                                          | Should   |
| BEH-ZS-268 | Prepare the HR referential for ESISE                                                    | Should   |
| BEH-ZS-269 | Prepare year-end results for ESISE                                                      | Should   |
| BEH-ZS-270 | Import certifying-exam results                                                          | Must     |
| BEH-ZS-271 | Maintain the transfer log with Massar references                                        | Must     |
| BEH-ZS-272 | Log and audit every generation, submission, and import                                  | Should   |
| BEH-ZS-273 | Forbid any automation of Massar data entry                                              | Must     |
| BEH-ZS-274 | Prepare direct integration should an official channel open                              | Could    |

### BEH-ZS-261: Manage the Massar code with format control, uniqueness, and anti-enumeration protection

> **Invariant:** [INV-ZS-054](../invariants.md#inv-zs-054), [INV-ZS-055](../invariants.md#inv-zs-055), [INV-ZS-057](../invariants.md#inv-zs-057), [INV-ZS-006](../invariants.md#inv-zs-006), [INV-ZS-005](../invariants.md#inv-zs-005), [INV-ZS-026](../invariants.md#inv-zs-026)
> **See:** [ADR-ZS-015](../decisions/015-massar-code-as-preferred-matching-key.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-226`](../../features/mas/fr-mas-01-massar-code-as-matching-key.feature)

REQUIREMENT: The Massar code rule (an optional field on the student profile, format
"one letter followed by nine digits", unique across the whole platform, a
strong match proposed and never forced, corrections logged and notified,
anti-enumeration protection) is **carried by [BEH-ZS-026](02-admissions-
enrollment-reenrollment.md)**, the sole owner; this module and BEH-ZS-001..020
(administration) reference it without redefining it. This module MUST add
only what is specific to it: using the code as the matching key in every
export and import (BEH-ZS-263, BEH-ZS-264, BEH-ZS-270), flagging students
without a code in validation reports (BEH-ZS-265), keeping the old CNE code
(eight digits, for baccalaureate holders before 2015) as a simple historical
note with no key role, and recording anti-enumeration-protection episodes
triggered from its screens in the module's log.

### BEH-ZS-262: Manage export templates by file version

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP (wave 2 — year-end close, RDM-ZS-003)
> **Acceptance:** [`@REQ-ZS-227`](../../features/mas/fr-mas-02-version-managed-templates.feature)

REQUIREMENT: Each file type to be produced (student lists, continuous-assessment grades
by subject and semester, ESISE filings) MUST rely on a version-managed
template: a version identifies the cycle, period, and school year it applies
to, and matches the column structure of a file actually generated by Massar.
ZSchool MUST activate, replace, or retire versions with no rollout at the
school; the school selects the version matching the file downloaded from its
Massar area (selection aids: year, cycle, column preview). A retired version
MUST stay viewable in read-only for archiving and reproducing an earlier
file. No template invents a structure: each version MUST be validated
against real files provided by pilot schools before activation.

### BEH-ZS-263: Export student lists in Massar file format

> **Invariant:** none
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)
> **Priority:** Must
> **Version:** MVP (wave 2 — year-end close, RDM-ZS-003)
> **Acceptance:** [`@REQ-ZS-228`](../../features/mas/fr-mas-03-export-student-lists.feature)

REQUIREMENT: For a class or a whole level, the system MUST generate a spreadsheet file
in the active template format for student lists: identity in dual script
(Latin and Arabic), Massar code where filled in, date and place of birth,
sex, level, track and option, class, regime, guardians with status and
phone. Selection MUST be by school year, site, and classes, with a headcount
counter shown before generation. Students with no Massar code MUST appear
with an empty cell and be flagged in the validation report (BEH-ZS-265) —
they are precisely those the school must register in Massar.

### BEH-ZS-264: Export continuous-assessment grades by subject and semester

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP (wave 2 — year-end close, RDM-ZS-003)
> **Acceptance:** [`@REQ-ZS-229`](../../features/mas/fr-mas-04-export-grades-by-subject-semester.feature)

REQUIREMENT: For a (class, subject, semester) triple, the system MUST generate a file
in the format of the active Massar grade-entry template: one column per
test and assessment in the template's order, the semester's continuous-
assessment average, each student's bilingual identity and Massar code, the
subject carried in its language of instruction. The file MUST only carry
grades from a period locked in `spec/behaviors/05-assessments-grades-
             report-cards.md`; any grade changed after locking (a new report-card
version) MUST make the previous export stale and trigger a new generation.
**Trimestral schools** (the bilingual pilot school): Massar expects
semesters for the national program; the school configures a **period-to-
Massar-semester mapping table** (default: T1 -> S1; T2 -> S1 until the
ministerial semester-1 end date, S2 afterward; T3 -> S2), and semester
continuous-assessment averages MUST be **recomputed from dated grades**,
without changing published trimestral averages; the validation report MUST
flag assessments whose date falls outside any configured semester. The
module reads grades, it never modifies them.

### BEH-ZS-265: Produce a validation report before any submission

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP (wave 2 — year-end close, RDM-ZS-003)
> **Acceptance:** [`@REQ-ZS-230`](../../features/mas/fr-mas-05-validation-report-before-submission.feature)

REQUIREMENT: Every export generation MUST produce, before the final download, a
validation report in three sections: completeness (students with no Massar
code, missing grades, empty required fields), template compliance (data
types, grade bounds, date formats, column order and headers), consistency
(announced headcount, duplicates, totals). Each anomaly MUST be classified
as blocking (submission is refused until corrected) or a warning
(submission requires an explicit, reasoned confirmation from leadership).
The report MUST be shown on screen, downloadable, and kept with the
operation in the log (BEH-ZS-272). Reason: re-importing files into Massar
often fails even with no file change; avoiding the smallest error before
submission spares a manual re-entry.

### BEH-ZS-266: Control referential compliance before closure

> **Invariant:** none
> **See:** [ADR-ZS-058](../decisions/058-grading-calculation-rules-mvp.md)
> **Priority:** Should
> **Version:** MVP (exposing BEH-ZS-116's status); V1 (closing statement, submission block unless waived)
> **Acceptance:** [`@REQ-ZS-231`](../../features/mas/fr-mas-06-compliance-status-and-closing-statement.feature)

REQUIREMENT: **Sole owner of the rule: [BEH-ZS-116](05-assessments-grades-report-
cards.md)** — a tally by class and subject of tests entered per semester
against the configured referential (by default at least two class tests
per subject and per semester plus a school-wide unified test, except in
the second semester of exam years; configurable by level and school year),
a recurring alert as closure approaches, **a warning with no blocking at
MVP, a blocking check unless a reasoned waiver in V1**. This module MUST
keep **no second tally**: it MUST **expose** the compliance status
produced by BEH-ZS-116 within the MAS portal (banner SCR-ZS-141, matrix
SCR-ZS-142), integrate it into the **closing statement** attached to every
grade export (compliant subjects, non-compliant subjects, waivers with
author and reason), and block submission of an export where a subject is
non-compliant without a waiver (V1, consistent with BEH-ZS-116's closure
block). [BEH-ZS-248](11-dashboards-reporting.md) gives its read-only
indicator view.

### BEH-ZS-267: Prepare the private-school census (ESISE, May)

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this exposure level)

REQUIREMENT: The module MUST consolidate, in a yearly file opened starting in April,
private-school census statistics: the school's and its sites' legal
identification (authorization number, authorized cycles), headcount by
level, class, and sex, staffing counts, all drawn from active enrollments
and the school record. It MUST produce a file conforming to the active
form version (a template managed as in BEH-ZS-262) after leadership
validation; the field-by-field review view is unique and carried by
[BEH-ZS-251](11-dashboards-reporting.md), this module does not generate a
second one. Submission stays an act of the school on the ESISE platform;
ZSchool transmits nothing directly.

### BEH-ZS-268: Prepare the HR referential for ESISE

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this exposure level)

REQUIREMENT: The same yearly file MUST consolidate the HR referential: staff headcount
by category (permanent teachers, part-time teachers, external public-
sector teachers with an AREF authorization, administrative staff),
**qualifications as declared to the employer on `SchoolMembership`**
(never the global `TeacherProfile`'s degrees, which belong to the teacher
and are visible only on sharing), assignments, and **hourly volumes at
that school only** (no hours from another school), drawn from current
affiliations. Personal data not required by the form MUST NOT be
exported; the filing only outputs the active form's fields. The
permanent-teacher share is provided by [BEH-ZS-239](10-teacher-career-
network.md) and the external-teacher cap by [BEH-ZS-232](10-teacher-
career-network.md); this module only produces the filing, and the unique
review view is BEH-ZS-251.

### BEH-ZS-269: Prepare year-end results for ESISE

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this exposure level)

REQUIREMENT: The yearly file MUST consolidate year-end results: promotion or repeat
decisions, diplomas obtained (primary-school certificate, 3AC diploma,
baccalaureate), yearly averages by level, as recorded in `spec/behaviors/
             05-assessments-grades-report-cards.md` and completed by imported results
(BEH-ZS-270). Output MUST be a file conforming to the active form, with
leadership validation (unique review view: BEH-ZS-251). The filing MUST
rely on enrollments in COMPLETED status after the June rollover
([BEH-ZS-041](02-admissions-enrollment-reenrollment.md)); for certifying
levels, it MUST wait for the "undetermined" decisions to be updated by the
results import (BEH-ZS-270) before being marked ready.

### BEH-ZS-270: Import certifying-exam results

> **Invariant:** [INV-ZS-022](../invariants.md#inv-zs-022), [INV-ZS-024](../invariants.md#inv-zs-024), [INV-ZS-023](../invariants.md#inv-zs-023)
> **See:** [ADR-ZS-059](../decisions/059-6ap-provincial-exam-label.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-232`](../../features/mas/fr-mas-10-import-certifying-exam-results.feature)

REQUIREMENT: The system MUST offer an import wizard for official results published by
the ministry: the provincial exam for the primary-school certificate (6AP —
the "provincial" label kept), the regional exam for the 3AC diploma, the
regional exam (1st-year baccalaureate), the national exam (2nd-year
baccalaureate), for both the ordinary and the resit session. It MUST
support depositing a file (transcripts or minutes) or a controlled row-by-
row entry; matching rows to students by Massar code as the priority, then
by name, first name, and date of birth; any ambiguous or missing match
MUST be placed in a manual arbitration queue, never automatically
attached. Imported grades MUST be recorded read-only, attached to the
year's enrollment, marked with their source ("ministry"), the session, and
the import date; they feed official averages per `spec/behaviors/05-
             assessments-grades-report-cards.md`'s calculation rules. The import MUST
produce a summary (attached, arbitrated, rejected) and be entered in the
log (BEH-ZS-272). **Sequencing with the rollover**: the June rollover
(BEH-ZS-041) closes certifying-level enrollments as COMPLETED with the
decision "undetermined"; the results import (June-July) updates the
`YearDecision` ("graduated", "promoted", "repeating") during the 60-day
grace period (INV-ZS-024), with no additional audited procedure; past that
deadline, the audited procedure applies.

### BEH-ZS-271: Maintain the transfer log with Massar references

> **Invariant:** [INV-ZS-022](../invariants.md#inv-zs-022), [INV-ZS-023](../invariants.md#inv-zs-023)
> **See:** none
> **Priority:** Must
> **Version:** MVP (log entry and reference, fed by [BEH-ZS-208](09-transfers-mobility.md): field and document); V1 (consolidated filterable log, follow-ups)
> **Acceptance:** [`@REQ-ZS-233`](../../features/mas/fr-mas-11-transfer-massar-reference.feature)

REQUIREMENT: For every closed transfer (an enrollment moved to state TRANSFERRED), the
module MUST keep a log entry: student, origin school, destination school,
closure date, and the Massar reference of the transfer procedure. The
ministerial procedure takes place outside ZSchool — a request filed from
the Massar parent portal then validated by the provincial education office
— so the reference is entered afterward by the front office or leadership;
it MUST be optional at closure but transfers with no reference MUST be
flagged and can be followed up. The log MUST be filterable by year, school,
and reference status, exportable, and cross-linked to the transfer journey
without duplicating its steps.

### BEH-ZS-272: Log and audit every generation, submission, and import

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** none
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this exposure level)

REQUIREMENT: Every operation of the module MUST be recorded in a log viewable by
leadership: operation type (export, import, ESISE filing), template and
version used, exact scope (year, sites, classes, subjects, semesters),
author, school, timestamp, associated validation report, fingerprint of
the produced or imported file, submission confirmation, and any waiver
reason. The log MUST be filterable, exportable for audit, and follow the
baseline's retention periods. Operations MUST NOT alter school data: they
create dedicated export records.

### BEH-ZS-273: Forbid any automation of Massar data entry

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-234`](../../features/mas/fr-mas-13-no-automation-of-massar-entry.feature)

REQUIREMENT: A permanent product rule: ZSchool MUST control no browser, no bot, and no
ministerial account, and MUST offer no function named "Massar sync". The
channel stays exclusively the production of conforming files that the
school downloads and then imports itself into its Massar area: Massar
exposes no programming interface or interoperability program to vendors.
The interface and documentation MUST use unambiguous wording ("file to
import into Massar", "submission by the school") and remind users that
submission is an act of the school — which also bounds ZSchool's role as a
processor under data-protection rules. This rule can only be revisited by
the opening of an official channel (BEH-ZS-274).

### BEH-ZS-274: Prepare direct integration should an official channel open

> **Invariant:** none
> **See:** none
> **Priority:** Could
> **Version:** V2+
> **Acceptance:** none (monitoring posture, no scenario at this version)

REQUIREMENT: ZSchool MUST maintain product monitoring on the opening of a Massar
programming interface or interoperability program (vendor partnerships,
ministry announcements) and MUST keep its architecture ready to plug in a
connector: a separation between data preparation (scopes, checks,
validation reports — unchanged) and transport (files today, structured
exchange tomorrow). Any direct integration stays in V2 and beyond, subject
to a documented ministry agreement; no commercial announcement precedes
that agreement.

## 5. Morocco-specific considerations

The Morocco-specific findings behind these requirements:

| Subject                  | Finding and source                                                                                                                                                                                                                                                                                                                                        | Effect on the product                                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Massar's scope           | Massar has covered public and private schools since 2013-2014; private schools register students and classes there and enter continuous assessment there at every level, entry that is structurally unavoidable for certifying levels since it feeds the official average                                                                                 | Grade exports (BEH-ZS-264) and referential compliance (BEH-ZS-266) target every level, with critical stakes at 6AP, 3AC, and 1st- and 2nd-year baccalaureate |
| No programming interface | No API or vendor program; the only channel is Excel file import/export; column structures not publicly documented; fragile re-import even with no changes                                                                                                                                                                                                 | Version-managed templates (BEH-ZS-262) and a mandatory validation report (BEH-ZS-265); a ban on automation (BEH-ZS-273)                                      |
| Massar code              | One letter followed by nine digits, assigned at first enrollment and kept throughout schooling; replaces the CNE (eight digits) for baccalaureate holders from 2015 onward; the preferred matching key without being mandatory                                                                                                                            | BEH-ZS-261: format controlled, unique across the platform, optional                                                                                          |
| ESISE                    | The ministry's statistical platform with three applications under review: private-school census, HR referential, year-end results; the census is validated from Massar data; a May window; exact forms to be gathered from pilots                                                                                                                         | BEH-ZS-251 checks (a unique view), BEH-ZS-267 to BEH-ZS-269 produce the files, submission stays an act of the school; OQ-ZS-153                              |
| Exam results             | Certifying-exam grades come from the ministry, not the school: the provincial exam (6AP, the baseline's wording kept — a divergence flagged against research, which uses "regional"), regional (3AC, 1st-year baccalaureate), national (2nd-year baccalaureate); the national baccalaureate's ordinary session runs 06/01-03/2027; results usable in July | BEH-ZS-270: a read-only import, cautious attachment, a June-July window; updating "undetermined" decisions after the rollover                                |
| Transfers                | Massar procedure: a request from the parent area (requests section), supporting documents, provincial-education-office validation; a recent circular removing restrictions on transfers from private to public schools                                                                                                                                    | BEH-ZS-271: a procedure reference recorded in the log, the procedure staying outside ZSchool                                                                 |
| Framing texts            | Note 1887/13, cited as the framing text for the Massar grade-entry module, is not corroborated online; note 43 of 01/11/2006 stays the reference text for continuous assessment; weighting-decree numbers were not found                                                                                                                                  | Requirements worded with no dependency on any text number; default configuration; OQ-ZS-151                                                                  |
| Dual script              | Massar requires names in Latin and Arabic script                                                                                                                                                                                                                                                                                                          | Bilingual identity columns in every template (BEH-ZS-263, BEH-ZS-264)                                                                                        |
| Trimestral schools       | The national program is semestral in Massar; the bilingual pilot school runs on trimesters                                                                                                                                                                                                                                                                | A period-to-Massar-semester mapping table and recomputation of semestral averages from dated grades (BEH-ZS-264)                                             |
| Role and responsibility  | The school is the data controller, ZSchool the processor: submission to the ministry is an act of the school                                                                                                                                                                                                                                              | No direct transmission by ZSchool; full traceability on the school's side (BEH-ZS-272, BEH-ZS-273)                                                           |

## 6. Data and events

Entities used from the domain model (`spec/domain-model.md`):

| Entity                                                    | Use in the module                                                                                                                                               |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StudentProfile`                                          | Massar code (optional, unique, format controlled)                                                                                                               |
| `Person`                                                  | Civil status in dual script, feeding the templates' identity columns                                                                                            |
| `Enrollment`                                              | Export scope: active enrollments by year, class, level, track                                                                                                   |
| `Class`, `Subject`, `EvaluationPeriod`, `ComputationRule` | Pedagogical scope of grade exports; a period-to-Massar-semester mapping table (an `EvaluationPeriod` attribute); a compliance referential carried by BEH-ZS-116 |
| `Assessment`, `Mark`                                      | Continuous-assessment grades exported (read-only)                                                                                                               |
| `PeriodResult`, `YearDecision`                            | Period averages, decisions, and diplomas in ESISE-results filings                                                                                               |
| `TransferRequest`                                         | Massar reference of the transfer procedure                                                                                                                      |
| `School`, `Campus`, `Section`                             | Legal identification and sites in ESISE filings                                                                                                                 |
| `SchoolMembership`                                        | Headcount, qualifications as declared to the employer, and hours specific to the school for the ESISE HR referential (never `TeacherProfile`)                   |
| `DataExport`, `AuditLog`                                  | Export records and logging                                                                                                                                      |

Events: the module creates no new canonical event. It consumes `PeriodClosed` (produced by assessments) to freeze the period's exports and settle compliance alerts, and `TransferValidated` to open the matching transfer-log entry. Its alerts (missing tests as closure approaches, transfers with no reference) reach leadership and the teachers concerned through the communication module's service notifications, each send producing a notification and a delivery log.

## 7. Screens

Every screen exists in French and Arabic with full right-to-left reading; export templates stay in the language and column order of real Massar files, regardless of interface language.

- **SCR-ZS-141 — Massar and ESISE portal (web, leadership).** The module's entry page: the active school year; a referential compliance status banner for the current period (number of non-compliant class-subject pairs, time before closure); shortcuts to the four action families (exports, result imports, ESISE filings, logs); a list of the log's latest operations. Explicit empty states: "no export for this year", "period not yet closed". Mobile: view-only, file generation staying reserved for wide screens.
- **SCR-ZS-142 — Referential compliance table (web + mobile).** A matrix with classes in rows, subjects in columns, filterable by semester and level: each cell shows the compliance status **produced by BEH-ZS-116** (a tally of tests entered, a unified test yes/no) with a color code compliant, incomplete, waived; hover detail: assessments involved, teacher; actions: follow up with the teacher, open the waiver in the assessments module (the waiver is recorded in BEH-ZS-116, never here). A recurring alert at the top while a subject remains non-compliant as closure approaches. MVP: view-only; V1: a downloadable closing statement.
- **SCR-ZS-143 — Export wizard (web).** A four-step wizard: choice of file type (student lists; continuous-assessment grades); choice of scope (school year, site, classes, then subject and semester for grades); choice of the active template version, with a column preview and a reminder of its activation date; check and submission (linking to SCR-ZS-144). A progress bar and cancellation during generation; a scope and headcount summary at the end.
- **SCR-ZS-144 — Validation report (web, mobile viewing).** A summary at the top: number of blocking anomalies, warnings, compliant rows; the report body detailed by row and by flagged column, filterable by anomaly type and by student; per-anomaly actions: "fix" (linking back to the relevant record in the source module) or, for warnings, "confirm submission" with a mandatory reason. Report states: to validate, validated, rejected. Downloading the final file is only enabled in the validated state.
- **SCR-ZS-145 — Certifying-result import (web).** A four-step wizard: file deposit or a row-by-row manual-entry mode; column matching against the expected format (a preview of the first ten rows); a preview of per-student matches (Massar code first) with an arbitration queue for ambiguous matches and reasoned rejections; a final confirmation and summary (attached, arbitrated, rejected, file fingerprint). No write before final confirmation.
- **SCR-ZS-146 — ESISE filings (web).** One file per application (the May census, the HR referential, year-end results): indicative opening period and deadline; consolidated data shown by section with built-in consistency checks (headcount by level compared to active classes); form-version choice; file export; leadership validation with date and author; a history of submissions and produced versions. A permanent note: "submission to be performed by the school on the ministry's platform".
- **SCR-ZS-147 — Export and submission log (web).** A reverse-chronological list of every module operation, filterable by type, template, class, author, period, and submission status; an operation's detail: scope, validation report, fingerprint, confirmations and reasons; log export for audit. View-only: no deletion or retroactive change.
- **SCR-ZS-148 — Transfer log (web).** A list of closed transfers with a Massar-reference column (filled in or missing), a filter dedicated to missing references beyond the configured deadline, actions "enter the reference" (with correction logging) and "follow up with the family". A link back to the transfer's detail in the transfer module without duplicating its data.

## 8. Integrations

| Integration                               | Use                                                                                                                                                         | Reference                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Massar                                    | No programming interface: the only channel is Excel files produced by ZSchool then imported by the school into its Massar area; templates and file versions | INT-MAS in `spec/cross-cutting/06-external-integrations.md`; BEH-ZS-262, BEH-ZS-273                  |
| ESISE (the ministry's statistical portal) | No interface: ZSchool prepares the files, the school files on the portal                                                                                    | BEH-ZS-267 to BEH-ZS-269                                                                             |
| Ministry exams (certifying results)       | No interface: importing transcripts or controlled entry                                                                                                     | BEH-ZS-270; OQ-ZS-154                                                                                |
| Notifications                             | Compliance alerts and reference follow-ups through the communication module's channels                                                                      | `spec/behaviors/08-communication-notifications.md`; `spec/cross-cutting/06-external-integrations.md` |
| A possible direct connector               | V2 and beyond, subject to a documented official channel                                                                                                     | BEH-ZS-274                                                                                           |

## 9. Module-specific non-functional requirements

Reference to NFR domains carried by `spec/cross-cutting/03-non-functional-requirements.md`; no NFR requirement is numbered here.

| Domain                          | Module-specific requirement                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Template fidelity               | Every template version is validated against a real Massar-generated file before activation; no invented column, no structure enrichment; recalibration at every school year start if files change |
| Anti-enumeration                | Massar-code searches and matches protected (rate limiting, lockout, non-disclosure); episodes logged                                                                                              |
| Audit (NFR-OBS)                 | Logging of every module operation (author, context, timestamp); exportable, tamper-proof logs                                                                                                     |
| Performance (NFR-PERF)          | Generating a class export in under two seconds; whole-school imports handled in the background with visible progress                                                                              |
| Internationalization (NFR-I18N) | Bilingual interface and messages with full right-to-left; identity columns in dual script; subjects in their language of instruction                                                              |
| Availability (NFR-DISP)         | April-May peaks (ESISE census) and June-July (results): the general availability target maintained, maintenance windows outside exam and closure periods                                          |
| Retention (NFR-DOC)             | Validation reports, fingerprints, and logs kept per the baseline's retention periods; regulatory exports reproducible from archived templates                                                     |
| Mobile (NFR-MOB)                | Compliance tables and logs viewable on mobile; file generation and import reserved for the web                                                                                                    |

## 10. Success metrics

`KPI-ZS-NNN` identifiers are carried by `spec/metrics.md`; Massar and ESISE indicators are created there under KPI-ZS-037 and following (grade exports being MVP wave 2, KPI-ZS-027 to KPI-ZS-028 become measurable from June 2027):

- rate of files imported into Massar on the first attempt (no correction or regeneration): at least nine submissions out of ten (MVP wave 2);
- average time to prepare a class-and-subject grade export, report included: under five minutes (MVP wave 2);
- share of class-subject pairs compliant with the referential at closure (logged waivers excepted): one hundred percent (V1);
- share of active students carrying a filled-in Massar code: a coverage indicator with no imposed target (MVP);
- time to prepare the May census file after the window opens: at most five business days (V1);
- attachment-without-arbitration rate of imported exam results: at least ninety-five percent of rows (V1).

## 11. Open questions

Open questions for this module (OQ-ZS-151 through OQ-ZS-159 in the migrated source, covering the Massar grade-entry framing text, the exact Excel column structures, the ESISE application forms, the certifying-result transcript format, the transfer-reference format, regional referential variants, and three already-resolved items — the MVP-wave-2 export version, the 6AP exam label, and the trimester-to-semester mapping) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
