> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-CC-02                                                  |
> | Revision       | 1.1                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification — Security and Privacy               |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/cross-cutting/31-security-privacy.md` (v0.3), old `SEC-01..28` -> `SEC-ZS-001..028`, per `spec/process/id-migration-map.md` (CCR-ZS-001). 1.1 (2026-09-09): SEC-ZS-024/025/026 redefined for AWS `eu-central-1`/`eu-west-3` per ADR-ZS-091 (Accepted) (CCR-ZS-002). |

# Security and Privacy

## 1. Objective and scope

This chapter translates the historical baseline's security, privacy, and compliance commitments (`spec/appendices/00-project-baseline.md` §9, historical gap G-09 closed, `spec/appendices/01-review-history.md`) into verifiable requirements. It carries the `SEC-ZS-NNN` identifiers and applies to all functional modules (`spec/behaviors/01` to `spec/behaviors/14`) and journeys (`spec/journeys/00-journey-map.md`).

In scope:

- authentication and access management (login identifier distinct from the contact identifier, phone with a one-time code, email and password, MFA, sessions, devices, reset, number change and reassignment, anti-enumeration);
- server-side multi-tenant isolation and access control for global entities;
- encryption in transit, at rest, and strengthened for sensitive data;
- the immutable, exportable audit log (INV-ZS-090) and audited ZSchool support access (historical gap G-32);
- individuals' rights (Law 09.08) and logged consents;
- CNDP formalities per processing activity (F211/F214 declarations, F112 authorizations, F118 requests);
- hosting in Morocco, encrypted backups, restore testing, the disaster recovery plan, and incident management;
- application security (reviews, penetration tests, vulnerability management, rate limiting);
- retention, deletion, and anonymization (INV-ZS-086, ADR-ZS-003) and the full export upon termination (ADR-ZS-004).

Out of scope for this file: the fine-grained role permission matrix (`spec/cross-cutting/01-permissions.md`), non-functional performance and availability thresholds (`spec/cross-cutting/03-non-functional-requirements.md`), detailed legal analysis and standard contracts (`spec/cross-cutting/07-legal-compliance-data-protection.md`), and the design of vendor integrations (`spec/cross-cutting/06-external-integrations.md`). This chapter does not describe any screens; compliance screens are covered by the relevant module chapters (`spec/behaviors/01-administration-onboarding-subscription.md`).

## 2. Responsibility framework and reference points

### 2.1 ZSchool's dual role (ADR-ZS-027)

ZSchool is a **processor** for each school's operational data (the school is the data controller) and a **controller** for the global identity and, eventually, the student passport. This dual role is formalized before commercial launch (contracts, declarations, notices, consents). Direct consequence: CNDP declarations filed by ZSchool never exempt a school from its own formalities; the compliance assistant (SEC-ZS-001) therefore works **per school** and separately on ZSchool's own behalf.

### 2.2 Law 09.08 and the CNDP: status as of September 9, 2026

Law 09.08 remains in force, with no revision before Parliament (historical hypothesis H-05, `spec/appendices/01-review-history.md`; `spec/appendices/00-project-baseline.md` and the research corpus preserved in `spec/appendices/01-review-history.md`). Confirmed facts:

- prior declaration F211, or the simplified F214 form when the processing matches a CNDP resolution; receipt within 24 hours; possible reclassification as an authorization within 8 days; free of charge; filed online (CNDP-FORMS);
- prior authorization (form F112, 2-to-4-month delay per the historical baseline) for health data, processing that includes the national ID number, file interconnection, and biometrics;
- transfer abroad: form F118 outside the adequacy list (2-month delay, extendable), free for states on the current list (Deliberation No. 236-2015: European Union and EEA excluding Croatia, the United Kingdom, Switzerland, Canada); France and Spain are subject to a simple declaration (historical hypothesis H-15);
- ongoing obligations: privacy notices, security, rights of access, rectification, and objection.

### 2.3 Hosting and cybersecurity

Law 05.20 and DGSSI-qualified cloud requirements are out of scope for private schools and the SaaS vendor, except under contract with a public entity (historical hypothesis H-06); the real legal constraint remains Law 09.08. The baseline originally kept hosting in Morocco to remove any transfer formality (ADR-ZS-007), on Oracle Cloud **af-casablanca-1** (N+ONE data centers, Nouaceur-Casablanca), which has only one availability domain. **[ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md) (Accepted, 2026-09-09) supersedes this**: production and backups now run on AWS `eu-central-1` (Frankfurt, multi-AZ), with the transfer question closed instead via the CNDP EU-adequacy list (Deliberation No. 236-2015). A cross-region disaster recovery plan is mandatory regardless: `eu-west-3` (Paris) is the second EU region (SEC-ZS-025, SEC-ZS-026).

### 2.4 Relationship to the data model

The requirements below implement the invariants carried by `spec/domain-model.md` and `spec/invariants.md`: INV-ZS-001 (tenant key and server-side control), INV-ZS-032 (global entities accessible via an active relationship or consent), INV-ZS-012 (consents logged, bounded, revocable), INV-ZS-037 (retention takes precedence, erasure by anonymization), INV-ZS-019 (immutable, exportable log), INV-ZS-044 (phone as the primary contact identifier), INV-ZS-045 (termination), INV-ZS-004 (identity snapshot kept by the school's register upon anonymization, ADR-ZS-053), INV-ZS-003 (login identifier distinct from the contact identifier, ADR-ZS-048). The audit log relies on the `AuditLog` entity; consents on `ConsentGrant`; support access on `SupportTicket`; exports on `DataExport`; merges on `MergeOperation`.

## 3. Security requirements

### Summary

| ID | Title | Priority |
|---|---|---|
| SEC-ZS-001 | Provide a per-school CNDP formalities assistant | Must |
| SEC-ZS-002 | Authenticate by phone (one-time code) and, optionally, by email and password | Must |
| SEC-ZS-003 | Password policy, OTP rate limiting, and SIM-swap awareness | Must |
| SEC-ZS-004 | Change number, recover access, detect a recycled number, secure the claim flow | Must |
| SEC-ZS-005 | Require a second factor (MFA) for privileged roles | Must |
| SEC-ZS-006 | Manage trusted devices | Must |
| SEC-ZS-007 | Secure access reset | Must |
| SEC-ZS-008 | Control sessions (expiry, invalidation, logout) | Must |
| SEC-ZS-009 | Govern and audit ZSchool support access | Must |
| SEC-ZS-010 | Protect against identity enumeration, notably of the Massar code | Must |
| SEC-ZS-011 | Rate-limit and guard against abuse | Must |
| SEC-ZS-012 | Guarantee server-side multi-tenant isolation | Must |
| SEC-ZS-013 | Manage security incidents and notify breaches | Must |
| SEC-ZS-014 | Condition access to global entities on an active relationship or a consent | Must |
| SEC-ZS-015 | Encrypt in transit and at rest | Must |
| SEC-ZS-016 | Strengthen encryption for sensitive data | Must |
| SEC-ZS-017 | Log every write and every sensitive view | Must |
| SEC-ZS-018 | Maintain an immutable, exportable audit log kept for five years | Must |
| SEC-ZS-019 | Export and purge data upon termination | Must |
| SEC-ZS-020 | Handle access, rectification, and objection requests | Must |
| SEC-ZS-021 | Collect privacy notices and legal guardians' consent | Must |
| SEC-ZS-022 | Log and bound sharing consents | Must |
| SEC-ZS-023 | Govern outbound flows to messaging vendors | Must |
| SEC-ZS-024 | Host production and backups in the EU, under a documented legal basis | Must |
| SEC-ZS-025 | Maintain a cross-region EU disaster recovery plan | Must |
| SEC-ZS-026 | Encrypt backups and guarantee their residency in the EU | Must |
| SEC-ZS-027 | Maintain an application security program | Must |
| SEC-ZS-028 | Apply retention periods, deletion, and anonymization | Must |

### 3.1 Authentication and account management

#### SEC-ZS-002: Authenticate by phone (one-time code) and, optionally, by email and password

| Attribute | Value |
|---|---|
| Description | Every account carries a **login identifier**, distinct from the contact identifiers (INV-ZS-003, ADR-ZS-048): by default the mobile phone number (primary contact identifier, ADR-ZS-022, INV-ZS-044), unique per account, in international E.164 format (Moroccan +212 by default, foreign numbers accepted). Login uses a one-time code sent by SMS via a Moroccan aggregator (ADR-ZS-007) or, for a foreign number, via an international gateway; the code is single-use, short-lived (on the order of a minute), and rate-limited on attempts. A **minor student without their own mobile phone** receives a platform-generated login identifier (readable, not derived from the Massar code), activated by a legal guardian with an OTP sent to that guardian's number, migratable at any time to a personal number (BEH-ZS-020). A **second guardian sharing the household's mobile phone** likewise receives a generated identifier, with the OTP routed to the number declared as a shared contact; no account is ever shared (INV-ZS-030). Email, if provided, offers a second channel: address and password (policy SEC-ZS-003). Email is never required for a parent, student, or teacher. The platform never discloses whether an identifier is registered or not: error messages are uniform. Invitation and identity-claim codes (journey JMP-ZS-004) travel through the same channels and rules, with the knowledge challenge of SEC-ZS-004. |
| Priority | Must |
| Version | MVP |
| Traceability | ADR-ZS-022, ADR-ZS-007, INV-ZS-051, INV-ZS-063, INV-ZS-030, INV-ZS-044, INV-ZS-003; ADR-ZS-048; SEC-ZS-004, SEC-ZS-003; BEH-ZS-020; `spec/journeys/00-journey-map.md` JMP-ZS-004 |
| Actors | All actors with an account (parent, student, teacher, staff, principal's office, ZSchool roles) |

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
_Acceptance: `@REQ-ZS-420`, `features/cross-cutting/sec/req-zs-420-identity-enumeration-protection.feature` (covers SEC-ZS-010)._

#### SEC-ZS-005: Require a second factor (MFA) for privileged roles

| Attribute | Value |
|---|---|
| Description | Multi-factor authentication is mandatory from MVP onward for the school's privileged roles (principal's office, academic direction, registrar's office, accounting, local system administrator) and for ZSchool roles (§8.1 of the historical baseline); it is optional, activatable by the school, for teachers, supervisors, and ancillary-module roles (ADR-ZS-066, sub-point l), so as not to impose a paid SMS OTP on every session on an entry-level mobile phone. The second factor is a one-time code sent to the primary phone or generated by an authenticator app; it is required when logging in from an unrecognized device (90-day trusted devices, SEC-ZS-006) and when confirming the most sensitive operations (profile merge, role change, CNDP configuration, resetting a principal-track account). Losing the second factor follows the reset procedure (SEC-ZS-007, SEC-ZS-004). MFA is not imposed on parents and students. Authentication SMS is borne by ZSchool (PAK-ZS, `spec/cross-cutting/04-business-model-packaging.md`). |
| Priority | Must |
| Version | MVP (privileged roles and ZSchool roles); optional for teachers, supervisors, and ancillary roles (ADR-ZS-066l) |
| Traceability | `spec/appendices/00-project-baseline.md` §9 (MFA for school roles); ADR-ZS-066l; PER-ZS-018; OQ-ZS-271 (resolved) |
| Actors | School roles, ZSchool roles |

#### SEC-ZS-008: Control sessions (expiry, invalidation, logout)

| Attribute | Value |
|---|---|
| Description | Every session carries a maximum duration and an inactivity expiry suited to the role (shorter for privileged roles). The user can log out from any device and can log out of all sessions at once. Any loss of entitlement removes access immediately: closing an affiliation invalidates the active sessions of the relevant context (INV-ZS-071, INV-ZS-010); suspending an account or resetting access invalidates all sessions. Invalidations are logged. |
| Priority | Must |
| Version | MVP |
| Traceability | `spec/appendices/00-project-baseline.md` §9, INV-ZS-071, INV-ZS-010, INV-ZS-040 |
| Actors | All actors with an account; the affected affiliation and the principal's office for rights revocation |

#### SEC-ZS-006: Manage trusted devices

| Attribute | Value |
|---|---|
| Description | The user views the list of their account's devices and active sessions (type, last-used date) and can revoke a device individually. A login from a new device is notified through the account's contact channels. For privileged roles, a newly recognized device requires the second factor (SEC-ZS-005); a trusted device stays recognized for 90 days without a new OTP, except upon a number change or a reset (ADR-ZS-066l). |
| Priority | Must |
| Version | MVP |
| Traceability | `spec/appendices/00-project-baseline.md` §9 (session and device management); ADR-ZS-066l |
| Actors | All actors with an account |

#### SEC-ZS-007: Secure access reset

| Attribute | Value |
|---|---|
| Description | Resetting a password or second factor uses a one-time code sent to the primary phone (ADR-ZS-022) or, if provided and explicitly chosen, to email. The flow never reveals whether an account exists; after a reset, all active sessions are invalidated (SEC-ZS-008) and the event is logged. School-role accounts require the second factor or the principal's approval to recover a locked account; a principal-track account cannot be reset by the local system administrator (PER-ZS-003); ZSchool never resets a school's access outside a logged procedure (SEC-ZS-009). Number change, number loss, and operator reassignment follow SEC-ZS-004. |
| Priority | Must |
| Version | MVP |
| Traceability | `spec/appendices/00-project-baseline.md` §9 (secure reset), ADR-ZS-022, INV-ZS-090; SEC-ZS-004; PER-ZS-003 |
| Actors | All actors with an account; the principal's office for its own school's accounts |

#### SEC-ZS-010: Protect against identity enumeration, notably of the Massar code

| Attribute | Value |
|---|---|
| Description | Every search, matching (INV-ZS-055), or claim function exposing a sensitive identifier — Massar code (INV-ZS-006), phone number — is protected against enumeration: uniform responses (same message and comparable delay whether the identifier exists or not), no public counting, strict rate limiting per source, alerting and progressive throttling on abnormal volume (SEC-ZS-011). Massar codes and phone numbers never appear in plain text in a URL, a public link, a shared printed document, or a notification channel where third parties could access them. No directory of students, parents, or teachers is exposed; the public directory is limited to the school fields provided for by INV-ZS-075. The same protection applies to the public QR-verification page for documents (INT-ZS-032, V1): the verification identifier is random, non-sequential, and not derived from the document number, and the page is rate-limited. |
| Priority | Must |
| Version | MVP (identities); V1 (QR verification page) |
| Traceability | `spec/appendices/00-project-baseline.md` §9 (protection against enumeration, notably Massar code), INV-ZS-054, INV-ZS-055, INV-ZS-075, INV-ZS-006, INV-ZS-005; INT-ZS-032 |
| Actors | Platform; all actors with an account |

### 3.2 Multi-tenant isolation and access to global entities

#### SEC-ZS-012: Guarantee server-side multi-tenant isolation

| Attribute | Value |
|---|---|
| Description | Every operational record carries its tenant key (the school, ADR-ZS-013, INV-ZS-001) and every access is systematically controlled server-side, never client-side: no request, including one manipulating identifiers in a URL or an interface call, can read or write a record outside the user's current tenant. The organization (school group) opens only consolidated views and shared administration, without merging tenants (INV-ZS-073). Automated scope-crossing tests cover every module at every release; any detected leak is treated as a security incident (SEC-ZS-013). |
| Priority | Must |
| Version | MVP |
| Traceability | `spec/appendices/00-project-baseline.md` §9, INV-ZS-073, ADR-ZS-013, INV-ZS-001; `spec/domain-model.md` §6 |
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
_Acceptance: `@REQ-ZS-421`, `features/cross-cutting/sec/req-zs-421-multi-tenant-isolation.feature` (covers SEC-ZS-012)._

#### SEC-ZS-014: Condition access to global entities on an active relationship or a consent

| Attribute | Value |
|---|---|
| Description | Global entities (identities, accounts, profiles, parent–student relationships, consents) are accessible to a school only through an active relationship: active enrollment, active affiliation, or active parental link — or an active consent (INV-ZS-032). No school has a platform-wide search over identities; identity corrections follow INV-ZS-057 and INV-ZS-026, and merges remain audited operations (INV-ZS-056, INV-ZS-020). Views of global entities outside a school's own tenant are logged. |
| Priority | Must |
| Version | MVP |
| Traceability | `spec/appendices/00-project-baseline.md` §9, INV-ZS-056, INV-ZS-057, INV-ZS-020, INV-ZS-026, INV-ZS-032 |
| Actors | Platform; school roles; parent and adult student as owners of their own data |

### 3.3 Encryption

#### SEC-ZS-015: Encrypt in transit and at rest

| Attribute | Value |
|---|---|
| Description | All application and interface traffic (web, mobile, integrations) is encrypted in transit, including between the platform's internal components. Data is encrypted at rest in databases, file storage, and backups. Keys are managed separately from the data they protect, with periodic rotation and usage traceability; the availability of a key-management service in AWS `eu-central-1` is to be verified at launch (ADR-ZS-091, INT-ZS-039; supersedes OQ-ZS-273's original OCI framing). No secret (password, key, code) is stored or logged in plain text. |
| Priority | Must |
| Version | MVP |
| Traceability | `spec/appendices/00-project-baseline.md` §9 (encryption in transit and at rest), historical hypothesis H-18 (`spec/appendices/01-review-history.md`) |
| Actors | Platform |

#### SEC-ZS-016: Strengthen encryption for sensitive data

| Attribute | Value |
|---|---|
| Description | At MVP, adults' national ID (CNIE) numbers are not collected: the field is disabled until the prior F112 authorization is on record (ADR-ZS-066a, CNF-ZS-004); adult identity relies on first name, last name, date of birth, and mobile phone. Identity documents (the student's birth certificate from MVP onward; national ID after F112), health records (V2+ module), and court decisions attached to relationships (INV-ZS-065) receive strengthened encryption: dedicated keys separate from general encryption, access limited to expressly authorized roles (registrar's office and principal's office for documents; infirmary and principal's office for health per the permissions matrix, `spec/cross-cutting/01-permissions.md`), logging of every view (INV-ZS-090), and no export through notification channels, uncontrolled exports, or statistical processing. This data is never included in default transfer exports (INV-ZS-083: health is never transferred automatically, ADR-ZS-019). |
| Priority | Must |
| Version | MVP (birth certificates and court decisions; national ID disabled until F112 — ADR-ZS-066a); health records: V2+ upon module launch |
| Traceability | `spec/appendices/00-project-baseline.md` §9 (strengthened encryption), INV-ZS-065, INV-ZS-083, ADR-ZS-019, INV-ZS-034, INV-ZS-022; ADR-ZS-066a; CNF-ZS-004 |
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
_Acceptance: `@REQ-ZS-422`, `features/cross-cutting/sec/req-zs-422-strengthened-encryption-identity-documents.feature` (covers SEC-ZS-016)._

### 3.4 Audit log and support access

#### SEC-ZS-017: Log every write and every sensitive view

| Attribute | Value |
|---|---|
| Description | Every write action (creation, modification, closing, deletion, publication) and every view of sensitive data (identity file, health, finance, discipline) is logged with author, context (tenant, enrollment where applicable), and timestamp (INV-ZS-090, INV-ZS-019). Logging also covers security events (logins, resets, number changes, access denials, enumeration alerts) and support and merge operations. Version pacing follows arbitration D4 (ADR-ZS-066j): at MVP, every write is logged immutably at the record level (author, timestamp, prior value), and security, support-access, and merge events are logged; logging of sensitive-data views and consolidation into an exportable log (SEC-ZS-018) ship in V1. |
| Priority | Must |
| Version | MVP (logged writes, security events, support access, merges — D4, ADR-ZS-066j); V1 (sensitive views) |
| Traceability | INV-ZS-090, INV-ZS-019; ADR-ZS-066j; OQ-ZS-272 (resolved) |
| Actors | Platform; viewing: principal's office, ZSchool compliance |

#### SEC-ZS-018: Maintain an immutable, exportable audit log kept for five years

| Attribute | Value |
|---|---|
| Description | The audit log is immutable: no entry can be modified or deleted in it, including by ZSchool. It can be viewed by the school's principal's office with filters (author, period, student, action type) and exported by the school in an open format (INV-ZS-019). Retention is five years (ADR-ZS-003) and survives the school's termination (SEC-ZS-019). ZSchool compliance has a cross-tenant view for platform operations (support, merge, security). Exporting the audit log is itself logged. |
| Priority | Must |
| Version | V1 (§12 of the historical baseline: "Audit") |
| Traceability | INV-ZS-090, ADR-ZS-003, INV-ZS-019, historical gap G-20 (`spec/appendices/01-review-history.md`) |
| Actors | School principal's office, ZSchool compliance |

#### SEC-ZS-009: Govern and audit ZSchool support access

| Attribute | Value |
|---|---|
| Description | No ZSchool agent accesses a school's data outside a procedure: access is temporary, opened on a ticket (`SupportTicket` entity, MVP), bounded in scope (tenant, modules), purpose (ticket reason), and duration; it is approved internally by ZSchool and, at MVP, by the school principal's explicit approval given in the application (ADR-ZS-066k), notified to the principal's office, fully logged (SEC-ZS-017), and revoked when the ticket closes. The super-administrator does not view school data without this procedure (historical gap G-32, `spec/appendices/01-review-history.md`). The support access history is visible to the principal's office in the audit log (SEC-ZS-018). |
| Priority | Must |
| Version | MVP (ticket-based access with the principal's explicit approval, bounded duration, logged — ADR-ZS-066k); V1 (full workflow, exportable log) |
| Traceability | `spec/appendices/00-project-baseline.md` §8.1, §9, historical gap G-32, INV-ZS-090; ADR-ZS-066k; PER-ZS-001 |
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
_Acceptance: `@REQ-ZS-423`, `features/cross-cutting/sec/req-zs-423-zschool-support-access.feature` (covers SEC-ZS-009)._

### 3.5 Individuals' rights and consents

#### SEC-ZS-020: Handle access, rectification, and objection requests

| Attribute | Value |
|---|---|
| Description | Any data subject (a parent for their minor child, an adult student, a teacher for their own profile) can exercise their rights of access, rectification, and objection (Law 09.08, art. 7 to 9) from their interface, and obtain portability of published documents to which they retain permanent read access (INV-ZS-080). Every request is recorded, timestamped, and tracked (`DataExport` entity for extractions), immediately acknowledged, handled by the school with ZSchool's assistance; identity rectifications follow INV-ZS-057 (logging and notification to the schools concerned). The adult student exercises their rights directly (INV-ZS-052). The maximum response time is 30 calendar days by default, configurable (ADR-ZS-066f). At MVP, rights are enforceable from the first processing activity: the request is received at the school's front desk or by ZSchool support, acknowledged, logged in a register kept by the school (template provided), and handled manually within the deadline; the tooled portal request desk (CNF-ZS-003) ships in V1. |
| Priority | Must |
| Version | MVP (manual procedure, 30-day deadline, register — ADR-ZS-066f); V1 (tooled request desk, CNF-ZS-003) |
| Traceability | `spec/appendices/00-project-baseline.md` §9, INV-ZS-052, INV-ZS-057, INV-ZS-080, historical hypothesis H-05, INV-ZS-026, INV-ZS-033; ADR-ZS-066f; CNF-ZS-003 |
| Actors | Parent, adult student, teacher; principal's office and registrar's office; ZSchool compliance |

#### SEC-ZS-021: Collect privacy notices and legal guardians' consent

| Attribute | Value |
|---|---|
| Description | At enrollment, the privacy notice (Law 09.08, art. 5) is presented to guardians in French and Arabic (purposes, recipients, retention periods, rights) and their acceptance is timestamped; activating the enrollment requires it (a condition of the PRE-ENROLLED-to-ACTIVE transition). Consent for a minor student is given by their legal guardian (no rule specific to minors under positive law); the adult student gives their own consent and is informed of their rights at the time of coming of age (INV-ZS-052). All these acceptances are logged and viewable by the school. |
| Priority | Must |
| Version | MVP |
| Traceability | `spec/appendices/00-project-baseline.md` §9, INV-ZS-052, `spec/domain-model.md` §3.2 (conditions of the PRE-ENROLLED → ACTIVE transition) |
| Actors | Legal guardians, adult student, registrar's office, principal's office |

#### SEC-ZS-022: Log and bound sharing consents

| Attribute | Value |
|---|---|
| Description | Every sharing consent (transfer to another school, student passport in V2+) is carried by the `ConsentGrant` entity: explicit scope (INV-ZS-083's default transfer profile serves as the baseline, any addition is a choice by the legal guardian or the adult student), duration, timestamp, and status. It is revocable at any time and revocation covers future access (INV-ZS-012); the grant and the revocation are logged and notified to the recipient. No automatic access exists between schools outside this consent and the official documents of a transfer procedure (INV-ZS-082). |
| Priority | Must |
| Version | MVP |
| Traceability | `spec/appendices/00-project-baseline.md` §9, INV-ZS-082, INV-ZS-083, ADR-ZS-018, ADR-ZS-019, INV-ZS-035, INV-ZS-022, INV-ZS-012; `spec/journeys/00-journey-map.md` JMP-ZS-009 |
| Actors | Legal guardian, adult student; sending and receiving schools |

### 3.6 CNDP formalities and outbound flows

#### SEC-ZS-001: Provide a per-school CNDP formalities assistant

| Attribute | Value |
|---|---|
| Description | Every school has a compliance assistant: an initial questionnaire (categories collected: health, national ID number, biometrics, interconnection), a recommendation between the F211 declaration and the simplified F214 form, pre-filled generation of the forms, a link to file online via CNDP-FORMS, and tracking of receipts (24 hours) and any reclassifications (8 days). The assistant triggers a **tier-change alert** when the school activates collection of the national ID number, health data, or any biometrics: the processing then falls under the prior F112 authorization, the required action is entered in the school's formalities register with a deadline, and the school is assisted with the request (2-to-4-month delay per the historical baseline). Form templates are provided and kept up to date by ZSchool; the assistant explicitly distinguishes the school's own formalities (as controller) from ZSchool's own (ADR-ZS-027, §2.1). At MVP, before the assistant is tooled, ZSchool supplies pre-filled templates outside the tool and drives the filing timeline for F211 (pilots and ZSchool), F112 (national ID), and F118 (messaging) before December 15, 2026, carried by CNF-ZS-001 (ADR-ZS-066b). |
| Priority | Must |
| Version | V1 (tooled assistant); MVP: pre-filled templates outside the tool and CNF-ZS-001 timeline |
| Traceability | `spec/appendices/00-project-baseline.md` §9, ADR-ZS-027, historical hypothesis H-15; `spec/appendices/01-review-history.md` |
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
_Acceptance: `@REQ-ZS-424`, `features/cross-cutting/sec/req-zs-424-cndp-tier-change-alert.feature` (covers SEC-ZS-001)._

#### SEC-ZS-023: Govern outbound flows to messaging vendors

| Attribute | Value |
|---|---|
| Description | Personal-data flows leaving Morocco are exhaustively listed in a **vendor register** kept from MVP onward (purpose, categories transmitted, country of processing, transfer basis): WhatsApp Business (Meta servers, United States, outside the 236-2015 list), transactional email (INT-ZS, `spec/cross-cutting/06-external-integrations.md`), and, in V1, Google's and Apple's push notification services (FCM, APNs, United States — ADR-ZS-066d); any technical monitoring tool hosted outside Morocco (error reporting, APM) is entered in the register before activation or is not used; an SMS to a foreign number travels through an international gateway (ADR-ZS-048). Flows are minimized (contact identity and content strictly necessary; never identity documents, health data, or attachments). At MVP, the transfer basis for WhatsApp is the recipient's **express consent**, collected with an explicit statement about the transfer outside Morocco (INT-ZS-026, ADR-ZS-066c, `spec/appendices/01-review-history.md`), with the F118 request filed in parallel (CNF-ZS-001); domestic SMS travels through a Moroccan aggregator, which rules out any transfer (ADR-ZS-007). ZSchool provides schools with the pre-filled F118 request template corresponding to each vendor, with the routing rules: countries on the current adequacy list (Deliberation No. 236-2015) require no F118, otherwise F118 is filed in the school's name (historical hypothesis H-15). Hosting and backups themselves leave Moroccan territory for the EU (`eu-central-1`/`eu-west-3`) but not the adequacy list, so they are exempt from F118 under the same 236-2015 basis, not entered as a separate F118 flow (SEC-ZS-024, ADR-ZS-091); no flow to a non-adequacy-listed country exists outside this vendor register. |
| Priority | Must |
| Version | MVP (vendor register, minimization, WhatsApp express consent with transfer notice, F118 template, Moroccan SMS aggregator); V1 (push via FCM/APNs, any external monitoring, upon prior registration) |
| Traceability | ADR-ZS-007, ADR-ZS-036, historical hypothesis H-15, INV-ZS-083; ADR-ZS-048, ADR-ZS-066c, ADR-ZS-066d; CNF-ZS-004, CNF-ZS-012, CNF-ZS-001; `spec/appendices/01-review-history.md` |
| Actors | Platform; schools; ZSchool compliance |

### 3.7 Hosting, continuity, and incidents

#### SEC-ZS-024: Host production and backups in the EU, under a documented legal basis

| Attribute | Value |
|---|---|
| Description | **Redefined by [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md) (Accepted, 2026-09-09):** production runs in AWS `eu-central-1` (Frankfurt) and backups stay within the EU; no student data is processed or stored outside the EU/EEA except the expressly governed messaging flows. The transfer's legal basis is the CNDP EU-adequacy list (Deliberation No. 236-2015, Law 09.08), which exempts it from F118 authorization — replacing the original "no transfer, no transfer question" basis of ADR-ZS-007 (historical question Q-08). At launch and at every architecture change, the AWS `eu-central-1` service catalog is verified service by service, and a residency check (locating stores, backups, and processing zones) runs and is documented (mirrors INT-ZS-039/INT-ZS-040). ZSchool maintains data-residency documentation enforceable against schools; DGSSI compliance (out of legal scope, historical hypothesis H-06) is targeted only as a potential contractual requirement, no longer as a "hosted in Morocco" sales argument (that commercial position is a named, accepted loss — see ADR-ZS-091 Consequences). |
| Priority | Must |
| Version | MVP |
| Traceability | ADR-ZS-091, ADR-ZS-007 (superseded baseline), historical items Q-08, H-06, H-18 (`spec/appendices/01-review-history.md`) |
| Actors | Platform; schools (beneficiaries of the commitment) |

#### SEC-ZS-025: Maintain a cross-region EU disaster recovery plan

| Attribute | Value |
|---|---|
| Description | **Redefined by [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md) (Accepted, 2026-09-09):** a cross-region EU disaster recovery plan is established: replication or backup copy from the primary `eu-central-1` region to a second EU region, `eu-west-3` (Paris — `spec/stack.md` §3 risk 3), a documented failover procedure, recovery time (RTO 8 hours) and maximum data loss (RPO 15 minutes) objectives that apply only to a region-level disaster (arbitration D5, ADR-ZS-066i; NFR-ZS-008's 99.5% SLA is understood as excluding a region-level disaster), and an annual failover test. Data never leaves the EU/EEA at any point in this plan, preserving the CNDP EU-adequacy basis. The business-continuity plan covers degraded mode: communication to schools, offline operation of mobile apps (attendance and grading tolerant of outages), and return to normal. |
| Priority | Must |
| Version | V1 (full disaster recovery plan with failover and annual test); daily replication of encrypted backups to `eu-west-3` applies from MVP onward (SEC-ZS-026, INT-ZS-036 — ADR-ZS-066h) |
| Traceability | ADR-ZS-091, ADR-ZS-007 (superseded baseline), historical items H-18, Q-08; ADR-ZS-066h, ADR-ZS-066i; `spec/appendices/01-review-history.md` |
| Actors | Platform; schools informed of the commitments |

#### SEC-ZS-026: Encrypt backups and guarantee their residency in the EU

| Attribute | Value |
|---|---|
| Description | **Redefined by [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md) (Accepted, 2026-09-09):** backups are encrypted (SEC-ZS-015), kept within the EU (`eu-central-1`), and replicated daily to `eu-west-3` from MVP onward (INT-ZS-036, ADR-ZS-066h; the MVP fallback RPO of 24 hours is recorded in the pilot agreement); the full recovery plan is covered by SEC-ZS-025. Operational thresholds — daily frequency, at least 30-day retention, quarterly restore tests — are carried by requirements NFR-ZS-010 to NFR-ZS-011 of `spec/cross-cutting/03-non-functional-requirements.md`, without duplication here. On-demand restoration after an incident (for example a massive accidental deletion) remains possible, logged (INV-ZS-090), with the school informed of the scope restored and any potential loss between the last backup and the incident. |
| Priority | Must |
| Version | MVP |
| Traceability | ADR-ZS-091, `spec/appendices/00-project-baseline.md` §9 (encrypted backups), INV-ZS-090, ADR-ZS-007 (superseded baseline); thresholds and restore tests: NFR-ZS-010, NFR-ZS-011 (`spec/cross-cutting/03-non-functional-requirements.md`) |
| Actors | Platform; the affected school in case of an on-demand restore |

```gherkin
Feature: On-demand restoration after a massive accidental deletion
  Scenario: Logged restoration with the school informed
    Given a school hit by a massive accidental deletion
    When the platform restores the school's data from backup
    Then the operation is logged in the audit log
    And the school is informed of the scope restored and of any loss since the last backup
```
_Acceptance: `@REQ-ZS-425`, `features/cross-cutting/sec/req-zs-425-on-demand-restoration.feature` (covers SEC-ZS-026)._

#### SEC-ZS-013: Manage security incidents and notify breaches

| Attribute | Value |
|---|---|
| Description | Every security incident (intrusion, leak, suspected leak, massive error affecting personal data) is recorded in an incident log with a classification, severity, actions, and closure. In the event of a personal-data breach, ZSchool (as processor, ADR-ZS-027) notifies the controlling school, assists it with its obligations (informing data subjects where applicable), and keeps an enforceable register; since positive law does not impose a notification deadline (historical hypothesis H-05), the deadline is a contractual commitment of 72 hours entered in the pilot agreement (CNF-ZS-002) and then in the commercial contract (OQ-ZS-274 resolved). Every breach triggers a post-incident review and tracked corrective actions. |
| Priority | Must |
| Version | MVP (operational handling, contractual 72-hour notification); V1 (tooled register) |
| Traceability | `spec/appendices/00-project-baseline.md` §9 (incident log and breach notification), ADR-ZS-027, historical hypothesis H-05 |
| Actors | Platform; the affected schools' principal's office; data subjects where applicable |

### 3.8 Application security

#### SEC-ZS-027: Maintain an application security program

| Attribute | Value |
|---|---|
| Description | Development applies systematic code reviews with checks on critical points (access control, tenant isolation, secrets management). A first independent penetration test is conducted before pilot activation (RDM-ZS-001, ADR-ZS-066g), then a second before commercial launch (V1), then periodically (at least annually, and after any major overhaul). Vulnerabilities are triaged by severity with contractual remediation deadlines (critical: emergency fix within 72 hours; high: within 15 days; medium and low: within the current cycle), dependencies are tracked and updated, secrets are managed outside the codebase, and test environments never use real data without prior anonymization. |
| Priority | Must |
| Version | MVP (first penetration test before RDM-ZS-001; internal practices from development onward); V1 (periodic program) |
| Traceability | `spec/appendices/00-project-baseline.md` §9 (code reviews, periodic penetration tests, vulnerability management); ADR-ZS-066g |
| Actors | Platform |

#### SEC-ZS-011: Rate-limit and guard against abuse

| Attribute | Value |
|---|---|
| Description | Sensitive entry points carry rate limiting per account, per number, and per source: issuing and verifying one-time codes (protecting SMS costs and accounts), login attempts, search and matching functions (complementing SEC-ZS-010), bulk downloads and exports. Excesses trigger throttling then a temporary, logged block; abnormal volumes generate an alert (SEC-ZS-013). Rate limiting extends to the public API once it ships (V2). |
| Priority | Must |
| Version | MVP (authentication, claim, and search); generalized in V1; public API: V2 |
| Traceability | `spec/appendices/00-project-baseline.md` §9 (rate limiting, public API in V2), INV-ZS-090 |
| Actors | Platform |

### 3.9 Data lifecycle

#### SEC-ZS-028: Apply retention periods, deletion, and anonymization

| Attribute | Value |
|---|---|
| Description | ADR-ZS-003's default retention periods are applied automatically by data type: permanent for enrollment registers, year-end decisions, report cards, transcripts, and certificates; ten years for financial documents, never before the account is settled (INV-ZS-018, ADR-ZS-066u); end of schooling plus two years then anonymization for attendance and discipline; end of schooling plus one year then deletion for health; two years for messages and notifications; five years for audit logs; anonymization of accounts with no active relationship after three years of inactivity. The right to erasure is exercised by **anonymizing the global identity**, never by deleting the school's registers (INV-ZS-086, INV-ZS-037); every school keeps an identity snapshot in its enrollment register (first and last name in both scripts, date of birth, Massar code) for the register's permanent retention period (INV-ZS-004, ADR-ZS-053); files (documents, records) past their retention period are deleted with the operation logged. Schools may adjust the periods within legal limits (ADR-ZS-003); adjustments and executions are logged. |
| Priority | Must |
| Version | MVP (default retention periods); fine-grained school-level configuration: V1 |
| Traceability | INV-ZS-086, ADR-ZS-003, historical gap G-28, INV-ZS-037; `spec/appendices/01-review-history.md` |
| Actors | Platform; school principal's office for adjustments |

#### SEC-ZS-019: Export and purge data upon termination

| Attribute | Value |
|---|---|
| Description | Upon a school's termination (including closure or loss of authorization, historical gap G-33), the platform provides a **full export** of data and documents in an open format (`DataExport` entity), switches the school's access to read-only for 90 days, then deletes operational data 12 months after termination (ADR-ZS-004, INV-ZS-045). Individuals retain their global identity and access to their published documents (INV-ZS-080). The school's audit log follows its own five-year retention (SEC-ZS-018); the export, the switch to read-only, and the deletion are logged and reported to the school. |
| Priority | Must |
| Version | V1 |
| Traceability | ADR-ZS-004, historical gap G-33, INV-ZS-080, INV-ZS-045, ADR-ZS-003; `spec/appendices/01-review-history.md` |
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
_Acceptance: `@REQ-ZS-426`, `features/cross-cutting/sec/req-zs-426-termination-export-and-purge.feature` (covers SEC-ZS-019)._

### 3.10 Additions from the September 9, 2026 review

#### SEC-ZS-004: Change number, recover access, detect a recycled number, secure the claim flow

| Attribute | Value |
|---|---|
| Description | (a) **Self-service number change**: OTP on both the old and the new number; immediate effect on the login identifier and contacts; notification to schools with an active relationship. (b) **Lost or disconnected number**: recovery at the front desk of a school with an active relationship (enrollment, affiliation, or parental link): identity check by the registrar's office (document presented, questions about the record), the principal's approval, the new number recorded, logged, other affected schools notified; for a principal-track role, validation by ZSchool support on a ticket (SEC-ZS-009). (c) **Recycled-number detection**: after six months with no login, or repeated OTP failures, or when an OTP is requested from an unknown device on an inactive account, access requires a knowledge challenge (date of birth of a linked child, entered and not displayed; for a teacher, their affiliated school) before any session opens; a failure locks the account, alerts the schools, and enforces procedure (b). (d) **Identity claim (BEH-ZS-028)**: the invitation code alone is not enough; the claimant must enter a piece of undisplayed knowledge (the child's date of birth); the school can revoke a claim and reissue an invitation, with the revocation immediately removing access. All these operations are logged (SEC-ZS-017). Functional owner: BEH-ZS-020 (`spec/behaviors/01-administration-onboarding-subscription.md`). |
| Priority | Must |
| Version | MVP |
| Traceability | ADR-ZS-022, INV-ZS-055, INV-ZS-063, INV-ZS-030, INV-ZS-044, INV-ZS-003; ADR-ZS-048, ADR-ZS-049; BEH-ZS-020, BEH-ZS-028; SEC-ZS-002, SEC-ZS-007 |
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
_Acceptance: `@REQ-ZS-427`, `features/cross-cutting/sec/req-zs-427-recycled-number-and-self-service-change.feature` (covers SEC-ZS-004)._

#### SEC-ZS-003: Password policy, OTP rate limiting, and SIM-swap awareness

| Attribute | Value |
|---|---|
| Description | The email-and-password channel applies: a minimum length of 12 characters, checking against compromised-password lists, no arbitrary composition rule, progressive lockout after failures (increasing delays then a temporary, logged block), storage via a suitable derivation function. OTP issuance is rate-limited per account, per number, and per source (complementing SEC-ZS-011); a spike of OTPs on a number triggers an alert. The risk analysis documents SIM-swap and OTP interception: the most sensitive operations (number change, resetting a privileged role, signing the parent contract INT-ZS-031) require a second element (trusted device, knowledge challenge, or front-desk validation). |
| Priority | Must |
| Version | MVP |
| Traceability | `spec/appendices/00-project-baseline.md` §9; ADR-ZS-066n; SEC-ZS-002, SEC-ZS-007, SEC-ZS-011 |
| Actors | Platform; all actors with an account |

## 4. CNDP formalities per processing activity

The tables below govern the formalities register kept by the SEC-ZS-001 assistant. They are consolidated in `spec/cross-cutting/07-legal-compliance-data-protection.md` (legal analysis `CNF-ZS-…`); the assistant materializes them per school with tracking of receipts and deadlines.

### 4.1 Processing carried out by the school (controller: the school; ZSchool: processor, ADR-ZS-027)

| Processing activity | Purposes | Data categories | Formality required | Alert triggers (SEC-ZS-001) | Version |
|---|---|---|---|---|---|
| School records (enrollment, attendance, assessments, report cards, discipline, documents) | Managing enrollment and schooling | Civil status, Massar code, schooling data, contact details of students, guardians, and staff | F211 declaration, or F214 if it matches a CNDP resolution | Collecting national ID numbers, health data, biometrics, interconnection | MVP |
| Communication with families | Notifications, notices, reminders, moderated threads | Contact identity, message content | Same declaration; WhatsApp transfer at MVP on express consent with a transfer notice (ADR-ZS-066c) and F118 filed in parallel (template provided, SEC-ZS-023; CNF-ZS-001 timeline) | New vendor outside the adequacy list | MVP (express consent + F118 in parallel) |
| Finance and collections | Billing, payments, reminders, receipts | Financial data, payment plans | F211 declaration (or F214) | — | MVP |
| Collection of national ID numbers | Identifying adults (staff, file documents) | National ID number, identity documents | Prior F112 authorization (filed before December 15, 2026, CNF-ZS-001) | Activating national ID collection | After obtaining F112; field disabled at MVP until the authorization is on record (ADR-ZS-066a) |
| Push notifications (Google FCM and Apple APNs services, outside Morocco) | Notifying families and staff | Device token, minimal notification content | F118 in the school's name or documented express consent; entry in the sub-processor register (CNF-ZS-012) | Activating the push channel | V1 (ADR-ZS-066d) |
| Health record (future module) | School medical follow-up | Health data | Prior F112 authorization | Activating any health data | V2+ |
| Interconnections (student passport, ministry data exchanges) | Consented inter-school sharing, statutory reporting obligations | Consented scope (INV-ZS-083) | Authorization in case of file interconnection; data subjects' express consent | Setting up an interconnection | V2+ |

Biometrics note: no biometrics appear on the roadmap; any school request is refused on the platform (biometrics would require a CNDP authorization and a product decision outside the historical baseline) — see OQ-ZS-277.

### 4.2 ZSchool's own processing (controller: ZSchool, ADR-ZS-027)

| Processing activity | Purposes | Data categories | Formality required | Version |
|---|---|---|---|---|
| Global identity and accounts (`User`, `Person`, profiles, relationships, `ConsentGrant`) | Service delivery, matching, account security | Identity, contacts, authentication data | F211 declaration (or F214) in ZSchool's name | MVP |
| Audit logs, operations, logged support | Security, compliance, audited support | Accounts, access, tickets | F211 declaration | MVP (writes, security, support — D4; sensitive views: V1) |
| Technical monitoring (application logs, error reporting, metrics) | Operations, diagnostics | Technical identifiers, correlation identifiers, never school content | F211 declaration; any tool hosted outside Morocco entered in the sub-processor register with a transfer basis, otherwise not used (ADR-ZS-066d) | MVP |
| Notifications via Moroccan SMS aggregator | Invitations, one-time codes, alerts | Phone number, student's first name (minimized) | F211 declaration; no transfer outside Morocco | MVP |
| Minimal public school directory | Teacher network, transfers | Name, city, cycles at MVP; systems, website afterward (INV-ZS-075) | F211 declaration (or F214) | MVP (minimal read-only directory: name, city, cycles — needed for the MVP transfer flow; arbitration logged in `spec/behaviors/10-teacher-career-network.md`); enrichments and network features: V2+ |
| Teacher professional network | Applications, availability | Shared professional profile, consent (INV-ZS-087) | F211 declaration (or F214) | V2+ |
| Student passport | Consented portability between schools | Per express consent | F211 declaration (or F214); F112 tier-change alert if national ID or health data | V2+ |

### 4.3 Common rules

- Formalities are free of charge; filed online via CNDP-FORMS; declaration receipt within 24 hours; possible reclassification as an authorization within 8 days.
- Declarations filed by ZSchool do not exempt the school from its own formalities (ADR-ZS-027): the SEC-ZS-001 assistant keeps the two registers separately.
- Transfers: the current adequacy list (Deliberation No. 236-2015: European Union and EEA excluding Croatia, the United Kingdom, Switzerland, Canada) exempts from F118; outside the list, F118 in the controller's name (2-month delay, extendable) or the data subject's documented express consent. Hosting and backups now sit in the EU (`eu-central-1`/`eu-west-3`, ADR-ZS-091), themselves exempt via the adequacy list rather than requiring F118 (SEC-ZS-024); the flows still requiring the F118/express-consent analysis are those to non-adequacy-listed vendors in the register (SEC-ZS-023): messaging, push in V1, any external monitoring.
- Timeline before pilot activation (RDM-ZS-001): F211 for each pilot and for ZSchool, F112 for national ID, F118 for messaging, all filed before December 15, 2026 (CNF-ZS-001, ADR-ZS-066b).
- Retention periods entered in declarations are those of ADR-ZS-003 (SEC-ZS-028).

## Open questions

Open questions raised by this chapter are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration; this file's own resolved items are OQ-ZS-271 through OQ-ZS-277).

## Traceability

Full cross-reference coverage for this chapter is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
