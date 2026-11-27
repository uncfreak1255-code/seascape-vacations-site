---
version: "v4"
name: "Seascape Vacations Marketing Site"
status: "v4 2026-11-27 (ET), Sawyer approved PR 1 (tokens). Replaces the Waterline block."
description: "Photo-first, near-neutral system for direct booking, owner acquisition and Gulf Coast guides. Code: src/css/guest-fonts.css + src/css/guest.css."

# CURRENT SYSTEM — v4. New surfaces use system.colors only. system.live hexes
# still appear on unmigrated pages; design-lint does not treat them as sanctioned.
system:
  colors:
    bg: "#FFFFFF"
    surface: "#F7F7F7"
    ink: "#1E2324"
    ink-ui: "#222222"
    muted: "#6B7072"
    line: "#E6E6E6"
    line-strong: "#B0B0B0"
    line-control: "#DDDDDD"
    accent: "#173D42"
    accent-hover: "#0F2E32"
    error: "#B42318"
    rating-star: "#1E2324"
    booklet-paper: "#F6F3EB"
    paper: "#FFFFFF"
    rule: "#E6E6E6"
    soft: "#F7F7F7"
    white: "#FFFFFF"
  live:
    citron: "#D6EB85"
    clay: "#A4533E"
    paper-live: "#F6F3EB"
    muted-live: "#52676A"
    rule-live: "#CAD4CF"
    soft-live: "#F0F3EE"
    gold: "#C9A962"
    gold-dark: "#B8943A"
    gold-light: "#E8D5A3"
    gold-foil-a: "#E3C47A"
    gold-foil-b: "#8E6D28"
    gold-ink: "#2A2014"
    cream: "#F5EED6"
    cream-dark: "#EBE4CC"
    cream-light: "#FAF7EE"
    brand: "#5F8A8B"
    brand-light: "#7BA3A4"
    brand-dark: "#3D5C5D"
    brand-darker: "#2D4647"
    stone: "#3A3A3A"
    stone-light: "#6A6A6A"
    stone-mid: "#595959"
  typography:
    display:
      fontFamily: "Instrument Serif"
      fontWeight: 400
      lineHeight: "1.08"
      letterSpacing: "-0.03em"
      h1: "clamp(44px,5vw,72px)"
      h2: "clamp(28px,3vw,42px)"
      h3: "26px"
    body:
      fontFamily: "Inter"
      fontSize: "15px"
      lineHeight: "1.55"
    lede:
      fontFamily: "Inter"
      fontSize: "17px"
      lineHeight: "1.55"
    label:
      fontFamily: "Inter"
      fontSize: "12px"
      letterSpacing: "0.13em"
    ui: "Inter (self-hosted variable woff2), system-ui fallback"
  space:
    "1": "4px"
    "2": "8px"
    "3": "12px"
    "4": "16px"
    "5": "20px"
    "6": "24px"
    "8": "32px"
    "10": "40px"
    "12": "48px"
    "16": "64px"
    "24": "96px"
    tap: "44px"
    section: "60px"
    section-mobile: "36px"
  rounded:
    none: "0"
    checkbox: "4px"
    button: "4px"
    control: "8px"
    card: "12px"
    feature: "16px"
    pill: "999px"
  shadow:
    menu: "0 20px 30px #173D4214"
    tray: "0 10px 40px #173D4226"
    bar: "0 -6px 22px #173D4210"
    print: "0 20px 32px #173D421C"
    print-lift: "0 26px 50px #173D4233"
    photo: "0 20px 40px #173D421F"
    float: "0 1px 2px rgba(0,0,0,.06), 0 6px 20px rgba(0,0,0,.10)"
    booklet: "0 20px 40px rgba(23,61,66,.12)"
  motion:
    duration:
      press: "120ms"
      fast: "120ms"
      hover: "150ms"
      exit: "150ms"
      move: "200ms"
      enter: "220ms"
      hero-scene-crossfade: "250ms"
      max: "300ms"
      route: "400ms"
      drift: "650ms"
    easing:
      out: "cubic-bezier(.23,1,.32,1)"
      glide: "cubic-bezier(.2,.7,.2,1)"
      v4: "cubic-bezier(.2,0,0,1)"
  breakpoints:
    phone: "600px"
    phone-live: "430px"
    tablet: "1024px"
    desktop: "1025px"
    narrow: "700px"
    mid: "900px"
    wide: "1050px"
  components:
    button-primary:
      backgroundColor: "{system.colors.accent}"
      textColor: "#FFFFFF"
      rounded: "{system.rounded.button}"
      padding: "14px 24px"
      minHeight: "48px, never below the 44px mobile floor"
      typography: "500 14px/1.35 Inter"
---

# Seascape design direction (v4)

## The rule in one line
**Airbnb is the default for every component on every page** (search pill, chips, cards, listing layout, booking card, forms, nav, reviews, map, sticky bars), including owner and guide pages. Seascape adds only its tokens: white canvas, Inter UI, Instrument Serif display headings (roman, one color), and dark teal `#173D42` as the single action color. **The booklet gallery is the single sanctioned exception, on desktop property pages only.** The phone homepage keeps its live layout because it already follows the Airbnb pattern. Component specs: [v4 components](docs/design/v4-components.md).

## What changed from v3 (Sawyer, 2026-11-27 9:51 and 9:54 AM ET)
- Desktop homepage: v3 layout with serif display headings. “Flip through homes” becomes a manual hero scene control (prev/next, “1 of 8”, 250ms crossfade). The homes grid stays visible.
- Desktop property page: keep the booklet. Everything around it follows the Airbnb listing pattern.
- Phone homepage: live layout, token harmony only.
- Phone property page: Airbnb listing pattern with a sticky “Check dates” bar.
- Fonts and accent: Instrument Serif headings, Inter body, `#173D42` accent.

## This PR (tokens only)
PR 1 lands the law, CSS custom properties, Inter, and the lint palette. It does **not** restyle header, homepage, property, owner or guide layouts. Live type sizes, radii and section padding stay until later PRs consume the v4 scale. Visual baselines will change at every step; refresh them on a `codex/*` or `claude/*` branch (Mac-only workflow).

## Diagnosis
v3 (and Waterline) had title-slide sections, too many colors, skeuomorphic gimmicks (the booklet is now an intentional exception), extreme type contrast with Poppins, the legacy guide template, and inconsistent radii and spacing.

## Keep
The wordmark, the real-photography-only rule, the named pictured home, the F1–F6 floors, the trust and usability rules, no fee %, ranges or minimums, the Hostaway handoff, and the phone home list.

## Product promise
Help a group choose one of the real homes, understand the details that could change its choice, and arrive at Hostaway with dates and guest count intact. Seascape is a small, owner-operated collection in Bradenton and Sarasota. Do not make it look like an island-wide resort or an unlimited marketplace.

## Live layouts until later PRs
Current routes still use the guest theme in `src/css/guest.css`, `src/css/motion.css`, `src/css/arrival.css` and `src/css/about.css`. Stay collections, homepage controls, cards, planning/comparison/activity guides, iconography and figures keep their existing contracts until their migration step:

[homepage controls](docs/design/homepage-controls.md) · [home deck](docs/design/home-focused-deck.md) · [cards](docs/design/cards-and-phone-surfaces.md) · [stay collections](docs/design/stay-collections.md) · [planning guides](docs/design/planning-guides.md) · [activity guides](docs/design/activity-guides.md) · [component patterns](docs/design/component-patterns.md) · [iconography](docs/design/iconography.md) · [guide figures](docs/design/guide-figures.md) · [chart patterns](docs/design/chart-patterns.md)

Display type is self-hosted Instrument Serif, regular only (SIL OFL). Inter is the body and control face (self-hosted variable woff2, `font-display: swap`). Do not italicize headings. Body italics are for real emphasis in copy only. Never auto-rotate homepage scenes. Controls stay at least 44px tall. No animation may delay booking or be required to reveal essential information.

- Motion has three jobs: identify a newly selected home, give the collection tactile depth, and connect its photo to the detail page; a catalog pattern Sawyer selected adds [its recorded motion](docs/design/pattern-motion.md). Use browser-native CSS/Web Animations and same-origin view transitions as progressive enhancements. No loader, scroll hijacking, autoplay, custom cursor, or required animation library. The static reduced-motion and no-JavaScript paths remain complete. v4 also: opacity and transform only; no tilt, rotate, parallax; reduced motion is instant; motion never hides the homes grid or booking controls.

## Photography is evidence
Only an actual photograph of the named property may illustrate its accommodation. A destination scene may illustrate a clearly named destination, never a failed home photo.

`properties-fallback.json` records the selected local photo, its original Hostaway URL and verification date. Local copies make the approved photography reliable for guests and offline visual tests. Recheck property identity and room/view claims before changing an image. Do not create, retouch, or replace accommodation features with generated imagery.

If an image cannot load, show a neutral named unavailable state. Never substitute the site OG image, a guide photograph, or another home. Visual proof must fail on a missing expected property image; a fallback is not a passing design baseline.

- **Editorial illustrations:** Clearly illustrated, non-location planning subjects may support guide text, as approved for the family guide on September 9, 2026. Descriptive alt text and an editorial-illustration caption. Retain real photography for property galleries, property/destination heroes, amenities, and named places; illustrations must not imply an actual rental or destination scene.

## Trust and usability
- Facts, room layouts and policies come from canonical property data and explicitly reviewed booking-source facts. Unknown is not false or included. Quote and cancellation terms come from the current Hostaway checkout.
- Never claim universal savings, flexible cancellation, ratings, review counts or response times without supporting evidence.
- Distinguish mainland Bradenton homes from Anna Maria Island itself. Only Dockside Dreams has the waterfront dock.
- Do not label capacity matching as availability. A remembered trip or cached opening is not a valid quote.
- Use clear labels, keyboard-operable controls, visible focus, native date inputs/dialog behavior, and reduced motion. Test 390px, a narrower 375px, tablet, and desktop.
- A sticky action must not cover the form, navigation, or content. No unsolicited popup should interrupt the core guest journey.
- Exception (Sawyer, 2026-10-24): the desktop-only homepage exit-intent email signup in `src/assets/js/guest.js`, shown once per 7 days when the cursor leaves the page. Audits do not flag it.
- No fee percentages, ranges or minimums in public copy. Never name Patrick.

Floors (the contract every change to these routes must leave true, enforced in `tests/visual/design-floors.spec.js`, `scripts/enforcement/shared-shell.test.js` and `scripts/enforcement/internal-link-floor.test.js`):
- F1 — Minimum font size: no visible text renders below 12px, on desktop or mobile, including decorative eyebrows.
- F2 — Tap targets: on mobile (393px), every link, button, input, select and summary has a hit box of at least 44×44px, except inline links inside flowing sentences.
- F3 — No overflow: the page never scrolls horizontally at 360, 375 or 393px.
- F4 — Hero contrast: on the homepage, white text over the scene photo reaches 4.5:1 (text under 24px) or 3:1 (24px and larger) for every scene, measured on rendered pixels.
- F5 — One shared shell: every built HTML page has exactly one `class="g-header"` and one `class="g-footer"`.
- F6 — Internal-link distribution: a hub page the shared shell links to stays linked from at least 70% of built pages. Editing a shared header or footer redistributes internal links across the whole site at once, and no other gate here can see it: URLs, titles, canonicals and JSON-LD stay identical, the link validator only checks that links which exist still resolve, and the visual gate's per-route pixel tolerance absorbs a footer change without a diff.

F1 and F2 apply to the whole page on guest routes (`body.guest-site`, including stay collections) and, on every other route, to the shared header, mobile menu and footer only. A converted planning guide (`body.planning-guide`) joins the whole-page scope. Other pages carry the shared shell but keep legacy body typography until redesigned.

## Scales, states and forms
The `space`, `motion`, `shadow` and `breakpoints` keys in the `system:` block are the scales. How they are used, plus state rules and form patterns, live in `docs/design/scales-states-forms.md`. Owner evaluation form Direction A ships in a separate PR; v4 uses the same Airbnb host-onboarding pattern with the accent button.

## How this direction changes
This file records current choices, not proof they are good. How to revise it lives in `docs/design/direction-changes.md`.

## Retired on new surfaces
Do not build with citron, clay, gold, cream canvas, tinted section bands, tilted postcard decks, two-tone or italic headlines, uppercase tracked eyebrows, decorative clay numerals, centered hero badge/stats strips, or native `mm/dd/yyyy` placeholders (show “Add date” in a styled field). Gold CTA replacements for leftover legacy routes: `docs/design/legacy-gold-ctas.md`. Weekly photo-card exception: [rule](docs/design/weekly-photo-card.md).

## Migration order (later, approved PRs only)
1. Tokens in `guest-fonts.css` / `guest.css` and the design-lint palette (this PR).
2. Shell.
3. Phone home token pass.
4. Desktop homepage.
5. Property pages: desktop booklet restyle and phone listing pattern.
6. Owner pages and forms.
7. Guides, one at a time.
