# Brief: Mobile Design Media Workflow

## Content Gate Inputs

- persona: Florida Gulf Coast trip planners comparing Seascape guide destinations on mobile and desktop
- primary keyword: Seascape Florida Gulf Coast guides
- secondary keywords: Anna Maria Island guide, Bradenton guide, Sarasota guide, Siesta Key vacation rentals, Bradenton vs Sarasota
- audience pattern: visitors evaluating which Seascape destination or beach guide to trust before browsing homes
- proof source: repo-owned guide content, rendered mobile and desktop screenshots, existing destination facts already present in source, and DESIGN.md review constraints
- required internal links: /, /guides/
- CTA target: /properties/
- anti-claims: do not invent new beach rankings, owner-economics claims, performance claims, or destination facts beyond existing page source

## Why This Batch

- The branch fixes mobile overflow, removes emoji from visible guide UI, and corrects the Siesta Key hero/media treatment.
- Rebased `main` now requires one active brief for public guide-page changes, so this branch needs an explicit shipping contract.
- This batch should stay on responsive behavior, design-system cleanup, and media quality. It should not expand into new editorial copy programs.

## Search Operator Read

- source reads used: `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `docs/process/content-quality-gate.md`, `docs/process/design-review-workflow.md`, `scripts/enforcement/content-voice.test.js`
- URLs inspected: local guide routes already reviewed in this branch, especially `/guides/bradenton-vs-sarasota/` and `/guides/siesta-key-area-guide/`
- main evidence: rendered mobile overflow proof, sticky CTA overlap proof, emoji-to-SVG replacement review, responsive hero optimization proof
- competitor pages inspected for demand patterns, not copied topics: none in this branch
- question-tool language worth preserving in customer wording: none; keep existing destination language natural and local
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: not part of this visual workflow branch

## Cluster In Scope

- canonical winner URL(s): `/guides/siesta-key-area-guide/`, `/guides/bradenton-vs-sarasota/`
- feeder pages: the touched area guides and comparison guides already changed on this branch
- aliases or retired URLs: none
- money destination: `/properties/`
- active lane: comparison guides and destination guides

## Source And Proof Constraints

- property truth needed: none beyond existing destination/property references already in guide source
- owner proof asset needed: none
- claims that are off-limits: new awards, new pricing claims, new owner-economics claims, and unstated performance promises
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: responsive UX polish, SVG icon consistency, and correctly matched destination imagery

## Page Builder Tasks

- source files likely to change: guide templates, shared guide partials, guide-adjacent assets, and one branch brief
- redirect or schema work: none required for this lane
- internal-link or CTA work: keep `Home` and `Guides` breadcrumb links present across changed guide pages; preserve existing `Book Direct` and property CTAs
- money CTA and downstream tracking event to verify: `/properties/` and existing book-direct/property browse pathways

## Voice Editor Checklist

- tone risks: do not let visual cleanup turn into generic lifestyle fluff or inflated destination language
- generic or mechanical patterns to kill: emoji UI, mismatched imagery, and cluttered mobile presentation
- proof or specificity checks: keep existing destination facts intact and avoid adding new unsupported specifics
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: preserve the live guide voice unless a fix requires a tiny label-level adjustment

## Release Gate Checklist

- routes to smoke test: `/guides/bradenton-vs-sarasota/`, `/guides/siesta-key-area-guide/`, `/guides/anna-maria-island-area-guide/`, `/guides/sarasota-area-guide/`
- commands to run: `npm test`, `npm run build`, `npm run verify:release`, `npm run git:preflight`, `npm run git:merge-check`
- regression risks to watch: mobile sticky CTA overlap, forced horizontal overflow, breadcrumb regressions, and desktop hero crop regressions

## Done When

- the rebased branch passes the content gate, build, release verification, and merge check
- public guide changes stay within the approved visual/design/media scope
- the branch is pushable and ready for PR review without reopening mobile overflow or sticky CTA issues

## Post-Reread Outcome

- reread window used: branch-level review after rebase onto `origin/main`
- crawl freshness result: not part of this branch
- actual impressions, CTR, position, and downstream event counts: not measured in this branch
- decision taken: hold for PR review after verification
- next branch slug or explicit wait state: wait for PR review and merge

## Not In Scope

- net-new guide clusters or destination pages
- owner-economics media production or property reel production
- copied competitor structure without Seascape-specific proof or local judgment
