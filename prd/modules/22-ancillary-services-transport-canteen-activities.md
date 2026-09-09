# ZSchool — Chapter 22: Ancillary Services (SAN) — Transport, Canteen and Childcare, Extracurricular Activities, Library, Uniforms and Supplies

| Field | Value |
|---|---|
| Version | 0.3 — English translation, 2026-09-09 |
| Date | 2026-09-09 |
| Status | PRD draft — revised after review; arbitrations from `prd/cross-cutting/42-review-arbitrations.md` applied (ARB-21, ARB-25, ARB-26); V2+ module unchanged in substance |
| Source | `PROJECT.md` §2.4 (calendar, Ramadan), §2.7 (Law 59.21, CGI), §2.8 (types of ancillary fees), §2.10–2.11 (digital usage, widespread school transport), §6.5–6.10 (affiliations, entities), §7.7 (non-mandatory conditionable services, DEC-24), §7.8 (events, parental authorizations), §7.13 (ancillary services, later version), §8.1 (transport, library roles), §10 (NFR), §11 (single plan, modules as they ship), §12 (V2 and beyond), §14 (DEC-24, DEC-28, DEC-31, DEC-36), §17 (glossary) |
| Related files | `prd/00-conventions.md`, `prd/research/00-baseline-corrections.md`, `prd/research/02-regulatory-data.md`, `prd/research/03-payments-communications.md`, `prd/02-actors-personas.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/cross-cutting/30-roles-permissions-matrix.md`, `prd/cross-cutting/32-non-functional-requirements.md`, `prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, `prd/cross-cutting/35-external-integrations.md`, `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`, `prd/cross-cutting/38-kpi-success-metrics.md`, `prd/cross-cutting/42-review-arbitrations.md` |

**Nature of this chapter.** The SAN module is a "future scope" module: the founding document explicitly places it in a later version (§7.13) and the version-by-version scope puts it in "V2 and beyond" (§12, DEC-15). This chapter therefore sets **directional requirements**: it describes the expected observable behaviors and their interactions with existing modules (finance, communication, attendance), with no design specification. Dedicated entities (routes, stops, check-ins, menus, activities, loans, sales) are not defined here: adding them to the domain model (`prd/03-domain-data-model.md`) will happen at V2+ design time (→ OQ-07). Every requirement carries the tag **V2+**.

---

## 1. Purpose and scope

**Purpose.** Building on the identity/enrollment foundation already in place, cover the ancillary services that nearly every Moroccan private school bills on top of tuition: school transport, canteen and childcare, extracurricular activities and outings, a library, and the sale of uniforms and supplies (§2.8, §2.11, §7.13). These services share a common core: a school-specific catalog, a subscription or purchase tied to the enrollment, centralized billing in the finance module, operational check-in on mobile, and parent notification through existing channels.

**Scope included (V2+, directional):**

| Domain | Included | Excluded (reference) |
|---|---|---|
| Transport | Routes, stops, zones, per-zone or per-route subscriptions, transport staff, boarding/drop-off check-in, parent notification, optional geolocation | Non-school fleet management, billing a third-party carrier (→ OQ-03), dual enrollment and external activities (DEC-21, `prd/modules/11-admissions-enrollment-reenrollment.md`) |
| Canteen and childcare | Subscriptions (half-board, morning/evening childcare), bilingual menus, check-in of visits, billing via `prd/modules/16-finance-billing-collections.md` | Nutrition and health data (→ `prd/modules/23-health-sensitive-data.md`, V2+ HEA) |
| Activities and outings | Activity catalog, enrollment with quotas and a waiting list, one-off payments, electronic parental authorizations | E-learning and online homework (§12 V2+, PED module) |
| Library | A simple catalog, loans, returns, overdue reminders | Acquisition-budget management, online reservations (outside this direction) |
| Uniforms and supplies | An article catalog, orders, collection, conforming billing per service nature | Forced sales: forbidden by Law 59.21 (→ §5, FR-SAN-12) |

**Positioning by version.** Transport, canteen, and activities are explicitly listed in "V2 and beyond" (§12). Library, uniforms, and supplies appear in §7.13 "later version" without being named in §12: they are positioned as V2+ in the broad "V2 and beyond" sense, their exact place in the roadmap still to be confirmed (→ OQ-05). Per §11, the single plan includes every module "as it ships": SAN's availability for a tenant is controlled by module activation (`ModuleActivation`, `prd/03-domain-data-model.md` §2.7), with no paid per-module option (DEC-28). The described screens and journeys respect the persona matrix (`prd/02-actors-personas.md` §4), where SAN parent views are prospective.

---

## 2. Users and use cases

| Actor | Main use cases |
|---|---|
| Leadership | Configure their school's catalog (routes, price zones, offered services), decide the policy for services conditionable on payment (DEC-24), enable or not geolocation, track service occupancy |
| Front office / cashier | Sell subscriptions and articles, collect and bill via `prd/modules/16-finance-billing-collections.md`, enroll students in activities, reconcile a visit outside a subscription |
| Student life staff (head supervisor, supervisors) | A daily view of transport and canteen, handling alerts (a student not present at the stop, access suspended), reconciliations |
| Transport staff (driver, bus monitor) | Boarding/drop-off check-in on mobile, including offline, route by route (a scope limited to their assignments, RG-39) |
| Canteen staff, librarian | Check-in of visits, menu management, book loans and returns (roles provided for in §8.1) |
| Parent / guardian | Subscribe to a service or enroll their child in an activity from the portal, sign authorizations, follow their route and check-ins in real time, receive notifications, pay through existing rails |
| Student (per access level, RG-01) | View their activities, current loans, and their due dates |

---

## 3. Key journeys

The SAN module has no dedicated critical journey in the map: `prd/journeys/00-journey-map.md` (§5) explicitly classes transport, canteen, activities, and paid outings among journeys outside MVP, not to be reintroduced before their V2+ release. Existing journeys are nonetheless used upstream and downstream:

- **PC-05** (morning attendance check and absence notification): checking a student's boarding on the bus completes the child's safety chain; a student not present at the stop is an alert of the same nature as a class absence.
- **PC-07 / PC-08** (collections and unpaid-balance reminders; online Fatourati payment): SAN subscriptions and sales become fee lines and receivables on the same financial account, using the same payment rails (Fatourati in V1, a registered card in V2, DEC-31).
- **PC-10** (self-service certificate) and the map's note: the DEC-24 principle (no blocking of official documents) prevails from MVP on; only non-mandatory SAN services are conditionable (FR-SAN-13).
- **PC-11** (communication): every SAN notification uses the communication module's channels and templates.

Persona needs used: BES-PAR-06 (outing authorizations signed electronically) and BES-PAR-07 (online payment, the school staying the creditor) from `prd/02-actors-personas.md`.

---

## 4. Functional requirements

Counter `FR-SAN-NN` starting at 01, a namespace exclusive to this file (conventions §2). Every requirement is **V2+**. Each table has an "Inter-module impacts" row per the affectation (data used; finance, communication, attendance).

### FR-SAN-01 — Maintain the transport catalog: routes, stops, and student assignment

| Attribute | Value |
|---|---|
| Description | Let the school create and maintain its transport catalog: outbound/return routes, ordered stops with reference times, price zones, vehicles and capacities; assign each subscribed student to a route and to a to-school and from-school stop; control capacity per route and alert on overage. Data stays isolated per school (RG-21) and tied to the student's enrollment (DEC-18). |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.13, §2.11 |
| Actors | Leadership, front office |
| Inter-module impacts | Data: `Enrollment` (transport option), `Calendar`/`Holiday` (days with no route). Finance: the price zone feeds the fee schedule. Communication: none. Attendance: the route feeds check-in lists (FR-SAN-03). |

### FR-SAN-02 — Sell transport subscriptions by zone or route, billed by the finance module

| Attribute | Value |
|---|---|
| Description | Allow subscribing to transport (yearly or monthly) by zone or by route, with a school-specific price schedule. The subscription generates a fee line on the enrollment's schedule and integrates into the finance module's monthly plan (`prd/modules/16-finance-billing-collections.md`). An active enrollment's rate is locked for the year: no in-year increase (Law 59.21; `INV-40`); suspending and ending the subscription are logged and notified. |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.13, §2.8, §2.7, `INV-40` |
| Actors | Front office, accounting, leadership |
| Inter-module impacts | Finance: `FeeSchedule`, `FeeItem` (transport), `Invoice`, `Installment`, `Dunning`. Communication: notification of subscription, suspension, or cancellation. Attendance: the subscription gates check-in lists. |

### FR-SAN-03 — Check students on and off the bus on mobile, by the driver or the bus monitor

| Attribute | Value |
|---|---|
| Description | Provide staff assigned to a route with a per-stop check-in list (morning boarding, drop-off at school, return boarding, drop-off at the stop), on mobile, with simple statuses (boarded, not present at stop, dropped off) and a counter of students on board. Check-in tolerates network outages, with syncing and conflict resolution, following the same principle as attendance-taking (§10). Each check-in is time-stamped and attributed to its author (RG-38). A bus monitor sees only their assigned routes (RG-39). |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.13, §10 (offline), RG-38, RG-39 |
| Actors | Driver, bus monitor, student life staff |
| Inter-module impacts | Attendance: correlation with the day's absence (`AttendanceRecord`). Communication: each check-in may trigger a notification (FR-SAN-04). Finance: none. |

### FR-SAN-04 — Notify parents at key route milestones

| Attribute | Value |
|---|---|
| Description | Automatically send guardians (every legal guardian and the custodian by default, RG-13, RG-14) configurable milestone notifications: outbound-route departure, arrival at school, return-route departure, arrival at the stop, no-show at the stop. Routing uses the communication module's channels and preferences (`prd/modules/17-communication-notifications.md`): push first, WhatsApp "utility" with opt-in, SMS as a fallback (DEC-36, a hierarchy available from V1 onward, ARB-21b); each message goes out in the recipient's preferred language (ARB-21c); safety notifications (no-show at the stop) are exempt from send-time windows and the "STOP" opt-out (ARB-21d, ARB-21e). |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.13, §7.8, RG-13, RG-14, DEC-36, H-11 |
| Actors | Parents, student life staff |
| Inter-module impacts | Communication: `Notification`, `DeliveryLog` (costs charged to the school). Attendance: the "not present at stop" alert feeds student life's daily view. Finance: WhatsApp/SMS consumable budget (→ OQ-06). |

### FR-SAN-05 — Track vehicle position as an option (geolocation)

| Attribute | Value |
|---|---|
| Description | Offer, if and only if the school enables it, viewing a route's vehicle position for parents subscribed to that route and for leadership. Activation is conditioned on a prior compliance analysis, carried by `prd/cross-cutting/36-legal-compliance-data-protection.md` (processing minors' location data under Law 09.08: CNDP filings, a legal basis, dedicated guardian consent, a short retention period for positions, a location provider listed among sub-processors — ARB-25d) and on logged access (RG-38). Absent validation of this framework, the feature stays disabled. |
| Priority | Could |
| Version | V2+ |
| Traceability | §7.13, §2.7 (Law 09.08, CNDP), §9 |
| Actors | Parents, leadership |
| Inter-module impacts | Communication: none (viewed in the portal). Data: a dedicated `ConsentGrant`. Finance: the location provider's cost to be budgeted (→ `prd/cross-cutting/35-external-integrations.md`). |

### FR-SAN-06 — Manage transport staff (drivers, bus monitors)

| Attribute | Value |
|---|---|
| Description | Manage transport staff affiliations and assignments through the founding document's single affiliation entity (driver and bus-monitor roles provided for in §6.5 and §8.1): route assignments, dates, statuses; access removed immediately when the affiliation closes (RG-19), check-ins produced staying attributed to their author. |
| Priority | Should |
| Version | V2+ |
| Traceability | §6.5, §8.1, RG-17, RG-19 |
| Actors | Leadership |
| Inter-module impacts | Data: `SchoolMembership`. Attendance: check-in stays possible as long as the affiliation is active. Communication: none. Finance: none (payroll out of ZSchool's scope). |

### FR-SAN-07 — Manage canteen and childcare subscriptions and their billing via the finance module

| Attribute | Value |
|---|---|
| Description | Allow subscribing to meal service (half-board, chosen days) and childcare (morning, evening) by period, consistent with the enrollment's regime (day student, half-boarder), and billing them monthly via `prd/modules/16-finance-billing-collections.md` (fee lines, schedule, receipts). On an unpaid balance, access to the service only follows the school's policy for conditionable services (FR-SAN-13, DEC-24); official documents are never affected. |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.13, §2.8, DEC-24 |
| Actors | Front office, accounting, parents |
| Inter-module impacts | Finance: `FeeItem` (canteen, childcare), shared billing and reminders. Communication: subscription and suspension confirmation. Attendance: correlation between the day's absence and the expected visit (FR-SAN-08). |

### FR-SAN-08 — Publish menus and check canteen and childcare visits

| Attribute | Value |
|---|---|
| Description | Allow publishing bilingual (FR/AR) weekly menus visible to parents from the portal, and staff check-in of visits (lunch, childcare), mobile-first, with a filter by subscription, regime, and class. A visit with no active subscription triggers a reconciliation signal (a corrected subscription or per-visit billing per the school's policy). A student absent for the day has no expected visit (correlation with attendance). |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.13, §2.9 (bilingualism) |
| Actors | Canteen staff, student life staff, parents |
| Inter-module impacts | Attendance: `AttendanceRecord` (the day's absence). Communication: publishing the menu as a targeted announcement (optional). Finance: billable reconciliations. |

### FR-SAN-09 — Manage the extracurricular-activity catalog and enrollments

| Attribute | Value |
|---|---|
| Description | Allow building an extracurricular-activity catalog per period (time slot, instructor, an optional income-based fee scale, capacity) and managing enrollments: filed by the parent from the portal or at the front desk, validated by the school, a waiting list once the quota is reached, logged withdrawal. Activity time slots sit outside the timetable's course slots (`prd/modules/12-academic-structure-timetables.md`). |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.13, §2.8 (one-off activities) |
| Actors | Parents, front office, leadership |
| Inter-module impacts | Attendance: a per-session participant list. Finance: billing the activity (FR-SAN-10). Communication: enrollment confirmation and freed-seat notification. |

### FR-SAN-10 — Collect payment for activities and outings and gather parental authorizations

| Attribute | Value |
|---|---|
| Description | Allow one-off billing of activities and outings through the finance module (cash with a receipt, Fatourati from V1, registered card in V2 — DEC-31) and managing the electronic parental authorizations tied to each outing, based on the communication module's events and outings (§7.8): a signature by a legal guardian or by the adult student (RG-02), archived on record, a visible status (authorized, not authorized, pending, paid, unpaid). Making participation conditional on payment follows the school's policy (FR-SAN-13); no official document is ever blocked (DEC-24). |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.13, §7.8, §2.8, RG-02, DEC-24, DEC-31 |
| Actors | Parents, front office, student life staff |
| Inter-module impacts | Finance: one-off fee lines, collections and receipts. Communication: `Event`, parental authorization, confirmation notification. Attendance: an attendance sheet for outing participants. |

### FR-SAN-11 — Manage a library catalog with loans, returns, and overdues

| Attribute | Value |
|---|---|
| Description | Offer a deliberately minimal library scope: a catalog of works and copies, loans with a due date, returns, overdue reminders to the student (per their access level, RG-01) or to their guardians, and a per-class view of current loans. No acquisition-budget management and no online reservation in this direction. |
| Priority | Could |
| Version | V2+ |
| Traceability | §7.13, §8.1 (library role) |
| Actors | Librarian, front office, students, parents |
| Inter-module impacts | Communication: overdue reminders (existing channels). Finance: none by default (an optional fine is a school choice, billable as an ancillary fee). Attendance: none. |

### FR-SAN-12 — Sell uniforms and supplies with conforming billing

| Attribute | Value |
|---|---|
| Description | Allow maintaining an article catalog (uniforms with sizes, supplies), taking orders at the front desk or pre-orders from parents, and billing the sale through the finance module: collection with a receipt, a conforming invoice (ICE and IF mentions, continuous sequential numbering), tax treatment by service nature (→ §5). The sale is strictly optional: no forced order, no imposed supplier designation, per Law 59.21; the purchase is never a condition of enrollment or re-enrollment. |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.13, §2.8, §2.7 (Law 59.21), `INV-40` |
| Actors | Front office, accounting, parents |
| Inter-module impacts | Finance: `FeeItem` (uniform, supplies), `CashSession`, `Invoice`, `Receipt`. Communication: making the invoice available to the parent. Attendance: none. |

### FR-SAN-13 — Apply the access policy for services conditionable on payment

| Attribute | Value |
|---|---|
| Description | Implement the DEC-24 principle at the scale of ancillary services: the school may condition on payment only non-mandatory services (transport, canteen, childcare, activities, library, sales). When the policy is enabled for a service, an unpaid balance on that service produces a status "access suspended per the school's policy", visible to student life staff and the operational staff concerned at the moment of service (boarding, canteen visit, participation); the parent sees the arrears and the account statement. Official documents (certificate of enrollment, leaving certificate, report cards, transcripts) are never affected, at any version (`INV-39`). |
| Priority | Should |
| Version | V2+ |
| Traceability | §7.7, DEC-24, `INV-39` |
| Actors | Leadership, student life staff, front office, parents |
| Inter-module impacts | Finance: an arrears alert, an account statement. Attendance: a visible signal at service points. Communication: suspension and restoration notification. |

**Acceptance criteria (critical flows, Gherkin format)**

```gherkin
Feature: Boarding check-in and guardian notification
  Scenario: A student is checked in as boarded at their stop
    Given a route with 25 subscribers and an assigned bus monitor
    When the bus monitor checks the student in as boarded at the stop at 07:12
    Then the check-in is time-stamped and attributed to the bus monitor (RG-38)
    And the student's guardians receive the milestone notification on their active channels
    And the check-in stays viewable in the day's route history

Feature: Student not present at the stop
  Scenario: An alert after the bus passes
    Given a subscribed student not checked in at their stop
    When the bus monitor closes out the stop
    Then the student is marked "not present at stop"
    And their guardians receive a bilingual priority alert
    And student life staff see the alert in the day's transport view

Feature: A service conditionable on payment
  Scenario: An unpaid transport subscription with the policy enabled
    Given the access policy for conditionable services enabled by the school (DEC-24)
    And a student whose transport subscription has an overdue installment
    When student life staff view the day's boarding list
    Then the student appears with status "access suspended per the school's policy"
    And none of that student's official documents are blocked (report cards, certificates, attestations)
    And the parent sees the arrears and the account statement in their portal

Feature: Enrollment in a capacity-limited activity
  Scenario: Quota reached
    Given an activity limited to 15 seats with 15 validated enrollments
    When a parent attempts to enroll their child from the portal
    Then the request is placed on a waiting list
    And the front office sees the request and can validate it when a seat frees up

Feature: Billed uniform sale
  Scenario: A front-desk purchase collected in cash
    Given a catalog with the item "Blazer, size M"
    When the front office records a sale of two items collected in cash
    Then a conforming invoice is issued, continuously numbered, with the mandatory mentions
    And the receipt is handed over and sent to the parent
    And the sale is tied to the day's cash session
```

---

## 5. Morocco-specific considerations

1. **Taxation by service nature (CGI).** Pricing distinguishes service natures: tuition outside the scope of VAT; catering, transport, and school leisure services provided by the school to its own students are exempt with no deduction right (art. 91-V-4°, H-07); the same services provided by a third party and re-billed are taxable (transport 14%, reduced to 13% in 2025 then 10% from 01/2026; catering 10%); school supplies exempt with no deduction right (art. 91-E-4°, 2024 Finance Law, a list of 36 products). Source: `prd/research/02-regulatory-data.md` §7. The uniform's tax regime is not covered by these references: to be confirmed before any billing (→ OQ-04).
2. **Invoice and retention.** Mandatory mentions (identity, ICE, IF, continuous sequential numbering, payment method, VAT where applicable) and a ten-year accounting-retention period (CGI art. 145 and 211): the finance module (`prd/modules/16-finance-billing-collections.md`) carries the mechanics; SAN only adds line natures to it.
3. **Law 59.21.** Mandatory publicity of the fee list, including catering and transport (art. 49); a ban on forced sale of textbooks and supplies via the school or a designated bookstore; a ban on raising fees mid-year. These rules directly frame FR-SAN-02, FR-SAN-07, and FR-SAN-12 (`INV-40`).
4. **Time zone and hours.** Check-ins time-stamped in local time, stored in UTC. Research corrects the founding document: a definitive return to UTC+0 on 09/20/2026 at 02:00, with no seasonal alternation or Ramadan exception (decree no. 2.26.530; BO no. 7521 of 06/29/2026 — `prd/research/00-baseline-corrections.md` #1); the divergence is settled at PRD level by `prd/01-context-vision-scope.md` OQ-01 (this chapter's OQ-01 resolved by reference).
5. **Ramadan and moving holidays.** Route, childcare, and canteen hours follow the school's calendar variants (normal, Ramadan, exams; Hijri holidays to be confirmed by lunar observation, G-11): no service hour is hard-coded.
6. **Notification channels.** Push, WhatsApp "utility" (prior opt-in), SMS fallback hierarchy (DEC-36); the 10/01/2026 WhatsApp rate change (end of free service and utility messages within the 24-hour window, Morocco's exit from the "Rest of Africa" regional rates — `prd/research/00-baseline-corrections.md` #6; `prd/research/03-payments-communications.md` §4) also requires budgeting morning transport-notification volumes (→ OQ-06).
7. **Payment rails.** Ancillary-service payments use existing rails: Fatourati (the school as creditor, ZSchool never holding funds), cash and cheques at the front desk, registered card in V2 (DEC-31). YouCan Pay is excluded from references (it ceased operating in January 2024 — `prd/research/00-baseline-corrections.md` #7).

---

## 6. Data and events

**Existing entities used** (`prd/03-domain-data-model.md`):

| Entity | Use in SAN |
|---|---|
| `Enrollment` | Carrying the transport/canteen option and tying every service to the enrollment (DEC-18, `INV-27`) |
| `FeeSchedule`, `FeeItem`, `Invoice`, `Installment`, `Payment`, `Receipt`, `Dunning`, `CashSession`, `FinancialAccount` | Per-service schedules, billing subscriptions, sales and activities, collections and reminders (via `prd/modules/16-finance-billing-collections.md`) |
| `SchoolMembership` | Driver, bus-monitor, canteen-staff, and librarian roles (§6.5, §8.1) |
| `Person`, `ParentStudentRelationship` | Emergency contacts, people authorized to collect the child at the stop (statuses and context attributes, RG-12b, RG-15) |
| `ConsentGrant` | WhatsApp opt-in, dedicated consent for geolocation (`INV-24`) |
| `Calendar`, `Holiday`, `ScheduleVariant` | Days with no service, Ramadan and exam hours |
| `AttendanceRecord` | Correlation between the day's absence and expected visits (canteen, bus) |
| `Notification`, `DeliveryLog`, `Event`, `Announcement` | Milestone notifications, alerts, parental authorizations, menus and announcements (via `prd/modules/17-communication-notifications.md`) |
| `AuditLog` | Logging of entries and sensitive views (RG-38) |

**Entities to be created at V2+ design time** (an extension of `prd/03-domain-data-model.md`; not defined here, → OQ-07): a transport catalog (route, stop, student/stop assignment, vehicle), per-service subscriptions, boarding/drop-off check-ins, menus, canteen/childcare visits, activities and activity enrollments, a library catalog and copies, loans, articles and sale lines.

**Notifiable events (directional, consumed by the communication module)**: boarding or drop-off check-in recorded, student not present at stop, route departure, arrival at school, return departure, menu published, canteen or childcare visit recorded, activity enrollment validated, activity seat freed, outing authorization signed, overdue loan, service access suspended or restored. Every send produces a `Notification` and a `DeliveryLog` (channel, status, cost).

---

## 7. Key screens

Counter `ECR-SAN-NN` starting at 01 (conventions §2). Text descriptions, mobile-first, bilingual FR/AR with full RTL support (`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`); directional level.

- **ECR-SAN-01 — Transport catalog (web, leadership and front office).** A route list with subscribed headcount and capacity; a route's detail: ordered stops with reference times, assigned staff, student-assignment actions by search (name, class); a visual alert on capacity overage. States: route active, suspended.
- **ECR-SAN-02 — Route check-in (mobile, driver/bus monitor).** A stop screen: a list of expected subscribers with photo and class, large "boarded" and "absent" buttons, a boarded counter, an offline-mode and delayed-sync indicator; moving from one stop to the next in one gesture. FR/AR labels.
- **ECR-SAN-03 — Parent transport tracking (portal).** A per-child daily view: the route's reference times, successive states (boarded at stop at such time, dropped off at school, return departure, dropped off at stop), a "not present at stop" alert; a position map only if geolocation is enabled and consented to (FR-SAN-05).
- **ECR-SAN-04 — Canteen and childcare (web for staff; parent view).** A check-in grid by service and by class with filters (subscription, regime); the week's menu in FR/AR on the parent side, a visit history; a signal for a visit outside the subscription.
- **ECR-SAN-05 — Activities and outings (parent portal and front desk).** A per-period catalog with remaining seats, enrollment and a waiting list, a parental authorization to sign, a payment status; on the front-desk side, validating requests and taking attendance of participants.
- **ECR-SAN-06 — Uniform/supplies shop and library (front desk and portal).** An article catalog with sizes and indicative stock, ordering, collection, and invoicing; a library catalog search, current loans, due dates, and overdues.

---

## 8. Integrations

| Integration | Use in SAN | Reference |
|---|---|---|
| SMS (Moroccan aggregator) | Route fallback notifications and critical alerts | `INT-SMS`, `prd/cross-cutting/35-external-integrations.md` |
| WhatsApp Business Platform | Milestone notifications to opted-in parents; rates to be re-evaluated on 10/01/2026 | `INT-WAP`, DEC-36, OQ-06 |
| Fatourati | Settling ancillary-service receivables (subscriptions, activities, sales), the school staying the creditor | `INT-FAT`, DEC-31, `prd/modules/16-finance-billing-collections.md` |
| Bank card (NAPS e-Premium or Chari Pay) | Paying for services by registered card, V2 | DEC-31, `prd/cross-cutting/35-external-integrations.md` |
| Geolocation provider | Optional vehicle position; integration and formalities to be defined at activation (no dedicated integration namespace in the founding document) | OQ-02, `prd/cross-cutting/35-external-integrations.md` |

---

## 9. Module-specific non-functional requirements

Reference to NFR domains carried by `prd/cross-cutting/32-non-functional-requirements.md`; no NFR requirement is numbered here (the `NFR-<DOM>-NN` namespace is exclusive to that file).

- **Offline (NFR-OFF)**: route check-in and canteen check-in tolerate outages, with syncing and conflict resolution, as with attendance-taking (§10). The morning route is the day's first action: it cannot depend on a stable connection.
- **Mobile-first (NFR-MOB, NFR-I18N)**: operational screens designed for the driver's and bus monitor's phones; full FR/AR with RTL (Android first, §2.10).
- **Timing and peaks (NFR-PERF, NFR-DISP)**: a milestone notification delivered within a school-configurable delay, an indicative target aligned with the founding document's absence-alert delay (under five minutes); a morning volume concentrated in a short window to be absorbed without degradation.
- **Volumetry (NFR-RES)**: size check-ins to the platform target scale (subscribed students multiplied by two to four check-ins per day), consistent with the founding document's three-year sizing.
- **Retention (NFR-DOC, DEC-22)**: a short retention period for geolocation positions, to be defined at activation; sales invoices and documents kept ten years (CGI art. 211); check-ins and visits aligned with the retention of student-life data, to be settled at design time (→ OQ-07).
- **Security and compliance (RG-38, Law 09.08)**: logging of check-ins, sales, and position views; a prior CNDP analysis before any geolocation of minors (OQ-02).

---

## 10. Success metrics

`KPI-NN` identifiers are carried by `prd/cross-cutting/38-kpi-success-metrics.md`; this chapter proposes directional indicators, to be formalized there during V2+ planning:

- share of routes with complete check-in for the day (morning and evening);
- average time between check-in and delivery of the parent notification;
- share of eligible students subscribed to transport/canteen, and year-over-year renewal rate;
- number of "not present at stop" alerts per week, and average resolution time;
- share of library loans returned before the due date;
- share of uniform and supply sales carrying an electronic invoice sent to the parent.

---

## 11. Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Founding-document update on the time zone: §2.4 and §10 describe UTC+1 with a return to UTC+0 during Ramadan; research establishes a definitive return to UTC+0 on 09/20/2026, with no alternation or Ramadan exception (decree no. 2.26.530, BO no. 7521 of 06/29/2026 — `prd/research/00-baseline-corrections.md` #1). | **Resolved — reference**: the question is settled once, by `prd/01-context-vision-scope.md` OQ-01 (permanent UTC+0, a founding-document update carried by ESC-03 of `prd/cross-cutting/42-review-arbitrations.md`); this chapter keeps permanent UTC+0 (check-in timestamps, UTC storage) with no OQ of its own. |
| OQ-02 | Compliance framework for geolocating school vehicles (location data on minors): the applicable CNDP formality (filing or authorization), legal basis, consent, and position-retention period. | Open (V2+), **carried by `prd/cross-cutting/36-legal-compliance-data-protection.md`** (geolocation compliance analysis and listing the provider among sub-processors, ARB-25d); FR-SAN-05 is disabled by default and conditioned on that analysis; no commercial promise before validation (Law 09.08, §2.7, §9). |
| OQ-03 | Transport run by a third-party provider rather than the school: multi-provider scope and the tax treatment of re-billing (a taxable third party: transport 14%, 13% in 2025, 10% from 01/2026 — `prd/research/02-regulatory-data.md` §7). | The founding document describes school-operated transport (§2.11); the external-carrier case is common in groups and must be settled before design. |
| OQ-04 | Tax regime of uniform sales: not covered by the catering/transport/leisure exemption (art. 91-V-4°) nor documented for supplies outside the 36-product exempt list (art. 91-E-4°). | To be confirmed with the DGI before billing; in the meantime the line nature stays configurable and no exemption is assumed. |
| OQ-05 | Ranking of the library and the uniform/supply sale in the V2+ roadmap: named in §7.13 "later version" but not listed in §12 "V2 and beyond" (which cites transport, canteen, activities, health). | This chapter adopts a V2+ position; exact sequencing to be set in `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`. |
| OQ-06 | Transport-notification costs after 10/01/2026: the end of free service and utility messages within the 24-hour window and Morocco's exit from "Rest of Africa" regional rates (`prd/research/00-baseline-corrections.md` #6). | Push/WhatsApp/SMS arbitration and per-school credit caps to be defined with the communication module; a risk of repeated daily costs specific to transport. |
| OQ-07 | Data-model extension: creating SAN entities (routes, stops, subscriptions, check-ins, menus, visits, activities, enrollments, copies, loans, articles, sale lines) in `prd/03-domain-data-model.md`, with associated invariants and retention periods. | This chapter stays at a directional level per its assignment; no SAN entity or invariant is created here. |

---

## 12. Traceability

Table: founding-document ID → this file's requirements and sections that cover it.

| Founding-document ID | Coverage in this file |
|---|---|
| §2.4 (calendar, Ramadan, schedule variants) | §5 (points 4 and 5), FR-SAN-01 |
| §2.7 (Law 59.21, CGI, Law 09.08) | §5 (points 1 to 3), FR-SAN-02, FR-SAN-05, FR-SAN-12, OQ-02, OQ-04 |
| §2.8 (types of ancillary fees, payment rails) | §1, §5 (points 1 and 7), FR-SAN-02, FR-SAN-07, FR-SAN-10, FR-SAN-12 |
| §2.10 (digital usage) | §7, §9 (NFR-MOB, NFR-I18N) |
| §2.11 (widespread school transport) | §1, FR-SAN-01, OQ-03 |
| §6.5 / §8.1 (affiliations, transport and library roles) | FR-SAN-06, FR-SAN-11 |
| §6.10 (entity schema) | §6 (entities used) |
| §7.7 / DEC-24 (conditionable non-mandatory services) | FR-SAN-07, FR-SAN-10, FR-SAN-13, §3 |
| §7.8 (events, parental authorizations) | FR-SAN-04, FR-SAN-10, §6 |
| §7.13 (ancillary services, later version) | The whole chapter (every FR-SAN) |
| §9 (Law 09.08, logging, hosting) | FR-SAN-05, §9, OQ-02 |
| §10 (offline, notification delays, time zone) | FR-SAN-03, FR-SAN-04, §9, OQ-01 |
| §11 / DEC-28 (single plan, modules as they ship) | §1 (module activation) |
| §12 (V2 and beyond) | Every FR-SAN (V2+ tag), §1, OQ-05 |
| RG-01 | FR-SAN-11 (student access per level) |
| RG-02 | FR-SAN-10 (signature by the adult student) |
| RG-13, RG-14 | FR-SAN-04 |
| RG-15 (relationship context attributes) | §6 (pickup at the stop, emergency contacts) |
| RG-17, RG-19 | FR-SAN-06 |
| RG-21 (tenant isolation) | FR-SAN-01, §6 |
| RG-38 (logging) | FR-SAN-03, FR-SAN-05, FR-SAN-12, §9 |
| RG-39 (least privilege) | FR-SAN-03, FR-SAN-06 |
| `INV-24` (bounded, revocable consents) | FR-SAN-05, §6 |
| `INV-27` (data tied to the enrollment) | FR-SAN-01, §6 |
| `INV-39` (no blocking of official documents) | FR-SAN-13 |
| `INV-40` (tamper-proof numbering, yearly rate lock) | FR-SAN-02, FR-SAN-12 |
| DEC-31 (Fatourati V1, card V2) | FR-SAN-10, §5 (point 7), §8 |
| DEC-36 (channel hierarchy) | FR-SAN-04, §5 (point 6), OQ-06 |
| G-11 (Moroccan calendar, moving holidays) | §5 (point 5) |
| H-07 (catering, transport, tuition taxation) | §5 (point 1), FR-SAN-12, OQ-04 |
| H-11 (real channels, WhatsApp) | FR-SAN-04, §9 |
| `prd/research/00` #1 (permanent UTC+0 time zone) | §5 (point 4), OQ-01 |
| `prd/research/00` #6 (WhatsApp rates 10/01/2026) | §5 (point 6), OQ-06 |
| `prd/research/00` #7 (YouCan Pay closed) | §5 (point 7) |
| `prd/research/02` §7 (art. 91-V-4°, art. 91-E-4°, mentions and retention) | §5 (points 1 and 2), FR-SAN-12, OQ-03, OQ-04 |
| `prd/02-actors-personas.md` BES-PAR-06, BES-PAR-07 | §3 |
| `prd/journeys/00-journey-map.md` (PC-05, PC-07, PC-08, PC-10, PC-11; §5 outside MVP) | §3 |
| `prd/01-context-vision-scope.md` OQ-01 (UTC+0 time zone) | §5 (point 4), OQ-01 (resolved by reference) |
| `prd/cross-cutting/42-review-arbitrations.md` | ARB-21b/c/d/e (FR-SAN-04); ARB-25d (FR-SAN-05, OQ-02); ARB-26 (OQ-01 de-duplicated) |
