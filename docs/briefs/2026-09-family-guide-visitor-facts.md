# Brief: Family comparison guide visitor facts

- persona: Parent choosing a Bradenton or Sarasota vacation with children.
- primary keyword: Bradenton vs Sarasota for families
- secondary keywords: Sarasota family activities, Mote SEA, Sarasota family restaurants
- audience pattern: Existing comparison-guide visitor planning attractions and meals.
- proof source: Bishop homepage https://bishopscience.org/ and Bishop Blackbaud tickets (adult $25, ages 0-4 free); Ringling tickets https://www.ringling.org/tickets-admission/ (Museum Admission adult $30, under 6 free); Mote visitor information https://mote.org/aquarium/sea-visitor-information/; Flippers location https://flippersotb.com/location/; Seascape property from-prices in `src/_data/properties-fallback.json` (Oasis $550, Dockside Dreams $450). Checked 2026-09-12. Big Cat Habitat, Myakka entrance, LECOM starting price, and market-wide ADR bands could not be proven from reachable official pages today, so those dollars were dropped.
- required internal links: /guides/bradenton-vs-sarasota/, /stays/family-vacation-rentals-anna-maria-island/, /properties/
- CTA target: Preserve existing property and family-stay links.
- anti-claims: No ranking, booking or conversion lift claim; no whole-page factual-refresh claim; no fixed Mote, Big Cat, Myakka, or LECOM ticket price; no market-wide nightly ADR average; no new property claims.

## Source Files Changed

- src/guides/bradenton-vs-sarasota-for-families/index.html
- Remove Flippers on the Bay from the Sarasota table and restaurant list: its official address is in Fort Myers Beach.
- Update Mote references to Mote Science Education Aquarium (Mote SEA), its University Town Center Drive address, and variable-price advance ticket guidance. Keep the FAQ and its JSON-LD consistent.
- Set Article `dateModified` and the visible Updated line to 2026-09-12 so Google does not keep the stale $24 / Mote Marine / Flippers snippet.
- Keep sourced Bishop ($25/adult) and Ringling ($30/adult) ticket dollars with official links. Drop unsourced Big Cat, Myakka, LECOM, Clesi's meal, and market ADR dollars the same way Mote was handled: official link, no invented price.
- Keep layout, tracking, internal links, and unrelated copy unchanged. Removing the fixed drive-time heading is part of the Mote location correction.

## Gate 0 — Existing-page factual correction

| Field | Read |
| --- | --- |
| Target query family | Bradenton vs Sarasota for families; Sarasota family activities. |
| Searcher intent | Choose a vacation location and plan nearby attractions and meals. |
| Current Seascape URL | /guides/bradenton-vs-sarasota-for-families/ |
| SERP observed date | 2026-09-12 |
| SERP stale after | 2026-09-19 |
| Current proof | Source and live-page inspection on 2026-09-12 found Mote adult admission at $24 and Flippers labeled Siesta Key. Official pages the same day: Mote SEA at 225 University Town Center Drive with date-dependent pricing; Flippers at 8767 Estero Boulevard, Fort Myers Beach; Bishop adult $25 and ages 0-4 free; Ringling Museum Admission adult $30 and under 6 free. Big Cat Habitat FAQ returned a captcha; Myakka hours/fees returned Cloudflare 403; Pirates spring-training page listed no starting price. Market-wide $275-$425 / $400-$600 ADR bands have no dated official source. The saved analytics report emitted 2026-09-08 covers 2026-08-31 through 2026-09-06 and recommends homepage regression investigation; it is not a fresh account query or demand proof for this feeder route. |
| Top visible competitors | Visit Sarasota County; Local Life Homes; Family Traveller, in a public search sample for Bradenton Sarasota family vacation guide. No location-controlled ranking claim. |
| Competitor angle | Activities by age, weather and attraction location. |
| Visual/format gap | None needed for this correction; retain the existing table, lists and FAQ. |
| Seascape gap | Wrong restaurant destination, outdated aquarium name, and stale ticket or rental-dollar claims can waste a family's time and distort its budget. |
| Search fit | Correct the existing family feeder guide and preserve its links to the main comparison and family rentals. No new page is needed. |
| Local/GBP proof | Not applicable to local-pack work; current official attraction pages and Seascape property from-prices establish the visitor facts. |
| AEO/readback note | Keep the affected visible FAQ and FAQPage answer consistent; bump dateModified to 2026-09-12; make no citation-lift claim. |
| Recommendation | Repair the verified visitor facts, bump the update date, and drop any remaining ticket or ADR dollars that cannot be proven today. |
| Attack status | completed |
| Query variants inspected | Bradenton Sarasota family vacation guide; Bishop Museum of Science and Nature tickets; Ringling tickets admission; Big Cat Habitat admission; Myakka River State Park entrance fee; site:flippersotb.com/location 8767. |
| SERP source | Public web search on 2026-09-12, plus official source-page reads. |
| Competitor URLs inspected | https://www.visitsarasota.com/article/one-coast-all-ages-multigenerational-guide-families ; https://www.locallifehomes.com/local-guide/sarasota-with-kids/ ; https://familytraveller.com/usa/vacation-destinations/north-america/united-states/sarasota-bradenton-family-vacations-in-florida/ . Search extracts for the latter two; no competitor claim is adopted as local fact. |
| Content gap and Seascape answer | Accurate attraction location, sourced ticket planning, and no invented nightly averages on the existing guide. |
| Design/format strategy | Text-only correction within existing markup. |
| Seascape proof available | Current page source, live page, dated official-source checks above, and Seascape property from-prices. |
| Tools/plugins used | Native source inspection, web search and official-page reads; repository checks for acceptance. |
| Decision and reason | Fix demonstrated visitor misinformation now. This does not open an expansion batch or validate the saved homepage regression. |

## Acceptance

Complete Draft the copy, Remove internal wording, and Check voice and specificity; obtain the read-only Voice Editor verdict. Run content lint, the production build, unit tests, release verification, and the guide recovery check. Inspect the changed route and confirm affected FAQ text matches JSON-LD. Publication requires separate approval.
