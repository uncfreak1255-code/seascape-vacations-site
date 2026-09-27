# Brief: Snowbird winter booking refresh

## Content Gate Inputs

- persona: retiree or remote-working couple from the Midwest, Northeast, or Canada planning a one-to-three month Gulf Coast winter, often with family visiting.
- primary keyword: snowbird rentals Florida Gulf Coast
- secondary keywords: monthly winter rentals Bradenton, extended stay Anna Maria Island, snowbird monthly rentals
- audience pattern: plans in the fall for January to March, compares several monthly-rental sites, and needs to know how long a stay can be booked and how to get a quote.
- proof source: live direct-booking calendar read 2026-09-26 for January to March 2027 (five homes cap a single online booking at 24 to 35 nights, mostly 27; Pickleball Pool Home Retreat allows up to 365); `src/_data/properties-fallback.json` pool-heat terms ("pool heating costs extra" on most homes); `content-priorities-2026-10.md` item 1.
- required internal links: /stays/snowbird-rentals-florida-gulf-coast/, /stays/extended-stay-vacation-rentals-florida/
- CTA target: online booking for stays up to four weeks; phone 941-704-8545 or info@seascape-vacations.com for a month or longer.
- anti-claims: no claim that a full month books online on homes capped under 28 nights; no fixed monthly discount or rate; no claim that pool heat is included; no repeat-guest share or "most guests come back"; no statement that fall is too late to book; no on-island or beachfront promise.
- hypothesis: telling snowbirds exactly how long a stay books online and where to ask for a month turns winter research visits into quote requests instead of dead ends.
- primary event: `property_booking_page_click`
- guardrail event: `email_capture_submit`
- entry criteria: the snowbird guide was last modified 2026-03-03 and told readers fall booking is too late, while the October booking window for January to March is open.
- readback window: 14 days after production deployment
- decision rule: keep the refreshed copy if booking clicks from both pages hold or rise; if monthly quote requests arrive by phone or email, log them for the decision on online monthly stays.

## Gate 0 Search Block — snowbird winter booking

| Field | Answer |
| --- | --- |
| Target query family | snowbird rentals Florida, monthly winter rentals Anna Maria Island and Bradenton |
| Searcher intent | find a furnished home for one to three winter months and learn how to book it |
| Current Seascape URL | `/guides/snowbirds-guide-extended-stays-florida/`, `/stays/snowbird-rentals-florida-gulf-coast/` |
| SERP observed date | 2026-09-26 |
| SERP stale after | 2026-10-26 |
| Current proof | `content-priorities-2026-10.md` (2026-09-01) names both URLs indexed and the guide stale since 2026-03-03; direct-booking calendar read 2026-09-26 |
| Top visible competitors | islandreal.com/monthly-rentals, floridarentals.com Anna Maria Island and Bradenton monthly pages, annamaria.com monthly rentals, teamduncan.com/monthly-rentals, annamariaislandbeachrentals.com snowbird rentals |
| Competitor angle | competitors list monthly inventory with one-month minimums and utilities included, mostly on-island condos and cottages |
| Visual/format gap | Not applicable; existing guide and stays layouts are kept |
| Seascape gap | our pages promised online monthly booking the calendar does not allow on most homes, omitted the one home that takes long stays, and told readers fall is too late |
| Search fit | Seascape offers full private-pool homes on the mainland for families who want room for visitors; the conversion is an online booking up to four weeks or a phone or email quote for longer |
| Local/GBP proof | Not applicable because no local-profile or map-pack content changes |
| AEO/readback note | the FAQ answers now state the online stay length and the quote route in the first sentence or two, so they quote cleanly |
| Recommendation | refresh the two existing pages in place; no new monthly page |
| Attack status | none found after named checks |
| Query variants inspected | snowbird monthly rentals Anna Maria Island Bradenton winter 2027 |
| SERP source | web search results read 2026-09-26 |
| Competitor URLs inspected | source: live direct-booking calendar and repository property data read 2026-09-26; SERP: web search results read 2026-09-26; competitor-page: competitor URLs taken from those search results, pages not opened: islandreal.com/monthly-rentals, floridarentals.com/southwest/bradenton-vacation-rentals/monthly/, annamaria.com/vacation-rentals/anna-maria-monthly-rentals/ |
| Content gap and Seascape answer | say plainly how long a stay books online, which home takes longer stays, that pool heat is extra, and how to get a quote |
| Design/format strategy | text changes inside existing sections; add Pickleball Pool Home Retreat to the stays page list |
| Seascape proof available | live calendar read and property fallback data dated 2026-09-26 |
| Tools/plugins used | web search, direct-booking calendar read, repository build and content gates |
| Decision and reason | ship the refresh now because the January to March booking window is open this month |

## Page Builder Tasks

- source files likely to change:
  - `src/guides/snowbirds-guide-extended-stays-florida.html`
  - `src/_data/seoPages.json`
  - this brief

## Release Gate Checklist

- routes to smoke test: `/guides/snowbirds-guide-extended-stays-florida/`, `/stays/snowbird-rentals-florida-gulf-coast/`
- commands to run: `npm run lint:content`, `npm run build`, `npm run verify:release`
