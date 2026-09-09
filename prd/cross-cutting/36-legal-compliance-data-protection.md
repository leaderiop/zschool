# ZSchool PRD — Legal Compliance and Data Protection

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review (arbitrations `prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` v1.1 §2.7, §6.9 (RG-27 to RG-35), §7.1, §7.2, §7.7, §9, §12, §14 (DEC-16, DEC-20, DEC-22, DEC-23, DEC-24, DEC-30), §15 (Q-04 to Q-06), §16 (H-05, H-14, H-15, H-17); `prd/research/02-regulatory-data.md`; `prd/research/00-baseline-corrections.md` (#2, #5, #15, #16, #19) |
| Related files | `prd/00-conventions.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/journeys/06-custodial-mother-and-guardian.md`, `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/15-documents-certificates.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/21-massar-regulatory-exports.md`, `prd/modules/23-health-sensitive-data.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/39-risks-mitigations.md`, `prd/cross-cutting/40-assumptions-open-questions-tracker.md`, `prd/cross-cutting/42-review-arbitrations.md` (ARB-01, ARB-12, ARB-20, ARB-25) |

---

## 1. Objective and scope

This chapter translates the legal obligations applicable to ZSchool and its client schools into verifiable requirements. It duplicates neither the permission rules (`prd/cross-cutting/30-roles-permissions-matrix.md`), nor the technical security measures (`prd/cross-cutting/31-security-privacy.md`), nor the integration specifications (`prd/cross-cutting/35-external-integrations.md`): it sets what compliance requires of the product and the documents it must produce.

**In scope:**

- Law 09.08 and the CNDP: a per-school declaration assistant, a tier-change alert into an authorization, a transfer-request template for messaging, privacy notices, individuals' rights, consent logging, a processing register.
- ZSchool's dual role (DEC-16): standard contractual clauses and sub-processor governance.
- Law 59.21: fee disclosure (art. 49), the annual written contract, the pricing lock, an anti-refusal check for re-enrollment, unconditional document delivery, the AREF compliance file.
- The Family Code (Moudawana): the "legal guardian" and "custodian" qualities, parental restriction only on a court decision, a configurable "guardianship regime" parameter.
- Data retention (DEC-22), anonymization and erasure (RG-34), a school's termination (DEC-23).
- UBL e-invoicing preparation (decree not published, H-17).
- Regulatory monitoring.

**Out of scope:** role and permission mechanics (`prd/cross-cutting/30-roles-permissions-matrix.md`), encryption and technical measures (`prd/cross-cutting/31-security-privacy.md`), the finance module's own operation (`prd/modules/16-finance-billing-collections.md`), documents (`prd/modules/15-documents-certificates.md`), enrollment (`prd/modules/11-admissions-enrollment-reenrollment.md`), communication (`prd/modules/17-communication-notifications.md`), and health (`prd/modules/23-health-sensitive-data.md`), vendor API specifications (`prd/cross-cutting/35-external-integrations.md`).

**Versions.** The baseline sets "Audit, individuals' rights, formalized CNDP compliance" in V1 (PROJECT.md §12). Some building blocks are nonetheless active from MVP onward because baseline invariants or rules require them at MVP: notices accepted at enrollment (PROJECT.md §7.2), logged consents (INV-24), the pricing lock (INV-40), official documents never blocked (INV-39, DEC-24), guardian/custodian qualities and court-ordered restriction (INV-10, INV-11), retention and anonymization (INV-28). This split is justified requirement by requirement and consolidated in OQ-04, per conventions §1.5. The 09/09/2026 review (ARB-25) further moved to MVP the building blocks essential for pilots that process real minors' data from 02/01/2027 onward: a CNDP-formalities timeline before activation (CNF-25), a pilot processor agreement (CNF-08), a manual individuals'-rights procedure (CNF-05), a WhatsApp transfer basis (CNF-03), the parent contract (CNF-11, ARB-01), and the re-enrollment anti-refusal check in wave 2 (CNF-13).

---

## 2. Reference legal framework and ZSchool's dual role

### 2.1 Applicable texts

| Text | Status as of 09/09/2026 (source) | Product implications |
|---|---|---|
| Law 09.08 (personal data protection) and CNDP resolutions | In force; the revision bill drafted by the CNDP has not been filed with Parliament (H-05, confirmed by research: `prd/research/02-regulatory-data.md` §2) | F211/F214 declarations, F112 authorizations, F118 transfer authorizations, notices (art. 5), rights (art. 7 to 9), security (art. 23) |
| Law 59.21 (private school education) | Published in Official Gazette No. 7485 of 02/23/2026; 113 articles; repeals laws 04.00, 05.00, and 06.00; 35 implementing decrees expected (`prd/research/02-regulatory-data.md` §1; baseline correction #2) | Fee disclosure, an annual written contract, prohibitions (mid-year increases, forced purchases, refusing re-enrollment), fines up to 100,000 DH for repeat offenses |
| The Family Code (Law 70-03 of 2004) | In force; the Reform Commission's report submitted to the King on 12/23/2024 is neither voted nor enacted as of 08/12/2026 (`prd/research/02-regulatory-data.md` §5; baseline correction #5) | Art. 236 (father as legal guardian by right), art. 171 (custody order: mother, father, maternal grandmother), art. 209 (majority at 18) |
| General Tax Code, art. 211 | In force | Retention of accounting documents: 10 years |
| CGI art. 145-IX (e-invoicing) | Implementing decree not published as of 09/09/2026; a draft at the General Secretariat of Government since April 2026; UBL format, a clearance model; B2B first, B2C not planned (`prd/research/02-regulatory-data.md` §7; baseline correction #15; H-17) | Preparing the structured export, timeline pending publication |
| Law 43.20 and decree 2-22-687 (trust services) | In force; per-service licenses (signature, stamping, timestamping) | Evidentiary value of the parent contract and documents: DEC-30 |

### 2.2 ZSchool's dual role (DEC-16)

- **ZSchool is a processor** for each school's operational data (enrollment, grades, attendance, finance, communication): the school is the controller, and it declares and authorizes its own processing. Declarations and authorizations filed by ZSchool **do not exempt** the school from its own CNDP formalities (`prd/research/02-regulatory-data.md` §2).
- **ZSchool is a controller** for the global identity and, eventually, the student passport: it declares its own processing and answers directly for individuals' rights within that scope.
- Consequences: a set of contracts and templates (section 4) clearly separating the two roles; a per-school processing register and ZSchool's own register; shared retention periods (DEC-22) appearing in both parties' declarations.

### 2.3 Up-to-date data adopted (baseline/research divergences)

Per `prd/research/00-baseline-corrections.md`, this chapter adopts: the publication date of Law 59.21 in Official Gazette No. 7485 of 02/23/2026 (#2); the Family Code reform **not voted** (#5), with RG-14b remaining applicable as-is; the state of e-invoicing (#15); confirmation of case law and the ministerial position on documents and arrears, with Law 59.21's new sanction (#16); CNDP clarifications on F211/F214, F112, F118, and Deliberation 236-2015 (#19). These divergences are recorded in §10.

---

## 3. Compliance users and use cases

| User | Use case |
|---|---|
| School principal's office (`DIR`) | Carry out and track CNDP formalities with the assistant; keep the processing register; publish the fee list; have annual contracts signed; check re-enrollments; assemble the compliance file for an AREF inspection |
| Registrar's office (`SEC`) | Collect notices and consents at enrollment; respond to document requests; receive arrears alerts without ever blocking official documents |
| Parents and guardians (`PAR`, `GAR`) | Receive legal notices; exercise the rights of access, rectification, and objection; give and withdraw consent; obtain administrative documents (custodial mother: ministerial position of 05/30/2023, `prd/journeys/06-custodial-mother-and-guardian.md`) |
| Adult student (`ELE`) | Be informed of their rights at the time of majority and at every re-enrollment (RG-02, DEC-20); exercise rights over their own record |
| ZSchool (operator) | Contract with each school (DEC-16); govern its sub-processors; execute retention, anonymization, and terminations; maintain regulatory monitoring |
| External oversight (AREF, CNDP) | Receive the compliance documents the platform produces (registers, receipts, published fee lists, contracts) |

---

## 4. Contractual documents and templates

Compliance is materialized through documents the platform generates, versions, and archives. Reference list:

| # | Document | Parties | Product support | Version |
|---|---|---|---|---|
| D1 | ZSchool–school contract (processor agreement and SaaS license) with appendices: security measures, sub-processor list, reversibility clauses, breach notification within 72 hours, MVP fallback targets | ZSchool / school (or organization) | ZSchool's contract template, signed before the tenant is activated; referenced in the register | MVP (pilot agreement signed before activation — ARB-25e); V1 (full commercial contract, DEC-16) |
| D2 | Annual written school–parent contract (Law 59.21), with the complete fee list and the school's internal rules | School / legal guardian, countersigned by the financial guardian if distinct (ARB-20h) | Generated per enrollment from the fee list; at MVP, front-desk signature with identity verification; in V1, advanced remote electronic signature (DEC-30, INT-SIG-02); a copy given to the parent; archived in the student's record | MVP (ARB-01, FR-FIN-02, FR-INS-16); the regulatory template is forthcoming (OQ-01) |
| D3 | Privacy notices (art. 5, Law 09.08), bilingual FR/AR | School / data subjects | A configurable ZSchool template; presented at enrollment and at key steps; versioned; acceptance logged | MVP |
| D4 | CNDP formality templates: F211 (standard) or F214 (simplified) declaration, an F112 authorization request, an F118 transfer authorization request | School / CNDP | At MVP, pre-filled templates provided outside the tool by ZSchool, with filings driven per the CNF-25 timeline (before 12/15/2026); in V1, pre-filled by the compliance assistant; filed online via CNDP-FORMS; receipts and references archived | MVP (templates and filings, CNF-25); V1 (tooled assistant) |
| D5 | Processing register (school and ZSchool) | School, ZSchool | Automatically generated from activated modules; PDF export | V1 |
| D6 | Standard clauses for downstream sub-processors (a Moroccan host and failover site, the Moroccan SMS aggregator, an international SMS gateway, WhatsApp Business / Meta, email; in V1: Google's FCM and Apple's APNs push services, any external monitoring; in V2: a signature provider) | ZSchool / sub-processors | Contract templates; commitments passed through to schools via a D1 contract appendix | MVP (pilot-agreement appendix: initial list); V1 (a full amendment procedure) |
| D7 | A standard retention policy (DEC-22 periods), an appendix to CNDP declarations | School | A template attached to D4 declarations; configurable within legal limits | MVP (table) / V1 (formalized appendix) |
| D8 | AREF compliance file: an exportable bundle (legal information, the published fee list and its versions, contract references, the register, CNDP receipts, the list of teachers and authorizations) | School / AREF | A single PDF export from the compliance workspace | V1 |
| D9 | Account statement and exit file given to the parent upon departure | School / guardians | Generated by the finance and documents modules (`prd/modules/16-finance-billing-collections.md`, `prd/modules/15-documents-certificates.md`) | MVP (statement) / V1 (full exit file) |

---

## 5. Compliance requirements

Requirements carry the `CNF` prefix (a namespace exclusive to this file, conventions §2). The attribute-table template from conventions §3 is kept.

### 5.1 Law 09.08 and the CNDP

#### CNF-01 — A per-school CNDP declaration assistant

| Attribute | Value |
|---|---|
| Description | Every school has a compliance assistant that guides it through its prior CNDP declaration: guided collection of elements (the controller, purposes, data categories, data subjects, recipients, transfers, retention periods, security measures), a reasoned recommendation between the standard declaration **F211** and the simplified declaration **F214** (applicable if the processing matches a CNDP resolution), generating a pre-filled application to file on the CNDP-FORMS online platform, recording the receipt (issued within 24 hours), and tracking the risk of reclassification into an authorization within 8 days. Templates are provided by ZSchool (PROJECT.md §9). Scope boundary (no duplication): CNF-01 **owns the formalities process** and the templates' legal content; detection and alerting for the tier change into the F112 authorization is owned on the security side by SEC-17 (`prd/cross-cutting/31-security-privacy.md`, alert triggers and the §4.1 register), whose alerts feed the assistant — one tool described from two angles, with no duplicated deliverable. The assistant reminds users that this formality belongs to the school and that ZSchool's own declarations do not replace it. At MVP, before the assistant is tooled, pre-filled templates are provided outside the tool and pilot and ZSchool filings are driven per the CNF-25 timeline (before 12/15/2026). |
| Priority | Must (aligned with SEC-17) |
| Version | V1 (tooled assistant); MVP: templates outside the tool and filings per CNF-25 |
| Traceability | PROJECT.md §9, DEC-16, H-15; `prd/research/02-regulatory-data.md` §2; baseline correction #19; `prd/cross-cutting/31-security-privacy.md` (SEC-17, §4.1) |
| Actors | Principal's office; ZSchool (templates and assistance) |

#### CNF-02 — Detecting and alerting on the tier change into the F112 authorization

| Attribute | Value |
|---|---|
| Description | When a school's processing activity collects data subject to prior authorization (art. 12, Law 09.08) — a **national ID number**, **health** data, biometrics, file interconnection — the platform flags it immediately: a contextual banner at the point of entry, a task created in the compliance assistant, a reminder in the register. When the health module (`prd/modules/23-health-sensitive-data.md`) is activated, the school must attest that the F112 authorization exists (reference and date recorded) before health-data entry opens. Detection also covers historical data already present when the feature is activated. At MVP, the "national ID number" field is disabled for every school until the F112 authorization (filed before 12/15/2026, CNF-25) is on record with ZSchool (ARB-25a); the tier-change alert applies when the field is activated. No biometric feature is planned for the product; any attempt to enable one is blocked with a link to the formality. Scope boundary (no duplication): detection and the formalities register on the security side are owned by SEC-17 (`prd/cross-cutting/31-security-privacy.md`, §4.1); CNF-02 is its product-side relay in day-to-day entry screens (a banner, a task routed to the assistant, a lock on activating the health module) — the two requirements complement each other without duplication. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §9, H-15; `prd/research/02-regulatory-data.md` §2; R-15 (`prd/cross-cutting/39-risks-mitigations.md`); `prd/cross-cutting/31-security-privacy.md` (SEC-17) |
| Actors | Principal's office; registrar's office; ZSchool |

```gherkin
Feature: Tier change into the F112 authorization
  Scenario: National ID field disabled at MVP
    Given a pilot school whose F112 authorization is not yet on record
    When the registrar opens a parent's record
    Then the "national ID number" field is disabled with a note about the formality in progress
    And the adult's identity relies on first name, last name, date of birth, and mobile number

  Scenario: A national ID number entered in a record (once the field is activated)
    Given a school declared under F211 with no F112 authorization
    When a user records a parent's national ID number in their identity documents
    Then a banner informs them that the national ID number subjects the processing to prior CNDP authorization
    And a "request an F112 authorization" task is created in the compliance assistant
    And the task's reference appears in the processing register
```

#### CNF-03 — An F118 transfer-authorization template for messaging

| Attribute | Value |
|---|---|
| Description | Data flows of individuals leaving Morocco are exhaustively listed in the vendor register (SEC-18): WhatsApp Business messaging (Meta, United States), email, and, in V1, Google's (FCM) and Apple's (APNs) push notification services (ARB-25d); any external monitoring tool is entered there before activation. The platform provides each school with the F118 authorization request template matching each vendor, pre-filled (recipients, notification purposes, data categories), states for each recipient country its status against the current adequacy list (Deliberation No. 236-2015: EU/EEA excluding Croatia, the United Kingdom, Switzerland, Canada — 32 states; otherwise authorization required), and flags where applicable that a listed country (France, Spain) requires no F118. **At MVP**, the basis for the transfer to Meta is the recipient's express consent, collected with an explicit notice about the transfer outside Morocco (INT-WAP-03, ARB-25c; `prd/research/02-regulatory-data.md` §2: express consent is an alternative basis to F118); pilots' F118 requests are filed in parallel before 12/15/2026 (CNF-25). The reference of the authorization obtained is archived in the register. The Moroccan SMS aggregator opens no transfer; an SMS to a foreign number travels through an international gateway entered in the register (ARB-07). |
| Priority | Must |
| Version | MVP (an F118 template per vendor, WhatsApp express consent, filing per CNF-25); V1 (push FCM/APNs) |
| Traceability | DEC-26, H-15, H-11; PROJECT.md §9; ARB-07, ARB-25c, ARB-25d; SEC-18; INT-WAP-03; `prd/research/02-regulatory-data.md` §2 |
| Actors | Principal's office; ZSchool (templates, SMS aggregator) |

#### CNF-04 — Privacy notices at enrollment and information at key steps

| Attribute | Value |
|---|---|
| Description | At enrollment, every legal guardian receives the privacy notice (art. 5, Law 09.08): the controller's identity (the school), purposes, data categories, recipients and transfers (messaging), retention periods, rights, and a contact channel. Bilingual FR/AR and versioned notices are presented in full before acceptance; acceptance is dated, logged, and tied to the version displayed. The same mechanism informs a student who has come of age of their rights at the time and at every re-enrollment (RG-02, DEC-20), and informs guardians of the sharing consents requested during transfers (INV-24). The notice template is provided by ZSchool and configurable per school (its own contact details). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §7.2, §9, RG-02, DEC-20, INV-24, INV-35; OQ-04 (activation at MVP) |
| Actors | Registrar's office; parents and guardians; adult student |

```gherkin
Feature: Privacy notice at enrollment
  Scenario: Enrolling a new student at the front desk
    Given a complete enrollment file for student Youssef
    When the registrar submits the enrollment for the guardian's signature
    Then the full privacy notice is displayed first, in FR or AR per the interface language
    And acceptance is possible only after it is displayed, and carries the notice's version
    And the operation is logged with the author, timestamp, and version accepted

  Scenario: A student comes of age
    Given a student who turns 18
    When civil majority is detected at their next login
    Then the student receives an information message about their rights (account ownership, restricting parental access)
    And the information is logged
```

#### CNF-05 — An individuals'-rights request desk (access, rectification, objection, portability)

| Attribute | Value |
|---|---|
| Description | Any data subject (a parent, an adult student, a teacher, staff) can file, from their portal, a request for access, rectification, objection, or portability of their published documents (art. 7 to 9, Law 09.08; PROJECT.md §9). The request desk manages a thread per request: an immediate acknowledgment, a response deadline configurable by the school (default: 30 calendar days — the law setting no deadline in the sources consulted; OQ-03 resolved, ARB-25f), a pre-deadline alert, a reasoned response with supporting evidence, and full logging (the request, its handling, the response, timelines). Objection applies to non-essential communications (marketing, optional events) without ever depriving the person of information necessary to schooling (absences, official notices, finance); the absence of a distinct legal basis for a denial is flagged to the school. For processing activities where ZSchool is the controller (global identity), ZSchool responds directly and the school is informed of the scope. **At MVP** (ARB-25f), rights are enforceable from the first processing activity and are served by a manual procedure: filing the request at the school's front desk (a bilingual form provided) or with ZSchool support, an acknowledgment, a request register kept by the school (a template provided), handling within the 30-day deadline with ZSchool's assistance, a reasoned response; the tooled portal desk ships in V1. |
| Priority | Must |
| Version | MVP (manual procedure, register, 30-day deadline — ARB-25f); V1 (a tooled portal desk) |
| Traceability | PROJECT.md §9, §12 (V1 "individuals' rights"), DEC-16, RG-02; ARB-25f; SEC-14; `prd/research/02-regulatory-data.md` §2; OQ-03 (resolved) |
| Actors | Parents and guardians; adult student; teachers and staff; principal's office; ZSchool |

```gherkin
Feature: A parent's access request
  Scenario: Response within the configured deadline
    Given a parent holding an active account
    When they file an access request for their child's data
    Then they receive an immediate acknowledgment with the deadline
    And the request appears in the school's rights-request-desk thread
    And the response is sent before the deadline, stating the scope disclosed
    And every step (filing, handling, response) is logged with author and timestamp
```

#### CNF-06 — Logging legal guardians' consents

| Attribute | Value |
|---|---|
| Description | Every consent given by a legal guardian for a minor (and by an adult student for themselves) is recorded as a consent entity (ConsentGrant, PROJECT.md §6.10) carrying: the data subject, the giver's quality, the scope (notices, WhatsApp sending, sharing during a transfer, an eventual student passport), duration, the version of the information displayed, the channel (portal, front desk, scanned paper), and a timestamp. Every consent is revocable at any time; revocation takes effect on future sends (INV-24), is logged, and is notified to the school. Optional consents (WhatsApp, marketing communications) are separate, never pre-checked boxes, distinct from mandatory notices. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §9, RG-30, RG-31, INV-24; baseline correction #6 (WhatsApp opt-in, 2019 CNDP-ANRT guidance) |
| Actors | Parents and guardians; adult student; registrar's office; principal's office |

#### CNF-07 — A per-school processing register

| Attribute | Value |
|---|---|
| Description | The platform keeps, for each school, a processing register automatically generated from the activated modules: purposes, categories of data and data subjects, internal recipients and vendors, transfers outside Morocco with their basis (the adequacy list or an F118 authorization), retention periods (DEC-22), references of CNDP declarations and authorizations (F211/F214 receipts, F112, F118 authorizations), security measures (cross-referencing the contract and `prd/cross-cutting/31-security-privacy.md`). ZSchool keeps the register for its own processing (global identity, SaaS, support). The register is exportable as a PDF for presentation to the CNDP or the AREF; activating or deactivating any module updates the register and notifies the principal's office. |
| Priority | Must |
| Version | V1 |
| Traceability | DEC-16, PROJECT.md §9; `prd/research/02-regulatory-data.md` §2 |
| Actors | Principal's office; ZSchool |

### 5.2 Dual role and contracts (DEC-16)

#### CNF-08 — Standard contractual clauses of the ZSchool–school contract

| Attribute | Value |
|---|---|
| Description | The ZSchool–school contract template (document D1) includes, at minimum: qualification of the parties (ZSchool as processor for operational data, controller for the global identity and student passport — DEC-16); processing instructions and purposes; a security and confidentiality commitment (cross-referencing the measures of `prd/cross-cutting/31-security-privacy.md`); the list of authorized downstream sub-processors; mutual assistance in exercising individuals' rights and CNDP formalities; keeping and updating registers; a full export and reversibility (DEC-23); breach notification; audit terms; personal-data breach notification within 72 hours (SEC-22); MVP fallback targets (24-hour RPO, daily off-site replication, INT-HEB-06); the fate of data at contract end (DEC-22 retention, then deletion). **At MVP**, a **pilot agreement** carrying these clauses is signed by each pilot school before its tenant is activated (ARB-25e); the full commercial contract is finalized for V1 (DEC-16). Its reference appears in the school's register. |
| Priority | Must |
| Version | MVP (a pilot agreement signed before activation — ARB-25e); V1 (a full commercial contract) |
| Traceability | DEC-16, PROJECT.md §2.7 ("product implication"), §9; ARB-25e; SEC-22; OQ-04 (formalization before commercial launch) |
| Actors | ZSchool; principal's office |

#### CNF-09 — Governance of cascading sub-processors

| Attribute | Value |
|---|---|
| Description | The list of sub-processors authorized by the contract (D1/D6) is closed and versioned: the production host and failover site in Morocco (DEC-26; the vendor's remote-administration terms are qualified, INT-HEB §8.3), the Moroccan SMS aggregator, an international SMS gateway for foreign numbers (ARB-07), WhatsApp Business (Meta, outside Morocco), the email vendor, and, in V1, Google's (FCM) and Apple's (APNs) push notification services — outside Morocco, a transfer basis required before activation (ARB-25d) — as well as any technical monitoring tool hosted outside Morocco; a signature and stamping provider in V2 (DEC-30). Any addition or replacement triggers: a contract update (an amendment), informing schools with a documented right to object, updating the processing register, and verifying the sub-processor accepts the same commitments (security, DEC-22 retention periods, reversibility). No new data flow outside Morocco opens until the matching F118 template (CNF-03) is provided to the affected schools. At MVP, the initial list appears as an appendix to the pilot agreement (CNF-08). |
| Priority | Must |
| Version | MVP (an initial list appended to the pilot agreement); V1 (a full amendment procedure) |
| Traceability | DEC-16, DEC-26, DEC-30; ARB-07, ARB-25d; SEC-18; R-17 (`prd/cross-cutting/39-risks-mitigations.md`) |
| Actors | ZSchool; principal's office |

### 5.3 Law 59.21

#### CNF-10 — Fee disclosure (art. 49)

| Attribute | Value |
|---|---|
| Description | From the school's fee list (`prd/modules/16-finance-billing-collections.md`), the platform generates a disclosure document listing every fee category charged (enrollment, re-enrollment, tuition, insurance, catering, boarding, transport, activities), by level and by school year, bilingual FR/AR, in a print format (permanently posted at the school) and as a downloadable PDF. Every publication is timestamped and versioned: the history of published versions is kept and can be presented during an inspection, with the published version matching the fee list in force. A fee-list change with no republication triggers a consistency alert to the principal's office. Law 59.21 safeguard (forced sale): when a fee-list line for textbooks, supplies, or a uniform is marked "mandatory", the platform displays a legal alert (forced sale is banned — `prd/research/02-regulatory-data.md` §1; baseline correction #2) and requires a logged justification to be recorded in the compliance register; the school alone remains the decision-maker and is responsible for its own compliance. |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §2.7, H-14; `prd/research/02-regulatory-data.md` §1 (art. 49); baseline correction #2; `prd/modules/16-finance-billing-collections.md` (FR-FIN-01) |
| Actors | Principal's office; registrar's office |

#### CNF-11 — Annual written school–parent contract

| Attribute | Value |
|---|---|
| Description | For every enrollment, the platform generates the annual written contract (document D2): identification of the parties and the student, a personalized fee list (level, transport and canteen options), a payment plan, the school's internal rules, privacy notices, legal clauses (the ban on mid-year increases, document delivery, re-enrollment terms). The contract is signed by the legal guardian (or the adult student, RG-02) and, when distinct, **countersigned by the financial guardian** so the payment plan is enforceable against them (INV-09, ARB-20h); at MVP, the signature is collected at the front desk with identity verification, a timestamp, and archiving; in V1, it is electronic at the advanced level, remote (DEC-30, INT-SIG-02 and its compensating measures; a qualified stamp in V2), with identification evidence, a timestamp, and archiving (the document, its fingerprint, a log). A copy is given to the parent (a PDF via the portal and a notification channel); the contract is kept in the student's record and will appear in the AREF compliance file (CNF-16). Generation will align with the regulatory template once it is published (OQ-01). Ownership and no duplication: CNF-11 owns the contract's template, its legal notices, and the signature/archiving requirement; generation within the enrollment flow is owned by FR-INS-16 (`prd/modules/11-admissions-enrollment-reenrollment.md`), and the source of pricing data (the fee list, payment plan) by FR-FIN-02 (`prd/modules/16-finance-billing-collections.md`) — explicit boundaries, with no content duplication. |
| Priority | Must |
| Version | MVP (wave 1 — ARB-01; front-desk signature, financial-guardian countersignature); V1 (remote electronic signature) |
| Traceability | PROJECT.md §2.7, §7.7, H-14, DEC-30, G-31; ARB-01, ARB-20h; INT-SIG-02; `prd/research/02-regulatory-data.md` §1; OQ-01; `prd/modules/11-admissions-enrollment-reenrollment.md` (FR-INS-16); `prd/modules/16-finance-billing-collections.md` (FR-FIN-02) |
| Actors | Principal's office; legal guardian; registrar's office |

```gherkin
Feature: Signing the annual contract
  Scenario: Contract signed and archived
    Given an active enrollment with a validated fee list
    When the legal guardian signs the contract from their portal
    Then the signed document is timestamped, fingerprinted, and archived in the student's record
    And a PDF copy is accessible to the parent from their portal
    And the contract appears with its reference in the school's compliance file

  Scenario: Signature refused by the portal on a pricing inconsistency
    Given a payment plan that does not match the published fee list
    When the contract is generated
    Then generation is blocked with a message about the inconsistency to be corrected

  Scenario: Countersignature by a distinct financial guardian (MVP)
    Given an enrollment where the legal guardian is the father and the financial guardian is the grandfather
    When the contract is generated at the front desk
    Then it requires the father's signature and the grandfather's countersignature, each with identity verification
    And the payment plan is enforceable against the grandfather as financial guardian
```

#### CNF-12 — Pricing lock on an active enrollment

| Attribute | Value |
|---|---|
| Description | Per Law 59.21 (the ban on mid-year increases) and invariant INV-40, an active enrollment's contractual rate is locked for the entire school year: the enrollment captures the fee list's version at activation — at MVP, capture happens when the enrollment is activated (the fee-list version recorded on the enrollment); at V1, the anchor point becomes signing the annual written contract (CNF-11) — and no change to the fee list or payment plan can increase an ACTIVE enrollment's cost, including via a level or option change. The platform refuses the operation with an explicit FR/AR message citing the rule. Correcting a clerical error is possible only through an auditable procedure (a reason, an author, the principal's office's approval, a log entry) and never retroactively affects installments already paid. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §2.7, §7.7, H-14, INV-40; `prd/research/02-regulatory-data.md` §1; OQ-04 (activation at MVP) |
| Actors | Principal's office; accounting; registrar's office |

```gherkin
Feature: Blocking a mid-year increase
  Scenario: An attempt to raise an active student's rate
    Given an ACTIVE enrollment whose rate captured at activation is 800 MAD per month
    When a user raises that enrollment's monthly fee to 900 MAD
    Then the operation is refused with a message explaining the ban on mid-year increases (Law 59.21)
    And no pricing entry is recorded
    And the attempt is logged

  Scenario: Correcting a clerical error
    Given a confirmed data-entry error on an active enrollment's payment plan
    When the principal's office applies the correction via the audited procedure
    Then the reason, author, and approval are recorded
    And installments already paid are not modified
```

#### CNF-13 — An anti-refusal check for re-enrollment

| Attribute | Value |
|---|---|
| Description | Law 59.21 bans refusing to re-enroll a student in good standing. In the re-enrollment campaign and rollover (`prd/modules/11-admissions-enrollment-reenrollment.md`), any decision not to re-enroll a student whose prior enrollment was ACTIVE or COMPLETED with no disciplinary expulsion triggers: a legal warning displayed (the ban and a fine of up to 10,000 DH, `prd/research/02-regulatory-data.md` §1), a mandatory reason and supporting document (a disciplinary council decision, a documented file), logging, and a trace in the compliance file. The platform does not judge whether the refusal is lawful: it guarantees the decision is deliberate, justified, and traceable. Arrears alone do not constitute a refusal reason the platform displays (Q-06). |
| Priority | Must |
| Version | MVP (wave 2 — year-end close, with FR-INS-20 and FR-INS-21 — ARB-01) |
| Traceability | PROJECT.md §2.7, §12 ("re-enrollment campaign, rollover"), H-14, Q-06; ARB-01; `prd/research/02-regulatory-data.md` §1 |
| Actors | Principal's office; registrar's office |

```gherkin
Feature: Governed refusal of re-enrollment
  Scenario: Not re-enrolling a student in good standing
    Given a student whose 2025-2026 enrollment is COMPLETED with decision "promoted"
    When the principal's office marks the student "not re-enrolled" for 2026-2027
    Then a legal warning about refusing re-enrollment is displayed
    And confirming requires a reason and a supporting document
    And the justified decision is logged and visible in the compliance file

  Scenario: Normal re-enrollment
    Given a student in good standing presented at the re-enrollment campaign
    When the guardian confirms re-enrollment with a deposit
    Then no refusal-related friction appears
    And the N+1 enrollment is created per journey PC-02
```

#### CNF-14 — Unconditional delivery of official documents

| Attribute | Value |
|---|---|
| Description | No system state blocks generating and delivering the attestation of enrollment, the exit certificate, report cards, and transcripts, including in the event of arrears (DEC-24, INV-39; the ministerial position, 2020 summary-proceedings orders, Law 59.21, which now sanctions denial of delivery up to 10,000 DH). Arrears are expressed only as an alert visible to staff on the record and as an account statement given to the parent upon departure. Only non-mandatory services — transport, canteen, activities, carried by `prd/modules/22-ancillary-services-transport-canteen-activities.md` — may be conditioned on payment (Q-06); the following year's re-enrollment is not a service: its governance falls to the re-enrollment anti-refusal check (CNF-13) and the re-enrollment campaign (`prd/modules/11-admissions-enrollment-reenrollment.md`). This rule is authoritative for the documents module (FR-DOC-09 aligned, ARB-20d). The account statement attached to the exit file is given only to the financial guardian; a file given to another guardian or the custodian has it removed (ARB-20e). |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-24, Q-06, INV-39, PROJECT.md §7.7; baseline correction #16; OQ-04 (activation at MVP) |
| Actors | Registrar's office; principal's office; parents |

```gherkin
Feature: An exit certificate despite arrears
  Scenario: Delivery with an alert and an account statement
    Given a transferred student with an outstanding balance of 1,200 MAD
    When the parent requests the exit certificate
    Then the certificate is generated and delivered normally
    And the arrears alert remains visible to staff on the record
    And the balance statement is attached to the exit file given only to the financial guardian
```

#### CNF-15 — A written register of official-document requests and deliveries

| Attribute | Value |
|---|---|
| Description | Every request for an official document (front desk, parent portal, scanned mail) and every delivery is recorded in writing in a register: the requester and their quality (legal guardian, custodial parent, adult student), the document and its number, the request date, the delivery date and channel, and the staff member. This register provides the written proof of delivery required by regulatory traceability (baseline correction #16) and feeds the AREF compliance file. Since denying delivery of an official document is impossible under CNF-14, the register carries no "denied" status for these documents; requests for non-official, conditionable documents follow the documents module's rules (`prd/modules/15-documents-certificates.md`). |
| Priority | Must |
| Version | V1 |
| Traceability | DEC-24, baseline correction #16, PROJECT.md §7.6; PC-10 (`prd/journeys/00-journey-map.md`) |
| Actors | Registrar's office; principal's office; parents; adult student |

#### CNF-16 — The AREF compliance file

| Attribute | Value |
|---|---|
| Description | A single export (a paginated, bilingual PDF) bundles the documents expected during an AREF academic, administrative, or health inspection: the school's legal information (authorization number, its AREF, ICE, IF — RG-22), the published fee list and its version history (CNF-10), references of signed annual contracts (CNF-11), the document request-and-delivery register (CNF-15), the processing register and CNDP receipts/authorizations (CNF-01, CNF-02, CNF-03, CNF-07), the retention policy (D7), the list of teachers with their status, quotas, and AREF authorizations (`prd/modules/19-teacher-career-network.md`), regulatory statistical exports (`prd/modules/21-massar-regulatory-exports.md`). Generation is dated and stamped with the school's seal. |
| Priority | Should |
| Version | V1 |
| Traceability | PROJECT.md §2.7 (AREF inspection), §7.7, H-14; `prd/research/02-regulatory-data.md` §1 |
| Actors | Principal's office; AREF (recipient) |

### 5.4 The Family Code (Moudawana)

#### CNF-17 — Distinct "legal guardian" and "custodian" qualities

| Attribute | Value |
|---|---|
| Description | The "legal guardian" (*الولاية*) and "custodian" (*الحضانة*) qualities are recorded separately on the parent–student relationship (INV-11), each with its own supporting document (a certificate, a court ruling) and date. The legal guardian — by default the father (art. 236); the mother in the event of death, absence, incapacity, or by court ruling — is the required signatory for enrollment, transfer, and the exit certificate. The custodian — by default the mother (art. 171: mother, then father, then maternal grandmother) — has access to school information and administrative documents, per the ministerial position of 05/30/2023. Other qualities (financial guardian, emergency contact, a person authorized to pick up the child) remain independently combinable (RG-13, RG-14b). In case of conflict, the school is the operational arbiter and may attach a court ruling or the public prosecutor's opinion to the record (RG-16). |
| Priority | Must |
| Version | MVP |
| Traceability | RG-14b, RG-13, RG-16, INV-11, INV-09; PROJECT.md §2.7; `prd/research/02-regulatory-data.md` §5; OQ-04 (activation at MVP) |
| Actors | Principal's office; registrar's office; parents and guardians |

#### CNF-18 — Restricting a parent only on a court decision

| Attribute | Value |
|---|---|
| Description | By default, all legal guardians and the custodian have access to school information. Restricting or suspending a parent's rights (viewing, notifications, signatures) can be recorded only upon presenting a court decision: the reference, court, and date are entered, the supporting document is uploaded (strongly encrypted, `prd/cross-cutting/31-security-privacy.md`), the effect on access and notifications is immediate, logging is complete, and the principal's office is alerted. Any attempt to restrict without a supporting document is refused with a note pointing to the rule. Lifting or extending the restriction requires a new court document. Guardians' conflicting requests are escalated to the school (RG-16), with ZSchool never ruling on them. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-14, RG-16, INV-10; BES-GAR-06 (`prd/02-actors-personas.md`); OQ-04 (activation at MVP) |
| Actors | Principal's office; registrar's office; parents and guardians |

```gherkin
Feature: Restricting a parent's access
  Scenario: Restriction with no court decision
    Given an active parent–student relationship
    When a user attempts to restrict the father's access with no court document
    Then the operation is refused with the message "restriction is possible only on a court decision"
    And no rights change is recorded

  Scenario: Restriction based on a recorded decision
    Given a restrictive court order provided by the school
    When the principal's office records the decision with a reference and a supporting document
    Then the targeted parent's access and notifications are immediately suspended per the decision's scope
    And the other guardians keep their rights
    And the operation is logged with its associated supporting document
```

#### CNF-19 — A configurable "guardianship regime" parameter

| Attribute | Value |
|---|---|
| Description | The default values governing guardianship and custody (guardian by right, the custody-order priority) are carried by a platform-level configuration rather than hard-coded into behavior. As long as the 70-03 Family Code remains in force, the defaults are the baseline's (RG-14b); since the 12/23/2024 reform report is neither voted nor enacted, no change is anticipated (baseline correction #5). Once a reform takes effect, the switch happens with no schema rework: new defaults activated by a parameter, a review campaign for affected relationships offered to schools (re-qualifying qualities with supporting documents), logging of re-qualifications. This mechanism ties into regulatory monitoring (CNF-24) and risk R-08. |
| Priority | Should |
| Version | V1 |
| Traceability | RG-14b, baseline correction #5, R-08 (`prd/cross-cutting/39-risks-mitigations.md`); OQ-08 |
| Actors | ZSchool; principal's office |

### 5.5 Retention, anonymization, termination

#### CNF-20 — A retention engine at the default periods (DEC-22)

| Attribute | Value |
|---|---|
| Description | The platform automatically executes the default retention periods of the §6 table, per school and per data category: computing deadlines ("end of schooling" = the closing date of the student's last enrollment at the school; a "dormant" account = no active relationship), running the retention operation (anonymization or deletion) during maintenance windows, and a periodic execution report (volumes processed, exclusions, errors) made available to the principal's office and ZSchool. Periods are adjustable per school within legal limits: never below legal minimums (10 years for accounting documents, CGI art. 211), never beyond what Law 09.08's proportionality principle justifies; any deviation from the default is logged in the retention policy (D7) attached to CNDP declarations. The audit log, carried in V1 (INV-33), is kept for 5 years once it exists. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-22, RG-34, Q-04, INV-28; OQ-04 (activation at MVP), OQ-05 |
| Actors | ZSchool; principal's office |

#### CNF-21 — Anonymization and the right to erasure

| Attribute | Value |
|---|---|
| Description | When the "attendance and discipline" periods expire, and for accounts with no active relationship, anonymization irreversibly replaces, on the global identity (`Person`, `User`), the identifying elements (first name, last name, date of birth, Massar code, photo, contact details, documents) with a neutral identifier. Every school keeps in its enrollment register an **identity snapshot** (first and last name in dual script, date of birth, Massar code), locked when the enrollment closes, under its own custodial responsibility and for the register's permanent retention period (INV-44, ARB-12): this snapshot is what allows an attestation to be reissued years later (DEC-22); historical retention takes precedence over erasure for official data (RG-34). Health data is deleted (rather than anonymized) one year after the end of schooling. A deletion request concerning the account and non-official data (preferences, messages) is handled via the rights request desk (CNF-05) and results in the account being anonymized. Every anonymization or deletion operation is logged (scope, date, trigger) without ever revealing the anonymized identity. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-34, DEC-22, G-28, INV-28; OQ-04 (activation at MVP) |
| Actors | ZSchool; principal's office; data subjects |

```gherkin
Feature: Executing a retention deadline
  Scenario: Anonymizing a former student's attendance records
    Given a student whose last enrollment closed more than 2 years ago
    When the monthly retention process runs
    Then that student's attendance and discipline records are anonymized (identifiers replaced)
    And the school's enrollment registers remain viewable, with the identity snapshot locked at closure (INV-44)
    And the execution report states the volume anonymized

  Scenario: Reissuing an attestation after the account is anonymized
    Given a former student whose global account was anonymized after three years of inactivity
    When the school reissues an attestation of enrollment on request at the front desk
    Then the attestation is produced from the enrollment register's identity snapshot
    And the operation is logged without re-identifying the global account

  Scenario: Deleting health data
    Given a former student whose health module held data
    When more than a year has passed since the end of schooling
    Then the health data is permanently deleted
    And the operation is logged with no content disclosed
```

#### CNF-22 — A school's termination (DEC-23)

| Attribute | Value |
|---|---|
| Description | Upon termination (or closure/loss of authorization, G-33), the platform runs in sequence: generating and, with tracked delivery, providing a **full export** of the school's data and documents (archivable, bilingual formats); switching the tenant to **read-only for 90 days**, with a countdown visible to the principal's office; **deleting operational data 12 months** after termination, accompanied by a deletion report. Individuals' global identities and their read access to published documents are maintained (RG-28); the residual financial relationship remains viewable until settled (RG-12). The person retains the ability to exercise their rights over published documents (CNF-05). |
| Priority | Must |
| Version | V1 |
| Traceability | DEC-23, Q-05, G-33, INV-38, RG-28; R-19 (`prd/cross-cutting/39-risks-mitigations.md`) |
| Actors | ZSchool; principal's office; data subjects |

```gherkin
Feature: A school's termination lifecycle
  Scenario: Amicable termination
    Given a subscribed school whose contract is terminated on date J
    When the termination is recorded
    Then the full export is generated and its delivery is tracked before J plus 10 days
    And the tenant switches to read-only for 90 days
    And global identities and published documents remain accessible to data subjects

  Scenario: Delayed deletion
    Given a termination effective on date J
    When the J plus 12 months deadline arrives
    Then the tenant's operational data is deleted
    And a deletion report is produced and kept in the audit log
```

### 5.6 E-invoicing and monitoring

#### CNF-23 — A prepared UBL e-invoicing export

| Attribute | Value |
|---|---|
| Description | Without waiting for the implementing decree (not published as of 09/09/2026, H-17), billing keeps all the data needed for a structured **UBL** export: issuer (ICE, IF, address), customer, continuous chronological numbering, line items by service type, totals, payment method. The obligation's timeline remains uncertain (press reports of a 2026-2028 rollout; B2B first, B2C not planned — since most parents are individuals, schools would not be immediately affected). Once the decree is published, the UBL export is activated by a parameter and completed (a qualified signature, DGI clearance) per the final requirements; the qualified stamp then required draws on DEC-30's V2 channel. |
| Priority | Should |
| Version | V2+ |
| Traceability | PROJECT.md §2.7, §7.7, H-17; `prd/research/02-regulatory-data.md` §7; baseline correction #15; R-09 (`prd/cross-cutting/39-risks-mitigations.md`); OQ-06 |
| Actors | Principal's office; accounting; ZSchool |

#### CNF-24 — Regulatory monitoring and compliance triggers

| Attribute | Value |
|---|---|
| Description | ZSchool organizes formalized regulatory monitoring, with a documented quarterly review and alert triggers on: the 35 expected implementing decrees for Law 59.21 (including the annual written contract's template — OQ-01); the Law 09.08 revision bill (not before Parliament as of 09/09/2026, H-05: any change on a DPO, breach notification, digital-consent age); the Family Code reform (CNF-19); CNDP resolutions and lists (any update to Deliberation 236-2015, H-15); the e-invoicing decree (CNF-23, H-17); any possible reinstatement of the repealed Law 06.00's quotas (80% permanent staff, an 8-hour cap). Every change is documented in an impact sheet (affected CNF requirements and modules, a reconfiguration plan, a deadline) archived in the tracker (`prd/cross-cutting/40-assumptions-open-questions-tracker.md`) and feeds risks R-07, R-08, R-09, and R-15 (`prd/cross-cutting/39-risks-mitigations.md`). |
| Priority | Must |
| Version | V1 |
| Traceability | PROJECT.md §2.7, H-05, H-14, H-15, H-17; baseline corrections #2, #5, #15; R-07, R-08, R-09, R-15 |
| Actors | ZSchool (operator) |

### 5.7 Additions from the September 9, 2026 review

#### CNF-25 — A CNDP-formalities timeline before pilots are activated

| Attribute | Value |
|---|---|
| Description | Since pilots process real minors' data from 02/01/2027 onward (JAL-04), the following formalities are filed **before 12/15/2026**, under the responsibility of a named ZSchool point of contact (CNF-26): (a) **F211** (or F214) for each pilot school, for the school-record, family-communication, and finance processing, on pre-filled templates provided by ZSchool; (b) ZSchool's own **F211** for the global identity and accounts, logs, and support (DEC-16); (c) **F112** for collecting adults' national ID numbers, with the field staying disabled until it is obtained (a 2-to-4-month delay, ARB-25a); (d) **F118** for messaging vendors outside the adequacy list (WhatsApp/Meta, email depending on the vendor's location), in each pilot's name, with express consent serving as the basis at MVP in the interim (CNF-03). A tracking table (formality, controller, filing date, receipt, any reclassification, deadline) is kept by ZSchool and shared with each pilot; activating a pilot tenant is conditioned on filing (with a receipt within 24 hours) its (a) formalities and on signing the pilot agreement (CNF-08). This timeline is a dated roadmap dependency (`prd/cross-cutting/37-roadmap-mvp-v1-v2.md`). |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §9, §2.7, DEC-16, H-15; ARB-25a, ARB-25b, ARB-25c; SEC-17, SEC-18; CNF-01, CNF-02, CNF-03, CNF-08; `prd/research/02-regulatory-data.md` §2 |
| Actors | ZSchool (data-protection point of contact); each pilot's principal's office; CNDP (recipient) |

```gherkin
Feature: Activating a pilot tenant conditioned on formalities (MVP)
  Scenario: A pilot with no F211 receipt
    Given a pilot school whose F211 declaration has not yet been filed
    When ZSchool attempts to activate its tenant for production
    Then activation is refused, stating the missing formalities and the pilot agreement to sign
  Scenario: A compliant pilot
    Given a pilot whose F211 receipt and signed pilot agreement are on record
    When ZSchool activates the tenant
    Then activation proceeds and the tracking table carries the formalities' references
    And the national-ID field stays disabled until F112 is obtained
```

#### CNF-26 — A "data protection" point of contact at ZSchool

| Attribute | Value |
|---|---|
| Description | ZSchool names a "data protection" point of contact (an internal role, since a DPO is not mandatory under positive law, H-05), the recipient for individuals' requests regarding processing where ZSchool is the controller (CNF-05), the contact for schools on their formalities (CNF-25), for sub-processors (CNF-09), for the CNDP, and for breach notifications (SEC-22). Their contact details appear in the privacy notice (CNF-04), the pilot agreement and the contract (CNF-08), the processing register (CNF-07), and the principal's office's "Compliance" workspace. A backup is named. |
| Priority | Must |
| Version | MVP |
| Traceability | PROJECT.md §9, DEC-16, H-05; ARB-25t; CNF-04, CNF-05, CNF-07, CNF-08, CNF-09, CNF-25; SEC-22 |
| Actors | ZSchool; principals' offices; data subjects; CNDP |

#### CNF-27 — Legal basis for the teacher's global professional profile and transport geolocation

| Attribute | Value |
|---|---|
| Description | (a) The global `TeacherProfile` (degrees, subjects, experience, availability in V2+) falls under ZSchool's role as controller (DEC-16), on the basis of performing the service the teacher requested (created and shared at their own initiative, RG-20): it is declared under ZSchool's own F211 (CNF-25); data exported to ESISE is that declared to the employer on `SchoolMembership` (ARB-23b), never the global profile. (b) Transport-vehicle geolocation (FR-SAN-05, V2+), which indirectly locates minors, is a school-side processing activity subject to a specific declaration, dedicated notices, and legal guardians' consent, with retention limited to route needs (a proposed default: 30 days); any interconnection of this data with other files triggers the tier-change alert (CNF-02). |
| Priority | Should |
| Version | V1 (teacher profile, with ZSchool's F211); V2+ (geolocation) |
| Traceability | DEC-16, RG-20, RG-35; ARB-23b; `prd/modules/19-teacher-career-network.md` (OQ-05); `prd/modules/22-ancillary-services-transport-canteen-activities.md` (OQ-02); CNF-02, CNF-25 |
| Actors | ZSchool; teachers; principals' offices; legal guardians |

---

## 6. Retention table (DEC-22)

Default periods, appearing in both parties' CNDP declarations (policy D7) and adjustable per school within legal limits (CNF-20). "End of schooling" = the closing date of the student's last enrollment at the school. Anonymization is irreversible and keeps the registers (RG-34); deletion destroys the content.

| Data category | Example entities (PROJECT.md §6.10, `prd/03-domain-data-model.md`) | Default period | Operation at expiry | Basis |
|---|---|---|---|---|
| Enrollment registers and year-end decisions | Enrollment, YearDecision, StudentClassHistory | Permanent (by the school) | None; read-only after closure (RG-32) | DEC-22 (archives and reissuing attestations) |
| Report cards, transcripts, and attestations | ReportCard, Transcript, Certificate | Permanent (by the school) | None; read access maintained for data subjects (RG-28) | DEC-22 |
| Financial documents | Invoice, Installment, Payment, Receipt, Refund, Dunning, CashSession, FinancialAccount | 10 years from the fiscal year, and never before the account is settled (INV-08) | Deletion | CGI art. 211; DEC-22; ARB-25u |
| Attendance | AttendanceRecord, Justification, Dispensation | End of schooling + 2 years | Anonymization | DEC-22 |
| Discipline and student life | Incident, Sanction, DisciplinaryCouncil, ConductGrade | End of schooling + 2 years | Anonymization | DEC-22 |
| Health | HealthRecord (future module) | End of schooling + 1 year | Deletion | DEC-22 |
| Messages and notifications | Message, Announcement, Notification, DeliveryLog, Thread | 2 years | Deletion | DEC-22; RG-34 |
| Audit logs | AuditLog | 5 years | Deletion | DEC-22 |
| Accounts with no active relationship | User, profiles with no enrollment or active affiliation | 3 years of inactivity | Anonymizing the global identity; each school's register keeps its identity snapshot (INV-44) | DEC-22; ARB-12 |
| Electronic parental authorizations (outings, events) | Event (consents), the associated Message | 5 years after the event (a working hypothesis: civil-liability evidence; distinct from the "messages" period) | Deletion | OQ-11 (to be confirmed by the founder) |
| Consents | ConsentGrant | The duration of the consented scope (bounded — INV-24); the operation's trace remains under the audit log | The trace is anonymized when the log expires | DEC-22 (configurable), INV-24 |
| Supporting documents in the record (birth certificate, photos, court rulings) | StudentDocument, relationship documents | Not set by the baseline: a proposed default = end of schooling + 2 years (aligned with attendance), with court rulings kept alongside the registers they support | Anonymized or deleted depending on the document | OQ-05 (to be settled in review) |

Application rules: deadlines are computed per student and per school; an account may carry several "ends of schooling" (multi-school), with each category's deadline specific to each school; a SUSPENDED enrollment's data remains subject to the current enrollment's periods; backup copies are purged as they rotate (30 days at MVP, PROJECT.md §10; the monthly copies kept in V1 are purged of anonymized identities on first use, and any restore replays the anonymizations that occurred since, NFR-SAV-02, ARB-25s); execution is paused for a school in post-termination read-only mode until the DEC-23 deletion (CNF-22).

---

## 7. Screens and entry points (text description)

Screens described in text, bilingual FR/AR, mobile-first, with no mockup (conventions §1.3). ECR identifiers fall to the module chapters (conventions §2); these entry points are split between administration (`prd/modules/10-administration-onboarding-subscription.md`) and the relevant modules.

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

- **Archiving and documents**: bilingual PDFs, correct Arabic fonts, A4/A5 formats, batch printing (the NFR-DOC and NFR-I18N domains, `prd/cross-cutting/32-non-functional-requirements.md`); the evidentiary value of contracts and stamps per DEC-30.
- **Logging** (founder arbitration D4): at MVP, minimal logging of compliance writes — corrections are logged at the record level (author, timestamp, RG-38); the immutable, exportable log (INV-33) ships in V1 per baseline §12, with author, context, and timestamp for sensitive-data views and compliance operations. The MVP degradation is logged in OQ-10.
- **Strengthened protection**: strengthened encryption of identity documents, health data, and court rulings filed under CNF-02 and CNF-18 (`prd/cross-cutting/31-security-privacy.md`).
- **Hosting**: production and backups in Morocco, with no outbound flow other than messaging governed by F118 (DEC-26; `prd/cross-cutting/31-security-privacy.md`).
- **Volume and availability**: bulk retention and anonymization processing runs outside peak periods (maintenance windows, NFR-DISP) and is sized for the technical target (NFR-RES).
- **Portability**: open, archivable exports (PDF, CSV, Excel) for the full termination export (DEC-23).

---

## 9. Success metrics

To be consolidated in `prd/cross-cutting/38-kpi-success-metrics.md` (the KPI namespace carried by that file). Proposed themes: share of active schools with a valid, archived CNDP declaration; average response time for rights requests; share of the year's enrollments with an annual contract signed before the start of the year; share of retention deadlines executed on time (monthly reports); adherence to termination deadlines (export, read-only, deletion); number of schools with an up-to-date published fee list.

---

## 10. Open questions

| ID | Question | Context and up-to-date data | Consequence if unresolved |
|---|---|---|---|
| OQ-01 | The regulatory template for the annual written school–parent contract (Law 59.21) | A template to be set by regulation, no order published as of 09/09/2026; 35 decrees expected (`prd/research/02-regulatory-data.md` §1). Question consolidated in OQ-03 of `prd/cross-cutting/40-assumptions-open-questions-tracker.md` | A contract not matching a future mandatory template: reworking and re-signing mid-year. Working approach: a configurable contract covering known obligations now, aligned once published (CNF-11) |
| OQ-02 | The exact content of the privacy notice (art. 5, Law 09.08) and validating the template | No rule specific to minors under positive law (H-05); the ZSchool template needs legal review (a legal advisor, possibly the CNDP) before rollout | Incomplete notices enforceable in a dispute or inspection |
| OQ-03 | Response deadline for rights requests | **Resolved — ARB-25f**: 30 calendar days by default, configurable; a manual procedure from MVP onward (CNF-05, SEC-14) | The deadline is to be revised through monitoring (CNF-24) if case law or a law revision sets one |
| OQ-04 | Activating compliance building blocks at MVP while PROJECT.md §12 sets "formalized CNDP compliance" in V1 | **Resolved — ARB-25 and ARB-01**: a requirement-by-requirement justification (PROJECT.md §7.2, INV-24, INV-40, INV-39, INV-10, INV-11, INV-28) and moving to MVP the building blocks essential for pilots (CNF-03, manual CNF-05, pilot-agreement CNF-08, an initial CNF-09 list, CNF-11, CNF-13 in wave 2, CNF-25, CNF-26) | A working hypothesis to be confirmed by the founder (ESC-02) |
| OQ-05 | Retention periods for categories absent from the baseline: file supporting documents, identity documents, consent traces | DEC-22 does not cover these categories; a default proposed in §6 (aligned with "attendance") | A non-compliant period under the proportionality principle if left undefined; to be settled in review and then logged in policy D7 |
| OQ-06 | The e-invoicing timeline | Decree not published (H-17); press reports of a 2026-2028 rollout, B2B first, B2C not planned (baseline correction #15) | The UBL export to adjust per the final decree (formats, signature, clearance); CNF-23's configuration limits the impact |
| OQ-07 | The Law 09.08 revision | No text filed with Parliament as of 09/09/2026 (H-05); a revision potentially aligned with the GDPR (a DPO, breaches, digital consent) | A compliance review to be triggered by monitoring (CNF-24); the rights architecture (CNF-05) designed to be extensible |
| OQ-08 | Activating the "guardianship regime" parameter once a Family Code reform takes effect | The 12/23/2024 report not voted (baseline correction #5); RG-14b unchanged as-is | Relationships and supporting documents to be re-qualified and re-requested: a campaign to prepare (CNF-19) to avoid defaults that have become incorrect |
| OQ-09 | The compliance sequence for the health module (F112) | The health module is V2+ (PROJECT.md §12); the F112 authorization takes 2 to 4 months (`prd/research/02-regulatory-data.md` §2); CNF-02 proposal: attestation mandatory before entry opens | If the formality starts too late, module activation is delayed; plan F112 filings a year ahead of the V2 health rollout |
| OQ-10 | An acceptable MVP degradation of logging (founder arbitration D4, 09/09/2026) | **Resolved — D4, ARB-25j**: at MVP, immutable record-level write logging (RG-38); the immutable, exportable sensitive-view log (INV-33) in V1; aligned with SEC-11, PER-10, NFR-OBS-02 | None |
| OQ-11 | Retention period for electronic parental authorizations (outings, events) | Not covered by DEC-22; a working hypothesis in §6: 5 years after the event (civil-liability evidence), distinct from the 2-year "messages" period | The period to be confirmed by the founder and then logged in policy D7 |

---

## Traceability

| Baseline ID | Requirements in this file |
|---|---|
| RG-02 | CNF-04, CNF-05 |
| RG-13 | CNF-17 |
| RG-14 | CNF-18 |
| RG-14b | CNF-17, CNF-19 |
| RG-16 | CNF-17, CNF-18 |
| RG-22 | CNF-16 |
| RG-28 | CNF-22 |
| RG-30, RG-31 | CNF-03, CNF-06 |
| RG-34 | CNF-20, CNF-21 |
| DEC-16 | CNF-01, CNF-07, CNF-08, CNF-09 |
| DEC-20 | CNF-04, CNF-05 |
| DEC-22 | CNF-20, CNF-21; §6 table; OQ-05 |
| DEC-23 | CNF-22 |
| DEC-24 | CNF-14, CNF-15 |
| DEC-26 | CNF-03, CNF-09 |
| DEC-30 | CNF-11, CNF-23 |
| PROJECT.md §2.7 | Sections 2 and 5.3 to 5.6; CNF-10 to CNF-16, CNF-23, CNF-24 |
| PROJECT.md §7.2 | CNF-04 |
| PROJECT.md §7.7 | CNF-11, CNF-12, CNF-14 |
| PROJECT.md §9 | CNF-01 to CNF-09, CNF-20 to CNF-22 |
| PROJECT.md §12 | "Version" column of every requirement; OQ-04 |
| Q-04 | CNF-20 |
| Q-05 | CNF-22 |
| Q-06 | CNF-13, CNF-14 |
| G-28 | CNF-21 |
| G-31 | CNF-11 |
| G-33 | CNF-22 |
| H-05 | CNF-24; OQ-02, OQ-07 |
| H-11 | CNF-03, CNF-06 |
| H-14 | CNF-10 to CNF-13, CNF-16; OQ-01 |
| H-15 | CNF-01, CNF-02, CNF-03, CNF-07, CNF-24 |
| H-17 | CNF-23; OQ-06 |
| INV-09, INV-10, INV-11 | CNF-17, CNF-18 |
| INV-24 | CNF-04, CNF-06 |
| INV-28 | CNF-20, CNF-21 |
| INV-33 | Section 8 |
| INV-38 | CNF-22 |
| INV-39, INV-40 | CNF-14, CNF-12 |
| BES-GAR-04, BES-GAR-06 | CNF-14, CNF-15, CNF-17, CNF-18 (`prd/02-actors-personas.md`) |
| BES-ELE-05, BES-ELE-07 | CNF-04, CNF-05 |
| Research | `prd/research/02-regulatory-data.md` §1 (CNF-10 to CNF-16), §2 (CNF-01 to CNF-09), §5 (CNF-17 to CNF-19), §6 (CNF-14, CNF-15), §7 (CNF-23); `prd/research/00-baseline-corrections.md` #2, #5, #15, #16, #19 |
| Risks | R-07, R-08, R-09, R-15, R-17, R-19 (`prd/cross-cutting/39-risks-mitigations.md`) |
| `prd/cross-cutting/31-security-privacy.md` (SEC-17, SEC-18, SEC-22, §4) | CNF-01, CNF-02, CNF-03, CNF-08; §4 (formalities register) |
| ARB-01 (parent contract and anti-refusal check at MVP) | D2; CNF-11, CNF-13 |
| ARB-07 (foreign numbers, an international gateway) | CNF-03, CNF-09 |
| ARB-12, INV-44 (identity snapshot in the register) | CNF-21; §6 |
| ARB-20d, ARB-20e, ARB-20h (re-enrollment not conditionable; account statement to the financial guardian; countersignature) | CNF-11, CNF-14 |
| ARB-23b (degrees exported from `SchoolMembership`) | CNF-27 |
| ARB-25a, ARB-25b (CIN disabled; CNDP timeline) | CNF-02, CNF-25 |
| ARB-25c, ARB-25d (WhatsApp transfer basis; push FCM/APNs) | CNF-03, CNF-09 |
| ARB-25e (pilot agreement, 72-hour notification) | D1; CNF-08 |
| ARB-25f (individuals' rights at MVP) | CNF-05; OQ-03 |
| ARB-25j (D4 logging) | §8; OQ-10 |
| ARB-25s, ARB-25u (backups; finance after settlement) | §6 |
| ARB-25t (data-protection point of contact) | CNF-26 |
| ESC-02 (confirming the MVP extension) | OQ-04 |
