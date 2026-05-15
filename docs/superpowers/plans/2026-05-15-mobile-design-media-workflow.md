# Mobile Design + Media Workflow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the mobile clipping found in the design audit, then prototype one owner-economics media asset before deciding whether to batch property reels.

**Architecture:** Treat the live site as the production source of truth and keep `DESIGN.md` as the visual law. Fix responsive source issues first with rendered desktop/mobile proof. Use Figma only as a design-decision board when a visual direction needs approval before code. Use HyperFrames first for Seascape-branded video assets; use Remotion only if repeatable chart/data variants become the real need.

**Tech Stack:** Eleventy/Nunjucks, existing CSS, `DESIGN.md`, repo guardrails, local Chrome/headless screenshots, optional Figma design board, optional HyperFrames HTML video composition, optional Remotion React video project for chart automation.

---

## Decision Summary

Best workflow:

1. Code-only responsive cleanup for mobile overflow.
2. Rendered screenshot review before Sawyer reviews anything.
3. One owner-economics HyperFrames prototype.
4. Decide whether Remotion is necessary after the prototype, not before.
5. Batch property reels only after one media asset passes design, proof, and performance review.

Figma role:

- Use Figma for storyboard/visual direction only when the next choice is subjective.
- Do not use Figma as production truth.
- Do not use Figma for the first mobile overflow patch; the browser is the truth for that.

HyperFrames role:

- Preferred first media tool for Seascape because it uses HTML/CSS, can follow `DESIGN.md`, and is a natural fit for handcrafted owner explainers and property reels.
- Keep source compositions separate from the live site until approved.

Remotion role:

- Use only if the owner-economics explainer needs reusable data-driven chart variants, batch exports, or programmatic prop-driven versions.
- Do not add a Remotion project to the site repo unless the prototype proves it reduces future work.

## File Map

Plan-only branch:

- Create: `docs/superpowers/plans/2026-05-15-mobile-design-media-workflow.md`

Phase 1 likely source files:

- Modify: `src/css/homepage.css`
- Modify: `src/css/base.css`
- Modify: `src/property-management/index.njk`
- Modify: `src/properties/dockside-dreams/index.njk`
- Inspect and possibly modify: `src/properties/bradenton-pool-home/index.njk`
- Inspect and possibly modify: `src/properties/river-house/index.njk`
- Inspect and possibly modify: `src/properties/sarasota-luxe/index.njk`
- Inspect and possibly modify: `src/properties/the-oasis/index.njk`
- Modify: `src/guides/bradenton-vs-sarasota.html`
- Inspect and possibly modify: `src/guides/anna-maria-island-vs-siesta-key.html`
- Modify only if needed for guest-facing wording: `src/stays/index.njk`

Phase 2 media prototype files, if approved after Phase 1:

- Create: `docs/briefs/2026-05-owner-economics-explainer.md`
- Create: `design-lab/hyperframes/owner-economics-explainer/`
- Use approved real imagery and repo-owned proof numbers only.
- Do not add rendered video output to the repo unless Sawyer approves the artifact.

Phase 3 property reel files, only after prototype approval:

- Create: `docs/briefs/2026-05-property-reel-batch.md`
- Create or extend: `design-lab/hyperframes/property-reels/`
- Use approved real property images only.

## Chunk 1: Responsive Overflow Fix

**Skills/tools:** `@visual-builder-loop`, `@frontend-design`, `@accessibility`, repo `DESIGN.md`, local Chrome/headless screenshots.

- [ ] **Step 1: Rebuild baseline**

Run:

```bash
npm run build
```

Expected: build passes and `_site/` reflects the current branch.

- [ ] **Step 2: Capture baseline screenshots**

Capture desktop and mobile screenshots for:

```text
/
/property-management/
/properties/dockside-dreams/
/guides/bradenton-vs-sarasota/
```

Expected: screenshots reproduce the clipping found in the audit before edits.

- [ ] **Step 3: Add the smallest responsive fixes**

Fix only layout containment, text wrapping, grid shrink behavior, sticky CTA sizing, and mobile padding. Do not redesign the pages.

Likely checks:

- Ensure mobile containers use `max-width: 100%`.
- Ensure long hero/stat panels can shrink with `min-width: 0`.
- Ensure headline and CTA rows wrap without horizontal scroll.
- Ensure sticky mobile CTA buttons do not force the viewport wider than 390px.
- Prefer shared CSS fixes when the same issue repeats.

- [ ] **Step 4: Rebuild and verify source checks**

Run:

```bash
npm run build
npm test
npm run verify:release
npm run git:preflight
```

Expected: all commands pass.

- [ ] **Step 5: Recapture review screenshots**

Capture fresh desktop and mobile screenshots for the changed routes.

Expected: no horizontal clipping at 390px mobile width and no desktop regression.

- [ ] **Step 6: Send Sawyer a review packet**

Include:

- exact local or preview URLs
- desktop screenshots
- mobile screenshots
- known-bad items, if any
- whether the patch is only responsive behavior or includes visual design changes

## Chunk 2: Owner-Economics Explainer Prototype

**Skills/tools:** `@visual-builder-loop`, `@page-cro`, `@figma` if storyboard approval is useful, `@hyperframes`, optional `@remotion`.

- [ ] **Step 1: Write a one-page media brief**

Create:

```text
docs/briefs/2026-05-owner-economics-explainer.md
```

Required content:

- audience: property owners
- objective: make direct-book economics easier to understand
- source numbers and source paths
- claims allowed
- claims not allowed
- draft scene outline
- approval gate before embedding anywhere live

- [ ] **Step 2: Decide whether Figma is needed**

Use Figma only if there are multiple valid visual directions. If used, verify the existing Seascape Figma file/page target before creating anything new. Keep the Figma handoff as a selected direction, not production truth.

Expected: one approved storyboard direction or an explicit decision to skip Figma because the design is straightforward.

- [ ] **Step 3: Build the HyperFrames static end-state first**

Create the HyperFrames composition with final layouts before animation.

Expected:

- colors, fonts, spacing, and motion trace back to `DESIGN.md`
- no generic video styling
- no generated proof imagery
- owner numbers are visibly sourced

- [ ] **Step 4: Add animation and captions**

Use restrained editorial motion: stat cards, fee-stack comparison, and direct-book savings reveal. No flashy rental-platform SaaS look.

Expected: 30-45 second prototype suitable for owner review or social distribution.

- [ ] **Step 5: Inspect and render only the prototype**

Run HyperFrames lint/inspect/render commands from the composition folder.

Expected: no text clipping, no timing conflicts, and a render artifact outside normal site build output.

- [ ] **Step 6: Send Sawyer a design/media review**

Include:

- storyboard or Figma frame if used
- rendered stills or short preview
- source claims used
- whether HyperFrames is enough or Remotion is now justified

## Chunk 3: Remotion Decision Gate

**Skills/tools:** `@remotion` only if needed.

- [ ] **Step 1: Decide against Remotion by default**

Default verdict: do not add Remotion if the HyperFrames owner explainer is enough.

- [ ] **Step 2: Use Remotion only for repeatable chart variants**

If needed, prototype outside the live site path first.

Good reasons to use Remotion:

- many data-driven variants
- charts generated from JSON props
- reusable owner report clips
- single-frame chart export checks

Bad reasons:

- because video feels exciting
- because the live pages need more motion
- because one handcrafted clip could be done in HyperFrames

- [ ] **Step 3: Run a still-frame sanity check**

Run:

```bash
npx remotion still <composition-id> --scale=0.25 --frame=30
```

Expected: text fits and chart proportions match `DESIGN.md`.

## Chunk 4: Property Reel Batch

**Skills/tools:** `@hyperframes`, `@page-cro`, `@accessibility` for any embedded controls.

- [ ] **Step 1: Do not start until the owner prototype passes review**

Expected: Sawyer has reviewed one media asset and agreed the workflow is worth batching.

- [ ] **Step 2: Write a property reel batch brief**

Create:

```text
docs/briefs/2026-05-property-reel-batch.md
```

Required content:

- five property names
- approved image sources
- claims allowed per property
- output formats
- whether clips are for social, ads, property pages, or all three

- [ ] **Step 3: Build one reusable HyperFrames reel template**

Expected: one template accepts property name, hero images, amenity labels, location, and CTA.

- [ ] **Step 4: Render only after proof review**

Expected: no rendered videos committed unless explicitly approved.

- [ ] **Step 5: Send Sawyer a batch review**

Include one still and one rendered sample first. Do not batch all five before the first sample is approved.

## Required Review Gates

Before user review:

```bash
npm run build
npm test
npm run verify:release
npm run git:preflight
```

For visual changes:

- desktop screenshots for each changed route
- mobile screenshots for each changed route
- sectional screenshots for long mobile pages when full-page capture is unreliable
- written note on any capture artifact

For media changes:

- source-claim checklist
- still-frame inspection
- HyperFrames inspect/lint output
- rendered preview outside `_site/`
- explicit decision on whether the asset should be embedded, used only for social, or held as a prototype

Before merge:

```bash
git diff --check
npm run build
npm run verify:links
npm run verify:jsonld
npm run verify:release
npm run git:merge-check
```

## Final Handoff Format

For each phase, send Sawyer a review packet with:

- what changed
- what did not change
- exact routes or preview artifacts to review
- screenshot/video evidence
- verification commands and pass/fail status
- recommendation: ship, revise, or hold

Do not ask Sawyer to find basic bugs. The agent does the first QA pass.
