# Five Roles

The SEO operating model for this repo. Referenced from `CLAUDE.md` but kept here
because it is workflow context that only applies while running a batch, not
every-turn truth.

| Role | Write Access | Job |
| --- | --- | --- |
| Search Operator | read-only | Pull GSC, GA4, BigQuery, and weekly operator evidence. Recommend one cluster, not ten. |
| SEO Architect | read-only | Define page roles, canonical families, feeder routing, internal-link direction, and winner/destination logic. |
| Page Builder | writes source | Implement the chosen batch in `src/`, redirects, schema, and supporting docs. This is Codex. Draft from the brief and approved examples, not from role-card or session phrasing. |
| Voice Editor | read-only | Critique copy for tone drift, internal/process wording, instruction-template copy, fake specificity, and AI texture. Run `enterprise-ui-writing` then `humanizer` on visible reader copy. |
| Release Gate | read-only | Verify `npm run lint:content`, build, schema, redirects, metadata, tests, and diff sanity before any push, PR, or merge. |

That is enough. Extra agent personas are overhead unless they own a real surface
the five roles do not.
