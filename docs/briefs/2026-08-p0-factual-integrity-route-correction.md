# P0 factual-integrity and route correction

- lifecycle: active — October 5, 2026 focused savings, cost and booking-evidence correction
- approval: Sawyer requested one focused correction on October 5, 2026; no new pages or pricing offers.
- mutation owner: Codex in `codex/p0-evidence-correction`, based on current main `01f9959ad26442db150b7add460a643a0153bd24`.

- persona: Gulf Coast vacation guest or prospective property-management owner seeking accurate booking and tax information
- primary keyword: Bradenton vs Sarasota vacation rentals
- secondary keywords: Sarasota vacation rental, Bradenton vacation rental, Florida vacation rental taxes
- audience pattern: needs a practical comparison or direct booking path and should not be asked to rely on unsupported savings, location, portfolio, or tax claims
- proof source: canonical property fallback data; current route inventory; professional tax review is not yet available
- required internal links: /properties/, /guides/
- CTA target: `/properties/` or `/#contact`
- anti-claims: no tax advice; no fixed savings, portfolio, guest-count, return, or experience claims without an approved source; no statement that Sarasota Luxe or the Sarasota home is walkable, within walking distance, or steps from downtown, St. Armands Circle, restaurants, galleries, shops, beaches, or other attractions; no leaked internal or process-facing reader copy such as `dead prefix`, raw `/stays/<slug>/` template syntax, `catchment`, `fastest routes`, or `When to leave the hub`; no `managing hundreds of properties` or other unsupported portfolio-scale experience claims; no exact portfolio count in evergreen owner copy; no implication that Seascape manages properties on Anna Maria Island or Siesta Key; no invented screening protocols, ROI projections, premium-rate ranges, investor outcomes, or first-hand market coverage Seascape does not have; stay leaf pages must not present total portfolio count as `Direct-book homes` when the page lists a matched subset; no on-island, beachfront, Gulf-front, walk-to-beach, or no-car-needed promises in copy that refers readers to the near-island destinations `/stays/anna-maria-island-vacation-rentals/` or `/stays/anna-maria-island-beachfront-rentals/`
- hypothesis: removing unsupported claims preserves booking trust without adding new search surfaces
- primary event: `guide_book_direct_click`
- guardrail event: `guest_capture_form_submit`
- entry criteria: P0 source-truth conflict identified in existing canonical pages and routes
- readback window: 48 hours after production deployment
- decision rule: keep the corrected canonical routes if direct-book and contact behavior remain intact; only reconsider claims when approved proof exists
- corrective pass: on 2026-09-07, remove the remaining Sarasota-home walkability language and fixed 10-15% / 30-40% public savings claims from existing canonical surfaces; do not add a new page
- source files likely to change:
  - `src/_redirects`
  - `src/_data/properties-fallback.json`
  - `src/_data/seoPages.json`
  - `src/stays/index.njk`
  - `src/stays/stays.njk`
  - `src/guides/bradenton-vs-sarasota.html`
  - `src/guides/bradenton-vs-sarasota-beaches/index.html`
  - `src/guides/bradenton-vs-sarasota-retirement/index.html`
  - `src/guides/bradenton-vs-sarasota-restaurants/index.html`
  - `src/guides/anna-maria-island-vs-longboat-key.html`
  - `src/guides/anna-maria-island-vs-siesta-key.html`
  - `src/index.njk`
  - `src/about-us/index.njk`
  - `src/llms.txt`
  - `src/ai/faq.json.njk`
  - `src/ai/summary.json.njk`
  - `src/ai-discovery.json.njk`
  - `src/research/owner-fee-revenue-leak-benchmark-2026.njk`
  - `src/property-management/index.njk`
  - `src/property-management/property-management.njk`

## Required Internal Link Map

- src/guides/anna-maria-island-vs-longboat-key.html: /properties/sarasota-luxe/, /stays/bradenton-waterfront-vacation-rentals/
- src/guides/anna-maria-island-vs-siesta-key.html: /stays/anna-maria-island-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/
- src/guides/bradenton-vs-sarasota.html: /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/
- src/guides/bradenton-vs-sarasota-beaches/index.html: /guides/bradenton-vs-sarasota/, /property-management/
- src/guides/bradenton-vs-sarasota-restaurants/index.html: /guides/bradenton-vs-sarasota/, /property-management/
- src/guides/bradenton-vs-sarasota-retirement/index.html: /guides/bradenton-vs-sarasota/, /property-management/
- src/index.njk: /properties/, /property-management/
- src/stays/index.njk: /css/guest.css?v=waterline-v3, /stays/{{ page.slug }}/
- src/stays/stays.njk: /guides/anna-maria-island-area-guide/, /property-management/
- src/research/owner-fee-revenue-leak-benchmark-2026.njk: /property-management/, /property-management/vacation-rental-management-fees-florida/
- src/property-management/index.njk: /property-management/vacation-rental-management-fees-florida/, /property-management/buy-vacation-rental-property-florida/
- src/property-management/property-management.njk: /property-management/vacation-rental-management-fees-florida/, /property-management/vacation-rental-licensing-florida/

## Gate 0 Search Block — factual-integrity route correction

| Field | Answer |
| --- | --- |
| Target query family | Existing Bradenton/Sarasota vacation comparison and Seascape contact/tax-guide navigational queries |
| Searcher intent | comparison, support, or owner-management information; do not ask visitors to rely on unsupported tax or savings claims |
| Current Seascape URL | `/guides/bradenton-vs-sarasota/`, `/property-management/vacation-rental-taxes-florida/`, `/contact` |
| SERP observed date | 2026-10-05 |
| SERP stale after | 2026-11-04 |
| Current proof | Current source at 01f9959 reviewed 2026-10-05; no retained archived 545-booking export or calculation receipt located in site, analytics or hub. No current paired lodging quotes substantiate fixed savings or area totals. This is a factual correction, not a SERP-led expansion |
| Top visible competitors | None recorded; this is a source-truth correction, not competitor-led expansion |
| Competitor angle | Not used; no competitor claim or comparison is being published |
| Visual/format gap | Not applicable; preserve existing canonical layouts and routing |
| Seascape gap | Unsupported or contradictory public claims and a missing canonical contact route |
| Search fit | Preserve the existing canonical comparison and contact destination while removing unsupported assertions |
| Local/GBP proof | N/A because this change does not alter local-profile or map-pack content; it preserves existing routes |
| AEO/readback note | Verify canonical routing and public wording after deployment; defer any IMG Academy page until Search Console query-to-page evidence exists |
| Recommendation | consolidate: quarantine the tax guide, remove unsupported numbers, correct location wording, and repair the contact route |
| Attack status | none found after named checks |
| Query variants inspected | Bradenton vs Sarasota vacation rentals; Sarasota vacation rental taxes; Seascape contact |
| SERP source | No live competitor SERP receipt was used; source: repository inventory and official-source review |
| Competitor URLs inspected | source: repository source inventory; SERP: no competitor SERP evidence; competitor-page: not applicable because no competitor claim is used |
| Content gap and Seascape answer | Remove unsupported claims and point visitors to live listings, final checkout totals, the contact section, or a qualified tax professional |
| Design/format strategy | Keep the existing comparison and owner hub; remove the retired duplicate route and tax-guide link rather than add pages |
| Seascape proof available | Canonical property fallback data, route inventory, and build/test receipts dated 2026-08-31; no tax advice proof |
| Tools/plugins used | Repository tests, content lint, release and redirect validators; official-source review |
| Decision and reason | Ship the narrow correction after release gates pass; no new page is justified without Search Console query-to-page evidence |

September 9 scope handoff: the existing stay collection shell in `src/stays/stays.njk` is now covered by the approved Waterline brief (`2026-09-04-guest-decision-journey.md`). The factual area and property corrections in this brief remain required.

September 13 corrective pass: replace leaked agent/dev notes on `/stays/` with guest-facing collection copy; remove `managing hundreds of properties` and surrounding unsupported owner paragraphs from `src/_data/seoPages.json`; make stay leaf `Direct-book homes` count matched homes listed on the page, not the full portfolio. Changed public sources in this pass: `src/stays/index.njk`, `src/stays/stays.njk`, `src/_data/seoPages.json`.

September 13 scope: correct AMI vs Siesta guide referrals to `/stays/anna-maria-island-vacation-rentals/` and `/stays/anna-maria-island-beachfront-rentals/` so they adopt those destinations' own honest framing (mainland homes, 5-15 / 12-25 minute drives, beachfront *alternative*) instead of promising on-island, Gulf-front, walk-to-beach, or no-car stays. Keep existing routes, hrefs, tracking attributes, and table structure. Also rewrite the AMI beaches supervision sentence so gradual shallows stay factual without implying reduced watch of small children.

September 21 consolidated P0 pass: remove the final Sarasota-home walking reference; quarantine the insurance page for professional review; remove unsupported interior-design performance, return, revenue, rating, and on-island experience claims; remove promotional links to quarantined tax and insurance guidance; replace the unsupported owner-page aggregate rating with the retained 48-hour one-page review; and extend live smoke coverage to `/contact`, the retired cost route, Sarasota copy, and both quarantined pages. No new page is authorized.

- offer claim: `seascape-hub/context/owner-offer.md` 48-hour one-page revenue review offer, landed on the existing property-management hub and shared owner-page template.

## October 5 focused correction

Retire numeric booking findings until an archived export, inclusion rules, defined
revenue/rate calculations and a privacy-safe approved receipt are available.
Earlier report text and other pages repeating it are not independent proof.
Keep the existing booking-report URL and narrow its copy to current verified
Seascape location/listing information and explicit evidence limits. Remove the
market-dominance, market-cycle, seasonal savings, waterfront premium, revenue
forecast and booking-window assertions from visible copy, metadata and schema.

Remove fixed direct-booking savings and unsupported accommodation-cost examples
from the existing booking/cost/comparison guides and generated stay data. Keep
verified property charges and the established SAVE50 offer intact. Compare the
same home, dates and guests with the complete checkout total and terms.

Withdraw the calculator estimates and chart figures at their existing URLs,
noindex both pending evidence review, and remove promotional links from the
research index. No replacement tool or page, new SEO route, or redesigned visual
pattern is authorized. Preserve existing CSS and conversion destinations.

- source files likely to change:
  - `src/_data/seoPages.json`
  - `src/guides/anna-maria-island-area-guide/index.html`
  - `src/guides/anna-maria-island-vacation-cost.html`
  - `src/guides/anna-maria-island-vs-clearwater-beach.html`
  - `src/guides/anna-maria-island-vs-longboat-key.html`
  - `src/guides/booking-direct-vacation-rentals.html`
  - `src/guides/bradenton-area-guide/index.html`
  - `src/guides/bradenton-insider-guide.html`
  - `src/guides/bradenton-vs-sarasota-retirement/index.html`
  - `src/guides/bradenton-vs-tampa-vacation-rentals.html`
  - `src/guides/flights-to-anna-maria-island/index.html`
  - `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html`
  - `src/guides/holmes-beach-vs-bradenton-beach.html`
  - `src/guides/holmes-beach.html`
  - `src/guides/is-anna-maria-island-worth-visiting.html`
  - `src/guides/sarasota-area-guide/index.html`
  - `src/guides/siesta-key-vs-anna-maria-island-families.html`
  - `src/guides/things-to-do-bradenton-fl.html`
  - `src/guides/where-to-stay-near-anna-maria-island/index.html`
  - `src/research/florida-gulf-coast-vacation-cost-calculator-2026.njk`
  - `src/research/gulf-coast-vacation-booking-trends-2026.njk`
  - `src/research/gulf-coast-vacation-rental-chart-pack-2026.njk`
  - `src/research/index.njk`
  - `src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk`

## Required Internal Link Map — October 5 correction

- src/guides/anna-maria-island-area-guide/index.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/anna-maria-island-vacation-cost.html: /stays/affordable-vacation-rentals-florida-gulf-coast/, /stays/extended-stay-vacation-rentals-florida/
- src/guides/anna-maria-island-vs-clearwater-beach.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/anna-maria-island-vs-longboat-key.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/booking-direct-vacation-rentals.html: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/
- src/guides/bradenton-area-guide/index.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/bradenton-insider-guide.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/bradenton-vs-sarasota-retirement/index.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/bradenton-vs-tampa-vacation-rentals.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/flights-to-anna-maria-island/index.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/holmes-beach-vs-bradenton-beach.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/holmes-beach.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/is-anna-maria-island-worth-visiting.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/sarasota-area-guide/index.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/siesta-key-vs-anna-maria-island-families.html: /css/guest.css?v=waterline-v3, /stays/anna-maria-island-vacation-rentals/
- src/guides/things-to-do-bradenton-fl.html: /css/guest.css?v=waterline-v3, /guides/
- src/guides/where-to-stay-near-anna-maria-island/index.html: /css/guest.css?v=waterline-v3, /guides/
- src/research/florida-gulf-coast-vacation-cost-calculator-2026.njk: /css/guest.css?v=waterline-v3, /research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026/
- src/research/gulf-coast-vacation-booking-trends-2026.njk: /css/guest.css?v=waterline-v3, /properties/
- src/research/gulf-coast-vacation-rental-chart-pack-2026.njk: /css/guest.css?v=waterline-v3, /research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026/
- src/research/index.njk: /css/guest.css?v=waterline-v3, /research/gulf-coast-vacation-booking-trends-2026/
- src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk: /css/guest.css?v=waterline-v3, /guides/bradenton-vs-sarasota/

## Verification receipt

Content editorial chain: draft around comparing complete trip totals; remove
internal wording; check voice and specificity. Numeric claims stay withheld,
including schema and charts, until underlying evidence can be independently
checked. Site gates and representative rendered route checks are required.
Machine-local `/Users/sawbeck/bin/guardrail-*` wrappers are absent in this Linux
workspace; the guarded worktree and repository release checks remain intact.
Do not report those wrappers as passed or claim production deployment from a
source-only result.

- source files likely to change: `images/research/airbnb-channel-dependence-2026.svg`

- source files likely to change: `images/research/booking-window-74-days-2026.svg`

- source files likely to change: `images/research/bradenton-sarasota-ami-trip-cost-2026.svg`

- source files likely to change: `images/research/seasonal-adr-spread-2026.svg`

- source files likely to change: `src/guides/best-time-visit-anna-maria-island.html`

- editorial verdict: Approved after the three-step voice pass; retirement, airfare and destination answers retain their actual question context.
- regression check: `scripts/enforcement/p0-booking-evidence.test.js` covers visible/schema claims, generated stay data, dependent tool noindex, and old embedded SVG URLs.

### October 5 verification closeout

- Correction covers existing routes and their repeated FAQ, list, table and
  metadata claims. No page or pricing offer is added.
- Booking statistics are withheld until the archived export, inclusion rules
  and reviewed calculations can be checked. Current location/listing facts
  point to the canonical catalog. The retired numeric calculator and chart
  pack are noindexed and excluded from the sitemap and research hub.
- Regression checks cover alternate markup and prevent the deployed smoke
  from treating the phone number as a reservation count.
- Rendered proof: `docs/receipts/2026-10-05-p0-evidence/README.md` and its
  desktop/mobile booking-report screenshots and route check receipt.
- Targeted Playwright design floors and accessibility: 19 passed, three
  desktop-only tap-target checks skipped by design. Browser download failed;
  a separately installed Chromium 153 was used without changing dependencies.
- Publication remains subject to review. No production SHA, deployment or live
  smoke success is claimed here.

- Final site gates: content lint 28/28; npm test 1,089/1,089; full release gate passed. Receipt: `docs/receipts/2026-10-05-p0-evidence/release-gate.json`.
- source files likely to change: `src/guides/anna-maria-island-area-guide/index.html`
- source files likely to change: `src/guides/siesta-key-area-guide/index.html`
- source files likely to change: `src/guides/longboat-key-area-guide/index.html`
- source files likely to change: `src/guides/bradenton-area-guide/index.html`
- source files likely to change: `src/guides/snowbirds-guide-extended-stays-florida.html`
- Final table sweep also removes unsupported area-average nightly rates and
  the fabricated monthly snowbird comparison. The existing snowbird table
  becomes an actionable quote checklist. A regression check covers these
  nested area-guide tables and the hotel-rate comparison.
- Draft PR #681 has a passing eight-path Netlify preview smoke plus release,
  performance and preview CI checks. Initial full visual CI passed 391 tests,
  skipped 27 by design and failed only two stale family-comparison snapshots.
  Reviewed actual/expected/diff images and fresh local desktop/mobile rendering
  show the intended cost-copy changes. Only those two references are refreshed
  from exact macOS CI captures; full visual CI must pass before integration.


### October 5 authorized follow-up to merged #681

Sawyer's 19:24 UTC “Make them” instruction authorizes only the independent
review's two remaining findings and matching schema. Coordinator is sole source
writer on `codex/681-claims-followup`, starting from main
`239b52c1cc8a758f0d85819f1cf41c111888f3f5`. The completed #681 branch is preserved.

- Remove categorical no-rip-current, safer-water and reduced-supervision
  claims from the families guide's summary, comparison, answers and schema.
  National Weather Service guidance checked October 5 says rip currents can
  occur at any beach with breaking waves, including the Gulf:
  https://www.weather.gov/safety/ripcurrent-faqs . Use current conditions, flags,
  lifeguard instructions and close child supervision instead.
- Replace the near-island guide's retained lower-price promises in body and
  FAQ schema with complete quotes for the same dates and guest count.
- Preserve routes, layout, CSS, property charges, offers, links and tracking.
  Capture both routes at desktop/mobile; inspect intended screenshot changes
  before refreshing only affected references. Full checks and independent
  exact-head review precede any merge decision. Merge/production remains held.
- Editorial chain: drafted around the family's beach and accommodation
  decisions; removed internal wording; checked voice and specificity.
- editorial verdict: Approved for the bounded safety and accommodation-quote
  corrections after the three-step voice pass; independent review remains required.
- source files likely to change: `src/guides/siesta-key-vs-anna-maria-island-families.html`
- source files likely to change: `src/guides/where-to-stay-near-anna-maria-island/index.html`
