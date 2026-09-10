# ADR-ZS-066: Compliance and security posture required before pilot activation

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** ARB-25, historical aliases: D4, D5, D8

## Context

Real minors' data starts flowing the moment pilots activate (February 2027), which
means every compliance filing, security control, and operational safeguard the
platform needs has to exist _before_ that date, not be phased in afterward. The
review consolidated a large, previously scattered set of MVP-vs-V1 security and
compliance timing decisions into one place, including the earlier D4 (MVP logging),
D5 (continuity targets), and D8 (AREF cap non-blocking) shorthand decisions, which
are folded into this record rather than tracked separately.

## Decision

Twenty-one rules gate pilot activation, grouped by theme: identity (no CNIE
collection until the F112 authorization; adult identity relies on name/DOB/mobile);
filings (F211 per pilot plus ZSchool's own, before 15/12/2026; a signed pilot data-
processing agreement); WhatsApp consent (explicit opt-in, F118 filed in parallel,
the sub-processor registry and CNF-ZS-004 move to MVP); external processors (FCM/APNs
and outside monitoring tools registered with a stated transfer basis, or not used);
data-subject rights (a manual MVP procedure, V1 tooling); a penetration test before
activation; off-site backups from MVP (full DR failover in V1); a 99.5% SLA
excluding site disaster, with the 8-hour RTO/15-minute RPO (D5) applying only to a
site disaster; MVP logging as an immutable record-level write history (D4), with
sensitive-read logging in V1; ticket-based, director-approved, time-boxed support
access; mandatory MFA for leadership/administration/accounting/sysadmins at MVP,
optional with trusted devices for teachers/supervisors; dual control preventing a
local sysadmin from creating or resetting a leadership account; a 12-character
breach-checked password policy with progressive lockout and rate-limited OTP; a 2GB

- 5MB/student MVP storage quota; WCAG 2.1 AA targeted at MVP on main journeys, a
  formal audit in V1; a defined browser/OS floor; a dedicated iOS PWA acceptance
  requirement; 30-day MVP backup retention, with V1 monthly copies purged of
  anonymized identities on restore; a named data-protection point of contact; and
  financial documents retained for 10 years after the balance is settled, not from
  document date. The AREF permanent-staff cap (D8) being non-blocking is folded into
  ADR-ZS-064's staffing-indicator rule (ADR-ZS-064) rather than repeated here.

## Consequences

**Positive**: gives pilot activation a single, complete, dated compliance-and-
security checklist instead of scattered individual requirements each with their
own unclear MVP-vs-V1 status, and correctly times every control against the actual
date real minors' data starts flowing.

**Negative**: this is a large, MVP-blocking checklist — every one of the twenty-one
items has to be genuinely in place before pilot activation, not partially done, and
several (F112, F211, the penetration test) depend on external parties or lead time
that isn't fully within ZSchool's own control.

**Trade-off accepted**: a demanding, comprehensive pre-activation gate over a
lighter one, because the alternative is activating pilots with real minors' data
against an incomplete compliance and security posture — not an acceptable trade
for a platform in this domain.
