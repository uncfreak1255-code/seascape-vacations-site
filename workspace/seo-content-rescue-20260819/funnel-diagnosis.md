# Funnel Diagnosis Receipt

- Site SHA: `95721d01e3d2170074944775602a274f078b11a1`
- Analytics SHA inspected: `2d9d90cb40e651bbe0f20ad6cdade03fe9588449`
- Live GA4 current through: `2026-08-19`
- Confidence: high

The zero `booking_engine_handoff` count is mainly an event-contract problem. Catalog links can leave for `book.seascape-vacations.com` while emitting only `catalog_book_direct_click`. Guide lineage is also lost after the first internal route because only `guide_book_direct_click` creates `sv_guide_click_id`.

Decision: preserve the current event names and payload contracts. Propagate the approved source and guide-click parameters across tracked same-origin guide, stay, catalog, and property links. When a non-explicit tracked event targets the booking engine, retain its placement event and emit one additional `booking_engine_handoff` plus one existing handoff receipt. Do not change CTA copy or layout.

Historical guide-to-reservation attribution remains impossible from daily aggregate rows. That Analytics enhancement is outside this Site batch.

