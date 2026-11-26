# Brief: Beaches Guide Place Look

- lifecycle: active
- current scope: source-backed copy accuracy repair for site #1057; preserve the approved map, table, five sections, disclosure and booking flow. Sawyer requested implementation in the follow-up to the exact-copy review on 2026-11-23. No merge or publication in this task.
- original scope (completed by PR #1056; retained as layout history): build the place look (`docs/design/planning-guides.md` -> Two guide
  looks; spec site#1043, build ticket site#1045) on
  `/guides/anna-maria-island-beaches/`: an island map under the opening answer
  (beside it from 1050px),
  the beach comparison moved up as the chooser, each beach's facts as a fact
  strip beside its own inset map, and each beach's longer reading folded under
  "More about <beach name>". Sawyer approved building it (agent-issues#92) and
  kept the look; PR #1056 merged as 16da1fe6. This records source completion, not deployment proof.

## Content Gate Inputs

Original layout lane (#1056, historical): no new reader copy. Every sentence, fact and table cell is the
page's current text, moved; the only new visible words are map labels
(Gulf of Mexico, Tampa Bay, Longboat Pass, 1 mile, N), the key label "Beaches
on the map", the OpenStreetMap credit and the fold labels "More about" plus
the beach's name, so a screen reader's list tells the five folds apart.

- persona: a visitor planning an Anna Maria Island trip who wants to pick a beach by where it is, parking and crowds.
- primary keyword: anna maria island beaches (unchanged)
- secondary keywords: best beaches anna maria island; unchanged from the page's current front matter
- audience pattern: answer first, map of the five beaches, comparison as the chooser, then one section per beach with its facts beside a locator and the longer reading folded.
- proof source: the current guide and the official/local references in the #1057 accuracy repair below; map positions from `src/_data/guidePlaces.json`, each marker with its source in `from`.
- required internal links: /properties/, /guides/
- CTA target: the shared booking kit and sticky bar (`guide_book_direct_click` tracking), unchanged
- anti-claims: no new rate figures, property amenity/capacity claims, review counts, exact parking capacities or fill times, guaranteed crowd levels, or Seascape-managed homes on Anna Maria Island. Current repair may correct parking and beach descriptions only against the sources below.

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


## #1057 accuracy repair — approved scope and evidence

Route: `/guides/anna-maria-island-beaches/`. Existing-guide accuracy repair,
not a new search batch or design experiment. No title, metadata, routing,
map, styles, section numbering or booking-kit changes. Preserve the existing
Gate 0 record above as the original layout receipt; no fresh paid SERP work
is needed for this factual correction.

Allowed source paths:
- `src/_includes/partials/guide-chooser-anna-maria-island-beaches.njk`
- `src/guides/anna-maria-island-beaches.html` (Holmes Beach facts and paragraph)
- this brief (scope, evidence and review receipt)

Facts checked against e6543cb6 and current main c835bc98 on 2026-11-23:
Anna Maria Beach has no matching section; the old combined Holmes/Manatee row
mixes a public beach park with the neighborhood accesses; the Holmes paragraph
incorrectly places Seascape rentals on the island; Bradenton's old "Metered
street" parking cell omits the documented free city lots.

| Source (read 2026-11-23) | Supported correction |
| --- | --- |
| https://www.mymanatee.org/connect/locations/location-details/manatee-public-beach | Manatee Public Beach is in Holmes Beach; lifeguards, restrooms, showers, picnic areas, concessions and parking support the family/amenities distinction. |
| https://www.mymanatee.org/connect/locations/location-details/coquina-beach | Coquina has parking, picnic areas/pavilions, grills, restrooms and a walking trail. |
| https://www.cityofbradentonbeach.com/180/Parking | Free city lots near Bridge Street; no claim that every parking space in the city is free. |
| https://www.bradentongulfislands.com/discover/beaches/ | Bean Point's quieter setting and bay views; white sand, Manatee family facilities, Coquina shelling and nearby Bridge Street dining/shops. |
| https://www.annamaria.com/news-and-blog/anna-maria-island-attraction-highlight-bean-point/ | Bean Point has no dedicated parking lot and few nearby street spaces. |
| https://www.islander.org/2024/04/holmes-beach-details-added-parking-roadside-improvements/ | Designated roadside parking distributed through Holmes Beach; limits at individual accesses do not imply that the entire city has almost no parking. Dated background, cross-checked with current city parking page. |
| https://destinationholmes.com/parking-at-a-glance | Current city parking map and daily availability page; availability varies. |

Crowd descriptions are qualitative planning judgments from the guide and local
sources, not measured attendance. Use "generally", "often" and "varies";
never promise solitude, a parking space or a fixed time a lot fills. Coquina's
comparison emphasizes picnic areas and shelling; remove kayaking to avoid
confusing Gulf beach amenities with nearby bayside activity. The Holmes row
means neighborhood accesses outside Manatee Public Beach, not the whole city.
Keep the sand column and five rows in section order: Bean Point, Manatee,
Coquina, Holmes, Bradenton.

### Editorial execution

1. Draft the copy: apply the exact five-row comparison and Holmes paragraph
   supplied in Sawyer's copy review; the CTA names Bradenton/Sarasota homes.
2. Remove internal wording: reader copy contains no PR, evidence, agent,
   approval, source-control or measurement instructions. The table note explains
   a geographic distinction relevant to choosing a beach.
3. Check voice and specificity: practical parking tradeoffs, qualified crowd
   expectations, one natural property invitation; no invented beach proximity,
   guaranteed quiet, capacities or parking counts.

Skills/tools: native editorial steps with all three `docs/style/` sources;
Compound Writing and broad SEO research skipped for the focused factual repair
under the content gate. GitHub/source reads and previously retrieved official
and local web pages supply evidence; no paid research, new tooling or design
lane. One read-only targeted reviewer checks actual diff, factual consistency,
voice and verification; record its verdict in the PR. Existing LocalBusiness
service-area schema is pre-existing and outside these allowed paths/edits; do
not report the whole page's business positioning as fully reconciled.

Validation: full `npm run verify:release -- --range origin/main`, guide recovery
check, and built-HTML checks of the chooser and Holmes section. Targeted
read-only review returned **Copy: Approved**, with no blocking copy findings.
Desktop/phone pixel inspection remains unverified: the Playwright browser
download returned HTTP 403 and system Chromium could not create its process
socket in this environment. No CSS, layout, map or component code changed;
carry this rendered-QA limitation in the draft PR rather than claiming a pass.
The initial full suite passed 1,548/1,549 tests; its sole failure was a missing
`sqlite3` CLI. The official SQLite 3.54.1 CLI was downloaded into temporary
tooling outside the repo for a genuine rerun, with no test or gate changes.
Independent review and exact final command results go in the PR; no deployment
or business-impact claim. Rollback is reverting this copy-only commit; never
restore a demonstrated false rental or parking claim to recover traffic.
