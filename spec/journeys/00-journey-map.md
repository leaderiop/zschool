> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-JNY-00                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Functional Specification — Journey Map                        |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/journeys/00-journey-map.md` (v0.3), old `PC-01..11` -> `JMP-ZS-001..011`, per `spec/process/id-migration-map.md` (CCR-ZS-001) |

# End-to-End Journey Map

This file gives the overview of ZSchool's critical, cross-persona journeys. Detailed steps live in the persona journey files `spec/journeys/01-school-group-director.md` through `spec/journeys/07-students-minor-and-adult.md`; the underlying requirements live in `spec/behaviors/01-administration-onboarding-subscription.md` through `spec/behaviors/14-health-sensitive-data.md`; NFR domains in `spec/cross-cutting/03-non-functional-requirements.md`; integrations in `spec/cross-cutting/06-external-integrations.md`; roadmap milestones in `spec/roadmap.md`.

---

## 1. Purpose and cross-reference conventions

This file gives the **overview of ZSchool's critical journeys**, end-to-end and cutting across personas. It fixes the shared reference list used by every other chapter. It does **not** describe the detailed steps: each journey points to the `JNY-ZS-NNN` steps carried by the persona files `spec/journeys/01-school-group-director.md` through `spec/journeys/07-students-minor-and-adult.md`, and to the `BEH-ZS-NNN` requirements of modules `spec/behaviors/01-administration-onboarding-subscription.md` through `spec/behaviors/14-health-sensitive-data.md`.

Cross-reference conventions used throughout this file:

- **Personas**: codes and order — file 01 (DIR, director), 02 (SEC, secretary-cashier), 03 (SUR, head supervisor), 04 (ENS, teacher), 05 (PAR, multi-school parent), 06 (GAR, custodial/guardian mother), 07 (ELE, students Youssef and Salma). The list of personas and their needs is carried by `spec/urs.md` (URS-ZS-…).
- **Modules**: `<MOD>` codes (ADM, INS, PED, VSC, EVA, DOC, FIN, COM, TRA, CAR, RAP, MAS, SAN, HEA, PRT); each module's file is one of `spec/behaviors/01-administration-onboarding-subscription.md` through `spec/behaviors/14-health-sensitive-data.md`. PRT (parent/student portals) is handled within the existing modules, with no dedicated file.
- **NFR**: `NFR-<DOM>` domains carried by `spec/cross-cutting/03-non-functional-requirements.md`; this file cites the domains (RES, PERF, DISP…) without numbering them.
- **Journey identifiers**: this map assigns each critical journey the identifier `JMP-ZS-NNN`. Detailed steps remain `JNY-ZS-NNN` (persona files): no `JNY-ZS` is created here.

---

## 2. Critical journeys

### JMP-ZS-001 — Admission of a new student: application, decision, enrollment, documents

| Attribute | Value |
|---|---|
| Business objective | Convert an application into a complete, billed ACTIVE enrollment (application, documents, guardians, internal rules, Law 09.08 notices) without re-entry, with enrollment documents issued immediately. |
| Actors | Secretary (data entry and documents), leadership (decision, admission tests), parent/legal tutor (submission, signatures; the legal tutor is the signer, INV-ZS-066), ZSchool support (matching and duplicates). |
| Lead personas | 02 SEC (lead), 01 DIR (decision), 05 PAR and 06 GAR (submission and signatures), 07 ELE (admitted student). |
| Variants | **Variant a — single-site school** (Fatima, a 350-pupil primary school in Salé): full front-desk enrollment in one pass, implicit admission decision by leadership; **Variant b — multi-site group** (Si Abdellah, Casablanca): tooled application file, tests, and waitlist (V1), site-level leadership decision (JNY-ZS-008). Both variants share identity creation, matching, and activation. Case of a student arriving from a non-ZSchool school: declared prior history (JNY-ZS-020, ADR-ZS-063). |
| Step detail | Persona files 02 (admission PJ-SEC steps: JNY-ZS-011, JNY-ZS-020) and 01 (decision: JNY-ZS-008); identity creation and matching: PROJECT.md §6.2; guardian matching by mobile number (ADR-ZS-050). |
| Modules involved | INS (application, decision, enrollment), ADM (identities, Massar matching, duplicates), DOC (enrollment documents), FIN (enrollment fee, deposit), COM (test invitation, decision notification). |
| Seasonality | One-off per student, at high volume from March (competing re-enrollments, word of mouth) through September (start of year); bottlenecks in July–August. |
| Version | MVP for the enrollment core (simplified state machine, §12; CANCELLED state and import activation, ADR-ZS-043, ADR-ZS-044), a child declared by the parent (ADR-ZS-050), and declared prior history (ADR-ZS-063); V1 for the online application file, tests, waitlist, and tooled decision (§12 V1, JNY-ZS-008). |
| Baseline | (→ INV-ZS-054, INV-ZS-055, INV-ZS-056, INV-ZS-058, INV-ZS-060, INV-ZS-064, INV-ZS-066, ADR-ZS-014, ADR-ZS-015, ADR-ZS-017, G-07; ADR-ZS-043, ADR-ZS-044, ADR-ZS-050, ADR-ZS-063) |

### JMP-ZS-002 — Bulk re-enrollment and year N-to-N+1 rollover

| Attribute | Value |
|---|---|
| Business objective | Secure retention and cash flow before summer (pre-filled re-enrollment campaign, deposits, reminders), then produce year N+1 without re-entry: bulk year-end decisions, creation of N+1 enrollments, class assignment, handling of departures. |
| Actors | Leadership (promotion decisions, validation), secretariat (campaign, deposits, class assignment), parents (confirmation and deposit), the class council upstream (decisions and remarks in MVP wave 2, tooled preparation in V1). |
| Lead personas | 01 DIR (owns the decisions), 02 SEC (owns the campaign and assignment), 05 PAR and 06 GAR (confirmation). |
| Step detail | Persona files 01 and 02 (rollover PJ-DIR and PJ-SEC steps); enrollment lifecycle: PROJECT.md §6.3; cloned structure: §6.7. |
| Modules involved | INS (re-enrollment campaign, rollover, decisions, assignment), PED (cloning the N+1 structure, INV-ZS-077), FIN (deposits, N+1 payment schedules, sibling discount), COM (campaign reminders), RAP (re-enrollment rate, N+1 headcounts). |
| Seasonality | Seasonal: re-enrollment campaign in spring (re-enrollment fees are "often paid in spring, with a deposit," §2.8), rollover in June (first occurrence: June 2027 for pilots, RDM-ZS-003), decisions before students leave. |
| Version | **MVP (wave 2 — year-end close, RDM-ZS-003)** for bulk year-end decisions, closing every present student as COMPLETED, creating N+1 enrollments as PRE-ENROLLED, structure cloning (INV-ZS-077), class assignment, pre-filled re-enrollment forms and the deposit (ADR-ZS-041, ADR-ZS-044); V1 for automated campaign reminders and tooled council preparation. Rules: every student present at closing moves to COMPLETED with a decision, "streamed" is not a departure, a departure "at the next school year" = COMPLETED with no N+1 enrollment (ADR-ZS-044 (variants ARB-03c/d)). |
| Baseline | (→ INV-ZS-058, INV-ZS-059, INV-ZS-060, INV-ZS-077, ADR-ZS-017, ADR-ZS-002, G-07; ADR-ZS-041, ADR-ZS-044) |

### JMP-ZS-003 — School onboarding (tenant, structure model, Excel import)

| Attribute | Value |
|---|---|
| Business objective | Get a school into production quickly and cleanly: tenant created and configured (legal identity, languages, channels), academic structure instantiated from the national model, initial data imported from Excel with duplicate control, internal users and roles in place; shorten the time to first value (first roll call, first payment). |
| Actors | ZSchool team (provisioning, support, import validation), leadership (configuration, fee schedule, roles), secretariat (reviewing import reports). |
| Lead personas | 01 DIR (lead), 02 SEC (imports and review). |
| Step detail | Persona files 01 and 02 (PJ-DIR and PJ-SEC start-up steps); tenant and structure: PROJECT.md §6.6 and §6.7. |
| Modules involved | ADM (tenant creation, setup wizard, bulk imports, users and roles, subscription lifecycle), PED (national structure model, year, periods, grading scales), FIN (initial fee schedule), COM (invitations for internal accounts). |
| Seasonality | One-off per school; two windows: **April to August** (before the start of the school year) and **mid-year** (resumption after mid-year: pilots go live from 01/02/2027, RDM-ZS-001). Mid-year resumption also imports partially-paid payment schedules, cheques in hand, current-semester marks, and aggregated absences, and activates enrollments through a traced "import activation" (ADR-ZS-043; JNY-ZS-001, JNY-ZS-021). The ADR-ZS-035 pilots (a primary school of about 300 students, a middle/high school of about 800, a multi-site group of over 2,000, a bilingual school running on trimesters) set the scale of initial imports; the group is set up from MVP in read-only consolidated view (ADR-ZS-041). |
| Version | MVP (§12: school onboarding, Excel import, national structure model; mid-year resumption and read-only consolidated organization: ADR-ZS-041, ADR-ZS-043). |
| Baseline | (→ INV-ZS-070, INV-ZS-073, INV-ZS-074, INV-ZS-076, ADR-ZS-013, ADR-ZS-021, ADR-ZS-004, G-06, G-18, ADR-ZS-035; ADR-ZS-041, ADR-ZS-043) |

### JMP-ZS-004 — Claiming a student identity by a parent via an invitation code

| Attribute | Value |
|---|---|
| Business objective | Activate every parent on their own account (no shared accounts, INV-ZS-063) and link the child's global identity: identity reliability, wider adoption of the parent app (multi-school network effect), fewer calls to the front office for information. |
| Actors | Parent/guardian (claim with a knowledge challenge: the child's date of birth entered, never displayed, ADR-ZS-049), school (issuing invitations, validating weak matches, revoking an incorrect claim), ZSchool support (auditable merge, INV-ZS-056, MVP, ADR-ZS-041), student (own access from the level set by the school, INV-ZS-051; generated login identifier for a minor without their own phone, ADR-ZS-048). |
| Lead personas | 05 PAR (lead), 06 GAR (guardian claiming her daughter's access), 02 SEC (issuing and validation), 07 ELE (activation of student access). |
| Step detail | Persona files 05 and 06 (PJ-PAR and PJ-GAR claim steps); identity creation paths: PROJECT.md §6.2. |
| Modules involved | ADM (identities, invitations, strong/weak matching, merging), INS (parent–student relationships and qualities), PRT (parent portal, multi-school switcher), COM (invitation and notifications). |
| Seasonality | Daily in steady state, with a massive peak at the September start of year (batch invitations following imports and enrollments). |
| Version | MVP (§12: global identities, Massar matching, invitations and claim; guardian matching by mobile number, a child declared by the parent, login identifier distinct from the contact number, number change: ADR-ZS-048, ADR-ZS-049, ADR-ZS-050). |
| Baseline | (→ INV-ZS-051, INV-ZS-055, INV-ZS-056, INV-ZS-057, INV-ZS-063, INV-ZS-064, ADR-ZS-014, ADR-ZS-015, ADR-ZS-022; ADR-ZS-048, ADR-ZS-049, ADR-ZS-050) |

### JMP-ZS-005 — Morning roll call and absence notification to guardians

| Attribute | Value |
|---|---|
| Business objective | Guarantee the child's safety and the family's peace of mind: roll call taken by **declared session** (course, date, chosen time slot; the V1 timetable will feed expected sessions, ADR-ZS-045) or by half-day, with notification of the **first absence of the day** delivered to guardians in under 5 minutes after validation (a baseline non-functional requirement), after a 3-minute hold window allowing correction, a correction notice if amended after sending, an evening summary for subsequent absences, a half-day summary by default in preschool (ADR-ZS-056), despite unstable in-class connectivity (offline mode). |
| Actors | Teacher (taking the roll for their course, scoped to their students, INV-ZS-091), head supervisor (today's absentees, follow-ups, excuses — including an excuse recorded at the front desk on the parent's behalf, ADR-ZS-056 (ARB-15d); declaring sessions not held, ADR-ZS-046), parents (notification, excuse with attachment), leadership (alert thresholds, statistics). |
| Lead personas | 04 ENS (owns roll call), 03 SUR (owns the day's follow-up), 05 PAR and 06 GAR (notification and excuse), 07 ELE. |
| Step detail | Persona files 04 (owns roll call) and 03 (day's follow-up), daily-roll-call PJ-ENS and PJ-SUR steps; attendance: PROJECT.md §7.4. |
| Modules involved | VSC (roll call, offline and sync, excuses, thresholds), COM (multi-channel notifications per ADR-ZS-036), RAP (day's student-life dashboard). |
| Seasonality | Daily (every school day, all year); offline tolerance in constant use. |
| Version | MVP (§12: attendance with SMS/WhatsApp notification, excuses; declared sessions, grouping, hold window and correction notice, front-desk excuse, session not held: ADR-ZS-045, ADR-ZS-046, ADR-ZS-056). MVP channels: in-app, SMS, WhatsApp utility limited to attendance notifications; no push in MVP (ADR-ZS-062 (ARB-21b)). |
| Baseline | (→ INV-ZS-090, INV-ZS-091, ADR-ZS-023, ADR-ZS-036, G-14; delay under 5 minutes and offline mode: PROJECT.md §10; ADR-ZS-045, ADR-ZS-046, ADR-ZS-056, ADR-ZS-062) |

### JMP-ZS-006 — Grade entry, class council, report card publication

| Attribute | Value |
|---|---|
| Business objective | Produce bilingual, reliable, immutable report cards, compliant with the national continuous-assessment framework (at least two assessments per subject per semester; warning before closing in MVP, blocking in V1, arbitration D3), published to families (QR verification in V1, ADR-ZS-011, ADR-ZS-060), with rolling, configurable progressive publication of grades available from MVP (ADR-ZS-058 (ARB-17f)), and preparing Massar exports to cut double entry (H-04: no automation of Massar data entry; exports in MVP wave 2, ADR-ZS-041). |
| Actors | Teacher (mobile or web entry, by subject and class), leadership (period closing and locking, chairing the council, publication), class council (remarks, decisions), parents and students (viewing), head supervisor (supporting conduct). |
| Lead personas | 04 ENS (owns evening entry), 01 DIR (owns closing and publication), 05 PAR, 06 GAR and 07 ELE (viewing; adult student Salma checks her transcripts for her applications, INV-ZS-052). |
| Step detail | Persona files 04 (PJ-ENS entry steps) and 01 (PJ-DIR council and publication steps); assessments: PROJECT.md §7.5. |
| Modules involved | EVA (assessment types, entry, configurable calculation, class council, versioned report cards), PED (periods, grading scales, coefficients), DOC (verification QR), MAS (compliance check, grade exports), COM (publication notification), RAP (results by subject). |
| Seasonality | Continuous entry (weekly in steady state); peaks at period end: two annual closings on a semester calendar, three for the bilingual pilot school on trimesters (ADR-ZS-035); import of certifying exam results in June. |
| Version | MVP for entry, averages (ADR-ZS-058 calculation rules: markers, scales rebased to 20, ungraded subjects, class change, rank exclusion), published bilingual immutable report cards, and progressive publication; MVP wave 2 for council decision and remark entry with a simplified minutes, the annual transcript, and Massar exports; V1 for tooled council preparation, the blocking compliance check, the QR code, and the cumulative transcript (§12; ADR-ZS-041, ADR-ZS-058, ADR-ZS-060). |
| Baseline | (→ INV-ZS-052, INV-ZS-081, INV-ZS-085, ADR-ZS-020, ADR-ZS-021, ADR-ZS-001, G-12, G-19, H-04; ADR-ZS-041, ADR-ZS-058, ADR-ZS-060) |

### JMP-ZS-007 — Collecting a monthly payment and chasing arrears

| Attribute | Value |
|---|---|
| Business objective | Maximize the school's collection (cash flow): tracked payment across every method (cash, cheque, transfer, online), immediate receipt, automated graduated reminders, a clear view of arrears — all without ever blocking official documents for unpaid fees (ADR-ZS-005). |
| Actors | Secretary-cashier (payment, receipt, voiding or correcting a payment via a traced reversal, ADR-ZS-061 (ARB-20b), cheques, cash session in V1), accountant or leadership (reminders, aged balance, negotiated discounts and internal bursaries), the financially responsible parent (payment, including a family payment split across several children with a single receipt, ADR-ZS-061 (ARB-20a); may differ from the legal guardian; third-party payer, ADR-ZS-055). |
| Lead personas | 02 SEC (lead), 01 DIR (steering arrears), 05 PAR and 06 GAR (payment; Naïma receives the information, the paying father stays informed). |
| Step detail | Persona file 02 (PJ-SEC cash and reminder steps); finance: PROJECT.md §7.7. |
| Modules involved | FIN (payment schedules, payments, receipts, arrears, reminders, aged balance, sibling discount), DOC (printable receipt, sent to the parent), COM (SMS/WhatsApp reminders, templates), RAP (arrears table by class and guardian). |
| Seasonality | Monthly over ten months (September to June), peaking at the start of each month and at the start of the year; ongoing reminders; cheques handed over at the start of the year with due dates (§2.8). |
| Version | MVP for core finance (fee schedule, payment schedule with pro-rated part-month billing due in full, ADR-ZS-061 (ARB-20c), payments, sequentially numbered tamper-proof receipts, arrears, in-app and SMS reminders, **cheque lifecycle**, **sibling discount**, **Law 59.21 parents' contract**, **account statement** to the financially responsible parent, payment voiding, family payment — ADR-ZS-041, ADR-ZS-061); V1 for cash sessions, compliant invoices, negotiated discounts and bursaries, accounting exports, postal mail, WhatsApp reminders (§12). |
| Baseline | (→ INV-ZS-062, INV-ZS-064, ADR-ZS-005, G-15, G-16, H-09; ADR-ZS-041, ADR-ZS-055, ADR-ZS-061) |

### JMP-ZS-008 — Online payment via Fatourati

| Attribute | Value |
|---|---|
| Business objective | Cut arrears and front-desk workload: the school becomes a creditor on the Fatourati network and the parent pays from their banking app, an ATM, a mobile wallet, or a cash agent, with automatic reconciliation; ZSchool never holds funds (§2.8). Adopted as the primary rail from V1 under ADR-ZS-031 (Collect, then Aggregator), which overrides the "later version" wording for online payments in §7.7 and §12. |
| Actors | Financially responsible parent (payment), school (creditor, receivables tracking), ZSchool (aggregator connection, no fund custody), banks and payment institutions (rail). |
| Lead personas | 05 PAR (owns payment), 02 SEC (tracks reconciliation), 01 DIR (tracks collection). |
| Step detail | Persona file 05 (PJ-PAR online-payment steps); payments context: PROJECT.md §2.8. |
| Modules involved | FIN (receivables, reconciliation, receipts), COM (payment confirmation to the parent), the `INT-FAT` integration carried by `spec/cross-cutting/06-external-integrations.md`. |
| Seasonality | Monthly, aligned with JMP-ZS-007's payment schedules; gradual ramp-up after connection. |
| Version | V1 (ADR-ZS-031); card payment with a stored card (NAPS e-Premium or Chari Pay) and direct debit remain V2 (ADR-ZS-031). |
| Baseline | (→ ADR-ZS-031, H-09; context: PROJECT.md §2.8, §7.7) |

### JMP-ZS-009 — Inter-school transfer within ZSchool and exit dossier outside ZSchool

| Attribute | Value |
|---|---|
| Business objective | Smooth school mobility without data leakage: internal ZSchool transfer on the same global identity with a shared scope chosen by the legal guardian (default transfer profile, logged consent); for departure to a school outside ZSchool, delivery of a bilingual PDF exit dossier accessible via a time-limited secure link, with a verification QR code (ADR-ZS-032), and a clean close (balance, leaving certificate). |
| Actors | Any legal guardian, the custodian, or the adult student (initiation), legal tutor or adult student (signature and consent, INV-ZS-066), the originating school's leadership (validation: non-blocking balance, equipment, leaving certificate; refusal possible only for a missing tutor signature), the receiving school (acceptance or reasoned refusal: capacity, unauthorized cycle, incomplete file; activation), secretariat (issuing the dossier), the Massar procedure carried out outside ZSchool (reference recorded from MVP, BEH-ZS-039). Dossier statuses: initiated, validated by the origin, accepted by the destination, activated, refused, cancelled, expired after 30 days without activation (ADR-ZS-063). |
| Lead personas | 01 DIR (owns validation), 02 SEC (issuing, closing), 05 PAR and 06 GAR (request and scope choice), 07 ELE (transferred identity; case of the adult student in control of her own sharing). |
| Step detail | Persona files 01, 02, and 05 (PJ-DIR, PJ-SEC, and PJ-PAR transfer steps); transfers: PROJECT.md §7.9; ownership and portability: §6.9. |
| Modules involved | TRA (request, consent, closing to TRANSFERRED, creating the receiving enrollment, transfer log), DOC (leaving certificate, exit dossier), FIN (balance after departure, settlement: the financial relationship survives closing), MAS (Massar transfer reference), ADM (linking the identity at the receiving school), CAR (minimal read-only school directory, INV-ZS-075: naming the receiving school). |
| Seasonality | One-off throughout the year, heavily concentrated in June–September (relocations, moves, streaming decisions). |
| Version | MVP for a simple transfer between two ZSchool schools (closing the origin and activating the receiving enrollment in one transaction, refusal, cancellation, expiry, re-entry via a new enrollment — ADR-ZS-044 (ARB-03e), ADR-ZS-063), the PDF exit dossier (account statement delivered only to the financially responsible parent, ADR-ZS-061 (ARB-20e)), the annual transcript and year-end decision (ADR-ZS-041), the Massar reference (BEH-ZS-039), and arrival from a non-ZSchool school (declared prior history, JNY-ZS-020); V1 for the time-limited secure link with QR (ADR-ZS-032), the full audit log, and bulk transfer when a school closes. The ministerial procedure stays outside ZSchool (§7.9). |
| Baseline | (→ INV-ZS-060, INV-ZS-062, INV-ZS-066, INV-ZS-068, INV-ZS-075, INV-ZS-082, INV-ZS-083, INV-ZS-084, ADR-ZS-018, ADR-ZS-019, ADR-ZS-032, G-08; ADR-ZS-044, ADR-ZS-061, ADR-ZS-063) |

### JMP-ZS-010 — Self-service certificate issuance by the parent (QR)

| Attribute | Value |
|---|---|
| Business objective | Eliminate the front-desk trip for routine acts: the parent (any legal guardian or the custodian, ADR-ZS-061 (ARB-20f)) downloads the documents the school authorizes (enrollment certificate, attendance certificate, achievement certificate) themselves, bilingual, numbered, with a verification QR code; compliance guaranteed: no blocking for unpaid fees, arrears show only as an alert on the record (ADR-ZS-005). Single term: "enrollment certificate" (ADR-ZS-061 (ARB-20g)). |
| Actors | Parent (request and download), leadership (configuring which documents are self-service), secretariat (documents reserved for the front desk), a third-party verifier (checking the QR code). |
| Lead personas | 05 PAR and 06 GAR (leads; Naïma, holder of custody, obtains administrative school documents per the ministry's position, INV-ZS-066), 02 SEC (non-self-service documents), 01 DIR (configuration). |
| Step detail | Persona files 05 and 06 (PJ-PAR and PJ-GAR document-request steps); documents: PROJECT.md §7.6. |
| Modules involved | DOC (bilingual templates, numbering, signature and seal, QR), PRT (parent portal), FIN (arrears alert, account statement), COM (availability notification). |
| Seasonality | One-off, peaking at the start of the year (administrative supporting documents) and in June (departures, exit dossiers). |
| Version | V1 (§12: self-service documents and certificates, verification QR; advanced electronic seal and timestamp from V1, ADR-ZS-011). In MVP: bilingual enrollment certificate, receipt, and student record issued at the front desk with simple sequential numbering (BEH-ZS-037), bulk documents for insurance purposes in MVP wave 2 (BEH-ZS-145, ADR-ZS-041) — OQ-ZS-182 resolved; the qualified seal via an accredited provider (DGSSI) remains V2 (see JNY-ZS-014 in `spec/journeys/02-secretary-cashier.md`). |
| Baseline | (→ INV-ZS-066, INV-ZS-080, INV-ZS-085, ADR-ZS-005, ADR-ZS-011, G-19) |

### JMP-ZS-011 — Communication: targeted announcement, summons, moderated parent–teacher message

| Attribute | Value |
|---|---|
| Business objective | Replace informal messaging groups with a traceable, bilingual channel with delivery tracking and controlled costs (bundles charged to the school); frame parent–teacher exchanges in moderated mode by default (ADR-ZS-034: the teacher or the school opens the thread, the parent replies, leadership may view threads, which is disclosed to users). |
| Actors | Leadership (scope-targeted announcements, moderation, viewing threads, summons), teacher (announcements to their classes, opening threads), secretariat (administrative summons), head supervisor (student-life summons in V1), parents (receiving, replying in the open thread). |
| Lead personas | 01 DIR (owns announcements and moderation), 04 ENS (class announcements, threads), 03 SUR (summons), 05 PAR and 06 GAR (receiving; Ahmed wants to see everything from WhatsApp and a single app), 07 ELE. |
| Step detail | Persona files 01, 04, and 05 (PJ-DIR, PJ-ENS, and PJ-PAR communication steps); communication: PROJECT.md §7.8. |
| Modules involved | COM (announcements, messages, moderated threads, summons and meetings, bilingual templates, multi-channel routing, delivery tracking), VSC (disciplinary summons, V1), PRT (parent, student, and teacher portals). |
| Seasonality | Daily and weekly all year; one-off alerts (weather); seasonal templates (Ramadan); volume peaks at the start of the year and at period end (report cards published). |
| Version | MVP for announcements, messages, **moderated in-app parent–teacher threads** (ADR-ZS-034, ADR-ZS-062 (ARB-21a)), in-app and SMS notifications, WhatsApp utility limited to attendance notifications, per-person language, "STOP" opt-out limited to reminders and announcements, sending windows (ADR-ZS-062); V1 for the general WhatsApp Business API, push notifications (no push in MVP, ADR-ZS-062 (ARB-21b)), summons and meetings (§12 V1). OQ-ZS-181 resolved. |
| Baseline | (→ INV-ZS-090, ADR-ZS-023, ADR-ZS-034, ADR-ZS-036, G-17, H-11; ADR-ZS-062) |

---

## 3. Summary table

| ID | Journey | Personas (files) | Modules | Version |
|---|---|---|---|---|
| JMP-ZS-001 | Admission of a new student (variants variant a single-site school, variant b group) | 02 SEC, 01 DIR, 05 PAR, 06 GAR, 07 ELE | INS, ADM, DOC, FIN, COM | MVP (core, declared prior history); V1 (tooled file and decision) |
| JMP-ZS-002 | Bulk re-enrollment and N-to-N+1 rollover | 01 DIR, 02 SEC, 05 PAR, 06 GAR | INS, PED, FIN, COM, RAP | MVP (wave 2 — year-end close); V1 (campaign reminders, tooled councils) |
| JMP-ZS-003 | School onboarding (before start of year or mid-year resumption) | 01 DIR, 02 SEC | ADM, PED, FIN, COM | MVP |
| JMP-ZS-004 | Claiming an identity by a parent | 05 PAR, 06 GAR, 02 SEC, 07 ELE | ADM, INS, PRT, COM | MVP |
| JMP-ZS-005 | Morning roll call and absence notification | 04 ENS, 03 SUR, 05 PAR, 06 GAR, 07 ELE | VSC, COM, RAP | MVP |
| JMP-ZS-006 | Grades, class council, report cards | 04 ENS, 01 DIR, 05 PAR, 06 GAR, 07 ELE | EVA, PED, DOC, MAS, COM, RAP | MVP (grades, report cards, progressive publication); MVP wave 2 (council decisions, annual transcript, Massar exports); V1 (tooled councils, blocking compliance, QR) |
| JMP-ZS-007 | Payment collection and arrears reminders | 02 SEC, 01 DIR, 05 PAR, 06 GAR | FIN, DOC, COM, RAP | MVP (core, cheques, siblings, contract, statement, voiding); V1 (cash sessions, invoices, bursaries, exports) |
| JMP-ZS-008 | Fatourati online payment | 05 PAR, 02 SEC, 01 DIR | FIN, COM (+ INT-FAT) | V1 (ADR-ZS-031) |
| JMP-ZS-009 | ZSchool transfer, arrival from outside ZSchool, and exit dossier | 01 DIR, 02 SEC, 05 PAR, 06 GAR, 07 ELE | TRA, DOC, FIN, MAS, ADM, CAR | MVP (simple transfer, full statuses, Massar reference, arrival from outside ZSchool); V1 (secure link and QR, ADR-ZS-032) |
| JMP-ZS-010 | Self-service parent certificate (QR) | 05 PAR, 06 GAR, 02 SEC, 01 DIR | DOC, PRT, FIN, COM | MVP (front-desk issuance); V1 (self-service, QR) |
| JMP-ZS-011 | Announcement, summons, moderated message | 01 DIR, 04 ENS, 03 SUR, 05 PAR, 06 GAR, 07 ELE | COM, VSC, PRT | MVP (core, in-app moderated threads); V1 (general WhatsApp, push, summons) |

---

## 4. School-year seasonality and platform load

### 4.1 Peak map (September to June)

The school year runs from early September to end of June (July for national exams) and fees are billed over ten months (PROJECT.md §2.4); the official calendar (start of year, holidays, exams) is published annually by the ministry, and religious holidays are movable, announced only a few days ahead.

| Period | School calendar | Journeys at peak | Platform load |
|---|---|---|---|
| September | Start of year | JMP-ZS-003, JMP-ZS-001, JMP-ZS-004, JMP-ZS-005, JMP-ZS-007, JMP-ZS-009, JMP-ZS-010, JMP-ZS-011 | Annual peak: Excel imports, account creation, batch invitations and claims, daily roll calls starting up, first monthly fees and enrollment charges, enrollment certificates, notification peaks (SMS/WhatsApp). |
| October–November | Steady state, continuous assessment | JMP-ZS-005, JMP-ZS-006, JMP-ZS-007, JMP-ZS-011 | Regular load: daily roll call, grade entry, monthly payments, first reminders. |
| December–January | End of first semester (or 2nd trimester for the trimester pilot school, ADR-ZS-035); winter break | JMP-ZS-006, JMP-ZS-007, JMP-ZS-011 | Closing peak: grade locking, class councils (V1), bulk report card generation and publication, publication notification. |
| February–March | Second semester; Ramadan (movable date): shortened hours (timetable variant), with no time-zone change (permanent UTC+0 from 20/09/2026); **February 2027: pilots go live mid-year (RDM-ZS-001)** | JMP-ZS-003 (resumption), JMP-ZS-004, JMP-ZS-006, JMP-ZS-011, JMP-ZS-005 | Pilot year: resumption import (settled payment schedules, cheques, S1 grades), batch invitations and claims, first roll calls; Ramadan timetable variant and message templates; possible maintenance window during the break. |
| April–May | Spring: re-enrollment campaign, May ESISE census, mock exams | JMP-ZS-002, JMP-ZS-001, JMP-ZS-007, JMP-ZS-006 | Ramp-up: pre-filled re-enrollment forms, deposits and reminders, ESISE data preparation (MAS), mock exam entry. |
| June | Year end: certifying exams (6AP, 3AC, 1st and 2nd-year baccalaureate), councils, decisions | JMP-ZS-006, JMP-ZS-002, JMP-ZS-009, JMP-ZS-010, JMP-ZS-007 | Second annual peak (from June 2027 for pilots, MVP wave 2): annual report cards, year-end decisions ("undetermined" for certifying levels until the ministry's results import in July, ADR-ZS-058 (ARB-17i)), N-to-N+1 rollover (closing to COMPLETED, creating N+1 enrollments as PRE-ENROLLED, class assignment), Massar exports, exit dossiers and leaving certificates, balance settlement. |
| July–August | Outside the school year; resit exams and September admissions | JMP-ZS-001, JMP-ZS-003, JMP-ZS-009 | Usage lull (no SaaS billing, ADR-ZS-009); preferred window for onboarding new schools, version upgrades, and heavy maintenance. |

### 4.2 Implications for platform load

- **Sizing**: the three-year technical target is 500 schools, 500,000 students, 1,000,000 guardians, and 30,000 teachers — 2.5 times ADR-ZS-008's commercial ambition on students (500,000 vs. 200,000) and about 1.7 times on schools (500 vs. 300) (domain NFR-RES, `spec/cross-cutting/03-non-functional-requirements.md`). The peaks above must be absorbed at this scale, not just on average.
- **Three kinds of peaks**: (a) peaks in concurrent sessions and account creation at the start of the year (JMP-ZS-003, JMP-ZS-004, JMP-ZS-001); (b) bulk-processing peaks (report card generation and publication: generation under 3 s and publication for a 2,000-student school under 10 minutes, domain NFR-PERF; June rollover: batch INS processing); (c) outbound notification-throughput peaks (SMS/WhatsApp at the start of the year and at every publication, ADR-ZS-036 — a consumable cost billed to the school). 
- **Pilot geometry (ADR-ZS-035)**: a primary school of about 300 students, a middle/high school of about 800, a multi-site group of over 2,000, and a bilingual school on trimesters; the trimester school shifts and triples the "report card" peak (December, March, June) instead of two semester closings. Load tests must cover both geometries.
- **Availability**: a target of 99.5% outside announced maintenance, with maintenance windows **outside start-of-year and exam periods** (domain NFR-DISP): realistic windows are the school breaks (late December, spring) and July–August; no heavy operation (version upgrade, large support imports) in September or during June exams.
- **Offline and alert delay**: roll call and grade entry must tolerate outages with sync, and notification of the day's first absence must stay under 5 minutes after roll-call validation (including the 3-minute hold window, ADR-ZS-056), even during the start-of-year peak (PROJECT.md §10, domains NFR-OFF and NFR-PERF); fallback routing (in MVP: in-app, WhatsApp "utility" for attendance, SMS aggregator; in V1: push first, ADR-ZS-036, ADR-ZS-062 (ARB-21b)) and grouping subsequent absences into a summary size the bundle costs.
- **Controlled lulls**: July–August, with no SaaS billing (ADR-ZS-009), are used for onboarding new schools (JMP-ZS-003) and technical operations; support activity stays high because of admissions (JMP-ZS-001).

---

## 5. Journeys explicitly out of MVP

The following journeys are out of MVP scope (§12, ADR-ZS-026). They appear here to frame the map and keep module chapters from reintroducing them.

| Journey | Module | Version | Baseline reference |
|---|---|---|---|
| School transport (routes, check-in, notification) | SAN | V2+ | (→ PROJECT.md §7.13, §12) |
| Canteen and after-school care (subscriptions, menus, check-in) | SAN | V2+ | (→ PROJECT.md §7.13, §12) |
| Extracurricular activities and paid outings (enrollment, payments) | SAN | V2+ | (→ PROJECT.md §7.13, §12) |
| Health (medical record, sensitive data, CNDP authorization, never transferred automatically) | HEA | V2+ | (→ PROJECT.md §7.14, §12, ADR-ZS-019) |
| Teacher professional network (applications, availability; no cross-rating) — the minimal read-only school directory (INV-ZS-075: name, city, cycles) is MVP Must, see JMP-ZS-009 | CAR | V2+ | (→ PROJECT.md §7.10, §12, ADR-ZS-006, INV-ZS-087) |
| Stored-card payment (NAPS e-Premium, Chari Pay) and direct debits | FIN, INT | V2+ | (→ ADR-ZS-031) |
| Dual enrollment (tutoring centers, outside activities) | INS | V2+ | (→ ADR-ZS-002, INV-ZS-058) |
| Digital school passport | TRA, DOC | V2+ | (→ PROJECT.md §12, §6.9) |
| Automatic constraint-based timetable generation | PED | V2+ | (→ PROJECT.md §7.3, §12) |
| Public API, deeper accounting integrations, direct Massar integration if an official channel opens | RAP, MAS | V2+ | (→ PROJECT.md §7.12, §12, H-04) |
| English (interface) and advanced international tracks (letter grades, GPA) | cross-cutting | V2+ | (→ PROJECT.md §10, §12) |
| Lightweight e-learning (resources, online homework) | PED | V2+ | (→ PROJECT.md §12) |

Note: the payment-conditional ancillary services of JMP-ZS-010/JMP-ZS-007 (transport, canteen, activities) only become operational once they ship in V2+; the principle of never blocking official documents (ADR-ZS-005) applies from MVP.

---

## Open questions

Both questions this file originally raised (OQ-ZS-181, OQ-ZS-182) are already resolved in the source material — OQ-ZS-181 by the in-app moderated-threads decision reflected in JMP-ZS-011 above; OQ-ZS-182 by the MVP document scope reflected in JMP-ZS-010 above. Tracked with that resolved status in `spec/open-questions.md` (built in Phase 6 of the migration), not repeated locally in this file.

---

## Traceability

Full cross-reference coverage for this journey map is consolidated in `spec/traceability.md` (built in Phase 7 of the migration).
