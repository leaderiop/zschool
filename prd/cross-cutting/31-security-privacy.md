# ZSchool — Cross-Cutting Chapter 31: Security and Privacy

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review (arbitrations `prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` v1.1 — §2.7, §8.1, §9, §10, §12; rules RG-34, RG-38; gaps G-09, G-20, G-32, G-33; decisions DEC-11, DEC-16, DEC-22, DEC-23, DEC-26; hypotheses H-05, H-06, H-15, H-18; question Q-08 |
| Related files | `prd/00-conventions.md`; `prd/02-actors-personas.md`; `prd/03-domain-data-model.md`; `prd/journeys/00-journey-map.md`; `prd/cross-cutting/30-roles-permissions-matrix.md` (permissions `PER-…`); `prd/cross-cutting/32-non-functional-requirements.md` (including continuity and backups); `prd/cross-cutting/35-external-integrations.md` (integrations `INT-SMS`, `INT-WAP`, `INT-EML`, `INT-HEB`); `prd/cross-cutting/36-legal-compliance-data-protection.md` (legal compliance `CNF-…`); `prd/research/00-baseline-corrections.md`; `prd/research/02-regulatory-data.md`; `prd/research/05-infrastructure-usage.md`; `prd/cross-cutting/42-review-arbitrations.md` (ARB-07, ARB-08, ARB-12, ARB-25) |

---

## 1. Objective and scope

This chapter translates the baseline's security, privacy, and compliance commitments (`PROJECT.md` §9, gap G-09 closed) into verifiable requirements. It carries the `SEC-NN` identifiers (conventions §2) and applies to all functional modules (files `prd/modules/10` to `prd/modules/23`) and journeys (`prd/journeys/00-journey-map.md`).

In scope:

- authentication and access management (login identifier distinct from the contact identifier, phone with a one-time code, email and password, MFA, sessions, devices, reset, number change and reassignment, anti-enumeration);
- server-side multi-tenant isolation and access control for global entities;
- encryption in transit, at rest, and strengthened for sensitive data;
- the immutable, exportable audit log (RG-38) and audited ZSchool support access (G-32);
- individuals' rights (Law 09.08) and logged consents;
- CNDP formalities per processing activity (F211/F214 declarations, F112 authorizations, F118 requests);
- hosting in Morocco, encrypted backups, restore testing, the disaster recovery plan, and incident management;
- application security (reviews, penetration tests, vulnerability management, rate limiting);
- retention, deletion, and anonymization (RG-34, DEC-22) and the full export upon termination (DEC-23).

Out of scope for this file: the fine-grained role permission matrix (covered by `prd/cross-cutting/30-roles-permissions-matrix.md`), non-functional performance and availability thresholds (`prd/cross-cutting/32-non-functional-requirements.md`), detailed legal analysis and standard contracts (`prd/cross-cutting/36-legal-compliance-data-protection.md`), and the design of vendor integrations (`prd/cross-cutting/35-external-integrations.md`). This chapter does not describe any screens; compliance screens are covered by the relevant module chapters (administration `prd/modules/10-administration-onboarding-subscription.md`).

## 2. Responsibility framework and reference points

### 2.1 ZSchool's dual role (DEC-16)

ZSchool is a **processor** for each school's operational data (the school is the data controller) and a **controller** for the global identity and, eventually, the student passport. This dual role is formalized before commercial launch (contracts, declarations, notices, consents). Direct consequence: CNDP declarations filed by ZSchool never exempt a school from its own formalities; the compliance assistant (SEC-17) therefore works **per school** and separately on ZSchool's own behalf.

### 2.2 Law 09.08 and the CNDP: status as of September 9, 2026

Law 09.08 remains in force, with no revision before Parliament (H-05, `prd/research/02-regulatory-data.md` §2). Confirmed facts, per `prd/research/00-baseline-corrections.md` (divergence #19):

- prior declaration F211, or the simplified F214 form when the processing matches a CNDP resolution; receipt within 24 hours; possible reclassification as an authorization within 8 days; free of charge; filed online (CNDP-FORMS);
- prior authorization (form F112, 2-to-4-month delay per baseline §2.7) for health data, processing that includes the national ID number, file interconnection, and biometrics;
- transfer abroad: form F118 outside the adequacy list (2-month delay, extendable), free for states on the current list (Deliberation No. 236-2015: European Union and EEA excluding Croatia, the United Kingdom, Switzerland, Canada); France and Spain are subject to a simple declaration (H-15);
- ongoing obligations: privacy notices, security, rights of access, rectification, and objection.

### 2.3 Hosting and cybersecurity

Law 05.20 and DGSSI-qualified cloud requirements are out of scope for private schools and the SaaS vendor, except under contract with a public entity (H-06, divergence #12); the real legal constraint remains Law 09.08, and hosting in Morocco removes any transfer formality for student data (DEC-26). The Oracle Cloud **af-casablanca-1** region (N+ONE data centers, Nouaceur-Casablanca, available since April 2026) has **only one availability domain**; an in-country disaster recovery plan is therefore mandatory (divergence #13; `prd/research/05-infrastructure-usage.md` §1). Documented failover candidates are: the planned second Oracle region at Settat (no published timeline), Atlas Cloud Services in Benguerir (Tier III and Tier IV, ISO 27001), and the OVHcloud local zone in Rabat (H-18).

### 2.4 Relationship to the data model

The requirements below implement the invariants carried by `prd/03-domain-data-model.md`: INV-17 (tenant key and server-side control), INV-18 (global entities accessible via an active relationship or consent), INV-24 (consents logged, bounded, revocable), INV-28 (retention takes precedence, erasure by anonymization), INV-33 (immutable, exportable log), INV-37 (phone as the primary contact identifier), INV-38 (termination), INV-44 (identity snapshot kept by the school's register upon anonymization, ARB-12), INV-45 (login identifier distinct from the contact identifier, ARB-07). The audit log relies on the `AuditLog` entity; consents on `ConsentGrant`; support access on `SupportTicket`; exports on `DataExport`; merges on `MergeOperation`.

## 3. Security requirements

### 3.1 Authentication and account management

#### SEC-01 — Authenticate by phone (one-time code) and, optionally, by email and password

| Attribute | Value |
|---|---|
| Description | Every account carries a **login identifier**, distinct from the contact identifiers (INV-45, ARB-07): by default the mobile phone number (primary contact identifier, DEC-11, INV-37), unique per account, in international E.164 format (Moroccan +212 by default, foreign numbers accepted). Login uses a one-time code sent by SMS via a Moroccan aggregator (DEC-26) or, for a foreign number, via an international gateway; the code is single-use, short-lived (on the order of a minute), and rate-limited on attempts. A **minor student without their own mobile phone** receives a platform-generated login identifier (readable, not derived from the Massar code), activated by a legal guardian with an OTP sent to that guardian's number, migratable at any time to a personal number (FR-ADM-20). A **second guardian sharing the household's mobile phone** likewise receives a generated identifier, with the OTP routed to the number declared as a shared contact; no account is ever shared (INV-13). Email, if provided, offers a second channel: address and password (policy SEC-28). Email is never required for a parent, student, or teacher. The platform never discloses whether an identifier is registered or not: error messages are uniform. Invitation and identity-claim codes (journey PC-04) travel through the same channels and rules, with the knowledge challenge of SEC-27. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-11, DEC-26, RG-01, RG-12b, INV-13, INV-37, INV-45; ARB-07; SEC-27, SEC-28; FR-ADM-20; `prd/journeys/00-journey-map.md` PC-04 |
| Actors | All actors with an account (parent, student, teacher, staff, principal's office, ZSchool roles) |

#### SEC-02 — Require a second factor (MFA) for privileged roles

| Attribute | Value |
|---|---|
| Description | Multi-factor authentication is mandatory from MVP onward for the school's privileged roles (principal's office, academic direction, registrar's office, accounting, local system administrator) and for ZSchool roles (§8.1); it is optional, activatable by the school, for teachers, supervisors, and ancillary-module roles (ARB-25l), so as not to impose a paid SMS OTP on every session on an entry-level mobile phone. The second factor is a one-time code sent to the primary phone or generated by an authenticator app; it is required when logging in from an unrecognized device (90-day trusted devices, SEC-04) and when confirming the most sensitive operations (profile merge, role change, CNDP configuration, resetting a principal-track account). Losing the second factor follows the reset procedure (SEC-05, SEC-27). MFA is not imposed on parents and students. Authentication SMS is borne by ZSchool (PAK-17). |
| Priority | Must |
| Version | MVP (privileged roles and ZSchool roles); optional for teachers, supervisors, and ancillary roles (ARB-25l) |
| Traceability | `PROJECT.md` §9 (MFA for school roles), §8.1; ARB-25l; PER-17; OQ-01 (resolved) |
| Actors | School roles, ZSchool roles |

#### SEC-03 — Control sessions (expiry, invalidation, logout)

| Attribute | Value |
|---|---|
| Description | Every session carries a maximum duration and an inactivity expiry suited to the role (shorter for privileged roles). The user can log out from any device and can log out of all sessions at once. Any loss of entitlement removes access immediately: closing an affiliation invalidates the active sessions of the relevant context (RG-19, INV-16); suspending an account or resetting access invalidates all sessions. Invalidations are logged. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §9, RG-19, INV-16, INV-31 |
| Actors | All actors with an account; the affected affiliation and the principal's office for rights revocation |

#### SEC-04 — Manage trusted devices

| Attribute | Value |
|---|---|
| Description | The user views the list of their account's devices and active sessions (type, last-used date) and can revoke a device individually. A login from a new device is notified through the account's contact channels. For privileged roles, a newly recognized device requires the second factor (SEC-02); a trusted device stays recognized for 90 days without a new OTP, except upon a number change or a reset (ARB-25l). |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §9 (session and device management); ARB-25l |
| Actors | All actors with an account |

#### SEC-05 — Secure access reset

| Attribute | Value |
|---|---|
| Description | Resetting a password or second factor uses a one-time code sent to the primary phone (DEC-11) or, if provided and explicitly chosen, to email. The flow never reveals whether an account exists; after a reset, all active sessions are invalidated (SEC-03) and the event is logged. School-role accounts require the second factor or the principal's approval to recover a locked account; a principal-track account cannot be reset by the local system administrator (PER-19); ZSchool never resets a school's access outside a logged procedure (SEC-13). Number change, number loss, and operator reassignment follow SEC-27. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §9 (secure reset), DEC-11, RG-38; SEC-27; PER-19 |
| Actors | All actors with an account; the principal's office for its own school's accounts |

#### SEC-06 — Protect against identity enumeration, notably of the Massar code

| Attribute | Value |
|---|---|
| Description | Every search, matching (RG-05), or claim function exposing a sensitive identifier — Massar code (INV-01), phone number — is protected against enumeration: uniform responses (same message and comparable delay whether the identifier exists or not), no public counting, strict rate limiting per source, alerting and progressive throttling on abnormal volume (SEC-24). Massar codes and phone numbers never appear in plain text in a URL, a public link, a shared printed document, or a notification channel where third parties could access them. No directory of students, parents, or teachers is exposed; the public directory is limited to the school fields provided for by RG-23. The same protection applies to the public QR-verification page for documents (INT-SIG-01, V1): the verification identifier is random, non-sequential, and not derived from the document number, and the page is rate-limited. |
| Priority | Must |
| Version | MVP (identities); V1 (QR verification page) |
| Traceability | `PROJECT.md` §9 (protection against enumeration, notably Massar code), RG-04, RG-05, RG-23, INV-01, INV-02; INT-SIG-01 |
| Actors | Platform; all actors with an account |

```gherkin
Feature: Protection against identity enumeration
  Scenario: Probing Massar codes from the identity-claim interface
    Given an unauthenticated user probing the identity-claim interface
    When they submit fifty successive Massar codes in under a minute
    Then every response is identical in content and timing, whether the code exists or not
    And subsequent requests are denied by rate limiting
    And a security alert is recorded in the audit log
    And no message confirms the existence of a code
```

### 3.2 Multi-tenant isolation and access to global entities

#### SEC-07 — Guarantee server-side multi-tenant isolation

| Attribute | Value |
|---|---|
| Description | Every operational record carries its tenant key (the school, DEC-02, INV-17) and every access is systematically controlled server-side, never client-side: no request, including one manipulating identifiers in a URL or an interface call, can read or write a record outside the user's current tenant. The organization (school group) opens only consolidated views and shared administration, without merging tenants (RG-21). Automated scope-crossing tests cover every module at every release; any detected leak is treated as a security incident (SEC-22). |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §9, RG-21, DEC-02, INV-17; `prd/03-domain-data-model.md` §6 |
| Actors | Platform; all school and organization roles |

```gherkin
Feature: Multi-tenant isolation
  Scenario: Direct access to a record from another school
    Given a registrar authenticated at School A
    When they request the direct address of a student record at School B
    Then the server denies access without confirming the record's existence
    And the attempt is logged with its author and context
  Scenario: Consolidated view of a school group
    Given a group administrator attached to Schools A and B
    When they view their organization's consolidated dashboard
    Then they see only the intended consolidated views and never a school's data outside their organization
```

#### SEC-08 — Condition access to global entities on an active relationship or a consent

| Attribute | Value |
|---|---|
| Description | Global entities (identities, accounts, profiles, parent–student relationships, consents) are accessible to a school only through an active relationship: active enrollment, active affiliation, or active parental link — or an active consent (INV-18). No school has a platform-wide search over identities; identity corrections follow RG-07 and INV-04, and merges remain audited operations (RG-06, INV-03). Views of global entities outside a school's own tenant are logged. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §9, RG-06, RG-07, INV-03, INV-04, INV-18 |
| Actors | Platform; school roles; parent and adult student as owners of their own data |

### 3.3 Encryption

#### SEC-09 — Encrypt in transit and at rest

| Attribute | Value |
|---|---|
| Description | All application and interface traffic (web, mobile, integrations) is encrypted in transit, including between the platform's internal components. Data is encrypted at rest in databases, file storage, and backups. Keys are managed separately from the data they protect, with periodic rotation and usage traceability; the availability of a key-management service in the af-casablanca-1 region is to be verified at launch (H-18, OQ-03). No secret (password, key, code) is stored or logged in plain text. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §9 (encryption in transit and at rest), §10, H-18 |
| Actors | Platform |

#### SEC-10 — Strengthen encryption for sensitive data

| Attribute | Value |
|---|---|
| Description | At MVP, adults' national ID (CNIE) numbers are not collected: the field is disabled until the prior F112 authorization is on record (ARB-25a, CNF-25); adult identity relies on first name, last name, date of birth, and mobile phone. Identity documents (the student's birth certificate from MVP onward; national ID after F112), health records (V2+ module), and court decisions attached to relationships (RG-14) receive strengthened encryption: dedicated keys separate from general encryption, access limited to expressly authorized roles (registrar's office and principal's office for documents; infirmary and principal's office for health per the §8.3 matrix), logging of every view (RG-38), and no export through notification channels, uncontrolled exports, or statistical processing. This data is never included in default transfer exports (RG-31: health is never transferred automatically, DEC-08). |
| Priority | Must |
| Version | MVP (birth certificates and court decisions; national ID disabled until F112 — ARB-25a); health records: V2+ upon module launch |
| Traceability | `PROJECT.md` §9 (strengthened encryption), §7.14, RG-14, RG-31, DEC-08, INV-21, INV-23; ARB-25a; CNF-25 |
| Actors | Platform; registrar's office, principal's office, infirmary (V2+) per authorization |

```gherkin
Feature: Strengthened encryption of identity documents
  Scenario: Viewing an identity document in a student's file
    Given an identity document filed in a student's record
    When an authorized registrar's-office staff member opens the document
    Then the view is logged with author, school context, and timestamp
    And the document appears in no notification and in no export outside a controlled procedure
  Scenario: Denial for an unauthorized role
    Given the student's course teacher
    When they attempt to open the identity document in the record
    Then access is denied and the attempt is logged
```

### 3.4 Audit log and support access

#### SEC-11 — Log every write and every sensitive view

| Attribute | Value |
|---|---|
| Description | Every write action (creation, modification, closing, deletion, publication) and every view of sensitive data (identity file, health, finance, discipline) is logged with author, context (tenant, enrollment where applicable), and timestamp (RG-38, INV-33). Logging also covers security events (logins, resets, number changes, access denials, enumeration alerts) and support and merge operations. Version pacing follows arbitration D4 (ARB-25j): at MVP, every write is logged immutably at the record level (author, timestamp, prior value), and security, support-access, and merge events are logged; logging of sensitive-data views and consolidation into an exportable log (SEC-12) ship in V1. |
| Priority | Must |
| Version | MVP (logged writes, security events, support access, merges — D4, ARB-25j); V1 (sensitive views) |
| Traceability | RG-38, INV-33; ARB-25j; OQ-02 (resolved) |
| Actors | Platform; viewing: principal's office, ZSchool compliance |

#### SEC-12 — Maintain an immutable, exportable audit log kept for five years

| Attribute | Value |
|---|---|
| Description | The audit log is immutable: no entry can be modified or deleted in it, including by ZSchool. It can be viewed by the school's principal's office with filters (author, period, student, action type) and exported by the school in an open format (INV-33). Retention is five years (DEC-22) and survives the school's termination (SEC-26). ZSchool compliance has a cross-tenant view for platform operations (support, merge, security). Exporting the audit log is itself logged. |
| Priority | Must |
| Version | V1 (§12: "Audit") |
| Traceability | RG-38, DEC-22, INV-33, G-20 |
| Actors | School principal's office, ZSchool compliance |

#### SEC-13 — Govern and audit ZSchool support access

| Attribute | Value |
|---|---|
| Description | No ZSchool agent accesses a school's data outside a procedure: access is temporary, opened on a ticket (`SupportTicket` entity, MVP), bounded in scope (tenant, modules), purpose (ticket reason), and duration; it is approved internally by ZSchool and, at MVP, by the school principal's explicit approval given in the application (ARB-25k), notified to the principal's office, fully logged (SEC-11), and revoked when the ticket closes. The super-administrator does not view school data without this procedure (§8.1, G-32). The support access history is visible to the principal's office in the audit log (SEC-12). |
| Priority | Must |
| Version | MVP (ticket-based access with the principal's explicit approval, bounded duration, logged — ARB-25k); V1 (full workflow, exportable log) |
| Traceability | `PROJECT.md` §8.1, §9, G-32, RG-38; ARB-25k; PER-12 |
| Actors | ZSchool support and compliance; school principal's office |

```gherkin
Feature: ZSchool support access to a school
  Scenario: Support intervention on a ticket
    Given a support ticket opened by School A's principal's office
    When a ZSchool support agent obtains temporary access to Tenant A
    Then access is bounded to the ticket's scope, purpose, and duration
    And every view and write by the agent is logged with their identity
    And the school's principal's office is notified when access is granted and when it closes
    And access is revoked automatically when the ticket closes
  Scenario: Access attempt outside a procedure
    Given a support agent with no active ticket on School B
    When they attempt to open a student record at School B
    Then access is denied
    And the attempt is logged and visible in the audit log
```

### 3.5 Individuals' rights and consents

#### SEC-14 — Handle access, rectification, and objection requests

| Attribute | Value |
|---|---|
| Description | Any data subject (a parent for their minor child, an adult student, a teacher for their own profile) can exercise their rights of access, rectification, and objection (Law 09.08, art. 7 to 9) from their interface, and obtain portability of published documents to which they retain permanent read access (RG-28). Every request is recorded, timestamped, and tracked (`DataExport` entity for extractions), immediately acknowledged, handled by the school with ZSchool's assistance; identity rectifications follow RG-07 (logging and notification to the schools concerned). The adult student exercises their rights directly (RG-02). The maximum response time is 30 calendar days by default, configurable (ARB-25f). At MVP, rights are enforceable from the first processing activity: the request is received at the school's front desk or by ZSchool support, acknowledged, logged in a register kept by the school (template provided), and handled manually within the deadline; the tooled portal request desk (CNF-05) ships in V1. |
| Priority | Must |
| Version | MVP (manual procedure, 30-day deadline, register — ARB-25f); V1 (tooled request desk, CNF-05) |
| Traceability | `PROJECT.md` §9, RG-02, RG-07, RG-28, H-05, INV-04, INV-20; ARB-25f; CNF-05 |
| Actors | Parent, adult student, teacher; principal's office and registrar's office; ZSchool compliance |

#### SEC-15 — Collect privacy notices and legal guardians' consent

| Attribute | Value |
|---|---|
| Description | At enrollment, the privacy notice (Law 09.08, art. 5) is presented to guardians in French and Arabic (purposes, recipients, retention periods, rights) and their acceptance is timestamped; activating the enrollment requires it (a condition of the PRE-ENROLLED-to-ACTIVE transition). Consent for a minor student is given by their legal guardian (no rule specific to minors under positive law); the adult student gives their own consent and is informed of their rights at the time of coming of age (RG-02). All these acceptances are logged and viewable by the school. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §9, §7.2, RG-02, `prd/03-domain-data-model.md` §3.2 (conditions of the PRE-ENROLLED → ACTIVE transition) |
| Actors | Legal guardians, adult student, registrar's office, principal's office |

#### SEC-16 — Log and bound sharing consents

| Attribute | Value |
|---|---|
| Description | Every sharing consent (transfer to another school, student passport in V2+) is carried by the `ConsentGrant` entity: explicit scope (RG-31's default transfer profile serves as the baseline, any addition is a choice by the legal guardian or the adult student), duration, timestamp, and status. It is revocable at any time and revocation covers future access (INV-24); the grant and the revocation are logged and notified to the recipient. No automatic access exists between schools outside this consent and the official documents of a transfer procedure (RG-30). |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §9, RG-30, RG-31, DEC-07, DEC-08, INV-22, INV-23, INV-24; `prd/journeys/00-journey-map.md` PC-09 |
| Actors | Legal guardian, adult student; sending and receiving schools |

### 3.6 CNDP formalities and outbound flows

#### SEC-17 — Provide a per-school CNDP formalities assistant

| Attribute | Value |
|---|---|
| Description | Every school has a compliance assistant: an initial questionnaire (categories collected: health, national ID number, biometrics, interconnection), a recommendation between the F211 declaration and the simplified F214 form, pre-filled generation of the forms, a link to file online via CNDP-FORMS, and tracking of receipts (24 hours) and any reclassifications (8 days). The assistant triggers a **tier-change alert** when the school activates collection of the national ID number, health data, or any biometrics: the processing then falls under the prior F112 authorization, the required action is entered in the school's formalities register with a deadline, and the school is assisted with the request (2-to-4-month delay per baseline §2.7). Form templates are provided and kept up to date by ZSchool; the assistant explicitly distinguishes the school's own formalities (as controller) from ZSchool's own (DEC-16, §2.1). At MVP, before the assistant is tooled, ZSchool supplies pre-filled templates outside the tool and drives the filing timeline for F211 (pilots and ZSchool), F112 (national ID), and F118 (messaging) before December 15, 2026, carried by CNF-25 (ARB-25b). |
| Priority | Must |
| Version | V1 (tooled assistant); MVP: pre-filled templates outside the tool and CNF-25 timeline |
| Traceability | `PROJECT.md` §9, §2.7, DEC-16, H-15; `prd/research/00-baseline-corrections.md` divergence #19; `prd/research/02-regulatory-data.md` §2 |
| Actors | School principal's office; ZSchool compliance |

```gherkin
Feature: Tier-change alert toward the prior CNDP authorization
  Scenario: Activating collection of the national ID number
    Given a school whose recorded formality is an F211 declaration with no sensitive data or national ID
    When the principal's office activates collection of staff national ID numbers
    Then the assistant flags that the processing tier changes to the F112 prior authorization
    And the formalities register carries the required action with a deadline
    And the principal's office is informed of the review timeline
  Scenario: Activating the health module
    Given a school preparing to open the health record
    When the compliance questionnaire records collection of health data
    Then the assistant requires the F112 authorization to be tracked before any operational processing
    And the school's compliance status stays flagged until the authorization is obtained
```

#### SEC-18 — Govern outbound flows to messaging vendors

| Attribute | Value |
|---|---|
| Description | Personal-data flows leaving Morocco are exhaustively listed in a **vendor register** kept from MVP onward (purpose, categories transmitted, country of processing, transfer basis): WhatsApp Business (Meta servers, United States, outside the 236-2015 list), transactional email (INT-EML), and, in V1, Google's and Apple's push notification services (FCM, APNs, United States — ARB-25d); any technical monitoring tool hosted outside Morocco (error reporting, APM) is entered in the register before activation or is not used; an SMS to a foreign number travels through an international gateway (ARB-07). Flows are minimized (contact identity and content strictly necessary; never identity documents, health data, or attachments). At MVP, the transfer basis for WhatsApp is the recipient's **express consent**, collected with an explicit statement about the transfer outside Morocco (INT-WAP-03, ARB-25c, `prd/research/02-regulatory-data.md` §2), with the F118 request filed in parallel (CNF-25); domestic SMS travels through a Moroccan aggregator, which rules out any transfer (DEC-26). ZSchool provides schools with the pre-filled F118 request template corresponding to each vendor, with the routing rules: countries on the current adequacy list (Deliberation No. 236-2015) require no F118, otherwise F118 is filed in the school's name (H-15). No other flow (hosting, backup, support) leaves the territory (SEC-19). |
| Priority | Must |
| Version | MVP (vendor register, minimization, WhatsApp express consent with transfer notice, F118 template, Moroccan SMS aggregator); V1 (push via FCM/APNs, any external monitoring, upon prior registration) |
| Traceability | DEC-26, DEC-36, H-15, RG-31; ARB-07, ARB-25c, ARB-25d; CNF-03, CNF-09, CNF-25; `prd/research/00-baseline-corrections.md` divergences #6 and #19; `prd/research/02-regulatory-data.md` §2 |
| Actors | Platform; schools; ZSchool compliance |

### 3.7 Hosting, continuity, and incidents

#### SEC-19 — Host production and backups in Morocco

| Attribute | Value |
|---|---|
| Description | Production runs in the Oracle Cloud af-casablanca-1 region (N+ONE data centers, Nouaceur-Casablanca) and backups stay in Morocco (Q-08, DEC-26): no student data is processed or stored outside the territory, which removes any transfer formality under Law 09.08. At launch, the region's catalog is verified service by service (managed databases, object storage, orchestration) before any commitment (H-18). ZSchool maintains data-residency documentation enforceable against schools; DGSSI compliance (out of legal scope, H-06) is targeted only as a potential contractual requirement and a sales argument. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-26, Q-08, H-06, H-18; `prd/research/00-baseline-corrections.md` divergences #12 and #13; `prd/research/05-infrastructure-usage.md` §1 |
| Actors | Platform; schools (beneficiaries of the commitment) |

#### SEC-20 — Maintain an in-country cross-site disaster recovery plan

| Attribute | Value |
|---|---|
| Description | Since the Casablanca region has only one availability domain, an in-country cross-site disaster recovery plan is established: replication or backup copy to a second Moroccan site (the second Oracle region at Settat once open, otherwise Atlas Cloud Services in Benguerir or the OVHcloud local zone in Rabat), a documented failover procedure, recovery time (RTO 8 hours) and maximum data loss (RPO 15 minutes) objectives that apply only to a site-level disaster (arbitration D5, ARB-25i; NFR-DISP-01's 99.5% SLA is understood as excluding a site-level disaster), and an annual failover test. The business-continuity plan covers degraded mode: communication to schools, offline operation of mobile apps (attendance and grading tolerant of outages), and return to normal. |
| Priority | Must |
| Version | V1 (full disaster recovery plan with failover and annual test); daily replication of encrypted backups to a second Moroccan center applies from MVP onward (SEC-21, INT-HEB-06 — ARB-25h) |
| Traceability | DEC-26, H-18, Q-08; ARB-25h, ARB-25i; `prd/research/05-infrastructure-usage.md` §1; `prd/research/00-baseline-corrections.md` divergence #13 |
| Actors | Platform; schools informed of the commitments |

#### SEC-21 — Encrypt backups and guarantee their residency in Morocco

| Attribute | Value |
|---|---|
| Description | Backups are encrypted (SEC-09), kept in Morocco (DEC-26), and replicated daily to a second Moroccan center from MVP onward (INT-HEB-06, ARB-25h; the MVP fallback RPO of 24 hours is recorded in the pilot agreement); the full recovery plan is covered by SEC-20. Operational thresholds — daily frequency, at least 30-day retention, quarterly restore tests — are carried by requirements NFR-SAV-01 to NFR-SAV-03 of `prd/cross-cutting/32-non-functional-requirements.md`, without duplication here. On-demand restoration after an incident (for example a massive accidental deletion) remains possible, logged (RG-38), with the school informed of the scope restored and any potential loss between the last backup and the incident. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §9 (encrypted backups), §10, RG-38, DEC-26; thresholds and restore tests: NFR-SAV-01 to NFR-SAV-03 (`prd/cross-cutting/32-non-functional-requirements.md`) |
| Actors | Platform; the affected school in case of an on-demand restore |

```gherkin
Feature: On-demand restoration after a massive accidental deletion
  Scenario: Logged restoration with the school informed
    Given a school hit by a massive accidental deletion
    When the platform restores the school's data from backup
    Then the operation is logged in the audit log
    And the school is informed of the scope restored and of any loss since the last backup
```

#### SEC-22 — Manage security incidents and notify breaches

| Attribute | Value |
|---|---|
| Description | Every security incident (intrusion, leak, suspected leak, massive error affecting personal data) is recorded in an incident log with a classification, severity, actions, and closure. In the event of a personal-data breach, ZSchool (as processor, DEC-16) notifies the controlling school, assists it with its obligations (informing data subjects where applicable), and keeps an enforceable register; since positive law does not impose a notification deadline (H-05), the deadline is a contractual commitment of 72 hours entered in the pilot agreement (CNF-08) and then in the commercial contract (OQ-04 resolved). Every breach triggers a post-incident review and tracked corrective actions. |
| Priority | Must |
| Version | MVP (operational handling, contractual 72-hour notification); V1 (tooled register) |
| Traceability | `PROJECT.md` §9 (incident log and breach notification), DEC-16, H-05 |
| Actors | Platform; the affected schools' principal's office; data subjects where applicable |

### 3.8 Application security

#### SEC-23 — Maintain an application security program

| Attribute | Value |
|---|---|
| Description | Development applies systematic code reviews with checks on critical points (access control, tenant isolation, secrets management). A first independent penetration test is conducted before pilot activation (JAL-04, ARB-25g), then a second before commercial launch (V1), then periodically (at least annually, and after any major overhaul). Vulnerabilities are triaged by severity with contractual remediation deadlines (critical: emergency fix within 72 hours; high: within 15 days; medium and low: within the current cycle), dependencies are tracked and updated, secrets are managed outside the codebase, and test environments never use real data without prior anonymization. |
| Priority | Must |
| Version | MVP (first penetration test before JAL-04; internal practices from development onward); V1 (periodic program) |
| Traceability | `PROJECT.md` §9 (code reviews, periodic penetration tests, vulnerability management); ARB-25g |
| Actors | Platform |

#### SEC-24 — Rate-limit and guard against abuse

| Attribute | Value |
|---|---|
| Description | Sensitive entry points carry rate limiting per account, per number, and per source: issuing and verifying one-time codes (protecting SMS costs and accounts), login attempts, search and matching functions (complementing SEC-06), bulk downloads and exports. Excesses trigger throttling then a temporary, logged block; abnormal volumes generate an alert (SEC-22). Rate limiting extends to the public API once it ships (V2). |
| Priority | Must |
| Version | MVP (authentication, claim, and search); generalized in V1; public API: V2 |
| Traceability | `PROJECT.md` §9 (rate limiting), §12 (public API in V2), RG-38 |
| Actors | Platform |

### 3.9 Data lifecycle

#### SEC-25 — Apply retention periods, deletion, and anonymization

| Attribute | Value |
|---|---|
| Description | DEC-22's default retention periods are applied automatically by data type: permanent for enrollment registers, year-end decisions, report cards, transcripts, and certificates; ten years for financial documents, never before the account is settled (INV-08, ARB-25u); end of schooling plus two years then anonymization for attendance and discipline; end of schooling plus one year then deletion for health; two years for messages and notifications; five years for audit logs; anonymization of accounts with no active relationship after three years of inactivity. The right to erasure is exercised by **anonymizing the global identity**, never by deleting the school's registers (RG-34, INV-28); every school keeps an identity snapshot in its enrollment register (first and last name in both scripts, date of birth, Massar code) for the register's permanent retention period (INV-44, ARB-12); files (documents, records) past their retention period are deleted with the operation logged. Schools may adjust the periods within legal limits (DEC-22); adjustments and executions are logged. |
| Priority | Must |
| Version | MVP (default retention periods); fine-grained school-level configuration: V1 |
| Traceability | RG-34, DEC-22, G-28, INV-28 |
| Actors | Platform; school principal's office for adjustments |

#### SEC-26 — Export and purge data upon termination

| Attribute | Value |
|---|---|
| Description | Upon a school's termination (including closure or loss of authorization, G-33), the platform provides a **full export** of data and documents in an open format (`DataExport` entity), switches the school's access to read-only for 90 days, then deletes operational data 12 months after termination (DEC-23, INV-38). Individuals retain their global identity and access to their published documents (RG-28). The school's audit log follows its own five-year retention (SEC-12); the export, the switch to read-only, and the deletion are logged and reported to the school. |
| Priority | Must |
| Version | V1 |
| Traceability | DEC-23, G-33, RG-28, INV-38, DEC-22 |
| Actors | Platform; the departing school's principal's office; data subjects |

```gherkin
Feature: A school leaving the network
  Scenario: Termination and full export
    Given a school whose subscription is terminated
    When the platform closes the subscription
    Then a full export of data and documents is provided to the school in an open format
    And the school's access switches to read-only for 90 days
    And operational data is deleted 12 months after termination
    And individuals retain their global identity and access to their published documents
```

### 3.10 Additions from the September 9, 2026 review

#### SEC-27 — Change number, recover access, detect a recycled number, secure the claim flow

| Attribute | Value |
|---|---|
| Description | (a) **Self-service number change**: OTP on both the old and the new number; immediate effect on the login identifier and contacts; notification to schools with an active relationship. (b) **Lost or disconnected number**: recovery at the front desk of a school with an active relationship (enrollment, affiliation, or parental link): identity check by the registrar's office (document presented, questions about the record), the principal's approval, the new number recorded, logged, other affected schools notified; for a principal-track role, validation by ZSchool support on a ticket (SEC-13). (c) **Recycled-number detection**: after six months with no login, or repeated OTP failures, or when an OTP is requested from an unknown device on an inactive account, access requires a knowledge challenge (date of birth of a linked child, entered and not displayed; for a teacher, their affiliated school) before any session opens; a failure locks the account, alerts the schools, and enforces procedure (b). (d) **Identity claim (FR-INS-08)**: the invitation code alone is not enough; the claimant must enter a piece of undisplayed knowledge (the child's date of birth); the school can revoke a claim and reissue an invitation, with the revocation immediately removing access. All these operations are logged (SEC-11). Functional owner: FR-ADM-20 (`prd/modules/10-administration-onboarding-subscription.md`). |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-11, RG-05, RG-12b, INV-13, INV-37, INV-45; ARB-07, ARB-08; FR-ADM-20, FR-INS-08; SEC-01, SEC-05 |
| Actors | All actors with an account; registrar's office and principal's office; ZSchool support |

```gherkin
Feature: Recycled mobile number (MVP)
  Scenario: New holder of a number formerly linked to a parent account
    Given a parent account with no login for eight months
    And a mobile number reassigned by the carrier to another person
    When that person requests a login code from an unrecognized device
    Then the platform requires the date of birth of a linked child before any session opens
    And three failures lock the account, alert the affected schools, and route to front-desk recovery
    And no child data is displayed before the challenge succeeds

  Scenario: Self-service number change
    Given a logged-in parent who still has their old number
    When they declare a new number and confirm both codes received
    Then the login identifier and primary contact are replaced
    And schools with an active relationship are notified of the change
```

#### SEC-28 — Password policy, OTP rate limiting, and SIM-swap awareness

| Attribute | Value |
|---|---|
| Description | The email-and-password channel applies: a minimum length of 12 characters, checking against compromised-password lists, no arbitrary composition rule, progressive lockout after failures (increasing delays then a temporary, logged block), storage via a suitable derivation function. OTP issuance is rate-limited per account, per number, and per source (complementing SEC-24); a spike of OTPs on a number triggers an alert. The risk analysis documents SIM-swap and OTP interception: the most sensitive operations (number change, resetting a privileged role, signing the parent contract INT-SIG-02) require a second element (trusted device, knowledge challenge, or front-desk validation). |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §9; ARB-25n; SEC-01, SEC-05, SEC-24 |
| Actors | Platform; all actors with an account |

## 4. CNDP formalities per processing activity

The tables below govern the formalities register kept by the SEC-17 assistant. They are consolidated in `prd/cross-cutting/36-legal-compliance-data-protection.md` (legal analysis `CNF-…`); the assistant materializes them per school with tracking of receipts and deadlines.

### 4.1 Processing carried out by the school (controller: the school; ZSchool: processor, DEC-16)

| Processing activity | Purposes | Data categories | Formality required | Alert triggers (SEC-17) | Version |
|---|---|---|---|---|---|
| School records (enrollment, attendance, assessments, report cards, discipline, documents) | Managing enrollment and schooling | Civil status, Massar code, schooling data, contact details of students, guardians, and staff | F211 declaration, or F214 if it matches a CNDP resolution | Collecting national ID numbers, health data, biometrics, interconnection | MVP |
| Communication with families | Notifications, notices, reminders, moderated threads | Contact identity, message content | Same declaration; WhatsApp transfer at MVP on express consent with a transfer notice (ARB-25c) and F118 filed in parallel (template provided, SEC-18; CNF-25 timeline) | New vendor outside the adequacy list | MVP (express consent + F118 in parallel) |
| Finance and collections | Billing, payments, reminders, receipts | Financial data, payment plans | F211 declaration (or F214) | — | MVP |
| Collection of national ID numbers | Identifying adults (staff, file documents) | National ID number, identity documents | Prior F112 authorization (filed before December 15, 2026, CNF-25) | Activating national ID collection | After obtaining F112; field disabled at MVP until the authorization is on record (ARB-25a) |
| Push notifications (Google FCM and Apple APNs services, outside Morocco) | Notifying families and staff | Device token, minimal notification content | F118 in the school's name or documented express consent; entry in the sub-processor register (CNF-09) | Activating the push channel | V1 (ARB-25d) |
| Health record (future module) | School medical follow-up | Health data | Prior F112 authorization | Activating any health data | V2+ |
| Interconnections (student passport, ministry data exchanges) | Consented inter-school sharing, statutory reporting obligations | Consented scope (RG-31) | Authorization in case of file interconnection; data subjects' express consent | Setting up an interconnection | V2+ |

Biometrics note: no biometrics appear on the roadmap; any school request is refused on the platform (biometrics would require a CNDP authorization and a product decision outside the baseline) — see OQ-07.

### 4.2 ZSchool's own processing (controller: ZSchool, DEC-16)

| Processing activity | Purposes | Data categories | Formality required | Version |
|---|---|---|---|---|
| Global identity and accounts (`User`, `Person`, profiles, relationships, `ConsentGrant`) | Service delivery, matching, account security | Identity, contacts, authentication data | F211 declaration (or F214) in ZSchool's name | MVP |
| Audit logs, operations, logged support | Security, compliance, audited support | Accounts, access, tickets | F211 declaration | MVP (writes, security, support — D4; sensitive views: V1) |
| Technical monitoring (application logs, error reporting, metrics) | Operations, diagnostics | Technical identifiers, correlation identifiers, never school content | F211 declaration; any tool hosted outside Morocco entered in the sub-processor register with a transfer basis, otherwise not used (ARB-25d) | MVP |
| Notifications via Moroccan SMS aggregator | Invitations, one-time codes, alerts | Phone number, student's first name (minimized) | F211 declaration; no transfer outside Morocco | MVP |
| Minimal public school directory | Teacher network, transfers | Name, city, cycles at MVP; systems, website afterward (RG-23) | F211 declaration (or F214) | MVP (minimal read-only directory: name, city, cycles — needed for the MVP transfer flow; arbitration logged in OQ-02 of `prd/modules/19-teacher-career-network.md`); enrichments and network features: V2+ |
| Teacher professional network | Applications, availability | Shared professional profile, consent (RG-35) | F211 declaration (or F214) | V2+ |
| Student passport | Consented portability between schools | Per express consent | F211 declaration (or F214); F112 tier-change alert if national ID or health data | V2+ |

### 4.3 Common rules

- Formalities are free of charge; filed online via CNDP-FORMS; declaration receipt within 24 hours; possible reclassification as an authorization within 8 days (divergence #19).
- Declarations filed by ZSchool do not exempt the school from its own formalities (DEC-16): the SEC-17 assistant keeps the two registers separately.
- Transfers: the current adequacy list (Deliberation No. 236-2015: European Union and EEA excluding Croatia, the United Kingdom, Switzerland, Canada) exempts from F118; outside the list, F118 in the controller's name (2-month delay, extendable) or the data subject's documented express consent. Since hosting and backups stay in Morocco (SEC-19), the only flows concerned are those in the vendor register (SEC-18): messaging, push in V1, any external monitoring.
- Timeline before pilot activation (JAL-04): F211 for each pilot and for ZSchool, F112 for national ID, F118 for messaging, all filed before December 15, 2026 (CNF-25, ARB-25b).
- Retention periods entered in declarations are those of DEC-22 (SEC-25).

## Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Version at which MFA activates for school roles. | **Resolved — ARB-25l**: MFA from MVP for privileged roles (principal's office, academic direction, registrar's office, accounting, system administrator) and ZSchool roles; optional for teachers, supervisors, and ancillary roles; 90-day trusted devices (SEC-02, SEC-04, PER-17). |
| OQ-02 | Logging from MVP onward while §12 places "Audit" in V1. | **Resolved — D4, ARB-25j**: at MVP, immutable record-level write logging, logging of security events, support access, and merges; sensitive views, console, and export in V1 (SEC-11, SEC-12, PER-10). |
| OQ-03 | Encryption key management in the af-casablanca-1 region. | Availability of a key-management service to be confirmed against the region's catalog (H-18, service-by-service verification). Fallback: keys managed by the platform on storage separate from the data, with documented rotation. |
| OQ-04 | Deadline and terms for notifying schools of data breaches. | **Resolved — ARB-25e**: contractual commitment to notify within 72 hours, entered in the pilot agreement (CNF-08, MVP) and then in the commercial contract (SEC-22). |
| OQ-05 | Response deadline for data-subject requests (access, rectification, objection). | **Resolved — ARB-25f**: 30 calendar days by default, configurable, manual procedure from MVP onward (SEC-14); to be confirmed with the CNDP through ongoing monitoring (CNF-24). |
| OQ-06 | Cross-site recovery objectives and MVP coverage. | **Resolved — ARB-25h, ARB-25i**: daily replication of encrypted backups to a second Moroccan center from MVP onward (INT-HEB-06), a 24-hour fallback RPO recorded in the pilot agreement; full disaster recovery plan in V1 with RTO 8 hours / RPO 15 minutes limited to a site-level disaster, 99.5% SLA excluding a site-level disaster. Initial context: targets aligned with NFR-DISP-03 of `prd/cross-cutting/32-non-functional-requirements.md`: service recovery (RTO) within 8 hours maximum and data loss (RPO) of 15 minutes maximum; meeting this RPO requires continuous replication or log archiving to the second site at least every fifteen minutes, in addition to daily backups (NFR-SAV-01). As long as the second site is not operational at MVP, fallback relies on daily backups (a higher effective RPO, to be recorded contractually); the targets apply once it is activated. Backup replication to a second Moroccan site applies from MVP onward (SEC-20, SEC-21); annual failover test. To be put under contract. |
| OQ-07 | Final position on biometrics. | Off the roadmap (no requirement); biometrics would require a CNDP authorization. To be confirmed in review as a lasting product exclusion. |

## Traceability

| Baseline ID | Coverage in this file |
|---|---|
| `PROJECT.md` §9 (authentication) | SEC-01 to SEC-06 |
| §9 (multi-tenant isolation, global entities) | SEC-07, SEC-08; `prd/03-domain-data-model.md` INV-17, INV-18 |
| §9 (encryption) | SEC-09, SEC-10 |
| §9 (audit log) | SEC-11, SEC-12 |
| §9 (individuals' rights) | SEC-14 |
| §9 (consents) | SEC-15, SEC-16 |
| §9 (CNDP formalities) | SEC-17, SEC-18; §4 |
| §9 (hosting in Morocco, Q-08) | SEC-19, SEC-20 |
| §9 (backups, incidents) | SEC-21, SEC-22 |
| §9 (application security) | SEC-23, SEC-24 |
| §9 (deletion, termination export) | SEC-25, SEC-26 |
| §8.1 (ZSchool support), G-32 | SEC-13 |
| `PROJECT.md` §10 (daily backups, 30-day retention, quarterly tests) | Thresholds: NFR-SAV-01 to NFR-SAV-03 of `prd/cross-cutting/32-non-functional-requirements.md`; encryption and residency: SEC-21 |
| §12 (MVP/V1/V2 scope) | "Version" column of requirements; OQ-01, OQ-02, OQ-06 |
| RG-34 (retention over erasure), G-28 | SEC-25 |
| RG-38 (logging), G-20 | SEC-11, SEC-12 |
| RG-02 (adult student) | SEC-14, SEC-15 |
| RG-05, RG-06, RG-07 (matching, merge, correction) | SEC-06, SEC-08, SEC-14 |
| RG-19 (access revoked on affiliation closure) | SEC-03 |
| RG-21 (tenant), DEC-02 | SEC-07 |
| RG-23 (minimal public directory) | SEC-06, §4.2 |
| RG-28 (permanent read access) | SEC-14, SEC-26 |
| RG-30, RG-31 (sharing and transfer) | SEC-10, SEC-16, SEC-18 |
| RG-14 (supporting documents, court decisions) | SEC-10 |
| DEC-11 (primary phone) | SEC-01, SEC-05 |
| DEC-16 (dual controller/processor role) | §2.1, SEC-17, SEC-18, SEC-22, §4 |
| DEC-22 (retention periods) | SEC-12, SEC-25 |
| DEC-23 (termination) | SEC-26 |
| DEC-26 (hosting and failover in Morocco) | SEC-01, SEC-18, SEC-19, SEC-20, SEC-21 |
| DEC-36 (channels, WhatsApp opt-in) | SEC-18 |
| G-09 (Law 09.08, CNDP, hosting) | Entire chapter |
| G-33 (a school closing) | SEC-26 |
| H-05 (no revision of Law 09.08, no legal notification deadline) | §2.2, SEC-22, OQ-04, OQ-05 |
| H-06 (Law 05.20 out of scope) | §2.3, SEC-19 |
| H-15 (adequacy list) | SEC-17, SEC-18, §4.3 |
| H-18 (Casablanca region catalog) | SEC-09, SEC-19, SEC-20, OQ-03 |
| Q-08 (hosting) | SEC-19, SEC-20 |
| `prd/research/00-baseline-corrections.md` divergences #12, 13, 19 | §2.2, §2.3, SEC-17, SEC-18, SEC-19, SEC-20 |
| `prd/research/02-regulatory-data.md` §2 | §2.2, SEC-17, SEC-18, §4 |
| `prd/research/05-infrastructure-usage.md` §1 | §2.3, SEC-19, SEC-20 |
| ARB-07 (login identifier distinct from contact, E.164 numbers), INV-45 | SEC-01, SEC-27 |
| ARB-08 (number change, loss, reassignment, claim) | SEC-27 |
| ARB-12 (identity snapshot in the register), INV-44 | SEC-25 |
| ARB-25a (national ID not collected at MVP) | SEC-10; §4.1 |
| ARB-25b (CNDP timeline before JAL-04) | SEC-17; §4.3 |
| ARB-25c, ARB-25d (WhatsApp transfer basis, push FCM/APNs, monitoring) | SEC-18; §4.1, §4.2, §4.3 |
| ARB-25e (pilot agreement, 72-hour notification) | SEC-22; OQ-04 |
| ARB-25f (individuals' rights at MVP) | SEC-14; OQ-05 |
| ARB-25g (penetration test before JAL-04) | SEC-23 |
| ARB-25h, ARB-25i (off-site backups at MVP, RTO/RPO limited to a site-level disaster) | SEC-20, SEC-21; OQ-06 |
| ARB-25j (D4 logging) | SEC-11; §4.2; OQ-02 |
| ARB-25k (support at MVP) | SEC-13 |
| ARB-25l (MFA) | SEC-02, SEC-04; OQ-01 |
| ARB-25m (local system administrator) | SEC-05 |
| ARB-25n (password, OTP, SIM-swap) | SEC-28 |
| ARB-25u (financial documents after settlement) | SEC-25 |
| INT-SIG-01 (QR verification page) | SEC-06 |
