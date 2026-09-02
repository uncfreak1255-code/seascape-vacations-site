# Site Skill Pressure Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the portable Site plugin with the canonical 16 skills and restore at least 500 tokens of live Site skill-list headroom without installing external packs.

**Architecture:** Keep `.agents/skills/` as the canonical Site skill surface and `plugins/seascape-seo-os/skills/` as its portable copy. Reduce metadata cost by shortening descriptions only; preserve all workflow bodies, references, scripts, and activation nouns. Treat global disables as a separate approval-gated projection change after usage evidence names exact replacements.

**Tech Stack:** Markdown Agent Skills, Claude plugin manifest, Node.js repository gates, Codex prompt-input readback.

---

## Chunk 1: Reconcile and compact

### Task 1: Lock current surfaces and tests

**Files:**
- Inspect: `.agents/skills/*/SKILL.md`
- Inspect: `plugins/seascape-seo-os/skills/*/SKILL.md`
- Modify: `scripts/enforcement/` only if no existing plugin-parity test covers the defect

- [x] Record canonical and packaged skill inventories.
- [x] Add a failing parity assertion if the current tests do not detect the 16-versus-11 drift.
- [x] Run the focused assertion and confirm it fails on the original tree.

### Task 2: Make the plugin copy exact

**Files:**
- Modify: `plugins/seascape-seo-os/README.md`
- Modify: `.claude-plugin/marketplace.json`
- Create or modify: `plugins/seascape-seo-os/skills/*`

- [x] Copy the five missing canonical skill directories into the plugin.
- [x] Update the documented skill count and manifest description.
- [x] Bump the plugin patch version.
- [x] Run the plugin-parity assertion and confirm it passes.

### Task 3: Compact canonical descriptions

**Files:**
- Modify: `.agents/skills/*/SKILL.md`
- Modify: matching `plugins/seascape-seo-os/skills/*/SKILL.md`

- [x] Preserve each skill name, core trigger nouns, scope boundary, and full workflow body.
- [x] Shorten only frontmatter descriptions that materially consume the model-visible list.
- [x] Add or run activation fixtures for representative matching and non-matching prompts.
- [x] Re-copy changed canonical bytes to the plugin and prove exact parity.

## Chunk 2: Global audit and donor comparison

### Task 4: Classify global marketing skills

**Files:**
- Read only: global skill roots, config, and recent usage logs

- [x] Record configured, enabled, prompt-visible, and used states separately.
- [x] Name exact local replacements for every proposed duplicate removal.
- [x] Apply only the user-authorized exact replacements after live prompt proof.

### Task 5: Compare Corey Haines `ai-seo`

**Files:**
- Read only: upstream `ai-seo` skill and current Site AI-discovery sources/tests

- [x] Produce an already-covered/missing/not-applicable gap table.
- [x] Confirm no upstream skill files or packages were installed.

## Chunk 3: Verification and closeout

### Task 6: Run repository proof

- [x] Run focused skill/plugin parity and activation tests.
- [x] Run `npm run verify:skills-divergence`.
- [x] Run `npm test`; content and release-only gates are outside this metadata/package cone.
- [x] Run `git diff --check` and inspect the final diff.

### Task 7: Measure prompt pressure

- [x] Run fresh live prompt-input measurements in Hub, Site, Analytics, and Ops.
- [x] Require at least 500 remaining Site skill tokens.
- [x] Record branch, dirty state, changed files, global targets, and one next action.
