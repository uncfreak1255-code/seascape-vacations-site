# Brief: Homepage Brand Signal Consistency

## Content Gate Inputs

- persona: branded-search visitors and direct-booking guests verifying that Seascape is a real local operator
- primary keyword: Seascape Vacations
- secondary keywords: seascape vacations, bradenton vacation rentals near Anna Maria Island, sarasota vacation rentals
- audience pattern: guests searching the brand or validating whether Seascape is the local operator behind the homes and guides
- proof source: homepage source, live site schema surfaces, `src/_data/site.json`, and `src/llms.txt`
- required internal links: /properties/, /guides/
- CTA target: /properties/
- anti-claims: do not imply on-island inventory, do not rename the business, do not add AI-search gimmick markup, and do not widen the homepage rewrite beyond brand-signal consistency

## Why This Batch

- The homepage title shortened the brand to `Seascape` while schema and other machine-readable surfaces used `Seascape Vacations`.
- The top-of-page visible copy did not restate the full brand in plain text near the hero.
- This batch exists to tighten one canonical homepage brand string without opening a broader homepage rewrite.

## Search Operator Read

- source reads used: `src/index.njk`, `src/_data/site.json`, `src/llms.txt`, Google Search Central site-name documentation, and John Mueller's public guidance on generic site names
- URLs inspected: `/`, `/about-us/`, and public search results mentioning Seascape Vacations
- main evidence: the homepage used mixed shorthand while the rest of the repo already reinforced `Seascape Vacations`
- competitor pages inspected for demand patterns, not copied topics: none
- question-tool language worth preserving in customer wording: none
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: not required for the source patch itself; post-change branded query reread should check `Seascape Vacations`, `seascape vacations`, and `seascape-vacations.com`

## Cluster In Scope

- canonical winner URL(s): `/`
- feeder pages: `/about-us/`, `/guides/`, `/properties/`
- aliases or retired URLs: none
- money destination: `/properties/`
- active lane: homepage entity and brand-signal cleanup

## Source And Proof Constraints

- property truth needed: maintain the existing Bradenton/Sarasota near-AMI positioning
- owner proof asset needed: none
- claims that are off-limits: on-island inventory claims, new savings percentages, or broad AI-readiness claims
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: the full brand name, the operating corridor, and existing direct-book/local-team framing

## Page Builder Tasks

- source files likely to change: `src/index.njk`
- redirect or schema work: add only a homepage `WebSite.alternateName` backup tied to the domain
- entity-truth follow-up (2026-07-17): bind the homepage `LocalBusiness` and `VacationRental` descriptions to `site.description`; keep `LocalBusiness.areaServed` to the actual Bradenton and Sarasota inventory cities
- internal-link or CTA work: preserve existing `/properties/` and `/guides/` routing
- money CTA and downstream tracking event to verify: preserve the existing direct-book CTA behavior

## Voice Editor Checklist

- tone risks: do not turn this into a branding manifesto
- generic or mechanical patterns to kill: shorthand `Seascape` naming that weakens homepage entity clarity
- proof or specificity checks: keep Bradenton/Sarasota near-AMI phrasing truthful
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: use the visible full brand string without awkward AI/SEO language

## Release Gate Checklist

- routes to smoke test: `/`
- commands to run: `npm run lint:content`, `node --test scripts/enforcement/ai-discovery-schema.test.js`, `node --test scripts/enforcement/metadata-integrity.test.js`, `npm run build:prod`, `npm run verify:jsonld`
- regression risks to watch: hero eyebrow wrapping badly on mobile, title drift, or schema parse errors

## Done When

- the homepage title uses `Seascape Vacations`
- the hero includes one visible plain-text `Seascape Vacations` mention near the top
- the homepage `WebSite` schema includes the domain as a backup `alternateName`
- the homepage entity descriptions use the canonical Bradenton/Sarasota near-beach positioning, and no nearby beach market is represented as a Seascape inventory city
- no other homepage structure or CTA behavior changes

## Post-Reread Outcome

- reread window used: pending after deploy or preview verification
- crawl freshness result: pending
- actual impressions, CTR, position, and downstream event counts: pending
- decision taken: pending
- next branch slug or explicit wait state: hold after source patch until branded query reread

## Not In Scope

- homepage visual redesign
- brand renaming
- new AI-specific files or schema
- broader copy rewrites outside the homepage brand signal
