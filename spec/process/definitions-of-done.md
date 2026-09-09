# Definitions of Done

> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-PROC-02                                                |
> | Revision       | 0.1                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Draft                                                          |
> | Author         | ZSchool Product                                                |
> | Classification | Process Specification                                         |
> | Change History | 0.1 (2026-09-09): Placeholder created in Phase 0 so `requirement-id-scheme.md`'s forward reference resolves; finalized in Phase 8 (CCR-ZS-001) |

**Draft placeholder.** This document is finalized in Phase 8 of the migration
described in `/Users/mohammadalmechkor/.claude/plans/snappy-percolating-lecun.md`,
once every content phase has landed and the merge-gate steps this checklist
governs are known in full. Until then, the one gate that already applies to
every phase of the migration itself is recorded below.

## Migration merge gate (applies from Phase 0 onward)

| # | Step | Command |
|---|---|---|
| 1 | Structural verification | `bash spec/scripts/verify-traceability.sh` shows zero `FAIL` for every check applicable to what exists so far. |
| 2 | Commit | Each phase's changes are committed before the next phase starts, so the migration stays reversible via git history (see `spec/appendices/00-project-baseline.md` for why this matters — there was no git history before this migration began). |

The full Definition of Done — covering `spec/` content quality, `features/`
scenario completeness, and the final `--strict` gate — is written in Phase 8,
once `spec/traceability.md` exists to reference.

---

_Next: [Requirement Identifier Scheme](./requirement-id-scheme.md) · [id-migration-map.md](./id-migration-map.md)_
