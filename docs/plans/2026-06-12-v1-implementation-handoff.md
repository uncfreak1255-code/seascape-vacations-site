# V1 Implementation Handoff — Trust the Money Path
*Frozen 2026-06-12. Source: repo audit → second-opinion adjudication → pre-mortem (three verified passes; all file:line citations re-checked against this repo on 2026-06-12). This document is self-contained: an implementation agent needs nothing outside it plus the repo.*

**Critical-flaw check:** none open. One pre-mortem discovery is folded in as Task 2: `scripts/recovery/assert-live-smoke.js` currently FAILS against production (stale copy assertion), which means the repo's documented post-deploy proof chain is red today. Its repair is sequenced first among the PRs.

**Cross-repo impact check (2026-06-12):** seascape-ops, seascape-hub, and seascape-analytics were swept for coupling to every V1 surface. No V1 task breaks any of them; T3 actively benefits the analytics weekly loop (events flow into the ga4-collector automatically, no backfill or config change) and T9 is new coverage (no sibling repo runs scheduled monitoring of the site, so no double-alerting). The contracts the sweep surfaced are locked in §5; the V2 counter-semantics coordination requirement is recorded in §7.

---

## 1. Final Objective

Make the site's revenue measurement and publishing layer trustworthy: restore the dead owner-funnel CTA tracking that feeds the live weekly decision loop (seascape-analytics → `next_batch_decision` receipt → `docs/status/next-batch.md`), lock that class of regression out with CI gates, stop publishing serverless function source, stop pinning in-place-edited CSS/JS in browser caches for a year, harden the guest email capture endpoint's failure modes, and stand up a scheduled live smoke that is actually green-when-healthy and red-when-broken. Everything is shaped as small, independently verifiable PRs with `git revert` rollback — no migrations, no data changes.

## 2. Locked V1 Scope

**Included (9 tasks):** blob metrics snapshot (ops, decaying asset) · live-smoke repair (stale marker + missing timeouts) · tracking gate + GA4 on 4 research pages · status-surface port of open questions · delete the function-source passthrough · CSS/JS cache stopgap with an enforcement-gate extension · versioned `_site` ignore · guest-capture hardening (narrow) · scheduled smoke workflow + alert drill.

**Excluded (see §7 Deferred):** guides GA4 batch, lifetime-counter conversion, honeypot/rate-limit, header-file consolidation, asset fingerprinting, metrics-warning monitoring, Holmes Beach redirect resolution, homepage perf budget, privacy wording, legacy cleanup, all refactors.

**Why this is enough:** V1 fixes every defect that is actively bleeding (mis-routed weekly decisions off a false zero, publicly served function source, stale-cache breakage on every CSS/JS deploy, a red post-deploy proof chain) and converts the fixes into permanent CI gates. Everything excluded is either gated on a human decision, time-insensitive, or produces data with no consumer yet.

## 3. Implementation Order

| # | Task | Type | Branch |
|---|---|---|---|
| 1 | Blob metrics snapshot | ops, no PR | — |
| 2 | Live-smoke repair | PR | `codex/smoke-repair` |
| 3 | Tracking gate + research GA4 | PR | `codex/tracking-gate` |
| 4 | Status-surface port | PR (docs-only) | `codex/audit-status-port` |
| 5 | Stop publishing function source | PR | `codex/function-source-404` |
| 6 | CSS/JS cache stopgap + gate extension | PR | `codex/cache-stopgap` |
| 7 | Version the `_site` ignore | PR | `codex/site-ignore` |
| 8 | Guest capture hardening | PR | `codex/capture-hardening` |
| 9 | Scheduled live smoke + drill | PR | `codex/live-smoke-schedule` |

Tasks 2–9 are sequential PRs (this repo merges several content PRs per day; keep each PR's life short to avoid rebase churn on `eleventy.config.js`, `.gitignore`, and the header files). Task 1 runs immediately, before anything else.

## 4. Task Cards

### Task 1 — Blob metrics snapshot (ops; run before any PR)
**Purpose:** the two Netlify Blobs metrics stores clamp receipts to rolling windows (200 owner / 500 guest); every passing day rotates history away irrecoverably. Snapshot current state now, before any other work.
**Files/areas:** no repo changes. Output goes OUTSIDE the repo (the repo is public).
**Exact change:**
1. Read `OWNER_LEAD_METRICS_TOKEN` from `.env` or `.secrets.env` at repo root into a shell variable. Never echo it, never pass it as `?token=`.
2. `mkdir -p /Users/sawbeck/Documents/Claude/seascape-backups`
3. `curl -s -H "Authorization: Bearer $TOKEN" https://seascape-vacations.com/.netlify/functions/owner-lead-metrics > /Users/sawbeck/Documents/Claude/seascape-backups/owner-lead-metrics-2026-06-12.json`
4. Same for `.../guest-email-capture-metrics` → `guest-email-capture-metrics-2026-06-12.json` (the guest endpoint accepts the owner token as fallback).
**Acceptance:** both files parse as JSON (`python3 -m json.tool < file`), contain a `receipts` array, and live outside the repo. Note the receipt counts in the task closeout.
**Rollback:** n/a (read-only GETs).
**Risk:** minimal. **Dependencies:** none.

### Task 2 — Live-smoke repair
**Purpose:** `assert-live-smoke.js` fails against healthy production because it asserts retired copy ("Request Your Revenue Teardown"; live page now says "Revenue Review"). Two of the three smoke scripts also have no socket timeout, so a hung connection stalls forever. The smoke must be trustworthy before Task 9 schedules it.
**Files/areas:** `scripts/recovery/assert-live-smoke.js`, `scripts/recovery/assert-direct-booking-event-smoke.js` (+ their sibling tests if assertions reference the changed code).
**Exact change:**
1. In `assert-live-smoke.js`, find the `/property-management/` marker block asserting the literal string `Request Your Revenue Teardown`. Replace it with the CTA text currently in `src/property-management/index.njk` (derive from source — do not trust this document's snapshot of the copy). Leave the href/structural markers and negative assertions unchanged.
2. Add a 10-second socket timeout to the `request()` helpers in `assert-live-smoke.js` and `assert-direct-booking-event-smoke.js`, copying the existing pattern from `scripts/recovery/assert-owner-funnel-routes.js` (`https.get(url, { timeout: 10000 })` + destroy-on-timeout). No retry logic inside the scripts (retry lives at the workflow level, Task 9).
**Acceptance:** `npm run verify:recovery:live`, `npm run verify:direct-booking-events`, and `npm run verify:owner-funnel-routes` all exit 0 against production; `npm test` green.
**Rollback:** `git revert`.
**Risk:** low. **Dependencies:** none.

### Task 3 — Tracking gate + research-route GA4 (test-first, one PR)
**Purpose:** `/research/owner-fee-revenue-leak-benchmark-2026/` ships `data-track-event` CTAs with zero script tags — every owner CTA click is dropped, and the weekly decision rules in `docs/status/next-batch.md` (which branch on `owner_primary_cta_clicks`) misroute off a false zero. This is the only route with dead CTAs (verified by full-site scan). Fix it and gate the class.
**Files/areas:** new `scripts/enforcement/tracking-script-coverage.test.js`; `src/research/owner-fee-revenue-leak-benchmark-2026.njk`, `src/research/how-seascape-protects-owner-net-2026.njk`, `src/research/gulf-coast-vacation-rental-chart-pack-2026.njk`, `src/research/index.njk`.
**Exact change:**
- *Commit 1 (gate, demonstrated red):* new node:test file copying the structure of `scripts/enforcement/sitemap-indexability-contract.test.js:20-64` (read every `<loc>` from `_site/sitemap.xml`, call `readBuiltRoute` per route). For each route where `buildRouteContract(...).trackedEvents` is non-empty (`scripts/enforcement/rendered-route-contract.js:111-126` already extracts both `data-track-event` and `data-form-submit-event`), assert the built HTML includes `/assets/js/conversion-tracking.js` **or** `/assets/js/homepage.js` (the homepage injects the tracker at runtime — same exemption `scripts/recovery/assert-direct-booking-event-smoke.js:73-78` encodes; add a comment cross-linking the two sites). Run it: it must fail on exactly the benchmark route.
- *Commit 2 (fix):* add `{% include "partials/analytics-ga4.njk" %}` on its own line immediately before `</body>` in the 4 research files — the exact mechanism already used by 8 guides and 3 other research pages (reference: `src/guides/bradenton-vs-sarasota.html:267`). The partial carries the GA4 loader + `conversion-tracking.js` and adds no Meta pixel. Touch nothing else in those files.
**Acceptance:** gate red on commit 1, green after commit 2; built benchmark page contains both the `googletagmanager` loader and the `conversion-tracking.js` tag; `npm run lint:content` passes (include-only diffs produce no visible-text delta — this is by design of the gate); `npm test` green; `npm run test:visual` green with **no baseline updates** (2 of the 4 pages are visually baselined; the partial self-suppresses on 127.0.0.1 and the visual harness aborts external requests, so zero pixel delta is expected — if baselines change, stop and investigate).
**Rollback:** `git revert`.
**Risk:** low. **Dependencies:** none (Task 2 not required, but keep order).

### Task 4 — Status-surface port (docs-only)
**Purpose:** the operator reads `docs/status/next-batch.md` and `docs/status/open-risks.md`, never old plan files. The plan's open questions and the post-fix measurement caveat die unless they live on a read surface.
**Files/areas:** `docs/status/open-risks.md` only. Do NOT hand-edit `docs/status/next-batch.md` (it is generated from analytics receipts via `scripts/enforcement/sync-next-batch-from-analytics-receipt.js`; hand edits get overwritten and may violate the reread contract).
**Exact change:** read `open-risks.md` first and match its existing format. Add a "Repo-audit V1 (2026-06-12)" section containing: (a) an instrumentation note — "owner_support GA4 numbers before [Task-3 deploy date] are instrumentation artifacts (the benchmark page loaded no tracking script); the first post-fix weekly receipt will show a step change that is sensor repair, not demand"; (b) the five open decisions verbatim from `docs/plans/2026-06-12-repo-audit.md` §6 (Holmes Beach canonical, alerting channel, Meta-pixel/privacy wording, stylesheet budget, legacy root residue), each tagged with the V2 item it blocks; (c) one pointer line to the plan doc for V2 sequencing.
**Acceptance:** `npm run lint:content` green (doc-contract checks run always-on); section renders in plain markdown; no other file touched.
**Rollback:** `git revert`. **Risk:** minimal. **Dependencies:** Task 3 merged (so the deploy date in the note is real).

### Task 5 — Stop publishing function source
**Purpose:** `addPassthroughCopy("netlify")` copies all 8 serverless function sources into `_site`, where production serves them publicly. Nothing depends on it: Netlify deploys functions from `netlify/functions/` by platform default (`netlify.toml` has no `[functions]` block), and the only repo reference to `_site/netlify` is a must-NOT-exist assertion.
**Files/areas:** `eleventy.config.js` (the `addPassthroughCopy("netlify")` line, currently line 117), `scripts/recovery/assert-build-output.js`.
**Exact change:** delete that one passthrough line (leave the adjacent `_headers` and image-glob passthroughs untouched). In `assert-build-output.js`, near the existing `expectNotExists("_site/netlify/functions/get-properties.js")` (line ~192), add `expectNotExists("_site/netlify")` as a directory-level regression guard (match the helper's existing usage pattern).
**Acceptance:** `npm run build` passes; `ls _site/netlify` → no such directory; `npm test` green. Post-merge (after Netlify deploy): `curl -s -o /dev/null -w "%{http_code}" https://seascape-vacations.com/netlify/functions/guest-email-capture.js` → `404`, and `curl -s -o /dev/null -w "%{http_code}" -X GET https://seascape-vacations.com/.netlify/functions/guest-email-capture` → `405` (proves the function itself still deploys and answers).
**Rollback:** `git revert` + redeploy. **Risk:** low. **Dependencies:** none.

### Task 6 — CSS/JS cache stopgap + enforcement-gate extension
**Purpose:** `/*.css` and `/*.js` ship `max-age=31536000, immutable` at unversioned URLs while being edited in place — returning visitors keep year-old assets after every deploy. Blast radius of the change is ~127 KB across 6 small first-party files (1 extra conditional request per page view; 4 on the homepage). Known limitation to state plainly in the PR description: **this stops new bleeding only** — browsers already holding immutable copies won't revalidate until eviction or a URL change (V2 fingerprinting heals them).
**Files/areas:** `netlify.toml` (the `/*.css` and `/*.js` `[[headers]]` blocks, lines ~17-25), root `_headers` (the `/*.css` and `/*.js` rules, lines ~8-12), `scripts/enforcement/release-cache-policy.js`, `scripts/enforcement/release-cache-policy.test.js`.
**Exact change:**
1. In BOTH files, change the `/*.css` and `/*.js` values to `public, max-age=0, must-revalidate` (identical to the existing `/*.html` value). Touch no other rules (note: `_headers` has no avif/webp rules at all — that asymmetry predates this task; leave it).
2. In `release-cache-policy.js`, the `isHtmlLikeHeadersRoute` regex (lines ~63-65) deliberately skips `css|js|avif|jpg|png|svg|webp|woff2` routes. Remove `css` and `js` from that skip list — after step 1 those routes carry the canonical `/*.html` policy, so the existing netlify.toml↔`_headers` parity assertion now enforces them and any future drift between the two files fails `npm run verify:release` and `npm test`.
3. Update `release-cache-policy.test.js`: its fixture that hardcodes a `/*.css` immutable block to prove asset routes are ignored must flip — assert that a `/*.css` rule diverging from canonical policy now **throws**, and add a passing fixture with the new value.
**Acceptance:** `npm test` and `npm run verify:release` green. Post-merge: `curl -sI https://seascape-vacations.com/css/homepage.css | grep -i cache-control` → `public, max-age=0, must-revalidate`; same for `/assets/js/conversion-tracking.js`; `curl -sI .../hero-mobile.webp` still shows `immutable` (images intentionally unchanged).
**Rollback:** `git revert` + redeploy (also reverts the gate change, so no orphaned red gate). **Risk:** medium (cache behavior) — preview-deploy header check before merge is the mitigation. **Dependencies:** none.
**Cross-repo note:** `seascape-hub/intelligence/seo-audit-april-2026.md:300` asserts immutable static-asset caching as a verified finding; this task makes that line stale. Record in the PR closeout that the hub doc needs a one-line update (hub repo change, not this PR).

### Task 7 — Version the `_site` ignore
**Purpose:** the full `_site/` ignore lives only in machine-local `.git/info/exclude`; any fresh clone would stage 164 generated files. Verified: zero files under `_site/` are tracked, so this is conflict-free.
**Files/areas:** `.gitignore` (currently covers only `_site/research/` at line ~34).
**Exact change:** add a `_site/` line to the tracked `.gitignore` (place it near the existing `_site/research/` entry; the narrower line may then be removed as redundant in the same commit).
**Acceptance:** `git check-ignore -v _site/index.html` attributes the ignore to the tracked `.gitignore`; `git status` clean of `_site` entries; `npm test` green.
**Rollback:** `git revert`. **Risk:** minimal. **Dependencies:** none.

### Task 8 — Guest capture hardening (narrow)
**Purpose:** the highest-traffic capture endpoint 500s on malformed JSON, can show a guest an error after Mailchimp already subscribed them (unwrapped Blobs write ordered after Mailchimp), and swallows all three failure classes with zero logging. Every fix copies a pattern already proven in a sibling function.
**Files/areas:** `netlify/functions/guest-email-capture.js`, `scripts/enforcement/guest-email-capture-receipts.test.js`.
**Exact change:**
1. Guard the `JSON.parse(event.body || "{}")` (line ~218): on parse failure return `{ statusCode: 400, body: JSON.stringify({ error: "invalid_json" }) }` — copy the guarded `parseRequestBody` pattern from `netlify/functions/guest-email-capture-proof-label.js`.
2. Wrap the Blobs read→merge→write sequence (lines ~230-233) in try/catch: on failure, `console.error("guest_capture_metrics_write_failed", {...message, submissionId})` and return the normal success response with `stored: false` — copy `netlify/functions/submission-created.js:39-55` verbatim in shape. Mailchimp already succeeded at that point; the guest must see success.
3. Inside the three silent `catch (_error)` blocks (lines ~165-167, ~179-181, ~204-210): rename `_error` → `error` and add a structured `console.error` with the existing warning string as the event name plus `error.message`. Keep the warning-string pushes exactly as they are.
**Exact new tests:** (a) `body: "{not json"` → 400, store never touched; (b) store `set()` throws after a successful Mailchimp sync → handler returns 200 with `stored: false` and `console.error` was called (spy/capture). All 18 existing test cases must stay green unmodified.
**Acceptance:** `npm test` green including the 2 new cases.
**Rollback:** `git revert` + redeploy. **Risk:** low-medium (live capture path; mitigated by pattern-copying + tests). **Dependencies:** none. Closeout language rule: describe this as "hardened against two specific failure shapes" — NOT "capture is protected/monitored" (detection ships in V2).
**Cross-repo note:** the SUCCESS response fields `{ stored, pagePath, placement, deliveryMode }` must not change — seascape-ops proof pipelines (`mailchimp-delivery-receipt.js`, `direct-booking-handoff-candidates.js`, the marketing proof packet) gate on `stored === true` and handle the new `200 + stored:false` path gracefully (an improvement over the old unhandled 500). One known degradation to flag, not fix, in this PR: `seascape-analytics/scripts/live_guest_capture_proof.py` POSTs this endpoint and never checks `stored`, so a Blobs-write failure that used to fast-fail as a 500 becomes a silent ~60s receipt-poll timeout there. Record it in the PR closeout; the one-line `stored` check belongs in the analytics repo.

### Task 9 — Scheduled live smoke + alert drill
**Purpose:** the three live-smoke scripts are manual-only; failures between deploys go undetected. They need no secrets (verified: public URLs only, no env vars). Honest coverage note for the PR description: this detects route/markup breakage, NOT function-level capture failures (that is V2's metrics-warning check).
**Files/areas:** new `.github/workflows/live-smoke.yml`.
**Exact change:** workflow with `on: workflow_dispatch` (cron added later, see below). One job, `timeout-minutes: 10`, `runs-on: ubuntu-latest`: checkout (the direct-booking script reads `src/assets/js/conversion-tracking.js` from the checkout — full repo needed, default depth is fine), setup-node from `.nvmrc` with npm cache, `npm ci`, then three steps each shaped `npm run <script> || (sleep 30 && npm run <script>)` for `verify:recovery:live`, `verify:direct-booking-events`, `verify:owner-funnel-routes` (retry-once absorbs transient blips). Add a header comment: "Any PR changing visible copy on smoke-asserted routes must update `scripts/recovery/assert-live-smoke.js` in the same PR."
*Cron enablement:* after merge, run the workflow twice via dispatch. Both green → follow-up commit adding `schedule: - cron: "0 11 * * *"` (≈06:00 ET, off-peak for cron-jitter).
*Alert drill (human checkpoint):* after cron is live, trigger one deliberate failure (dispatch the workflow on a branch where one smoke assertion is temporarily inverted — do NOT touch production) and confirm with Sawyer within 24h that he saw the GitHub failure notification. If unseen, record in `open-risks.md` that the channel is dead and Telegram-via-Hermes (V2) moves up.
**Acceptance:** two clean dispatch runs; one clean scheduled run; drill outcome recorded.
**Rollback:** delete the workflow file. **Risk:** low. **Dependencies:** Task 2 merged (smoke must pass against production first).

## 5. Safety Rules

- **Never commit to `main`.** Every task (except Task 1) uses a worktree + `codex/<task>` branch per repo rules — use `/Users/sawbeck/bin/agent-start <task-name>` (or the repo worktree flow if the broker is unavailable). Root checkout stays sync-only.
- **No force-push, no branch deletion, no history rewrite.** Merge via PR after green CI only.
- **Secrets:** never echo, log, or commit `OWNER_LEAD_METRICS_TOKEN` or anything from `.env`/`.secrets.env`. Never pass tokens as URL query params. The Task 1 export JSONs go outside the repo and are never committed (the repo is public).
- **Off-limits:** `_site/` as source (generated), `DEPLOY THIS FOLDER TO NETLIFY/` (archival), `docs/status/next-batch.md` (receipt-generated — hand edits prohibited), Hostaway live data (no writes, ever), all `netlify.toml`/`_headers` rules other than the four blocks Task 6 names, visual baselines in `tests/visual/__screenshots__/` (any task producing a baseline diff must STOP and report, not re-baseline).
- **Backup-first:** Task 1 (blob snapshot) runs before any PR work.
- **Human approval required for:** enabling cron only after two clean dispatch runs (procedural, agent-verifiable); the alert-drill confirmation (only Sawyer can confirm he saw the email); any deviation from a task card.
- **Stop conditions:** a visual baseline changes when the card predicts none; the Task 3 gate flags any route other than the benchmark page; a preview-deploy header check disagrees with the card; `npm test` reveals failures unrelated to the diff. In each case: stop, report, do not improvise.
- **Cross-repo contract locks (verified consumers in seascape-ops / seascape-hub / seascape-analytics — none of these may change in any V1 PR):**
  - Live endpoint paths `/.netlify/functions/owner-lead-metrics`, `guest-email-capture-metrics`, `guest-email-capture`, `*-proof-label` and their Bearer-token auth behavior (401 unauth / 200 auth). The analytics collector derives the guest URL by string-replacing the literal substring `owner-lead-metrics` — renaming either endpoint breaks it.
  - The metrics `receipts[]` field names: `submissionId, createdAt, pageSlug, sourcePageSlug, market, leadType, proofLabel` (owner) plus `pagePath, guideSlug, placement, sourceLabel` (guest). The analytics collector treats the owner receipts array as a complete snapshot and deletes Postgres rows missing from the response.
  - The `guest-email-capture` SUCCESS response fields `{ stored, pagePath, placement, deliveryMode }` (ops proof pipelines gate on `stored === true`).
  - The Netlify owner form contract: form name `owner-revenue-teardown`, its hidden fields, and its notification email (sender `formresponses@netlify.com`, subject `New Seascape owner revenue review (<id>)`) — ops `owner-reachout-intake` parses these.
  - The names of the `verify:*` npm scripts and `scripts/recovery/assert-*.js` files (referenced by ops codex-lane config and the analytics operator dashboard). Task 2 changes their internals, never their names.
  - The receipt emitter `scripts/enforcement/emit-hub-verification-receipt.js` and its receipt schema (`receipt_id, owning_repo, source_path, claim_ids, stale_after, details`) — the hub ingester and business-intelligence map build on it.

## 6. Verification Plan

Per-PR gate (all tasks 2–9): `npm run lint:content && npm test && npm run verify:release` — all exit 0. `npm run test:visual` additionally for Task 3. Diff audit before every PR: every changed line traces to the task card.

Post-merge live proof, in order as tasks land:
```
npm run verify:recovery:live && npm run verify:direct-booking-events && npm run verify:owner-funnel-routes   # green from Task 2 onward
curl -s -o /dev/null -w "%{http_code}" https://seascape-vacations.com/netlify/functions/guest-email-capture.js   # 404 after Task 5
curl -s -o /dev/null -w "%{http_code}" https://seascape-vacations.com/.netlify/functions/guest-email-capture     # 405 after Task 5
curl -sI https://seascape-vacations.com/css/homepage.css | grep -i cache-control                                  # max-age=0, must-revalidate after Task 6
curl -sI https://seascape-vacations.com/assets/js/conversion-tracking.js | grep -i cache-control                 # same
```
Success = every command matches its annotation. Stop signals: any smoke script failing after Task 2 (investigate before proceeding — could be real); a 200 on the function-source URL after Task 5 (stale CDN or wrong deploy — do not proceed to Task 6); `immutable` still served after Task 6 (header precedence assumption broken — stop and report).

30-day success metrics (do not judge V1 by owner CTR — no V1 task creates demand): first post-Task-3 weekly receipt shows owner_support `ga4_sessions > 0` (sensor proof); alert drill confirmed seen within 24h; one post-Task-6 CSS deploy verified stale-free via fresh-profile curl; smoke false-alarm count ≤1/week; V2 items #1–#2 at least started.

## 7. Deferred

**V2 (sequenced in `docs/plans/2026-06-12-repo-audit.md` §5):** guides GA4 batch (re-verify the unwired count first — passes reported both 37 and 29; derive from `grep -rLE 'googletagmanager|gtag\(|analytics-ga4' src/guides --include=*.html`) + the broad indexable⇒GA4 gate in the same PR · blob lifetime-counter conversion (Task 1's snapshot is its prerequisite) · capture honeypot + rate limit · header-file consolidation · asset fingerprinting (**promoted in importance**: it is the only cure for visitors already holding immutable copies) · scheduled metrics-warning check (the only thing that detects function-level capture failure) · Holmes Beach, homepage perf budget, privacy wording, `FORBIDDEN_SOURCE_PATH_PATTERNS` extension — each gated on the decisions now listed in `open-risks.md`.

**V2 lifetime-counter conversion is a CROSS-REPO coordinated change, not a site-only PR** (verified consumers of the windowed counter semantics): (a) seascape-hub `scripts/ingest-verification-receipts.py` + register docs + `tests/test_verification_receipt_ingester.py` — the TEST-vs-REAL owner-demand classification keys on `unlabeled_submissions`, and a cumulative jump could falsely read as new owner demand; registers need re-baselining and fixtures need updating in the same move; (b) seascape-ops `operator-copilot.js` parses receipt counts from the hub's `direct-booking-proof-board.md` (generated by analytics) — the board generator must update with the semantics; (c) seascape-analytics `live_guest_capture_proof.py` / `live_owner_lead_proof.py` baseline math subtracts proof-labeled receipt counts from `totalCaptures`/`totalSubmissions`. Ship with explicitly versioned semantics in the receipt (e.g. a `counter_semantics` field) and update all three consumers in the same coordinated batch. Note: the latest hub owner-lead-metrics receipt is already stale (`stale_after` 2026-06-04) — the next emission after any deploy is the first place a silent semantic drift would land.

**Needs more evidence:** structural redesign of smoke assertions (decouple from exact copy); a build-time marker-drift gate that asserts smoke-expected markers exist in `_site` (would catch copy drift at PR time instead of 3am — design requires the smoke scripts to export their markers); Telegram-via-Hermes alerting (pending drill outcome).

**Intentional cuts (revisit on trigger only):** property-registry module and shared-helpers refactor (trigger: property #6) · hook portability (trigger: a second machine exists) · git history rewrite (rejected — safety rails) · README/engines/eslint/CSP/pretest-double-build polish · image dedup · eleventy dead-wiring cleanup · owner-page style extraction (fold into next CRO batch).

## 8. First Implementation Prompt

> You are working in `/Users/sawbeck/Projects/seascape-vacations-site` (public repo; production site seascape-vacations.com). Task: **snapshot the two Netlify Blobs metrics stores before any other repo work begins.** Context: both stores clamp receipts to rolling windows (200 owner-lead receipts, 500 guest-capture receipts) and silently rotate older history away forever; a counter-semantics fix is planned later, and this snapshot is its baseline. This is a read-only operational task — make NO repo changes, NO commits, NO branches.
>
> Safety rules: read the auth token from `.env` or `.secrets.env` at the repo root (line `OWNER_LEAD_METRICS_TOKEN=...`). Never echo or log the token value, never put it in a URL query string, and never write the output files anywhere inside the repo — the repo is public.
>
> Steps:
> 1. `mkdir -p /Users/sawbeck/Documents/Claude/seascape-backups`
> 2. Load the token into a shell variable from `.env`/`.secrets.env` without printing it.
> 3. `curl -s -H "Authorization: Bearer $TOKEN" https://seascape-vacations.com/.netlify/functions/owner-lead-metrics > /Users/sawbeck/Documents/Claude/seascape-backups/owner-lead-metrics-2026-06-12.json`
> 4. `curl -s -H "Authorization: Bearer $TOKEN" https://seascape-vacations.com/.netlify/functions/guest-email-capture-metrics > /Users/sawbeck/Documents/Claude/seascape-backups/guest-email-capture-metrics-2026-06-12.json` (this endpoint accepts the same token as fallback).
> 5. Verify each file parses (`python3 -m json.tool < <file> > /dev/null`) and contains a `receipts` array.
>
> Success: both JSON files exist outside the repo, parse cleanly, and contain `receipts`. Report the receipt count and the top-level totals from each file (counts only — the receipts contain no PII by design, but do not paste full receipt contents). If either endpoint returns 401/503, STOP and report — do not retry with different credentials or modify anything. If the token line is absent from both env files, STOP and report.
