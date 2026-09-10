> **Document Control**
>
> | Property       | Value                                                                                                                                                                                                                    |
> | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | Document ID    | ZSCHOOL-RES-04                                                                                                                                                                                                           |
> | Revision       | 1.0                                                                                                                                                                                                                      |
> | Effective Date | 2026-09-09                                                                                                                                                                                                               |
> | Status         | Effective — Reference                                                                                                                                                                                                    |
> | Author         | ZSchool Product                                                                                                                                                                                                          |
> | Classification | Research Reference                                                                                                                                                                                                       |
> | Change History | 1.0 (2026-09-09): Relocated from `prd/research/04-pedagogy-massar-calendar.md` (v0.3) during the qadi-style spec migration; `ARB-` citation retargeted to `ADR-ZS-` per `spec/process/id-migration-map.md` (CCR-ZS-001). |

# Web Research — Pedagogy, Massar, Calendar (09/09/2026)

Synthesis of research passes: Weightings, MassarExports, SchoolCalendar. See `00-baseline-corrections.md` (permanent UTC+0; the 2021 suspension date is 29/11/2021).

## 1. Grade weightings and continuous assessment (H-02, H-16)

- **Baccalaureate (school-track candidates)**: final mark = **25% first-year continuous assessment + 25% first-year regional exam + 50% second-year national exam**; the framing text (Nov. 2021) refers back to the decision that organizes the exam — **reference number not found online**. (wataiq.com 04/11/2021; concourspret.com)
- **3AC (lower-secondary certificate)**, in force since the 2022 school year, confirmed for 2025-2026: **30% continuous assessment (15% + 15% per semester) + 30% local unified school exam + 40% regional exam (AREF)**; independent candidates: local exam weighted 50%. (fintra.site; 2024-2026 calculators)
- **6AP (primary-school certificate)**: reference figures **50% continuous assessment + 25% local unified exam + 25% standardized provincial exam** (exceptional COVID-era 2021-2022 variant: 75/25). (wataiq.com; lakome2.com) — _Correction from the 09/09/2026 review (`ADR-ZS-059`)_: the sources consulted say "regional"; the baseline (§2.2) and established practice (a standardized provincial exam run by the provincial education offices) use "provincial," and that wording is kept in the spec; the exact order/decree number is still to be recorded (H-16).
- **Baccalaureate honors**: ≥16 highest honors; 14-15.99 honors; 12-13.99 good; 10-11.99 pass; **retake band 8-9.99** (retake session). (pdfmath; concourspret)
- **Memos 080.21 (15/09/2021) and 081.21**: framed homework requirements (2 assignments + 1 unified assignment per semester) and set 6AP at 75/25 and 3AC at 50/50 — **suspended on 29/11/2021** (Ministry of National Education notice) following protests. → Baseline correction (§2.2 previously said November 2022). (orientmaroc.com; infoschool; hespress)
- **Note 43 of 11/01/2006**: the reference text for continuous assessment (an integral part of teaching, all subjects, under inspector supervision) — still cited today.
- **Note 1887/13 (Massar)**: not corroborated online; the framing text for the grades behaviors, per secondary (non-primary) sources.
- Spec takeaway: weightings are **configurable data, set per education level and versioned per school year** (and per AREF region if variations exist); textual references are recorded on the report card; the rule "≥2 assessments plus 1 unified test per subject/semester" serves as a compliance check before period closure.

## 2. Massar and ESISE (H-03, H-04, H-10)

- Massar covers both public **and** private schools; the private sector was an early adopter of computerized grade recording. (hespress)
- **Grade entry**: works by downloading, then **re-uploading Excel files generated by Massar**, per subject/class/semester; **the column structure is not publicly documented**; the re-upload often fails (format errors/corruption) even with no changes made — hence the requirement for faithful file generation and a pre-submission check. (ostadipro.ma testimony 20/08/2026; YouTube demos)
- **Student transfer**: through the Massar parent portal (guardian account → "Procedures and Requests" → transfer request), with supporting documents (birth certificate, transcripts, photo), approved by the provincial education office; a recent circular removed restrictions on private-to-public transfers. (snrtnews; lematin 2022)
- **ESISE (sise.men.gov.ma)**: three applications, "read-only": **Private School Census**, **HR Registry**, **Year-End Results** (GuideEsise_V1.pdf). (sise.men.gov.ma)
- **No public API and no partner program**: as of 2026, interoperability still means manual Excel import/export. (H-04 confirmed)
- Spec takeaway: a faithful Excel export per subject/semester plus a validation report; a transfer log carrying the Massar reference; a mirror of ESISE data (the May census, HR, results); import of certifying-exam results.

## 3. 2026-2027 school calendar and time (G-11)

- **Start of year**: school leaders 01/09, teachers 02/09, students by grade 03-05/09, **classes compulsory for everyone from Monday 07/09/2026**. (medias24 02/09/2026; lematin)
- **Holidays**: 4 one-week periods — 18-25/10/2026, 06-13/12/2026, 21-28/03/2027, 09-16/05/2027; mid-year break 24-31/01/2027. National holidays: 31/10, 06/11, 18/11, 01/01, 11/01, **14/01/2027 (Amazigh New Year)**. (lematin 08/07/2026)
- **Exams**: baccalaureate national exam (regular session) **01-03/06/2027**; regional exam calendars are published by ministerial notice at the start of the year. (9rayti.com)
- **Religious holidays (Hijri calendar, indicative)**: Ramadan 1448 ~08/02→09-10/03/2027; Eid al-Fitr ~08-10/03/2027; Eid al-Adha ~16-18/05/2027; 1st of Muharram ~June 2027 — **confirmed by lunar observation (Ministry of Islamic Affairs)** a few days beforehand. (hijridate; press)
- **Time zone: permanent return to GMT/UTC+0 on 20/09/2026 (Decree 2.26.530, Official Gazette 7521 of 29/06/2026)** — no more seasonal alternation and no Ramadan exception. (erh.ma; sgg.gov.ma BO_7521) → See `00-baseline-corrections.md` #1.
- School week Monday-Saturday (often Saturday morning); the ministry itself opened the school year on a Saturday (05/09/2026): Saturday-morning classes are the norm. (intothewheel; alminbat.ac.ma)
- Spec takeaway: a preloaded annual calendar template (2026-2027 ministerial dates), religious holidays marked "to confirm" and updated during the year, schedule variants (normal / shortened Ramadan / exam period) per school; Saturday-morning classes configurable; a fixed UTC+0 time zone, stored in UTC.
