# ADR-ZS-042: Corpus-wide traceability rebuild and source corrections

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-26

## Context

The review that produced this arbitration log found the PRD's own open-questions
register, README, and chapter-01 figures had drifted from their sources — unsourced
figures had crept into chapter 1, cross-references pointed at renumbered sections,
and the open-question register wasn't rebuilt from the chapters it was supposed to
summarize. Left uncorrected, these are exactly the kind of small inconsistencies
that erode trust in a document meant to be the authoritative baseline.

## Decision

A single consolidated open-question register was rebuilt from every chapter's own
open questions, with status, owner, and deadline tracked per item; the README was
recounted; chapter 1's figures were reconciled against `research/`, removing
unsourced numbers; every research file was required to carry a reference per fact;
the glossary's cross-references were corrected and several missing terms added; a
single consistent example scenario set (named students, one per school) replaced
several inconsistent example sets; every Gherkin scenario was required to carry a
version tag, and every Must/MVP requirement at least one scenario.

## Consequences

**Positive**: the corpus is now internally consistent and auditable — every figure
traces to a source, every cross-reference resolves, and the open-question register
is a real, rebuilt artifact rather than stale copy.

**Negative**: this was a genuinely large mechanical correction pass across the
entire PRD, not a localized fix — a meaningful share of the review's total effort.

**Trade-off accepted**: doing the corpus-wide correction pass once, thoroughly,
over leaving smaller inconsistencies to be found piecemeal later, when they would
be more expensive to trace back to their root cause.
