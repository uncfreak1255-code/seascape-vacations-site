# Briefs

Use one file per serious SEO batch or page cluster.

The brief is the working contract between Search Operator, SEO Architect, Page Builder, Voice Editor, and Release Gate.

## Select the brief for this task

Use the exact brief named in the task or PR handoff. Check its lifecycle and
scope before treating it as a work order. If none is named, search the affected
source path or route within `docs/briefs/` with `rg -n`, then inspect matching
scope sections. A newer filename does not establish approval or supersession.
Name the selected brief in the handoff; do not load the whole directory.

For public-copy or search work, select or update the matching active brief
under the existing content gate. A completed or reference brief supplies
context, not new task authority. Behavior-only fixes still follow `AGENTS.md`
and the affected source/tests; this directory does not create a new content
gate for them.

| Need | Start here | Role |
| --- | --- | --- |
| Guest journey, header destinations and trip continuation | [Guest decision journey](2026-09-04-guest-decision-journey.md) | Reference; inspect the latest dated decision and current source |
| September homepage trip-state repair | [Trip continuity release](2026-09-functionality-trip-continuity.md) | Completed source change; retain its regression proof |
| Vacation-cost guide planning frame | [Cost-guide frame](2026-10-02-cost-guide-planning-frame.md) | Completed source change; a future edit needs its own approved scope |

This is a starting map for recurring navigation questions, not a complete
queue or a list of authorized next work.

## Lifecycle

Record `lifecycle` near the top when creating or reopening a brief:

- `draft`: proposed scope, not approved implementation.
- `active`: the named approved scope has work remaining; record that scope.
- `completed`: the scoped source change is finished; cite its merged PR or
  commit. Source completion alone does not prove deployment or business lift.
- `superseded`: another brief replaces the named scope; link the replacement.
- `reference`: retained decisions or constraints consulted by later tasks.

Unlabeled older briefs have unknown lifecycle until checked against their
owning source/PR; do not infer active work from a checklist or age. Update the
brief when completing or replacing its scope, preserving dated evidence and
linking a successor only when one actually replaces it. Older decisions inside
a reference brief remain historical when a later decision explicitly replaces
them. Do not mass-relabel unrelated briefs as part of a bounded task.

## Naming

- `YYYY-MM-<cluster>.md`

## Rules

- one serious cluster per brief
- if the brief covers unrelated page families, split it
- if the brief cannot name the money destination, it is not ready
- if the batch changes routing truth, update the relevant file in `docs/portfolio/`
- competitor pages are demand sensors, not content calendars
- AnswerThePublic or similar question tools are customer-language inputs, not permission to create page volume
- competitor/question research must resolve into one of the repo's active lanes: owner acquisition, comparison guides, or direct-book stay intent
- a cluster is not build-ready until it has Seascape-specific proof, local experience, internal-link direction, schema needs, and a real CTA
- if a brief includes `Figma capture:`, it must also name the exact allowed `Figma frames:`
- if `docs/briefs/figma-mcp-state.json` says that capture still resolves to empty `Page 1` through MCP, the brief is not handoff-valid until it also includes `Figma proof:` with `screenshot:`, `desktop:`, or `mcp:` proof
- expansion waits for GSC/GA4 reread evidence; do not create posts for every subtopic

Start from `_template.md`.
