# Brief: AI Engine Sanity And Bradenton Rescue

## Content Gate Inputs

- persona: Seascape operator checking whether AI-labeled visits and guide handoffs can be read cleanly before the next public content rescue.
- primary keyword: bradenton vs sarasota
- secondary keywords: claude.ai referral, perplexity.ai referral, AI referral measurement, Bradenton vacation rentals near beaches, Sarasota vacation rentals
- audience pattern: internal operator first, then organic comparison visitor once the Bradenton/Sarasota rescue branch opens.
- proof source: `seascape-analytics` PR #99, `docs/status/weekly-ai-visibility-receipt-2026-06-03-to-2026-06-09.md`, `docs/status/next-batch.md`, `docs/process/ranking-regression-rescue.md`, `docs/portfolio/winner-guides.md`, and `src/assets/js/conversion-tracking.js`.
- required internal links: /guides/bradenton-vs-sarasota/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/
- CTA target: keep the measurement test route noindexed, then open a separate Bradenton/Sarasota rescue branch that improves the existing winner page instead of creating a new comparison page.
- anti-claims: no booking, revenue, ranking, Claude, Perplexity, or AI visibility lift claim until GA4/GSC readback proves it; no public guide copy rewrite in this measurement branch; no hidden SEO links on indexable pages.

## Experiment And Readback Contract

- hypothesis: controlled UTM visits can prove that GA4 and the site handoff code classify Claude and Perplexity-labeled arrivals even when those platforms do not pass referrers consistently.
- primary event: GA4 session rows with `utm_source=claude.ai` or `utm_source=perplexity.ai`.
- guardrail event: the noindex test route stays out of sitemap output, booking handoff links keep UTM context, and public guide pages stay unchanged in this branch.
- entry criteria: analytics PR #99 merged, the June 3 to June 9 receipt shows ChatGPT as the only explicit AI source, and the wider May 10 to June 9 read shows only one Perplexity session and zero Claude sessions.
- readback window: first 2 complete GA4 days after controlled clicks are run, then the next full 7-day receipt window.
- decision rule: if controlled Claude and Perplexity UTM visits appear in GA4, treat future zeroes as platform/citation/referrer reality; if they do not appear, debug the site/GA4 attribution path before using engine-specific receipt zeroes.

## Gate 0 Rescue Block

| Field | Required answer |
| --- | --- |
| Target query family | `bradenton vs sarasota` and related Bradenton/Sarasota stay-base comparison searches. |
| Searcher intent | comparison guide/research with a direct-booking handoff. |
| Current Seascape URL | `/guides/bradenton-vs-sarasota/`. |
| Current proof | `docs/status/next-batch.md` says `fresh but below threshold`, but `docs/process/ranking-regression-rescue.md` records a #1 to #5 drop and allows bounded winner rescue. The June 3 to June 9 AI receipt shows `/guides/bradenton-vs-sarasota/` gained demand but still recorded zero guide transfer events. |
| Top visible competitors | To capture in the rescue branch before public copy edits. Starter set from current repo evidence: Zachos Realty, midflorida.com, and any live SERP page currently outranking Seascape for the head query. |
| Competitor angle | To capture in the rescue branch: guide depth, real estate/living advice, local trust, direct booking handoff, and comparison clarity. |
| Seascape gap | The page remains a known winner, but the current evidence says it needs a freshness/content-depth audit plus clearer earlier routing into Bradenton and Sarasota stay destinations. |
| Recommended action | Measurement branch now; separate rescue branch next for source review, live SERP capture, freshness pass, answer block/table improvements, and tracked stay-path routing. |

## In Scope

- noindex route for controlled AI-engine click testing
- operator-facing test links with Claude, Perplexity, and ChatGPT UTM source labels
- Bradenton/Sarasota rescue brief handoff
- build, content lint, link verification, and sitemap noindex check

## Not In Scope

- public Bradenton/Sarasota guide rewrite
- title or meta rewrite
- new comparison page
- broad GEO or SEO expansion
- claiming that Claude or Perplexity visibility improved
- treating a controlled UTM click as platform referral proof

## Release Gate

- `npm run lint:content`
- `npm run build`
- `npm run verify:links`
- confirm `/internal/ai-engine-click-test/` renders `noindex, follow`
- confirm `_site/sitemap.xml` does not include `/internal/ai-engine-click-test/`

## Done When

- the noindex test route exists and builds
- the route carries links for Claude, Perplexity, and ChatGPT-labeled visits
- the route stays out of the sitemap
- the next Bradenton/Sarasota rescue branch has a clean Gate 0 handoff
- closeout says this is measurement-ready, not impact-proven
