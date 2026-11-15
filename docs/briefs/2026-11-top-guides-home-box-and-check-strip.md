# Brief: Home Box And Check Strip On Two Top Guides

- lifecycle: active
- task scope: add the shared "stay here" home box
  (`src/_includes/partials/guide-stay-here.njk`, data in
  `src/_data/guideStayHere.json`) to `src/guides/srq-airport-to-anna-maria-island.html`
  and `src/guides/anna-maria-island-vs-clearwater-beach.html`, and add a dated
  "How we checked this guide" strip (`.pg-checked` in `src/css/planning-guide.css`)
  to the airport guide. Sawyer saw a rendered before and after of both parts on
  the airport guide on 2026-11-14 and approved the build for the top guides on
  2026-11-15.
- completion or successor: set to completed with the merged PR. Deployment and
  click lift are separate claims.

## Content Gate Inputs

- persona: a traveler who found a planning guide through search (airport transfer, or Anna Maria Island against Clearwater Beach) and has not chosen a home.
- primary keyword: unchanged per guide (SRQ airport to Anna Maria Island; Anna Maria Island vs Clearwater Beach)
- secondary keywords: unchanged from each guide's current page
- audience pattern: the reader gets the answer, then sees one named home with real specs and a plain mainland note.
- proof source: `src/_data/properties-fallback.json` (`blue-house`, `dockside-dreams`: specs, highlights, `guestFacts`); for the strip, the airport's own pages read on 2026-11-15 (https://flysrq.com/ground-transportation, https://flysrq.com/car-rentals) and the guide's existing August 2026 review line.
- required internal links: /properties/, /guides/
- CTA target: `/properties/<slug>/#check-availability` (`guide_property_check_dates_click`, placement `guide_stay_here`), with `/properties/` as the compare link (`guide_stay_click`).
- anti-claims: no price, discount or savings claim; no beachfront, on-island or walk-to-beach claim (both homes are on the Bradenton mainland); no hot tub at the pickleball home (its record says none is verified); no fishing-from-the-dock claim; no check line without a check that was done on the stated date.

## Why This Batch

- The home box is on five guides (`docs/briefs/2026-10-19-top-guides-stay-here-box.md`). A Search Console read reported in the project on 2026-11-14 puts the airport and Clearwater guides among the top guides, and neither has the box.
- `/guides/bradenton-vs-sarasota/` is not changed: it already shows two homes ("Picture your week here") and a dated source card ("Why trust this comparison"), and it is the winner-defense page in `docs/status/next-batch.md`.
- The Clearwater guide gets no strip. Its facts were last reviewed in March 2026 and no new source check was done; a strip there waits for an accuracy pass.
- The 2026-10-19 brief asked for a readback before more guides get the box. That readback is still pending. Sawyer approved this extension before it; the readback below covers both.

## Experiment And Readback Contract

- hypothesis: a named home after the planning answer moves more readers of these two guides to a property page than the end-of-page kit alone.
- primary event: `guide_property_check_dates_click` with `data-placement="guide_stay_here"` for the two guide slugs.
- guardrail event: `guide_book_direct_click` and `guide_stay_click` from the existing kits do not fall.
- entry criteria: merged, published, and events received for the two slugs.
- readback window: first 14 complete days after publish against the prior 14 days.
- decision rule: keep if property-page visits from the two guides rise without a drop in kit clicks; otherwise move the box or change the home.

## Gate 0 Search And Attack Receipt (airport guide)

| Field | Required answer |
| --- | --- |
| Target query family | srq airport to anna maria island; sarasota airport to anna maria island |
| Searcher intent | Informational with a trip already planned: time, cost and the best way from the airport |
| Current Seascape URL | https://seascape-vacations.com/guides/srq-airport-to-anna-maria-island/ |
| SERP observed date | 2026-11-15 |
| SERP stale after | 2026-12-15 |
| Current proof | 2026-11-15 web search for "SRQ airport to Anna Maria Island how to get there drive time cost" (US). It lists result pages and is not a rank read: no Seascape position is claimed |
| Top visible competitors | rome2rio.com (many route pages), girlonazebra.com, viatovia.com |
| Competitor angle | From result titles only: route-planner pages and "how to get to Anna Maria Island" travel posts |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | No home is shown inside the guide; the only stay step is the end-of-page kit |
| Search fit | Title, description, H1, body answers and JSON-LD are unchanged |
| Local/GBP proof | Not applicable: no local-pack or Google Business change |
| AEO/readback note | JSON-LD is unchanged. Read the events in the readback contract after publish |
| Recommendation | Add the home box before step 03 and the dated check strip before step 01; change no existing sentence |
| Attack status | completed |
| Query variants inspected | SRQ airport to Anna Maria Island how to get there drive time cost |
| SERP source | Web search, observed 2026-11-15 (titles and URLs only) |
| Competitor URLs inspected | https://girlonazebra.com/how-to-get-to-anna-maria-island/; https://viatovia.com/blog/sarasota-bradenton-airport-to-anna-maria-island |
| Content gap and Seascape answer | Not assessed beyond titles; Seascape adds a named home and a dated record of what was checked at the airport's own pages |
| Design/format strategy | Existing shared home box; a ruled, type-only strip in the frame's `--pg-*` tokens |
| Seascape proof available | Property record for `blue-house`; airport pages read 2026-11-15 |
| Tools/plugins used | Web search, web fetch of the airport pages, node build, Playwright render |
| Decision and reason | Ship: the traffic is earned and the page has no in-article stay step |

## Gate 0 Search And Attack Receipt (Clearwater comparison guide)

| Field | Required answer |
| --- | --- |
| Target query family | anna maria island vs clearwater beach |
| Searcher intent | Comparison before choosing a beach base |
| Current Seascape URL | https://seascape-vacations.com/guides/anna-maria-island-vs-clearwater-beach/ |
| SERP observed date | 2026-11-15 |
| SERP stale after | 2026-12-15 |
| Current proof | 2026-11-15 web search for "Anna Maria Island vs Clearwater Beach which is better" (US). It lists result pages and is not a rank read: no Seascape position is claimed |
| Top visible competitors | fodors.com (forum), journee-mondiale.com, alwaysontheshore.com, islandreal.com, wanderlog.com |
| Competitor angle | From result titles only: forum threads and first-person destination posts; few direct side-by-side pages |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | Step 07 tells the reader where to stay but shows no home |
| Search fit | Title, description, H1, body answers and JSON-LD are unchanged |
| Local/GBP proof | Not applicable: no local-pack or Google Business change |
| AEO/readback note | JSON-LD is unchanged. Read the events in the readback contract after publish |
| Recommendation | Add the home box at the end of step 07; change no existing sentence; no check strip |
| Attack status | completed |
| Query variants inspected | Anna Maria Island vs Clearwater Beach which is better |
| SERP source | Web search, observed 2026-11-15 (titles and URLs only) |
| Competitor URLs inspected | https://www.fodors.com/community/united-states/anna-maria-island-which-location-better-anna-maria-holmes-or-bradenton-1002737-print/; https://www.islandreal.com/blog/?p=31498 |
| Content gap and Seascape answer | Not assessed beyond titles; Seascape adds a named waterfront home with real specs and a mainland note |
| Design/format strategy | Existing shared home box, unchanged |
| Seascape proof available | Property record for `dockside-dreams` |
| Tools/plugins used | Web search, node build, Playwright render |
| Decision and reason | Ship the box; hold the strip until the page's facts are checked again |

## Source And Proof Constraints

- Home name, specs and photo come from the `properties` data at build. Each fit line uses only facts in the same record.
- Strip lines: 2026-11-15, the airport's pages state that rental counters are in the baggage claim area, that cars are picked up at a covered lot within walking distance of the terminal, and that Uber and Lyft pick up at a designated zone. The trolley line repeats the guide's own August 2026 review; a county brochure dated November 2, 2024 was the only fare document read on 2026-11-15, so no November date is given for the trolley.

## Release Gate Checklist

- `npm run verify:release -- --range origin/main`.
- `guide-ami-vs-clearwater` is a visual baseline route (`tests/visual/routes.js`); the home box changes its screenshot on purpose.
- Neither route is smoke-asserted for the added text; the airport guide's pinned strings ("Reviewed August 19, 2026", "August 2026 review:") are unchanged.

## Done When

- Both guides render the box with the right home, photo and working links; the airport guide renders the strip; checks pass; PR open for review.
