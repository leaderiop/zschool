> **Document Control**
>
> | Property       | Value                                                                                                                                                                                                                                                |
> | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-BEH-13                                                                                                                                                                                                                                       |
> | Revision       | 1.0                                                                                                                                                                                                                                                  |
> | Effective Date | 2026-09-09                                                                                                                                                                                                                                           |
> | Status         | Draft                                                                                                                                                                                                                                                |
> | Author         | ZSchool Product                                                                                                                                                                                                                                      |
> | Classification | Functional Specification — Directional (V2+)                                                                                                                                                                                                         |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/modules/22-ancillary-services-transport-canteen-activities.md` (v0.3), old `FR-SAN-01..13` -> `BEH-ZS-281..293`, old `ECR-SAN-01..06` -> `SCR-ZS-151..156`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# Ancillary Services (SAN) — Transport, Canteen and Childcare, Extracurricular Activities, Library, Uniforms and Supplies

**Nature of this chapter.** The SAN module is a "future scope" module: the historical baseline (`spec/appendices/00-project-baseline.md` §7.13) explicitly places it in a later version, and the version-by-version scope puts it in "V2 and beyond" (§12, [ADR-ZS-026](../decisions/026-mvp-v1-v2-scope-breakdown.md)). This chapter therefore sets **directional requirements**: it describes the expected observable behaviors and their interactions with existing modules (finance, communication, attendance), with no design specification. Dedicated entities (routes, stops, check-ins, menus, activities, loans, sales) are not defined here: adding them to `spec/domain-model.md` will happen at V2+ design time (see OQ-ZS-167 in `spec/open-questions.md`). Every requirement carries the tag **V2+**.

## 1. Objective and scope

**Objective.** Building on the identity/enrollment foundation already in place, cover the ancillary services that nearly every Moroccan private school bills on top of tuition: school transport, canteen and childcare, extracurricular activities and outings, a library, and the sale of uniforms and supplies. These services share a common core: a school-specific catalog, a subscription or purchase tied to the enrollment, centralized billing in the finance module, operational check-in on mobile, and parent notification through existing channels.

**Scope included (V2+, directional):**

| Domain                 | Included                                                                                                                                                   | Excluded (reference)                                                                                                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transport              | Routes, stops, zones, per-zone or per-route subscriptions, transport staff, boarding/drop-off check-in, parent notification, optional geolocation          | Non-school fleet management, billing a third-party carrier (see OQ-ZS-163), dual enrollment and external activities ([ADR-ZS-002](../decisions/002-single-active-enrollment-per-year.md), `spec/behaviors/02-admissions-enrollment-reenrollment.md`) |
| Canteen and childcare  | Subscriptions (half-board, morning/evening childcare), bilingual menus, check-in of visits, billing via `spec/behaviors/07-finance-billing-collections.md` | Nutrition and health data (see `spec/behaviors/14-health-sensitive-data.md`, V2+ HEA)                                                                                                                                                                |
| Activities and outings | Activity catalog, enrollment with quotas and a waiting list, one-off payments, electronic parental authorizations                                          | E-learning and online homework (V2+, PED module)                                                                                                                                                                                                     |
| Library                | A simple catalog, loans, returns, overdue reminders                                                                                                        | Acquisition-budget management, online reservations (outside this direction)                                                                                                                                                                          |
| Uniforms and supplies  | An article catalog, orders, collection, conforming billing per service nature                                                                              | Forced sales: forbidden by Law 59.21 (see §5, BEH-ZS-292)                                                                                                                                                                                            |

**Positioning by version.** Transport, canteen, and activities are explicitly listed in "V2 and beyond". Library, uniforms, and supplies are positioned as V2+ in the broad sense, their exact place in the roadmap still to be confirmed (see OQ-ZS-165). Per the historical baseline §11, the single plan includes every module "as it ships": SAN's availability for a tenant is controlled by module activation (`ModuleActivation`, `spec/domain-model.md`), with no paid per-module option ([ADR-ZS-009](../decisions/009-single-plan-pricing.md)). The described screens and journeys respect the persona matrix (`spec/urs.md`), where SAN parent views are prospective.

## 2. Users and use cases

| Actor                                                                 | Main use cases                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leadership                                                            | Configure their school's catalog (routes, price zones, offered services), decide the policy for services conditionable on payment ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)), enable or not geolocation, track service occupancy |
| Front office / cashier                                                | Sell subscriptions and articles, collect and bill via `spec/behaviors/07-finance-billing-collections.md`, enroll students in activities, reconcile a visit outside a subscription                                                                              |
| Student life staff (head supervisor, supervisors)                     | A daily view of transport and canteen, handling alerts (a student not present at the stop, access suspended), reconciliations                                                                                                                                  |
| Transport staff (driver, bus monitor)                                 | Boarding/drop-off check-in on mobile, including offline, route by route (a scope limited to their assignments, [INV-ZS-091](../invariants.md#inv-zs-091))                                                                                                      |
| Canteen staff, librarian                                              | Check-in of visits, menu management, book loans and returns                                                                                                                                                                                                    |
| Parent / guardian                                                     | Subscribe to a service or enroll their child in an activity from the portal, sign authorizations, follow their route and check-ins in real time, receive notifications, pay through existing rails                                                             |
| Student (per access level, [INV-ZS-051](../invariants.md#inv-zs-051)) | View their activities, current loans, and their due dates                                                                                                                                                                                                      |

## 3. Key journeys

The SAN module has no dedicated critical journey in the map: `spec/journeys/00-journey-map.md` explicitly classes transport, canteen, activities, and paid outings among journeys outside MVP, not to be reintroduced before their V2+ release. Existing journeys are nonetheless used upstream and downstream:

- **JMP-ZS-005** (morning attendance check and absence notification): checking a student's boarding on the bus completes the child's safety chain; a student not present at the stop is an alert of the same nature as a class absence.
- **JMP-ZS-007 / JMP-ZS-008** (collections and unpaid-balance reminders; online Fatourati payment): SAN subscriptions and sales become fee lines and receivables on the same financial account, using the same payment rails (Fatourati in V1, a registered card in V2, [ADR-ZS-031](../decisions/031-online-payment-rails.md)).
- **JMP-ZS-010** (self-service certificate): the "no blocking of official documents" principle ([ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)) prevails from MVP on; only non-mandatory SAN services are conditionable (BEH-ZS-293).
- **JMP-ZS-011** (communication): every SAN notification uses the communication module's channels and templates.

Persona needs used: [URS-ZS-039](../urs.md) (outing authorizations signed electronically) and [URS-ZS-040](../urs.md) (online payment, the school staying the creditor).

## 4. Functional behaviors

Every behavior in this module is **V2+**. Each entry has an "Inter-module impacts" note per the affected module (finance, communication, attendance).

| ID         | Title                                                                               | Priority |
| ---------- | ----------------------------------------------------------------------------------- | -------- |
| BEH-ZS-281 | Maintain the transport catalog: routes, stops, and student assignment               | Should   |
| BEH-ZS-282 | Sell transport subscriptions by zone or route, billed by the finance module         | Should   |
| BEH-ZS-283 | Check students on and off the bus on mobile, by the driver or the bus monitor       | Should   |
| BEH-ZS-284 | Notify parents at key route milestones                                              | Should   |
| BEH-ZS-285 | Track vehicle position as an option (geolocation)                                   | Could    |
| BEH-ZS-286 | Manage transport staff (drivers, bus monitors)                                      | Should   |
| BEH-ZS-287 | Manage canteen and childcare subscriptions and their billing via the finance module | Should   |
| BEH-ZS-288 | Publish menus and check canteen and childcare visits                                | Should   |
| BEH-ZS-289 | Manage the extracurricular-activity catalog and enrollments                         | Should   |
| BEH-ZS-290 | Collect payment for activities and outings and gather parental authorizations       | Should   |
| BEH-ZS-291 | Manage a library catalog with loans, returns, and overdues                          | Could    |
| BEH-ZS-292 | Sell uniforms and supplies with conforming billing                                  | Should   |
| BEH-ZS-293 | Apply the access policy for services conditionable on payment                       | Should   |

### BEH-ZS-281: Maintain the transport catalog: routes, stops, and student assignment

> **Invariant:** [INV-ZS-073](../invariants.md#inv-zs-073) (tenant isolation)
> **See:** [ADR-ZS-029](../decisions/029-academic-data-always-tied-to-enrollment.md)
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario at this directional level)

REQUIREMENT: The transport catalog MUST let the school create and maintain outbound/return
routes, ordered stops with reference times, price zones, vehicles and
capacities, and MUST let leadership assign each subscribed student to a route
and a to-school/from-school stop, alerting on capacity overage.

Data stays isolated per school and tied to the student's enrollment. Inter-module impacts — Data: `Enrollment` (transport option), `Calendar`/`Holiday` (days with no route). Finance: the price zone feeds the fee schedule. Attendance: the route feeds check-in lists (BEH-ZS-283).

### BEH-ZS-282: Sell transport subscriptions by zone or route, billed by the finance module

> **Invariant:** [INV-ZS-017](../invariants.md#inv-zs-017) (tamper-proof numbering, yearly rate lock)
> **See:** none
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-003`](../../features/san/fr-san-13-conditionable-service-access.feature) (indirectly, via the conditionable-access scenario)

REQUIREMENT: A transport subscription (yearly or monthly, by zone or by route) MUST
generate a fee line on the enrollment's schedule and integrate into the
finance module's monthly plan; an active enrollment's rate MUST be locked
for the year (Law 59.21) with no in-year increase; suspension and
cancellation MUST be logged and notified.

Inter-module impacts — Finance: `FeeSchedule`, `FeeItem` (transport), `Invoice`, `Installment`, `Dunning`. Communication: notification of subscription, suspension, or cancellation. Attendance: the subscription gates check-in lists.

### BEH-ZS-283: Check students on and off the bus on mobile, by the driver or the bus monitor

> **Invariant:** [INV-ZS-090](../invariants.md#inv-zs-090) (audit logging), [INV-ZS-091](../invariants.md#inv-zs-091) (least privilege)
> **See:** none
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-001`](../../features/san/fr-san-03-boarding-checkin-and-notification.feature), [`@REQ-ZS-002`](../../features/san/fr-san-03-student-not-present-at-stop.feature)

REQUIREMENT: Staff assigned to a route MUST get a per-stop check-in list (morning
boarding, drop-off at school, return boarding, drop-off at the stop) on
mobile, with statuses (boarded, not present at stop, dropped off) and a
counter of students on board; check-in MUST tolerate network outages, with
syncing and conflict resolution; each check-in MUST be time-stamped and
attributed to its author; a bus monitor MUST see only their assigned routes.

Inter-module impacts — Attendance: correlation with the day's absence (`AttendanceRecord`). Communication: each check-in may trigger a notification (BEH-ZS-284). Finance: none.

### BEH-ZS-284: Notify parents at key route milestones

> **Invariant:** [INV-ZS-064](../invariants.md#inv-zs-064), [INV-ZS-065](../invariants.md#inv-zs-065) (guardian notification rights)
> **See:** [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md), [ADR-ZS-062](../decisions/062-communication-rules-batch.md)
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-001`](../../features/san/fr-san-03-boarding-checkin-and-notification.feature), [`@REQ-ZS-002`](../../features/san/fr-san-03-student-not-present-at-stop.feature)

REQUIREMENT: The system MUST automatically send every legal guardian and the custodian
configurable milestone notifications (outbound-route departure, arrival at
school, return-route departure, arrival at the stop, no-show at the stop)
through the communication module's channel hierarchy (push first, WhatsApp
"utility" with opt-in, SMS as a fallback), in the recipient's preferred
language; safety notifications (no-show at the stop) MUST be exempt from
send-time windows and the "STOP" opt-out.

Inter-module impacts — Communication: `Notification`, `DeliveryLog` (costs charged to the school). Attendance: the "not present at stop" alert feeds student life's daily view. Finance: WhatsApp/SMS consumable budget (see OQ-ZS-166 in `spec/open-questions.md`).

### BEH-ZS-285: Track vehicle position as an option (geolocation)

> **Invariant:** none
> **See:** none
> **Priority:** Could
> **Version:** V2+
> **Acceptance:** none (disabled by default, pending compliance validation)

REQUIREMENT: Vehicle-position viewing MUST be offered only if the school explicitly
enables it, and only to parents subscribed to that route and to leadership;
activation MUST be conditioned on a prior compliance analysis (`spec/cross-
             cutting/07-legal-compliance-data-protection.md`: processing minors' location
data under Law 09.08 — CNDP filings, a legal basis, dedicated guardian
consent, a short retention period, a location provider listed among sub-
processors) and on logged access; absent that validation, the feature MUST
stay disabled.

Inter-module impacts — Communication: none (viewed in the portal). Data: a dedicated `ConsentGrant`. Finance: the location provider's cost to be budgeted (see `spec/cross-cutting/06-external-integrations.md`).

### BEH-ZS-286: Manage transport staff (drivers, bus monitors)

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario at this directional level)

REQUIREMENT: Transport staff affiliations and assignments MUST be managed through the
single affiliation entity (driver and bus-monitor roles), with route
assignments, dates, and statuses; access MUST be removed immediately when
the affiliation closes, while check-ins already produced stay attributed to
their author.

Inter-module impacts — Data: `SchoolMembership`. Attendance: check-in stays possible as long as the affiliation is active. Communication: none. Finance: none (payroll out of ZSchool's scope).

### BEH-ZS-287: Manage canteen and childcare subscriptions and their billing via the finance module

> **Invariant:** none
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario at this directional level)

REQUIREMENT: Meal-service (half-board, chosen days) and childcare (morning, evening)
subscriptions MUST be sold by period, consistent with the enrollment's
attendance regime, and billed monthly via the finance module (fee lines,
schedule, receipts); on an unpaid balance, access to the service MUST follow
only the school's conditionable-services policy (BEH-ZS-293); official
documents MUST never be affected.

Inter-module impacts — Finance: `FeeItem` (canteen, childcare), shared billing and reminders. Communication: subscription and suspension confirmation. Attendance: correlation between the day's absence and the expected visit (BEH-ZS-288).

### BEH-ZS-288: Publish menus and check canteen and childcare visits

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario at this directional level)

REQUIREMENT: Bilingual (FR/AR) weekly menus MUST be publishable and visible to parents
from the portal; staff MUST be able to check in visits (lunch, childcare),
mobile-first, filterable by subscription, regime, and class; a visit with no
active subscription MUST trigger a reconciliation signal; a student absent
for the day MUST have no expected visit.

Inter-module impacts — Attendance: `AttendanceRecord` (the day's absence). Communication: publishing the menu as a targeted announcement (optional). Finance: billable reconciliations.

### BEH-ZS-289: Manage the extracurricular-activity catalog and enrollments

> **Invariant:** none
> **See:** none
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-004`](../../features/san/fr-san-09-activity-enrollment-waitlist.feature)

REQUIREMENT: The school MUST be able to build an extracurricular-activity catalog per
period (time slot, instructor, an optional income-based fee scale, capacity)
and manage enrollments filed by the parent or at the front desk, validated
by the school; once the quota is reached, further requests MUST go to a
waiting list; withdrawal MUST be logged. Activity time slots sit outside the
timetable's course slots.

Inter-module impacts — Attendance: a per-session participant list. Finance: billing the activity (BEH-ZS-290). Communication: enrollment confirmation and freed-seat notification.

### BEH-ZS-290: Collect payment for activities and outings and gather parental authorizations

> **Invariant:** none
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md), [ADR-ZS-031](../decisions/031-online-payment-rails.md)
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario at this directional level)

REQUIREMENT: Activities and outings MUST be billable one-off through the finance module
(cash with a receipt, Fatourati from V1, registered card in V2), and every
outing MUST carry an electronic parental authorization signed by a legal
guardian or the adult student, archived on record, with a visible status
(authorized, not authorized, pending, paid, unpaid); making participation
conditional on payment MUST follow the conditionable-services policy
(BEH-ZS-293); no official document may ever be blocked.

Inter-module impacts — Finance: one-off fee lines, collections and receipts. Communication: `Event`, parental authorization, confirmation notification. Attendance: an attendance sheet for outing participants.

### BEH-ZS-291: Manage a library catalog with loans, returns, and overdues

> **Invariant:** [INV-ZS-051](../invariants.md#inv-zs-051) (access per level)
> **See:** none
> **Priority:** Could
> **Version:** V2+
> **Acceptance:** none (no dedicated scenario at this directional level)

REQUIREMENT: The library scope MUST stay deliberately minimal: a catalog of works and
copies, loans with a due date, returns, overdue reminders to the student
(per their access level) or to their guardians, and a per-class view of
current loans; no acquisition-budget management and no online reservation
belong in this direction.

Inter-module impacts — Communication: overdue reminders (existing channels). Finance: none by default (an optional fine is a school choice, billable as an ancillary fee). Attendance: none.

### BEH-ZS-292: Sell uniforms and supplies with conforming billing

> **Invariant:** [INV-ZS-017](../invariants.md#inv-zs-017) (tamper-proof numbering)
> **See:** none
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-005`](../../features/san/fr-san-12-uniform-sale-billing.feature)

REQUIREMENT: The school MUST be able to maintain an article catalog (uniforms with
sizes, supplies), take orders at the front desk or as pre-orders from
parents, and bill the sale through the finance module (collection with a
receipt, a conforming invoice with ICE/IF mentions and continuous
sequential numbering, tax treatment by service nature); the sale MUST stay
strictly optional — no forced order, no imposed supplier, and never a
condition of enrollment or re-enrollment.

Inter-module impacts — Finance: `FeeItem` (uniform, supplies), `CashSession`, `Invoice`, `Receipt`. Communication: making the invoice available to the parent. Attendance: none.

### BEH-ZS-293: Apply the access policy for services conditionable on payment

> **Invariant:** [INV-ZS-016](../invariants.md#inv-zs-016) (no blocking of official documents)
> **See:** [ADR-ZS-005](../decisions/005-no-document-blocking-for-unpaid-fees.md)
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-003`](../../features/san/fr-san-13-conditionable-service-access.feature)

REQUIREMENT: The school MAY condition on payment only non-mandatory ancillary services
(transport, canteen, childcare, activities, library, sales); when enabled
for a service, an unpaid balance MUST produce a status "access suspended per
the school's policy", visible to student life and operational staff at the
moment of service; the parent MUST see the arrears and account statement;
official documents (enrollment certificate, leaving certificate, report
cards, transcripts) MUST never be affected, at any version.

Inter-module impacts — Finance: an arrears alert, an account statement. Attendance: a visible signal at service points. Communication: suspension and restoration notification.

## 5. Morocco-specific considerations

1. **Taxation by service nature (CGI).** Pricing distinguishes service natures: tuition outside the scope of VAT; catering, transport, and school leisure services provided by the school to its own students are exempt with no deduction right (art. 91-V-4°); the same services provided by a third party and re-billed are taxable (transport 14%, reduced to 13% in 2025 then 10% from 01/2026; catering 10%); school supplies exempt with no deduction right (art. 91-E-4°, 2024 Finance Law, a list of 36 products). The uniform's tax regime is not covered by these references: to be confirmed before any billing (see OQ-ZS-164).
2. **Invoice and retention.** Mandatory mentions (identity, ICE, IF, continuous sequential numbering, payment method, VAT where applicable) and a ten-year accounting-retention period (CGI art. 145 and 211): the finance module (`spec/behaviors/07-finance-billing-collections.md`) carries the mechanics; SAN only adds line natures to it.
3. **Law 59.21.** Mandatory publicity of the fee list, including catering and transport (art. 49); a ban on forced sale of textbooks and supplies via the school or a designated bookstore; a ban on raising fees mid-year. These rules directly frame BEH-ZS-282, BEH-ZS-287, and BEH-ZS-292 ([INV-ZS-017](../invariants.md#inv-zs-017)).
4. **Time zone and hours.** Check-ins time-stamped in local time, stored in UTC. A definitive return to UTC+0 on 09/20/2026 at 02:00, with no seasonal alternation or Ramadan exception (decree no. 2.26.530; Official Gazette no. 7521 of 06/29/2026).
5. **Ramadan and moving holidays.** Route, childcare, and canteen hours follow the school's calendar variants (normal, Ramadan, exams; Hijri holidays to be confirmed by lunar observation): no service hour is hard-coded.
6. **Notification channels.** Push, WhatsApp "utility" (prior opt-in), SMS fallback hierarchy ([ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md)); the 10/01/2026 WhatsApp rate change (end of free service and utility messages within the 24-hour window, Morocco's exit from the "Rest of Africa" regional rates) also requires budgeting morning transport-notification volumes (see OQ-ZS-166).
7. **Payment rails.** Ancillary-service payments use existing rails: Fatourati (the school as creditor, ZSchool never holding funds), cash and cheques at the front desk, registered card in V2 ([ADR-ZS-031](../decisions/031-online-payment-rails.md)). YouCan Pay is excluded from references (it ceased operating in January 2024).

## 6. Data and events

**Existing entities used** (`spec/domain-model.md`):

| Entity                                                                                                                 | Use in SAN                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Enrollment`                                                                                                           | Carrying the transport/canteen option and tying every service to the enrollment                                                                        |
| `FeeSchedule`, `FeeItem`, `Invoice`, `Installment`, `Payment`, `Receipt`, `Dunning`, `CashSession`, `FinancialAccount` | Per-service schedules, billing subscriptions, sales and activities, collections and reminders (via `spec/behaviors/07-finance-billing-collections.md`) |
| `SchoolMembership`                                                                                                     | Driver, bus-monitor, canteen-staff, and librarian roles                                                                                                |
| `Person`, `ParentStudentRelationship`                                                                                  | Emergency contacts, people authorized to collect the child at the stop (statuses and context attributes)                                               |
| `ConsentGrant`                                                                                                         | WhatsApp opt-in, dedicated consent for geolocation ([INV-ZS-012](../invariants.md#inv-zs-012))                                                         |
| `Calendar`, `Holiday`, `ScheduleVariant`                                                                               | Days with no service, Ramadan and exam hours                                                                                                           |
| `AttendanceRecord`                                                                                                     | Correlation between the day's absence and expected visits (canteen, bus)                                                                               |
| `Notification`, `DeliveryLog`, `Event`, `Announcement`                                                                 | Milestone notifications, alerts, parental authorizations, menus and announcements (via `spec/behaviors/08-communication-notifications.md`)             |
| `AuditLog`                                                                                                             | Logging of entries and sensitive views                                                                                                                 |

**Entities to be created at V2+ design time** (an extension of `spec/domain-model.md`; not defined here, see OQ-ZS-167): a transport catalog (route, stop, student/stop assignment, vehicle), per-service subscriptions, boarding/drop-off check-ins, menus, canteen/childcare visits, activities and activity enrollments, a library catalog and copies, loans, articles and sale lines.

**Notifiable events (directional, consumed by the communication module)**: boarding or drop-off check-in recorded, student not present at stop, route departure, arrival at school, return departure, menu published, canteen or childcare visit recorded, activity enrollment validated, activity seat freed, outing authorization signed, overdue loan, service access suspended or restored. Every send produces a `Notification` and a `DeliveryLog` (channel, status, cost).

## 7. Screens

Text descriptions, mobile-first, bilingual FR/AR with full RTL support (`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`); directional level.

- **SCR-ZS-151 — Transport catalog (web, leadership and front office).** A route list with subscribed headcount and capacity; a route's detail: ordered stops with reference times, assigned staff, student-assignment actions by search (name, class); a visual alert on capacity overage. States: route active, suspended.
- **SCR-ZS-152 — Route check-in (mobile, driver/bus monitor).** A stop screen: a list of expected subscribers with photo and class, large "boarded" and "absent" buttons, a boarded counter, an offline-mode and delayed-sync indicator; moving from one stop to the next in one gesture. FR/AR labels.
- **SCR-ZS-153 — Parent transport tracking (portal).** A per-child daily view: the route's reference times, successive states (boarded at stop at such time, dropped off at school, return departure, dropped off at stop), a "not present at stop" alert; a position map only if geolocation is enabled and consented to (BEH-ZS-285).
- **SCR-ZS-154 — Canteen and childcare (web for staff; parent view).** A check-in grid by service and by class with filters (subscription, regime); the week's menu in FR/AR on the parent side, a visit history; a signal for a visit outside the subscription.
- **SCR-ZS-155 — Activities and outings (parent portal and front desk).** A per-period catalog with remaining seats, enrollment and a waiting list, a parental authorization to sign, a payment status; on the front-desk side, validating requests and taking attendance of participants.
- **SCR-ZS-156 — Uniform/supplies shop and library (front desk and portal).** An article catalog with sizes and indicative stock, ordering, collection, and invoicing; a library catalog search, current loans, due dates, and overdues.

## 8. Integrations

| Integration                             | Use in SAN                                                                                                 | Reference                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| SMS (Moroccan aggregator)               | Route fallback notifications and critical alerts                                                           | `INT-SMS`, `spec/cross-cutting/06-external-integrations.md`                                                           |
| WhatsApp Business Platform              | Milestone notifications to opted-in parents; rates to be re-evaluated on 10/01/2026                        | `INT-WAP`, [ADR-ZS-036](../decisions/036-notification-channel-hierarchy.md), OQ-ZS-166                                |
| Fatourati                               | Settling ancillary-service receivables (subscriptions, activities, sales), the school staying the creditor | `INT-FAT`, [ADR-ZS-031](../decisions/031-online-payment-rails.md), `spec/behaviors/07-finance-billing-collections.md` |
| Bank card (NAPS e-Premium or Chari Pay) | Paying for services by registered card, V2                                                                 | [ADR-ZS-031](../decisions/031-online-payment-rails.md), `spec/cross-cutting/06-external-integrations.md`              |
| Geolocation provider                    | Optional vehicle position; integration and formalities to be defined at activation                         | OQ-ZS-162, `spec/cross-cutting/06-external-integrations.md`                                                           |

## 9. Module-specific non-functional requirements

Reference to NFR domains carried by `spec/cross-cutting/03-non-functional-requirements.md`; no NFR requirement is numbered here.

- **Offline (NFR-OFF)**: route check-in and canteen check-in tolerate outages, with syncing and conflict resolution, as with attendance-taking. The morning route is the day's first action: it cannot depend on a stable connection.
- **Mobile-first (NFR-MOB, NFR-I18N)**: operational screens designed for the driver's and bus monitor's phones; full FR/AR with RTL (Android first).
- **Timing and peaks (NFR-PERF, NFR-DISP)**: a milestone notification delivered within a school-configurable delay, an indicative target aligned with the baseline's absence-alert delay (under five minutes); a morning volume concentrated in a short window to be absorbed without degradation.
- **Volumetry (NFR-RES)**: size check-ins to the platform target scale (subscribed students multiplied by two to four check-ins per day), consistent with the baseline's three-year sizing.
- **Retention (NFR-DOC)**: a short retention period for geolocation positions, to be defined at activation ([ADR-ZS-003](../decisions/003-default-retention-durations.md)); sales invoices and documents kept ten years (CGI art. 211); check-ins and visits aligned with the retention of student-life data, to be settled at design time (see OQ-ZS-167).
- **Security and compliance ([INV-ZS-090](../invariants.md#inv-zs-090), Law 09.08)**: logging of check-ins, sales, and position views; a prior CNDP analysis before any geolocation of minors (OQ-ZS-162).

## 10. Success metrics

`KPI-ZS-NNN` identifiers are carried by `spec/metrics.md`; this chapter proposes directional indicators, to be formalized there during V2+ planning:

- share of routes with complete check-in for the day (morning and evening);
- average time between check-in and delivery of the parent notification;
- share of eligible students subscribed to transport/canteen, and year-over-year renewal rate;
- number of "not present at stop" alerts per week, and average resolution time;
- share of library loans returned before the due date;
- share of uniform and supply sales carrying an electronic invoice sent to the parent.

## 11. Open questions

Open questions for this module (OQ-ZS-161 through OQ-ZS-167 in the migrated source, covering the time-zone reference, the geolocation compliance framework, third-party transport taxation, the uniform tax regime, roadmap sequencing, transport-notification costs, and the pending V2+ data-model extension) are consolidated in `spec/open-questions.md` (built in Phase 6 of the migration), not tracked locally in this file.

## 12. Traceability

Full cross-reference coverage for this module is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
