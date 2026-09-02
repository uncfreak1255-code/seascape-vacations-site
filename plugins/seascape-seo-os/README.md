# Seascape SEO OS (plugin)

Portable packaging of this repo's Claude Code setup so a fresh clone, a new
machine, a teammate, or a fork can reproduce it with one install instead of
hand-wiring agents and skills.

## What it bundles

- **Agents** (`agents/`) — the five roles from `CLAUDE.md`: Search Operator,
  SEO Architect, Page Builder, Voice Editor, Release Gate.
- **Skills** (`skills/`) — the sixteen active site-specific skills.

The `agents/` and `skills/` entries are committed plugin copies of the canonical
sources in `.claude/agents/` and `.agents/skills/`. They are duplicated on
purpose: Claude Code preserves the directories during install but drops symlink
targets from the plugin cache, which leaves an "installed" plugin empty. Keep
these copies in sync with the canonical repo files whenever the active role or
skill surface changes.

## Why there is no Stop hook

Earlier versions bundled the content-voice `Stop` hook. It has been **removed
on purpose**. The hook calls `scripts/enforcement/claude-content-gate.js` and
the `lint:content` npm script, so it only works inside this repo or a fork that
keeps those — it is not portable. More importantly, a `Stop` hook can delay or
block the agent's final response. The repo therefore does not register a
`Stop` hook in either the plugin or `.claude/settings.json`. Content and release
verification remain explicit commands in `CLAUDE.md`; the dormant hook scripts
stay available as tested implementation references. This plugin distributes
only the portable pieces (agents + skills).

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
- The sixteen skills here track `AGENTS.md` and `CLAUDE.md`. If the active-skill
  set changes, update the copied plugin files in `skills/` and bump the plugin
  version.
