# Brief: drop unsourced dollar figures from the how-to-get guide

- lifecycle: active
- task scope: replace three unsourced third-party dollar ranges (rideshare fares, airfare flash-sale drops, SRQ-versus-TPA family savings) on `/guides/how-to-get-to-anna-maria-island/` with compare-current-fare wording; no other guide changes
- completion or successor: record the merged PR here when it lands

## Content Gate Inputs

- persona: guest deciding how to reach Anna Maria Island who wants fare guidance they can act on today, not a number nobody can stand behind
- primary keyword: how to get to anna maria island
- secondary keywords: anna maria island airport, srq to anna maria island, flying to anna maria island, anna maria island rideshare
- audience pattern: trip-planning guide readers comparing SRQ and TPA and deciding whether to rent a car
- proof source: no Seascape source exists for rideshare fares, airfare sale drops, or SRQ-versus-TPA family savings; the only honest copy points the reader at the current fare in the app or on the airline
- required internal links: /guides/srq-airport-to-anna-maria-island/, /stays/book-direct-anna-maria-island/
- CTA target: /stays/book-direct-anna-maria-island/
- anti-claims: do not state a rideshare fare range; do not state a dollar amount an airfare can drop during a sale; do not state how much cheaper TPA is for a family; do not add any new dollar figure without a dated source row in `src/_data/sourcedClaims.json`

## Why This Batch

- what changed in the data: the price-cue review in PR #734 listed 20 suspected price claims carrying dollar figures; 17 of them sit in two retired guide files that Eleventy does not publish (`permalink: false`), one is a relative Bradenton-versus-Sarasota row with no dollar figure, and two are on this published guide
- why this cluster wins now: these are the only published sentences from that list that quote a dollar figure Seascape cannot source
- what should explicitly wait: the retired guide files (unpublished; delete them in a follow-up rather than rewrite dead copy); the ferry, bike-rental, and airport-taxi figures on this page were not in the reviewed list

## Experiment And Readback Contract

- hypothesis: removing unsourced fare figures does not change clicks on this guide and removes copy a reader could prove wrong
- primary event: guide_book_direct_click on `/guides/how-to-get-to-anna-maria-island/`
- guardrail event: none; no new claim is introduced
- entry criteria: merged copy and a green `npm run lint:content`
- readback window: 2026-11-17
- decision rule: hold the compare-current-fare wording unless a dated fare source is added to `src/_data/sourcedClaims.json`

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | none; no query is being targeted |
| Searcher intent | n/a |
| Current Seascape URL | `/guides/how-to-get-to-anna-maria-island/` |
| SERP observed date | 2026-10-17 |
| SERP stale after | 2026-11-17 |
| Current proof | none for the removed figures; `src/_data/sourcedClaims.json` has no rideshare, airfare, or airport-savings row |
| Top visible competitors | n/a for a truth correction |
| Competitor angle | n/a |
| Visual/format gap | none; three list-item sentences only, same list structure |
| Seascape gap | three dollar ranges with no source on a published guide |
| Search fit | no new page, no new keyword; title and meta unchanged |
| Local/GBP proof | Not a GBP or local-pack action. Organic guide page; unsourced-figure removal. |
| AEO/readback note | the rewritten sentences stay quotable and no longer assert a fare |
| Recommendation | ship the three sentence rewrites |
| Attack status | `none found after named checks` |
| Query variants inspected | none; no query lane involved |
| SERP source | n/a |
| Competitor URLs inspected | None were inspected, because an unsourced-figure removal has no competitor lane. The three named checks resolve as follows: the current source check is the governing evidence (`src/_data/sourcedClaims.json` has no row for these figures); a SERP check was deliberately not run because no query is being targeted; a competitor-page check was deliberately not run for the same reason. |
| Content gap and Seascape answer | keep the list items; replace each dollar range with an instruction to compare the current fare |
| Design/format strategy | unchanged |
| Seascape proof available | none for the removed figures, which is why they come out |
| Tools/plugins used | PR #734 review table `docs/reviews/2026-10-price-cue-suspected-claims.md` (on that PR branch, not on main); grep over `src/` for published duplicates |
| Decision and reason | ship: the only published dollar figures on the reviewed list have no source |

## Required Internal Link Map

- src/guides/how-to-get-to-anna-maria-island.html: /guides/srq-airport-to-anna-maria-island/, /stays/book-direct-anna-maria-island/

## Not In Scope

- the two retired guide files `src/guides/anna-maria-island-vacation-cost-guide-2026/index.html` and `src/guides/best-time-to-visit-anna-maria-island/index.html` (unpublished)
- the `Rental Cost (3BR w/ Pool)` row on `/guides/bradenton-vs-sarasota-for-families/` (relative wording, no dollar figure, consistent with that page's FAQ and body)
- activity-table admission prices on the spring-break and things-to-do guides
- any parser, baseline, or enforcement change

## Source files likely to change

  - `src/guides/how-to-get-to-anna-maria-island.html`
