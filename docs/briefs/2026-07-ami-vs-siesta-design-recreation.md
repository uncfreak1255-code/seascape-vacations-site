# Brief: Anna Maria Island vs Siesta Key Design Recreation

Design/format rescue of an existing tracked winner. This branch changes the
presentation layer only: it preserves the page copy, schema, tracking events,
and the readback-gate markers verbatim and brings the page onto the shared
design system so it meets the `DESIGN.md` Field Report standard. It does not
rewrite the argument, add a new page, or change the URL.

## Content Gate Inputs

- persona: Gulf Coast traveler choosing between Anna Maria Island and Siesta Key before comparing direct-bookable stays.
- primary keyword: Anna Maria Island vs Siesta Key
- secondary keywords: Siesta Key vs Anna Maria Island, Anna Maria Island vacation rentals, Siesta Key area vacation rentals, Bradenton homes near AMI beaches
- audience pattern: comparison reader who wants the beach decision and the next stay-base decision made obvious and easy to skim on mobile.
- proof source: current source for `/guides/anna-maria-island-vs-siesta-key/`, `DESIGN.md`, `src/_includes/layouts/guide-field-journal.njk`, `src/css/base.css`, `src/css/guide-field-journal.css`, Sarasota County Siesta Beach page and Manatee County Route 5 AMI trolley page (already cited on the page), and repeated Seascape guest questions about parking, beach atmosphere, and dining access.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/
- CTA target: keep beach-choice readers moving into stay-base pages with `guide_book_direct_click`, and keep the booking-engine handoff as the secondary direct-availability action.
- anti-claims: no booking, revenue, rank, CTR, or AI-citation lift claim; no invented amenity or waterfront claim; rate examples stay planning context, not live quotes; no fake scarcity or countdown; no rewrite of the reader argument; no new comparison page; no URL change.

## Experiment And Readback Contract

- hypothesis: bringing the winner onto the Field Report design system (real split-photo hero, self-hosted fonts, shared nav and footer, editorial comparison layout, responsive comparison tables) lowers bounce and makes the stay-base decision clearer without weakening the extractable answer block or the tracked stay links.
- primary event: `guide_book_direct_click`
- guardrail event: indexability, canonical, Article, FAQPage, BreadcrumbList, WebPage, and LocalBusiness schema, the guide conversion kit, the stay-base shortcut markers, and all tracked stay links remain intact.
- entry criteria: the page is the strongest nonbrand organic guide winner but shipped as a legacy standalone template that violates `DESIGN.md` (off-brand blue, raw hex, flat gradient hero, Google Fonts in-page, no shared nav/footer).
- readback window: first 7 complete days after deploy once GSC and GA4 cover the window.
- decision rule: keep if `guide_book_direct_click` holds at or above its prior run without rank, CTR, indexation, or schema regression; if engagement drops, revert the presentation change before touching copy.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | `Anna Maria Island vs Siesta Key`, `Siesta Key vs Anna Maria Island`, and stay-base follow-up queries around AMI, Bradenton near AMI beaches, and Siesta Key area stays. |
| Searcher intent | Comparison / guide research feeding guest booking. |
| Current Seascape URL | `/guides/anna-maria-island-vs-siesta-key/`. |
| SERP observed date | 2026-07-21 |
| SERP stale after | 2026-07-28 |
| Current proof | `docs/status/current-state.md` names this page as one of the strongest nonbrand organic assets in the guide-winner cluster. `docs/status/next-batch.md` run date 2026-07-14 marks the site gate `clear` with guide winners carrying the strongest measured organic traffic. The page currently ships as a legacy standalone template that fails `DESIGN.md`. |
| Top visible competitors | Tripadvisor forum threads, direct rental-company vs-guides at annamariaislandbeachrentals.com and passagekeydolphintours.com, and travel blogs like suitelifesanburg.com. |
| Competitor angle | UGC opinion, sand reputation, public beach access, restaurants/nightlife, island pace, and broad where-to-stay framing. |
| Visual/format gap | Competitors are text-heavy blog posts; none present a decisive, photo-led side-by-side matchup with an extractable answer, a scannable comparison scorecard, and a clear stay-base decision. This page can win on design and clarity, not just word count. |
| Seascape gap | The winning argument already exists but is presented as a flat, off-brand legacy page. The design recreation is the gap: bring it to the Field Report standard so the answer and the stay decision read as premium and trustworthy. |
| Search fit | The existing winner guide is the correct URL and owns the comparison intent. The action is a design/format upgrade of the current page, not a new page or title rewrite. |
| Local/GBP proof | Not a local-pack or GBP route. |
| AEO/readback note | Keep the `.guide-intro` direct-answer block and comparison tables extractable. The redesign preserves the answer-first structure; AI/citation movement is analytics-later work. |
| Recommended action | Recreate the page presentation on the shared design system: split-photo hero from real island photography, self-hosted fonts, shared nav/footer, sticky editorial rail, tokenized on-brand callouts, and responsive comparison tables, with all copy, schema, and tracking preserved. |
| Attack status | completed |
| Query variants inspected | anna maria island vs siesta key, siesta key vs anna maria island, where to stay anna maria island or siesta key |
| SERP source | Live Google SERP for "Anna Maria Island vs Siesta Key" checked 2026-07-21, plus current page source and repo review. |
| Competitor URLs inspected | Live SERP checked 2026-07-21; inspected https://annamariaislandbeachrentals.com/blog/anna-maria-island-vs-siesta-key (direct rental-company competitor: category-by-category verdicts, photography, and where-to-stay CTAs) and https://www.passagekeydolphintours.com/blog/anna-maria-island-vs-siesta-key . |
| Content gap and Seascape answer | Competitors bury the decision in prose; Seascape answers the beach tradeoff first, then makes the stay-base decision a scannable, tracked module. |
| Design/format strategy | Preserve the answer block and comparison tables; upgrade the shell to the Field Report design system without changing the argument. |
| Seascape proof available | Current dated status docs, existing page source, real island photography in `/images`, and the shared design-system CSS. |
| Tools/plugins used | Repo review, `DESIGN.md`, build and content gates, JSON-LD and internal-link validators, and rendered desktop/mobile screenshot proof. |
| Decision and reason | Recreate the existing winner's design because the current URL already owns the query and the only gap is presentation quality. |

## Required Internal Link Map

- src/guides/anna-maria-island-vs-siesta-key.html: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/

## Release Gate Checklist

- source files likely to change:
  - `src/guides/anna-maria-island-vs-siesta-key.html`
- routes to smoke test:
  - `/guides/anna-maria-island-vs-siesta-key/`
  - `/stays/anna-maria-island-vacation-rentals/`
  - `/stays/bradenton-vacation-rentals-near-beaches/`
  - `/stays/siesta-key-area-vacation-rentals/`
- commands to run:
  - `npm run lint:content`
  - `npm run build`
  - `npm run verify:jsonld`
  - `npm run verify:links`
  - `node scripts/enforcement/assert-ami-vs-siesta-readback-gate.js`
  - `npm run test:visual`
- regression risks to watch: dropped schema or tracking markers, broken stay-base shortcut gate, off-brand color reintroduction, hero photo overlap on mobile, or a comparison table that loses its answer on small screens.

## 2026-07-21 Implementation Receipt

- PR scope: recreated the design of the existing `/guides/anna-maria-island-vs-siesta-key/` page; no new page and no URL change.
- copy: reader copy preserved verbatim; the only added visible text is editorial scaffolding (a hero fact ledger, a section-navigation rail, panel labels) that restates facts already on the page.
- schema and tracking: Article, FAQPage, BreadcrumbList, WebPage, and LocalBusiness JSON-LD, the `.guide-intro` speakable block, the stay-base shortcut markers, and every `guide_book_direct_click` tracked link preserved.
- design: replaced the flat gradient hero with a real split-photo Anna Maria Island vs Siesta Key hero, removed off-brand blue and raw hex, self-hosted fonts, added the shared site nav and footer, moved onto `base.css` plus `guide-field-journal.css`, and made the comparison tables responsive.
- next readback: wait for the first complete post-deploy GSC/GA4 window before judging impact; do not claim lift from this design change alone.

## Done When

- one active design-recreation brief exists
- the page meets the `DESIGN.md` Field Report standard on desktop and mobile with saved screenshot proof
- all copy, schema, and tracking markers are preserved and the readback gate passes
- content lint, build, JSON-LD, internal-link, and visual checks pass
- the next analytics reread can still compare `guide_book_direct_click` after deploy
