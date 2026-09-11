> **Document Control**
>
> | Property       | Value                              |
> | -------------- | ---------------------------------- |
> | Document ID    | ZSCHOOL-00                         |
> | Revision       | 1.0                                |
> | Effective Date | 2026-09-09                         |
> | Status         | Effective                          |
> | Author         | ZSchool Product                    |
> | Classification | Master Index                       |
> | Change History | See §6, "Document history," below. |

# ZSchool Specification

ZSchool is a multi-tenant SaaS product for Moroccan private schools: enrollment,
attendance, assessments, finance, communication, transfers, teacher careers,
dashboards, Massar regulatory exports, and (V2+) ancillary services and health
records. This is its specification, following the methodology used by
`qadi` (`~/Projects/Perso/qadi/spec/`): every requirement carries a permanent,
opaque ID; every directory has an `index.yaml` registry that must match disk;
`scripts/verify-traceability.sh` proves the whole graph is consistent;
decisions live as individual ADR files; Gherkin acceptance scenarios live
outside the spec, in `features/`, linked only by tag.

This spec supersedes an earlier, less structured PRD (`prd/`, removed at
migration cutover — see `spec/appendices/00-project-baseline.md` and
`spec/appendices/01-review-history.md` for that history). The migration that
produced this tree is documented in full in
`/Users/mohammadalmechkor/.claude/plans/snappy-percolating-lecun.md`.

## 1. Why this spec exists

| Problem with the prior PRD                                                                                                                              | Now prevented by                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| No machine-checkable link integrity — a dangling old-scheme requirement reference could sit unnoticed for months                                        | `scripts/verify-traceability.sh` check 6 (broken relative links) and check 1 (registry↔disk)                                              |
| The old open-question numbering meant a different question in each of ~20 chapters — file-local numbering that collided by design                       | Every requirement family (`OQ-ZS`, `BEH-ZS`, `INV-ZS`, …) is a single global, permanent sequence — see `process/requirement-id-scheme.md` |
| No way to tell whether a chapter's Gherkin coverage regressed silently                                                                                  | `features -> traceability` (check 5): every `@REQ-ZS-NNN` tag used anywhere in `features/` must be defined in `traceability.md`           |
| Review decisions (`DEC-`), arbitrations (`ARB-`), and escalations (`ESC-`) were three separate, table-driven logs for what is really one kind of record | Unified into one `decisions/` ADR log, one file per decision, `ADR-ZS-NNN`                                                                |
| A business rule (`RG-`) and a data-model invariant (`INV-`) describing the same constraint lived in two different documents with no cross-link          | Unified into one `invariants.md`, `INV-ZS-NNN`                                                                                            |
| Nothing distinguished "we described this" from "this is verified"                                                                                       | Behaviors/invariants/decisions/acceptance-scenarios are the normative layer; `appendices/` is explicitly non-normative historical record  |

## 2. Identifier scheme

Project infix: **`ZS`**. Full rulebook: `process/requirement-id-scheme.md`.
The generated, hand-reviewed old→new crosswalk from the prior PRD: `process/id-migration-map.md`
(1,333 rows, permanent, append-only).

| Prefix                         | Meaning                                          | Owning location                                                                  | Count |
| ------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------- | ----- |
| `BEH-ZS-NNN`                   | Functional behavior                              | `behaviors/01..14-*.md`                                                          | 258   |
| `URS-ZS-NNN`                   | User (persona) requirement                       | `urs.md`                                                                         | 58    |
| `INV-ZS-NNN`                   | Invariant (data-model or business-rule altitude) | `invariants.md`                                                                  | 86    |
| `ADR-ZS-NNN`                   | Decision record (unifies old DEC/ARB/ESC)        | `decisions/NNN-*.md`                                                             | 89    |
| `JNY-ZS-NNN`                   | Persona journey step                             | `journeys/01..07-*.md`                                                           | 66    |
| `JMP-ZS-NNN`                   | Critical end-to-end journey (map level)          | `journeys/00-journey-map.md`                                                     | 11    |
| `PER-ZS-NNN`                   | Permission rule                                  | `cross-cutting/01-permissions.md`                                                | 19    |
| `SEC-ZS-NNN`                   | Security requirement                             | `cross-cutting/02-security-privacy.md`                                           | 28    |
| `NFR-ZS-NNN`                   | Non-functional requirement                       | `cross-cutting/03-non-functional-requirements.md`                                | 50    |
| `PAK-ZS-NNN`                   | Packaging/business-model requirement             | `cross-cutting/04-business-model-packaging.md`                                   | 17    |
| `UX-ZS-NNN`                    | UX requirement                                   | `cross-cutting/05-ux-ui-mobile-first-rtl.md`                                     | 17    |
| `INT-ZS-NNN`                   | External-integration requirement                 | `cross-cutting/06-external-integrations.md`                                      | 45    |
| `CNF-ZS-NNN`                   | Legal-compliance requirement                     | `cross-cutting/07-legal-compliance-data-protection.md`                           | 27    |
| `RDM-ZS-NNN`                   | Roadmap milestone                                | `roadmap.md`                                                                     | 24    |
| `KPI-ZS-NNN`                   | Success metric                                   | `metrics.md`                                                                     | 46    |
| `RSK-ZS-NNN`                   | Risk                                             | `risks.md`                                                                       | 28    |
| `SCR-ZS-NNN`                   | Screen                                           | inline `### Screens` subsection of the owning `behaviors/`/`cross-cutting/` file | 130   |
| `OQ-ZS-NNN`                    | Open question                                    | `open-questions.md`                                                              | 265   |
| `REQ-ZS-NNN`                   | Acceptance scenario (Gherkin `Feature:` block)   | `features/**/*.feature`, tags                                                    | 308   |
| `CCR-ZS-NNN`                   | Change control record                            | Document Control "Change History" fields, §6 below                               | —     |
| `H-`/`G-`/`C-`/`Q-`/`D1`-`D10` | Historical review artifacts                      | `appendices/01-review-history.md`, **unrenumbered, non-normative**               | —     |

Module codes (ADM, INS, PED, VSC, EVA, DOC, FIN, COM, TRA, CAR, RAP, MAS, SAN,
HEA), persona codes (DIR, SEC, SUR, ENS, PAR, GAR, ELE), NFR domain codes, and
integration system codes are kept unchanged — already opaque, stable
identifiers in the prior PRD, not worth renumbering.

## 3. Directory map

```
spec/
├── README.md              this file
├── overview.md            vision, Moroccan context, value proposition
├── domain-model.md        entity dictionary, enrollment state machine, domain events
├── glossary.md            trilingual (FR/AR/EN) terminology reference
├── invariants.md          INV-ZS — properties that must always hold
├── urs.md                 URS-ZS — persona needs
├── traceability.md        the 9-section cross-reference capstone
├── roadmap.md             RDM-ZS — delivery milestones
├── metrics.md             KPI-ZS — success metrics
├── risks.md                RSK-ZS — risks and mitigations
├── open-questions.md      OQ-ZS — the consolidated open-question register
├── stack.md               technical architecture summary
├── behaviors/             BEH-ZS — one file per functional module (14)
├── journeys/               JNY-ZS/JMP-ZS — one file per persona + the map (8)
├── cross-cutting/          PER/SEC/NFR/PAK/UX/INT/CNF-ZS — one file per chapter (7)
├── decisions/               ADR-ZS — one file per decision (89)
├── research/                 web-research reference notes, non-normative but factual (6)
├── appendices/                frozen historical record: the old baseline + review history (2)
├── process/                    the ID scheme, definitions of done, the migration map (3)
└── scripts/                     verify-traceability.sh, generate-id-map.mjs

features/
├── README.md               tagging convention; states plainly that no test runner is wired up yet
├── <mod>/                  *.feature per BEH-ZS-owning module (14 dirs)
├── cross-cutting/<code>/   *.feature per PER/SEC/NFR/PAK/UX/INT/CNF chapter (7 dirs)
├── journeys/<persona>/     *.feature per persona journey (8 dirs)
└── support/README.md       "claims of absence" — no step defs/layers/fixtures exist yet
```

## 4. Reading order

**New to the spec** — start broad, then narrow: `overview.md` → `domain-model.md`
→ `glossary.md` → `urs.md` → pick one `behaviors/` chapter relevant to what
you're building → its matching `features/<mod>/` scenarios.

**Reviewing a change** — start from what must stay true: `invariants.md` →
`traceability.md` → `process/definitions-of-done.md` → run
`bash scripts/verify-traceability.sh --strict`.

**Tracing a decision** — `decisions/index.yaml` for the full list, or grep
`traceability.md` §3 for what cites a given `ADR-ZS-NNN`.

**Looking for "why does the old PRD say X"** — `appendices/00-project-baseline.md`
(the frozen original) and `appendices/01-review-history.md` (the resolved
contradictions/gray-areas/hypotheses that produced today's invariants and
decisions).

## 5. Verification

```
bash spec/scripts/verify-traceability.sh            # everyday check
bash spec/scripts/verify-traceability.sh --strict    # merge gate: SKIP counts as FAIL
```

Current state: **50 PASS / 0 FAIL / 8 SKIP** (non-strict). The 8 remaining
`SKIP`s are structural, not gaps: `journeys/00-journey-map.md` legitimately
has no `JNY-ZS` (only `JMP-ZS`), and each of the 7 persona files legitimately
has no `JMP-ZS` (only `JNY-ZS`) — each file owns exactly one of the two
journey-ID families, never both.

See `process/definitions-of-done.md` for the full merge-gate checklist.

## 6. Document history

| CCR        | Date       | Description                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CCR-ZS-001 | 2026-09-09 | The qadi-style migration itself: Phase 0 (scaffolding + ID map) through Phase 8 (this README). Every file's own Document Control "Change History" cites this CCR for its individual migration.                                                                                                                                                                                                                      |
| CCR-ZS-002 | 2026-09-09 | Resolved the [ADR-ZS-091](decisions/091-eu-hosting-deviation-from-morocco-baseline.md) hosting escalation: product-owner sign-off accepted AWS `eu-central-1`/`eu-west-3` over the original Morocco/OCI baseline. Propagated through SEC-ZS-024/025/026, INT-ZS-036/037/039/040, NFR-ZS-009/010, RSK-ZS-011, OQ-ZS-372, `spec/stack.md`, `spec/traceability.md`, and `spec/roadmap.md`'s RDM-ZS-004/013 milestones. |

Prior history (the PRD this spec supersedes: French→English translation,
critical review, arbitrations) is preserved in `appendices/01-review-history.md`
and is not repeated here — that history predates this spec's own ID scheme
and document-control convention.
