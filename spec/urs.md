# User Requirements

> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-URS                                                    |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | User Requirements Specification                               |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/02-actors-personas.md` §3 (old `BES-<PERS>-NN` namespace, one block per persona), unified onto the flat `URS-ZS-NNN` namespace per the migration plan. Persona identity is kept as a column in §6 rather than in the identifier itself. |

---

## 1. Purpose

This document states what ZSchool's seven personas need, in their own terms — not
how the product satisfies those needs. The [behaviors](./behaviors/) state the
how, module by module. Each requirement below traces forward to at least one
behavior and one journey in [§6](#6-traceability), once those documents exist
(behaviors and journeys are written in a later phase of this same migration;
until then, §6's "Satisfied by" column is intentionally sparse).

Requirements here were extracted from a working PRD, not from a shipped
implementation — `prd/02-actors-personas.md` §3 already stated one persona need
per row (`BES-<PERS>-NN`), built from eight named personas' first-hand goals and
frustrations (§2 of that file). This document keeps that grounding: every
requirement below cites the persona whose situation motivates it, and every
"Rationale" line is drawn from that persona's actual context, not inferred.

### 1.1 Scope

| In scope | Out of scope |
| -------- | ------------ |
| The needs of the seven persona types who use ZSchool day to day: school-group leadership, front-office/cashier staff, student-life supervision, teaching staff, parents/guardians, and pupils | The needs of the ZSchool operator itself (provisioning, support, SaaS billing, monitoring) — a platform actor, not a persona with functional needs (`prd/02-actors-personas.md` §1) |
| Needs that hold across every school configuration the personas describe (single-site, multi-site group, part-time staff across schools) | A generic school-management needs catalogue independent of the Moroccan private-K-12 context — every requirement below is grounded in a specific persona's stated situation |
| Needs a school **tenant** or **organization** (parent tenant) has as a data-isolation/governance unit are represented only through the `DIR` persona who acts on their behalf, not as a requirement in their own right | Requirements of the pupil's global identity considered independently of a guardian or of the pupil's own account holdership — see `spec/invariants.md` for the identity/authorization chain itself |

## 2. User groups

| Group | Persona code | Needs |
| ----- | ------------ | ----- |
| **School-group leadership** | `DIR` | A cross-site consolidated view; collections oversight; regulatory compliance without double entry |
| **Front-office / cashier staff** | `SEC` | A single-pass enrollment and payment workflow on modest hardware |
| **Student-life supervision** | `SUR` | Fast, mobile, network-tolerant attendance and discipline tracking |
| **Teaching staff (incl. part-time, multi-school)** | `ENS` | One portable profile, mobile-first tools, a confidential career record |
| **Parents / guardians** | `PAR`, `GAR` | One account across every child and school; real-time information; fair, logged access regardless of custody/guardianship status |
| **Pupils** | `ELE` | Access proportionate to age and majority; a durable academic record that survives a change of school |

## 3. Functional requirements

### 3.1 School-group leadership (`DIR` — Si Abdellah)

### URS-ZS-001 — View a consolidated multi-site dashboard

*Persona: DIR · Priority: Must · Version: MVP (organization-level read-only consolidation, ADR-ZS-041) · Modules: RAP*

A school-group CEO must be able to see headcounts, attendance, results, unpaid
fees and occupancy consolidated across every site from one dashboard.

Rationale: today this consolidation is manual spreadsheet work; a group running
three sites and 1,800 pupils has no overview without it.

### URS-ZS-002 — Manage collections across sites

*Persona: DIR · Priority: Must · Version: MVP · Modules: FIN, COM*

Group leadership must be able to track unpaid fees by class and by guardian and
trigger automatic, graduated reminders, without per-site manual follow-up.

Rationale: collections are a standing concern handled by hand today; a
consolidated, automated view is one of the CEO's stated goals.

### URS-ZS-003 — Produce Massar-compliant exports without double entry

*Persona: DIR · Priority: Must · Version: MVP wave 2 — year-end close (ADR-ZS-041) · Modules: MAS*

Group leadership must be able to produce files matching Massar's own templates
(rosters, continuous-assessment grades) so the same data is never re-keyed twice.

Rationale: Massar has no API, only a file-import channel; double entry into it
is a named, recurring source of workload (H-04).

### URS-ZS-004 — Steer the group without merging tenant data

*Persona: DIR · Priority: Must · Version: MVP (read-only consolidation); V1 (shared administration, group billing) (ADR-ZS-041) · Modules: RAP, ADM*

Group leadership must get consolidated views and shared administration across
sites while each site's data stays isolated from the others.

Rationale: the group is a multi-site legal entity with separate authorizations
and one head per site; consolidation must not become a data merge.

### URS-ZS-005 — Run the start of year across sites

*Persona: DIR · Priority: Must · Version: MVP wave 2 — year-end close (ADR-ZS-041); V1 (campaign reminders) · Modules: INS, PED*

Group leadership must be able to run a pre-filled re-enrollment campaign and an
N+1 year rollover (structure cloned from year N) across every site.

Rationale: start-of-year workload peaks concentrate into a few weeks; this is
one of the CEO's explicit annual scenarios.

### URS-ZS-006 — Close periods and lock report cards

*Persona: DIR · Priority: Must · Version: MVP · Modules: EVA*

Group leadership must be able to approve period closures and lock report cards
once published.

Rationale: report cards are bilingual, published and meant to be immutable once
issued.

### URS-ZS-007 — Assign fine-grained staff roles

*Persona: DIR · Priority: Must · Version: MVP · Modules: ADM*

Group leadership must be able to assign staff roles built from fine-grained,
editable permissions by module and scope.

Rationale: staff is numerous and specialized; a coarse role model would not fit
front office, accounting, student life, infirmary, transport, library and IT
separately.

### URS-ZS-008 — Check regulatory compliance before closing

*Persona: DIR · Priority: Should · Version: MVP (warning, D3); V1 (blocking) · Modules: MAS, EVA*

Group leadership must be able to check the minimum number of tests per subject
and per period against the national framework before closing.

Rationale: this compliance check currently happens manually, if at all, before
a period close.

### URS-ZS-009 — Approve outgoing transfer requests

*Persona: DIR · Priority: Must · Version: MVP · Modules: TRA*

Group leadership must be able to approve outgoing transfer requests and track
incoming ones, checking the guardian's signature and shared scope, and must
never be able to refuse a transfer on financial grounds.

Rationale: mobility between schools is common; ADR-ZS-005 and INV-ZS-066 (ADR-ZS-063) make
the financial-refusal prohibition a hard rule, not a preference.

### 3.2 Front office / cashier (`SEC` — Fatima)

### URS-ZS-010 — Create a complete enrollment in one pass

*Persona: SEC · Priority: Must · Version: MVP · Modules: INS, DOC*

Front-office staff must be able to create identity, guardians and class
placement, and issue the basic enrollment documents, all in a single front-desk
pass.

Rationale: enrolling pupils is Fatima's core daily task; paper files and
re-keying between tools are what this replaces.

### URS-ZS-011 — Collect every payment method with an immediate receipt

*Persona: SEC · Priority: Must · Version: MVP (full cheque lifecycle, ADR-ZS-041) · Modules: FIN*

Front-office staff must be able to collect cash, cheque and transfer payments,
issue a tamper-proof numbered receipt immediately, and track cheques by due
date.

Rationale: cheque due dates are tracked by hand today; a manual ledger is
exactly what this need replaces.

### URS-ZS-012 — Issue bilingual certificates on demand

*Persona: SEC · Priority: Must · Version: V1 (certificate of enrollment and basic enrollment documents ship at MVP under URS-ZS-010; receipt numbering at MVP, ADR-ZS-041) · Modules: DOC*

Front-office staff must be able to issue bilingual certificates and attestations
with numbering, stamp, signature and a QR code, on demand.

Rationale: bilingual official documents are part of everyday front-desk work.

### URS-ZS-013 — Show arrears without ever blocking documents

*Persona: SEC · Priority: Must · Version: MVP · Modules: DOC, FIN*

Front-office staff must see an arrears alert on a pupil's file, but must never
be blocked from issuing an official document because of unpaid fees.

Rationale: documents are never withheld for unpaid fees — an alert plus an
account statement is the required alternative (ADR-ZS-005 territory, restated here
from the front-desk perspective).

### URS-ZS-014 — Trigger multi-channel reminders from templates

*Persona: SEC · Priority: Should · Version: MVP (SMS; WhatsApp: V1) · Modules: FIN, COM*

Front-office staff must be able to trigger SMS and WhatsApp reminders from
templates, without composing each one by hand.

Rationale: Fatima answers the phone constantly; manual, one-off reminders don't
scale to a full arrears list.

### URS-ZS-015 — Scan supporting documents with a completeness check

*Persona: SEC · Priority: Should · Version: V1 · Modules: DOC, INS*

Front-office staff must be able to scan supporting documents into a pupil's
file and see whether the file is complete.

Rationale: paper files are lost today; a completeness check is what a digital
file adds over a folder.

### URS-ZS-016 — Prepare and track pre-filled re-enrollments

*Persona: SEC · Priority: Must · Version: MVP wave 2 (pre-filled form, deposit, conversion, ADR-ZS-041); V1 (campaign reminders) · Modules: INS*

Front-office staff must be able to prepare a pre-filled re-enrollment campaign
with a deposit step and track its reminder cadence.

Rationale: the spring re-enrollment campaign with a deposit is a named annual
event this need directly supports.

### URS-ZS-017 — Work on modest hardware with resumable sessions

*Persona: SEC · Priority: Must · Version: MVP · Modules: cross-cutting*

Front-office staff must be able to use the product on an old PC and a mobile
phone, with light pages that resume cleanly after a connection drop.

Rationale: Fatima's actual hardware is an old PC and her personal phone, on a
connection that is sometimes unstable.

### 3.3 Student-life supervision (`SUR` — Rachid)

### URS-ZS-018 — Take attendance tolerant of network drops

*Persona: SUR · Priority: Must · Version: MVP · Modules: VSC*

A supervisor must be able to take attendance by class or by course on mobile,
including while offline, with sync completing once the connection returns.

Rationale: Rachid is on mobile constantly and rarely at a computer; the
connection in class is sometimes unstable.

### URS-ZS-019 — Notify absentees' families automatically, fast

*Persona: SUR · Priority: Must · Version: MVP · Modules: VSC, COM*

A supervisor must be able to trigger automatic notification to absentees'
families within five minutes of the attendance call being validated.

Rationale: this replaces manually phoning every absentee's parent before 10
a.m. — the process it's meant to eliminate, not merely speed up.

### URS-ZS-020 — Receive and validate justifications with an attachment

*Persona: SUR · Priority: Must · Version: MVP · Modules: VSC, COM*

A supervisor must be able to receive a parent's absence justification with an
attached photo or document and validate it.

Rationale: there is no reliable record of justifications today.

### URS-ZS-021 — Log tardiness, early departures, exemptions, late-entry slips

*Persona: SUR · Priority: Must · Version: MVP (tardiness logged at the attendance call, BEH item for BEH-ZS-081); V1 (late-entry slips, early departures, exemptions) · Modules: VSC*

A supervisor must be able to log tardiness, early departures, exemptions and
late-entry slips against a pupil's record.

Rationale: this is currently a paper register with no structured history.

### URS-ZS-022 — Manage incidents through to disciplinary councils

*Persona: SUR · Priority: Must · Version: V1 · Modules: VSC, COM*

A supervisor must be able to log incidents, apply graduated sanctions, issue
summonses, and prepare a disciplinary council file from a reliable history.

Rationale: sanctions and disciplinary councils currently have no history to
draw on.

### URS-ZS-023 — Work within an assigned scope, with actions logged

*Persona: SUR · Priority: Must · Version: MVP · Modules: cross-cutting, VSC*

A supervisor's actions must be limited to the cycles assigned to them, and every
sensitive action they take must be logged.

Rationale: least privilege and action logging are explicit baseline rules
(INV-ZS-090, INV-ZS-091), not implementation details left to the supervisor's own
discretion.

### URS-ZS-024 — See the day's student-life picture at a glance

*Persona: SUR · Priority: Must · Version: MVP (day summary: absentees, tardiness, expected calls); V1 (ongoing incidents) · Modules: RAP, VSC*

A supervisor must be able to see the day's absentees, tardiness and ongoing
incidents from one dashboard.

Rationale: today this picture is obtained by walking the corridors.

### URS-ZS-025 — Reach a parent from the pupil's file, with history logged

*Persona: SUR · Priority: Should · Version: MVP · Modules: COM, VSC*

A supervisor must be able to call or message a parent directly from the pupil's
file, with the channel and the exchange logged, without keeping a private paper
directory.

Rationale: numbers are jotted on paper today and calls aren't tracked (INV-ZS-090).

### 3.4 Teaching staff (`ENS` — Khadija)

### URS-ZS-026 — Keep one profile across schools, switch context

*Persona: ENS · Priority: Must · Version: MVP · Modules: cross-cutting*

A part-time teacher working at more than one school must be able to keep a
single profile and switch context between her schools rather than holding a
separate account per school.

Rationale: simultaneous affiliation across schools is the majority case for
part-time teachers in the private sector (H-13), not an edge case.

### URS-ZS-027 — Take attendance on the phone, including offline

*Persona: ENS · Priority: Must · Version: MVP · Modules: VSC*

A teacher must be able to take attendance for her own courses from her phone in
class, including while offline.

Rationale: Khadija doesn't always have a computer in class.

### URS-ZS-028 — Enter grades on mobile with resume after a drop

*Persona: ENS · Priority: Must · Version: MVP · Modules: EVA*

A teacher must be able to enter grades from her phone in the evening, and
resume cleanly if the connection drops mid-entry.

Rationale: grade entry happens on the phone, in the evening, on a limited data
plan with frequent drops.

### URS-ZS-029 — Keep the lesson log and publish homework

*Persona: ENS · Priority: Should · Version: V1 · Modules: PED*

A teacher must be able to keep her lesson log and publish homework and
resources for her pupils.

Rationale: homework is currently scattered across WhatsApp groups with no
structured log.

### URS-ZS-030 — Message only her own pupils' parents, moderated

*Persona: ENS · Priority: Must · Version: MVP (moderated in-app, ADR-ZS-062 under ADR-ZS-034) · Modules: COM*

A teacher must be able to message only the parents of pupils in her own
courses, within a moderated thread.

Rationale: the teacher role is scoped to her own courses under least privilege
(INV-ZS-091); moderation is the MVP default under ADR-ZS-034.

### URS-ZS-031 — Own a portable, confidential professional profile

*Persona: ENS · Priority: Should · Version: V1 (network features: V2+) · Modules: CAR*

A teacher must be able to hold a professional profile — degrees, subjects,
verified affiliation periods — that is portable between schools and confidential
by default.

Rationale: there is no verifiable proof of teaching periods today, no
cross-school rating (INV-ZS-072, INV-ZS-087, ADR-ZS-006), and Khadija's own scope here is
narrower than full network search/applications, which lands later (URS-ZS-032).

### URS-ZS-032 — Signal availability and apply without alerting her current employer

*Persona: ENS · Priority: Should · Version: V2 · Modules: CAR*

A teacher looking for a new position must be able to mark herself available and
apply to openings without her current schools being notified.

Rationale: Khadija is looking for a full-time position and fears her search
leaking to her current employer.

### URS-ZS-033 — See the day's classes and pending entries at a glance

*Persona: ENS · Priority: Should · Version: MVP · Modules: RAP, EVA*

A teacher must be able to see the day's classes, pending grade entries, and her
classes' averages from one dashboard.

Rationale: a teacher dashboard is one of the stated needs from her daily
workflow.

### 3.5 Parents / guardians — multi-school parent (`PAR` — Ahmed)

### URS-ZS-034 — One account and password across every child and school

*Persona: PAR · Priority: Must · Version: MVP · Modules: cross-cutting*

A parent with children at more than one school must be able to use a single
account and password for all of them.

Rationale: existing solutions require one parent account per school; Ahmed has
three children across two schools.

### URS-ZS-035 — Receive real-time notifications across channels

*Persona: PAR · Priority: Must · Version: MVP (in-app, SMS; WhatsApp presence notifications with minimal templates, first-absence-of-the-day then a summary, ADR-ZS-056); V1 (push, broader rollout) · Modules: COM, VSC, EVA*

A parent must receive absences, grades and announcements in real time over SMS,
WhatsApp and in-app notifications.

Rationale: WhatsApp is used by 98.6% of social-network users (H-11) and SMS is
the universal fallback; absences are currently learned about only in the
evening.

### URS-ZS-036 — View the installment plan and payment history per child

*Persona: PAR · Priority: Must · Version: MVP · Modules: FIN*

A parent must be able to view the installment plan, receipts and payment
history for each of their children.

Rationale: fees are billed monthly over ten months and installment plans are
currently scattered across paper receipts.

### URS-ZS-037 — Switch between children and schools from one view

*Persona: PAR · Priority: Must · Version: MVP · Modules: RAP*

A parent must be able to switch between children and schools from a single
multi-child, multi-school dashboard.

Rationale: Ahmed follows three children across two schools and should not need
to re-authenticate to move between them.

### URS-ZS-038 — Justify an absence with an attachment from the phone

*Persona: PAR · Priority: Must · Version: MVP · Modules: VSC, COM*

A parent must be able to justify a child's absence with a photo or document
attached, from their phone.

Rationale: this is the parent-side counterpart of URS-ZS-020's supervisor
validation step.

### URS-ZS-039 — Electronically sign outing and event authorizations

*Persona: PAR · Priority: Should · Version: V1 · Modules: COM*

A parent must be able to electronically sign authorizations for school outings
and events.

Rationale: this replaces paper permission slips for school-organized events.

### URS-ZS-040 — Pay online with the school remaining the creditor

*Persona: PAR · Priority: Should · Version: V1 (Fatourati Collect-then-Aggregator primary; card payment in V2, ADR-ZS-031) · Modules: FIN*

A parent must be able to pay online from their banking app or by card, with the
school — never ZSchool — remaining the creditor of record.

Rationale: ZSchool does not hold funds; ADR-ZS-031 fixes Fatourati as the V1 rail
with card payment following in V2.

### URS-ZS-041 — Message the form teacher and subject teachers, moderated

*Persona: PAR · Priority: Should · Version: MVP (moderated in-app, ADR-ZS-062); V1 (WhatsApp and push channels) · Modules: COM*

A parent must be able to message their child's form teacher and subject
teachers within a school-moderated setting.

Rationale: parent-teacher threads are moderated by the school under ADR-ZS-034.

### URS-ZS-042 — Change mobile number or recover access without losing children

*Persona: PAR · Priority: Must · Version: MVP · Modules: cross-cutting*

A parent must be able to change their mobile number, or recover account access
after losing their phone, without losing the link to their children's records.

Rationale: SIM churn and operator number reassignment are real risks against a
contact identifier used as the primary channel (ADR-ZS-022, ADR-ZS-049).

### URS-ZS-043 — Dispute an absence or request a grade correction

*Persona: PAR · Priority: Should · Version: MVP · Modules: VSC, EVA, COM*

A parent must be able to dispute an absence logged in error, or request a grade
correction, before the report card is published.

Rationale: attendance calls can produce false positives, and report cards
become immutable once published (INV-ZS-085), so the window to correct is before
that point.

### 3.6 Parents / guardians — custodial mother (`GAR` — Naïma)

### URS-ZS-044 — Access all of her daughter's school information as guardian and custodian

*Persona: GAR · Priority: Must · Version: MVP · Modules: PRT*

A custodial mother must be able to access all of her child's school information
on the same footing as the other legal guardian.

Rationale: the ministry position is that a custodial mother obtains
administrative school documents (§2.7 of the source PRD chapter, INV-ZS-065).

### URS-ZS-045 — See her recorded qualities and rights, per school

*Persona: GAR · Priority: Must · Version: MVP · Modules: INS, ADM*

A guardian must be able to see her own recorded qualities (legal guardian,
custodian, emergency contact) and the rights attached to each, per school.

Rationale: qualities and their associated rights are recorded per school as
distinct, contextual attributes (INV-ZS-066, INV-ZS-067).

### URS-ZS-046 — Hold her own account, never shared

*Persona: GAR · Priority: Must · Version: MVP · Modules: cross-cutting*

A guardian must have her own account that is never shared with another
guardian.

Rationale: no account is ever shared between two people (INV-ZS-063) — this is a
hard platform rule, restated here from the persona's own concern about being
subordinated to the other parent's account.

### URS-ZS-047 — Obtain administrative documents self-service

*Persona: GAR · Priority: Must · Version: V1 (certificate of enrollment already issued at the front desk from MVP under URS-ZS-010) · Modules: DOC*

A guardian must be able to obtain her child's administrative school documents
(such as the certificate of enrollment) self-service, without requiring the
other guardian's presence — while the leaving certificate specifically still
requires the legal tutor's signature (ADR-ZS-061).

Rationale: today, documents are often made conditional on the father's presence
even when policy doesn't require it.

### URS-ZS-048 — Receive notifications alongside the other guardian by default

*Persona: GAR · Priority: Must · Version: MVP · Modules: COM*

A guardian must receive the same notifications as the other legal guardian, by
default, without needing to request parity.

Rationale: both legal guardians are informed by default (INV-ZS-064) — this is the
opposite of a school that communicates only with one parent.

### URS-ZS-049 — See any access restriction, backed by a logged court order

*Persona: GAR · Priority: Must · Version: MVP · Modules: ADM*

A guardian must be able to see any restriction on her own access, and any such
restriction must be backed by a logged court order with the supporting document
attached.

Rationale: restrictions apply only on a court order and conflicts are reported
to the school, never resolved unilaterally by the platform (INV-ZS-065, INV-ZS-068).

### URS-ZS-050 — Keep her access independent of who pays

*Persona: GAR · Priority: Must · Version: MVP · Modules: FIN*

A guardian must be able to let the financial guardian pay the fees without that
arrangement conditioning her own access to the child's information.

Rationale: the legal guardian and the paying guardian are frequently different
people, and the two roles are deliberately kept distinct (INV-ZS-064).

### 3.7 Pupils (`ELE` — Youssef, minor; Salma, adult)

### URS-ZS-051 — Personal access activated by a guardian, with a generated login where needed

*Persona: ELE · Priority: Must · Version: MVP · Modules: cross-cutting, PED, EVA*

A pupil must be able to have personal access, activated by a legal guardian
from the level the school sets (default: 1AC), with a platform-generated login
identifier issued when the pupil has no phone of their own.

Rationale: the login identifier is deliberately distinct from the contact
identifier used for guardians (INV-ZS-003, ADR-ZS-048) — Youssef checks his access on
the family phone, activated by his father via an OTP sent to the father's
number.

### URS-ZS-052 — View the day's timetable and its variants

*Persona: ELE · Priority: Must · Version: V1 · Modules: PED*

A pupil must be able to view the day's timetable, including seasonal variants
(normal, Ramadan, exam periods).

Rationale: the timetable is currently posted on a hallway wall with no per-pupil
digital access.

### URS-ZS-053 — View grades and report cards as soon as published

*Persona: ELE · Priority: Must · Version: MVP (QR verification: V1) · Modules: EVA*

A pupil must be able to view grades and report cards as soon as they are
published, with the report card immutable and QR-verifiable.

Rationale: report cards are handed out late on paper today; INV-ZS-085 and INV-ZS-015
make immutability and verifiability platform guarantees, not conveniences.

### URS-ZS-054 — View homework and the lesson log

*Persona: ELE · Priority: Should · Version: V1 · Modules: PED*

A pupil must be able to view homework and the lesson log for their courses.

Rationale: homework is currently scattered across WhatsApp groups.

### URS-ZS-055 — Become the account holder at 18, with rights to restrict parental access

*Persona: ELE · Priority: Must · Version: MVP (ADR-ZS-051) · Modules: cross-cutting, ADM*

A pupil who has turned 18 must become the account holder in their own right,
be informed of their rights, and be able to restrict parental access to
academic, disciplinary and health data.

Rationale: Salma, now an adult, wants her own access rather than remaining
dependent on her parents' accounts (INV-ZS-052, ADR-ZS-001).

### URS-ZS-056 — Download annual and cumulative transcripts

*Persona: ELE · Priority: Must · Version: MVP wave 2 (annual transcript, ADR-ZS-041); V1 (cumulative transcript) · Modules: EVA, DOC*

A pupil must be able to download annual and cumulative transcripts for
post-baccalaureate applications.

Rationale: this is exactly the document trail Salma needs for her
post-baccalaureate file, and today it means chasing signed paper transcripts.

### URS-ZS-057 — Keep academic access despite a parental restriction; financial guardian keeps financial access

*Persona: ELE · Priority: Must · Version: MVP (ADR-ZS-051) · Modules: FIN, cross-cutting*

An adult pupil restricting parental access must still leave the financial
guardian's access to financial data intact, as long as that guardian remains
liable for fees.

Rationale: this is a partial, not absolute, restriction by design (INV-ZS-052) — the
person paying the fees keeps the visibility that liability implies.

### URS-ZS-058 — Keep read access to her own record after leaving the school

*Persona: ELE · Priority: Must · Version: V1 · Modules: DOC, PRT*

A pupil must keep permanent read access to their own published data and
documents even after leaving the school, with nothing visible to the new school
without an explicit sharing action.

Rationale: read access after departure is permanent by design, and no data
crosses schools without being shared deliberately (INV-ZS-080, INV-ZS-082).

## 4. Non-functional requirements

ZSchool's non-functional requirements (performance, availability, i18n, mobile,
offline tolerance, observability, security, data residency) are specified in
[`spec/cross-cutting/03-non-functional-requirements.md`](./cross-cutting/03-non-functional-requirements.md)
under the `NFR-ZS-NNN` namespace, not duplicated here. Several requirements
above (URS-ZS-017, URS-ZS-018, URS-ZS-023, URS-ZS-027, URS-ZS-028) depend
directly on that document's offline-tolerance and mobile-first NFRs.

## 5. Assumptions

- Every persona above already has an authenticated global identity by the time
  they reach the product; how that identity chain works — pupil, guardian,
  staff, tenant — is specified in [`spec/domain-model.md`](./domain-model.md),
  not restated here.
- A pupil profile can exist without an account of its own (a preschool child is
  represented entirely by their guardians); needs above that reference "the
  pupil" assume an activated account unless stated otherwise (URS-ZS-051).
- Module codes (`ADM`, `INS`, `PED`, `VSC`, `EVA`, `DOC`, `FIN`, `COM`, `TRA`,
  `CAR`, `RAP`, `MAS`, `SAN`, `HEA`, `PRT`) cited in the "Modules" line of each
  requirement are the same stable, opaque codes used throughout the rest of
  this specification — see `spec/process/requirement-id-scheme.md`.
- Version tags (MVP / MVP wave 2 / V1 / V2) are carried over unchanged from the
  source PRD's own scope-by-version decisions; this document does not
  reinterpret them.

## 6. Traceability

| Requirement | Persona | Related journey | Satisfied by |
| ----------- | ------- | ---------------- | ------------ |
| URS-ZS-001 | DIR | `spec/journeys/01-school-group-director.md` (`JNY-ZS`, ex-`JNY-ZS-001`) | *(behaviors not yet migrated — see `spec/behaviors/11-dashboards-reporting.md` once written)* |
| URS-ZS-002 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`, `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-003 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/12-massar-regulatory-exports.md`)* |
| URS-ZS-004 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/11-dashboards-reporting.md`, `spec/behaviors/01-administration-onboarding-subscription.md`)* |
| URS-ZS-005 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/02-admissions-enrollment-reenrollment.md`, `spec/behaviors/03-academic-structure-timetables.md`)* |
| URS-ZS-006 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/05-assessments-grades-report-cards.md`)* |
| URS-ZS-007 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/01-administration-onboarding-subscription.md`)* |
| URS-ZS-008 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/12-massar-regulatory-exports.md`, `spec/behaviors/05-assessments-grades-report-cards.md`)* |
| URS-ZS-009 | DIR | `spec/journeys/01-school-group-director.md` | *(→ `spec/behaviors/09-transfers-mobility.md`)* |
| URS-ZS-010 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/02-admissions-enrollment-reenrollment.md`, `spec/behaviors/06-documents-certificates.md`)* |
| URS-ZS-011 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`)* |
| URS-ZS-012 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/06-documents-certificates.md`)* |
| URS-ZS-013 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/06-documents-certificates.md`, `spec/behaviors/07-finance-billing-collections.md`)* |
| URS-ZS-014 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`, `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-015 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/06-documents-certificates.md`, `spec/behaviors/02-admissions-enrollment-reenrollment.md`)* |
| URS-ZS-016 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/behaviors/02-admissions-enrollment-reenrollment.md`)* |
| URS-ZS-017 | SEC | `spec/journeys/02-secretary-cashier.md` | *(→ `spec/cross-cutting/03-non-functional-requirements.md`)* |
| URS-ZS-018 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-019 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`, `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-020 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-021 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-022 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-023 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/cross-cutting/01-permissions.md`)* |
| URS-ZS-024 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/11-dashboards-reporting.md`)* |
| URS-ZS-025 | SUR | `spec/journeys/03-head-supervisor.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-026 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/cross-cutting/01-permissions.md`)* |
| URS-ZS-027 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-028 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/05-assessments-grades-report-cards.md`)* |
| URS-ZS-029 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/03-academic-structure-timetables.md`)* |
| URS-ZS-030 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-031 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/10-teacher-career-network.md`)* |
| URS-ZS-032 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/10-teacher-career-network.md`)* |
| URS-ZS-033 | ENS | `spec/journeys/04-part-time-teacher.md` | *(→ `spec/behaviors/11-dashboards-reporting.md`)* |
| URS-ZS-034 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/cross-cutting/01-permissions.md`)* |
| URS-ZS-035 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-036 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`)* |
| URS-ZS-037 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/11-dashboards-reporting.md`)* |
| URS-ZS-038 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`)* |
| URS-ZS-039 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-040 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`)* |
| URS-ZS-041 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-042 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/cross-cutting/01-permissions.md`)* |
| URS-ZS-043 | PAR | `spec/journeys/05-multi-school-parent.md` | *(→ `spec/behaviors/04-attendance-student-life-discipline.md`, `spec/behaviors/05-assessments-grades-report-cards.md`)* |
| URS-ZS-044 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/13-ancillary-services.md`, `spec/domain-model.md`)* |
| URS-ZS-045 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/02-admissions-enrollment-reenrollment.md`, `spec/behaviors/01-administration-onboarding-subscription.md`)* |
| URS-ZS-046 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/cross-cutting/01-permissions.md`)* |
| URS-ZS-047 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/06-documents-certificates.md`)* |
| URS-ZS-048 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/08-communication-notifications.md`)* |
| URS-ZS-049 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/01-administration-onboarding-subscription.md`)* |
| URS-ZS-050 | GAR | `spec/journeys/06-custodial-mother-and-guardian.md` | *(→ `spec/behaviors/07-finance-billing-collections.md`)* |
| URS-ZS-051 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/cross-cutting/01-permissions.md`, `spec/invariants.md`)* |
| URS-ZS-052 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/behaviors/03-academic-structure-timetables.md`)* |
| URS-ZS-053 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/behaviors/05-assessments-grades-report-cards.md`)* |
| URS-ZS-054 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/behaviors/03-academic-structure-timetables.md`)* |
| URS-ZS-055 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/cross-cutting/01-permissions.md`, `spec/invariants.md`)* |
| URS-ZS-056 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/behaviors/05-assessments-grades-report-cards.md`, `spec/behaviors/06-documents-certificates.md`)* |
| URS-ZS-057 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/invariants.md`)* |
| URS-ZS-058 | ELE | `spec/journeys/07-students-minor-and-adult.md` | *(→ `spec/behaviors/06-documents-certificates.md`)* |

The "Satisfied by" links above point at files this same migration writes in a
later phase (behaviors: Phase 2; journeys: Phase 3). Until those files exist,
the links describe the intended destination, not a resolvable path —
`spec/scripts/verify-traceability.sh`'s broken-link check (check 6) is expected
to flag them until then, which is why Phase 1.5's verification gate only
requires checks 1–3 to pass, not check 6.

## 7. Known gaps

`prd/02-actors-personas.md` §6 already surfaced two version-placement gaps while
being written, both resolved before this migration and carried forward here for
the record rather than silently dropped:

**Parent-teacher discussion threads had two different version placements.**
The old `URS-ZS-030` (teacher side) carried the need at MVP while `URS-ZS-041`
(parent side) carried the same capability at V1 — the same feature, described
twice, at two different versions. Resolved by ADR-ZS-062: a moderated in-app/SMS
core ships at MVP (ADR-ZS-034); WhatsApp and push channels follow at V1. Reflected
above at URS-ZS-030 (MVP) and URS-ZS-041 (MVP core, V1 broader channels) — no
divergence remains.

**The adult-pupil mechanism had three different version placements across
files.** `URS-ZS-055`/`URS-ZS-057` (this file) carried V1, while
`prd/03-domain-data-model.md`'s `INV-ZS-042` carried MVP for the same mechanism —
a genuine three-way disagreement across the actors, domain-model and journey
chapters. Resolved by ADR-ZS-051: MVP across every chapter. Reflected above at
URS-ZS-055 and URS-ZS-057 (both MVP) — see `spec/invariants.md` for the
corresponding `INV-ZS` entry once written.

---

_Related: [Domain model](./domain-model.md) · [Invariants](./invariants.md) ·
[Glossary](./glossary.md) · [Roadmap](./roadmap.md)_
