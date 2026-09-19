# Brief: guide link-claim repairs (five leftover mismatches)

## Content Gate Inputs

- persona: guest planning an Anna Maria Island trip who follows an in-guide link expecting the destination to match the promise
- primary keyword: anna maria island vacation rentals
- secondary keywords: bradenton vs sarasota, holmes beach, things to do bradenton, where to stay near anna maria island
- audience pattern: trip-planning guide readers comparing beach vs mainland bases
- proof source: src/_data/properties.js (six homes, zero on Anna Maria Island, Dockside Dreams is the canal-front waterfront home) and each destination page's own title and meta description
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-waterfront-vacation-rentals/, /guides/
- CTA target: /stays/anna-maria-island-vacation-rentals/ on the comparison guides; /stays/bradenton-waterfront-vacation-rentals/ on the Bradenton things-to-do page
- anti-claims: do not tell a reader they will stay on Anna Maria Island or on Holmes Beach when the linked page is mainland inventory; do not call a canal-front Bradenton home "steps from the action"; do not label a pool-and-hot-tub collection as Holmes Beach rentals

## Required Internal Link Map

These five guides are batched because they carry the same leftover defect class, not because they are a topical cluster.

- src/guides/bradenton-vs-sarasota.html: /stays/anna-maria-island-vacation-rentals/, /guides/sarasota-area-guide/, /guides/bradenton-area-guide/
- src/guides/anna-maria-island-vs-siesta-key.html: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /guides/anna-maria-island-area-guide/
- src/guides/where-to-stay-near-anna-maria-island/index.html: /stays/affordable-vacation-rentals-florida-gulf-coast/, /properties/dockside-dreams/, /guides/holmes-beach-vs-bradenton-beach/
- src/guides/holmes-beach-area-guide/index.html: /stays/vacation-rentals-with-pool-and-hot-tub/, /stays/vacation-rentals-near-anna-maria-island/, /guides/holmes-beach-vs-bradenton-beach/
- src/guides/things-to-do-bradenton-fl.html: /stays/bradenton-waterfront-vacation-rentals/, /guides/best-restaurants-anna-maria-island/, /guides/dolphins-manatees-bradenton/

## Why This Batch

- what changed in the data: a two-stage TypeSafe/Jev scan of 370 internal-link claims, then a second Jev pass with inventory facts in state, left eight flags not already in PR #598 or PR #599
- why this cluster wins now: one leftover is on the AMI vs Siesta page PR #576 already touched; one is on a 736-impression Bradenton guide; the others are the same on-island/on-Holmes substitution
- what should explicitly wait: three flags Jev scored as weak mismatches (shelling table cell, babymoon Gulf-water sentence, book-direct comparison path)

## Not In Scope

- retiring any page
- docking/fishing copy already in PR #599
- the three repairs already in PR #598
- wiring the scanner into a build gate

## Problem

PR #576 and PR #598 fixed referring copy that promised on-island or Gulf-front stays while linking to mainland inventory. A second scan after those repairs still found the same class on other guides.

Jev 1.13.0 scored each leftover twice: first whether the destination supports the referring sentence, then (with inventory facts in state) whether an editor should rewrite. Repair here only where both the original support score was below 0.32 and the inventory-aware mismatch was high, plus the AMI vs Siesta leftover that is the same sentence class #576 missed on first pass.

## The five claims

### 1. `/guides/bradenton-vs-sarasota/` (0 clicks / 1 impression)

"Choose Anna Maria Island if: You want to be on the beach, not just near it... See Anna Maria Island vacation rentals" pointed at mainland homes 5-15 minutes away. Inventory-aware mismatch 0.65.

**Fix:** keep the beach-days advice, say none of the listed homes sit on the island, keep the same href.

### 2. `/guides/anna-maria-island-vs-siesta-key/` (0 clicks / 13 impressions)

An early sentence still said "quieter island-first trip" while later sentences on the same page, from PR #576, already say "mainland homes 5-15 minutes away".

**Fix:** match the later honest wording.

### 3. `/guides/where-to-stay-near-anna-maria-island/` (0 clicks / 0 impressions)

"Bradenton Beach (cheapest on-island)" linked to the affordable gulf-coast collection, which is not Bradenton Beach and not on-island. Inventory-aware mismatch 0.77.

**Fix:** "near-island mainland homes", same href.

### 4. `/guides/holmes-beach-area-guide/` (0 clicks / 22 impressions)

Related-links label "Holmes Beach Rentals with Heated Pools" pointed at the Florida pool-and-hot-tub collection. Inventory-aware mismatch 0.76.

**Fix:** "Pool and hot tub homes near AMI", same href.

### 5. `/guides/things-to-do-bradenton-fl/` (0 clicks / 736 impressions)

"Stay steps from the action at our waterfront vacation rentals" pointed at the Dockside Dreams collection. That home is canal-front in a residential neighborhood, not steps from downtown. Inventory-aware mismatch 0.38; repaired because the page actually earns impressions and the honest phrasing is one clause.

**Fix:** "Stay on the water at our canal-front Bradenton rental".

## Left on the table, on purpose

- `/guides/shelling-guide-florida/` table cell "Anna Maria Island" as a trip base: adjacent Access-cell text was concatenated by row-level table parsing. Jev mismatch 0.47. Not a stay-promise.
- `/guides/family-vacation-anna-maria-island/` "Gulf waters... ideal for expecting parents" linking to babymoon rentals: the claim is about the beach, not the stay. Mismatch 0.32.
- `/stays/anna-maria-island-vacation-rentals/` "book-direct Anna Maria Island path": the destination is a checkout-total comparison, which is what the sentence asks for. Mismatch 0.23.

## Verification

- npm run lint:content, npm test, npm run verify:release
- npm run test:visual: `things-to-do-bradenton-fl` is not in visual.spec.js; `shelling-florida` is, but this PR does not edit that file

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | none; no query is being targeted |
| Searcher intent | n/a |
| Current Seascape URL | `/guides/bradenton-vs-sarasota/`, `/guides/anna-maria-island-vs-siesta-key/`, `/guides/where-to-stay-near-anna-maria-island/`, `/guides/holmes-beach-area-guide/`, `/guides/things-to-do-bradenton-fl/` |
| SERP observed date | 2026-09-18 |
| SERP stale after | 2026-10-18 |
| Current proof | `src/_data/properties.js` (six homes, zero on Anna Maria Island, Dockside Dreams is the canal-front waterfront home); destination title/meta on each linked stays page |
| Top visible competitors | n/a for a truth correction |
| Competitor angle | n/a |
| Visual/format gap | none; sentence-level copy only. Existing visual baselines for two of the five pages were regenerated. |
| Seascape gap | leftover on-island / Holmes Beach / "steps from the action" promises after PR #576, #598, and #599 |
| Search fit | no new page, no new keyword; title/meta unchanged |
| Local/GBP proof | Not a GBP or local-pack action. Organic guide pages; property-fact correction. |
| AEO/readback note | corrected sentences remain quotable and no longer contradict inventory |
| Recommendation | ship the five sentence corrections |
| Attack status | `none found after named checks` |
| Query variants inspected | none; no query lane involved |
| SERP source | n/a |
| Competitor URLs inspected | None were inspected, because a property-fact correction has no competitor lane. The three named checks resolve as follows: the current source check is the governing evidence (`src/_data/properties.js` and each destination page title/meta); a DataForSEO SERP check was deliberately not run because no query is being targeted; and a competitor-page check was deliberately not run for the same reason. |
| Content gap and Seascape answer | keep the same hrefs; rewrite the referring sentence so it matches mainland / canal-front / near-AMI inventory |
| Design/format strategy | unchanged |
| Seascape proof available | yes, from properties.js and destination meta |
| Tools/plugins used | TypeSafe Jev 1.13.0 link-claim harness |
| Decision and reason | ship: five leftover sentences still contradict inventory after the earlier PRs |

## Source files likely to change

  - `src/guides/bradenton-vs-sarasota.html`
  - `src/guides/anna-maria-island-vs-siesta-key.html`
  - `src/guides/where-to-stay-near-anna-maria-island/index.html`
  - `src/guides/holmes-beach-area-guide/index.html`
  - `src/guides/things-to-do-bradenton-fl.html`
