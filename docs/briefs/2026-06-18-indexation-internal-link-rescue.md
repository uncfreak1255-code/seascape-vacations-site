# Brief: Indexation Internal-Link Rescue

## Content Gate Inputs

- persona: Gulf Coast traveler or Florida vacation-rental owner who landed on a strong guide and needs the nearest useful stay or owner page.
- primary keyword: Florida Gulf Coast vacation rentals
- secondary keywords: vacation rental management Florida, Bradenton vacation rentals, Florida vacation rentals that sleep 12, condo vacation rental management Florida
- audience pattern: existing guide readers who are already evaluating trip fit, owner risk, seasonality, amenities, or management decisions.
- proof source: `workspace/technical-seo-audit-2026-06-17.md`, `.agents/skills/internal-link-targeting/scripts/analyze_internal_link_graph.py`, `docs/status/current-state.md`, `docs/status/next-batch.md`, `docs/portfolio/pseo-inventory-triage.md`, `docs/portfolio/winner-guides.md`, `docs/portfolio/stay-money-pages.md`, and current source files.
- required internal links: file-scoped; see Required Internal Link Map below.
- CTA target: preserve existing guide conversion kits, stay CTAs, and owner revenue-review CTAs; this branch only adds contextual internal links.
- anti-claims: no new routes, no title or metadata rewrites, no rank recovery claim, no indexation recovery claim before recrawl, no invented amenity or capacity claim, no claim that near-island homes are on-island, and no new owner proof claim.

## Why This Batch

- The June 17 technical audit named internal-link redistribution as the smallest technical lever against index shrink.
- Current status blocks broad expansion, but allows bounded rescue for existing pages when the source or link graph names a regression or indexation problem.
- The lone audit orphan was `/property-management/condo-rental-management-florida/`; the stay and owner targets selected here already exist, stay source-backed, and appear in pSEO triage as keep, improve, or consolidate candidates that should not be expanded into new routes.

## Experiment And Readback Contract

- hypothesis: contextual links from the strongest relevant guides and the owner hub will improve crawl discovery for weak existing owner and stay pages without bloating the index.
- primary event: crawl/index readback for the target URLs after Google recrawls, plus any downstream stay or owner engagement already tracked on those pages.
- guardrail event: content lint, link verification, JSON-LD validity, build success, and the indexation link-graph enforcement test.
- entry criteria: audit identifies the orphan and weak-link clusters; repo source confirms the target URLs exist and are source-owned.
- readback window: next Search Console indexing or weekly analytics read after deploy and recrawl.
- decision rule: keep if the targets remain valid, linked, and source-backed; if recrawl still shows non-indexation, decide page-by-page whether to strengthen, consolidate, or noindex instead of adding more broad links.

## Gate 0 Rescue Block

| Field | Required answer |
| --- | --- |
| Target query family | Florida Gulf Coast vacation rentals, Bradenton amenity vacation rentals, and Florida vacation rental management support queries. |
| Searcher intent | Mixed guest booking and owner-management intent; this branch only changes internal routing into existing pages. |
| Current Seascape URL | `/property-management/condo-rental-management-florida/` for the audit orphan, plus selected existing owner and stay pages named in this brief. |
| Current proof | `workspace/technical-seo-audit-2026-06-17.md` named `/property-management/condo-rental-management-florida/` as the lone true orphan and said the smallest technical lever was contextual internal-link redistribution into thin underlinked owner and stay pages. The repo link analyzer confirmed the condo page had no useful inbound path before this rescue and source truth confirms the target URLs already exist. |
| Top visible competitors | Live web read on 2026-06-18 surfaced broad stay marketplaces and directories such as Vrbo, FloridaRentals.com, Emerald Coast By Owner, and Florida Rental By Owners for Gulf Coast/stay amenity queries; owner-management comparison surfaces included RedAwning, Awning/Evolve/Vacasa comparisons, and host forums. |
| Competitor angle | Large inventory, amenity filters, direct-book directory framing, owner-service fee comparisons, maintenance/operations promises, and stronger crawlable category paths. |
| Seascape gap | Seascape should not answer that gap with new page volume while indexation is shrinking. The source-backed gap is discoverability: existing owner and stay pages need contextual paths from relevant high-authority guides and hubs so Google and readers can reach them without footer/nav-only routing. |
| Recommended action | Improve internal links only: fix the condo management orphan from the owner hub and a relevant owner guide, add contextual links from strong guides into selected weak stay and owner pages, then hold any ranking or indexation claim until Search Console recrawl/readback. |

## Cluster In Scope

- owner targets: `/property-management/condo-rental-management-florida/`, `/property-management/vacation-rental-maintenance-florida/`, `/property-management/vacation-rental-insurance-florida/`
- stay targets: `/stays/vacation-rentals-sleeps-12-florida/`, `/stays/vacation-rentals-with-elevator/`, `/stays/canal-homes-with-boat-dock/`, `/stays/vacation-rentals-with-game-room/`
- donor pages: `/guides/florida-gulf-coast-vacation-rental-market-report-2026/`, `/guides/bradenton-vs-sarasota/`, `/guides/things-to-do-bradenton-fl/`, and the `/property-management/` hub for the orphan backstop.

## Required Internal Link Map

- src/property-management/index.njk: /property-management/condo-rental-management-florida/, /property-management/vacation-rental-management-fees-florida/
- src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html: /property-management/condo-rental-management-florida/, /property-management/vacation-rental-maintenance-florida/, /property-management/vacation-rental-insurance-florida/
- src/guides/bradenton-vs-sarasota.html: /stays/vacation-rentals-sleeps-12-florida/, /stays/vacation-rentals-with-elevator/
- src/guides/things-to-do-bradenton-fl.html: /stays/canal-homes-with-boat-dock/, /stays/vacation-rentals-with-game-room/

## Source And Proof Constraints

- property truth needed: stay links may mention only source-backed page-level concepts already present in `src/_data/seoPages.json`; no new bedroom, bathroom, amenity, or inventory breadth claims.
- owner proof asset needed: none; owner links are routing links, not proof claims.
- claims that are off-limits: universal amenity premiums, guaranteed insurance/compliance outcomes, true beachfront inventory, rank recovery, crawl recovery, and broad savings claims outside approved source language.

## Page Builder Tasks

- source files likely to change: selected guide HTML files, `src/property-management/index.njk`, this brief, and the focused indexation link-graph test.
- redirect or schema work: none planned.
- internal-link or CTA work: add natural contextual links only where the surrounding paragraph already discusses the target issue.

## Voice Editor Checklist

- Keep visible copy practical and reader-facing.
- Do not explain indexation, crawl budget, link equity, or audit mechanics in public copy.
- Avoid new superlatives and unsupported amenity claims.
- Keep each inserted link useful in the sentence even if the reader ignores SEO context.

## Release Gate Checklist

- `npm run lint:content`
- `npm run build`
- `npm run verify:links`
- `npm run verify:jsonld`
- `node --test scripts/enforcement/indexation-link-graph.test.js`
- rerun the internal-link analyzer and confirm the condo page is no longer orphaned in source truth.

## Done When

- the condo management URL has a crawlable owner-hub path plus a contextual guide link
- selected weak stay and owner pages receive contextual links from relevant guide pages
- no new route, metadata, schema, or broad copy expansion ships
- verification passes, and impact remains pending the next indexing read

## Not In Scope

- pruning, redirects, noindex decisions, or consolidation.
- broad owner or stay copy rewrites.
- title/meta CTR rewrites.
- CWV, security headers, image dimensions, or any other audit item.
