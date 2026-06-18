# Brief: Near-AMI Direct-Book CRO And Stay Template Upgrade

## Content Gate Inputs

- persona: Gulf Coast guest comparing near-island Bradenton homes against Anna Maria Island rental options before choosing a direct-book path.
- primary keyword: vacation rentals near Anna Maria Island
- secondary keywords: near Anna Maria Island rentals, Bradenton vacation rentals near AMI, direct-book Anna Maria Island area homes, Anna Maria Island pool homes
- audience pattern: high-intent guest who wants AMI beach days, more private-house space, and a clear next click into direct dates without pretending the homes are on the island.
- proof source: `docs/status/next-batch.md`, `docs/portfolio/pseo-inventory-triage.md`, `docs/portfolio/stay-money-pages.md`, `seo-findings/keywords/vacation-rentals-near-anna-maria-island.md`, `workspace/dataforseo-results-capture-sheet-first-5-calls.md`, `src/_data/seoPages.json`, `src/_data/properties-fallback.json`, and the fresh `seascape-analytics` weekly search operator report for 2026-06-08 to 2026-06-14.
- required internal links: /properties/?area=anna-maria-island, /stays/anna-maria-island-vacation-rentals/
- CTA target: keep the matching-home cards and add a measured direct-book collection path using existing `catalog_book_direct_click` and `stay_view_property_click` tracking.
- anti-claims: no on-island inventory claim, no true beachfront claim, no invented amenity or capacity claim, no direct-book savings claim beyond the approved 10-15% boundary, and no booking or revenue impact claim before the post-change GA4/GSC readback.

## Why This Batch

- what changed in the data: the fresh 2026-06-08 to 2026-06-14 joined read is clear but still below threshold; guide traffic is arriving without transferring into stay or booking actions, and stay pages are too thin to claim a winner.
- why this cluster wins now: `/stays/vacation-rentals-near-anna-maria-island/` is already a kept near-AMI commercial page and the Holmes Beach redirect target, so it can serve as the pilot for the richer `/stays/` guide template without opening new page volume.
- what should explicitly wait: Holmes Beach rebuilds, new stay variants, additional page-specific copy batches, and any claim that this change improved bookings before the next read.

## Experiment And Readback Contract

- hypothesis: clearer near-island tradeoff copy plus a measured direct-book collection CTA will move more readers from the near-AMI page into property or catalog actions.
- primary event: `stay_view_property_click`
- guardrail event: `catalog_book_direct_click`; canonical, sitemap inclusion, Article, FAQPage, ItemList, and VacationRental schema remain valid.
- entry criteria: fresh GA4/GSC read is clear but below threshold, the target page is already kept in the pSEO inventory, and current source has matching properties with tracked property-card clicks.
- readback window: first 7 complete days after deploy once BigQuery GSC and GA4 cover the full window.
- decision rule: keep if the page records at least one `stay_view_property_click` or `catalog_book_direct_click` without a truth, schema, or content-lint failure; if it stays flat after real sessions, add the page to the analytics target registry or test CTA placement higher in a separate branch.

## Gate 0: Query And SERP Competition

| Field | Answer |
| --- | --- |
| Target query family | Vacation rentals near Anna Maria Island, including near-island AMI beach-trip variants. |
| Searcher intent | Guest booking. |
| Current Seascape URL | `/stays/vacation-rentals-near-anna-maria-island/`; beachfront add-on route `/stays/anna-maria-island-beachfront-rentals/`. |
| Current proof | Saved DataForSEO finding `seo-findings/keywords/vacation-rentals-near-anna-maria-island.md` observed Seascape absent from the captured mobile SERP; the later 2026-06-08 to 2026-06-14 operator read was clear but still below threshold, with thin stay-money sessions and only one `stay_view_property_click`. |
| Top visible competitors | Anna Maria Vacations, Anna Maria Life Vacation Rentals, AMI Locals, SeaBreeze Vacation, and other AMI local inventory pages from the saved DataForSEO capture. |
| Competitor angle | On-island or AMI-local inventory, larger choice sets, local inventory filters, and beachfront/island-town positioning. |
| Seascape gap | Seascape cannot honestly claim true on-island or walk-out beachfront inventory here; the page must win only when a near-island Bradenton home, private pool space, and direct-book path are the better fit. |
| Recommendation | Improve only the source-backed near-island/direct-book answer and tracking path. For the beachfront add-on, do proof cleanup only: remove the Sarasota-side property from the AMI beach-base set, keep the not-walk-out truth clear, and add property-source distance facts. |

## Search Operator Read

- source reads used: site `docs/status/next-batch.md`, pSEO inventory, stay-money portfolio, target page source, property fallback data, and `seascape-analytics/tmp/weekly-ai-visibility-reruns/2026-06-10-to-2026-06-16/weekly-search-operator-report.md`.
- URLs inspected: `/stays/vacation-rentals-near-anna-maria-island/`, `/stays/anna-maria-island-vacation-rentals/`, `/properties/`, and `/properties/?area=anna-maria-island`.
- main evidence: the fresh report shows a clear read for 2026-06-08 to 2026-06-14, `hold-and-reread`, guide feeder failure, `/properties/` with 121 GA4 sessions and 12 catalog direct-book clicks, and thin stay-money sessions with only one `stay_view_property_click`.
- targeted baseline proof: running `./scripts/weekly-search-operator-report.sh --window-start 2026-06-08 --window-end 2026-06-14 --target-page /stays/vacation-rentals-near-anna-maria-island/` returns the page separately with 3 GSC impressions, 0 GA4 sessions, 0 `catalog_book_direct_clicks`, and 0 `stay_view_property_clicks`.
- DataForSEO check: the saved mobile SERP finding for `vacation rentals near anna maria island` shows Seascape absent from page 1 and says `/properties/` had weak fit for this query; that supports this page-angle/direct-book nudge now that the analytics gate is open.
- competitor pages inspected for demand patterns, not copied topics: prior DataForSEO competitor capture shows AMI-focused local operators and a hotels pack; this pass does not copy competitor topics and is not a fresh SERP rewrite.
- question-tool language worth preserving in customer wording: near Anna Maria Island, Bradenton homes, direct-book dates, private pool, more space, 10-15 minutes to AMI beaches.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: the default fresh report does not currently isolate this URL, so the follow-up read must include `/stays/vacation-rentals-near-anna-maria-island/` as a target page or add it to the analytics target registry. If the post-change read stays flat after real sessions, run the next DataForSEO SERP/AI/local pass before changing title, metadata, or page angle again.

## Cluster In Scope

- canonical winner URL(s): `/stays/vacation-rentals-near-anna-maria-island/`.
- feeder pages: existing guides already linking to this near-AMI page, plus the Holmes Beach redirect.
- aliases or retired URLs: `/stays/holmes-beach-vacation-rentals` and `/stays/holmes-beach-vacation-rentals/` redirect here.
- money destination: matching property cards and `/properties/?area=anna-maria-island`.
- active lane: direct-book stay intent.

## Beachfront Alternative Add-On

- scoped route: `/stays/anna-maria-island-beachfront-rentals/`.
- reason for inclusion: this is the same near-island tradeoff pattern, but the route must be stricter because the query says beachfront.
- source-backed change: keep the page explicit that these are not walk-out beachfront homes, remove Sarasota Luxe from the AMI beach-base set, and use property-source beach distance facts for Dockside Dreams, The Oasis, and River House.
- tracking contract: preserve `stay_view_property_click` on property cards and `catalog_book_direct_click` on collection CTAs.
- proof gate: content lint, build, JSON-LD/link checks, rendered desktop/mobile review, and a local event-hook read on `/stays/anna-maria-island-beachfront-rentals/`.
- post-merge truth fix: live proof showed the FAQ still said the featured homes were in Bradenton and Sarasota after the route was narrowed to Bradenton homes only; update that answer to say Bradenton.

## Source And Proof Constraints

- property truth needed: matching-home capacity, pool/spa, dock, and pricing claims must trace to `src/_data/properties-fallback.json` and generated property data.
- owner proof asset needed: none.
- claims that are off-limits: on-island homes, true beachfront spread, exact availability without Hostaway proof, broad AMI marketplace claims, and direct-book savings beyond 10-15%.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: Bradenton home space, 10-15 minute AMI access, private pools, local direct booking, and the near-island tradeoff.

## Page Builder Tasks

- source files likely to change: `src/stays/stays.njk`, `src/_data/seoPages.json`, and this brief.
- redirect or schema work: preserve the existing Holmes Beach redirects, keep stay ItemList schema valid from `matchingProperties`, and add visible-FAQ-matched FAQPage plus LodgingBusiness schema.
- internal-link or CTA work: add a richer guide-page template, a tracked direct-book collection CTA, and six related stay links on the pilot page.
- money CTA and downstream tracking event to verify: rendered page keeps `stay_view_property_click` on property cards and adds `catalog_book_direct_click` on the direct-book collection CTA.

## Voice Editor Checklist

- tone risks: over-selling Bradenton as if it is on AMI, using vague luxury language, or making the page sound like an internal test.
- generic or mechanical patterns to kill: avoid "secret", "savvy vacationers", "better value" without context, and any instruction-style copy.
- proof or specificity checks: 10-15 minute AMI access, 4-5 bedroom matching homes, private pool or spa setup, and 10-15% direct-book savings only.
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured.

## Release Gate Checklist

- routes to smoke test: `/stays/vacation-rentals-near-anna-maria-island/`, `/stays/anna-maria-island-vacation-rentals/`, and `/properties/?area=anna-maria-island`.
- commands to run: `npm run lint:content`, `npm run build`, `npm run verify:jsonld`, `npm run verify:links`, `node --test scripts/enforcement/booking-handoff.test.js scripts/enforcement/direct-booking-event-smoke.test.js`, desktop/mobile rendered checks, and a rendered route-contract check for the target URL.
- regression risks to watch: unsupported rate-savings claims, missing `stay_view_property_click`, missing `catalog_book_direct_click`, or the next analytics read omitting this URL.

## Done When

- the near-AMI page has source-backed direct-book copy, a richer reusable stay-guide template, a measured direct-book collection CTA, preserved property-card tracking, passing content/build/schema/link gates, and an explicit readback path for the next GA4/GSC run.

## Stay Page Completeness Check

- rendered stay pages checked: 60.
- pages with `intro`, `geoIntro`, `faqs`, and `matchingProperties`: 60.
- pages still missing one of those four fields: none.
- pilot page with expanded reference fields: `/stays/vacation-rentals-near-anna-maria-island/`.

## Post-Reread Outcome

- reread window used: pending after deploy.
- crawl freshness result: pending after deploy.
- actual impressions, CTR, position, and downstream event counts: pending.
- decision taken: pending.
- next branch slug or explicit wait state: hold until the first complete post-change read includes this URL.

## Not In Scope

- new stay pages.
- Holmes Beach rebuild.
- broad AMI stay rewrite.
- owner-page work.
- analytics-repo registry mutation from this site branch.
