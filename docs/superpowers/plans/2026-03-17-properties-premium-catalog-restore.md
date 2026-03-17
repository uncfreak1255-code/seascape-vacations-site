# Properties Premium Catalog Restore Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore `/properties/` to a premium card-led browsing page while keeping the stable build-time property dataset and public-render guarantees.

**Architecture:** Keep `src/properties/index.njk` as a standalone Eleventy page on the shared base layout, but replace the current utility-style structure with a premium catalog hero, filter pills, visual property cards, and a subordinate owner CTA. The route continues to render cards from `src/_data/properties.js` at build time, and recovery checks are expanded so engineering-language copy, compare-table utility blocks, or runtime render dependencies cannot silently return.

**Tech Stack:** Eleventy/Nunjucks, existing normalized property data, shared SVG icon partials, Node-based recovery verification

---

## Chunk 1: Lock the public-facing failure in tests

### Task 1: Add failing recovery assertions for the current `/properties/` utility page

**Files:**
- Modify: `scripts/recovery/assert-build-output.js`
- Verify: `_site/properties/index.html`

- [ ] **Step 1: Add assertions that the built `/properties/` page does not contain the current engineering-language copy**

Expected assertions should reject phrases such as:

```js
"rendered from one source of truth"
"Every home is rendered at build time"
"No client-side card injection"
"Use this table before opening detail pages"
```

- [ ] **Step 2: Add assertions that the built `/properties/` page does not contain the utility-only layout sections**

Expected assertions should reject route markers such as:

```js
"collection-strip"
"compare-table"
"decision-panel"
```

- [ ] **Step 3: Run the route gate to verify the new assertions fail before implementation**

Run:

```bash
npm run build
npm run verify:recovery:p0
```

Expected:
- `npm run build` succeeds
- `npm run verify:recovery:p0` fails on the new `/properties/` assertions

- [ ] **Step 4: Commit the failing-test checkpoint**

```bash
git add scripts/recovery/assert-build-output.js
git commit -m "test: capture properties premium catalog regression"
```

## Chunk 2: Rebuild `/properties/` around the premium catalog layout

### Task 2: Restore the hero and top-level page rhythm

**Files:**
- Modify: `src/properties/index.njk`
- Reference: `src/_includes/layouts/base.njk`

- [ ] **Step 1: Replace the current engineering hero with a guest-facing premium catalog hero**

The hero should include:

```njk
- premium headline
- short guest-facing supporting copy
- 2-3 trust/highlight blocks
```

It must not include:

```text
source of truth
build time
normalized dataset
runtime fetch
```

- [ ] **Step 2: Remove the utility collection strip and implementation note block**

Delete the current sections built around:

```text
collection-strip
collection-note
```

- [ ] **Step 3: Run a local build to confirm the route still renders**

Run:

```bash
npm run build
```

Expected:
- build succeeds
- `_site/properties/index.html` exists

### Task 3: Restore filter pills and premium card-led browsing

**Files:**
- Modify: `src/properties/index.njk`
- Reference: `src/_includes/partials/property-card-image.njk`
- Reference: `src/_data/properties.js`

- [ ] **Step 1: Replace the current collection-grid/property-collection-card treatment with the premium catalog grid**

The new markup should restore:

```njk
- filter pill row
- image-led catalog cards
- trimmed description
- 2-3 highlight tags
- direct booking CTA
- property detail CTA
```

- [ ] **Step 2: Keep card data entirely build-time**

Each card must render from `properties` using fields already present in the normalized dataset:

```njk
property.name
property.city
property.specs
property.description
property.highlights
property.price
property.bookingUrl
property.pageUrl
property.image
```

- [ ] **Step 3: Keep client-side JS limited to filtering visible cards**

Allowed:

```js
toggle hidden/visible state on pre-rendered cards
```

Forbidden:

```js
fetch property data
build cards in the browser
call Hostaway or Netlify property endpoints
```

- [ ] **Step 4: Run a build and inspect the generated HTML for card presence**

Run:

```bash
npm run build
rg -n "catalog-card|Book direct|View property" _site/properties/index.html
```

Expected:
- build succeeds
- card markup is present in built HTML

### Task 4: Replace the rating badge with the shared SVG treatment and tighten mobile polish

**Files:**
- Modify: `src/properties/index.njk`
- Reference: `src/_includes/partials/ui-icon.njk`

- [ ] **Step 1: Swap the text-star rating pill for an SVG-based rating badge**

Preferred pattern:

```njk
<span class="catalog-pill catalog-rating">{{ uiIcon('star', '...') }} <span>{{ property.rating }}</span></span>
```

- [ ] **Step 2: Tighten mobile spacing and CTA wrapping without changing accepted pages**

Focus only on `/properties/` mobile behavior:

```css
- filter wrap spacing
- card footer stacking
- CTA spacing
- image ratio stability
```

- [ ] **Step 3: Keep image treatment intentional before full load**

Preserve:

```text
responsive sizes
Hostaway CDN normalized URLs
clear fallback background treatment
```

- [ ] **Step 4: Commit the route restore**

```bash
git add src/properties/index.njk
git commit -m "feat: restore premium properties catalog"
```

## Chunk 3: Remove utility sections and restore the correct bottom-of-page CTA

### Task 5: Replace the compare-table/decision-panel utility flow with a subordinate owner CTA

**Files:**
- Modify: `src/properties/index.njk`

- [ ] **Step 1: Delete the compare table section entirely**

Remove markup and styles associated with:

```text
compare-table-wrap
compare-table
```

- [ ] **Step 2: Delete the decision panel section entirely**

Remove markup and styles associated with:

```text
decision-panel
decision-card
cta-panel
decision-list
```

- [ ] **Step 3: Keep one owner CTA below the catalog grid**

The CTA should:

```text
reinforce professionalism
link to /property-management/
stay visually subordinate to the property cards
```

- [ ] **Step 4: Rebuild and verify the removed sections are gone**

Run:

```bash
npm run build
rg -n "compare-table|decision-panel|rendered from one source of truth|Every home is rendered at build time" _site/properties/index.html
```

Expected:
- build succeeds
- `rg` returns no matches

## Chunk 4: Verification and route review gate

### Task 6: Run the full route verification sequence

**Files:**
- Verify only

- [ ] **Step 1: Run unit and recovery checks sequentially**

Run:

```bash
npm test
npm run build
npm run verify:recovery:p0
npm run verify:recovery:guides
npm run verify:recovery:remediation
```

Expected:
- all commands pass

- [ ] **Step 2: Run a direct HTML sweep for forbidden route regressions**

Run:

```bash
rg -n "showPage\\(|page-home|collection-strip|compare-table|decision-panel|source of truth|No client-side card injection" _site/properties/index.html
```

Expected:
- no matches

- [ ] **Step 3: Open only the `/properties/` route for visual review**

Review URL:

```text
http://127.0.0.1:<fresh-port>/properties/
```

Confirm:

```text
- premium hero is back
- filter pills work
- cards feel like the earlier preferred design
- SVG rating badge looks professional
- direct booking CTA and detail CTA are both clear
- owner CTA is present but not overpowering
- mobile layout is clean
```

- [ ] **Step 4: Stop before any PR or broader cleanup**

Do not touch:

```text
homepage
Anna Maria stay page
Dockside Dreams
```

Do not continue to PR work until the user has reviewed `/properties/`.

Plan complete and saved to `docs/superpowers/plans/2026-03-17-properties-premium-catalog-restore.md`. Ready to execute.
