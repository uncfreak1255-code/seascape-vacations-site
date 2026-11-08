# Brief: Guides index label and teaser cleanup

- lifecycle: draft
- task scope: three label fixes on `/guides/` (`src/guides/index.njk`), requested by Sawyer on 2026-11-07 after the Waterline redesign review (PR #897): replace the hard-coded "Reviewed June 2026" freshness label, remove labels that repeat their own heading, collapse the featured card's two stacked labels into one, and rewrite the hub's short teaser lines (added by Sawyer on 2026-11-07: they read as AI-written). No link, page title, meta description, H1 or schema change.
- completion or successor: none yet; set `active` only after Sawyer approves this scope

## Content Gate Inputs

- persona: guest planning a Gulf Coast trip who lands on the guides hub and picks the next guide to read
- primary keyword: none; label repair on an existing hub, no search target change
- secondary keywords: none; no search expansion
- audience pattern: readers (and assistants quoting the page) take "Reviewed June 2026" as a dated fact about the featured guide; repeated labels add noise before every heading
- proof source: current source `0edf8f04` (`src/guides/index.njk` lines 9, 10, 14, 671-672, 696-697 and the four category cards); the featured guide `src/guides/bradenton-vs-sarasota.html` shows "Updated October 27, 2026" with `dateModified` 2026-10-27, so the hub's "Reviewed June 2026" contradicts the guide it links to
- offer claim: not applicable; guest lane, no owner offer
- required internal links: /guides/bradenton-vs-sarasota/, /properties/
- CTA target: unchanged; the hub's existing guide links and the hero's /properties/ link
- anti-claims: no new review date, reviewer or freshness claim the source guide does not carry; no savings, ranking, "best" or comparison claim that the linked guide does not already make and support; no change to any guide title, href, page title, meta description, H1 or JSON-LD

## The Four Fixes

1. **Freshness label.** `featuredStory.meta` is the literal string "Reviewed June 2026". Either derive it from the featured guide's own last-updated date (the same source as its visible "Updated" line and `dateModified`) or drop the date and keep only "Best for travelers still deciding where to base their trip". A hard-coded month is not allowed back.
2. **Labels that repeat their heading.** "Start Here" label over "Start Here" heading; "Browse by Category" over "Browse by category"; and each category card's label repeating its own heading ("Comparisons", "Area Guides", "Trip Planning", "Owner Insights"). Remove the duplicate label, or give it distinct wording that adds information. The heading text stays.
3. **Two stacked labels on the featured card.** "Featured Story" plus "City Comparison". Keep one; the other goes.
4. **Teaser lines.** Rewrite each short descriptive line on the hub so it says something the linked guide actually concludes, in plain words, instead of describing the guide in the abstract. Lines in scope (current text at `0edf8f04`):
   - featured excerpt: "Pick the coast that matches your pace, budget, dining expectations, and beach priorities before you book the wrong stay for the wrong kind of trip."
   - featured meta tail: "Best for travelers still deciding where to base their trip"
   - Anna Maria Island vs Siesta Key: "Two Gulf Coast favorites. Very different vacation personalities."
   - booking direct: "The booking decision that quietly changes your total trip cost."
   - the four Start Here descriptions ("Start here if you are still deciding what kind of trip you want."; "Useful when the destination is narrowing but the vibe still is not."; "See how direct booking changes the total before you default to Airbnb or VRBO."; "The practical guide that reduces panic and bad assumptions.")
   - the two section notes under Start Here and Browse by category
   - the four category intros (the Owner Insights intro keeps both of its links and their anchor text)
   - the two utility-card paragraphs (Stay collections, Market reports and local help)

   Rules for fix 4: each comparison or money line is taken from the linked guide's own verdict and is traceable to a sentence in that guide; where the guide has no clear verdict, the line describes the guide's content plainly rather than inventing one. No stock AI patterns from `docs/style/banned-patterns.md`: no abstract noun lists standing in for a real difference, no mirrored "the wrong X for the wrong Y" phrasing, no "personalities"/"vibe" filler, no "quietly", no line that only promises the guide will help.

   Starting drafts for four of these lines, each with its guide sentence, are in `docs/research/2026-11-07-writing-plugin-bakeoff.md`. That test also found that the card title "Why Booking Direct Saves You Hundreds" contradicts its guide ("There is no fixed saving."); the title stays out of this brief's scope unless Sawyer adds it.

## Why This Batch

- what changed in the data: nothing measured; Sawyer spotted these while reviewing the rendered Waterline redesign of `/guides/`
- why this cluster wins now: the freshness label is a factual contradiction with the featured guide; the duplicates are cheap, low-risk cleanup on a hub that every guide page links to; the teaser lines are the first copy readers see on the hub and Sawyer flagged them as reading AI-written
- what should explicitly wait: guide titles (including "Why Booking Direct Saves You Hundreds") and the hub's title/meta; any search-driven change (`docs/status/next-batch.md` reads "fresh but below threshold" and names no /guides/ opportunity)

## Experiment And Readback Contract

- hypothesis: none; accuracy and clarity repair, not a growth experiment
- primary event: none added; existing guide click tracking unchanged
- guardrail event: internal-link set and JSON-LD unchanged (internal-link floor test, release gate)
- entry criteria: Sawyer approves this scope
- readback window: none; no lift claim will be made
- decision rule: ship when the release gate passes and the rendered page shows no duplicate label and no hard-coded date

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | none; label repair on the existing guides hub, no target query change |
| Searcher intent | guest choosing which Gulf Coast guide to read next |
| Current Seascape URL | /guides/ |
| SERP observed date | 2026-11-07 |
| SERP stale after | 2026-11-14 |
| Current proof | source audit at `0edf8f04`: hard-coded "Reviewed June 2026" vs the featured guide's "Updated October 27, 2026"; duplicate labels at lines 9-10, 671-672, 696-697 and the four category cards |
| Top visible competitors | Expedia destination pages, bradentongulfislands.com, visitflorida.com, treksplorer.com, livinginyellow.com |
| Competitor angle | single-destination guides and booking listings; none is a multi-town hub like /guides/; no format is being copied |
| Visual/format gap | none; layout comes from PR #897 |
| Seascape gap | the hub shows a stale freshness date that contradicts its own guide |
| Search fit | unchanged; title, meta, H1, links and schema stay identical |
| Local/GBP proof | N/A: the fix changes labels only and makes no local, address or review claim, so no GBP evidence is needed |
| AEO/readback note | assistants quoting the hub would repeat "Reviewed June 2026"; the fix removes a contradictory date |
| Recommendation | ship the label fixes and teaser rewrites; no search change |
| Attack status | completed |
| Query variants inspected | "Anna Maria Island Bradenton Sarasota travel guides" |
| SERP source | web search (standard), observed 2026-11-07 |
| Competitor URLs inspected | https://bradentongulfislands.com/?p=9197, https://visitflorida.com/travel-ideas/articles/scenic-florida-drive-bradenton-beach (result titles and summaries only, not full pages) |
| Content gap and Seascape answer | hub teasers describe guides abstractly; Seascape answer is each guide's own verdict in one plain line |
| Design/format strategy | keep the PR #897 Waterline layout; text-only changes; rewritten lines stay within about the current length so cards keep their height |
| Seascape proof available | the featured guide's own visible updated date and `dateModified` |
| Tools/plugins used | source read (`rg`, `git show`); one standard web search; OpenSEO not queried |
| Decision and reason | draft; repair is justified by source contradiction, not search data |

## Cluster In Scope

- canonical winner URL(s): /guides/
- feeder pages: none changed
- aliases or retired URLs: none
- money destination: /properties/ via the hero link and the guides' own booking paths
- active lane: comparison guides (hub)

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: none
- claims that are off-limits: any review/update date not taken from the featured guide; any reviewer name on the hub
- Seascape-specific proof this page can add: the featured guide's real updated date, if fix 1 derives it

## Page Builder Tasks

- source files likely to change: `src/guides/index.njk` only (labels, the `featuredStory.meta` value or its source, and the teaser lines listed in fix 4); `src/css/guides-index.css` only if a removed label leaves a spacing gap
- redirect or schema work: none
- internal-link or CTA work: none; the internal-link set must stay identical
- money CTA and downstream tracking event to verify: hero /properties/ link and guide links unchanged

## Voice Editor Checklist

- tone risks: teaser rewrites drifting into new claims, or into a different set of stock phrases
- generic or mechanical patterns to kill: labels that restate the heading under them; abstract noun lists, mirrored phrasing, "personalities"/"vibe"/"quietly" filler, lines that only promise help
- proof or specificity checks: any date shown matches the featured guide's visible updated date; each rewritten comparison or money line cites the guide sentence it comes from in the build PR body
- customer wording kept where it sounds natural: headings unchanged

## Release Gate Checklist

- routes to smoke test: /guides/ desktop 1280 and phone 390
- commands to run: `npm run check:brief -- docs/briefs/2026-11-guides-index-label-cleanup.md`, `npm run lint:content`, `npm run verify:release`, `node --test scripts/enforcement/internal-link-floor.test.js` on a fresh build, `npm run test:visual -- --grep guides-index` (baseline refresh expected)
- regression risks to watch: section heads losing their spacing when a label is removed; floors F1/F2 on the hub

## Done When

- /guides/ shows no hard-coded review month, no label that repeats its own heading, one label on the featured card, and every fix 4 line rewritten and traceable to its guide
- the independent Voice Editor pass returns `Approved` on the rewritten lines
- page title, meta, H1, JSON-LD and the internal-link set are unchanged against `main`
- release gate and guides-index visual baselines pass

## Post-Reread Outcome

- reread window used: none; no lift claim
- crawl freshness result: not tracked for this repair
- actual impressions, CTR, position, and downstream event counts: not applicable
- decision taken: pending Sawyer's approval of this draft
- next branch slug or explicit wait state: `codex/guides-index-label-cleanup` after approval and after PR #897 merges (it restyles the same file)

## Not In Scope

- guide titles, and any copy on the linked guide pages themselves
- the hub's page title, meta description or schema
- any new guide or link
- layout changes beyond closing a gap left by a removed label
