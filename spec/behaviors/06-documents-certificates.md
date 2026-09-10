> **Document Control**
>
> | Property       | Value                                                                                                                                                                                                                       |
> | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-06                                                                                                                                                                                                              |
> | Revision       | 1.0                                                                                                                                                                                                                         |
> | Effective Date | 2026-09-09                                                                                                                                                                                                                  |
> | Status         | Draft                                                                                                                                                                                                                       |
> | Author         | ZSchool Product                                                                                                                                                                                                             |
> | Classification | Functional Specification                                                                                                                                                                                                    |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/15-documents-certificates.md` (v0.3), old `FR-DOC-01..15` -> `BEH-ZS-131..145`, old `ECR-DOC-01..07` -> `SCR-ZS-071..077`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Documents and Certificates (DOC)

**Nature of this chapter.** The DOC module produces, numbers, seals, and delivers the school's official documents, and manages the digital student file (supporting documents). It safeguards two non-negotiable principles carried forward from the baseline: delivery is never blocked for unpaid balances ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [INV-ZS-016](../invariants.md#inv-zs-016)), and delivered documents are verifiable (a verification QR code in V1, per [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md), [INV-ZS-085](../invariants.md#inv-zs-085)). Single terminology: the document attesting a current enrollment is called an "enrollment certificate" throughout the spec.

## 1. Objective and scope

**Objective.** Cover the catalog of official documents (seven types), configurable bilingual templates, tamper-proof sequential numbering, the advanced-then-qualified electronic seal and timestamp, public authenticity verification, front-desk and self-service generation, and a digital student file of supporting documents with strict access control.

**Scope included:**

| Item                              | Content                                                                                                                                                                                   | Version                                                                                                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog of official documents     | Seven types: enrollment certificate, achievement certificate, attendance certificate, leaving certificate, student information form, student release authorization, employer certificate  | MVP (core set: enrollment certificate, information form, leaving certificate and exit file — via INS/FIN/TRA on the same `Certificate` entity); V1 (full catalog, BEH-ZS-132) |
| Configurable bilingual templates  | Bilingual AR/FR header, logo, authorization number, statutory notices, per-type body, signatories                                                                                         | V1                                                                                                                                                                            |
| Numbering                         | Sequential per type and per school year, tamper-proof                                                                                                                                     | V1                                                                                                                                                                            |
| Seal and timestamp                | Advanced electronic seal + timestamp + QR code in V1; qualified seal and timestamp via an approved provider (TSP) in V2 (see `spec/cross-cutting/06-external-integrations.md`, `INT-SIG`) | V1 / V2                                                                                                                                                                       |
| Public verification               | Authenticity-verification page by QR code, no authentication required                                                                                                                     | V1                                                                                                                                                                            |
| Generation                        | By the front desk on request; self-service by the parent for documents the school authorizes                                                                                              | V1                                                                                                                                                                            |
| Delivery and unpaid balances      | No blocking; arrears alert; account statement on departure (to the financial guardian only); written log of requests and deliveries                                                       | MVP for the no-blocking rule and the statement; V1 for the log                                                                                                                |
| Digital student file              | Documents attached to a relationship or a restriction (court rulings, proof of status), the child's birth certificate and photo; strict access control                                    | MVP (relationship and restriction documents, the child's identity documents); V1 (full file, expected-documents checklist, completeness tracking, view logging)               |
| Batch generation                  | Start-of-year enrollment certificates (for insurance), A4/A5 printing                                                                                                                     | MVP (wave 2 — 2027 school start, [RDM-ZS-003](../roadmap.md))                                                                                                                 |
| Departure to a non-ZSchool school | Bilingual PDF exit file (MVP); time-limited secure link with QR code (V1)                                                                                                                 | MVP / V1                                                                                                                                                                      |

**Out of scope (references):**

| Item                                                                                                                                         | Owning module   | Reference                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Report cards and transcripts (content, calculation, publication); the report-card verification QR code reuses this module's shared mechanism | EVA             | `spec/behaviors/05-assessments-grades-report-cards.md`                                                                 |
| Documents issued at enrollment (certificate, receipt, student form) within the front-desk flow; documents required for the admission file    | INS             | `spec/behaviors/02-admissions-enrollment-reenrollment.md`                                                              |
| Cash receipts, invoices, account statement (financial content), electronically signed parents' contract                                      | FIN             | `spec/behaviors/07-finance-billing-collections.md`                                                                     |
| Electronic parental authorization for a school event or outing (online consent)                                                              | COM             | `spec/behaviors/08-communication-notifications.md`                                                                     |
| Transfer procedure, choice of shared scope, Massar reference                                                                                 | TRA             | `spec/behaviors/09-transfers-mobility.md`                                                                              |
| Structured health data (medical record, allergies, treatments); the "vaccination record" document remains a file document                    | HEA             | `spec/behaviors/14-health-sensitive-data.md` (V2); boundary in OQ-ZS-095                                               |
| Digital school passport                                                                                                                      | TRA, DOC        | roadmap V2+                                                                                                            |
| Electronic signature of the parents' contract (advanced level)                                                                               | FIN + `INT-SIG` | [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md), `spec/cross-cutting/06-external-integrations.md` |

## 2. Users and use cases

| Actor                                                                      | Use case                                                                                                                                                                                                                                                    | Requirements                                                                                                           | Persona reference                                                         |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Front desk                                                                 | Generates certificates and certifications on request at the counter; scans in file documents; views the delivery log; hands over the exit file (leaving certificate)                                                                                        | BEH-ZS-131, BEH-ZS-132, BEH-ZS-138, BEH-ZS-139, BEH-ZS-140, BEH-ZS-145, SCR-ZS-071, SCR-ZS-072, SCR-ZS-073, SCR-ZS-074 | [URS-ZS-011](../urs.md), [URS-ZS-013](../urs.md), [URS-ZS-015](../urs.md) |
| School leadership                                                          | Configures templates, numbering, self-service-authorized documents and signatories; views the log and the audit trail; signs documents                                                                                                                      | BEH-ZS-131, BEH-ZS-133, BEH-ZS-134, BEH-ZS-135, BEH-ZS-138, BEH-ZS-143                                                 | [URS-ZS-007](../urs.md)                                                   |
| Parent / guardian                                                          | Downloads authorized documents in self-service; requests others from the front desk; the legal guardian receives the exit file, the financial guardian the account statement                                                                                | BEH-ZS-138, BEH-ZS-139, BEH-ZS-144                                                                                     | [URS-ZS-047](../urs.md), [URS-ZS-036](../urs.md)                          |
| Custodial parent                                                           | Obtains administrative school documents in self-service (enrollment certificate, attendance certificate) without going through the legal guardian; the leaving certificate remains signed by the legal guardian ([INV-ZS-066](../invariants.md#inv-zs-066)) | BEH-ZS-138                                                                                                             | [URS-ZS-047](../urs.md)                                                   |
| Adult student                                                              | Accesses their published documents; downloads their transcripts and certificates for their own procedures                                                                                                                                                   | BEH-ZS-138, BEH-ZS-144                                                                                                 | [URS-ZS-056](../urs.md), [URS-ZS-058](../urs.md)                          |
| Minor student with activated access                                        | Views and downloads their published documents per the school's policy                                                                                                                                                                                       | BEH-ZS-138, BEH-ZS-144                                                                                                 | [INV-ZS-051](../invariants.md#inv-zs-051)                                 |
| Third-party verifier (employer, new school, administration, bank, insurer) | Verifies a document's authenticity by QR code, with no ZSchool account                                                                                                                                                                                      | BEH-ZS-137, SCR-ZS-075                                                                                                 | Off-platform (no account)                                                 |
| ZSchool support                                                            | No direct access to documents outside a logged support procedure                                                                                                                                                                                            | —                                                                                                                      | historical baseline                                                       |

## 3. Key journeys

| Journey                              | Role of the DOC module                                                                                                                                                                         | Reference                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Admission of a new student           | Immediate issuance of enrollment documents (certificate, bilingual student form) within the front-desk flow, on the same `Certificate` entity                                                  | JMP-ZS-001; `spec/behaviors/02-admissions-enrollment-reenrollment.md` |
| Grades, councils, report cards       | Provision of the seal, timestamp and verification-QR mechanism shared with report cards                                                                                                        | JMP-ZS-006; `spec/behaviors/05-assessments-grades-report-cards.md`    |
| Transfer and departure               | Generation of the leaving certificate at closing (ACTIVE → TRANSFERRED transition, `spec/domain-model.md` §3), assembly of the exit-file PDF, time-limited secure link to a non-ZSchool school | JMP-ZS-009; `spec/behaviors/09-transfers-mobility.md`                 |
| Self-service certificate by a parent | Download of authorized documents, non-blocking arrears alert, verification QR code                                                                                                             | JMP-ZS-010                                                            |
| Step-level detail                    | Detailed journey steps per persona are carried by `spec/journeys/01` to `spec/journeys/07`; this chapter does not duplicate them                                                               | `spec/journeys/00-journey-map.md`                                     |

## 4. Functional behaviors

| ID         | Title                                                                                   | Priority |
| ---------- | --------------------------------------------------------------------------------------- | -------- |
| BEH-ZS-131 | Generate the leaving certificate and the exit-file PDF as soon as the enrollment closes | Must     |
| BEH-ZS-132 | Offer the full catalog of official documents for issuance by the front desk             | Must     |
| BEH-ZS-133 | Configure bilingual document templates                                                  | Should   |
| BEH-ZS-134 | Number each document sequentially by type and by year                                   | Must     |
| BEH-ZS-135 | Apply the advanced electronic seal, timestamp and verification QR code                  | Must     |
| BEH-ZS-136 | Qualify the seal and timestamp via an approved provider (V2)                            | Must     |
| BEH-ZS-137 | Enable public authenticity verification by QR code                                      | Must     |
| BEH-ZS-138 | Enable parent self-service for documents                                                | Must     |
| BEH-ZS-139 | Never block delivery for unpaid balances: alert and account statement                   | Must     |
| BEH-ZS-140 | Keep a written record of document requests and deliveries                               | Must     |
| BEH-ZS-141 | Maintain the digital student file of supporting documents                               | Must     |
| BEH-ZS-142 | Strictly restrict access to file documents and log it                                   | Must     |
| BEH-ZS-143 | Deliver the exit file to a non-ZSchool school through a time-limited secure link        | Must     |
| BEH-ZS-144 | Version, reissue and retain documents                                                   | Must     |
| BEH-ZS-145 | Generate and print documents in batches                                                 | Should   |

### BEH-ZS-131: Generate the leaving certificate and the exit-file PDF as soon as the enrollment closes

> **Invariant:** [INV-ZS-016](../invariants.md#inv-zs-016) (no blocking of official documents), [INV-ZS-066](../invariants.md#inv-zs-066) (legal tutor as signatory)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md), [ADR-ZS-044](../decisions/044-state-machine-refinements.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-118`](../../features/doc/fr-doc-01-issuing-the-leaving-certificate.feature)

REQUIREMENT: When an enrollment closes during the school year (TRANSFERRED or WITHDRAWN
status) or a student leaves at the next school start (a COMPLETED enrollment
with no N+1 enrollment at the school of origin), the system MUST
automatically generate the leaving certificate as a bilingual PDF and
assemble the bilingual exit-file PDF (leaving certificate, annual transcript,
end-of-year decision where it exists, and — for the financial guardian
only — the account statement). The exit file MUST be handed to the legal
tutor or the adult student, downloadable from their account; the custodial
parent who is not the legal guardian MUST get read access to it, excluding
the account statement. No disciplinary or health data MUST appear in it.
Generation MUST never be conditioned on any payment.

Inter-module impacts — Finance: `spec/behaviors/07-finance-billing-collections.md` (the account-statement behavior). Assessments: `spec/behaviors/05-assessments-grades-report-cards.md` (annual transcript, end-of-year decision). Transfers: `spec/behaviors/09-transfers-mobility.md` (the ACTIVE → TRANSFERRED transition that triggers this behavior).

### BEH-ZS-132: Offer the full catalog of official documents for issuance by the front desk

> **Invariant:** none
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (no dedicated scenario; exercised indirectly by BEH-ZS-131/BEH-ZS-138's scenarios)

REQUIREMENT: The module MUST offer a catalog of seven official document types, issuable
on request from the student's file: enrollment certificate, achievement
certificate, attendance certificate, leaving certificate, student
information form, student release authorization, employer certificate.
Each issuance MUST go through a preview before generation, a choice of
template language (Arabic, French, bilingual), then PDF generation,
printing and delivery. Documents generated through the enrollment and
finance flows MUST use the same engine and the same `Certificate` entity.

Inter-module impacts — Admissions: `spec/behaviors/02-admissions-enrollment-reenrollment.md`. Finance: `spec/behaviors/07-finance-billing-collections.md`.

### BEH-ZS-133: Configure bilingual document templates

> **Invariant:** [INV-ZS-074](../invariants.md#inv-zs-074) (legal header per school)
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)
> **Priority:** Should
> **Version:** V1
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: For each document type, school leadership MUST have a default template
supplied by ZSchool and a template editor: bilingual header (the school's
AR/FR name, logo, address, contact details), ministry authorization number,
associated AREF and provincial education office, statutory and type-specific
notices, a document body with variables, a seal zone, a list of authorized
signatories. A preview MUST be available in Arabic and French before saving;
templates MUST be versioned, and editing a template MUST NOT change
documents already issued.

Inter-module impacts — none beyond this module; default bilingual templates are supplied from MVP for the core document set.

### BEH-ZS-134: Number each document sequentially by type and by year

> **Invariant:** [INV-ZS-017](../invariants.md#inv-zs-017) (tamper-proof numbering)
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-119`](../../features/doc/fr-doc-04-sequential-document-numbering.feature)

REQUIREMENT: Every generated document MUST carry a unique number, assigned by a
sequential counter per (school, document type, school year) triplet, with
no gaps and no reuse. The number MUST be assigned when generation is
confirmed, never at the preview stage; an abandoned preview MUST NOT consume
a number; a confirmed document that is later voided MUST keep its number
with a "voided" status and appear in the log. The counter MUST NOT be
resettable manually; any numbering correction MUST go through a logged
support procedure.

Inter-module impacts — Finance: mirrors the tamper-proof invoice-numbering principle (`spec/behaviors/07-finance-billing-collections.md`). Enrollment documents issued in MVP through the admissions/finance flows already carry a simple sequential number (see OQ-ZS-091).

### BEH-ZS-135: Apply the advanced electronic seal, timestamp and verification QR code

> **Invariant:** [INV-ZS-085](../invariants.md#inv-zs-085) (immutability and verification)
> **See:** [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** none (exercised indirectly by BEH-ZS-137's scenarios)

REQUIREMENT: In V1, every generated official document MUST carry the school's advanced
electronic seal (tied to the signing school's identity), a reliable
timestamp of the generation, and a verification QR code pointing to the
public verification page (BEH-ZS-137). The PDF's fingerprint MUST be
computed and kept with the document: any alteration of the file MUST make
verification fail. The same mechanism is shared with report cards
(`spec/behaviors/05-assessments-grades-report-cards.md`).

Inter-module impacts — Assessments: shared seal/timestamp/QR mechanism with report cards.

### BEH-ZS-136: Qualify the seal and timestamp via an approved provider (V2)

> **Invariant:** none
> **See:** [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** V2
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: In V2, the electronic seal and timestamp on sensitive documents (leaving
certificate, certificates, transcripts) MUST become qualified, via the API
of a DGSSI-approved trust service provider, in the school's name. Since
approval is granted per service (signature, seal, timestamp), the chosen
provider MUST cover all three services; the technical integration is
specified in `spec/cross-cutting/06-external-integrations.md` (`INT-SIG`)
and MUST NOT be duplicated here.

Inter-module impacts — Integrations: `spec/cross-cutting/06-external-integrations.md` (`INT-SIG`).

### BEH-ZS-137: Enable public authenticity verification by QR code

> **Invariant:** [INV-ZS-085](../invariants.md#inv-zs-085) (verification QR code)
> **See:** none
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-120`](../../features/doc/fr-doc-07-verifying-a-documents-authenticity.feature)

REQUIREMENT: Anyone holding a printed or PDF document (a third party with no ZSchool
account) MUST be able to verify its authenticity by scanning the QR code or
entering the code on a public page. The page MUST show a status (authentic,
superseded by a newer version, revoked, unknown) and a minimum of data
(document type, issuing school, issue date). The student's full name MUST
be shown only after a knowledge challenge (document number + date of birth
as printed on the document presented); otherwise the name MUST stay masked.
The page MUST NEVER expose file data (grades, finance, documents, health)
and MUST be protected against enumeration (an identical message for an
unknown code, and rate limiting). Verification MUST be logged with no
collection of the verifier's personal data.

Inter-module impacts — Security: `spec/cross-cutting/02-security-privacy.md` (anti-enumeration, rate limiting).

### BEH-ZS-138: Enable parent self-service for documents

> **Invariant:** [INV-ZS-065](../invariants.md#inv-zs-065), [INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-080](../invariants.md#inv-zs-080) (legal guardian and legal tutor rights)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-121`](../../features/doc/fr-doc-08-self-service-documents-for-guardians.feature)

REQUIREMENT: School leadership MUST be able to choose, per document type, which ones
guardians may download in self-service from their portal (default:
enrollment certificate and attendance certificate; the leaving certificate
and departure documents stay front-desk-only by default). Self-service MUST
apply to every legal guardian and to the custodial parent and, per the
school's policy, to the student. The leaving certificate, an act signed by
the legal tutor, MUST never be self-service. A self-service document MUST
be generated with the same guarantees as a front-desk one (bilingual
template, number, advanced seal, timestamp, QR code). Each generation MUST
notify the other legal guardians per their rights.

Inter-module impacts — Communication: `spec/behaviors/08-communication-notifications.md` (delivery notification to the other legal guardians).

### BEH-ZS-139: Never block delivery for unpaid balances: alert and account statement

> **Invariant:** [INV-ZS-016](../invariants.md#inv-zs-016) (no blocking of official documents)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-122`](../../features/doc/fr-doc-09-no-document-blocking-for-unpaid-balances.feature)

REQUIREMENT: No rule tied to a financial balance MUST block the generation of an
official document, whether at the front desk, in self-service, or in
automatic flows (closing, transfer). When a student has arrears, the file
interface MUST show a non-blocking alert (amount, overdue installments),
fed by the finance module, and a summary account statement MUST be attached
to the exit file. The school MUST NOT be able to configure any payment
condition on official documents; only non-mandatory services can be
conditioned. Re-enrollment for the following year MUST NEVER be a
conditionable service.

Inter-module impacts — Finance: `spec/behaviors/07-finance-billing-collections.md` (arrears feed). Compliance: `spec/cross-cutting/07-legal-compliance-data-protection.md` (the single list of conditionable services; re-enrollment excluded).

### BEH-ZS-140: Keep a written record of document requests and deliveries

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090) (audit logging)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-123`](../../features/doc/fr-doc-10-written-traceability-of-requests-and-deliveries.feature)

REQUIREMENT: Every request for an official document (front desk, portal, a phone call
logged by the front desk) and every outcome (delivery, a reasoned refusal
for a reason other than financial, a pending request) MUST be recorded in a
log: requester, type, student, date and time, author of the action,
document issued. The log MUST be viewable by school leadership and
exportable. No reason for refusal tied to unpaid balances MUST exist in the
system. Log entries MUST be added to the audit trail.

Inter-module impacts — none beyond the audit trail shared platform-wide.

### BEH-ZS-141: Maintain the digital student file of supporting documents

> **Invariant:** [INV-ZS-027](../invariants.md#inv-zs-027), [INV-ZS-028](../invariants.md#inv-zs-028) (relationship and restriction documents)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-124`](../../features/doc/fr-doc-11-digital-student-file.feature)

REQUIREMENT: The digital student file MUST centralize documents: the child's birth
certificate and photo, court rulings (guardianship, custody, restriction)
and proof of status attached to the parent-student relationship,
vaccination record, foreign nationals' passport or residence permit, and any
document filed under a configurable type. In MVP, neither the number nor a
copy of adults' national ID (CNIE) MUST be collected. The front desk MUST be
able to upload documents with type, date and a comment; court rulings MUST
be viewable by school leadership only, once filed. Documents MUST be
encrypted with extra protection and MUST carry the key of the tenant that
filed them; they MUST be shared only through the transfer profile.

Inter-module impacts — Compliance: `spec/cross-cutting/07-legal-compliance-data-protection.md` (CNIE collection gated on CNDP F112). Admissions: `spec/behaviors/02-admissions-enrollment-reenrollment.md` (documents required at admission, managed here once the enrollment is created).

### BEH-ZS-142: Strictly restrict access to file documents and log it

> **Invariant:** [INV-ZS-027](../invariants.md#inv-zs-027) (least privilege), [INV-ZS-090](../invariants.md#inv-zs-090) (audit logging)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-125`](../../features/doc/fr-doc-12-access-control-on-the-student-file.feature)

REQUIREMENT: Access to each document MUST be governed by fine-grained permissions per
type and per role under least privilege: court rulings MUST be visible to
school leadership only; the front desk uploads and views administrative
documents and the child's identity documents; teachers MUST see neither the
file nor its documents; parents MUST view their child's documents per their
rights; the adult student MUST hold their own rights. Every view (authorized
or refused) of a sensitive document MUST be logged with author, context and
timestamp. A restriction on a parent's access based on a court decision
recorded by the school MUST apply to the file. Storage MUST stay in Morocco.

Inter-module impacts — Permissions: `spec/cross-cutting/01-permissions.md`.

### BEH-ZS-143: Deliver the exit file to a non-ZSchool school through a time-limited secure link

> **Invariant:** [INV-ZS-083](../invariants.md#inv-zs-083) (transfer profile scope)
> **See:** [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-126`](../../features/doc/fr-doc-13-exit-file-to-a-non-zschool-school.feature)

REQUIREMENT: When a student joins a school outside ZSchool, the bilingual exit-file PDF
MUST be made accessible to the receiving school through a time-limited
secure link with a verification QR code. The link MUST be generated by the
front desk or school leadership from the exit file, with a configurable
validity period (default: 30 days); it MUST grant access to the exit file
only, MUST be logged on every access, and MUST be revocable and
regeneratable. The PDF's scope MUST stay that of the default transfer
profile: no disciplinary or health data.

Inter-module impacts — Transfers: `spec/behaviors/09-transfers-mobility.md`.

### BEH-ZS-144: Version, reissue and retain documents

> **Invariant:** [INV-ZS-033](../invariants.md#inv-zs-033), [INV-ZS-084](../invariants.md#inv-zs-084), [INV-ZS-085](../invariants.md#inv-zs-085) (versioning, read-only after closing, immutability)
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-127`](../../features/doc/fr-doc-14-document-versions-and-retention.feature)

REQUIREMENT: A delivered document MUST stand as issued: any needed correction MUST
create a new version, with the old one remaining viewable marked
"superseded"; the verification page MUST name the version in force. The log
MUST keep the history of versions and reissues. After an enrollment closes,
the school's documents MUST be read-only, and the student and their
guardians MUST keep permanent read access to published official documents,
within the permanent-retention limit applicable to official documents.
Reissuing an archived document MUST regenerate an identical PDF marked
"reissue" with its own log number.

Inter-module impacts — none beyond the audit trail and retention policy shared platform-wide.

### BEH-ZS-145: Generate and print documents in batches

> **Invariant:** [INV-ZS-017](../invariants.md#inv-zs-017) (tamper-proof numbering, shared counter)
> **See:** none
> **Priority:** Should
> **Version:** MVP (wave 2)
> **Acceptance:** none (no dedicated scenario at this level)

REQUIREMENT: The front desk MUST be able to bulk-generate one document type for a scope
(class, level, school) with a shared counter (one number per document), a
ZIP output of PDFs, and batch printing (A4 and A5 formats). The batch MUST
be logged as a whole (author, scope, count), and each document MUST remain
individually traceable in the log.

Inter-module impacts — none beyond BEH-ZS-134's numbering and BEH-ZS-140's logging.

## 5. Morocco-specific considerations

1. **Bilingualism and dual script.** Every official document is bilingual Arabic/French (default template); names appear in dual script; the interface and labels are AR/FR with full RTL ([ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md)).
2. **Authorization number and seal.** Document headers carry the ministry authorization number and the AREF affiliation, configured at the school level ([INV-ZS-074](../invariants.md#inv-zs-074)).
3. **Delivery and unpaid balances.** No official document can be withheld for unpaid balances: a ministry position (September 2020) and documented summary-proceedings orders back this rule (see `spec/appendices/00-project-baseline.md` for the primary-source citations, still to be confirmed against the Official Gazette).
4. **Penalty for refusing delivery.** Law 59.21 (Official Gazette No. 7485 of 23/02/2026) penalizes, with fines up to 10,000 DH, refusal to deliver certificates when the contract is being honored — hence the absence of any blocking function and the written log of requests (BEH-ZS-139, BEH-ZS-140).
5. **Guardianship and custody.** The legal tutor (by default the father) or the adult student signs the leaving certificate; the holder of custody obtains administrative documents in self-service (enrollment certificate, attendance certificate); in case of conflict, the school files the court ruling in the file ([INV-ZS-066](../invariants.md#inv-zs-066)).
6. **Seal and evidentiary value.** Framework under Law 43.20 and decree 2-22-687 (Official Gazette No. 7160 of 12/01/2023): three levels, admissibility with no presumption for the advanced level; TSP approvals granted per service; no level mandated for certificates.
7. **Protection of file data.** The school is the data controller, ZSchool the processor; CIN number and health data require CNDP prior authorization (F112); extra encryption for identity documents and court rulings; storage in Morocco.
8. **Timestamp and timezone.** Document timestamps are expressed in `Africa/Casablanca` time, set to permanent UTC+0 as of 20/09/2026 (decree No. 2.26.530); see `spec/open-questions.md` for the settled reference.
9. **Retention.** Official documents and logs are kept permanently by the school (past certificates can be reissued); audit logs kept 5 years ([ADR-ZS-003](../decisions/003-default-retention-durations.md), [INV-ZS-086](../invariants.md#inv-zs-086)).

## 6. Data and events

**Existing entities used** (`spec/domain-model.md`):

| Entity                                                     | Use in the module                                                                                                                                                                                                                                     |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Certificate`                                              | Official document: type (the catalog's seven types), counter number (school × type × year triplet), PDF version and fingerprint, seal, timestamp, signatory, verification QR code, status; linked to the enrollment and the school                    |
| `StudentDocument`                                          | Student-file document: configurable type, encrypted file, confidentiality level, file completeness; linked to the student profile and carries the key of the filing tenant; court rulings join the parent-student relationship's supporting documents |
| `School`                                                   | Supplies the legal header for templates: AR/FR name, authorization number, AREF, logo, seal, signatories                                                                                                                                              |
| `Enrollment`, `YearDecision`, `PeriodResult`, `Transcript` | Data reused in documents (enrollment, end-of-year decision, transcripts) and in the exit file                                                                                                                                                         |
| `ParentStudentRelationship`                                | Determines who can obtain documents (statuses and rights) and the "release authorization" context attribute                                                                                                                                           |
| `FinancialAccount`                                         | Feeds the arrears alert and the exit file's account statement                                                                                                                                                                                         |
| `AuditLog`                                                 | Logs generations, sensitive views and refused attempts                                                                                                                                                                                                |

**Notifiable events:**

| Event                                                | Producer                                                      | Consumers and effects                                                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DocumentGenerated`                                  | DOC module (front-desk issuance, self-service, closing flows) | The concerned parent and legal guardians (document delivery and verification QR code via `spec/behaviors/08-communication-notifications.md`); delivery log; audit trail |
| Document request (status: filed, processed, refused) | Parent (portal) or front desk                                 | Front desk (processing queue), parent (status); recorded in the log (BEH-ZS-140)                                                                                        |
| Exit-file access (secure link)                       | DOC module                                                    | Audit trail; the school's visibility into the access log (BEH-ZS-143)                                                                                                   |

Notifications go out through the standard channels (in-app and SMS from MVP; WhatsApp utility limited to attendance notifications in MVP, then general rollout of WhatsApp, push and email in V1), with no duplication of the routing rules described in `spec/behaviors/08-communication-notifications.md`.

## 7. Screens

Text-described screens, mobile-first, labels provided in French and Arabic (RTL); reference UX detail: `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`.

- **SCR-ZS-071 — Generating a document (front desk).** Zone 1: student search (name in dual script or Massar code) with context selection. Zone 2: file-status banner — non-blocking arrears alert if there is a balance, enrollment status. Zone 3: list of the seven document types with availability. Zone 4: form for the chosen type. Zone 5: PDF preview before generation, then Generate/Print/Download/Send actions. States: preview (no number consumed), confirmed (number assigned), voided (number kept in the log), error.
- **SCR-ZS-072 — Log of delivered documents (front desk, school leadership).** Filterable table (type, school year, class, student, period, status): number, type, student, requester, issued by, date and time, version, status. Actions: view the archived PDF, verify the QR code, reissue, export the log.
- **SCR-ZS-073 — Student file: supporting documents (front desk).** List of expected documents with a completeness status. Upload by file or mobile photo. Per document: confidentiality level, filing date, author, view log. Actions: upload, replace, send a reminder to the guardian for a missing document.
- **SCR-ZS-074 — Exit file and secure link (front desk, school leadership).** Exit-file assembly screen: included documents, recipients, bilingual PDF preview, consistency check. Secure-link section: validity period, link/QR-code generation, regeneration, revocation, access log.
- **SCR-ZS-075 — Public verification page (third party, no authentication).** Status display, type, issuing school, issue date; the student's name masked, revealed in dual script after a knowledge challenge. Never any file data; a single message for an unknown or invalid code; rate limiting.
- **SCR-ZS-076 — Template and self-service configuration (school leadership).** List of the seven types with the active template and version. Template editor. Self-service section: per type, an "authorized for parent/student download" toggle. Numbering section: read-only view of counters per type and per year.
- **SCR-ZS-077 — "Documents" area of the parent portal (mobile-first).** Child and school selector. List of documents available for download and a history of documents received. "Request from the front desk" button for non-authorized types. Arrears alert visible on the file, never blocking, with access to the account statement.

## 8. Integrations

| Integration                                             | Use in this module                                                                                                                      | Version | Reference                                                                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `INT-SIG` — qualified trust service provider            | Qualified seal and timestamp in the school's name (V2); per-service approval requires a provider covering signature, seal and timestamp | V2      | `spec/cross-cutting/06-external-integrations.md`; [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md) |
| Notification channels (`INT-SMS`, `INT-WAP`, `INT-EML`) | Delivery of generated documents and availability notifications; no full document travels in the message body                            | MVP/V1  | `spec/behaviors/08-communication-notifications.md`; `spec/cross-cutting/06-external-integrations.md`                   |
| Hosting in Morocco                                      | Storage of PDFs and documents in Morocco (production and backups), with no outgoing document flow                                       | All     | [ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md)                                            |

No Massar integration is required by this module: the Massar transfer procedure stays off-platform in V1, and the reference is recorded by `spec/behaviors/09-transfers-mobility.md`.

## 9. Module-specific non-functional requirements

Reference to NFR domains carried by `spec/cross-cutting/03-non-functional-requirements.md`; no NFR requirement is numbered here.

- **NFR-DOC domain**: bilingual PDFs with correct Arabic fonts, A4 and A5 formats, batch printing, archiving PDFs and fingerprints unchanged for the retention period.
- **NFR-PERF domain**: on-demand document generation in a few seconds on a mobile network, aligned with the report-card generation target; start-of-year batches run in a background queue with a completion notification.
- **NFR-RES domain**: document volume (PDFs and scanned documents) sized to the platform's student target; a storage quota per school, beyond which storage is billed as a consumable.
- **NFR-I18N domain**: AR/FR templates and labels with full RTL, name variables in dual script, document date in local format.
- **NFR-SEC and NFR-OBS domains**: extra encryption for documents, full logging of views and attempts, per-tenant traceability.
- **NFR-DISP domain**: June peaks (exit files, batch certificates) must not degrade single-document generation; no maintenance window during closing and departure periods.

## 10. Success metrics

No dedicated `KPI-ZS-NNN` is set for the DOC module; platform indicators are carried by `spec/metrics.md`. The module contributes to the following measures, to be instrumented from V1 on:

- Front-desk document delivery lag (from request to handover), target: a few minutes, no appointment or preparation delay.
- Share of common documents obtained in self-service by parents.
- QR-verification success rate.
- Student-file completeness (share of files with no missing document after the start-of-year period).
- Traceability: share of requests and deliveries recorded in the log (target: 100% of deliveries).

## 11. Open questions

Open questions for this module (OQ-ZS-091 through OQ-ZS-098 in the migrated source, covering the exact MVP document scope, the non-ZSchool exit-file content, public-verification data exposure, the "release authorization" object relationship, the DOC/HEA vaccination-record boundary, the settled timezone reference, mandatory statutory notices, and audit-logging sequencing) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
