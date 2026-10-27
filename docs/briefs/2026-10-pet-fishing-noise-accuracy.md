# Brief: Pet, fishing and noise guide accuracy repairs

- lifecycle: active
- task scope: Sawyer approved correcting these three existing guides on October 27, 2026, preserving SEO and booking links and leaving held guides unchanged. Accuracy and duplicate-section cleanup only; no new search intent, layout, route, keyword targeting or growth batch.
- completion or successor: this Codex chat owns source review and merge; normal production publication and live proof remain separate results.
- mutation owner: Codex chat 01a17ebb-5b0b-73b2-8874-810ec98c2bac; sole writer and merger.

## Content Gate Inputs

- persona: a visitor planning a Gulf Coast stay with a pet, a fishing outing or questions about neighborhood noise.
- primary keyword: existing pet-friendly Anna Maria Island, fishing Anna Maria Island, Anna Maria Island noise ordinance query families; unchanged targeting on three existing pages.
- secondary keywords: emergency vet Holmes Beach, fishing license Anna Maria Island, Anna Maria Island quiet hours; existing informational intent, no keyword expansion.
- audience pattern: readers need reliable practical information before choosing an outing or following house rules.
- proof source: official Island Animal Clinic contact/emergency pages and Animal ER of University Park; FWC licensing/exemptions and recreational regulations; City of Anna Maria noise guidance and Bradenton Beach code-enforcement guidance, read October 27, 2026. Exact URLs and limitations below. Existing source at 8024b249 reproduces the stale address, inconsistent prices and unsupported penalties.
- required internal links: /stays/pet-friendly-vacation-rentals-bradenton, /stays/fishing-vacation-rentals-bradenton/, /stays/gulf-coast-vacation-homes-with-dock/, /properties/
- CTA target: every existing internal booking/stay/property link and tracking attribute on the three pages, unchanged.
- anti-claims: no invented price, pet allowance/deposit, emergency response/travel time, species season, citywide fine or Seascape eviction/refund policy; no ranking, conversion or revenue gain; no on-island Seascape inventory.

## Required Internal Link Map

Each guide retains its own destinations; these repairs do not add cross-topic booking links.

- src/guides/pet-friendly-anna-maria-island.html: /stays/pet-friendly-vacation-rentals-bradenton, /properties/
- src/guides/fishing-guide-anna-maria-sarasota.html: /stays/fishing-vacation-rentals-bradenton/, /stays/gulf-coast-vacation-homes-with-dock/, /properties/
- src/guides/anna-maria-island-noise-ordinance-guide.html: /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/, /properties/

## Repair and source constraints

- `src/guides/pet-friendly-anna-maria-island.html`: correct clinic address and emergency information; consolidate duplicate veterinary and packing sections, removing unsourced medication advice. Replace universal pet-deposit/count/amenity claims with per-home policy guidance and align the affected schema answer. Retain the original internal links and booking controls.
- `src/guides/fishing-guide-anna-maria-sarasota.html`: replace contradictory unsourced charter/kayak price ranges with quote guidance in prose, table and FAQ/schema; qualify licensed-charter/pier exemptions and age/residency rules using FWC. Remove undated harvest-season guarantees and promises about pier access; point to current official access/rule sources. Preserve the species discussion, comparison structure and booking routes.
- `src/guides/anna-maria-island-noise-ordinance-guide.html`: retain practical quiet-neighbor guidance; replace blanket island-wide audibility/fine/eviction claims with the published city guidance and the actual booking agreement as the source for property terms. No new contractual obligation is created.
- Held source stays untouched: weather, best-time, AMI vs Siesta Key and shelling. No shared CSS/templates, redirects, sitemap, title, description, robots, canonical, OG/Twitter targeting or tracking changes.
- These are factual repairs; changed pages must not be treated as unchanged rescue controls across this change.

## Primary sources read October 27, 2026

- https://islandanimalclinic.com/contact-us/ — 5343 Gulf Drive, Suite 900, Holmes Beach; phone 941-778-2445; limited business hours.
- https://islandanimalclinic.com/emergency/ — business-hours care and separate after-hours referral; no 24/7 claim for the clinic.
- https://www.animalerofuniversitypark.com/ — 8440 Cooper Creek Boulevard, Bradenton; 941-355-2884; provider lists 24/7 operation. Call ahead; no travel-time guarantee.
- https://myfwc.com/license/recreational/do-i-need-one/ — under-16 and qualifying resident exemptions, valid charter/pier licence coverage.
- https://myfwc.com/license/recreational/saltwater-fishing/ — current licence choices, fees and additional permits. Link rather than maintain an unverified price promise.
- https://myfwc.com/fishing/saltwater/recreational/ — location/species-specific current rules, not an evergreen promise of harvest availability.
- https://myfwc.com/fishing/saltwater/recreational/skyway/ — required Skyway educational course; park access must be checked separately.
- https://www.floridastateparks.org/parks-and-trails/skyway-fishing-pier-state-park — official search result reported restricted access; full page returned 403. Do not assert full access or a particular current closure extent.
- https://www.cityofannamaria.com/201/Noise-Regulations — 10 PM–8 AM quiet time; multiple factors determine a violation. Does not establish an island-wide $250–$500 fine or Seascape eviction/refund terms.
- https://www.cityofbradentonbeach.com/165/Common-Code-Violations — excessive-noise complaints go to police; no universal fine established.
- https://library.municode.com/fl/holmes_beach/codes/code_of_ordinances/311488?nodeId=PTIICOOR_CH30EN_ARTIIIHOBENOCOOR_S30-58PRCI — official code publisher surfaced in search but full read unavailable. Remove the unsourced summary rather than invent a city rule.
- `src/_data/properties-fallback.json` — pet acceptance/limits differ by home. No universal refundable pet deposit is supported.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Existing pet, fishing and noise informational guide queries; no retargeting. |
| Searcher intent | Plan responsibly with accurate local contact, cost and rules information. |
| Current Seascape URL | /guides/pet-friendly-anna-maria-island/; /guides/fishing-guide-anna-maria-sarasota/; /guides/anna-maria-island-noise-ordinance-guide/ |
| SERP observed date | 2026-10-27 |
| SERP stale after | 2026-11-03 |
| Current proof | October 27 source audit at 8024b249 and official-source reads above; canonical GSC Sep 26–Oct 23: pet 0 clicks/158 impressions, fishing 2/888, noise 5/361. Counts establish exposure, not a ranking-loss or growth claim. |
| Top visible competitors | Free unlocated public searches surfaced FWC licensing, the City of Anna Maria, Holmes Beach code publisher, Bradenton Beach code guidance and Beach Gem AMI noise guidance. No commercial ranking order is inferred. |
| Competitor angle | Authoritative rules and specific municipal/provider information rather than a single island-wide rule. |
| Visual/format gap | No layout change needed for factual corrections. |
| Seascape gap | Stale clinic address, contradictory charter ranges, unconditional licensing/penalty statements and duplicate pet-care sections. |
| Search fit | Keep the existing informational pages and their current stay/property destinations; correct the facts without a new page or new intent. |
| Local/GBP proof | Not applicable: no GBP, map-pack, physical office or business-ranking claim changes. |
| AEO/readback note | Synchronize changed FAQ answers with visible copy. No new AI collections or visibility claim. |
| Recommendation | Make the named factual repairs only. |
| Attack status | completed |
| Query variants inspected | Anna Maria Island noise ordinance; Holmes Beach noise ordinance; saltwater fishing licence exemptions charter pier. |
| SERP source | Free public web search October 27, 2026, without location control; primary sources read as above. No paid SEO calls. |
| Competitor URLs inspected | https://www.cityofannamaria.com/201/Noise-Regulations; https://www.cityofbradentonbeach.com/165/Common-Code-Violations; https://myfwc.com/license/recreational/do-i-need-one/ |
| Content gap and Seascape answer | Accurate contact/quote/rule guidance with source links; no unsupported replacement numbers. |
| Design/format strategy | Preserve the existing page layouts, comparison table and booking components. |
| Seascape proof available | Existing source and canonical property pet-policy data; no invented fieldwork. |
| Tools/plugins used | Local OpenSEO saved audit, source reads and free official web reads. |
| Decision and reason | Sawyer authorized these accuracy repairs, which do not depend on opening the held expansion batch. |

## Editorial and acceptance gate (written before source edits)

1. Draft practical replacement wording; remove internal process wording; check voice and specificity using docs/style. Targeted independent reviewer must return an explicit voice verdict and source/FAQ/release findings.
2. What must not break: original URLs, SEO metadata, all internal href/tracking tuples and booking controls; held-guide bytes; shared shell and layout.
3. Check against an independent wrong version: source-only acceptance script must reject base 8024b249 for the old 5904 address, incompatible fishing prices and unsupported universal penalty/eviction claims, then pass the repair. Snapshot original SEO fields/internal links before editing and compare after. Source facts come from the official pages above, not the replacement copy.
4. Run full `npm run verify:release -- --range origin/main`, relevant guide recovery proof and fresh desktop/mobile route readbacks. Keep source and FAQ/schema answers consistent. No need to refresh visual baselines for a redesign: this branch does not redesign anything.
5. Required exact-head review and guarded source merge; normal daily publication only, with production state reported separately. Roll back the named changes if the authoritative sources disprove them or route/booking regressions appear. Rollback base: 8024b249f554916cd13ca27628d2dc5641411a68.

## Not in scope

Rainy Day design implementation, held guides, new paid research, keyword expansion, redirects, broad content rewrites, house-rule changes, early deployment or schedules.
