# ZSchool — Domain Model

> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-DOM                                                    |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Domain Model Specification                                     |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/03-domain-data-model.md` §1-3, §5-7 and `PROJECT.md` §6.10, consolidated. Old `RG-NN`/`INV-NN` invariants were unified into `INV-ZS-NNN` in `invariants.md` (a separate sub-phase) and are only cited here, not repeated. Domain event identifiers keep their original French PascalCase spelling (ADR-ZS-042 / see `spec/decisions/`). |

Derived from `prd/03-domain-data-model.md` (all sections except §4, which is now `invariants.md`) and `PROJECT.md` §6.10 (the original consolidated entity diagram, reproduced as the "at a glance" summary opening §2). Entity names in `code` are the canonical names from that consolidated schema.

This document describes ZSchool's logical data model (logical level, no physical schema, no SQL): the founding chain, the entity dictionary, the enrollment state machine, ownership and consent, multi-tenant isolation, and domain events. Model invariants themselves - the properties every implementation must guarantee - live in `invariants.md` (`INV-ZS-NNN`); this document is cross-referenced from there and cites those IDs where relevant, but does not restate their content.

---

## 1. Overview: the identity → authorization chain

ZSchool does not model "User → School" but a five-level chain (→ PROJECT.md §4):

```text
IDENTITY       Person, User, profiles (pupil, parent, teacher, staff)
   │           the person, unique, persistent, global
   ▼
RELATIONSHIP   Enrollment, ParentStudentRelationship, SchoolMembership,
   │           TeacherAssignment, TransferRequest, ConsentGrant
   ▼
CONTEXT        School, AcademicYear, Section, Cycle, Level, Track, Class, Group…
   │           the school environment where the relationship produces data
   ▼
DATA           attendance, grades, report cards, documents, invoices, messages…
   │           always attached to an enrollment (ADR-ZS-029)
   ▼
AUTHORIZATION  relationship-based rights, contextual permissions, consents
               (INV-ZS-065, INV-ZS-088 to INV-ZS-091)
```

| Level | Scope | Representative entities | Structuring rules |
|---|---|---|---|
| Identity | Global | `Person`, `User`, `StudentProfile`, `ParentProfile`, `TeacherProfile`, `StaffProfile` | One account, several profiles; a profile can exist without an account (ADR-ZS-014). Identity belongs to the person (INV-ZS-057). |
| Relationship | Global to the person, contextualized by tenant | `Enrollment`, `ParentStudentRelationship`, `SchoolMembership` | The link is carried by a dedicated entity, never by the account (ADR-ZS-014). |
| Context | Tenant (school) + year | `School`, `AcademicYear`, `Class`, `Section` | The isolation tenant is the school (INV-ZS-073, ADR-ZS-013). |
| Data | Tenant | every school and financial entity | Every school-related record is attached to an enrollment; no "floating" data (ADR-ZS-029). |
| Authorization | Global + tenant | relationship-based rights, permissions, consents | Contextual permissions (INV-ZS-088), least privilege (INV-ZS-091), logging (INV-ZS-090). |

### 1.1 Data-scope boundaries

| Scope | Definition | Example entities | Access conditions |
|---|---|---|---|
| Global (identity) | Data about the person, outside any school | `Person`, `User`, profiles, `ParentStudentRelationship`, `ConsentGrant` | Accessible only through an active relationship or a consent (→ §6); ZSchool is the data controller (ADR-ZS-027). |
| Tenant (school) | A school's operational data | `Enrollment`, school-related data, finance, tenant communication | Isolated by tenant key with systematic server-side control (INV-ZS-073, INV-ZS-001). |
| Group (organization) | Consolidation of several tenants | `Organization` | Consolidated views and shared administration, with no data merge (ADR-ZS-013). |
| Platform | Data belonging to ZSchool as operator | `Plan`, `Subscription`, `UsageMetric`, `SupportTicket` | Audited internal access; no access to school data outside a tracked procedure (§6). |
| Minimal public | School directory | authorized `School` fields | Limited to: name, city, cycles, education systems, website (INV-ZS-075, INV-ZS-002); at MVP, a minimal read-only directory limited to name, city, cycles (needed for MVP transfers); education systems and website: V1 |

---

## 2. Entity dictionary

### At a glance

The original consolidated diagram (from the frozen baseline, `PROJECT.md` §6.10 - see `appendices/00-project-baseline.md`), kept here as a one-page orientation before the full dictionary below:

```text
IDENTITY
  User                       a login account (phone, email, passwords, MFA)
  Person                     bilingual civil status, date/place of birth, sex, nationality, identity documents
  StudentProfile             Massar code, photo, status, special needs (opt.)
  ParentProfile               occupation (opt.), communication preferences
  TeacherProfile              diplomas, subjects, levels, teaching authorization, experience
  StaffProfile                functions, credentials

RELATIONSHIPS
  ParentStudentRelationship  type, qualities, rights, status, supporting documents
  Enrollment                 student × school × year; level, track, class, section, status, regime
  StudentClassHistory        mid-year class changes
  SchoolMembership           person × school; role(s), contract, dates, status, permissions
  TeacherAssignment          teacher × course (subject × class/group)
  TransferRequest            student, originating school, destination school, status, documents, shared scope
  ConsentGrant                data subject → recipient; scope, duration, revocation

SCHOOL
  Organization                school group
  School                     tenant; legal information, settings
  Campus                     site
  Section                    teaching system
  AcademicYear, Calendar, Holiday, ScheduleVariant
  Cycle, Level, Track (track/option), Class, Group
  Subject, SubjectLevelConfig (weight, language), Course
  Room, Timetable, TimetableSlot
  GradingScale, EvaluationPeriod, ComputationRule

ACADEMIC DATA
  AttendanceRecord, Justification, Dispensation
  Assessment (type, subject, period, weight, scale), Mark, Remark
  PeriodResult (averages, rank, honors, remarks), YearDecision
  ReportCard (version, fingerprint, signer, QR), Transcript, Certificate, StudentDocument
  Incident, Sanction, DisciplinaryCouncil, ConductGrade
  HealthRecord (a later module)

FINANCE
  FeeSchedule (a grid per level/year), FeeItem, Discount, Scholarship
  Invoice, Installment, Payment, Receipt, Refund, Dunning (reminders), CashSession
  FinancialAccount (per enrollment and per financial guardian)

COMMUNICATION
  Announcement, Message, Thread, Notification, DeliveryLog (channel, status, cost)
  Meeting/Convocation, Event

PLATFORM
  Subscription, Plan, ModuleActivation, UsageMetric (active students, SMS)
  AuditLog, DataExport, MergeOperation, SupportTicket
```

The detailed dictionary below is the current, authoritative version of the same model; where it differs from the diagram above (added fields, added constraints), the dictionary wins - the diagram is an orientation aid, not a second source of truth. "Version" column: availability per the roadmap (`roadmap.md`).

### 2.1 IDENTITY domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `User` | Login and authentication account | **Login identifier** (by default the mobile number; otherwise a platform-generated identifier, readable, not derived from the Massar code — a minor pupil with no phone of their own, a second guardian in a household with a single shared phone, ADR-ZS-048), **contact identifiers** (mobile in international E.164 format, the primary contact identifier, ADR-ZS-022; email optional), FR/AR language preference (ADR-ZS-062), authentication secret, MFA (school-leadership, administrative, accounting and system-administrator roles; optional for teachers and supervisors, ADR-ZS-066), trusted devices, sessions | Login identifier unique on the platform; login mobile number unique; email unique if provided; a contact mobile number can be shared by several accounts in the same household (INV-ZS-003). Statuses: active, locked, anonymized (an account with no active relationship after 3 years of inactivity, ADR-ZS-003; an identity snapshot is kept in the registers, INV-ZS-004). Number changes are logged (ADR-ZS-049) | A `User` carries 0..N profiles; a profile carries 0..1 `User` (ADR-ZS-014) |
| `Person` | The person's civil status, owned by the person (INV-ZS-057) | First and last name in dual AR/FR script (ADR-ZS-021), date and place of birth, sex, nationality, identity documents (national ID card, strengthened encryption §6) | No natural key; deduplication by strong/weak matching (INV-ZS-055, INV-ZS-005) | 1 `Person` — 0..1 profile of each type; 1 — N `ParentStudentRelationship` (as a guardian); 1 — N `Enrollment` |
| `StudentProfile` | The pupil facet of the person | Massar code, photo, special needs (optional) | Massar code unique across the whole platform, not mandatory (INV-ZS-054, ADR-ZS-015, INV-ZS-006); protection against code enumeration (§6). Statuses: provisional (no account, awaiting *claim*), linked | 1 `Person` — 0..1; 1 — N `Enrollment`; 1 — N `ParentStudentRelationship` |
| `ParentProfile` | The guardian facet of the person | Occupation (optional), communication preferences | — | 1 `Person` — 0..1; 1 — N `ParentStudentRelationship` |
| `TeacherProfile` | The teacher facet, owned by the teacher (INV-ZS-072) | Degrees, subjects, levels, languages, teaching authorization, experience, availability (network, V2) | Experience: verified (periods confirmed by schools) or self-declared "unverified" (INV-ZS-072, ADR-ZS-033) | 1 `Person` — 0..1; 1 — N `SchoolMembership` |
| `StaffProfile` | The school-staff facet | Roles, clearances | — | 1 `Person` — 0..1; 1 — N `SchoolMembership` |

### 2.2 RELATIONSHIPS domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `ParentStudentRelationship` | Global link between a guardian and a pupil (§2.2) | Link type (father, mother, legal guardian, grandparent, adult sibling, third-party payer — the sole quality "financial guardian," no academic rights, ADR-ZS-055 —, other); stackable qualities: legal guardian (*wilaya*), custodian (*hadana*), financial guardian, emergency contact, authorized to pick up the child; access rights; supporting documents (court order, deed) | Unique pair (guardian, pupil). Statuses: active, suspended, revoked — suspension and revocation require a supporting document (INV-ZS-065). Legal guardianship and custody recorded separately (INV-ZS-066). Conflicts reported to the school, which arbitrates (INV-ZS-068). A court-ordered restriction logged by one school applies only to the schools that attached the order; other schools are notified and log it after checking the document (ADR-ZS-052) | 1 guardian — N; 1 pupil — N (no numeric limit, INV-ZS-063); context attributes addable per school, from a closed list: outing authorization, people authorized to pick up the child, communication preferences, enrollment regime, service options (INV-ZS-067, OQ-ZS-024 resolved) |
| `Enrollment` | Enrollment: pupil × school × school year (§2.2) | Level, track (option), section, class, regime (day pupil, boarder), effective date (attendance, thresholds and exports count from this date, ADR-ZS-065), dates, status, activation mode (front desk, campaign, import activation — ADR-ZS-043), financial guardian, service options (transport, canteen: operational management in V2; the corresponding fee line is billable from MVP onward via `FeeItem`), acceptance of the school rules and the Law 09.08 privacy notices (deferred to account claiming in the case of import activation), declared prior record (a non-ZSchool school, years, levels, decisions, marked "unverified," ADR-ZS-063), a link to the previous enrollment in case of reinstatement (ADR-ZS-044), a register identity snapshot (INV-ZS-004) | At most one ACTIVE enrollment per (pupil, school year) (INV-ZS-058, ADR-ZS-002, INV-ZS-007). Statuses: state machine §3 (including CANCELLED, ADR-ZS-044). Never deleted once it has been ACTIVE (INV-ZS-060, INV-ZS-008) | N — 1 `StudentProfile`; N — 1 `School`; N — 1 `AcademicYear`; N — 1 `Class` (changes logged in `StudentClassHistory`); 1 — 0..1 `FinancialAccount` |
| `StudentClassHistory` | History of mid-year class changes (INV-ZS-061) | Origin class, target class, date, reason, author | Append-only entries (immutable) | N — 1 `Enrollment` |
| `SchoolMembership` | Single affiliation, person × school (ADR-ZS-016) | Role(s) (teacher, head, front-office staff, accountant, head supervisor, supervisor, nurse, driver, system administrator…), contract type (permanent, part-time, intern, contractor), dates, permissions | Statuses: invited, active, suspended, ended; activation requires acceptance by both parties (INV-ZS-070). Simultaneous active affiliations across schools and several roles within one school are allowed (INV-ZS-069, INV-ZS-009). Closure → immediate access removal (INV-ZS-071, INV-ZS-010) | N — 1 `Person` (via a profile); N — 1 `School`; 1 — N `TeacherAssignment` |
| `TeacherAssignment` | A teacher's assignment to a course | Subject × class or group; form teacher (§2.3) | — | N — 1 `SchoolMembership`; N — 1 `Course`; grounds the teacher's permissions (INV-ZS-091, INV-ZS-011) |
| `TransferRequest` | A pupil's transfer procedure (§2.2) | Pupil, origin school, destination school, documents (leaving certificate…), shared scope (INV-ZS-083), Massar reference (procedure outside ZSchool in V1) | Statuses (ADR-ZS-063): initiated, validated by the origin, accepted by the destination, activated (the origin closes to TRANSFERRED and the destination activates in a single transaction), declined (by the destination only: capacity, unauthorized cycle, incomplete file; the origin may decline only for a missing legal tutor signature, never on financial grounds, ADR-ZS-005), cancelled (by the legal tutor or the adult pupil before activation), expired (30 days after validation with no activation: the origin remains ACTIVE). Any legal guardian, the custodian, or the adult pupil may initiate it; the legal tutor's or the adult pupil's signature is required for validation. Case outside ZSchool: a PDF exit file via a time-limited secure link (ADR-ZS-032) | N — 1 `StudentProfile`; N — 1 `School` (origin and destination); a linked consent record (INV-ZS-082, INV-ZS-083) |
| `ConsentGrant` | A data subject's consent toward a recipient (INV-ZS-082, INV-ZS-083) | Scope, duration, timestamp, basis (transfer, school passport V2), **grantor** (the signing legal guardian or the adult pupil, with their quality at the time of consent) | Statuses: active, expired, revoked; logged (§6, INV-ZS-012) | N — 1 `Person`; recipient: `School` or `Person` |

### 2.3 SCHOOL domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `Organization` | School group: governance, SaaS billing, consolidated reporting | Name, affiliated schools, group administrators | Version: MVP for creation, tenant affiliation and read-only consolidation (ADR-ZS-041); V1 for shared administration and group billing | 1 — N `School`; consolidation with no merge (INV-ZS-073, ADR-ZS-013) |
| `School` | School, isolation tenant (INV-ZS-073) | Name AR/FR, authorization number, AREF and provincial education office, authorized cycles, ICE, IF, RC (trade register), business license, CNSS, address, logo, stamp, signatories, bank details, settings (calendar, periods, grading, languages, channels) (INV-ZS-074) | Internal tenant identifier; legal ICE reference. Subscription status carried by `Subscription` (trial, active, overdue, terminated, ADR-ZS-004) | N — 0..1 `Organization`; 1 — N `Campus`, `Section`, `AcademicYear`, `SchoolMembership`, `Enrollment` |
| `Campus` | Site or campus | Address, rooms, hours | — | N — 1 `School`; 1 — N `Room` |
| `Section` | Education system (national, French mission, international) | Structure model instantiated by the school (INV-ZS-076) | — | N — 1 `School`; 1 — N `Cycle` |
| `AcademicYear` | School year (September to June/July) | Label, dates, status (in preparation, in progress, closed) | Structure clonable from year N to N+1 without pupils (INV-ZS-077, INV-ZS-013) | N — 1 `School`; 1 — N `Enrollment`, `EvaluationPeriod` |
| `Calendar`, `Holiday`, `ScheduleVariant` | The year's calendar, public holidays (Hijri and Gregorian calendars, §6), timetable variants (normal, Ramadan, exams, V1) | Periods, breaks, variants by period | — | Attached to 1 `AcademicYear` |
| `Cycle` | Cycle: preschool, primary, lower secondary, upper secondary | — | Must appear in the school's authorized cycles (INV-ZS-074) | N — 1 `Section`; 1 — N `Level` |
| `Level` | Level: 1AP … 2nd Bac | — | — | N — 1 `Cycle`; 1 — N `Class`, `Track` |
| `Track` | Track or option (high school) | — | — | N — 1 `Level` |
| `Class` | Class: a group of pupils at one level | Form teacher | — | N — 1 `Level`; 1 — N `Group`; 1 — N `Enrollment` (current), logged via `StudentClassHistory` |
| `Group` | Language, option or lab-work group | — | — | N — 1 `Class` |
| `Subject` | Subject | Mandatory or optional | Coefficient and language of instruction set by level and track, never globally (INV-ZS-078, INV-ZS-014) | N — 1 `School`; 1 — N `SubjectLevelConfig`, `Course` |
| `SubjectLevelConfig` | Configuration of a subject for a level and a track | Coefficient, language of instruction | Unique pair (subject, level, track) | N — 1 `Subject` |
| `Course` | Course: subject × class (or group) × teacher | — | — | N — 1 `Subject`, `Class` or `Group`; 1 — N `TeacherAssignment` |
| `Room` | Room or resource | Capacity, features | — | N — 1 `Campus` |
| `Timetable`, `TimetableSlot` | Timetables (V1): weekly grid by class, teacher, room | Slots, variants by period | Teacher/room/class conflict detection (§2.3) | Attached to 1 `AcademicYear`, `Class`, `Course` |
| `GradingScale` | Grading scales | Letter and GPA scales: V2 (international sections) | — | N — 1 `School` |
| `EvaluationPeriod` | Assessment periods: semesters or terms, sub-periods | Dates, closing | Grades locked at closing (§2.4) | N — 1 `AcademicYear` |
| `ComputationRule` | Computation rules: averages, rounding, honors, rank, exclusions | Configured by level or track | — | N — 1 `School`, `Level` |

### 2.4 SCHOOL DATA domain

All of these entities are attached to an enrollment and thus to a context (ADR-ZS-029, §2.4); author and data subject as defined by INV-ZS-079 (§5).

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `Session` | An expected teaching session (ADR-ZS-045): course × date × declared slot; created by the teacher when taking attendance or declared in advance by student life (a simple weekly grid by class, `behaviors/03-academic-structure-timetables.md`); in V1, populated automatically from `TimetableSlot` (same file) | Course, date, slot, status (expected, called, not held, replaced), actual teacher | Uniqueness on (course, date, slot); only one attendance call per triplet; grounds "expected calls" and the attendance rate (ADR-ZS-065). Version: MVP | N — 1 `Course`; 1 — 0..1 attendance call (`AttendanceRecord` grouped by session); 0..1 `TimetableSlot` (V1) |
| `AttendanceRecord` | An attendance event: absence, tardiness, early departure, exclusion (an administrative absence created by a temporary-exclusion sanction, with no notification or attendance-rate impact, ADR-ZS-057) | Date, declared session (course × date × slot, ADR-ZS-045) or half-day, mobile entry tolerant of network drops (§6); notification: first absence of the day or half-day, a 3-minute hold window, a correction notice after sending (ADR-ZS-056) | One session per (course, date, slot) | N — 1 `Enrollment`; justified by 0..N `Justification` |
| `Justification` | Absence justification | Parent attachment, reason, validation; source: the parent (mobile) or the school (entered at the front desk on the guardian's behalf, logged as "entered by the school," ADR-ZS-056) | Statuses: submitted, accepted, declined | N — 1 `AttendanceRecord` |
| `Dispensation` | Exemption (e.g. sport) | Period, reason | — | N — 1 `Enrollment` |
| `Assessment` | Assessment: test, homework, exam, school-wide unified test, mock exam, oral, project (the external provincial, regional and national exams are not `Assessment` records: grades are entered or imported via the assessments and Massar-exports behaviors, ADR-ZS-058) | Type, subject, period, coefficient, scale (any scale other than /20 is normalized to /20 before weighting, ADR-ZS-058) | Compliance with the national framework: at least two tests per subject and per semester (§2.4) | N — 1 `Subject`, `EvaluationPeriod`, `Class` or `Group`; 1 — N `Mark` |
| `Mark` | A pupil's grade on an assessment | Value or marker (an unjustified absence defaults to 0, configurable; a justified absence, an exemption, or "not assessed" are excluded from the denominator, ADR-ZS-058), remark, **status: draft / published** (progressive publication configurable per school, defaulting to closing time, ADR-ZS-058) | Locked by school leadership at period closing (§2.4); not portable or visible to families until published (INV-ZS-081). A grade stays attached to the enrollment through a class change (ADR-ZS-058) | N — 1 `Assessment`, `Enrollment` |
| `Remark` | Remark or observation | Author, scope | Staff-internal observations are not portable (INV-ZS-081) | N — 1 `Enrollment`, period |
| `PeriodResult` | Period results: per-subject and overall averages, rank, honors, remarks | Per assessment period; "excluded from rank" indicator (ADR-ZS-058); a subject with no grade is excluded from the overall average with an "NA" mention | Rank is computed within the current class at closing (ADR-ZS-058) | N — 1 `Enrollment`, `EvaluationPeriod` |
| `YearDecision` | Year-end decision (INV-ZS-059) | Promoted to the next level, repeating, graduated, tracked (into a track: the pupil stays at the school, ADR-ZS-044), undetermined (certifying levels, until results are imported, ADR-ZS-058) | Carried by the enrollment's COMPLETED status (INV-ZS-007); every pupil present at year-end closing moves to COMPLETED with their decision before any departure (ADR-ZS-044) | 1 — 1 COMPLETED `Enrollment` |
| `ReportCard` | Period report card | Version, fingerprint, signatory, date, verification QR code | Immutable once published: any correction creates a new version, the old one stays viewable marked "superseded" (INV-ZS-085, ADR-ZS-020, INV-ZS-015). Verification QR: V1 | N — 1 `Enrollment`, `EvaluationPeriod`; 1 — N versions |
| `Transcript` | Annual or cumulative transcript (post-baccalaureate files) | — | A published document, with permanent access (INV-ZS-080) | N — 1 `Enrollment` |
| `Certificate` | Certificates and attestations (enrollment, achievement, attendance, departure…) | Type, numbering, stamp, signature, QR | An advanced electronic stamp in V1, a qualified one via a DGSSI-accredited provider in V2 (ADR-ZS-011). Never blocked for unpaid fees (ADR-ZS-005, INV-ZS-016) | N — 1 `Enrollment`, `School` |
| `StudentDocument` | A pupil-file document: birth certificate, photo, vaccination record, court orders… | Type, file, the depositing tenant's key, strict access control (§2.4) | Strengthened encryption (§6); court orders carried by the relationship's supporting documents (INV-ZS-065); visible only to the school that deposited it; identity documents are shared via the transfer profile (INV-ZS-083), never automatically (ADR-ZS-054) | N — 1 `StudentProfile`; N — 1 `School` (tenant) |
| `Incident` | Disciplinary fact | Date, severity, description | Not portable (INV-ZS-081, ADR-ZS-019); kept for end-of-schooling + 2 years then anonymized (ADR-ZS-003) | N — 1 `Enrollment` |
| `Sanction` | Graduated sanction | Type, duration, decision | Not portable (INV-ZS-081, INV-ZS-083) | N — 1 `Incident` |
| `DisciplinaryCouncil` | Disciplinary council | Date, members, minutes, decision (may result in EXPELLED, §3) | V1 | N — 1 `Class`, `Enrollment` |
| `ConductGrade` | Conduct grade | Period, value | Not portable (INV-ZS-081) | N — 1 `Enrollment`, `EvaluationPeriod` |
| `HealthRecord` | Health record (V2): allergies, treatments, medical contacts, vaccinations | Sensitive data, tenant key | One record per (pupil × school), attached to the current enrollment (ADR-ZS-054, ADR-ZS-029); prior CNDP authorization (F112, §6); never transferred automatically (ADR-ZS-019): the new school starts from an empty record; end of schooling at that school + 1 year, then deletion (ADR-ZS-003) | 1 — 0..1 per (`StudentProfile`, `School`); attached to the current `Enrollment` |

### 2.5 FINANCE domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `FeeSchedule` | Fee schedule by year, level, section and option (§2.5) | Tariffs, ancillary fees | The Law 59.21 parent contract generated, electronically signed (ADR-ZS-011) and archived; no mid-year tariff change on an active enrollment (§2.5, INV-ZS-017) | N — 1 `School`, `AcademicYear`, `Level` |
| `FeeItem` | Fee line | Tuition, enrollment, transport, canteen, activities | — | N — 1 `FeeSchedule` |
| `Discount` | Discount | Automatic sibling discount (§2.5), negotiated discounts | Approval required for negotiated discounts | N — 1 `Enrollment` or `FeeSchedule` |
| `Scholarship` | Scholarship | Amount, criteria, approval | V1 | N — 1 `Enrollment` |
| `Invoice` | Compliant invoice | ICE, IF, RC (trade register), business license, VAT mentions (INV-ZS-074, §2.5) | Tamper-proof sequential numbering per school (§2.5, INV-ZS-017) | N — 1 `Enrollment`, `FinancialAccount`; 1 — N `Installment` |
| `Installment` | An installment in a monthly, term-based or annual plan | Amount, due date | Statuses: upcoming, paid, overdue | N — 1 `Invoice`; 1 — N `Payment` |
| `Payment` | Cash collection | Methods: cash (cash session), cheque (due date, deposit, bounced), bank transfer, direct debit (V2, via the bank), online: Fatourati from V1 onward (per ADR-ZS-031), card with a stored card in V2 (ADR-ZS-031) | Reconciled against 0..N installments; **allocable across several `FinancialAccount` records** (settling a sibling group in a single payment, ADR-ZS-061); voided by a logged reversal entry, with the original number kept (ADR-ZS-061) | N — N `Installment` or `Invoice` (allocation); 1 — 0..1 `Receipt` |
| `Receipt` | Payment receipt | Tamper-proof sequential number (MVP, INV-ZS-017), amount, children and installments covered (a family receipt, ADR-ZS-061), printable and sent to the parent (§2.5) | A numbered void receipt in case of a reversal entry | N — 1 `Payment` |
| `Refund` | Refund | Reason, amount | V1 (full finance) | N — 1 `Payment` |
| `Dunning` | Graduated reminder (SMS, WhatsApp, letter) | Stage, date, channel | Triggered by an overdue installment (§2.5) | N — 1 `Enrollment` or `FinancialAccount` |
| `CashSession` | Cash session | Opening, closing, variance, cash collections | V1 | N — 1 `School`; 1 — N `Payment` |
| `FinancialAccount` | Financial account per enrollment and per financial guardian (§2 at-a-glance) | Balance, entries | Survives the enrollment's closure until settled (INV-ZS-062, INV-ZS-018); split between two payers and third-party payment possible (§2.5); always attached to a `ParentStudentRelationship` carrying the "financial guardian" quality (third-party payer included, ADR-ZS-055); default proration: a started month is owed in full, with a daily-proration option (ADR-ZS-061) | N — 1 `Enrollment` and/or financial guardian; 1 — N `Invoice`, `Payment` |

### 2.6 COMMUNICATION domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `Announcement` | Announcement | Target: school, cycle, level, class; bilingual content (§2.6) | — | N — 1 `School` |
| `Thread` | Parent-teacher discussion thread (MVP, in-app, ADR-ZS-062) | Moderated by default: the teacher or the school opens it, the parent replies; parent-initiated opening configurable; school-leadership viewing flagged to users (ADR-ZS-034) | — | N — 1 `Enrollment` (tenant context); participants: `ParentStudentRelationship` and `TeacherAssignment`; 1 — N `Message` |
| `Message` | Individual or thread message | Content, channel | — | N — 1 `Thread` or recipient |
| `Notification` | Notification | Channels: in-app, SMS, WhatsApp utility (MVP: presence notifications); push, broader WhatsApp, email (V1); routed by message type, recipient language and preferences (ADR-ZS-023, ADR-ZS-036, ADR-ZS-062); "STOP" opt-out limited to reminders and announcements; send windows excluding presence and security messages | — | N — 1 recipient; 1 — 0..N `DeliveryLog` |
| `DeliveryLog` | Delivery record | Channel, status (sent, delivered, read), cost | SMS/WhatsApp costs charged to the school (bundles, §2.6) | N — 1 `Notification` |
| `Meeting/Convocation` | Summons or appointment (parent-teacher meetings) | Date, subject, participants | V1 (student-life and discipline summonses) | N — 1 `Enrollment`, `School` |
| `Event` | School event or outing | Electronic parental authorization (§2.6) | V1 | N — 1 `Class`, `School`; 1 — N consents |

### 2.7 PLATFORM domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `Subscription` | A school's or group's subscription | Paying customer: the school (ADR-ZS-024) | Statuses: trial, active, overdue (read-only after a grace period), terminated (export, retention then deletion, ADR-ZS-004) | N — 1 `School` or `Organization`; 1 — N `UsageMetric` |
| `Plan` | Single pricing plan, all modules included (§2 at-a-glance, ADR-ZS-009) | Price per active pupil per month | A single active plan | 1 — N `Subscription` |
| `ModuleActivation` | A module's availability for a tenant | Later modules activate as they ship | V1 | N — 1 `School` |
| `UsageMetric` | Billing metrics | Active pupils (counted from September to June), SMS, WhatsApp, storage | Monthly billing base in MAD (ADR-ZS-024, ADR-ZS-009) | N — 1 `Subscription` |
| `AuditLog` | Audit log | Author, context, timestamp, action | Immutable and exportable (§6); every write and every sensitive view logged (INV-ZS-090, INV-ZS-019); 5 years (ADR-ZS-003). Version: immutable and exportable in V1; at MVP, minimal write-level history (corrections logged at the record level, founder arbitration, OQ-ZS-027) | Per tenant + platform operations (support, merges); ADR-ZS-066 (historical alias: D4) arbitration: immutable write-level history at the record level at MVP, a sensitive-view log and export in V1 |
| `DataExport` | Data export | Individuals' rights (access, portability, Law 09.08), full export on termination (ADR-ZS-004) | V1 | N — 1 `School` or `Person` |
| `MergeOperation` | Merging two profiles | Author (support or an authorized role), source and target profiles, confirmation by a legal guardian | An end-to-end audited operation (INV-ZS-056, INV-ZS-020); MVP, reserved to ZSchool support (ADR-ZS-041); an authorized school-side role in V1 | N — 1 `Person` (target) |
| `SupportTicket` | Support ticket | Temporary, audited support access to a tenant (§6), with the head's explicit in-app approval, time-boxed (ADR-ZS-066) | MVP | N — 1 `School` |

---

## 3. Enrollment state machine (`Enrollment`)

### 3.1 States

```text
CANDIDATE ──► PRE-ENROLLED ──► ACTIVE ──┬──► SUSPENDED ──┬──► (back to) ACTIVE
 (admission       (deposit /       ▲    │                └──► TRANSFERRED / WITHDRAWN / EXPELLED / COMPLETED (ADR-ZS-044)
  file)            reservation)    │    ├──► TRANSFERRED   (mid-year departure)
      │                 │          │    ├──► WITHDRAWN     (mid-year departure)
      ▼                 ▼          │    ├──► EXPELLED
   CANCELLED ◄──────────┘          │    └──► COMPLETED     (year-end decision, INV-ZS-059;
 (terminal state, ADR-ZS-044)          │                        every pupil present at closing)
                                   │
 (import, data reprise) ───────────┘  "import activation", ADR-ZS-043
```

| State | Meaning | Entry conditions |
|---|---|---|
| CANDIDATE | Admission file submitted, decision pending | File submitted (online or at the front desk); available with the admissions module (V1; the MVP starts at PRE-ENROLLED, see `roadmap.md`) |
| CANCELLED | Terminal state of a cancelled CANDIDATE or PRE-ENROLLED enrollment (ADR-ZS-044, OQ-ZS-021 resolved) | Cancellation by the school or the guardian, with a reason and a date; the admissions-campaign history is kept; no school-related data attached |
| PRE-ENROLLED | A place reserved by deposit, the file being completed | Admission accepted |
| ACTIVE | The pupil is enrolled at the school for the year | See 3.2 |
| SUSPENDED | A temporary administrative measure by school leadership (a situation being sorted out, a long conservatory measure); a temporary-exclusion sanction does not create a SUSPENDED state but `AttendanceRecord` entries of type "exclusion" (ADR-ZS-057) | A decision by the school, with a reason and a date (V1; the MVP state machine is limited to pre-enrolled, active, completed, transferred, withdrawn, completed by CANCELLED and import activation) |
| TRANSFERRED | A validated departure to another school **mid-year**; a departure at the following start of year results in COMPLETED with no N+1 enrollment at the origin, with a `TransferRequest` carrying an effective date (ADR-ZS-044) | Transfer procedure (see `behaviors/09-transfers-mobility.md`), activation of the receiving enrollment |
| WITHDRAWN | Departure with no known destination, **mid-year** (ADR-ZS-044) | Departure declared, with a reason and a date (INV-ZS-060) |
| EXPELLED | Final disciplinary expulsion | Disciplinary council decision (V1) |
| COMPLETED | End of the school year: every pupil present at closing, including those who do not re-enroll and those who are "tracked" (choosing a track, who stay at the school, ADR-ZS-044) | Year-end *rollover* with the INV-ZS-059 decision (MVP wave 2, see `behaviors/02-admissions-enrollment-reenrollment.md`, ADR-ZS-041) |

### 3.2 Legal transitions

| From → To | Triggering event | Conditions | Effects |
|---|---|---|---|
| (creation) → CANDIDATE | Application filed | — | The file is created; identity reused where a match is found (INV-ZS-055) |
| CANDIDATE or PRE-ENROLLED → CANCELLED | Cancellation | Reason and date; the deposit is refunded or kept per the fee schedule (finance behaviors) | A terminal, archived state (ADR-ZS-044); the (pupil, year) pair is freed |
| (import) → ACTIVE | **Import activation** (data reprise, ADR-ZS-043) | Reserved for bulk import; the file must carry at least one legal guardian and one financial guardian; logged with reason "data reprise" and its author; acceptance of the school rules and the Law 09.08 privacy notices is collected when the account is claimed, with a reminder | Enrollment ACTIVE as of the imported effective date; the installment plan is carried over with amounts already paid; the parent contract is generated when the account is claimed |
| CANDIDATE → PRE-ENROLLED | Admission accepted, a deposit (or reservation) collected | The admission decision is logged; collecting the deposit is the condition for moving to PRE-ENROLLED, as set by the deposit/reservation rule (§2 at-a-glance); otherwise, a waiting list | The enrollment enters the preparation list; the initial payment then conditions PRE-ENROLLED → ACTIVE. At *rollover*, N+1 enrollments are created only in PRE-ENROLLED, and any pupil who already has an N+1 enrollment in a non-terminal state is skipped (ADR-ZS-044) |
| PRE-ENROLLED → ACTIVE | Complete file + initial payment | A complete file; the deposit or enrollment fee collected; at least one active legal guardian and one financial guardian (INV-ZS-064, INV-ZS-021); the school rules and Law 09.08 privacy notices accepted; no other ACTIVE enrollment for the same (pupil, year) pair (INV-ZS-058, INV-ZS-007) | The parent contract is generated and archived (Law 59.21, MVP, ADR-ZS-041); the installment plan is created |
| ACTIVE → SUSPENDED | A temporary administrative measure | Reason and dates logged by the school (V1) | Access and services follow the decision; the enrollment still holds the (pupil, year) pair, INV-ZS-007 |
| SUSPENDED → TRANSFERRED, WITHDRAWN, EXPELLED or COMPLETED | The same events as from ACTIVE (ADR-ZS-044) | The same conditions as from ACTIVE; the suspension measure closes at the date of the transition | The same effects as from ACTIVE |
| SUSPENDED → ACTIVE | End of the measure | The set term reached, or a reinstatement decision (V1) | Return to the prior status |
| ACTIVE → TRANSFERRED | Transfer **activated** (mid-year departure) | Validation by the origin school; acceptance by the destination; a leaving certificate generated, signed by the legal tutor or the adult pupil; the shared scope chosen by the legal guardian or the adult pupil (INV-ZS-083, INV-ZS-022); a financial balance is not a blocker (INV-ZS-062, ADR-ZS-005); the Massar reference logged | The origin closes and the destination activates in a single transaction (ADR-ZS-063); the receiving enrollment is created on the same identity (INV-ZS-023); on decline, cancellation or expiry (30 days) of the request, the origin remains ACTIVE |
| ACTIVE → WITHDRAWN | Departure with no destination | Reason and date logged (INV-ZS-060) | Closure; the financial relationship survives (INV-ZS-062, INV-ZS-018); an exit file is available (ADR-ZS-032) |
| ACTIVE → EXPELLED | Disciplinary expulsion | Disciplinary council decision logged (V1) | Closure with a reason; official documents not blocked for unpaid fees (ADR-ZS-005) |
| ACTIVE → COMPLETED | Year-end closing | Year-end decision entered (INV-ZS-059): promoted, repeating, graduated, tracked (stays at the school), undetermined (certifying levels, updated once results are imported before the grace period ends, ADR-ZS-058); **mandatory for every pupil present at closing, before any year-end departure** (ADR-ZS-044) | *Rollover*: N+1 enrollments created in PRE-ENROLLED (MVP wave 2, ADR-ZS-041); report cards and decisions archived |

Mid-year class change: no new `Enrollment` and no state transition; an entry is written in `StudentClassHistory` (INV-ZS-061, INV-ZS-025).

**Reinstatement** (ADR-ZS-044, OQ-ZS-022 resolved): a new enrollment for the same (pupil, school year) pair is allowed once the prior enrollment is in a terminal state other than SUSPENDED (TRANSFERRED, WITHDRAWN, EXPELLED, CANCELLED), with reason "reinstatement" and a link to the previous enrollment; INV-ZS-007 is unchanged (only ACTIVE and SUSPENDED hold the pair).

### 3.3 Forbidden transitions and constraints

| Forbidden | Rule |
|---|---|
| Deleting an enrollment that has been ACTIVE | Never; closure is mandatory with a reason and a date (INV-ZS-060, ADR-ZS-017, INV-ZS-008) |
| Cancelling an ACTIVE enrollment or beyond | Only CANDIDATE or PRE-ENROLLED enrollments can be cancelled (INV-ZS-060) |
| Two ACTIVE enrollments for the same (pupil, school year) pair | Forbidden platform-wide (INV-ZS-058, ADR-ZS-002, INV-ZS-007) |
| Reverse transition from TRANSFERRED, WITHDRAWN, EXPELLED, COMPLETED or CANCELLED | No return transition; a reprise goes through a new enrollment linked to the previous one (reinstatement, ADR-ZS-044) |
| A year-end departure closed as TRANSFERRED or WITHDRAWN | Forbidden: every pupil present at closing moves to COMPLETED with their decision; TRANSFERRED and WITHDRAWN are reserved for mid-year departures (ADR-ZS-044) |
| Activating ACTIVE outside the PRE-ENROLLED → ACTIVE conditions | Forbidden, except for import activation, reserved and logged (ADR-ZS-043) |
| Creating a new identity during a transfer | Forbidden: the receiving enrollment attaches to the existing `Person` (INV-ZS-023) |
| School data detached from the enrollment after closure | Data stays attached to the closed enrollment, read-only (INV-ZS-084, INV-ZS-024); the financial relationship survives (INV-ZS-062, INV-ZS-018) |

---

## 4. Model invariants

Model invariants - the properties every implementation must guarantee - are documented in **`invariants.md`** as `INV-ZS-NNN`, unifying what were previously two separate namespaces (business rules `RG-NN` and data-model invariants `INV-NN`). This chapter cites those IDs throughout §1-3 and §5-7 in their pre-migration form (see the note at the end of this document); see `invariants.md` for the full Source/Implication/Enforcement/Related breakdown of each one.

---

## 5. Ownership, consent and retention

Principle (INV-ZS-079): every school-related record has an **author** (the school, the operational data holder, within its own context) and a **data subject** (the pupil, the beneficiary, represented by their guardians). The table below cross-references data type, portability and retention.

| Data type | Author (data holder) | Data subject | Portability / access after departure | Default duration (ADR-ZS-003) | Basis for inter-school sharing |
|---|---|---|---|---|---|
| Identity (civil status, photo, Massar code) | The person (INV-ZS-057); corrected by any school with an active enrollment | The pupil, via their guardians | Shared per the transfer profile (INV-ZS-083); permanent read access | Permanent for as long as an active relationship or consent exists; an account with no active relationship is anonymized after 3 years (ADR-ZS-003); the school keeps an identity snapshot in its register for the register's permanent retention period (INV-ZS-004, ADR-ZS-053) | Consent (INV-ZS-082) + official transfer documents (INV-ZS-083) |
| Official documents (certificates, attestations) | The authoring school | The pupil | Permanent read access (INV-ZS-080); a PDF exit file outside the platform (ADR-ZS-032) | Permanent (registers and official documents) | Default transfer profile (INV-ZS-083) |
| Report cards, transcripts, year-end decisions | The authoring school | The pupil | Permanent read access (INV-ZS-080); the year-end transcript included in the transfer profile (INV-ZS-083) | Permanent | The year-end transcript is included by default; beyond that, explicit sharing (INV-ZS-082, INV-ZS-083) |
| Unpublished grades, drafts, deliberations | The authoring school | — | Never portable or visible (INV-ZS-081) | End of schooling + 2 years, then anonymized (aligned with student life, OQ-ZS-023 resolved, ADR-ZS-042) | None (INV-ZS-081) |
| Attendance and justifications | The school (teacher, student life) | The pupil | Permanent read access per INV-ZS-080, within the retention-period limit | End of schooling + 2 years, then anonymized | Explicit sharing only (INV-ZS-083) |
| Discipline (incidents, sanctions, councils, conduct) | The authoring school | The pupil | Not portable (INV-ZS-081, INV-ZS-083, ADR-ZS-019) | End of schooling + 2 years, then anonymized | None by default |
| Health (a record per pupil × school, ADR-ZS-054) | The authoring school (V2) | The pupil | Never transferred automatically (ADR-ZS-019); restricted access | End of schooling at that school + 1 year, then deleted | Never automatic; explicit consent under a framework (§6, F112) |
| Finance (invoices, installments, payments, receipts) | The authoring school | The financial guardian and the pupil | The financial guardian keeps access to their payment history; an account statement is issued only to the financial guardian on departure (INV-ZS-062, §2.5, ADR-ZS-061) | 10 years after the account is settled (General Tax Code art. 211, INV-ZS-018, ADR-ZS-066) | An account statement on departure; never an automatic transfer |
| Messages and notifications | The school / thread authors | Participants | Eligible for the right to erasure (INV-ZS-086) | 2 years | None |
| Audit logs | Platform and tenant | — | Not portable; exportable for audit | 5 years | None |

---

## 6. Multi-tenant isolation and access to global entities

| Rule | Content |
|---|---|
| Tenant key | The isolation tenant is the school (`School`); every operational record carries the tenant key, and access is systematically controlled server-side, never client-side (INV-ZS-073, ADR-ZS-013, INV-ZS-001) |
| School group | The `Organization` provides consolidated views and shared administration; it never opens a merge of tenant data (INV-ZS-073, ADR-ZS-013) |
| Global entities | `Person`, `User`, profiles, `ParentStudentRelationship`, `ConsentGrant`: accessible only through an active relationship (enrollment, affiliation, parental link) or a consent (INV-ZS-032); a multi-school parent sees their children across all their schools from a single account (INV-ZS-053, INV-ZS-088) |
| Subscription status | Overdue subscription: read-only after a grace period; termination: full export, 90 days read-only, operational data deleted at 12 months, identities and published documents maintained (ADR-ZS-004, INV-ZS-045) |
| Encryption | In transit and at rest; strengthened for identity documents, health data and court orders (§6) |
| Location | Production and backups in Morocco; no pupil data leaves the country except for messaging flows governed by F118 (ADR-ZS-007) |
| Audit log | Immutable, exportable, kept for 5 years; logs writes and sensitive views with author, context, timestamp (INV-ZS-090, INV-ZS-019; MVP: immutable write-level history, ADR-ZS-066 (historical alias: D4)); every support access goes through a logged ticket with the head's approval (ADR-ZS-066) |
| Anti-enumeration protection | Search and matching by Massar code protected against identity enumeration (§6) |

---

## 7. Notifiable domain events

Events produced by the modules (`behaviors/` module codes), consumed by communication and student-life behaviors. Every send produces a `Notification` and a `DeliveryLog` (channel, status, cost). **Event identifiers are kept in their original French PascalCase form, unchanged across the whole spec** — this is a deliberate carry-over from the earlier English translation pass (see `spec/decisions/` for the ADR recording why a further rename was deferred, historical alias ADR-ZS-042).

| Event | Producer | Consumers and effects | References |
|---|---|---|---|
| `AbsenceRecorded` | Student life (a validated call) | Guardians (SMS/WhatsApp/push, under 5 min), teacher, school leadership | INV-ZS-064, INV-ZS-065; §6; attendance and communication behaviors |
| `JustificationSubmitted` / `JustificationValidated` | Parent; student life | Student life (processing queue); parent (status) | attendance behaviors |
| `AbsenceThresholdReached` | Student life | School leadership, head supervisor, guardians | attendance behaviors |
| `IncidentRecorded` / `SanctionNotified` | Student life | Legal guardians and the custodian (per their rights), school leadership | INV-ZS-065; attendance and communication behaviors |
| `SummonsIssued` | Student life or school leadership | Parent, with read tracking | communication behaviors |
| `PeriodClosed` | Assessments | Teachers (entry lock), school leadership | assessment behaviors |
| `ReportCardPublished` | Assessments | Pupil and guardians (notification), QR available | INV-ZS-080, INV-ZS-085; assessment and communication behaviors |
| `PaymentReceived` | Finance | Parent (receipt), accounting, balance update | finance behaviors |
| `InstallmentOverdue` / `ReminderSent` | Finance | Parent (graduated reminder), school leadership (unpaid fees) | finance and communication behaviors |
| `DocumentGenerated` | Documents | Parent (delivery, verification QR) | ADR-ZS-005; document behaviors |
| `EnrollmentStatusChanged` | Enrollment | School leadership, parents (per status), dashboards | INV-ZS-059, INV-ZS-060; admissions/enrollment behaviors |
| `ProbableDuplicateDetected` | Platform (weak matching) | The school concerned, support (alert without linking) | INV-ZS-055; admissions/enrollment behaviors |
| `IdentityClaimed` (*claim*) | Parent or teacher | The school that created the provisional profile | admissions/enrollment behaviors |
| `IdentityCorrected` | A school with an active enrollment | Other schools concerned, guardians | INV-ZS-057; admissions/enrollment behaviors |
| `MergeCompleted` | Support or an authorized role | Schools concerned, the legal guardian (confirmation), audit | INV-ZS-056; admissions/enrollment behaviors |
| `TransferValidated` | Transfers | Origin (closes to TRANSFERRED), destination (identity received), parents | INV-ZS-023; transfer behaviors |
| `ConsentGranted` / `ConsentRevoked` | Parent or adult pupil | The recipient school, the audit log | INV-ZS-082, INV-ZS-083; transfer behaviors |
| `AccessRestrictionRecorded` | Administration or platform (access restriction logged: a court order targeting a parent, a restriction set by the adult pupil) | The guardian or parent concerned (a note, scope, reference to the decision), other guardians, school leadership, the audit log | INV-ZS-065, INV-ZS-052; administration and admissions/enrollment behaviors |
| `GuardianConflictReported` | Enrollment (conflicting requests between guardians) | The school (the operational arbitrator, ZSchool does not decide), the guardians concerned | INV-ZS-068; admissions/enrollment behaviors |
| `RelationshipQualityChanged` | Enrollment (legal-guardian / custodian qualities, context attributes) | Guardians concerned, the school, relationship history | INV-ZS-066, INV-ZS-067; admissions/enrollment and administration behaviors |
| `ClassChanged` | Academics | Guardians, teachers concerned, history | INV-ZS-061; academic-structure behaviors |
| `AffiliationClosed` | Career / administration | Immediate access removal, author trail kept | INV-ZS-071; teacher-career behaviors |
| `StudentReachedMajority` | Platform (birthdate reached) | The pupil (informed of their rights), the school | INV-ZS-052, ADR-ZS-001; admissions/enrollment behaviors |
| `SubscriptionSuspendedOrTerminated` | Platform | School leadership (read-only, export, deadlines) | ADR-ZS-004; administration behaviors |
| `SessionNotHeld` | Academics / student life (a teacher's absence, a session cancelled or replaced) | The session removed from expected calls, the lesson log flagged, guardians (optional) | ADR-ZS-046; academic-structure and attendance behaviors |
| `AbsenceRectified` | Student life (correcting a call after the notification was sent) | Guardians (a correction notice on the same channel), school leadership | ADR-ZS-056; attendance and communication behaviors |
| `MarkPublished` | Assessments (progressive publication of a grade, per configuration) | The pupil and guardians (notification), dashboards | ADR-ZS-058; assessment and communication behaviors |
| `PhoneNumberChanged` | Platform (a mobile-number change, self-service or at the front desk) | The account holder, schools with an active relationship, the log | ADR-ZS-049; administration and admissions/enrollment behaviors |
| `TransferDeclined` / `TransferCancelled` / `TransferExpired` | Transfers (decline by the destination, cancellation by the guardian or the adult pupil, 30-day expiry) | Origin (remains ACTIVE), destination, guardians | ADR-ZS-063; transfer behaviors |
| `PaymentVoided` | Finance (a reversal entry for a payment or a receipt) | The financial guardian (a void receipt), accounting, the log | ADR-ZS-061; finance behaviors |

---

## 8. Open questions

Open questions touching the domain model are tracked in `spec/open-questions.md` (consolidated across the whole spec in a later phase, Phase 6). The ones already resolved during the earlier PRD review are cited inline above by their resolving decision (e.g. "ADR-ZS-044, open question resolved").

## 9. Traceability

Full baseline-ID → coverage traceability for this document is built in `spec/traceability.md` (a capstone document, built once every chapter exists). This document's own citations above are the interim traceability trail until then.
