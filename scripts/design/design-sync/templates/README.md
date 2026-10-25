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
| `src/css/base.css`, `src/css/guest.css`, `src/css/arrival.css`, `src/css/catalog.css`, `src/css/catalog-card.css`, `src/css/about.css`, `src/css/property-gallery.css`, `src/css/owner.css`, `src/css/planning-guide.css` (copied to `waterline/`) | The live stylesheets the guest routes, the owner pages and the planning guides ship |
| `src/_includes/partials/guest-*.njk`, `src/_includes/layouts/guest.njk` | The shared shell and guest components; the cards use their built output |
| `src/assets/fonts/` (copied to `waterline/fonts/`) | Self-hosted Poppins and Instrument Serif (SIL OFL) |
| `docs/process/design-review-workflow.md` | How a design becomes a change on the site |
| `docs/style/writing-style-guide.md` | Editorial entry point; companion `voice.md`, `banned-patterns.md`, and `approved-examples.md` are copied beside it |

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
│   ├── base.css, guest.css, arrival.css, catalog.css, catalog-card.css,
│   │   about.css, property-gallery.css, owner.css, planning-guide.css   live stylesheets
│   ├── shell.html               the real shared header + footer markup
│   ├── design-review-workflow.md
│   ├── writing-style-guide.md
│   └── voice.md, banned-patterns.md, approved-examples.md
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

The maintained rules are in that entry point and its sibling `voice.md`,
`banned-patterns.md`, and `approved-examples.md`. Answer the reader's decision
first, use practical specifics supported by evidence, and name the tradeoff.
Do not invent local experience or fill proof, sentence or CTA quotas. Examples
illustrate editorial patterns; verify their facts before reuse. Repository briefs
and content-quality gates still govern public-page implementation.

## Using this system

For a mock, start from the component cards; they are the site's real markup and CSS, so class names carry over. Link `waterline/fonts.css`, `waterline/base.css` and `waterline/guest.css` (plus `arrival.css` for the homepage, `catalog.css` and `catalog-card.css` for the catalog, `property-gallery.css` for a property page, `about.css` for the about page, `owner.css` for the owner pages, or `planning-guide.css` for a planning guide), put `class="guest-site"` on `body` (a planning guide uses `class="guest-shell planning-guide"` instead), and use the live photo URLs the cards use. For an email, slide or PDF, use the tokens in `waterline/tokens.css` and the type and button rules above; the PNG logos in `assets/` are for those surfaces, never the site header.

Once Sawyer approves a design here, it is the implementation contract for the site change. Implementation follows `waterline/design-review-workflow.md`, is proven with Playwright at 393px and desktop, and names any deviation before it ships. New patterns change `DESIGN.md` in the repo first; this project follows on the next sync.
