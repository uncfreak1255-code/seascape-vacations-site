# Required Batch Workflow

The order of operations for one SEO batch. Referenced from `CLAUDE.md`; kept here
because it only applies while a batch is actually running.

1. Search Operator reads the latest operator evidence.
2. One cluster gets chosen.
3. One brief gets written or updated in `docs/briefs/`.
4. Work starts on `codex/<batch>` in `.worktrees/<batch>`.
5. Page Builder reads the active brief, `docs/process/content-quality-gate.md`, `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md`, then uses `copywriting` when drafting or rewriting reader copy.
6. Page Builder edits source and only the docs needed to support that batch.
7. Page Builder rewrites any sentence that still sounds like a role card, session note, or helper instruction before it lands in source.
8. Voice Editor runs `enterprise-ui-writing` and then `humanizer` on changed reader copy before critiquing it against the same brief and content gate.
9. Release Gate runs `npm run lint:content` and requires a visible-copy voice pass before the rest of verification.
10. Deploy.
11. Reread after the crawl window instead of inventing a new batch too early.

See also `docs/process/five-roles.md` for who owns each step, and the "Reading
Order For SEO Work" section in `CLAUDE.md`.
