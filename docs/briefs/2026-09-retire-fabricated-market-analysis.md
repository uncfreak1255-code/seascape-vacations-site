# Brief: Retire The Fabricated Bradenton Market Analysis

Status: active (opened 2026-09-17)
Owner: Sawyer. Driver: Claude.

- persona: a Gulf Coast owner or prospective investor searching for Bradenton
  short-term-rental market numbers before buying or before changing manager.
- primary keyword: Bradenton vacation rental market
- secondary keywords: Bradenton short term rental occupancy, Bradenton vacation rental revenue, Bradenton Airbnb market
- audience pattern: the reader wants market-wide statistics — occupancy, nightly
  rate, gross revenue, cap rate. Seascape has no dataset that supports
  market-wide statistics, so the honest move is to stop answering this query and
  send the owner-intent slice of it to the page where Seascape has something real
  to say.
- proof source: `seascape-hub/projects/negative-proof-register.md` and
  `seascape-hub/context/owner-offer.md` section 7 (excluded claims);
  live SERP check recorded in the Gate 0 block below.
- required internal links: /guides/bradenton-area-guide/, /guides/
- CTA target: /guides/bradenton-area-guide/ on the guest inbound page; retired-route 301 lands on /property-management/vacation-rental-management-bradenton/#owner-cta
- anti-claims: no occupancy band, no gross annual revenue figure, no cap rate, no
  nightly-rate table, no market-wide statistic of any kind, and no replacement
  page that reintroduces them from a different angle.

## Why This Batch

`/guides/2026-bradenton-vacation-rental-market-analysis/` shipped on 2026-03-02
in commit `123e34cf`, a bulk pSEO push that predates the negative-proof register.
It published a market table under Seascape's name — nightly rate, peak rate,
annual occupancy and gross annual revenue for six markets, plus a "6-9% Cap Rate"
figure — with no source for any number.

Two reasons it is retired rather than repaired:

1. Fabricated data cannot be sourced after the fact. Seascape's real dataset is
   its own reservations, which supports statements about Seascape's homes, not
   about the Bradenton market.
2. The numbers were materially inflated. The page claimed 68-72% annual occupancy
   for Bradenton and 75-80% for Anna Maria Island. The live SERP's actual data
   providers publish 42.9% (AirROI, Aug 2025-Jul 2026 window) and about 59% for
   Airbnb and Vrbo combined. Publishing high occupancy numbers to prospective
   owners is the exact shape of claim the register excludes.

The existing guard `owner-proof-integrity.test.js` read this page and passed,
because it only blocked three historical phrasings ("leave 15-20% on the table",
"12% higher occupancy", "8% higher nightly rates") and never looked at the table.
That guard's page-specific assertions retire with the page.

## Gate 0 Search And Attack Receipt

| Field | Value |
| --- | --- |
| Target query family | Bradenton vacation rental market statistics (occupancy, nightly rate, annual revenue, cap rate) |
| Searcher intent | commercial investigation by an owner or investor sizing the market before buying or relisting |
| Current Seascape URL | /guides/2026-bradenton-vacation-rental-market-analysis/ (retired by this brief) |
| SERP observed date | 2026-09-17 |
| SERP stale after | 2026-12-17 |
| Current proof | none; every number on the page is unsourced and no Seascape dataset supports market-wide statistics |
| Top visible competitors | AirROI, AirDNA, Rabbu, Airbtics, Chalet — short-term-rental data platforms with licensed datasets |
| Competitor angle | continuously refreshed market dashboards built on scraped and licensed booking data, updated monthly |
| Visual/format gap | competitors ship live dashboards and percentile tables; a static hand-written table cannot stay current or be audited |
| Seascape gap | Seascape has six homes and no market dataset, so it cannot compete on market-wide statistics and should not appear to |
| Search fit | poor — the query wants market data Seascape does not have; the owner-intent slice is better served by the Bradenton management page |
| Local/GBP proof | none required; no local claim is made or retained |
| AEO/readback note | removing the page removes it from AI answer surfaces as a Seascape-attributed source of occupancy and revenue figures, which is the intended effect |
| Recommended action | retire the page, 301 the route and its .html alias to /property-management/vacation-rental-management-bradenton/ |
| Attack status | completed |
| Query variants inspected | "Bradenton vacation rental market occupancy rates nightly rates 2026" |
| SERP source | WebSearch, 2026-09-17 |
| Competitor URLs inspected | https://www.airroi.com/airbnb-data/united-states/florida/bradenton ; https://www.airdna.co/vacation-rental-data/app/us/florida/bradenton/overview ; https://rabbu.com/airbnb-data/bradenton-fl ; https://airbtics.com/annual-airbnb-revenue-in-bradenton-beach-united-states/ |
| Content gap and Seascape answer | the gap is a licensed market dataset; Seascape's answer is to stop competing here and to compete on being the local operator on the management page instead |
| Design/format strategy | none; no replacement page is created |
| Seascape proof available | only Seascape's own reservation data, which supports claims about Seascape's homes and not about the market |
| Tools/plugins used | WebSearch; git history for provenance; repo enforcement suite for reference removal |
| Decision and reason | retire — the claims are unsubstantiated and inflated against published third-party data, and no honest version of this page exists at Seascape's data scale |

## What Changed

- deleted `src/guides/2026-bradenton-vacation-rental-market-analysis.html`
- 301 the pretty route, the bare route and the `.html` alias to
  `/property-management/vacation-rental-management-bradenton/`
- removed the route from the guides index and the inbound link in
  `things-to-do-bradenton-fl.html`, and dropped the leftover
  "Compare live Bradenton and AMI pricing" sentence so the guest stay
  paragraph no longer points at the owner lander
- removed the route from `entity-schema-coverage.test.js`,
  `assert-live-entity-schema-coverage.js` (20 required routes to 19, count floor
  in `recovery-entity-schema.test.js` updated to match), the
  `seo-structure.test.js` title expectation, the page-specific assertions in
  `owner-proof-integrity.test.js`, and `design-lint-baseline.json`
- pinned the retired slug in `seo-structure.test.js`: source must stay deleted,
  all three 301s must stay present, live sources including
  `things-to-do-bradenton-fl.html` must not promote the old URL, and the
  guest page must not restore the live-pricing promise

## Not In This Batch

The remaining antigravity-era claims are tracked in `seascape-hub` PR #739: the
owner-lander performance promises on five other routes, the direct-booking
savings percentages, and the unsourced traveler cost estimates across the guide
corpus. Each needs its own decision on prune versus repair, informed by Search
Console traffic.
