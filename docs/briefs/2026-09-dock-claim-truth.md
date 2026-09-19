# Brief: Dockside Dreams dock-claim truth correction

## Content Gate Inputs

- persona: guest planning a waterfront stay who fishes or paddles
- primary keyword: none (truth correction, not a search play)
- secondary keywords: none
- audience pattern: guest reads a comparison or activity guide, clicks through to the property, arrives with an expectation the property page then denies
- proof source: `src/_data/properties-fallback.json` ("The dock is for access, not fishing. No fishing from the dock, jet skis, or guest use of the boat lift. One boat maximum.") and `src/_data/seoPages.json` Dockside Dreams geoIntro ("guests may use the dock but may not use the boat lift... The home does not have kayaks, paddleboards, or fishing gear of its own.")
- offer claim: n/a (guest lane)
- required internal links: /properties/, /guides/
- CTA target: unchanged
- anti-claims: do not promise fishing from the Dockside Dreams dock; do not imply the home supplies kayaks, paddleboards, or fishing gear; do not imply guest use of the boat lift; do not attribute water access, dock access or river frontage to The Oasis, River House, Bradenton Pool Home, Sarasota Luxe or Blue House; area-level amenities may not be credited to a named home that lacks them

## Why This Batch

- what changed in the data: a link-claim check over 405 internal claims (Jev 1.13.0, run 2026-09-18) scored two guide sentences at 0.08 and 0.20 for "does the destination page support this claim". Manual verification against the property source confirmed both were real contradictions, and a third instance was found by keyword scan in the fishing guide CTA.
- why this cluster wins now: the three sentences promise an activity the property's own house rules prohibit. That is a guest-expectation and complaint risk on arrival, independent of any search value.
- fourth instance, added 2026-09-18 after Sawyer's review: `/guides/where-to-stay-near-anna-maria-island/` grouped Dockside Dreams and The Oasis under a "Bradenton Waterfront Mainland" heading and credited the pair with "water access". Canon says The Oasis is `NOT waterfront` (beaches 5.4-5.7 mi) and `seoPages.json` already states "Neither home is on the water except Dockside Dreams". Both homes still belong in the section; the amenity attribution is now split so the dock and bay access sit with Dockside Dreams and the space and putting green sit with The Oasis. Every element is canon-backed: 16 guests, putting green and turf backyard, private deep-water dock, canal with direct bay access.
- related but NOT fixed here: River House's canon entry carries an unresolved source discrepancy ("river access" in an older dossier versus "near the river, not directly on water" in the operational reference). That is a `seascape-hub` correction and must be settled before any guide describes River House's relationship to the Manatee River.
- follow-up, added 2026-09-19 after an independent review of the #604 batch: five sentences on pages this batch already touches still made plural or off-island water claims ("We manage properties both on the island", "Waterfront homes on AMI", "pools, docks, and direct water access", "Some homes include docks or waterfront access", "Waterfront homes with pools, docks"), and two guides gave the same dock conflicting unsourced lengths (80-foot and 30-foot). Canon: Dockside Dreams is the only waterfront home and no Seascape home is on the island. The `canal-homes-with-boat-dock` stay page also still marketed fishing from the dock; its intro, swimming FAQ, fishing FAQ and geoIntro now match the house rule. `property-truth-invariants.test.js` pins all of it.
- second follow-up, same PR, after a second independent review: every dock-fishing claim on the site is removed (`seoPages.json` bradenton-waterfront-vacation-rentals, fishing-vacation-rentals-bradenton, gulf-coast-vacation-homes-with-dock and canal-homes-with-boat-dock; their fishing FAQs now state the house rule). The unsourced "40% of our returning guests" statistic and the remaining plural or on-island claims on the four repaired guides are gone. The tests now match patterns, not exact phrases: dock fishing is scanned site-wide across `seoPages.json` and `src/guides/`, and plural water claims across the four repaired guides.
- deliberately NOT in this batch: plural "our waterfront homes" wording on about 20 other guides, the `/stays/bradenton-waterfront-vacation-rentals/` page title, and the waterfront revenue statistics in `src/research/gulf-coast-vacation-booking-trends-2026.njk`. These need their own site-wide sweep.
- what should explicitly wait: broader link-claim remediation. The harness still over-flags navigation and related-links blocks, so the remaining flagged list is not yet a work queue.

## Source Files Changed In This Batch

  - src/guides/anna-maria-island-vs-longboat-key.html
  - src/guides/holmes-beach-vs-bradenton-beach.html
  - src/guides/fishing-guide-anna-maria-sarasota.html
  - src/guides/where-to-stay-near-anna-maria-island/index.html
  - src/guides/things-to-do-bradenton-fl.html
  - src/_data/seoPages.json

## Experiment And Readback Contract

- hypothesis: none. This is a correctness fix, not an experiment.
- primary event: none
- guardrail event: none
- entry criteria: n/a
- readback window: n/a
- decision rule: n/a

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | none; no query is being targeted |
| Searcher intent | n/a |
| Current Seascape URL | `/guides/anna-maria-island-vs-longboat-key/`, `/guides/holmes-beach-vs-bradenton-beach/`, `/guides/fishing-guide-anna-maria-sarasota/` |
| SERP observed date | 2026-09-18 |
| SERP stale after | 2026-10-18 |
| Current proof | property source files named above; all three sentences read verbatim from the built `_site` output before editing |
| Top visible competitors | n/a for a truth correction |
| Competitor angle | n/a |
| Visual/format gap | none; sentence-level copy only |
| Seascape gap | guide copy contradicted the property page's stated dock rules |
| Search fit | no new page, no new keyword, no title or meta change on these three pages |
| Local/GBP proof | Not a GBP or local-pack action. These are organic guide pages and the change is a property-fact correction, so no Google Business Profile evidence applies. |
| AEO/readback note | the corrected sentences remain quotable and now match the property page, which removes a contradiction an AI answer could surface against the brand |
| Recommendation | ship the three sentence corrections |
| Attack status | `none found after named checks` |
| Query variants inspected | none; no query lane involved |
| SERP source | n/a |
| Competitor URLs inspected | None were inspected, because a property-fact correction has no competitor lane. The three named checks resolve as follows: the current source check is the governing evidence (`seascape-hub/context/seascape-properties.md` and `src/_data/seoPages.json`); a DataForSEO SERP check was deliberately not run because no query is being targeted; and a competitor-page check was deliberately not run for the same reason. |
| Content gap and Seascape answer | the honest version still sells the dock: canal with bay access, one boat may be tied up, local outfitters deliver kayak rentals to the dock, and fishing happens from a kayak or charter rather than from the dock |
| Design/format strategy | unchanged |
| Seascape proof available | yes, from the two property data files |
| Tools/plugins used | OpenSEO MCP (GSC and SERP reads), TypeSafe Jev 1.13.0 link-claim harness, repo grep against `src/` and `_site/` |
| Decision and reason | ship: three published sentences promise fishing and kayak supply that the property explicitly denies |

## Source files likely to change

  - `src/guides/anna-maria-island-vs-longboat-key.html`
  - `src/guides/holmes-beach-vs-bradenton-beach.html`
  - `src/guides/fishing-guide-anna-maria-sarasota.html`
  - `src/guides/where-to-stay-near-anna-maria-island/index.html`
