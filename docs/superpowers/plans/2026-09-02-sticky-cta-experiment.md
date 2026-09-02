# Sticky CTA Experiment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run one reversible, measurement-safe sticky mobile CTA experiment on the single existing direct-booking route justified by a fresh analytics receipt, with deterministic 50/50 assignment and complete handoff lineage.

**Architecture:** Keep the existing stay-page template and mobile sticky CTA. Before any source or visible-copy commit, validate an immutable current `seascape-analytics` receipt whose reread status is `open next batch`, date is unexpired, thresholds are explicit, and exactly one eligible existing `/stays/` route is named. Only a validated generated config may enable the marker; otherwise the rendered build must prove that no route carries it and implementation stops. On the selected route only, assign each stable browser session to control or one variant with a deterministic hash, deduplicate exposure for the assignment lifetime, and keep `sv_handoff_id` creation at the booking-engine boundary while preserving existing session and guide lineage. Read bookings only as an aggregate reviewed GA4-to-Hostaway join; never claim row-level experiment attribution.

**Tech Stack:** Eleventy/Nunjucks, browser-safe vanilla JavaScript, existing GA4/dataLayer conversion tracking, Node `node:test`, Playwright/axe visual tests, and repository build/enforcement scripts.

---

## Chunk 1: Freeze the route and experiment contract

### Task 1: Require an immutable current route-selection receipt

At this snapshot, route selection is **BLOCKED**: the checked-in `docs/status/next-batch.md` read is dated 2026-08-11 and does not provide a current `open next batch` receipt. No implementation, source change, visible-copy change, or experiment activation may begin until the receipt gate below passes.

**Files:**
- Create: `docs/briefs/2026-09-sticky-cta-experiment.md` (during implementation; the active brief is required for any public CTA copy change)
- Create: `scripts/enforcement/validate-sticky-cta-input.js` (during implementation; receipt validator and generated-config writer)
- Create: `src/_data/stickyCtaExperiment.js` (during implementation; generated, fail-closed route/config input)
- Read: `docs/status/next-batch.md`
- Read: `docs/status/current-state.md`
- Read: `docs/portfolio/stay-money-pages.md`
- Read: `docs/process/learning-contract.md`
- Read: `docs/process/design-review-workflow.md`

- [ ] **Step 1: Capture and hash the input before touching source.**

  Obtain one immutable `seascape-analytics` next-batch decision receipt for the last seven complete days and record its SHA-256 hash. The receipt must have `reread_status: open next batch`, a `data_date` no more than 14 days old, an explicit `expires_at` later than the implementation date, and exactly one eligible existing `/stays/` route meeting all thresholds: at least 100 GSC impressions, at least 20 GA4 sessions, and at least one existing direct-booking action (`stay_view_property_click` or `catalog_book_direct_click`) in the same window. Select the highest-session eligible route; a tie is not eligible without a receipt-provided tie-break. Record the receipt hash, date/window, candidate URL, impressions, sessions, and direct-booking event counts in the active brief. Do not use the historical AMI candidate merely because it appears in `docs/status/next-batch.md`.

- [ ] **Step 2: Make route selection terminal when the input is not usable.**

  If the receipt hash is absent/mismatched, the receipt is stale, unavailable, has any status other than `open next batch`, lacks `expires_at`, is expired, is below any explicit threshold, is contradictory, or names zero/multiple eligible routes, stop permanently for this attempt. Do not commit source or visible-copy changes. The brief may record `route selection: blocked`, but the existing rendered site must remain unchanged. Do not invent a route, add a route, create a dashboard, or make a booking-impact claim.

- [ ] **Step 3: Generate and validate the only enabling config.**

  Run `node scripts/enforcement/validate-sticky-cta-input.js --receipt <immutable-receipt-path> --sha256 <receipt-sha256> --output src/_data/stickyCtaExperiment.js`. The validator must reject every failed condition above and write an explicit `{ enabled: false, routePath: "", receiptSha256: "", expiresAt: "" }` fail-closed config on blocked input, or `{ enabled: true, routePath: "<one route>", receiptSha256: "<hash>", expiresAt: "<date>" }` only on valid input. Add a test that a normal build with the disabled config renders zero experiment markers across all stay routes.

- [ ] **Step 4: Write the experiment brief before visible copy changes.**

  In `docs/briefs/2026-09-sticky-cta-experiment.md`, record exactly one selected route, its canonical path, hypothesis, control text, one variant text, primary metric (`stay_view_property_click` or the existing direct-booking action that the selected route actually emits), secondary metrics (`catalog_book_direct_click`, `booking_engine_handoff`, and reviewed downstream bookings), guardrails (canonical/schema/accessibility/overflow), assignment key, exposure rule, readback window, and stop/keep rule. State explicitly that only reviewed GA4-to-Hostaway joins can count bookings or revenue.

- [ ] **Step 5: Run the preflight, then commit only the validated contract.**

  Run:

  ```bash
  npm run git:preflight
  npm run lint:content
  git diff --check
  npm run git:safe-commit -- --stage-source -m "docs: define sticky cta experiment contract"
  ```

  Expected: preflight, content lint, and diff checks pass. If route selection failed closed, stop after the validator/build proof; do not proceed to Tasks 2–4 and do not commit source or visible-copy changes.

## Chunk 2: Implement the bounded sticky CTA variant

### Task 2: Add deterministic assignment and exposure metadata

**Files:**
- Modify: `src/stays/stays.njk` (the existing `.sticky-mobile-cta` markup and the existing mobile CTA styles only)
- Modify: `src/assets/js/conversion-tracking.js` (assignment/metadata support; preserve existing handoff code)
- Test: `scripts/enforcement/sticky-cta-experiment.test.js`

- [ ] **Step 1: Add a failing contract test.**

  In `scripts/enforcement/sticky-cta-experiment.test.js`, load the source files and assert that the selected route is the only route carrying the experiment marker, the sticky CTA has a control and variant label, the experiment uses a stable persisted assignment, and the tracking surface lists the exposure event. Add a small DOM/runtime harness that loads `conversion-tracking.js` twice with the same stored session id and asserts the same variant both times.

- [ ] **Step 2: Run the focused test and verify it fails.**

  Run:

  ```bash
  node --test scripts/enforcement/sticky-cta-experiment.test.js
  ```

  Expected: FAIL because the experiment marker, assignment contract, and exposure event do not yet exist.

- [ ] **Step 3: Mark only the receipt-selected route.**

  In `src/stays/stays.njk`, derive a boolean from the receipt-selected route slug/config. If no validated selection is supplied, the boolean must be false for every route. Add a stable `data-sticky-cta-experiment="sticky_cta_v1"` marker only when true. Do not alter the route set, canonical tags, property inventory, desktop CTA, or the existing phone action.

- [ ] **Step 4: Implement 50/50 assignment with a control fallback.**

  In `src/assets/js/conversion-tracking.js`, use the existing `seascape_booking_handoff_session_id` as the assignment seed and hash it with a documented deterministic algorithm (for example, unsigned FNV-1a). Map even/odd output to `control`/`variant`, and persist the result under an experiment-specific storage key. If storage or the seed is unavailable, render control, emit no exposure, and label allocation as unavailable; do not claim balanced allocation. Never randomize per render, page view, click, or route navigation.

- [ ] **Step 5: Keep the treatment minimal and accessible.**

  Keep the existing sticky bar position, safe-area padding, z-index, focus styles, phone link, CTA destination, and `data-track-event="catalog_book_direct_click"`. Change only the CTA label (for example, the existing control `Compare full checkout total` versus one brief variant approved in the active brief). Ensure the bar does not cover focused content, respects `prefers-reduced-motion`, remains keyboard reachable, and has a visible accessible name at mobile widths. Do not add a desktop sticky control or a second floating surface.

- [ ] **Step 6: Emit one exposure event and preserve lineage.**

  Emit `sticky_cta_exposure` once for the assignment lifetime when the marked sticky CTA becomes eligible/visible, using a storage dedup key; if storage is unavailable, emit no exposure rather than duplicate it on every load. Emit only `experiment_name`, `experiment_variant`, `page_slug`, and non-sensitive route context. CTA and exposure events must not create `sv_handoff_id`; the existing booking-engine boundary alone may create it. Add experiment metadata to the existing generic element payload path so later CTA/handoff events retain `sv_session_id` and any existing `sv_guide_click_id`. Do not alter the booking-handoff endpoint, add row-level experiment identifiers, or send PII.

- [ ] **Step 7: Run the focused test and commit.**

  Run:

  ```bash
  node --test scripts/enforcement/sticky-cta-experiment.test.js
  node --test scripts/enforcement/guide-funnel-lineage.test.js scripts/enforcement/direct-booking-event-smoke.test.js
  git diff --check
  npm run git:safe-commit -- --stage-source -m "feat: add bounded sticky cta experiment"
  ```

  Expected: all focused tests pass and `git diff --check` is clean.

## Chunk 3: Prove route, responsive, and release safety

### Task 3: Add route and accessibility smoke assertions

**Files:**
- Modify: `tests/visual/routes.js` (only if the receipt-selected existing route is not already represented)
- Modify: `tests/visual/accessibility.spec.js` (only if a route-specific assertion is needed)
- Modify: `scripts/recovery/assert-direct-booking-event-smoke.js` (only if the existing smoke contract cannot observe the new exposure event)
- Modify: `scripts/recovery/assert-live-smoke.js` (assert the receipt-selected route and stable control/experiment markers in the live response)
- Test: `scripts/enforcement/sticky-cta-experiment.test.js`
- Test: `scripts/enforcement/recovery-smoke.test.js`

- [ ] **Step 1: Assert route scoping and allocation behavior.**

  Assert that the selected route has exactly one experiment marker and one sticky CTA, every other existing stay route has no experiment marker, repeated loads with the same storage seed keep the same variant, and two controlled seeds map to opposite variants. Assert that storage failure renders the control path without throwing and emits no exposure. Assert that the exposure dedup key prevents a second exposure for the same assignment lifetime.

- [ ] **Step 2: Assert handoff identity.**

  Click the sticky CTA in the harness and assert the emitted `catalog_book_direct_click` does not create a handoff id. Follow the same lineage into an explicit booking-engine link and assert the existing lineage test sees `sv_handoff_id` created only at that boundary, plus the same `sv_session_id` and `sv_guide_click_id`; assert one and only one booking-handoff receipt request. Missing or contradictory identity must fail the test rather than being replaced with a new identifier outside the existing decorator contract.

- [ ] **Step 3: Assert mobile and accessibility behavior.**

  Extend the selected route contract to check the sticky CTA is visible at the mobile viewport, hidden from the desktop layout, has an accessible name, has a visible `:focus-visible` outline when reached by keyboard, does not create horizontal overflow, and does not introduce serious or critical axe violations. Keep the existing phone link independently reachable. If the selected route is already in `tests/visual/routes.js`, reuse its entry; do not add a duplicate visual baseline.

- [ ] **Step 4: Extend the later live-smoke source and unit contract.**

  In `scripts/recovery/assert-live-smoke.js`, add the receipt-selected route to the existing target contract and assert that the response contains one stable experiment marker with the control/experiment hooks, while non-selected stay routes do not expose those markers. In `scripts/enforcement/recovery-smoke.test.js`, unit-test the selected-route and non-selected-route marker assertions against fixture HTML, including the disabled-config path. Keep the live smoke check read-only: it must not activate, assign, or mutate runtime state.

- [ ] **Step 5: Run source and rendered gates.**

  Run:

  ```bash
  npm run lint:content
  npm run build
  node --test scripts/enforcement/sticky-cta-experiment.test.js scripts/enforcement/guide-funnel-lineage.test.js scripts/enforcement/direct-booking-event-smoke.test.js
  npm run test:visual -- --grep <selected-route-slug>
  npm run verify:jsonld
  npm run verify:links
  npm run verify:recovery:live
  npm run verify:direct-booking-events
  git diff --check
  ```

  Expected: build, focused tests, route visual/accessibility proof, JSON-LD, links, and live-smoke source/test checks pass. Review fresh desktop and mobile screenshots for the selected route. Do not update baselines unless the intended CTA treatment is visually approved; do not deploy or activate from this plan.

- [ ] **Step 6: Commit only required test changes.**

  ```bash
  npm run git:safe-commit -- --stage-source -m "test: prove sticky cta experiment boundaries"
  ```

  Expected: the commit contains only required assertions and the new focused test. Omit unchanged paths from `git add`.

### Task 4: Define readback and stop conditions without activation

**Files:**
- Modify: `docs/briefs/2026-09-sticky-cta-experiment.md`
- Read: `docs/process/post-merge-runtime-proof-checklist.md`
- Read: `docs/status/next-batch.md`

- [ ] **Step 1: Document the readback query and counting boundary.**

  Specify a post-merge seven-complete-day `seascape-analytics` read. Compare aggregate exposure, CTA action, and handoff rates by variant, but count bookings only when the reviewed GA4-to-Hostaway join covers the exact property and window. Do not claim row-level experiment attribution: the experiment has no booking-row key. Clicks, handoffs, `Direct`, `Booking Website`, or a local/mock run are not booked-revenue proof.

- [ ] **Step 2: Document fail-closed decisions.**

  Keep the experiment unchanged only when the read has fresh coverage, valid assignment counts, no identity loss, and no accessibility/schema/build regression. Stop and revert the experiment branch if lineage is missing, assignment is not stable, the route becomes contradictory, or the analytics receipt is unavailable. Do not expand to another route, add a dashboard, make a public lift claim, or activate a deployment as part of this work.

- [ ] **Step 3: Run final repository checks and hand off.**

  ```bash
  npm run git:preflight
  git status --short --branch
  git diff --check
  npm run git:merge-check
  ```

  Expected: status shows only the intended plan/implementation files, diff check is clean, and merge-check reports no guardrail violation. Return the exact route-selection receipt, test output, screenshot paths, and any blocked proof as separate source/review/runtime claims. Deployment, live activation, and public claims remain out of scope.
