# PRD ZSchool — Health and Sensitive Data Module (HEA)

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review; arbitrations from `prd/cross-cutting/42-review-arbitrations.md` applied (ARB-13, ARB-25, ARB-26); V2+ module |
| Source | PROJECT.md §7.14 (health module), §8.2–8.3 (permissions, health matrix), §9 (security and compliance), §12 (V2+ scope); RG-29, RG-31, RG-34, RG-38, RG-39; DEC-08, DEC-16, DEC-20, DEC-22; `prd/research/02-regulatory-data.md` §2; `prd/research/00-baseline-corrections.md` (finding no. 19); `prd/cross-cutting/42-review-arbitrations.md` (ARB-13) |
| Related files | `prd/00-conventions.md`; `prd/02-actors-personas.md`; `prd/03-domain-data-model.md`; `prd/journeys/00-journey-map.md`; `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/38-kpi-success-metrics.md`; `prd/modules/10-administration-onboarding-subscription.md` (ADM), `prd/modules/13-attendance-student-life-discipline.md` (VSC), `prd/modules/15-documents-certificates.md` (DOC), `prd/modules/17-communication-notifications.md` (COM), `prd/modules/18-transfers-mobility.md` (TRA), `prd/modules/22-ancillary-services-transport-canteen-activities.md` (SAN); `prd/cross-cutting/42-review-arbitrations.md` |

---

## 1. Purpose and scope

The HEA module manages the **student's health record** as a sensitive piece of data end to end: collection, hosting, restricted access, emergency alerts, retention period, and deletion. It treats health not as a section of the student file but as a fully separate object subject to its own legal regime (Law 09.08, prior CNDP authorization) and a permanent precautionary principle (least privilege, full logging, non-transfer).

**In scope (all V2+, PROJECT.md §12 "Transport, canteen, activities, health"):**

- A structured health record **per student and per school** (one `HealthRecord` per student × school pair, tenant-keyed — ARB-13): allergies, chronic conditions, current treatments, attending physician, emergency contacts, vaccinations (→ FR-HEA-01).
- Activation conditioned on the school's prior CNDP F112 authorization and the legal guardians' express consent (→ FR-HEA-02).
- Restricted access for the infirmary/leadership, minimal alerts for the homeroom teacher and student life staff (→ FR-HEA-03, FR-HEA-04).
- Full logging of access and changes (→ FR-HEA-05).
- Absolute no automatic transfer, portability refused by default (→ FR-HEA-06).
- Retention: end of schooling plus 1 year, then deletion (→ FR-HEA-07).
- Enhanced encryption and a ban on distributing health data outside the platform (→ FR-HEA-08).
- Emergency summary: a printable sheet (→ FR-HEA-09).
- Data-subject rights: the adult student as holder, access, correction, revocation (→ FR-HEA-10).
- Periodic update reminders to legal guardians (→ FR-HEA-11).

**Out of scope:**

- Any real-time care follow-up: an infirmary-visit log, medications administered during the day, nursing follow-up sheets (the founding document §7.14 only covers the health record; see OQ-01). The permissions matrix `prd/cross-cutting/30-roles-permissions-matrix.md` is aligned with this exclusion (the infirmary role there carries the health record and its alerts, with no visit log).
- A medical record shared with an external healthcare provider, telemedicine, any interconnection with a hospital system.
- Canteen and dietary regimes: the health record does not feed the SAN module (`prd/modules/22-ancillary-services-transport-canteen-activities.md`); a dietary contraindication appears there as an alert, with no automated flow.
- Massar exports: no health data transits to Massar or to any outside body (H-04, DEC-26).
- Biometrics and national ID card numbers in the health record: excluded on minimization grounds.

**Version**: the entire module is in **V2+** (PROJECT.md §12; `prd/journeys/00-journey-map.md` §5 "Journeys explicitly outside MVP"). No requirement of this chapter descends to MVP or V1.

---

## 2. Users and use cases

| Role | Access to the health record (detailed matrix §8.3) | Main use cases |
|---|---|---|
| Nurse / infirmary (`SchoolMembership`, "nurse" role) | Full read/write of their school's records | Filling in a record submitted on paper at the start of the year; consulting the record in an emergency; producing the emergency summary |
| Leadership (principal, academic leadership) | Full read; module and retention-period configuration; access-log review | Activating the module after F112; auditing access; overseeing compliance |
| Parents / legal guardians | Read/write for their own children only | Filling in and keeping the record up to date; attaching the vaccination record; consenting; revoking |
| Homeroom teacher | Alerts only (allergies, contraindications) for their class, never the full record | Spotting an at-risk student during an outing or a workshop |
| Student life staff (head supervisor, supervisors) | Alerts only, limited to their assigned cycles (RG-39) | Directing a student to the infirmary in case of an incident |
| The course's teacher, front office, accounting | No access | — |
| Minor student | No direct access to their own record | — |
| Adult student (18 years or older) | Read (matrix 30, Health row, note N8); holder of their own record (RG-02, DEC-20): access and correction through the rights procedure, restriction of parental access | Taking back control of their own health data |

Representative use cases:

1. **Start of the school year**: the school hands out the paper health form with the re-enrollment file; the parent fills it in from their account (or the nurse enters it); the vaccination record is attached; the record moves from "empty" to "complete".
2. **An emergency in class**: a student has an allergic reaction at the canteen; the homeroom teacher sees their class's alert badge, student life staff direct the student to the infirmary, the nurse opens the full record, administers care per the recorded instructions, and prints an emergency sheet for first responders.
3. **A student's transfer**: a departure to another school carries **no** health data whatsoever; the new school starts from an empty record that the legal guardians fill in again (→ FR-HEA-06).
4. **A compliance audit**: a parent questions a consultation; leadership shows the log's author, context, and timestamp for every access (RG-38).

---

## 3. Key journeys

No dedicated journey is mapped for health: the module is explicitly outside MVP in `prd/journeys/00-journey-map.md` §5. Existing journeys touch the module at the following points:

- **PC-01 / PC-02** (admission, re-enrollment, and rollover): initial health-record collection fits into the re-enrollment file in V2+; the yearly rollover triggers the update reminder (→ FR-HEA-11).
- **PC-05** (morning attendance check): no data link; student life staff have health alerts in their views, with no functional dependency on attendance-taking.
- **PC-09** (inter-school transfer and exit package): the health record is **excluded** from the default transfer profile (RG-31, INV-23) and from the PDF exit package; a transfer to a non-ZSchool school does not carry it either (DEC-08, DEC-32).
- **PC-10** (self-service certificates): no health document is issued self-service; the emergency summary (→ FR-HEA-09) is reserved for authorized roles.

---

## 4. Functional requirements

### FR-HEA-01 — Maintain a structured health record per student

| Attribute | Value |
|---|---|
| Description | Each student has at most one health record **per school** (a `HealthRecord` entity from `prd/03-domain-data-model.md` §2.4: one per student × school pair, carrying the tenant key and tied to the current enrollment — DEC-18, INV-17, INV-27, ARB-13; never a global record visible from every school with an active relationship), holding six mandatory sections (present even if empty): allergies (with severity and instructions), chronic conditions, current treatments, an attending physician (name, phone), emergency contacts (people to reach, phone; by default the legal guardians, with the option of third parties distinct from the "emergency contact" status on `ParentStudentRelationship`), vaccinations (an optional structured section, with the option of attaching the vaccination record as a `StudentDocument` with restricted access). The record carries a state: empty, partial, complete, frozen (consent revoked), deleted. Every change creates a time-stamped version viewable by authorized roles. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §7.14, §8.3; DEC-18; INV-17, INV-23 (carrying), INV-27; DEC-22; ARB-13 |
| Actors | Parents / legal guardians (write), infirmary (read/write), leadership (read), adult student (read — matrix 30, Health row, note N8) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: One health record per school (V2+)
  Scenario: Two schools, two independent records
    Given a student enrolled ACTIVE at "School A" with a complete health record
    And a second enrollment of that student at "School B" the following year, after a transfer
    When "School B"'s infirmary opens the student's health record
    Then it finds an empty record specific to "School B", pending the legal guardians' consent
    And "School A"'s record stays invisible from "School B" and follows its own deletion deadline
```

### FR-HEA-02 — Condition activation on CNDP F112 authorization and express consent

| Attribute | Value |
|---|---|
| Description | Activating the health module for a school requires prior entry of the school's **CNDP F112 authorization** reference (data controller, art. 12 of Law 09.08: health data falls under prior authorization, not the simple F211 filing — `prd/research/02-regulatory-data.md` §2; `prd/research/00-baseline-corrections.md` no. 19). ZSchool provides the filing template and keeps the reference and date. With no valid reference, the module stays non-activatable, and a compliance check flags it if found active. In parallel, a student's record is only opened after **express consent from one legal guardian** (a separate consent from the enrollment form, dedicated to health data, logged via `ConsentGrant` with the consenting party identified, revocable — INV-24): **a single legal guardian is enough**, the other legal guardian(s) and the custodian being notified of the consent; where guardians disagree, the conflict is escalated to the school, which arbitrates and may require a ruling, ZSchool not deciding (RG-16); the adult student consents alone (RG-02). With no consent, no entry is possible and no alert is published. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §9; H-05, H-15; DEC-16; RG-02, RG-16; research 02 §2; correction no. 19; ARB-13 |
| Actors | Leadership (activation), parents / legal guardians (consent), compliance (`prd/cross-cutting/36-legal-compliance-data-protection.md`) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Activating the health module
  Scenario: Activation blocked with no F112 authorization
    Given a school whose health-data processing has no CNDP authorization on record
    When the principal attempts to activate the health module
    Then activation is refused with a request for the F112 reference
    And no health record can be created for any student

  Scenario: An inactive record with no consent
    Given an enrolled student for whom no legal guardian has consented to health-data processing
    When the nurse searches for that student's health record
    Then the record appears in state "empty" with the note "consent not obtained"
    And no entry is possible until consent is recorded
    And a refused consent blocks neither the student's enrollment nor their re-enrollment

  Scenario: Consent from a single legal guardian, the other notified
    Given a student whose father and mother are both legal guardians
    When the mother records health consent from her account
    Then the record becomes activatable and the father receives a notification of the consent
    And if the father raises a disagreement, the conflict is escalated to the school for arbitration (RG-16) with no ruling from ZSchool
```

### FR-HEA-03 — Restrict access to the infirmary, leadership, and legal guardians

| Attribute | Value |
|---|---|
| Description | Viewing and modifying a health record are reserved to: infirmary (read/write, school scope), leadership (read, school scope), legal guardians (read/write, their own children only), adult student (read, their own record — matrix 30, Health row, note N8; correction is done through the rights procedure, FR-HEA-10). The nurse role is a dedicated fine-grained permission assigned on `SchoolMembership` (RG-37), never a byproduct of a generic "staff" role. No other role — the course's teacher, homeroom teacher (outside alerts, FR-HEA-04), student life staff (outside alerts), front office, accounting — accesses the record, whether by reading it, exporting it, or through summary views or school searches. Permissions are contextual (RG-36): a teacher who is also a parent sees only their own children's record. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §8.2 (RG-36, RG-37, RG-39), §8.3 (Health row), §7.14 |
| Actors | Nurse, leadership, parents, adult student |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Restricted access to the health record
  Scenario: A course teacher does not see the record
    Given a teacher assigned to the math course of class 2AC-3
    And a 2AC-3 student whose health record is complete
    When the teacher opens the class's student list
    Then no health section and no alert badge appears
    And any direct attempt to access the record by URL is refused

  Scenario: The front office stays out of scope
    Given a front-office staff member enrolling a new student
    When she completes the student's identity file
    Then the health record appears neither in the file nor in enrollment screens
    And she cannot delegate its entry to any role other than the nurse or the parent
```

### FR-HEA-04 — Publish minimal allergy alerts to the homeroom teacher and student life staff

| Attribute | Value |
|---|---|
| Description | For every allergy or contraindication declared with a severity, the record produces an **alert** (a badge and short label: the nature of the allergy or contraindication and the response in one line) visible only to the student's homeroom teacher and to student life staff limited to their assigned cycles (RG-39). The alert appears in the homeroom teacher's class list and in student-life views; it never gives access to the full record, to treatments, to the attending physician, or to vaccinations. Lifting the alert (an allergy resolved) is entered by the nurse or the parent and hides the alert within 24 hours. No alert is transmitted through external channels (SMS, WhatsApp, email): in-app and push notification only. |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §8.3 (Health: "L (alerts)"), RG-39, RG-38 |
| Actors | Homeroom teacher, student life staff, nurse (alert management) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Least-privilege allergy alerts
  Scenario: The homeroom teacher sees the alert, not the record
    Given a 2AC-3 student with an alert "peanut allergy — high severity"
    And a 2AC-3 homeroom teacher
    When they view their class list
    Then the alert badge and short label appear on the student
    And no button gives them access to the full record or to treatments

  Scenario: Student life staff are bounded to their cycles
    Given a supervisor assigned to the middle-school cycle only
    When they view student-life views
    Then upper-secondary students' alerts do not appear
    And middle-school alerts appear with no access to the full record
```

### FR-HEA-05 — Fully log every access and change

| Attribute | Value |
|---|---|
| Description | Every view, creation, change, deletion, printing, or export of a health record, an alert, or a health attachment is logged in the immutable audit log: author, role, and context (school, class where relevant), student concerned, sections accessed, action, timestamp, origin (web, mobile, printing). The health-access log is viewable by leadership with filters (by student, by author, by period) and exportable for audit; its retention is 5 years per DEC-22, independent of record deletion (the log traces the fact of access, never the medical content). A nurse's access to a record is logged in the same way as leadership's; a user viewing their own log is itself logged. |
| Priority | Must |
| Version | V2+ |
| Traceability | RG-38; INV-33; DEC-22 (5-year logs) |
| Actors | Leadership (viewing), platform (automatic writing) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Logging health-data access
  Scenario: A nurse's access is logged
    Given a nurse affiliated with the school holding the nurse role
    And a 6AP student whose health record is complete
    When the nurse opens that student's health record
    Then a log entry records her identity, role, the student, the action "view", and the timestamp
    And the entry is visible to leadership in the health-access log
    And no change to the entry is possible (an immutable log)

  Scenario: Printing an emergency summary is tracked
    Given an allergic reaction during a school outing
    When the nurse prints the student's emergency summary sheet
    Then a log entry records the printing with the author, the student, and the timestamp
    And the entry states the type of document produced
```

### FR-HEA-06 — Forbid any automatic transfer and refuse portability by default

| Attribute | Value |
|---|---|
| Description | The health record is **never** transferred automatically (DEC-08, RG-31): it is excluded from the default transfer profile, from the school passport, from the PDF exit package, and from any inter-school sharing mechanism (INV-22, INV-23). A voluntary share toward a recipient outside the school (another ZSchool school, a non-ZSchool school, an organization) requires an express, separate consent, bounded in scope and duration, revocable, logged (`ConsentGrant`, INV-24); it is refused by default and no pre-filling encourages it. **Portability** in the sense of a reusable structured export is refused by default; the data subject's access and correction rights stay guaranteed through the rights procedure (Law 09.08, art. 7 to 9 — `prd/cross-cutting/36-legal-compliance-data-protection.md`), with no export of the record outside that procedure. On a student's transfer, the new school opens **its own record**, empty, to be filled in by the legal guardians (one `HealthRecord` per school, ARB-13); the origin school's record stays invisible there and follows its own retention (FR-HEA-07). |
| Priority | Must |
| Version | V2+ |
| Traceability | DEC-08; RG-29, RG-31; RG-30; INV-22, INV-23, INV-24; DEC-32; ARB-13 |
| Actors | Parents / legal guardians, adult student, leadership, transfer module (`prd/modules/18-transfers-mobility.md`) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: No automatic transfer of the health record
  Scenario: An inter-ZSchool-school transfer with no health data
    Given a 3AC student whose health record is complete at the origin school
    And a transfer validated to another ZSchool school with the default transfer profile
    When the destination school opens the student's file
    Then it sees the identity, Massar code, school history, and shared official documents
    And it sees no health section, no alert, and no medical document
    And its local health record is empty and awaits the legal guardians' consent

  Scenario: An exceptional voluntary share only on consent
    Given a legal guardian wishing to send the record to a non-ZSchool school
    When they request the share from their account
    Then the system requires an express, separate consent with scope, duration, and recipient
    And the share is logged and revocable
    And absent that consent, no health content is included in the exit package
```

### FR-HEA-07 — Delete health data one year after the end of schooling

| Attribute | Value |
|---|---|
| Description | The default retention period of each health record (one per school, ARB-13) is: **end of schooling (closure of the student's last enrollment at that school) plus 1 year, then deletion** (DEC-22); the deadline is computed school by school. Deletion is effective and irreversible: the record, its versions, alerts, and attached medical documents; only the audit-log entries survive (5 years, DEC-22). A warning is sent to legal guardians and to leadership 30 days before the deadline, with the school able to extend within legal limits and its CNDP filing (described in `prd/cross-cutting/36-legal-compliance-data-protection.md`). When a student withdraws with no re-enrollment, the deadline runs from the enrollment's closure. The right to erasure does not apply as a substitute: health data follows the DEC-22 duration and deletion, not the anonymization provided for other data (RG-34, Q-04). |
| Priority | Must |
| Version | V2+ |
| Traceability | DEC-22; RG-34; Q-04 |
| Actors | Platform (automatic purge), leadership (notice), parents (warning) |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Retention and deletion of health records
  Scenario: Deletion one year after the end of schooling
    Given a student who left the school in June 2026 (the enrollment closed)
    And a complete health record with an active alert and an attached vaccination record
    When the end-of-schooling-plus-1-year deadline is reached
    Then the record, its versions, its alert, and its medical documents are deleted
    And the log keeps access traces with no medical content
    And legal guardians and leadership were warned 30 days before the purge

  Scenario: The adult student stays the holder until the purge
    Given an adult student who has left the school
    When they request access to their record before the deletion deadline
    Then access is granted per the personal-data-rights procedure
    And after the deadline, deletion makes the request moot
```

### FR-HEA-08 — Enhanced encryption and confining health data to the platform

| Attribute | Value |
|---|---|
| Description | Health data (the record, versions, medical documents, alerts) benefits from the **enhanced encryption** provided for by PROJECT.md §9: encryption in transit and at rest with dedicated keys distinct from ordinary school data, managed at the tenant level, on top of systematic multi-tenant isolation. No health data leaves the platform: neither in SMS/WhatsApp/email notifications (which carry at most a neutral label, "health record to complete"), nor in usual Excel/CSV exports (the health record does not enter the module's standard exports), nor to Massar, nor to any service hosted outside Morocco (production and backup hosting in Morocco, DEC-26 — no F118 formality applies to health since nothing leaves). Any printouts or exports go exclusively through the logged emergency summary (FR-HEA-09) or the rights procedure. Mechanism detail (key management, restoration tests) is carried by the security domain (`prd/cross-cutting/31-security-privacy.md`). |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §9, §7.14; DEC-26; H-06 (context) |
| Actors | Platform, leadership, security (`prd/cross-cutting/31-security-privacy.md`) |

### FR-HEA-09 — Produce a printable, tracked emergency summary

| Attribute | Value |
|---|---|
| Description | The nurse and leadership may generate, in at most three actions from the record, a printable **emergency summary sheet**: the student's identity (dual script), allergies with severity and instructions, chronic conditions, emergency treatments, attending physician, emergency contacts, essential vaccinations if entered; never sections with no emergency value. The document is a bilingual FR/AR PDF (DEC-10), in a foldable A5 or A4 format, carrying the issue date and the school; the documents module's electronic seal and verification QR code (DEC-30, V2: a qualified seal via an accredited provider) may be affixed to it. Every generation or printing is logged (RG-38). The sheet is intended for outings, infirmaries, and first responders; handing it to a third party (an outing chaperone) is recorded in the record (recipient, date). |
| Priority | Must |
| Version | V2+ |
| Traceability | PROJECT.md §7.14, §10 (bilingual documents); DEC-10, DEC-30; RG-38 |
| Actors | Nurse, leadership |

### FR-HEA-10 — Guarantee the data subject's rights, including the adult student

| Attribute | Value |
|---|---|
| Description | Law 09.08 rights apply to the health record following the rights procedure (`prd/cross-cutting/36-legal-compliance-data-protection.md`): access, correction, objection, under verified identity. At 18 years or older, the student becomes **the holder** of their record (RG-02, DEC-20, INV-35): they access it, correct it, and may at any time restrict parental access to health data; access and correction are exercised through the rights procedure, under verified identity, the module's permission staying read-only (matrix 30, Health row "L (adult student)", note N8); every restriction is logged and notified to the school. **Consent revocation** by legal guardians (or the adult student): stops any new entry by the school, immediately hides alerts from the homeroom teacher and student life staff — masking is immediate at the source of truth on revocation, its propagation to clients (already-open sessions and views) being guaranteed within at most 24 hours —, keeps the record frozen until the end of the retention period then purges it (FR-HEA-07); revocation is logged (`ConsentRevoked`). Revocation does not allow demanding early deletion contrary to the school's obligations, unless the school decides otherwise. |
| Priority | Must |
| Version | V2+ |
| Traceability | RG-02; DEC-20; INV-24, INV-35; PROJECT.md §9 |
| Actors | Adult student, parents / legal guardians, leadership |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Data subject rights
  Scenario: The adult student restricts parental access
    Given a student who has become an adult with a complete health record
    When they restrict parental access to health data from their account
    Then their legal guardians immediately lose read and write access to the record
    And the restriction is logged and notified to the school

  Scenario: Revocation hides alerts
    Given a student with an allergy alert visible to the homeroom teacher
    When their legal guardians revoke health consent
    Then the alert is immediately hidden from homeroom-teacher and student-life views, with propagation to open clients guaranteed within at most 24 hours
    And the record moves to state "frozen" with no possible write by the school
    And the revocation is logged
```

### FR-HEA-11 — Remind guardians to update records at useful deadlines

| Attribute | Value |
|---|---|
| Description | The module triggers reminders to legal guardians: at every year rollover (re-enrollment N to N+1) and at first enrollment, a reminder to complete or confirm the health record; for records carrying an active alert, a yearly reminder to confirm the alert. Reminders go out through usual communication channels (in-app notification, push, then SMS or WhatsApp at the school's choice) with a neutral label carrying no medical content, and produce a task visible on leadership's completion-rate tracking screen. No reminder is issued for frozen records or records with no consent. |
| Priority | Should |
| Version | V2+ |
| Traceability | PROJECT.md §7.14, §7.2 (re-enrollment); §7.8 (channels) |
| Actors | Parents / legal guardians, leadership |

---

## 5. Morocco-specific considerations

1. **CNDP F112 authorization mandatory**: health data falls under prior CNDP authorization (art. 12, Law 09.08), not the simple F211/F214 filing; an online filing via CNDP-FORMS, a formality borne by each school as data controller, ZSchool remaining a processor (DEC-16) — ZSchool's own filings do not exempt the school's (`prd/research/02-regulatory-data.md` §2; `prd/research/00-baseline-corrections.md` no. 19). The administration module's compliance assistant (`prd/modules/10-administration-onboarding-subscription.md`) references the authorization (FR-HEA-02).
2. **No international health flow**: production and backups hosted in Morocco (DEC-26); the health record never uses messaging providers (the only outbound flows provided for by the founding document, bounded by F118, and excluded for health by FR-HEA-08). The adequacy list (deliberation no. 236-2015) is therefore never invoked for health.
3. **AREF health inspection**: Law 59.21 places private-school health inspection within the scope of AREF control commissions; keeping up-to-date health records and access traceability constitutes a file element that can be produced during an inspection (`prd/research/02-regulatory-data.md` §1).
4. **Bilingualism**: screens and the emergency sheet in French and Arabic (RTL), names in dual script (DEC-10); the printable emergency sheet is readable by both French- and Arabic-speaking first responders.
5. **Vaccination record**: a customary document handed over at enrollment in Moroccan schools; kept as a restricted-access attachment (`StudentDocument`, `prd/03-domain-data-model.md` §2.4) and not re-typed as free text, for lack of a structured national referential exposed to schools.
6. **Guardians' statuses**: health consent is collected from legal guardians per their statuses (legal tutor, custodian — RG-14b, the ministerial position of 05/30/2023 confirmed); the Family Code's evolving guardianship regime applies with no rework of the module (`prd/research/00-baseline-corrections.md` no. 5).
7. **Time zone and timestamps**: timestamps for the record, the log, and the emergency summary are expressed in Moroccan time, permanent UTC+0 from 09/20/2026 (`prd/research/00-baseline-corrections.md` no. 1; the question settled once in `prd/01-context-vision-scope.md` OQ-01), with storage in UTC.

---

## 6. Data and events

**Entities used (PROJECT.md §6.10 schema, dictionary `prd/03-domain-data-model.md`):**

| Entity | Role in the module |
|---|---|
| `HealthRecord` | Health record (V2): allergies, chronic conditions, treatments, attending physician, emergency contacts, vaccinations; state (empty, partial, complete, frozen, deleted); time-stamped versions. **Relationship: one per (`StudentProfile`, `School`) pair, tenant-keyed, tied to the current enrollment (ARB-13; a correction to the `prd/03-domain-data-model.md` §2.4 dictionary, which tied it to `StudentProfile` alone)**. Sensitive data: prior CNDP authorization (F112); never transferred automatically (DEC-08); end of schooling at that school plus 1 year then deletion (DEC-22) |
| `StudentDocument` | Medical documents with restricted access and enhanced encryption (vaccination record, emergency protocols), carrying the tenant key of whoever deposited them (ARB-13) — `prd/03-domain-data-model.md` §2.4 |
| `ConsentGrant` | Health consent: from the data subject to the school, identifying the consenting party (legal guardian or adult student); scope "health", duration, status active/expired/revoked, logged (INV-24) |
| `ParentStudentRelationship` | Source of authorized legal guardians; the "emergency contact" status distinct from the record's emergency contacts |
| `AuditLog` | Immutable log of health access and writes (RG-38, INV-33), 5-year retention |
| `Notification` / `DeliveryLog` | Reminders and confirmations to guardians (neutral labels, usual channels) |

**Domain events produced by the module** (to be consolidated into `prd/03-domain-data-model.md` §7 at review time; consumed by communication (`prd/modules/17-communication-notifications.md`) and the log):

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

---

## 7. Key screens

Text descriptions; FR/AR interface (RTL), mobile-first (ECR-… namespace of the module, conventions §2).

- **ECR-HEA-01 — Student health record (infirmary/leadership view)**: identity header (photo, dual script, class); a status ribbon (empty, partial, complete, frozen); six sections in tabs or blocks (allergies with severity and instructions, chronic conditions, treatments, attending physician, emergency contacts, vaccinations and documents); a version history; an "Emergency summary" button; a permanent reminder "every access is logged". Explicit empty states ("section not filled in") rather than hidden.
- **ECR-HEA-02 — Parent-side health record**: a guided mobile form by section, express consent as the first step (an information text, purposes, retention period, right of revocation), attachments (a photo of the vaccination record), a revocation button always visible at the bottom of the screen; the same record viewed by the adult student adds the parental-access-restriction control.
- **ECR-HEA-03 — Alerts in academic and student-life views**: a sober colored badge (with no explicit medical icon in shared lists), a short label "allergy — instructions" accessible in one tap; no full record; an "alert students" filter for the homeroom teacher; automatic bounding to cycles for student life staff.
- **ECR-HEA-04 — Health-access log (leadership)**: filters by student, author, action, period; author/role/student/action/timestamp/origin columns; an audit export; read-only; a note of purges performed.
- **ECR-HEA-05 — Emergency summary**: a preview before printing, an A4/A5 choice, recipient and reason (school outing, first responders), bilingual PDF generation, an immediate trace confirmed to the user.
- **ECR-HEA-06 — Configuration and compliance (leadership)**: the F112 authorization's reference and date, compliance status, authorized roles (a fixed matrix, no exception possible outside infirmary/leadership), retention periods (a default DEC-22, not shortenable), a preview of reminders, the completion rate by class and by level.

---

## 8. Integrations

- **Communication (`prd/modules/17-communication-notifications.md`; `INT-SMS`, `INT-WAP`, `INT-EML` in `prd/cross-cutting/35-external-integrations.md`)**: update reminders and purge warnings, in neutral labels; no medical content in external flows.
- **Documents (`prd/modules/15-documents-certificates.md`; `INT-SIG` in `prd/cross-cutting/35-external-integrations.md`)**: the emergency summary uses the documents building block (a bilingual PDF, seal, QR code — a qualified seal in V2, DEC-30).
- **Massar (`prd/modules/21-massar-regulatory-exports.md`, `INT-MAS`)**: no integration; health is explicitly outside Massar exports.
- **Hosting (`INT-HEB`, `prd/cross-cutting/35-external-integrations.md`)**: production and backup hosting in Morocco (DEC-26); a compliance condition for the module.

---

## 9. Module-specific non-functional requirements

| Domain | Requirement | Reference |
|---|---|---|
| Security | Enhanced encryption (dedicated keys, separation of health data), MFA for school roles accessing the module, anti-enumeration protection on student search | PROJECT.md §9; `prd/cross-cutting/31-security-privacy.md` |
| Auditability | An immutable, exportable log, 5 years; no entry contains medical content, only the fact of access | RG-38; INV-33; DEC-22 |
| Performance | Opening the record within 2 s on 4G mobile networks; generating the emergency summary within the founding document's document-generation timing (reference: a report card within 3 s) | PROJECT.md §10; `prd/cross-cutting/32-non-functional-requirements.md` (NFR-PERF) |
| Availability | 99.5% outside maintenance; module unavailability must not deprive the infirmary: the systematic fallback is the last printed emergency sheet kept on file at the infirmary | PROJECT.md §10; NFR-DISP |
| Languages | Full FR/AR with RTL, bilingual documents, dual-script names | DEC-10; NFR-I18N |
| Mobile | Viewing and entry usable on a smartphone (parents and infirmary) | PROJECT.md §10; NFR-MOB |
| Localization | Health data never leaves Morocco (production, backups, logs) | DEC-26; `prd/cross-cutting/35-external-integrations.md` |
| Backups | Encrypted daily backups covering health data, quarterly restoration tests | PROJECT.md §9–10; NFR-SAV |

---

## 10. Success metrics

Candidate indicators to record in the indicators repository (`prd/cross-cutting/38-kpi-success-metrics.md`) at review time (no `KPI-NN` assigned here, the namespace being carried by that file):

- Rate of complete records at J+30 of the school year (indicative target: 90% of enrolled students with consent).
- Median time between the invitation to fill in the record and the first validation.
- Share of students with an active alert whose alert was confirmed at the yearly deadline.
- Number of logged views per student per month (anomaly detection: access outside school periods, repeated non-emergency access).
- Emergency-summary generation time and volume of tracked printouts per quarter.
- Actual purge time at the DEC-22 deadline (target: 100% of purges executed within 7 days of the deadline).

---

## 11. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Should V2+ or a later version include an infirmary-visit log (visits, medications administered, monitoring)? | The founding document §7.14 only covers the health record; a daily log would be a notable extension (further health data, an impact on the CNDP filing). To be decided in review: an extension of the HEA module or attachment to ancillary services (`prd/modules/22-ancillary-services-transport-canteen-activities.md`). |
| OQ-02 | Should allergy alerts be extendable beyond the homeroom teacher and student life staff (a PE teacher, outing chaperones, canteen staff)? | Matrix §8.3 excludes the course's teacher ("—"); real-world needs (PE, outings) argue for a school-level setting. Any extension stays within least privilege (RG-39) and must be logged. To be decided in review. |
| OQ-03 | Is offline access to emergency records for the nurse from mobile adopted? | The founding document limits offline use to attendance-taking and grades (§10); the current fallback is the printed emergency sheet kept at the infirmary (FR-HEA-09, NFR-DISP). A local encrypted cache would raise security questions (device loss). To be decided in review. |
| OQ-04 | A founding-document/research divergence note: correction no. 19 (`prd/research/00-baseline-corrections.md`) **confirms** the founding document for this module — F112 authorization mandatory for health data (art. 12, Law 09.08), an online CNDP-FORMS filing, Law 09.08's revision not filed with Parliament as of 09/09/2026. No divergence to apply; regulatory monitoring (Law 59.21's 35 decrees, the 09.08 revision) stays open on the `prd/cross-cutting/36-legal-compliance-data-protection.md` side. | Recorded per the research/founding-document traceability rules. |
| OQ-06 | Attachment of the health record: the `prd/03` §2.4 dictionary tied it to `StudentProfile` alone (global), incompatible with FR-HEA-06 (an empty record at the new school) and FR-HEA-07 (per-school purge). | **Resolved — ARB-13**: one `HealthRecord` per student × school pair, tenant-keyed, tied to the current enrollment; `StudentDocument` carries the tenant key of the depositor; a correction to be reflected in `prd/03`. |
| OQ-07 | Number of legal guardians required for health consent (FR-HEA-02) and the disagreement case. | **Resolved — ARB-13 / RG-16**: one legal guardian suffices, the others are notified, disagreement is arbitrated by the school; the adult student consents alone. |
| OQ-05 | Arbitrations settled in review and recorded rather than left open: (a) hiding alerts on consent revocation — immediate at the source of truth, propagation to open clients within at most 24 hours (FR-HEA-10); FR-HEA-04's alert-lifting (allergy resolved) keeps its "within 24 hours" delay; (b) the adult student's permission aligned with the `prd/cross-cutting/30-roles-permissions-matrix.md` matrix (Health row "L (adult student)", note N8) — read within the module, correction through the rights procedure, with no direct write (FR-HEA-01, FR-HEA-03, FR-HEA-10). | Any future change to matrix 30 or to the rights procedure must be reflected here and in the requirements cited. |

---

## 12. Traceability

| Founding-document ID | Coverage in this chapter |
|---|---|
| PROJECT.md §7.14 | §1, §2; FR-HEA-01, FR-HEA-03, FR-HEA-09, FR-HEA-11 |
| DEC-18; INV-17, INV-27 (tenant and enrollment attachment) | FR-HEA-01, FR-HEA-06, FR-HEA-07; §6; OQ-06 (ARB-13) |
| RG-16 (guardian conflicts) | FR-HEA-02; OQ-07 |
| PROJECT.md §8.2 (RG-36, RG-37) | FR-HEA-03 |
| PROJECT.md §8.3 (Health row) | FR-HEA-01, FR-HEA-03, FR-HEA-04; ECR-HEA-01, ECR-HEA-03; matrix-30 alignment (note N8); OQ-05 |
| PROJECT.md §9 | FR-HEA-02, FR-HEA-08, FR-HEA-10; §9 (NFR) |
| PROJECT.md §12 (V2+) | Entire scope (§1); every "V2+" requirement |
| RG-02 | FR-HEA-10; OQ-05 (matrix-30 alignment, note N8) |
| RG-29 | FR-HEA-06 |
| RG-30 | FR-HEA-06 |
| RG-31 | FR-HEA-06 |
| RG-34 | FR-HEA-07 |
| RG-38 | FR-HEA-05, FR-HEA-09; ECR-HEA-04 |
| RG-39 | FR-HEA-03, FR-HEA-04 |
| DEC-08 | FR-HEA-06 |
| DEC-10 | FR-HEA-09; §7 (bilingual screens) |
| DEC-16 | FR-HEA-02 |
| DEC-20 | FR-HEA-10 |
| DEC-22 | FR-HEA-05, FR-HEA-07; §9 (auditability) |
| DEC-26 | FR-HEA-08; §5 (point 2), §9 (localization) |
| DEC-30 | FR-HEA-09 |
| DEC-32 | FR-HEA-06 |
| G-14 | §1; FR-HEA-06 |
| H-05, H-15 | FR-HEA-02; OQ-04 |
| Q-04 | FR-HEA-07 |
| INV-22, INV-23 | FR-HEA-06 |
| INV-24 | FR-HEA-02, FR-HEA-06, FR-HEA-10 |
| INV-33 | FR-HEA-05 |
| INV-35 | FR-HEA-10 |
| `prd/research/02-regulatory-data.md` §2 | FR-HEA-02; §5 (points 1 and 2); OQ-04 |
| `prd/research/00-baseline-corrections.md` no. 1, 5, 19 | FR-HEA-02; §5 (points 1, 6, 7); OQ-04 |
| `prd/cross-cutting/42-review-arbitrations.md` | ARB-13 (FR-HEA-01, FR-HEA-02, FR-HEA-06, FR-HEA-07, §6, OQ-06, OQ-07); ARB-26 (§5.7 time zone by reference) |
