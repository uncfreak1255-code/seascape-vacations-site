# Handoff: Booking-Attribution Identity Bridge + Guide-Winner Direct-Book CRO

*Created: 2026-06-29 · Source: `docs/reports/2026-06-29-seo-ai-search-audit.md` (highest-leverage move) · Owner repos: `seascape-vacations-site` (lead), `seascape-analytics` (consumer, mostly ready), `seascape-ops` (Hostaway write path)*

> **One sentence:** Mint a durable handoff ID on the site, carry it through the
> booking engine onto the Hostaway reservation, and point the site's only real
> organic asset (the winner guides) at a measurable direct-book path — so for
> the first time a search/AI click can be tied to a booked reservation.

This is **one move, not two.** The bridge with no traffic measures nothing; the
CRO with no bridge can't be proven. Ship them together.

---

## Why this is the bet (recap, evidence-backed)

- Owner acquisition is the #1 bottleneck but is an **off-repo sales job** — the
  site can't manufacture owner demand (~42 owner impr/wk). That lane is handled
  separately (owner outbound cadence).
- The #2 bottleneck — **direct-book conversion on existing guest demand** — is
  the highest-leverage *on-repo* work, and it is **founder-proof** (needs no
  send-discipline) and **demand-backed today**.
- The demand already exists and lands on the guides: `guide_winners` =
  ~5,400 impr/wk and ~211 GA4 sessions/wk (`docs/status/next-batch.md`), the
  largest real-traffic asset on the site.
- Yet **0 attributed direct bookings** and **0 tracked guide→booking transfer
  events** across cycles. The audit confirmed the root cause is not "no demand"
  — it is a **measurement gap**: the funnel cannot connect a click to a booking.

---

## Current state — what already exists (do NOT rebuild)

**Analytics side is ~80% ready.** `seascape-analytics` already models the bridge:
- `db/init/02_weekly_ops_ledger.sql` → `direct_booking_attributed_reservations`
  carries `booking_engine_handoff_id`, `booking_engine_handoff_url`,
  `site_session_ref`, `guest_identity_key`, plus `join_quality` /
  `join_evidence` / `join_evidence_count`.
- `scripts/weekly_ops_ledger.py:974-1004` already reads those fields and computes
  `join_quality` = **tight** when `guest_identity_key` + a target trace + a
  campaign-or-handoff trace are present, else `reviewed`/`weak`.
- `queries/contracts/weekly_direct_booking_attribution_v2.json` already enforces
  proof-first claims: page activity ≠ bookings, touchpoints ≠ revenue, and
  `direct_booking_attribution_v2` degrades to `page_level_only` without reviewed
  reservation rows. **Do not weaken this contract.**

**Site side already emits funnel events.** `src/assets/js/conversion-tracking.js`
fires a `booking_engine_handoff` event and a `SUPPORTED_EVENTS` set that includes
`guide_book_direct_click`, `guide_stay_click`, `stay_view_property_click`,
`property_check_availability_click`, `property_booking_page_click`.

**Guides already link to money pages and have CTAs.**
`src/guides/bradenton-vs-sarasota.html` has 9 `guide_book_direct_click` CTAs and
in-body links into `/stays/anna-maria-island-vacation-rentals/`,
`/stays/bradenton-vacation-rentals-near-beaches/`,
`/stays/siesta-key-area-vacation-rentals/`;
`anna-maria-island-vs-siesta-key.html` has 10. The links are not the gap.

## The two real gaps

1. **The site never mints or persists a handoff identifier.**
   `buildBookingEngineHandoffUrl` (`conversion-tracking.js:153-227`) only copies
   `utm_*` / `ref` / `checkin` / `checkout` / `guests` onto the outbound
   `book.seascape-vacations.com` URL. There is **no UUID, no `site_session_ref`,
   no server receipt**, and nothing writes the ID onto the Hostaway reservation.
   So `weekly_ops_ledger.py` always falls back to `weak`/no-handoff joins → no
   `tight` attribution is ever possible.

2. **The guide funnel converts poorly and the lever was never measured.**
   `bradenton-vs-sarasota` fell #1 → #3-5; guide→stay→handoff transfer events are
   0; `ami-vs-siesta` has demand but its CTA lever "was never moved" across cycles
   (prior briefs left Post-Reread Outcome blank). CTAs exist but placement,
   above-fold prominence, and the savings value-prop are unproven.

---

## PART A — Booking-Attribution Identity Bridge

**Goal:** every `booking_engine_handoff` carries a durable, server-witnessed ID
that survives onto the Hostaway reservation, so the analytics join reaches
`tight` quality and `direct_booking_attribution_v2` can emit
`booking_attributed` honestly.

### A1. Mint + persist the handoff ID (site)
- In `conversion-tracking.js`, generate a `site_session_ref` once per session
  (UUIDv4 via `crypto.randomUUID()`), persisted in `sessionStorage` (+ a
  first-touch copy with landing page, referrer source-context, and timestamp).
- In `buildBookingEngineHandoffUrl`, add a per-click `booking_engine_handoff_id`
  (UUID) and stamp BOTH `site_session_ref` and `booking_engine_handoff_id` onto
  the outbound `book.seascape-vacations.com` URL (extend
  `BOOKING_ENGINE_HANDOFF_KEYS`). Keep the existing UTM/ref logic.
- Include `page_slug` / `guide_slug` / `placement` (already available via
  `node.dataset`) so the handoff carries which guide/stay produced it.
- **Constraint:** keep `SENSITIVE_ANALYTICS_KEY_PATTERN` redaction intact — the
  handoff ID is an opaque UUID, never PII.

### A2. Server-witness the handoff (site → Netlify function)
- Add `/.netlify/functions/booking-handoff-receipt` (mirror the existing
  `guest-email-capture` function pattern). On each `booking_engine_handoff`, POST
  `{handoff_id, site_session_ref, page_slug, property_slug, utm_*, ts}` and
  persist to a durable store (Netlify Blobs — already a dependency — or a
  lightweight append log). This is the server receipt the audit flagged as
  missing; it makes the handoff provable even if the client GA4 beacon is lost.
- Emit the same `booking_engine_handoff` to GA4/dataLayer as today (no regression
  to existing event consumers).

### A3. Carry the ID onto the reservation (booking engine → Hostaway, `seascape-ops`)
- The booking engine at `book.seascape-vacations.com` must persist the inbound
  `booking_engine_handoff_id` / `site_session_ref` onto the created reservation.
  At 5 homes the **minimum viable path** is acceptable: write the ID into a
  Hostaway reservation **custom field or note** (manual paste is tolerable to
  start; automate if the booking engine supports passing it through).
- The redacted Hostaway snapshot that `seascape-ops` produces for analytics must
  surface that field as `booking_engine_handoff_id` / `site_session_ref` on the
  reservation row. **Boundary:** this write path is `seascape-ops` work; file the
  exact field name as a cross-repo dependency before site A2 ships.

### A4. Close the loop (analytics — mostly wiring, not new model)
- Feed reservation rows (with the handoff fields) into the existing
  `prepare_attributed_reservation_rows` import → `weekly_ops_ledger.py`. The
  INSERT and `join_quality` logic already exist (lines 1192-1240).
- Verify a seeded test reservation with a known `booking_engine_handoff_id`
  produces `join_quality = tight` and a `booking_attributed` row, and that a row
  WITHOUT the ID still correctly degrades to `reviewed`/`page_level_only`.
- **Do not** relax `weekly_direct_booking_attribution_v2.json` forbidden_claims.

### Part A proof gate (name it before building)
- **Unit/contract:** site test asserts the outbound booking URL contains a
  well-formed `booking_engine_handoff_id` + `site_session_ref`; the receipt
  function returns 200 and persists. Extend `verify:direct-booking-events`.
- **Integration:** one real (or seeded) reservation flows site → receipt →
  Hostaway field → snapshot → `direct_booking_attributed_reservations` with
  `join_quality = tight`. That single end-to-end row is the definition of "the
  bridge exists."

---

## PART B — Repoint Guide-Winners at Direct-Book CRO

**Goal:** convert the existing ~211 sessions/wk of guide traffic into measurable
book-direct handoffs, and recover the lost rankings that feed it. Use the
existing scoped skills — `page-cro`, `serp-ctr-title-rewrite`,
`internal-link-targeting` — not new tooling.

> **Gate check first:** confirm the move against `docs/status/next-batch.md`
> (it said `open next batch` around `/guides/anna-maria-island-vs-siesta-key/`
> on 2026-06-20) and the `next-batch-gate` skill. Honor the content/voice gate
> and `ranking-regression-rescue.md` for the bradenton-vs-sarasota recovery.

### B1. Recover bradenton-vs-sarasota's lost #1 (regression rescue, NOT links)
- Root cause per audit is **freshness + SERP competitiveness**, not internal
  links (the in-body links already exist). Run Gate 0 against the live SERP
  (Zachos Realty, midflorida.com, Reddit, TripAdvisor), tighten the vacation
  intent vs the homebuyer-oriented competitors, refresh the "Reviewed June 2026"
  proof, and use `serp-ctr-title-rewrite` for the title/snippet.

### B2. CRO the guide → stay → handoff path (page-cro)
- The guides have CTAs but 0 transfer. Make the **direct-book value prop**
  (save 10-15% vs Airbnb/VRBO, local team) explicit and above the fold; tighten
  the near-island-not-on-island honesty boundary so the CTA is trustworthy.
- Ensure every `guide_book_direct_click` / `guide_stay_click` and the downstream
  `stay_view_property_click` → `booking_engine_handoff` fire with the Part A IDs,
  so the whole guide→stay→handoff chain is one measurable funnel
  (`weekly_direct_booking_attribution.sql` already aggregates these counts).
- Apply the same pass to `ami-vs-siesta` (demand present; its CTA lever has
  never been moved — this is the first real test of it).

### B3. Honor the loop-closure rule (process fix the audit demanded)
- Fill the brief's **Post-Reread Outcome** with measured numbers after the next
  `seascape-analytics` weekly read — impressions, CTR, position, and the new
  handoff/transfer counts. **No second rescue of these pages until this is
  filled.** This is the rule that stops the rescue treadmill.

### Part B proof gate
- `npm run lint:content && npm test && npm run verify:release`; visual gate
  (`npm run test:visual`) + fresh desktop/mobile screenshots if layout/CTA
  styling changes; live smoke trio post-merge
  (`verify:recovery:live`, `verify:direct-booking-events`,
  `verify:owner-funnel-routes`).
- **Outcome gate (the real one):** the next weekly read shows non-zero
  `handoff_event_count` / `direct_book_click_count` attributable to the guides,
  and bradenton-vs-sarasota rank recovery is confirmed by rank history or live
  SERP.

---

## Sequencing & dependencies

```
Week 1   A1 (mint+persist IDs)  →  A2 (server receipt)        [site, parallelizable]
         ── file A3 field-name dependency to seascape-ops early ──
Week 1-2 A3 (Hostaway field) [ops]  ‖  B1 (rank rescue) [site, independent]
Week 2   A4 (analytics wiring + seeded end-to-end test)
Week 2-4 B2 (guide CRO) — depends on A1/A2 so transfers are measurable
Week 3-4 First weekly read → fill Post-Reread Outcome (B3)
```

- **Hard dependency:** B2's "measurable" claim depends on A1/A2 shipping first.
  B1 (rank rescue) is independent and can start immediately.
- **Cross-repo dependency:** A3 field name must be agreed with `seascape-ops`
  before A2 finalizes the receipt payload shape.

## Boundaries (per AGENTS.md)
- **site** owns: handoff-ID minting, the Netlify receipt function, page/CTA
  instrumentation, guide CRO and rank rescue.
- **analytics** owns: the pipeline (already built) — only wiring + tests here;
  do not add a new GA4/Hostaway client.
- **ops** owns: writing the handoff ID onto the Hostaway reservation + the
  redacted snapshot field.
- **hub** owns: the durable decision/result writeback once a `tight` attributed
  reservation actually lands. No revenue/savings claim until then.

## Definition of done
1. A real booking handoff produces a `booking_engine_handoff_id` +
   `site_session_ref` on the outbound URL and a server receipt. ✔ testable now.
2. One end-to-end reservation reaches `direct_booking_attributed_reservations`
   with `join_quality = tight`. ✔ the bridge exists.
3. The winner guides show non-zero measured book-direct transfer events in a
   weekly read, and bradenton-vs-sarasota rank recovery is confirmed.
4. The Post-Reread Outcome section is filled with real numbers (loop closed).

## Open decisions for Sawyer
1. **Hostaway carry mechanism:** custom field vs reservation note vs booking-
   engine passthrough? (Determines how automated A3 is. Manual note is fine to
   start at 5 homes.)
2. **Server receipt store:** Netlify Blobs (already a dep) vs a simple append
   log vs a tiny KV. Recommendation: Blobs — lowest new surface.
3. **Scope of first CRO batch:** both winner guides at once, or
   bradenton-vs-sarasota first (rescue + CRO) then ami-vs-siesta? Recommendation:
   bradenton first as the rescue, ami-vs-siesta as the clean CRO test.
4. Is the booking engine (`book.seascape-vacations.com`) ours to modify, or a
   third-party that limits what query params survive to the reservation? This
   gates whether A3 can be automated.
