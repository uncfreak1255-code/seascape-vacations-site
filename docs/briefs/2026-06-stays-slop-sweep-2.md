# Brief: Stays slop sweep #2

## Content Gate Inputs

- persona: Gulf Coast guest using Seascape guides and stay pages to decide between beach bases, trip shapes, and amenity tradeoffs without generic tourism filler.
- primary keyword: Anna Maria Island vacation guide
- secondary keywords: romantic getaway Anna Maria Island, vacation rentals with outdoor grill, Bradenton vs Sarasota vacation, Anna Maria Island beaches, Bradenton Beach guide
- audience pattern: high-intent guest comparing where to stay, how close the beach is, and what tradeoff they are making between space, amenities, and location.
- proof source: `/Users/sawbeck/Library/Application Support/Claude/local-agent-mode-sessions/e1bd207c-ec19-4074-a720-1b5531a16a43/1b59648c-c347-4ec4-827f-853e1e186337/local_aca3a7dc-432b-437f-8622-7028e8b50537/outputs/stays-slop-sweep-2.md`, `src/_data/seoPages.json`, `src/guides/*.html`, and `docs/style/banned-patterns.md`.
- required internal links: /guides/, /properties/
- CTA target: preserve the existing guide CTAs, property links, and direct-book paths already on these pages.
- anti-claims: no new beach rankings, no new amenity claims, no stronger romance or luxury claims, no new beachfront promises, and no claim that this cleanup proves demand or conversion lift.

## Gate 0 Search Block

| Field | Value |
| --- | --- |
| Target query family | Existing guide and stay-intent queries around Anna Maria Island beaches, Bradenton vs Sarasota vacation planning, Bradenton Beach, romantic Gulf Coast stays, and outdoor-grill rental searches. |
| Searcher intent | Guests need a direct fit call about where to stay, what kind of beach day or evening setup they get, and what tradeoff they make on location versus amenities. |
| Current Seascape URL | `/guides/anna-maria-island-vs-longboat-key.html`, `/guides/anna-maria-island-beaches/`, `/guides/how-to-get-to-anna-maria-island/`, `/guides/is-anna-maria-island-worth-visiting/`, `/guides/bradenton-vs-sarasota/`, `/guides/bradenton-beach/`, plus the existing `romantic-getaway-anna-maria-island` and `vacation-rentals-with-outdoor-grill` entries in `src/_data/seoPages.json`. |
| Current proof | The named guide and stay-copy fields still contain the Section-B opener phrases from the handoff, including `best of both worlds`, `Nothing says`, `Picture yourself`, `There's nothing quite like`, and the admiration superlative pattern. |
| Top visible competitors | OTA pages, destination roundups, and local guide pages typically lean on generic admiration, romance framing, and beach-superlative language instead of practical fit language. |
| Competitor angle | Competitors sell destination feeling first. Seascape can be sharper by naming the actual tradeoff: beach access, parking, facilities, evening setup, and where the base sits relative to the island. |
| Seascape gap | These remaining phrases still read like decorative setup rather than useful local guidance, and they block the next hardening step for opener-pattern enforcement. |
| Recommendation | Replace only the nine handoff-specified phrases, keep the same page facts, and use the cleanup to clear the remaining corpus hits before enabling the next opener hard-blocks. |

## Why This Cleanup

- The first stay slop sweep removed the known `seoPages.json` hits from the initial handoff, but this second pass still has six guide strings and two stay-copy fields left.
- The replacements keep the same local facts while removing phrase shapes that now read like canned setup rather than real guidance.
- This is still a bounded copy-quality cleanup on live pages, not a new content batch.

## Cluster In Scope

- guide pages:
  - `src/guides/anna-maria-island-vs-longboat-key.html`
  - `src/guides/anna-maria-island-beaches.html`
  - `src/guides/how-to-get-to-anna-maria-island.html`
  - `src/guides/is-anna-maria-island-worth-visiting.html`
  - `src/guides/bradenton-vs-sarasota.html`
  - `src/guides/bradenton-beach.html`
- stay data:
  - `src/_data/seoPages.json` `vacationer` entries for `romantic-getaway-anna-maria-island` and `vacation-rentals-with-outdoor-grill`
- money destination: unchanged existing stay collections, property pages, and direct-book routes already linked from these pages.
- active lane: guest copy hygiene before the next opener hard-block step.

## Source And Proof Constraints

- property truth needed: do not add new amenity, distance, capacity, or waterfront claims.
- owner proof asset needed: none.
- claims that are off-limits: new `#1` style claims, broader family-superlative claims, new romance proof, or any beach-access promise stronger than the current source already supports.
- Seascape-specific proof this page can use: existing drive-time, facilities, parking, private-pool, hot-tub, and direct-book savings framing only.

## Page Builder Tasks

- source files likely to change:
  - `src/_data/seoPages.json`
  - `src/guides/anna-maria-island-vs-longboat-key.html`
  - `src/guides/anna-maria-island-beaches.html`
  - `src/guides/how-to-get-to-anna-maria-island.html`
  - `src/guides/is-anna-maria-island-worth-visiting.html`
  - `src/guides/bradenton-vs-sarasota.html`
  - `src/guides/bradenton-beach.html`
  - this brief
- redirect or schema work: none beyond the existing copy field already living in source.
- internal-link or CTA work: none.
- money CTA and downstream tracking event to verify: existing guide links, property links, and direct-book routes remain unchanged.

## Voice Editor Checklist

- tone risks: swapping one canned phrase for another, overstating the romance angle, or turning beach descriptions into another flavor of generic admiration.
- generic or mechanical patterns to kill: `best of both worlds`, `Nothing says`, `Picture yourself`, `There's nothing quite like`, and admiration superlatives like `one of the most popular` or `one of the most beautiful` where a plainer fact works better.
- proof or specificity checks: keep each replacement tied to the same factual setup already on the page.
- customer wording kept where it sounds natural; decorative filler removed where it sounds manufactured.

## Release Gate Checklist

- routes to smoke test:
  - `/guides/anna-maria-island-vs-longboat-key.html`
  - `/guides/anna-maria-island-beaches/`
  - `/guides/how-to-get-to-anna-maria-island/`
  - `/guides/is-anna-maria-island-worth-visiting/`
  - `/guides/bradenton-vs-sarasota/`
  - `/guides/bradenton-beach/`
- commands to run: `npm run lint:content`, `npm run build`, `npm test`, and targeted pattern checks for the handoff phrases. Run `npm run eval:guest` only if the current key budget allows it.
- regression risks to watch: accidental guide-file churn, broken inline links in one-line HTML guides, or unsupported beach/facility claims creeping into the replacements.

## Required Internal Link Map

- `src/guides/anna-maria-island-vs-longboat-key.html`: /properties/the-oasis/, /properties/river-house/
- `src/guides/anna-maria-island-beaches.html`: /guides/shelling-guide-florida/, /guides/how-to-get-to-anna-maria-island/
- `src/guides/how-to-get-to-anna-maria-island.html`: /guides/bradenton-area-guide/, /guides/sarasota-area-guide/
- `src/guides/is-anna-maria-island-worth-visiting.html`: /stays/anna-maria-island-vacation-rentals/, /guides/anna-maria-island-beaches/
- `src/guides/bradenton-vs-sarasota.html`: /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/
- `src/guides/bradenton-beach.html`: /guides/bradenton-area-guide/, /guides/anna-maria-island-beaches/

## Done When

- all nine handoff replacements are present in source.
- the named Section-B phrases no longer appear in these targeted source fields.
- deterministic local gates pass.
- the branch has enough evidence to decide whether the Section-B opener hard-blocks can be enabled without red-lining unrelated pages.

## Not In Scope

- new guide sections or stay pages.
- broad guide rewrites.
- route, schema, redirect, or CTA changes outside the named phrases.
- owner-page work.
