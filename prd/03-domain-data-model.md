# ZSchool — Chapter 3: Domain and Data Model

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09) |
| Date | 2026-09-09 |
| Status | Draft PRD — under review |
| Source | PROJECT.md §4, §6.1 to 6.10, §7.1, §7.7, §7.9, §8, §9, §10, §12, §14 (decisions), §17 (glossary) |
| Related files | `prd/00-conventions.md`, `prd/README.md`, `prd/02-actors-personas.md`, `prd/modules/10-administration-onboarding-subscription.md` through `prd/modules/19-teacher-career-network.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/42-review-arbitrations.md` (ARB-xx arbitrations applied in this chapter) |

This chapter describes ZSchool's logical data model (logical level, no physical schema, no SQL): the founding chain, the entity dictionary, the enrollment state machine, invariants, ownership and consent, multi-tenant isolation, and domain events. Entity names in `code` are the canonical names from the consolidated schema in PROJECT.md §6.10.

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
   │           always attached to an enrollment (DEC-18)
   ▼
AUTHORIZATION  relationship-based rights, contextual permissions, consents
               (RG-14, RG-36 to RG-39)
```

| Level | Scope | Representative entities | Structuring rules |
|---|---|---|---|
| Identity | Global | `Person`, `User`, `StudentProfile`, `ParentProfile`, `TeacherProfile`, `StaffProfile` | One account, several profiles; a profile can exist without an account (DEC-03). Identity belongs to the person (RG-07). |
| Relationship | Global to the person, contextualized by tenant | `Enrollment`, `ParentStudentRelationship`, `SchoolMembership` | The link is carried by a dedicated entity, never by the account (DEC-03). |
| Context | Tenant (school) + year | `School`, `AcademicYear`, `Class`, `Section` | The isolation tenant is the school (RG-21, DEC-02). |
| Data | Tenant | every school and financial entity | Every school-related record is attached to an enrollment; no "floating" data (DEC-18). |
| Authorization | Global + tenant | relationship-based rights, permissions, consents | Contextual permissions (RG-36), least privilege (RG-39), logging (RG-38). |

### 1.1 Data-scope boundaries

| Scope | Definition | Example entities | Access conditions |
|---|---|---|---|
| Global (identity) | Data about the person, outside any school | `Person`, `User`, profiles, `ParentStudentRelationship`, `ConsentGrant` | Accessible only through an active relationship or a consent (→ §9); ZSchool is the data controller (DEC-16). |
| Tenant (school) | A school's operational data | `Enrollment`, school-related data, finance, tenant communication | Isolated by tenant key with systematic server-side control (RG-21, INV-17). |
| Group (organization) | Consolidation of several tenants | `Organization` | Consolidated views and shared administration, with no data merge (DEC-02). |
| Platform | Data belonging to ZSchool as operator | `Plan`, `Subscription`, `UsageMetric`, `SupportTicket` | Audited internal access; no access to school data outside a tracked procedure (§8.1). |
| Minimal public | School directory | authorized `School` fields | Limited to: name, city, cycles, education systems, website (RG-23, INV-19); at MVP, a minimal read-only directory limited to name, city, cycles (needed for MVP transfers); education systems and website: V1 |

---

## 2. Entity dictionary

Dictionary of the entities from PROJECT.md §6.10, grouped by domain. "Version" column: availability per §12.

### 2.1 IDENTITY domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `User` | Login and authentication account | **Login identifier** (by default the mobile number; otherwise a platform-generated identifier, readable, not derived from the Massar code — a minor pupil with no phone of their own, a second guardian in a household with a single shared phone, ARB-07), **contact identifiers** (mobile in international E.164 format, the primary contact identifier, DEC-11; email optional), FR/AR language preference (ARB-21), authentication secret, MFA (school-leadership, administrative, accounting and system-administrator roles; optional for teachers and supervisors, ARB-25), trusted devices, sessions | Login identifier unique on the platform; login mobile number unique; email unique if provided; a contact mobile number can be shared by several accounts in the same household (INV-45). Statuses: active, locked, anonymized (an account with no active relationship after 3 years of inactivity, DEC-22; an identity snapshot is kept in the registers, INV-44). Number changes are logged (ARB-08) | A `User` carries 0..N profiles; a profile carries 0..1 `User` (DEC-03) |
| `Person` | The person's civil status, owned by the person (RG-07) | First and last name in dual AR/FR script (DEC-10), date and place of birth, sex, nationality, identity documents (national ID card, strengthened encryption §9) | No natural key; deduplication by strong/weak matching (RG-05, INV-02) | 1 `Person` — 0..1 profile of each type; 1 — N `ParentStudentRelationship` (as a guardian); 1 — N `Enrollment` |
| `StudentProfile` | The pupil facet of the person | Massar code, photo, special needs (optional) | Massar code unique across the whole platform, not mandatory (RG-04, DEC-04, INV-01); protection against code enumeration (§9). Statuses: provisional (no account, awaiting *claim*), linked | 1 `Person` — 0..1; 1 — N `Enrollment`; 1 — N `ParentStudentRelationship` |
| `ParentProfile` | The guardian facet of the person | Occupation (optional), communication preferences | — | 1 `Person` — 0..1; 1 — N `ParentStudentRelationship` |
| `TeacherProfile` | The teacher facet, owned by the teacher (RG-20) | Degrees, subjects, levels, languages, teaching authorization, experience, availability (network, V2) | Experience: verified (periods confirmed by schools) or self-declared "unverified" (RG-20, DEC-33) | 1 `Person` — 0..1; 1 — N `SchoolMembership` |
| `StaffProfile` | The school-staff facet | Roles, clearances | — | 1 `Person` — 0..1; 1 — N `SchoolMembership` |

### 2.2 RELATIONSHIPS domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `ParentStudentRelationship` | Global link between a guardian and a pupil (§6.4) | Link type (father, mother, legal guardian, grandparent, adult sibling, third-party payer — the sole quality "financial guardian," no academic rights, ARB-14 —, other); stackable qualities: legal guardian (*wilaya*), custodian (*hadana*), financial guardian, emergency contact, authorized to pick up the child; access rights; supporting documents (court order, deed) | Unique pair (guardian, pupil). Statuses: active, suspended, revoked — suspension and revocation require a supporting document (RG-14). Legal guardianship and custody recorded separately (RG-14b). Conflicts reported to the school, which arbitrates (RG-16). A court-ordered restriction logged by one school applies only to the schools that attached the order; other schools are notified and log it after checking the document (ARB-11) | 1 guardian — N; 1 pupil — N (no numeric limit, RG-12b); context attributes addable per school, from a closed list: outing authorization, people authorized to pick up the child, communication preferences, enrollment regime, service options (RG-15, OQ-04 resolved) |
| `Enrollment` | Enrollment: pupil × school × school year (§6.3) | Level, track (option), section, class, regime (day pupil, boarder), effective date (attendance, thresholds and exports count from this date, ARB-24), dates, status, activation mode (front desk, campaign, import activation — ARB-02), financial guardian, service options (transport, canteen: operational management in V2; the corresponding fee line is billable from MVP onward via `FeeItem`), acceptance of the school rules and the Law 09.08 privacy notices (deferred to account claiming in the case of import activation), declared prior record (a non-ZSchool school, years, levels, decisions, marked "unverified," ARB-22), a link to the previous enrollment in case of reinstatement (ARB-03), a register identity snapshot (INV-44) | At most one ACTIVE enrollment per (pupil, school year) (RG-08, DEC-21, INV-05). Statuses: state machine §3 (including CANCELLED, ARB-03). Never deleted once it has been ACTIVE (RG-10, INV-06) | N — 1 `StudentProfile`; N — 1 `School`; N — 1 `AcademicYear`; N — 1 `Class` (changes logged in `StudentClassHistory`); 1 — 0..1 `FinancialAccount` |
| `StudentClassHistory` | History of mid-year class changes (RG-11) | Origin class, target class, date, reason, author | Append-only entries (immutable) | N — 1 `Enrollment` |
| `SchoolMembership` | Single affiliation, person × school (DEC-05) | Role(s) (teacher, head, front-office staff, accountant, head supervisor, supervisor, nurse, driver, system administrator…), contract type (permanent, part-time, intern, contractor), dates, permissions | Statuses: invited, active, suspended, ended; activation requires acceptance by both parties (RG-18). Simultaneous active affiliations across schools and several roles within one school are allowed (RG-17, INV-14). Closure → immediate access removal (RG-19, INV-16) | N — 1 `Person` (via a profile); N — 1 `School`; 1 — N `TeacherAssignment` |
| `TeacherAssignment` | A teacher's assignment to a course | Subject × class or group; form teacher (§7.3) | — | N — 1 `SchoolMembership`; N — 1 `Course`; grounds the teacher's permissions (RG-39, INV-34) |
| `TransferRequest` | A pupil's transfer procedure (§7.9) | Pupil, origin school, destination school, documents (leaving certificate…), shared scope (RG-31), Massar reference (procedure outside ZSchool in V1) | Statuses (ARB-22): initiated, validated by the origin, accepted by the destination, activated (the origin closes to TRANSFERRED and the destination activates in a single transaction), declined (by the destination only: capacity, unauthorized cycle, incomplete file; the origin may decline only for a missing legal tutor signature, never on financial grounds, DEC-24), cancelled (by the legal tutor or the adult pupil before activation), expired (30 days after validation with no activation: the origin remains ACTIVE). Any legal guardian, the custodian, or the adult pupil may initiate it; the legal tutor's or the adult pupil's signature is required for validation. Case outside ZSchool: a PDF exit file via a time-limited secure link (DEC-32) | N — 1 `StudentProfile`; N — 1 `School` (origin and destination); a linked consent record (RG-30/31) |
| `ConsentGrant` | A data subject's consent toward a recipient (RG-30/31) | Scope, duration, timestamp, basis (transfer, school passport V2), **grantor** (the signing legal guardian or the adult pupil, with their quality at the time of consent) | Statuses: active, expired, revoked; logged (§9, INV-24) | N — 1 `Person`; recipient: `School` or `Person` |

### 2.3 SCHOOL domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `Organization` | School group: governance, SaaS billing, consolidated reporting | Name, affiliated schools, group administrators | Version: MVP for creation, tenant affiliation and read-only consolidation (ARB-01); V1 for shared administration and group billing | 1 — N `School`; consolidation with no merge (RG-21, DEC-02) |
| `School` | School, isolation tenant (RG-21) | Name AR/FR, authorization number, AREF and provincial education office, authorized cycles, ICE, IF, RC (trade register), business license, CNSS, address, logo, stamp, signatories, bank details, settings (calendar, periods, grading, languages, channels) (RG-22) | Internal tenant identifier; legal ICE reference. Subscription status carried by `Subscription` (trial, active, overdue, terminated, DEC-23) | N — 0..1 `Organization`; 1 — N `Campus`, `Section`, `AcademicYear`, `SchoolMembership`, `Enrollment` |
| `Campus` | Site or campus | Address, rooms, hours | — | N — 1 `School`; 1 — N `Room` |
| `Section` | Education system (national, French mission, international) | Structure model instantiated by the school (RG-24) | — | N — 1 `School`; 1 — N `Cycle` |
| `AcademicYear` | School year (September to June/July) | Label, dates, status (in preparation, in progress, closed) | Structure clonable from year N to N+1 without pupils (RG-25, INV-42) | N — 1 `School`; 1 — N `Enrollment`, `EvaluationPeriod` |
| `Calendar`, `Holiday`, `ScheduleVariant` | The year's calendar, public holidays (Hijri and Gregorian calendars, §10), timetable variants (normal, Ramadan, exams, V1) | Periods, breaks, variants by period | — | Attached to 1 `AcademicYear` |
| `Cycle` | Cycle: preschool, primary, lower secondary, upper secondary | — | Must appear in the school's authorized cycles (RG-22) | N — 1 `Section`; 1 — N `Level` |
| `Level` | Level: 1AP … 2nd Bac | — | — | N — 1 `Cycle`; 1 — N `Class`, `Track` |
| `Track` | Track or option (high school) | — | — | N — 1 `Level` |
| `Class` | Class: a group of pupils at one level | Form teacher | — | N — 1 `Level`; 1 — N `Group`; 1 — N `Enrollment` (current), logged via `StudentClassHistory` |
| `Group` | Language, option or lab-work group | — | — | N — 1 `Class` |
| `Subject` | Subject | Mandatory or optional | Coefficient and language of instruction set by level and track, never globally (RG-26, INV-41) | N — 1 `School`; 1 — N `SubjectLevelConfig`, `Course` |
| `SubjectLevelConfig` | Configuration of a subject for a level and a track | Coefficient, language of instruction | Unique pair (subject, level, track) | N — 1 `Subject` |
| `Course` | Course: subject × class (or group) × teacher | — | — | N — 1 `Subject`, `Class` or `Group`; 1 — N `TeacherAssignment` |
| `Room` | Room or resource | Capacity, features | — | N — 1 `Campus` |
| `Timetable`, `TimetableSlot` | Timetables (V1): weekly grid by class, teacher, room | Slots, variants by period | Teacher/room/class conflict detection (§7.3) | Attached to 1 `AcademicYear`, `Class`, `Course` |
| `GradingScale` | Grading scales | Letter and GPA scales: V2 (international sections) | — | N — 1 `School` |
| `EvaluationPeriod` | Assessment periods: semesters or terms, sub-periods | Dates, closing | Grades locked at closing (§7.5) | N — 1 `AcademicYear` |
| `ComputationRule` | Computation rules: averages, rounding, honors, rank, exclusions | Configured by level or track | — | N — 1 `School`, `Level` |

### 2.4 SCHOOL DATA domain

All of these entities are attached to an enrollment and thus to a context (DEC-18, §6.8); author and data subject as defined by RG-27 (§5).

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `Session` | An expected teaching session (ARB-04): course × date × declared slot; created by the teacher when taking attendance or declared in advance by student life (a simple weekly grid by class, FR-PED-20); in V1, populated automatically from `TimetableSlot` (FR-PED-11) | Course, date, slot, status (expected, called, not held, replaced — FR-PED-21), actual teacher | Uniqueness on (course, date, slot); only one attendance call per triplet; grounds "expected calls" and the attendance rate (ARB-24a). Version: MVP | N — 1 `Course`; 1 — 0..1 attendance call (`AttendanceRecord` grouped by session); 0..1 `TimetableSlot` (V1) |
| `AttendanceRecord` | An attendance event: absence, tardiness, early departure, exclusion (an administrative absence created by a temporary-exclusion sanction, with no notification or attendance-rate impact, ARB-16) | Date, declared session (course × date × slot, ARB-04) or half-day, mobile entry tolerant of network drops (§10); notification: first absence of the day or half-day, a 3-minute hold window, a correction notice after sending (ARB-15) | One session per (course, date, slot) | N — 1 `Enrollment`; justified by 0..N `Justification` |
| `Justification` | Absence justification | Parent attachment, reason, validation; source: the parent (mobile) or the school (entered at the front desk on the guardian's behalf, logged as "entered by the school," ARB-15) | Statuses: submitted, accepted, declined | N — 1 `AttendanceRecord` |
| `Dispensation` | Exemption (e.g. sport) | Period, reason | — | N — 1 `Enrollment` |
| `Assessment` | Assessment: test, homework, exam, school-wide unified test, mock exam, oral, project (the external provincial, regional and national exams are not `Assessment` records: grades are entered or imported via FR-EVA-10/FR-MAS-10, ARB-17) | Type, subject, period, coefficient, scale (any scale other than /20 is normalized to /20 before weighting, ARB-17) | Compliance with the national framework: at least two tests per subject and per semester (§7.12) | N — 1 `Subject`, `EvaluationPeriod`, `Class` or `Group`; 1 — N `Mark` |
| `Mark` | A pupil's grade on an assessment | Value or marker (an unjustified absence defaults to 0, configurable; a justified absence, an exemption, or "not assessed" are excluded from the denominator, ARB-17), remark, **status: draft / published** (progressive publication configurable per school, defaulting to closing time, ARB-17) | Locked by school leadership at period closing (§7.5); not portable or visible to families until published (RG-29). A grade stays attached to the enrollment through a class change (ARB-17) | N — 1 `Assessment`, `Enrollment` |
| `Remark` | Remark or observation | Author, scope | Staff-internal observations are not portable (RG-29) | N — 1 `Enrollment`, period |
| `PeriodResult` | Period results: per-subject and overall averages, rank, honors, remarks | Per assessment period; "excluded from rank" indicator (ARB-17); a subject with no grade is excluded from the overall average with an "NA" mention | Rank is computed within the current class at closing (ARB-17) | N — 1 `Enrollment`, `EvaluationPeriod` |
| `YearDecision` | Year-end decision (RG-09) | Promoted to the next level, repeating, graduated, tracked (into a track: the pupil stays at the school, ARB-03), undetermined (certifying levels, until results are imported, ARB-17) | Carried by the enrollment's COMPLETED status (INV-05); every pupil present at year-end closing moves to COMPLETED with their decision before any departure (ARB-03) | 1 — 1 COMPLETED `Enrollment` |
| `ReportCard` | Period report card | Version, fingerprint, signatory, date, verification QR code | Immutable once published: any correction creates a new version, the old one stays viewable marked "superseded" (RG-33, DEC-09, INV-26). Verification QR: V1 | N — 1 `Enrollment`, `EvaluationPeriod`; 1 — N versions |
| `Transcript` | Annual or cumulative transcript (post-baccalaureate files) | — | A published document, with permanent access (RG-28) | N — 1 `Enrollment` |
| `Certificate` | Certificates and attestations (enrollment, achievement, attendance, departure…) | Type, numbering, stamp, signature, QR | An advanced electronic stamp in V1, a qualified one via a DGSSI-accredited provider in V2 (DEC-30). Never blocked for unpaid fees (DEC-24, INV-39) | N — 1 `Enrollment`, `School` |
| `StudentDocument` | A pupil-file document: birth certificate, photo, vaccination record, court orders… | Type, file, the depositing tenant's key, strict access control (§7.6) | Strengthened encryption (§9); court orders carried by the relationship's supporting documents (RG-14); visible only to the school that deposited it; identity documents are shared via the transfer profile (RG-31), never automatically (ARB-13) | N — 1 `StudentProfile`; N — 1 `School` (tenant) |
| `Incident` | Disciplinary fact | Date, severity, description | Not portable (RG-29, DEC-08); kept for end-of-schooling + 2 years then anonymized (DEC-22) | N — 1 `Enrollment` |
| `Sanction` | Graduated sanction | Type, duration, decision | Not portable (RG-29, RG-31) | N — 1 `Incident` |
| `DisciplinaryCouncil` | Disciplinary council | Date, members, minutes, decision (may result in EXPELLED, §6.3) | V1 | N — 1 `Class`, `Enrollment` |
| `ConductGrade` | Conduct grade | Period, value | Not portable (RG-29) | N — 1 `Enrollment`, `EvaluationPeriod` |
| `HealthRecord` | Health record (V2): allergies, treatments, medical contacts, vaccinations | Sensitive data, tenant key | One record per (pupil × school), attached to the current enrollment (ARB-13, DEC-18); prior CNDP authorization (F112, §9); never transferred automatically (DEC-08): the new school starts from an empty record; end of schooling at that school + 1 year, then deletion (DEC-22) | 1 — 0..1 per (`StudentProfile`, `School`); attached to the current `Enrollment` |

### 2.5 FINANCE domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `FeeSchedule` | Fee schedule by year, level, section and option (§7.7) | Tariffs, ancillary fees | The Law 59.21 parent contract generated, electronically signed (DEC-30) and archived; no mid-year tariff change on an active enrollment (§7.7, INV-40) | N — 1 `School`, `AcademicYear`, `Level` |
| `FeeItem` | Fee line | Tuition, enrollment, transport, canteen, activities | — | N — 1 `FeeSchedule` |
| `Discount` | Discount | Automatic sibling discount (§7.7), negotiated discounts | Approval required for negotiated discounts | N — 1 `Enrollment` or `FeeSchedule` |
| `Scholarship` | Scholarship | Amount, criteria, approval | V1 | N — 1 `Enrollment` |
| `Invoice` | Compliant invoice | ICE, IF, RC (trade register), business license, VAT mentions (RG-22, §7.7) | Tamper-proof sequential numbering per school (§7.7, INV-40) | N — 1 `Enrollment`, `FinancialAccount`; 1 — N `Installment` |
| `Installment` | An installment in a monthly, term-based or annual plan | Amount, due date | Statuses: upcoming, paid, overdue | N — 1 `Invoice`; 1 — N `Payment` |
| `Payment` | Cash collection | Methods: cash (cash session), cheque (due date, deposit, bounced), bank transfer, direct debit (V2, via the bank), online: Fatourati from V1 onward (per DEC-31), card with a stored card in V2 (DEC-31) | Reconciled against 0..N installments; **allocable across several `FinancialAccount` records** (settling a sibling group in a single payment, ARB-20); voided by a logged reversal entry, with the original number kept (ARB-20) | N — N `Installment` or `Invoice` (allocation); 1 — 0..1 `Receipt` |
| `Receipt` | Payment receipt | Tamper-proof sequential number (MVP, INV-40), amount, children and installments covered (a family receipt, ARB-20), printable and sent to the parent (§7.7) | A numbered void receipt in case of a reversal entry | N — 1 `Payment` |
| `Refund` | Refund | Reason, amount | V1 (full finance) | N — 1 `Payment` |
| `Dunning` | Graduated reminder (SMS, WhatsApp, letter) | Stage, date, channel | Triggered by an overdue installment (§7.7) | N — 1 `Enrollment` or `FinancialAccount` |
| `CashSession` | Cash session | Opening, closing, variance, cash collections | V1 | N — 1 `School`; 1 — N `Payment` |
| `FinancialAccount` | Financial account per enrollment and per financial guardian (§6.10) | Balance, entries | Survives the enrollment's closure until settled (RG-12, INV-08); split between two payers and third-party payment possible (§7.7); always attached to a `ParentStudentRelationship` carrying the "financial guardian" quality (third-party payer included, ARB-14); default proration: a started month is owed in full, with a daily-proration option (ARB-20) | N — 1 `Enrollment` and/or financial guardian; 1 — N `Invoice`, `Payment` |

### 2.6 COMMUNICATION domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `Announcement` | Announcement | Target: school, cycle, level, class; bilingual content (§7.8) | — | N — 1 `School` |
| `Thread` | Parent-teacher discussion thread (MVP, in-app, ARB-21) | Moderated by default: the teacher or the school opens it, the parent replies; parent-initiated opening configurable; school-leadership viewing flagged to users (DEC-34) | — | N — 1 `Enrollment` (tenant context); participants: `ParentStudentRelationship` and `TeacherAssignment`; 1 — N `Message` |
| `Message` | Individual or thread message | Content, channel | — | N — 1 `Thread` or recipient |
| `Notification` | Notification | Channels: in-app, SMS, WhatsApp utility (MVP: presence notifications); push, broader WhatsApp, email (V1); routed by message type, recipient language and preferences (DEC-12, DEC-36, ARB-21); "STOP" opt-out limited to reminders and announcements; send windows excluding presence and security messages | — | N — 1 recipient; 1 — 0..N `DeliveryLog` |
| `DeliveryLog` | Delivery record | Channel, status (sent, delivered, read), cost | SMS/WhatsApp costs charged to the school (bundles, §7.8) | N — 1 `Notification` |
| `Meeting/Convocation` | Summons or appointment (parent-teacher meetings) | Date, subject, participants | V1 (student-life and discipline summonses) | N — 1 `Enrollment`, `School` |
| `Event` | School event or outing | Electronic parental authorization (§7.8) | V1 | N — 1 `Class`, `School`; 1 — N consents |

### 2.7 PLATFORM domain

| Entity | Role | Key attributes | Identifiers · uniqueness · statuses | Relationships and cardinalities |
|---|---|---|---|---|
| `Subscription` | A school's or group's subscription | Paying customer: the school (DEC-13) | Statuses: trial, active, overdue (read-only after a grace period), terminated (export, retention then deletion, DEC-23) | N — 1 `School` or `Organization`; 1 — N `UsageMetric` |
| `Plan` | Single pricing plan, all modules included (§11, DEC-28) | Price per active pupil per month | A single active plan | 1 — N `Subscription` |
| `ModuleActivation` | A module's availability for a tenant | Later modules activate as they ship (§11) | V1 | N — 1 `School` |
| `UsageMetric` | Billing metrics | Active pupils (counted from September to June), SMS, WhatsApp, storage | Monthly billing base in MAD (DEC-13, DEC-28) | N — 1 `Subscription` |
| `AuditLog` | Audit log | Author, context, timestamp, action | Immutable and exportable (§9); every write and every sensitive view logged (RG-38, INV-33); 5 years (DEC-22). Version: immutable and exportable in V1; at MVP, minimal write-level history (corrections logged at the record level, founder arbitration, OQ-07) | Per tenant + platform operations (support, merges); D4 / ARB-25 arbitration: immutable write-level history at the record level at MVP, a sensitive-view log and export in V1 |
| `DataExport` | Data export | Individuals' rights (access, portability, Law 09.08), full export on termination (DEC-23) | V1 | N — 1 `School` or `Person` |
| `MergeOperation` | Merging two profiles | Author (support or an authorized role), source and target profiles, confirmation by a legal guardian | An end-to-end audited operation (RG-06, INV-03); MVP, reserved to ZSchool support (ARB-01); an authorized school-side role in V1 | N — 1 `Person` (target) |
| `SupportTicket` | Support ticket | Temporary, audited support access to a tenant (§8.1), with the head's explicit in-app approval, time-boxed (ARB-25) | MVP | N — 1 `School` |

---

## 3. Enrollment state machine (`Enrollment`)

### 3.1 States

```text
CANDIDATE ──► PRE-ENROLLED ──► ACTIVE ──┬──► SUSPENDED ──┬──► (back to) ACTIVE
 (admission       (deposit /       ▲    │                └──► TRANSFERRED / WITHDRAWN / EXPELLED / COMPLETED (ARB-03)
  file)            reservation)    │    ├──► TRANSFERRED   (mid-year departure)
      │                 │          │    ├──► WITHDRAWN     (mid-year departure)
      ▼                 ▼          │    ├──► EXPELLED
   CANCELLED ◄──────────┘          │    └──► COMPLETED     (year-end decision, RG-09;
 (terminal state, ARB-03)          │                        every pupil present at closing)
                                   │
 (import, data reprise) ───────────┘  "import activation", FR-ADM-06 (ARB-02)
```

| State | Meaning | Entry conditions |
|---|---|---|
| CANDIDATE | Admission file submitted, decision pending | File submitted (online or at the front desk); available with the admissions module (V1; the MVP starts at PRE-ENROLLED, §12) |
| CANCELLED | Terminal state of a cancelled CANDIDATE or PRE-ENROLLED enrollment (ARB-03, OQ-01 resolved) | Cancellation by the school or the guardian, with a reason and a date; the admissions-campaign history is kept; no school-related data attached |
| PRE-ENROLLED | A place reserved by deposit, the file being completed | Admission accepted |
| ACTIVE | The pupil is enrolled at the school for the year | See 3.2 |
| SUSPENDED | A temporary administrative measure by school leadership (a situation being sorted out, a long conservatory measure); a temporary-exclusion sanction does not create a SUSPENDED state but `AttendanceRecord` entries of type "exclusion" (ARB-16) | A decision by the school, with a reason and a date (V1; the MVP state machine in §12 is limited to pre-enrolled, active, completed, transferred, withdrawn, completed by CANCELLED and import activation) |
| TRANSFERRED | A validated departure to another school **mid-year**; a departure at the following start of year results in COMPLETED with no N+1 enrollment at the origin, with a `TransferRequest` carrying an effective date (ARB-03) | Transfer procedure §7.9, activation of the receiving enrollment |
| WITHDRAWN | Departure with no known destination, **mid-year** (ARB-03) | Departure declared, with a reason and a date (RG-10) |
| EXPELLED | Final disciplinary expulsion | Disciplinary council decision (V1) |
| COMPLETED | End of the school year: every pupil present at closing, including those who do not re-enroll and those who are "tracked" (choosing a track, who stay at the school, ARB-03) | Year-end *rollover* with the RG-09 decision (MVP wave 2, FR-INS-21, ARB-01) |

### 3.2 Legal transitions

| From → To | Triggering event | Conditions | Effects |
|---|---|---|---|
| (creation) → CANDIDATE | Application filed | — | The file is created; identity reused where a match is found (RG-05) |
| CANDIDATE or PRE-ENROLLED → CANCELLED | Cancellation | Reason and date; the deposit is refunded or kept per the fee schedule (FR-FIN) | A terminal, archived state (ARB-03); the (pupil, year) pair is freed |
| (import) → ACTIVE | **Import activation** (FR-ADM-06, data reprise, ARB-02) | Reserved for bulk import; the file must carry at least one legal guardian and one financial guardian; logged with reason "data reprise" and its author; acceptance of the school rules and the Law 09.08 privacy notices is collected when the account is claimed, with a reminder | Enrollment ACTIVE as of the imported effective date; the installment plan is carried over with amounts already paid; the parent contract is generated when the account is claimed |
| CANDIDATE → PRE-ENROLLED | Admission accepted, a deposit (or reservation) collected | The admission decision is logged; collecting the deposit is the condition for moving to PRE-ENROLLED, as set by the deposit/reservation rule (§6.3); otherwise, a waiting list | The enrollment enters the preparation list; the initial payment then conditions PRE-ENROLLED → ACTIVE. At *rollover* (FR-INS-21), N+1 enrollments are created only in PRE-ENROLLED, and any pupil who already has an N+1 enrollment in a non-terminal state is skipped (ARB-03) |
| PRE-ENROLLED → ACTIVE | Complete file + initial payment | A complete file; the deposit or enrollment fee collected; at least one active legal guardian and one financial guardian (RG-13, INV-09); the school rules and Law 09.08 privacy notices accepted (§7.2); no other ACTIVE enrollment for the same (pupil, year) pair (RG-08, INV-05) | The parent contract is generated and archived (Law 59.21, FR-FIN-02, MVP, ARB-01); the installment plan is created |
| ACTIVE → SUSPENDED | A temporary administrative measure | Reason and dates logged by the school (V1) | Access and services follow the decision; the enrollment still holds the (pupil, year) pair, INV-05 |
| SUSPENDED → TRANSFERRED, WITHDRAWN, EXPELLED or COMPLETED | The same events as from ACTIVE (ARB-03) | The same conditions as from ACTIVE; the suspension measure closes at the date of the transition | The same effects as from ACTIVE |
| SUSPENDED → ACTIVE | End of the measure | The set term reached, or a reinstatement decision (V1) | Return to the prior status |
| ACTIVE → TRANSFERRED | Transfer **activated** (mid-year departure) | Validation by the origin school (§7.9); acceptance by the destination; a leaving certificate generated, signed by the legal tutor or the adult pupil; the shared scope chosen by the legal guardian or the adult pupil (RG-31, INV-23); a financial balance is not a blocker (RG-12, DEC-24); the Massar reference logged | The origin closes and the destination activates in a single transaction (ARB-22); the receiving enrollment is created on the same identity (INV-43); on decline, cancellation or expiry (30 days) of the request, the origin remains ACTIVE |
| ACTIVE → WITHDRAWN | Departure with no destination | Reason and date logged (RG-10) | Closure; the financial relationship survives (RG-12, INV-08); an exit file is available (DEC-32) |
| ACTIVE → EXPELLED | Disciplinary expulsion | Disciplinary council decision logged (V1) | Closure with a reason; official documents not blocked for unpaid fees (DEC-24) |
| ACTIVE → COMPLETED | Year-end closing | Year-end decision entered (RG-09): promoted, repeating, graduated, tracked (stays at the school), undetermined (certifying levels, updated once results are imported before the end of the INV-25 grace period, ARB-17); **mandatory for every pupil present at closing, before any year-end departure** (ARB-03) | *Rollover*: N+1 enrollments created in PRE-ENROLLED (MVP wave 2, FR-INS-21, ARB-01); report cards and decisions archived |

Mid-year class change: no new `Enrollment` and no state transition; an entry is written in `StudentClassHistory` (RG-11, INV-07).

**Reinstatement** (ARB-03, OQ-02 resolved): a new enrollment for the same (pupil, school year) pair is allowed once the prior enrollment is in a terminal state other than SUSPENDED (TRANSFERRED, WITHDRAWN, EXPELLED, CANCELLED), with reason "reinstatement" and a link to the previous enrollment; INV-05 is unchanged (only ACTIVE and SUSPENDED hold the pair).

### 3.3 Forbidden transitions and constraints

| Forbidden | Rule |
|---|---|
| Deleting an enrollment that has been ACTIVE | Never; closure is mandatory with a reason and a date (RG-10, DEC-06, INV-06) |
| Cancelling an ACTIVE enrollment or beyond | Only CANDIDATE or PRE-ENROLLED enrollments can be cancelled (RG-10) |
| Two ACTIVE enrollments for the same (pupil, school year) pair | Forbidden platform-wide (RG-08, DEC-21, INV-05) |
| Reverse transition from TRANSFERRED, WITHDRAWN, EXPELLED, COMPLETED or CANCELLED | No return transition; a reprise goes through a new enrollment linked to the previous one (reinstatement, ARB-03) |
| A year-end departure closed as TRANSFERRED or WITHDRAWN | Forbidden: every pupil present at closing moves to COMPLETED with their decision; TRANSFERRED and WITHDRAWN are reserved for mid-year departures (ARB-03) |
| Activating ACTIVE outside the PRE-ENROLLED → ACTIVE conditions | Forbidden, except for import activation, reserved to FR-ADM-06 and logged (ARB-02) |
| Creating a new identity during a transfer | Forbidden: the receiving enrollment attaches to the existing `Person` (§7.9, INV-43) |
| School data detached from the enrollment after closure | Data stays attached to the closed enrollment, read-only (RG-32, INV-25); the financial relationship survives (RG-12, INV-08) |

---

## 4. Model invariants

Constraints that every implementation must guarantee at all times. `INV-NN` counter starting at 01, an exclusive namespace of this file (conventions §2); INV-44 and INV-45 added by the review of 09/09/2026 (`prd/cross-cutting/42-review-arbitrations.md`). Scope: Global (identity), Tenant (school), or both.

| ID | Invariant | Source | Scope | Version |
|---|---|---|---|---|
| INV-01 | The Massar code, when provided, is unique across the whole platform | RG-04, DEC-04 | Global | MVP |
| INV-02 | Strong matching (identical Massar code) is proposed automatically, never imposed; weak matching (first name + last name + date of birth + a guardian's phone number): a probable-duplicate alert, never automatic linking | RG-05 | Global | MVP |
| INV-03 | Every profile merge is an audited `MergeOperation`, reserved to ZSchool support or an authorized role, with confirmation by a legal guardian | RG-06 | Global | MVP (ZSchool support, ARB-01); V1 (authorized school-side role) |
| INV-04 | Any school with an active enrollment can correct the identity; the correction is logged and reported to other schools concerned | RG-07 | Global | MVP |
| INV-05 | A (pupil, school year) pair holds at most one ACTIVE enrollment; a SUSPENDED enrollment still holds the pair and blocks any new activation; an enrollment in any other terminal state frees the pair for a linked reinstatement (ARB-03) | RG-08, DEC-21 | Global | MVP |
| INV-06 | No enrollment that has been ACTIVE is deleted: closure with a reason and a date; cancellation (terminal, archived CANCELLED state) is reserved to the CANDIDATE and PRE-ENROLLED states | RG-10, DEC-06 | Tenant | MVP |
| INV-07 | A mid-year class change produces an append-only entry in `StudentClassHistory`, never a new enrollment or a change to the enrollment itself | RG-11 | Tenant | MVP |
| INV-08 | The financial relationship survives the enrollment's closure: `FinancialAccount`, balances and documents stay active until settlement | RG-12 | Tenant | MVP |
| INV-09 | Every enrollment carries at least one active legal guardian and one financial guardian (who may be the same person or a third party) | RG-13 | Tenant | MVP |
| INV-10 | By default, every legal guardian and the custodian have access to school information; a parent's access may be restricted only by a court order logged by the school with an attached document and full traceability; it applies only to the schools that attached the order, others being notified (ARB-11) | RG-14 | Tenant | MVP |
| INV-11 | The "legal tutor" and "custodian" qualities are recorded separately; the legal tutor is the required signatory for enrollment, transfer and the leaving certificate | RG-14b | Global | MVP |
| INV-12 | The parent-pupil relationship is global; each school may add context attributes (outing authorization, pickup, communication preferences) to it without duplicating the relationship | RG-15 | Global + Tenant | MVP |
| INV-13 | An account belongs to a single person; it can carry several profiles; a profile can exist without an account; no account is shared between two people | RG-03, RG-12b, DEC-03 | Global | MVP |
| INV-14 | Several simultaneous active affiliations at different schools, and several roles within one school, are allowed | RG-17, DEC-05 | Global | MVP |
| INV-15 | An affiliation becomes active only after acceptance by both parties (invitation or application) | RG-18 | Tenant | MVP |
| INV-16 | On an affiliation's closure, access to the school's data is removed immediately; the data produced stays within the school, attributed to its author | RG-19 | Tenant | MVP |
| INV-17 | Every operational record carries its tenant (school) key, and every access is systematically controlled server-side | RG-21, DEC-02 | Tenant | MVP |
| INV-18 | Global entities (identities, relationships) are accessible only through an active relationship or a consent | RG-30, RG-36, PROJECT.md §9 | Global | MVP |
| INV-19 | The public school directory is limited to the fields: name, city, cycles, education systems, website; every other field stays private | RG-23 | Global | MVP (name, city, cycles); V1 (additional fields) |
| INV-20 | The pupil and their guardians (per their rights) keep permanent read access to their published school data (report cards, transcripts, absences, official documents), even after departure, within retention-period limits (DEC-22) | RG-28, DEC-07 | Global | MVP |
| INV-21 | Internal data (unpublished grades, drafts, internal remarks, deliberations, ongoing disciplinary proceedings, staff observations) is never portable or visible outside the authoring school | RG-29 | Tenant | MVP |
| INV-22 | No automatic access between schools; a new school only sees, from a former one, what was consented to be shared and the official documents exchanged in a transfer procedure | RG-30, DEC-07 | Global | MVP |
| INV-23 | The default transfer profile includes: identity, Massar code, schools attended, years, levels and year-end decisions, official documents; detailed grades, absences and disciplinary data: explicit sharing required; health data: never transferred automatically | RG-31, DEC-08 | Global | MVP |
| INV-24 | Every sharing consent is logged, bounded by a scope and a duration, and revocable; revocation covers future access | RG-30, RG-31, PROJECT.md §9 | Global | MVP |
| INV-25 | After an enrollment closes, the origin school's data is read-only; correction remains possible during a grace period (default: 60 days), and only through an audited procedure thereafter | RG-32 | Tenant | MVP |
| INV-26 | A published report card is fixed (version, fingerprint, signatory, date); any correction creates a new version, the old one staying viewable marked "superseded"; a QR code allows authenticity verification | RG-33, DEC-09, G-19 | Tenant | MVP (QR: V1) |
| INV-27 | Every school-related record is attached to an enrollment (and thus to a school, year, level and class context); no school-related data "floats" on the identity | DEC-18, PROJECT.md §6.8 | Tenant | MVP |
| INV-28 | Historical retention takes priority for official data, per the durations set by type (DEC-22); the right to erasure translates into anonymizing the identity, never into deleting the school's registers | RG-34, DEC-22 | Global + Tenant | MVP |
| INV-29 | A school only sees of a teacher's record what the teacher shares and their verified affiliation periods; any experience declared outside the platform is marked "unverified"; no rating of a teacher by one school is visible to another | RG-35, DEC-25, DEC-33, G-23 | Global | V1 (network: V2) |
| INV-30 | The model contains no cross-rating or recommendation entity between teachers and schools, at any version of the roadmap | DEC-25, PROJECT.md §7.10 | Global | All |
| INV-31 | Permissions are contextual: the same account carries distinct rights per (profile, school) pair | RG-36 | Global | MVP |
| INV-32 | School-side roles are made up of fine-grained permissions by module and by scope (class, level, school), based on editable standard roles | RG-37, DEC-17 | Tenant | MVP |
| INV-33 | Every write action and every view of sensitive data (file, health, finance, discipline) is logged with author, context and timestamp, in an immutable, exportable log | RG-38, PROJECT.md §9 | Tenant | V1 (MVP: immutable write-level history at the record level, arbitration D4 / ARB-25, OQ-07 resolved) |
| INV-34 | Least privilege applies by default: a teacher's access to pupils derives from their active `TeacherAssignment` records; a supervisor only sees their assigned cycles | RG-39 | Tenant | MVP |
| INV-35 | Having turned 18, the pupil becomes the account holder and holds their rights; they may restrict parental access to academic, disciplinary and health data; every restriction is logged and reported to the school; the financial guardian keeps financial access while they remain liable for fees | RG-02, DEC-20 | Global | MVP (confirmed, ARB-10; OQ-06 resolved) |
| INV-36 | A pupil's personal access is activated from the level set by the school (default: 1AC), on activation by a legal guardian | RG-01 | Tenant | MVP |
| INV-37 | An account's primary contact identifier is the mobile phone number (international E.164 format); email is optional and never required for a parent, a pupil or a teacher; the login identifier is distinct from the contact identifier (INV-45) | DEC-11, ARB-07 | Global | MVP |
| INV-38 | Upon a school's termination: a full export delivered, read-only access for 90 days, operational data deleted 12 months later; global identities and individuals' access to their published documents are maintained | DEC-23, PROJECT.md §7.1 | Tenant | V1 |
| INV-39 | No state of the model blocks generating the certificate of enrollment, the leaving certificate, report cards or transcripts for unpaid fees; arrears are only expressed as an alert on the file and an account statement | DEC-24, PROJECT.md §7.7 | Tenant | MVP |
| INV-40 | Receipt numbering (MVP) and invoice numbering (V1) are sequential and tamper-proof per school, with a voiding done via a numbered reversal entry; the contractual tariff of an active enrollment is fixed for the whole year (Law 59.21 contract) | RG-22, DEC-28, PROJECT.md §7.7, ARB-20 | Tenant | MVP (receipts, fixed tariff); V1 (invoices) |
| INV-41 | A subject's coefficient and language of instruction are carried by `SubjectLevelConfig` (level × track), never by the subject alone | RG-26 | Tenant | MVP |
| INV-42 | Cloning the structure from year N to N+1 copies structural elements (levels, subjects, coefficients, scales) and never copies enrollments or pupils | RG-25 | Tenant | MVP (wave 2 — year-end close, JAL-07, ARB-01) |
| INV-43 | A transfer never creates a new identity: the receiving enrollment attaches to the pupil's existing `Person` | PROJECT.md §7.9, RG-04 | Global | MVP |
| INV-44 | On anonymizing a global identity (an account with no active relationship after 3 years, right to erasure), each school keeps in its enrollment register an identity snapshot (first and last name in dual script, date of birth, Massar code) under its responsibility as data holder, for the register's permanent retention period; anonymization applies only to `Person` and `User` | DEC-22, RG-34, ARB-12 | Global + Tenant | MVP |
| INV-45 | An account's login identifier is distinct from its contact identifiers: by default the mobile number, otherwise a platform-generated identifier (a minor pupil with no phone of their own, activated by a legal guardian with an OTP sent to that guardian's number; a second guardian in a household with a single shared phone); a contact mobile number can be shared by several accounts in the same household without any account being shared between two people; foreign numbers are accepted in E.164 format; migration to a personal number is possible at any time and is logged | RG-01, RG-12b, DEC-11, ARB-07 | Global | MVP |

---

## 5. Ownership, consent and retention

Principle (RG-27): every school-related record has an **author** (the school, the operational data holder, within its own context) and a **data subject** (the pupil, the beneficiary, represented by their guardians). The table below cross-references data type, portability and retention.

| Data type | Author (data holder) | Data subject | Portability / access after departure | Default duration (DEC-22) | Basis for inter-school sharing |
|---|---|---|---|---|---|
| Identity (civil status, photo, Massar code) | The person (RG-07); corrected by any school with an active enrollment | The pupil, via their guardians | Shared per the transfer profile (RG-31); permanent read access | Permanent for as long as an active relationship or consent exists; an account with no active relationship is anonymized after 3 years (DEC-22); the school keeps an identity snapshot in its register for the register's permanent retention period (INV-44, ARB-12) | Consent (RG-30) + official transfer documents (RG-31) |
| Official documents (certificates, attestations) | The authoring school | The pupil | Permanent read access (RG-28); a PDF exit file outside the platform (DEC-32) | Permanent (registers and official documents) | Default transfer profile (RG-31) |
| Report cards, transcripts, year-end decisions | The authoring school | The pupil | Permanent read access (RG-28); the year-end transcript included in the transfer profile (RG-31) | Permanent | The year-end transcript is included by default; beyond that, explicit sharing (RG-30/31) |
| Unpublished grades, drafts, deliberations | The authoring school | — | Never portable or visible (RG-29) | End of schooling + 2 years, then anonymized (aligned with student life, OQ-03 resolved, ARB-26) | None (RG-29) |
| Attendance and justifications | The school (teacher, student life) | The pupil | Permanent read access per RG-28, within the retention-period limit | End of schooling + 2 years, then anonymized | Explicit sharing only (RG-31) |
| Discipline (incidents, sanctions, councils, conduct) | The authoring school | The pupil | Not portable (RG-29, RG-31, DEC-08) | End of schooling + 2 years, then anonymized | None by default |
| Health (a record per pupil × school, ARB-13) | The authoring school (V2) | The pupil | Never transferred automatically (DEC-08); restricted access | End of schooling at that school + 1 year, then deleted | Never automatic; explicit consent under a framework (§9, F112) |
| Finance (invoices, installments, payments, receipts) | The authoring school | The financial guardian and the pupil | The financial guardian keeps access to their payment history; an account statement is issued only to the financial guardian on departure (RG-12, §7.7, ARB-20) | 10 years after the account is settled (General Tax Code art. 211, INV-08, ARB-25) | An account statement on departure; never an automatic transfer |
| Messages and notifications | The school / thread authors | Participants | Eligible for the right to erasure (RG-34) | 2 years | None |
| Audit logs | Platform and tenant | — | Not portable; exportable for audit | 5 years | None |

---

## 6. Multi-tenant isolation and access to global entities

| Rule | Content |
|---|---|
| Tenant key | The isolation tenant is the school (`School`); every operational record carries the tenant key, and access is systematically controlled server-side, never client-side (RG-21, DEC-02, INV-17) |
| School group | The `Organization` provides consolidated views and shared administration; it never opens a merge of tenant data (RG-21, DEC-02) |
| Global entities | `Person`, `User`, profiles, `ParentStudentRelationship`, `ConsentGrant`: accessible only through an active relationship (enrollment, affiliation, parental link) or a consent (§9, INV-18); a multi-school parent sees their children across all their schools from a single account (RG-03, RG-36) |
| Subscription status | Overdue subscription: read-only after a grace period; termination: full export, 90 days read-only, operational data deleted at 12 months, identities and published documents maintained (DEC-23, INV-38) |
| Encryption | In transit and at rest; strengthened for identity documents, health data and court orders (§9) |
| Location | Production and backups in Morocco; no pupil data leaves the country except for messaging flows governed by F118 (DEC-26) |
| Audit log | Immutable, exportable, kept for 5 years; logs writes and sensitive views with author, context, timestamp (RG-38, §9, INV-33; MVP: immutable write-level history, D4 / ARB-25); every support access goes through a logged ticket with the head's approval (§8.1, ARB-25) |
| Anti-enumeration protection | Search and matching by Massar code protected against identity enumeration (§9) |

---

## 7. Notifiable domain events

Events produced by the modules (conventions §2 codes), consumed by communication (detailed in `FR-COM`) and student life (`FR-VSC`). Every send produces a `Notification` and a `DeliveryLog` (channel, status, cost). Event identifiers are kept in their original French PascalCase form, unchanged across the whole PRD (see the translation note below).

| Event | Producer | Consumers and effects | References |
|---|---|---|---|
| `AbsenceRecorded` | Student life (a validated call) | Guardians (SMS/WhatsApp/push, under 5 min), teacher, school leadership | RG-13, RG-14; §10; `FR-VSC`, `FR-COM` |
| `JustificationSubmitted` / `JustificationValidated` | Parent (PRT); student life | Student life (processing queue); parent (status) | §7.4; `FR-VSC` |
| `AbsenceThresholdReached` | Student life | School leadership, head supervisor, guardians | §7.4; `FR-VSC` |
| `IncidentRecorded` / `SanctionNotified` | Student life | Legal guardians and the custodian (per their rights), school leadership | RG-14; §7.4; `FR-VSC`, `FR-COM` |
| `SummonsIssued` | Student life or school leadership | Parent, with read tracking | §7.8; `FR-COM` |
| `PeriodClosed` | Assessments | Teachers (entry lock), school leadership | §7.5; `FR-EVA` |
| `ReportCardPublished` | Assessments | Pupil and guardians (notification), QR available | RG-28, RG-33; `FR-EVA`, `FR-COM` |
| `PaymentReceived` | Finance | Parent (receipt), accounting, balance update | §7.7; `FR-FIN` |
| `InstallmentOverdue` / `ReminderSent` | Finance | Parent (graduated reminder), school leadership (unpaid fees) | §7.7; `FR-FIN`, `FR-COM` |
| `DocumentGenerated` | Documents | Parent (delivery, verification QR) | §7.6, DEC-24; `FR-DOC` |
| `EnrollmentStatusChanged` | Enrollment | School leadership, parents (per status), dashboards | RG-09, RG-10; `FR-INS` |
| `ProbableDuplicateDetected` | Platform (weak matching) | The school concerned, support (alert without linking) | RG-05; `FR-INS` |
| `IdentityClaimed` (*claim*) | Parent or teacher | The school that created the provisional profile | §6.2; `FR-INS` |
| `IdentityCorrected` | A school with an active enrollment | Other schools concerned, guardians | RG-07; `FR-INS` |
| `MergeCompleted` | Support or an authorized role | Schools concerned, the legal guardian (confirmation), audit | RG-06; `FR-INS` |
| `TransferValidated` | Transfers | Origin (closes to TRANSFERRED), destination (identity received), parents | §7.9, INV-43; `FR-TRA` |
| `ConsentGranted` / `ConsentRevoked` | Parent or adult pupil | The recipient school, the audit log | RG-30/31; `FR-TRA` |
| `AccessRestrictionRecorded` | Administration or platform (access restriction logged: a court order targeting a parent, a restriction set by the adult pupil) | The guardian or parent concerned (a note, scope, reference to the decision), other guardians, school leadership, the audit log | RG-14, RG-02; `FR-ADM`, `FR-INS` |
| `GuardianConflictReported` | Enrollment (conflicting requests between guardians) | The school (the operational arbitrator, ZSchool does not decide), the guardians concerned | RG-16; `FR-INS` |
| `RelationshipQualityChanged` | Enrollment (legal-guardian / custodian qualities, context attributes) | Guardians concerned, the school, relationship history | RG-14b, RG-15; `FR-INS`, `FR-ADM` |
| `ClassChanged` | Academics | Guardians, teachers concerned, history | RG-11; `FR-PED` |
| `AffiliationClosed` | Career / administration | Immediate access removal, author trail kept | RG-19; `FR-CAR` |
| `StudentReachedMajority` | Platform (birthdate reached) | The pupil (informed of their rights), the school | RG-02, DEC-20; `FR-INS` |
| `SubscriptionSuspendedOrTerminated` | Platform | School leadership (read-only, export, deadlines) | DEC-23; `FR-ADM` |
| `SessionNotHeld` | Academics / student life (a teacher's absence, a session cancelled or replaced) | The session removed from expected calls, the lesson log flagged, guardians (optional) | ARB-05; `FR-PED`, `FR-VSC` |
| `AbsenceRectified` | Student life (correcting a call after the notification was sent) | Guardians (a correction notice on the same channel), school leadership | ARB-15; `FR-VSC`, `FR-COM` |
| `MarkPublished` | Assessments (progressive publication of a grade, per configuration) | The pupil and guardians (notification), dashboards | ARB-17; `FR-EVA`, `FR-COM` |
| `PhoneNumberChanged` | Platform (a mobile-number change, self-service or at the front desk) | The account holder, schools with an active relationship, the log | ARB-08; `FR-ADM`, `FR-INS` |
| `TransferDeclined` / `TransferCancelled` / `TransferExpired` | Transfers (decline by the destination, cancellation by the guardian or the adult pupil, 30-day expiry) | Origin (remains ACTIVE), destination, guardians | ARB-22; `FR-TRA` |
| `PaymentVoided` | Finance (a reversal entry for a payment or a receipt) | The financial guardian (a void receipt), accounting, the log | ARB-20; `FR-FIN` |

**Translation note (ARB-26)**: domain event identifiers are cited from more than twenty files across the PRD. To keep every cross-reference valid, they are kept in their original French PascalCase spelling everywhere, including in this English edition; only their descriptions were translated. A future English-language rename of these identifiers, if desired, should be done as a single coordinated pass across the whole corpus.

---

## 8. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | **Resolved — ARB-03**: an archived terminal CANCELLED state (§3.1, §3.2). Original question: should cancelling a CANDIDATE or PRE-ENROLLED enrollment create an archived terminal CANCELLED state, or allow a logical deletion? | RG-10 only excludes deletion after ACTIVE; the baseline does not list a CANCELLED state. An archived terminal state is recommended to preserve the admissions-campaign history |
| OQ-02 | **Resolved — ARB-03**: a new enrollment linked to the previous one (reason "reinstatement") once the prior enrollment is in a terminal state other than SUSPENDED (§3.2). Original question: reinstating a pupil at their origin school after a TRANSFERRED or WITHDRAWN status within the same school year | No reverse transition is defined in §6.3; a new ACTIVE enrollment for the same (pupil, year) pair is blocked as long as the prior enrollment is ACTIVE or SUSPENDED (INV-05) — to be clarified |
| OQ-03 | **Resolved — ARB-26**: aligned with student life (end of schooling + 2 years, then anonymized; §5). Original question: retention period for unpublished grades, drafts, internal remarks and deliberations | Not explicitly covered by DEC-22; not portable (RG-29). Proposal: align them with the student-life data retention period |
| OQ-04 | **Resolved — ARB-26**: the closed list is = outing authorization, people authorized to pick up the child, communication preferences, enrollment regime, service options (§2.2). Original question: closed list of context attributes a school may add to a `ParentStudentRelationship` (RG-15) | To be fixed in review to bound the configuration: outing authorization, pickup, communication preferences |
| OQ-05 | **Resolved — `prd/cross-cutting/33` §3 and ARB-20**: a snapshot on the 1st of the month, ACTIVE enrollments only; entries and exits mid-month are taken into the following count; a transferred pupil is counted once, in the month of transfer, at the origin. Original question: rule for counting "active pupils" (`UsageMetric`) for months where an enrollment becomes ACTIVE, is SUSPENDED, or closes | Monthly billing from September to June (DEC-13, DEC-28) implies a proration rule; the model keeps the necessary status dates |
| OQ-06 | **Resolved — ARB-10**: MVP across every chapter (a matter of law, art. 209; 2nd Bac pupils reach adulthood as early as 2026-2027). Original question: version of the adult-pupil mechanism: INV-35 (RG-02, DEC-20) is carried at MVP in this chapter, while `prd/02-actors-personas.md` (BES-ELE-05, BES-ELE-07) and `prd/journeys/07-students-minor-and-adult.md` (PJ-ELE-04/05, local OQ-01) carry it at V1 | An unarbitrated version divergence, logged for review; INV-35's Version column stayed MVP pending a decision (see OQ-01 of `prd/journeys/07-students-minor-and-adult.md`) |
| OQ-07 | **Resolved — D4 / ARB-25**: immutable write-level history at the record level at MVP; a sensitive-view log and export in V1; SEC-11, PER-10 and FR-TRA-04/07/11 aligned. Original question: logging at MVP: the baseline's §12 places the immutable, exportable audit log (INV-33, `AuditLog`) in V1; the founder's arbitration keeps a minimal write-level history at MVP (corrections logged at the record level) | An acceptable, logged MVP downgrade; aligned with FR-VSC-21 (`prd/modules/13-attendance-student-life-discipline.md`) and FR-RAP-10/13 (`prd/modules/20-dashboards-reporting.md`) |

---

## 9. Traceability

Table: baseline ID → coverage in this chapter.

| Baseline ID | Coverage |
|---|---|
| §4 (five levels) | §1 (chain and scopes) |
| §6.1 | §2.1 (`User`, profiles); INV-13, INV-36, INV-37 |
| §6.2 | §2.1 (`StudentProfile`); INV-01 through INV-04; §7 (*claim*, duplicate, correction, merge) |
| §6.3 | §3 (state machine); INV-05 through INV-08; §2.2 (`Enrollment`, `StudentClassHistory`) |
| §6.4 | §2.2 (`ParentStudentRelationship`); INV-09 through INV-12 |
| §6.5 | §2.2 (`SchoolMembership`, `TeacherAssignment`); INV-14 through INV-16, INV-34 |
| §6.6 | §2.3 (`Organization`, `School`, `Campus`, `Section`); INV-17, INV-19; §6 |
| §6.7 | §2.3 (academic structure); INV-41, INV-42 |
| §6.8 | §2.4; INV-27 |
| §6.9 | §5; INV-20 through INV-30 |
| §6.10 | §2 (full dictionary) |
| §7.1 | INV-38; §2.7 (`Subscription`) |
| §7.7 | INV-39, INV-40; §2.5 |
| §7.9 | INV-43; §2.2 (`TransferRequest`); §3.2 |
| §8.1 | §2.7 (`SupportTicket`); §6 |
| §9 | INV-18, INV-24, INV-33; §6 (isolation, encryption, location, audit) |
| §10 | §2.4 (offline, delays); §7 (`AbsenceRecorded` under 5 min) |
| §12 (MVP/V1/V2) | "Version" column of §2, §4 |
| §17 (glossary) | Terminology of §2, §3 |
| RG-01 | INV-36 |
| RG-02 | INV-35; §7 (`AccessRestrictionRecorded`) |
| RG-03 | INV-13, INV-31 |
| RG-04 | INV-01, INV-43 |
| RG-05 | INV-02; §7 (`ProbableDuplicateDetected`) |
| RG-06 | INV-03; §2.7 (`MergeOperation`) |
| RG-07 | INV-04; §7 (`IdentityCorrected`) |
| RG-08 | INV-05; §3.3 |
| RG-09 | §3.1, §3.2 (COMPLETED); §2.4 (`YearDecision`) |
| RG-10 | INV-06; §3.3 |
| RG-11 | INV-07; §3.2; §7 (`ClassChanged`) |
| RG-12 | INV-08; §2.5 (`FinancialAccount`) |
| RG-12b | INV-13; §2.2 (`ParentStudentRelationship`) |
| RG-13 | INV-09; §3.2; §7 (`AbsenceRecorded`) |
| RG-14 | INV-10; §7 (`AbsenceRecorded`, `SanctionNotified`, `AccessRestrictionRecorded`) |
| RG-14b | INV-11; §7 (`RelationshipQualityChanged`) |
| RG-15 | INV-12; §7 (`RelationshipQualityChanged`); OQ-04 |
| RG-16 | §2.2 (`ParentStudentRelationship`, conflicts); §7 (`GuardianConflictReported`) |
| RG-17 | INV-14 |
| RG-18 | INV-15 |
| RG-19 | INV-16; §7 (`AffiliationClosed`) |
| RG-20 | §2.1 (`TeacherProfile`); INV-29 |
| RG-21 | INV-17; §1.1; §6 |
| RG-22 | §2.3 (`School`); §2.5 (invoice mentions, INV-40) |
| RG-23 | INV-19; §1.1 (minimal public) |
| RG-24 | §2.3 (`Section`, structure models) |
| RG-25 | INV-42 |
| RG-26 | INV-41; §2.3 (`SubjectLevelConfig`) |
| RG-27 | §5 (principle) |
| RG-28 | INV-20; §5 |
| RG-29 | INV-21; §5 |
| RG-30 | INV-18, INV-22, INV-24; §5 |
| RG-31 | INV-23; §5; §2.2 (`TransferRequest`) |
| RG-32 | INV-25 |
| RG-33 | INV-26; §2.4 (`ReportCard`) |
| RG-34 | INV-28; §5 |
| RG-35 | INV-29 |
| RG-36 | INV-18, INV-31 |
| RG-37 | INV-32 |
| RG-38 | INV-33; §6 (audit log) |
| RG-39 | INV-34 |
| DEC-02 | INV-17; §1.1; §6 |
| DEC-03 | INV-13; §1 (identity level) |
| DEC-04 | INV-01 |
| DEC-05 | INV-14; §2.2 (`SchoolMembership`) |
| DEC-06 | INV-06; §3.3 |
| DEC-07 | INV-20, INV-22; §5 |
| DEC-08 | INV-21, INV-23; §5 (health, discipline) |
| DEC-09 | INV-26; §2.4 (`ReportCard`) |
| DEC-10 | §2.1 (`Person`, dual script) |
| DEC-11 | INV-37; §2.1 (`User`) |
| DEC-12, DEC-36 | §2.6 (`Notification`) |
| DEC-13, DEC-28 | §2.7 (`Plan`, `UsageMetric`); §2.5 (`Payment`, `Invoice`, INV-40); OQ-05 |
| DEC-16 | §1.1 (data controller of the global identity) |
| DEC-17 | INV-32 |
| DEC-18 | INV-27 |
| DEC-20 | INV-35; §7 (`StudentReachedMajority`) |
| DEC-21 | INV-05; §3.3 |
| DEC-22 | INV-28; §5 (durations); §2.1 (account anonymization) |
| DEC-23 | INV-38; §6 |
| DEC-24 | INV-39 |
| DEC-25 | INV-29, INV-30 |
| DEC-26 | §6 (data location) |
| DEC-30 | §2.4 (`Certificate`); §2.5 (parent contract) |
| DEC-31 | §2.5 (`Payment`, methods) |
| DEC-32 | §2.2 (`TransferRequest`); §3.2; §5 |
| DEC-33 | INV-29; §2.1 (`TeacherProfile`) |
| DEC-34 | §2.6 (`Thread`) |
| ARB-01 | §2.3 (`Organization`), §2.7 (`MergeOperation`, `SupportTicket`), INV-03, INV-42 |
| ARB-02 | §3.1, §3.2 (import activation), §3.3 |
| ARB-03 | §3.1 (CANCELLED, exits from SUSPENDED, year end), §3.2, §3.3, INV-05, INV-06, OQ-01, OQ-02 |
| ARB-04, ARB-05, ARB-15, ARB-16 | §2.4 (`Session`, `AttendanceRecord`, `Justification`), §3.1 (SUSPENDED), §7 (`SessionNotHeld`, `AbsenceRectified`) |
| ARB-07, ARB-08 | §2.1 (`User`), INV-37, INV-45, §7 (`PhoneNumberChanged`) |
| ARB-10 | INV-35, OQ-06 |
| ARB-11 | §2.2 (`ParentStudentRelationship`), INV-10 |
| ARB-12 | INV-44, §5 |
| ARB-13 | §2.4 (`HealthRecord`, `StudentDocument`), §5 |
| ARB-14 | §2.2 (third-party payer), §2.5 (`FinancialAccount`) |
| ARB-17 | §2.4 (`Assessment`, `Mark`, `PeriodResult`, `YearDecision`), §7 (`MarkPublished`) |
| ARB-20 | §2.5 (`Payment`, `Receipt`, `FinancialAccount`), INV-40, §5, §7 (`PaymentVoided`) |
| ARB-21 | §2.1 (language), §2.6 (`Thread`, `Notification`) |
| ARB-22 | §2.2 (`TransferRequest`), §3.2, §7 |
| ARB-24 | §2.2 (`Enrollment`, effective date) |
| ARB-25 | §2.1 (MFA), §2.7 (`AuditLog`, `SupportTicket`), INV-33, §5 (finance), OQ-07 |
| ARB-26 | §2.2 (context attributes), §5, OQ-03, OQ-04 |
