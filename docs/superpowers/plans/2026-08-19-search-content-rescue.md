# Search Content Rescue Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the highest-value stale guides, improve current search-result fit, repair the guide-to-booking handoff, and consolidate only generated pages that current evidence proves safe to retire.

**Architecture:** Four read-only discovery lanes produce source, SERP, funnel, and consolidation receipts. One parent-owned Site worktree integrates the accepted findings so public copy, event contracts, redirects, and release proof stay coherent. Analytics remains a read-only proof owner unless diagnosis proves a separate Analytics change is required.

**Tech Stack:** Eleventy/Nunjucks, static HTML, JavaScript event tracking, JSON page registries, Node test runner, Playwright visual tests, BigQuery GSC, GA4/Postgres operator reports, Netlify.

---

## Chunk 1: Freeze Evidence And Brief

### Task 1: Capture the current proof packet

**Files:**
- Create: `docs/briefs/2026-08-search-content-rescue.md`
- Reference: `docs/status/next-batch.md`
- Reference: `docs/process/content-quality-gate.md`
- Reference: `docs/process/seo-competitor-operating-loop.md`
- Reference: `docs/process/ranking-regression-rescue.md`

- [x] **Step 0: Prove branch and baseline state**

Run: `npm run git:preflight`

Run: `node --test scripts/enforcement/content-voice.test.js scripts/enforcement/booking-handoff.test.js scripts/enforcement/direct-booking-event-smoke.test.js scripts/enforcement/validate-redirect-targets.test.js`

Run: `npm run build`

Observed on 2026-08-19: the guarded `codex/seo-content-rescue-20260819` worktree passed preflight, focused tests passed `47/47`, and the full Eleventy build passed from frozen Site SHA `95721d01e3d2170074944775602a274f078b11a1`.

- [ ] **Step 1: Collect the four child receipts**

Record frozen SHAs, source dates, commands, current SERP observations, GSC windows, funnel diagnosis, freshness limits, and no-op decisions. Keep the read-only working receipts in:

- `workspace/seo-content-rescue-20260819/source-truth.md`
- `workspace/seo-content-rescue-20260819/serp-gate-0.md`
- `workspace/seo-content-rescue-20260819/funnel-diagnosis.md`
- `workspace/seo-content-rescue-20260819/pseo-consolidation.md`

Reject stale, missing-source, paid-call, or mutation-based evidence. The parent owns integration; child lanes remain read-only and do not write to Site, Analytics, or Hub.

- [ ] **Step 2: Write one multi-lane active brief**

Name every search-facing source file that the branch may change. Include the required flat content-gate fields, experiment/readback contract, current Gate 0 rows for every query family, required internal-link map, anti-claims, route checks, and exact decision rules.

Add a focused assertion to `scripts/enforcement/search-content-rescue.test.js` that enumerates every accepted route, requires one explicit completed Gate 0/rescue decision for each route, and requires every changed search-facing source path to appear in the brief. The generic gate validates only the first Gate 0 section and is not sufficient for this multi-route batch.

- [ ] **Step 3: Parse the brief contract before public copy edits**

Run: `node -e "const fs=require('fs'); const {findMissingGate0Fields}=require('./scripts/enforcement/search-brief-gate'); const p='docs/briefs/2026-08-search-content-rescue.md'; const missing=findMissingGate0Fields(fs.readFileSync(p,'utf8')); if(missing.length){console.error(missing.join('\\n')); process.exit(1)} console.log('search brief gate: passed')"`

Expected: the brief parses with no placeholder, stale SERP date, or missing proof-source error. The library has no CLI, so do not invoke `search-brief-gate.js` directly. The committed branch must later pass `npm run verify:release -- --range origin/main...HEAD`, which checks changed source-to-brief coverage.

- [ ] **Step 4: Review the brief against the evidence packets**

Expected: every changed page has one explicit improve/hold/retire decision and one proof-bound conversion destination.

### Task 2: Add focused failing content contracts

**Files:**
- Create or modify: `scripts/enforcement/search-content-rescue.test.js`
- Modify only if needed: existing route-specific enforcement tests named by discovery

- [ ] **Step 1: Write failing assertions for expired claims**

Assert that the weather route has no expired “right now” season, past spring-break window, current-inventory promise, stale hurricane-history shortcut, or unsupported flexible-cancellation claim.

- [ ] **Step 2: Write failing assertions for the market report contract**

Assert that the visible evidence window, source scope, schema `dateModified`, and current benchmark framing agree; prohibit an unsupported market-wide claim or a cosmetic date bump.

- [ ] **Step 3: Write failing metadata/answer assertions for the accepted SERP pages**

Cover only pages whose current Gate 0 receipt says `improve`. Preserve canonical URLs, direct-answer structure, FAQ/schema integrity, and existing conversion events.

- [ ] **Step 4: Run the focused test and confirm the expected failures**

Run: `node --test scripts/enforcement/search-content-rescue.test.js`

Expected: FAIL only on the source facts and contracts this branch will correct.

## Chunk 2: Refresh Existing Search Demand

### Task 3: Rescue weather and market-report source truth

**Files:**
- Modify: `src/guides/anna-maria-island-weather.html`
- Modify: `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html`
- Modify: `docs/briefs/2026-08-search-content-rescue.md`
- Test: `scripts/enforcement/search-content-rescue.test.js`

- [ ] **Step 0: Confirm route-specific rescue authority**

Require current page/query proof, the 2026-08-19 SERP receipt, and a documented winner-regression trigger under `docs/process/ranking-regression-rescue.md`. If either route lacks that trigger, record `hold` and make no source edit.

- [ ] **Step 1: Rewrite the weather direct answer from current official sources**

Keep durable monthly climate guidance separate from current-season notes. Remove expired time references and live-availability or policy promises that do not have an owning source.

- [ ] **Step 2: Reconcile every market-report number**

Keep, update, remove, or demote each statistic according to the source-truth receipt. State the exact portfolio window and sample scope; do not present Seascape portfolio evidence as a universal Gulf Coast market average.

- [ ] **Step 3: Update visible and schema dates only for material changes**

The visible label, Article schema, sitemap-derived last modification, and brief proof date must describe the same real refresh.

- [ ] **Step 4: Run the visible-copy chain**

Read `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md`. Apply the repo's copywriting argument pass, enterprise process-language pass, and anti-slop/humanizer pass to every changed reader sentence. Record `Voice Editor: Approved` or stop.

- [ ] **Step 5: Run the focused contract**

Run: `node --test scripts/enforcement/search-content-rescue.test.js`

Expected: weather and market-report assertions pass.

### Task 4: Improve only pages cleared by current Gate 0 evidence

**Files:**
- Candidate modify: `src/guides/best-time-visit-anna-maria-island.html`
- Candidate modify: `src/guides/srq-airport-to-anna-maria-island.html`
- Candidate modify: `src/guides/is-anna-maria-island-worth-visiting.html`
- Candidate modify: `src/guides/bradenton-vs-sarasota.html`
- Modify: `docs/briefs/2026-08-search-content-rescue.md`
- Test: `scripts/enforcement/search-content-rescue.test.js`

- [ ] **Step 1: Accept or reject each SERP recommendation**

Require current observed date, competitor URLs, distinct Seascape answer, current page-level GSC/GA4 proof when available, and an explicit ranking-regression rescue trigger. Do not edit a page whose receipt is blocked, says hold, or lacks route-specific rescue authority. As of the 2026-08-19 SERP read, `is-anna-maria-island-worth-visiting` and `bradenton-vs-sarasota` are holds; preserve their current snippet framing unless later evidence in this frozen packet overturns that decision.

- [ ] **Step 2: Apply the smallest title/meta/first-answer change**

Preserve canonical URLs, page family, answer blocks, current internal-link ownership, and valid structured data. Do not copy competitor language or add a new page.

- [ ] **Step 3: Run the visible-copy chain**

Apply the repo’s `copywriting` argument pass, `enterprise-ui-writing` process-language pass, and `humanizer` anti-slop pass to changed reader copy. Record the final Voice Editor verdict in the brief.

- [ ] **Step 4: Run focused and content checks**

Run: `node --test scripts/enforcement/search-content-rescue.test.js`

Run: `npm run lint:content`

Expected: PASS with no banned phrase, stale Gate 0, internal-process copy, or content-contract failure.

## Chunk 3: Repair The Booking Handoff

### Task 5: Fix the smallest proven guide-to-booking defect

**Files:**
- Candidate modify: `src/_includes/partials/guide-conversion-kit.njk`
- Candidate modify: `src/assets/js/conversion-tracking.js`
- Candidate modify: priority guide source files named by the funnel receipt
- Candidate modify: stay/catalog source named by the funnel receipt
- Test: existing event-contract test files plus one focused regression if missing

- [ ] **Step 0: Freeze the cross-repo contract**

Read `docs/plans/2026-06-12-v1-implementation-handoff.md`. Preserve all locked event names, endpoint paths, response fields, and `receipts[]` fields. No Analytics or Ops write is authorized in this Site worktree.

- [ ] **Step 1: Reproduce the defect in a focused test**

Prove whether the problem is missing event emission, lost attribution across an internal route, an inaccessible/unclear CTA, or a reporting-name mismatch. Do not treat six clicks alone as proof of a UX defect.

- [ ] **Step 2: Write the failing regression**

Assert the exact guide link payload, stay-page arrival context, booking CTA payload, and external booking-engine handoff event required by the existing contract.

- [ ] **Step 3: Apply the minimal Site fix**

Keep event names and cross-repo consumer fields stable. If the root cause is Analytics-only or simply low volume, make no Site code change and record a `clean_noop` decision.

If the Site fix changes reader-facing CTA text, run the same style-file reads, copywriting/process-language/humanizer passes, and record `Voice Editor: Approved` before proof.

- [ ] **Step 4: Run focused event and route tests**

Run the exact Node test files named by the funnel receipt.

Run: `npm run verify:direct-booking-events`

Expected: PASS for the default smoke route plus a selected-route regression that proves the exact guide -> stay -> booking-engine payload named by the funnel receipt. Do not treat the default best-time smoke as proof for an unrelated route.

## Chunk 4: Classify Weak Generated Pages And Consolidate Only With Proof

### Task 6: Classify candidates; edit only under an open gate or technical rescue

**Files:**
- Modify only when selected: `src/_data/seoPages.json`
- Modify only when selected: `src/_data/seoGovernance.js`
- Modify only when selected: `src/_redirects`
- Modify: `docs/portfolio/pseo-inventory-triage.md`
- Modify: `docs/briefs/2026-08-search-content-rescue.md`
- Test: existing pSEO, canonical, redirect, sitemap, and link contracts

- [ ] **Step 1: Freeze the candidate identities**

For each selected URL, record current source record, index state, 28-day GSC evidence, inbound-link check, intended money destination, and exact redirect target.

- [ ] **Step 2: Reject unsafe candidates**

Preserve any page with meaningful clicks, links, distinct intent, owner value, uncertain canonical ownership, or no honest destination. Low traffic alone never authorizes retirement.

- [ ] **Step 3: Check execution authority**

Current canonical state is `fresh but below threshold`. Default outcome is a candidate inventory with explicit `hold` decisions. Source, governance, indexation, sitemap, and redirect edits are allowed only when either:

- a fresh analytics receipt changes `docs/status/next-batch.md` to `open next batch`; or
- the candidate has a separately documented canonical, redirect, indexation, schema, or 404 regression on a tracked winner or money page that meets the rescue rule.

Do not hand-edit receipt-generated `docs/status/next-batch.md`.

- [ ] **Step 4: Write failing redirect and inventory assertions only when authority exists**

Require one-hop redirects, no self-loop, no redirect chain, no live canonical collision, no sitemap leak, and a destination that serves the same user intent.

- [ ] **Step 5: Apply the smallest safe tranche only when authority exists**

Update the page registry/governance, redirect source, and portfolio classification together. Do not delete unrelated source or expand the tranche after the evidence freeze.

- [ ] **Step 6: Run focused consolidation proof**

Run the exact existing pSEO and redirect tests named by the child receipt.

Run: `npm run verify:redirects`

Run: `npm run verify:links`

Expected: PASS with no chain, orphan, canonical, sitemap, or broken-link defect.

## Chunk 5: Aggregate Proof, Review, And Delivery

### Task 7: Run environment-faithful Site verification

**Files:**
- Verify all changed source, docs, tests, screenshots, and generated test artifacts

- [ ] **Step 1: Run focused tests again after integration**

Run all test commands recorded by Tasks 2, 5, and 6.

Expected: PASS.

- [ ] **Step 2: Run content, build, schema, link, redirect, and release gates**

Run: `npm run lint:content && npm test && npm run verify:links && npm run verify:jsonld && npm run verify:redirects && npm run verify:release`

Expected: PASS with current source and no convenience flags absent from CI.

- [ ] **Step 3: Run visual proof for changed public pages**

Run: `npm run test:visual`

Run: `npm run proof:visual`

Expected: changed routes render at required desktop/mobile sizes with no overflow, hidden CTA, broken image, or unapproved layout change. The standard visual registry does not cover every candidate guide, so add a desktop/mobile route matrix for each actually changed URL with the existing browser/Playwright harness. Do not update baselines unless the planned visual contract requires it and the diff is reviewed.

- [ ] **Step 4: Run route smoke**

Create `tests/visual/search-content-rescue.spec.js` with the actual changed guide/stay route matrix. Run: `node scripts/enforcement/run-visual-tests.js tests/visual/search-content-rescue.spec.js`. The spec must cover desktop and mobile, write review images beneath `artifacts/visual-proof/search-content-rescue/`, and assert route status, canonical, main heading, no horizontal overflow, and the expected CTA/event markers. Metadata-only routes may skip pixel comparison but must still pass rendered metadata assertions. Retired routes, if any are authorized, must be checked separately with redirect proof rather than screenshot proof. Update `scripts/recovery/assert-live-smoke.js` only if smoke-asserted visible copy changed.

### Task 8: Simplify, review, commit, and publish through the green gate

**Files:**
- Review the complete branch diff only

- [ ] **Step 1: Run the simplify checkpoint**

Scan the diff for duplicate logic, hidden side effects, unclear names, stale copy, dead code, or over-broad abstractions. Keep fixes inside this task.

- [ ] **Step 2: Run configured Codex autoreview**

Run the installed autoreview helper in branch mode against `origin/main`. Resolve verified findings and rerun affected proof.

- [ ] **Step 3: Create an intentional checkpoint commit**

Run: `npm run git:safe-commit -- --stage-source -m "fix: refresh search content and booking paths"`

Expected: one scoped commit or a small ordered set of scoped checkpoint commits with clean status.

- [ ] **Step 4: Run the SHA-bound landing review**

Use the configured full-branch Codex review with a fresh merge receipt. Base and head SHAs must exactly match the eventual PR.

- [ ] **Step 5: Push, open/update PR, and monitor checks**

Before push, provide the changed visible-page screenshot matrix for Sawyer's repo-required visual review. Push and PR actions are allowed only after that review and under the active repo’s standing green-merge contract. Do not bypass checks or review.

- [ ] **Step 6: Merge only if the full green-merge contract passes**

Require exact-head clean review, green required checks, no unresolved comments, mergeable state, reversible diff, and no excluded high-risk action.

- [ ] **Step 7: Run post-merge live proof**

Run: `npm run verify:recovery:live && npm run verify:direct-booking-events && npm run verify:owner-funnel-routes`

First read the merged SHA from GitHub. Then query `gh api "repos/uncfreak1255-code/seascape-vacations-site/commits/$merged_sha/status"` and select the latest status whose context matches `^netlify/.+/deploy$`. Require the returned top-level SHA to equal `$merged_sha`, the selected Netlify state to equal `success`, and record its `target_url` as the deploy receipt before running route/event smokes. If that exact-SHA Netlify status is absent, report `merged, not shipped`; passing route markup alone is insufficient.

- [ ] **Step 8: Close residue**

Sync root `main`, confirm the PR merge SHA, classify branches/worktrees, remove only broker-owned proven-safe residue, and report any preserved dirt or blocker.
