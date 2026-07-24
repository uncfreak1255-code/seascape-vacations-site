# Brief: Ahrefs Crawl Image and Metadata Rescue

## Content Gate Inputs

- persona: Gulf Coast travelers deciding between quiet island days and a livelier Sarasota beach trip, then looking for a home that fits those days.
- primary keyword: Bradenton vs Sarasota beaches.
- secondary keywords: Anna Maria Island vs Siesta Key where to stay, Bradenton beaches vs Sarasota beaches.
- audience pattern: vacation researcher comparing beach character, parking, trip fit, and where to stay before opening a direct-book option.
- proof source: 2026-07-20 source inspection, rendered desktop and mobile readback, Hostaway CDN HTTP readback, current web results, and canonical property data.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/siesta-key-area-vacation-rentals/, /properties/sarasota-luxe/#check-availability
- CTA target: show Sarasota Luxe before the long comparison with `See photos & check dates` linking to `/properties/sarasota-luxe/#check-availability`.
- anti-claims: no ranking, traffic, booking, AI-citation, page-speed, or Ahrefs-clearance claim before a fresh external crawl.

## Why This Batch

- A retired Bradenton Pool Home image URL in the beach-comparison guide returns HTTP 500 while the current canonical property image returns HTTP 200 as `image/webp`.
- The Anna Maria Island vs Siesta Key guide exposes a `WebPage.name` that no longer matches its document title.
- The Anna Maria Island vs Siesta Key guide points Sarasota-side readers to a stay collection but does not name Seascape's Sarasota home, which Sawyer asked to expose on the page for review.
- The recent guide review also reproduced a content-gate miss: internal planning phrases reached reader copy, and the Sarasota link appeared too late to function as a persuasive offer. The neutral base corrects those contracts without selecting either design alternative.
- These are still bounded repairs on existing pages. They do not justify a new route or a fresh optimization batch.

## Experiment And Readback Contract

- hypothesis: replacing the failed owned image reference, aligning the page title with `WebPage.name`, and naming the Sarasota-side Seascape home improves machine-readable and human-readable clarity without changing the page's core decision path.
- primary event: successful rendered image load, exact title/schema equality, and rendered Sarasota Luxe presence on the guide.
- guardrail event: existing property-card dimensions, canonicals, core comparison structure, and tracked CTAs remain intact.
- entry criteria: retired image fails live HTTP readback; canonical replacement succeeds; schema/title mismatch reproduces in source.
- readback window: next Ahrefs crawl after deploy, with live route and asset checks immediately after deploy.
- decision rule: close only when the live routes reflect the source repair and a fresh Ahrefs crawl no longer reports the owned defects; otherwise reopen the exact failing URL or schema node only.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | `Bradenton vs Sarasota beaches` and `Anna Maria Island vs Siesta Key where to stay` on the two existing comparison guides. |
| Searcher intent | Compare beach conditions and trip fit, then choose a stay base or property. |
| Current Seascape URL | `https://seascape-vacations.com/guides/bradenton-vs-sarasota-beaches/` and `https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key/`. |
| SERP observed date | 2026-07-20 |
| SERP stale after | 2026-07-27 |
| Current proof | On 2026-07-20 the retired Hostaway image returned HTTP 500, its canonical replacement returned HTTP 200 as `image/webp`, and source inspection reproduced a `WebPage.name` that differed from the document title. |
| Top visible competitors | Anna Maria Island Beach Rentals' AMI-vs-Siesta vacation guide, Passage Key Dolphin Tours' destination comparison, and TB Relo's island lifestyle comparison. |
| Competitor angle | Beach atmosphere, family fit, activities, lifestyle, and where to vacation or live. None changes the technical repair required on Seascape's owned asset and schema. |
| Visual/format gap | Two valid design alternatives are under review. Keep their shared content and conversion contract neutral: the direct answer remains first, and Sarasota Luxe appears before the long comparison with a visible mobile action. |
| Seascape gap | One owned image request fails, one machine-readable page name drifts from the title already shown to searchers, and the Sarasota-side comparison path hides the named Sarasota home. |
| Search fit | Both existing Seascape guides appear for the inspected query family, so repair the current pages rather than open a duplicate or rewrite. |
| Local/GBP proof | Not applicable because this branch changes no NAP, map-pack, GBP, or local-service claim; it repairs two owned guide outputs. |
| AEO/readback note | Title/schema alignment improves machine-readable consistency, but this branch makes no claim that it will increase citations or rankings. |
| Recommendation | Replace the retired image with canonical property truth, align `WebPage.name` with the title, remove internal planning language from reader copy, expose Sarasota Luxe before the long comparison, add fail-loud regression tests, and wait for a fresh crawl before claiming clearance. |
| Attack status | completed |
| Query variants inspected | `Bradenton vs Sarasota beaches vacation comparison`; `Anna Maria Island vs Siesta Key where to stay`. |
| SERP source | Current web search observed 2026-07-20 after the Agent Reach Exa backend was unavailable locally. |
| Competitor URLs inspected | `https://annamariaislandbeachrentals.com/blog/anna-maria-island-vs-siesta-key`; `https://www.passagekeydolphintours.com/blog/anna-maria-island-vs-siesta-key`; `https://tbrelo.com/blog/siesta-key-vs-anna-maria/`. |
| Content gap and Seascape answer | No new content gap was found for this rescue. The existing guides answer the comparison intent; the repair is a failed image request and schema-title consistency. |
| Design/format strategy | Keep this base design-neutral. Both alternatives must preserve the answer-first hierarchy and exact Sarasota conversion contract, then prove their own desktop and mobile layout separately. |
| Seascape proof available | `src/_data/properties-fallback.json`, current guide head metadata, rendered build output, CDN HTTP readback, and desktop/mobile screenshots. |
| Tools/plugins used | Agent Reach search route attempted; approved web-search fallback; `curl`; local Node tests; JSON-LD validator; desktop and mobile browser checks. |
| Decision and reason | Fix both defects now because they are reproducible and source-owned; do not expand into slow-page, title-rewrite, copy, route, or schema work that was not reproduced. |

## Cluster In Scope

- canonical winner URLs: the two current guide routes named above.
- feeder pages: none changed.
- aliases or retired URLs: none changed.
- money destination: Sarasota Luxe at `/properties/sarasota-luxe/#check-availability`, plus the existing AMI and Siesta-area stay collections.
- active lane: crawl hygiene for existing comparison guides.

## Source And Proof Constraints

- property truth needed: the Bradenton Pool Home image must trace to `src/_data/properties-fallback.json`.
- owner proof asset needed: none.
- claims that are off-limits: any claim that the external crawl is already clear, or that this patch improved traffic, rank, speed, citations, or bookings.
- Seascape-specific proof: canonical property data and the current page title are sufficient for these two source-owned repairs.

## Page Builder Tasks

- source files changed in this batch:
  - `src/guides/bradenton-vs-sarasota-beaches/index.html`
  - `src/guides/anna-maria-island-vs-siesta-key.html`
- redirect or schema work: align only the existing `WebPage.name`; add no schema type or redirect.
- internal-link or CTA work: preserve current tracked actions and add the exact Sarasota Luxe availability action before the long comparison.
- visible-copy work: replace `trip shape`, `stay base`, `booking path`, `named option`, `right stay`, and `research mode` with the vacation, property, or literal next action the traveler can picture.
- regression proof: source contract rejects the retired image and future title/schema drift.

## Sarasota Luxe Conversion Contract

- offer: Sarasota Luxe
- placement: after the direct answer and before `Quick Comparison at a Glance`
- exact destination: `/properties/sarasota-luxe/#check-availability`
- CTA label: `See photos & check dates`
- supporting property facts: 4 bedrooms, 3 bathrooms, sleeps 12, downtown Sarasota, heated pool, hot tub, and outdoor kitchen
- mobile order: stack immediately after the direct answer or its first decision module; do not hide the action in an overlay
- tracking marker: `data-track-event="guide_property_check_dates_click"`, `data-property-slug="sarasota-luxe"`, and a placement value identifying the pre-comparison module

## Release Gate Checklist

- run focused metadata integrity tests, content lint, build, JSON-LD validation, link validation, and the full release gate.
- require a Voice Editor `Approved` verdict covering static, JavaScript-generated, and component-generated reader copy.
- verify the replacement CDN response, rendered desktop/mobile image, Sarasota module order, and clicked availability destination.
- treat any red or missing visual check as `NOT READY`, even when build and `verify:release` are green.
- require a clean exact-base/exact-head landing review receipt and green PR checks.
- after deploy, verify both live guide routes and the replacement asset before waiting for Ahrefs recrawl.

## Done When

- source and rendered output use the active image, matching title/schema name, and the exact Sarasota Luxe availability action before the long comparison.
- no blocked internal planning phrase appears in static, JavaScript-generated, or component-generated reader copy.
- regression tests, release verification, and PR checks pass.
- live deployment proof is recorded separately; no external crawl-clear claim is made before the next Ahrefs read.

## Not In Scope

- choosing or merging either design alternative, slow-page remediation, title rewrites beyond this source-truth alignment, new pages, route changes, broad schema changes, or unrelated visual-baseline repair.
