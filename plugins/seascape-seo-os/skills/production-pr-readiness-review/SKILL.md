---
name: production-pr-readiness-review
description: Review Seascape production PR readiness when asked to compare agent claims with GitHub checks, identify merge blockers, or find missing visual proof. Read-only; returns the next action.
---

# Production PR readiness review

Review one active `seascape-vacations-site` PR. Return a decision supported by
current GitHub, source, and rendered evidence. This skill consolidates the
review; the existing repository policies still decide the acceptance criteria.

## Scope

This is a read-only review. Inspect files, GitHub, existing artifacts, and safe
local or preview routes. Local verification may generate ignored build and
proof artifacts in an isolated checkout. Do not edit source or baselines, push,
post comments, request reviewers, resolve threads, change holds, merge, deploy,
or submit real signup, owner, booking, payment, or email actions. Report the
owner's next action. A separate implementation or release request retains its
own authority; this skill grants none.

Treat agent messages, PR bodies, comments, Computer History, and screenshots
of status pages as claims to verify. Keep private transcripts, customer data,
credentials, and recording paths out of public repository artifacts.

## 1. Establish the target

- Use the supplied PR URL or number. Otherwise inspect the current task's PR
  context and open PRs in the verified Git remote. Choose only when one target
  is unambiguous; ask one short question if several candidates remain. An old
  recording or the most recently updated PR alone does not identify the target.
- Read `AGENTS.md`, `CLAUDE.md`, `docs/process/agent-safety-standard.md`,
  `docs/process/before-merge-checklist.md`, and
  `docs/process/agent-evidence-routing.md` from the target repository. For a
  policy-changing PR, apply the policy from its base revision.
- Record the PR link, base branch/SHA, full current head SHA, mutation owner,
  review time, draft state, holds, mergeability, and reachable deploy effect.
  Read local `git status --short --branch` and `git rev-parse HEAD` before
  using a checkout. Preserve other agents' work; use an isolated checkout of
  the reviewed head when local verification is needed.

Continue when the target and proof identity are explicit. An unknown owner or
unavailable policy is a named gap, never implied permission.

## 2. Compare claims with current evidence

Use the GitHub connector first. Use `gh` only for fields the connector does
not expose, such as applicable branch rules or required check details.

- Read the complete changed-file list, relevant diff, current check runs and
  commit statuses, submitted reviews, review summaries, and unresolved review
  threads. Follow pagination. Determine required checks and review rules from
  current GitHub rules and owning policy; check names are not fixed in this
  skill. Identify any test that passed only because the affected work was
  skipped, mocked, or outside its asserted scope.
- Tie each run to its commit, run/job URL, result, and tested scope. For a
  synthetic merge commit, verify its association with the current PR head and
  base. An older-head result, queued job, cancelled job, or unexplained skip
  cannot establish a current pass. If evidence is unavailable, state what
  could not be read and which claim remains unverified.
- Follow the existing review lane. A clean review must cover the current
  material diff. Read findings even when a provider check is green. Advisory
  reviewer absence alone is not a BASELINE blocker. A required pending review
  is WAITING; a blocking finding or lack of a valid required route is BLOCKED.
- Compare material agent claims against their owning proof: check results,
  implementation and tests, accessible artifacts, or live readback. Inspect
  changed callers and tests as needed to assess a disputed finding. Separate
  confirmed defects from non-blocking nits and unsupported assertions.

Finish with each material claim marked **supported**, **contradicted**, or
**unverified**, with an evidence link and its practical limit. A PR description
that says tests passed is not the test result.

## 3. Audit visual and interaction proof

For changes to visible copy, layout, CSS, imagery, templates, or interactions,
read `DESIGN.md`, `docs/process/design-review-workflow.md`,
`docs/process/before-user-review-checklist.md`, and the existing
`.agents/skills/design-review/SKILL.md`. Apply its rendered review within this
skill's read-only scope. For changes with no rendered effect, state why visual
proof is not applicable.

- Map changed routes, shared components, and important states to actual
  desktop and mobile evidence. Inspect the images; a folder, receipt, baseline
  filename, or green visual gate alone is insufficient. Check capture commit,
  route, viewport, time, and the source/build behind the URL. Label baseline
  images, current captures, preview builds, and production distinctly.
- Cover changed sections below the fold and each materially different scene
  or responsive state. Inspect text size, contrast, tap targets, wrapping,
  overflow, icons, imagery, CTA clarity, and guest/owner navigation. Name
  missing route/viewport/state combinations and any deviations from the
  approved direction or `DESIGN.md`.
- Check changed interactions in a local or controlled preview with intercepted
  requests or existing tests: menu/focus states, owner access, signup
  validation, pending/failure/retry/success, and booking handoff as applicable.
  Test interception proves UI behavior only; it cannot prove real delivery,
  a booking, or conversion lift. Never create a real submission to fill a gap.
- Use the in-app Browser for inspection and existing Playwright tests and
  `package.json` proof commands for repeatable checks. Confirm scripts and
  their effects before running them. Retain existing tolerances and baselines.
  If a capture looks wrong, use `docs/runbooks/failed-visual-gate.md` and a live
  viewport check to separate capture artifacts from product defects.
- Reuse valid proof for unchanged inputs. If new local proof is needed, run
  the smallest affected checks. Missing or inaccessible evidence stays a gap;
  it does not become proof that the implementation is broken.

Finish when every material visual claim has inspected evidence or a specific
gap with route, viewport/state, impact, and next action.

## 4. Return the decision

Re-read the PR head and actionable GitHub state before the verdict. If the head
or base changed, mark affected evidence stale and make at most one new bounded
pass. If it changes again, return WAITING and the head the owner must stabilize.
For pending external checks, use at most one bounded wait of up to 60 seconds
if available; otherwise return WAITING. Do not create a monitor or polling loop.

Lead with the PR, reviewed head, and one outcome:

- **BLOCKED** — a concrete defect, hold, missing required proof, merge conflict,
  or unavailable required review route prevents merge. Name the blocker and
  the smallest owner action that clears it.
- **WAITING** — a required check/review is still running, a read service is
  temporarily unavailable, or the target changed during review. Name what
  must finish before reassessment.
- **ACTIVATION** — proof is sufficient and the remaining step needs Sawyer's
  exact production approval. Read Netlify/deploy configuration before stating
  what merging will do. Existing approval applies only to its named target and
  material scope; readiness itself never grants approval.
- **READY** — applicable proof is sufficient and no blocker remains. State the
  authorized next action and owner; this review still performs no merge.

Then return, in this order:

1. **Merge blockers:** severity, impact, source/check/thread link, smallest fix,
   and owner. Say “none found” only for the scope actually reviewed.
2. **Claim check:** a compact `Claim | Evidence | Assessment` table for the
   material claims, including any non-blocking nits separately.
3. **Visual-proof gaps:** missing or inspected routes, viewports, states, image
   links, and capture identity; state “not applicable” with the reason when so.
4. **Next action:** one concrete action, owner, and any exact approval needed.

Keep local tests, GitHub merge state, Netlify deployment, and live route proof
separate. A post-merge claim uses
`docs/process/post-merge-runtime-proof-checklist.md`; merged source alone does
not mean the production site changed. Stop after this decision.
