# ADR-ZS-005: Official documents are never withheld for unpaid fees

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-24

## Context

Withholding a leaving certificate or report card until fees are paid is common
informal practice among Moroccan private schools, but it collides with the
ministry's own position, 2020 interim court orders, and a 28 May 2021 note (the
note's existence is reported in the press but was not itself locatable online during
research, and is flagged as such rather than cited as a primary source). A platform
that enforced document-blocking would be automating a practice regulators have
already pushed back against.

## Decision

ZSchool never blocks issuing a school-attendance certificate, a certificate of
departure, report cards, or transcripts for unpaid fees. Arrears are instead shown
as an alert on the file and summarized in an account statement handed to the parent
alongside any exit file. The school may condition only non-mandatory services
(transport, canteen, activities) on payment, and otherwise pursues collection through
reminders and, ultimately, legal action.

## Consequences

**Positive**: the platform can't be used to automate a practice that's already
legally contested, which matters both ethically and because ZSchool itself would
carry liability exposure for building the blocking feature schools might ask for.

**Negative**: schools that rely on document-withholding as collection leverage lose
that lever entirely and have to fall back on reminders and legal action, which is
slower and less certain.

**Trade-off accepted**: regulatory alignment over a feature some schools would
genuinely want, because building the blocking feature would put ZSchool itself on
the wrong side of the ministry's stated position.
