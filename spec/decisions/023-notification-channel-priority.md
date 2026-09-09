# ADR-ZS-023: In-app, SMS, and WhatsApp as priority notification channels

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** DEC-12

## Context

Reaching a parent reliably (an absence alert, a payment reminder) matters enough
to the product's core value that channel choice can't default to whatever is
technically easiest (email, or push notifications requiring a native app that
doesn't exist yet at MVP). The channels need to match how Moroccan parents actually
communicate day to day.

## Decision

In-app notification, SMS, and WhatsApp are the priority channels; email is
secondary. (WhatsApp specifically was later phased to V1 rather than MVP, and push
notifications were deferred — see ADR-ZS-062.)

## Consequences

**Positive**: reaches parents on the channels they actually use daily, rather than
defaulting to email, which many parents check rarely if at all.

**Negative**: SMS and WhatsApp both carry real per-message cost at scale, unlike
email or in-app notifications, which becomes a direct line item the business model
has to account for (see ADR-ZS-009's consumables billing).

**Trade-off accepted**: reachability over cost — an unread email notification about
a child's absence delivers no value regardless of how cheap it was to send.
