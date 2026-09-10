> **Document Control**
>
> | Property       | Value                                                                                                                                                                                                                              |
> | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-03                                                                                                                                                                                                                     |
> | Revision       | 1.0                                                                                                                                                                                                                                |
> | Effective Date | 2026-09-09                                                                                                                                                                                                                         |
> | Status         | Draft                                                                                                                                                                                                                              |
> | Author         | ZSchool Product                                                                                                                                                                                                                    |
> | Classification | Functional Specification                                                                                                                                                                                                           |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/12-academic-structure-timetables.md` (v0.3), old `FR-PED-01..21` -> `BEH-ZS-051..071`, old `ECR-PED-01..12` -> `SCR-ZS-031..042`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Academic Structure and Timetables (PED)

## 1. Objective and scope

**Objective.** Give the school full configuration of its academic organization — sections, cycles, levels, tracks, classes, groups, subjects, evaluation periods, grading scales, rooms, calendar — then build, check, and publish timetables, so that every other module (attendance, assessments, finance, communication) relies on a single, consistent reference. The structure is the "context" in the identity → relationship → context → data chain of the domain model (`spec/domain-model.md` §1): with no structure instantiated, no academic data can be attached to an enrollment ([ADR-ZS-029](../decisions/029-academic-data-always-tied-to-enrollment.md)).

**Scope included:**

| Function                                                                                                                                 | Version                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Instantiating structure templates: Moroccan national (default, MVP), French curriculum, and international (V1)                           | MVP / V1                                                                                              |
| Section → Cycle → Level → Track/Option → Class → Groups tree                                                                             | MVP                                                                                                   |
| Subjects with a coefficient and teaching language per level and track (INV-ZS-078), mandatory/optional                                   | MVP                                                                                                   |
| Evaluation periods (semesters or terms) and sub-periods                                                                                  | MVP                                                                                                   |
| Grading scales and computation rules (configuration; applying them to grades: `spec/behaviors/05-assessments-grades-report-cards.md`)    | MVP                                                                                                   |
| Rooms and resources per site                                                                                                             | V1                                                                                                    |
| Cloning the structure from year N to N+1 without students (INV-ZS-077)                                                                   | MVP (wave 2 — year-end close, RDM-ZS-003, [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)) |
| Declared expected sessions per class and day, with no timetable ([ADR-ZS-045](../decisions/045-attendance-session-without-timetable.md)) | MVP                                                                                                   |
| A session not held, teacher absence, substitution ([ADR-ZS-046](../decisions/046-uncovered-session-and-substitution.md))                 | MVP                                                                                                   |
| Assigning teachers to courses (`TeacherAssignment`) and homeroom teacher                                                                 | MVP                                                                                                   |
| Courses (subject × class/group) and mid-year class changes (INV-ZS-061)                                                                  | MVP                                                                                                   |
| Timetable: weekly grid, assisted manual entry, conflict detection                                                                        | V1                                                                                                    |
| Timetable variants (normal, reduced-hours Ramadan, exams)                                                                                | V1                                                                                                    |
| Publishing timetables to profiles; PDF export                                                                                            | V1                                                                                                    |
| Annual calendar (start of school, holidays, fixed and religious dates "to confirm," permanent UTC+0 time zone)                           | MVP (see OQ-ZS-062)                                                                                   |
| Class log and homework                                                                                                                   | V1                                                                                                    |
| Automatic timetable generation under constraints                                                                                         | V2+                                                                                                   |

**Out of scope (cross-references):**

| Function                                                                                                                           | Owner                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Recording grades, averages, class councils, report cards (applying grading scales)                                                 | `spec/behaviors/05-assessments-grades-report-cards.md`        |
| Roll call, attendance, tardiness, discipline (consuming the calendar, declared sessions, and, at V1, the timetable)                | `spec/behaviors/04-attendance-student-life-discipline.md`     |
| Enrollment, re-enrollment, student rollover, initial class assignment, and the mid-year class-change rule (BEH-ZS-042, sole owner) | `spec/behaviors/02-admissions-enrollment-reenrollment.md`     |
| Tenant creation, setup wizard, Excel import of initial data                                                                        | `spec/behaviors/01-administration-onboarding-subscription.md` |
| Massar exports (the PED module supplies subjects, coefficients, periods)                                                           | `spec/behaviors/12-massar-regulatory-exports.md`              |
| Notifications (channels, routing, costs) triggered by publication                                                                  | `spec/behaviors/08-communication-notifications.md`            |
| Tracking the 8-hour quota for outside-the-public-sector teachers and AREF authorizations                                           | `spec/behaviors/10-teacher-career-network.md`                 |
| Light e-learning (pushed online resources and homework)                                                                            | V2+                                                           |

## 2. Users and use cases

Personas and detailed needs are in `spec/urs.md` (`URS-ZS-…` identifiers); fine-grained permissions are in `spec/cross-cutting/01-permissions.md` (least privilege, INV-ZS-091).

| Role                                | Main use cases                                                                                                                                                                                                   | Needs cited                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Director (director, group director) | Instantiates and adapts the structure, defines periods and grading scales, assigns teachers, appoints homeroom teachers, builds and publishes timetables, manages the calendar and its variants, clones year N+1 | URS-ZS-005                              |
| Front office                        | Looks up the structure at the front desk (a student's class, homeroom teacher), enters class changes, prints timetables                                                                                          | —                                       |
| Head supervisor                     | Reviews class timetables to organize roll call and supervision, follows the class log                                                                                                                            | URS-ZS-018, URS-ZS-024                  |
| Teacher                             | Views their own timetable, keeps the class log and posts homework, reviews their course assignments                                                                                                              | URS-ZS-029                              |
| Parent / guardian                   | Views their children's timetable (variants included) and homework                                                                                                                                                | URS-ZS-052, URS-ZS-054 (via the portal) |
| Student                             | Views their timetable for the day and the week, including the Ramadan variant, and the next day's homework                                                                                                       | URS-ZS-052, URS-ZS-054                  |

Cross-cutting use cases: the instantiated structure serves as the context for enrollment (level, track, class — INV-ZS-061), roll call per course (INV-ZS-091), assessments (periods, coefficients), and Massar exports (subject names).

## 3. Key user journeys

Reference map: `spec/journeys/00-journey-map.md` (built in Phase 3). This chapter adds no journey and duplicates none.

| Journey                                              | Role of the PED module                                                                                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| JMP-ZS-003 — Onboarding a school                     | Instantiating the national structure template, school year, periods, grading scales; rooms and classes ahead of imports                                                              |
| JMP-ZS-002 — Bulk re-enrollment and N → N+1 rollover | Cloning the N+1 structure without students (INV-ZS-077) before class assignment, done by the INS module                                                                              |
| JMP-ZS-005 — Morning roll call                       | At MVP, declared expected sessions (BEH-ZS-070) and the calendar determine the courses and class days called by VSC; at V1, the published timetable automatically feeds the sessions |
| JMP-ZS-006 — Grades, class council, report cards     | Evaluation periods, coefficients, and grading scales configured here, applied by EVA                                                                                                 |
| JMP-ZS-011 — Communication                           | Timetable publications and variant switches trigger notifications via COM                                                                                                            |

## 4. Functional behaviors

| ID         | Title                                                                             | Priority | Version    |
| ---------- | --------------------------------------------------------------------------------- | -------- | ---------- |
| BEH-ZS-051 | Instantiate a section from a provided structure template                          | Must     | MVP / V1   |
| BEH-ZS-052 | Manage the Section → Cycle → Level → Track → Class → Groups tree                  | Must     | MVP        |
| BEH-ZS-053 | Define coefficient and teaching language per level and track                      | Must     | MVP        |
| BEH-ZS-054 | Define evaluation periods and sub-periods                                         | Must     | MVP        |
| BEH-ZS-055 | Configure grading scales and computation rules                                    | Must     | MVP / V2+  |
| BEH-ZS-056 | Manage rooms and resources                                                        | Must     | V1         |
| BEH-ZS-057 | Clone the structure from year N to N+1 without students                           | Must     | MVP wave 2 |
| BEH-ZS-058 | Assign teachers to courses and appoint the homeroom teacher                       | Must     | MVP        |
| BEH-ZS-059 | Build courses (subject × class/group)                                             | Must     | MVP        |
| BEH-ZS-060 | Record a mid-year class change                                                    | Must     | MVP        |
| BEH-ZS-061 | Build the timetable: weekly grid and assisted manual entry                        | Must     | V1         |
| BEH-ZS-062 | Detect teacher, room, and class conflicts                                         | Must     | V1         |
| BEH-ZS-063 | Manage timetable variants (normal, reduced-hours Ramadan, exams)                  | Must     | V1         |
| BEH-ZS-064 | Publish timetables to profiles                                                    | Must     | V1         |
| BEH-ZS-065 | Export timetables as PDF                                                          | Should   | V1         |
| BEH-ZS-066 | Maintain the annual calendar (start of school, holidays, breaks, UTC+0 time zone) | Must     | MVP        |
| BEH-ZS-067 | Keep the class log and post homework                                              | Should   | V1         |
| BEH-ZS-068 | Automatically generate timetables under constraints                               | Could    | V2+        |
| BEH-ZS-069 | Ensure the structure stays consistent with enrollments                            | Must     | MVP        |
| BEH-ZS-070 | Declare expected sessions per class and day with no timetable                     | Must     | MVP        |
| BEH-ZS-071 | Declare a session not held, a teacher absence, or a substitution                  | Must     | MVP        |

### BEH-ZS-051: Instantiate a section from a provided structure template

> **Invariant:** [INV-ZS-076](../invariants.md#inv-zs-076), [INV-ZS-078](../invariants.md#inv-zs-078)
> **See:** [ADR-ZS-010](../decisions/010-higher-education-out-of-scope.md)
> **Priority:** Must
> **Version:** MVP (national template); V1 (French curriculum, international)
> **Acceptance:** `@REQ-ZS-053` (`features/ped/fr-ped-01-instantiate-national-template.feature`)

```
REQUIREMENT: The system MUST let a school create a section (education system) by
             choosing a template ZSchool provides: Moroccan national (default),
             French curriculum, or international (INV-ZS-076). The wizard MUST
             instantiate the chosen template's cycles, levels, and nomenclature
             (national: preschool, primary 1AP-6AP, middle school 1AC-3AC, upper
             secondary common core-2nd Bac), the program's usual subjects with
             their default ministry coefficients (editable), the template's
             evaluation periods (semesters for the national system, terms for the
             French curriculum), and grading out of 20.
```

The school then freely adapts the instantiation (additions, removals, renaming) without ever breaking existing links. The French-curriculum and international templates are activatable at V1; letter grades and GPA scales for international sections remain out of scope until V2+.

### BEH-ZS-052: Manage the Section → Cycle → Level → Track → Class → Groups tree

> **Invariant:** [INV-ZS-001](../invariants.md#inv-zs-001), [INV-ZS-074](../invariants.md#inv-zs-074), [INV-ZS-076](../invariants.md#inv-zs-076)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** `@REQ-ZS-054` (`features/ped/fr-ped-02-academic-tree.feature`)

```
REQUIREMENT: The school MUST be able to manage its academic tree within the
             limits of its instantiated templates: creating, editing, renaming,
             and deactivating each link. An element attached to active
             enrollments MUST NOT be deletable (BEH-ZS-069).
```

A section (education system) groups cycles, themselves constrained to the school's authorized cycles (INV-ZS-074); a cycle groups levels (1AP…2nd Bac); a level groups tracks or options (upper secondary: Mathematical Sciences A/B, Physical Sciences, Life and Earth Sciences, Humanities, Social Sciences, Economics, Accounting Management Sciences, Science and Technology; International Option of the Baccalaureate in French/English/Spanish); a level or track groups classes (label, capacity — checked at assignment: exceeding it is possible only with the director's documented approval, [ADR-ZS-065](../decisions/065-reporting-and-capacity-definitions.md); a level's capacity, used by the waitlist BEH-ZS-004, is the sum of its classes' capacities); a class groups groups (languages, options, lab work). Several sections coexist within the same school (national and international) and several campuses may host classes (`Campus`).

### BEH-ZS-053: Define coefficient and teaching language per level and track

> **Invariant:** [INV-ZS-078](../invariants.md#inv-zs-078)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** `@REQ-ZS-055` (`features/ped/fr-ped-03-subject-level-config.feature`)

```
REQUIREMENT: Each school subject MUST be configured per (level, track) pair via
             `SubjectLevelConfig`: coefficient, teaching language, mandatory or
             optional status. No coefficient or language MUST ever be defined
             globally on the subject (INV-ZS-078, INV-ZS-014).
```

Example: math carries the coefficient specific to the level and may be taught in Arabic in the national section and in French in a bilingual section of the same school. Available teaching languages cover at least Arabic, French, English, and Spanish. This configuration feeds average calculations (`spec/behaviors/05-assessments-grades-report-cards.md`) and Massar exports (`spec/behaviors/12-massar-regulatory-exports.md`).

### BEH-ZS-054: Define evaluation periods and sub-periods

> **Invariant:** —
> **See:** [ADR-ZS-035](../decisions/035-pilot-school-profiles.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** `@REQ-ZS-056` (`features/ped/fr-ped-04-evaluation-periods.feature`)

```
REQUIREMENT: For each school year, the school MUST define its evaluation
             periods (`EvaluationPeriod`): semesters (national system default)
             or terms (French curriculum, the bilingual pilot school under
             ADR-ZS-035), with start and end dates aligned with the annual
             calendar (BEH-ZS-066) and statuses (upcoming, in progress, closed).
```

It defines dated sub-periods for intermediate milestones (exams, mock exams, standardized tests). Closing a period and locking entries are owned by the EVA module (`spec/behaviors/05-assessments-grades-report-cards.md`); this chapter supplies the periods and their dates.

### BEH-ZS-055: Configure grading scales and computation rules

> **Invariant:** —
> **Priority:** Must
> **Version:** MVP (base configuration); V2+ (letters, GPA)
> **Acceptance:** `@REQ-ZS-057` (`features/ped/fr-ped-05-grading-scales.feature`)

```
REQUIREMENT: The school MUST be able to configure its grading scales
             (`GradingScale`) and computation rules (`ComputationRule`): default
             grading out of 20 with decimals, rounding, coefficient-weighted
             average calculation, rank. Weightings for certifying exams MUST be
             configurable per level and versioned per school year.
```

Default ministry values are kept here (6AP 50/25/25; 3AC 30/30/40; Baccalaureate 25/25/50) with tracked textual references. Boundary: this chapter owns configuring, storing, and versioning grading scales and computation rules; the evaluation rules themselves are owned by `spec/behaviors/05-assessments-grades-report-cards.md` and are not duplicated here — honors-rating thresholds (BEH-ZS-119), possible exclusion of the lowest grade beyond a given count of grades (BEH-ZS-117), default national weightings versioned and tracked on the report card (BEH-ZS-118) — and applying them to grades, averages, and report cards is owned by EVA. Configuration of the "at least two tests and one standardized test per subject and per semester" compliance check is proposed here with default values. Letter grades and GPA scales for international sections are out of scope until V2+. A baseline/research divergence is recorded in OQ-ZS-066.

### BEH-ZS-056: Manage rooms and resources

> **Priority:** Must
> **Version:** V1
> **Acceptance:** none yet (V1 scope; no MVP acceptance criterion in the source)

```
REQUIREMENT: The school MUST be able to keep a catalog of rooms and resources
             (`Room`) per site (`Campus`): label, capacity, type (classroom,
             laboratory, computer lab, gym, library, workshop), features and
             equipment.
```

Rooms can be assigned to timetable slots (BEH-ZS-061) and are used for conflict detection (BEH-ZS-062). The catalog is tied to the tenant (INV-ZS-001) and usable by the organization's consolidated views without merging data (INV-ZS-073).

### BEH-ZS-057: Clone the structure from year N to N+1 without students

> **Invariant:** [INV-ZS-077](../invariants.md#inv-zs-077)
> **See:** [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)
> **Priority:** Must
> **Version:** MVP (wave 2 — year-end close, RDM-ZS-003; [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md))
> **Acceptance:** `@REQ-ZS-058` (`features/ped/fr-ped-07-clone-structure-n-plus-1.feature`)

```
REQUIREMENT: From an existing school year, the director MUST be able to launch
             cloning to year N+1 (INV-ZS-077): sections, cycles, levels, tracks,
             classes, groups, subjects, per-level/track configurations
             (coefficients, languages), template periods, grading scales, and
             computation rules MUST be copied. Enrollments and students, teacher
             course assignments, and year N's timetables MUST NEVER be copied.
```

Year N+1 is created in "preparation" status; a cloning report lists the elements copied and gaps to fill in (target headcounts, homeroom teachers to reappoint). The closed year N remains viewable read-only (INV-ZS-084). Cloning prepares the student rollover carried out by INS (`spec/behaviors/02-admissions-enrollment-reenrollment.md`, JMP-ZS-002).

### BEH-ZS-058: Assign teachers to courses and appoint the homeroom teacher

> **Invariant:** [INV-ZS-010](../invariants.md#inv-zs-010), [INV-ZS-011](../invariants.md#inv-zs-011)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** `@REQ-ZS-059` (`features/ped/fr-ped-08-teacher-assignment.feature`)

```
REQUIREMENT: For each course, the director MUST be able to assign a teacher
             (`TeacherAssignment`) from among the school's active affiliations
             (an active `SchoolMembership`, INV-ZS-070). Deactivating an
             affiliation MUST remove the corresponding assignments and alert the
             director about orphaned courses (INV-ZS-071, INV-ZS-010).
```

A course (subject × class or group) may receive a lead teacher and, where applicable, co-teachers. Each assignment carries a weekly teaching-hour load, which feeds per-teacher totals (tracking the 8-hour quota for outside-the-public-sector teachers is owned by the CAR module, `spec/behaviors/10-teacher-career-network.md`). A scheduled affiliation closure (future end date, BEH-ZS-224, [ADR-ZS-064](../decisions/064-teacher-career-rules.md)) surfaces courses to be reassigned before the date, with a suggested replacement from among active affiliations. The director appoints, per class, a homeroom teacher from among the assigned teachers: only one active appointment at a time, logged, visible to parents and students. Assignments underpin the teacher's permissions (least privilege INV-ZS-091, INV-ZS-011).

### BEH-ZS-059: Build courses (subject × class/group)

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** `@REQ-ZS-060` (`features/ped/fr-ped-09-build-courses.feature`)

```
REQUIREMENT: The system MUST generate the list of courses (`Course`) for a
             class from the subjects configured for its level and track
             (BEH-ZS-053): one course per mandatory subject, one course per
             chosen optional subject, and per-group courses for languages,
             options, and lab work (`Group`).
```

A course can be deactivated (for example a subject not taught in a given class) with a reason. Courses carry the target weekly hour load and form the basis for assignments (BEH-ZS-058) and timetable slots (BEH-ZS-061).

### BEH-ZS-060: Record a mid-year class change

> **Invariant:** [INV-ZS-025](../invariants.md#inv-zs-025), [INV-ZS-061](../invariants.md#inv-zs-061)
> **See:** [ADR-ZS-029](../decisions/029-academic-data-always-tied-to-enrollment.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** `@REQ-ZS-061` (`features/ped/fr-ped-10-class-change.feature`)

```
REQUIREMENT: The mid-year class-change rule is owned by BEH-ZS-042 in
             `spec/behaviors/02-admissions-enrollment-reenrollment.md` (sole
             owner: an append-only entry in `StudentClassHistory`, the
             enrollment unchanged, notifying parents, the homeroom teacher, and
             the old and new teachers, with the rank computed in the current
             class at closing — INV-ZS-061, INV-ZS-025). This module MUST
             provide the entry point from the structure browser (SCR-ZS-031) and
             a class's list.
```

The director, academic leadership, or the front office selects the student, the target class (same level or a different one after a decision), the effective date, and the reason, and triggers BEH-ZS-042's operation; the headcounts and capacities of both classes are updated ([ADR-ZS-065](../decisions/065-reporting-and-capacity-definitions.md)) and teacher assignments remain unchanged.

### BEH-ZS-061: Build the timetable: weekly grid and assisted manual entry

> **Priority:** Must
> **Version:** V1
> **Acceptance:** none yet (V1 scope; no MVP acceptance criterion in the source)

```
REQUIREMENT: The timetable editor (`Timetable`, `TimetableSlot`) MUST work on a
             weekly grid from Monday to Saturday; Saturday MUST hold classes
             only in the morning when the school's configuration provides for
             it.
```

Session duration, breaks, and daily span per cycle are configurable (default values to confirm with the pilots, OQ-ZS-064). Entry is manual and assisted: placing a course by drag-and-drop or slot selection, conflict-free slot suggestions for a given course, duplicating a grid across parallel classes, automatic locking of the calendar's holidays and breaks (BEH-ZS-066). Slots carry the course, the assigned teacher, the room, and the variant they belong to. A timetable exists as a draft until it is published (BEH-ZS-064). Once published, it automatically feeds roll call's expected sessions (BEH-ZS-070), which remain editable day-to-day by student life (BEH-ZS-071). Automatic generation is handled in BEH-ZS-068.

### BEH-ZS-062: Detect teacher, room, and class conflicts

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** `@REQ-ZS-062` (`features/ped/fr-ped-12-conflict-detection.feature`)

```
REQUIREMENT: At each placement, the editor MUST check conflicts in real time
             and show the result next to the grid; a global check MUST re-run
             before any publication: the same teacher on two courses in the
             same slot, the same class (or group) booked twice, the same room
             assigned twice, a teacher with no active affiliation. Blocking
             conflicts MUST prevent publication; warnings require a logged,
             documented confirmation (INV-ZS-090).
```

Warnings (non-blocking): a room whose capacity is below the class's headcount, a room type incompatible with the subject (for example a lab required for practical work). The check runs against the active variant and applies to each variant (BEH-ZS-063).

### BEH-ZS-063: Manage timetable variants (normal, reduced-hours Ramadan, exams)

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** `@REQ-ZS-063` (`features/ped/fr-ped-13-timetable-variants.feature`)

```
REQUIREMENT: For each school year, the school MUST be able to define timetable
             variants (`ScheduleVariant`): normal (default), reduced-hours
             Ramadan (shortened sessions and a continuous schedule), and exam
             period. Only one variant MUST be active at a time per section (or
             per school when all sections share the same calendar). Every
             switch MUST be logged (INV-ZS-090).
```

A variant has a dated validity window, built by duplicating the normal variant then adjusting it, or entered directly. The switch can be scheduled in advance (start of Ramadan) or triggered manually, and immediately notifies all profiles concerned (students, parents, teachers, student life) via `spec/behaviors/08-communication-notifications.md`. Religious dates are "to confirm" until the official announcement (BEH-ZS-066); a scheduled switch remains editable until it executes. The reduced-hours variant is a scheduling need for teaching purposes, distinct from the time zone: permanent UTC+0 (OQ-ZS-061).

### BEH-ZS-064: Publish timetables to profiles

> **Invariant:** [INV-ZS-043](../invariants.md#inv-zs-043)
> **See:** [ADR-ZS-023](../decisions/023-notification-channel-priority.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none yet (V1 scope; no MVP acceptance criterion in the source)

```
REQUIREMENT: The director MUST be able to publish a draft timetable to its
             target: class, level, cycle, or school. Publication MUST make the
             grid visible to students with personal access (INV-ZS-043), to
             parents, to teachers, to the head supervisor, and to the director.
```

A teacher publishes their own personal grid for reference with no effect on the official grid (a personal grid built from their active assignments). Viewing is mobile-first, in day and week views, showing the teacher's name and the room, and remains viewable offline (`NFR-OFF` domain, `spec/cross-cutting/03-non-functional-requirements.md`). Any publication or significant change after publication notifies the profiles concerned of the changes (cross-reference `spec/behaviors/08-communication-notifications.md`); prior versions remain viewable (history).

### BEH-ZS-065: Export timetables as PDF

> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none yet (V1 scope; no MVP acceptance criterion in the source)

```
REQUIREMENT: The school MUST be able to export timetables as bilingual
             French-Arabic PDFs ([ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)):
             by class, by teacher, by room, by level, and a school-wide summary
             view.
```

Each document carries the school year, the active variant and its validity window, and the generation date; the school's documents carry its configured visual identity (logo). PDFs follow A4 and A5 formats with correct Arabic fonts, and bulk printing is possible (all classes of a level).

### BEH-ZS-066: Maintain the annual calendar (start of school, holidays, breaks, UTC+0 time zone)

> **Priority:** Must
> **Version:** MVP (the calendar governs roll call, notifications, and the MVP's periods; see OQ-ZS-062)
> **Acceptance:** `@REQ-ZS-064` (`features/ped/fr-ped-16-annual-calendar.feature`)

```
REQUIREMENT: Each school year MUST have a calendar (`Calendar`, `Holiday`)
             preloaded by ZSchool with published ministry dates. The time zone
             MUST be permanent UTC+0 since 20/09/2026 (Decree No. 2.26.530,
             Official Gazette No. 7521 of 29/06/2026): no seasonal alternation
             or Ramadan exception; timestamps MUST be stored in UTC and
             displayed in Morocco time.
```

Preloaded content: students' start of school and the start of mandatory classes (Monday 07/09/2026), four one-week breaks (18–25/10/2026, 06–13/12/2026, 21–28/03/2027, 09–16/05/2027), a mid-year break (24–31/01/2027), fixed-date national holidays, and national exams (Baccalaureate regular session 06/01–06/03/2027). Movable religious holidays (Ramadan, Eid al-Fitr, Eid al-Adha, 1st of Muharram, Mawlid) are preloaded with a "to confirm" status and updated during the year once confirmed by lunar sighting; the update notifies the school. The school may adjust its calendar within the allowed margin; a French-curriculum section (V1) carries its own calendar (AEFE network holidays). The calendar distinguishes business days from class days (no roll call on public holidays, consumed by VSC: `spec/behaviors/04-attendance-student-life-discipline.md`), aligns evaluation periods (BEH-ZS-054), and bounds variant windows (BEH-ZS-063). The week runs Monday–Saturday, with Saturday mornings configurable (BEH-ZS-061). A divergence from the historical baseline is recorded in OQ-ZS-061.

### BEH-ZS-067: Keep the class log and post homework

> **Priority:** Should
> **Version:** V1
> **Acceptance:** none yet (V1 scope; no MVP acceptance criterion in the source)

```
REQUIREMENT: For each course and each session (tied to a timetable slot), the
             teacher MUST be able to keep the class log: content covered,
             assigned work with a due date, lightweight attached resources
             (files and links; full e-learning stays V2+).
```

Entry works on the web and on mobile, fault-tolerant with synchronization; entry after the fact is allowed with no real-time requirement. Visible to: the director, the head supervisor, the class's homeroom teacher, students with access, and their parents. Each student has a consolidated "today's and upcoming homework" view across all their subjects. Graded homework remains owned by EVA (`spec/behaviors/05-assessments-grades-report-cards.md`); a session declared not held or substituted (BEH-ZS-071) is marked as such in the class log, with no expected content from the absent teacher.

### BEH-ZS-068: Automatically generate timetables under constraints

> **Priority:** Could
> **Version:** V2+
> **Acceptance:** none (V2+, directional)

```
REQUIREMENT: At V2+, the system SHOULD offer automatic timetable generation
             under constraints: course hour loads, teacher availability and
             quotas, room capacities and types, daily session limits, breaks.
```

The generated proposal remains a draft validated by the director, editable in the manual editor (BEH-ZS-061), and subject to the same conflict checks (BEH-ZS-062) before publication.

### BEH-ZS-069: Ensure the structure stays consistent with enrollments

> **Invariant:** [INV-ZS-061](../invariants.md#inv-zs-061), [INV-ZS-084](../invariants.md#inv-zs-084), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-029](../decisions/029-academic-data-always-tied-to-enrollment.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** `@REQ-ZS-065` (`features/ped/fr-ped-19-structure-enrollment-consistency.feature`)

```
REQUIREMENT: An element (class, level, track, subject) attached to active
             enrollments MUST NOT be deletable; the system MUST offer either to
             move students out first (a logged class change, BEH-ZS-060), or to
             deactivate the element (no longer selectable, data retained).
             Renaming MUST be allowed and logged (INV-ZS-090). A closed school
             year MUST move to read-only (INV-ZS-084).
```

Its structures remain viewable for archiving and certificates. Class labels are unique per level and per year.

### BEH-ZS-070: Declare expected sessions per class and day with no timetable

> **See:** [ADR-ZS-045](../decisions/045-attendance-session-without-timetable.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** `@REQ-ZS-066` (`features/ped/fr-ped-20-expected-sessions.feature`)

```
REQUIREMENT: At MVP, roll call per course (BEH-ZS-081 in
             `spec/behaviors/04-attendance-student-life-discipline.md`) MUST
             rely on declared sessions ([ADR-ZS-045](../decisions/045-attendance-session-without-timetable.md)),
             with no timetable: a session is the triplet (course, date, slot),
             unique per triplet.
```

Two sources: (a) student life or the director declares a **simple weekly grid** of expected sessions per class (day, labeled slot — for example "8am–9am" —, course), with no rooms or conflict detection, valid over a date range and repeated for every class day in the calendar (BEH-ZS-066), with separate grids per variant (normal, reduced-hours Ramadan); (b) the teacher creates a session on the fly, at roll-call time, for their course on a free slot of the day when no expected session is declared. Sessions carry a status: expected, held (roll call confirmed), not held (BEH-ZS-071). At V1, the published timetable (BEH-ZS-061, BEH-ZS-064) generates expected sessions and replaces the simple grid, with no break in roll-call data. Domain entity: `Session`, added to `spec/domain-model.md`'s dictionary, tied to `Course`, the date, and the slot, with a tenant key (INV-ZS-001).

### BEH-ZS-071: Declare a session not held, a teacher absence, or a substitution

> **See:** [ADR-ZS-046](../decisions/046-uncovered-session-and-substitution.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** `@REQ-ZS-067` (`features/ped/fr-ped-21-session-not-held.feature`)

```
REQUIREMENT: Student life or academic leadership MUST be able to declare that
             an expected session is not taking place ([ADR-ZS-046](../decisions/046-uncovered-session-and-substitution.md)):
             a teacher absence (with a date range, optional reason, which marks
             all their sessions in the range as not held), a one-off cancelled
             session, or a substituted session (a different teacher, a
             different course, same slot). Every declaration MUST be logged
             (author, date, reason) and MUST be reversible as long as the
             session has no confirmed roll call.
```

Effects: the session not held drops out of expected roll calls and roll-call rates (BEH-ZS-244, BEH-ZS-246, attendance-rate definition [ADR-ZS-065](../decisions/065-reporting-and-capacity-definitions.md)); the class log (BEH-ZS-067, V1) carries the note; an optional notification to the class's parents is offered (channels from `spec/behaviors/08-communication-notifications.md`); the substitute teacher's actual hours are counted toward their total (BEH-ZS-232 in `spec/behaviors/10-teacher-career-network.md`).

## 5. Morocco-specific considerations

1. **Default national template**: 1AP…2nd Bac nomenclature, upper-secondary tracks and options (including the International Option of the Baccalaureate in French), ministry coefficients and preloaded semesters. The French-curriculum (PS…Terminale, terms) and international templates round out the offering at V1; letter grades and GPA scales wait for V2+.
2. **Certifying-exam weightings**: 6AP 50/25/25, 3AC 30/30/40, Baccalaureate 25/25/50; configurable default values, versioned per year, with references tracked on report cards.
3. **Preloaded national calendar**: 2026-2027 ministry dates (start of school, breaks, national holidays, exams); movable religious holidays with "to confirm" status, confirmed a few days ahead by lunar sighting (Habous, the Ministry of Islamic Affairs) and updated during the year.
4. **School time**: Monday–Saturday week, Saturday mornings configurable; span and breaks per cycle; a reduced-hours continuous schedule during Ramadan, as a teaching-schedule variant.
5. **Time zone**: permanent UTC+0 since 20/09/2026 (Decree No. 2.26.530, Official Gazette No. 7521 of 29/06/2026) — the historical baseline's Ramadan exception is obsolete (OQ-ZS-061). Ramadan schedule variants remain a teaching-schedule accommodation, not a time-zone issue.
6. **Bilingualism**: structure labels, timetables, and the class log in French and Arabic; bilingual PDF exports with correct Arabic fonts, A4/A5 ([ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)).

## 6. Data and events

Entities from `spec/domain-model.md` used by this module:

| Entity                                                | Role in the module                                                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Section`                                             | Education system instantiated from a template (INV-ZS-076)                                                                                                          |
| `Cycle`, `Level`, `Track`, `Class`, `Group`           | Academic tree; `Class` carries the homeroom teacher and enrollment membership                                                                                       |
| `AcademicYear`                                        | School year (preparation, in progress, closed); supports N+1 cloning (INV-ZS-077)                                                                                   |
| `Calendar`, `Holiday`, `ScheduleVariant`              | Annual calendar, holidays (Gregorian and Hijri), schedule variants                                                                                                  |
| `Subject`, `SubjectLevelConfig`                       | Subjects and per-level/track configuration: coefficient, language, mandatory/optional (INV-ZS-078)                                                                  |
| `Course`                                              | Course: subject × class or group; the basis for assignments and slots                                                                                               |
| `TeacherAssignment`                                   | Teacher × course assignment; homeroom teacher; underpins permissions (INV-ZS-011)                                                                                   |
| `Room`                                                | Rooms and resources per site                                                                                                                                        |
| `Timetable`, `TimetableSlot`                          | Timetables, slots, variants; conflict detection (V1); generate expected sessions                                                                                    |
| `Session`                                             | A declared session: course × date × slot, status (expected, held, not held, substituted), the actual teacher; underpins roll call from MVP (BEH-ZS-070, BEH-ZS-071) |
| `GradingScale`, `EvaluationPeriod`, `ComputationRule` | Grading scales, evaluation periods and sub-periods, computation rules                                                                                               |
| Related entities                                      | `Campus` (sites), `Enrollment` (current class), `StudentClassHistory` (INV-ZS-061), `SchoolMembership` (active affiliations)                                        |

Domain events:

| Event                                 | Trigger                                                                                      | Consumers                                                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `ClassChanged`                        | A class change recorded (BEH-ZS-042, triggered from BEH-ZS-060)                              | Parents, homeroom teacher, teachers involved; logging                                                                      |
| `SessionNotHeld`                      | A teacher-absence, cancellation, or substitution declaration (BEH-ZS-071)                    | Student life (expected roll calls), the substitute teacher, the class's parents (optional)                                 |
| Publication and variant notifications | Timetable publication, a change after publication, a variant switch (BEH-ZS-063, BEH-ZS-064) | Students (per INV-ZS-043), parents, teachers, student life — routed via `spec/behaviors/08-communication-notifications.md` |

Adding dedicated events to the catalog (timetable publication, variant activation) is proposed in OQ-ZS-063.

## 7. Screens

Text descriptions, mobile-first, bilingual FR/AR with RTL support ([ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`).

| ID         | Screen                                             | Description                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SCR-ZS-032 | Structure instantiation wizard                     | Three steps: template choice (national selected by default, French curriculum, international, with a summary of each template), school year, confirmation. Shows a preview of the tree that will be created and the school's authorized cycles (INV-ZS-074). States: in progress, success with a link to the browser, explicit blocking errors.                    |
| SCR-ZS-031 | Academic tree browser                              | Navigation by year then section → cycle → level → track → classes/groups; breadcrumb; contextual creation and editing; per-class headcount badges; deactivated elements grayed out; links to the class and to the timetable.                                                                                                                                       |
| SCR-ZS-033 | Subject record and per-level/track configuration   | List of the school's subjects; a subject's detail with its configurations (level × track): coefficient, teaching language, mandatory/optional; inline addition and editing; a warning if a level's class has courses with no valid configuration.                                                                                                                  |
| SCR-ZS-034 | Periods and grading scales                         | Periods column: the year's periods with dates, statuses, and sub-periods; grading scales column: default scale, honors ratings, rounding, certifying weightings versioned per year with their textual reference. Date adjustment with overlap checks and calendar alignment.                                                                                       |
| SCR-ZS-035 | Teacher assignment                                 | A classes × subjects grid for a level: each cell carries the assigned teacher, the hour load, and the homeroom teacher; per-teacher filters (cumulative weekly load); an alert on orphaned courses after an affiliation closure; quick access to homeroom-teacher appointment.                                                                                     |
| SCR-ZS-036 | Timetable editor                                   | A weekly grid (Monday–Saturday columns, Saturday restricted to mornings per configuration); a side panel of unplaced courses; drag-and-drop or selection placement; a real-time conflict panel (blocking in red, warnings in orange with a documented confirmation); a variant selector and validity window; draft, global check, publish, and PDF-export buttons. |
| SCR-ZS-037 | Annual calendar                                    | A year view with class days, breaks, national and religious holidays; a distinctive "to confirm" status on movable holidays with a provisional date; date editing with logging; links to evaluation periods and variant windows.                                                                                                                                   |
| SCR-ZS-038 | Timetable viewing (mobile)                         | Day view by default, a week toggle; session cards (subject, time, room, teacher); an active-variant banner (for example "Ramadan Hours"); offline viewing of the last synced grid; prior versions accessible from the history. Variants: student (their class), parent (per child), teacher (their personal grid), supervisor (per class).                         |
| SCR-ZS-039 | Class log and homework                             | Teacher side: the day's and week's session list, quick entry of content and assigned work with a due date and an attachment, a sync indicator in offline mode. Student/parent side: a consolidated list of upcoming homework by subject and day.                                                                                                                   |
| SCR-ZS-040 | N → N+1 cloning wizard (MVP wave 2)                | Selecting the source year and the target year; a summary of copied elements (structure, subjects, grading scales) and not-copied elements (students, assignments, timetables); launch, progress, a final report with gaps to fill in and a link to the N+1 year in preparation.                                                                                    |
| SCR-ZS-041 | Expected-sessions grid (MVP)                       | Per class and per variant: a day × labeled-slot table, each cell carrying a course; a validity window; duplication across parallel classes; a preview of the sessions generated for the current week; no room or conflict check (reserved for the V1 editor).                                                                                                      |
| SCR-ZS-042 | Declaring a session not held (MVP, mobile and web) | From the day's or week's session list: selecting a session or a teacher and a date range; a reason; a choice of "cancelled" or "substituted by" (teacher, course); a "notify parents" checkbox; a declaration history.                                                                                                                                             |

## 8. Integrations

| Item                 | Role                                                                                                                  | Cross-reference                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Massar (file export) | Subject names, coefficients, and periods configured here feed grade files in Massar's template formats; no API exists | `spec/behaviors/12-massar-regulatory-exports.md`; the `INT-MAS` integration is detailed in `spec/cross-cutting/06-external-integrations.md` |
| Notifications        | Timetable publication, variant switch, class change: trigger multi-channel notifications                              | `spec/behaviors/08-communication-notifications.md`                                                                                          |
| PDF generation       | Timetable exports produced locally, with no external provider                                                         | BEH-ZS-065                                                                                                                                  |

No other external integration is required by this module; the time-zone reference data (tzdata) is kept up to date on the platform side.

## 9. Module-specific non-functional requirements

Generic requirements are owned by `spec/cross-cutting/03-non-functional-requirements.md` (domains cited without numbering here, with `NFR-ZS-…` numbering specific to that file):

- **Performance**: fluid grid editing with real-time conflict checking; batch PDF generation compatible with printing all levels at the start of the school year; quantified targets from the `NFR-PERF` domain.
- **Availability**: maintenance windows outside start-of-year and exam periods; the timetable editor sees heavy use in August–September.
- **Mobile and offline**: viewing the timetable and entering the class log are fault-tolerant with synchronization (`NFR-MOB`, `NFR-OFF` domains).
- **Internationalization**: FR/AR interface and content with RTL, bilingual structure labels and documents ([ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), `NFR-I18N` domain).
- **Resilience and volumetry**: three-year sizing (500 schools, 500,000 students) covering multi-section, multi-site schools (`NFR-RES` domains).
- **Traceability and retention**: variant switches, publications, and structure changes logged (INV-ZS-090); closed years read-only (INV-ZS-084); `NFR-DOC` domain retention periods aligned with [ADR-ZS-003](../decisions/003-default-retention-durations.md). Logging: entries logged from MVP; audit-log immutability and export ship at V1.

## 10. Success metrics

Indicators proposed by this module (`KPI-ZS-…` numbering owned by `spec/metrics.md`):

| Indicative measure                                                           | Working target                                                               |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Share of classes with a published timetable on the first day of class        | High target at the start of the year (measurement to be set with the pilots) |
| Average structure-instantiation time during onboarding (JMP-ZS-003)          | On the order of one configuration session, with no re-entry                  |
| Class-log coverage rate (sessions logged / sessions taught)                  | Tracked weekly by the director                                               |
| Number of blocking conflicts detected in the global check before publication | Downward trend after the first few weeks                                     |
| Timetable and homework views by students and parents                         | Adoption measured via usage statistics                                       |

## 11. Open questions

Open questions for this module (OQ-ZS-061 through OQ-ZS-068) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## Traceability

Full cross-reference coverage for this chapter is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
