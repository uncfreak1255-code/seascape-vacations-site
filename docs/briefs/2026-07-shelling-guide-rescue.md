# Brief: Shelling Guide Existing-Page Rescue

## Content Gate Inputs

- persona: Gulf Coast traveler planning shelling mornings near Anna Maria Island, Coquina Beach, and nearby day-trip beaches.
- primary keyword: shelling Anna Maria Island
- secondary keywords: best shelling beaches Florida, Florida Gulf Coast shelling, Bean Point shelling, Coquina Beach shelling
- audience pattern: organic guide visitor who is already choosing beach timing and needs a natural next step into a stay collection that fits shelling intent.
- proof source: July 7, 2026 Google Search Console performance email for `seascape-vacations.com`, `docs/portfolio/winner-guides.md`, and current source for `/guides/shelling-guide-florida/`.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/beach-house-rentals-florida-gulf-coast/
- CTA target: replace generic `/properties/` exits with tracked stay links that match shelling intent and preserve the page as an existing guide, not a new page batch.
- anti-claims: no conversion-lift claim before readback, no new shelling legality claim beyond existing empty-shell guidance, no unsupported beachfront inventory claim, no new page variant, no title rewrite, and no statement that every Seascape home is steps from shelling beaches.

## Experiment And Readback Contract

- hypothesis: `/guides/shelling-guide-florida/` is earning enough Search Console demand to deserve a direct stay handoff, but the old generic property CTAs do not match shelling trip intent.
- primary event: `guide_book_direct_click`
- guardrail event: internal-link integrity, guide canonical integrity, JSON-LD validity, and content voice lint.
- entry criteria: the July 7, 2026 Search Console email names `/guides/shelling-guide-florida/` as a top growing page with `+25` clicks and a top performing page with `49` clicks for June 2026.
- readback window: first 7 complete days after deploy once Search Console and site event data cover the full window.
- decision rule: keep if the page records at least one guide-to-stay or direct-book action without route, schema, link, or content-lint regression; if still zero, test a stronger beach-choice module in a separate brief.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | shelling Anna Maria Island, best shelling beaches Florida, Florida Gulf Coast shelling |
| Searcher intent | Traveler wants practical shelling spots, timing, rules, and a stay base close enough for low-tide beach mornings. |
| Current Seascape URL | `/guides/shelling-guide-florida/` |
| SERP observed date | 2026-07-07 |
| SERP stale after | 2026-08-07 |
| Current proof | July 7, 2026 Search Console performance email: shelling guide is top growing at `+25` clicks and top performing at `49` clicks for June 2026. |
| Top visible competitors | not re-read for this bounded email-triggered rescue |
| Competitor angle | not applicable for this pass; the task is a current winner handoff repair, not a competitive rewrite. |
| Seascape gap | The page had March 2026 freshness signals and generic `/properties/` CTAs instead of tracked stay links aligned to Bean Point, Coquina, and beach-access shelling trips. |
| Search fit | The current guide already answers shelling timing and locations; the correct conversion step is a stay collection for AMI-area and Bradenton beach-access trips. |
| Local/GBP proof | not applicable; this is a guide-to-stay handoff, not a local pack or GBP claim. |
| AEO/readback note | Preserve the TL;DR and FAQ answer structure; update freshness and CTA routing without dissolving the answer block. |
| Recommended action | Refresh July 2026 trust signals and replace generic property CTAs with tracked stay links to `/stays/anna-maria-island-vacation-rentals/`, `/stays/bradenton-vacation-rentals-near-beaches/`, and `/stays/beach-house-rentals-florida-gulf-coast/`. |

## In Scope

- `src/guides/shelling-guide-florida.html`
- `docs/portfolio/winner-guides.md`
- this brief

## Not In Scope

- new shelling pages
- title or meta-description rewrite
- competitor rewrite
- new schema type
- stay-page copy changes
- new property amenity or distance claims

## Release Gate

- `npm run lint:content`
- `npm run build`
- `npm run verify:links`
- `npm run verify:jsonld`

## Done When

- stale March 2026 trust signals are refreshed on the page.
- generic `/properties/` CTAs are gone from the shelling guide.
- shelling-intent stay links carry `guide_book_direct_click`.
- content, build, link, and JSON-LD gates pass.
- closeout says this is review-ready, not shipped.
