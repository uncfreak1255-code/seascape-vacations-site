# Required Batch Workflow

The order of operations for one SEO batch. Referenced from `CLAUDE.md`; kept here
because it only applies while a batch is actually running.

1. Search Operator runs the proof lane and attack lane for one named query family.
2. Search Operator records the attack receipt. `hold` is incomplete unless the
   attack status is `completed` or `none found after named checks`.
3. SEO Architect turns that receipt into content, routing, and design/format
   strategy. New guides and meaningful visual rescues invoke
   `seascape-design-specialist` before Page Builder work.
4. One cluster gets chosen and one brief gets written or updated in
   `docs/briefs/` only after that strategy exists.
5. Work starts on `codex/<batch>` in `.worktrees/<batch>`.
6. Page Builder reads the active brief, `docs/process/content-quality-gate.md`, `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md`, then completes **Draft the copy** for changed reader copy.
7. Page Builder edits source and only the docs needed to support that batch.
8. Page Builder rewrites any sentence that still sounds like a role card, session note, or helper instruction before it lands in source.
9. Voice Editor checks **Remove internal wording** and then **Check voice and specificity** against the same brief and content gate. Page Builder makes any requested rewrites; Voice Editor stays read-only.
10. Release Gate runs `npm run lint:content` and requires a visible-copy voice pass before the rest of verification.
11. Deploy.
12. Reread after the crawl window instead of inventing a new batch too early.

See also `docs/process/five-roles.md` for who owns each step, and the "Reading
Order For SEO Work" section in `CLAUDE.md`.
