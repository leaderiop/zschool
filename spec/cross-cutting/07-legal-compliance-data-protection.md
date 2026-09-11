> **Document Control**
>
> | Property       | Value                                                                                                                                                                                         |
> | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-CC-07                                                                                                                                                                                 |
> | Revision       | 1.0                                                                                                                                                                                           |
> | Effective Date | 2026-09-09                                                                                                                                                                                    |
> | Status         | Draft                                                                                                                                                                                         |
> | Author         | ZSchool Product                                                                                                                                                                               |
> | Classification | Functional Specification — Cross-cutting (Legal Compliance)                                                                                                                                   |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/cross-cutting/36-legal-compliance-data-protection.md` (v0.3), old `CNF-01..27` -> `CNF-ZS-001..027`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Legal Compliance and Data Protection

## 1. Objective and scope

This chapter translates the legal obligations applicable to ZSchool and its client schools into verifiable requirements. It duplicates neither the permission rules (`spec/cross-cutting/01-permissions.md`), nor the technical security measures (`spec/cross-cutting/02-security-privacy.md`), nor the integration specifications (`spec/cross-cutting/06-external-integrations.md`): it sets what compliance requires of the product and the documents it must produce.

**In scope:**

- Law 09.08 and the CNDP: a per-school declaration assistant, a tier-change alert into an authorization, a transfer-request template for messaging, privacy notices, individuals' rights, consent logging, a processing register.
- ZSchool's dual role ([ADR-ZS-027](../decisions/027-processor-and-controller-roles.md)): standard contractual clauses and sub-processor governance.
- Law 59.21: fee disclosure (art. 49), the annual written contract, the pricing lock, an anti-refusal check for re-enrollment, unconditional document delivery, the AREF compliance file.
- The Family Code (Moudawana): the "legal guardian" and "custodian" qualities, parental restriction only on a court decision, a configurable "guardianship regime" parameter.
- Data retention ([ADR-ZS-003](../decisions/003-default-retention-durations.md)), anonymization and erasure (INV-ZS-086), a school's termination ([ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)).
- UBL e-invoicing preparation (decree not published, `spec/appendices/01-review-history.md` H-17).
- Regulatory monitoring.

**Out of scope:** role and permission mechanics (`spec/cross-cutting/01-permissions.md`), encryption and technical measures (`spec/cross-cutting/02-security-privacy.md`), the finance module's own operation (`spec/behaviors/07-finance-billing-collections.md`), documents (`spec/behaviors/06-documents-certificates.md`), enrollment (`spec/behaviors/02-admissions-enrollment-reenrollment.md`), communication (`spec/behaviors/08-communication-notifications.md`), and health (`spec/behaviors/14-health-sensitive-data.md`), vendor API specifications (`spec/cross-cutting/06-external-integrations.md`).

**Versions.** The historical baseline sets "Audit, individuals' rights, formalized CNDP compliance" in V1 (`spec/appendices/00-project-baseline.md` §12). Some building blocks are nonetheless active from MVP onward because baseline invariants or rules require them at MVP: notices accepted at enrollment, logged consents (INV-ZS-012), the pricing lock (INV-ZS-017), official documents never blocked (INV-ZS-016, [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)), guardian/custodian qualities and court-ordered restriction (INV-ZS-027, INV-ZS-028), retention and anonymization (INV-ZS-037). This split is justified requirement by requirement and consolidated in `spec/open-questions.md` (this file's OQ-ZS-334). The 09/09/2026 review ([ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)) further moved to MVP the building blocks essential for pilots that process real minors' data from 02/01/2027 onward: a CNDP-formalities timeline before activation (CNF-ZS-001), a pilot processor agreement (CNF-ZS-002), a manual individuals'-rights procedure (CNF-ZS-003), a WhatsApp transfer basis (CNF-ZS-004), the parent contract (CNF-ZS-005, [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md)), and the re-enrollment anti-refusal check in wave 2 (CNF-ZS-006).

---

## 2. Reference legal framework and ZSchool's dual role

### 2.1 Applicable texts

| Text                                                      | Status as of 09/09/2026 (source)                                                                                                                                                 | Product implications                                                                                                                                                |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Law 09.08 (personal data protection) and CNDP resolutions | In force; the revision bill drafted by the CNDP has not been filed with Parliament (`spec/appendices/01-review-history.md` H-05, confirmed by research)                          | F211/F214 declarations, F112 authorizations, F118 transfer authorizations, notices (art. 5), rights (art. 7 to 9), security (art. 23)                               |
| Law 59.21 (private school education)                      | Published in Official Gazette No. 7485 of 02/23/2026; 113 articles; repeals laws 04.00, 05.00, and 06.00; 35 implementing decrees expected                                       | Fee disclosure, an annual written contract, prohibitions (mid-year increases, forced purchases, refusing re-enrollment), fines up to 100,000 DH for repeat offenses |
| The Family Code (Law 70-03 of 2004)                       | In force; the Reform Commission's report submitted to the King on 12/23/2024 is neither voted nor enacted as of 08/12/2026                                                       | Art. 236 (father as legal guardian by right), art. 171 (custody order: mother, father, maternal grandmother), art. 209 (majority at 18)                             |
| General Tax Code, art. 211                                | In force                                                                                                                                                                         | Retention of accounting documents: 10 years                                                                                                                         |
| CGI art. 145-IX (e-invoicing)                             | Implementing decree not published as of 09/09/2026; a draft at the General Secretariat of Government since April 2026; UBL format, a clearance model; B2B first, B2C not planned | Preparing the structured export, timeline pending publication                                                                                                       |
| Law 43.20 and decree 2-22-687 (trust services)            | In force; per-service licenses (signature, stamping, timestamping)                                                                                                               | Evidentiary value of the parent contract and documents: [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)                                        |

### 2.2 ZSchool's dual role ([ADR-ZS-027](../decisions/027-processor-and-controller-roles.md))

- **ZSchool is a processor** for each school's operational data (enrollment, grades, attendance, finance, communication): the school is the controller, and it declares and authorizes its own processing. Declarations and authorizations filed by ZSchool **do not exempt** the school from its own CNDP formalities.
- **ZSchool is a controller** for the global identity and, eventually, the student passport: it declares its own processing and answers directly for individuals' rights within that scope.
- Consequences: a set of contracts and templates (section 4) clearly separating the two roles; a per-school processing register and ZSchool's own register; shared retention periods ([ADR-ZS-003](../decisions/003-default-retention-durations.md)) appearing in both parties' declarations.

### 2.3 Up-to-date data adopted (baseline/research divergences)

This chapter adopts: the publication date of Law 59.21 in Official Gazette No. 7485 of 02/23/2026; the Family Code reform **not voted**, with INV-ZS-066 remaining applicable as-is; the state of e-invoicing; confirmation of case law and the ministerial position on documents and arrears, with Law 59.21's new sanction; CNDP clarifications on F211/F214, F112, F118, and Deliberation 236-2015. These divergences are recorded in `spec/appendices/01-review-history.md`.

---

## 3. Compliance users and use cases

| User                                 | Use case                                                                                                                                                                                                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| School principal's office (`DIR`)    | Carry out and track CNDP formalities with the assistant; keep the processing register; publish the fee list; have annual contracts signed; check re-enrollments; assemble the compliance file for an AREF inspection                                       |
| Registrar's office (`SEC`)           | Collect notices and consents at enrollment; respond to document requests; receive arrears alerts without ever blocking official documents                                                                                                                  |
| Parents and guardians (`PAR`, `GAR`) | Receive legal notices; exercise the rights of access, rectification, and objection; give and withdraw consent; obtain administrative documents (custodial mother: ministerial position of 05/30/2023, `spec/journeys/06-custodial-mother-and-guardian.md`) |
| Adult student (`ELE`)                | Be informed of their rights at the time of majority and at every re-enrollment (INV-ZS-052, [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)); exercise rights over their own record                                                         |
| ZSchool (operator)                   | Contract with each school ([ADR-ZS-027](../decisions/027-processor-and-controller-roles.md)); govern its sub-processors; execute retention, anonymization, and terminations; maintain regulatory monitoring                                                |
| External oversight (AREF, CNDP)      | Receive the compliance documents the platform produces (registers, receipts, published fee lists, contracts)                                                                                                                                               |

---

## 4. Contractual documents and templates

Compliance is materialized through documents the platform generates, versions, and archives. Reference list:

| #  | Document                                                                                                                                                                                                                                                                                 | Parties                                                                                                                              | Product support                                                                                                                                                                                                                                                                                      | Version                                                                                                                                                                                                                        |
| -- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1 | ZSchool–school contract (processor agreement and SaaS license) with appendices: security measures, sub-processor list, reversibility clauses, breach notification within 72 hours, MVP fallback targets                                                                                  | ZSchool / school (or organization)                                                                                                   | ZSchool's contract template, signed before the tenant is activated; referenced in the register                                                                                                                                                                                                       | MVP (pilot agreement signed before activation — [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)); V1 (full commercial contract, [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md)) |
| D2 | Annual written school–parent contract (Law 59.21), with the complete fee list and the school's internal rules                                                                                                                                                                            | School / legal guardian, countersigned by the financial guardian if distinct ([ADR-ZS-061](../decisions/061-finance-rules-batch.md)) | Generated per enrollment from the fee list; at MVP, front-desk signature with identity verification; in V1, advanced remote electronic signature ([ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md), INT-ZS-SIG-02); a copy given to the parent; archived in the student's record | MVP ([ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md), BEH-ZS-032, BEH-ZS-047); the regulatory template is forthcoming (OQ-ZS-331)                                                                                   |
| D3 | Privacy notices (art. 5, Law 09.08), bilingual FR/AR                                                                                                                                                                                                                                     | School / data subjects                                                                                                               | A configurable ZSchool template; presented at enrollment and at key steps; versioned; acceptance logged                                                                                                                                                                                              | MVP                                                                                                                                                                                                                            |
| D4 | CNDP formality templates: F211 (standard) or F214 (simplified) declaration, an F112 authorization request, an F118 transfer authorization request                                                                                                                                        | School / CNDP                                                                                                                        | At MVP, pre-filled templates provided outside the tool by ZSchool, with filings driven per the CNF-ZS-001 timeline (before 12/15/2026); in V1, pre-filled by the compliance assistant; filed online via CNDP-FORMS; receipts and references archived                                                 | MVP (templates and filings, CNF-ZS-001); V1 (tooled assistant)                                                                                                                                                                 |
| D5 | Processing register (school and ZSchool)                                                                                                                                                                                                                                                 | School, ZSchool                                                                                                                      | Automatically generated from activated modules; PDF export                                                                                                                                                                                                                                           | V1                                                                                                                                                                                                                             |
| D6 | Standard clauses for downstream sub-processors (a Moroccan host and failover site, the Moroccan SMS aggregator, an international SMS gateway, WhatsApp Business / Meta, email; in V1: Google's FCM and Apple's APNs push services, any external monitoring; in V2: a signature provider) | ZSchool / sub-processors                                                                                                             | Contract templates; commitments passed through to schools via a D1 contract appendix                                                                                                                                                                                                                 | MVP (pilot-agreement appendix: initial list); V1 (a full amendment procedure)                                                                                                                                                  |
| D7 | A standard retention policy ([ADR-ZS-003](../decisions/003-default-retention-durations.md) periods), an appendix to CNDP declarations                                                                                                                                                    | School                                                                                                                               | A template attached to D4 declarations; configurable within legal limits                                                                                                                                                                                                                             | MVP (table) / V1 (formalized appendix)                                                                                                                                                                                         |
| D8 | AREF compliance file: an exportable bundle (legal information, the published fee list and its versions, contract references, the register, CNDP receipts, the list of teachers and authorizations)                                                                                       | School / AREF                                                                                                                        | A single PDF export from the compliance workspace                                                                                                                                                                                                                                                    | V1                                                                                                                                                                                                                             |
| D9 | Account statement and exit file given to the parent upon departure                                                                                                                                                                                                                       | School / guardians                                                                                                                   | Generated by the finance and documents modules (`spec/behaviors/07-finance-billing-collections.md`, `spec/behaviors/06-documents-certificates.md`)                                                                                                                                                   | MVP (statement) / V1 (full exit file)                                                                                                                                                                                          |

---

## 5. Compliance requirements

Requirements carry the `CNF-ZS` prefix (`spec/process/requirement-id-scheme.md`).

### Summary

| ID         | Title                                                                               | Priority | Version                       |
| ---------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------- |
| CNF-ZS-001 | A CNDP-formalities timeline before pilots are activated                             | Must     | MVP                           |
| CNF-ZS-002 | Standard contractual clauses of the ZSchool–school contract                         | Must     | MVP / V1                      |
| CNF-ZS-003 | An individuals'-rights request desk                                                 | Must     | MVP / V1                      |
| CNF-ZS-004 | An F118 transfer-authorization template for messaging                               | Must     | MVP / V1                      |
| CNF-ZS-005 | Annual written school–parent contract                                               | Must     | MVP / V1                      |
| CNF-ZS-006 | An anti-refusal check for re-enrollment                                             | Must     | MVP wave 2                    |
| CNF-ZS-007 | A per-school CNDP declaration assistant                                             | Must     | V1 (MVP: templates + filings) |
| CNF-ZS-008 | Detecting and alerting on the tier change into the F112 authorization               | Must     | V1                            |
| CNF-ZS-009 | Privacy notices at enrollment and information at key steps                          | Must     | MVP                           |
| CNF-ZS-010 | Logging legal guardians' consents                                                   | Must     | MVP                           |
| CNF-ZS-011 | A per-school processing register                                                    | Must     | V1                            |
| CNF-ZS-012 | Governance of cascading sub-processors                                              | Must     | MVP / V1                      |
| CNF-ZS-013 | Fee disclosure (art. 49)                                                            | Must     | V1                            |
| CNF-ZS-014 | The AREF compliance file                                                            | Should   | V1                            |
| CNF-ZS-015 | Pricing lock on an active enrollment                                                | Must     | MVP                           |
| CNF-ZS-016 | Unconditional delivery of official documents                                        | Must     | MVP                           |
| CNF-ZS-017 | A written register of official-document requests and deliveries                     | Must     | V1                            |
| CNF-ZS-018 | Distinct "legal guardian" and "custodian" qualities                                 | Must     | MVP                           |
| CNF-ZS-019 | Restricting a parent only on a court decision                                       | Must     | MVP                           |
| CNF-ZS-020 | A configurable "guardianship regime" parameter                                      | Should   | V1                            |
| CNF-ZS-021 | Regulatory monitoring and compliance triggers                                       | Must     | V1                            |
| CNF-ZS-022 | A retention engine at the default periods                                           | Must     | MVP                           |
| CNF-ZS-023 | Anonymization and the right to erasure                                              | Must     | MVP                           |
| CNF-ZS-024 | A school's termination                                                              | Must     | V1                            |
| CNF-ZS-025 | A prepared UBL e-invoicing export                                                   | Should   | V2+                           |
| CNF-ZS-026 | A "data protection" point of contact at ZSchool                                     | Must     | MVP                           |
| CNF-ZS-027 | Legal basis for the teacher's global professional profile and transport geolocation | Should   | V1 / V2+                      |

### 5.1 Law 09.08 and the CNDP

### CNF-ZS-007: A per-school CNDP declaration assistant

> **Priority:** Must (aligned with SEC-ZS-001)
> **Version:** V1 (tooled assistant); MVP: templates outside the tool and filings per CNF-ZS-001

REQUIREMENT: Every school MUST have a compliance assistant that guides it through its prior CNDP declaration.

Guided collection of elements (the controller, purposes, data categories, data subjects, recipients, transfers, retention periods, security measures), a reasoned recommendation between the standard declaration **F211** and the simplified declaration **F214** (applicable if the processing matches a CNDP resolution), generating a pre-filled application to file on the CNDP-FORMS online platform, recording the receipt (issued within 24 hours), and tracking the risk of reclassification into an authorization within 8 days. Templates are provided by ZSchool. Scope boundary (no duplication): CNF-ZS-007 **owns the formalities process** and the templates' legal content; detection and alerting for the tier change into the F112 authorization is owned on the security side by SEC-ZS-001 (`spec/cross-cutting/02-security-privacy.md`, alert triggers and its register), whose alerts feed the assistant — one tool described from two angles, with no duplicated deliverable. The assistant reminds users that this formality belongs to the school and that ZSchool's own declarations do not replace it. At MVP, before the assistant is tooled, pre-filled templates are provided outside the tool and pilot and ZSchool filings are driven per the CNF-ZS-001 timeline (before 12/15/2026).

Traceability: `spec/appendices/00-project-baseline.md` §9, [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md), `spec/appendices/01-review-history.md` H-15; `spec/appendices/01-review-history.md` (baseline correction #19); `spec/cross-cutting/02-security-privacy.md` (SEC-ZS-001).

Actors: Principal's office; ZSchool (templates and assistance).

### CNF-ZS-008: Detecting and alerting on the tier change into the F112 authorization

> **Invariant:** INV-ZS-028
> **See:** `spec/cross-cutting/02-security-privacy.md` (SEC-ZS-001)
> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-550`](../../features/cross-cutting/cnf/cnf-02-f112-tier-change.feature)

REQUIREMENT: When a school's processing activity collects data subject to prior authorization (art. 12, Law 09.08) — a national ID number, health data, biometrics, file interconnection — the platform MUST flag it immediately.

A contextual banner at the point of entry, a task created in the compliance assistant, a reminder in the register. When the health module (`spec/behaviors/14-health-sensitive-data.md`) is activated, the school must attest that the F112 authorization exists (reference and date recorded) before health-data entry opens. Detection also covers historical data already present when the feature is activated. At MVP, the "national ID number" field is disabled for every school until the F112 authorization (filed before 12/15/2026, CNF-ZS-001) is on record with ZSchool. The tier-change alert applies when the field is activated. No biometric feature is planned for the product; any attempt to enable one is blocked with a link to the formality. Scope boundary (no duplication): detection and the formalities register on the security side are owned by SEC-ZS-001 (`spec/cross-cutting/02-security-privacy.md`); CNF-ZS-008 is its product-side relay in day-to-day entry screens.

Traceability: `spec/appendices/00-project-baseline.md` §9, `spec/appendices/01-review-history.md` H-15; RSK-ZS-019 (`spec/risks.md`); `spec/cross-cutting/02-security-privacy.md` (SEC-ZS-001).

Actors: Principal's office; registrar's office; ZSchool.

### CNF-ZS-004: An F118 transfer-authorization template for messaging

> **Priority:** Must
> **Version:** MVP (an F118 template per vendor, WhatsApp express consent, filing per CNF-ZS-001); V1 (push FCM/APNs)

REQUIREMENT: The platform MUST provide, per messaging vendor outside the adequacy list, a pre-filled F118 authorization-request template, and MUST state each recipient country's status against the current adequacy list.

Data flows of individuals leaving Morocco are exhaustively listed in the vendor register (SEC-ZS-023): WhatsApp Business messaging (Meta, United States), email, and, in V1, Google's (FCM) and Apple's (APNs) push notification services. Any external monitoring tool is entered there before activation. Recipients, notification purposes, data categories; the current adequacy list is Deliberation No. 236-2015 (EU/EEA excluding Croatia, the United Kingdom, Switzerland, Canada — 32 states; otherwise authorization required), flagging where applicable that a listed country (France, Spain) requires no F118. **At MVP**, the basis for the transfer to Meta is the recipient's express consent, collected with an explicit notice about the transfer outside Morocco (INT-ZS integration WAP, [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)); pilots' F118 requests are filed in parallel before 12/15/2026 (CNF-ZS-001). The reference of the authorization obtained is archived in the register. The Moroccan SMS aggregator opens no transfer; an SMS to a foreign number travels through an international gateway entered in the register ([ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md)).

Traceability: `spec/appendices/01-review-history.md` H-15, H-11; `spec/appendices/00-project-baseline.md` §9; [ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md), [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md); SEC-ZS-023.

Actors: Principal's office; ZSchool (templates, SMS aggregator).

### CNF-ZS-009: Privacy notices at enrollment and information at key steps

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-552`](../../features/cross-cutting/cnf/cnf-04-privacy-notice.feature)

REQUIREMENT: At enrollment, every legal guardian MUST receive the privacy notice (art. 5, Law 09.08) before acceptance is possible, and acceptance MUST be dated, logged, and tied to the version displayed.

The controller's identity (the school), purposes, data categories, recipients and transfers (messaging), retention periods, rights, and a contact channel. Bilingual FR/AR and versioned notices are presented in full before acceptance. The same mechanism informs a student who has come of age of their rights at the time and at every re-enrollment (INV-ZS-052, [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)), and informs guardians of the sharing consents requested during transfers (INV-ZS-012). The notice template is provided by ZSchool and configurable per school (its own contact details).

Traceability: `spec/appendices/00-project-baseline.md` §7.2, §9; INV-ZS-052, [ADR-ZS-001](../decisions/001-adult-student-account-holder.md), INV-ZS-012, INV-ZS-020; `spec/open-questions.md` (OQ-ZS-334, activation at MVP).

Actors: Registrar's office; parents and guardians; adult student.

### CNF-ZS-003: An individuals'-rights request desk (access, rectification, objection, portability)

> **Priority:** Must
> **Version:** MVP (manual procedure, register, 30-day deadline — [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)); V1 (a tooled portal desk)
> **Acceptance:** [`@REQ-ZS-553`](../../features/cross-cutting/cnf/cnf-05-rights-request-desk.feature)

REQUIREMENT: Any data subject (a parent, an adult student, a teacher, staff) MUST be able to file, from their portal, a request for access, rectification, objection, or portability of their published documents (art. 7 to 9, Law 09.08).

The request desk manages a thread per request: an immediate acknowledgment, a response deadline configurable by the school (default: 30 calendar days — the law setting no deadline in the sources consulted; resolved by [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)), a pre-deadline alert, a reasoned response with supporting evidence, and full logging. Objection applies to non-essential communications (marketing, optional events) without ever depriving the person of information necessary to schooling (absences, official notices, finance); the absence of a distinct legal basis for a denial is flagged to the school. For processing activities where ZSchool is the controller (global identity), ZSchool responds directly and the school is informed of the scope. **At MVP** ([ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)), rights are enforceable from the first processing activity and are served by a manual procedure: filing the request at the school's front desk (a bilingual form provided) or with ZSchool support, an acknowledgment, a request register kept by the school (a template provided), handling within the 30-day deadline with ZSchool's assistance, a reasoned response; the tooled portal desk ships in V1.

Traceability: `spec/appendices/00-project-baseline.md` §9, §12 (V1 "individuals' rights"), [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md), INV-ZS-052; [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md); SEC-ZS-020; `spec/open-questions.md` (OQ-ZS-333, resolved).

Actors: Parents and guardians; adult student; teachers and staff; principal's office; ZSchool.

### CNF-ZS-010: Logging legal guardians' consents

> **Invariant:** INV-ZS-012
> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Every consent given by a legal guardian for a minor (and by an adult student for themselves) MUST be recorded as a consent entity (`ConsentGrant`) carrying the data subject, the giver's quality, the scope, duration, the version of the information displayed, the channel, and a timestamp; every consent MUST be revocable at any time.

Scope: notices, WhatsApp sending, sharing during a transfer, an eventual student passport. Revocation takes effect on future sends (INV-ZS-012), is logged, and is notified to the school. Optional consents (WhatsApp, marketing communications) are separate, never pre-checked boxes, distinct from mandatory notices.

Traceability: `spec/appendices/00-project-baseline.md` §9; INV-ZS-082, INV-ZS-083, INV-ZS-012; `spec/appendices/01-review-history.md` (baseline correction #6, WhatsApp opt-in, 2019 CNDP-ANRT guidance).

Actors: Parents and guardians; adult student; registrar's office; principal's office.

### CNF-ZS-011: A per-school processing register

> **Priority:** Must
> **Version:** V1

REQUIREMENT: The platform MUST keep, for each school, a processing register automatically generated from the activated modules, exportable as a PDF.

Purposes, categories of data and data subjects, internal recipients and vendors, transfers outside Morocco with their basis (the adequacy list or an F118 authorization), retention periods ([ADR-ZS-003](../decisions/003-default-retention-durations.md)), references of CNDP declarations and authorizations (F211/F214 receipts, F112, F118 authorizations), security measures (cross-referencing the contract and `spec/cross-cutting/02-security-privacy.md`). ZSchool keeps the register for its own processing (global identity, SaaS, support). Activating or deactivating any module updates the register and notifies the principal's office.

Traceability: [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md), `spec/appendices/00-project-baseline.md` §9.

Actors: Principal's office; ZSchool.

### 5.2 Dual role and contracts ([ADR-ZS-027](../decisions/027-processor-and-controller-roles.md))

### CNF-ZS-002: Standard contractual clauses of the ZSchool–school contract

> **Priority:** Must
> **Version:** MVP (a pilot agreement signed before activation — [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)); V1 (a full commercial contract)

REQUIREMENT: The ZSchool–school contract template (document D1) MUST include, at minimum, the elements listed below, and at MVP a pilot agreement carrying these clauses MUST be signed by each pilot school before its tenant is activated.

Qualification of the parties (ZSchool as processor for operational data, controller for the global identity and student passport — [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md)); processing instructions and purposes; a security and confidentiality commitment (cross-referencing `spec/cross-cutting/02-security-privacy.md`); the list of authorized downstream sub-processors; mutual assistance in exercising individuals' rights and CNDP formalities; keeping and updating registers; a full export and reversibility ([ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)); breach notification; audit terms; personal-data breach notification within 72 hours (SEC-ZS-013); MVP fallback targets (24-hour RPO, daily off-site replication); the fate of data at contract end ([ADR-ZS-003](../decisions/003-default-retention-durations.md) retention, then deletion). Its reference appears in the school's register.

Traceability: [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md), `spec/appendices/00-project-baseline.md` §2.7, §9; [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md); SEC-ZS-013; `spec/open-questions.md` (OQ-ZS-334, formalization before commercial launch).

Actors: ZSchool; principal's office.

### CNF-ZS-012: Governance of cascading sub-processors

> **Priority:** Must
> **Version:** MVP (an initial list appended to the pilot agreement); V1 (a full amendment procedure)

REQUIREMENT: The list of sub-processors authorized by the contract (D1/D6) MUST be closed and versioned, and any addition or replacement MUST trigger a contract amendment, informing schools with a documented right to object, updating the processing register, and verifying the sub-processor accepts the same commitments.

The production host and failover site in Morocco ([ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md); the vendor's remote-administration terms are qualified, INT-ZS integration HEB), the Moroccan SMS aggregator, an international SMS gateway for foreign numbers ([ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md)), WhatsApp Business (Meta, outside Morocco), the email vendor, and, in V1, Google's (FCM) and Apple's (APNs) push notification services — outside Morocco, a transfer basis required before activation ([ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)) — as well as any technical monitoring tool hosted outside Morocco; a signature and stamping provider in V2 ([ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)). No new data flow outside Morocco opens until the matching F118 template (CNF-ZS-004) is provided to the affected schools. At MVP, the initial list appears as an appendix to the pilot agreement (CNF-ZS-002).

Traceability: [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md), [ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md), [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md); [ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md), [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md); SEC-ZS-023; RSK-ZS-006 (`spec/risks.md`).

Actors: ZSchool; principal's office.

### 5.3 Law 59.21

### CNF-ZS-013: Fee disclosure (art. 49)

> **Priority:** Must
> **Version:** V1

REQUIREMENT: From the school's fee list, the platform MUST generate a bilingual FR/AR disclosure document listing every fee category charged, timestamped and versioned on every publication, with the published version matching the fee list in force.

By level and by school year, in a print format (permanently posted at the school) and as a downloadable PDF. The history of published versions is kept and can be presented during an inspection. A fee-list change with no republication triggers a consistency alert to the principal's office. Law 59.21 safeguard (forced sale): when a fee-list line for textbooks, supplies, or a uniform is marked "mandatory", the platform displays a legal alert (forced sale is banned) and requires a logged justification to be recorded in the compliance register; the school alone remains the decision-maker and is responsible for its own compliance.

Traceability: `spec/appendices/00-project-baseline.md` §2.7, `spec/appendices/01-review-history.md` H-14; `spec/behaviors/07-finance-billing-collections.md` (BEH-ZS-151).

Actors: Principal's office; registrar's office.

### CNF-ZS-005: Annual written school–parent contract

> **Priority:** Must
> **Version:** MVP (wave 1 — [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md); front-desk signature, financial-guardian countersignature); V1 (remote electronic signature)
> **Acceptance:** [`@REQ-ZS-554`](../../features/cross-cutting/cnf/cnf-11-annual-contract-signature.feature)

REQUIREMENT: For every enrollment, the platform MUST generate the annual written contract (document D2), signed by the legal guardian (or the adult student) and, when distinct, countersigned by the financial guardian.

Identification of the parties and the student, a personalized fee list (level, transport and canteen options), a payment plan, the school's internal rules, privacy notices, legal clauses (the ban on mid-year increases, document delivery, re-enrollment terms). So the payment plan is enforceable against the financial guardian (INV-ZS-021, [ADR-ZS-061](../decisions/061-finance-rules-batch.md)); at MVP, the signature is collected at the front desk with identity verification, a timestamp, and archiving; in V1, it is electronic at the advanced level, remote ([ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md), INT-ZS integration SIG-02 and its compensating measures; a qualified stamp in V2), with identification evidence, a timestamp, and archiving. A copy is given to the parent; the contract is kept in the student's record and will appear in the AREF compliance file (CNF-ZS-014). Generation will align with the regulatory template once it is published (`spec/open-questions.md` OQ-ZS-331). Ownership and no duplication: CNF-ZS-005 owns the contract's template, its legal notices, and the signature/archiving requirement; generation within the enrollment flow is owned by BEH-ZS-047 (`spec/behaviors/02-admissions-enrollment-reenrollment.md`), and the source of pricing data by BEH-ZS-152 (`spec/behaviors/07-finance-billing-collections.md`).

Traceability: `spec/appendices/00-project-baseline.md` §2.7, §7.7, `spec/appendices/01-review-history.md` H-14; [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md), `spec/appendices/01-review-history.md` G-31; [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md), [ADR-ZS-061](../decisions/061-finance-rules-batch.md); `spec/open-questions.md` OQ-ZS-331; `spec/behaviors/02-admissions-enrollment-reenrollment.md` (BEH-ZS-047); `spec/behaviors/07-finance-billing-collections.md` (BEH-ZS-152).

Actors: Principal's office; legal guardian; registrar's office.

### CNF-ZS-015: Pricing lock on an active enrollment

> **Invariant:** INV-ZS-017
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-555`](../../features/cross-cutting/cnf/cnf-12-pricing-lock.feature)

REQUIREMENT: An active enrollment's contractual rate MUST be locked for the entire school year, and no change to the fee list or payment plan MUST be able to increase an ACTIVE enrollment's cost.

Per Law 59.21 (the ban on mid-year increases) and INV-ZS-017: the enrollment captures the fee list's version at activation — at MVP, capture happens when the enrollment is activated; at V1, the anchor point becomes signing the annual written contract (CNF-ZS-005) — including via a level or option change. The platform refuses the operation with an explicit FR/AR message citing the rule. Correcting a clerical error is possible only through an auditable procedure (a reason, an author, the principal's office's approval, a log entry) and never retroactively affects installments already paid.

Traceability: `spec/appendices/00-project-baseline.md` §2.7, §7.7, `spec/appendices/01-review-history.md` H-14, INV-ZS-017; `spec/open-questions.md` (OQ-ZS-334, activation at MVP).

Actors: Principal's office; accounting; registrar's office.

### CNF-ZS-006: An anti-refusal check for re-enrollment

> **Priority:** Must
> **Version:** MVP (wave 2 — year-end close, with BEH-ZS-040 and BEH-ZS-041 — [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md))
> **Acceptance:** [`@REQ-ZS-556`](../../features/cross-cutting/cnf/cnf-13-re-enrollment-anti-refusal.feature)

REQUIREMENT: The platform MUST NOT allow a decision not to re-enroll a student whose prior enrollment was ACTIVE or COMPLETED with no disciplinary expulsion without a mandatory reason, a supporting document, and a full log trail.

Law 59.21 bans refusing to re-enroll a student in good standing. In the re-enrollment campaign and rollover (`spec/behaviors/02-admissions-enrollment-reenrollment.md`), any such decision triggers: a legal warning displayed (the ban and a fine of up to 10,000 DH), a mandatory reason and supporting document (a disciplinary council decision, a documented file), logging, and a trace in the compliance file. The platform does not judge whether the refusal is lawful: it guarantees the decision is deliberate, justified, and traceable. Arrears alone do not constitute a refusal reason the platform displays (`spec/appendices/01-review-history.md` Q-06).

Traceability: `spec/appendices/00-project-baseline.md` §2.7, §12, `spec/appendices/01-review-history.md` H-14, Q-06; [ADR-ZS-041](../decisions/041-mvp-scope-mid-year-close.md).

Actors: Principal's office; registrar's office.

### CNF-ZS-016: Unconditional delivery of official documents

> **Invariant:** INV-ZS-016
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-557`](../../features/cross-cutting/cnf/cnf-14-unconditional-document-delivery.feature)

REQUIREMENT: No system state MUST block generating and delivering the attestation of enrollment, the exit certificate, report cards, and transcripts, including in the event of arrears.

([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), INV-ZS-016; the ministerial position, 2020 summary-proceedings orders, Law 59.21, which now sanctions denial of delivery up to 10,000 DH.) Arrears are expressed only as an alert visible to staff on the record and as an account statement given to the parent upon departure. Only non-mandatory services — transport, canteen, activities, carried by `spec/behaviors/13-ancillary-services.md` — may be conditioned on payment (`spec/appendices/01-review-history.md` Q-06); the following year's re-enrollment is not a service: its governance falls to CNF-ZS-006 and the re-enrollment campaign. This rule is authoritative for the documents module (BEH-ZS-138 aligned, [ADR-ZS-061](../decisions/061-finance-rules-batch.md)). The account statement attached to the exit file is given only to the financial guardian; a file given to another guardian or the custodian has it removed ([ADR-ZS-061](../decisions/061-finance-rules-batch.md)).

Traceability: [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), `spec/appendices/01-review-history.md` Q-06, INV-ZS-016, `spec/appendices/00-project-baseline.md` §7.7; `spec/appendices/01-review-history.md` (baseline correction #16); `spec/open-questions.md` (OQ-ZS-334, activation at MVP).

Actors: Registrar's office; principal's office; parents.

### CNF-ZS-017: A written register of official-document requests and deliveries

> **Priority:** Must
> **Version:** V1

REQUIREMENT: Every request for an official document and every delivery MUST be recorded in writing in a register: the requester and their quality, the document and its number, the request date, the delivery date and channel, and the staff member.

Front desk, parent portal, scanned mail. This register provides the written proof of delivery required by regulatory traceability and feeds the AREF compliance file (CNF-ZS-014). Since denying delivery of an official document is impossible under CNF-ZS-016, the register carries no "denied" status for these documents; requests for non-official, conditionable documents follow `spec/behaviors/06-documents-certificates.md`'s rules.

Traceability: [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), `spec/appendices/01-review-history.md` (baseline correction #16), `spec/appendices/00-project-baseline.md` §7.6; JMP-ZS-010 (`spec/journeys/00-journey-map.md`).

Actors: Registrar's office; principal's office; parents; adult student.

### CNF-ZS-014: The AREF compliance file

> **Priority:** Should
> **Version:** V1

REQUIREMENT: The platform SHOULD produce a single, dated, stamped export bundling every document expected during an AREF academic, administrative, or health inspection.

A paginated, bilingual PDF: the school's legal information (authorization number, its AREF, ICE, IF — INV-ZS-074), the published fee list and its version history (CNF-ZS-013), references of signed annual contracts (CNF-ZS-005), the document request-and-delivery register (CNF-ZS-017), the processing register and CNDP receipts/authorizations (CNF-ZS-007, CNF-ZS-008, CNF-ZS-004, CNF-ZS-011), the retention policy (D7), the list of teachers with their status, quotas, and AREF authorizations (`spec/behaviors/10-teacher-career-network.md`), regulatory statistical exports (`spec/behaviors/12-massar-regulatory-exports.md`).

Traceability: `spec/appendices/00-project-baseline.md` §2.7 (AREF inspection), §7.7, `spec/appendices/01-review-history.md` H-14.

Actors: Principal's office; AREF (recipient).

### 5.4 The Family Code (Moudawana)

### CNF-ZS-018: Distinct "legal guardian" and "custodian" qualities

> **Invariant:** INV-ZS-028
> **Priority:** Must
> **Version:** MVP

REQUIREMENT: The "legal guardian" (_الولاية_) and "custodian" (_الحضانة_) qualities MUST be recorded separately on the parent–student relationship, each with its own supporting document and date.

(INV-ZS-028.) The legal guardian — by default the father (art. 236); the mother in the event of death, absence, incapacity, or by court ruling — is the required signatory for enrollment, transfer, and the exit certificate. The custodian — by default the mother (art. 171: mother, then father, then maternal grandmother) — has access to school information and administrative documents, per the ministerial position of 05/30/2023. Other qualities (financial guardian, emergency contact, a person authorized to pick up the child) remain independently combinable (INV-ZS-064, INV-ZS-066). In case of conflict, the school is the operational arbiter and may attach a court ruling or the public prosecutor's opinion to the record (INV-ZS-068).

Traceability: INV-ZS-066, INV-ZS-064, INV-ZS-068, INV-ZS-028, INV-ZS-021; `spec/appendices/00-project-baseline.md` §2.7; `spec/open-questions.md` (OQ-ZS-334, activation at MVP).

Actors: Principal's office; registrar's office; parents and guardians.

### CNF-ZS-019: Restricting a parent only on a court decision

> **Invariant:** INV-ZS-027
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-558`](../../features/cross-cutting/cnf/cnf-18-restricting-parent-access.feature)

REQUIREMENT: Restricting or suspending a parent's rights (viewing, notifications, signatures) MUST be recordable only upon presenting a court decision; any attempt with no supporting document MUST be refused.

By default, all legal guardians and the custodian have access to school information. When a restriction is recorded: the reference, court, and date are entered, the supporting document is uploaded (strongly encrypted, `spec/cross-cutting/02-security-privacy.md`), the effect on access and notifications is immediate, logging is complete, and the principal's office is alerted. Lifting or extending the restriction requires a new court document. Guardians' conflicting requests are escalated to the school (INV-ZS-068), with ZSchool never ruling on them.

Traceability: INV-ZS-065, INV-ZS-068, INV-ZS-027; URS-ZS-049 (`spec/urs.md`); `spec/open-questions.md` (OQ-ZS-334, activation at MVP).

Actors: Principal's office; registrar's office; parents and guardians.

### CNF-ZS-020: A configurable "guardianship regime" parameter

> **Priority:** Should
> **Version:** V1

REQUIREMENT: The default values governing guardianship and custody SHOULD be carried by a platform-level configuration rather than hard-coded into behavior, so a future Family Code reform can switch defaults with no schema rework.

As long as the 70-03 Family Code remains in force, the defaults are the baseline's (INV-ZS-066); since the 12/23/2024 reform report is neither voted nor enacted, no change is anticipated. Once a reform takes effect, the switch happens via a parameter, a review campaign for affected relationships offered to schools (re-qualifying qualities with supporting documents), and logging of re-qualifications. This mechanism ties into CNF-ZS-021 and RSK-ZS-013.

Traceability: INV-ZS-066, `spec/appendices/01-review-history.md` (baseline correction #5), RSK-ZS-013 (`spec/risks.md`); `spec/open-questions.md` OQ-ZS-338.

Actors: ZSchool; principal's office.

### 5.5 Retention, anonymization, termination

### CNF-ZS-022: A retention engine at the default periods ([ADR-ZS-003](../decisions/003-default-retention-durations.md))

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: The platform MUST automatically execute the default retention periods of §6, per school and per data category, and MUST make a periodic execution report available to the principal's office and ZSchool.

Computing deadlines ("end of schooling" = the closing date of the student's last enrollment at the school; a "dormant" account = no active relationship), running the retention operation (anonymization or deletion) during maintenance windows. Periods are adjustable per school within legal limits: never below legal minimums (10 years for accounting documents, CGI art. 211), never beyond what Law 09.08's proportionality principle justifies; any deviation from the default is logged in the retention policy (D7). The audit log, carried in V1 (INV-ZS-019), is kept for 5 years once it exists.

Traceability: [ADR-ZS-003](../decisions/003-default-retention-durations.md), INV-ZS-086, `spec/appendices/01-review-history.md` Q-04, INV-ZS-037; `spec/open-questions.md` (OQ-ZS-334, activation at MVP; OQ-ZS-335).

Actors: ZSchool; principal's office.

### CNF-ZS-023: Anonymization and the right to erasure

> **Invariant:** INV-ZS-037
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-559`](../../features/cross-cutting/cnf/cnf-21-anonymization-and-erasure.feature)

REQUIREMENT: When the "attendance and discipline" periods expire, and for accounts with no active relationship, anonymization MUST irreversibly replace the identifying elements on the global identity with a neutral identifier; health data MUST be deleted (not anonymized) one year after the end of schooling.

Every school keeps in its enrollment register an **identity snapshot** (first and last name in dual script, date of birth, Massar code), locked when the enrollment closes, under its own custodial responsibility and for the register's permanent retention period (INV-ZS-004, [ADR-ZS-053](../decisions/053-anonymization-school-registers.md)): this snapshot is what allows an attestation to be reissued years later ([ADR-ZS-003](../decisions/003-default-retention-durations.md)); historical retention takes precedence over erasure for official data (INV-ZS-086). A deletion request concerning the account and non-official data (preferences, messages) is handled via CNF-ZS-003 and results in the account being anonymized. Every anonymization or deletion operation is logged (scope, date, trigger) without ever revealing the anonymized identity.

Traceability: INV-ZS-086, [ADR-ZS-003](../decisions/003-default-retention-durations.md), `spec/appendices/01-review-history.md` G-28, INV-ZS-037; `spec/open-questions.md` (OQ-ZS-334, activation at MVP).

Actors: ZSchool; principal's office; data subjects.

### CNF-ZS-024: A school's termination ([ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md))

> **Priority:** Must
> **Version:** V1
> **Acceptance:** [`@REQ-ZS-560`](../../features/cross-cutting/cnf/cnf-22-school-termination.feature)

REQUIREMENT: Upon termination, the platform MUST run in sequence: a full export with tracked delivery, switching the tenant to read-only for 90 days, and deleting operational data 12 months after termination.

(Or closure/loss of authorization, `spec/appendices/01-review-history.md` G-33.) A countdown is visible to the principal's office throughout the read-only period; a deletion report accompanies the final deletion. Individuals' global identities and their read access to published documents are maintained (INV-ZS-080); the residual financial relationship remains viewable until settled. The person retains the ability to exercise their rights over published documents (CNF-ZS-003).

Traceability: [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md), `spec/appendices/01-review-history.md` Q-05, G-33, INV-ZS-045, INV-ZS-080; RSK-ZS-022 (`spec/risks.md`).

Actors: ZSchool; principal's office; data subjects.

### 5.6 E-invoicing and monitoring

### CNF-ZS-025: A prepared UBL e-invoicing export

> **Priority:** Should
> **Version:** V2+

REQUIREMENT: Without waiting for the implementing decree, billing SHOULD keep all the data needed for a structured UBL export: issuer (ICE, IF, address), customer, continuous chronological numbering, line items by service type, totals, payment method.

The obligation's timeline remains uncertain (press reports of a 2026-2028 rollout; B2B first, B2C not planned — since most parents are individuals, schools would not be immediately affected). Once the decree is published, the UBL export is activated by a parameter and completed (a qualified signature, DGI clearance) per the final requirements; the qualified stamp then required draws on [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md)'s V2 channel.

Traceability: `spec/appendices/00-project-baseline.md` §2.7, §7.7, `spec/appendices/01-review-history.md` H-17; RSK-ZS-014 (`spec/risks.md`); `spec/open-questions.md` OQ-ZS-336.

Actors: Principal's office; accounting; ZSchool.

### CNF-ZS-021: Regulatory monitoring and compliance triggers

> **Priority:** Must
> **Version:** V1

REQUIREMENT: ZSchool MUST organize formalized regulatory monitoring, with a documented quarterly review and alert triggers on every listed regulatory dependency, and MUST document every change in an impact sheet.

The 35 expected implementing decrees for Law 59.21 (including the annual written contract's template — `spec/open-questions.md` OQ-ZS-331); the Law 09.08 revision bill (not before Parliament as of 09/09/2026: any change on a DPO, breach notification, digital-consent age); the Family Code reform (CNF-ZS-020); CNDP resolutions and lists (any update to Deliberation 236-2015); the e-invoicing decree (CNF-ZS-025); any possible reinstatement of the repealed Law 06.00's quotas (80% permanent staff, an 8-hour cap). Every change is documented in an impact sheet (affected CNF-ZS requirements and modules, a reconfiguration plan, a deadline) archived in `spec/open-questions.md` and feeds RSK-ZS-012, RSK-ZS-013, RSK-ZS-014, and RSK-ZS-019.

Traceability: `spec/appendices/00-project-baseline.md` §2.7, `spec/appendices/01-review-history.md` H-05, H-14, H-15, H-17; RSK-ZS-012, RSK-ZS-013, RSK-ZS-014, RSK-ZS-019 (`spec/risks.md`).

Actors: ZSchool (operator).

### 5.7 Additions from the September 9, 2026 review

### CNF-ZS-001: A CNDP-formalities timeline before pilots are activated

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-561`](../../features/cross-cutting/cnf/cnf-25-pilot-cndp-timeline.feature)

REQUIREMENT: A named ZSchool point of contact (CNF-ZS-026) MUST file the listed formalities before 12/15/2026, and activating a pilot tenant MUST be conditioned on filing its own-school formalities and signing the pilot agreement (CNF-ZS-002).

Since pilots process real minors' data from 02/01/2027 onward (RDM-ZS milestone): (a) **F211** (or F214) for each pilot school, for the school-record, family-communication, and finance processing, on pre-filled templates provided by ZSchool; (b) ZSchool's own **F211** for the global identity and accounts, logs, and support ([ADR-ZS-027](../decisions/027-processor-and-controller-roles.md)); (c) **F112** for collecting adults' national ID numbers, with the field staying disabled until it is obtained (a 2-to-4-month delay); (d) **F118** for messaging vendors outside the adequacy list (WhatsApp/Meta, email depending on the vendor's location), in each pilot's name, with express consent serving as the basis at MVP in the interim (CNF-ZS-004). A tracking table (formality, controller, filing date, receipt, any reclassification, deadline) is kept by ZSchool and shared with each pilot. This timeline is a dated roadmap dependency (`spec/roadmap.md`).

Traceability: `spec/appendices/00-project-baseline.md` §9, §2.7, [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md), `spec/appendices/01-review-history.md` H-15; [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md); SEC-ZS-001, SEC-ZS-023; CNF-ZS-007, CNF-ZS-008, CNF-ZS-004, CNF-ZS-002.

Actors: ZSchool (data-protection point of contact); each pilot's principal's office; CNDP (recipient).

### CNF-ZS-026: A "data protection" point of contact at ZSchool

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: ZSchool MUST name a "data protection" point of contact, with a named backup, whose contact details appear in every compliance-facing document.

An internal role, since a DPO is not mandatory under positive law (`spec/appendices/01-review-history.md` H-05); the recipient for individuals' requests regarding processing where ZSchool is the controller (CNF-ZS-003), the contact for schools on their formalities (CNF-ZS-001), for sub-processors (CNF-ZS-012), for the CNDP, and for breach notifications (SEC-ZS-013). Their contact details appear in the privacy notice (CNF-ZS-009), the pilot agreement and the contract (CNF-ZS-002), the processing register (CNF-ZS-011), and the principal's office's "Compliance" workspace.

Traceability: `spec/appendices/00-project-baseline.md` §9, [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md), `spec/appendices/01-review-history.md` H-05; [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md); CNF-ZS-009, CNF-ZS-003, CNF-ZS-011, CNF-ZS-002, CNF-ZS-012, CNF-ZS-001; SEC-ZS-013.

Actors: ZSchool; principals' offices; data subjects; CNDP.

### CNF-ZS-027: Legal basis for the teacher's global professional profile and transport geolocation

> **Priority:** Should
> **Version:** V1 (teacher profile, with ZSchool's F211); V2+ (geolocation)

REQUIREMENT: The teacher's global professional profile MUST be declared under ZSchool's own F211, and transport-vehicle geolocation MUST be declared, notified, and consented to at the school where it applies, with retention limited to route needs.

(a) The global `TeacherProfile` (degrees, subjects, experience, availability in V2+) falls under ZSchool's role as controller ([ADR-ZS-027](../decisions/027-processor-and-controller-roles.md)), on the basis of performing the service the teacher requested (created and shared at their own initiative, INV-ZS-072): it is declared under ZSchool's own F211 (CNF-ZS-001); data exported to ESISE is that declared to the employer on `SchoolMembership` ([ADR-ZS-064](../decisions/064-teacher-career-rules.md)), never the global profile. (b) Transport-vehicle geolocation (BEH-ZS-285, V2+), which indirectly locates minors, is a school-side processing activity subject to a specific declaration, dedicated notices, and legal guardians' consent, with retention limited to route needs (a proposed default: 30 days); any interconnection of this data with other files triggers the tier-change alert (CNF-ZS-008).

Traceability: [ADR-ZS-027](../decisions/027-processor-and-controller-roles.md), INV-ZS-072, INV-ZS-087; [ADR-ZS-064](../decisions/064-teacher-career-rules.md); `spec/behaviors/10-teacher-career-network.md` (this module's own OQ register); `spec/behaviors/13-ancillary-services.md` (BEH-ZS-285, this module's own OQ register); CNF-ZS-008, CNF-ZS-001.

Actors: ZSchool; teachers; principals' offices; legal guardians.

---

## 6. Retention table ([ADR-ZS-003](../decisions/003-default-retention-durations.md))

Default periods, appearing in both parties' CNDP declarations (policy D7) and adjustable per school within legal limits (CNF-ZS-022). "End of schooling" = the closing date of the student's last enrollment at the school. Anonymization is irreversible and keeps the registers (INV-ZS-086); deletion destroys the content.

| Data category                                                                 | Example entities (`spec/domain-model.md`)                                              | Default period                                                                                                                                                   | Operation at expiry                                                                              | Basis                                                                                                                                                     |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enrollment registers and year-end decisions                                   | Enrollment, YearDecision, StudentClassHistory                                          | Permanent (by the school)                                                                                                                                        | None; read-only after closure (INV-ZS-084)                                                       | [ADR-ZS-003](../decisions/003-default-retention-durations.md) (archives and reissuing attestations)                                                       |
| Report cards, transcripts, and attestations                                   | ReportCard, Transcript, Certificate                                                    | Permanent (by the school)                                                                                                                                        | None; read access maintained for data subjects (INV-ZS-080)                                      | [ADR-ZS-003](../decisions/003-default-retention-durations.md)                                                                                             |
| Financial documents                                                           | Invoice, Installment, Payment, Receipt, Refund, Dunning, CashSession, FinancialAccount | 10 years from the fiscal year, and never before the account is settled (INV-ZS-018)                                                                              | Deletion                                                                                         | CGI art. 211; [ADR-ZS-003](../decisions/003-default-retention-durations.md); [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md) |
| Attendance                                                                    | AttendanceRecord, Justification, Dispensation                                          | End of schooling + 2 years                                                                                                                                       | Anonymization                                                                                    | [ADR-ZS-003](../decisions/003-default-retention-durations.md)                                                                                             |
| Discipline and student life                                                   | Incident, Sanction, DisciplinaryCouncil, ConductGrade                                  | End of schooling + 2 years                                                                                                                                       | Anonymization                                                                                    | [ADR-ZS-003](../decisions/003-default-retention-durations.md)                                                                                             |
| Health                                                                        | HealthRecord (future module)                                                           | End of schooling + 1 year                                                                                                                                        | Deletion                                                                                         | [ADR-ZS-003](../decisions/003-default-retention-durations.md)                                                                                             |
| Messages and notifications                                                    | Message, Announcement, Notification, DeliveryLog, Thread                               | 2 years                                                                                                                                                          | Deletion                                                                                         | [ADR-ZS-003](../decisions/003-default-retention-durations.md); INV-ZS-086                                                                                 |
| Audit logs                                                                    | AuditLog                                                                               | 5 years                                                                                                                                                          | Deletion                                                                                         | [ADR-ZS-003](../decisions/003-default-retention-durations.md)                                                                                             |
| Accounts with no active relationship                                          | User, profiles with no enrollment or active affiliation                                | 3 years of inactivity                                                                                                                                            | Anonymizing the global identity; each school's register keeps its identity snapshot (INV-ZS-004) | [ADR-ZS-003](../decisions/003-default-retention-durations.md); [ADR-ZS-053](../decisions/053-anonymization-school-registers.md)                           |
| Electronic parental authorizations (outings, events)                          | Event (consents), the associated Message                                               | 5 years after the event (a working hypothesis: civil-liability evidence; distinct from the "messages" period)                                                    | Deletion                                                                                         | `spec/open-questions.md` OQ-ZS-341 (to be confirmed by the founder)                                                                                       |
| Consents                                                                      | ConsentGrant                                                                           | The duration of the consented scope (bounded — INV-ZS-012); the operation's trace remains under the audit log                                                    | The trace is anonymized when the log expires                                                     | [ADR-ZS-003](../decisions/003-default-retention-durations.md) (configurable), INV-ZS-012                                                                  |
| Supporting documents in the record (birth certificate, photos, court rulings) | StudentDocument, relationship documents                                                | Not set by the baseline: a proposed default = end of schooling + 2 years (aligned with attendance), with court rulings kept alongside the registers they support | Anonymized or deleted depending on the document                                                  | `spec/open-questions.md` OQ-ZS-335 (to be settled in review)                                                                                              |

Application rules: deadlines are computed per student and per school; an account may carry several "ends of schooling" (multi-school), with each category's deadline specific to each school; a SUSPENDED enrollment's data remains subject to the current enrollment's periods; backup copies are purged as they rotate (30 days at MVP; the monthly copies kept in V1 are purged of anonymized identities on first use, and any restore replays the anonymizations that occurred since, NFR-ZS-037, [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)); execution is paused for a school in post-termination read-only mode until the [ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md) deletion (CNF-ZS-024).

---

## 7. Screens and entry points (text description)

Screens described in text, bilingual FR/AR, mobile-first, with no mockup. `SCR-ZS` identifiers fall to the module chapters and `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`; these entry points are split between administration (`spec/behaviors/01-administration-onboarding-subscription.md`) and the relevant modules.

1. **Principal's-office "Compliance" workspace**: the state of formalities (a declaration in progress, a receipt, any reclassification), active F112 alerts, pending consents, the quarter's retention deadlines, monitoring sheets; each item opens the matching tool.
2. **Declaration assistant**: a guided, step-by-step flow (identification, purposes, categories, data subjects, recipients, transfers, periods, security), the F211/F214 recommendation shown with its reasoning, a downloadable pre-filled file for CNDP-FORMS filing, fields to enter the receipt and authorization references.
3. **Rights request desk**: a queue of requests (access, rectification, objection, portability) with color-coded deadlines, attachments, response drafting, a logged history.
4. **Consent log**: search by person or by scope; each consent's detail (the notice's version, channel, timestamp); a tracked revocation button.
5. **Enrollment flow**: a notice-acceptance screen (full screen, full scroll, separate boxes for optional consents), versions displayed.
6. **Fee disclosure**: a preview of the document before publication, a list of published versions with dates, a republish button after the fee list changes.
7. **Annual contract**: a payment-plan summary before signing, a signature screen, status (pending, signed, copy delivered), re-downloading the PDF.
8. **Re-enrollment checks**: a modal legal warning when marking "not re-enrolled", mandatory reason and supporting-document fields.
9. **AREF compliance file**: selecting sections, a paginated preview, dated generation with the school's seal.

---

## 8. Specific non-functional requirements

- **Archiving and documents**: bilingual PDFs, correct Arabic fonts, A4/A5 formats, batch printing (the NFR-ZS DOC and I18N domains, `spec/cross-cutting/03-non-functional-requirements.md`); the evidentiary value of contracts and stamps per [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md).
- **Logging** (founder arbitration, [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)): at MVP, minimal logging of compliance writes — corrections are logged at the record level (author, timestamp, INV-ZS-090); the immutable, exportable log (INV-ZS-019) ships in V1, with author, context, and timestamp for sensitive-data views and compliance operations. The MVP degradation is logged in `spec/open-questions.md` OQ-ZS-340.
- **Strengthened protection**: strengthened encryption of identity documents, health data, and court rulings filed under CNF-ZS-008 and CNF-ZS-019 (`spec/cross-cutting/02-security-privacy.md`).
- **Hosting**: production and backups in Morocco, with no outbound flow other than messaging governed by F118 ([ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md); `spec/cross-cutting/02-security-privacy.md`).
- **Volume and availability**: bulk retention and anonymization processing runs outside peak periods (maintenance windows, NFR-ZS domain DISP) and is sized for the technical target (NFR-ZS domain RES).
- **Portability**: open, archivable exports (PDF, CSV, Excel) for the full termination export ([ADR-ZS-004](../decisions/004-cancellation-export-and-deletion-timeline.md)).

---

## 9. Success metrics

Consolidated in `spec/metrics.md` (the `KPI-ZS` namespace). Proposed themes: share of active schools with a valid, archived CNDP declaration; average response time for rights requests; share of the year's enrollments with an annual contract signed before the start of the year; share of retention deadlines executed on time (monthly reports); adherence to termination deadlines (export, read-only, deletion); number of schools with an up-to-date published fee list.

---

## 10. Open questions

Open questions for this chapter are consolidated in `spec/open-questions.md` (`OQ-ZS-331` through `OQ-ZS-341`, built in Phase 6 of the migration), not tracked locally in this file.

---

## Traceability

Full cross-reference coverage for this chapter is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
