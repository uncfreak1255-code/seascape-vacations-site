# Brief: Booking box on three high-traffic guides

## Content Gate Inputs

- persona: traveler planning an Anna Maria Island area trip who lands on a weather, airport, or shelling guide while picking dates and logistics.
- primary keyword: anna maria island weather by month
- secondary keywords: sarasota airport to anna maria island, anna maria island shelling
- audience pattern: arrives from Google with a planning question, reads the answer, and has no Seascape stay option in front of them before leaving.
- proof source: OpenSEO Search Console read 2026-09-26 for the last 3 months (weather 23,187 impressions / 102 clicks; airport 16,101 / 79; shelling 10,441 / 110); `src/_data/properties-fallback.json` pool-heat terms ("pool heating costs extra" on most homes); Seascape homes are in Bradenton and Sarasota, not on the island, per the existing AMI vs Siesta Key guide copy.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/
- CTA target: the shared guide conversion box (stay links, booking-engine handoff, direct-booking email list with the SAVE50 return state).
- anti-claims: no island, beachfront, or walk-to-beach promise; no drive-time number; no weather promise; no fixed savings figure or percentage; no claim that pool heat is included.
- hypothesis: guide readers who see matched stay links and the email list next to the answer they came for click into stays or join the list more often than readers who reach the end with a single generic button or none.
- primary event: `guide_stay_click`
- guardrail event: `email_capture_submit`
- entry criteria: the three guides carry about 50,000 impressions over 3 months but, unlike the best-time and AMI vs Siesta Key guides, have no shared conversion box.
- readback window: 28 days after production deployment
- decision rule: keep the box when `guide_stay_click` or `email_capture_submit` from these three routes rises and organic clicks do not fall; remove it from a route whose organic clicks drop while events stay flat.

## Gate 0 Search Block — top guide booking box

| Field | Answer |
| --- | --- |
| Target query family | Anna Maria Island weather by month, Sarasota airport to Anna Maria Island, Anna Maria Island shelling |
| Searcher intent | plan dates, arrival, and beach mornings for an Anna Maria Island area trip |
| Current Seascape URL | `/guides/anna-maria-island-weather/`, `/guides/srq-airport-to-anna-maria-island/`, `/guides/shelling-guide-florida/` |
| SERP observed date | 2026-09-26 |
| SERP stale after | 2026-10-26 |
| Current proof | OpenSEO Search Console read 2026-09-26: the three URLs rank at average positions 6.8 to 8.0 with about 50,000 impressions over 3 months |
| Top visible competitors | weatherspark.com, annamaria.com weather guide, rome2rio.com, amitransportation.com, annamariaislandbeachrentals.com shelling guide, islandreal.com shelling post |
| Competitor angle | rental-company competitors place listings or quote forms beside the same planning answers |
| Visual/format gap | the three guides end with a single button or none; the shared conversion box already runs on the best-time and AMI vs Siesta Key guides |
| Seascape gap | readers finish the planning answer with no matched stay option or email list |
| Search fit | the answer stays first; the box sits after it and before the FAQ or closing links |
| Local/GBP proof | Not applicable because no local-profile or map-pack content changes |
| AEO/readback note | titles, descriptions, headings, and answer blocks are unchanged, so quoted answers stay the same |
| Recommendation | add the shared conversion box to the three guides; leave titles and descriptions alone until the PR #606 readback closes |
| Attack status | none found after named checks |
| Query variants inspected | anna maria island weather by month; sarasota airport to anna maria island; anna maria island shelling |
| SERP source | web search results read 2026-09-26 |
| Competitor URLs inspected | source: OpenSEO Search Console and repository guide source read 2026-09-26; SERP: web search results read 2026-09-26; competitor-page: competitor URLs taken from those search results, pages not opened: weatherspark.com/y/16814, rome2rio.com/s/Sarasota-Bradenton-Airport-SRQ/Anna-Maria-Island, annamariaislandbeachrentals.com/blog/anna-maria-island-shelling |
| Content gap and Seascape answer | put matched Bradenton stay links, the booking-engine handoff, and the email list next to each planning answer, and say plainly that the homes are on the mainland |
| Design/format strategy | reuse `partials/guide-conversion-kit.njk` unchanged; no new component or style |
| Seascape proof available | Search Console read and property fallback data dated 2026-09-26 |
| Tools/plugins used | OpenSEO local Search Console read, web search, repository build and content gates |
| Decision and reason | ship now; titles on these routes are in the PR #606 measurement window until about 2026-10-21, and this change leaves every snippet as it is |

## Page Builder Tasks

- source files likely to change:
  - `src/guides/anna-maria-island-weather.html`
  - `src/guides/srq-airport-to-anna-maria-island.html` (also moves to the shared analytics include)
  - `src/guides/shelling-guide-florida.html`
  - `scripts/enforcement/guide-conversion.test.js`
  - this brief

## Release Gate Checklist

- routes to smoke test: the three guide URLs above.
- commands to run: `node --test scripts/enforcement/guide-conversion.test.js`, `npm run lint:content`, `npm run build`, `npm run verify:release`.
