# Brief: Mobile Design Media Workflow

## Content Gate Inputs

- persona: Florida Gulf Coast trip planners browsing Seascape guides and featured homes on mobile before they choose where to stay
- primary keyword: Seascape Florida Gulf Coast guides
- secondary keywords: Anna Maria Island guide, Bradenton guide, Sarasota guide, Bradenton vs Sarasota, Seascape vacation rentals
- audience pattern: visitors deciding where to stay and whether they can trust a guide card or property card tap on phone
- proof source: repo-owned guide and property templates, rendered mobile browser checks, Hostaway booking widget behavior, existing destination facts already present in source, and DESIGN.md review constraints
- required internal links: /, /guides/
- CTA target: /properties/
- anti-claims: do not invent new beach rankings, owner-economics claims, performance claims, or destination facts beyond existing page source

## Why This Batch

- The branch fixes full-card mobile tap affordance on guide and featured-property cards so phone taps navigate into the intended destination or home detail page.
- The branch also fixes the Hostaway booking widget on affected property pages so the calendar collapses cleanly to one month on mobile and the page-level sticky booking bar does not overlap the widget CTA while the booking surface is on screen.
- Rebased `main` now requires one active brief for public guide-page changes, so this branch needs an explicit shipping contract.
- This batch should stay on responsive behavior, interaction integrity, and booking-surface clarity. It should not expand into a new editorial copy program.

## Search Operator Read

- source reads used: `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `docs/process/content-quality-gate.md`, `scripts/enforcement/content-voice.test.js`, `scripts/enforcement/ui-runtime.test.js`
- URLs inspected: `/guides/anna-maria-island-area-guide/`, `/guides/bradenton-area-guide/`, `/guides/sarasota-area-guide/`, `/guides/bradenton-vs-sarasota-beaches/`, `/guides/bradenton-vs-sarasota-for-families/`, `/properties/dockside-dreams/`, `/properties/the-oasis/`, `/properties/river-house/`, `/properties/sarasota-luxe/`, `/properties/bradenton-pool-home/`
- main evidence: rendered mobile tap proof, iPhone-sized booking widget overflow proof, sticky CTA overlap proof, and desktop two-month calendar proof
- competitor pages inspected for demand patterns, not copied topics: none in this branch
- question-tool language worth preserving in customer wording: none; keep existing destination and property language natural and local
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: not part of this interaction-fix branch

## Cluster In Scope

- canonical winner URL(s): `/guides/anna-maria-island-area-guide/`, `/guides/bradenton-area-guide/`, `/guides/sarasota-area-guide/`, `/guides/bradenton-vs-sarasota-beaches/`, `/guides/bradenton-vs-sarasota-for-families/`
- feeder pages: the touched guide cards and their linked destination/property surfaces already present in source
- aliases or retired URLs: none
- money destination: `/properties/`
- active lane: mobile interaction fixes across guide discovery and property booking surfaces

## Source And Proof Constraints

- property truth needed: none beyond existing destination/property references already in guide and property source
- owner proof asset needed: none
- claims that are off-limits: new awards, new pricing claims, new owner-economics claims, and unstated performance promises
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: responsive tap reliability, booking-widget usability on phones, and existing destination/property context already present in source

- source files likely to change: shared card-link partials, shared Hostaway mobile partials, touched guides, touched property pages, shared runtime tests, and one branch brief
- redirect or schema work: none required for this lane
- internal-link or CTA work: keep `Home` and `Guides` links present across changed guide pages; preserve existing property browse paths, Hostaway booking pathways, and book-direct CTAs
- money CTA and downstream tracking event to verify: `/properties/`, linked property detail routes, and existing book-direct/property-booking pathways

## Voice Editor Checklist

- tone risks: do not let interaction cleanup turn into generic lifestyle fluff or inflated destination/property language
- generic or mechanical patterns to kill: dead tap surfaces, clipped mobile booking UI, and overlapping CTAs
- proof or specificity checks: keep existing destination and property facts intact and avoid adding new unsupported specifics
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: preserve the live page voice unless a fix requires a tiny label-level adjustment

## Release Gate Checklist

- routes to smoke test: `/guides/anna-maria-island-area-guide/`, `/guides/bradenton-area-guide/`, `/guides/sarasota-area-guide/`, `/guides/bradenton-vs-sarasota-beaches/`, `/guides/bradenton-vs-sarasota-for-families/`, `/properties/dockside-dreams/`, `/properties/the-oasis/`, `/properties/river-house/`, `/properties/sarasota-luxe/`, `/properties/bradenton-pool-home/`
- commands to run: `node --test scripts/enforcement/ui-runtime.test.js`, `npm run build`, `npm run lint:content`, `npm run verify:release`, `npm run git:preflight`, `npm run git:merge-check`
- regression risks to watch: broken card taps, sticky CTA overlap, forced horizontal overflow, and desktop calendar regressions

## Done When

- the rebased branch passes the content gate, build, release verification, and merge check
- changed guide cards navigate correctly on mobile without breaking nested inline links
- affected property booking widgets render one month on mobile, two months on desktop, and no longer suffer sticky CTA overlap while the booking surface is active
- the branch is pushable and ready for PR review without reopening mobile tap or booking-surface regressions

## Post-Reread Outcome

- reread window used: branch-level review after rebase onto `origin/main` plus live mobile rerun on the touched routes
- crawl freshness result: not part of this branch
- actual impressions, CTR, position, and downstream event counts: not measured in this branch
- decision taken: hold for PR review after verification
- next branch slug or explicit wait state: wait for PR review and merge

## Not In Scope

- net-new guide clusters or destination pages
- new property copy programs or Hostaway business-rule changes
- owner-economics media production or property reel production
- copied competitor structure without Seascape-specific proof or local judgment
