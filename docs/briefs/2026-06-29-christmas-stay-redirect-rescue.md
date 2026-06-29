# Brief: Christmas Stay Redirect Rescue

## Content Gate Inputs

- persona: Gulf Coast guest who lands on an older Christmas vacation rental URL and should reach the current AMI stay page instead of a 404.
- primary keyword: Christmas vacation rentals Florida
- secondary keywords: Christmas vacation rentals Anna Maria Island, holiday vacation rentals Anna Maria Island, Anna Maria Island vacation rentals
- audience pattern: legacy seasonal stay demand or stale links hitting a retired holiday alias.
- proof source: live production route check on 2026-06-29, live SERP search on 2026-06-29, `docs/status/next-batch.md`, `docs/portfolio/stay-money-pages.md`, current `src/_redirects`, and deploy-preview route readback for PR 429.
- required internal links: none; this is route hygiene, not page copy or internal-link expansion.
- CTA target: preserve the existing `/stays/anna-maria-island-vacation-rentals/` money destination and its current `Check Direct Dates` path.
- anti-claims: no rank-recovery claim, no indexation-recovery claim before recrawl, no Christmas inventory claim, no new holiday page, no broader stay expansion.

## Why This Batch

- what changed in the data: production returns `404` for `/stays/christmas-vacation-rentals-florida/`, while the related AMI holiday aliases already redirect to `/stays/anna-maria-island-vacation-rentals/`.
- why this cluster wins now: it is a one-route live damage fix inside the existing AMI stay alias family, with current competitors showing real Christmas/holiday rental intent.
- what should explicitly wait: any seasonal page rebuild, title/meta rewrite, holiday copy, or broader stay expansion.

## Experiment And Readback Contract

- hypothesis: adding a direct 301 from the shorter retired Christmas alias to the AMI stay money page will remove one avoidable live 404 without reopening a thin holiday page.
- primary event: `/stays/christmas-vacation-rentals-florida/` stops resolving as a production 404 after deploy.
- guardrail event: redirect validation, internal-link validation, JSON-LD validation, content lint, and release safety stay green.
- entry criteria: production returns `HTTP/2 404` for the shorter Christmas alias on 2026-06-29, and current source already routes the related Christmas Gulf Coast alias to the AMI stay money page.
- readback window: immediate deploy-preview route readback, immediate production route readback after merge/deploy, then normal Search Console recrawl.
- decision rule: keep if the alias 301s directly to `/stays/anna-maria-island-vacation-rentals/` with no redirect hop; revisit only if fresh GSC/SERP proof justifies a real seasonal page.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | Christmas vacation rentals Florida; Christmas vacation rentals Anna Maria Island; holiday vacation rentals Anna Maria Island. |
| Searcher intent | Seasonal guest booking or trip-planning intent for holiday vacation rentals near Anna Maria Island. |
| Current Seascape URL | Retired alias `/stays/christmas-vacation-rentals-florida/`; current destination `/stays/anna-maria-island-vacation-rentals/`. |
| SERP observed date | 2026-06-29 |
| SERP stale after | 2026-07-06 |
| Current proof | Production returned `HTTP/2 404` for `/stays/christmas-vacation-rentals-florida/` on 2026-06-29. Current source already redirects `/stays/christmas-vacation-rentals-florida-gulf-coast/` and other AMI holiday aliases to `/stays/anna-maria-island-vacation-rentals/`. The deploy preview for PR 429 returns `HTTP/2 301` from the shorter alias to `/stays/anna-maria-island-vacation-rentals/`. |
| Top visible competitors | Anna Maria Life Vacation Rentals holiday and Christmas rental pages; SeaBreeze Vacation Anna Maria Island Christmas rentals; broader AMI vacation rental inventory pages. |
| Competitor angle | Dedicated seasonal inventory pages, broad AMI home availability, private pools, waterfront or amenity filters, and book-direct holiday rental positioning. |
| Seascape gap | Seascape does not currently have source-backed Christmas inventory copy for this retired URL, but the live 404 wastes legacy seasonal demand that should reach the current AMI stay money page. |
| Search fit | The current AMI vacation rentals page is the safest destination because it is the existing stay money page for AMI demand and avoids unsupported Christmas-specific inventory claims. |
| Local/GBP proof | Not a local-pack or GBP route; this is organic route hygiene for a retired seasonal stay URL. |
| AEO/readback note | No AI citation or answer claim should be made from this redirect. The proof is route behavior only: 404 before, direct 301 after deploy. |
| Recommendation | Add a direct 301 from `/stays/christmas-vacation-rentals-florida/` to `/stays/anna-maria-island-vacation-rentals/`, lock it with `technical-cleanup.test.js`, and update the stay portfolio alias map. |

## Search Operator Read

- source reads used: `src/_redirects`, `docs/portfolio/stay-money-pages.md`, `docs/status/next-batch.md`, `scripts/enforcement/technical-cleanup.test.js`, and live route checks.
- URLs inspected: `/stays/christmas-vacation-rentals-florida/`, `/stays/christmas-vacation-rentals-florida-gulf-coast/`, `/stays/holiday-vacation-rentals-anna-maria-island/`, `/stays/thanksgiving-vacation-rentals-florida/`, and `/stays/anna-maria-island-vacation-rentals/`.
- main evidence: the shorter Christmas alias was the only checked AMI holiday alias returning production 404.
- competitor pages inspected for demand patterns, not copied topics: Anna Maria Life and SeaBreeze Christmas/holiday rental SERP results.
- question-tool language worth preserving in customer wording: none; this branch changes routing, not public copy.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: current `docs/status/next-batch.md` is `fresh but below threshold`, so this is limited to redirect hygiene and does not authorize a seasonal content build.

## Cluster In Scope

- canonical winner URL(s): `/stays/anna-maria-island-vacation-rentals/`
- feeder pages: none changed.
- aliases or retired URLs: `/stays/christmas-vacation-rentals-florida/`
- money destination: `/stays/anna-maria-island-vacation-rentals/`
- active lane: direct-book stay route hygiene.

## Source And Proof Constraints

- property truth needed: none beyond the current AMI stay money page and existing property truth.
- owner proof asset needed: none.
- claims that are off-limits: Christmas availability, Christmas pricing, rank recovery, indexation recovery, or direct-book lift.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: current route behavior, current alias ownership, and verified redirect output.

## Page Builder Tasks

- source files likely to change: `src/_redirects`, `docs/portfolio/stay-money-pages.md`, `scripts/enforcement/technical-cleanup.test.js`, and this brief.
- redirect or schema work: add one direct 301 and assert it in the retired low-value stay redirect test.
- internal-link or CTA work: none.
- money CTA and downstream tracking event to verify: existing destination page only; no new tracking event.

## Voice Editor Checklist

- tone risks: none; no public copy change.
- generic or mechanical patterns to kill: none; avoid turning route hygiene into a holiday marketing page.
- proof or specificity checks: keep claims to route status and source ownership.
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: not applicable.

## Release Gate Checklist

- routes to smoke test: `/stays/christmas-vacation-rentals-florida/`, `/stays/anna-maria-island-vacation-rentals/`.
- commands to run: `npm run git:preflight`, `node --test scripts/enforcement/technical-cleanup.test.js`, `npm run build`, `npm run verify:redirects`, `npm run verify:links`, `npm run verify:jsonld`, `npm run lint:content`, and `npm run verify:release -- --range origin/main...HEAD`.
- regression risks to watch: redirect hop, wrong stay destination, accidental active content batch, or unsupported Christmas-specific claims.

## Done When

- `/stays/christmas-vacation-rentals-florida/` 301s directly to `/stays/anna-maria-island-vacation-rentals/` in deploy preview and production after merge/deploy.
- the route is locked by `technical-cleanup.test.js`.
- release safety passes with no broader SEO/content expansion.

## Post-Reread Outcome

- reread window used: not applicable for this route-hygiene fix.
- crawl freshness result: pending post-deploy recrawl.
- actual impressions, CTR, position, and downstream event counts: not claimed.
- decision taken: kill the live 404 by redirecting to the current AMI stay money page.
- next branch slug or explicit wait state: wait for production deploy readback before claiming the live gap is closed.

## Not In Scope

- new Christmas or holiday stay pages,
- title or meta rewrites,
- AMI stay money-page copy changes,
- owner, guide, GEO, or broader stay expansion,
- copied competitor structure without Seascape-specific proof or local judgment.
