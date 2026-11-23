# Brief: Beaches Guide Place Look

- lifecycle: active
- scope: build the place look (`docs/design/planning-guides.md` -> Two guide
  looks; spec site#1043, build ticket site#1045) on
  `/guides/anna-maria-island-beaches/`: an island map under the opening answer,
  the beach comparison moved up as the chooser, each beach's facts as a fact
  strip beside its own inset map, and each beach's longer reading folded under
  "More about this beach". Sawyer approved building it (agent-issues#92) and
  sees the deploy preview before it merges; it does not merge until he says
  keep.

## Content Gate Inputs

Layout lane: no new reader copy. Every sentence, fact and table cell is the
page's current text, moved; the only new visible words are map labels
(Gulf of Mexico, Tampa Bay, Longboat Pass, 1 mile, N), the key label "Beaches
on the map", the OpenStreetMap credit and the fold label "More about this
beach".

- persona: a visitor planning an Anna Maria Island trip who wants to pick a beach by where it is, parking and crowds.
- primary keyword: anna maria island beaches (unchanged)
- secondary keywords: best beaches anna maria island; unchanged from the page's current front matter
- audience pattern: answer first, map of the five beaches, comparison as the chooser, then one section per beach with its facts beside a locator and the longer reading folded.
- proof source: the guide's own published copy and sources; map positions from `src/_data/guidePlaces.json`, each marker with its source in `from`.
- required internal links: /properties/, /guides/
- CTA target: the shared booking kit and sticky bar (`guide_book_direct_click` tracking), unchanged
- anti-claims: no new rate figures, no amenity or capacity claims, no review counts, no parking or crowd claims beyond the page's existing copy.

## Build

- Sources: `src/guides/anna-maria-island-beaches.html`,
  `src/_includes/layouts/guide-planning.njk` (opt-in `guidePlaceLook` front
  matter; other planning guides render byte-identical),
  `src/_includes/partials/guide-chooser-anna-maria-island-beaches.njk`,
  `src/_includes/partials/island-locator.njk` (key label parameter),
  `src/_data/guidePlaces.json`, `src/css/guide-place-look.css`.
- Catalog pieces used: island locator, fact strip, disclosure
  (`docs/design/component-patterns.md`).
- Proof: title, meta, canonical, og/twitter and JSON-LD unchanged (head
  identical apart from four stylesheet links); a move-tolerant text diff of
  the rendered body shows only the section numeral "10" removed and the map,
  key, credit and fold labels added.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | anna maria island beaches; best beaches anna maria island |
| Searcher intent | Informational: a visitor choosing which island beach to go to |
| Current Seascape URL | https://seascape-vacations.com/guides/anna-maria-island-beaches/ |
| SERP observed date | 2026-11-23 |
| SERP stale after | 2026-12-23 |
| Current proof | OpenSEO report "AMI Beaches Guide Gate 0 SERP — Nov 23, 2026" (3f06d3a3): live US SERPs, desktop and mobile, depth 20. Seascape is not in the top 13-16 organic results on any of the four. Baseline on site#1046: Search Console 2026-10-23 to 2026-11-19, 1 click, 371 impressions, position 16.3 |
| Top visible competitors | discoverwestcentralflorida.com, uncoveringflorida.com, tripadvisor.com, sandbeachesusa.com, beachatlas.com, walkinthesand.com, teresaannmoon.com, annamaria.com |
| Competitor angle | Listicles and forum threads; every SERP opens with an AI Overview and People Also Ask, mobile adds a local pack |
| Visual/format gap | sandbeachesusa.com "Anna Maria Island Beaches: Map, Parking & Comparison" ranks 7-10 on three of four SERPs and is the only result promising a map plus a comparison |
| Seascape gap | The guide has the comparison and per-beach parking but no map, and its comparison sits last |
| Search fit | Title, description, H1 and headings unchanged; the map and chooser match the format the one map-led competitor promises |
| Local/GBP proof | Not applicable: no local-pack or Google Business change |
| AEO/readback note | JSON-LD unchanged. Read Search Console for the page 28 days after it goes live against the site#1046 baseline |
| Recommendation | Ship the place look with search-facing text unchanged, after Sawyer's keep |
| Attack status | completed |
| Query variants inspected | anna maria island beaches; best beaches anna maria island (desktop and mobile each) |
| SERP source | OpenSEO get_serp_results, US English, observed 2026-11-23; about 20 credits, about $0.02 |
| Competitor URLs inspected | https://sandbeachesusa.com/; https://www.discoverwestcentralflorida.com/; https://www.beachatlas.com/ (site roots: the SERP rows give domain, title and description, not page paths; pages not opened) |
| Content gap and Seascape answer | Competitors list beaches; Seascape adds where each beach sits, parking and crowds side by side, from its existing copy |
| Design/format strategy | Planning frame with the place look: map under the answer, comparison as chooser, fact strip and inset per beach, longer reading folded |
| Seascape proof available | Current source, the main-versus-head build diff, the saved SERP report |
| Tools/plugins used | OpenSEO SERP, Search Console and GA4 tools; node build diff; Playwright render |
| Decision and reason | Build it and show Sawyer the preview; the format gap is the only one the SERP shows and the text stays as is |
