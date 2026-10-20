# Brief: Pool-heat billing correction

- lifecycle: active
- scope approved: Sawyer requested this separate draft PR on 2026-10-20. Stop at draft; no merge or deployment.
- persona: Guest comparing pool homes and the complete cost before booking.
- primary keyword: vacation rentals with heated pool
- secondary keywords: Anna Maria Island pool heat fee, Bradenton heated pool rental, Sarasota pool home
- audience pattern: A guest checking heating charges before arrival or adding heat during a stay.
- proof source: Hub main `73bb60b135c0e947aa615b4353368f9d80a9446f`, verified against its remote on 2026-10-20; `decisions/2026-10-10-pool-heat-whole-stay-only.md`, `decisions/2026-10-11-pool-heat-mid-stay-remaining-nights.md`, `decisions/2026-10-13-pool-heat-every-managed-home.md`, and `context/seascape-properties.md` Portfolio Amenity Billing Baseline. Site base `41ecf4faeda5faccd4bfbee79434eac5e0254321`.
- required internal links: /properties/sarasota-luxe/, /properties/the-oasis/
- CTA target: Existing property and direct-booking links, unchanged.
- anti-claims: No free or included pool heat, daily pricing, five-home billing restriction, selected heated nights, automatic activation, guaranteed temperature or heat-up time. Preserve approved long-stay flat rates. Hot-tub/spa terms remain distinct from pool billing.

## Approved correction

Pool heat is optional at $40 per night at every managed home. A request before
arrival covers the whole stay; a request after arrival covers all remaining
nights. Approved long-stay flat rates still apply. No individual night picking.
All seven fallback entries, including Blue House and The Coastal, must say this.
Every stay entry advertising pool heat or a heated pool gets the same billing
answer; remove contradictory fee copy in existing answers and paragraphs.
Preserve weather limitations and other property facts. No new routes, search
intent, metadata, layout, or operational collection changes.

This is the October correction, superseding the June branch's day-based brief.
The pre-existing remote branch is retained without force-pushing; today's main
supplies the implementation base. The June change is preserved in Git history.

## Source Files Changed

- `src/_data/seoPages.json`: pool-heat copy and billing FAQs, also feeding FAQPage schema.
- `src/_data/properties-fallback.json`: all seven `guestFacts.poolHeat` values; the existing layout and AI-discovery template consume them.
- `scripts/enforcement/property-truth-invariants.test.js`: enforce rate, request timing, flat-rate exceptions and prohibited billing claims across every home and heat-related stay entry.
- `scripts/enforcement/property-dock-copy-invariants.test.js`: existing dock-copy tests moved unchanged so the oversized invariant file shrinks despite the added heat checks.

- `scripts/enforcement/p0-booking-evidence.test.js`: the retained price assertion now requires nightly billing, replacing its superseded daily rate.
- `scripts/enforcement/properties-data.test.js`: remove the obsolete Coastal $40 prohibition; retain all unsupported-temperature, equipment and occupancy exclusions. The new all-home invariant enforces Coastal pricing.

## Gate 0 — Existing-page factual correction

This free public read supplies the required search context; Hub decisions alone
set Seascape's price. The repair makes no ranking or conversion-lift claim.

| Field | Read |
| --- | --- |
| Target query family | Anna Maria Island vacation rentals pool heat fee; vacation rentals with heated pool. |
| Searcher intent | Guest booking: understand the optional heating charge and request timing. |
| Current Seascape URL | /stays/vacation-rentals-with-pool-and-hot-tub/ and existing heat-related stay entries. |
| SERP observed date | 2026-10-20 |
| SERP stale after | 2026-10-27 |
| Current proof | 2026-10-20 source inspection at Site 41ecf4fa: /day fees, five-home billing scope and unknown Coastal fee conflict with the three Hub decisions at 73bb60b1. Analytics impact is unmeasured. |
| Top visible competitors | Anna Maria Life, Florida Dreams and Beach House AMI appeared in the public query sample; this is not a controlled rank measurement. |
| Competitor angle | Their FAQ/terms pages explain heating conditions and billing; those policies do not set Seascape's terms. |
| Visual/format gap | None for this repair. Keep the existing FAQ and property-fact structure. |
| Seascape gap | Stay and property data omit or contradict the uniform nightly price and before/after-arrival billing rule. |
| Search fit | Keep existing pool-home routes and property CTAs; correct the fee answer before guests book. |
| Local/GBP proof | Not applicable: no business-profile, address or local-pack change. |
| AEO/readback note | FAQ text and JSON-LD share seoPages data; property copy and AI discovery share fallback facts. No paid AEO collection or lift claim. |
| Recommendation | improve: apply only the approved heat-billing correction and regression proof. |
| Attack status | completed |
| Query variants inspected | Anna Maria Island vacation rentals pool heat fee. |
| SERP source | Free public web search on 2026-10-20, followed by the three named competitor-page reads; no location control or paid tool. |
| Competitor URLs inspected | https://www.annamarialifevacationrentals.com/about-us/faq/ ; https://www.florida-dreams.com/terms-and-conditions/ ; https://www.beachhouseami.com/terms-and-conditions/ |
| Content gap and Seascape answer | State $40 per night at every managed home, whole stay before arrival, all remaining nights after arrival, with approved long-stay flat rates preserved. |
| Design/format strategy | Text and FAQ data only, using existing markup. |
| Seascape proof available | Three dated Hub decisions and the current Portfolio Amenity Billing Baseline at the verified Hub remote revision above. |
| Tools/plugins used | Git, repository files, free public web read, Node tests and offline release checks. No paid calls. |
| Decision and reason | Correct existing fee claims; do not open a growth experiment or expand inventory. |

## Copy and proof gate

- Draft the copy: lead with the optional nightly fee, then both request windows and the long-stay exception.
- Remove internal wording: no decision IDs, verification machinery or activation instructions in guest copy.
- Check voice and specificity: direct guest wording; no temperature guarantee or pressure against adding heat.
- Independent Voice Editor verdict: Approved on 2026-10-20 by the separate read-only reviewer; no introduced findings. Targeted property-truth and dock-copy tests: 21/21 pass.
- Prove the new invariant fails against unchanged source, then passes after the fix.
- Run `npm run verify:release -- --range origin/main`, including fresh build, full unit/content suite, property projections, redirects, recovery, links and JSON-LD. No `eval:aeo` or other paid evaluation.
- Check changed local route output and FAQ/schema parity. Stop at one draft PR.

## Observed verification — 2026-10-20

- New pool-heat invariant: failed on the unchanged Dockside fee copy, then passed on the corrected seven homes and 25 heat-related stay entries.
- `npm run verify:release -- --range origin/main`: passed; 1,193/1,193 tests, fresh build/content checks, design lint, 450 redirects, recovery checks, 163-page link scan and 686 JSON-LD blocks.
- Local static-server HTTP check: 25 stay routes and seven property routes returned 200 with the policy; all stay FAQPage answers match it; all seven AI-discovery property records contain it.
- Independent read-only review: Approved, no introduced findings; final matching FAQ addition and both superseded test expectations reviewed.
- No paid evaluation, production mutation or deployment. Publication target remains one draft PR.
