# Owner Proof Attribution — Batch Brief

**Date:** 2026-05-11
**Branch:** `codex/owner-proof-attribution`
**Trigger:** Voice review on `/property-management/anna-maria-island/` (per `brand-review` skill) flagged unsourced inline `proofStats` as a banned-patterns violation on the primary owner-acquisition page. Audit revealed the same gap on 22 other owner pages.

## Audit findings

- 27 owner pages total
- 4 already linked to `gulf-coast-owner-benchmark-2026` (maximize-income, mgmt-fees, licensing, vrbo)
- 23 missing `proofAssetKey`, of which:
  - **9 carry inline `proofStats` and needed real wiring**
  - **14 had empty `proofStats` arrays** — template doesn't render the proof panel without them, so linking adds zero visible attribution. Explicitly skipped.

## Edge-stat verification

Three displayed claims were NOT in the benchmark asset's `stats` array. Verified each against the linked benchmark page (`/research/owner-fee-revenue-leak-benchmark-2026/`) and the linked market report (`/guides/florida-gulf-coast-vacation-rental-market-report-2026/`).

| Claim | Verdict | Source line |
|---|---|---|
| `3-4x market-median revenue per home` (Bradenton, Siesta Key, switch-mgmt) | **REMOVED** — zero hits in source | n/a |
| `5 active homes in the operating set` (switch-mgmt) | **KEPT** — verbatim in benchmark | `src/research/owner-fee-revenue-leak-benchmark-2026.njk:138,147` |
| `15-30 hrs weekly owner time` (self-manage) | **RELABELED** — kept stat but reframed as "Seascape estimate, not benchmark-derived" | n/a (no source — labeled honest estimate) |

## Self-manage decision rationale

The `15-30 hrs weekly owner time` stat is the single most decision-relevant number on a "self-manage vs management" page — owners reading that page need a workload claim to make a comparison. Removing it for cleanliness would have broken the voice rule "Name the tradeoff."

Solution: kept the stat, rewrote `label` to `"Weekly owner time (Seascape estimate)"` and `detail` to make the operator-experience source explicit and call out that the number is NOT benchmark-derived. This satisfies `banned-patterns.md` (which targets *random* stat insertion, not labeled estimates) and preserves SEO/conversion value (E-E-A-T schema author upgrade applies regardless of stat sourcing).

## Pages changed (6)

1. `vacation-rental-management-anna-maria-island` — added proofAssetKey, applied voice-fix to benefit #5
2. `vacation-rental-management-bradenton` — added proofAssetKey, removed 3-4x stat
3. `vacation-rental-management-sarasota` — added proofAssetKey
4. `vacation-rental-management-siesta-key` — added proofAssetKey, removed 3-4x stat
5. `switch-vacation-rental-management-company` — added proofAssetKey, removed 3-4x stat
6. `self-manage-vs-property-management-florida` — added proofAssetKey, relabeled 15-30 hrs stat

## Pages NOT changed (intentional)

- **14 topic pages with empty proofStats:** Longboat Key, condo-rental-FL, new-vacation-rental-owner-guide-FL, switch-from-airbnb-self-manage, increase-bookings, pricing-strategy, marketing-FL, cleaning, maintenance, guest-screening, insurance, taxes, photography, interior-design, sell-property-FL, buy-property-FL, airbnb-management-services-sarasota. Adding the proofAssetKey wires the JSON-LD author upgrade but does not surface a visible "Benchmark Source" panel without proofStats. Defer until those pages get content investment AND the benchmark legitimately backs whatever stats get added.

- **2 stat-less pages already linked:** licensing, vrbo. Harmless — left alone.

## Verification

- ✅ JSON parses
- ✅ Build wrote 159 files in 7.42s
- ✅ Each of the 6 fixed pages renders "Benchmark Source" panel exactly once in `_site/property-management/<slug>/index.html`
- ✅ Schema.org Article `author` upgraded from generic Organization to `Sawyer Beckett, Founder, Seascape Vacations` on all 6 fixed pages
- ✅ AMI voice-fix rendered: "rates are holding, how much you are losing to Airbnb fees, and which local handoffs are dropping balls"
- ✅ Self-manage relabel rendered: "Weekly owner time (Seascape estimate)"

## Out of scope for this batch

- No new proof assets created
- No edits to topic pages
- No template changes
- No entity-expansion gates moved (per `docs/status/next-batch.md` measurement rules)
