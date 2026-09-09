# ADR-ZS-087: React 19 + Vite 8 PWA SPA over Next.js SSR

> **Status:** Accepted
> **Date:** 2026-09-09
> **Historical aliases:** none (STACK.md §1, §7)

## Context

The MVP has no server-side-rendering requirement (no public marketing site, no
SEO-critical pages behind the authenticated app) and does have an explicit offline
requirement — attendance-taking and grade entry must tolerate connectivity drops
(chapter 10, NFR-OFF). A PWA with an offline-capable service worker fits that need
directly; SSR frameworks add rendering-pipeline complexity that isn't needed for an
authenticated internal application and can complicate offline-first design.

## Decision

The frontend is a React 19 + Vite 8 single-page PWA (via `vite-plugin-pwa`/
Workbox), with TanStack Router for client-side routing. A native mobile app is
deferred to V2.

## Consequences

**Positive**: a simpler build and deployment pipeline than an SSR framework would
need, and the PWA/offline story (IndexedDB cache, sync queue) is a natural fit for
a client-rendered SPA rather than something to reconcile with server rendering.

**Negative**: no SSR means no server-rendered first paint or SEO benefit, which
would matter if the product ever needed a public-facing marketing or landing
surface — not a current requirement, but a real constraint if that changes.

**Trade-off accepted**: SPA simplicity and offline-first fit over SSR's benefits,
because the actual MVP need (authenticated app, offline tolerance) doesn't call for
SSR at all.
