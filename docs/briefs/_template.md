# Brief: <cluster name>

## Figma Handoff

- Figma capture:
- Figma frames:
- Figma proof: only if `docs/briefs/figma-mcp-state.json` still says this file only exposes empty `Page 1`

## Content Gate Inputs

- persona:
- primary keyword:
- secondary keywords:
- audience pattern:
- proof source:
- required internal links:
- CTA target:
- anti-claims:

## Why This Batch

- what changed in the data
- why this cluster wins now
- what should explicitly wait

## Experiment And Readback Contract

- hypothesis:
- primary event:
- guardrail event:
- entry criteria:
- readback window:
- decision rule:

## Gate 0 Search And Attack Receipt

Required when the branch changes search-facing page source, `src/_data/seoPages.json`,
`src/_redirects`, or `src/sitemap.njk`.

| Field | Required answer |
| --- | --- |
| Target query family | |
| Searcher intent | |
| Current Seascape URL | |
| SERP observed date | YYYY-MM-DD |
| SERP stale after | YYYY-MM-DD |
| Current proof | |
| Top visible competitors | |
| Competitor angle | |
| Visual/format gap | |
| Seascape gap | |
| Search fit | |
| Local/GBP proof | |
| AEO/readback note | |
| Recommendation | |
| Attack status | `completed` or `none found after named checks` |
| Query variants inspected | |
| SERP source | source and observed date |
| Competitor URLs inspected | at least one inspected URL, or named failed checks when none were found |
| Content gap and Seascape answer | |
| Design/format strategy | |
| Seascape proof available | |
| Tools/plugins used | |
| Decision and reason | |

A blocked or below-threshold proof lane does not complete this receipt. Record
the current attack research before returning `hold`, or say exactly which named
source, SERP, and competitor checks found no viable action.

## Cluster In Scope

- canonical winner URL(s)
- feeder pages
- aliases or retired URLs
- money destination
- active lane: owner acquisition, comparison guides, or direct-book stay intent

## Source And Proof Constraints

- property truth needed
- owner proof asset needed
- claims that are off-limits
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage

## Page Builder Tasks

- source files likely to change
- redirect or schema work
- internal-link or CTA work
- money CTA and downstream tracking event to verify

## Voice Editor Checklist

- tone risks
- generic or mechanical patterns to kill
- proof or specificity checks
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured

## Release Gate Checklist

- routes to smoke test
- commands to run
- regression risks to watch

## Done When

- measurable definition of finished

## Post-Reread Outcome

- reread window used
- crawl freshness result
- actual impressions, CTR, position, and downstream event counts
- decision taken: hold, rewrite, expand, or kill
- next branch slug or explicit wait state

## Not In Scope

- the work this batch should not expand into
- blog-post sprawl from competitor pages or question tools
- copied competitor structure without Seascape-specific proof or local judgment
