# Brief: Family vacation guide, inbound internal links

- lifecycle: active
- task scope: add four contextual inbound links to `/guides/family-vacation-anna-maria-island/` from four related guides. Links only. No title, meta, schema or other copy change. Approved by Sawyer on 2026-10-12.
- completion or successor: record the merged source PR here when it lands

## Content Gate Inputs

- persona: a family planning a beach week on Anna Maria Island who reads a beach, island-comparison or seasonal guide first and has not yet seen the family planning guide.
- primary keyword: anna maria island family vacation
- secondary keywords: family vacation anna maria island, anna maria island with kids, kid friendly anna maria island
- audience pattern: families reach the area guides from search, then need one clear next page for kids, beach days and family logistics.
- proof source: `/mnt/project-files/notes/attack-lane-guides-2026-10-04.md` (built-site link count of 2026-10-04: 16 links, lowest of the five priority guides; `dateModified` 2026-03-03, oldest; absent from the 2026-10-04 SERP read). Source check on 2026-10-12: no guide in `src/guides/` linked to the family guide from the four donor sentences below.
- required internal links: /guides/family-vacation-anna-maria-island/
- CTA target: unchanged on every guide (guest CTAs per `docs/portfolio/winner-guides.md`).
- anti-claims: no new facts or claims; no change to titles, descriptions, H1s, schema, CTAs or tracked guest events; no rewrite of the family guide; no owner or portfolio claims.

## Required Internal Link Map

- src/guides/anna-maria-island-vs-longboat-key.html: /guides/family-vacation-anna-maria-island/, /stays/family-vacation-rentals-anna-maria-island/
- src/guides/anna-maria-island-vs-siesta-key.html: /guides/family-vacation-anna-maria-island/, /stays/anna-maria-island-vacation-rentals/
- src/guides/best-time-visit-anna-maria-island.html: /guides/family-vacation-anna-maria-island/, /stays/family-vacation-rentals-anna-maria-island/
- src/guides/holmes-beach.html: /guides/family-vacation-anna-maria-island/, /stays/family-vacation-rentals-anna-maria-island/

Anchors: "family vacations" (longboat-key, best-time), "best family beach destinations in Florida" (siesta-key), "family beach days" (holmes-beach). The stay link on each line is already in the file.

## Why This Batch

- what changed in the data: the 2026-10-04 attack-lane read found the family guide has the fewest links of the five priority guides and did not appear in the SERP read. `docs/status/next-batch.md` read `fresh but below threshold` on 2026-10-12; internal links are allowed under that status.
- why this cluster wins now: link work is the one move that needs no title, meta or new page, and the family guide already holds the FAQ and booking path that these four guides point families toward.
- what should explicitly wait: the title and meta rewrite for the family guide, new pages, and any refresh of the guide's `dateModified`.

## Experiment And Readback Contract

- hypothesis: four contextual links from related guides lift the family guide into the tracked results for "anna maria island family vacation" without moving the four donor guides.
- primary event: Search Console impressions and position for `/guides/family-vacation-anna-maria-island/`
- guardrail event: Search Console position for the four donor guides, and `guide_book_direct_click` on those guides; a donor guide that drops more than 1.5 positions means revert its link
- entry criteria: the family guide is indexable with a self canonical; the donor sentences already discuss families
- readback window: four weekly checks after deploy
- decision rule: keep if the family guide gains impressions or position and no donor guide drops; hold if flat; revert a donor link tied to a guardrail failure

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | anna maria island family vacation |
| Searcher intent | informational planning, family travel |
| Current Seascape URL | `/guides/family-vacation-anna-maria-island/` |
| SERP observed date | 2026-10-04 |
| SERP stale after | 2026-11-03 |
| Current proof | Attack-lane note of 2026-10-04: web search read of 9 results, US; the family guide was absent. Built-site link count 16, lowest of the five priority guides. Result order from web search is not a measured rank. |
| Top visible competitors | rental and realty sites with "family vacation" in the head of the title (see the 2026-10-04 note) |
| Competitor angle | competitors put "family vacation" in the title and hold more inbound links |
| Visual/format gap | none addressed; the guide layout is unchanged |
| Seascape gap | inbound link authority; the title gap is held until the gate opens |
| Search fit | the guide targets the query in its H1 and keywords, and its booking path leads to `/stays/family-vacation-rentals-anna-maria-island/` |
| Local/GBP proof | Not a GBP action. No local-pack read was made. |
| AEO/readback note | Not an AI-answer batch. The readback is Search Console position; AI citation reads stay with `seascape-analytics`. |
| Recommendation | add one contextual link in each of four donor guides; no other page change |
| Attack status | `completed` |
| Query variants inspected | anna maria island family vacation |
| SERP source | web search, US, observed 2026-10-04 (attack-lane note) and again 2026-10-12 (9 results; the Seascape family guide was not among them) |
| Competitor URLs inspected | https://www.islandreal.com/blog/family-fun-on-anna-maria-island/, https://flashpackingfamily.com/anna-maria-island/, https://www.silverresorts.com/blog/family-friendly-resorts-anna-maria-island (result titles and URLs read in the 2026-10-12 web search; pages not opened) |
| Content gap and Seascape answer | the gap is links and title; this batch fixes only links |
| Design/format strategy | unchanged; plain in-body links in existing sentences |
| Seascape proof available | yes; the family guide carries the FAQ and stay links |
| Tools/plugins used | built-site link count, source grep, web search read from the 2026-10-04 note |
| Decision and reason | ship the four links: they sit in sentences that already speak about families, and link work is allowed at `fresh but below threshold` |

## Cluster In Scope

- canonical winner URL(s): `/guides/family-vacation-anna-maria-island/`
- feeder pages: the four donor guides above
- aliases or retired URLs: none
- money destination: `/stays/family-vacation-rentals-anna-maria-island/` (through the family guide)
- active lane: direct-book stay intent

## Source And Proof Constraints

- property truth needed: none; no amenity or capacity claim is added
- owner proof asset needed: none
- claims that are off-limits: any new safety, price, distance or capacity claim
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: unchanged

## Page Builder Tasks

- source files likely to change: the four guide files in the link map
- redirect or schema work: none
- internal-link or CTA work: wrap existing words in one link per file; one anchor adds the word "beach days" or "vacations" in place of "families" or "family vacations"
- money CTA and downstream tracking event to verify: `guide_book_direct_click` unchanged

## Voice Editor Checklist

- tone risks: none added; anchors are plain nouns
- generic or mechanical patterns to kill: no "click here", no stuffed anchors
- proof or specificity checks: no new claim in any changed sentence
- customer wording kept where it sounds natural

## Release Gate Checklist

- routes to smoke test: the four donor guides and the family guide
- commands to run: npm run build && npm run lint:content && node --test scripts/enforcement/internal-link-floor.test.js && npm run verify:release -- --range origin/main
- regression risks to watch: full-page visual baselines on the four donor guides; guest CTA events must stay unchanged
- visual baseline note (2026-10-12): only `guide-ami-vs-siesta-key` changed on screen (one added in-body link), so only its desktop and mobile baselines were refreshed. The other visual routes passed unchanged.

## Done When

- the four links render in the built pages and the family guide has four more inbound body links
- content lint and the link-floor test pass on a fresh build

## Post-Reread Outcome

- reread window used: not yet read
- decision taken: not yet taken
- next branch slug or explicit wait state: wait for the weekly readback

## Not In Scope

- the family guide title and meta rewrite
- new guide pages
- any change to the family guide body
