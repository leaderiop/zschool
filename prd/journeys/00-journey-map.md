# PRD ZSchool — End-to-End Journey Map

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09; supersedes 0.2 — revised 09/09/2026) |
| Date | 2026-09-09 |
| Status | PRD draft — under review |
| Source | PROJECT.md §5.2, §7 (7.1–7.14), §10, §12, §18 (point 2) ; DEC-35 (and decisions DEC-01 to DEC-36 cited in support) ; `prd/cross-cutting/42-review-arbitrations.md` (ARB-01 to ARB-26) |
| Related files | `prd/journeys/01-school-group-director.md`, `prd/journeys/02-secretary-cashier.md`, `prd/journeys/03-head-supervisor.md`, `prd/journeys/04-part-time-teacher.md`, `prd/journeys/05-multi-school-parent.md`, `prd/journeys/06-custodial-mother-and-guardian.md`, `prd/journeys/07-students-minor-and-adult.md` (detailed journeys per persona), `prd/modules/10-administration-onboarding-subscription.md`, `prd/modules/11-admissions-enrollment-reenrollment.md`, `prd/modules/12-academic-structure-timetables.md`, `prd/modules/13-attendance-student-life-discipline.md`, `prd/modules/14-assessments-grades-report-cards.md`, `prd/modules/15-documents-certificates.md`, `prd/modules/16-finance-billing-collections.md`, `prd/modules/17-communication-notifications.md`, `prd/modules/18-transfers-mobility.md`, `prd/modules/19-teacher-career-network.md`, `prd/modules/20-dashboards-reporting.md`, `prd/modules/21-massar-regulatory-exports.md`, `prd/modules/22-ancillary-services-transport-canteen-activities.md`, `prd/modules/23-health-sensitive-data.md` (modules), `prd/02-actors-personas.md`, `prd/cross-cutting/32-non-functional-requirements.md` (NFR), `prd/cross-cutting/35-external-integrations.md` (integrations), `prd/cross-cutting/37-roadmap-mvp-v1-v2.md` (roadmap) |

---

## 1. Purpose and cross-reference conventions

This file gives the **overview of ZSchool's critical journeys**, end-to-end and cutting across personas. It answers point 2 of baseline chapter 18 ("detailed user journeys per persona") by fixing the shared reference list used by every chapter. It does **not** describe the detailed steps: each journey points to the `PJ-<PERS>-NN` steps carried by the persona files `prd/journeys/01-school-group-director.md` through `prd/journeys/07-students-minor-and-adult.md`, and to the `FR-…` requirements of modules `prd/modules/10-administration-onboarding-subscription.md` through `prd/modules/23-health-sensitive-data.md`.

Cross-reference conventions used throughout this file:

- **Personas**: codes and order from conventions §2 — file 01 (DIR, director), 02 (SEC, secretary-cashier), 03 (SUR, head supervisor), 04 (ENS, teacher), 05 (PAR, multi-school parent), 06 (GAR, custodial/guardian mother), 07 (ELE, students Youssef and Salma). The list of personas and their needs is carried by `prd/02-actors-personas.md` (BES-…).
- **Modules**: `<MOD>` codes from conventions §2 (ADM, INS, PED, VSC, EVA, DOC, FIN, COM, TRA, CAR, RAP, MAS, SAN, HEA, PRT); each module's file is one of `prd/modules/10-administration-onboarding-subscription.md` through `prd/modules/23-health-sensitive-data.md`, per the plan in `prd/README.md`. PRT (parent/student portals) is handled within the existing modules, with no dedicated file.
- **NFR**: `NFR-<DOM>` domains carried by `prd/cross-cutting/32-non-functional-requirements.md`; this file cites the domains (RES, PERF, DISP…) without numbering them.
- **Journey identifiers**: this map assigns each critical journey the identifier `PC-NN`, local to this file. Detailed steps remain `PJ-<PERS>-NN` (persona files): no `PJ` is created here.

---

## 2. Critical journeys

### PC-01 — Admission of a new student: application, decision, enrollment, documents

| Attribute | Value |
|---|---|
| Business objective | Convert an application into a complete, billed ACTIVE enrollment (application, documents, guardians, internal rules, Law 09.08 notices) without re-entry, with enrollment documents issued immediately. |
| Actors | Secretary (data entry and documents), leadership (decision, admission tests), parent/legal tutor (submission, signatures; the legal tutor is the signer, RG-14b), ZSchool support (matching and duplicates). |
| Lead personas | 02 SEC (lead), 01 DIR (decision), 05 PAR and 06 GAR (submission and signatures), 07 ELE (admitted student). |
| Variants | **PC-01a — single-site school** (Fatima, a 350-pupil primary school in Salé): full front-desk enrollment in one pass, implicit admission decision by leadership; **PC-01b — multi-site group** (Si Abdellah, Casablanca): tooled application file, tests, and waitlist (V1), site-level leadership decision (PJ-DIR-08). Both variants share identity creation, matching, and activation. Case of a student arriving from a non-ZSchool school: declared prior history (PJ-SEC-10, ARB-22). |
| Step detail | Persona files 02 (admission PJ-SEC steps: PJ-SEC-01, PJ-SEC-10) and 01 (decision: PJ-DIR-08); identity creation and matching: PROJECT.md §6.2; guardian matching by mobile number (ARB-09). |
| Modules involved | INS (application, decision, enrollment), ADM (identities, Massar matching, duplicates), DOC (enrollment documents), FIN (enrollment fee, deposit), COM (test invitation, decision notification). |
| Seasonality | One-off per student, at high volume from March (competing re-enrollments, word of mouth) through September (start of year); bottlenecks in July–August. |
| Version | MVP for the enrollment core (simplified state machine, §12; CANCELLED state and import activation, ARB-02, ARB-03), a child declared by the parent (ARB-09), and declared prior history (ARB-22); V1 for the online application file, tests, waitlist, and tooled decision (§12 V1, PJ-DIR-08). |
| Baseline | (→ RG-04, RG-05, RG-06, RG-08, RG-10, RG-13, RG-14b, DEC-03, DEC-04, DEC-06, G-07; ARB-02, ARB-03, ARB-09, ARB-22) |

### PC-02 — Bulk re-enrollment and year N-to-N+1 rollover

| Attribute | Value |
|---|---|
| Business objective | Secure retention and cash flow before summer (pre-filled re-enrollment campaign, deposits, reminders), then produce year N+1 without re-entry: bulk year-end decisions, creation of N+1 enrollments, class assignment, handling of departures. |
| Actors | Leadership (promotion decisions, validation), secretariat (campaign, deposits, class assignment), parents (confirmation and deposit), the class council upstream (decisions and remarks in MVP wave 2, tooled preparation in V1). |
| Lead personas | 01 DIR (owns the decisions), 02 SEC (owns the campaign and assignment), 05 PAR and 06 GAR (confirmation). |
| Step detail | Persona files 01 and 02 (rollover PJ-DIR and PJ-SEC steps); enrollment lifecycle: PROJECT.md §6.3; cloned structure: §6.7. |
| Modules involved | INS (re-enrollment campaign, rollover, decisions, assignment), PED (cloning the N+1 structure, RG-25), FIN (deposits, N+1 payment schedules, sibling discount), COM (campaign reminders), RAP (re-enrollment rate, N+1 headcounts). |
| Seasonality | Seasonal: re-enrollment campaign in spring (re-enrollment fees are "often paid in spring, with a deposit," §2.8), rollover in June (first occurrence: June 2027 for pilots, JAL-07), decisions before students leave. |
| Version | **MVP (wave 2 — year-end close, JAL-07)** for bulk year-end decisions, closing every present student as COMPLETED, creating N+1 enrollments as PRE-ENROLLED, structure cloning (RG-25), class assignment, pre-filled re-enrollment forms and the deposit (ARB-01, ARB-03); V1 for automated campaign reminders and tooled council preparation. Rules: every student present at closing moves to COMPLETED with a decision, "streamed" is not a departure, a departure "at the next school year" = COMPLETED with no N+1 enrollment (ARB-03c/d). |
| Baseline | (→ RG-08, RG-09, RG-10, RG-25, DEC-06, DEC-21, G-07; ARB-01, ARB-03) |

### PC-03 — School onboarding (tenant, structure model, Excel import)

| Attribute | Value |
|---|---|
| Business objective | Get a school into production quickly and cleanly: tenant created and configured (legal identity, languages, channels), academic structure instantiated from the national model, initial data imported from Excel with duplicate control, internal users and roles in place; shorten the time to first value (first roll call, first payment). |
| Actors | ZSchool team (provisioning, support, import validation), leadership (configuration, fee schedule, roles), secretariat (reviewing import reports). |
| Lead personas | 01 DIR (lead), 02 SEC (imports and review). |
| Step detail | Persona files 01 and 02 (PJ-DIR and PJ-SEC start-up steps); tenant and structure: PROJECT.md §6.6 and §6.7. |
| Modules involved | ADM (tenant creation, setup wizard, bulk imports, users and roles, subscription lifecycle), PED (national structure model, year, periods, grading scales), FIN (initial fee schedule), COM (invitations for internal accounts). |
| Seasonality | One-off per school; two windows: **April to August** (before the start of the school year) and **mid-year** (resumption after mid-year: pilots go live from 01/02/2027, JAL-04). Mid-year resumption also imports partially-paid payment schedules, cheques in hand, current-semester marks, and aggregated absences, and activates enrollments through a traced "import activation" (ARB-02; PJ-DIR-01.11, PJ-SEC-11). The DEC-35 pilots (a primary school of about 300 students, a middle/high school of about 800, a multi-site group of over 2,000, a bilingual school running on trimesters) set the scale of initial imports; the group is set up from MVP in read-only consolidated view (ARB-01). |
| Version | MVP (§12: school onboarding, Excel import, national structure model; mid-year resumption and read-only consolidated organization: ARB-01, ARB-02). |
| Baseline | (→ RG-18, RG-21, RG-22, RG-24, DEC-02, DEC-10, DEC-23, G-06, G-18, DEC-35; ARB-01, ARB-02) |

### PC-04 — Claiming a student identity by a parent via an invitation code

| Attribute | Value |
|---|---|
| Business objective | Activate every parent on their own account (no shared accounts, RG-12b) and link the child's global identity: identity reliability, wider adoption of the parent app (multi-school network effect), fewer calls to the front office for information. |
| Actors | Parent/guardian (claim with a knowledge challenge: the child's date of birth entered, never displayed, ARB-08), school (issuing invitations, validating weak matches, revoking an incorrect claim), ZSchool support (auditable merge, RG-06, MVP, ARB-01), student (own access from the level set by the school, RG-01; generated login identifier for a minor without their own phone, ARB-07). |
| Lead personas | 05 PAR (lead), 06 GAR (guardian claiming her daughter's access), 02 SEC (issuing and validation), 07 ELE (activation of student access). |
| Step detail | Persona files 05 and 06 (PJ-PAR and PJ-GAR claim steps); identity creation paths: PROJECT.md §6.2. |
| Modules involved | ADM (identities, invitations, strong/weak matching, merging), INS (parent–student relationships and qualities), PRT (parent portal, multi-school switcher), COM (invitation and notifications). |
| Seasonality | Daily in steady state, with a massive peak at the September start of year (batch invitations following imports and enrollments). |
| Version | MVP (§12: global identities, Massar matching, invitations and claim; guardian matching by mobile number, a child declared by the parent, login identifier distinct from the contact number, number change: ARB-07, ARB-08, ARB-09). |
| Baseline | (→ RG-01, RG-05, RG-06, RG-07, RG-12b, RG-13, DEC-03, DEC-04, DEC-11; ARB-07, ARB-08, ARB-09) |

### PC-05 — Morning roll call and absence notification to guardians

| Attribute | Value |
|---|---|
| Business objective | Guarantee the child's safety and the family's peace of mind: roll call taken by **declared session** (course, date, chosen time slot; the V1 timetable will feed expected sessions, ARB-04) or by half-day, with notification of the **first absence of the day** delivered to guardians in under 5 minutes after validation (a baseline non-functional requirement), after a 3-minute hold window allowing correction, a correction notice if amended after sending, an evening summary for subsequent absences, a half-day summary by default in preschool (ARB-15), despite unstable in-class connectivity (offline mode). |
| Actors | Teacher (taking the roll for their course, scoped to their students, RG-39), head supervisor (today's absentees, follow-ups, excuses — including an excuse recorded at the front desk on the parent's behalf, ARB-15d; declaring sessions not held, ARB-05), parents (notification, excuse with attachment), leadership (alert thresholds, statistics). |
| Lead personas | 04 ENS (owns roll call), 03 SUR (owns the day's follow-up), 05 PAR and 06 GAR (notification and excuse), 07 ELE. |
| Step detail | Persona files 04 (owns roll call) and 03 (day's follow-up), daily-roll-call PJ-ENS and PJ-SUR steps; attendance: PROJECT.md §7.4. |
| Modules involved | VSC (roll call, offline and sync, excuses, thresholds), COM (multi-channel notifications per DEC-36), RAP (day's student-life dashboard). |
| Seasonality | Daily (every school day, all year); offline tolerance in constant use. |
| Version | MVP (§12: attendance with SMS/WhatsApp notification, excuses; declared sessions, grouping, hold window and correction notice, front-desk excuse, session not held: ARB-04, ARB-05, ARB-15). MVP channels: in-app, SMS, WhatsApp utility limited to attendance notifications; no push in MVP (ARB-21b). |
| Baseline | (→ RG-38, RG-39, DEC-12, DEC-36, G-14; delay under 5 minutes and offline mode: PROJECT.md §10; ARB-04, ARB-05, ARB-15, ARB-21) |

### PC-06 — Grade entry, class council, report card publication

| Attribute | Value |
|---|---|
| Business objective | Produce bilingual, reliable, immutable report cards, compliant with the national continuous-assessment framework (at least two assessments per subject per semester; warning before closing in MVP, blocking in V1, arbitration D3), published to families (QR verification in V1, DEC-30, ARB-19), with rolling, configurable progressive publication of grades available from MVP (ARB-17f), and preparing Massar exports to cut double entry (H-04: no automation of Massar data entry; exports in MVP wave 2, ARB-01). |
| Actors | Teacher (mobile or web entry, by subject and class), leadership (period closing and locking, chairing the council, publication), class council (remarks, decisions), parents and students (viewing), head supervisor (supporting conduct). |
| Lead personas | 04 ENS (owns evening entry), 01 DIR (owns closing and publication), 05 PAR, 06 GAR and 07 ELE (viewing; adult student Salma checks her transcripts for her applications, RG-02). |
| Step detail | Persona files 04 (PJ-ENS entry steps) and 01 (PJ-DIR council and publication steps); assessments: PROJECT.md §7.5. |
| Modules involved | EVA (assessment types, entry, configurable calculation, class council, versioned report cards), PED (periods, grading scales, coefficients), DOC (verification QR), MAS (compliance check, grade exports), COM (publication notification), RAP (results by subject). |
| Seasonality | Continuous entry (weekly in steady state); peaks at period end: two annual closings on a semester calendar, three for the bilingual pilot school on trimesters (DEC-35); import of certifying exam results in June. |
| Version | MVP for entry, averages (ARB-17 calculation rules: markers, scales rebased to 20, ungraded subjects, class change, rank exclusion), published bilingual immutable report cards, and progressive publication; MVP wave 2 for council decision and remark entry with a simplified minutes, the annual transcript, and Massar exports; V1 for tooled council preparation, the blocking compliance check, the QR code, and the cumulative transcript (§12; ARB-01, ARB-17, ARB-19). |
| Baseline | (→ RG-02, RG-29, RG-33, DEC-09, DEC-10, DEC-20, G-12, G-19, H-04; ARB-01, ARB-17, ARB-19) |

### PC-07 — Collecting a monthly payment and chasing arrears

| Attribute | Value |
|---|---|
| Business objective | Maximize the school's collection (cash flow): tracked payment across every method (cash, cheque, transfer, online), immediate receipt, automated graduated reminders, a clear view of arrears — all without ever blocking official documents for unpaid fees (DEC-24). |
| Actors | Secretary-cashier (payment, receipt, voiding or correcting a payment via a traced reversal, ARB-20b, cheques, cash session in V1), accountant or leadership (reminders, aged balance, negotiated discounts and internal bursaries), the financially responsible parent (payment, including a family payment split across several children with a single receipt, ARB-20a; may differ from the legal guardian; third-party payer, ARB-14). |
| Lead personas | 02 SEC (lead), 01 DIR (steering arrears), 05 PAR and 06 GAR (payment; Naïma receives the information, the paying father stays informed). |
| Step detail | Persona file 02 (PJ-SEC cash and reminder steps); finance: PROJECT.md §7.7. |
| Modules involved | FIN (payment schedules, payments, receipts, arrears, reminders, aged balance, sibling discount), DOC (printable receipt, sent to the parent), COM (SMS/WhatsApp reminders, templates), RAP (arrears table by class and guardian). |
| Seasonality | Monthly over ten months (September to June), peaking at the start of each month and at the start of the year; ongoing reminders; cheques handed over at the start of the year with due dates (§2.8). |
| Version | MVP for core finance (fee schedule, payment schedule with pro-rated part-month billing due in full, ARB-20c, payments, sequentially numbered tamper-proof receipts, arrears, in-app and SMS reminders, **cheque lifecycle**, **sibling discount**, **Law 59.21 parents' contract**, **account statement** to the financially responsible parent, payment voiding, family payment — ARB-01, ARB-20); V1 for cash sessions, compliant invoices, negotiated discounts and bursaries, accounting exports, postal mail, WhatsApp reminders (§12). |
| Baseline | (→ RG-12, RG-13, DEC-24, G-15, G-16, H-09; ARB-01, ARB-14, ARB-20) |

### PC-08 — Online payment via Fatourati

| Attribute | Value |
|---|---|
| Business objective | Cut arrears and front-desk workload: the school becomes a creditor on the Fatourati network and the parent pays from their banking app, an ATM, a mobile wallet, or a cash agent, with automatic reconciliation; ZSchool never holds funds (§2.8). Adopted as the primary rail from V1 under DEC-31 (Collect, then Aggregator), which overrides the "later version" wording for online payments in §7.7 and §12. |
| Actors | Financially responsible parent (payment), school (creditor, receivables tracking), ZSchool (aggregator connection, no fund custody), banks and payment institutions (rail). |
| Lead personas | 05 PAR (owns payment), 02 SEC (tracks reconciliation), 01 DIR (tracks collection). |
| Step detail | Persona file 05 (PJ-PAR online-payment steps); payments context: PROJECT.md §2.8. |
| Modules involved | FIN (receivables, reconciliation, receipts), COM (payment confirmation to the parent), the `INT-FAT` integration carried by `prd/cross-cutting/35-external-integrations.md`. |
| Seasonality | Monthly, aligned with PC-07's payment schedules; gradual ramp-up after connection. |
| Version | V1 (DEC-31); card payment with a stored card (NAPS e-Premium or Chari Pay) and direct debit remain V2 (DEC-31). |
| Baseline | (→ DEC-31, H-09; context: PROJECT.md §2.8, §7.7) |

### PC-09 — Inter-school transfer within ZSchool and exit dossier outside ZSchool

| Attribute | Value |
|---|---|
| Business objective | Smooth school mobility without data leakage: internal ZSchool transfer on the same global identity with a shared scope chosen by the legal guardian (default transfer profile, logged consent); for departure to a school outside ZSchool, delivery of a bilingual PDF exit dossier accessible via a time-limited secure link, with a verification QR code (DEC-32), and a clean close (balance, leaving certificate). |
| Actors | Any legal guardian, the custodian, or the adult student (initiation), legal tutor or adult student (signature and consent, RG-14b), the originating school's leadership (validation: non-blocking balance, equipment, leaving certificate; refusal possible only for a missing tutor signature), the receiving school (acceptance or reasoned refusal: capacity, unauthorized cycle, incomplete file; activation), secretariat (issuing the dossier), the Massar procedure carried out outside ZSchool (reference recorded from MVP, FR-INS-19). Dossier statuses: initiated, validated by the origin, accepted by the destination, activated, refused, cancelled, expired after 30 days without activation (ARB-22). |
| Lead personas | 01 DIR (owns validation), 02 SEC (issuing, closing), 05 PAR and 06 GAR (request and scope choice), 07 ELE (transferred identity; case of the adult student in control of her own sharing). |
| Step detail | Persona files 01, 02, and 05 (PJ-DIR, PJ-SEC, and PJ-PAR transfer steps); transfers: PROJECT.md §7.9; ownership and portability: §6.9. |
| Modules involved | TRA (request, consent, closing to TRANSFERRED, creating the receiving enrollment, transfer log), DOC (leaving certificate, exit dossier), FIN (balance after departure, settlement: the financial relationship survives closing), MAS (Massar transfer reference), ADM (linking the identity at the receiving school), CAR (minimal read-only school directory, RG-23: naming the receiving school). |
| Seasonality | One-off throughout the year, heavily concentrated in June–September (relocations, moves, streaming decisions). |
| Version | MVP for a simple transfer between two ZSchool schools (closing the origin and activating the receiving enrollment in one transaction, refusal, cancellation, expiry, re-entry via a new enrollment — ARB-03e, ARB-22), the PDF exit dossier (account statement delivered only to the financially responsible parent, ARB-20e), the annual transcript and year-end decision (ARB-01), the Massar reference (FR-INS-19), and arrival from a non-ZSchool school (declared prior history, PJ-SEC-10); V1 for the time-limited secure link with QR (DEC-32), the full audit log, and bulk transfer when a school closes. The ministerial procedure stays outside ZSchool (§7.9). |
| Baseline | (→ RG-10, RG-12, RG-14b, RG-16, RG-23, RG-30, RG-31, RG-32, DEC-07, DEC-08, DEC-32, G-08; ARB-03, ARB-20, ARB-22) |

### PC-10 — Self-service certificate issuance by the parent (QR)

| Attribute | Value |
|---|---|
| Business objective | Eliminate the front-desk trip for routine acts: the parent (any legal guardian or the custodian, ARB-20f) downloads the documents the school authorizes (enrollment certificate, attendance certificate, achievement certificate) themselves, bilingual, numbered, with a verification QR code; compliance guaranteed: no blocking for unpaid fees, arrears show only as an alert on the record (DEC-24). Single term: "enrollment certificate" (ARB-20g). |
| Actors | Parent (request and download), leadership (configuring which documents are self-service), secretariat (documents reserved for the front desk), a third-party verifier (checking the QR code). |
| Lead personas | 05 PAR and 06 GAR (leads; Naïma, holder of custody, obtains administrative school documents per the ministry's position, RG-14b), 02 SEC (non-self-service documents), 01 DIR (configuration). |
| Step detail | Persona files 05 and 06 (PJ-PAR and PJ-GAR document-request steps); documents: PROJECT.md §7.6. |
| Modules involved | DOC (bilingual templates, numbering, signature and seal, QR), PRT (parent portal), FIN (arrears alert, account statement), COM (availability notification). |
| Seasonality | One-off, peaking at the start of the year (administrative supporting documents) and in June (departures, exit dossiers). |
| Version | V1 (§12: self-service documents and certificates, verification QR; advanced electronic seal and timestamp from V1, DEC-30). In MVP: bilingual enrollment certificate, receipt, and student record issued at the front desk with simple sequential numbering (FR-INS-17), bulk documents for insurance purposes in MVP wave 2 (FR-DOC-15, ARB-01) — OQ-02 resolved; the qualified seal via an accredited provider (DGSSI) remains V2 (see PJ-SEC-04 in `prd/journeys/02-secretary-cashier.md`). |
| Baseline | (→ RG-14b, RG-28, RG-33, DEC-24, DEC-30, G-19) |

### PC-11 — Communication: targeted announcement, summons, moderated parent–teacher message

| Attribute | Value |
|---|---|
| Business objective | Replace informal messaging groups with a traceable, bilingual channel with delivery tracking and controlled costs (bundles charged to the school); frame parent–teacher exchanges in moderated mode by default (DEC-34: the teacher or the school opens the thread, the parent replies, leadership may view threads, which is disclosed to users). |
| Actors | Leadership (scope-targeted announcements, moderation, viewing threads, summons), teacher (announcements to their classes, opening threads), secretariat (administrative summons), head supervisor (student-life summons in V1), parents (receiving, replying in the open thread). |
| Lead personas | 01 DIR (owns announcements and moderation), 04 ENS (class announcements, threads), 03 SUR (summons), 05 PAR and 06 GAR (receiving; Ahmed wants to see everything from WhatsApp and a single app), 07 ELE. |
| Step detail | Persona files 01, 04, and 05 (PJ-DIR, PJ-ENS, and PJ-PAR communication steps); communication: PROJECT.md §7.8. |
| Modules involved | COM (announcements, messages, moderated threads, summons and meetings, bilingual templates, multi-channel routing, delivery tracking), VSC (disciplinary summons, V1), PRT (parent, student, and teacher portals). |
| Seasonality | Daily and weekly all year; one-off alerts (weather); seasonal templates (Ramadan); volume peaks at the start of the year and at period end (report cards published). |
| Version | MVP for announcements, messages, **moderated in-app parent–teacher threads** (DEC-34, ARB-21a), in-app and SMS notifications, WhatsApp utility limited to attendance notifications, per-person language, "STOP" opt-out limited to reminders and announcements, sending windows (ARB-21); V1 for the general WhatsApp Business API, push notifications (no push in MVP, ARB-21b), summons and meetings (§12 V1). OQ-01 resolved. |
| Baseline | (→ RG-38, DEC-12, DEC-34, DEC-36, G-17, H-11; ARB-21) |

---

## 3. Summary table

| ID | Journey | Personas (files) | Modules | Version |
|---|---|---|---|---|
| PC-01 | Admission of a new student (variants PC-01a single-site school, PC-01b group) | 02 SEC, 01 DIR, 05 PAR, 06 GAR, 07 ELE | INS, ADM, DOC, FIN, COM | MVP (core, declared prior history); V1 (tooled file and decision) |
| PC-02 | Bulk re-enrollment and N-to-N+1 rollover | 01 DIR, 02 SEC, 05 PAR, 06 GAR | INS, PED, FIN, COM, RAP | MVP (wave 2 — year-end close); V1 (campaign reminders, tooled councils) |
| PC-03 | School onboarding (before start of year or mid-year resumption) | 01 DIR, 02 SEC | ADM, PED, FIN, COM | MVP |
| PC-04 | Claiming an identity by a parent | 05 PAR, 06 GAR, 02 SEC, 07 ELE | ADM, INS, PRT, COM | MVP |
| PC-05 | Morning roll call and absence notification | 04 ENS, 03 SUR, 05 PAR, 06 GAR, 07 ELE | VSC, COM, RAP | MVP |
| PC-06 | Grades, class council, report cards | 04 ENS, 01 DIR, 05 PAR, 06 GAR, 07 ELE | EVA, PED, DOC, MAS, COM, RAP | MVP (grades, report cards, progressive publication); MVP wave 2 (council decisions, annual transcript, Massar exports); V1 (tooled councils, blocking compliance, QR) |
| PC-07 | Payment collection and arrears reminders | 02 SEC, 01 DIR, 05 PAR, 06 GAR | FIN, DOC, COM, RAP | MVP (core, cheques, siblings, contract, statement, voiding); V1 (cash sessions, invoices, bursaries, exports) |
| PC-08 | Fatourati online payment | 05 PAR, 02 SEC, 01 DIR | FIN, COM (+ INT-FAT) | V1 (DEC-31) |
| PC-09 | ZSchool transfer, arrival from outside ZSchool, and exit dossier | 01 DIR, 02 SEC, 05 PAR, 06 GAR, 07 ELE | TRA, DOC, FIN, MAS, ADM, CAR | MVP (simple transfer, full statuses, Massar reference, arrival from outside ZSchool); V1 (secure link and QR, DEC-32) |
| PC-10 | Self-service parent certificate (QR) | 05 PAR, 06 GAR, 02 SEC, 01 DIR | DOC, PRT, FIN, COM | MVP (front-desk issuance); V1 (self-service, QR) |
| PC-11 | Announcement, summons, moderated message | 01 DIR, 04 ENS, 03 SUR, 05 PAR, 06 GAR, 07 ELE | COM, VSC, PRT | MVP (core, in-app moderated threads); V1 (general WhatsApp, push, summons) |

---

## 4. School-year seasonality and platform load

### 4.1 Peak map (September to June)

The school year runs from early September to end of June (July for national exams) and fees are billed over ten months (PROJECT.md §2.4); the official calendar (start of year, holidays, exams) is published annually by the ministry, and religious holidays are movable, announced only a few days ahead.

| Period | School calendar | Journeys at peak | Platform load |
|---|---|---|---|
| September | Start of year | PC-03, PC-01, PC-04, PC-05, PC-07, PC-09, PC-10, PC-11 | Annual peak: Excel imports, account creation, batch invitations and claims, daily roll calls starting up, first monthly fees and enrollment charges, enrollment certificates, notification peaks (SMS/WhatsApp). |
| October–November | Steady state, continuous assessment | PC-05, PC-06, PC-07, PC-11 | Regular load: daily roll call, grade entry, monthly payments, first reminders. |
| December–January | End of first semester (or 2nd trimester for the trimester pilot school, DEC-35); winter break | PC-06, PC-07, PC-11 | Closing peak: grade locking, class councils (V1), bulk report card generation and publication, publication notification. |
| February–March | Second semester; Ramadan (movable date): shortened hours (timetable variant), with no time-zone change (permanent UTC+0 from 20/09/2026); **February 2027: pilots go live mid-year (JAL-04)** | PC-03 (resumption), PC-04, PC-06, PC-11, PC-05 | Pilot year: resumption import (settled payment schedules, cheques, S1 grades), batch invitations and claims, first roll calls; Ramadan timetable variant and message templates; possible maintenance window during the break. |
| April–May | Spring: re-enrollment campaign, May ESISE census, mock exams | PC-02, PC-01, PC-07, PC-06 | Ramp-up: pre-filled re-enrollment forms, deposits and reminders, ESISE data preparation (MAS), mock exam entry. |
| June | Year end: certifying exams (6AP, 3AC, 1st and 2nd-year baccalaureate), councils, decisions | PC-06, PC-02, PC-09, PC-10, PC-07 | Second annual peak (from June 2027 for pilots, MVP wave 2): annual report cards, year-end decisions ("undetermined" for certifying levels until the ministry's results import in July, ARB-17i), N-to-N+1 rollover (closing to COMPLETED, creating N+1 enrollments as PRE-ENROLLED, class assignment), Massar exports, exit dossiers and leaving certificates, balance settlement. |
| July–August | Outside the school year; resit exams and September admissions | PC-01, PC-03, PC-09 | Usage lull (no SaaS billing, DEC-28); preferred window for onboarding new schools, version upgrades, and heavy maintenance. |

### 4.2 Implications for platform load

- **Sizing**: the three-year technical target is 500 schools, 500,000 students, 1,000,000 guardians, and 30,000 teachers — 2.5 times DEC-27's commercial ambition on students (500,000 vs. 200,000) and about 1.7 times on schools (500 vs. 300) (domain NFR-RES, `prd/cross-cutting/32-non-functional-requirements.md`). The peaks above must be absorbed at this scale, not just on average.
- **Three kinds of peaks**: (a) peaks in concurrent sessions and account creation at the start of the year (PC-03, PC-04, PC-01); (b) bulk-processing peaks (report card generation and publication: generation under 3 s and publication for a 2,000-student school under 10 minutes, domain NFR-PERF; June rollover: batch INS processing); (c) outbound notification-throughput peaks (SMS/WhatsApp at the start of the year and at every publication, DEC-36 — a consumable cost billed to the school). 
- **Pilot geometry (DEC-35)**: a primary school of about 300 students, a middle/high school of about 800, a multi-site group of over 2,000, and a bilingual school on trimesters; the trimester school shifts and triples the "report card" peak (December, March, June) instead of two semester closings. Load tests must cover both geometries.
- **Availability**: a target of 99.5% outside announced maintenance, with maintenance windows **outside start-of-year and exam periods** (domain NFR-DISP): realistic windows are the school breaks (late December, spring) and July–August; no heavy operation (version upgrade, large support imports) in September or during June exams.
- **Offline and alert delay**: roll call and grade entry must tolerate outages with sync, and notification of the day's first absence must stay under 5 minutes after roll-call validation (including the 3-minute hold window, ARB-15), even during the start-of-year peak (PROJECT.md §10, domains NFR-OFF and NFR-PERF); fallback routing (in MVP: in-app, WhatsApp "utility" for attendance, SMS aggregator; in V1: push first, DEC-36, ARB-21b) and grouping subsequent absences into a summary size the bundle costs.
- **Controlled lulls**: July–August, with no SaaS billing (DEC-28), are used for onboarding new schools (PC-03) and technical operations; support activity stays high because of admissions (PC-01).

---

## 5. Journeys explicitly out of MVP

The following journeys are out of MVP scope (§12, DEC-15). They appear here to frame the map and keep module chapters from reintroducing them.

| Journey | Module | Version | Baseline reference |
|---|---|---|---|
| School transport (routes, check-in, notification) | SAN | V2+ | (→ PROJECT.md §7.13, §12) |
| Canteen and after-school care (subscriptions, menus, check-in) | SAN | V2+ | (→ PROJECT.md §7.13, §12) |
| Extracurricular activities and paid outings (enrollment, payments) | SAN | V2+ | (→ PROJECT.md §7.13, §12) |
| Health (medical record, sensitive data, CNDP authorization, never transferred automatically) | HEA | V2+ | (→ PROJECT.md §7.14, §12, DEC-08) |
| Teacher professional network (applications, availability; no cross-rating) — the minimal read-only school directory (RG-23: name, city, cycles) is MVP Must, see PC-09 | CAR | V2+ | (→ PROJECT.md §7.10, §12, DEC-25, RG-35) |
| Stored-card payment (NAPS e-Premium, Chari Pay) and direct debits | FIN, INT | V2+ | (→ DEC-31) |
| Dual enrollment (tutoring centers, outside activities) | INS | V2+ | (→ DEC-21, RG-08) |
| Digital school passport | TRA, DOC | V2+ | (→ PROJECT.md §12, §6.9) |
| Automatic constraint-based timetable generation | PED | V2+ | (→ PROJECT.md §7.3, §12) |
| Public API, deeper accounting integrations, direct Massar integration if an official channel opens | RAP, MAS | V2+ | (→ PROJECT.md §7.12, §12, H-04) |
| English (interface) and advanced international tracks (letter grades, GPA) | cross-cutting | V2+ | (→ PROJECT.md §10, §12) |
| Lightweight e-learning (resources, online homework) | PED | V2+ | (→ PROJECT.md §12) |

Note: the payment-conditional ancillary services of PC-10/PC-07 (transport, canteen, activities) only become operational once they ship in V2+; the principle of never blocking official documents (DEC-24) applies from MVP.

---

## Open questions

| ID | Question | Context |
|---|---|---|
| OQ-01 | Activation version for moderated parent–teacher discussion threads (DEC-34). | **Resolved — ARB-21a**: in-app moderated threads from MVP, per DEC-34 ("enabled by default") and BES-ENS-05; general WhatsApp and push in V1. PC-11 and §3 updated. |
| OQ-02 | MVP document scope (DOC module). | **Resolved — ARB-01, ARB-20g**: in MVP, bilingual enrollment certificate, receipt, and student record issued at the front desk (FR-INS-17, simple sequential numbering), leaving certificate and PDF exit dossier (FR-DOC-01), bulk documents for insurance in MVP wave 2 (FR-DOC-15); full catalog, advanced seal, QR, and self-service in V1 (PC-10). |

---

## Traceability

| Baseline ID | Covered in this file |
|---|---|
| RG-01 | PC-04 |
| RG-02 | PC-06 |
| RG-04, RG-05, RG-06, RG-07 | PC-01, PC-04 |
| RG-08, RG-09, RG-10 | PC-01, PC-02, PC-09 |
| RG-12 | PC-07, PC-09 |
| RG-12b, RG-13 | PC-01, PC-04 |
| RG-14b | PC-01, PC-09, PC-10 |
| RG-16 | PC-09 |
| RG-18 | PC-03 |
| RG-21, RG-22, RG-24, RG-25 | PC-02, PC-03 |
| RG-23 | PC-09 (minimal read-only directory); out of MVP: network features |
| RG-28 | PC-10 |
| RG-29, RG-33 | PC-06 |
| RG-30, RG-31, RG-32 | PC-09 |
| RG-35 | Out of MVP (teacher network) |
| RG-38, RG-39 | PC-05, PC-11 |
| DEC-02, DEC-10, DEC-23 | PC-03 |
| DEC-03, DEC-04, DEC-11 | PC-01, PC-04 |
| DEC-06 | PC-01, PC-02, PC-09 |
| DEC-07, DEC-08 | PC-09 |
| DEC-09 | PC-06 |
| DEC-12 | PC-05, PC-11 |
| DEC-15 | Summary table (§3), out of MVP (§5) |
| DEC-20 | PC-06 |
| DEC-21 | PC-02, out of MVP (dual enrollment) |
| DEC-24 | PC-07, PC-10 |
| DEC-25 | Out of MVP (teacher network) |
| DEC-28 | Seasonality (§4.1, §4.2) |
| DEC-30 | PC-10 |
| DEC-31 | PC-08, out of MVP (stored card, direct debits) |
| DEC-32 | PC-09 |
| DEC-34 | PC-11, OQ-01 |
| DEC-35 | PC-03, seasonality (§4.1, §4.2) |
| DEC-36 | PC-05, PC-11, seasonality (§4.2) |
| G-06, G-18 | PC-03 |
| G-07 | PC-01, PC-02 |
| G-08 | PC-09 |
| G-12, G-19 | PC-06 |
| G-14 | PC-05 |
| G-15, G-16 | PC-07 |
| G-17 | PC-11 |
| H-04 | PC-06, out of MVP (Massar integration) |
| H-09 | PC-07, PC-08 |
| H-11 | PC-11 |
| PROJECT.md §10 (NFR) | Seasonality (§4.2: NFR-RES, NFR-PERF, NFR-DISP, NFR-OFF) |
| PROJECT.md §18 (point 2) | Purpose (§1) |
| ARB-01, ARB-02, ARB-03 (`prd/cross-cutting/42-review-arbitrations.md`) | PC-02, PC-03, PC-06, PC-07, PC-09, PC-10, §3, §4.1 |
| ARB-04, ARB-05, ARB-15, ARB-21 | PC-05, PC-11, §4.2, OQ-01 |
| ARB-07, ARB-08, ARB-09 | PC-01, PC-04 |
| ARB-14, ARB-17, ARB-19, ARB-20, ARB-22 | PC-06, PC-07, PC-09, PC-10, OQ-02 |
