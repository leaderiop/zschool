> **Document Control**
>
> | Property       | Value                                                                                                                                                                                                                       |
> | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-CC-05                                                                                                                                                                                                               |
> | Revision       | 1.0                                                                                                                                                                                                                         |
> | Effective Date | 2026-09-09                                                                                                                                                                                                                  |
> | Status         | Draft                                                                                                                                                                                                                       |
> | Author         | ZSchool Product                                                                                                                                                                                                             |
> | Classification | Functional Specification — Cross-Cutting UX                                                                                                                                                                                 |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md` (v0.3), old `UX-01..17` -> `UX-ZS-001..017`, old `ECR-UX-01..09` -> `SCR-ZS-171..179`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Cross-Cutting UX/UI: Mobile-First, FR/AR Bilingualism (RTL), Shared Screens

## 1. Objective and scope

This chapter sets ZSchool's **cross-cutting user-experience standard**: principles, the FR/AR bilingual foundation with full RTL, context-based navigation rules, offline states, notification rules, form rules, accessibility, and the **screens shared across modules** (`SCR-ZS-171..179`). Every behaviors chapter (`spec/behaviors/01-administration-onboarding-subscription.md` to `spec/behaviors/14-health-sensitive-data.md`) references this standard in its own Screens subsection without redefining it; this chapter does not duplicate any module-specific screen.

**In scope**:

- guiding UX principles (mobile-first and Android-first, reliability, simplicity, cross-school consistency);
- a bilingual FR/AR design system with full RTL, dual-script names, Arabic typography;
- the profile × school context switcher ([INV-ZS-053](../invariants.md#inv-zs-053));
- visible offline states and resuming after an outage;
- notifications: preferences, consents, anti-spam, digests ([ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md));
- short forms, phone as the primary contact identifier ([ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md)), a distinct login identifier for people without their own mobile ([ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md));
- per-person language and account selection on a shared device (UX-ZS-001);
- accessibility (contrast, sizes, keyboard, screen readers on the main journeys);
- platforms: responsive web and PWA from MVP, native apps in V2 (see `spec/open-questions.md`, OQ-ZS-311); English in V2;
- cross-cutting screens `SCR-ZS-171` to `SCR-ZS-179`.

**Out of scope** (covered elsewhere, without duplication): each module's specific screens (owned by the `spec/behaviors/*.md` chapters), measurable non-functional thresholds (`spec/cross-cutting/03-non-functional-requirements.md`), permission rules (`spec/cross-cutting/01-permissions.md`), security (`spec/cross-cutting/02-security-privacy.md`), external integrations (`spec/cross-cutting/06-external-integrations.md`), legal compliance and consents (`spec/cross-cutting/07-legal-compliance-data-protection.md`), journey titles (`spec/journeys/00-journey-map.md` to `spec/journeys/07-students-minor-and-adult.md`), the glossary (`spec/glossary.md`). No graphic mockups and no code: screens are described in text (zones, elements, states, FR/AR behavior).

## 2. Users and use cases

Cross-cutting UX is sized by the baseline's usage realities and by the personas' needs (`spec/urs.md`):

| Persona                                    | Usage realities accounted for                                                                                                                                                                                                                                                       | UX requirements drawn on                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Ahmed, multi-school parent (`PAR`)         | A single account for three children in two schools; wants to see everything "from WhatsApp and one app"; Android smartphone, WhatsApp dominant                                                                                                                                      | UX-ZS-002, UX-ZS-003, UX-ZS-004, UX-ZS-005; SCR-ZS-171, SCR-ZS-172             |
| Naïma, custodial mother (`GAR`)            | Her own account, never shared; wants to see her qualities and rights per school; receives notifications in parallel with the father                                                                                                                                                 | UX-ZS-004, UX-ZS-005; SCR-ZS-173                                               |
| Khadija, part-time teacher (`ENS`)         | Two schools in the same year; attendance-taking and grade entry on her phone, in the evening, on an unstable connection                                                                                                                                                             | UX-ZS-002, UX-ZS-006, UX-ZS-004; SCR-ZS-174, SCR-ZS-175                        |
| Rachid, head supervisor (`SUR`)            | Mobile in hand at all times in the hallways; notifying absent students' parents before 10 AM                                                                                                                                                                                        | UX-ZS-002, UX-ZS-006, UX-ZS-007; SCR-ZS-175                                    |
| Fatima, secretary-cashier (`SEC`)          | Older PC and a phone; unstable connection; repetitive front-desk forms                                                                                                                                                                                                              | UX-ZS-008, UX-ZS-009, UX-ZS-010, UX-ZS-011                                     |
| Si Abdellah, school-group director (`DIR`) | Desk daily plus mobile on the road; multi-site consolidated views                                                                                                                                                                                                                   | UX-ZS-004, UX-ZS-011; SCR-ZS-176                                               |
| Youssef and Salma, students (`ELE`)        | Shared family phone with the father (generated login identifier, account selection on the device, own language); personal access from the level set ([INV-ZS-051](../invariants.md#inv-zs-051)); adult student in control of her rights ([INV-ZS-052](../invariants.md#inv-zs-052)) | UX-ZS-004, UX-ZS-009, UX-ZS-012, UX-ZS-001; SCR-ZS-177, SCR-ZS-173, SCR-ZS-172 |

Cross-cutting use cases covered by this chapter: switching context (profile × school) without getting lost; seeing at a glance what needs action; being notified reliably without being overwhelmed; completing a critical action (attendance, justification, payment, authorization signature) despite an unstable connection; using the interface in French or Arabic with the same level of quality.

## 3. Key journeys

The end-to-end journey map is authoritative (`spec/journeys/00-journey-map.md`); this chapter duplicates none of its steps. Cross-reference table of journeys → screens and UX requirements drawn on:

| Journey                                               | Screens and UX requirements drawn on                                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| JMP-ZS-001 (admission, enrollment)                    | SCR-ZS-172 (context), UX-ZS-008, UX-ZS-009; forms from `spec/behaviors/02-admissions-enrollment-reenrollment.md` |
| JMP-ZS-002 (re-enrollment, rollover)                  | UX-ZS-008, UX-ZS-007; screens from `spec/behaviors/02-admissions-enrollment-reenrollment.md`                     |
| JMP-ZS-003 (school onboarding)                        | UX-ZS-013, UX-ZS-014; screens from `spec/behaviors/01-administration-onboarding-subscription.md`                 |
| JMP-ZS-004 (identity claim by a parent)               | UX-ZS-009, SCR-ZS-171 (empty state), SCR-ZS-172                                                                  |
| JMP-ZS-005 (morning attendance, absence notification) | SCR-ZS-175, SCR-ZS-171 (alert), UX-ZS-006, UX-ZS-005, UX-ZS-007                                                  |
| JMP-ZS-006 (grades, council, report cards)            | SCR-ZS-174, SCR-ZS-177, SCR-ZS-178; UX-ZS-006                                                                    |
| JMP-ZS-007 (payment, reminder)                        | SCR-ZS-179 (viewing), UX-ZS-007; screens from `spec/behaviors/07-finance-billing-collections.md`                 |
| JMP-ZS-008 (Fatourati online payment)                 | SCR-ZS-179, UX-ZS-005                                                                                            |
| JMP-ZS-009 (transfers, exit file)                     | SCR-ZS-173 (consents), UX-ZS-004; screens from `spec/behaviors/09-transfers-mobility.md`                         |
| JMP-ZS-010 (self-service certificate)                 | SCR-ZS-171, SCR-ZS-179 (non-blocking arrears alert); screens from `spec/behaviors/06-documents-certificates.md`  |
| JMP-ZS-011 (announcement, notice, moderated thread)   | SCR-ZS-178, UX-ZS-005, UX-ZS-007                                                                                 |

## 4. UX requirements

`UX-ZS-NNN` identifiers are exclusive to this file. Every requirement carries a Version tag.

| ID        | Title                                                        | Priority                  |
| --------- | ------------------------------------------------------------ | ------------------------- |
| UX-ZS-002 | Design mobile-first, Android-first                           | Must                      |
| UX-ZS-006 | Connection reliability and visible offline states            | Must                      |
| UX-ZS-008 | Simplicity for low digital literacy                          | Must                      |
| UX-ZS-003 | Identical gestures and structures across schools             | Must                      |
| UX-ZS-013 | A single bilingual design system with full RTL               | Must                      |
| UX-ZS-015 | Dual-script names everywhere                                 | Must                      |
| UX-ZS-016 | Careful Arabic typography                                    | Must                      |
| UX-ZS-014 | Languages: French and Arabic at MVP, English in V2           | Must (FR/AR); Should (EN) |
| UX-ZS-004 | Profile × school context switcher                            | Must                      |
| UX-ZS-017 | Lightweight navigation and useful search                     | Should                    |
| UX-ZS-005 | Notification preferences and channel consent                 | Must                      |
| UX-ZS-007 | Anti-spam: priority, digests, quiet hours, visible costs     | Must                      |
| UX-ZS-009 | Short forms, phone-first, OTP authentication                 | Must                      |
| UX-ZS-012 | Accessibility: contrast, sizes, keyboard, screen readers     | Must                      |
| UX-ZS-010 | Responsive web and PWA at MVP; native apps in V2             | Must                      |
| UX-ZS-011 | Perceived performance and low-bandwidth mode                 | Must                      |
| UX-ZS-001 | Per-person language and account selection on a shared device | Must                      |

### 4.A Guiding principles

### UX-ZS-002: Design mobile-first, Android-first

> **Priority:** Must
> **Version:** MVP
> **See:** [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)

REQUIREMENT: Every journey MUST be designed, mocked up (in text), and tested first on a small touchscreen, then adapted for desktop — never the other way around.

Android is the priority testing platform (67.96% of mobile web traffic versus 32.02% for iOS, traffic share rather than device base, StatCounter August 2026); iOS remains well cared for. The desktop app stays complete for the principal's office and the registrar's office (management, imports, editing), with feature parity for daily journeys. Critical gestures (attendance, justification, viewing, payment) are one-handed.

Traceability: [URS-ZS-017](../urs.md).

### UX-ZS-006: Connection reliability and visible offline states

> **Priority:** Must
> **Version:** MVP
> **See:** `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS-003, NFR-ZS-004 — the PERF domain; the OFF domain)
> **Acceptance:** [`@REQ-ZS-500`](../../features/cross-cutting/ux/req-zs-500-attendance-reliability-offline.feature)

REQUIREMENT: Every critical write (attendance, grade entry, justification, thread reply) MUST be kept locally then synced, with no loss or duplicate entry; the connection and send status MUST be visible at all times (connected, offline, send pending, synced); recovery after an outage MUST be automatic; failures MUST be explicit and retryable.

Reliability on an unstable connection is the top acceptance criterion for write journeys: connection failures, blank screens, and outages are the dominant complaints about existing parent apps, including the ministry's Massar apps. No blank screen, no data silently lost, no raw technical message.

Traceability: [URS-ZS-018](../urs.md), [URS-ZS-027](../urs.md), [URS-ZS-028](../urs.md).

### UX-ZS-008: Simplicity for low digital literacy

> **Priority:** Must
> **Version:** MVP

REQUIREMENT: The interface MUST speak the school's language, not the software's: everyday vocabulary from `spec/glossary.md`, short sentences, at most one new concept per screen, guided step-by-step journeys for rare actions (identity claim, first justification, first payment), contextual help in French and Arabic, examples in fields. No daily-use function MUST require more than three steps.

Error messages state what happened and what to do, in French and Arabic, with no technical jargon or raw codes.

Traceability: [URS-ZS-035](../urs.md).

### UX-ZS-003: Identical gestures and structures across schools

> **Priority:** Must
> **Version:** MVP
> **Invariant:** [INV-ZS-053](../invariants.md#inv-zs-053), [INV-ZS-088](../invariants.md#inv-zs-088)

REQUIREMENT: Information structure, components, and gestures MUST be strictly identical across every context: a multi-school parent and a part-time teacher learn the app once. When switching school or child (UX-ZS-004), only the content MUST change — navigation, labels, action placement, and gesture sequences stay identical. No school-level customization MUST move navigation elements or rename core concepts.

Traceability: [URS-ZS-037](../urs.md), [URS-ZS-026](../urs.md).

### 4.B Bilingualism and RTL

### UX-ZS-013: A single bilingual design system with full RTL

> **Priority:** Must
> **Version:** MVP
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md); `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS-015)
> **Acceptance:** [`@REQ-ZS-501`](../../features/cross-cutting/ux/req-zs-501-bilingual-rtl-interface.feature)

REQUIREMENT: A single design system MUST serve both French and Arabic without duplication: every component MUST define its left-to-right and right-to-left reading state. RTL MUST be complete and native (mirrored layout, alignment, tables, navigation, directional icons); the school's logo and stamp, phone numbers, amounts, and payment references MUST never be mirrored. Language MUST be a per-user setting, attached to the account rather than the device (UX-ZS-001), with an instant switch. No untranslated string MUST be accepted in production on shipped journeys.

Mixed content (a Latin name in an Arabic interface, an Arabic label in a French document) is handled by an explicit bidirectional rule, with no character reversal or truncation.

### UX-ZS-015: Dual-script names everywhere

> **Priority:** Must
> **Version:** MVP
> **See:** `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS-016); `spec/domain-model.md`

REQUIREMENT: Every person's first and last name MUST exist in dual script (Latin and Arabic). The interface MUST display the script matching the active language and, if it's missing, the other script rather than inventing one; official documents (report cards, transcripts, certificates, attestations, exit file) and Massar exports MUST carry both scripts. Lists sorted by name MUST stay stable regardless of the interface language.

Data entry offers both fields side by side with a non-blocking completeness check; no automatic transliteration is produced or shown as though it were official.

### UX-ZS-016: Careful Arabic typography

> **Priority:** Must
> **Version:** MVP
> **See:** `spec/cross-cutting/03-non-functional-requirements.md` (documents domain)

REQUIREMENT: Arabic script MUST have its own typeface, distinct from the Latin one, chosen for on-screen legibility. Western digits 0-9 MUST be used in both French and Arabic (common Moroccan usage); no Arabic-Indic numbering by default. Bilingual PDFs MUST use correct Arabic fonts (A4 and A5 formats); Arabic rendering MUST be tested both on screen and in print.

Minimum sizes larger than Latin text, increased line spacing, never hyphenating or crushing an Arabic word, controlled truncation of long labels.

### UX-ZS-014: Languages: French and Arabic at MVP, English in V2

> **Priority:** Must (FR/AR); Should (EN)
> **Version:** MVP (FR/AR); V2 (EN)
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md); `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS-015, NFR-ZS-017)

REQUIREMENT: French and Arabic MUST be available across the entire interface from MVP onward. English MUST be added in V2 for international sections, with no rework of shipped journeys. No user MUST ever be blocked by interface content in a language they did not choose.

User-generated content (announcements, messages, remarks) is written in the language chosen by its author and shown as-is; school-configurable content exists in FR and AR.

### 4.C Context-based navigation

### UX-ZS-004: Profile × school context switcher

> **Priority:** Must
> **Version:** MVP
> **Invariant:** [INV-ZS-053](../invariants.md#inv-zs-053), [INV-ZS-069](../invariants.md#inv-zs-069), [INV-ZS-071](../invariants.md#inv-zs-071), [INV-ZS-088](../invariants.md#inv-zs-088), [INV-ZS-030](../invariants.md#inv-zs-030), [INV-ZS-040](../invariants.md#inv-zs-040)
> **Acceptance:** [`@REQ-ZS-502`](../../features/cross-cutting/ux/req-zs-502-context-switcher.feature)

REQUIREMENT: A single account MAY hold several profiles (parent, teacher, staff, student) and several simultaneous affiliations; the interface MUST always offer a context switcher whose every entry is a (profile, school) pair, along with the school year and the roles held. The active context MUST be visible on every screen (a persistent banner); switching MUST be possible from any screen, with no loss of in-progress entry after confirmation. A removed context MUST disappear immediately with an explicit message if it was active. Data from two contexts MUST never be mixed on the same screen.

Traceability: [URS-ZS-026](../urs.md); SCR-ZS-172.

### UX-ZS-017: Lightweight navigation and useful search

> **Priority:** Should
> **Version:** MVP

REQUIREMENT: Navigation MUST fit in two levels maximum from the context's home screen; frequent actions (attendance, justification, payment collection, announcement) MUST be one gesture away from the relevant role's home screen. A name search MUST work within the active context's scope and respect dual script ([INV-ZS-091](../invariants.md#inv-zs-091): search reveals only what the user is already entitled to see). No destructive action MUST be accessible with fewer than two explicit confirmations.

Traceability: [URS-ZS-017](../urs.md); UX-ZS-003, UX-ZS-015.

### 4.D Notifications

### UX-ZS-005: Notification preferences and channel consent

> **Priority:** Must
> **Version:** MVP (in-app, SMS, WhatsApp utility for attendance — opt-in, preferences); V1 (push, generalized WhatsApp)
> **See:** [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md); `spec/cross-cutting/06-external-integrations.md` (INT-ZS-025)
> **Acceptance:** [`@REQ-ZS-503`](../../features/cross-cutting/ux/req-zs-503-notification-preferences-consent.feature)

REQUIREMENT: Every user MUST have a notification center (unread, viewable history) and preferences by category, by channel, and, for parents, by child. No setting MUST ever reduce another guardian's access rights or reception ([INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065): restriction only on a court decision on record).

The channel hierarchy: push notification first (V1), WhatsApp "utility" for consenting parents (explicit, revocable opt-in, opposition handled), SMS via the Moroccan aggregator as a fallback, in-app notification always available. Founder arbitration (09/09/2026, historical alias D1): at MVP, in-app + SMS + WhatsApp utility channels limited to attendance notifications; generalized WhatsApp and push arrive in V1. Each guardian manages their own reception settings.

### UX-ZS-007: Anti-spam: priority, digests, quiet hours, visible costs

> **Priority:** Must
> **Version:** MVP (priority, deduplication, digest); V1 (configurable quiet window, WhatsApp costs)
> **See:** [ADR-ZS-023](../decisions/023-notification-channel-priority.md), [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)

REQUIREMENT: Every notification MUST carry a priority level (critical, important, informational). Informational categories MUST allow an optional daily digest and a default nighttime quiet window in the school's local time, which MUST never apply to critical messages. Multi-channel sends MUST be deduplicated: one piece of information = one primary delivery channel with a fallback.

On the school side, message costs (SMS/WhatsApp packs) and consumption counters are visible before a bulk send, with a threshold alert.

### 4.E Forms and data entry

### UX-ZS-009: Short forms, phone-first, OTP authentication

> **Priority:** Must
> **Version:** MVP
> **Invariant:** [INV-ZS-044](../invariants.md#inv-zs-044), [INV-ZS-003](../invariants.md#inv-zs-003)
> **See:** [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md), [ADR-ZS-048](../decisions/048-login-identifier-distinct-from-contact.md); `spec/cross-cutting/02-security-privacy.md` (SEC-ZS-002, SEC-ZS-004); `spec/behaviors/01-administration-onboarding-subscription.md` (BEH-ZS-020)
> **Acceptance:** [`@REQ-ZS-504`](../../features/cross-cutting/ux/req-zs-504-phone-primary-contact-identifier.feature)

REQUIREMENT: The mobile phone number MUST be the first contact field, mandatory for every guardian and validated in international E.164 format; email MUST be optional and never required from a parent, student, or teacher. The login identifier MUST be distinct from the contact identifier: a minor student without their own mobile receives a generated, readable identifier, activated by a legal guardian with a one-time code sent to the guardian's number. Account creation and access recovery MUST work without email.

Every form asks for the minimum fields, in order of importance, with inline validation and resume of an interrupted entry. Fields with a controlled set of values offer lists rather than free text.

### 4.F Accessibility

### UX-ZS-012: Accessibility: contrast, sizes, keyboard, screen readers

> **Priority:** Must
> **Version:** MVP (WCAG 2.1 AA target on the main journeys); V1 (formal compliance audit, NFR-ZS-050)
> **See:** `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS-050); [ADR-ZS-066](../decisions/066-compliance-and-security-before-pilot-batch.md)

REQUIREMENT: The interface MUST target WCAG 2.1 level AA compliance on shipped journeys: minimum 4.5:1 contrast for body text and 3:1 for large text and interface elements; full keyboard navigation on the web app; screen-reader compatibility on the main journeys. Information MUST never be conveyed by color alone.

Traceability: UX-ZS-013, UX-ZS-016.

### 4.G Platforms and perceived performance

### UX-ZS-010: Responsive web and PWA at MVP; native apps in V2

> **Priority:** Must
> **Version:** MVP (responsive web, PWA); V2 (native Android and iOS)
> **See:** `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS-021, NFR-ZS-022)

REQUIREMENT: The MVP platform MUST be the responsive web app, installable as a PWA (home-screen icon, standalone mode, session resume), usable on older hardware. Native Android and iOS apps arrive in V2 with feature parity, Android first (UX-ZS-002). No everyday journey MUST ever be reserved for desktop.

The historical baseline's own divergence between its V1 list (native apps) and its NFR section (V2) is resolved in favor of V2 and logged in `spec/open-questions.md` (OQ-ZS-311).

### UX-ZS-011: Perceived performance and low-bandwidth mode

> **Priority:** Must
> **Version:** MVP
> **See:** `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS-003, NFR-ZS-004)

REQUIREMENT: Every screen MUST show what is loading: layout-faithful loading skeletons, explicit empty states, progress for long operations. Usual pages MUST display in under 2 seconds on 4G. A data-saving mode MUST limit non-essential media on a degraded connection.

Performance is tested on degraded 4G and on the registrar's typical older hardware; rural households' internet access remains lower than urban (78.4% versus 93.6%, ANRT 2024-2025), which justifies the SMS fallback for alerts (UX-ZS-005) and tolerance for outages (UX-ZS-006).

### 4.H Accounts and shared devices

### UX-ZS-001: Per-person language and account selection on a shared device

> **Priority:** Must
> **Version:** MVP
> **Invariant:** [INV-ZS-066](../invariants.md#inv-zs-066), [INV-ZS-063](../invariants.md#inv-zs-063), [INV-ZS-030](../invariants.md#inv-zs-030), [INV-ZS-003](../invariants.md#inv-zs-003)
> **See:** [ADR-ZS-021](../decisions/021-bilingual-fr-ar-interface-from-mvp.md), [ADR-ZS-022](../decisions/022-mobile-number-as-primary-login-identifier.md); `spec/behaviors/08-communication-notifications.md` (BEH-ZS-185)
> **Acceptance:** [`@REQ-ZS-505`](../../features/cross-cutting/ux/req-zs-505-shared-device-account-selection.feature)

REQUIREMENT: Interface language MUST be a personal preference, carried by the person's account rather than the device; it MUST also govern the language of SMS, WhatsApp messages, and notifications sent to them. On a shared device, an account selection screen MUST list the accounts used on the device, open a distinct session for each, require the chosen account's secret, and return to selection at the end of use or after inactivity; no data from one account MUST be visible from another's session.

Adding an account to the device goes through the login identifier (UX-ZS-009). Removing an account from the device clears its local data, including offline entries already synced.

Traceability: SCR-ZS-172.

## 5. Morocco specifics

### 5.1 Bilingual composition and RTL beyond mirroring

ZSchool's bilingualism is not an overlaid translation but a composition constraint: every screen is specified for both its languages (zones, alignment, label lengths, states), and every official document is bilingual with a header, authorization number, stamp, and signature. Composition rules: the title and primary action are translated in full, never juxtaposed in two languages within the same label; values entered by users stay in their original language; dates, amounts, references, and numbers follow a single format regardless of language, in 0-9 digits.

### 5.2 Dual script, sorting, and search

Dual script (UX-ZS-015) requires visible choices: lists sorted by the interface language's script, language-agnostic search (both scripts are queried), records that flag a missing script without blocking (completeness driven by `spec/behaviors/01-administration-onboarding-subscription.md`).

### 5.3 Terminology and figures

Screen terminology follows `spec/glossary.md`: _student_ (_تلميذ(ة)_), _teacher_ (_أستاذ(ة)_), _class_ (_القسم_), _report card_ (_بيان النقط_), _timetable_ (_استعمال الزمن_), _absence_ (_غياب_), _tardiness_ (_تأخر_), _justification_ (_مبرر الغياب_), _arrears_ (_متأخرات الأداء_), _receipt_ (_وصل الأداء_), _Massar code_ (_رمز مسار_). No floating synonyms: one concept = one term = one FR and AR label.

### 5.4 Dates, calendars, timezone

Timestamps are shown in Moroccan time, permanently UTC+0 since 09/20/2026 (Decree No. 2.26.530): the interface exposes no timezone setting and the UX never has to handle a clock change. Moveable religious holidays are shown with both their Hijri and Gregorian dates. Ramadan's lighter hours remain a pedagogical need handled as a timetable variant (`spec/behaviors/03-academic-structure-timetables.md`, V1), not a timezone issue.

### 5.5 Real channels: WhatsApp, SMS, email

WhatsApp is used by 98.6% of social-media users in Morocco and SMS remains the universal channel; email is rarely checked — a secondary, non-critical channel. UX consequences: phone is the contact identifier (UX-ZS-009), the channel pairing follows [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md) (UX-ZS-005), WhatsApp consent is an explicit screen (SCR-ZS-173), and email is never a mandatory step in any journey.

### 5.6 Reliability as a product argument

The dominant complaints about market parent apps (connection failures, blank screens, outages) make perceived reliability (UX-ZS-006, UX-ZS-011) a deliberate differentiator: offline states are visible, local data is never lost, recovery is automatic. This positioning is measured by adoption and reliability indicators (`spec/metrics.md`, KPI-ZS-016, KPI-ZS-024).

## 6. Data and events drawn on

This chapter defines no entity; it draws on `spec/domain-model.md`:

| Model element                                                                       | UX use                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User` (account, login identifier distinct from contacts, language, passwords, MFA) | OTP login or generated identifier, per-person language, account selection on a shared device, context switcher (UX-ZS-004, UX-ZS-009, UX-ZS-001; [INV-ZS-030](../invariants.md#inv-zs-030), [INV-ZS-003](../invariants.md#inv-zs-003)) |
| `Person` (bilingual civil status)                                                   | Dual script displayed and searched (UX-ZS-015)                                                                                                                                                                                         |
| `ParentProfile` (communication preferences)                                         | Notification settings by category, channel, child (UX-ZS-005, SCR-ZS-173)                                                                                                                                                              |
| `School` (settings: languages, channels)                                            | Content customizations, never architecture (UX-ZS-003; [INV-ZS-074](../invariants.md#inv-zs-074))                                                                                                                                      |
| `Notification`, `DeliveryLog` (channel, status, cost)                               | Notification center, delivery statuses shown, visible costs (UX-ZS-005, UX-ZS-007)                                                                                                                                                     |
| `ConsentGrant` (scope, duration, revocation)                                        | Consent screen, immediate revocation (SCR-ZS-173; [INV-ZS-012](../invariants.md#inv-zs-012))                                                                                                                                           |
| `AuditLog`                                                                          | Traces visible on the school side for sensitive actions ([INV-ZS-090](../invariants.md#inv-zs-090); out of scope for parent-facing display)                                                                                            |

Invariants drawn on in this chapter: [INV-ZS-030](../invariants.md#inv-zs-030) (one account, several profiles), [INV-ZS-012](../invariants.md#inv-zs-012) (bounded, revocable consents), [INV-ZS-040](../invariants.md#inv-zs-040) (contextual permissions), [INV-ZS-042](../invariants.md#inv-zs-042) (adult student, MVP), [INV-ZS-044](../invariants.md#inv-zs-044) (phone as primary contact identifier, email never required), [INV-ZS-016](../invariants.md#inv-zs-016) (no document blocked for arrears), [INV-ZS-003](../invariants.md#inv-zs-003) (login identifier distinct from contact). Notification events: the domain model's event log (`spec/domain-model.md` §7, notably `AbsenceRecorded` and the publication, payment, and consent events) feeds the notification center and priority rules (UX-ZS-007).

## 7. Screens

`SCR-ZS-171..179` identifiers are reserved for this file; module-specific screens carry their own `SCR-ZS-NNN` identifiers within their owning `spec/behaviors/*.md` chapter. Text descriptions only; for each screen: purpose, version, zones and elements, states, key labels, cross-references.

### SCR-ZS-171 — Parent home: consolidated multi-child / multi-school card

| Attribute          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose            | Every guardian's account entry view: see at a glance the state of each child at each school and act in one gesture.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Version            | MVP                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Zones and elements | Context banner (active profile and school, access to the switcher SCR-ZS-172, notifications button with an unread counter, settings button). "Today" zone: active alerts per child sorted by priority. Consolidated card per child: avatar, name in the interface's script, school and class, today's attendance state, next payment due with a short balance, latest publications. Quick actions: justify an absence with an attachment, open payment (SCR-ZS-179), open a thread (SCR-ZS-178), request a document (V1). Fixed bottom navigation bar: Home, Messages, Notifications, Settings. |
| States             | Loading (skeletons); empty (no linked child: prompt to claim a profile via an invitation code, JMP-ZS-004); offline (persistent banner + last-refresh date); isolated partial error per child.                                                                                                                                                                                                                                                                                                                                                                                                  |
| Key labels         | Home (_الرئيسية_); Justify (_تبرير_); Pay (_أداء_); Messages (_الرسائل_); Notifications (_الإشعارات_); Settings (_الإعدادات_); Absence (_غياب_); Due date (_أجلة الأداء_)                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Cross-references   | Finance: `spec/behaviors/07-finance-billing-collections.md`; communication: `spec/behaviors/08-communication-notifications.md`; documents: `spec/behaviors/06-documents-certificates.md`; journeys `spec/journeys/05-multi-school-parent.md` and `spec/journeys/06-custodial-mother-and-guardian.md`; [URS-ZS-034](../urs.md), [URS-ZS-035](../urs.md), [URS-ZS-037](../urs.md), [URS-ZS-048](../urs.md)                                                                                                                                                                                        |

### SCR-ZS-177 — Student home

| Attribute          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose            | Give the student the essentials of their day and their results, on the family phone or their own.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Version            | MVP (access per [INV-ZS-051](../invariants.md#inv-zs-051), published grades and report cards); homework and full timetable variants in V1                                                                                                                                                                                                                                                                                                                                                                                          |
| Zones and elements | Context banner (student profile, school, class). "Today" block: today's timetable. "Latest publications" block: published, immutable grades and report cards, homework to do (V1). Class announcements block. Self-service document access (V1); a "my rights" entry for the adult student ([INV-ZS-052](../invariants.md#inv-zs-052), [INV-ZS-042](../invariants.md#inv-zs-042), MVP): account-ownership notice, restriction of parental access, with a visible audit trail. Same fixed navigation bar as the parent (UX-ZS-003). |
| States             | Empty (no published grade); access not activated ([INV-ZS-051](../invariants.md#inv-zs-051): an information screen, activation request routed to the guardian, SCR-ZS-178); offline; adult (rights block visible) / minor (block absent).                                                                                                                                                                                                                                                                                          |
| Key labels         | Today (_اليوم_); Timetable (_استعمال الزمن_); Grades (_النقط_); Report card (_بيان النقط_); Homework (_واجبات_)                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Cross-references   | Assessments: `spec/behaviors/05-assessments-grades-report-cards.md`; academics: `spec/behaviors/03-academic-structure-timetables.md`; journey `spec/journeys/07-students-minor-and-adult.md`; [URS-ZS-051](../urs.md), [URS-ZS-052](../urs.md), [URS-ZS-053](../urs.md), [URS-ZS-055](../urs.md)                                                                                                                                                                                                                                   |

### SCR-ZS-174 — Teacher home

| Attribute          | Value                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose            | Fit the teacher's day on mobile: their courses, their attendance-taking, their pending entries, their exchanges with parents.                                                                                                                                                                                                                                                       |
| Version            | MVP                                                                                                                                                                                                                                                                                                                                                                                 |
| Zones and elements | Context banner (teacher profile × school — the part-time teacher's switch point, UX-ZS-004). "My courses today" list in chronological order, an Attendance button per session (opens SCR-ZS-175). "Pending entries" badge. "Pending attendance" badge for the day. Lesson-log access (V1). Announcements and open parent threads (SCR-ZS-178). Compliance reminders before closing. |
| States             | No class today; offline (attendance always functional, UX-ZS-006); affiliation closed ([INV-ZS-071](../invariants.md#inv-zs-071), explicit message); multi-school part-time teacher (two contexts in the switcher).                                                                                                                                                                 |
| Key labels         | My courses today (_حصص اليوم_); Attendance (_تمرير الحضور_); Grades to enter (_نقط في انتظار التسجيل_); Lesson log (_دفتر النصوص_)                                                                                                                                                                                                                                                  |
| Cross-references   | Attendance: `spec/behaviors/04-attendance-student-life-discipline.md`; assessments: `spec/behaviors/05-assessments-grades-report-cards.md`; communication: `spec/behaviors/08-communication-notifications.md`; journey `spec/journeys/04-part-time-teacher.md`; [URS-ZS-026](../urs.md), [URS-ZS-027](../urs.md), [URS-ZS-028](../urs.md), [URS-ZS-033](../urs.md)                  |

### SCR-ZS-175 — Mobile attendance-taking

| Attribute          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose            | Take a class's attendance in a few gestures, even with no network, and trigger absence notifications with an explicit confirmation.                                                                                                                                                                                                                                                                                                         |
| Version            | MVP (JMP-ZS-005)                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Zones and elements | Session header: class, subject, slot, room, local date and time (permanent UTC+0). Live counters: present, absent, tardy. Student list with per-student actions: Absent, Tardy, an optional short comment. A "mark all present" action. A "Confirm attendance" button within thumb reach — confirmation triggers guardian notifications under a 5-minute delay. Permanent status indicator: local edit / send pending / synced (UX-ZS-006). |
| States             | Local edit; offline (persistent banner, entry continues without blocking); syncing; confirmed and synced; sync conflict (flagged to student life, UX-ZS-006); send failure (one-gesture retry, no loss).                                                                                                                                                                                                                                    |
| Key labels         | Present (_حاضر_); Absent (_غياب_); Tardy (_تأخر_); All present (_جميعهم حاضرون_); Confirm attendance (_تصديق التمرير_); Send pending (_في انتظار المزامنة_)                                                                                                                                                                                                                                                                                 |
| Cross-references   | Attendance module: `spec/behaviors/04-attendance-student-life-discipline.md`; `spec/cross-cutting/03-non-functional-requirements.md` (NFR-ZS-023, the OFF domain); [URS-ZS-027](../urs.md), [URS-ZS-018](../urs.md), [URS-ZS-019](../urs.md)                                                                                                                                                                                                |

### SCR-ZS-176 — Principal's-office home

| Attribute          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose            | Give the principal and academic direction the school's state on a single screen, and direct access to the day's decisions.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Version            | MVP; consolidated organization view in V1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Zones and elements | Context banner (active school; switch to the consolidated organization view in V1, aggregates with no data merging, [INV-ZS-073](../invariants.md#inv-zs-073)). Today's indicator cards: active headcount, today's absences, tardiness, open incidents (V1). Financial card: month-to-date collections, arrears by level, scheduled reminders. "Waiting on you" queue: periods to close, report cards to publish, document requests, teacher authorizations (V1). Access to full reporting (`spec/behaviors/11-dashboards-reporting.md`) and to drafting announcements. |
| States             | New school (empty state with access to the setup wizard, JMP-ZS-003); start-of-year period; offline (indicators dated to the last load); organization view (V1).                                                                                                                                                                                                                                                                                                                                                                                                        |
| Key labels         | Headcount (_المؤدون_); Today's absences (_الغائبون اليوم_); Arrears (_متأخرات الأداء_); To close (_في انتظار الإقفال_); Announcements (_إعلانات_)                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Cross-references   | Reporting: `spec/behaviors/11-dashboards-reporting.md`; finance: `spec/behaviors/07-finance-billing-collections.md`; student life: `spec/behaviors/04-attendance-student-life-discipline.md`; journey `spec/journeys/01-school-group-director.md`; [URS-ZS-001](../urs.md), [URS-ZS-002](../urs.md)                                                                                                                                                                                                                                                                     |

### SCR-ZS-178 — Communication thread

| Attribute          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Purpose            | Replace informal messaging groups with a traceable, legible channel: targeted announcements and framed conversations, with delivery tracking and a visible moderation framework.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Version            | MVP (announcements, messages, moderated in-app threads by default, in-app and SMS notifications); push and generalized WhatsApp in V1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Zones and elements | Two tabs: Announcements and Conversations. Targeted-announcement list filtered by child and school, with publication status and staff-side read receipts. List of open threads with unread counts. Thread screen: chronological history, replies, lightweight attachments, a visible delivery status (fed by `DeliveryLog`), and a permanent note that the principal's office can view the thread — a disclosure owed to users ([ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md)). The parent replies within a thread opened by the teacher or the school by default; parental initiative is possible if the school allows it. |
| States             | No open thread; offline (draft kept locally, sent on resume); sending / delivered / read; urgent announcement (critical priority, excluded from the digest).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Key labels         | Announcements (_إعلانات_); Conversations (_محادثات_); Reply (_رد_); Sent (_أرسل_); Delivered (_تم التوصيل_); Read (_قُرئ_)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Cross-references   | Communication module: `spec/behaviors/08-communication-notifications.md`; student-life notices: `spec/behaviors/04-attendance-student-life-discipline.md` (V1); JMP-ZS-011; [ADR-ZS-034](../decisions/034-moderated-parent-teacher-communication.md); [URS-ZS-041](../urs.md), [URS-ZS-033](../urs.md)                                                                                                                                                                                                                                                                                                                                                 |

### SCR-ZS-179 — Payment (Fatourati reference)

| Attribute          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Purpose            | Let the financial guardian understand what they owe, pay via the Fatourati rail directly, and prove what they've paid — without ever presenting arrears as an obstacle to official documents ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [INV-ZS-016](../invariants.md#inv-zs-016)).                                                                                                                                                                                                                                                                                |
| Version            | Viewing the payment plan, balance, and receipts at MVP; online payment in V1 ([ADR-ZS-031](../decisions/031-online-payment-rails.md))                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Zones and elements | Child selector (multi-child accounts). Account summary: balance, next payment due, total paid year-to-date. Payment plan by period: paid / upcoming / overdue status, with dates. For each payable installment (V1): a payment reference in the school's Fatourati creditor format, a payment QR code, a simple step-by-step guide to channels, an explicit "pending reconciliation" status, a "I paid / there's an issue" help button opening a thread (SCR-ZS-178). A downloadable, archived receipt for every payment. An arrears alert written as information, never as a block or a threat. |
| States             | No debt; an installment due at MVP (no online payment: front-desk payment terms displayed); overdue installment (information, statement, contact — no punitive language); payment pending reconciliation; payment not found (help with a claim); offline (viewing the last known state, the payment reference always visible).                                                                                                                                                                                                                                                                   |
| Key labels         | Payment (_الدفع_); Payment plan (_جدول الأداء_); Reference (_المرجع_); Receipt (_وصل الأداء_); Pending confirmation (_في انتظار التأكيد_); Arrears (_متأخرات الأداء_)                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Cross-references   | Finance module: `spec/behaviors/07-finance-billing-collections.md`; integration: `spec/cross-cutting/06-external-integrations.md` (INT-FAT); JMP-ZS-007, JMP-ZS-008; [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [ADR-ZS-031](../decisions/031-online-payment-rails.md); [URS-ZS-036](../urs.md), [URS-ZS-040](../urs.md)                                                                                                                                                                                                                                            |

### SCR-ZS-173 — Settings: notifications and consents

| Attribute          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose            | Give every user control over what they receive, through which channel, and what they've consented to — within the limits of other guardians' rights ([INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065)).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Version            | MVP (per-person language, in-app and SMS channels, WhatsApp utility opt-in for attendance with a transfer notice, preferences, digests, the adult student's "my rights" block); V1 (push, generalized WhatsApp, richer sharing consents)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Zones and elements | Interface language (French, Arabic; English in V2) with an instant switch (UX-ZS-013, UX-ZS-014). Notifications: a matrix by category × channel × child for multi-child accounts; an optional daily digest; a quiet window (V1). Consents: a list of active consents with scope, duration, and one-gesture revocation (`ConsentGrant`, [INV-ZS-012](../invariants.md#inv-zs-012)). My qualities and rights: per school, the qualities held (legal guardian, custodian, financial guardian, emergency contact) and their associated rights ([INV-ZS-066](../invariants.md#inv-zs-066)). My data and rights: access, rectification, objection, export of published documents (formalized in V1, `spec/cross-cutting/07-legal-compliance-data-protection.md`). |
| States             | Consent required (WhatsApp disabled with an explanation before activation); revocation done; access restriction observed (shown read-only, never self-triggered by another parent); adult student (parental-access management block, [INV-ZS-052](../invariants.md#inv-zs-052)/[INV-ZS-042](../invariants.md#inv-zs-042), MVP); "STOP" opposition received: shown with its scope.                                                                                                                                                                                                                                                                                                                                                                           |
| Key labels         | Settings (_الإعدادات_); Notifications (_الإشعارات_); Consents (_الموافقات_); Revoke (_إلغاء الموافقة_); My rights (_حقوقي_); Language (_اللغة_)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Cross-references   | Communication module: `spec/behaviors/08-communication-notifications.md`; compliance: `spec/cross-cutting/07-legal-compliance-data-protection.md`; administration: `spec/behaviors/01-administration-onboarding-subscription.md`; UX-ZS-005, UX-ZS-007; [URS-ZS-045](../urs.md), [URS-ZS-048](../urs.md), [URS-ZS-055](../urs.md)                                                                                                                                                                                                                                                                                                                                                                                                                           |

### SCR-ZS-172 — Context switcher (profile × school)

| Attribute          | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose            | Organize multi-membership ([INV-ZS-053](../invariants.md#inv-zs-053)): show where you are, allow switching context with no error and no data mixing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Version            | MVP                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Zones and elements | Opened from the context banner present on every screen (UX-ZS-004). A panel listing contexts grouped by profile: parent, teacher, staff, student; each row carries the profile, the school, the school year, and the roles held ([INV-ZS-069](../invariants.md#inv-zs-069): simultaneous affiliations visible). The active context is marked. Useful per-context counters. Search by school if the list is long. Exit: an immediate switch or a confirmation if an entry is in progress. Ahead of the context switcher, on a shared device, the account selection screen (UX-ZS-001) picks the person before the context: a list of accounts registered on the device, adding an account via a login identifier, removing an account with local data cleared. |
| States             | A single context (panel reduced to information); a removed context ([INV-ZS-071](../invariants.md#inv-zs-071): immediate disappearance); a switch in progress (no residual data from the old context); a student profile with no activated access ([INV-ZS-051](../invariants.md#inv-zs-051): profile listed, context not openable).                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Key labels         | Context (_السياق_); Switch context (_تبديل السياق_); School year (_السنة الدراسية_); Active (_نشط_)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Cross-references   | Permissions: `spec/cross-cutting/01-permissions.md`; administration: `spec/behaviors/01-administration-onboarding-subscription.md`; career: `spec/behaviors/10-teacher-career-network.md`; UX-ZS-003, UX-ZS-004, UX-ZS-001; [INV-ZS-030](../invariants.md#inv-zs-030), [INV-ZS-040](../invariants.md#inv-zs-040), [INV-ZS-003](../invariants.md#inv-zs-003)                                                                                                                                                                                                                                                                                                                                                                                                   |

## 8. Integrations

This chapter specifies no integration; it consumes their visible effects. Specifications are carried by `spec/cross-cutting/06-external-integrations.md`: INT-ZS (SMS domain: Moroccan aggregator, alphanumeric sender ID), INT-ZS-025 (WhatsApp Business Platform, Meta-approved utility templates — opt-in and opposition are UX screens, UX-ZS-005 and SCR-ZS-173), INT-ZS (FAT domain: Fatourati, generating references and QR codes shown in SCR-ZS-179, daily reconciliation status), INT-ZS (EML domain: secondary channel, never blocking). Send costs flow up via `DeliveryLog` and feed the counters visible to the school (UX-ZS-007).

## 9. Specific non-functional requirements

The measurable standard is carried by `spec/cross-cutting/03-non-functional-requirements.md`; this chapter sets its UX expression and introduces no competing threshold:

| NFR domain                      | Relationship to this chapter                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| I18N (NFR-ZS-015..020)          | UX-ZS-013, UX-ZS-015, UX-ZS-016, UX-ZS-014, UX-ZS-001 (per-person language, NFR-ZS-015); §5.4 (permanent UTC+0 timezone, NFR-ZS-018) |
| MOB (NFR-ZS-021, 022, 023, 026) | UX-ZS-002, UX-ZS-010; browser/OS floor (NFR-ZS-026); the < 5-minute absence delay shown in SCR-ZS-175; bulk sends never blocking     |
| RES-04 (NFR-ZS-050)             | UX-ZS-012 (WCAG 2.1 AA targeted at MVP, audit V1)                                                                                    |
| PERF (NFR-ZS-003, 004)          | UX-ZS-011 (skeletons, low-bandwidth mode, degraded-4G test plan)                                                                     |
| OFF                             | UX-ZS-006, SCR-ZS-175 (offline states and sync)                                                                                      |
| DISP (NFR-ZS-008, 013)          | Bilingual maintenance and incident messages, windows outside critical periods                                                        |
| DOC                             | UX-ZS-016 (Arabic fonts in bilingual PDFs)                                                                                           |
| OBS                             | Delivery statuses and consumption counters shown (UX-ZS-007), measurable via KPI (`spec/metrics.md`)                                 |

## 10. Success metrics

Indicators are carried by `spec/metrics.md`. This chapter contributes directly to: parent adoption (KPI-ZS-016), teacher adoption (KPI-ZS-015), absence-notification delay (KPI-ZS-020), notification channels and fallback (KPI-ZS-021, KPI-ZS-022), perceived reliability and connection incidents (KPI-ZS-024, KPI-ZS-002), satisfaction and differentiation from existing apps (KPI-ZS-036). UX drives these measures: every UX requirement in this chapter targets a journey that feeds at least one KPI.

## 11. Open questions

Open questions for this chapter are consolidated in `spec/open-questions.md` (OQ-ZS-311 through OQ-ZS-315, built in a later phase) — not tracked locally in this file.

## Traceability

Full cross-reference coverage for this chapter is consolidated in `spec/traceability.md` (built in a later phase).
