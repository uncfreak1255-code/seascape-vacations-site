# Retired Route And SEO Triage Receipt - 2026-06-29

## Scope

This receipt supports PR 429 and the active goal for the retired stay route:

- fix `/stays/christmas-vacation-rentals-florida/` as a retired-route gap
- keep the change inside the AMI stay alias family
- do not open a broader owner, stay, guide, GEO, or SEO expansion batch
- record triage for stale SERP proof, metadata drift, and performance/image work

This is route hygiene and proof triage. It is not a public copy rewrite, title
rewrite, schema expansion, new stay page, or new guide batch.

## Current Gate

Authoritative source: `docs/status/next-batch.md`.

Current reread status on 2026-06-29: `fresh but below threshold`.

The concrete next move is owner outbound, not a new site expansion branch. The
same file says not to open a new owner, stay, guide, GEO, or SEO expansion
branch from this read. Bounded rescue work is allowed only for a confirmed
winner or money-page regression under `docs/process/ranking-regression-rescue.md`.

Decision for this PR: fix the confirmed retired-route 404, and hold unrelated
search-facing edits.

## Retired Route Gap

Evidence:

- Production readback on 2026-06-29: `https://seascape-vacations.com/stays/christmas-vacation-rentals-florida/` returned `HTTP/2 404`.
- Source already consolidated the related longer alias,
  `/stays/christmas-vacation-rentals-florida-gulf-coast/`, into
  `/stays/anna-maria-island-vacation-rentals/`.
- `docs/portfolio/stay-money-pages.md` assigns the AMI stay alias family to
  `/stays/anna-maria-island-vacation-rentals/`.

Action:

- Add a direct `301` from `/stays/christmas-vacation-rentals-florida/` to
  `/stays/anna-maria-island-vacation-rentals/`.
- Lock the route in `scripts/enforcement/technical-cleanup.test.js`.
- Add the alias to `docs/portfolio/stay-money-pages.md`.

Acceptance proof:

- Deploy preview readback for PR 429 returns `HTTP/2 301` with
  `location: /stays/anna-maria-island-vacation-rentals/`.
- Production must return the same `301` after merge and deploy before this gap
  can be called closed.

## AMI Vs Siesta SERP Proof

Evidence:

- `docs/briefs/2026-06-ami-vs-siesta-transfer-batch.md` observed the SERP on
  2026-06-20 and marked the SERP stale after 2026-06-27.
- The same brief's implementation receipt says to wait for the first complete
  post-deploy GSC/GA4 window before judging impact.
- Today is 2026-06-29, so that Gate 0 SERP block is stale for new search-facing
  edits.

Decision:

- Do not rewrite titles, meta descriptions, headings, intro copy, schema, or
  internal-link strategy for `/guides/anna-maria-island-vs-siesta-key/` from
  the stale SERP block.
- A future search-facing AMI-vs-Siesta edit needs a fresh SERP read plus the
  post-deploy joined GSC/GA4 readback required by the brief.

## Metadata Drift

Evidence command:

```bash
npm run build
node rendered metadata/image scan over _site
```

Rendered scan result from this branch:

- `162` HTML pages scanned
- `0` missing titles
- `0` missing descriptions
- `0` missing canonicals
- `0` missing H1s
- `0` multi-H1 pages
- `37` titles over 65 characters
- `66` descriptions under 120 characters
- `22` descriptions over 160 characters

Worst overlong titles in the scan:

| Route | Length | Title |
| --- | ---: | --- |
| `/stays/anna-maria-island-beachfront-rentals/` | 94 | Anna Maria Island Beachfront Rentals Alternative - Near-Island Pool Homes \| Seascape Vacations |
| `/stays/large-group-vacation-rentals-anna-maria-island/` | 91 | Large Group Vacation Rentals Near Anna Maria Island with Private Pools \| Seascape Vacations |
| `/property-management/vrbo-management-services-florida/` | 90 | Florida VRBO Property Management for Owners: Channel-Specific Pricing \| Seascape Vacations |
| `/stays/anna-maria-island-vacation-rentals/` | 87 | Anna Maria Island Vacation Rentals - Direct-Book Near-Island Homes \| Seascape Vacations |
| `/property-management/maximize-vacation-rental-income-florida/` | 82 | Maximize Florida Vacation Rental Income: Protect Owner Payout \| Seascape Vacations |

Decision:

- Metadata drift is real but not a release blocker for this redirect rescue.
- Do not ship a broad metadata rewrite from this PR.
- A later metadata batch should start with the current `docs/status/next-batch.md`
  gate, one active brief, fresh SERP proof for every search-facing page edit,
  and priority on money pages with enough impressions to make snippet work
  measurable.

## Performance And Image Dimensions

Evidence:

- `lighthouserc.js` asserts LCP at `4500`, CLS at `0.2`, TBT at `300`, script
  size at `100000`, and stylesheet size at `50000`.
- `config/perf-budget.json` uses matching budgets for LCP `4500`, CLS `0.2`,
  TBT `300`, script `100`, stylesheet `50`, image `800`, total `1000`, and
  third-party count `20`.
- `scripts/perf/money-routes.js` collects only five money routes:
  three owner routes and two AMI stay routes.
- The rendered image scan found `389` images, `0` missing alt attributes, and
  `180` images missing explicit `width` and/or `height`.
- PR 429 GitHub `build` check is currently still running in
  `npm run perf:budget:check`, so CI performance proof is not complete yet.

Decision:

- Performance proof is incomplete for this goal until the CI perf check
  finishes, and it should not be represented as a fresh PSI/CWV proof.
- Image dimension work is real technical debt, but not part of the retired-route
  redirect fix.
- A later performance task should decide whether the budget should move toward
  stricter Core Web Vitals thresholds, whether the homepage belongs in the
  collected route set, and whether the `180` missing explicit image dimensions
  should be fixed by template helpers, image data, or targeted source edits.

## Final Boundary

PR 429 can fix the retired-route gap after merge/deploy. It does not authorize
unrelated SEO expansion or impact claims. Production `curl -I` on
`/stays/christmas-vacation-rentals-florida/` is the final route proof.
