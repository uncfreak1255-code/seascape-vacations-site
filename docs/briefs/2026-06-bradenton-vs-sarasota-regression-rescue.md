# Brief: Bradenton vs Sarasota Regression Rescue

## Content Gate Inputs

- persona: Gulf Coast traveler choosing between Bradenton and Sarasota as a
  vacation base.
- primary keyword: bradenton vs sarasota
- secondary keywords: bradenton vs sarasota vacation, bradenton or sarasota,
  sarasota vs bradenton florida, which is better Bradenton or Sarasota,
  bradenton vs sarasota for vacation rentals
- audience pattern: comparison researcher who may be mixing vacation, moving,
  beach, family, cost, and dining intent before choosing where to stay.
- proof source: `docs/reports/rank-tracker-2026-06-03.md`,
  `docs/portfolio/winner-guides.md`, `docs/status/next-batch.md`,
  `docs/status/search-growth-map.md`, live URL readback for
  `https://seascape-vacations.com/guides/bradenton-vs-sarasota/`, and current
  Google Search Console guidance on Search data lag and traffic-drop debugging.
- required internal links: /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/, /guides/bradenton-vs-sarasota-beaches/, /guides/bradenton-vs-sarasota-for-families/, /guides/bradenton-vs-sarasota-restaurants/, /guides/bradenton-vs-sarasota-cost-of-living/
- CTA target: keep `guideConversionKit` and `Browse Direct Gulf Coast Homes`
  routing into the mapped stay pages.
- anti-claims: no new ranking-win claim, no AI citation claim, no unsupported
  price precision, no promise that a copy edit will recover rank, no copied
  competitor structure, no new comparison page for the same query.

## Why This Batch

- what changed in the data: `docs/reports/rank-tracker-2026-06-03.md` says
  `/guides/bradenton-vs-sarasota/` dropped from #1 to #5 for `bradenton vs
  sarasota`, the largest single drop that week.
- why this cluster wins now: the page is already listed as a winner guide, has
  mapped aliases/feeders, and feeds two stay money destinations. The correct
  CEO move is to rescue the existing winner before building anything new.
- what should explicitly wait: impact claims, broad guide expansion, new pSEO
  volume, and any claim that the rescue worked before final GSC/GA4 readback.

## Experiment And Readback Contract

- hypothesis: a bounded freshness and intent cleanup that separates vacation
  intent from relocation/real-estate intent, routes readers earlier into mapped
  stay pages, and preserves the guide conversion kit should improve the page's
  fit for the `bradenton vs sarasota` vacation query without creating duplicate
  content.
- primary event: `guide_book_direct_click`
- guardrail event: route and CTA integrity for the two mapped money
  destinations, plus no loss of indexability, canonical, FAQPage, Article, or
  BreadcrumbList schema.
- entry criteria: June 3 rank tracker confirms #1 to #5 regression; live route
  returns 200; page source still carries the expected canonical and
  `guide_book_direct_click` hooks.
- readback window: first 7 complete days after deploy once GSC final data covers
  the window, respecting Google's normal 2-3 day Search Console delay.
- decision rule: keep if rank, CTR, clicks, or `guide_book_direct_click` trend
  improves without a guardrail failure; if flat, run a second Gate 0 content
  depth pass against the visible winners; if worse, retune title/meta or revert
  the specific weak change.

## Search Operator Read

- source reads used:
  - `docs/status/next-batch.md`: current proof lane is `blocked by freshness`.
  - `docs/reports/rank-tracker-2026-06-03.md`: regression and action named.
  - `docs/portfolio/winner-guides.md`: money destinations and conversion event.
  - live route readback: page returns HTTP 200 on Netlify.
  - live source readback: canonical, title, description, June-in-branch review
    target, and two `guide_book_direct_click` hooks.
- URLs inspected:
  - `https://seascape-vacations.com/guides/bradenton-vs-sarasota/`
  - `/guides/bradenton-vs-sarasota/`
  - `/stays/bradenton-vacation-rentals-near-beaches/`
  - `/stays/siesta-key-area-vacation-rentals/`
- main evidence: rank tracker says the page was the click engine, dropped from
  #1 to #5, and should be fixed rather than replaced.
- competitor pages inspected for demand patterns, not copied topics:
  - search fallback showed current comparison competitors skewing real estate,
    relocation, lifestyle, and cost-of-living intent.
  - the named June 3 tracker competitors remain the required deeper Gate 0
    review targets before any larger content-depth rewrite.
- question-tool language worth preserving in customer wording: `which is better
  for vacation`, `which base wins`, `where to stay`, `beaches`, `parking`,
  `family`, `cost`, and `dining`.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this
  cluster: guide_winners have current impressions and clicks, but the branch
  cannot claim final page-level impact until the freshness-blocked readback
  catches up.

## Cluster In Scope

- canonical winner URL(s): `/guides/bradenton-vs-sarasota/`
- feeder pages:
  `/guides/bradenton-vs-sarasota-beaches/`,
  `/guides/bradenton-vs-sarasota-cost-of-living/`,
  `/guides/bradenton-vs-sarasota-for-families/`,
  `/guides/bradenton-vs-sarasota-restaurants/`,
  `/guides/bradenton-vs-sarasota-retirement/`
- aliases or retired URLs:
  `/guides/bradenton-vs-sarasota`,
  `/guides/bradenton-vs-sarasota.html`,
  `/guides/bradenton-vs-sarasota-vacation-rental-comparison`,
  `/guides/bradenton-vs-sarasota-vacation-rental-comparison/`
- money destination:
  `/stays/bradenton-vacation-rentals-near-beaches/` and
  `/stays/siesta-key-area-vacation-rentals/`
- active lane: comparison guides feeding direct-book stay intent.

## Source And Proof Constraints

- property truth needed: do not add bedroom, bathroom, amenity, or inventory
  claims beyond current property data.
- owner proof asset needed: none for this guest comparison rescue.
- claims that are off-limits: fresh GSC result claims, exact rank recovery,
  "best" claims without a source, new savings claims beyond existing approved
  direct-book fee ranges, and unsupported beach or price claims.
- Seascape-specific proof or local experience this page can add beyond generic
  competitor coverage: managed-home rate checks, guest questions across the
  corridor, direct-book stay routing, and Sawyer's local operator review.

## Page Builder Tasks

- source files likely to change:
  - `src/guides/bradenton-vs-sarasota.html`
  - `docs/process/ranking-regression-rescue.md`
  - `docs/process/seo-competitor-operating-loop.md`
  - `docs/status/seo-triage-program.md`
  - `docs/status/search-growth-map.md`
  - `docs/status/next-batch.md`
- redirect or schema work: preserve canonical, Article, FAQPage, BreadcrumbList,
  and LocalBusiness schema; update `dateModified` only if visible copy changes.
- internal-link or CTA work: add earlier money-destination links without
  removing the existing guide conversion kit.
- money CTA and downstream tracking event to verify: `guide_book_direct_click`
  still appears and routes to the intended stay pages.

## Voice Editor Checklist

- tone risks: sounding like an internal SEO note, admitting rank mechanics to
  readers, overcorrecting into real-estate/living content, or burying the
  vacation answer below methodology.
- generic or mechanical patterns to kill: `which base wins` can stay in the
  title, but body copy should explain the trip choice plainly.
- proof or specificity checks: keep rate, distance, parking, and review-date
  claims tied to visible proof or existing approved page language.
- customer wording kept where it sounds natural; SEO-tool phrasing removed
  where it sounds manufactured.

## Release Gate Checklist

- routes to smoke test:
  - `/guides/bradenton-vs-sarasota/`
  - `/stays/bradenton-vacation-rentals-near-beaches/`
  - `/stays/siesta-key-area-vacation-rentals/`
- commands to run:
  - `npm run lint:content`
  - `npm run build`
  - `npm run verify:jsonld`
  - `npm run verify:links`
  - `npm run git:preflight`
- regression risks to watch: broken guide conversion kit, schema parse failure,
  duplicate content, stale status copy, or public copy that sounds like an SEO
  work order.

## Done When

- active rescue brief exists
- process docs stop treating confirmed regressions as passive wait states
- source page has a bounded freshness/intent cleanup if copy is changed
- relevant commands pass or any blocker is named
- final status says what changed, what was verified, and what still needs the
  next GSC/GA4 readback

## Post-Reread Outcome

- reread window used: fill after deploy plus final GSC data window.
- crawl freshness result: fill after Search Console/analytics read.
- actual impressions, CTR, position, and downstream event counts: fill after
  readback.
- decision taken: hold, rewrite, expand, or kill.
- next branch slug or explicit wait state: fill after readback.

## Not In Scope

- new Bradenton vs Sarasota page variants
- broad comparison-guide expansion
- owner-page work
- July seasonal stay work
- site-wide SEO audit
- copied competitor outlines
- new tools, agents, or outside SEO packs
