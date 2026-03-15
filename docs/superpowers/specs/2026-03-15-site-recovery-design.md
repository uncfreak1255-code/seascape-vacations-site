# Seascape Vacations Site Recovery Design

## Purpose

Recover the site from a broken multi-source deployment workflow without changing the established brand/design direction. The recovery must stop production regressions, restore a single authoritative source, and create a clean base for SEO, performance, accessibility, and image optimization work.

This design is based on observable repo and production issues documented in [docs/reports/2026-03-15-full-site-ui-ux-seo-audit.md](/Users/sawbeck/Projects/seascape-vacations-site/docs/reports/2026-03-15-full-site-ui-ux-seo-audit.md).

## Current Failure Pattern

The site is not failing because of one bad meta tag or one slow image. It is failing because production authority is split across multiple paths:

- editable Eleventy source in `src/`
- a giant root `index.html` with pseudo-routing behavior
- generated output in `_site/`
- a second deployable export in `DEPLOY THIS FOLDER TO NETLIFY/`
- production HTML that does not cleanly match any one source path

That drift has already produced these confirmed failures:

- broken inline JavaScript and dead asset references on the live homepage
- redirect loop on `/property-management/`
- slow mobile LCP on key money pages due largely to weak image delivery
- malformed or inconsistent structured data / metadata on live pages
- invalid `robots.txt` directive that Lighthouse flags
- fragile breadcrumb and link behavior on guide pages

## Priority Page Set And Audit Baselines

The recovery plan must prioritize the exact page types already measured in the audit so progress is tied to a real baseline:

- homepage: `https://seascape-vacations.com/`
- stay money page: `https://seascape-vacations.com/stays/anna-maria-island-vacation-rentals/`
- property-management money page: `https://seascape-vacations.com/property-management/vacation-rental-management-sarasota/`
- guide page: `https://seascape-vacations.com/guides/anna-maria-island-area-guide/`

Observed baseline issues from the 2026-03-15 audit:

- homepage: broken inline JS, broken asset reference, misleadingly strong shell Lighthouse score despite runtime errors
- stay page: mobile LCP 6.9s, weak responsive image delivery
- property-management page: mobile LCP 5.6s, route family already affected by redirect fragility
- guide page: mobile LCP 4.4s, canonical/OG/schema inconsistency, invalid robots directive impact, breadcrumb/link defects

## Recovery Goals

1. Restore one source of truth for build and deploy.
2. Fix the live P0 failures that actively damage UX, crawlability, or trust.
3. Improve SEO/performance/accessibility from the clean source path, not from generated files.
4. Preserve the current visual identity, allowing only safe polish during phase 1.
5. Add operational guardrails so future agents do not reintroduce the same failure mode.

## Phase-1 Constraints

- Visual mode: `Freeze + safe polish`
- Preserve typography, color direction, general layout character, imagery style, and conversion structure unless a bug forces a change.
- Safe polish is allowed only where technical cleanup exposes obvious UX, accessibility, or responsiveness defects.
- No speculative redesign work is in scope.
- Direct edits to generated output must stop after consolidation.

## Chosen Approach

Use a hybrid recovery order:

1. Contain the live P0 failures that are already causing damage.
2. Consolidate source/build/deploy authority into one path.
3. Execute technical SEO/performance/image/schema remediation from the consolidated source.
4. Apply limited UX polish only where supported by the technical fixes.

This is intentionally not "SEO first." Pure symptom treatment would recreate the same problem on the next deploy.

## Target Architecture

### Source Layer

The Eleventy app under `src/` becomes the only editable content/template authority for the public site, alongside its config/data files.

Authoritative inputs are expected to include:

- `src/`
- site/config/data files used by Eleventy
- versioned deployment configuration such as `netlify.toml`

The following paths are non-authoritative:

- `_site/` as disposable build output only
- `DEPLOY THIS FOLDER TO NETLIFY/` as legacy output to be deprecated or removed from the deployment workflow
- root `index.html` unless its remaining live behavior is migrated into the Eleventy source or explicitly retired

### Build Layer

There must be one documented build command that produces the publishable site from the chosen source. Generated output is never hand-edited.

### Deploy Layer

Netlify must publish a single directory produced by the build layer. No alternate manual export path should remain deploy-authoritative after consolidation.

### Governance Layer

Repository memory/instruction files must reflect the recovered architecture so future sessions do not follow stale deployment guidance.

## Recovery Units

Each unit below has one clear purpose and a clean boundary so the later implementation plan can assign work without overlap.

### Unit 1: P0 Containment

Purpose:
Ship the smallest safe fixes for issues already breaking production trust or crawl behavior.

In scope:

- homepage runtime failures caused by broken inline JavaScript
- critical broken asset references on live pages
- `/property-management/` redirect loop
- malformed schema/metadata defects severe enough to fail parsing or point to wrong canonical identities

Out of scope:

- broad content rewrites
- sitewide SEO polish
- image system redesign beyond what is necessary for the emergency fixes

Success criteria:

- homepage loads without the confirmed syntax errors seen in browser console
- `/property-management/` resolves without redirect looping
- critical broken asset references on the homepage are removed or corrected
- affected schemas on repaired pages parse cleanly

### Unit 2: Source-Of-Truth Consolidation

Purpose:
Eliminate deploy ambiguity so future changes have one path from source to production.

In scope:

- identify the true production source path
- migrate any still-live behavior that exists only in legacy files into the authoritative Eleventy source, or explicitly retire it
- align Netlify build/publish settings to the authoritative source
- mark legacy generated/export paths as non-authoritative
- remove workflow dependence on manual deploy folders

Interfaces:

- input: existing repo structure and current Netlify config
- output: one documented source path, one build command, one publish directory

Success criteria:

- a clean local build from the chosen source reproduces intended pages
- production deploys no longer require hand-editing generated files
- repo docs clearly state what is editable vs generated

### Unit 3: Technical Remediation

Purpose:
Fix the scalable SEO/performance/accessibility defects from the consolidated source path.

In scope:

- image delivery improvements on money pages
- responsive image output, explicit dimensions, format/size cleanup where possible
- robots, sitemap, canonical, metadata, and breadcrumb consistency
- JSON-LD generation cleanup and validation
- broken internal links and malformed hrefs
- accessibility fixes that affect mobile/desktop usability or audit quality

Out of scope:

- brand redesign
- net-new content strategy beyond repair work needed for the audited pages

Success criteria:

- the priority page set shows measurable improvement against the 2026-03-15 audit baseline
- invalid robots/schema patterns observed in the audit are corrected
- critical internal-link and breadcrumb defects are removed
- pages pass targeted spot checks for structured data, metadata, and accessibility basics

### Unit 4: Safe UX Polish

Purpose:
Tighten the user experience only where the technical cleanup reveals obvious friction.

In scope:

- small hierarchy, spacing, interaction, and responsive fixes
- accessibility-driven markup or labeling improvements
- visual corrections caused by replacing broken or non-semantic implementations

Out of scope:

- new visual system
- major layout experimentation
- broad CRO redesign

Success criteria:

- the site still looks and feels like the same brand
- fixes improve clarity or responsiveness without changing the site’s overall design language

### Unit 5: Governance And Documentation

Purpose:
Prevent future sessions from repeating the same architectural mistakes.

In scope:

- update `CLAUDE.md` to reflect the real source/build/deploy flow
- update `AGENTS.md` with concise architecture facts, known gotchas, and recovery learnings
- add a short repo-level source-of-truth/deploy note if not already present
- deprecate or clearly label legacy paths

Success criteria:

- future agents can identify the correct editable paths without guesswork
- the repo no longer instructs agents to deploy from legacy export directories

## Phase Order

### Phase 1: P0 Containment

Repair only live issues severe enough to block trust, render key pages unstable, or poison indexing/crawl behavior.

### Phase 2: Consolidation

Move production authority to the Eleventy source path and normalize build/deploy behavior.

### Phase 3: Technical Remediation

Repair image delivery, metadata/schema, crawl signals, broken links, and high-value performance defects from the clean architecture.

### Phase 4: Safe Polish

Apply limited UI/UX cleanup only where the earlier phases expose obvious issues.

## Verification Strategy

Every phase needs a hard verification gate before the next phase begins.

### Required Checks

- local build from the authoritative source
- targeted runtime check on homepage JavaScript behavior
- redirect verification for `/property-management/`
- targeted asset check for broken critical image/script references
- spot checks on the priority page set defined in this spec
- metadata/canonical/schema inspection on affected pages
- mobile/desktop audit sampling on the most important page types
- pre-deploy diff review of generated output to catch unexpected rewrites
- post-deploy smoke checks against production URLs

### Evidence Standard

No claim of "fixed" is acceptable without direct verification against either generated output or production behavior, depending on the phase gate.

## Rollback Strategy

- Keep containment, consolidation, and remediation in separate commit boundaries where possible.
- Do not mix large architectural cleanup with speculative visual tweaks.
- If consolidation destabilizes deploy behavior, it must be reversible without losing P0 containment fixes.
- Avoid direct patching of generated output because it destroys rollback clarity.

## Risks And Mitigations

### Risk: Unknown Live Dependence On Legacy Files

Mitigation:
Trace production output and Netlify behavior before deleting or retiring legacy paths. Prefer migration or explicit deprecation over assumption.

### Risk: Dirty Worktree Hides Causal Changes

Mitigation:
Scope changes tightly, review diffs by file class, and avoid sweeping rewrites while consolidation is underway.

### Risk: Image/markup fixes unintentionally change layout

Mitigation:
Use the agreed `Freeze + safe polish` constraint. Verify desktop and mobile visual behavior on the primary page types after each material markup change.

### Risk: SEO fixes shipped from the wrong source path regress on next deploy

Mitigation:
Do not perform broad remediation until the authoritative source/build/deploy path is established.

## Out Of Scope For This Recovery

- full visual redesign
- brand rewrite
- large content expansion program
- new programmatic SEO initiative
- ad/analytics/CRO experimentation unrelated to the audited failures

## Deliverables

- repaired production-critical failures
- consolidated build/deploy workflow
- corrected technical SEO/performance/image implementation on priority pages
- updated operational docs in `CLAUDE.md`, `AGENTS.md`, and supporting repo notes
- implementation plan that breaks this design into executable work with verification gates

## Approval State

Approved in chat on 2026-03-15 with these constraints:

- phase 1 uses `Freeze + safe polish`
- deploy freeze is acceptable during consolidation
- recommended recovery order is approved: `P0 containment -> source-of-truth consolidation -> technical remediation -> safe polish`
