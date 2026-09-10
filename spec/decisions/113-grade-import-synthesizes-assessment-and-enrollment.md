# ADR-ZS-113: Grade import synthesizes a placeholder Assessment, and a COMPLETED Enrollment for historical rows

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (minted during a `/grill-with-docs` session on the two ambiguous terms and one closed-year tension blocking grades import)

## Context

`Mark` (a grade) is N—1 to `Assessment`, never attached directly to `Subject`
or `EvaluationPeriod` (spec/behaviors/05-assessments-grades-report-cards.md
§6, domain-model.md). A school importing grades has, by definition, not yet
used the platform's own assessment-entry feature — that's why it's importing
— so requiring a pre-existing, name-matched `Assessment` to attach each
imported row to would be circular. Separately, ADR-ZS-029 requires every
academic data item to be tied to an `Enrollment`, with no floating exception
— and [ADR-ZS-112](./112-historical-grades-archival-academic-year.md)'s
archival `AcademicYear` is, by construction, one a student never had a real
enrollment in.

## Decision

Grade import synthesizes one placeholder `Assessment` per (subject,
evaluation period, class/group), for both historical and current-term
imported grades — marked with an "imported" type and full weighting, honestly
representing "this row is the entirety of what's known for this period,"
never implying finer-grained test-by-test history that doesn't exist.

For historical rows specifically, import also synthesizes an `Enrollment` in
**`COMPLETED`** status in the archival `AcademicYear` (ADR-ZS-112) — never
`ACTIVE` or `PRE-ENROLLED` — carrying the class/level context the import row
declares. `COMPLETED` is used because the archival year is, by construction,
already finished: there is no live lifecycle progression to represent, only
a closed historical record.

## Consequences

**Positive**: grade import needs no pre-existing assessment library or prior
enrollment to function, matching the reality that a school importing data has
neither yet; `Mark`, `Enrollment`, and the schema's other structural
requirements (ADR-ZS-029) stay honestly satisfied rather than worked around
with nullable relationships or special-cased queries.

**Negative**: every synthesized `Assessment` and historical `Enrollment` is
data the import pipeline creates that no human ever directly requested — a
future report or audit trail has to be able to tell "this Assessment/Enrollment
was synthesized by import" apart from one a director or teacher actually
created, or risk confusing operators about what's real activity versus
import scaffolding.

**Trade-off accepted**: synthesized scaffolding entities over either blocking
grade import behind features that don't exist yet (a populated assessment
library, a real prior enrollment) or relaxing ADR-ZS-029's no-floating-data
guarantee for the one case that's inconvenient.
