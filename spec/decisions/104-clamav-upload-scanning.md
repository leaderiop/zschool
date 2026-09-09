# ADR-ZS-104: Uploaded documents scanned by ClamAV before storage or distribution

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §6)

## Context

The platform accepts a wide range of user-uploaded files (supporting documents,
health records, identity documents) from many thousands of parents and staff
across hundreds of schools — a large, distributed upload surface that's a
realistic vector for malware distribution if uploads are stored and later served
to other users with no inspection.

## Decision

Every upload is validated and then scanned by ClamAV running in a dedicated Lambda
worker before it becomes available for storage or distribution to any other user.

## Consequences

**Positive**: closes an upload-based malware-distribution vector before it can
affect any other user of the platform, appropriate for a system with this many
distinct upload sources.

**Negative**: adds a scanning step (and its own Lambda worker, cold-start
behavior, and failure handling) to every upload path, which is additional latency
and infrastructure to operate correctly.

**Trade-off accepted**: the latency and operational cost of scanning every upload
over the risk of an unscanned malicious file reaching another family or staff
member through the platform.
