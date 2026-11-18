# Brief: Bradenton private-pool booking

- lifecycle: active
- task scope: Sawyer-approved existing-page improvement in agent-issues #72; Site Codex session 01a1dcb8-9959-77e3-a393-1bba291588ce is the sole Site writer and merger.
- persona: A guest comparing a private-pool home in Bradenton before checking dates.
- primary keyword: Bradenton vacation rentals with private pools
- secondary keywords: vacation rental with a private pool in Bradenton FL; family friendly pool home rental in Bradenton Florida
- audience pattern: Compare mainland location, guest capacity and a specific home's amenities, then check dates.
- proof source: `src/_data/properties-fallback.json`, `src/_data/stayFacts.js`, the three existing property pages and their booking anchors, and the live collection, checked 2026-11-15. The saved local OpenSEO November 14 assessment and Analytics contribution are linked in agent-issues #72.
- required internal links: /properties/the-oasis/#booking, /properties/dockside-dreams/#booking, /properties/river-house/#booking
- CTA target: The named property's existing date and guest panel; no booking submission.
- anti-claims: No on-island address, beachfront, walking distance, guaranteed availability, price advantage, safety certification, or unverified amenity. Sarasota stays distinct from Bradenton. Capacity comes from property truth.
- hypothesis: Specific homes and date links in the existing collection's first answer help a guest choose a suitable private-pool stay; a citation, booking or revenue effect is unproven.
- primary event: `stay_view_property_click` with target `page_slug` from the selected collection, recorded separately by placement; property-page `property_check_availability_click` is a separate measure subject to Analytics attribution coverage.
- guardrail event: Wrong-home destination, lost trip details, unsupported pool or occupancy claim, unavailable date screen, or indexability/canonical regression.
- entry criteria: Existing indexed URL and property truth verified; exact link behavior and event attributes observed on desktop and mobile; Analytics receives the URL and event contract before release.
- readback window: Analytics freezes the baseline before release and compares 14 complete finalized days before and after the actual live boundary with the same filters and weekday mix; comparable saved prompt results remain a separate observation.
- decision rule: Keep technically correct source-backed content; report insufficient evidence for any unmeasured AI, booking or revenue outcome. Revise or revert factual or route regressions.

## Gate 0 Search And Attack Receipt

| Field | Read |
| --- | --- |
| Target query family | Bradenton vacation rentals with private pools; family friendly pool home rental in Bradenton Florida. |
| Searcher intent | Guest booking: compare a mainland home and check dates. |
| Current Seascape URL | https://seascape-vacations.com/stays/anna-maria-island-homes-with-pool/ |
| SERP observed date | 2026-11-15 |
| SERP stale after | 2026-11-22 |
| Current proof | November 15 free Search Console inspection says the selected URL is submitted/indexed with the same Google and declared canonical, last crawl November 14. Agent-issues #72 links the dated GSC and saved AI observations; page-specific finalized sessions and click baseline are being prepared by Analytics. |
| Top visible competitors | Suncoast Vacation Rentals, FloridaRentals, and FindRentals appeared in the public search results; this is a discovery sample, not a measured rank order. |
| Competitor angle | Named homes, private pools, city, bedrooms and occupancy, with booking or listing actions. |
| Visual/format gap | Competitors show named inventory and fit facts in collection cards. Reuse this page's existing paragraphs and cards; no redesign. |
| Seascape gap | Its first answer names three homes and capacities but does not link those names to their date panels; the tracked home cards appear farther down. |
| Search fit | The existing indexed private-pool collection answers the intent and can send each visitor to the selected Bradenton home's date panel; the catalog is broader and the prior family collection is currently not indexed. |
| Local/GBP proof | Not a local-profile action; Bradenton locations are verified from the property catalog and live property pages. |
| AEO/readback note | Saved November 14 local OpenSEO observations on the two exact prompts are recorded on #72; they are a baseline, not proof that this edit will change answers. |
| Recommendation | Improve the existing intro and add tracked links to the three existing property date panels; retain its URL, cards, FAQ, schema, and other pages. |
| Attack status | completed |
| Query variants inspected | Bradenton Florida vacation rental private pool booking homes; family friendly pool home rental Bradenton Florida. |
| SERP source | Public web search results and free Search Console URL inspection, November 15; no paid lookup. |
| Competitor URLs inspected | https://www.suncoastvacation.com/homes/ ; https://www.floridarentals.com/southwest/bradenton-vacation-rentals/private-pool/ ; https://www.findrentals.com/salty-mermaid/p183700 |
| Content gap and Seascape answer | Name the actual Bradenton homes with catalog-bound capacities and a direct link to each date panel. |
| Design/format strategy | Reuse existing collection intro paragraphs and card styling; retain the existing hierarchy and layout. |
| Seascape proof available | Three named Bradenton homes, their pool amenities and occupancy in property fallback data; live same-site booking anchors and current public pages. |
| Tools/plugins used | Saved local OpenSEO, free Search Console inspection, public web search, Site source/build and browser checks. |
| Decision and reason | Improve one existing indexed page for the approved intent; do not create a second collection or change Hub #1051's experiment. |

## Source and proof contract

Source: `src/_data/seoPages.json` object `anna-maria-island-homes-with-pool`, this brief, and focused existing proof. Public claims are a BOUNDARY change.

Before editing source, preserve the existing canonical, indexability, FAQ/schema and home-card behavior; keep all linked homes in Bradenton with private pools and capacity derived from the catalog. The independent reference is the approved #72 request and the pre-existing property catalog, not the proposed copy. A focused check must fail against the old intro, which has no tracked date-panel links for the three named homes, and pass when each exact target and event is present; changed fixture capacity must flow through the answer. Inspect local desktop/mobile rendering and follow each link to its actual date screen without submitting a booking. Full release checks and the required current-head review remain mandatory. The PR description repeats this contract and the observed old-code failure.

Baseline and eventual measurements belong to Analytics on #72. Source merge, the scheduled production publish, live behavior and the 14-day outcome are separate evidence layers.
