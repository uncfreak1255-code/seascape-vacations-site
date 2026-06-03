# Seascape SEO OS (plugin)

Portable packaging of this repo's Claude Code setup so a fresh clone, a new
machine, a teammate, or a fork can reproduce it with one install instead of
hand-wiring agents and skills.

## What it bundles

- **Agents** (`agents/`) — the five roles from `CLAUDE.md`: Search Operator,
  SEO Architect, Page Builder, Voice Editor, Release Gate.
- **Skills** (`skills/`) — the eleven active site-specific skills.

The `agents/` and `skills/` entries are **symlinks** to the canonical sources
(`.claude/agents/` and `.agents/skills/`). There is no second copy to keep in
sync: editing the canonical file is the only edit. Because the symlink targets
live inside this marketplace (the repo), Claude Code dereferences them into the
plugin cache on install.

## Why there is no hook here

Earlier versions bundled the content-voice `Stop` hook. It has been **removed
on purpose**. The hook calls `scripts/enforcement/claude-content-gate.js` and
the `lint:content` npm script, so it only works inside this repo or a fork that
keeps those — it is not portable. It already lives in the repo's committed
`.claude/settings.json`, which any clone or fork inherits without installing
this plugin. Keeping it in both places made the gate run twice. The repo's
`.claude/settings.json` is now the single source of truth for the gate; this
plugin distributes only the portable pieces (agents + skills).

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
- The eleven skills here track `AGENTS.md` and `CLAUDE.md`. If the active-skill
  set changes, update the symlinks in `skills/` and bump the plugin version.
