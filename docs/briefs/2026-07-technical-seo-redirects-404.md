# Brief: Technical SEO batch — redirect-chain repair + branded 404

Rescue-lane technical batch from the 2026-07-24 full-site audit (Sawyer-approved,
decision delegated to the weekly SEO strategy loop). No reader-copy rewrites on
any tracked money or winner page; the only new public copy is the 404 utility
page.

## Content Gate Inputs

- persona: any visitor landing on a dead URL; search crawlers resolving legacy redirect equity
- primary keyword: none — utility page (404 is noindex) and redirect plumbing
- secondary keywords: none
- audience pattern: mistyped/expired inbound links; legacy URL equity flowing through `src/_redirects`
- proof source: 2026-07-24 live technical audit (curl-verified 2-hop chains; Netlify default 404 confirmed at /this-page-does-not-exist-xyz/)
- required internal links: 404 page links to `/properties/`, `/guides/`, `/property-management/`, `/`
- CTA target: `/properties/` (book-direct) and `/property-management/` (owner funnel)
- anti-claims: no fee/revenue/homes-served numbers on the 404 page; no new metric claims anywhere

## Why This Batch

- what changed in the data: 2026-07-24 audit found 14 redirect rules whose targets lack a trailing slash, producing live two-hop 301 chains (curl-verified), 2 rules 301ing legacy equity into noindexed stay pages (equity dropped entirely), and an unbranded Netlify default 404 with zero recovery path.
- why this cluster wins now: pure equity-leak repair on existing URLs — zero content risk, zero gate conflict, mechanical and reversible.
- what should explicitly wait: font-loading batch (24 templates, visual-risk), schema/title batch, all guide/content passes — separate briefs.

## Experiment And Readback Contract

- hypothesis: eliminating the second 301 hop and the noindex dead-ends preserves legacy equity; a branded 404 recovers otherwise-lost sessions.
- primary event: post-deploy curl shows single-hop 301s for all repaired rules; /404 renders branded page with nav.
- guardrail event: `verify:redirects` still validates all 422 rules; `verify:links` stays clean; no sitemap change.
- readback window: none required — this is plumbing, not a ranking experiment.
- decision rule: if any repaired target 404s post-deploy, revert the rule same-day.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | N/A — technical batch, no query target |
| Searcher intent | N/A |
| Current Seascape URL | `src/_redirects` rules (lines 26–29, 338–357) + new `/404.html` |
| SERP observed date | 2026-07-24 |
| SERP stale after | 2026-07-31 |
| Current proof | 2026-07-24 audit: 12 live 2-hop chains curl-verified; 2 rules target `staysNoindexSlugs` members (`seoGovernance.js:4,10`); live 404 renders Netlify default |
| Top visible competitors | N/A |
| Competitor angle | N/A |
| Visual/format gap | N/A |
| Seascape gap | Redirect equity leaks on every legacy hop; noindex targets drop it entirely; 404 has no brand, nav, or recovery path |
| Search fit | Plumbing repair on existing URLs; no new indexable surface (404 is noindex) |
| Local/GBP proof | N/A — plumbing batch with no local query target; no GBP surface touched |
| AEO/readback note | N/A — the 404 page is noindex and redirect rules expose no answer surface to extract |
| Recommendation | Slash-terminate the 14 no-slash targets; repoint the 2 noindex-target rules at indexable equivalents; ship a branded noindex 404 |
| Attack status | completed |
| Query variants inspected | N/A |
| SERP source | N/A — live-site curl audit |
| Competitor URLs inspected | Own-site defect URLs inspected live: https://seascape-vacations.com/stays/bradenton-beach-vacation-rentals (two-hop 301 verified) ; https://seascape-vacations.com/this-page-does-not-exist-xyz/ (Netlify default 404 observed) |
| Content gap and Seascape answer | N/A — no reader-content change beyond the 404 utility copy |
| Design/format strategy | 404 uses base layout + existing tokens; no new layout system |
| Seascape proof available | N/A — no claims made |
| Tools/plugins used | live curl audit, `verify:redirects`, `verify:links`, `npm test`, `verify:release` |
| Decision and reason | Ship: pure equity/UX repair, mechanically verifiable, reversible, no gate conflict |

## Cluster In Scope

- canonical winner URL(s): none touched
- feeder pages: legacy redirect sources in `src/_redirects`
- aliases or retired URLs: the 14 no-slash targets; 2 noindex-target repoints
- money destination: `/properties/` and `/property-management/` (404 recovery links)
- active lane: technical rescue

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: none
- claims that are off-limits: all metrics — the 404 makes no claims

## Page Builder Tasks

- source files likely to change: `src/_redirects` (16 rules), new `src/404.njk`
- redirect or schema work: slash-terminate targets; repoint 2 rules to indexable pages
- internal-link or CTA work: 404 links to properties/guides/property-management/home
- money CTA and downstream tracking event to verify: none changed

## Voice Editor Checklist

- tone risks: 404 copy must sound like Seascape (plain, warm), not a template joke page
- generic or mechanical patterns to kill: no "oops!", no "unlock", no exclamation stacking
- proof or specificity checks: no numbers, no claims
- customer wording kept where natural

## Release Gate Checklist

- routes to smoke test: repaired redirect sources (single-hop), `/404.html` render
- commands to run: `npm run lint:content`, `npm run build`, `npm run verify:links`, `npm run verify:redirects`, `npm test`, `npm run verify:release`
- regression risks to watch: redirect validator must still pass all rules; 404 must be noindex and out of sitemap

## Done When

- merged to main, Netlify built, live curl shows single-hop 301s on repaired rules and the branded 404 at a dead URL.

## Post-Reread Outcome

- reread window used: N/A (plumbing)
- crawl freshness result: N/A
- actual impressions, CTR, position, and downstream event counts: N/A
- decision taken: shipped per audit findings
- next branch slug or explicit wait state: font-loading batch and schema/title batch follow as separate briefs

## Not In Scope

- font-loading pattern swap (separate batch — visual risk)
- title/meta/schema changes (separate batch)
- any reader-copy rewrite on money or winner pages
- new indexable pages
