# Brief: Homepage why-book-direct bento mockups

- lifecycle: draft
- task scope: add one new homepage section with three switchable bento layouts so Sawyer can pick a look; do not restyle the hero or the locked sliding-arrow-pill control.
- completion or successor: keep draft until Sawyer names one layout; delete the other two in a follow-up before any merge to main.

## Content Gate Inputs

- persona: Gulf Coast guest who has seen the homes and is deciding whether to book on this site or default to Airbnb or Vrbo.
- primary keyword: book direct vacation rentals
- secondary keywords: book direct vs Airbnb, Bradenton vacation rentals, Sarasota vacation rentals, private pool homes
- audience pattern: high-intent guest comparing the complete checkout total and wanting a local host, not a marketplace listing.
- proof source: `src/guides/booking-direct-vacation-rentals.html` FAQ (no fixed saving; compare complete checkout totals); `src/index.njk` existing owner-operated and every-home-has-a-pool lines; `src/_data/properties-fallback.json` guest reviews and photography; pool-heat policy in `src/_data/stayFacts.js` and `docs/briefs/2026-06-pool-heat-truth-correction.md`.
- required internal links: /properties/, /guides/booking-direct-vacation-rentals/
- CTA target: /properties/ with existing `data-trip-link` catalog path.
- anti-claims: no invented dollar savings, no savings percent, no fake prices, no payment logic, no review-count theater, no invented amenities, no on-island or walk-out beach claim, no guest messaging.

## Why This Batch

- what changed in the data: look-and-feel project asked for a homepage “why book direct” bento, referenced against bentogrids.com. `docs/status/next-batch.md` reread is `fresh but below threshold` and does not open a measured SEO expansion.
- why this cluster wins now: the homepage already has homes, trip search, and reviews, but no scannable reason to book here instead of Airbnb.
- what should explicitly wait: hero restyle (another worker), title/meta rewrites, numeric savings, live merge until Sawyer picks one layout.

## Experiment And Readback Contract

- hypothesis: a five-tile “why book direct” band after the collection makes the fee and host tradeoff visible without inventing a savings number.
- primary event: existing catalog `data-trip-link` clicks from the new section CTA.
- guardrail event: homepage trip-form and collection clicks must not drop because the hero and existing sections stay unchanged.
- entry criteria: Sawyer picks one of the three layouts on this draft PR.
- readback window: not a measured SEO batch; no impact claim until a later chosen layout is published.
- decision rule: keep the picked layout and delete the other two; kill the section if it reads as generic card-grid or invents proof.

## Design Packet

- route: `/` homepage, new section only, after the collection and before the organizer.
- audience and job: guest who just saw the homes; decide to book direct.
- DESIGN.md: Waterline paper/ink/citron/muted/clay/rule/soft; Instrument Serif + Poppins; locked `--g-control-treatment: sliding-arrow-pill`.
- `npm run design:donors -- "homepage why book direct bento grid section"`: family `site-page`; no local plugin donor. Visual refs from [bentogrids.com](https://bentogrids.com/):
  - Option 1 Mosaic — Apple, Linear Asks, Notion
  - Option 2 Contrast — Clerk, Stripe customers, Attio
  - Option 3 Magazine — family.co, Dovetail, Frame.io
- critic: three materially different directions, not recolors. Default to Option 1 (editorial mosaic) because it states the fee tradeoff first without adding a second dark hero. Sawyer still picks.
- responsive: phone ~390 stacks tiles; desktop ~1440 uses the 12-column bento.
- risks: extra image is The Oasis photo already on the homepage (lazy); no map embed; no new fonts.

## Gate 0 Search And Attack Receipt

This is a homepage look-and-feel mockup. It does not change titles, meta, canonicals, schema, redirects, or the sitemap. Saved competitor notes are format evidence only.

| Field | Required answer |
| --- | --- |
| Target query family | book direct vacation rentals / why book direct vs Airbnb |
| Searcher intent | Guest booking; compare complete checkout total before defaulting to a marketplace. |
| Current Seascape URL | / |
| SERP observed date | 2026-03-30 |
| SERP stale after | 2026-04-06 |
| Current proof | `docs/status/next-batch.md` Latest Execution Read on 2026-10-24 is `fresh but below threshold`. This PR makes no ranking or lift claim. Source proof is the booking-direct guide FAQ and existing homepage facts. |
| Top visible competitors | Island Dreams Realty and other local direct-book operators named in `docs/reports/competitor-intel-2026-03.md`; format refs from bentogrids.com. |
| Competitor angle | Dedicated “why book direct” modules with dollar-savings theater. Seascape cannot copy invented percents. |
| Visual/format gap | Competitors and bentogrids.com use asymmetric bento tiles. Seascape homepage had no equivalent band. |
| Seascape gap | Homepage never stated the direct-book tradeoff in a scannable module. |
| Search fit | Keep `/` as the brand homepage. Money click is `/properties/`. Do not open a new URL or rewrite title/meta. |
| Local/GBP proof | N/A because this is a homepage layout mockup, not a Google Business Profile or local-pack action. |
| AEO/readback note | N/A for AI-citation expansion; the booking-direct guide remains the extractable answer. This section is CRO layout, not a new FAQ. |
| Recommendation | Ship three switchable layouts on a draft PR. Sawyer picks one. Do not merge until that pick. |
| Attack status | completed |
| Query variants inspected | book direct vacation rental; vacation rentals bradenton florida book direct; why book direct vs Airbnb |
| SERP source | Saved competitor intel `docs/reports/competitor-intel-2026-03.md` observed 2026-03-30; no fresh DataForSEO run because this is not a title/meta rewrite. |
| Competitor URLs inspected | https://bentogrids.com/ for layout format; https://island-dreams-realty.com/ named in the 2026-03 competitor intel as a local direct-book operator with why-book-direct content. |
| Content gap and Seascape answer | Gap is a missing homepage module. Answer: skip platform service fees, compare complete totals, talk to the local team. No invented savings number. |
| Design/format strategy | Three Waterline bento options referenced to bentogrids.com. Same sourced copy in each. |
| Seascape proof available | Booking-direct guide FAQ, owner-operated line, every-home private pool, optional pool heat, sourced guest review, The Oasis pool photo. |
| Tools/plugins used | `npm run design:donors`, bentogrids.com, repo DESIGN.md and style docs. No paid SERP run. |
| Decision and reason | Draft the section now as look-and-feel. Hold merge and any impact claim until Sawyer picks a layout. |

## Cluster In Scope

- canonical winner URL(s): /
- feeder pages: /guides/booking-direct-vacation-rentals/
- aliases or retired URLs: none
- money destination: /properties/
- active lane: direct-book stay intent

## Source And Proof Constraints

- property truth needed: private pool at every home; pool heat optional extra; reviews and photo from canonical property data.
- owner proof asset needed: none
- claims that are off-limits: dollar savings, percents, review counts, on-island inventory, walk-out beach, invented amenities, guest messaging.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: owner-operated local team, complete-checkout comparison, optional pool heat, mainland Bradenton/Sarasota base for Anna Maria Island beach days.

## Page Builder Tasks

- source files likely to change:
  - `src/index.njk`
  - `src/css/arrival.css`
  - `src/assets/js/guest.js`
  - `src/_includes/layouts/guest.njk`
  - `scripts/enforcement/why-direct-bento.test.js`
- redirect or schema work: none
- internal-link or CTA work: section CTA to /properties/; savings tile to the booking-direct guide
- money CTA and downstream tracking event to verify: existing `data-trip-link` on the section button

## Voice Editor Checklist

- tone risks: marketplace-fee jargon, savings theater, tourism adjectives
- generic or mechanical patterns to kill: “here’s why”, curated, seamless, fee stack
- proof or specificity checks: no $, %, or review count in the savings tile
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured

## Release Gate Checklist

- routes to smoke test: / with `?why-direct=1`, `2`, and `3`
- commands to run: `node --test scripts/enforcement/why-direct-bento.test.js`, `npm run lint:content`
- regression risks to watch: hero styles, `--g-control-treatment`, live-smoke strings already on the homepage

## Done When

- Draft PR targeting `codex/button-pill-token` shows three named layouts with phone and desktop screenshots. Sawyer names one.

## Not In Scope

- homepage hero restyle
- button/pill token change
- guest messaging
- payments or pricing
- merge to main or production
