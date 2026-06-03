# Fortune 500 Agent Operating Upgrade

Date: 2026-06-03
Author: Strategy research pass (Claude)
Branch: `claude/agent-output-quality-wZBW4`
Scope: research report and phased roadmap only. No source, skill, or harness changes are made by this doc.

Grounded in:
- `CLAUDE.md`, `AGENTS.md`, the five-role cards in `.claude/agents/`
- `docs/status/current-state.md`, `docs/status/next-batch.md`, `docs/status/open-risks.md`
- `docs/process/` (content-quality-gate, agent-safety-standard, git-session-rules, design-review-workflow)
- `docs/style/` (voice, banned-patterns, approved-examples)
- `docs/plans/2026-04-18-seo-strategy-refresh.md` (the existing gstack `/autoplan` run)
- `.claude/settings.json`, `.claude-plugin/marketplace.json`, `plugins/seascape-seo-os/`, `scripts/enforcement/`, `tests/visual/`, `package.json`, `netlify.toml`
- External 2026 practice on the Claude Code harness, agent evals, GEO/AEO tooling, Figma MCP, and Lighthouse CI (sources listed at the end)

The owner asked for "Fortune 500 grade" output at a headcount of one. That does not mean adding humans, personas, or a tool pile. In this repo it means enterprise-grade rigor produced by one operator plus a disciplined agent fleet. Every recommendation below is measured against the repo's existing lean ethos. Where a recommendation would conflict with `CLAUDE.md`, the conflict is named and reconciled.

---

## 1. Executive Summary

This repo is already operating well above the median agent-run marketing site. The five-role workflow, the brief-gated content lane, the deterministic enforcement suite, the existing Playwright + axe visual regression gate, and the new content-voice Stop hook and portable plugin from PR #277 are most of what a Fortune 500 web team would put in place. The gap is not missing rigor. The gap is that the rigor is concentrated on *publishing safety* and *voice*, and is thin on *outcome measurement* and *closed-loop AI-discovery monitoring* — which is exactly where the two business bottlenecks live (owner acquisition, direct-book conversion).

**Do this (highest leverage first):**

1. **Add lightweight, measured evals to the two things the repo already cares about most: owner money-page copy and AI-answer citability.** The repo has human gates and deterministic lint, but no scored quality signal. A small LLM-as-judge rubric run inside the existing Release Gate lane (free/metered API) turns "Voice Editor read it" into a number that can trend. Tie the rubric to the owner-acquisition and direct-book bottlenecks, not to generic "content quality."
2. **Stand up a Core Web Vitals / Lighthouse CI budget gate.** The April refresh flagged `/stays/anna-maria-island-vacation-rentals/` at 5.36s LCP as the biggest live perf risk and a direct-book conversion drag. There is a visual regression gate but no perf budget gate. Lighthouse CI (free/OSS) closes that.
3. **Fix the stale governance text, then leave the harness alone.** `CLAUDE.md` and `DESIGN.md` still say the visual regression gate does not exist ("until an automated visual regression gate exists"). It does — committed baselines in `tests/visual/__screenshots__/`, threshold tolerances, CI reporters. Correcting stale doc claims is higher leverage than adding tools, because the docs are the operating contract the agents read.
4. **Keep new tooling additions to a tiny, bottleneck-justified set, gated by `agent-surface-audit`.** The strongest move for a solo operator is not more MCP servers; it is fewer, sharper gates that fire automatically. Recommend at most: an evals rubric, Lighthouse CI, and a schema/structured-data validator MCP only if it beats the existing `validate-jsonld.js`.
5. **Do not centralize on gstack.** Use it for genuinely big, ambiguous, multi-subsystem batches only. The five-role + brief + worktree + enforcement spine already covers normal batches; making gstack the mandatory spine adds ceremony and a second source of planning truth that competes with `docs/status/next-batch.md`.

**Do NOT do this:**
- Do not install GEO/AEO packs, keyword-tool MCPs, or AI-citation monitors into this repo. Those belong in `seascape-analytics` per `AGENTS.md`; this repo must not become the measurement control plane.
- Do not add agent personas beyond the five roles.
- Do not unfreeze Phase 4 / page expansion. The current `next-batch.md` status is `blocked by freshness`; nothing here changes that gate.
- Do not adopt Figma MCP as a standing dependency. The site is hand-built Eleventy/Njk with a working `DESIGN.md` and design-review skill; Figma MCP is a heavy add for a one-person operation with no Figma source of truth.

---

## 2. Current-State Assessment

### What is already strong

- **The five-role system is real, not decorative.** `.claude/agents/` carries Search Operator, SEO Architect, Page Builder (Codex), Voice Editor, Release Gate as scoped read/write boundaries. Page Builder is the only writer. This matches the 2026 mental model (skills = knowledge, subagents = workers) and avoids the common failure of one agent doing everything.
- **Publishing safety is enforced deterministically, not by vibes.** `scripts/enforcement/` has ~40 test/validate scripts: redirect targets, internal links, JSON-LD, schema-truth, property-truth invariants, owner-proof clean/freshness, status-doc contract, page-family inventory, indexation link graph. `npm run lint:content`, `verify:release`, and the recovery smoke checks give a genuine release gate.
- **The content lane is gated correctly.** No public copy PR without exactly one active brief, the content gate read, the `copywriting -> enterprise-ui-writing -> humanizer` order, and a passing voice lint. `docs/style/banned-patterns.md` is unusually disciplined about AI texture and internal-process leakage.
- **A visual regression gate already exists and is mature.** `tests/visual/` has committed desktop and mobile baselines for the money routes, per-route diff tolerances in `playwright.config.js`, an axe-core accessibility spec, and CI reporters. `npm run test:visual` builds, serves `_site`, and diffs.
- **PR #277 already closed two real gaps:** a `Stop` hook (`scripts/enforcement/claude-content-gate.js`) that runs the voice lint automatically and blocks turn completion on failure (closing the "agent forgot to run lint" gap from ~70% to ~100% per 2026 hook practice), generated-path `Read` deny rules in `.claude/settings.json`, and a portable `seascape-seo-os` plugin so a fresh clone reproduces the agents, skills, and hook in one install.
- **Status discipline is encoded.** The reread contract forces exactly one status (`blocked by freshness` / `fresh but below threshold` / `open next batch`) and one concrete next move, generated from a `seascape-analytics` receipt. This is better governance than most teams have.

### The real gaps, tied to the two bottlenecks

| Gap | Tied to | Evidence |
|---|---|---|
| **No scored output quality signal.** Voice and CRO quality are gated by human read + deterministic lint, but never scored or trended. "Is this owner page actually persuasive?" has no number. | Owner acquisition (#1) | Owner pages rank but do not earn clicks or CTA action; `next-batch.md` and `open-risks.md` both name owner CTR/lead conversion as the unresolved leak. |
| **No Core Web Vitals budget gate.** Visual regression is covered; perf is not. | Direct-book conversion (#2) | April refresh: `/stays/anna-maria-island-vacation-rentals/` measured 5.36s LCP live; KPI table targets <2.5s. Nothing fails a build when LCP regresses. |
| **AI-discovery is shipped but not closed-loop.** `llms.txt`, schema, and FAQ surfaces are built and validated structurally, but whether AI engines actually cite Seascape is invisible inside this repo (correctly — it belongs in `seascape-analytics`). The loop is open. | Both | `seascape-seo` framing exists; citation monitoring is explicitly out of repo scope. |
| **Stale governance text.** `CLAUDE.md` / `DESIGN.md` say the visual regression gate does not yet exist, and `CLAUDE.md`'s skill list (9) does not match `AGENTS.md`'s (11 — adds `internal-link-targeting`, `serp-ctr-title-rewrite`). Agents read these as truth. | Both (agent reliability) | Direct file comparison. |
| **Planning is ad hoc across two systems.** Most batches run on brief + worktree + enforcement. One big batch (2026-04-18) used gstack `/autoplan` and produced a detailed but heavy review artifact with its restore point living under `~/.gstack/`. There is no rule for when each is used. | Workflow efficiency | `docs/plans/2026-04-18-seo-strategy-refresh.md`. |

The honest read: the repo over-indexes on *not shipping bad copy* and under-indexes on *measuring whether shipped copy moves owners and bookings*. That is the Fortune-500 delta.

---

## 3. Target Operating Model: Fortune 500 at Headcount One

The operating principle for a solo operator with an agent fleet is **push judgment into gates, not into the operator's memory**. A Fortune 500 web org gets quality from layered review by many specialists. A solo operator reproduces that by making each specialist a role card or an automated gate that fires without being remembered.

Target shape (additions in **bold**, everything else already exists):

```
Evidence (seascape-analytics receipt)
   -> Search Operator picks ONE cluster
      -> SEO Architect sets page roles / routing
         -> ONE brief in docs/briefs/
            -> Page Builder (Codex) edits src/ in a worktree
               -> Voice Editor: copywriting -> enterprise-ui-writing -> humanizer
                  -> Release Gate runs:
                       - npm run lint:content  (Stop hook + manual)
                       - npm run test          (enforcement suite)
                       - npm run test:visual   (regression baselines)
                       - **npm run lint:evals** (LLM-judge rubric, new)
                       - **npm run perf:budget** (Lighthouse CI, new)
                       - verify:release / recovery smoke
                  -> Deploy
                     -> Reread after crawl window (no new batch early)
```

The fleet stays at five roles. The two new gates are *checks*, not personas. They run inside the Release Gate lane the repo already has. This keeps the "extra personas are overhead" rule intact while raising the floor on the two bottleneck dimensions.

---

## 4. Recommendations by Domain

Cost flags: **OSS/free** = no recurring cost; **API metered** = pay-per-call against an existing key; **paid SaaS/MCP** = standing subscription.

### (a) Harness & Agent Infrastructure

| # | Recommendation | Why (bottleneck/gap) | Cost | Effort | Risk | Reconciles with CLAUDE.md |
|---|---|---|---|---|---|---|
| a1 | **Correct stale governance text** in `CLAUDE.md` and `DESIGN.md` (visual regression gate exists; reconcile the 9-vs-11 skill list against `AGENTS.md`). | Agents follow the contract ~70% even when correct; a wrong contract guarantees wrong behavior. Highest-leverage, zero-cost. | OSS/free | Low | Low | This *is* the lean ethos — fix the doc layer before scaling, per the reading-order rule. |
| a2 | **Resolve the double Stop hook.** PR #277's plugin and `.claude/settings.json` both register the content gate; pick one source of truth (the plugin README already flags this). | Avoids confusing duplicate runs; keeps the harness legible for a solo operator. | OSS/free | Low | Low | Pure hygiene, no new surface. |
| a3 | **Keep subagents at `model: sonnet` for UI/visual work** (already the rule) and add the same default for the eval-judge runs to control cost. | Cost discipline at headcount one. | OSS/free | Low | Low | Already an explicit rule. |
| a4 | **Do NOT add Figma MCP, LSP, or background-agent infra as standing deps.** | No Figma source of truth; LSP already judged low-value; background agents add an autonomy surface a solo operator must babysit. | n/a | n/a | n/a | Honors "no new surface without a proven site-specific need." |

### (b) Evals & Quality Measurement (the biggest real gap)

| # | Recommendation | Why | Cost | Effort | Risk | Reconciles with CLAUDE.md |
|---|---|---|---|---|---|---|
| b1 | **Add a small LLM-as-judge rubric for owner money-page copy**, run as `npm run lint:evals` inside the Release Gate lane. Score 4-6 dimensions tied to the bottleneck: first-paragraph decision answer, owner-economics specificity (not service-list), proof traceability, CTA clarity, AI-snippet standalone-ability. Output a score + reasons; fail below a floor. Start with a single judge model with chain-of-thought (2026 practice: CoT adds 10-15% reliability; one judge agrees with humans ~85%). | Owner pages rank but do not convert; there is no scored signal for "persuasive." Turns Voice Editor judgment into a trend. | API metered (small; runs only on changed reader copy) | Medium | Medium (judge drift) | Adds a *check*, not a persona or skill. Keep the rubric in `docs/process/` so it is contract, not a black box. Mitigate drift by versioning the rubric and spot-checking against `docs/style/approved-examples.md`. |
| b2 | **Add a GEO/AEO citability eval** for new research and guide pages: does the page answer a question in <=2 standalone sentences, carry FAQ/Q-H2 structure, and name the entity? Score, do not block initially. | Direct-book + owner discovery via AI answers; FAQPage + concise answers is the highest-impact AEO lever in 2026. | API metered | Medium | Low | Pairs with the existing `schema-markup` skill and `validate-jsonld.js`; it scores content, not pipeline. Does not duplicate `seascape-analytics` (that owns *whether* engines cite; this owns *whether the page is citable*). |
| b3 | **Build an eval set of "golden" pages** from `docs/style/approved-examples.md` and the current winner guides, so the judge is calibrated against known-good Seascape voice, not a generic rubric. | Keeps evals anchored to repo voice, not donor-mined "content quality." | OSS/free | Low | Low | Reuses existing approved examples as the calibration source of truth. |
| b4 | **Do NOT adopt a paid evals SaaS** (Braintrust, Confident AI, etc.) yet. | A solo operator with a handful of money pages does not need a platform; a versioned rubric + node test is enough. Revisit only if eval volume grows. | n/a | n/a | n/a | Lean-first; matches "smoke-tested win before adoption." |

### (c) SEO / GEO / AEO

| # | Recommendation | Why | Cost | Effort | Risk | Reconciles with CLAUDE.md |
|---|---|---|---|---|---|---|
| c1 | **Keep DataForSEO + Ahrefs as the keyword/SERP layer** (already in use); do not add a third keyword MCP. | No gap; adding more is volume, not rigor. | existing | n/a | n/a | Anti-bloat. |
| c2 | **AI-citation monitoring (Otterly, Scrunch, Frase-style share-of-voice) stays in `seascape-analytics`, not here.** Expose the *surfaces* (llms.txt, schema, FAQ) in this repo; measure citation in the analytics repo. | `AGENTS.md` is explicit: this repo must not become the measurement control plane. | paid SaaS (in the *other* repo's budget) | n/a | n/a | Direct rule compliance. |
| c3 | **Optional: a structured-data validation MCP** (Schema.org / Google Rich Results checker) *only if* it catches issues `validate-jsonld.js` + `schema-truth.test.js` miss in a smoke test. | The existing validators may not test against live Rich Results eligibility. | paid MCP or free API | Low | Low | Must pass an `agent-surface-audit` and beat the existing scripts before adoption — otherwise reject. |
| c4 | **Keep `llms.txt` owner-money coverage as a tracked enforcement assertion** (April refresh flagged owner pages underrepresented). | Owner acquisition discoverability. | OSS/free | Low | Low | Extends the existing enforcement suite. |

### (d) Design & Front-End

| # | Recommendation | Why | Cost | Effort | Risk | Reconciles with CLAUDE.md |
|---|---|---|---|---|---|---|
| d1 | **Add Lighthouse CI with a `budget.json`** (`npm run perf:budget`), gating LCP/CLS/INP-proxy on the money routes already in `tests/visual/routes.js`. Fail builds on regression. | Direct-book conversion; 5.36s LCP on the top AMI stay page is a known drag with no gate. | OSS/free | Medium | Low | New *check* on existing routes; no new design surface. Strongest single front-end add. |
| d2 | **Promote `core-web-vitals` / `performance` from the donor `skills/` library to advisory use** when the perf gate fails — not as a new active local skill. | Gives the operator a remediation lens without expanding the active 9-skill layer. | OSS/free | Low | Low | Donor skills as advisory lenses is already allowed; does not add local authority. |
| d3 | **Keep the existing visual regression gate; expand baselines to any new money route** instead of building new infra. | The gate exists and works; the work is coverage, not tooling. | OSS/free | Low | Low | Reuses `tests/visual/`. |
| d4 | **Do NOT adopt Figma MCP / Dev Mode as a dependency.** Keep `DESIGN.md` + `design-review` skill as the design spine. | No Figma source of truth; Figma MCP only pays off when a clean token-based Figma file is the source. Adding it for a hand-built Eleventy site scales debt, not quality. | n/a | n/a | n/a | `DESIGN.md` is visual law; outside tools are reference only. |

### (e) Content & Marketing

| # | Recommendation | Why | Cost | Effort | Risk | Reconciles with CLAUDE.md |
|---|---|---|---|---|---|---|
| e1 | **Wire the donor marketing skills already referenced in `CLAUDE.md` (`marketing-psychology`, `copywriting`, `page-cro`, `pricing-strategy`) into the owner-conversion eval rubric** as the dimensions, so CRO judgment is consistent. | Owner acquisition is a persuasion problem, not a volume problem. | OSS/free | Low | Low | Uses already-allowed advisory skills; does not create new local authority. |
| e2 | **Run the `page-cro` skill against the owner money pages when the `next-batch.md` gate opens `owner-ctr-rewrite-round-2`** — not before. | The gate is currently `blocked by freshness`; jumping early violates the contract. | OSS/free | Medium | Low | Respects the freeze and the reread contract. |
| e3 | **Do NOT add content-ops SaaS or editorial-calendar tooling.** | One operator + briefs + portfolio docs is the content-ops system. | n/a | n/a | n/a | Anti-bloat. |

### (f) Workflow / Orchestration & Multi-Agent Handoffs

| # | Recommendation | Why | Cost | Effort | Risk | Reconciles with CLAUDE.md |
|---|---|---|---|---|---|---|
| f1 | **Make the five-role handoff explicit with subagent preloading.** When dispatching a role as a subagent, preload its role card + the relevant skills (subagents do not inherit parent skills in 2026; they must be preloaded). | Tightens the handoff so each role actually reads its contract. | OSS/free | Low | Low | Implements the five roles more faithfully; no new role. |
| f2 | **Use Claude Code native plan mode for normal batches; reserve gstack for big ambiguous ones** (see Section 5). | Avoids two competing planning systems for routine work. | OSS/free | Low | Low | Keeps `docs/status/next-batch.md` as the single status surface. |
| f3 | **Keep git worktrees as the isolation primitive** (already the rule). | This repo already does parallel-safe work via `.worktrees/`; it is the 2026-recommended primitive. | OSS/free | n/a | Low | Already a hard rule. |

### (g) Governance & Safety

| # | Recommendation | Why | Cost | Effort | Risk | Reconciles with CLAUDE.md |
|---|---|---|---|---|---|---|
| g1 | **Keep the secret-deny rules** in `.claude/settings.json` (`.env`, netlify creds, package-lock) and the generated-path `Read` denies. Consider adding a `git secret-scanning` smoke before push. | Solo operator has no second pair of eyes; deny rules are the second pair. | OSS/free | Low | Low | Strengthens existing safety posture. |
| g2 | **Codify rollback: the existing recovery smoke + visual baselines + git worktrees already give rollback;** document the one-line revert path in `git-release-cheat-sheet.md`. | Autonomous operation needs a known rollback, not an improvised one. | OSS/free | Low | Low | Documents existing capability. |
| g3 | **Permissions stay least-privilege;** do not broaden the allowlist for convenience. | Autonomy + broad permissions is the main risk for a solo+agents shop. | OSS/free | n/a | Low | Matches agent-safety-standard. |

---

## 5. gstack Pressure-Test

**What gstack gives this repo (observed in `docs/plans/2026-04-18-seo-strategy-refresh.md`):** an `/autoplan` restore point under `~/.gstack/`, a structured multi-voice review (CEO + Eng dual voices, consensus tables, premise gate, failure-mode and error-rescue registries), and a `GSTACK REVIEW REPORT` summary. On that one batch it produced genuinely useful pressure: it caught the KPI-hierarchy problem (SEO proxies above business outcomes), the stale smoke assertion, and the guide-baseline mismatch. That is real value on a big, ambiguous, multi-subsystem decision.

**The cost of making it the spine:**

1. **Second source of planning truth.** `docs/status/next-batch.md` is declared the *only* canonical operator-read status surface, with a strict three-value contract. gstack restore points live outside the repo (`~/.gstack/`) and produce their own artifacts. Centralizing on gstack creates a competing planning record the contract did not anticipate.
2. **Ceremony cost at headcount one.** The 2026-04-18 artifact is ~650 lines of dual-voice review for what resolved to "tighten the guide batch, fix the smoke, gate the owner rewrite." For routine single-brief batches that ceremony is overhead, and the repo explicitly bans "workflow theater beyond the five-role system" (`next-batch.md`, "Do Not Start With").
3. **Overlap with what already exists.** Plan + checkpoint + review is already covered: briefs (plan), git worktrees + recovery smoke + visual baselines (checkpoint/rollback), and the five-role Release Gate + enforcement suite (review). gstack duplicates the review layer; it does not add a missing primitive.

**Honest comparison:**

| Capability | gstack | Native plan mode / ExitPlanMode | Briefs + worktrees + enforcement (current) |
|---|---|---|---|
| Structured plan before execution | Strong (heavy) | Good, lightweight, in-session | Good for scoped batches |
| Adversarial multi-voice review | Strong | Weak (single agent) | Medium (five roles, but not adversarial by default) |
| Checkpoint / rollback | Restore point file | Session rewind (Esc-Esc, local) | git worktrees + recovery smoke + visual baselines (durable) |
| Lives inside repo governance | No (`~/.gstack/`) | Yes | Yes |
| Cost at headcount one | High ceremony | Low | Low |

**Verdict: adopt for big batches only. Do not centralize.**

- Use the five-role + brief + worktree + enforcement spine for normal batches (the overwhelming majority). It is in-repo, contract-aligned, and already strong.
- Reach for gstack `/autoplan` only when a batch is genuinely large, ambiguous, and spans multiple subsystems (shared templates + data + tracking + redirects at once), where adversarial dual-voice review earns its cost — exactly the 2026-04-18 case.
- If gstack is used, wire it as an *input to* the workflow, not a replacement: its review output must be distilled into one brief in `docs/briefs/` and, if it changes status, exactly one reread line in `docs/status/next-batch.md`. The restore point stays a convenience, never the source of truth. The repo contract still wins.

---

## 6. Gap-Filling Outside Skills

The repo rule is clear: external SEO/GEO packs (`geo-optimizer-skill`, `gtm-engineer-skills`, `searchstack-aeo`, `claude-seo`, `akii-seo-ai-search-optimizer`, `aeo.js`) are donor references only and need a fresh `agent-surface-audit`, a repeated site-specific need, and a smoke-tested win before adoption. Held to that bar, almost none clear it.

| External thing | Verdict | Reason |
|---|---|---|
| GEO/AEO packs (the named list) | **Reject as installs; keep as donor reference.** | Their job (citability framing, schema, FAQ) is already covered by `seascape-seo` + the local `schema-markup` skill. No repeated unmet need. |
| AI-citation monitors (Otterly, Scrunch, Frase) | **Belongs in `seascape-analytics`, not here.** | `AGENTS.md` rule. This repo exposes surfaces; it does not measure citations. |
| Lighthouse CI (`@lhci/cli`) | **Adopt (OSS).** | Fills a genuine, repeated, bottleneck-tied gap (perf budget) that no existing tool covers. Passes the audit bar. |
| LLM-as-judge eval (node test + rubric, no new dep) | **Adopt (built in-repo).** | Not an external pack; a small in-repo check. Fills the measurement gap directly. |
| Donor marketing skills (`marketing-psychology`, `copywriting`, `core-web-vitals`, `performance`, `page-cro`, `pricing-strategy`) | **Keep as advisory lenses (already allowed).** | Used to define eval dimensions and remediation; do not promote to active local authority. |
| Structured-data validator MCP | **Conditional.** | Only if a smoke test proves it beats `validate-jsonld.js` + `schema-truth.test.js`. Otherwise reject. |
| Figma MCP / Dev Mode | **Reject as dependency.** | No Figma source of truth; heavy for a hand-built Eleventy site. |

The honest conclusion: the genuine gaps are filled by **two in-repo checks (evals, Lighthouse CI)**, not by importing skill packs. That is consistent with the repo's own "quality over volume" philosophy.

---

## 7. Phased Roadmap

Each phase respects the current `next-batch.md` status (`blocked by freshness`). None of this unfreezes Phase 4 page expansion. Owners by role.

### Phase 0 — Quick wins (zero or near-zero cost, no new tooling)

| Step | Owner | Success criteria | Dependency |
|---|---|---|---|
| Correct stale governance text: visual regression gate exists; reconcile the 9-vs-11 active-skill list between `CLAUDE.md` and `AGENTS.md`. | Operator + Release Gate review | `CLAUDE.md`/`DESIGN.md` no longer claim the gate is missing; skill lists match. | None |
| Resolve the duplicate content-gate Stop hook (pick plugin or `.claude/settings.json` as the single source). | Operator | One registration; gate runs once. | PR #277 merged |
| Document the one-line rollback path in `git-release-cheat-sheet.md`. | Release Gate | Cheat sheet has an explicit revert + re-verify sequence. | None |
| Build the eval "golden set" from `approved-examples.md` + current winner guides. | Voice Editor (read) + operator | A small fixture of known-good Seascape pages exists for calibration. | None |

### Phase 1 — Close the measurement gap on the two bottlenecks

| Step | Owner | Success criteria | Dependency |
|---|---|---|---|
| Add `npm run lint:evals`: LLM-judge rubric for owner money-page reader copy (CoT, single judge to start), wired into the Release Gate lane. Rubric lives in `docs/process/`. | Release Gate + operator | Changed owner reader copy gets a score + reasons; fails below floor; trend is recordable. | Phase 0 golden set; API key |
| Add `npm run perf:budget`: Lighthouse CI `budget.json` gating LCP/CLS/INP-proxy on the `tests/visual/routes.js` money routes. | Release Gate | A build fails when a money route regresses past budget; AMI stay LCP tracked against the <2.5s target. | OSS install only |
| Add a GEO/AEO citability eval (score, do not block) for new research/guide pages. | SEO Architect (defines) + Release Gate (runs) | New cite-worthy pages get a citability score using FAQ/Q-H2/standalone-answer dimensions. | Phase 1 eval harness |

### Phase 2 — Tighten handoffs and remediation, still inside the freeze

| Step | Owner | Success criteria | Dependency |
|---|---|---|---|
| Make five-role subagent dispatch preload the role card + relevant skills explicitly. | Operator | Each dispatched role reads its contract; handoffs are reproducible. | None |
| Promote `core-web-vitals`/`performance` donor skills to advisory use on perf-gate failures (not active local skills). | Page Builder (Codex) | Perf failures have a documented remediation lens. | Phase 1 perf gate |
| Add `llms.txt` owner-money coverage as an enforcement assertion. | Release Gate | Build fails if owner money pages drop out of `llms.txt`. | None |

### Phase 3 — Use the new signals to act, only when gates open

| Step | Owner | Success criteria | Dependency |
|---|---|---|---|
| When `next-batch.md` moves off `blocked by freshness` and the owner-rewrite thresholds clear, run `owner-ctr-rewrite-round-2` with the eval rubric as the acceptance bar. | Search Operator (decides) -> Page Builder (writes) | Owner pages ship only above the eval floor *and* the reread gate is open. | Reread gate opening; Phase 1 evals |
| Run `page-cro` on owner money pages using `owner_primary_cta_click` / `owner_form_submit` movement as the real KPI (per April refresh scorecard). | Page Builder + Voice Editor | CRO changes are judged by CTA/form movement, not CTR alone. | Above |
| Evaluate (audit-gated) a structured-data validator MCP against existing JSON-LD scripts. | SEO Architect | Either a smoke-tested win that beats `validate-jsonld.js`, or a logged rejection. | `agent-surface-audit` |

Phase 4 page expansion stays frozen throughout. Nothing here changes that.

---

## 8. Risks, Open Questions, and What to Measure

**Risks**
- **Eval drift / false confidence.** An LLM judge that quietly miscalibrates is worse than no judge. Mitigate: version the rubric, calibrate against the golden set, spot-check a sample against `approved-examples.md`, and keep the human Voice Editor pass — the eval augments it, never replaces it.
- **Gate fatigue.** Adding two gates to the Release Gate lane lengthens every batch. Mitigate: evals run only on changed reader copy; perf budget runs only on the money routes; both must stay fast.
- **Governance fragmentation.** Any new artifact (eval reports, perf reports, gstack restore points) that competes with `docs/status/next-batch.md` as a status surface reintroduces the stale-layer risk in `open-risks.md`. Mitigate: reports are evidence, not status; status stays in one file.
- **Cost creep from metered API.** Judge calls are metered. Mitigate: Sonnet for judging, run-on-change only, monthly spot-check of call volume.

**Open questions**
- Does the structured-data validator MCP actually beat the existing scripts, or is it ceremony? (Resolve by smoke test before any adoption.)
- Should the GEO citability eval ever become a hard gate, or stay advisory? (Decide after one quarter of scores.)
- Where does the eval score trend live so it informs the next-batch decision without polluting the status contract? (Likely a `docs/reports/` artifact, read by the operator, not a status surface.)

**What to measure (and where)**
- Owner money-page eval score over time, and whether score increases precede `owner_primary_cta_click` / `owner_form_submit` movement (this repo produces the score; `seascape-analytics` owns the conversion truth).
- Money-route Core Web Vitals against budget, especially the AMI stay LCP toward <2.5s.
- AI citability score on new cite-worthy pages (this repo) vs actual AI citations/share-of-voice (`seascape-analytics`).
- Whether the new gates lengthen batch cycle time materially; if so, trim.

The success test for this whole upgrade is narrow and honest: **owner pages and stay pages get measurably better on scored persuasion and measured performance, and that improvement shows up downstream as owner CTA/form movement and direct-book handoff** — not as more pages, more tools, or a heavier process.

---

## Sources (external research, 2026)

- Claude Code harness (skills/subagents/hooks/plugins, the ~70%-to-100% hook argument): code.claude.com/docs/en/hooks; boringbot.substack.com/p/claude-code-skills-subagents-hooks; levelup.gitconnected.com (mental model for skills/subagents/plugins); smartscope.blog Claude Code advanced best practices 2026
- Plan mode / rewind / worktrees / orchestration: code.claude.com/docs/en/how-claude-code-works; claudefa.st worktree guide; knightli.com 24 Claude Code tips
- Agent evals / LLM-as-judge (CoT +10-15%, ~85% human agreement, judge-to-guardrail): confident-ai.com LLM agent evaluation guide; labelyourdata.com LLM-as-a-judge 2026; adaline.ai complete guide; braintrust.dev human-in-the-loop platforms 2026
- GEO/AEO (FAQ schema highest-impact, citation-monitoring tools, 3-tier KPIs): surmado.com AEO/GEO guide; frase.io AEO guide; conductor.com best AEO/GEO tools; scrunch.com best AEO/GEO tools 2026
- Figma MCP / Dev Mode / token handoff: figma.com/blog introducing Figma MCP server; figma.com/dev-mode; blog.logrocket.com design-to-code with Figma MCP
- Lighthouse CI / Core Web Vitals budgets: unlighthouse.dev Lighthouse CI guide and budgets; unlighthouse.dev core-web-vitals and LCP guides
