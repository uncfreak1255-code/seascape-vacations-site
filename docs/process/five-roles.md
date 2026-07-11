# Five Roles

The SEO operating model for this repo. Referenced from `CLAUDE.md` but kept here
because it is workflow context that only applies while running a batch, not
every-turn truth.

| Role | Write Access | Job |
| --- | --- | --- |
| Search Operator | read-only | Run two lanes for one query family: proof from GSC/GA4/BigQuery and current attack research from keywords, SERPs, competitors, content formats, and AI-answer evidence. A blocked proof lane is not a completed recommendation. |
| SEO Architect | read-only | Turn the two-lane receipt into page roles, canonical families, feeder routing, information gain, internal-link direction, design/format strategy, and winner/destination logic. Invoke the design specialist for new guides and meaningful visual rescues. |
| Page Builder | writes source | Implement the chosen batch in `src/`, redirects, schema, and supporting docs. This is Codex. Draft from the brief and approved examples, not from role-card or session phrasing. |
| Voice Editor | read-only | Critique copy for tone drift, internal/process wording, instruction-template copy, fake specificity, and AI texture. Run `enterprise-ui-writing` then `humanizer` on visible reader copy. |
| Release Gate | read-only | Verify `npm run lint:content`, build, schema, redirects, metadata, tests, and diff sanity before any push, PR, or merge. |

That is enough. Extra agent personas are overhead unless they own a real surface
the five roles do not.
