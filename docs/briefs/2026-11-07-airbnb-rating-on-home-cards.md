# Brief: Airbnb rating on home cards

- lifecycle: active
- task scope: show each home's real Airbnb rating and review count beside each home name on the `/` and `/properties/` cards (Airbnb's own layout, "★ 5.0 (44)", with one "Ratings from Airbnb" label per list), and use the same rating for the star badges on `/stays/` cards; source is the dated snapshot `src/_data/airbnbRatings.json`
- completion or successor: ships with PR #892; the nightly snapshot refresh is a separate seascape-analytics task

## Content Gate Inputs

- persona: guest on a phone choosing between Seascape homes, who trusts the Airbnb score they already know
- primary keyword: none (trust signal on existing cards, not a search play)
- secondary keywords: none
- audience pattern: a guest compares homes by rating and review count before opening one, the way Airbnb's own cards work
- proof source: seascape-analytics market tracker, latest `market_listing_observations` read per Seascape listing on 2026-11-07 (GBrain fact #12579); Sawyer approved the label, rounding and "New" rule on 2026-11-07 (facts #12580, #12586)
- offer claim: n/a (guest lane; no owner-offer line)
- required internal links: /properties/, /guides/
- CTA target: unchanged
- anti-claims: no rating floor or inflation; round to one decimal only; always say Airbnb; homes under 3 Airbnb reviews show "New", never stars; no `aggregateRating` or review stars in structured data; no Hostaway rating mixed into the same surfaces
- hypothesis: a visible, sourced Airbnb rating on each card helps guests pick a home without leaving for Airbnb
- primary event: catalog_book_direct_click
- guardrail event: property_booking_page_click
- entry criteria: cards showed no rating, and `/stays/` badges used Hostaway's under-counted rating
- readback window: deploy preview of #892 against production, phone and desktop
- decision rule: ship only if every home's rating matches the snapshot after rounding and no raw two-decimal value reaches the page

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | none: on-card trust signal, titles and indexable copy unchanged |
| Searcher intent | stay / direct-book comparison |
| Current Seascape URL | /, /properties/, /stays/ |
| SERP observed date | 2026-11-07 |
| SERP stale after | 2026-11-14 |
| Current proof | Analytics read on 2026-11-07 of Seascape's own Airbnb listings: eight homes, 1 to 193 reviews each. |
| Top visible competitors | No competitor rewrite. Airbnb's own cards show a star rating on every listing card. |
| Competitor angle | Booking sites put the rating on the card photo or title line so it reads with its home. |
| Visual/format gap | Seascape cards had no rating. |
| Seascape gap | Guests had to leave the site to see the Airbnb score. |
| Search fit | No title, meta, URL or schema change. The visible rating is aria-hidden; a screen-reader sentence sits after each home's name. |
| Local/GBP proof | Not applicable: no local-pack or GBP claim. |
| AEO/readback note | No AI citation claim; ratings stay out of structured data. |
| Recommendation | Add the rating to existing cards only. |
| Attack status | none found after named checks |
| Query variants inspected | none: no search-facing copy changed |
| SERP source | Not a search batch; source is the analytics read on 2026-11-07. |
| Competitor URLs inspected | source check: live cards at https://seascape-vacations.com/ and https://seascape-vacations.com/properties/ on 2026-11-07; SERP check: no DataForSEO or public SERP action because no title, meta or indexable copy changed; competitor-page check: no competitor page rewrite, Airbnb card layout used only as the design reference |
| Content gap and Seascape answer | Cards lacked a rating; answer is the real Airbnb rating, labelled and dated in the data file. |
| Design/format strategy | Airbnb's card layout (Sawyer, 2026-11-08): rating right-aligned on the name line, no photo badge; one list label names Airbnb; existing tokens only. |
| Seascape proof available | `src/_data/airbnbRatings.json` with read time and source query. |
| Tools/plugins used | psql read of the analytics database; local build and Playwright checks. |
| Decision and reason | Ship on existing cards; Sawyer approved on 2026-11-07. |

## Done When

- every home card on `/` and `/properties/` shows the snapshot rating or "New", and `/stays/` stars match it
- `scripts/enforcement/airbnb-rating.test.js`, `unrated-home-stars.test.js` and `stay-rating.test.js` pass

## Not In Scope

- the nightly refresh of the snapshot (seascape-analytics task)
- review stars in search results
