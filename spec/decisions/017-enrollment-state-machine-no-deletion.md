# ADR-ZS-017: The enrollment state machine, and enrollments are never deleted

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-06

## Context

The original description gave two partial, inconsistent sets of enrollment statuses
in different sections, with no complete state machine and no explicit answer to
whether an enrollment record could simply be deleted. A school-records system that
allows deletion of an active enrollment history creates both a data-integrity risk
(orphaned grades, attendance, finance records) and, for a system meant to preserve a
student's history across schools, a direct contradiction of the product's founding
promise.

## Decision

The complete enrollment state machine (see `spec/domain-model.md` §3) governs every
enrollment. No enrollment that has ever been ACTIVE is ever deleted — it is closed
with a reason and a date instead. Only CANDIDATE or PRE-ENROLLED enrollments (which
never held live academic/financial data) may be cancelled outright.

## Consequences

**Positive**: guarantees every enrollment that ever mattered (had grades, attendance,
or payments attached) stays permanently reconstructable, which is the actual basis
for report-card reissuance, transfer history, and legal retention obligations.

**Negative**: the model has to carry every historical enrollment forever, including
closed and cancelled ones, which is more storage and more states application code
has to handle correctly than a delete-based model would need.

**Trade-off accepted**: permanent historical integrity over the simplicity of
allowing deletion — directly required by INV-ZS-060 and by the product's own "preserve
history" founding principle.
