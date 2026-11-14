# Old-design guide moves: Gate 0 receipts of merged batches

Dated evidence for the merged moves of `docs/briefs/2026-11-old-design-guide-moves.md`
(M1 in PR 955, M2 in PR 957). The brief holds the receipts of the batch in work.

## Receipt (M1 family guide)

M1 moves page source into front matter and a layout, so the gate reads it as a
search-facing source edit. The rendered title, meta description, canonical, H1
and JSON-LD are unchanged. This receipt records the check behind keeping them
unchanged.

| Field | Required answer |
| --- | --- |
| Target query family | family vacation anna maria island; anna maria island with kids |
| Searcher intent | Informational: planning a family beach trip (beaches, activities, where to stay) before choosing dates and a home |
| Current Seascape URL | https://seascape-vacations.com/guides/family-vacation-anna-maria-island/ |
| SERP observed date | 2026-11-14 |
| SERP stale after | 2026-12-14 |
| Current proof | 2026-11-14 web search for "family vacation anna maria island with kids guide" (US). It lists result pages and is not a rank read: no Seascape position is claimed. Family terms were saved to the local rank tracker on 2026-11-01; the next tracker read supplies positions |
| Top visible competitors | compasshotel.com (kids activity guide), islandreal.com (older kids), amilocals.com (things to do with kids), johnnyjet.com, flashpackingfamily.com, mummytravels.com, familytraveller.com, wander.com |
| Competitor angle | From result titles only: activity lists for kids ("5 Must-Do Activities To Do with Kids on Anna Maria Island", "5 Things To Do With Older Kids While Visiting Anna Maria Island") and family travel write-ups |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | None claimed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | The title already names the query ("Planning the Perfect Family Vacation to Anna Maria Island") and the page covers beaches, activities by age, restaurants and rentals; unchanged here |
| Local/GBP proof | Not applicable: layout-only move with no local-pack or Google Business change |
| AEO/readback note | Article, BreadcrumbList, FAQPage and LocalBusiness JSON-LD are byte-identical to main. Read tracker positions for the family terms before and about four weeks after publish |
| Recommendation | Keep title, meta, H1, body copy and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | family vacation anna maria island with kids guide |
| SERP source | Web search, observed 2026-11-14 (titles and URLs only) |
| Competitor URLs inspected | https://compasshotel.com/anna-maria-sound/local-guide/family-friendly-things-to-do-around-anna-maria-island/5-must-do-activities-to-do-with-kids-on-anna-maria-island; https://www.islandreal.com/blog/older-kids-visiting-anna-maria-island/ |
| Content gap and Seascape answer | Competitor titles are activity lists; Seascape's page already groups activities by age and adds beaches, safety and rentals. Unchanged here |
| Design/format strategy | Shared planning frame, type-led opening, one illustration; same words, numbered steps, rail and booking kit |
| Seascape proof available | Current source and the main-versus-head build diff |
| Tools/plugins used | Web search, node build diff, Playwright render |
| Decision and reason | Hold search-facing output unchanged: this is a layout move; ranking work waits for the tracker read and the SEO gate |

## Receipt (M2 beaches guide)

| Field | Required answer |
| --- | --- |
| Target query family | anna maria island beaches; best beaches anna maria island |
| Searcher intent | Informational: choosing which Anna Maria Island beach to visit |
| Current Seascape URL | https://seascape-vacations.com/guides/anna-maria-island-beaches/ |
| SERP observed date | 2026-11-14 |
| SERP stale after | 2026-12-14 |
| Current proof | 2026-11-14 web search for "best beaches Anna Maria Island guide" (US). It lists result pages and is not a rank read: no Seascape position is claimed |
| Top visible competitors | treksplorer.com, girlonazebra.com, blog.itrip.net, budgettravelbuff.com, tastesoflizzyt.com, planetware.com, getmyboat.com, kellystilwell.com |
| Competitor angle | From result titles only: numbered lists of beaches ("8 Stunning Beaches in Anna Maria Island", "Anna Maria Island Beaches Guide: Tour the Top 6 Spots") |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | None claimed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | The title names the query ("Ultimate Guide to Anna Maria Island Beaches (2026)") and the page covers each beach with facilities and parking; unchanged here |
| Local/GBP proof | Not applicable: layout-only move with no local-pack or Google Business change |
| AEO/readback note | The four JSON-LD blocks are byte-identical to main. Read tracker positions before and about four weeks after publish |
| Recommendation | Keep title, meta, H1, body copy and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | best beaches Anna Maria Island guide |
| SERP source | Web search, observed 2026-11-14 (titles and URLs only) |
| Competitor URLs inspected | https://www.treksplorer.com/best-beaches-anna-maria-island-fl-usa/; https://www.planetware.com/florida/best-beaches-on-anna-maria-island-us-fl-497.htm |
| Content gap and Seascape answer | Not assessed beyond titles; the page's content is unchanged here |
| Design/format strategy | Shared planning frame, type-led opening, no image; same words, numbered steps, rail and booking kit |
| Seascape proof available | Current source and the main-versus-head build diff |
| Tools/plugins used | Web search, node build diff, Playwright render |
| Decision and reason | Hold search-facing output unchanged: this is a layout move; ranking work waits for the tracker read and the SEO gate |

## Receipt (M2 restaurants guide)

| Field | Required answer |
| --- | --- |
| Target query family | best restaurants anna maria island; where to eat anna maria island |
| Searcher intent | Informational: choosing where to eat on or near Anna Maria Island |
| Current Seascape URL | https://seascape-vacations.com/guides/best-restaurants-anna-maria-island/ |
| SERP observed date | 2026-11-14 |
| SERP stale after | 2026-12-14 |
| Current proof | 2026-11-14 web search for "best restaurants Anna Maria Island" (US). It lists result pages and is not a rank read: no Seascape position is claimed |
| Top visible competitors | travelawaits.com, opentable, sarasotamagazine.com, boatsetter.com, blog.itrip.net, tastesoflizzyt.com, floridatrippers.com, girlonazebra.com, kellystilwell.com, islandreal.com |
| Competitor angle | From result titles only: numbered restaurant lists ("The 16 Best Anna Maria Island Restaurants and Why We Loved Them", "Our Favorite Island Restaurants (Top 13)") |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | None claimed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | The title names the query and the page groups restaurants by occasion with a comparison table; unchanged here |
| Local/GBP proof | Not applicable: layout-only move with no local-pack or Google Business change |
| AEO/readback note | The four JSON-LD blocks are byte-identical to main. Read tracker positions before and about four weeks after publish |
| Recommendation | Keep title, meta, H1, body copy and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | best restaurants Anna Maria Island |
| SERP source | Web search, observed 2026-11-14 (titles and URLs only) |
| Competitor URLs inspected | https://www.sarasotamagazine.com/eat-and-drink/best-restaurants-anna-maria-island; https://www.islandreal.com/blog/favorite-island-restaurants/ |
| Content gap and Seascape answer | Not assessed beyond titles; the page's content is unchanged here |
| Design/format strategy | Shared planning frame, type-led opening, no image; same words, numbered steps, rail and booking kit |
| Seascape proof available | Current source and the main-versus-head build diff |
| Tools/plugins used | Web search, node build diff, Playwright render |
| Decision and reason | Hold search-facing output unchanged: this is a layout move; ranking work waits for the tracker read and the SEO gate |

## Receipt (M2 fishing guide)

| Field | Required answer |
| --- | --- |
| Target query family | anna maria island fishing guide; fishing anna maria island |
| Searcher intent | Informational: planning fishing on a Gulf Coast trip (species, seasons, charters, piers, licence) |
| Current Seascape URL | https://seascape-vacations.com/guides/fishing-guide-anna-maria-sarasota/ |
| SERP observed date | 2026-11-14 |
| SERP stale after | 2026-12-14 |
| Current proof | 2026-11-14 web search for "Anna Maria Island fishing guide charters piers license" (US). It lists result pages and is not a rank read: no Seascape position is claimed |
| Top visible competitors | fishingbooker.com, guidesly.com, fishanywhere.com, captainexperiences.com, silverresorts.com, discoverbradenton.com, gis.myfwc.com |
| Competitor angle | From result titles only: charter listings and one long guide ("Anna Maria Island Fishing: The Complete Guide for 2025") |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | None claimed for the layout move; any content change belongs to a later copy-lane brief |
| Search fit | The title names the topic ("Complete Fishing Guide: Anna Maria Island, Bradenton & Sarasota") and the page covers inshore, offshore, pier, charter, season and licence sections; unchanged here |
| Local/GBP proof | Not applicable: layout-only move with no local-pack or Google Business change |
| AEO/readback note | The four JSON-LD blocks are byte-identical to main. Read tracker positions before and about four weeks after publish |
| Recommendation | Keep title, meta, H1, body copy and JSON-LD unchanged; ship the layout move |
| Attack status | completed |
| Query variants inspected | Anna Maria Island fishing guide charters piers license |
| SERP source | Web search, observed 2026-11-14 (titles and URLs only) |
| Competitor URLs inspected | https://fishingbooker.com/blog/anna-maria-island-fishing/; https://www.silverresorts.com/anna-maria-island-fishing-tips/ |
| Content gap and Seascape answer | Not assessed beyond titles; the page's content is unchanged here |
| Design/format strategy | Shared planning frame, type-led opening, no image; same words, numbered steps, rail and booking kit |
| Seascape proof available | Current source and the main-versus-head build diff |
| Tools/plugins used | Web search, node build diff, Playwright render |
| Decision and reason | Hold search-facing output unchanged: this is a layout move; ranking work waits for the tracker read and the SEO gate |
