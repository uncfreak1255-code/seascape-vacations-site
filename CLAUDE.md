@AGENTS.md

Read `AGENTS.md` first. It is canonical. Content work follows its
[Required Batch Workflow](AGENTS.md#required-batch-workflow).

- `emil-design-eng` is the craft skill `docs/agents/rules/design.md` requires for site design work.
- Worktrees: a session pinned to `.claude/worktrees/<name>` is the isolated
  worktree AGENTS.md asks for. Work on the branch the harness created, run
  `npm ci` once (a fresh worktree has no `node_modules`), and create no
  `.worktrees/<task>` checkout as well. A "permission denied" on a
  root-checkout path is that rule working.
- A displayed or installed skill is not proof that its body loaded or its
  procedure ran.
- GBrain has no index of this repo's code: search code and docs with Grep and
  Glob. Decisions and dated facts live in its `session-briefs` lane: `recall`
  with `source_id: "session-briefs"` plus `entity: projects/<name>` or
  `grep`; zero results are not proof of absence. If a repo-scoped GBrain connection refuses the `session-briefs`
  source, use the `gbrain` CLI. Don't run `gbrain sync` from a task session;
  the machine's sync lane owns it.
