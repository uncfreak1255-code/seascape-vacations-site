# Seascape Vacations Site — Repository Audit
*2026-06-12 · analysis only, no files modified · method: 8 parallel dimension auditors + per-finding adversarial verification + completeness critic; every High/Medium finding below was re-verified first-party after a rate-limit killed 37 verifier agents mid-run. Severity tags are mine; **fact** = verifiable at the citation, **judgment** = opinion grounded in cited facts.*

*Revised 2026-06-12 after adjudicating a GPT-5.5 second-opinion review against 8 fresh read-only repo verifications: §5 and §6 replaced with the accepted V1/V2 plan; three findings corrected in place (marked ⟲). Adjudication tally: of the reviewer's 7 major findings, 3 accepted, 4 partially accepted, 0 fully rejected — with 4 of its factual premises refuted by repo evidence (guides have no shared layout to fix; the live-smoke trio needs no secrets; the cache stopgap must edit both header files, not one; the one-line `analytics-ga4.njk` include makes guides GA4 wiring low-risk, not bulk head surgery).*

## 1. Executive Summary

**Overall health: B+.** This is one of the more disciplined small-production repos I've audited: all eight dimensions came back fundamentally healthy, with zero Critical findings, zero leaked secrets, zero dependency vulnerabilities, and a custom enforcement layer (84 scripts, 58 of them tests, ~1,600 assertions) that most teams ten times this size don't have. The deductions are concentrated and ironic: **the repo's entire operating model is proof-gated, and the proof layer itself has the biggest holes.** Top 3 risks: (1) the measurement layer is silently broken — owner-funnel CTA clicks on the benchmark page (the page measuring your stated #1 bottleneck) are dropped because no tracking script loads, GA4 is absent from 40 of 164 built pages including nearly the whole guides family, and lifetime funnel counters silently clamp to a 200-receipt window; (2) CSS is served with a 1-year `immutable` cache at unversioned URLs while being edited in place, so returning visitors get broken styles after every CSS deploy; (3) the repo only operates safely on this one machine — `_site/` is ignored via machine-local config, git hooks hard-code `/Users/sawbeck` paths, and the live planning doc is invisible to git. Top 3 opportunities: a quick-wins batch of one-line fixes (stop publishing serverless source code, stop double-building CI, add the homepage to the perf budget); a single property-registry module that makes onboarding property #6 cheap instead of a five-file shotgun change; and one scheduled smoke workflow that closes the "broken lead capture goes undetected between deploys" gap.

## 2. Repo Map

**Purpose:** production marketing + direct-booking + owner-acquisition site for a 5-property vacation rental business, run by a solo founder with AI agents. Real revenue flows through guest email capture, booking links, and owner lead forms.

**Stack:** Eleventy 3.1.6 (Nunjucks), Node 24.14.0, Netlify (publish `_site`, build `node scripts/enforcement/build-site.js`), Netlify Functions + Blobs for lead capture/metrics, Playwright visual regression, Lighthouse CI budgets, `node --test` for everything else. 1,256 tracked files; 1 runtime dependency.

| Area | What it is |
|---|---|
| `src/` | Source truth: templates, `_data/` (properties, seoPages.json, governance), css, redirects, robots/llms.txt |
| `scripts/enforcement/` | The crown jewel: build wrapper, content-voice gate, link/JSON-LD/redirect validators, release gate — most with sibling tests |
| `scripts/recovery/`, `scripts/cache/`, `scripts/evals/` | Live smoke checks, Hostaway build cache, eval harness |
| `netlify/functions/` | 8 serverless functions: guest email capture (→ Mailchimp), owner lead metrics, token-gated metrics/proof-label reads |
| `docs/` | The SEO operating system: status contract, briefs, style gates, portfolio routing, runbooks — verified accurate against code |
| `.github/workflows/` | 3 real gates: pr-check (build+test+audit+Lighthouse), release-safety (diff-range gate), playwright-visual |
| Repo root | **Surprising:** live deploy assets (hero images, `_headers`) interleaved with ~85MB of tracked legacy — old `index.html` (5,911 lines), `stays/`, `property-management/`, `area-guide-*.html`, `dashboard/`, `emails/`, the 84MB `DEPLOY THIS FOLDER TO NETLIFY/` |

**Data flow:** Hostaway → build-time cache sync → `src/_data/properties.js` (fallback JSON if offline) → templates; output validated post-build; per-property pages are *committed templates* kept in sync by a regex-patching script rather than rendered from data.

**Lighter-review areas:** prose content of individual guide/stays pages, `scripts/seo|guides|archive` interiors, `plugins/seascape-seo-os`, the skill layer under `.claude/`/`.agents/`, and the DEPLOY folder (excluded as archival).

## 3. Audit Report

### Measurement & analytics — the real problem area *(surfaced by completeness pass; all first-party verified)*

- **HIGH · fact — Owner money page ships dead CTAs.** `src/research/owner-fee-revenue-leak-benchmark-2026.njk:937` (also :981, :1173) has `data-track-event="owner_primary_cta_click"` CTAs, but the built page contains **zero** script tags — no `conversion-tracking.js`, no GA4. ⟲ *Corrected on re-verification: this is the **only** route with dead CTAs — the sibling route `how-seascape-protects-owner-net-2026` has no `data-track-event` markup; it is missing GA4 only (covered by the GA4-gap finding below).* Every click on the page measuring your #1 bottleneck is silently dropped, while `verify:owner-funnel-routes` passes green (it only asserts HTTP 2xx + keywords, `scripts/recovery/assert-owner-funnel-routes.js:45-57`).
- **HIGH · fact — GA4 absent from 40 of 164 built pages** — all 4 `/research/` pages and ~35 guides. The guides carry the Meta pixel and `conversion-tracking.js` but no GA4 loader; the fallback in `conversion-tracking.js:215-228` pushes to a dataLayer nothing reads. Commit `244e1c67` wired GA4 into only 9 guides; the rest were never done. Organic landings on your strongest non-brand SEO assets are invisible in GA4.
- **MEDIUM · fact — Funnel totals clamp to a rolling window.** `netlify/functions/_owner-lead-metrics.js:122-127`: receipts sliced to last 200, then `totalEvents`/`totalSubmissions` recomputed *from the windowed array* — lifetime counts silently become a decaying window past 200 events. No export/backup of either blob store exists (metrics loss, not lead loss — leads also live in Netlify Forms/Mailchimp).
- **MEDIUM · fact — Redirect/page contradiction:** `src/_redirects:316` 301s `/stays/holmes-beach-vacation-rentals` away, yet the slug is still in `seoPages.json`, builds indexable, and is in the sitemap. Netlify shadows non-forced redirects with existing content, so Google gets contradictory signals. `validate-redirect-targets.js` checks only that `to` resolves — it can't catch a `from` that still builds.
- **LOW · fact** — GA4/pixel IDs hardcoded in 3+ places with asymmetric localhost suppression (`homepage.js:2` sends real hits from local dev). **LOW · judgment** — privacy/cookies pages don't disclose GA4 or the Meta pixel while claiming only name/email/phone collection.

### Security — *healthy*; hardening gaps only, no exposure

Verified strengths: PII-minimized receipts (hashed IDs, never raw emails in Blobs), token-gated metrics that fail closed (503/401 — verified live), no secrets in tracked source, `.env` ignored, HSTS live, honeypot on the owner Netlify form, no CI injection surface.

- **MEDIUM · fact — Serverless function source is publicly served.** `addPassthroughCopy("netlify")` at `eleventy.config.js:117` copies all 8 functions into `_site`; verified live: `https://seascape-vacations.com/netlify/functions/guest-email-capture.js` returns 200. No secrets inside (env-only), but it hands anyone the exact auth surface and store names — and a future careless edit becomes instantly public (a hardcoded Google API key already happened once, commit `07be19d7`). Netlify deploys functions from the repo dir, so the line is pure liability. One-line fix.
- **MEDIUM · fact — No rate limit/honeypot/captcha on the public capture endpoint** (`netlify/functions/guest-email-capture.js:213-233`): any POST with `email.includes("@")` upserts into the real Mailchimp audience — list-poisoning and quota-burn vector.
- **LOW** — metrics token accepted via `?token=` query param (logs/Referer leak path); no CSP/Referrer-Policy (hardening, not a hole); `submission-created` forgeable → metrics pollution only.

### Architecture & design — *healthy*; debts concentrated and known

Verified strengths: 41-line build wrapper that orchestrates Eleventy instead of fighting it; page volume is data-driven (`seoPages.json` pagination); validators parse `docs/portfolio/*.md` as the route registry; functions cleanly isolated; legacy quarantined by enforcement (`FORBIDDEN_SOURCE_PATH_PATTERNS`), not just docs.

- **MEDIUM · fact — Deploys fail closed on live Hostaway availability** (`scripts/enforcement/validate-properties-availability-output.js:8`: required when `NETLIFY === "true"`). A booking-engine outage blocks *all* deploys, including emergency fixes; the escape hatch (`SEASCAPE_SAFE_PROPERTY_PROJECTION_PATH`) would be wired up under pressure.
- **MEDIUM · judgment — Dual property-truth mechanism:** catalog renders from data; the 5 property pages are committed templates regex-patched by `scripts/regenerate-property-surfaces.js:230` (`writeFileSync` into `src/`). Fails closed and well-tested, but prose claims sit outside the patch surface — and prose drift is your documented #1 content risk.
- **MEDIUM · judgment — Property count/slugs hardcoded across 5+ modules** (`properties.js`, cache sync, output validator, recovery asserts, fallback JSON…). Onboarding property #6 — the growth path your #1 business goal exercises — is a multi-file shotgun change.
- **MEDIUM · fact — Bidirectional `src/_data` ⇄ `scripts/cache` imports** (verified both directions) plus four env-dependent build modes; no single module owns the property domain.
- **MEDIUM · fact — Root legacy only partially quarantined:** `scripts/enforcement/lib.js:4-9` guards 4 patterns; `area-guide-*.html`, `dashboard/`, `emails/` are tracked, unguarded, unreferenced — drift bait with old property claims, ~85MB dead weight.
- **LOW · fact** — vestigial eleventy.config wiring (watch target on nonexistent root `_data/`, dead `css`/`js` passthroughs, `_redirects`/llms/robots copied twice); `toHostawayCdn` ×3 with divergent width/quality defaults (800/1200/1600 — verified).

### Code quality — *healthy*; fixable in hours, not weeks

- **MEDIUM · fact — The highest-traffic capture endpoint is the least robust:** unguarded `JSON.parse` (500 instead of 400) at `netlify/functions/guest-email-capture.js:218`; the Blobs write (lines 230-233) is unwrapped *and ordered after* Mailchimp success — a transient Blobs failure shows the guest an error after they were already subscribed. Both resilient patterns exist in sibling functions (`submission-created.js:39-55` try/catch+log; proof-label's guarded `parseRequestBody`) — verified.
- **MEDIUM · fact — Zero logging on the money path:** three `catch (_error)` blocks; failures become blob warning strings only. A revoked Mailchimp key degrades capture indefinitely with nothing in function logs.
- **MEDIUM · fact — Copy-paste drift:** `resolveWritableStore` ×4 (verified), `request()` ×3 with diverging http/redirect handling, `extractJsonLdBlocks` ×3.
- **MEDIUM · judgment — 3,241-line owner money page** (`src/property-management/index.njk`, ~2,292 lines of `<style>`): your most-edited page has the largest accidental-regression surface. Mitigated by strong rendered-output tests.
- **LOW** — silent swallows + no socket timeout in build-time fetches; inline minified nav script in property pages duplicating an existing partial.

### Performance — *healthy*; edges, not core

Verified strengths: AVIF/WebP preloaded hero (64KB mobile vs 4.3MB original), self-hosted preloaded fonts, deferred GA4/pixel, real Lighthouse budgets failing PRs, Blobs bounded, lean HTML.

- **HIGH · fact — Unfingerprinted CSS + 1-year `immutable`:** `netlify.toml:17-20` vs unversioned links (`src/_includes/layouts/base.njk:51`, `index.njk:96`) on files edited in place (7 commits to homepage.css). Returning visitors keep year-old CSS against new HTML after every CSS deploy — an ongoing, invisible breakage for exactly your repeat guests and owner-funnel visitors. Same applies to in-place-regenerated hero images. ⟲ *Extended on re-verification: `/*.js` has the identical defect — `conversion-tracking.js` and `homepage.js` are unversioned and edited in place under the same immutable rule, which would silently blunt any tracking fix until the cache stopgap ships. Also: the rules are duplicated in **both** `netlify.toml` and the root `_headers` file (byte-identical where they overlap, divergent coverage), so the stopgap must edit both files identically to sidestep unknown precedence.*
- **MEDIUM · fact — Perf budget never measures the homepage**, which already violates it: `homepage.css` is 59,276B against the 50,000B budget (`lighthouserc.js:23`); `scripts/perf/money-routes.js` omits `/`.
- **MEDIUM · fact** — blanket root glob ships an unreferenced 4.35MB `hero.jpg` + 400KB unoptimized logos; **LOW · fact** — 5 byte-identical copies of one 229KB image under different URLs (md5-verified); cache headers duplicated and already diverged between `netlify.toml` and `_headers`; PR CI builds twice (`pretest` + explicit build step — verified).

### Testing — *a standout strength*

All 8 functions unit-tested with injected mocks (incl. PII-stripping and exact Mailchimp call sequences); validators tested as black-box CLIs against tmpdir fixture sites; regeneration tested end-to-end; live-smoke validators unit-testable offline; deterministic visual gate + axe spec that genuinely fails PRs. Two real issues:

- **MEDIUM · fact — 259MB of the 346MB `.git` is screenshot-baseline history** (+ a 39MB committed deploy zip); each refresh adds ~30MB forever; `macos-latest` unpinned + `maxDiffPixels: 100` risks forced mass re-baselines; `release-safety` clones with `fetch-depth: 0`.
- **MEDIUM · judgment — Revenue-critical live smoke is manual-only** — no `schedule:` trigger anywhere; failures between deploys go undetected until someone runs the commands. **LOW** — `Module._load` monkey-patch never restored in the capture test.

### Dependencies — *healthy*, one line of watch-items

0 vulnerabilities, all 6 packages current, dependabot active and merged same-day, single Node pin honored everywhere, no license risk. Watch: the `overrides` block is exact-pinned and dependabot won't maintain it — a future advisory against a pin hard-fails the audit gate and blocks all merges until hand-edited (document which advisory each pin addressed); no `engines` field; local `node_modules` was stale vs lockfile (machine state — run `npm ci`).

### DevEx & operations — *healthy on this machine only*

- **MEDIUM · fact — Single-machine coupling, three forms (verified):** `package.json:10-12` git-safety scripts point at `/Users/sawbeck/bin`; both `.githooks` invoke `~/.codex/guardrail-kit` under `set -eu`. ⟲ *Corrected on re-verification: `core.hooksPath` is only wired by the manual `npm run setup:hooks` (no `prepare`/`postinstall`), so a fresh clone doesn't fail commits — it runs **no hooks at all**, which is a different gap (no guardrails) rather than a hard breakage. Hook portability is deferred until a second machine actually exists.* **`_site/` is ignored only via machine-local `.git/info/exclude:14`** — tracked `.gitignore` covers only `_site/research/`, so on any fresh clone `git add -A` stages 164 generated files, violating your own hard rule with zero versioned enforcement.
- **MEDIUM · fact** — `.env.example` documents dead Hostaway/Stripe credentials (no code reads them — verified) and omits the metrics tokens, Blobs config, and `SEASCAPE_*` switches the functions actually read (it *does* cover the three Mailchimp vars — the auditor's claim was overstated there). Its own header says to copy it into the Netlify dashboard.
- **LOW** — no root README in a public repo; no JS linter (modest gap; the bespoke test layer is the real gate).

### Documentation — *unusually healthy*

CLAUDE.md verified accurate (9/9 commands exist, all referenced docs exist, reread contract followed exactly, AGENTS.md consistent, runbooks routing table real). Gaps: **MEDIUM** — the enforcement build pipeline exists only in code, and the money-path functions have **no runbook** ("lead capture broken" is missing from the routing table) despite owner leads being the stated #1 bottleneck; **MEDIUM** — `content-priorities-2026-03.md` is stale tracked truth while its live successor is excluded via machine-local config (unversioned, invisible on any other clone); **LOW** — `source-of-truth.md` omits `dashboard/`, `emails/`, `area-guide-*.html`; two unindexed plan directories.

## 4. Improvement Strategy

**Theme 1 — Trust your measurement.** *(H1, H2, metrics clamp, redirect conflict, no monitoring)* Principle: a proof-gated operating system is only as honest as its sensors. Target: every indexable page carries the standard analytics stack; every `data-track-event` has a live handler; funnel totals are lifetime-accurate; a scheduled check guards all of it. **Done signals:** a CI test fails any page with `data-track-event` but no tracking script; GA4 shows page_views for the guides family; a weekly workflow is green; `totalSubmissions` survives receipt #201.

**Theme 2 — Publish and cache only what you mean.** *(CSS immutable, function source, hero.jpg, dup images, header dup)* Principle: explicit allowlists over globs; fingerprint or revalidate. **Done:** deploy a CSS change, curl as a returning visitor, get the new styles; `/netlify/functions/*.js` → 404; one headers file.

**Theme 3 — Make the repo survive a second machine.** *(machine-local `_site` ignore, absolute-path hooks, excluded planning doc)* Principle: rules that matter must be versioned. **Done:** fresh clone + build + `git add -A` stages nothing generated; commit on a clean machine works (hooks degrade with a warning, not a failure).

**Theme 4 — Collapse duplicated truth.** *(property registry, shared helpers, dual property mechanism)* Principle: one module owns the property domain; helpers live in one place. **Done:** adding a property touches ≤2 files plus its template; one `toHostawayCdn` export.

**Explicitly NOT fixing now:** no git-history rewrite (your own rules forbid force-pushes; mitigate forward with LFS/clipped baselines); no monolith decomposition beyond style extraction (tests compensate — fold into the next CRO batch); no CSP/eslint ceremony beyond minimal optional versions; no touching the DEPLOY folder; no enterprise observability stack — one scheduled workflow is the right size.

## 5. Task Plan (revised after second-opinion adjudication)

Supersedes the original M0–M3 plan. Each PR: feature branch, `npm run build` + relevant tests before and after, diff audit, `npm run lint:content` when public copy changes. Rollback for every V1 PR is `git revert` + redeploy — no migrations, no data changes in V1.

### V1 — Trust the money path (6 single-purpose PRs, in order)

**PR1 — Stop publishing function source.**
- Delete `addPassthroughCopy("netlify")` at `eleventy.config.js:117`; add `expectNotExists("_site/netlify")` to `scripts/recovery/assert-build-output.js` as a regression guard.
- Verified safe: no `[functions]` block in `netlify.toml` — Netlify deploys functions from `netlify/functions` by platform default, independent of `_site`; the only repo reference to `_site/netlify` is an assertion that a legacy file must NOT exist (`assert-build-output.js:192`).
- Accept: build passes; `_site/netlify` absent; post-deploy curl of the live source URL → 404; live endpoint still answers (GET to `guest-email-capture` returns 405, not 404). Risk: low.

**PR2 — Version the `_site` ignore.**
- Add `_site/` to tracked `.gitignore` (today only `_site/research/` at line 34; the full ignore lives in machine-local `.git/info/exclude:14`). Verified: zero tracked files under `_site/`, no conflict. Optionally extend `scripts/enforcement/pre-commit.js` to reject staged generated output.
- Accept: `git check-ignore -v _site/index.html` attributes to the tracked `.gitignore`. Risk: minimal.

**PR3 — Tracking gate + research-route GA4 (test-first, one PR so CI never merges red).**
- Commit 1: new assertion in the rendered-route-contract test family — any built page whose `extractTrackedEvents` (`scripts/enforcement/rendered-route-contract.js:111-126`) is non-empty must include `/assets/js/conversion-tracking.js`, honoring the homepage runtime-loader exemption already encoded in `scripts/recovery/assert-direct-booking-event-smoke.js:73-78`. Demonstrated red against the benchmark page (the sole offender — verified).
- Commit 2: add `{% include "partials/analytics-ga4.njk" %}` before `</body>` in the 4 research pages (`owner-fee-revenue-leak-benchmark-2026.njk`, `how-seascape-protects-owner-net-2026.njk`, `gulf-coast-vacation-rental-chart-pack-2026.njk`, `research/index.njk`) — the exact mechanism 8 guides + 3 research pages already use; the partial carries both the GA4 loader and `conversion-tracking.js`, and adds no Meta pixel.
- Accept: gate red on base commit, green after; built benchmark page contains both scripts; `lint:content`, full tests, `test:visual` pass (script-only change, no visual delta expected). Risk: low.

**PR4 — Cache stopgap for in-place-edited text assets.**
- In BOTH `netlify.toml` and `_headers`, change `/*.css` and `/*.js` from `public, max-age=31536000, immutable` to `public, max-age=0, must-revalidate` (the existing `/*.html` value). Both files must change identically — values are byte-identical where patterns overlap, precedence between the files is undocumented, so editing both sidesteps it. Image rules untouched until V2 fingerprinting (in-place-regenerated heroes remain exposed until then).
- Explicitly weaker than fingerprinting — accepted cost: one conditional request (cheap 304) per asset per visit; correctness for returning visitors wins.
- Accept: preview-deploy `curl -I` on `/css/homepage.css` and `/assets/js/conversion-tracking.js` shows the new header; no other rules changed; post-deploy spot-check on production. Risk: medium (cache behavior) — verification is the mitigation.

**PR5 — Guest capture hardening, narrow.**
- In `netlify/functions/guest-email-capture.js`: guard the `JSON.parse` at line 218 → 400 (copy proof-label's `parseRequestBody` pattern); wrap the Blobs read-merge-write (lines 230-233) in try/catch + structured `console.error`, returning success with `stored:false` since Mailchimp already succeeded (copy the `submission-created.js:39-55` pattern verbatim); add `console.error` inside the three silent `catch (_error)` blocks, keeping the existing warning strings.
- No honeypot/rate-limit in V1 (moved to V2). New tests: malformed body → 400; `store.set` throws after Mailchimp success → 200 + logged (verified: none of the 18 existing test cases cover either).
- Accept: new + existing tests green. Risk: low-medium — live capture path, but every change copies a pattern already proven in sibling functions.

**PR6 — Scheduled live smoke, token-free.**
- New `.github/workflows/live-smoke.yml`: `workflow_dispatch` + the three `verify:*` scripts (verified: no env vars, no secrets, public URLs only — the metrics-token check is V2). Run manually twice; if clean, follow-up commit enables daily cron. Failure channel: GitHub's native failure email until Open Q2 says otherwise.
- Accept: two clean dispatch runs, then a clean scheduled run. Risk: low; new operational debt ~zero.

### V2 — next wave (each its own PR, rough order)

1. **Guides GA4 batch** — one-line `analytics-ga4.njk` include before `</body>` in the 37 unwired guides (verified mechanism: guide `.html` files are processed as Nunjucks, no shared layout exists, the include is already used by 8 guides), PLUS the broad "indexable ⇒ GA4" gate assertion in the same PR so it lands green and prevents regression. `lint:content` + `test:visual` + spot rendered-diff audit.
2. **Blob export + lifetime counters** — export FIRST via the token-gated GET endpoints (poor-man's snapshot; receipts already rotated out of the window are unrecoverable), then convert the windowed recomputes (`_owner-lead-metrics.js:126-130`, `_guest-email-capture-metrics.js:324`) to the cumulative `+1` pattern that already exists in the same files (`funnelBySourcePageSlug`, `byPagePath`); seed from current values, accept the clamped floor as "since tracking began".
3. **Capture honeypot + rate limit** — hidden field in the popup form + reject in the function (copy the `netlify-honeypot="bot-field"` pattern from `owner-evaluation-form.njk:11,27-29`); prefer Netlify platform rate-limit config over hand-rolling.
4. **Header consolidation** — fold `_headers` into `netlify.toml`, delete `_headers` (preserve its `/stays/*` and `/property-management/*` rules and netlify.toml's avif/webp rules).
5. **Asset fingerprinting** — content-hash query or filename via an Eleventy filter (~4 link sites, verified), then restore long cache for fingerprinted assets.
6. **Scheduled metrics-warning check** — extend the live-smoke workflow with the token-gated metrics read (`Authorization: Bearer`, token as Actions secret; never `?token=`), failing if `marketing_api_*` warning counts grow.
7. **Holmes Beach resolution** (after Open Q1) + extend the redirect validator to fail on `from` paths that still build.
8. **Homepage perf budget** (after Open Q4) — verified: adding `/` today fails CI twice over (59,276 B single file and 74,975 B total vs the 50,000 B error-level budget), so it cannot land before the budget decision.
9. **Privacy/cookies disclosure wording** (after Open Q3).
10. **Extend `FORBIDDEN_SOURCE_PATH_PATTERNS`** to `area-guide-*.html`, `dashboard/`, `emails/`.

### Out of scope (revisit on trigger, not on schedule)

- Property-registry module + shared-helpers refactor (former M2) — revisit before onboarding property #6.
- Hook portability (former T15) — deferred; verified that fresh clones run no hooks at all (`core.hooksPath` is only wired by manual `npm run setup:hooks`), so nothing is bleeding. Right shape later: existence-check fallback that still runs repo-local `scripts/enforcement/pre-*.js` and warns about the missing kit.
- Legacy root deletion — gated on Open Q5.
- Git history rewrite — rejected (own safety rails forbid force-pushes); mitigate forward via baseline weight strategy (clip viewports or LFS, pin runner image) when the next re-baseline happens anyway.
- README/`engines`/eslint/CSP/pretest-double-build polish (former T22), `.env.example` truth pass (T16), lead-capture runbook + build-pipeline doc (T17), content-priorities versioning (T18), image dedup (T20), eleventy dead-wiring cleanup (T21), owner-page style extraction (T23 — fold into next CRO batch).

## 6. Open Questions

Blocking V2 items only; **nothing blocks V1**.

1. **Holmes Beach page** (blocks V2 #7) — was the 301 consolidation intended to retire the page (then remove the slug from `seoPages.json`) or is the redirect stale (then delete the rule)? Which URL is canonical?
2. **Alerting channel** (upgrades V1 PR6 / V2 #6) — is GitHub failure email enough for the scheduled smoke, or wire Telegram via Hermes?
3. **Tracking policy** (blocks V2 #9 only) — confirm Meta pixel scope (it currently fires on legal pages) and approve privacy/cookies disclosure wording. The GA4 include adds no pixel, so V1/V2 GA4 wiring is NOT blocked — only the disclosure fix is.
4. **Stylesheet budget** (blocks V2 #8) — 50 KB is error-level and the homepage fails it twice over today (59,276 B single file; 74,975 B total). Raise knowingly or slim `homepage.css`?
5. **Legacy root residue** (blocks the out-of-scope cleanup) — `dashboard/`, `emails/`, `area-guide-*.html`, root `index.html`/`stays/`/`property-management/`: archive-tag-then-delete (recommended) or keep quarantined?

Standing, non-blocking: git-history size (live with 346 MB + forward-only mitigations) and owner-page decomposition timing (fold into the next CRO batch vs wait for a real regression).
