# ZSchool PRD — Drafting Conventions

| Field | Value |
|---|---|
| Version | 1.2 — English translation (2026-09-09); `ARB` and `ESC` namespaces added by the 09/09/2026 review |
| Date | 2026-09-09 |
| Status | Normative annex of the PRD — applies to every file under `prd/**/*.md` |
| Source document | `PROJECT.md` v1.2 (English edition) (validated baseline, **not editable** by drafting agents) |

---

## 1. General rules

1. **Language**: English for all PRD documentation. Arabic terms are given in Arabic script and French terms are set in italics where they name a specific legal or official concept (Moroccan law, Massar, institutional names), each with an English gloss. Terminology follows the glossary in `PROJECT.md` §17 and in `prd/cross-cutting/41-glossary.md`. Product terminology note: the product's own user interface remains French/Arabic bilingual per DEC-10 — that is a product requirement, not a documentation-language rule, and stays untouched by this convention.
2. **Baseline**: `PROJECT.md` is authoritative. No requirement may contradict it. Any ambiguity not resolved by the baseline is recorded in the chapter's "Open questions" section (ID `OQ-NN`), never settled unilaterally.
3. **No code, no visual mockups**: screens are described in text (zones, elements, states, FR/AR behavior).
4. **Figures and external claims**: sourced only from `prd/research/*.md` or from `PROJECT.md`, with a source reference. Inventing prices, dates, or statutory text is forbidden.
5. **Scope by version**: every requirement carries an MVP / V1 / V2+ tag consistent with `PROJECT.md` §12. No capability outside chapter 12 moves into MVP without explicit justification and a note in "Open questions".
6. **File naming**: ASCII, no accents, numeric ordering prefix; English descriptive slug.
7. **Mandatory header** for every file: title, version (`0.1 — draft`, then `0.2 — revised (review of 09/09/2026)` after arbitrations were applied, then `0.3 — English translation (09/09/2026)` under this pass), date (2026-09-09), status, sources (`PROJECT.md §…`), related files.

## 2. Identification scheme (exclusive namespaces)

| Domain | Prefix | Example | File owner |
|---|---|---|---|
| Functional requirements | `FR-<MOD>-NN` | `FR-FIN-01` | `prd/modules/*` |
| Data-model invariants | `INV-NN` | `INV-03` | `prd/03-domain-data-model.md` |
| Persona needs | `BES-<PERS>-NN` | `BES-PAR-02` | `prd/02-actors-personas.md` |
| Journey steps | `PJ-<PERS>-NN` | `PJ-DIR-01` | `prd/journeys/*` |
| Permission rules | `PER-NN` | `PER-04` | `prd/cross-cutting/30-*` |
| Security | `SEC-NN` | `SEC-11` | `prd/cross-cutting/31-*` |
| Non-functional | `NFR-<DOM>-NN` | `NFR-PERF-01` | `prd/cross-cutting/32-*` |
| Packaging | `PAK-NN` | `PAK-02` | `prd/cross-cutting/33-*` |
| UX | `UX-NN` | `UX-07` | `prd/cross-cutting/34-*` |
| Integrations | `INT-<SYS>-NN` | `INT-FAT-01` | `prd/cross-cutting/35-*` |
| Legal compliance | `CNF-NN` | `CNF-05` | `prd/cross-cutting/36-*` |
| Roadmap milestones | `JAL-NN` | `JAL-03` | `prd/cross-cutting/37-*` |
| Metrics | `KPI-NN` | `KPI-08` | `prd/cross-cutting/38-*` |
| Risks | `R-NN` | `R-06` | `prd/cross-cutting/39-*` |
| New open questions | `OQ-NN` | `OQ-01` | owning file |
| Screens | `ECR-<MOD>-NN` | `ECR-FIN-01` | module chapters |
| Review arbitrations | `ARB-NN` | `ARB-07` | `prd/cross-cutting/42-*` |
| Questions escalated to the product owner | `ESC-NN` | `ESC-01` | `prd/cross-cutting/42-*` |

**Stability note.** Module codes, persona codes, NFR domain codes, and integration codes below are kept exactly as originally allocated in the French draft and are **not translated**: several were derived from French words (for example `INS` from *inscriptions*, "enrollment"; `VSC` from *vie scolaire*, "student life"; `PED` from *pédagogique*, "academic"; `CAR` used for both "career" and "card/carte" in different namespaces). They are now opaque, stable identifiers — renaming them would require rewriting every cross-reference across the entire corpus for no benefit, so this English edition (2026-09-09) keeps them unchanged for referential stability, exactly as `FR-INS-01` or `PJ-DIR-01` remain valid identifiers regardless of documentation language.

Module codes (`<MOD>`), allocated once: `ADM` (administration/onboarding), `INS` (admissions/enrollment), `PED` (academic structure/timetable), `VSC` (attendance/student life/discipline), `EVA` (assessments/grades/report cards), `DOC` (documents/certificates), `FIN` (finance), `COM` (communication), `TRA` (transfers), `CAR` (teacher career), `RAP` (reporting), `MAS` (Massar/exports), `SAN` (ancillary services), `HEA` (health), `PRT` (parent/student portals, within journeys and existing modules).

Personas (`<PERS>`): `DIR` director, `SEC` secretary-cashier, `SUR` head supervisor, `ENS` teacher, `PAR` multi-school parent, `GAR` custodial mother/guardian, `ELE` students.

NFR `<DOM>`: `PERF`, `DISP`, `I18N`, `MOB`, `OFF`, `DOC`, `OBS`, `INT`, `SAV`, `RES`.

Integrations `<SYS>`: `MAS` (Massar), `FAT` (Fatourati/CMI), `CAR` (card/NAPS/Chari), `SMS`, `WAP` (WhatsApp), `SIG` (electronic signature), `HEB` (hosting), `EML` (e-mail).

## 3. Format of a functional requirement

```markdown
### FR-<MOD>-NN — <short imperative title>

| Attribute | Value |
|---|---|
| Description | <expected observable behavior, without implementation design> |
| Priority | Must / Should / Could |
| Version | MVP / V1 / V2+ |
| Traceability | RG-xx, DEC-xx, H-xx, G-xx, C-xx, Q-xx (as applicable) |
| Actors | <roles concerned> |

**Acceptance criteria (critical flows, Gherkin format)** — at least for the major flows:

```gherkin
Feature: …
  Scenario: …
    Given …
    When …
    Then …
```
```

Cross-cutting chapters adapt the template (NFR, SEC, CNF, INT…) while keeping the attribute table and the traceability section.

## 4. Template for module chapters (`prd/modules/`)

1. `## 1. Objective and scope` (explicit in/out, version)
2. `## 2. Users and use cases`
3. `## 3. Key journeys` (references to `PJ-…` in `prd/journeys/`, without duplicating)
4. `## 4. Functional requirements` (FR-…)
5. `## 5. Morocco specifics` (where relevant)
6. `## 6. Data and events` (entities from `PROJECT.md` §6.10 involved, notifiable events)
7. `## 7. Key screens` (ECR-… : text description FR/AR, mobile-first)
8. `## 8. Integrations` (references to INT-…, without duplicating `35-*`)
9. `## 9. Requirement-specific non-functional needs` (references to NFR-…)
10. `## 10. Success metrics` (KPI-… where dedicated)
11. `## 11. Open questions` (OQ-…)
12. `## 12. Traceability`

## 5. Traceability

- Every requirement that implements a baseline rule or decision cites the baseline IDs: `(→ RG-08, DEC-21)`.
- Every file ends with a `## Traceability` section: a table mapping baseline IDs to the requirements in that file which cover them.
- The consolidated matrix is generated in `prd/README.md` after review.

## 6. Prohibited actions

- Editing `PROJECT.md`, `prd/00-conventions.md`, or another agent's files.
- Duplicating long passages of the baseline verbatim: summarize, structure, and refine instead.
- French or other non-English prose outside the italicized-term exception above, code, image mockups, emojis, unsourced marketing claims.
- Creating files not listed in the plan in `prd/README.md` (the chapter `prd/cross-cutting/42-review-arbitrations.md` is listed there).
