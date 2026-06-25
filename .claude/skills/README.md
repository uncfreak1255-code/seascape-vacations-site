# Claude Skill Surface

`/.agents/skills/` is the canonical local skill source in this repo.

`/.claude/skills/` is only a thin compatibility layer for Claude-specific discovery. Keep it limited to symlinks for approved local skills that actually exist in `/.agents/skills/`.

Current curated focus:
- `accessibility`
- `content-quality-rubric`
- `design-review`
- `internal-link-targeting`
- `next-batch-gate`
- `owner-outbound-batch`
- `owner-reply-intake`
- `owner-proof-integrity`
- `page-cro`
- `property-truth-regeneration`
- `schema-markup`
- `seascape-design-critic`
- `seascape-design-specialist`
- `serp-ctr-title-rewrite`
- `site-architecture`
- `web-design-guidelines`

Use global marketing skills from `/Users/sawbeck/.codex/skills/` as advisory
helpers when needed. Do not mirror broad marketing, deploy, monthly reset,
generic SEO, or archived skills into this local compatibility layer.

For AI discovery, GEO/AEO, and schema work, use global `seascape-seo` plus the
repo-local `schema-markup` skill. Keep external SEO/GEO packs donor-only unless
a fresh agent-surface audit proves they should become live local authority.

Do not park generic skill bundles here.
Do not keep broken symlinks here.
Do not duplicate repo-local skill content here when a symlink will do.
