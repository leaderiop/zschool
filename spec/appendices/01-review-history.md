# ZSchool Review History (non-normative)

> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-APP-01                                                 |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Reference — non-normative                                     |
> | Author         | ZSchool Product                                                |
> | Classification | Appendix — Review History                                      |
> | Change History | 1.0 (2026-09-09): Assembled from `PROJECT.md` §13/§15/§16, `prd/cross-cutting/42-review-arbitrations.md` §2, and `PRD-REVIEW-2026-09-09.md` during the qadi-style spec migration (CCR-ZS-003). |

## Purpose

This is the deliberation trail behind ZSchool's specification: every
contradiction, gray area, hypothesis, and open question the two review passes
(the baseline review that produced `PROJECT.md`, and the PRD-level review that
produced `prd/cross-cutting/42-review-arbitrations.md`) actually worked
through — kept exactly as raised, with their original `H-`/`G-`/`C-`/`Q-`
identifiers unchanged. Per the migration plan (`spec/process/id-migration-map.md`
§0): "describing something is not the same as it being normative." These
identifiers are closed, historical deliberation records, not live
requirements — they are never remapped, never cited as evidence of current
behavior, and this file is never a target for `verify-traceability.sh`'s
requirement-coverage checks. Where a G-/C-/Q- resolution already names the
`RG-`/`DEC-`/`ARB-`/`ESC-` decision it produced, that citation is kept as
originally written (for historical fidelity) — use the crosswalk immediately
below to jump to that decision's actual normative successor.

## Crosswalk: old baseline IDs → normative successors

Rather than annotate all ~100 individual citations scattered across the
tables below, this single table is the map: every `RG-` business rule now
lives as an `INV-ZS-NNN` invariant in [`../invariants.md`](../invariants.md);
every `DEC-`, `ARB-`, and `ESC-` decision now lives as an `ADR-ZS-NNN` record
in [`../decisions/`](../decisions/).

### RG- → INV-ZS-

| Old ID | New ID | Old ID | New ID |
|---|---|---|---|
| `RG-01` | `INV-ZS-051` | `RG-02` | `INV-ZS-052` |
| `RG-03` | `INV-ZS-053` | `RG-04` | `INV-ZS-054` |
| `RG-05` | `INV-ZS-055` | `RG-06` | `INV-ZS-056` |
| `RG-07` | `INV-ZS-057` | `RG-08` | `INV-ZS-058` |
| `RG-09` | `INV-ZS-059` | `RG-10` | `INV-ZS-060` |
| `RG-11` | `INV-ZS-061` | `RG-12` | `INV-ZS-062` |
| `RG-12b` | `INV-ZS-063` | `RG-13` | `INV-ZS-064` |
| `RG-14` | `INV-ZS-065` | `RG-14b` | `INV-ZS-066` |
| `RG-15` | `INV-ZS-067` | `RG-16` | `INV-ZS-068` |
| `RG-17` | `INV-ZS-069` | `RG-18` | `INV-ZS-070` |
| `RG-19` | `INV-ZS-071` | `RG-20` | `INV-ZS-072` |
| `RG-21` | `INV-ZS-073` | `RG-22` | `INV-ZS-074` |
| `RG-23` | `INV-ZS-075` | `RG-24` | `INV-ZS-076` |
| `RG-25` | `INV-ZS-077` | `RG-26` | `INV-ZS-078` |
| `RG-27` | `INV-ZS-079` | `RG-28` | `INV-ZS-080` |
| `RG-29` | `INV-ZS-081` | `RG-30` | `INV-ZS-082` |
| `RG-31` | `INV-ZS-083` | `RG-32` | `INV-ZS-084` |
| `RG-33` | `INV-ZS-085` | `RG-34` | `INV-ZS-086` |
| `RG-35` | `INV-ZS-087` | `RG-36` | `INV-ZS-088` |
| `RG-37` | `INV-ZS-089` | `RG-38` | `INV-ZS-090` |
| `RG-39` | `INV-ZS-091` | | |

### DEC- → ADR-ZS-

| Old ID | New ID | Old ID | New ID |
|---|---|---|---|
| `DEC-01` | `ADR-ZS-012` | `DEC-02` | `ADR-ZS-013` |
| `DEC-03` | `ADR-ZS-014` | `DEC-04` | `ADR-ZS-015` |
| `DEC-05` | `ADR-ZS-016` | `DEC-06` | `ADR-ZS-017` |
| `DEC-07` | `ADR-ZS-018` | `DEC-08` | `ADR-ZS-019` |
| `DEC-09` | `ADR-ZS-020` | `DEC-10` | `ADR-ZS-021` |
| `DEC-11` | `ADR-ZS-022` | `DEC-12` | `ADR-ZS-023` |
| `DEC-13` | `ADR-ZS-024` | `DEC-14` | `ADR-ZS-025` |
| `DEC-15` | `ADR-ZS-026` | `DEC-16` | `ADR-ZS-027` |
| `DEC-17` | `ADR-ZS-028` | `DEC-18` | `ADR-ZS-029` |
| `DEC-19` | `ADR-ZS-030` | `DEC-20` | `ADR-ZS-001` |
| `DEC-21` | `ADR-ZS-002` | `DEC-22` | `ADR-ZS-003` |
| `DEC-23` | `ADR-ZS-004` | `DEC-24` | `ADR-ZS-005` |
| `DEC-25` | `ADR-ZS-006` | `DEC-26` | `ADR-ZS-007` |
| `DEC-27` | `ADR-ZS-008` | `DEC-28` | `ADR-ZS-009` |
| `DEC-29` | `ADR-ZS-010` | `DEC-30` | `ADR-ZS-011` |
| `DEC-31` | `ADR-ZS-031` | `DEC-32` | `ADR-ZS-032` |
| `DEC-33` | `ADR-ZS-033` | `DEC-34` | `ADR-ZS-034` |
| `DEC-35` | `ADR-ZS-035` | `DEC-36` | `ADR-ZS-036` |

### ARB- and ESC- → ADR-ZS-

| Old ID | New ID | Old ID | New ID |
|---|---|---|---|
| `ARB-01` | `ADR-ZS-041` | `ARB-02` | `ADR-ZS-043` |
| `ARB-03` | `ADR-ZS-044` | `ARB-04` | `ADR-ZS-045` |
| `ARB-05` | `ADR-ZS-046` | `ARB-06` | `ADR-ZS-047` |
| `ARB-07` | `ADR-ZS-048` | `ARB-08` | `ADR-ZS-049` |
| `ARB-09` | `ADR-ZS-050` | `ARB-10` | `ADR-ZS-051` |
| `ARB-11` | `ADR-ZS-052` | `ARB-12` | `ADR-ZS-053` |
| `ARB-13` | `ADR-ZS-054` | `ARB-14` | `ADR-ZS-055` |
| `ARB-15` | `ADR-ZS-056` | `ARB-16` | `ADR-ZS-057` |
| `ARB-17` | `ADR-ZS-058` | `ARB-18` | `ADR-ZS-059` |
| `ARB-19` | `ADR-ZS-060` | `ARB-20` | `ADR-ZS-061` |
| `ARB-21` | `ADR-ZS-062` | `ARB-22` | `ADR-ZS-063` |
| `ARB-23` | `ADR-ZS-064` | `ARB-24` | `ADR-ZS-065` |
| `ARB-25` | `ADR-ZS-066` | `ARB-26` | `ADR-ZS-042` |
| `ESC-01` | `ADR-ZS-072` | `ESC-02` | `ADR-ZS-073` |
| `ESC-03` | `ADR-ZS-071` | | |

`(NOTE, unallocated)` — note that `ADR-ZS-037..040`, `067..070` are reserved
block headroom from `decisions/`' own numbering (block size rounds up to the
nearest 10 per source file) and are not omissions here.

---

## 1. Baseline critical review (`PROJECT.md` §13, §15, §16)

The original description ZSchool started from was reviewed against the
Moroccan context; every contradiction and gap it produced is below,
verbatim, with its resolution as originally written.

### 1.1 Contradictions found (C-01 … C-11)

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

### 1.2 Gray areas and gaps (G-01 … G-33)

| ID | Gap | Resolution in `PROJECT.md` |
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

### 1.3 Points from the initial description confirmed unchanged

- A global identity independent of the school, for all four profile types.
- Enrollment as a student ↔ school ↔ year relationship.
- Preserving history rather than deleting it.
- Multi-tenant isolation of operational data.
- The Identity → Relationship → Context → Data → Authorization chain.
- A multi-child, multi-school parent dashboard.
- A school-subscription SaaS model.
- The academic passport as a future evolution, subject to consent.

### 1.4 Open questions: resolution (Q-01 … Q-17)

Every question from version 1.0 of the baseline was answered. Three of them
(ambition, pricing, pilots) are business decisions: a reference value was set
and flagged "to be confirmed by the product owner" — all three were
subsequently confirmed (`DEC-27`, `DEC-28`, `DEC-35`).

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

### 1.5 Hypotheses: verification results (H-01 … H-22)

Verification through desk research (official sites, press, vendors) carried
out on 2026-09-09.

**1.5.1 Hypotheses from version 1.0 of the baseline**

| ID | Hypothesis | Status | Finding |
|---|---|---|---|
| H-01 | The private sector's share and enrollment, the number of schools. | Confirmed | 1.27 million students, 15.3% (2025-2026, preschool included); 7,564 schools (2023-2024); 70% along the Casablanca–Kénitra corridor. Figures vary by source (with or without preschool). |
| H-02 | Baccalaureate weightings. | Confirmed | 25% continuous assessment, 25% regional, 50% national. Added: 3AC 30/30/40 and 6AP 50/25/25. The order numbers were not found (H-16). |
| H-03 | The scope of Massar entries for private schools. | Confirmed in substance | Massar has covered every private school since 2013-2014; enrollments, classes, and continuous-assessment grades at every level; the ESISE census is validated against Massar. No text naming private schools specifically could be found (H-16). |
| H-04 | No Massar API, Excel import. | Confirmed | No API and no interoperability program; Excel import and export documented within the grade module. |
| H-05 | An overhaul of Law 09.08. | Not confirmed for now | No overhaul adopted. A revision drafted by the CNDP in 2026, not yet before Parliament. No obligation for a DPO, breach notification, or a digital age of consent under current law. |
| H-06 | An obligation to host minors' data in Morocco. | Not confirmed as an obligation | Law 05.20 targets only the public sector and critical infrastructure. The real constraint is Law 09.08: hosting abroad equals a transfer. Hosting in Morocco removes this formality and meets a market expectation. |
| H-07 | VAT on tuition, transport, and catering. | Confirmed | Tuition with no VAT and no deduction; transport, catering, and leisure activities provided by the school to its own students are exempt (Art. 91-V-4°); taxable if provided by a third party. |
| H-08 | The e-invoicing timeline. | Partially confirmed | The legal basis is CGI Art. 145-IX and the DGI platform; the decree was unpublished as of mid-2026; large businesses during 2026, SMEs and micro-businesses in 2027-2028 per the DGI. |
| H-09 | Payment providers. | Confirmed and clarified | CMI became a simple switch as of May 2025; Fatourati already used by school groups and open to vendors (the 2026 Aggregator offer); NAPS and Chari Pay for registered cards; no Stripe. |
| H-10 | The format of required statistics. | Partially confirmed | The channel is ESISE (the private-school census, the HR reference dataset, the May census, year-end results), validated against Massar. Form names could not be found; to be gathered from pilots. |
| H-11 | Parents' preference for WhatsApp, and acceptance of an app. | Confirmed by indicators | 98.6% of social-media users use WhatsApp; 91.7% of households own a smartphone; the DataSchool parent app reaches 10,000 installs with a 4.2 rating. |
| H-12 | School leaders accepting a student's permanent access to their report cards. | Not verified | No source. To be tested in interviews with pilots. |
| H-13 | The share of part-time teachers in the private sector. | Partially confirmed | Over 50% per parent associations (2023), with no official statistic. Law 06.00 requires at least 80% permanent staff, which points to a gap between the rule and practice. |

**1.5.2 Points still to verify against primary texts**

| ID | Point | Why |
|---|---|---|
| H-14 | The full text of Law 59.21 in the Official Gazette (March 2026). | The contract module and the arrears policy. |
| H-15 | The CNDP adequacy list currently in force. | Choosing messaging and backup vendors. |
| H-16 | The order numbers for the weightings and Massar circulars. | Default configuration for average calculation. |
| H-17 | Whether the e-invoicing decree has been published since June 2026. | Planning the finance module. |
| H-18 | Services available and pricing in the Oracle Cloud Casablanca region. | Technical architecture. |
| H-19 | Fatourati pricing and contract terms. | The payment module. |
| H-20 | WhatsApp Business pricing for Morocco after 1 October 2026. | The cost of notifications. |
| H-21 | The exact numbering of the Family Code articles on the non-custodial parent's oversight right. | Wording of legal mentions. |
| H-22 | A public SME/micro-business digitalization subsidy program. | A commercial argument. |

**1.5.3 Main sources** — see `PROJECT.md` §16.3, `spec/appendices/00-project-baseline.md`, for the full source list (press outlets, official sites, vendor pages); reproduced there verbatim rather than duplicated here.

---

## 2. D1–D10: informal review arbitrations (from the original `prd/README.md`)

These ten shorthand arbitrations predate the formal `ARB-NN` table and were
absorbed into it during the PRD-level review — no new IDs are minted for
them; each is folded as a "historical alias" note into the ADR that
supersedes it.

| ID | Subject | Decision | Absorbed into |
|---|---|---|---|
| D1 | MVP channels | In-app + SMS + WhatsApp utility limited to attendance notifications; V1 = full rollout, including push. | `ARB-21` (→ `ADR-ZS-062`), `ARB-25c` (→ `ADR-ZS-066`) |
| D2 | Unpaid-fee debt on transfer | Kept at the originating school. | `ARB-20` (→ `ADR-ZS-061`) |
| D3 | Compliance check against the reference curriculum | Blocking in V1; a warning at MVP. | Noted in `1.6` of `42-review-arbitrations.md` (clarification, no dedicated ADR) |
| D4 | Logging | Minimal history at MVP, an immutable and exportable audit log in V1. | `ARB-25j` (→ `ADR-ZS-066`) |
| D5 | Continuity | 8-hour RTO / 15-minute RPO (site disaster). | `ARB-25i` (→ `ADR-ZS-066`) |
| D6 | Directory | Minimal at MVP (name, city, cycles). | `ARB-01` (→ `ADR-ZS-041`) |
| D7 | Bilingualism | Mandatory for institutional content. | `ARB-21c` (→ `ADR-ZS-062`) |
| D8 | AREF cap | Exceeding it is non-blocking. | `ARB-23a` (→ `ADR-ZS-064`) |
| D9 | Landing screens | Carried by the UX screens. | Noted in cross-cutting UX chapter (no dedicated ADR) |
| D10 | KPI sequencing | KPI-06 measured starting at pilot activation + 3 months; commercial KPIs starting at commercial launch. | Corrected in the metrics chapter |

---

## 3. PRD-level critical review (`PRD-REVIEW-2026-09-09.md`)

This is the second review pass, run against the drafted PRD (`prd/` v1.0, 43
files, ~20,000 lines) rather than against the initial description. Its
findings were resolved same-day into the `ARB-01..26` / `ESC-01..03`
arbitration table (§1 of `prd/cross-cutting/42-review-arbitrations.md`,
crosswalked above) and the question register.

### 3.1 Verdict

The PRD was complete, well-traced, and honest about its uncertainties. It
had, however, a **structural flaw**: the MVP/V1 split was incompatible with
the pilot scenario it set for itself. Pilots were to come on board mid-year
(01/02/2027) and stay on MVP until summer 2028, yet the PRD asked them, in
June 2027, for a *rollover*, Massar exports, and a re-enrollment campaign
whose carrying requirements were all tagged V1 — a pilot could not get
through the 2026-2027 school year on the MVP scope as originally written.

Three other families of problems stood out: gaps in the data model (state
machine, phone-based identity, a global health record, a teacher-
confidentiality leak), business calculation rules left open at MVP, and a
traceability apparatus (the open-questions register, the README, KPIs,
sources) that announced a consolidation it did not actually deliver.

Finding count at the time: **19 blocking, ~95 major, ~80 minor**.

### 3.2 Blocking findings

**3.2.1 The MVP did not cover the pilots' school year**

| # | Finding | Resolved by |
|---|---|---|
| B-01 | The rollover was required in June 2027 as MVP, yet every requirement behind it (year-end decisions, structure cloning, bulk placement, the re-enrollment campaign) was V1. | `ARB-01` |
| B-02 | Massar exports were "delivered to pilots" in June 2027, yet most `FR-MAS-*` requirements were V1. | `ARB-01` |
| B-03 | Mid-year onboarding (February 2027) had no reprise plan: the MVP import carried over neither settled instalments nor cheques nor attendance history. | `ARB-02` |
| B-04 | The Excel import created ACTIVE enrollments without going through the PRE-ENROLLED→ACTIVE conditions. | `ARB-02` |
| B-05 | Cheques: the lifecycle (post-dated, deposited, bounced) was V1, while cheques were the dominant MVP payment method per the baseline. | `ARB-01` |
| B-06 | The Law 59.21 parent contract had three different version tags across three files. | `ARB-01` |
| B-07 | MVP receipts needed "a continuous, tamper-proof sequence" from a requirement that was itself V1. | `ARB-01` |
| B-08 | The MVP exit file was made up of pieces that were themselves V1 (the transcript, the year-end decision, the account statement). | `ARB-01` |
| B-09 | The "multi-site group" pilot existed while `Organization`, group subscriptions, and consolidated views were V1. | `ARB-01` |
| B-10 | Per-course attendance-taking assumed a timetable that was itself V1. | `ARB-04`, `ARB-05` |

**3.2.2 Compliance and security tagged V1 while the MVP handled real minors' data**

| # | Finding | Resolved by |
|---|---|---|
| B-11 | WhatsApp utility shipped at MVP, yet the sub-processor registry and the F118 template were V1. | `ARB-25c` |
| B-12 | Adult national-ID collection started at MVP, yet its prior CNDP authorization (2 to 4 months) was in V1. | `ARB-25a` |
| B-13 | The account identifier was a unique, mandatory mobile number, yet a 13-year-old persona explicitly had no number of his own. | `ARB-07` |
| B-14 | Password reset only worked "via the primary phone," with no journey for a lost, changed, or disconnected number. | `ARB-08` |
| B-15 | MVP backups sat on the same site as production, with the second site pushed to V1. | `ARB-25h` |

**3.2.3 Gaps in the data model**

| # | Finding | Resolved by |
|---|---|---|
| B-16 | `HealthRecord` was a single global entity, contradicting the "never transferred" and "tied to an enrollment" rules. | `ARB-13` |
| B-17 | A cross-school hour total leaked one school's affiliation information to another, without teacher consent. | `ARB-23` |
| B-18 | A transfer approved but never activated left the student with no ACTIVE enrollment anywhere and no reverse transition. | `ARB-22` |
| B-19 | A transfer "at the start of next year" closed the year as TRANSFERRED instead of COMPLETED, losing the year-end decision. | `ARB-22`, `ARB-03` |

### 3.3 Major findings (selection, by theme)

The full major-findings list (~95 items) is reproduced in
`spec/appendices/00-project-baseline.md`'s companion source,
`PRD-REVIEW-2026-09-09.md` (the original review document); it is not
duplicated in full here to avoid two divergent copies of the same historical
record. The themes, each resolved by one or more `ARB-NN`:

- **State machine and enrollments** (SUSPENDED with no way out, double N+1 enrollment, guardian matching, court-ordered restriction scope, transfer initiator ambiguity) — resolved by `ARB-03`, `ARB-09`, `ARB-11`, `ARB-22`.
- **Student life and assessments** (per-course notification with no aggregation, front-desk justification, teacher-absence handling, assessment markers, mid-period class changes) — resolved by `ARB-15`, `ARB-16`, `ARB-17`, `ARB-05`.
- **Finance and documents** (family payment, receipt cancellation, mid-year proration, third-party payers, sibling discounts, the exit-file/account-statement conflict) — resolved by `ARB-20`.
- **Communication** (moderated threads, push at MVP, bilingual SMS, opt-out scope, send-time windows, WABA numbering) — resolved by `ARB-21`.
- **Security, compliance, operations** (push provider sub-processors, MVP logging, MVP support access, MFA, data-subject rights, backup retention conflicts) — resolved by `ARB-25`.
- **Roadmap, KPIs, risks, traceability, sources** (the open-questions register undercounting by an order of magnitude, the DEC-27 horizon shift, missing risks, source contradictions between the baseline and `research/`, the broken single-scenario-set) — resolved by `ARB-06`, `ARB-18`, `ARB-26`, and escalated as `ESC-01`/`ESC-02`/`ESC-03` where no arbitration was possible without the product owner.

### 3.4 Minor findings (selection)

A representative sample — late-arrival version-tag mismatches, the
active-student count for mid-year imports, the missing AEFE calendar for
mission-française sections, the QR-code verification page's partial name
masking, terminology drift ("school attendance certificate" vs. "certificate
of enrollment") — all resolved by `ARB-09` through `ARB-26` collectively; see
`prd/cross-cutting/42-review-arbitrations.md` §1.6 for the specific
clarifications that required no new arbitration.

### 3.5 Recommended actions (as originally given, in order)

1. Rebuild the MVP scope from the pilots' calendar.
2. Define the mid-year reprise.
3. Fix the state-machine model (exits from SUSPENDED, re-entry, health-record scoping).
4. Settle phone-based identity.
5. Milestone compliance before pilot activation.
6. Fix the MVP calculation rules.
7. Reconcile contradictory versions into one product-owner-signed arbitration table.
8. Re-sync the traceability apparatus.
9. Get the product owner to confirm the DEC-27 horizon shift.

### 3.6 Status after resolution (same day, 2026-09-09)

Every blocking finding was addressed same-day. The single arbitration table
became `prd/cross-cutting/42-review-arbitrations.md` (`ARB-01` to `ARB-26`);
the question register was rebuilt (256 questions: 71 resolved, 41 escalated,
144 open by nature). Three questions remained for the product owner —
`ESC-01` (the DEC-27 horizon), `ESC-02` (the MVP scope extension's cost),
`ESC-03` (the corresponding baseline v1.2 update) — now tracked as
`ADR-ZS-072`, `ADR-ZS-073`, `ADR-ZS-071` respectively, each with
`Status: Escalated — pending product owner sign-off`.
