# Brief: SAVE50 Email Landing Cleanup

## Content Gate Inputs

- persona: guests clicking the SAVE50 welcome email and deciding which Seascape home to book direct
- primary keyword: Seascape Vacations properties
- secondary keywords: book direct Gulf Coast vacation rental, Bradenton vacation rental with pool, Sarasota vacation rental with pool
- audience pattern: email subscribers who already have a welcome code and need the site to confirm the offer without turning the property pages into coupon pages
- proof source: `[Test] Your $50 Off Code + Our 5 Best Gulf Coast Homes` email, current property inventory, and existing booking-page links
- required internal links: /properties/, /properties/dockside-dreams/, /properties/the-oasis/, /properties/sarasota-luxe/, /properties/river-house/, /properties/bradenton-pool-home/
- CTA target: direct booking handoff for the selected home
- anti-claims: do not imply the stay is free, do not hide the 3-night minimum, do not invent booking-engine coupon auto-apply behavior, and do not show a promo banner to non-campaign visitors

## Why This Batch

- The welcome email promises SAVE50: $50 off the first direct Seascape booking of 3 nights or more.
- The email links into `/properties/` and the five property detail routes, so those pages need to acknowledge the offer when a campaign visitor lands there.
- The booking handoff must keep `utm_campaign=save50_welcome` alive as the visitor moves from the site to the secure booking page.

## Cluster In Scope

- canonical URLs:
  - `/properties/`
  - `/properties/dockside-dreams/`
  - `/properties/the-oasis/`
  - `/properties/sarasota-luxe/`
  - `/properties/river-house/`
  - `/properties/bradenton-pool-home/`
- money destination: selected Hostaway booking page
- active lane: email-campaign landing clarity and attribution preservation

## Page Builder Tasks

- Add one shared SAVE50 offer module that only appears for `utm_campaign=save50_welcome` or `promo=save50`.
- Preserve email campaign parameters across property-detail links and booking-engine handoff links.
- Keep the copy quiet: state the code, $50 credit, and 3-night minimum once.

## Release Gate Checklist

- routes to smoke test:
  - `/properties/?utm_campaign=save50_welcome`
  - `/properties/dockside-dreams/?utm_campaign=save50_welcome`
  - `/properties/the-oasis/?utm_campaign=save50_welcome`
  - `/properties/sarasota-luxe/?utm_campaign=save50_welcome`
  - `/properties/river-house/?utm_campaign=save50_welcome`
  - `/properties/bradenton-pool-home/?utm_campaign=save50_welcome`
- commands to run: `node --test scripts/enforcement/save50-offer.test.js`, `npm run lint:content`, `npm run build:prod`
- regression risks to watch: visible coupon clutter for normal SEO visitors, dropped campaign UTM on property-detail clicks, or booking copy that weakens the 3-night minimum

## Done When

- campaign visitors see the SAVE50 reminder on the catalog and each email-linked property page
- non-campaign visitors do not see the SAVE50 module
- booking and same-site property links preserve `utm_campaign=save50_welcome`
