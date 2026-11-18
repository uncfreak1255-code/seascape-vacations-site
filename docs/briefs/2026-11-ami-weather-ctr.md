# Brief: AMI weather guide snippet CTR repair

- lifecycle: active
- task scope: rewrite title and meta description on `/guides/anna-maria-island-weather/` to improve CTR for month-by-month weather, water temps, and milder months. OG/Twitter mirrors only besides title/meta. No homepage, H1, body, table, plots, FAQ, or dateModified change. Do not steal the #985 May-or-November best-time snippet.
- completion or successor: not complete until this title/meta repair merges.

## Content Gate Inputs

- persona: a traveler checking Anna Maria Island weather by month, including water temperature and which months are milder, before choosing dates
- primary keyword: anna maria island weather by month
- secondary keywords: anna maria island water temperature; anna maria island weather; best months anna maria island weather
- audience pattern: clicks a snippet that names monthly air, rain, and Gulf water; bounces if the snippet only restates "temps and rain" without a month pattern
- proof source: the live weather guide table and quick answer (NOAA 1991–2020 normals, station USW00012871; Port Manatee water proxy 8726384); Search Console task evidence 9,109 impressions / 17 clicks / 0.2% CTR in 28 days; #985 owns the best-time month answer
- required internal links: /guides/best-time-visit-anna-maria-island/, /stays/anna-maria-island-vacation-rentals/
- CTA target: existing stay collection and `guide_book_direct_click` links; no CTA change
- anti-claims: no on-island Seascape home; no May-or-November "best time" steal from `/guides/best-time-visit-anna-maria-island/`; no unverifiable crowd, price, or "best beach weather" guarantee; no fee-range; no invented water-temp station
- hypothesis: a snippet that names NOAA monthly air, rain, water, and the milder Nov–April window earns more clicks at similar position; ranking or booking lift is unproven
- primary event: Search Console clicks for weather-by-month queries on this URL
- guardrail event: average position for those queries and `guide_book_direct_click` on this route
- entry criteria: Gate 0 filled; content gate passed; `npm run lint:content` and `npm run build` green
- readback window: first 7 complete days after production publish, then the 28-day settle window in `docs/status/page-ledger.json`
- decision rule: keep if CTR rises without position worsening by more than 5 places over 7 complete days; revert the title/meta if position drops out of the top 3 or CTR stays at 0.2% with impressions still flowing; no booking lift is claimed

## Why This Batch

- What changed: this URL drew 9,109 impressions and 17 clicks in 28 days (0.2% CTR). The live title is "Anna Maria Island Weather by Month (Temps & Rain)". The page already answers water temps and milder vs wetter months.
- Why now: existing-page snippet repair, not expansion. Sawyer directed the CTR rewrite and said to stay consistent with #985's best-time angle without duplicating it.
- What waits: body, plots, FAQ, dateModified, homepage, and any ranking or booking claim.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | anna maria island weather by month |
| Searcher intent | Guide/research: compare monthly air, rain, and water before picking dates |
| Current Seascape URL | `/guides/anna-maria-island-weather/` |
| SERP observed date | 2026-11-18 |
| SERP stale after | 2026-11-25 |
| Current proof | Task evidence: 9,109 impressions / 17 clicks / 0.2% CTR in 28 days. Live title still says Temps & Rain. Page already publishes NOAA highs, rain days, and the Port Manatee water proxy. |
| Top visible competitors | Seascape's current weather URL (already visible); anna-maria-island.org weather and best-time; annamariaisland.com weather and tides; AMI Explorer when-to-visit weather and water by month; Anna Maria Island Beach Rentals weather table |
| Competitor angle | Month tables plus a milder-vs-wet season answer; several also name water temperature or "best time" |
| Visual/format gap | Seascape already has the monthly table and plots. No layout change. The gap is the snippet, not the page body. |
| Seascape gap | The ranking title hides water temperature and the milder-month window. Competitors' titles mention best time or water by month. |
| Search fit | Keep this URL. It already ranks and holds the NOAA table. Conversion stays on existing stay links. Best-time month selection stays on `/guides/best-time-visit-anna-maria-island/` (#985). |
| Local/GBP proof | Not a map-pack or GBP action. Climate facts come from the named NOAA stations already on the page. |
| AEO/readback note | No ChatGPT citation is claimed for this URL. The repair is snippet CTR, not AI-visibility lift. |
| Recommendation | Rewrite title and meta description (and OG/Twitter mirrors) only. |
| Attack status | completed |
| Query variants inspected | anna maria island weather by month; anna maria island weather; anna maria island water temperature |
| SERP source | Public web search results on 2026-11-18; no paid OpenSEO lookup |
| Competitor URLs inspected | https://seascape-vacations.com/guides/anna-maria-island-weather/ ; https://anna-maria-island.org/weather/ ; https://annamariaisland.com/planning-your-trip/weather ; https://www.amiexplorer.com/plan/when ; https://annamariaislandbeachrentals.com/weather |
| Content gap and Seascape answer | Name monthly air, rain, Gulf water, milder Nov–April, and summer-warmest water. State that Seascape homes sit on mainland Bradenton. |
| Design/format strategy | No layout, CSS, H1, table, or plot change. |
| Seascape proof available | Existing NOAA table and quick answer on this page; property catalog for mainland Bradenton homes |
| Tools/plugins used | Repo source, public web search, content gate. No paid lookup. No Hostaway write. |
| Decision and reason | Repair the ranking snippet on the existing weather URL. Do not change the homepage or the best-time guide. |

## Cluster In Scope

- canonical winner URL: `/guides/anna-maria-island-weather/`
- feeder pages: none changed
- money destination: `/stays/anna-maria-island-vacation-rentals/`
- active lane: comparison guides feeding direct-book stay intent

## Source Files Changed

- `src/guides/anna-maria-island-weather.html`
- `docs/status/page-ledger.json`
- `tests/visual/search-content-rescue.spec.js`
- `scripts/enforcement/ami-weather-ctr.test.js`

## Not In Scope

- homepage (`src/index.njk` must stay untouched)
- H1, body, FAQ, plots, table, `dateModified`
- `/guides/best-time-visit-anna-maria-island/` (#985 May or November)
