# Homepage, Stay, And Property Icon/Link Cleanup Design

Date: 2026-03-17
Branch: `codex/stability-phase1`
Status: Draft approved in chat, written for implementation review

## Goal

Remove visibly broken or low-trust UI elements from the homepage, stay pages, and property pages without changing the overall Seascape design language.

This cleanup is intentionally narrow. It does not redesign the site. It removes bad proof, emoji-based presentation, and stale related links that make the site look unstable.

## Approved Scope

### Homepage

- Replace the homepage stat strip with fixed curated values:
  - `4.98` Airbnb Rating
  - `650+` 5-Star Reviews
  - `10-15%` Book Direct Savings
  - `24/7` Local Support
- Remove homepage emoji contact markers in footer/contact surfaces.
- Replace those markers with one local SVG icon set.

### Stay Pages

- Remove the `✍️` emoji from the author line.
- Remove `⭐` badge formatting from featured property cards.
- Keep star ratings as SVG stars only where visual star treatment is still needed.

### Property Pages

- Replace emoji-based quick stats, amenity icons, section-header icons, and footer contact icons with the same shared local SVG/icon pattern.
- Remove emoji from related-card titles such as `📍 Bradenton Area Guide`.

### Related Links

- Replace stale or dead property-page related links with verified live routes only.
- Known risky examples to remove or replace:
  - `/stays/img-academy-vacation-rentals-bradenton/`
  - `/stays/coquina-beach-vacation-rentals/`
  - `/stays/vacation-rentals-with-heated-pool/`
  - `.html` guide links embedded in related cards

## Non-Goals

- No homepage redesign.
- No new PMS or booking-engine architecture work in this pass.
- No full property-page templating refactor in this pass.
- No copy rewrite beyond what is necessary to remove broken/stale elements.

## Why This Approach

The current defects come from two different sources:

1. Shared-template surfaces:
   - homepage
   - shared footer/contact patterns
   - stay template card/title/byline behavior

2. Hardcoded property pages:
   - five property detail pages under `src/properties/*/index.html`

Trying to fully refactor all property pages into one new template inside this pass adds unnecessary risk. The safer approach is:

- fix shared surfaces once where possible
- patch the five hardcoded property pages surgically
- standardize icons with one shared local SVG pattern

This removes the visible defects without reopening the broader architecture during stabilization.

## Source Surfaces

### Shared sources

- Homepage: [src/index.njk](/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/index.njk)
- Stay template: [src/stays/stays.njk](/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/stays/stays.njk)
- Shared base layout: [src/_includes/layouts/base.njk](/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/_includes/layouts/base.njk)

### Hardcoded property pages

- [src/properties/bradenton-pool-home/index.html](/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/bradenton-pool-home/index.html)
- [src/properties/dockside-dreams/index.html](/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/dockside-dreams/index.html)
- [src/properties/river-house/index.html](/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/river-house/index.html)
- [src/properties/sarasota-luxe/index.html](/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/sarasota-luxe/index.html)
- [src/properties/the-oasis/index.html](/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/the-oasis/index.html)

## Design Decisions

### 1. Trust Strip Uses Fixed Proof, Not Animated Or Derived Data

The homepage stat strip will use fixed rendered values, not counters derived from runtime code.

Reason:

- the previous strip already drifted into broken output
- trust metrics should not depend on fragile JS display logic
- these values are primarily proof copy, not interactive data

### 2. One Local SVG Icon Set

Create a shared local SVG icon partial or include pattern that can be used in:

- homepage footer contact items
- stay-template star treatment
- property quick stats
- property amenity cards
- property section labels where icons remain useful

Rules:

- no emoji in public-facing UI for these surfaces
- no remote icon dependency
- icons inherit color via CSS
- icons should be simple outline-style marks consistent with the brand

### 3. Stay Template Keeps Ratings, But In SVG Form

The stay template should still communicate review strength, but not with inline emoji text.

Approved behavior:

- byline removes `✍️`
- featured rental card badge removes `⭐` string formatting
- where ratings remain visible, use SVG star icons

### 4. Property Pages Get Surgical Cleanup, Not Structural Rewrite

Each hardcoded property page will be edited directly in this pass.

What changes:

- quick stats icon glyphs
- amenity card icon glyphs
- room/section header emoji glyphs
- footer contact glyphs
- related-card title emoji
- stale related URLs

What stays:

- existing layout
- property copy
- booking-engine flow
- image/gallery structure

### 5. Related Links Must Be Verified Against Current Source

Property pages will not link to assumed or legacy routes.

Replacement rule:

- link only to routes that exist in current source/build
- prefer current guides and current property pages
- avoid `.html` links
- avoid removed pSEO stay URLs

## Validation Requirements

Before review:

- homepage stat strip displays the four approved values exactly
- homepage footer shows SVG contact icons, not emoji
- stay template no longer renders `✍️` or `⭐` text badges
- key property pages no longer show emoji icons in quick stats, amenity cards, or related-card titles
- replaced related links resolve to live local routes

## Verification Plan

Implementation is not review-ready until all of these pass:

- `npm test`
- `npm run build`
- `npm run verify:recovery:p0`
- `npm run verify:recovery:guides`
- `npm run verify:recovery:remediation`

Manual browser review after rebuild:

- `/`
- `/stays/anna-maria-island-vacation-rentals/`
- `/properties/`
- at least two property pages with previous emoji surfaces

## Risks

### Risk: partial icon cleanup creates inconsistent styling

Mitigation:

- use one shared SVG pattern for all touched surfaces

### Risk: hardcoded property pages contain inconsistent markup

Mitigation:

- treat the five property pages as a bounded cleanup set
- verify each changed page directly after build

### Risk: related-link replacements are guessed

Mitigation:

- verify replacement URLs against current source/build before editing

## Kill Switch

If the cleanup starts forcing a broad property-page architecture refactor, stop this pass and split that work into a separate spec.

This pass is only successful if it removes the visible defects without reopening the stabilized architecture.
