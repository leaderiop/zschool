# ADR-ZS-061: Finance rules — split payments, cancellations, proration, statements, signatures

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-20, historical alias: D2

## Context

Finance touches nearly every other module (enrollment, transfers, documents,
communication) and had the largest number of underspecified rules in the original
review: how family payments split across siblings, how a mistaken payment or
receipt gets corrected, how a started month is billed on arrival or departure, who
receives an account statement, which signatures certain documents require, and
terminology inconsistency between "certificate of enrollment" and "school
attendance certificate." D2 (unpaid-fee debt on transfer stays with the originating
school) is the same finance-continuity concern this arbitration resolves and is
folded in here rather than tracked separately.

## Decision

Nine rules: (a) a `Payment` may split across several `FinancialAccount`s for
siblings, with one `Receipt` listing every child and installment covered. (b) A
new MVP requirement handles cancelling a payment or receipt via a logged
counter-entry (reason, approval, original number preserved, a numbered cancellation
receipt). (c) A started month is due in full by default (an optional daily-
proration setting exists), applying to arrivals, departures, and transfers; a
transferred student's usage is counted once, at the originating school, in the
transfer month. (d) Re-enrollment is never a conditionable service (CNF-ZS-016
governs). (e) An account statement goes only to the financial guardian; an exit
file to another guardian excludes financial information. (f) A certificate of
departure is signed by the legal tutor or the adult student; a certificate of
enrollment is self-service for the custodial guardian and any legal guardian. (g)
"Certificate of enrollment" becomes the single term, replacing "school attendance
certificate." (h) The parent contract is signed by the legal guardian and, where
distinct, countersigned by the financial guardian. (i) Postal mail moves to V1.

## Consequences

**Positive**: resolves nine genuinely underspecified finance behaviors that would
otherwise each be improvised inconsistently by whoever implements them, and folds
in D2's balance-on-transfer rule as part of the same coherent finance-continuity
picture rather than as a separate, disconnected note.

**Negative**: finance now carries nine distinct rules on top of its already
significant scope (fee schedules, collections, reminders), several of which (split
payments, cancellation counter-entries) require careful transactional design to get
right.

**Trade-off accepted**: comprehensive finance-rule coverage, at real implementation
cost, over shipping finance with known gaps in exactly the area (money, legal
signatures) where ambiguity is least tolerable.
