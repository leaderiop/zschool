# ZSchool — Project Description

**A SaaS platform for managing private schools — Morocco edition**

| Field | Value |
|---|---|
| Document version | 1.2 (English edition) |
| Date | 9 September 2026 |
| Status | Consolidated description, open questions resolved, hypotheses verified through desk research — ready for PRD drafting |
| Next document | PRD (Product Requirements Document) |
| Reference language | English (this is the authorized English edition of the French original, produced at the product owner's explicit instruction on 09/09/2026; every RG, DEC, H, G, C, Q, and figure is unchanged in substance — only the prose language changed). Arabic and French terminology is kept in the glossary, §17. |
| Translation note | Authorized English edition of the frozen French baseline (v1.1), produced at the product owner's explicit instruction (2026-09-09). Substance — every RG, DEC, H, G, C, Q, and figure — is unchanged; only the prose language changed. |

---

## 0. About this document

This document consolidates ZSchool's initial description, places it in the Moroccan context, and corrects the contradictions, gray areas, and gaps identified during review. It serves as the single baseline for the PRD.

Conventions used:

| Prefix | Meaning |
|---|---|
| **RG-xx** | Business rule: behavior the system must respect. |
| **DEC-xx** | A decision recorded in this document (changeable only by an explicit decision of the project owner). |
| **Q-xx** | Open question: must be answered before or during the PRD. |
| **H-xx** | Hypothesis to validate: a plausible claim about the market or regulation, to be confirmed. |
| **C-xx** | A contradiction found in the initial description. |
| **G-xx** | A gap found in the initial description. |

Chapter 13 recaps every contradiction and gap along with its resolution. Chapters 14 through 16 list the decisions, questions, and hypotheses.

---

## 1. Executive summary

ZSchool is a multi-school SaaS platform for Moroccan private schools, from preschool through the baccalaureate, across every teaching system (national, French mission, bilingual, international).

Its founding idea: **a person's identity does not depend on the school**. A student, a parent, a teacher each carry a global identity, a preserved history, and relationships with one or several schools. Each school has an isolated space where it manages its own operational data.

What this changes concretely in Morocco:

- A parent with three children in two different schools uses a single account and a single password.
- A student who changes schools does not start from scratch; their record follows them, under their legal guardians' control.
- A part-time teacher who works at two schools in the same year, then joins a third the following year, keeps a single profile.
- The school no longer has to re-enter the same people every year, and gets functionality aligned with Moroccan realities: grading out of 20, semesters or trimesters, the Massar code, bilingual Arabic/French documents, monthly fees over ten months, SMS and WhatsApp notifications, a Ramadan calendar.

The platform is sold to schools by subscription. Parents, students, and teachers access it for free.

---

## 2. Moroccan context

This chapter is absent from the initial description. Yet it drives most of the product decisions. Every point is flagged with a hypothesis to validate (H) where a figure or a regulatory rule needs to be confirmed for the PRD.

### 2.1 The private education market

- The 2025-2026 school year: 8.27 million students, of whom **1.27 million are in private schools (15.3%)**, preschool included (roughly 0.9 million across the primary, middle, and high school cycles alone). The ministry counted **7,564 private schools** in 2023-2024, of which **70% sit along the Casablanca–Kénitra corridor**. The sector is worth roughly MAD 20 billion and 136,000 jobs (H-01, confirmed).
- Identifiable multi-site networks (Holged: 17,000 students, 18 campuses; EDC: 17,000 students; La Résidence: 5,000; OSUI: 10,000; the French network as a whole: 46,000) make up less than 10% of private-sector enrollment. The long tail is made up of over 7,000 single-site schools.
- The landscape is highly heterogeneous: from the small neighborhood school (100 to 300 students, one site) to the large multi-site school group (2,000 to 6,000 students, preschool through high school), by way of French-mission schools (AEFE, OSUI) and British-, American-, or IB-curriculum schools.
- Most schools still run on Excel spreadsheets, paper registers, and disparate local software. Double data entry (an in-house tool plus Massar) is the norm.
- Fees are billed monthly, and collecting unpaid balances is a major concern for school leadership.
- Parents expect immediate communication (the day's absence, grades, summonses), mainly through WhatsApp and SMS.

### 2.2 Structure of the national education system

| Cycle | Duration | Levels (national nomenclature) | Common private-sector name | End-of-cycle certification |
|---|---|---|---|---|
| Preschool | 2 to 3 years | Small, middle, upper section | Kindergarten (PS, MS, GS) | — |
| Primary | 6 years | 1AP to 6AP (1st to 6th primary year) | CP, CE1, CE2, CM1, CM2, 6ème | Primary studies certificate (a standardized provincial exam at 6AP) |
| Middle school | 3 years | 1AC, 2AC, 3AC (1st to 3rd middle-school year) | 5ème, 4ème, 3ème | Middle school certificate (a regional exam at 3AC) |
| Upper secondary | 3 years | Common core (TC), 1st Bac, 2nd Bac | Seconde, Première, Terminale | Baccalaureate (a regional exam in 1st Bac, a national exam in 2nd Bac) |

Structuring points:

- Upper-secondary school is organized into **tracks** (Mathematical Sciences A/B, Physical Sciences, Life and Earth Sciences, Humanities, Social Sciences, Economics, Accounting/Management Sciences, Sciences and Technologies, etc.) and **options** (International Baccalaureate French Option, English Option, Spanish Option). Private schools mostly offer science tracks and the International Baccalaureate French Option.
- Each certifying exam's final grade combines continuous assessment and external exams under weightings set by the ministry (H-02, confirmed):

| Exam | Continuous assessment | Local or standardized exam | Regional exam | National exam |
|---|---|---|---|---|
| 6AP (primary studies certificate) | 50% (S1 + S2) | 25% (school) | 25% (provincial) | — |
| 3AC (middle-school certificate) | 30% (15% S1 + 15% S2) | 30% (school, end of S1) | 40% (AREF, end of S2) | — |
| Baccalaureate | 25% (S1 + S2 average of 2nd Bac) | — | 25% (end of 1st Bac) | 50% (end of 2nd Bac) |

Baccalaureate honors: highest honors from 16, high honors from 14, honors from 12, pass from 10; a remedial session for averages between 8 and 9.99. The 2021 ministerial memoranda that had changed these weightings were suspended in November 2022.

- **Grade repetition** exists at every level; grade promotion is decided by the class council based on annual averages.
- The class is the basic unit of student life: a student belongs to a class, and the class has a homeroom teacher and a timetable.

### 2.3 Coexistence of several teaching systems

The same school may offer several systems, and a school group may run both a Moroccan section and an international section.

| System | Curriculum | Level nomenclature | Assessment | Particulars |
|---|---|---|---|---|
| Moroccan national | Ministry of National Education | 1AP…2nd Bac | Out of 20, 2 semesters, ministerial weightings | Massar mandatory, certifying exams |
| French mission | French national education (AEFE, OSUI, accredited) | PS…Terminale | Out of 20, 3 trimesters, a school record book | Often run on Pronote or EcoleDirecte |
| Bilingual / private "enhanced national curriculum" | National plus French/English enhancement | National nomenclature, French labels | Out of 20, semesters or trimesters as chosen | The most common case |
| International (British, American, IB) | Cambridge, Common Core, IB | Year 1…Year 13, Grade K…12 | Letters, percentages, GPA | A minority, specific requirements |

**Product consequence**: the academic structure (cycles, levels, tracks, assessment periods, grading scales, weightings) must be **configurable per school and per section**, from templates provided by ZSchool. The Moroccan national system is the default model.

### 2.4 Calendar and school time

- The school year runs from early September to end of June (July for national exams). Fees are typically billed over ten months (September to June).
- The school week runs Monday through Saturday noon in many private schools.
- Morocco runs on UTC+1 but **reverts to UTC+0 during Ramadan**. Timetables are adjusted (continuous hours), often for the whole month.
- Public holidays mix fixed-date national holidays with movable religious holidays (Eid al-Fitr, Eid al-Adha, Islamic New Year, the Prophet's birthday), announced only a few days ahead.
- The official calendar (start of year, breaks, exams) is published every year by the ministry.

**Product consequence**: the `Africa/Casablanca` timezone handled natively, an annual school calendar with editable movable holidays, timetable variants per period (normal, Ramadan, exams).

### 2.5 Assessment and grading

- Grades out of 20 with decimals. A per-subject average, an overall average weighted by coefficients, class rank, honors, per-subject remarks, and an overall remark.
- The national system rests on **continuous assessment** (at least two class assessments per subject and per semester, plus one unified school-level assessment per semester, except in the second semester of exam years) and on external **certifying exams** (6AP, 3AC, 1st Bac, 2nd Bac) whose grades come from the ministry, not from the school.
- The assessment period is the **semester** across all three cycles of the national system, primary included. The **trimester** is specific to schools following the French curriculum. Interim periods (tests, compositions, mock exams) exist in both cases.
- The **class council** deliberates at the end of each period and at year end (promotion, grade repetition, track assignment at the end of 3AC and of the common core).
- Report cards are often bilingual (Arabic and French) and carry the school leadership's stamp and signature.

### 2.6 Massar and national identifiers

- **Massar** is the ministry's information system. Every student receives a **Massar code** (one letter followed by nine digits), assigned at first enrollment and kept for their entire schooling career. For baccalaureate holders since 2015, it replaces the former National Student Code (CNE, 8 digits) as the candidate identifier and for university pre-registration.
- Massar has covered every public and private school, at every cycle, since 2013-2014. Private schools register their students and classes there and enter continuous-assessment grades at every level; this entry is structurally unavoidable for certifying grade levels (6AP, 3AC, 1st Bac, 2nd Bac), since it feeds the official average computed by the ministry. The ESISE statistical census of private schools is validated against Massar data (H-03, confirmed in substance; no circular specific to private schools was found).
- Transfers between schools go through a Massar procedure (a transfer request, approval by the provincial directorate).
- Massar **exposes no API** to vendors (H-04, confirmed). The only documented channel is importing and exporting Excel files from the grade-entry module. The "Massar synchronizations" advertised by competing software rely on this channel or on unofficial automation. ZSchool will produce files in the Massar template formats and will not automate entry into Massar without the ministry's agreement.
- Adults are identified by the **CNIE** (national electronic ID card). Children generally do not have one before age 16; a birth certificate extract and the Massar code are used instead. Foreigners are identified by passport or residence card.

**Product consequence**: the Massar code is the **preferred matching key** for student identity, without being mandatory (preschool, new arrivals, foreign schools).

### 2.7 Regulatory framework

| Text | Scope for ZSchool |
|---|---|
| Law 06.00 (status of private school education) and **Law 59.21** (published in the Official Gazette in March 2026, which carries over and tightens its provisions) | Opening authorization, authorized cycles, at least 80% permanent teachers (Art. 13), an annual individual AREF authorization for external teachers (an 8-hour weekly cap), a teacher file filed with AREF (Order 1538.03), AREF academic and administrative oversight. Law 59.21 requires a **written contract with parents**, full fee transparency (registration, insurance, tuition, catering, boarding, transport), a ban on mid-year increases and forced purchases, a ban on refusing re-enrollment to a student in good standing, mediation committees at AREF, and fines. The full text is still to be read in the Official Gazette (H-14). |
| Framework Law 51.17 (2019) on the education system | System reform, languages of instruction, preschool. |
| Law 09.08 on the protection of individuals with regard to the processing of personal data, CNDP | **Still in force, no overhaul adopted**: the revision drafted by the CNDP in 2026 has not yet reached Parliament (H-05). An ordinary student and parent file: prior declaration (form F211). Health data, national ID numbers, biometrics, file interconnection: prior authorization (form F112, 2 to 4 months). No rule specific to minors: consent is given by the legal representative. **Any hosting abroad is a transfer**: free only to countries on the adequacy list (Deliberation 236-2015: the European Union, the United Kingdom, Switzerland, Canada, among others), otherwise an F118 authorization is required per data controller; the United States is not on that list. Rights of access, rectification, and objection. No obligation for a DPO or breach notification under current law. |
| Law 05.20 (cybersecurity), decrees 2-21-406 and 2-24-921, DGSSI | The obligation to host sensitive data in Morocco and to use DGSSI-qualified cloud hosting applies **only** to government bodies, public institutions, critical infrastructure, and a few listed operators. A private school and a SaaS vendor are not subject to it, unless under contract with a public entity (the ministry, AREF) (H-06, not confirmed as an obligation, confirmed as a market expectation). |
| Law 43.20 (trust services for electronic transactions) and decree 2-22-687 | Three signature levels: simple, advanced, **qualified** (a presumption of reliability, equivalent to a handwritten signature). Qualified providers accredited by DGSSI: Barid eSign (qualified signature, seal, and timestamp), AfricTRUST, DamaneSign. No level is mandated by the texts for report cards and certificates. |
| Family Code (Moudawana) | The **father is the legal guardian by operation of law** (Art. 231 and 236); the mother becomes guardian only if the father dies, is absent, or is incapacitated, or by court order. On divorce, **custody** goes to the mother, then the father, then the maternal grandmother (Art. 171); the non-custodial parent keeps a right of visitation and a say in the child's upbringing. The ministry's position (May 2023): a custodial mother may obtain the child's administrative school documents; disputes are referred to the King's prosecutor. The reform approved in December 2024 (guardianship of the custodial mother for routine matters) **is not in force**. |
| General Tax Code | Tuition fees billed **without VAT and with no right to deduct** (H-07, confirmed). Catering, transport, and school leisure activities provided by the school to its own students: exempt with no right to deduct (Art. 91-V-4°); the same services provided by a third party or a sister company are taxable (transport 14%, catering 10%). School supplies exempt since 2024. Accounting records kept for **10 years** (Art. 211). Mandatory invoice mentions: ICE, IF, RC, business license number. |
| Electronic invoicing (CGI Art. 145-IX, the DGI's fatourati.gov.ma platform) | A "clearance" model: a structured invoice, signed with a qualified certificate, validated in real time by the DGI. The implementing decree was not published in the Official Gazette as of mid-2026; the first wave is announced for large businesses (revenue over MAD 200 million) during 2026, with SMEs and micro-businesses in 2027-2028 (H-08). Private schools will be covered in the later waves; ZSchool plans a UBL-format export and a qualified seal. |
| Circulars and case law | Issuing the school-attendance certificate and the **certificate of departure may not be conditioned on any dispute, including a financial one** (the ministry's position, September 2020; interim court orders with a daily penalty in Salé, Rabat, and Casablanca in 2020). A ministerial note of 28 May 2021: school leaders issue these documents directly from Massar on the guardian's written request. Other circulars: the school calendar, authorizations for external teachers, school insurance, the ESISE census. |

**Product consequence**: ZSchool is the **data processor** for each school's operational data (the school is the data controller) and the **data controller** for global identity and the academic passport. This dual role must be formalized (contracts, CNDP filings, information notices, collecting legal guardians' consent).

### 2.8 Finance and payments

Commonly charged fees:

| Fee type | Frequency | Notes |
|---|---|---|
| Registration fee (new student) | One-time | Generally non-refundable |
| Re-enrollment fee | Annual | Often in spring, with a deposit |
| Tuition | Monthly (10 months), termly, or annual | Priced by level, frequent sibling discounts |
| School insurance | Annual | Mandatory |
| School transport | Monthly | Per route or zone |
| Canteen / after-school care | Monthly or a flat fee | |
| Extracurricular activities, trips | One-off | |
| Supplies, books, uniform | Annual or one-off | Sometimes sold by the school |

Payment methods (H-09, confirmed): cash with a cashier's receipt, cheque (often handed over at the start of the year for all monthly instalments), bank transfer, direct debit (a debit notice through the interbank system, reachable only by the school's own bank, with no API), bank card and online payment.

Structuring points on online payment:

- Since 1 May 2025, CMI is no longer a commercial acquirer and acts only as a national switch. Acquiring is handled by accredited banks and payment institutions (NAPS, Barid Cash, Chari, Cash Plus, among others). Stripe and its equivalents are not available to Moroccan entities.
- **Fatourati**, CMI's interbank bill-payment network (32 banks and payment institutions, over 25,000 cash points), is the channel best suited to schools: the school becomes the creditor, the parent pays from their banking app, an ATM, a mobile wallet, or a cash agent, and reconciliation is automatic. School groups (Yassamine, Al Jabr, Al Madina, the Jeanne d'Arc network) already use it. The "Fatourati Aggregator" offer launched in 2026 lets a software vendor connect its own clients to it.
- Card payment with a registered card and recurring billing: NAPS (the e-Premium offer, 1.98% excl. VAT) or Chari Pay (subscriptions, split payments, multi-beneficiary payouts). Only NAPS and YouCan Pay publish their pricing.
- A platform that held parents' funds before paying them out to schools would need to be licensed as a payment institution by Bank Al-Maghrib. **ZSchool never holds funds**: each school collects into its own account.

Realities to account for: significant payment delays, manual reminders, bounced cheques, case-by-case negotiated discounts, in-house scholarships, payment by a third party (a grandparent, an employer), and a frequent difference between the "legal" parent and the "paying" parent.

### 2.9 Languages and writing

- Interface: French and Arabic at minimum, with full support for right-to-left (RTL) reading order; English desirable for international sections; Amazigh (Tifinagh) to be planned for some content.
- People's names in **dual script** (Latin and Arabic), both required on official documents and in Massar.
- Official documents (the school-attendance certificate, report cards, certificates) are often bilingual, with the school's letterhead, authorization number, seal, and signature.
- Subjects taught in Arabic, French, or English depending on the system: the **language of instruction** is an attribute of the subject.

### 2.10 Digital usage

- Mobile-first: 91.7% of households own a smartphone and 89.2% have internet access (ANRT, 2024-2025 survey); market share is 68% Android and 32% iOS; roughly 8% of households have only a basic phone (up to 14% in rural areas). Connections are sometimes unstable in classrooms.
- WhatsApp is used by 98.6% of social-media users, essentially all parents (H-11, confirmed by these indicators).
- WhatsApp is the de facto channel between schools and parents; SMS remains the universal notification channel; email is rarely checked by parents.
- Many parents and teachers have no active email address: the **mobile phone number** is the primary contact identifier.
- Teachers do not always have a computer in class: attendance is taken and grades are entered on a phone.

### 2.11 Operational realities of private schools

- **Multi-site school groups**: the same legal entity operates several sites (preschool, primary, middle/high school), sometimes under separate authorizations, with one head of school per site and consolidated accounting.
- **Part-time teachers** working at several schools at once (over half of private-sector teachers according to parent associations; an unofficial figure, H-13).
- **The head of student affairs** and supervisors (student life): central actors for absences, late arrivals, discipline, and communication with parents.
- **The front office and cashier**: enrollments, collections, certificates, managing paper files.
- **School transport** with routes, chaperones, and drivers, very widespread.
- **Withholding documents** (certificates of departure, report cards) for unpaid fees: a common but regulated practice, a source of disputes.
- **The start of the year**: workload peaks (enrollments, re-enrollments, class placement, distributing timetables) concentrated over a few weeks.

---

## 3. Vision and value proposition

### 3.1 Vision

Build the digital infrastructure for the school journey in Morocco: a persistent identity for every student, parent, and teacher, a history preserved across schools, access controlled by context.

### 3.2 Value proposition by actor

| Actor | Value |
|---|---|
| School leadership | A single platform for academic structure, student life, grades, finance, and communication; less re-entry; better collections; immediate reporting; easier compliance. |
| Front office, cashier, student life | Fast daily tools (enrollment, collection, roll call, certificates) on computer and mobile. |
| Teacher | Roll call and grades in a few taps from a phone; a single profile even while working at several schools; a preserved career record. |
| Parent | A single account for every child and every school; real-time information (absences, grades, payments, announcements); documents on hand. |
| Student | Timetable, grades, homework, documents; a preserved record; an academic passport down the line. |
| ZSchool | A network effect: the more schools there are, the more valuable the global identity becomes (transfers, teachers, multi-school parents). |

### 3.3 Differentiation

- Global identity and portability, where existing solutions are single-school.
- Built for Morocco: Massar, bilingualism, Ramadan, monthly fees, WhatsApp/SMS, the Moudawana.
- Multiple teaching systems within a single tool.
- Mobile-first SaaS, with no installation and no local server.

**Competitive landscape (G-25, Q-01, resolved).** The market has roughly a dozen active Moroccan vendors and a few foreign solutions:

| Segment | Actors | Finding |
|---|---|---|
| The ministry's system | Massar (Waliye, Moutamadris, Moudaris) | Mandatory and free, but with no billing, transport, canteen, or communication. Parent apps rated between 2 and 2.9 out of 5, not updated since 2022. |
| The legacy vendor | Madariss Plus and eMadariss (Nexsoft, Rabat), claiming over 900 schools | A large installed base, a desktop-software legacy, a poorly rated mobile app. |
| Recent Moroccan SaaS | Skoolly (MAD 4 to 6 per student per month), Minassa (MAD 249 to 1,050 per month depending on enrollment), Tayssir School, SchoolMA (MAD 300 to 800 per month), SchoolApp, E-Schools, DataSchool (the best-adopted parent app: 10,000 installs, 4.2 out of 5), SmartSchool, ALIFADA, E-Madrassati | All single-school, one parent account per school, file-based "Massar synchronization", uneven app quality. |
| Adapted ERPs | Odoo's "Education Pack" through integrators, Galactis (pricing in euros) | Heavy to deploy, group-oriented. |
| Schools on a French curriculum | Pronote (Descartes, Louis-Massignon, EFI high schools), EcoleDirecte | Student life with no billing and no Massar; EcoleDirecte's usage in Morocco is unverified. |

No player offers a multi-school global identity, a single cross-school parent account, or a portable teacher profile. Public Moroccan pricing sits between MAD 10 and 65 per student per year; comprehensive French offers sit around €15 per student per year. The weakness of existing parent apps, Massar included, is the clearest opening.

---

## 4. Founding principle

ZSchool does not model "User → School" but instead:

```text
User (account)
    │
    └── Profiles (student, parent, teacher, staff) — global identity
           │
           └── Relationships (enrollment, affiliation, parental link)
                    │
                    └── Context (school, school year, class)
                             │
                             └── Data (grades, absences, report cards, invoices…)
                                      │
                                      └── Authorization (who can read, write, share)
```

The five levels:

1. **Identity**: the person, unique and persistent.
2. **Relationship**: the link between one identity and another entity (student ↔ school, parent ↔ student, teacher ↔ school).
3. **Context**: the school environment in which a relationship produces data (School B, 2026-2027, 2AC-3).
4. **Data**: the information generated within that context.
5. **Authorization**: the rules that determine who accesses what, and who may share it.

The same person may carry several profiles (a teacher is also a parent of students; a parent is also a staff member). The account is single; profiles are multiple (**G-27**, resolved).

---

## 5. Actors and personas

### 5.1 Actors

| Actor | Type | Description |
|---|---|---|
| Student | Global identity | A person enrolled in school. A minor in the vast majority of cases. |
| Parent / guardian | Global identity | Father, mother, legal guardian, custodial parent, financial guardian, authorized contact. |
| Teacher | Global identity | A person teaching one or several subjects at one or several schools, permanent or part-time. |
| Staff | Global identity | Leadership, front office, accounting, head of student affairs, supervisors, school nurse, transport, library, IT. |
| School | Tenant | An entity authorized to provide education, with its cycles, sites, and data. |
| School group (organization) | Parent tenant | Groups several schools or sites under common governance. |
| ZSchool (operator) | Platform | The ZSchool team: provisioning, support, SaaS billing, monitoring, compliance. |

### 5.2 Personas

- **Si Abdellah, general director of a school group in Casablanca**: 1,800 students across three sites, preschool through high school, a national section and an International Baccalaureate section. Wants a consolidated dashboard, arrears tracking, and to stop double-entering data into Massar.
- **Fatima, secretary-cashier at a primary school in Salé**: 350 students. Enrolls students, collects payments, prints certificates, answers the phone. Works on an old PC and her phone.
- **Rachid, head of student affairs at a middle/high school in Marrakech**: takes attendance by class, calls the parents of absent students before 10 a.m., handles late arrivals, sanctions, and disciplinary councils.
- **Khadija, a part-time mathematics teacher**: teaches at two schools in Rabat, enters her grades in the evening on her phone, is looking for a full-time position for next year.
- **Ahmed, father of three children**: Youssef in 2AC at School A, Sara in CE2 at School A, Adam in the upper preschool section at School B. Wants to see everything from WhatsApp and a single app.
- **Naïma, a separated mother, holder of custody**: wants to receive all information about her daughter; the father, the legal guardian, pays the fees and also wants to be informed.
- **Youssef, 13, in 2AC**: checks his timetable, grades, and homework on the family phone.
- **Salma, 18, in 2nd Bac**: an adult, wants her own access and her transcripts for her post-baccalaureate applications.

---

## 6. Domain model

### 6.1 Account and profiles

- An **account** (User) = a login identifier (mobile phone as the priority, email optional) plus authentication.
- An account carries one or several **profiles**: StudentProfile, ParentProfile, TeacherProfile, StaffProfile.
- A profile may exist **with no account**: a preschool child has a student profile but no access; they are represented by their guardians. A teacher may be created by the school before activating their account.

**RG-01** A student has personal access from a level set by the school (default: from 1AC onward), activated by a legal guardian.
**RG-02** At 18 years of age, a student becomes the holder of their own account and of the rights over their own data (civil majority, Art. 209 of the Family Code). Moroccan law gives parents no right to information about an adult child, but they remain signatories to the contract and payers. By default, guardian access is kept as long as the enrollment is active. The adult student is informed of their rights on reaching adulthood and at every re-enrollment, and may restrict their parents' access to academic, disciplinary, and health data at any time. The financial guardian keeps access to financial and contractual data as long as they remain liable for fees. Any restriction is logged and notified to the school (DEC-20).
**RG-03** The same account may be a parent, a teacher, and staff at once; the interface offers a context selector (profile + school).

### 6.2 Student identity, creation, and matching (**G-01**, resolved)

Three creation paths:

1. **By the school** during admission: the school creates the student profile and the guardians. If a Massar code is entered and a ZSchool profile already exists with that code, the system offers to **attach** it instead of creating a new one. Otherwise a "provisional" profile is created and an invitation code is sent to the guardian so they can **claim** it.
2. **By the parent** from their own account: they declare their child; the school attaches it at enrollment.
3. **By transfer**: the originating school issues a transfer request; the receiving school gets the existing identity.

**RG-04** The Massar code, when provided, is unique across the whole platform.
**RG-05** A "strong" match (an identical Massar code) is proposed automatically. A "weak" match (first name + last name + date of birth + a guardian's phone number) raises a probable-duplicate alert, with no automatic attachment.
**RG-06** **Merging** two student profiles is an audited operation, reserved to ZSchool support or an authorized school role, with confirmation by a legal guardian.
**RG-07** Identity (civil status, Massar code, photo, guardians) belongs to the person. Any school with an active enrollment may correct it; the correction is logged and notified to the other schools concerned.

### 6.3 Enrollment — lifecycle (**C-04**, resolved)

An enrollment links **student ↔ school ↔ school year**, with a level, an optional track, a class, a section (teaching system), a status, dates, a regime (day student, half-boarder), and a financial guardian.

State machine:

```text
CANDIDATE (an admission file)
   │ admission accepted
   ▼
PRE-ENROLLED (a deposit / reservation)
   │ a complete file + the initial payment
   ▼
ACTIVE ──────────────┬───────────────┬──────────────┬─────────────┐
   │                │               │              │             │
   ▼                ▼               ▼              ▼             ▼
SUSPENDED       TRANSFERRED     WITHDRAWN     EXPELLED     COMPLETED
(a temporary     (leaving for    (leaving with  (a disciplinary (year end:
 measure)         another school) no destination) decision)      promoted, held back,
   │                                                              graduated)
   └── back → ACTIVE
```

**RG-08** A student has **at most one ACTIVE enrollment per school year** within the national system. Dual enrollment (a school plus a tutoring center) is not modeled before V2 (DEC-21).
**RG-09** The COMPLETED status carries a **year-end decision**: promoted to the next level, held back, graduated, tracked (a track/stream choice), or not yet determined.
**RG-10** An enrollment is never deleted once it has been ACTIVE; it is closed with a reason and a date. Only CANDIDATE or PRE-ENROLLED enrollments may be cancelled.
**RG-11** A mid-year class change is logged (StudentClassHistory) without creating a new enrollment.
**RG-12** A student may leave a school with a possibly non-zero **financial balance**; the financial relationship survives the closing of the enrollment (see 7.7).

### 6.4 Parent–student relationship (**G-03**, resolved)

A student is linked to **several guardians**, the standard case being **two parents** (father and mother), each with their own global identity and their own account. Neither one is "the" parent of the student: each has their own relationship, qualities, and rights.

```text
Ahmed (father) ──── relationship: father, legal guardian, financial guardian ────┐
                                                                                ├── Youssef
Naïma (mother) ──── relationship: mother, custodial parent, emergency contact ────┘
```

A ParentStudentRelationship carries:

- **Type of link**: father, mother, legal guardian, grandparent, an adult sibling, other.
- **Qualities** (cumulative): legal guardian (wilaya), custodial parent (hadana), financial guardian, emergency contact, a person authorized to pick up the child.
- **Access rights**: view grades, absences, documents, finance, communicate with the school, authorize outings, sign electronically.
- **Status**: active, suspended, revoked; with a supporting document (a court order, a deed).

**RG-12b** A student may have any number of guardians, with no technical limit; the enrollment form offers two parents by default (father, mother) and allows adding others (a legal guardian, a grandparent). Each guardian has their own account: no account is shared between two people.
**RG-13** Every enrollment must have at least one active legal guardian and one financial guardian (who may be the same person or a third party who is not a legal guardian). When both parents are registered, they are both legal guardians by default and both receive notifications, unless configured otherwise (RG-14).
**RG-14** By default, every legal guardian and the custodial parent have access to academic information. Restricting a parent's access is only possible on a court order recorded by the school, with the document attached and traceable.
**RG-14b** The legal guardian (by default the father; the mother if the father has died, is absent, or is incapacitated, or by court order) is the required signatory for enrollment, transfer, and the certificate of departure. The custodial parent may obtain the student's administrative school documents, per the ministry's position. In case of conflict, the school requests a court order or the King's prosecutor's opinion and attaches it to the file. ZSchool records the "legal guardian" and "custodial parent" qualities separately, and will adapt the default values once the Family Code reform comes into force.
**RG-15** The relationship is global (independent of the school), but **each school may add its own context attributes** to it (an outing authorization, people authorized to pick up the child, communication preferences).
**RG-16** Conflicts between guardians (contradictory requests) are flagged to the school, which remains the operational arbiter; ZSchool does not adjudicate.

### 6.5 Teacher and staff affiliation (**C-06**, **C-07**, **G-05**, resolved)

A single **SchoolMembership** entity links a person to a school with a **role** (teacher, director, secretary, accountant, head of student affairs, supervisor, nurse, driver, system administrator…), a **contract type** (permanent, part-time, intern, contractor), dates, a status (invited, active, suspended, ended), and permissions.

**RG-17** A person may hold **several active affiliations at once** at different schools (part-time teachers) and several roles within a single school.
**RG-18** An affiliation is created by the school (an invitation) or requested by the person (an application); it becomes active once both parties accept.
**RG-19** When an affiliation ends, access to the school's data is removed immediately; data produced (grades entered, roll calls, messages) stays with the school, attributed to its author.
**RG-20** A teacher's professional profile (diplomas, subjects, levels, experience, teaching authorization) belongs to them. **Affiliation periods** are confirmed by schools and shown as "verified"; the rest is self-declared.

### 6.6 School, school group, site, tenant (**G-04**, resolved)

```text
Organization (school group)            ← governance, SaaS billing, consolidated reporting
   └── School (tenant)                 ← ministerial authorization, cycles, data isolation
          ├── Site / campus            ← address, rooms, hours
          └── Section                  ← teaching system (national, mission, international)
```

**RG-21** The isolation **tenant** is the school. The organization offers consolidated views and shared administration without merging the data.
**RG-22** The school carries: name (AR/FR), authorization number, its AREF and provincial directorate, authorized cycles, ICE, IF, RC, business license number, CNSS, address, logo, seal, signatories, bank details, settings (calendar, periods, grading, languages, channels).
**RG-23** A minimal public school directory (name, city, cycles, systems, website) exists for the teacher network and for transfers. Everything else is private (**C-08**, resolved).

### 6.7 Academic structure (**G-12**, **G-29**, resolved)

```text
School
 └── School year (2026-2027)
      ├── Calendar (periods, breaks, holidays, schedule variants)
      ├── Section (system) ── Cycle ── Level ── Track/Option
      │                                    └── Class ── Groups (languages, options, labs)
      ├── Subjects (language of instruction, weight per level/track, mandatory/optional)
      ├── Courses (subject × class/group × teacher)
      ├── Assessment periods (semesters or trimesters, sub-periods)
      ├── Grading scales and calculation rules (averages, rounding, honors, rank)
      ├── Rooms and resources
      └── Timetables (per class, teacher, room; variants per period)
```

**RG-24** ZSchool provides structure **templates** (the Moroccan national model per cycle, the French mission, international) that the school instantiates and then adapts.
**RG-25** The structure for year N+1 may be **cloned** from year N (levels, subjects, weights, grading scales) without the students.
**RG-26** A subject's weight and language of instruction are set per level and per track, not globally.

### 6.8 Contextualized academic data

Every academic data item is tied to an enrollment, and thus to a context (school, year, level, class):

- Attendance: absences, late arrivals, early departures, justifications, dispensations.
- Student life: incidents, sanctions, disciplinary councils, conduct grade, rewards.
- Assessments: tests, homework, exams, grades, remarks, averages, ranks.
- Report cards and transcripts: published, versioned, signed.
- Documents: certificates, case-file documents (a birth certificate, a photo, vaccination records…).
- Finance: invoices, instalments, payments, discounts, receipts.
- Health: allergies, treatments, medical contacts (sensitive data, a later module).
- Communication: messages, announcements, summonses, read receipts.

### 6.9 Data ownership, authority, and portability (**C-05**, **G-14**, **G-28**, resolved)

This is the trickiest point in the vision. The following rules remove the ambiguity:

**RG-27 — Author and custodian.** Every academic data item has an **author** (the school, within its own context) and a **data subject** (the student, through their guardians). The school is its operational custodian; the data subject is its beneficiary.

**RG-28 — Reading by the data subject.** The student (and their guardians, per their rights) keeps permanent read access to their **published** academic data (report cards, transcripts, absences, official documents), even after leaving the school.

**RG-29 — Internal data is not portable.** Never portable and never visible outside the authoring school: unpublished grades, drafts, internal comments, deliberations, ongoing disciplinary procedures, staff observation notes.

**RG-30 — No automatic access between schools.** A new school sees of a former one only what the legal guardians (or the adult student) choose to share, plus the official documents exchanged during a transfer procedure.

**RG-31 — Default transfer profile.** The default sharing on a transfer includes: identity, the Massar code, schools attended, years, levels, and year-end decisions, official documents (the certificate of departure, the year-end transcript). Detailed grades, absences, and disciplinary data require explicit sharing. Health data is never transferred automatically.

**RG-32 — Immutability after closing.** After an enrollment closes, the originating school keeps its data **read-only**, for its own archives and legal obligations. A correction remains possible during a configurable grace period (default: 60 days), then only through an audited procedure.

**RG-33 — Immutable report cards.** A published report card is frozen (version, fingerprint, signer, date). Any correction creates a new version; the old one stays viewable, marked "superseded". A verification code (QR) lets anyone check the authenticity of a printed document (**G-19**).

**RG-34 — Retention vs. erasure.** Historical retention takes precedence for official academic data, for the durations set per data type in DEC-22 (permanent for official registers and documents, 10 years for finance, limited durations for attendance, discipline, health, and messages). The right to erasure applies to the account and to non-official data (preferences, messages) and results in **anonymizing** the identity, not in deleting the school's registers.

**RG-35 — Teachers.** A school sees of a teacher's history only what that teacher shares, plus verified affiliation periods. No evaluation of a teacher by one school is visible to another school (**G-23**).

### 6.10 Entity diagram (**C-07**, consolidated)

```text
IDENTITY
  User                       a login account (phone, email, passwords, MFA)
  Person                     bilingual civil status, date/place of birth, sex, nationality, identity documents
  StudentProfile             Massar code, photo, status, special needs (opt.)
  ParentProfile               occupation (opt.), communication preferences
  TeacherProfile              diplomas, subjects, levels, teaching authorization, experience
  StaffProfile                functions, credentials

RELATIONSHIPS
  ParentStudentRelationship  type, qualities, rights, status, supporting documents
  Enrollment                 student × school × year; level, track, class, section, status, regime
  StudentClassHistory        mid-year class changes
  SchoolMembership           person × school; role(s), contract, dates, status, permissions
  TeacherAssignment          teacher × course (subject × class/group)
  TransferRequest            student, originating school, destination school, status, documents, shared scope
  ConsentGrant                data subject → recipient; scope, duration, revocation

SCHOOL
  Organization                school group
  School                     tenant; legal information, settings
  Campus                     site
  Section                    teaching system
  AcademicYear, Calendar, Holiday, ScheduleVariant
  Cycle, Level, Track (track/option), Class, Group
  Subject, SubjectLevelConfig (weight, language), Course
  Room, Timetable, TimetableSlot
  GradingScale, EvaluationPeriod, ComputationRule

ACADEMIC DATA
  AttendanceRecord, Justification, Dispensation
  Assessment (type, subject, period, weight, scale), Mark, Remark
  PeriodResult (averages, rank, honors, remarks), YearDecision
  ReportCard (version, fingerprint, signer, QR), Transcript, Certificate, StudentDocument
  Incident, Sanction, DisciplinaryCouncil, ConductGrade
  HealthRecord (a later module)

FINANCE
  FeeSchedule (a grid per level/year), FeeItem, Discount, Scholarship
  Invoice, Installment, Payment, Receipt, Refund, Dunning (reminders), CashSession
  FinancialAccount (per enrollment and per financial guardian)

COMMUNICATION
  Announcement, Message, Thread, Notification, DeliveryLog (channel, status, cost)
  Meeting/Convocation, Event

PLATFORM
  Subscription, Plan, ModuleActivation, UsageMetric (active students, SMS)
  AuditLog, DataExport, MergeOperation, SupportTicket
```

---

## 7. Functional modules

For each module: scope, Moroccan specifics, key rules. The breakdown by version is in chapter 12.

### 7.1 School administration and onboarding (**G-06**, resolved)

- Tenant creation by ZSchool (or self-registration with validation), entering legal information, uploading the logo and seal, configuring languages and channels.
- A setup wizard: choosing the structure template, the school year, periods, grading scales, the fee schedule.
- **Bulk import** from Excel (students, parents, teachers, classes, historical grades) with duplicate checks and an error report (**G-18**).
- Managing internal users, roles, and permissions.
- The subscription lifecycle: trial, active, payment overdue (read-only mode after a delay), cancelled. On cancellation: a full export of the school's data, a retention period, then deletion of operational data; global identities and data subjects' access to their published documents are kept. Durations: 90 days read-only, deletion of operational data 12 months after cancellation (DEC-23).

### 7.2 Admissions, enrollments, and re-enrollments (**G-07**, resolved)

- An application file (online or at the front desk), required documents, admission tests, a waitlist, a decision.
- Enrollment: level, class, section, regime, guardians, financial guardian, options (transport, canteen), acceptance of internal rules and information notices (Law 09.08).
- **Re-enrollment campaign**: opening, pre-filled forms, a deposit, reminders, conversion into an N+1 enrollment.
- **Year-end rollover**: bulk promotion decisions (promoted, held back), creating N+1 enrollments, class placement, handling departures.
- Immediate issuance of enrollment documents (a certificate, a receipt, a bilingual student form).

### 7.3 Academics and timetables (**G-13**, resolved)

- Configuring the structure (see 6.7), assigning teachers to courses, homeroom teachers.
- Timetable: a weekly grid, assisted manual entry, conflict detection (teacher, room, class), variants (normal, Ramadan, exams), publication to students, parents, and teachers; PDF export.
- Automatic generation under constraints: a later version.
- Class journal / homework: session content, work to do, resources.

### 7.4 Attendance and student life (**G-14**, resolved)

- Roll call per course or per half-day, on mobile, with an offline mode and sync.
- Automatic notification to guardians (SMS/WhatsApp/push) per the school's rules (delay, thresholds).
- Justification by the parent (an attachment), validation by student-life staff, statistics and alert thresholds.
- Late arrivals, early departures, dispensations (sport), entry slips.
- Discipline: incidents, warnings, graduated sanctions, summonses, disciplinary councils, a conduct grade. This data is **not portable** outside the school (RG-29, RG-31).

### 7.5 Assessments, grades, and report cards (**G-12**, resolved)

- Configurable assessment types (continuous assessment, homework, a composition, a mock exam, oral, a project) with a scale, a weight, and a period.
- Entry by the teacher (web and mobile), per subject and class, locked by school leadership at the close of each period.
- Configurable calculation rules: per-subject and overall averages, rounding, dropping the lowest grade, honors, rank, thresholds.
- A minimum number of assessments per subject and per period (a compliance check against the national curriculum).
- Integrating certifying-exam grades, entered or imported (the ministry's results).
- The class council: preparation, remarks, a decision, minutes.
- **Report cards**: bilingual templates, seal and signature, versioning, publication to families, a verification QR code (RG-33).
- Annual and cumulative transcripts for post-baccalaureate applications.

### 7.6 Documents and certificates

- School-attendance certificate, certificate of achievement, attendance certificate, certificate of departure, an information sheet, an outing authorization, an employer certificate.
- Configurable bilingual templates, numbering, signature, seal, QR code.
- A digital student case file (identity documents, birth certificate, photo, vaccination record, court orders) with strict access control.
- Generated on request by the front office, or self-service by the parent for documents the school authorizes.

### 7.7 Finance (**G-15**, **G-16**, **C-10**, resolved)

- Fee schedules per year, level, section, and option; ancillary fees; automatic **sibling discounts**; negotiated scholarships and discounts requiring approval.
- Monthly, termly, or annual payment schedules per enrollment; compliant invoicing (ICE, IF, RC, business license number, VAT mentions); tamper-proof sequential numbering.
- Collections: cash with a cash session, cheques (due date, deposit, bounced), bank transfer, direct debit, online payment (CMI and aggregators, a later version); printable receipts sent to the parent.
- Automatic graduated reminders (SMS, WhatsApp, mail); an arrears dashboard by class, by guardian; an aged balance.
- A financial guardian distinct from the legal guardian; splitting between two payers; payment by a third party.
- **Balance after departure**: the school keeps access to the closed enrollment's financial account until settled; the parent keeps access to their payment history (RG-12).
- **Official documents and unpaid fees (Q-06, resolved)**: ZSchool **never blocks** issuing a school-attendance certificate, a certificate of departure, report cards, or transcripts for unpaid fees, consistent with the ministry's position, the 2020 interim court orders, and the note of 28 May 2021. Arrears are shown as an alert on the file and summarized in an account statement given to the parent along with the exit file. The school may condition only non-mandatory services (transport, canteen, activities) on payment, and pursues collection through reminders, then legal action (DEC-24).
- **Parent contract (Law 59.21)**: generating the written contract with the full fee schedule, electronic acceptance, archiving; no fee change is possible mid-year on an active enrollment.
- Accounting exports (a simplified general ledger, a cash journal, a format compatible with common accounting software).

### 7.8 Communication (**G-17**, resolved)

- Announcements by school, cycle, level, class; individual messages; parent–teacher discussion threads moderated by the school.
- Channels: in-app notification, mobile push, SMS, the WhatsApp Business API, email. Routing rules by message type and parent preferences; bilingual content.
- Delivery tracking (sent, delivered, read), SMS/WhatsApp costs charged to the school (packs).
- Summonses and appointments (parent-teacher meetings), events and trips with electronic parental authorization.
- Message templates (the day's absence, a late payment, a published report card, a weather alert, Ramadan).

### 7.9 Transfers and mobility (**G-08** in part)

- A transfer request initiated by the parent or by the receiving school; approval by the originating school (balance, returning equipment, the certificate of departure).
- Closing the originating enrollment (a TRANSFERRED status), creating the receiving enrollment on the same identity.
- Choosing the **shared scope** by the legal guardian (the default transfer profile, RG-31), with a consent log.
- Recording the Massar transfer reference (the ministerial procedure runs outside ZSchool in V1).
- The case of a transfer to a school outside ZSchool: generating the exit file (a bilingual PDF) and closing.

### 7.10 Teacher career and network (**G-23**, resolved)

- A professional profile: diplomas, subjects, levels, languages, teaching authorization, verified and self-declared experience, availability.
- A school directory, applications, invitations, acceptance.
- **Confidentiality**: the "open to opportunities" status is invisible to schools where the teacher is currently affiliated; searches are never notified to the current employer.
- No rating of teachers by schools nor of schools by teachers, at any point on the roadmap (DEC-25).

### 7.11 Dashboards and reporting

- Leadership: enrollment counts by level and class, attendance rate, results by subject, arrears, room occupancy, teacher activity, an inter-site comparison (an organization).
- Student life: today's absences, late arrivals, ongoing incidents.
- Teacher: today's classes, pending entries, their classes' averages.
- Parent: a view per child and across schools (see 8).
- Regulatory statistics: enrollment counts, staffing, year-end results to be submitted through the ministry's ESISE platform (the private-school census, the HR reference dataset, the May census); the exact forms are to be gathered from pilots (H-10).

### 7.12 Massar and regulatory exports (**G-08**, resolved)

- A Massar code field on every student, format validation, uniqueness.
- Exports in the format of the Excel import files used by the Massar grade module (student lists, continuous-assessment grades by subject and by semester) to reduce double entry; no automation of entry into Massar without an official channel (H-04, confirmed).
- A compliance check against the national curriculum: at least two assessments per subject and per semester, an alert before closing the period.
- Preparing the ESISE census data (enrollment counts, staffing, year-end results).
- Importing published certifying-exam results.
- A transfer log with Massar references.
- A medium-term goal: direct integration if an official channel opens up.

### 7.13 Ancillary services (a later version)

- School transport: routes, stops, subscriptions, chaperones, boarding/alighting check-in, parent notification, geolocation.
- Canteen and after-school care: subscriptions, menus, check-in.
- Extracurricular activities and trips: sign-ups, payments, authorizations.
- Library, uniform, and supplies.

### 7.14 Health (a later version, sensitive data)

- A medical record: allergies, chronic conditions, treatments, treating physician, emergency contacts, vaccinations.
- Restricted access (the school nurse, leadership), processing subject to CNDP authorization, never carried automatically on a transfer.

---

## 8. Roles and permissions (**C-09**, **G-05**, resolved)

### 8.1 Roles

| Level | Role | Description |
|---|---|---|
| Platform | ZSchool super-administrator | Provisioning, global configuration, compliance. No access to academic data without a tracked support procedure. |
| Platform | ZSchool support | Temporary, audited access to a tenant on a ticket. |
| Organization | Group administrator | Consolidated views, managing the group's schools, subscription. |
| School | Director / administrator | Every function within the tenant. |
| School | Academic leadership | Structure, assignments, report cards, class councils. |
| School | Front office | Enrollments, files, documents, communication. |
| School | Accounting / cashier | Finance only. |
| School | Head of student affairs / student life | Attendance, discipline, communication with parents. |
| School | Teacher | Their own courses: roll call, grades, class journal, messages to their students' parents. |
| School | Homeroom teacher | Teacher plus a summary view of their class. |
| School | School nurse, transport, library | Dedicated modules. |
| Person | Parent / guardian | Per their qualities and rights (6.4). |
| Person | Student | Their own data, per their level and the school's policy. |

### 8.2 Principles

**RG-36** Permissions are **contextual**: the same account may be a teacher at School A and a parent at School B; each context carries its own rights.
**RG-37** School roles are made up of fine-grained permissions (read/write per module and per scope: class, level, the whole school); ZSchool provides editable role templates.
**RG-38** Every write action and every consultation of sensitive data (a file, health, finance, discipline) is logged with the author, the context, and a timestamp.
**RG-39** The principle of least privilege: a teacher sees only the students in their own courses; a supervisor sees only the cycles they are assigned to.

### 8.3 Summary matrix (an excerpt, to be detailed in the PRD)

| Data | Student | Parent | Course teacher | Homeroom teacher | Student life | Front office | Accounting | Leadership |
|---|---|---|---|---|---|---|---|---|
| Timetable | R | R | R | R | R | R/W | — | R/W |
| Attendance | R | R | W (their courses) | R | R/W | R | — | R/W |
| Unpublished grades | — | — | W (their courses) | R | — | — | — | R/W |
| Published report cards | R | R | R (their subjects) | R | R | R | — | R/W |
| Discipline | R (partial) | R | R (their students) | R | R/W | — | — | R/W |
| Identity file | R | R/W (partial) | — | R (partial) | R | R/W | R (partial) | R/W |
| Finance | — | R (if entitled) | — | — | — | R | R/W | R/W |
| Health | — | R/W | — | R (alerts) | R (alerts) | — | — | R (module) |

R = read, W = write.

---

## 9. Security, privacy, and compliance (**G-09**, **G-20**, resolved)

- Authentication by phone (SMS OTP) and/or email and a password; MFA for school roles; session and device management; secure reset.
- Multi-tenant isolation at the data level (a tenant key on every operational record, checked systematically server-side); global entities (identities, relationships) are reachable only through an active relationship or a consent.
- Encryption in transit and at rest; strengthened encryption for sensitive data (identity documents, health, court orders).
- An immutable, exportable audit log, kept for the legal retention period.
- Data-subject rights (Law 09.08): access, rectification, objection, portability of published documents; a request-handling procedure.
- Consents: information notices at enrollment, legal guardians' consent for minors, sharing consents at transfer time and for the academic passport, all logged.
- CNDP filings and authorizations: for the school's own processing activities (an F211 filing, with templates provided by ZSchool) and for ZSchool's own processing activities; a prior F112 authorization for health data, national ID numbers, and any biometrics; an F118 authorization for any flow to a country outside the adequacy list.
- **Hosting (Q-08, resolved)**: production and backups **in Morocco**. Primary target: the Oracle Cloud "Morocco West (Casablanca)" region, opened in 2026 in the N+ONE data center; a backup site in a second Moroccan data center (N+ONE Settat, Atlas Cloud Services in Benguerir, or OVHcloud's local zone in Rabat). No student data thus leaves the territory, which avoids any transfer formality under Law 09.08. The only outbound flows are those of messaging vendors (WhatsApp, email); ZSchool provides schools with the matching F118 request template and uses a Moroccan SMS aggregator (DEC-26). The availability of managed services in the Casablanca region is still to be verified (H-18).
- Encrypted backups, restore tests, a continuity plan, an incident log, and breach notification.
- Application security: code reviews, periodic penetration tests, vulnerability management, rate limiting, protection against identity enumeration (in particular the Massar code).
- Deletion and anonymization per RG-34; a full export on cancellation.

---

## 10. Non-functional requirements (**G-21**, resolved)

| Domain | Requirement |
|---|---|
| Languages | FR and AR in V1 with full RTL; EN in V2; bilingual user content (names, labels, documents). |
| Platforms | A responsive web app; a mobile app (a PWA in V1, native Android and iOS apps in V2) for parents, students, teachers. |
| Offline | Taking attendance and entering grades tolerant of connectivity drops, with sync and conflict resolution. |
| Performance | Common pages under 2 s on a 4G mobile network; generating a report card under 3 s; publishing report cards for a 2,000-student school under 10 minutes. |
| Availability | A 99.5% target, excluding announced maintenance; maintenance windows outside start-of-year and exam periods. |
| Target scale | Technical sizing for three years: 500 schools, 500,000 students, 1,000,000 guardians, 30,000 teachers — roughly 2.5 times the commercial ambition in DEC-27 (300 schools, 200,000 students). |
| Timezone and calendar | Africa/Casablanca, handling the switch to UTC+0 during Ramadan, both Hijri and Gregorian calendars for holidays. |
| Notifications | An absence-notification delay under 5 minutes after the roll call is validated. |
| Documents | Bilingual PDFs, correct Arabic fonts, A4 and A5 formats, batch printing. |
| Accessibility | Contrast, font sizes, keyboard navigation, screen readers on the main journeys. |
| Observability | Logs, metrics, alerts, per-tenant traceability. |
| Interoperability | Excel/CSV/PDF exports everywhere; a documented public API in V2; webhooks. |
| Backups | Daily, at least 30 days' retention, restore tested quarterly. |

---

## 11. SaaS business model (**G-24**, resolved)

- **Paying customer**: the school (or the organization for a group). Parents, students, teachers: free.
- **Billing unit**: the active student, counted each month from September to June (10 months), billed monthly in MAD; no billing in July and August.
- **A single plan**: one plan that includes every available module (administration, academics, attendance, grades, report cards, communication, finance, timetable, documents, transfers, and the later modules — transport, canteen, health, online payment, an API — as they roll out). No paid option per module.
- **Consumables**: SMS and WhatsApp packs, document storage beyond a quota.
- **Services**: onboarding and data migration, training, configuration, premium support.
- **Trial**: free for a limited period, with demo data.
- **Pricing (Q-10, resolved, confirmed by the product owner)**: **MAD 5 per active student per month**, i.e. MAD 50 per student per year over 10 months, all inclusive. A 300-student school pays MAD 1,500 per month; a 2,000-student group pays MAD 10,000 per month. This price sits at the high end of the observed Moroccan range (MAD 10 to 65 per year), with a much more complete offer than competitors (global identity, a parent app, Fatourati collections, every module). Only consumables are billed on top: SMS packs resold on the basis of a Moroccan aggregator (MAD 0.30 to 0.50 per SMS) with a margin, WhatsApp conversations, storage beyond the quota; onboarding and migration billed at a flat rate (DEC-28).
- **Digitalization subsidies**: the SME/micro-business digitalization subsidy program cited by Moroccan integrators is a commercial lever still to be verified (H-22).
- **Growth levers**: a network effect from multi-school parents and teachers, referrals between school leaders, partnerships (school insurers, transport operators, banks for payment).
- **Outlook**: the academic passport, a professional teacher network, a services marketplace, institutional partnerships.

---

## 12. Scope by version (**G-22**, resolved)

### MVP (validation with 3 to 5 pilot schools)

- School onboarding, an Excel import, an academic structure (the national model), a year, classes, subjects.
- Global student/parent/teacher identities, Massar matching, invitations and claiming.
- Enrollments (a simplified state machine: pre-enrolled, active, completed, transferred, withdrawn).
- Parent–student relationships with default qualities and rights.
- Teacher and staff affiliations, role templates.
- Attendance with SMS/WhatsApp notification, justification.
- Assessments, grades, average calculation, published, immutable bilingual report cards.
- Base finance: a fee schedule, a payment schedule, collections, receipts, arrears, reminders.
- Communication: announcements, messages, in-app and SMS notifications.
- Dashboards: multi-child, multi-school for parents, plus one each for students, teachers, and leadership.
- A simple transfer between two ZSchool schools and a PDF exit file.
- FR/AR, responsive web, a PWA.

### V1 (commercial launch)

- Admissions and the re-enrollment campaign, the year rollover, class councils.
- A timetable with conflict detection and Ramadan variants.
- Full discipline and student life.
- Self-service documents and certificates, a verification QR code.
- Full finance: cheques, cash sessions, accounting exports, compliant invoices, discounts and scholarships.
- Massar exports, regulatory statistics.
- Multi-school organizations with consolidated views.
- The WhatsApp Business API, mobile push, native apps.
- Audit, data-subject rights, formalized CNDP compliance.

### V2 and beyond

- A digital academic passport (chapter 6.9 and the vision).
- A professional teacher network (search, applications, availability).
- Online payment (CMI, aggregators), direct debits.
- Transport, canteen, activities, health.
- Automatic timetable generation.
- A public API, accounting integrations, Massar integration if a channel opens up.
- English, advanced international sections (letter grades, GPA).
- Light e-learning (resources, homework online).

---

## 13. Critical review of the initial description

### 13.1 Contradictions found

| ID | Finding | Impact | Resolution |
|---|---|---|---|
| C-01 | The examples use the French nomenclature (5e, 4e, 3e) even though the target market is Moroccan (1AC, 2AC, 3AC). | An implicit, ill-fitting level model. | Levels configurable per section and system, with the national model as the default (2.2, 2.3, RG-24). |
| C-02 | Inconsistent timelines between examples: §4 (School A 2022-2024, School B 2024-2025, School C 2025-2026), §6 (School A 2023-2024), §28 (School A 2022-2024, School C 2024-…). | Confusion over the number of schools and years. | Examples harmonized in this document; the PRD will use a single scenario set. |
| C-03 | §12: "the school manages its parents"; §7: the parent is global. | Ambiguity over who owns the parent. | The school manages the **relationship** and its context attributes, not the identity (RG-15). |
| C-04 | Partial, differing enrollment statuses between §6 (Completed, Transferred, Active) and §23 (ACTIVE → ENDED/TRANSFERRED). | No state machine, no year-end decision. | A complete state machine (6.3, RG-08 to RG-12). |
| C-05 | §5: the global history contains grades, absences, report cards from every school; §28: School C does not access it automatically; §32: an academic passport. Nothing says who decides on sharing. | The core of the promise is undetermined. | An ownership, consent, and default transfer-profile model (6.9, RG-27 to RG-35). |
| C-06 | §9-11 describe a sequential career (leave, then join); the Moroccan reality is simultaneous multi-affiliation for part-time teachers. | An overly restrictive affiliation model. | Simultaneous affiliations authorized (RG-17). |
| C-07 | Redundant entities: SchoolMembership, TeacherMembership, StaffProfile, an undefined "Relationship". | An inconsistent data model. | A single SchoolMembership entity with a role and a contract; profiles kept distinct from affiliations (6.5, 6.10). |
| C-08 | §13: strict isolation; §11: a school directory; §7: a cross-school parent. | Isolation defined in absolute terms yet contradicted. | A distinction between public directory data, isolated operational data, and global data reachable through a relationship (RG-21, RG-23). |
| C-09 | §15: "Administration" as a single role; §12: fifteen different functions. | No permission granularity. | Detailed school roles and fine-grained permissions (8.1, RG-37). |
| C-10 | §20: finance stays tied to the school; §24: a transfer closes the relationship. Nothing about unpaid balances after departure. | Lost collections or a blocked transfer. | A financial relationship surviving the closing of the enrollment (RG-12, 7.7). |
| C-11 | §2 mentions a "school or professional career", and §32 an academic passport for the student; the rest of the document covers only K-12. | Ambiguous target (vocational training? higher education?). | Target: preschool through the baccalaureate. "Professional" refers to teachers' careers. Extension to higher education is out of scope (DEC-29). |

### 13.2 Gray areas and gaps

| ID | Gap | Resolution in this document |
|---|---|---|
| G-01 | Creating, matching, de-duplicating, and merging identities. | 6.2, RG-04 to RG-07. |
| G-02 | Minors, young children's accounts, adulthood, consent. | 6.1, RG-01, RG-02, chapter 9. |
| G-03 | Parental authority, custody, the financial guardian, conflicts between parents. | 6.4, RG-13 to RG-16. |
| G-04 | Multi-site school groups and the organization level. | 6.6, RG-21. |
| G-05 | Non-teaching staff, administrative sub-roles, platform roles. | 6.5, 8.1. |
| G-06 | Onboarding, the subscription lifecycle, cancellation, export, retention. | 7.1, Q-05. |
| G-07 | Admissions, re-enrollments, the year rollover, promotion, repetition, waitlists. | 7.2. |
| G-08 | Massar, regulatory obligations, ministry statistics. | 2.6, 7.12, H-03, H-04, H-10. |
| G-09 | Law 09.08, CNDP, controller/processor roles, hosting. | 2.7, chapter 9. |
| G-10 | AR/FR bilingualism, RTL, dual-script names, bilingual documents. | 2.9, chapter 10. |
| G-11 | The Moroccan calendar: Ramadan, UTC+0, movable holidays, Saturday. | 2.4, chapter 10. |
| G-12 | A configurable assessment system, semesters/trimesters, weightings, certifying exams. | 2.5, 6.7, 7.5. |
| G-13 | Timetables: constraints, rooms, variants, multi-site. | 7.3. |
| G-14 | Discipline, student life, health: absences; the portability of this data. | 7.4, 7.14, RG-29, RG-31. |
| G-15 | Moroccan finance: fee types, payment methods, compliant invoices, sibling discounts, cash. | 2.8, 7.7. |
| G-16 | Withholding documents for unpaid fees. | 7.7, Q-06. |
| G-17 | Real-world channels (WhatsApp, SMS), costs, preferences. | 2.10, 7.8. |
| G-18 | Importing and migrating existing data. | 7.1. |
| G-19 | Report-card immutability, versioning, verification. | RG-33. |
| G-20 | Audit, logging, rectification rights. | RG-38, chapter 9. |
| G-21 | Non-functional requirements. | Chapter 10. |
| G-22 | MVP scope vs. the vision. | Chapter 12. |
| G-23 | Confidentiality of teachers' job searches, cross-ratings, diploma verification. | 7.10, RG-35, Q-07. |
| G-24 | Who pays, the billing unit, pricing. | Chapter 11, Q-10. |
| G-25 | Competition and differentiation. | 3.3, Q-01. |
| G-26 | Adult students and targets outside K-12. | RG-02, C-11, Q-11. |
| G-27 | The same person with several profiles. | 6.1, RG-03, RG-36. |
| G-28 | The right to erasure vs. historical retention. | RG-34, Q-04. |
| G-29 | Curriculum, section, language of instruction per subject. | 2.3, 6.7, RG-26. |
| G-30 | Vague vocabulary: "guardian", "legal guardian", "financial guardian" used interchangeably. | Distinct qualities in 6.4 and the glossary. |
| G-31 | Signature, seal, and evidentiary value of issued documents. | 7.6, RG-33; an advanced seal in V1, a qualified seal in V2 (DEC-30). |
| G-32 | ZSchool support's access to schools' data. | 8.1: temporary, ticket-based, audited access. |
| G-33 | Removing a school from the network (closure, loss of authorization) and what happens to student data. | 7.1 and RG-28: people keep access to their published documents; a closure procedure to be detailed in the PRD. |

### 13.3 Points from the initial description confirmed unchanged

- A global identity independent of the school, for all four profile types.
- Enrollment as a student ↔ school ↔ year relationship.
- Preserving history rather than deleting it.
- Multi-tenant isolation of operational data.
- The Identity → Relationship → Context → Data → Authorization chain.
- A multi-child, multi-school parent dashboard.
- A school-subscription SaaS model.
- The academic passport as a future evolution, subject to consent.

---

## 14. Decisions made

| ID | Decision |
|---|---|
| DEC-01 | Target: private schools in Morocco, from preschool through the baccalaureate, across every teaching system. The Moroccan national system is the default model. |
| DEC-02 | The isolation tenant is the school; the organization (a school group) is a consolidation level, not a data merge. |
| DEC-03 | A global identity for students, parents, teachers, and staff; an account may carry several profiles; a profile may exist with no account. |
| DEC-04 | The Massar code is the preferred matching key, unique across the platform, not mandatory. |
| DEC-05 | A single affiliation entity (SchoolMembership) with a role and a contract type; simultaneous affiliations authorized. |
| DEC-06 | The enrollment state machine from chapter 6.3; no enrollment that has been active is ever deleted. |
| DEC-07 | A data-ownership model: an author (the school) and a data subject (the student); the data subject's permanent access to their published documents; no automatic access between schools; a default transfer profile per RG-31. |
| DEC-08 | Disciplinary and health data not portable by default; health never transferred automatically. |
| DEC-09 | Published report cards immutable and versioned, with QR verification. |
| DEC-10 | An FR and AR (RTL) interface from MVP onward; names in dual script; bilingual documents. |
| DEC-11 | Primary contact identifier: a mobile phone number; email optional. |
| DEC-12 | Notification channels: in-app, SMS, and WhatsApp as priority; email secondary. |
| DEC-13 | The paying customer is the school; parents, students, and teachers pay nothing. Billing per active student and per school year, in MAD. |
| DEC-14 | No cross-rating between teachers and schools in V1. |
| DEC-15 | The MVP, V1, and V2 scope from chapter 12. |
| DEC-16 | ZSchool is the data processor for schools' data and the data controller for global identity and the academic passport; legal formalization before commercial launch. |
| DEC-17 | Detailed school roles (chapter 8) with fine-grained permissions and logging. |
| DEC-18 | Every academic data item is tied to an enrollment; no "floating" academic data on the identity. |

Decisions from resolving open questions (chapter 15):

| ID | Decision |
|---|---|
| DEC-19 | Positioning: a multi-school global identity, a reliable parent app, Fatourati collections, an FR/AR interface. Primary target: schools of 300 to 3,000 students along the Casablanca–Kénitra corridor, home to 70% of private schools. |
| DEC-20 | Adult students: the holder of their own account at 18; parental access kept by default, restrictable by the student for academic, disciplinary, and health data; financial access kept by the financial guardian (RG-02). |
| DEC-21 | A single active enrollment per student and per school year. Dual enrollment (tutoring centers, outside activities) is not modeled before V2. |
| DEC-22 | Default retention durations: enrollment registers, year-end decisions, report cards, transcripts, and certificates kept permanently by the school (archives and certificate reissuance); financial documents for 10 years (CGI Art. 211); attendance and discipline: end of schooling plus 2 years, then anonymization; health: end of schooling plus 1 year, then deletion; messages and notifications: 2 years; audit logs: 5 years; accounts with no active relationship anonymized after 3 years of inactivity. These durations appear in the CNDP filings and are adjustable by the school within legal limits. |
| DEC-23 | Cancelling a school: a full export of data and documents handed to the school; read-only access for 90 days; deletion of operational data 12 months after cancellation. People keep their global identity and access to their published documents. |
| DEC-24 | No blocking of official documents for unpaid fees (7.7). |
| DEC-25 | No rating or cross-recommendation between teachers and schools on the roadmap. Only verified affiliation periods are shared. |
| DEC-26 | Production and backup hosting in Morocco (chapter 9). No transfer of minors' data outside Morocco other than through messaging vendors, governed by an F118 authorization. |
| DEC-27 | Reference ambition: 20 schools and 15,000 students by the end of year 1 (pilots, then the Casablanca–Kénitra corridor), 300 schools and 200,000 students at three years. **Confirmed by the product owner on 9 September 2026.** |
| DEC-28 | A single plan at **MAD 5 per active student per month**, billed over 10 months (September to June), all modules included; only consumables (SMS, WhatsApp, storage) and services (onboarding, migration) are billed on top (chapter 11). **Confirmed by the product owner on 9 September 2026.** |
| DEC-29 | Higher education and vocational training out of scope. The level model stays generic so as not to preclude it. |
| DEC-30 | Documents: in V1, the school's advanced electronic seal, a timestamp, and a verification QR code; in V2, a qualified seal and timestamp through a DGSSI-accredited provider (Barid eSign, AfricTRUST, or DamaneSign) for the certificate of departure, certificates, and transcripts. The parent contract (Law 59.21) signed electronically at the advanced level. |
| DEC-31 | Online payment: Fatourati (Collect, then Aggregator) from V1 onward as the primary rail, with no funds held; a registered bank card in V2 via NAPS e-Premium or Chari Pay; direct debit left to each school's own bank. |
| DEC-32 | Transfer to a school outside ZSchool: a bilingual PDF exit file reachable via a time-limited secure link, with a verification QR code, from V1 onward. |
| DEC-33 | Teachers may declare experience at schools absent from ZSchool; it is shown as "unverified". |
| DEC-34 | Parent–teacher communication is on by default in moderated mode: the teacher or the school opens the thread, the parent replies; the school may allow parents to initiate; leadership may view threads, which is disclosed to users. |
| DEC-35 | Pilot school profiles: a primary school of roughly 300 students, a middle/high school of roughly 800 students, a multi-site group of over 2,000 students, and a bilingual school running on trimesters, along the Casablanca–Rabat corridor. **Confirmed by the product owner on 9 September 2026.** |
| DEC-36 | Notification channels: push first (Android 68%, iOS 32%), WhatsApp "utility" for parents who have opted in, SMS through a Moroccan aggregator as a fallback for households without a smartphone. WhatsApp pricing for Morocco changes on 1 October 2026 and will be reassessed (H-20). |

---

## 15. Open questions: resolution

Every question from version 1.0 has been answered. Three of them (ambition, pricing, pilots) are business decisions: a reference value is set and flagged "to be confirmed by the product owner".

| ID | Question | Resolution | Decision |
|---|---|---|---|
| Q-01 | Existing competition, pricing, limitations. | Roughly a dozen single-school Moroccan vendors, Massar with poorly rated parent apps, Pronote in French schools; public pricing from MAD 10 to 65 per student per year; no global-identity offer (3.3). | DEC-19 |
| Q-02 | Parents' access to an adult student. | No legal right to information about an adult; parents remain contract signatories and payers. Kept by default, restrictable at the student's discretion for academic, disciplinary, and health data, with financial access kept by the payer. | DEC-20 |
| Q-03 | Two simultaneous active enrollments. | Not in V1; a single active enrollment per year. | DEC-21 |
| Q-04 | Retention durations. | No legal duration specific to private schools; 10 years for accounting; the proportionality principle of Law 09.08. Default durations set per data type. | DEC-22 |
| Q-05 | Retention after cancellation. | A full export, 90 days read-only, deletion at 12 months, identities and published documents kept for people. | DEC-23 |
| Q-06 | Documents withholdable for unpaid fees. | No official document: the ministry's position, interim court orders with a daily penalty, the note of 28 May 2021, Law 59.21. Only non-mandatory services may be conditioned. | DEC-24 |
| Q-07 | Ratings within the teacher network. | No, at any version; verified periods only. | DEC-25 |
| Q-08 | Hosting. | Oracle Cloud Casablanca for production, a second Moroccan site for backup; no transfer formality. | DEC-26 |
| Q-09 | Three-year ambition. | 20 schools and 15,000 students in year 1; 300 schools and 200,000 students at three years. | DEC-27, confirmed |
| Q-10 | Pricing. | A single plan, MAD 5 per active student per month over 10 months, all modules included, consumables on top. | DEC-28, confirmed |
| Q-11 | Higher education and vocational training. | Out of scope, the model left generic. | DEC-29 |
| Q-12 | Electronic signature. | An advanced seal plus QR code in V1, a qualified seal through a DGSSI-accredited provider in V2; the parent contract at the advanced signature level. | DEC-30 |
| Q-13 | Pilot schools. | Four representative profiles along the Casablanca–Rabat corridor. | DEC-35, confirmed |
| Q-14 | The online-payment provider. | Fatourati in V1, a registered card in V2 (NAPS or Chari Pay), no funds held. | DEC-31 |
| Q-15 | Access for a school outside ZSchool. | Yes, a time-limited secure link to the exit file, from V1 onward. | DEC-32 |
| Q-16 | Non-ZSchool experience for teachers. | Yes, self-declared and marked unverified. | DEC-33 |
| Q-17 | Parent–teacher communication. | On by default in moderated mode, configurable by the school. | DEC-34 |

---

## 16. Hypotheses: verification results

Verification through desk research (official sites, press, vendors) carried out on 9 September 2026. Primary sources that could not be consulted are listed in 16.2.

### 16.1 Hypotheses from version 1.0

| ID | Hypothesis | Status | Finding |
|---|---|---|---|
| H-01 | The private sector's share and enrollment, the number of schools. | Confirmed | 1.27 million students, 15.3% (2025-2026, preschool included); 7,564 schools (2023-2024); 70% along the Casablanca–Kénitra corridor. Figures vary by source (with or without preschool): a figure specific to the three core cycles is still to be extracted from the ministry's statistical yearbook. |
| H-02 | Baccalaureate weightings. | Confirmed | 25% continuous assessment, 25% regional, 50% national. Added: 3AC 30/30/40 and 6AP 50/25/25. The order numbers were not found (H-16). |
| H-03 | The scope of Massar entries for private schools. | Confirmed in substance | Massar has covered every private school since 2013-2014; enrollments, classes, and continuous-assessment grades at every level; the ESISE census is validated against Massar. No text naming private schools specifically could be found (H-16). |
| H-04 | No Massar API, Excel import. | Confirmed | No API and no interoperability program; Excel import and export documented within the grade module. |
| H-05 | An overhaul of Law 09.08. | Not confirmed for now | No overhaul adopted. A revision drafted by the CNDP in 2026, not yet before Parliament. No obligation for a DPO, breach notification, or a digital age of consent under current law. |
| H-06 | An obligation to host minors' data in Morocco. | Not confirmed as an obligation | Law 05.20 targets only the public sector and critical infrastructure. The real constraint is Law 09.08: hosting abroad equals a transfer, subject to the adequacy list or a per-school F118 authorization. Hosting in Morocco removes this formality and meets a market expectation. |
| H-07 | VAT on tuition, transport, and catering. | Confirmed | Tuition with no VAT and no deduction; transport, catering, and leisure activities provided by the school to its own students are exempt (Art. 91-V-4°); taxable if provided by a third party. |
| H-08 | The e-invoicing timeline. | Partially confirmed | The legal basis is CGI Art. 145-IX and the DGI platform; the decree was unpublished as of mid-2026; large businesses during 2026, SMEs and micro-businesses in 2027-2028 per the DGI; the precise dates circulating among vendors are unofficial. |
| H-09 | Payment providers. | Confirmed and clarified | CMI became a simple switch as of May 2025; Fatourati already used by school groups and open to vendors (the 2026 Aggregator offer); NAPS and Chari Pay for registered cards; no Stripe; holding funds reserved to licensed payment institutions. |
| H-10 | The format of required statistics. | Partially confirmed | The channel is ESISE (the private-school census, the HR reference dataset, the May census, year-end results), validated against Massar. Form names could not be found; to be gathered from pilots. |
| H-11 | Parents' preference for WhatsApp, and acceptance of an app. | Confirmed by indicators | 98.6% of social-media users use WhatsApp; 91.7% of households own a smartphone; the DataSchool parent app reaches 10,000 installs with a 4.2 rating. To be confirmed through a survey of pilots. |
| H-12 | School leaders accepting a student's permanent access to their report cards. | Not verified | No source. To be tested in interviews with pilots; the ministry's position on unconditional document issuance points that way. |
| H-13 | The share of part-time teachers in the private sector. | Partially confirmed | Over 50% per parent associations (2023), with no official statistic. Law 06.00 requires at least 80% permanent staff, which points to a gap between the rule and practice. |

### 16.2 Points still to verify against primary texts

| ID | Point | Why |
|---|---|---|
| H-14 | The full text of Law 59.21 in the Official Gazette (March 2026): any article on document issuance and unpaid fees, the exact fine schedule, the mandatory content of the parent contract. | The contract module and the arrears policy. |
| H-15 | The CNDP adequacy list currently in force (Deliberation 236-2015 and updates). | Choosing messaging and backup vendors. |
| H-16 | The order numbers for the weightings (bac, 3AC, 6AP), memorandum 1887/13 on Massar, memorandum 43 of 2006 on continuous assessment. | Default configuration for average calculation. |
| H-17 | Whether the e-invoicing decree has been published since June 2026. | Planning the finance module. |
| H-18 | Services available and pricing in the Oracle Cloud Casablanca region (a managed database, Kubernetes, cross-site backups). | Technical architecture. |
| H-19 | Fatourati pricing and contract terms (creditor, Collect, Aggregator); Payzone's actual multi-school payout capacity. | The payment module. |
| H-20 | WhatsApp Business pricing for Morocco after 1 October 2026. | The cost of notifications. |
| H-21 | The exact numbering of Articles 180 to 186 of the Family Code (the non-custodial parent's oversight right); the DGI's written doctrine on tuition (out of scope or exempt). | Wording of legal mentions. |
| H-22 | A public SME/micro-business digitalization subsidy program and its applicability to schools. | A commercial argument. |

### 16.3 Main sources

- Enrollment and school counts: lebrief.ma, medias24.com, lematin.ma, aujourdhui.ma, fr.le360.ma (the 2024-2025 and 2025-2026 school years, the ministry's 2023-2024 report).
- Weightings and continuous assessment: moutamadris.ma, tawjihnet.net, orientation-chabab.com, wataiq.com, lebrief.ma (the 2025-2026 calendar).
- Massar and ESISE: lematin.ma (a 2014 Massar report), sise.men.gov.ma/esise, the 2013 Massar user manual, university pre-registration portals (um5.ac.ma, uca.ma) for the CNE replacement.
- Law 06.00 and Law 59.21: bibliotdroit.com (Arabic text), axl.cefan.ulaval.ca (French text), lematin.ma, lesinfos.ma, medias24.com (publication in the Official Gazette, March 2026).
- CNDP and Law 09.08: cndp.ma (formalities, transfers abroad, prior authorization), hespress.com (the 2026 revision), rmgsolutions.ma (a 2026 guide).
- DGSSI, Law 05.20, cloud: dgssi.gov.ma (decrees 2-21-406 and 2-24-921, the cloud reference framework, the trusted-provider list), docs.oracle.com (the Casablanca region), aws.amazon.com, azure.microsoft.com, ovhcloud.com, nplusone.africa, atlascloudservices.com.
- School documents and unpaid fees: bladi.net (the Salé order), medias24.com (September 2020), akhbarona.com and chtoukapress.com (the note of 28 May 2021), kifache.com, hespress.com.
- The Moudawana: qanon.ma, al3omk.com, madar21.com (the ministerial response of May 2023), fr.le360.ma, medias24.com (national ID and the custodial mother, November 2025), lesmre.com (the state of the 2026 reform).
- Taxation: fiscamaroc.com (CGI Art. 91 and 211), upsilon-consulting.com, sahlcompta.ma, daim-corporate.com, sage.com, and hisab.ma (e-invoicing).
- Electronic signature: dgssi.gov.ma (Law 43.20, accredited providers), medias24.com and leseco.ma (Barid eSign, a qualified timestamp in 2026).
- Payment: cmi.co.ma, fatourati.ma, naps.ma, baas.ma (Chari), youcanpay.com, bkam.ma (a fintech and mobile-payment guide), fnh.ma.
- Competition: nexsoft.ma, skoolly.ma, minassa.ma, schoolma.net, schoolapp.ma, e-schools.ma, dataschool.ma, smartschool.ma, tayssir.school, galactis.education, creaweb.ma, index-education.com, aplim.fr, Google Play and App Store listings.
- Digital usage: anrt.ma (the 2024-2025 ICT survey, the mobile observatory Q1 2026), datareportal.com (Digital 2026 Morocco), gs.statcounter.com.
- School groups: holged.com, edc.ma, gsr.ac.ma, mlfmonde.org, efmaroc.org, agenceecofin.com, challenge.ma.
- SMS and WhatsApp: bulksms.ma, envoisms.ma, inwi.ma, twilio.com, plivo.com, bulkgate.com, developers.facebook.com (WhatsApp pricing), fr.le360.ma (2019 ANRT and CNDP rules), wasel.ma.

---

## 17. Glossary

| French | Arabic | English | ZSchool definition |
|---|---|---|---|
| Établissement | مؤسسة تعليمية | School | Tenant; an entity authorized to teach. |
| Groupe scolaire | مجموعة مدارس | School group / Organization | A set of schools under common governance. |
| Élève | تلميذ(ة) | Student | A person enrolled in school; a global identity. |
| Responsable légal | الولي الشرعي | Legal guardian | The holder of guardianship (wilaya). |
| Titulaire de la garde | الحاضن(ة) | Custodial parent | The holder of custody (hadana). |
| Responsable financier | المسؤول عن الأداء | Financial guarantor / payer | The person liable for fees. |
| Enseignant | أستاذ(ة) | Teacher | A global identity; affiliated with one or several schools. |
| Vacataire | أستاذ متعاقد بالحصة | Hourly / part-time teacher | A teacher paid by the hour, often across several schools. |
| Surveillant général | الحارس العام | Head of student affairs / dean of discipline | In charge of student life. |
| Inscription | التسجيل | Enrollment | A student ↔ school ↔ year relationship. |
| Réinscription | إعادة التسجيل | Re-enrollment | Renewal for the following year. |
| Année scolaire | السنة الدراسية | Academic year | September to June/July. |
| Cycle | السلك | Cycle / stage | Preschool, primary, middle school, upper secondary. |
| Niveau | المستوى | Level / grade | 1AP … 2nd Bac. |
| Filière | الشعبة | Track / stream | A specialization in upper-secondary school. |
| Tronc commun | الجذع المشترك | Common core (first year of upper secondary) | The first year of upper-secondary school. |
| Classe | القسم | Class / homeroom | A group of students at one level. |
| Matière | المادة | Subject | A taught discipline. |
| Coefficient | المعامل | Weight | The weighting of a subject or an assessment. |
| Contrôle continu | المراقبة المستمرة | Continuous assessment | Regular internal assessments. |
| Semestre / Trimestre | الأسدس / الثلاثي | Semester / Trimester | An assessment period. |
| Bulletin | بيان النقط | Report card | A document of results per period. |
| Relevé de notes | كشف النقط | Transcript | A summary of grades (annual or cumulative). |
| Conseil de classe | مجلس القسم | Class council | An end-of-period deliberation. |
| Absence / Retard | غياب / تأخر | Absence / Tardiness | Attendance events. |
| Justificatif | مبرر الغياب | Excuse note | A document justifying an absence. |
| Certificat de scolarité | شهادة مدرسية | Enrollment certificate | Certifies enrollment. |
| Certificat de départ | شهادة المغادرة | Leaving / transfer certificate | An exit document for a transfer. |
| Attestation de réussite | شهادة النجاح | Certificate of achievement | Certifies promotion or a diploma. |
| Code Massar | رمز مسار | Massar code | A student's national identifier. |
| CNIE | البطاقة الوطنية للتعريف الإلكترونية | National ID card | An adult identifier. |
| Frais de scolarité | رسوم التمدرس | Tuition fees | Monthly or annual fees. |
| Frais d'inscription | رسوم التسجيل | Registration fees | Initial fees. |
| Remise fratrie | تخفيض الإخوة | Sibling discount | A reduction for siblings. |
| Reçu | وصل الأداء | Receipt | Proof of payment. |
| Impayé | متأخرات الأداء | Arrears / outstanding balance | An unsettled instalment. |
| Transport scolaire | النقل المدرسي | School transport | A bus service. |
| Cantine | المطعم المدرسي | Canteen | School catering. |
| Emploi du temps | استعمال الزمن | Timetable | A weekly grid of courses. |
| Cahier de textes | دفتر النصوص | Class journal / homework log | Session content and homework. |
| Passeport scolaire | جواز السفر المدرسي | Student academic passport | A consolidated record, subject to consent (V2). |

---

## 18. Next step: the PRD

The PRD will build on this document and must produce:

1. Verification of points H-14 through H-22 against primary texts (decisions DEC-27, DEC-28, and DEC-35 have been confirmed by the product owner).
2. Detailed user journeys per persona (the start of the year, the morning roll call, entering grades, publishing report cards, collecting payment, a transfer, re-enrollment).
3. Detailed functional requirements per MVP module, with acceptance criteria, carrying over the RG-xx rules.
4. The logical data model derived from chapter 6.10, with invariants and constraints.
5. The complete permission matrix.
6. Compliance requirements (Law 09.08, CNDP) translated into functionality and contractual documents.
7. Mockups of the main screens in FR and AR.
8. MVP success indicators (adoption by pilots, the daily roll-call rate, notification delay, the collections rate, the reduction in double entry).
9. Risks and their mitigation (Massar, hosting, teacher adoption, sales seasonality).

This document must not be modified during PRD drafting without updating its version and the decisions it affects.
