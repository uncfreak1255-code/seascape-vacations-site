# Brief: Catalog filter empty state

- lifecycle: active
- task scope: repair the dated availability message and reset action on `/properties/`
- persona: guest who has entered dates and a group size and narrowed the catalog
- primary keyword: none. This is a booking-flow repair.
- secondary keywords: none
- audience pattern: a guest can read an area-specific result as a portfolio-wide result and stop looking
- proof source: the November 9, 2026 production check for May 4–8, 2027 and four guests showed zero results with Sarasota selected and five under All stays
- required internal links: /properties/sarasota-luxe/, /properties/coastal-stay/
- CTA target: the existing All stays filter on `/properties/`
- source files likely to change: `src/properties/index.njk`, `src/assets/js/catalog.js`, `src/assets/js/catalog-trip-text.js`
- anti-claims: no new availability guarantees, property claims, price claims, or search positioning

Use “No Sarasota homes are open for these dates.” when Sarasota returns zero confirmed matches. Other selected filters get “No homes match this filter for these dates.” Use “Show all stays” to reset the area while keeping the dates and guest count. Keep the existing calendar and checkout flow.

Verify the message, reset, retained URL selections, and checkout link with a controlled calendar response on desktop and mobile. Repeat the filtered and unfiltered production check after the approved release.
