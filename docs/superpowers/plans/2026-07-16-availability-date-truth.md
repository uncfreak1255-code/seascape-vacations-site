# Availability Date Truth Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent a past or malformed Hostaway `nextAvailable` range from appearing as live availability, both at build time and when a static page ages after deployment.

**Architecture:** Keep Hostaway/Seascape Ops as the availability source and add one shared, New York business-date validator to the existing normalization module. Apply it before Eleventy renders, expose date-only metadata on each live card, downgrade expired cards in the browser without another API, and make the scheduled live smoke reject stale production markup. Preserve the existing secure-calendar fallback and all public pricing rules.

**Tech Stack:** Node.js 24, CommonJS, Eleventy/Nunjucks, browser JavaScript, Node test runner, Playwright, Netlify.

---

## Chunk 1: Source truth and rendering

### Task 1: Add the shared business-date contract

**Files:**
- Modify: `scripts/cache/normalize-hostaway.js`
- Test: `scripts/enforcement/hostaway-availability.test.js`

- [x] Add a failing unit test showing that `2026-07-15` is expired at `2026-07-16T23:30:00-04:00`, `2026-07-16` remains current, malformed dates fail, and checkout must be after check-in.
- [x] Run `node --test scripts/enforcement/hostaway-availability.test.js` and confirm the new test fails.
- [x] Add `BUSINESS_TIME_ZONE = "America/New_York"`, a timezone-aware `businessDateStamp()`, and `isCurrentAvailabilityRange()` using date-only comparison.
- [x] Export the helpers and rerun the test to green.

### Task 2: Enforce the contract before rendering

**Files:**
- Modify: `src/_data/properties.js:119-203`
- Test: `scripts/enforcement/properties-data.test.js`

- [x] Add failing cases for a freshly synced past range, a same-business-day range, and deterministic visual availability.
- [x] Run `node --test scripts/enforcement/properties-data.test.js` and confirm the new past-range assertion fails.
- [x] Require `isCurrentAvailabilityRange()` from the normalization module in `normalizeAvailabilitySummary()`.
- [x] Stop replacing a visual fixture's historical `syncedAt`; instead evaluate that fixture against its own frozen timestamp.
- [x] Move existing shape/projection test dates to relative future dates where they exercise production normalization.
- [x] Rerun the focused test to green.

### Task 3: Downgrade a card that expires after deployment

**Files:**
- Modify: `src/properties/index.njk:797-1109`
- Modify: `scripts/enforcement/validate-properties-availability-output.js`
- Test: `scripts/enforcement/properties-catalog-layout.test.js`
- Test: `tests/visual/test-helpers.js`
- Test: `tests/visual/availability-truth.spec.js`

- [x] Add failing catalog-contract assertions for `data-next-available-start`, `data-next-available-end`, the safe fallback copy, stale-chip hiding, and generated-date removal.
- [x] Run `node --test scripts/enforcement/properties-catalog-layout.test.js` and confirm failure.
- [x] Emit the date metadata only when normalized live availability exists.
- [x] Before booking-link decoration, compare each live card with the current New York date. For an expired/malformed range: mute the live badge and label it `Calendar · secure`; replace the next-date block with the existing safe calendar copy; hide availability chips; remove generated `startingDate` and `endingDate` query values.
- [x] Freeze the Playwright browser clock for the properties fixture route so existing historical visual fixtures remain deterministic.
- [x] Add desktop/mobile Playwright coverage that advances past a static build's availability dates and verifies every card downgrades safely.
- [x] Update the build-output validator to inspect rendered catalog cards without treating browser-script fallback literals as rendered cards.
- [x] Rerun the catalog contract.

## Chunk 2: Production guard and verification

### Task 4: Make the daily live smoke reject stale markup

**Files:**
- Modify: `scripts/recovery/assert-live-smoke.js:98-128`
- Test: `scripts/enforcement/recovery-smoke.test.js`

- [x] Add failing smoke cases for current, past, and malformed live-card date metadata with an injected New York business date.
- [x] Run `node --test scripts/enforcement/recovery-smoke.test.js` and confirm failure.
- [x] Add a reusable live-availability markup validator backed by the shared date helper.
- [x] Invoke it for `/properties/` and export it for unit coverage.
- [x] Rerun the smoke test to green.

### Task 5: Prove and close out

**Files:**
- Review all files in this plan.

- [x] Run the focused date suite:

```bash
node --test \
  scripts/enforcement/properties-data.test.js \
  scripts/enforcement/hostaway-availability.test.js \
  scripts/enforcement/properties-catalog-layout.test.js \
  scripts/enforcement/recovery-smoke.test.js
```

- [x] Run `npm run build` and the strict rendered-availability validator.
- [x] Run `npm test`.
- [x] Run `npm run test:visual` (41/42 passed; the new date guard and properties catalog passed on both projects; one unrelated existing desktop fishing-page snapshot remains 182 px taller than its baseline).
- [x] Run the focused browser date-guard spec (2/2 passed).
- [x] Run the read-only production check `npm run verify:recovery:live`.
- [x] Inspect `git diff --check`, the full diff, and final `git status --short --branch`.
- [x] Run the configured non-trivial review gate (clean; no accepted/actionable findings).
- [x] Stage only the intended plan/source/test files and commit through `npm run git:safe-commit -- --stage-source -m "fix: expire stale property availability"`.

## Explicit exclusions and rollback

- Do not edit Dockside's public `$40/night` pool-heat rule.
- Do not encode the reservation-specific `$150 total` exception.
- Do not write to Hostaway, Seascape Ops, analytics, or Hub.
- Do not push, open a PR, merge, or deploy.
- Rollback is `git revert <commit>`; there is no schema, stored-data, credential, or runtime migration.
