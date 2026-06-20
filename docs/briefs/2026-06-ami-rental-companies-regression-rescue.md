# Brief: AMI Rental Companies Regression Rescue

## Content Gate Inputs

- persona: Anna Maria Island guest comparing vacation-rental companies before
  booking, plus AMI-area owners using the same search to understand manager fit.
- primary keyword: best vacation rental companies Anna Maria Island
- secondary keywords: Anna Maria Island vacation rental companies, best Anna
  Maria Island rental companies, AMI vacation rental companies, book direct
  Anna Maria Island rental company
- audience pattern: comparison searcher who wants a trustworthy shortlist, not
  a generic booking platform page or a stale listicle.
- proof source: `docs/status/next-batch.md` run date 2026-06-20,
  `docs/status/content-decay-patrol.md` generated 2026-06-20,
  `docs/process/ranking-regression-rescue.md`, source readback from
  `src/guides/best-vacation-rental-companies-ami.html`, and current public
  company/directory pages reviewed 2026-06-20.
- required internal links: /stays/book-direct-anna-maria-island/, /guides/booking-direct-vacation-rentals/, /guides/anna-maria-island-vacation-cost/, /guides/anna-maria-island-area-guide/
- CTA target: keep the direct-book home CTA, but do not imply Seascape has the
  biggest on-island inventory.
- anti-claims: no rank recovery claim, no AI Overview claim, no "best overall"
  superlative without live third-party proof, no hidden-fee accusation, no
  exact current fee/tax promise, and no date refresh unless the public page
  receives a real current-source review.

## Experiment And Readback Contract

- hypothesis: a narrow comparison-page rescue should improve search fit by
  making the page match the exact "vacation rental companies" query, replacing
  stale March proof language, and removing unsupported subjective claims while
  preserving the direct-booking handoff.
- primary event: `guide_book_direct_click`
- guardrail event: route returns 200, canonical remains self-referencing,
  Article/FAQPage/BreadcrumbList JSON-LD remains valid, and competitor language
  stays neutral and source-backed.
- entry criteria: `docs/status/next-batch.md` lists this query family twice as
  absent for the current Seascape URL on 2026-06-20, and
  `docs/status/content-decay-patrol.md` flags both stale `dateModified` and a
  stale March proof label.
- readback window: first 7 complete days after deploy once final GSC data covers
  the full window, respecting Search Console delay.
- decision rule: keep if rank, impressions, CTR, clicks, or
  `guide_book_direct_click` improves without a guardrail failure; if flat, run a
  deeper title/meta and table-structure pass against the visible competitors; if
  worse, revert weak copy changes or split the owner intent into a separate
  owner-management page brief.

## Why This Batch

- This is one of the highest-priority current decay findings because the route
  is both stale and absent for its tracked query family.
- The page compares named companies, so a cosmetic freshness bump would be
  unsafe. The page needs current competitor/source proof or it should not be
  refreshed.
- The existing route should be rescued before creating new comparison pages,
  because it already has the exact search intent, FAQ schema, direct-booking
  CTA, and related internal links.

## Gate 0 Rescue Block

| Field | Required answer |
| --- | --- |
| Target query family | `best vacation rental companies Anna Maria Island`, `Anna Maria Island vacation rental companies`, and nearby AMI company-comparison searches. |
| Searcher intent | Commercial comparison and local shortlist intent. The searcher wants real AMI rental-company options, proof that the list is current, and a clear way to compare direct booking, inventory, local help, and owner fit. |
| Current Seascape URL | `/guides/best-vacation-rental-companies-ami/`. |
| SERP observed date | 2026-06-20 |
| SERP stale after | 2026-06-27 |
| Current proof | `docs/status/next-batch.md` run date 2026-06-20 lists `best vacation rental companies Anna Maria Island` twice for this URL as absent with ranking-regression support. `docs/status/content-decay-patrol.md` generated 2026-06-20 flags stale `dateModified` age 91d and a visible March 2026 proof label age 111d. Source readback confirms `src/guides/best-vacation-rental-companies-ami.html` still says the company comparison used March 2026 walkthroughs and includes unsupported subjective fee-visibility language. Public company/source pages reviewed 2026-06-20 include Sato Real Estate, Anna Maria Life Vacation Rentals, Anna Maria Island Chamber vacation-rental directory, Island Real Estate, Vacasa, AMI Locals, Anna Maria Vacations, and Evolve. |
| Top visible competitors | Sato Real Estate, Anna Maria Life Vacation Rentals, and Anna Maria Island Chamber from the 2026-06-20 SERP evidence in `docs/status/next-batch.md`. |
| Competitor angle | Top pages win with AMI-specific inventory, local company trust, visible phone/address proof, broad property filters, direct-booking language, Chamber directory credibility, and larger inventory breadth. |
| Seascape gap | Seascape has the exact comparison route, but it was absent for the tracked query and carried stale March evidence plus risky subjective fee/service claims. The page also underfit the exact keyword by saying "rental companies" more often than "vacation rental companies." |
| Search fit | Rescue the existing URL. It already serves the company-comparison intent and can point guests into Seascape's direct-booking inventory while staying honest about larger AMI inventory providers. |
| Local/GBP proof | Local proof matters as trust support, but this rescue uses organic SERP evidence, official company pages, and the AMI Chamber directory. No GBP rank or map-pack claim is being made. |
| AEO/readback note | The page has direct-answer and FAQPage structure, but there is no current direct AI observation row for this query. Treat AI-answer visibility as unproven until the analytics direct observation work order is filled. |
| Recommended action | Update the source page after current-source review: retune title/meta/H1 to the exact vacation-rental-company query, change visible proof to `Reviewed June 20, 2026`, update `dateModified`, replace unsupported fee judgments with verifiable shortlist language, correct the Anna Maria Life name, add AMI Locals/Anna Maria Vacations/Chamber context, and preserve the direct-booking CTA. Then run `npm run lint:content`, `npm run build`, `npm run verify:jsonld`, `npm run verify:links`, `npm run seo:decay -- --as-of 2026-06-20`, and release verification. |

## Source And Proof Constraints

- changed public source file:
  - `src/guides/best-vacation-rental-companies-ami.html`
- external sources reviewed 2026-06-20:
  - https://www.satorealestate.com/
  - https://www.annamarialifevacationrentals.com/
  - https://annamariaislandchamber.org/directory/business-category/vacation-rentals/
  - https://www.islandreal.com/
  - https://www.vacasa.com/usa/Anna-Maria-Island/
  - https://www.amilocals.com/
  - https://www.annamaria.com/
  - https://evolve.com/owner/vacation-rental-management
- claims that are off-limits: live inventory counts unless shown on the current
  source page, exact service-fee comparisons, exact checkout totals, hidden-fee
  accusations, company quality rankings, review-score claims, and current
  ranking or revenue lift.
- Seascape-specific proof to preserve: local operator framing, direct-booking
  handoff, and honest scope around smaller focused inventory.

## Page Builder Tasks

- update metadata to better match "vacation rental companies" intent.
- replace the March 2026 methodology note with a June 20, 2026 source-review
  note.
- change the comparison table from subjective ranking/fee claims to verifiable
  shortlist criteria.
- correct the Anna Maria Life Vacation Rentals name.
- add current competitor/source context for AMI Locals, Anna Maria Vacations,
  and the Anna Maria Island Chamber directory.
- preserve existing internal links and `guide_book_direct_click` handoff.

## Voice Editor Checklist

- lead with a plain answer for guests comparing companies.
- stay neutral when naming competitors.
- avoid implying Seascape has the broadest on-island inventory.
- keep owner guidance helpful but secondary to the guest search intent.
- make the freshness note visible without explaining internal SEO process.

## Release Gate Checklist

- route to smoke test:
  - `/guides/best-vacation-rental-companies-ami/`
  - `/stays/anna-maria-island-vacation-rentals/`
  - `/stays/book-direct-anna-maria-island/`
  - `/property-management/vacation-rental-management-anna-maria-island/`
- commands to run:
  - `npm run lint:content`
  - `npm run build`
  - `npm run verify:jsonld`
  - `npm run verify:links`
  - `npm run seo:decay -- --as-of 2026-06-20`
  - `npm run git:preflight`

## Done When

- this active rescue brief exists with a filled Gate 0 block
- the source page has a bounded freshness/proof cleanup if public copy changes
- relevant commands pass or a blocker is named
- final closeout separates source execution from later GSC/GA4/AI readback

## Post-Reread Outcome

- reread window used: fill after deploy plus final GSC data window.
- crawl freshness result: fill after Search Console/analytics read.
- actual impressions, CTR, position, and downstream event counts: fill after
  readback.
- decision taken: hold, refine, expand, or kill.
- next branch slug or explicit wait state: fill after readback.

## Not In Scope

- new AMI company-comparison routes
- broad owner-management page rewrite
- review scraping
- exact fee checkout testing
- AI visibility claims before observation rows exist
