# Brief: Indexing Keep/Kill Cleanup

## Content Gate Inputs

- persona: Gulf Coast traveler comparing AMI, Bradenton, and Sarasota trip costs; search crawlers resolving retired stay URLs.
- primary keyword: Florida Gulf Coast vacation cost calculator
- secondary keywords: Anna Maria Island vacation cost, Holmes Beach vacation rentals, near Anna Maria Island vacation rentals
- audience pattern: direct-book stay intent after budget comparison, with crawler cleanup for a retired duplicate stay slug.
- proof source: `docs/reports/indexing-and-indexability-forensic-2026-06-06.md`, `docs/status/open-risks.md`, `docs/status/next-batch.md`, and the 2026-06-16 GSC URL inspection/session read.
- required internal links: /research/florida-gulf-coast-vacation-cost-calculator-2026/, /stays/anna-maria-island-vacation-rentals/
- CTA target: /stays/anna-maria-island-vacation-rentals/
- anti-claims: no rank recovery claim, no API claim that the full Page Indexing 404 bucket was exported, no Holmes Beach rebuild, no summer page reopen, no AMI income guide indexation, no SRQ alias changes, and no broad stay expansion.

## Why This Batch

- what changed in the data: the June index shrink read says the site should rescue only URLs with clicks, links, owner value, or a clear canonical mistake.
- why this cluster wins now: Holmes Beach is an open redirect/sitemap cleanup risk, and the cost calculator is a valid indexable research route that needs one stronger contextual discovery link.
- what should explicitly wait: any broader stay rebuild, summer seasonal rebuild, AMI income guide rewrite, SRQ alias work, or unknown 404 redirect work without the Search Console UI export.

## Experiment And Readback Contract

- hypothesis: retiring the duplicate Holmes stay slug and adding one contextual calculator link cleans crawler signals without bloating the index.
- primary event: the calculator is crawled or indexed after the next post-deploy GSC read.
- guardrail event: sitemap, redirect, link, and content gates stay green, and Holmes Beach no longer renders as an indexable stay URL.
- entry criteria: `open-risks.md` names the Holmes dual-state bug, and GSC inspection showed the calculator as discovered but not crawled.
- readback window: first post-deploy Search Console URL inspection or next weekly indexing read after Google recrawls the affected routes.
- decision rule: stop if the calculator gets crawled or indexed; if it remains discovered but not crawled after a fresh read, add one more topically relevant donor link instead of rewriting the calculator.

## Search Operator Read

- source reads used: current sitemap/source inventory, `src/_redirects`, `src/_data/seoPages.json`, `src/_data/staysPages.js`, `docs/status/open-risks.md`, `docs/status/next-batch.md`, and the June indexing forensic.
- URLs inspected: `/stays/holmes-beach-vacation-rentals/`, `/stays/vacation-rentals-near-anna-maria-island/`, `/guides/anna-maria-island-vacation-cost/`, and `/research/florida-gulf-coast-vacation-cost-calculator-2026/`.
- main evidence: Holmes had a slashless redirect but still rendered as a slashed indexable page; the calculator was valid source/sitemap inventory but had weak crawl discovery.
- competitor pages inspected for demand patterns, not copied topics: not part of this cleanup.
- question-tool language worth preserving in customer wording: compare the same trip inputs before booking.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: GSC inspection evidence supported killing Holmes as a duplicate stay lander and rescuing the calculator with one discovery link; no evidence supports broader page rewriting.

## Cluster In Scope

- canonical winner URL(s): `/stays/vacation-rentals-near-anna-maria-island/`, `/research/florida-gulf-coast-vacation-cost-calculator-2026/`.
- feeder pages: `/guides/anna-maria-island-vacation-cost/`.
- aliases or retired URLs: `/stays/holmes-beach-vacation-rentals` and `/stays/holmes-beach-vacation-rentals/`.
- money destination: `/stays/anna-maria-island-vacation-rentals/`.
- active lane: direct-book stay intent and indexing cleanup.

## Source And Proof Constraints

- property truth needed: none.
- owner proof asset needed: none.
- claims that are off-limits: rank recovery, full 404 export completion, unsupported owner economics, and any claim that Seascape has on-island Holmes Beach inventory.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: current source inventory, redirects, sitemap output, and GSC inspection status.

## Page Builder Tasks

- source files likely to change: `src/_data/seoPages.json`, `src/_redirects`, `src/guides/anna-maria-island-vacation-cost.html`, and generated `docs/portfolio/pseo-inventory-triage.md`.
- redirect or schema work: add direct 301s from both Holmes variants to `/stays/vacation-rentals-near-anna-maria-island/`.
- internal-link or CTA work: add one related-card link from the AMI cost guide to the cost calculator.
- money CTA and downstream tracking event to verify: existing guide CTAs stay unchanged; no new event.

## Voice Editor Checklist

- tone risks: do not make the related-card copy sound like a tool instruction or an internal indexing note.
- generic or mechanical patterns to kill: avoid "use this when", "learn more", "deep dive", and "this matters because".
- proof or specificity checks: the new link copy should only claim comparison across Bradenton, Sarasota, and AMI trip inputs.
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: keep "same trip inputs before you book."

## Release Gate Checklist

- routes to smoke test: `/guides/anna-maria-island-vacation-cost/`, `/research/florida-gulf-coast-vacation-cost-calculator-2026/`, `/stays/holmes-beach-vacation-rentals`, and `/stays/holmes-beach-vacation-rentals/`.
- commands to run: `npm run build`, `npm run lint:content`, `npm run verify:links`, `npm run verify:redirects`, and `node --test scripts/enforcement/sitemap-indexability-contract.test.js scripts/enforcement/pseo-triage.test.js`.
- regression risks to watch: Holmes still in sitemap, slashed Holmes still rendering, calculator link missing from rendered guide, or accidental changes to summer, AMI income, SRQ aliases, existing stay aliases, owner pages, or indexed winner pages.

## Done When

- Holmes Beach is classified as redirect in pSEO triage, both Holmes variants 301 directly to the canonical near-AMI stay URL, the Holmes page is absent from rendered sitemap/output, the calculator link renders from the AMI cost guide, and all release-gate commands pass.

## Post-Reread Outcome

- reread window used: pending after deploy.
- crawl freshness result: pending after Search Console recrawl.
- actual impressions, CTR, position, and downstream event counts: pending.
- decision taken: hold after cleanup until the next GSC read.
- next branch slug or explicit wait state: wait for recrawl before adding any second calculator donor link.

## Not In Scope

- full Page Indexing 404 bucket classification until the authenticated Search Console UI export is available.
- new stay pages, Holmes Beach rebuild, summer vacation rebuild, AMI income guide indexing, SRQ alias edits, or owner/winner page rewrites.
- broad redirect rules for unknown 404 URLs.
