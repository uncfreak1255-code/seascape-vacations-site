# Site Learning Contract

This repo may learn only from public-site behavior, source-backed page claims,
and release checks that improve visible site execution.

## Trusted Inputs

- Checked-in page source, templates, schema, redirects, and tracking hooks.
- Active briefs, portfolio docs, status docs, and source-of-truth docs in this repo.
- Live or built release checks, including `npm run lint:content`, `npm run verify:release`, owner-funnel route checks, direct-booking event smoke checks, and visual proof where relevant.
- Analytics receipts from `seascape-analytics` when a site decision depends on demand, attribution, AI visibility, or conversion proof.

Do not turn page views, AI referrals, proof-labeled owner tests, or model
suggestions into public claims without a current source-backed receipt.

## Approval Boundary

- Agents may improve page source, internal links, metadata, schema, and tracking hooks when an active brief and repo gates support the change.
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
