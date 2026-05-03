# Cite-Worthy Research Assets Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Seascape's two existing research pages into more cite-worthy SEO assets without starting a new content format branch.

**Architecture:** Keep the pages as standalone Eleventy/Nunjucks documents and add source-owned citation modules, methodology clarity, quotable stat blocks, and internal-link paths. Do not create PDFs, calculators, or a new research center in this patch; document those as follow-on briefs because they require data/product decisions.

**Tech Stack:** Eleventy/Nunjucks, static HTML/CSS, existing Node verification scripts, existing guardrail workflow.

---

## CEO / Office-Hours Filter

Mode: HOLD SCOPE.

The tweet's strongest lesson is not "write longer articles." The site already has benchmark/report content. The leverage is making the existing research pages easier for journalists, bloggers, owners, and guests to cite.

Accepted scope:
- `src/research/gulf-coast-vacation-booking-trends-2026.njk`
- `src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk`
- one follow-on brief for the larger asset roadmap

Deferred:
- PDF/slides export
- interactive calculator
- owner fee benchmark report
- regulation/compliance tracker
- outreach list and distribution workflow

Primary failure modes:
- Unsupported or inconsistent proof numbers create trust debt.
- Citation modules become decorative but do not provide a reusable quote or source instruction.
- Guest research pages forget money-page handoff.

## File Map

- Modify: `src/research/gulf-coast-vacation-booking-trends-2026.njk`
  - Add cite/share CSS.
  - Add a "Cite This Report" module after methodology.
  - Add quotable findings and source note.
  - Add practical internal links to direct-book and owner money pages.
- Modify: `src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk`
  - Correct the 1,492-vs-545 wording in meta copy.
  - Add cite/share CSS.
  - Add a "Cite This Cost Index" module after methodology.
  - Add visual summary blocks and internal links.
- Create: `docs/briefs/2026-05-cite-worthy-seo-assets.md`
  - Preserve the next asset roadmap: owner fee benchmark, cost calculator, compliance tracker, visual/PDF packaging, and distribution notes.

## Task 1: Booking Benchmark Page

- [x] Add citation CSS for `.citation-panel`, `.quote-grid`, `.quote-card`, `.asset-links`, and `.source-note`.
- [x] Insert a citation module after the existing methodology block.
- [x] Include canonical URL, suggested citation, share snippets, quotable stats, and contact path.
- [x] Add internal links to `/stays/anna-maria-island-vacation-rentals/`, `/stays/bradenton-vacation-rentals-near-beaches/`, and `/property-management/`.

## Task 2: Florida Cost Index Page

- [x] Correct social/meta wording from "1,492 real bookings" to "545 confirmed bookings plus local pricing research."
- [x] Add the same citation CSS pattern.
- [x] Insert a cost-index citation module after methodology.
- [x] Include reusable family-budget numbers, canonical URL, share snippets, and links to the booking benchmark and stay money pages.

## Task 3: Follow-On Brief

- [x] Create `docs/briefs/2026-05-cite-worthy-seo-assets.md`.
- [x] Document the next five assets and what proof/source each requires before implementation.
- [x] Make clear that these are planned assets, not shipped claims.

## Task 4: Verification

- [x] Run `git diff --check`.
- [x] Run `npm run build`.
- [x] Run `npm run verify:jsonld`.
- [x] Run `npm run verify:links`.
- [x] Run `npm run git:preflight`.
- [x] Commit with guardrails after source review.
