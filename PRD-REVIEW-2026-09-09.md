# Critical review of the ZSchool PRD — problems and gaps

| Field | Value |
|---|---|
| Date | 2026-09-09 |
| Subject | `prd/` v1.0 (43 files, ~20,000 lines) against `PROJECT.md` v1.1 |
| Method | Full read of chapters 00–03 and `PROJECT.md` §6–§14; mechanical lint of identifiers (definitions, references, numbering, version tags); semantic re-read of each slice (modules 10–13, 14–17, 18–23; cross-cutting 30–36, 37–41 + research; journeys 00–07); line-by-line verification of blocking findings |
| Lint result | Continuous numbering and no orphan references across the 15 namespaces (FR, INV, BES, PJ, PER, SEC, NFR, PAK, UX, INT, CNF, JAL, KPI, R, ECR). The defects are semantic, not structural |

## 0. Verdict

The PRD is complete, well-traced, and honest about its uncertainties. It does, however, have a **structural flaw**: the MVP/V1 split is incompatible with the pilot scenario it sets for itself. Pilots come on board **mid-year on 01/02/2027** (JAL-04) and stay on MVP until summer 2028 (JAL-10), yet the PRD asks them, in June 2027, for a *rollover*, Massar exports, and a re-enrollment campaign (JAL-06, JAL-07) whose carrying requirements are all tagged V1. The same gap affects cheques, the Law 59.21 parent contract, receipt numbering, the multi-site consolidation for the "group" pilot, CNDP filings, and baseline security. **A pilot cannot get through the 2026-2027 school year on the MVP scope as written.**

Three other families of problems stand out: gaps in the data model (state machine, phone-based identity, a global health record, a teacher-confidentiality leak), business calculation rules left open at MVP, and a traceability apparatus (the OQ register, the README, KPIs, sources) that announces a consolidation it does not actually deliver.

Finding count: **19 blocking, ~95 major, ~80 minor**, deduplicated below by theme.

---

## 1. Blocking

### 1.1 The MVP does not cover the pilots' school year

| # | Finding | Evidence |
|---|---|---|
| B-01 | The N→N+1 *rollover* is required in June 2027 as "MVP (core)", yet every requirement behind it is V1: year-end decisions and N+1 creation (FR-INS-21), structure cloning (FR-PED-07, INV-42), bulk placement (FR-INS-23/24), the re-enrollment campaign (FR-INS-20). No MVP requirement lets anyone record a `YearDecision` (RG-09) or create a second `AcademicYear`. KPI-18 even says "not measurable at MVP (rollover is V1)", contradicting JAL-07 | cross-cutting/37:129-132; modules/11:436-442; modules/12:182-188; cross-cutting/38:362 |
| B-02 | Massar exports "delivered to pilots" in June 2027 (JAL-06), yet FR-MAS-01..14 are V1 except for two, and KPI-19/20/21 are "not measurable at MVP" | cross-cutting/37:219; modules/21; cross-cutting/38 |
| B-03 | Mid-year onboarding (JAL-04) with no reprise plan: the MVP import (FR-ADM-06) carries over neither instalments already collected, nor cheques received in advance, nor attendance history; the journey map assumes an "April–August" onboarding window (PC-03) even though the school year started on 07/09/2026. Pilots would start with wrong payment schedules | cross-cutting/37:181-194; journeys/00:37-64; modules/10:171 |
| B-04 | The Excel import creates ACTIVE enrollments (the FR-ADM-05 scenario) without going through the PRE-ENROLLED→ACTIVE conditions (a complete file, the initial payment, a financial guardian per INV-09, acceptance of the internal rules and the Law 09.08 notices). The import's exit state is defined nowhere; it is the entry path for 100% of pilot students | modules/10:153-171; modules/11:263-266; 03 §3.2 l.205 |
| B-05 | Cheques: the lifecycle (post-dated, deposited, bounced) is V1 (FR-FIN-12), while BES-SEC-02 is MVP, FR-FIN-10 (MVP) accepts a cheque with no state rule at all, and baseline §2.8 makes it the dominant payment method (cheques handed over in September for the whole year) | modules/16:224-231; 02:175 |
| B-06 | The Law 59.21 parent contract (in force since 23/02/2026): V1 in FR-FIN-02, FR-INS-16, CNF-11; an MVP effect of the PRE-ENROLLED→ACTIVE transition in 03 §3.2; MVP in PJ-SEC-01.7. Three versions for one legal obligation | modules/16:95-103; modules/11:335; 03:205; journeys/02:91 |
| B-07 | MVP receipts must have "a continuous, tamper-proof sequence, FR-FIN-07" (FR-FIN-17), yet FR-FIN-07 is V1: the MVP has no numbering rule for the proof-of-payment document used for cash | modules/16:145, 326-334 |
| B-08 | The MVP exit file (FR-DOC-01, INV-23) is made up of V1 pieces: the `Transcript` (FR-EVA-18, V1), the year-end decision (no MVP owner), the account statement (FR-FIN-24, V1). The MVP transfer is unbuildable as specified | modules/15:75-83; modules/14:295, 381; modules/16:439, 477 |
| B-09 | The "multi-site group of 2,000+ students" pilot (DEC-35, MVP) exists while `Organization`, group subscriptions, and consolidated views are V1 (FR-ADM-04, FR-RAP-09, PER-13, JAL-14). BES-DIR-01 ("multi-site consolidated dashboard") is nonetheless tagged Must/MVP. The director persona's need #1 is not served during the pilot | 02:161; modules/10:135; modules/20:81; cross-cutting/37 |
| B-10 | "Per-course" attendance-taking with a time slot and an "expected / recorded / pending" roll-call screen (ECR-VSC-02, MVP) assumes `TimetableSlot`, which is V1 (FR-PED-11). At MVP nothing defines what a session-to-be-called even is, or how a missing roll call is detected. Same for FR-RAP-04/06 (MVP), which display "today's classes with times and rooms" | modules/13:23, 74, 463-465; modules/12:243; modules/20 |

### 1.2 Compliance and security tagged V1 while the MVP handles real minors' data

| # | Finding | Evidence |
|---|---|---|
| B-11 | WhatsApp utility "attendance" ships at MVP (arbitration D1, INT-WAP-01), yet the sub-processor registry and the F118 template are V1 (SEC-18, CNF-03, Should V1). From February 2027 onward, a student's first name plus an absence go to Meta (United States, outside the 236-2015 list) with no formal transfer basis | cross-cutting/35:551; 31:310; 36:125-131 |
| B-12 | Adult CNIE (national ID) is collected from MVP onward (`Person`, SEC-10), yet "collecting the CIN number → F112" sits in V1; the prior authorization takes 2 to 4 months and needed to start before the end of October 2026. Only health data (V2+) is milestoned against a CNDP dependency (D-15). The same absence applies to each pilot's F211, ZSchool's own filing (DEC-16), and the data-processing agreement (CNF-08, V1) | cross-cutting/31:182, 433; 36:77, 101, 210; 37 §4 |
| B-13 | Account identifier = a unique, mandatory mobile number (INV-13, INV-37, SEC-01, UX-13). Youssef (13 years old, "shared family phone", BES-ELE-01 Must/MVP) has no number of his own, and his father's is already taken. The question is parked in OQ-06 of `journeys/07` and **is absent from the consolidated register** (`cross-cutting/40` OQ-06 covers the WhatsApp rate card instead). RG-01/INV-36 is unbuildable as specified | 03:64, 270; 31:62; 34:287; journeys/07:395 |
| B-14 | Password reset only "via the primary phone" (SEC-05): no journey for a lost, changed, or disconnected number (high SIM churn), and no rule for carrier number reassignment: a recycled number grants access to another family's account (children, finance) | cross-cutting/31:102; journeys/05:101 |
| B-15 | MVP backups sit on the same site as production: SEC-21 says "replication to a second site from MVP onward", yet SEC-20, NFR-DISP-03, and INT-HEB-02 place the second site in V1; the OCI Casablanca region has only one *availability domain*. A total loss of pilot data is possible for 18 months | cross-cutting/31:334-344; 32:165; 35:808; 40:38 |

### 1.3 Gaps in the data model

| # | Finding | Evidence |
|---|---|---|
| B-16 | `HealthRecord` is `1 — 0..1 StudentProfile` (a global entity), yet FR-HEA-06 promises an "empty record" to a new school and FR-HEA-07 a per-school purge; this contradicts DEC-08 (never transferred), DEC-18/INV-27 (every data item tied to an enrollment), and INV-18 (visible through any active relationship). The same problem, less severe, applies to `StudentDocument` (court orders, vaccination records) attached to the global profile | 03:124, 129; modules/23:81, 337 |
| B-17 | FR-CAR-12 (cross-school hour totals) shows School C "10 hours against an 8-hour cap": it reveals to one school that the teacher has affiliations elsewhere, and their volume, without the teacher sharing that. This violates RG-35, INV-29, and tenant isolation (INV-17). It also ignores hours worked outside ZSchool and in the public sector, so the total will always be wrong | modules/19:263-271 |
| B-18 | A transfer approved but never activated: on the effective date the origin school moves to TRANSFERRED (an atomic transaction, modules/18 §9), yet the destination is only "prepared" and its activation requires a complete file plus payment. If the destination declines or never activates, the student has no ACTIVE enrollment anywhere and no reverse transition exists (03 OQ-02). Missing: expiry, a decline by the destination (who declines? FR-TRA-02's "declined" contradicts DEC-24 if it is the origin school), cancellation after approval, re-entry | modules/18:112, 207; 03 §3.3 |
| B-19 | A transfer "at the start of next year" (FR-TRA-06) closes year N as TRANSFERRED instead of COMPLETED: the `YearDecision` (RG-09) is lost, so the default transfer profile (RG-31, "year-end decisions") is empty for the most common departure case. FR-INS-21 does the same for the "10 departures" at year end, and PJ-DIR-02.4 closes "promoted with a track change" students as departures, even though "promoted with a track change" (a stream/track choice) means the student stays at the school | modules/18:207; modules/11:449-454, 489; journeys/01:468 |

---

## 2. Major

### 2.1 State machine and enrollments

- **SUSPENDED with no way out**: the only transition is SUSPENDED→ACTIVE. A student who is suspended and then expelled (FR-VSC-17), transferred, withdrawn, or reaches year end stays stuck; FR-INS-21 ignores SUSPENDED students and INV-05 keeps blocking the (student, year) pair (03 §3.2; modules/11:314-316).
- **Temporary exclusion (the FR-VSC-15 sanction) is not linked to the SUSPENDED state**: does the sanction trigger the transition? Does the student still appear on roll-call lists (absent + notifications) during the exclusion? (modules/13:311; modules/11:314).
- **Double N+1 enrollment**: FR-INS-20 creates an N+1 PRE-ENROLLED enrollment once a parent confirms; FR-INS-21 creates them in bulk for every admitted student and only rejects a violation of ACTIVE uniqueness. A student already pre-enrolled gets a second enrollment; the "630 created" scenario ignores the case (modules/11:406, 440).
- **FR-INS-21 allows "PRE-ENROLLED or ACTIVE depending on policy"**, bypassing the activation conditions that FR-INS-12 and FR-INS-20 make mandatory (modules/11:440).
- **Path 2 of baseline §6.2 ("a parent declares their child, the school attaches it") has no requirement at all** in INS; the README nonetheless claims 100% coverage (modules/11; journeys/05:89, 140).
- **No guardian-matching rule**: RG-05/INV-02 cover only the student. How does School B recognize School A's Ahmed? How does an import de-duplicate the same parent appearing three times (siblings)? This is the mechanism that delivers BES-PAR-01, "one account, every school" (modules/11:253; modules/10:171).
- **Two guardians sharing one mobile number** (a household, a rural area): INV-37 makes the phone number unique per account, RG-12b bans shared accounts, FR-INS-11 requires a mobile number for every guardian. Not addressed (modules/11:253).
- **Foreign numbers**: UX-13 only validates "Moroccan +212 format"; expatriate parents or international-section families end up with no account and no SMS (cross-cutting/34:287).
- **Court-ordered restriction** recorded by the school (INV-10, tenant-scoped) on a global relationship (INV-12): its scope is undefined in FR-INS-13; `journeys/06:241` applies it "across every school", so School B enforces a decision it never saw.
- **Class capacity**: FR-PED-02's "indicative capacity" is checked by no enrollment requirement; FR-INS-04 triggers a waitlist based on a grade level's capacity, a concept absent from PED (modules/11:109, 304; modules/12:121).
- **Effective date** of a mid-year enrollment (attendance, threshold counts, Massar exports — counted from the start of year or from arrival?) is undefined (modules/11).
- **Duplicate merging is V1** (INV-03, PER-03), while the MVP import for 3 to 5 pilots (including an 1,800-student group and multi-school parents) will produce duplicates from February 2027 onward that stay unresolvable through the whole MVP (03:236; cross-cutting/30:142; journeys/01:387).
- **Guardian signature at the MVP front desk** (ECR-INS-04, accepting the internal rules and the Law 09.08 notices before ACTIVE) even though INT-SIG is V1 and the parent has often not yet claimed their account; the MVP collection method is undefined (modules/11:304, 565).
- **Cancellation/closure** close enrollments as WITHDRAWN ("left the school") even though the school itself keeps existing: students will show up as having left in their global history (modules/10:262, 286).
- **Arrival from a school outside ZSchool** (the dominant case at launch): no requirement or journey to capture the previous school, years, grade levels, decisions, or a paper certificate of departure (modules/18; modules/11; journeys/00-02).
- **Transfer initiator**: FR-TRA-01 (the legal guardian or the destination school) versus `journeys/06:197` (the custodial guardian initiates, the father signs) versus the adult student, described as the "decision-maker", who cannot initiate (modules/18:84).

### 2.2 Student life and assessments

- **Per-course notification with no aggregation**: FR-VSC-04 notifies on every validated roll call; with 6 to 8 sessions a day, a student absent all day generates 6 to 8 SMS/WhatsApp messages per guardian, billed to the school. No "first absence of the day / half-day / already notified" rule (modules/13:136-138).
- **Correcting a roll call after notification**: FR-VSC-03 logs the correction, but nothing cancels or corrects the notification already sent (the 5-minute cap forces an early send); there is no hold window before sending either (modules/13:126).
- **Front-desk justification**: a justification can only be filed by the parent from their phone (FR-VSC-07). The majority case (a paper certificate handed to the supervisor, a parent with no account) has no requirement (modules/13:201, 223).
- **Teacher absence / uncovered session / substitution**: no requirement exists in PED or VSC; this makes "expected sessions", attendance rates, and the lesson log all inaccurate (modules/12, 13).
- **Teacher vs. supervisor roll-call discrepancy**: "flagged for arbitration" (PJ-SUR OQ-04) with no priority rule and no defined effect on `AbsenceRecorded` (double notification? a wrong notification?) (journeys/03:102, 412).
- **Absent/exempt/not-assessed markers (FR-EVA-03)**: FR-EVA-07 does not say how they enter the average (an unjustified absence scores 0 in national practice, an exemption is excluded from the denominator…). This underpins every MVP average (modules/14:111, 195).
- **A mid-period class change** (RG-11, MVP): `Assessment` is attached to `Class`, grades to the enrollment; no rule covers grades from the old class, rank, or the report card (modules/14).
- **Exclusion from rank**: FR-VSC-22 delegates this "to the EVA module"; no FR-EVA requirement carries the indicator or its effect on the report card (modules/13:395; modules/14:215).
- **FR-EVA-17's "direct correction" of a published report card within 60 days** (a grace period borrowed from RG-32, which actually concerns closing an enrollment): this contradicts INV-26 and FR-EVA-15 (every correction = a new version) (modules/14:365-373).
- **Real-time grades promised at MVP** (BES-PAR-02, in the persona scenario), yet progressive publication (FR-EVA-19) is V1: the MVP only exposes grades once the report card is published (modules/14:385; 02:117, 214).
- **QR code in V1** (FR-EVA-16, FR-DOC-05, INV-26), while DEC-09 and G-19 include it; OQ-09 records this, but it is a deviation from a decision (DEC) taken without the product owner's arbitration (conventions §1.2). FR-TRA-09 (MVP) nonetheless requires the QR code in its acceptance criteria (modules/14:343; modules/18:273-287).
- **Compliance check against the national curriculum (D3)**: FR-MAS-06 points to "FR-EVA-06, MVP: a warning", yet FR-EVA-06 is V1 and already blocking; the split between EVA and MAS is ambiguous (modules/21:37, 188).
- **A bilingual school running trimesters (the DEC-35 pilot) → semester-based Massar**: no correspondence rule exists in FR-MAS-04 (modules/21).
- **Certifying exam results (July) vs. the rollover (June)**: the "graduated" decision is recorded before results are imported; changing it after COMPLETED falls under INV-25. The sequencing is not spelled out (modules/21 FR-MAS-10; modules/11 FR-INS-21).
- **Grading scales other than /20 are allowed (FR-EVA-01)** with no normalization rule before weighting (FR-EVA-09); a subject with no grade at closing: what the report card and average show is undefined (modules/14:91, 131, 215).
- **"Local unified exam"** is modeled twice: as an internal `Assessment` type (FR-EVA-01) and as a manually entered external grade (FR-EVA-10) (modules/14:91, 244).
- **Attendance rate** (FR-RAP-01, Must MVP) has no standardized definition (half-day? per course?): the requirement is not verifiable (modules/20 OQ-02).

### 2.3 Finance and documents

- **Family payment**: `Invoice` and `FinancialAccount` are per enrollment; there is no flow for "a parent settles all three children in one go" (one payment, one receipt). FR-FIN-26 aggregates the read view, not the payment itself (03:139-146; modules/16:175, 326).
- **Cancelling/correcting a wrong receipt or payment**: no journey and no requirement (credit note, a logged cancellation) even though INV-40 requires tamper-proof numbering (journeys/02:123-175; modules/16).
- **Mid-year arrival/departure proration** (OQ-06 FIN) is open, while FR-FIN-03 is MVP; "a logged manual adjustment" is not a rule. The same gap applies to proration and `UsageMetric` on a transfer (a student counted in two tenants the same month) (modules/16:109, 633; modules/18).
- **A third-party payer with no parental link** (FR-FIN-22): the model offers only `ParentStudentRelationship` to attach a `FinancialAccount`; without a relationship, INV-18 blocks access (modules/16:405; 03:75, 146).
- **Sibling discount is V1** (FR-FIN-04) yet "applied automatically" at MVP in PJ-SEC-01.6 and PJ-DIR-01.6; a 2,000-student pilot will have hundreds of sibling groups to adjust by hand (modules/16:115; journeys/02:90).
- **FR-DOC-09 vs. CNF-14**: DOC lists "next year's re-enrollment" among conditionable services; CNF-14 says the opposite (Law 59.21 bars refusing re-enrollment to a student in good standing) (modules/15:241; cross-cutting/36:317).
- **The exit file handed "to the legal guardian or the custodial parent" includes the account statement**: a non-paying custodial guardian would receive the father's financial situation (rule N7 of `30`, RG-14). RG-31 also excludes finance from the transfer profile (modules/15:79; modules/18 FR-TRA-09).
- **A certificate of departure requested by the custodial guardian**: `journeys/02` OQ-04 says "no account or guardian signature required"; `journeys/06` §5 and PJ-GAR-03.6 require the guardian's signature. Two opposing legal readings (RG-14b).
- **Document storage at MVP**: PJ-SEC-01.4 says "tracked without storage" (scanned uploads are V1) vs. PJ-GAR-01.3/04.3 (MVP), which require "a court order attached as a mandatory, encrypted file"; the same contradiction appears between FR-DOC-11 (front-desk staff upload) and FR-DOC-12 (documents reserved to leadership) (journeys/02:88; journeys/06:120; modules/15:279, 305).
- **"Gap-free" numbering (FR-DOC-04)**: three diverging statements on whether a number is consumed at preview or on abandonment (modules/15:129, 144, 425).
- **A contract signed by the guardian alone (CNF-11)**, even though INV-09 allows a third-party financial guardian: enforceability of the payment schedule against a non-signing payer is not addressed (cross-cutting/36:240).
- **An "advanced" signature via SMS OTP** on a possibly shared phone: exclusive control by the signer (Law 43.20) is not guaranteed, with no compensating requirement; the evidentiary value of the Law 59.21 contract is fragile (cross-cutting/35:643-661).
- **Bulk school-attendance certificates for back-to-school insurance** (FR-DOC-15) are V1: a September need for the pilots (modules/15:365).

### 2.4 Communication

- **Moderated parent–teacher threads**: BES-ENS-05 MVP, BES-PAR-08 V1, FR-COM-03 V1 ("MVP activation undecided"), the journey map V1, DEC-34 "on by default": five different readings of the same question (02:204, 220; modules/17:96; journeys/00:245).
- **Push at MVP**: `cross-cutting/37:71` says "the DEC-36 hierarchy applies from MVP onward", `modules/17` and `13` say "no push"; the Gherkin scenario for FR-COM-11 (Must MVP) tests push + WhatsApp + an SMS fallback and cannot run at MVP; INT-WAP-06 says "push first (native apps in V1)" even though NFR-MOB-02 puts native apps in V2 (modules/17:242-259; cross-cutting/35:623; 32:290).
- **Bilingual SMS and per-person language**: FR-COM-06 requires both FR and AR for all institutional content; an Arabic SMS is capped at 70 characters (3 to 4 billable segments). FR-COM-05 has no per-person language preference; NFR-I18N-01 says "specific to each user", while UX says "remembered per device" (wrong on a shared phone) (modules/17:136-154; cross-cutting/34:138; 32:197).
- **"STOP" opt-out handled automatically** with no defined scope: does a parent replying STOP to a reminder also cut off absence alerts, the only channel for households without a smartphone? (modules/17:140).
- **Send-time windows** (at night, during Ramadan, on Fridays) and notification batching: no requirement exists; FR-VSC-06's "quiet-hours window" contradicts the 5-minute cap asserted in the same sentence (modules/17 §5.6; modules/13:191).
- **A "read" status per channel from MVP onward (FR-COM-07)**: SMS has no read receipt (modules/17:160).
- **WABA**: one ZSchool WhatsApp number for every school, or one per school (Meta Business verification, display name, "per-school" opt-in)? Undecided; it determines whether D1 is even achievable at MVP. Inbound replies "routed to processing defined by the communication module" are undefined, and billed after 01/10/2026 (cross-cutting/35:518-569).
- **Authentication SMS** (OTP, MFA, reset, invitations), borne by ZSchool but absent from the business model (PAK): at 20,000 guardians this is a structural, uncosted expense line (cross-cutting/33; 31:445).

### 2.5 Security, compliance, operations

- **Push via FCM/APNs** (Google/Apple, United States): SEC-18 claims "the only outbound flows" are WhatsApp and email; the closed sub-processor list in CNF-09 ignores them, as it does any external APM/monitoring SaaS. This contradicts DEC-26 (cross-cutting/31:310; 36:218).
- **MVP logging**: SEC-11 (writes plus sensitive reads at MVP), PER-10 (reads in V1), arbitration D4 ("minimal history"), and `03` OQ-07: three incompatible positions. FR-TRA-04/07/11 (MVP) additionally require "every read logged" (cross-cutting/31:205; 30:212; 36:530; modules/18).
- **MVP support access**: SEC-13 (MVP with a `SupportTicket`), PER-12 (V1), `30` OQ-01 ("support with no data access"), `SupportTicket` V1 in `03`. Pilots will need actual support access (cross-cutting/31:227; 30:234, 442).
- **MFA**: FR-ADM-07 (MVP) vs. PER-17/SEC-02 (V1); and "school roles" include part-time teachers on entry-level Android phones (a paid SMS OTP per session, with trusted devices only Should-priority) (modules/10:199; cross-cutting/30; 31:72).
- **Data-subject rights** (access, rectification, opposition — Law 09.08 Art. 7-9), required from the very first processing activity: SEC-14 and CNF-05 sit in V1, with no manual MVP procedure (cross-cutting/31:255; 36:167).
- **The first penetration test is "before commercial launch (V1)"**: pilots process minors' data with no pentest (cross-cutting/31:373).
- **8-hour RTO (D5) vs. 99.5% monthly** (3 h 36 of allowed downtime): incompatible unless site disasters are explicitly excluded; the cost of the 15-minute-RPO replication is unbudgeted (cross-cutting/32:125, 163).
- **Fatourati (INT-FAT-02) calls ZSchool in real time**: a ZSchool outage stops parents paying from their bank; there is no inbound-availability NFR and no degraded mode. The contract, pricing, and SLA are unknown (H-19), with no deadline or go/no-go, even though Fatourati is a commercial differentiator (DEC-19) (cross-cutting/35:182-215).
- **Claiming a profile on a wrong number**: the invitation SMS and the child's name reach a third party, who only needs to "confirm" a displayed name/date of birth (PJ-PAR-02.2); there is no knowledge challenge and no way to revoke a fraudulent claim (journeys/05:94-140).
- **The local system administrator** manages accounts and activations: the escalation path to leadership accounts is unbounded (cross-cutting/30:81).
- **The email-plus-password path has no policy** (length, breach lists, lockout); SIM-swap is not addressed (cross-cutting/31:62).
- **Anonymization**: CNF (36:417) replaces name, date of birth, and Massar code "while keeping the registers", and DEC-22 anonymizes any account with no active relationship after 3 years. Yet `Enrollment` derives its identity from `Person`: reissuing a certificate five years after departure (DEC-22, "certificate reissuance") and the permanent access right in RG-28 both become impossible without a register-side identity snapshot, which is never specified.
- **Backups**: `36:507` says "copies purged after 30 days", while NFR-SAV-02 keeps monthly copies for up to 12 months in V1: anonymized data persists for a year regardless (cross-cutting/36:507; 32:586).
- **Financial documents "deleted after 10 years"** (36:497) vs. INV-08's `FinancialAccount` surviving "until settled": an unpaid balance older than 10 years is undefined.
- **iOS** (32% of traffic): Safari evicts web storage after 7 days, has no background sync, and only pushes for an installed PWA; NFR-OFF-01's "no data lost, app closed" has no iOS constraint and no iOS acceptance test (cross-cutting/32:337-351).
- **Support**: PAK-14 points "standard support included" to the NFR-SAV domain (backups); no support commitment exists anywhere (channel, hours, response times, FR/AR) (cross-cutting/33:481).
- **Storage quota**: NFR-RES-03 (Must MVP) says "a value fixed at launch" vs. PAK-11 (V1) and `33` OQ-06, uncosted (cross-cutting/32:660; 33:453, 518).
- **WCAG**: UX-14 says "2.1 AA, Must MVP" vs. NFR-RES-04 saying "V1, no referenced standard asserted" (cross-cutting/34:318; 32:670).
- **Browser floor / "old PC"** is never quantified: not fit for a UAT test (cross-cutting/32:278; 34:75).
- **Permission matrix**: Parent gets "R" on Attendance, even though BES-PAR-05 has the parent write a justification; Student-life staff get "R" on the identity file vs. SEC-10, which reserves identity documents to front-desk staff and leadership (cross-cutting/30:319-323). School nurse "visit to the nurse's office" (30:78) vs. `modules/23`, which excludes it.
- **A global `TeacherProfile`**: the CNDP basis (`19` OQ-05) and minors' geolocation (`22` OQ-02) are both pushed "to be addressed in 36"; `36` says nothing about either. FR-MAS-08 and FR-RAP export `TeacherProfile` qualifications to ESISE even though RG-20/RG-35 reserve them to the teacher (modules/21:226; modules/20:425).
- **The "80% permanent staff" ratio**: FR-MAS-08 points to `19`, which has no requirement on the subject (modules/19 OQ-03).

### 2.6 Roadmap, KPIs, risks, traceability, sources

- **Consolidated OQ register**: `cross-cutting/40` lists 24 OQ rows out of 259 across the PRD (235 outside 40); a note on l.123 admits the consolidation "needs re-syncing". The README claims "~120 consolidated OQs". The D1–D10 arbitrations appear nowhere in 40 (no owner, no "update the baseline" action). The request to update the baseline is recorded under six different identifiers (37 OQ-04, 40 OQ-07, 39 OQ-01/03/04/05, 41 OQ-01..05, 38 OQ-01).
- **Adult student (INV-35)**: MVP in `03` and `journeys/03` (PJ-SUR-08), V1 in `02`, `06`, `07`: a 2-vs-3 split, never arbitrated in D1–D10.
- **The DEC-27 horizon shifted by two years**: JAL-10/11 place commercial launch at the start of the 2028 school year; "20 schools by end of year 1" becomes summer 2029, and "300 in three years" becomes 2031 (37 OQ-01; 33:210). The product owner confirmed DEC-27 with no such shift: a fundamental disagreement treated as an ordinary open question.
- **A roadmap with no critical path**: no intermediate milestone from October 2026 to January 2027 (~100 MVP requirements in 4 months), nothing on the team, support, or training; JAL-12 says "the parameter is designed from JAL-01, before 01/10/2026", even though JAL-01 is dated October 2026; deadlines H-12/16/18 say "pilot phase, Q4 2026", even though pilots start in February 2027; H-22 says "before the 2027 campaign", even though JAL-11 sits in summer 2028.
- **KPIs**: `39` promises 20 KPI counterparts in `38` (compliance, security, per-consumable cost, import duplicates, conversion, student activation…) that do not exist; the alert indicators of R-04/10/13/15/16/17/18 are orphaned; there is no pilot *baseline* for KPI-13/14/15/21, even though baseline §18 requires a "reduction"; KPI-08 ("WhatsApp utility, V1") contradicts D1; D10 ("KPI-06/JAL-17/JAL-10") is untraceable; there is no transfer KPI and no Massar KPI; KPI-32..34 are governance requirements sitting in the KPI namespace.
- **Missing risks**: MVP schedule slippage and team capacity (only in `37` §5, with no R-NN and 12 unidentified duplicates), a pilot abandoning mid-year, phone-number reassignment or a shared family phone used as an identifier, Arabic/RTL PDF typography, ZSchool's liability as custodian in parent–school disputes.
- **Sources (conventions §1.4)**: `01:125`'s multi-site figures (Holged 18 campuses, EDC 17,000, La Résidence 5,000, the French network 46,000) are absent from, or contradicted by, `research/01` (Holged 20-22, OSUI > 11,000, EFM ~49,000, EDC never mentioned); "0.9 million primary/middle/high school students" (01:124) appears in no research file; the "note of 28 May 2021" is cited as fact (01:162, BES-GAR-04, modules/15:383), even though `research/02` §6 says "not found online"; DataSchool's "4.2/5, 10,000 installs" versus the research finding "not confirmable"; the 6AP exam labeled "provincial" (01:137, FR-EVA-08, printed on the report card) versus `research/04`'s "regional"; the WhatsApp rate card "published before 01/09/2026" was never actually retrieved, even though every consumable-cost estimate depends on it; `research/00` claims "every fact is referenced with a URL", yet the files only give domain names, and several facts rest on YouTube demos or inferences.
- **The single scenario set (C-02) is broken**: Youssef is both Rachid's student in Marrakech (PJ-SUR-02) and Khadija's student in Rabat (PJ-ENS-06, Ahmed's School A); Naïma's daughter ("a minor") is an 18-year-old in Terminal year (2ème Bac) in PJ-GAR-06 without ever being named, and Salma (07) has no described parents; PC-01 pairs Fatima (Salé) with Si Abdellah (Casablanca) in the same journey; PJ-ENS-10 turns Khadija into an "external public-sector teacher" (8-hour cap), even though the persona is a private-sector part-time teacher.
- **Gherkin criteria with no version tag**, testing V1 behavior inside MVP journeys (a cash session, a stamp plus QR code, push routing, a compliance alert): MVP UAT will fail (journeys/02:151-276; 03:327; 04:352).
- **Must/MVP requirements with no Gherkin scenario at all**: FR-PED-02/08/09, FR-VSC-06/14, FR-EVA-03/04/07/14, FR-FIN-03/10/17/20/22/26, FR-COM-01/02/04/05/15, FR-DOC-09, FR-TRA-02/08/12/13 (and FR-INS-01/02, which are V1). The only payment-collection Gherkin scenario (FR-FIN-11) sits in a V1 requirement.
- **README**: VSC "20 FR" (23 actual), a total of "242" (245 actual), "~120 OQ" (259 actual), a glossary of "≈130 entries" (190 lines actual); "100% covered", even though path 2 of §6.2 and the 80% ratio have no owner.
- **Glossary**: cross-references to a non-existent "`PROJECT.md` §6.11" (41:169, 184, 214, 215); EXPELLED missing from the state machine (41:174); "school attendance certificate" (29 occurrences) and "certificate of enrollment" (17) used for the same document; "one tenant = one subscription" (41:46) contradicts `Subscription` N—1 School or Organization; "several account-contexts" (41:172) contradicts INV-13; missing terms: DR/RTO/RPO, head/lead teacher, CNSS, PWA, RTL, Eduka, *availability domain*.

---

## 3. Minor (selection)

- Late arrivals recorded at roll call (FR-VSC-01, MVP), even though managing late arrivals is V1 (FR-VSC-10); FR-VSC-08 (MVP) mentions thresholds that are V1 (FR-VSC-09).
- BES-SUR-07 (the daily student-life dashboard) is V1 vs. ECR-VSC-02's "daily summary" being MVP vs. FR-RAP-03.
- FR-INS-14 stores acceptance of the internal rules inside `ConsentGrant` (a sharing entity); `ConsentGrant` has no "grantor" attribute (parent vs. adult student) for the RG-30 audit trail.
- FR-INS-22 and FR-PED-10 both specify a class change, with different actors and different notifications; FR-CAR-14 and FR-ADM-17 both carry the directory, and FR-ADM-17 lets a school be hidden, making it unreachable as a transfer destination.
- FR-ADM-10 (trial, MVP) points to FR-ADM-12 (cancellation, V1): no trial exit path exists at MVP.
- The "active student" count as of the 1st of the month: September is worth ~0 for pilots imported in February; the effect on the 10 billed months is not discussed (OQ-05).
- Importing "historical grades" with no enrollment to attach them to, and no published/draft status (RG-29).
- FR-VSC-23 (rewards) sits in V2+ with no justification, even though baseline §6.8 lists it with no version tag.
- The calendar for mission-française sections (AEFE holidays) is missing from FR-PED-16, even though that section is V1.
- FR-DOC-07 partially masks the name on the verification page: an employer cannot confirm the certificate belongs to the person presenting it.
- FR-DOC-14 (permanent read access, RG-28) is V1, even though INV-20 is MVP.
- FR-FIN-18 lists postal mail as MVP, then pushes it to V1 within the same description; ECR-FIN-02 locks the fee schedule "for the year" vs. FR-FIN-02's "applies to new enrollments".
- INV-40 (invoice numbering) is MVP, even though invoices themselves (FR-FIN-06/07) are V1.
- `Assessment` is attached only to `Class`, even though FR-EVA-01 creates assessments by class or group; `Thread` is attached to the relationship in `03` and to the enrollment in FR-COM-03.
- FR-COM-14: two legal guardians by default (RG-13), yet the Gherkin scenario accepts "one guardian" as sufficient; the field-trip authorization is kept for 2 years (the "messages" retention period), even though it is evidence for civil liability.
- With an SMS balance of zero, security alerts "keep being delivered": ZSchool fronts the cost with no cap.
- The "delivered within 5 minutes" criterion depends on carrier delivery receipts: not measurable as written.
- FR-CAR-04 (MVP): "the period shows as verified in the profile" depends on FR-CAR-07/08 (V1); "an end date no later than today" rules out a scheduled future end date; `19` OQ-02 says INV-19 is "V1", even though it is already partially MVP.
- Intra-group transfer and a transfer initiated by the origin (a closure) are unspecified; `18:62` puts group management in V2+, even though `Organization` is V1.
- Triple overlap on ESISE (FR-RAP-11, FR-MAS-07..09, INT-MAS-04); FR-MAS-01 duplicates FR-INS-06 and FR-ADM on the Massar code.
- FR-HEA-02's "express consent of legal guardians": does one suffice? What about disagreement (RG-16), guardian vs. custodial parent?
- The weighted average in FR-RAP-01's acceptance criteria: 95.9%, not "roughly 95.8%" (modules/20:243).
- PJ-GAR-01 puts the "custodial guardian" quality on hold pending a court order, even though Article 171 makes it the legal default: Naïma would lose her rights for lack of a judgment.
- PJ-PAR-02.1 attributes the parent–child link to "strong Massar matching", which only matches student profiles.
- PJ-ELE-08.2 makes discipline records viewable after departure "as published data"; RG-28 does not list them, and RG-29/DEC-08 make them non-portable.
- PJ-SUR-03 (V1) is the sole owner of "people authorized to pick up the child", even though RG-15/INV-12 are MVP.
- The 5-minute absence notification in preschool needs per-cycle configuration; no voice fallback and no Amazigh option, even though `01` §1.7 promises one.
- JAL-06's "report cards before the baccalaureate exam, 01-03/06/2027" only concerns Terminal-year (2ème Bac) students; KPI-06's "first full quarter" (February–April) includes school breaks and Ramadan.
- `01:155` attributes the 8-hour cap to Law 59.21, then says in the same bullet that it comes from the repealed Law 06.00; `01:143` writes "since 20 September 2026" in a document dated 9 September.
- The public QR verification page (INT-SIG-01): sequential, enumerable numbers; SEC-06 covers only Massar codes and phone numbers.
- Oracle (a US company) administers the region from abroad: not contractually qualified (against the DGSSI reference framework).
- No named "data protection" point of contact at ZSchool (CNF-05 just says "ZSchool" is responsible).

---

## 4. Recommended actions, in order

1. **Rebuild the MVP scope from the pilots' calendar** (February 2027 → June 2028). Move to a "pilot MVP": a minimal rollover and structure cloning, recording year-end decisions, cheques, the Law 59.21 parent contract, receipt numbering, a simple account statement, `Organization` in read-only consolidated view, an attendance session with no timetable (a declared time slot), assisted duplicate merging, sibling discounts. Or revise JAL-04/06/07 and tell the product owner. A table of "capabilities required by month of the pilot year" would resolve the contradiction.
2. **Define the mid-year reprise**: importing partially-collected payment schedules, cheques on hand, S1 attendance and grades, and the import's exit state (PRE-ENROLLED vs. ACTIVE by a logged exception).
3. **Fix the model**: exits from SUSPENDED; COMPLETED plus a decision before any year-end departure; "promoted with a track change" ≠ a departure; decline/expiry/cancellation of a transfer, and re-entry; `HealthRecord` and `StudentDocument` per (student × school); a "grantor" attribute on `ConsentGrant`; a register-side identity snapshot for anonymization; FR-CAR-12 as a teacher-side-only alert; a publication status on `Mark`.
4. **Settle phone-based identity**: a non-phone student identifier, two guardians on one number, foreign numbers, number change/loss/reassignment with a front-desk re-verification, a knowledge challenge at claim time.
5. **Milestone compliance before 01/02/2027**: F211 for pilots and for ZSchool, F112 for national ID (or do not collect national ID at MVP), a WhatsApp transfer basis (express opt-in or F118), FCM/APNs and any APM in the sub-processor list, a pilot data-processing agreement, a manual data-subject-rights procedure, a pentest, a second backup site.
6. **Fix the MVP calculation rules**: markers within averages, entry/exit proration, absence-notification aggregation, correcting after notification, front-desk justification, uncovered sessions, attendance rate, trimesters → Massar semesters, sequencing certifying results against the rollover.
7. **Reconcile contradictory versions** into a single product-owner-signed arbitration table: adult student, moderated threads, MVP push, logging, support, MFA, second site, QR code, WCAG, parent contract, sibling discount, document storage, certificate of departure to the custodial guardian.
8. **Re-sync the traceability apparatus**: a complete register in 40 (259 OQs) with an owner and a deadline; D1–D10 recorded; the README recounted; sources given as URLs; `01`'s figures aligned with `research/`; the glossary corrected; the single scenario set repaired; Gherkin scenarios tagged by version and added to every Must/MVP requirement.
9. **Get the product owner to confirm** the two-year shift in DEC-27 caused by JAL-10/11, or revise the roadmap.

---

## 5. Status after resolution (same day)

The findings above have been addressed in the PRD (version 1.1, chapters at 0.2). The single arbitration table is `prd/cross-cutting/42-review-arbitrations.md` (ARB-01 to ARB-26); the question register is rebuilt in `prd/cross-cutting/40` §4 (256 questions: 71 resolved, 41 escalated, 144 open by nature).

| Blocking | Resolution | Where |
|---|---|---|
| B-01, B-02, B-05 to B-09 | An MVP scope split into two waves covering the pilots' school year; 29 requirements re-tagged MVP (rollover, cloning, decisions, transcripts, continuous-assessment Massar exports, cheques, the parent contract, receipt numbering, the account statement, sibling discounts, a read-only consolidated organization view, support-side merging) | ARB-01; `37` §2.1 bis; JAL-20..24 |
| B-03, B-04 | Mid-year reprise (settled payment schedules, cheques, S1 grades) and an "import activation" transition | ARB-02; FR-ADM-06, FR-INS-27; PJ-DIR-01.11, PJ-SEC-11 |
| B-10 | Declared sessions with no timetable; uncovered sessions | ARB-04/05; FR-PED-20/21, FR-VSC-01, the `Session` entity |
| B-11, B-12, B-15 | National ID not collected at MVP; F211/F112/F118 milestoned before 15/12/2026; WhatsApp built on express consent; FCM/APNs added to the registry; a pilot agreement; a pentest and off-site replication before JAL-04 | ARB-25; CNF-25/26, SEC-27/28, INT-HEB-06, JAL-23, D-16..D-20 |
| B-13, B-14 | A login identifier distinct from the contact number (a student with no mobile, a household on one number, E.164); number change/loss/reassignment; a knowledge challenge at claim time | ARB-07/08; INV-45, FR-ADM-20, SEC-27, PJ-PAR-11, PJ-ELE-01 |
| B-16 | A health record and case file kept per school | ARB-13; `03` §2.4, FR-HEA-01/06/07 |
| B-17 | An hour total visible only to the teacher; a binary alert on consent; ESISE qualifications sourced from `SchoolMembership` | ARB-23; FR-CAR-12/19, FR-MAS-08 |
| B-18, B-19 | Full transfer statuses (accepted, declined by the destination, cancelled, expired); the origin closes only on activation; year end = COMPLETED for everyone; "promoted with a track change" stays; exits from SUSPENDED; a CANCELLED state; re-entry | ARB-03/22; `03` §3, FR-INS-15/21, FR-TRA-02/06 |

Major and minor findings are covered by ARB-09 to ARB-21, ARB-24, and ARB-26 (guardian matching, court-ordered restriction, anonymization with a register snapshot, grading calculation rules, family finance and receipt cancellation, communication, attendance rate, sources, the glossary, the scenario set, tagged Gherkin scenarios). Three decisions remain with the product owner: ESC-01 (the DEC-27 horizon), ESC-02 (the MVP extension and its cost before February 2027), and ESC-03 (baseline v1.2).
