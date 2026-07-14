# Winner Guide Transfer Follow-up Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Bradenton-vs-Sarasota and Siesta-vs-AMI-family stay choices visible near the answer and preserve measurable `guide_book_direct_click` routing.

**Architecture:** Move each page's existing stay decision to the first natural commitment point directly after its comparison table. Reuse the Bradenton page's current decision aside and the family page's existing verdict-card treatment; do not add a shared component, new styling law, title/meta changes, or more CTA volume.

**Tech Stack:** Eleventy/Nunjucks HTML, page-local CSS, Node test runner, Playwright visual checks.

---

### Task 1: Lock the content and tracking contract

**Files:**
- Create: `docs/briefs/2026-07-winner-guide-transfer-followup.md`
- Create: `scripts/enforcement/winner-guide-transfer-followup.test.js`

- [ ] **Step 1: Add the active brief**

Record the July 11 complete analytics window, the two zero-transfer guide rows, required money destinations, anti-claims, mobile behavior, and first-seven-complete-day readback rule. Judge each page by `guide_slug`: keep when `guide_book_direct_click >= 1` without route/schema/content regression; iterate once only when GA4 sessions remain `>= 20` and guide, stay, and booking actions all remain `0`.

- [ ] **Step 2: Write failing source-contract tests**

Assert each guide contains one page-specific decision marker directly after its comparison table, exactly two tracked stay links inside that block, and the correct `guide_book_direct_click`, guide slug, distinct label, and approved destination payloads. Assert the family page no longer retains the late `Looking for Family Vacation Rentals?` section, preventing duplicate CTA content.

- [ ] **Step 3: Run the focused test and confirm RED**

Run: `node --test scripts/enforcement/winner-guide-transfer-followup.test.js`.

Expected: failure because neither early decision block exists.

### Task 2: Implement the two editorial decisions

**Files:**
- Modify: `src/guides/bradenton-vs-sarasota.html`
- Modify: `src/guides/siesta-key-vs-anna-maria-island-families.html`

- [ ] **Step 1: Reuse and verify existing styling**

Reuse the existing decision-aside and verdict-card surfaces. Add no new CSS unless rendered proof exposes an accessibility or wrapping defect.

- [ ] **Step 2: Add Bradenton/Sarasota stay choices**

Move the current bottom `direct-book-decision-aside` to immediately after the quick-comparison table, add `data-transfer-choice="bradenton-vs-sarasota-stay-base"`, and preserve its two tracked destinations and labels.

- [ ] **Step 3: Add AMI/Siesta family stay choices**

Move the intent of the late “Looking for Family Vacation Rentals?” list into a two-choice verdict card immediately after the comparison table. Add `data-transfer-choice="siesta-vs-ami-family-stay-base"`, tracked AMI and Siesta-area destinations, and remove the redundant late list while leaving the shared conversion kit unchanged.

- [ ] **Step 4: Apply copy gates**

Run the copywriting, enterprise UI writing, and humanizer lenses against only the new reader copy. Keep claims limited to existing page/brief truth.

- [ ] **Step 5: Run the focused test and confirm GREEN**

Run: `node --test scripts/enforcement/winner-guide-transfer-followup.test.js`. Expected: PASS.

### Task 3: Render and review

**Files:**
- Generated `_site/` output only through the build; do not hand-edit it.

- [ ] **Step 1: Run content and structural gates**

Run: `npm run lint:content`, `npm run build`, `npm run verify:links`, `npm run verify:jsonld`, and `npm run verify:redirects`.

- [ ] **Step 2: Run route/event and visual gates**

Run:

```bash
node --test \
  scripts/enforcement/winner-guide-transfer-followup.test.js \
  scripts/enforcement/direct-booking-event-smoke.test.js \
  scripts/enforcement/tracking-script-coverage.test.js
npm run test:visual
```

Expected: all focused event/coverage tests and the existing visual suite pass.

The focused source-contract test must assert the complete event payload for both choices on both routes: event name, guide slug, distinct track label, and destination href.

Start `python3 -m http.server 4173 --directory _site`, then capture both changed routes with the installed Playwright CLI at desktop `1440x900` and mobile `Pixel 5` into:

- `artifacts/visual-proof/winner-guide-transfer/desktop-bradenton-vs-sarasota.png`
- `artifacts/visual-proof/winner-guide-transfer/mobile-bradenton-vs-sarasota.png`
- `artifacts/visual-proof/winner-guide-transfer/desktop-siesta-vs-ami-families.png`
- `artifacts/visual-proof/winner-guide-transfer/mobile-siesta-vs-ami-families.png`

Use full-page capture and wait for each block's `data-transfer-choice` selector before taking the screenshot.

```bash
mkdir -p artifacts/visual-proof/winner-guide-transfer
/Users/sawbeck/Projects/seascape-vacations-site/node_modules/.bin/playwright screenshot --browser=chromium --viewport-size="1440,900" --full-page --wait-for-selector='[data-transfer-choice="bradenton-vs-sarasota-stay-base"]' http://127.0.0.1:4173/guides/bradenton-vs-sarasota/ artifacts/visual-proof/winner-guide-transfer/desktop-bradenton-vs-sarasota.png
/Users/sawbeck/Projects/seascape-vacations-site/node_modules/.bin/playwright screenshot --browser=chromium --device="Pixel 5" --full-page --wait-for-selector='[data-transfer-choice="bradenton-vs-sarasota-stay-base"]' http://127.0.0.1:4173/guides/bradenton-vs-sarasota/ artifacts/visual-proof/winner-guide-transfer/mobile-bradenton-vs-sarasota.png
/Users/sawbeck/Projects/seascape-vacations-site/node_modules/.bin/playwright screenshot --browser=chromium --viewport-size="1440,900" --full-page --wait-for-selector='[data-transfer-choice="siesta-vs-ami-family-stay-base"]' http://127.0.0.1:4173/guides/siesta-key-vs-anna-maria-island-families/ artifacts/visual-proof/winner-guide-transfer/desktop-siesta-vs-ami-families.png
/Users/sawbeck/Projects/seascape-vacations-site/node_modules/.bin/playwright screenshot --browser=chromium --device="Pixel 5" --full-page --wait-for-selector='[data-transfer-choice="siesta-vs-ami-family-stay-base"]' http://127.0.0.1:4173/guides/siesta-key-vs-anna-maria-island-families/ artifacts/visual-proof/winner-guide-transfer/mobile-siesta-vs-ami-families.png
```

- [ ] **Step 3: Run design-review and simplify checkpoint**

Inspect hierarchy, mobile wrapping, overflow, focus behavior, repeated copy, and whether the moved decision feels like the next step rather than an interruption.

- [ ] **Step 4: Run full pre-review verification**

Run: `npm test` and `npm run verify:release`.

- [ ] **Step 5: Commit for user review**

Run configured autoreview, inspect `git diff`, and commit with `npm run git:safe-commit -- --stage-source -m "feat: improve winner guide stay transfer"`. Do not push or open a PR until Sawyer reviews the visible screenshots, per repo policy.
