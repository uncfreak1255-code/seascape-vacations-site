# Properties Premium Catalog Restore Design

## Problem

`/properties/` is stable now, but the route overcorrected into an architecture explainer. The current page reads like an internal reliability document instead of a premium browsing surface for guests and prospective owners.

That is the wrong trade:

- the route is safer
- the visual experience is weaker
- the copy explains implementation details instead of selling the inventory

The homepage, Anna Maria stay page, and Dockside Dreams page already meet the current bar and should not be changed as part of this work.

## Approved Direction

Rebuild `/properties/` around the older premium catalog feel while keeping the new build-time rendering model underneath it.

The restored route should:

- feel like a luxury inventory page again
- render from the normalized `properties` dataset at build time
- avoid runtime PMS fetches and client-side card injection
- keep direct booking and property-detail handoff clear
- remove the compare-table-heavy utility feel and engineering explainer copy

## Scope

### In scope

- `src/properties/index.njk`
- `/properties/` visual structure, copy, spacing, and responsive behavior
- SVG rating badge treatment on cards
- stable image treatment for catalog cards
- route-level verification for `/properties/`

### Out of scope

- homepage changes
- Anna Maria stay page changes
- Dockside Dreams changes
- quick view modal resurrection
- runtime PMS/API fetches for public card rendering
- broader site-wide symbol cleanup beyond what is already done

## Design

### Page job

`/properties/` should act as a premium catalog page, not a diagnostic page.

The route should help a guest:

1. understand the collection quickly
2. filter to the right type of stay
3. compare visually through large cards
4. choose between direct booking or opening the full property page

It should also continue to signal professionalism to prospective owners without turning the page into a management landing page.

### Page structure

Keep the standalone Eleventy page and shared base layout, but restore the older premium catalog rhythm:

1. hero
2. filter pills
3. large visual property card grid
4. owner CTA

Remove:

- engineering explainer hero copy
- collection strip with implementation-focused stats
- compare table section
- decision/utility panel copy

### Hero

Use a strong catalog hero similar to the earlier premium version:

- premium headline
- short guest-facing supporting copy
- supporting highlights that reinforce direct booking, inventory quality, and trust

The hero copy must not mention:

- source of truth
- build-time rendering
- normalized datasets
- runtime fetches

Those are implementation details, not public-facing value.

### Filter pills

Keep lightweight client-side filtering because it does not control whether cards exist; it only filters already-rendered build-time HTML.

Recommended filters:

- All stays
- Waterfront
- Private pool
- Hot tub
- Pet friendly
- Bradenton
- Sarasota

This preserves the older browsing feel without reintroducing unstable render paths.

### Property cards

Cards should return to the premium visual format:

- large image-led cards
- visible title hierarchy
- short meta/spec line
- trimmed property description
- 2-3 high-signal highlights
- direct booking CTA
- property detail CTA

Each card must be rendered at build time from `properties`.

### Rating treatment

Replace the text-star rating badge treatment with a local SVG-based rating badge that fits the existing visual language.

The badge should remain compact and premium, not gamified.

### Image treatment

Keep the stable image pipeline already in place:

- normalized Hostaway CDN URLs from `src/_data/properties.js`
- responsive image sizes
- eager loading only where appropriate
- graceful card backgrounds when images load slowly

The page should look intentional before every image finishes loading.

### Owner CTA

Keep one clear owner CTA below the catalog grid.

Its job is to reinforce professionalism and route high-intent owners to `/property-management/` without overpowering the guest browsing flow.

### Mobile behavior

Polish mobile behavior while preserving the premium layout:

- maintain readable card hierarchy
- prevent CTA crowding
- keep filters usable without turning the page into a long utility dashboard
- preserve stable image ratios

## Data and Rendering Rules

- Use `src/_data/properties.js` as the only data source for the card grid.
- Render all property cards into HTML at build time.
- Client-side JS may filter visible cards, but it must not create the cards.
- Do not call Hostaway or any public PMS endpoint from `/properties/` at render time.
- Do not reintroduce the old route shell, hidden page sections, or `showPage()` logic.

## Verification Rules

The `/properties/` route is reviewable only if all of these are true:

- cards are present in built HTML
- filters work on existing DOM only
- no SPA shell markers appear in output
- no runtime card-render dependency exists
- the page visually matches the premium catalog intent better than the current utility version

## Review Checklist

Before this route goes back to user review:

- hero reads like a premium guest-facing collection page
- filter pills work
- cards feel visually closer to the preferred earlier experience
- direct booking CTA and detail CTA both remain clear
- owner CTA stays present but subordinate
- mobile spacing is clean
- no engineering-language copy remains on the page
