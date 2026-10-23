# Content Priorities — November 2026

> Status: DRAFT for Sawyer's review. Drafted 2026-10-20 by SEO & AEO Desk (Grok Bot).
> Replaces: `content-priorities-2026-10.md` when approved.
> Canon: `seascape-hub/context/seascape-properties.md` (7 live homes, all in Bradenton or Sarasota; **no home on Anna Maria Island**). North star: direct-booking revenue.

## 1. Gate status

Source: `docs/status/next-batch.md`, Latest Execution Read, run 2026-10-18.

- Site work gate: `clear` (joined GSC + GA4 covers 2026-10-10 to 2026-10-16).
- Reread status: `fresh but below threshold`. Report recommendation: `hold-and-reread`.
- Allowed now: bounded rescue of a confirmed winner or money-page regression (`docs/process/ranking-regression-rescue.md`), truth fixes, tests, readbacks, drafts.
- **Expansion blocked** by `seascape-hub/decisions/2026-05-16-truth-remediation-before-seo-expansion.md` until the open pool-heat truth defects in §5 are closed and covered by `scripts/enforcement/property-truth-invariants.test.js`, and Analytics supplies a receipt opening the next batch.

## 2. Business evidence

Internal booking and revenue figures are omitted from this public document. Verify the proposed booking-value ranking against private Analytics and Hub evidence before approval.

## 3. Sub-markets (ranked; score = booking value 1–5 × winnability 1–5)

| # | Sub-market | Value | Win | Score | Evidence |
|---|---|---|---|---|---|
| 1 | Bradenton private-pool homes (4 established homes + Blue House + The Coastal = 6 Bradenton homes) | 5 | 4 | **20** | Bradenton rental-intent GSC 228 impr, pos 12.9, 0 clicks (2026-09-18 to 2026-10-15). AI (OpenSEO 2026-10-12): "private pool in Bradenton FL" 0/5 cited, "family pool home Bradenton" 0/4, "pickleball Bradenton" 0/5. Sarasota Luxe is the seventh portfolio home. |
| 2 | Sarasota Luxe — downtown Sarasota pool home | 4 | 4 | **16** | "sarasota vacation rentals" 1,083 impr, pos 9.8, 0 clicks; `/stays/luxury-vacation-rentals-sarasota/` 1,029 impr, 0 clicks (same window). AI "St. Armands pool home" 0/5. Hub: downtown walkable, Siesta/Lido 3 mi (10 min). |
| 3 | Large groups (The Oasis sleeps 16) + Dockside Dreams dock (the only home with a dock) | 4 | 3 | **12** | AI already cites Seascape: "sleeps 16 near Bradenton" 2/4, "private dock Bradenton" 2/4. Search demand thin (large-group 25 impr, waterfront 276 impr, pos 8.2). |
| 4 | AMI-adjacent from Bradenton (mainland base, measured drive to AMI beaches) | 4 | 2 | **8** | Largest demand: AMI rental-intent 11,805 impr (2026-02-11 to 2026-10-17), 673 impr pos 15.7 last 28 days; "ami vacation rentals" 83 impr pos 10.7. Hub distances: Dockside → Bradenton Beach 2.9 mi (10 min); Oasis → Holmes Beach 5.4 mi, Bradenton Beach 5.7 mi; River House → AMI beaches 15 min; Bradenton Pool Home → Bradenton Beach 6.9 mi, Holmes Beach 8.7 mi. AMI Locals and Anchor Down own island inventory; AI "heated pool near AMI" 0/5. Copy must say mainland Bradenton, never "on AMI". |

## 4. Work queue (ranked)

| # | Item | Type | Starts without asking? | Source |
|---|---|---|---|---|
| 1 | Close pool-heat truth defects (§5) and add an invariant | Truth fix + test | Yes (remediation is authorized) | hub decision 2026-05-16, hub `seascape-properties.md` Portfolio Amenity Billing Baseline |
| 2 | Property-page rescue | Rescue | Brief yes; source edit after Gate 0 complete + Sawyer | `docs/briefs/2026-10-property-pages-rescue.md` |
| 3 | AMI vs Siesta Key rescue (variant repair only with newer conflicting evidence) | Rescue | same | `docs/briefs/2026-10-ami-vs-siesta-key-rescue.md` |
| 4 | Google VR channel diagnosis | Investigation (analytics/ops) | Yes, read-only | analytics work order |
| 5 | Sarasota Luxe answer page (proposed retitle of `/stays/luxury-vacation-rentals-sarasota/`; may qualify as bounded rescue if Gate 0 confirms a regression) | Proposed improvement unless rescue gate qualifies | **No** — blocked until #1 closes and Analytics opens the next batch, unless the bounded-rescue lane independently qualifies | §3 row 2 |
| 6 | Bradenton private-pool answer page | Expansion | **No** — blocked until #1 closes and Analytics opens the next batch | §3 row 1 |
| 7 | GBP primary category + completeness audit | Local | Audit yes; changes need Sawyer | candidate test |

## 5. Open truth defects (block expansion, not rescue)

Canon: pool heat is an optional extra at **every managed home**, **$40/night**. Before arrival it must cover the whole stay; after arrival it covers all remaining nights. Approved long-stay flat rates remain valid. Pool heat is never described as included (hub decisions 2026-10-10, 2026-10-11, 2026-10-13).
1. `src/_data/seoPages.json` (around lines 443, 904, 1347, 1378, 1385) prices pool heat at "$40/day" and/or scopes it to "the five established homes".
2. `src/_data/properties-fallback.json` `coastal-stay.poolHeat` says "Confirm the fee" — replace uncertainty about the standard price with the complete portfolio rule above.
3. Five established homes' `poolHeat` ("Pool heating costs extra. Confirm the charge…") omit the price and charging-period rules. Blue House's fallback (around line 1054) says to request heat at booking/before arrival and omits the permitted remaining-nights option. These are incomplete versus canon.
4. No invariant in `property-truth-invariants.test.js` covers the pool-heat price or charging-period rules. The suite contains 20 test declarations; a passing run is **(unverified — needs receipt)**.
Verify-only: hub `seascape-properties.md` §3 notes the site once said River House has no pool. The current fallback lists a pool; confirm the live page.

## 6. Candidate tests (CoS-filtered, 2026-10-19; none ships without a brief, a PR, and Sawyer)

- KEEP: fan-out answer pages (per-home facts only); GBP category/completeness audit; brand + place in the citable sentence; NAP-matched location pages; VacationRental markup for rich-result readiness only.
- TEST: original stats (hub distances / measured walk minutes, Hostaway booking lead time by season, bedrooms and sleeps — no pool temperatures, revenue, or occupancy); OTA-vs-direct price block (live per-home numbers that checkout matches; returning-guest code waits on Sawyer); local earned mentions; YouTube home tours.
- DROPPED: license trust strip (`DWE5106251` is River House's licence only; five live homes have no licence found, which does not establish that they are unlicensed); schema-for-AI; PR wires; Reddit; ChatGPT ads; llms.txt as a lever.

## 7. Do not start this month

- A new broad site-wide SEO audit.
- Any page that says a home is on Anna Maria Island, or that pool heat is included.
- Any waterfront, dock, or canal claim for a home other than Dockside Dreams.
