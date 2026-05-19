# Route And Domain Truth Architecture Roadmap

## Goal

Turn the five architecture candidates into one ordered program that improves testability, route correctness, and AI-navigability without creating a new control plane or broad refactor.

## Source Rules

- `seascape-vacations-site` owns the implementation.
- Source edits must stay in worktrees on `codex/<task>` branches.
- `_site/` and `DEPLOY THIS FOLDER TO NETLIFY/` are not source truth.
- Existing repo docs, portfolio files, `seoPages.json`, property fallback data, Netlify functions, and enforcement tests remain the authority surfaces.
- This roadmap does not authorize public copy changes, visual redesign, deploy changes, or cross-repo writeback by itself.

## Program Shape

Run this as two phases. Each Module gets its own branch and worktree. Do not run the implementation branches in parallel unless the earlier dependency has landed on `main` or the dependent branch is explicitly rebased onto it.

### Phase 1: Route Truth

Phase 1 creates the shared route-test surface first, then teaches page-family inventory to consume that surface.

#### Phase 1A: Rendered Route Contract Module

Branch:

```bash
/Users/sawbeck/bin/agent-start rendered-route-contract
```

Purpose:

Deepen a rendered route contract Module that can load source or built HTML and report the route facts that current tests re-parse by hand.

Interface:

- read source HTML/Nunjucks text
- read built route HTML
- extract title, description, canonical, robots, JSON-LD objects, tracked events, template leak markers, and basic route path facts
- expose deterministic errors when expected route facts are missing or malformed

Likely files:

- create `scripts/enforcement/rendered-route-contract.js`
- test `scripts/enforcement/rendered-route-contract.test.js`
- update only narrow existing tests when they directly benefit from the new Interface

Verification gate:

```bash
node --test scripts/enforcement/rendered-route-contract.test.js
npm run build
npm run test
npm run git:merge-check
```

Done means:

- tests prove the Module extracts head tags, canonical URL, robots state, JSON-LD objects, tracked events, and template leak markers from representative source and built HTML
- no page-family behaviour has been redesigned yet
- no `_site/` output is staged

#### Phase 1B: Page-Family Inventory Module

Branch:

```bash
/Users/sawbeck/bin/agent-start page-family-inventory-module
```

Dependency:

Phase 1A must be merged or this branch must be created from the Phase 1A branch.

Purpose:

Deepen page-family inventory so tests can ask one Module what a route is supposed to be instead of duplicating markdown-table, redirect, schema, sitemap, and tracking-event logic.

Interface:

- read portfolio rows from `docs/portfolio/`
- normalize winner URLs, aliases, feeder pages, money destinations, tracked events, schema expectations, sitemap state, and source family
- join route facts from the rendered route contract where built/source route checks are needed
- expose one canonical record per route family entry

Likely files:

- modify `scripts/enforcement/page-family-inventory.js`
- test `scripts/enforcement/page-family-inventory.test.js`
- update focused tests that currently repeat page-family parsing

Verification gate:

```bash
node --test scripts/enforcement/page-family-inventory.test.js scripts/enforcement/seo-structure.test.js scripts/enforcement/winner-guide-consolidation.test.js
npm run build
npm run test
npm run git:merge-check
```

Done means:

- portfolio rows, redirects, sitemap state, schema expectations, and tracking events resolve through one page-family Interface
- existing route ownership behaviour is unchanged
- new helper code reduces duplicated parsing without changing public content

### Phase 2: Domain Truth

Phase 2 strengthens business-domain truth after route truth is stable.

#### Phase 2A: Property Facts Module

Branch:

```bash
/Users/sawbeck/bin/agent-start property-facts-module
```

Dependency:

Phase 1A should be merged first so rendered property-page checks can reuse the route contract.

Purpose:

Deepen a single property facts Module behind the existing fallback authority. Keep Hostaway, fallback JSON, visual fixture, `llms.txt`, schema, and property templates as Adapters around one implementation of counts, amenities, booking URLs, and public claim labels.

Interface:

- load fallback property facts
- normalize bedrooms, bathrooms, guests, specs, booking URL, image/CDN facts, structured amenity labels, marketing amenity labels, and public claim labels
- render `llms.txt` property summaries and schema amenity labels from the same facts
- provide helper assertions for property templates without regex-heavy duplication in every test

Likely files:

- create `scripts/enforcement/property-facts.js`
- modify `src/_data/properties.js` only if the shared Module can be consumed without build/runtime risk
- modify `scripts/regenerate-property-surfaces.js`
- update `scripts/enforcement/property-truth-invariants.test.js` and `scripts/enforcement/properties-data.test.js`

Verification gate:

```bash
node --test scripts/enforcement/property-truth-invariants.test.js scripts/enforcement/properties-data.test.js scripts/enforcement/schema-truth.test.js
npm run property:truth:check
npm run build
npm run test
npm run git:merge-check
```

Done means:

- fallback data remains the editable authority
- Dockside-only waterfront/dock claims remain constrained
- generated property surfaces still match fallback data
- no property copy or claim boundary changes are made unless a separate active brief authorizes them

#### Phase 2B: Capture Metrics Ledger Module

Branch:

```bash
/Users/sawbeck/bin/agent-start capture-metrics-ledger
```

Dependency:

Can follow Phase 1 independently, but should not run in parallel with active Netlify function or measurement-surface changes.

Purpose:

Deepen a shared capture metrics ledger Module. Owner lead and guest email capture stay separate Adapters with their own receipt fields, while shared implementation handles auth, blob resolution, proof-label normalization, parse/read/write, dedupe, and summary shaping.

Interface:

- normalize proof labels
- read auth tokens from bearer header or query string
- parse stored metrics from string or object values
- read/write metrics through injected or Netlify blob stores
- dedupe receipts by submission id
- trim receipt history by configured maximum
- keep form-specific receipt fields outside the shared Module

Likely files:

- create `netlify/functions/_capture-metrics-ledger.js`
- modify `netlify/functions/_owner-lead-metrics.js`
- modify `netlify/functions/_guest-email-capture-metrics.js`
- update `scripts/enforcement/owner-lead-receipts.test.js` and `scripts/enforcement/guest-email-capture-receipts.test.js`

Verification gate:

```bash
node --test scripts/enforcement/owner-lead-receipts.test.js scripts/enforcement/guest-email-capture-receipts.test.js scripts/enforcement/direct-booking-event-smoke.test.js
npm run test
npm run git:merge-check
```

Done means:

- owner and guest capture both use the shared ledger implementation where behaviour is actually shared
- PII stripping remains form-specific and still tested
- endpoint status codes and response shapes do not change

#### Phase 2C: Legacy Guide Shell Module

Branch:

```bash
/Users/sawbeck/bin/agent-start legacy-guide-shell-<active-brief-slug>
```

Dependency:

This work starts only when there is an active guide brief that needs touched guide pages. It is not a standalone sitewide cleanup lane.

Purpose:

Deepen one legacy guide shell Module only inside an active guide batch. Move repeated guide chrome behind a narrow Nunjucks/CSS Interface while leaving body copy, active brief scope, and design law intact.

Interface:

- shared guide head/chrome primitives for the active guide family only
- shared related-stay block or sticky CTA only when the active pages already use equivalent behaviour
- no broad page-family redesign

Likely files:

- create or modify a focused partial under `src/_includes/partials/`
- modify only guide files named by the active brief
- modify CSS only through existing design-law patterns
- update route-specific visual tests if the changed routes are visual-review targets

Verification gate:

```bash
npm run lint:content
npm run build
npm run test
npm run test:visual
npm run git:merge-check
```

Done means:

- only active-brief guide pages changed
- desktop and mobile rendered QA passes for affected routes
- no public copy changed without the content gate

## Orchestration Rules

1. Create the branch from this roadmap, then land the roadmap before implementation branches.
2. Start Phase 1A first. Do not start Phase 1B until Phase 1A is merged or explicitly used as the base.
3. Keep each branch limited to one Module.
4. Use tests-first changes for every Module.
5. Commit each branch only through repo guardrails.
6. Do not stage generated output by default.
7. Each PR closeout must state changed files, verification commands, dirty state, and whether the branch is ready for review or blocked.
8. If a branch starts needing public copy changes, visual redesign, deploy changes, or cross-repo writes, stop and split that work into its owning workflow.

## Recommended Execution Prompts

Roadmap landing prompt:

```text
Land the route/domain truth architecture roadmap doc only. Use the guarded worktree flow, commit the spec, and do not implement Phase 1A yet.
```

Phase 1A prompt:

```text
Implement Phase 1A only: rendered route contract Module. Use a worktree, write tests first, keep the Interface small, and do not touch page-family inventory yet except where tests prove the new route contract works.
```

Phase 1B prompt:

```text
Implement Phase 1B only: page-family inventory Module. Base it on the landed rendered route contract Module, preserve route ownership behaviour, and use existing portfolio docs as authority.
```

Phase 2A prompt:

```text
Implement Phase 2A only: property facts Module. Keep src/_data/properties-fallback.json as the editable authority, preserve current public claims, and use property:truth:check as a hard gate.
```

Phase 2B prompt:

```text
Implement Phase 2B only: capture metrics ledger Module. Keep owner and guest receipt fields separate, share only ledger mechanics, and preserve endpoint response shapes.
```

Phase 2C prompt:

```text
Implement Phase 2C only for the named active guide brief. Do not start a standalone guide shell refactor. Keep body copy and design-law changes out unless the brief and content gate require them.
```

## Spec Self-Review

- No placeholders remain.
- The roadmap is a sequencing and gating spec, not an implementation plan.
- Phase 1 dependencies are explicit.
- Phase 2C is blocked behind an active guide brief.
- Verification commands are concrete.
- The spec does not authorize changes to public copy, visual direction, deployment, generated output, or another repo.
