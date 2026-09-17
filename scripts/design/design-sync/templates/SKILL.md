---
name: seascape-vacations-design
description: Seascape Vacations design system, synced from the seascape-vacations-site repo. Waterline (September 2026) is the only current system. Use it for every new Seascape surface, whether a site page, a mock, an email, a slide deck or a one-pager.
user-invocable: true
---

Read `waterline/DESIGN.md` first. It is a verbatim copy of the repo's `DESIGN.md`, the visual source of truth, and it wins over anything else in this project. Then read `README.md` here for the folder map and the content rules.

Last synced {{SYNC_DATE}} from `seascape-vacations-site` commit `{{COMMIT}}` by `scripts/design/design-sync/build.js`. If a card here disagrees with the live site, the repo is right and the sync is stale; say so rather than inventing a bridge.

## Quick contract (Waterline)

- **Canvas** paper `#F6F3EB`. **Ink** `#173D42` for text, primary buttons and dark bands. **Muted** `#52676A` for supporting text. **Clay** `#A4533E` is the only warm accent: italic emphasis, the active nav item, the focus ring. **Citron** `#D6EB85` marks the selected scene and is the button colour over photos and dark surfaces; it is never small text on paper. **Rule** `#CAD4CF` for 1px rules. **Soft** `#F0F3EE` for a quiet solid panel.
- **Type** Instrument Serif 400 for every display line (h1 `clamp(46px,5.4vw,78px)`, -0.025em, line-height 1.12; italic takes clay). Poppins for body (15px / 1.65), labels (12px uppercase, .16em) and controls (500 14px). Nothing renders below 12px.
- **Shape** 4px radius on buttons and inputs, never a pill. Photos are real rectangles. Cards are separated by 1px rules, not shadows. The postcard is the one lifted surface.
- **Buttons** one primary per view, chosen by measured contrast on its surface: ink with white text on paper and photos; citron with ink text over dark; paper with an ink hairline on the legacy teal bands. Min-height 48px, 44px floor on mobile. Hover fills muted. No lift, shine, gradient or gold.
- **Photography is evidence.** Only a real photograph of the named home may illustrate it. Never generate, retouch or substitute a room. Use the live photo URLs the cards use.
- **Motion** browser-native only, never required, never auto-rotating. No popups in the guest journey; a sticky bar never covers the form.
- **Floors F1 to F6** (min 12px text, 44px hit boxes at 393px, no horizontal scroll at 360/375/393, hero contrast, one shell, link distribution) are enforced by tests. A mock that breaks one is not approvable.

## Do not add files to this project

It is generated. Anything written here by hand (a `components/*.jsx`, an extra card, a mock saved into `live-mockup/`) is deleted by the next sync. Build mocks as their own design project that attaches this system, then hand the approved mock to the repo. The HTML cards in `preview/` are the validation surface; no compiled component bundle is needed.

## What is current and what is history

- **Current**: `waterline/`, `styles.css`, and every card in `preview/`. The component cards are the site's real built markup with the real CSS, so match their class names (`g-header`, `g-button btn-brand`, `g-trip-form`, `g-postcard`, `catalog-card`, `g-booking`) when the output is meant to go back into the site.
- **Nothing else is a source.** The April to June 2026 layers (teal, gold, Playfair, pills) were removed from this project on 2026-09-16. If an `assets/` or `uploads/` screenshot shows the old site, it is reference for what changed, not a direction. Do not reintroduce the retired palette, and do not blend it with Waterline.

## Voice

Unchanged by the redesign. Warm, specific local expert; "we" for Seascape, "you" for the reader; sentence case; named places, minutes and real numbers over adjectives; no "nestled", "hidden gem", "curated" or emoji. Full rules in `waterline/writing-style-guide.md` and the content section of `README.md`.

## How work flows back to the site

A mock or design Sawyer approves here becomes the implementation contract. It is implemented in `seascape-vacations-site` on a `codex/<task>` branch under the repo's design review workflow (`waterline/design-review-workflow.md`), proven with Playwright at 393px and desktop, and any deviation is named before it ships. If a new pattern or rule is needed, `DESIGN.md` in the repo changes first and this project is re-synced.
