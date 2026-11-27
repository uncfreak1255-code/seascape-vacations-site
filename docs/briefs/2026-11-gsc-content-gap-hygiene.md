# Brief: November 2026 GSC content-gap hygiene

- lifecycle: active
- task scope: existing-page SEO hygiene from the 2026-11-26 Search Console content-gap scan; no new guest pages
- completion or successor: draft PR only; do not merge

## Figma Handoff

- Figma capture: none
- Figma frames: none

## Content Gate Inputs

- persona: a guest who landed from Search Console queries this scan named, or a crawler still hitting a dead owner URL
- primary keyword: things to do in Bradenton
- secondary keywords: is Anna Maria Island dog friendly, vacation rental direct booking, Anna Maria Island vacation rentals, Bradenton Beach, Siesta Key
- audience pattern: Google already sends the query to an existing Seascape URL; the page should answer or hand off without inventing inventory
- proof source: Search Console content-gap scan for seascape-vacations.com dated 2026-11-26; live curl 2026-11-27; current source on origin/main
- required internal links: /guides/things-to-do-bradenton-fl/, /stays/vacation-rentals-near-anna-maria-island/, /guides/siesta-key-area-guide/, /property-management/vacation-rental-management-anna-maria-island/
- CTA target: existing stay collections and the AMI owner page; no new CTAs
- anti-claims: no new distances, crime or safety stats, fishing-license rules, county facts, or best-beach claims; no fee percent, range, or minimum; do not name the business partner; do not imply on-island homes; skip AMI-to-Sarasota distance and Bradenton safety FAQ

## Why This Batch

- what changed in the data: the 2026-11-26 Search Console content-gap scan found an H1 typo, query cannibalization, missing AEO question headings, a live owner 404 still collecting impressions, slash duplicates worst on Bradenton vs Sarasota, and Siesta Key queries landing on the comparison page
- why this cluster wins now: Sawyer's 2026-11-26 standing instruction is to keep working the SEO plan as draft PRs; the 90-day rule allows existing-page fixes only; `docs/status/next-batch.md` is `fresh but below threshold` and still allows evidence-backed existing-page drafts
- what should explicitly wait: new guest pages; AMI-to-Sarasota distance; Bradenton safety FAQ; owner-page titles (#1095); `/reviews/` (#1034); protected phone homepage layout; held-guide measurement rewrites beyond the required Siesta Key handoff link

## Experiment And Readback Contract

- hypothesis: clearer winners, honest near-island wording, trailing-slash canonicals, and a 301 from the dead Bradenton Beach owner URL will concentrate impressions on live pages without new routes
- primary event: live 301 from the 404; trailing-slash canonical on Bradenton vs Sarasota; visible H2 answers on the pet and book-direct guides
- guardrail event: no on-island inventory claim; no fee percent; `lint:content` and `verify:release` stay green
- entry criteria: 2026-11-26 GSC scan plus Sawyer draft-PR instruction; live 404 confirmed 2026-11-27
- readback window: 28 days after production publish, judged on the Monday in `docs/status/page-ledger.json`
- decision rule: keep unless a changed route loses 30%+ impressions while the site does not; a harm verdict reverts the copy or redirect, never the near-island location truth

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | things to do in Bradenton; is Anna Maria Island dog friendly; vacation rental direct booking; Anna Maria Island vacation rentals; Bradenton Beach; Siesta Key; slash vs no-slash duplicates; dead `/property-management/vacation-rental-management-bradenton-beach/` |
| Searcher intent | Get an activity list, a dog-friendly yes/no, a definition of booking direct, a stay near AMI, Bradenton Beach vs mainland, or Siesta Key itself — not a new page |
| Current Seascape URL | `/guides/things-to-do-bradenton-fl/`; `/guides/bradenton-vs-sarasota/`; `/guides/pet-friendly-anna-maria-island/`; `/guides/booking-direct-vacation-rentals/`; `/guides/anna-maria-island-area-guide/`; `/stays/vacation-rentals-near-anna-maria-island/`; `/stays/bradenton-vacation-rentals-near-beaches/`; `/guides/anna-maria-island-vs-siesta-key/`; `/guides/siesta-key-area-guide/`; `/property-management/vacation-rental-management-anna-maria-island/` |
| SERP observed date | 2026-11-26 |
| SERP stale after | 2026-12-11 |
| Current proof | Search Console content-gap scan 2026-11-26; live curl 2026-11-27: owner Bradenton Beach URL 404; `/guides/bradenton-vs-sarasota` 301 to slash; `/guides/bradenton-vs-sarasota/index.html` 200 duplicate |
| Top visible competitors | Visit Bradenton / things-to-do listicles for the activity query; AMI Locals, AMI Explorer, and Dogster for dog-friendly AMI; Hostaway and Lodgify glossary pages for direct-booking definitions; the comparison page itself vs the Siesta Key area guide for `siesta key` |
| Competitor angle | Direct-answer H2s and one winner URL per query; Seascape already has the pages |
| Visual/format gap | Not a layout rescue: reuse existing callout and FAQ patterns; no new component |
| Seascape gap | H1 `Do<br>in` concatenates to "Doin"; comparison page buries the activity guide; pet and book-direct pages lack the asked question H2; AMI area guide lacks a prominent near-island collection block; mainland near-beaches copy does not name Bradenton Beach as the island town; dead owner URL 404s; `index.html` still 200s on Bradenton vs Sarasota |
| Search fit | Keep `/guides/things-to-do-bradenton-fl/` as the activity winner; comparison page should hand off with exact-match anchor text; Siesta Key area guide already titles and H1s "Siesta Key" and should receive a prominent link from the comparison; 301 the dead owner URL to the AMI owner page because Bradenton Beach is an island town |
| Local/GBP proof | Not applicable: this batch does not change Google Business Profile, local-pack, or map listings; it repairs existing page copy, links, canonicals, and one redirect |
| AEO/readback note | Visible H2 answers must stay a subset of copy already on the page; FAQPage text must match those visible answers where markup is updated |
| Recommendation | Ship bounded existing-page hygiene as a draft PR; do not merge; do not open new guest URLs |
| Attack status | completed |
| Query variants inspected | things to do in Bradenton; is Anna Maria Island dog friendly; what is a vacation rental direct booking; Anna Maria Island vacation rentals; Bradenton Beach; siesta key; slashless `/guides/bradenton-vs-sarasota`; `/guides/bradenton-vs-sarasota/index.html`; `/property-management/vacation-rental-management-bradenton-beach[/]` |
| SERP source | GSC content-gap scan 2026-11-26; Cursor web search 2026-11-27 for the AEO questions; live production curl 2026-11-27 |
| Competitor URLs inspected | https://seascape-vacations.com/guides/things-to-do-bradenton-fl/; https://www.amilocals.com/news-and-blog/vacation-like-a-local-a-pet-friendly-guide-to-anna-maria-island/; https://www.amiexplorer.com/plan/rules; https://www.dogster.com/lifestyle/anna-maria-island-dog-beaches/; https://www.hostaway.com/blog/what-is-direct-booking/; https://encyclopedia.lodgify.com/direct-booking; https://seascape-vacations.com/guides/siesta-key-area-guide/; https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key/ |
| Content gap and Seascape answer | Gaps are on existing pages: typo, buried winner link, missing question H2s, near-vs-on wording, a 404, and an index.html 200. Seascape already has the activity guide, pet guide, book-direct guide, near-island collection, Siesta Key area guide, and AMI owner page |
| Design/format strategy | No new visual system. Reuse the existing left-border callout used on other guides. Keep Waterline tokens already on the area-guide pages. No motion |
| Seascape proof available | Current source, live curl receipts 2026-11-27, 2026-11-26 GSC scan named in the task, property truth that homes are mainland Bradenton |
| Tools/plugins used | Repo source search, live curl, Cursor web search, `check:brief`, `lint:content`, `verify:release`. Compound Writing skill not installed; native draft / de-internal / voice pass recorded here. No paid OpenSEO lookup |
| Decision and reason | Implement the eight existing-page fixes as one draft PR. Skip unverified distance and safety FAQs. Leave owner titles and `/reviews/` to open PRs #1095 and #1034 |

## Cluster In Scope

- canonical winner URL(s): `/guides/things-to-do-bradenton-fl/`; `/guides/siesta-key-area-guide/`; `/stays/vacation-rentals-near-anna-maria-island/`; `/property-management/vacation-rental-management-anna-maria-island/`
- feeder pages: Bradenton vs Sarasota comparison; AMI vs Siesta comparison; AMI area guide; mainland near-beaches stay page
- aliases or retired URLs: `/property-management/vacation-rental-management-bradenton-beach` and trailing-slash form; `/guides/bradenton-vs-sarasota/index.html`
- money destination: existing stay collections and the AMI owner page
- active lane: comparison guides and direct-book stay intent; one owner 404 repair

## Source And Proof Constraints

- property truth needed: homes are in mainland Bradenton, not on Anna Maria Island
- owner proof asset needed: none
- claims that are off-limits: new distances, crime/safety stats, fishing-license rules, county facts, best-beach claims, fee percent/range/minimum, business-partner name, on-island inventory
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: already-published pet, book-direct, and near-island wording; live 404 and index.html 200 receipts

## Page Builder Tasks

- source files likely to change: `src/guides/things-to-do-bradenton-fl.html`, `src/guides/bradenton-vs-sarasota.html`, `src/guides/pet-friendly-anna-maria-island.html`, `src/guides/booking-direct-vacation-rentals.html`, `src/guides/anna-maria-island-area-guide/index.html`, `src/guides/anna-maria-island-vs-siesta-key.html`, `src/guides/siesta-key-area-guide/index.html`, `src/_data/seoPages.json`, `src/_redirects`, `docs/briefs/2026-11-gsc-content-gap-hygiene.md`, `docs/status/page-ledger.json`, `docs/portfolio/winner-guides.md`, `docs/portfolio/owner-acquisition.md`, `scripts/enforcement/gsc-content-gap-hygiene.test.js`, `scripts/enforcement/winner-guide-consolidation.test.js`, `scripts/enforcement/page-family-inventory.test.js`
- redirect or schema work: 301 the Bradenton Beach owner 404 to the AMI owner page; 301 Bradenton vs Sarasota `index.html` to the trailing-slash canonical; FAQPage entries only for new visible questions
- internal-link or CTA work: comparison → things-to-do guide; AMI area guide → near-island collection; comparison → Siesta Key area guide
- money CTA and downstream tracking event to verify: existing `guide_book_direct_click` on the new near-island block

## Voice Editor Checklist

- tone risks: AEO H2s that sound like keyword stuffing; near-island copy that still reads as on-island
- generic or mechanical patterns to kill: `Use this when`, trip-shape jargon, fee or partner names
- proof or specificity checks: first sentences reuse only claims already on the same page
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured

## Release Gate Checklist

- routes to smoke test: `/guides/things-to-do-bradenton-fl/`, `/guides/bradenton-vs-sarasota/`, `/guides/pet-friendly-anna-maria-island/`, `/guides/booking-direct-vacation-rentals/`, `/guides/anna-maria-island-area-guide/`, `/stays/vacation-rentals-near-anna-maria-island/`, `/stays/bradenton-vacation-rentals-near-beaches/`, `/guides/anna-maria-island-vs-siesta-key/`, `/guides/siesta-key-area-guide/`
- commands to run: `npm run check:brief -- docs/briefs/2026-11-gsc-content-gap-hygiene.md --gate0`; `npm run lint:content`; `node --test scripts/enforcement/gsc-content-gap-hygiene.test.js`; `npm run verify:release`
- regression risks to watch: on-island implication; growing `src/_redirects` or `docs/status/page-ledger.json` past the file-size gate; settle-window edits to the book-direct and AMI vs Siesta sources without a Settle-Override trailer; colliding with #1095 `seoPages.json` owner titles or #1034 `/reviews/`

## Done When

- the eight named fixes are in source on existing pages
- checks are green
- a draft PR is open, then marked ready with `@codex review` requested
- the PR is not merged

## Not In Scope

- new guest pages
- AMI-to-Sarasota distance and Bradenton safety FAQ
- owner-page title rewrites
- `/reviews/`
- homepage phone layout
- merging or production publish
