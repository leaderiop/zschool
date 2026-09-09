# ZSchool Risks

> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-RSK                                                    |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Planning                                                       |
> | Change History | 1.0 (2026-09-09): Migrated from `prd/cross-cutting/39-risks-mitigations.md` (v0.3, English translation); `R-NN` renamed `RSK-ZS-NNN`; review arbitrations ADR-ZS-047, ADR-ZS-048, ADR-ZS-049, ADR-ZS-062, ADR-ZS-066, ADR-ZS-042, and the escalated founder decisions ADR-ZS-071/072/073, carried over as-is (CCR-ZS pending) |

---

## 1. Purpose, method, and scope

This chapter answers point 9 of the baseline's chapter 18: "risks and their mitigation (Massar, hosting, teacher adoption, sales seasonality)." It is ZSchool's **risk register**: twenty-eight rated risks `RSK-ZS-NNN` (RSK-ZS-001 to RSK-ZS-002 from the initial draft, RSK-ZS-003 to RSK-ZS-004 added by the 09/09/2026 review, ADR-ZS-042 (§26h)), each with a preventive mitigation, a fallback plan, an owner, and a warning indicator tied to the indicator register (`prd/cross-cutting/38-kpi-success-metrics.md`).

Construction rules, per conventions (`prd/00-conventions.md`):

- **Exclusive namespace**: `RSK-ZS-NNN` risk identifiers are carried by this file, counter starting at 01 (conventions §2). No other file creates an `RSK-ZS-NNN`.
- **Minimum coverage**: the baseline names four structuring risks (Massar, hosting, teacher adoption, sales seasonality); the register covers them and adds the regulatory, financial, competitive, data-protection, security, single-vendor-dependency, import-data-quality, and school-closure (G-33) risks uncovered by desk research.
- **Sources**: every claim external to the baseline (market figures, regulatory dates, pricing, infrastructure status) comes from the `prd/research/` files (`01-market-competition.md` to `05-infrastructure-usage.md`) or from `prd/research/00-baseline-corrections.md` and is cited in support; no price, legal text, or date is invented. Where research corrects the baseline, the divergence is recorded in this file's "Open Questions" section.
- **Versions**: the "Version affected" column shows the first version exposed and the exposure range, strictly aligned with the baseline's scope by version (§12): MVP, V1, V2+. Founder arbitration (historical alias D1; ADR-ZS-062, ADR-ZS-066 §25c): WhatsApp "utility" messaging is active at MVP for attendance notifications only, with its broader rollout to communication in V1 (RSK-ZS-005, RSK-ZS-006).
- **Indicators**: each warning indicator is described by its measure and its initial alert threshold and points to the `KPI-ZS-NNN` identifier that carries it in `prd/cross-cutting/38-kpi-success-metrics.md` (formula, frequency, dashboard); indicators with no owner in version 0.1 are now carried by KPI-ZS-037 to KPI-ZS-012 (ADR-ZS-042 (§26h)). This chapter duplicates none of them.

The register covers risks to the **ZSchool product and project** (the operator). Business risks specific to each client school (family arrears, part-time teachers, AREF oversight) are not ZSchool risks: they are treated as needs the product helps manage (reminders, AREF quota tracking, contracts) and appear in the module chapters (`prd/modules/10` to `prd/modules/23`).

## 2. Rating scales and exposure matrix

### 2.1 Scales

**Probability** (over the horizon of the coming school year, or of the affected version's horizon when later):

| Level | Meaning |
|---|---|
| Low | An unusual event with no current sign; rarely occurs in the sector. |
| Medium | A plausible event: announced signs, sector precedents, or dependence on an outside decision outside our control. |
| High | An expected event: announced and dated, observed on the market, or near-structural to ZSchool's model. |

**Impact** (effect on the product, clients, or the business if the risk materializes with no mitigation):

| Level | Meaning |
|---|---|
| Low | A disruption absorbed by normal operations; no challenge to the product promise. |
| Medium | A measurable loss of value (adoption, revenue, cost, reputation); a fix is needed but scope stays intact. |
| High | A hit to the founding promise (global identity, parent-app reliability, the end of double data entry), to compliance, to cash flow, or to service continuity. |

**Exposure**: the intersection of the two scales per the matrix below. Rated **assuming the preventive mitigations are decided but not yet operational**; the mitigations' effect is read through the associated warning indicator.

| Probability \ Impact | Low | Medium | High |
|---|---|---|---|
| **Low** | Low | Low | Medium |
| **Medium** | Low | Medium | High |
| **High** | Medium | High | Critical |

## 3. Risk register

A summary view, followed by a detailed fact sheet per risk.

| ID | Risk | Category | Probability | Impact | Exposure | Version affected |
|---|---|---|---|---|---|---|
| RSK-ZS-001 | Teacher adoption: mobile roll call and grade entry | Adoption | High | High | Critical | MVP; V1 |
| RSK-ZS-007 | Student access to report cards: school-leadership reluctance (H-12) | Market | Medium | High | High | MVP; V1 |
| RSK-ZS-008 | Massar: unstable formats, fragile re-upload, no API (H-04) | Technical | High | High | Critical | MVP; V1 |
| RSK-ZS-009 | Sales seasonality: a sales cycle locked to the school-year start | Market | High | Medium | High | MVP; V1 |
| RSK-ZS-010 | Load peaks at the school-year start and at period closings | Technical | Medium | High | High | All versions |
| RSK-ZS-011 | Hosting: an OCI region with a single availability domain, catalogue to be verified (H-18), DR plan to be proven | Technical | Medium | High | High | All versions |
| RSK-ZS-012 | Law 59.21: 35 implementing decrees expected, a shifting framework | Regulatory | High | Medium | High | MVP; V1 |
| RSK-ZS-013 | Family Code: an unadopted reform, an evolving guardianship regime | Regulatory | Medium | Medium | Medium | MVP; V1 |
| RSK-ZS-014 | E-invoicing: a pending decree, an uncertain timeline | Regulatory | Medium | Medium | Medium | V1; V2+ |
| RSK-ZS-005 | WhatsApp: the 01/10/2026 pricing switch and the standalone rate card (H-20) | Financial | High | Medium | High | MVP (attendance); V1 |
| RSK-ZS-015 | Fatourati: pricing and contract undetermined (H-19), primary rail at V1 | Financial | Medium | High | High | V1 |
| RSK-ZS-016 | Card payment (V2): per-school acquirer contracts, restructured acquiring | Market | Medium | Medium | Medium | V2+ |
| RSK-ZS-017 | Competition: multi-school offerings and price pressure | Market | High | Medium | High | MVP; V1 |
| RSK-ZS-018 | Competition: entrenched ecosystems (Pronote, Nexsoft) and resistance to change | Market | Medium | Medium | Medium | V1 |
| RSK-ZS-019 | Data protection: CNDP, the F112 authorization (national ID, health), minors | Regulatory | Medium | High | High | MVP; V1 |
| RSK-ZS-020 | Security: Massar code enumeration, OTP accounts, impersonation | Technical | Medium | High | High | All versions |
| RSK-ZS-006 | Dependence on single vendors (SMS, WhatsApp, e-signature, hosting) | Operational | Medium | Medium | Medium | MVP (attendance); V1 |
| RSK-ZS-021 | Import data quality: duplicate identities | Operational | High | Medium | High | MVP |
| RSK-ZS-022 | A client school canceling or closing (G-33) | Operational | Medium | Medium | Medium | MVP; V1 |
| RSK-ZS-002 | Parent adoption: the digital divide, WhatsApp opt-in | Adoption | Medium | Medium | Medium | MVP |
| RSK-ZS-003 | MVP schedule slip and team capacity (a four-month wave 1) | Operational | High | High | Critical | MVP |
| RSK-ZS-023 | A pilot dropping out mid-year | Market | Medium | High | High | MVP |
| RSK-ZS-024 | Identity by mobile number: number reassignment, shared households, foreign numbers | Technical | High | High | Critical | All versions |
| RSK-ZS-025 | Arabic typography and RTL rendering of PDF documents | Technical | Medium | Medium | Medium | MVP; V1 |
| RSK-ZS-026 | ZSchool's liability as data custodian in parent-school disputes (restrictions, documents, custody) | Regulatory | Medium | High | High | MVP; V1 |
| RSK-ZS-027 | The Fatourati Aggregator contract not finalized by 30/06/2027 | Financial | Medium | Medium | Medium | V1 |
| RSK-ZS-028 | CNDP filings not obtained before pilot activation | Regulatory | Medium | High | High | MVP |
| RSK-ZS-004 | The MVP scope extension (two waves) not confirmed by the founder | Operational | Medium | High | High | MVP |

### RSK-ZS-001 — Securing teacher adoption: mobile roll call and grade entry

| Attribute | Value |
|---|---|
| Category | Adoption |
| Description | The MVP rests on two daily teacher actions: taking roll call on a phone in class and entering grades on mobile in the evening, in a context of unstable connections and no computer in the classroom (baseline §2.10). A teacher who does not take roll call in the tool breaks the absence-alert journey (a notification to guardians within 5 minutes, JMP-ZS-005 in `prd/journeys/00`) and leaves the report card without data (JMP-ZS-006); the value perceived by parents and school leadership collapses, right when the parent app is the very differentiator being sold. The affected population is large and volatile: about half of private-sector teachers are part-time and work at several schools (H-13; `prd/research/02-regulatory-data.md` §8), with no strong tie to any one school's tools. |
| Probability | High |
| Impact | High |
| Exposure | Critical |
| Preventive mitigation | Mobile-first design, tolerant of connectivity loss with automatic sync (baseline §10, the NFR-OFF and NFR-MOB domains in `prd/cross-cutting/32-non-functional-requirements.md`); a roll-call journey reduced to the minimum number of taps, usable in under a minute per class; teacher training built into each school's onboarding (JMP-ZS-003), with a teacher point of contact named at the school; a portable, career-enhancing teacher profile (verified affiliation periods, URS-ZS-031 in `prd/02-actors-personas.md`) presented as a direct benefit; measuring the daily roll-call rate per school and per class; Success outreach triggered by usage data, not by complaints; usability testing with pilot teachers (ADR-ZS-035) before rollout. |
| Fallback plan | If teacher adoption plateaus at a school: operationally shift roll call to the head supervisor and supervisors (already JMP-ZS-005 stakeholders) and grade entry to the lead teacher or administration via the web; a targeted re-training campaign for low-usage classes; during a transition period agreed with school leadership, delayed entry (day+1) is tolerated with no blocking, with student life handling the absence alert; a product escalation if a recurring cause (network, steps, wording) needs a fix. |
| Owner | ZSchool Product (UX); ZSchool Success and support; the client school's leadership (teacher point of contact) |
| Warning indicator | Daily roll-call rate: share of classes checked in the tool before midday, per school (differentiated KPI-ZS-001 targets: ≥ 90% per school, ≥ 95% for primary schools; alert threshold < 80% for two consecutive weeks); the share of grades entered in the tool before period closing (target ≥ 95%). Carried by KPI-ZS-001 (roll-call rate) and KPI-ZS-012 (a pilot baseline measured before activation) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP (declared sessions BEH-ZS-070, optional MFA for teachers ADR-ZS-066 (§25l)); V1 (push); V2+ (native apps, the teacher network as an anchoring lever) |
| Traceability | (→ PROJECT.md §18 point 9, §2.10, §10, H-11, H-13, ADR-ZS-035; URS-ZS-027, URS-ZS-028, URS-ZS-018, URS-ZS-035; JMP-ZS-005, JMP-ZS-006) |
| External sources | `prd/research/02-regulatory-data.md` §8 (share of part-time teachers, the AREF circular); `prd/research/01-market-competition.md` §4 (dominant parent-app complaints: connection failures) |

### RSK-ZS-007 — Overcoming school-leadership reluctance about students' permanent access to report cards (H-12)

| Attribute | Value |
|---|---|
| Category | Market |
| Description | Hypothesis H-12 (school-leadership acceptance of a student's permanent access to their report cards) could not be verified by any source (baseline §16.1). Yet the model grants students permanent read access to their published documents (INV-ZS-080, INV-ZS-033; URS-ZS-053), and an adult student becomes the owner of their own account (ADR-ZS-001). Some school leaders may see this as a loss of control: a report card visible to the family before its "official handover," grades still under discussion in a class council, parent-school conflicts surfaced through the platform. A school leader who rejects the platform for this reason blocks the entire school: the paying client is the school (ADR-ZS-024). |
| Probability | Medium |
| Impact | High |
| Exposure | High |
| Preventive mitigation | A strict separation of states: in-progress grades (entries, drafts, deliberations) never visible outside the school (INV-ZS-081, INV-ZS-034); a report card exists as a viewable document only after school leadership publishes it, immutable and versioned (ADR-ZS-020, INV-ZS-015); a per-school parameter for the level at which student access is activated (INV-ZS-051: default from 1AC, activated by a guardian); H-12 explicitly tested in interviews with the ADR-ZS-035 pilots before rollout; a sales narrative grounded in the ministry's position on unconditional issuance of school documents (baseline §2.7): the platform secures the school leader's compliance, it does not undermine it. |
| Fallback plan | If reluctance turns out to be widespread among pilots: default student visibility of report cards to publication after the class council (the year-end decision), preserving the permanent-access promise (INV-ZS-033) over time without advancing it within the year; give reluctant school leaders a configurable "delayed release" option; if the need for a structural exception emerges, escalate it to the baseline via this file's "Open Questions" rather than deviate locally. |
| Owner | ZSchool Product; ZSchool sales leadership; pilot school leadership |
| Warning indicator | The share of schools that activated student access and the share of student-access restriction requests after activation (alert threshold: more than 20% of schools requesting a restriction in the first quarter of use); refusal reasons logged in pilot reviews. Carried by KPI-ZS-042 (student access activation) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP (published report cards, student access, adult student: ADR-ZS-051; configurable progressive publication BEH-ZS-129) |
| Traceability | (→ H-12, INV-ZS-051, INV-ZS-052, INV-ZS-080, INV-ZS-081, ADR-ZS-020, ADR-ZS-024, ADR-ZS-001; INV-ZS-033, INV-ZS-034, INV-ZS-015, INV-ZS-042, INV-ZS-043; URS-ZS-053, URS-ZS-055; JMP-ZS-006) |
| External sources | `prd/research/01-market-competition.md` §4 (parent expectations: grades and assessment schedules) |

### RSK-ZS-008 — Absorbing the instability of Massar formats with no API (H-04)

| Attribute | Value |
|---|---|
| Category | Technical |
| Description | Massar exposes no API to software vendors: the only documented channel is Excel file import and export from the grade-entry module (H-04 confirmed, baseline §2.6; `prd/research/04-pedagogy-massar-calendar.md` §2). Grade entry into Massar works by downloading, then re-uploading Excel files generated by Massar, per subject, class, and semester; the column structure is not publicly documented, and the re-upload often fails (format or corruption errors) even with no file changes made. Two consequences: (a) an unannounced change to the file templates can render ZSchool's exports unusable and undermine the "end of double data entry" promise (URS-ZS-003), a major purchase driver; (b) competitors claim a "native, bidirectional sync with Massar" that is publicly unverifiable (Tayssir, `prd/research/01-market-competition.md` §2), creating marketing pressure toward promises ZSchool must not make without the ministry's agreement. |
| Probability | High |
| Impact | High |
| Exposure | Critical |
| Preventive mitigation | Generating exports faithful to the Massar templates per subject, class, and semester, with a compliance check before submission (the rule "at least two assessments plus one unified test per subject and semester," baseline §7.12) and an error report readable by the front office; versioning the detected file template at every school-year start, with regression tests on real samples supplied by pilots; mirroring ESISE obligations (the May private-school census, the HR registry, year-end results — `prd/research/04-pedagogy-massar-calendar.md` §2); disciplined sales language: "exports compliant with the Massar templates," never "synchronization" (baseline §2.6: no automation of data entry without the ministry's agreement); monitoring of operating guides and ministerial notices; a transfer log recording the Massar reference. |
| Fallback plan | If the format changes with no notice: the school continues entering data into Massar from the data already in ZSchool (a per-subject, per-class entry screen), with the degraded promise communicated transparently; a template fix produced by the Massar module team within a five-working-day target; a temporary "basic" export (stable columns) made available, paired with a reformatting guide; if an official channel (an API, a partner program) appears, add it to V2+ per baseline §12 rather than improvising. |
| Owner | ZSchool Product (MAS module, `prd/modules/21-massar-regulatory-exports.md`); ZSchool technical leadership; pilot schools (providing samples) |
| Warning indicator | The Massar export failure rate after validation (the share of files rejected on Massar import or flagged by the check: alert threshold > 5%); the time to fix a format change (target ≤ 5 working days); the number of schools reporting a return to manual Massar entry. Carried by KPI-ZS-044 (Massar files accepted on first submission) and KPI-ZS-004 (double data entry) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP (matching by Massar code; class-list and continuous-assessment exports in wave 2: BEH-ZS-262 to BEH-ZS-265, ADR-ZS-041); V1 (regulatory statistics, an ESISE mirror) |
| Traceability | (→ H-03, H-04, H-10, G-08, §2.6, §7.12; INV-ZS-006, INV-ZS-005; URS-ZS-003, URS-ZS-008; JMP-ZS-006) |
| External sources | `prd/research/04-pedagogy-massar-calendar.md` §2 (fragile re-upload, ESISE, no API); `prd/research/01-market-competition.md` §2 (competitor sync claims) |

### RSK-ZS-009 — Managing sales seasonality and the cash-flow trough

| Attribute | Value |
|---|---|
| Category | Market |
| Description | Schools' buying cycle is locked to the school year: adoption decisions concentrate between the spring re-enrollment campaign and the September school-year start (JMP-ZS-002, JMP-ZS-003 in `prd/journeys/00`), SaaS billing runs over ten months from September to June, and there is no billing in July-August (ADR-ZS-009, baseline §11). A missed opportunity at the school-year-start window costs the targeted school a full year's delay; conversely, the second semester bills costs (development, support, infrastructure) with no matching revenue. The reference ambition (20 schools and 15,000 students in year 1, 300 schools and 200,000 students at three years, ADR-ZS-008) is only achievable if recruitment and onboarding absorb the April-August window with no slippage. |
| Probability | High |
| Impact | Medium |
| Exposure | High |
| Preventive mitigation | A sales plan worked backward from the school calendar: outreach and demos from January to March, signatures and pilots in spring, onboarding from April to August (JMP-ZS-003), no heavy commercial launch from September onward; trial offers and pilots concentrated in spring to fit the window; onboarding capacity sized for a peak (a tooled import process, a Success team reinforced in summer); public-subsidy levers used carefully: the MOWAKABA program covers 80% (SMEs) to 90% (micro-enterprises) of digitalization services, but school eligibility is unconfirmed (`prd/research/02-regulatory-data.md` §9) — a turnkey case offered, no claim of a confirmed subsidy; a monthly review of the onboarding plan. |
| Fallback plan | If the school-year-start plan is missed: shift sales effort to mid-year entries (transfers JMP-ZS-009, one-off enrollments) and to securing the N+1 wave early (pre-agreements signed the previous spring); tighten discretionary spend during the July-August lull, using it for heavy maintenance and version upgrades (windows outside the school-year start, baseline §10); revise the plan with the founder if the gap exceeds a governance-defined threshold. |
| Owner | ZSchool sales leadership; ZSchool executive leadership; ZSchool Success and support (onboarding capacity) |
| Warning indicator | The number of onboardings planned and completed per month against the plan (alert threshold: under 50% of plan three months before the school-year start); the value of the spring N+1 pre-agreement pipeline; the share of revenue signed before 31 July. Carried by KPI-ZS-007 (onboardings vs. plan) and KPI-ZS-008 (demo-to-contract conversion) of `prd/cross-cutting/38-kpi-success-metrics.md`; the ADR-ZS-008 horizon remains escalated to the founder (ADR-ZS-072, ADR-ZS-047). |
| Version affected | MVP (pilots); V1 (commercial launch, the ADR-ZS-008 ambition); V2+ |
| Traceability | (→ ADR-ZS-024, ADR-ZS-030, ADR-ZS-008, ADR-ZS-009, ADR-ZS-035, H-22, §2.4, §11; JMP-ZS-002, JMP-ZS-003) |
| External sources | `prd/research/02-regulatory-data.md` §9 (MOWAKABA: rates, eligible services, unconfirmed school eligibility) |

### RSK-ZS-010 — Absorbing the school-year-start and period-closing load peaks

| Attribute | Value |
|---|---|
| Category | Technical |
| Description | Platform load is strongly seasonal (`prd/journeys/00` §4): an annual peak in September (Excel imports, account creation, a wave of parent claims, roll calls starting, first monthly payments, peak notification volume), closing peaks at the end of each semester or trimester (bulk report-card generation and publication: a 3-second generation target and a 10-minute publication target for a 2,000-student school, baseline §10), a second peak in June (certifying exams, the N-to-N+1 rollover). The trimester-based pilot school (ADR-ZS-035) triples the report-card peak. The absence-alert delay requirement (under 5 minutes after roll-call validation) must hold at peak. A degradation in September — users' first real contact with the product — would be maximally damaging to reputation. |
| Probability | Medium |
| Impact | High |
| Exposure | High |
| Preventive mitigation | Technical sizing set against the three-year target (500 schools, 500,000 students, 1,000,000 guardians, 30,000 teachers, baseline §10; the NFR-RES domain in `prd/cross-cutting/32-non-functional-requirements.md`); pre-school-year-start load tests covering both profiles (semesters and trimesters) and all three peak types (concurrent sessions, bulk processing, outbound notification throughput); prioritized notification queues (absence alerts ahead of bulk messages); a ban on maintenance windows in September and during the June exams (baseline §10); platform elasticity built on services actually available in the OCI Casablanca region, verified at launch (H-18, see RSK-ZS-011); bulk processing smoothed outside school hours. |
| Fallback plan | Graduated graceful degradation: deferring non-critical messages, keeping absence alerts and payments as top priority; activating additional capacity per RSK-ZS-011's plan, including on the backup site if needed; if a peak exceeds capacity, a temporary cap on bulk processing (report cards generated in school batches, staggered publication with school-leadership agreement); transparent communication to schools and a systematic post-mortem. |
| Owner | ZSchool technical leadership; ZSchool Success and support (operations calendar) |
| Warning indicator | p95 latency of critical journeys during peaks (pages under 2 seconds on 4G, report cards under 3 seconds, a 2,000-student school's publication under 10 minutes); notification failure rate; pre-school-year-start load-test results (blocking if failed). Carried by the performance and availability indicators in `prd/cross-cutting/38-kpi-success-metrics.md` (reliability domain) and requirements in `prd/cross-cutting/32-non-functional-requirements.md` (NFR-PERF, NFR-DISP). |
| Version affected | All versions (MVP included: the pilots' school-year start is already a peak) |
| Traceability | (→ PROJECT.md §18 point 9, §10, §12, ADR-ZS-035, G-21; JMP-ZS-003, JMP-ZS-004, JMP-ZS-006, JMP-ZS-007) |
| External sources | `prd/research/05-infrastructure-usage.md` §1 (region constraints, a single availability domain) |

### RSK-ZS-011 — Securing hosting: an OCI region with a single availability domain, catalogue to verify, DR plan to prove (H-18)

| Attribute | Value |
|---|---|
| Category | Technical |
| Description | The Oracle Cloud "Morocco West" region (af-casablanca-1, opened April 2026, hosted at N+ONE in Nouaceur) has **a single availability domain**; Oracle's second Moroccan region (Settat) is planned with no published timeline (`prd/research/05-infrastructure-usage.md` §1). A disaster at the Casablanca datacenter would therefore interrupt the entire platform if nothing is planned for. The baseline calls for production and backups within Morocco with a Moroccan backup site (ADR-ZS-007, §9): data residency removes the Law 09.08 transfer formality but limits fallback alternatives (a European fallback would create a transfer to cover and contradict the sovereignty promise); student data does not leave the territory. Separately, the availability of managed services in the region (managed databases, managed Kubernetes, object storage, cross-site backups) still needs a service-by-service check at launch (H-18): an architecture designed around a missing service would require a mid-course redesign. |
| Probability | Medium |
| Impact | High |
| Exposure | High |
| Preventive mitigation | A service-by-service check of the region's catalogue at design time and at launch (H-18), an architecture with no critical dependency on multi-availability-domain services; daily encrypted backups with a minimum 30-day retention and quarterly tested restoration (baseline §10); **from MVP onward**, daily replication of encrypted backups to a second Moroccan site (SEC-ZS-026, INT-ZS-036, the RDM-ZS-013 gate — ADR-ZS-066 (§25h)): Atlas Cloud Services in Benguérir (certified Tier III and Tier IV, ISO 27001 and PCI DSS) or OVHcloud Local Zone Rabat (`prd/research/05-infrastructure-usage.md` §1); **at V1**, a full DR plan with failover (SEC-ZS-025, NFR-ZS-009), RTO of 8 h / RPO of 15 min targets limited to a site disaster, with the 99.5% SLA read as excluding site disasters (ADR-ZS-066 §25i, historical alias D5); semi-annual restoration exercises; monitoring for the Settat region's opening to replicate to it continuously once available; the only outbound flows remain messaging providers governed by the F118 model (ADR-ZS-007). |
| Fallback plan | If the primary site fails: rebuild on the sovereign backup site from replicated backups, per the announced RTO communicated to schools; a standard crisis-communication template (leadership, schools, parents via school channels); if a required managed service proves unavailable in the region: switch to an equivalent self-managed service or to the second provider, with no data leaving Morocco; an annual architecture reassessment against the actual catalogue. |
| Owner | ZSchool technical leadership; ZSchool executive leadership (hosting and backup contracts) |
| Warning indicator | Platform availability (target 99.5% outside announced maintenance, baseline §10); observed RPO and RTO during restoration exercises (a gap > 50% against targets = an alert); the gap between the expected and actual OCI catalogue (a quarterly H-18 review); success of the off-site restoration exercise before RDM-ZS-001. Carried by the availability and continuity indicators in `prd/cross-cutting/38-kpi-success-metrics.md` and `prd/cross-cutting/32-non-functional-requirements.md` (NFR-DISP). |
| Version affected | All versions (MVP: off-site replication; V1: a full DR plan) — pilot data is real student data |
| Traceability | (→ ADR-ZS-007, H-18, H-06, G-09, G-21, Q-08, §9, §10; INV-ZS-037; ADR-ZS-066 (§25h), ADR-ZS-066 (§25i); SEC-ZS-025, SEC-ZS-026, INT-ZS-036) |
| External sources | `prd/research/05-infrastructure-usage.md` §1 (af-casablanca-1, a single availability domain, Settat with no timeline, Atlas Cloud, OVH Rabat); `prd/research/00-baseline-corrections.md` #13 |

### RSK-ZS-012 — Tracking the shifting framework of Law 59.21 and its 35 implementing decrees

| Attribute | Value |
|---|---|
| Category | Regulatory |
| Description | Law 59.21 was published in Official Gazette No. 7485 of 23/02/2026 (the baseline said "March 2026" — a divergence recorded in OQ-ZS-374); 35 implementing decrees are expected (`prd/research/02-regulatory-data.md` §1; `prd/research/00-baseline-corrections.md` #2). They will notably set the template for the annual written school-parent contract, the rules for publishing the fee schedule (art. 49), sanctions (up to MAD 10,000, 20,000, and 100,000, including refusal to issue certificates and attestations), and possibly carry over provisions from the repealed Law 06.00 (permanent-staff quotas, authorizations for external teachers). The product directly embeds these obligations: a fee schedule, a parents' contract generated and electronically signed (ADR-ZS-011), a ban on mid-year increases locked into the model (INV-ZS-017), no blocking of official documents (ADR-ZS-005, INV-ZS-016). Any decree can render a template non-compliant and trigger a wave of simultaneous updates across every tenant. |
| Probability | High |
| Impact | Medium |
| Exposure | High |
| Preventive mitigation | A configurable design: the contract template and fee schedule are per-school configurable templates, never hard-coded; organized legal monitoring (Official Gazette, General Secretariat of Government) with a review at every decree publication and an internal qualification team; written traceability of document and attestation requests and issuances in the documents module (a requirement reinforced by the sanction for refusing to issue, `prd/research/00-baseline-corrections.md` #16); tracking permanent, part-time, and external public-sector teacher status in affiliations, with AREF authorization deadlines (`prd/research/02-regulatory-data.md` §8); compliance requirements centralized in `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| Fallback plan | At every decree publication: bring templates into compliance within a 30-day target, with a release note and communication to schools; during a transitional period, the school keeps its own contract on file (ZSchool archives it and ties it to the student record); if a decree were to contradict a baseline decision (e.g., the contract's mandatory content), open an open question and get founder arbitration before any product change. |
| Owner | ZSchool Compliance; ZSchool Product (FIN, DOC, CAR modules); ZSchool executive leadership |
| Warning indicator | The number of decrees published and processed (a template compliance turnaround target ≤ 30 days); the share of schools using the current contract template (target > 80% within a quarter); document requests and issuance turnaround (full traceability). Carried by KPI-ZS-038 (compliance) of `prd/cross-cutting/38-kpi-success-metrics.md`; requirements in `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| Version affected | MVP (fee schedule, payment schedule, enrollment documents, parents' contract with a tracked simple acceptance and financial-guardian countersignature: BEH-ZS-152, BEH-ZS-036, ADR-ZS-041/ADR-ZS-061 (§20h)); V1 (advanced contract signature, compliant invoices); V2+ (ongoing monitoring) |
| Traceability | (→ §2.7, §7.7, ADR-ZS-005, ADR-ZS-011, H-14, G-16; INV-ZS-016, INV-ZS-017) |
| External sources | `prd/research/02-regulatory-data.md` §1 (Official Gazette 7485, 35 decrees, sanctions, art. 49); `prd/research/00-baseline-corrections.md` #2 and #16 |

### RSK-ZS-013 — Managing the evolving guardianship regime under the Family Code

| Attribute | Value |
|---|---|
| Category | Regulatory |
| Description | The Family Code's "December 2024 reform" is a proposal report submitted to the King (139 provisions): nothing has been voted or enacted to date (`prd/research/02-regulatory-data.md` §5; `prd/research/00-baseline-corrections.md` #5); the 2004 Family Code (Law 70-03) remains in force (the father is legal guardian by operation of law, art. 236; custody order art. 171; the 30/05/2023 ministerial position recognizing the custodial mother's access to school administrative documents). The baseline described the reform as "adopted": a divergence recorded in OQ-ZS-375. The risk is twofold: (a) configuring default qualities and rights based on a text that does not exist; (b) being caught off guard by an entry into force that would change the defaults (custodial-mother guardianship for routine matters) with no way to switch without a data-model overhaul. The "legal guardian" and "custodian" qualities are already distinct and independent in the model (INV-ZS-066, INV-ZS-028), which reduces exposure. |
| Probability | Medium |
| Impact | Medium |
| Exposure | Medium |
| Preventive mitigation | A model aligned with current law only (no behavior based on an unenacted text); distinct, combinable guardian qualities, with per-school context attributes (INV-ZS-067, INV-ZS-029); a "guardianship regime" parameter designed to switch on with no schema overhaul, documented in the administration module; periodic legislative monitoring shared with RSK-ZS-012; parental disputes arbitrated by the school, never by the platform (INV-ZS-068). |
| Fallback plan | If a reform is ever enacted: activate the alternate regime via the parameter, reconfigure defaults (act signatories, default recipients), issue a release note and support schools through the change; in the meantime, any observed change in the law (circulars, ministerial responses) is reviewed by Compliance before the product is changed. |
| Owner | ZSchool Product (INS, ADM modules); ZSchool Compliance |
| Warning indicator | Legislative status reviewed at every product committee (quarterly); the time to activate the regime parameter after any enactment (target ≤ 30 days); the number of mishandled parental-conflict incidents (target zero information leak). Carried by KPI-ZS-038 (compliance) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP (parent-student relationships, qualities); V1 (the guardianship-regime parameter) |
| Traceability | (→ INV-ZS-065, INV-ZS-066, INV-ZS-067, INV-ZS-068, G-03, §2.7; INV-ZS-027, INV-ZS-028, INV-ZS-029; URS-ZS-045, URS-ZS-049) |
| External sources | `prd/research/02-regulatory-data.md` §5 (an unvoted report, articles 236, 171, 209); `prd/research/00-baseline-corrections.md` #5 |

### RSK-ZS-014 — Sequencing e-invoicing with no decree published

| Attribute | Value |
|---|---|
| Category | Regulatory |
| Description | The e-invoicing implementing decree is not published (the DGI platform is "developed, tested," with a draft at the General Secretariat of Government since April 2026); the chosen format is UBL with a qualified signature and a clearance model, and rollout waves are announced: large enterprises during 2026, mid-size/SMEs in 2027-2028, then micro-enterprises; most schools (billing individual parents, B2C) would be out of scope initially (`prd/research/02-regulatory-data.md` §7; `prd/research/00-baseline-corrections.md` #15). The risk is mistimed investment: activating clearance too early (cost, complexity, dependence on a qualified provider) or too late (non-compliance for VAT-registered clients, a commercial disadvantage for school groups billing VAT-registered entities). |
| Probability | Medium |
| Impact | Medium |
| Exposure | Medium |
| Preventive mitigation | The baseline is already compliant: invoices with mandatory mentions (ICE, IF, business registration), tamper-proof sequential numbering per school (INV-ZS-017), ten-year accounting retention; preparing a structured UBL export for invoices from V1 onward without activating clearance; explicit roadmap sequencing (`prd/cross-cutting/37-roadmap-mvp-v1-v2.md`) tied to decree publication (H-17) and to clients' VAT-registration profile; a qualified seal and timestamp planned for V2 via an approved provider (ADR-ZS-011), reusable for e-invoice signing. |
| Fallback plan | An early publication affecting client schools (rollout waves widened): priority activation of the UBL export and qualified seal for VAT-registered tenants, with the rest of the base keeping the simple compliant invoice; a delayed publication: the prepared export stays dormant with no clearance cost; any interpretation ambiguity (B2C scope, schools) is referred to the DGI or recorded as an open question rather than settled unilaterally. |
| Owner | ZSchool Product (FIN module); ZSchool Compliance |
| Warning indicator | Decree publication tracked in monitoring (the milestone trigger); the share of tenants with a VAT-registered client on their invoices; the time to activate the UBL export after publication (target ≤ 60 days). Carried by KPI-ZS-038 (compliance) of `prd/cross-cutting/38-kpi-success-metrics.md`; milestones in `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`. |
| Version affected | V1 (compliant invoices, a prepared UBL export); V2+ (clearance, a qualified seal, if the decree is published) |
| Traceability | (→ H-08, H-17, ADR-ZS-011, §7.7; INV-ZS-017) |
| External sources | `prd/research/02-regulatory-data.md` §7 (UBL, clearance, rollout waves, VAT by service type); `prd/research/00-baseline-corrections.md` #15 |

### RSK-ZS-005 — Absorbing the 01/10/2026 WhatsApp pricing switch

| Attribute | Value |
|---|---|
| Category | Financial |
| Description | On 01/10/2026, two changes announced by Meta take effect for Morocco: the end of free service and utility messages within the 24-hour window, and a move out of "Rest of Africa" regional pricing onto a standalone rate card (higher utility and authentication rates, an authentication-international category); rate cards were announced before 01/09/2026 but **had not been obtained as of the PRD date** (`prd/research/03-payments-communications.md` §4; `prd/research/00-baseline-corrections.md` #6; an action to obtain them is tracked in `prd/cross-cutting/40-assumptions-open-questions-tracker.md`): all consumable cost modeling rests on earlier order-of-magnitude figures. Concretely: parents' inbound replies also become billable, while the pack model (ADR-ZS-009: consumables billed on top, SMS resold at MAD 0.30 to 0.50 with a margin, baseline §11) was budgeted on earlier assumptions. The risk is a runaway consumable cost for schools, a preference shifting back to the informal WhatsApp groups ZSchool aims to replace, and templates reclassified as marketing (more expensive) through usage drift. |
| Probability | High |
| Impact | Medium |
| Exposure | High |
| Preventive mitigation | At MVP, WhatsApp "utility" messaging limited to attendance notifications for opted-in parents (opt-in required by Law 09.08 and 2019 CNDP-ANRT guidance, with a notice on the cross-border data transfer — ADR-ZS-066 (§25c)) and alias SMS as fallback, with no push (ADR-ZS-062 (§21b)); from V1 onward, the ADR-ZS-036 hierarchy with push (free) as the first channel; authentication SMS charged to ZSchool and outside the packs (PAK-ZS-002, ADR-ZS-062 (§21h)); the standalone rate card obtained before RDM-ZS-011 and a dated routing parameter built to handle the 01/10/2026 switch; budgeting that includes inbound conversations, not just notifications; strictly transactional utility templates (absence, payment reminder, report-card publication) reviewed before Meta approval to avoid reclassification; per-school, per-channel cost counters (DeliveryLog), threshold alerts on packs; tracking the utility-to-SMS ratio: as an order of magnitude, a utility message remains clearly cheaper than an alias SMS to Morocco (`prd/research/03-payments-communications.md` §4). |
| Fallback plan | If the rate card makes the channel prohibitive for a message category: automatically switch that category to push and SMS, with the cost trade-off documented; a concerted narrowing of WhatsApp scope to only critical events (child safety, financial); renegotiate or change access provider (Meta's direct Cloud API with no billed intermediary, or a flat-fee BSP); if needed, revise consumable pack pricing with the founder (an explicit decision, baseline §11). |
| Owner | ZSchool Product (COM module); ZSchool finance leadership (pack pricing); ZSchool Success (school usage) |
| Warning indicator | Average cost per notification delivered, per channel and per school (an alert if the monthly WhatsApp cost exceeds the budgeted reference by 20%); the share of WhatsApp messages reclassified as marketing (alert threshold: > 2%); the WhatsApp opt-in rate; inbound-volume billing drift. Carried by KPI-ZS-037 (cost per notification and per student) and KPI-ZS-021 (channels) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP (WhatsApp "utility" limited to attendance notifications, a single ZSchool WhatsApp Business account, INT-ZS-024); V1 (full WhatsApp Business API rollout, push); cost tracking runs from channel activation onward |
| Traceability | (→ ADR-ZS-023, ADR-ZS-009, ADR-ZS-036, H-11, H-20, G-17, §11; INV-ZS-044) |
| External sources | `prd/research/03-payments-communications.md` §4 (per-message billing, the 01/10/2026 switch, the standalone rate card, order-of-magnitude figures); `prd/research/00-baseline-corrections.md` #6 |

### RSK-ZS-015 — Closing out the Fatourati framework: pricing and contract undetermined (H-19)

| Attribute | Value |
|---|---|
| Category | Financial |
| Description | Decision ADR-ZS-031 makes the Fatourati network (Collect then Aggregator, launched 17/02/2026) the primary online-payment rail from V1 onward, with the school remaining the creditor and ZSchool never holding funds. But pricing and the contractual framework (a creditor contract, the Collect offering, the Aggregator offering) are not public: H-19 remains a point to verify against primary texts and through negotiation (baseline §16.2; `prd/research/03-payments-communications.md` §1). Without an agreement on viable terms within the V1 timeline, the automated-collections promise (URS-ZS-002, journey JMP-ZS-008) weakens right as the commercial product launches; the quality of reconciliation (daily, anti-duplicate, per the Eduka reference model) drives front offices' trust in automated entries. |
| Probability | Medium |
| Impact | High |
| Exposure | High |
| Preventive mitigation | Sales engagement with CMI (the Aggregator offering) started at V1's design stage, for a framework contract covering ZSchool schools; an integration modeled on the documented reference: real-time debt lookup, payment confirmation, automatic recording, daily reconciliation with duplicate rejection (`prd/research/03-payments-communications.md` §1); a clean contractual position: ZSchool as a technical provider, never holding funds; a Collect mechanism ready in parallel (the school contracts directly, ZSchool integrates tracking); end-to-end testing with a pilot school before rollout. |
| Fallback plan | If the Aggregator contract does not close in time or on viable terms: roll out Collect mode per school (a per-school connection timeline), with MVP's basic finance (cash, cheques with a full lifecycle, transfers, reminders) covering most collections needs in the meantime; a semi-automated reconciliation via a tooled statement import as a last resort; longer-term, the registered card (V2, RSK-ZS-016) adds a second online rail. No scenario has ZSchool holding funds. |
| Owner | ZSchool sales leadership; ZSchool Product (FIN module, the Fatourati integration in `prd/cross-cutting/35-external-integrations.md`) |
| Warning indicator | The share of schools connected to an online rail (target > 60% one year after V1); the share of online payments automatically reconciled with no manual work (target > 95%, alert < 90%); the framework contract's time to close (a dated go/no-go on 30/06/2027, D-18 in `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`; see RSK-ZS-027). Carried by KPI-ZS-009 to KPI-ZS-011 (collections) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | V1 |
| Traceability | (→ ADR-ZS-031, H-09, H-19, §2.8, §7.7; URS-ZS-002; JMP-ZS-008) |
| External sources | `prd/research/03-payments-communications.md` §1 (the Fatourati Aggregator launched 17/02/2026, the API, the Eduka model, the school as creditor); `prd/research/00-baseline-corrections.md` #8 |

### RSK-ZS-016 — Rolling out card payment (V2) into a restructured acquiring landscape

| Attribute | Value |
|---|---|
| Category | Market |
| Description | Registered-card payment is planned for V2 (ADR-ZS-031) via NAPS e-Premium or Chari Pay. The landscape has been restructured: since 1 May 2025, acquiring is handled by banks and payment institutions, with CMI now acting only as a switch; the transfer of roughly 55,000 merchant contracts to seven acquirers was completed on 31/01/2026; YouCan Pay, cited by the baseline among the few players publishing their pricing, ceased operating in January 2024 (`prd/research/03-payments-communications.md` §2; `prd/research/00-baseline-corrections.md` #7). Two frictions result: the acquirer contract is signed by each school (not by ZSchool), introducing per-school costs and delays (setup, subscriptions, commission); and a vendor's failure — of which YouCan Pay is the recent precedent — would require reconfiguring rails for affected schools. |
| Probability | Medium |
| Impact | Medium |
| Exposure | Medium |
| Preventive mitigation | A multi-rail acceptance architecture with processor abstraction (integrations in `prd/cross-cutting/35-external-integrations.md`): NAPS e-Premium, Chari Pay, or a bank-affiliated payment-institution acquirer, at the school's choice; tokenization kept on the acquirer's side, with ZSchool acting as a technical agent that never holds funds; an enrollment guide per acquirer (fees, timelines, documents) handed to school leadership; no reference to YouCan Pay in any sales or technical material; monitoring of Bank Al-Maghrib's payment-institution and interchange rules. |
| Fallback plan | A rail fails or exits: affected schools migrate to an alternative rail with parent re-enrollment (re-tokenization) and supported communication; in parallel, the Fatourati rail (V1) and manual methods stay available, and no parent is blocked; if an acquirer's terms deteriorate, the school's arbitration is documented in the rail comparison. |
| Owner | ZSchool Product (FIN module); ZSchool partnerships; ZSchool sales leadership |
| Warning indicator | The share of schools equipped with a card rail among V2 candidates; the payment and tokenization failure rate (alert > 3%); an acquirer's incidents or condition changes (monitored). Carried by KPI-ZS-009 to KPI-ZS-011 (collections) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | V2+ |
| Traceability | (→ ADR-ZS-031, H-09, §2.8, §11; JMP-ZS-008) |
| External sources | `prd/research/03-payments-communications.md` §2 (seven acquirers, NAPS, Chari Pay, YouCan Pay closed); `prd/research/00-baseline-corrections.md` #7 |

### RSK-ZS-017 — Resisting multi-school offerings and price pressure

| Attribute | Value |
|---|---|
| Category | Market |
| Description | The market has around a dozen active vendors. Two threats converge: (a) some players adopt or claim the same differentiators as ZSchool — Tayssir claims a cross-school parent account, about 50 schools, and a publicly unverifiable "bidirectional sync" with Massar (`prd/research/01-market-competition.md` §2); (b) direct price pressure: Skoolly at MAD 4 to 6 per student per month, Minassa between MAD 1.3 and 2.5 per student per month, Galactis with an "Express" edition at MAD 5,000 per year and euro-denominated pricing, E-Madrassati at MAD 1,950 per year (`prd/research/01-market-competition.md` §2-3) — while ZSchool's single plan is MAD 5 per student per month over ten months (ADR-ZS-009), placing it in the upper end of the Moroccan range (MAD 10 to 65 per student per year, baseline §3.3), justified by a much more complete offering. The risk is losing price-sensitive schools to a "good enough" offering, and a blurring of positioning if competitors' multi-school claims are not distinguished from ZSchool's actual global identity. |
| Probability | High |
| Impact | Medium |
| Exposure | High |
| Preventive mitigation | Demonstrable differentiators in sales: a genuinely live, cross-school parent account, transfer with history, compliant Massar exports, Moroccan payment rails (Fatourati), full bilingualism, documented security and compliance — against competitors' unverifiable claims (`prd/research/01-market-competition.md` §2: opaque pricing, genuinely low app adoption); the ADR-ZS-030 priority target (300-to-3,000-student schools on the Casablanca-Kénitra corridor, home to 70% of schools); social proof built with the ADR-ZS-035 pilots; structured quarterly competitive monitoring across identity, parent apps, Massar, payments, and pricing; never a denigrating comparison, only demonstrations. |
| Fallback plan | Facing a local price war: sales offers targeted at services (onboarding, migration, training, a MOWAKABA case) without breaking the single plan; focus on multi-site groups, less price-sensitive and more interested in consolidation; if market pressure persists and threatens the ADR-ZS-008 ambition, get explicit founder arbitration on pricing (ADR-ZS-009 is only modifiable by an explicit founder decision) rather than let sales drift unmanaged. |
| Owner | ZSchool sales leadership; ZSchool Product (demos); ZSchool executive leadership |
| Warning indicator | The demo-to-contract conversion rate and the loss rate against an identified competitor (alert threshold: over 30% of losses attributed to price or a multi-school claim); competitor pricing and features tracked quarterly; the share of contracts with an exceptional discount. Carried by KPI-ZS-008 (demo-to-contract conversion) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP; V1 (commercial launch); V2+ |
| Traceability | (→ ADR-ZS-030, ADR-ZS-008, ADR-ZS-009, G-25, Q-01, §3.3, §11) |
| External sources | `prd/research/01-market-competition.md` §2-3 (Tayssir, Skoolly, Minassa, Galactis, E-Madrassati, common market patterns) |

### RSK-ZS-018 — Defusing resistance from entrenched ecosystems (Pronote, Nexsoft)

| Attribute | Value |
|---|---|
| Category | Market |
| Description | Ecosystems are already entrenched where ZSchool wants to grow: Pronote runs at about 80 publicly listed Moroccan schools — French-mission schools and Moroccan private-school groups (Elbilia, Yassamine, Skolar, Jacques Chirac) — and covers student life, grades, and communication, but not billing (`prd/research/01-market-competition.md` §3); Nexsoft claims over 900 schools with school-local software and per-school white-label apps (same source, §2). The risks: (a) durable dual-tooling (Pronote for academics + ZSchool for finance) that relegates ZSchool to a secondary role at the most prestigious targets; (b) inertia at schools running local software (migration, habits, a white-label app perceived as "their own" app); (c) the cost of migrating historical data discouraging switching. |
| Probability | Medium |
| Impact | Medium |
| Exposure | Medium |
| Preventive mitigation | Native multi-system configuration (a national track and a French track within the same school, baseline §2.3; research `prd/research/01-market-competition.md` §6): ZSchool covers finance, Massar, and communication, which Pronote does not, and accepts initial coexistence with an installed academic system rather than demanding a big-bang switch; a priority target among non-accredited French-curriculum and enhanced-bilingual schools, which are less locked in (same source, §6); tooled migration and data-import support (G-18) with dedicated onboarding assistance; an architecture argument: real-time, multi-site SaaS versus school-local software and per-school fragmented apps. |
| Fallback plan | For schools attached to Pronote: tooled coexistence (an interface or file import/export with the French section) while ZSchool handles finance, student life, and communication; if the demand for coexistence becomes structural, treat it as a V2+ integration requirement (a public API, baseline §12) with an explicit product decision; never sacrifice the data model's unity to imitate per-school white-labeling. |
| Owner | ZSchool sales leadership; ZSchool Product (migrations) |
| Warning indicator | The adoption rate at targeted French-curriculum schools; loss reasons cited ("already equipped": alert threshold > 25% of losses); the volume and average cost of migrations completed. Carried by KPI-ZS-007 (onboardings) and KPI-ZS-008 (conversion) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | V1 (multi-system support, migrations); V2+ (a public API for advanced coexistence) |
| Traceability | (→ §2.3, §3.3, G-18, G-29, INV-ZS-076; JMP-ZS-003) |
| External sources | `prd/research/01-market-competition.md` §2, §3, §6 (Pronote 80 schools, Nexsoft 900+, multi-system schools, less-locked-in targets) |

### RSK-ZS-019 — Guaranteeing CNDP compliance: F211/F214, the F112 authorization (national ID, health), minors

| Attribute | Valeur |
|---|---|
| Category | Regulatory |
| Description | Law 09.08 remains the framework in force, with no adopted revision (baseline H-05; `prd/research/02-regulatory-data.md` §2). The school is the data controller and ZSchool is the processor: ZSchool's own filings do not exempt each school from its own (baseline §2.7). The specific pitfalls identified by research: adults' national ID numbers and health data move a processing activity from the standard declaration (F211, or a simplified F214) to a two-to-four-month **preliminary authorization** F112; any hosting abroad is a transfer (per the adequacy list under deliberation 236-2015, otherwise an F118 authorization within two months); F118 forms are needed for messaging providers; no rule specific to minors sets consent, which is given by legal guardians (`prd/research/02-regulatory-data.md` §2; `prd/research/00-baseline-corrections.md` #19). The risk: a non-compliant client school (collecting national ID numbers or health data without authorization, an undeclared phone-number file) exposes the platform to CNDP complaints, a de facto feature suspension, or collective reputational damage. |
| Probability | Medium |
| Impact | High |
| Exposure | High |
| Preventive mitigation | A per-school compliance wizard: a guided F211/F214 choice, an automatic alert to switch to F112 as soon as a setting enables national-ID or health-data collection, an F118 template for messaging providers (`prd/research/00-baseline-corrections.md` #19); a formalized dual role (a data-processing agreement, ZSchool's own filings, ADR-ZS-027); information notices and legal-guardian consents collected at enrollment (baseline §9); health-data collection confined to the V2+ health module and activatable only with prior authorization (health data never transferred automatically, ADR-ZS-019); hosting in Morocco removing the F118 formality for hosting itself (ADR-ZS-007); tooled data-subject rights (access, rectification, objection, with erasure translated into anonymization per ADR-ZS-003 and INV-ZS-037); logging of sensitive access (INV-ZS-090, INV-ZS-019); requirements carried by `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| Fallback plan | An unauthorized feature detected: an immediate freeze on the affected collection (with no deletion of existing data) until the school's filing is regularized, with support to file online via CNDP-FORMS; for transfers that become necessary (new providers outside the adequacy list): contractual clauses and an F118 authorization before the flow is activated, or the provider is disabled; a CNDP complaint targeting a school: ZSchool's document-support process within the bounds of its processor role. |
| Owner | ZSchool Compliance (data-protection role); ZSchool Product; ZSchool Success (supporting schools) |
| Warning indicator | The share of active schools with an up-to-date CNDP filing (target 100%; alert < 95%); the number of F112 switches triggered by the wizard and time to regularize; the time to process data-subject requests (target ≤ 30 days); the number of active outbound flows with no documented governance (target zero). Carried by KPI-ZS-038 (CNDP compliance: filings submitted / obtained by date) of `prd/cross-cutting/38-kpi-success-metrics.md`; requirements in `prd/cross-cutting/36-legal-compliance-data-protection.md`. |
| Version affected | MVP (filings submitted before 15/12/2026: CNF-ZS-001; national ID not collected until F112 is obtained; a pilot agreement CNF-ZS-002; a manual data-subject-rights process CNF-ZS-003; a sub-processor register CNF-ZS-012 including FCM/APNs and monitoring — ADR-ZS-066); V1 (an immutable audit trail, tooled data-subject rights, a CNDP wizard); V2+ (a health module under F112 authorization) — see RSK-ZS-028 for the timeline |
| Traceability | (→ §2.7, §9, H-05, H-15, G-09, ADR-ZS-019, ADR-ZS-027, ADR-ZS-003, ADR-ZS-007; INV-ZS-032, INV-ZS-037, INV-ZS-019) |
| External sources | `prd/research/02-regulatory-data.md` §2 (F211/F214, F112 for national ID/health, F118, deliberation 236-2015, controller/processor roles); `prd/research/00-baseline-corrections.md` #19 |

### RSK-ZS-020 — Protecting against Massar code enumeration and OTP account attacks

| Attribute | Value |
|---|---|
| Category | Technical |
| Description | Two attack surfaces are structural to the product. First: the Massar code is the preferred matching key for student identity (ADR-ZS-015) and its structure is public (a letter followed by nine digits, baseline §2.6); any service exposing a Massar code as a browsable identifier (matching, document verification, QR codes) with no protection allows enumeration and unauthorized access to minor students' data — the model already requires enumeration protection for these codes (`prd/03-domain-data-model.md` §2.1; baseline §9). Second: the primary contact identifier is the mobile phone (ADR-ZS-022, INV-ZS-044), and authentication relies on SMS OTP and/or e-mail with MFA required for privileged roles (leadership, administration, accounting, system administrator; optional for teachers and supervisors — ADR-ZS-066 (§25l), SEC-ZS-005); accounts are exposed to OTP bombing (a directly billable SMS cost), SIM swapping, and number impersonation; multi-school parent accounts aggregate data from several schools and make a high-value target. A cross-tenant leak or an impersonation touching minors' data would be maximally damaging to reputation. |
| Probability | Medium |
| Impact | High |
| Exposure | High |
| Preventive mitigation | Anti-enumeration protection on every public surface: uniform responses, rate limiting, no Massar code in public URLs or QR codes (the verification QR code exposes a token, never the code), per-document secrets (baseline §9); multi-tenant isolation systematically enforced server-side (INV-ZS-001); mandatory MFA for privileged roles with trusted devices (SEC-ZS-005, SEC-ZS-006), session and device management, secure resets and number changes (SEC-ZS-004, BEH-ZS-020), a password policy and OTP rate limiting (SEC-ZS-003), a bounded local system administrator (PER-ZS-003); OTP attempt limits, anomaly detection (new devices, geographically inconsistent logins), progressive throttling of suspicious accounts; encryption in transit and at rest with reinforced encryption for identity documents and sensitive data; code reviews, periodic penetration tests, and vulnerability management (baseline §9); detailed requirements in `prd/cross-cutting/31-security-privacy.md`. |
| Fallback plan | An attack detected: progressive lockout of affected accounts with school notification and a recovery process countersigned by school leadership; a temporary suspension of the OTP channel with a fallback to e-mail double-verification or MFA; on a confirmed leak: an incident-response plan (classification, containment, notifying client data controllers, CNDP notification as good practice even where not legally required), with the immutable audit trail available (INV-ZS-090). |
| Owner | ZSchool technical leadership (security); ZSchool Compliance (incident response) |
| Warning indicator | Detected security incidents (blocked enumeration attempts, an OTP failure-rate anomaly: alert > 3x the weekly baseline); the time to detect and contain an incident (target < 24 hours); the confirmed compromised-account rate (target zero). Carried by KPI-ZS-039 (security incidents and time to resolution) of `prd/cross-cutting/38-kpi-success-metrics.md`; requirements in `prd/cross-cutting/31-security-privacy.md`. |
| Version affected | All versions (MVP included: pilots handle real minors' data; a first penetration test before RDM-ZS-001, SEC-ZS-027) |
| Traceability | (→ §9, §2.6, ADR-ZS-015, ADR-ZS-022, INV-ZS-090; INV-ZS-006, INV-ZS-001, INV-ZS-032, INV-ZS-044, INV-ZS-003; ADR-ZS-048, ADR-ZS-049, ADR-ZS-066 (§25g), ADR-ZS-066 (§25l), ADR-ZS-066 (§25n); SEC-ZS-005, SEC-ZS-006, SEC-ZS-027, SEC-ZS-004, SEC-ZS-003, PER-ZS-003) |
| External sources | `prd/research/04-pedagogy-massar-calendar.md` §2 (Massar code structure); `prd/research/03-payments-communications.md` §5 (SMS cost, exposure to bombing) |

### RSK-ZS-006 — Reducing dependence on single vendors (SMS, WhatsApp, e-signature, hosting)

| Attribute | Value |
|---|---|
| Category | Operational |
| Description | Four critical functions each rest on a small number of vendors. Transactional SMS runs through a Moroccan aggregator, with no formal published reseller program and significant pricing gaps depending on the sending regime (`prd/research/03-payments-communications.md` §5). WhatsApp Business access runs through Meta's Cloud API or official BSPs reachable from Morocco — no local carrier is a BSP, and self-hosting is not possible (same source, §4). The qualified seal and timestamp (V2) depend on a provider approved per service (signature, seal, timestamp: distinct approvals, no public pricing, three approved providers: `prd/research/02-regulatory-data.md` §4). Production hosting is concentrated in a single region with a single availability domain (RSK-ZS-011). In each case, a vendor failure, a unilateral price increase, or a lost approval immediately affects service to schools, with no instant switch-over. |
| Probability | Medium |
| Impact | Medium |
| Exposure | Medium |
| Preventive mitigation | Contracts with service commitments and reversibility clauses; technical channel abstraction: notification routing (push, WhatsApp, SMS, e-mail) is configurable per message type and per school (ADR-ZS-023, ADR-ZS-036), with each channel independently enabled, disabled, or replaced; a dual WhatsApp access path considered (Meta's direct Cloud API alongside a BSP); selecting a signature provider that covers all three services (signature, seal, timestamp) to avoid scattered per-service approvals (`prd/research/00-baseline-corrections.md` #14); a critical-dependency map reviewed semi-annually with a documented exit plan for each. |
| Fallback plan | A channel becomes unavailable: automatic fallback per the hierarchy (push then alias SMS for absence alerts, never silence on critical events); a unilateral price increase: switch vendors with template and deliverability re-testing, with configured routing making the switch operational; the loss of the signature provider: seals reissued via another approved provider, with already-issued documents remaining verifiable (fingerprint and QR code); a hosting disaster: RSK-ZS-011's process. |
| Owner | ZSchool technical leadership; ZSchool partnerships; ZSchool finance leadership (contracts) |
| Warning indicator | The per-channel delivery error rate (alert > 5% on a channel during business hours); logged vendor incidents (outages, term changes); the observed time to switch a channel (target < 4 hours). Carried by KPI-ZS-041 (channel-fallback delay) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP (SMS, hosting, WhatsApp "utility" for attendance notifications); V1 (full WhatsApp rollout, advanced seal and timestamp); V2+ (a qualified seal via an approved provider) |
| Traceability | (→ ADR-ZS-023, ADR-ZS-011, ADR-ZS-036, §9; INV-ZS-044) |
| External sources | `prd/research/03-payments-communications.md` §4-5 (BSPs, SMS aggregators, no reseller program); `prd/research/02-regulatory-data.md` §4 (per-service approval, three providers); `prd/research/00-baseline-corrections.md` #14 |

### RSK-ZS-021 — Guaranteeing import data quality and managing duplicate identities

| Attribute | Value |
|---|---|
| Category | Operational |
| Description | Every school's onboarding rests on bulk imports from heterogeneous files (paper registers digitized into Excel, local software, exports from older tools): JMP-ZS-003 in `prd/journeys/00`. The risk specific to ZSchool is that the imported material is the global identity itself: duplicate people (the same student enrolled twice, the same parent under two spellings, the same part-time teacher present in two files) corrupt the product's core (strong and weak matching, INV-ZS-054 to INV-ZS-057, INV-ZS-006 and INV-ZS-005), and once parent accounts are activated, it becomes highly visible that "Ahmed" has two accounts. At the school-year start, the correction window is short: a poor import destroys trust within the first weeks and requires costly audited merges (INV-ZS-020, reserved to ZSchool support from MVP onward: BEH-ZS-029, ADR-ZS-041). Onboarding pilots mid-year (ADR-ZS-043) adds migrating paid payment schedules, cheques in hand, and semester grades, where any error is immediately visible to families. Large schools (a group of over 2,000 students, ADR-ZS-035) concentrate the risk. |
| Probability | High |
| Impact | Medium |
| Exposure | High |
| Preventive mitigation | A tooled import chain: preview, batch validation, control counts (expected versus imported), a reasoned row-level rejection; strong matching by Massar code proposed but never forced, weak matching flagged as a probable duplicate with never any automatic linking (INV-ZS-005); normalizing names in dual script and phone numbers to E.164 format (ADR-ZS-021, ADR-ZS-022); matching guardians by mobile number and intra-file deduplication (ADR-ZS-050); rehearsing the mid-year migration on an anonymized copy before activation (RDM-ZS-023); a post-import quality check run with the school **before** activating parent accounts; supervised merge tooling (ZSchool support or an authorized role, confirmed by a legal guardian, an end-to-end audit, INV-ZS-020); a standard test dataset to train teams on recurring pitfalls. |
| Fallback plan | Duplicates found after activation: a deferred, supervised merge (duplicates coexist while the matter is settled, no data is lost, the merge history is auditable); a corrected re-import with a traceability log and a before/after comparison; reinforced Success support for schools whose detected duplicate rate exceeds the threshold; as a last resort, operate with unmerged identities, transparent within each school's usage (multi-tenant isolation) and documented for parents. |
| Owner | ZSchool Product (ADM module); ZSchool Success and support; the school's leadership and front office (review) |
| Warning indicator | The rate of probable duplicates found per import (alert threshold > 2% of rows); the volume of merges requested per school per month; the average time to resolve a flagged duplicate (target ≤ 5 working days). Carried by KPI-ZS-040 (duplicates found / merged on import) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP |
| Traceability | (→ G-01, G-18, §7.1, INV-ZS-054, INV-ZS-055, INV-ZS-056, INV-ZS-057, ADR-ZS-021, ADR-ZS-022; INV-ZS-006, INV-ZS-005, INV-ZS-020; JMP-ZS-003, JMP-ZS-004) |
| External sources | No specific external data; a finding drawn from the baseline (§2.1: Excel files and paper registers, double data entry) |

### RSK-ZS-022 — Governing the cancellation or closure of a client school (G-33)

| Attribute | Value |
|---|---|
| Category | Operational |
| Description | A client school can close (an AREF authorization withdrawal, bankruptcy), cancel, or disappear with no cooperation. The baseline then requires: a full export handed to the school, 90 days of read-only access, deletion of operational data 12 months after cancellation, while individuals keep their global identity and access to their published documents (ADR-ZS-004, G-33, INV-ZS-045, INV-ZS-033). The risks: (a) commercial — a sudden revenue loss if the closure hits a large tenant, with a signaling effect on the market; (b) legal and reputational — families demanding their documents from a school that no longer exists, with the platform as the only effective custodian; (c) operational — a domino effect on shared identities (students, part-time teachers, multi-school parents tied to other active tenants) and on the closed school's outstanding balances (the financial relationship surviving closure, INV-ZS-062, INV-ZS-018). A closure process needed to be detailed in the PRD (G-33), which this chapter records as a coverage requirement. |
| Probability | Medium |
| Impact | Medium |
| Exposure | Medium |
| Preventive mitigation | A tooled cancellation process from V1 onward: a full export generated and handed over, a switch to read-only, a deletion schedule compliant with ADR-ZS-004; for every student, an exit file and certificates available through existing journeys (JMP-ZS-009, JMP-ZS-010; ADR-ZS-032) so no family depends on the school alone; automatic retention of global identities and access to published documents (INV-ZS-033, INV-ZS-045); early churn-risk detection (declining usage, late subscription payments, satisfaction) and a commercial save plan before cancellation; a clear contractual clause on the fate of data. |
| Fallback plan | An abrupt closure with no cooperation: automatic application of the ADR-ZS-004 cycle (a platform-generated export, 90 days read-only, deletion at 12 months); document support for families via their permanent personal access, and for receiving schools via transfers (JMP-ZS-009); handling the closed school's outstanding balance per the law (the financial relationship maintained until cleared); a commercial plan to replace lost revenue and controlled market communication. |
| Owner | ZSchool Success and support; ZSchool sales leadership; ZSchool Compliance |
| Warning indicator | The monthly and annual cancellation rate (alert if > 1% monthly outside the season); the share of subscriptions with a late payment; the number of tenants with declining usage for two consecutive months; cancellation processing times compliant with ADR-ZS-004. Carried by KPI-ZS-017 (active students) and KPI-ZS-007 (onboardings vs. plan) of `prd/cross-cutting/38-kpi-success-metrics.md`; a pilot dropping out is covered under RSK-ZS-023. |
| Version affected | MVP (pilots: a clean export and closure); V1 (a fully tooled cancellation); V2+ |
| Traceability | (→ G-33, §7.1, INV-ZS-062, INV-ZS-080, ADR-ZS-004, ADR-ZS-032; INV-ZS-018, INV-ZS-033, INV-ZS-045, INV-ZS-016; JMP-ZS-009, JMP-ZS-010) |
| External sources | `prd/research/02-regulatory-data.md` §1 (AREF oversight, mid-year closure sanctioned by Law 59.21) |

### RSK-ZS-002 — Activating parents despite the digital divide and WhatsApp opt-in

| Attribute | Value |
|---|---|
| Category | Adoption |
| Description | The parent promise (a single account, real-time notifications, JMP-ZS-004 and JMP-ZS-005) requires parents activated on their own accounts. Three real frictions: (a) the digital divide — 89.2% of households have internet access, but only 78.4% in rural areas, and a share of households have only a shared phone (`prd/research/05-infrastructure-usage.md` §2; baseline §2.10); (b) e-mail is rarely checked and often nonexistent: the mobile phone is the primary contact identifier (ADR-ZS-022, INV-ZS-044) — now distinct from the login identifier (INV-ZS-003, ADR-ZS-048), which enables a single-phone household and foreign numbers (see RSK-ZS-024) — so invitations and OTPs go by SMS and the account is created on the phone; (c) WhatsApp usage, near-universal (98.6% of social-media users, same source), requires the parent's prior opt-in (Law 09.08 and 2019 CNDP-ANRT guidance), and some parents will refuse, narrowing coverage of the most natural channel. Unactivated parents push the entire information burden back onto the front office and undercut the promise sold to school leadership. |
| Probability | Medium |
| Impact | Medium |
| Exposure | Medium |
| Preventive mitigation | Frictionless activation: an SMS invitation with a short code, a guided claim over a few mobile screens (JMP-ZS-004), activation possible at the front desk by the front office on enrollment day; a lightweight interface tolerant of weak connections (baseline §10, NFR-MOB and NFR-OFF in `prd/cross-cutting/32-non-functional-requirements.md`); a channel hierarchy that guarantees universality: SMS for everyone, WhatsApp on opt-in, push from V1 onward (ADR-ZS-036, ADR-ZS-062 (§21b)); a per-person communication language (BEH-ZS-197); demonstrable value from day one: the absence alert within 5 minutes of the morning roll call (baseline §10); fine-grained per-school activation measurement with Success follow-up. |
| Fallback plan | Low parent adoption at a school: activation campaigns run by the school (school-year-start day, parent-teacher meetings, printed invitation codes); full SMS coverage for households with no smartphone, with the cost as a managed consumable (RSK-ZS-005); accepting partial activation: the school keeps its front desk and phone as channels, and the platform is never the sole mandatory channel; if activation stays durably below threshold at several schools, a product investigation (trust, usability, language) before any change to the activation model. |
| Owner | ZSchool Product (portals, COM module); ZSchool Success and support; the school's leadership (activation campaigns) |
| Warning indicator | The rate of activated (claimed) parent accounts per school (target > 70% within a quarter; alert < 50%); the WhatsApp opt-in rate; the average time between invitation and activation (alert > 14 days); the share of notifications delivered by SMS versus push and WhatsApp. Carried by KPI-ZS-021 (channels) and KPI-ZS-041 (channel fallback) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP |
| Traceability | (→ §2.10, H-11, G-17, ADR-ZS-022, ADR-ZS-036; INV-ZS-044; URS-ZS-034, URS-ZS-035; JMP-ZS-004, JMP-ZS-005, JMP-ZS-011) |
| External sources | `prd/research/05-infrastructure-usage.md` §2 (ANRT 2024-2025: 78.4% rural, WhatsApp 98.6%); `prd/research/03-payments-communications.md` §4 (opt-in, 2019 CNDP-ANRT guidance) |

### RSK-ZS-003 — Holding the MVP schedule with a team sized for two waves

| Attribute | Value |
|---|---|
| Category | Operational |
| Description | MVP wave 1 (ADR-ZS-041, `prd/cross-cutting/37-roadmap-mvp-v1-v2.md` §2.1 bis) must be developed, tested, and deployed between the scope freeze (RDM-ZS-011, October 2026) and pilot activation (RDM-ZS-001, 01/02/2027) — four months for about a hundred functional requirements, the mid-year data migration (ADR-ZS-043), and the compliance gate (RDM-ZS-013); wave 2 (the year-end closing) must follow before 31/05/2027 (RDM-ZS-024). Version 0.1 of the PRD had neither intermediate milestones nor team sizing. A one-month slip means missing the mid-year window and pushing activation to the 2027-2028 school-year start, delaying the ADR-ZS-008 ambition (already escalated, ADR-ZS-072) by a year. |
| Probability | High |
| Impact | High |
| Exposure | Critical |
| Preventive mitigation | Team sizing and a hiring plan settled before 15/10/2026 (`prd/cross-cutting/37` §5.2); monthly intermediate milestones RDM-ZS-021, RDM-ZS-022, RDM-ZS-023 with a velocity review and a hard cut on anything outside §2.1 and §2.1 bis; founder confirmation of the scope extension before the freeze (ADR-ZS-073, RSK-ZS-004); continuous UAT with pilot points of contact rather than a single final acceptance test; reuse of anonymized real data from RDM-ZS-021 onward; no wave-1 dependency on Fatourati, push, or native apps. |
| Fallback plan | A switch-over trigger set for 30/04/2027 (OQ-ZS-372 in `37`): if RDM-ZS-004 is not declared by 28/02/2027, activate a single pilot (the 300-student primary school) mid-year and push the other three to the 2027-2028 school-year start; if RDM-ZS-024 slips, run the June 2027 closing in "assisted manual" mode (exporting decisions, creating N+1 via import) with an explicit founder waiver; revise the roadmap and the ADR-ZS-008 horizon accordingly. |
| Owner | ZSchool technical leadership; ZSchool product leadership; the project founder (ADR-ZS-072, ADR-ZS-073 decisions) |
| Warning indicator | The gap between delivered and planned requirements at each intermediate milestone (alert > 15%); velocity over three iterations; blocking defects open at RDM-ZS-023 (target zero). Carried by KPI-ZS-007 (delivered vs. plan) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP (waves 1 and 2) |
| Traceability | (→ ADR-ZS-041, ADR-ZS-043, ADR-ZS-047; ADR-ZS-072, ADR-ZS-073; ADR-ZS-026, ADR-ZS-008, ADR-ZS-035; RDM-ZS-011, RDM-ZS-004, RDM-ZS-001, RDM-ZS-021 to RDM-ZS-024 in `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`) |
| External sources | `prd/research/04-pedagogy-massar-calendar.md` §3 (the 2026-2027 calendar: resuming 01/02/2027, the baccalaureate 01-03/06/2027) |

### RSK-ZS-023 — Preventing a pilot from dropping out mid-year

| Attribute | Value |
|---|---|
| Category | Market |
| Description | The MVP is validated with three to five pilots covering four profiles (ADR-ZS-035). A pilot onboarded mid-year (RDM-ZS-001) may pull out before the June 2027 closing or before the 2027-2028 school-year start: a migration workload deemed too heavy, a launch incident, a change in school leadership, pressure from an entrenched vendor (RSK-ZS-018), consumable costs (RSK-ZS-005). Losing a profile (e.g., the multi-site group or the trimester-based school) makes the RDM-ZS-002 transition criteria unmeasurable for that profile and deprives commercial launch of a reference; a mid-year withdrawal also leaves families with active accounts and published documents (INV-ZS-033) that ZSchool remains custodian of. |
| Probability | Medium |
| Impact | High |
| Exposure | High |
| Preventive mitigation | A pilot agreement (CNF-ZS-002, D-20) with a duration commitment through the 2027-2028 school-year start, consideration (free onboarding and consumables, reinforced support), and an orderly exit clause; a fifth "backup" pilot identified for each critical profile; a leadership point of contact and a teacher point of contact named from RDM-ZS-012 onward; the RDM-ZS-014 learning loop with a weekly review during go-live; the data migration rehearsed before activation (RDM-ZS-023) to avoid a launch incident; RDM-ZS-002 criteria readable with four pilots. |
| Fallback plan | An announced withdrawal: apply the ADR-ZS-004 cycle in pilot mode (export, read-only, families keeping access to their published documents); activate the backup pilot of the same profile at the next window (the 2027-2028 school-year start); if the lost profile cannot be replaced, RDM-ZS-002 is declared with an explicit caveat on that profile, and commercial launch targets validated profiles first. |
| Owner | ZSchool Success and support; ZSchool sales leadership; the project founder |
| Warning indicator | Weekly per-pilot usage (roll calls, collections, publications) declining for two consecutive weeks; critical tickets unresolved beyond 24 hours; school-leadership satisfaction scores at the RDM-ZS-014 review (alert below the threshold set in `38`). Carried by KPI-ZS-001, KPI-ZS-017, and KPI-ZS-007 of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP |
| Traceability | (→ ADR-ZS-004, ADR-ZS-035; INV-ZS-033, INV-ZS-045; CNF-ZS-002; RDM-ZS-012, RDM-ZS-014, RDM-ZS-002; ADR-ZS-066 (§25e)) |
| External sources | `prd/research/01-market-competition.md` §4 (genuinely low parent-app adoption, reasons for abandonment) |

### RSK-ZS-024 — Managing identity by mobile number: reassignment, shared households, foreign numbers

| Attribute | Value |
|---|---|
| Category | Technical |
| Description | The mobile number is the primary contact identifier (ADR-ZS-022, INV-ZS-044) and, by default, the login identifier; version 0.1 made it the sole account key. Three Moroccan realities defeat that: (a) carriers reassign canceled numbers, which can give a third party access to a family's account (data on minor children, finance); (b) a share of households own only a single phone, shared between both parents and children (`prd/research/05-infrastructure-usage.md` §2; the Youssef persona on the family phone); (c) some guardians live abroad or use a non-Moroccan number (Moroccans abroad, international-section families). With no answer, INV-ZS-051 (student access) and INV-ZS-063 (one account per person) are unworkable, and recovering an account after a lost SIM is impossible. |
| Probability | High |
| Impact | High |
| Exposure | Critical |
| Preventive mitigation | A login identifier distinct from the contact identifier (INV-ZS-003, SEC-ZS-002, ADR-ZS-048): a generated identifier for a minor student with no phone and for a single-household's second guardian, with the OTP routed to the guardian; numbers in international E.164 format with an international SMS gateway as fallback (UX-ZS-009); a self-service number change via double OTP, or at a school's front desk with identity verification and school-leadership approval (BEH-ZS-020, SEC-ZS-004, ADR-ZS-049); recycled-number detection (six months with no login, or repeated OTP failures) with a knowledge challenge before any access and an alert to schools; a knowledge challenge and revocation at account claiming (BEH-ZS-028); an account-selection screen on shared devices (UX-ZS-001); authentication SMS kept outside the packs (PAK-ZS-002). |
| Fallback plan | Fraudulent access found: the account is locked, credentials reissued by the school, affected families notified, and the incident logged; a household with no OTP option: front-desk activation by the front office with a generated identifier and an initial password; a foreign number unreachable by SMS: WhatsApp or e-mail as a secondary contact identifier, verified at the front desk. |
| Owner | ZSchool technical leadership (security); ZSchool Product (accounts, portals); school front offices (front-desk activation) |
| Warning indicator | The number of accounts locked on suspicion of a recycled number and time to resolution; the share of number changes handled self-service versus at the front desk; knowledge-challenge failures at claiming (alert if > 5% of invitations); student accounts activated via a generated identifier. Carried by KPI-ZS-039 (security incidents) and KPI-ZS-042 (student access activation) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | All versions (MVP included) |
| Traceability | (→ INV-ZS-051, INV-ZS-063, ADR-ZS-022; INV-ZS-030, INV-ZS-043, INV-ZS-044, INV-ZS-003; ADR-ZS-048, ADR-ZS-049; BEH-ZS-020, BEH-ZS-028, SEC-ZS-002, SEC-ZS-004, UX-ZS-009, UX-ZS-001, PAK-ZS-002; URS-ZS-051, URS-ZS-042; JNY-ZS-081, JNY-ZS-061) |
| External sources | `prd/research/05-infrastructure-usage.md` §2 (shared phones, the rural digital divide) |

### RSK-ZS-025 — Guaranteeing Arabic typography and RTL rendering in PDF documents

| Attribute | Value |
|---|---|
| Category | Technical |
| Description | Report cards, attestations, leaving certificates, receipts, and contracts are bilingual with names in dual script (ADR-ZS-021); they carry a seal and signature and are kept permanently (ADR-ZS-003). A broken Arabic rendering (broken letter ligatures, reversed digits and punctuation, incorrect mixed FR/AR alignment, missing fonts at print time) renders an official document unusable or embarrassing in the eyes of families and administrations, and an immutable, badly rendered report card can only be "fixed" by issuing a new version (INV-ZS-015). The baseline requires "bilingual PDFs, correct Arabic fonts" (§10) with no dedicated acceptance testing in version 0.1. |
| Probability | Medium |
| Impact | Medium |
| Exposure | Medium |
| Preventive mitigation | NFR-DOC requirements (embedded Arabic fonts, contextual letter forms, digits, bidirectional alignment) with a reference document test set per document type and per section (national, bilingual, mission) validated by an Arabic-speaking reviewer before RDM-ZS-023; bilingual templates supplied by ZSchool (BEH-ZS-133); a preview before publication (BEH-ZS-124) and before issuance (BEH-ZS-134); print testing on pilot printers during RDM-ZS-012. |
| Fallback plan | A rendering defect found after publication: a new document version (INV-ZS-015) marked "replaced," a template fix within five working days; a fallback print in a French-only version with a handwritten Arabic note approved by school leadership, never blocking issuance (ADR-ZS-005). |
| Owner | ZSchool Product (DOC, EVA modules); the QA team (Arabic-speaking review) |
| Warning indicator | The number of document versions issued for a rendering defect (target zero after RDM-ZS-023); rendering anomalies reported by pilots. Carried by the document-quality indicators in `prd/cross-cutting/38-kpi-success-metrics.md` (documents domain). |
| Version affected | MVP; V1 (advanced seal, self-service) |
| Traceability | (→ ADR-ZS-021, ADR-ZS-003, ADR-ZS-005, §10; INV-ZS-015; NFR-DOC; BEH-ZS-133, BEH-ZS-134, BEH-ZS-124; RDM-ZS-023) |
| External sources | No specific external data; a finding drawn from the baseline (§2.9: dual script, bilingual documents) |

### RSK-ZS-026 — Framing ZSchool's liability as custodian in parent-school disputes

| Attribute | Value |
|---|---|
| Category | Regulatory |
| Description | ZSchool hosts access restrictions based on court decisions (INV-ZS-065, INV-ZS-027), guardian and custodian qualities (INV-ZS-066), exit authorizations, and issued official documents and their requests. In a parental conflict (separation, custody, refusal to issue a document, a disputed sanction or grade), either party may try to draw the platform in: a request to disclose logs, a challenge to a restriction applied or not applied, a dispute over a document issued to a custodial parent. The baseline states that the school arbitrates and ZSchool does not decide (INV-ZS-068), but version 0.1 left the scope of restrictions ambiguous across schools and did not frame requests coming from judicial authorities. |
| Probability | Medium |
| Impact | High |
| Exposure | High |
| Preventive mitigation | Clear scope rules: a restriction is applied only by the school that attached the court decision, with other schools notified (ADR-ZS-052, BEH-ZS-033); default qualities grounded in current law (the mother's custody by default with no document required, the father's guardianship, art. 171 and 236 — JNY-ZS-071); the leaving certificate signed by the legal guardian, the school-attendance attestation accessible to the custodian (ADR-ZS-061 (§20f)); the account statement handed only to the financial guardian (ADR-ZS-061 (§20e)); write logging from MVP onward (historical alias D4; ADR-ZS-066 §25j) and an immutable log at V1 (INV-ZS-019); a written process for responding to judicial requests and party requests (compliance, CNF-ZS-003, CNF-ZS-026), always through the school as data controller; clauses in the data-processing agreement (CNF-ZS-002) stating that ZSchool does not arbitrate. |
| Fallback plan | ZSchool is drawn into a dispute: a Compliance-bounded response disclosing only logged elements, with arbitration referred back to the school or the court (INV-ZS-068); if a restriction was misapplied, a logged correction and party notification; lessons captured into a "parental conflicts" guide for front offices. |
| Owner | ZSchool Compliance; ZSchool Product (INS, DOC modules); school leadership (arbiters) |
| Warning indicator | The number of parental disputes escalated to ZSchool and response time; the number of restrictions applied with no supporting document (target zero); judicial requests received. Carried by KPI-ZS-038 (compliance) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP; V1 (an immutable log, self-service documents) |
| Traceability | (→ INV-ZS-065, INV-ZS-066, INV-ZS-068, ADR-ZS-005; INV-ZS-027, INV-ZS-028, INV-ZS-019; ADR-ZS-052, ADR-ZS-061 (§20e), ADR-ZS-061 (§20f); BEH-ZS-033, CNF-ZS-003, CNF-ZS-002, CNF-ZS-026; URS-ZS-049; JNY-ZS-071, JNY-ZS-073) |
| External sources | `prd/research/02-regulatory-data.md` §5 (art. 171, 236; the 30/05/2023 ministerial position) and §6 (document issuance, court orders) |

### RSK-ZS-027 — Closing out the Fatourati Aggregator before 30/06/2027

| Attribute | Value |
|---|---|
| Category | Financial |
| Description | A complement to RSK-ZS-015: the review dated a go/no-go for 30/06/2027 (D-18 in `prd/cross-cutting/37-roadmap-mvp-v1-v2.md`, INT-ZS-010) so that ADR-ZS-031's primary rail is operational for the 2028 school-year start; pricing and the contract remain unknown (H-19), and CMI alone decides the timeline. A late or unviable agreement leaves the V1 launch with no "Fatourati collections" differentiator from ADR-ZS-030, or pushes toward a rushed connection with no degraded mode (INT-ZS-011: a ZSchool outage preventing parents from paying through their bank). |
| Probability | Medium |
| Impact | Medium |
| Exposure | Medium |
| Preventive mitigation | Contact made from RDM-ZS-011 onward, an Aggregator application prepared with the 2,000-student pilot as a reference; a formal go/no-go decision by 30/06/2027; a specified degraded mode (queued receivables, a default response) and a target inbound availability level (INT-ZS-011); a documented, tested Collect plan B (a direct school-CMI contract, reconciliation via statement import) with a pilot, ahead of V1. |
| Fallback plan | A no-go on 30/06/2027: roll out Collect mode per school, adjust the sales narrative ("Fatourati payment through the school's bank"), resume Aggregator negotiations for the 2029 school-year start; basic methods (cash, cheques, transfers) and reminders remain collections' foundation. |
| Owner | ZSchool sales leadership; ZSchool Product (FIN module, INT-FAT) |
| Warning indicator | Negotiation status at every product committee from January 2027 onward; the framework contract's signature by 30/06/2027 (binary); a Collect pilot connected before V1. Carried by KPI-ZS-009 to KPI-ZS-011 (collections) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | V1 |
| Traceability | (→ ADR-ZS-030, ADR-ZS-031, H-19; INT-ZS-010, INT-ZS-011; D-06, D-18, RDM-ZS-006; ADR-ZS-066) |
| External sources | `prd/research/03-payments-communications.md` §1 (the Aggregator offering, CMI contact) |

### RSK-ZS-028 — Obtaining CNDP filings before pilot activation

| Attribute | Value |
|---|---|
| Category | Regulatory |
| Description | A complement to RSK-ZS-019: pilots handle real minor students' data from 01/02/2027 onward (RDM-ZS-001). Law 09.08 requires each school's preliminary declaration (F211 or F214) and ZSchool's own for the global identity layer (ADR-ZS-027), plus a two-to-four-month preliminary F112 authorization for adults' national ID numbers; version 0.1 only dated the health-related F112 (V2+). A late filing, or a missing receipt by 31/01/2027, exposes pilots and ZSchool to an undeclared activation, or forces a delayed activation that misses the mid-year window (RSK-ZS-003). |
| Probability | Medium |
| Impact | High |
| Exposure | High |
| Preventive mitigation | A CNF-ZS-001 timeline: filings submitted before 15/12/2026 (D-16), a RDM-ZS-013 compliance gate ahead of any activation; F211/F214 templates and a pilot agreement supplied by ZSchool (CNF-ZS-007, CNF-ZS-002); national ID numbers not collected until F112 is obtained (a disabled field, CNF-ZS-008, SEC-ZS-016); WhatsApp on express consent with a cross-border transfer notice, with F118 filed in parallel (CNF-ZS-004); a complete sub-processor register (CNF-ZS-012); a named data-protection point of contact (CNF-ZS-026). |
| Fallback plan | A missing receipt by 31/01/2027 for a pilot: that pilot's activation is delayed while others proceed; F112 not obtained: national ID numbers stay uncollected with no effect on the rest of the scope; a CNDP refusal or observation: the processing activity is adjusted before activation, never activated in the meantime. |
| Owner | ZSchool Compliance; pilot school leadership (filings); ZSchool Success (support) |
| Warning indicator | The number of filings submitted before 15/12/2026 against the number of pilots (target 100%); receipts obtained by 31/01/2027; the observed F112 processing time. Carried by KPI-ZS-038 (CNDP compliance: filings submitted / obtained by date) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP |
| Traceability | (→ ADR-ZS-027, ADR-ZS-007, H-05, H-15; CNF-ZS-007, CNF-ZS-008, CNF-ZS-004, CNF-ZS-002, CNF-ZS-012, CNF-ZS-001, CNF-ZS-026; SEC-ZS-016, SEC-ZS-023; D-16, D-17, D-20, RDM-ZS-013; ADR-ZS-066 (§25a) to ADR-ZS-066 (§25e)) |
| External sources | `prd/research/02-regulatory-data.md` §2 (F211/F214, F112, F118, timelines) |

### RSK-ZS-004 — Obtaining the founder's confirmation on the MVP scope extension

| Attribute | Value |
|---|---|
| Category | Operational |
| Description | The review extended the MVP scope into two waves (ADR-ZS-041: cheques, the parents' contract, receipts, sibling discount, the account statement, a read-only organization view, support-side merging, the adult student, progressive publication, the rollover, class councils, annual transcripts, Massar exports, batch certificates) so pilots can make it through the 2026-2027 and 2027-2028 school years. This is a working hypothesis (ADR-ZS-073) that adds to the development workload before February 2027 and departs from the letter of the baseline's §12 (ADR-ZS-026). With no founder confirmation before the freeze (RDM-ZS-011), the team either builds a contested scope or, conversely, reverts to a strict §12 reading and makes pilots go through two closings with no tooling. |
| Probability | Medium |
| Impact | High |
| Exposure | High |
| Preventive mitigation | The ADR-ZS-073 decision requested from the founder before RDM-ZS-011, with a per-wave workload estimate (`prd/cross-cutting/37` §5.2) and a documented alternative; a corresponding baseline update (`PROJECT.md` v1.2, ADR-ZS-071); the scope frozen and signed off in two waves at RDM-ZS-011. |
| Fallback plan | A refusal or no decision: revert to a strict §12 reading, with the June 2027 closing run in "assisted manual" mode (exporting decisions, importing N+1, cheques tracked outside the tool) and a written founder waiver; retagged requirements revert to V1 through the same review process, with no renumbering. |
| Owner | The project founder; ZSchool product leadership |
| Warning indicator | The ADR-ZS-073 decision logged in `prd/cross-cutting/40-assumptions-open-questions-tracker.md` before RDM-ZS-011 (binary); `PROJECT.md` v1.2 published before RDM-ZS-004. Carried by KPI-ZS-038 (compliance with the baseline and with filings) of `prd/cross-cutting/38-kpi-success-metrics.md`. |
| Version affected | MVP |
| Traceability | (→ ADR-ZS-026, ADR-ZS-035, §12; ADR-ZS-041; ADR-ZS-073, ADR-ZS-071; RDM-ZS-011, RDM-ZS-004, RDM-ZS-024) |
| External sources | No external data; a finding from the 09/09/2026 review (`PRD-REVIEW-2026-09-09.md` §1.1) |

## 4. Consolidated exposure matrix

Where the twenty-eight risks sit in the rating matrix (§2.1). Critical and High exposures are reviewed at every product committee; Medium exposures are reviewed quarterly.

| Probability \ Impact | Low | Medium | High |
|---|---|---|---|
| **Low** | — | — | — |
| **Medium** | — | RSK-ZS-013, RSK-ZS-014, RSK-ZS-016, RSK-ZS-018, RSK-ZS-006, RSK-ZS-022, RSK-ZS-002, RSK-ZS-025, RSK-ZS-027 | RSK-ZS-007, RSK-ZS-010, RSK-ZS-011, RSK-ZS-019, RSK-ZS-020, RSK-ZS-023, RSK-ZS-026, RSK-ZS-028, RSK-ZS-004 |
| **High** | — | RSK-ZS-009, RSK-ZS-012, RSK-ZS-005, RSK-ZS-017, RSK-ZS-021 | **RSK-ZS-001, RSK-ZS-008, RSK-ZS-003, RSK-ZS-024** |

A summary by exposure level:

| Exposure | Risks | Reading |
|---|---|---|
| Critical (4) | RSK-ZS-001, RSK-ZS-008, RSK-ZS-003, RSK-ZS-024 | The two engines of the promise (roll call and grades entered by the teacher, the end of Massar double data entry), the wave-1 schedule, and identity by mobile number. To be handled as absolute priorities before and during the pilots. |
| High (15) | RSK-ZS-007, RSK-ZS-009, RSK-ZS-010, RSK-ZS-011, RSK-ZS-012, RSK-ZS-005, RSK-ZS-015, RSK-ZS-017, RSK-ZS-019, RSK-ZS-020, RSK-ZS-021, RSK-ZS-023, RSK-ZS-026, RSK-ZS-028, RSK-ZS-004 | School-leadership adoption, seasonality and load peaks, sovereignty and continuity, the 59.21 framework, WhatsApp costs, the Fatourati rail, competition, personal data and CNDP filings, security, import quality, a pilot dropping out, parental disputes, scope confirmation. Mitigations to be funded from MVP onward. |
| Medium (9) | RSK-ZS-013, RSK-ZS-014, RSK-ZS-016, RSK-ZS-018, RSK-ZS-006, RSK-ZS-022, RSK-ZS-002, RSK-ZS-025, RSK-ZS-027 | Risks on a V1/V2+ horizon or with external triggers (reforms, vendors, typography, the Fatourati contract): quarterly monitoring with fallback plans ready. |

A breakdown by category:

| Category | Risks |
|---|---|
| Market | RSK-ZS-007, RSK-ZS-009, RSK-ZS-016, RSK-ZS-017, RSK-ZS-018, RSK-ZS-023 |
| Adoption | RSK-ZS-001, RSK-ZS-002 |
| Regulatory | RSK-ZS-012, RSK-ZS-013, RSK-ZS-014, RSK-ZS-019, RSK-ZS-026, RSK-ZS-028 |
| Technical | RSK-ZS-008, RSK-ZS-010, RSK-ZS-011, RSK-ZS-020, RSK-ZS-024, RSK-ZS-025 |
| Financial | RSK-ZS-005, RSK-ZS-015, RSK-ZS-027 |
| Operational | RSK-ZS-006, RSK-ZS-021, RSK-ZS-022, RSK-ZS-003, RSK-ZS-004 |

## 5. Register governance and tracking

- **Review**: the register is a living document reviewed at every product committee (Critical and High exposures) and every quarter (all categories); every risk that materializes or worsens triggers an update to its fact sheet, with no renumbering of existing identifiers (`RSK-ZS-NNN` values are stable).
- **Indicators**: every warning indicator in this file points to its `KPI-ZS-NNN` owner in `prd/cross-cutting/38-kpi-success-metrics.md` (formula, frequency, final threshold), including KPI-ZS-037 to KPI-ZS-012 created by the review; the numeric thresholds in this chapter are initial management thresholds, adjustable in review with no re-rating of the risk.
- **Links to other cross-cutting chapters**: security requirements (`prd/cross-cutting/31-security-privacy.md`), NFR (`prd/cross-cutting/32-non-functional-requirements.md`), integrations (`prd/cross-cutting/35-external-integrations.md`), compliance (`prd/cross-cutting/36-legal-compliance-data-protection.md`), milestones triggered by regulatory events (`prd/cross-cutting/37-roadmap-mvp-v1-v2.md`). Preventive mitigations translate into requirements in these chapters; this register duplicates none of them.
- **New risks**: any new risk is added with the next identifier in this file's counter (beyond RSK-ZS-004) and a fact sheet following section 3's format. The scheduling risks in `prd/cross-cutting/37-roadmap-mvp-v1-v2.md` §5 create no identifier of their own: they point to this register's `RSK-ZS-NNN` values (ADR-ZS-042 (§26h)).

## Open Questions

Baseline/research divergences and points to arbitrate specific to this chapter (originally a counter local to this file; now re-keyed into the global `OQ-ZS-NNN` register, `spec/open-questions.md`):

| ID | Question | Context |
|---|---|---|
| OQ-ZS-371 | **Escalated — ADR-ZS-071** (a `PROJECT.md` v1.2 baseline update): Updating baseline §2.8: YouCan Pay ceased operating in January 2024 (with no Bank Al-Maghrib approval); the statement "only NAPS and YouCan Pay publish their pricing" needs correcting (current pricing references: NAPS, Chari Pay). | `prd/research/00-baseline-corrections.md` #7; affects RSK-ZS-016 and the V2 card-rail comparison. |
| OQ-ZS-372 | **Escalated — ADR-ZS-071** (a `PROJECT.md` v1.2 baseline update): A refinement of ADR-ZS-007: the OCI region af-casablanca-1 has only a single availability domain, and Oracle's second region (Settat) is planned with no timeline; the targeted "backup site" (Atlas Cloud Benguérir, OVHcloud Rabat, N+ONE Settat) and the cross-site replication timeline still need settling with the architecture. | `prd/research/05-infrastructure-usage.md` §1; `prd/research/00-baseline-corrections.md` #13; affects RSK-ZS-011. |
| OQ-ZS-373 | **Escalated — ADR-ZS-071** (a `PROJECT.md` v1.2 baseline update): Updating H-20/ADR-ZS-036: as of 01/10/2026, free service and utility messages within the 24-hour window end, and Morocco moves out of "Rest of Africa" pricing onto a standalone rate card; the baseline only said "pricing changes on 1 October 2026." Build in budgeting for inbound conversations. | `prd/research/03-payments-communications.md` §4; `prd/research/00-baseline-corrections.md` #6; affects RSK-ZS-005. |
| OQ-ZS-374 | **Escalated — ADR-ZS-071** (a `PROJECT.md` v1.2 baseline update): Updating baseline §2.7: Law 59.21 was published in Official Gazette No. 7485 of 23/02/2026 (not "March 2026"), 113 articles, repealing Laws 04.00, 05.00, and 06.00, with 35 implementing decrees expected. | `prd/research/02-regulatory-data.md` §1; `prd/research/00-baseline-corrections.md` #2; affects RSK-ZS-012. |
| OQ-ZS-375 | **Escalated — ADR-ZS-071** (a `PROJECT.md` v1.2 baseline update): Updating baseline §2.7/INV-ZS-066: the Family Code's "December 2024 reform" is a proposal report (139 provisions), not voted or enacted as of 09/09/2026; the baseline described it as "adopted." Confirm that current law remains the only basis for configuration. | `prd/research/02-regulatory-data.md` §5; `prd/research/00-baseline-corrections.md` #5; affects RSK-ZS-013. |

---

## Traceability

| Baseline ID | Covered in this file |
|---|---|
| §2.6 (Massar, the Massar code) | RSK-ZS-008, RSK-ZS-020, OQ-ZS-375 |
| §2.7 (regulatory framework) | RSK-ZS-012, RSK-ZS-013, RSK-ZS-014, RSK-ZS-019; OQ-ZS-374, OQ-ZS-375 |
| §2.8 (finance and payments) | RSK-ZS-015, RSK-ZS-016; OQ-ZS-371 |
| §2.10 (digital usage) | RSK-ZS-001, RSK-ZS-002 |
| §3.3 (competitive landscape) | RSK-ZS-017, RSK-ZS-018 |
| §7.1 (subscription lifecycle) | RSK-ZS-022 |
| §7.7 (finance) | RSK-ZS-012, RSK-ZS-014, RSK-ZS-015 |
| §7.12 (Massar, statistics) | RSK-ZS-008 |
| §9 (security, compliance) | RSK-ZS-011, RSK-ZS-019, RSK-ZS-020, RSK-ZS-006 |
| §10 (NFR) | RSK-ZS-001, RSK-ZS-010, RSK-ZS-011, RSK-ZS-002 |
| §11 (business model) | RSK-ZS-009, RSK-ZS-005, RSK-ZS-017 |
| §12 (scope by version) | The "Version affected" column of every RSK-ZS-001 to RSK-ZS-002 fact sheet |
| §18 point 9 (risks) | Purpose (§1); RSK-ZS-001, RSK-ZS-008, RSK-ZS-010, RSK-ZS-011 |
| ADR-ZS-019 | RSK-ZS-019 |
| ADR-ZS-021 | RSK-ZS-021 |
| ADR-ZS-022 | RSK-ZS-020, RSK-ZS-021, RSK-ZS-002 |
| ADR-ZS-023 | RSK-ZS-006, RSK-ZS-002 |
| ADR-ZS-024 | RSK-ZS-007, RSK-ZS-009 |
| ADR-ZS-027 | RSK-ZS-019 |
| ADR-ZS-030 | RSK-ZS-009, RSK-ZS-017 |
| ADR-ZS-003 | RSK-ZS-019, RSK-ZS-022 |
| ADR-ZS-004 | RSK-ZS-022 |
| ADR-ZS-005 | RSK-ZS-012 |
| ADR-ZS-007 | RSK-ZS-011, RSK-ZS-019; OQ-ZS-372 |
| ADR-ZS-008 | RSK-ZS-009, RSK-ZS-010, RSK-ZS-017 |
| ADR-ZS-009 | RSK-ZS-009, RSK-ZS-005, RSK-ZS-017 |
| ADR-ZS-011 | RSK-ZS-012, RSK-ZS-014, RSK-ZS-006 |
| ADR-ZS-031 | RSK-ZS-015, RSK-ZS-016 |
| ADR-ZS-032 | RSK-ZS-022 |
| ADR-ZS-035 | RSK-ZS-001, RSK-ZS-009, RSK-ZS-010, RSK-ZS-021 |
| ADR-ZS-036 | RSK-ZS-005, RSK-ZS-006, RSK-ZS-002; OQ-ZS-373 |
| G-01 | RSK-ZS-021 |
| G-08 | RSK-ZS-008 |
| G-09 | RSK-ZS-011, RSK-ZS-019, RSK-ZS-020 |
| G-16 | RSK-ZS-012 |
| G-17 | RSK-ZS-005, RSK-ZS-002 |
| G-18 | RSK-ZS-018, RSK-ZS-021 |
| G-21 | RSK-ZS-010, RSK-ZS-011 |
| G-25 / Q-01 | RSK-ZS-017 |
| G-33 | RSK-ZS-022 |
| H-03 | RSK-ZS-008 |
| H-04 | RSK-ZS-008 |
| H-05 | RSK-ZS-019 |
| H-08 | RSK-ZS-014 |
| H-09 | RSK-ZS-015, RSK-ZS-016 |
| H-10 | RSK-ZS-008 |
| H-11 | RSK-ZS-001, RSK-ZS-005, RSK-ZS-002 |
| H-12 | RSK-ZS-007 |
| H-13 | RSK-ZS-001 |
| H-14 | RSK-ZS-012 |
| H-15 | RSK-ZS-019 |
| H-17 | RSK-ZS-014 |
| H-18 | RSK-ZS-010, RSK-ZS-011; OQ-ZS-372 |
| H-19 | RSK-ZS-015 |
| H-20 | RSK-ZS-005; OQ-ZS-373 |
| H-22 | RSK-ZS-009 |
| INV-ZS-062 | RSK-ZS-022 |
| INV-ZS-065, INV-ZS-066, INV-ZS-067, INV-ZS-068 | RSK-ZS-013 |
| INV-ZS-076 | RSK-ZS-018 |
| INV-ZS-080 | RSK-ZS-007, RSK-ZS-022 |
| INV-ZS-081 | RSK-ZS-007 |
| INV-ZS-090 | RSK-ZS-019, RSK-ZS-020 |
| INV-ZS-054 to INV-ZS-057 | RSK-ZS-021 |
| Q-08 | RSK-ZS-011 |
| Invariants in `prd/03-domain-data-model.md` | INV-ZS-006, INV-ZS-005, INV-ZS-020 (RSK-ZS-021); INV-ZS-018, INV-ZS-033, INV-ZS-045, INV-ZS-016 (RSK-ZS-022); INV-ZS-027 to INV-ZS-029 (RSK-ZS-013); INV-ZS-001, INV-ZS-032, INV-ZS-019 (RSK-ZS-019, RSK-ZS-020); INV-ZS-034, INV-ZS-015, INV-ZS-042, INV-ZS-043 (RSK-ZS-007); INV-ZS-037 (RSK-ZS-011, RSK-ZS-019); INV-ZS-044 (RSK-ZS-020, RSK-ZS-002); INV-ZS-017 (RSK-ZS-012, RSK-ZS-014) |
| Needs in `prd/02-actors-personas.md` | URS-ZS-002 (RSK-ZS-015); URS-ZS-003, URS-ZS-008 (RSK-ZS-008); URS-ZS-027, URS-ZS-028 (RSK-ZS-001); URS-ZS-034, URS-ZS-035 (RSK-ZS-002); URS-ZS-045, URS-ZS-049 (RSK-ZS-013); URS-ZS-053, URS-ZS-055 (RSK-ZS-007) |
| Journeys in `prd/journeys/00-journey-map.md` | JMP-ZS-002, JMP-ZS-003 (RSK-ZS-009); JMP-ZS-003, JMP-ZS-004 (RSK-ZS-010, RSK-ZS-021, RSK-ZS-002); JMP-ZS-005, JMP-ZS-006 (RSK-ZS-001, RSK-ZS-007, RSK-ZS-008); JMP-ZS-008 (RSK-ZS-015, RSK-ZS-016); JMP-ZS-009, JMP-ZS-010 (RSK-ZS-022); JMP-ZS-011 (RSK-ZS-002); §4 (RSK-ZS-010) |
| ADR-ZS-041, ADR-ZS-043 (MVP scope, mid-year migration) | RSK-ZS-008, RSK-ZS-012, RSK-ZS-021, RSK-ZS-003, RSK-ZS-004 |
| ADR-ZS-047, ADR-ZS-072, ADR-ZS-073, ADR-ZS-071 | RSK-ZS-009, RSK-ZS-003, RSK-ZS-004; OQ-ZS-371 to OQ-ZS-375 |
| ADR-ZS-048, ADR-ZS-049 (identity by phone) | RSK-ZS-020, RSK-ZS-002, RSK-ZS-024 |
| ADR-ZS-051, ADR-ZS-052, ADR-ZS-061 (adult student, restrictions, documents) | RSK-ZS-007, RSK-ZS-026 |
| ADR-ZS-062 (channels, language) | RSK-ZS-005, RSK-ZS-002 |
| ADR-ZS-066 (pre-pilot compliance and security) | RSK-ZS-011, RSK-ZS-019, RSK-ZS-020, RSK-ZS-023, RSK-ZS-027, RSK-ZS-028 |
| ADR-ZS-042 (§26h) (KPI-ZS-037 to KPI-ZS-012, RSK-ZS-003 to RSK-ZS-004) | §1, §5; warning indicators in every fact sheet |
| `prd/cross-cutting/37-roadmap-mvp-v1-v2.md` (RDM-ZS-021 to RDM-ZS-024, D-16 to D-20) | RSK-ZS-003, RSK-ZS-023, RSK-ZS-027, RSK-ZS-028 |
| `prd/cross-cutting/42-review-arbitrations.md` | Every revised fact sheet |
