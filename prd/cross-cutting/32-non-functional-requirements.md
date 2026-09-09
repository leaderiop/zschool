# ZSchool PRD — Non-Functional Requirements

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review (arbitrations `prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §2.4, §2.9, §2.10, §10 (G-21, closed), §12, §14 (DEC-10, DEC-26, DEC-27, DEC-28, DEC-36), §16 (H-04, H-11, H-18); `prd/research/00-baseline-corrections.md` (#1, #6, #10, #13); `prd/research/01-market-competition.md`; `prd/research/03-payments-communications.md`; `prd/research/04-pedagogy-massar-calendar.md`; `prd/research/05-infrastructure-usage.md` |
| Related files | `prd/00-conventions.md`; `prd/02-actors-personas.md`; `prd/03-domain-data-model.md`; `prd/journeys/00-journey-map.md`; module chapters `prd/modules/10-administration-onboarding-subscription.md` to `prd/modules/23-health-sensitive-data.md` (their "Specific non-functional requirements" section); `prd/cross-cutting/30-roles-permissions-matrix.md`; `prd/cross-cutting/31-security-privacy.md`; `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`; `prd/cross-cutting/35-external-integrations.md`; `prd/cross-cutting/36-legal-compliance-data-protection.md`; `prd/cross-cutting/42-review-arbitrations.md` (ARB-01, ARB-21, ARB-25) |

---

## 1. Objective and scope

This chapter translates baseline chapter 10 (`PROJECT.md`, gap **G-21** closed) into measurable non-functional requirements, organized into ten domains, each with its own exclusive `NFR-<DOM>-NN` identifier namespace (`prd/00-conventions.md` §2):

| Domain | Prefix | Main content |
|---|---|---|
| Performance | `NFR-PERF` | Page response times, report card generation and publication, low-bandwidth mode, bulk operations |
| Availability and continuity | `NFR-DISP` | Availability rate, maintenance windows, disaster recovery plan, error budget, standard support commitment |
| Languages, timezone, and internationalization | `NFR-I18N` | FR/AR and RTL, English, dual-script names, `Africa/Casablanca` timezone, Hijri and Gregorian calendars |
| Platforms and mobility | `NFR-MOB` | Responsive web, PWA, native apps, absence notification, channel reliability, browser and OS floor |
| Offline operation | `NFR-OFF` | Attendance-taking and grade entry tolerant of outages, sync, conflict resolution, iOS testing |
| Documents | `NFR-DOC` | Bilingual PDFs, Arabic fonts, A4/A5 formats, batch printing, verification QR code |
| Observability | `NFR-OBS` | Logs, metrics, alerts, per-tenant traceability, usage counters |
| Interoperability | `NFR-INT` | Excel/CSV/PDF exports, exchange conventions, public API, webhooks |
| Backup and restore | `NFR-SAV` | Daily backups, retention, restore testing, granular restore |
| Resources, capacity, and accessibility | `NFR-RES` | Three-year volume targets, seasonal peaks, document storage, accessibility |

Out of scope for this file (covered elsewhere, without duplication): application security and data protection requirements (`prd/cross-cutting/31-security-privacy.md`), permissions and action logging (`prd/cross-cutting/30-roles-permissions-matrix.md`, RG-38), legal and CNDP compliance (`prd/cross-cutting/36-legal-compliance-data-protection.md`), detailed UX and the accessibility standard (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`), external integration specifications (`prd/cross-cutting/35-external-integrations.md`).

Module chapters (`prd/modules/10-administration-onboarding-subscription.md` to `prd/modules/23-health-sensitive-data.md`) cite these requirements in their "Specific non-functional requirements" section without redefining them.

## 2. Measurement and versioning conventions

- **Version**: every requirement carries an MVP / V1 / V2+ tag per `PROJECT.md` §12 (DEC-15). Where the baseline's chapter 10 and chapter 12 diverge in wording (native apps; FR/AR positioning), the tag adopted here is logged in "Open questions" (§13).
- **Usual page**: any screen listing or displaying a tenant's data (dashboards, lists, records, entry forms) delivered by the web app or the PWA. Excluded: PDF documents (asynchronous generation, NFR-PERF-02) and file uploads.
- **Reference network**: median Moroccan mobile throughput is high (60.31 Mbps, DataReportal Digital 2026, `prd/research/05-infrastructure-usage.md` §2), but real classroom and rural usage is degraded. Performance targets are calibrated on a degraded 4G mobile connection (effective downlink of 5 Mbps, 150 ms round-trip latency), a definition to be finalized in technical review.
- **Measurements**: 95th-percentile latencies over a 30-day rolling window, measured client-side (time to interactive) for pages and server-side for document generation; thresholds exclude asynchronous tasks.
- **Availability**: monthly percentage computed by external probes on entry points, excluding announced maintenance windows (NFR-DISP-02) and third-party service outages (SMS aggregators, WhatsApp, e-signature vendors).
- **Critical periods**: the start of the school year (classes mandatory from Monday, September 7, 2026, `prd/research/04-pedagogy-massar-calendar.md` §1), national exams (national baccalaureate, June 1–3, 2027), end-of-period closings and report-card publications, re-enrollment campaigns.
- **Actors**: principal's office (principal, school group), registrar-cashier's office, head supervisor and supervisors, teachers, parents, students, ZSchool operator (operations, support).

---

## 3. Performance

### NFR-PERF-01 — Usual pages displayed in under 2 seconds on 4G

| Attribute | Value |
|---|---|
| Description | Every usual page (definition §2) is displayed and interactive in under 2 seconds on a 4G mobile connection (measurement reference §2), at the 95th percentile of real sessions. The initial payload of key pages is kept small (see NFR-PERF-04). |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §2.10; H-11; BES-SEC-08; `prd/research/05-infrastructure-usage.md` §2 |
| Actors | All |

### NFR-PERF-02 — Report card generated in under 3 seconds

| Attribute | Value |
|---|---|
| Description | Generating a student's complete report card (per-subject and overall averages, rank, honors, remarks, bilingual FR/AR rendering, stamp and QR where applicable) completes in under 3 seconds server-side, at the 95th percentile. A published report card stays locked and versioned (RG-33, INV-26): the performance target never overrides immutability. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §7.5; RG-33; INV-26; PC-06 (`prd/journeys/00-journey-map.md`) |
| Actors | Principal's office, registrar's office, teachers, parents, students |

### NFR-PERF-03 — Report cards for a 2,000-student school published in under 10 minutes

| Attribute | Value |
|---|---|
| Description | Publishing a period's report cards for a 2,000-student school (generation, locking each report card, making them available to families, triggering notifications) completes in under 10 minutes. Progress is visible in real time; a partial failure resumes without regenerating already-published report cards; no notification is sent for an unpublished report card. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §7.5, DEC-35 (pilot group of over 2,000 students); RG-33; PC-06 |
| Actors | Principal's office, registrar's office |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Publishing a period's report cards
  Scenario: Publishing for a 2,000-student school within the deadline
    Given a 2,000-student school whose class councils are closed
    And an assessment period ready to publish
    When the principal's office triggers publication of the period
    Then every report card is locked with its version, fingerprint, and signatory in under 10 minutes total
    And active legal guardians receive the publication notification
    And no published report card can be edited, with any correction creating a new version

  Scenario: Resuming after a partial failure
    Given a publication run interrupted after 1,200 report cards were locked
    When the operation is restarted
    Then only the remaining 800 report cards are generated
    And no already-published report card is regenerated or re-notified
```

### NFR-PERF-04 — Low-bandwidth mode and degraded networks

| Attribute | Value |
|---|---|
| Description | Critical journeys (attendance-taking, grade entry, parent viewing, certificate issuance) remain usable on a weak connection: an initial payload under 500 KB excluding uploaded documents, compressed and cached resources, lightweight images, no large blocking resource. The NFR-PERF-01 response-time target is maintained on the degraded reference connection. Rationale: rural household internet access remains at 78.4% versus 93.6% urban (ANRT 2024-2025, `prd/research/05-infrastructure-usage.md` §2; `prd/research/00-baseline-corrections.md` #10). |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §2.10; H-11; BES-SEC-08, BES-ENS-02, BES-ENS-03; `prd/research/05-infrastructure-usage.md` §2 |
| Actors | Teachers, supervisors, parents, students, registrar's office |

### NFR-PERF-05 — Imports and bulk operations handled without blocking

| Attribute | Value |
|---|---|
| Description | The onboarding Excel import (academic structure and headcount) for a 2,000-student school completes in under 15 minutes with a downloadable, exhaustive error report; the operator stays informed of progress and can continue other tasks. Bulk notification sends for a school are processed in the background without blocking the interface (see NFR-MOB-05). |
| Priority | Must |
| Version | MVP (onboarding import, `PROJECT.md` §12) |
| Traceability | `PROJECT.md` §12, §7.1, DEC-35; G-18; PC-03 (`prd/journeys/00-journey-map.md`) |
| Actors | ZSchool operator, principal's office, registrar's office |

---

## 4. Availability and continuity

### NFR-DISP-01 — 99.5% availability excluding announced maintenance

| Attribute | Value |
|---|---|
| Description | The service is available at least 99.5% of the time each calendar month, excluding announced maintenance windows (NFR-DISP-02) and excluding a site-level disaster (covered by the disaster recovery plan NFR-DISP-03 with its own RTO/RPO targets — arbitration D5, ARB-25i), measured per convention §2. A monthly availability report (global and per tenant) is kept by operations and available to schools on request. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10 |
| Actors | All; ZSchool operator |

### NFR-DISP-02 — Maintenance windows outside critical periods

| Attribute | Value |
|---|---|
| Description | Every planned maintenance is announced at least 7 days in advance to school administrators (email and in-app announcement) and flagged with a banner during the window; maximum 4-hour duration per event, overnight slot (default: 00:00–05:00, `Africa/Casablanca` time). No window during: the start of the school year (September), year-end exams and publications (May to June, including national exams), class councils and report-card publications announced by a school. Emergency interventions (security, imminent data loss) are the exception and are communicated after the fact with an incident report. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §2.11; `prd/research/04-pedagogy-massar-calendar.md` §1 |
| Actors | Principal's office, ZSchool operator |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Planned maintenance window
  Scenario: Maintenance announced outside a critical period
    Given a maintenance window planned for a Wednesday in November from 01:00 to 04:00
    When the window opens
    Then administrators were notified at least 7 days in advance
    And an information banner is shown to logged-in users
    And the service is restored with an observed effective downtime of 3 hours

  Scenario: Denying a window during the start of the school year
    Given a maintenance window requested for September 8
    When the maintenance calendar is validated
    Then the request is automatically rejected as falling within a critical period
    And a fallback proposal outside the start of the school year is issued
```

### NFR-DISP-03 — Disaster recovery plan on a Moroccan site

| Attribute | Value |
|---|---|
| Description | Production is hosted in Morocco (decision DEC-26). The primary "Morocco West (Casablanca)" region (af-casablanca-1) has only one availability domain (`prd/research/05-infrastructure-usage.md` §1; `prd/research/00-baseline-corrections.md` #13): a disaster recovery plan to a second Moroccan site is therefore mandatory. Targets, applicable only to a site-level disaster (arbitration D5, ARB-25i; NFR-DISP-01's SLA excludes a disaster): service recovery within 8 hours maximum (RTO) and data loss of 15 minutes maximum (RPO); meeting a 15-minute RPO requires continuous replication or log archiving at least every fifteen minutes to the second site, in addition to daily backups (NFR-SAV-01). **From MVP onward** (ARB-25h), encrypted backups are replicated daily to a second Moroccan center (INT-HEB-06, SEC-21): the MVP fallback RPO is 24 hours and the fallback RTO is that of a full restore as measured by NFR-SAV-03; these fallback values are recorded in the pilot agreement (CNF-08). The full disaster recovery plan (failover, RTO 8h / RPO 15min, annual exercise) ships in V1. The final choice of failover site is an open question (OQ-03). |
| Priority | Must |
| Version | V1 (full disaster recovery plan, tested failover); MVP: daily off-site replication, 24-hour fallback RPO recorded (ARB-25h) |
| Traceability | `PROJECT.md` §10, DEC-26, H-18; ARB-25h, ARB-25i; INT-HEB-06; `prd/research/05-infrastructure-usage.md` §1; `prd/research/00-baseline-corrections.md` #13 |
| Actors | ZSchool operator |

### NFR-DISP-04 — Degraded mode and read priority

| Attribute | Value |
|---|---|
| Description | In a major incident, the recovery order prioritizes high-value reads first (published report cards, timetable, already-generated documents), then routine writes. No write accepted during degradation is silently lost: either an explicit denial with a status message, or a queue resumed after recovery. The recovery order is documented in the disaster recovery plan (NFR-DISP-03). |
| Priority | Should |
| Version | V1 |
| Traceability | `PROJECT.md` §10; RG-33 (immutable published report cards) |
| Actors | All; ZSchool operator |

### NFR-DISP-05 — Error budget and peak absorption

| Attribute | Value |
|---|---|
| Description | The server error rate (5xx) stays below 0.5% of monthly requests. During the start-of-year and end-of-period peaks (§2.11), response times for write journeys degrade by no more than 20% relative to nominal load. Rationale: connection failures and blank screens are the dominant complaints about the ministry's Massar applications (Moutamadris 3.1/5 across roughly 7,060 reviews, `prd/research/01-market-competition.md` §4); reliability is a direct purchase criterion. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §2.11, DEC-27; `prd/research/01-market-competition.md` §4 |
| Actors | All; ZSchool operator |

### NFR-DISP-06 — Standard support commitment included

| Attribute | Value |
|---|---|
| Description | The standard support included in the subscription (PAK-14) is defined measurably: a single channel (in-app form and a dedicated email address) accessible to the principal's office, registrar's office, and system administrator roles; response in French and Arabic; business hours Monday to Friday 08:30–18:00 and Saturday 08:30–12:30 (`Africa/Casablanca` time), extended during the start of the school year (September) and report-card publications; first response within 4 business hours for a blocker (attendance-taking, payments, or publication impossible), within 1 business day for a defect, within 3 business days for a request; tracked by numbered ticket; any data access on a ticket follows SEC-13. During the pilot phase, a named point of contact per school supplements the channel. The values are working hypotheses to be confirmed with the pilots (OQ-09). |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §8.1, §11 (standard support included); PAK-14; SEC-13; ARB-25 |
| Actors | Principal's office, registrar's office, system administrator, ZSchool operator |

---

## 5. Languages, timezone, and internationalization

### NFR-I18N-01 — Bilingual FR/AR interface with full RTL from MVP

| Attribute | Value |
|---|---|
| Description | The entire interface is available in French and Arabic from MVP onward, with full support for right-to-left reading: mirrored layouts, directional icons, and tables, form alignment, date and number formats, entry states. The language toggle is instant and specific to each user: language is attached to the account, not the device, so that two accounts used on the same shared family phone each keep their own language (UX-17, ARB-21c); it also governs the language of SMS, WhatsApp messages, and notifications addressed to that person (FR-COM-05). No untranslated string is accepted in production on shipped journeys. Dual-script names are handled by NFR-I18N-03. The baseline says "FR and AR in V1" (§10) while DEC-10 and §12 set them at MVP: divergence logged in OQ-04, MVP tag retained. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §2.9, §10, §12, DEC-10; G-10 |
| Actors | All |

### NFR-I18N-02 — English in V2

| Attribute | Value |
|---|---|
| Description | The interface is available in English in V2 for international sections and schools following a foreign curriculum; official documents remain produced in FR/AR by default, with English added as an optional template language. The internationalization framework (label files, formats, timezone) is put in place from MVP onward so as not to redo the interface in V2. |
| Priority | Should |
| Version | V2 |
| Traceability | `PROJECT.md` §10, §12, §2.3 |
| Actors | Principal's office, teachers, parents, students |

### NFR-I18N-03 — People's names in dual script throughout

| Attribute | Value |
|---|---|
| Description | Every person's first and last name is entered in dual script (Latin and Arabic), as distinct fields; official documents (report cards, transcripts, certificates, attestations, exit file) and Massar exports carry both scripts. A missing Arabic or Latin script for a documented person triggers a completeness alert on document-related journeys, without blocking other uses. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §2.9, §10, DEC-10; `prd/03-domain-data-model.md` §2.1 (`Person`) |
| Actors | Principal's office, registrar's office, teachers |

### NFR-I18N-04 — `Africa/Casablanca` timezone at permanent UTC+0

| Attribute | Value |
|---|---|
| Description | All timestamps are stored in UTC and displayed in the `Africa/Casablanca` timezone, which has been permanently UTC+0 since September 20, 2026, at 02:00 (Decree No. 2.26.530, Official Gazette No. 7521 of 06/29/2026): there is no longer any seasonal alternation or Ramadan exception (`prd/research/00-baseline-corrections.md` #1; `prd/research/04-pedagogy-massar-calendar.md` §1). Timezone data (tzdata) is kept up to date; no historical calculation depends on a clock change. Ramadan's lighter hours remain a pedagogical need handled as a timetable variant (V1, academic-structure chapter), not a timezone issue. The baseline update (§2.4 and §10 still mention the alternation) is logged in OQ-01. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §2.4, §10; `prd/research/00-baseline-corrections.md` #1; `prd/research/04-pedagogy-massar-calendar.md` §1 |
| Actors | All |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Single timestamp at permanent UTC+0
  Scenario: Recording an attendance session in December 2026
    Given a teacher who confirms attendance for their class on December 10, 2026, at 09:30 in Casablanca
    When the entry is saved
    Then the stored timestamp is December 10, 2026, 09:30 UTC
    And the display on every device and document reads 09:30, with no time shift

  Scenario: No residual seasonal alternation
    Given the platform's timezone configuration
    When the annual calendar is traversed from 2026 to 2030
    Then no time transition exists for Africa/Casablanca
    And the displayed offset is consistently UTC+0
```

### NFR-I18N-05 — Hijri and Gregorian calendars for holidays

| Attribute | Value |
|---|---|
| Description | Every school's annual calendar carries national holidays (fixed Gregorian dates) and moveable religious holidays (Eid al-Fitr, Eid al-Adha, Islamic New Year, Mawlid) on both the Hijri and Gregorian calendars. Religious dates are pre-loaded as "to be confirmed" (2026-2027 examples: Ramadan 1448 approximately 02/08 to 03/09-10/2027; Eid al-Adha approximately 05/16 to 18/2027) and updated during the year upon the official announcement via lunar sighting (Ministry of Habous); the update propagates to timetables and notifications. Ministry-set school-year dates are pre-loaded each year. |
| Priority | Must |
| Version | MVP (calendar and holidays); associated schedule variants in V1 |
| Traceability | `PROJECT.md` §2.4, §10, §12; `prd/research/04-pedagogy-massar-calendar.md` §1; `prd/03-domain-data-model.md` §2.3 (`Calendar`, `Holiday`) |
| Actors | Principal's office, registrar's office, teachers, parents, students |

### NFR-I18N-06 — Bilingual school-defined content

| Attribute | Value |
|---|---|
| Description | Labels configurable by the school (subject names, standard remarks, absence and sanction reasons, document categories) are available in FR and AR. Free-form content (remarks, messages, entered reasons) is in the language chosen by the author and rendered as-is; document templates insert it into a layout consistent with the reading direction. |
| Priority | Should |
| Version | MVP |
| Traceability | `PROJECT.md` §2.9, DEC-10; `prd/03-domain-data-model.md` §2.4 |
| Actors | Principal's office, teachers, registrar's office |

---

## 6. Platforms and mobility

### NFR-MOB-01 — Responsive web and PWA from MVP

| Attribute | Value |
|---|---|
| Description | The web app is responsive, designed mobile-first, and installable as a progressive web app (PWA): home-screen icon, standalone mode, session resume. It is fully usable on an older computer and the schools' common browsers (BES-SEC-08), with no feature requiring recent hardware. The PWA is the platform for parents, students, and teachers at MVP. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §12, §2.10; BES-SEC-08 |
| Actors | All |

### NFR-MOB-02 — Native Android and iOS apps in V2

| Attribute | Value |
|---|---|
| Description | Native Android and iOS apps are published in V2 with feature parity for the parent, student, and teacher journeys relative to the PWA, and native push notifications. Android is prioritized (67.96% of mobile web traffic versus 32.02% for iOS, StatCounter August 2026 — traffic share, not device base, `prd/research/05-infrastructure-usage.md` §2; `prd/research/00-baseline-corrections.md` #10). The baseline mentions "native apps" in its V1 list (§12) but sets them in V2 (§10): divergence logged in OQ-05, V2 tag retained. |
| Priority | Must (Android), Should (iOS) |
| Version | V2 |
| Traceability | `PROJECT.md` §10, §12, §2.10; `prd/research/05-infrastructure-usage.md` §2; `prd/research/00-baseline-corrections.md` #10 |
| Actors | Parents, students, teachers |

### NFR-MOB-03 — Absence notification in under 5 minutes after attendance is taken

| Attribute | Value |
|---|---|
| Description | Between the server receiving confirmation of a class's attendance and delivery of the absence notification to the active legal guardians concerned, under 5 minutes elapses at the 95th percentile, excluding offline resync time for the entry (definition aligned with FR-VSC-02 of `prd/modules/13-attendance-student-life-discipline.md`). "Delivery" means acceptance by the channel used, available per version (NFR-MOB-05): push notification delivered, WhatsApp message accepted by the API (for consenting, opted-in parents), otherwise SMS accepted by the aggregator (households without a smartphone). Every notification carries its send timestamp and channel status, both measurable (NFR-OBS-03). |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §7.4, DEC-12, DEC-36; H-11; BES-SUR-02, BES-PAR-02; PC-05 (`prd/journeys/00-journey-map.md`) |
| Actors | Head supervisor, supervisors, teachers, parents |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Absence notification to families
  Scenario: Notification within the 5-minute deadline (MVP)
    Given a supervisor who confirms attendance for a class of 40 students at 08:05
    And 3 students are absent, each with at least one active legal guardian
    When attendance is confirmed
    Then each affected guardian receives the notification on their priority channel in under 5 minutes, after the 3-minute retention window allowing an attendance correction (ARB-15b)
    And every notification carries its send timestamp and the status of the channel used
    And a second absence for the same student on the same day does not trigger a new immediate notification but appears in the evening summary (ARB-15a)

  Scenario: Channel fallback on a push failure (V1)
    Given a parent whose push-enabled device is unreachable
    And who has consented to WhatsApp messages
    When the push notification fails
    Then the WhatsApp utility message is sent automatically
    And on a WhatsApp failure, the SMS is sent within the school's credit limit
```

### NFR-MOB-04 — Critical journeys adapted to entry-level devices

| Attribute | Value |
|---|---|
| Description | Attendance-taking, grade entry, parent/student viewing, and certificate issuance are fully usable on entry-level phones (small screens, limited memory) and on registrar-office's older computers; no critical entry relies on gestures or high-end device capabilities. Ergonomic templates (target sizes, densities, numeric keypads for grades) are detailed in `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §2.10, §10; BES-SEC-08, BES-SUR-01, BES-ENS-03 |
| Actors | Teachers, supervisors, registrar's office, parents, students |

### NFR-MOB-05 — Channel reliability and automatic fallback

| Attribute | Value |
|---|---|
| Description | The channel hierarchy is push, then WhatsApp utility (consenting parents), then SMS (Moroccan aggregator) — email remains secondary (DEC-12, DEC-36). At MVP, notification relies on in-app and SMS, supplemented by WhatsApp utility limited to attendance notifications (minimal templates, consenting parents); push notification and generalized WhatsApp (all messages, managed templates) arrive in V1 (arbitration logged in OQ-08). Every notification carries a traceable status (accepted, delivered, failed, fallback); a channel failure triggers automatic fallback to the next channel, within the school's consumables credit. Per-school SMS and WhatsApp credit counters trigger threshold alerts to the principal's office (market models: `prd/research/03-payments-communications.md` §4 and §5). Since WhatsApp costs change on 10/01/2026, the pricing switch is a dated platform-side parameter. Push notifications (V1) travel through Google's (FCM) and Apple's (APNs) services, hosted outside Morocco: their activation is conditioned on those services being entered in the sub-processor register with a transfer basis (SEC-18, CNF-09, ARB-25d); no push is sent at MVP (ARB-21b). Authentication SMS (OTP, invitations) is borne by ZSchool and does not draw on the school's credits (PAK-17). |
| Priority | Must |
| Version | MVP (in-app and SMS; WhatsApp utility limited to attendance notifications, minimal templates); V1 (push conditional on a transfer basis, generalized WhatsApp) |
| Traceability | `PROJECT.md` §10, §2.10, DEC-12, DEC-36; H-11, H-20; `prd/research/03-payments-communications.md` §4-5; `prd/research/00-baseline-corrections.md` #6 |
| Actors | Principal's office, ZSchool operator |

### NFR-MOB-06 — Supported browser and OS floor

| Attribute | Value |
|---|---|
| Description | The platform is tested and guaranteed on: the last two major versions of Chrome, Firefox, Edge, and Safari (desktop and mobile); Android 8 and later (Chrome browser and installed PWA); iOS 15 and later (Safari and installed PWA); Windows 10 and later for registrar-office workstations; a minimum screen width of 360 pixels. A browser or OS below the floor shows a clear bilingual message with alternatives (update, another browser) instead of a silent malfunction. The registrar persona's "older PC" (BES-SEC-08) is thus defined as a Windows 10 machine with an up-to-date browser; machines that cannot reach it fall under onboarding support. The floor is reviewed and published annually. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §2.10, §10; BES-SEC-08; ARB-25q; NFR-MOB-01, NFR-MOB-04 |
| Actors | All; ZSchool operator |

---

## 7. Offline operation

### NFR-OFF-01 — Attendance-taking tolerant of outages

| Attribute | Value |
|---|---|
| Description | Taking attendance for a class or a course continues without a network: check-ins are stored locally on the device (protected storage), the screen shows a "pending sync" state, and no entry is lost on a connection drop, an app being closed, or a dead battery. Resuming requires no user action beyond reopening the app. On iOS, PWA limitations (storage eviction after seven days of inactivity, no background sync) are covered by the dedicated NFR-OFF-05 test plan. Offline operation is required at MVP by supervisor and teacher needs, although not listed verbatim in §12: justified in OQ-06. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §2.10; BES-SUR-01, BES-ENS-02 |
| Actors | Head supervisor, supervisors, teachers |

### NFR-OFF-02 — Grade entry tolerant of outages

| Attribute | Value |
|---|---|
| Description | Entering a grade sheet (test, exam) continues offline: entered values are stored locally per sheet, and resuming reopens the sheet in its exact state. Publishing grades and report cards remains a server operation (immutability, RG-33): it requires the network and never runs off unsynced data without explicit verification. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §7.5; RG-33; BES-ENS-03 |
| Actors | Teachers |

### NFR-OFF-03 — Idempotent sync when the network returns

| Attribute | Value |
|---|---|
| Description | As soon as the network returns, local entries sync automatically: every operation is idempotent (a replay never creates a duplicate), the logical order of operations is respected, and the timestamp kept is that of the original entry (stored in UTC and displayed in `Africa/Casablanca` time, NFR-I18N-04), not that of the sync. A sync report (operations sent, accepted, in conflict) is visible to the author; a partial sync never blocks further entry. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10; RG-38; NFR-I18N-04 |
| Actors | Head supervisor, supervisors, teachers |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Syncing offline entries
  Scenario: Attendance taken with no network, then synced
    Given a teacher who marked 28 present and 4 absent during a network outage
    And a local timestamp of 08:40 for each check-in
    When the network returns
    Then all 32 check-ins are transmitted automatically without duplication or loss
    And each check-in's timestamp is stored in UTC, corresponding to 08:40 Casablanca time
    And the sync report shows 32 operations accepted

  Scenario: Extended outage with the app closed
    Given attendance two-thirds taken before the battery dies
    When the teacher reopens the app with network access
    Then the attendance sheet is restored to its exact state
    And syncing continues without re-entry
```

### NFR-OFF-04 — Deterministic resolution of entry conflicts

| Attribute | Value |
|---|---|
| Description | Concurrent changes (two entries for the same field, a server-side correction made during the offline period) are resolved by deterministic rules announced to users: for already-published or locked data (RG-33), the server prevails and the overwrite is denied with an explanation; for working fields (attendance, unpublished grades), the latest timestamped write prevails, with an alert to the author when overwritten. No conflict is resolved silently; a tenant's conflict log is viewable by the principal's office. |
| Priority | Must |
| Version | MVP (basic rules); conflict-review interface in V1 |
| Traceability | `PROJECT.md` §10; RG-33, RG-38; INV-26 |
| Actors | Teachers, head supervisor, principal's office |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Offline entry conflict
  Scenario: A grade changed in parallel on the server
    Given a test grade entered offline by a teacher at 21:05
    And a correction to the same grade recorded on the server at 18:30 by the department head
    When the local entry syncs
    Then the server-side change prevails for that field
    And the teacher is alerted to the overwrite with both values shown
    And the tenant's conflict log records the event

  Scenario: Conflict on published data
    Given a published, locked report card
    And a local offline entry targeting that report card
    When the sync attempts the write
    Then the write is denied with an explanation
    And a new report-card version remains the only path to correction (RG-33)
```

### NFR-OFF-05 — Dedicated offline test plan for iOS (PWA)

| Attribute | Value |
|---|---|
| Description | On iOS (32% of mobile web traffic, `prd/research/05-infrastructure-usage.md` §2), Safari evicts a non-installed site's web storage after seven days without a visit, offers no background sync, and only delivers push notifications to a PWA installed on the home screen. As a result: (a) PWA installation is offered on the first iOS login for teacher and student-life roles, with a bilingual guide; (b) any unsynced offline entry is flagged persistently, with a reminder shown every time the app opens while it remains unsynced, syncing running when the app opens; (c) the user is warned when pending entries approach the eviction limit (from the fifth day onward); (d) a dedicated iOS test plan (Safari and installed PWA, floor versions per NFR-MOB-06) covers attendance-taking, grade entry, and resuming after a forced close, with the acceptance criterion of NFR-OFF-01: no entry lost. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10; NFR-OFF-01, NFR-OFF-03, NFR-MOB-01, NFR-MOB-06; ARB-25r; `prd/research/05-infrastructure-usage.md` §2 |
| Actors | Teachers, supervisors; ZSchool operator |

---

## 8. Documents

### NFR-DOC-01 — Every document produced as a bilingual PDF

| Attribute | Value |
|---|---|
| Description | Every document within the shipped version's scope (report cards, annual transcripts, enrollment documents, front-desk enrollment certificate, exit file, and batch certificates from MVP onward — ARB-01; full self-service catalog in V1) is produced as a PDF using a French, Arabic, or bilingual (FR/AR) template, chosen by the school. On-screen and printed rendering are identical; Arabic layout respects the reading direction; stamp, signature, numbering, and QR notices are integrated into the template. |
| Priority | Must |
| Version | MVP (report cards, annual transcripts, enrollment documents, enrollment certificate, exit file, batch certificates in wave 2); V1 (full self-service catalog) |
| Traceability | `PROJECT.md` §10, §12, §2.9, DEC-10, DEC-32; ARB-01 |
| Actors | Principal's office, registrar's office, teachers, parents, students |

### NFR-DOC-02 — Correct Arabic fonts and A4/A5 formats

| Attribute | Value |
|---|---|
| Description | PDF templates embed complete Arabic fonts (ligatures, hamzas, configurable Arabic-Indic or Western digits): rendering is identical on every device and printer, without depending on local fonts. Every document type is available in A4 and A5 formats (report cards printable at A5 for family signature). |
| Priority | Must |
| Version | MVP (report cards, enrollment certificates); V1 (full catalog) |
| Traceability | `PROJECT.md` §10, §2.9, DEC-10 |
| Actors | Principal's office, registrar's office, teachers, parents |

### NFR-DOC-03 — Batch printing

| Attribute | Value |
|---|---|
| Description | Batch-printing a school's report cards (by class, level, or in full) happens as one operation, within the performance envelope of NFR-PERF-03 (under 10 minutes for 2,000 students), with configurable sorting (class then rank, or alphabetical), continuous numbering, and resume on failure without regenerating already-produced documents. Batch printing extends to enrollment certificates (start-of-year insurance, FR-DOC-15) from MVP wave 2 onward (ARB-01) and to the full catalog in V1 (§7.6). |
| Priority | Must |
| Version | MVP (report cards; batch certificates in wave 2); V1 (full catalog) |
| Traceability | `PROJECT.md` §10, §12, §7.6; NFR-PERF-03 |
| Actors | Principal's office, registrar's office |

### NFR-DOC-04 — Printed, scannable verification QR code

| Attribute | Value |
|---|---|
| Description | Published documents carry a printed verification QR code with sufficient contrast and minimum size to guarantee scanning from a standard phone (including A5 or medium-quality print). Online verification confirms the document's authenticity, version, and signatory without depending on the issuing school and without exposing personal data beyond what strict verification requires. |
| Priority | Must |
| Version | V1 |
| Traceability | `PROJECT.md` §10, §7.5, DEC-09; RG-33; INV-26; PC-10 (`prd/journeys/00-journey-map.md`) |
| Actors | Principal's office, registrar's office, parents, employers and receiving schools |

---

## 9. Observability

### NFR-OBS-01 — Per-tenant observability

| Attribute | Value |
|---|---|
| Description | Every request and every asynchronous task carries the tenant (school) key: technical logs, metrics, and traces are filterable by school, without access to data content. An incident or an abnormal load for one tenant is isolated and diagnosed without hindering diagnosis for other tenants. School-group (organization) consolidation is available in V1. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10; INV-17; DEC-02 |
| Actors | ZSchool operator, principal's office |

### NFR-OBS-02 — Immutable, exportable audit log

| Attribute | Value |
|---|---|
| Description | Every write action and every sensitive-data view (identity file, health, finance, discipline) is logged with author, context, and timestamp, in an immutable, exportable log kept for 5 years (DEC-22). Event types, export format, and access rules are specified in `prd/cross-cutting/31-security-privacy.md` and carried by invariant INV-33. At MVP (arbitration D4, ARB-25j), writes are logged immutably at the record level and security and support-access events are logged (SEC-11). |
| Priority | Must |
| Version | MVP (write logging, security, support — D4); V1 (sensitive-view log, console, export) |
| Traceability | `PROJECT.md` §10, §9, DEC-22; RG-38; INV-33 |
| Actors | Principal's office, ZSchool operator |

### NFR-OBS-03 — Service metrics and operational alerts

| Attribute | Value |
|---|---|
| Description | The service indicators defined in this chapter are measured continuously: availability (NFR-DISP-01), page and generation latency (NFR-PERF-01, NFR-PERF-02), absence notification delay (NFR-MOB-03), error rate (NFR-DISP-05), PDF-generation and notification queues, offline sync success rate (NFR-OFF-03). Operational alerts with thresholds and escalation notify ZSchool before schools have to report an issue. A per-tenant health dashboard and a global dashboard are available to operations. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10; NFR-DISP-01, NFR-PERF-01, NFR-PERF-02, NFR-MOB-03, NFR-DISP-05 |
| Actors | ZSchool operator |

### NFR-OBS-04 — End-to-end correlation and logged support access

| Attribute | Value |
|---|---|
| Description | A correlation identifier propagates every request from the interface through services and asynchronous tasks: an incident reported by a school is reconstructed end-to-end from this identifier, without viewing the data. ZSchool support's access to a tenant's context goes exclusively through an audited ticket (G-32) and shows only the data minimally needed for diagnosis. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, G-32; `prd/03-domain-data-model.md` §2.7 (`SupportTicket`) |
| Actors | ZSchool operator, principal's office |

### NFR-OBS-05 — Per-school consumption counters

| Attribute | Value |
|---|---|
| Description | Billed consumables (SMS, WhatsApp conversations, document storage beyond the quota, DEC-28) are counted per school and visible to the principal's office in near real time (under 15 minutes of lag), with the monthly history from September to June. These counters feed monthly consumables billing and threshold alerts (NFR-MOB-05). Active-student counting rules (entry month, suspension, closure) are carried by the model (`UsageMetric`) and detailed in the administration module. Authentication SMS (OTP, MFA, invitations) is counted separately as a platform cost and never charged to the school (PAK-17). |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §11, DEC-28; `prd/03-domain-data-model.md` §2.7 (`UsageMetric`); OQ-05 of `prd/03-domain-data-model.md` |
| Actors | Principal's office, ZSchool operator |

---

## 10. Interoperability

### NFR-INT-01 — Excel, CSV, and PDF exports on every list and report

| Attribute | Value |
|---|---|
| Description | Every list or report managed by the platform (students, enrollments, attendance, grades, arrears, audit log, consumption) is exportable as an Excel workbook (.xlsx) and CSV; documents and report cards are exportable as PDF. Files destined for Massar are out of scope for this chapter: ministry template formats by subject, class, and semester, consistency checks before submission, and the ban on any entry automation without the ministry's agreement (H-04) are specified in `prd/cross-cutting/35-external-integrations.md` §2 (INT-MAS) and `prd/modules/21-massar-regulatory-exports.md` (FR-MAS), without duplication here. |
| Priority | Must |
| Version | MVP (internal exports; Massar exports of lists and continuous-assessment grades in wave 2 — ARB-01); V1 (ESISE regulatory statistics) |
| Traceability | `PROJECT.md` §10, §12; BES-DIR-03; G-08; ARB-01; cross-references: `prd/cross-cutting/35-external-integrations.md` §2 (INT-MAS), `prd/modules/21-massar-regulatory-exports.md` |
| Actors | Principal's office, registrar's office, teachers, accounting |

### NFR-INT-02 — File exchange conventions

| Attribute | Value |
|---|---|
| Description | Exports follow stable conventions: UTF-8 encoding readable in Excel, including for Arabic; dates in UTC with the `Africa/Casablanca` timezone labeled; grades to two decimal places; people's names in dual script (two distinct columns); documented headers stable across versions; a configurable CSV separator. Any structural change to a public export is announced to users at least one month in advance. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §2.9; NFR-I18N-03, NFR-I18N-04 |
| Actors | Principal's office, registrar's office, accounting, third-party integrators |

### NFR-INT-03 — Documented public API in V2

| Attribute | Value |
|---|---|
| Description | A documented, versioned public API lets third-party integrations (accounting, portals, school tools) read and, per rights, write authorized objects: per-school authentication, permissions identical to the app (least privilege, RG-39), per-school rate limiting, call logging. No Massar channel is promised as long as no official channel exists (H-04 confirmed); Massar interoperability remains the file-based channel (`prd/cross-cutting/35-external-integrations.md` §2, INT-MAS). |
| Priority | Should |
| Version | V2 |
| Traceability | `PROJECT.md` §10, §12; RG-39; H-04; `prd/cross-cutting/35-external-integrations.md` |
| Actors | Principal's office, integrators, ZSchool operator |

### NFR-INT-04 — Business-event webhooks in V2

| Attribute | Value |
|---|---|
| Description | Major business events (absence recorded, report card published, payment received, document issued) can be pushed to third-party systems via a signed webhook, activated per school and per event type, with a delivery log, replay on failure, and immediate removal on deactivation. The baseline cites webhooks in §10 without a version; they are placed in V2 alongside the public API, a hypothesis logged in OQ-07. |
| Priority | Should |
| Version | V2 |
| Traceability | `PROJECT.md` §10, §12; `prd/03-domain-data-model.md` §7 (domain events) |
| Actors | Principal's office, integrators |

---

## 11. Backup and restore

### NFR-SAV-01 — Daily backups hosted in Morocco

| Attribute | Value |
|---|---|
| Description | An automatic daily backup covers all data: databases (operational data, global identities), document files, tenant configuration, and logs. Backups are stored in Morocco (DEC-26), encrypted, and their integrity is automatically verified after each run, with an alert on failure. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, DEC-26; `prd/research/05-infrastructure-usage.md` §1; `prd/research/00-baseline-corrections.md` #13 |
| Actors | ZSchool operator |

### NFR-SAV-02 — At least 30-day retention

| Attribute | Value |
|---|---|
| Description | At least 30 days of daily restore points are kept; beyond that, monthly retention up to 12 months is targeted in V1. This backup retention is independent of application-level retention periods (DEC-22): restoring never brings back data whose deletion resulted from an obligation (right to erasure, anonymization); any restore from a copy predating an anonymization or deletion automatically replays the retention operations that occurred since then (anonymization log, CNF-21), and the V1 monthly copies are purged of anonymized identities on first use (ARB-25s). At MVP, only the 30-day retention applies. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10; DEC-22; RG-34 |
| Actors | ZSchool operator |

### NFR-SAV-03 — Quarterly restore test

| Attribute | Value |
|---|---|
| Description | A full restore is tested every quarter on an isolated environment, following a written scenario: data from a sample of tenants, documents, configuration. The actual restore time is measured and compared against the recovery target (NFR-DISP-03); a failure or overrun opens a dated action plan. Each exercise is reported and kept on record. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10; NFR-DISP-03 |
| Actors | ZSchool operator |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Quarterly restore test
  Scenario: Full restore succeeds within targets
    Given day J's daily backup of a production environment
    And an isolated restore environment
    When the quarterly exercise runs
    Then the sample tenants' data is restored and verified by integrity checks
    And documents and configuration are restored
    And the observed restore time meets the NFR-DISP-03 target
    And an exercise report is archived

  Scenario: Restore failure
    Given an exercise whose restore fails or overruns the target
    When the report is produced
    Then a dated action plan is opened before the end of the quarter
    And a new exercise is scheduled to verify the fix
```

### NFR-SAV-04 — Granular per-school restore

| Attribute | Value |
|---|---|
| Description | A point-in-time restore is possible for a single school (correcting an accidental deletion, a bulk-processing error) without interrupting or overwriting other tenants' data. The procedure is tracked, auditable, and requires approval by an authorized operator with a recorded reason; the restored tenant is informed when the operation touches its data. During the pilot phase, a global restore remains the documented last resort. |
| Priority | Must |
| Version | V1 |
| Traceability | `PROJECT.md` §10; RG-38; INV-17 |
| Actors | ZSchool operator, principal's office |

---

## 12. Resources, capacity, and accessibility

### NFR-RES-01 — Three-year capacity target

| Attribute | Value |
|---|---|
| Description | The architecture is sized for, at three years: 500 schools, 500,000 students, 1,000,000 guardians, 30,000 teachers — roughly 2.5 times the commercial ambition of DEC-27 (300 schools, 200,000 students). This sizing covers storage (data and documents), the database, and the document-generation and notification queues; it is validated by a load test at the target volume before year 3 and reassessed annually against actual growth. |
| Priority | Must |
| Version | V1 (validation by load test); ongoing trajectory from MVP onward |
| Traceability | `PROJECT.md` §10, DEC-27 |
| Actors | ZSchool operator |

### NFR-RES-02 — Absorbing seasonal peaks

| Attribute | Value |
|---|---|
| Description | Seasonal peaks are explicitly sized for: start of the school year (enrollment, class assignment, imports, §2.11), end of period (report-card publications, NFR-PERF-03), re-enrollment campaigns (V1). A peak factor (maximum load relative to average load for write journeys, default value of 5 to be finalized in technical review) is documented and covered by capacity; one tenant's peaks do not degrade the service for others (see NFR-RES-05). |
| Priority | Must |
| Version | V1 |
| Traceability | `PROJECT.md` §2.11, §10, DEC-27; NFR-PERF-03 |
| Actors | ZSchool operator, principal's office |

### NFR-RES-03 — Controlled document storage

| Attribute | Value |
|---|---|
| Description | Every school has a document-storage quota (consumable beyond the quota, DEC-28): 2 GB per school plus 5 MB per active student, a working hypothesis to be confirmed by the founder (ARB-25o; PAK-11). Generated PDFs are compressed and deduplicated; automatic purges apply DEC-22's retention periods, never touching permanently retained documents (registers, report cards, transcripts, certificates). A near-quota alert (default: 90%) is sent to the principal's office. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §11, DEC-22, DEC-28; RG-34; NFR-OBS-05 |
| Actors | Principal's office, ZSchool operator |

### NFR-RES-04 — Accessibility of the main journeys

| Attribute | Value |
|---|---|
| Description | The main journeys (parent and student viewing, attendance-taking, grade entry, certificate issuance, principal's-office dashboards) meet: sufficient contrast, adjustable font sizes with no loss of functionality, full keyboard navigation, screen-reader compatibility. The target standard is WCAG 2.1 level AA on the main journeys from MVP onward (UX-14, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`), the baseline requiring these four dimensions without naming a standard; a formal compliance audit is conducted in V1 (ARB-25p). |
| Priority | Must |
| Version | MVP (WCAG 2.1 AA target, UX-14); V1 (formal audit) |
| Traceability | `PROJECT.md` §10; `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` (UX-14); ARB-25p |
| Actors | All |

### NFR-RES-05 — Fair service across tenants

| Attribute | Value |
|---|---|
| Description | A school's heavy workloads (publishing 2,000 report cards, imports, bulk sends) run in per-tenant compartmentalized queues: interactive service for other schools degrades by no more than 10% during their execution, and no tenant's task can starve other tenants' queues. Compartmentalization is verified by the NFR-RES-01 load test. |
| Priority | Must |
| Version | V1 |
| Traceability | `PROJECT.md` §10; INV-17; NFR-RES-01, NFR-PERF-03 |
| Actors | ZSchool operator, principal's office |

---

## 13. Open questions

| ID | Question | Context and recommendation |
|---|---|---|
| OQ-01 | **Escalated — ESC-03 (baseline update):** Baseline update on the timezone | `PROJECT.md` §2.4 and §10 still read "UTC+1 with a return to UTC+0 during Ramadan". Decree No. 2.26.530 (Official Gazette No. 7521 of 06/29/2026) fixed the permanent return to UTC+0 on 09/20/2026, with no alternation or Ramadan exception (`prd/research/00-baseline-corrections.md` #1). This chapter retains permanent UTC+0 (NFR-I18N-04); the baseline is to be brought into line during review. |
| OQ-02 | Baseline's digital-usage figures | The baseline cites "8% of households without a smartphone, up to 14% in rural areas" and presents 68/32 as device share. The ANRT 2024-2025 survey gives 78.4% rural household internet access and 67.96/32.02 as web traffic shares (`prd/research/05-infrastructure-usage.md` §2; `prd/research/00-baseline-corrections.md` #10). This chapter cites the ANRT data; the rural gap remains accounted for (NFR-PERF-04, NFR-OFF, SMS fallback). |
| OQ-03 | Choice of Moroccan failover site | The baseline retains "a second Moroccan failover site" (Q-08, DEC-26). The af-casablanca-1 region has only one availability domain and the second Oracle region (Settat) has no timeline (`prd/research/05-infrastructure-usage.md` §1; `prd/research/00-baseline-corrections.md` #13). Arbitration expected in review: Atlas Cloud Benguerir (Tier III + IV), OVHcloud Local Zone Rabat (limited services), or waiting for the Settat region; it conditions NFR-DISP-03's RTO/RPO target and the service catalog to be verified (H-18). |
| OQ-04 | **Resolved — DEC-10 (FR/AR from MVP); baseline to correct, ESC-03:** FR/AR positioning: baseline §10 says "in V1", DEC-10 and §12 say "from MVP" | This chapter retains MVP (explicit decision DEC-10 and §12 MVP "FR/AR"); to be confirmed in review and corrected in the baseline. |
| OQ-05 | **Resolved — ARB-21b (native apps in V2); baseline to correct, ESC-03:** Native apps: baseline §10 says V2, the §12 V1 list mentions them | This chapter retains V2 (§10, PRD guidance); the §12 V1 list mention is to be arbitrated in review (DEC-15 makes chapter 12 the reference for versions). |
| OQ-06 | Offline operation at MVP | Offline operation (attendance and grades) appears in §10 with no version and is not listed verbatim in §12 MVP; it is retained as Must MVP because the affected journeys are MVP (attendance, grades) and required by BES-SUR-01, BES-ENS-02, and BES-ENS-03 (all Must MVP). Confirmation in review. |
| OQ-07 | Webhook version | §10 cites webhooks without a version; §12 mentions them implicitly via "public API" in V2. Retained as V2 (NFR-INT-04); to be confirmed in review. |
| OQ-09 | Values for the standard support commitment (hours, response times) proposed in NFR-DISP-06 | Working hypotheses (ARB-25) to be confirmed with the pilots and the founder before the pilot agreement (CNF-08). |
| OQ-08 | **Resolved — D1, ARB-21b:** Notification channels at MVP (WhatsApp, push) | §12 lists WhatsApp and push notification in V1. Review arbitration adopted: at MVP, in-app and SMS notifications, supplemented by WhatsApp utility limited to attendance notifications (minimal templates, consenting parents, DEC-36); push notification and generalized WhatsApp (all messages, managed templates) arrive in V1 (NFR-MOB-05; INT-WAP of `prd/cross-cutting/35-external-integrations.md`; FR-VSC-03 and FR-VSC-04 of `prd/modules/13-attendance-student-life-discipline.md`). |

---

## Traceability

Table mapping baseline and research IDs to the requirements of this file covering them (consolidated matrix generated in `prd/README.md` after review).

| Source ID | Requirements in this file |
|---|---|
| `PROJECT.md` §10 — Performance (G-21) | NFR-PERF-01, NFR-PERF-02, NFR-PERF-03, NFR-PERF-04, NFR-PERF-05 |
| `PROJECT.md` §10 — Availability | NFR-DISP-01, NFR-DISP-02, NFR-DISP-03, NFR-DISP-04, NFR-DISP-05, NFR-DISP-06 |
| `PROJECT.md` §10 — Target volumetry | NFR-RES-01, NFR-RES-02, NFR-RES-03, NFR-RES-05 |
| `PROJECT.md` §10 — Timezone and calendar | NFR-I18N-04, NFR-I18N-05 (+ OQ-01) |
| `PROJECT.md` §10 — Notifications | NFR-MOB-03, NFR-MOB-05 |
| `PROJECT.md` §10 — Languages | NFR-I18N-01, NFR-I18N-02, NFR-I18N-03, NFR-I18N-06 (+ OQ-04) |
| `PROJECT.md` §10 — Platforms | NFR-MOB-01, NFR-MOB-02, NFR-MOB-06 (+ OQ-05) |
| `PROJECT.md` §10 — Offline | NFR-OFF-01, NFR-OFF-02, NFR-OFF-03, NFR-OFF-04, NFR-OFF-05 (+ OQ-06) |
| `PROJECT.md` §10 — Documents | NFR-DOC-01, NFR-DOC-02, NFR-DOC-03, NFR-DOC-04 |
| `PROJECT.md` §10 — Accessibility | NFR-RES-04 (WCAG 2.1 AA targeted at MVP, ARB-25p) |
| `PROJECT.md` §10 — Observability | NFR-OBS-01, NFR-OBS-02, NFR-OBS-03, NFR-OBS-04, NFR-OBS-05 |
| `PROJECT.md` §10 — Interoperability | NFR-INT-01, NFR-INT-02, NFR-INT-03, NFR-INT-04 (+ OQ-07) |
| `PROJECT.md` §10 — Backups | NFR-SAV-01, NFR-SAV-02, NFR-SAV-03, NFR-SAV-04 |
| `PROJECT.md` G-21 | Entire file |
| `PROJECT.md` §2.4 | NFR-I18N-04, NFR-I18N-05 |
| `PROJECT.md` §2.9 | NFR-I18N-01, NFR-I18N-03, NFR-DOC-01, NFR-DOC-02 |
| `PROJECT.md` §2.10 | NFR-PERF-01, NFR-PERF-04, NFR-MOB-01, NFR-MOB-04, NFR-MOB-06, NFR-OFF-01, NFR-OFF-02, NFR-OFF-05 |
| `PROJECT.md` §2.11 | NFR-DISP-05, NFR-RES-02 |
| `PROJECT.md` §12 (scope by version) | "Version" column of every requirement |
| DEC-09 | NFR-DOC-04, NFR-PERF-02 |
| DEC-10 | NFR-I18N-01, NFR-I18N-03, NFR-I18N-06, NFR-DOC-01 |
| DEC-12 | NFR-MOB-03, NFR-MOB-05 |
| DEC-22 | NFR-OBS-02, NFR-SAV-02, NFR-RES-03 |
| DEC-26 | NFR-DISP-03, NFR-SAV-01 |
| DEC-27 | NFR-RES-01, NFR-RES-02, NFR-DISP-05 |
| DEC-28 | NFR-OBS-05, NFR-RES-03 |
| DEC-32 | NFR-DOC-01 |
| DEC-35 | NFR-PERF-03, NFR-PERF-05 |
| DEC-36 | NFR-MOB-03, NFR-MOB-05 |
| H-04 | NFR-INT-03 |
| H-11 | NFR-PERF-01, NFR-MOB-03, NFR-MOB-05 |
| H-18 | NFR-DISP-03 (+ OQ-03) |
| H-20 | NFR-MOB-05 |
| RG-33 | NFR-PERF-02, NFR-PERF-03, NFR-OFF-02, NFR-OFF-04, NFR-DOC-04 |
| RG-34 | NFR-SAV-02, NFR-RES-03 |
| RG-38 | NFR-OFF-03, NFR-OFF-04, NFR-SAV-04 |
| RG-39 | NFR-INT-03 |
| INV-17 | NFR-OBS-01, NFR-SAV-04, NFR-RES-05 |
| INV-26 | NFR-PERF-02, NFR-OFF-04, NFR-DOC-04 |
| INV-33 | NFR-OBS-02 |
| `prd/research/00-baseline-corrections.md` #1 | NFR-I18N-04 (+ OQ-01) |
| `prd/research/00-baseline-corrections.md` #6 | NFR-MOB-05 |
| `prd/research/00-baseline-corrections.md` #10 | NFR-PERF-04, NFR-MOB-02 (+ OQ-02) |
| `prd/research/00-baseline-corrections.md` #13 | NFR-DISP-03, NFR-SAV-01 (+ OQ-03) |
| `prd/research/01-market-competition.md` §4 | NFR-DISP-05 |
| `prd/research/03-payments-communications.md` §4-5 | NFR-MOB-05 |
| `prd/research/04-pedagogy-massar-calendar.md` §1-2 | NFR-I18N-04, NFR-I18N-05, NFR-DISP-02 |
| `prd/research/05-infrastructure-usage.md` §1-2 | NFR-DISP-03, NFR-SAV-01, NFR-PERF-01, NFR-PERF-04, NFR-MOB-02 |
| BES-SEC-08 (`prd/02-actors-personas.md`) | NFR-PERF-01, NFR-PERF-04, NFR-MOB-01, NFR-MOB-04, NFR-MOB-06 |
| ARB-01 (MVP scope: documents, Massar exports in wave 2) | NFR-DOC-01, NFR-DOC-02, NFR-DOC-03, NFR-INT-01 |
| ARB-15 (aggregated notification, retention window) | NFR-MOB-03 |
| ARB-21b, ARB-21c (no push at MVP; per-person language) | NFR-MOB-05; NFR-I18N-01 |
| ARB-25d (push FCM/APNs: transfer basis) | NFR-MOB-05 |
| ARB-25h, ARB-25i (off-site replication at MVP; SLA excluding a disaster; RTO/RPO limited to a site-level disaster) | NFR-DISP-01, NFR-DISP-03 |
| ARB-25j (D4 logging) | NFR-OBS-02 |
| ARB-25o (storage quota) | NFR-RES-03 |
| ARB-25p (WCAG 2.1 AA) | NFR-RES-04 |
| ARB-25q (browser floor) | NFR-MOB-06 |
| ARB-25r (iOS test plan) | NFR-OFF-05 |
| ARB-25s (backups and anonymization) | NFR-SAV-02 |
| PAK-14, PAK-17 (standard support; authentication SMS) | NFR-DISP-06; NFR-OBS-05 |
| BES-SUR-01, BES-SUR-02 | NFR-OFF-01, NFR-MOB-03, NFR-MOB-04 |
| BES-ENS-02, BES-ENS-03 | NFR-OFF-01, NFR-OFF-02, NFR-PERF-04 |
| BES-PAR-02 | NFR-MOB-03 |
| BES-DIR-03 | NFR-INT-01 |
| PC-03, PC-05, PC-06, PC-10 (`prd/journeys/00-journey-map.md`) | NFR-PERF-05, NFR-MOB-03, NFR-PERF-02, NFR-PERF-03, NFR-DOC-04 |
