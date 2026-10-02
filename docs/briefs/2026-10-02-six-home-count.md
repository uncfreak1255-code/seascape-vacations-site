# Brief: Current portfolio count is six

## Content Gate Inputs

- persona: guest or owner whose agent quotes a Seascape page as the current inventory
- primary keyword: none (truth correction, not a search play)
- secondary keywords: none
- audience pattern: an assistant repeats the first inventory sentence it finds, including a present-tense home count
- proof source: live catalog at https://seascape-vacations.com/properties/ on 2026-10-02, which says "6 homes" and lists Dockside Dreams, The Oasis, Sarasota Luxe, River House, Bradenton Pool Home, and Pickleball Pool Home Retreat; the same page says all have private pools and only Dockside Dreams is drawn as waterfront with a dock
- offer claim: n/a (guest-lane count correction; owner pages already say six)
- required internal links: /properties/, /guides/
- CTA target: unchanged
- anti-claims: do not change historical study denominators that correctly say five homes for June 2022 through March 2026; do not say every home is waterfront or has a dock; do not say two homes have docks; do not invent a new rate or a direct-booking savings percent
- hypothesis: a present-tense "manages 5" line is what an agent will repeat, so the measured page has to match the live catalog before any AI visibility check
- primary event: property_booking_page_click
- guardrail event: email_capture_submit
- entry criteria: flights, best-time, and restaurant guides plus two research bios still said the current portfolio is five on origin/main 06a08172
- readback window: after the corrected copy is on the production site, before the Prompt Explorer runs
- decision rule: run the two agent questions only after production no longer says Seascape currently manages five homes; do not treat a branch as the measured page

## Why This Batch

- The live catalog is six homes. Present-tense guide and bio lines still say five.
- The 2022-2026 booking studies stay at five homes. That was the sample, not the current portfolio.
- CTA lines that bundled "waterfront, pools, docks" onto the whole portfolio are rewritten in the same sentences. Only Dockside Dreams has the dock.

## Source Files Changed In This Batch

- src/guides/flights-to-anna-maria-island/index.html
- src/guides/bradenton-vs-sarasota-restaurants/index.html
- src/research/gulf-coast-vacation-booking-trends-2026.njk
- src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk
- scripts/enforcement/property-truth-invariants.test.js
