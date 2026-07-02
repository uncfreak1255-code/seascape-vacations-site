# Brief: AMI vs Siesta Key Regression Verdict — HOLD (no rescue)

Same-day classification of the ranking regression flagged by the 2026-07-01
quarterly audit for `/guides/anna-maria-island-vs-siesta-key/`, per the CEO
cadence in `docs/process/ranking-regression-rescue.md`. Verdict: **the
regression does not reproduce on a live SERP read. No source edit. Hold.**

## What the audit claimed

The 2026-07-01 quarterly full audit (Claude scheduled task
`seo-quarterly-full-audit`, task log 2026-07) reported: "`anna maria island vs
siesta key` (vol 480) slipped from #5 Jun → #11 now — regression." That meets
the rescue trigger "winner loses top-10 visibility for tracked query" on its
face, so this brief runs the required live SERP read before any edit.

## Gate 0 Rescue Block

| Field | Answer |
| --- | --- |
| Target query family | `anna maria island vs siesta key` (+ `which is better`, `reddit` variants per related searches) |
| Searcher intent | Comparison research, upstream of guest booking |
| Current Seascape URL | `/guides/anna-maria-island-vs-siesta-key/` |
| SERP observed date | 2026-07-01 |
| SERP stale after | 2026-07-08 |
| Current proof | DataForSEO live advanced SERP, Florida,US, desktop, depth 20, run 2026-07-01 (id `07020502-1445-0139-0000-92b50331ada0`). GSC 28-day window to 2026-06-27 (Codex weekly audit receipt 2026-06-29): this page is the site's top-clicks URL. |
| Top visible competitors | 1. Reddit r/StPetersburgFL thread, 2. mousinaround.com, 3. Facebook group post (then Tripadvisor forum at 4; Seascape organic #5) |
| Competitor angle | UGC/forum authenticity slots (Reddit, Facebook, Tripadvisor). No property manager, OTA, or inventory competitor ranks above Seascape. |
| Seascape gap | None actionable. The results above us are Google's forum/UGC intent-diversity slots, not content a guide rewrite can displace. |
| Search fit | Page holds organic #5 AND is the primary citation of the AI Overview at the very top of the SERP; it feeds mapped stay money destinations. Rescue should stop. |
| Local/GBP proof | N/A — comparison-guide intent, no local pack on this SERP. |
| AEO/readback note | Strongest possible position: the AI Overview (absolute rank 1) sources its lead recommendation sentence to this page and cites it across five sections; the families variant (`/guides/siesta-key-vs-anna-maria-island-families/`) is also cited. |
| Recommended action | **Hold.** No title/meta, content, schema, or link change. Fix the measurement instead (below). |

## Root cause: measurement artifact, not a ranking slide

The live read shows organic `rank_group` **5** — identical to June — while
`rank_absolute` is 9–11 because this SERP now stacks an AI Overview, People
Also Ask, a video block, a perspectives block, and short videos above the
organic results. An audit that reads `rank_absolute` (or counts SERP items
top-to-bottom) reports #9–11 for a page whose organic position never moved.

Follow-up for the audit layer (not this repo's source): the quarterly and
monthly SERP audits must compare `rank_group` (organic-only position) across
periods, or every feature-heavy SERP will keep generating false regression
alerts. Recorded in the quarterly task's next-run notes via the task-log
trail.

## What would reopen this

- `rank_group` for the target query family dropping below 10 on a live read
- loss of the AI Overview citation on two consecutive weekly reads
- final GSC data showing a 30%+ click decline for the page over a complete
  28-day window vs the prior window

Any of those reopens a Gate 0 pass with a fresh SERP receipt; until then the
winner is healthy and the correct move is no move.
