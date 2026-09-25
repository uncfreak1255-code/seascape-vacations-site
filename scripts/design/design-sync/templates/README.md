# Seascape Vacations — Design System (Waterline)

The design system for **Seascape Vacations**, a small owner-operated collection of pool homes in Bradenton and Sarasota on Florida's Gulf Coast, ten to fifteen minutes from Anna Maria Island.

- Website: seascape-vacations.com
- Phone: (941) 704-8545
- Guests book direct; quotes, fees and cancellation terms come from the Hostaway checkout, never from the site.

This project is **generated from the repository**, not authored here. Synced {{SYNC_DATE}} from `uncfreak1255-code/seascape-vacations-site` commit `{{COMMIT}}` by `scripts/design/design-sync/build.js`. Edit the repo, re-run the build, push with DesignSync. Hand edits here are overwritten by the next sync.

## Source of truth

| Repo file | Role |
| --- | --- |
| `DESIGN.md` (copied to `waterline/DESIGN.md`) | The visual law: tokens, product promise, photography rules, floors F1 to F6, button treatments, direction decisions |
| `src/css/base.css`, `src/css/guest.css`, `src/css/arrival.css`, `src/css/catalog.css` (copied to `waterline/`) | The live stylesheets the guest routes ship |
| `src/_includes/partials/guest-*.njk`, `src/_includes/layouts/guest.njk` | The shared shell and guest components; the cards use their built output |
| `src/assets/fonts/` (copied to `waterline/fonts/`) | Self-hosted Poppins and Instrument Serif (SIL OFL) |
| `docs/process/design-review-workflow.md` | How a design becomes a change on the site |
| `docs/style/writing-style-guide.md` | Voice, banned phrases, hook formulas |

## Folder map

```
.
├── SKILL.md                     agent entrypoint: quick contract + what is current
├── README.md                    this file
├── styles.css                   token entry point -> waterline/tokens.css
├── waterline/                   CURRENT SYSTEM (September 2026)
│   ├── DESIGN.md                verbatim visual law
│   ├── tokens.css               generated CSS custom properties (--wl-*)
│   ├── fonts.css, fonts/        self-hosted faces
│   ├── base.css, guest.css, arrival.css, catalog.css   live stylesheets
│   ├── shell.html               the real shared header + footer markup
│   ├── design-review-workflow.md
│   └── writing-style-guide.md
├── preview/                     cards for the Design System pane (real markup + real CSS)
│   ├── colors-brand, colors-retired
│   ├── type-display, type-body
│   ├── buttons, nav, nav-mobile, form-fields, booking-panel, sticky-cta
│   ├── property-card, postcard-collection, scene-hero, footer
│   ├── logo, radii, spacing, rules-floors
│   └── voice, iconography       (unchanged from before; still valid)
├── assets/                      PNG logos and site photography for email, slides, PDF
└── uploads/                     Sawyer's uploaded logo files and reference screenshots
```

Mocks do not live in this project. Start a new design, attach this system, and build there; an approved mock is copied into the repo under `docs/mockups/` as the implementation contract. Files Claude Design writes into this project during a chat (`waterline/components/`, `live-mockup/`, extra cards) are removed by the next sync.

The pre-Waterline layers that used to live here (v1 `colors_and_type.css`, v2 `design-system/`, `ui_kits/`, `explorations/`, `live-mockup/`, `handoff/`) were removed on 2026-09-16 so nothing old can leak into a mock. A full export of the project as it stood before that (150 files) is kept outside this project.

## Waterline in one screen

**Product promise.** Help a group choose one of the real homes, understand the details that could change its choice, and arrive at Hostaway with dates and guest count intact. Seascape is small and owner-operated. It must not look like an island-wide resort or an unlimited marketplace.

**Colour.** Paper `#F6F3EB` canvas. Ink `#173D42` text and primary controls. Muted `#52676A` supporting text. Clay `#A4533E` accent, italic emphasis, active nav, focus ring. Citron `#D6EB85` selected scene and CTA over photos or dark surfaces, never small text on paper. Rule `#CAD4CF`. Soft `#F0F3EE` quiet panels. The old teal, gold and cream are retired and survive only as non-clickable accents on unmigrated legacy routes.

**Type.** Instrument Serif 400 for display, set large and tight (h1 `clamp(46px,5.4vw,78px)`, -0.025em, 1.12; the homepage arrival reaches 166px). Poppins for body 15/1.65, labels 12px uppercase .13em, controls 500 14px. Floor F1: nothing below 12px.

**Shape and space.** 4px radius on controls, never a pill. Photos are rectangles. Rules separate; shadows do not. Content reaches 1280px; sections breathe 76px (50px mobile); header 92px (76px mobile). Controls are at least 44px tall on mobile and buttons 48px elsewhere.

**Photography is evidence.** Only an actual photograph of the named property may illustrate it. A destination scene may illustrate a clearly named destination. No generated, retouched or substituted rooms. A missing image shows a neutral named unavailable state, never another home.

**Motion.** Three jobs only: identify a newly selected home, give the collection tactile depth, connect a photo to its detail page. Browser-native, progressive, never required, never auto-rotating. Reduced-motion and no-JavaScript paths stay complete.

**Trust.** Facts from canonical property data; unknown is not false. No universal savings, flexible-cancellation, rating or response-time claims without evidence. Capacity matching is not availability. Bradenton mainland is not Anna Maria Island; only Dockside Dreams has the dock.

## Content fundamentals

Tone is laid out in `waterline/writing-style-guide.md`. The distilled rules:

**Who the brand sounds like.** A knowledgeable local friend who moved to Florida's Gulf Coast a decade ago. Excited, specific, never salesy. The copy reads like someone texting you tips before your trip.

**Person and casing.** "We" for the Seascape team, "you" for the reader. Sentence case everywhere; never ALL CAPS in body copy. Labels and eyebrows are uppercased as a visual element (12px, .13em), not a prose pattern.

**Specifics over adjectives.** Named streets, drive times in minutes, real prices. Not "beautiful beaches" but "Manatee Public Beach's waist-deep sandbars stretch 50 yards out."

**Banned phrases, deleted on sight:** nestled, world-class, hidden gem, elevate your, unforgettable experience, look no further, in the heart of, boasts, seamlessly, tapestry, curated.

**Proof.** Every guide page earns at least three of: first-person experience, named local places, real numbers, paraphrased guest feedback, seasonal specificity, opinionated recommendations, honest comparisons.

**No emoji in body copy or UI.** At most one exclamation mark per page. Icons are the inline SVG `.ui-icon` set (1.85 stroke, round caps, currentColor); see `preview/iconography.html`.

## Using this system

For a mock, start from the component cards; they are the site's real markup and CSS, so class names carry over. Link `waterline/fonts.css`, `waterline/base.css` and `waterline/guest.css` (plus `arrival.css` for the homepage or `catalog.css` for the catalog), put `class="guest-site"` on `body`, and use the live photo URLs the cards use. For an email, slide or PDF, use the tokens in `waterline/tokens.css` and the type and button rules above; the PNG logos in `assets/` are for those surfaces, never the site header.

Once Sawyer approves a design here, it is the implementation contract for the site change. Implementation follows `waterline/design-review-workflow.md`, is proven with Playwright at 393px and desktop, and names any deviation before it ships. New patterns change `DESIGN.md` in the repo first; this project follows on the next sync.
