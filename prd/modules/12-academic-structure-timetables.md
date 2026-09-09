# ZSchool — PED Module: Academic Structure and Timetables (Chapter 12)

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09) |
| Date | 2026-09-09 |
| Status | PRD Draft — under review |
| Source | `PROJECT.md` §2.2–2.5 (structure, systems, calendar, evaluation), §6.7 (academic structure, RG-24 to RG-26), §6.10 (entity schema), §7.3 (academics and timetables, G-13), §10, §12; G-12, G-13, G-29, C-01; `prd/research/04-pedagogy-massar-calendar.md`; `prd/research/00-baseline-corrections.md` (corrections no. 1, 3, 17) |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/journeys/01-school-group-director.md`, `prd/journeys/04-part-time-teacher.md`, `prd/journeys/07-students-minor-and-adult.md`, `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/19-teacher-career-network.md`, `prd/modules/21-massar-regulatory-exports.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` (ARB-01, ARB-04, ARB-05, ARB-23e, ARB-24b) |

---

## 1. Objective and Scope

This chapter covers the `PED` module (module code per conventions §2): the school's **academic structure** and **timetables**. It carries the `FR-PED-NN` requirement identifiers, counter starting at 01.

### 1.1 Objective

Give the school full configuration of its academic organization — sections, cycles, levels, tracks, classes, groups, subjects, evaluation periods, grading scales, rooms, calendar — then build, check, and publish timetables, so that every other module (attendance, assessments, finance, communication) relies on a single, consistent reference. The structure is the "context" in the identity → relationship → context → data chain of the domain model (`prd/03-domain-data-model.md` §1): with no structure instantiated, no academic data can be attached to an enrollment (DEC-18).

### 1.2 In Scope

| Function | Version |
|---|---|
| Instantiating structure templates: Moroccan national (default, MVP), French curriculum, and international (V1) | MVP / V1 |
| Section → Cycle → Level → Track/Option → Class → Groups tree | MVP |
| Subjects with a coefficient and teaching language per level and track (RG-26), mandatory/optional | MVP |
| Evaluation periods (semesters or terms) and sub-periods | MVP |
| Grading scales and computation rules (configuration; applying them to grades: `prd/modules/14-assessments-grades-report-cards.md`) | MVP |
| Rooms and resources per site | V1 |
| Cloning the structure from year N to N+1 without students (RG-25) | MVP (wave 2 — year-end close, JAL-07, ARB-01) |
| Declared expected sessions per class and day, with no timetable (ARB-04) | MVP |
| A session not held, teacher absence, substitution (ARB-05) | MVP |
| Assigning teachers to courses (`TeacherAssignment`) and homeroom teacher | MVP |
| Courses (subject × class/group) and mid-year class changes (RG-11) | MVP |
| Timetable: weekly grid, assisted manual entry, conflict detection | V1 |
| Timetable variants (normal, reduced-hours Ramadan, exams) | V1 |
| Publishing timetables to profiles; PDF export | V1 |
| Annual calendar (start of school, holidays, fixed and religious dates "to confirm," permanent UTC+0 time zone) | MVP (justified in OQ-02) |
| Class log and homework | V1 |
| Automatic timetable generation under constraints | V2+ |
| Declared expected sessions per class and day, with no timetable (FR-PED-20, `Session` entity, ARB-04) | MVP |
| A session not held, teacher absence, substitution (FR-PED-21, ARB-05) | MVP |

### 1.3 Out of Scope (cross-references)

| Function | Owner |
|---|---|
| Recording grades, averages, class councils, report cards (applying grading scales) | `prd/modules/14-assessments-grades-report-cards.md` |
| Roll call, attendance, tardiness, discipline (consuming the calendar, declared sessions, and, at V1, the timetable) | `prd/modules/13-attendance-student-life-discipline.md` |
| Enrollment, re-enrollment, student rollover, initial class assignment, and the mid-year class-change rule (FR-INS-22, sole owner) | `prd/modules/11-admissions-enrollment-reenrollment.md` |
| Tenant creation, setup wizard, Excel import of initial data | `prd/modules/10-administration-onboarding-subscription.md` |
| Massar exports (the PED module supplies subjects, coefficients, periods) | `prd/modules/21-massar-regulatory-exports.md` |
| Notifications (channels, routing, costs) triggered by publication | `prd/modules/17-communication-notifications.md` |
| Tracking the 8-hour quota for outside-the-public-sector teachers and AREF authorizations | `prd/modules/19-teacher-career-network.md` |
| Light e-learning (pushed online resources and homework) | V2+ (`PROJECT.md` §12, out of the journey map's §5 MVP scope) |

---

## 2. Users and Use Cases

Personas and detailed needs are in `prd/02-actors-personas.md` (`BES-…` identifiers); fine-grained permissions are in `prd/cross-cutting/30-roles-permissions-matrix.md` (least privilege, RG-39).

| Role | Main use cases | Needs cited |
|---|---|---|
| Director (director, group director) | Instantiates and adapts the structure, defines periods and grading scales, assigns teachers, appoints homeroom teachers, builds and publishes timetables, manages the calendar and its variants, clones year N+1 | BES-DIR-05 |
| Front office | Looks up the structure at the front desk (a student's class, homeroom teacher), enters class changes, prints timetables | — |
| Head supervisor | Reviews class timetables to organize roll call and supervision, follows the class log | BES-SUR-01, BES-SUR-07 |
| Teacher | Views their own timetable, keeps the class log and posts homework, reviews their course assignments | BES-ENS-04 |
| Parent / guardian | Views their children's timetable (variants included) and homework | BES-ELE-02, BES-ELE-04 (via the portal) |
| Student | Views their timetable for the day and the week, including the Ramadan variant, and the next day's homework | BES-ELE-02, BES-ELE-04 |

Cross-cutting use cases: the instantiated structure serves as the context for enrollment (level, track, class — RG-11), roll call per course (RG-39), assessments (periods, coefficients), and Massar exports (subject names).

---

## 3. Key User Journeys

Reference map: `prd/journeys/00-journey-map.md` (`PC-NN` identifiers). This chapter adds no journey and duplicates none.

| Journey | Role of the PED module | Detailed file |
|---|---|---|
| PC-03 — Onboarding a school | Instantiating the national structure template, school year, periods, grading scales; rooms and classes ahead of imports | `prd/journeys/01-school-group-director.md`, `prd/journeys/02-secretary-cashier.md` |
| PC-02 — Bulk re-enrollment and N → N+1 rollover | Cloning the N+1 structure without students (RG-25) before class assignment, done by the INS module | `prd/journeys/01-school-group-director.md` |
| PC-05 — Morning roll call | At MVP, declared expected sessions (FR-PED-20) and the calendar determine the courses and class days called by VSC; at V1, the published timetable automatically feeds the sessions | `prd/journeys/03-head-supervisor.md`, `prd/journeys/04-part-time-teacher.md` |
| PC-06 — Grades, class council, report cards | Evaluation periods, coefficients, and grading scales configured here, applied by EVA | `prd/journeys/04-part-time-teacher.md`, `prd/journeys/01-school-group-director.md` |
| PC-11 — Communication | Timetable publications and variant switches trigger notifications via COM | `prd/journeys/07-students-minor-and-adult.md` |

---

## 4. Functional Requirements

### FR-PED-01 — Instantiate a section from a provided structure template

| Attribute | Value |
|---|---|
| Description | The school creates a section (education system) by choosing a template provided by ZSchool: Moroccan national (default), French curriculum, international (RG-24). The wizard instantiates the chosen template's cycles, levels, and nomenclature (national: preschool, primary 1AP–6AP, middle school 1AC–3AC, upper secondary common core–2nd Bac, §2.2), the program's usual subjects with their default ministry coefficients (editable), the template's evaluation periods (semesters for the national system, terms for the French curriculum), and grading out of 20. The school then freely adapts the instantiation (additions, removals, renaming) without ever breaking existing links. The French-curriculum and international templates are activatable at V1; letter grades and GPA scales for international sections remain out of scope until V2+ (§12). |
| Priority | Must |
| Version | MVP (national template); V1 (French curriculum, international) |
| Traceability | RG-24, G-29, C-01, DEC-29, §2.3, §12; PC-03 |
| Actors | Director |

```gherkin
Feature: Instantiating the national structure template
  Scenario: A school instantiates the national template for the 2026-2027 school year
    Given a newly onboarded school with no academic structure
    And whose authorized cycles are primary, middle school, and upper secondary (RG-22)
    When the director launches the instantiation wizard and chooses the "Moroccan national" template
    And confirms school year 2026-2027
    Then sections, cycles, and levels 1AP through 2nd Bac are created per the template
    And the default evaluation periods are two semesters
    And usual subjects are created with default ministry coefficients, editable
    And no class yet contains any student
  Scenario: A template unavailable for the authorized cycles is refused
    Given a school authorized only for preschool and primary (RG-22)
    When the director attempts to instantiate an upper-secondary-only section
    Then the wizard flags the mismatch with the school's authorized cycles
    And no section is created
```

### FR-PED-02 — Manage the Section → Cycle → Level → Track → Class → Groups tree

| Attribute | Value |
|---|---|
| Description | The school manages its academic tree within the limits of its instantiated templates: creating, editing, renaming, and deactivating each link. A section (education system) groups cycles, themselves constrained to the school's authorized cycles (RG-22); a cycle groups levels (1AP…2nd Bac); a level groups tracks or options (upper secondary: Mathematical Sciences A/B, Physical Sciences, Life and Earth Sciences, Humanities, Social Sciences, Economics, Accounting Management Sciences, Science and Technology; International Option of the Baccalaureate in French/English/Spanish, §2.2); a level or track groups classes (label, capacity — checked at assignment: exceeding it is possible only with the director's documented approval, ARB-24b; a level's capacity, used by the waitlist FR-INS-04, is the sum of its classes' capacities); a class groups groups (languages, options, lab work). Several sections coexist within the same school (national and international, §2.3) and several campuses may host classes (G-13, `Campus`). An element attached to active enrollments cannot be deleted (FR-PED-19). |
| Priority | Must |
| Version | MVP |
| Traceability | RG-22, RG-24, G-13, G-29, §6.7, §6.10, §2.2; INV-17 (`prd/03-domain-data-model.md`); ARB-24b |
| Actors | Director |

```gherkin
Feature: Academic tree (MVP)
  Scenario: Creating a class with a capacity
    Given a 2AC level instantiated in the national section
    When the director creates the class "2AC-3" with a capacity of 32
    Then the class appears under level 2AC with an enrollment of 0 out of 32
    And level 2AC's capacity is recalculated as the sum of its classes' capacities
  Scenario: Deletion refused for an occupied class
    Given a class attached to 28 active enrollments
    When the director attempts to delete it
    Then the deletion is refused and the system offers to first move the students or to deactivate the class
```

### FR-PED-03 — Define coefficient and teaching language per level and track (RG-26)

| Attribute | Value |
|---|---|
| Description | Each school subject is configured per (level, track) pair via `SubjectLevelConfig`: coefficient, teaching language, mandatory or optional status. No coefficient or language is ever defined globally on the subject (RG-26, INV-41). Example: math carries the coefficient specific to the level and may be taught in Arabic in the national section and in French in a bilingual section of the same school. Available teaching languages cover at least Arabic, French, English, and Spanish. This configuration feeds average calculations (`prd/modules/14-assessments-grades-report-cards.md`) and Massar exports (`prd/modules/21-massar-regulatory-exports.md`). |
| Priority | Must |
| Version | MVP |
| Traceability | RG-26, G-29, H-04, §6.7, §2.3; INV-41 (`prd/03-domain-data-model.md`) |
| Actors | Director |

```gherkin
Feature: Configuring a subject by level and track
  Scenario: The same subject carries distinct configurations
    Given a national section and a bilingual section coexisting at the school (§2.3)
    And the subject "Mathematics" already in the school's catalog
    When the director configures math for (2nd Bac, Mathematical Sciences A)
    Then the entered coefficient and teaching language are specific to this level-track pair
    And the configuration for (2nd Bac, Economics) stays independent and unchanged
  Scenario: A duplicate configuration is refused
    Given an existing configuration for (1AC, no track)
    When the director attempts to create a second configuration for the same subject-level-track combination
    Then the creation is refused with an explicit error message
    And the existing configuration is preserved (INV-41)
```

### FR-PED-04 — Define evaluation periods and sub-periods

| Attribute | Value |
|---|---|
| Description | For each school year, the school defines its evaluation periods (`EvaluationPeriod`): semesters (national system default, §2.5) or terms (French curriculum, the bilingual pilot school under DEC-35; terms are at MVP to cover the pilot, aligned with OQ-04 in `prd/modules/14-assessments-grades-report-cards.md`), with start and end dates aligned with the annual calendar (FR-PED-16) and statuses (upcoming, in progress, closed). It defines dated sub-periods for intermediate milestones (exams, mock exams, standardized tests, §2.5). Closing a period and locking entries are owned by the EVA module (`prd/modules/14-assessments-grades-report-cards.md`); this chapter supplies the periods and their dates. |
| Priority | Must |
| Version | MVP |
| Traceability | G-12, DEC-35, §2.5, §6.7, §12; OQ-04 in `prd/modules/14-assessments-grades-report-cards.md`; ARB-17h |
| Actors | Director |

```gherkin
Feature: Evaluation periods (MVP)
  Scenario: A bilingual school on terms with Massar mapping
    Given a bilingual section configured with three terms for 2026-2027
    When the director records the terms' dates
    Then the three periods are created with statuses and aligned with the annual calendar
    And the mapping table to Massar semesters is offered with a default value (T1 → S1, T2 → S1 until the ministry's S1 end date then S2, T3 → S2), editable
  Scenario: Overlapping periods refused
    Given semester 1 ending on January 24, 2027
    When the director enters semester 2 starting on January 20, 2027
    Then the entry is refused with the overlap reason
```

### FR-PED-05 — Configure grading scales and computation rules

| Attribute | Value |
|---|---|
| Description | The school configures its grading scales (`GradingScale`) and computation rules (`ComputationRule`): default grading out of 20 with decimals (§2.5), rounding, coefficient-weighted average calculation, rank. Weightings for certifying exams are configurable per level and versioned per school year, with default ministry values kept here (6AP 50/25/25; 3AC 30/30/40; Baccalaureate 25/25/50; `prd/research/04-pedagogy-massar-calendar.md` §1, H-02) and tracked textual references. Boundary: this chapter owns configuring, storing, and versioning grading scales and computation rules; the evaluation rules themselves are owned by `prd/modules/14-assessments-grades-report-cards.md` and are not duplicated here — honors-rating thresholds (FR-EVA-09), possible exclusion of the lowest grade beyond a given count of grades (FR-EVA-07), default national weightings versioned and tracked on the report card (FR-EVA-08) — and applying them to grades, averages, and report cards is owned by EVA. Configuration of the "at least two tests and one standardized test per subject and per semester" compliance check is proposed here with default values. Letter grades and GPA scales for international sections are out of scope until V2+ (§12). A baseline/research divergence is recorded in OQ-06 (suspension of memoranda 080.21/081.21 as of 29/11/2021, `prd/research/00-baseline-corrections.md` no. 3). |
| Priority | Must |
| Version | MVP (base configuration); V2+ (letters, GPA) |
| Traceability | G-12, H-02, §2.2, §2.5, §6.7, §12; correction no. 3; FR-EVA-07, FR-EVA-08, FR-EVA-09 in `prd/modules/14-assessments-grades-report-cards.md` |
| Actors | Director |

```gherkin
Feature: Grading scales and computation rules (MVP)
  Scenario: Default national weightings versioned
    Given year 2026-2027 instantiated on the national template
    When the director opens the certifying-exam weightings
    Then the default values 6AP 50/25/25, 3AC 30/30/40, and Baccalaureate 25/25/50 are pre-filled with their textual reference
    And a change creates a dated version for the year, with the previous one still viewable
```

### FR-PED-06 — Manage rooms and resources

| Attribute | Value |
|---|---|
| Description | The school keeps a catalog of rooms and resources (`Room`) per site (`Campus`): label, capacity, type (classroom, laboratory, computer lab, gym, library, workshop), features and equipment. Rooms can be assigned to timetable slots (FR-PED-11) and are used for conflict detection (FR-PED-12). The catalog is tied to the tenant (INV-17) and usable by the organization's consolidated views without merging data (RG-21). |
| Priority | Must |
| Version | V1 |
| Traceability | G-13, §6.7, §6.10, RG-21 |
| Actors | Director |

### FR-PED-07 — Clone the structure from year N to N+1 without students

| Attribute | Value |
|---|---|
| Description | From an existing school year, the director launches cloning to year N+1 (RG-25, INV-42): sections, cycles, levels, tracks, classes, groups, subjects, per-level/track configurations (coefficients, languages), template periods, grading scales, and computation rules are copied. Never copied: enrollments and students, teacher course assignments, or year N's timetables. Year N+1 is created in "preparation" status; a cloning report lists the elements copied and gaps to fill in (target headcounts, homeroom teachers to reappoint). The closed year N remains viewable read-only (RG-32). Cloning prepares the student rollover carried out by INS (`prd/modules/11-admissions-enrollment-reenrollment.md`, PC-02). |
| Priority | Must |
| Version | MVP (wave 2 — year-end close, JAL-07; ARB-01) |
| Traceability | RG-25, RG-32, G-13, §6.7, §7.2, §12; INV-42 (`prd/03-domain-data-model.md`); PC-02; ARB-01 |
| Actors | Director |

```gherkin
Feature: Cloning the academic structure from N to N+1
  Scenario: Full year cloning
    Given school year 2026-2027 structured (3 cycles, 12 levels, 24 classes, subjects configured)
    And year 2027-2028 not existing
    When the director launches cloning from 2026-2027 to 2027-2028
    Then year 2027-2028 is created in "preparation" status
    And sections, cycles, levels, tracks, classes, groups, subjects, coefficients, grading scales, and template periods are copied identically
    And no student and no enrollment is copied (RG-25, INV-42)
    And no teacher assignment and no timetable is copied
    And a cloning report is shown with the details of the copied elements
  Scenario: Target year already exists
    Given a year 2027-2028 already created in preparation
    When the director attempts a second cloning into 2027-2028
    Then the operation is refused and the system offers either to cancel or to compare the two structures without overwriting
```

### FR-PED-08 — Assign teachers to courses and appoint the homeroom teacher

| Attribute | Value |
|---|---|
| Description | For each course, the director assigns a teacher (`TeacherAssignment`) from among the school's active affiliations (an active `SchoolMembership`, RG-18): a course (subject × class or group) may receive a lead teacher and, where applicable, co-teachers. Each assignment carries a weekly teaching-hour load, which feeds per-teacher totals (tracking the 8-hour quota for outside-the-public-sector teachers is owned by the CAR module, `prd/modules/19-teacher-career-network.md`, correction no. 18). Deactivating an affiliation removes the corresponding assignments and alerts the director about orphaned courses (RG-19, INV-16); a scheduled affiliation closure (future end date, FR-CAR-04 in `prd/modules/19-teacher-career-network.md`, ARB-23e) surfaces courses to be reassigned before the date, with a suggested replacement from among active affiliations. The director appoints, per class, a homeroom teacher from among the assigned teachers: only one active appointment at a time, logged, visible to parents and students (§2.2, §7.3). Assignments underpin the teacher's permissions (least privilege RG-39, INV-34). |
| Priority | Must |
| Version | MVP |
| Traceability | RG-18, RG-19, RG-39, §7.3, §6.10; INV-16, INV-34 (`prd/03-domain-data-model.md`); correction no. 18; BES-ENS-05; ARB-23e |
| Actors | Director |

```gherkin
Feature: Teacher assignment (MVP)
  Scenario: Permissions derive from assignments
    Given Khadija, active affiliation, assigned to math for 2AC-1 and 2AC-3
    When she opens her student list
    Then she sees only students from 2AC-1 and 2AC-3, and no student from any other class
  Scenario: Orphaned courses after a scheduled affiliation closure
    Given an affiliation whose end is scheduled for January 31
    When the director reviews assignments on January 15
    Then this teacher's courses are listed "to reassign before January 31" with suggested replacements
    And on the end date, any unreassigned course is flagged orphaned
  Scenario: Only one active homeroom teacher per class
    Given a class with an appointed homeroom teacher
    When the director appoints another teacher assigned to the class
    Then the previous appointment is closed and logged, and the new one is visible to parents and students
```

### FR-PED-09 — Build courses (subject × class/group)

| Attribute | Value |
|---|---|
| Description | The system generates the list of courses (`Course`) for a class from the subjects configured for its level and track (FR-PED-03): one course per mandatory subject, one course per chosen optional subject, and per-group courses for languages, options, and lab work (`Group`). A course can be deactivated (for example a subject not taught in a given class) with a reason. Courses carry the target weekly hour load and form the basis for assignments (FR-PED-08) and timetable slots (FR-PED-11). |
| Priority | Must |
| Version | MVP |
| Traceability | §6.7, §6.10, RG-26 |
| Actors | Director |

```gherkin
Feature: Building courses (MVP)
  Scenario: Generating a class's courses
    Given class 1AC-2 and eight subjects configured for level 1AC, one of them optional
    When the director generates the class's courses
    Then seven mandatory courses are created, and the optional course is created only if the option is selected for the class
    And a course deactivated with a reason no longer appears in assignments or in expected sessions
```

### FR-PED-10 — Record a mid-year class change

| Attribute | Value |
|---|---|
| Description | The mid-year class-change rule is owned by FR-INS-22 in `prd/modules/11-admissions-enrollment-reenrollment.md` (sole owner: an append-only entry in `StudentClassHistory`, the enrollment unchanged, notifying parents, the homeroom teacher, and the old and new teachers, with the rank computed in the current class at closing — RG-11, INV-07, ARB-17d). This module provides the entry point from the structure browser (ECR-PED-02) and a class's list: the director, academic leadership, or the front office selects the student, the target class (same level or a different one after a decision), the effective date, and the reason, and triggers FR-INS-22's operation; the headcounts and capacities of both classes are updated (ARB-24b) and teacher assignments remain unchanged. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-11, DEC-18, §6.3; INV-07 (`prd/03-domain-data-model.md`); FR-INS-22 (owner); ARB-17d, ARB-24b |
| Actors | Director, academic leadership, front office |

```gherkin
Feature: Class change from the structure browser (MVP)
  Scenario: Moving into a full class
    Given the target class 2AC-1 at its maximum capacity
    When the front office moves a student from 2AC-3 to 2AC-1 from the class list
    Then FR-INS-22's operation is triggered only after the director's documented approval
    And the headcounts of both classes are updated and the history entry is created
```

### FR-PED-11 — Build the timetable: weekly grid and assisted manual entry

| Attribute | Value |
|---|---|
| Description | The timetable editor (`Timetable`, `TimetableSlot`) works on a weekly grid from Monday to Saturday; Saturday holds classes only in the morning when the school's configuration provides for it (the school week often extends to Saturday noon, §2.4; Saturday classes are configurable, `prd/research/04-pedagogy-massar-calendar.md` §3). Session duration, breaks, and daily span per cycle are configurable (default values to confirm with the pilots, OQ-04). Entry is manual and assisted: placing a course by drag-and-drop or slot selection, conflict-free slot suggestions for a given course, duplicating a grid across parallel classes, automatic locking of the calendar's holidays and breaks (FR-PED-16). Slots carry the course, the assigned teacher, the room, and the variant they belong to. A timetable exists as a draft until it is published (FR-PED-14). Once published, it automatically feeds roll call's expected sessions (FR-PED-20), which remain editable day-to-day by student life (FR-PED-21). Automatic generation is handled in FR-PED-18. |
| Priority | Must |
| Version | V1 |
| Traceability | G-13, §2.4, §7.3, §12; correction no. 17 |
| Actors | Director |

### FR-PED-12 — Detect teacher, room, and class conflicts

| Attribute | Value |
|---|---|
| Description | At each placement, the editor checks conflicts in real time and shows the result next to the grid; a global check is re-run before any publication: the same teacher on two courses in the same slot, the same class (or group) booked twice, the same room assigned twice, a teacher with no active affiliation, a room whose capacity is below the class's headcount (warning), a room type incompatible with the subject (warning, for example a lab required for practical work). Blocking conflicts prevent publication; warnings require a logged, documented confirmation (RG-38). The check runs against the active variant and applies to each variant (FR-PED-13). |
| Priority | Must |
| Version | V1 |
| Traceability | G-13, §7.3, §12, RG-38 |
| Actors | Director |

```gherkin
Feature: Conflict detection while building a timetable
  Scenario: Teacher conflict detected at placement
    Given a draft timetable for class 2AC-3 for year 2026-2027
    And teacher Khadija assigned to math for 2AC-3 and 2AC-1
    And a slot already placed: Tuesday 8am, 2AC-1, math, Khadija
    When the director places the Tuesday 8am slot for 2AC-3, math, Khadija
    Then the placement is flagged as a blocking conflict "teacher already booked in this slot"
    And the slot is not saved as-is
    And the system offers the free slots common to Khadija and to 2AC-3
  Scenario: Room conflict blocking publication
    Given a complete draft timetable
    And two classes placed in room S-12 on Monday 10am
    When the director runs the global check before publication
    Then the check report lists the room conflict as blocking
    And publication is refused while the conflict remains
```

### FR-PED-13 — Manage timetable variants (normal, reduced-hours Ramadan, exams)

| Attribute | Value |
|---|---|
| Description | For each school year, the school defines timetable variants (`ScheduleVariant`): normal (default), reduced-hours Ramadan (shortened sessions and a continuous schedule, §2.4), and exam period (mock and certifying exam scheduling). A variant has a dated validity window, built by duplicating the normal variant then adjusting it, or entered directly. Only one variant is active at a time per section — or per school when all sections share the same calendar (a unit of constraint to confirm with the DEC-35 pilots); the switch can be scheduled in advance (start of Ramadan) or triggered manually, and immediately notifies all profiles concerned (students, parents, teachers, student life) via `prd/modules/17-communication-notifications.md` (DEC-12, DEC-36). Religious dates are "to confirm" until the official announcement (FR-PED-16); a scheduled switch remains editable until it executes. Every switch is logged (RG-38). The reduced-hours variant is a scheduling need for teaching purposes, distinct from the time zone: permanent UTC+0 (OQ-01, correction no. 1). |
| Priority | Must |
| Version | V1 |
| Traceability | G-13, §2.4, §7.3, §12, DEC-12, DEC-36, RG-38; corrections no. 1 and 17 |
| Actors | Director |

```gherkin
Feature: Switching to the reduced-hours Ramadan variant
  Scenario: Scheduling then executing the switch
    Given a "normal" variant active for 2026-2027
    And a "reduced-hours Ramadan" variant built, valid from 08/02/2027 to 09/03/2027 "to confirm" (prd/research/04-pedagogy-massar-calendar.md §3)
    When the director schedules the switch for 08/02/2027
    Then the system confirms the schedule and shows it as the next planned variant
    And on the planned date, the "reduced-hours Ramadan" variant becomes active for all profiles
    And students, parents, teachers, and student life receive a bilingual notification with the new schedule (DEC-12, DEC-36)
    And the variant history allows viewing past schedules
  Scenario: Changing a scheduled switch
    Given a Ramadan switch scheduled for 08/02/2027
    When the director moves the validity window after the Habous (Ministry of Islamic Affairs) official announcement
    Then the schedule is updated and logged (RG-38)
    And no notification is sent before the new date
```

### FR-PED-14 — Publish timetables to profiles

| Attribute | Value |
|---|---|
| Description | The director publishes a draft timetable to its target: class, level, cycle, or school; a teacher publishes their own personal grid for reference with no effect on the official grid. Publication makes the grid visible: to students with personal access (RG-01, INV-36), to parents, to teachers (a personal grid built from their active assignments), to the head supervisor, and to the director. Viewing is mobile-first, in day and week views, showing the teacher's name and the room, and remains viewable offline (`NFR-OFF` domain, `prd/cross-cutting/32-non-functional-requirements.md`). Any publication or significant change after publication notifies the profiles concerned of the changes (cross-reference `prd/modules/17-communication-notifications.md`); prior versions remain viewable (history). |
| Priority | Must |
| Version | V1 |
| Traceability | RG-01, G-13, §7.3, §12, DEC-12; INV-36 (`prd/03-domain-data-model.md`) |
| Actors | Director, Teacher, Head Supervisor, Student, Parent |

### FR-PED-15 — Export timetables as PDF

| Attribute | Value |
|---|---|
| Description | The school exports timetables as bilingual French-Arabic PDFs (DEC-10): by class, by teacher, by room, by level, and a school-wide summary view. Each document carries the school year, the active variant and its validity window, and the generation date; the school's documents carry its configured visual identity (logo). PDFs follow A4 and A5 formats with correct Arabic fonts (§10), and bulk printing is possible (all classes of a level). |
| Priority | Should |
| Version | V1 |
| Traceability | G-13, §7.3, §10, DEC-10 |
| Actors | Director, Front office |

### FR-PED-16 — Maintain the annual calendar (start of school, holidays, breaks, UTC+0 time zone)

| Attribute | Value |
|---|---|
| Description | Each school year has a calendar (`Calendar`, `Holiday`) preloaded by ZSchool with published ministry dates (`prd/research/04-pedagogy-massar-calendar.md` §3): students' start of school and the start of mandatory classes (Monday 07/09/2026), four one-week breaks (18–25/10/2026, 06–13/12/2026, 21–28/03/2027, 09–16/05/2027), a mid-year break (24–31/01/2027), fixed-date national holidays (10/31, 11/06, 11/18, 01/01, 01/11, 01/14 Amazigh New Year), and national exams (Baccalaureate regular session 06/01–06/03/2027). Movable religious holidays (Ramadan, Eid al-Fitr, Eid al-Adha, 1st of Muharram, Mawlid) are preloaded with a "to confirm" status and updated during the year once confirmed by lunar sighting; the update notifies the school. The school may adjust its calendar within the allowed margin; a French-curriculum section (V1) carries its own calendar (AEFE network holidays), entered by the school from the calendar published by the network, so each section can have different class days. The calendar distinguishes business days from class days (no roll call on public holidays, consumed by VSC: `prd/modules/13-attendance-student-life-discipline.md`), aligns evaluation periods (FR-PED-04), and bounds variant windows (FR-PED-13). The week runs Monday–Saturday, with Saturday mornings configurable (FR-PED-11). The time zone has been permanent UTC+0 since 20/09/2026 (Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026; `prd/research/00-baseline-corrections.md` no. 1): no more seasonal alternation or Ramadan exception; timestamps are stored in UTC and displayed in Morocco time. A divergence from the baseline is recorded in OQ-01. |
| Priority | Must |
| Version | MVP (explicit justification: the calendar governs roll call, notifications, and the MVP's periods; see OQ-02) |
| Traceability | §2.4, §7.3, G-11, G-13; corrections no. 1 and 17; `prd/research/04-pedagogy-massar-calendar.md` §3 |
| Actors | Director (adjustments), ZSchool (preloading) |

```gherkin
Feature: Annual calendar (MVP)
  Scenario: Confirming a movable holiday
    Given Eid al-Fitr preloaded "to confirm" for 03/20/2027
    When ZSchool confirms the date as 03/21/2027 after the official announcement
    Then class days are recalculated, no expected session is generated on 03/21/2027, and the school is notified
  Scenario: No roll call on a public holiday
    Given 11/06/2026 marked as a holiday
    When student life reviews expected sessions for that day
    Then no expected session is listed
```

### FR-PED-17 — Keep the class log and post homework

| Attribute | Value |
|---|---|
| Description | For each course and each session (tied to a timetable slot), the teacher keeps the class log: content covered, assigned work with a due date, lightweight attached resources (files and links; full e-learning stays V2+, §12). Entry works on the web and on mobile, fault-tolerant with synchronization (§10); entry after the fact is allowed with no real-time requirement. Visible to: the director, the head supervisor, the class's homeroom teacher, students with access (RG-01), and their parents. Each student has a consolidated "today's and upcoming homework" view across all their subjects. Graded homework remains owned by EVA (`prd/modules/14-assessments-grades-report-cards.md`); a session declared not held or substituted (FR-PED-21) is marked as such in the class log, with no expected content from the absent teacher. |
| Priority | Should |
| Version | V1 |
| Traceability | §7.3, §12, RG-01, RG-39; BES-ENS-04, BES-ELE-04 |
| Actors | Teacher, Director, Head Supervisor, Student, Parent |

### FR-PED-18 — Automatically generate timetables under constraints

| Attribute | Value |
|---|---|
| Description | At V2+, the system offers automatic timetable generation under constraints: course hour loads, teacher availability and quotas, room capacities and types, daily session limits, breaks. The generated proposal remains a draft validated by the director, editable in the manual editor (FR-PED-11), and subject to the same conflict checks (FR-PED-12) before publication. |
| Priority | Could |
| Version | V2+ |
| Traceability | G-13, §7.3, §12 |
| Actors | Director |

### FR-PED-19 — Ensure the structure stays consistent with enrollments

| Attribute | Value |
|---|---|
| Description | The structure is protected against inconsistencies: an element (class, level, track, subject) attached to active enrollments cannot be deleted; the system offers either to move students out first (a logged class change, FR-PED-10), or to deactivate the element (no longer selectable, data retained). Renaming is allowed and logged (log, RG-38). A closed school year moves to read-only (RG-32); its structures remain viewable for archiving and certificates. Class labels are unique per level and per year. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-11, RG-32, RG-38, DEC-18, §6.7 |
| Actors | Director |

```gherkin
Feature: Structure/enrollment consistency (MVP)
  Scenario: A closed year is read-only
    Given year 2026-2027 closed by the rollover
    When the director attempts to rename a class from this year
    Then the change is refused, with the year remaining viewable for archiving and certificates
```

### FR-PED-20 — Declare expected sessions per class and day with no timetable

| Attribute | Value |
|---|---|
| Description | At MVP, roll call per course (FR-VSC-01 in `prd/modules/13-attendance-student-life-discipline.md`) relies on **declared sessions** (ARB-04), with no timetable: a session is the triplet (course, date, slot), unique per triplet. Two sources: (a) student life or the director declares a **simple weekly grid** of expected sessions per class (day, labeled slot — for example "8am–9am" —, course), with no rooms or conflict detection, valid over a date range and repeated for every class day in the calendar (FR-PED-16), with separate grids per variant (normal, reduced-hours Ramadan); (b) the teacher creates a session on the fly, at roll-call time, for their course on a free slot of the day when no expected session is declared. Sessions carry a status: expected, held (roll call confirmed), not held (FR-PED-21). At V1, the published timetable (FR-PED-11, FR-PED-14) generates expected sessions and replaces the simple grid, with no break in roll-call data. Domain entity: `Session`, to be added to `prd/03-domain-data-model.md`'s dictionary, tied to `Course`, the date, and the slot, with a tenant key (INV-17). |
| Priority | Must |
| Version | MVP |
| Traceability | §7.3, §7.4, §10; ARB-04; FR-VSC-01, ECR-VSC-02 (`prd/modules/13-attendance-student-life-discipline.md`); FR-RAP-04, FR-RAP-06 (`prd/modules/20-dashboards-reporting.md`) |
| Actors | Head supervisor, director, teacher |

```gherkin
Feature: Expected sessions with no timetable (MVP)
  Scenario: A simple weekly grid declared by student life
    Given class 2AC-3 and a declared grid "Monday 8am–9am: math; Monday 9am–10am: Arabic"
    When Monday, September 21, 2026 arrives
    Then two expected sessions are generated for 2AC-3 that day and appear in student life's expected roll calls
    And no session is generated on a Sunday or a calendar holiday
  Scenario: A session created on the fly by the teacher
    Given a physics course for 3AC-1 with no expected session declared that day
    When the teacher opens roll call and chooses the "10am–11am" slot
    Then a session (physics 3AC-1, today's date, 10am–11am) is created and roll call is attached to it
    And a second attempt on the same triplet redirects to the existing roll call instead of creating a duplicate
```

### FR-PED-21 — Declare a session not held, a teacher absence, or a substitution

| Attribute | Value |
|---|---|
| Description | Student life or academic leadership declares that an expected session is not taking place (ARB-05): a teacher absence (with a date range, optional reason, which marks all their sessions in the range as not held), a one-off cancelled session (field trip, event, strike, bad weather), or a substituted session (a different teacher, a different course, same slot). Effects: the session not held drops out of expected roll calls and roll-call rates (FR-VSC-13, FR-RAP-01, attendance-rate definition ARB-24a); the class log (FR-PED-17, V1) carries the note; an optional notification to the class's parents is offered (channels from `prd/modules/17-communication-notifications.md`, sending windows ARB-21e); the substitute teacher's actual hours are counted toward their total (FR-CAR-12 in `prd/modules/19-teacher-career-network.md`). Every declaration is logged (author, date, reason) and can be undone as long as the session has no confirmed roll call. |
| Priority | Must |
| Version | MVP |
| Traceability | §7.3, §7.4; RG-38; ARB-05, ARB-24a; FR-PED-20; FR-VSC-13 |
| Actors | Head supervisor, academic leadership, director |

```gherkin
Feature: A session not held (MVP)
  Scenario: A teacher's three-day absence
    Given Khadija assigned to six expected sessions from Monday to Wednesday
    When student life declares her absence from Monday to Wednesday
    Then the six sessions move to "not held" and drop out of student life's expected roll calls
    And the week's roll-call rate is computed without these six sessions
  Scenario: A one-off substitution
    Given a math session expected on Tuesday 8am–9am for 2AC-3
    When student life declares a substitution by Hassan for this slot
    Then the session remains expected with Hassan as the teacher, and Hassan can take its roll call
    And the hour is counted toward Hassan's weekly total
```

---

## 5. Morocco-Specific Considerations

1. **Default national template**: 1AP…2nd Bac nomenclature, upper-secondary tracks and options (including the International Option of the Baccalaureate in French), ministry coefficients and preloaded semesters (§2.2, RG-24, C-01). The French-curriculum (PS…Terminale, terms) and international templates round out the offering at V1 (§12); letter grades and GPA scales wait for V2+.
2. **Certifying-exam weightings**: 6AP 50/25/25, 3AC 30/30/40, Baccalaureate 25/25/50; configurable default values, versioned per year, with references tracked on report cards (`prd/research/04-pedagogy-massar-calendar.md` §1; applied in `prd/modules/14-assessments-grades-report-cards.md`, exported in `prd/modules/21-massar-regulatory-exports.md`).
3. **Preloaded national calendar**: 2026-2027 ministry dates (start of school, breaks, national holidays, exams); movable religious holidays with "to confirm" status, confirmed a few days ahead by lunar sighting (Habous, the Ministry of Islamic Affairs) and updated during the year (`prd/research/04-pedagogy-massar-calendar.md` §3).
4. **School time**: Monday–Saturday week, Saturday mornings configurable; span and breaks per cycle; a reduced-hours continuous schedule during Ramadan, as a teaching-schedule variant (§2.4).
5. **Time zone**: permanent UTC+0 since 20/09/2026 (Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026) — the baseline's §2.4/§10 Ramadan exception is obsolete (correction no. 1, OQ-01). Ramadan schedule variants remain a teaching-schedule accommodation, not a time-zone issue.
6. **Bilingualism**: structure labels, timetables, and the class log in French and Arabic; bilingual PDF exports with correct Arabic fonts, A4/A5 (§10, DEC-10).

---

## 6. Data and Events

Entities from the consolidated schema (`PROJECT.md` §6.10, full dictionary in `prd/03-domain-data-model.md` §2.3) used by this module:

| Entity | Role in the module |
|---|---|
| `Section` | Education system instantiated from a template (RG-24) |
| `Cycle`, `Level`, `Track`, `Class`, `Group` | Academic tree; `Class` carries the homeroom teacher and enrollment membership |
| `AcademicYear` | School year (preparation, in progress, closed); supports N+1 cloning (INV-42) |
| `Calendar`, `Holiday`, `ScheduleVariant` | Annual calendar, holidays (Gregorian and Hijri), schedule variants |
| `Subject`, `SubjectLevelConfig` | Subjects and per-level/track configuration: coefficient, language, mandatory/optional (INV-41) |
| `Course` | Course: subject × class or group; the basis for assignments and slots |
| `TeacherAssignment` | Teacher × course assignment; homeroom teacher; underpins permissions (INV-34) |
| `Room` | Rooms and resources per site |
| `Timetable`, `TimetableSlot` | Timetables, slots, variants; conflict detection (V1); generate expected sessions |
| `Session` | A declared session: course × date × slot, status (expected, held, not held, substituted), the actual teacher; underpins roll call from MVP (FR-PED-20, FR-PED-21, ARB-04) — an entity to be added to `prd/03-domain-data-model.md`'s dictionary |
| `GradingScale`, `EvaluationPeriod`, `ComputationRule` | Grading scales, evaluation periods and sub-periods, computation rules |
| Related entities | `Campus` (sites), `Enrollment` (current class), `StudentClassHistory` (RG-11), `SchoolMembership` (active affiliations) |

Domain events (`prd/03-domain-data-model.md` §7):

| Event | Trigger | Consumers |
|---|---|---|
| `ClassChanged` | A class change recorded (FR-INS-22, triggered from FR-PED-10) | Parents, homeroom teacher, teachers involved; logging |
| `SessionNotHeld` | A teacher-absence, cancellation, or substitution declaration (FR-PED-21) | Student life (expected roll calls), the substitute teacher, the class's parents (optional) — an event to be added to `prd/03` §7's catalog |
| Publication and variant notifications | Timetable publication, a change after publication, a variant switch (FR-PED-13, FR-PED-14) | Students (per RG-01), parents, teachers, student life — routed via `prd/modules/17-communication-notifications.md` (DEC-12, DEC-36) |

Adding dedicated events to the catalog (timetable publication, variant activation) is proposed in OQ-03.

---

## 7. Key Screens

Text descriptions, mobile-first, bilingual FR/AR with RTL support (DEC-10, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`).

| ID | Screen | Description |
|---|---|---|
| ECR-PED-01 | Structure instantiation wizard | Three steps: template choice (national selected by default, French curriculum, international, with a summary of each template), school year, confirmation. Shows a preview of the tree that will be created (cycles, levels, subjects, periods) and the school's authorized cycles (RG-22). States: in progress, success with a link to the browser, explicit blocking errors. |
| ECR-PED-02 | Academic tree browser | Navigation by year then section → cycle → level → track → classes/groups; breadcrumb; contextual creation and editing; per-class headcount badges; deactivated elements grayed out; links to the class (students, homeroom teacher) and to the timetable. |
| ECR-PED-03 | Subject record and per-level/track configuration | List of the school's subjects; a subject's detail with its configurations (level × track): coefficient, teaching language, mandatory/optional; inline addition and editing; a warning if a level's class has courses with no valid configuration. |
| ECR-PED-04 | Periods and grading scales | Periods column: the year's periods with dates, statuses, and sub-periods; grading scales column: default scale, honors ratings, rounding, certifying weightings versioned per year with their textual reference. Date adjustment with overlap checks and calendar alignment. |
| ECR-PED-05 | Teacher assignment | A classes × subjects grid for a level: each cell carries the assigned teacher, the hour load, and the homeroom teacher; per-teacher filters (cumulative weekly load); an alert on orphaned courses after an affiliation closure; quick access to homeroom-teacher appointment. |
| ECR-PED-06 | Timetable editor | A weekly grid (Monday–Saturday columns, Saturday restricted to mornings per configuration); a side panel of unplaced courses; drag-and-drop or selection placement; a real-time conflict panel (blocking in red, warnings in orange with a documented confirmation); a variant selector and validity window; draft, global check, publish, and PDF-export buttons. |
| ECR-PED-07 | Annual calendar | A year view with class days, breaks, national and religious holidays; a distinctive "to confirm" status on movable holidays with a provisional date; date editing with logging; links to evaluation periods and variant windows. |
| ECR-PED-08 | Timetable viewing (mobile) | Day view by default, a week toggle; session cards (subject, time, room, teacher); an active-variant banner (for example "Ramadan Hours"); offline viewing of the last synced grid; prior versions accessible from the history. Variants: student (their class), parent (per child), teacher (their personal grid), supervisor (per class). |
| ECR-PED-09 | Class log and homework | Teacher side: the day's and week's session list, quick entry of content and assigned work with a due date and an attachment, a sync indicator in offline mode. Student/parent side: a consolidated list of upcoming homework by subject and day. |
| ECR-PED-10 | N → N+1 cloning wizard (MVP wave 2) | Selecting the source year and the target year; a summary of copied elements (structure, subjects, grading scales) and not-copied elements (students, assignments, timetables); launch, progress, a final report with gaps to fill in and a link to the N+1 year in preparation. |
| ECR-PED-11 | Expected-sessions grid (MVP) | Per class and per variant: a day × labeled-slot table, each cell carrying a course; a validity window; duplication across parallel classes; a preview of the sessions generated for the current week; no room or conflict check (reserved for the V1 editor). |
| ECR-PED-12 | Declaring a session not held (MVP, mobile and web) | From the day's or week's session list: selecting a session or a teacher and a date range; a reason; a choice of "cancelled" or "substituted by" (teacher, course); a "notify parents" checkbox; a declaration history. |

---

## 8. Integrations

| Item | Role | Cross-reference |
|---|---|---|
| Massar (file export) | Subject names, coefficients, and periods configured here feed grade files in Massar's template formats; no API exists (H-04 confirmed, `prd/research/04-pedagogy-massar-calendar.md` §2) | `prd/modules/21-massar-regulatory-exports.md`; the `INT-MAS` integration is detailed in `prd/cross-cutting/35-external-integrations.md` |
| Notifications | Timetable publication, variant switch, class change: trigger multi-channel notifications | `prd/modules/17-communication-notifications.md` |
| PDF generation | Timetable exports produced locally, with no external provider | FR-PED-15 |

No other external integration is required by this module; the time-zone reference data (tzdata) is kept up to date on the platform side (correction no. 1).

---

## 9. Module-Specific Non-Functional Requirements

Generic requirements are owned by `prd/cross-cutting/32-non-functional-requirements.md` (domains cited without numbering here, with `NFR-…` numbering specific to that file):

- **Performance**: fluid grid editing with real-time conflict checking; batch PDF generation compatible with printing all levels at the start of the school year; quantified targets from the `NFR-PERF` domain.
- **Availability**: maintenance windows outside start-of-year and exam periods (§10); the timetable editor sees heavy use in August–September (`prd/journeys/00-journey-map.md` §4).
- **Mobile and offline**: viewing the timetable and entering the class log are fault-tolerant with synchronization (§10, `NFR-MOB`, `NFR-OFF` domains).
- **Internationalization**: FR/AR interface and content with RTL, bilingual structure labels and documents (DEC-10, `NFR-I18N` domain).
- **Resilience and volumetry**: three-year sizing (500 schools, 500,000 students, §10) covering multi-section, multi-site schools (`NFR-RES` domains).
- **Traceability and retention**: variant switches, publications, and structure changes logged (RG-38); closed years read-only (RG-32); `NFR-DOC` domain retention periods aligned with DEC-22. Logging: entries logged from MVP; audit-log immutability and export ship at V1 (arbitration recorded in OQ-08 of `prd/modules/10-administration-onboarding-subscription.md`). |

---

## 10. Success Metrics

Indicators proposed by this module (`KPI-…` numbering owned by `prd/cross-cutting/38-kpi-success-metrics.md`):

| Indicative measure | Working target |
|---|---|
| Share of classes with a published timetable on the first day of class | High target at the start of the year (measurement to be set with the DEC-35 pilots) |
| Average structure-instantiation time during onboarding (PC-03) | On the order of one configuration session, with no re-entry |
| Class-log coverage rate (sessions logged / sessions taught) | Tracked weekly by the director |
| Number of blocking conflicts detected in the global check before publication | Downward trend after the first few weeks |
| Timetable and homework views by students and parents | Adoption measured via usage statistics |

---

## 11. Open Questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Baseline update on the time zone | **Escalated — ESC-03** (`prd/cross-cutting/42-review-arbitrations.md`): the PRD retains permanent UTC+0 (FR-PED-16, Decree No. 2.26.530); the update to `PROJECT.md` is grouped under ESC-03. |
| OQ-02 | Version of the annual calendar | **Resolved — ARB-01**: the calendar is MVP (it governs roll call, declared expected sessions FR-PED-20, notifications, and evaluation periods); N+1 cloning (FR-PED-07) joins MVP at wave 2. |
| OQ-03 | Timetable-publication events | Should dedicated events (timetable publication, variant activation) be added to the event catalog in `prd/03-domain-data-model.md` §7, with systematic notification to families, or should only variant switches and significant changes be notified? To be decided in review (notification volume and DEC-36 costs). |
| OQ-04 | Default schedule-grid parameters | Session duration, breaks, span per cycle, default Saturday-morning activation: values to validate with pilot schools (DEC-35) before locking in defaults. |
| OQ-05 | Multi-site timetables and shared rooms | Consolidating timetables at the organization level (G-13) and managing rooms shared across sections or between schools of the same campus: scope and version (V1 or V2+) to decide. |
| OQ-06 | Baseline divergence on the suspension of memoranda 080.21/081.21 | **Escalated — ESC-03**: the research establishes 29/11/2021 (`prd/research/00-baseline-corrections.md` no. 3); the PRD retains this date; the baseline update is grouped under ESC-03. |
| OQ-08 | The `Session` entity and the `SessionNotHeld` event | **Resolved — ARB-04, ARB-05**: introduced by FR-PED-20 and FR-PED-21; to be carried over into `prd/03-domain-data-model.md`'s dictionary and event catalog. |
| OQ-07 | Responsibility for confirming religious holidays | Who updates the "to confirm" dates (preloading and confirmation centralized by ZSchool for all schools, or per-school confirmation) and via which announcement channel (Habous, ministry notice)? To be locked down in review along with the associated notification method. |

---

## 12. Traceability

| Baseline ID | Element | Coverage in this file |
|---|---|---|
| §2.2 | National structure, tracks and options, certifying weightings, homeroom teacher | FR-PED-01, FR-PED-02, FR-PED-03, FR-PED-05, FR-PED-08 |
| §2.3 | Coexistence of several education systems | FR-PED-01, FR-PED-02, FR-PED-03 |
| §2.4 | Calendar, Monday–Saturday week, Ramadan, time zone | FR-PED-11, FR-PED-13, FR-PED-16; OQ-01 |
| §2.5 | Evaluation, semesters/terms, continuous assessment | FR-PED-04, FR-PED-05 |
| §6.7 (RG-24) | Instantiable structure templates | FR-PED-01, FR-PED-02; PC-03 |
| §6.7 (RG-25) | N → N+1 cloning without students | FR-PED-07 (MVP wave 2, ARB-01); INV-42 |
| §6.7 (RG-26) | Coefficient and language per level and track | FR-PED-03, FR-PED-09; INV-41 |
| §6.10 | Module entity schema | §6 (dictionary cross-referenced to `prd/03-domain-data-model.md` §2.3) |
| §7.3 (G-13) | Academics and timetables | FR-PED-06, FR-PED-11 to FR-PED-18; G-13 |
| §7.2 | Rollover and class assignment | FR-PED-07 (cross-reference `prd/modules/11-admissions-enrollment-reenrollment.md`); PC-02 |
| RG-11 | Logged class change | FR-PED-10 (entry point; rule: FR-INS-22), FR-PED-19; INV-07 |
| RG-18 / RG-19 | Affiliations and access revocation | FR-PED-08; INV-16 |
| RG-22 | School's authorized cycles | FR-PED-01, FR-PED-02 |
| RG-32 | A closed year is read-only | FR-PED-07, FR-PED-19 |
| RG-38 | Logging | FR-PED-12, FR-PED-13, FR-PED-16, FR-PED-19 |
| RG-39 | Teacher least privilege | FR-PED-08, FR-PED-14, FR-PED-17; INV-34 |
| G-12 | Configurable evaluation, periods, coefficients | FR-PED-03, FR-PED-04, FR-PED-05 |
| G-29 | Program, section, teaching language | FR-PED-01, FR-PED-03 |
| C-01 | National nomenclature rather than French | FR-PED-01, FR-PED-02 |
| H-02 | Certifying-exam weightings | FR-PED-05 |
| H-04 | Massar with no API, file channel | FR-PED-03; §8 (cross-reference `prd/modules/21-massar-regulatory-exports.md`) |
| G-11 | Moroccan calendar, movable holidays, time zone | FR-PED-16 |
| DEC-10 | FR/AR bilingualism, bilingual documents | FR-PED-15; §7 (screens) |
| DEC-12 / DEC-36 | Notification channels | FR-PED-13, FR-PED-14; OQ-03 |
| DEC-15 | MVP/V1/V2 scope | "Version" column of every requirement |
| DEC-18 | Data attached to the enrollment | FR-PED-10, FR-PED-19 |
| DEC-29 | Generic level model (excluding higher education) | FR-PED-01, FR-PED-02 |
| DEC-35 | Pilot schools (including one on terms) | FR-PED-04; OQ-04; aligned with OQ-04 in `prd/modules/14-assessments-grades-report-cards.md` |
| §12 | Scope by version | "Version" column; FR-PED-18 (automatic generation, V2+); OQ-02 |
| §10 | Non-functional requirements | FR-PED-14, FR-PED-15, FR-PED-17; §9 |
| Corrections no. 1, 3, 17 | Permanent UTC+0 time zone; 29/11/2021 suspension; 2026-2027 calendar | FR-PED-05, FR-PED-11, FR-PED-13, FR-PED-16; OQ-01, OQ-06; `prd/research/00-baseline-corrections.md` |
| `prd/research/04-pedagogy-massar-calendar.md` §1–§3 | Weightings, Massar, detailed calendar | FR-PED-05, FR-PED-16; §5, §8 |
| INV-07, INV-34, INV-41, INV-42 | Invariants owned by `prd/03-domain-data-model.md` | FR-PED-03, FR-PED-07, FR-PED-08, FR-PED-10 |
| BES-DIR-05, BES-ENS-04, BES-ELE-02, BES-ELE-04 | Persona needs (`prd/02-actors-personas.md`) | FR-PED-07, FR-PED-17, FR-PED-14, FR-PED-11 |
| PC-02, PC-03, PC-05, PC-06, PC-11 | Journeys (`prd/journeys/00-journey-map.md`) | §3 |
| Evaluation rules owned by `prd/modules/14-assessments-grades-report-cards.md` | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-PED-05 (boundary: configuration, storage, and versioning here; default values and application owned by FR-EVA-07, FR-EVA-08, FR-EVA-09) |
| ARB-01 (cloning at MVP wave 2, MVP calendar) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-PED-07; OQ-02 |
| ARB-04 (declared sessions) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-PED-20; ECR-PED-11; §6 (`Session`) |
| ARB-05 (session not held, substitution) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-PED-21; ECR-PED-12; §6 (`SessionNotHeld`) |
| ARB-23e (scheduled affiliation closure) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-PED-08 |
| ARB-24b (per-class and per-level capacity) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-PED-02, FR-PED-10 |
| ARB-17d (rank after a class change) | Arbitration of the 09/09/2026 review (`prd/cross-cutting/42-review-arbitrations.md`) | FR-PED-10 |
