# Brief: Shelling guide winner rescue (2026-10-25)

- lifecycle: active
- task scope: restore the `<title>` and meta description of `/guides/shelling-guide-florida/` to the strings that were live before 2026-09-19 (one change type, metadata only). No layout, body, FAQ, JSON-LD source field, URL or canonical change. Approved by Sawyer on 2026-10-25 ("Rescue"); governed by ticket R2 and the regression guards in `docs/plans/2026-10-25-guide-portfolio-reorder.md`.
- completion or successor: set to `completed` with the merged PR when the 28-day readback is recorded. This brief reverses the title and meta move in `2026-09-shelling-ctr.md` (shipped in #604, 2026-09-19); that brief is marked superseded for that element.

Lane: `docs/process/ranking-regression-rescue.md` (trigger: 30%+ click decline on a winner URL, Appendix B). Portfolio member: `docs/portfolio/winner-guides.md`.

## Content Gate Inputs

- persona: trip planner choosing a Gulf Coast shelling beach (Anna Maria Island first, wider Florida second)
- primary keyword: anna maria island shelling (head query, see below)
- secondary keywords: shelling on anna maria island; anna maria island shells; anna maria island seashells; best shelling beaches in florida (3,600 US monthly searches, OpenSEO 2026-10-25, difficulty 0, Seascape at absolute position 24; held, see Why This Batch)
- audience pattern: organic guide visitor, researching 1-6 months ahead
- proof source: Search Console (domain property, final data) pulled 2026-10-25; OpenSEO `get_serp_results` US depth 20 observed 2026-10-25; git history of `src/guides/shelling-guide-florida.html`; `2026-09-shelling-ctr.md` and `2026-07-shelling-guide-rescue.md`
- offer claim: n/a (guest lane)
- required internal links: unchanged (`/stays/anna-maria-island-vacation-rentals/`, `/stays/bradenton-vacation-rentals-near-beaches/`)
- CTA target: unchanged (`Compare AMI-Area Stays`, `guide_book_direct_click`, every `data-track-event` and `data-placement` stays)
- anti-claims: never place a Seascape home on Anna Maria Island or Siesta Key (homes are a mainland Bradenton or downtown Sarasota base); pool heat is never included (optional, $40/night); no invented amenities; no licence or revenue claims; no claim of Florida-wide shelling expertise beyond what the page covers (it covers Bean Point, Coquina, Manatee Public Beach, Longboat Pass, Point of Rocks and Caspersen day trips, and nothing on Sanibel, Captiva, Marco Island or Caladesi); no claim that the restore recovered clicks before the readback proves it

## Why This Batch

What changed in the data (Search Console, final data, pulled 2026-10-25; windows 2026-08-26..09-22 against 2026-09-24..10-21):

- Clicks 30 to 19 (-37%), impressions 2,072 to 1,821 (-12%), average position 7.0 to 7.5.
- The daily series breaks on one date. Before the 2026-09-19 retitle (24 days, 2026-08-26..09-18): 30 clicks, 1,827 impressions, 1.64% CTR, 1.25 clicks and 76 impressions a day. From 2026-09-19 to 2026-10-21 (33 days): 19 clicks, 2,133 impressions, 0.89% CTR, 0.58 clicks and 65 impressions a day. There were no clicks at all on the eight days 2026-09-19..09-26 at about 60 impressions a day.
- The change on 2026-09-19 (#604, from the `2026-09-shelling-ctr.md` brief) replaced the title `Florida Shelling Guide — Best Beaches for Shells Near AMI` with `Anna Maria Island Shelling: Best Beaches, Tides and Rules` and shortened-to-rewritten the meta description. That brief's own decision rule says "revert if position drops more than 1.5 or CTR falls". Page-level CTR fell from 1.4% (its 2026-08-18..09-15 baseline) to 1.04% over this brief's last-28-day window (19 / 1,821), and the daily split above shows 1.64% to 0.89% across the change date. The page position moved 7.3 to 7.5, inside its 1.5 guardrail, so only the CTR half of the rule fires.
- Florida-wide queries lost their impressions. In the prior window the page showed for dozens of Florida-wide queries at positions about 7 to 24 (for example "best shelling beaches in florida" 37 impressions at 10.7, "best shelling in florida" 14 at 14.2, "best shelling beaches florida" 13 at 10.8, "best florida beaches for shells" 8 at 11.0). In the last window those rows are gone or down to 1 to 12 impressions ("best shelling beaches in florida gulf coast" 12 at 8.1 is the largest). Those rows drew no clicks, so they explain impressions and not the click loss.
- Head query: "anna maria island shelling" (most clicks to the page in the query-by-page pull: 4 clicks in the prior window, 98 impressions, position 2.4; 0 clicks in the last window, 66 impressions, position 4.7). Its daily position was 1.0 through 2026-09-14, volatile (4 to 8) around the retitle, then 5 to 10 from 2026-10-08 onward on 1 to 6 impressions a day. The post-2026-10-08 slide begins three weeks after the retitle and after #628 (2026-09-27 booking box), so the title is a suspect for the click-through loss, not a proven cause of the position loss.

Why this cluster wins now: the evidence supports exactly one reversible move that undoes a change whose own readback rule has failed, on a page whose clicks fell on the change date. It is the smallest honest fix.

What stays out:

- No Florida-wide content. The 2026-10-25 SERP for "best shelling beaches in florida" is led by Sanibel, Captiva and Marco Island sources; Seascape has no first-hand coverage of them and `2026-09-shelling-ctr.md` already ruled that a Florida-wide claim would fail the credibility gate. The 3,600-search, difficulty-0 query stays deferred, not chased. A future brief needs a real source for Sanibel and Captiva coverage.
- No change to the answer text. The opening answer and every FAQ answer feed an AI Overview that cites this page for about 5 queries (OpenSEO 2026-10-25), so they stay byte-identical.
- No layout move, per the plan, until this brief's readback is recorded.

## What was already tried (do not repeat)

| Date | Move | Brief | Readback |
| --- | --- | --- | --- |
| 2026-07-11 | Existing-page rescue: AMI-first rewrite, factual repairs, Gulf Field Journal layout, three contextual stay handoffs (#444, #445). Title kept as `Florida Shelling Guide — ...` | `2026-07-shelling-guide-rescue.md` | Page held 49 June clicks and 30 clicks in the 2026-08-26..09-18 days before the retitle; no failure recorded |
| 2026-09-19 | Retitle to `Anna Maria Island Shelling: Best Beaches, Tides and Rules` and rewritten meta description (#604) | `2026-09-shelling-ctr.md` | Fails its own rule: CTR 1.4% to 1.04% (page level), daily CTR 1.64% to 0.89% across the change; clicks 30 to 19 |
| 2026-09-27, 2026-10-19 | Booking box (#628) and "stay here" box (#745) | `2026-09-26-top-guide-booking-box.md`, `2026-10-19-top-guides-stay-here-box.md` | Not isolated; #628 overlaps the retitle window, #745 covers 2 days |

How this differs: July was a layout and accuracy rewrite that held rankings; September changed the ranked title and is the move that failed. This brief changes no layout and adds no copy; it puts back the title and meta that ranked, and measures it. If it fails, the next step is a new Gate 0 and not a third title.

## Experiment And Readback Contract

- hypothesis: restoring the pre-2026-09-19 title and meta description restores the page's click-through rate (about 1.6% on the pre-change days) and its Florida-wide impressions without moving the island-query positions.
- primary event: `guide_book_direct_click` (unique users, `placement`, `link_url`)
- guardrail event: Search Console clicks, impressions, CTR and position for the page and for the head query; `guide_stay_click` where present
- entry criteria: Gate 0 complete (below); `npm run verify:release -- --range origin/main` green; byte checks recorded in the PR
- readback window: first 7 complete days after the change is live in production (early-revert check), then a 28-day window; each starts the day after go-live. Compare with the same-length window before the change, adjusted by the control group's change. Because the baseline windows are short and the head query has 1 to 6 impressions a day, below 200 impressions in a window judge on impressions and position only.
- decision rule: see "Early revert and readback rules".

### Early revert and readback rules (plan guards 5 and 6)

7-day early revert: revert at once (a plain revert commit) if the guide is deindexed, its canonical changed, its head query ("anna maria island shelling") falls 3 or more positions while the controls hold, or `guide_book_direct_click` falls to 0 where it was at least 1 in the window before.

28-day readback: compare with the same-length window before the change, adjusted by the control group's change. Revert if clicks fall 30% or more beyond the controls, or the head query leaves the top 10 while the controls hold. Below 200 impressions in the window, judge on impressions and position only. Apply the `winner-guides.md` feeder rule: 20 or more sessions with no guide, stay or booking action is a feeder failure. A failed restore does not reinstate the 2026-09-19 title; it opens a new Gate 0.

## Gate 0 Rescue Block

| Field | Answer |
| --- | --- |
| Target query family | "anna maria island shelling" and island variants (shelling on, shells, seashells); secondary Florida-wide shelling queries ("best shelling beaches in florida", 3,600 US monthly searches, difficulty 0, OpenSEO 2026-10-25) |
| Searcher intent | Guide/research: informational trip planning before booking |
| Current Seascape URL | `/guides/shelling-guide-florida/` |
| SERP observed date | 2026-10-25 |
| SERP stale after | 2026-11-01 |
| Current proof | Search Console final data pulled 2026-10-25 (receipts below). OpenSEO 2026-10-25: Seascape at absolute position 24 for "best shelling beaches in florida"; the SERP shows an AI Overview at rank 1 above Visit Fort Myers (rank 2) and National Geographic (rank 7); the AI Overview cites the guide for about 5 queries. Final GA4 for the guide events was not read in this brief; the proof lane for events waits for the readback. |
| Top visible competitors | Visit Fort Myers (`visitfortmyers.com/discover/on-water/shelling`, organic rank 2), National Geographic (`nationalgeographic.com/travel/article/beaches-for-seashells`, rank 7, dated 2015), Safe to Swim Florida (`safetoswimflorida.com/guides/florida-shelling-beaches/`, rank 10, dated 2026-04-15). For the island query on 2026-09-18 (earlier receipt): beachhouseami.com (2), annamaria.com (5), aparadiserentals.com (7). |
| Competitor angle | Destination breadth (Sanibel, Captiva, Marco Island), UGC and video. |
| Visual/format gap | Competitors lead with ranked lists, photos and maps. Seascape already has a beach comparison table, dispatches, a shell index and an FAQ. Skip: no map or gallery is added; a visual would be an idea, not evidence of a gap. |
| Seascape gap | For the Florida-wide query: no first-hand coverage of the leading shelling destinations, and we cannot honestly supply it. For the island query: the page already covers the topic in depth; the evidence points at the 2026-09-19 title and meta change, not at missing content. |
| Search fit | Rescue the existing URL for the island query and keep the Florida wording that earned its Florida-wide impressions. Support the guest path to the Bradenton and AMI-area stay collections. Do not chase "best shelling beaches in florida" without real source material. |
| Local/GBP proof | N/A: informational organic guide intent, not a local pack or GBP action. |
| AEO/readback note | The AI Overview cites the page for about 5 queries (OpenSEO 2026-10-25), so answer text is frozen. `npm run eval:aeo` was not run (paid provider; not authorized). AI citation readback stays unproved until Analytics reads it. |
| Recommended action | Title and meta description only: restore `pageTitle` to `Florida Shelling Guide — Best Beaches for Shells Near AMI` (before: `Anna Maria Island Shelling: Best Beaches, Tides and Rules`) and `pageDescription` to `Find the best shelling beaches on Anna Maria Island, when to go, what shells to expect, and the current Manatee County collecting rules.` (before: `... when to go for the right tide, ...`). Derived fields that follow them (og:title, og:description, twitter:title, twitter:description and the JSON-LD `Article.description`) change with them. Everything else is frozen. |
| Attack status | completed |
| Query variants inspected | anna maria island shelling, shelling on anna maria island, anna maria island shells, anna maria island seashells, best shelling beaches in florida |
| SERP source | OpenSEO `get_serp_results`, US, depth 20, observed 2026-10-25 (captured earlier by the coordinator; no new paid call). Earlier receipt: 2026-09-18 island-query SERP in `2026-09-shelling-ctr.md`. |
| Competitor URLs inspected | https://www.visitfortmyers.com/discover/on-water/shelling, https://www.nationalgeographic.com/travel/article/beaches-for-seashells, https://safetoswimflorida.com/guides/florida-shelling-beaches/ (the three URLs above, from the captured SERP items). Page bodies were not re-fetched for this brief; the competitor read is from SERP titles, snippets and the dated entries. |
| Content gap and Seascape answer | Florida-wide destination coverage is a real gap and is deferred; the island content has no gap against the ranking set (see `2026-09-shelling-ctr.md`). |
| Design/format strategy | Unchanged. |
| Seascape proof available | First-hand beach access notes and the Manatee County rule citation already on the page; the 2026-09-19 change date and the daily Search Console series. |
| Tools/plugins used | OpenSEO `get_search_console_performance` (free, read-only); captured OpenSEO SERP; git history |
| Decision and reason | Ship the metadata restore: the evidence is first-party, dated, and ties the click loss to a change whose own rule failed; it is reversible in one commit and needs no new claim. |

### Dated receipts

Search Console, final data, domain property `seascape-vacations.com`, pulled 2026-10-25 (`dataState: final`):

| Item | Window | Result |
| --- | --- | --- |
| Page totals | 2026-08-26..09-22 | 30 clicks, 2,072 impressions, position 7.0 |
| Page totals | 2026-09-24..10-21 | 19 clicks, 1,821 impressions, position 7.5 |
| Daily split | 2026-08-26..09-18 (24 days) | 30 clicks, 1,827 impressions, 1.64% CTR |
| Daily split | 2026-09-19..10-21 (33 days) | 19 clicks, 2,133 impressions, 0.89% CTR |
| Head query "anna maria island shelling" | 2026-08-26..09-22 | 4 clicks, 98 impressions, position 2.4 |
| Head query "anna maria island shelling" | 2026-09-24..10-21 | 0 clicks, 66 impressions, position 4.7 |
| "best shelling beaches in florida" | 2026-08-26..09-22 / 2026-09-24..10-21 | 37 impressions at 10.7 / no row |


## Baseline (plan Appendices A and B)

Appendix B row (prior 28 days 2026-08-26..09-22 against last 28 days 2026-09-24..10-21): `/guides/shelling-guide-florida/` 30 clicks, 2,072 impressions, position 7.0 to 19 clicks, 1,821 impressions, position 7.5; -37%.

Appendix A row (2026-04-24..10-21 and 2026-09-24..10-21): 6-month clicks 194, 6-month average position 8.1; 28-day clicks 19, impressions 1,821, position 7.5.

Head query for the PR body (guard 4): "anna maria island shelling".

## Controls

Rule from the plan: holdouts (bradenton-vs-sarasota, best-time, weather) plus every guide with at least 200 impressions in the window that had no change in or within 7 days before the window, read as one combined total. How it is applied here, honestly:

- The readback windows have not started: this PR cannot merge before 2026-11-02 (guard 3), goes live at the next daily publish, and each window starts the day after. So the control list is a candidate list that must be re-verified with `git log` on each guide's source at window start; a guide changed in or within 7 days before a window drops out.
- Recent changes the rule must absorb: #766 and #767 (2026-10-22) changed bradenton-vs-sarasota and best-time copy; #771 (2026-10-23) changed 17px body and the catalog card on every legacy guide; #798 and #799 (live 2026-10-26) moved flights and SRQ onto the planning frame. The 7-day lookback is satisfied for the 2026-10-22, 2026-10-23 and 2026-10-26 changes only for a window starting 2026-11-03 or later; a later window needs the same recheck. #771 touched every legacy guide, so "unchanged" means unchanged since #771 and its 7-day tail, not unchanged ever.
- The holdouts anchor the set even though bradenton-vs-sarasota and best-time changed on 2026-10-22: the plan names them as holdouts and bars further changes to them until the rescues read back. They count as controls only if their 7-day tail clears the window start.

Candidates with 2026-09-24..10-21 impressions of at least 200 (clicks / impressions; last source change from `git log`), excluding the target, `anna-maria-island-vs-siesta-key` (a rescue), `srq-airport-to-anna-maria-island` (L4 readback), `rainy-day-activities-bradenton-sarasota` (first Lane 2 move), `flights-to-anna-maria-island` (changed 2026-10-25):

| Guide | Clicks | Impressions | Last source change |
| --- | ---: | ---: | --- |
| `/guides/best-time-visit-anna-maria-island/` (holdout) | 96 | 6,482 | 2026-10-22 |
| `/guides/anna-maria-island-weather/` (holdout) | 29 | 10,277 | 2026-10-19 |
| `/guides/bradenton-vs-sarasota/` (holdout) | 18 | 1,980 | 2026-10-22 |
| `/guides/anna-maria-island-vs-clearwater-beach/` | 12 | 1,219 | 2026-10-05 |
| `/guides/anna-maria-island-vs-longboat-key/` | 15 | 1,204 | 2026-10-13 |
| `/guides/is-anna-maria-island-worth-visiting/` | 14 | 1,063 | 2026-10-05 |
| `/guides/dolphins-manatees-bradenton/` | 18 | 1,030 | 2026-10-14 |
| `/guides/holmes-beach-vs-bradenton-beach/` | 13 | 470 | 2026-10-05 |
| `/guides/anna-maria-island-area-guide/` | 0 | 469 | 2026-10-05 |
| `/guides/bradenton-vs-sarasota-beaches/` | 4 | 438 | 2026-10-02 |
| `/guides/anna-maria-island-noise-ordinance-guide/` | 6 | 374 | 2026-10-02 |
| `/guides/bradenton-vs-sarasota-for-families/` | 1 | 337 | 2026-10-02 |
| `/guides/anna-maria-island-beaches/` | 1 | 277 | 2026-10-02 |

The PR body lists the controls actually used after the recheck. Candidates changed after 2026-10-25 (for example by Lane 2 moves) are dropped. Guides that were also above 200 impressions but are not listed (`anna-maria-island-vacation-cost`, `fishing-guide-anna-maria-sarasota`, `things-to-do-bradenton-fl`, `bradenton-vs-sarasota-cost-of-living`, `do-you-need-a-car-anna-maria-island`, `booking-direct-vacation-rentals`, `best-vacation-rental-companies-ami`) changed on or after 2026-10-20 or have no one-to-one source file here, and are rechecked at window start the same way.

## Anti-claims And Known Limits

- Causation is not claimed. The same dates overlap #628 (2026-09-27), seasonal decline after summer, the AI Overview at rank 1, and a head-query slide that started 2026-10-08. The restore is the cheapest reversible test, and the controls carry the weight of the decision.
- The head query has 1 to 6 impressions a day; guard 5's 3-position rule is read on the weekly average.

## Guard 1 (freeze) statement

Named changed elements: `<title>`, meta description, `og:title`, `og:description`, `twitter:title`, `twitter:description`, and the JSON-LD `Article.description` field (derived from the meta description). Byte-identical: URL, canonical, H1, opening answer paragraph, every FAQ answer, all other JSON-LD fields, all body text, every `data-track-event` and `data-placement`.

## Voice and copy lane

No new copy. Draft the copy: restore of the string live before 2026-09-19. Remove internal wording: none present. Check voice and specificity: the title names the Florida shelling topic and the island base; the em dash was already in the live title.

## Release note

Publication spacing (plan guard 3): this PR merges no earlier than 2026-11-02. The coordinator owns merge timing. It goes live at the next daily publish (09:05 UTC) after merge; readback windows start the day after.
