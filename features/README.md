# ZSchool acceptance features

This tree holds every Gherkin acceptance scenario extracted from the ZSchool
specification (`spec/`). It exists so the normative prose in `spec/behaviors/`,
`spec/journeys/`, and `spec/cross-cutting/` stays free of executable syntax —
each requirement links out to its scenario(s) here by tag, the way
`/Users/mohammadalmechkor/Projects/Perso/qadi/spec/` links `BEH-QD-NNN` out to
`.feature` files instead of embedding Gherkin inline.

## Layout

```
features/
├── <module-code>/          adm ins ped vsc eva doc fin com tra car rap mas san hea
│                            — one .feature file per Feature block extracted from
│                            spec/behaviors/, named <old-id>-<slug>.feature
├── cross-cutting/<ns>/     per sec nfr pak ux int cnf
│                            — scenarios extracted from spec/cross-cutting/
└── journeys/<persona>/     dir sec sur ens par gar ele
                             — end-to-end scenarios extracted from spec/journeys/
```

## Tagging convention

Every `Feature:` block carries at least:
- `@REQ-ZS-NNN` — the acceptance-scenario ID minted for that Feature block.
  Allocated per Feature block, not per requirement (a block that demonstrably
  covers more than one requirement gets tagged with every one of them).
- `@BEH-ZS-NNN` (or `@JNY-ZS-NNN` / cross-cutting equivalent) — every
  requirement ID the scenario proves, so `spec/traceability.md` §6 can be
  derived mechanically from these tags.
- A version tag: `@mvp`, `@v1`, or `@v2`, carried over from the source
  requirement's Version field.

`spec/scripts/verify-traceability.sh` check 5 fails the build if any
`@REQ-ZS-NNN` tag used here has no matching definition in
`spec/traceability.md` §6.

## What does not exist yet (claims of absence)

Following the pattern in qadi's `devtools-spec/` (register what's missing so
the gap can't silently rot): as of Phase 0 of the migration, this tree
contains **no scenario content yet** — extraction happens module by module in
Phase 2 (behaviors), Phase 3 (journeys), and Phase 4 (cross-cutting). Once
populated, see `support/README.md` for what's still deliberately absent from
the *runtime* side (step definitions, a test runner, CI wiring).
