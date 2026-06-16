# Skill Policy

How the repo-local skill layer is governed. Referenced from `CLAUDE.md`. The
active skill set is not exhaustively re-listed here on purpose — it lives in
`.agents/skills/` and is self-describing; a hand-maintained list only drifts.
`.claude/skills/` is a compatibility layer, not the source of truth.

## Local skills

The active local skill layer is intentionally lean and site-specific. Use the
skills in `.agents/skills/` as helpers under the five-role workflow, not as
another operating system. Stale deploy, monthly-reset, broad marketing, and
generic SEO skills stay out of active discovery unless a new `agent-surface-audit`
proves they should return.

For AI discovery, GEO/AEO, and schema work, pair the global `seascape-seo` skill
with the repo-local `schema-markup` skill. `seascape-seo` owns the proof-lane
versus attack-lane framing; `schema-markup` owns JSON-LD and structured-data
implementation rules inside this site repo.

For owner outbound, use `owner-outbound-batch` to prepare founder-reviewed drafts
and `owner-reply-intake` to classify replies before any demand row reaches the
Hub register. These skills are local because the workflow is site-specific:
drafts point at the site benchmark and approved owner proof assets, while the
intake guard prevents site activity, test sends, labeled sends, and internal
helper submits from being counted as real owner demand.

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
  Not pursued in the same audit: pinning/vendoring `enterprise-ui-writing` and
  `humanizer`. Correction to the original framing — these are **real global
  advisory skills** in the Codex environment (`~/.codex/skills/enterprise-ui-writing/`
  and `~/.codex/skills/humanizer/`, alongside `copywriting`), not missing skills.
  They read as absent only from a fresh CI/remote checkout, which has no
  `~/.codex/skills/`; that is not the founder's working environment. They are
  intentionally global-advisory rather than repo-local under `.agents/skills/`,
  consistent with the advisory-lens policy above, so vendoring them into the repo
  would convert advisory lenses into local authority against that policy — not a
  fix. The residual gap the audit named is real but soft: enforcement checks only
  that the three skill names appear in voice-chain order in the docs (the regex in
  `scripts/enforcement/content-voice.test.js`), never that an agent actually loaded
  and ran the global skills during visible-copy work. If that gap is ever worth
  closing, the move is a lightweight process check (the agent records that it
  loaded the voice-chain skills on a reader-copy change), not vendoring.
- **2026-06-13 — added `owner-outbound-batch` and `owner-reply-intake`.**
  Trigger: Card 4 of `docs/plans/2026-06-13-demand-os-handoff.md` identified a
  repeated owner-demand deadlock: the owner search cluster is below the on-page
  gate, but a sent outbound touch is not demand. Agent-surface audit verdict:
  create the smallest local package under the existing `.agents/skills/`
  convention; do not add external SEO/AEO packs, MCPs, dashboards, scrapers, or
  automations. `owner-outbound-batch` is draft-only and never sends.
  `owner-reply-intake` is refusal-first: TEST/labeled/internal/helper/synthetic
  signals are refused, `SENT` alone is refused, email-origin demand is
  provisional until repo-anchored evidence exists, and only the hand-authored
  `## Register` region in the Seascape Hub owner-demand register may receive a
  real row.
