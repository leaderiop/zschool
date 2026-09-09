# PRD ZSchool — Journey 06: Naïma, Custodial Mother, and the Father as Legal Tutor

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09; supersedes 0.2 — revised 09/09/2026) |
| Date | 2026-09-09 |
| Status | PRD draft — under review; arbitrations ARB-01 to ARB-26 applied (`prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §2.7 (regulatory framework, the Moudawana), §5.2 (personas), §6.1 (RG-01, RG-02), §6.4 (parent–student relationship, RG-12b to RG-16), §12 (scope by version), §14 (DEC-20, DEC-24, DEC-30, DEC-32, DEC-36), §17 (glossary); `prd/research/02-regulatory-data.md` §5 (the Family Code); `prd/research/00-baseline-corrections.md` (correction No. 5) |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md` (§2.6, §3.6: BES-GAR-01 to BES-GAR-07), `prd/03-domain-data-model.md` (§2.2, §4, §7: INV-09 to INV-13, INV-35), `prd/journeys/00-journey-map.md` (PC-01, PC-04, PC-05, PC-06, PC-07, PC-09, PC-10, PC-11), `prd/journeys/05-multi-school-parent.md` (the multi-school parent), `prd/journeys/07-students-minor-and-adult.md` (students), `prd/modules/10-administration-onboarding-subscription.md` (administration), `prd/modules/11-admissions-enrollment-reenrollment.md` (enrollment), `prd/modules/15-documents-certificates.md` (documents), `prd/modules/16-finance-billing-collections.md` (finance), `prd/modules/17-communication-notifications.md` (communication), `prd/modules/18-transfers-mobility.md` (transfers), `prd/modules/23-health-sensitive-data.md` (health, V2+) |

---

## 1. Purpose and scope

### 1.1 Lead personas

This file describes the journeys of the separated parental couple, seen from both sides at once:

- **Naïma, a separated mother, holder of custody** (*hadana*, الحاضن(ة)): wants to receive all of her daughter's information; obtain administrative school documents without going through the father; tracked, enforceable rights; conflicts arbitrated by the school, never by the platform (§5.2, §2.7; `prd/02-actors-personas.md` §2.6).
- **The father, legal tutor** (*wali*, الولي الشرعي) and **financially responsible parent**: the required signer for reserved acts (enrollment, transfer, leaving certificate, RG-14b), payer of fees, and, like any registered parent, informed by default (RG-13, §2.8).

Both parents each hold their own global identity and their own account; no account is shared (→ RG-12b, INV-13). Their daughter, **Lina, 9, a Grade 4 student at School A (Rabat)**, is a minor throughout this journey's core (a single scenario set, ARB-26f); the case of a student reaching majority is handled in PJ-GAR-06 on the parental side as a **projection**, illustrated by Salma (2nd-year baccalaureate, `prd/journeys/07-students-minor-and-adult.md`), not by Lina.

### 1.2 Scope covered and not covered

| Covered in this file | Not covered (referred elsewhere) |
|---|---|
| Recording distinct qualities and their supporting documents (PJ-GAR-01) | The generic multi-school parent journey (claim, dashboard, payment): `prd/journeys/05-multi-school-parent.md` |
| Default dual notification for both parents (PJ-GAR-02) | The minor or adult student's experience (viewing, a restriction by the student): `prd/journeys/07-students-minor-and-adult.md` |
| Acts reserved for the legal tutor and documents accessible to the custodial mother (PJ-GAR-03) | Detailed module requirements: `prd/modules/10-administration-onboarding-subscription.md` to `prd/modules/23-health-sensitive-data.md` (referenced only by file path, as those files are written in parallel) |
| Access restriction on a court ruling (PJ-GAR-04) | Detailed fine-grained permissions and the audit log: `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md` |
| A conflict between guardians and arbitration by the school (PJ-GAR-05) | Health data (a V2+ module, `prd/modules/23-health-sensitive-data.md`): mentioned only for the adult student's access restriction |
| An adult student: a restriction by the student, financial access maintained (PJ-GAR-06) | |
| The "guardianship regime" parameter and the reform's possible future entry into force (PJ-GAR-07) | |

## 2. Legal framework and product principles

### 2.1 The Family Code in force (Law 70-03 of 2004)

As of September 9, 2026, the applicable law is the 2004 Family Code (sources: `prd/research/02-regulatory-data.md` §5, per medias24 of 12/08/2026 and lesmre.com):

- **Art. 236**: the father is the legal tutor (*wali*) by right; the mother only assumes tutorship if the father is unavailable for urgent matters, or by right on the father's death, absence, or incapacity, or by a court ruling (→ RG-14b).
- **Art. 171**: custody (*hadana*) goes to the mother, then the father, then the maternal grandmother.
- **Art. 209**: civil majority is reached at 18 Gregorian years completed (the basis for RG-02 and DEC-20).
- **Art. 182**: the non-custodial parent keeps a right of visitation and a say in the child's upbringing (numbering 180-186 to be confirmed against the Official Gazette — `prd/research/02-regulatory-data.md` §5).

### 2.2 The May 30, 2023 ministerial position on documents

The custodial mother may obtain the child's administrative school documents; on conflict, referral to the King's prosecutor (source: `prd/research/02-regulatory-data.md` §5, madar21.com; carried forward in baseline §2.7). This position grounds the "documents accessible to the custodian" component of PJ-GAR-03 and the conflict rule of PJ-GAR-05. It combines with the rule against blocking official documents for unpaid fees (→ DEC-24) and with the penalty, introduced by Law 59.21, for refusing to issue certificates and attestations when the contract is being honored (source: `prd/research/00-baseline-corrections.md` No. 2, Official Gazette No. 7485 of 23/02/2026).

### 2.3 Family Code reform: status as of 09/09/2026 and a baseline discrepancy

A logged discrepancy (→ `prd/research/00-baseline-corrections.md` No. 5):

- **Baseline (§2.7)**: "the reform validated in December 2024 (custody by the mother for routine acts) is not in force."
- **Research finding**: the December 2024 text is a **report of proposals** by the Revision Authority delivered to the King on 23/12/2024 (139 provisions); nothing has been voted or promulgated as of 12/08/2026, and parliamentary review is expected in the next legislature (source: medias24 of 12/08/2026, via `prd/research/02-regulatory-data.md` §5).

Treatment adopted across the PRD: the PRD keeps the up-to-date data (a report of proposals, not a law); the "legal tutor" and "holder of custody" qualities stay recorded separately with the 2004 Code's defaults (RG-14b unchanged); an evolvable "guardianship regime" parameter is planned to record any future entry into force with no schema rework (PJ-GAR-07). Updating baseline §2.7 remains to be logged in review (→ OQ-01).

### 2.4 Derived product principles

| # | Principle | Basis |
|---|---|---|
| P1 | "Legal tutor," "holder of custody," "financially responsible," "emergency contact," and "authorized to pick up the child" qualities are recorded separately and cumulatively, with a supporting document when configuration departs from the legal default | (→ §6.4, RG-14b, INV-11, INV-12) |
| P2 | As long as both parents are registered and no court ruling is recorded, both receive notifications and access school information | (→ RG-13, RG-14) |
| P3 | A parent's access is restricted only by a court ruling recorded by the school, with an attachment and traceability | (→ RG-14, INV-10) |
| P4 | Reserved acts (enrollment, transfer, leaving certificate) require the legal tutor's signature; routine administrative documents are accessible to the custodial parent | (→ RG-14b, the ministerial position of 30/05/2023) |
| P5 | On conflicting requests, ZSchool flags it to the school and does not decide; the school stays the operational arbiter and may request a ruling or the King's prosecutor's opinion | (→ RG-16, RG-14b) |
| P6 | At 18 years completed, the student restricts parental access to school, disciplinary, and health data herself; the financially responsible parent keeps financial access as long as they remain liable | (→ RG-02, DEC-20, art. 209) |
| P7 | The guardianship regime is an evolvable parameter: defaults change if the reform enters into force, the schema does not | (→ RG-14b, correction No. 5) |

## 3. Applicable qualities, rights, and defaults

### 3.1 Catalog of qualities

| Quality | Legal term | Source | Expected supporting document | Effects in ZSchool | Scope |
|---|---|---|---|---|---|
| Legal tutor | Holder of tutorship (*wilaya*, الولي الشرعي) | Family Code, art. 236 (§2.7; `prd/research/02-regulatory-data.md` §5) | None for the father (the legal default); a ruling, a death certificate, or an absence/incapacity document for any other configuration (the mother as tutor, a court-appointed tutor) | The required signer for reserved acts: enrollment, transfer, leaving certificate (→ RG-14b, INV-11) | A global quality of the parent–student relationship |
| Holder of custody | *Hadana* (الحضانة) | Family Code, art. 171 | **None for the mother** when a separation is declared (the legal default under art. 171, many separations having no ruling); a ruling or document only when custody departs from the legal order (custody to the father, the grandmother, shared custody) | Daily life: administrative documents (self-service enrollment certificate, ARB-20f), picking up the child, an emergency contact, routine authorizations; may initiate a transfer or leaving-certificate request, which awaits the tutor's signature (ARB-22) | A global quality of the relationship |
| Legal guardian (an information status) | — | RG-13 | None: the default applied to both registered parents | Default notifications and access to school information; the signer for non-reserved acts | A global quality of the relationship |
| Financially responsible | المسؤول عن الأداء | RG-13; §2.8 | None; may be a third party who is not a legal guardian | Payment schedule, payments, receipts, financial history; financial access kept with an adult student as long as they remain liable (→ RG-02, DEC-20) | Carried by the enrollment (a school-context attribute) |
| Emergency contact | — | §6.4 | None | Priority to call on an incident | A school-context attribute (→ RG-15) |
| Person authorized to pick up the child | — | §6.4 | None | Outings, handing the child over at day's end | A school-context attribute (→ RG-15) |

The relationship also carries **access rights** (viewing grades, absences, documents, finance, communicating with the school, authorizing outings, signing electronically) and a **status** (active, suspended, revoked, with a supporting document) (§6.4, `prd/03-domain-data-model.md` §2.2).

### 3.2 Defaults when creating a relationship with two parents

1. Both parents are registered **legal guardians by default** and both receive notifications, unless configured otherwise on the basis of a court ruling (→ RG-13, RG-14).
2. The father is registered **legal tutor by default** (art. 236); the mother becomes tutor on the father's death, absence, or incapacity, or by a ruling, with an attachment (→ RG-14b, INV-11).
3. The **holder of custody** quality follows the order of art. 171 (mother, then father, then maternal grandmother): when a separation is declared, the mother is registered as custodian **with no document required** (the legal default); a supporting document is required only to depart from this order.
4. The **financially responsible parent** is designated at enrollment; they may be one of the parents or a third party (→ RG-13, INV-09).
5. The baseline's example (§6.4: the father as "legal guardian, financially responsible," the mother as "holder of custody, emergency contact") illustrates a **documented** configuration for a separated couple; it does not change the RG-13 default absent a court ruling recorded by the school.

### 3.3 A functional reading of the legal-guardian / legal-tutor / holder-of-custody distinction

The baseline uses "legal guardian" for the default of information and notification for both parents (RG-13) and "legal tutor" for the required signer of reserved acts (RG-14b); the glossary (§17) equates a legal guardian with the holder of tutorship. ZSchool applies the following operational reading, without ever ruling on family law: the legal-guardian quality (a default for both parents) carries information and notifications; the legal-tutor designation carries reserved signatures; the holder-of-custody quality carries daily life and administrative documents. No screen decides a tutorship dispute: only a supporting document (a ruling, an act) recorded by the school changes the defaults. The terminology point remains to be aligned in review (→ OQ-02).

## 4. Detailed journeys

Seven journeys `PJ-GAR-NN`, a counter starting at 01, a namespace exclusive to this file (conventions §2). Steps cite the critical journeys `PC-NN` of `prd/journeys/00-journey-map.md` without duplicating them.

### PJ-GAR-01 — Recording distinct qualities and supporting documents

| Attribute | Value |
|---|---|
| Objective | Capture, from enrollment, who is the legal tutor, who holds custody, and who is financially responsible, with the required supporting documents, so that every downstream right is grounded in a complete, traceable file. |
| Actors | Secretariat (entry and documents), leadership (checking), father and mother (declarations, submitting documents), the student involved. |
| Trigger | Admission of a new student (PC-01) or regularizing an existing relationship (e.g. a divorce ruling submitted mid-year). |
| Expected outcome | An active parent–student relationship with exact qualities, attached and timestamped supporting documents, and a correct status. |
| Modules involved | INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), ADM (`prd/modules/10-administration-onboarding-subscription.md`), DOC (`prd/modules/15-documents-certificates.md`); full self-service DOC in V1. |
| Related journeys | PC-01, PC-04 (`prd/journeys/00-journey-map.md`). |
| Version | MVP: qualities, defaults, statuses, and the relationship's supporting documents uploaded and encrypted (ARB-13, consistent with PJ-SEC-01.4); V1: tooled file-completeness checking (BES-SEC-06) and document self-service. |
| Baseline | (→ RG-12b, RG-13, RG-14b, RG-15, INV-09 to INV-13; BES-GAR-02, BES-GAR-03; §7.2) |

Steps:

1. **Secretariat** — at admission, creates the student profile then both parents' relationships; the form defaults to two parents and allows adding others (a tutor, a grandparent); each guardian has their own account (→ RG-12b).
2. **System** — applies the §3.2 defaults: both parents as legal guardians (→ RG-13), the father as legal tutor (art. 236), with no document required for these defaults.
3. **Secretariat** — if a separation is declared: records Naïma's "holder of custody" quality **with no document required** (the legal default under art. 171); attaches the ruling if it exists (which then records any restrictions, PJ-GAR-04); fills in the school's context attributes (an emergency contact, people authorized to pick up the child, communication preferences) (→ RG-15, OQ-04 of `prd/03-domain-data-model.md`).
4. **Secretariat** — any configuration departing from the legal default (the mother as tutor, a court-appointed tutor, custody to the father or a third party, a financially responsible third party unrelated to the parents) requires the matching document (a ruling, a death certificate, an attestation) uploaded and encrypted from MVP (ARB-13); the system refuses to activate a non-default quality with no attachment.
5. **System** — strongly encrypts rulings and ID documents, historizes every quality creation and change with author, timestamp, and document reference (→ RG-38, `prd/03-domain-data-model.md` §6: strong encryption for rulings).
6. **Secretariat** — sends both parents an account-claim invitation; each activates their own access (PC-04); Naïma sees her qualities and associated rights in her portal (→ BES-GAR-02, BES-GAR-03).
7. **Leadership** — on activating the enrollment (PRE-ENROLLED to ACTIVE), checks for at least one active legal guardian and one financially responsible parent (→ RG-13, INV-09).

```gherkin
Feature: Recording a parent–student relationship's qualities
  Scenario: Custody to the mother by legal default with no supporting document (MVP)
    Given a "mother–student" relationship being created with a declared separation
    When the secretariat records the mother's "holder of custody" quality with no attachment
    Then the quality is active immediately under the article 171 legal default
    And the mother carries the rights attached to this quality

  Scenario: Custody attributed to the father, outside the legal order, with no supporting document (MVP)
    Given a "father–student" relationship being created
    When the secretariat records the father's "holder of custody" quality with no ruling attached
    Then the quality is recorded "awaiting a supporting document"
    And the relationship does not carry the extended rights attached to this quality until a document is attached
    And a reminder appears on the school's incomplete-files table

  Scenario: A configuration matching the legal defaults (MVP)
    Given a student enrolled with both father and mother registered
    And no court ruling submitted to the school
    When the relationship is activated
    Then both parents carry the legal-guardian quality and receive notifications by default
    And the father carries the legal-tutor designation with no document required
    And every quality-creation operation is logged with author and timestamp
```

### PJ-GAR-02 — Daily life: both parents informed by default

| Attribute | Value |
|---|---|
| Objective | Guarantee that, under normal conditions with no court ruling, each parent receives their child's information alongside the other: no school "chooses" its parental contact. |
| Actors | Father and mother (recipients), teachers and the head supervisor (alert senders), leadership (communication settings), secretariat (financial reminders). |
| Trigger | Any notifiable event: an absence (PC-05), a report-card publication (PC-06), a due installment and a financial reminder (PC-07), an announcement or summons (PC-11). |
| Expected outcome | Every event is delivered to both parents per their channel preferences, with neither able to cut off the other. |
| Modules involved | COM (`prd/modules/17-communication-notifications.md`), VSC (`prd/modules/13-attendance-student-life-discipline.md`), FIN (`prd/modules/16-finance-billing-collections.md`), EVA (`prd/modules/14-assessments-grades-report-cards.md`). |
| Related journeys | PC-05, PC-06, PC-07, PC-11 (`prd/journeys/00-journey-map.md`). |
| Version | MVP: in-app and SMS notifications in each parent's language, WhatsApp "utility" limited to attendance notifications (ARB-21); V1: the general WhatsApp Business API and push notifications (§12; DEC-36). |
| Baseline | (→ RG-13, RG-14, RG-15; BES-GAR-01, BES-GAR-05; DEC-12, DEC-36) |

Steps:

1. **System** — on every notifiable event (e.g. `AbsenceRecorded`, `ReportCardPublished`, `InstallmentOverdue`; `prd/03-domain-data-model.md` §7), routes the notification to **every active legal guardian and the holder of custody**, so to the father and Naïma simultaneously (→ RG-13, RG-14).
2. **Each parent** — sets their own channel preferences (in-app, SMS, WhatsApp opt-in; push in V1) and language (a per-person preference: Naïma in Arabic, the father in French, ARB-21c) and may mute announcements and reminders (a "STOP" opt-out, never for attendance and security notifications, ARB-21d); these preferences are context attributes (→ RG-15) and **never change** the other parent's access rights.
3. **Leadership** — configures routing per message type and delays; the school can only exclude a legal guardian from information by recording a court ruling (PJ-GAR-04); no action by a parent has this effect (→ RG-14).
4. **System** — keeps, for every send, a delivery trace (channel, status, cost) charged to the school (→ DEC-36; `prd/03-domain-data-model.md` §2.6 `DeliveryLog`).
5. **Naïma** — receives, like the father, the morning's absence notification, the report-card publication, and announcements; she views them from her own account, with no need to go through the father's (→ BES-GAR-01, BES-GAR-05).

```gherkin
Feature: Default dual notification
  Scenario: An absence notified to both parents (MVP)
    Given a student whose father and mother are registered active legal guardians
    And no access restriction recorded
    When the morning roll call is validated with the student absent
    Then the father and mother each receive the day's first absence notification within under 5 minutes, each in their language
    And each send produces a distinct delivery trace per parent

  Scenario: One parent cannot remove the other's information (MVP)
    Given a father holding his own account
    When he changes his own relationship's communication preferences
    Then only his own channels are changed
    And the mother's information rights and notifications stay unchanged
```

### PJ-GAR-03 — Acts reserved for the legal tutor and documents accessible to the custodial mother

| Attribute | Value |
|---|---|
| Objective | Clearly separate two families of operations: **reserved acts** (enrollment, transfer, leaving certificate) requiring the legal tutor's signature, and **administrative documents** (an enrollment certificate, a transcript, an information sheet) that the custodial parent obtains herself, per the ministerial position of 30/05/2023. |
| Actors | The father (legal tutor, signer of reserved acts), Naïma (custodian, requester of documents), secretariat (front-desk documents), leadership (self-service configuration, seal), a third-party verifier (QR code). |
| Trigger | Re-enrollment or a new enrollment; a transfer request; leaving the school; the custodian's administrative need. |
| Expected outcome | Reserved acts are validated only with the required signature; administrative documents are obtained by Naïma with no involvement from the father, with no blocking for unpaid fees. |
| Modules involved | INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), TRA (`prd/modules/18-transfers-mobility.md`), DOC (`prd/modules/15-documents-certificates.md`), FIN (`prd/modules/16-finance-billing-collections.md`), ADM (`prd/modules/10-administration-onboarding-subscription.md`). |
| Related journeys | PC-01, PC-09, PC-10 (`prd/journeys/00-journey-map.md`). |
| Version | MVP: the legal tutor's signature at enrollment, a transfer (initiated by the custodian, the tutor's signature, ARB-22), a leaving certificate within the PDF exit dossier (§12, DEC-32), a front-desk enrollment certificate for the custodian (ARB-20f); V1: self-service documents with QR, the exit dossier's time-limited secure link, an advanced electronic seal and timestamp (DEC-30, DEC-32). |
| Baseline | (→ RG-14b, INV-11, DEC-24, DEC-30, DEC-32; BES-GAR-04, BES-GAR-07; §2.7, §7.6, §7.9) |

Steps:

1. **System** — maintains the list of reserved acts: signing the contract and the enrollment, requesting and consenting to a transfer, requesting a leaving certificate; the required signer is the registered legal tutor (→ RG-14b, INV-11).
2. **Naïma** — initiates, for instance, a transfer request from her portal (any legal guardian, the custodian, or the adult student may initiate it, ARB-22; consistent with FR-TRA-01); the system identifies that the required signer is the father and sends him the signature request (a notification with a link); Naïma tracks the request's status (initiated, awaiting signature, validated, accepted, activated, refused, cancelled, expired).
3. **The father** — signs the act from his account (an electronic signature; an advanced level for the parent contract in V1, → DEC-30); without his signature, the act stays pending and is not submitted to leadership.
4. **Naïma** — in parallel, obtains documents the school authorizes: an enrollment certificate (a single term, ARB-20g), a grade transcript, an information sheet, bilingual, numbered — at the front desk in MVP, self-service with a QR code in V1; no signature or account from the father is requested (the ministerial position of 30/05/2023, ARB-20f; → BES-GAR-04; aligned with `prd/journeys/02` PJ-SEC-04.2).
5. **System** — applies **no blocking** to these documents for unpaid fees: arrears show up as an alert on the school-side record; the **account statement is given only to the financially responsible parent** (the father), never to Naïma who does not hold this quality (→ DEC-24, INV-39, ARB-20e); refusing issuance is further penalized by Law 59.21 when the contract is being honored (→ `prd/research/00-baseline-corrections.md` No. 2).
6. **Leadership** — on departure, generates the leaving certificate and the exit dossier (a bilingual PDF; a time-limited secure link with a QR code in V1); Naïma may initiate the request, the certificate requires the legal tutor's signature on the request (or the adult student's), issuance stays a school obligation; the dossier given to Naïma excludes the financial component (→ RG-14b, DEC-24, DEC-32, ARB-20e/f).
7. **System** — logs requests, signatures, and issuances with author, timestamp, and document reference (written traceability of requests/issuances; → RG-38).

```gherkin
Feature: Distinguishing reserved acts and administrative documents
  Scenario: A transfer request by the custodial mother (MVP)
    Given a minor student whose father is the registered legal tutor
    And whose mother holds custody
    When the mother submits a transfer request
    Then the request is created under her name and moves to "awaiting the legal tutor's signature"
    And the father receives a signature request on his own account
    And leadership only receives the request for validation after the legal tutor signs

  Scenario: An enrollment certificate obtained by the mother with no involvement from the father (MVP at the front desk, V1 self-service)
    Given Lina, an active Grade 4 student, whose mother holds custody
    And an unsettled financial balance on the enrollment
    When the mother requests the enrollment certificate
    Then the certificate is generated bilingual and numbered (QR-verifiable in V1)
    And no signature or account from the legal tutor is required
    And the arrears alert appears on the school-side record, with no blocking of the document
    And no account statement is given to the mother, who is not the financially responsible parent
```

### PJ-GAR-04 — Restricting a parent's access on a court ruling

| Attribute | Value |
|---|---|
| Objective | Offer the only legitimate mechanism to remove a parent's access: a court ruling, recorded by the school, with a full attachment and traceability; no actor (a parent, a teacher, or ZSchool) can restrict a parent through a mere setting. |
| Actors | Leadership (recording the decision), secretariat (preparation), the restricted parent and the other parent (informed), ZSchool (no initiative). |
| Trigger | A ruling submitted to the school (a total or partial restriction of a parent's access, removing signing authority, lifting a restriction). |
| Expected outcome | The parent's rights are adjusted to the ruling's exact scope, at the effective date, with an attachment, logging, and information to those involved; every view of the restriction is tracked. |
| Modules involved | ADM (`prd/modules/10-administration-onboarding-subscription.md`), INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), COM (`prd/modules/17-communication-notifications.md`), the audit log (`prd/cross-cutting/31-security-privacy.md`). |
| Related journeys | PC-04, PC-11 (`prd/journeys/00-journey-map.md`). |
| Version | MVP (BES-GAR-06; INV-10; the full audit log in V1, INV-33). |
| Baseline | (→ RG-14, RG-14b, RG-16, INV-10, INV-33; BES-GAR-06) |

Steps:

1. **The family** — a parent (e.g. the mother) submits a court ruling restricting the father's access to leadership, or vice versa; the school stays the judge of whether to record it.
2. **Leadership** — opens the recording wizard: selecting the parent involved, the ruling type (a total or partial restriction), the scope (by rights family: grades and assessments, absences and student life, documents, communication, finance, signatures, authorizations), an effective date, a **mandatory** attachment (a scanned ruling).
3. **System** — refuses any recording with no attachment; strongly encrypts the document; does not allow a parent or ZSchool to record a restriction themselves.
4. **System** — at the effective date, applies the restriction to the relationship's rights **for the school that attached the ruling**: the matching screens and notifications disappear from the restricted parent's portal for this school; other schools where the relationship is active receive the `AccessRestrictionRecorded` event and must in turn record the ruling, after checking the document, to apply it on their side (RG-14: "recorded by the school, with an attachment"; ARB-11).
5. **System** — logs the recording, changes, and views of the restriction in the immutable, exportable audit log (author, context, timestamp) (→ RG-38, INV-33).
6. **System** — notifies the restricted parent and the other parent: the ruling's existence, scope, date, and reference; the restricted parent keeps access to the restriction notice and its supporting document per the school's visibility settings (→ BES-GAR-06; → OQ-04).
7. **Leadership** — on a new ruling (lifting or changing the restriction), records the next decision; the history of successive restrictions stays viewable, with each version timestamped.
8. **System** — with no ruling recorded, **no** restriction is possible: the RG-13/RG-14 default applies permanently.

```gherkin
Feature: Restricting a parent's access on a court ruling
  Scenario: Recording a partial restriction (MVP)
    Given an active student whose father and mother are active legal guardians
    And a court ruling restricting the father's access to school and disciplinary data only
    When leadership records the ruling with the ruling attached and an effective date of the same day
    Then the father's relationship is adjusted from the effective date: grades, absences, and report cards no longer show in his portal
    And his other rights not covered by the ruling, including financial access if he is financially responsible, remain
    And the recording appears in the audit log with the author, timestamp, and attachment reference
    And the father and mother are notified of the restriction, its scope, and its reference
    And the other school where Lina is enrolled is notified and must record the ruling in turn to apply it

  Scenario: Refusing to record with no attachment (MVP)
    Given leadership wanting to restrict a parent's access
    When it validates the restriction with no attachment
    Then the system refuses the recording and shows that a supporting document is mandatory
    And no parent's rights are changed
    And the refused attempt is logged in the audit log

  Scenario: Lifting a restriction on a new ruling (MVP)
    Given an access restriction recorded on the father's relationship
    When leadership records a new court ruling lifting the restriction
    Then the father's default rights are restored at the new ruling's effective date
    And the full history of restrictions and lifts stays viewable with their supporting documents

  Scenario: No restriction outside a court ruling (MVP)
    Given a conflict between the two parents with no ruling submitted
    When a staff member or a parent tries to remove the other parent's information rights
    Then no such action exists in the interface for this purpose
    And the conflict is flagged to the school per journey PJ-GAR-05
```

### PJ-GAR-05 — A conflict between guardians: flagged to the school, ZSchool does not decide

| Attribute | Value |
|---|---|
| Objective | Turn conflicting parental requests into a workable file for the school, the sole operational arbiter: ZSchool detects, flags, logs, and waits, never siding with either parent. |
| Actors | Father and mother (authors of conflicting requests), leadership (arbitration), secretariat (tracking), teachers and the head supervisor (affected by the decisions' effects). |
| Trigger | Two conflicting requests concerning the same student: transfers to different schools, opposing departure authorizations, competing pickup claims, a contested recorded quality. |
| Expected outcome | A single, timestamped flag on the student's record; the acts in conflict stay blocked until arbitration; the school may request a ruling or the King's prosecutor's opinion and attach it to the file. |
| Modules involved | ADM (`prd/modules/10-administration-onboarding-subscription.md`), INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), TRA (`prd/modules/18-transfers-mobility.md`), COM (`prd/modules/17-communication-notifications.md`). |
| Related journeys | PC-09, PC-11 (`prd/journeys/00-journey-map.md`). |
| Version | MVP (flagging and blocking conflicting acts; RG-16 and RG-14b with no baseline version split); V1: tooled summons and meetings for arbitration. |
| Baseline | (→ RG-16, RG-14b, RG-14, RG-15) |

Steps:

1. **Father and mother** — submit conflicting requests from their respective accounts (e.g. two transfer requests to two different schools).
2. **System** — detects the contradiction on the same student and the same object; creates a timestamped **conflict flag** on the student's record; marks the requests involved "in conflict — awaiting the school's arbitration"; neither request is executed (→ RG-16).
3. **System** — notifies leadership (a conflicts table, a notification); exchanges with parents continue on the school's channels, with each staying informed per their rights (→ RG-13).
4. **Leadership** — processes the file: reviews the timestamped history of requests, summons the parents (V1), and may ask the parents for a ruling or the King's prosecutor's opinion, which it attaches to the student's file (→ RG-14b).
5. **Leadership** — decides under operational arbitration (accept, refuse, defer); its decision is recorded and notified to both parents; supporting documents produced (a ruling, a prosecutor's opinion) then feed the defaults (a restriction, a changed quality) per PJ-GAR-04 and PJ-GAR-01.
6. **System** — logs the flag, attachments, the school's decision, and notifications; ZSchool never appears as the decision-maker (→ RG-16).

```gherkin
Feature: A conflict between guardians
  Scenario: Conflicting transfer requests (MVP)
    Given a minor student whose father and mother are active legal guardians
    When the father submits a transfer request to School X
    And the mother submits a transfer request to School Y
    Then both requests are marked "in conflict — awaiting the school's arbitration"
    And neither is submitted for validation
    And leadership is notified of the flag with the timestamped history of both requests

  Scenario: The school's arbitration (MVP)
    Given a conflict flagged on a student
    When leadership records its decision to go with the father's request
    Then the decision is logged and notified to both parents
    And the chosen request resumes its normal validation path
    And ZSchool expresses no preference between the parents at any step
```

### PJ-GAR-06 — Adult student: a restriction by the student, financial access kept by the payer (a projection)

**Projection.** Lina is 9: this journey describes what her parents will experience in nine years. It is illustrated by **Salma, 18, 2nd-year baccalaureate** (`prd/journeys/07-students-minor-and-adult.md`), whose father is financially responsible and mother holds custody, a configuration identical to Naïma's (ARB-26f).

| Attribute | Value |
|---|---|
| Objective | Apply civil majority (art. 209): at 18 years completed, the student becomes the holder of her own account and rights; she may restrict parental access to school, disciplinary, and health data; the father, financially responsible, keeps access to financial and contractual data as long as he owes fees. |
| Actors | The student who has reached majority (holder of the decisions), the father (financially responsible), the custodial mother (a parent informed of the restriction), leadership (notified, possible mediation). |
| Trigger | Reaching the 18th birthday (event `StudentReachedMajority`) or a decision by the adult student during the year. |
| Expected outcome | Restrictions applied to the exact scope, logged, notified to the school and parents; the payer's financial access intact; information on rights given at majority and at each re-enrollment. |
| Modules involved | ADM (`prd/modules/10-administration-onboarding-subscription.md`), INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), FIN (`prd/modules/16-finance-billing-collections.md`), COM (`prd/modules/17-communication-notifications.md`), HEA (`prd/modules/23-health-sensitive-data.md`, V2+ for health data). |
| Related journeys | PC-06, PC-10 (`prd/journeys/00-journey-map.md`); the student's experience: `prd/journeys/07-students-minor-and-adult.md`. |
| Version | **MVP** (INV-35, ARB-10; BES-ELE-05 and BES-ELE-07 realigned to MVP, RG-02 being a legal rule and pilots having 2nd-year baccalaureate students reaching 18 in 2026-2027; OQ-03 resolved). Health data: on the HEA module's release (V2+). |
| Baseline | (→ RG-02, RG-01, DEC-20, INV-35; BES-GAR-07, BES-ELE-05, BES-ELE-07; art. 209) |

Steps:

1. **System** — on the 18th birthday, issues the `StudentReachedMajority` event; the student is informed of her rights in her portal, and the information is repeated at every re-enrollment (→ RG-02, `prd/03-domain-data-model.md` §7).
2. **The adult student** — opens the parental-access management panel and restricts, by data family, her parents' access: school (grades, absences, report cards, documents), discipline, health; by default, guardians' access is maintained while the enrollment is active, the restriction being an act by the student, never a default (→ RG-02).
3. **System** — immediately applies the restrictions, logs them, and notifies the school; the parents involved see their portal adjusted with its cause (a restriction by the adult student) (→ RG-02, DEC-20).
4. **System** — fully maintains the **financially responsible parent's** access to financial and contractual data (payment schedule, invoices, receipts, history) as long as he owes fees; parents otherwise stay signers of the contract and payers despite the student's majority (→ RG-02, DEC-20, §2.8).
5. **The father and Naïma** — keep unrestricted uses (finance for the payer; anything the student has not restricted) and may communicate with the school, which stays an operational support (mediation, mutual information) (→ BES-GAR-07).
6. **The adult student** — may lift or adjust her restrictions at any time; every change is logged and notified to the school (→ RG-02).

```gherkin
Feature: Parental-access restriction by the adult student
  Scenario: A school and disciplinary restriction with finance maintained (MVP)
    Given an 18-year-old student enrolled in 2nd-year baccalaureate
    And her father registered as financially responsible and owing fees
    When the student restricts her parents' access to school and disciplinary data
    Then the father's and mother's portals no longer show grades, absences, report cards, or school documents
    And the father keeps access to financial and contractual data as long as he owes fees
    And the restriction is logged and notified to the school
    And both parents are informed of the restricted scope

  Scenario: Information on rights at majority (MVP)
    Given a student reaching 18 during the school year
    When the majority event is issued
    Then the student receives information on her rights in her portal
    And she receives this information again at the next re-enrollment
    And no parental access changes until she exercises her restriction power
```

### PJ-GAR-07 — The "guardianship regime" parameter and the reform's possible future entry into force

| Attribute | Value |
|---|---|
| Objective | Make a possible Family Code reform absorbable with no rework: tutorship and custody defaults are carried by a regime parameter, not hard-coded, so that a new regime's entry into force translates into a parameter change and a review campaign, not a model migration. |
| Actors | ZSchool (activating the regime value, on promulgation), schools (reviewing existing relationships), leadership (any local reconfiguration). |
| Trigger | Publication and entry into force of a text reforming tutorship and custody; otherwise, no change (the 2004 Code's regime stays active). |
| Expected outcome | A switchable regime value; new relationships' defaults updated; existing relationships flagged for review; no loss of supporting documents or history. |
| Modules involved | ADM (`prd/modules/10-administration-onboarding-subscription.md`), INS (`prd/modules/11-admissions-enrollment-reenrollment.md`), COM (`prd/modules/17-communication-notifications.md`). |
| Related journeys | PC-01, PC-03 (`prd/journeys/00-journey-map.md`). |
| Version | MVP: the parameter exists and carries the single value "Family Code 70-03" (RG-13/RG-14b defaults are parameterized from the start); V2+: activating a value matching the reform once promulgated, with a review campaign. |
| Baseline | (→ RG-14b, correction No. 5; §2.7) |

Steps:

1. **System** — stores the guardianship regime as a platform parameter, with the value "Family Code 70-03" active from MVP: the father as legal tutor by right, the custody order mother, then father, then maternal grandmother, majority at 18 (→ RG-14b; correction No. 5: "a parameter activatable with no schema rework").
2. **Schools** — use the parameter without changing it: the regime is a legal fact, not a school choice; qualities and defaults follow from it (PJ-GAR-01).
3. **ZSchool** — if the reform enters into force: activates the new value at the legal date, updates **new** relationships' defaults, informs schools, and triggers a review campaign for existing relationships (points to reconfirm: the legal-tutor quality, reserved acts possibly extended to the custodial mother for routine acts, per the promulgated text).
4. **Leadership** — reviews flagged relationships, attaches new documents where applicable, and validates; the history of qualities and supporting documents is kept in full (→ RG-38, DEC-22).
5. **System** — keeps traceability of the regime change (date, previous value, active value) in the platform's audit log.

```gherkin
Feature: Guardianship-regime changes
  Scenario: The regime unchanged with no promulgated reform (MVP)
    Given the regime parameter carrying the value "Family Code 70-03"
    When new parent–student relationships are created
    Then the defaults applied are the 2004 Code's: the father as legal tutor by right, custody per article 171
    And no review campaign is triggered

  Scenario: A new regime entering into force (V2+)
    Given a text reforming tutorship and custody entering into force on a legal date
    When ZSchool activates the matching regime value on that date
    Then relationships created afterward carry the new regime's defaults
    And existing relationships are flagged to schools for review, with no automatic change to their qualities
    And the regime change is logged with its dates and values
```

## 5. Summary matrix: qualities and uses for the separated couple

Reference configuration: the father as legal tutor and financially responsible; Naïma as holder of custody and emergency contact; Lina, a minor Grade 4 student; no restriction recorded unless noted otherwise.

| Use | The father (legal tutor, payer) | Naïma (custodian) | Basis |
|---|---|---|---|
| Receiving daily-life notifications (absences, tardiness, announcements, summons) | Yes (default) | Yes (default) | RG-13, RG-14 |
| Viewing her daughter's grades, absences, report cards | Yes (default) | Yes (default) | RG-13, RG-14 |
| Obtaining administrative documents (an enrollment certificate, a transcript, an information sheet) | Yes | Yes, with no signature or account from the father, with no blocking for unpaid fees; no account statement | RG-14b; the ministerial position of 30/05/2023; DEC-24; ARB-20e/f |
| Signing the enrollment and parent contract | Yes, signature required | No: an act reserved for the legal tutor | RG-14b, INV-11 |
| Requesting and consenting to a transfer | Yes, signature required | May initiate; the request awaits the legal tutor's signature | RG-14b, PJ-GAR-03, ARB-22 |
| Requesting the leaving certificate | Yes, signature required on the request | May initiate the request, which awaits the tutor's signature; issuance not blocked for unpaid fees; the dossier given with no financial component | RG-14b, DEC-24, DEC-32, ARB-20e/f |
| Paying, viewing the payment schedule, invoices, and receipts | Yes (financially responsible) | Informed per her rights; no charge to her account without designation | RG-13, §2.8, BES-GAR-07 |
| Excusing an absence with an attachment | Yes | Yes | §7.4, PC-05 |
| Giving a departure authorization, picking up the child | Yes | Yes (custodian, emergency contact) | §6.4, RG-15 |
| Communicating with teachers in a moderated thread | Yes | Yes | §7.8, DEC-34 |
| Viewing her quality, her rights, and her relationship's history | Yes | Yes | RG-15, BES-GAR-02 |
| Viewing her restricted access and its basis | Only on a court ruling recorded by the school involved | Only on a court ruling recorded by the school involved | RG-14, PJ-GAR-04, ARB-11 |
| Keeping financial access after the student's majority | Yes, as long as he owes fees | Per what the adult student has not restricted | RG-02, DEC-20, PJ-GAR-06 |

## 6. Logging, attachments, and retention

- **Audit log**: quality creations and changes, recording of court rulings (restrictions and lifts), conflict flags and the school's arbitrations, restrictions set by the adult student, guardianship-regime changes; every entry carries author, context, and timestamp; in MVP, immutable record-level historization of entries (D4, ARB-25j); an exportable audit log also covering sensitive views in V1 (→ RG-38, INV-33; 5-year retention, → DEC-22).
- **Attachments**: rulings, death certificates, incapacity attestations, and the King's prosecutor's opinions are linked to the relationship or the student's file, strongly encrypted, and viewable per the school's rights and visibility settings (`prd/03-domain-data-model.md` §2.4 `StudentDocument`, §6 strong encryption for rulings).
- **Traceability for parents**: Naïma and the father see the history of operations affecting their own relationship (qualities, restrictions concerning them, arbitrations concerning them); this visibility is the counterpart of the "restriction only on a court ruling" principle (→ BES-GAR-06).
- **Events**: the journey draws on the event catalog of `prd/03-domain-data-model.md` §7 (`StudentReachedMajority`, `TransferValidated`, `DocumentGenerated`, `EnrollmentStatusChanged`, `ConsentGranted`/`ConsentRevoked`, as well as `AccessRestrictionRecorded`, `GuardianConflictReported`, and `RelationshipQualityChanged`, now cataloged with producers and consumers — resolving OQ-05).

## 7. Key screens (text descriptions)

Screens described in text, mobile-first, systematically labeled in FR and AR (→ DEC-10). No `ECR-` identifier is created here: that namespace belongs to the module chapters (`prd/modules/10-administration-onboarding-subscription.md` to `prd/modules/23-health-sensitive-data.md`, conventions §2).

1. **A student record's family relationships** (school, web and mobile): a list of guardians with quality badges ("Legal tutor"/"الولي الشرعي", "Holder of custody"/"الحاضن(ة)", "Financially responsible"/"المسؤول عن الأداء", "Emergency contact"), the relationship's status, attached supporting documents with timestamps, actions (add a quality, attach a document, record a court ruling, flag a conflict), and a timestamped change history.
2. **A wizard to record a court ruling** (school): guided steps — the parent involved, type (a total or partial restriction), scope by rights family, an effective date, a mandatory attachment, a summary and confirmation; an explicit refusal with no attachment; a final summary showing the reference, scope, and effect.
3. **Naïma's parent portal**: a banner of qualities and rights at the top of the student screen ("Your qualities", "صفتكم"), a self-service "Administrative documents" entry, access to her relationship's history; if she is restricted, an information banner with scope, the ruling's reference, and access to the detail per settings.
4. **A signing screen for a reserved act** (the father): the document to sign, a reminder that it is a reserved act, an electronic signature; for Naïma, a read-only equivalent showing the request's status ("awaiting the legal tutor's signature").
5. **A conflict card** (school): a student record and a leadership table; a timestamped list of conflicting requests, arbitration status, actions (summon, attach a ruling or the prosecutor's opinion, record the decision); no "decide" button on the platform side.
6. **The "My access as an adult" panel** (the student portal, MVP — ARB-10): toggles per data family (school, discipline, health), an explicit note that the financially responsible parent's financial access is maintained as long as they owe fees, a history of restrictions set and lifted.

## 8. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | A baseline update on the Family Code reform. | **Escalated — ESC-03.** The baseline (§2.7) speaks of "a reform validated in December 2024"; research establishes a report of proposals delivered to the King on 23/12/2024 (139 provisions), not voted or promulgated as of 12/08/2026 (→ `prd/research/00-baseline-corrections.md` No. 5). This file keeps the up-to-date data; baseline §2.7 is to be corrected in review, as is the numbering of the visitation-right articles (180-186 to confirm against the Official Gazette). |
| OQ-02 | The RG-13/RG-14b/glossary terminology fit. | **Open** (the functional reading of §3.3 applied; the glossary to be aligned, ARB-26e; the baseline frozen, ESC-03). RG-13 makes both parents "legal guardians by default," RG-14b reserves acts to the "legal tutor" (the father by default, art. 236), and the glossary (§17) equates a legal guardian with the holder of tutorship. This file's §3.3 functional reading (an information status distinct from the signer designation) is proposed for review; the baseline stays frozen. |
| OQ-03 | The version for the adult student's restriction. | **Resolved — ARB-10**: MVP across every file (INV-35, BES-ELE-05/07, PJ-ELE-04/05, PJ-SUR-08, PJ-GAR-06). |
| OQ-04 | Visibility of a restriction's supporting document for the restricted parent. | **Open** (a working assumption applied). RG-14 requires an attachment and traceability; BES-GAR-06 gives the custodial parent the right to "see any restriction… with an attachment and traceability." Working assumption: the restricted parent is notified, sees the notice, scope, and reference of the ruling, and accesses the full supporting document unless the school configures otherwise (divorce rulings contain content unrelated to the school); to be settled in review with the compliance module (`prd/cross-cutting/36-legal-compliance-data-protection.md`). |
| OQ-05 | Enriching the event catalog of `prd/03-domain-data-model.md` §7. | **Resolved — ARB-26**: the three events this journey assumes (`AccessRestrictionRecorded`, `GuardianConflictReported`, `RelationshipQualityChanged`) are now in the §7 catalog of `prd/03-domain-data-model.md` with producers and consumers filled in. |

---

## Traceability

| Baseline ID | Baseline element | Coverage in this file |
|---|---|---|
| §2.7 | Regulatory framework: the Moudawana (art. 231, 236, 171), the May 2023 ministerial position, no document blocking | §2.1, §2.2; PJ-GAR-03, PJ-GAR-04, PJ-GAR-05 |
| §5.2 | Persona "Naïma, a separated mother, holder of custody" | §1.1; PJ-GAR-01 to PJ-GAR-07 |
| §6.4 | The parent–student relationship: cumulative qualities, rights, statuses; the father/Naïma example | §3.1, §3.2; PJ-GAR-01 |
| RG-12b | An unlimited number of guardians, one account per person | §1.1; PJ-GAR-01 |
| RG-13 | At least one active legal guardian and one financially responsible parent; default dual notification | §3.2; PJ-GAR-01, PJ-GAR-02, matrix §5 |
| RG-14 | Default access; restriction only on a recorded court ruling, with an attachment and traceability | §2.4 (P2, P3); PJ-GAR-02, PJ-GAR-04; matrix §5 |
| RG-14b | The legal tutor as the required signer (enrollment, transfer, leaving certificate); documents to the custodial parent; conflict: a ruling or the King's prosecutor; distinct qualities; adapting to reform | §2.1 to §2.3; PJ-GAR-01, PJ-GAR-03, PJ-GAR-05, PJ-GAR-07 |
| RG-15 | A global relationship with per-school context attributes | §3.1; PJ-GAR-01, PJ-GAR-02, PJ-GAR-04 |
| RG-16 | Conflicts flagged to the school, the operational arbiter; ZSchool does not decide | §2.4 (P5); PJ-GAR-05 |
| RG-02 | An adult student: holder of her own account, a school/discipline/health restriction, financial access kept for the payer | §2.4 (P6); PJ-GAR-06; matrix §5 |
| RG-01 | The student's personal access activated by a legal guardian | §1.1 (referring to `prd/journeys/07-students-minor-and-adult.md` for the student's experience) |
| DEC-20 | An adult student: a restriction by the student, financial access kept (detailing RG-02) | PJ-GAR-06 |
| DEC-24 | No blocking of official documents for unpaid fees | PJ-GAR-03; matrix §5 |
| DEC-30 | An advanced electronic seal, timestamp, and QR in V1; the parent contract at the advanced level | PJ-GAR-03 |
| DEC-32 | A bilingual PDF exit dossier, a time-limited secure link, QR (V1) | PJ-GAR-03 |
| DEC-34 | Moderated parent–teacher threads | §7, matrix §5 |
| DEC-36 | Notification channels: push, WhatsApp, an SMS fallback | PJ-GAR-02 |
| DEC-10 | An FR/AR interface, bilingual documents | §7 |
| DEC-22 | Retention periods (logs 5 years, permanent registers) | §6 |
| G-03 | Parental authority, custody, the financially responsible parent, conflicts (a gap resolved by §6.4) | §2, §3; PJ-GAR-01 to PJ-GAR-05 |
| §12 | MVP/V1/V2+ scope of the steps | "Version" columns of every PJ-GAR-NN journey |
| §17 | Glossary: legal guardian (الولي الشرعي), holder of custody (الحاضن(ة)), financially responsible (المسؤول عن الأداء) | §3.1, §3.3 |
| `prd/research/02-regulatory-data.md` §5 | The Family Code: art. 236, 171, 209, 182; the position of 30/05/2023; the reform not voted | §2.1 to §2.3; PJ-GAR-06, PJ-GAR-07 |
| `prd/research/00-baseline-corrections.md` No. 5 | The Moudawana correction (a report of proposals, not a law; an evolvable parameter) | §2.3; PJ-GAR-07; OQ-01 |
| `prd/research/00-baseline-corrections.md` No. 2 | Law 59.21: penalizing refusal to issue certificates | §2.2; PJ-GAR-03 |
| ARB-10, ARB-11, ARB-13 (`prd/cross-cutting/42-review-arbitrations.md`) | The adult student in MVP; the scope of court-ruling restrictions; documents encrypted per tenant | PJ-GAR-01, PJ-GAR-04, PJ-GAR-06, §6, §7, OQ-03 |
| ARB-20, ARB-21, ARB-22, ARB-25 | An attestation to the custodian, a statement to the payer, a leaving certificate signed by the tutor; language per person; transfer initiation; MVP historization | §3.1, §3.2, PJ-GAR-02, PJ-GAR-03, §5, §6 |
| ARB-26 (a single scenario set) | Lina (Grade 4, School A); PJ-GAR-06 as a projection illustrated by Salma | §1.1, PJ-GAR-06, §5 |
