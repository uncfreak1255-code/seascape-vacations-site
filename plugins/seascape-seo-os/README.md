# Seascape SEO OS (plugin)

Portable packaging of this repo's Claude Code setup so a fresh clone, a new
machine, a teammate, or a fork can reproduce it with one install instead of
hand-wiring agents, skills, and the content gate.

## What it bundles

- **Agents** (`agents/`) — the five roles from `CLAUDE.md`: Search Operator,
  SEO Architect, Page Builder, Voice Editor, Release Gate.
- **Skills** (`skills/`) — the nine active site-specific skills.
- **Hook** (`hooks/hooks.json`) — a `Stop` hook that runs
  `npm run lint:content` and blocks turn completion on voice violations.

The `agents/` and `skills/` entries are **symlinks** to the canonical sources
(`.claude/agents/` and `.agents/skills/`). There is no second copy to keep in
sync: editing the canonical file is the only edit. Because the symlink targets
live inside this marketplace (the repo), Claude Code dereferences them into the
plugin cache on install.

## Install

From a clone of this repo (or a fork):

```shell
/plugin marketplace add ./            # or: uncfreak1255-code/seascape-vacations-site
/plugin install seascape-seo-os@seascape-vacations
/reload-plugins
```

## Notes

- This does **not** change *triggering* — skills already auto-surface from
  `.agents/skills/` in a local clone. The plugin's job is reproducible
  distribution, not new behavior.
- The `Stop` hook here calls the repo's `scripts/enforcement/claude-content-gate.js`
  via `$CLAUDE_PROJECT_DIR`, so it only does useful work when installed into
  this repo or a fork that keeps that script and the `lint:content` npm script.
- If you also keep the equivalent `Stop` hook in `.claude/settings.json`, the
  gate runs twice in this repo (harmless and fast). Pick one as the source of
  truth if you want to avoid the duplicate run.
