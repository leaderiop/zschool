> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-OVW                                                    |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Effective                                                       |
> | Author         | ZSchool Product                                                |
> | Classification | Product Overview                                                |
> | Change History | 1.0 (2026-09-09): Carried forward from `spec/appendices/00-project-baseline.md` §0–§5 (the historical `PROJECT.md`) during the qadi-style spec migration, Phase 8. §5 (actors/personas) is condensed here to an orientation list — full persona needs live in `urs.md`. No `RG-`/`DEC-`/`ARB-` citations appear in this content; the `H-`/`G-`/`Q-`/`C-` citations that do appear are historical-review markers, kept unrenumbered per convention (see `appendices/01-review-history.md`). |

# ZSchool — Overview

**A SaaS platform for managing private schools — Morocco edition.**

## 1. Executive summary

ZSchool is a multi-school SaaS platform for Moroccan private schools, from
preschool through the baccalaureate, across every teaching system (national,
French mission, bilingual, international).

Its founding idea: **a person's identity does not depend on the school**. A
student, a parent, a teacher each carry a global identity, a preserved
history, and relationships with one or several schools. Each school has an
isolated space where it manages its own operational data.

What this changes concretely in Morocco:

- A parent with three children in two different schools uses a single
  account and a single password.
- A student who changes schools does not start from scratch; their record
  follows them, under their legal guardians' control.
- A part-time teacher who works at two schools in the same year, then joins
  a third the following year, keeps a single profile.
- The school no longer has to re-enter the same people every year, and gets
  functionality aligned with Moroccan realities: grading out of 20,
  semesters or trimesters, the Massar code, bilingual Arabic/French
  documents, monthly fees over ten months, SMS and WhatsApp notifications,
  a Ramadan calendar.

The platform is sold to schools by subscription. Parents, students, and
teachers access it for free.

## 2. Moroccan context

### 2.1 The private education market

- The 2025-2026 school year: 8.27 million students, of whom 1.2-1.3 million
  are in private schools (~15%), preschool included. The ministry counted
  7,564 private schools in 2023-2024, of which 70% sit along the
  Casablanca–Kénitra corridor. Sector revenue was roughly MAD 20 billion
  (2019-2020 figure). See `spec/research/00-baseline-corrections.md` #9 for
  the corrected figures against the original baseline (H-01).
- Identifiable multi-site networks (Holged, EDC, La Résidence, OSUI, the
  French network as a whole) make up under 10% of private-sector enrollment.
  The long tail is over 7,000 single-site schools.
- The landscape is highly heterogeneous: from the small neighborhood school
  (100-300 students) to the large multi-site school group (2,000-6,000
  students), by way of French-mission schools (AEFE, OSUI) and British-,
  American-, or IB-curriculum schools.
- Most schools still run on Excel spreadsheets, paper registers, and
  disparate local software. Double data entry (an in-house tool plus
  Massar) is the norm.
- Fees are billed monthly, and collecting unpaid balances is a major
  concern for school leadership.
- Parents expect immediate communication (the day's absence, grades,
  summonses), mainly through WhatsApp and SMS.

### 2.2 Structure of the national education system

| Cycle | Duration | Levels (national nomenclature) | Common private-sector name | End-of-cycle certification |
|---|---|---|---|---|
| Preschool | 2-3 years | Small, middle, upper section | Kindergarten (PS, MS, GS) | — |
| Primary | 6 years | 1AP to 6AP | CP, CE1, CE2, CM1, CM2, 6ème | Primary studies certificate |
| Middle school | 3 years | 1AC, 2AC, 3AC | 5ème, 4ème, 3ème | Middle school certificate |
| Upper secondary | 3 years | Common core (TC), 1st Bac, 2nd Bac | Seconde, Première, Terminale | Baccalaureate |

Each certifying exam's final grade combines continuous assessment and
external exams under weightings set by the ministry. Grade repetition
exists at every level; promotion is decided by the class council based on
annual averages. The class is the basic unit of student life.

### 2.3 Coexistence of several teaching systems

The same school may offer several systems — Moroccan national, French
mission, bilingual/"enhanced national curriculum," or international
(British, American, IB) — each with its own nomenclature, assessment
convention, and particulars. **Product consequence**: the academic
structure (cycles, levels, tracks, assessment periods, grading scales,
weightings) is **configurable per school and per section**, from templates
provided by ZSchool. The Moroccan national system is the default model.

### 2.4 Calendar and school time

The school year runs early September to end of June (July for national
exams); fees are typically billed over ten months. The school week often
runs Monday through Saturday noon. Public holidays mix fixed-date national
holidays with movable religious holidays, announced only a few days ahead.
**Product consequence**: the `Africa/Casablanca` timezone handled natively
— see `spec/research/00-baseline-corrections.md` #1 for the permanent
UTC+0 correction to the original baseline — an annual school calendar with
editable movable holidays, timetable variants per period.

### 2.5 Assessment and grading

Grades out of 20 with decimals; a per-subject average, an overall average
weighted by coefficients, class rank, honors, remarks. The assessment
period is the semester (national system) or trimester (French curriculum).
The class council deliberates at the end of each period and at year end.

### 2.6 Massar and national identifiers

Massar is the ministry's information system, covering every public and
private school since 2013-2014. Every student receives a Massar code
(one letter + nine digits) at first enrollment, kept for their entire
schooling career. Massar exposes no vendor API — interoperability runs
through Excel import/export of the grade-entry module. **Product
consequence**: the Massar code is the preferred matching key for student
identity, without being mandatory (preschool, new arrivals, foreign
schools).

### 2.7 Regulatory framework

Governed principally by Law 59.21 (private education), Law 09.08 (personal
data protection, CNDP), Law 43.20 (electronic trust services), the Family
Code (Moudawana, guardianship/custody), the General Tax Code, and the DGI's
e-invoicing scheme. Full detail and 2026 corrections/confirmations are in
`spec/research/02-regulatory-data.md` and `spec/cross-cutting/07-legal-compliance-data-protection.md`.
**Product consequence**: ZSchool is the data processor for each school's
operational data (the school is the data controller) and the data
controller for global identity and the academic passport — a dual role
formalized through contracts, CNDP filings, and information notices.

### 2.8 Finance and payments

Fees are billed by registration, re-enrollment, tuition (monthly/termly/
annual), insurance, transport, canteen, activities, and supplies. Payment
methods include cash, cheque, bank transfer, direct debit, and card/online
payment via the Fatourati rail. ZSchool never holds funds — see
`spec/research/03-payments-communications.md` for the full payment-rail
research and `spec/behaviors/07-finance-billing-collections.md` for the
requirements this produces.

### 2.9 Languages and writing

Interface: French and Arabic at minimum, full RTL support; English
desirable for international sections. People's names in dual script
(Latin and Arabic). Official documents are often bilingual. See
`spec/cross-cutting/05-ux-ui-mobile-first-rtl.md`.

### 2.10 Digital usage

Mobile-first: the large majority of households own a smartphone and have
internet access (see `spec/research/05-infrastructure-usage.md` for the
corrected 2024-2025 ANRT figures against the original baseline, H-11).
WhatsApp is the de facto channel between schools and parents; SMS remains
the universal fallback; email is rarely checked by parents. The mobile
phone number is the primary contact identifier.

### 2.11 Operational realities of private schools

Multi-site school groups, part-time teachers working at several schools at
once, the head of student affairs and supervisors as central actors for
student life, the front office/cashier handling enrollments and
collections, school transport, document withholding for unpaid fees (a
common but regulated — and, per Law 59.21, penalized — practice), and a
start-of-year workload peak.

## 3. Vision and value proposition

### 3.1 Vision

Build the digital infrastructure for the school journey in Morocco: a
persistent identity for every student, parent, and teacher, a history
preserved across schools, access controlled by context.

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

Competitive landscape detail (a dozen active Moroccan vendors, Massar's own
weak parent apps, adapted ERPs, Pronote/EcoleDirecte for French-curriculum
schools): `spec/research/01-market-competition.md`. No player currently
offers a multi-school global identity, a single cross-school parent
account, or a portable teacher profile.

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

Five levels: **Identity** (the person, unique and persistent), **Relationship**
(the link between one identity and another entity), **Context** (the school
environment in which a relationship produces data), **Data** (the
information generated within that context), and **Authorization** (the
rules determining who accesses and shares what). The same person may carry
several profiles (a teacher is also a parent; a parent is also a staff
member) — the account is single, profiles are multiple. Full detail:
`spec/domain-model.md`.

## 5. Actors and personas

| Actor | Type | Description |
|---|---|---|
| Student | Global identity | A person enrolled in school. A minor in the vast majority of cases. |
| Parent / guardian | Global identity | Father, mother, legal guardian, custodial parent, financial guardian, authorized contact. |
| Teacher | Global identity | A person teaching one or several subjects at one or several schools, permanent or part-time. |
| Staff | Global identity | Leadership, front office, accounting, head of student affairs, supervisors, school nurse, transport, library, IT. |
| School | Tenant | An entity authorized to provide education, with its cycles, sites, and data. |
| School group (organization) | Parent tenant | Groups several schools or sites under common governance. |
| ZSchool (operator) | Platform | The ZSchool team: provisioning, support, SaaS billing, monitoring, compliance. |

The eight named personas (Si Abdellah, Fatima, Rachid, Khadija, Ahmed,
Naïma, Youssef, Salma) that anchor every journey in `spec/journeys/` are
introduced in full, with their needs (`URS-ZS-NNN`), in `spec/urs.md`.

---

_Related: `domain-model.md` · `urs.md` · `spec/appendices/00-project-baseline.md` (the full historical baseline this file condenses) · `spec/traceability.md`_
