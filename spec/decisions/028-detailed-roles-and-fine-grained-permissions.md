# ADR-ZS-028: Detailed school roles with fine-grained, logged permissions

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-17

## Context

The original description treated "Administration" as a single undifferentiated
role, while real Moroccan school offices split responsibilities across roughly
fifteen distinct functions (front office, accounting, student life, academic
leadership, and more), each of which should see and touch only its own slice of
data — a single "Administration" role would either over-grant access broadly or
force every school into a one-size-fits-all permission set that fits none of them
well.

## Decision

School roles are modeled with fine-grained permissions (chapter 8: read/write per
module and per scope — class, level, whole school), with editable role templates
provided by ZSchool, and every write action and every sensitive-data read logged
with the author, context, and timestamp.

## Consequences

**Positive**: matches how Moroccan school offices actually divide labor, and
enforces least-privilege access rather than an all-or-nothing "Administration"
grant.

**Negative**: a meaningfully larger permission surface to design, test, and keep
consistent across every module than a single coarse role would need.

**Trade-off accepted**: permission granularity and auditability over the
implementation simplicity of a single broad administrative role — required both by
real office structure and by INV-ZS-090/INV-ZS-091's logging and least-privilege principles.
