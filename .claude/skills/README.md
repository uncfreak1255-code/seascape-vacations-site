# Claude Skill Surface

`/.agents/skills/` is the canonical local skill source in this repo.

`/.claude/skills/` is only a thin compatibility layer for Claude-specific discovery. Keep it limited to symlinks for approved local skills that actually exist in `/.agents/skills/`.

The directories under `/.agents/skills/` are the current inventory. This file
does not duplicate that list; `scripts/enforcement/skills-divergence.js` proves
that the compatibility links stay aligned with the canonical directory.

For meaningful visual work, start with the repo-local
`seascape-design-specialist`; its workflow uses the design critic and rendered
review procedures named in `AGENTS.md`.

Use global marketing skills from `/Users/sawbeck/.codex/skills/` as advisory
helpers when needed. Do not mirror broad marketing, deploy, monthly reset,
generic SEO, or archived skills into this local compatibility layer.

For AI discovery, GEO/AEO, and schema work, use the repo-local `schema-markup`
skill (the global `seascape-seo` skill was retired). Keep external SEO/GEO packs
donor-only unless a fresh agent-surface audit proves they should become live
local authority.

Do not park generic skill bundles here.
Do not keep broken symlinks here.
Do not duplicate repo-local skill content here when a symlink will do.
