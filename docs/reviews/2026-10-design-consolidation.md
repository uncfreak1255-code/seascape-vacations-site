# Website design consolidation — October 25, 2026

Keeper: existing [PR #787](https://github.com/uncfreak1255-code/seascape-vacations-site/pull/787), branch `codex/button-pill-token`. Root task owner is the consolidation agent; all mutations publish through this one destination. Starting main: `08e4856fb642dc3d8f1f28491982bde5658afea2`. No merge or publication authority is inferred from source completion.

The user authorized comparison, recommendation and compatible consolidation. This is the agent's selected implementation under that instruction, not a claim that Sawyer approved these exact pixels or publication.

## Chosen direction

- Cinema: real, full-bleed home photography; original identity and manual scene navigation. Keep incumbent contrast protection; the draft's lighter overlay failed F4 on three desktop scenes. Tablet reserves more room above captions.
- Mosaic: one static Waterline paper/ink arrangement. Lead with comparing complete totals including taxes/fees. No universal platform-fee or guaranteed-savings claims.
- Shared sliding-arrow pill: reset inherited legacy pseudo-element positioning/border so the arrow is inline instead of a stray diamond.
- Functional mobile corrections: 16px native date/guest controls; property and homepage forms stack at 700px, catalog at 767px. Keep visible native select disclosure. Larger text must not force horizontal overflow.
- Remove all hero/layout selectors, discarded CSS/JS, unused magazine photography, schematic map and informational hover lift. No extra runtime stylesheet or animation library.

## Disposition and preserved sources

| Original PR | Original head | Disposition |
| --- | --- | --- |
| #787 controls | `9670068` | Keeper; original commit remains an ancestor. |
| #791 property mobile | `e2c06fe` | Incorporated, preserving native select appearance; superseded by keeper. |
| #792 hero alternatives | `34cff68` | Cinema incorporated without a runtime selector; original alternatives remain on original branch/PR. |
| #793 direct-book layouts | `4656728` | Mosaic incorporated; copy corrected and unused prototypes removed. |
| #794 price motion | `f49e681` | Deferred and superseded for this release. Adds nightly × nights without full quote disclosure; feedback-frame query can force success styling. Original branch retained for reference. |
| #796 touch leftovers | `2b209ff` | Form-size/catalog-stack subset incorporated. Gallery-sticky changes, global highlight/callout suppression and broader hover changes deferred, not represented as delivered. Original branch retained. |

Related #788, #789, #790 and #795 are separate optional motion/gallery/type work and are not included or approved by this consolidation. No new PR is needed for this task.

## Review and behavior

Repo-local design specialist/critic reviewed all six hero and layout alternatives at desktop/phone widths. Independent final verdict: Design **Approved**, Voice **Approved** after fixing the arrow. Before/after measurements confirm 16px mobile controls and native appearance; desktop retains its existing form arrangement. Booking JavaScript is byte-identical to current main. Property data, prices, availability rules, cancellation terms, Hostaway destinations, trip continuity and tracking contracts are untouched.

The active brief is `docs/briefs/2026-10-homepage-why-direct-bento.md`. Its source/search receipt is context only, not evidence of SEO or conversion lift. The public-copy lane rewrote the overbroad fee statement, removed internal selection labels, and passed independent voice review.

## Evidence

- `npm run verify:release -- --range origin/main`: passing build, all 1,246 unit tests, content checks, design lint, recovery checks, internal links and JSON-LD. Content-only check: 41/41.
- Mechanical Impeccable detector: no findings on the homepage and trip-form template.
- Browser acceptance uses the existing specs with a temporary external launch configuration. The pinned Chromium 156 download was unavailable; temporary Chromium 153 was used without changing repository dependencies, test tolerances or baselines.
- Original `npm run test:visual` could not launch the missing pinned browser. The first browser pass exposed contrast, tablet overlap and native mobile-date overflow defects; source corrections address them. Standard screenshot baseline comparison remains outstanding: intentional shared CTA/hero changes differ from existing approved images. No baselines or thresholds were rewritten.
- Final browser acceptance: 115 passed, 5 applicability skips, zero failures across 120 selected cases (desktop/mobile). Covers all scene contrast checks, 360/375/393px overflow, target/font floors, tablet copy-caption separation, catalog/property booking states, checkout fallback, SAVE50 and trip continuity. Snapshot-comparison cases are excluded from this acceptance run and remain a release gate. Source/test completion is not production proof.

## Rendered proof

Desktop: [hero](2026-10-design-consolidation-proof/after-hero-desktop.webp), [mosaic top](2026-10-design-consolidation-proof/after-why-top-desktop.webp), [mosaic close](2026-10-design-consolidation-proof/after-why-bottom-desktop.webp), [property booking](2026-10-design-consolidation-proof/after-property-desktop.webp), [catalog](2026-10-design-consolidation-proof/after-catalog-desktop.webp), [homepage form](2026-10-design-consolidation-proof/after-home-form-desktop.webp).

Phone: [hero](2026-10-design-consolidation-proof/after-hero-phone.webp), [mosaic top](2026-10-design-consolidation-proof/after-why-top-phone.webp), [mosaic close](2026-10-design-consolidation-proof/after-why-bottom-phone.webp), [property booking](2026-10-design-consolidation-proof/after-property-phone.webp), [catalog](2026-10-design-consolidation-proof/after-catalog-phone.webp), [homepage form](2026-10-design-consolidation-proof/after-home-form-phone.webp).

Before: [desktop hero](2026-10-design-consolidation-proof/before-hero-desktop.webp), [phone hero](2026-10-design-consolidation-proof/before-hero-phone.webp), [phone property form](2026-10-design-consolidation-proof/before-property-phone.webp), [phone catalog](2026-10-design-consolidation-proof/before-catalog-phone.webp). [Computed measurements](2026-10-design-consolidation-proof/measurements.json).

Mosaic screenshots use actual viewport captures because stitched tall-element capture incorrectly brought the offscreen skip link into the image. The skip-link accessibility behavior is retained.

## Release boundary

Keep #787 draft until normal visual approval/baseline handling, required CI and release review finish. Do not merge the original stacked prototypes, bypass snapshot gates, dispatch production publish, or push production. After normal release, verify the deployed homepage, catalog and property booking journey separately before calling this shipped.
