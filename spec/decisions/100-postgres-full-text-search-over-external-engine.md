# ADR-ZS-100: Postgres full-text search over an external search engine

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §5)

## Context

Search over students and documents needs to work across two languages (French and
Arabic) with typo tolerance, at the platform's three-year target scale (~500,000
students). A dedicated external search engine (Elasticsearch/OpenSearch, Algolia)
would give richer search features but adds another service to operate, another
sub-processor to potentially govern, and another place data has to be kept in sync
with the source of truth.

## Decision

Postgres full-text search (`tsvector` with `french` and `arabic` text-search
configurations) combined with `pg_trgm` trigram matching for typo tolerance covers
search at MVP, with no external search engine or distributed cache — CloudFront
already handles static-asset caching adequately.

## Consequences

**Positive**: no additional service to operate, deploy, or keep in sync with the
database, and no new sub-processor or data-flow question to resolve (relevant given
ADR-ZS-090/ADR-ZS-091's data-boundary discipline).

**Negative**: Postgres full-text search is less feature-rich than a dedicated
search engine — no relevance tuning, faceting, or search-as-you-type experience
comparable to what Elasticsearch or Algolia would offer.

**Trade-off accepted**: "good enough" search bundled into the existing database
over a richer but operationally heavier dedicated search service, deferred until
scale or feature needs actually justify the added complexity.
