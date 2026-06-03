---
version: "alpha"
name: "Seascape Vacations Marketing Site"
description: "Public Seascape Vacations website design system for owner acquisition, direct booking, and Gulf Coast SEO pages."
colors:
  primary: "#3D5C5D"
  brand: "#5F8A8B"
  brand-light: "#7BA3A4"
  brand-dark: "#3D5C5D"
  brand-darker: "#2D4647"
  gold: "#C9A962"
  gold-dark: "#B8943A"
  gold-light: "#E8D5A3"
  cream: "#F5EED6"
  cream-dark: "#EBE4CC"
  cream-light: "#FAF7EE"
  stone: "#3A3A3A"
  stone-light: "#6A6A6A"
  white: "#FFFFFF"
typography:
  display-xl:
    fontFamily: "Playfair Display"
    fontSize: "56px"
    fontWeight: 500
    lineHeight: "1.05"
    letterSpacing: "-0.02em"
  display-md:
    fontFamily: "Playfair Display"
    fontSize: "38px"
    fontWeight: 500
    lineHeight: "1.15"
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Poppins"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.7"
    letterSpacing: "0em"
  label:
    fontFamily: "Poppins"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "1.2"
    letterSpacing: "0.2em"
rounded:
  sm: "12px"
  md: "20px"
  pill: "50px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.brand-dark}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "15px 32px"
    hairline: "1px rgba(201,169,98,.45) inset 4px, hover {colors.gold}"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.brand-dark}"
    typography: "{typography.label}"
    underline: "1px {colors.gold} bottom"
    padding: "8px 0"
  button-gold:
    backgroundColor: "linear-gradient(135deg,#E3C47A 0%,{colors.gold} 38%,#8E6D28 62%,{colors.gold} 100%)"
    textColor: "#2A2014"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "15px 32px"
    usage: "rare — one per page max"
  button-solid-gold:
    backgroundColor: "{colors.gold}"
    textColor: "#2A2014"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "15px 32px"
  button-outline-light:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    border: "1px rgba(255,255,255,.4)"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "15px 32px"
    usage: "over-imagery ghost, pairs with button-solid-gold"
  property-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.stone}"
    rounded: "{rounded.md}"
    padding: "20px"
  section-tag:
    textColor: "{colors.brand}"
    typography: "{typography.label}"
  page-surface:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.stone}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "80px 24px"
  nav-surface:
    backgroundColor: "{colors.cream-light}"
    textColor: "{colors.brand-dark}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "16px 24px"
  property-badge:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.stone}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System — Seascape Vacations

## Product Context
- **What this is:** Direct-booking luxury vacation rental website for Florida's Gulf Coast
- **Who it's for:** Two audiences: (1) Guests looking for Anna Maria Island / Bradenton / Sarasota / Siesta Key rentals, (2) Property owners considering switching management companies
- **Space:** Luxury vacation rentals, competing against Airbnb/VRBO on direct-booking savings and local expertise
- **Project type:** Static marketing site (11ty/Eleventy) with programmatic SEO pages, deployed on Netlify
- **Business model:** Owner acquisition is bottleneck #1. Direct-book conversion is bottleneck #2.

## Competitive Landscape

### Category Conventions (table stakes)
Every luxury rental site does these:
- Full-bleed hero image with property or destination photography
- Property cards in a responsive grid with image, specs (beds/baths/guests), and price
- Trust signals: guest reviews, management credentials, local expertise claims
- Prominent search/booking flow in the hero or sticky header
- Area content (guides, neighborhood breakdowns) for SEO
- Mobile-first responsive design

### What Separates Premium from Generic
Studied: Plum Guide, AvantStay, onefinestay, Vacasa, Evolve.
- **Plum Guide** (closest aspirational match): Muted earth tones, editorial serif typography, extreme whitespace discipline, curation narrative ("trusted for a reason"), high photography standards, no visual clutter.
- **AvantStay:** Clean modern sans-serif, lifestyle photography, group-travel positioning. Less luxury, more "design hotel" vibe.
- **Generic Airbnb clones:** Blue/white palette, system fonts, dense property grids, no editorial voice. This is what to avoid.

**Crowding rule:** When a Seascape page feels crowded, compare it to Plum Guide first and remove, simplify, or add spacing before adding more styling.

### Seascape's Design Differentiation
1. **Warm palette, not cool.** Most rental sites use white/blue (Airbnb) or white/gray (Plum Guide). Seascape's cream + teal + gold is warmer, more Gulf Coast, more approachable than the "minimalist luxury" competitors.
2. **Editorial serif personality.** Playfair Display gives the headings a magazine quality that generic sans-serif sites lack.
3. **Local operator voice.** The design should feel like a recommendation from someone who lives there, not a platform. Warm textures, not clinical surfaces.
4. **Direct-booking math.** The design should make the savings proposition visible, not buried.

## Aesthetic Direction
- **Direction:** Organic/Natural meets Editorial/Magazine
- **Mood:** A well-designed local magazine about Gulf Coast living. Warm, trustworthy, sophisticated without being stiff. Think Kinfolk meets a sharp real estate office.
- **Decoration level:** Intentional — warm cream textures, subtle shadows, gold accent details. Not minimal (too cold for vacation rentals), not expressive (too busy for luxury).
- **Reference vibe:** Plum Guide's editorial restraint + Seascape's existing warmth

### Field Report Standard
The owner-page "Field Report" direction is the new quality bar for future high-value Seascape page design. Pages should feel like a premium Gulf Coast editorial report: cinematic real photography, issue-style section framing, disciplined cream/teal/gold surfaces, serif-led hierarchy, useful proof, and one memorable interaction that helps the visitor decide. Do not copy the exact owner-page layout onto every route; copy the level of taste, restraint, specificity, and rendered polish.

## Typography
- **Display/Headlines:** Playfair Display (weight 500) — Serif with editorial authority. Used for all h1-h4 headings, property names, and section titles. The -0.02em letter-spacing is important for density at large sizes.
- **Body:** Poppins (weight 400-600) — Clean geometric sans. Readable body copy, navigation labels, metadata. Weights: 400 (body), 500 (UI labels), 600 (buttons, emphasis), 700 (price callouts).
- **Data/Specs:** Poppins weight 600 — Bedroom/bathroom counts, prices, dates. No monospace needed for this site.
- **Section tags:** Poppins 12px, weight 600, 0.2em letter-spacing, uppercase, color `var(--brand)`. Used above section titles.
- **Loading:** Self-hosted woff2 from `src/assets/fonts/`. Preloaded in `<head>`.
- **Scale (fluid):**
  - Hero h1: clamp(36px, 5vw, 56px)
  - Section h2: clamp(28px, 4vw, 38px)
  - Card h3: 20px
  - Body: 16px (base), line-height 1.7
  - Meta/small: 13px
  - Tags/badges: 11-12px

### Font Blacklist
Never introduce: Inter, Roboto, Open Sans, Montserrat, or any generic sans-serif as primary.
These flatten the brand into every-other-rental-site territory.

If Playfair Display ever needs replacing, consider: Fraunces (more personality), Instrument Serif (more modern), or Libre Baskerville (more classic). Match the editorial warmth.

## Color

### Core Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--brand` | `#5F8A8B` | Primary teal/seafoam. Navigation text, links, section tags, CTA gradient base. |
| `--brand-light` | `#7BA3A4` | Hover states, secondary links, decorative accents. |
| `--brand-dark` | `#3D5C5D` | CTA gradient end, dark text on light backgrounds, footer. |
| `--brand-darker` | `#2D4647` | Footer background, deep contrast needs. |
| `--gold` | `#C9A962` | Accent. Property badges, gold CTAs, star ratings, premium indicators. Gold = "this is special." |
| `--gold-light` | `#E8D5A3` | Gold backgrounds, hover tints, subtle highlights. |
| `--cream` | `#F5EED6` | Page background. The signature warm tone. Never replace with white or gray. |
| `--cream-dark` | `#EBE4CC` | Section background alternation, FAQ section, subtle dividers. |
| `--cream-light` | `#FAF7EE` | Card backgrounds that need to be lighter than page. |
| `--stone` | `#3A3A3A` | Primary text. Not pure black, warm dark gray. |
| `--stone-light` | `#6A6A6A` | Secondary text. Meta info, timestamps, fine print. |
| `--white` | `#FFFFFF` | Card backgrounds, modal surfaces, nav elements. |

### Approach
- **Warm and restrained.** Teal is the brand. Gold is the accent for "special" moments. Cream is the canvas.
- **No blue, no purple, no bright colors.** The palette is intentionally warm and muted. Stay in the teal-gold-cream family.
- **Light mode only.** Vacation sites are browsed in bright environments (daytime, phones on the beach). Dark mode would feel wrong for this brand.

### Color Rules
- CTA buttons use teal gradient (`--brand` to `--brand-dark` at 135deg) or gold gradient (`--gold` to `#B8943A` at 135deg).
- Text links use `--brand` with no underline. Underline on hover or use color shift to `--brand-dark`.
- Property price always in `--brand` at weight 600.
- Badge backgrounds use `--gold` with `--stone` text.
- Never use raw hex values in templates. Always reference CSS custom properties.

## Spacing
- **Base unit:** 4px (implied by the existing 12/16/20/24/32/48/80px values)
- **Density:** Comfortable. Generous section padding (80px vertical), moderate card padding (20-24px), tight metadata spacing (8-12px).
- **Section padding:** 80px top/bottom, 24px left/right
- **Card padding:** 20px body
- **Grid gap:** 24px
- **Container max-width:** 1100px (content), 1400px (nav)
- **Margin auto-centering:** All containers centered with `margin: 0 auto`

## Layout

### Page Structure
```
┌─────────────────────────────────────────┐
│ Nav (fixed, cream + blur, z-100)        │
├─────────────────────────────────────────┤
│ Hero (full-bleed image, 80-100vh)       │
│ Search box overlay                      │
├─────────────────────────────────────────┤
│ Content sections (alternating bg)       │
│ cream → cream-dark → cream → ...        │
├─────────────────────────────────────────┤
│ CTA banner (teal gradient, white text)  │
├─────────────────────────────────────────┤
│ Footer (brand-darker bg, light text)    │
└─────────────────────────────────────────┘
```

### Grid
- **Property grid:** `repeat(auto-fit, minmax(320px, 1fr))` with 24px gap
- **Feature grid:** 3-column on desktop, stacks on mobile
- **Guide grid:** Same as property grid
- **Max content width:** 1100px
- **Breakpoints:** Mobile-first. Significant layout changes at 768px and 1024px.

### Border Radius
- **Buttons:** 50px (pill shape). This is a brand signature. Do not change.
- **Cards:** 20px. Large, friendly radius. Consistent across property cards, review cards, feature cards.
- **FAQ items:** 12px. Slightly tighter for dense content.
- **Badges:** 20px (pill). Match button aesthetic.
- **Images:** Inherit card radius (overflow: hidden on parent).

## Motion
- **Approach:** Intentional. Smooth transitions that feel premium, not flashy.
- **Button hover:** translateY(-3px) + shadow expansion. 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275). The slight bounce easing is a signature.
- **Card hover:** translateY(-5px). 0.3s ease. Subtle lift.
- **Button active:** scale(0.98). Immediate tactile feedback.
- **Transitions:** 0.3s default for color/opacity changes. 0.4s for transforms.
- **No scroll-triggered animations.** Content is visible on paint. No lazy-reveal, no parallax, no scroll-jacking. Pages should feel instant.

## Photography Rules
- **Hero images:** Full-bleed, high-resolution property or Gulf Coast lifestyle photography. Overlay with semi-transparent gradient for text readability.
- **Property card images:** 220px height, cover fit, center position. Consistent framing.
- **Image sources:** Hostaway CDN with WebP/AVIF optimization (`?w=800&q=80` format).
- **No stock photography.** All images must be actual Seascape properties or Gulf Coast locations.
- **Alt text required** on every image. Descriptive, not keyword-stuffed.

## Component Patterns

### Navigation
- Fixed top, z-100. Cream background with 98% opacity and blur(20px) backdrop.
- Logo (40px height) + wordmark (Playfair Display 20px, `--brand`).
- Nav links: Poppins 14px, weight 500. Hover: color shift to `--brand-dark`.
- Mobile: hamburger menu at 768px breakpoint.
- "Book Direct" CTA button in nav on desktop.

### Property Cards
- White background on cream page. 20px radius. Shadow: `0 4px 20px rgba(0,0,0,0.08)`.
- Image (220px), body (20px padding), title (20px Poppins 600), meta (13px stone-light), price (16px brand 600).
- Optional gold badge for featured/premium properties.
- Hover: lift 5px with enhanced shadow.

### Buttons — premium set v1

All shared base: inline-flex, pill (50px), padding 15px 32px, Poppins, weight 500, 12.5px, letter-spacing .12em, uppercase, 0.35s cubic-bezier(.22,.9,.28,1) transition.

1. **Primary `.btn-brand` (dark-teal pill with gold hairline frame):** Solid `--brand-dark` fill, white text, inset 4px `rgba(201,169,98,.45)` border that brightens to `--gold` on hover. This is the default premium CTA — nav, hero search, money pages.
2. **Secondary `.btn-link` (hairline link with arrow):** Transparent bg, `--brand-dark` text, 1px gold underline, weight 600, letter-spacing .2em. Uses `<span class="arr">→</span>` for a hover-translate arrow. Use for inline editorial CTAs, not stacked button pairs.
3. **Rare-use `.btn-gold` (gold foil — ONE per page max):** Metallic foil gradient `#E3C47A → #C9A962 → #8E6D28 → #C9A962` at 135deg, dark ink `#2A2014`, weight 600. Layered box-shadow for depth. Reserve for one high-value moment per page (sticky book bar, hero primary on a property page).
4. **Over-imagery ghost `.btn-outline-light`:** Transparent bg, white text, 1px `rgba(255,255,255,.4)` border. Hover fills to `rgba(255,255,255,.08)` with gold border. Pairs with `.btn-solid-gold` on dark/photo backgrounds.
5. **Over-imagery solid gold `.btn-solid-gold`:** `--gold` fill, dark ink, weight 600. The paired primary on photo backgrounds where the foil would be too much.

Legacy bare `.btn` (no modifier) falls back to the same visual as `.btn-brand` minus the hairline frame — kept for backward compatibility across ~40 existing call sites. New work should pick a modifier explicitly.

**Do not:** use `→` arrows inside button labels. The only retained arrow pattern is `.btn-link .arr` which animates on hover.

### Section Headers
- Tag above title: 12px uppercase Poppins, `--brand` color, 0.2em tracking.
- Title: Playfair Display, fluid size clamp(28px, 4vw, 38px), `--stone`.
- Optional subtitle: Poppins, `--stone-light`, max-width 600px, centered.

### CTA Banners
- Full-width. Teal gradient background. White text (Playfair Display for title, Poppins for body).
- Centered layout. Gold or white CTA button.
- Padding: 80px vertical.

### "Book Direct" Trust Signal
- Position the savings message ("Book Direct & Save 10-15%") as a trust signal alongside a real operator photo and name, not as an urgency tactic.
- This is a trust pattern, not a discount banner. Think Plum Guide's "Trusted for a reason" — the business model IS the trust signal.
- Pair with: locally managed badge, guest review count, response-time promise.
- Never use countdown timers, fake scarcity ("Only 1 left!"), or strikethrough pricing.

## Iconography
- Use SVG icons only on the live site. Preferred source is the shared repo icon system in `src/_includes/partials/ui-icon.njk`.
- If the needed icon does not exist in the repo yet, pull or export an approved SVG from the design system or Figma and add it to source. Do not fall back to emoji glyphs.
- Never use emoji as bullets, badges, stat markers, CTA decoration, or section icons on desktop or mobile.

## Anti-Patterns — Never Do These
1. **Never replace the cream background with white or gray.** Cream is the brand's visual signature. It separates Seascape from every Airbnb clone.
2. **Never use system fonts or generic sans-serif** for headings. Playfair Display is the brand identity.
3. **Never add a dark mode.** This is a vacation rental site browsed in daylight.
4. **Never use stock photography.** Real properties and real Gulf Coast locations only.
5. **Never add parallax, scroll animations, or lazy-reveal effects.** Content loads visible. Speed and simplicity signal professionalism.
6. **Never change the button pill shape (50px radius).** It's a brand signature.
7. **Never flatten the cream/teal/gold palette to a generic blue.** Blue = Airbnb. Teal + gold + cream = Seascape.
8. **Never add more than 3 font weights per family** in use at once. Poppins 400/500/600 is enough. Do not import 700/800/900.
9. **Never keyword-stuff alt text.** Write descriptive alt text that serves accessibility.
10. **Never break the 1100px content max-width.** Edge-to-edge layouts make the site feel like a template.

## Agent Instructions
- **Before touching any CSS, template, or layout file,** read this DESIGN.md first.
- **Treat the YAML front matter as the visual source of truth.** The prose explains why the tokens exist and how to apply them.
- **Do not invent new colors, fonts, border radius, shadows, spacing, or component styles** unless the user explicitly asks for a design-system change.
- **For meaningful visual work,** Codex should prepare the Claude Design handoff first: repo/source truth, page goal, audience, constraints, existing patterns, proof/copy boundaries, URLs or screenshots, implementation risks, and responsive requirements.
- **If Claude Design, Stitch, designmd.directory, or another design tool produces a new direction,** propose it as a DESIGN.md change first. Do not copy a generated screen directly into source.
- **Use Stitch/designmd.directory only as inspiration.** They are not source truth for Seascape's brand or page patterns.
- **For UI/visual work,** dispatch subagents with `model: "sonnet"`. Sonnet produces better visual code.
- **Read `docs/style/voice.md` before writing any copy.** Voice and visual design are inseparable.
- **Read `docs/style/banned-patterns.md` before adding any new sections.** Some common patterns are explicitly banned.
- **Property data comes from Hostaway** via `src/_data/properties.js`. Do not hardcode property details.
- **Test all changes at 375px (mobile), 768px (tablet), and 1200px+ (desktop).**
- **Run `npx @11ty/eleventy --serve` to preview changes locally.**
- **For meaningful visual changes, run `docs/process/design-review-workflow.md`.** The rendered QA loop includes the `design-review` skill, fresh screenshots, and changed-route review before asking Sawyer to look.
- **Visual regression screenshots are required before calling a subjective visual change "better."** The automated screenshot gate already exists — `npm run test:visual` diffs committed desktop and mobile baselines in `tests/visual/__screenshots__/`; run it, and still attach desktop and mobile screenshots to the review or PR for subjective calls.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-13 | Initial design system documented | Codified existing CSS tokens and component patterns. Grounded in competitive research (Plum Guide, AvantStay, Vacasa). Protects the cream+teal+gold palette as brand differentiator. |
| 2026-04-13 | Sonnet routing for UI work | User preference across all projects: Sonnet produces better visual/design code. |
| 2026-04-13 | Light mode only | Vacation rental browsing context is daytime/mobile. Dark mode would undermine the warm brand feel. |
| 2026-04-13 | No scroll animations | Speed and simplicity signal professionalism. Animations add loading delay and distract from content. |
| 2026-04-13 | Cream background is non-negotiable | The single most distinctive visual element. Removing it would make Seascape look like every other rental site. |
| 2026-04-24 | Premium buttons v1: retire teal gradient, introduce hairline-framed primary + foil rare-use + ghost/solid-gold pair | Plum Guide-level editorial restraint needed more type discipline (uppercase, tighter size, .12em tracking) and a one-per-page gold foil. Bare `.btn` keeps teal fallback so existing call sites don't break while templates migrate to explicit modifiers. |
| 2026-05-15 | SVG-only iconography on the live site | Emoji decoration reads cheap and inconsistent across devices. Live site iconography now comes from shared SVGs in source or approved design-system exports. |
| 2026-05-15 | `design-review` is the required rendered QA loop for meaningful visual changes | Visual work in this repo must be reviewed on the rendered surface with desktop/mobile screenshots and live route checks before human review. |
| 2026-06-03 | Corrected stale "until an automated gate exists" text | The automated visual regression gate already exists (`npm run test:visual`, committed desktop/mobile baselines in `tests/visual/__screenshots__/`, axe spec). Docs now describe it as present, not pending. |
