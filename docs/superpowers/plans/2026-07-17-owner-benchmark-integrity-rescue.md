# Owner Benchmark Integrity Rescue Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove expired owner-performance claims and internal workflow language from every public surface that reuses them, then rebuild the owner research route as a sourced fee-comparison guide.

**Architecture:** Keep the existing indexed URL and CTA attribution so search and measurement continuity do not change. Retire the stale Seascape performance proof at its data source, replace it with current published Airbnb and Stripe pricing plus explicit non-comparability, and enforce the boundary against rendered HTML so source-only lint cannot miss another reader-facing leak.

**Tech Stack:** Node.js `node:test`, Eleventy/Nunjucks, JSON.

---

## Task 1: Add failing truth and reader-copy contracts

- [x] Add `scripts/enforcement/owner-proof-integrity.test.js`.
- [x] Assert the shared owner asset has explicit period, basis, freshness, reuse, and anti-claim fields.
- [x] Assert retired proof has empty `stats` and `examples`.
- [x] Scan relevant source and rendered owner routes for expired metrics, private names, internal repository paths, and the audit's internal/spec vocabulary.
- [x] Assert the built research route has short, synchronized metadata, self-canonical, valid Article and BreadcrumbList JSON-LD, a visible author/source block, current external citations, and preserved CTA attribution.
- [x] Run the new test and record the expected failure before source edits:

```bash
npm run build
node --test scripts/enforcement/owner-proof-integrity.test.js
```

## Task 2: Correct the proof authority and active brief

- [x] Update `src/_data/ownerProofAssets.json` first: mark the old proof retired, empty performance arrays, and define the published-pricing basis and anti-claims.
- [x] Update `docs/briefs/2026-05-owner-fee-revenue-leak-benchmark.md` so it no longer instructs agents to restore expired metrics, private portfolio naming, savings claims, or internal workflow voice.
- [x] Add the dated July 17, 2026 SERP read, decision rule, and current proof boundary required by the content gate.

## Task 3: Rebuild the research page without redesigning it

- [x] Update `src/research/owner-fee-revenue-leak-benchmark-2026.njk`.
- [x] Keep the existing route, canonical, schema types, CTA destination, tracking attributes, and layout primitives.
- [x] Synchronize title, description, Open Graph, Twitter, and Article headline.
- [x] Replace the expired bar comparison and property examples with a three-row fee table:
  - Airbnb's current published PMS-connected host fee.
  - Stripe's current published standard domestic online-card price.
  - Property-specific Seascape management pricing controlled by the agreement.
- [x] Link Airbnb and Stripe primary sources and state plainly that platform commission, card processing, and full management are not all-in equivalents.
- [x] Add a visible byline/source/method block and mention the Anna Maria Island owner audience naturally.
- [x] Replace the agent-voice CTA note with reader-facing help.

## Task 4: Remove the same stale proof from dependent public surfaces

- [x] Update `src/property-management/index.njk` ticker, stat cards, and fee visual without changing layout.
- [x] Update affected entries in `src/_data/seoPages.json`.
- [x] Update machine-readable public feeds (`src/llms.txt`, `src/ai/service.json.njk`, and `src/ai-discovery.json.njk`) wherever expired metrics or old savings claims remain.
- [x] Update any research or guide source that still repeats the exact retired owner metrics.
- [x] Preserve unrelated guest-price figures such as nightly rates.
- [x] Update `scripts/recovery/assert-live-smoke.js` for changed visible copy on `/property-management/`.

## Task 5: Remove shared internal-language and privacy leaks

- [x] Rewrite the default and owner-page overrides in `src/_includes/partials/owner-evaluation-form.njk` and `src/property-management/property-management.njk`.
- [x] Remove private portfolio naming and internal `seascape-hub/` paths from rendered archive copy while retaining any non-rendered evidence identifiers needed by internal checks.
- [x] Invert existing tests that currently require the bad copy, private name, or internal path to ship.
- [x] Extend the owner copy eval to include owner research routes and add golden failure cases for agent voice and private/internal evidence.

## Task 6: Prove the rendered result

- [x] Run the focused test:

```bash
npm run build
node --test scripts/enforcement/owner-proof-integrity.test.js
```

- [x] Run content and owner gates:

```bash
npm run lint:content
node --test scripts/enforcement/owner-acquisition.test.js scripts/enforcement/metadata-integrity.test.js
```

- [x] Run release proof:

```bash
npm test
npm run verify:release
```

- [ ] Render desktop and mobile views of the research route and `/property-management/`; inspect headings, links, citations, table overflow, CTA copy, and metadata.
- [x] Run Claude Fable on the final diff as an independent truth/copy reviewer.
- [ ] Run the configured Codex autoreview gate and resolve all material findings.
- [ ] Stop before PR/merge until Sawyer has reviewed the visible copy and rendered proof, as required for public copy changes.
