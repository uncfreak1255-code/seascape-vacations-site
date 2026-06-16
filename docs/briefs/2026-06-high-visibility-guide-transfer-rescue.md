# Brief: High-Visibility Guide Transfer Rescue

## Content Gate Inputs

- persona: Gulf Coast traveler comparing beach bases before choosing where to stay.
- primary keyword: high-visibility guide-to-stay transfer
- secondary keywords: anna maria island vs siesta key, bradenton vs sarasota, best time to visit anna maria island, anna maria island vacation rentals, siesta key area vacation rentals, bradenton vacation rentals near beaches
- audience pattern: organic comparison visitor who has enough intent to read a winner guide but needs a clearer path into the right stay collection.
- proof source: `tmp/weekly-ai-visibility-reruns/2026-06-08-to-2026-06-14/weekly-search-operator-report.json` in `seascape-analytics`, `docs/portfolio/winner-guides.md`, and the current source for `/guides/anna-maria-island-vs-siesta-key/`, `/guides/bradenton-vs-sarasota/`, and `/guides/best-time-visit-anna-maria-island/`.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/
- CTA target: keep the existing guide conversion kit, but add earlier tracked stay-path links so readers can move from comparison into direct-book stay pages before the lower conversion module.
- anti-claims: no new ranking-win claim, no conversion-lift claim before readback, no title or meta rewrite from this batch, no new guide variant, no unsupported beach or inventory claim.

## Experiment And Readback Contract

- hypothesis: high-impression guide visitors are reading the comparison answer but missing the stay-path handoff, so earlier tracked links to the relevant stay collections should improve guide-to-stay transfer without changing the SERP snippet.
- primary event: `guide_book_direct_click`
- guardrail event: `booking_engine_handoff`, internal-link integrity, guide canonical integrity, and JSON-LD validity.
- entry criteria: the 2026-06-07 to 2026-06-13 joined read shows `/guides/anna-maria-island-vs-siesta-key/` at `2,822` impressions, `27` clicks, and `119` GA4 sessions; `/guides/bradenton-vs-sarasota/` at `1,043` impressions, `9` clicks, and `89` GA4 sessions; and `/guides/best-time-visit-anna-maria-island/` at `1,889` impressions, `13` clicks, and `23` GA4 sessions. All three have `0` tracked guide/stay/booking actions. `/guides/bradenton-vs-sarasota/` has `3` email-capture submits, which does not satisfy the stay/book movement gate.
- readback window: first 7 complete days after deploy once final GSC data covers the full window.
- decision rule: keep if at least one of the three pages records a guide-to-stay, direct-book, booking-engine, stay-view, or property-booking action without route, schema, or content-lint regression; if still zero, test CTA treatment higher in the guide or rework the conversion kit copy in a separate brief.

## Why This Batch

- The owner and stay money pages do not have enough search demand in the current window to call.
- The three-page guide transfer batch has clear visibility: `5,754` impressions, `49` GSC clicks, `231` GA4 sessions, and zero tracked stay/book movement.
- `/guides/anna-maria-island-vs-siesta-key/` is included because it has the strongest page-level demand in the read.
- `/guides/bradenton-vs-sarasota/` is included because it has sessions and email capture but no stay/book movement.
- `/guides/best-time-visit-anna-maria-island/` is included because it has proven sessions and the same missing handoff pattern.

## In Scope

- `/guides/anna-maria-island-vs-siesta-key/`
- `/guides/bradenton-vs-sarasota/`
- `/guides/best-time-visit-anna-maria-island/`
- the three proven winner guides named in this brief only
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
- route smoke on `/guides/anna-maria-island-vs-siesta-key/`, `/guides/bradenton-vs-sarasota/`, and `/guides/best-time-visit-anna-maria-island/`

## Done When

- All three guide pages keep their existing conversion kit.
- All three guide pages expose earlier tracked stay-path links.
- Local content, build, JSON-LD, and link gates pass.
- Final closeout says this is review-ready, not shipped.
