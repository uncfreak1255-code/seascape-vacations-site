# Public Data Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove render-time Hostaway/API dependence from public pages while preserving direct-booking capability and the current visual design.

**Architecture:** Public pages render from repo-owned source only. Curated surfaces stay fully static. Inventory-driven surfaces read from one normalized property dataset in `src/_data/`. Real-time booking remains isolated to direct-booking links and property-page booking widgets only.

**Tech Stack:** Eleventy, Nunjucks, repo-owned JSON data, Netlify static publish, existing recovery/enforcement scripts.

---

## Chunk 1: Canonical Public Property Data

### Task 1: Create one normalized public property dataset

**Files:**
- Modify: `src/_data/properties.json`
- Create: `src/_data/publicPropertyCatalog.js`
- Modify: `eleventy.config.js`

- [ ] Add a repo-owned data module that normalizes property IDs, image URLs, booking URLs, page URLs, and image arrays from `src/_data/properties.json`.
- [ ] Convert raw Hostaway S3 image references to Hostaway CDN URLs in the public dataset layer.
- [ ] Keep only public-safe fields in the normalized dataset: titles, destinations, specs, descriptions, rating, highlights, amenities, image sets, booking URLs, listing IDs, and page URLs.
- [ ] Expose the normalized catalog to templates so homepage, stays pages, and property pages read the same source.
- [ ] Run: `npm test`
- [ ] Run: `npm run build`

### Task 2: Write down the rule in repo docs

**Files:**
- Modify: `docs/source-of-truth.md`

- [ ] Add one short section documenting:
  - `src/` is editable presentation source
  - `src/_data/` is the public data source for properties/stays
  - `_site/` is generated only
  - no Hostaway/API fetches in public render paths

## Chunk 2: Remove Public Render-Time Fetches

### Task 3: Freeze homepage property showcases to curated source

**Files:**
- Modify: `src/index.njk`

- [ ] Remove `fetch('/.netlify/functions/get-properties')` from the homepage script.
- [ ] Remove runtime fallback/api normalization code that only existed to support the live fetch path.
- [ ] Render homepage featured cards and property grid from the normalized local dataset only.
- [ ] Preserve current visual design and direct-booking/property-detail behavior.
- [ ] Replace remaining public placeholder/remote Unsplash images in critical homepage property-related sections.
- [ ] Run: `npm run build`
- [ ] Run: `npm run verify:recovery:p0`

### Task 4: Remove public inventory dependence from other listing surfaces

**Files:**
- Modify: `src/properties/index.html`
- Modify: any shared partials touched by that page

- [ ] Inspect `src/properties/index.html` for the same live-fetch/property-grid pattern.
- [ ] Remove any render-time dependency on Netlify functions or Hostaway API responses.
- [ ] Point property listing surfaces at the normalized local dataset.
- [ ] Run: `npm run build`

## Chunk 3: Normalize Property Pages Without Breaking Booking

### Task 5: Make property pages read repo-owned public data

**Files:**
- Modify: `src/properties/dockside-dreams/index.html`
- Modify: `src/properties/the-oasis/index.html`
- Modify: `src/properties/sarasota-luxe/index.html`
- Modify: `src/properties/river-house/index.html`
- Modify: `src/properties/bradenton-pool-home/index.html`

- [ ] Replace raw Hostaway S3 references in metadata/schema/public image arrays with normalized CDN-backed public data.
- [ ] Keep booking widgets or booking-engine handoff isolated to the property-detail experience only.
- [ ] Preserve current design and property-page booking flow.
- [ ] Run: `npm run build`
- [ ] Run: `npm run verify:recovery:remediation`

## Chunk 4: Regression Gates

### Task 6: Block the old failure mode at release time

**Files:**
- Modify: `scripts/recovery/assert-build-output.js`
- Modify: `scripts/recovery/assert-live-smoke.js`
- Modify: `scripts/enforcement/verify-release.js`

- [ ] Add checks that public pages do not contain `/.netlify/functions/get-properties`.
- [ ] Add checks that public pages do not contain raw `hostaway-platform.s3.us-west-2.amazonaws.com` URLs.
- [ ] Add checks that critical homepage/property listing surfaces do not contain `images.unsplash.com`.
- [ ] Add checks that public pages do not directly reference `api.hostaway.com`.
- [ ] Keep booking-engine links and property-page widgets allowed where intentionally used.
- [ ] Run: `npm test`
- [ ] Run: `npm run verify:release -- --range origin/main...HEAD`

## Chunk 5: Verification and Ship

### Task 7: Full local verification

**Files:**
- Verify only

- [ ] Run: `npm test`
- [ ] Run: `npm run build`
- [ ] Run: `npm run verify:recovery:p0`
- [ ] Run: `npm run verify:recovery:guides`
- [ ] Run: `npm run verify:recovery:remediation`
- [ ] Run: `npm run verify:release -- --range origin/main...HEAD`

### Task 8: Preview and production validation

**Files:**
- Verify only

- [ ] Deploy preview from `_site`
- [ ] Smoke-test homepage, `/properties/`, representative `/stays/` pages, and the 5 property pages
- [ ] Confirm direct-booking handoff still works
- [ ] Run: `npm run verify:recovery:live`

