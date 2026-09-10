# ADR-ZS-106: Onboarding import — staged batch, synchronous analyze, async idempotent commit with re-validation

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (minted during a `/grill-with-docs` session on MVP capability #1, school onboarding + academic structure)

## Context

BEH-ZS-006 requires the onboarding import to be a non-committal analysis,
followed by a downloadable line-by-line error report, followed by an explicit
commit — resumable, and "replayable without duplicates" (INV-ZS-054,
INV-ZS-055, INV-ZS-021, INV-ZS-090). `spec/behaviors/01-administration-
onboarding-subscription.md`'s screen states already list "analysis in
progress, report ready, commit in progress, import complete, import partially
committed," implying durable intermediate state and partial success, but the
spec doesn't fix a processing architecture. ADR-ZS-099 already fixes MVP
async processing in general (SQS queues, idempotent Effect workers), but not
which stage of import is synchronous vs. asynchronous, nor whether commit
trusts the original analysis or re-checks it.

## Decision

- Analysis persists as an `ImportBatch` entity — one row per uploaded
  workbook, holding a per-row status (creatable / strong-match / weak-match /
  error) — rather than being recomputed on every read.
- **Analyze runs synchronously** in the API request: pilot-scale workbooks
  (hundreds of rows) don't need async processing, and the wizard's error
  report is expected immediately after upload.
- **Commit runs asynchronously** via SQS idempotent workers (ADR-ZS-099), and
  **re-validates each staged row against the current database state** at
  commit time rather than trusting the (possibly stale) analysis snapshot —
  because a resumable flow can leave an arbitrary gap between analyze and
  commit, during which the underlying data can change (e.g. another admin
  creates a matching record).
- Commit supports **partial success**: rows that fail re-validation are
  marked and the batch moves to "import partially committed"; retrying only
  reprocesses the still-failed rows, never re-committing rows that already
  succeeded, preserving the "replayable without duplicates" invariant.

## Consequences

**Positive**: correctness is protected against races between analyze and
commit; retries are safe and cheap, since only the outstanding rows are
reprocessed rather than the whole batch.

**Negative**: commit-time re-validation means a row that looked "creatable"
at analysis time can still fail at commit — the UI has to surface that
discrepancy explicitly rather than treating the error report as the final
word on what will happen.

**Trade-off accepted**: an extra re-validation pass and more worker-side
branching, in exchange for a duplicate-proof import that stays safe to resume
across an arbitrarily long gap between analysis and commit.
