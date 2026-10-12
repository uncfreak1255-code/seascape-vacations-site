# SEO Task Ownership

These five names describe responsibilities. They do not identify model
versions or require five separate agent sessions for every task. Choose the
execution route in `docs/process/batch-workflow.md` before dispatching agents.

For source-backed existing-guide accuracy repairs, use one lead and one
read-only targeted reviewer. The lead owns evidence, scope and implementation;
the reviewer covers voice, factual consistency and release proof. The existing
Release Gate card can perform that combined review. The five-role batch lane
continues to govern new guides, search-intent/routing changes and meaningful
rescues, including the design specialist when required.

The bounded comparison in
`docs/research/2026-10-12-seo-workflow-comparison.md` supports this repair route.
It does not establish a winner for all SEO work or all models.

| Role | Write Access | Job |
| --- | --- | --- |
| Search Operator | read-only | Run two lanes for one query family: proof from GSC/GA4/BigQuery and current attack research from keywords, SERPs, competitors, content formats, and AI-answer evidence. A blocked proof lane is not a completed recommendation. |
| SEO Architect | read-only | Turn the two-lane receipt into page roles, canonical families, feeder routing, information gain, internal-link direction, design/format strategy, and winner/destination logic. Invoke the design specialist for new guides and meaningful visual rescues. |
| Page Builder | writes source | Implement the chosen batch in `src/`, redirects, schema, and supporting docs. This is Codex. Draft from the brief and approved examples, not from role-card or session phrasing. |
| Voice Editor | read-only | Critique copy for tone drift, internal/process wording, instruction-template copy, fake specificity, and AI texture. Check **Remove internal wording** then **Check voice and specificity**; return findings to Page Builder for edits. |
| Release Gate | read-only | Verify `npm run lint:content`, build, schema, redirects, metadata, tests, and diff sanity before any push, PR, or merge. |

That is enough. Extra agent personas are overhead unless they own a real surface
the five roles do not.
