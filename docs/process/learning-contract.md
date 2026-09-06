# Site Learning Contract

This repo may improve site execution and its supporting workflow from
source-backed behavior, release checks, and bounded local comparisons. A useful
local result is evidence for that task, not proof of business impact.

## Trusted Inputs

- Checked-in page source, templates, schema, redirects, and tracking hooks.
- Active briefs, portfolio docs, status docs, and source-of-truth docs in this repo.
- Live or built release checks, including `npm run lint:content`, `npm run verify:release`, owner-funnel route checks, direct-booking event smoke checks, and visual proof where relevant.
- Analytics receipts from `seascape-analytics` when a site decision depends on demand, attribution, AI visibility, or conversion proof.

Do not turn page views, AI referrals, proof-labeled owner tests, or model
suggestions into public claims without a current source-backed receipt.

## Local Capability Trials

Use the "Business Priorities And Experiments" contract in `AGENTS.md`. A trial
may use an already available tool or proposed instruction change in an isolated
checkout before it earns adoption. Test the candidate against the current
method on the same task and compare correctness, useful output, and Sawyer's
intervention. New purchases, installation, permissions, external actions, and
global activation remain outside that authority.

When an instruction changes, inspect a fresh session's loaded guidance and
task decisions. Static text checks alone do not prove changed agent behavior.
One successful session is initial evidence; use subsequent real tasks to test
repeatability before claiming reduced supervision. Preserve the current method
until the candidate earns replacement, and reverse a trial that introduces a
material regression or exceeds its time limit.

## Approval Boundary

- Authorized local fixes, prototypes, and comparisons may proceed under the
  local trial scope above. Before proposing page source, internal links,
  metadata, schema, or tracking-hook changes for publication, require the active
  brief and applicable repo gates. A successful trial does not waive them.
- Public owner-demand, direct-booking, revenue, attribution, or AI-visibility claims require source-backed proof and the relevant live or build check.
- New dashboards, skills, MCPs, or workflow layers require a repeated repo-specific need, a passing surface audit, and a smoke-tested win.
- Public copy changes must pass the content gate and keep reader copy, proof copy, and agent copy separate.

## Receipt That Proves It

Trusted learning requires a source diff plus the matching proof:

- Public copy: `npm run lint:content`.
- Release behavior: `npm run verify:release` or the narrower release check named by the change.
- Meaningful visual changes: desktop and mobile screenshots or the repo's visual review receipt.
- Measurement claims: a current analytics receipt from `seascape-analytics`.

If the proof is stale, test-only, or from another repo without a current receipt,
the site may expose instrumentation or copy, but it must not claim demand,
bookings, revenue, attribution, owner conversion, or AI-search improvement.
