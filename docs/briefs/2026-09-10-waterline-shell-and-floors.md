# Brief: One shell on every page and the Waterline design floors

- persona: A guest moving between guides, stay pages, the owner page, legal pages and the five homes, and an owner arriving from the guest site
- primary keyword: Seascape Vacations
- secondary keywords: Bradenton vacation rentals, Sarasota vacation rentals
- audience pattern: Existing guest and owner traffic crossing between the Waterline guest routes and every other route on the site
- proof source: 2026-09-10 design review of PR #559 head fe86f766 plus the design-floors checker run on that head (313 font-size, 64 tap-target, 8 hero-contrast and 1 shell violation on four routes; 91 of 162 built pages without the shared header and footer)
- required internal links: /properties/, /guides/
- CTA target: existing catalog, property, owner revenue-review and direct booking links; no new CTA
- anti-claims: The shell and floors do not prove availability, price, a reservation, or increased conversion. The homepage reviews are individual reviewed guest reviews from canonical data, not an aggregate rating or a review count.

## Scope and proof

This is the fix release for the Waterline guest design (PR #559). It applies the
fix-before-merge list from the 2026-09-10 design review and turns the design
floors into permanent gates. It changes no property facts, prices, routes or
search intent. Public pages change only in their shared chrome: every built
page now renders the Waterline header and footer instead of the legacy header,
a hand-rolled nav bar, a "back to Seascape" bar, or no navigation at all. The
legacy chrome text those pages lose ("Back to Seascape", "SEASCAPE Vacations",
"© 2026 Seascape Vacations" footers) is replaced by the shared footer's
equivalent links and copyright. Page bodies keep their existing copy.

Guest-surface fixes on the home, catalog and property routes: 12px minimum
text, 44px mobile hit boxes, a stronger homepage scene scrim, the missing
catalog compare icon, the overflowing photo number badge, the mobile comparison
row label, the SAVE50 banner restyled to Waterline, WOFF2 fonts, a phone number
in the desktop header, a Guest support footer link, and a homepage reviews
band that reuses the reviewed per-home reviews already in canonical data.

- source files likely to change:
  - `src/guides/2026-bradenton-vacation-rental-market-analysis.html`
  - `src/guides/anna-maria-city.html`
  - `src/guides/anna-maria-island-area-guide/index.html`
  - `src/guides/anna-maria-island-beaches.html`
  - `src/guides/anna-maria-island-noise-ordinance-guide.html`
  - `src/guides/anna-maria-island-vacation-cost-guide-2026/index.html`
  - `src/guides/anna-maria-island-vacation-cost.html`
  - `src/guides/anna-maria-island-vs-clearwater-beach.html`
  - `src/guides/anna-maria-island-vs-longboat-key.html`
  - `src/guides/anna-maria-island-vs-siesta-key.html`
  - `src/guides/anna-maria-island-weather.html`
  - `src/guides/best-restaurants-anna-maria-island.html`
  - `src/guides/best-time-to-visit-anna-maria-island/index.html`
  - `src/guides/best-time-visit-anna-maria-island.html`
  - `src/guides/best-vacation-rental-companies-ami.html`
  - `src/guides/best-waterfront-restaurants-with-boat-dock.html`
  - `src/guides/booking-direct-vacation-rentals.html`
  - `src/guides/bradenton-area-guide/index.html`
  - `src/guides/bradenton-beach-area-guide/index.html`
  - `src/guides/bradenton-beach.html`
  - `src/guides/bradenton-insider-guide.html`
  - `src/guides/bradenton-vs-sarasota-beaches/index.html`
  - `src/guides/bradenton-vs-sarasota-for-families/index.html`
  - `src/guides/bradenton-vs-sarasota-restaurants/index.html`
  - `src/guides/bradenton-vs-sarasota-retirement/index.html`
  - `src/guides/bradenton-vs-tampa-vacation-rentals.html`
  - `src/guides/do-you-need-a-car-anna-maria-island.html`
  - `src/guides/dolphins-manatees-bradenton.html`
  - `src/guides/family-vacation-anna-maria-island.html`
  - `src/guides/fishing-guide-anna-maria-sarasota.html`
  - `src/guides/flights-to-anna-maria-island/index.html`
  - `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html`
  - `src/guides/holmes-beach-area-guide/index.html`
  - `src/guides/holmes-beach-vs-bradenton-beach.html`
  - `src/guides/holmes-beach.html`
  - `src/guides/how-to-get-to-anna-maria-island.html`
  - `src/guides/hurricane-preparedness-florida-vacation.html`
  - `src/guides/index.njk`
  - `src/guides/is-anna-maria-island-worth-visiting.html`
  - `src/guides/longboat-key-area-guide/index.html`
  - `src/guides/pet-friendly-anna-maria-island.html`
  - `src/guides/rainy-day-activities-bradenton-sarasota.html`
  - `src/guides/sarasota-area-guide/index.html`
  - `src/guides/siesta-key-area-guide/index.html`
  - `src/guides/siesta-key-beach-guide.html`
  - `src/guides/siesta-key-vs-anna-maria-island-families.html`
  - `src/guides/snowbirds-guide-extended-stays-florida.html`
  - `src/guides/spring-break-activities-bradenton-anna-maria-island/index.html`
  - `src/guides/srq-airport-to-anna-maria-island.html`
  - `src/guides/things-to-do-bradenton-fl.html`
  - `src/guides/vacation-rental-income-anna-maria.html`
  - `src/guides/where-to-stay-near-anna-maria-island/index.html`
  - `src/index.njk`
  - `src/property-management/index.njk`
  - `src/property-management/property-management.njk`
  - `src/research/florida-gulf-coast-vacation-cost-calculator-2026.njk`
  - `src/research/gulf-coast-vacation-booking-trends-2026.njk`
  - `src/research/gulf-coast-vacation-rental-chart-pack-2026.njk`
  - `src/research/how-seascape-protects-owner-net-2026.njk`
  - `src/research/index.njk`
  - `src/research/owner-fee-revenue-leak-benchmark-2026.njk`
  - `src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk`
  - `src/stays/index.njk`
  - `src/_includes/layouts/base.njk`
  - `src/_includes/layouts/guest.njk`
  - `src/_includes/layouts/property.njk`
  - `src/_includes/layouts/guide-field-journal.njk`
  - `src/_includes/partials/guest-header.njk`
  - `src/_includes/partials/guest-footer.njk`
  - `src/_includes/partials/save50-offer.njk`
  - `src/_includes/partials/ui-icon.njk`
  - `src/properties/index.njk`
  - `src/services/concierge-services/index.njk`
  - `src/css/guest.css`
  - `src/css/arrival.css`
  - `src/css/catalog.css`
  - `src/assets/fonts/guest/instrument-serif.woff2`
  - `src/assets/fonts/guest/instrument-serif-italic.woff2`
  - `eleventy.config.js`
  - `scripts/design/apply-guest-shell.js`
  - `tests/visual/design-floors.spec.js`
  - `scripts/enforcement/shared-shell.test.js`
  - `scripts/enforcement/ui-icon-names.test.js`
  - `scripts/enforcement/ui-runtime.test.js`
  - `DESIGN.md`
  - `docs/process/design-review-workflow.md`
- revenue lever: remove the two-brand break in the guest and owner paths and the readability defects before the design launches; no booking-lift claim
- proof surface: `tests/visual/design-floors.spec.js`, `scripts/enforcement/shared-shell.test.js`, `scripts/enforcement/ui-icon-names.test.js`, `npm run test:visual`, release checks, desktop and mobile captures of 18 routes
- owning repo: `seascape-vacations-site`
- what stops: no copy rewrite of legacy guide bodies, no host photo or About rewrite, no map, no price anchors, no tokens or component consolidation; those remain follow-ups from the review
- CTA target: existing catalog, property, owner revenue-review and direct booking links; no new CTA

The required internal links above are satisfied on every changed page by the
shared header (Our homes, Explore the coast) in the rendered output. The map
below records, per source file, two internal links that the page body already
carries and must keep, so the source-level gate checks something real.

## Required Internal Link Map
- src/guides/anna-maria-island-vacation-cost.html: /guides/, /stays/anna-maria-island-vacation-rentals/
- src/guides/anna-maria-island-vs-siesta-key.html: /guides/, /stays/anna-maria-island-vacation-rentals/
- src/guides/anna-maria-island-weather.html: /guides/, /guides/best-time-visit-anna-maria-island/
- src/guides/best-time-visit-anna-maria-island.html: /guides/, /stays/anna-maria-island-vacation-rentals/
- src/guides/best-vacation-rental-companies-ami.html: /guides/, /stays/anna-maria-island-vacation-rentals/
- src/guides/booking-direct-vacation-rentals.html: /guides/, /guides/hurricane-preparedness-florida-vacation/
- src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html: /guides/, /research/gulf-coast-vacation-booking-trends-2026/
- src/guides/index.njk: /properties/, /research/owner-fee-revenue-leak-benchmark-2026/
- src/guides/rainy-day-activities-bradenton-sarasota.html: /guides/, /stays/bradenton-vacation-rentals-near-beaches/
- src/guides/siesta-key-vs-anna-maria-island-families.html: /stays/anna-maria-island-vacation-rentals/, /stays/siesta-key-area-vacation-rentals/
- src/guides/srq-airport-to-anna-maria-island.html: /guides/, /stays/anna-maria-island-vacation-rentals/
- src/guides/vacation-rental-income-anna-maria.html: /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/vacation-rental-management-fees-florida/
- src/property-management/index.njk: /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/vacation-rental-management-anna-maria-island/
- src/property-management/property-management.njk: /property-management/, /research/owner-fee-revenue-leak-benchmark-2026/
- src/research/florida-gulf-coast-vacation-cost-calculator-2026.njk: /research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026/, /research/gulf-coast-vacation-rental-chart-pack-2026/
- src/research/gulf-coast-vacation-booking-trends-2026.njk: /property-management/, /research/
- src/research/gulf-coast-vacation-rental-chart-pack-2026.njk: /research/gulf-coast-vacation-booking-trends-2026/, /research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026/
- src/research/how-seascape-protects-owner-net-2026.njk: /property-management/, /research/owner-fee-revenue-leak-benchmark-2026/
- src/research/index.njk: /research/gulf-coast-vacation-booking-trends-2026/, /research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026/
- src/research/owner-fee-revenue-leak-benchmark-2026.njk: /property-management/, /property-management/maximize-vacation-rental-income-florida/
- src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk: /research/, /research/gulf-coast-vacation-booking-trends-2026/
- src/stays/index.njk: /properties/, /guides/where-to-stay-near-anna-maria-island/

## Gate 0 Search And Attack Receipt

This block satisfies the existing search-decision brief gate. The release is a
design and chrome repair, not a search expansion or a competitive positioning
change. The public checks below are context only; the rendered gates and
captures are the acceptance proof.

| Field | Required answer |
| --- | --- |
| Target query family | Branded Seascape navigation queries and Bradenton/Sarasota private-pool vacation rental queries |
| Searcher intent | Move between Seascape guides, stay pages, owner pages and the five homes without losing the site; owners reach the revenue review. |
| Current Seascape URL | https://seascape-vacations.com/ and https://seascape-vacations.com/guides/ |
| SERP observed date | 2026-09-10 |
| SERP stale after | 2026-09-17 |
| Current proof | On 2026-09-10, the local build of PR #559 head fe86f766 rendered 162 pages, 91 without the shared header and footer; the design-floors checker reported 313 font-size, 64 tap-target, 8 hero-contrast and 1 shell violation on four routes. The same checks report zero after this release's fixes. |
| Top visible competitors | Visible in the returned results without a rank-order claim: iTrip.net Bradenton listings, FloridaRentals.com Sarasota private-pool listings, a Travelocity Bradenton Beach listing. Anna Maria Vacations was inspected as the named local competitor page. |
| Competitor angle | Aggregators lead with inventory pages, filters and visible nightly prices; the local competitor keeps one consistent header and footer with a phone number on every page and shows no prices or reviews. |
| Visual/format gap | Seascape currently presents two brands: 70 pages on the Waterline shell and 91 on the legacy header, sailboat logo and cream palette or no navigation. Competitors keep one shell and a visible phone everywhere. |
| Seascape gap | Two shells, 8–11px text, sub-44px mobile targets, white hero text under 4.5:1 on bright scenes, a missing compare icon, and no reviews or phone on the guest pages. These were directly observed in the rendered head. |
| Search fit | Preserve every existing route, intent and metadata. The shared header gives every page the same hub links, which helps crawl consistency without adding pages. |
| Local/GBP proof | N/A for this release: it changes no business profile, address, phone number or local fact; the phone number shown is the existing one. |
| AEO/readback note | N/A for this release: no discovery JSON or property fact changes; the homepage reviews reuse canonical reviewed data already exposed in /ai-discovery.json. No citation or AI-booking claim. |
| Recommendation | improve: apply the shared shell and floors to the existing routes; no new landers |
| Attack status | none found after named checks |
| Query variants inspected | Seascape Vacations Bradenton Sarasota vacation rentals private pool book direct |
| SERP source | Public web search for the named query on 2026-09-10; it returned the Seascape homepage, the Sarasota area guide, two stay pages and the Sarasota Luxe property page alongside iTrip, FloridaRentals and Travelocity listings. Qualitative returned results, not controlled organic positions. |
| Competitor URLs inspected | Source check: the 162 built pages and the design-floors checker on the unfixed head. SERP check: the named query on 2026-09-10. Competitor-page check: https://www.annamaria.com/rentals/ read on 2026-09-10; one consistent header and footer on every page, phone in header and footer, no visible nightly prices, no visible reviews. |
| Content gap and Seascape answer | No copy gap. A guest's path between guides, stays, owner and legal pages and the five homes must not change brands. Answer: one header and footer on every page, readable type, reachable targets, and honest individual reviews on the homepage. |
| Design/format strategy | Extend the approved Waterline shell to every route, keep legacy body layouts, raise small text to 12px and hit boxes to 44px, strengthen the scene scrim to measured contrast, no new component styles. |
| Seascape proof available | Design-floor Playwright spec plus shared-shell and icon-name node tests, red on the unfixed head and green after; desktop and mobile captures of 18 routes; canonical reviews data. |
| Tools/plugins used | Repository source, Playwright, node:test, sharp, public web search, one read-only competitor page fetch. No paid service or plugin installation. |
| Decision and reason | Ship the shell rollout and floors as fixes to the approved Waterline design; it addresses observed defects without any search expansion or new claims. |

## Follow-up round: the gold CTA and the internal links it exposed

Shipped after #565 landed, in the same workstream and against the same authorized
source list above.

**Gold CTA retired site-wide.** The pre-Waterline gold pill survived #565 on the 51
guide routes, the owner pages and the research pages. It was not only off-brand: it
rendered white on `#C9A962` at 2.25:1 against a 4.5:1 requirement, on hit boxes as
small as 40px, and it was the owner funnel's primary call to action as well as the
guides'. Every gold button now takes the Waterline primary action, chosen per surface
by measurement: ink on cream, white and photos; citron on the two sticky CTA bars, the
owner hero and the generated owner band; paper with an ink hairline on the legacy teal
bands, where ink falls to 1.04:1 and citron only reaches 2.93:1. The only source edit
to a search-driven page is one class, `owner-dark-band`, added to the dark band in
`src/property-management/property-management.njk` so that band can take the
dark-surface treatment. No copy, metadata, canonical, heading or schema changed.

**Internal links restored.** #565 replaced the legacy footer, which had linked the four
area-guide hubs. Nothing failed, because URLs, titles, canonicals, descriptions and
JSON-LD were byte-identical, the link validator only checks that links which exist
still resolve, and the visual gate's per-route pixel tolerance absorbed the footer
change without a diff. Counting inbound links across the whole build was the only thing
that showed it: three hubs had fallen from 59, 59 and 50 inbound pages to 27, 27 and 18.
The shared footer now carries a "Where we are" column linking all four, so each is
linked from every built page.

**New floor F6.** `scripts/enforcement/internal-link-floor.test.js` asserts that a hub
page the shared shell links to stays linked from at least 70% of built pages. It was
proven red by reproducing the exact regression against a build with that footer column
stripped. `DESIGN.md` records the floor, documents the retired gold, and gained a
`waterline:` token block, because its machine-readable half still declared Playfair
Display, a 50px pill radius and the pre-Waterline palette as the law.

## Release gate

Merge and the Netlify deploy remain Sawyer's decision. Nothing in this brief
authorizes activation.
