# Current State

*Updated: 2026-06-14*

## Operating Decision — Stop Polishing The OS (corrected 2026-06-14)

The operating system is now more advanced than the business it serves. Two
back-to-back audits (`docs/research/2026-06-13-ai-seo-stack-audit.md` and the
2026-06-13 skill-layer audit) returned the same verdict: zero skill or tool
swaps clear the bar, and the only sanctioned build is the already-planned
owner-outbound pair. The skill, governance, and toolchain layer is **settled and
frozen** — no further skill, tool, or meta audit without a new, specific trigger
tied to an owner lead or a direct booking. Auditing the toolchain again is now a
procrastination surface, not a growth surface.

Correction: this freezes agent/tool churn and broad page expansion. It does not
freeze bounded rescue work when a tracked winner or money page is sliding. A
confirmed regression uses `docs/process/ranking-regression-rescue.md`: prove
impact later, but make the smallest source-truth, SERP, internal-link, schema,
or page-quality fix now.

The binding constraint is unchanged and still unaddressed: owner acquisition has
produced **zero leads**, and owner impressions are roughly 42/week and falling.
No amount of on-site SEO, skill, or governance polish fixes a channel with
almost no owner demand. Owner acquisition for a property manager is mostly an
off-repo sales and relationship job — referrals from current owners, local agent
relationships, and direct outreach to underperforming Airbnb/VRBO owners — not a
website job. This site's honest role is the Lane A guest-to-owner referral
(shipped, Card 1) and a proof surface, not the primary lead engine.

Next founder hours go to the off-repo owner motion, not this repo:
1. Build the named homeowner prospect list (Demand-OS Card 3 milestone — the gate
   everything else waits on; agent-researchable now).
2. Send a handful of real, personal outbound touches to underperforming local
   owners. A test send is not a lead; a real reply is.
3. Let the shipped Lane A referral run and watch for the first benchmark
   form-submit from guide traffic.

On-repo expansion work resumes only when the `seascape-analytics` receipt says a
cluster cleared a threshold (per `next-batch.md`) or a real owner lead lands.
On-repo rescue work is allowed when `next-batch.md`, rank history, or the rank
tracker names a confirmed winner or money-page regression.

## Source of Truth

- `/Users/sawbeck/Projects/seascape-vacations-site` is the canonical sync-only `main` checkout
- `_site/` is generated output
- `DEPLOY THIS FOLDER TO NETLIFY/` is archival only
- the operating system for SEO work now lives across `docs/status/`, `docs/briefs/`, `docs/style/`, and `docs/portfolio/`

## What Is True Right Now

- the site serves two real audiences: guests and property owners
- owner acquisition remains the business bottleneck
- direct-book conversion on existing search demand remains the second bottleneck
- the comparison-guide cluster is still the strongest nonbrand organic asset, especially `/guides/bradenton-vs-sarasota/` and `/guides/anna-maria-island-vs-siesta-key/`
- the truth-normalization pass is live on `main`; false shared trust claims and stale homepage schema drift were removed before more expansion work
- the winner-guide consolidation pass is live on `main` as merge `edf6e791`; guide-family aliases now have explicit redirect ownership and stronger enforcement coverage
- Phase 2 owner proof pages are live and indexed, but owner CTR is still weaker than rankings suggest
- Phase 3 stay money pages are live and self-canonical, but click yield is still not strong enough to justify fresh stay sprawl
- `docs/status/next-batch.md` is the canonical operator-read status surface; it must carry exactly one reread status and one concrete next move after every reread
- no measured owner, stay, or guide expansion branch has cleared the repo's branch-opening thresholds yet; use `docs/status/next-batch.md` for the latest reread status, evidence, thresholds, and next move
- a confirmed winner or money-page regression is not an expansion branch; handle it through `docs/process/ranking-regression-rescue.md`
- the weekly operator report in `seascape-analytics` is the read that should decide the next batch, not another site-wide audit
- the repo now has a lean SEO OS: five roles only, one brief per serious batch, and dedicated style and portfolio docs instead of stale root markdown acting like live truth
- the deployed owner metrics endpoint can now be turned into a bounded hub receipt with `node scripts/enforcement/emit-hub-verification-receipt.js owner-lead-metrics`; that receipt still proves measurement surface truth, not booked teardowns or validated owner demand by itself
- the 2026-05-11 property source-truth drift has been reconciled: `src/_data/properties-fallback.json` remains the editable authority, `npm run property:truth:regen` derives the per-property templates and `src/llms.txt`, and enforcement now checks exact llms bullets plus VacationRental BR/BA/guest and amenity schema facts against fallback data

## What This Repo Should Optimize For

1. owner lead quality and conversion
2. direct-book conversion on existing search traffic
3. canonical and page-family integrity through enforcement
4. proof and truth consistency across copy, schema, and supporting docs
5. measured batching instead of content sprawl
