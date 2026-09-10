> **Document Control**
>
> | Property       | Value                                                                                                                                                                                                                                                                                                             |
> | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-CC-03                                                                                                                                                                                                                                                                                                     |
> | Revision       | 1.1                                                                                                                                                                                                                                                                                                               |
> | Effective Date | 2026-09-09                                                                                                                                                                                                                                                                                                        |
> | Status         | Draft                                                                                                                                                                                                                                                                                                             |
> | Author         | ZSchool Product                                                                                                                                                                                                                                                                                                   |
> | Classification | Functional Specification — Non-Functional Requirements                                                                                                                                                                                                                                                            |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/cross-cutting/32-non-functional-requirements.md` (v0.3), old `NFR-<DOM>-NN` -> `NFR-ZS-001..050`, per `spec/process/id-migration-map.md` (CCR-ZS-001). 1.1 (2026-09-09): NFR-ZS-009/010 redefined for AWS `eu-central-1`/`eu-west-3` per ADR-ZS-091 (Accepted) (CCR-ZS-002). |

# Non-Functional Requirements

This chapter translates the historical baseline's chapter 10 (`spec/appendices/00-project-baseline.md`, gap G-21 closed, see `spec/appendices/01-review-history.md`) into measurable non-functional requirements, organized into ten domains, each with its own exclusive `NFR-ZS-NNN` identifier drawn from a single flat sequence (the domain code — PERF, DISP, I18N, MOB, OFF, DOC, OBS, INT, SAV, RES — is kept visible in each requirement's title, since it groups related requirements meaningfully; per `spec/process/requirement-id-scheme.md`, module/domain/persona/integration codes stay unchanged, opaque identifiers).

Out of scope for this file (covered elsewhere, without duplication): application security and data protection requirements (`spec/cross-cutting/02-security-privacy.md`), permissions and action logging (`spec/cross-cutting/01-permissions.md`, INV-ZS-090), legal and CNDP compliance (`spec/cross-cutting/07-legal-compliance-data-protection.md`), detailed UX and the accessibility standard (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`), external integration specifications (`spec/cross-cutting/06-external-integrations.md`).

Module chapters (`spec/behaviors/01-administration-onboarding-subscription.md` to `spec/behaviors/14-health-sensitive-data.md`) cite these requirements in their "Module-specific non-functional requirements" section without redefining them.

## 1. ID/Title/Priority summary

| ID         | Domain | Title                                                                 | Priority                      | Version                        |
| ---------- | ------ | --------------------------------------------------------------------- | ----------------------------- | ------------------------------ |
| NFR-ZS-001 | PERF   | Usual pages displayed in under 2 seconds on 4G                        | Must                          | MVP                            |
| NFR-ZS-002 | DISP   | Maintenance windows outside critical periods                          | Must                          | MVP                            |
| NFR-ZS-003 | PERF   | Report card generated in under 3 seconds                              | Must                          | MVP                            |
| NFR-ZS-004 | PERF   | Low-bandwidth mode and degraded networks                              | Must                          | MVP                            |
| NFR-ZS-005 | PERF   | Report cards for a 2,000-student school published in under 10 minutes | Must                          | MVP                            |
| NFR-ZS-006 | PERF   | Imports and bulk operations handled without blocking                  | Must                          | MVP                            |
| NFR-ZS-007 | MOB    | Channel reliability and automatic fallback                            | Must                          | MVP / V1                       |
| NFR-ZS-008 | DISP   | 99.5% availability excluding announced maintenance                    | Must                          | MVP                            |
| NFR-ZS-009 | DISP   | Disaster recovery plan across two EU regions                          | Must                          | MVP (fallback) / V1 (full)     |
| NFR-ZS-010 | SAV    | Daily backups hosted in the EU                                        | Must                          | MVP                            |
| NFR-ZS-011 | SAV    | Quarterly restore test                                                | Must                          | MVP                            |
| NFR-ZS-012 | DISP   | Degraded mode and read priority                                       | Should                        | V1                             |
| NFR-ZS-013 | DISP   | Error budget and peak absorption                                      | Must                          | MVP                            |
| NFR-ZS-014 | DISP   | Standard support commitment included                                  | Must                          | MVP                            |
| NFR-ZS-015 | I18N   | Bilingual FR/AR interface with full RTL from MVP                      | Must                          | MVP                            |
| NFR-ZS-016 | I18N   | People's names in dual script throughout                              | Must                          | MVP                            |
| NFR-ZS-017 | I18N   | English in V2                                                         | Should                        | V2                             |
| NFR-ZS-018 | I18N   | `Africa/Casablanca` timezone at permanent UTC+0                       | Must                          | MVP                            |
| NFR-ZS-019 | I18N   | Hijri and Gregorian calendars for holidays                            | Must                          | MVP                            |
| NFR-ZS-020 | I18N   | Bilingual school-defined content                                      | Should                        | MVP                            |
| NFR-ZS-021 | MOB    | Responsive web and PWA from MVP                                       | Must                          | MVP                            |
| NFR-ZS-022 | MOB    | Native Android and iOS apps in V2                                     | Must (Android) / Should (iOS) | V2                             |
| NFR-ZS-023 | MOB    | Absence notification in under 5 minutes after attendance is taken     | Must                          | MVP                            |
| NFR-ZS-024 | OBS    | Service metrics and operational alerts                                | Must                          | MVP                            |
| NFR-ZS-025 | MOB    | Critical journeys adapted to entry-level devices                      | Must                          | MVP                            |
| NFR-ZS-026 | MOB    | Supported browser and OS floor                                        | Must                          | MVP                            |
| NFR-ZS-027 | OFF    | Attendance-taking tolerant of outages                                 | Must                          | MVP                            |
| NFR-ZS-028 | OFF    | Dedicated offline test plan for iOS (PWA)                             | Must                          | MVP                            |
| NFR-ZS-029 | OFF    | Grade entry tolerant of outages                                       | Must                          | MVP                            |
| NFR-ZS-030 | OFF    | Idempotent sync when the network returns                              | Must                          | MVP                            |
| NFR-ZS-031 | OFF    | Deterministic resolution of entry conflicts                           | Must                          | MVP (basic) / V1 (review UI)   |
| NFR-ZS-032 | DOC    | Every document produced as a bilingual PDF                            | Must                          | MVP / V1                       |
| NFR-ZS-033 | DOC    | Correct Arabic fonts and A4/A5 formats                                | Must                          | MVP / V1                       |
| NFR-ZS-034 | DOC    | Batch printing                                                        | Must                          | MVP / V1                       |
| NFR-ZS-035 | DOC    | Printed, scannable verification QR code                               | Must                          | V1                             |
| NFR-ZS-036 | OBS    | Per-tenant observability                                              | Must                          | MVP                            |
| NFR-ZS-037 | OBS    | Immutable, exportable audit log                                       | Must                          | MVP / V1                       |
| NFR-ZS-038 | OBS    | End-to-end correlation and logged support access                      | Must                          | MVP                            |
| NFR-ZS-039 | OBS    | Per-school consumption counters                                       | Must                          | MVP                            |
| NFR-ZS-040 | INT    | Excel, CSV, and PDF exports on every list and report                  | Must                          | MVP / V1                       |
| NFR-ZS-041 | INT    | File exchange conventions                                             | Must                          | MVP                            |
| NFR-ZS-042 | INT    | Documented public API in V2                                           | Should                        | V2                             |
| NFR-ZS-043 | INT    | Business-event webhooks in V2                                         | Should                        | V2                             |
| NFR-ZS-044 | SAV    | At least 30-day retention                                             | Must                          | MVP                            |
| NFR-ZS-045 | SAV    | Granular per-school restore                                           | Must                          | V1                             |
| NFR-ZS-046 | RES    | Three-year capacity target                                            | Must                          | V1 (validation)                |
| NFR-ZS-047 | RES    | Absorbing seasonal peaks                                              | Must                          | V1                             |
| NFR-ZS-048 | RES    | Fair service across tenants                                           | Must                          | V1                             |
| NFR-ZS-049 | RES    | Controlled document storage                                           | Must                          | MVP                            |
| NFR-ZS-050 | RES    | Accessibility of the main journeys                                    | Must                          | MVP (WCAG target) / V1 (audit) |

## 2. Measurement and versioning conventions

- **Version**: every requirement carries an MVP / V1 / V2+ tag per the historical baseline §12 (ADR-ZS-015). Where the baseline's chapter 10 and chapter 12 diverge in wording (native apps; FR/AR positioning), the tag adopted here is logged in `spec/open-questions.md`.
- **Usual page**: any screen listing or displaying a tenant's data (dashboards, lists, records, entry forms) delivered by the web app or the PWA. Excluded: PDF documents (asynchronous generation, NFR-ZS-003) and file uploads.
- **Reference network**: median Moroccan mobile throughput is high (60.31 Mbps, DataReportal Digital 2026, `spec/research/05-infrastructure-usage.md` §2), but real classroom and rural usage is degraded. Performance targets are calibrated on a degraded 4G mobile connection (effective downlink of 5 Mbps, 150 ms round-trip latency), a definition to be finalized in technical review.
- **Measurements**: 95th-percentile latencies over a 30-day rolling window, measured client-side (time to interactive) for pages and server-side for document generation; thresholds exclude asynchronous tasks.
- **Availability**: monthly percentage computed by external probes on entry points, excluding announced maintenance windows (NFR-ZS-002) and third-party service outages (SMS aggregators, WhatsApp, e-signature vendors).
- **Critical periods**: the start of the school year (classes mandatory from Monday, September 7, 2026, `spec/research/04-pedagogy-massar-calendar.md` §1), national exams (national baccalaureate, June 1–3, 2027), end-of-period closings and report-card publications, re-enrollment campaigns.
- **Actors**: principal's office (principal, school group), registrar-cashier's office, head supervisor and supervisors, teachers, parents, students, ZSchool operator (operations, support).

---

## 3. Performance

### NFR-ZS-001: [PERF] Usual pages displayed in under 2 seconds on 4G

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Every usual page (definition §2) MUST be displayed and interactive in under 2 seconds on a 4G mobile connection (measurement reference §2), at the 95th percentile of real sessions.

The initial payload of key pages is kept small (see NFR-ZS-004). Traceability: `spec/appendices/00-project-baseline.md` §10, §2.10; `spec/appendices/01-review-history.md` (H-11); URS-ZS-017; `spec/research/05-infrastructure-usage.md` §2. Actors: all.

### NFR-ZS-002: [DISP] Maintenance windows outside critical periods

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-451`](../../features/cross-cutting/nfr/nfr-zs-002-maintenance-window.feature)

REQUIREMENT: Every planned maintenance MUST be announced at least 7 days in advance to school administrators (email and in-app announcement) and flagged with a banner during the window; maximum 4-hour duration per event, overnight slot (default: 00:00–05:00, `Africa/Casablanca` time). No window MUST fall during: the start of the school year (September), year-end exams and publications (May to June, including national exams), class councils and report-card publications announced by a school.

Emergency interventions (security, imminent data loss) are the exception and are communicated after the fact with an incident report. Traceability: `spec/appendices/00-project-baseline.md` §10, §2.11; `spec/research/04-pedagogy-massar-calendar.md` §1. Actors: principal's office, ZSchool operator.

### NFR-ZS-003: [PERF] Report card generated in under 3 seconds

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Generating a student's complete report card (per-subject and overall averages, rank, honors, remarks, bilingual FR/AR rendering, stamp and QR where applicable) MUST complete in under 3 seconds server-side, at the 95th percentile.

A published report card stays locked and versioned (INV-ZS-085, INV-ZS-015): the performance target never overrides immutability. Traceability: `spec/appendices/00-project-baseline.md` §10, §7.5; INV-ZS-085; INV-ZS-015; JMP-ZS-006. Actors: principal's office, registrar's office, teachers, parents, students.

### NFR-ZS-004: [PERF] Low-bandwidth mode and degraded networks

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Critical journeys (attendance-taking, grade entry, parent viewing, certificate issuance) MUST remain usable on a weak connection: an initial payload under 500 KB excluding uploaded documents, compressed and cached resources, lightweight images, no large blocking resource. The NFR-ZS-001 response-time target MUST be maintained on the degraded reference connection.

Rationale: rural household internet access remains at 78.4% versus 93.6% urban (ANRT 2024-2025, `spec/research/05-infrastructure-usage.md` §2). Traceability: `spec/appendices/00-project-baseline.md` §2.10; `spec/appendices/01-review-history.md` (H-11); URS-ZS-017, URS-ZS-027, URS-ZS-028; `spec/research/05-infrastructure-usage.md` §2. Actors: teachers, supervisors, parents, students, registrar's office.

### NFR-ZS-005: [PERF] Report cards for a 2,000-student school published in under 10 minutes

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-452`](../../features/cross-cutting/nfr/nfr-zs-005-batch-report-card-publication.feature)

REQUIREMENT: Publishing a period's report cards for a 2,000-student school (generation, locking each report card, making them available to families, triggering notifications) MUST complete in under 10 minutes. Progress MUST be visible in real time; a partial failure MUST resume without regenerating already-published report cards; no notification MUST be sent for an unpublished report card.

Traceability: `spec/appendices/00-project-baseline.md` §10, §7.5; ADR-ZS-035 (pilot group of over 2,000 students); INV-ZS-085; JMP-ZS-006. Actors: principal's office, registrar's office.

### NFR-ZS-006: [PERF] Imports and bulk operations handled without blocking

> **Priority:** Must
> **Version:** MVP (onboarding import)

REQUIREMENT: The onboarding Excel import (academic structure and headcount) for a 2,000-student school MUST complete in under 15 minutes with a downloadable, exhaustive error report; the operator stays informed of progress and can continue other tasks. Bulk notification sends for a school MUST be processed in the background without blocking the interface (see NFR-ZS-007).

Traceability: `spec/appendices/00-project-baseline.md` §12, §7.1; ADR-ZS-035; `spec/appendices/01-review-history.md` (G-18); JMP-ZS-003. Actors: ZSchool operator, principal's office, registrar's office.

---

## 4. Availability and continuity

### NFR-ZS-008: [DISP] 99.5% availability excluding announced maintenance

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: The service MUST be available at least 99.5% of the time each calendar month, excluding announced maintenance windows (NFR-ZS-002) and excluding a site-level disaster (covered by the disaster recovery plan NFR-ZS-009 with its own RTO/RPO targets — historical alias D5, ADR-ZS-066 §ARB-25i), measured per convention §2.

A monthly availability report (global and per tenant) is kept by operations and available to schools on request. Traceability: `spec/appendices/00-project-baseline.md` §10. Actors: all; ZSchool operator.

### NFR-ZS-009: [DISP] Disaster recovery plan across two EU regions

> **Priority:** Must
> **Version:** MVP (daily off-site replication, 24-hour fallback RPO recorded, ADR-ZS-066 §ARB-25h); V1 (full disaster recovery plan, tested failover)

REQUIREMENT: **Redefined by [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md)
(Accepted, 2026-09-09), superseding the original Morocco-hosting baseline
([ADR-ZS-007](../decisions/007-hosting-and-cross-border-transfer-morocco.md)).**
Production MUST be hosted in the EU, on AWS `eu-central-1` (Frankfurt): a
disaster recovery plan to a second EU region, `eu-west-3` (Paris), is
mandatory. Targets, applicable only to a region-level disaster (historical
alias D5, ADR-ZS-066 §ARB-25i; NFR-ZS-008's SLA excludes a disaster):
service recovery within 8 hours maximum (RTO) and data loss of 15 minutes
maximum (RPO); meeting a 15-minute RPO requires continuous replication or
log archiving at least every fifteen minutes to the second region, in
addition to daily backups (NFR-ZS-010).

From MVP onward (ADR-ZS-066 §ARB-25h), encrypted backups MUST be replicated daily to `eu-west-3` (SEC-ZS-023, CNF-ZS-012): the MVP fallback RPO is 24 hours and the fallback RTO is that of a full restore as measured by NFR-ZS-011; these fallback values are recorded in the pilot agreement (CNF-ZS-002). The full disaster recovery plan (failover, RTO 8h / RPO 15min, annual exercise) ships in V1. Traceability: `spec/appendices/00-project-baseline.md` §10; ADR-ZS-091, ADR-ZS-007 (superseded baseline); `spec/appendices/01-review-history.md` (H-18). Actors: ZSchool operator.

### NFR-ZS-012: [DISP] Degraded mode and read priority

> **Priority:** Should
> **Version:** V1

REQUIREMENT: In a major incident, the recovery order MUST prioritize high-value reads first (published report cards, timetable, already-generated documents), then routine writes. No write accepted during degradation SHOULD be silently lost: either an explicit denial with a status message, or a queue resumed after recovery.

The recovery order is documented in the disaster recovery plan (NFR-ZS-009). Traceability: `spec/appendices/00-project-baseline.md` §10; INV-ZS-085 (immutable published report cards). Actors: all; ZSchool operator.

### NFR-ZS-013: [DISP] Error budget and peak absorption

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: The server error rate (5xx) MUST stay below 0.5% of monthly requests. During the start-of-year and end-of-period peaks (§2.11), response times for write journeys MUST NOT degrade by more than 20% relative to nominal load.

Rationale: connection failures and blank screens are the dominant complaints about the ministry's Massar applications (Moutamadris 3.1/5 across roughly 7,060 reviews, `spec/research/01-market-competition.md` §4); reliability is a direct purchase criterion. Traceability: `spec/appendices/00-project-baseline.md` §2.11; ADR-ZS-008; `spec/research/01-market-competition.md` §4. Actors: all; ZSchool operator.

### NFR-ZS-014: [DISP] Standard support commitment included

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: The standard support included in the subscription (PAK-ZS-017) MUST be defined measurably: a single channel (in-app form and a dedicated email address) accessible to the principal's office, registrar's office, and system administrator roles; response in French and Arabic; business hours Monday to Friday 08:30–18:00 and Saturday 08:30–12:30 (`Africa/Casablanca` time), extended during the start of the school year (September) and report-card publications; first response within 4 business hours for a blocker (attendance-taking, payments, or publication impossible), within 1 business day for a defect, within 3 business days for a request; tracked by numbered ticket; any data access on a ticket follows SEC-ZS-009.

During the pilot phase, a named point of contact per school supplements the channel. The values are working hypotheses to be confirmed with the pilots, tracked in `spec/open-questions.md`. Traceability: `spec/appendices/00-project-baseline.md` §8.1, §11; PAK-ZS-017; SEC-ZS-009; ADR-ZS-066. Actors: principal's office, registrar's office, system administrator, ZSchool operator.

---

## 5. Languages, timezone, and internationalization

### NFR-ZS-015: [I18N] Bilingual FR/AR interface with full RTL from MVP

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: The entire interface MUST be available in French and Arabic from MVP onward, with full support for right-to-left reading: mirrored layouts, directional icons, and tables, form alignment, date and number formats, entry states. The language toggle MUST be instant and specific to each user: language is attached to the account, not the device, so that two accounts used on the same shared family phone each keep their own language (UX-ZS, ADR-ZS §ARB-21c); it also governs the language of SMS, WhatsApp messages, and notifications addressed to that person.

No untranslated string is accepted in production on shipped journeys. Dual-script names are handled by NFR-ZS-016. The baseline says "FR and AR in V1" (§10) while ADR-ZS-021 and §12 set them at MVP: divergence logged in `spec/open-questions.md`, MVP tag retained. Traceability: `spec/appendices/00-project-baseline.md` §2.9, §10, §12; ADR-ZS-021; `spec/appendices/01-review-history.md` (G-10). Actors: all.

### NFR-ZS-016: [I18N] People's names in dual script throughout

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Every person's first and last name MUST be entered in dual script (Latin and Arabic), as distinct fields; official documents (report cards, transcripts, certificates, attestations, exit file) and Massar exports MUST carry both scripts. A missing Arabic or Latin script for a documented person triggers a completeness alert on document-related journeys, without blocking other uses.

Traceability: `spec/appendices/00-project-baseline.md` §2.9, §10; ADR-ZS-021; `spec/domain-model.md` §2.1 (`Person`). Actors: principal's office, registrar's office, teachers.

### NFR-ZS-017: [I18N] English in V2

> **Priority:** Should
> **Version:** V2

REQUIREMENT: The interface SHOULD be available in English in V2 for international sections and schools following a foreign curriculum; official documents remain produced in FR/AR by default, with English added as an optional template language.

The internationalization framework (label files, formats, timezone) is put in place from MVP onward so as not to redo the interface in V2. Traceability: `spec/appendices/00-project-baseline.md` §10, §12, §2.3. Actors: principal's office, teachers, parents, students.

### NFR-ZS-018: [I18N] `Africa/Casablanca` timezone at permanent UTC+0

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-453`](../../features/cross-cutting/nfr/nfr-zs-018-permanent-utc0-timestamp.feature)

REQUIREMENT: All timestamps MUST be stored in UTC and displayed in the `Africa/Casablanca` timezone, which has been permanently UTC+0 since September 20, 2026, at 02:00 (Decree No. 2.26.530, Official Gazette No. 7521 of 06/29/2026): there is no longer any seasonal alternation or Ramadan exception (`spec/research/04-pedagogy-massar-calendar.md` §1).

Timezone data (tzdata) is kept up to date; no historical calculation depends on a clock change. Ramadan's lighter hours remain a pedagogical need handled as a timetable variant (V1, academic-structure chapter), not a timezone issue. The baseline update (§2.4 and §10 still mention the alternation) is logged in `spec/open-questions.md`. Traceability: `spec/appendices/00-project-baseline.md` §2.4, §10; `spec/research/04-pedagogy-massar-calendar.md` §1. Actors: all.

### NFR-ZS-019: [I18N] Hijri and Gregorian calendars for holidays

> **Priority:** Must
> **Version:** MVP (calendar and holidays); associated schedule variants in V1

REQUIREMENT: Every school's annual calendar MUST carry national holidays (fixed Gregorian dates) and moveable religious holidays (Eid al-Fitr, Eid al-Adha, Islamic New Year, Mawlid) on both the Hijri and Gregorian calendars. Religious dates are pre-loaded as "to be confirmed" (2026-2027 examples: Ramadan 1448 approximately 02/08 to 03/09-10/2027; Eid al-Adha approximately 05/16 to 18/2027) and updated during the year upon the official announcement via lunar sighting (Ministry of Habous); the update propagates to timetables and notifications.

Ministry-set school-year dates are pre-loaded each year. Traceability: `spec/appendices/00-project-baseline.md` §2.4, §10, §12; `spec/research/04-pedagogy-massar-calendar.md` §1; `spec/domain-model.md` §2.3 (`Calendar`, `Holiday`). Actors: principal's office, registrar's office, teachers, parents, students.

### NFR-ZS-020: [I18N] Bilingual school-defined content

> **Priority:** Should
> **Version:** MVP

REQUIREMENT: Labels configurable by the school (subject names, standard remarks, absence and sanction reasons, document categories) SHOULD be available in FR and AR. Free-form content (remarks, messages, entered reasons) is in the language chosen by the author and rendered as-is; document templates insert it into a layout consistent with the reading direction.

Traceability: `spec/appendices/00-project-baseline.md` §2.9; ADR-ZS-021; `spec/domain-model.md` §2.4. Actors: principal's office, teachers, registrar's office.

---

## 6. Platforms and mobility

### NFR-ZS-021: [MOB] Responsive web and PWA from MVP

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: The web app MUST be responsive, designed mobile-first, and installable as a progressive web app (PWA): home-screen icon, standalone mode, session resume. It MUST be fully usable on an older computer and the schools' common browsers (URS-ZS-017), with no feature requiring recent hardware.

The PWA is the platform for parents, students, and teachers at MVP. Traceability: `spec/appendices/00-project-baseline.md` §10, §12, §2.10; URS-ZS-017. Actors: all.

### NFR-ZS-022: [MOB] Native Android and iOS apps in V2

> **Priority:** Must (Android), Should (iOS)
> **Version:** V2

REQUIREMENT: Native Android and iOS apps MUST be published in V2 with feature parity for the parent, student, and teacher journeys relative to the PWA, and native push notifications.

Android is prioritized (67.96% of mobile web traffic versus 32.02% for iOS, StatCounter August 2026 — traffic share, not device base, `spec/research/05-infrastructure-usage.md` §2). The baseline mentions "native apps" in its V1 list (§12) but sets them in V2 (§10): divergence logged in `spec/open-questions.md`, V2 tag retained. Traceability: `spec/appendices/00-project-baseline.md` §10, §12, §2.10; `spec/research/05-infrastructure-usage.md` §2. Actors: parents, students, teachers.

### NFR-ZS-023: [MOB] Absence notification in under 5 minutes after attendance is taken

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-454`](../../features/cross-cutting/nfr/nfr-zs-023-absence-notification-latency.feature)

REQUIREMENT: Between the server receiving confirmation of a class's attendance and delivery of the absence notification to the active legal guardians concerned, under 5 minutes MUST elapse at the 95th percentile, excluding offline resync time for the entry (definition aligned with BEH-ZS-082 of `spec/behaviors/04-attendance-student-life-discipline.md`).

"Delivery" means acceptance by the channel used, available per version (NFR-ZS-007): push notification delivered, WhatsApp message accepted by the API (for consenting, opted-in parents), otherwise SMS accepted by the aggregator (households without a smartphone). Every notification carries its send timestamp and channel status, both measurable (NFR-ZS-024). Traceability: `spec/appendices/00-project-baseline.md` §10, §7.4; ADR-ZS-023, ADR-ZS-036; `spec/appendices/01-review-history.md` (H-11); URS-ZS-018, URS-ZS-019, URS-ZS-035; JMP-ZS-005. Actors: head supervisor, supervisors, teachers, parents.

### NFR-ZS-025: [MOB] Critical journeys adapted to entry-level devices

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Attendance-taking, grade entry, parent/student viewing, and certificate issuance MUST be fully usable on entry-level phones (small screens, limited memory) and on registrar-office's older computers; no critical entry relies on gestures or high-end device capabilities.

Ergonomic templates (target sizes, densities, numeric keypads for grades) are detailed in `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`. Traceability: `spec/appendices/00-project-baseline.md` §2.10, §10; URS-ZS-017, URS-ZS-018, URS-ZS-028. Actors: teachers, supervisors, registrar's office, parents, students.

### NFR-ZS-007: [MOB] Channel reliability and automatic fallback

> **Priority:** Must
> **Version:** MVP (in-app and SMS; WhatsApp utility limited to attendance notifications, minimal templates); V1 (push conditional on a transfer basis, generalized WhatsApp)

REQUIREMENT: The channel hierarchy MUST be push, then WhatsApp utility (consenting parents), then SMS (Moroccan aggregator) — email remains secondary (ADR-ZS-023, ADR-ZS-036). At MVP, notification relies on in-app and SMS, supplemented by WhatsApp utility limited to attendance notifications (minimal templates, consenting parents); push notification and generalized WhatsApp (all messages, managed templates) arrive in V1 (historical alias D1, ADR-ZS-062, ADR-ZS-066 §ARB-25c).

Every notification carries a traceable status (accepted, delivered, failed, fallback); a channel failure triggers automatic fallback to the next channel, within the school's consumables credit. Per-school SMS and WhatsApp credit counters trigger threshold alerts to the principal's office (market models: `spec/research/03-payments-communications.md` §4 and §5). Since WhatsApp costs change on 10/01/2026, the pricing switch is a dated platform-side parameter. Push notifications (V1) travel through Google's (FCM) and Apple's (APNs) services, hosted outside Morocco: their activation is conditioned on those services being entered in the sub-processor register with a transfer basis (SEC-ZS, CNF-ZS §ARB-25d); no push is sent at MVP (ADR-ZS-062 §ARB-21b). Authentication SMS (OTP, invitations) is borne by ZSchool and does not draw on the school's credits (PAK-ZS-002). Traceability: `spec/appendices/00-project-baseline.md` §10, §2.10; ADR-ZS-023, ADR-ZS-036; `spec/appendices/01-review-history.md` (H-11, H-20); `spec/research/03-payments-communications.md` §4-5. Actors: principal's office, ZSchool operator.

### NFR-ZS-026: [MOB] Supported browser and OS floor

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: The platform MUST be tested and guaranteed on: the last two major versions of Chrome, Firefox, Edge, and Safari (desktop and mobile); Android 8 and later (Chrome browser and installed PWA); iOS 15 and later (Safari and installed PWA); Windows 10 and later for registrar-office workstations; a minimum screen width of 360 pixels. A browser or OS below the floor MUST show a clear bilingual message with alternatives instead of a silent malfunction.

The registrar persona's "older PC" (URS-ZS-017) is thus defined as a Windows 10 machine with an up-to-date browser; machines that cannot reach it fall under onboarding support. The floor is reviewed and published annually. Traceability: `spec/appendices/00-project-baseline.md` §2.10, §10; URS-ZS-017; ADR-ZS-066; NFR-ZS-021, NFR-ZS-025. Actors: all; ZSchool operator.

---

## 7. Offline operation

### NFR-ZS-027: [OFF] Attendance-taking tolerant of outages

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Taking attendance for a class or a course MUST continue without a network: check-ins are stored locally on the device (protected storage), the screen shows a "pending sync" state, and no entry is lost on a connection drop, an app being closed, or a dead battery. Resuming requires no user action beyond reopening the app.

On iOS, PWA limitations (storage eviction after seven days of inactivity, no background sync) are covered by the dedicated NFR-ZS-028 test plan. Offline operation is required at MVP by supervisor and teacher needs, although not listed verbatim in §12: justified in `spec/open-questions.md`. Traceability: `spec/appendices/00-project-baseline.md` §10, §2.10; URS-ZS-018, URS-ZS-027. Actors: head supervisor, supervisors, teachers.

### NFR-ZS-029: [OFF] Grade entry tolerant of outages

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Entering a grade sheet (test, exam) MUST continue offline: entered values are stored locally per sheet, and resuming reopens the sheet in its exact state. Publishing grades and report cards remains a server operation (immutability, INV-ZS-085): it requires the network and never runs off unsynced data without explicit verification.

Traceability: `spec/appendices/00-project-baseline.md` §10, §7.5; INV-ZS-085; URS-ZS-028. Actors: teachers.

### NFR-ZS-030: [OFF] Idempotent sync when the network returns

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-455`](../../features/cross-cutting/nfr/nfr-zs-030-idempotent-offline-sync.feature)

REQUIREMENT: As soon as the network returns, local entries MUST sync automatically: every operation MUST be idempotent (a replay never creates a duplicate), the logical order of operations MUST be respected, and the timestamp kept is that of the original entry (stored in UTC and displayed in `Africa/Casablanca` time, NFR-ZS-018), not that of the sync.

A sync report (operations sent, accepted, in conflict) is visible to the author; a partial sync never blocks further entry. Traceability: `spec/appendices/00-project-baseline.md` §10; INV-ZS-090; NFR-ZS-018. Actors: head supervisor, supervisors, teachers.

### NFR-ZS-031: [OFF] Deterministic resolution of entry conflicts

> **Priority:** Must
> **Version:** MVP (basic rules); conflict-review interface in V1
> **Acceptance:** [`@REQ-ZS-456`](../../features/cross-cutting/nfr/nfr-zs-031-offline-entry-conflict.feature)

REQUIREMENT: Concurrent changes (two entries for the same field, a server-side correction made during the offline period) MUST be resolved by deterministic rules announced to users: for already-published or locked data (INV-ZS-085), the server prevails and the overwrite is denied with an explanation; for working fields (attendance, unpublished grades), the latest timestamped write prevails, with an alert to the author when overwritten.

No conflict is resolved silently; a tenant's conflict log is viewable by the principal's office. Traceability: `spec/appendices/00-project-baseline.md` §10; INV-ZS-085, INV-ZS-090; INV-ZS-015. Actors: teachers, head supervisor, principal's office.

### NFR-ZS-028: [OFF] Dedicated offline test plan for iOS (PWA)

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: On iOS (32% of mobile web traffic, `spec/research/05-infrastructure-usage.md` §2), Safari evicts a non-installed site's web storage after seven days without a visit, offers no background sync, and only delivers push notifications to a PWA installed on the home screen. As a result the platform MUST: (a) offer PWA installation on the first iOS login for teacher and student-life roles, with a bilingual guide; (b) flag any unsynced offline entry persistently, with a reminder shown every time the app opens while it remains unsynced, syncing running when the app opens; (c) warn the user when pending entries approach the eviction limit (from the fifth day onward); (d) run a dedicated iOS test plan (Safari and installed PWA, floor versions per NFR-ZS-026) covering attendance-taking, grade entry, and resuming after a forced close, with the acceptance criterion of NFR-ZS-027: no entry lost.

Traceability: `spec/appendices/00-project-baseline.md` §10; NFR-ZS-027, NFR-ZS-030, NFR-ZS-021, NFR-ZS-026; ADR-ZS-066; `spec/research/05-infrastructure-usage.md` §2. Actors: teachers, supervisors; ZSchool operator.

---

## 8. Documents

### NFR-ZS-032: [DOC] Every document produced as a bilingual PDF

> **Priority:** Must
> **Version:** MVP (report cards, annual transcripts, enrollment documents, enrollment certificate, exit file, batch certificates in wave 2); V1 (full self-service catalog)

REQUIREMENT: Every document within the shipped version's scope (report cards, annual transcripts, enrollment documents, front-desk enrollment certificate, exit file, and batch certificates from MVP onward — ADR-ZS-041; full self-service catalog in V1) MUST be produced as a PDF using a French, Arabic, or bilingual (FR/AR) template, chosen by the school.

On-screen and printed rendering are identical; Arabic layout respects the reading direction; stamp, signature, numbering, and QR notices are integrated into the template. Traceability: `spec/appendices/00-project-baseline.md` §10, §12, §2.9; ADR-ZS-021, ADR-ZS-032; ADR-ZS-041. Actors: principal's office, registrar's office, teachers, parents, students.

### NFR-ZS-033: [DOC] Correct Arabic fonts and A4/A5 formats

> **Priority:** Must
> **Version:** MVP (report cards, enrollment certificates); V1 (full catalog)

REQUIREMENT: PDF templates MUST embed complete Arabic fonts (ligatures, hamzas, configurable Arabic-Indic or Western digits): rendering is identical on every device and printer, without depending on local fonts. Every document type MUST be available in A4 and A5 formats (report cards printable at A5 for family signature).

Traceability: `spec/appendices/00-project-baseline.md` §10, §2.9; ADR-ZS-021. Actors: principal's office, registrar's office, teachers, parents.

### NFR-ZS-034: [DOC] Batch printing

> **Priority:** Must
> **Version:** MVP (report cards; batch certificates in wave 2); V1 (full catalog)

REQUIREMENT: Batch-printing a school's report cards (by class, level, or in full) MUST happen as one operation, within the performance envelope of NFR-ZS-005 (under 10 minutes for 2,000 students), with configurable sorting (class then rank, or alphabetical), continuous numbering, and resume on failure without regenerating already-produced documents.

Batch printing extends to enrollment certificates (start-of-year insurance) from MVP wave 2 onward (ADR-ZS-041) and to the full catalog in V1 (§7.6). Traceability: `spec/appendices/00-project-baseline.md` §10, §12, §7.6; NFR-ZS-005. Actors: principal's office, registrar's office.

### NFR-ZS-035: [DOC] Printed, scannable verification QR code

> **Priority:** Must
> **Version:** V1

REQUIREMENT: Published documents MUST carry a printed verification QR code with sufficient contrast and minimum size to guarantee scanning from a standard phone (including A5 or medium-quality print). Online verification MUST confirm the document's authenticity, version, and signatory without depending on the issuing school and without exposing personal data beyond what strict verification requires.

Traceability: `spec/appendices/00-project-baseline.md` §10, §7.5; ADR-ZS-020; INV-ZS-085; INV-ZS-015; JMP-ZS-010. Actors: principal's office, registrar's office, parents, employers and receiving schools.

---

## 9. Observability

### NFR-ZS-036: [OBS] Per-tenant observability

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Every request and every asynchronous task MUST carry the tenant (school) key: technical logs, metrics, and traces are filterable by school, without access to data content. An incident or an abnormal load for one tenant is isolated and diagnosed without hindering diagnosis for other tenants.

School-group (organization) consolidation is available in V1. Traceability: `spec/appendices/00-project-baseline.md` §10; INV-ZS-001; ADR-ZS-003. Actors: ZSchool operator, principal's office.

### NFR-ZS-037: [OBS] Immutable, exportable audit log

> **Priority:** Must
> **Version:** MVP (write logging, security, support — historical alias D4); V1 (sensitive-view log, console, export)

REQUIREMENT: Every write action and every sensitive-data view (identity file, health, finance, discipline) MUST be logged with author, context, and timestamp, in an immutable, exportable log kept for 5 years (ADR-ZS-003). Event types, export format, and access rules are specified in `spec/cross-cutting/02-security-privacy.md` and carried by invariant INV-ZS-019.

At MVP (historical alias D4, ADR-ZS-066 §ARB-25j), writes are logged immutably at the record level and security and support-access events are logged (SEC-ZS-017). Traceability: `spec/appendices/00-project-baseline.md` §10, §9; ADR-ZS-003; INV-ZS-090; INV-ZS-019. Actors: principal's office, ZSchool operator.

### NFR-ZS-024: [OBS] Service metrics and operational alerts

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: The service indicators defined in this chapter MUST be measured continuously: availability (NFR-ZS-008), page and generation latency (NFR-ZS-001, NFR-ZS-003), absence notification delay (NFR-ZS-023), error rate (NFR-ZS-013), PDF-generation and notification queues, offline sync success rate (NFR-ZS-030). Operational alerts with thresholds and escalation notify ZSchool before schools have to report an issue.

A per-tenant health dashboard and a global dashboard are available to operations. Traceability: `spec/appendices/00-project-baseline.md` §10; NFR-ZS-008, NFR-ZS-001, NFR-ZS-003, NFR-ZS-023, NFR-ZS-013. Actors: ZSchool operator.

### NFR-ZS-038: [OBS] End-to-end correlation and logged support access

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: A correlation identifier MUST propagate every request from the interface through services and asynchronous tasks: an incident reported by a school is reconstructed end-to-end from this identifier, without viewing the data. ZSchool support's access to a tenant's context MUST go exclusively through an audited ticket (`spec/appendices/01-review-history.md`, G-32) and show only the data minimally needed for diagnosis.

Traceability: `spec/appendices/00-project-baseline.md` §10; `spec/appendices/01-review-history.md` (G-32); `spec/domain-model.md` §2.7 (`SupportTicket`). Actors: ZSchool operator, principal's office.

### NFR-ZS-039: [OBS] Per-school consumption counters

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Billed consumables (SMS, WhatsApp conversations, document storage beyond the quota, ADR-ZS-009) MUST be counted per school and visible to the principal's office in near real time (under 15 minutes of lag), with the monthly history from September to June.

These counters feed monthly consumables billing and threshold alerts (NFR-ZS-007). Active-student counting rules (entry month, suspension, closure) are carried by the model (`UsageMetric`) and detailed in the administration module. Authentication SMS (OTP, MFA, invitations) is counted separately as a platform cost and never charged to the school (PAK-ZS-002). Traceability: `spec/appendices/00-project-baseline.md` §10, §11; ADR-ZS-009; `spec/domain-model.md` §2.7 (`UsageMetric`). Actors: principal's office, ZSchool operator.

---

## 10. Interoperability

### NFR-ZS-040: [INT] Excel, CSV, and PDF exports on every list and report

> **Priority:** Must
> **Version:** MVP (internal exports; Massar exports of lists and continuous-assessment grades in wave 2); V1 (ESISE regulatory statistics)

REQUIREMENT: Every list or report managed by the platform (students, enrollments, attendance, grades, arrears, audit log, consumption) MUST be exportable as an Excel workbook (.xlsx) and CSV; documents and report cards MUST be exportable as PDF.

Files destined for Massar are out of scope for this chapter: ministry template formats by subject, class, and semester, consistency checks before submission, and the ban on any entry automation without the ministry's agreement (`spec/appendices/01-review-history.md`, H-04) are specified in `spec/cross-cutting/06-external-integrations.md` §2 (INT-ZS, MAS) and `spec/behaviors/12-massar-regulatory-exports.md`, without duplication here. Traceability: `spec/appendices/00-project-baseline.md` §10, §12; URS-ZS-003; `spec/appendices/01-review-history.md` (G-08); ADR-ZS-041; cross-references: `spec/cross-cutting/06-external-integrations.md` §2, `spec/behaviors/12-massar-regulatory-exports.md`. Actors: principal's office, registrar's office, teachers, accounting.

### NFR-ZS-041: [INT] File exchange conventions

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Exports MUST follow stable conventions: UTF-8 encoding readable in Excel, including for Arabic; dates in UTC with the `Africa/Casablanca` timezone labeled; grades to two decimal places; people's names in dual script (two distinct columns); documented headers stable across versions; a configurable CSV separator.

Any structural change to a public export is announced to users at least one month in advance. Traceability: `spec/appendices/00-project-baseline.md` §10, §2.9; NFR-ZS-016, NFR-ZS-018. Actors: principal's office, registrar's office, accounting, third-party integrators.

### NFR-ZS-042: [INT] Documented public API in V2

> **Priority:** Should
> **Version:** V2

REQUIREMENT: A documented, versioned public API SHOULD let third-party integrations (accounting, portals, school tools) read and, per rights, write authorized objects: per-school authentication, permissions identical to the app (least privilege, INV-ZS-091), per-school rate limiting, call logging.

No Massar channel is promised as long as no official channel exists (`spec/appendices/01-review-history.md`, H-04 confirmed); Massar interoperability remains the file-based channel (`spec/cross-cutting/06-external-integrations.md` §2). Traceability: `spec/appendices/00-project-baseline.md` §10, §12; INV-ZS-091; `spec/appendices/01-review-history.md` (H-04); `spec/cross-cutting/06-external-integrations.md`. Actors: principal's office, integrators, ZSchool operator.

### NFR-ZS-043: [INT] Business-event webhooks in V2

> **Priority:** Should
> **Version:** V2

REQUIREMENT: Major business events (absence recorded, report card published, payment received, document issued) SHOULD be pushable to third-party systems via a signed webhook, activated per school and per event type, with a delivery log, replay on failure, and immediate removal on deactivation.

The baseline cites webhooks in §10 without a version; they are placed in V2 alongside the public API, a hypothesis logged in `spec/open-questions.md`. Traceability: `spec/appendices/00-project-baseline.md` §10, §12; `spec/domain-model.md` §7 (domain events). Actors: principal's office, integrators.

---

## 11. Backup and restore

### NFR-ZS-010: [SAV] Daily backups hosted in the EU

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: **Redefined by [ADR-ZS-091](../decisions/091-eu-hosting-deviation-from-morocco-baseline.md)
(Accepted, 2026-09-09).** An automatic daily backup MUST cover all data:
databases (operational data, global identities), document files, tenant
configuration, and logs. Backups MUST be stored within the EU (AWS
`eu-central-1`), encrypted, and their integrity automatically verified after
each run, with an alert on failure.

Traceability: `spec/appendices/00-project-baseline.md` §10; ADR-ZS-091, ADR-ZS-007 (superseded baseline). Actors: ZSchool operator.

### NFR-ZS-044: [SAV] At least 30-day retention

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: At least 30 days of daily restore points MUST be kept; beyond that, monthly retention up to 12 months is targeted in V1.

This backup retention is independent of application-level retention periods (ADR-ZS-003): restoring never brings back data whose deletion resulted from an obligation (right to erasure, anonymization); any restore from a copy predating an anonymization or deletion automatically replays the retention operations that occurred since then (anonymization log, CNF-ZS-023), and the V1 monthly copies are purged of anonymized identities on first use (ADR-ZS-066 §ARB-25s). At MVP, only the 30-day retention applies. Traceability: `spec/appendices/00-project-baseline.md` §10; ADR-ZS-003; INV-ZS-086. Actors: ZSchool operator.

### NFR-ZS-011: [SAV] Quarterly restore test

> **Priority:** Must
> **Version:** MVP
> **Acceptance:** [`@REQ-ZS-457`](../../features/cross-cutting/nfr/nfr-zs-011-quarterly-restore-test.feature)

REQUIREMENT: A full restore MUST be tested every quarter on an isolated environment, following a written scenario: data from a sample of tenants, documents, configuration. The actual restore time is measured and compared against the recovery target (NFR-ZS-009); a failure or overrun opens a dated action plan.

Each exercise is reported and kept on record. Traceability: `spec/appendices/00-project-baseline.md` §10; NFR-ZS-009. Actors: ZSchool operator.

### NFR-ZS-045: [SAV] Granular per-school restore

> **Priority:** Must
> **Version:** V1

REQUIREMENT: A point-in-time restore MUST be possible for a single school (correcting an accidental deletion, a bulk-processing error) without interrupting or overwriting other tenants' data. The procedure is tracked, auditable, and requires approval by an authorized operator with a recorded reason; the restored tenant is informed when the operation touches its data.

During the pilot phase, a global restore remains the documented last resort. Traceability: `spec/appendices/00-project-baseline.md` §10; INV-ZS-090; INV-ZS-001. Actors: ZSchool operator, principal's office.

---

## 12. Resources, capacity, and accessibility

### NFR-ZS-046: [RES] Three-year capacity target

> **Priority:** Must
> **Version:** V1 (validation by load test); ongoing trajectory from MVP onward

REQUIREMENT: The architecture MUST be sized for, at three years: 500 schools, 500,000 students, 1,000,000 guardians, 30,000 teachers — roughly 2.5 times the commercial ambition of ADR-ZS-008 (300 schools, 200,000 students). This sizing covers storage (data and documents), the database, and the document-generation and notification queues; it is validated by a load test at the target volume before year 3 and reassessed annually against actual growth.

Traceability: `spec/appendices/00-project-baseline.md` §10; ADR-ZS-008. Actors: ZSchool operator.

### NFR-ZS-047: [RES] Absorbing seasonal peaks

> **Priority:** Must
> **Version:** V1

REQUIREMENT: Seasonal peaks MUST be explicitly sized for: start of the school year (enrollment, class assignment, imports, §2.11), end of period (report-card publications, NFR-ZS-005), re-enrollment campaigns (V1). A peak factor (maximum load relative to average load for write journeys, default value of 5 to be finalized in technical review) is documented and covered by capacity; one tenant's peaks do not degrade the service for others (see NFR-ZS-048).

Traceability: `spec/appendices/00-project-baseline.md` §2.11, §10; ADR-ZS-008; NFR-ZS-005. Actors: ZSchool operator, principal's office.

### NFR-ZS-049: [RES] Controlled document storage

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: Every school MUST have a document-storage quota (consumable beyond the quota, ADR-ZS-009): 2 GB per school plus 5 MB per active student, a working hypothesis to be confirmed by the founder (ADR-ZS-066 §ARB-25o; PAK-ZS). Generated PDFs are compressed and deduplicated; automatic purges apply ADR-ZS-003's retention periods, never touching permanently retained documents (registers, report cards, transcripts, certificates).

A near-quota alert (default: 90%) is sent to the principal's office. Traceability: `spec/appendices/00-project-baseline.md` §10, §11; ADR-ZS-003, ADR-ZS-009; INV-ZS-086; NFR-ZS-039. Actors: principal's office, ZSchool operator.

### NFR-ZS-050: [RES] Accessibility of the main journeys

> **Priority:** Must
> **Version:** MVP (WCAG 2.1 AA target); V1 (formal audit)

REQUIREMENT: The main journeys (parent and student viewing, attendance-taking, grade entry, certificate issuance, principal's-office dashboards) MUST meet: sufficient contrast, adjustable font sizes with no loss of functionality, full keyboard navigation, screen-reader compatibility. The target standard is WCAG 2.1 level AA on the main journeys from MVP onward (UX-ZS, `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`), the baseline requiring these four dimensions without naming a standard; a formal compliance audit is conducted in V1 (ADR-ZS-066 §ARB-25p).

Traceability: `spec/appendices/00-project-baseline.md` §10; `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`; ADR-ZS-066. Actors: all.

### NFR-ZS-048: [RES] Fair service across tenants

> **Priority:** Must
> **Version:** V1

REQUIREMENT: A school's heavy workloads (publishing 2,000 report cards, imports, bulk sends) MUST run in per-tenant compartmentalized queues: interactive service for other schools degrades by no more than 10% during their execution, and no tenant's task can starve other tenants' queues.

Compartmentalization is verified by the NFR-ZS-046 load test. Traceability: `spec/appendices/00-project-baseline.md` §10; INV-ZS-001; NFR-ZS-046, NFR-ZS-005. Actors: ZSchool operator, principal's office.

---

## 13. Open questions

Open questions raised by this chapter are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## Traceability

Full cross-reference coverage for this chapter is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
