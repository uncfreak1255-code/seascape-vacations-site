# Guide portfolio reorder (2026-10-25)

- lifecycle: draft until this PR merges; then the order below governs which guide the
  guide factory moves next.
- approved by: Sawyer, 2026-10-25 ("Reorder but ensure this is verified and reviewed
  strategy wise and nothing breaks or causes regression").
- replaces: the guide-family order in `docs/plans/2026-10-23-guide-family-1-tickets.md`
  after L4. Family 1 (L0-L4) is finished; nothing in it changes.
- does not change: `docs/status/next-batch.md`, `docs/plans/2026-11-content-priorities.md`,
  any brief, or any public page. Where this plan needs a brief changed (new controls, a new
  rescue), it names the change as a ticket; the brief's own approval route still applies.
- reviewed: an advisor pass and an adversarial SEO review on 2026-10-25 before this PR;
  every blocking and should-fix finding is resolved below.

## Evidence (dated)

| Source | Window or date | Use |
| --- | --- | --- |
| Search Console via `seascape-analytics/scripts/gsc-search-performance.sh` | 2026-04-24 to 2026-10-21 (6 months); 2026-08-26 to 2026-09-22 (prior 28 days); 2026-09-24 to 2026-10-21 (last 28 days) | clicks, impressions, position per guide (Appendices A and B) |
| OpenSEO `get_ranked_keywords`, `/guides/` subfolder, US | 2026-10-25 | 100 of 514 ranked keywords (the top 100 by volume): demand, difficulty, AI Overview citations |
| OpenSEO `get_serp_results`, US, depth 20 (20 SERP items, about 16 organic) | 2026-10-25 (stale after 2026-11-01) | who ranks for eight head queries |

Findings:

1. Guides carry the site's search traffic: about 2,375 of 2,800 site clicks in six months;
   13 guides carry about 89% of guide clicks.
2. **Two winners meet the rescue trigger** (`docs/process/ranking-regression-rescue.md`:
   30%+ click decline on a winner, comparing the last 28 days with the prior 28 days;
   Appendix B):
   - `/guides/anna-maria-island-vs-siesta-key/`: clicks 46 to 27 (-41%), impressions
     -30%. Its head queries "anna maria island vs siesta key" (6.1 to 9.3) and "siesta key
     vs anna maria island" (5.8 to 8.4) left the top 5 with 0 clicks, while their
     impressions held (118 to 104; 132 to 116). The guide is absent from the first 20 SERP
     items for the head query on 2026-10-25 (Reddit, Herald-Tribune, Tripadvisor, Facebook
     threads and vacationflorida.tv lead). Search Console averages include local and
     personalized results, so its positions differ from a national SERP.
   - `/guides/shelling-guide-florida/`: clicks 30 to 19 (-37%), impressions -12%, average
     position 7.0 to 7.5.
   - The sibling `/guides/siesta-key-vs-anna-maria-island-families/` fell 8 to 1 click on
     the same query family; too small to rescue alone, but a possible cannibalization
     partner of the winner.
   - `/guides/srq-airport-to-anna-maria-island/` fell 31 to 17 clicks (-45%) before its L4
     layout move (#799) went live. It is not a winner-portfolio guide, so the rescue
     trigger does not apply, but the L4 readback must compare against this falling trend
     and the controls, not against the six-month average.
   - Other earners held or grew (best-time +48%, rainy-day +240%, weather +4%,
     bradenton-vs-sarasota +125%); AMI vs Clearwater -25% and dolphins -18% are below the
     trigger.
3. **AI Overview citations seen** (in the 100 rows read): weather (8 queries), shelling (5),
   AMI vs Siesta Key (2), SRQ (1). The other 414 rows were not read, so other guides may
   also be cited; the guards below therefore freeze answer text on every guide.
4. **Two guides compete for the same queries.** The weather guide ranks 10-35 for
   January-March and December weather queries (cited by AI Overviews for January and
   March); best-time ranks 17-24 for January, February, November and December weather
   queries.
5. **High demand, low difficulty, poor position** (OpenSEO monthly US volume; difficulty
   0-100; position is OpenSEO absolute rank, SERP features included):

   | Guide | Example query | Monthly searches | Difficulty | Position |
   | --- | --- | ---: | ---: | ---: |
   | `/guides/things-to-do-bradenton-fl/` | things to do in bradenton fl | 6,600 | 11 | 43 |
   | `/guides/shelling-guide-florida/` | best shelling beaches in florida | 3,600 | 0 | 24 |
   | `/guides/anna-maria-island-beaches/` | anna maria beach | 9,900 | 32 | 51 |
   | `/guides/best-restaurants-anna-maria-island/` | anna maria island dining | 18,100 | 9 | 75 |

   The 2026-10-25 SERPs: restaurants has a map pack above a travel blog, restaurant sites,
   Reddit and Tripadvisor; things-to-do has Visit Bradenton, Tripadvisor and a top-sights
   panel; shelling has an AI Overview above Visit Fort Myers and National Geographic;
   "anna maria island beaches" has an AI Overview, a travel blog, Tripadvisor and
   annamaria.com, with Seascape the 8th organic result.
6. **Business fit differs.** Every published home is on the mainland in Bradenton or
   Sarasota, none on Anna Maria Island (`seascape-hub` `origin/main`
   `context/seascape-properties.md`, read 2026-10-25). Bradenton queries match the
   inventory best; AMI dining matches it least.

## Changes since the baseline window

The Search Console windows end 2026-10-21. These merged after it and change guides in
scope, so no readback window may include them:

- #766 and #767 (2026-10-22): bradenton-vs-sarasota and best-time copy.
- #771 (2026-10-23): 17px body and catalog card on every legacy guide.
- #798, #799 (2026-10-25): flights and SRQ onto the planning frame (live after the
  2026-10-26 publish).

Every readback window starts the day after the guide's change is live in production.

## Controls (the problem both reviews found)

The two active rescue briefs (`2026-10-property-pages-rescue.md` and
`2026-10-ami-vs-siesta-key-rescue.md`) read against four controls: bradenton-vs-sarasota,
best-time, family-vacation and shelling. Shelling now meets the rescue trigger itself,
family-vacation has about 1 click a month, and bradenton-vs-sarasota and best-time changed
on 2026-10-22. The control set needs replacing before either rescue's readback can
decide anything. This plan does not edit those briefs; ticket R0 below proposes new
controls in each brief, under each brief's own approval route.

Rules this plan follows until then:

October 27 exception: Sawyer approved the full Compound Writing copy in PR
#819, then selected Waterline A and authorized normal review/publication for
Bradenton vs Sarasota. That named guide is released from the hold below and
cannot be an unchanged control across those changes. See
`docs/briefs/2026-10-27-bradenton-sarasota-full-article.md`. Other holdouts and
rescue readback windows are unchanged; this exception does not replace R0.

- **Holdouts.** bradenton-vs-sarasota, best-time and the weather guide get no layout or copy
  change until both rescues' 28-day readbacks are recorded and Lane 4's weather decision
  is made. They are the largest unchanged pages and anchor every readback.
- **Control group per readback.** The holdouts plus every guide with at least 200
  impressions in the window that had no change in or within 7 days before the window,
  read as one combined total. Each PR body lists the controls it used.

## Order

### Lane 1: rescue (allowed now under `ranking-regression-rescue.md`; source edits need Gate 0 complete and Sawyer, per `2026-11-content-priorities.md`)

- **R0.** Propose replacement controls (the rule above) in both active rescue briefs.
- **R1. AMI vs Siesta Key.** Complete Gate 0 in `docs/briefs/2026-10-ami-vs-siesta-key-rescue.md`
  with the 2026-10-25 SERP and Appendix B. Include
  `/guides/siesta-key-vs-anna-maria-island-families/` as a cannibalization check
  (which page Google shows for each head query). No layout move for either page until the
  rescue's 28-day readback is recorded.
- **R2. Shelling.** Open a rescue brief for `/guides/shelling-guide-florida/` with its own
  Gate 0. No layout move until its readback is recorded.

### Lane 2: layout moves (factory)

October 27 execution: Sawyer selected Rainy Day B and authorized its normal review/publication, including polish of the existing table with unchanged data. `docs/briefs/2026-10-guide-portfolio-layout.md` scopes this one activity conversion. Other guide moves and holds remain unchanged.

Before the first move, ticket L5 writes `docs/briefs/2026-10-guide-portfolio-layout.md`
(an active brief for these moves; the family-1 brief covered L0-L4 only). Comparison and
activity guides are different page types from the planning guides the frame was built for,
so each new page type goes through the design lane: two or three rendered variants for
Sawyer to pick before its first move. A move puts the guide on the picked frame only. Any
new chart, table or figure is a separate enhancement ticket with its own brief and
Sawyer's pick, never part of a move.

Order (not holdouts, not in Lane 1, by six-month clicks):

1. `/guides/rainy-day-activities-bradenton-sarasota/` (activity type)
2. `/guides/anna-maria-island-vs-clearwater-beach/` (comparison type)
3. `/guides/anna-maria-island-vs-longboat-key/`
4. `/guides/dolphins-manatees-bradenton/`
5. `/guides/is-anna-maria-island-worth-visiting/`
6. `/guides/holmes-beach-vs-bradenton-beach/`
7. The remaining guides by six-month clicks, then the holdouts and Lane 1 pages once
   their conditions above are met.

### Lane 3: content upgrades (held by `docs/status/next-batch.md`)

Ordered by business fit, then demand:

1. `/guides/things-to-do-bradenton-fl/` (matches the Bradenton homes)
2. `/guides/anna-maria-island-beaches/` (8th organic result for "anna maria island beaches")
3. `/guides/best-restaurants-anna-maria-island/` (largest demand, weakest fit; last)

Shelling's search upgrade is folded into its rescue (R2). These change search-facing copy
on pages that are not regressing, which `next-batch.md` treats as expansion. Each starts
only when `next-batch.md` reads `open next batch` (after the pool-heat fix it names), or
with Sawyer's explicit written exception to that gate recorded in the brief. Each brief
carries the standard anti-claims: no Seascape home on Anna Maria Island or Siesta Key;
pool heat is optional and never included. An upgrade and a layout move of the same
guide never share a PR.

### Lane 4: decisions for Sawyer (nothing ships without his list approval)

- Weather vs best-time: pick one owner for month-weather queries; the other links to it.
  A redirect or canonical change is a separate approval. Decide before either holdout moves.
- Near-duplicate pairs (bradenton-beach / bradenton-beach-area-guide, holmes-beach /
  holmes-beach-area-guide, vacation-cost / vacation-cost-guide-2026, best-time-to-visit
  (noindex) / best-time-visit): merge list for approval, with redirects.

## Regression guards (every PR in Lanes 1-3)

1. **Freeze what ranks.** URL, canonical, title, meta description, H1, JSON-LD, the opening
   answer paragraph and every FAQ answer stay byte-identical unless the ticket names the
   change. This applies to every guide, cited or not.
2. **One guide per PR, one change type per PR.** Layout and copy never share a PR.
3. **Spacing.** At most two guides with 28-day clicks of 10 or more published per week.
4. **Baseline.** Each PR body names its guide's Appendix A and B rows and its head query
   (the query with the most clicks to that page in a query-by-page Search Console pull).
5. **7-day early revert.** Revert at once if the guide is deindexed, its canonical changed,
   its head query falls 3 or more positions while controls hold, or
   `guide_book_direct_click` falls to 0 where it was at least 1.
6. **28-day readback.** Compare with the same-length window before the change, adjusted by
   the control group's change. Revert if clicks fall 30% or more beyond the controls, or
   the head query leaves the top 10 while controls hold. Below 200 impressions in the
   window, judge on impressions and position only. Apply the winner-guides feeder rule
   (`docs/portfolio/winner-guides.md`: 20+ sessions with no guide, stay or booking action
   is a feeder failure). A revert is a plain revert commit.
7. **Proof per PR.** The family-1 common done criteria; the ticket-level byte checks used
   in L0, L1 and L4 (visible-text diff, JSON-LD diff, title/meta/canonical/H1 identical to
   `main`, every `data-track-event` present) plus a diff of the opening answer and FAQ
   answers; a visual baseline refreshed for that route only; a verifier run at the PR head;
   and a Codex review on the head before merge.

## Appendix B: comparable windows (Search Console, pulled 2026-10-25)

Prior 28 days (2026-08-26 to 2026-09-22) against the last 28 days (2026-09-24 to
2026-10-21). URL variants summed; position impression-weighted.

| Guide | Prior clicks | Prior impressions | Prior position | Last clicks | Last impressions | Last position | Click change |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/guides/anna-maria-island-vs-siesta-key/` | 46 | 3753 | 5.3 | 27 | 2625 | 5.7 | -41% |
| `/guides/best-time-visit-anna-maria-island/` | 64 | 5957 | 5.1 | 95 | 6236 | 4.9 | +48% |
| `/guides/shelling-guide-florida/` | 30 | 2072 | 7.0 | 19 | 1821 | 7.5 | -37% |
| `/guides/rainy-day-activities-bradenton-sarasota/` | 15 | 930 | 9.4 | 51 | 2570 | 8.8 | +240% |
| `/guides/anna-maria-island-weather/` | 28 | 9854 | 8.0 | 29 | 9908 | 7.8 | +4% |
| `/guides/bradenton-vs-sarasota/` | 8 | 1846 | 5.9 | 18 | 1918 | 5.0 | +125% |
| `/guides/srq-airport-to-anna-maria-island/` | 31 | 3970 | 6.5 | 17 | 3591 | 5.9 | -45% |
| `/guides/anna-maria-island-vs-clearwater-beach/` | 16 | 1608 | 5.8 | 12 | 1160 | 4.9 | -25% |
| `/guides/anna-maria-island-vs-longboat-key/` | 15 | 1414 | 6.0 | 15 | 1145 | 5.9 | +0% |
| `/guides/dolphins-manatees-bradenton/` | 22 | 957 | 7.0 | 18 | 1004 | 6.6 | -18% |
| `/guides/is-anna-maria-island-worth-visiting/` | 9 | 919 | 5.0 | 13 | 1035 | 4.7 | +44% |
| `/guides/holmes-beach-vs-bradenton-beach/` | 12 | 572 | 5.9 | 12 | 456 | 5.9 | +0% |
| `/guides/siesta-key-vs-anna-maria-island-families/` | 8 | 292 | 8.6 | 1 | 172 | 8.0 | -88% |
| `/guides/family-vacation-anna-maria-island/` | 1 | 108 | 8.8 | 1 | 110 | 8.9 | +0% |

## Appendix A: baseline (Search Console, pulled 2026-10-25)

Search Console 2026-04-24 to 2026-10-21 and 2026-09-24 to 2026-10-21. Rows with at least 5 six-month clicks or 30 recent impressions. URL variants are listed
separately as Search Console reports them. Historical once a guide's PR publishes.

| Guide | 6-mo clicks | 6-mo avg pos | 28-day clicks | 28-day impressions | 28-day avg pos |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/guides/anna-maria-island-vs-siesta-key/` | 428 | 5.4 | 27 | 2586 | 5.7 |
| `/guides/best-time-visit-anna-maria-island/` | 365 | 5.6 | 95 | 6159 | 5.0 |
| `/guides/shelling-guide-florida/` | 194 | 8.1 | 19 | 1821 | 7.5 |
| `/guides/rainy-day-activities-bradenton-sarasota/` | 173 | 9.3 | 51 | 2570 | 8.8 |
| `/guides/anna-maria-island-weather/` | 157 | 8.1 | 29 | 9908 | 7.8 |
| `/guides/bradenton-vs-sarasota/` | 145 | 5.0 | 18 | 1917 | 5.0 |
| `/guides/srq-airport-to-anna-maria-island/` | 142 | 6.8 | 17 | 3588 | 5.9 |
| `/guides/anna-maria-island-vs-clearwater-beach/` | 116 | 6.2 | 12 | 1158 | 4.9 |
| `/guides/anna-maria-island-vs-longboat-key/` | 89 | 6.4 | 15 | 1142 | 5.9 |
| `/guides/dolphins-manatees-bradenton/` | 83 | 7.1 | 18 | 1004 | 6.6 |
| `/guides/is-anna-maria-island-worth-visiting/` | 80 | 4.8 | 13 | 1035 | 4.7 |
| `/guides/holmes-beach-vs-bradenton-beach/` | 79 | 6.5 | 12 | 456 | 5.9 |
| `/guides/siesta-key-vs-anna-maria-island-families/` | 61 | 4.9 | 1 | 172 | 8.0 |
| `/guides/anna-maria-island-vacation-cost/` | 38 | 5.5 | 3 | 974 | 5.6 |
| `/guides/best-waterfront-restaurants-with-boat-dock/` | 32 | 10.5 | 2 | 151 | 9.1 |
| `/guides/anna-maria-island-noise-ordinance-guide/` | 27 | 6.4 | 5 | 363 | 5.9 |
| `/guides/bradenton-vs-sarasota-beaches/` | 25 | 5.9 | 4 | 426 | 7.3 |
| `/guides/bradenton-vs-sarasota-for-families/` | 19 | 5.8 | 1 | 326 | 5.3 |
| `/guides/pet-friendly-anna-maria-island/` | 16 | 11.8 | 0 | 166 | 14.5 |
| `/guides/florida-gulf-coast-vacation-rental-market-report-2026/` | 15 | 7.4 | 1 | 41 | 7.6 |
| `/guides/best-restaurants-anna-maria-island/` | 12 | 30.0 | 1 | 125 | 13.5 |
| `/guides/things-to-do-bradenton-fl/` | 9 | 29.5 | 6 | 701 | 16.2 |
| `/guides/best-vacation-rental-companies-ami/` | 9 | 32.7 | 1 | 225 | 18.3 |
| `/guides/anna-maria-island-area-guide/` | 7 | 15.8 | 0 | 454 | 11.9 |
| `/guides/fishing-guide-anna-maria-sarasota/` | 6 | 20.7 | 2 | 886 | 14.3 |
| `/guides/longboat-key-area-guide/` | 5 | 10.1 | 0 | 38 | 6.1 |
| `/guides/do-you-need-a-car-anna-maria-island/` | 4 | 7.1 | 2 | 310 | 8.2 |
| `/guides/snowbirds-guide-extended-stays-florida/` | 4 | 10.1 | 1 | 55 | 9.1 |
| `/guides/bradenton-vs-tampa-vacation-rentals/` | 4 | 7.8 | 0 | 98 | 8.8 |
| `/guides/bradenton-vs-sarasota-cost-of-living/` | 3 | 6.1 | 3 | 623 | 6.0 |
| `/guides/bradenton-vs-sarasota-retirement/` | 3 | 7.8 | 1 | 91 | 11.1 |
| `/guides/anna-maria-island-beaches/` | 3 | 17.4 | 1 | 261 | 14.5 |
| `/guides/family-vacation-anna-maria-island/` | 2 | 9.4 | 1 | 110 | 8.9 |
| `/guides/booking-direct-vacation-rentals/` | 2 | 23.6 | 0 | 402 | 24.4 |
| `/guides/bradenton-area-guide/` | 2 | 14.8 | 0 | 51 | 22.1 |
| `/guides/bradenton-vs-sarasota-restaurants/` | 1 | 10.2 | 0 | 66 | 10.5 |
| `/guides/how-to-get-to-anna-maria-island/` | 1 | 8.1 | 0 | 76 | 8.2 |
| `/guides/anna-maria-island-vs-siesta-key/#stay-base` | 1 | 7.4 | 0 | 605 | 8.4 |
| `/guides/bradenton-insider-guide/` | 1 | 11.7 | 1 | 40 | 10.2 |
| `/guides/anna-maria-island-vs-siesta-key` | 1 | 2.3 | 0 | 39 | 2.4 |
| `/guides/2026-bradenton-vacation-rental-market-analysis/` | 1 | 6.5 | 1 | 44 | 5.8 |
| `/guides/best-time-visit-anna-maria-island` | 0 | 2.9 | 0 | 77 | 2.9 |
| `/guides/anna-maria-island-vs-siesta-key/#beaches` | 0 | 7.4 | 0 | 605 | 8.4 |
| `/guides/holmes-beach-area-guide/` | 0 | 15.4 | 0 | 172 | 11.0 |
| `/guides/flights-to-anna-maria-island/` | 0 | 9.0 | 0 | 246 | 8.7 |
| `/guides/anna-maria-island-vs-siesta-key/#quick-comparison` | 0 | 7.4 | 0 | 605 | 8.4 |
| `/guides/anna-maria-island-vs-siesta-key/#dining` | 0 | 7.4 | 0 | 605 | 8.4 |
