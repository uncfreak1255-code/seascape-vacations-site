# Brief: Home, Owner, and Guides Perf Feel Polish

## Content Gate Inputs

- persona: guests and owners already evaluating Seascape who need the main routes to feel fast, calm, and trustworthy
- primary keyword: Seascape Vacations
- secondary keywords: vacation rental management Florida, Anna Maria Island area guides, Seascape Vacations direct booking
- audience pattern: visitors arriving on the homepage, owner route, or guides hub who are deciding whether to keep exploring or contact Seascape
- proof source: `src/css/homepage.css`, `src/css/hero-v2.css`, `src/css/base.css`, `src/_includes/layouts/base.njk`, `src/guides/index.njk`, `src/property-management/index.njk`, rendered desktop/mobile screenshots, and `DESIGN.md`
- required internal links: /property-management/, /research/owner-fee-revenue-leak-benchmark-2026/
- CTA target: /property-management/
- anti-claims: do not rewrite page messaging, do not introduce a new layout direction, do not change CTA strategy, and do not widen this pass into a repo-wide font cleanup

## Why This Batch

- The affected routes already matched the intended visual direction, but several shared surfaces still spent motion budget on decorative loops and broad transition rules.
- Shared layout font loading also drifted from the repo's self-hosted font rule, creating avoidable weight and inconsistency across route families.
- This batch exists to tighten interaction feel and font delivery without changing the content strategy or visual hierarchy.

## Search Operator Read

- source reads used: `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `docs/process/design-review-workflow.md`, `docs/process/content-quality-gate.md`, and the touched route sources
- URLs inspected: `/`, `/property-management/`, and `/guides/`
- main evidence: visible route polish issues came from decorative infinite motion, `transition: all`, and shared font-loading drift rather than missing architecture
- competitor pages inspected for demand patterns, not copied topics: none
- question-tool language worth preserving in customer wording: none
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: not required for this source-level polish pass

## Cluster In Scope

- canonical winner URL(s): `/`, `/property-management/`, `/guides/`
- feeder pages: `/research/owner-fee-revenue-leak-benchmark-2026/`, `/property-management/maximize-vacation-rental-income-florida/`
- aliases or retired URLs: none
- money destination: `/property-management/`
- active lane: interaction-feel and shared font-delivery polish on core entry routes

## Source And Proof Constraints

- property truth needed: preserve current owner proof, benchmark routing, and market positioning
- owner proof asset needed: none
- claims that are off-limits: new revenue claims, new savings claims, and any broadened SEO or tracking story
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: none; this pass should improve feel, not expand claims

## Page Builder Tasks

- source files likely to change: `src/css/homepage.css`, `src/css/hero-v2.css`, `src/css/base.css`, `src/_includes/layouts/base.njk`, `src/guides/index.njk`, `src/property-management/index.njk`, `src/_includes/partials/email-popup.njk`
- redirect or schema work: none
- internal-link or CTA work: preserve existing route links and CTA targets
- money CTA and downstream tracking event to verify: preserve current homepage and owner-route CTA behavior

## Voice Editor Checklist

- tone risks: do not let performance notes leak into visible copy
- generic or mechanical patterns to kill: none in reader copy; this is a motion and delivery pass
- proof or specificity checks: keep all existing proof sections and owner/guide link patterns intact
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: no copy rewrite in scope

## Release Gate Checklist

- routes to smoke test: `/`, `/property-management/`, `/guides/`
- commands to run: `npm run lint:content`, `npm test`, `npm run build`, `npm run test:visual -- --grep "home|property-management"`
- regression risks to watch: font-swap layout drift, hero spacing changes, sticky CTA behavior, or reduced-motion regressions

## Done When

- touched shared surfaces no longer use `transition: all`
- decorative infinite motion is reduced or gated on the homepage and owner route
- shared layout font loading follows the repo's self-hosted direction where this pass touches shared source
- homepage and owner route render cleanly on desktop and mobile without hierarchy drift

## Post-Reread Outcome

- reread window used: not applicable for this source-level polish pass
- crawl freshness result: not applicable
- actual impressions, CTR, position, and downstream event counts: not applicable
- decision taken: verify the narrow route polish and stop without widening scope
- next branch slug or explicit wait state: hold after verification unless Sawyer asks for broader route-family cleanup

## Not In Scope

- copy rewrites
- CTA rewrites
- tracking changes
- guide-family one-off cleanup
- service worker, offline, or broader architecture work
