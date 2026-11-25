# Seascape Vacations Site — Agent Entry Point

Every session first follows `docs/process/git-session-rules.md` -> Source
currency (read the rest before edits or publication), then reads
`docs/process/agent-safety-standard.md`.

## Load context for the task

- UI, CSS, templates or layout: `DESIGN.md`, then `docs/process/design-review-workflow.md`
- Public copy or SEO copy: select the brief through `docs/briefs/README.md`, then the content gate
- Behavior diagnosis, a focused fix or tests: `docs/status/current-state.md` -> Code map names each flow's source and existing tests
- Measured SEO expansion, title or meta rewrites, or prioritizing from analytics: `docs/status/next-batch.md`, the canonical reread handoff surface for measurement truth, `docs/status/current-state.md`, the matching brief and `docs/portfolio/` file, and the `next-batch-gate` skill
- Business-priority, experiment or capability-trial advice: `docs/process/learning-contract.md`
- Browser, DOM, screenshots, Playwright, web search, desktop automation: `docs/process/agent-evidence-routing.md` first
- Commit, push, PR or merge: review the diff, then `docs/process/git-session-rules.md`, `docs/process/before-merge-checklist.md`, and after merge `docs/process/post-merge-runtime-proof-checklist.md`
- Red or queued CI, visual-baseline refresh, missing Netlify deploy: `docs/process/checks-and-runners.md`
- Codex cloud task: `docs/process/codex-cloud-handoff.md`
- Issues, triage labels or domain terms in a managed engineering skill: `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, `docs/agents/domain.md`
- SEO/AEO research, skills, tooling or workflow changes: `docs/process/skill-policy.md`, `docs/process/learning-contract.md`, `docs/process/openseo.md`; `docs/process/seo-workflow-map.md` routes research skills

Conditional reading never waives a content, design, safety, measurement or
release requirement. If a workflow doc conflicts with repo safety docs, the
stricter repo rule wins. A skill never replaces the gates, approval or proof
requirements here.

## Ownership

This repo owns page source, SEO/GEO, owner- and guide-page CRO, schema,
internal links, site-side tracking hooks and deploy readiness. Analytics and
proof systems belong to `seascape-analytics`, strategy to `seascape-hub`, and
email delivery to `seascape-ops`. Email lock (2026-08-20; policy in
`seascape-hub/context/operating-canon.md#business-email`): Mailchimp is the
paid guest-marketing sender (Journey 8592, tag `guest-capture`); Outlook
`info@` campaigns and post-stay email stay hard-disabled (do not activate);
owner `info@` mail is transactional only (form confirmations and
founder-approved replies); personal Gmail is prohibited.

## Business Priorities And Experiments

Standing SEO authority (Sawyer, 2026-11-18, #1008): agents own SEO/AEO fixes
to existing pages end to end, with no preview or merge approval from Sawyer.
That means picking from evidence, passing the PR class's review and checks,
merging, letting the daily publish ship it, verifying it live, and reverting
through a PR if it hurts. Simulated phone checks count. Each fix freezes its
baseline, gets a keep-or-revert date and a written verdict, and Sawyer gets
one weekly note of what shipped, what each change did and what was reverted. A merge follows its PR class. A paid lookup follows
`docs/process/openseo.md` -> Cost Boundary. Sawyer still decides: anything
sent outside the business (guest/owner sends included), Seascape fee,
rental-price and legal wording, new pages, spending outside the Cost
Boundary, Hostaway, the Google Business Profile, early publishes, and the held
guides (weather, best time to visit, Anna Maria vs Siesta Key, shelling) until
their measurement ends. Visual redesigns follow
`docs/process/design-review-workflow.md`.

## Non-Negotiable Rules

- Root `main` is sync-only. Non-trivial work happens on `codex/<task>` in
  `.worktrees/<task>`; a Claude session pinned to `.claude/worktrees/<name>`
  already satisfies this.
- Edit source, not `_site`.
- Amenity and capacity claims trace to `src/_data/properties.js` (and
  `properties-fallback.json`). Owner-proof claims trace to
  `src/_data/ownerProofAssets.json`. No invented equipment, waterfront spread,
  padded sleeping capacity, or recycled review counts.
- Live `/.netlify/functions/*` paths, metrics `receipts[]` field names and
  `verify:*` npm script names are consumed by seascape-ops, -hub and
  -analytics; check the locks in
  `docs/plans/2026-06-12-v1-implementation-handoff.md` before renaming any of
  them.
- Use seomachine only as a reference for context rules, brief shape, rewrite
  workflow and prioritization; never import its code, publishing assumptions
  or folder structure.
- When code changes affect active instructions, runbooks, status or briefs,
  update them in the same branch. At closeout, fix stale pointers and
  leftovers your task caused, verify source and consumers before removal, and
  report unrelated ones.
- No local dirt: a task is not complete while its checkout is dirty, its
  worktree sits on detached `HEAD`, or cleanup is left for Sawyer. The worker
  owns verification, the keeper branch or PR, and branch and worktree cleanup
  unless a named blocker stops the lane.

## Testing

- Fast gates: `npm run lint:content` for copy-only work; `npm run build` (worktree
  lock, Hostaway cache sync, Eleventy, availability validation) for structural
  source work.
- A lone `node --test` skips `pretest`. Tests that read `_site/` fail in a
  fresh worktree until `npm run build` has run once.
- `npm run verify:release` is the one full pre-PR gate. Use standalone
  `npm test` and `npm run lint:content` only for iteration. On a dirty
  worktree, stage new files and run
  `npm run verify:release -- --range origin/main`.

## Deploy

- A merge is not live. `publish-production.yml` fast-forwards `production` to
  `main` daily at 09:05 UTC, and Netlify publishes from `production`.
- Agents never push to `production` and never dispatch Publish Production. An
  early publish costs a Netlify build and is Sawyer's to run from his account.
- After every merge, run `npm run verify:merge-live -- <squash-sha>` (exit 0 =
  `production` contains the merge; 1 = merged, queued, not live). Live also
  needs the completed Netlify deploy and the post-merge checklist's proof
  commands. Every merge report names the live check and exit code, or says
  "not yet live". "Shipped" means merged, published to `production`, built by
  Netlify, and passing live smoke.

## Required Batch Workflow

Route by `docs/process/batch-workflow.md`. Visible-copy order:
**Draft the copy**, **Remove internal wording**, **Check voice and specificity**
(using the active brief and `docs/style/`), then `npm run lint:content`.

## Path-scoped rules

Read the matching rule before touching its area (Claude auto-loads them via
`.claude/rules/`):

- Public copy in `src/` and briefs: `docs/agents/rules/content-gate.md`
- UI, CSS, templates, layout, browser scripts, shared shell: `docs/agents/rules/design.md` (required Emil craft skill)

## Writeback Boundary

Changes to Seascape's business understanding are written back to
`seascape-hub`, without implementation logs. Land writebacks to any other repo
through a branch or PR from that repo's `origin/main`, never by mutating a
local sibling checkout.

## Review guidelines

Every reviewer, `@codex review` included, follows `REVIEW.md` from the base
branch, not the PR.
