# Brief: SAVE50 Email Landing Cleanup

## Content Gate Inputs

- persona: guests clicking the SAVE50 welcome or guest-social-proof emails and deciding which Seascape home to book direct
- primary keyword: Seascape Vacations properties
- secondary keywords: book direct Gulf Coast vacation rental, Bradenton vacation rental with pool, Sarasota vacation rental with pool
- audience pattern: email subscribers who already have a welcome code and need the site to confirm the offer without turning the property pages into coupon pages
- proof source: May 29, 2026 `Your $50 Off Code + Our 5 Best Gulf Coast Homes` Outlook proof email, May 31, 2026 `What 200+ Guests Love About Our Gulf Coast Homes` Outlook proof email, current property inventory, and existing booking-page links
- required internal links: /guides/, /stays/anna-maria-island-vacation-rentals/
- CTA target: direct booking handoff for the selected home
- anti-claims: do not imply the stay is free, do not hide the 3-night minimum, do not invent booking-engine coupon auto-apply behavior, and do not show a promo banner to non-campaign visitors

## Why This Batch

- The welcome email promises SAVE50: $50 off the first direct Seascape booking of 3 nights or more.
- The guest-social-proof follow-up says the SAVE50 code is still active, so guide-page popup behavior cannot ask the same subscriber to opt in again.
- The email links into `/properties/` and the five property detail routes, so those pages need to acknowledge the offer when a campaign visitor lands there.
- The booking handoff must keep the real email campaign alive as the visitor moves from the site to the secure booking page.

## Cluster In Scope

- canonical URLs:
  - `/guides/anna-maria-island-vs-siesta-key/`
  - `/properties/`
  - `/properties/dockside-dreams/`
  - `/properties/the-oasis/`
  - `/properties/sarasota-luxe/`
  - `/properties/river-house/`
  - `/properties/bradenton-pool-home/`
- money destination: selected Hostaway booking page
- active lane: email-campaign landing clarity and attribution preservation

## Page Builder Tasks

- Add one shared SAVE50 offer module that only appears for `utm_campaign=save50_welcome`, `utm_campaign=guest_social_proof`, or `promo=save50`.
- Show the SAVE50 popup in reminder mode, not sign-up mode, when an existing email subscriber lands with those campaign parameters.
- Tighten the AMI vs Siesta Key guide conversion copy so the guest-social-proof route reads like direct-booking help, not another signup ask.
- Preserve email campaign parameters across property-detail links and booking-engine handoff links.
- Keep the copy quiet: state the code, first direct-booking rule, and 3-night minimum once.

## Release Gate Checklist

- routes to smoke test:
  - `/properties/?utm_campaign=save50_welcome`
  - `/properties/?utm_campaign=guest_social_proof`
  - `/properties/dockside-dreams/?utm_campaign=save50_welcome`
  - `/properties/the-oasis/?utm_campaign=save50_welcome`
  - `/properties/sarasota-luxe/?utm_campaign=save50_welcome`
  - `/properties/river-house/?utm_campaign=save50_welcome`
  - `/properties/bradenton-pool-home/?utm_campaign=save50_welcome`
  - `/guides/anna-maria-island-vs-siesta-key/?utm_campaign=guest_social_proof`
- commands to run: `node --test scripts/enforcement/save50-offer.test.js`, `node --test scripts/enforcement/direct-booking-event-smoke.test.js`, `npm run lint:content`, `npm run build:prod`
- regression risks to watch: visible coupon clutter for normal SEO visitors, dropped campaign UTM on property-detail clicks, popup reminder drift for returning email subscribers, or booking copy that weakens the first-booking / 3-night rule

## Done When

- campaign visitors see the SAVE50 reminder on the catalog and each email-linked property page
- guest-social-proof visitors who land on guide pages see the SAVE50 reminder state instead of a second sign-up ask
- non-campaign visitors do not see the SAVE50 module
- booking and same-site property links preserve the incoming SAVE50 campaign
