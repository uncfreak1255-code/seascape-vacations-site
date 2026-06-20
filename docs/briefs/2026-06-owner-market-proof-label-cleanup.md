# Brief: Owner And Market Proof Label Cleanup

## Content Gate Inputs

- persona: Gulf Coast vacation-rental owner using Seascape's research pages to decide whether the numbers are current enough to trust before asking for a revenue review.
- primary keyword: vacation rental management fees Florida
- secondary keywords: Florida Gulf Coast vacation rental market report, vacation rental owner net, Airbnb host fee drag, direct booking revenue
- audience pattern: proof-sensitive owner comparing fee, channel, market, and revenue claims across Seascape's owner benchmark and market report pages.
- proof source: `docs/status/content-decay-patrol.md` generated 2026-06-20, `src/_data/ownerProofAssets.json`, `docs/briefs/2026-05-owner-fee-revenue-leak-benchmark.md`, `docs/briefs/2026-05-market-report-proof-cleanup.md`, and current source files `src/research/owner-fee-revenue-leak-benchmark-2026.njk` and `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html`.
- required internal links: file-scoped; see Required Internal Link Map below.
- CTA target: keep the owner benchmark routed to `/property-management/?owner_source=owner-fee-revenue-leak-benchmark-2026#owner-cta` and the market report routed to `/property-management/#owner-cta`.
- anti-claims: no new June data claim, no market-wide average claim, no new direct-booking lift claim, no owner-lead demand claim, no rank recovery claim, no guarantee that the benchmark applies to every Gulf Coast home.

## Experiment And Readback Contract

- hypothesis: replacing stale-looking proof labels with the exact supported proof status should reduce owner trust risk and keep content-decay patrol focused on truly stale data instead of historical source-window wording.
- primary event: owner CTA clicks from `/research/owner-fee-revenue-leak-benchmark-2026/` and `/guides/florida-gulf-coast-vacation-rental-market-report-2026/`.
- guardrail event: content lint, internal links, JSON-LD, visual baseline for the owner benchmark if text movement changes the screenshot, and content-decay patrol.
- entry criteria: the 2026-06-20 content-decay patrol flags both routes as high priority because dated proof labels read stale, while source truth supports May-reviewed benchmark inputs and a historical Q1 2026 market-report source window.
- readback window: next complete 7-day analytics window after deploy, plus the next generated content-decay patrol.
- decision rule: keep if the pages stay proof-clean and no owner CTA or engagement regression appears; if the patrol still flags either page, decide whether the source data needs a real analytics refresh rather than another wording cleanup.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | `vacation rental management fees Florida`, owner net/revenue benchmark queries, and Florida Gulf Coast vacation rental market report queries. |
| Searcher intent | Owner-management research and market-context validation before a revenue-review request. |
| Current Seascape URL | `/research/owner-fee-revenue-leak-benchmark-2026/` and `/guides/florida-gulf-coast-vacation-rental-market-report-2026/`. |
| SERP observed date | 2026-06-20 |
| SERP stale after | 2026-06-27 |
| Current proof | `docs/status/content-decay-patrol.md` generated 2026-06-20 flags both routes as high-priority dated-proof-label findings. `src/_data/ownerProofAssets.json` supports `Last refreshed: May 2026`; the market report source note supports a historical Seascape portfolio source window rather than a current market-wide average. |
| Top visible competitors | Not a new external SERP attack lane. Existing briefs already note broad owner-revenue competitors such as AirDNA, Gulf Coast Property Management, and Key Data for owner net/revenue queries; this batch only cleans Seascape proof labels on already-live routes. |
| Competitor angle | Competitors tend to present confident market or owner-revenue numbers early. Seascape should compete by making the proof boundary clearer, not by pretending a small internal benchmark is a live market-wide survey. |
| Seascape gap | The pages were technically useful but let readers and agents see stale-looking date language: `post-October 2025`, generic `current` labels, and a March 2026 source window on a May-updated market report. |
| Search fit | Keep both existing pages. The owner benchmark remains the citation asset for owner economics, and the market report remains the portfolio-evidence support page; neither needs a new URL or broad rewrite. |
| Local/GBP proof | Not applicable because this is owner research proof-label cleanup, not map-pack, GBP, or local-service-page ranking work. |
| AEO/readback note | AI/search impact is unproven. The cleanup makes answer surfaces less likely to quote stale-looking proof labels while waiting for analytics and AI visibility readback. |
| Recommended action | Replace stale-looking freshness phrases with supported labels: May-reviewed owner benchmark inputs and a historical Q1 2026 market-report source window; regenerate content-decay patrol; verify content lint, build, links, JSON-LD, and visual proof if screenshots change. |

## Required Internal Link Map

- src/research/owner-fee-revenue-leak-benchmark-2026.njk: /property-management/, /property-management/maximize-vacation-rental-income-florida/
- src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html: /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/maximize-vacation-rental-income-florida/, /property-management/vacation-rental-management-fees-florida/

## Source And Proof Constraints

- `src/_data/ownerProofAssets.json` may say May-reviewed but must not claim a new June refresh unless the underlying benchmark data is actually regenerated.
- The market report can say the source window ends in Q1 2026, but must not hide that it is a historical Seascape portfolio sample.
- Do not change the metric values in this batch: `$119,923`, `13.4%`, `2.9%`, `74-day average`, `62-day median`, and the market-report channel mix remain unchanged unless analytics refreshes them.

## Release Gate Checklist

- source files likely to change:
  - `src/research/owner-fee-revenue-leak-benchmark-2026.njk`
  - `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html`
  - `src/_data/ownerProofAssets.json`
  - `docs/status/content-decay-patrol.md`
- routes to smoke test:
  - `/research/owner-fee-revenue-leak-benchmark-2026/`
  - `/guides/florida-gulf-coast-vacation-rental-market-report-2026/`
- commands to run:
  - `npm run lint:content`
  - `npm run seo:decay -- --as-of 2026-06-20`
  - `npm run build`
  - `npm run verify:jsonld`
  - `npm run verify:links`
  - `npm run test:visual`
- regression risks to watch: accidental metric drift, owner proof overclaiming, market-report source-window ambiguity, broken owner CTA paths, or screenshot drift on the owner benchmark route.

## Done When

- the high-priority content-decay rows for the owner benchmark and market report are cleared or explicitly replaced by a real analytics-refresh handoff
- the pages keep their existing metrics and conversion paths
- verification passes or a concrete blocker is named
