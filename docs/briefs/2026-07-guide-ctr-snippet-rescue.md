# Brief: Guide CTR Snippet Rescue

## Content Gate Inputs

- persona: Gulf Coast trip planner comparing destinations, months, and logistics who sees a Seascape result on page one and clicks a competitor instead.
- primary keyword: best time to visit Anna Maria Island
- secondary keywords: Sarasota airport to Anna Maria Island, Anna Maria Island weather by month, Siesta Key vs Anna Maria Island for families, Bradenton vs Sarasota, is Anna Maria Island worth visiting
- audience pattern: organic reader who already sees the page in a page-one position but does not click, so the loss happens in the SERP rather than on the page.
- proof source: read-only GSC Search Performance pull for 2026-06-26 through 2026-07-23 via `seascape-analytics/scripts/gsc-search-performance.sh`, receipt `tmp/verify-2026-07-27-perf.md`, plus the current source of each of the six guide routes.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/
- CTA target: none added or moved. This batch changes SERP-facing metadata only and preserves every existing on-page CTA and event contract.
- anti-claims: no booking or revenue lift claim, no ranking or CTR lift claim, no current-rate or price claim, no inventory-count claim, no new route, no body-copy rewrite, and no property-fact change.

## Required Internal Link Map

- src/guides/best-time-visit-anna-maria-island.html: /stays/new-years-eve-rentals-florida/, /stays/beach-wedding-vacation-rentals-florida/
- src/guides/srq-airport-to-anna-maria-island.html: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/
- src/guides/anna-maria-island-weather.html: /stays/spring-break-rentals-anna-maria-island/, /stays/anna-maria-island-homes-with-pool/
- src/guides/siesta-key-vs-anna-maria-island-families.html: /stays/anna-maria-island-vacation-rentals/, /stays/siesta-key-area-vacation-rentals/
- src/guides/bradenton-vs-sarasota.html: /stays/bradenton-vacation-rentals-near-beaches/, /stays/anna-maria-island-vacation-rentals/
- src/guides/is-anna-maria-island-worth-visiting.html: /stays/anna-maria-island-vacation-rentals/, /stays/honeymoon-rentals-anna-maria-island/

These are the links each page already carries. This batch does not add or remove
internal links; the map exists so the content gate can verify nothing was lost
while the metadata changed.

## Authorized Source Files

- src/guides/best-time-visit-anna-maria-island.html
- src/guides/srq-airport-to-anna-maria-island.html
- src/guides/anna-maria-island-weather.html
- src/guides/siesta-key-vs-anna-maria-island-families.html
- src/guides/bradenton-vs-sarasota.html
- src/guides/is-anna-maria-island-worth-visiting.html

## Experiment And Readback Contract

- hypothesis: these six pages already hold page-one positions, so the click is being lost in the SERP. Titles that lead with the page's actual answer, and descriptions that expose the concrete numbers already on the page, should earn a larger share of the impressions the pages already have.
- primary event: GSC CTR per URL for the six routes.
- guardrail event: average position per URL must not degrade; route integrity, canonical integrity, and JSON-LD validity must stay green.
- entry criteria: in the 2026-06-26 through 2026-07-23 window the six routes together recorded `179` clicks against `27,245` impressions, a combined `0.66%` CTR, at average positions between `4.2` and `7.8`. Per URL: best-time `75/8,567/0.88%/5.6`; srq-airport `28/5,944/0.47%/6.6`; weather `30/4,165/0.72%/7.8`; siesta-families `19/3,047/0.62%/4.2`; bradenton-vs-sarasota `16/2,998/0.53%/5.4`; worth-visiting `11/2,524/0.44%/4.6`.
- readback window: first full 28-day window after deploy once GSC covers it, compared against 2026-06-26 through 2026-07-23.
- decision rule: judge each URL separately. Keep when CTR rises without average position degrading. Revert a single title when CTR falls or its average position drops by `>= 1.0`.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | Destination-choice, month-choice, weather, and airport-transfer queries for Anna Maria Island, Bradenton, and Siesta Key. |
| Searcher intent | Guide and research intent feeding a guest stay decision. |
| Current Seascape URL | The six routes listed in Authorized Source Files. |
| SERP observed date | 2026-07-27 |
| SERP stale after | 2026-08-03 |
| Current proof | GSC 2026-06-26 to 2026-07-23: all six rank on page one and all six convert under 1% of impressions to clicks. |
| Top visible competitors | WebSearch SERP pull, 2026-07-27, one query per page (DataForSEO live-SERP was unavailable in this runtime; WebSearch is the same source the monthly competitor audit used before 2026-07). Best-time: visitflorida, annamaria.com, annamariaislandbeachrentals, annamarialifevacationrentals ("in 2026"), thecoconutrentals ("Complete Guide"), islandvacationproperties. SRQ: rome2rio ("4 ways to travel"), TripAdvisor transfer product, aldlimo, amitransportation. Weather: weatherspark, weather-and-climate, AccuWeather, annamaria.com, islandvacationproperties. Siesta-vs-AMI: TripAdvisor forum, mousinaround (family blog), luxurytraveldiarie, passagekeydolphintours, plus Seascape's own unqualified comparison guide. Bradenton-vs-Sarasota: dwellingwell, realnetflorida, floridarentalbyowners, zachosre, sarasotasunshinemovers. Worth-visiting: visitflorida, floridarambler, annamaria.com, thewalkingmermaid, traveltasteclick. |
| Competitor angle | Every visible competitor titles the TOPIC ("Best Time to Visit...", "Ultimate Guide", "Which Is Right For You?"); none put the page's answer in the title, which is the gap these rewrites use. Specifics that shaped the choices: (1) the Bradenton-vs-Sarasota SERP is dominated by RELOCATION intent (Zachos, dwellingwell, a moving company), so leading with "for Vacation" separates the travel read from the moving read; (2) the SRQ SERP is transactional transport comparison (rome2rio's "4 ways", vendor pages), so a costs-led snippet matches the visible intent; (3) the weather SERP is data sites (weatherspark, AccuWeather), so putting real ranges in the snippet competes on their terms; (4) mousinaround confirms family intent is present on the Siesta-vs-AMI SERP, and Seascape's own unqualified guide also ranks there — reinforcing the intent-collision watch item below. |
| Visual/format gap | Not a layout change. Nothing renders differently on the page. |
| Seascape gap | Titles led with the topic rather than the page's answer, and descriptions withheld the concrete figures the pages already contain, so the snippet gave a reader no reason to prefer it at position 4 to 8. |
| Search fit | The existing URLs are correct and already rank. This is snippet framing only, not new pages or new answers. |
| Local/GBP proof | Not a local-pack or GBP route. |
| AEO/readback note | Every figure used in a title or description is already stated on the page and was verified against page source before use. No new claim enters the index. |
| Recommended action | Rewrite title, meta description, and the matching Open Graph and Twitter tags on six guide routes, and correct one stale JSON-LD claim on the SRQ guide. |

## Known Issues Deliberately Left Out Of Scope

Recorded so they are not lost, and so nobody reads their absence as a decision
that they are fine:

- `src/guides/siesta-key-vs-anna-maria-island-families.html` states water depth
  three incompatible ways (`0-2 ft for 30+ yards` in the comparison table,
  `5 feet average for 100+ yards` in the safety box, `up to your chest` in the
  prose) and its FAQ JSON-LD repeats the first. Separately, the trolley is
  headed "The Free Trolley" and priced "$2 (free for kids under 5)" in the same
  sentence. None of these numbers appear in any string this batch ships, so the
  batch does not propagate them. They need a source-truth pass of their own.
- The same page may have an intent-collision problem with
  `src/guides/anna-maria-island-vs-siesta-key.html`, which targets the
  unqualified head term. If most of the 3,047 impressions come from the
  unqualified query, a family-framed title suppresses the non-family majority
  and the real fix is intent separation between the two guides, not a snippet
  rewrite. This batch ships the rewrite regardless, but it must not be booked as
  the whole fix for that URL.
