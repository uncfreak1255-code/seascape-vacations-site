# Properties Route Stabilization Design

## Problem

`/properties/` is not a standalone page. It currently ships a copied single-page app shell that includes hidden homepage, property-detail, blog, and owner surfaces plus a route-local JS runtime. That architecture makes review unreliable because unrelated shell state can affect what the route renders.

## Approved Direction

Replace `src/properties/index.njk` with a real standalone Eleventy page that uses the shared base layout and renders its property cards at build time from the normalized `properties` dataset. The route should link to canonical property detail pages and should not depend on `showPage()` or any runtime card renderer.

## Design

### Page structure

- Use `layouts/base.njk` for shared head, nav, and footer structure.
- Keep the existing Seascape visual language: cream background, teal/gold accents, serif headings, and card-based property grid.
- Add a real hero, filter summary, property comparison table, and direct links to detail pages.

### Data source

- Use Eleventy global data from `src/_data/properties.js`.
- Render cards from the normalized cache/fallback dataset at build time.
- Do not fetch PMS data at page render time.

### Stability rules

- `/properties/` must not contain SPA shell markers like `id="page-home"` or `showPage(`.
- `/properties/` must not depend on client-side card injection for the main listing grid.
- Release/recovery checks must fail if the built HTML reintroduces the old shell markers.

### Review gate impact

- A fresh build must produce a clean standalone `/properties/` route before user review.
- The route should be inspectable with plain HTML output and should not depend on hidden shell pages to appear correct.
