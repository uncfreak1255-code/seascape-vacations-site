# Skill Policy

How the repo-local skill layer is governed. Referenced from `CLAUDE.md`. The
active skill set is not re-listed here on purpose — it lives in `.claude/skills/`
and is self-describing; a hand-maintained list only drifts.

## Local skills

The active local skill layer is intentionally lean and site-specific. Use the
skills in `.claude/skills/` as helpers under the five-role workflow, not as
another operating system. Stale deploy, monthly-reset, broad marketing, and
generic SEO skills stay out of active discovery unless a new `agent-surface-audit`
proves they should return.

For AI discovery, GEO/AEO, and schema work, pair the global `seascape-seo` skill
with the repo-local `schema-markup` skill. `seascape-seo` owns the proof-lane
versus attack-lane framing; `schema-markup` owns JSON-LD and structured-data
implementation rules inside this site repo.

## External packs — donor references only

Do not install or mirror `geo-optimizer-skill`, `gtm-engineer-skills`,
`searchstack-aeo`, `claude-seo`, `akii-seo-ai-search-optimizer`, or `aeo.js` into
this repo unless a fresh `agent-surface-audit` shows a repeated site-specific need
and the tool has a smoke-tested win. AI citation monitoring and GSC/GA4 proof
systems belong in `seascape-analytics`, not in this website repo.

## Global marketing skills — advisory lenses

Global marketing skills in `~/.codex/skills/` are allowed as advisory lenses when
the task calls for them, especially `customer-research`, `marketing-psychology`,
`content-strategy`, `copywriting`, `enterprise-ui-writing`, `copy-editing`,
`humanizer`, `seo-audit`, `ai-seo`, `analytics-tracking`, `ab-test-setup`, and
`pricing-strategy`. They help structure thinking; they do not create new local
authority, bypass the five roles, or replace Seascape Hub as the source of
business context.

## Agent-surface-audit receipts

A durable record of approved changes to the local skill/agent surface. Each
entry is the receipt the governance rule requires for any skill change.

- **2026-06-13 — added `content-quality-rubric` (advisory).** Trigger: the
  2026-06-13 AI-SEO stack audit (`docs/research/2026-06-13-ai-seo-stack-audit.md`)
  found a repeated, site-specific gap — the content gate blocks slop but scores
  nothing positive, so derivative, citation-invisible drafts pass
  `npm run lint:content` clean. Decision: add exactly one advisory local skill
  (not a pack), no CI enforcement until findings repeat. Approved by Sawyer.
  Deferred in the same audit: pinning/vendoring `enterprise-ui-writing` and
  `humanizer` — the global skill sources are not present in this repo or
  environment, so there is nothing to vendor or pin here yet; revisit when their
  source is available.
