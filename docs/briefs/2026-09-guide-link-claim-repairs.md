# Brief: guide link-claim repairs (three trafficked guides)

## Content Gate Inputs

- persona: guest planning an Anna Maria Island trip who is comparing where to stay and how to book
- primary keyword: anna maria island vacation rentals
- secondary keywords: dolphins manatees bradenton, how to get to anna maria island, best vacation rental companies ami, book direct anna maria island
- audience pattern: trip-planning guide readers who follow an in-guide link expecting the destination to match what the sentence promised
- proof source: `src/_data/properties-fallback.json` (six homes; only Dockside Dreams carries a dock). River House is near the Warner Bayou boat ramp and does not have a private waterfront dock. Destination pages keep their own title and meta description.
- required internal links: /properties/, /stays/book-direct-anna-maria-island/, /guides/booking-direct-vacation-rentals/
- CTA target: /properties/ on the dolphins guide; /stays/book-direct-anna-maria-island/ on the other two
- anti-claims: do not say "many of our rentals" have docks when one of six does; do not give River House a dock, waterfront, canal-front, or Manatee River address; do not promise homes "on" Anna Maria Island; do not label a checkout-total comparison page as a listing of homes

## Required Internal Link Map

These three guides are not a topical cluster; they share only `/guides/`. They are
batched because they carry the same defect, so each page declares the links it
actually owns.

- src/guides/dolphins-manatees-bradenton.html: /properties/, /guides/fishing-guide-anna-maria-sarasota/, /guides/family-vacation-anna-maria-island/
- src/guides/best-vacation-rental-companies-ami.html: /stays/book-direct-anna-maria-island/, /stays/anna-maria-island-vacation-rentals/, /guides/booking-direct-vacation-rentals/
- src/guides/how-to-get-to-anna-maria-island.html: /stays/book-direct-anna-maria-island/, /stays/vacation-rentals-near-anna-maria-island/, /guides/best-time-visit-anna-maria-island/

## Source files likely to change

  - `src/guides/dolphins-manatees-bradenton.html`
  - `src/guides/best-vacation-rental-companies-ami.html`
  - `src/guides/how-to-get-to-anna-maria-island.html`
- Name the one dock home (Dockside Dreams) and retitle the `/properties/` button; retitle the book-direct card as a checkout-total comparison; change "on AMI" to "near AMI" on the travel guide. No metadata, route, or layout change. Follow-up: #598 named River House as a second dock home; that is false and is corrected here.

## Why This Batch

- what changed in the data: a full-site link-claim scan (405 claims, 58 destinations) found the PR #576 defect class on pages outside that PR
- why this cluster wins now: these three carry live Search Console traffic (19, 2, and 1 clicks; 1,514 impressions combined), so the copy is being read
- what should explicitly wait: nine further flagged claims, led by /guides/shelling-guide-florida/ (30 clicks, 2,048 impressions), go in a second repair PR

## Not In Scope

- retiring any page, changing any route, or adding redirects
- the adjacent "island-first stays" card, which scored 0.62 and sits above the review cut
- wiring the scanner into any build gate

## Problem

PR #576 fixed five referrals on the AMI vs Siesta guide that promised on-island,
Gulf-front, walk-to-beach, or no-car stays while linking to mainland inventory.
That fix was found by hand, on one guide, so it could only ever cover the
instances someone happened to read.

A scan of every internal link on the built site (405 claims across 58
destinations, `tools/link-claim-check`) found the same defect class elsewhere.
Joined against Search Console for 2026-08-18 to 2026-09-14, three flagged claims
sit on pages that earn traffic and are repaired here.

A retirement PR was considered for the zero-click pages and then dropped. That
case rested on flag concentration (one page showed four, two showed three), and
correcting a fault in the scanner's own extraction removed most of those: it had
been judging related-links markup as editorial copy. After the fix no page
carries more than two flags, which is a copy fix, not grounds for deleting a
page. No page is retired.

Scope note: this brief repairs copy only. No page is retired, no route changes,
no redirects.

## The three claims

### 1. `/guides/dolphins-manatees-bradenton/` — 19 clicks, 946 impressions

The site's best-earning guide. Two problems in one CTA block:

- "**Many of our** vacation rentals feature private docks and waterfront access"
  — six homes, **one** dock: Dockside Dreams on a saltwater canal. River House
  is near the Warner Bayou boat ramp and does not have a private waterfront
  dock (`properties-fallback.json`). "Many" is not supportable, and naming
  River House as a dock home is false.
- The button read "View Waterfront **Rentals**" but points at `/properties/`,
  the unfiltered index of all six homes. There is no waterfront-filtered view to
  send anyone to.

A second instance of the same overclaim in the manatee-locations list
("Many of our canal-front and bayfront properties") is corrected the same way.

**Fix:** name Dockside Dreams as the dock home; do not credit River House with
a dock or a waterfront address; retitle the button to describe where it
actually goes. #598 shipped the two-home dock wording; this follow-up removes it.

### 2. `/guides/best-vacation-rental-companies-ami/` — 2 clicks, 473 impressions

A Relevant Stays card titled "Book direct Anna Maria Island **homes**" links to
`/stays/book-direct-anna-maria-island/`, whose own title is "Compare the same
dates and complete checkout total across channels". The card promises a listing
of homes; the destination is a price-comparison page.

**Fix:** retitle the card to describe the comparison it actually opens.

### 3. `/guides/how-to-get-to-anna-maria-island/` — 1 click, 95 impressions

A Related Vacation Rentals link reads "Book Direct **on** AMI" and points at a
page that describes itself as "near Anna Maria Island". This is the exact
on-island/near-island substitution PR #576 removed. None of the six homes are on
the island.

**Fix:** "on AMI" becomes "near AMI", matching the destination's own wording.

## Gate 0 — Existing-page factual correction

| Field | Read |
| --- | --- |
| Target query family | dolphins manatees Bradenton; best vacation rental companies Anna Maria Island; how to get to Anna Maria Island; book direct Anna Maria Island |
| Searcher intent | guide/research and comparison: trip-planning readers following an in-guide stay link |
| Current Seascape URL | /guides/dolphins-manatees-bradenton/, /guides/best-vacation-rental-companies-ami/, /guides/how-to-get-to-anna-maria-island/ |
| SERP observed date | 2026-09-19 |
| SERP stale after | 2026-09-26 |
| Current proof | Search Console Web results, 2026-08-18 through 2026-09-14: dolphins guide 19 clicks / 946 impressions; rental-companies guide 2 / 473; how-to-get guide 1 / 95 (1,514 impressions combined). The 2026-09-13 next-batch joined read is fresh but below threshold and says hold-and-reread. This correction uses property-source errors, not expansion or impact authority. |
| Top visible competitors | Go2Dolphins; Visit Anna Maria Island; AnnaMariaIsland.com; SeaBreeze Vacation; Anna Maria Life Vacation Rentals; Beach Boutique Rentals. Public search sample on 2026-09-19, not a location-controlled rank report. |
| Competitor angle | Tour inventory and official visitor logistics, plus on-island managers selling book-direct homes and fee savings. |
| Visual/format gap | None required; keep existing CTA, card, and related-link markup. Competitors use tour booking widgets and property grids. This batch does not match those formats. |
| Seascape gap | Three in-guide stay claims overstate inventory: "many" docks when only Dockside Dreams has one, a "homes" card that opens a checkout-total comparison, and "on AMI" for a destination that says near Anna Maria Island. #598 then named River House as a second dock home; that is also false. |
| Search fit | Keep the three existing trafficked guides. Correct the stay-link wording so the destination's own title matches the sentence. Conversion stays on /properties/ and /stays/book-direct-anna-maria-island/. Do not open a new page. |
| Local/GBP proof | Not applicable: organic guide copy correction, no local-pack or GBP claim. |
| AEO/readback note | No AI citation claim. Verify the three repaired sentences in built HTML. Leave first-paragraph answers and FAQ blocks unchanged. |
| Recommendation | keep the three existing guides: name Dockside Dreams as the only dock home, retitle the comparison card, and say near AMI. No snippet rewrite, no expansion. |
| Attack status | completed |
| Query variants inspected | where to see dolphins and manatees near Bradenton; best vacation rental companies Anna Maria Island; how to get to Anna Maria Island; book direct Anna Maria Island vacation rentals |
| SERP source | Public web search on 2026-09-19 plus destination-page and properties.js readback; not a location-controlled rank report. |
| Competitor URLs inspected | https://go2dolphins.com/dolphin-tours/ ; https://www.visitannamariaisland.com/post/how-do-i-get-to-anna-maria-island ; https://annamariaisland.com/planning-your-trip/planning-your-trip/getting-here ; https://www.seabreezevacation.com/ ; https://www.annamarialifevacationrentals.com/ ; https://www.beachboutiquerentals.com/ ; https://www.annamaria.com/news-and-blog/why-book-direct-anna-maria-vacations/ |
| Content gap and Seascape answer | Competitors sell on-island inventory or official travel facts. Seascape's gap is honesty on its own six-home set: one dock home (Dockside Dreams), a comparison page rather than a listing, and near-island not on-island. |
| Design/format strategy | Text-only correction inside existing CTA, card, and related-link markup. No new visual pattern. |
| Seascape proof available | properties-fallback.json: Dockside Dreams has amenity `dock`; River House note is "Near the Warner Bayou boat ramp; this home does not have a private waterfront dock." Destination title for /stays/book-direct-anna-maria-island/ is Compare the same dates and complete checkout total across channels; its description says near Anna Maria Island. |
| Tools/plugins used | tools/link-claim-check; properties.js source inspection; public web search and competitor-page reads on 2026-09-19; Search Console window cited above; local lint, test, and release gates. |
| Decision and reason | Repair the three source-backed link claims on the existing guides. next-batch.md remains fresh but below threshold, so this is attack-lane hygiene, not a new SEO batch. |

## Out of scope, deliberately

- An adjacent card on the same page as #2 reads "For guests who want island-first
  stays". It scored 0.62, above the review cut, so it is not touched here. It is
  worth a human read later; a mainland home is not an "island-first stay" in the
  strictest reading.
- Retiring any page. The retirement shortlist was withdrawn once the scanner
  stopped counting navigation markup as claims; see Problem above.

## Verification

- `npm run lint:content`, `npm test`, `npm run verify:release` before review.
- Re-run `tools/link-claim-check` against the rebuilt `_site` and confirm all
  three claims move above the review cut, without pushing another claim below it.
- `npm run test:visual`: run, 323 passed, 23 skipped, 0 failed (7m). No
  baselines need regenerating. `tests/visual/visual.spec.js` baselines cover four
  guides (bradenton-vs-sarasota, ami-vs-siesta-key, siesta-vs-ami-families,
  shelling-florida) and none of the three pages changed here. An earlier note in
  this brief predicted snapshot churn from the general rule rather than from
  which pages are actually baselined; that prediction was wrong.

## Why this is not yet a gate

`tools/link-claim-check` is a manual triage tool. Its review cut of 0.32 was
chosen from one round of triage, not derived from a labelled set large enough to
defend. Two of the first five flags on trafficked pages turned out to be caused
by the extractor taking one sentence too many, not by bad copy. Until the
threshold survives a larger triage, a human reads every flag and nothing blocks
a build.
