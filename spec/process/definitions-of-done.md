# Definitions of Done

> **Document Control**
>
> | Property       | Value                                                                                                                                                    |
> | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-PROC-02                                                                                                                                          |
> | Revision       | 1.0                                                                                                                                                      |
> | Effective Date | 2026-09-09                                                                                                                                               |
> | Status         | Effective                                                                                                                                                |
> | Author         | ZSchool Product                                                                                                                                          |
> | Classification | Process Specification                                                                                                                                    |
> | Change History | 0.1 (2026-09-09): Placeholder created in Phase 0. 1.0 (2026-09-09): Finalized in Phase 8, once `spec/traceability.md` existed to reference (CCR-ZS-001). |

This is ZSchool's merge gate: what must be true before a change to `spec/` or
`features/` is considered done. It has two parts — a small set of steps that
already applied throughout the qadi-style migration itself, and the broader
set that governs ordinary spec changes from here on.

## 1. Structural gate (every change, no exceptions)

| # | Step                    | Command / check                                                                                                                                                                                                                                                                                                                                            |
| - | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Structural verification | `bash spec/scripts/verify-traceability.sh --strict` shows zero `FAIL` and zero `SKIP`.                                                                                                                                                                                                                                                                     |
| 2 | No legacy identifiers   | Covered by step 1 (check 8) — no `FR-<MOD>-NN`, `PJ-<PERS>-NN`, bare `INV-NN`, `RG-NN`, `DEC-NN`, `ARB-NN`, `ESC-NN`, `BES-<PERS>-NN`, bare `PER-NN`, `ECR-<MOD>-NN`, `JAL-NN`, bare `KPI-NN`, bare `R-NN`, or bare `OQ-NN` outside `process/` or `appendices/`.                                                                                           |
| 3 | Registry consistency    | Every `index.yaml` matches its directory's actual files, both directions (check 1).                                                                                                                                                                                                                                                                        |
| 4 | No broken links         | Every relative markdown link under `spec/` resolves to a real, non-gitignored file (check 6).                                                                                                                                                                                                                                                              |
| 5 | Commit                  | The change is committed, with a message that names which requirement family/file(s) changed and why. Never batch unrelated changes into one commit — this repo's git history is the only safety net it has (see `spec/appendices/00-project-baseline.md`'s Change History for why that matters: there was no git history before the 2026-09-09 migration). |

## 2. Per-change checklist, by what changed

**New or edited `BEH-ZS`/`URS-ZS`/`INV-ZS`/`PER-ZS`/`SEC-ZS`/`NFR-ZS`/`PAK-ZS`/`UX-ZS`/`INT-ZS`/`CNF-ZS` requirement:**

- ID minted via the next available number in that family's sequence (never reused, never renumbered) — see `requirement-id-scheme.md` §2.
- Appears at least twice in its owning file (heading + a summary-table row or a `Related`/cross-reference mention) — this is what check 4 (self-traceability) verifies.
- If it's a `BEH-ZS`: has a `REQUIREMENT: ... MUST/SHOULD ...` block and, where the requirement is Must+MVP, an `@REQ-ZS-NNN`-tagged Gherkin scenario in `features/`.
- `index.yaml` entry added/updated for the owning file.
- `spec/traceability.md` updated (the relevant section: §1 for behaviors, §2 for invariants, §4 for URS, §7 for cross-cutting).

**New or edited `ADR-ZS` decision:**

- One file, `decisions/NNN-slug.md`, in the qadi ADR shape (Context/Decision/Consequences).
- `decisions/index.yaml` entry added.
- `spec/traceability.md` §3 updated.
- If it supersedes or narrows an earlier decision, say so explicitly in the `Status` line (matching qadi's own qualified-status pattern, e.g. "Accepted — narrows ADR-ZS-024") rather than leaving the earlier ADR looking still fully in force.

**New or edited `.feature` file:**

- One file per `Feature:` block, tagged `@REQ-ZS-NNN` plus every `BEH-ZS-NNN`/`PER-ZS-NNN`/etc. it covers.
- `REQ-ZS-NNN` is a genuinely new number (check `grep -rhoE '@REQ-ZS-[0-9]+' features/ | sort -V | tail -1` for the current ceiling) — never reused.
- The tag is added to `spec/traceability.md` §6.
- No step-definition, layer, or fixture code is fabricated alongside it — `features/support/README.md`'s "claims of absence" table stays accurate (no test runner is wired up yet; see `spec/decisions/088-effect-cucumber-vitest-as-bdd-runner.md` for the intended one).

**New open question:**

- Added to `spec/open-questions.md` with the next `OQ-ZS-NNN` in sequence, not a bare `OQ-NN` (that numbering scheme is retired — it collided across files in the old PRD, which is exactly what this migration fixed).

## 3. What "done" excludes

This spec has no source code, no CI pipeline, and no test runner wired up as
of 2026-09-09 (`STACK.md`/`spec/stack.md` describes the intended stack;
`spec/decisions/081`-`104` record the real architecture decisions already
made; none of it is implemented yet). Consequently this Definition of Done
does NOT cover, and must not be read as implicitly claiming:

- Code coverage or mutation-testing thresholds (qadi's own DoD has these;
  this spec's `traceability.md` §9 explains why none are set yet).
- CI-green status — there is no CI.
- Runtime behavior of any kind — every `REQUIREMENT: MUST` statement is a
  specification, not yet a verified fact about running software.

## 4. Coverage policy

Every Must-priority, MVP-tagged `BEH-ZS` requirement should carry at least
one `@REQ-ZS-NNN` Gherkin scenario. This mirrors the old PRD's own rule
(`00-conventions.md` §3, superseded by this document) and was verified true
of the old corpus before migration; it has not been re-verified as a
standing invariant of the new `behaviors/`/`features/` trees by an automated
check — `verify-traceability.sh` checks that every _existing_ `@REQ-ZS-NNN`
tag is defined in `traceability.md` (coverage-is-consistent), not that every
Must+MVP behavior _has_ one (coverage-is-complete). Adding that check is a
natural extension of `scripts/verify-traceability.sh`, not yet built.

---

_Next: [Requirement Identifier Scheme](./requirement-id-scheme.md) · [id-migration-map.md](./id-migration-map.md)_
