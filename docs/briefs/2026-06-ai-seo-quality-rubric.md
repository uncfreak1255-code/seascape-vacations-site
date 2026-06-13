# Brief: AI-SEO Quality Rubric + Voice-Chain Governance

Tooling/quality batch from the 2026-06-13 AI-SEO stack audit
(`docs/research/2026-06-13-ai-seo-stack-audit.md`). This is not a content-page
batch; it closes the audit's "do-now" gaps without touching public reader copy.

## Content Gate Inputs

- persona: the Seascape page-building and voice-editing agents (Codex, Claude), not a guest or owner reader
- primary keyword: n/a (internal tooling/process batch, no ranking target)
- secondary keywords: n/a
- audience pattern: agents drafting guide/stay/research copy that should be both un-sloppy and AI-citable
- proof source: `docs/research/2026-06-13-ai-seo-stack-audit.md` (the audit + cited sources)
- required internal links: n/a (no public page copy changes in this batch)
- CTA target: n/a
- anti-claims: do not claim the rubric or pinning is live before it ships; do not install any external donor pack or searchfit; do not add AI-citation *monitoring* here — that proof surface stays in the `seascape-analytics` repo, not this website repo

## Why This Batch

- what changed in the data: the AI-SEO audit found the stack is strong on
  safety (negative linter + proof-binding + brief gate) but has no positive
  quality rubric, no authoring-time AEO citation check, and an ungoverned,
  unpinned voice chain.
- why this cluster wins now: these are cheap, high-leverage fixes that raise
  citation/ranking ceiling without page volume and without relaxing any ban.
- what should explicitly wait: any external pack install; AI-citation
  monitoring (analytics repo); a deterministic local `aeo-audit` script (gate on
  Rec 1 showing repeated need).

## Scope — three do-now items, sequenced

1. **Humanizer↔AEO reconciliation rule (SHIPPED in this batch).** A doc rule in
   `docs/process/content-quality-gate.md` (Visible Copy Lane) mirrored in
   `docs/style/voice.md`: the humanizer pass may not dissolve answer blocks,
   comparison tables, or first-200-word answers on guide/stay/research routes,
   nor reintroduce hedging into citable claims. No control-plane change, so it
   lands now.
2. **Advisory-first content quality rubric (GATED — next increment).** One local
   advisory skill that scores a draft on the 2026 citation dimensions
   (information-gain-vs-SERP, answer-in-first-200-words, answer-block presence,
   named-source density, table-for-comparison, E-E-A-T signals) and returns a
   score + specific fixes. Advisory only — not a CI hard gate until it proves
   repeated, site-specific value. Harvest criteria from claude-seo's
   QRG/passage-citability scorer and geo-optimizer's 8-category scorecard
   WITHOUT installing either pack.
3. **Pin/vendor the voice-chain skills (GATED — next increment).** Vendor or pin
   `enterprise-ui-writing` and `humanizer` into the repo and add a smoke test
   that asserts they actually ran on changed copy, not just that their names
   appear in workflow docs. Removes the ungoverned dependency on the critical
   copy path.

## Governance gate (hard requirement before items 2 and 3 land)

Items 2 and 3 are control-plane changes (a new skill; pinning/vendoring global
skills + a new smoke test). Per `CLAUDE.md` and
`docs/plans/2026-06-13-demand-os-handoff.md` §5, any change to an
agent/skill/workflow surface must clear an `agent-surface-audit` first and
carry explicit Sawyer approval + a receipt. Do not create the skill or vendor
the skills until that audit runs and approval exists. This batch ships only
item 1 (a doc rule) and the supporting docs; items 2 and 3 are staged here, not
implemented.

## Experiment And Readback Contract

- hypothesis: codifying AEO extractability + adding an advisory rubric raises the
  share of guide/stay/research drafts that are citation-ready, without adding
  slop or page volume.
- primary event: n/a at the analytics layer (authoring-time quality control); the
  proxy is reviewer adoption of rubric findings on the next content batch.
- guardrail event: `npm run lint:content` stays green; no public reader-copy
  regression; no new external dependency.
- entry criteria: this batch's docs land; the `agent-surface-audit` clears items
  2-3 before they are built.
- readback window: evaluate on the first guide/stay/research content batch that
  runs after the rubric exists.
- decision rule: keep the rubric advisory if it produces actioned findings;
  only consider a deterministic `aeo-audit` CI gate if findings repeat across
  batches (the repo's "repeated need + smoke-tested win" bar).

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: none
- claims that are off-limits: do not present harvested donor-pack criteria as an
  installed dependency; do not claim llms.txt is a citation lever; do not move
  AI-citation monitoring into this repo
- Seascape-specific value beyond generic competitor coverage: the rubric is
  tuned to Seascape's guide/stay/owner routes and its proof-binding discipline,
  not a generic SEO scorecard

## Page Builder Tasks

- source files changed in this batch: `docs/process/content-quality-gate.md`,
  `docs/style/voice.md`, `docs/research/2026-06-13-ai-seo-stack-audit.md`,
  `docs/status/open-risks.md` (Card 1 baseline gotcha), this brief
- redirect or schema work: none
- internal-link or CTA work: none
- money CTA / downstream tracking: none (no public page change)

## Voice Editor Checklist

- tone risks: the reconciliation rule must read as a Seascape shipping rule, not
  as imported SEO-vendor jargon
- generic or mechanical patterns to kill: none introduced into public copy
- proof or specificity checks: the audit note labels every low-confidence claim
  and cites sources; keep those labels

## Release Gate Checklist

- routes to smoke test: none (docs-only)
- commands to run: `npm run lint:content` (must stay green — it statically
  asserts the content-quality-gate doc markers and skill order) and
  `npm run verify:release`
- regression risks to watch: do not remove any asserted marker or reorder the
  `copywriting`→`enterprise-ui-writing`→`humanizer` mentions in
  `content-quality-gate.md`

## Done When

- item 1 (reconciliation rule) is live in the gate doc + voice doc, the audit
  note and open-risks gotcha are persisted, `lint:content` + `verify:release`
  are green, and items 2-3 are clearly staged behind the `agent-surface-audit`
  gate.

## Not In Scope

- installing any external donor pack or searchfit
- AI-citation monitoring or GSC/GA4 proof systems (the `seascape-analytics` repo owns that proof surface)
- a deterministic local `aeo-audit` CI gate (deferred; gate on Rec 1 evidence)
- any public reader-copy rewrite
