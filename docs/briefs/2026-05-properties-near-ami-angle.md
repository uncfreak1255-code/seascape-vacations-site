# Brief: Properties Near AMI Angle Tightening

## Content Gate Inputs

- persona: Guest comparing where to stay near Anna Maria Island before opening live dates
- primary keyword: vacation rentals near anna maria island
- secondary keywords: bradenton vacation rentals, sarasota vacation rentals, florida gulf coast vacation rentals
- audience pattern: Searcher wants a truthful near-island pool-home route and needs to understand whether Bradenton or Sarasota is the better base
- proof source: `workspace/dataforseo-results-capture-sheet-first-5-calls.md`, `workspace/dataforseo-phase1-raw/call-5.json`, and current Seascape property truth in `src/_data/properties.js` and `src/_data/properties-fallback.json`
- required internal links: /guides/, /stays/book-direct-anna-maria-island/, /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/sarasota-vacation-rentals-with-pool/
- CTA target: Route broad near-AMI intent into the right stay collection first, then into property pages or live dates
- anti-claims: Do not imply the homes are on Anna Maria Island, directly on the beach, or interchangeable with AMI-first local operators

## Why This Batch

- The May 16 DataForSEO read on `/properties/` showed the weakest page/query fit in the first pass.
- The SERP for `vacation rentals near anna maria island` was dominated by a hotels pack and AMI-focused local operators, with `seascape-vacations.com` absent from page 1.
- The right response is not homepage surgery or a fake on-island rewrite. It is a tighter `/properties/` angle that states the tradeoff early and routes guests to the narrower stay pages that better match their real intent.

What should wait:

- homepage/entity changes
- AI Mode conclusions before phase 2 is filled
- new stay-page sprawl
- local-pack or GBP work that belongs to a separate entity lane

## Search Operator Read

- Evidence read: `workspace/dataforseo-results-capture-sheet-first-5-calls.md`, `workspace/dataforseo-master-scoreboard-core-guest-pages.md`, `workspace/dataforseo-research-plan-core-guest-pages.md`
- Raw SERP checked: `workspace/dataforseo-phase1-raw/call-5.json`
- Top organic domains in the miss: `annamaria.com`, `annamarialifevacationrentals.com`, `amilocals.com`, `seabreezevacation.com`, `anchordownvacationrentals.com`
- Dominant non-organic feature: `hotels_pack`
- Preserved customer wording: `near Anna Maria Island`, `pool home`, `Bradenton`, `Sarasota`
- Main read: this query behaves like on-island or strongly AMI-adjacent inventory intent, so `/properties/` should act like an honest router instead of pretending the broad collection already satisfies that promise

## Cluster In Scope

- canonical winner URL(s): `/properties/`
- feeder pages: `/stays/book-direct-anna-maria-island/`, `/stays/anna-maria-island-vacation-rentals/`, `/stays/bradenton-vacation-rentals-near-beaches/`, `/stays/sarasota-vacation-rentals-with-pool/`
- aliases or retired URLs: none in this batch
- money destination: the correct stay collection first, then property detail pages and live dates
- active lane: direct-book stay intent

## Source And Proof Constraints

- Property claims must stay aligned with `src/_data/properties.js` and `src/_data/properties-fallback.json`
- Do not turn near-island language into on-island or beachfront claims
- Do not invent broader AMI inventory coverage than Seascape actually has
- The page can sell Bradenton as the easier AMI-access value base and Sarasota as the city-first pool-home base because those are true collection-level tradeoffs already present in source

## Page Builder Tasks

- source file likely to change: `src/properties/index.njk`
- tighten hero, routing, metadata, and filter-copy language around the near-AMI tradeoff
- keep route cards above broad browsing so the page narrows intent before generic filtering
- money CTA and downstream tracking event to verify: route-card clicks via `catalog_collection_click`, property-card date paths, and the existing direct-book nav path

## Voice Editor Checklist

- Kill any leftover generic catalog language that hides the location tradeoff
- Keep the first paragraph practical and guest-facing, not explanatory or defensive
- Preserve `near Anna Maria Island` honesty without sounding apologetic
- Make Bradenton-versus-Sarasota guidance sound like local judgment, not taxonomy filler

## Release Gate Checklist

- smoke routes: `/properties/` and one representative detail page under `/properties/`
- commands to run: `npm run build`, `npm run verify:jsonld`, `npm run verify:links`, `npm run lint:content`, `npm test`
- rendered QA to capture: fresh desktop and mobile screenshots for `/properties/`
- regression risks: mobile route-card stacking, filter-toolbar copy updates, and property-card layout rhythm

## Done When

- `/properties/` opens with the real tradeoff instead of a generic luxury-catalog pitch
- the route cards make the next move obvious for near-AMI, Bradenton, Sarasota, and fee-first intent
- metadata supports the near-AMI angle without pretending the homes are on-island
- release checks and rendered QA pass on the current branch output

## Post-Reread Outcome

- reread window used: pending after merge and crawl freshness
- crawl freshness result: pending
- actual impressions, CTR, position, and downstream event counts: pending
- decision taken: hold, expand, or kill after phase 2 and post-merge reread
- next branch slug or explicit wait state: wait for phase 2 AI/local evidence before any broader `/properties/` expansion

## Not In Scope

- changing the homepage
- pretending `/properties/` should win as an AMI-first operator page
- making entity or local-pack work do double duty as page-copy work
- expanding into unrelated stay pages beyond the existing route set
