# ZSchool — Chapter 02: Actors and Personas

| Field | Value |
|---|---|
| Version | 0.3 — English translation (2026-09-09) |
| Date | 2026-09-09 |
| Status | Draft PRD — under review |
| Source | `PROJECT.md` §2.10–2.11 (digital usage, operational realities), §5 (actors, personas), §6.1 (account and profiles, RG-01 to RG-03), §6.4–6.6 (relationships, affiliations, tenants), §8 (roles and permissions, RG-36 to RG-39), §10, §12 |
| Related files | `prd/00-conventions.md`, `prd/01-context-vision-scope.md`, `prd/03-domain-data-model.md`, `prd/journeys/00-journey-map.md` through `prd/journeys/07-students-minor-and-adult.md`, `prd/modules/10-administration-onboarding-subscription.md` through `prd/modules/23-health-sensitive-data.md`, `prd/cross-cutting/42-review-arbitrations.md` (ARB-xx arbitrations applied) |

---

## 1. Catalog of actors

The seven actors below carry over the baseline's typology (§5.1): global identity (the person, unique and persistent), tenant (the data-isolation scope) and platform (the ZSchool operator).

| Actor | Type | Definition | Main stakes |
|---|---|---|---|
| Pupil | Global identity | A person enrolled in school, a minor in the large majority of cases. A pupil profile can exist without an account: a preschool child is represented by their guardians (§6.1). | Track timetable, grades, homework; keep their record from one school to another; once an adult, become the account holder (→ RG-01, RG-02, RG-28). |
| Parent / guardian | Global identity | Father, mother, legal guardian, custodian, financial guardian, authorized contact. Each guardian has their own account (§6.4). | A single account for every child and every school; real-time information; payment and receipts; distinct rights for legal guardian / custodian / payer (→ RG-12b, RG-13, RG-14b). |
| Teacher | Global identity | Permanent or part-time; may work at several schools at once and also carry other profiles (§6.5). | A single, portable profile; fast mobile tools (attendance call, grades); confidentiality of their job search (→ RG-17, RG-20, RG-35, DEC-25). |
| Staff | Global identity | School leadership, front office, accounting, student life, infirmary, transport, library, IT (§5.1). | Fast everyday tools on computer and mobile; fine-grained permissions by role and scope; traceability (→ RG-37, RG-38, RG-39). |
| School | Tenant | An entity authorized to provide education; the data-isolation unit; carries legal information and settings (§6.6). | Ownership of its operational data; compliance (parent contract, exports); collections; a well-run start of year (→ RG-21, RG-22). |
| Organization (school group) | Parent tenant | Groups several schools or sites under one governance; consolidated views and shared administration with no data merge (§6.6). | Consolidated multi-site steering, SaaS billing, cross-site comparison (→ RG-21). |
| ZSchool (operator) | Platform | Provisioning, support, SaaS billing, monitoring, compliance; no access to school data outside a tracked support procedure (§5.1, §8.1). | Network effect of the global identity (transfers, part-time teachers, multi-school parents); CNDP compliance; multi-tenant operations. |

### 1.2 Multi-context nature

The founding principle (§4) gives each person a global identity and each account several profiles (**G-27**, resolved). Permissions are contextual: each context (profile × school) carries its own rights.

| Case | Illustration | Baseline rules |
|---|---|---|
| Part-time teacher across schools | Khadija teaches at two schools in Rabat in the same year (§5.2); simultaneous affiliation is thought to involve more than half of private-sector teachers (H-13). | (→ RG-17, RG-36) |
| Mixed roles | The same account is a teacher at School A and a parent at School B; a parent can also be a staff member (§4). | (→ RG-03, RG-36) |
| Cross-school parent | Ahmed follows three children across two schools from a single account and remains the financial guardian of all three enrollments. | (→ RG-13) |
| A pupil reaching adulthood | Salma, having turned 18, becomes the account holder and can restrict her parents' access, after being informed at her majority and at each re-enrollment. | (→ RG-02, DEC-20) |
| Context switcher | The interface offers a context switcher (profile + school) for any multi-profile account. | (→ RG-03) |

---

## 2. The baseline document's eight personas

Eight personas (§5.2), seven need spaces: Youssef and Salma share the `ELE` namespace, with their minor / adult specifics. Each card cites the realities of §2.10–2.11.

### 2.1 Si Abdellah — CEO of a school group, Casablanca (`DIR`)

| Attribute | Content |
|---|---|
| Profile | CEO of a 1,800-pupil group across three sites, from kindergarten to high school, with a national section and an International Baccalaureate section (§5.2). |
| Context | A multi-site legal entity, separate authorizations, one head per site, consolidated accounting (§2.11). Currently managed on spreadsheets, paper registers and heterogeneous local software (§2.1). |
| Goals | A cross-site consolidated dashboard; tracking unpaid fees; eliminating double entry into Massar; a well-run start of year; compliance (Law 59.21 parent contracts, regulatory exports). |
| Current frustrations | No overview without manual spreadsheet consolidation; manual follow-up on unpaid fees (§2.1, §2.8); re-keying the same data into Massar (§2.6); start-of-year workload peaks concentrated over a few weeks (§2.11). |
| Devices and networks | A computer at the office, mobile between sites; connections sometimes unstable (§2.10). |

Typical scenarios:
1. At 8 a.m., opens the consolidated dashboard (organization-level read-only consolidation from MVP onward, ARB-01): headcounts, attendance rate, unpaid fees by site; reviews automatically triggered reminders.
2. In spring, launches the pre-filled re-enrollment campaign, then prepares the N+1 rollover (structure cloned from year N) — MVP wave 2, June 2027 (ARB-01).
3. At the end of the term, approves period closures, has Massar continuous-assessment exports produced, and checks for missing entries before closing (a warning at MVP, blocking in V1, D3).
4. Approves outgoing transfer requests from his sites (guardian signature checked, never refused on financial grounds, ARB-22).

### 2.2 Fatima — front-office/cashier at a primary school, Salé (`SEC`)

| Attribute | Content |
|---|---|
| Profile | Front-office/cashier at a 350-pupil primary school: enrolls pupils, collects payments, prints certificates, answers the phone (§5.2). |
| Context | A very busy front desk, paper files (§2.11); works on an old PC and her phone (§5.2). |
| Goals | Handle the front desk in one pass (full enrollment, receipt, certificate); stop re-keying; track cheques and reminders without a manual ledger; answer parents with up-to-date information. |
| Current frustrations | Double entry between paper registers and heterogeneous tools (§2.1); queues and manual receipts; cheque due dates tracked by hand; parents demanding documents amid disputed arrears; phone numbers jotted on paper. |
| Devices and networks | An old PC (a lightweight web interface required, §10) and a mobile; connection sometimes unstable (§2.10). |

Typical scenarios:
1. Enrolling a new pupil at the front desk: creating the profile and guardians, matching by Massar code, immediately issuing the certificate and receipt.
2. Collecting a monthly fee in cash, with a receipt handed over and sent to the parent; a cheque logged with its due date.
3. Issuing a certificate of enrollment despite an outstanding balance: an alert is shown, the document is issued, an account statement is attached (never blocked, DEC-24).

### 2.3 Rachid — head supervisor at a middle/high school, Marrakech (`SUR`)

| Attribute | Content |
|---|---|
| Profile | Head supervisor: takes the attendance call by class, phones absentees' parents before 10 a.m., handles tardiness, sanctions and disciplinary councils (§5.2). A central actor in student life (§2.11). |
| Context | Middle/high school; a daily wave of absences, tardiness, discipline and communication with parents (§2.11). |
| Goals | Know who is absent from the first period; notify every family automatically; log tardiness and sanctions; prepare councils with a reliable history. |
| Current frustrations | Manual calls from paper registers; untraceable or wrong phone numbers; no record of justifications; discipline kept on paper; alert thresholds not tracked. |
| Devices and networks | On mobile constantly, rarely a computer; connections sometimes unstable in class (§2.10). |

Typical scenarios:
1. 8:05 a.m.: takes the attendance call for 2AC-3 on mobile, even offline; on sync, absentees' families receive the notification (under 5 minutes after the call is validated, §10).
2. A mother justifies an absence with a photo of the medical certificate from her account; Rachid validates it.
3. Repeated tardiness: an incident is logged, a summons is sent, the file is ready for the disciplinary council.

### 2.4 Khadija — part-time mathematics teacher, Rabat (`ENS`)

| Attribute | Content |
|---|---|
| Profile | Teaches mathematics part-time at two schools in Rabat in the same year; enters grades in the evening on her phone; is looking for a full-time position next year (§5.2). Simultaneous affiliation is the majority case in the private sector (H-13). |
| Context | Doesn't always have a computer in class: attendance calls and grade entry happen on the phone (§2.10). |
| Goals | A single profile across all her schools; fast mobile tools; zero re-keying between schools; a preserved, verified career record; a confidential job search. |
| Current frustrations | Two attendance registers and two grade books; grades re-copied on weekends; no verifiable proof of her teaching periods; informal applications; fear that her job search leaks to her current employer. |
| Devices and networks | Smartphone, a limited data plan; frequent network drops (§2.10). |

Typical scenarios:
1. In class, takes attendance for her group on mobile even with the network down; automatic sync once the connection returns.
2. In the evening, switches the context selector to her second school and enters the test grades.
3. Marks herself as available, invisible to her current schools, and applies for a position.

Secondary character (ARB-23): **Hassan**, a permanent public-sector teacher moonlighting at School A under an individual annual AREF authorization. Khadija is a private-sector part-time teacher: the hourly cap for "public-sector moonlighters" and its tracking (`prd/modules/19`) do not apply to her; they are illustrated by Hassan in `prd/journeys/04`.

### 2.5 Ahmed — father of three children at two schools (`PAR`)

| Attribute | Content |
|---|---|
| Profile | Father of Youssef (2AC, School A), Sara (CE2, School A) and Adam (senior kindergarten, School B); legal and financial guardian of all three (§5.2, §6.4). |
| Context | WhatsApp used by 98.6% of social-network users (H-11); SMS is the universal notification channel; email is rarely checked; the mobile number is the primary contact identifier (§2.10). Fees billed monthly over ten months (§2.4). |
| Goals | See everything from WhatsApp and a single app (§5.2); be notified in real time (absences, grades, announcements); pay on time with a receipt; a clear installment plan for all three children. |
| Current frustrations | One parent account per school in existing solutions (§3.3); no real-time information: absences learned about in the evening; installment plans scattered across paper receipts; saturated, unstructured WhatsApp groups. |
| Devices and networks | Smartphone, WhatsApp as the main channel, mobile data (§2.10). |

Typical scenarios:
1. 9 a.m.: notification of Adam's absence; he justifies it with an attachment from his phone.
2. Checks Youssef's grades, then switches to Sara and Adam without logging in again.
3. Receives an installment reminder, checks the receipt; will pay online from V1 onward via Fatourati, with the school remaining the creditor (→ DEC-31).
4. Changes his mobile number: a self-service procedure with an OTP sent to both the old and the new number, or otherwise at School A's front desk with identity verification (ARB-08).
5. Disputes an absence wrongly logged for Sara: requests a correction from the notification, handled by student life, with a correction notice sent on the same channel (ARB-15).

### 2.6 Naïma — separated mother, custodian (`GAR`)

| Attribute | Content |
|---|---|
| Profile | A separated mother, custodian (*hadana*) of her daughter **Lina, 9, in 4AP at School A (Rabat)**; wants to receive all information; the father, legal guardian, pays the fees and also wants to be informed (§5.2). Named by the review (ARB-26) for the shared scenario cast; the projection to adulthood is illustrated by Salma (`prd/journeys/07`). |
| Context | Family Code (Law 70-03 of 2004, in force): the father is legal guardian by default (art. 236); the order of custody is the mother, then the father, then the maternal grandmother (art. 171); majority is set at 18 full years (art. 209); the custodial mother can obtain administrative school documents (ministry position of 05/30/2023, §2.7). The "December 2024 reform" is a set of proposals submitted to the King on 12/23/2024 (139 provisions), neither voted on nor enacted as of 08/12/2026 (→ `prd/research/00-baseline-corrections.md` #5); the legal parent and the payer are frequently different people (§2.8). |
| Goals | Receive all of her daughter's information the same as the father; obtain documents without going through him; rights that are logged and enforceable; conflicts arbitrated by the school, never by the platform. |
| Current frustrations | A school that only communicates with the father; documents made conditional on her presence or the father's; no record of authorizations; fear of an arbitrary restriction on her access. |
| Devices and networks | Smartphone, SMS and WhatsApp (§2.10). |

Typical scenarios:
1. Receives the same notifications as the father: both are legal guardians, both informed by default.
2. Downloads Lina's certificate of enrollment self-service for an administrative file (custodian self-service, RG-14b, ARB-20); the leaving certificate, however, requires the legal tutor's signature.
3. A court order imposing a restriction is logged by the school: the relevant access is adjusted with an attached document and full traceability.

### 2.7 Youssef (13, 2AC) and Salma (18, 2nd Bac) — pupils (`ELE`)

| Attribute | Youssef, a minor | Salma, an adult |
|---|---|---|
| Profile | 13, 2AC; checks timetable, grades and homework on the family phone (§5.2). | 18, 2nd Bac; wants her own access and her transcripts for her post-baccalaureate applications (§5.2). |
| Access framework | Personal access activated by a legal guardian from the level set by the school (default: 1AC) (→ RG-01); with no phone of his own, Youssef receives a platform-generated login identifier, activated by his father with an OTP sent to the father's number, and can migrate to a personal number later (INV-45, ARB-07). | Having turned 18, she holds her own account and rights over her data; informed of her rights at her majority and at each re-enrollment; can restrict parental access to academic, disciplinary and health data; the financial guardian keeps access to financial data (→ RG-02, DEC-20). |
| Goals | Know what to review, where and when; see her grades as soon as they are published. | Build her post-baccalaureate file (cumulative transcripts); access her documents independently. |
| Current frustrations | Grades and report cards handed out late on paper; timetable posted in the hallway; homework scattered across WhatsApp groups. | Post-baccalaureate steps mean chasing signed transcripts; dependent on the account or the school's front desk. |
| Devices and networks | Shared family phone, Android smartphone, limited data, unstable network (§2.10). | Personal smartphone, unstable mobile network (§2.10). |

Typical scenarios:
1. Youssef checks the timetable (Ramadan variant) and the next day's homework on the family phone.
2. Youssef receives the notification that his report card was published and reads it; the document is immutable, QR verification arrives in V1 (→ RG-33, INV-26).
3. Salma, informed of her rights, restricts her parents' access to academic data; her father keeps access to financial data while he remains liable for fees (MVP mechanism, ARB-10).
4. Salma downloads her annual and cumulative transcripts for her post-baccalaureate applications.

---

## 3. Needs by persona

Identifiers `BES-<PERS>-NN` (conventions §2), counting from 01 per persona. Priority: Must / Should / Could. Version: consistent with the baseline's §12 scope. Modules: codes `ADM`, `INS`, `PED`, `VSC`, `EVA`, `DOC`, `FIN`, `COM`, `TRA`, `CAR`, `RAP`, `MAS`, `SAN`, `HEA`, `PRT` (parent/pupil portals, carried by the journeys and existing modules — conventions §2); "cross-cutting" denotes cross-module requirements (identity, permissions, performance).

### 3.1 BES-DIR — Si Abdellah, CEO

| ID | Need | Persona rationale | Modules involved | Priority | Version |
|---|---|---|---|---|---|
| BES-DIR-01 | View a consolidated multi-site dashboard: headcounts, attendance, results, unpaid fees, occupancy | No overview without manual spreadsheet consolidation (§5.2, §7.11) | RAP | Must | MVP (organization-level read-only consolidation, ARB-01) |
| BES-DIR-02 | Manage collections: unpaid fees by class and by guardian, automatic graduated reminders | Collections are a major concern, manual reminders today (§2.1, §2.8, §7.7) | FIN, COM | Must | MVP |
| BES-DIR-03 | Produce files compliant with Massar templates (rosters, continuous-assessment grades) to eliminate double entry | Double entry is the norm; Massar has no API, file channel only (§2.1, §2.6, H-04, §7.12) | MAS | Must | MVP (wave 2 — year-end close, ARB-01) |
| BES-DIR-04 | Steer the group: consolidated views and shared administration with no tenant data merge | Multi-site entity, one head per site, consolidated accounting (§2.11) | RAP, ADM | Must | MVP (read-only consolidation); V1 (shared administration, group billing) (ARB-01) |
| BES-DIR-05 | Run the start of year: pre-filled re-enrollment campaign, N+1 rollover, class assignment | Start-of-year workload peaks concentrated over a few weeks (§2.11, §7.2) | INS, PED | Must | MVP (wave 2 — year-end close, ARB-01); V1 (campaign reminders) |
| BES-DIR-06 | Close periods, approve and lock report cards | Bilingual report cards, published, immutable, signed (§7.5) | EVA | Must | MVP |
| BES-DIR-07 | Assign staff roles made up of fine-grained permissions by module and scope | Many, specialized staff, editable standard roles (§8.1) | ADM | Must | MVP |
| BES-DIR-08 | Check compliance before closing: minimum number of tests per subject and per period | Compliance check against the national framework before closing (§7.12) | MAS, EVA | Should | MVP (warning, D3); V1 (blocking) |
| BES-DIR-09 | Approve outgoing transfer requests and track incoming ones: check the guardian's signature, the shared scope, never refuse on financial grounds | Mobility between schools, DEC-24, RG-14b (ARB-22) | TRA | Must | MVP |

### 3.2 BES-SEC — Fatima, front-office/cashier

| ID | Need | Persona rationale | Modules involved | Priority | Version |
|---|---|---|---|---|---|
| BES-SEC-01 | Create a complete enrollment at the front desk in one pass: identity, guardians, class, basic enrollment documents issued immediately | "Enrolls pupils" all day; paper files to be eliminated (§5.2, §7.2). DOC at MVP: basic enrollment documents; the full self-service catalog: V1 (BES-SEC-03, §12) | INS, DOC | Must | MVP |
| BES-SEC-02 | Collect all payment methods (cash, cheque, transfer) with an immediate receipt, tamper-proof receipt numbering, and tracking of cheques by due date (full cheque lifecycle at MVP, ARB-01) | "Collects payments" with manual receipts and tracking today (§5.2, §7.7, §2.8) | FIN | Must | MVP |
| BES-SEC-03 | Issue bilingual certificates and attestations on demand: numbering, stamp, signature, QR | "Prints certificates"; bilingual documents in everyday use (§5.2, §7.6, §2.9) | DOC | Must | V1 (the certificate of enrollment and basic enrollment documents are issued from MVP onward, BES-SEC-01; receipt numbering at MVP, ARB-01) |
| BES-SEC-04 | See the arrears alert on the file without ever blocking official documents | Documents never withheld for unpaid fees, an alert and account statement instead (§7.7) | DOC, FIN | Must | MVP |
| BES-SEC-05 | Trigger multi-channel reminders (SMS, WhatsApp) from templates | Answers the phone constantly; manual reminders (§5.2, §7.7, §7.8) | FIN, COM | Should | MVP (SMS; WhatsApp: V1) |
| BES-SEC-06 | Scan supporting documents with a completeness check on the file | Paper files today, lost documents (§2.11, §7.6) | DOC, INS | Should | V1 |
| BES-SEC-07 | Prepare pre-filled re-enrollments and track the reminder campaign | Spring re-enrollment campaign with a deposit (§7.2, §2.8) | INS | Must | MVP (wave 2: pre-filled form, deposit, conversion, ARB-01); V1 (campaign reminders) |
| BES-SEC-08 | Use the tool on an old PC and a mobile: light pages, resume after a drop | Old PC, unstable connection (§5.2, §2.10, §10) | cross-cutting | Must | MVP |

### 3.3 BES-SUR — Rachid, head supervisor

| ID | Need | Persona rationale | Modules involved | Priority | Version |
|---|---|---|---|---|---|
| BES-SUR-01 | Take attendance by class or by course on mobile, tolerant of network drops | "Takes attendance by class," on mobile constantly (§5.2, §7.4, §10) | VSC | Must | MVP |
| BES-SUR-02 | Trigger automatic notification to absentees' families, under 5 minutes after the call | "Phones absentees' parents before 10 a.m.": to be automated (§5.2, §7.4, §10) | VSC, COM | Must | MVP |
| BES-SUR-03 | Receive and validate parents' justifications with an attachment | No reliable record of justifications today (§7.4) | VSC, COM | Must | MVP |
| BES-SUR-04 | Log tardiness, early departures, exemptions and late-entry slips | "Handles tardiness" on a paper register (§5.2, §7.4) | VSC | Must | MVP (tardiness logged at the attendance call, FR-VSC-01); V1 (late-entry slips, early departures, exemptions) |
| BES-SUR-05 | Manage incidents, graduated sanctions, summonses and disciplinary councils | "Sanctions and disciplinary councils" with no history (§5.2, §7.4) | VSC, COM | Must | V1 |
| BES-SUR-06 | Work within a scope limited to the cycles assigned, with actions logged | Least privilege and logging of sensitive actions (RG-39, RG-38) | cross-cutting, VSC | Must | MVP |
| BES-SUR-07 | Have the day's student-life dashboard: absentees, tardiness, ongoing incidents | The day's picture obtained by walking the corridors (§7.11) | RAP, VSC | Must | MVP (day summary: absentees, tardiness, expected calls — ECR-VSC-02); V1 (ongoing incidents, FR-RAP-03) |
| BES-SUR-08 | Reach a parent from the pupil's file, with no paper directory, with the channel and history logged | Numbers jotted on paper, calls not tracked (§2.11, RG-38) | COM, VSC | Should | MVP |

### 3.4 BES-ENS — Khadija, part-time teacher

| ID | Need | Persona rationale | Modules involved | Priority | Version |
|---|---|---|---|---|---|
| BES-ENS-01 | Keep a single profile and switch context between her schools | Two schools in the same year, one person (§5.2, H-13) | cross-cutting | Must | MVP |
| BES-ENS-02 | Take attendance for her courses on the phone in class, including offline | Doesn't always have a computer in class (§2.10, §7.4, §10) | VSC | Must | MVP |
| BES-ENS-03 | Enter grades on mobile, in the evening, with resume after a drop | "Enters her grades in the evening on her phone" (§5.2, §7.5, §10) | EVA | Must | MVP |
| BES-ENS-04 | Keep the lesson log and publish homework and resources | Lesson log / homework (§7.3) | PED | Should | V1 |
| BES-ENS-05 | Message only her pupils' parents, in moderated threads | The teacher role is limited to her courses, least privilege (§8.1, RG-39); moderated in-app threads at MVP under DEC-34 (ARB-21) | COM | Must | MVP |
| BES-ENS-06 | Own a portable professional profile: degrees, subjects, verified affiliation periods, confidential | A preserved, verified career record; a record invisible between schools; no rating (RG-20, RG-35, DEC-25). Scope: portable profile and verified periods; search, applications, availability: V2+ (§12, BES-ENS-07) | CAR | Should | V1 (network: V2+) |
| BES-ENS-07 | Signal her availability and apply without her current employer being notified | "Looking for a full-time position" discreetly (§5.2, §7.10) | CAR | Should | V2 |
| BES-ENS-08 | See the day's classes, pending entries and her classes' averages | Teacher dashboard (§7.11) | RAP, EVA | Should | MVP |

### 3.5 BES-PAR — Ahmed, multi-school parent

| ID | Need | Persona rationale | Modules involved | Priority | Version |
|---|---|---|---|---|---|
| BES-PAR-01 | A single account and a single password for all of his children, across every school | Three children at two schools; one account per school with competitors (§5.2, §3.3) | cross-cutting | Must | MVP |
| BES-PAR-02 | Receive absences, grades and announcements in real time over SMS, WhatsApp and notifications | WhatsApp nearly universal, SMS a universal channel, absences learned about too late (§2.10, H-11, §7.8, §10); grades published as they happen based on the school's settings (ARB-17) | COM, VSC, EVA | Must | MVP (in-app, SMS; WhatsApp: presence notifications, minimal templates; first absence of the day then a summary, ARB-15); V1 (push, broader rollout) |
| BES-PAR-03 | View the installment plan, receipts and payment history for each child | Fees billed monthly over ten months, plans scattered (§2.4, §2.8, §7.7) | FIN | Must | MVP |
| BES-PAR-04 | Switch between children and schools from a multi-child, multi-school view | Multi-child, multi-school parent dashboards (§7.11, §12) | RAP | Must | MVP |
| BES-PAR-05 | Justify an absence with an attachment from the phone | Parent-side justification with an attachment (§7.4) | VSC, COM | Must | MVP |
| BES-PAR-06 | Electronically sign outing authorizations and school events | Electronic parental authorization, events and outings (§7.8) | COM | Should | V1 |
| BES-PAR-07 | Pay online from his banking app or by card, with the school remaining the creditor | Online payment via CMI, Fatourati, aggregators; ZSchool does not hold funds (§2.8); Fatourati (Collect then Aggregator) the primary rail from V1 onward, card payment in V2 (→ DEC-31) | FIN | Should | V1 |
| BES-PAR-08 | Message the form teacher and teachers within a moderated setting | Parent-teacher discussion threads moderated by the school (§7.8, DEC-34) | COM | Should | MVP (moderated in-app, ARB-21); V1 (WhatsApp and push channels) |
| BES-PAR-09 | Change his mobile number or recover access to his account after losing his phone, without losing the link to his children | SIM churn, number reassignment by operators; contact identifier = mobile (DEC-11, ARB-08) | cross-cutting | Must | MVP |
| BES-PAR-10 | Dispute an absence logged in error or request a grade correction before the report card is published | False-positive attendance calls, report cards immutable once published (RG-33, ARB-15) | VSC, EVA, COM | Should | MVP |

### 3.6 BES-GAR — Naïma, custodial mother

| ID | Need | Persona rationale | Modules involved | Priority | Version |
|---|---|---|---|---|---|
| BES-GAR-01 | Access, as legal guardian and custodian, all of her daughter Lina's school information | Ministry position: the custodial mother obtains administrative school documents (§5.2, §2.7, RG-14) | PRT | Must | MVP |
| BES-GAR-02 | See her qualities (legal guardian, custodian, emergency contact) and the associated rights, per school | Distinct qualities recorded, context attributes per school (RG-14b, RG-15) | INS, ADM | Must | MVP |
| BES-GAR-03 | Have her own account, never shared with the father | No account shared between two people (RG-12b) | cross-cutting | Must | MVP |
| BES-GAR-04 | Obtain her daughter's administrative school documents self-service (certificate of enrollment; the leaving certificate requires the legal tutor's signature, ARB-20) | Ministry position on the custodial parent (RG-14b); the May 28, 2021 note is cited in the press but not found online (`prd/research/02` §6); self-service here (§2.7, §7.6) | DOC | Must | V1 (the certificate of enrollment is issued at the front desk from MVP onward) |
| BES-GAR-05 | Receive notifications alongside the father, both informed by default | "The father… also wants to be informed"; both legal guardians by default (§5.2, RG-13) | COM | Must | MVP |
| BES-GAR-06 | See any access restriction based on a logged court order, with an attached document and full traceability | Restriction only on a court order; conflicts reported to the school (RG-14, RG-16) | ADM | Must | MVP |
| BES-GAR-07 | Let the father, as financial guardian, pay the fees without that conditioning her own access | Legal and paying parent are different people; the financial guardian is distinct from the legal guardian (§2.8, RG-13, §7.7) | FIN | Must | MVP |

### 3.7 BES-ELE — Youssef and Salma, pupils

| ID | Need | Persona rationale | Modules involved | Priority | Version |
|---|---|---|---|---|---|
| BES-ELE-01 | Have personal access activated by a guardian from the level set by the school (default: 1AC), with a generated login identifier when the pupil has no phone of their own | Youssef checks it on the family phone; access governed by RG-01 (§5.2); login identifier distinct from contact identifier (INV-45, ARB-07) | cross-cutting, PED, EVA | Must | MVP |
| BES-ELE-02 | View the day's timetable and its variants (normal, Ramadan, exams) | Timetable posted in the hallway; variants by period (§7.3, §2.4) | PED | Must | V1 |
| BES-ELE-03 | View grades and report cards as soon as published, immutable and verifiable by QR | Paper grades handed out late; a fixed, versioned, QR-coded report card (§7.5, RG-33, INV-26) | EVA | Must | MVP (QR: V1) |
| BES-ELE-04 | View homework and the lesson log | Homework scattered across WhatsApp groups (§7.3) | PED | Should | V1 |
| BES-ELE-05 | Become the account holder at 18, informed of her rights, with the ability to restrict parental access | Salma, an adult, wants her own access (§5.2, RG-02, DEC-20) | cross-cutting, ADM | Must | MVP (ARB-10) |
| BES-ELE-06 | Download annual and cumulative transcripts for post-baccalaureate applications | Salma's post-baccalaureate applications (§5.2, §7.5) | EVA, DOC | Must | MVP (wave 2: annual transcript, ARB-01); V1 (cumulative transcript) |
| BES-ELE-07 | Keep access to her academic data despite a parental restriction; the financial guardian keeps access to financial data | An adult pupil: a partial restriction, finance kept with the payer (RG-02) | FIN, cross-cutting | Must | MVP (ARB-10) |
| BES-ELE-08 | Keep read access to published data and documents even after leaving the school | Permanent read access after departure; nothing is visible from another school without sharing (RG-28, RG-30) | DOC, PRT | Must | V1 |

---

## 4. Persona × module matrix

Legend: **P** = data production (write), **C** = view or exchange, **A** = administration / configuration, **—** = not applicable. `SAN` and `HEA` are V2+ modules; parent-side views there are prospective (§12).

| Persona | ADM | INS | PED | VSC | EVA | DOC | FIN | COM | TRA | CAR | RAP | MAS | SAN | HEA |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DIR (Si Abdellah) | A | A | A | C | A | A | A | A | A | C | A | A | — | — |
| SEC (Fatima) | C | P | C | C | C | P | P | P | P | — | C | C | — | — |
| SUR (Rachid) | — | C | C | P | C | — | — | P | — | — | C | — | — | — |
| ENS (Khadija) | — | — | P | P | P | C | — | P | — | C | C | — | — | — |
| PAR (Ahmed) | — | C | C | P | C | C | C | C | C | — | C | — | C | C |
| GAR (Naïma) | — | C | C | P | C | C | C | C | C | — | C | — | C | C |
| ELE (Youssef, Salma) | — | — | C | C | C | C | C | C | — | — | C | — | — | — |

This matrix is indicative: the effective rights come from fine-grained permissions by role and scope (`prd/cross-cutting/30`), under least privilege. "P" for PAR and GAR on VSC denotes justifying an absence with an attachment (BES-PAR-05); "C" on HEA (V2+) denotes legal guardians viewing and updating their child's health record (`PROJECT.md` §8.3); ELE's "C" on RAP denotes the pupil dashboard (§12).

### 4.2 Cross-cutting access: baseline reminders

- **RG-01** — "A pupil has personal access from a level set by the school (default: from 1AC), activated by a legal guardian." (→ BES-ELE-01)
- **RG-02** — Having turned 18, the pupil becomes the account holder and holds their rights; they may at any time restrict their parents' access to academic, disciplinary and health data; the financial guardian keeps access to financial data while they remain liable for fees; every restriction is logged and reported to the school (DEC-20). (→ BES-ELE-05, BES-ELE-07)
- **RG-03** — The same account can be a parent, a teacher and a staff member at once; the interface offers a context switcher (profile + school). (→ BES-ENS-01, §1.2)
- **RG-36** — "Permissions are contextual: the same account can be a teacher at School A and a parent at School B; each context carries its own rights." (→ §1.2, BES-ENS-01)
- **RG-39** — "Least-privilege principle: a teacher only sees the pupils in their own courses; a supervisor only sees the cycles assigned to them." (→ BES-ENS-05, BES-SUR-06, §4)
- Additional rules: every write and every view of sensitive data is logged (RG-38); the organization provides consolidated views without merging tenant data (RG-21); standard roles are made up of editable, fine-grained permissions (RG-37).

---

## 5. Cross-reference to detailed journeys

End-to-end journeys are described in `prd/journeys/00` (journey map) and `prd/journeys/01` through `prd/journeys/07`, in the persona order set by conventions §2; the journey map is authoritative for exact titles.

| Persona | Detailed journey | Steps | Needs covered |
|---|---|---|---|
| Si Abdellah (`DIR`) | `prd/journeys/01` | `PJ-DIR-01` onward | BES-DIR-01 through BES-DIR-09 |
| Fatima (`SEC`) | `prd/journeys/02` | `PJ-SEC-01` onward | BES-SEC-01 through BES-SEC-08 |
| Rachid (`SUR`) | `prd/journeys/03` | `PJ-SUR-01` onward | BES-SUR-01 through BES-SUR-08 |
| Khadija (`ENS`) | `prd/journeys/04` | `PJ-ENS-01` onward | BES-ENS-01 through BES-ENS-08 |
| Ahmed (`PAR`) | `prd/journeys/05` | `PJ-PAR-01` onward | BES-PAR-01 through BES-PAR-10 |
| Naïma (`GAR`) | `prd/journeys/06` | `PJ-GAR-01` onward | BES-GAR-01 through BES-GAR-07 |
| Youssef and Salma (`ELE`) | `prd/journeys/07` | `PJ-ELE-01` onward | BES-ELE-01 through BES-ELE-08 |

## 6. Open questions

No substantive divergence affects the personas, actors and rights cited here, all settled by the baseline document; the exact journey titles belong to the journey map `prd/journeys/00-journey-map.md`. The two version divergences noted here were arbitrated by the review of 09/09/2026 (`prd/cross-cutting/42-review-arbitrations.md`):

| ID | Question | Context |
|---|---|---|
| OQ-01 | **Resolved — ARB-21**: moderated in-app threads at MVP (DEC-34), WhatsApp and push channels in V1; BES-PAR-08, FR-COM-03 and `prd/journeys/00` aligned. Original question: version of the parent-teacher discussion threads: BES-ENS-05 carries them at MVP, BES-PAR-08 at V1 | Same capability, two versions. The baseline's §12 MVP mentions "messages" (in-app and SMS) and DEC-34 sets moderated as the default mode. Proposed reading: a moderated in-app/SMS core at MVP; broader channels and templates rolled out in V1 (channel arbitration: MVP = in-app + SMS + WhatsApp utility limited to presence notifications; V1 = broader rollout, push and managed templates). To be settled in review |
| OQ-02 | **Resolved — ARB-10**: MVP across every chapter (BES-ELE-05, BES-ELE-07, INV-35, PJ-ELE-04/05). Original question: version of the adult-pupil mechanism: BES-ELE-05 and BES-ELE-07 are carried at V1 here, whereas INV-35 (`prd/03-domain-data-model.md`) is carried at MVP | The divergence is also logged in OQ-01 of `prd/journeys/07-students-minor-and-adult.md` and in OQ-06 of `prd/03-domain-data-model.md`. This file followed V1, aligned with the baseline's §12 V1 ("Audit, individuals' rights, formalized CNDP compliance") |

---

## Traceability

| Baseline ID | Baseline element | Coverage in this file |
|---|---|---|
| §2.10 | Digital usage (mobile-first, WhatsApp, SMS, email rarely checked, instability) | §2.2–2.7 (cards); BES-SEC-08, BES-ENS-02/03, BES-PAR-02 |
| §2.11 | Operational realities (multi-site, part-time teachers, student life, front office/cashier, start of year) | §2.1–2.4; BES-DIR-01/02/04/05, BES-SUR-08 |
| §5.1 | Catalog of actors | §1 |
| §5.2 | The eight personas | §2.1–2.7, §3 |
| §6.1, RG-01 | Pupil's personal access | BES-ELE-01 |
| RG-02, DEC-20 | Adult pupil, account holding and logged restriction | §1.2; BES-ELE-05, BES-ELE-07 |
| RG-03 | Multi-profile account, context switcher | §1.2; BES-ENS-01 |
| §6.4, RG-12b through RG-16 | Parent-pupil relationships, qualities, separate accounts, conflicts | BES-GAR-01 through BES-GAR-07, BES-PAR-01 |
| §6.5, RG-17, RG-20, RG-35 | Simultaneous affiliations, professional profile, confidentiality | BES-ENS-01, BES-ENS-06, BES-ENS-07 |
| §6.6, RG-21, RG-22 | School tenant, group organization | §1 (actors); BES-DIR-04 |
| RG-25 | N+1 structure cloning | BES-DIR-05 |
| §6.9, RG-28, RG-30, RG-33 | Permanent read access, no cross-school access, immutable report cards | BES-ELE-03, BES-ELE-08 |
| §7 (7.1 to 7.14) | Functional modules | "Modules involved" column of §3; §4 |
| §8.1, RG-36 through RG-39 | Roles, contextual permissions, least privilege, logging | §1, §1.2, §4.2; BES-DIR-07, BES-SUR-06, BES-ENS-05 |
| §10 | Non-functional requirements (offline, 5-minute delay, performance) | BES-SEC-08, BES-SUR-01/02, BES-ENS-02/03, BES-PAR-02 |
| §12 | Scope by version | "Version" column of every BES |
| DEC-24 | Official documents never blocked for unpaid fees | BES-SEC-04 |
| DEC-25 | No cross-rating between teachers and schools | BES-ENS-06 |
| DEC-31 | Online payment: Fatourati (Collect then Aggregator) from V1 onward, card payment in V2 | BES-PAR-07 |
| H-04 | Massar has no API, file channel | BES-DIR-03 |
| H-11 | WhatsApp near-universal | §2.5, §2.6; BES-PAR-02 |
| H-13 | Part-time teachers' multi-affiliation | §1.2, §2.4; BES-ENS-01 |
| G-27 | One person, several profiles | §1.2 |
| `prd/research/00-baseline-corrections.md` #5 | Family Code: the 12/23/2024 report not voted on (art. 236, 171, 209) | §2.6 (persona Naïma) |
| ARB-01 (`prd/cross-cutting/42`) | Two-wave MVP scope | BES-DIR-01/03/04/05/08, BES-SEC-02/03/07, BES-ELE-06 |
| ARB-07, ARB-08 | Login identifier, changing number | §2.7; BES-ELE-01, BES-PAR-09 |
| ARB-10 | Adult pupil at MVP | BES-ELE-05, BES-ELE-07; OQ-02 |
| ARB-15, ARB-17 | Presence notification, progressive publication, dispute | BES-PAR-02, BES-PAR-10; §2.5 |
| ARB-20 | Certificate of enrollment self-service for the custodian, leaving certificate signed by the guardian | BES-GAR-04; §2.6 |
| ARB-21 | Moderated threads at MVP | BES-ENS-05, BES-PAR-08; OQ-01 |
| ARB-22 | Transfer approval by school leadership | BES-DIR-09; §2.1 |
| ARB-23 | Secondary character Hassan (public-sector moonlighter) | §2.4 |
| ARB-26 | Shared scenario cast (Lina, School A) | §2.6 |
