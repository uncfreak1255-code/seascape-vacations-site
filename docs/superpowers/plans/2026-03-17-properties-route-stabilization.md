# Properties Route Stabilization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cloned `/properties/` SPA shell with a standalone Eleventy route and add regression checks that fail if shell markers return.

**Architecture:** The properties index becomes a normal Eleventy page on `layouts/base.njk` that renders from the normalized `properties` dataset at build time. Recovery and release verification gain explicit assertions that the built route no longer contains SPA shell markers or runtime route-navigation code.

**Tech Stack:** Eleventy/Nunjucks, Node test runner, existing enforcement and recovery scripts

---

## Chunk 1: Route rewrite

### Task 1: Capture the route regression in a failing test

**Files:**
- Modify: `scripts/enforcement/lib.js`
- Modify: `scripts/enforcement/lib.test.js`

- [ ] **Step 1: Add a helper that detects forbidden SPA shell markers in built standalone routes**
- [ ] **Step 2: Add a failing test for `_site/properties/index.html` shell markers**
- [ ] **Step 3: Run `npm test` to verify the new assertion fails before implementation**

### Task 2: Replace the cloned properties shell with a standalone page

**Files:**
- Modify: `src/properties/index.njk`
- Reference: `src/_includes/layouts/base.njk`
- Reference: `src/_includes/partials/property-card-image.njk`

- [ ] **Step 1: Rewrite the file to use the shared base layout**
- [ ] **Step 2: Render the property grid from `properties` at build time**
- [ ] **Step 3: Preserve the current Seascape visual direction without `showPage()` runtime navigation**
- [ ] **Step 4: Link cards and CTAs to canonical property pages**

## Chunk 2: Regression gates

### Task 3: Add build-output enforcement for standalone route integrity

**Files:**
- Modify: `scripts/recovery/assert-build-output.js`
- Modify: `scripts/enforcement/verify-release.js` only if needed

- [ ] **Step 1: Add assertions that `_site/properties/index.html` does not contain `id=\"page-home\"`**
- [ ] **Step 2: Add assertions that `_site/properties/index.html` does not contain `showPage(`**
- [ ] **Step 3: Keep the checks inside the existing release verification path**

## Chunk 3: Verification

### Task 4: Rebuild and re-run the review gate

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run verify:recovery:p0`**
- [ ] **Step 4: Run `npm run verify:recovery:guides`**
- [ ] **Step 5: Run `npm run verify:recovery:remediation`**
- [ ] **Step 6: Re-check `/properties/`, `/`, one stay page, and one property detail page on the fresh build**

Plan complete and saved to `docs/superpowers/plans/2026-03-17-properties-route-stabilization.md`. Ready to execute.
