# Brief: Bradenton vacation rentals head-term page

- lifecycle: active
- link map: enforced
- task scope: Sawyer-approved expansion exception to ship `/stays/bradenton-vacation-rentals/` for the head term `bradenton vacation rentals`. Founder approval: 2026-11-17 at 9:04 PM ET. Site writer is this Cursor Cloud branch. Homepage (`src/index.njk`) and the `production` branch stay untouched.
- completion or successor: not complete until the page merges; live proof waits on the daily production publish
- persona: a guest searching Bradenton vacation rentals who needs to see real mainland homes and check dates
- primary keyword: bradenton vacation rentals
- secondary keywords: Bradenton FL vacation rentals; vacation rentals in Bradenton Florida
- audience pattern: Confirm the homes are in mainland Bradenton, pick one from the catalog, then check dates
- proof source: `src/_data/properties-fallback.json` (Bradenton `destination` homes only), `src/_data/stayFacts.js`, existing `/stays/` collection template, public web search on 2026-11-18. Search Console has 0 rows for the head term today. Local OpenSEO/DataForSEO from this VM is unavailable.
- required internal links: /properties/dockside-dreams/#booking, /properties/the-oasis/#booking, /guides/bradenton-area-guide/, /guides/bradenton-vs-sarasota/, /guides/things-to-do-bradenton-fl/, /stays/bradenton-vacation-rentals-near-beaches/
- CTA target: each named home's existing date panel at `/properties/<slug>/#booking`; catalog fallback `/properties/?area=bradenton`
- anti-claims: no on-island address; no invented homes, docks, or amenities; no unverified drive times; no management-fee percent or range; no pool-heat inclusion except The Coastal's no-charge rule; Sarasota Luxe stays off this page
- hypothesis: a truthful head-term collection for mainland Bradenton homes can rank for `bradenton vacation rentals` and send guests to date panels; ranking, citation, or booking lift is unproven
- primary event: `stay_view_property_click` with `data-placement="stay_intro"` or `stay_property_card`
- guardrail event: an on-island claim, a non-catalog home, a Sarasota home on this URL, a missing date-panel link, or a management-fee figure
- entry criteria: founder approval recorded; Gate 0 filled from the 2026-11-18 public SERP sample; catalog-bound homes and capacities; content gate passed
- readback window: Analytics compares 14 complete finalized days before and after the live publish boundary; no ranking claim before that
- decision rule: keep technically correct source-backed content; report insufficient evidence for ranking or booking lift; revert factual or routing regressions

## Why This Batch

- What changed: Sawyer lifted the expansion hold for this one URL on 2026-11-17 at 9:04 PM ET. Search Console has 0 rows for `bradenton vacation rentals` (~590 searches a month). The nearest existing page is `/stays/bradenton-vacation-rentals-near-beaches/`, a beach-access modifier, not the head term.
- Why this cluster wins now: founder authorization plus a missing head-term URL. Seascape already manages Bradenton homes; the SERP is OTA and local-manager inventory cards.
- What should explicitly wait: other expansion branches; Holmes Beach; owner-page expansion; homepage changes; paid OpenSEO lookups from this VM.

## Experiment And Readback Contract

- hypothesis: naming Seascape Vacations, listing only catalog Bradenton homes, and linking each date panel will give Google and guests a page that can compete for the head term
- primary event: `stay_view_property_click`
- guardrail event: on-island copy, invented inventory, or a fee-range claim
- entry criteria: founder approval; Gate 0 sample; catalog proof
- readback window: 14 complete days after production publish
- decision rule: keep if facts and routes stay true; insufficient evidence for commercial lift until Analytics reads back

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | bradenton vacation rentals |
| Searcher intent | guest booking: find a Bradenton vacation rental and check dates |
| Current Seascape URL | missing page; nearest modifier is `/stays/bradenton-vacation-rentals-near-beaches/` |
| SERP observed date | 2026-11-18 |
| SERP stale after | 2026-11-25 |
| Current proof | Task stated Search Console has 0 rows for `bradenton vacation rentals` today (2026-11-18). Volume cited in the request is ~590 searches a month. No Analytics receipt yet for this URL because it does not exist. |
| Top visible competitors | Suncoast Vacation Rentals, Vacasa Bradenton, Booking.com Bradenton holiday homes, Airbnb Bradenton stays |
| Competitor angle | Named inventory cards, private pools, nightly prices, OTA booking actions, and mix of mainland plus island listings |
| Visual/format gap | Competitors lead with named homes and book/check-dates actions. Reuse the existing `/stays/` collection: intro, cards, FAQ, FAQ schema. No new layout. |
| Seascape gap | No head-term URL. The live SERP sample returned Seascape's AMI pool collection, not a Bradenton city page. |
| Search fit | Create `/stays/bradenton-vacation-rentals/` as the Bradenton money destination. Convert on property date panels. Keep `/stays/bradenton-vacation-rentals-near-beaches/` as the beach-access modifier. |
| Local/GBP proof | Not a map-pack or GBP category change. Locations come from the property catalog: city Bradenton, destination bradenton. |
| AEO/readback note | No AI-citation baseline for this URL. Name Seascape Vacations in the first answer so extracts are not nameless. No citation lift is claimed. |
| Recommendation | Create the missing head-term collection with catalog Bradenton homes, Check dates links, and FAQ schema. |
| Attack status | completed |
| Query variants inspected | bradenton vacation rentals; Bradenton FL vacation rentals |
| SERP source | Public web search on 2026-11-18 (discovery sample, not a measured rank order). Local OpenSEO and DataForSEO were not reachable from this VM, so a paid SERP receipt is still outstanding and is not a silent fallback. |
| Competitor URLs inspected | https://www.suncoastvacation.com/homes/ ; https://www.vacasa.com/usa/Florida/Bradenton/ ; https://www.booking.com/holiday-homes/city/us/bradenton.html ; https://www.airbnb.com/bradenton-fl/stays |
| Content gap and Seascape answer | A page that names Seascape Vacations, lists only real mainland Bradenton homes, and sends each guest to that home's date panel. |
| Design/format strategy | Reuse `src/stays/stays.njk`. No CSS, homepage, or new component. Check dates links follow PR #967 (`/properties/<slug>/#booking`). |
| Seascape proof available | Property fallback: Dockside Dreams, The Oasis, River House, Bradenton Pool Home, Pickleball Pool Home Retreat, The Coastal, Relaxing Oasis. Sarasota Luxe is Sarasota and stays off this page. |
| Tools/plugins used | Repo source, public web search, content gate. Compound Writing skill is not installed in this session. No paid OpenSEO. No Hostaway write. |
| Decision and reason | Founder-authorized new collection for a missing head term. Do not open other expansion branches. |

## Cluster In Scope

- canonical winner URL: `/stays/bradenton-vacation-rentals/`
- feeder pages: `/guides/bradenton-area-guide/`, `/guides/things-to-do-bradenton-fl/`, `/guides/bradenton-vs-sarasota/`, `/stays/bradenton-vacation-rentals-near-beaches/`, `/stays/large-group-vacation-rentals-bradenton/`, `/stays/bradenton-waterfront-vacation-rentals/`, `/stays/bradenton-vacation-rentals-with-hot-tub/`, `/stays/fishing-vacation-rentals-bradenton/`
- aliases or retired URLs: `/stays/vacation-rentals-bradenton-florida` and `/stays/vacation-rentals-bradenton-florida/` retarget to the new head-term URL
- money destination: this page, then `/properties/<slug>/#booking`
- active lane: direct-book stay intent

## Source And Proof Constraints

- property truth needed: Bradenton `destination` homes in `src/_data/properties-fallback.json`
- owner proof asset needed: none
- claims that are off-limits: on-island addresses, invented amenities, unverified minutes, management-fee %, pool-heat inclusion except The Coastal
- Seascape-specific proof: named catalog homes, mainland geography, The Coastal no-charge pool heat, Dockside Dreams as the only waterfront home

## Page Builder Tasks

- source files likely to change: `src/_data/seoPages.json`, `src/stays/stays.njk`, `src/_redirects`, `src/guides/bradenton-area-guide/index.html`, `src/guides/things-to-do-bradenton-fl.html`, `src/guides/bradenton-vs-sarasota.html`, `docs/status/next-batch.md`, `docs/plans/2026-11-content-priorities.md`, `docs/portfolio/stay-money-pages.md`, `docs/portfolio/pseo-inventory-triage.md`, `docs/status/page-ledger.json`, `scripts/seo/generate-pseo-triage.js`, `scripts/recovery/assert-live-smoke.js`
- redirect or schema work: retarget the head-term alias; FAQPage plus ItemList of VacationRental from the existing stays template
- internal-link or CTA work: donor guides and related Bradenton stay pages; Check dates in geoIntro
- money CTA and downstream tracking event to verify: `stay_view_property_click`

## Source Files Changed

- src/_data/seoPages.json
- src/stays/stays.njk
- src/_includes/partials/stay-article-jsonld.njk
- src/_redirects
- src/guides/bradenton-area-guide/index.html
- src/guides/things-to-do-bradenton-fl.html
- src/guides/bradenton-vs-sarasota.html
- docs/status/page-ledger.json

## Required Internal Link Map

- src/guides/bradenton-area-guide/index.html: /stays/bradenton-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/
- src/guides/things-to-do-bradenton-fl.html: /stays/bradenton-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/
- src/guides/bradenton-vs-sarasota.html: /stays/bradenton-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/

## Voice Editor Checklist

- tone risks: tourism-board Bradenton copy; "luxury"; island-by-association
- generic or mechanical patterns to kill: role-card phrasing, funnel shorthand, fake drive-time precision
- proof or specificity checks: every named home exists in the catalog; The Coastal heat; Dockside Dreams is the only dock
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured

## Release Gate Checklist

- routes to smoke test: `/stays/bradenton-vacation-rentals/`, `/stays/`, `/guides/bradenton-vs-sarasota/`
- commands to run: `npm run check:brief -- docs/briefs/2026-11-bradenton-vacation-rentals.md --gate0`, focused stay test, `npm run lint:content`, `npm run verify:release -- --range origin/main`
- regression risks to watch: homepage phone cards from #965; Sarasota Luxe leaking onto this page; live-smoke hub copy; production branch

## Done When

- the page builds at `/stays/bradenton-vacation-rentals/`
- cards and Check dates links match the seven Bradenton catalog homes
- FAQ schema renders
- donor guides and related stay pages link here
- sitemap includes the URL
- expansion-hold docs record the founder exception
- PR is ready for review with desktop and phone screenshots; `@codex review` requested; not merged

## Not In Scope

- homepage (`src/index.njk`)
- production branch
- other expansion URLs
- management-fee content
- invented drive times
- paid OpenSEO from this VM
