# SEO Workflow Map

One map of Seascape's SEO and AEO workflows, shared by Claude and Codex. It
names what runs on its own, what an agent runs on request, and which skill or
role owns each step. Process detail lives in the linked docs; this page only
routes. Verified 2026-10-25; re-verify the scheduled rows before relying on
them.

## What Runs On Its Own

| Job | Where | What it does | Re-verify |
| --- | --- | --- | --- |
| Local OpenSEO app | launchd `com.sawbeck.open-seo-review` on Sawyer's Mac | Serves the OpenSEO app and MCP at `http://localhost:3001/mcp` | `launchctl list com.sawbeck.open-seo-review` |
| OpenSEO scheduler tick | launchd `com.sawbeck.open-seo-review-scheduler`, every 15 minutes | Runs OpenSEO's own scheduled work (saved rank trackers, AI-visibility schedules). Paid schedules exist only when Sawyer approved them | `launchctl list com.sawbeck.open-seo-review-scheduler` |
| Weekly search drop check | launchd `com.seascape.seo-weekly-drop-check`, Mondays 07:47 Eastern; plist owned by `seascape-ops`, script owned by `seascape-analytics` | Compares the last 28 days of Search Console clicks with the 28 days before for each page with 10+ prior clicks. A page down 30% or more puts one card on Sawyer's docket and replaces the prior week's card | `launchctl print gui/501/com.seascape.seo-weekly-drop-check` |

Nothing else SEO-related is scheduled. The Analytics weekly operator report
(`scripts/weekly-search-operator-report.sh`) runs only on request and needs the
BigQuery CLI. No GitHub workflow in this repo runs SEO research; the Site
workflows test, preview and publish pages.

## What An Agent Runs On Request

| Step | Owner | Use |
| --- | --- | --- |
| Saved evidence | local OpenSEO | Free saved reads first, per `docs/process/openseo.md`. Paid lookups need Sawyer's approval for the exact run |
| Choose the next batch | `.claude/agents/search-operator.md` with the `next-batch-gate` skill | Proof lane plus attack lane; one cluster or one rescue; follows `docs/process/batch-workflow.md` |
| Rescue a dropped page | `docs/process/ranking-regression-rescue.md` | Triggered by a weekly drop-check card, a rank-tracker drop, or indexing drift; returns the Gate 0 block |
| Research method | upstream `openseo-local-*` skills | `seo-audit`, `keyword-clustering`, `ai-visibility-audit`, `ai-prompt-research`, `competitor-analysis`, `seo-report`. Generic methods; Seascape gates still apply |
| Evidence report | `openseo-review` skill | Saved-evidence review and private report |
| Write or change copy | brief from `docs/briefs/README.md`, `content-quality-rubric`, `docs/process/aeo-citability-rubric.md`, the content gate | Copy changes need a brief |
| Titles and meta | `serp-ctr-title-rewrite` | High-impression, weak-CTR pages |
| Internal links | `internal-link-targeting` | Link targets for a chosen cluster |
| Structured data | `schema-markup` | JSON-LD rules |
| Outcome readback | `seascape-analytics` | Keep, revise, revert or insufficient evidence after the measurement window |

## Claude And Codex Differences

- Codex also has `~/.agents/skills/seascape-seo-improvement-loop`, a
  Codex-only runner that walks one improvement from OpenSEO evidence to an
  Analytics decision. It follows this map and `docs/process/openseo.md`; Claude
  runs the same loop through the search-operator role and the steps above.
- Codex's global `ai-seo` skill (`~/.codex/skills/ai-seo`) is generic
  marketing background. It is disabled in this repo
  (`.agents/_disabled-skills-2026-04-28/ai-seo`). For Seascape AEO, the
  `docs/process/aeo-citability-rubric.md` and `content-quality-rubric` govern.
- Both harnesses use only the local `openseo` MCP server for Seascape, never
  the hosted OpenSEO connector.

## Changing This Map

Update this page in the same PR that adds, changes or retires an SEO job,
role or skill. A scheduled job also needs its owning repo's review and
Sawyer's approval before it is enabled.
