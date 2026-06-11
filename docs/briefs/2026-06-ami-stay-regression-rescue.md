# Brief: AMI Stay Regression Rescue

## Content Gate Inputs

- persona: Gulf Coast guest searching for Anna Maria Island vacation rentals who is deciding whether a near-island direct-book home can beat an on-island rental manager or OTA result.
- primary keyword: Anna Maria Island vacation rentals
- secondary keywords: Anna Maria Island rental homes, AMI vacation rentals, vacation rentals near Anna Maria Island, Anna Maria Island pool homes, book direct Anna Maria Island rentals
- audience pattern: high-intent guest booking searcher who wants island access first, then inventory fit, pool space, beach distance, booking confidence, and a clean direct-book path.
- proof source: `docs/status/next-batch.md`, `docs/portfolio/stay-money-pages.md`, `docs/status/search-growth-map.md`, `docs/process/ranking-regression-rescue.md`, `src/_data/seoPages.json`, live Google result read for `Anna Maria Island vacation rentals` on 2026-06-11, and the analytics decision receipt at `seascape-analytics` branch `codex/weekly-ai-visibility-2026-06-11`.
- required internal links: `/guides/best-time-visit-anna-maria-island/`, `/guides/anna-maria-island-vs-siesta-key/`, `/guides/anna-maria-island-vacation-cost/`, `/stays/anna-maria-island-beachfront-rentals/`, `/stays/book-direct-anna-maria-island/`
- CTA target: keep the AMI stay page as the money destination and preserve `Check Direct Dates` links with `stay_view_property_click` tracking.
- anti-claims: no rank-recovery claim, no claim that Seascape has on-island inventory if the source page says near-island homes, no invented beachfront spread, no unsupported amenity or capacity claims, no booking or revenue lift claim before analytics readback, and no new Holmes Beach or broader stay expansion from this regression.

## Why This Batch

- what changed in the data: the 2026-06-11 joined analytics read moved `docs/status/next-batch.md` to `open next batch` and named `winner-regression-rescue` because `/stays/anna-maria-island-vacation-rentals/` fell from average position `0.5` to `16.33` in `rank_history`.
- why this page wins now: it is the mapped AMI stay-money destination, it receives feeder traffic from the AMI guide cluster, and the current regression is on an existing money page rather than a reason to create new stay volume.
- what should explicitly wait: Holmes Beach expansion, new AMI variants, broad stay-page rewrites, booking-impact claims, and any claim that the rescue worked before the first complete post-change GSC/GA4 readback.

## Experiment And Readback Contract

- hypothesis: a bounded rescue that tightens the page's answer for high-intent AMI rental searchers, makes the near-island tradeoff unmistakable, and routes direct-date clicks earlier should improve fit for the query without pretending Seascape is an on-island inventory marketplace.
- primary event: `stay_view_property_click`
- guardrail event: canonical, sitemap inclusion, FAQPage, Article, ItemList, and VacationRental schema remain valid; the page keeps the near-island truth boundary.
- entry criteria: analytics receipt says `open next batch`; `docs/status/next-batch.md` names `winner-regression-rescue`; target page is a sitemap-owned stay-money page; current page already has `Check Direct Dates` links tracked as `stay_view_property_click`.
- readback window: first 7 complete days after deploy once BigQuery GSC and GA4 cover the full window.
- decision rule: keep if position, CTR, clicks, or `stay_view_property_click` improves without a truth or schema failure; if flat, run a second competitor-depth pass; if worse, retune the title/meta or revert the specific weak change.

## Gate 0 Rescue Block

| Field | Answer |
| --- | --- |
| Target query family | Anna Maria Island vacation rentals |
| Searcher intent | Guest booking |
| Current Seascape URL | `/stays/anna-maria-island-vacation-rentals/` |
| Current proof | `docs/status/next-batch.md` run date 2026-06-11 says `open next batch`; `rank_history` shows the URL fell from position `0.5` to `16.33`; stay_money has `3` impressions, `0` clicks, average position `16.33`, and `1` GA4 session in the joined read. |
| Top visible competitors | Anna Maria Life Vacation Rentals, AMI Locals, SeaBreeze Vacation, Anna Maria Island Chamber directory, Island Real Estate, Owner Direct, Anna Maria Vacations, Island Vacation Properties. |
| Competitor angle | On-island inventory, larger choice set, filters by property type and neighborhood, reviews, book-direct savings, local office/trust, and explicit beachfront or island-town positioning. |
| Seascape gap | Seascape's page is honest about near-island value, but the SERP is dominated by pages that look more like direct AMI inventory marketplaces. The rescue needs to answer "near AMI vs on AMI" faster, show why the direct-book home path can still win, and make the next direct-date click obvious without overclaiming island inventory. |
| Recommended action | Brief first, then a bounded title/meta and opening-answer pass if the source review confirms the page can compete without violating the near-island truth boundary. Also inspect internal links from AMI comparison, seasonal, and cost guides into this money page. |

## Search Operator Read

- source reads used:
  - `docs/status/next-batch.md`: current reread status is `open next batch`.
  - `docs/portfolio/stay-money-pages.md`: AMI stay page is the money destination; success event is `stay_view_property_click`.
  - `docs/status/search-growth-map.md`: AMI stay family is guest booking intent and should not spill into Holmes Beach or broader stay expansion until the AMI winners prove handoff.
  - `src/_data/seoPages.json`: current page title is `Near Anna Maria Island Vacation Rentals - Direct-Book Pool Homes`; H1 is `Vacation Rentals Near Anna Maria Island`; intro says the homes sit 5-15 minutes from the beaches.
  - live Google result read on 2026-06-11 for `Anna Maria Island vacation rentals`.
- URLs inspected:
  - `https://seascape-vacations.com/stays/anna-maria-island-vacation-rentals/`
  - `/stays/anna-maria-island-vacation-rentals/`
  - `/stays/anna-maria-island-beachfront-rentals/`
  - `/guides/anna-maria-island-vs-siesta-key/`
  - `/guides/best-time-visit-anna-maria-island/`
- main evidence: analytics named a rank-history regression on this exact stay-money page, while the site portfolio says this page is the AMI money destination and should be improved only through the measured gate.
- competitor pages inspected for demand patterns, not copied structure:
  - `https://www.annamarialifevacationrentals.com/`
  - `https://www.amilocals.com/`
  - `https://www.seabreezevacation.com/`
  - `https://annamariaislandchamber.org/directory/business-category/vacation-rentals/`
  - `https://www.islandreal.com/`
  - `https://ownerdirect.com/all/usa/florida/anna-maria-island`
  - `https://www.annamaria.com/`
  - `https://www.islandvacationproperties.com/`
- customer language worth preserving: `near Anna Maria Island`, `direct-book homes`, `5-15 minutes from the beaches`, `private pool`, `more space`, `beach access`, `book direct`, and `check direct dates`.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: the latest read is fresh enough to open rescue, but the page has thin current-week search volume, so the branch may ship a bounded source improvement but cannot claim performance impact until the post-change readback.

## Cluster In Scope

- canonical winner URL: `/stays/anna-maria-island-vacation-rentals/`
- aliases or retired routes:
  `/stays/holiday-vacation-rentals-anna-maria-island/`,
  `/stays/christmas-vacation-rentals-florida-gulf-coast/`,
  `/stays/thanksgiving-vacation-rentals-florida/`
- feeder pages:
  `/guides/best-time-visit-anna-maria-island/`,
  `/guides/anna-maria-island-vs-siesta-key/`,
  `/guides/anna-maria-island-vacation-cost/`
- adjacent page to keep honest:
  `/stays/anna-maria-island-beachfront-rentals/`
- active lane: stay-money regression rescue for direct-book guest demand.

## Source And Proof Constraints

- property truth needed: any property count, bedroom, bathroom, pool, dock, pet, waterfront, or capacity claim must trace to `src/_data/properties-fallback.json` and the generated property surfaces.
- owner proof asset needed: none; this is a guest stay-money page.
- claims that are off-limits: true beachfront inventory claims on the near-island page, broad AMI marketplace claims, exact availability without Hostaway/live booking proof, "best" claims without source support, and direct-book savings claims beyond the approved 10-15% boundary already used in source.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: near-island value tradeoff, direct-book fee savings, private-pool space, 5-15 minute beach access, and clearer routing into direct dates.

## Page Builder Tasks

- source files likely to change:
  - `src/_data/seoPages.json`
  - `src/stays/stays.njk`
  - `docs/status/search-growth-map.md`
  - `docs/status/next-batch.md`
- redirect or schema work: preserve canonical, sitemap inclusion, Article, FAQPage, ItemList, VacationRental, and BreadcrumbList output; do not revive retired holiday routes.
- internal-link or CTA work: verify the three AMI feeder guides still link into this money page naturally and that the first direct-date path is visible before the reader has to browse unrelated collections.
- money CTA and downstream tracking event to verify: `stay_view_property_click` still appears on `Check Direct Dates` links and routes to Hostaway booking URLs.

## Voice Editor Checklist

- tone risks: over-apologizing for near-island positioning, pretending Seascape is an on-island inventory marketplace, sounding like a generic rental directory, or narrating SEO logic to the guest.
- generic or mechanical patterns to kill: any copy that says `use this page when`, `source-bounded`, `proof boundary`, `ranking rescue`, or other internal workflow language.
- proof or specificity checks: keep the 5-15 minute beach-access line only if source truth still supports it; keep direct-book savings within the approved 10-15% language; avoid invented inventory breadth.
- customer wording should lead with the trip choice: island access, space, pool time, booking-fee math, and whether the group needs the Gulf outside the window.

## Release Gate Checklist

- routes to smoke test:
  - `/stays/anna-maria-island-vacation-rentals/`
  - `/stays/anna-maria-island-beachfront-rentals/`
  - `/guides/anna-maria-island-vs-siesta-key/`
  - `/guides/best-time-visit-anna-maria-island/`
- commands to run:
  - `npm run lint:content`
  - `npm run build`
  - `npm run verify:jsonld`
  - `npm run verify:links`
  - `npm run git:preflight`
- regression risks to watch: visible copy implies on-island inventory, schema loses VacationRental items, retired holiday routes re-enter sitemap, `stay_view_property_click` disappears, or the page becomes a broad AMI tourism guide instead of a direct-book stay destination.

## Done When

- `docs/status/next-batch.md` is synced from the fresh analytics receipt
- this active rescue brief exists with Gate 0 filled
- any source edit stays inside the near-island truth boundary
- relevant commands pass or blockers are named
- final status says impact is still pending the post-change GSC/GA4 readback

## Ship Checkpoint

- 2026-06-11 checkpoint: the rescue stayed bounded to the AMI stay page and feeder links, preserved the near-island truth boundary, and still waits for the first full 7-day post-deploy GSC/GA4 readback before any performance claim.

## Post-Reread Outcome

- reread window used: fill after deploy plus final GSC data window.
- crawl freshness result: fill after Search Console/analytics read.
- actual impressions, CTR, position, and downstream event counts: fill after readback.
- decision taken: hold, rewrite, expand, or kill.
- next branch slug or explicit wait state: fill after readback.

## Not In Scope

- Holmes Beach expansion
- new AMI stay variants
- broad stay page volume
- owner-page work
- unsupported beachfront claims
- booking or revenue impact claims
