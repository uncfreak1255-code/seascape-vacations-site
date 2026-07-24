# Guide Reader-Language Gate Implementation Plan

> **Execution receipt:** This plan tracks the gate, rewrite, proof, and PR closeout for the existing PR #464 worktree. No subagent or new skill was required.

**Goal:** Make PR #464 reject internal funnel language in public guide copy, then rewrite the full Anna Maria Island vs Siesta Key guide in natural traveler language without changing the approved visual direction.

**Architecture:** Keep the existing five-role SEO workflow and global copy chain. Tighten its source of truth in the voice and banned-pattern docs, add deterministic reader-language fixtures to the existing content linter, and give the existing Voice Editor a mandatory verdict. Rewrite only visible copy and copy-bearing JavaScript values in the guide, preserving markup, links, tracking, facts, layout, and interaction behavior.

**Tech Stack:** Eleventy/Nunjucks HTML, Node's built-in test runner, existing content enforcement scripts, Playwright visual proof.

---

## Chunk 1: Branch and gate

### Task 1: Synchronize the PR branch

**Files:**
- Preserve: `artifacts/**` (untracked screenshot residue; never stage)

- [x] Run `npm run git:preflight`, fetch `origin`, and merge current `origin/main` into `codex/ami-vs-siesta-guide-redesign`.
- [x] Record the synchronized boundary: base `cb249c6c1cb8892e3d8e68759b8f8ed712c1f702`, merge head `e109e6fa`.
- [x] Resolve only conflicts that overlap PR #464's authorized guide/design scope.
- [x] Confirm the branch still contains the intended visual redesign and no generated `_site/` output is staged.

### Task 2: Write the failing reader-language test

**Files:**
- Modify: `scripts/enforcement/content-voice.test.js`
- Modify: `docs/style/voice.md`
- Modify: `docs/style/banned-patterns.md`
- Modify: `docs/style/approved-examples.md`
- Modify: `docs/process/content-quality-gate.md`
- Modify: `.claude/agents/voice-editor.md`
- Modify: `docs/process/skill-policy.md`

- [x] Add focused reader-copy patterns for internal planning phrases such as `trip shape`, `stay base`, `booking path`, `named ... option`, and `right stay`.
- [x] Add fixtures proving the phrases fail in static reader copy and JavaScript-generated interaction copy while internal docs remain allowed.
- [x] Add a page-level assertion that scans quoted copy inside the guide's interactive recommendation data instead of relying on the reader-copy extractor, which strips scripts.
- [x] Run `node --test --test-name-pattern="reader-language" scripts/enforcement/content-voice.test.js` against the unchanged guide and confirm static, generated, and component-copy fixtures fail before implementation and pass after it.
- [x] Update voice authority so agents may reason with internal shorthand but must translate it before publication.
- [x] Give Voice Editor a mandatory `Reject`, `Needs rewrite`, or `Approved` verdict with a traveler-language test.
- [x] Record the bounded agent-surface decision in the existing skill-policy receipt section; do not create another agent or generic skill.

## Chunk 2: Full guide rewrite

### Task 3: Build the copy packet

**Files:**
- Read: `.agents/product-marketing-context.md`
- Read: `docs/briefs/2026-07-ami-vs-siesta-guide-design-compare.md`
- Read: `docs/style/voice.md`
- Read: `docs/style/banned-patterns.md`
- Read: `docs/style/approved-examples.md`
- Read: `src/_data/properties-fallback.json`
- Read: `src/guides/anna-maria-island-vs-siesta-key.html`

- [x] Extract the page's reader decision, verified facts, conversion goal, links, and claims that must remain unchanged.
- [x] Save a before/after claim-and-source inventory for county facts, travel times, and Sarasota Luxe property details; verify property facts against `src/_data/properties-fallback.json`.
- [x] Extract a small voice-of-customer phrase packet from source-backed guest reviews and approved examples.
- [x] Separate reader copy from source/proof copy and agent-only implementation labels.

### Task 4: Rewrite the guide through the required copy chain

**Files:**
- Modify: `src/guides/anna-maria-island-vs-siesta-key.html`
- Modify: `docs/briefs/2026-07-ami-vs-siesta-guide-design-compare.md`

- [x] Use `copywriting` to rewrite all visible headings, paragraphs, cards, labels, CTAs, table copy, and interactive recommendation strings around one traveler decision.
- [x] Use `enterprise-ui-writing` to remove funnel, system, and implementation language.
- [x] Use `humanizer` to remove mechanical contrasts, repeated three-part rhythms, fake polish, and obvious AI texture without weakening the direct answer.
- [x] Use `copy-editing` to run clarity, voice, benefit, proof, specificity, emotion, and friction sweeps.
- [x] Preserve all verified links, tracking attributes, facts, source notes, layout classes, and JavaScript behavior.
- [x] Update the active brief with the copy-gate receipt and the exact approved reader-language direction.

## Chunk 3: Proof and PR closeout

### Task 5: Prove the gate and guide

**Files:**
- Test: `scripts/enforcement/content-voice.test.js`
- Render: `/guides/anna-maria-island-vs-siesta-key/`

- [x] Run the reader-language fixture without the implementation and confirm red, then restore the implementation and confirm green.
- [x] Run `npm run lint:content` (24/24 passing).
- [x] Run focused guide conversion, metadata, and recovery tests (38/38 passing).
- [x] Run `npm run verify:ami-vs-siesta-readback` to prove the exact transfer marker, hrefs, event name, and labels remain present.
- [x] Run `npm run build:prod` and `npm run verify:release` (674 release tests passing).
- [x] Run the Great Value detector plus a manual Voice Editor verdict on the complete rendered copy; Voice Editor returned `Approved` and the advisory detector's only zero was its inapplicable supervision-tax dimension.
- [x] Capture synchronized before/after proof at desktop and mobile viewports and inspect hierarchy, wrapping, CTA labels, selector interaction, and the Sarasota Luxe availability destination.
- [x] Run `npm run test:visual` and inspect every difference. Result: 39/42 passed. The guide's mobile snapshot varied by 23 px between captures, and the unrelated fishing page alternated between local Poppins and fallback font metrics on both breakpoints because `font-display: optional` is timing-sensitive. The target guide itself passed its focused desktop/mobile baseline run; no unrelated baseline was changed.

### Task 6: Review and update PR #464

**Files:**
- Review: full `origin/main...HEAD` diff

- [x] Run the simplify checkpoint on the current diff; expanded generated-copy parsing to cover single quotes and template literals, and removed a duplicate `design:donors` merge artifact.
- [ ] Run the configured full-branch Codex Autoreview receipt at the exact base/head SHA.
- [ ] Stage only intended source, gate, test, brief, and proof-plan files; exclude `artifacts/**` and generated output.
- [ ] Commit and push the branch.
- [ ] Re-read PR #464 head SHA, checks, mergeability, and preview link.
- [ ] Do not merge; report exact remaining design comparison or CI blockers.
