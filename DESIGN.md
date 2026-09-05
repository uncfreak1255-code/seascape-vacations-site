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
Help a group choose one of five real homes, understand the details that could change its choice, and arrive at Hostaway with dates and guest count intact. Seascape is a small, owner-operated collection in Bradenton and Sarasota. Do not make it look like an island-wide resort or an unlimited marketplace.

## Guest journey: Waterline (September 2026)
The homepage, catalog, and five property details use the scoped `guest-site` theme in `src/css/guest.css`, with homepage scenes in `src/css/arrival.css`. Other routes retain the legacy tokens above until deliberately redesigned.

- Canvas: sun-warmed paper `#F6F3EB`; ink and primary controls: deep marine `#173D42`; supporting text: `#52676A`; accent: clay `#A4533E`; selected scene and photographic CTA: citron `#D6EB85`; rules: `#CAD4CF`. Citron is a surface/accent, never small text on paper.
- Display type: self-hosted Instrument Serif, regular and italic, under its included SIL Open Font License. Poppins remains the practical body and control face. Large, compact display lines are deliberate; factual text stays readable.
- The photographic homepage opening leads on both desktop and mobile. Name the actual pictured home. Guests can preview each of the five homes manually; never auto-rotate scenes. Keep a direct property link for each scene and a clearly labeled date/guest form immediately after the collection selector. Navigation offers a direct jump to the form.
- The five-home postcard collection uses shallow perspective, an open fan on desktop, and full readable cards in a native horizontal snap list on mobile. Hover enhances a card; tap and keyboard provide the complete path. Never hide information behind hover alone.
- Carry expressive type, photographic scale, calm rules and marine/paper contrast through the catalog and property pages. Keep the working comparison table and conventional booking panel. Property photos remain real rectangles, not simulated rooms or a fictitious floor plan.
- Motion has three jobs: identify a newly selected home, give the collection tactile depth, and connect its photo to the detail page. Use browser-native CSS/Web Animations and same-origin view transitions as progressive enhancements. No loader, scroll hijacking, autoplay, custom cursor, or required animation library. The static reduced-motion and no-JavaScript paths remain complete.
- Desktop content can reach 1280px, with a full-width opening photograph. Controls remain at least 44px tall, with visible focus, clear labels and quiet solid surfaces. No animation may delay booking or be required to reveal essential information.

## Photography is evidence
Only an actual photograph of the named property may illustrate its accommodation. A destination scene may illustrate a clearly named destination, never a failed home photo.

`properties-fallback.json` records the selected local photo, its original Hostaway URL and verification date. Local copies make the approved photography reliable for guests and offline visual tests. Recheck property identity and room/view claims before changing an image. Do not create, retouch, or replace accommodation features with generated imagery.

If an image cannot load, show a neutral named unavailable state. Never substitute the site OG image, a guide photograph, or another home. Visual proof must fail on a missing expected property image; a fallback is not a passing design baseline.

## Trust and usability
- Facts, room layouts and policies come from canonical property data and explicitly reviewed booking-source facts. Unknown is not false or included. Quote and cancellation terms come from the current Hostaway checkout.
- Never claim universal savings, flexible cancellation, ratings, review counts or response times without supporting evidence.
- Distinguish mainland Bradenton homes from Anna Maria Island itself. Only Dockside Dreams has the waterfront dock.
- Do not label capacity matching as availability. A remembered trip or cached opening is not a valid quote.
- Use clear labels, keyboard-operable controls, visible focus, native date inputs/dialog behavior, and reduced motion. Test 390px, a narrower 375px, tablet, and desktop.
- A sticky action must not cover the form, navigation, or content. No unsolicited popup should interrupt the core guest journey.

## How this direction changes
This file records deliberate current choices; it is not proof that a choice is good. Authorized product/design work may revise it after examining a rendered alternative, the guest task, truth, accessibility and performance. A specific model, external design app, color, font, button shape, or template is not an approval authority.

Use the existing design specialist/critic for useful challenges and the existing browser/Playwright workflow for proof. Do not add a new review layer. For material changes capture the actual desktop/mobile route, important interactive states, and real photos. Label mocked availability or pricing. Inspect images and page identity before updating any baseline.

## Direction decision
The September 4 Open House draft preserved useful guest behavior but was visually too restrained. On September 5, two new real-photo slices were rendered on desktop and mobile: cinematic Waterline and Spatial Atlas. Waterline won for photographic presence and a clear active home; the atlas won for personality but obscured adjacent cards on a narrow screen. The chosen direction combines Waterline's opening with a readable, responsive postcard collection. The prior draft remains in Git and the before/after proof; its existence is not a reason to keep weak composition.
