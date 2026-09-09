> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-JNY-06                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification — Persona Journey                    |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/journeys/06-custodial-mother-and-guardian.md` (v0.3), old `PJ-GAR-01..07` -> `JNY-ZS-071..077`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Journey: Naïma, Custodial Mother, and the Father as Legal Tutor

## 1. Purpose and scope

This file describes the journeys of a separated parental couple, seen from both sides at once: **Naïma**, a separated mother and **holder of custody** (*hadana*, الحاضن(ة)) — she wants to receive every piece of her daughter's information, obtain administrative school documents without going through the father, and have tracked, enforceable rights, with conflicts arbitrated by the school, never by the platform; and **the father**, the **legal tutor** (*wali*, الولي الشرعي, INV-ZS-066) and **financially responsible parent** — the required signer for reserved acts (enrollment, transfer, leaving certificate), payer of fees, and, like any registered parent, informed by default (INV-ZS-064).

Both parents each hold their own global identity and their own account; no account is shared (INV-ZS-063, INV-ZS-030). Their daughter, **Lina, 9, a Grade 4 student**, is a minor throughout this journey's core; the case of a student reaching majority is handled in JNY-ZS-076 on the parental side as a **projection**, illustrated by Salma (2nd-year baccalaureate, `spec/journeys/07-students-minor-and-adult.md`), not by Lina.

**This file carries the legal-tutor/legal-guardian distinction most precisely of any journey file.** The two terms are never interchangeable: "legal guardian" (INV-ZS-064) is the broad default information/notification quality both registered parents hold; "legal tutor" (INV-ZS-066) is the narrow required signer for reserved acts, by default the father under Family Code art. 236; "holder of custody" (day-to-day care and administrative documents, INV-ZS-066) is a third, independent quality. See `spec/invariants.md` INV-ZS-064/INV-ZS-066 and `spec/glossary.md` §2.1.

In scope:

1. Recording distinct qualities and their supporting documents (JNY-ZS-071).
2. Default dual notification for both parents (JNY-ZS-072).
3. Acts reserved for the legal tutor and documents accessible to the custodial mother (JNY-ZS-073).
4. Access restriction on a court ruling (JNY-ZS-074).
5. A conflict between guardians and arbitration by the school (JNY-ZS-075).
6. An adult student: a restriction by the student, financial access maintained — a projection (JNY-ZS-076).
7. The "guardianship regime" parameter and the reform's possible future entry into force (JNY-ZS-077).

Out of scope (handled elsewhere): the generic multi-school parent journey — claim, dashboard, payment (`spec/journeys/05-multi-school-parent.md`); the minor or adult student's own experience, including a restriction set by the student herself (`spec/journeys/07-students-minor-and-adult.md`); detailed module requirements (`spec/behaviors/01-administration-onboarding-subscription.md` through `spec/behaviors/14-health-sensitive-data.md`); detailed fine-grained permissions and the audit log (`spec/cross-cutting/01-permissions.md`, `spec/cross-cutting/02-security-privacy.md`); health data (a V2+ module, `spec/behaviors/14-health-sensitive-data.md`), mentioned only for the adult student's access restriction.

---

## 2. Legal framework and product principles

### 2.1 The Family Code in force (Law 70-03 of 2004)

As of 2026-09-09, the applicable law is the 2004 Family Code:

- **Art. 236**: the father is the legal tutor (*wali*) by right; the mother only assumes tutorship if the father is unavailable for urgent matters, or by right on the father's death, absence, or incapacity, or by a court ruling (→ INV-ZS-066).
- **Art. 171**: custody (*hadana*) goes to the mother, then the father, then the maternal grandmother.
- **Art. 209**: civil majority is reached at 18 Gregorian years completed (the basis for INV-ZS-052 and ADR-ZS-001).
- **Art. 182**: the non-custodial parent keeps a right of visitation and a say in the child's upbringing.

### 2.2 The May 30, 2023 ministerial position on documents

The custodial mother may obtain the child's administrative school documents; on conflict, referral to the King's prosecutor. This position grounds the "documents accessible to the custodian" component of JNY-ZS-073 and the conflict rule of JNY-ZS-075. It combines with the rule against blocking official documents for unpaid fees (ADR-ZS-005) and with the penalty, introduced by Law 59.21, for refusing to issue certificates and attestations when the contract is being honored.

### 2.3 Family Code reform: status as of 2026-09-09 and a corrected baseline reading

The historical baseline (`spec/appendices/00-project-baseline.md` §2.7) describes "the reform validated in December 2024 (custody by the mother for routine acts)" as not yet in force. Research established the December 2024 text is a **report of proposals** by the Revision Authority delivered to the King on 23/12/2024 (139 provisions); nothing has been voted or promulgated as of the research date, and parliamentary review is expected in the next legislature.

Treatment adopted across the spec: the up-to-date data is kept (a report of proposals, not a law); the "legal tutor" and "holder of custody" qualities stay recorded separately with the 2004 Code's defaults (INV-ZS-066 unchanged); an evolvable "guardianship regime" parameter is planned to record any future entry into force with no schema rework (JNY-ZS-077).

### 2.4 Derived product principles

| # | Principle | Basis |
|---|---|---|
| P1 | "Legal tutor," "holder of custody," "financially responsible," "emergency contact," and "authorized to pick up the child" qualities are recorded separately and cumulatively, with a supporting document when configuration departs from the legal default | INV-ZS-066, INV-ZS-028, INV-ZS-029 |
| P2 | As long as both parents are registered and no court ruling is recorded, both receive notifications and access school information | INV-ZS-064, INV-ZS-065 |
| P3 | A parent's access is restricted only by a court ruling recorded by the school, with an attachment and traceability | INV-ZS-065, INV-ZS-027 |
| P4 | Reserved acts (enrollment, transfer, leaving certificate) require the legal tutor's signature; routine administrative documents are accessible to the custodial parent | INV-ZS-066, the ministerial position of 30/05/2023 |
| P5 | On conflicting requests, ZSchool flags it to the school and does not decide; the school stays the operational arbiter and may request a ruling or the King's prosecutor's opinion | INV-ZS-068, INV-ZS-066 |
| P6 | At 18 years completed, the student restricts parental access to school, disciplinary, and health data herself; the financially responsible parent keeps financial access as long as they remain liable | INV-ZS-052, ADR-ZS-001, art. 209 |
| P7 | The guardianship regime is an evolvable parameter: defaults change if the reform enters into force, the schema does not | INV-ZS-066, §2.3 above |

---

## 3. Applicable qualities, rights, and defaults

### 3.1 Catalog of qualities

| Quality | Legal term | Source | Expected supporting document | Effects in ZSchool | Scope |
|---|---|---|---|---|---|
| Legal tutor | Holder of tutorship (*wilaya*, الولي الشرعي) | Family Code, art. 236 | None for the father (the legal default); a ruling, a death certificate, or an absence/incapacity document for any other configuration | The required signer for reserved acts: enrollment, transfer, leaving certificate (INV-ZS-066, INV-ZS-028) | A global quality of the parent–student relationship |
| Holder of custody | *Hadana* (الحضانة) | Family Code, art. 171 | **None for the mother** when a separation is declared (the legal default under art. 171); a ruling or document only when custody departs from the legal order | Daily life: administrative documents (self-service enrollment certificate), picking up the child, an emergency contact, routine authorizations; may initiate a transfer or leaving-certificate request, which awaits the tutor's signature (ADR-ZS-063) | A global quality of the relationship |
| Legal guardian (an information status) | — | INV-ZS-064 | None: the default applied to both registered parents | Default notifications and access to school information; the signer for non-reserved acts | A global quality of the relationship |
| Financially responsible | المسؤول عن الأداء | INV-ZS-064 | None; may be a third party who is not a legal guardian | Payment schedule, payments, receipts, financial history; financial access kept with an adult student as long as they remain liable (INV-ZS-052, ADR-ZS-001) | Carried by the enrollment (a school-context attribute) |
| Emergency contact | — | INV-ZS-067 | None | Priority to call on an incident | A school-context attribute |
| Person authorized to pick up the child | — | INV-ZS-067 | None | Outings, handing the child over at day's end | A school-context attribute |

The relationship also carries **access rights** (viewing grades, absences, documents, finance, communicating with the school, authorizing outings, signing electronically) and a **status** (active, suspended, revoked, with a supporting document) (`spec/domain-model.md`).

### 3.2 Defaults when creating a relationship with two parents

1. Both parents are registered **legal guardians by default** and both receive notifications, unless configured otherwise on the basis of a court ruling (INV-ZS-064, INV-ZS-065).
2. The father is registered **legal tutor by default** (art. 236); the mother becomes tutor on the father's death, absence, or incapacity, or by a ruling, with an attachment (INV-ZS-066, INV-ZS-028).
3. The **holder of custody** quality follows the order of art. 171 (mother, then father, then maternal grandmother): when a separation is declared, the mother is registered as custodian **with no document required** (the legal default); a supporting document is required only to depart from this order.
4. The **financially responsible parent** is designated at enrollment; they may be one of the parents or a third party (INV-ZS-064, INV-ZS-021).
5. The historical baseline's example (the father as "legal guardian, financially responsible," the mother as "holder of custody, emergency contact") illustrates a **documented** configuration for a separated couple; it does not change the INV-ZS-064 default absent a court ruling recorded by the school.

### 3.3 A functional reading of the legal-guardian / legal-tutor / holder-of-custody distinction

The historical baseline uses "legal guardian" for the default of information and notification for both parents (INV-ZS-064) and "legal tutor" for the required signer of reserved acts (INV-ZS-066). ZSchool applies the following operational reading, without ever ruling on family law: the legal-guardian quality (a default for both parents) carries information and notifications; the legal-tutor designation carries reserved signatures; the holder-of-custody quality carries daily life and administrative documents. No screen decides a tutorship dispute: only a supporting document (a ruling, an act) recorded by the school changes the defaults. This terminology point is tracked as OQ-ZS-242 in `spec/open-questions.md`.

---

## 4. Detailed journeys

### JNY-ZS-071 — Recording distinct qualities and supporting documents

| Attribute | Value |
|---|---|
| Objective | Capture, from enrollment, who is the legal tutor, who holds custody, and who is financially responsible, with the required supporting documents, so that every downstream right is grounded in a complete, traceable file |
| Actors | Secretariat (entry and documents), leadership (checking), father and mother (declarations, submitting documents), the student involved |
| Map journey | JMP-ZS-001 (admission), JMP-ZS-004 (claiming) |
| Modules involved | INS (`spec/behaviors/02-admissions-enrollment-reenrollment.md`), ADM (`spec/behaviors/01-administration-onboarding-subscription.md`), DOC (`spec/behaviors/06-documents-certificates.md`; full self-service in V1) |
| Needs covered | URS-ZS-045, URS-ZS-046 |
| Data | `Person`, `StudentProfile`, `ParentStudentRelationship`, `StudentDocument` (`spec/domain-model.md`) |
| Version | MVP: qualities, defaults, statuses, and the relationship's supporting documents uploaded and encrypted (ADR-ZS-054, consistent with `spec/journeys/02-secretary-cashier.md` JNY-ZS-011); V1: tooled file-completeness checking and document self-service |
| Baseline | (→ INV-ZS-063, INV-ZS-064, INV-ZS-066, INV-ZS-067, INV-ZS-021, INV-ZS-028, INV-ZS-029, INV-ZS-030) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| JNY-ZS-071 | A new admission | Secretariat | At admission, creates the student profile then both parents' relationships; the form defaults to two parents and allows adding others (a tutor, a grandparent); each guardian has their own account (INV-ZS-063) | Both relationships created, each parent with their own account | MVP |
| JNY-ZS-071 | Relationships created | System | Applies the §3.2 defaults: both parents as legal guardians (INV-ZS-064), the father as legal tutor (art. 236), with no document required for these defaults | Legal defaults applied with no document | MVP |
| JNY-ZS-071 | A separation declared | Secretariat | Records Naïma's "holder of custody" quality **with no document required** (the legal default under art. 171); attaches the ruling if it exists (which then records any restrictions, JNY-ZS-074); fills in the school's context attributes (an emergency contact, people authorized to pick up the child, communication preferences) (INV-ZS-067) | Custody quality active by default with no document | MVP |
| JNY-ZS-071 | A configuration departing from the legal default (the mother as tutor, a court-appointed tutor, custody to the father or a third party, a financially responsible third party unrelated to the parents) | Secretariat | Requires the matching document (a ruling, a death certificate, an attestation) uploaded and encrypted from MVP (ADR-ZS-054); the system refuses to activate a non-default quality with no attachment | Non-default quality recorded only with a document | MVP |
| JNY-ZS-071 | Documents uploaded | System | Strongly encrypts rulings and ID documents, historizes every quality creation and change with author, timestamp, and document reference (INV-ZS-090) | Full traceability of quality changes | MVP |
| JNY-ZS-071 | Qualities recorded | Secretariat | Sends both parents an account-claim invitation; each activates their own access (JMP-ZS-004); Naïma sees her qualities and associated rights in her portal (URS-ZS-045, URS-ZS-046) | Both parents claim their own account | MVP |
| JNY-ZS-071 | Activation requested (PRE-ENROLLED to ACTIVE) | Leadership | Checks for at least one active legal guardian and one financially responsible parent (INV-ZS-064, INV-ZS-021) | Blocking check satisfied before activation | MVP |

**Mobile and small-screen points.** A guided, step-by-step quality wizard rather than a single dense form; document photographing from the phone at each step; clear quality badges (legal tutor, holder of custody, financially responsible) shown as chips, not free text.

**Acceptance criteria**: `@REQ-ZS-356` (`features/journeys/gar/jny-zs-071-recording-distinct-qualities.feature`).

### JNY-ZS-072 — Daily life: both parents informed by default

| Attribute | Value |
|---|---|
| Objective | Guarantee that, under normal conditions with no court ruling, each parent receives their child's information alongside the other: no school "chooses" its parental contact |
| Actors | Father and mother (recipients), teachers and the head supervisor (alert senders), leadership (communication settings), secretariat (financial reminders) |
| Map journey | JMP-ZS-005 (roll call), JMP-ZS-006 (report cards), JMP-ZS-007 (payment reminders), JMP-ZS-011 (announcements/summons) |
| Modules involved | COM (`spec/behaviors/08-communication-notifications.md`), VSC (`spec/behaviors/04-attendance-student-life-discipline.md`), FIN (`spec/behaviors/07-finance-billing-collections.md`), EVA (`spec/behaviors/05-assessments-grades-report-cards.md`) |
| Needs covered | URS-ZS-044, URS-ZS-048 |
| Data | `Notification`, `DeliveryLog` (`spec/domain-model.md`) |
| Version | MVP: in-app and SMS notifications in each parent's language, WhatsApp "utility" limited to attendance notifications (ADR-ZS-062); V1: the general WhatsApp Business API and push notifications |
| Baseline | (→ INV-ZS-064, INV-ZS-065, INV-ZS-067, ADR-ZS-023, ADR-ZS-036) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| JNY-ZS-072 | Any notifiable event (`AbsenceRecorded`, `ReportCardPublished`, `InstallmentOverdue`; `spec/domain-model.md`) | System | Routes the notification to **every active legal guardian and the holder of custody**, so to the father and Naïma simultaneously (INV-ZS-064, INV-ZS-065) | Both parents notified simultaneously | MVP |
| JNY-ZS-072 | Notification sent | Each parent | Sets their own channel preferences (in-app, SMS, WhatsApp opt-in; push in V1) and language (a per-person preference: Naïma in Arabic, the father in French) and may mute announcements and reminders (a "STOP" opt-out, never for attendance and security notifications); these preferences are context attributes (INV-ZS-067) and **never change** the other parent's access rights | Independent channel preferences per parent, no cross-effect on rights | MVP |
| JNY-ZS-072 | Routing configured | Leadership | Configures routing per message type and delays; the school can only exclude a legal guardian from information by recording a court ruling (JNY-ZS-074); no action by a parent has this effect (INV-ZS-065) | Only a court ruling can restrict access | MVP |
| JNY-ZS-072 | Every send | System | Keeps a delivery trace (channel, status, cost) charged to the school (ADR-ZS-036; `spec/domain-model.md` `DeliveryLog`) | A `DeliveryLog` entry per send | MVP |
| JNY-ZS-072 | Notification delivered | Naïma | Receives, like the father, the morning's absence notification, the report-card publication, and announcements; views them from her own account, with no need to go through the father's (URS-ZS-044, URS-ZS-048) | Independent access to every notification | MVP |

**Mobile and small-screen points.** Per-parent notification settings live on their own device; no setting on one parent's phone can be seen or changed from the other's.

**Acceptance criteria**: `@REQ-ZS-357` (`features/journeys/gar/jny-zs-072-daily-life-both-parents-informed.feature`).

### JNY-ZS-073 — Acts reserved for the legal tutor and documents accessible to the custodial mother

| Attribute | Value |
|---|---|
| Objective | Clearly separate two families of operations: **reserved acts** (enrollment, transfer, leaving certificate) requiring the legal tutor's signature, and **administrative documents** (an enrollment certificate, a transcript, an information sheet) that the custodial parent obtains herself, per the ministerial position of 30/05/2023 |
| Actors | The father (legal tutor, signer of reserved acts), Naïma (custodian, requester of documents), secretariat (front-desk documents), leadership (self-service configuration, seal), a third-party verifier (QR code) |
| Map journey | JMP-ZS-001 (admission), JMP-ZS-009 (transfer, leaving certificate), JMP-ZS-010 (self-service documents) |
| Modules involved | INS (`spec/behaviors/02-admissions-enrollment-reenrollment.md`), TRA (`spec/behaviors/09-transfers-mobility.md`), DOC (`spec/behaviors/06-documents-certificates.md`), FIN (`spec/behaviors/07-finance-billing-collections.md`), ADM (`spec/behaviors/01-administration-onboarding-subscription.md`) |
| Needs covered | URS-ZS-047, URS-ZS-050 |
| Data | `Enrollment`, `TransferRequest`, `Certificate`, `FinancialAccount` (`spec/domain-model.md`) |
| Version | MVP: the legal tutor's signature at enrollment, a transfer (initiated by the custodian, the tutor's signature, ADR-ZS-063), a leaving certificate within the PDF exit dossier (ADR-ZS-032), a front-desk enrollment certificate for the custodian (ADR-ZS-061); V1: self-service documents with QR, the exit dossier's time-limited secure link, an advanced electronic seal and timestamp (ADR-ZS-011, ADR-ZS-032) |
| Baseline | (→ INV-ZS-066, INV-ZS-028, ADR-ZS-005, ADR-ZS-011, ADR-ZS-032) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| JNY-ZS-073 | The list of reserved acts (contract/enrollment signature, transfer request and consent, leaving-certificate request) | System | Maintains the list; the required signer is the registered legal tutor (INV-ZS-066, INV-ZS-028) | A single authoritative list of reserved acts | MVP |
| JNY-ZS-073 | A transfer needed | Naïma | Initiates a transfer request from her portal (any legal guardian, the custodian, or the adult student may initiate it, ADR-ZS-063); the system identifies the required signer is the father and sends him the signature request; Naïma tracks the request's status (initiated, awaiting signature, validated, accepted, activated, refused, cancelled, expired) | Request initiated by Naïma, routed to the father for signature | MVP |
| JNY-ZS-073 | Signature request sent | The father | Signs the act from his account (an electronic signature; an advanced level for the parent contract in V1, ADR-ZS-011); without his signature, the act stays pending and is not submitted to leadership | Reserved act blocked until the tutor signs | MVP |
| JNY-ZS-073 | A document needed (enrollment certificate, transcript, information sheet) | Naïma | Obtains, in parallel, documents the school authorizes, bilingual, numbered — at the front desk in MVP, self-service with a QR code in V1; no signature or account from the father is requested (the ministerial position of 30/05/2023, ADR-ZS-061) | Document obtained with no involvement from the father | MVP |
| JNY-ZS-073 | Document requested | System | Applies **no blocking** to these documents for unpaid fees: arrears show up as an alert on the school-side record; the **account statement is given only to the financially responsible parent** (the father), never to Naïma who does not hold this quality (ADR-ZS-005, INV-ZS-016, ADR-ZS-061) | No blocking; statement restricted to the payer | MVP |
| JNY-ZS-073 | A departure | Leadership | On departure, generates the leaving certificate and the exit dossier (a bilingual PDF; a time-limited secure link with a QR code in V1); Naïma may initiate the request, the certificate requires the legal tutor's signature on the request (or the adult student's); the dossier given to Naïma excludes the financial component (INV-ZS-066, ADR-ZS-005, ADR-ZS-032, ADR-ZS-061) | Leaving certificate issued with the correct signer; financial component excluded from Naïma's dossier | MVP |
| JNY-ZS-073 | Every request, signature, or issuance | System | Logs with author, timestamp, and document reference (INV-ZS-090) | A complete, traceable audit trail | MVP |

**Mobile and small-screen points.** A single "Documents" tab per guardian showing only what they can request themselves; the signature-pending state shown clearly to the non-signing parent so no one mistakes "requested" for "done".

**Acceptance criteria**: `@REQ-ZS-358` (`features/journeys/gar/jny-zs-073-reserved-acts-and-accessible-documents.feature`).

### JNY-ZS-074 — Restricting a parent's access on a court ruling

| Attribute | Value |
|---|---|
| Objective | Offer the only legitimate mechanism to remove a parent's access: a court ruling, recorded by the school, with a full attachment and traceability; no actor (a parent, a teacher, or ZSchool) can restrict a parent through a mere setting |
| Actors | Leadership (recording the decision), secretariat (preparation), the restricted parent and the other parent (informed), ZSchool (no initiative) |
| Map journey | JMP-ZS-004 (claiming/access), JMP-ZS-011 (communication) |
| Modules involved | ADM (`spec/behaviors/01-administration-onboarding-subscription.md`), INS (`spec/behaviors/02-admissions-enrollment-reenrollment.md`), COM (`spec/behaviors/08-communication-notifications.md`), the audit log (`spec/cross-cutting/02-security-privacy.md`) |
| Needs covered | URS-ZS-049 |
| Data | `ParentStudentRelationship`, `StudentDocument`, event `AccessRestrictionRecorded` (`spec/domain-model.md`) |
| Version | MVP; the full audit log in V1 |
| Baseline | (→ INV-ZS-065, INV-ZS-066, INV-ZS-068, INV-ZS-027, INV-ZS-019) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| JNY-ZS-074 | A ruling submitted (a total or partial restriction of a parent's access, removing signing authority, lifting a restriction) | A parent | Submits a court ruling to leadership; the school stays the judge of whether to record it | Ruling submitted for the school's review | MVP |
| JNY-ZS-074 | Ruling reviewed | Leadership | Opens the recording wizard: selecting the parent involved, the ruling type (a total or partial restriction), the scope (by rights family: grades and assessments, absences and student life, documents, communication, finance, signatures, authorizations), an effective date, a **mandatory** attachment (a scanned ruling) | Recording drafted with full scope and attachment | MVP |
| JNY-ZS-074 | Recording submitted | System | Refuses any recording with no attachment; strongly encrypts the document; does not allow a parent or ZSchool to record a restriction themselves | No restriction possible without a document | MVP |
| JNY-ZS-074 | Effective date reached | System | Applies the restriction to the relationship's rights **for the school that attached the ruling**: the matching screens and notifications disappear from the restricted parent's portal for this school; other schools where the relationship is active receive the `AccessRestrictionRecorded` event and must in turn record the ruling, after checking the document, to apply it on their side (INV-ZS-065) | Restriction applied per-school, propagated as an event, not automatically applied elsewhere | MVP |
| JNY-ZS-074 | Restriction applied | System | Logs the recording, changes, and views of the restriction in the immutable, exportable audit log (author, context, timestamp) (INV-ZS-090, INV-ZS-019) | Full traceability of the restriction and its views | MVP |
| JNY-ZS-074 | Restriction applied | System | Notifies the restricted parent and the other parent: the ruling's existence, scope, date, and reference; the restricted parent keeps access to the restriction notice and its supporting document per the school's visibility settings | Both parents informed of the restriction | MVP |
| JNY-ZS-074 | A new ruling (lifting or changing the restriction) | Leadership | Records the next decision; the history of successive restrictions stays viewable, with each version timestamped | Restriction history fully preserved | MVP |
| JNY-ZS-074 | No ruling recorded | System | Applies **no** restriction: the INV-ZS-064/INV-ZS-065 default applies permanently | Default access preserved absent a ruling | MVP |

**Mobile and small-screen points.** The restriction wizard is desk-only (not optimized for mobile, since it is a leadership action requiring document review); the restricted parent's mobile portal simply shows an information banner, no confusing partial screens.

**Acceptance criteria**: `@REQ-ZS-359` (`features/journeys/gar/jny-zs-074-restricting-access-on-a-court-ruling.feature`).

### JNY-ZS-075 — A conflict between guardians: flagged to the school, ZSchool does not decide

| Attribute | Value |
|---|---|
| Objective | Turn conflicting parental requests into a workable file for the school, the sole operational arbiter: ZSchool detects, flags, logs, and waits, never siding with either parent |
| Actors | Father and mother (authors of conflicting requests), leadership (arbitration), secretariat (tracking), teachers and the head supervisor (affected by the decisions' effects) |
| Map journey | JMP-ZS-009 (transfer), JMP-ZS-011 (communication) |
| Modules involved | ADM (`spec/behaviors/01-administration-onboarding-subscription.md`), INS (`spec/behaviors/02-admissions-enrollment-reenrollment.md`), TRA (`spec/behaviors/09-transfers-mobility.md`), COM (`spec/behaviors/08-communication-notifications.md`) |
| Needs covered | URS-ZS-049 |
| Data | event `GuardianConflictReported` (`spec/domain-model.md`) |
| Version | MVP (flagging and blocking conflicting acts); V1: tooled summons and meetings for arbitration |
| Baseline | (→ INV-ZS-068, INV-ZS-066, INV-ZS-065, INV-ZS-067) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| JNY-ZS-075 | Two conflicting requests concerning the same student (transfers to different schools, opposing departure authorizations, competing pickup claims, a contested recorded quality) | Father and mother | Submit conflicting requests from their respective accounts | Two contradictory requests recorded | MVP |
| JNY-ZS-075 | Contradictory requests recorded | System | Detects the contradiction on the same student and the same object; creates a timestamped **conflict flag** on the student's record; marks the requests involved "in conflict — awaiting the school's arbitration"; neither request is executed (INV-ZS-068) | A single flag; both requests blocked | MVP |
| JNY-ZS-075 | Conflict flagged | System | Notifies leadership (a conflicts table, a notification); exchanges with parents continue on the school's channels, with each staying informed per their rights (INV-ZS-064) | Leadership notified; parents stay informed | MVP |
| JNY-ZS-075 | Leadership notified | Leadership | Processes the file: reviews the timestamped history of requests, summons the parents (V1), and may ask the parents for a ruling or the King's prosecutor's opinion, which it attaches to the student's file (INV-ZS-066) | Arbitration file assembled | MVP |
| JNY-ZS-075 | File assembled | Leadership | Decides under operational arbitration (accept, refuse, defer); its decision is recorded and notified to both parents; supporting documents produced (a ruling, a prosecutor's opinion) then feed the defaults (a restriction, a changed quality) per JNY-ZS-074 and JNY-ZS-071 | Decision recorded, notified, and fed back into the relationship's defaults | MVP |
| JNY-ZS-075 | Decision recorded | System | Logs the flag, attachments, the school's decision, and notifications; ZSchool never appears as the decision-maker (INV-ZS-068) | Full, neutral audit trail | MVP |

**Mobile and small-screen points.** The conflict flag surfaces as a single, unambiguous banner on the student's record on any device; no partial or conflicting information is ever shown to either parent about the other's request.

**Acceptance criteria**: `@REQ-ZS-360` (`features/journeys/gar/jny-zs-075-a-conflict-between-guardians.feature`).

### JNY-ZS-076 — Adult student: a restriction by the student, financial access kept by the payer (a projection)

**Projection.** Lina is 9: this journey describes what her parents will experience in nine years. It is illustrated by **Salma, 18, 2nd-year baccalaureate** (`spec/journeys/07-students-minor-and-adult.md`), whose father is financially responsible and mother holds custody, a configuration identical to Naïma's.

| Attribute | Value |
|---|---|
| Objective | Apply civil majority (art. 209): at 18 years completed, the student becomes the holder of her own account and rights; she may restrict parental access to school, disciplinary, and health data; the father, financially responsible, keeps access to financial and contractual data as long as he owes fees |
| Actors | The student who has reached majority (holder of the decisions), the father (financially responsible), the custodial mother (a parent informed of the restriction), leadership (notified, possible mediation) |
| Map journey | JMP-ZS-006 (report cards), JMP-ZS-010 (documents); the student's own experience: `spec/journeys/07-students-minor-and-adult.md` |
| Modules involved | ADM (`spec/behaviors/01-administration-onboarding-subscription.md`), INS (`spec/behaviors/02-admissions-enrollment-reenrollment.md`), FIN (`spec/behaviors/07-finance-billing-collections.md`), COM (`spec/behaviors/08-communication-notifications.md`), HEA (`spec/behaviors/14-health-sensitive-data.md`, V2+ for health data) |
| Needs covered | URS-ZS-050 |
| Data | event `StudentReachedMajority` (`spec/domain-model.md`) |
| Version | **MVP** (INV-ZS-042, ADR-ZS-051; pilots have 2nd-year baccalaureate students reaching 18 in the pilot school year). Health data: on the HEA module's release (V2+) |
| Baseline | (→ INV-ZS-052, INV-ZS-051, ADR-ZS-001, INV-ZS-042, art. 209) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| JNY-ZS-076 | 18th birthday reached | System | Issues the `StudentReachedMajority` event; the student is informed of her rights in her portal, and the information is repeated at every re-enrollment (INV-ZS-052) | Student informed at majority and at every re-enrollment | MVP |
| JNY-ZS-076 | Rights information received | The adult student | Opens the parental-access management panel and restricts, by data family, her parents' access: school (grades, absences, report cards, documents), discipline, health; by default, guardians' access is maintained while the enrollment is active, the restriction being an act by the student, never a default (INV-ZS-052) | Restrictions applied only by the student's own act | MVP |
| JNY-ZS-076 | Restriction chosen | System | Immediately applies the restrictions, logs them, and notifies the school; the parents involved see their portal adjusted with its cause (a restriction by the adult student) (INV-ZS-052, ADR-ZS-001) | Restriction applied and explained to affected parents | MVP |
| JNY-ZS-076 | Restriction applied | System | Fully maintains the **financially responsible parent's** access to financial and contractual data (payment schedule, invoices, receipts, history) as long as he owes fees; parents otherwise stay signers of the contract and payers despite the student's majority (INV-ZS-052, ADR-ZS-001) | Payer's financial access unaffected by the restriction | MVP |
| JNY-ZS-076 | Restriction applied | The father and Naïma | Keep unrestricted uses (finance for the payer; anything the student has not restricted) and may communicate with the school, which stays an operational support (mediation, mutual information) (URS-ZS-050) | School continues to mediate as needed | MVP |
| JNY-ZS-076 | A later change of mind | The adult student | May lift or adjust her restrictions at any time; every change is logged and notified to the school (INV-ZS-052) | Restriction remains fully reversible by the student | MVP |

**Mobile and small-screen points.** A single "My access as an adult" panel with per-data-family toggles, an explicit, persistent note that the financially responsible parent's financial access is maintained as long as they owe fees.

**Acceptance criteria**: `@REQ-ZS-361` (`features/journeys/gar/jny-zs-076-adult-student-restriction-projection.feature`).

### JNY-ZS-077 — The "guardianship regime" parameter and the reform's possible future entry into force

| Attribute | Value |
|---|---|
| Objective | Make a possible Family Code reform absorbable with no rework: tutorship and custody defaults are carried by a regime parameter, not hard-coded, so that a new regime's entry into force translates into a parameter change and a review campaign, not a model migration |
| Actors | ZSchool (activating the regime value, on promulgation), schools (reviewing existing relationships), leadership (any local reconfiguration) |
| Map journey | JMP-ZS-001 (admission), JMP-ZS-003 (onboarding) |
| Modules involved | ADM (`spec/behaviors/01-administration-onboarding-subscription.md`), INS (`spec/behaviors/02-admissions-enrollment-reenrollment.md`), COM (`spec/behaviors/08-communication-notifications.md`) |
| Needs covered | — (a platform-level safeguard, not a persona-specific need) |
| Data | a platform parameter carrying the active guardianship regime (`spec/domain-model.md`) |
| Version | MVP: the parameter exists and carries the single value "Family Code 70-03" (INV-ZS-064/INV-ZS-066 defaults are parameterized from the start); V2+: activating a value matching the reform once promulgated, with a review campaign |
| Baseline | (→ INV-ZS-066, §2.3 above) |

**Steps.**

| No. | Starting condition | Actor | Action | Expected outcome | Version |
|---|---|---|---|---|---|
| JNY-ZS-077 | Platform launch | System | Stores the guardianship regime as a platform parameter, with the value "Family Code 70-03" active from MVP: the father as legal tutor by right, the custody order mother, then father, then maternal grandmother, majority at 18 (INV-ZS-066) | Regime parameter exists and is active from day one | MVP |
| JNY-ZS-077 | Regime active | Schools | Use the parameter without changing it: the regime is a legal fact, not a school choice; qualities and defaults follow from it (JNY-ZS-071) | No school-level override of the legal regime | MVP |
| JNY-ZS-077 | The reform enters into force (hypothetical) | ZSchool | Activates the new value at the legal date, updates **new** relationships' defaults, informs schools, and triggers a review campaign for existing relationships (points to reconfirm: the legal-tutor quality, reserved acts possibly extended to the custodial mother for routine acts, per the promulgated text) | New defaults apply going forward; existing relationships flagged, not silently changed | V2+ |
| JNY-ZS-077 | Review campaign triggered | Leadership | Reviews flagged relationships, attaches new documents where applicable, and validates; the history of qualities and supporting documents is kept in full (INV-ZS-090) | Existing relationships reviewed with full history preserved | V2+ |
| JNY-ZS-077 | Regime changed | System | Keeps traceability of the regime change (date, previous value, active value) in the platform's audit log | Regime change fully auditable | V2+ |

**Mobile and small-screen points.** Not applicable — this journey has no end-user-facing screen; it is a platform configuration safeguard.

**Acceptance criteria**: `@REQ-ZS-362` (`features/journeys/gar/jny-zs-077-guardianship-regime-parameter.feature`).

---

## 5. Summary matrix: qualities and uses for the separated couple

Reference configuration: the father as legal tutor and financially responsible; Naïma as holder of custody and emergency contact; Lina, a minor Grade 4 student; no restriction recorded unless noted otherwise.

| Use | The father (legal tutor, payer) | Naïma (custodian) | Basis |
|---|---|---|---|
| Receiving daily-life notifications (absences, tardiness, announcements, summons) | Yes (default) | Yes (default) | INV-ZS-064, INV-ZS-065 |
| Viewing her daughter's grades, absences, report cards | Yes (default) | Yes (default) | INV-ZS-064, INV-ZS-065 |
| Obtaining administrative documents (an enrollment certificate, a transcript, an information sheet) | Yes | Yes, with no signature or account from the father, with no blocking for unpaid fees; no account statement | INV-ZS-066; the ministerial position of 30/05/2023; ADR-ZS-005; ADR-ZS-061 |
| Signing the enrollment and parent contract | Yes, signature required | No: an act reserved for the legal tutor | INV-ZS-066, INV-ZS-028 |
| Requesting and consenting to a transfer | Yes, signature required | May initiate; the request awaits the legal tutor's signature | INV-ZS-066, JNY-ZS-073, ADR-ZS-063 |
| Requesting the leaving certificate | Yes, signature required on the request | May initiate the request, which awaits the tutor's signature; issuance not blocked for unpaid fees; the dossier given with no financial component | INV-ZS-066, ADR-ZS-005, ADR-ZS-032, ADR-ZS-061 |
| Paying, viewing the payment schedule, invoices, and receipts | Yes (financially responsible) | Informed per her rights; no charge to her account without designation | INV-ZS-064, URS-ZS-050 |
| Excusing an absence with an attachment | Yes | Yes | `spec/behaviors/04-attendance-student-life-discipline.md` |
| Giving a departure authorization, picking up the child | Yes | Yes (custodian, emergency contact) | INV-ZS-067 |
| Communicating with teachers in a moderated thread | Yes | Yes | ADR-ZS-034 |
| Viewing her quality, her rights, and her relationship's history | Yes | Yes | INV-ZS-067, URS-ZS-045 |
| Viewing her restricted access and its basis | Only on a court ruling recorded by the school involved | Only on a court ruling recorded by the school involved | INV-ZS-065, JNY-ZS-074, ADR-ZS-052 |
| Keeping financial access after the student's majority | Yes, as long as he owes fees | Per what the adult student has not restricted | INV-ZS-052, ADR-ZS-001, JNY-ZS-076 |

## 6. Logging, attachments, and retention

- **Audit log**: quality creations and changes, recording of court rulings (restrictions and lifts), conflict flags and the school's arbitrations, restrictions set by the adult student, guardianship-regime changes; every entry carries author, context, and timestamp; in MVP, immutable record-level historization of entries; an exportable audit log also covering sensitive views in V1 (INV-ZS-090, INV-ZS-019; ADR-ZS-003 for retention).
- **Attachments**: rulings, death certificates, incapacity attestations, and the King's prosecutor's opinions are linked to the relationship or the student's file, strongly encrypted, and viewable per the school's rights and visibility settings (`spec/domain-model.md`).
- **Traceability for parents**: Naïma and the father see the history of operations affecting their own relationship (qualities, restrictions concerning them, arbitrations concerning them); this visibility is the counterpart of the "restriction only on a court ruling" principle (URS-ZS-049).
- **Events**: the journey draws on the event catalog of `spec/domain-model.md` (`StudentReachedMajority`, `TransferValidated`, `DocumentGenerated`, `EnrollmentStatusChanged`, `ConsentGranted`/`ConsentRevoked`, `AccessRestrictionRecorded`, `GuardianConflictReported`, `RelationshipQualityChanged`).

## 7. Key screens (text descriptions)

Screens described in text, mobile-first, systematically labeled in FR and AR (ADR-ZS-021). No `SCR-ZS-` identifier is created here: that namespace belongs to the module chapters (`spec/behaviors/01-administration-onboarding-subscription.md` through `spec/behaviors/14-health-sensitive-data.md`).

1. **A student record's family relationships** (school, web and mobile): a list of guardians with quality badges ("Legal tutor"/"الولي الشرعي", "Holder of custody"/"الحاضن(ة)", "Financially responsible"/"المسؤول عن الأداء", "Emergency contact"), the relationship's status, attached supporting documents with timestamps, actions (add a quality, attach a document, record a court ruling, flag a conflict), and a timestamped change history.
2. **A wizard to record a court ruling** (school): guided steps — the parent involved, type (a total or partial restriction), scope by rights family, an effective date, a mandatory attachment, a summary and confirmation; an explicit refusal with no attachment; a final summary showing the reference, scope, and effect.
3. **Naïma's parent portal**: a banner of qualities and rights at the top of the student screen ("Your qualities", "صفتكم"), a self-service "Administrative documents" entry, access to her relationship's history; if she is restricted, an information banner with scope, the ruling's reference, and access to the detail per settings.
4. **A signing screen for a reserved act** (the father): the document to sign, a reminder that it is a reserved act, an electronic signature; for Naïma, a read-only equivalent showing the request's status ("awaiting the legal tutor's signature").
5. **A conflict card** (school): a student record and a leadership table; a timestamped list of conflicting requests, arbitration status, actions (summon, attach a ruling or the prosecutor's opinion, record the decision); no "decide" button on the platform side.
6. **The "My access as an adult" panel** (the student portal, MVP): toggles per data family (school, discipline, health), an explicit note that the financially responsible parent's financial access is maintained as long as they owe fees, a history of restrictions set and lifted.

## Open questions

Open questions for this journey (OQ-ZS-241 through OQ-ZS-245) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## Traceability

Full cross-reference coverage for this journey is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
