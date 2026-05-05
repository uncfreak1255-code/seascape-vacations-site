# Claude Skill Surface

`/.agents/skills/` is the canonical local skill source in this repo.

`/.claude/skills/` is only a thin compatibility layer for Claude-specific discovery. Keep it limited to symlinks for approved local skills that actually exist in `/.agents/skills/`.

Current curated focus:
- `accessibility`
- `page-cro`
- `schema-markup`
- `site-architecture`
- `web-design-guidelines`

Use global marketing skills from `/Users/sawbeck/.codex/skills/` as advisory
helpers when needed. Do not mirror broad marketing, deploy, monthly reset,
generic SEO, or archived skills into this local compatibility layer.

Do not park generic skill bundles here.
Do not keep broken symlinks here.
Do not duplicate repo-local skill content here when a symlink will do.
