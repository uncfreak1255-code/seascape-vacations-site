# Seascape Vacations — SEO + AI-Search-Ability Audit

*Date: 2026-06-29 · Audience: Sawyer (founder) · Scope: seascape-vacations-site, seascape-analytics, seascape-hub*

---

## Verdict

You have built genuinely elite SEO/GEO machinery and pointed it at the wrong half of the funnel. That sentence is the whole audit.

For a 5-home operator, the craft here is far above market: a test-enforced AI-discovery stack, a proof-first analytics layer that refuses to fake wins, a 1,050-line banned-phrase CI gate, clean technical hygiene, and an unusually well-reasoned strategy that correctly named owner acquisition as the bottleneck and then froze meta-work to stop polishing the OS. A top operator would grade the *inputs and governance* at or above their own bar.

But the business outcome is weak, and the gap is the finding: **0 owner leads ever, 0 attributed direct bookings, ~48 organic clicks/week with 81% concentrated in one guide cluster, and every revenue-intent cluster sitting at 0 clicks.** The back half of the operating loop — measurement → learning — never closes. Every brief's "Post-Reread Outcome" section is left as a placeholder; the same pages get rescued two and three times without anyone ever proving the prior fix worked.

The single truest line in the entire repo is one your own agents wrote: *"the operating system is now more advanced than the business it serves."* They are right. The correction is not to build more or audit more — it is to stop polishing (already frozen) and aim the existing, excellent machinery at the revenue half of the funnel.

### Grade Table

| Dimension | Grade | One-line reason |
|---|---|---|
| SEO strategy & operating model | **B+** | Diagnosis is A-grade; the *allocation* of effort is C-grade. |
| Current SEO output & ranking performance | **D+** | ~48 clicks/wk, 81% in one cluster, every money cluster at 0. |
| AI search ability / GEO | **A-** | Real, test-enforced, honestly measured — but ~0 citations yet. |
| Technical SEO & site health | **B-** | Sound canonical/redirect/index hygiene; perf gate misses the homepage. |
| Agent operating quality vs a top company | **C+** | Elite front-half (safety/quality); broken back-half (loop never closes). |
| Measurement & analytics integrity | **B-** | High-integrity design; no identity bridge, so revenue is unattributable. |
| Content quality & E-E-A-T | **C+** | Disciplined voice gate over a structurally over-scaled pSEO footprint. |
| **Top-company benchmark (results)** | **C+/B-** | A-grade craft, sub-par outcome accountability. |

---

## Your Five Questions, Answered Directly

**(a) Where are we on SEO strategy?**
Strategically lucid, tactically misallocated. You correctly identified owner acquisition as the #1 bottleneck and correctly concluded that on-site SEO cannot manufacture demand in a channel running ~42 owner impressions/week (down from a 413 peak, −89.8%). The "Stop Polishing The OS" freeze is healthy discipline backed by two dated audits and a genuinely adversarial demand-OS handoff (5-verifier → judge panel → 3 pre-mortems, all returning REVISE). The reasoning is better than most agencies produce. The problem is the *bet*: the whole strategy now rests on founder cold outbound that has produced 3 sends / 0 replies, with "founder send-discipline" self-named as the headline unmitigated risk — while the one lane with real demand (guide traffic) is starved.

**(b) What is the current SEO output?**
Tiny and lopsided. ~48 organic clicks/week across the entire tracked portfolio (`weekly-search-operator-report-2026-06-15-to-2026-06-21.md`): `guide_winners` supplies 39 (81%), `brand` 9, and **every revenue-intent cluster — owner_money, stay_money, owner_hub, owner_support, stay_support, property_pages, catalog — is at 0 clicks.** The honest 28-day picture (`rank-tracker-latest.md`) is mixed: clicks rose 233 → 300 (+29%) and CTR doubled (0.4% → 0.8%), but on a *shrinking* base — impressions fell 53.6K → 37.1K (−31%), average position worsened 7.9 → 10.6, and the indexed footprint shrank 227 → 162 (−29%). That is recovery off a floor on a thinning funnel, not durable growth.

**(c) What is the AI search ability?**
Strong surface, unproven payoff — and graded A- specifically because the surface is real and non-cargo-cult. The full machine-readable stack exists, renders, cross-links, and is guarded by an 18-assertion enforcement test. Entity claims are consistent across every surface *and* the consistency is test-enforced. All 12 named AI crawlers are allowlisted. The standout is honesty: a dated AI-citation measurement loop that reports zeros (4 ChatGPT sessions/wk, down from 13; 0 on Claude/Perplexity/Gemini; 0 verified citations) instead of fabricating wins, and briefs that explicitly *reject* schema/llms.txt as a citation lever. You are at-to-slightly-ahead of the 2026 curve. You just have no traction yet — and that is honestly a platform/distribution reality, not a file gap.

**(d) Is the current strategy poor?**
Mixed. The *reasoning* is excellent; the *allocation* is poor. Correct: owner is the bottleneck, on-site SEO can't fill an empty channel, the OS-freeze is right. Poor: your strongest measured asset — `guide_winners` at ~5,400 impr/wk and ~211 GA4 sessions/wk — is treated almost entirely as a referral feeder for owners, while the named #2 bottleneck (direct-book conversion) stays chronically under-shipped with no attribution bridge at all. You are betting the company on the one lane your own system flagged as *not* founder-proof, while starving the one lane that already has demand and needs no send-discipline.

**(e) Are my AI agents running SEO like a top company would?**
Partially. On craft and governance, yes — arguably ahead of how most companies run SEO. On the things that drive revenue, no. A top operator closes the loop: every shipped change gets a measured readback, and you do not rescue the same page three times without proving the prior fix moved anything. That is exactly what happened to `bradenton-vs-sarasota` (3 dated edits, impact never measured) and `ami-vs-siesta` (demand present, 0 transfer events across cycles, CTA lever never moved). A top operator also would not ship a booking funnel with zero identity bridge so that no dollar can ever be attributed. And a top operator would not let 48% of 114 commits in 12 days be maintenance/rescue/cleanup on a zero-lead business — that is motion mistaken for progress.

---

## Dimension Findings (Severity-Ranked)

### 1. SEO Strategy & Operating Model — B+

**Strengths**
- **The "owner acquisition is the bottleneck, not a website job" call is correct and well-evidenced.** Owner-money pages hold page-one average position (~5.5) but draw effectively zero demand (57 impressions across 4 pages, 0 clicks, 0 GA4 sessions — `next-batch.md:41`). That is a no-demand channel, not a ranking/CTR problem. Concluding the lever is off-repo sales/relationships is the right inference and resists the agency reflex of producing page volume.
- **The freeze is disciplined, not avoidance.** It carries explicit carve-outs (`current-state.md:16-20`: "does not freeze bounded rescue work when a tracked winner or money page is sliding") and a same-day CEO review cadence (`ranking-regression-rescue.md`) that bans the "generic wait state." That is the difference between a disciplined freeze and a stall.
- **The demand-OS handoff is genuinely rigorous and self-correcting** (`2026-06-13-demand-os-handoff.md`). It overturns its own seductive claims against repo source (e.g., refuting a "zero-code-change escalation" shortcut after verifying `weekly_search_operator_report.py:1192-1203`), and catches that the existing "Outreach Kit" was a SWARM software pitch targeting 5 *competing property managers*, not homeowners. Its honest day-30 expectation is "~0 real owner leads" with a built-in kill tripwire. This is analysis that produced a scoped build, not paralysis.
- **The owner on-page gate is correctly identified as unreachable-by-waiting and correctly escalated.** The rewrite gate requires ≥1,000 owner impressions (~24× the current run rate); rather than emit endless "hold" states, the loop routes the founder to the off-page lane. That converts a paralysis trap into a forcing function.

**Weaknesses**
- **[HIGH] Direct-booking (the named #2 bottleneck) is under-prioritized relative to its measured strength.** `guide_winners` is the largest real-traffic asset on the whole site (`next-batch.md:39`: 5,429 impr, 211 GA4 sessions/wk), yet the demand-OS makes the top guide a feeder *to* owners (Card 1), while direct-book attribution stays "blocked" and the strategy brief shows 21 direct-book clicks → 2 booking-engine handoffs → **0 attributed bookings**. Given owner acquisition is admitted to be "mostly an off-repo sales job," the highest-leverage *on-repo* work is direct-book CRO on existing guide traffic — not waiting on owner impressions.
- **[MEDIUM] Status surfaces are internally inconsistent on the gate state.** `current-state.md` (2026-06-14) reads as a hard freeze; `next-batch.md` (2026-06-20) says "open next batch" around `/guides/anna-maria-island-vs-siesta-key/`. A tie-breaker rule exists (`next-batch.md` wins), but `current-state.md` — the file an agent reads at session start — carries no forward pointer to the live gate for the open-batch path. A reader could over-freeze or perceive contradiction.
- **[MEDIUM] The strategy now rests on an off-page motion with a known, unmitigated execution risk and no traction.** `owner-outbound.md:485` records "sent-no-reply"; exactly three June 17 sends to Kiri/Megan/Naomi, 0 replies, plus 7 drafts unsent since June 26. The plan itself names founder send-discipline as the risk that "died every prior time." The Lane A guest→owner referral hedge (founder-proof, impression-independent) is correctly promoted to lead — but the primary owner motion is still aspirational.

### 2. Current SEO Output & Ranking Performance — D+

**Critical / High**
- **[CRITICAL] owner_money = 0 clicks across every read, structurally sub-gate.** 4 pages, 0 clicks, ~51-57 impressions/wk, 0 sessions, 0 form submits, across both June reads. Per-page: maximize-income 11 impr (pos 2.27), fees 15 impr (pos 5.40), licensing 9 impr (pos 8.67), vrbo 16 impr (pos 2.50) — all 0 clicks. This cluster cannot clear by waiting.
- **[CRITICAL] Stay-money pages near-zero: ranking deep or invisible.** `stay_money` 2 pages, 0 clicks, 6 impr, pos 16.33; `stay_support` pos 40.09. SERP captures show Seascape *absent* for "Anna Maria Island vacation rentals" and "luxury vacation rentals Sarasota" while 7 local competitors hold organic 1-7. The direct-booking guest lane is invisible for its head terms.
- **[HIGH] Total organic output is ~48 clicks/week, 81% in one cluster.** The site is effectively a four-page guide site with a brand homepage attached; nothing else generates measurable clicks.
- **[HIGH] Indexing alarm: indexed footprint dropped 29% (227 → 162) with 402 crawled-not-indexed and 135 404s** (`rank-tracker-latest.md`). The forensic read ("mostly healthy pruning" — dropped pages carried zero clicks, CTR rose anyway) is defensible, but it remains a large unmanaged signal that was never fully verified: the 65 dropped URLs were never enumerated and the GSC Pages tab was unpullable. Treat "mostly healthy" as an asserted, not proven, read.
- **[HIGH] The biggest click engine lost #1 and transfers no traffic to money pages.** `/guides/bradenton-vs-sarasota/` fell #1 → #3-5 (Zachos Realty, midflorida.com, Reddit, TripAdvisor overtook it), from ~49 clicks to ~1. Across `guide_winners`, tracked guide→stay/booking transfer events are **0**. Rankings exist; the funnel does not convert them.

**Medium**
- **[MEDIUM] Trend is recovery-off-a-floor on a shrinking base.** Clicks fell 43% Mar→May (409 → 233), recovered +29% May→Jun (233 → 300, still below March), but impressions collapsed −31% and average position worsened. A thinning funnel, not a widening one. *(Note: the GSC "450 clicks in 28 days" milestone email is a different, unfiltered window — ~112/wk equivalent — and is treated by the repo as a preserved Google receipt, not an operator-proof number. Don't read it against the ~48/wk joined figure as a contradiction; they measure different things.)*
- **[MEDIUM] Chronic unfixed hygiene leak.** The `srq-airport-to-anna-maria-island` slash/no-slash duplicate (Google shows both `.html` #6 and slashed #1) has been flagged since at least May 6, with a noted "5-minute 301 fix" still open in June. "sarasota to anna maria island" pulls 1,210 impr at 0.2% CTR — worst CTR in the top 10. Process documenting the fix outpaced shipping it.
- **[MEDIUM] AI/GEO visibility is negligible and declining** (4 AI-referrer sessions/wk vs 13 prior; 0 verified citations). Covered in §3.

**Strengths**
- **Comparison-guide cluster genuinely ranks** (pos 4.39, 5,485 impr): ami-vs-siesta 22 clicks (pos 4.26), best-time-visit 10 clicks (pos 5.01). Real, defensible output — but it is the *entire* output and it doesn't transfer.
- **Measurement honesty is high.** Zero-click clusters report as zero; thin pages are marked "too thin to call"; direct-booking revenue is held "unproven." The bad numbers are trustworthy. *(Fair caveat: `current-state.md` argues owner-lead generation was never the SEO OS's intended job, so "the infra hasn't produced results" should be read as "pointed at the wrong half," not "failed at its scoped job.")*

### 3. AI Search Ability / GEO / AEO — A-

**Strengths**
- **Full AI-discovery stack exists, renders, and is test-enforced — not cargo-cult.** `src/llms.txt` (88 lines, real inventory + retrieval-match blocks), `ai-discovery.json.njk`, `.well-known/ai.txt.njk`, and `ai/{summary,service,faq}.json.njk` all build and cross-link; `ai-discovery-schema.test.js` (18 assertions) fails the build if any link or built file is missing.
- **Entity claims are consistent across every surface AND consistency is enforced.** "5 homes," "10-15% direct savings," "8-16 guest capacity," and the near-AMI-not-on-island boundary appear identically across llms.txt, all `ai/*.json`, `site.json`, property JSON-LD, and reader copy. The location boundary — your single most-cited GEO failure mode — is hard-coded into the AI contract and test-asserted (a seoPage saying "vacation rentals on Anna Maria Island" fails the test).
- **Real, dated AI-citation measurement loop that reports zeros honestly.** Seven weekly receipts (2026-05-25 → 06-21) separate retrieved/cited/mentioned/clicked/converted and refuse to claim bookings from AI visibility. This is the answer to "proof or hope?" — there is a measurement system, it is current, and it is brutally honest.
- **Briefs explicitly refuse the cargo-cult premise.** `2026-06-ai-search-ahrefs-response.md:163` rejects broad AI file/schema sprawl ("Google says there are no extra AI-feature technical requirements and Ahrefs did not find meaningful schema-driven citation gains"); the rubric is score-only/non-blocking. This is better-internalized 2026 GEO practice than most teams have.
- **Content is extractable** (40-50 FAQPage blocks, answer-first rubric weighting standalone-answer 0.28, blunt direct-answer blocks; property pages carry VacationRental/AggregateOffer/Review JSON-LD) and **all 12 named AI crawlers are allowlisted** (`robots.txt`; GSC reports robots-blocked count 0).

**Weaknesses**
- **[MEDIUM] Actual AI citation/referral outcomes remain near-zero.** 4 ChatGPT sessions/wk (down from 13), 0 on all other engines, 0 verified citations; analytics_quality_receipt "blocked." Not a site-work defect — the honest current state, correctly attributed to platform reality + thin distribution (no YouTube/brand-mention lane shipped). Temper any near-term AI-booking expectations.
- **[LOW] Minor distance-claim drift.** The canonical AI surface commits to "10-15 minutes from AMI" while one seoPages entry says "10-30 minutes." Normalize to one boundary phrasing so an engine can't surface a contradiction.
- **[LOW] AI endpoints are summaries, not deep structured data.** Per-property citable records (capacity, price, amenities, booking URL) live only in page-level JSON-LD, not in the consolidated `/ai/*.json` contract. A defensible routing choice (avoids a second drift source), but a real ceiling on one-shot extractability.

### 4. Technical SEO & Site Health — B-

**Strengths**
- **Canonical and robots handling is clean and self-referential** (`base.njk`: default `index, follow` with per-page override; canonical = `site.url + page.url`). The opposite of a canonical-leak root cause for the index drop.
- **The sitemap/noindex collision — the documented root cause of the AMI income-guide demotion — is now guarded by a rendered-build contract** (`sitemap-indexability-contract.test.js` reads actual `_site` output, asserts no rendered `noindex` on sitemap'd pages and self-canonical). Genuine enforcement, not theater.
- **Redirect hygiene is solid:** 421 rules, all 301 (zero 302/200/404), validated for missing targets and avoidable chains; wildcard catch-alls ordered specific-before-generic for Netlify first-match.
- **Internal-link validator blocks links to redirects and missing targets**, forcing direct canonical links and protecting crawl budget / link equity.

**Weaknesses**
- **[MEDIUM] Orphaned 4.3MB `hero.jpg` ships to production as dead weight.** `addPassthroughCopy("*.jpg")` copies the root `hero.jpg` (4,350,925 bytes) to `_site`, unreferenced by any template (the homepage correctly uses optimized avif/webp variants). Not the LCP culprit, but reachable at `/hero.jpg`, wasting bandwidth/crawl. Low-effort fix: delete it or scope the passthrough.
- **[MEDIUM] The Lighthouse perf budget excludes the homepage.** The budget collects only 5 money routes (3 owner, 2 stay) — no `/`. The homepage CSS (~75.6KB across homepage.css + hero-v2.css) is over the 50KB error budget, and `open-risks.md` confirms it "still blocks the homepage performance-budget gate" — yet the gate that should catch it never collects the highest-traffic, heaviest page.
- **[LOW] Perf budget is not in the local `verify:release` gate** (only PR CI runs it via `--if-present`), so a contributor running the documented full pre-PR gate gets no perf signal until CI.
- **[LOW] Build is broken in non-canonical environments** (Node v22 vs pinned 24.14.0; `@netlify/blobs` MODULE_NOT_FOUND). The redirect/link/sitemap gates all depend on a full `_site`; a partial build silently produces misleading "everything is broken" output. CI on Node 24 with deps installed is the source of truth — keep trusting CI, not local mismatched runs.

### 5. Agent Operating Quality vs a Top SEO Company — C+

**Critical / High**
- **[CRITICAL] The measurement → learning leg is structurally broken — loops open but almost never close.** Across all 18 real briefs with a "Post-Reread Outcome" section, **not one** has filled-in measured impression/CTR/position/event numbers; every line reads "pending / fill after readback." Without a closed readback the program cannot distinguish a fix that worked from one that didn't, so it can only re-rescue. *(The verified counts are larger than the original finding stated — 18 briefs, 55 occurrences — so the problem is broader, not smaller.)*
- **[CRITICAL] The money lanes the program exists to serve are near-zero, and the agents know on-site work can't fix them** — yet the bulk of agent activity stayed on-repo SEO rescue and copy hygiene. The binding constraint is off-repo (owner sales); the commit volume went elsewhere.
- **[HIGH] Same pages rescued repeatedly with no proof the prior fix moved anything.** `bradenton-vs-sarasota` shows three dated edits to one page (content-depth, FAQ, proof-label cleanup), each ending "impact still waits for readback." `ami-vs-siesta` went through PR #397 → a June 26 readback brief → a queued *third* CTA test, with the tracked conversion stuck at 0 transfer events across cycles. This is firefighting, not compounding. *(Fair caveat: the June 26 brief itself flags that its window overlapped the deploy, so it didn't yet prove the last fix failed.)*
- **[HIGH] Commit cadence is high but maintenance-heavy.** 114 commits in ~12 days; 55 (48%) are rescue/regression/sweep/cleanup/fix/refresh/decay/hygiene subjects. Half a 12-day burst is the program maintaining itself against a zero-lead business — the cadence is servicing the OS, not the customer.
- **[HIGH] The founder is over-served with process scaffolding relative to delivered results.** 50+ briefs, a full process-doc set, ~12 agent SOULs, daily verification receipts — against 0 owner leads and 0 money-page clicks. Honesty about being stuck is the saving grace, but it is not the same as getting unstuck.

**Strengths**
- **Genuinely elite safety/quality front-half:** deterministic banned-phrase CI linter, owner-proof stat-binding ("best-in-class for citation reliability" per the stack audit), "No Brief, No Writing" + page-volume freeze, a lean five-role model with an explicit anti-persona-bloat guardrail. The negative gates that kill amateur AI-SEO programs (fabricated stats, slop, sprawl) are real and load-bearing.
- **Proof-first gating is correctly scoped and does NOT block shipping** — the freshness block stops new expansion/impact claims but explicitly carves out bounded rescue work. A sophisticated, top-team distinction. (Ironically, that same carve-out is the on-ramp to the rescue treadmill above.)
- **[MEDIUM strength] Governance caught its own over-engineering and froze the meta-layer** ("Auditing the toolchain again is now a procrastination surface"). That self-correction is a maturity signal many teams lack — though the need for an explicit "stop polishing" decision is itself the tell that the bureaucracy over-grew first.

### 6. Measurement & Analytics Integrity — B-

**Critical / High**
- **[CRITICAL] No identity bridge from site events to reservations — the forward search→booking loop cannot close automatically.** `conversion-tracking.js` sends a client-side navigation to `book.seascape-vacations.com` stamping only UTM/ref params — no persisted handoff ID, no session token, no server receipt. Hostaway reservation rows carry no GA4 client_id/session_ref. The only automated `booking_attributed` path is a *post-stay-email-to-guest-identity* match — a retention/repeat signal fired *after* a stay, which can never connect an inbound organic/AI click to the booking it produced. **This is the single biggest reason "0 attributed reservations" is a measurement gap, not a demand verdict.**
- **[HIGH] Owner leads = 0 is structurally unsurprising and not a demand verdict.** Instrumentation is real and server-side; zero *unlabeled* receipts means either no real owner has submitted or all traffic to date is proof-labeled test traffic. The pipeline correctly refuses to call labeled rows demand, but it also can't distinguish "no demand" from "funnel/volume too small."

**Strengths / Medium**
- **Proof-first "blocked/degraded never shows clean" is genuinely enforced in code.** `analytics_quality_receipt.py` computes verdict (blocked / human-review / agent-safe) from per-source freshness and cannot reach agent-safe while a required source is missing or runtime is degraded. `direct_booking_attribution_v2` cannot emit `booking_attributed` without reviewed reservation rows — it degrades to `page_level_only` instead of faking a clean answer. High-integrity design.
- **[MEDIUM] GSC↔GA4 join is trustworthy at page-family grain** (normalized `family_key`, clean inner-merge, `variant_url_count` tracked) but inherits **URL-family leakage** risk (already flagged in `open-risks.md`) if the site emits multiple variants for one logical page.
- **[MEDIUM] GA4 truth is Data-API daily aggregates, not raw event export** — no client_id/session grain — which is a structural ceiling on closing the loop even if the booking engine returned an identifier. Honestly documented.
- **[STRENGTH] Event names are consistent** across site instrumentation, SQL, and contract today — but maintained by discipline, not a gate. Worth a cross-repo enum-parity check in CI.

### 7. Content Quality & E-E-A-T — C+

**High**
- **[HIGH] Indexable footprint is ~15× the inventory: 73 indexable money pages for 5 homes** (46 indexable stay + 27 owner), plus ~37-52 guides. The repo's own pSEO triage keeps only 18 of 91 records as "keep" (42 "improve," 13 "consolidate," 12 noindex, 6 redirect) — but the brakes are governance promises, not applied noindex. The live indexable set still reflects the original over-generation. This is the classic profile that triggers "Crawled - currently not indexed" on the thin tail.
- **[HIGH] 16 of 46 indexable stay pages map to a single property** (e.g. `vacation-rentals-sleeps-16-florida`, `5-bedroom-vacation-rentals-florida`, `vacation-rentals-with-game-room` all resolve to the same one home). The triage itself flags these as "consolidate," yet they ship indexable — textbook thin scaled doorways.
- **[HIGH] E-E-A-T is strong on authored guides but absent across the generated bulk.** ~5 of 37 guides carry a named Person author ("Sawyer Beckett, Owner & Host") with Wikidata sameAs and cited sourcing. But all 46 stay pages hardcode Article authorship to the *Organization*, and the majority of owner pages carry no per-page Person author — the commercial core, where first-hand operator authority matters most for a money-decision niche, lacks it. *(Caveat: 4 owner pages with a `proofAssetKey` do render a Person author, so it's "absent across the bulk," not zero.)*

**Medium / Low**
- **[MEDIUM] Content was originally AI-slop being remediated reactively, not authored clean.** Two sequential "slop-sweep" briefs scrubbed tourism-board filler phrase-by-phrase. The cleanup worked (corpus scans clean), but removing banned phrases passes the *negative* gate without guaranteeing the *positive* bar of genuine information gain — which is why the content-quality rubric is advisory-only.
- **[LOW] A slop-sweep brief leaks an absolute local filesystem path** (`/Users/sawbeck/Library/Application Support/Claude/...`) into a proof-source field — unresolvable by any other agent/reviewer, weakening the proof chain.

**Strengths**
- **The banned-pattern / voice gate is genuinely raising quality and is CI-enforced** (`content-voice.test.js`, ~1,050 lines, multi-array pattern set; corpus scans 0 hits for "nestled," "best of both worlds," "Picture yourself," etc.). It bans AI-rhythm structures and protects the standalone-answer block on citation pages. Well above typical pSEO hygiene.
- **Noindex + portfolio gate are applied to the weakest persona pages** (12 seasonal/occasion pages noindexed; each winner assigned a single money destination, tracked event, and kill/CRO threshold). Disciplined portfolio thinking — the gap is it hasn't been pushed down onto the 16 single-property indexable variants the triage already flagged.

---

## Top-Company Benchmark

**How a top operator would grade this:** C+/B- on *results* despite A-grade *craft*. The proof-first measurement, honest negatives, CI enforcement, and no-slop discipline are arguably ahead of how most companies — let alone 5-home operators — run SEO. But three things a top operator never tolerates are present here:

1. **The loop never closes.** Every shipped change should get a measured readback; instead all 18 briefs leave the outcome as a placeholder, and the same pages get rescued 2-3× without proof.
2. **The booking funnel ships with no identity bridge,** so no dollar of direct-booking revenue can ever be attributed to SEO.
3. **Half of a 12-day commit burst is self-maintenance** on a zero-lead business — motion mistaken for progress.

**Proportionality:** Significantly over-built on the OS, under-built on revenue mechanics — and the team already knows it. For a 5-home company, the 18-assertion AI stack, ~50 FAQPage files, 1,050-line voice linter, ~52-page guide family, 73 indexable money pages, multi-agent SOULs, and 5-verifier→judge→3-pre-mortem governance chain are enterprise-scale machinery the demand doesn't justify. The over-build is *partly* defensible (mostly write-once, prevents real failure modes) and the freeze shows healthy self-awareness — but it's under-built exactly where it counts: no attribution bridge, no closed loop, no functioning sales cadence. Effort is allocated ~70/30 toward OS craft when a 5-home business needs ~30/70 toward demand + conversion + sales.

**AI-search position:** At-to-slightly-ahead of the 2026 curve and notably non-cargo-cult. Right posture: build the extractable surface, measure citations honestly, don't claim schema caused them. The reason it's not "ahead" is purely traction (near-zero citations/referrals so far) — which is correctly understood as a lagging indicator of content/demand, not a place to spend more build effort.

**Highest-leverage move:** Build the booking-attribution identity bridge **and** repoint `guide_winners` traffic at direct-booking conversion. These are one move because they're useless apart — today your only real organic asset (~5,400 impr/wk) flows into a funnel that can't be measured and a CTA path treated as an owner feeder. Fix the bridge and you can finally prove (or kill) the direct-book thesis; repoint the guides and you give the bridge something to measure. Unlike owner outbound, this requires no founder send-discipline and no waiting for an empty channel to fill. It is the only high-leverage move that is both founder-proof and demand-backed today.

---

## Prioritized 90-Day Action Plan

**WEEKS 1-2 — Fix booking attribution before anything else.**
Persist a handoff ID on every `booking_engine_handoff`: stamp a UUID into the outbound `book.seascape-vacations.com` URL plus a server receipt (Netlify function), and write that ID onto the Hostaway reservation (a manual paste into a note field is fine at 5 homes). This creates the first-touch search→handoff→reservation bridge that does not exist today. Without it, every other direct-book change is unmeasurable and the program literally cannot prove a single dollar. **Prerequisite for the loop to ever close.**

**WEEKS 1-4 — Stop feeding the strongest asset to the weakest lane.**
Reframe `guide_winners` (bradenton-vs-sarasota, ami-vs-siesta) as a DIRECT-BOOKING conversion surface, not an owner feeder. Run the already-scoped `page-cro` / `serp-ctr-title-rewrite` work: clear book-direct CTAs above the fold, recover the lost #1 on bradenton-vs-sarasota via freshness + SERP competitiveness (NOT links — the in-body links already exist), and instrument guide→stay→handoff so a guest path is measurable. This is the only lane with demand today.

**WEEKS 2-8 — Run owner outbound as an actual sales cadence, not a website project.**
The strategy correctly says owner acquisition is off-repo sales — so treat it like sales: a weekly send target with founder accountability (the named #1 risk), a CRM/spreadsheet with reply tracking, 15-25 targeted *local-homeowner* sends (not the 5 competing PMs the kit was mis-targeting), and a 30-day reply-rate gate. 3 sends / 0 replies is a discipline failure no on-site SEO fixes. If the founder won't run the cadence, *that* is the real strategic decision to surface — not another brief.

**WEEKS 1-12 — Institute a hard loop-closure rule.**
No page gets a second rescue brief until the first one's Post-Reread Outcome is filled with measured impressions/CTR/position/event numbers. All 18 briefs left this blank; this single rule stops the rescue treadmill (48% of commits) and forces the system to learn. Pair it with a monthly "kill list" from the existing pSEO triage — actually apply noindex to the "consolidate"-flagged single-property pages instead of holding governance promises (triage keeps 18 of 91; 73 ship indexable).

**WEEKS 4-12 — Maintain the freeze on OS/meta-work and AI-file polishing.**
Your agents already diagnosed "auditing the toolchain again is now a procrastination surface" — that judgment is correct; hold it. The AI-discovery stack is done and at/ahead of curve; add no endpoints. Keep the weekly AI-visibility receipt running (it honestly reports zeros) but spend zero net-new engineering on GEO until citations or referrals actually appear. The next 90 days are revenue plumbing and a sales cadence — not more governance.

---

## Evidence Index (key files)

- `seascape-vacations-site/docs/status/current-state.md` (lines 16-29), `next-batch.md` (lines 39-44, 105-138), `open-risks.md`
- `seascape-vacations-site/docs/plans/2026-06-13-demand-os-handoff.md`; `docs/status/owner-outbound.md:485-491`
- `seascape-vacations-site/rank-tracker-latest.md` (28d trend, srq-airport flag); `docs/reports/indexing-and-indexability-forensic-2026-06-06.md`
- `seascape-analytics/docs/status/weekly-search-operator-report-2026-06-15-to-2026-06-21.md`; `weekly-ai-visibility-receipt-2026-06-15-to-2026-06-21.md`
- `seascape-vacations-site/src/{llms.txt, ai-discovery.json.njk, .well-known/ai.txt.njk, ai/*.json.njk, robots.txt}`; `scripts/enforcement/ai-discovery-schema.test.js`
- `scripts/enforcement/{sitemap-indexability-contract.test.js, validate-redirect-targets.js, validate-internal-links.js, content-voice.test.js}`; `lighthouserc.js`, `config/perf-budget.json`
- `seascape-analytics/scripts/analytics_quality_receipt.py`, `weekly_ops_ledger.py`; `db/init/02_weekly_ops_ledger.sql`; `src/assets/js/conversion-tracking.js`
- `seascape-vacations-site/src/_data/seoPages.json`, `seoGovernance.js`; `docs/portfolio/pseo-inventory-triage.md`; `docs/briefs/2026-06-bradenton-vs-sarasota-regression-rescue.md`, `2026-06-26-ami-vs-siesta-transfer-readback.md`
