# ZSchool PRD — Cross-Cutting UX/UI: Mobile-First, FR/AR Bilingualism (RTL), Shared Screens

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review (arbitrations `prd/cross-cutting/42-review-arbitrations.md`) |
| Source | `PROJECT.md` §2.8, §2.9, §2.10, §7.8, §7.11, §9, §10, §12, §17; DEC-10, DEC-11, DEC-12, DEC-24, DEC-31, DEC-34, DEC-36; G-10, G-17, G-27; H-11, H-20; RG-03, RG-13, RG-14, RG-19, RG-21, RG-36; `prd/research/00-baseline-corrections.md` (#1, #6, #10); `prd/research/01-market-competition.md` §4; `prd/research/03-payments-communications.md`; `prd/research/05-infrastructure-usage.md` §2 |
| Related files | `prd/00-conventions.md`; `prd/02-actors-personas.md`; `prd/03-domain-data-model.md`; `prd/journeys/00-journey-map.md`; `prd/journeys/01-school-group-director.md` to `prd/journeys/07-students-minor-and-adult.md` (per-persona journeys); `prd/modules/12-academic-structure-timetables.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/20-dashboards-reporting.md` ("Key screens" sections); `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/31-security-privacy.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/36-legal-compliance-data-protection.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` (ARB-07, ARB-10, ARB-21, ARB-25p) |

---

## 1. Objective and scope

This chapter sets ZSchool's **cross-cutting user-experience standard**: principles, the FR/AR bilingual foundation with full RTL, context-based navigation rules, offline states, notification rules, form rules, accessibility, and the **screens shared across modules** (`ECR-UX-NN`). Every module chapter (`prd/modules/10-administration-onboarding-subscription.md` to `prd/modules/23-health-sensitive-data.md`) references this standard in its "Key screens" section without redefining it; this chapter does not duplicate any module-specific screen.

**In scope**:

- guiding UX principles (mobile-first and Android-first, reliability, simplicity, cross-school consistency);
- a bilingual FR/AR design system with full RTL, dual-script names, Arabic typography (G-10);
- the profile × school context switcher (RG-03);
- visible offline states and resuming after an outage;
- notifications: preferences, consents, anti-spam, digests (DEC-12, DEC-36, G-17);
- short forms, phone as the primary contact identifier (DEC-11), a distinct login identifier for people without their own mobile (ARB-07);
- per-person language and account selection on a shared device (UX-17);
- accessibility (contrast, sizes, keyboard, screen readers on the main journeys, `PROJECT.md` §10);
- platforms: responsive web and PWA from MVP, native apps in V2 (see OQ-01); English in V2;
- cross-cutting screens `ECR-UX-01` to `ECR-UX-09`.

**Out of scope** (covered elsewhere, without duplication): each module's specific screens (`ECR-<MOD>-NN` in the `prd/modules/10-administration-onboarding-subscription.md` to `prd/modules/23-health-sensitive-data.md` chapters), measurable non-functional thresholds (`prd/cross-cutting/32-non-functional-requirements.md`), permission rules (`prd/cross-cutting/30-roles-permissions-matrix.md`), security (`prd/cross-cutting/31-security-privacy.md`), external integrations (`prd/cross-cutting/35-external-integrations.md`), legal compliance and consents (`prd/cross-cutting/36-legal-compliance-data-protection.md`), journey titles (`prd/journeys/00-journey-map.md` to `prd/journeys/07-students-minor-and-adult.md`), the glossary (`prd/cross-cutting/41-glossary.md`). No graphic mockups and no code: screens are described in text (zones, elements, states, FR/AR behavior), per `prd/00-conventions.md` §1.

## 2. Users and use cases

Cross-cutting UX is sized by the baseline's usage realities (`PROJECT.md` §2.10) and by the personas' needs (`prd/02-actors-personas.md`):

| Persona | Usage realities accounted for | UX requirements drawn on |
|---|---|---|
| Ahmed, multi-school parent (`PAR`) | A single account for three children in two schools; wants to see everything "from WhatsApp and one app"; Android smartphone, WhatsApp dominant | UX-01, UX-04, UX-09, UX-11; ECR-UX-01, ECR-UX-09 |
| Naïma, custodial mother (`GAR`) | Her own account, never shared; wants to see her qualities and rights per school; receives notifications in parallel with the father | UX-09, UX-11; ECR-UX-08 |
| Khadija, part-time teacher (`ENS`) | Two schools in the same year; attendance-taking and grade entry on her phone, in the evening, on an unstable connection | UX-01, UX-02, UX-09; ECR-UX-03, ECR-UX-04 |
| Rachid, head supervisor (`SUR`) | Mobile in hand at all times in the hallways; notifying absent students' parents before 10 AM | UX-01, UX-02, UX-12; ECR-UX-04 |
| Fatima, secretary-cashier (`SEC`) | Older PC and a phone; unstable connection; repetitive front-desk forms | UX-03, UX-13, UX-15, UX-16 |
| Si Abdellah, school-group director (`DIR`) | Desk daily plus mobile on the road; multi-site consolidated views | UX-09, UX-16; ECR-UX-05 |
| Youssef and Salma, students (`ELE`) | Shared family phone with the father (generated login identifier, account selection on the device, own language); personal access from the level set (RG-01); adult student in control of her rights (RG-02) | UX-09, UX-13, UX-14, UX-17; ECR-UX-02, ECR-UX-08, ECR-UX-09 |

Cross-cutting use cases covered by this chapter: switching context (profile × school) without getting lost; seeing at a glance what needs action; being notified reliably without being overwhelmed; completing a critical action (attendance, justification, payment, authorization signature) despite an unstable connection; using the interface in French or Arabic with the same level of quality.

## 3. Key journeys

The end-to-end journey map is authoritative (`prd/journeys/00-journey-map.md`); this chapter duplicates none of its steps. Cross-reference table of journeys → screens and UX requirements drawn on:

| Journey | Screens and UX requirements drawn on |
|---|---|
| PC-01 (admission, enrollment) | ECR-UX-09 (context), UX-03, UX-13; forms from module `prd/modules/11-admissions-enrollment-reenrollment.md` |
| PC-02 (re-enrollment, rollover) | UX-03, UX-12; screens from module `prd/modules/11-admissions-enrollment-reenrollment.md` |
| PC-03 (school onboarding) | UX-05, UX-08; screens from module `prd/modules/10-administration-onboarding-subscription.md` |
| PC-04 (identity claim by a parent) | UX-13, ECR-UX-01 (empty state), ECR-UX-09 |
| PC-05 (morning attendance, absence notification) | ECR-UX-04, ECR-UX-01 (alert), UX-02, UX-11, UX-12 |
| PC-06 (grades, council, report cards) | ECR-UX-03, ECR-UX-02, ECR-UX-06; UX-02 |
| PC-07 (payment, reminder) | ECR-UX-07 (viewing), UX-12; screens from module `prd/modules/16-finance-billing-collections.md` |
| PC-08 (Fatourati online payment) | ECR-UX-07, UX-11 |
| PC-09 (transfers, exit file) | ECR-UX-08 (consents), UX-09; screens from module `prd/modules/18-transfers-mobility.md` |
| PC-10 (self-service certificate) | ECR-UX-01, ECR-UX-07 (non-blocking arrears alert); screens from module `prd/modules/15-documents-certificates.md` |
| PC-11 (announcement, notice, moderated thread) | ECR-UX-06, UX-11, UX-12 |

## 4. UX requirements (`UX-NN`)

`UX-NN` identifiers are exclusive to this file (`prd/00-conventions.md` §2). Every requirement carries a Version tag per `PROJECT.md` §12 (DEC-15).

### 4.A Guiding principles

### UX-01 — Design mobile-first, Android-first

| Attribute | Value |
|---|---|
| Description | Every journey is designed, mocked up (in text), and tested first on a small touchscreen, then adapted for desktop — never the other way around. Android is the priority testing platform (67.96% of mobile web traffic versus 32.02% for iOS, traffic share rather than device base, StatCounter August 2026, `prd/research/05-infrastructure-usage.md` §2; `prd/research/00-baseline-corrections.md` #10); iOS remains well cared for. The desktop app stays complete for the principal's office and the registrar's office (management, imports, editing), with feature parity for daily journeys. Critical gestures (attendance, justification, viewing, payment) are one-handed. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §2.10, §10; DEC-36; H-11; BES-SEC-08; `prd/research/05-infrastructure-usage.md` §2 |
| Actors | All |

### UX-02 — Connection reliability and visible offline states

| Attribute | Value |
|---|---|
| Description | Reliability on an unstable connection is the top acceptance criterion for write journeys: connection failures, blank screens, and outages are the dominant complaints about existing parent apps, including the ministry's Massar apps (Moutamadris 3.1/5 across roughly 7,060 reviews, last updated 03/25/2022, `prd/research/01-market-competition.md` §4). Every critical write (attendance, grade entry, justification, thread reply) is kept locally then synced, with no loss or duplicate entry; the connection and send status is visible at all times (connected, offline, send pending, synced); recovery after an outage is automatic; failures are explicit and can be retried. No blank screen, no data silently lost, no raw technical message. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10 (offline), §2.10; `prd/research/01-market-competition.md` §4; BES-ENS-02, BES-ENS-03, BES-SUR-01; NFR-OFF and NFR-PERF domains (`prd/cross-cutting/32-non-functional-requirements.md`) |
| Actors | Teachers, supervisors, parents, students, registrar's office |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Attendance reliability on an unstable connection
  Scenario: Attendance confirmed offline, then synced
    Given a teacher taking attendance for their class in a room with no network
    When they mark absences and confirm attendance
    Then the screen shows a "sync pending" state (*في انتظار المزامنة*) with no error message and no lost entries
    And the entry is kept locally on the device
    When the network becomes available again
    Then attendance syncs automatically
    And the state switches to "synced" with no further user action

  Scenario: A sync conflict is never silently overwritten
    Given attendance confirmed offline by the teacher
    And a correction entered in parallel by student life for the same student
    When the sync runs
    Then the conflict is flagged to student life for arbitration
    And neither write is silently lost
```

### UX-03 — Simplicity for low digital literacy

| Attribute | Value |
|---|---|
| Description | The interface speaks the school's language, not the software's: everyday vocabulary from the glossary (`PROJECT.md` §17, `prd/cross-cutting/41-glossary.md`), short sentences, at most one new concept per screen, guided step-by-step journeys for rare actions (identity claim, first justification, first payment), contextual help in French and Arabic, examples in fields. Error messages state what happened and what to do, in French and Arabic, with no technical jargon or raw codes. No daily-use function requires more than three steps. |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §2.10; H-11; BES-PAR-02; `prd/research/01-market-competition.md` §4 (features parents expect) |
| Actors | Parents, students, teachers, supervisors, registrar's office |

### UX-04 — Identical gestures and structures across schools

| Attribute | Value |
|---|---|
| Description | Information structure, components, and gestures are strictly identical across every context: a multi-school parent and a part-time teacher learn the app once. When switching school or child (UX-09), only the content changes — navigation, labels, action placement, and gesture sequences stay identical. No school-level customization moves navigation elements or renames core concepts; the customizations available (language, channels, authorized documents) apply to content, never to the architecture. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-03, RG-36; G-27; BES-PAR-04, BES-ENS-01; `PROJECT.md` §5.2 (Ahmed: "a single app") |
| Actors | Parents, teachers, students |

### 4.B Bilingualism and RTL (G-10)

### UX-05 — A single bilingual design system with full RTL

| Attribute | Value |
|---|---|
| Description | A single design system serves both French and Arabic without duplication: every component defines its left-to-right and right-to-left reading state. RTL is complete and native: mirrored layout, alignment, tables, navigation, directional icons (back, arrows, progress); never mirrored: the school's logo and stamp, phone numbers, amounts, and payment references. Mixed content (a Latin name in an Arabic interface, an Arabic label in a French document) is handled by an explicit bidirectional rule, with no character reversal or truncation. Language is a per-user setting, attached to the account rather than the device (UX-17), with an instant switch. No untranslated string is accepted in production on shipped journeys. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-10; G-10; `PROJECT.md` §2.9, §10; NFR-I18N-01 (`prd/cross-cutting/32-non-functional-requirements.md`) |
| Actors | All |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Bilingual interface with full RTL
  Scenario: Switching to Arabic
    Given a parent using the interface in French
    When they choose Arabic in their settings
    Then the entire interface is rendered in Arabic with no perceptible reload
    And the layout is fully mirrored: navigation, alignment, tables, directional icons
    And their choice is remembered for future sessions on every device, without changing the language of other accounts used on the same phone (UX-17)

  Scenario: Latin content in an Arabic interface
    Given a parent using the interface in Arabic
    When they view the record of a student whose name exists only in Latin script
    Then the name is displayed with no character reversal or truncation
    And phone numbers and amounts remain displayed in readable 0-9 digits
```

### UX-06 — Dual-script names everywhere

| Attribute | Value |
|---|---|
| Description | Every person's first and last name exist in dual script (Latin and Arabic, `PROJECT.md` §2.9). The interface displays the script matching the active language and, if it's missing, the other script rather than inventing one; official documents (report cards, transcripts, certificates, attestations, exit file) and Massar exports carry both scripts. Data entry offers both fields side by side with a non-blocking completeness check; no automatic transliteration is produced or shown as though it were official. Lists sorted by name stay stable regardless of the interface language. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-10; G-10; `PROJECT.md` §2.9; NFR-I18N-03; `prd/03-domain-data-model.md` §2.1 (`Person`) |
| Actors | Principal's office, registrar's office, teachers, parents |

### UX-07 — Careful Arabic typography

| Attribute | Value |
|---|---|
| Description | Arabic script has its own typeface, distinct from the Latin one, chosen for on-screen legibility (letter connections, diacritics, digits): minimum sizes larger than Latin text, increased line spacing, never hyphenating or crushing an Arabic word, controlled truncation of long labels. Western digits 0-9 are used in both French and Arabic (common Moroccan usage); no Arabic-Indic numbering by default. Bilingual PDFs use correct Arabic fonts (A4 and A5 formats, `PROJECT.md` §10); Arabic rendering is tested both on screen and in print. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-10; `PROJECT.md` §2.9, §10 (documents); NFR-DOC (`prd/cross-cutting/32-non-functional-requirements.md`) |
| Actors | All |

### UX-08 — Languages: French and Arabic at MVP, English in V2

| Attribute | Value |
|---|---|
| Description | French and Arabic are available across the entire interface from MVP onward (DEC-10). English is added in V2 for international sections, with no rework of shipped journeys (`PROJECT.md` §10, §12). User-generated content (announcements, messages, remarks) is written in the language chosen by its author and shown as-is; school-configurable content exists in FR and AR. No user is ever blocked by interface content in a language they did not choose. |
| Priority | Must (FR/AR); Should (EN) |
| Version | MVP (FR/AR); V2 (EN) |
| Traceability | DEC-10; `PROJECT.md` §10, §12; G-10; NFR-I18N-01, NFR-I18N-02 |
| Actors | All |

### 4.C Context-based navigation

### UX-09 — Profile × school context switcher

| Attribute | Value |
|---|---|
| Description | A single account can hold several profiles (parent, teacher, staff, student) and several simultaneous affiliations (RG-03, RG-17); the interface always offers a context switcher whose every entry is a (profile, school) pair, along with the school year and the roles held. The active context is visible on every screen (a persistent banner); switching is possible from any screen, with no loss of in-progress entry after confirmation, and the data and permissions shown are immediately recalculated for the chosen context (RG-36). A removed context (a closed affiliation, RG-19) disappears immediately with an explicit message if it was active. Data from two contexts is never mixed on the same screen. |
| Priority | Must |
| Version | MVP |
| Traceability | RG-03, RG-17, RG-19, RG-36; G-27; INV-13, INV-31 (`prd/03-domain-data-model.md`); BES-ENS-01; ECR-UX-09 |
| Actors | All (multi-profile and multi-school accounts) |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Profile × school context switcher
  Scenario: A part-time teacher switching between two schools
    Given a teacher account affiliated with two schools at the same time
    When the user opens the context switcher
    Then the list shows every available profile × school pair with the school year
    When she switches to the second school
    Then all data shown belongs to the chosen context
    And the available actions are recalculated per that context's permissions

  Scenario: A multi-school parent keeps the same learned interface
    Given a parent with children at two schools
    When they switch from School A's context to School B's
    Then the app's structure, labels, and gestures stay identical (UX-04)
    And only the content changes: children, classes, payment plans, messages

  Scenario: A removed context, no delay
    Given a teacher whose affiliation was just closed by the school
    When they view their context switcher
    Then the corresponding context has disappeared immediately
    And if it was active, an explicit message states that access to that school's data has ended
```

### UX-10 — Lightweight navigation and useful search

| Attribute | Value |
|---|---|
| Description | Navigation fits in two levels maximum from the context's home screen; frequent actions (attendance, justification, payment collection, announcement) are one gesture away from the relevant role's home screen. A name search works within the active context's scope and respects dual script (UX-06) and least privilege (RG-39: search reveals only what the user is already entitled to see). Going back is always predictable; no destructive action is accessible with fewer than two explicit confirmations. |
| Priority | Should |
| Version | MVP |
| Traceability | RG-39; BES-SEC-08; UX-04, UX-06 |
| Actors | All |

### 4.D Notifications (G-17)

### UX-11 — Notification preferences and channel consent

| Attribute | Value |
|---|---|
| Description | Every user has a notification center (unread, viewable history) and preferences by category (absences, student life, grades and report cards, finance, communication, administrative), by channel, and, for parents, by child. The channel hierarchy follows DEC-36: push notification first (V1), WhatsApp "utility" for consenting parents (explicit, revocable opt-in, opposition handled — Law 09.08 and CNDP-ANRT 2019 guidance, `prd/research/03-payments-communications.md` §4), SMS via the Moroccan aggregator as a fallback, in-app notification always available. Founder arbitration (D1, 09/09/2026): at MVP, in-app + SMS + WhatsApp utility channels limited to attendance notifications (one or two minimal templates — INT-WAP-01 and OQ-03 of `prd/cross-cutting/35-external-integrations.md`); in V1, generalized WhatsApp (all messages, managed templates) and push. Each guardian manages their own reception settings; no setting ever reduces the other guardian's access rights or reception (RG-13, RG-14: restriction only on a court decision on record). |
| Priority | Must |
| Version | MVP (in-app, SMS, WhatsApp utility for attendance — opt-in, preferences); V1 (push, generalized WhatsApp) |
| Traceability | DEC-12, DEC-36; G-17; H-11, H-20; RG-13, RG-14; `prd/research/00-baseline-corrections.md` #6; `prd/research/03-payments-communications.md` §4; `prd/cross-cutting/35-external-integrations.md` (INT-WAP-01, OQ-03); ECR-UX-08 |
| Actors | Parents, students, teachers, staff |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Notification preferences and consent
  Scenario: Revocable WhatsApp opt-in
    Given a parent who has not consented to the WhatsApp channel
    When they view their notification settings
    Then the WhatsApp channel appears disabled with a note that consent is required
    When they enable the channel and confirm their consent
    Then eligible notifications can be delivered to them via WhatsApp
    And revoking consent covers all future sends
    And revocation affects neither the in-app channel nor the SMS fallback for critical alerts

  Scenario: A parent never reduces the other's rights
    Given two active legal guardians of the same student
    When one of them disables a notification category for themselves
    Then the other guardian keeps receiving their own notifications
    And no setting changes the other parent's access rights, restriction requiring a court decision on record (RG-14)
```

### UX-12 — Anti-spam: priority, digests, quiet hours, visible costs

| Attribute | Value |
|---|---|
| Description | Every notification carries a priority level: critical (today's absence, notice, security alert — always sent immediately, absence notification within 5 minutes after attendance, `PROJECT.md` §10), important (report-card publication, payment receipt), informational (reminders, general announcements). Informational categories allow an optional **daily digest** (a single aggregated message per child per day) and a default nighttime quiet window in the school's local time, which never applies to critical messages. Multi-channel sends are deduplicated: one piece of information = one primary delivery channel with a fallback, never the same content repeated across every channel. On the school side, message costs (SMS/WhatsApp packs) and consumption counters are visible before a bulk send, with a threshold alert (`prd/research/03-payments-communications.md` §4-5). |
| Priority | Must |
| Version | MVP (priority, deduplication, digest); V1 (configurable quiet window, WhatsApp costs) |
| Traceability | DEC-12, DEC-36; G-17; `PROJECT.md` §10 (< 5-minute delay); `prd/research/00-baseline-corrections.md` #6; `prd/research/03-payments-communications.md` §4-5 |
| Actors | All; principal's office for school-level costs |

### 4.E Forms and data entry

### UX-13 — Short forms, phone-first, OTP authentication

| Attribute | Value |
|---|---|
| Description | Every form asks for the minimum fields, in order of importance, with inline validation and resume of an interrupted entry. The mobile phone number is the first contact field, mandatory for every guardian and validated in international E.164 format (a +212 prefix suggested by default, Moroccan mobile prefixes checked; foreign numbers accepted — ARB-07); email is optional and never required from a parent, student, or teacher (DEC-11, INV-37). The login identifier is distinct from the contact identifier (INV-45): a minor student without their own mobile receives a generated, readable identifier, activated by a legal guardian from their account with a one-time code sent to the guardian's number; a second guardian sharing the household's mobile likewise receives a generated identifier, with the household's number declared as a shared contact (FR-ADM-20, SEC-01). Account creation and access recovery work without email: a one-time code sent by SMS to the registered number (`PROJECT.md` §9); number change, number loss, and identity claims follow SEC-27 (knowledge challenge). Fields with a controlled set of values (classes, levels, reasons) offer lists rather than free text. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-11; INV-37, INV-45 (`prd/03-domain-data-model.md`); `PROJECT.md` §9, §2.10; PC-04; ARB-07, ARB-08; SEC-01, SEC-27; FR-ADM-20 |
| Actors | Parents, students, teachers, staff, registrar's office |

**Acceptance criteria (critical flow):**

```gherkin
Feature: Phone as the primary contact identifier
  Scenario: Creating an account with no email address
    Given a parent with no active email address
    When they create their account
    Then only the mobile number is required, in international format with +212 suggested by default
    And the email address stays optional at every step
    When they enter the code received by SMS
    Then their account is active immediately

  Scenario: Access recovery with no email
    Given an account created with a mobile number and no email
    When the user requests an access reset
    Then the verification code is sent by SMS to the registered number
    And no screen requires an email address to continue

  Scenario: Activating access for a student with no phone of their own (MVP)
    Given a logged-in legal guardian whose 2AC-level child has no mobile number
    When they activate student access from the child's record
    Then the platform generates a readable login identifier for the student and asks for an initial password
    And the confirmation code is sent to the guardian's number
    And the student can then open their own session on the family phone, distinct from the guardian's (UX-17)
```

### 4.F Accessibility

### UX-14 — Accessibility: contrast, sizes, keyboard, screen readers

| Attribute | Value |
|---|---|
| Description | The interface targets WCAG 2.1 level AA compliance on shipped journeys: minimum 4.5:1 contrast for body text and 3:1 for large text and interface elements; user-adjustable font sizes with no loss of layout (within the limits of UX-07 for Arabic script); full keyboard navigation on the web app (logical tab order, visible focus, shortcuts for frequent actions); screen-reader compatibility on the main journeys — login, parent viewing, student viewing, attendance, grade entry, payment, settings (`PROJECT.md` §10). Information is never conveyed by color alone; touch targets remain compliant at enlarged sizes. |
| Priority | Must |
| Version | MVP (WCAG 2.1 AA target on the main journeys); V1 (formal compliance audit, NFR-RES-04) |
| Traceability | `PROJECT.md` §10 (accessibility); UX-05, UX-07; NFR-RES-04; ARB-25p |
| Actors | All |

### 4.G Platforms and perceived performance

### UX-15 — Responsive web and PWA at MVP; native apps in V2

| Attribute | Value |
|---|---|
| Description | The MVP platform is the responsive web app, installable as a PWA (home-screen icon, standalone mode, session resume), usable on older hardware — the baseline lists "FR/AR, responsive web, PWA" at MVP (`PROJECT.md` §12). Native Android and iOS apps arrive in V2 with feature parity, Android first (UX-01); the baseline mentions "native apps" in its V1 list (§12) while its §10 sets them in V2: divergence resolved in favor of §10 and logged in OQ-01, consistent with NFR-MOB-02 (`prd/cross-cutting/32-non-functional-requirements.md`). No everyday journey is ever reserved for desktop. |
| Priority | Must |
| Version | MVP (responsive web, PWA); V2 (native Android and iOS) |
| Traceability | `PROJECT.md` §10, §12; DEC-15; DEC-36 (Android 68%, iOS 32% of traffic); BES-SEC-08; NFR-MOB-01, NFR-MOB-02; OQ-01 |
| Actors | All |

### UX-16 — Perceived performance and low-bandwidth mode

| Attribute | Value |
|---|---|
| Description | Every screen shows what is loading: layout-faithful loading skeletons, explicit empty states, progress for long operations (document generation, bulk sends). Usual pages display in under 2 seconds on 4G (`PROJECT.md` §10; measurable thresholds in NFR-PERF-01); the initial payload of key pages is kept lean (lightweight, lazy-loaded images, attachments loaded on demand); a data-saving mode limits non-essential media on a degraded connection. Performance is tested on degraded 4G and on the registrar's typical older hardware (BES-SEC-08); rural households' internet access remains lower than urban (78.4% versus 93.6%, ANRT 2024-2025, `prd/research/05-infrastructure-usage.md` §2), which justifies the SMS fallback for alerts (UX-11) and tolerance for outages (UX-02). |
| Priority | Must |
| Version | MVP |
| Traceability | `PROJECT.md` §10, §2.10; H-11; BES-SEC-08; NFR-PERF-01, NFR-PERF-04; `prd/research/05-infrastructure-usage.md` §2 |
| Actors | All |

### 4.H Accounts and shared devices

### UX-17 — Per-person language and account selection on a shared device

| Attribute | Value |
|---|---|
| Description | Interface language (FR or AR) is a personal preference, carried by the person's account (`User`) rather than the device: it applies across all their devices and also governs the language of SMS, WhatsApp messages, and notifications sent to them (FR-COM-05, ARB-21c); an SMS is sent in the recipient's language alone. On a shared device (a family phone: a parent in Arabic, a student in French), an **account selection screen** lists the accounts used on the device (first name, role, language), opens a distinct session for each, requires the chosen account's secret, and returns to selection at the end of use or after inactivity; no data from one account is visible from another's session (RG-12b, INV-13). Adding an account to the device goes through the login identifier (mobile number or generated identifier, UX-13). Removing an account from the device clears its local data, including offline entries already synced. |
| Priority | Must |
| Version | MVP |
| Traceability | DEC-10, DEC-11; RG-01, RG-12b; INV-13, INV-45; ARB-07, ARB-21c; NFR-I18N-01; FR-COM-05; ECR-UX-09 |
| Actors | Parents, students, teachers (any account on a shared device) |

**Acceptance criteria (critical flow):**

```gherkin
Feature: A device shared between a parent and a student (MVP)
  Scenario: Two accounts, two languages, no data leak
    Given a family phone with both Ahmed's account (Arabic) and Youssef's account (French) registered
    When Youssef chooses his account on the selection screen and enters his secret
    Then the interface opens in French in a session distinct from Ahmed's
    And none of Ahmed's financial data or notifications are accessible from this session
    When Youssef's session ends
    Then the device returns to the account selection screen without revealing either session's content

  Scenario: SMS in the recipient's language
    Given a mother who chose Arabic and a father who chose French for the same student
    When an absence notification is sent by SMS
    Then the mother receives the SMS in Arabic and the father in French, each as a single message
```

## 5. Morocco specifics

### 5.1 Bilingual composition and RTL beyond mirroring

ZSchool's bilingualism is not an overlaid translation but a composition constraint: every screen is specified for both its languages (zones, alignment, label lengths, states), and every official document is bilingual with a header, authorization number, stamp, and signature (`PROJECT.md` §2.9). Composition rules: the title and primary action are translated in full, never juxtaposed in two languages within the same label; values entered by users stay in their original language; dates, amounts, references, and numbers follow a single format regardless of language, in 0-9 digits.

### 5.2 Dual script, sorting, and search

Dual script (UX-06) requires visible choices: lists sorted by the interface language's script, language-agnostic search (both scripts are queried), records that flag a missing script without blocking (completeness driven by the administration module, `prd/modules/10-administration-onboarding-subscription.md`).

### 5.3 Terminology and figures

Screen terminology follows the baseline glossary (`PROJECT.md` §17) and `prd/cross-cutting/41-glossary.md`: *student* (*تلميذ(ة)*), *teacher* (*أستاذ(ة)*), *class* (*القسم*), *report card* (*بيان النقط*), *timetable* (*استعمال الزمن*), *absence* (*غياب*), *tardiness* (*تأخر*), *justification* (*مبرر الغياب*), *arrears* (*متأخرات الأداء*), *receipt* (*وصل الأداء*), *Massar code* (*رمز مسار*). No floating synonyms: one concept = one term = one FR and AR label.

### 5.4 Dates, calendars, timezone

Timestamps are shown in Moroccan time, permanently UTC+0 since 09/20/2026 (Decree No. 2.26.530, `prd/research/00-baseline-corrections.md` #1): the interface exposes no timezone setting and the UX never has to handle a clock change. Moveable religious holidays are shown with both their Hijri and Gregorian dates (`PROJECT.md` §10; NFR-I18N-05); Ramadan's lighter hours remain a pedagogical need handled as a timetable variant (module `prd/modules/12-academic-structure-timetables.md`, V1), not a timezone issue. The baseline's divergence (§2.4/§10 still mention the UTC+1/UTC+0 alternation) is logged in OQ-05.

### 5.5 Real channels: WhatsApp, SMS, email

WhatsApp is used by 98.6% of social-media users in Morocco and SMS remains the universal channel; email is rarely checked and has no recent primary data behind it — a secondary, non-critical channel (ANRT 2024-2025, `prd/research/05-infrastructure-usage.md` §2). UX consequences: phone is the contact identifier (UX-13), the channel pairing follows DEC-36 (UX-11), WhatsApp consent is an explicit screen (ECR-UX-08), and email is never a mandatory step in any journey.

### 5.6 Reliability as a product argument

The dominant complaints about market parent apps (connection failures, blank screens, outages — `prd/research/01-market-competition.md` §4) make perceived reliability (UX-02, UX-16) a deliberate differentiator: offline states are visible, local data is never lost, recovery is automatic. This positioning is measured by adoption and reliability indicators (`prd/cross-cutting/38-kpi-success-metrics.md`, KPI-03, KPI-11, KPI-12).

## 6. Data and events drawn on

This chapter defines no entity; it draws on the logical model (`prd/03-domain-data-model.md`):

| Model element | UX use |
|---|---|
| `User` (account, login identifier distinct from contacts, language, passwords, MFA) | OTP login or generated identifier, per-person language, account selection on a shared device, context switcher (UX-09, UX-13, UX-17; INV-13, INV-45) |
| `Person` (bilingual civil status) | Dual script displayed and searched (UX-06) |
| `ParentProfile` (communication preferences) | Notification settings by category, channel, child (UX-11, ECR-UX-08) |
| `School` (settings: languages, channels) | Content customizations, never architecture (UX-04; RG-22) |
| `Notification`, `DeliveryLog` (channel, status, cost) | Notification center, delivery statuses shown, visible costs (UX-11, UX-12) |
| `ConsentGrant` (scope, duration, revocation) | Consent screen, immediate revocation (ECR-UX-08; INV-24) |
| `AuditLog` | Traces visible on the school side for sensitive actions (RG-38; out of scope for parent-facing display) |

Invariants drawn on in this chapter: INV-13 (one account, several profiles), INV-24 (bounded, revocable consents), INV-31 (contextual permissions), INV-35 (adult student, MVP — ARB-10), INV-37 (phone as primary contact identifier, email never required), INV-39 (no document blocked for arrears), INV-45 (login identifier distinct from contact). Notification events: the model's event log (§7 of `prd/03-domain-data-model.md`, notably `AbsenceRecorded` and the publication, payment, and consent events) feeds the notification center and priority rules (UX-12).

## 7. Key cross-cutting screens (`ECR-UX-NN`)

`ECR-UX-NN` identifiers are reserved for this file; module-specific screens carry the `ECR-<MOD>-NN` identifiers of their own chapter (`prd/modules/10-administration-onboarding-subscription.md` to `prd/modules/23-health-sensitive-data.md`). Text descriptions only (conventions §1); for each screen: purpose, version, zones and elements, states, key labels, cross-references.

### ECR-UX-01 — Parent home: consolidated multi-child / multi-school card

| Attribute | Value |
|---|---|
| Purpose | Every guardian's account entry view: see at a glance the state of each child at each school and act in one gesture. |
| Version | MVP (`PROJECT.md` §12: multi-child, multi-school parent dashboards) |
| Zones and elements | Context banner (active profile and school, access to the switcher ECR-UX-09, notifications button with an unread counter, settings button). "Today" zone: active alerts per child sorted by priority (an absence to justify, a notice, an upcoming payment, an urgent announcement). Consolidated card per child: avatar, name in the interface's script, school and class, today's attendance state, next payment due with a short balance, latest publications (grades, report card); the whole card opens the child's detail in their context. Quick actions: justify an absence with an attachment, open payment (ECR-UX-07), open a thread (ECR-UX-06), request a document (V1). Fixed bottom navigation bar: Home (*الرئيسية*), Messages (*الرسائل*), Notifications (*الإشعارات*), Settings (*الإعدادات*). |
| States | Loading (skeletons); empty (no linked child: prompt to claim a profile via an invitation code, PC-04); offline (persistent banner + last-refresh date, viewing the last known state); isolated partial error per child (individual reload). |
| Key labels | Home (*الرئيسية*); Justify (*تبرير*); Pay (*أداء*); Messages (*الرسائل*); Notifications (*الإشعارات*); Settings (*الإعدادات*); Absence (*غياب*); Due date (*أجلة الأداء*) |
| Cross-references | Finance: `prd/modules/16-finance-billing-collections.md`; communication: `prd/modules/17-communication-notifications.md`; documents: `prd/modules/15-documents-certificates.md`; journeys `prd/journeys/05-multi-school-parent.md` and `prd/journeys/06-custodial-mother-and-guardian.md`; BES-PAR-01, BES-PAR-02, BES-PAR-04, BES-GAR-05 |

### ECR-UX-02 — Student home

| Attribute | Value |
|---|---|
| Purpose | Give the student the essentials of their day and their results, on the family phone or their own. |
| Version | MVP (access per RG-01, published grades and report cards); homework and full timetable variants in V1 |
| Zones and elements | Context banner (student profile, school, class). "Today" block: today's timetable (normal variant, Ramadan or exam variant in V1). "Latest publications" block: published, immutable grades and report cards (viewing only, never editing), homework to do (V1). Class announcements block. Self-service document access (V1); a "my rights" entry for the adult student (RG-02, INV-35, MVP — ARB-10): account-ownership notice, restriction of parental access to school, disciplinary, and health data, with a visible audit trail. Same fixed navigation bar as the parent (UX-04). |
| States | Empty (no published grade: a simple "nothing published yet" message); access not activated (RG-01: an information screen, with an activation request sent to the guardian via in-app notification and a communication thread, ECR-UX-06; absent any action, the request routes through the school); offline; adult (rights block visible) / minor (block absent). |
| Key labels | Today (*اليوم*); Timetable (*استعمال الزمن*); Grades (*النقط*); Report card (*بيان النقط*); Homework (*واجبات*) |
| Cross-references | Assessments: `prd/modules/14-assessments-grades-report-cards.md`; academics: `prd/modules/12-academic-structure-timetables.md`; journey `prd/journeys/07-students-minor-and-adult.md`; BES-ELE-01, BES-ELE-02, BES-ELE-03, BES-ELE-05 |

### ECR-UX-03 — Teacher home

| Attribute | Value |
|---|---|
| Purpose | Fit the teacher's day on mobile: their courses, their attendance-taking, their pending entries, their exchanges with parents. |
| Version | MVP |
| Zones and elements | Context banner (teacher profile × school — the part-time teacher's switch point, UX-09). "My courses today" list in chronological order: class, subject, room, times, an Attendance button (*تمرير الحضور*) per session (opens ECR-UX-04). "Pending entries" badge (grades to enter, with a period deadline). "Pending attendance" badge for the day (sessions with no confirmed attendance, direct access to ECR-UX-04). Lesson-log access (V1). Announcements from their classes and open parent threads (ECR-UX-06). Compliance reminders before closing (missing assessments, cross-reference to the assessments module). |
| States | No class today (a message and access to upcoming days); offline (attendance always functional, UX-02); affiliation closed (context removed, RG-19, explicit message); multi-school part-time teacher (two contexts in the switcher, no data mixing). |
| Key labels | My courses today (*حصص اليوم*); Attendance (*تمرير الحضور*); Grades to enter (*نقط في انتظار التسجيل*); Lesson log (*دفتر النصوص*) |
| Cross-references | Attendance: `prd/modules/13-attendance-student-life-discipline.md`; assessments: `prd/modules/14-assessments-grades-report-cards.md`; communication: `prd/modules/17-communication-notifications.md`; journey `prd/journeys/04-part-time-teacher.md`; BES-ENS-01, BES-ENS-02, BES-ENS-03, BES-ENS-08 |

### ECR-UX-04 — Mobile attendance-taking

| Attribute | Value |
|---|---|
| Purpose | Take a class's attendance in a few gestures, even with no network, and trigger absence notifications with an explicit confirmation. |
| Version | MVP (PC-05) |
| Zones and elements | Session header: class, subject, slot, room, local date and time (permanent UTC+0). Live counters: present, absent, tardy. Student list: thumbnail photo, name in the interface's script, default state "present", per-student actions: Absent (*غياب*), Tardy (*تأخر*), an optional short comment. A "mark all present" action for a whole class. A "Confirm attendance" button within thumb reach; confirmation is explicit (it is what triggers guardian notifications, under a 5-minute delay, `PROJECT.md` §10). Permanent status indicator: local edit / send pending / synced (UX-02). |
| States | Local edit (editable); offline (persistent banner, entry continues without blocking); syncing; confirmed and synced (switches to viewing, correction possible via the attendance module); sync conflict (flagged to student life, UX-02); send failure (one-gesture retry, no loss). |
| Key labels | Present (*حاضر*); Absent (*غياب*); Tardy (*تأخر*); All present (*جميعهم حاضرون*); Confirm attendance (*تصديق التمرير*); Send pending (*في انتظار المزامنة*) |
| Cross-references | Attendance module: `prd/modules/13-attendance-student-life-discipline.md` (the module's `ECR-VSC` screens); NFR-OFF, NFR-MOB-03; BES-ENS-02, BES-SUR-01, BES-SUR-02 |

### ECR-UX-05 — Principal's-office home

| Attribute | Value |
|---|---|
| Purpose | Give the principal and academic direction the school's state on a single screen, and direct access to the day's decisions. |
| Version | MVP (principal's-office dashboard, `PROJECT.md` §12); consolidated organization view in V1 |
| Zones and elements | Context banner (active school; switch to the consolidated organization view in V1, aggregates with no data merging, RG-21). Today's indicator cards: active headcount, today's absences (with a link to the list), tardiness, open incidents (V1). Financial card: month-to-date collections, arrears by level, scheduled reminders (cross-reference to the finance module). "Waiting on you" queue: periods to close, report cards to publish, document requests, teacher authorizations (V1). Access to full reporting (`prd/modules/20-dashboards-reporting.md`) and to drafting announcements. |
| States | New school (empty state with access to the setup wizard, PC-03); start-of-year period (enrollment/re-enrollment campaign banners); offline (indicators dated to the last load); organization view (V1: per-school aggregates, comparisons, no cross-tenant data). |
| Key labels | Headcount (*المؤدون*); Today's absences (*الغائبون اليوم*); Arrears (*متأخرات الأداء*); To close (*في انتظار الإقفال*); Announcements (*إعلانات*) |
| Cross-references | Reporting: `prd/modules/20-dashboards-reporting.md`; finance: `prd/modules/16-finance-billing-collections.md`; student life: `prd/modules/13-attendance-student-life-discipline.md`; journey `prd/journeys/01-school-group-director.md`; BES-DIR-01, BES-DIR-02 |

### ECR-UX-06 — Communication thread

| Attribute | Value |
|---|---|
| Purpose | Replace informal messaging groups with a traceable, legible channel: targeted announcements and framed conversations, with delivery tracking and a visible moderation framework (DEC-34). |
| Version | MVP (announcements, messages, moderated in-app threads by default — ARB-21a, in-app and SMS notifications); push and generalized WhatsApp in V1 (ARB-21b) |
| Zones and elements | Two tabs: Announcements (*إعلانات*) and Conversations (*محادثات*). Targeted-announcement list filtered by child and school, with publication status and staff-side read receipts. List of open threads with unread counts. Thread screen: chronological history, replies, lightweight attachments, a visible delivery status (sent, delivered, read — fed by `DeliveryLog`), and a permanent note "the principal's office can view this thread" (*يمكن للإدارة الاطلاع على هذه المحادثة*) — a DEC-34 requirement, a disclosure owed to users. The parent replies within a thread opened by the teacher or the school (moderated mode by default, DEC-34); parental initiative is possible if the school allows it. |
| States | No open thread (the parent sees an explanation of moderated mode and how to contact the registrar's office); offline (draft kept locally, sent on resume); sending / delivered / read (statuses); urgent announcement (critical priority, excluded from the digest). |
| Key labels | Announcements (*إعلانات*); Conversations (*محادثات*); Reply (*رد*); Sent (*أرسل*); Delivered (*تم التوصيل*); Read (*قُرئ*) |
| Cross-references | Communication module: `prd/modules/17-communication-notifications.md` (templates, multi-channel routing, `ECR-COM`); student-life notices: `prd/modules/13-attendance-student-life-discipline.md` (V1); PC-11; DEC-34; BES-PAR-08, BES-ENS-05 |

### ECR-UX-07 — Payment (Fatourati reference)

| Attribute | Value |
|---|---|
| Purpose | Let the financial guardian understand what they owe, pay via the Fatourati rail directly, and prove what they've paid — without ever presenting arrears as an obstacle to official documents (DEC-24, INV-39). |
| Version | Viewing the payment plan, balance, and receipts at MVP (basic finance, `PROJECT.md` §12); online payment in V1 (Fatourati rail, DEC-31) |
| Zones and elements | Child selector (multi-child accounts). Account summary: balance, next payment due, total paid year-to-date. Payment plan by period (monthly, term, or annual per the school): paid / upcoming / overdue status, with dates. For each payable installment (V1): a payment reference in the school's Fatourati creditor format, a payment QR code, a simple step-by-step guide to channels (banking app, ATM, mobile wallet, cash point — `prd/research/03-payments-communications.md` §1), an explicit "pending reconciliation" status (daily reconciliation), a "I paid / there's an issue" help button opening a thread to the registrar's office (ECR-UX-06). A downloadable, archived receipt for every payment. An arrears alert written as information with an offer to view an account statement, never as a block or a threat. |
| States | No debt (a simple, positive state); an installment due at MVP (no online payment: front-desk payment terms displayed — hours and accepted methods configured by the school); overdue installment (information, statement, contact — no punitive language); payment pending reconciliation (visible status, timeframe shown); payment not found (help with a claim, using the reference); offline (viewing the last known state, the payment reference always visible since it is useful offline). |
| Key labels | Payment (*الدفع*); Payment plan (*جدول الأداء*); Reference (*المرجع*); Receipt (*وصل الأداء*); Pending confirmation (*في انتظار التأكيد*); Arrears (*متأخرات الأداء*) |
| Cross-references | Finance module: `prd/modules/16-finance-billing-collections.md` (`ECR-FIN`); integration: `prd/cross-cutting/35-external-integrations.md` (INT-FAT); PC-07, PC-08; DEC-24, DEC-31; BES-PAR-03, BES-PAR-07, BES-GAR-07 |

### ECR-UX-08 — Settings: notifications and consents

| Attribute | Value |
|---|---|
| Purpose | Give every user control over what they receive, through which channel, and what they've consented to — within the limits of other guardians' rights (RG-13, RG-14). |
| Version | MVP (per-person language, in-app and SMS channels, WhatsApp utility opt-in for attendance with a transfer notice, preferences, digests, the adult student's "my rights" block — ARB-10); V1 (push, generalized WhatsApp, richer sharing consents) |
| Zones and elements | Interface language (French, Arabic; English in V2) with an instant switch (UX-05, UX-08). Notifications: a matrix by category (absences, student life, grades and report cards, finance, communication, administrative) × channel (in-app always on; push V1; WhatsApp — utility for attendance at MVP, generalized in V1 — with a "consent required" note before activation; SMS per the school's configuration) × child for multi-child accounts; an optional daily digest for informational categories; a quiet window (excluding critical messages) — V1. Consents: a list of active consents with scope, duration, and one-gesture revocation (WhatsApp — with an explicit notice about transferring contact data outside Morocco, MVP transfer basis, ARB-25c —, school communications, transfer-related sharing — `ConsentGrant`, INV-24). My qualities and rights: per school, the qualities held (legal guardian, custodian, financial guardian, emergency contact) and their associated rights (RG-14b; BES-GAR-02). My data and rights: access, rectification, objection, export of published documents (formalized in V1, `prd/cross-cutting/36-legal-compliance-data-protection.md`). |
| States | Consent required (WhatsApp disabled with an explanation before activation); revocation done (confirmation and scope: future sends); access restriction observed (shown read-only with a reference to the decision recorded by the school — never self-triggered by another parent); adult student (parental-access management block, RG-02/INV-35, MVP — ARB-10); "STOP" opposition received by SMS or WhatsApp: shown with its scope (reminders and announcements only; attendance and security kept, ARB-21d). |
| Key labels | Settings (*الإعدادات*); Notifications (*الإشعارات*); Consents (*الموافقات*); Revoke (*إلغاء الموافقة*); My rights (*حقوقي*); Language (*اللغة*) |
| Cross-references | Communication module: `prd/modules/17-communication-notifications.md`; compliance: `prd/cross-cutting/36-legal-compliance-data-protection.md`; administration: `prd/modules/10-administration-onboarding-subscription.md` (qualities and relationships); UX-11, UX-12; BES-GAR-02, BES-GAR-05, BES-ELE-05 |

### ECR-UX-09 — Context switcher (profile × school)

| Attribute | Value |
|---|---|
| Purpose | Organize multi-membership (RG-03): show where you are, allow switching context with no error and no data mixing. |
| Version | MVP |
| Zones and elements | Opened from the context banner present on every screen (UX-09). A panel listing contexts grouped by profile: parent, teacher, staff, student; each row carries the profile, the school, the school year, and the roles held (RG-17: simultaneous affiliations visible). The active context is marked. Useful per-context counters (unread notifications, pending entries). Search by school if the list is long. Exit: an immediate switch or a confirmation if an entry is in progress (never a silent loss). Ahead of the context switcher, on a shared device, the **account selection screen** (UX-17) picks the person before the context: a list of accounts registered on the device (first name, role, language), adding an account via a login identifier, removing an account with local data cleared. |
| States | A single context (panel reduced to information, with no superfluous switching mechanism); a removed context (RG-19: immediate disappearance, a message if it was active); a switch in progress (a brief transitional state, no residual data from the old context); a student profile with no activated access (RG-01: profile listed, context not openable, information about activation by a guardian). |
| Key labels | Context (*السياق*); Switch context (*تبديل السياق*); School year (*السنة الدراسية*); Active (*نشط*) |
| Cross-references | Permissions: `prd/cross-cutting/30-roles-permissions-matrix.md`; administration: `prd/modules/10-administration-onboarding-subscription.md`; career: `prd/modules/19-teacher-career-network.md` (affiliations); UX-04, UX-09, UX-17; INV-13, INV-31, INV-45 |

## 8. Integrations

This chapter specifies no integration; it consumes their visible effects. Specifications are carried by `prd/cross-cutting/35-external-integrations.md`: INT-SMS (Moroccan aggregator, alphanumeric sender ID — the displayed SMS sender must be the school's alias), INT-WAP (WhatsApp Business Platform, Meta-approved utility templates — opt-in and opposition are UX screens, UX-11 and ECR-UX-08), INT-FAT (Fatourati: generating references and QR codes shown in ECR-UX-07, daily reconciliation status), INT-EML (secondary channel, never blocking). Send costs flow up via `DeliveryLog` and feed the counters visible to the school (UX-12).

## 9. Specific non-functional requirements

The measurable standard is carried by `prd/cross-cutting/32-non-functional-requirements.md`; this chapter sets its UX expression and introduces no competing threshold:

| NFR domain | Relationship to this chapter |
|---|---|
| NFR-I18N (01 to 06) | UX-05, UX-06, UX-07, UX-08, UX-17 (per-person language, NFR-I18N-01); §5.4 (permanent UTC+0 timezone, NFR-I18N-04) |
| NFR-MOB (01, 02, 03, 05, 06) | UX-01, UX-15; browser and OS floor (NFR-MOB-06); the < 5-minute absence delay shown as a commitment in ECR-UX-04; bulk sends never blocking |
| NFR-RES-04 | UX-14 (WCAG 2.1 AA targeted at MVP, audit V1) |
| NFR-PERF (01, 04) | UX-16 (skeletons, low-bandwidth mode, degraded-4G test plan) |
| NFR-OFF | UX-02, ECR-UX-04 (offline states and sync) |
| NFR-DISP (01, 05) | Bilingual maintenance and incident messages, windows outside critical periods |
| NFR-DOC | UX-07 (Arabic fonts in bilingual PDFs) |
| NFR-OBS | Delivery statuses and consumption counters shown (UX-12), measurable via KPI (`prd/cross-cutting/38-kpi-success-metrics.md`) |

## 10. Success metrics

Indicators are carried by `prd/cross-cutting/38-kpi-success-metrics.md`. This chapter contributes directly to the following measures: parent adoption (KPI-03), teacher adoption (KPI-02), absence-notification delay (KPI-07), notification channels and fallback (KPI-08, KPI-09), perceived reliability and connection incidents (KPI-11, KPI-12 — reliability being the dominant market complaint, `prd/research/01-market-competition.md` §4), satisfaction and differentiation from existing apps (KPI-31). UX drives these measures: every UX requirement in this chapter targets a journey that feeds at least one KPI.

## 11. Open questions

| ID | Question | Context and treatment |
|---|---|---|
| OQ-01 | **Resolved — ARB-21b (PWA at MVP, native apps in V2); baseline to correct, ESC-03:** PWA and native-app versions: the baseline contradicts itself (§12's MVP list cites "responsive web, PWA" and its V1 list cites "native apps"; §10 sets "PWA in V1, native Android and iOS apps in V2"). | Treatment adopted in this file: PWA at MVP (§12's explicit mention), native apps in V2 (§10, Android prioritized), consistent with NFR-MOB-01 and NFR-MOB-02 and their corresponding open question in `prd/cross-cutting/32-non-functional-requirements.md`. Baseline update to log in review. |
| OQ-02 | Baseline usage figures: §2.10 cites "roughly 8% of households have only a basic phone (up to 14% in rural areas)" — not found in the ANRT 2024-2025 survey — and presents "Android 68% / iOS 32%" as device market share, when it is actually web traffic share (StatCounter). | Treatment adopted: cite ANRT 2024-2025 (91.2% of individuals aged 5+ use the internet; households 89.2%, 93.6% urban versus 78.4% rural; 91.7% of mobile-equipped individuals own a smartphone) and StatCounter as traffic (`prd/research/00-baseline-corrections.md` #10; `prd/research/05-infrastructure-usage.md` §2). The SMS fallback remains a Must (a real rural gap); baseline update to log. |
| OQ-03 | **Partly resolved — D1, ARB-25c (express opt-in, attendance scope); pricing grid still open (H-20):** WhatsApp pricing and consent (DEC-36/H-20): the baseline says "rates change on October 1, 2026"; research specifies: per-message billing since 07/01/2025, the end of free service and utility messages within the 24-hour window on 10/01/2026, Morocco exiting "Rest of Africa" regional rates for a standalone grid, prior opt-in required (Law 09.08, CNDP-ANRT 2019 guidance). | Treatment adopted: explicit opt-in and revocation in ECR-UX-08 (UX-11); the pricing switch treated as a dated parameter on the cost side (UX-12); tracking inbound replies within the cost scope (`prd/research/00-baseline-corrections.md` #6; `prd/research/03-payments-communications.md` §4). Founder arbitration (D1, 09/09/2026) on version: WhatsApp utility limited to attendance notifications at MVP (one or two templates), generalized in V1 (all messages, managed templates, push) — aligned with INT-WAP-01 and OQ-03 of `prd/cross-cutting/35-external-integrations.md`. |
| OQ-04 | Amazigh (Tifinagh): the baseline mentions it as "to be planned for some content" (§2.9) without listing it in §12. | Working hypothesis: out of MVP and V1 scope; possible content in V2+, with no interface commitment. To be settled in review. |
| OQ-05 | **Escalated — ESC-03 (baseline update):** Timezone: the baseline (§2.4, §10) still describes "UTC+1 with a return to UTC+0 during Ramadan"; Decree No. 2.26.530 (Official Gazette No. 7521 of 06/29/2026) fixed the permanent return to UTC+0 on 09/20/2026, with no alternation. | Treatment adopted: display in permanent Moroccan UTC+0 time, no timezone selector in the UX, the Ramadan variant = a pedagogical schedule variant (`prd/research/00-baseline-corrections.md` #1; aligned with NFR-I18N-04 and its open question in `prd/cross-cutting/32-non-functional-requirements.md`). |

## Traceability

| Baseline ID | Coverage in this file |
|---|---|
| RG-03 | UX-09, UX-04; ECR-UX-09 |
| RG-13, RG-14 | UX-11; ECR-UX-08 |
| RG-17 | UX-09; ECR-UX-03, ECR-UX-09 |
| RG-19 | UX-09; ECR-UX-03, ECR-UX-09 |
| RG-21 | ECR-UX-05 |
| RG-22 | UX-04 (content customizations), UX-08 |
| RG-36 | UX-09; ECR-UX-09 |
| RG-38 | §6 (traces on the school side) |
| RG-39 | UX-10 |
| G-10 | UX-05, UX-06, UX-07, UX-08; §5.1 to §5.3 |
| G-17 | UX-11, UX-12; §5.5 |
| G-27 | UX-09 |
| DEC-10 | UX-05, UX-06, UX-07, UX-08 |
| DEC-11 | UX-13, UX-17 |
| DEC-12 | UX-11, UX-12 |
| DEC-15 | "Version" column of every requirement and screen |
| DEC-24 | ECR-UX-07 |
| DEC-31 | ECR-UX-07 |
| DEC-34 | ECR-UX-06 |
| DEC-36 | UX-01, UX-11, UX-12; §5.5 |
| `PROJECT.md` §2.8 | ECR-UX-07 (Fatourati parent channels) |
| `PROJECT.md` §2.9 | §5.1 to §5.3; UX-05 to UX-08 |
| `PROJECT.md` §2.10 | UX-01, UX-02, UX-16; §5.5 |
| `PROJECT.md` §9 | UX-13 (phone authentication) |
| `PROJECT.md` §10 | UX-02, UX-08, UX-14, UX-15, UX-16; §5.4 (timezone, calendars); §9 (NFR) |
| `PROJECT.md` §12 | "Version" column of every requirement and screen; OQ-01 |
| `PROJECT.md` §17 | §5.3 (screen terminology) |
| H-11 | UX-01, UX-03, UX-11; §5.5 |
| H-20 | OQ-03; UX-12 |
| `prd/research/00-baseline-corrections.md` #1 | OQ-05; §5.4 |
| `prd/research/00-baseline-corrections.md` #6 | OQ-03; UX-11, UX-12 |
| `prd/research/00-baseline-corrections.md` #10 | OQ-02; UX-01, UX-16 |
| `prd/research/01-market-competition.md` §4 | UX-02, UX-03; §5.6; §10 (KPI-11, KPI-12) |
| `prd/research/03-payments-communications.md` §1 | ECR-UX-07 |
| `prd/research/03-payments-communications.md` §4-5 | UX-11, UX-12 |
| `prd/research/05-infrastructure-usage.md` §2 | UX-01, UX-16; §5.5; OQ-02 |
| ARB-07, ARB-08 (login identifier, E.164 numbers, number change, claim) | UX-13, UX-17; ECR-UX-09 |
| ARB-10 (adult student at MVP) | ECR-UX-02, ECR-UX-08 |
| ARB-21a, ARB-21b (moderated threads at MVP; no push at MVP) | ECR-UX-06 |
| ARB-21c, ARB-21d (per-person language; STOP opposition scope) | UX-05, UX-17; ECR-UX-08 |
| ARB-25c (transfer notice in the WhatsApp opt-in) | ECR-UX-08 |
| ARB-25p (WCAG 2.1 AA) | UX-14 |
| INV-45 | UX-13, UX-17; ECR-UX-09 |
