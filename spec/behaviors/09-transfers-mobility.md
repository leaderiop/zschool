> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-09                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification                                      |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/18-transfers-mobility.md` (v0.3), old `FR-TRA-01..13` -> `BEH-ZS-201..213`, old `ECR-TRA-01..07` -> `SCR-ZS-111..117`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Transfers and Mobility (TRA)

## 1. Objective and scope

**Objective.** The TRA module implements school mobility between institutions, building on ZSchool's founding promise: a global identity per student that survives changes of school. A transfer is not a data migration but a **succession of relationships**: the origin enrollment is closed with status TRANSFERRED **at the exact moment the destination enrollment is activated** (a single transaction, [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)), the destination enrollment is created on the same `Person` ([INV-ZS-023](../invariants.md#inv-zs-023)), and the destination never sees anything beyond what the legal guardian (or the adult student) has consented to share ([INV-ZS-082](../invariants.md#inv-zs-082)). A departure that takes effect at the following school year's start is not a mid-year transfer: the year-N enrollment closes as COMPLETED with its year-end decision ([INV-ZS-059](../invariants.md#inv-zs-059)), with no year-N+1 enrollment at the origin ([ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)).

Business objective: smooth departures and arrivals (the flow concentrates in June-September, JMP-ZS-009) without data leakage, without wrongfully blocking departures over unpaid balances ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)), and with a complete end-to-end audit trail.

**Scope included:**

| Capability | Version | References |
|---|---|---|
| Transfer request initiated by any legal guardian, the custodian, or the adult student (from their account), or by the ZSchool destination school; the legal tutor's signature (or the adult student's) is required at validation | MVP | [INV-ZS-066](../invariants.md#inv-zs-066); [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md) |
| File statuses: initiated, consent recorded, validated by the origin, accepted by the destination, activated, declined (by the destination only, for bounded reasons), cancelled, expired (30 days after validation with no activation) | MVP | [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md) |
| Choice of the shared scope by the legal guardian or the adult student, on the default transfer profile, with a consent log (`ConsentGrant`) | MVP | [INV-ZS-082](../invariants.md#inv-zs-082), [INV-ZS-083](../invariants.md#inv-zs-083); [INV-ZS-022](../invariants.md#inv-zs-022), [INV-ZS-012](../invariants.md#inv-zs-012) |
| Validation by the origin school: balance, with an account statement handed to the financial guardian (BEH-ZS-174, MVP), return of loaned equipment, leaving certificate; the origin may decline only for a missing legal tutor signature, never for financial reasons | MVP | [INV-ZS-062](../invariants.md#inv-zs-062); [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md); [ADR-ZS-061](../decisions/061-finance-rules-batch.md), [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md) |
| Closing the origin enrollment as TRANSFERRED and activating the destination enrollment on the same identity, in a single transaction; a departure taking effect the following school year is handled as COMPLETED + no year-N+1 enrollment | MVP | [INV-ZS-007](../invariants.md#inv-zs-007), [INV-ZS-023](../invariants.md#inv-zs-023); [ADR-ZS-044](../decisions/044-state-machine-refinements.md), [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md) |
| Intra-group transfer (two tenants of the same `Organization`): same procedure, same default profile; overseen by group leadership | MVP (procedure); V1 (consolidated view, [INV-ZS-073](../invariants.md#inv-zs-073)) | [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md) |
| Destination school's access strictly limited to the shared scope | MVP | [INV-ZS-082](../invariants.md#inv-zs-082); [INV-ZS-035](../invariants.md#inv-zs-035) |
| Reference to the Massar procedure outside ZSchool: a field plus an archived document | MVP (field); V1 (consolidated log) | H-04 (`spec/appendices/01-review-history.md`) |
| Exit package for a non-ZSchool school: bilingual PDF | MVP | [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md) |
| Exit package: time-limited secure link with verification QR code | V1 | [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md); Q-15 (`spec/appendices/01-review-history.md`) |
| The receivable stays with the origin school on every transfer (no automatic transfer of debt); pro-rata for the month of transfer follows BEH-ZS-153; the student is counted only once in `UsageMetric` for the month of transfer, at the origin | MVP | [INV-ZS-062](../invariants.md#inv-zs-062), C-10 (`spec/appendices/01-review-history.md`); [ADR-ZS-061](../decisions/061-finance-rules-batch.md) |
| Real transfer of unpaid balances between two sites of the same group (option, with the financial guardian's agreement) | V2+ (option) | see OQ-ZS-121 in `spec/open-questions.md` |
| Read-only access after closure with a correction grace period (default: 60 days) | MVP | [INV-ZS-084](../invariants.md#inv-zs-084), [INV-ZS-024](../invariants.md#inv-zs-024) |
| Notifications across the transfer lifecycle (in-app, SMS) | MVP | V1: WhatsApp, push ([ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)) |
| Time-stamped timeline for every transfer (immutable logging of entries from MVP, historical alias D4); log of shared-scope views and audit export | MVP (timeline, entries); V1 (views, full audit) | [INV-ZS-090](../invariants.md#inv-zs-090); [INV-ZS-019](../invariants.md#inv-zs-019); [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md) |

**Out of scope:**

| Item | Reason and reference |
|---|---|
| Carrying out the Massar procedure itself (filing the request, provincial validation) | Outside ZSchool in V1; TRA only records the reference and the supporting document (H-04, `spec/appendices/01-review-history.md`) |
| Digital school passport | V2+; `ConsentGrant` is already set up to serve as its foundation |
| Generating and managing official documents (templates, numbering, seal) | Documents module (`spec/behaviors/06-documents-certificates.md`); TRA triggers the leaving certificate and references it |
| Balance accounting, billing, reminders | Finance module (`spec/behaviors/07-finance-billing-collections.md`); TRA consumes the account statement and does not write finance data (except for the group unpaid-balance transfer option, V2+) |
| Health data | Never transferred, never displayed, never exported by TRA ([ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md); [INV-ZS-083](../invariants.md#inv-zs-083)); no consent checkbox exists for it |
| Internal data (unpublished grades, drafts, deliberations, ongoing disciplinary proceedings, staff observations) | Never portable ([INV-ZS-081](../invariants.md#inv-zs-081); [INV-ZS-034](../invariants.md#inv-zs-034)); outside the sharing scope |
| Teacher and staff mobility | Career module (`spec/behaviors/10-teacher-career-network.md`); affiliation is governed by its own invariants |
| A student arriving from a non-ZSchool school (declared prior history, paper documents) | Enrollment module: BEH-ZS-046 (`spec/behaviors/02-admissions-enrollment-reenrollment.md`); TRA only handles departures and arrivals between ZSchool schools |
| Bulk transfers initiated by the origin when a school closes | V1, with BEH-ZS-013 (`spec/behaviors/01-administration-onboarding-subscription.md`); the single-file flow in this chapter applies to each student |

## 2. Users and use cases

| Actor | Role in the transfer | Key rights |
|---|---|---|
| Legal tutor (parent account) | May initiate the request; chooses the shared scope and signs the consent; receives the leaving certificate | Required signatory for the transfer and the leaving certificate ([INV-ZS-066](../invariants.md#inv-zs-066); [INV-ZS-028](../invariants.md#inv-zs-028)); may revoke a consent, with revocation covering future access ([INV-ZS-012](../invariants.md#inv-zs-012)) |
| Other legal guardian or custodial parent who is not the legal tutor (e.g. custodial mother) | May initiate the request, which is then forwarded to the legal tutor for signature; views the file and obtains administrative school documents (self-service certificate of enrollment) | Does not sign the transfer consent if a legal tutor is on record; in case of conflict, the school arbitrates and may request a court ruling ([INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-068](../invariants.md#inv-zs-068)); does not receive the account statement unless they are the financial guardian |
| Financial guardian (tutor or third party) | Receives the account statement at departure (BEH-ZS-174) | Sole recipient of the financial situation (`spec/cross-cutting/01-permissions.md`) |
| Adult student (18 years or older) | Initiates, chooses the scope, and signs in place of the guardians | Holds their own account and rights ([INV-ZS-082](../invariants.md#inv-zs-082), [INV-ZS-083](../invariants.md#inv-zs-083); [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)) |
| Origin school leadership | Validates the request (checklist: balance, equipment, certificate, Massar reference); the closure to TRANSFERRED is executed by the platform when the destination activates | May decline only for a missing legal tutor signature; never for an unpaid balance; the leaving certificate is always issuable ([INV-ZS-062](../invariants.md#inv-zs-062), [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md); [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)) |
| Origin front office | Prepares documents, issues the statement and exit package, tracks the timeline | Scope limited by the permissions matrix (`spec/cross-cutting/01-permissions.md`) |
| Destination ZSchool school | May initiate the request; accepts or declines (bounded reasons: capacity, unauthorized cycle, incomplete file); receives the consented scope; prepares then activates the destination enrollment on the existing identity | No automatic access to the origin file outside the shared scope ([INV-ZS-082](../invariants.md#inv-zs-082); [INV-ZS-035](../invariants.md#inv-zs-035)); activation triggers the origin's closure ([ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)) |
| Non-ZSchool destination school | Receives the exit package (PDF or secure link) presented by the family | No ZSchool account; access via link, without internal authentication |
| Multi-site group leadership (V1) | Oversees intra-group transfers (same procedure, same default profile, [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)); may enable the cross-site unpaid-balance transfer (V2+ option, OQ-ZS-121) | Consolidated views without merging tenant data ([INV-ZS-073](../invariants.md#inv-zs-073)) |

Typical use cases: a move requiring a change of school mid-year; moving from primary to middle school at a different institution; a parental relocation in June for the following school year (year N closes COMPLETED); departure to a school not using ZSchool (paper exit package); rebalancing a student between two sites of the same group with the receivable tracked; a request validated but never activated by the destination (expiry, the student stays ACTIVE at the origin); the destination declining for lack of space.

Persona needs served: [URS-ZS-034](../urs.md) and [URS-ZS-037](../urs.md) (a single parent account for multiple children across multiple schools, including during and after a transfer), [URS-ZS-002](../urs.md) (the receivable stays managed after departure), the custodial mother's persona need (she obtains administrative documents in line with the ministry's position, [INV-ZS-066](../invariants.md#inv-zs-066)) — `spec/urs.md`.

## 3. Key journeys

The reference journey is **JMP-ZS-009 — Inter-school ZSchool transfer and non-ZSchool exit package** (journeys/00-journey-map.md, built in Phase 3): request, consent, validation, closure to TRANSFERRED, creation of the destination enrollment, exit package. Version: MVP for a simple transfer between two ZSchool schools and the PDF exit package; V1 for the time-limited secure link with QR code ([ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md)).

The detailed per-persona steps (request and scope selection on the parent side, validation and closure on the leadership and front-office side) are described in the persona journey files (journeys/01 through journeys/07, built in Phase 3); this chapter does not duplicate them. This module defines the requirements and screens; it assumes the enrollment state machine described in `spec/domain-model.md` §3 (ACTIVE or SUSPENDED → TRANSFERRED transitions) and the invariants from the same file. A student arriving from a non-ZSchool school falls under BEH-ZS-046 (`spec/behaviors/02-admissions-enrollment-reenrollment.md`).

## 4. Functional behaviors

| ID | Title | Priority |
|---|---|---|
| BEH-ZS-201 | Initiate a transfer request from the parent or the destination school | Must |
| BEH-ZS-202 | Transfer file: tracking, statuses, and documents | Must |
| BEH-ZS-203 | Choose the shared scope on the default transfer profile | Must |
| BEH-ZS-204 | Revocable and bounded consent log | Must |
| BEH-ZS-205 | Validation by the origin school: balance, equipment, certificate | Must |
| BEH-ZS-206 | Close as TRANSFERRED and create the destination enrollment on the same identity | Must |
| BEH-ZS-207 | Destination school's access limited to the shared scope | Must |
| BEH-ZS-208 | Reference to the non-ZSchool Massar procedure | Must |
| BEH-ZS-209 | Exit package for a non-ZSchool school | Must |
| BEH-ZS-210 | Keep the receivable with the origin school; cross-site transfer as a V2+ option | Should |
| BEH-ZS-211 | Read-only access after closure with a 60-day grace period | Must |
| BEH-ZS-212 | Notifications across the transfer lifecycle | Must |
| BEH-ZS-213 | Transfer log and audit trail | Must |

### BEH-ZS-201: Initiate a transfer request from the parent or the destination school

> **Invariant:** [INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-075](../invariants.md#inv-zs-075), [INV-ZS-082](../invariants.md#inv-zs-082)
> **See:** G-08 (`spec/appendices/01-review-history.md`), [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-181`](../../features/tra/fr-tra-01-transfer-request-initiation.feature)

REQUIREMENT: A transfer MUST be initiable either (a) by a legal guardian, the custodian, or
             the adult student from their account, choosing the child, a destination school
             from the minimal public read-only directory or a declared non-ZSchool
             destination, a desired effective date, and an optional reason; or (b) by the
             destination ZSchool school identifying the sought student (by Massar code or
             matching, with anti-enumeration protection) and sending the request to the
             origin school. In case (b), no file content MUST be transmitted before the
             legal tutor's consent. When the initiator is not the legal tutor (nor the
             adult student), the request MUST be forwarded to the legal tutor for signature
             before any validation; the initiator MUST be informed. The origin school MUST
             be notified of the request.

Data leakage during initiation is the primary risk this requirement guards against: a destination school searching by Massar code gets no usable result outside an exact, consented match. The origin school being notified immediately keeps the process transparent even before any consent is recorded.

### BEH-ZS-202: Transfer file: tracking, statuses, and documents

> **Invariant:** [INV-ZS-060](../invariants.md#inv-zs-060), [INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-182`](../../features/tra/fr-tra-02-transfer-file-lifecycle.feature)

REQUIREMENT: Each transfer MUST be carried by an identified `TransferRequest` file, visible
             to both schools, the legal tutor, and the initiator, with a time-stamped
             timeline, moving through the statuses initiated, consent recorded, validated by
             the origin, accepted by the destination, activated, declined (by the
             destination only, for a mandatory reason from a bounded list — capacity
             reached, unauthorized cycle or section, incomplete file), cancelled (by the
             legal tutor or the adult student at any time before activation), or expired (30
             configurable days after origin validation with no destination activation, the
             student staying ACTIVE at the origin). The origin MUST have no decline option,
             only a "missing legal tutor signature" block. The file MUST be kept regardless
             of its final state (never deleted). A new request MAY be initiated after a
             decline, cancellation, or expiry.

The file brings together destination, effective date, reason, and documents (leaving certificate, Massar reference and document, any supporting evidence; the account statement is only attached for the financial guardian). Decline, cancellation, and expiry are notified to the parties and logged in the timeline.

### BEH-ZS-203: Choose the shared scope on the default transfer profile

> **Invariant:** [INV-ZS-082](../invariants.md#inv-zs-082), [INV-ZS-083](../invariants.md#inv-zs-083)
> **See:** [ADR-ZS-019](../decisions/019-disciplinary-and-health-data-not-portable.md), [ADR-ZS-001](../decisions/001-adult-student-account-holder.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-183`](../../features/tra/fr-tra-03-shared-scope-consent.feature)

REQUIREMENT: Before any transmission, the legal tutor (or the adult student) MUST choose the
             shared scope from a pre-checked default profile: identity (civil status in dual
             script, photo), Massar code, schools attended, years, levels and year-end
             decisions, official documents (leaving certificate, year-end transcripts).
             Detailed grades, attendance, and disciplinary data (a summary, within the
             limits allowed — see OQ-ZS-124) MUST be strictly opt-in and separate. Health
             data MUST NOT appear and MUST NOT be shareable. Unpublished internal data MUST
             be excluded by default. The chosen scope MUST apply only to the designated
             destination.

"Schools attended" is derived from enrollments known to the platform; prior schooling outside ZSchool appears there with the note "declared, unverified" when it was entered via the enrollment module's declared-prior-history flow.

### BEH-ZS-204: Revocable and bounded consent log

> **Invariant:** [INV-ZS-012](../invariants.md#inv-zs-012), [INV-ZS-082](../invariants.md#inv-zs-082), [INV-ZS-083](../invariants.md#inv-zs-083), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)
> **Priority:** Must
> **Version:** MVP (entries); V1 (log of views)
> **Acceptance:** [`@REQ-ZS-184`](../../features/tra/fr-tra-04-consent-revocation.feature)

REQUIREMENT: Each sharing consent MUST be a logged `ConsentGrant` (timestamp, identified
             consenting party, recipient, exact scope, duration, basis "transfer"),
             immutable once recorded. It MUST be time-bounded (default: the length of
             enrollment at the destination school, configurable) and revocable at any time
             by the consenting party from their account; revocation MUST cover future access
             without erasing official documents already transmitted in the procedure. Entries
             about the consent (grant, change, revocation) MUST be logged immutably from
             MVP; logging of the destination's views of the shared scope is a V1 audit-log
             capability (historical alias D4). The consenting party MUST receive a
             notification of the grant and of the revocation.

### BEH-ZS-205: Validation by the origin school: balance, equipment, certificate

> **Invariant:** [INV-ZS-062](../invariants.md#inv-zs-062), [INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-016](../invariants.md#inv-zs-016)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [ADR-ZS-061](../decisions/061-finance-rules-batch.md), [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-185`](../../features/tra/fr-tra-05-origin-validation.feature)

REQUIREMENT: The origin school's leadership MUST validate the request at the end of a
             checklist: (a) financial situation checked and the account statement handed to
             the financial guardian (BEH-ZS-174, never to a guardian who is not the payer) —
             a nonzero balance MUST NOT prevent validation or the issuance of the
             certificate; the only validation condition MUST be the legal tutor's or the
             adult student's signature; (b) return of loaned equipment confirmed item by
             item, with missing items noted; (c) leaving certificate generated, bilingual,
             numbered, signed under the documents module's mechanism; (d) reference and
             document of the Massar procedure recorded — validation MUST be possible without
             this reference, with an explicit "pending" note. Validation MUST record the
             status "validated by the origin"; actual closure only occurs on activation by
             the destination.

### BEH-ZS-206: Close as TRANSFERRED and create the destination enrollment on the same identity

> **Invariant:** [INV-ZS-007](../invariants.md#inv-zs-007), [INV-ZS-018](../invariants.md#inv-zs-018), [INV-ZS-023](../invariants.md#inv-zs-023), [INV-ZS-054](../invariants.md#inv-zs-054), [INV-ZS-058](../invariants.md#inv-zs-058), [INV-ZS-059](../invariants.md#inv-zs-059), [INV-ZS-060](../invariants.md#inv-zs-060), [INV-ZS-062](../invariants.md#inv-zs-062), [INV-ZS-067](../invariants.md#inv-zs-067)
> **See:** [ADR-ZS-002](../decisions/002-single-active-enrollment-per-year.md), [ADR-ZS-044](../decisions/044-state-machine-refinements.md), [ADR-ZS-063](../decisions/063-transfer-lifecycle-rules.md)
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-186`](../../features/tra/fr-tra-06-closure-and-destination-enrollment.feature)

REQUIREMENT: As soon as the destination accepts, the destination enrollment MUST be prepared
             (PRE-ENROLLED) on the existing `Person` (no new identity) and follow the normal
             path of the enrollment module, the shared scope pre-filling what was consented
             to. Activation of the destination enrollment (complete file, initial payment, at
             the earliest on the effective date) and the ACTIVE-or-SUSPENDED → TRANSFERRED
             transition of the origin enrollment MUST be executed in a single transaction:
             both operations MUST succeed or fail together, so the student is never without
             an ACTIVE enrollment nor holds two ACTIVE enrollments at once. Until activation
             occurs, the origin MUST stay ACTIVE and the student MUST appear on its
             attendance lists; without activation within the deadline, the file expires.
             Departure at the following school year's start is NOT a TRANSFERRED
             transition: the year-N enrollment MUST close COMPLETED with its `YearDecision`
             at rollover, no year-N+1 enrollment MUST be created at the origin, and the
             transfer file serves as the basis for the year-N+1 enrollment at the
             destination.

Closure records the reason "transfer", the date, and the destination school. The origin's financial relationship survives closure until settled; the transfer-month pro-rata follows BEH-ZS-153 and the student is only counted once in `UsageMetric` for that month, at the origin. The parent-student relationship is global and is not duplicated ([INV-ZS-067](../invariants.md#inv-zs-067)). The `TransferValidated` event is emitted upon activation.

### BEH-ZS-207: Destination school's access limited to the shared scope

> **Invariant:** [INV-ZS-032](../invariants.md#inv-zs-032), [INV-ZS-035](../invariants.md#inv-zs-035), [INV-ZS-082](../invariants.md#inv-zs-082), [INV-ZS-090](../invariants.md#inv-zs-090)
> **See:** [ADR-ZS-018](../decisions/018-data-ownership-author-and-subject.md), [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)
> **Priority:** Must
> **Version:** MVP (access restriction); V1 (log of views)
> **Acceptance:** [`@REQ-ZS-187`](../../features/tra/fr-tra-07-destination-bounded-access.feature)

REQUIREMENT: The destination school MUST view an "incoming student" file composed
             exclusively of the consented scope: identity, Massar code, enrollment history,
             transmitted official documents, and any checked opt-in blocks. No other origin
             data MUST be visible, listable, or exportable; there MUST be no "full history"
             view on the destination side. Every view MUST be logged on the origin side and
             visible to the legal tutor in their consent history starting in V1 (at MVP, the
             access restriction applies in full but only entries are logged). Any request for
             data outside the scope MUST go through a request addressed to the legal tutor,
             who consents or declines.

### BEH-ZS-208: Reference to the non-ZSchool Massar procedure

> **Invariant:** none
> **See:** H-04, G-08 (`spec/appendices/01-review-history.md`)
> **Priority:** Must (field and document); Should (consolidated log)
> **Version:** MVP (field and document); V1 (log)
> **Acceptance:** [`@REQ-ZS-188`](../../features/tra/fr-tra-08-massar-reference.feature)

REQUIREMENT: Since the ministerial transfer procedure is carried out entirely outside
             ZSchool (no vendor API), the module MUST record a "Massar reference" field on
             the file (number or wording of the provincial education office's decision) and
             the scanned supporting document. The field MUST be optional at validation, with
             its absence flagged in an internal pending list. ZSchool MUST automate no
             filing. A consolidated, filterable, exportable log of transfers with Massar
             references MUST be available to school leadership in V1.

The screen indicates the outside-platform procedure for information: request filed by the tutor from their Massar parent portal with documents, followed by provincial validation.

### BEH-ZS-209: Exit package for a non-ZSchool school

> **Invariant:** [INV-ZS-080](../invariants.md#inv-zs-080), [INV-ZS-083](../invariants.md#inv-zs-083)
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), [ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md), [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md), [ADR-ZS-032](../decisions/032-exit-file-for-non-zschool-transfers.md)
> **Priority:** Must
> **Version:** MVP (bilingual PDF); V1 (time-limited secure link and QR code)
> **Acceptance:** [`@REQ-ZS-189`](../../features/tra/fr-tra-09-exit-package.feature)

REQUIREMENT: When the destination does not use ZSchool, the closure (TRANSFERRED to the
             declared school, or WITHDRAWN with no destination) MUST produce an exit
             package: a single, bilingual AR/FR document compiling the default transfer
             profile — identity, Massar code, enrollment and decision history, leaving
             certificate, year-end transcripts. Opt-in blocks add consented detailed grades
             or attendance. The account statement MUST NOT be included in the exit package:
             it is handed separately to the financial guardian only. At MVP, a numbered PDF
             MUST be generated and handed to the legal tutor or the adult student. From V1
             onward, the package MUST also be exposed via a time-limited secure link
             requiring no account, with a verification QR code for authenticity and access
             tracking; the link MUST be regenerable and revocable. The document MUST be
             hosted in Morocco.

### BEH-ZS-210: Keep the receivable with the origin school; cross-site transfer as a V2+ option

> **Invariant:** [INV-ZS-018](../invariants.md#inv-zs-018), [INV-ZS-062](../invariants.md#inv-zs-062), C-10 (`spec/appendices/01-review-history.md`)
> **See:** none
> **Priority:** Should
> **Version:** MVP and V1 (receivable kept at the origin, in line with BEH-ZS-174); V2+ (option: real cross-site transfer within the same group — see OQ-ZS-121)
> **Acceptance:** [`@REQ-ZS-190`](../../features/tra/fr-tra-10-receivable-fate.feature)

REQUIREMENT: On every transfer, the receivable MUST stay with the origin school: the unpaid
             balance remains a collections receivable carried on the financial guardian's
             account at the origin tenant, tracked through reminders and the aged-balance
             report until settled; the balance MUST NOT be automatically transmitted to the
             destination school, which only knows what the account statement handed to the
             legal tutor documents. In V2+ (option), for a transfer between two ZSchool
             schools of the same `Organization` and with the explicit agreement of the
             financial guardian, the origin school's leadership MAY transfer the unpaid
             balance as an opening receivable on the destination enrollment's financial
             account; the transfer MUST be a named act, logged on both sides, never
             automatic.

Aligned with BEH-ZS-174 (`spec/behaviors/07-finance-billing-collections.md`). This is one of the corpus's "resolved via review arbitration" points (historical alias: former arbitration D2) — see the crosswalk in `spec/appendices/01-review-history.md`.

### BEH-ZS-211: Read-only access after closure with a 60-day grace period

> **Invariant:** [INV-ZS-018](../invariants.md#inv-zs-018), [INV-ZS-062](../invariants.md#inv-zs-062), [INV-ZS-084](../invariants.md#inv-zs-084), [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-024](../invariants.md#inv-zs-024)
> **See:** none
> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-191`](../../features/tra/fr-tra-11-post-closure-read-only.feature)

REQUIREMENT: After closure to TRANSFERRED (as with any closure), the origin enrollment's
             school data MUST become read-only for the school: no more entering attendance,
             grades, incidents, or file changes. During a configurable grace period (default:
             60 days), a correction MUST remain possible, and every correction during grace
             MUST be logged. After the grace period, any correction MUST require the audited
             procedure: a reasoned request from the authorized role, justification, logged
             validation, a separate entry in the history (MVP) then in the exportable audit
             log (V1). Documents already published MUST stay governed by their own
             immutability rules. The financial relationship, on the other hand, MUST stay
             active until settled.

### BEH-ZS-212: Notifications across the transfer lifecycle

> **Invariant:** none
> **See:** [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)
> **Priority:** Must
> **Version:** MVP (in-app, SMS); V1 (WhatsApp, push)
> **Acceptance:** [`@REQ-ZS-192`](../../features/tra/fr-tra-12-lifecycle-notifications.feature)

REQUIREMENT: Each step of the lifecycle MUST produce a notification addressed to the right
             parties according to the preferences and routing of the communication module:
             request initiated, consent granted or revoked, validation by the origin,
             acceptance, reasoned decline, cancellation and expiry, activation and closure,
             exit package available, account statement available, unpaid-balance transfer
             proposed and accepted (V2+, group option). Channels MUST be in-app and SMS at
             MVP, with WhatsApp and push added in V1.

Associated domain events: `TransferValidated`, `ConsentGranted`, `ConsentRevoked`, in addition to `EnrollmentStatusChanged` (`spec/domain-model.md` §7).

### BEH-ZS-213: Transfer log and audit trail

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090), [INV-ZS-012](../invariants.md#inv-zs-012), [INV-ZS-019](../invariants.md#inv-zs-019)
> **See:** [ADR-ZS-003](../decisions/003-default-retention-durations.md), [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)
> **Priority:** Must
> **Version:** MVP (per-file timeline, immutable entries); V1 (full audit log, views, export)
> **Acceptance:** [`@REQ-ZS-193`](../../features/tra/fr-tra-13-transfer-log-audit-trail.feature)

REQUIREMENT: Each file MUST carry its immutable timeline: initiation, consents (grant,
             change, revocation), destination views, validation, Massar reference, closure,
             issuance of the certificate and the exit package, financial transfers,
             corrections during grace. This timeline MUST be viewable by both schools (each
             within their own scope) and by the legal tutor; its entries MUST be immutable
             from MVP. In V1, the whole MUST be integrated into the school's exportable audit
             log (immutable, 5 years) and views of sensitive data MUST appear there.

## 5. Morocco-specific considerations

1. **Massar procedure.** A student transfer goes through a ministerial procedure outside ZSchool: a request filed from the Massar parent portal (requests section) with documents (birth certificate, transcripts, photo), validated by the provincial education office; a recent circular has removed restrictions on transfers from private to public schools (see OQ-ZS-125). Massar exposes no API (H-04, `spec/appendices/01-review-history.md`): TRA is limited to a reference field plus a document, with no automated exchange.
2. **Leaving certificate.** Official bilingual, numbered exit document, generated by the documents module (`spec/behaviors/06-documents-certificates.md`) at validation time. Law 59.21 penalizes refusal to issue certificates and attestations by up to 10,000 DH when the contract is respected: the validation checklist never has the effect of withholding the certificate ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md); [INV-ZS-016](../invariants.md#inv-zs-016)).
3. **Moudawana and parental status.** The legal tutor (by default the father; the mother in case of death, absence, or incapacity, or by ruling) is the required signatory for the transfer and the leaving certificate ([INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-028](../invariants.md#inv-zs-028)); the custodial mother may initiate the request, which is forwarded to the tutor for signature, and obtains administrative school documents in self-service, including the certificate of enrollment; conflicting requests are arbitrated by the school, which may require a ruling ([INV-ZS-068](../invariants.md#inv-zs-068)).
4. **Law 09.08 and CNDP.** The sharing consent is logged, bounded, and revocable ([INV-ZS-012](../invariants.md#inv-zs-012)); ZSchool is the data controller for global identity and consent, and the processor for schools' operational data ([ADR-ZS-027](../decisions/027-processor-and-controller-roles.md)); the exit package is hosted in Morocco, with no international-transfer formality ([ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md)).
5. **Seasonality.** Transfers concentrate in June-September (relocations, moves, orientation decisions) with a secondary mid-year flow; screens and notifications are sized for this peak.

## 6. Data and events

Entities from `spec/domain-model.md` used by the module:

| Entity | Use in TRA |
|---|---|
| `TransferRequest` | Transfer file: student, origin, destination, statuses, initiator, signatory, effective date, expiry deadline, documents, shared scope, Massar reference |
| `ConsentGrant` | Consent of the legal tutor or the adult student: scope, duration, timestamp, basis "transfer"; statuses active, expired, revoked; logged |
| `Enrollment` | Origin enrollment closed TRANSFERRED upon destination activation, or COMPLETED for a departure at the following school year's start; destination enrollment PRE-ENROLLED then ACTIVE on the same identity, CANCELLED if the file is cancelled |
| `Person`, `StudentProfile` | Identity transferred, never duplicated; unique Massar code |
| `ParentStudentRelationship` | Global relationship unchanged by the transfer; statuses determining the consenting party |
| `FinancialAccount`, `Invoice`, `Installment`, `UsageMetric` | Account statement handed to the financial guardian at departure; receivable surviving closure; receivable always kept at the origin; pro-rata for the transfer month and single count of the active student; cross-site transfer in V2+ (option) |
| `Certificate`, `ReportCard`, `Transcript` | Official documents transmitted within scope (leaving certificate, transcripts); produced by DOC and EVA |
| `StudentDocument` | File documents (Massar reference and document, supporting evidence) |
| `School`, `Organization` | Destination (minimal directory); scope of the unpaid-balance transfer (V2+, option) |
| `AuditLog`, `DataExport` | Timeline and audit log; exported exit package |

Notifiable domain events (consumed by the communication module, routed per `spec/domain-model.md` §7): `TransferValidated` (on activation), `ConsentGranted`, `ConsentRevoked`, `EnrollmentStatusChanged` (closure to TRANSFERRED and activation of the destination enrollment), `TransferDeclined`, `TransferCancelled`, `TransferExpired`. No TRA event carries school data content: only file and scope references.

## 7. Screens

Text descriptions; mobile-first, bilingual FR/AR with full RTL support (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`).

- **SCR-ZS-111 — Transfer request (parent, mobile).** Zones: child selector (multi-child, multi-school view); destination search over the directory with cycle filters, or a "non-ZSchool school" choice; effective date ("immediate" or "at the following school year's start"); reason (optional); summary and send button. States: draft, sent, awaiting legal tutor signature, declined by the destination, cancelled, expired. Behavior: searching the destination by Massar code is protected against enumeration.
- **SCR-ZS-112 — Choosing the shared scope and consenting (parent, mobile).** Zones: file reminder; "default sharing" block, pre-checked and locked in its wording; separate opt-in blocks (detailed grades, attendance, disciplinary data); a permanent banner "health data is never transferred"; consent duration; confirmation button with a downloadable receipt. States: awaiting consent, granted, revoked, expired.
- **SCR-ZS-113 — Transfer queue and file (origin school, web).** Zones: list of files by status with filters and counters; a three-column file view (time-stamped timeline, validation checklist, transmitted documents); actions to validate or request more information — no "decline" button. Behavior: validation is possible with an unpaid balance and a "pending" Massar reference.
- **SCR-ZS-114 — "Incoming student" file (destination school, web).** Zones: applicant's identity and Massar code; received scope, section by section, with a "request from the guardian" button for every missing section; an enrollment wizard pre-filled from the consented scope; transfer file status and deadline; actions to accept, decline, or activate. Behavior: no data outside the scope is visible, including in exports.
- **SCR-ZS-115 — Transfer log (leadership, web, V1).** Zones: consolidated table of the school's transfers; filters; export; access to each file's full timeline. Behavior: an alert column for closures without a recorded Massar reference.
- **SCR-ZS-116 — Exit package for a non-ZSchool school (origin, web and mobile).** Zones: document preview with selection of consented opt-in blocks; generating the bilingual PDF (MVP); secure-link management with a QR code (V1); link-access tracking. States: not generated, generated, link active, link expired, link revoked. Behavior: generation is never blocked by the balance.
- **SCR-ZS-117 — Consents and granted access (parent, mobile).** Zones: list of the data subject's `ConsentGrant` entries by recipient; detail of each consent with a downloadable receipt; a revocation button with confirmation; a history of the destination's views. Behavior: also accessible to the adult student in their own account.

## 8. Integrations

| Integration | Role in TRA | Reference |
|---|---|---|
| Massar | No automated exchange in V1 (H-04): the transfer procedure is outside ZSchool, TRA records the reference and the document; a direct integration is only conceivable if an official channel opens (V2+) | `spec/cross-cutting/06-external-integrations.md` (INT-MAS) |
| Electronic signature and seal | The leaving certificate and the exit package carry an advanced electronic seal, timestamp, and verification QR code in V1; a qualified seal via an accredited provider in V2 | `spec/cross-cutting/06-external-integrations.md` (INT-SIG); [ADR-ZS-011](../decisions/011-document-seal-and-signature-levels.md) |
| Messaging and notification channels | Lifecycle notifications through in-app, SMS (MVP), WhatsApp, and push (V1) channels, under the routing and opt-in rules of the communication module | `spec/cross-cutting/06-external-integrations.md` (INT-SMS, INT-WAP, INT-EML) |

No integration is specific to the module: TRA only consumes channels defined transversally; no outbound API to Massar or any other ministerial system exists in this module.

## 9. Module-specific non-functional requirements

Reference to NFR domains carried by `spec/cross-cutting/03-non-functional-requirements.md`; no NFR requirement is numbered here.

- **Performance (NFR-PERF)**: generating the exit package and the leaving certificate within a few seconds per document, including during the June peak; transactional closure and destination-enrollment creation.
- **Availability (NFR-DISP)**: service available during the June-September mobility peak; no maintenance window during those periods.
- **Internationalization (NFR-I18N)**: all module screens and documents in FR and AR (RTL); exit package and certificate mandatorily bilingual.
- **Security (NFR-DOC)**: exit-package link signed, time-limited, revocable, with a verification QR code; anti-enumeration protection on the Massar-code search; views of the shared scope logged.
- **Resilience and retention (NFR-SAV, NFR-RES)**: immutable, exportable file timelines; audit log kept 5 years; official documents kept permanently; a clear response and controlled regeneration for an expired secure link.
- **Mobile accessibility (NFR-MOB, NFR-OFF)**: the parent journey (request, scope, revocation) fully usable from a smartphone, tolerant of unstable connections.

## 10. Success metrics

`KPI-ZS-NNN` identifiers are carried by `spec/metrics.md`; candidate indicators for steering the module (target values to be set in review):

| Indicator | Definition | Indicative target |
|---|---|---|
| Processing time | Median duration between request initiation and closure | A few business days; to be calibrated in review |
| Massar coverage | Share of transfers closed with a recorded Massar reference | Close to 100% after the procedure window |
| ZSchool share | Share of transfers toward a ZSchool destination (network effect) | Growing year over year |
| Exit packages | Share of exit packages downloaded before link expiry; number of regenerations | To be observed from V1 |
| Receivables | Share of unpaid balances settled within 12 months of closure (with and without group transfer, V2+ option) | Improvement versus the situation without a handed-over statement |

## 11. Open questions

Open questions for this module (OQ-ZS-121 through OQ-ZS-125 in the migrated source, covering the fate of the unpaid-balance transfer, the exit-package link duration, the validated-file expiry deadline, the scope of "explicit sharing" for disciplinary data, and the founding-document update on the Massar procedure) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
