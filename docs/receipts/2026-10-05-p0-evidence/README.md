# P0 savings, cost and booking-evidence correction

Review branch: `codex/p0-evidence-correction`.
Base: `01f9959ad26442db150b7add460a643a0153bd24`.

Existing canonical routes retain their addresses. Fixed booking savings,
unsupported area-rate comparisons and fabricated trip totals are removed
from the affected copy, tables, list items, metadata and FAQ answers.
Current property charges and the existing SAVE50 offer remain.

The booking report now describes Seascape's scope and confirmed listing
information. The earlier numerical study is withheld: an archived reservation
export, inclusion rules and reviewed calculations are not available with it.
Neither repeating a count nor calling it a Seascape sample substantiates it.
The companion calculator and chart pack show withdrawal notices, use
`noindex, follow`, and are excluded from the sitemap and research hub.
Existing SVG URLs also display a withdrawal notice.

## Site gates

- `npm run lint:content`: 28 passed.
- `npm test`: 1,088 passed, none skipped.
- `npm run verify:release -- --range origin/main`: passed.
- [Full release receipt](release-gate.json): includes property truth, build,
  tests, design lint, redirects, recovery, links and JSON-LD checks.

The commands ran on the staged correction relative to the recorded main base.

## Rendered proof

The route/viewport results are in [rendered-checks.json](rendered-checks.json).
They cover 25 routes at desktop 1440×900 and mobile 390×844, with current
headings, no horizontal overflow, no page JavaScript errors and no failed
local asset requests. Google analytics and external Google fonts were blocked
in the local capture; the site's self-hosted assets were served normally.
The final flight-page CTA has its own refreshed captures in the check receipt.

The Playwright design-floor and accessibility selection passed 19 tests;
three desktop-only tap-target checks were intentionally skipped by the suite.
The standard browser download was unavailable. These checks used a separately
installed Chromium 153 executable, without changing site dependencies.

Representative booking-report screenshots:

- [Desktop](booking-research-desktop.png)
- [Mobile](booking-research-mobile.png)

## Publication boundary

This is source and local-render proof, not production proof. Review the branch
before merge. After an approved merge, confirm the Netlify deployment's commit
SHA and run `npm run verify:recovery:live` against production. That smoke now
checks the corrected research, cost and withdrawn-tool routes as well as the
existing contact, tax quarantine and retired-cost redirect checks.

The coordinator's `/Users/sawbeck/bin/guardrail-*` wrappers are not installed
in this workspace. They have not been reported as passing. Run the coordinator
publication checks during integration; do not infer a deployment from this
receipt.
