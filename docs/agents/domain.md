# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. In multi-context repos, also check `src/<context>/docs/adr/` for context-scoped decisions.
- **`spec/decisions/`** — this repo's existing numbered decision log (e.g. `spec/decisions/007-hosting-and-cross-border-transfer-morocco.md`). Treat these as this repo's ADRs until/unless they're migrated into `docs/adr/`.

If any of `CONTEXT.md`, `CONTEXT-MAP.md`, or `docs/adr/` don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (this repo's current layout):

```
/
├── AGENTS.md
├── CONTEXT.md            (created lazily by /domain-modeling)
├── docs/adr/              (created lazily by /domain-modeling)
├── spec/decisions/        ← existing numbered decision log
├── apps/
│   ├── api/
│   ├── web/
│   └── workers/
└── packages/
    ├── clients/
    ├── db/
    ├── domain/
    └── infra/
```

This is a pnpm workspace monorepo, but domain docs stay single-context: one `CONTEXT.md` at the root, not per-package. Revisit this if a package/app grows into its own bounded domain context with genuinely divergent vocabulary.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md` (or, until it exists, `spec/glossary.md`). Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing decision, surface it explicitly rather than silently overriding:

> _Contradicts spec/decisions/013-school-as-isolation-tenant.md — but worth reopening because…_
