# Brief: Related Link Cleanup

## Content Gate Inputs

- persona: Gulf Coast guest comparing stay pages or owner comparing property-management topics before choosing the next Seascape page.
- primary keyword: Florida Gulf Coast vacation rentals
- secondary keywords: Anna Maria Island vacation rentals, Bradenton vacation rentals near beaches, Sarasota vacation rental management, vacation rental management fees Florida
- audience pattern: visitor who has landed on one commercial page and needs adjacent source-owned routes that match trip shape, destination, owner question, or direct-book intent.
- proof source: `src/_data/seoPages.json`, `src/stays/stays.njk`, `src/property-management/property-management.njk`, `docs/portfolio/stay-money-pages.md`, `docs/status/next-batch.md`, and existing source-owned stay and owner routes.
- required internal links: `/stays/anna-maria-island-vacation-rentals/`, `/stays/bradenton-vacation-rentals-near-beaches/`, `/stays/luxury-vacation-rentals-sarasota/`, `/property-management/vacation-rental-management-fees-florida/`, `/property-management/vacation-rental-management-bradenton/`, `/property-management/airbnb-management-services-sarasota/`
- CTA target: preserve existing stay-page property CTAs and owner revenue-review CTAs; this batch only controls related-card destinations from existing pages.
- anti-claims: no new stay pages, no title or metadata rewrite, no new amenity or capacity claims, no claim that near-island homes are on-island, no new owner proof claim, no direct-book savings claim beyond the approved 10-15% boundary, and no performance claim before the next analytics read.

## Why This Batch

- The stay and owner families already have live money pages, but many pages need clearer paths into adjacent commercial intent without creating more page volume.
- The related cards can help a reader move from one trip shape or owner question to another without changing the main page argument.
- Layer 2 guide-to-owner money-page links are intentionally out of scope for this branch because they touch hand-authored guide copy and need their own review pass.

## Experiment And Readback Contract

- hypothesis: source-owned related links will help stay-page and owner-page visitors find a better-fitting live route before they leave the site.
- primary event: `stay_view_property_click` and owner revenue-review submission.
- guardrail event: `catalog_book_direct_click`, owner phone/review CTA integrity, canonical integrity, link integrity, and valid rendered pages.
- entry criteria: branch only references existing source slugs and keeps current page CTAs unchanged.
- readback window: first 7 complete days after deploy once GSC and GA4 cover the full window.
- decision rule: keep if pages render valid related links and either stay or owner related routes record downstream engagement in the next read; if not, revisit placement and destination mix before adding more page variants.

## Cluster In Scope

- canonical winner URLs: existing `/stays/` and `/property-management/` pages already present in `src/_data/seoPages.json`.
- feeder pages: related stay cards rendered by `src/stays/stays.njk` and related owner-resource cards rendered by `src/property-management/property-management.njk`.
- aliases or retired URLs: none added by this batch.
- money destination: existing stay pages, property-card direct-date links, owner money pages, and the revenue-review CTA.
- active lane: direct-book stay intent and owner acquisition support.

## Source And Proof Constraints

- property truth needed: no new property facts should be introduced by this branch.
- owner proof asset needed: none; this branch does not add owner proof copy.
- claims that are off-limits: new amenity claims, new inventory breadth claims, new savings claims, new owner proof claims, and guide-to-owner transfer claims.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: existing near-island, Bradenton, Sarasota, pool, dock, family, group, book-direct, fee, switcher, and local management route coverage.

## Page Builder Tasks

- source files likely to change: `src/_data/seoPages.json`, this brief, and local Git hygiene files.
- redirect or schema work: none planned.
- internal-link or CTA work: add `relatedStaySlugs` and `relatedOwnerResources` only when each slug resolves to an existing source-owned page.
- money CTA and downstream tracking event to verify: preserve existing `stay_view_property_click` property-card paths, existing collection CTA tracking, and existing owner revenue-review paths.

## Voice Editor Checklist

- tone risks: related-card labels should not imply unavailable inventory, beachfront homes, new amenities, or unsupported owner outcomes.
- generic or mechanical patterns to kill: internal workflow phrasing, broad tourism adjectives, and any instruction-style copy in visible stay-page or owner-page text.
- proof or specificity checks: every related slug must resolve to a live source-owned stay or owner page.
- customer wording kept where it sounds natural; no new customer-facing paragraph copy is planned for this branch.

## Release Gate Checklist

- routes to smoke test: representative `/stays/` pages with related stay cards and representative `/property-management/` pages with related owner-resource cards.
- commands to run: `npm run lint:content`, `npm run build`, `npm run verify:links`, `npm test`, and `npm run verify:release`.
- regression risks to watch: broken related-card links, stale non-routable slugs, hidden public-copy drift, owner CTA drift, and machine-local receipt files in the branch.

## Done When

- the branch is off root `main`
- stale local receipt output is removed from the diff
- this active brief covers the related stay and owner link data changes
- related slugs parse as valid JSON and resolve to live source-owned pages
- content, build, link, test, and release gates pass

## Post-Reread Outcome

- reread window used: pending after deploy.
- crawl freshness result: pending after deploy.
- actual impressions, CTR, position, and downstream event counts: pending.
- decision taken: pending.
- next branch slug or explicit wait state: hold broad stay-page or owner-page expansion until the next analytics read names it.

## Not In Scope

- Layer 2 guide-to-owner money-page links.
- new stay or owner pages.
- title or metadata rewrites.
- guide copy edits.
- owner proof copy.
- booking, lead, or revenue impact claims before readback.
