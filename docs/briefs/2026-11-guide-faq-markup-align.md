# Brief: Guide FAQ markup parity, partly matching questions (2026-11-24)

- lifecycle: active
- task scope: site #1016 item 3, part two, as Sawyer set it on 2026-11-18. Fourteen guides carry FAQPage markup that only partly matches the visible page. Keep each marked-up question the page shows as a heading or summary with its answer under it, set the marked-up answer to the visible text that starts right under that question, and drop every other question. No visible copy, title, meta, heading, layout, CSS, template, link or tracking change. Excluded: the held guides (`anna-maria-island-weather`, `best-time-visit-anna-maria-island`, `anna-maria-island-vs-siesta-key`, `shelling-guide-florida`), the pets guide (`pet-friendly-anna-maria-island`, tied up in #1024, #1025 and PR #1065), `sarasota-area-guide` (settle window to 2026-12-17) and `anna-maria-island-beaches` (settle window to 2026-12-22). The shared layouts `guide-planning.njk` and `guide-field-journal.njk` are not edited.
- completion or successor: this PR completes #1016 item 3 for every guide outside the exclusions. Part one (questions that never appear on the page) is PR #1067.

## Content Gate Inputs

- persona: a traveler who finds a guide in Google or an AI answer, and the search systems that read the guide's structured data
- primary keyword: none changed; this batch edits structured data only
- secondary keywords: none changed
- audience pattern: a searcher sees an answer quoted from the guide's markup, clicks, and finds a different answer, or no matching question, on the page
- proof source: Playwright audit of the built site at `origin/main` 55f773e5, 2026-11-24 (each FAQPage question matched to a visible heading or summary, and its answer read from the text under it); Google Search Central structured-data guidelines (FAQ markup must reflect content visible on the page); Search Console through OpenSEO `get_search_console_performance`, 2026-10-25 to 2026-11-21, read 2026-11-24 (result `575d4c20-aa94-4d5f-bcae-0d613b50ed12`)
- offer claim: none; no reader copy changes
- required internal links: /guides/, /properties/
- CTA target: unchanged on every guide
- anti-claims: no new FAQ, question or answer text; every marked-up answer is copied from the visible page

## Why This Batch

- What changed: nothing on the pages. Later rewrites changed the visible FAQ answers or dropped some questions, but the markup kept the old text.
- Why now: Sawyer's owner growth push (agent-issues #82) asked for markup that matches the page.
- What should wait: eight questions are shown on the page, but their visible answer makes a claim the older markup did not. Marking them up would push that claim into structured data, so this PR drops them from the markup and logs the visible answer on #1016 for a copy fix:
  - `anna-maria-island-vs-clearwater-beach`, "Is it cheaper to stay on Anna Maria Island or Clearwater Beach?": the visible answer compares rental value and nightly rates.
  - `bradenton-vs-tampa-vacation-rentals`, "Can you do Tampa attractions from Bradenton?": the visible answer gives Busch Gardens as 2 hours and Ybor City as 1.5 hours, against 45 minutes elsewhere on the page.
  - `bradenton-vs-sarasota-retirement`, "Can I rent a home in Bradenton for a month before deciding to move?": the visible answer offers Seascape "waterfront homes" for 30+ days.
  - `bradenton-insider-guide`, "Is Bradenton safe for tourists?": the visible answer says most areas are "safe day and night".
  - `bradenton-insider-guide`, "What's the best month to visit Bradenton?": the visible answer says fall "is cheapest".
  - `bradenton-vs-tampa-vacation-rentals`, "Is Bradenton or Tampa better for a beach vacation?": the visible answer says Bradenton "saves time, gas, and money".
  - `siesta-key-beach-guide`, "How far is Siesta Key from Anna Maria Island?": the visible answer says "many of our vacation rental guests" make the trip, with no source.
  - `spring-break-activities-bradenton-anna-maria-island`, "Is there a free trolley on Anna Maria Island?": the visible answer says the trolley "eliminates the need for extra rental cars entirely" and calls it completely free, while `siesta-key-vs-anna-maria-island-families` shows a $2 fare.
- Also dropped: questions the page does not show with an answer under them (the stale first FAQPage block on `bradenton-insider-guide`, the four-question FAQPage item on `how-to-get-to-anna-maria-island`, whose "Do you need a car" question appears only as a link, the FAQPage block on `is-anna-maria-island-worth-visiting`, and the unshown questions on the other guides), and questions the page shows under different wording (`where-to-stay-near-anna-maria-island` "Is it better to stay on Anna Maria Island or nearby?", shown as "...or nearby on the mainland?"; `anna-maria-island-vs-clearwater-beach` "Which beach has better sand and water?" and "Which is better for nightlife?"; `bradenton-vs-sarasota-retirement` "Which has better healthcare"). Markup that stays a subset of the page is safe; re-adding those under the visible wording is a later choice.
- `siesta-key-vs-anna-maria-island-families` nests its FAQPage inside the Article's `mainEntity`. All six questions show as headings. Three marked-up answers did not appear on the page and now carry the visible text under each heading; the young-kids answer keeps the page's rip-current and supervision paragraphs. "What's there for kids to do on Anna Maria Island?" is dropped: its activities sit in a card whose trolley fare ($2) conflicts with the free trolley on other guides.

## Experiment And Readback Contract

- hypothesis: matching the markup to the visible answers does not cost search visibility, because Google limits FAQ rich results to authoritative government and health sites and the visible content is unchanged. No lift is forecast.
- primary event: Search Console impressions and clicks on the fourteen routes
- guardrail event: average position of each route's top query
- entry criteria: `faq-markup-visible.test.js` green; `npm run verify:release` green
- readback window: 28 days after the production publish, judged on the verdict Monday in `docs/status/page-ledger.json` (2026-12-28)
- decision rule: keep unless a route loses 30% or more of its impressions while the guides as a group do not. A harm result never restores unmatched markup: the fix is to show the question on the page and mark up only what is shown.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | Unchanged; each guide keeps its current queries |
| Searcher intent | Informational trip planning, unchanged |
| Current Seascape URL | The fourteen `/guides/` routes listed under Source Files Changed |
| SERP observed date | 2026-11-24 |
| SERP stale after | 2026-12-01 |
| Attack status | none found after named checks |
| Query variants inspected | Search Console pages, 2026-10-25 to 2026-11-21 (result `575d4c20-aa94-4d5f-bcae-0d613b50ed12`): `anna-maria-island-vs-clearwater-beach` 20 clicks, 1,008 impressions, position 5.1; `is-anna-maria-island-worth-visiting` 11, 1,358, 4.2; `bradenton-vs-sarasota-for-families` 5, 318, 7.5; `bradenton-vs-sarasota-retirement` 3, 211, 11.7; `longboat-key-area-guide` 2, 64, 8.7; `bradenton-insider-guide` 1, 46, 14.7; `bradenton-vs-tampa-vacation-rentals` 0, 64, 6.6; `flights-to-anna-maria-island` 0, 216, 8.1; `how-to-get-to-anna-maria-island` 0, 93, 8.7; `siesta-key-beach-guide` 0, 6, 9.8; `spring-break-activities-bradenton-anna-maria-island` 0, 18, 14.1; `where-to-stay-near-anna-maria-island` only an `?area=sarasota` row, 0, 37, 8.0; `hurricane-preparedness-florida-vacation` no row; `siesta-key-vs-anna-maria-island-families` 4, 214, 8.8 (result `783ca3c2-007b-4e24-8a6f-df0e6facb482`) |
| SERP source | No paid SERP lookup: the change edits markup only and keeps every title, meta and heading, so a SERP read would not change the decision (`docs/process/openseo.md` Cost Boundary) |
| Competitor URLs inspected | Named checks: current source (the fourteen guide files and both shared guide layouts at `origin/main` 55f773e5); rendered-page check (Playwright audit above); SERP check skipped under the Cost Boundary (Search Console rows above); competitor pages not fetched, because the decision rests on Seascape's own page content |
| Top visible competitors | Not read for this batch |
| Competitor angle | Not read for this batch |
| Content gap and Seascape answer | The markup quoted answers the pages no longer give. Answer: mark up the visible answers and drop the rest. |
| Visual/format gap | None; no visible change |
| Design/format strategy | No layout, CSS or template change |
| Seascape gap | Structured data out of step with the page |
| Cannibalization check | No title, H1 or target changes |
| Seascape proof available | The rendered-page audit above |
| Current proof | Search Console rows above |
| Search fit | Existing pages, corrected in place; not an expansion branch |
| Local/GBP proof | Not touched |
| AEO/readback note | AI answers that read the markup now get the same answer a reader sees on the page |
| Tools/plugins used | OpenSEO `get_search_console_performance` (free); Playwright on the local build. No paid call, no Hostaway call. |
| Decision and reason | Align the fourteen guides in one PR. It makes the structured data match the page, changes nothing visible, and reverts cleanly. |
| Recommendation | Edit the fourteen guides; add `scripts/enforcement/faq-markup-visible.test.js`; update the `p0-booking-evidence` assertion on the dropped where-to-stay question; add a ledger check |

## Source Files Changed In This Batch

- `src/guides/anna-maria-island-vs-clearwater-beach.html`, `bradenton-insider-guide.html`, `bradenton-vs-sarasota-for-families/index.html`, `bradenton-vs-sarasota-retirement/index.html`, `bradenton-vs-tampa-vacation-rentals.html`, `flights-to-anna-maria-island/index.html`, `how-to-get-to-anna-maria-island.html`, `hurricane-preparedness-florida-vacation.html`, `is-anna-maria-island-worth-visiting.html`, `longboat-key-area-guide/index.html`, `siesta-key-beach-guide.html`, `spring-break-activities-bradenton-anna-maria-island/index.html`, `where-to-stay-near-anna-maria-island/index.html`, `siesta-key-vs-anna-maria-island-families.html`: FAQPage JSON-LD only (standalone `<script type="application/ld+json">` blocks, `guideJsonLd` front-matter items, and the `schemaData` object on `bradenton-insider-guide`).
- `scripts/enforcement/faq-markup-visible.test.js` (new): on every built guide outside the exclusions, each FAQPage question (found anywhere in the JSON-LD tree) must be visible and its marked-up answer must be the visible text that starts right after it; a page whose source names FAQPage more often than the test can parse fails.
- `scripts/enforcement/p0-booking-evidence.test.js`: asserts the dropped where-to-stay question is gone and that no remaining answer makes a price claim.
- `docs/status/page-ledger.json`

## Boundary Proof

Must not break: every other JSON-LD block on the fourteen pages; every other guide, including the excluded ones; visible copy. Must not appear: a FAQPage question or answer that the page does not show.

Observed 2026-11-24:

- With ld+json blocks and FAQPage `guideJsonLd` items stripped, the source files are identical to `origin/main`; `bradenton-insider-guide` differs only inside its `schemaData` object.
- `faq-markup-visible.test.js` passes on all fourteen guides on this branch and fails only on PR #1067's 13 guides until that PR lands. Putting back the old `siesta-key-vs-anna-maria-island-families` cost answer makes it fail on that guide.

## Voice and specificity pass

No reader copy changes, so there is no Voice Editor pass. Compound Writing is not needed for a markup-only change.
