# Requirement Identifier Scheme

> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-PROC-01                                                |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Effective                                                       |
> | Author         | ZSchool Product                                                |
> | Classification | Process Specification                                         |
> | Change History | 1.0 (2026-09-09): Initial release, adapted from qadi's `process/requirement-id-scheme.md` for Phase 0 of the PRD migration; status promoted from Draft to Effective in Phase 8, once every content phase confirmed the scheme in practice (CCR-ZS-001) |

Adapted from `/Users/mohammadalmechkor/Projects/Perso/qadi/spec/process/requirement-id-scheme.md` — same rigor, same permanence guarantees, a prefix table sized for a product specification rather than a library's public API.

---

## 1. Package Infix

All identifiers in this specification use the infix **`ZS`** (ZSchool).

The infix exists so a citation is never ambiguous about which project it
belongs to, and so that the pre-migration French/English PRD's own IDs
(`FR-FIN-03`, `PJ-SEC-01`, `ARB-07`, …) are never confused with their `ZS`
successors while both still appear side by side in `spec/process/id-migration-map.md`
and in historical citations under `spec/appendices/`.

## 2. Identifier Registry

| Prefix | Meaning | Defined in | Range |
| ------ | ------- | ---------- | ----- |
| `BEH-ZS-NNN` | Functional behavior requirement | `behaviors/NN-*.md` headings | 001– |
| `SCR-ZS-NNN` | Screen | `behaviors/NN-*.md` inline `### Screens` subsections, plus `cross-cutting/05-ux-ui-mobile-first-rtl.md` for the general-purpose UX screens | 001– |
| `INV-ZS-NNN` | Business/domain invariant (unifies the old `INV-NN` data-model invariants and `RG-NN` baseline business rules — both are properties that must always hold, one at the code level, one at the business-domain level) | `invariants.md` | 001– |
| `URS-ZS-NNN` | User requirement (persona need) | `urs.md` | 001– |
| `ADR-ZS-NNN` | Architecture/product decision (unifies the old `DEC-NN` baseline decisions, `ARB-NN` review arbitrations, and `ESC-NN` escalated questions — all three are decision records, just minted at different stages of the PRD's review history) | `decisions/NNN-*.md` | 001– |
| `JNY-ZS-NNN` | Journey step | `journeys/0N-*.md` headings | 001– |
| `JMP-ZS-NNN` | Critical end-to-end journey (map-level, epic altitude — distinct from `JNY-ZS`, the granular per-step level) | `journeys/00-journey-map.md` | 001– |
| `PER-ZS-NNN` | Permission rule | `cross-cutting/01-permissions.md` | 001– |
| `SEC-ZS-NNN` | Security requirement | `cross-cutting/02-security-privacy.md` | 001– |
| `NFR-ZS-NNN` | Non-functional requirement | `cross-cutting/03-non-functional-requirements.md` | 001– |
| `PAK-ZS-NNN` | Packaging/pricing requirement | `cross-cutting/04-business-model-packaging.md` | 001– |
| `UX-ZS-NNN` | UX requirement | `cross-cutting/05-ux-ui-mobile-first-rtl.md` | 001– |
| `INT-ZS-NNN` | External integration | `cross-cutting/06-external-integrations.md` | 001– |
| `CNF-ZS-NNN` | Legal/regulatory compliance requirement | `cross-cutting/07-legal-compliance-data-protection.md` | 001– |
| `RDM-ZS-NNN` | Roadmap milestone (renamed from the old `JAL-NN` — *jalons* — since that code was never declared opaque/stable in the PRD's own conventions, unlike module/persona/NFR-domain/integration-system codes) | `roadmap.md` | 001– |
| `KPI-ZS-NNN` | Success metric | `metrics.md` | 001– |
| `RSK-ZS-NNN` | Risk (renamed from the old bare `R-NN`, which was too generic to grep reliably) | `risks.md` | 001– |
| `OQ-ZS-NNN` | Open question (re-keyed from file-local `OQ-NN` numbering, which collided across ~37 owning files in the pre-migration PRD, into one global sequence) | `open-questions.md` | 001– |
| `REQ-ZS-NNN` | BDD-testable acceptance scenario | `features/**/*.feature` tags | 001– |
| `CCR-ZS-NNN` | Change Control Record | `README.md` Document History | 001– |
| `ZSCHOOL-*` | Document ID | Document Control headers | — |

Three ID families from the pre-migration PRD do **not** get a `ZS` successor:

- **`H-NN`, `G-NN`, `C-NN`, `Q-NN`** (baseline review-history records: verified
  hypotheses, resolved gray areas, resolved contradictions, resolved open
  questions) relocate unchanged, non-normative, to
  `appendices/01-review-history.md`. They are closed deliberation trail,
  already fully superseded by the `RG`/`DEC` outcomes that are now `INV-ZS`/
  `ADR-ZS`. Following qadi's own principle for `MOD-QD-NNN` — description is
  not the same as verification — these were never the normative artifact, so
  they don't need a live, permanent identifier going forward.
- **`D1`–`D10`** (informal README-level arbitration shorthand) get no
  identifier at all: each is already 1:1 aliased to the `ADR-ZS-NNN` that
  superseded it (a "historical alias" note in that ADR's Context section), so
  minting ten more numbers for already-fully-aliased content would be pure ID
  bloat.

## 3. A Discovery Made During Generation: `SCR-ZS` Has Two Owners

The plan this scheme implements originally described `SCR-ZS-NNN` as living
entirely inside each `behaviors/NN-*.md` file's inline Screens subsection.
Running `spec/scripts/generate-id-map.mjs` against the actual corpus surfaced
a second source: the pre-migration PRD's `ECR-UX-NN` series (9 screens, e.g.
onboarding/landing screens shared across modules) lives in
`prd/cross-cutting/34-ux-ui-mobile-first-rtl.md`, not in any one module. Both
series — `ECR-<MOD>-NN` (121 definitions, one block per module) and
`ECR-UX-NN` (9 definitions) — share one flat `SCR-ZS` sequence; the `ECR-UX`
block is owned by `cross-cutting/05-ux-ui-mobile-first-rtl.md` instead of a
`behaviors/` file. This is recorded here, not silently folded into the plan,
because the registry (§6) is the authoritative source of truth for where a
given `SCR-ZS-NNN` actually lives, and a reader following only the plan would
look in the wrong place for those 9.

## 4. Allocation Rules

```
REQUIREMENT: Identifiers are permanent. A withdrawn requirement retains its
             identifier and is marked "Withdrawn"; the number is never reused.
             Reuse would silently repoint every existing cross-reference and
             invalidate the traceability matrix.
```

```
REQUIREMENT: Identifiers are allocated contiguously within their series. Gaps
             are permitted only where an identifier has been withdrawn, and
             the withdrawal must be recorded.
```

```
REQUIREMENT: spec/process/id-migration-map.md is append-only once frozen at
             the end of Phase 0. A row is never edited or renumbered; a
             later-discovered old ID gets a new row.
```

```
RECOMMENDED: New identifiers minted after the migration (a requirement that
             did not exist in the pre-migration PRD) are allocated at the END
             of their series' current range, never inserted into a gap left
             for growth within an existing file's block.
```

**The block-size rule used by the generator** (see
`spec/scripts/generate-id-map.mjs` for the implementation): each owning file
gets a contiguous range sized `max(10, ceil(count / 10) * 10)`, allocated in
the pre-migration corpus's own file order for that prefix family — e.g.
`behaviors/07-finance-billing-collections.md` (30 `FR-FIN-*` requirements) got
a 30-slot range, `behaviors/09-transfers-mobility.md` (13 `FR-TRA-*`) got a
20-slot range (13 rounds up to 20 under this formula). This differs from
qadi's literal "blocks of eight" (qadi's files hold 4–8 requirements each;
ZSchool's hold 11–30), scaled to this corpus's actual density while keeping
qadi's underlying intent: headroom for later insertion without renumbering a
neighboring file.

## 5. Cross-Reference Obligations

Checked mechanically by `spec/scripts/verify-traceability.sh`:

1. Every subdirectory's `index.yaml` matches the files actually present, both
   directions (`behaviors/`, `journeys/`, `cross-cutting/`, `decisions/`,
   `research/`, `appendices/`, `process/`).
2. Every `INV-ZS-NNN` defined in `invariants.md` has a row in
   `traceability.md` §2.
3. Every `decisions/NNN-*.md` file maps to an `ADR-ZS-NNN` present in
   `traceability.md` §3.
4. Every requirement-family ID (`URS-ZS`, `NFR-ZS`, `PER-ZS`, `SEC-ZS`,
   `PAK-ZS`, `UX-ZS`, `INT-ZS`, `CNF-ZS`, …) is mentioned at least twice in
   its own owning file — once at its heading/definition, at least once more
   in that file's own traceability table. A requirement mentioned only once
   is a requirement nobody has to satisfy.
5. Every `@REQ-ZS-NNN` tag used in a `.feature` file under `features/` is
   defined in `traceability.md` §6.
6. No broken relative markdown link anywhere under `spec/`, gitignore-aware.
7. Every `SCR-ZS-NNN` cited in a behaviors file's Screens subsection (or in
   `cross-cutting/05`'s, per §3 above) appears in `traceability.md` §7.
8. **No legacy identifier pattern** (`FR-[A-Z]{3}-\d+`, `PJ-[A-Z]{3}-\d+`,
   bare `INV-\d+`, `RG-\d+`, `DEC-\d+`, `ARB-\d+`, `ESC-\d+`, `BES-`, bare
   `PER-\d+`, `ECR-`, `JAL-`, bare `KPI-\d+`, bare `R-\d+`, bare `OQ-\d+`)
   remains anywhere under `spec/` that a completed migration phase claims to
   have fully migrated. This is the primary regression gate for the
   in-place-reorganization decision: nothing may be left pointing at a dead ID.

## 6. Reference Syntax

Cross-references are relative markdown links whose text is the identifier:

```markdown
[INV-ZS-058](../invariants.md#inv-zs-058-...)
[ADR-ZS-024](../decisions/024-conditionable-services-policy.md)
```

The anchor is the heading's GitHub slug and is **not verified** by
`verify-traceability.sh` — the script checks the file resolves, never the
fragment (same limitation qadi's own script documents about itself).

Each `## BEH-ZS-NNN` heading carries a reference blockquote directly beneath:

```markdown
## BEH-ZS-137: Bill a canteen or childcare subscription monthly through the finance module

> **Invariant:** [INV-ZS-058](../invariants.md#inv-zs-058-...)
> **See:** [ADR-ZS-024](../decisions/024-conditionable-services-policy.md)
> **Priority:** Should
> **Version:** V2+
> **Acceptance:** [`@REQ-ZS-212`](../../features/san/san-07-canteen-subscription.feature)
```

Each invariant carries a `**Related**:` line pointing back at the requirements
and decisions that motivate it, so the graph is navigable in both directions.

## 7. Directory Registries

Every specification subdirectory contains an `index.yaml`:

```yaml
kind: behaviors
package: zschool
infix: ZS
entries:
  - id: "BEH-ZS-137"
    file: "07-finance-billing-collections.md"
    title: "Finance, Billing and Collections"
    status: "Effective"
    origin: "FR-FIN-01..30"
```

The `origin:` field is a deliberate extension beyond qadi's schema — qadi never
needed one, since nothing there was migrated from a prior ID scheme. It
records provenance for migration auditability and is ignored by
`verify-traceability.sh` (which only reads `file:`).

The registry is the authoritative list. A file present on disk but absent from
`index.yaml` — or the reverse — is a verification failure, exactly as in qadi.

---

_Next: [id-migration-map.md](./id-migration-map.md) · [Definitions of Done](./definitions-of-done.md)_
