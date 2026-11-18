# Dockside Dreams photo study

Status: **explored**, awaiting Sawyer's visual selection. This is a local,
nonpublic comparison, not a replacement for the property page. No `src/`
template, public stylesheet, booking control, pricing or property fact changed.

## Open the comparison

From the repository root after `npm ci` and `npm run build`:

```sh
node docs/design/experiments/property-photo-study/serve.cjs
```

- Booklet: <http://127.0.0.1:8793/?view=book>
- Folio: <http://127.0.0.1:8793/?view=folio>
- Current built property page: <http://127.0.0.1:8793/baseline/properties/dockside-dreams/>

The server binds only to loopback. Stop it with Ctrl-C. The preview folder is
outside the Eleventy input and never becomes a public site route. The baseline
is the checkout's `_site` build; rebuild after changing source. Do not infer
deployed behavior from this local copy.

[Rendered choices, interaction recording and independent review](review.md).

## Recommendation and references

**Recommend the booklet for the next design review.** A two-photo spread and
quiet paper depth make the property presentation distinctive. On phone it
becomes one undistorted photo, retaining navigation, thumbnails and the contact
sheet. The folio gives a single photo more space, but its dark stage and stacked
frames feel more like a component demonstration. Keep it as a real alternative.

The existing gallery remains the production baseline. This study has no booking
integration or conversion evidence, and a selected gallery would need a separate
in-context implementation and guest-journey review before adoption.

Donors: [Amicro Dither Book and CoverFlow](https://amicro.dev/3d), plus Sawyer's
[Studio](https://claude.ai/artifact/D9eQSY9M8UcUP6JgCoFbiZ#readme)
`PropertyStorybook`, `Cta`, `Pagination` and `Lightbox` references. Studio's README
was inspected November 17, 2026; its component descriptions are provenance, not
proof that each interaction was tested. This code is an independent native
HTML/CSS/JavaScript exploration; no donor implementation or package was copied.

All 13 photos, dimensions and captions come from the Dockside Dreams record in
`src/_data/properties-fallback.json`. Room names remain exactly as verified;
repeated “Bedroom” labels are not invented room assignments. Main images use
contain sizing. Thumbnails crop only for navigation. The original image and
complete contact sheet remain reachable.

## Craft applied

Actually read and applied the installed `emil-design` skill and its
`references/design-engineering.md`, `references/animation.md`, and
`references/mobile.md`. A donor metadata scan was also run; it is not counted
as skill invocation. Site Waterline fonts and colors remain the visual anchor;
rounded controls and paper/stack geometry are experiments, not new global law.

Motion's purpose is spatial continuity after deliberate navigation: native
WAAPI transform/opacity, 200ms, strong ease-out `(0.23, 1, 0.32, 1)`, with the
page hinge at the seam. Navigation updates immediately, cancels the prior turn,
and removes its decorative leaf. Keyboard and reduced-motion paths swap
directly. Hover is gated to fine pointers; controls are at least 44px high,
focus is visible, and native dialog provides Escape and focus return.

## Reproduce proof

With the local server running:

```sh
node docs/design/experiments/property-photo-study/verify.cjs
```

`PROOF_DIR` optionally selects an output directory; default is
`/tmp/property-photo-study-proof`. Six scenario groups cover both variants at
1440px and 390px, all 13 photos, actual image decode and grid aspect ratio,
horizontal overflow, axe accessibility, first/last navigation, rapid overlapping
clicks, dialog Escape/focus return, keyboard navigation, reduced motion, failed
photo data and failed images (including full-size). Baseline capture scrolls
lazy images into view before screenshotting; empty unloaded captures are not
evidence of a current-site defect.

Author inspection caught and corrected the preview asset route and intrinsic
photo height in the contact sheet. Image decode and aspect-ratio assertions now
catch those cases. These checks are local acceptance proof, not conversion or
real-phone touch proof.

The required independent design critic returned **Approved with edge** on the
rendered concepts, recommending the booklet. The remaining edge is subjective
page-turn quality and real-device touch feel. Do not promote to selected or
implemented from this verdict alone. Before production adoption, review the
actual motion on hardware and fit the chosen treatment into the property page.

No generated images, extra animation dependencies, automatic redesign job or
additional review layer was added. The parent catalog and existing Site workflow
govern the next task.
