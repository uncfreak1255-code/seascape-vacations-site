# Brief: Guide FAQ markup parity, hidden questions (2026-11-24)

- lifecycle: active
- task scope: site #1016 item 3, part one, as Sawyer set it on 2026-11-18. Thirteen guides carry FAQPage markup whose questions never appear on the visible page. Drop that markup. No visible copy, title, meta, heading, layout, CSS, template, link or tracking change. Excluded: the held guides (`anna-maria-island-weather`, `best-time-visit-anna-maria-island`, `anna-maria-island-vs-siesta-key`, `shelling-guide-florida`), the pets guide (`pet-friendly-anna-maria-island`, tied up in #1024, #1025 and PR #1065), and `sarasota-area-guide` (settle window to 2026-12-17). The shared layouts `guide-planning.njk` and `guide-field-journal.njk` are not edited, so every other guide renders byte-identical.
- completion or successor: this PR. Guides whose markup only partly matches the page ship in a second parity PR on #1016.

## Content Gate Inputs

- persona: a traveler who finds a guide in Google or an AI answer, and the search systems that read the guide's structured data
- primary keyword: none changed; this batch edits structured data only
- secondary keywords: none changed
- audience pattern: a searcher sees an FAQ rich result or AI answer quoting the guide, clicks, and finds none of those questions on the page
- proof source: Playwright `innerText` audit of the built site at `origin/main` 55f773e5, 2026-11-24 (every FAQPage question name and answer checked against the rendered visible text); Google Search Central structured-data guidelines (FAQ markup must reflect content visible on the page); Search Console through OpenSEO `get_search_console_performance`, 2026-10-25 to 2026-11-21, read 2026-11-24 (result `d60302d8-0227-4ffa-bc75-ead53856f0a0`)
- offer claim: none; no reader copy changes
- required internal links: /guides/, /properties/
- CTA target: unchanged on every guide
- anti-claims: no new FAQ, question or answer; no reader-copy change

## Why This Batch

- What changed: nothing on the pages. The FAQPage blocks were written for older versions of these guides; later rewrites dropped the visible FAQ sections but left the markup, so it now describes questions a reader cannot find.
- Why now: Sawyer's owner growth push (agent-issues #82) asked for markup that matches the page. Hidden FAQ markup breaks Google's structured-data rules and can put answers no reader can check into AI answers.
- What should wait: guides whose markup partly matches the page go to the second PR: `anna-maria-island-vs-clearwater-beach`, `bradenton-insider-guide`, `bradenton-vs-sarasota-for-families`, `bradenton-vs-sarasota-restaurants`, `bradenton-vs-sarasota-retirement`, `bradenton-vs-tampa-vacation-rentals`, `flights-to-anna-maria-island`, `how-to-get-to-anna-maria-island`, `hurricane-preparedness-florida-vacation`, `is-anna-maria-island-worth-visiting`, `longboat-key-area-guide`, `siesta-key-beach-guide`, `spring-break-activities-bradenton-anna-maria-island` and `where-to-stay-near-anna-maria-island` (the beaches guide waits for its settle window to end 2026-12-22). The held guides, pets and `sarasota-area-guide` stay out as above.
- Visible Q&A sections: `best-restaurants-anna-maria-island` and `srq-airport-to-anna-maria-island` show a short Q&A whose questions differ from the dropped markup; `bradenton-insider-guide` is the same case and is deferred only because it sits in the second PR's list. The second PR treats all three alike: it either marks up exactly the questions shown or leaves them unmarked.

## Experiment And Readback Contract

- hypothesis: removing markup for questions the page never shows does not cost search visibility, because Google limits FAQ rich results to authoritative government and health sites and the visible content is unchanged. No lift is forecast.
- primary event: Search Console impressions and clicks on the thirteen routes
- guardrail event: average position of each route's top query
- entry criteria: `faq-markup-parity.test.js` green; `npm run verify:release` green
- readback window: 28 days after the production publish, judged on the verdict Monday in `docs/status/page-ledger.json`
- decision rule: keep unless a route loses 30% or more of its impressions while the guides as a group do not. A harm result never restores hidden markup: the fix is to show those questions on the page and mark up only what is shown.

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | Unchanged; each guide keeps its current queries |
| Searcher intent | Informational trip planning, unchanged |
| Current Seascape URL | The thirteen `/guides/` routes in `scripts/enforcement/faq-markup-parity.test.js` |
| SERP observed date | 2026-11-24 |
| SERP stale after | 2026-12-01 |
| Attack status | none found after named checks |
| Query variants inspected | Search Console pages, 2026-10-25 to 2026-11-21 (result `d60302d8-0227-4ffa-bc75-ead53856f0a0`): `srq-airport-to-anna-maria-island` 24 clicks, 2,873 impressions, position 4.9; `holmes-beach-vs-bradenton-beach` 11, 400, 5.3; `things-to-do-bradenton-fl` 8, 1,285, 15.0; `anna-maria-island-vacation-cost` 2, 765, 5.8; `best-restaurants-anna-maria-island` 2, 87, 20.4; `anna-maria-island-area-guide` 1, 1,831, 9.7; `best-vacation-rental-companies-ami` 0, 786, 17.0; `siesta-key-area-guide` 0, 226, 9.2; `florida-gulf-coast-vacation-rental-market-report-2026` 0, 61, 7.3; `bradenton-area-guide` 0, 20, 32.3; `holmes-beach` 0, 3, 9.7; `anna-maria-city` and `bradenton-beach` no rows |
| SERP source | No paid SERP lookup: the change removes markup only and keeps every title, meta and heading, so a SERP read would not change the decision (`docs/process/openseo.md` Cost Boundary) |
| Competitor URLs inspected | Named checks: current source (the thirteen guide files and both shared guide layouts at `origin/main` 55f773e5); rendered-page check (Playwright `innerText` audit above); SERP check skipped under the Cost Boundary (Search Console rows above); competitor pages not fetched, because the decision rests on Seascape's own page content, not on competitor angle |
| Top visible competitors | Not read for this batch |
| Competitor angle | Not read for this batch |
| Content gap and Seascape answer | The markup claimed FAQs the pages do not have. Answer: drop the markup and leave the visible page as it is. |
| Visual/format gap | None; no visible change |
| Design/format strategy | No layout, CSS or template change |
| Seascape gap | Structured data out of step with the page |
| Cannibalization check | No title, H1 or target changes |
| Seascape proof available | The rendered-page audit above |
| Current proof | Search Console rows above |
| Search fit | Existing pages, corrected in place; not an expansion branch |
| Local/GBP proof | Not touched |
| AEO/readback note | AI answers that quoted the hidden FAQ text lose a source that no reader could check; the visible guide content stays citable |
| Tools/plugins used | OpenSEO `get_search_console_performance` (free); Playwright on the local build. No paid call, no Hostaway call. |
| Decision and reason | Drop the hidden FAQPage blocks in one PR. It removes structured data that no reader can verify, changes nothing visible, and reverts cleanly. |
| Recommendation | Edit the thirteen guides; add `scripts/enforcement/faq-markup-parity.test.js`; update the three tests that asserted the hidden markup; add a ledger check |

## Source Files Changed In This Batch

- The thirteen guide files listed in `scripts/enforcement/faq-markup-parity.test.js`: standalone FAQPage `<script type="application/ld+json">` blocks removed. The FAQPage item was dropped from the `guideJsonLd` lists in `best-restaurants-anna-maria-island` and `srq-airport-to-anna-maria-island`, and the `guideFaqs` front matter in `anna-maria-island-vacation-cost`, which feeds only the layout's FAQPage block.
- `scripts/enforcement/faq-markup-parity.test.js` (new)
- `scripts/enforcement/ai-brand-chatgpt-cites.test.js`, `scripts/enforcement/marketing-guest-facts.test.js`, `scripts/enforcement/p0-booking-evidence.test.js`: each asserted the hidden FAQ markup and now asserts that it is absent. The visible-copy assertions in each are kept.
- `docs/status/page-ledger.json`

## Boundary Proof

Must not break: every other JSON-LD block on the thirteen pages (Article, BreadcrumbList, LocalBusiness still parse and render); every other guide, including the excluded ones; visible copy. Must not appear: FAQPage markup on any of the thirteen guides.

Observed 2026-11-24:

- `faq-markup-parity.test.js` checks fail for all 13 guide files at `origin/main` and pass on this branch.
- Built `_site`: on each of the 13 pages every remaining `application/ld+json` block parses, and none contains FAQPage.
- The shared layouts are unchanged, so the excluded guides are untouched.
- Playwright `document.body.innerText` of each of the 13 pages, live production against this branch's local build at 1440 wide: identical on all 13.

## Voice and specificity pass

No reader copy changes, so there is no Voice Editor pass. Compound Writing is not needed for a markup-only change.
