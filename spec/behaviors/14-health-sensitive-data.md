> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-14                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification — Directional (V2+)                  |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/23-health-sensitive-data.md` (v0.3), old `FR-HEA-01..11` -> `BEH-ZS-301..311`, old `ECR-HEA-01..06` -> `SCR-ZS-161..166`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Health and Sensitive Data (HEA)

**Nature of this chapter.** The HEA module is a "future scope" module: the historical baseline (`spec/appendices/00-project-baseline.md` §7.14, §12) explicitly places it in a later version, alongside transport, canteen, and activities. This chapter therefore sets **directional requirements** for the student's health record as a fully separate, sensitive object subject to its own legal regime (Law 09.08, prior CNDP F112 authorization) and a permanent precautionary principle (least privilege, full logging, non-transfer). Every requirement in this chapter carries the tag **V2+**; none descends to MVP or V1.

## 1. Objective and scope

**Objective.** Manage the student's health record end to end: collection, hosting, restricted access, emergency alerts, retention period, and deletion — never as a section of the student file, always as a fully separate object.

**In scope (all V2+):**

- A structured health record **per student and per school** (one `HealthRecord` per student × school pair, tenant-keyed — [ADR-ZS-054](../decisions/054-health-record-per-school.md)): allergies, chronic conditions, current treatments, attending physician, emergency contacts, vaccinations (→ BEH-ZS-301).
- Activation conditioned on the school's prior CNDP F112 authorization and the legal guardians' express consent (→ BEH-ZS-302).
- Restricted access for the infirmary/leadership, minimal alerts for the homeroom teacher and student life staff (→ BEH-ZS-303, BEH-ZS-304).
- Full logging of access and changes (→ BEH-ZS-305).
- Absolute no automatic transfer, portability refused by default (→ BEH-ZS-306).
- Retention: end of schooling plus 1 year, then deletion (→ BEH-ZS-307).
- Enhanced encryption and a ban on distributing health data outside the platform (→ BEH-ZS-308).
- Emergency summary: a printable sheet (→ BEH-ZS-309).
- Data-subject rights: the adult student as holder, access, correction, revocation (→ BEH-ZS-310).
- Periodic update reminders to legal guardians (→ BEH-ZS-311).

**Out of scope:**

- Any real-time care follow-up: an infirmary-visit log, medications administered during the day, nursing follow-up sheets (see OQ-ZS-171). The permission matrix (`spec/cross-cutting/01-permissions.md`) is aligned with this exclusion (the infirmary role carries the health record and its alerts, with no visit log).
- A medical record shared with an external healthcare provider, telemedicine, any interconnection with a hospital system.
- Canteen and dietary regimes: the health record does not feed `spec/behaviors/13-ancillary-services.md`; a dietary contraindication appears there as an alert, with no automated flow.
- Massar exports: no health data transits to Massar or to any outside body ([ADR-ZS-...](.) baseline decision on Massar scope — see H-04, non-normative baseline record, `spec/appendices/01-review-history.md`).
- Biometrics and national ID card numbers in the health record: excluded on minimization grounds.

## 2. Users and use cases

| Role | Access to the health record | Main use cases |
|---|---|---|
| Nurse / infirmary (`SchoolMembership`, "nurse" role) | Full read/write of their school's records | Filling in a record submitted on paper at the start of the year; consulting the record in an emergency; producing the emergency summary |
| Leadership (principal, academic leadership) | Full read; module and retention-period configuration; access-log review | Activating the module after F112; auditing access; overseeing compliance |
| Parents / legal guardians | Read/write for their own children only | Filling in and keeping the record up to date; attaching the vaccination record; consenting; revoking |
| Homeroom teacher | Alerts only (allergies, contraindications) for their class, never the full record | Spotting an at-risk student during an outing or a workshop |
| Student life staff (head supervisor, supervisors) | Alerts only, limited to their assigned cycles ([INV-ZS-091](../invariants.md#inv-zs-091)) | Directing a student to the infirmary in case of an incident |
| The course's teacher, front office, accounting | No access | — |
| Minor student | No direct access to their own record | — |
| Adult student (18 years or older) | Read (permission matrix, Health row, note N8); holder of their own record ([INV-ZS-052](../invariants.md#inv-zs-052)): access and correction through the rights procedure, restriction of parental access | Taking back control of their own health data |

Representative use cases:

1. **Start of the school year**: the school hands out the paper health form with the re-enrollment file; the parent fills it in from their account (or the nurse enters it); the vaccination record is attached; the record moves from "empty" to "complete".
2. **An emergency in class**: a student has an allergic reaction at the canteen; the homeroom teacher sees their class's alert badge, student life staff direct the student to the infirmary, the nurse opens the full record, administers care per the recorded instructions, and prints an emergency sheet for first responders.
3. **A student's transfer**: a departure to another school carries **no** health data whatsoever; the new school starts from an empty record that the legal guardians fill in again (→ BEH-ZS-306).
4. **A compliance audit**: a parent questions a consultation; leadership shows the log's author, context, and timestamp for every access ([INV-ZS-090](../invariants.md#inv-zs-090)).

## 3. Key journeys

No dedicated journey is mapped for health: the module is explicitly outside MVP (see `spec/journeys/00-journey-map.md`, built in a later migration phase). Existing journeys touch the module at the following points:

- **JMP-ZS-001 / JMP-ZS-002** (admission, re-enrollment, and rollover): initial health-record collection fits into the re-enrollment file in V2+; the yearly rollover triggers the update reminder (→ BEH-ZS-311).
- **JMP-ZS-005** (morning attendance check): no data link; student life staff have health alerts in their views, with no functional dependency on attendance-taking.
- **JMP-ZS-009** (inter-school transfer and exit package): the health record is **excluded** from the default transfer profile ([INV-ZS-083](../invariants.md#inv-zs-083), [INV-ZS-022](../invariants.md#inv-zs-022)) and from the PDF exit package; a transfer to a non-ZSchool school does not carry it either ([ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md), [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md)).
- **JMP-ZS-010** (self-service certificates): no health document is issued self-service; the emergency summary (→ BEH-ZS-309) is reserved for authorized roles.

## 4. Functional behaviors

| ID | Title | Priority |
|---|---|---|
| BEH-ZS-301 | Maintain a structured health record per student | Must |
| BEH-ZS-302 | Condition activation on CNDP F112 authorization and express consent | Must |
| BEH-ZS-303 | Restrict access to the infirmary, leadership, and legal guardians | Must |
| BEH-ZS-304 | Publish minimal allergy alerts to the homeroom teacher and student life staff | Must |
| BEH-ZS-305 | Fully log every access and change | Must |
| BEH-ZS-306 | Forbid any automatic transfer and refuse portability by default | Must |
| BEH-ZS-307 | Delete health data one year after the end of schooling | Must |
| BEH-ZS-308 | Enhanced encryption and confining health data to the platform | Must |
| BEH-ZS-309 | Produce a printable, tracked emergency summary | Must |
| BEH-ZS-310 | Guarantee the data subject's rights, including the adult student | Must |
| BEH-ZS-311 | Remind guardians to update records at useful deadlines | Should |

### BEH-ZS-301: Maintain a structured health record per student

> **Invariant:** [INV-ZS-001](../invariants.md#inv-zs-001), [INV-ZS-036](../invariants.md#inv-zs-036)
> **See:** [ADR-ZS-029](../decisions/029-academic-data-always-tied-to-enrollment.md), [ADR-ZS-054](../decisions/054-health-record-per-school.md)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-241`](../../features/hea/fr-hea-01-one-record-per-school.feature)

REQUIREMENT: Each student MUST have at most one health record per school (a `HealthRecord` entity, one per student × school pair, carrying the tenant key and tied to the current enrollment; never a global record visible from every school with an active relationship).

Six mandatory sections are present even if empty: allergies (with severity and instructions), chronic conditions, current treatments, an attending physician (name, phone), emergency contacts (people to reach, phone; by default the legal guardians, with the option of third parties distinct from the "emergency contact" status on `ParentStudentRelationship`), vaccinations (an optional structured section, with the option of attaching the vaccination record as a `StudentDocument` with restricted access). The record carries a state: empty, partial, complete, frozen (consent revoked), deleted. Every change creates a time-stamped version viewable by authorized roles.

### BEH-ZS-302: Condition activation on CNDP F112 authorization and express consent

> **Invariant:** [INV-ZS-012](../invariants.md#inv-zs-012)
> **See:** [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md), [INV-ZS-068](../invariants.md#inv-zs-068) (guardian-conflict arbitration), [INV-ZS-052](../invariants.md#inv-zs-052) (adult student consents alone)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-242`](../../features/hea/fr-hea-02-activation-conditions.feature)

REQUIREMENT: Activating the health module for a school MUST require prior entry of the school's CNDP F112 authorization reference. With no valid reference, the module MUST stay non-activatable, and a compliance check MUST flag it if found active regardless.

A student's record MUST only be opened after express consent from one legal guardian (a separate consent from the enrollment form, dedicated to health data, logged via `ConsentGrant` with the consenting party identified, revocable). A single legal guardian is enough; the other legal guardian(s) and the custodian are notified of the consent. Where guardians disagree, the conflict is escalated to the school, which arbitrates and may require a ruling — ZSchool never decides. The adult student consents alone. With no consent, no entry is possible and no alert is published.

### BEH-ZS-303: Restrict access to the infirmary, leadership, and legal guardians

> **Invariant:** [INV-ZS-088](../invariants.md#inv-zs-088), [INV-ZS-089](../invariants.md#inv-zs-089)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-243`](../../features/hea/fr-hea-03-restricted-access.feature)

REQUIREMENT: Viewing and modifying a health record MUST be reserved to: infirmary (read/write, school scope), leadership (read, school scope), legal guardians (read/write, their own children only), adult student (read, their own record; correction is done through the rights procedure, BEH-ZS-310).

The nurse role is a dedicated fine-grained permission assigned on `SchoolMembership`, never a byproduct of a generic "staff" role. No other role — the course's teacher, homeroom teacher (outside alerts, BEH-ZS-304), student life staff (outside alerts), front office, accounting — accesses the record, whether by reading it, exporting it, or through summary views or school searches. Permissions are contextual: a teacher who is also a parent sees only their own children's record.

### BEH-ZS-304: Publish minimal allergy alerts to the homeroom teacher and student life staff

> **Invariant:** [INV-ZS-091](../invariants.md#inv-zs-091), [INV-ZS-090](../invariants.md#inv-zs-090)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-244`](../../features/hea/fr-hea-04-minimal-alerts.feature)

REQUIREMENT: For every allergy or contraindication declared with a severity, the record MUST produce an alert (a badge and short label: the nature of the allergy or contraindication and the response in one line) visible only to the student's homeroom teacher and to student life staff limited to their assigned cycles. The alert MUST NOT give access to the full record, to treatments, to the attending physician, or to vaccinations.

Lifting an alert (an allergy resolved) is entered by the nurse or the parent and hides the alert within 24 hours. No alert is transmitted through external channels (SMS, WhatsApp, email): in-app and push notification only.

### BEH-ZS-305: Fully log every access and change

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-019](../invariants.md#inv-zs-019)
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md) (5-year log retention)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-245`](../../features/hea/fr-hea-05-full-access-logging.feature)

REQUIREMENT: Every view, creation, change, deletion, printing, or export of a health record, an alert, or a health attachment MUST be logged in the immutable audit log: author, role, and context (school, class where relevant), student concerned, sections accessed, action, timestamp, origin (web, mobile, printing).

The health-access log is viewable by leadership with filters (by student, by author, by period) and exportable for audit; its retention is 5 years, independent of record deletion (the log traces the fact of access, never the medical content). A nurse's access to a record is logged in the same way as leadership's; a user viewing their own log is itself logged.

### BEH-ZS-306: Forbid any automatic transfer and refuse portability by default

> **Invariant:** [INV-ZS-035](../invariants.md#inv-zs-035), [INV-ZS-022](../invariants.md#inv-zs-022), [INV-ZS-012](../invariants.md#inv-zs-012), [INV-ZS-083](../invariants.md#inv-zs-083)
> **See:** [ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md), [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-246`](../../features/hea/fr-hea-06-no-automatic-transfer.feature)

REQUIREMENT: The health record MUST NEVER be transferred automatically: it MUST be excluded from the default transfer profile, from the school passport, from the PDF exit package, and from any inter-school sharing mechanism.

A voluntary share toward a recipient outside the school (another ZSchool school, a non-ZSchool school, an organization) requires an express, separate consent, bounded in scope and duration, revocable, logged (`ConsentGrant`); it is refused by default and no pre-filling encourages it. Portability in the sense of a reusable structured export is refused by default; the data subject's access and correction rights stay guaranteed through the rights procedure, with no export of the record outside that procedure. On a student's transfer, the new school opens its own record, empty, to be filled in by the legal guardians (one `HealthRecord` per school); the origin school's record stays invisible there and follows its own retention (BEH-ZS-307).

### BEH-ZS-307: Delete health data one year after the end of schooling

> **Invariant:** [INV-ZS-086](../invariants.md#inv-zs-086)
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-247`](../../features/hea/fr-hea-07-retention-and-deletion.feature)

REQUIREMENT: The default retention period of each health record (one per school) MUST be end of schooling (closure of the student's last enrollment at that school) plus 1 year, then deletion, computed school by school.

Deletion is effective and irreversible: the record, its versions, alerts, and attached medical documents; only the audit-log entries survive (5 years). A warning is sent to legal guardians and to leadership 30 days before the deadline, with the school able to extend within legal limits and its CNDP filing. When a student withdraws with no re-enrollment, the deadline runs from the enrollment's closure. The right to erasure does not apply as a substitute: health data follows the retention duration and deletion, not the anonymization provided for other data.

### BEH-ZS-308: Enhanced encryption and confining health data to the platform

> **See:** [ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md)
> **Priority:** Must
> **Version:** V2+

REQUIREMENT: Health data (the record, versions, medical documents, alerts) MUST benefit from enhanced encryption: encryption in transit and at rest with dedicated keys distinct from ordinary school data, managed at the tenant level, on top of systematic multi-tenant isolation.

No health data leaves the platform: neither in SMS/WhatsApp/email notifications (which carry at most a neutral label, "health record to complete"), nor in usual Excel/CSV exports (the health record does not enter the module's standard exports), nor to Massar, nor to any service hosted outside Morocco (production and backup hosting in Morocco — no F118 formality applies to health since nothing leaves). Any printouts or exports go exclusively through the logged emergency summary (BEH-ZS-309) or the rights procedure. Mechanism detail (key management, restoration tests) is carried by `spec/cross-cutting/02-security-privacy.md`.

### BEH-ZS-309: Produce a printable, tracked emergency summary

> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** V2+

REQUIREMENT: The nurse and leadership MUST be able to generate, in at most three actions from the record, a printable emergency summary sheet: the student's identity (dual script), allergies with severity and instructions, chronic conditions, emergency treatments, attending physician, emergency contacts, essential vaccinations if entered; never sections with no emergency value.

The document is a bilingual FR/AR PDF, in a foldable A5 or A4 format, carrying the issue date and the school; the documents module's electronic seal and verification QR code (a qualified seal via an accredited provider in V2) may be affixed to it. Every generation or printing is logged. The sheet is intended for outings, infirmaries, and first responders; handing it to a third party (an outing chaperone) is recorded in the record (recipient, date).

### BEH-ZS-310: Guarantee the data subject's rights, including the adult student

> **Invariant:** [INV-ZS-012](../invariants.md#inv-zs-012), [INV-ZS-042](../invariants.md#inv-zs-042)
> **See:** [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)
> **Priority:** Must
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-248`](../../features/hea/fr-hea-10-data-subject-rights.feature)

REQUIREMENT: Law 09.08 rights MUST apply to the health record following the rights procedure (`spec/cross-cutting/07-legal-compliance-data-protection.md`): access, correction, objection, under verified identity.

At 18 years or older, the student becomes the holder of their record: they access it, correct it, and may at any time restrict parental access to health data; access and correction are exercised through the rights procedure, under verified identity, the module's permission staying read-only. Every restriction is logged and notified to the school.

Consent revocation by legal guardians (or the adult student): stops any new entry by the school, immediately hides alerts from the homeroom teacher and student life staff — masking is immediate at the source of truth on revocation, its propagation to clients (already-open sessions and views) being guaranteed within at most 24 hours —, keeps the record frozen until the end of the retention period then purges it (BEH-ZS-307); revocation is logged (`ConsentRevoked`). Revocation does not allow demanding early deletion contrary to the school's obligations, unless the school decides otherwise.

### BEH-ZS-311: Remind guardians to update records at useful deadlines

> **Priority:** Should
> **Version:** V2+

REQUIREMENT: The module SHOULD trigger reminders to legal guardians: at every year rollover (re-enrollment N to N+1) and at first enrollment, a reminder to complete or confirm the health record; for records carrying an active alert, a yearly reminder to confirm the alert.

Reminders go out through usual communication channels (in-app notification, push, then SMS or WhatsApp at the school's choice) with a neutral label carrying no medical content, and produce a task visible on leadership's completion-rate tracking screen. No reminder is issued for frozen records or records with no consent.

### Screens

- **SCR-ZS-161 — Student health record (infirmary/leadership view)**: identity header (photo, dual script, class); a status ribbon (empty, partial, complete, frozen); six sections in tabs or blocks (allergies with severity and instructions, chronic conditions, treatments, attending physician, emergency contacts, vaccinations and documents); a version history; an "Emergency summary" button; a permanent reminder "every access is logged". Explicit empty states ("section not filled in") rather than hidden.
- **SCR-ZS-162 — Parent-side health record**: a guided mobile form by section, express consent as the first step (an information text, purposes, retention period, right of revocation), attachments (a photo of the vaccination record), a revocation button always visible at the bottom of the screen; the same record viewed by the adult student adds the parental-access-restriction control.
- **SCR-ZS-163 — Alerts in academic and student-life views**: a sober colored badge (with no explicit medical icon in shared lists), a short label "allergy — instructions" accessible in one tap; no full record; an "alert students" filter for the homeroom teacher; automatic bounding to cycles for student life staff.
- **SCR-ZS-164 — Health-access log (leadership)**: filters by student, author, action, period; author/role/student/action/timestamp/origin columns; an audit export; read-only; a note of purges performed.
- **SCR-ZS-165 — Emergency summary**: a preview before printing, an A4/A5 choice, recipient and reason (school outing, first responders), bilingual PDF generation, an immediate trace confirmed to the user.
- **SCR-ZS-166 — Configuration and compliance (leadership)**: the F112 authorization's reference and date, compliance status, authorized roles (a fixed matrix, no exception possible outside infirmary/leadership), retention periods (a default, not shortenable), a preview of reminders, the completion rate by class and by level.

## 5. Morocco-specific considerations

1. **CNDP F112 authorization mandatory**: health data falls under prior CNDP authorization (art. 12, Law 09.08), not the simple F211/F214 filing; an online filing via CNDP-FORMS, a formality borne by each school as data controller, ZSchool remaining a processor — ZSchool's own filings do not exempt the school's. The administration module's compliance assistant (`spec/behaviors/01-administration-onboarding-subscription.md`) references the authorization (BEH-ZS-302).
2. **No international health flow**: production and backups hosted in Morocco; the health record never uses messaging providers (the only outbound flows provided for by the platform, bounded by F118, and excluded for health by BEH-ZS-308). The adequacy list (deliberation no. 236-2015) is therefore never invoked for health.
3. **AREF health inspection**: Law 59.21 places private-school health inspection within the scope of AREF control commissions; keeping up-to-date health records and access traceability constitutes a file element that can be produced during an inspection.
4. **Bilingualism**: screens and the emergency sheet in French and Arabic (RTL), names in dual script; the printable emergency sheet is readable by both French- and Arabic-speaking first responders.
5. **Vaccination record**: a customary document handed over at enrollment in Moroccan schools; kept as a restricted-access attachment (`StudentDocument`, `spec/domain-model.md`) and not re-typed as free text, for lack of a structured national referential exposed to schools.
6. **Guardians' statuses**: health consent is collected from legal guardians per their statuses (legal tutor, custodian — [INV-ZS-066](../invariants.md#inv-zs-066), the ministerial position of 05/30/2023 confirmed); the Family Code's evolving guardianship regime applies with no rework of the module.
7. **Time zone and timestamps**: timestamps for the record, the log, and the emergency summary are expressed in Moroccan time, permanent UTC+0 from 09/20/2026, with storage in UTC.

## 6. Data and events

**Entities used** (dictionary: `spec/domain-model.md`):

| Entity | Role in the module |
|---|---|
| `HealthRecord` | Health record (V2): allergies, chronic conditions, treatments, attending physician, emergency contacts, vaccinations; state (empty, partial, complete, frozen, deleted); time-stamped versions. Relationship: one per (`StudentProfile`, `School`) pair, tenant-keyed, tied to the current enrollment. Sensitive data: prior CNDP authorization (F112); never transferred automatically; end of schooling at that school plus 1 year then deletion |
| `StudentDocument` | Medical documents with restricted access and enhanced encryption (vaccination record, emergency protocols), carrying the tenant key of whoever deposited them |
| `ConsentGrant` | Health consent: from the data subject to the school, identifying the consenting party (legal guardian or adult student); scope "health", duration, status active/expired/revoked, logged |
| `ParentStudentRelationship` | Source of authorized legal guardians; the "emergency contact" status distinct from the record's emergency contacts |
| `AuditLog` | Immutable log of health access and writes, 5-year retention |
| `Notification` / `DeliveryLog` | Reminders and confirmations to guardians (neutral labels, usual channels) |

**Domain events produced by the module** (consumed by `spec/behaviors/08-communication-notifications.md` and the log):

| Event | Producer | Consumers and effects |
|---|---|---|
| `HealthConsentRecorded` | HEA | Leadership (record activatable), audit log |
| `HealthConsentRevoked` | HEA | Leadership, HEA (freezing the record, hiding alerts), log |
| `HealthRecordChanged` | HEA | Infirmary and leadership (versions), log |
| `HealthAlertPublished` / `HealthAlertLifted` | HEA | Homeroom teacher, the cycle's student life staff (display), log |
| `EmergencySummaryGenerated` | HEA | Log (printing tracked), documents (PDF, QR code where applicable) |
| `HealthRecordReminderSent` | HEA | Communication (channels), leadership (completion tracking) |
| `HealthPurgeCompleted` | HEA (batch) | Leadership (notice), log |

None of these events carries medical content in its external notification data.

## 7. Integrations

- **Communication** (`spec/behaviors/08-communication-notifications.md`; `INT-ZS` for SMS/WhatsApp/email, `spec/cross-cutting/06-external-integrations.md`): update reminders and purge warnings, in neutral labels; no medical content in external flows.
- **Documents** (`spec/behaviors/06-documents-certificates.md`; `INT-ZS` for the e-signature integration): the emergency summary uses the documents building block (a bilingual PDF, seal, QR code — a qualified seal in V2).
- **Massar** (`spec/behaviors/12-massar-regulatory-exports.md`): no integration; health is explicitly outside Massar exports.
- **Hosting** (`INT-ZS`, `spec/cross-cutting/06-external-integrations.md`): production and backup hosting in Morocco; a compliance condition for the module.

## 8. Module-specific non-functional requirements

| Domain | Requirement | Reference |
|---|---|---|
| Security | Enhanced encryption (dedicated keys, separation of health data), MFA for school roles accessing the module, anti-enumeration protection on student search | `spec/cross-cutting/02-security-privacy.md` |
| Auditability | An immutable, exportable log, 5 years; no entry contains medical content, only the fact of access | [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-019](../invariants.md#inv-zs-019) |
| Performance | Opening the record within 2 s on 4G mobile networks; generating the emergency summary within the platform's document-generation timing (reference: a report card within 3 s) | `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS, PERF) |
| Availability | 99.5% outside maintenance; module unavailability must not deprive the infirmary: the systematic fallback is the last printed emergency sheet kept on file at the infirmary | `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS, DISP) |
| Languages | Full FR/AR with RTL, bilingual documents, dual-script names | `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS, I18N) |
| Mobile | Viewing and entry usable on a smartphone (parents and infirmary) | `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS, MOB) |
| Localization | Health data never leaves Morocco (production, backups, logs) | `spec/cross-cutting/06-external-integrations.md` |
| Backups | Encrypted daily backups covering health data, quarterly restoration tests | `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS, SAV) |

## 9. Success metrics

Candidate indicators to record in `spec/metrics.md` at review time:

- Rate of complete records at J+30 of the school year (indicative target: 90% of enrolled students with consent).
- Median time between the invitation to fill in the record and the first validation.
- Share of students with an active alert whose alert was confirmed at the yearly deadline.
- Number of logged views per student per month (anomaly detection: access outside school periods, repeated non-emergency access).
- Emergency-summary generation time and volume of tracked printouts per quarter.
- Actual purge time at the retention deadline (target: 100% of purges executed within 7 days of the deadline).

## 10. Open questions

Open questions for this module (OQ-ZS-171 through OQ-ZS-177) are tracked in `spec/open-questions.md` (built in a later migration phase).

## 11. Traceability

Full cross-reference coverage for this chapter is consolidated in `spec/traceability.md` (built in a later migration phase).
