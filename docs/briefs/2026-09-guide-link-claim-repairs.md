# Brief: guide link-claim repairs (three trafficked guides)

## Content Gate Inputs

- persona: guest planning an Anna Maria Island trip who is comparing where to stay and how to book
- primary keyword: anna maria island vacation rentals
- secondary keywords: dolphins manatees bradenton, how to get to anna maria island, best vacation rental companies ami, book direct anna maria island
- audience pattern: trip-planning guide readers who follow an in-guide link expecting the destination to match what the sentence promised
- proof source: `src/_data/properties.js` (six homes; exactly two carry docks: Dockside Dreams, River House) and each destination page's own title and meta description
- required internal links: /properties/, /stays/book-direct-anna-maria-island/, /guides/booking-direct-vacation-rentals/
- CTA target: /properties/ on the dolphins guide; /stays/book-direct-anna-maria-island/ on the other two
- anti-claims: do not say "many of our rentals" have docks when two of six do; do not promise homes "on" Anna Maria Island; do not label a checkout-total comparison page as a listing of homes

## Required Internal Link Map

These three guides are not a topical cluster; they share only `/guides/`. They are
batched because they carry the same defect, so each page declares the links it
actually owns.

- src/guides/dolphins-manatees-bradenton.html: /properties/, /guides/fishing-guide-anna-maria-sarasota/, /guides/family-vacation-anna-maria-island/
- src/guides/best-vacation-rental-companies-ami.html: /stays/book-direct-anna-maria-island/, /stays/anna-maria-island-vacation-rentals/, /guides/booking-direct-vacation-rentals/
- src/guides/how-to-get-to-anna-maria-island.html: /stays/book-direct-anna-maria-island/, /stays/vacation-rentals-near-anna-maria-island/, /guides/best-time-visit-anna-maria-island/

## Why This Batch

- what changed in the data: a full-site link-claim scan (405 claims, 58 destinations) found the PR #576 defect class on pages outside that PR
- why this cluster wins now: these three carry live Search Console traffic (19, 2, and 1 clicks; 1,514 impressions combined), so the copy is being read
- what should explicitly wait: the zero-click pages carrying the same defect are a retirement decision with redirects, not a copy fix

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
Joined against Search Console for 2026-08-18 to 2026-09-14, the flagged pages
split cleanly: most carry zero clicks and are handled separately as a retirement,
while three flagged claims sit on pages that actually earn traffic and are
repaired here.

Scope note: this brief repairs copy only. No page is retired, no route changes,
no redirects.

## The three claims

### 1. `/guides/dolphins-manatees-bradenton/` — 19 clicks, 946 impressions

The site's best-earning guide. Two problems in one CTA block:

- "**Many of our** vacation rentals feature private docks and waterfront access"
  — `src/_data/properties.js` has six homes and exactly **two** have docks:
  Dockside Dreams (saltwater canal) and River House (Manatee River). "Many" is
  not supportable at 2 of 6.
- The button read "View Waterfront **Rentals**" but points at `/properties/`,
  the unfiltered index of all six homes. There is no waterfront-filtered view to
  send anyone to.

A second instance of the same overclaim in the manatee-locations list
("Many of our canal-front and bayfront properties") is corrected the same way.

**Fix:** name the two dock homes and what they sit on; retitle the button to
describe where it actually goes.

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

## Out of scope, deliberately

- An adjacent card on the same page as #2 reads "For guests who want island-first
  stays". It scored 0.62, above the review cut, so it is not touched here. It is
  worth a human read later; a mainland home is not an "island-first stay" in the
  strictest reading.
- The zero-traffic pages carrying the same defect class are a retirement
  decision, not a copy fix, and belong in their own PR alongside the 301s.

## Verification

- `npm run lint:content`, `npm test`, `npm run verify:release` before review.
- Re-run `tools/link-claim-check` against the rebuilt `_site` and confirm all
  three claims move above the review cut, without pushing another claim below it.
- `npm run test:visual` must be run outside the sandbox. These are copy-only
  changes inside guide bodies, so guide snapshots are expected to change and the
  baselines need regenerating by whoever runs the visual suite.

## Why this is not yet a gate

`tools/link-claim-check` is a manual triage tool. Its review cut of 0.32 was
chosen from one round of triage, not derived from a labelled set large enough to
defend. Two of the first five flags on trafficked pages turned out to be caused
by the extractor taking one sentence too many, not by bad copy. Until the
threshold survives a larger triage, a human reads every flag and nothing blocks
a build.
