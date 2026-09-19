# Brief: Shelling guide CTR correction

## Content Gate Inputs

- persona: trip planner deciding which Anna Maria Island beach to shell and when
- primary keyword: anna maria island shelling
- secondary keywords: shelling on anna maria island, anna maria island seashells, anna maria island shells
- audience pattern: query names the island; the page ranks for island queries but its meta title led with "Florida"
- proof source: GSC 2026-08-18 to 2026-09-15, page `/guides/shelling-guide-florida/`: 30 clicks, 2,136 impressions, 1.4% CTR, average position 7.3. Its own query rows are island-led: "anna maria island shelling" 99 impressions at position 2.6, "shelling on anna maria island" position 2.6, "anna maria island seashells", "anna maria island shells".
- offer claim: n/a (guest lane)
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/
- CTA target: unchanged (`Compare AMI-Area Stays`, per `docs/portfolio/winner-guides.md`)
- anti-claims: do not claim Florida-wide shelling authority; the page covers Bean Point, Coquina Beach, Manatee Public Beach and day trips to Point of Rocks and Caspersen, and contains zero coverage of Sanibel, Captiva, Caladesi or Marco Island

## Why This Batch

- what changed in the data: the meta title was `Florida Shelling Guide - Best Beaches for Shells Near AMI`, leading with the wrong entity and demoting the island to an abbreviation, while every query the page earns clicks on names Anna Maria Island. The page H1 (`guideTitle`) was already correct.
- why this cluster wins now: the page sits at a winnable position on island queries with the best CTR of the winner guides, so entity alignment in the title is the cheapest available CTR move. No content change is required.
- what should explicitly wait: "best beach to find shells in florida" (3,600 monthly volume, Seascape around position 33, verified absent from the top 14 on 2026-09-18). Chasing it needs Florida-wide content the page does not have, and putting a Florida-wide claim in the title would fail the credibility gate. Deferred deliberately, not overlooked.

## Source Files Changed In This Batch

  - src/guides/shelling-guide-florida.html

## Experiment And Readback Contract

- hypothesis: aligning the meta title with the island entity the page already ranks for raises CTR on island shelling queries without moving position.
- primary event: GSC CTR for `/guides/shelling-guide-florida/` on island shelling queries
- guardrail event: average position for the same page; a drop of more than 1.5 positions means revert
- entry criteria: page already indexed and ranking on island queries (verified)
- readback window: 28 days after deploy, compared against the 2026-08-18 to 2026-09-15 baseline recorded above
- decision rule: keep if CTR rises and position holds; revert if position drops more than 1.5 or CTR falls

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Anna Maria Island shelling |
| Searcher intent | informational, trip planning, pre-booking |
| Current Seascape URL | `/guides/shelling-guide-florida/` |
| SERP observed date | 2026-09-18 |
| SERP stale after | 2026-10-18 |
| Current proof | GSC figures above; live SERP for "anna maria island shelling" places Seascape at merged rank 6 |
| Top visible competitors | beachhouseami.com (2), annamaria.com (5), aparadiserentals.com (7), annamariaislandbeachrentals.com (8), tropicalbreezebeachclub.com (10) |
| Competitor angle | every competing title leads with the island entity and most frame it as a question or an "ultimate guide" |
| Visual/format gap | none; the page already has 10 sections, a beach-by-beach breakdown, a shell index, timing guidance, an FAQ and sources |
| Seascape gap | meta title entity mismatch only |
| Search fit | yes; existing ranking page, no new page |
| Local/GBP proof | Not a GBP or local-pack action. The query set is informational shelling intent served by an organic guide, and the live SERP for it shows an AI Overview and organic results rather than a local pack. |
| AEO/readback note | an AI Overview occupies rank 1 on this query, so title work cannot recover the displaced share; the CTR gain is limited to the organic block |
| Recommendation | retitle only; do not expand the page and do not chase the Florida-wide term |
| Attack status | `completed` |
| Query variants inspected | anna maria island shelling, shelling on anna maria island, anna maria island seashells, anna maria island shells, best beach to find shells in florida |
| SERP source | OpenSEO MCP live Google SERP via DataForSEO, location 2840, observed 2026-09-18 |
| Competitor URLs inspected | https://www.beachhouseami.com/a-complete-guide-to-shelling-on-anna-maria-island/ (rank 2), https://www.annamaria.com/news-and-blog/shelling-the-perfect-pastime-on-anna-maria-island/ (rank 5) |
| Content gap and Seascape answer | no content gap found against the ranking set; Seascape already carries live Manatee County collecting rules and tide guidance that most competitors omit |
| Design/format strategy | unchanged |
| Seascape proof available | yes; first-hand beach access notes and the county rule citation already on the page |
| Tools/plugins used | OpenSEO MCP (GSC page and query reads, live SERP), repo grep against `src/` |
| Decision and reason | ship the retitle: the page earns island queries but was titled for Florida, and the H1 already used the island framing |

## Source files likely to change

  - `src/guides/shelling-guide-florida.html`
