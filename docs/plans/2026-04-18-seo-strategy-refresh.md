<!-- /autoplan restore point: /Users/sawbeck/.gstack/projects/uncfreak1255-code-seascape-vacations-site/codex-seo-audit-2026-04-18-autoplan-restore-20260418-154828.md -->
# Seascape SEO Strategy Refresh

Date: 2026-04-18
Refreshes: `docs/plans/2026-04-01-seo-strategy.md`
Grounded in:
- `docs/reports/2026-04-18-full-seo-audit.md`
- `docs/reports/2026-04-18-seo-action-plan.md`
- `docs/status/current-state.md`
- `docs/status/next-batch.md`
- 2026-04-18 operator reads from `seascape-analytics`

## Hard Read

This is not a strategy-reset problem. It is an authority-transfer and click-yield problem.

The evidence is blunt:

- the guide-winner cluster already has demand: `10,591` impressions, `19` clicks, `0.18%` CTR, average position `2.38` over the last 7 complete days
- owner money pages are ranking without earning the click: `3,738` impressions, `4` clicks, `0.11%` CTR, average position `4.68` over the last 28 days
- stay money pages still do not deserve expansion: `502` impressions, `0` clicks, average position `35.98` over the last 28 days
- the highest-value stay page is still technically weak: `/stays/anna-maria-island-vacation-rentals/` measured `5.36s` LCP in the live audit
- the release smoke has a stale assertion, which means part of the verification layer is noisy right when the repo needs tighter gates

The mistake would be to answer that with more pages.

## What Someone Better Would Do Differently

Someone already running this category well would do four things differently from the average SEO operator:

1. They would treat the winning guides as distribution infrastructure, not as the finish line.
2. They would stop writing fresh owner pages until the already-ranking owner pages get materially better click yield.
3. They would treat stay-page underperformance as a page-quality and handoff problem before calling it a topic-gap problem.
4. They would fix verification noise before trusting release checks as decision support.

That is the gap between "doing SEO work" and actually moving the business.

## Strategic Call

For the next 90 days, the right sequence is:

1. finish winner-guide convergence
2. fix the stale live-smoke assertion so release verification means something again
3. prepare `owner-ctr-rewrite-round-2`, but only open it when the 7-day recrawl gate clears
4. treat stay work as CRO and performance repair, not page-family expansion
5. keep AI/entity work constrained to low-cost clarity improvements until money-page behavior improves

## Business Reality

Seascape is still a hybrid:

- guest direct-booking business
- owner acquisition business
- local comparison and travel publisher

That means the site cannot be run like a pure inventory portal, pure local-service site, or pure publisher.

The winning shape remains:

- one domain
- two funnels
- one guide wedge

## Strategic Thesis

The comparison guides are already doing the hard part: winning discovery.

The business leak is downstream:

- guide authority is not transferring aggressively enough into money pages
- owner pages look rank-worthy but not click-worthy
- stay pages are getting some attention without proving they can move users deeper into the booking path

So the strategic rule is simple:

No new serious page unless it fixes one of those three leaks.

## Current Baseline

### Full-domain baseline carried from the April 1 strategy

| Metric | Baseline |
|---|---:|
| GSC clicks / last 28 days | `356` |
| GSC impressions / last 28 days | `65,199` |
| GSC CTR | `0.55%` |
| GSC average position | `7.9` |
| Live sitemap URLs | `141` |

### Fresh April 18 execution baseline

| Metric | Baseline |
|---|---:|
| Guide winners / 7 complete days | `10,591` impressions / `19` clicks / `0.18%` CTR / `2.38` avg pos |
| Owner money / 7 complete days | `764` impressions / `0` clicks / `0.00%` CTR / `5.10` avg pos |
| Owner money / 28 days | `3,738` impressions / `4` clicks / `0.11%` CTR / `4.68` avg pos |
| Stay money / 28 days | `502` impressions / `0` clicks / `35.98` avg pos |
| `/stays/anna-maria-island-vacation-rentals/` live LCP | `5.36s` |
| Audit health score | `74 / 100` |

## What Is Working

- comparison guides remain the strongest nonbrand entry point
- sitemap, redirects, schema validation, and crawlability are broadly intact
- `llms.txt` and AI crawler access are live
- owner-intent pages already have ranking traction, which means the problem is not topic selection
- the repo now has enough enforcement that execution can be measured instead of guessed

## What Is Not Working

- too many guide families still need stronger convergence and clearer winner ownership
- owner pages rank without enough proof, snippet strength, or above-the-fold specificity
- stay pages are commercially thinner than the SERP they are trying to win
- reviewer/date treatment is still inconsistent on too many guides
- owner money pages are underrepresented in `llms.txt` relative to the business priority
- one of the release smoke checks is stale, which makes the safety layer less trustworthy than it should be

## 90-Day Priorities

### Priority 1: Finish guide convergence

Reason:
- the 7-day operator read still says the next branch should be `winner-guide-consolidation`

Definition:
- reduce variant leakage in the existing comparison families
- keep canonical winners obvious in redirects, sitemaps, `llms.txt`, and in-body links
- route the winning comparison guides harder into the correct stay and owner pages

### Priority 2: Improve owner click yield

Reason:
- owner pages are already ranking in positions where better pages should be able to earn clicks

Definition:
- strengthen titles and descriptions only where the page-level read proves a snippet problem
- strengthen above-the-fold proof, benchmarks, and assumptions on fees and licensing
- keep VRBO positioned as a support page unless the query cluster proves otherwise

### Priority 3: Repair stay-money quality before expansion

Reason:
- stay pages are not yet showing a case for more page-family sprawl

Definition:
- improve LCP and page speed on the main AMI stay page
- tighten value-fit language, inventory honesty, and CTA handoff
- fix image sizing and lazy-loading gaps on priority stay pages

### Priority 4: Tighten AI and E-E-A-T surfaces cheaply

Reason:
- this matters, but it is not the current bottleneck

Definition:
- add owner money pages to `llms.txt`
- improve visible reviewer/date treatment on priority guides and money pages
- only expand author/entity surfaces if they can be kept maintained

## What To Stop Doing

- stop confusing impressions with progress on the stay cluster
- stop writing new owner pages before the existing ranking owner pages earn clicks
- stop using another site-wide audit as a substitute for a branch decision
- stop treating the homepage as the main AI-search scoreboard
- stop broad metadata cleanup on pages with no demand
- stop trusting a stale smoke check just because it is automated

## KPI Targets

The primary scorecard must track business movement first. SEO metrics still matter, but they are diagnostic. They are not the finish line.

### Primary Business Scorecard

| KPI | Current baseline / rule | What counts as progress |
|---|---|---|
| Owner money-page CTA and lead movement | The current rewrite gate still assumes combined `owner_form_submits = 0`, and the decision split lives in `docs/status/next-batch.md`: snippet problem if impressions/position/CTR thresholds clear, page CRO if sessions `>= 20` and `owner_primary_cta_clicks = 0`, form friction if CTA clicks appear but submits stay at `0` | The next owner branch should be judged by real `owner_primary_cta_click` and `owner_form_submit` movement on the owner money pages, not by CTR alone |
| Guide-to-money-page transfer | `docs/portfolio/winner-guides.md` says the winner guides should produce `guide_book_direct_clicks >= 1` once sessions reach `20`; otherwise treat the guide as a feeder failure | The winner guides start sending measurable handoff traffic into the intended stay money pages |
| Stay-page commercial handoff | April 18 audit: `/stays/anna-maria-island-vacation-rentals/` had `36` GA4 sessions and `0` `stay_view_property_clicks`; `/stays/anna-maria-island-beachfront-rentals/` had `38` sessions and `10` `stay_view_property_clicks` | The AMI winners produce property-detail exploration on real sessions and stay work remains frozen until the `docs/status/next-batch.md` gate actually opens |
| Direct-book path handoff | `booking_engine_handoff` is tracked in the current conversion layer, but the April 18 package does not yet surface a clean numeric baseline for it | Future branch reads should treat booking handoff as a real business KPI, not just an implementation detail |

### Diagnostic SEO KPIs

These are still worth tracking because they explain why the business KPIs move or stall. They should not be mistaken for business success by themselves.

| Metric | Baseline | 3 Month | 6 Month | 12 Month |
|---|---:|---:|---:|---:|
| Overall GSC clicks / 28 days | `356` | `425+` | `550+` | `700+` |
| Overall GSC CTR | `0.55%` | `0.70%+` | `0.85%+` | `1.00%+` |
| Owner money CTR / 28 days | `0.11%` | `0.30%+` | `0.45%+` | `0.60%+` |
| Owner money clicks / 28 days | `4` | `12+` | `24+` | `40+` |
| Priority legacy-family impressions | `7,749` | under `3,000` | under `1,000` | near-zero on tracked families |
| `/stays/anna-maria-island-vacation-rentals/` LCP | `5.36s` | under `3.5s` | under `2.8s` | under `2.5s` |
| Priority guides plus money pages with visible reviewer/date treatment | low and inconsistent | top `8` pages covered | top `15` pages covered | default on all priority families |
| `llms.txt` coverage of priority money pages | guest-heavy / owner-light | both owner and guest priorities present | maintained | maintained with periodic review |

## Success Criteria

- winner-guide families stop leaking authority to variant URLs
- winner guides send real handoff traffic into the intended money pages instead of acting like isolated publisher wins
- fees and licensing pages produce owner CTA and lead movement instead of just a prettier SERP profile
- the AMI stay winners produce property-detail exploration on real sessions before any stay expansion reopens
- owner and stay pages are easier for AI systems to retrieve because the discoverability surfaces agree with the current money-page priorities
- the next branch decisions come from measured gates, not guesswork

## Decision Rule

Before any new SEO batch, ask:

1. Is the page family already getting impressions?
2. Is the failure ranking, click yield, or on-page handoff?
3. Does this batch strengthen an existing money page or just create another URL?
4. Is the release gate trustworthy enough to catch the likely regression?
5. Does the change match `docs/status/next-batch.md`, or are we freelancing?

If question 3 is "mostly another URL," do not ship the batch.
If question 4 is "not really," fix the verification layer first.

## AUTOPLAN INTAKE

- Base branch detected: `main`
- Execution checkout: `/Users/sawbeck/.codex/worktrees/seascape-vacations-site-codex-seo-audit-2026-04-18`
- Active branch: `codex/seo-audit-2026-04-18`
- Restore point: `/Users/sawbeck/.gstack/projects/uncfreak1255-code-seascape-vacations-site/codex-seo-audit-2026-04-18-autoplan-restore-20260418-154828.md`
- Canonical review target: this strategy refresh file
- Supporting context actually used: the April 18 action plan, full audit, competitor refresh, `docs/status/current-state.md`, `docs/status/next-batch.md`, the winner-guide and targeted-reread briefs, `src/llms.txt`, `src/stays/stays.njk`, `src/property-management/index.njk`, `src/property-management/property-management.njk`, `src/_data/seoPages.json`, `scripts/recovery/assert-live-smoke.js`, `scripts/enforcement/seo-structure.test.js`, `scripts/enforcement/owner-acquisition.test.js`, `scripts/enforcement/guide-conversion.test.js`, and `scripts/enforcement/booking-handoff.test.js`
- Premise gate: treated as pre-confirmed by the user's explicit implementation brief. The user already narrowed the question to branch order and gate drift for the April 18 SEO refresh. Final approval gate remains open below.
- UI scope: `no`
- Why UI scope is `no`: this plan changes sequencing, gating, proof surfaces, routing, perf priorities, and verification inside existing templates. It does not specify a new component set, state model, responsive contract, or interaction design system.
- Outside voices:
  - CEO: `codex + subagent`
  - Eng: `codex + subagent`
- Generated noise excluded from review scope: `_site/`, `tmp/`

## Decision Audit Trail

| # | Phase | Decision | Why | Rejected |
|---|---|---|---|---|
| 1 | CEO | Use `SELECTIVE_EXPANSION` | The April 18 plan is directionally right, but its KPI framing, branch boundaries, and gate language are too loose. | Full restart |
| 2 | CEO | Keep this file as the anchor artifact | The thesis, sequence, KPIs, and gating logic all live here, so review notes belong here instead of being split into another doc. | Reviewing the whole April 18 folder as one blob |
| 3 | CEO | Keep `winner-guide-consolidation` first, but compress it to bounded verification and source cleanup | The 7-day operator read and action plan still point there, but both outside voices warned against turning that into another broad guide sprint. | Full owner-first reorder |
| 4 | CEO | Treat the stale smoke fix as immediate execution-path work | The live smoke gate currently contradicts enforced source truth, so leaving it stale corrupts every later release read. | Parking the smoke fix as “later cleanup” |
| 5 | CEO | Raise KPI hierarchy reframing as a user challenge, then apply it after user approval | Both CEO voices independently flagged that this plan can “win SEO” and still miss the business because owner/direct-book outcomes were not primary KPIs. The user approved the change and the scorecard above now reflects it. | Quietly keeping proxy metrics as the top scorecard |
| 6 | CEO | Allow owner prep only as framing reuse, not as an ungated rewrite batch | Existing owner proof, CTA, and tracking systems already exist. The next owner branch should reuse them after the recrawl/read gate clears. | Starting another broad owner rewrite immediately |
| 7 | Global | Reconcile the guide baseline mismatch before implementation | This file cites `10,591` guide-winner impressions for the 7-day read, while the active guide brief cites `5,768`. That is big enough to weaken confidence in the branch thesis if left unexplained. | Hand-waving the mismatch as noise |
| 8 | Design | Skip Design review | No real UI scope was detected. Running design review here would be ceremony. | Forcing a design pass off false positives like “page” and “CTA” |
| 9 | Eng | Rewrite the stay phase as contingent prep, not an active workstream | `docs/status/next-batch.md` still gates stay CRO/perf behind fresh crawls, `>= 1000` impressions, and `stay_view_property_clicks = 0`. | Treating stay work as ready now |
| 10 | Eng | Treat owner/stay implementation as shared-template work with real collision points | `src/_data/seoPages.json`, `src/stays/stays.njk`, `src/property-management/property-management.njk`, and tracking all widen the blast radius. | Pretending each page is an isolated copy task |
| 11 | Eng | Write the test-plan artifact to disk now | The review needs a concrete verification map before the next branch opens. | Keeping test thinking implicit |
| 12 | Global | Ignore `_site/` and `tmp/` as review evidence | They are generated noise and would only blur the reviewed plan surface. | Treating generated output as meaningful review scope |

## CEO Review

### 0A. Premise Challenge

| Premise | Verdict | Evidence | What changes |
|---|---|---|---|
| This is mainly an authority-transfer and click-yield problem | Partial | True, but `docs/status/current-state.md` says the real business priorities are owner lead quality and direct-book conversion, while this plan's KPI table still leads with CTR, clicks, LCP, reviewer/date coverage, and `llms.txt`. | Keep the SEO diagnosis, but re-rank the scorecard around owner/direct-book outcomes. |
| `winner-guide-consolidation` still has to come before another owner rewrite | Accept, narrowed | The 7-day operator read and action plan still point there, but both outside voices warned that this should be a bounded cleanup/verification pass, not another guide project. | Keep it first, but keep it short and specific. |
| The stale smoke fix is a secondary cleanup item | Reject | `scripts/recovery/assert-live-smoke.js` still expects old owner-hub copy that `scripts/enforcement/seo-structure.test.js` explicitly says must not exist. | Pull the smoke repair into the immediate execution path. |
| Owner CTR rewrite should wait for the next valid joined read | Accept with condition | `docs/status/next-batch.md` still governs the rewrite gate, but the next owner branch should be framed as reuse of the existing proof/offer/CTA system, not as proof-system invention. | Keep the gate. Tighten what “prepare” means. |
| Stay work is an active next priority | Reject | `docs/status/next-batch.md` still says wait unless the AMI stay winners clear fresh-crawl and impression thresholds. The current plan reads more active than the rules allow. | Rewrite this as contingent prep only. |

### Premise Gate

The one human-judgment gate in this run was whether this should be treated as a review of the April 18 SEO refresh plan, not as a new site-implementation batch. The user's brief already answered that. This review therefore proceeds on that premise and leaves only the final approval gate open.

### 0B. Existing Code Leverage Map

| Sub-problem | Existing code already in place | What that means |
|---|---|---|
| Guide convergence | `src/_redirects`, `src/sitemap.njk`, `src/llms.txt`, guide source files, `scripts/enforcement/seo-structure.test.js`, `scripts/enforcement/guide-conversion.test.js` | This is source + enforcement work, not a brainstorm about guide ideas. |
| Owner proof and CTA system | `src/property-management/property-management.njk`, `src/_data/ownerProofAssets.json`, owner entries in `src/_data/seoPages.json`, `scripts/enforcement/owner-acquisition.test.js`, tracked owner form events | The next owner branch should reuse existing proof/CTA plumbing instead of rebuilding it. |
| Stay decision support | `src/stays/stays.njk`, `decisionHighlights` and related-stay data in `src/_data/seoPages.json`, `scripts/enforcement/booking-handoff.test.js`, `scripts/enforcement/guide-conversion.test.js` | Stay work touches shared template and tracking surfaces, so it is not just local page polish. |
| Measurement | `src/assets/js/conversion-tracking.js`, `owner_primary_cta_click`, `owner_form_submit`, `guide_book_direct_click`, `booking_engine_handoff` | The plan should use these existing outcome signals harder instead of falling back to proxy metrics. |
| Release confidence | `scripts/recovery/assert-live-smoke.js`, `npm run verify:release`, current enforcement suite | The gate exists, but one stale assertion is poisoning trust in it. |

### 0C. Dream State Mapping

```text
CURRENT
  Strong guide discovery
  + owner pages ranking but weak click yield
  + stay pages too thin to justify expansion
  + stale smoke gate lowering confidence

THIS PLAN, AS WRITTEN
  Disciplined sequencing
  but KPI hierarchy still too SEO-shaped
  and stay work opens earlier than the repo's own gates allow

12-MONTH IDEAL
  Guide winners feed money pages cleanly
  -> owner pages turn ranking into qualified leads
  -> stay winners become honest decision pages with real handoff
  -> release gates stay trusted
  -> expansion decisions come from measured movement, not momentum
```

### 0C-bis. Implementation Alternatives

| Approach | What it does | Effort | Risk | Why it wins or loses |
|---|---|---:|---:|---|
| A. Keep the sequence exactly as written | Guide first, smoke second, owner third, stay fourth | Medium | High | Loses because the stay phase overstates readiness and the KPI hierarchy is still wrong. |
| B. Reorder to owner-first | Push guide work into the background and go straight at owner offer/click yield | Medium | Medium-high | Tempting, but it muddies the current 7-day read and ignores the repo's own next-batch rules. |
| C. Keep the order, but tighten the first batch and freeze the stay phase harder | Bounded guide cleanup + smoke repair now, owner rewrite still gated, stay work rewritten as contingent prep only | Medium | Medium | Wins because it respects repo truth without letting the review turn into more planning theater. |

### 0D. Mode-Specific Analysis

`SELECTIVE_EXPANSION` remains the right mode.

Add now:
- a business-outcome KPI layer for owner/direct-book movement
- an explicit note that the stale smoke fix belongs in the immediate path
- a reconciliation step for the `10,591` vs `5,768` guide-demand mismatch
- a rewrite of the stay phase so it mirrors `docs/status/next-batch.md`

Do not add now:
- a new owner rewrite batch before the gate clears
- Holmes Beach or other stay expansion
- a Design review pass
- a broad new proof-system buildout

### 0E. Temporal Interrogation

| Time horizon | What looks true | What actually happens |
|---|---|---|
| Hour 1 | “This is just a sequencing refresh.” | The stale smoke contradiction and the guide-baseline mismatch both need to be resolved before the plan is trustworthy. |
| Hour 6 | Guide cleanup and smoke repair are shipped. | Good. That still does not auto-open the owner rewrite branch. |
| Week 2 | Owner pages still rank but do not convert better. | Then the owner batch should reuse the existing proof/CTA system and sharpen first-screen offer framing, not widen scope. |
| Month 2 | Stay pages still have weak demand. | Then stay expansion remains frozen. A prettier plan does not change the gate. |
| Month 6 | CTR and impressions moved, but leads did not. | Then the KPI hierarchy was wrong and the review should have forced the business outcome layer harder. |

### 0F. Mode Selection

Mode confirmed: `SELECTIVE_EXPANSION`

Why not `HOLD_SCOPE`:
- because the plan's current wording leaves too much room for stay-phase drift and proxy-metric self-congratulation

Why not `SCOPE_EXPANSION`:
- because the site has not earned more surface area yet

### CODEX SAYS (CEO — strategy challenge)

- The plan still optimizes SEO proxies before owner/direct-book business outcomes.
- `winner-guide-consolidation` risks becoming a stale-answer loop if it becomes another broad cleanup sprint instead of a short verification pass.
- The guide baseline mismatch (`10,591` here vs `5,768` in the active guide brief) weakens confidence in the branch thesis until reconciled.
- Owner work is framed too much as snippet/proof mechanics and not enough as first-screen offer sharpness.
- Stay work still underweights the real job: helping a guest choose despite thinner inventory than competitors.

### CLAUDE SUBAGENT (CEO — strategic independence)

- The plan is still too SEO-shaped relative to the actual business bottlenecks.
- The anti-sprawl direction is right, but guide-first only holds if the work is tightly bounded.
- The owner branch should be treated as conversion/offer work once the gate clears, not as more generic owner copy.
- Stay pages need a stronger alternative wedge, not just faster templates.

CEO DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude   Codex   Consensus
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Premises valid?                  PARTIAL  PARTIAL CONFIRMED issue
  2. Right problem to solve?          PARTIAL  NO      CONFIRMED issue
  3. Scope calibration correct?       PARTIAL  NO      DISAGREE
  4. Alternatives explored enough?    NO       NO      CONFIRMED issue
  5. Competitive risks covered?       PARTIAL  NO      CONFIRMED issue
  6. 6-month trajectory sound?        PARTIAL  NO      CONFIRMED issue
═══════════════════════════════════════════════════════════════

### Error & Rescue Registry

| Failure | Likely trigger | Rescue |
|---|---|---|
| The guide batch turns into another sprint of generalized polish | The team treats “consolidation” as a fuzzy permission slip | Keep the batch tied to known alias leakage, feeder links, canonicals, and request-recrawl evidence only |
| The owner batch re-explains proof instead of using it | The plan forgets that shared proof assets and tracking already exist | Reuse the existing proof system and focus the branch on first-screen offer and snippet yield |
| Stay work quietly becomes redesign work | Soft phrases like “tighten handoff” or “inventory honesty” spread across the family | Limit scope to the two AMI winners, shared template/image path, and existing stay handoff signals only |
| The release gate keeps lying | Smoke is left stale because it looks like housekeeping | Fix the stale assertion before treating the next release as trustworthy evidence |
| The team reports CTR wins with no business movement | KPI hierarchy remains proxy-first | Put owner/direct-book outcomes at the top of the scorecard |

### Failure Modes Registry

| Severity | Failure mode | Why it happens | What prevents it |
|---|---|---|---|
| High | More guide work, no better branch clarity | “Consolidation” becomes a catch-all | Bounded guide brief plus baseline reconciliation |
| High | The site “wins SEO” and still misses the business | CTR/clicks stay above leads/bookings in the scorecard | KPI hierarchy rewrite at the final gate |
| High | False smoke failures train the team to ignore release evidence | Stale assertions remain in the trusted gate | Immediate smoke repair |
| Medium | Owner work duplicates proof infrastructure | The plan says “strengthen proof” without acknowledging what already exists | Explicitly map existing owner proof/CTA surfaces |
| Medium | Stay work reopens family-level expansion early | The strategy wording drifts from `docs/status/next-batch.md` | Rewrite the stay section as contingent prep only |

### NOT in Scope

- Holmes Beach or other stay expansion
- broad new guide volume
- a new owner-proof system
- Phase 4 entity expansion
- a Design review pass

### What Already Exists

- guide routing, redirect, and canonical enforcement
- a live owner proof asset plus proof-first owner templates
- tracked owner CTA and form events
- shared stay-page decision modules and booking handoff tracking
- a release gate that becomes useful again once the stale smoke assertion is fixed

### Dream State Delta

If this review lands cleanly, the plan keeps its anti-sprawl discipline and gets sharper about what the next two branches actually are:

- branch 1: bounded guide cleanup plus smoke repair
- branch 2: owner rewrite only if the joined read clears
- stay phase: contingent prep only until the real stay gate opens

What it still does not solve:
- a better long-run authoring system for raw HTML guides
- any broader off-site authority expansion
- inventory breadth limits on the stay side

### Completion Summary

| Area | Status | What changed |
|---|---|---|
| Strategic sequence | `passes with changes` | The overall order holds, but the first batch gets tighter and the stay phase gets pushed back behind the real gate. |
| KPI framing | `resolved` | Business outcomes now sit above proxy SEO metrics in the scorecard. |
| Immediate execution path | `clearer` | Guide cleanup and smoke repair belong together in the next real branch. |
| Expansion discipline | `stronger` | Stay work is no longer described as active ready-to-ship work. |

## Design Review

Skipped — no UI scope.

This plan does not define a new interaction model, responsive system, component contract, or design language. It changes sequencing, proof emphasis, routing, and existing template priorities. A design pass here would add ceremony and not clarity.

## Eng Review

### Scope Challenge

This plan reads like a page-sequencing document, but the actual engineering blast radius lives in shared files and shared gates:

- `src/_data/seoPages.json` fans into owner and stay pages
- `src/stays/stays.njk` owns real handoff and image behavior for the stay winners
- `src/property-management/index.njk` must agree with both enforcement and smoke expectations
- `src/assets/js/conversion-tracking.js` owns the business events the plan should be using as decision support

That means the review bar is not “can someone rewrite copy.” The bar is whether the next branch keeps attribution clean and whether the gate logic in docs matches the gate logic already enforced in source and tests.

### CODEX SAYS (eng — architecture challenge)

- The branch order basically holds as long as it stays anchored to the measured gates in `docs/status/next-batch.md`.
- The stale smoke contradiction is a real blocker because the recovery gate still disagrees with current enforced owner-hub truth.
- Existing enforcement already covers guide redirects, stay handoff, and stay-page structure more than the plan text admits.
- The AI-surface gap remains real: owner-money pages are still underrepresented in `src/llms.txt`.
- Verdict: `PASS WITH CHANGES`

### CLAUDE SUBAGENT (eng — independent review)

- The stale smoke fix is mandatory because the recovery gate contradicts both the enforced source contract and the current owner-hub source.
- The branch order is basically right, but stale smoke should live inside or immediately adjacent to the guide-consolidation batch.
- Stay work is not bounded enough as written and should be rewritten as AMI-winners-only contingent prep.
- The next owner branch should reuse the existing owner proof/tracking infrastructure instead of treating it as missing.

ENG DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude   Codex   Consensus
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Architecture sound?              PARTIAL  PARTIAL CONFIRMED issue
  2. Test coverage sufficient?        PARTIAL  PARTIAL CONFIRMED issue
  3. Performance risks addressed?     PARTIAL  PARTIAL CONFIRMED issue
  4. Security threats covered?        YES      YES     CONFIRMED
  5. Error paths handled?             NO       NO      CONFIRMED issue
  6. Deployment risk manageable?      PARTIAL  PARTIAL CONFIRMED issue
═══════════════════════════════════════════════════════════════

### Architecture Diagram

```text
docs/status/next-batch.md
        |
        v
2026-04-18-seo-strategy-refresh.md
        |
        +--> guide-consolidation batch
        |      -> src/_redirects
        |      -> guide source files
        |      -> src/sitemap.njk
        |      -> src/llms.txt
        |      -> seo-structure.test.js
        |      -> guide-conversion.test.js
        |
        +--> release-gate truth
        |      -> scripts/recovery/assert-live-smoke.js
        |      -> src/property-management/index.njk
        |      -> seo-structure.test.js
        |
        +--> owner batch (gated)
        |      -> src/_data/seoPages.json
        |      -> src/property-management/property-management.njk
        |      -> src/_data/ownerProofAssets.json
        |      -> owner-acquisition.test.js
        |      -> conversion-tracking.js
        |
        \--> stay batch (contingent)
               -> src/_data/seoPages.json
               -> src/stays/stays.njk
               -> booking-handoff.test.js
               -> guide-conversion.test.js
               -> conversion-tracking.js
```

### Code Quality Review

The risk is not novelty. It is contradiction.

The cleanest example is the owner hub:

- `scripts/recovery/assert-live-smoke.js` still expects old explainer-hub copy
- `scripts/enforcement/seo-structure.test.js` explicitly says that copy must not exist
- `src/property-management/index.njk` already implements the new proof-first direction

That is exactly the kind of mismatch that makes an automated gate look “mostly useful” while quietly training people to ignore it.

### Test Review

The real test surface for the next branches is mapped in:

- `/Users/sawbeck/.gstack/projects/uncfreak1255-code-seascape-vacations-site/sawbeck-codex-seo-audit-2026-04-18-eng-review-test-plan-20260418-155523.md`

High-confidence current coverage:

- guide routing and canonical hygiene: `scripts/enforcement/seo-structure.test.js`
- guide-to-stay routing and tracked handoff events: `scripts/enforcement/guide-conversion.test.js`
- owner proof/CTA/freshness structure: `scripts/enforcement/owner-acquisition.test.js`
- stay decision modules and booking handoff: `scripts/enforcement/booking-handoff.test.js`

Current gaps that matter:

- no dedicated assertion protecting owner-money coverage inside `src/llms.txt`
- no test that forces the smoke script to stay aligned with current owner-hub truth
- no reason to pretend the stay phase is implementation-ready until its real gates clear

### Performance Review

The plan is right that `/stays/anna-maria-island-vacation-rentals/` remains the biggest live performance concern. But that does not mean the stay branch is ready now. The right engineering read is:

- yes, the stay winners eventually need template/image work
- no, the plan should not describe that work as active before the measured gate opens

### Security / Trust Review

There is no meaningful auth or permissions change in this strategy review.

The real trust boundary is factual and operational:

- false smoke assertions
- KPI reporting that can overstate business progress
- owner proof language drifting away from sourced, reusable benchmark claims

### NOT in Scope

- a new data model for `src/_data/seoPages.json`
- a stay-template redesign
- a Design review
- new standalone perf-test infrastructure for a branch that is not open yet

### What Already Exists

- owner proof assets and proof-first owner templates
- tracked owner CTA/form events
- stay decision highlights and booking handoff plumbing
- guide conversion kit and tracked guide handoff events
- release verification entrypoints

### Failure Modes Registry

| Severity | Failure mode | Why it happens | What prevents it |
|---|---|---|---|
| High | Smoke stays stale and every later release read is suspect | Gate contradiction is treated like low-priority cleanup | Fix the smoke assertion in the immediate path |
| High | Stay work opens as “CRO/perf” and quietly becomes family-wide rewrite | The strategy wording is too broad | Rewrite the stay section to AMI winners only and contingent on the existing gate |
| Medium | Owner rewrite duplicates proof work already present | The plan says “strengthen proof” without acknowledging what already exists | Explicit reuse of the live owner proof/CTA system |
| Medium | Guide cleanup muddies attribution again | Owner/stay changes mix into the guide batch | Keep the guide batch narrow and do not mix owner/stay value-prop edits into it |

### Completion Summary

| Area | Status | What changed |
|---|---|---|
| Branch order | `passes with changes` | Keep the order, but merge smoke repair into the immediate path and rewrite the stay phase as contingent prep. |
| Hidden dependencies | `surfaced` | Shared templates, shared data, tracking, and the stale smoke gate are now explicit. |
| Test surface | `mapped` | The Eng test plan artifact names the real flows, current coverage, and deferrals. |
| Design scope | `skipped` | No real UI contract is being planned here. |

## Cross-Phase Themes

- **Business outcomes were underweighted in the original draft.** Both CEO voices independently flagged that issue, and the KPI section above now resolves it by putting business outcomes ahead of SEO proxies.
- **The guide batch only stays right if it stays small.** CEO and Eng both flagged the danger of turning “consolidation” into another generalized guide sprint.
- **The smoke fix is not housekeeping.** Both phases treated the stale recovery gate as immediate infrastructure, not a side quest.
- **Stay work is not ready just because it is important.** Both phases independently pushed the stay phase back behind the existing gate and asked for tighter wording.

## Final Approval Gate

### Resolved User Challenge

**Challenge 1: Re-rank the KPI hierarchy**

Accepted and applied.

The strategy now:
- make owner lead quality, owner CTA/form movement, and direct-book handoff outcomes the primary scorecard
- demote CTR, clicks, reviewer/date coverage, `llms.txt`, and LCP to diagnostic/supporting metrics

### Resolved Execution Defaults

**Decision 1: Package the immediate batch as one bounded guide branch plus smoke repair**

Accepted and applied.

The next real source branch is:
- bounded `winner-guide-consolidation`
- stale owner-hub smoke repair in the same branch
- no owner-copy expansion to satisfy the smoke gate

**Decision 2: Keep owner prep at the plan/brief level until the rewrite gate clears**

Accepted and applied.

The next owner work allowed before the joined read is:
- offer framing and KPI clarification in plan artifacts
- no separate owner-prep source branch

### Auto-Decided

- `12` decisions were auto-decided and logged in the audit trail above.

### Review Scores

- CEO: `issues_open`
- CEO Voices: Codex `5` major concerns, Claude subagent `4` major concerns, Consensus `4/6 confirmed`, `1` disagreement
- Design: `skipped, no UI scope`
- Eng: `issues_open`
- Eng Voices: Codex `5` major concerns, Claude subagent `4` findings, Consensus `5/6 confirmed`

## GSTACK REVIEW REPORT

| Phase | Skill | Scope | Voices | Status | Summary |
|---|---|---|---|---|---|
| CEO Review | `/autoplan` -> CEO pass | strategy, sequencing, branch order | `codex + subagent` | `issues_open` | Order mostly holds, but the scorecard needs business outcomes and the first batch needs a tighter boundary. |
| Design Review | conditional | UI/UX scope check | skipped | `skipped` | No real UI scope. |
| Eng Review | `/autoplan` -> Eng pass | architecture, tests, deployment risk | `codex + subagent` | `issues_open` | Shared-file blast radius, the stale smoke contradiction, and the owner-light AI surface are the main engineering blockers. |
