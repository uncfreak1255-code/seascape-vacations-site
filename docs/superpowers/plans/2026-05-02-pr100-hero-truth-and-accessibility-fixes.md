# PR100 Hero Truth And Accessibility Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the PR #100 hero design while removing fake live claims, dead controls, reduced-motion issues, and external font loading.

**Architecture:** The hero ticker should render source-backed fallback facts from Eleventy data and let `hero-v2.js` hydrate truly live weather/sunset facts from public APIs. The booking bar should preserve the pill layout but only expose real form controls. CSS should use the homepage's existing local fonts and respect reduced-motion.

**Tech Stack:** Eleventy/Nunjucks, plain browser JavaScript, Node test runner, existing `npm run verify:release`.

---

### Task 1: Add Guard Tests For Hero Review Findings

**Files:**
- Modify: `scripts/enforcement/ui-runtime.test.js`

- [ ] Add tests that assert the hero does not ship static weather/sunset/availability/review claims as literal markup.
- [ ] Add tests that assert hero ticker markup exposes a JSON data payload and live fact slots for JS hydration.
- [ ] Add tests that assert Arrive, Depart, and Guests are real form inputs/selects or non-focusable display elements, not inert buttons.
- [ ] Add tests that assert `hero-v2.css` has no `fonts.googleapis.com` import and includes reduced-motion overrides.

Run: `node --test scripts/enforcement/ui-runtime.test.js`

### Task 2: Replace Fake LIVE Copy With Real Sources

**Files:**
- Modify: `src/index.njk`
- Modify: `src/assets/js/hero-v2.js`

- [ ] In `src/index.njk`, replace hardcoded weather, sunset, availability, and review/stay facts with source-backed defaults:
  - portfolio count from `properties.length`
  - max guest count from `properties`
  - direct savings from the existing site copy
- [ ] Add a JSON script payload containing coordinates and API endpoints for Bradenton/AMI weather and sunset hydration.
- [ ] In `hero-v2.js`, fetch current weather from Open-Meteo and sunset from sunrise-sunset.org using the payload.
- [ ] If either fetch fails, leave source-backed fallback facts in place and remove any stale live wording for that slot.

Run: `npm run build`

### Task 3: Fix Booking Controls Without Changing The Visual Direction

**Files:**
- Modify: `src/index.njk`
- Modify: `src/assets/js/homepage.js`

- [ ] Replace inert Arrive, Depart, and Guests buttons with non-focusable display elements so they no longer pretend to be interactive controls.
- [ ] Keep the Search Homes submit behavior and existing area query param routing.
- [ ] Preserve the cream pill visual layout.

Run: `node --test scripts/enforcement/booking-handoff.test.js scripts/enforcement/ui-runtime.test.js`

### Task 4: Respect Reduced Motion And Local Fonts

**Files:**
- Modify: `src/css/hero-v2.css`
- Modify: `src/assets/js/hero-v2.js`

- [ ] Remove the Google Fonts `@import`; use the locally preloaded homepage fonts.
- [ ] Gate phrase/ticker rotation, cursor haze, and parallax on `prefers-reduced-motion: no-preference`.
- [ ] Add CSS reduced-motion overrides for hero image drift, ticker pulse, booking hint pulse, scroll indicator, and opacity transitions.

Run: `node --test scripts/enforcement/ui-runtime.test.js`

### Task 5: Full Verification

**Files:**
- No additional source changes expected.

- [ ] Run `npm run verify:release` on the PR branch.
- [ ] Merge-simulate against current `origin/main` and run `npm run verify:release` again if branch is behind main.
- [ ] Commit the fixes to `codex/hero-redesign-v2` only if verification is green.
