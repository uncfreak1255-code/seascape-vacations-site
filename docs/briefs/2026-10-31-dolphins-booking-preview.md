# Dolphins guide: direct-booking review package

- lifecycle: active
- approved scope: local Decision ledger A implementation and contextual booking preview; Sawyer approved normal publication on October31,2026
- persona: guest planning wildlife outings near Bradenton and Anna Maria Island
- primary keyword: dolphins and manatees near Bradenton
- secondary keywords: manatee watching Bradenton, waterfront vacation rental Bradenton
- audience pattern: answer the wildlife question, then show a real mainland home and its tradeoff
- proof source: current Site property data and Dockside Dreams page; NOAA dolphin guidance; FWC manatee guidance; TECO calendar; frozen original HTML and approved A prototype
- required internal links: /properties/dockside-dreams/, /stays/bradenton-waterfront-vacation-rentals/, /properties/
- CTA target: /properties/dockside-dreams/ and original /properties/ booking actions
- anti-claims: no guaranteed wild sightings, no feeding or close approach, no included pool heat, no beachfront or on-island Seascape home, no invented prices or booking lift
- hypothesis: an early relevant property link reduces the work needed to progress from wildlife advice to comparing dates
- primary event: guide_property_check_dates_click, with guide and property identity
- guardrail event: booking_engine_handoff and original guide_book_direct_click continuity
- entry criteria: Sawyer-approved local trial; publication and experiment activation held
- readback window: existing weekly review after publication; four complete weeks for commercial judgment, excluding launch day
- decision rule: retain correct behavior provisionally; insufficient evidence until comparable real reservations and coverage support an outcome
- Source files changed in this batch:
  - `src/guides/dolphins-manatees-bradenton.html`
  - `src/css/wildlife-ledger.css`

## Gate 0 — bounded existing-page preview

| Field | Evidence |
| --- | --- |
| Target query family | dolphins/manatees Bradenton and Anna Maria Island viewing |
| Searcher intent | Plan a wildlife outing and accommodation nearby |
| Current Seascape URL | /guides/dolphins-manatees-bradenton/ |
| SERP observed date | 2026-10-31 |
| SERP stale after | 2026-11-07 |
| Current proof | Saved GSC October1–28:18 clicks/1148 impressions; no joined reservation conversion proved. October31 unchanged-page behavior check fails the early property bridge. |
| Top visible competitors | annamariaislanddolphintours.org/where-to-see-manatees/ and /see-dolphins-without-a-tour/; go2dolphins.com/dolphin-tours/ |
| Competitor angle | Viewing locations and paid boat outings; these are search-result observations, not tracked rank positions or verified operator claims |
| Visual/format gap | Legacy guide buries generic catalog CTA; selected A supplies early structured comparison |
| Seascape gap | No early exact-home decision/action, despite Dockside being a real relevant property |
| Search fit | Keep the existing wildlife guide; compare Dockside dates on its property page, never create another keyword page |
| Local/GBP proof | No Maps or GBP change; verified mainland property geography is the relevant local proof |
| AEO/readback note | Keep extractable comparison; repair unsafe distance and guaranteed-wildlife claims, and make visible FAQ/schema agree; no AI-lift claim |
| Recommendation | Complete local A with a restrained property bridge; retain all original booking destinations |
| Attack status | completed |
| Query variants inspected | dolphins manatees Bradenton Anna Maria Island where to see |
| SERP source | Free live web search October31,2026; no paid rank or AI check |
| Competitor URLs inspected | https://annamariaislanddolphintours.org/where-to-see-manatees/; https://go2dolphins.com/dolphin-tours/ |
| Content gap and Seascape answer | Keep wildlife advice on the existing URL and add a fact-based exact-home/stay action; do not copy operator guarantees |
| Design/format strategy | Selected Decision ledger A, early Structured table, open ruled home note; mobile labeled values |
| Seascape proof available | Frozen original and user-approved A; canonical property facts; October1–28 GSC and October22–28 joined Analytics receipt |
| Tools/plugins used | local OpenSEO saved reports, free Search Console read, native web reading and Playwright; Site design/content gates |
| Decision and reason | Local preview only; improve existing guest/owner actions without opening expansion or making lift claims |

## Design implementation packet

Reuse approved Decision ledger A: compact opening, early dark-header Structured table, dark-title labeled phone rows, numbered reading, desktop contents rail, original CTA position and persistent action. Reuse source SVGs and existing Waterline buttons. Add an open ruled property note after the comparison; do not add a card grid, chart package or new art direction. Owner companion remains its existing Waterline FAQ treatment. Critic: Approved with edge, high confidence in retained A; the extra note must stay below the answer/table and must not imply dock wildlife or island accommodation. Rendered screenshots and floors decide spacing. Keep the current supplied photos and alt values. No donor installed or invoked.

## Exact copy exceptions to original preservation

Correct dolphin distance from50feet to NOAA50yards; remove wild-sighting guarantees and bait-attraction advice; qualify pier access rather than claim reopening; remove arm’s-reach wildlife anecdote. Change Article modification date to October31 and align FAQPage to the three visible original questions. Also qualify the inherited Dockside wildlife CTA, remove the unsupported weekly-guest anecdote and certain-sighting/tour-odds wording. All other metadata and reader copy remain frozen. Add source links below the article; do not turn them into opening disclaimers. Comparison table values remain the original values in this preview; do not treat unsourced tour estimates as a quote.

## Operating assignment

Sawyer approved on October 31, 2026: “implement this in the existing growth workstream and prove it works without me nudging every step. Focus on direct bookings and owner/guest AI recommendations. Leave held guides alone and show me changes before publishing.”

Coordinator and sole mutation owner: Codex chat 01a17ebb-5b0b-73b2-8874-810ec98c2bac. One review package, local-only until Sawyer reviews the changed pages. Reuse the existing guide/growth handoff and pilot; do not create another queue, agent, marketing repo or recurring job. Three currently open Site PRs (834, 812, 734) do not duplicate these page changes. PR834 owns the SEO workflow-map qualification; leave that file alone.

Revenue lever: guest direct bookings and qualified owner inquiries. Proof surface: rendered routes and tracking continuity now; Analytics reviewed reservations, real owner receipts and the frozen OpenSEO AI cohort after authorized publication. Site implements, Analytics measures, Hub interprets strategy, Ops owns enabled runtime. Cosmetic-only guide volume waits; the four held guide sources remain untouched: weather, best-time, AMI-vs-Siesta, shelling.

The October 22–28 joined Analytics receipt REC-20261031-ANALYTICS-NEXT-BATCH-20261022to20261028 returns HOLD_AND_REREAD, fresh but below threshold. This is a bounded local existing-page trial, not a batch-gate override or a newly live experiment. Quality receipt is human-review (old post-stay activity; Guest Review runtime needs attention); no booking-lift or all-clear claim is allowed. Preserve the unresolved Friday pilot and all concurrent-release confounds.

## Acceptance and preservation

The independent baseline is current main 6a24974ed4d1f266b3bbac1dce4700bec55e0713 and the user-selected Dolphins A preview at 130ead69fc66c44e6cab7c2b627415841b785921. Freeze before HTML before editing. Keep title, descriptions, keywords, canonical, robots, OG/Twitter, original href/tracking tuples, images and alt text. Add only the named conversion copy and factual/schema repairs. No held-source, booking implementation, form submission, credential, paid research, schedule or publication change.

Public seams: a guest can open the specific truthful property or stay collection from the early guide module and reach the original booking destination; an owner can open the local-alternative FAQ, read the matching structured answer and reach the existing revenue-review form without a submission. Observe missing behavior red on unchanged main, then green after the change. Browser QA uses sv_developer=1, blocks service workers and analytics collection, and intercepts synthetic telemetry writes. Test desktop and phone widths, mobile labels, FAQ disclosure, overflow, critical assets and errors, original SEO/link preservation, single GA4 configuration, and actual click lineage. Native release and rendered review remain required. Complete builds before browser gates and freeze output throughout each run; use the native visual fixture build for fixture-dependent availability and baseline checks. A rebuild during browser QA invalidates the affected results rather than proving a page regression.

A fresh-context reviewer receives only this assignment and the saved checkpoint, rereads source and current objects, identifies the exact next unfinished action and performs its read-only proof. It must neither ask Sawyer to choose tools nor duplicate edits/PRs. This is bounded resume evidence, not proof of a future unattended scheduled run.

## Continuation and evaluation

Current state is local implementation awaiting one bundled copy/design review. After that approval, the coordinator owns the current-head review/repair/source closeout, normal scheduled publication and live readback; no extra next-step prompt is needed. Do not publish before approval or manually dispatch production.

Freeze compatible baseline and post windows at actual publication, excluding the partial launch day. At the existing weekly review, first verify current Analytics quality, pilot ownership and live experiment counts. Guest counts stay separated: guide clicks, property arrivals, date checks, handoffs, reviewed confirmed reservations. Owner counts stay separated: CTA, form activity, unlabeled server receipts, qualified owner outcome. AI mentions, cited URLs, referral sessions and recommendations are separate measures; preserve failed/no-answer rows, exact property identities, engine/market and the October 12 frozen cohort. Use existing approved runs only; new checks need exact cost approval. Four-week readback starts only after actual publication; no reset of prior pilot history. Verdict: keep, revise, revert or insufficient evidence. Thin or missing coverage is not zero conversion. No expansion on click/mention gains alone. Rollback is the previous source through the normal reviewed lane if factual, SEO or booking guardrails fail.

The execution checkpoint records source SHA, stage, completed checks, failures, owner, rollback, next action and approval boundary in the existing private handoff. Stop only at the actual publishing hold or a material blocker. Saving a report or recommending an authorized next step is not completion. No new trigger is enabled by this brief.

## Publication approval — October31,2026

Sawyer reviewed the three-page package and approved normal review/publication. This chat remains mutation owner and sole merger. Preserve SEO and booking contracts and held guides. The approved Tuesday/Friday09:10 Eastern heartbeat is local continuation, not a change to the Site production publish schedule.

## Approved publication proof — October31,2026

Originating issue #840 quotes Sawyer’s approved publication request. The earlier public-issue write block was cleared by his explicit approval. Fresh-context issue-only spec review at b93cba34e5762c5c43716377682e05998a3887c2 found no missing/wrong requirement; current-head pre-PR bug review found0defects. Briefs, required owner live-smoke coverage and visual journeys support the requested page publication.

Owner screenshot baselines were refreshed after Sawyer’s design approval through native workflow run41248253866; bot commit1c112fce055c2cc1d6689d589c37e88ddcac8e52 changes only the intended desktop/mobile property-management PNGs. Both were inspected. Required current-head native review/CI and actual normal production publication/readback remain separate steps. Final reconciled local release passed1319tests and all release checks; six actual guest/owner desktop/mobile journeys passed.
