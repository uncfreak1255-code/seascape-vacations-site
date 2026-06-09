# Brief: High-Visibility Guide Transfer Rescue

## Content Gate Inputs

- persona: Gulf Coast traveler comparing beach bases before choosing where to stay.
- primary keyword: anna maria island vs siesta key
- secondary keywords: bradenton vs sarasota, anna maria island vacation rentals, siesta key area vacation rentals, bradenton vacation rentals near beaches
- audience pattern: organic comparison visitor who has enough intent to read a winner guide but needs a clearer path into the right stay collection.
- proof source: `weekly-search-operator-report-current.md` in `seascape-analytics`, `docs/status/next-batch.md`, `docs/portfolio/winner-guides.md`, and the current source for `/guides/anna-maria-island-vs-siesta-key/` and `/guides/bradenton-vs-sarasota/`.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/siesta-key-area-vacation-rentals/
- CTA target: keep the existing guide conversion kit, but add earlier tracked stay-path links so readers can move from comparison into direct-book stay pages before the lower conversion module.
- anti-claims: no new ranking-win claim, no conversion-lift claim before readback, no title or meta rewrite from this batch, no new guide variant, no unsupported beach or inventory claim.

## Experiment And Readback Contract

- hypothesis: high-impression guide visitors are reading the comparison answer but missing the stay-path handoff, so earlier tracked links to the relevant stay collections should improve guide-to-stay transfer without changing the SERP snippet.
- primary event: `guide_book_direct_click`
- guardrail event: `booking_engine_handoff`, internal-link integrity, guide canonical integrity, and JSON-LD validity.
- entry criteria: the 2026-05-29 to 2026-06-04 joined read shows `/guides/anna-maria-island-vs-siesta-key/` at `1,805` impressions and `/guides/bradenton-vs-sarasota/` at `1,079` impressions, both with `0` tracked guide/stay/booking actions.
- readback window: first 7 complete days after deploy once final GSC data covers the full window.
- decision rule: keep if either page records at least one guide-to-stay or direct-book action without route, schema, or content-lint regression; if still zero, test CTA placement higher in the guide or rework the conversion kit copy in a separate brief.

## Why This Batch

- The owner and stay money pages do not have enough search demand in the current window to call.
- The guide winner cluster has the clearest visibility: `4,656` impressions, `129` GA4 sessions, and zero tracked transfer events.
- `/guides/anna-maria-island-vs-siesta-key/` is the first target because it has the strongest page-level demand in the read.
- `/guides/bradenton-vs-sarasota/` is included because it is also above the feeder-failure threshold and has the same missing handoff pattern.

## In Scope

- `/guides/anna-maria-island-vs-siesta-key/`
- `/guides/bradenton-vs-sarasota/`
- `docs/status/next-batch.md` synced from the current analytics receipt
- tracked links into the stay pages already mapped in `docs/portfolio/winner-guides.md`

## Not In Scope

- title or meta rewrites
- new guide pages
- owner-page rewrites
- stay-page CRO
- Holmes Beach or seasonal expansion
- AI citation claims
- conversion impact claims before the reread

## Voice Editor Notes

- Keep the copy practical and guest-facing.
- Do not explain tracking, analytics, or proof mechanics in public copy.
- Prefer "compare homes" and "stay area" language over funnel language.
- Keep direct-book savings language inside the existing approved guide conversion kit.

## Release Gate

- `npm run lint:content`
- `npm run build`
- `npm run verify:jsonld`
- `npm run verify:links`
- route smoke on `/guides/anna-maria-island-vs-siesta-key/` and `/guides/bradenton-vs-sarasota/`

## Done When

- `docs/status/next-batch.md` reflects the fresh-but-below-threshold analytics receipt.
- Both guide pages keep their existing conversion kit.
- Both guide pages expose earlier tracked stay-path links.
- Local content, build, JSON-LD, and link gates pass.
- Final closeout says this is review-ready, not shipped.
