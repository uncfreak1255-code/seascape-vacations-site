---
version: "alpha"
name: "Seascape Vacations Marketing Site"
description: "Public Seascape Vacations website design system for owner acquisition, direct booking, and Gulf Coast SEO pages."

# CURRENT SYSTEM — Waterline (September 2026). Build every new surface from this
# block. Source of truth in code is src/css/guest.css; these values mirror it.
waterline:
  colors:
    paper: "#F6F3EB"
    ink: "#173D42"
    citron: "#D6EB85"
    muted: "#52676A"
    clay: "#A4533E"
    rule: "#CAD4CF"
    soft: "#F0F3EE"
  typography:
    display:
      fontFamily: "Instrument Serif"
      fontWeight: 400
      lineHeight: "1.12"
      letterSpacing: "-0.025em"
      h1: "clamp(46px,5.4vw,78px)"
    body:
      fontFamily: "Poppins"
      fontSize: "15px"
      lineHeight: "1.65"
    label:
      fontFamily: "Poppins"
      fontSize: "12px"
      letterSpacing: "0.13em"
  rounded:
    none: "0"
    button: "4px"
    control: "4px"
  # Spacing steps the Waterline CSS already uses. New rules pick from this list.
  space:
    "1": "4px"
    "2": "8px"
    "3": "12px"
    "4": "16px"
    "6": "24px"
    "8": "32px"
    tap: "44px"
    "14": "56px"
    section: "76px"
    section-mobile: "50px"
  # Durations and curves, measured from the live CSS (October 2026).
  motion:
    duration:
      fast: "120ms"
      hover: "150ms"
      move: "200ms"
      route: "550ms"
      drift: "650ms"
    easing:
      out: "cubic-bezier(.23,1,.32,1)"
      glide: "cubic-bezier(.2,.7,.2,1)"
  # Shadows are for things that float over the page, and for printed photos.
  # Ink (#173D42) with an alpha byte; values are exact copies of the live CSS.
  shadow:
    menu: "0 20px 30px #173D4214"
    tray: "0 10px 40px #173D4226"
    bar: "0 -6px 22px #173D4210"
    print: "0 20px 32px #173D421C"
    print-lift: "0 26px 50px #173D4233"
    photo: "0 20px 40px #173D421F"
  breakpoints:
    phone: "430px"
    narrow: "700px"
    mid: "900px"
    wide: "1050px"
  components:
    button-primary:
      backgroundColor: "{waterline.colors.ink}"
      textColor: "#FFFFFF"
      rounded: "{waterline.rounded.button}"
      padding: "14px 24px"
      minHeight: "48px, never below the 44px mobile floor"
      typography: "500 14px/1.35 Poppins"
    button-on-dark:
      backgroundColor: "{waterline.colors.citron}"
      textColor: "{waterline.colors.ink}"
      rounded: "{waterline.rounded.button}"
      usage: "only where ink loses separation from its own surface: the homepage header over the scene photo, the two sticky CTA bars, the near-black owner hero"

# LEGACY — the pre-Waterline system. Kept for two reasons, neither of them
# guidance. scripts/design/design-lint.js treats every hex in this file as the
# sanctioned palette, and the 51 legacy guide routes still carry these colours as
# non-clickable accents, so deleting them would flag all of that as off-brand
# overnight. Do not build a new surface from anything below this line.
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
  stone-mid: "#595959"
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
    retired: "2026-09-10 — see 'Legacy gold CTAs'. Recorded for provenance only. Do not apply to a new control."
    backgroundColor: "linear-gradient(135deg,#E3C47A 0%,{colors.gold} 38%,#8E6D28 62%,{colors.gold} 100%)"
    textColor: "#2A2014"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "15px 32px"
    usage: "retired — overridden to the Waterline ink or citron button in guest.css"
  button-solid-gold:
    retired: "2026-09-10 — see 'Legacy gold CTAs'. Recorded for provenance only. Do not apply to a new control."
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
    usage: "over-imagery ghost; formerly paired with the retired button-solid-gold"
  property-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.stone}"
    rounded: "{rounded.md}"
    padding: "20px"
  section-tag:
    textColor: "{colors.brand-dark}"
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

# Seascape design direction

## Product promise
Help a group choose one of the real homes, understand the details that could change its choice, and arrive at Hostaway with dates and guest count intact. Seascape is a small, owner-operated collection in Bradenton and Sarasota. Do not make it look like an island-wide resort or an unlimited marketplace.

## Guest journey: Waterline (September 2026)
The homepage, catalog, property details, owner hub, and About page use the scoped `guest-site` theme in `src/css/guest.css`, plus `src/css/arrival.css` (homepage scenes) and `src/css/about.css` (About sections). The guide index, field-journal guides, two homepage comparison guides, and stay collections share the guest header and footer. Their editorial bodies keep their existing typography, except a guide converted to the planning-guide frame below and one long-read exception: on the older field-journal guides, body paragraphs and list items read at 17px over 1.75 line height with a 68ch measure, set once in `guest.css` on `article.article-text` (October 2026; the inline guide styles stay as written). Generated owner landers and other legacy routes keep the tokens above until redesigned.

- Canvas: sun-warmed paper `#F6F3EB`; ink and primary controls: deep marine `#173D42`; supporting text: `#52676A`; accent: clay `#A4533E`; selected scene and photographic CTA: citron `#D6EB85`; rules: `#CAD4CF`. Citron is a surface/accent, never small text on paper.
- Display type: self-hosted Instrument Serif, regular and italic, under its included SIL Open Font License. Poppins remains the practical body and control face. Large, compact display lines are deliberate; factual text stays readable.
- The photographic homepage opening leads on both desktop and mobile. Name the actual pictured home. Guests can preview each home manually; never auto-rotate scenes. Keep a direct property link for each scene and a clearly labeled date/guest form immediately after the collection selector. Navigation offers a direct jump to the form.
- The postcard collection uses shallow perspective, an open fan on desktop, and full readable cards in a native horizontal snap list on mobile. Desktop cards stay in one count-agnostic row so a new home cannot wrap off the fan. Hover enhances a card; tap and keyboard provide the complete path. Never hide information behind hover alone.
- Carry expressive type, photographic scale, calm rules and marine/paper contrast through the catalog and property pages. A catalog card carries no photo-number badge; its title is Instrument Serif at 40px on every width, the one reason to choose sits in open space under it, the ink "Check dates" button is the only strong control, and the details link stays at its quiet 12px secondary weight (October 2026). Keep the working comparison table and conventional booking panel. Property photos remain real rectangles, not simulated rooms or a fictitious floor plan.
- Motion has three jobs: identify a newly selected home, give the collection tactile depth, and connect its photo to the detail page. Use browser-native CSS/Web Animations and same-origin view transitions as progressive enhancements. No loader, scroll hijacking, autoplay, custom cursor, or required animation library. The static reduced-motion and no-JavaScript paths remain complete.
- Pointer and touch presses use subtle feedback (up to 3% scale, 120ms) when motion is allowed. Keyboard scene selection and horizontal selector movement are immediate. Keyboard card focus keeps the visible outline without lifting or enlarging the card. Desktop card hover movement is limited to fine pointers and 200ms; reduced-motion users keep the static layout.
- Desktop content can reach 1280px, with a full-width opening photograph. Controls remain at least 44px tall, with visible focus, clear labels and quiet solid surfaces. No animation may delay booking or be required to reveal essential information.

## Planning guides (October 2026)
A planning guide finishes one trip-planning task: when to come, how to get there, what a week costs. A guide in this family converts to the frame below one guide at a time; a converted guide carries `planning-guide` on its `body` and renders its body in the Waterline tokens. The design launcher's `planning` family (`scripts/design/design-donor-router.js`) names the candidates; each conversion names its guide and is its own approval from Sawyer. Sawyer approved the direction on October 2, 2026 from desktop and phone boards of the weather guide. The build contract for each conversion is a mock built in the synced Claude Design project.

- **Frame, same words.** Conversion keeps the title, description, headings, answer, table figures, sources and links identical; prove it with a text diff against the page it replaces.
- **Opening.** Label and Instrument Serif title on the left, the quick answer as a serif lede on the right, stacked on a phone. Rules separate the parts; the legacy banner, pill badge and boxed answer are retired on a converted guide.
- **Instrument.** One figure directly under the answer, specific to the guide's subject and drawn from data the guide already publishes (weather: a twelve-month strip of normal highs, lows and rain days). It is static markup generated at build time, carries a text label, and the full table stays on the page as its data source. Ink draws the primary marks; clay is reserved for cautionary readings such as rain and storm season. The instrument is a data figure, separate from the editorial illustrations below; a guide's existing illustrations and photographs stay as they are through a conversion. A guide with no dataset of its own uses the steps alone.
- **Steps.** Sections carry numerals 01, 02, 03 beside the heading, leaving the heading text as written. On desktop an "In this guide" rail lists the steps and stays in view; on a phone the numerals carry the sequence.
- **Tables.** Every column is visible at 360, 375 and 393px wide, so a converted guide has no swipe hint.
- **Your dates.** When the site's trip memory holds dates, the instrument marks those months with a citron surface and an ink "Your dates" label. It is a progressive enhancement reading only the stored arrive and depart dates; the figure is complete without it, and the mark states the guest's dates only, never an opening or a quote.
- **Booking box and close.** The guide booking box keeps its position, content and tracking through a conversion. Sawyer approved the Waterline restyle of the box on October 24, 2026: same words, links and tracking, with an ink top rule, ruled rows, ink buttons and no old-palette surfaces (no gradient, shadow, gold or radius above 4px). The closing band is solid ink with the paper button and ink text guides already use there (10.62:1 against the band, so it needs no hairline). Citron stays reserved for the surfaces listed under `button-on-dark`.
- **Floors.** A converted guide is held to F1, F2 and F3 across the whole page; see the scope note under Floors.
- **Measurement.** A guide inside an open readback window converts after that window is read.

## Guide figures: when a guide earns a chart or diagram

The four tests a guide must pass before it gets a chart or diagram, and how that figure is built, live in `docs/design/guide-figures.md`.

## Photography is evidence
Only an actual photograph of the named property may illustrate its accommodation. A destination scene may illustrate a clearly named destination, never a failed home photo.

`properties-fallback.json` records the selected local photo, its original Hostaway URL and verification date. Local copies make the approved photography reliable for guests and offline visual tests. Recheck property identity and room/view claims before changing an image. Do not create, retouch, or replace accommodation features with generated imagery.

If an image cannot load, show a neutral named unavailable state. Never substitute the site OG image, a guide photograph, or another home. Visual proof must fail on a missing expected property image; a fallback is not a passing design baseline.

- **Editorial illustrations:** Clearly illustrated, non-location planning subjects may support guide text, as approved for the family guide on September 9, 2026. Use the existing cream/teal/gold palette, descriptive alt text, and an editorial-illustration caption. Retain real photography for property galleries, property/destination heroes, amenities, and named places; illustrations must not imply an actual rental or destination scene.

## Trust and usability
- Facts, room layouts and policies come from canonical property data and explicitly reviewed booking-source facts. Unknown is not false or included. Quote and cancellation terms come from the current Hostaway checkout.
- Never claim universal savings, flexible cancellation, ratings, review counts or response times without supporting evidence.
- Distinguish mainland Bradenton homes from Anna Maria Island itself. Only Dockside Dreams has the waterfront dock.
- Do not label capacity matching as availability. A remembered trip or cached opening is not a valid quote.
- Use clear labels, keyboard-operable controls, visible focus, native date inputs/dialog behavior, and reduced motion. Test 390px, a narrower 375px, tablet, and desktop.
- A sticky action must not cover the form, navigation, or content. No unsolicited popup should interrupt the core guest journey.
- Exception (Sawyer, 2026-10-24): the desktop-only homepage exit-intent email signup in `src/assets/js/guest.js`, shown once per 7 days when the cursor leaves the page. Audits do not flag it.

Floors (the contract every change to these routes must leave true, enforced in `tests/visual/design-floors.spec.js`, `scripts/enforcement/shared-shell.test.js` and `scripts/enforcement/internal-link-floor.test.js`):
- F1 — Minimum font size: no visible text renders below 12px, on desktop or mobile, including decorative eyebrows.
- F2 — Tap targets: on mobile (393px), every link, button, input, select and summary has a hit box of at least 44×44px, except inline links inside flowing sentences.
- F3 — No overflow: the page never scrolls horizontally at 360, 375 or 393px.
- F4 — Hero contrast: on the homepage, white text over the scene photo reaches 4.5:1 (text under 24px) or 3:1 (24px and larger) for every scene, measured on rendered pixels.
- F5 — One shared shell: every built HTML page has exactly one `class="g-header"` and one `class="g-footer"`.
- F6 — Internal-link distribution: a hub page the shared shell links to stays linked from at least 70% of built pages. Editing a shared header or footer redistributes internal links across the whole site at once, and no other gate here can see it: URLs, titles, canonicals and JSON-LD stay identical, the link validator only checks that links which exist still resolve, and the visual gate's per-route pixel tolerance absorbs a footer change without a diff.

F1 and F2 apply to the whole page on the Waterline guest routes (`body.guest-site`, the routes under Guest journey above) and, on every other route, to the shared header, mobile menu and footer only. A converted planning guide (`body.planning-guide`) joins the whole-page scope, and `tests/visual/design-floors.spec.js` enforces it on every converted guide route (first conversion: the vacation cost guide, October 2026). The other pages carry the shared shell but keep their legacy body typography, which has not been brought to the floors yet. That narrower scope is a stopping point for one release, not a permanent rule: widening it is the work that finishes the redesign, and until then a legacy page body can still ship text below 12px without the gate objecting.

## Scales, states and forms (October 2026)

The `space`, `motion`, `shadow` and `breakpoints` keys in the `waterline:` block are the scales. How they are used and checked, plus the state rules and the nine form patterns, live in `docs/design/scales-states-forms.md`.

## How this direction changes
This file records current choices, not proof they are good. How to revise it, and why Waterline won in September 2026, live in `docs/design/direction-changes.md`.

## Legacy gold CTAs

Gold is retired on every legacy route; the per-surface replacement rules (ink, citron or paper, picked by measured contrast) live in `docs/design/legacy-gold-ctas.md`.
