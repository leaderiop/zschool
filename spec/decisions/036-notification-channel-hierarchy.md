# ADR-ZS-036: Push-first notification channel hierarchy, with WhatsApp pricing flagged

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-36

## Context

Native push notifications reach the largest share of the target device population
(Android roughly 68%, iOS roughly 32%) at effectively no marginal cost once a native
app exists, but push requires that native app (a V1/V2 concern per ADR-ZS-... on the
MVP scope), and a meaningful share of households still don't own a smartphone at
all, which SMS alone can reach.

## Decision

The notification channel hierarchy is: push first (once native apps exist), then
WhatsApp "utility" messages for parents who have opted in, then SMS through a
Moroccan aggregator as the fallback for households without a smartphone. WhatsApp's
Morocco pricing was known to be changing on 1 October 2026 at the time of this
decision, flagged for reassessment (H-20) rather than treated as settled.

## Consequences

**Positive**: reaches every household regardless of device tier, with cost
naturally decreasing as adoption of the cheaper channels (push) grows over time.

**Negative**: three channels means three delivery-tracking and cost-accounting
paths to maintain, and the WhatsApp pricing change specifically introduces a real
cost-forecasting uncertainty that has to be revisited once new pricing is known.

**Trade-off accepted**: universal reachability across three channels, and the
operational complexity that comes with maintaining all three, over standardizing on
a single channel that would leave some households unreachable.
