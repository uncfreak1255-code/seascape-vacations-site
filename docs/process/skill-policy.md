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

For owner intake, use `owner-outbound-batch` to qualify owner-direct,
permissioned signals without creating outreach drafts, and use
`owner-reply-intake` to classify later replies before any demand row reaches the
Hub register. These skills are local because the workflow is site-specific:
the intake decision can reference the site benchmark and approved owner proof
assets only after contact permission is proven, while the reply guard prevents
site activity, test sends, labeled sends, and internal helper submits from being
counted as real owner demand. The website repository is public, so the intake
skill returns a founder decision card but never persists a named candidate,
permission receipt, fit note, contact channel, or contact detail here.

For design direction, use the local `seascape-design-specialist` and
`seascape-design-critic` pair. The specialist owns the concept pass and
implementation brief. The critic owns the blunt taste verdict. They are local
because Seascape taste, page economics, and the "do not bless bland work"
standard are repo-specific.

The repo design launcher may scan locally cached Codex and Claude plugin skill
frontmatter to find task-specific donor capabilities. That scan is read-only,
metadata-only, and does not make a cached skill authoritative or callable. It
must not install, copy, globally load, or promote a donor. This keeps the local
design pair stable while allowing guide families to borrow stronger interface,
artifact, map, chart, imagery, or prototype lenses when the current session
actually exposes them.

## Model And Tool Routing

Choose models and plugins at task level. Do not change a global default or add
a local skill just because a new model or marketplace package exists.

| Work | Lead | Required evidence and tools | Optional challenger |
| --- | --- | --- | --- |
| New guide | Current Codex lead through Search Operator and SEO Architect | Analytics receipt, DataForSEO or current web SERP, inspected competitor URLs, active brief, content rubric, design specialist, copy chain, and rendered proof | Sol or another current design-capable model for a bounded concept/critic pass; Product Design or Creative Production only when format exploration materially helps |
| Meaningful rescue | Current Codex lead through the regression-rescue lane | Current route proof, live SERP, inspected competitors, source truth, active brief, screenshots, and design specialist when hierarchy or format changes | One bounded design or content challenger when the first pass is materially uncertain |
| Tiny fix | Codex only | Relevant source plus focused content/build/link proof | No fanout or donor plugin unless search intent, page role, or visual hierarchy changes |

Figma is optional and becomes the handoff only when an actual approved Figma
artifact exists. Image generation may explore mood, composition, or
non-factual decorative assets; it must not fabricate a property, destination,
field visit, shell find, or evidence image. DataForSEO supplies repeatable
search evidence and recorded cost, not autonomous strategy. Browser inspection
explains the page; Playwright screenshots and visual tests prove it.

## External packs — donor references only

Do not install or mirror `geo-optimizer-skill`, `gtm-engineer-skills`,
`searchstack-aeo`, `claude-seo`, `akii-seo-ai-search-optimizer`, or `aeo.js` into
this repo unless a fresh `agent-surface-audit` shows a repeated site-specific need
and the tool has a smoke-tested win. AI citation monitoring and GSC/GA4 proof
systems belong in `seascape-analytics`, not in this website repo.

For design work, global `claude-design`, `product-design:*`, and
`creative-production:*` skills are donor lenses only. They may sharpen a pass,
but they do not become local authority or replace `DESIGN.md`, the local design
pair, or the rendered proof loop.

Local plugin-cache discovery is the preferred first donor check. Legacy global
donors remain optional when already available; Sawyer does not need to keep a
bundle globally loaded for the Seascape design lane.

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
- **2026-07-17 — restricted `owner-outbound-batch` to permissioned intake.**
  Trigger: the active packet contained only Airbnb/Vrbo host-message paths,
  which prove a public listing observation but not owner identity or permission
  to receive a business pitch. Agent-surface audit verdict: **KEEP** the
  existing referenced skill, change its authority in place, and create no new
  agent, skill, workflow, scraper, or automation. Decision: archive the
  platform-only packet, retire its drafts, make the public site artifact policy
  only with no named candidate state, and require Sawyer's separate approval
  before any named one-to-one message. Contact evidence must remain outside
  Git in an approved private owner system. This supersedes the original
  draft-preparation authority while preserving `owner-reply-intake` as the
  demand-validation gate.
- **2026-06-25 — added `seascape-design-specialist` and `seascape-design-critic`.**
  Trigger: repeated founder dissatisfaction that Codex site design work was too
  willing to ship clean-but-bland direction and depended too much on remembering
  a global design bundle. Decision: promote one narrow repo-local design lane
  plus a blunt critic gate, wire a repo-local launcher, and keep outside design
  tools donor-only. Approved by Sawyer.
- **2026-07-21 — extended the existing design lane with local donor routing.**
  Trigger: repeated guide-design comparisons showed that different guide jobs
  need different visual structures, while Sawyer should not have to maintain a
  globally loaded design bundle. Agent-surface audit verdict: **KEEP** the
  existing specialist/critic authority and launcher; create no new agent or
  skill. Decision: add a metadata-only local plugin scanner plus comparison,
  field-journal, planning, destination-overview, and general-page routing. The
  scanner never installs, copies, invokes, or promotes a donor by itself.
