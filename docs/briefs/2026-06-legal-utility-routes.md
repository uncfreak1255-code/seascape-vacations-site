# Brief: legal utility routes

## Content Gate Inputs

- persona: guest or owner who wants straightforward Seascape policy answers before booking, sharing contact details, or reviewing a checkout page
- primary keyword: Seascape Vacations privacy policy
- secondary keywords: Seascape Vacations terms of service, Seascape cookie policy, Seascape booking policy
- audience pattern: footer visitors who need a real route they can reread, share, or reference instead of a transient modal
- proof source: currently shipped homepage legal-modal copy in `src/assets/js/homepage.js`, existing footer links in `src/index.njk`, and the repo design rules in `DESIGN.md`
- required internal links: /privacy/, /terms/, /cookies/
- CTA target: /about-us/
- anti-claims: no legal advice, no new retention or compliance claims, no property-specific cancellation promises beyond the secure checkout page, and no invented policy substance beyond the live modal copy

## Why This Batch

- The site still handles legal and booking-policy questions through homepage modals, which is weak for trust, sharing, and operator clarity.
- This batch turns the current shipped policy substance into real utility routes without widening into a legal rewrite.
- Anything beyond the already shipped modal substance should wait for explicit legal-copy approval rather than being improvised in source.

## Search Operator Read

- source reads used: `AGENTS.md`, `CLAUDE.md`, `docs/process/agent-safety-standard.md`, `docs/process/content-quality-gate.md`, `docs/process/design-review-workflow.md`, `DESIGN.md`
- URLs inspected: `/`, `/about-us/`, `/property-management/`, `/properties/`
- main evidence: the homepage footer is the only live legal surface, and it currently depends on modal-only policy copy with no standalone routes
- competitor pages inspected for demand patterns, not copied topics: none; this lane is trust and utility cleanup, not SERP expansion
- question-tool language worth preserving in customer wording: none
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: not a freshness-driven SEO lane; this is a route utility and trust cleanup

## Cluster In Scope

- canonical winner URL(s): `/privacy/`, `/terms/`, `/cookies/`
- feeder pages: homepage footer and base-layout footer surfaces that should expose the new routes
- aliases or retired URLs: `/terms-and-conditions/`, plus obvious policy aliases that should resolve directly to the new routes
- money destination: none; this is a trust and support utility lane
- active lane: legal utility routes

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: none
- claims that are off-limits: data-retention promises, jurisdiction-specific legal language, expanded cancellation promises, or compliance statements not already shipped
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: direct phone and email contact, the current check-in/check-out standard, and the checkout-page reminder for booking-specific cancellation details

## Page Builder Tasks

- source files likely to change: `src/index.njk`, `src/assets/js/homepage.js`, `src/css/homepage.css`, `src/css/base.css`, `src/_includes/layouts/base.njk`, `src/_redirects`, the three new policy routes, and this brief
- redirect or schema work: add direct redirects for legacy policy aliases and include breadcrumb/page schema on the new routes
- internal-link or CTA work: homepage and base footer should expose `/privacy/`, `/terms/`, and `/cookies/`; terms anchors should support `Booking Policy` and `Cancellation`; policy pages should cross-link to one another and point readers to `/about-us/`
- money CTA and downstream tracking event to verify: none; verify rendered navigation and route reachability instead

## Voice Editor Checklist

- tone risks: sounding like a legal memo, inventing compliance language, or turning short policy copy into verbose filler
- generic or mechanical patterns to kill: process-heavy intros, vague reassurance with no concrete support path, and synthetic FAQ-style filler
- proof or specificity checks: keep every substantive claim traceable to the currently shipped modal copy or existing contact details already present in source
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: keep these pages plain, calm, and direct

## Release Gate Checklist

- routes to smoke test: `/`, `/privacy/`, `/terms/`, `/cookies/`, `/property-management/`, `/properties/`
- commands to run: `npm run lint:content`, `npm run build`, `npm run verify:links`, `npm run verify:jsonld`, `npm run test:visual`, `npm run git:merge-check`
- regression risks to watch: broken footer links, dead redirect aliases, layout drift in base-layout footers, and legal pages that look like unstyled text dumps

## Done When

- the site has real `/privacy/`, `/terms/`, and `/cookies/` routes using Seascape-approved utility-page styling
- homepage legal buttons are replaced by direct links, and booking-policy footer links resolve to the correct anchors on `/terms/`
- the base-layout footer also exposes the new legal routes
- verification passes and the branch is ready for review as a draft PR if legal wording still needs final approval

## Post-Reread Outcome

- reread window used: branch-level route and footer verification only
- crawl freshness result: not part of this lane
- actual impressions, CTR, position, and downstream event counts: not measured in this lane
- decision taken: hold for PR review after verification
- next branch slug or explicit wait state: wait for PR review and merge

## Not In Scope

- a broader legal rewrite or jurisdiction-specific policy expansion
- sitewide footer normalization across every bespoke property template
- new FAQ systems, guest-account flows, or support-center architecture
- copied legal boilerplate from another site
