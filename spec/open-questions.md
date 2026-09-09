> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-OQ                                                     |
> | Revision       | 1.1                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Process — Open Questions Register                              |
> | Change History | 1.0 (2026-09-09): Consolidated from every chapter's file-local `OQ-NN` open-questions section under `prd/**` (which collided across ~20 files: the same chapter-local counter value meant a different question in every chapter) into one global, permanent `OQ-ZS-NNN` register, one row per original question, per `spec/process/id-migration-map.md` (CCR-ZS-001). 1.1 (2026-09-09): OQ-ZS-372 marked Resolved by ADR-ZS-091 (Accepted) (CCR-ZS-002). |

# ZSchool — Open Questions Register

## Purpose

This is the single consolidated register of every open question raised across the ZSchool
specification. Before this migration, open questions were numbered locally within each chapter, starting over
from 1 in every file — the same local number meant a completely different question in every file,
which made a bare chapter-local citation ambiguous outside its owning chapter. Every question below now
carries a permanent, globally unique `OQ-ZS-NNN` identifier (never renumbered, per
`spec/process/requirement-id-scheme.md`), numbered in blocks per owning chapter in the order the
chapters originally appeared, while remaining anchored to that chapter (the **Owning file**
column). This is a 1:1, unmerged transcription of every original question — 265 rows, matching
`spec/process/id-migration-map.md`'s `OQ-ZS` block exactly.

Three statuses, carried over from the source material: **Resolved** (an `ADR-ZS-NNN` decision
settles it), **Escalated** (an `ADR-ZS-NNN` with Status "Escalated" — a product-owner decision is
required), **Open** (data still to be gathered from pilots, a regulator, or a vendor, or an
internal decision still pending in the owning chapter).

Full cross-reference coverage of these IDs (which `BEH-ZS`/`ADR-ZS`/etc. cite which `OQ-ZS`) is
consolidated in `spec/traceability.md` §8, built in a later migration phase — not duplicated here.

---

## 1. Foundational chapters

### `spec/overview.md` (was `prd/01-context-vision-scope.md`) — 6 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-001 | Timezone: the historical baseline describes "UTC+1, reverting to UTC+0 during Ramadan"; a decree sets a permanent switch to UTC+0 on 20/09/2026, no Ramadan exception. | Open — this chapter adopts permanent UTC+0; a baseline-document correction is owed to the founder. |
| OQ-ZS-002 | Market figures and digital-usage figures (H-01, H-11): the "1.27M / 15.3%" pairing, "136,000 jobs", and "8% basic-phone / 14% rural" are not found in public sources; a revenue figure is stale; a device-share figure is actually a web-traffic share; an app rating is understated. | Open — sourced values adopted from research; a cross-reference to the same question raised in `spec/cross-cutting/04-business-model-packaging.md`. |
| OQ-ZS-003 | Publication of Law 59.21: the baseline says "Official Gazette, March 2026"; the actual text appeared in Official Gazette No. 7485 of 23/02/2026 (113 articles, repeals three earlier laws); 35 implementing decrees expected; whether an 80%-permanent-teacher quota from a repealed law carries over is unconfirmed. | Open — updated on the corrected Gazette reference; a watch on implementing decrees; a baseline-document update owed. |
| OQ-ZS-004 | Internal contradiction: a decision makes an online-payment rail the primary channel from V1 onward, while a literal reading of the baseline's version-scope section places online payment in V2. | Resolved — this chapter follows the decision; the version exception stays explicit and tracked. |
| OQ-ZS-005 | MVP scope extension: pilots activate mid-year and must close out the school year before V1, which the baseline's MVP scope does not explicitly cover (rollover, cheques, parent contract, group consolidated view). | Escalated — a two-wave MVP is adopted as a working hypothesis; the development effort before the pilot deadline and the alternative (compressing V1) are for the founder to decide. |
| OQ-ZS-006 | The growth-ambition-horizon reading: the roadmap places commercialization such that "20 schools by end of year 1" and "300 within three years" read as later calendar years than the founder's literal reading of the confirmed target, without an explicit shift being flagged. | Escalated — this chapter carries the target as-is; the two-year gap is escalated to the founder with no arbitration made; see `spec/decisions/008-growth-ambition-horizon.md`. |

### `spec/urs.md` (was `prd/02-actors-personas.md`) — 2 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-011 | Version of the parent-teacher discussion threads: one persona-need entry carries them at MVP, another at V1, for what is functionally the same capability. | Resolved — moderated in-app/SMS core at MVP, with WhatsApp utility limited to attendance notifications; broader channels, push, and managed templates roll out in V1; every citing entry aligned. |
| OQ-ZS-012 | Version of the adult-student mechanism: two persona-need entries carry V1 here, while the domain-model invariant for the same mechanism carries MVP. | Resolved — MVP across every chapter; the divergence is also logged at `spec/domain-model.md` and `spec/journeys/07-students-minor-and-adult.md`. |

### `spec/domain-model.md` / `spec/invariants.md` (was `prd/03-domain-data-model.md`) — 7 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-021 | Should cancelling a CANDIDATE/PRE-ENROLLED enrollment create an archived terminal CANCELLED state, or allow logical deletion? | Resolved — an archived terminal CANCELLED state, to preserve admissions-campaign history; no enrollment deletion is defined past ACTIVE. |
| OQ-ZS-022 | Reinstating a student at their origin school after a TRANSFERRED/WITHDRAWN status within the same school year — no reverse transition was originally defined. | Resolved — a new ACTIVE enrollment linked to the prior one (reason "reinstatement"), blocked while the prior enrollment is still ACTIVE or SUSPENDED. |
| OQ-ZS-023 | Retention period for unpublished grades, drafts, internal remarks, and deliberations — not explicitly covered by the general retention decision. | Resolved — aligned with the student-life data retention period (end of schooling + 2 years, then anonymized); this data is also non-portable on transfer. |
| OQ-ZS-024 | Closed list of context attributes a school may add to a parent-student relationship. | Resolved — outing authorization, pickup authorization, communication preferences, enrollment regime, and service options; fixed to bound configuration. |
| OQ-ZS-025 | Rule for counting "active students" for months where an enrollment activates, is suspended, or closes. | Resolved — a snapshot on the 1st of the month, ACTIVE enrollments only; mid-month entries/exits counted the following month; a transferred student counted once, at origin. |
| OQ-ZS-026 | Version of the adult-student mechanism (a second occurrence — see OQ-ZS-012). | Resolved — MVP is adopted here too, per a legal justification (art. 209; pilots include 2nd-year baccalaureate students reaching adulthood as early as the pilot school year); an unarbitrated cross-file divergence was logged for this reason. |
| OQ-ZS-027 | Logging scope at MVP: the baseline places the immutable, exportable audit log in V1; a founder arbitration keeps a minimal write-level history at MVP. | Resolved — an accepted, logged MVP downgrade (record-level correction history at MVP; the full audit log arrives in V1); aligned with the attendance and reporting modules' own logging requirements. |

## 2. Modules (behaviors)

### ADM — `spec/behaviors/01-administration-onboarding-subscription.md` — 11 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-031 | Exact scope of subscription management at MVP — the baseline does not explicitly cite the subscription lifecycle at MVP. | Resolved — trial, activation, and active-student counting are MVP (inseparable from pilot onboarding); consumable packs are MVP for their counters and alert thresholds, self-service subscription management stays V1; payment delinquency handling stays V1 (pilot billing at low headcount doesn't justify automating the move to read-only yet). |
| OQ-ZS-032 | Delay before moving to read-only on payment delinquency. | Open — a working proposal: graduated reminders from the due date, moving to "past due" 15 days after the unpaid due date, a platform-level configurable value; pending founder confirmation. |
| OQ-ZS-033 | Exact scope of read-only mode when past due. | Open — an adopted proposal: writes blocked, viewing and exports retained, and operational safety functions (same-day absence notification) remain in effect until cancellation, so student safety never degrades; pending confirmation (a collections/safety trade-off). |
| OQ-ZS-034 | Reactivation after cancellation — not covered by the baseline. | Open — a working proposal: reactivation possible with no data loss during the 90-day read-only period; between 90 days and 12 months, restoration from the export via a controlled support operation; after deletion at 12 months, re-registration as a new school; pending founder confirmation. |
| OQ-ZS-035 | Proration rule for the "active student" count (a second occurrence — see OQ-ZS-025/294/362). | Resolved — a student is counted if their enrollment is ACTIVE at midnight on the 1st of the month (local time); entries/exits during the month picked up at the next count; a transferred student counted once, at the originating school; a mid-year pilot's first count runs retroactively on imported effective dates. |
| OQ-ZS-036 | Timezone baseline update (a thirteenth occurrence — see OQ-ZS-001 and its many recurrences). | Escalated — this chapter configures permanent UTC+0; "lighter Ramadan hours" remains a timetable variant owned by the academic-structure module. |
| OQ-ZS-037 | WhatsApp pricing shift of 01/10/2026 (a sixth occurrence — see OQ-ZS-054/081/246/266/296). | Open — channel configuration and consumable packs must absorb a dated shift parameter and also budget for inbound replies; to be consolidated with the integrations chapter. |
| OQ-ZS-038 | Logging: MVP scope (see also OQ-ZS-027/058/077/098/109/340). | Resolved — immutable, record-level history of administration entries at MVP; the sensitive-access log and audit-log export arrive in V1. |
| OQ-ZS-039 | WhatsApp channel scope at MVP (a ninth occurrence — see OQ-ZS-058/078/085/196/207/242/262). | Resolved — "utility" WhatsApp limited to attendance notifications under express opt-in (also the basis for the cross-border data-transfer disclosure) at MVP, minimal templates, a single ZSchool WhatsApp Business account, no push; generalized at V1. |
| OQ-ZS-040 | The public school directory at MVP (a second occurrence — see OQ-ZS-132). | Resolved — a minimal read-only directory (name, city, cycles) as an MVP Must; a hidden school stays selectable as a transfer destination via exact search; additional fields and publication management at V1, network and applications at V2+. |
| OQ-ZS-041 | MVP scope of the multi-site organization — a large-group pilot profile requires more than the baseline's version list covers. | Resolved — a working assumption: organization creation, attaching tenants, and a read-only consolidated dashboard at MVP; shared administration and group billing at V1; extending the MVP scope this way is pending founder confirmation. |

### INS — `spec/behaviors/02-admissions-enrollment-reenrollment.md` — 9 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-051 | Should there be an archived CANCELLED terminal state for cancelled applications and pre-enrollments, instead of a logical deletion (a second occurrence — see OQ-ZS-021)? | Resolved — same archived-terminal-state answer applies here, keeping the admissions-campaign history. |
| OQ-ZS-052 | Documentary scope of the MVP for enrollment documents (see also OQ-ZS-091/179). | Resolved — basic issuance at MVP via the admissions and finance modules, with continuously numbered receipts from MVP and bulk start-of-year insurance certificates in wave 2; certificate numbering, stamp, QR code, and self-service arrive in V1. |
| OQ-ZS-053 | Should the Law-59.21 parent contract be moved forward to MVP (a third occurrence — see OQ-ZS-027/071)? | Resolved — the contract is at MVP wave 1 with a scanned signature and the financial guardian's countersignature; an advanced electronic signature arrives in V1. |
| OQ-ZS-054 | Waitlist and deposit rules (retention period for a pre-enrolled spot, refund policy, priority order) — not fixed by the baseline. | Open — market practices vary; a per-school configuration is proposed, with default values to be confirmed with the pilots. |
| OQ-ZS-055 | Data-model support for admissions (test sessions, waitlist rank, application origin) — no dedicated entity currently exists. | Open — to be specified in a later review (attributes of the CANDIDATE enrollment or an associated entity), without creating floating academic data outside the enrollment. |
| OQ-ZS-056 | A compliance alert for "refusal to re-enroll a student in good standing" (a legal requirement). | Partially resolved — re-enrollment is never conditioned on payment; a blocking warning appears at documented confirmation only when the student has arrears or an active disciplinary decision; the exact statutory article and contract content are still to be confirmed against the full legal text. |
| OQ-ZS-057 | Baseline update following research corrections (a fifth occurrence — see OQ-ZS-003/185/297/300). | Escalated — this chapter uses the up-to-date data (the corrected Gazette date for Law 59.21, the Family Code's actual unvoted status, a completed enrollment state machine); a baseline-document update is owed. |
| OQ-ZS-058 | Logging: MVP scope (see also OQ-ZS-027/038/077/098/109/340). | Resolved — immutable, record-level history of entries at MVP; the sensitive-access log and audit-log export arrive in V1. |
| OQ-ZS-059 | Version of the adult-student mechanism (a fifth occurrence — see OQ-ZS-012/026/210/213). | Resolved — MVP; informing the adult student at each re-enrollment is also MVP. |

### PED — `spec/behaviors/03-academic-structure-timetables.md` — 8 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-061 | Timezone baseline update (a fourteenth occurrence — see OQ-ZS-001 and its many recurrences). | Escalated — this chapter retains permanent UTC+0; a baseline-document update is owed. |
| OQ-ZS-062 | Version of the annual academic calendar. | Resolved — MVP (it governs roll call, declared expected sessions, notifications, and evaluation periods); next-year structure cloning joins MVP wave 2. |
| OQ-ZS-063 | Should dedicated domain events (timetable publication, variant activation) be added to the catalog, with systematic family notification, or should only significant changes be notified? | Open — a notification-volume and cost trade-off; to be decided in a later review. |
| OQ-ZS-064 | Default schedule-grid parameters (session duration, breaks, span per cycle, default Saturday-morning activation) — not fixed by the baseline. | Open — values to validate with pilot schools before locking in defaults. |
| OQ-ZS-065 | Multi-site timetables and shared rooms: consolidating timetables at the organization level and managing rooms shared across sections or between schools of the same campus. | Open — scope and version (V1 or V2+) still to decide. |
| OQ-ZS-066 | Baseline divergence on the suspension date of two assessment-weighting memoranda (a third occurrence — see OQ-ZS-181/310). | Escalated — the corrected date is adopted; a baseline-document update is owed. |
| OQ-ZS-067 | The declared-session entity and the session-not-held domain event — should they be formally carried into the canonical data dictionary and event catalog? | Resolved — yes, both are introduced by this module's own requirements; to be reflected in `spec/domain-model.md`'s dictionary and event catalog. |
| OQ-ZS-068 | Responsibility for confirming religious-holiday dates: centralized by ZSchool for all schools, or per-school confirmation, and via which announcement channel? | Open — to be locked down in a later review along with the associated notification method. |

### VSC — `spec/behaviors/04-attendance-student-life-discipline.md` — 9 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-071 | Baseline/research divergence on the timezone (a fifteenth occurrence — see OQ-ZS-001 and its many recurrences). | Escalated — this chapter retains permanent UTC+0, UTC timestamps; a baseline-document update is owed. |
| OQ-ZS-072 | Version of manual arbitration for attendance sync conflicts (per-class vs. per-course roll call for the same half-day, a second occurrence — see OQ-ZS-192). | Resolved — same first-confirmation-governs rule applies here, with a correction notice where needed. |
| OQ-ZS-073 | Exporting attendance to Massar: should an Excel export of absences in Massar's format be provided for schools that also enter it on the ministry side, given no vendor API exists? | Open — to be gathered from the pilots. |
| OQ-ZS-074 | Does the conduct grade factor into the overall average (a configurable weight), or does it appear separately on the report card? | Open — a working proposal: shown separately by default, with average inclusion as a school option; a twin question to the same one raised in the assessments module, one arbitration expected for both. |
| OQ-ZS-075 | A national regulatory absence threshold (year or exam exclusion for absences) — no text exists in the baseline or research. | Open — pending confirmation, the alert threshold remains a school-level parameter with no "regulatory" status. |
| OQ-ZS-076 | Printed late passes: should a thermal-printed or QR late pass be given to the student, or does the digital record suffice? | Open — to decide per the pilots' actual equipment. |
| OQ-ZS-077 | Version of logging for attendance and discipline (see also OQ-ZS-027/038/058/098/109/340). | Resolved — immutable, record-level history of roll-call and justification entries at MVP; disciplinary-record access log and export arrive in V1. |
| OQ-ZS-078 | Version of the WhatsApp channel for attendance notifications (a tenth occurrence — see OQ-ZS-039/058/078/085/196/207/242/262). | Resolved — "utility" WhatsApp limited to attendance notifications at MVP under express opt-in, alongside in-app and SMS, no push; V1 generalizes to all channels. |
| OQ-ZS-079 | Sessions with no timetable at MVP: how roll call ties to a declared session when no timetable exists yet. | Resolved — roll call per course ties to a declared session; sessions not held drop out of expected roll calls; the V1 timetable generates sessions automatically. |

### EVA — `spec/behaviors/05-assessments-grades-report-cards.md` — 10 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-081 | Version at which moderated parent-teacher threads activate. | Resolved — MVP, in-app, moderated by default; push and WhatsApp thread notifications in V1. |
| OQ-ZS-082 | Baseline updates from research affecting communications, to be arbitrated by the founder: (a) the WhatsApp pricing switch date/content, (b) the timezone correction, (c) an unsupported usage-figure pairing. | Open — three distinct baseline-document corrections owed; none blocks current design. |
| OQ-ZS-083 | Domain events this module should produce — the canonical catalog currently treats this module only as a consumer. | Open — reconciliation with `spec/domain-model.md` §7 still owed. |
| OQ-ZS-084 | Exact scope of "moderation" for in-app threads (viewing only, or removal/censorship too). | Open — working assumption: traced viewing with no removal; a school wanting editorial control would need the underlying decision changed. |
| OQ-ZS-085 | Re-billing of inbound WhatsApp conversations after the pricing switch. | Partially resolved — attribution settled (billed to the school, same as outbound); the final per-message vs. per-conversation pricing model is still to confirm once Morocco's rate card is published. |
| OQ-ZS-086 | WhatsApp channel scope at MVP (a founder arbitration). | Resolved — limited to attendance notifications with minimal templates at MVP; general rollout (every message type, managed templates, push) in V1. |
| OQ-ZS-087 | Bilingualism requirements for content (a founder arbitration). | Resolved — mandatory FR/AR bilingualism for institutional content (templates, announcements, authorizations, documents); individual messages/threads render in the author's own language as-is, with assisted translation optional in V2+. |
| OQ-ZS-088 | Retention period for outing parental authorizations. | Open — a working proposal of 5 years after the event (civil-liability evidence), longer than the general messages-retention period; to be confirmed and formally logged. |
| OQ-ZS-089 | 6AP exam label: "provincial" (baseline) vs. "regional" (a research finding). | Resolved — the baseline is treated as authoritative (a standardized provincial exam); the underlying decree reference is still to be recorded. |
| OQ-ZS-090 | Trimester-to-Massar-semester mapping for the bilingual pilot school running on trimesters. | Resolved — a configurable mapping table with a default value and recomputation of semestral averages from dated grades. |

### DOC — `spec/behaviors/06-documents-certificates.md` — 8 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-091 | Exact MVP document scope (see also OQ-ZS-182, restated from the documents module's own perspective). | Resolved — same MVP-core-set / V1-full-catalog split applies here. |
| OQ-ZS-092 | Exact content of the non-ZSchool exit file (a second occurrence — see OQ-ZS-072). | Open — same pilot-validation status applies here. |
| OQ-ZS-093 | Data exposed by the public verification page and link validity period (a second occurrence — see OQ-ZS-073). | Partially resolved — same status applies here. |
| OQ-ZS-094 | Relationship among the three "release authorization" objects (a second occurrence — see OQ-ZS-074). | Open — same cross-chapter clarification is still owed. |
| OQ-ZS-095 | "Vaccination record" boundary between the documents module and the health module (a second occurrence — see OQ-ZS-075). | Open — same migration-path question applies here. |
| OQ-ZS-096 | Baseline/research divergence on the timezone affecting document timestamps (a second occurrence — see OQ-ZS-076). | Resolved by reference — settled once at `spec/overview.md`; no separate question here. |
| OQ-ZS-097 | Mandatory statutory notices on official documents (a second occurrence — see OQ-ZS-077). | Open — same regulatory-text-confirmation status applies here. |
| OQ-ZS-098 | Founder arbitration on logging for document requests and issuances (a second occurrence — see OQ-ZS-078). | Resolved — same MVP-minimal / V1-full logging split applies here. |

### FIN — `spec/behaviors/07-finance-billing-collections.md` — 9 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-101 | Version at which Law-59.21-compliant parent contracts activate (a second occurrence — see OQ-ZS-051). | Resolved — same MVP-wave-1 activation applies here. |
| OQ-ZS-102 | Internal baseline divergence on the version of online payment (a second occurrence — see OQ-ZS-052). | Resolved — same V1 adoption applies here. |
| OQ-ZS-103 | Which company/business-registration notices belong on compliant invoices (a second occurrence — see OQ-ZS-053). | Resolved — same treatment applies here. |
| OQ-ZS-104 | A payment-provider reference no longer applicable (a second occurrence — see OQ-ZS-054). | Resolved — same provider-exclusion applies here. |
| OQ-ZS-105 | Scope of the sibling discount (a second occurrence — see OQ-ZS-055). | Resolved — same MVP-same-school / V1-multi-school-group split applies here. |
| OQ-ZS-106 | Proration rule for mid-year fees (a second occurrence — see OQ-ZS-056). | Resolved — same default-due-in-full rule applies here. |
| OQ-ZS-107 | Additional financial domain events needed for notifications and dashboards (a third occurrence — see OQ-ZS-040/033). | Open — same harmonization-still-owed status applies here. |
| OQ-ZS-108 | Founder arbitration on WhatsApp and notification channels at MVP (a third occurrence — see OQ-ZS-039/034). | Resolved — same MVP-attendance-only / V1-general-rollout split applies here. |
| OQ-ZS-109 | Founder arbitration on logging (a fourth occurrence — see OQ-ZS-038/026/035). | Resolved — same MVP-minimal / V1-full logging split applies here. |

### COM — `spec/behaviors/08-communication-notifications.md` — 8 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-111 | Version at which moderated parent-teacher threads activate (a third occurrence — see OQ-ZS-011/053). | Resolved — same MVP in-app / V1 broader-channel split applies here. |
| OQ-ZS-112 | Baseline updates from research affecting communications, to be arbitrated by the founder (a second occurrence — see OQ-ZS-082). | Open — same three-item correction list applies here. |
| OQ-ZS-113 | Domain events this module should produce (a second occurrence — see OQ-ZS-083). | Open — same reconciliation-still-owed status applies here. |
| OQ-ZS-114 | Exact scope of "moderation" for in-app threads (a second occurrence — see OQ-ZS-084). | Open — same viewing-only working assumption applies here. |
| OQ-ZS-115 | Re-billing of inbound WhatsApp conversations after the pricing switch (a second occurrence — see OQ-ZS-085). | Partially resolved — same attribution-settled/pricing-model-open status applies here. |
| OQ-ZS-116 | WhatsApp channel scope at MVP (a founder arbitration, a second occurrence — see OQ-ZS-086). | Resolved — same MVP-attendance-only / V1-general-rollout split applies here. |
| OQ-ZS-117 | Bilingualism requirements for content (a founder arbitration, a second occurrence — see OQ-ZS-087). | Resolved — same institutional-content-mandatory / individual-message-author-language rule applies here. |
| OQ-ZS-118 | Retention period for outing parental authorizations (a second occurrence — see OQ-ZS-088). | Open — same 5-year working-hypothesis proposal applies here. |

### TRA — `spec/behaviors/09-transfers-mobility.md` — 5 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-121 | Fate of an unpaid-balance transfer to the destination school. | Resolved — ZSchool does not transfer the receivable in V1, it stays with the origin school; real cross-site balance transfer within the same group becomes a V2+ option. |
| OQ-ZS-122 | Default duration of the secure link for the non-ZSchool exit package. | Open — working assumption: 30 days, configurable per school, regenerable on the legal tutor's request. |
| OQ-ZS-123 | Expiry deadline for a validated transfer file with no activation. | Resolved — a default 30 configurable days; value to be confirmed with pilots based on real mid-year activation turnaround. |
| OQ-ZS-124 | Exact scope of "explicit sharing" of disciplinary data on transfer. | Open — working assumption: an opt-in block covers only a synthesized, closed disciplinary summary, never ongoing proceedings. |
| OQ-ZS-125 | A founding-document update on the actual Massar transfer procedure (who files the request, recent circular changes). | Open — no design impact; the transfer module stays outside the Massar channel (a reference field plus a document); a baseline-document update is owed. |

### CAR — `spec/behaviors/10-teacher-career-network.md` — 7 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-131 | Extend the school-membership contract-nature enumeration with "external public-sector teacher" (a second occurrence — see OQ-ZS-031). | Open — same baseline-document update owed. |
| OQ-ZS-132 | Version for activating the minimal public teacher directory (a second occurrence — see OQ-ZS-032). | Resolved — same MVP scope applies here. |
| OQ-ZS-133 | Survival of the 8-hour cap and external-teacher status after the law repeal-and-replace (a second occurrence — see OQ-ZS-033). | Open — same regulatory-monitoring status applies here. |
| OQ-ZS-134 | Exact content of the teacher file to file with the regional academy (a second occurrence — see OQ-ZS-034). | Open — same pilot-confirmation status applies here. |
| OQ-ZS-135 | CNDP filing basis for the global teacher profile and the V2 network (a second occurrence — see OQ-ZS-035). | Partially resolved — same status applies here. |
| OQ-ZS-136 | Behavior when the cross-school hour cap is exceeded (a second occurrence — see OQ-ZS-036). | Resolved — same non-blocking-alert mechanism applies here. |
| OQ-ZS-137 | Owner of the "permanent-teacher share" ratio (a second occurrence — see OQ-ZS-037). | Resolved — same V1 requirement applies here. |

### RAP — `spec/behaviors/11-dashboards-reporting.md` — 7 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-141 | Exact content of the three ministry statistics applications and stabilization of their forms. | Open — field mappings to be validated with pilots once forms are fixed; the mapping repository stays configurable. |
| OQ-ZS-142 | Standardized definition of "attendance rate". | Resolved — (expected sessions − unjustified absences − justified absences) / expected sessions, over declared sessions at MVP / timetable sessions in V1; a single definition reused by every citing metric. |
| OQ-ZS-143 | A closed list of "teacher activity" indicators allowed, given a no-rating decision. | Open — strictly operational indicators, no score or ranking; the exact boundary is to be arbitrated with pilots, the ban on rating staying absolute. |
| OQ-ZS-144 | Scope of financial indicators at the organization level. | Open — per-school aggregates allowed at the group level, detail forbidden without tenant-level authorization; to be fixed in the permissions matrix. |
| OQ-ZS-145 | Version for introducing scheduled reports. | Open — placed in V1 (Should) with no explicit baseline justification for MVP; to be confirmed in a later review. |
| OQ-ZS-146 | Version of group consolidation: the baseline places it in V1, while a large-group pilot profile and a Must-MVP persona need require it at MVP. | Resolved — a working assumption: a consolidated read view at MVP, advanced comparisons and shared administration in V1; still pending final product-owner confirmation. |
| OQ-ZS-147 | Version timing for logging views of sensitive data and exports. | Resolved — minimal entry logging at MVP (corrections tracked at the record level, no view/export logging); an immutable exportable audit log covering sensitive views and exports in V1; an accepted, logged MVP degradation. |

### MAS — `spec/behaviors/12-massar-regulatory-exports.md` — 9 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-151 | Confirm the Massar grade-entry module's framing memo number, and whether an older continuous-assessment reference memo still applies. | Open — this chapter's requirements are worded with no dependency on the exact memo number; to be confirmed with pilots and the ministry. |
| OQ-ZS-152 | Exact column structure of Massar's export Excel files, per cycle and semester. | Open — not publicly documented and fragile on re-import; to be gathered from real files with pilots before activating templates, recalibrated at every school-year start. |
| OQ-ZS-153 | Exact forms of the three ministry statistics applications. | Open — applications listed as "under review" on the ministry's own portal; to be gathered from pilots before the first production window. |
| OQ-ZS-154 | Format of certifying-exam result transcripts to import, and availability of a digital export. | Open — no public format documented; absent a digital export, controlled row-by-row entry stays the fallback path. |
| OQ-ZS-155 | Exact format of the Massar transfer reference and how families/schools obtain it. | Open — the procedure is described in research (a parent portal area, provincial validation), but the reference format itself is not documented; to be refined with pilots. |
| OQ-ZS-156 | Regional variants of the continuous-assessment weighting referential. | Open — research considers per-academy variation possible but undocumented; to be settled with multi-region pilots. |
| OQ-ZS-157 | Version of Massar/regulatory exports: the baseline places them in V1, while a milestone requires them from pilots earlier. | Resolved — a working assumption: core exports at MVP wave 2, ministry statistics/certifying results/consolidated logs in V1; pending final product-owner confirmation. |
| OQ-ZS-158 | 6AP exam label: "provincial" vs. "regional" (a second occurrence — see OQ-ZS-089). | Resolved — same baseline-authoritative reading applies here; the decree reference is still to be recorded. |
| OQ-ZS-159 | Trimester-to-Massar-semester mapping for the bilingual pilot school (a second occurrence — see OQ-ZS-090). | Resolved — same configurable mapping table applies here. |

### SAN — `spec/behaviors/13-ancillary-services.md` — 7 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-161 | Founding-document update on the timezone (a third occurrence — see OQ-ZS-001/038). | Resolved by reference — settled once, this chapter keeps permanent UTC+0 with no separate question of its own. |
| OQ-ZS-162 | Compliance framework for geolocating school vehicles carrying minors (applicable CNDP formality, legal basis, retention period). | Open (V2+) — carried by the legal-compliance chapter; the underlying transport-tracking requirement is disabled by default pending that analysis, no commercial promise made before validation. |
| OQ-ZS-163 | Transport run by a third-party provider rather than the school: multi-provider scope and the tax treatment of re-billing. | Open — the baseline describes school-operated transport only; the external-carrier case is common in groups and must be settled before design. |
| OQ-ZS-164 | Tax regime of uniform/supply sales — not covered by the existing catering/transport exemption nor the exempt-supplies list. | Open — to be confirmed with the tax administration before billing; the line nature stays configurable with no exemption assumed in the meantime. |
| OQ-ZS-165 | Ranking of the library and uniform/supply sale in the V2+ roadmap (named as "later version" but not explicitly listed alongside transport/canteen/activities/health). | Open — a V2+ position is adopted; exact sequencing to be set in the roadmap. |
| OQ-ZS-166 | Transport-notification costs after the WhatsApp pricing switch (a risk of repeated daily costs specific to transport). | Open — a channel-and-cost-cap arbitration to be defined jointly with the communication module. |
| OQ-ZS-167 | Data-model extension needed for ancillary-services entities (routes, stops, subscriptions, check-ins, menus, visits, activities, loans, sales). | Open — this module stays at a directional level per its assignment; no new entity or invariant is created by it yet. |

### HEA — `spec/behaviors/14-health-sensitive-data.md` — 7 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-171 | Should V2+ (or later) include an infirmary-visit log (visits, medications administered, monitoring)? | Open — the baseline covers only the health record itself; a daily log would be a notable extension with a CNDP-filing impact; to be decided in a later review. |
| OQ-ZS-172 | Should allergy alerts be extendable beyond the homeroom teacher and student-life staff (e.g. a PE teacher, outing chaperones, canteen staff)? | Open — the current matrix excludes the course teacher; real-world needs argue for a school-level setting, bounded by least privilege and logged if extended. |
| OQ-ZS-173 | Is offline access to emergency health records for the nurse, from mobile, adopted? | Open — the baseline limits offline use to attendance/grades today; a local encrypted cache would raise device-loss security questions; to be decided in a later review. |
| OQ-ZS-174 | A baseline/research divergence check specific to this module: does the corrected research actually change anything for the health module? | Resolved — no, the correction confirms the baseline as written (F112 authorization mandatory, online CNDP filing, personal-data-protection-law revision not filed); regulatory monitoring stays open on the compliance chapter's side. |
| OQ-ZS-175 | Attachment of the health record: an earlier data-dictionary draft tied it to the student alone (global), incompatible with a per-school empty-record and per-school-purge requirement. | Resolved — one health record per (student × school) pair, tenant-keyed, tied to the current enrollment; the data model corrected accordingly. |
| OQ-ZS-176 | Number of legal guardians required for health-related consent, and the disagreement case. | Resolved — one legal guardian suffices, the others are notified, disagreement is arbitrated by the school; the adult student consents alone. |
| OQ-ZS-177 | Arbitrations already settled and recorded rather than left open: alert-hiding propagation delay on consent revocation, and the adult student's own permission scope on their health record. | Resolved — both settled; any future change to the permissions matrix or the rights procedure must be reflected back here. |

## 3. Journeys

### Journey map — `spec/journeys/00-journey-map.md` — 2 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-181 | Activation version for moderated parent-teacher discussion threads (a fourth occurrence — see OQ-ZS-011/053/080). | Resolved — same MVP in-app / V1 broader-channel split applies here. |
| OQ-ZS-182 | MVP document scope for the documents module (see also OQ-ZS-091). | Resolved — same MVP-core-set / V1-full-catalog split applies here. |

### DIR — `spec/journeys/01-school-group-director.md` — 5 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-191 | Timezone baseline update (a fourth occurrence — see OQ-ZS-001/038/161). | Escalated — same permanent-UTC+0 adoption applies here; a baseline-document correction is owed. |
| OQ-ZS-192 | Suspension date of two assessment-weighting memoranda: the baseline states one date, research finds an earlier one. | Escalated — the corrected date is adopted in this journey's step content; a baseline-document update is owed. |
| OQ-ZS-193 | A payment-provider reference no longer applicable in this journey's payment step (a third occurrence — see OQ-ZS-054/074). | Escalated — the provider is excluded here too; a baseline-document update is owed. |
| OQ-ZS-194 | Massar grade-module framing memo number (a second occurrence — see OQ-ZS-062/151). | Open — this journey's Massar-compliance steps are worded with no dependency on the exact memo number. |
| OQ-ZS-195 | Purchase point and scope of consumable bundles (SMS, WhatsApp, storage) in a multi-site group. | Open — a working assumption (bundles subscribed per tenant with per-school counters and alerts, a consolidated organization-level usage view) proposed for a later review with the administration, communication, and packaging chapters. |

### SEC — `spec/journeys/02-secretary-cashier.md` — 4 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-201 | A baseline/research discrepancy on Law 59.21's actual publication and content (a second occurrence — see OQ-ZS-003). | Escalated — the exact mandatory content of the parent contract is still set by regulation not yet published; contract templates must stay configurable without a rebuild. |
| OQ-ZS-202 | The cash-discrepancy approval circuit: no alert threshold or approver is defined for non-zero cash-session discrepancies. | Open — a working proposal (a school-configurable threshold, leadership notified above it, monthly per-staff consolidation) to be settled with pilots. |
| OQ-ZS-203 | The form of written traceability for document requests and issuances (a second occurrence — see OQ-ZS-078/070). | Resolved — same minimal record-level historization at MVP applies here, plus capturing the recipient's identity for any in-person handover outside a parent account; a signed physical register offered as a school option. |
| OQ-ZS-204 | Interpreting the legal-tutor/legal-guardian distinction for issuing administrative documents to the holder of custody. | Resolved — routine documents (enrollment certificate, etc.) issued to any legal guardian or custodial parent with no tutor signature needed; the leaving certificate requires the legal tutor's (or adult student's) signature, though the custodial parent may initiate the request. |

### SUR — `spec/journeys/03-head-supervisor.md` — 8 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-211 | Timezone baseline update (a fifth occurrence — see OQ-ZS-001/038/161/180). | Escalated — same permanent-UTC+0 adoption applies here. |
| OQ-ZS-212 | Routing and cost of student-life WhatsApp notifications after the pricing switch. | Resolved — express opt-in as the transfer basis, opt-out limited to announcements/reminders, incoming replies acknowledged and forwarded, a dated pricing-switch parameter; the exact scope of opt-in/opt-out still to be finalized. |
| OQ-ZS-213 | Digital-usage figures to cite in support of mobile-first design. | Escalated — corrected national-survey figures are adopted; the rural digital-divide rationale for the SMS fallback stays valid; a baseline-document update is owed. |
| OQ-ZS-214 | Priority between per-class roll call (supervisor) and per-course roll calls (teachers) for the same half-day. | Resolved — the first synchronized validation is authoritative; a gap is arbitrated with no new notification, a correction notice issued after arbitration. |
| OQ-ZS-215 | Compatibility of offline mode with the under-5-minute absence-notification delay. | Resolved — the delay runs from platform-side sync (including the hold window), not from the moment of local, offline validation. |
| OQ-ZS-216 | The tracking entity for student life's manual phone-call outreach — no data-model entity currently exists for it. | Open — a proposal exists (a contact trace owned by the communication module); to be settled in a later review. |
| OQ-ZS-217 | Default alert-threshold values for absences and tardiness. | Open — no baseline values exist; per-school configuration is the mechanism, default values to be gathered from pilots. |
| OQ-ZS-218 | WhatsApp and push notification scope in MVP (a founder arbitration, a fourth occurrence — see OQ-ZS-086/078/085). | Resolved — same MVP-attendance-only / V1-general-rollout split applies here. |

### ENS — `spec/journeys/04-part-time-teacher.md` — 5 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-221 | The fate of the "8 hours/week" rule after the private-education law's repeal-and-replace (a third occurrence — see OQ-ZS-033/133). | Open — same regulatory-monitoring status applies here; a related baseline discrepancy on the actual share of part-time teachers is also logged. |
| OQ-ZS-222 | The level of cross-school hour detail shown beyond the overall cap indicator, balancing regulatory need against career-path confidentiality between schools. | Resolved — a total visible only to the teacher; a binary alert to the school on consent; off-platform hours self-declared. |
| OQ-ZS-223 | Activation version for moderated parent-teacher discussion threads (a fifth occurrence — see OQ-ZS-011/053/080/178). | Resolved — same MVP in-app / V1 broader-channel split applies here. |
| OQ-ZS-224 | Timezone baseline update (a sixth occurrence — see OQ-ZS-001/038/161/180/189). | Escalated — same permanent-UTC+0 adoption applies here. |
| OQ-ZS-225 | Digital-usage figures for this persona's own mobile-first rationale (a second occurrence — see OQ-ZS-285). | Escalated — same corrected-figures adoption applies here. |

### PAR — `spec/journeys/05-multi-school-parent.md` — 6 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-231 | The payment-reference grain for the online payment rail: per student, per family, or per financial guardian; can several installments or children be grouped under one reference? | Open — a working assumption (one reference per payment, able to cover several installments/children at the same school) is adopted pending confirmation of the vendor API's actual grouping capabilities. |
| OQ-ZS-232 | The intermediate status and display delay for an online payment not yet reconciled (a same-day cash-agent payment, before daily reconciliation runs). | Open — no visible-state definition exists yet for the reconciliation window; to be defined with the finance module. |
| OQ-ZS-233 | Timing and method for gathering WhatsApp consent (at account activation, or on the first eligible notification), and handling withdrawal. | Resolved — express opt-in gathered at account activation, with an explicit note on the cross-border data transfer; withdrawal at any time, automatic fallback to SMS. |
| OQ-ZS-234 | Impact of the WhatsApp pricing switch on notification-channel routing thresholds for parents. | Open — MVP routing is already limited to attendance notifications; whether the usage threshold should be lowered further (favoring push then SMS) is still open. |
| OQ-ZS-235 | Default list of documents offered self-service to parents, and how self-service numbering relates to front-desk numbering. | Open — a single canonical term ("enrollment certificate") is adopted; the default document list and numbering-sequence question are still open, to be fixed with the documents module. |
| OQ-ZS-236 | MVP notification-channel scope for parents (a fifth occurrence — see OQ-ZS-086/078/085/196). | Resolved — same MVP-attendance-only / V1-general-rollout split applies here. |

### GAR — `spec/journeys/06-custodial-mother-and-guardian.md` — 5 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-241 | A baseline-document update on the actual status of the Family Code reform. | Escalated — the "reform" is a proposal report, not voted or promulgated as of this document's date; article-numbering references also need confirming against the Official Gazette. |
| OQ-ZS-242 | The precise fit between the "legal guardian" and "legal tutor" terminology and the glossary's own definitions. | Open — this journey's own functional reading (an information status distinct from the signer designation) is proposed for a later review; the frozen historical baseline is not itself amended. |
| OQ-ZS-243 | Version for the adult-student restriction mechanism (a third occurrence — see OQ-ZS-012/014). | Resolved — MVP across every citing file. |
| OQ-ZS-244 | Visibility of a court-ordered restriction's supporting document to the restricted parent. | Open — a working assumption (the restricted parent is notified and sees the notice, scope, and reference of the ruling, with full-document access unless the school configures otherwise) is proposed for a later review with the compliance chapter. |
| OQ-ZS-245 | Enriching the domain-event catalog with the events this journey assumes (access-restriction, guardian-conflict, relationship-quality-change events). | Resolved — the three events are now in the canonical catalog in `spec/domain-model.md` §7, with producers and consumers filled in. |

### ELE — `spec/journeys/07-students-minor-and-adult.md` — 7 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-251 | Activation version for the adult student's own rights (a fourth occurrence — see OQ-ZS-012/014/210). | Resolved — MVP, with an explicit legal justification; transcript self-service itself stays V1. |
| OQ-ZS-252 | Timezone baseline update (a seventh occurrence — see OQ-ZS-001/038/161/180/189/200). | Escalated — same permanent-UTC+0 adoption applies here. |
| OQ-ZS-253 | Should the guardian whose access is restricted by an adult student be notified at all, beyond the school itself? | Open — the adopted recommendation is a generic notification to the restricted guardian with no detail on reasons; a later review may confirm or reverse this. |
| OQ-ZS-254 | Granularity of the adult student's access restriction: three independent blocks (school/disciplinary/health), or finer sub-scopes. | Open — three blocks are adopted as the least-complex option covering the requirement; finer granularity deferred unless pilots request it. |
| OQ-ZS-255 | Whether an adult student's restriction also suppresses their guardian's attendance/safety notifications. | Open — the adopted recommendation keeps security-natured notifications (a same-day absence, an emergency) independent of the school-data restriction, disclosed to the student at restriction time. |
| OQ-ZS-256 | The login identifier for a minor student with no phone or e-mail of their own. | Resolved — a login identifier distinct from the contact identifier: a generated, readable identifier not derived from the national student code, activated by the legal guardian via OTP to their own number, with a tracked migration path to the student's own number once they reach adulthood. |
| OQ-ZS-257 | Digital-usage figures cited for this persona's own journeys (a third occurrence — see OQ-ZS-285/201). | Escalated — same corrected-figures adoption applies here; limited practical impact (the SMS fallback and mobile-first approach stay valid regardless). |

## 4. Cross-cutting chapters

### PER — `spec/cross-cutting/01-permissions.md` — 8 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-261 | Support-service level at MVP. | Resolved — ticket-based access with the principal's explicit in-app approval, bounded scope/duration, logged; full workflow and exportable log in V1. |
| OQ-ZS-262 | Identity-file fields directly editable by the parent. | Open — proposal: contact details, preferences, relationship attributes, and civil status entered at profile creation; final field list to be settled with the enrollment module. |
| OQ-ZS-263 | Exact scope of "sensitive views" that get logged. | Open — proposed extension: supporting-file documents, bulk exports, support views; version pacing already settled (writes logged from MVP, views in V1). |
| OQ-ZS-264 | Named delegation for the group administrator (tension between no-data-merging and "shared administration"). | Open — proposal: an express, per-school, logged, time-bound delegation. |
| OQ-ZS-265 | MFA rollout scope. | Resolved — MFA from MVP for principal's office, academic direction, registrar, accounting, and system-admin roles; optional for teachers/supervisors; 90-day trusted devices. |
| OQ-ZS-266 | Baseline/research divergence on the Family Code reform's actual legal status (a second occurrence — see OQ-ZS-312). | Open — same not-yet-enacted status applies here; default permission-matrix values stay configurable to absorb any future change. |
| OQ-ZS-267 | Online payment version and the permission-matrix consequence (a third occurrence — see OQ-ZS-004/028/072). | Resolved — the matrix's finance row carries online payment from V1, aligned with the governing decision. |
| OQ-ZS-268 | Matrix extension for the adult student's own health-record access. | Resolved — a read-access extension, justified by the adult-account-holder rule, logged here for baseline-deviation traceability. |

### SEC — `spec/cross-cutting/02-security-privacy.md` — 7 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-271 | Version at which MFA activates for school roles (a second occurrence — see OQ-ZS-334). | Resolved — same rollout applies here. |
| OQ-ZS-272 | Logging scope at MVP vs. the baseline's V1 placement (a fifth occurrence — see OQ-ZS-027/023/026/035/079). | Resolved — same MVP-minimal / V1-full split applies here, extended to security-event and support-access logging specifically. |
| OQ-ZS-273 | Encryption key management in the target hosting region. | Open — availability of a managed key-management service to be confirmed against the region's service catalog; fallback: platform-managed keys on storage separate from the data, with documented rotation. |
| OQ-ZS-274 | Deadline and terms for notifying schools of data breaches. | Resolved — a contractual 72-hour notification commitment, entered in the pilot agreement then the commercial contract. |
| OQ-ZS-275 | Response deadline for data-subject rights requests. | Resolved — 30 calendar days by default, configurable, a manual procedure from MVP onward; to be confirmed against ongoing CNDP monitoring. |
| OQ-ZS-276 | Cross-site recovery objectives and MVP-stage coverage, given the hosting region's single-availability-domain limitation. | Resolved — daily encrypted-backup replication to a second Moroccan site from MVP onward (a 24-hour fallback recovery point, recorded contractually); a full disaster-recovery plan with an 8-hour/15-minute recovery target in V1; until the second site is operational, the effective recovery point is degraded to the daily-backup interval. |
| OQ-ZS-277 | Final product position on biometric authentication. | Open — off the roadmap today (no requirement, would trigger a CNDP authorization); to be confirmed as a lasting exclusion in a later review. |

### NFR — `spec/cross-cutting/03-non-functional-requirements.md` — 9 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-281 | Timezone baseline update (an eighth occurrence — see OQ-ZS-001/038/161/180/189/200/214). | Escalated — same permanent-UTC+0 adoption applies here. |
| OQ-ZS-282 | Baseline's digital-usage figures (a fourth occurrence — see OQ-ZS-002/191/201/219). | Open — same corrected-national-survey adoption applies here. |
| OQ-ZS-283 | Choice of the second Moroccan failover site, given the primary hosting region's single-availability-domain limitation and the planned second region's lack of a timeline. | Open — several candidate Moroccan data-center sites are under consideration; the choice conditions the disaster-recovery target and the service catalog to verify. |
| OQ-ZS-284 | FR/AR bilingual-interface version: one baseline section says V1, another explicit decision and the version-scope section say MVP. | Resolved — MVP is adopted (the explicit decision governs); a baseline-document correction is owed. |
| OQ-ZS-285 | Native-app version: one baseline section says V2, another list mentions them under V1. | Resolved — V2 is adopted (the more detailed, later section governs); a baseline-document correction is owed. |
| OQ-ZS-286 | Offline operation (attendance, grades) version — appears without an explicit version tag in the baseline. | Resolved — retained as Must-MVP, since the affected journeys and persona needs are themselves Must-MVP. |
| OQ-ZS-287 | Webhook/public-API version — the baseline mentions webhooks with no version, implicitly ties them to a V2 public API. | Resolved — retained as V2. |
| OQ-ZS-288 | Notification channels at MVP (a founder arbitration, a sixth occurrence — see OQ-ZS-086/078/085/196/207). | Resolved — same MVP-attendance-only / V1-general-rollout split applies here. |
| OQ-ZS-289 | Values for the standard support commitment (response-time hours). | Open — working hypotheses proposed, to be confirmed with pilots and the product owner before the pilot agreement is signed. |

### PAK — `spec/cross-cutting/04-business-model-packaging.md` — 11 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-291 | Which market-size figures to keep, given several unsourced baseline figures and a corrected app-rating comparison (a second occurrence — see OQ-ZS-002). | Open — same corrected-research-figures adoption applies here; a baseline-document update is owed. |
| OQ-ZS-292 | Private schools' eligibility for a national digitalization-subsidy program is unconfirmed. | Open — to be disambiguated with the relevant regional economic-development office before any firm sales commitment. |
| OQ-ZS-293 | Final values of Morocco's standalone WhatsApp rate card, not yet published as of this document's date. | Open — the packaging configuration absorbs the switch with no product change required; the actual values are to be integrated once published. |
| OQ-ZS-294 | Exact active-student counting rule for billing purposes. | Resolved — a snapshot on the 1st of the month, mid-month changes taking effect at the next count, suspended enrollments excluded, a transfer counted once at origin; daily proration ruled out. |
| OQ-ZS-295 | Bringing the subscription-billing mechanics into MVP scope, though not explicitly listed in the baseline's MVP section. | Resolved — the business model itself is settled and MVP ships with billed pilots, so the counting mechanics must exist from MVP onward; a working assumption pending final confirmation. |
| OQ-ZS-296 | Commercial parameters not fixed by the baseline: trial duration, included-storage quota and above-quota pricing, onboarding/migration/training flat-rate amounts, premium-support definition and price, SMS pack pricing corridor, delinquency period before read-only, pilot-specific pricing terms. | Open — a founder-level commercial decision batch, none of it blocking current functional design. |
| OQ-ZS-297 | Payment methods and collection terms for ZSchool's own subscription invoice to schools (distinct from families' own payment methods). | Open — not specified by the baseline; to be defined separately from the family-facing payment rail. |
| OQ-ZS-298 | Tax treatment and mandatory notices on ZSchool's own subscription invoice (VAT applicability, e-invoicing timeline). | Open — to be confirmed by a tax advisor before commercial launch. |
| OQ-ZS-299 | Currency-conversion method for re-billing WhatsApp conversation costs (reference rate, conversion date, rounding). | Open — no exchange-rate source is currently cited; a conversion method is still to be defined as a configurable parameter. |
| OQ-ZS-300 | Horizon reading for the growth-ambition target dates (a second occurrence — see OQ-ZS-006). | Escalated — same escalated status applies here; see `spec/decisions/008-growth-ambition-horizon.md` and its two follow-on ADRs. |
| OQ-ZS-301 | Annual price-stability rule for the per-student unit price. | Open — a proposed rule (price contractually stable for the current school year, revisions taking effect only the following year) is pending confirmation and needs reflecting in the subscription contract and public price list. |

### UX — `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md` — 5 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-311 | PWA vs. native-app version — the baseline is internally contradictory across two of its own sections. | Resolved — PWA at MVP, native apps in V2, consistent with the non-functional-requirements resolution (OQ-ZS-361); a baseline-document correction is owed. |
| OQ-ZS-312 | Baseline usage figures and device-share claims (a fifth occurrence — see OQ-ZS-002/191/201/219/236). | Open — same corrected-figures adoption applies here; a device-share claim is also corrected to a web-traffic-share claim. |
| OQ-ZS-313 | WhatsApp pricing and consent-gathering mechanics for the UI layer. | Partially resolved — explicit opt-in/revocation UI adopted, the pricing switch modeled as a dated cost parameter; the actual published pricing grid is still open (see OQ-ZS-371). |
| OQ-ZS-314 | Whether Amazigh/Tifinagh script support belongs in this version's scope. | Open — out of MVP and V1 scope as a working hypothesis; possible V2+ content with no interface commitment yet. |
| OQ-ZS-315 | Timezone baseline update (a ninth occurrence — see OQ-ZS-001/038/161/180/189/200/214/235). | Escalated — same permanent-UTC+0 adoption applies here; no timezone selector is exposed in the interface as a consequence. |

### INT — `spec/cross-cutting/06-external-integrations.md` — 9 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-321 | A payment-provider reference no longer applicable in the integrations catalog (a fourth occurrence — see OQ-ZS-054/074/182). | Resolved — same provider-exclusion applies here; a baseline-document update is owed. |
| OQ-ZS-322 | Massar grade-module framing memo number (a third occurrence — see OQ-ZS-062/151/183). | Open — same pilot/ministry-confirmation status applies here; import formats worded independent of the exact memo number. |
| OQ-ZS-323 | Version of the WhatsApp channel for attendance notification (a founder arbitration, a seventh occurrence — see OQ-ZS-086/078/085/196/207/242). | Resolved — same MVP-attendance-only / V1-general-rollout split applies here; the specific tags in this chapter are aligned. |
| OQ-ZS-324 | A device-share claim corrected to a web-traffic-share claim (a second occurrence — see OQ-ZS-386). | Resolved — the correction is applied; the underlying push-first priority is unaffected. |
| OQ-ZS-325 | Hosting-region clarification: the planned second cloud region has no timeline, so the V1 disaster-recovery plan actually relies on an independent data-center site, not a second same-vendor region. | Resolved — this correction is applied; the pricing and managed-services catalog for the primary region is still to be consolidated by quote. |
| OQ-ZS-326 | Obtaining the primary payment rail's actual pricing, contract, and SLA. | Open — no public rate is available as of this document's date; a contracting deadline (go/no-go) is set, with a fallback integration mode in V1 if not signed by then. |
| OQ-ZS-327 | Morocco's standalone WhatsApp rate-card actual amounts (a third occurrence — see OQ-ZS-371/257). | Open — same not-yet-published status applies here; the integration's own cost-configuration parameter is to be updated once published. |
| OQ-ZS-328 | Selecting the certification-service provider for V2 qualified electronic sealing/timestamping. | Open — no public rate exists (quote-based); a vendor tender is to be launched, verifying per-service licenses and API coverage. |
| OQ-ZS-329 | Timezone baseline update (a tenth occurrence — see OQ-ZS-001/038/161/180/189/200/214/235/259). | Escalated — same permanent-UTC+0 adoption applies here, including at the systems-integration layer (time-zone-data configuration). |

### CNF — `spec/cross-cutting/07-legal-compliance-data-protection.md` — 11 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-331 | The regulatory template for the annual written school-parent contract required by the private-education law. | Open — no implementing order published as of this document's date; a configurable contract covering known obligations is shipped now, to be aligned once published. |
| OQ-ZS-332 | Exact content of the privacy notice and validating the template. | Open — no rule specific to minors exists under positive law; the template needs a legal-counsel review before rollout. |
| OQ-ZS-333 | Response deadline for data-subject rights requests (a third occurrence — see OQ-ZS-351). | Resolved — same 30-day default applies here. |
| OQ-ZS-334 | Activating compliance building blocks at MVP, though the baseline places formalized CNDP compliance in V1. | Resolved — a requirement-by-requirement justification moves the essential building blocks (a manual rights procedure, the pilot agreement, an initial processing-activity list, the parent contract) to MVP; a working hypothesis pending final product-owner confirmation. |
| OQ-ZS-335 | Retention periods for categories absent from the baseline (file supporting documents, identity documents, consent traces). | Open — a default is proposed (aligned with the student-life retention period); to be settled in a later review and then formally logged. |
| OQ-ZS-336 | The e-invoicing rollout timeline. | Open — no implementing decree published; press reports describe a phased B2B-first rollout with B2C not currently planned; the platform's own export configuration limits the exposure to change. |
| OQ-ZS-337 | The personal-data-protection law's own revision status. | Open — no revision text filed with the legislature as of this document's date; a future GDPR-aligned revision (a data-protection-officer role, breach notification, digital consent) would trigger a compliance review, so the rights architecture is deliberately built extensible. |
| OQ-ZS-338 | Activating the "guardianship regime" configuration parameter once a Family Code reform actually takes effect (a third occurrence — see OQ-ZS-312/225). | Open — same not-yet-enacted status applies here; a re-qualification campaign would be needed once/if it takes effect, to avoid defaults that have become legally incorrect. |
| OQ-ZS-339 | The compliance sequence for the health module, given the multi-month authorization lead time for health-data processing. | Open — a proposal requires attestation before health-record data entry opens; filings should be planned well ahead of any V2 health-module rollout. |
| OQ-ZS-340 | An acceptable MVP degradation of logging (a founder arbitration, a sixth occurrence — see OQ-ZS-027/023/026/035/079/229). | Resolved — same MVP-minimal / V1-full split applies here. |
| OQ-ZS-341 | Retention period for electronic parental authorizations (a third occurrence — see OQ-ZS-088/087). | Open — same 5-year working-hypothesis proposal applies here, pending founder confirmation. |

### RDM — `spec/roadmap.md` (was `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`) — 7 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-351 | How to read the growth-ambition target's "year 1" and "at three years" language against the actual roadmap milestone dates (a third occurrence — see OQ-ZS-006/253). | Escalated — a reference reading is adopted as a working default; an alternative reading exists with a materially earlier go/no-go implication; a founder decision is required. |
| OQ-ZS-352 | Pilot onboarding mode: progressive mid-year onboarding vs. waiting for a full school-year start. | Resolved — progressive mid-year onboarding is the reference scenario, provided the MVP core is validated in time; a fallback switch-over date is set, after which the "wait for next school-year start" plan applies instead. |
| OQ-ZS-353 | Native-app version (a third occurrence — see OQ-ZS-361/255). | Resolved — same V2+ reading applies here, with push notifications delivered via the installed web app in V1 regardless of the native-app decision. |
| OQ-ZS-354 | Updating the historical baseline document with every correction identified by research and by the review's own arbitrations. | Escalated — a consolidated list of corrections is ready; formally publishing a new baseline-document version incorporating them is a product-owner action. |
| OQ-ZS-355 | Numeric thresholds for the MVP-to-V1 adoption go/no-go criteria. | Resolved — the non-functional gates are fixed (non-negotiable, baseline-derived); the adoption-rate thresholds themselves are working targets pending founder confirmation, detailed in `spec/metrics.md`. |
| OQ-ZS-356 | MVP support-service-level numeric values. | Resolved — the service-level structure itself is fixed; the numeric response-time values are pending founder confirmation (see OQ-ZS-365). |
| OQ-ZS-357 | Founder confirmation of the two-wave MVP scope extension and its development workload before the pilot-activation deadline. | Escalated — without confirmation before the relevant milestone, a documented fallback scenario (an assisted manual year-end close, with an explicit founder waiver) applies instead. |

### KPI — `spec/metrics.md` (was `prd/cross-cutting/38-kpi-success-metrics.md`) — 7 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-361 | Timezone baseline update (an eleventh occurrence — see OQ-ZS-001/038/161/180/189/200/214/235/259/268). | Escalated — same permanent-UTC+0 adoption applies here, for measurement-timestamp consistency. |
| OQ-ZS-362 | The monthly "active student" counting rule for metrics purposes (a second occurrence — see OQ-ZS-025/247). | Resolved — the same single counting rule applies to both billing and metrics; a related mid-year-proration question stays open in `spec/domain-model.md` without affecting this chapter's own consistency target. |
| OQ-ZS-363 | A minimum cohort size before publishing cross-school comparison metrics, to avoid re-identifying individuals. | Open — a proposed minimum-respondent threshold is pending confirmation. |
| OQ-ZS-364 | An operational definition of "response to a reminder" for a specific collections metric. | Open — three candidate definitions exist (full payment, a logged payment commitment, a tracked contact); the choice must be settled before the first full collections cycle. |
| OQ-ZS-365 | Satisfaction-score (NPS) targets with no sourced local benchmark. | Open — no reference benchmark exists for Moroccan private education; current targets are internal working choices, to be recalibrated after the first pilot wave. |
| OQ-ZS-366 | Numbering/namespace question for a small set of measurement-governance requirements mixed into the metric-ID sequence. | Resolved — the existing identifiers are kept as-is (never renumbered); the namespace's scope is extended to cover them; no other chapter mints a metric ID of its own. |
| OQ-ZS-367 | Numeric targets for several newly added indicators with no sourced benchmark. | Open — to be recalibrated after the first pilot year-end close and confirmed alongside the broader MVP-scope-extension decision; one indicator also depends on the still-unpublished WhatsApp rate card. |

### RSK — `spec/risks.md` (was `prd/cross-cutting/39-risks-mitigations.md`) — 5 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-371 | A baseline-document update needed: a payment provider referenced in the risk register ceased operating in 2024 (a fifth occurrence — see OQ-ZS-054/074/182/260). | Escalated — same provider-exclusion applies here, affecting one risk entry and the V2 card-rail comparison. |
| OQ-ZS-372 | A baseline-document refinement needed on the hosting-region failover plan, given the single-availability-domain limitation (a second occurrence — see OQ-ZS-356). | Resolved — [ADR-ZS-091](decisions/091-eu-hosting-deviation-from-morocco-baseline.md) (Accepted, 2026-09-09) superseded the OCI single-availability-domain premise entirely: hosting moved to AWS `eu-central-1`/`eu-west-3`, settling the backup-site and replication-timeline question. |
| OQ-ZS-373 | A baseline-document update needed on the WhatsApp pricing-switch mechanics (a fourth occurrence — see OQ-ZS-082/081/246/266). | Escalated — same not-yet-published-grid status applies here, affecting one risk entry's exposure rating. |
| OQ-ZS-374 | A baseline-document update needed on Law 59.21's actual publication date and content (a third occurrence — see OQ-ZS-003/185). | Escalated — same corrected-date/content adoption applies here, affecting one risk entry. |
| OQ-ZS-375 | A baseline-document update needed on the Family Code reform's actual legal status (a fourth occurrence — see OQ-ZS-312/225/276). | Escalated — same not-yet-enacted status applies here, affecting one risk entry tied to the legal-tutor mechanics. |

### Assumptions/tracking chapter — questions specific to `prd/cross-cutting/40-assumptions-open-questions-tracker.md` — 9 questions

These nine questions were raised by the old cross-cutting tracking chapter itself, distinct from
the ~250 questions it mechanically re-listed from every other chapter above (all already
consolidated above under their true owning chapter, not duplicated here).

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-381 | The exact format of Massar exchange files and ministry-statistics-platform templates, across every module that consumes them. | Open — cross-cutting instance of OQ-ZS-224/261; validating generated templates against each pilot's real files, per cycle, is the resolution path; possibly also resolves the framing-memo question (OQ-ZS-062/151/183/261). |
| OQ-ZS-382 | The primary payment rail's pricing, contract terms, and SLA (a cross-cutting instance of OQ-ZS-396, tying together the finance and integrations chapters). | Open — signing the vendor partnership and a negotiated rate card would resolve this; the V1 payment rail cannot be fully activated commercially without it. |
| OQ-ZS-383 | The regulatory template for the annual written school-parent contract (a cross-cutting instance of OQ-ZS-331, tying together the finance, admissions, and compliance chapters). | Open — same not-yet-published-order status applies here. |
| OQ-ZS-384 | Whether repealed-law quotas (permanent-teacher share, the 8-hour cap) carry over into the current law or its decrees (a cross-cutting instance of OQ-ZS-033/133/197, tying together the career and compliance chapters). | Open — same regulatory-monitoring status applies here. |
| OQ-ZS-385 | Private-school eligibility for the national digitalization-subsidy program (a cross-cutting instance of OQ-ZS-367). | Open — same regional-office-confirmation status applies here. |
| OQ-ZS-386 | The exact figures for Morocco's standalone WhatsApp rate card (a cross-cutting instance of OQ-ZS-371/257/266/296, tying together the integrations and packaging chapters). | Open — same not-yet-published status applies here; locking in cost assumptions and routing rules is the resolution path. |
| OQ-ZS-387 | Publishing a new, corrected version of the historical baseline document incorporating every correction identified across the whole specification (a cross-cutting instance of OQ-ZS-354). | Escalated — a product-owner action; every corrected fact used throughout this specification is cited to its research source until that new version exists. |
| OQ-ZS-388 | Exact numbering of specific Family Code articles on visitation rights, and written tax-authority doctrine on schooling's VAT-exempt status. | Open — to be confirmed against the Official Gazette and written tax counsel respectively; document legal notices are limited to already-confirmed article numbers in the meantime. |
| OQ-ZS-389 | Online payment's scope by version — the clearest single instance of the recurring "primary rail from V1" vs. baseline-version-list divergence pattern (OQ-ZS-004/028/072/226), stated here as the founder-facing decision itself. | Resolved by the governing decision — the online-payment rail is confirmed for V1; the divergence from an older baseline reading is recorded until a baseline-document update closes it. |

### Glossary — `spec/glossary.md` (was `prd/cross-cutting/41-glossary.md`) — 6 questions

| ID | Question | Status / Context |
|---|---|---|
| OQ-ZS-391 | Timezone baseline update (a twelfth occurrence — see OQ-ZS-001/038/161/180/189/200/214/235/259/268/287). | Escalated — the glossary adopts permanent UTC+0 for its "Schedule variant" entry; a baseline-document update is owed. |
| OQ-ZS-392 | Law 59.21 baseline-reference update (a fourth occurrence — see OQ-ZS-003/185/297). | Escalated — the glossary's law-related entries carry the up-to-date fact; the legal-tutor/legal-guardian distinction is unaffected. |
| OQ-ZS-393 | Suspension date of two assessment-weighting memoranda (a second occurrence — see OQ-ZS-272). | Escalated — the glossary's assessment entries rest on the standard weightings currently in force; the 2021-2022 exceptional variant is kept as historical record. |
| OQ-ZS-394 | Remove a discontinued payment-provider reference from the glossary (a sixth occurrence — see OQ-ZS-054/074/182/260/294). | Escalated — same provider-exclusion applies here. |
| OQ-ZS-395 | Budget the WhatsApp pricing change into the glossary's own definitions (a fifth occurrence — see OQ-ZS-082/081/246/266/296). | Escalated — the glossary's WhatsApp-related entries carry this data; the communication and integrations chapters must plan for a dated pricing-switch parameter. |
| OQ-ZS-396 | Confirm a slang term found only once in a single research source, with a non-standard spelling. | Open — a working hypothesis (the term means the computerized administrative data-entry workload) is adopted; to be confirmed with pilots before use in any screen or communication. |

---

## Traceability

Cross-reference coverage for every `OQ-ZS-NNN` above (which `BEH-ZS`/`ADR-ZS`/`INV-ZS`/etc. entries
cite which open question) is consolidated in `spec/traceability.md` §8, built in a later migration
phase.
