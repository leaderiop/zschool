# ZSchool — Product Requirements Document (PRD)

| Field | Value |
|---|---|
| Version | 1.2 — English translation (2026-09-09); revised after the critical review of 09/09/2026 (arbitrations in `prd/cross-cutting/42-review-arbitrations.md`) |
| Date | 2026-09-09 |
| Baseline | `PROJECT.md` v1.2 (English edition) (consolidated description, decisions DEC-01 to DEC-36) — frozen (§18) |
| Language | English (product UI remains French/Arabic bilingual per DEC-10) |
| Verification | Global ID/structure lint OK (continuous numbering, no orphan references); critical review `PRD-REVIEW-2026-09-09.md` applied (26 arbitrations, 3 escalations to the product owner); 100% baseline coverage (see §3); every Must/MVP requirement carries a Gherkin scenario |

The PRD translates the `PROJECT.md` baseline into verifiable requirements: journeys by persona, functional requirements by module with Gherkin acceptance criteria, a data model with 43 invariants, a permission matrix, cross-cutting requirements (security, NFR, integrations, compliance), a roadmap, KPIs, risks, and a glossary. Web-sourced desk research (28 topics, 09/09/2026) is recorded in `prd/research/`; the 20 baseline/research divergences are listed in `prd/research/00-baseline-corrections.md` and applied throughout the chapters (including: a permanent UTC+0 timezone since 20/09/2026 — Decree 2.26.530; Law 59.21 in Official Gazette No. 7485 of 23/02/2026; the Fatourati Aggregator launched on 17/02/2026; the WhatsApp pricing switch on 01/10/2026; the Moudawana reform not yet voted).

## 1. PRD outline

| File | Content |
|---|---|
| `00-conventions.md` | Normative annex: language, ID namespaces, templates, traceability |
| `01-context-vision-scope.md` | Corrected Moroccan context, vision, scope, objectives, hypotheses H-01..H-22 |
| `02-actors-personas.md` | 7 actors, 8 personas (+ 2 secondary characters: Lina, Hassan), 58 needs (`BES-…`) |
| `03-domain-data-model.md` | ~66 entities (including `Session`), enrollment state machine (with CANCELLED, import activation, exits from SUSPENDED), invariants `INV-01..45`, ownership/consent, events |
| `journeys/00` | Journey map `PC-01..11` and seasonality |
| `journeys/01..07` | Detailed journeys `PJ-<PERS>-NN` (66 steps): group director, secretary-cashier, head supervisor, part-time teacher, multi-school parent, custodial mother/guardian, students (minor/adult); Gherkin scenarios tagged by version |
| `modules/10..23` | 14 modules: ADM (20 FR), INS (27), PED (21), VSC (25), EVA (19), DOC (15), FIN (30), COM (18), TRA (13), CAR (19), RAP (13), MAS (14), SAN (13, V2+), HEA (11, V2+) — 258 `FR-…` requirements in all, with acceptance criteria and 121 `ECR-…` screens (excluding `ECR-UX`) |
| `cross-cutting/30..42` | Permissions (19 `PER`, 12×10 matrix), security (28 `SEC`), NFR (50 across 10 domains), packaging (17 `PAK`), UX (17 `UX` + 9 screens), integrations (45 `INT-<SYS>`), compliance (27 `CNF`), roadmap (24 `JAL`), KPIs (46, including 4 governance requirements), risks (28 `R`), H/OQ tracking (a 256-question register), glossary (≈230 entries), review arbitrations (26 `ARB`, 3 `ESC`) |
| `research/00..05` | Sourced web research findings + corrections to the baseline |

Review arbitrations (recorded as local OQs in the relevant chapters): D1 WhatsApp (MVP = in-app + SMS + WhatsApp *utility* limited to attendance notifications; V1 = full rollout), D2 unpaid-fee debt kept at the originating school, D3 compliance check blocking in V1, D4 minimal logging at MVP / `AuditLog` in V1, D5 8-hour RTO / 15-minute RPO, D6 minimal directory at MVP, D7 mandatory bilingualism for institutional content, D8 exceeding the AREF cap is non-blocking, D9 landing screens carried by `ECR-UX-01/02`, D10 KPI-06/JAL-17/JAL-10 sequencing.

Critical review of 09/09/2026 (`PRD-REVIEW-2026-09-09.md`): 19 blocking findings and ~175 major/minor findings resolved through 26 arbitrations `ARB-01..26` (`prd/cross-cutting/42-review-arbitrations.md`). Structuring decisions: an MVP scope split into two waves covering the pilots' school year (ARB-01, a working hypothesis pending confirmation, ESC-02); mid-year data reprise (ARB-02); a completed state machine (ARB-03); declared sessions without a timetable (ARB-04); a login identifier distinct from the contact number (ARB-07); a health record and case file kept per school (ARB-13); grading calculation rules (ARB-17); CNDP filings and security measures required before pilot activation (ARB-25). Three questions are escalated to the product owner: the DEC-27 horizon (ESC-01), the MVP scope extension (ESC-02), and the update to baseline v1.2 (ESC-03).

## 2. Baseline → PRD summary

- **RG-01 to RG-39**: 100% covered (matrix §3.1).
- **DEC-01 to DEC-36**: 100% covered, each carried by requirements tagged MVP/V1/V2+ (§3.2).
- **H-01 to H-22**: 100% addressed — statuses updated by research, corrections applied, tracked with follow-up actions in `prd/cross-cutting/40` (§3.3).
- **Q-01 to Q-17**: 100% covered; **C-01..C-11 / G-01..G-33**: covered except for three meta-IDs (§2.4).
- **Open questions**: 256 local `OQ`s mechanically consolidated in `prd/cross-cutting/40` §4.1 (71 resolved by `ARB`/`D` arbitrations, 41 escalated to the product owner `ESC-01..03`, 144 open by nature: pilot data, texts still to obtain, internal decisions).

### 2.4 Meta-IDs without a direct citation

| ID | Subject (baseline resolution) | PRD treatment |
|---|---|---|
| C-02 | Inconsistent example timelines → "single scenario set" | Resolution applied: the journeys in `prd/journeys/*` form the single scenario set (no conflicting timeline carried over) |
| C-05 | Undetermined data ownership → RG-27..RG-35 | Resolution covered through its rules (INV-18..25, `prd/modules/18`, `prd/cross-cutting/31`) |
| G-02 | Minors, accounts, majority → RG-01/RG-02, chapter 9 | Resolution covered through RG-01/RG-02/DEC-20 (`INV-36`, `INV-35`, `PJ-ELE-*`) |

## 3. Traceability matrices

File legend: `01/02/03` = root; `P00..P07` = `prd/journeys/00..07`; `F10..F23` = `prd/modules/10..23`; `T30..T41` = `prd/cross-cutting/30..41`.

### 3.1 RG-01 to RG-39

| ID | Carrying files | Requirements (sample) |
|---|---|---|
| RG-01 | 02, 03, F11, F12, F15, F22, P00, P06, P07 | BES-ELE-01, INV-36, PJ-ELE-01/02, FR-PED-14/17 |
| RG-02 | 02, 03, F13/F14/F16/F17/F22/F23, P00, P03, P06, P07, T30/T31/T36 | BES-ELE-05/07, INV-35, FR-VSC-04/15/20, FR-EVA-15/18 |
| RG-03 | 02, 03, F10, F20, P04, P05, T30, T34 | INV-13/31, FR-ADM-07, PJ-ENS-02, PJ-PAR-01/03 |
| RG-04 | 03, F10/F11/F14/F18/F20/F21, P00, P01, T37 | INV-01/43, FR-INS-06, FR-MAS-01 |
| RG-05 | 03, F10, F11, F21, P00/P01/P02/P04/P05, T31 | INV-02, FR-INS-06/07, SEC-06/08/14 |
| RG-06 | 03, F11, P00/P01/P02/P04, T31 | INV-03, FR-INS-09, SEC-08, PJ-SEC-01 |
| RG-07 | 03, F11, F21, P00/P02/P05/P07, T31 | INV-04, FR-INS-10, SEC-14, PJ-SEC-05 |
| RG-08 | 03, F11, F16, F18, P00/P01/P02/P07, T33, T37 | INV-05, FR-INS-14/15/21, PAK-04/08 |
| RG-09 | 03, F11, F14, F15, P00/P01/P02/P07, T37 | FR-INS-21, FR-EVA-13, FR-DOC-02, JAL-07 |
| RG-10 | 03, F10, F11, F18, P00/P01/P02, T37 | INV-06, FR-INS-05/15/24, FR-TRA-02/06/09 |
| RG-11 | 03, F11, F12, P00, P01 | INV-07, FR-INS-22/23, FR-PED-10/19 |
| RG-12 | 03, F11/F15/F16/F18, P00/P01/P02/P03/P07, T37, T39 | INV-08, FR-FIN-20/23/24, FR-TRA-05/06/10 |
| RG-12b | 02, 03, F11, F16, P00..P07, T30 | INV-13, FR-INS-08/11, PER-08 |
| RG-13 | 02, 03, F13/F16/F17/F20/F22, P00..P03, P05..P07, T34, T36 | INV-09, FR-VSC-04/06, FR-COM-05/11, CNF-17 |
| RG-14 | 02, 03, F11/F13/F15/F16/F18/F22, P00..P05, T30/T34/T36, T39 | INV-10, FR-INS-13, FR-DOC-08/12 |
| RG-14b | 03, F11/F15/F16/F17/F18, P00..P03, P05..P07, T30/T36, T39..T41 | INV-11, FR-INS-11/12/16, CNF-17/19 |
| RG-15 | 03, F11, F15, F22, P00..P03, P05, P06, T39, T41 | INV-12, FR-INS-11, PJ-GAR-01/02/04 |
| RG-16 | 03, F11, P00..P03, P05..P07, T30, T36, T39 | FR-INS-12/13, CNF-17/18, PJ-GAR-05, PJ-ELE-05 |
| RG-17 | 01, 02, 03, F19, P00, P04, T34 | INV-14, FR-CAR-01/03, PJ-ENS-01/02/10 |
| RG-18 | 03, F10, F12, F19, P00, P01, P04 | INV-15, FR-CAR-02/15, FR-PED-08, PJ-ENS-01/09 |
| RG-19 | 02, 03, F10/F12/F19/F22, P00, P03, P04, T34 | INV-16, FR-CAR-04/05, SEC-03 |
| RG-20 | 02, 03, F19, P04, T37 | FR-CAR-07/08, INV-29, PJ-ENS-08, JAL-18 |
| RG-21 | 02, 03, F10/F12/F17/F22, P00/P01/P04, T30/T31/T34/T37/T38 | INV-17, FR-ADM-01/04/17, SEC-07, PER-13 |
| RG-22 | 02, 03, F10/F12/F15/F16, P00, P01, P04, T34, T36, T38 | FR-ADM-03, FR-PED-01/02, FR-FIN-06, CNF-16 |
| RG-23 | 02, 03, F10, F18, F19, P00, P01, P04, T31, T37 | INV-19, FR-ADM-17, FR-TRA-01, FR-CAR-14 |
| RG-24 | 01, 02, 03, F10/F12/F14, P00, P01, T39 | FR-ADM-05, FR-PED-01/02, R-14 |
| RG-25 | 02, 03, F10/F12/F14/F16, P00/P01/P02, T37/T38/T41 | INV-42, FR-PED-07, KPI-18 |
| RG-26 | 03, F12, F14, P01 | INV-41, FR-PED-03/09, FR-EVA-02/07/08 |
| RG-27 | 03, F14, P04, P07 | FR-EVA-03, PJ-ENS-05, PJ-ELE-08 |
| RG-28 | 02, 03, F10/F13/F14/F15/F18, P00..P03, P05, P07, T31/T36/T37, T39 | INV-20, FR-EVA-15/18, FR-DOC-08/14 |
| RG-29 | 03, F13/F14/F15/F18/F23, P00/P01/P03/P05/P07, T39, T41 | INV-21, FR-VSC-14/17..20, FR-HEA-06 |
| RG-30 | 03, F13/F15/F18/F23, P00/P02/P05/P07, T30/T31/T36, T41 | INV-18/22/24, FR-TRA-01/03/04/07, SEC-10/16/18 |
| RG-31 | 03, F13/F15/F18/F23, P00..P03, P05, P07, T31/T36, T41 | INV-23, FR-VSC-14/19/20, FR-TRA-03/07/09 |
| RG-32 | 03, F12/F14/F15/F18, P00..P03, P05, P07, T41 | INV-25, FR-PED-07/19, FR-DOC-14, FR-TRA-11 |
| RG-33 | 02, 03, F14, F15, P00..P05, P07, T32, T37, T41 | INV-26, FR-EVA-15/16/17, FR-DOC-05/07/14 |
| RG-34 | 03, F15, F23, P07, T31, T32, T36 | INV-28, FR-DOC-14, FR-HEA-07, SEC-25, CNF-20/21 |
| RG-35 | 02, 03, F19, P00, P04, P07, T37 | INV-29, FR-CAR-08/10/16, PJ-ENS-08/09/10 |
| RG-36 | 02, 03, F19/F20/F23, P00, P03, P04, T30, T34 | INV-18/31, FR-RAP-02/04/05/09, PER-02 |
| RG-37 | 02, 03, F10/F16/F19/F20/F23, P00, P03, P04, T39 | INV-32, FR-ADM-07, FR-FIN-11/20, FR-HEA-03 |
| RG-38 | 02, 03, F10..F23, P00..P07, T30, T32, T34, T37..T39, T41 | INV-33, FR-ADM-16, FR-VSC-21, FR-COM-16, FR-RAP-10/13 |
| RG-39 | 02, 03, F10/F12/F13/F15..F17/F19/F20/F22/F23, P00/P01/P03/P04/P07, T30/T32/T34, T41 | INV-34, FR-VSC-01/08/13/19, FR-CAR-06 |

### 3.2 DEC-01 to DEC-36 (carrying files and implementation version)

| ID | Carrying files (sample) | Version |
|---|---|---|
| DEC-01 | 01, F12 | MVP (national); V1 (mission/international) |
| DEC-02 | 01, 03, F10, T30, T33 | MVP; V1 (organization) |
| DEC-03 | 01, 02, 03, F11 | MVP |
| DEC-04 | 01, 03, F11, F14, F21 | MVP |
| DEC-05 | 03, F19, T30 | MVP |
| DEC-06 | 03, F11, P00 | MVP; V1 (CANDIDATE/SUSPENDED/EXPELLED) |
| DEC-07 | 03, F18, T31, P00/P01/P07 | MVP |
| DEC-08 | 03, F18, T31, P00/P01/P07 | MVP |
| DEC-09 | 03, P01, T39 | MVP |
| DEC-10 | 03, F10..F15 et al. | MVP |
| DEC-11 | 03, F10/F11, T31 | MVP |
| DEC-12 | 01, 03, F12/F13/F17/F22, T32, T34 | MVP (limited); V1 (full rollout) |
| DEC-13 | 01, 03, F10, T33, P01, P05 | MVP |
| DEC-14 | 01, F19 | All versions (prohibited) |
| DEC-15 | 01, F12, T32/T34/T37, P00/P03/P04 | Cross-cutting framework |
| DEC-16 | 01, 03, F23, T31, T36 | V1 |
| DEC-17 | 03, F19, T30, P01 | MVP; V1 |
| DEC-18 | 03, F11/F12/F14, P03 | MVP |
| DEC-19 | 01, T33/T37/T38/T39 | V1 |
| DEC-20 | 02, 03, F11, T30, P00, P03 | V1 (BES); MVP (INV-35) — OQ divergence |
| DEC-21 | 01, 03, F11 | MVP; V2+ out of scope |
| DEC-22 | 03, F10/F15/F16/F17, T30/T31/T35/T36 | MVP; V1 |
| DEC-23 | 03, F10, T31/T33/T35/T36, P00/P01/P07 | MVP; V1 |
| DEC-24 | 02, 03, F11/F15/F16, T30/T34/T35/T36, P00/P01/P03/P07 | MVP |
| DEC-25 | 01, 02, F19, F20 | All versions (prohibited) |
| DEC-26 | 01, F17, T31/T32/T35/T36, T39 | MVP |
| DEC-27 | 01, T32/T33/T37/T38/T39 | V1; sized at 2.5× |
| DEC-28 | F10, F16, F17, T32/T33/T35/T37/T38/T39, P01 | MVP |
| DEC-29 | 01, F12, P07 | MVP (generic) |
| DEC-30 | 01, 03, F11/F14/F15/F16, T35/T36/T37, P01, P07 | V1 (advanced); V2 (qualified) |
| DEC-31 | 01, 02, 03, F11, F16, T33/T35/T37/T38/T39, P00/P01/P05 | V1 (Fatourati); V2 (card) |
| DEC-32 | 03, F10/F11/F15/F18, T32, P00/P01/P07 | MVP (PDF); V1 (QR link) |
| DEC-33 | 03, F19 | V1; network V2+ |
| DEC-34 | F17, T30, T34, P00, P03 | MVP (principle); V1 (threads) — OQ-01 COM |
| DEC-35 | F12, F14, F20, T32/T33/T37/T38, P00 | MVP |
| DEC-36 | F10/F11/F13/F17/F22, T31/T32/T33/T35, P00, P03 | MVP (attendance utility); V1 — baseline update to be carried |

### 3.3 H-01 to H-22 (status after research of 09/09/2026)

| ID | Status | PRD treatment |
|---|---|---|
| H-01 | Confirmed in substance | Figures corrected (01 §1.1, T33 §8) — correction #9 |
| H-02 | Confirmed | Default weightings versioned (FR-PED-05, FR-EVA-08) |
| H-03 | Confirmed in substance | Faithful exports by subject/semester (F21) |
| H-04 | Confirmed | No Massar automation (FR-MAS-13), file-based channel (INT-MAS) |
| H-05 | Not confirmed for now | Compliance built on the law in force, monitored (T40) |
| H-06 | Not confirmed as an obligation | Morocco hosting adopted (DEC-26, SEC-19) — correction #12 |
| H-07 | Confirmed | VAT by nature (FR-FIN-08) — DGI clarifications added |
| H-08 | Partially confirmed | UBL export prepared, activation pending the decree (FR-FIN-09, V2+) — correction #15 |
| H-09 | Confirmed and clarified | CMI switch + 7 acquirers (FR-FIN-10/15) — correction #7 |
| H-10 | Partially confirmed | ESISE mirror (FR-MAS-07..09, FR-RAP-11); fields to confirm with pilots |
| H-11 | Confirmed in substance | Mobile-first channels (T32, T34) — correction #10 |
| H-12 | Not verified | Dedicated pilot test (T40, R-02) |
| H-13 | Partially confirmed | Multi-affiliation + AREF tracking (FR-CAR-03/11..13) — correction #18 |
| H-14 | Resolved: Official Gazette No. 7485 of 23/02/2026 | Parent contract, Article 49 publicity, sanctions (CNF-10..16) — correction #2 |
| H-15 | Resolved: Deliberation 236-2015 in force | SEC-17/18, INT-EML |
| H-16 | Not verified | Requirements with no dependency on the order number (T40) |
| H-17 | Not verified | Monitoring + milestone tracking (T37 D-xx, T40) |
| H-18 | Confirmed and clarified | OCI 1 AZ + DR plan (SEC-19/20, INT-HEB) — correction #13 |
| H-19 | Partially resolved | Aggregator offer of 17/02/2026; pricing/contract still to obtain (INT-FAT, T40) |
| H-20 | Confirmed and clarified | Switch on 01/10/2026 + standalone rate card (INT-WAP-04/05) — correction #6 |
| H-21 | Partially resolved | Articles 171/209/236 confirmed; 180-186 still open (T40) — correction #5 |
| H-22 | Not verified | MOWAKABA as a conditional lever (PAK-15) — correction #20 |

### 3.4 Q-01 to Q-17

Covered: Q-01 (01, T33, T39), Q-02 (P07), Q-03 (01), Q-04 (F23, T36), Q-05 (F10, T36), Q-06 (F15, T36, T40), Q-07 (F19), Q-08 (T31, T35, T39), Q-09 (01, T33, T38), Q-10 (01, T33, T38), Q-11 (01), Q-12 (F15), Q-13 (01, T38), Q-14 (01), Q-15 (F15, F18), Q-16 (F19), Q-17 (F17).
