# Brief: Owner market pages, guide internal links

- lifecycle: completed
- completion: source PR #654 merged as `aac361b8` (2026-10-02).
  The measurement contract below still needs its own readback; source
  completion does not prove deployment or owner demand.

Sawyer approved drafting this batch on 2026-10-02 in the project thread.

## Content Gate Inputs

- persona: a Bradenton, Sarasota or Anna Maria Island rental owner who reads a Seascape guest guide while researching the area and wants to know how Seascape would run their home.
- primary keyword: vacation rental management bradenton / sarasota / anna maria island
- secondary keywords: bradenton vacation rental management, sarasota vacation rental management, anna maria island vacation rental management
- audience pattern: the guest guides already rank at positions 4-12 and carry a small share of owner readers, but their only owner route is the header and footer link to `/property-management/`.
- proof source: OpenSEO saved-state reads on 2026-10-02 (rank tracker, mobile US, check of 2026-10-01; Search Console 2026-09-01 to 2026-09-29), built-site link count of 2026-10-02, and live WebSearch SERP read on 2026-10-02.
- offer claim: `seascape-hub/context/owner-offer.md` section 2, "Sets and adjusts the nightly rate per home" (best-time guide sentence only). The other sentences make no offer claim; they name the market page.
- required internal links: /property-management/vacation-rental-management-anna-maria-island/, /property-management/vacation-rental-management-bradenton/, /property-management/vacation-rental-management-sarasota/
- CTA target: unchanged on every guide (guest CTAs per `docs/portfolio/winner-guides.md`); the new links are plain contextual links to the market pages, whose own CTA is the revenue review.
- anti-claims: no claim that Seascape manages homes on Anna Maria Island or Siesta Key; no portfolio count; no fee, revenue or payout number; no vendor or software name; no change to guest CTAs, titles, descriptions, H1s or tracked guest events; no revival of the removed owner fee benchmark aside on the Bradenton vs Sarasota guide.

## Required Internal Link Map

- src/guides/bradenton-vs-sarasota.html: /property-management/vacation-rental-management-bradenton/, /property-management/vacation-rental-management-sarasota/
- src/guides/anna-maria-island-vs-siesta-key.html: /property-management/vacation-rental-management-anna-maria-island/, /property-management/vacation-rental-management-sarasota/
- src/guides/srq-airport-to-anna-maria-island.html: /property-management/vacation-rental-management-anna-maria-island/, /property-management/vacation-rental-management-bradenton/
- src/guides/best-time-visit-anna-maria-island.html: /property-management/vacation-rental-management-anna-maria-island/, /stays/anna-maria-island-vacation-rentals/

## Why This Batch

- what changed in the data: the OpenSEO rank tracker shows the three market pages unranked in the top 40 for their head terms ("vacation rental management sarasota" at #45). All `/property-management/` pages got 3 clicks from 1,293 impressions in Search Console for 2026-09-01 to 2026-09-29.
- why this cluster wins now: in the built site, each market page has only 7 to 9 inbound content links, against 18 for the fees page and a guide-family average of 6.78. The four best-ranking guides link to no market page. The internal-link analyzer names the same four guides as top donors. `docs/status/next-batch.md` says `blocked by freshness`, and `docs/status/search-growth-map.md` allows internal-link cleanup during a freshness block.
- what should explicitly wait: title and meta rewrites on owner pages (blocked by freshness), body rewrites of the market pages, a new owner module or tracked owner event inside guides, and the two-page Sarasota overlap (`airbnb-management-services-sarasota` vs `vacation-rental-management-sarasota`).

## Source Files Changed In This Batch

  - src/guides/bradenton-vs-sarasota.html
  - src/guides/anna-maria-island-vs-siesta-key.html
  - src/guides/srq-airport-to-anna-maria-island.html
  - src/guides/best-time-visit-anna-maria-island.html

## Experiment And Readback Contract

- hypothesis: contextual links from four ranking guides raise the market pages into the tracked top 40 for their head terms without moving the guides.
- primary event: OpenSEO rank tracker position for the three head terms, and Search Console impressions and position for the three market pages
- guardrail event: Search Console position for the four donor guides, and `guide_book_direct_click` on those guides; a donor guide that drops more than 1.5 positions means revert its link
- entry criteria: the three market pages are indexable with self canonicals (verified in the 2026-10-02 build); the donor guides rank at positions 4-12 in the 2026-10-01 tracker check
- readback window: four weekly tracker checks after deploy, compared against the 2026-10-01 check and the 2026-09-01 to 2026-09-29 Search Console window above
- decision rule: keep if any market page enters the top 40 for its head term and no donor guide drops; hold if positions stay flat; revert a donor link tied to a guardrail failure

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | vacation rental management in Bradenton, Sarasota and Anna Maria Island |
| Searcher intent | owner-management, commercial, comparing managers |
| Current Seascape URL | `/property-management/vacation-rental-management-bradenton/`, `/property-management/vacation-rental-management-sarasota/`, `/property-management/vacation-rental-management-anna-maria-island/` |
| SERP observed date | 2026-10-02 |
| SERP stale after | 2026-11-01 |
| Current proof | OpenSEO rank tracker check 2026-10-01: the three head terms are unranked in the top 40, "vacation rental management sarasota" #45. OpenSEO Search Console 2026-09-01 to 2026-09-29: market pages 0 clicks, Sarasota 131 impressions at 33.2, Bradenton 49 at 33.2, AMI 39 at 22.6. |
| Top visible competitors | iTrip, SkyRun, Awning, Renjoy, Casiola, Home Team Luxury Rentals, Anna Maria Vacations, FVH, Anna Maria Life Vacation Rentals, Anchor Down Management |
| Competitor angle | national manager chains hold most of the top 9 with one city page each; local AMI managers hold the island query with long-standing property-management pages |
| Visual/format gap | none addressed in this batch; the market pages keep their current layout |
| Seascape gap | link authority: the market pages are absent from the top 9 on all three queries and get few inbound content links |
| Search fit | the market pages already target the head terms in title and H1 and are the owner money destinations in `docs/portfolio/owner-acquisition.md`; the conversion stays on those pages |
| Local/GBP proof | Not a GBP action in this batch. The 2026-10-02 WebSearch read returned organic manager pages; no local-pack read was made, and GBP work stays out of scope. |
| AEO/readback note | Not an AI-answer batch. The readback is rank and Search Console position; AI citation reads stay with `seascape-analytics`. |
| Recommendation | add one contextual owner sentence with market-page links to each of the four donor guides; no other page change |
| Attack status | `completed` |
| Query variants inspected | anna maria island vacation rental management, bradenton vacation rental management, sarasota vacation rental management |
| SERP source | WebSearch, US, observed 2026-10-02; OpenSEO rank tracker, mobile US, check of 2026-10-01 |
| Competitor URLs inspected | https://www.itrip.net/property-management/sarasota-bradenton, https://skyrun.com/bradenton/management/, https://www.annamaria.com/property-management/ |
| Content gap and Seascape answer | competitors win on age and links, not on depth; the Seascape market pages already run 3,600 to 4,100 words, so the cheapest move is link authority from pages that already rank |
| Design/format strategy | unchanged; one plain paragraph in the existing article text, no new component |
| Seascape proof available | yes; the market pages carry the offer and proof, and these sentences make no new claim |
| Tools/plugins used | OpenSEO saved-state reads (rank tracker, Search Console), `.agents/skills/internal-link-targeting` analyzer, built-site grep, WebSearch |
| Decision and reason | ship the four links: the guides are the strongest pages on the site, they link to no market page, and link work is allowed under the freshness block |

## Release Gate Checklist

- routes to smoke test: the four donor guides and the three market pages
- commands to run: npm run lint:content && npm run build && npm test && npm run verify:release; npm run test:visual with regenerated baselines for the guide routes that carry full-page screenshots
- regression risks to watch: full-page visual baselines on `/guides/bradenton-vs-sarasota/`, `/guides/anna-maria-island-vs-siesta-key/`, `/guides/best-time-visit-anna-maria-island/` and `/guides/srq-airport-to-anna-maria-island/` grow by one paragraph; guest CTA events must stay unchanged
- baselines regenerated on 2026-10-02 by the `update-visual-baselines` workflow (run 37028891728, commit 659eb03): `guide-bradenton-vs-sarasota` and `guide-ami-vs-siesta-key`, desktop and mobile; the srq-airport and best-time guides carry no full-page baseline that changed
