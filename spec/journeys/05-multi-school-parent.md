> **Document Control**
>
> | Property       | Value                                                                                                                                                                          |
> | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | Document ID    | ZSCHOOL-JNY-05                                                                                                                                                                 |
> | Revision       | 1.0                                                                                                                                                                            |
> | Effective Date | 2026-09-09                                                                                                                                                                     |
> | Status         | Draft                                                                                                                                                                          |
> | Author         | ZSchool Product                                                                                                                                                                |
> | Classification | Functional Specification — Persona Journey                                                                                                                                     |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/journeys/05-multi-school-parent.md` (v0.3), old `PJ-PAR-01..12` -> `JNY-ZS-051..062`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Journey: Ahmed, Multi-School Parent

## 1. Purpose and scope

Ahmed (persona `PAR`) is the father of three children across two schools and their legal tutor and financially responsible parent: Youssef (Grade 8, School A, personal access activatable from Grade 7, INV-ZS-051), Sara (Grade 3, School A, represented by her guardians), and Adam (senior kindergarten, School B, represented by his guardians, no account of his own — half-day absence summaries by default, ADR-ZS-056 (ARB-15f)). His expectation is "see everything from WhatsApp and a single app." His access is **free**: the paying customer is the school (ADR-ZS-024); notification consumables (SMS, WhatsApp) are billed to the school (ADR-ZS-009). Steps are identified `JNY-ZS-NNN` and link to the critical journeys `JMP-ZS-NNN` in the map `spec/journeys/00-journey-map.md`.

In scope:

1. Creating Ahmed's account by phone (OTP) and linking to his three children through invitations and claiming (JNY-ZS-051).
2. A multi-child, multi-school dashboard with a child switcher (JNY-ZS-053).
3. Reacting to an absence: notification then an excuse with an attachment (JNY-ZS-054).
4. Viewing grades and report cards from both schools with the same gestures (JNY-ZS-055).
5. Paying fees via Fatourati and tracking the balance (JNY-ZS-056).
6. Receiving a receipt and an arrears reminder (JNY-ZS-057).
7. Messaging a teacher in a moderated thread (JNY-ZS-058).
8. An electronic departure authorization for a school outing (JNY-ZS-059).
9. A self-service certificate request with a verification QR code (JNY-ZS-060).
10. Changing or losing a mobile number, a recycled number, lost access (JNY-ZS-061).
11. Contesting a grade or a wrongly recorded absence (JNY-ZS-062).

Out of scope (handled elsewhere): creating identities at the school and Excel imports (`spec/behaviors/01-administration-onboarding-subscription.md`, `spec/behaviors/02-admissions-enrollment-reenrollment.md`); role and permission rules (`spec/cross-cutting/01-permissions.md`); roll call and student life on the school side (`spec/behaviors/04-attendance-student-life-discipline.md`); grade entry and publication on the school side (`spec/behaviors/05-assessments-grades-report-cards.md`); the Fatourati connection and school finance (`spec/behaviors/07-finance-billing-collections.md`, `spec/cross-cutting/06-external-integrations.md`); message routing and templates (`spec/behaviors/08-communication-notifications.md`); document generation (`spec/behaviors/06-documents-certificates.md`); the full transfer journey's detail (`spec/journeys/00-journey-map.md`, JMP-ZS-009, and `spec/behaviors/09-transfers-mobility.md` — this file only describes the parent-initiated request briefly in JNY-ZS-051's variants); security rules for number changes (`spec/cross-cutting/02-security-privacy.md`, SEC-ZS-003, SEC-ZS-004; requirement BEH-ZS-020).

---

## 2. Usage context and interface constraints

| Constraint                                                | Product consequence                                                                                                                                                                                                                                                                                                    | References                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Android smartphone first, unstable connections            | A lightweight interface, outage tolerance, a low-bandwidth mode; the Android/iOS traffic split (67.96%/32.02%) rules out neglecting iOS                                                                                                                                                                                | `spec/cross-cutting/03-non-functional-requirements.md` |
| WhatsApp near-universal among social-media users          | WhatsApp "utility" limited to attendance notifications in MVP (minimal templates, express opt-in), generalized in V1; SMS as a universal fallback; e-mail secondary, never required for a parent (INV-ZS-044, ADR-ZS-022)                                                                                              | ADR-ZS-036, ADR-ZS-062 (ARB-21b/c/d/e)                 |
| Free of charge for the parent                             | Ahmed never pays the platform; only fees owed to the school are at stake                                                                                                                                                                                                                                               | ADR-ZS-024                                             |
| Bilingualism, right-to-left                               | A bilingual French/Arabic interface and messages with full RTL; bilingual official documents                                                                                                                                                                                                                           | ADR-ZS-021                                             |
| Family setup: legal tutor, financially responsible parent | Ahmed is the legal tutor (by right, INV-ZS-066) and the financially responsible parent; other guardians hold their own accounts and receive the same default notifications (INV-ZS-063, INV-ZS-064, INV-ZS-030); any access restriction can only follow a court ruling recorded by the school (INV-ZS-065, INV-ZS-027) |                                                        |

Role: Ahmed is a parent/guardian across two tenants (School A, School B); effective rights on each relationship come from his qualities (legal guardian, legal tutor, financially responsible parent, emergency contact) as recorded on that `ParentStudentRelationship`, carried by `spec/cross-cutting/01-permissions.md`.

---

## 3. Journey overview

| ID         | Journey                                                      | Typical trigger                                                | Map journey            | Modules  | Needs covered          | Core version                                                                                          |
| ---------- | ------------------------------------------------------------ | -------------------------------------------------------------- | ---------------------- | -------- | ---------------------- | ----------------------------------------------------------------------------------------------------- |
| JNY-ZS-051 | Creating an account by phone (OTP)                           | A school-issued invitation, or Ahmed declaring a child himself | JMP-ZS-004             | ADM, INS | URS-ZS-034             | MVP                                                                                                   |
| JNY-ZS-052 | Being linked to his three children: invitations and claiming | First sign-in after schools' imports and enrollments           | JMP-ZS-004             | ADM, INS | URS-ZS-034             | MVP                                                                                                   |
| JNY-ZS-053 | Living the multi-child, multi-school dashboard day to day    | Daily use                                                      | JMP-ZS-004, JMP-ZS-011 | RAP      | URS-ZS-034, URS-ZS-037 | MVP                                                                                                   |
| JNY-ZS-054 | Reacting to an absence: notification then an excuse          | The `AbsenceRecorded` event                                    | JMP-ZS-005             | VSC      | URS-ZS-035, URS-ZS-038 | MVP                                                                                                   |
| JNY-ZS-055 | Viewing grades and report cards from both schools            | The `ReportCardPublished` event                                | JMP-ZS-006             | EVA      | URS-ZS-035             | MVP (progressive publication, bilingual report cards); V1 (verification QR code)                      |
| JNY-ZS-056 | Paying fees via Fatourati and tracking the balance           | A due installment, a reminder                                  | JMP-ZS-008             | FIN      | URS-ZS-036, URS-ZS-040 | V1 (ADR-ZS-031)                                                                                       |
| JNY-ZS-057 | Receiving a receipt and a reminder                           | The `PaymentReceived`/`InstallmentOverdue` events              | JMP-ZS-007, JMP-ZS-008 | FIN      | URS-ZS-036             | MVP (receipt, reminder); V1 (WhatsApp)                                                                |
| JNY-ZS-058 | Messaging a teacher in a moderated thread                    | A teacher-opened thread                                        | JMP-ZS-011             | COM      | URS-ZS-041             | MVP (in-app, ADR-ZS-062 (ARB-21a)); V1 (push, WhatsApp)                                               |
| JNY-ZS-059 | Signing an electronic departure authorization                | A published school outing                                      | JMP-ZS-011             | COM      | URS-ZS-039             | V1                                                                                                    |
| JNY-ZS-060 | Getting a self-service certificate                           | Ahmed's administrative need                                    | JMP-ZS-010             | DOC      | URS-ZS-036, URS-ZS-039 | V1 (self-service); MVP (front-desk equivalent, JNY-ZS-014 of `spec/journeys/02-secretary-cashier.md`) |
| JNY-ZS-061 | Changing a number, recovering access, a recycled number      | An operator change, a lost phone, a recycled number            | JMP-ZS-004             | ADM      | URS-ZS-034, URS-ZS-042 | MVP (ADR-ZS-049)                                                                                      |
| JNY-ZS-062 | Contesting a wrongly recorded grade or absence               | A contested absence notification, a contested published grade  | JMP-ZS-005, JMP-ZS-006 | VSC, EVA | URS-ZS-035, URS-ZS-043 | MVP                                                                                                   |

---

## 4. Detailed journeys

### JNY-ZS-051 — Creating an account by phone (OTP)

| Attribute        | Value                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Objective        | Activate Ahmed's own account from the mobile number the school holds, with no e-mail address, via a one-time code (OTP) received by SMS |
| Actors           | Ahmed; School A or School B (issuing the invitation); platform (OTP verification, audit log)                                            |
| Map journey      | JMP-ZS-004                                                                                                                              |
| Modules involved | ADM (`spec/behaviors/01-administration-onboarding-subscription.md`), INS (`spec/behaviors/02-admissions-enrollment-reenrollment.md`)    |
| Needs covered    | URS-ZS-034                                                                                                                              |
| Data             | `Person`, `ParentProfile`, `ConsentGrant` (`spec/domain-model.md`)                                                                      |
| Version          | MVP (global identities, invitations, and claim)                                                                                         |
| Baseline         | (→ ADR-ZS-014, ADR-ZS-021, ADR-ZS-022, INV-ZS-030, INV-ZS-044)                                                                          |

**Steps.**

| No.          | Starting condition                                                                       | Actor           | Action                                                                                                                                                                                                                                                                                          | Expected outcome          | Version |
| ------------ | ---------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------- |
| JNY-ZS-051.1 | The school imports guardians and issues an invitation, or Ahmed declares a child himself | Ahmed           | Receives a bilingual SMS with a time-limited secure link and a personal invitation code; opens the link on his phone: a "Create my account" screen shows the recipient number partly masked, a pre-filled invitation field, and a language choice (French or Arabic, right-to-left, ADR-ZS-021) | Onboarding screen reached | MVP     |
| JNY-ZS-051.2 | Onboarding screen reached                                                                | Ahmed, platform | Requests verification; a one-time OTP is sent by SMS; the code expires and resending is limited (abuse protection, `spec/cross-cutting/02-security-privacy.md`)                                                                                                                                 | Code validated            | MVP     |
| JNY-ZS-051.3 | Code validated                                                                           | Ahmed           | Sets his authentication secret (a code or password); an e-mail address is offered as an option and never required (INV-ZS-044); two-factor authentication is not required for a parent                                                                                                          | Secret set                | MVP     |
| JNY-ZS-051.4 | Secret set                                                                               | Ahmed           | Reviews a consents screen: information notices, legal guardians' consent for minors, a channel choice (WhatsApp "utility" consent gathered from MVP for attendance notifications, ADR-ZS-056 (ARB-25c)); every consent is logged (`spec/cross-cutting/07-legal-compliance-data-protection.md`)  | Consents logged           | MVP     |
| JNY-ZS-051.5 | Consents logged                                                                          | System          | Activates the account, carried by Ahmed's single global identity; no account is ever shared between two people (INV-ZS-030, INV-ZS-063)                                                                                                                                                         | Account active            | MVP     |

**Variants and error states**: an expired or wrong code (limited resends, a clear message); a number already holding an account (linked to the existing account, never a duplicate, ADR-ZS-050); a foreign number from an expat parent accepted in international format, SMS via an international gateway as a fallback (ADR-ZS-048); a household's second guardian sharing the same mobile: a generated login identifier, the household number declared a shared contact (ADR-ZS-048); a forgotten secret (reset by OTP on the same number, tracked); a number change, loss, or recycling: JNY-ZS-061.

**Mobile and small-screen points.** A single-column onboarding flow with large touch targets and a numeric OTP keypad; the invitation link opens directly into the PWA with no app-store detour; every step tolerates a connection drop and resumes from the last confirmed screen.

**Acceptance criteria**: `@REQ-ZS-336` (`features/journeys/par/jny-zs-051-creating-an-account-by-phone.feature`).

### JNY-ZS-052 — Being linked to his three children: invitations and claiming

| Attribute        | Value                                                                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Objective        | Link Ahmed's single account to Youssef and Sara (School A, guardian matching by mobile number) and to Adam (School B, an invitation code with a knowledge challenge), with qualities verified on each relationship |
| Actors           | Ahmed; school secretariats (issuing, validation); platform (matching, event `IdentityClaimed`)                                                                                                                     |
| Map journey      | JMP-ZS-004                                                                                                                                                                                                         |
| Modules involved | ADM, INS                                                                                                                                                                                                           |
| Needs covered    | URS-ZS-034                                                                                                                                                                                                         |
| Data             | `Person`, `StudentProfile`, `ParentStudentRelationship` (`spec/domain-model.md`)                                                                                                                                   |
| Version          | MVP (Massar matching, invitations, and claim)                                                                                                                                                                      |
| Baseline         | (→ INV-ZS-055, INV-ZS-057, INV-ZS-063, INV-ZS-064, INV-ZS-066, ADR-ZS-014, ADR-ZS-015, INV-ZS-006, INV-ZS-005, INV-ZS-028, INV-ZS-030)                                                                             |

**Steps.**

| No.          | Starting condition                                                                          | Actor  | Action                                                                                                                                                                                                                                 | Expected outcome                                                                       | Version |
| ------------ | ------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------- |
| JNY-ZS-052.1 | First sign-in after schools' imports and enrollments                                        | System | Lists children already linked by strong guardian matching on Ahmed's mobile number (ADR-ZS-050); Massar code only matches student profiles (INV-ZS-055, INV-ZS-006, INV-ZS-005)                                                        | Youssef and Sara appear linked                                                         | MVP     |
| JNY-ZS-052.2 | Adam has no Massar code (preschool)                                                         | Ahmed  | Opens School B's invitation link or enters the code, then enters Adam's date of birth as a knowledge challenge (never displayed, ADR-ZS-049 (ARB-08d))                                                                                 | Claim confirmed if the challenge matches; event `IdentityClaimed` notified to School B | MVP     |
| JNY-ZS-052.3 | Only a weak match applies (first name, last name, date of birth, a guardian's phone number) | System | Sends a probable-duplicate alert to the school; no automatic linking (INV-ZS-005, INV-ZS-006)                                                                                                                                          | The secretariat decides                                                                | MVP     |
| JNY-ZS-052.4 | Relationships active                                                                        | Ahmed  | Checks his qualities on each relationship: father, legal guardian, financially responsible, emergency contact (INV-ZS-064, INV-ZS-066, INV-ZS-028); errors corrected with the school, the operational arbiter (INV-ZS-057, INV-ZS-068) | Qualities confirmed or corrected, historized                                           | MVP     |
| JNY-ZS-052.5 | Qualities confirmed                                                                         | System | Applies default rights at both schools: viewing school information, communicating, authorizing outings, paying fees (INV-ZS-065, INV-ZS-027, INV-ZS-067); no enrollment is created by linking                                          | Relationships active, no enrollment created                                            | MVP     |

**Variants**: Ahmed declares a child himself from his account (a provisional profile the school links at enrollment, BEH-ZS-045, ADR-ZS-050); a third-party guardian added later by the school with her own qualities (INV-ZS-063); a third-party payer linked with no school right (ADR-ZS-055); a parent restricted by a recorded court ruling (INV-ZS-065); an invitation received by a third party due to a wrong number (the knowledge challenge fails, School B revokes the claim, ADR-ZS-049).

**Mobile and small-screen points.** The child-linking screen is a simple list with one "Claim" action per pending invitation; the knowledge-challenge field is never pre-filled or auto-suggested; claim status (pending, active, locked) shown with a single badge.

**Acceptance criteria**: `@REQ-ZS-337` (`features/journeys/par/jny-zs-052-being-linked-to-his-children.feature`).

### JNY-ZS-053 — Living the multi-child, multi-school dashboard day to day

| Attribute        | Value                                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objective        | Bring Youssef, Sara (School A), and Adam (School B) together in a single app and a single view, switching from one child to another in one action with no reconnection |
| Actors           | Ahmed; both schools (data producers)                                                                                                                                   |
| Map journey      | JMP-ZS-004, JMP-ZS-011                                                                                                                                                 |
| Modules involved | RAP (`spec/behaviors/11-dashboards-reporting.md`)                                                                                                                      |
| Needs covered    | URS-ZS-034, URS-ZS-037                                                                                                                                                 |
| Data             | `Person`, `ParentStudentRelationship`, aggregated read views (`spec/domain-model.md`)                                                                                  |
| Version          | MVP (multi-child, multi-school parent dashboards)                                                                                                                      |
| Baseline         | (→ INV-ZS-053, INV-ZS-065, INV-ZS-086 (INV-ZS §"profile"), ADR-ZS-021, ADR-ZS-015, INV-ZS-032, INV-ZS-040)                                                             |

**Steps.**

| No.          | Starting condition                        | Actor  | Action                                                                                                                                                                                                                                                  | Expected outcome                                                                    | Version |
| ------------ | ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------- |
| JNY-ZS-053.1 | Ahmed opens the app                       | System | Shows a permanent "My children" header with one card per child (photo, first name, level and class, a school marker); each card carries badges: today's absence, a payment due, a report card or grade available, an unread message, a document to sign | Dashboard rendered                                                                  | MVP     |
| JNY-ZS-053.2 | A badge draws attention (e.g. an absence) | Ahmed  | Taps the card                                                                                                                                                                                                                                           | The relevant screen opens directly (e.g. JNY-ZS-054)                                | MVP     |
| JNY-ZS-053.3 | Dashboard open                            | Ahmed  | Reads the merged chronological "Today" feed crossing both schools' announcements and the three children's events, timestamped and bilingual                                                                                                             | Cross-school feed displayed                                                         | MVP     |
| JNY-ZS-053.4 | Viewing one child's data                  | Ahmed  | Switches to another child by tapping a card, with no re-sign-in                                                                                                                                                                                         | Displayed data changes tenant, never account; the last-viewed context is remembered | MVP     |
| JNY-ZS-053.5 | Evening use                               | Ahmed  | Checks the "Finances" zone: the total due across all schools and the detail per child, with direct access to payment (JNY-ZS-056)                                                                                                                       | Consolidated finance view shown                                                     | MVP     |

**Safeguards**: aggregation is lawful because global entities are reachable only through an active relationship, and every operational data item stays isolated by tenant with server-side control (INV-ZS-032, INV-ZS-040); Ahmed never sees another child's, another class's, or another family's data (INV-ZS-091 transposed to the parent scope); sensitive-data views are logged (INV-ZS-090). If Ahmed held a second profile (e.g. a teacher at another school), a profile-school context switcher would appear (INV-ZS-053; handled by `spec/cross-cutting/01-permissions.md`).

**Mobile and small-screen points.** Child cards scroll horizontally on narrow screens; the feed and "Finances" zone stack vertically below; switching children never triggers a full page reload.

**Acceptance criteria**: `@REQ-ZS-338` (`features/journeys/par/jny-zs-053-multi-child-multi-school-dashboard.feature`).

### JNY-ZS-054 — Reacting to an absence: notification then an excuse

| Attribute        | Value                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Objective        | Notify Ahmed of an absence within five minutes of roll-call validation, then let him submit and track an excuse from his mobile           |
| Actors           | Ahmed; School A's teacher then student life (roll call, validation); platform (notification routing)                                      |
| Map journey      | JMP-ZS-005                                                                                                                                |
| Modules involved | VSC (`spec/behaviors/04-attendance-student-life-discipline.md`)                                                                           |
| Needs covered    | URS-ZS-035, URS-ZS-038                                                                                                                    |
| Data             | `Absence`, `Justification`, `Notification` (`spec/domain-model.md`)                                                                       |
| Version          | MVP (in-app, SMS, and WhatsApp "utility" attendance notification, grouping and correction notice, excuse); V1 (general push and WhatsApp) |
| Baseline         | (→ ADR-ZS-023, ADR-ZS-036, INV-ZS-065, INV-ZS-090, BEH-ZS-105)                                                                            |

**Steps.**

| No.          | Starting condition                                      | Actor                | Action                                                                                                                                                                                                                                                                                                                                                                                       | Expected outcome               | Version |
| ------------ | ------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------- |
| JNY-ZS-054.1 | Roll call validated for a session Sara missed           | System               | After a 3-minute hold window, notifies the day's first absence to active guardians (INV-ZS-064) within five minutes, in each recipient's language; later absences the same day are grouped into an evening summary; a roll-call correction after sending issues a correction notice (BEH-ZS-105). For preschool (Adam), the school's half-day summary default applies (ADR-ZS-056 (ARB-15f)) | Notification sent              | MVP     |
| JNY-ZS-054.2 | Notification received                                   | Ahmed                | Opens it; the absence screen shows the status "to be excused" and an "Excuse" button                                                                                                                                                                                                                                                                                                         | Excuse screen reached          | MVP     |
| JNY-ZS-054.3 | Excuse screen open                                      | Ahmed                | Chooses a reason from a list and attaches a photo of a supporting document (automatic compression, a size check)                                                                                                                                                                                                                                                                             | Reason and attachment prepared | MVP     |
| JNY-ZS-054.4 | Reason and attachment prepared                          | Ahmed, system        | Sends; the excuse moves to "submitted" (event `JustificationSubmitted`); School A's student life receives it in its processing queue. If Ahmed has no active account, student life can record the excuse on his behalf, marked "recorded by the school"                                                                                                                                      | Excuse submitted               | MVP     |
| JNY-ZS-054.5 | Excuse submitted                                        | Student life, system | Accepts or refuses; Ahmed receives the status (event `JustificationValidated`)                                                                                                                                                                                                                                                                                                               | History updated                | MVP     |
| JNY-ZS-054.6 | Repeated absences cross the school-configured threshold | System               | Notifies Ahmed (event `AbsenceThresholdReached`)                                                                                                                                                                                                                                                                                                                                             | Threshold notification sent    | MVP     |

**Variants and error states**: submitting during a network outage (the attachment and reason stay in a local queue and go out on reconnection, a visible "awaiting send" status); an unread notification (an SMS fallback reminder); an absence wrongly recorded (Ahmed contests from the absence screen, JNY-ZS-062); Ahmed not a legal guardian on a given relationship (sees the absence per his rights, INV-ZS-065).

**Mobile and small-screen points.** The excuse form is a single scrollable screen with a large camera-capture button; the "awaiting send" state is shown with a persistent, unobtrusive badge until the connection returns.

**Acceptance criteria**: `@REQ-ZS-339` (`features/journeys/par/jny-zs-054-reacting-to-an-absence.feature`).

### JNY-ZS-055 — Viewing grades and report cards from both schools with the same gestures

| Attribute        | Value                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objective        | Let Ahmed view Youssef's and Sara's grades, averages, and report cards, and Adam's period summary, with identical navigation regardless of school |
| Actors           | Ahmed; School A and School B (publication); teachers (upstream entry)                                                                             |
| Map journey      | JMP-ZS-006                                                                                                                                        |
| Modules involved | EVA (`spec/behaviors/05-assessments-grades-report-cards.md`)                                                                                      |
| Needs covered    | URS-ZS-035                                                                                                                                        |
| Data             | `Assessment`, `Grade`, `ReportCard` (`spec/domain-model.md`)                                                                                      |
| Version          | MVP (progressively published grades, bilingual report cards); V1 (verification QR code)                                                           |
| Baseline         | (→ INV-ZS-080, INV-ZS-081, INV-ZS-085, ADR-ZS-020, ADR-ZS-021, INV-ZS-033, INV-ZS-015)                                                            |

**Steps.**

| No.          | Starting condition                        | Actor         | Action                                                                                                                                                               | Expected outcome                    | Version |
| ------------ | ----------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------- |
| JNY-ZS-055.1 | School A enables progressive publication  | System        | Shows Youssef's grades as soon as an assessment is published ("published" mark status); at semester end, sends a `ReportCardPublished` notification with a deep link | Report card notification received   | MVP     |
| JNY-ZS-055.2 | Notification opened                       | Ahmed         | Views averages by subject, a general weighted average, rank, honors, remarks; downloads a bilingual PDF                                                              | Report card viewed/downloaded       | MVP     |
| JNY-ZS-055.3 | Report card viewed                        | System        | Fixes version, fingerprint, signatory, date (INV-ZS-085, INV-ZS-015); a school correction publishes a new version, the old one stays viewable marked "superseded"    | Version integrity preserved         | MVP     |
| JNY-ZS-055.4 | Viewing Sara's data (Grade 3, School A)   | Ahmed         | Applies the identical gesture as for Youssef                                                                                                                         | Same tabs, same screens             | MVP     |
| JNY-ZS-055.5 | Viewing Adam's data (preschool, School B) | System        | Shows no graded data exists; if School B publishes a preschool period summary, the same viewing gesture applies                                                      | Period summary or empty state shown | MVP     |
| JNY-ZS-055.6 | A printed report card in hand             | A third party | Scans the verification QR code                                                                                                                                       | Authenticity confirmed              | V1      |

**Safeguards**: Ahmed only sees published data; unpublished grades, drafts, deliberations, and internal remarks are never visible (INV-ZS-081, INV-ZS-034); read access to published documents is permanent, even after a possible departure from the school (INV-ZS-080, INV-ZS-033).

**Mobile and small-screen points.** Subject averages render as a compact scrollable list, not a dense table; the PDF download opens in the device's own viewer rather than an in-app renderer on low-memory devices.

**Acceptance criteria**: `@REQ-ZS-340` (`features/journeys/par/jny-zs-055-viewing-report-cards-from-two-schools.feature`).

### JNY-ZS-056 — Paying fees via Fatourati and tracking the balance

| Attribute        | Value                                                                                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objective        | Let Ahmed view each child's payment schedule and balance, get a creditor reference and QR code, and pay through any Fatourati channel, with automatic reconciliation and the school as sole creditor |
| Actors           | Ahmed (payer); School A and School B (separate creditors); banks, payment institutions, cash agents (the Fatourati rail); ZSchool (technical connection only)                                        |
| Map journey      | JMP-ZS-008                                                                                                                                                                                           |
| Modules involved | FIN (`spec/behaviors/07-finance-billing-collections.md`)                                                                                                                                             |
| Needs covered    | URS-ZS-036, URS-ZS-040                                                                                                                                                                               |
| Data             | `Installment`, `FeeSchedule`, `Payment` (`spec/domain-model.md`)                                                                                                                                     |
| Version          | V1 (ADR-ZS-031, overriding an earlier "later version" baseline reading — see `spec/journeys/00-journey-map.md`); a stored card and direct debit in V2                                                |
| Baseline         | (→ ADR-ZS-024, ADR-ZS-009, ADR-ZS-031, INV-ZS-017, `spec/appendices/01-review-history.md` H-09/H-19)                                                                                                 |

**Steps.**

| No.          | Starting condition                 | Actor  | Action                                                                                                                                                                       | Expected outcome                | Version |
| ------------ | ---------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------- |
| JNY-ZS-056.1 | Ahmed opens "Finances" for Youssef | System | Shows the year's payment schedule, status per installment, fee nature, remaining balance; amounts fixed by the year's parent contract (no mid-year increase, INV-ZS-017)     | Schedule and balance shown      | V1      |
| JNY-ZS-056.2 | An installment selected            | Ahmed  | Taps "Pay via Fatourati"; the screen shows the creditor reference, a QR code, and the amount due, with a note that ZSchool holds no funds                                    | Payment reference obtained      | V1      |
| JNY-ZS-056.3 | Reference obtained                 | Ahmed  | Pays through a channel of choice (banking app, ATM, mobile wallet, bank branch, cash agent); enters the reference or scans the QR code; the amount is confirmed in real time | Payment made                    | V1      |
| JNY-ZS-056.4 | Payment confirmed by the network   | System | Records the `PaymentReceived` event, updates the installments and balance, notifies Ahmed; daily reconciliation rejects duplicates                                           | Balance updated                 | V1      |
| JNY-ZS-056.5 | Payment recorded                   | System | Sends a bilingual status notification with the receipt accessible (JNY-ZS-057)                                                                                               | Confirmation received           | V1      |
| JNY-ZS-056.6 | Paying for Adam (School B)         | System | Uses a separate creditor reference specific to School B; no payment covers two schools                                                                                       | School balances remain isolated | V1      |

**Variants**: payment by a third party using the same reference; a split between two payers if the financially responsible parent differs; cash, cheque, and transfer stay available at the front desk (core MVP finance, JMP-ZS-007); V2 card payment with a stored card.

**Mobile and small-screen points.** The QR code renders large enough to scan directly from the phone screen at a cash agent; the reference number is copy-pasteable with one tap for banking-app entry.

**Acceptance criteria**: `@REQ-ZS-341` (`features/journeys/par/jny-zs-056-paying-fees-via-fatourati.feature`).

### JNY-ZS-057 — Receiving a receipt and a reminder

| Attribute        | Value                                                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objective        | Give Ahmed a numbered receipt for every payment, and a graduated bilingual reminder for every unpaid installment that never blocks official documents |
| Actors           | Ahmed; the school's secretary-cashier and accounting; the platform (automatic reminders)                                                              |
| Map journey      | JMP-ZS-007, JMP-ZS-008                                                                                                                                |
| Modules involved | FIN                                                                                                                                                   |
| Needs covered    | URS-ZS-036                                                                                                                                            |
| Data             | `Receipt`, `Installment`, `Notification` (`spec/domain-model.md`)                                                                                     |
| Version          | MVP (sequentially numbered receipt, family receipt, arrears, reminders); V1 (WhatsApp)                                                                |
| Baseline         | (→ ADR-ZS-005, INV-ZS-016, INV-ZS-017)                                                                                                                |

**Steps.**

| No.          | Starting condition                        | Actor  | Action                                                                                                                                                                                                                                                | Expected outcome               | Version                  |
| ------------ | ----------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------ |
| JNY-ZS-057.1 | A Fatourati or front-desk payment made    | System | Generates a receipt with the school's sequential, tamper-proof number (INV-ZS-017)                                                                                                                                                                    | Receipt generated              | MVP                      |
| JNY-ZS-057.2 | Receipt generated                         | System | Sends the bilingual PDF (school, student(s), installments, amount, method, date — a family receipt when Ahmed pays for two children at once) to Ahmed; keeps it downloadable in the "Finances" history                                                | Receipt delivered and archived | MVP                      |
| JNY-ZS-057.3 | November's installment unpaid at due date | System | Arms the reminder plan configured by School A (`InstallmentOverdue` event)                                                                                                                                                                            | Reminder plan armed            | MVP                      |
| JNY-ZS-057.4 | Each configured tier reached              | System | Issues a graduated message in Ahmed's language (`ReminderSent`) within allowed sending windows, stating the amount due and how to pay. If Ahmed replies "STOP," only reminders and announcements stop; attendance and security notifications continue | Reminder delivered             | MVP (SMS); V1 (WhatsApp) |
| JNY-ZS-057.5 | A reminder outstanding                    | System | Shows an informational alert on the record; never blocks generating official documents (ADR-ZS-005, INV-ZS-016)                                                                                                                                       | Documents remain issuable      | MVP                      |
| JNY-ZS-057.6 | Installment settled                       | System | Sends payment confirmation; reminders stop; the history keeps a trace of the tiers issued                                                                                                                                                             | Reminders stopped              | MVP                      |

**Mobile and small-screen points.** The receipt PDF is generated for print-at-home or screen display alike; reminder messages carry a one-tap deep link straight into JNY-ZS-056.

**Acceptance criteria**: `@REQ-ZS-342` (`features/journeys/par/jny-zs-057-receipt-and-reminder.feature`).

### JNY-ZS-058 — Messaging a teacher in a moderated thread

| Attribute        | Value                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Objective        | Let Ahmed reply within a moderated thread a teacher opens about Youssef, with school leadership able to view threads and this disclosed to users |
| Actors           | Ahmed; the teacher (opens the thread); School A's leadership (viewing, configuration)                                                            |
| Map journey      | JMP-ZS-011                                                                                                                                       |
| Modules involved | COM (`spec/behaviors/08-communication-notifications.md`)                                                                                         |
| Needs covered    | URS-ZS-041                                                                                                                                       |
| Data             | `MessageThread`, `Message` (`spec/domain-model.md`)                                                                                              |
| Version          | MVP (moderated in-app threads, in-app and SMS notification); V1 (push, WhatsApp)                                                                 |
| Baseline         | (→ ADR-ZS-023, ADR-ZS-034, INV-ZS-090)                                                                                                           |

**Steps.**

| No.          | Starting condition                                | Actor  | Action                                                                                                                                         | Expected outcome                      | Version |
| ------------ | ------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------- |
| JNY-ZS-058.1 | The teacher opens a contextualized thread         | System | Notifies Ahmed, identifying the sender, the child, and the subject                                                                             | Notification received                 | MVP     |
| JNY-ZS-058.2 | Thread opened                                     | Ahmed  | Sees the permanent notice "exchanges may be viewed by the school's leadership" (ADR-ZS-034)                                                    | Notice acknowledged                   | MVP     |
| JNY-ZS-058.3 | Notice seen                                       | Ahmed  | Replies in the thread, in French or Arabic; no personal number is exposed; the full history stays viewable on both sides, tracked (INV-ZS-090) | Reply sent                            | MVP     |
| JNY-ZS-058.4 | School A has not enabled parent-initiated threads | System | Hides the "New message" button with an explanation and an alternative (the homeroom teacher or the secretariat)                                | Alternative offered                   | MVP     |
| JNY-ZS-058.5 | School A enables parent-initiated threads         | Ahmed  | Opens a thread with Youssef's homeroom teacher                                                                                                 | Thread opened, moderated the same way | MVP     |

**Variants**: an official summons follows the summons journey (read-tracked notification), not the informal thread; attachments are limited to simple document formats, filtered on the school side.

**Mobile and small-screen points.** The thread view is a standard chat layout with the leadership-visibility notice pinned above the composer at all times, never scrolled out of view.

**Acceptance criteria**: `@REQ-ZS-343` (`features/journeys/par/jny-zs-058-moderated-parent-teacher-messaging.feature`).

### JNY-ZS-059 — Signing an electronic departure authorization

| Attribute        | Value                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Objective        | Let Ahmed view and electronically sign (or revoke) a school-published outing authorization for Youssef, with the school tracking response status |
| Actors           | Ahmed and any other guardian (an individual signature); the organizing teacher and School A's leadership (publication, tracking)                 |
| Map journey      | JMP-ZS-011                                                                                                                                       |
| Modules involved | COM                                                                                                                                              |
| Needs covered    | URS-ZS-039                                                                                                                                       |
| Data             | `Event`, `ParentAuthorization` (`spec/domain-model.md`)                                                                                          |
| Version          | V1                                                                                                                                               |
| Baseline         | (→ INV-ZS-064, INV-ZS-065, INV-ZS-067, INV-ZS-090)                                                                                               |

**Steps.**

| No.          | Starting condition                                                                  | Actor         | Action                                                                                                                                                        | Expected outcome                             | Version |
| ------------ | ----------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------- |
| JNY-ZS-059.1 | School A publishes an outing (date, supervision, transport, instructions, deadline) | System        | Notifies Ahmed with a deep link                                                                                                                               | Notification received                        | V1      |
| JNY-ZS-059.2 | Notification opened                                                                 | Ahmed         | Views the details and the signing zone, along with the request's status                                                                                       | Details reviewed                             | V1      |
| JNY-ZS-059.3 | Ready to respond                                                                    | Ahmed         | Signs electronically: authenticated by his account, identified by name, timestamped                                                                           | Signature recorded, logged                   | V1      |
| JNY-ZS-059.4 | Multiple guardians on the relationship                                              | Each guardian | Signs from their own account (INV-ZS-063, INV-ZS-064); the school sees who is authorized and unresponded and triggers automatic reminders before the deadline | Response tracking complete                   | V1      |
| JNY-ZS-059.5 | Before the deadline                                                                 | Ahmed         | Can revoke his authorization                                                                                                                                  | Revocation logged and notified to the school | V1      |

**Safeguards**: electronic signature relies on a single-person account (INV-ZS-030); every action (signing, revocation) is logged with author, context, and timestamp (INV-ZS-090).

**Mobile and small-screen points.** Signing is a single tap after reviewing the outing details, no separate app or redirect; the revoke action stays reachable from the same screen until the deadline passes.

**Acceptance criteria**: `@REQ-ZS-344` (`features/journeys/par/jny-zs-059-electronic-departure-authorization.feature`).

### JNY-ZS-060 — Getting a self-service certificate

| Attribute        | Value                                                                                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objective        | Let Ahmed download, with no front-desk trip, documents School A authorizes for self-service, bilingual, numbered, sealed, timestamped, and QR-verifiable, never blocked by arrears |
| Actors           | Ahmed (request); School A (configuring authorized documents, the signatory); secretariat (front-desk-reserved documents); a third-party verifier                                   |
| Map journey      | JMP-ZS-010                                                                                                                                                                         |
| Modules involved | DOC (`spec/behaviors/06-documents-certificates.md`)                                                                                                                                |
| Needs covered    | URS-ZS-036, URS-ZS-039                                                                                                                                                             |
| Data             | `Certificate`, `AuditLog` (`spec/domain-model.md`)                                                                                                                                 |
| Version          | V1 (self-service, verification QR code, advanced seal, timestamp); MVP equivalent at the front desk (JNY-ZS-014 of `spec/journeys/02-secretary-cashier.md`)                        |
| Baseline         | (→ INV-ZS-066, INV-ZS-080, INV-ZS-085, ADR-ZS-005, ADR-ZS-011, INV-ZS-033, INV-ZS-016)                                                                                             |

**Steps.**

| No.          | Starting condition                                                      | Actor         | Action                                                                                                                              | Expected outcome                                                                                                                                                                   | Version |
| ------------ | ----------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| JNY-ZS-060.1 | Ahmed opens Sara's "Documents" tab                                      | System        | Lists the documents School A allows self-service; any legal guardian or holder of custody has access                                | Available documents shown                                                                                                                                                          | V1      |
| JNY-ZS-060.2 | Document chosen                                                         | Ahmed         | Confirms the request                                                                                                                | On-demand generation: bilingual, sequential numbering, the school's advanced electronic seal, a timestamp, a verification QR code; `DocumentGenerated` event notifies availability | V1      |
| JNY-ZS-060.3 | Document available                                                      | Ahmed         | Downloads the PDF                                                                                                                   | Document downloaded                                                                                                                                                                | V1      |
| JNY-ZS-060.4 | Printed document in hand                                                | A third party | Scans the QR code                                                                                                                   | Authenticity confirmed                                                                                                                                                             | V1      |
| JNY-ZS-060.5 | Arrears exist on the record                                             | System        | Shows an informational alert and the account statement alongside the document; generation is never blocked (ADR-ZS-005, INV-ZS-016) | Document still issued                                                                                                                                                              | V1      |
| JNY-ZS-060.6 | A front-desk-reserved document requested (e.g. the leaving certificate) | System        | Points Ahmed to the secretariat instead of self-service                                                                             | Request redirected                                                                                                                                                                 | V1      |

**Mobile and small-screen points.** The document list uses plain-language names, not internal codes; download completes to the device's own file storage so it survives an app restart.

**Acceptance criteria**: `@REQ-ZS-345` (`features/journeys/par/jny-zs-060-self-service-certificate.feature`).

### JNY-ZS-061 — Changing a number, recovering access, a recycled number

| Attribute        | Value                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objective        | Keep Ahmed's account his own and his access working through a mobile-number change, a lost phone, or an operator-recycled old number, with no duplicate ever created |
| Actors           | Ahmed; a school's secretariat and leadership with an active relationship (front-desk verification); the platform (double OTP, a knowledge challenge, alerts)         |
| Map journey      | JMP-ZS-004                                                                                                                                                           |
| Modules involved | ADM                                                                                                                                                                  |
| Needs covered    | URS-ZS-034, URS-ZS-042                                                                                                                                               |
| Data             | `Person`, `AuditLog` (`spec/domain-model.md`)                                                                                                                        |
| Version          | MVP                                                                                                                                                                  |
| Baseline         | (→ ADR-ZS-022, INV-ZS-090, INV-ZS-030, INV-ZS-044, BEH-ZS-020, SEC-ZS-003, SEC-ZS-004, ADR-ZS-049)                                                                   |

**Steps.**

| No.          | Starting condition                                                               | Actor  | Action                                                                                                                                                                     | Expected outcome                                                                  | Version |
| ------------ | -------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------- |
| JNY-ZS-061.1 | Ahmed has access to both his old and new numbers                                 | Ahmed  | Enters the new number from "My account"; validates an OTP sent to the old number and another to the new one                                                                | Login identifier switched; both schools notified; operation historized            | MVP     |
| JNY-ZS-061.2 | The old number is unreachable (a lost phone, a cancelled line)                   | Ahmed  | Goes to a school's front desk; the secretary verifies his identity (first name, last name, date of birth, linked children) and enters the new number; leadership validates | Access recovery started; other school notified                                    | MVP     |
| JNY-ZS-061.3 | An OTP finalizes at the new number                                               | System | Confirms access                                                                                                                                                            | Access recovered                                                                  | MVP     |
| JNY-ZS-061.4 | No sign-in for six months, or repeated OTP failures (a possibly recycled number) | System | Requires a knowledge challenge (a linked child's date of birth, never displayed) before any access                                                                         | Challenge passed, or account locked after three failures and both schools alerted | MVP     |
| JNY-ZS-061.5 | A device is lost                                                                 | Ahmed  | Revokes open sessions on that device from "My devices"                                                                                                                     | Sessions revoked; a new-device notification sent on remaining channels            | MVP     |

**Safeguards**: none of these operations creates a second account: one account, one person (INV-ZS-030).

**Mobile and small-screen points.** The "My devices" list shows device type and last-active time in plain language, with a one-tap revoke; the front-desk recovery path is explained in-app before Ahmed leaves home.

**Acceptance criteria**: `@REQ-ZS-346` (`features/journeys/par/jny-zs-061-number-change-and-access-recovery.feature`).

### JNY-ZS-062 — Contesting a wrongly recorded grade or absence

| Attribute        | Value                                                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objective        | Let Ahmed contest an absence recorded while Youssef was present, or a grade that doesn't match the paper record, and track the correction, which stays school-tracked throughout |
| Actors           | Ahmed (or Youssef from his own student access); the course's teacher or student life (correction); leadership (post-closing correction, a new version)                           |
| Map journey      | JMP-ZS-005, JMP-ZS-006                                                                                                                                                           |
| Modules involved | VSC, EVA                                                                                                                                                                         |
| Needs covered    | URS-ZS-035, URS-ZS-043                                                                                                                                                           |
| Data             | `Absence`, `Grade`, `ReportCard` (`spec/domain-model.md`)                                                                                                                        |
| Version          | MVP (moderated in-app threads, an absence correction notice, a tracked grade correction, a new report-card version)                                                              |
| Baseline         | (→ INV-ZS-085, INV-ZS-090, ADR-ZS-034, INV-ZS-015, BEH-ZS-105, BEH-ZS-113)                                                                                                       |

**Steps.**

| No.          | Starting condition                                              | Actor        | Action                                                                                                                                                                                                                            | Expected outcome                                                                                              | Version |
| ------------ | --------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------- |
| JNY-ZS-062.1 | An absence Ahmed disputes                                       | Ahmed        | Chooses "Contest" from the absence screen with a reason; a moderated thread opens with School A's student life                                                                                                                    | Thread opened                                                                                                 | MVP     |
| JNY-ZS-062.2 | Student life reviews the contest                                | Student life | Corrects the roll call if warranted; a correction notice is sent on the original channel and the absence disappears from history, tracked; otherwise replies in the thread and the absence stands, still excusable per JNY-ZS-054 | Absence corrected or upheld, with a trace either way                                                          | MVP     |
| JNY-ZS-062.3 | A grade published progressively, before closing, Ahmed disputes | Ahmed        | Opens a moderated thread with the teacher                                                                                                                                                                                         | Thread opened                                                                                                 | MVP     |
| JNY-ZS-062.4 | Teacher reviews the contested grade                             | Teacher      | Corrects the grade with a trace (author, before/after value) or explains; the new value is republished                                                                                                                            | Grade corrected or explained                                                                                  | MVP     |
| JNY-ZS-062.5 | A grade after closing, or on a published report card            | Leadership   | Reviews and, if warranted, approves a correction                                                                                                                                                                                  | A new report-card version is created, the old one stays viewable marked "superseded" (INV-ZS-015, INV-ZS-085) | MVP     |

**Safeguards**: no contest changes data without a tracked school action; ZSchool does not decide.

**Mobile and small-screen points.** The "Contest" action is reachable directly from the absence or grade card, no separate menu; contest status (open, corrected, upheld) shows as a badge on that same card.

**Acceptance criteria**: `@REQ-ZS-347` (`features/journeys/par/jny-zs-062-contesting-a-grade-or-absence.feature`).

---

## 5. Rules observed across every journey

| Rule                                                                                              | Concrete effect for Ahmed                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One account per person, several profiles (INV-ZS-063, INV-ZS-030)                                 | Ahmed never shares an account; each of his children's guardians has their own.                                                                                                                 |
| The primary identifier is the mobile number (ADR-ZS-022, INV-ZS-044)                              | Sign-up, OTP, and access recovery work with no e-mail; a generated identifier covers a minor or a second guardian with no phone of their own (ADR-ZS-048); number change and loss: JNY-ZS-061. |
| Default access for legal guardians and the holder of custody (INV-ZS-064, INV-ZS-065, INV-ZS-027) | Ahmed is informed of everything by default; any restriction can only come from a court ruling recorded by the school.                                                                          |
| Distinct legal-tutor/custodian qualities (INV-ZS-066, INV-ZS-028)                                 | Ahmed, legal tutor and financially responsible parent, signs major acts (enrollment, transfer, leaving certificate).                                                                           |
| Isolation per school (INV-ZS-073, INV-ZS-032) with global read access per relationship            | Ahmed sees his three children from both schools in a single view; each piece of data stays isolated by tenant and server-controlled.                                                           |
| Permanent viewing of published documents (INV-ZS-080, INV-ZS-033)                                 | Report cards, transcripts, and published certificates stay accessible even after a school change.                                                                                              |
| No document blocking for unpaid fees (ADR-ZS-005, INV-ZS-016)                                     | Reminders and arrears alerts never prevent issuing official documents.                                                                                                                         |
| Logging (INV-ZS-090)                                                                              | Every write and every sensitive view is tracked with author, context, and timestamp.                                                                                                           |
| Bilingualism and RTL (ADR-ZS-021)                                                                 | Interface, notifications, and documents in French and Arabic, with right-to-left support.                                                                                                      |
| Parents pay nothing (ADR-ZS-024)                                                                  | Ahmed is never billed by the platform; notification costs are the school's consumables (ADR-ZS-009).                                                                                           |

---

## 6. Open questions

Open questions for this journey (the Fatourati reference grain, reconciliation-window display states, self-service document scope, and three others, six in total) are consolidated in `spec/open-questions.md` (built in a later migration phase), not tracked locally in this file.

---

## Traceability

Full cross-reference coverage for this journey is consolidated in `spec/traceability.md` (built in a later migration phase).
