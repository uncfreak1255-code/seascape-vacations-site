# Seascape Vacations Site — Agent Entry Point

This repo owns website execution for Seascape Vacations.

Read in this order:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/process/agent-safety-standard.md`
4. `docs/process/agent-evidence-routing.md` before choosing Browser, Chrome,
   Computer Use, DOM inspection, screenshots, Playwright, or web search
5. `docs/process/git-session-rules.md`
6. `docs/process/content-quality-gate.md` before content or SEO copy work
7. `docs/status/current-state.md`
8. `DESIGN.md` before UI, CSS, template, or layout work
9. `docs/process/design-review-workflow.md` for any visual or layout change
10. one task-relevant file from `docs/briefs/`, `docs/portfolio/`, `docs/style/`, or source

## This Repo Owns

- page source
- SEO and GEO implementation
- owner-page and guide-page CRO
- schema and metadata
- internal linking
- tracking hooks that live on the site
- deploy readiness

## This Repo Does Not Own

- company-wide strategy memory
- financial planning
- cross-project decision history
- analytics pipeline logic that belongs in `seascape-analytics`
- email-campaign delivery, sender credentials, schedules, or send receipts;
  policy lives in `seascape-hub/context/operating-canon.md#business-email` and
  execution lives in `seascape-ops`. Campaigns use Microsoft 365 / Outlook
  `info@seascape-vacations.com`; personal Gmail is prohibited.

## Business Bottleneck

- owner acquisition is still the main business bottleneck
- direct-book conversion on existing demand is the second bottleneck
- new page volume is not the default answer when owner CTR and current money-page yield are still weak
- Phase 4 and other entity-expansion work stays frozen until the measured gates in `docs/status/next-batch.md` are cleared

## Non-Negotiable Rules

- root `main` is sync-only
- non-trivial work happens on `codex/<task>` branches in `.worktrees/<task>`
- edit source, not `_site`
- never use `DEPLOY THIS FOLDER TO NETLIFY/` as the source of truth
- one serious SEO cluster at a time, with one brief driving it
- no public content PR without one active brief, the content gate read, and `npm run lint:content`
- review the diff before push, PR, or merge
- any PR changing visible copy on smoke-asserted routes (homepage, `/properties/`, `/property-management/`, `/stays/`) must update `scripts/recovery/assert-live-smoke.js` in the same PR, or the daily live-smoke workflow goes red on a healthy site
- live `/.netlify/functions/*` endpoint paths, metrics `receipts[]` field names, and `verify:*` npm script names have cross-repo consumers in seascape-ops, seascape-hub, and seascape-analytics; check the contract locks in `docs/plans/2026-06-12-v1-implementation-handoff.md` before renaming any of them
- claims about amenities must trace to property truth: no invented equipment, no fake waterfront spread, no padded sleeping-capacity claims
- owner proof claims must trace to approved proof assets or current source truth; do not reuse old sitewide review-count theater
- do not import seomachine code, publishing assumptions, or folder structure directly into this repo; use seomachine only as reference for context rules, brief shape, rewrite workflow, and prioritization concepts
- if a workflow doc conflicts with repo safety docs, the stricter repo rule wins

## Execution Defaults

- Think before coding: state assumptions explicitly, ask when the missing fact matters, push back when a simpler approach exists, and stop to clarify before editing when the path is unclear.
- Simplicity first: make the minimum change that solves the problem. Nothing speculative. No abstractions for single-use code.
- Surgical changes: touch only what you must, match existing style, and do not refactor adjacent code that is not broken unless the task requires it.
- Goal-driven execution: define success criteria early, then loop until the right proof gate verifies the work.

## Repo Truth

- homepage source: `src/index.njk`
- owner pages: `src/property-management/`
- guides: `src/guides/`
- stay landers: `src/stays/stays.njk` plus `src/_data/seoPages.json`
- generated output: `_site/`
- redirects source: `src/_redirects`
- voice source of truth: `docs/style/`
- batch briefs: `docs/briefs/`
- page-family routing map: `docs/portfolio/`
- property truth (amenity/capacity claims trace here): `src/_data/properties.js` and its fallback `src/_data/properties-fallback.json`
- owner proof assets (owner-proof claims trace here): `src/_data/ownerProofAssets.json`

## Workflow Layer

- process rules live in `docs/process/`
- `docs/process/agent-evidence-routing.md` is the default tool-choice router:
  Browser explains, Chrome diagnoses, DOM confirms structure, Playwright
  proves, web search updates current external truth, and Computer Use handles
  edge cases.
- the site learning contract lives in `docs/process/learning-contract.md`; it defines what inputs the site may learn from, what approvals are required, and what receipt proves public claims or workflow promotion
- current execution context lives in `docs/status/`
- `docs/status/next-batch.md` is the canonical reread handoff surface for volatile measurement truth; after every reread it must say exactly one of `blocked by freshness`, `fresh but below threshold`, or `open next batch`, plus one concrete next move
- `docs/status/current-state.md` should keep durable repo truth only and must not duplicate volatile reread windows or `data_date` details that belong in `docs/status/next-batch.md`
- the five SEO OS role cards live in `.claude/agents/`; the on-demand role model and local skill/external-pack policy load from `docs/process/five-roles.md` and `docs/process/skill-policy.md`
- active repo-local skills are limited to `.agents/skills/accessibility`, `.agents/skills/content-quality-rubric`, `.agents/skills/design-review`, `.agents/skills/internal-link-targeting`, `.agents/skills/next-batch-gate`, `.agents/skills/owner-outbound-batch`, `.agents/skills/owner-reply-intake`, `.agents/skills/owner-proof-integrity`, `.agents/skills/page-cro`, `.agents/skills/property-truth-regeneration`, `.agents/skills/schema-markup`, `.agents/skills/seascape-design-critic`, `.agents/skills/seascape-design-specialist`, `.agents/skills/serp-ctr-title-rewrite`, `.agents/skills/site-architecture`, and `.agents/skills/web-design-guidelines`
- `.claude/skills/` should mirror only those active site/design skills; copied marketing, deploy, monthly reset, and generic SEO skills are not live authority
- global marketing skills in `/Users/sawbeck/.codex/skills/` may be used as advisory helpers for CRO, SEO, copy, psychology, analytics, and growth decisions, but they do not override this repo's source files, briefs, status docs, or five-role workflow
- canonical lane for internal-link family/page inbound planning is `.agents/skills/internal-link-targeting`
- canonical lane for live SERP CTR title-rewrite recommendation packs is `.agents/skills/serp-ctr-title-rewrite`; ship title/meta edits only when `docs/status/next-batch.md` is not `blocked by freshness`
- AI discovery, GEO/AEO, and schema work should use the global `seascape-seo` skill for attack-lane framing plus the repo-local `.agents/skills/schema-markup` skill for implementation rules
- external SEO/GEO packs such as `geo-optimizer-skill`, `gtm-engineer-skills`, `searchstack-aeo`, `claude-seo`, `akii-seo-ai-search-optimizer`, and `aeo.js` are donor references only; do not install or mirror them here without a fresh `agent-surface-audit`, repeated repo-specific need, and a smoke-tested win
- AI citation monitoring and Search Console/GA4 proof systems belong in `seascape-analytics`; this repo may expose site endpoints and markup, but it must not become the measurement control plane
- if work writes durable state into another repo, route it through a clean
  keeper branch or PR from that repo's current `origin/main`

## Content Gate

For any PR that changes public copy in `src/`:

- read the active brief plus `docs/process/content-quality-gate.md`
- read `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md`
- run the visible-copy lane in order: `copywriting` for the draft, `enterprise-ui-writing` to strip internal/process wording, then `humanizer` for the final pass on reader copy
- keep reader copy, proof copy, and agent copy separate
- run `npm run lint:content` before push, PR, or merge

## Design Review Workflow

- For Seascape mockups, marketing page concepts, homepage/lander direction
  work, guide/article/blog-style pages, owner pages, research pages, or any
  meaningful website visual change, the default design-thinking lane is the
  repo-local `seascape-design-specialist` skill before implementation.
- `seascape-design-specialist` must run `seascape-design-critic` as the taste
  gate before a concept is treated as good enough.
- Codex should prepare the design packet first: repo/source truth, page goal,
  audience, `DESIGN.md` constraints, existing patterns, proof/copy boundaries,
  URLs or screenshots, implementation risks, and responsive requirements.
- The specialist may optionally use donor lenses such as global
  `claude-design`, `product-design:ideate`, `product-design:audit`,
  `creative-production:moodboard-explorer`,
  `creative-production:scene-explorer`, and
  `creative-production:shot-explorer` when they materially raise the bar.
  Those donors do not override repo truth.
- If Sawyer approves a design direction or mockup, implement that approved
  direction closely. Do not reinterpret it into a different layout, art
  direction, hierarchy, CTA treatment, or component style. Any deviation must
  be named and justified by repo truth, `DESIGN.md`, accessibility,
  performance, responsive behavior, or source constraints.
- Codex still owns repo truth, `DESIGN.md`, implementation, and verification.
- `DESIGN.md` is the visual law. Figma, Claude Design, Stitch, and other
  outside tools are donor surfaces only unless Sawyer explicitly says
  otherwise.
- For any meaningful visual change, including layout, spacing, typography, color, imagery, iconography, CTA treatment, or motion, run the repo flow in `docs/process/design-review-workflow.md`.
- The required rendered QA loop for visual changes is the global `design-review` skill. Use it after implementation and before human review so the review surface is screenshots plus live route checks, not code alone.
- Start a fresh repo-local design worktree with `npm run design:lane -- "<task>"`
  or `./scripts/design/codex-seascape-design "<task>"` when you want the
  specialist/critic lane in one command.
- If an outside design tool introduces a new pattern or style direction, propose it as a `DESIGN.md` change first, then implement after that design law is explicit.

## Design System

Before UI work, read `DESIGN.md`; treat it as the visual source of truth.
Do not invent colors, fonts, spacing, border radius, shadows, or component styles unless Sawyer explicitly asks for a design-system change.
If `seascape-design-specialist`, Claude Design, Stitch, designmd.directory, or another design tool produces a new direction, propose it as a `DESIGN.md` change first when it changes the visual law.

## Writeback Boundary

If the work changes Seascape’s business understanding, write back to:

- `/Users/sawbeck/Projects/seascape-hub`

Do not dump full implementation logs there.
Do not mutate whatever local sibling checkout happens to exist on disk; land
durable writebacks through a clean keeper branch or PR in the target repo.

## Closeout Rule

Agents may not hand site work back as local dirt. A task is not complete
because a checkout is dirty, a worktree is left on detached `HEAD`, or cleanup
is left for Sawyer. The worker owns verification, keeper branch or PR, and
branch/worktree cleanup unless a named blocker stops the lane.
