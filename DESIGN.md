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

### Buttons
Three variants:
1. **Primary (teal):** Gradient from `--brand` to `--brand-dark`. White text. Shadow: `rgba(61,107,109,0.3)`.
2. **Gold:** Gradient from `--gold` to `#B8943A`. Stone text. For secondary CTAs, "Book Now" emphasis.
3. **Outline:** Transparent bg, `--brand` border+text. For tertiary actions.
All: Poppins 14px weight 600. Pill shape (50px radius). Padding: 14px 32px.

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
- **For UI/visual work,** dispatch subagents with `model: "sonnet"`. Sonnet produces better visual code.
- **Read `docs/style/voice.md` before writing any copy.** Voice and visual design are inseparable.
- **Read `docs/style/banned-patterns.md` before adding any new sections.** Some common patterns are explicitly banned.
- **Property data comes from Hostaway** via `src/_data/properties.js`. Do not hardcode property details.
- **Test all changes at 375px (mobile), 768px (tablet), and 1200px+ (desktop).**
- **Run `npx @11ty/eleventy --serve` to preview changes locally.**

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-13 | Initial design system documented | Codified existing CSS tokens and component patterns. Grounded in competitive research (Plum Guide, AvantStay, Vacasa). Protects the cream+teal+gold palette as brand differentiator. |
| 2026-04-13 | Sonnet routing for UI work | User preference across all projects: Sonnet produces better visual/design code. |
| 2026-04-13 | Light mode only | Vacation rental browsing context is daytime/mobile. Dark mode would undermine the warm brand feel. |
| 2026-04-13 | No scroll animations | Speed and simplicity signal professionalism. Animations add loading delay and distract from content. |
| 2026-04-13 | Cream background is non-negotiable | The single most distinctive visual element. Removing it would make Seascape look like every other rental site. |
